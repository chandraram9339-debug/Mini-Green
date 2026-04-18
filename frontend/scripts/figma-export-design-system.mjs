/**
 * Выгрузка дизайн-системы из одного Figma-файла (Ready + UI Kit — два node id).
 *
 * Пишет только ответы REST API + CSS из Variables (без ручных значений в репо).
 *
 *   cd frontend && FIGMA_TOKEN=figd_... npm run figma:design-system
 *
 * Env:
 *   FIGMA_TOKEN      (обязательно)
 *   FIGMA_FILE_KEY   по умолчанию BBrbpnfGElX0afHLm7ccxP
 *
 * Эндпоинты:
 *   GET /v1/files/{key}/nodes?ids=1:3643,1:3075
 *   GET /v1/files/{key}/variables/local  (может вернуть 403 на не-Enterprise — см. лог)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_FILE_KEY = "BBrbpnfGElX0afHLm7ccxP";
const CANONICAL_NODE_IDS = ["1:3643", "1:3075"];

const token = process.env.FIGMA_TOKEN?.trim();
const fileKey = (process.env.FIGMA_FILE_KEY || DEFAULT_FILE_KEY).trim();

const designSystemDir = join(__dirname, "../src/design-system");
const generatedDir = join(designSystemDir, "generated");

const HEAD_COMMENT = `/**
 * AUTO-GENERATED — не править вручную.
 * Source file: https://www.figma.com/design/${fileKey}/figma-ui-ux--Copy-
 * Ready:  https://www.figma.com/design/${fileKey}/figma-ui-ux--Copy-?node-id=1-3643&m=dev
 * UI Kit: https://www.figma.com/design/${fileKey}/figma-ui-ux--Copy-?node-id=1-3075&m=dev
 * Endpoint: GET /v1/files/${fileKey}/variables/local
 * Generated: ${new Date().toISOString()}
 */
`;

if (!token) {
  console.error("Missing FIGMA_TOKEN.");
  process.exit(1);
}

mkdirSync(generatedDir, { recursive: true });

async function figmaFetch(path) {
  const url = `https://api.figma.com${path}`;
  const res = await fetch(url, { headers: { "X-Figma-Token": token } });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { _parseError: true, text: text.slice(0, 400) };
  }
  if (!res.ok) {
    const err = new Error(`Figma ${res.status} ${path}: ${text.slice(0, 500)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function figmaNameToCssCustomProp(name, codeSyntaxWeb) {
  const raw = (codeSyntaxWeb || "").trim();
  if (raw.startsWith("--")) return raw.split(/\s/)[0];
  const base = (name || "var")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\//g, "-")
    .replace(/-+/g, "-");
  return `--figma-${base}`;
}

function rgbaToCss(c) {
  if (!c || typeof c !== "object") return null;
  const r = Math.round((c.r ?? 0) * 255);
  const g = Math.round((c.g ?? 0) * 255);
  const b = Math.round((c.b ?? 0) * 255);
  const a = c.a ?? 1;
  if (a >= 1) {
    const hx = (n) => n.toString(16).padStart(2, "0");
    return `#${hx(r)}${hx(g)}${hx(b)}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const PX_SCOPES = new Set([
  "CORNER_RADIUS",
  "GAP",
  "WIDTH_HEIGHT",
  "FONT_SIZE",
  "STROKE_FLOAT",
  "EFFECT_FLOAT",
  "LETTER_SPACING",
  "PARAGRAPH_SPACING",
  "PARAGRAPH_INDENT",
]);

function floatToCss(value, scopes) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const sc = Array.isArray(scopes) ? scopes : [];
  if (sc.includes("OPACITY")) return String(value);
  if (sc.includes("LINE_HEIGHT") && value > 0 && value <= 3) return String(value);
  if (sc.some((s) => PX_SCOPES.has(s))) return `${value}px`;
  return String(value);
}

