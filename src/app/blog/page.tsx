import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { fmtDate } from "@/lib/md";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Research and International presentations",
  description: DATA.blogTagline,
};

export default function BlogPage() {
  return (
    <main className="pf-main pf-main-blog">
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px,5.5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em" }}>
        Research and International presentations
      </h1>
      <p style={{ margin: "0 0 36px", color: "var(--muted)", fontSize: 16 }}>{DATA.blogTagline}</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {posts.map((po) => (
          <Link key={po.slug} href={"/blog/" + po.slug} className="pf-row" style={{ gap: 4, padding: "20px 12px", margin: "0 -12px", borderRadius: 10 }}>
            <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em", flex: 1, minWidth: 200 }}>{po.title}</span>
              <span style={{ color: "var(--faint)", fontSize: 13.5, whiteSpace: "nowrap" }}>{fmtDate(po.date)}</span>
            </span>
            <span style={{ color: "var(--muted)", fontSize: 14.5, maxWidth: "60ch" }}>{po.summary}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
