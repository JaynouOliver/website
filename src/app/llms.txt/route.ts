import { llmsTxt } from "@/lib/agent-md";
import { logAgentRead } from "@/lib/analytics/server";
import { after, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// /llms.txt: the index AI agents look for (llmstxt.org). Built from site data.
export function GET(req: NextRequest) {
  after(() => logAgentRead(req.headers, "/llms.txt"));
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
