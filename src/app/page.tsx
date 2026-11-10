import GitHubPRs from "@/components/github-prs";
import TalksJourney from "@/components/talks-journey";
import { alsoNote, home, talks } from "@/data/talks";
import Hero from "@/components/hero";
import Pic from "@/components/pic";
import PostCard from "@/components/post-card";
import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import { mdInline } from "@/lib/md";
import Link from "next/link";

// Long roles show this many bullet points, with the rest behind "Show more".
const VISIBLE_POINTS = 3;

export default function Page() {
  const firstName = DATA.nickname || DATA.name.split(" ")[0].toLowerCase();
  const gh = "https://github.com/" + DATA.githubUsername;
  const pj = DATA.project;
  const now = DATA.work[0];
  return (
    <main className="pf-main">
      <Hero
        name={firstName}
        company={now.company.replace(/ \(.*\)$/, "")}
        companyHref={now.href}
        email={DATA.contact.email}
        github={gh}
        linkedin={DATA.contact.social.LinkedIn.url}
        x={DATA.contact.social.X.url}
        photo={DATA.heroImage}
        photoAlt={DATA.heroImageAlt}
      />
      <div className="pf-skyline">
        <div className="pf-skyline-art" role="img" aria-label="Ink illustration of the Pudong skyline in Shanghai" />
        <p className="pf-skyline-note">
          <span>Shanghai, where I last spoke.</span> Home, Kolkata, is at the bottom of the page.{" "}
          <span className="pf-skyline-credit">
            From a photo by{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Pudong_Shanghai_November_2017_panorama.jpg" target="_blank" rel="noopener">
              King of Hearts
            </a>
            , CC BY-SA 4.0
          </span>
        </p>
      </div>

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

      <section id="project" className="pf-section">
        <h2 className="pf-h2">Featured project</h2>
        <article className="pf-feature">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pj.logo} alt="" width={36} height={36} style={{ width: 36, height: 36, flex: "none" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
              <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>{pj.name}</span>
              <span style={{ color: "var(--faint)", fontSize: 13 }}>{pj.kicker}</span>
            </div>
          </div>
          <p className="pf-feature-tagline">{pj.tagline}</p>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 15.5, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: mdInline(pj.pitch) }} />
          <div className="pf-actions" style={{ marginTop: 4 }}>
            <a href={pj.demo} target="_blank" rel="noopener" className="pf-btn pf-btn-primary">Try the live demo →</a>
            <a href={pj.source} target="_blank" rel="noopener" className="pf-btn">Source on GitHub</a>
          </div>
          <a href={pj.demo} target="_blank" rel="noopener" className="pf-feature-shot" aria-label={"Open the " + pj.name + " live demo"}>
            <Pic src={pj.image} alt={pj.imageAlt} width={1200} height={1123} style={{ width: "100%", height: "auto", display: "block" }} />
          </a>
          <div className="pf-stats">
            {pj.stats.map((st) => (
              <div key={st.label}>
                <span className="pf-stat-value">{st.value}</span>
                <span className="pf-stat-label">{st.label}</span>
              </div>
            ))}
          </div>
          <div className="pf-highlights">
            {pj.highlights.map((h) => (
              <div key={h.title}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{h.title}</span>
                <span style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: mdInline(h.body) }} />
              </div>
            ))}
          </div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>{pj.note}</p>
          <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {pj.technologies.map((t) => (
              <span key={t} className="pf-chip">{t}</span>
            ))}
          </span>
        </article>
      </section>

      <section id="talks" className="pf-section">
        <h2 className="pf-h2" style={{ marginBottom: 6 }}>Talks &amp; travels</h2>
        <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 14.5 }}>
          Papers, posters and talks that took me from {home.city} around the world. Scroll and the globe follows along.
        </p>
        <TalksJourney talks={talks} home={home} />
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 14 }}>{alsoNote}</p>
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
        <div className="pf-section-head">
          <h2 className="pf-h2" style={{ margin: 0 }}>Writing</h2>
          <Link href="/blog" className="pf-btn">
            All posts →
          </Link>
        </div>
        <p style={{ margin: "6px 0 18px", color: "var(--muted)", fontSize: 14.5 }}>{DATA.blogTagline}</p>
        <div className="pf-postgrid">
          {posts.slice(0, 4).map((po) => (
            <PostCard key={po.slug} post={po} />
          ))}
        </div>
      </section>

    </main>
  );
}
