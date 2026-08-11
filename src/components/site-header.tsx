"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();

  // 영어 셸에서는 같은 메뉴를 /en/ 아래로 돌린다. 안 그러면 EN 으로 넘어온 방문자가 메뉴를
  // 누르는 순간 한국어 페이지로 되돌아간다.
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const prefix = isEn ? "/en" : "";

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-(--container-shell) items-center gap-6 px-6 md:px-8">
        <Link href={`${prefix}/`} className="font-mono text-sm font-semibold tracking-tight text-fg">
          {site.name}
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {nav.map((item) => {
            // trailingSlash 설정 때문에 실제 경로는 "/projects/" 형태다. 하위 경로도 활성 처리한다.
            const href = `${prefix}${item.href}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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

        <div className="ml-auto -mr-2 flex items-center">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
