import type { Metadata } from "next";
import Link from "next/link";

import { PostList } from "@/components/post-list";
import { getAllPosts, getAllTags } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

const DESCRIPTION = "개발하면서 배운 것과 부딪힌 문제들을 기록합니다.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: alternatesFor("/blog/"),
  openGraph: openGraphFor({ url: "/blog/", title: "Blog", description: DESCRIPTION }),
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  // 연도별로 묶어서 보여준다. 페이지네이션 대신 한 페이지에 전부 두면 Cmd-F 로 찾을 수 있다.
  const byYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 py-12 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 text-fg-muted">
          글 {posts.length}편
          {tags.length > 0 && (
            <>
              {" · "}
              <Link href="/tags/" className="hover:text-accent">
                태그 {tags.length}개
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {[...byYear.entries()].map(([year, yearPosts]) => (
          <section key={year}>
            <h2 className="font-mono text-sm text-fg-muted">{year}</h2>
            <div className="mt-4">
              <PostList posts={yearPosts} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
