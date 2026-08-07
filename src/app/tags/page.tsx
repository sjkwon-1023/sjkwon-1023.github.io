import type { Metadata } from "next";
import Link from "next/link";

import { getAllTags } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

const DESCRIPTION = "주제별로 모아 본 글 목록.";

export const metadata: Metadata = {
  title: "Tags",
  description: DESCRIPTION,
  alternates: alternatesFor("/tags/"),
  openGraph: openGraphFor({ url: "/tags/", title: "Tags", description: DESCRIPTION }),
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 py-12 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>

      {tags.length === 0 ? (
        <p className="mt-6 text-fg-muted">아직 태그가 없습니다.</p>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-2">
          {tags.map(({ tag, slug, count }) => (
            <li key={slug}>
              <Link
                href={`/tags/${slug}/`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-bg-subtle hover:text-accent"
              >
                #{tag}
                <span className="text-xs text-fg-muted">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
