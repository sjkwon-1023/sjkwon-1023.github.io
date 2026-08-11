import type { Metadata } from "next";

import { EnPlaceholder } from "@/components/en-placeholder";
import { alternatesFor, site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  alternates: alternatesFor("/en/"),
  // 본문이 없는 상태를 색인시키지 않는다. 영어 콘텐츠를 채우면 이 줄을 지운다.
  robots: { index: false, follow: true },
};

export default function EnHomePage() {
  return (
    <EnPlaceholder
      title={site.title}
      body="The English version of this site is not written yet."
      koHref="/"
    />
  );
}
