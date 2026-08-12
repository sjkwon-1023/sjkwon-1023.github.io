import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostList } from "@/components/post-list";
import { getAllTags, getPostsByTag, getTagBySlug } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

export const dynamicParams = false;

// URL 세그먼트는 원래 태그가 아니라 slug 다. 태그를 그대로 넣으면 Next 가 디스크에 쓰는
// 이름과 링크의 인코딩이 어긋나 404 가 난다(content.ts 의 slugifyTag 주석 참고).
export function generateStaticParams() {
  return getAllTags().map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const found = getTagBySlug(tag);
  if (!found) return {};

  const description = `${found.tag} 태그가 붙은 글 목록.`;
  return {
    title: `#${found.tag}`,
    description,
    alternates: alternatesFor(`/tags/${found.slug}/`),
    openGraph: openGraphFor({
      url: `/tags/${found.slug}/`,
      title: `#${found.tag}`,
      description,
    }),
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const found = getTagBySlug(tag);
  if (!found) notFound();

  const posts = getPostsByTag(found.tag);

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 py-12 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">#{found.tag}</h1>
        <p className="mt-2 text-fg-muted">
          글 {posts.length}편 ·{" "}
          <Link href="/tags/" className="hover:text-accent">
            모든 태그
          </Link>
        </p>
      </header>

      <div className="mt-10">
        <PostList posts={posts} />
      </div>
    </main>
  );
}
