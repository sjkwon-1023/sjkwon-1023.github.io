import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllProjects, getProject } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    alternates: alternatesFor(`/projects/${project.slug}/`),
    openGraph: openGraphFor({
      type: "article",
      url: `/projects/${project.slug}/`,
      title: project.title,
      description: project.description,
    }),
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = getProject(slug);
  if (!project) notFound();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) notFound();

  const { default: Content } = await import(`@content/projects/${slug}.mdx`);

  return (
    <main className="mx-auto max-w-(--container-prose) px-6 py-12 md:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-3 text-fg-muted">{project.description}</p>

        <dl className="mt-6 grid gap-x-6 gap-y-2 border-t border-border pt-6 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-fg-muted">기간</dt>
          <dd className="font-mono">{project.period}</dd>

          <dt className="text-fg-muted">역할</dt>
          <dd>{project.role}</dd>

          {project.stack.length > 0 && (
            <>
              <dt className="text-fg-muted">스택</dt>
              <dd className="font-mono text-xs leading-6">{project.stack.join(" · ")}</dd>
            </>
          )}

          {(project.repo || project.demo) && (
            <>
              <dt className="text-fg-muted">링크</dt>
              <dd className="flex gap-4">
                {project.repo && (
                  <a href={project.repo} className="text-accent hover:underline">
                    소스 코드
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} className="text-accent hover:underline">
                    데모
                  </a>
                )}
              </dd>
            </>
          )}
        </dl>
      </header>

      <article className="prose">
        <Content />
      </article>

      <nav className="mt-16 border-t border-border pt-6 text-sm">
        <Link href="/projects/" className="text-fg-muted transition-colors hover:text-accent">
          ← 목록으로
        </Link>
      </nav>
    </main>
  );
}
