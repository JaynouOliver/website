// Generates src/data/globe-points.json: evenly spaced dots on land, used by the
// talks globe. Run once (or after changing density): node scripts/build-globe-points.mjs
import { geoContains } from "d3-geo";
import fs from "fs";
import { feature } from "topojson-client";

const world = JSON.parse(fs.readFileSync("src/data/world-110m.json", "utf8"));
const land = feature(world, world.objects.land);
const N = 16000; // points on the full sphere (Fibonacci lattice) before land filtering
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((i * golden * 180) / Math.PI) % 360) + 360) % 360 - 180;
  if (lat < -60) continue; // skip Antarctica
  if (geoContains(land, [lon, lat])) out.push(+lat.toFixed(2), +lon.toFixed(2));
}
fs.writeFileSync("src/data/globe-points.json", JSON.stringify(out));
console.log(out.length / 2, "land points");
