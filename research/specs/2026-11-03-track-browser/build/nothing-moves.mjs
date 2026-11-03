// Check 4: nothing moves. Changes the sort, the kind (and the sort with a kind chosen), the search and the product, and after each change compares
// the boxes of the controls (product chips, count line, search, kind chips, order line) and of the table's heads and columns
// with the boxes before it. A pixel of rounding is not a move. Reports every box that moved, per change.
//   node research/specs/2026-11-03-track-browser/build/nothing-moves.mjs     (the server: serve.mjs, port 4173)
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const VIEWS = { pc: { width: 1280, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true } };

const snapshot = () => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null; // not drawn at this width
    return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const out = {};
  const product = document.getElementById("tb-product");
  out["product label"] = box(product);
  [...document.querySelectorAll("[aria-labelledby=tb-product] button")].forEach((b, i) => (out[`product chip ${i + 1}`] = box(b)));
  const count = [...document.querySelectorAll("p")].find((p) => /מה זה/.test(p.textContent));
  out["count line (block)"] = box(count?.parentElement);
  out["search field"] = box(document.querySelector("input[placeholder='שם המסלול או החברה']"));
  out["kind label"] = box(document.getElementById("tb-kind"));
  [...document.querySelectorAll("[aria-labelledby=tb-kind] button")].forEach((b, i) => (out[`kind chip ${i + 1}`] = box(b)));
  const order = [...document.querySelectorAll("p")].find((p) => /מסודרות|ברשימה אחת/.test(p.textContent));
  out["order line (block)"] = box(order?.parentElement);
  const table = document.querySelector("table");
  out["table"] = box(table);
  [...document.querySelectorAll("thead th")].forEach((th, i) => (out[`table head ${i + 1}`] = box(th)));
  [...document.querySelectorAll("thead button")].forEach((b, i) => (out[`sort head button ${i + 1}`] = box(b)));
  // the first row's cells: their x and width are the columns'
  [...(document.querySelector("tbody tr:not(.grp-row)")?.children ?? [])].forEach((td, i) => (out[`column ${i + 1} (first row cell)`] = { ...box(td), y: 0, h: 0 }));
  return out;
};

const diff = (a, b, tol = 1) => {
  const moved = [];
  for (const k of Object.keys(a)) {
    if (!b[k] || !a[k]) continue;
    const d = ["x", "y", "w", "h"].filter((p) => Math.abs(a[k][p] - b[k][p]) > tol);
    if (d.length) moved.push(`${k}: ${d.map((p) => `${p} ${a[k][p]} -> ${b[k][p]}`).join(", ")}`);
  }
  return moved;
};

const browser = await chromium.launch({ executablePath: CHROME });
let total = 0;
for (const [name, view] of Object.entries(VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, hasTouch: view.hasTouch, isMobile: view.isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/tracks/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  console.log(`--- ${name} (${view.width} px)`);
  const change = async (label, act, { ignore = [] } = {}) => {
    const before = await page.evaluate(snapshot);
    await act();
    await page.waitForTimeout(700);
    const after = await page.evaluate(snapshot);
    const moved = diff(before, after).filter((m) => !ignore.some((re) => re.test(m)));
    total += moved.length;
    console.log(`${moved.length === 0 ? "ok   " : "MOVED"} ${label}${moved.length ? "\n       " + moved.join("\n       ") : ""}`);
  };
  const heads = ["המסלול", "מהחיסכון", "מההפקדות", "חשיפה למניות", "כסף מנוהל, סוף"];
  if (name === "pc") {
    for (const h of heads) await change(`press the head "${h}" (sort)`, () => page.locator("thead button", { hasText: h }).first().click());
    for (const h of heads) await change(`press the head "${h}" again (reverse)`, () => page.locator("thead button", { hasText: h }).first().click());
  } else {
    const sel = page.getByLabel("מיון", { exact: true });
    for (const id of ["name", "dep", "stock", "assets", "fee"]) await change(`sort select: ${id}`, () => sel.selectOption(id));
  }
  // a kind changes the count line and the order line text, never their boxes, nor the columns; the rows under them are what changes
  if (name === "pc") await change("kind chip: second", () => page.locator("[aria-labelledby=tb-kind] button").nth(2).click(), { ignore: [/^table:/] });
  else await change("kind select: second", () => page.locator("select").first().selectOption({ index: 2 }), { ignore: [/^table:/] });
  // with a kind chosen the list is one, and the sort orders it across the companies
  if (name === "pc") for (const h of ["מהחיסכון", "מהחיסכון", "המסלול"]) await change(`kind chosen, press the head "${h}"`, () => page.locator("thead button", { hasText: h }).first().click());
  else for (const id of ["stock", "fee"]) await change(`kind chosen, sort select: ${id}`, () => page.getByLabel("מיון", { exact: true }).selectOption(id));
  if (name === "pc") await change("kind chip: all", () => page.locator("[aria-labelledby=tb-kind] button").first().click(), { ignore: [/^table:/] });
  else await change("kind select: all", () => page.locator("select").first().selectOption({ index: 0 }), { ignore: [/^table:/] });
  await change("search: הראל", () => page.getByPlaceholder("שם המסלול או החברה").fill("הראל"), { ignore: [/^table:/] });
  await change("search cleared", () => page.getByPlaceholder("שם המסלול או החברה").fill(""), { ignore: [/^table:/] });
  await change("search with no result", () => page.getByPlaceholder("שם המסלול או החברה").fill("xyzxyz"), { ignore: [/^(table|column|table head|sort head)/] });
  await change("search cleared", () => page.getByPlaceholder("שם המסלול או החברה").fill(""), { ignore: [/^(table|column|table head|sort head)/] });
  // another product: the chips and the search stay; the kinds row and the list differ by product, so only what is above them is compared
  const above = (m) => !/^(kind|order|table|column|sort head|count line)/.test(m);
  for (const [text, label] of [["תגמולים ואישית", "provident for annuity"], ["קרן חדשה מקיפה", "pension comprehensive"], ["קופת גמל להשקעה", "investment fund"]]) {
    const before = await page.evaluate(snapshot);
    await page.locator("[aria-labelledby=tb-product] button", { hasText: text }).click();
    await page.waitForTimeout(900);
    const after = await page.evaluate(snapshot);
    const moved = diff(before, after).filter(above);
    const cols = Object.keys(before).filter((k) => /^table head/.test(k) && after[k] && before[k]);
    const colMoved = cols.filter((k) => Math.abs(before[k].x - after[k].x) > 1 || Math.abs(before[k].w - after[k].w) > 1);
    total += moved.length + colMoved.length;
    console.log(`${moved.length + colMoved.length === 0 ? "ok   " : "MOVED"} product -> ${label}: controls above the kinds row ${moved.length ? "moved: " + moved.join("; ") : "stay"}; table column heads ${colMoved.length ? "moved: " + colMoved.join("; ") : "keep their x and width"}`);
  }
  await ctx.close();
}
console.log(total === 0 ? "\nNothing moved." : `\n${total} box(es) moved.`);
await browser.close();
