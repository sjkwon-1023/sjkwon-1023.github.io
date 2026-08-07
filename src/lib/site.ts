/**
 * 사이트 전역 상수. 절대 URL 이 필요한 곳(metadataBase, sitemap, RSS)은 전부 여기를 참조한다.
 * 이 값이 틀리면 OG 이미지·canonical 이 조용히 localhost 를 가리킨 채 배포된다.
 */
export const site = {
  name: "sjkwon",
  title: "sjkwon — 기술 블로그 & 포트폴리오",
  description: "웹 개발하며 배운 것들을 기록하고, 만든 것들을 정리합니다.",
  url: "https://sjkwon-1023.github.io",
  locale: "ko_KR",
  author: {
    name: "Sejin Kwon",
    email: "sjkwon1023@gmail.com",
    github: "https://github.com/sjkwon-1023",
  },
} as const;

export const nav = [
  { href: "/blog/", label: "Blog" },
  { href: "/projects/", label: "Projects" },
  { href: "/about/", label: "About" },
] as const;

/**
 * 페이지가 alternates 를 선언하면 Next 는 루트의 alternates 를 병합하지 않고 통째로 갈아치운다.
 * 그래서 canonical 만 적으면 RSS 자동탐색 링크가 그 페이지에서 사라진다. 항상 이 헬퍼를 쓴다.
 */
export function alternatesFor(path: string) {
  return {
    canonical: path,
    types: { "application/rss+xml": `${site.url}/rss.xml` },
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
  publishedTime?: string;
  tags?: string[];
}) {
  const { type = "website", ...rest } = options;
  return { type, locale: site.locale, siteName: site.name, ...rest };
}
