"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./analytics.css";
import { applyFilters, breakdown, build, clickBreakdown, countryName, DAY, field, flag, fmtDur, series, stats, tabOpen, type Data, type FilterKey, type Filters, type PV, type Visitor } from "./compute";
import { Kpi, Panel, TimeChart, type Tab } from "./panels";
import People from "./people";
import VisitMap from "./visit-map";

// /analytics: private dashboard for the site's own visitor analytics.
// Data comes from /api/analytics/data (login cookie required); everything on
// screen is computed in compute.ts from that one response.

type Range = "24h" | "7d" | "30d" | "90d" | "all";
const RANGE_DAYS: Record<Range, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90, all: 0 };
const RANGE_LABEL: Record<Range, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days", "90d": "90 days", all: "All time" };
const FILTER_LABEL: Record<FilterKey, string> = { page: "Page", source: "Source", country: "Country", city: "City", device: "Device", model: "Model", browser: "Browser", os: "System", network: "Network" };

const api = (path: string, body?: unknown, method?: string) =>
  fetch(path, { method: method || (body ? "POST" : "GET"), headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });

const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k: string) => { try { localStorage.removeItem(k); } catch {} },
};

export default function Dashboard() {
  const [status, setStatus] = useState<"loading" | "login" | "ready" | "unconfigured">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [filters, setFilters] = useState<Filters>({});
  const [showMine, setShowMine] = useState(false);
  const [showBots, setShowBots] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [deviceMine, setDeviceMine] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const lookups = useRef(0);

  const load = useCallback(async (r: Range) => {
    const days = RANGE_DAYS[r] ? Math.max(90, RANGE_DAYS[r] * 2) : 0; // extra history for comparisons and "returning"
    const res = await api("/api/analytics/data?days=" + days + (ls.get("pf-count-net") === "1" ? "&net=0" : "")).catch(() => null);
    if (!res) return;
    if (res.status === 401) return setStatus("login");
    if (res.status === 503) return setStatus("unconfigured");
    if (!res.ok) return;
    setData(await res.json());
    setStatus("ready");
  }, []);

  useEffect(() => {
    load(range);
  }, [load, range]);

  // A browser that can log in here is mine: stop counting it, and hide what it already sent.
  useEffect(() => {
    if (status !== "ready" || !data) return;
    if (ls.get("pf-owner") === "0") return; // I chose to count this device
    ls.set("pf-owner", "1");
    setDeviceMine(true);
    const vid = ls.get("pf-vid");
    if (vid && !data.owners.includes(vid)) {
      api("/api/analytics/settings", { action: "owner", vid, on: true });
      setData({ ...data, owners: [...data.owners, vid] });
    }
  }, [status, data]);

  // Fill in network names for addresses logged before lookups existed (20 per pass).
  useEffect(() => {
    if (status !== "ready" || !data || lookups.current >= 3) return;
    const missing = Array.from(new Set(data.events.filter((e) => e.k === "p" && !e.bot && e.ip && !data.ipinfo[e.ip]).map((e) => e.ip!))).slice(0, 20);
    if (!missing.length) return;
    lookups.current++;
    api("/api/analytics/settings", { action: "lookup", ips: missing }).then(() => load(range));
  }, [status, data, load, range]);

  const model = useMemo(() => (data ? build(data, { showMine, showBots }) : null), [data, showMine, showBots]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    const res = await api("/api/analytics/login", { password: pw }).catch(() => null);
    setBusy(false);
    if (res?.ok) { setPw(""); setErr(""); setStatus("loading"); load(range); }
    else setErr(res?.status === 429 ? "Too many tries. Wait ten minutes." : res?.status === 503 ? "Analytics isn't configured on this deployment." : "Wrong password.");
  }

  if (status === "loading") return <main className="an"><p className="an-empty">Loading…</p></main>;
  if (status === "unconfigured")
    return (
      <main className="an">
        <h1>Visitor analytics</h1>
        <p style={{ color: "var(--muted)", maxWidth: 560 }}>
          Not configured here. In Vercel, attach the Upstash Redis store to the project (Storage) and set <code>DASH_PASSWORD</code> under Settings → Environment Variables, then redeploy.
        </p>
      </main>
    );
  if (status === "login" || !data || !model)
    return (
      <div className="an-login">
        <form onSubmit={login}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Visitor analytics</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Enter the dashboard password.</p>
          </div>
          <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} placeholder="Password" autoFocus autoComplete="current-password" aria-label="Password" />
          {err && <p className="an-err" role="alert">{err}</p>}
          <button type="submit" disabled={busy}>{busy ? "Checking…" : "Unlock"}</button>
          <p style={{ margin: 0, color: "var(--faint)", fontSize: 12.5 }}>You stay signed in on this device for 30 days. Its visits are not counted.</p>
        </form>
      </div>
    );

  const now = data.now;
  const days = RANGE_DAYS[range];
  const from = days ? now - days * DAY : model.pvs[0]?.t ?? now;
  const inRange = model.pvs.filter((p) => p.t >= from);
  const cur = applyFilters(inRange, filters);
  const prev = days ? applyFilters(model.pvs.filter((p) => p.t >= from - days * DAY && p.t < from), filters) : null;
  const hasPrev = !!prev && model.pvs.length > 0 && model.pvs[0].t < from;
  const st = stats(cur, model, from);
  const pst = hasPrev ? stats(prev!, model, from - days * DAY) : null;
  const liveKeys = new Set(model.pvs.filter((p) => p.t > now - 5 * 60 * 1000).map((p) => p.key));
  for (const v of model.visitors.values()) if (tabOpen(v, now)) liveKeys.add(v.key);
  const live = liveKeys.size;
  const buckets = series(cur, days ? from : Math.max(from, now - 400 * DAY), now, range === "24h");

  const seen = new Set(cur.map((p) => p.key));
  const people = Array.from(seen, (k) => model.visitors.get(k)).filter((v): v is Visitor => !!v);

  const firsts = new Set(model.sessions.map((s) => s.pvs[0]));
  const entries = cur.filter((p) => firsts.has(p));
  const pick = (key: FilterKey) => (name: string) => setFilters((f) => ({ ...f, [key]: name }));
  const lim = (id: string) => (expanded[id] ? 50 : 8);
  const tab = (id: string, title: string, get: (p: PV) => string, key?: FilterKey, src: PV[] = cur, render?: Tab["render"]): Tab => ({
    id, title, ...breakdown(src, get, lim(id)), onPick: key ? pick(key) : undefined, render,
  });
  const more = (id: string) => setExpanded((x) => ({ ...x, [id]: true }));
  const clicks = clickBreakdown(cur, lim("clicks"));

  const netMine = data.myips?.[data.myIp] !== undefined;

  const setting = (body: Record<string, unknown>) => api("/api/analytics/settings", body);
  const actions = {
    rename: (key: string, name: string) => {
      setting({ action: "label", key, name });
      const labels = { ...data.labels };
      if (name) labels[key] = name; else delete labels[key];
      setData({ ...data, labels });
    },
    markMine: (v: Visitor, on: boolean) => {
      let owners = data.owners, xips = data.xips;
      if (v.vid) { setting({ action: "owner", vid: v.vid, on }); owners = on ? [...owners, v.vid] : owners.filter((x) => x !== v.vid); }
      else for (const ip of v.ips) { setting({ action: "xip", ip, on }); xips = on ? [...xips, ip] : xips.filter((x) => x !== ip); }
      setData({ ...data, owners, xips });
    },
  };

  return (
    <main className="an">
      <div className="an-head">
        <h1>Visitor analytics</h1>
        <span className={"an-live" + (live ? "" : " is-zero")} title="Viewed a page in the last 5 minutes, or still has a tab open"><i /> {live} online now</span>
        <span className="an-spacer" />
        <div className="an-seg" role="group" aria-label="Time range">
          {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
            <button key={r} className={range === r ? "is-on" : ""} onClick={() => setRange(r)}>{r === "all" ? "All" : r}</button>
          ))}
        </div>
        <button className="an-btn" onClick={() => load(range)}>Refresh</button>
        <button className="an-btn is-quiet" onClick={async () => { await api("/api/analytics/login", undefined, "DELETE"); setStatus("login"); }}>Lock</button>
      </div>

      <div className="an-note">
        {deviceMine ? (
          <span><b>This device is yours</b>, so its visits aren&apos;t counted. Sign in here once on each of your devices.</span>
        ) : (
          <span><b>This device is being counted</b> like any visitor.</span>
        )}
        <button onClick={() => {
          const vid = ls.get("pf-vid");
          if (deviceMine) { ls.set("pf-owner", "0"); if (vid) { setting({ action: "owner", vid, on: false }); setData({ ...data, owners: data.owners.filter((x) => x !== vid) }); } }
          else { ls.del("pf-owner"); ls.set("pf-owner", "1"); if (vid) { setting({ action: "owner", vid, on: true }); setData({ ...data, owners: [...data.owners, vid] }); } }
          setDeviceMine(!deviceMine);
        }}>
          {deviceMine ? "Count this device" : "Don't count this device"}
        </button>
        <span>
          {netMine ? <>Views from your current network ({data.myIp}) are hidden too, including private windows.</> : <>Your current network ({data.myIp}) is being counted.</>}
        </span>
        <button onClick={async () => {
          if (netMine) { ls.set("pf-count-net", "1"); await setting({ action: "mynet", ip: data.myIp }); }
          else ls.del("pf-count-net");
          load(range);
        }}>
          {netMine ? "Count this network" : "Hide this network"}
        </button>
        <span className="an-spacer" />
        {(model.hiddenMine > 0 || showMine) && (
          <label><input type="checkbox" checked={showMine} onChange={(e) => setShowMine(e.target.checked)} /> Show my {showMine ? "" : model.hiddenMine + " "}views</label>
        )}
        {(model.hiddenBots > 0 || showBots) && (
          <label><input type="checkbox" checked={showBots} onChange={(e) => setShowBots(e.target.checked)} /> Show {showBots ? "" : model.hiddenBots + " "}bot views</label>
        )}
      </div>
      {data.truncated && <div className="an-note">Only the most recent part of this range could be loaded. Pick a shorter range for complete numbers.</div>}

      {Object.keys(filters).length > 0 && (
        <div className="an-chips">
          {(Object.keys(filters) as FilterKey[]).map((k) => (
            <button key={k} className="an-chip" onClick={() => setFilters((f) => { const n = { ...f }; delete n[k]; return n; })} title="Remove filter">
              <span>{FILTER_LABEL[k]}</span> {k === "country" ? countryName(filters[k]!) : filters[k]} ✕
            </button>
          ))}
          <button className="an-btn is-small is-quiet" onClick={() => setFilters({})}>Clear all</button>
        </div>
      )}

      <div className="an-card an-kpis">
        <Kpi label="Visitors" value={String(st.visitors)} cur={st.visitors} prev={pst?.visitors} sub={st.visitors ? `${st.newVisitors} new · ${st.returning} returning` : ""} />
        <Kpi label="Page views" value={String(st.pageviews)} cur={st.pageviews} prev={pst?.pageviews} />
        <Kpi label="Visits" value={String(st.sessions)} cur={st.sessions} prev={pst?.sessions} sub={st.visitors ? (st.sessions / st.visitors).toFixed(1) + " per visitor" : ""} />
        <Kpi label="Bounce rate" value={st.sessions ? Math.round(st.bounce * 100) + "%" : "—"} cur={st.bounce} prev={pst?.sessions ? pst.bounce : undefined} lowerIsBetter sub="left after one page" />
        <Kpi label="Avg. visit time" value={fmtDur(st.avgMs)} cur={st.avgMs} prev={pst?.avgMs || undefined} />
      </div>

      <TimeChart buckets={buckets} title={"Last " + RANGE_LABEL[range].toLowerCase().replace("all time", "year")} />

      <People visitors={people} labels={data.labels} now={now} actions={actions} />

      <div className="an-h2">
        <h2>Breakdown</h2>
        <p>Click any row to filter the whole page by it.</p>
      </div>
      <div className="an-grid">
        <Panel onMore={more} tabs={[tab("pages", "Pages", field.page, "page"), tab("entry", "Entry pages", field.page, "page", entries)]} />
        <Panel onMore={more} tabs={[tab("sources", "Sources", field.source, "source"), tab("refs", "Referrers", (p) => (firsts.has(p) ? p.r || "" : "")), tab("camps", "Campaigns", (p) => (firsts.has(p) ? p.uc || "" : ""))]} />
        <Panel onMore={more} tabs={[
          tab("countries", "Countries", field.country, "country", cur, (cc) => <>{flag(cc)} {countryName(cc)}</>),
          tab("cities", "Cities", field.city, "city"),
        ]} />
        <Panel onMore={more} tabs={[tab("devices", "Devices", field.device, "device"), tab("models", "Models", field.model, "model"), tab("browsers", "Browsers", field.browser, "browser"), tab("os", "Systems", field.os, "os")]} />
        <Panel onMore={more} tabs={[tab("networks", "Networks & companies", field.network, "network")]} />
        <Panel onMore={more} tabs={[{ id: "clicks", title: "Links clicked", rows: clicks, total: clicks.length, unit: "People" }]} />
      </div>

      <div className="an-h2">
        <h2>Map</h2>
      </div>
      <VisitMap visits={cur.map((p) => ({ ip: p.key, city: p.ci, country: p.co, path: p.p, lat: p.la, lon: p.lo }))} />
    </main>
  );
}
