import type { Metadata } from "next";
import Link from "next/link";

import { PostList } from "@/components/post-list";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { openGraphFor, site } from "@/lib/site";

export const metadata: Metadata = {
  openGraph: openGraphFor({
    url: "/",
    title: site.title,
    description: site.description,
  }),
};

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);
  const projects = getAllProjects()
    .filter((p) => p.featured)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 md:px-8">
      <section className="py-16 md:py-24">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight">
          {site.description}
        </h1>
        <p className="mt-4 max-w-2xl text-fg-muted">
          {site.author.name}입니다. 여기에는 개발하면서 부딪힌 문제와 그 해결 과정, 그리고
          직접 만든 것들을 정리해 둡니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/about/" className="text-accent hover:underline">
            더 알아보기 →
          </Link>
          <a href={site.author.github} className="text-accent hover:underline">
            GitHub →
          </a>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">주요 프로젝트</h2>
            <Link href="/projects/" className="text-sm text-fg-muted hover:text-accent">
              전체 보기
            </Link>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li
                key={project.slug}
                className="rounded-lg border border-border p-5 transition-colors hover:bg-bg-subtle"
              >
                <h3 className="font-semibold">
                  <Link href={`/projects/${project.slug}/`} className="hover:text-accent">
                    {project.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-fg-muted">{project.description}</p>
                <p className="mt-3 font-mono text-xs text-fg-muted">
                  {project.stack.slice(0, 4).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-border py-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">최근 글</h2>
          <Link href="/blog/" className="text-sm text-fg-muted hover:text-accent">
            전체 보기
          </Link>
        </div>
        <div className="mt-6">
          <PostList posts={posts} />
        </div>
      </section>
    </main>
  );
}
