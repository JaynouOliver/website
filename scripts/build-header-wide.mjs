// Builds the wide desktop header skyline (public/header-ink-wide.png) from an
// ink mask made by build-footer-art.mjs (fade "bottom", no side fade):
//   node scripts/build-header-wide.mjs <ink.png> [out]
// The Oriental Pearl Tower cluster goes to the left edge, the Shanghai Tower
// cluster to the right edge, and the low skyline base fills the middle, so the
// towers frame the hero and the middle stays low behind the text.
import sharp from "sharp";

const [src, out = "public/header-ink-wide.png"] = process.argv.slice(2);
const { data, info } = await sharp(src).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
const { width: SW, height: H } = info;

const LEFT = [330, 900]; // source columns: Oriental Pearl Tower and neighbours
const RIGHT = [900, 1650]; // source columns: World Financial Center to Shanghai Tower
const W = 2400;
const MID_TOP = Math.round(H * 0.45); // only low-rise buildings in the middle
const out_ = new Uint8Array(W * H);
const put = (x, y, v) => {
  if (x < 0 || x >= W) return;
  const i = y * W + x;
  if (v > out_[i]) out_[i] = v; // "lighten" blend: overlaps don't leave seams
};

const lw = LEFT[1] - LEFT[0], rw = RIGHT[1] - RIGHT[0];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < lw; x++) put(x, y, data[y * SW + LEFT[0] + x]);
  for (let x = 0; x < rw; x++) put(W - rw + x, y, data[y * SW + RIGHT[0] + x]);
}
// Middle: low-rise stretches from both ends of the source, alternated and
// mirrored so no building repeats side by side.
const midStart = lw - 60, midEnd = W - rw + 60;
const BASES = [[0, 200], [1650, 1920], [100, 200], [1720, 1880]];
let x = midStart, b = 0;
while (x < midEnd) {
  const [a, z] = BASES[b % BASES.length];
  const flip = b % 2 === 1;
  for (let k = 0; k < z - a && x < midEnd; k++, x++) {
    const sx = flip ? z - 1 - k : a + k;
    for (let y = MID_TOP; y < H; y++) {
      const ramp = Math.min(1, (y - MID_TOP) / (H * 0.08)); // soft top edge
      put(x, y, Math.round(data[y * SW + sx] * ramp));
    }
  }
  b++;
}
// Gentle fade at the outer edges.
const fade = Math.round(W * 0.025);
for (let x = 0; x < fade; x++) {
  const k = x / fade;
  for (let y = 0; y < H; y++) {
    out_[y * W + x] = Math.round(out_[y * W + x] * k);
    out_[y * W + W - 1 - x] = Math.round(out_[y * W + W - 1 - x] * k);
  }
}
const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) rgba[i * 4 + 3] = out_[i];
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours: 64 }).toFile(out);
console.log(out, W + "x" + H);
