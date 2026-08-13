import type { Metadata } from "next";

import About from "@content/en/about.mdx";
import { localizedAlternatesFor, openGraphFor, site } from "@/lib/site";

const DESCRIPTION = `About ${site.author.name}`;

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: localizedAlternatesFor("/about/", "en"),
  openGraph: openGraphFor({
    url: "/en/about/",
    title: "About",
    description: DESCRIPTION,
    locale: "en_US",
  }),
};

export default function EnAboutPage() {
  return (
    <main lang="en" className="mx-auto max-w-(--container-prose) px-6 py-12 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">About</h1>

      <article className="prose mt-8">
        <About />
      </article>

      <p className="mt-12 border-t border-border pt-6 text-sm text-fg-muted">
        Get in touch at{" "}
        <a href={`mailto:${site.author.email}`} className="text-accent hover:underline">
          {site.author.email}
        </a>
        .
      </p>
    </main>
  );
}
