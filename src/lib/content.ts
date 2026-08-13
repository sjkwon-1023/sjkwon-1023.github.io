import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/**
 * content/ 의 MDX 를 읽어 목록·메타데이터로 바꾸는 빌드 타임 로더.
 * 본문 렌더링은 page.tsx 의 동적 import 가 담당하고, 여기서는 frontmatter 만 다룬다.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");
const EN_PROJECTS_DIR = path.join(CONTENT_DIR, "en", "projects");

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  period: string;
  /** 프로젝트 시작일. 목록의 최신순 정렬에만 사용하고 화면에는 period 를 표시한다. */
  sortDate: string;
  tags: string[];
  role: string;
  stack: string[];
  repo?: string;
  demo?: string;
  featured: boolean;
  order: number;
};

function toProjectSortDate(value: unknown, source: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      `${source}: sortDate 는 "YYYY-MM-DD" 형식이어야 합니다 (받은 값: ${JSON.stringify(value)})`,
    );
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${source}: sortDate 가 달력에 존재하지 않습니다 (받은 값: ${value})`);
  }

  return value;
}

function requireProjectTags(value: unknown, source: string): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((tag) => typeof tag !== "string" || tag.trim() === "")
  ) {
    throw new Error(`${source}: tags 는 비어 있지 않은 문자열 배열이어야 합니다`);
  }

  return value;
}

/**
 * frontmatter 의 date 를 YYYY-MM-DD 문자열로 확정한다.
 *
 * 따옴표 없는 YAML 날짜는 js-yaml 이 Date 객체로 만들면서 **넘침을 조용히 굴린다** —
 * `2026-02-30` 이 3월 2일이 되고 `2026-13-45` 가 2027년 2월 14일이 된다. 그 시점엔 원래
 * 의도한 날짜를 복구할 수 없으므로 추측해 고치지 않고 따옴표를 요구한다.
 *
 * 형식만 보고 통과시키면 `2026-13-45` 같은 값이 그대로 RSS 의 pubDate("Invalid Date")와
 * sitemap 의 lastmod 로 새어 나가고, 사전순 정렬 특성상 목록 맨 위에 영구히 고정된다.
 * 그래서 실재하는 날짜인지까지 확인한다.
 */
function toDateString(value: unknown, source: string): string {
  if (value instanceof Date) {
    throw new Error(
      `${source}: date 는 따옴표로 감싸야 합니다 (date: "2026-08-07"). ` +
        `따옴표가 없으면 YAML 이 날짜로 해석하면서 존재하지 않는 날짜를 조용히 다른 날짜로 바꿉니다.`,
    );
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      `${source}: date 는 "YYYY-MM-DD" 형식이어야 합니다 (받은 값: ${JSON.stringify(value)})`,
    );
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${source}: 달력에 존재하지 않는 날짜입니다 (받은 값: ${value})`);
  }
  return value;
}

/**
 * 태그를 URL 세그먼트로 쓸 수 있는 형태로 바꾼다.
 *
 * 태그를 URL 에 그대로 넣으면 안 된다. Next 는 export 경로를 쓸 때 `/?#` 만 퍼센트 인코딩해
 * 디스크에 `c%23` 같은 이름을 만드는데, 링크 쪽 encodeURIComponent 는 한 번만 인코딩하므로
 * `/tags/c%23/` 을 가리킨다. 서버는 이를 디코딩해 `c#` 디렉터리를 찾다가 404 를 낸다.
 * 즉 `c#`, `ci/cd` 같은 평범한 태그가 빌드는 통과하면서 죽은 링크가 된다.
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function requireString(value: unknown, field: string, source: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${source}: frontmatter 의 ${field} 는 비어 있지 않은 문자열이어야 합니다`);
  }
  return value;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/**
 * 한글은 어절이 아니라 글자 수로 세야 맞는다. reading-time 패키지는 한글 음절 하나를
 * 단어 하나로 세서 실제의 2~3배를 보고하므로 쓰지 않는다.
 * CJK 는 분당 500자, 라틴 문자는 분당 220단어 기준.
 */
