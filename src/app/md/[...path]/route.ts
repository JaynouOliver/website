import { pageMd } from "@/lib/agent-md";
import { logAgentRead } from "@/lib/analytics/server";
import { SITE } from "@/lib/seo";
import { after, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Markdown copy of a page. Reached as /index.md, /blog.md, /blog/<slug>.md,
// /open-source.md (rewrites in next.config.mjs) or with "Accept: text/markdown"
// on the normal address (src/proxy.ts).
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  const md = await pageMd(path);
  if (md === null) return new Response("Not found. See " + SITE + "/llms.txt\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const page = path === "index" ? "/" : "/" + path;
  after(() => logAgentRead(req.headers, page + (page === "/" ? "index.md" : ".md")));
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      Link: `<${SITE}${page === "/" ? "" : page}>; rel="canonical"`,
      "X-Robots-Tag": "noindex", // the HTML page is the one to list in search results
      Vary: "Accept",
    },
  });
}
