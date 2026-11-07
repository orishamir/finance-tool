// Independent check of pass 7, lens 1: on the built site, every index at three plans, every fund row tapped in turn (its gap figure left
// alone), and the page watched for its error screen, uncaught errors and console errors (the rounding guard logs on the site).
// Usage: BASE=http://127.0.0.1:4823/finance-tool node crash.mjs
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = process.env.BASE;
const idx = (process.env.IDX ?? "msci-acwi,sp500,msci-world,nasdaq100,ta35,ta90,ta125").split(",");
const plans = [
  { "סכום היום": 125000, "הפקדה חודשית": 2500, "שנים": 11, "תשואה בשנה": 3 },
  { "סכום היום": 0, "הפקדה חודשית": 0, "שנים": 1, "תשואה בשנה": 0 },
  { "סכום היום": 1000000000000, "הפקדה חודשית": 1000000, "שנים": 80, "תשואה בשנה": -50 },
];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(`pageerror: ${e.message.slice(0, 200)}`));
page.on("console", (m) => { if (m.type() === "error") errs.push(`console: ${m.text().slice(0, 200)}`); });
let bad = 0, taps = 0;
for (const ix of idx) for (const plan of plans) {
  await page.goto(`${base}/indices/${ix}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  for (const [label, v] of Object.entries(plan)) { const f = page.getByLabel(label, { exact: true }).first(); await f.fill(String(v)); await f.press("Tab"); }
  await page.waitForTimeout(1200);
  // open the phone-only folds and "show all" buttons, then every fund row
  const keys = await page.evaluate(() => [...new Set([...document.querySelectorAll('[role="radiogroup"] [role="radio"][data-pick-key]')].filter((r) => r.offsetParent && !r.closest("[data-total]")).map((r) => r.getAttribute("data-pick-key")))]);
  for (const key of keys) {
    const row = page.locator(`[role="radio"][data-pick-key="${key}"]:visible`).first();
    if (!(await row.count())) continue;
    errs.length = 0;
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await row.click({ position: { x: 8, y: 8 } }).catch(() => {});
    await page.waitForTimeout(250);
    taps++;
    const broke = await page.getByText("משהו השתבש").count();
    if (broke || errs.length) { bad++; console.log(`BAD ${ix} ${JSON.stringify(plan)} tap ${key}: ${broke ? "ERROR SCREEN " : ""}${[...new Set(errs)].join(" | ")}`); if (broke) break; }
  }
  console.log(`${ix} ${JSON.stringify(Object.values(plan))}: ${keys.length} rows tapped`);
}
await browser.close();
console.log(bad ? `${bad} problems in ${taps} taps` : `no error in ${taps} taps`);
