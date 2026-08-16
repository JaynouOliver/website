"use client";

import { DATA } from "@/data/resume";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function Dock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  const gh = "https://github.com/" + DATA.githubUsername;
  return (
    <nav aria-label="Site" className="pf-dock">
      <Link href="/" aria-label="Home" title="Home" className={"pf-dock-btn" + (pathname === "/" ? " active" : "")}>
        <svg width="19" height="19" viewBox="0 0 24 24" {...icon}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
      </Link>
      <Link href="/blog" aria-label="Blog" title="Blog" className={"pf-dock-btn" + (pathname.startsWith("/blog") ? " active" : "")}>
        <svg width="19" height="19" viewBox="0 0 24 24" {...icon}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h6" /></svg>
      </Link>
      <span className="pf-dock-sep" />
      <a href={gh} target="_blank" rel="noopener" aria-label="GitHub" title="GitHub" className="pf-dock-btn">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55C20.22 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" /></svg>
      </a>
      <a href={DATA.contact.social.LinkedIn.url} target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn" className="pf-dock-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56z" /></svg>
      </a>
      <a href={DATA.contact.social.X.url} target="_blank" rel="noopener" aria-label="X / Twitter" title="X / Twitter" className="pf-dock-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26L22.83 21.75h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.17 2.25h6.83l4.72 6.24zm-1.16 17.52h1.83L7.08 4.13H5.12z" /></svg>
      </a>
      <a href={"mailto:" + DATA.contact.email} aria-label="Email" title="Email" className="pf-dock-btn">
        <svg width="19" height="19" viewBox="0 0 24 24" {...icon}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
      </a>
      <span className="pf-dock-sep" />
      <button
        onClick={() => setTheme(dark ? "light" : "dark")}
        aria-label="Toggle theme"
        title="Toggle theme"
        className="pf-dock-btn"
      >
        {dark ? (
          <svg width="19" height="19" viewBox="0 0 24 24" {...icon}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" {...icon}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        )}
      </button>
    </nav>
  );
}
