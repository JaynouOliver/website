"use client";

import Pic from "@/components/pic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Homepage hero: status line, a headline whose key phrases are boxed and
// tagged like a model's output, and the Golden Gate photo.

function Tag({ label, conf }: { label: string; conf?: string }) {
  return (
    <span className="hx-tag">
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
          <span className="hx-box is-main">
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

      <figure className="hx-photo">
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
        </div>
        <figcaption className="hx-cap">Golden Gate, San Francisco</figcaption>
      </figure>
    </header>
  );
}
