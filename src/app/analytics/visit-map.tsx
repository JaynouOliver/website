"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export type MapVisit = {
  ip: string;
  city?: string;
  country?: string;
  path?: string;
  lat?: number | string;
  lon?: number | string;
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

const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Deterministic small offset so cities sharing a country centroid don't stack exactly.
function jitter(s: string): [number, number] {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return [(((h % 100) + 100) % 100 / 100 - 0.5) * 2.4, ((((h >> 7) % 100) + 100) % 100 / 100 - 0.5) * 2.4];
}

const tileUrl = (dark: boolean) =>
  `https://{s}.basemap.cartocdn.com/${dark ? "dark_all" : "light_all"}/{z}/{x}/{y}{r}.png`;

export default function VisitMap({ visits }: { visits: MapVisit[] }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  function draw(L: any, data: MapVisit[]) {
    type G = { lat: number; lon: number; city: string; country: string; count: number; ips: Set<string>; pages: Record<string, number>; precise: boolean };
    const groups = new Map<string, G>();
    for (const v of data) {
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
      const g = groups.get(key) || { lat, lon, city, country, count: 0, ips: new Set<string>(), pages: {}, precise: false };
      if (precise && !g.precise) { g.lat = lat; g.lon = lon; g.precise = true; }
      g.count++; g.ips.add(v.ip);
      const p = v.path || "/";
      g.pages[p] = (g.pages[p] || 0) + 1;
      groups.set(key, g);
    }
    layerRef.current.clearLayers();
    groups.forEach((g) => {
      const r = Math.min(24, 5 + Math.sqrt(g.count) * 2.5);
      const pages = Object.entries(g.pages).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([p, n]) => `<div style="display:flex;gap:12px;justify-content:space-between"><span>${escHtml(p)}</span><b>${n}</b></div>`).join("");
      L.circleMarker([g.lat, g.lon], { radius: r, color: "#e85d04", weight: 1.5, fillColor: "#e85d04", fillOpacity: 0.3 })
        .bindPopup(
          `<div style="min-width:180px;font-size:13px"><b>${escHtml(g.city || g.country)}</b>${g.city && g.country ? ", " + escHtml(g.country) : ""}${g.precise ? "" : " <span style='opacity:.6'>(approx.)</span>"}` +
          `<div style="opacity:.7;margin:2px 0 6px">${g.count} visit${g.count > 1 ? "s" : ""} · ${g.ips.size} IP${g.ips.size > 1 ? "s" : ""}</div>${pages}</div>`
        )
        .addTo(layerRef.current);
    });
  }

  useEffect(() => {
    let disposed = false;
    let mo: MutationObserver | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !divRef.current || mapRef.current) return;
      const map = L.map(divRef.current, {
        center: [22, 15], zoom: 2, minZoom: 1, maxZoom: 12,
        worldCopyJump: true, attributionControl: false,
      });
      const dark = document.documentElement.dataset.theme === "dark";
      tileRef.current = L.tileLayer(tileUrl(dark), { subdomains: "abcd" }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      mo = new MutationObserver(() =>
        tileRef.current.setUrl(tileUrl(document.documentElement.dataset.theme === "dark"))
      );
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      draw(L, visits);
    })();
    return () => {
      disposed = true;
      mo?.disconnect();
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (!mapRef.current || !layerRef.current) return;
      const L = (await import("leaflet")).default;
      draw(L, visits);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visits]);

  return (
    <div
      ref={divRef}
      style={{ height: 380, borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 18, position: "relative", zIndex: 0, isolation: "isolate", background: "var(--soft)" }}
    />
  );
}
