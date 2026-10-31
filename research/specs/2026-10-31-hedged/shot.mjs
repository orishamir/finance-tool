// Screenshots of mockups.html at 1440 and 390 px, full page. Prints horizontal overflow and console errors.
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, name, touch] of [
  [1440, 900, "mockups-1440.png", false],
  [390, 844, "mockups-390.png", true],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && console.log("console", m.text()));
  page.on("pageerror", (e) => console.log("pageerror", e.message));
  await page.goto(`file://${join(here, "mockups.html")}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(here, name), fullPage: true });
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [...document.querySelectorAll("main *")].filter((e) => e.getClientRects().length && e.getBoundingClientRect().right > vw + 1 && !e.closest("svg")).slice(0, 6).map((e) => `${e.tagName}.${e.className}`);
    return { scroll: document.documentElement.scrollWidth, vw, height: document.documentElement.scrollHeight, over, font: document.fonts.check("16px Heebo") };
  });
  console.log(name, JSON.stringify(r));
  // slices to look at, when a folder is given
  if (process.argv[2]) {
    const step = w > 500 ? 1300 : 1500;
    for (let y = 0, i = 0; y < r.height; y += step, i++) await page.screenshot({ path: join(process.argv[2], `${w}-${i}.png`), fullPage: true, clip: { x: 0, y, width: w, height: Math.min(step, r.height - y) } });
  }
  await ctx.close();
}
await browser.close();
