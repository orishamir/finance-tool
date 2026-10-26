// On-screen check of the follow-ups review round (2026-10-26): the pages the review fixes changed, at 1280 and 390 px, files prefixed r2-.
// Serve the build first: node research/specs/2026-10-26-followups/tools/serve.mjs site/build/client 4238
//   node research/specs/2026-10-26-followups/tools/shots-r2.mjs         (ONLY=<part of a name> to run some)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:4238/finance-tool";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`;

/**
 * [name, path, text to bring to the middle of the screen, steps before it]. A step is
 * { fill: label, value } (a number field by its label, committed with Enter), { click: text }, or { sheet: text } (opens the
 * number whose button holds that text, to show its sheet).
 */
const SHOTS = [
  ["kgl-callout-62", "/guide/kupat-gemel-lehashkaa", "החברה המנהלת מנכה במקור", [{ fill: "הגיל שלכם היום", value: "62" }]],
  ["kgl-lump-62", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }]],
  ["kgl-tax-sheet-62", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }, { sheetAfter: "מס" }]],
  ["kgl-tax-sheet-62-rules", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }, { sheetAfter: "מס" }, { scrollSheet: 0.55 }]],
  ["kgl-tax-sheet-62-flags", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }, { sheetAfter: "מס" }, { scrollSheet: 0.8 }]],
  ["kgl-tax-sheet-62-end", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }, { sheetAfter: "מס" }, { scrollSheet: 1 }]],
  ["kgl-net-sheet-62", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "62" }, { sheetAfter: "נשאר לכם" }]],
  ["kgl-tax-sheet-30", "/guide/kupat-gemel-lehashkaa", "נשאר לכם", [{ fill: "הגיל שלכם היום", value: "30" }, { sheetAfter: "מס" }]],
  ["child-savings-sentence", "/guide/child-savings-provident", "כל חברה קובעת שיעור משלה"],
  ["mmf-daily-custody-text", "/guide/money-market-fund-daily", "בבית השקעות שאינו בנק"],
];

const centre = (page, needle) =>
  page.evaluate((n) => {
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const i = t.textContent.indexOf(n);
      if (i < 0) continue;
      const r = document.createRange();
      r.setStart(t, i);
      r.setEnd(t, Math.min(t.textContent.length, i + n.length));
      const rect = r.getBoundingClientRect();
      if (rect.height === 0) continue;
      window.scrollBy(0, rect.top - window.innerHeight / 2);
      return true;
    }
    return false;
  }, needle);

const browser = await chromium.launch({ executablePath: CHROME });
const report = [];
for (const [vpName, viewport] of [["pc", { width: 1280, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const errors = [];
  for (const [name, path, text, steps = []] of SHOTS.filter((x) => !process.env.ONLY || x[0].includes(process.env.ONLY))) {
    // a fresh context for every shot: what one shot enters (an age, a rate) is saved on the device and must not reach the next
    const ctx = await browser.newContext({ viewport, locale: "he-IL", deviceScaleFactor: 1, ...(vpName === "phone" ? { hasTouch: true, isMobile: true } : {}) });
    await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: "html { scroll-behavior: auto !important; }" }))));
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${name}: ${String(e)}`));
    try {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      for (const step of steps) {
        if (step.fill) {
          let field = page.getByLabel(step.fill, { exact: false }).filter({ visible: true }).first();
          if (!(await field.count())) {
            for (const b of await page.locator("main button[aria-expanded=false]").all()) await b.click({ timeout: 2000 }).catch(() => {});
            await page.waitForTimeout(300);
            field = page.getByLabel(step.fill, { exact: false }).filter({ visible: true }).first();
          }
          if (!(await field.isVisible().catch(() => false)) || !(await field.scrollIntoViewIfNeeded({ timeout: 3000 }).then(() => true).catch(() => false))) {
            // on a phone the fields sit behind a chip that opens a sheet
            const chip = page.locator("button", { hasText: step.fill }).filter({ visible: true }).first();
            if (await chip.count()) {
              await chip.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
              await chip.click({ timeout: 5000 });
              await page.waitForTimeout(600);
            }
            field = page.getByLabel(step.fill, { exact: false }).filter({ visible: true }).first();
          }
          await field.fill(step.value);
          await field.press("Enter");
          await page.waitForTimeout(700);
        }
        if (step.scrollSheet) {
          await page.evaluate((f) => {
            for (const el of document.querySelectorAll("[role=dialog], dialog, [data-sheet]")) {
              const scroller = [el, ...el.querySelectorAll("*")].find((x) => x.scrollHeight > x.clientHeight + 4 && getComputedStyle(x).overflowY !== "visible");
              if (scroller) scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * f;
            }
          }, step.scrollSheet === true ? 1 : step.scrollSheet);
          await page.waitForTimeout(400);
        }
        if (step.key) {
          await page.keyboard.press(step.key);
          await page.waitForTimeout(500);
        }
        if (step.click) {
          // optional: a fold that is already open on this page or width has no such button
          const b = page.getByText(step.click, { exact: false }).filter({ visible: true }).first();
          if (await b.count()) {
            await b.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
            await b.click({ timeout: 5000 }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }
        if (step.sheetAfter) {
          // the number in the row whose label is this word, inside the lump-sum block
          const row = page.locator("dl div", { has: page.locator("dt", { hasText: new RegExp(`^${step.sheetAfter}$`) }) }).filter({ visible: true }).first();
          await row.locator("button").first().click({ timeout: 5000 });
          await page.waitForTimeout(600);
        }
      }
      let found = await centre(page, text);
      if (!found) {
        for (const b of await page.locator("main button[aria-expanded=false]").all()) await b.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(300);
        found = await centre(page, text);
      }
      if (!found) {
        report.push(`${vpName} ${name}: TEXT NOT FOUND (${text})`);
        continue;
      }
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}r2-${name}-${vpName}.png` });
      report.push(`${vpName} ${name}: ok`);
    } catch (e) {
      report.push(`${vpName} ${name}: FAILED ${String(e).split("\n")[0]}`);
    }
    await ctx.close();
  }
  if (errors.length) report.push(`${vpName} page errors: ${errors.join(" | ")}`);
}
await browser.close();
console.log(report.join("\n"));
