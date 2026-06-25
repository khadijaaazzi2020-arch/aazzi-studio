/**
 * gen-favicons.mjs — generate the full favicon/app-icon set from the brand logo.
 *
 *   node scripts/gen-favicons.mjs
 *
 * Source : public/aazzi-logo.jpg  (1254×1254)
 * Output : public/  (favicon.ico + PNGs at every required size)
 *
 * sharp ships with Next.js, so no extra dependency is needed. The .ico is
 * assembled by hand from PNG-encoded frames (16/32/48) — the ICO container
 * supports embedded PNGs, which every modern browser reads.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = resolve("public/aazzi-logo.jpg");
const OUT = resolve("public");
const BG = "#121414"; // brand near-black, used to pad the maskable icon

const png = (size, fit = "cover") =>
  sharp(SRC)
    .resize(size, size, { fit, background: BG })
    .png()
    .toBuffer();

async function write(name, buf) {
  writeFileSync(resolve(OUT, name), buf);
  console.log("✓", name, `(${buf.length} bytes)`);
}

// ── multi-resolution favicon.ico ───────────────────────────────────────────
function buildIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const dir = [];
  const data = [];
  for (const f of frames) {
    const e = Buffer.alloc(16);
    e.writeUInt8(f.size >= 256 ? 0 : f.size, 0); // width  (0 ⇒ 256)
    e.writeUInt8(f.size >= 256 ? 0 : f.size, 1); // height (0 ⇒ 256)
    e.writeUInt8(0, 2); // palette count
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(f.buf.length, 8); // image size
    e.writeUInt32LE(offset, 12); // image offset
    dir.push(e);
    data.push(f.buf);
    offset += f.buf.length;
  }
  return Buffer.concat([header, ...dir, ...data]);
}

async function main() {
  // Standard PNGs (logo fills the frame).
  await write("favicon-16x16.png", await png(16));
  await write("favicon-32x32.png", await png(32));
  await write("favicon-48x48.png", await png(48));
  await write("apple-touch-icon.png", await png(180));
  await write("android-chrome-192x192.png", await png(192));
  await write("android-chrome-512x512.png", await png(512));
  await write("mstile-150x150.png", await png(150));

  // Maskable Android icon: logo contained at ~78% on a solid brand field so
  // launchers can crop to any shape without clipping the monogram.
  const maskable = await sharp({
    create: { width: 512, height: 512, channels: 4, background: BG },
  })
    .composite([
      {
        input: await sharp(SRC).resize(400, 400, { fit: "contain", background: BG }).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
  await write("android-chrome-maskable-512x512.png", maskable);

  // favicon.ico with 16/32/48 frames.
  const ico = buildIco([
    { size: 16, buf: await png(16) },
    { size: 32, buf: await png(32) },
    { size: 48, buf: await png(48) },
  ]);
  await write("favicon.ico", ico);

  console.log("\nAll favicon assets written to /public");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
