import type { MetadataRoute } from "next";

import { getAllPosts, getAllProjects, getAllTags } from "@/lib/content";
import { site } from "@/lib/site";

// output: "export" 에서는 이 지시어가 없으면 빌드가 실패한다.
// (메타데이터 파일은 라우트 핸들러로 컴파일되는데, 정적 생성이 켜져 있어야 내보낼 수 있다.)
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  // trailingSlash: true 라 실제 URL 에 슬래시가 붙는다. 여기서도 맞춰야 canonical 이
  // 301 되는 주소를 가리키지 않는다.
  const staticRoutes = ["/", "/blog/", "/projects/", "/tags/", "/about/"].map((route) => ({
    url: `${site.url}${route}`,
    lastModified: posts[0]?.date,
  }));

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}/`,
      lastModified: post.date,
    })),
    ...getAllProjects().map((project) => ({
      url: `${site.url}/projects/${project.slug}/`,
    })),
    ...getAllTags().map(({ slug }) => ({
      url: `${site.url}/tags/${slug}/`,
    })),
  ];
}
