import Link from "next/link";

import { formatDate, slugifyTag, type Post } from "@/lib/content";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-fg-muted">아직 글이 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {posts.map((post) => (
        <li key={post.slug} className="py-6 first:pt-0">
          <h3 className="text-lg font-semibold">
            <Link href={`/blog/${post.slug}/`} className="transition-colors hover:text-accent">
              {post.title}
            </Link>
            {post.draft && (
              <span className="ml-2 rounded bg-bg-inset px-1.5 py-0.5 align-middle text-xs font-medium text-fg-muted">
                draft
              </span>
            )}
          </h3>

          <p className="mt-1.5 text-fg-muted">{post.description}</p>

          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
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
        </li>
      ))}
    </ul>
  );
}
