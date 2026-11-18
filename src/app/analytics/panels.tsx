"use client";

import { useState } from "react";
import type { Bucket, Row } from "./compute";

// Presentational pieces of the dashboard: stat tiles, the time chart and the
// ranked lists. No data fetching here.

export function Kpi({ label, value, prev, cur, lowerIsBetter, sub }: { label: string; value: string; prev?: number; cur?: number; lowerIsBetter?: boolean; sub?: string }) {
  let delta: React.ReactNode = null;
  if (prev !== undefined && cur !== undefined && prev > 0) {
    const pct = Math.round(((cur - prev) / prev) * 100);
    if (pct !== 0) {
      const good = lowerIsBetter ? pct < 0 : pct > 0;
      delta = (
        <span className={"an-delta " + (good ? "is-up" : "is-down")}>
          {pct > 0 ? "↑" : "↓"} {Math.abs(pct)}%
        </span>
      );
    }
  }
  return (
    <div className="an-kpi">
      <div className="an-kpi-label">{label}</div>
      <div className="an-kpi-value">{value}</div>
      <div className="an-kpi-sub">
        {delta} {delta ? "vs previous period" : sub || ""}
      </div>
    </div>
  );
}

export function TimeChart({ buckets, title }: { buckets: Bucket[]; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...buckets.map((b) => b.pageviews));
  const ticks = buckets.length <= 8 ? buckets.map((_, i) => i) : [0, Math.round((buckets.length - 1) / 3), Math.round(((buckets.length - 1) * 2) / 3), buckets.length - 1];
  return (
    <div className="an-card an-chart">
      <div className="an-chart-head">
        <strong>{title}</strong>
        <span className="an-key"><i /> Visitors</span>
        <span className="an-key is-views"><i /> Page views</span>
      </div>
      <div className="an-plot" role="img" aria-label={title + ": visitors and page views over time"} onMouseLeave={() => setHover(null)}>
        <span className="an-ymax">{max}</span>
        {buckets.map((b, i) => (
          <div key={b.t} className="an-col" onMouseEnter={() => setHover(i)}>
            <div className="an-bar" style={{ height: (b.pageviews / max) * 100 + "%" }} />
            <div className="an-bar is-visitors" style={{ height: (b.visitors / max) * 100 + "%" }} />
            {hover === i && (
              <div className="an-tip" style={i < 3 ? { left: 0, transform: "none" } : i > buckets.length - 4 ? { left: "auto", right: 0, transform: "none" } : undefined}>
                <b>{b.label}</b>
                <br />
                {b.visitors} visitor{b.visitors === 1 ? "" : "s"} · {b.pageviews} view{b.pageviews === 1 ? "" : "s"}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="an-xaxis">
        {ticks.map((i) => (
          <span key={i}>{buckets[i]?.label}</span>
        ))}
      </div>
    </div>
  );
}

export type Tab = { id: string; title: string; rows: Row[]; total: number; render?: (name: string) => React.ReactNode; onPick?: (name: string) => void; unit?: string };

// A card with one or more ranked lists (tabs). Clicking a row filters the page.
export function Panel({ tabs, onMore }: { tabs: Tab[]; onMore?: (id: string) => void }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) || tabs[0];
  const max = Math.max(1, ...tab.rows.map((r) => r.visitors));
  return (
    <div className="an-card an-panel">
      <div className="an-panel-head">
        {tabs.length === 1 ? (
          <strong>{tab.title}</strong>
        ) : (
          <div className="an-tabs" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === tab.id} className={t.id === tab.id ? "is-on" : ""} onClick={() => setActive(t.id)}>
                {t.title}
              </button>
            ))}
          </div>
        )}
        <span>{tab.unit || "Visitors"}</span>
        <span>{tab.unit ? "Clicks" : "Views"}</span>
      </div>
      {tab.rows.map((r) => (
        <button key={r.name} className={"an-row" + (tab.onPick ? "" : " is-static")} onClick={() => tab.onPick?.(r.name)} title={tab.onPick ? "Filter by " + r.name : undefined}>
          <span className="an-row-fill" style={{ width: (r.visitors / max) * 100 + "%" }} />
          <span className="an-row-name">{tab.render ? tab.render(r.name) : r.name}</span>
          <span className="an-row-num">{r.visitors}</span>
          <span className="an-row-num is-muted">{r.views}</span>
        </button>
      ))}
      {tab.rows.length === 0 && <p className="an-empty">Nothing yet.</p>}
      {onMore && tab.total > tab.rows.length && (
        <button className="an-panel-more" onClick={() => onMore(tab.id)}>
          Show all {tab.total}
        </button>
      )}
    </div>
  );
}
