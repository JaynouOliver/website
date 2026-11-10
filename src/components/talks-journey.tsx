"use client";

// Scroll-driven "Talks & travels": a sticky globe on the left, one card per stop
// on the right. Whichever card sits in the middle of the viewport is active, and
// the globe flies there.

import Pic from "@/components/pic";
import type { Talk } from "@/data/talks";
import { mdInline } from "@/lib/md";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const TalksGlobe = dynamic(() => import("@/components/talks-globe"), {
  ssr: false,
  loading: () => <div className="pf-globe" aria-hidden="true" />,
});

type LatLon = { lat: number; lon: number };

function km(a: LatLon, b: LatLon) {
  const r = Math.PI / 180;
  const h =
    Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return Math.round((2 * 6371 * Math.asin(Math.sqrt(h))) / 100) * 100;
}

function Flag({ code, label }: { code: string; label: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={"/flags/" + code + ".svg"} alt={label} title={label} className="pf-flag" width={18} height={13} />;
}

export default function TalksJourney({ talks, home }: { talks: Talk[]; home: LatLon & { city: string; flag: string } }) {
  const [active, setActive] = useState(0);
  const cards = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => cards.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  const cur = talks[active];

  return (
    <div className="pf-journey">
      <div className="pf-journey-stage">
        <div className="pf-journey-sticky">
          <TalksGlobe home={home} stops={talks} active={active} />
          <div className="pf-journey-hud" aria-live="polite">
            <span className="pf-journey-route">
              <Flag code={home.flag} label="India" /> {home.city} <span aria-hidden="true">→</span>{" "}
              <Flag code={cur.flag} label={cur.country} /> {cur.city}
            </span>
            <span className="pf-journey-km">{km(home, cur).toLocaleString("en-US")} km</span>
          </div>
          <div className="pf-journey-steps" role="tablist" aria-label="Stops">
            {talks.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={t.event}
                className={"pf-journey-step" + (i === active ? " is-active" : "")}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <ol className="pf-journey-cards">
        {talks.map((t, i) => (
          <li
            key={t.id}
            ref={(el) => {
              cards.current[i] = el;
            }}
            data-index={i}
            className={"pf-stop" + (i === active ? " is-active" : "")}
          >
            <div className="pf-stop-meta">
              <span className="pf-stop-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="pf-stop-place">
                <Flag code={t.flag} label={t.country} />
                {t.city}, {t.country}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t.date}</span>
            </div>
            <h3 className="pf-stop-event">{t.event}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {t.accepted && <span className="pf-chip pf-chip-accepted">Accepted talk · upcoming</span>}
              {t.roles.map((r) => (
                <span key={r} className="pf-chip pf-chip-accent">
                  {r}
                </span>
              ))}
            </div>

            {t.photos.length > 0 && (
              <div className={"pf-stop-photos" + (t.photos.length > 1 ? " is-pair" : "") + (t.tallPhotos ? " is-tall" : "")}>
                {t.photos.map((p) => (
                  <figure key={p.src}>
                    <Pic src={p.src} alt={p.alt} width={1100} height={t.tallPhotos ? 1466 : 825} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {p.credit && (
                      <figcaption>
                        Photo:{" "}
                        {p.creditHref ? (
                          <a href={p.creditHref} target="_blank" rel="noopener">
                            {p.credit}
                          </a>
                        ) : (
                          p.credit
                        )}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {t.title && (
              <p className="pf-stop-title">
                “{t.title}”{t.with && <span className="pf-stop-with">{t.with}</span>}
              </p>
            )}
            <p className="pf-stop-about">{t.about}</p>
            {t.body.map((para, k) => (
              <p key={k} className="pf-stop-body" dangerouslySetInnerHTML={{ __html: mdInline(para) }} />
            ))}
            {t.links.length > 0 && (
              <div className="pf-stop-links">
                {t.links.map((l) =>
                  l.href.startsWith("/") ? (
                    <a key={l.href} href={l.href} className="pf-btn">
                      {l.label}
                    </a>
                  ) : (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener" className="pf-btn">
                      {l.label} ↗
                    </a>
                  ),
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
