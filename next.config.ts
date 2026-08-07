import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 정적 파일만 서빙하는 GitHub Pages 배포용. `next build` 가 ./out 을 생성한다.
  output: "export",

  // GitHub Pages 는 `/blog/post` 요청을 `/blog/post/` 로 301 시키므로, 디렉터리 형태로
  // 내보내지 않으면 슬래시가 붙은 URL 이 그대로 404 가 된다.
  trailingSlash: true,

  // 정적 호스트에는 next/image 최적화 서버가 없다. 끄지 않으면 export 단계에서 실패한다.
  images: { unoptimized: true },

  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

  // user site(sjkwon-1023.github.io)는 루트에서 서빙되므로 basePath/assetPrefix 는 두지 않는다.
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Turbopack 은 로더 옵션을 직렬화하므로 플러그인을 import 한 함수로 넘기면 빌드가 깨진다.
    // 반드시 문자열(또는 [이름, 옵션]) 형태여야 한다.
    remarkPlugins: ["remark-gfm", "remark-frontmatter"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
      [
        "rehype-pretty-code",
        {
          theme: { light: "github-light", dark: "github-dark" },
          // 코드블록 배경은 사이트 토큰(--bg-inset)이 담당한다.
          keepBackground: false,
          defaultLang: "plaintext",
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
