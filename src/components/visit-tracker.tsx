"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// First-party visitor analytics. Sends three kinds of event to /api/track:
//   p  a page view (with a random visitor id, session id, referrer, UTM tags)
//   d  how long the page was actually on screen, and how far it was scrolled
//   c  clicks on outgoing links (email, GitHub, LinkedIn, résumé, ...)
//   h  a heartbeat every 5 minutes while the tab stays open, so the dashboard
//      can show who still has the site open and if their network changed
// A browser that has logged in to /analytics is marked as mine (pf-owner) and
// sends nothing. The dashboard is at /analytics.

const SESSION_IDLE = 30 * 60 * 1000;
const rid = () => (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 20) : Math.random().toString(36).slice(2) + Date.now().toString(36));

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([body], { type: "text/plain" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
}

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};

export const isOwnerDevice = () => ls.get("pf-owner") === "1";
export const visitorId = () => ls.get("pf-vid");

let firstLoad = true;

// Device model and OS version, where the browser offers them (Chromium's User-Agent
// Client Hints). Android phones report a model; iPhones and laptops don't.
type Hints = { model?: string; platformVersion?: string };
let hints: Promise<Hints> | null = null;
function deviceHints(): Promise<Hints> {
  const uad = (navigator as Navigator & { userAgentData?: { getHighEntropyValues?: (h: string[]) => Promise<Hints> } }).userAgentData;
  return (hints ??= uad?.getHighEntropyValues
    ? Promise.race([uad.getHighEntropyValues(["model", "platformVersion"]).catch(() => ({})), new Promise<Hints>((r) => setTimeout(() => r({}), 600))])
    : Promise.resolve({}));
}

const HEARTBEAT = 5 * 60 * 1000;

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/analytics") || pathname.startsWith("/editor")) return;
    if (isOwnerDevice()) return;

    // Who: a random id kept in this browser. Sessions end after 30 idle minutes.
    let v = ls.get("pf-vid");
    const isNew = !v;
    if (!v) ls.set("pf-vid", (v = rid()));
    const now = Date.now();
    let s = ls.get("pf-sid");
    const newSession = !s || now - Number(ls.get("pf-sid-t") || 0) > SESSION_IDLE;
    if (newSession) ls.set("pf-sid", (s = rid()));
    ls.set("pf-sid-t", String(now));

    const i = rid();
    const q = new URLSearchParams(location.search);
    let r: string | undefined;
    if (firstLoad && document.referrer) { // read before `first` is taken below
      try {
        const u = new URL(document.referrer);
        if (u.host !== location.host) r = u.host + (u.pathname === "/" ? "" : u.pathname);
      } catch {}
    }
    const first = firstLoad;
    firstLoad = false;
    deviceHints().then((hint) => send({
      k: "p", i, v, s, p: pathname, r,
      us: (first && (q.get("utm_source") || q.get("ref"))) || undefined,
      um: (first && q.get("utm_medium")) || undefined,
      uc: (first && q.get("utm_campaign")) || undefined,
      m: hint.model || undefined, ov: hint.platformVersion || undefined,
      sw: screen.width, l: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      n: isNew ? 1 : undefined, ns: newSession ? 1 : undefined,
      wd: navigator.webdriver ? 1 : undefined,
    }));

    // Time on screen (only while the tab is visible) and scroll depth.
    let visibleSince = document.visibilityState === "visible" ? performance.now() : 0;
    let total = 0, maxScroll = 0, sends = 0, lastSent = -1;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight;
      if (h > 0) maxScroll = Math.max(maxScroll, Math.min(100, Math.round(((scrollY + innerHeight) / h) * 100)));
    };
    const flush = () => {
      if (visibleSince) { total += performance.now() - visibleSince; visibleSince = 0; }
      const ms = Math.round(total);
      if (ms < 1000 || ms === lastSent || sends >= 6) return;
      sends++; lastSent = ms;
      ls.set("pf-sid-t", String(Date.now()));
      send({ k: "d", i, ms, sc: maxScroll });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
      else if (!visibleSince) visibleSince = performance.now();
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const out = /^(mailto:|tel:)/i.test(href) || (a.host && a.host !== location.host) || a.hasAttribute("download") || /\.pdf($|\?)/i.test(href);
      if (out) send({ k: "c", i, v, s, p: pathname, h: a.href, x: (a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 60) });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    addEventListener("pagehide", flush);
    document.addEventListener("click", onClick, true);
    return () => {
      flush(); // route change
      removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("pagehide", flush);
      document.removeEventListener("click", onClick, true);
    };
  }, [pathname]);

  // Heartbeat: one timer for the whole visit, and a ping when the tab comes back
  // into view. Browsers pause timers in sleeping or discarded tabs, so a gap
  // means "not running", not "left".
  const tracked = !pathname.startsWith("/analytics") && !pathname.startsWith("/editor");
  useEffect(() => {
    if (!tracked || isOwnerDevice()) return;
    let last = Date.now();
    const beat = () => {
      const v = ls.get("pf-vid");
      if (!v || isOwnerDevice()) return;
      last = Date.now();
      send({ k: "h", v, s: ls.get("pf-sid") });
    };
    const timer = setInterval(beat, HEARTBEAT);
    const onVis = () => { if (document.visibilityState === "visible" && Date.now() - last > 60000) beat(); };
    const onOnline = () => { if (Date.now() - last > 60000) beat(); };
    document.addEventListener("visibilitychange", onVis);
    addEventListener("online", onOnline);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      removeEventListener("online", onOnline);
    };
  }, [tracked]);

  return null;
}
