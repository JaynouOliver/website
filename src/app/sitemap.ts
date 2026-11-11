import { posts } from "@/data/posts";
import { SITE } from "@/lib/seo";
import type { MetadataRoute } from "next";

// /sitemap.xml — every public page. New blog posts are picked up automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = posts.reduce((d, p) => (p.date > d ? p.date : d), "2026-01-01");
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: SITE + "/blog", lastModified: new Date(latest), changeFrequency: "weekly", priority: 0.8 },
    { url: SITE + "/open-source", lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({
      url: SITE + "/blog/" + p.slug,
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
      ...(p.image ? { images: [p.image.startsWith("http") ? p.image : SITE + p.image] } : {}),
    })),
  ];
}
