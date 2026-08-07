import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-(--container-shell) flex-wrap items-center gap-x-5 gap-y-2 px-6 py-8 text-sm text-fg-muted md:px-8">
        <span>
          © {site.author.name}
        </span>
        <a href={site.author.github} className="transition-colors hover:text-fg">
          GitHub
        </a>
        <a href={`mailto:${site.author.email}`} className="transition-colors hover:text-fg">
          Email
        </a>
        <a href="/rss.xml" className="transition-colors hover:text-fg">
          RSS
        </a>
      </div>
    </footer>
  );
}
