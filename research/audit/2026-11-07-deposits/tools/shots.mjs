// Screenshots of the places the deposit branch's fix pass changed, at 1440 and 390 (2026-11-07).
//   node shots.mjs <baseUrl ending /finance-tool> <outDir> <prefix: before|after>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out, prefix] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const sizes = [{ w: 1440, h: 900, touch: false }, { w: 390, h: 844, touch: true }];
const log = [];
async function open(sz, path) {
  const ctx = await browser.newContext({ viewport: { width: sz.w, height: sz.h }, hasTouch: sz.touch, isMobile: sz.touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`${base}${path}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  return p;
}
async function el(p, sel, file) {
  const l = p.locator(sel).first();
  if (!(await l.count()) || !(await l.isVisible())) return log.push(`${file}: ${sel} not visible`);
  await l.scrollIntoViewIfNeeded();
  await l.screenshot({ path: `${out}/${file}` });
}
async function clipAround(p, loc, file, sz, above = 40, extra = 260) {
  if (!(await loc.count())) return log.push(`${file}: not found`);
  await loc.scrollIntoViewIfNeeded();
  await p.waitForTimeout(200);
  const b = await loc.boundingBox();
  await p.screenshot({ path: `${out}/${file}`, clip: { x: 0, y: Math.max(0, b.y - above), width: sz.w, height: Math.min(sz.h, b.height + above + extra) } });
}
for (const sz of sizes) {
  const s = sz.w;
  for (const [bank, ids] of [
    ["mizrahi-tefahot", ["mizrahi-tefahot-rimonim-yomi-prime-shana-287", "mizrahi-tefahot-litchi-kvua-shana-189", "mizrahi-tefahot-duvdevan-hodshi-kvua-shana-165"]],
    ["discount", ["discount-shana-kvua-kol-habankim-0513", "discount-kvua-leshana-mivtza-0183"]],
    ["hapoalim", ["hapoalim-win-win-leshana"]],
  ]) {
    const p = await open(sz, `/companies/${bank}`);
    await p.screenshot({ path: `${out}/${prefix}-${bank}-full-${s}.png`, fullPage: true });
    for (const id of ids) await el(p, `#product-${id}`, `${prefix}-card-${id.split("-").pop()}-${s}.png`);
    if (bank === "hapoalim") {
      const tax = p.locator("#product-hapoalim-win-win-leshana button.num").filter({ hasText: "שאלה פתוחה" }).first();
      if (await tax.count()) {
        await tax.scrollIntoViewIfNeeded();
        await tax.click();
        await p.waitForTimeout(700);
        await p.screenshot({ path: `${out}/${prefix}-winwin-tax-sheet-${s}.png` });
        await p.keyboard.press("Escape");
        await p.waitForTimeout(400);
      }
      const chip = p.locator("#product-hapoalim-win-win-leshana [data-label]").first();
      if (await chip.count()) {
        await chip.click();
        await p.waitForTimeout(700);
        await p.screenshot({ path: `${out}/${prefix}-kind-sheet-${s}.png` });
        await p.keyboard.press("Escape");
      }
    }
    if (bank === "mizrahi-tefahot") {
      const rate = p.locator("#product-mizrahi-tefahot-litchi-kvua-shana-189 button.num").nth(1);
      if (await rate.count()) {
        await rate.scrollIntoViewIfNeeded();
        await rate.click();
        await p.waitForTimeout(700);
        await p.screenshot({ path: `${out}/${prefix}-189-rate-sheet-${s}.png` });
        await p.keyboard.press("Escape");
      }
    }
    if (bank === "discount") {
      // the current account's folded conditions
      const group = p.locator("summary", { hasText: "עו״ש" }).first();
      if (await group.count()) {
        await group.click();
        await p.waitForTimeout(400);
        const fold = p.locator("#product-discount-current-account summary").first();
        if (await fold.count()) {
          await fold.click();
          await p.waitForTimeout(400);
        }
        await el(p, "#product-discount-current-account", `${prefix}-card-current-account-${s}.png`);
      }
    }
    await p.context().close();
  }
  // the bank-deposit guide
  let p = await open(sz, "/guide/bank-deposit");
  await p.screenshot({ path: `${out}/${prefix}-guide-full-${s}.png`, fullPage: true });
  await clipAround(p, p.locator("p", { hasText: "שבירת פיקדון לפני הזמן." }).first(), `${prefix}-guide-break-${s}.png`, sz);
  const list = p.locator("a", { hasText: "הרשימה" }).first();
  if (await list.count()) {
    await list.click();
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/${prefix}-guide-list-click-${s}.png` });
    log.push(`${s}: "(הרשימה)" present; #deposit-banks on the page: ${await p.locator("#deposit-banks").count()}`);
  } else log.push(`${s}: "(הרשימה)" absent`);
  await p.context().close();
  // the same guide with ?review: the held list and its link
  p = await open(sz, "/guide/bank-deposit/?review");
  await p.waitForSelector("#deposit-banks", { timeout: 10000 }).catch(() => log.push(`${s} ?review: the list did not appear`));
  await clipAround(p, p.locator("p", { hasText: "שבירת פיקדון לפני הזמן." }).first(), `${prefix}-guide-break-review-${s}.png`, sz);
  await clipAround(p, p.locator("#deposit-banks"), `${prefix}-guide-list-review-${s}.png`, sz, 20, 40);
  log.push(`${s} ?review: "(הרשימה)" ${await p.locator("a", { hasText: "הרשימה" }).count()}`);
  await p.context().close();
  // the money-market ladder's note
  p = await open(sz, "/guide/money-market-fund-daily");
  const note = p.locator("li", { hasText: "פיקדון לשנה:" }).first();
  await clipAround(p, note, `${prefix}-ladder-note-${s}.png`, sz, 200, 60);
  if (await note.count()) log.push(`${s} ladder note links: ${await note.locator("a").count()}`);
  await p.context().close();
}
console.log(log.join("\n"));
await browser.close();