function resolveValue(raw, varsById, collections, stack) {
  if (raw == null) return { kind: "empty", css: null };
  if (typeof raw === "boolean") return { kind: "boolean", css: raw ? "1" : "0" };
  if (typeof raw === "string") return { kind: "string", css: JSON.stringify(raw) };
  if (typeof raw === "number") return { kind: "number", css: String(raw) };
  if (typeof raw === "object" && raw.type === "VARIABLE_ALIAS" && raw.id) {
    if (stack.includes(raw.id)) return { kind: "alias-cycle", css: null };
    const target = varsById[raw.id];
    if (!target) return { kind: "alias-missing", css: null };
    const coll = collections?.[target.variableCollectionId];
    const modeId = coll?.defaultModeId;
    if (!modeId) return { kind: "alias-no-mode", css: null };
    const next = target.valuesByMode?.[modeId];
    return resolveValue(next, varsById, collections, [...stack, raw.id]);
  }
  if (typeof raw === "object" && "r" in raw && "g" in raw && "b" in raw) {
    return { kind: "color", css: rgbaToCss(raw) };
  }
  return { kind: "unknown", css: null };
}

function buildVariablesCss(meta) {
  const varsById = meta.variables || {};
  const collections = meta.variableCollections || {};
  const lines = [":root {"];

  for (const v of Object.values(varsById)) {
    if (!v || typeof v !== "object" || !v.id) continue;
    if (v.deletedButReferenced) continue;
    const coll = collections[v.variableCollectionId];
    const modeId = coll?.defaultModeId;
    if (!modeId) continue;
    const rawVal = v.valuesByMode?.[modeId];
    const resolved = resolveValue(rawVal, varsById, collections, []);
    if (resolved.css == null || resolved.css === "") continue;

    const name = figmaNameToCssCustomProp(v.name, v.codeSyntax?.WEB);
    const type = v.resolvedType;

    if (type === "COLOR" && resolved.kind === "color") {
      lines.push(`  ${name}: ${resolved.css};`);
    } else if (type === "STRING" && resolved.kind === "string") {
      lines.push(`  ${name}: ${resolved.css};`);
    } else if (type === "FLOAT" && resolved.kind === "number") {
      const n = Number(resolved.css);
      const cssFloat = floatToCss(n, v.scopes);
      if (cssFloat != null) lines.push(`  ${name}: ${cssFloat};`);
    } else if (type === "BOOLEAN" && resolved.kind === "boolean") {
      lines.push(`  ${name}: ${resolved.css};`);
    }
  }

  lines.push("}");
  return lines.join("\n") + "\n";
}

async function main() {
  const nodesQuery = CANONICAL_NODE_IDS.map(encodeURIComponent).join(",");
  const nodesPath = `/v1/files/${fileKey}/nodes?ids=${nodesQuery}`;

  console.log(`File: ${fileKey}`);
  console.log(`Nodes: ${CANONICAL_NODE_IDS.join(", ")}`);

  const nodesJson = await figmaFetch(nodesPath);
  writeFileSync(join(generatedDir, "figma-nodes.raw.json"), JSON.stringify(nodesJson, null, 2), "utf8");
  console.log(`Wrote ${join(generatedDir, "figma-nodes.raw.json")}`);

  let variablesCss = `${HEAD_COMMENT}:root {}\n`;
  try {
    const varsPath = `/v1/files/${fileKey}/variables/local`;
    const varsJson = await figmaFetch(varsPath);
    writeFileSync(join(generatedDir, "figma-variables.raw.json"), JSON.stringify(varsJson, null, 2), "utf8");
    console.log(`Wrote ${join(generatedDir, "figma-variables.raw.json")}`);

    const meta = varsJson.meta;
    if (meta?.variables && meta?.variableCollections) {
      variablesCss = HEAD_COMMENT + buildVariablesCss(meta);
    }
  } catch (e) {
    console.warn(
      e.status === 403 || e.status === 401
        ? "variables/local недоступен (часто нужен Enterprise / права). Токены CSS не сгенерированы; см. figma-nodes.raw.json и README."
        : e.message,
    );
    writeFileSync(
      join(generatedDir, "figma-variables.raw.json"),
      JSON.stringify({ _error: String(e.message), status: e.status ?? null }, null, 2),
      "utf8",
    );
  }

  writeFileSync(join(generatedDir, "figma-tokens.css"), variablesCss, "utf8");
  console.log(`Wrote ${join(generatedDir, "figma-tokens.css")}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
