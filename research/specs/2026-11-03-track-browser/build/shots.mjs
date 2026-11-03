// Screenshots of the track browser at 1280 and 390 px (check 3 of the brief), into this folder.
//   node research/specs/2026-11-03-track-browser/build/shots.mjs [only]     (the server: serve.mjs, port 4173)
// Each shot of the page starts at the product chips and runs down through the controls into the first rows of the list.
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(process.env.PLAYWRIGHT_DIR ?? "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4173/finance-tool";
const CHROME = process.env.CHROME ?? "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
const out = new URL("./", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const only = process.argv[2];

const VIEWS = { pc: { width: 1280, height: 900, span: 1700 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true, span: 2400 } };
const products = ["provident-for-annuity", "keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "child-savings-provident"];

const browser = await chromium.launch({ executablePath: CHROME });
for (const [name, view] of Object.entries(VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: view.width, height: view.height }, hasTouch: view.hasTouch, isMobile: view.isMobile, locale: "he-IL" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`pageerror (${name}):`, e.message));
  const go = async (path) => {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
  };
  const shot = async (file, opts = {}) => {
    if (only && !file.includes(only)) return;
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${out}${name}-${file}.png`, ...opts });
  };
  /** From the top of the product chips down `span` px (the controls and the first rows). */
  const shotPage = async (file, span = view.span) => {
    const y = await page.evaluate(() => Math.max(0, Math.round(document.getElementById("tb-product")?.getBoundingClientRect().top + scrollY - 12)));
    await shot(file, { fullPage: true, clip: { x: 0, y, width: view.width, height: span } });
  };
  /** The list's first rows with the head row, as the page is scrolled to them. */
  const shotList = async (file) => {
    await page.evaluate(() => (document.querySelector("table") ?? document.querySelector(".track"))?.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, name === "pc" ? -80 : -70), name);
    await shot(file);
  };

  await go("/tracks");
  await shot("tracks", { fullPage: false });
  await shot("tracks-full", { fullPage: true });
  for (const p of products) {
    await go(`/tracks/${p}`);
    await shotPage(`product-${p}`);
  }
  // the grouping by kind, a kind filter, a search with no result, and each sort
  await go("/tracks/kupat-gemel-lehashkaa");
  await page.getByRole("button", { name: "במה הכסף מושקע", exact: true }).click();
  await shotPage("group-kind");
  await shotList("group-kind-list");
  await go("/tracks/kupat-gemel-lehashkaa");
  const chip = page.locator("[aria-labelledby=tb-kind] button").nth(2);
  if (await chip.isVisible().catch(() => false)) await chip.click();
  else await page.locator("select").first().selectOption({ index: 2 });
  await shotPage("kind-filter");
  await go("/tracks/kupat-gemel-lehashkaa");
  await page.getByPlaceholder("שם המסלול או החברה").fill("xyzxyz");
  await page.waitForTimeout(300);
  await shotPage("search-none", view.span / 2);
  await go("/tracks/kupat-gemel-lehashkaa");
  if (name === "pc") {
    for (const [id, label] of [["name", "המסלול"], ["fee", "מהחיסכון"], ["dep", "מההפקדות"], ["stock", "חשיפה למניות"], ["assets", "כסף מנוהל, סוף"]]) {
      await page.locator("thead button", { hasText: label }).first().click();
      await shotList(`sort-${id}`);
    }
    // the head row stays under the site's header while the table scrolls
    await page.evaluate(() => window.scrollTo(0, document.querySelector("table").getBoundingClientRect().top + scrollY + 1500));
    await shot("sticky-head");
  } else {
    const sel = page.getByLabel("מיון בתוך כל קבוצה");
    for (const id of ["name", "fee", "dep", "stock", "assets"]) {
      await sel.selectOption(id);
      await shotList(`sort-${id}`);
    }
  }
  await go("/companies");
  await shot("companies");
  await go("/guide/kupat-gemel-lehashkaa");
  await page.evaluate(() => document.getElementById("who")?.scrollIntoView({ block: "start" }));
  await shot("guide-kupat-gemel");
  await ctx.close();
}
await browser.close();
