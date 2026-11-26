import { llmsFull } from "@/lib/agent-md";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agent view",
  description: "The whole site as plain Markdown, for AI agents: profile, work, talks, open source and every blog post.",
  alternates: { canonical: "/agent" },
};

// /agent (also /?agent=1): the site as one Markdown document, shown as text.
// Same content as /llms-full.txt; new posts appear here on their own.
export default async function AgentPage() {
  const md = await llmsFull();
  return (
    <main className="pf-agent">
      <div className="pf-agent-bar">
        <div className="pf-agent-toggle" role="group" aria-label="View">
          <Link href="/">Human</Link>
          <span aria-current="page">Agent</span>
        </div>
        <p>
          This is the site as plain Markdown. Raw files: <a href="/llms.txt">/llms.txt</a> (index), <a href="/llms-full.txt">/llms-full.txt</a> (everything). Any page also has a
          copy at its address plus <code>.md</code>.
        </p>
      </div>
      <pre className="pf-agent-doc">{md}</pre>
    </main>
  );
}
