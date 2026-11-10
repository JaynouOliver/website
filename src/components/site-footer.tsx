import { posts } from "@/data/posts";
import { DATA } from "@/data/resume";
import Link from "next/link";

// Site-wide footer: text block on top, a full-width ink illustration of
// Kolkata (Vidyasagar Setu) at the bottom. The illustration is a mask
// (public/footer-ink.png, made by scripts/build-footer-art.mjs), painted with
// --ink, so it changes colour with the theme and sits on the page background.

export default function SiteFooter() {
  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: "Site",
      links: [
        { label: "Home", href: "/" },
        { label: "Main quests", href: "/#experience" },
        { label: "Talks & travels", href: "/#talks" },
        { label: "Open source", href: "/open-source" },
      ],
    },
    {
      title: "Writing",
      links: [
        ...posts.slice(0, 3).map((p) => ({ label: p.title, href: "/blog/" + p.slug })),
        { label: "All posts", href: "/blog" },
      ],
    },
  ];

  return (
    <footer className="pf-footer">
      <div className="pf-footer-top">
        <div className="pf-footer-intro">
          <span className="pf-footer-name">{DATA.name}</span>
          <p>
            {DATA.role} in {DATA.location}. I ship AI systems into production and write about the conferences in
            between.
          </p>
          <p className="pf-footer-copy">
            © {new Date().getFullYear()} {DATA.name}. Made in Kolkata.
          </p>
        </div>
        <nav className="pf-footer-cols" aria-label="Footer">
          {columns.map((c) => (
            <div key={c.title}>
              <span className="pf-footer-coltitle">{c.title}</span>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="pf-footer-artwrap">
        <div className="pf-footer-art" role="img" aria-label="Ink illustration of Vidyasagar Setu and the Kolkata skyline" />
        <p className="pf-footer-credit">
          Illustration from a photo by{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Kolkata_Skyline_From_Vidyasagar_Seti_2.jpg" target="_blank" rel="noopener">
            Innocentbunny
          </a>
          , CC BY-SA 3.0
        </p>
      </div>
    </footer>
  );
}