function estimateReadingMinutes(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ");

  const cjkChars = (text.match(/[぀-ヿ㐀-䶿一-鿿가-힯]/g) ?? []).length;
  const latinWords = (text.replace(/[぀-ヿ㐀-䶿一-鿿가-힯]/g, " ").match(/\b[\w'-]+\b/g) ?? []).length;

  const minutes = cjkChars / 500 + latinWords / 220;
  return Math.max(1, Math.round(minutes));
}

/**
 * `_` 로 시작하는 파일은 콘텐츠가 아니라 템플릿으로 보고 건너뛴다.
 *
 * 이 규칙이 필요한 이유: 본문은 `import(\`@content/posts/${slug}.mdx\`)` 로 불러오는데,
 * 번들러는 이걸 디렉터리 전체에 대한 컨텍스트 모듈로 만든다. 디렉터리에 .mdx 가 하나도 없으면
 * 그 모듈을 해석하지 못해 `Module not found` 로 빌드가 통째로 깨진다. 글이 0편인 상태는
 * 새 블로그에서 정상이므로, 각 디렉터리에 `_template.mdx` 를 두어 모듈 그래프를 살려 둔다.
 */
function readMdxFiles(dir: string): { slug: string; raw: string }[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir);

  // .md 로 쓰면 로더가 조용히 무시해 "글을 썼는데 안 보인다"가 된다. 크게 실패시킨다.
  const strayMarkdown = entries.find((f) => f.endsWith(".md"));
  if (strayMarkdown) {
    throw new Error(
      `${dir}/${strayMarkdown}: 확장자는 .mdx 여야 합니다. 내용은 그대로 두고 파일명만 .mdx 로 바꾸세요 (일반 마크다운 문법은 MDX 에서 그대로 동작합니다).`,
    );
  }

  return entries
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_") && !f.startsWith("."))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      if (!SLUG_RE.test(slug)) {
        throw new Error(
          `${dir}/${file}: 파일명은 소문자·숫자·하이픈만 쓸 수 있습니다 (URL 로 그대로 나갑니다)`,
        );
      }
      return { slug, raw: fs.readFileSync(path.join(dir, file), "utf-8") };
    });
}

let postCache: Post[] | null = null;

/**
 * draft 는 이 함수 안에서 걸러진다. 목록과 generateStaticParams 가 같은 출처를 쓰게 해서
 * "목록에는 안 보이는데 URL 로는 열리는" 초안 유출을 구조적으로 막는다.
 */
