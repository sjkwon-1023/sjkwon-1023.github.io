import type { Metadata } from "next";

import About from "@content/about.mdx";
import { alternatesFor, openGraphFor, site } from "@/lib/site";

const DESCRIPTION = `${site.author.name} 소개`;

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: alternatesFor("/about/"),
  openGraph: openGraphFor({ url: "/about/", title: "About", description: DESCRIPTION }),
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-(--container-prose) px-6 py-12 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">About</h1>

      <article className="prose mt-8">
        <About />
      </article>

      <p className="mt-12 border-t border-border pt-6 text-sm text-fg-muted">
        연락은{" "}
        <a href={`mailto:${site.author.email}`} className="text-accent hover:underline">
          {site.author.email}
        </a>{" "}
        로 주세요.
      </p>
    </main>
  );
}
