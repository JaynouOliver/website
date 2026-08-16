"use client";

import { useEffect } from "react";

// Ambient background: small, widely-spaced dots drifting diagonally. Theme-aware, GPU-cheap.
export default function BgDots() {
  useEffect(() => {
    const c = document.createElement("canvas");
    c.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none";
    document.body.prepend(c);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let dots: { x: number; y: number; r: number; s: number; o: number }[] = [];
    function size() {
      W = c.width = window.innerWidth * dpr;
      H = c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
    }
    function make() {
      const n = Math.round((window.innerWidth * window.innerHeight) / 36000);
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.3 + 0.7) * dpr,
        s: (Math.random() * 0.2 + 0.07) * dpr,
        o: Math.random() * 0.4 + 0.18,
      }));
    }
    const onResize = () => { size(); make(); };
    size(); make();
    window.addEventListener("resize", onResize);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.dataset.theme === "dark";
      const base = dark ? "208,208,218," : "70,70,82,";
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 7);
        ctx.fillStyle = "rgba(" + base + d.o * (dark ? 0.5 : 0.4) + ")";
        ctx.fill();
        if (!still) {
          d.x += d.s;
          d.y -= d.s;
          if (d.x > W + 8) d.x = -8;
          if (d.y < -8) d.y = H + 8;
        }
      }
      raf = requestAnimationFrame(frame);
    })();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      c.remove();
    };
  }, []);
  return null;
}