export function getAllPosts(): Post[] {
  const isDev = process.env.NODE_ENV === "development";

  // dev 에서는 캐시하지 않는다. content/*.mdx 는 fs 로 읽어서 모듈 그래프의 의존성이 아니므로,
  // 캐시가 남으면 글을 추가·수정해도 본문만 갱신되고 제목·날짜·태그는 서버를 껐다 켤 때까지
  // 첫 렌더 값에 얼어붙는다.
  if (postCache && !isDev) return postCache;

  const posts = readMdxFiles(POSTS_DIR).map(({ slug, raw }) => {
    const source = `content/posts/${slug}.mdx`;
    const { data, content } = matter(raw);
    return {
      slug,
      title: requireString(data.title, "title", source),
      date: toDateString(data.date, source),
      description: requireString(data.description, "description", source),
      tags: toStringArray(data.tags),
      draft: data.draft === true,
      readingMinutes: estimateReadingMinutes(content),
    } satisfies Post;
  });

  postCache = posts
    .filter((p) => isDev || !p.draft)
    // ISO 문자열은 사전순 정렬이 곧 시간순 정렬이라 Date 객체를 만들 필요가 없다.
    .sort((a, b) => b.date.localeCompare(a.date));

  return postCache;
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export type Tag = {
  /** 화면에 보이는 원래 표기 */
  tag: string;
  /** URL 세그먼트로 쓰는 안전한 형태 */
  slug: string;
  count: number;
};

export function getAllTags(): Tag[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const bySlug = new Map<string, string>();
  const tags = [...counts.entries()].map(([tag, count]) => {
    const slug = slugifyTag(tag);

    if (slug === "") {
      throw new Error(`태그 ${JSON.stringify(tag)} 는 URL 로 만들 수 없습니다 (문자·숫자가 없음)`);
    }
    // 예: "c#" 과 "c" 는 둘 다 "c" 가 된다. 조용히 한쪽을 덮어쓰지 말고 빌드를 세운다.
    const existing = bySlug.get(slug);
    if (existing !== undefined && existing !== tag) {
      throw new Error(
        `태그 ${JSON.stringify(existing)} 와 ${JSON.stringify(tag)} 가 같은 URL(/tags/${slug}/)로 겹칩니다. 한쪽 이름을 바꿔 주세요.`,
      );
    }
    bySlug.set(slug, tag);

    return { tag, slug, count } satisfies Tag;
  });

  return tags.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getTagBySlug(slug: string): Tag | undefined {
  return getAllTags().find((t) => t.slug === slug);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

let projectCache: Project[] | null = null;
let englishProjectCache: Project[] | null = null;

function readProjects(dir: string, sourcePrefix: string): Project[] {
  return readMdxFiles(dir)
    .map(({ slug, raw }) => {
      const source = `${sourcePrefix}/${slug}.mdx`;
      const { data } = matter(raw);
      return {
        slug,
        title: requireString(data.title, "title", source),
        description: requireString(data.description, "description", source),
        period: requireString(data.period, "period", source),
        sortDate: toProjectSortDate(data.sortDate, source),
        tags: requireProjectTags(data.tags, source),
        role: requireString(data.role, "role", source),
        stack: toStringArray(data.stack),
        repo: typeof data.repo === "string" ? data.repo : undefined,
        demo: typeof data.demo === "string" ? data.demo : undefined,
        featured: data.featured === true,
        order: typeof data.order === "number" ? data.order : 999,
      } satisfies Project;
    })
    .sort(
      (a, b) =>
        b.sortDate.localeCompare(a.sortDate) ||
        a.order - b.order ||
        a.title.localeCompare(b.title),
    );
}

export function getAllProjects(): Project[] {
  // getAllPosts 와 같은 이유로 dev 에서는 캐시하지 않는다.
  if (projectCache && process.env.NODE_ENV !== "development") return projectCache;

  projectCache = readProjects(PROJECTS_DIR, "content/projects");

  return projectCache;
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/**
 * 영어 프로젝트는 한국어 원문과 slug 를 1:1 로 맞춘다. 상세 페이지의 언어 토글이 같은 slug 로
 * 이동하므로, 번역 누락이나 원문 없이 생긴 파일을 조용히 배포하면 한쪽 언어에서 404 가 난다.
 */
export function getAllEnglishProjects(): Project[] {
  if (englishProjectCache && process.env.NODE_ENV !== "development") {
    return englishProjectCache;
  }

  const projects = readProjects(EN_PROJECTS_DIR, "content/en/projects");
  const koreanSlugs = new Set(getAllProjects().map((project) => project.slug));
  const englishSlugs = new Set(projects.map((project) => project.slug));
  const missing = [...koreanSlugs].filter((slug) => !englishSlugs.has(slug));
  const orphaned = [...englishSlugs].filter((slug) => !koreanSlugs.has(slug));

  if (missing.length > 0 || orphaned.length > 0) {
    const details = [
      missing.length > 0 ? `번역 누락: ${missing.join(", ")}` : "",
      orphaned.length > 0 ? `한국어 원문 없음: ${orphaned.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(`content/en/projects 의 slug 가 한국어 프로젝트와 일치하지 않습니다 (${details})`);
  }

  englishProjectCache = projects;
  return englishProjectCache;
}

export function getEnglishProject(slug: string): Project | undefined {
  return getAllEnglishProjects().find((project) => project.slug === slug);
}

/** YYYY-MM-DD 를 화면용 한국어 날짜로. Date 를 만들지 않아 타임존 영향이 없다. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
