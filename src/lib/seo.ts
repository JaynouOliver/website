// Search-engine helpers: the site's canonical address and the structured data
// (JSON-LD) that tells Google who this site is about.
//
// The name on my government ID is "Suvrakamal Das"; the domain and nickname
// are spelled "Subhro"/"Subhrokomol". `alternateName` ties them together so a
// search for any of them leads here.

import { DATA } from "@/data/resume";

export const SITE = DATA.url.replace(/\/$/, "");
export const abs = (path: string) => (path.startsWith("http") ? path : SITE + (path.startsWith("/") ? path : "/" + path));

export const ALT_NAMES = ["Suvrakamal", "Subhro", "Subhrokomol", "Subhro Das", "Suvrakamal D"];

export function personJsonLd() {
  const s = DATA.contact.social;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": SITE + "/#person",
    name: DATA.name,
    alternateName: ALT_NAMES,
    givenName: "Suvrakamal",
    familyName: "Das",
    url: SITE,
    image: abs(DATA.heroImage),
    jobTitle: DATA.role,
    worksFor: { "@type": "Organization", name: "Mattoboard", url: "https://mattoboard.com/" },
    homeLocation: { "@type": "Place", name: DATA.location },
    knowsAbout: ["AI agents", "Agent orchestration", "Model Context Protocol", "PyTorch", "vLLM", "Machine learning", "Python"],
    sameAs: [s.GitHub.url, s.LinkedIn.url, s.X.url, s.Youtube?.url].filter((u): u is string => !!u && u.startsWith("http")),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE + "/#website",
    url: SITE,
    name: DATA.name,
    alternateName: "Subhrokomol",
    author: { "@id": SITE + "/#person" },
  };
}

// Render JSON-LD safely (see node_modules/next/dist/docs/01-app/02-guides/json-ld.md).
export const ldJson = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
