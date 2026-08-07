import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { alternatesFor, site } from "@/lib/site";
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
  // 이걸 빼면 빌드는 통과하면서 og:image 가 http://localhost:3000 을 가리킨 채 배포된다.
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  alternates: alternatesFor("/"),
  // url·title·description 은 여기 두지 않는다. 자식 페이지가 openGraph 를 선언하지 않으면
  // 루트 값이 그대로 상속돼 /blog/ 를 공유해도 홈 카드가 뜬다. 비워 두면 Next 가 각 페이지의
  // title·description 으로 og:title·og:description 을 채워 준다.
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: 아래 스크립트가 React 소유인 <html> 의 속성을 바꾸기 때문.
    // 한 단계만 억제하므로 앱 내부의 진짜 mismatch 는 가려지지 않는다.
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
