#!/usr/bin/env node
/**
 * Синхронизирует `FAQ.md` (корень) в:
 * - backend/src/db/migrations/faqDefaultPalladiumMarkdown.ts
 * - frontend/src/fm/faq/faqDefaultPalladiumMarkdown.ts
 * Запуск: `node scripts/sync-faq-md-to-backend.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "FAQ.md");
const c = fs.readFileSync(mdPath, "utf8");
const head =
  "/**\n" +
  " * Дефолтный FAQ: держите в sync с FAQ.md (корень репо).\n" +
  " * Admin → Контент (content_faq_markdown) перекрывает при сохранении.\n" +
  " */\n";
const body = `${head}export const FAQ_DEFAULT_PALLADIUM_MARKDOWN = ${JSON.stringify(c)};\n`;

const outBackend = path.join(
  root,
  "backend/src/db/migrations/faqDefaultPalladiumMarkdown.ts"
);
fs.writeFileSync(outBackend, body);
console.log("OK:", outBackend, `(${c.length} chars)`);

const outFrontend = path.join(
  root,
  "frontend/src/fm/faq/faqDefaultPalladiumMarkdown.ts"
);
fs.writeFileSync(outFrontend, body);
console.log("OK:", outFrontend, `(${c.length} chars)`);
