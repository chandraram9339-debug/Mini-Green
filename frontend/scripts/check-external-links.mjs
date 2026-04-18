import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const envExamplePath = resolve(process.cwd(), ".env.example");

const REQUIRED_KEYS = [
  "VITE_CHANNEL_URL",
  "VITE_CHAT_URL",
  "VITE_YOUTUBE_URL",
  "VITE_SUPPORT_URL",
  "VITE_REFERRAL_URL",
];

const parseEnv = (content) => {
  const map = new Map();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const sepIndex = line.indexOf("=");
    if (sepIndex <= 0) continue;
    const key = line.slice(0, sepIndex).trim();
    const value = line.slice(sepIndex + 1).trim();
    map.set(key, value);
  }
  return map;
};

if (!existsSync(envExamplePath)) {
  console.error("Missing .env.example. Cannot validate external link env keys.");
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.warn("No .env file found. Copy .env.example to .env and fill production links.");
  process.exit(1);
}

const envMap = parseEnv(readFileSync(envPath, "utf8"));
const missing = REQUIRED_KEYS.filter((key) => {
  const value = envMap.get(key);
  return !value || value.length === 0 || value === "TODO";
});

if (missing.length > 0) {
  console.warn(`External links check FAILED. Missing keys: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("External links check PASSED. All required VITE_* link keys are set.");
