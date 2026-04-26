#!/usr/bin/env node
/**
 * Builds root `FAQ.md` from the plain-text architecture spec `архитектура  FAQ`.
 * Output format matches the miniapp parser:
 * - sections: `# Title`
 * - Q/A: `## Question` then answer paragraphs until the next question.
 *
 * Run from repo root:
 *   node scripts/generate-faq-md-from-architecture.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const archPath = path.join(root, "архитектура  FAQ");
const outPath = path.join(root, "FAQ.md");

function normalizeSectionTitle(raw) {
  return String(raw ?? "")
    .replace(/^Раздел\s*-\s*/i, "")
    .replace(/^Rздел\s*-\s*/i, "")
    .replace(/^Рздел\s*-\s*/i, "")
    .replace(/^рздел\s*-\s*/i, "")
    .trim();
}

function prettifySectionTitle(title) {
  const t = String(title ?? "").trim();
  const key = t.toLowerCase();
  const map = new Map([
    ["withdrawals", "Withdrawals"],
    ["dubts & fears", "Doubts & Fears"],
    ["dubts and fears", "Doubts & Fears"]
  ]);
  return map.get(key) ?? t;
}

function isSectionLine(line) {
  // Note: the spec file sometimes uses a Cyrillic "Р" at the start ("Рздел") instead of Latin "R".
  return /^раздел\s*-\s*/i.test(line) || /^rздел\s*-\s*/i.test(line) || /^рздел\s*-\s*/i.test(line);
}

function isInsideMarker(line) {
  return /^(внутри раздела|внтури раздела|внитри раздела)\s*-\s*/i.test(line);
}

function stripInsideMarker(line) {
  return line.replace(/^(внутри раздела|внтури раздела|внитри раздела)\s*-\s*/i, "").trim();
}

function escapeForMd(text) {
  return String(text).replace(/\r\n/g, "\n").trimEnd();
}

function normalizeQuestion(qRaw) {
  let q = String(qRaw ?? "").trim();
  if (!q) return "";
  if (!/\?\s*$/.test(q)) q = `${q.replace(/\.\s*$/, "").trim()}?`;
  return q;
}

function splitSectionBodyIntoQaChunks(body) {
  const t = String(body ?? "").replace(/\r\n/g, "\n").trim();
  if (!t) return [];

  // Split on lines that start a typical English question.
  // This handles Q/A blocks without a blank line between them (common in the architecture doc).
  const parts = t.split(
    /(?=^(?:What|How|Why|When|Where|Who|Which|Do|Does|Did|Can|Could|Should|Would|Is|Are|Was|Were|If|Aren’t|Isn’t)\b)/gim
  );

  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
      const q0 = lines[0] ?? "";
      const q = normalizeQuestion(q0);
      const a = lines.slice(1).join("\n").trim();
      return { q, a: a || " " };
    })
    .filter((x) => x.q);
}

function parseArchitecture(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  /** @type {{title:string, qa:{q:string,aLines:string[]}[]}[]} */
  const sections = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    if (isSectionLine(line)) {
      const title = prettifySectionTitle(normalizeSectionTitle(line));
      i += 1;

      // Collect raw body until next section header
      const bodyLines = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t && isSectionLine(t)) break;
        bodyLines.push(lines[i]);
        i += 1;
      }

      let body = bodyLines.join("\n").trim();
      // Strip leading "inside section" marker(s)
      body = body.replace(/^(?:внутри раздела|внтури раздела|внитри раздела)\s*-\s*/gim, "").trim();

      /** @type {{q:string,a:string}[]} */
      const qa = splitSectionBodyIntoQaChunks(body);

      if (title && qa.length) sections.push({ title, qa });
      continue;
    }

    i += 1;
  }

  return sections;
}

function renderMarkdown(sections) {
  const header = [
    "> **Note:** This FAQ structure follows the internal spec `архитектура  FAQ`. Numbers that look like fees or minimums are **marketing copy from that spec** — always confirm **live fees and minimums** in the mini app (**Top up** / **Withdraw**) and in operator configuration.",
    "",
    "> **Network:** USDT **TRC20** on TRON for deposits/withdrawals in this product (unless your deployment explicitly supports another network).",
    ""
  ].join("\n");

  const body = sections
    .map((sec) => {
      const qas = sec.qa
        .map((x) => {
          const a = escapeForMd(String(x.a ?? "").trim()) || " ";
          return `## ${x.q}\n\n${a}`;
        })
        .join("\n\n");
      return `# ${sec.title}\n\n${qas}`;
    })
    .join("\n\n");

  return `${header}\n${body}\n`;
}

const arch = fs.readFileSync(archPath, "utf8");
const sections = parseArchitecture(arch);
if (!sections.length) {
  console.error("No sections parsed from:", archPath);
  process.exit(1);
}

fs.writeFileSync(outPath, renderMarkdown(sections), "utf8");
console.log("OK:", outPath, `sections=${sections.length}`);
