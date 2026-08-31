import Pic from "@/components/pic";
import { getPost, posts } from "@/data/posts";
import { fmtDate, mdToHtml } from "@/lib/md";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 4);
  return (
    <main className="pf-main pf-main-blog">
      <article>
        <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--muted)", textDecoration: "none", marginBottom: 28 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          All posts
        </Link>
        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(30px,5vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
          {post.title}
        </h1>
        <p style={{ margin: "0 0 30px", color: "var(--faint)", fontSize: 14 }}>{fmtDate(post.date)}</p>
        {post.image ? (
          <Pic src={post.image} width={1200} height={675} priority style={{ width: "100%", height: "auto", borderRadius: 16, marginBottom: 32 }} />
        ) : null}
        <div className="md-body" dangerouslySetInnerHTML={{ __html: mdToHtml(post.body) }} />

        {related.length > 0 && (
          <div style={{ marginTop: "clamp(48px,8vw,72px)", paddingTop: 28, borderTop: "1px solid var(--line)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--muted)" }}>
              Keep reading
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {related.map((re) => (
                <Link key={re.slug} href={"/blog/" + re.slug} className="pf-card">
                  <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>{re.title}</span>
                  <span style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.5 }}>{re.summary}</span>
                  <span style={{ color: "var(--faint)", fontSize: 12.5, marginTop: "auto" }}>{fmtDate(re.date)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
