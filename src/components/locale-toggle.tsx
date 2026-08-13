"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { hasEnglishVersion } from "@/lib/site";

/**
 * 한국어 ↔ 영어 전환. trailingSlash: true 라 pathname 은 "/projects/" 처럼 슬래시가 붙어
 * 오고 홈만 "/" 다.
 *
 * 영어 → 한국어는 접두사만 떼면 되지만(모든 영어 경로에는 대응하는 한국어 원본이 있다),
 * 반대 방향은 영어판이 있는지 확인해야 한다. 없으면 404 대신 영어 홈으로 보낸다.
 */
export function LocaleToggle() {
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  const href = isEn
    ? pathname.replace(/^\/en/, "") || "/"
    : hasEnglishVersion(pathname)
      ? `/en${pathname}`
      : "/en/";

  return (
    <Link
      href={href}
      hrefLang={isEn ? "ko" : "en"}
      aria-label={isEn ? "Switch to Korean" : "Switch to English"}
      className="grid size-9 place-items-center rounded-md font-mono text-xs text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
    >
      {isEn ? "KO" : "EN"}
    </Link>
  );
}
