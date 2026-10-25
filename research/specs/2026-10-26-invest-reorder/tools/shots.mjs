// node shots.mjs: photographs /invest pages at 1280 and 390 into ../shots, in parts under 1800 px.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = new URL("../shots/", import.meta.url).pathname;
const base = "http://127.0.0.1:4235/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
async function parts(page, name) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const w = page.viewportSize().width;
  let i = 0;
  for (let y = 0; y < h; y += 1700) {
    await page.screenshot({ path: `${out}${name}-${++i}.png`, clip: { x: 0, y, width: w, height: Math.min(1700, h - y) }, fullPage: true });
  }
  console.log(name, h, i);
}
async function open(page, path, broker) {
  await page.goto(base + path);
  if (broker) await page.evaluate((b) => { /* set later via select */ }, broker);
  await page.waitForSelector("#invest-houses", { timeout: 20000 });
}
for (const [w, tag] of [[1280, "d"], [390, "m"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, locale: "he-IL" });
  const page = await ctx.newPage();
  for (const id of ["index-ta35", "index-sp500"]) {
    await open(page, `/invest/${id}`);
    await parts(page, `${id}-${tag}`);
  }
  // a bank as the person's account
  await open(page, "/invest/index-sp500");
  await page.selectOption("select >> nth=0", "mizrahi-tefahot");
  await page.waitForTimeout(1500);
  await page.locator(`section[aria-labelledby="invest-houses"]`).screenshot({ path: `${out}bank-houses-${tag}.png` });
  await page.locator("#invest-funds-section").screenshot({ path: `${out}bank-funds-${tag}.png` });
  // a click on a house row
  await page.selectOption("select >> nth=0", "");
  await page.waitForTimeout(500);
  await page.locator(`section[aria-labelledby="invest-houses"] li`, { hasText: "לאומי" }).first().click({ position: { x: 20, y: 10 } });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}click-leumi-${tag}.png` });
  // a foreign house
  const f = page.locator(`section[aria-labelledby="invest-houses"] li`, { hasText: "Interactive Brokers" }).first();
  if (await f.count()) {
    await f.click({ position: { x: 20, y: 10 } });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}foreign-${tag}.png` });
  }
  // folds
  const folds = page.locator("details > summary");
  const n = await folds.count();
  for (let k = 0; k < n; k++) {
    const t = (await folds.nth(k).innerText()).trim();
    if (/מה כל בחירה שווה|קרן סל או קרן מחקה|מה עושים עכשיו/.test(t)) await folds.nth(k).click();
  }
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await parts(page, `folds-${tag}`);
  await ctx.close();
}
await browser.close();
