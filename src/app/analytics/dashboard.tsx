"use client";

import PillSelect from "@/components/ui/pill-select";
import { useEffect, useState } from "react";

type Visit = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  path?: string;
  ua?: string;
  t: number;
};

const H = 36e5;

function demoData(): Visit[] {
  const now = Date.now();
  const mk = (ip: string, city: string, region: string, country: string, path: string, agoH: number): Visit =>
    ({ ip, city, region, country, path, t: now - agoH * H });
  return [
    mk("73.162.14.85", "San Francisco", "CA", "US", "/", 0.4), mk("49.37.115.202", "Kolkata", "WB", "IN", "/", 1.2),
    mk("88.104.22.19", "London", "ENG", "GB", "/blog", 3), mk("73.162.14.85", "San Francisco", "CA", "US", "/blog", 5),
    mk("103.86.99.4", "Bengaluru", "KA", "IN", "/", 9), mk("178.24.55.130", "Berlin", "BE", "DE", "/", 14),
    mk("66.249.66.1", "Mountain View", "CA", "US", "/", 22), mk("49.37.115.202", "Kolkata", "WB", "IN", "/blog", 30),
    mk("201.17.88.61", "São Paulo", "SP", "BR", "/", 50), mk("88.104.22.19", "London", "ENG", "GB", "/", 76),
    mk("14.139.196.12", "Mumbai", "MH", "IN", "/", 120), mk("92.184.100.7", "Paris", "IDF", "FR", "/blog", 200),
    mk("73.162.14.85", "San Francisco", "CA", "US", "/", 320), mk("118.92.11.44", "Auckland", "AUK", "NZ", "/", 400),
  ];
}

