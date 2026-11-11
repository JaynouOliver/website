import { SITE } from "@/lib/seo";
import type { MetadataRoute } from "next";

// /robots.txt — everything public is crawlable; the dev-only editor and the
// private analytics page are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/editor", "/analytics", "/api/"] },
    sitemap: SITE + "/sitemap.xml",
    host: SITE,
  };
}
