// The held pages show their result only after input: fills the goal form and the idle-cash form, then saves whole-page shots
// and viewport slices.   node held.mjs <outDir> [pc|phone]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [outDir, w = "pc"] = process.argv.slice(2);
const V = w === "pc" ? { viewport: { width: 1440, height: 900 } } : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ ...V, locale: "he-IL" })).newPage();
const W = V.viewport.width, H = V.viewport.height;
const fill = async (label, v) => { const l = page.getByLabel(label, { exact: false }).first(); try { await l.fill(v, { timeout: 3000 }); await l.press("Tab"); console.log("filled", label); } catch { console.log("no field", label); } };
const shoot = async (name) => {
  await page.waitForTimeout(1500);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({ path: `${outDir}/${name}-${W}.png`, fullPage: true });
  for (let y = 0, i = 0; y < Math.min(h, 30000); y += H, i++)
    await page.screenshot({ path: `${outDir}/${name}-${W}-s${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 55, fullPage: true, clip: { x: 0, y, width: W, height: Math.min(H, h - y) } });
  console.log(name, h);
};
await page.goto(`${BASE}/goal`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await fill("כמה שנים עד המטרה", "12");
await fill("סכום היום", "50000");
await fill("הפקדה חודשית", "1000");
await fill("גיל", "35");
await page.getByRole("button", { name: "השוואה לפי מוצר" }).first().click().catch((e) => console.log("no compare button", e.message.slice(0, 80)));
await page.waitForTimeout(3000);
console.log("at", page.url());
await shoot("held-goal-compare");
await page.goto(`${BASE}/idle-cash`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await fill("כמה יש בעו", "40000");
await fill("כמה חייב להישאר", "10000");
await shoot("held-idle-cash");
// the deposit fee across a product's tracks: how many rows of the investment provident fund say the same
await page.goto(`${BASE}/tracks`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const dep = await page.evaluate(() => { const t = document.body.innerText; return { zero: (t.match(/0%\s*מההפקדות?/g) ?? []).length, all: (t.match(/מההפקדות?/g) ?? []).length }; });
console.log("tracks deposit-fee cells:", JSON.stringify(dep));
await browser.close();
