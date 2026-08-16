"use client";

import { useEffect } from "react";

// Ambient background: comet-like streaks with fading tails drifting diagonally
// (up-right). Deep orange in both light and dark themes. GPU-cheap.
export default function BgDots() {
  useEffect(() => {
    const c = document.createElement("canvas");
    c.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none";
    document.body.prepend(c);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const DIAG = 0.7071; // 45° unit vector component
    let W = 0, H = 0;
    let comets: { x: number; y: number; r: number; s: number; o: number; tail: number }[] = [];
    function size() {
      W = c.width = window.innerWidth * dpr;
      H = c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
    }
    function make() {
      const n = Math.max(6, Math.round((window.innerWidth * window.innerHeight) / 90000));
      comets = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.4 + 0.9) * dpr,
        s: (Math.random() * 0.5 + 0.25) * dpr,
        o: Math.random() * 0.35 + 0.25,
        tail: (Math.random() * 70 + 50) * dpr,
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
      // deep orange — slightly brighter in dark mode, slightly deeper in light mode
      const rgb = dark ? "255,120,40" : "210,80,10";
      const boost = dark ? 1.0 : 0.85;
      for (const d of comets) {
        const tx = d.x - d.tail * DIAG; // tail trails opposite to motion (down-left)
        const ty = d.y + d.tail * DIAG;
        const grad = ctx.createLinearGradient(d.x, d.y, tx, ty);
        grad.addColorStop(0, "rgba(" + rgb + "," + d.o * boost + ")");
        grad.addColorStop(1, "rgba(" + rgb + ",0)");
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.r * 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
        // head — a touch brighter than the tail
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 7);
        ctx.fillStyle = "rgba(" + rgb + "," + Math.min(1, d.o * boost + 0.25) + ")";
        ctx.fill();
        if (!still) {
          d.x += d.s;
          d.y -= d.s;
          const pad = d.tail + 8 * dpr;
          if (d.x - pad > W) d.x = -pad;
          if (d.y + pad < 0) d.y = H + pad;
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
