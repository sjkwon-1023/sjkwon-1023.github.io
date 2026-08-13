import type { Metadata } from "next";
import Link from "next/link";

import { getAllEnglishProjects } from "@/lib/content";
import { localizedAlternatesFor, openGraphFor } from "@/lib/site";

const DESCRIPTION = "AI products, production systems, research, and developer tools I have built.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: localizedAlternatesFor("/projects/", "en"),
  openGraph: openGraphFor({
    url: "/en/projects/",
    title: "Projects",
    description: DESCRIPTION,
    locale: "en_US",
  }),
};

export default function EnProjectsPage() {
  const projects = getAllEnglishProjects();

  return (
    <main lang="en" className="mx-auto max-w-(--container-shell) px-6 py-12 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-fg-muted">
          Work, research, competitions, and personal projects, ordered from newest to oldest.
        </p>
      </header>

      <ul className="mt-10 divide-y divide-border">
        {projects.map((project) => (
          <li key={project.slug} className="py-8 first:pt-0">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/en/projects/${project.slug}/`}
                  className="transition-colors hover:text-accent"
                >
                  {project.title}
                </Link>
              </h2>
              <span className="font-mono text-sm text-fg-muted">{project.period}</span>
            </div>

            <p className="mt-2 text-fg-muted">{project.description}</p>

            <p className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-muted"
                >
                  {tag}
                </span>
              ))}
            </p>

            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-fg-muted">Role</dt>
                <dd>{project.role}</dd>
              </div>
              {project.stack.length > 0 && (
                <div className="flex gap-2">
                  <dt className="text-fg-muted">Stack</dt>
                  <dd className="font-mono text-xs leading-6">{project.stack.join(" · ")}</dd>
                </div>
              )}
            </dl>

            {(project.repo || project.demo) && (
              <p className="mt-3 flex gap-4 text-sm">
                {project.repo && (
                  <a href={project.repo} className="text-accent hover:underline">
                    Source code →
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} className="text-accent hover:underline">
                    Live demo →
                  </a>
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
