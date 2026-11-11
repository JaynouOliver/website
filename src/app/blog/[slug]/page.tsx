import Pic from "@/components/pic";
import PostCard from "@/components/post-card";
import { getPost, posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { fmtDate, mdToHtml } from "@/lib/md";
import { abs, ldJson, SITE } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = "/blog/" + post.slug;
  const image = post.image || "/og.jpg";
  return {
    title: post.title,
    description: post.summary,
    authors: [{ name: DATA.name, url: DATA.url }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [DATA.name],
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [image] },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 4);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: abs("/blog/" + post.slug),
    mainEntityOfPage: abs("/blog/" + post.slug),
    image: abs(post.image || "/og.jpg"),
    author: { "@type": "Person", "@id": SITE + "/#person", name: DATA.name, url: SITE },
    publisher: { "@type": "Person", "@id": SITE + "/#person", name: DATA.name },
  };
  return (
    <main className="pf-main pf-main-blog">
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(articleLd)} />
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
        <p style={{ margin: "0 0 30px", color: "var(--faint)", fontSize: 14 }}>
          <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }} rel="author">
            {DATA.name}
          </Link>{" "}
          · {fmtDate(post.date)}
        </p>
        {post.image ? (
          <Pic src={post.image} width={1200} height={675} priority style={{ width: "100%", height: "auto", borderRadius: 16, marginBottom: 32 }} />
        ) : null}
        <div className="md-body" dangerouslySetInnerHTML={{ __html: mdToHtml(post.body) }} />

        {related.length > 0 && (
          <div style={{ marginTop: "clamp(48px,8vw,72px)", paddingTop: 28, borderTop: "1px solid var(--line)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--muted)" }}>
              Keep reading
            </h2>
            <div className="pf-postgrid">
              {related.map((re) => (
                <PostCard key={re.slug} post={re} />
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
