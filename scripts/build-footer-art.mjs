// Turns a photo into an ink-print "engraving" used as the footer illustration.
//   node scripts/build-footer-art.mjs <photo> [out=public/footer-ink.png] [width=2200] [fade=top|bottom|both][,sides]
// Output is a PNG whose alpha channel is the ink (no colour). The site paints
// it with CSS mask-image, so the ink takes the theme colour (blue on light,
// pale on dark) and the paper is the page background itself.
import fs from "fs";
import sharp from "sharp";

const [src, out = "public/footer-ink.png", wArg = "2200", fadeArg = "top"] = process.argv.slice(2);
if (!src) {
  console.error("usage: node scripts/build-footer-art.mjs <photo> [out] [width]");
  process.exit(1);
}
const W = +wArg;

// 1. Greyscale with local contrast so details survive the line screen.
const { data, info } = await sharp(src)
  .resize({ width: W })
  .greyscale()
  .clahe({ width: 64, height: 64, maxSlope: 3 })
  .sharpen({ sigma: 1.2 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;

// 2. Sky mask: walk down each column from the top and mark pixels as sky
//    until something that isn't sky-coloured (bright or bluish, low detail)
//    shows up. Those pixels become plain paper, like an illustrated sky.
const { data: rgb } = await sharp(src).resize({ width: W }).removeAlpha().blur(3).raw().toBuffer({ resolveWithObject: true });
const sky = new Uint8Array(width * height);
const isSky = (i) => {
  const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.72 || (b - r > 18 && l > 0.5);
};
for (let x = 0; x < width; x++) {
  let miss = 0;
  for (let y = 0; y < height; y++) {
    const i = y * width + x;
    if (isSky(i)) { sky[i] = 1; miss = 0; }
    else if (++miss > 2) break; // a few non-sky pixels in a row: we hit the scene
  }
}

// 3. Line screen: darkness is compared against a diagonal hatch pattern, so
//    dark areas get dense lines and mid-tones get thin ones, like an etching.
const PERIOD = 4.2; // px between hatch lines
const alpha = Buffer.alloc(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = y * width + x;
    const lum = data[i] / 255;
    // 0 = paper, 1 = full ink; bright regions fall away entirely.
    let dark = sky[i] ? 0 : Math.min(1, Math.max(0, (0.8 - lum) / 0.6));
    // Two hatch directions: the second only kicks in for deep shadows.
    const h1 = (((x + y) % PERIOD) + PERIOD) % PERIOD / PERIOD; // 0..1 sawtooth
    const h2 = (((x - y) % PERIOD) + PERIOD) % PERIOD / PERIOD;
    const line1 = Math.abs(h1 - 0.5) * 2; // 0 at line centre, 1 between lines
    const line2 = Math.abs(h2 - 0.5) * 2;
    let ink = line1 < dark ? 1 : 0;
    if (dark > 0.6 && line2 < (dark - 0.6) * 2.2) ink = 1;
    // Soft edge so lines don't alias when the image is scaled.
    const edge = Math.min(1, Math.max(0, (dark - line1) * 3 + 0.5));
    alpha[i] = Math.round(255 * Math.max(ink * 0.9, edge * dark));
  }
}

// 4. Fade the edges so the scene grows out of the page: the top for the
//    footer (it sits on the page bottom), the bottom for the header.
const fades = fadeArg.split(",");
if (fades.includes("top") || fades.includes("both")) {
  const fade = Math.round(height * 0.28);
  for (let y = 0; y < fade; y++) {
    const k = (y / fade) ** 1.6;
    for (let x = 0; x < width; x++) alpha[y * width + x] = Math.round(alpha[y * width + x] * k);
  }
}
if (fades.includes("bottom") || fades.includes("both")) {
  const fade = Math.round(height * 0.22);
  for (let y = 0; y < fade; y++) {
    const k = (y / fade) ** 1.4;
    const row = height - 1 - y;
    for (let x = 0; x < width; x++) alpha[row * width + x] = Math.round(alpha[row * width + x] * k);
  }
}

// Optional soft left/right edges, for art that doesn't span the full width.
if (fades.includes("sides")) {
  const fade = Math.round(width * 0.07);
  for (let x = 0; x < fade; x++) {
    const k = (x / fade) ** 1.3;
    for (let y = 0; y < height; y++) {
      alpha[y * width + x] = Math.round(alpha[y * width + x] * k);
      alpha[y * width + width - 1 - x] = Math.round(alpha[y * width + width - 1 - x] * k);
    }
  }
}

const black = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) black[i * 4 + 3] = alpha[i];
await sharp(black, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours: 64 }).toFile(out);
console.log(out, width + "x" + height, fs.statSync(out).size, "bytes");
