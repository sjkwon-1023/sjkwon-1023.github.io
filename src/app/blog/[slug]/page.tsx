import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, getAllPosts, getPost, slugifyTag } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

// 알 수 없는 slug 는 렌더를 시도하지 않고 404 로 보낸다(정적 사이트에는 런타임이 없다).
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const canonical = `/blog/${post.slug}/`;
  return {
    title: post.title,
    description: post.description,
    alternates: alternatesFor(canonical),
    openGraph: openGraphFor({
      type: "article",
      url: canonical,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: [...post.tags],
    }),
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = getPost(slug);
  if (!post) notFound();

  // slug 가 파일 경로로 들어가므로 경로 탈출을 막는다. dynamicParams=false 는 검증의 대체재가 아니다.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) notFound();

  // 템플릿 리터럴 동적 import → 번들러가 content/posts/*.mdx 전체에 대한 컨텍스트 모듈을 만든다.
  const { default: Content } = await import(`@content/posts/${slug}.mdx`);

  return (
    <main className="mx-auto max-w-(--container-prose) px-6 py-12 md:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes}분</span>
          {post.tags.length > 0 && <span aria-hidden>·</span>}
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slugifyTag(tag)}/`}
              className="transition-colors hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </p>
      </header>

      <article className="prose">
        <Content />
      </article>

      <nav className="mt-16 border-t border-border pt-6 text-sm">
        <Link href="/blog/" className="text-fg-muted transition-colors hover:text-accent">
          ← 목록으로
        </Link>
      </nav>
    </main>
  );
}