function fmtWhen(t: number): string {
  const d = new Date(t);
  const diff = Date.now() - t;
  const ago = diff < H ? Math.max(1, Math.round(diff / 6e4)) + "m ago"
    : diff < 24 * H ? Math.round(diff / H) + "h ago"
    : Math.round(diff / (24 * H)) + "d ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + " · " + ago;
}

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box", font: "inherit", color: "var(--text)",
  background: "var(--soft)", border: "1px solid var(--line)",
};
const pillBtn: React.CSSProperties = {
  font: "inherit", fontSize: 13.5, fontWeight: 600, background: "transparent",
  border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer", padding: "8px 14px",
};

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [demo, setDemo] = useState(false);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState("");
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("all");

  async function tryUnlock(key: string) {
    try {
      const r = await fetch("/api/visits?key=" + encodeURIComponent(key), { cache: "no-store" });
      if (r.status === 401) { setPwError("Wrong password."); return; }
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      sessionStorage.setItem("pf-dash-key", key);
      setAuth(true); setVisits(data.visits || []); setDemo(false); setPwError("");
    } catch {
      // API not configured yet (no DB / no password / local preview) — show the design with demo data
      sessionStorage.setItem("pf-dash-key", key);
      setAuth(true); setVisits(demoData()); setDemo(true); setPwError("");
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("pf-dash-key");
    if (saved) tryUnlock(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
        <form
          onSubmit={(e) => { e.preventDefault(); if (pw) tryUnlock(pw); }}
          style={{ width: 340, display: "flex", flexDirection: "column", gap: 14, padding: 32, border: "1px solid var(--line)", borderRadius: 18 }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--soft)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="3" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Visitor analytics</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Enter the dashboard password.</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setPwError(""); }}
            placeholder="Password"
            autoFocus
            style={{ ...inputStyle, width: "100%", padding: "11px 14px", fontSize: 15, borderRadius: 12 }}
          />
          {pwError && <p style={{ margin: 0, color: "#cf222e", fontSize: 13.5 }}>{pwError}</p>}
          <button type="submit" style={{ padding: "11px 14px", font: "inherit", fontSize: 15, fontWeight: 600, color: "var(--bg)", background: "var(--text)", border: "none", borderRadius: 12, cursor: "pointer" }}>
            Unlock
          </button>
          <p style={{ margin: 0, color: "var(--faint)", fontSize: 12.5 }}>Checked server-side by /api/visits — nothing is stored in this page.</p>
        </form>
      </div>
    );
  }

  const cutoffs: Record<string, number> = { "24h": 24 * H, "7d": 7 * 24 * H, "30d": 30 * 24 * H, all: Infinity };
  const ql = q.toLowerCase();
  const filtered = visits
    .filter((v) => {
      if (Date.now() - v.t > cutoffs[range]) return false;
      if (country && v.country !== country) return false;
      if (page && v.path !== page) return false;
      if (ql && !((v.ip || "") + " " + (v.city || "") + " " + (v.region || "") + " " + (v.country || "")).toLowerCase().includes(ql)) return false;
      return true;
    })
    .sort((a, b) => b.t - a.t);
  const count = (arr: Visit[], k: keyof Visit) => {
    const m: Record<string, number> = {};
    arr.forEach((v) => { const x = v[k]; if (x && x !== "—") m[String(x)] = (m[String(x)] || 0) + 1; });
    return m;
  };
  const topCity = Object.entries(count(filtered, "city")).sort((a, b) => b[1] - a[1])[0];
  const gridCols = "minmax(130px,1.1fr) minmax(150px,1.4fr) minmax(70px,0.6fr) minmax(150px,1fr)";

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(36px,6vw,64px) 24px 120px", position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px 16px", marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(26px,4.5vw,34px)", fontWeight: 700, letterSpacing: "-0.025em" }}>Visitor analytics</h1>
        {demo && (
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--muted)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 10px" }}>
            Demo data
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => tryUnlock(sessionStorage.getItem("pf-dash-key") || "")} style={{ ...pillBtn, color: "var(--text)" }}>Refresh</button>
          <button onClick={() => { sessionStorage.removeItem("pf-dash-key"); setAuth(false); setPw(""); }} style={{ ...pillBtn, color: "var(--muted)" }}>Lock</button>
        </div>
      </div>
      {demo && (
        <p style={{ margin: "0 0 26px", color: "var(--muted)", fontSize: 14 }}>
          Live data appears once the Upstash Redis store is attached in Vercel and DASH_PASSWORD is set.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, margin: "18px 0 26px" }}>
        {[
          ["Visits", String(filtered.length)],
          ["Unique IPs", String(new Set(filtered.map((v) => v.ip)).size)],
          ["Countries", String(Object.keys(count(filtered, "country")).length)],
          ["Top location", topCity ? topCity[0] : "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ padding: "16px 18px", border: "1px solid var(--line)", borderRadius: 14 }}>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search IP, city, country…"
          style={{ ...inputStyle, flex: 1, minWidth: 200, padding: "9px 14px", fontSize: 14, borderRadius: 999 }}
        />
        <div style={{ display: "flex", gap: 4, padding: 3, border: "1px solid var(--line)", borderRadius: 999 }}>
          {(["24h", "7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "6px 13px", font: "inherit", fontSize: 13, fontWeight: 600,
                color: range === r ? "var(--bg)" : "var(--muted)",
                background: range === r ? "var(--text)" : "transparent",
                border: "none", borderRadius: 999, cursor: "pointer",
              }}
            >
              {r === "all" ? "All time" : r}
            </button>
          ))}
        </div>
        <PillSelect
          value={country}
          onValueChange={setCountry}
          allLabel="All countries"
          options={Object.entries(count(visits, "country")).sort((a, b) => b[1] - a[1]).map(([v, n]) => ({ value: v, label: `${v} (${n})` }))}
        />
        <PillSelect
          value={page}
          onValueChange={setPage}
          allLabel="All pages"
          options={Object.entries(count(visits, "path")).sort((a, b) => b[1] - a[1]).map(([v, n]) => ({ value: v, label: `${v} (${n})` }))}
        />
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, padding: "11px 18px", background: "var(--soft)", borderBottom: "1px solid var(--line)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted)" }}>
          <span>IP address</span><span>Location</span><span>Page</span><span style={{ textAlign: "right" }}>Time</span>
        </div>
        {filtered.slice(0, 200).map((v, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--line)", fontSize: 14, alignItems: "baseline" }}>
            <span style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 13 }}>{v.ip}</span>
            <span>{[v.city, v.region, v.country].filter((x) => x && x !== "—").join(", ") || "—"}</span>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>{v.path || "/"}</span>
            <span style={{ textAlign: "right", color: "var(--muted)", fontSize: 13 }}>{fmtWhen(v.t)}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ margin: 0, padding: "28px 18px", color: "var(--faint)", fontSize: 14, textAlign: "center" }}>No visits match these filters.</p>
        )}
      </div>
      <p style={{ margin: "14px 2px 0", color: "var(--faint)", fontSize: 13 }}>
        Showing {Math.min(filtered.length, 200)} of {filtered.length} visits{demo ? " (demo)" : ""}
      </p>
    </main>
  );
}
