"use client";

import { useEffect } from "react";

// Ambient background: slowly drifting topographic contour lines, drawn in the
// site's --ink colour so they match the ink illustrations in the header and
// footer. The cursor raises a gentle hill that the lines flow around.
//
// How: a smooth noise field is sampled on a coarse grid, and marching squares
// traces where it crosses a set of levels. ~20 fps, paused when the tab is
// hidden, drawn once and left still for prefers-reduced-motion.

const CELL = 22; // grid spacing in CSS px
const SCALE = 1 / 340; // noise zoom: bigger = busier map
const LEVELS = Array.from({ length: 11 }, (_, i) => -0.75 + i * 0.15);

// 3D value noise (x, y, time) with smoothstep interpolation.
function hash(i: number, j: number, k: number) {
  const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
const fade = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function noise(x: number, y: number, z: number) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
  const u = fade(x - i), v = fade(y - j), w = fade(z - k);
  const a = lerp(lerp(hash(i, j, k), hash(i + 1, j, k), u), lerp(hash(i, j + 1, k), hash(i + 1, j + 1, k), u), v);
  const b = lerp(lerp(hash(i, j, k + 1), hash(i + 1, j, k + 1), u), lerp(hash(i, j + 1, k + 1), hash(i + 1, j + 1, k + 1), u), v);
  return lerp(a, b, w);
}

export default function BgDots() {
  useEffect(() => {
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none";
    document.body.prepend(c);
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, cols = 0, rows = 0;
    let field = new Float32Array(0);
    function size() {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      field = new Float32Array(cols * rows);
    }
    size();

    let ink = "35,64,176";
    let alpha = 0.1;
    function readColour() {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
      const m = v.match(/^#([0-9a-f]{6})$/i);
      if (m) {
        const n = parseInt(m[1], 16);
        ink = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
      }
      alpha = 0.1;
    }
    readColour();
    const themeWatch = new MutationObserver(readColour);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Cursor hill, eased so it glides rather than snaps.
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, k: 0, tk: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.tk = 1;
      if (mouse.x < -999) { mouse.x = e.clientX; mouse.y = e.clientY; }
    };
    const onLeave = () => { mouse.tk = 0; };

    function draw(t: number) {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.k += (mouse.tk - mouse.k) * 0.05;
      const z = t * 0.00004; // drift speed
      const R2 = 2 * 140 * 140;
      for (let r = 0; r < rows; r++) {
        for (let q = 0; q < cols; q++) {
          const x = q * CELL, y = r * CELL;
          let v = noise(x * SCALE, y * SCALE, z) * 0.75 + noise(x * SCALE * 2.3 + 40, y * SCALE * 2.3, z * 1.6) * 0.25;
          if (mouse.k > 0.01) {
            const dx = x - mouse.x, dy = y - mouse.y;
            v += 0.55 * mouse.k * Math.exp(-(dx * dx + dy * dy) / R2);
          }
          field[r * cols + q] = v;
        }
      }

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(" + ink + "," + alpha + ")";
      ctx!.beginPath();
      // Marching squares: for each cell and level, connect the edge crossings.
      for (let r = 0; r < rows - 1; r++) {
        for (let q = 0; q < cols - 1; q++) {
          const a = field[r * cols + q], b = field[r * cols + q + 1];
          const d = field[(r + 1) * cols + q], cc = field[(r + 1) * cols + q + 1];
          const lo = Math.min(a, b, cc, d), hi = Math.max(a, b, cc, d);
          const x0 = q * CELL, y0 = r * CELL;
          for (const L of LEVELS) {
            if (L < lo || L > hi) continue;
            const pts: number[] = [];
            if ((a < L) !== (b < L)) pts.push(x0 + ((L - a) / (b - a)) * CELL, y0);
            if ((b < L) !== (cc < L)) pts.push(x0 + CELL, y0 + ((L - b) / (cc - b)) * CELL);
            if ((d < L) !== (cc < L)) pts.push(x0 + ((L - d) / (cc - d)) * CELL, y0 + CELL);
            if ((a < L) !== (d < L)) pts.push(x0, y0 + ((L - a) / (d - a)) * CELL);
            for (let p = 0; p + 3 < pts.length; p += 4) {
              ctx!.moveTo(pts[p], pts[p + 1]);
              ctx!.lineTo(pts[p + 2], pts[p + 3]);
            }
          }
        }
      }
      ctx!.stroke();
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (document.hidden || t - last < 50) return;
      last = t;
      draw(t);
    }
    const onResize = () => { size(); draw(performance.now()); };
    window.addEventListener("resize", onResize);
    if (still) {
      draw(0);
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      c.remove();
    };
  }, []);
  return null;
}
