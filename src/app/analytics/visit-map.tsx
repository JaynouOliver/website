"use client";

import world from "@/data/world-110m.json";
import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

export type MapVisit = {
  ip: string;
  city?: string;
  country?: string;
  path?: string;
  lat?: number | string;
  lon?: number | string;
};

type Group = {
  key: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  count: number;
  ips: number;
  pages: [string, number][];
  precise: boolean;
};

// Country centroids — fallback for visits logged before lat/lng tracking.
const CENTROIDS: Record<string, [number, number]> = {
  IN: [22.8, 79], US: [39.8, -98.6], TW: [23.7, 121], AU: [-25.3, 133.8], FR: [46.6, 2.2],
  AT: [47.6, 14.1], CA: [56.1, -106.3], JP: [36.2, 138.3], GB: [54, -2.5], DE: [51.2, 10.4],
  BR: [-14.2, -51.9], NZ: [-40.9, 174.9], SG: [1.35, 103.8], AE: [23.4, 53.8], NL: [52.1, 5.3],
  IE: [53.4, -8.2], SE: [60.1, 18.6], CH: [46.8, 8.2], ES: [40.5, -3.7], IT: [41.9, 12.6],
  RU: [61.5, 105.3], CN: [35.9, 104.2], KR: [35.9, 127.8], HK: [22.3, 114.2], ID: [-0.8, 113.9],
  TH: [15.9, 101], VN: [14.1, 108.3], PH: [12.9, 121.8], PK: [30.4, 69.3], BD: [23.7, 90.4],
  LK: [7.9, 80.8], NP: [28.4, 84.1], ZA: [-30.6, 22.9], NG: [9.1, 8.7], EG: [26.8, 30.8],
  KE: [-0.02, 37.9], MX: [23.6, -102.6], AR: [-38.4, -63.6], CL: [-35.7, -71.5], CO: [4.6, -74.1],
  PL: [51.9, 19.1], UA: [48.4, 31.2], TR: [39, 35.2], IL: [31, 34.9], SA: [23.9, 45.1],
  PT: [39.4, -8.2], BE: [50.5, 4.5], DK: [56.3, 9.5], NO: [60.5, 8.5], FI: [61.9, 25.7],
  CZ: [49.8, 15.5], RO: [45.9, 25], GR: [39.1, 21.8], HU: [47.2, 19.5], MY: [4.2, 102], QA: [25.4, 51.2],
};

// Deterministic small offset so cities sharing a country centroid don't stack exactly.
function jitter(s: string): [number, number] {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return [((((h % 100) + 100) % 100) / 100 - 0.5) * 2.4, (((((h >> 7) % 100) + 100) % 100) / 100 - 0.5) * 2.4];
}

function computeGroups(visits: MapVisit[]): Group[] {
  const m = new Map<string, { lat: number; lon: number; city: string; country: string; count: number; ips: Set<string>; pages: Record<string, number>; precise: boolean }>();
  for (const v of visits) {
    const city = v.city && v.city !== "—" ? v.city : "";
    const country = v.country && v.country !== "—" ? v.country : "";
    let lat = Number(v.lat), lon = Number(v.lon);
    const precise = isFinite(lat) && isFinite(lon) && (lat !== 0 || lon !== 0);
    if (!precise) {
      const c = CENTROIDS[country];
      if (!c) continue;
      const [j1, j2] = jitter(city || country);
      lat = c[0] + j1; lon = c[1] + j2;
    }
    const key = (city || "?") + "|" + country;
    const g = m.get(key) || { lat, lon, city, country, count: 0, ips: new Set<string>(), pages: {} as Record<string, number>, precise: false };
    if (precise && !g.precise) { g.lat = lat; g.lon = lon; g.precise = true; }
    g.count++; g.ips.add(v.ip);
    const p = v.path || "/";
    g.pages[p] = (g.pages[p] || 0) + 1;
    m.set(key, g);
  }
  return Array.from(m.entries()).map(([key, g]) => ({
    key, lat: g.lat, lon: g.lon, city: g.city, country: g.country, count: g.count,
    ips: g.ips.size, precise: g.precise,
    pages: Object.entries(g.pages).sort((a, b) => b[1] - a[1]).slice(0, 5),
  }));
}

export default function VisitMap({ visits }: { visits: MapVisit[] }) {
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState<Group | null>(null);
  const groups = useMemo(() => computeGroups(visits), [visits]);

  return (
    <div style={{ position: "relative", border: "1px solid var(--line)", borderRadius: 14, marginBottom: 18, overflow: "hidden" }}>
      <ComposableMap projection="geoNaturalEarth1" width={880} height={400} style={{ width: "100%", height: "auto", display: "block" }}>
        <ZoomableGroup center={[20, 12]} minZoom={1} maxZoom={16} onMoveEnd={({ zoom: z }) => setZoom(z)}>
          <Geographies geography={world as any}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "var(--soft)", stroke: "var(--line)", strokeWidth: 0.4, outline: "none" },
                    hover: { fill: "var(--soft)", stroke: "var(--faint)", strokeWidth: 0.4, outline: "none" },
                    pressed: { fill: "var(--soft)", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {groups.map((g) => (
            <Marker key={g.key} coordinates={[g.lon, g.lat]} onClick={() => setSel(g)}>
              <circle
                r={(5 + Math.sqrt(g.count) * 2.5) / zoom}
                fill="#e85d04"
                fillOpacity={0.3}
                stroke="#e85d04"
                strokeWidth={1.5 / zoom}
                style={{ cursor: "pointer" }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {sel && (
        <div style={{ position: "absolute", top: 12, right: 12, minWidth: 200, maxWidth: 280, background: "var(--dock)", backdropFilter: "blur(12px)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", fontSize: 13, zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <strong style={{ fontSize: 14 }}>
              {sel.city || sel.country}
              {sel.city && sel.country ? `, ${sel.country}` : ""}
            </strong>
            {!sel.precise && <span style={{ color: "var(--faint)", fontSize: 11.5 }}>approx.</span>}
            <button onClick={() => setSel(null)} aria-label="Close" style={{ marginLeft: "auto", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", font: "inherit", padding: 0 }}>✕</button>
          </div>
          <div style={{ color: "var(--muted)", margin: "2px 0 8px" }}>
            {sel.count} visit{sel.count > 1 ? "s" : ""} · {sel.ips} IP{sel.ips > 1 ? "s" : ""}
          </div>
          {sel.pages.map(([p, n]) => (
            <div key={p} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</span>
              <strong>{n}</strong>
            </div>
          ))}
        </div>
      )}

      <span style={{ position: "absolute", bottom: 8, left: 12, fontSize: 11.5, color: "var(--faint)", pointerEvents: "none" }}>
        scroll to zoom · drag to pan · click a bubble
      </span>
    </div>
  );
}
