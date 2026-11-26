import { llmsFull } from "@/lib/agent-md";
import { logAgentRead } from "@/lib/analytics/server";
import { after, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// /llms-full.txt: the whole site as one Markdown file.
export async function GET(req: NextRequest) {
  after(() => logAgentRead(req.headers, "/llms-full.txt"));
  return new Response(await llmsFull(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
