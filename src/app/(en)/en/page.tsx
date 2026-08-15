import type { Metadata } from "next";
import Link from "next/link";

import { getAllEnglishProjects } from "@/lib/content";
import { localizedAlternatesFor, openGraphFor, site } from "@/lib/site";

const HEADLINE = "I began my career in architectural design. Now I build AI products.";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: HEADLINE,
  alternates: localizedAlternatesFor("/", "en"),
  openGraph: openGraphFor({
    url: "/en/",
    title: site.title,
    description: HEADLINE,
    locale: "en_US",
  }),
};

export default function EnHomePage() {
  const featured = getAllEnglishProjects().filter((project) => project.featured);

  return (
    <main lang="en" className="mx-auto max-w-(--container-shell) px-6 md:px-8">
      <section className="py-16 md:py-24">
        <p className="font-mono text-sm text-fg-muted">Applied AI · AX Product Engineer</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight">{HEADLINE}</h1>
        <p className="mt-5 max-w-2xl text-fg-muted">
          I identify high-impact problems in recurring real-world work, then translate expert
          review criteria into prompts, business logic, and validation rules. I design not only
          for successful generation, but also for failure handling and human re-review. Today, I
          am the first dedicated digital and AI transformation engineer—and the only in-house developer—at an
          architectural design firm of about 100 people.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/en/about/" className="text-accent hover:underline">
            More about my work →
          </Link>
          <a href={site.author.github} className="text-accent hover:underline">
            GitHub →
          </a>
          <a href={`mailto:${site.author.email}`} className="text-accent hover:underline">
            Email →
          </a>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Selected Projects</h2>
            <Link href="/en/projects/" className="text-sm text-fg-muted hover:text-accent">
              View all
            </Link>
          </div>

          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((project) => (
              <li key={project.slug}>
                <Link
                  href={`/en/projects/${project.slug}/`}
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
    </main>
  );
}
