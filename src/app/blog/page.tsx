import PostCard from "@/components/post-card";
import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Writing",
  description: DATA.blogTagline,
};

export default function BlogPage() {
  const [first, ...rest] = posts;
  return (
    <main className="pf-main pf-main-blog">
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px,5.5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em" }}>
        Writing
      </h1>
      <p style={{ margin: "0 0 32px", color: "var(--muted)", fontSize: 16 }}>{DATA.blogTagline}</p>
      {first && <PostCard post={first} lead />}
      <div className="pf-postgrid" style={{ marginTop: 14 }}>
        {rest.map((po) => (
          <PostCard key={po.slug} post={po} />
        ))}
      </div>
    </main>
  );
}
