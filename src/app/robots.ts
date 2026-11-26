import { SITE } from "@/lib/seo";
import type { MetadataRoute } from "next";

// /robots.txt — everything public is crawlable, by search engines and AI
// agents alike; the dev-only editor and the private analytics page are not.
// The AI crawlers are named so the welcome is explicit. Agent-readable copies
// of the site: /llms.txt and /llms-full.txt.
const AI_AGENTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "meta-externalagent", "CCBot"];
const PRIVATE = ["/editor", "/analytics", "/api/"];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: SITE + "/sitemap.xml",
    host: SITE,
  };
}
