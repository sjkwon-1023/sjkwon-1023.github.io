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
  role: string;
  stack: string[];
  repo?: string;
  demo?: string;
  featured: boolean;
  order: number;
};

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

function readMdxFiles(dir: string): { slug: string; raw: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
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

export function getAllProjects(): Project[] {
  // getAllPosts 와 같은 이유로 dev 에서는 캐시하지 않는다.
  if (projectCache && process.env.NODE_ENV !== "development") return projectCache;

  projectCache = readMdxFiles(PROJECTS_DIR)
    .map(({ slug, raw }) => {
      const source = `content/projects/${slug}.mdx`;
      const { data } = matter(raw);
      return {
        slug,
        title: requireString(data.title, "title", source),
        description: requireString(data.description, "description", source),
        period: requireString(data.period, "period", source),
        role: requireString(data.role, "role", source),
        stack: toStringArray(data.stack),
        repo: typeof data.repo === "string" ? data.repo : undefined,
        demo: typeof data.demo === "string" ? data.demo : undefined,
        featured: data.featured === true,
        order: typeof data.order === "number" ? data.order : 999,
      } satisfies Project;
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  return projectCache;
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/** YYYY-MM-DD 를 화면용 한국어 날짜로. Date 를 만들지 않아 타임존 영향이 없다. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
