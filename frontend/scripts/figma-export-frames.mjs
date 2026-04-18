/**
 * Export Figma frames as PNG (2x) via REST API into repo folder for stable references.
 *
 * Setup:
 *   1) Figma → Settings → Personal access tokens → create token
 *   2) export FIGMA_TOKEN="figd_..."
 *
 * Run from frontend/:
 *   FIGMA_TOKEN=... node scripts/figma-export-frames.mjs
 *
 * Optional env:
 *   FIGMA_FILE_KEY   (default: copy of your file)
 *   FIGMA_FORMAT     png | jpg | svg | pdf   (default: png)
 *   FIGMA_SCALE      1 | 2 | 3 | 4           (default: 2)
 *   FIGMA_OUT_DIR    absolute or relative path (default: ../../docs/figma-ready)
 *   FIGMA_INCLUDE_BOARDS=1  also export whole sections (large PNGs):
 *                           node 1:3643 → board-ready-section.*
 *                           node 1:3075 → board-ui-kit-section.*
 *                           (удобно как «весь макет на одном листе»; файлы могут быть очень большими)
 *
 * Docs: https://www.figma.com/developers/api#get-images-endpoint
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_FILE_KEY = "BBrbpnfGElX0afHLm7ccxP";

/** Ready section (`node-id=1-3643`) — main screen frames → output basename */
const DEFAULT_FRAMES = [
  ["1:3644", "home"],
  ["1:3675", "balance-deposit"],
  ["1:3687", "balance-referral"],
  ["1:3701", "bot-detail"],
  ["1:3734", "social-media"],
  ["1:3751", "support"],
  ["1:3758", "faq"],
  ["1:3770", "notifications"],
  ["1:3783", "settings"],
  ["1:3808", "withdraw"],
  ["1:3883", "withdraw-confirm"],
  ["1:3893", "withdraw-done"],
  ["1:3904", "top-up"],
];

/** Корневые секции: весь Ready и весь UI Kit одним кадром (см. FIGMA_INCLUDE_BOARDS). */
const BOARD_FRAMES = [
  ["1:3643", "board-ready-section"],
  ["1:3075", "board-ui-kit-section"],
];

const token = process.env.FIGMA_TOKEN?.trim();
const fileKey = (process.env.FIGMA_FILE_KEY || DEFAULT_FILE_KEY).trim();
const format = (process.env.FIGMA_FORMAT || "png").toLowerCase();
const scale = process.env.FIGMA_SCALE || "2";
const rawOut = process.env.FIGMA_OUT_DIR?.trim();
const outDir = rawOut
  ? rawOut.startsWith("/")
    ? rawOut
    : join(process.cwd(), rawOut)
  : join(__dirname, "../../docs/figma-ready");

if (!token) {
  console.error("Missing FIGMA_TOKEN. Create a Personal Access Token in Figma account settings.");
  process.exit(1);
}

if (!["png", "jpg", "svg", "pdf"].includes(format)) {
  console.error(`Invalid FIGMA_FORMAT="${format}". Use png, jpg, svg, or pdf.`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

/**
 * @param {string[]} ids
 */
async function fetchImageUrls(ids) {
  const params = new URLSearchParams({
    ids: ids.join(","),
    format,
    scale: String(scale),
  });
  const url = `https://api.figma.com/v1/images/${fileKey}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma images API ${res.status}: ${text.slice(0, 500)}`);
  }
  const body = await res.json();
  if (body.err) {
    throw new Error(`Figma API err: ${body.err}`);
  }
  return body.images || {};
}

/**
 * @param {string} downloadUrl
 * @param {string} destPath
 */
async function downloadFile(downloadUrl, destPath) {
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error(`Download failed ${res.status} for ${downloadUrl}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

const BATCH = 12;

async function main() {
  console.log(`File: ${fileKey}`);
  console.log(`Out:  ${outDir}`);
  console.log(`Format: ${format} scale=${scale}`);

  for (let i = 0; i < DEFAULT_FRAMES.length; i += BATCH) {
    const slice = DEFAULT_FRAMES.slice(i, i + BATCH);
    const ids = slice.map(([id]) => id);
    const urls = await fetchImageUrls(ids);

    for (const [nodeId, basename] of slice) {
      const href = urls[nodeId];
      if (!href) {
        console.warn(`No URL for node ${nodeId} (${basename}) — skip`);
        continue;
      }
      const ext = format === "jpg" ? "jpg" : format;
      const dest = join(outDir, `${basename}.${ext}`);
      await downloadFile(href, dest);
      console.log(`OK  ${nodeId} → ${dest}`);
    }
  }

  if (process.env.FIGMA_INCLUDE_BOARDS === "1") {
    console.log("Exporting full section boards (FIGMA_INCLUDE_BOARDS=1)…");
    const urls = await fetchImageUrls(BOARD_FRAMES.map(([id]) => id));
    for (const [nodeId, basename] of BOARD_FRAMES) {
      const href = urls[nodeId];
      if (!href) {
        console.warn(`No URL for board node ${nodeId} (${basename}) — skip`);
        continue;
      }
      const ext = format === "jpg" ? "jpg" : format;
      const dest = join(outDir, `${basename}.${ext}`);
      await downloadFile(href, dest);
      console.log(`OK  ${nodeId} → ${dest}`);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
