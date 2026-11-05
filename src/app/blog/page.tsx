import Pic from "@/components/pic";
import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { fmtDate } from "@/lib/md";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
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
      {first && (
        <Link href={"/blog/" + first.slug} className="pf-postcard pf-postcard-lead">
          <span className="pf-postcard-img">
            {first.image ? (
              <Pic src={first.image} width={1200} height={630} priority style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : null}
          </span>
          <span className="pf-postcard-body">
            <span className="pf-postcard-date">{fmtDate(first.date)}</span>
            <span className="pf-postcard-title">{first.title}</span>
            <span className="pf-postcard-sum">{first.summary}</span>
          </span>
        </Link>
      )}
      <div className="pf-postgrid" style={{ marginTop: 14 }}>
        {rest.map((po) => (
          <Link key={po.slug} href={"/blog/" + po.slug} className="pf-postcard">
            <span className="pf-postcard-img">
              {po.image ? (
                <Pic src={po.image} width={640} height={400} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : null}
            </span>
            <span className="pf-postcard-body">
              <span className="pf-postcard-date">{fmtDate(po.date)}</span>
              <span className="pf-postcard-title">{po.title}</span>
              <span className="pf-postcard-sum">{po.summary}</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
