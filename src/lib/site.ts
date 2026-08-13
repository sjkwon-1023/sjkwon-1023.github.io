/**
 * 사이트 전역 상수. 절대 URL 이 필요한 곳(metadataBase, sitemap, RSS)은 전부 여기를 참조한다.
 * 이 값이 틀리면 OG 이미지·canonical 이 조용히 localhost 를 가리킨 채 배포된다.
 */
export const site = {
  name: "sjkwon",
  title: "sjkwon",
  // 화면에는 쓰지 않고 meta description 과 RSS 채널 설명으로만 나간다.
  description: "sjkwon 의 기술 블로그와 포트폴리오.",
  descriptionEn: "The technical portfolio of Sejin Kwon.",
  url: "https://sjkwon-1023.github.io",
  locale: "ko_KR",
  author: {
    name: "Sejin Kwon",
    email: "sjkwon1023@gmail.com",
    github: "https://github.com/sjkwon-1023",
  },
} as const;

/**
 * 포트폴리오를 앞세우기 위해 블로그는 당분간 메뉴에서 뺀다. /blog/ 라우트와 content/posts/ 의
 * 글, sitemap 항목은 그대로 두므로 다시 노출할 때는 이 배열에 항목만 되돌리면 된다.
 * 피드는 아래 alternatesFor 주석 참고 — 자동탐색 링크만 따로 빼 뒀다.
 */
export const nav = [
  { href: "/projects/", label: "Projects" },
  { href: "/about/", label: "About" },
] as const;

/** 영어판이 있는 한국어 경로인지 확인한다. 블로그와 태그는 아직 한국어로만 제공한다. */
export function hasEnglishVersion(pathname: string): boolean {
  return pathname === "/" || pathname === "/about/" || pathname.startsWith("/projects/");
}

/**
 * 페이지가 alternates 를 선언하면 Next 는 루트의 alternates 를 병합하지 않고 통째로 갈아치운다.
 * canonical 을 페이지마다 직접 적는 대신 이 헬퍼를 거쳐 형태를 한곳에서 관리한다.
 *
 * 블로그를 감추는 동안 RSS 자동탐색 링크도 뺐다. 이게 있으면 메뉴에서 블로그를 지워도 브라우저와
 * 피드 리더가 <link rel="alternate"> 로 피드를 찾아낸다. /rss.xml 라우트 자체는 살아 있으므로,
 * 블로그를 다시 노출할 때 아래 types 한 줄만 되돌리면 된다.
 *   types: { "application/rss+xml": `${site.url}/rss.xml` },
 */
export function alternatesFor(path: string) {
  return { canonical: path };
}

/** 한국어 원문과 영어 번역이 모두 있는 페이지의 canonical·hreflang 을 함께 만든다. */
export function localizedAlternatesFor(koreanPath: string, locale: "ko" | "en") {
  const englishPath = koreanPath === "/" ? "/en/" : `/en${koreanPath}`;

  return {
    canonical: locale === "ko" ? koreanPath : englishPath,
    languages: {
      ko: koreanPath,
      en: englishPath,
      "x-default": koreanPath,
    },
  };
}

/**
 * alternates 와 마찬가지로 openGraph 도 자식이 선언하면 통째로 교체된다. 매번 locale·siteName 을
 * 다시 적지 않도록 여기서 붙인다.
 */
export function openGraphFor(options: {
  url: string;
  title: string;
  description: string;
  type?: "website" | "article";
  locale?: "ko_KR" | "en_US";
  publishedTime?: string;
  tags?: string[];
}) {
  const { type = "website", locale = site.locale, ...rest } = options;
  return { type, locale, siteName: site.name, ...rest };
}
