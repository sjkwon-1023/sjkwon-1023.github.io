import type { Metadata } from "next";
import Link from "next/link";

import { getAllProjects } from "@/lib/content";
import { alternatesFor, openGraphFor } from "@/lib/site";

const DESCRIPTION = "직접 만들고 운영한 것들.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: alternatesFor("/projects/"),
  openGraph: openGraphFor({ url: "/projects/", title: "Projects", description: DESCRIPTION }),
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 py-12 md:px-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-fg-muted">직접 만들고 운영한 것들입니다.</p>
      </header>

      {projects.length === 0 ? (
        <p className="mt-10 text-fg-muted">아직 등록된 프로젝트가 없습니다.</p>
      ) : (
        <ul className="mt-10 divide-y divide-border">
          {projects.map((project) => (
            <li key={project.slug} className="py-8 first:pt-0">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="text-lg font-semibold">
                  <Link
                    href={`/projects/${project.slug}/`}
                    className="transition-colors hover:text-accent"
                  >
                    {project.title}
                  </Link>
                </h2>
                <span className="font-mono text-sm text-fg-muted">{project.period}</span>
              </div>

              <p className="mt-2 text-fg-muted">{project.description}</p>

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-fg-muted">역할</dt>
                  <dd>{project.role}</dd>
                </div>
                {project.stack.length > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-fg-muted">스택</dt>
                    <dd className="font-mono text-xs leading-6">{project.stack.join(" · ")}</dd>
                  </div>
                )}
              </dl>

              {(project.repo || project.demo) && (
                <p className="mt-3 flex gap-4 text-sm">
                  {project.repo && (
                    <a href={project.repo} className="text-accent hover:underline">
                      소스 코드 →
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} className="text-accent hover:underline">
                      데모 →
                    </a>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
