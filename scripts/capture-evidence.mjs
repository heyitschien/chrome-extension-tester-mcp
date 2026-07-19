#!/usr/bin/env node
/**
 * Capture real Playwright screenshots + console logs for recruiter/support evidence.
 * Mirrors the chrome-extension-tester-mcp tool loop:
 * launch_browser → take_extension_screenshot → get_browser_logs → close_browser
 *
 * Usage: node scripts/capture-evidence.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const shotsDir = path.join(root, "docs", "screenshots");
const evidenceDir = path.join(root, "docs", "evidence");

fs.mkdirSync(shotsDir, { recursive: true });
fs.mkdirSync(evidenceDir, { recursive: true });

async function getExtensionId(context) {
  // Prefer service worker URL (MV3)
  for (let i = 0; i < 40; i += 1) {
    const workers = context.serviceWorkers();
    for (const worker of workers) {
      const match = worker.url().match(/^chrome-extension:\/\/([^/]+)\//);
      if (match) return match[1];
    }
    const background = context.backgroundPages?.() ?? [];
    for (const page of background) {
      const match = page.url().match(/^chrome-extension:\/\/([^/]+)\//);
      if (match) return match[1];
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Could not resolve chrome-extension:// ID from service worker");
}

async function runScenario({
  name,
  extensionRel,
  screenshotName,
  navigateHome = true,
  openPopup = true,
  clickPing = false,
}) {
  const extensionPath = path.join(root, extensionRel);
  const userDataDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `cet-mcp-evidence-${name}-`)
  );
  const logs = [];

  console.error(`[INFO] Scenario: ${name}`);
  console.error(`[INFO] Extension: ${extensionPath}`);

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
    viewport: { width: 1280, height: 800 },
  });

  const attachLogs = (page) => {
    page.on("console", (msg) => {
      const entry = `[${msg.type()}] ${msg.text()}`;
      logs.push(entry);
      console.error(`[BROWSER LOG] ${entry}`);
    });
    page.on("pageerror", (err) => {
      const entry = `[pageerror] ${err.message}`;
      logs.push(entry);
      console.error(`[BROWSER LOG] ${entry}`);
    });
  };

  context.on("page", attachLogs);
  for (const page of context.pages()) attachLogs(page);

  const page = context.pages()[0] ?? (await context.newPage());
  attachLogs(page);

  if (navigateHome) {
    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(shotsDir, `${name}-browser-loaded.png`),
      fullPage: false,
    });
    console.error(`[INFO] Saved ${name}-browser-loaded.png`);
  }

  let popupPage = null;
  if (openPopup) {
    const extensionId = await getExtensionId(context);
    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    console.error(`[INFO] Opening popup: ${popupUrl}`);
    popupPage = await context.newPage();
    attachLogs(popupPage);
    await popupPage.setViewportSize({ width: 320, height: 220 });
    await popupPage.goto(popupUrl, { waitUntil: "domcontentloaded", timeout: 15000 }).catch((err) => {
      logs.push(`[navigation] ${err.message}`);
      console.error(`[WARN] popup navigation: ${err.message}`);
    });
    await popupPage.waitForTimeout(800);

    if (clickPing) {
      try {
        await popupPage.click("#ping", { timeout: 3000 });
        await popupPage.waitForTimeout(500);
      } catch (err) {
        logs.push(`[click] ${err.message}`);
      }
    }

    await popupPage.screenshot({
      path: path.join(shotsDir, screenshotName),
      fullPage: true,
    });
    console.error(`[INFO] Saved ${screenshotName}`);
  }

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });

  // Use .txt so evidence is not ignored by root *.log gitignore rule
  const logPath = path.join(evidenceDir, `${name}-console.txt`);
  const header = [
    `# ${name} console capture`,
    `Captured: ${new Date().toISOString()}`,
    `Extension: ${extensionRel}`,
    `Tool loop: launch_browser → take_extension_screenshot → get_browser_logs → close_browser`,
    "",
  ].join("\n");
  fs.writeFileSync(logPath, `${header}${logs.length ? logs.join("\n") : "(no console logs captured)"}\n`);
  console.error(`[INFO] Saved ${path.relative(root, logPath)}`);

  return { logs, logPath };
}

async function main() {
  const working = await runScenario({
    name: "working",
    extensionRel: "fixtures/sample-extension-working",
    screenshotName: "popup-working.png",
    clickPing: true,
  });

  const blank = await runScenario({
    name: "blank-popup",
    extensionRel: "fixtures/sample-extension-blank-popup",
    screenshotName: "blank-popup-repro.png",
  });

  const summary = {
    capturedAt: new Date().toISOString(),
    method:
      "Playwright persistent Chromium + --load-extension (same approach as MCP launch_browser)",
    artifacts: [
      "docs/screenshots/working-browser-loaded.png",
      "docs/screenshots/popup-working.png",
      "docs/screenshots/blank-popup-browser-loaded.png",
      "docs/screenshots/blank-popup-repro.png",
      "docs/evidence/working-console.txt",
      "docs/evidence/blank-popup-console.txt",
    ],
    blankPopupLogCount: blank.logs.length,
    workingLogCount: working.logs.length,
  };

  fs.writeFileSync(
    path.join(evidenceDir, "capture-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`
  );

  console.error("[INFO] Evidence capture complete");
  console.error(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
