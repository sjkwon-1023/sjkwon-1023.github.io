import type { Metadata } from "next";

import { EnPlaceholder } from "@/components/en-placeholder";
import { alternatesFor } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  alternates: alternatesFor("/en/about/"),
  // 본문이 없는 상태를 색인시키지 않는다. 영어 콘텐츠를 채우면 이 줄을 지운다.
  robots: { index: false, follow: true },
};

export default function EnAboutPage() {
  return (
    <EnPlaceholder
      title="About"
      body="The English version of this page is not written yet."
      koHref="/about/"
    />
  );
}
