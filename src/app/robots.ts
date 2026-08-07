import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// sitemap.ts 와 같은 이유로 필수. 없으면 output: "export" 빌드가 깨진다.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
