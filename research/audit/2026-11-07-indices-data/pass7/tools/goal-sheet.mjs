// Pass 7 item 3: on the goal page, open each computed figure until one sheet lists the variable fee charged by year, and shoot it.
// Usage (the goal is the long-term preset with 10,000 now, 500 a month and a 7% return, compared by product): node goal-sheet.mjs <base> <out.png>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
await page.goto(`${base}/goal`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
// the long-term preset, then the comparison by product: the securities account runs on the index way, the fund's fees among its inputs
await page.locator("button", { hasText: "הון לטווח ארוך" }).first().click();
await page.waitForTimeout(500);
await page.getByRole("textbox", { name: "סכום היום", exact: true }).fill("10000");
await page.getByRole("textbox", { name: "הפקדה חודשית", exact: true }).fill("500");
await page.getByRole("textbox", { name: "תשואה שנתית על החלק המושקע", exact: true }).fill("7");
await page.keyboard.press("Tab");
await page.waitForTimeout(500);
await page.locator("button[type=submit]", { hasText: "השוואה לפי מוצר" }).first().click();
await page.waitForURL(/compare/);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(2500);
console.log(page.url());
await page.screenshot({ path: out.replace(".png", "-page.png"), fullPage: true });
console.log((await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 2500));
const found = async () => {
  // the account's cost inside the fund (A-06 over the fund's lines): its sheet lists the variable fee, whose own sheet lists the years
  const fee = page.getByText("0.535%", { exact: true }).first();
  await fee.scrollIntoViewIfNeeded();
  await fee.click();
  await page.waitForTimeout(800);
  const sheet = () => page.locator(".sheet-panel, [role=dialog], [data-sheet]").last();
  console.log("sheet 1:", (await page.locator("body").innerText()).match(/העלות בתוך הקרן[\s\S]{0,600}/g)?.slice(-1)[0]?.replace(/\s+/g, " "));
  // the variable fee inside it (5122569 on these data): its own sheet, the years it averages
  await page.getByText("0.265%", { exact: true }).last().click();
  await page.waitForTimeout(800);
  const after = await page.locator("body").innerText();
  if (/שנגבו ב/.test(after)) { console.log("found\n", after.match(/דמי ניהול משתנים של הקרן[\s\S]{0,900}/g)?.slice(-1)[0]); return true; }
  return false;
};
if (await found()) await page.screenshot({ path: out }); else console.log("no sheet with the charged variable fee on /goal");
await browser.close();
