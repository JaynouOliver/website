import { llmsFull, pageMd } from "@/lib/agent-md";
import { logAgentRead } from "@/lib/analytics/server";
import { SITE } from "@/lib/seo";
import { after, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Markdown copy of a page. Reached as /index.md, /blog.md, /blog/<slug>.md,
// /open-source.md (rewrites in next.config.mjs), or at the page's normal
// address for AI agents and "Accept: text/markdown" (src/proxy.ts). The Link
// header names the HTML page as the canonical one.
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  // "full" is what the proxy serves when an AI agent opens the homepage: everything.
  const full = path === "full";
  const md = full ? await llmsFull() : await pageMd(path);
  if (md === null) return new Response("Not found. See " + SITE + "/llms.txt\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const page = path === "index" || full ? "/" : "/" + path;
  after(() => logAgentRead(req.headers, full ? "/ (as Markdown)" : page + (page === "/" ? "index.md" : ".md")));
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      Link: `<${SITE}${page === "/" ? "" : page}>; rel="canonical"`,
      Vary: "Accept, User-Agent",
    },
  });
}
