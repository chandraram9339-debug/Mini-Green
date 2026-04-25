#!/usr/bin/env node
/**
 * Синхронизирует `FAQ.md` (корень) → `backend/src/db/migrations/faqDefaultPalladiumMarkdown.ts`
 * (константа FAQ_DEFAULT_PALLADIUM_MARKDOWN). Запуск: `node scripts/sync-faq-md-to-backend.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "FAQ.md");
const outPath = path.join(
  root,
  "backend/src/db/migrations/faqDefaultPalladiumMarkdown.ts"
);
const c = fs.readFileSync(mdPath, "utf8");
const head =
  "/**\n" +
  " * Дефолтный FAQ: держите в sync с FAQ.md (корень репо).\n" +
  " * Admin → Контент (content_faq_markdown) перекрывает при сохранении.\n" +
  " */\n";
fs.writeFileSync(outPath, `${head}export const FAQ_DEFAULT_PALLADIUM_MARKDOWN = ${JSON.stringify(c)};\n`);
console.log("OK:", outPath, `(${c.length} chars)`);
