import GitHubPRs from "@/components/github-prs";
import Pic from "@/components/pic";
import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { fmtDate, mdInline } from "@/lib/md";
import Link from "next/link";

const arrow = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--faint)" }}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

const favicon = (href: string) => {
  try {
    return "https://www.google.com/s2/favicons?domain=" + new URL(href).hostname + "&sz=64";
  } catch {
    return "";
  }
};

// Long roles show this many bullet points, with the rest behind "Show more".
const VISIBLE_POINTS = 3;

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
          <p className="pf-role">
            <span>{DATA.role}</span>
            <span aria-hidden="true">·</span>
            <span>{DATA.location}</span>
          </p>
          <p
            style={{ margin: 0, fontSize: 17, color: "var(--muted)", maxWidth: "50ch" }}
            dangerouslySetInnerHTML={{ __html: mdInline(DATA.description) }}
          />
          <div className="pf-actions">
            <a href={"mailto:" + DATA.contact.email} className="pf-btn pf-btn-primary">Get in touch</a>
            <a href={gh} target="_blank" rel="noopener" className="pf-btn">GitHub</a>
            <a href={DATA.contact.social.LinkedIn.url} target="_blank" rel="noopener" className="pf-btn">LinkedIn</a>
          </div>
        </div>
        <Pic
          src={DATA.avatarUrl}
          alt={DATA.name}
          width={132}
          height={132}
          priority
          style={{ width: 132, height: 132, flex: "none", borderRadius: 999, objectFit: "cover", border: "1px solid var(--line)" }}
        />
      </header>

      <section id="experience" className="pf-section">
        <h2 className="pf-h2">Main Quests</h2>
        <ol className="pf-timeline">
          {DATA.work.map((job) => (
            <li key={job.company} className="pf-quest">
              {job.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={job.logoUrl} alt={job.company} className="pf-logo" />
              ) : (
                <div className="pf-logo pf-logo-fallback">{job.company.slice(0, 1).toUpperCase()}</div>
              )}
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
                {job.location && <div style={{ color: "var(--faint)", fontSize: 13.5 }}>{job.location}</div>}
                <ul className="pf-points">
                  {job.points.slice(0, VISIBLE_POINTS).map((pt, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: mdInline(pt) }} />
                  ))}
                </ul>
                {job.points.length > VISIBLE_POINTS && (
                  <details className="pf-more">
                    <summary>
                      <span className="pf-more-closed">Show {job.points.length - VISIBLE_POINTS} more</span>
                      <span className="pf-more-open">Show less</span>
                    </summary>
                    <ul className="pf-points">
                      {job.points.slice(VISIBLE_POINTS).map((pt, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: mdInline(pt) }} />
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="projects" className="pf-section">
        <h2 className="pf-h2">Projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14 }}>
          {DATA.projects.map((pj) => (
            <a key={pj.title} href={pj.href} target="_blank" rel="noopener" className="pf-card">
              <span style={{ fontWeight: 700, fontSize: 15.5, display: "flex", alignItems: "center", gap: 8 }}>
                {favicon(pj.href) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={favicon(pj.href)} alt="" style={{ width: 18, height: 18, borderRadius: 5, flex: "none" }} />
                )}
                {pj.title}
                {arrow}
              </span>
              <span
                style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55, flex: 1 }}
                dangerouslySetInnerHTML={{ __html: mdInline(pj.description) }}
              />
              {pj.technologies.length > 0 && (
                <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                  {pj.technologies.map((t) => (
                    <span key={t} className="pf-chip">{t}</span>
                  ))}
                </span>
              )}
            </a>
          ))}
        </div>
      </section>

      <section id="awards" className="pf-section">
        <h2 className="pf-h2">Talks &amp; awards</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {DATA.awards.map((aw) => (
            <div key={aw.title} className="pf-award">
              <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 200 }}>
                <span style={{ fontWeight: 600, fontSize: 15.5 }} dangerouslySetInnerHTML={{ __html: mdInline(aw.title) }} />
                <span style={{ color: "var(--muted)", fontSize: 14 }}>{aw.note}</span>
              </span>
              {(aw.date || aw.place) && (
                <span className="pf-award-meta">
                  {aw.date && <span>{aw.date}</span>}
                  {aw.place && <span>{aw.place}</span>}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="opensource" className="pf-section">
        <h2 className="pf-h2" style={{ marginBottom: 6 }}>Open source</h2>
        <p style={{ margin: "0 0 18px", color: "var(--muted)", fontSize: 14.5 }}>
          Recent merged and open pull requests, pulled live from GitHub for{" "}
          <a href={gh} target="_blank" rel="noopener">@{DATA.githubUsername}</a> — this list grows on its own.
        </p>
        <GitHubPRs user={DATA.githubUsername} count={5} states={["merged", "open"]} showMoreHref="/open-source" />
      </section>

      <section id="blog" className="pf-section">
        <h2 className="pf-h2">Research and International presentations</h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {posts.slice(0, 5).map((po) => (
            <Link key={po.slug} href={"/blog/" + po.slug} className="pf-row" style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              {po.image && (
                <Pic src={po.image} width={84} height={56} className="pf-thumb" style={{ width: 84, height: 56, objectFit: "cover" }} />
              )}
              <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 15.5, flex: 1, minWidth: 160 }}>{po.title}</span>
                  <span style={{ color: "var(--faint)", fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(po.date)}</span>
                </span>
                <span style={{ color: "var(--muted)", fontSize: 14 }}>{po.summary}</span>
              </span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <Link
            href="/blog"
            style={{ display: "inline-block", padding: "8px 16px", fontSize: 13.5, fontWeight: 600, color: "var(--text)", border: "1px solid var(--line)", borderRadius: 999, textDecoration: "none" }}
          >
            Show more →
          </Link>
        </div>
      </section>

      <section id="education" className="pf-section">
        <h2 className="pf-h2">Education</h2>
        {DATA.education.map((ed) => (
          <div key={ed.school} className="pf-flatcard">
            <span style={{ fontWeight: 700, fontSize: 15.5 }}>{ed.school}</span>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>{ed.degree}</span>
            <span style={{ marginLeft: "auto", color: "var(--faint)", fontSize: 13.5 }}>{ed.place}</span>
          </div>
        ))}
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
