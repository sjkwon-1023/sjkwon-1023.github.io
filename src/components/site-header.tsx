"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-(--container-shell) items-center gap-6 px-6 md:px-8">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight text-fg">
          {site.name}
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {nav.map((item) => {
            // trailingSlash 설정 때문에 실제 경로는 "/blog/" 형태다. 하위 경로도 활성 처리한다.
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-accent"
                    : "text-fg-muted transition-colors hover:text-fg"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto -mr-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
