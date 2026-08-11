import type { Metadata } from "next";
import Link from "next/link";

import { PostList } from "@/components/post-list";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { metrics } from "@/lib/highlights";
import { openGraphFor, site } from "@/lib/site";

const HEADLINE = "전문가의 암묵지를 실제로 쓰이는 AI 제품으로 옮깁니다";

export const metadata: Metadata = {
  description: HEADLINE,
  openGraph: openGraphFor({
    url: "/",
    title: site.title,
    description: HEADLINE,
  }),
};

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);
  const featured = getAllProjects().filter((p) => p.featured);

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 md:px-8">
      <section className="py-16 md:py-24">
        <p className="font-mono text-sm text-fg-muted">Applied AI · AX Product Engineer</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">{HEADLINE}</h1>
        <p className="mt-5 max-w-2xl text-fg-muted">
          건축설계 실무에서 AI 엔지니어로 전환했습니다. 현업의 모호한 업무를 관찰해 풀 문제를
          정하고, 전문가의 판단 기준을 프롬프트와 비즈니스 로직으로 구조화해 생성부터 검증까지
          이어지는 제품으로 만듭니다. 지금은 약 100명 규모 건축설계 조직의 첫 DX·AX 전담자이자
          사내 유일 개발자로 일합니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/about/" className="text-accent hover:underline">
            경력 자세히 보기 →
          </Link>
          <a href={site.author.github} className="text-accent hover:underline">
            GitHub →
          </a>
          <a href={`mailto:${site.author.email}`} className="text-accent hover:underline">
            이메일 →
          </a>
        </div>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="sr-only">주요 성과</h2>
        <dl className="grid gap-8 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-2xl font-semibold tracking-tight">{m.value}</dt>
              <dd className="mt-2 text-sm text-fg-muted">
                {m.label}
                <span className="mt-0.5 block font-mono text-xs">{m.context}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">선택한 작업</h2>
            <Link href="/projects/" className="text-sm text-fg-muted hover:text-accent">
              전체 보기
            </Link>
          </div>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}/`}
                  className="flex h-full flex-col rounded-lg border border-border p-5 transition-colors hover:bg-bg-subtle"
                >
                  <span className="font-mono text-xs text-fg-muted">{project.period}</span>
                  <span className="mt-2 font-semibold">{project.title}</span>
                  <span className="mt-2 text-sm text-fg-muted">{project.description}</span>
                  <span className="mt-3 text-xs text-fg-muted">{project.tags.join(" · ")}</span>
                  <span className="mt-4 font-mono text-xs text-fg-muted">
                    {project.stack.slice(0, 4).join(" · ")}
                  </span>
                </Link>
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
