import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";

import { THEME_SCRIPT } from "@/lib/theme-script";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans-face",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  robots: { index: false, follow: true },
};

/** 다중 root layout 밖에서 렌더되어 GitHub Pages의 out/404.html로 내보내지는 전역 404. */
export default function GlobalNotFound() {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-(--container-prose) flex-1 flex-col items-start px-6 py-24 md:px-8">
          <p className="font-mono text-sm text-fg-muted">404</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-3 text-fg-muted">Page not found.</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <Link href="/" className="text-accent hover:underline">
              한국어 홈
            </Link>
            <Link href="/en/" hrefLang="en" className="text-accent hover:underline">
              English home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
