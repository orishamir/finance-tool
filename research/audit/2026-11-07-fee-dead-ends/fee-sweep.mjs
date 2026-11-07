// Fee page sweep (kept with its result, sweep.txt): every /fees/?wrapper= value and every guide's fee link, with no inputs and with typical inputs; screenshots.
//   BASE=http://127.0.0.1:4191/finance-tool node fee-sweep.mjs <out-dir>
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4191/finance-tool";
const OUT = process.argv[2];
mkdirSync(`${OUT}/shots`, { recursive: true });
const WRAPPERS = ["bank-deposit", "brokerage-account", "child-savings-bank", "child-savings-provident", "current-account", "ira-hishtalmut", "ira-provident", "keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "provident-for-annuity", "savings-plan", "government-bond", "makam", "money-market-fund-daily", "money-market-fund-renewable"];
const GUIDES = [...WRAPPERS, "limited-bond-fund", "mutual-funds"];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const PC = { viewport: { width: 1440, height: 900 }, locale: "he-IL" };
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: "he-IL" };

async function outcome(page) {
  await page.waitForTimeout(1500);
  return page.evaluate(() => {
    const main = document.querySelector("main") ?? document.body;
    const h2s = [...main.querySelectorAll("h2")].map((h) => h.textContent.trim());
    const note = [...main.querySelectorAll('[role="note"]')].map((n) => n.textContent.trim().replace(/\s+/g, " "));
    const lines = main.querySelectorAll("ol li").length;
    return { h2s, note, lines };
  });
}
const classify = (o) => (o.h2s.some((h) => /פירוט|העמלות לאורך|כמה כל עמלה|ההשפעה/.test(h)) || o.lines > 0 ? `result (${o.lines} list items)` : o.note.length ? `message: ${o.note.join(" | ")}` : `other: ${o.h2s.join(" / ")}`);

// typical inputs: entered through the page itself (the sheet), then kept for every page
async function typicalState() {
  const ctx = await browser.newContext(PC);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/fees/?wrapper=pension-comprehensive`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/shots/pension-comprehensive-empty-1440.png`, fullPage: true });
  await page.getByRole("button", { name: "הנחות נוספות" }).first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/shots/pension-comprehensive-sheet-empty-1440.png` });
  await page.getByRole("radio", { name: "שכירים" }).first().click().catch(async () => page.locator('button:has-text("שכירים")').first().click());
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/shots/pension-comprehensive-sheet-employment-1440.png` });
  await page.getByLabel(/^גיל/).first().fill("40");
  await page.getByLabel(/דמי הביטוח בקרן הפנסיה/).first().fill("0.3");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/shots/pension-comprehensive-sheet-filled-1440.png` });
  const state = await ctx.storageState();
  await ctx.close();
  return state;
}

const report = [];
const st = await typicalState();
writeFileSync(`${OUT}/typical-storage.json`, JSON.stringify(st));
for (const [label, opts] of [["no inputs", {}], ["typical (age 40, employee, insurance 0.3%)", { storageState: st }]]) {
  const ctx = await browser.newContext({ ...PC, ...opts });
  const page = await ctx.newPage();
  for (const id of WRAPPERS) {
    await page.goto(`${BASE}/fees/?wrapper=${id}`, { waitUntil: "networkidle" });
    report.push(`/fees/?wrapper=${id}\t${label}\t${classify(await outcome(page))}`);
  }
  await ctx.close();
}
// every guide's fee link
const ctx = await browser.newContext(PC);
const page = await ctx.newPage();
for (const id of GUIDES) {
  const res = await page.goto(`${BASE}/guide/${id}`, { waitUntil: "networkidle" });
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href*="fees?"]')].map((a) => a.getAttribute("href")));
  report.push(`/guide/${id}\tstatus ${res.status()}\tfee links: ${hrefs.length ? hrefs.join(", ") : "none"}`);
}
await ctx.close();
writeFileSync(`${OUT}/sweep.txt`, report.join("\n") + "\n");

// screenshots
async function shot(name, url, opts, storageState, act) {
  const c = await browser.newContext({ ...opts, ...(storageState ? { storageState } : {}) });
  const p = await c.newPage();
  await p.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  if (act) await act(p);
  await p.screenshot({ path: `${OUT}/shots/${name}-${opts.viewport.width}.png`, fullPage: true });
  await c.close();
}
const costSection = async (p) => p.locator("#cost").scrollIntoViewIfNeeded().catch(() => {});
for (const o of [PC, PHONE]) {
  await shot("pension-comprehensive-result", "/fees/?wrapper=pension-comprehensive", o, st);
  await shot("pension-general-result", "/fees/?wrapper=pension-general", o, st);
  await shot("pension-comprehensive-empty", "/fees/?wrapper=pension-comprehensive", o, null);
  await shot("money-market-fund-renewable", "/fees/?wrapper=money-market-fund-renewable", o, null);
  for (const g of ["ira-hishtalmut", "ira-provident", "child-savings-provident"]) await shot(`guide-${g}`, `/guide/${g}`, o, null, costSection);
  await shot("fees-ira-hishtalmut-direct", "/fees/?wrapper=ira-hishtalmut", o, null);
}
// the phone sheet with the fields
{
  const c = await browser.newContext({ ...PHONE });
  const p = await c.newPage();
  await p.goto(`${BASE}/fees/?wrapper=pension-comprehensive`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.getByRole("button", { name: "הנחות נוספות" }).first().click();
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/shots/pension-comprehensive-sheet-390.png` });
  await c.close();
}
await browser.close();
console.log(report.join("\n"));
