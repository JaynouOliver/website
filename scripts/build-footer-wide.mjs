// Builds the wide desktop footer (public/footer-ink-wide.png): Kolkata's two
// bridges framing the page. Howrah Bridge's cantilever (mirrored, tall end at
// the left edge, sloping down toward the middle) and Vidyasagar Setu with the
// road and city on the right. Inputs are ink masks from build-footer-art.mjs
// made with fade "none":
//   node scripts/build-footer-wide.mjs <howrah-ink.png> <vidyasagar-ink.png> [out]
import sharp from "sharp";

const [howrahSrc, vsSrc, out = "public/footer-ink-wide.png"] = process.argv.slice(2);
const load = async (f) => {
  const { data, info } = await sharp(f).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const hw = await load(howrahSrc);
const vs = await load(vsSrc);

const H = vs.h; // 1080
const W = 2560;
const VS_X = W - vs.w; // Vidyasagar drawing sits at the right edge
const px = new Uint8Array(W * H);
const put = (x, y, v) => {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = y * W + x;
  if (v > px[i]) px[i] = v; // lighten blend
};

// 1. Vidyasagar Setu, full.
for (let y = 0; y < H; y++) for (let x = 0; x < vs.w; x++) put(VS_X + x, y, vs.data[y * vs.w + x]);

// 2. Its foreground (railing, trees) continued leftwards, mirrored, under Howrah.
const FG = Math.round(H * 0.6);
for (let x = 0; x < VS_X; x++) {
  const k = x % (2 * 700);
  const sx = k < 700 ? 700 - 1 - k : k - 700; // mirror-tile the first 700 columns
  for (let y = FG; y < H; y++) {
    const ramp = Math.min(1, (y - FG) / (H * 0.08));
    put(x, y, Math.round(vs.data[y * vs.w + sx] * ramp));
  }
}

// 3. Howrah Bridge: the truss down to the deck (no river), mirrored so the
//    tall cantilever is at the left edge.
const HW_X0 = 0, HW_Y1 = 770; // source columns from 600; rows down to the deck
const scale = 0.7;
const deckY = Math.round(H * 0.72); // where the deck lands in the footer
const bw = Math.round((hw.w - HW_X0) * scale), bh = Math.round(HW_Y1 * scale);
const top = deckY - bh;
for (let y = 0; y < bh; y++) {
  const sy = Math.min(HW_Y1 - 1, Math.round(y / scale));
  const fadeBottom = Math.min(1, (bh - y) / (bh * 0.1)); // soften into the foreground
  for (let x = 0; x < bw; x++) {
    const sx = hw.w - 1 - Math.round(x / scale); // mirrored
    if (sx < HW_X0) continue;
    const fadeRight = Math.min(1, (bw - x) / (bw * 0.18)); // the low end melts into the middle
    put(x, top + y, Math.round(hw.data[sy * hw.w + sx] * fadeBottom * fadeRight));
  }
}

// 4. Fade the very top, and the outer edges slightly.
for (let y = 0; y < H * 0.06; y++) {
  const k = y / (H * 0.06);
  for (let x = 0; x < W; x++) px[y * W + x] = Math.round(px[y * W + x] * k);
}
const ef = Math.round(W * 0.02);
for (let x = 0; x < ef; x++) {
  const k = x / ef;
  for (let y = 0; y < H; y++) {
    px[y * W + x] = Math.round(px[y * W + x] * k);
    px[y * W + W - 1 - x] = Math.round(px[y * W + W - 1 - x] * k);
  }
}

const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) rgba[i * 4 + 3] = px[i];
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours: 64 }).toFile(out);
console.log(out, W + "x" + H);
