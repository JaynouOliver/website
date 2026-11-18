"use client";

import { useMemo, useState } from "react";
import { ago, flag, fmtDur, lastSeen, place, tabOpen, when, type Visitor } from "./compute";

// "People": one row per visitor (a browser, recognised by its visitor id), with
// their visits underneath. This is the "who keeps coming back" view.

export type PeopleActions = {
  rename: (key: string, name: string) => void;
  markMine: (v: Visitor, on: boolean) => void;
};

// The network name (ISP or company) goes in the subtitle; it is not a reliable employer.
const displayName = (v: Visitor, label?: string) => label || "Visitor from " + (v.ci || v.co || "somewhere");

function Person({ v, label, now, open, onToggle, actions }: { v: Visitor; label?: string; now: number; open: boolean; onToggle: () => void; actions: PeopleActions }) {
  const visits = v.sessions.length;
  const sessions = useMemo(() => [...v.sessions].sort((a, b) => b.start - a.start), [v.sessions]);
  return (
    <div className="an-person">
      <button className="an-person-row" onClick={onToggle} aria-expanded={open}>
        <span className="an-avatar" aria-hidden="true">{flag(v.co) || "·"}</span>
        <span style={{ minWidth: 0 }}>
          <span className="an-person-name">
            {displayName(v, label)}
            {visits > 1 ? <span className="an-tag is-ret">Returning · {visits} visits</span> : now - v.first < 864e5 ? <span className="an-tag is-new">New</span> : null}
            {tabOpen(v, now) && <span className="an-tag is-live">Tab open now</span>}
            {v.mine && <span className="an-tag">You</span>}
            {v.bot && <span className="an-tag is-warn">Bot</span>}
            {v.info?.host && !v.bot && <span className="an-tag is-warn" title="This address belongs to a data centre: a VPN, a corporate proxy or an automated visitor">Data centre</span>}
            {v.info?.prx && !v.info?.host && <span className="an-tag is-warn">VPN</span>}
          </span>
          <span className="an-person-sub">
            {[place(v), v.org, [v.m || v.d, v.b, [v.o, v.ov && v.o !== "macOS" ? v.ov.split(".")[0] : ""].filter(Boolean).join(" ")].filter(Boolean).join(" · "), "via " + v.src].filter(Boolean).join("  ·  ")}
          </span>
        </span>
        <span className="an-person-nums">
          <span><b>{ago(lastSeen(v), now)}</b>last seen</span>
          <span><b>{v.pvs}</b>pages</span>
          <span><b>{fmtDur(v.ms)}</b>time</span>
        </span>
      </button>
      {open && (
        <div className="an-detail">
          <div className="an-detail-meta">
            <span>First seen <b style={{ color: "var(--text)" }}>{when(v.first)}</b></span>
            <span>Seen on {v.days} day{v.days === 1 ? "" : "s"}</span>
            <span>IP <code>{v.ips.join(", ") || "unknown"}</code></span>
            {v.info?.isp && v.info.isp !== v.org && <span>ISP {v.info.isp}</span>}
            {v.info?.mob && <span>Mobile network</span>}
            {v.m && <span>Model {v.m}</span>}
            {v.ping && <span>Tab last alive <b style={{ color: "var(--text)" }}>{when(v.ping)}</b></span>}
            {!v.vid && <span title="Logged before visitor ids were added, so visits are grouped by IP address">Grouped by IP</span>}
          </div>
          <div className="an-detail-actions">
            <button className="an-btn is-small" onClick={() => { const n = prompt("Name this visitor (leave empty to remove)", label || ""); if (n !== null) actions.rename(v.key, n.trim()); }}>
              {label ? "Rename" : "Name this visitor"}
            </button>
            <button className="an-btn is-small is-quiet" onClick={() => actions.markMine(v, !v.mine)}>
              {v.mine ? "Not me — show again" : "This is me — hide"}
            </button>
          </div>
          {v.moves.length > 0 && (
            <div className="an-visit">
              <div className="an-visit-head"><b>Network changes while the tab stayed open</b></div>
              <ul className="an-steps">
                {v.moves.slice(-8).map((e, i) => (
                  <li key={i}>
                    <time style={{ width: 110 }}>{when(e.t)}</time>
                    <code>{place(e)}</code>
                    <span>{e.ip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sessions.slice(0, 12).map((s) => (
            <div key={s.id} className="an-visit">
              <div className="an-visit-head">
                <b>{when(s.start)}</b>
                <span>via {s.src}</span>
                <span>{s.pvs.length} page{s.pvs.length === 1 ? "" : "s"}</span>
                {s.ms > 0 && <span>{fmtDur(s.ms)}</span>}
                {s.pvs[0].us && s.pvs[0].uc && <span>campaign {s.pvs[0].uc}</span>}
              </div>
              <ul className="an-steps">
                {s.pvs.map((p, i) => (
                  <li key={i} style={{ flexWrap: "wrap" }}>
                    <time>{new Date(p.t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</time>
                    <code>{p.p}</code>
                    <span>
                      {[p.dur ? fmtDur(p.dur) : "", p.sc ? "scrolled " + p.sc + "%" : "", i === 0 && p.r ? "from " + p.r : ""].filter(Boolean).join(" · ")}
                    </span>
                    {p.clicks.map((c, j) => (
                      <span key={j} className="is-click" style={{ flexBasis: "100%", paddingLeft: 74 }}>
                        ↗ clicked {c.x ? "“" + c.x + "” " : ""}({(c.h || "").replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)})
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {sessions.length > 12 && <p style={{ margin: "8px 0 0", color: "var(--faint)" }}>…and {sessions.length - 12} earlier visits.</p>}
        </div>
      )}
    </div>
  );
}

export default function People({ visitors, labels, now, actions }: { visitors: Visitor[]; labels: Record<string, string>; now: number; actions: PeopleActions }) {
  const [seg, setSeg] = useState<"all" | "returning" | "new">("all");
  const [sort, setSort] = useState<"recent" | "visits">("recent");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  const returning = visitors.filter((v) => v.sessions.length > 1).length;
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return visitors
      .filter((v) => (seg === "returning" ? v.sessions.length > 1 : seg === "new" ? v.sessions.length === 1 : true))
      .filter((v) => !ql || [labels[v.key], v.org, v.ci, v.co, v.rg, v.b, v.o, v.m, v.src, ...v.ips].filter(Boolean).join(" ").toLowerCase().includes(ql))
      .sort((a, b) => (sort === "visits" ? b.sessions.length - a.sessions.length || lastSeen(b) - lastSeen(a) : lastSeen(b) - lastSeen(a)));
  }, [visitors, seg, sort, q, labels]);

  return (
    <>
      <div className="an-h2">
        <h2>People</h2>
        <p>
          {visitors.length} visitor{visitors.length === 1 ? "" : "s"}, {returning} came back more than once
        </p>
        <span className="an-spacer" />
        <div className="an-seg" role="group" aria-label="Which visitors">
          {(["all", "returning", "new"] as const).map((s) => (
            <button key={s} className={seg === s ? "is-on" : ""} onClick={() => { setSeg(s); setLimit(10); }}>
              {s === "all" ? "All" : s === "returning" ? "Returning" : "One visit"}
            </button>
          ))}
        </div>
        <div className="an-seg" role="group" aria-label="Sort">
          <button className={sort === "recent" ? "is-on" : ""} onClick={() => setSort("recent")}>Latest</button>
          <button className={sort === "visits" ? "is-on" : ""} onClick={() => setSort("visits")}>Most visits</button>
        </div>
        <input className="an-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city, network, IP…" aria-label="Search visitors" />
      </div>
      <div className="an-card an-people">
        {list.slice(0, limit).map((v) => (
          <Person key={v.key} v={v} label={labels[v.key]} now={now} open={open === v.key} onToggle={() => setOpen(open === v.key ? null : v.key)} actions={actions} />
        ))}
        {list.length === 0 && <p className="an-empty">No visitors match.</p>}
        {list.length > limit && (
          <button className="an-more" onClick={() => setLimit(limit + 25)}>
            Show more ({list.length - limit} left)
          </button>
        )}
      </div>
    </>
  );
}
