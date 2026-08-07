import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * MDX 안의 기본 태그를 전역으로 교체한다. @next/mdx 가 이 파일을 자동으로 찾으므로
 * 각 렌더 지점에 components prop 을 넘길 필요가 없다.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children, ...rest }) =>
      href.startsWith("/") || href.startsWith("#") ? (
        <Link href={href} {...rest}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      ),
    // next/image 는 width/height 를 요구하는데 마크다운 이미지 문법에는 그 정보가 없다.
    // 정적 export 라 최적화도 어차피 꺼져 있으므로 순수 <img> 를 쓴다.
    img: ({ src, alt, ...rest }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={typeof src === "string" ? src : undefined}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="rounded-lg border border-border"
        {...rest}
      />
    ),
    ...components,
  };
}
