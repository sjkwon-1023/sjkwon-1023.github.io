import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllEnglishProjects, getEnglishProject } from "@/lib/content";
import { localizedAlternatesFor, openGraphFor } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllEnglishProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getEnglishProject(slug);
  if (!project) return {};

  const koreanPath = `/projects/${project.slug}/`;
  return {
    title: project.title,
    description: project.description,
    alternates: localizedAlternatesFor(koreanPath, "en"),
    openGraph: openGraphFor({
      type: "article",
      url: `/en${koreanPath}`,
      title: project.title,
      description: project.description,
      locale: "en_US",
    }),
  };
}

export default async function EnProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getEnglishProject(slug);
  if (!project || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) notFound();

  const { default: Content } = await import(`@content/en/projects/${slug}.mdx`);

  return (
    <main lang="en" className="mx-auto max-w-(--container-prose) px-6 py-12 md:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-3 text-fg-muted">{project.description}</p>

        <dl className="mt-6 grid gap-x-6 gap-y-2 border-t border-border pt-6 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-fg-muted">Period</dt>
          <dd className="font-mono">{project.period}</dd>

          <dt className="text-fg-muted">Category</dt>
          <dd className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs">
                {tag}
              </span>
            ))}
          </dd>

          <dt className="text-fg-muted">Role</dt>
          <dd>{project.role}</dd>

          {project.stack.length > 0 && (
            <>
              <dt className="text-fg-muted">Stack</dt>
              <dd className="font-mono text-xs leading-6">{project.stack.join(" · ")}</dd>
            </>
          )}

          {(project.repo || project.demo) && (
            <>
              <dt className="text-fg-muted">Links</dt>
              <dd className="flex gap-4">
                {project.repo && (
                  <a href={project.repo} className="text-accent hover:underline">
                    Source code
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} className="text-accent hover:underline">
                    Live demo
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
        <Link
          href="/en/projects/"
          className="text-fg-muted transition-colors hover:text-accent"
        >
          ← Back to projects
        </Link>
      </nav>
    </main>
  );
}
