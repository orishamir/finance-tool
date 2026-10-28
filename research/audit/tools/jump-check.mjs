// Jump check (2026-10-25, the founder: pressing "כרית ביטחון" removed a field above it and the page moved under the pointer).
// Presses every chip, switch, radio, tab, checkbox and disclosure on the main pages, one at a time on a fresh load, and
// reports each control that is not where it was after the press (something above it appeared or disappeared), and each
// press after which the page's text is the same as before ("still": the control changed nothing the reader can see, as
// the purpose chips did on the first page; some are fine, a choice that only acts later, so each needs a look), and each
// press after which the page is wider than the screen ("wide").
//
//   BASE=http://127.0.0.1:5200/finance-tool OUT_JSON=jumps-pc.json node research/audit/tools/jump-check.mjs pc [paths]
//
// BASE is a running copy of the site (a dev server, or the built site served under /finance-tool/); the second argument
// is "pc" (1280x900) or "phone" (390x844, touch); the optional third is a comma-separated list of paths. Playwright is
// not a repo dependency: PLAYWRIGHT_DIR points at a node_modules folder that holds it (the npx cache by default), and
// CHROME at a Chromium binary.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:5199/finance-tool";
const vpName = process.argv[2] ?? "pc";
const phone = vpName === "phone";
const SEL = "button[aria-pressed], [role=switch], [role=radio], [role=tab], input[type=checkbox], input[type=radio], button[aria-expanded], summary";
const MAX_PER_PAGE = 80;

let pages = ["/", "/goal", "/goal/compare", "/idle-cash", "/holdings", "/transfer", "/fees", "/rules", "/questions", "/parameters", "/documents", "/guide", "/guide/kupat-gemel-lehashkaa", "/guide/keren-hishtalmut", "/exposure/index-sp500", "/companies", "/workbench/tracks/kupat-gemel-lehashkaa", "/workbench/providers/brokerage-account", "/workbench/funds/index-sp500", "/not-covered"];
if (process.argv[3]) pages = process.argv[3].split(",");

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const ctx = await browser.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 900 }, locale: "he-IL", ...(phone ? { hasTouch: true, isMobile: true } : {}) });
// every press starts on a fresh load; the site would put back the scroll position of the previous load of the same page
await ctx.addInitScript(() => sessionStorage.removeItem("mekor.scroll"));
// the site scrolls smoothly; a reading taken while the page still glides would count the glide as a jump
await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: "html { scroll-behavior: auto !important; }" }))));
const page = await ctx.newPage();

const out = [];
// The first page and the goal form are checked twice: on a new device (the question card), then with a goal saved.
const fresh = pages.filter((p) => p === "/" || p === "/goal");
let seeded = false;
for (const [k, path] of [...fresh.map((p) => [0, p]), ...pages.map((p) => [1, p])]) {
  if (k === 1 && !seeded) {
    // A goal on the device, so the goal pages show their full content.
    await page.goto(`${BASE}/goal`);
    await page.waitForTimeout(1200);
    await page.getByLabel(/שם המטרה/).first().fill("בדיקה");
    await page.getByLabel(/^סכום היום|יש לכם היום/).first().fill("50000").catch(() => {});
    await page.waitForTimeout(500);
    seeded = true;
  }
  await page.goto(`${BASE}${path}`);
  await page.waitForTimeout(1200);
  const n = Math.min(await page.locator(SEL).count(), MAX_PER_PAGE);
  for (let i = 0; i < n; i++) {
    await page.goto(`${BASE}${path}`);
    await page.waitForTimeout(700);
    // a handle, not a locator: a locator's nth(i) is found again at every step, and a press that adds controls above would
    // make the second reading another control's
    const el = await page.locator(SEL).nth(i).elementHandle({ timeout: 1500 }).catch(() => null);
    if (!el || !(await el.isVisible().catch(() => false))) continue;
    const label = ((await el.getAttribute("aria-label")) || (await el.textContent()) || "").trim().replace(/\s+/g, " ").slice(0, 50);
    await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(150);
    const before = await el.boundingBox();
    if (!before) continue;
    const url = page.url();
    const textBefore = await page.evaluate(() => document.body.innerText);
    try {
      await el.click({ timeout: 1500 });
    } catch {
      continue;
    }
    await page.waitForTimeout(350);
    // a press that opens another page is not measured; one that only changes the query (a filter kept in the address) is
    if (new URL(page.url()).pathname !== new URL(url).pathname) continue;
    const after = await el.boundingBox().catch(() => null);
    const dy = after ? Math.round(after.y - before.y) : null;
    const dx = after ? Math.round(after.x - before.x) : null;
    const still = (await page.evaluate(() => document.body.innerText)) === textBefore;
    // "wide": after the press the page is wider than the screen (a table that pushed its column out, 2026-10-25)
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (!after || Math.abs(dy) > 2 || Math.abs(dx) > 2 || still || wide) out.push({ wide, path: k === 0 ? `${path} (new device)` : path, i, label, dy, dx, gone: !after, moved: !after || Math.abs(dy) > 2 || Math.abs(dx) > 2, still });
  }
  console.log(k === 0 ? `${path} (new device)` : path, "controls:", n);
}
writeFileSync(process.env.OUT_JSON ?? `jumps-${vpName}.json`, JSON.stringify(out, null, 1));
console.log("moved:", out.filter((x) => x.moved).length, "| changed no text:", out.filter((x) => x.still).length, "| wider than the screen:", out.filter((x) => x.wide).length);
await browser.close();
