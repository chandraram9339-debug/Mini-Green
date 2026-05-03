/**
 * Захват PNG для public/trafik/screens/ с локального mini app (viewport 390×844).
 * Запуск: dev-сервер на 127.0.0.1:4297, затем:
 *   node scripts/capture-trafik-screens.mjs
 */
import fs from "node:fs";
import os from "node:os";
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/trafik/screens");
const BASE = process.env.TRAFIK_CAPTURE_BASE ?? "http://127.0.0.1:4297";

/** Полный Chromium (chrome-linux64/chrome), если установлен только playwright без headless-shell. */
function findBundledChromiumExecutable() {
  const envExe = process.env.PW_CHROMIUM_EXECUTABLE?.trim();
  if (envExe && fs.existsSync(envExe)) return envExe;
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    path.join(os.homedir(), ".cache/ms-playwright"),
    "/tmp/cursor-sandbox-cache/ebd7ac4c0d766ce8c65ba1035ffc24f1/playwright",
  ].filter(Boolean);
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    let dirs;
    try {
      dirs = fs.readdirSync(root).filter((d) => d.startsWith("chromium-"));
    } catch {
      continue;
    }
    for (const d of dirs) {
      const exe = path.join(root, d, "chrome-linux64", "chrome");
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

async function waitReady(page, ms = 1200) {
  await page.waitForTimeout(ms);
}

async function main() {
  const launchOpts = { headless: true };
  const chromeExe = findBundledChromiumExecutable();
  if (chromeExe) launchOpts.executablePath = chromeExe;
  const browser = await chromium.launch(launchOpts);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();

  // ── loading.png — Splash на cold load /home
  await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator(".fm-splash").first().waitFor({ state: "visible", timeout: 8000 });
  await page.screenshot({ path: path.join(OUT, "loading.png"), type: "png" });

  await page.locator(".fm-splash").first().waitFor({ state: "detached", timeout: 8000 });
  await waitReady(page, 400);

  // ── home.png
  await page.screenshot({ path: path.join(OUT, "home.png"), type: "png", fullPage: false });

  // ── dashboard.png — весь экран Trading
  await page.goto(`${BASE}/bot`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitReady(page, 2000);
  await page.screenshot({ path: path.join(OUT, "dashboard.png"), type: "png", fullPage: false });

  // ── chart.png — область вокруг SVG графика (viewBox 325×122 в коде экрана)
  await page.evaluate(() => {
    const svg = document.querySelector('svg[viewBox="0 0 325 122"]');
    let box = svg?.getBoundingClientRect();
    let el = svg?.parentElement;
    while (el && box && box.height < 140) {
      box = el.getBoundingClientRect();
      el = el.parentElement;
    }
    if (svg && box) {
      svg.scrollIntoView({ block: "center", inline: "nearest" });
    }
  });
  await waitReady(page, 300);
  const chartClip = await page.evaluate(() => {
    const svg = document.querySelector('svg[viewBox="0 0 325 122"]');
    if (!svg) return null;
    let el = svg;
    for (let i = 0; i < 6 && el; i += 1) {
      const r = el.getBoundingClientRect();
      if (r.height >= 130 && r.width >= 280) break;
      el = el.parentElement;
    }
    const r = (el ?? svg).getBoundingClientRect();
    const pad = 12;
    return {
      x: Math.max(0, r.x - pad),
      y: Math.max(0, r.y - pad),
      width: Math.min(390, r.width + pad * 2),
      height: Math.min(844, r.height + pad * 2 + 24),
    };
  });
  const clipRound = (c) =>
    c && Number.isFinite(c.width)
      ? {
          x: Math.max(0, Math.floor(c.x)),
          y: Math.max(0, Math.floor(c.y)),
          width: Math.min(390, Math.max(50, Math.floor(c.width))),
          height: Math.min(844, Math.max(50, Math.floor(c.height))),
        }
      : null;

  const chartRounded = clipRound(chartClip);
  if (chartRounded) {
    await page.screenshot({ path: path.join(OUT, "chart.png"), type: "png", clip: chartRounded });
  } else {
    await page.screenshot({ path: path.join(OUT, "chart.png"), type: "png", fullPage: false });
  }

  // ── trades.png — блок журнала (заголовок «Your trading history» или аналог i18n)
  await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h2")];
    const h = headings.find((el) =>
      /trading history|trading journal|historia|journal|deals/i.test(el.textContent ?? ""),
    );
    h?.scrollIntoView({ block: "center" });
  });
  await waitReady(page, 400);
  const tradesClip = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h2")];
    const h = headings.find((el) =>
      /trading history|trading journal|historia|journal|deals/i.test(el.textContent ?? ""),
    );
    if (!h) return null;
    const sec = h.closest("main") ?? h.parentElement?.parentElement;
    const r = (sec ?? h).getBoundingClientRect();
    const headBox = h.getBoundingClientRect();
    const top = Math.min(headBox.top, r.top);
    const bottom = Math.min(844, Math.max(r.bottom, headBox.bottom + 320));
    return {
      x: 0,
      y: Math.max(0, top - 8),
      width: 390,
      height: Math.min(844 - Math.max(0, top - 8), bottom - top + 16),
    };
  });
  const tradesRounded = clipRound(tradesClip);
  if (tradesRounded && tradesRounded.height > 80) {
    await page.screenshot({ path: path.join(OUT, "trades.png"), type: "png", clip: tradesRounded });
  } else {
    await page.screenshot({ path: path.join(OUT, "trades.png"), type: "png", fullPage: false });
  }

  // ── portfolio.png — Balance / deposit
  await page.goto(`${BASE}/balance/deposit`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitReady(page, 2000);
  await page.screenshot({ path: path.join(OUT, "portfolio.png"), type: "png", fullPage: false });

  // ── onboarding.png — FAQ
  await page.goto(`${BASE}/faq`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitReady(page, 1500);
  await page.screenshot({ path: path.join(OUT, "onboarding.png"), type: "png", fullPage: false });

  await browser.close();
  console.log(`Done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
