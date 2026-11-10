"use client";

import Pic from "@/components/pic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Homepage hero. The photo is shown as the result of an agent's tool call: a
// scan line, then detection boxes. Key phrases in the headline get the same
// boxes. Hovering "Subhro" lights up the person box in
// the photo and the other way round.
//
// Box coordinates are percentages of the photo (public/me-golden-gate.webp,
// 3:4). The frame keeps that aspect ratio so they line up at any size.

type Det = { id: string; label: string; conf: number; x: number; y: number; w: number; h: number; main?: boolean; right?: boolean };

const DETECTIONS: Det[] = [
  { id: "bridge", label: "golden_gate_bridge", conf: 0.97, x: 29, y: 29.5, w: 7.5, h: 17.5 },
  { id: "water", label: "pacific", conf: 0.9, x: 1, y: 46, w: 25, h: 15 },
  { id: "truck", label: "truck", conf: 0.86, x: 85.5, y: 46.3, w: 13, h: 3.6, right: true },
  { id: "bag", label: "sling_bag", conf: 0.81, x: 39, y: 57, w: 17, h: 16 },
  { id: "me", label: "person: subhro", conf: 0.99, x: 32, y: 42.5, w: 41.5, h: 57, main: true },
];

const SCAN_MS = 1600;

function Tag({ label, conf, hot, onHover }: { label: string; conf?: string; hot?: boolean; onHover?: (on: boolean) => void }) {
  return (
    <span
      className={"hx-tag" + (hot ? " is-hot" : "")}
      onMouseEnter={onHover && (() => onHover(true))}
      onMouseLeave={onHover && (() => onHover(false))}
    >
      <span className="hx-tag-label" aria-hidden="true">
        {label}
        {conf && <i>{conf}</i>}
      </span>
    </span>
  );
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () =>
      setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t ? t + " IST" : "IST"}</span>;
}

export default function Hero({
  name,
  company,
  companyHref,
  email,
  github,
  linkedin,
  x,
  photo,
  photoAlt,
}: {
  name: string;
  company: string;
  companyHref: string;
  email: string;
  github: string;
  linkedin: string;
  x: string;
  photo: string;
  photoAlt: string;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const meHover = (on: boolean) => setHot(on ? "me" : null);

  return (
    <header className="hx">
      <div className="hx-text">
        <p className="hx-status">
          <span className="hx-live" aria-hidden="true" />
          <span>
            AI engineer at{" "}
            <a href={companyHref} target="_blank" rel="noopener">
              {company}
            </a>
          </span>
          <span className="hx-sep" aria-hidden="true">/</span>
          <span>Kolkata</span>
          <span className="hx-sep" aria-hidden="true">/</span>
          <Clock />
        </p>

        <h1 className="hx-title">
          I&apos;m{" "}
          <span className={"hx-box is-main" + (hot === "me" ? " is-hot" : "")} onMouseEnter={() => meHover(true)} onMouseLeave={() => meHover(false)}>
            {name}
            <Tag label="person" conf="0.99" />
          </span>
          , a software engineer building{" "}
          <span className="hx-box">
            AI agents
            <Tag label="agent" />
          </span>
          : the{" "}
          <span className="hx-box">
            skills
            <Tag label="self-evolving" />
          </span>{" "}
          they learn, the{" "}
          <span className="hx-box">
            orchestration
            <Tag label="multi-agent" />
          </span>{" "}
          that runs them, and the{" "}
          <span className="hx-box">
            infra
            <Tag label="gpu" />
          </span>{" "}
          underneath.
        </h1>

        <p className="hx-sub">
          Merged PRs in PyTorch and vLLM, spoke at PyCon and MCP Dev Summit, published at SciPy. <Link href="/blog/life-story">Here&apos;s</Link> my journey in
          a nutshell, or find me on{" "}
          <a href={x} target="_blank" rel="noopener">
            X
          </a>
          .
        </p>

        <div className="pf-actions">
          <a href={"mailto:" + email} className="pf-btn pf-btn-primary">
            Get in touch
          </a>
          <a href={github} target="_blank" rel="noopener" className="pf-btn">
            GitHub
          </a>
          <a href={linkedin} target="_blank" rel="noopener" className="pf-btn">
            LinkedIn
          </a>
        </div>
      </div>

      <figure className="hx-photo" style={{ ["--scan" as string]: SCAN_MS + "ms" }}>
        <div className="hx-frame">
          <Pic
            src={photo}
            alt={photoAlt}
            width={1400}
            height={1866}
            priority
            sizes="(max-width: 600px) 100vw, (max-width: 860px) 560px, 440px"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div className="hx-scan" aria-hidden="true" />
          {DETECTIONS.map((d) => (
            <div
              key={d.id}
              aria-hidden="true"
              className={"hx-det" + (d.main ? " is-main" : "") + (d.right ? " is-right" : "") + (hot === d.id ? " is-hot" : "")}
              style={{
                left: d.x + "%",
                top: d.y + "%",
                width: d.w + "%",
                height: d.h + "%",
                animationDelay: Math.round(((d.y + d.h * 0.3) / 100) * SCAN_MS) + "ms",
              }}
              onMouseEnter={d.main ? () => meHover(true) : undefined}
              onMouseLeave={d.main ? () => meHover(false) : undefined}
            >
              <span className="hx-det-label">
                {d.label} <i>{d.conf.toFixed(2)}</i>
              </span>
            </div>
          ))}
          <div className="hx-hud hx-hud-top" aria-hidden="true">
            <span>agent → tool: detect()</span>
            <span>golden_gate.jpg</span>
          </div>
          <div className="hx-hud hx-hud-bottom" aria-hidden="true">
            <span>{DETECTIONS.length} objects → agent</span>
            <span>conf ≥ 0.80</span>
          </div>
        </div>
        <figcaption className="hx-cap">Golden Gate, San Francisco</figcaption>
      </figure>
    </header>
  );
}
