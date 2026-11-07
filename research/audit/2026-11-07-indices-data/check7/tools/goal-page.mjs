// Independent check of pass 7, lens 1 on the goal comparison page: three goals (one with zero money, one huge, one ordinary), compared by
// product, each index chip pressed; watches for the error screen, uncaught errors and console errors. Usage: BASE=... node goal-page.mjs <out dir>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = process.env.BASE;
const [out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const errs = [];
for (const [now, monthly, ret] of [["10000", "500", "7"], ["0", "100", "0"], ["1000000000", "100000", "12"]]) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
  page.on("pageerror", (e) => errs.push(`${now}: pageerror ${e.message.slice(0, 200)}`));
  page.on("console", (m) => { if (m.type() === "error") errs.push(`${now}: console ${m.text().slice(0, 200)}`); });
  await page.goto(`${base}/goal`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.locator("button", { hasText: "הון לטווח ארוך" }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("textbox", { name: "סכום היום", exact: true }).fill(now);
  await page.getByRole("textbox", { name: "הפקדה חודשית", exact: true }).fill(monthly);
  await page.getByRole("textbox", { name: "תשואה שנתית על החלק המושקע", exact: true }).fill(ret);
  await page.keyboard.press("Tab");
  await page.waitForTimeout(400);
  await page.locator("button[type=submit]", { hasText: "השוואה לפי מוצר" }).first().click();
  await page.waitForURL(/compare/);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  const broke = await page.getByText("משהו השתבש").count();
  // the index chips, if the page offers them
  const chips = page.locator("button[aria-pressed], [role=radio]").filter({ hasText: /S&P|MSCI|ת״א|תל אביב|נאסד/ });
  const n = await chips.count();
  for (let i = 0; i < n; i++) { await chips.nth(i).click().catch(() => {}); await page.waitForTimeout(500); }
  const broke2 = await page.getByText("משהו השתבש").count();
  console.log(`goal ${now}/${monthly}/${ret}%: ${page.url().replace(base, "")} error screen ${broke}/${broke2}, ${n} index chips pressed`);
  await page.screenshot({ path: `${out}/goal-${now}.png` });
  await page.context().close();
}
console.log(errs.length ? errs.join("\n") : "no console or page errors");
await browser.close();
