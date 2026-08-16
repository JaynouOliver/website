import GitHubPRs from "@/components/github-prs";
import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { fmtDate, mdInline } from "@/lib/md";
import Link from "next/link";

const arrow = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--faint)" }}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

export default function Page() {
  const firstName = DATA.nickname || DATA.name.split(" ")[0].toLowerCase();
  const gh = "https://github.com/" + DATA.githubUsername;
  return (
    <main className="pf-main">
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px 40px" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: "0 0 14px", fontSize: "clamp(38px,6.4vw,56px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            hi, i&apos;m {firstName} <span className="pf-wave">👋</span>
          </h1>
          <p
            style={{ margin: 0, fontSize: 17, color: "var(--muted)", maxWidth: "46ch" }}
            dangerouslySetInnerHTML={{ __html: mdInline(DATA.description) }}
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DATA.avatarUrl}
          alt={DATA.name}
          style={{ width: 132, height: 132, flex: "none", borderRadius: 999, objectFit: "cover", border: "1px solid var(--line)" }}
        />
      </header>

      <section id="experience" className="pf-section">
        <h2 className="pf-h2">Work experience</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {DATA.work.map((job) => (
            <article key={job.company} style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--soft)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flex: "none" }}>
                {job.company.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 12px" }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>
                    {job.href ? <a href={job.href} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>{job.company}</a> : job.company}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>{job.title}</span>
                  <span style={{ marginLeft: "auto", color: "var(--faint)", fontSize: 13.5, whiteSpace: "nowrap" }}>
                    {job.start} – {job.end}
                  </span>
                </div>
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, color: "var(--muted)", fontSize: 15, listStyle: "disc" }}>
                  {job.points.map((pt, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: mdInline(pt) }} />
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {DATA.education.length > 0 && (
        <section id="education" className="pf-section">
          <h2 className="pf-h2">Education</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {DATA.education.map((ed) => (
              <article key={ed.school} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--soft)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flex: "none" }}>
                  {ed.school.slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 12px" }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{ed.school}</span>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>{ed.degree}</span>
                  {(ed.start || ed.end) && (
                    <span style={{ marginLeft: "auto", color: "var(--faint)", fontSize: 13.5, whiteSpace: "nowrap" }}>
                      {[ed.start, ed.end].filter(Boolean).join(" – ")}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section id="projects" className="pf-section">
        <h2 className="pf-h2">Projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
          {DATA.projects.map((pj) => (
            <a key={pj.title} href={pj.href} target="_blank" rel="noopener" className="pf-card">
              <span style={{ fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", gap: 6 }}>
                {pj.title}
                {arrow}
              </span>
              <span
                style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55, flex: 1 }}
                dangerouslySetInnerHTML={{ __html: mdInline(pj.description) }}
              />
              <span style={{ color: "var(--faint)", fontSize: 12.5, letterSpacing: "0.01em" }}>
                {pj.technologies.join(" · ")}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="opensource" className="pf-section">
        <h2 className="pf-h2" style={{ marginBottom: 6 }}>Open source</h2>
        <p style={{ margin: "0 0 18px", color: "var(--muted)", fontSize: 14.5 }}>
          Recent pull requests, pulled live from GitHub for{" "}
          <a href={gh} target="_blank" rel="noopener">@{DATA.githubUsername}</a> — this list grows on its own.
        </p>
        <GitHubPRs user={DATA.githubUsername} count={8} />
      </section>

      {DATA.research.length > 0 && (
        <section id="research" className="pf-section">
          <h2 className="pf-h2">Research</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {DATA.research.map((rp) => (
              <a key={rp.title} href={rp.link || "#"} target="_blank" rel="noopener" className="pf-flatcard">
                <span style={{ fontWeight: 600, fontSize: 15, flex: 1, minWidth: 220 }}>{rp.title}</span>
                <span style={{ color: "var(--faint)", fontSize: 13 }}>{rp.meta}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {DATA.talks.length > 0 && (
        <section id="talks" className="pf-section">
          <h2 className="pf-h2">Talks &amp; conferences</h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {DATA.talks.map((t) =>
              t.link ? (
                <a key={t.title} href={t.link} target="_blank" rel="noopener" className="pf-row">
                  <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15.5, flex: 1, minWidth: 200 }}>{t.title}</span>
                    <span style={{ color: "var(--faint)", fontSize: 13, whiteSpace: "nowrap" }}>{t.meta}</span>
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>{t.description}</span>
                </a>
              ) : (
                <div key={t.title} className="pf-row">
                  <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15.5, flex: 1, minWidth: 200 }}>{t.title}</span>
                    <span style={{ color: "var(--faint)", fontSize: 13, whiteSpace: "nowrap" }}>{t.meta}</span>
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>{t.description}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      <section id="blog" className="pf-section">
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 22 }}>
          <h2 className="pf-h2" style={{ margin: 0 }}>Writing</h2>
          <Link href="/blog" style={{ marginLeft: "auto", fontSize: 14, color: "var(--muted)" }}>
            All posts →
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {posts.slice(0, 4).map((po) => (
            <Link key={po.slug} href={"/blog/" + po.slug} className="pf-row">
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 15.5, flex: 1, minWidth: 200 }}>{po.title}</span>
                <span style={{ color: "var(--faint)", fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(po.date)}</span>
              </span>
              <span style={{ color: "var(--muted)", fontSize: 14 }}>{po.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: "clamp(56px,9vw,90px)", paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 18px" }}>
        <span style={{ color: "var(--faint)", fontSize: 13.5 }}>
          © {new Date().getFullYear()} {DATA.name}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: 16 }}>
          <a href={gh} target="_blank" rel="noopener" style={{ fontSize: 13.5, color: "var(--muted)" }}>GitHub</a>
          <a href={DATA.contact.social.LinkedIn.url} target="_blank" rel="noopener" style={{ fontSize: 13.5, color: "var(--muted)" }}>LinkedIn</a>
          <a href={DATA.contact.social.X.url} target="_blank" rel="noopener" style={{ fontSize: 13.5, color: "var(--muted)" }}>Twitter</a>
          <a href={"mailto:" + DATA.contact.email} style={{ fontSize: 13.5, color: "var(--muted)" }}>Email</a>
        </div>
      </footer>
    </main>
  );
}
