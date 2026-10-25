// Whole-page screenshots of a list of pages at 1280 and 390 px, with a saved goal, in two states: as loaded ("closed") and with
// every fold opened ("open"). Tall pages are cut into slices of 6000 px so nothing is lost to the 16384 px texture limit.
// usage: [MAX_SLICES=8] node shots.mjs <baseUrl> <outDir> <pagesFile> [onlyTag]   (MAX_SLICES caps the 6000 px slices per page and state)
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const [base, out, listFile, only] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const paths = readFileSync(listFile, "utf8").split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
const goal = { id: "gfounder", name: "", preset: "none", horizonYears: { value: 20, entered: true }, amountNow: { value: 6000, entered: true }, monthly: { value: 400, entered: true }, available: { value: 0, entered: true }, availableFrom: null, anytime: { value: false, entered: true },
  profile: { age: null, employment: null, salary: null, pension: { employer: null, employee: null }, hishtalmut: { employer: null, employee: null, yearly: null }, hasPension: null, hasHishtalmut: null },
  assumptions: { return: 7, inflation: 2, insurance: null, acceptedFall: null }, exposures: {}, order: 0 };
const day = "2026-10-25";
const val = (value, unit) => ({ value, unit, source: { url: "local", title: "הוזן על ידך", publisher: "אתם", strength: "entered" }, checked: day, effective_from: day, effective_to: null, update_rule: "founder", state: "entered" });
// HOLDING=1 adds one saved holding (a catalogued track), so the holdings card, its fee lines and the consolidation are drawn too
const holdings = process.env.HOLDING === "1" ? [{ id: "h1", wrapperId: "keren-hishtalmut", company: { name: "חברה לדוגמה", legalId: "510142789" }, track: { fundId: 233, name: "מסלול לדוגמה" }, balance: val(80000, "nis"), feeBalance: val(0.9, "pct_per_year"), feeDeposit: val(0, "pct_of_deposit"), statementDate: { ...val(0, "text"), value: "2026-06-30" }, order: 0 }] : [];
const state = { version: 3, goals: [goal], currentId: "gfounder", inputs: {}, holdings, uncatalogued: [], imports: [], savedComparisons: [] };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const report = [];
const slug = (p) => (p === "/" ? "home" : p.replace(/^\//, "").replace(/[\/?=&]/g, "_"));
async function shoot(page, file, w) {
  const h = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
  const slice = 6000;
  const n = Math.min(Math.ceil(h / slice), Number(process.env.MAX_SLICES || 1000));
  for (let i = 0; i < n; i++) {
    await page.screenshot({ path: `${file}_${i}.png`, fullPage: true, clip: { x: 0, y: i * slice, width: w, height: Math.min(slice, h - i * slice) } });
  }
  return { h, n };
}
for (const [w, h0, tag] of [[1280, 900, "pc"], [390, 844, "phone"]]) {
  if (only && only !== tag) continue;
  const ctx = await browser.newContext({ viewport: { width: w, height: h0 }, hasTouch: tag === "phone", locale: "he-IL", reducedMotion: "reduce" });
  await ctx.addInitScript((s) => { try { localStorage.setItem("mekor.v2.state", s); } catch {} }, JSON.stringify(state));
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(String(e)));
  for (const p of paths) {
    try {
      await page.goto(`${base}${p}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
      await page.waitForTimeout(2200);
      const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const a = await shoot(page, `${out}/${tag}_${slug(p)}_closed`, w);
      const nd = await page.evaluate(() => { const ds = [...document.querySelectorAll("details")]; ds.forEach((d) => (d.open = true)); return ds.length; });
      await page.waitForTimeout(600);
      const b = nd ? await shoot(page, `${out}/${tag}_${slug(p)}_open`, w) : { h: 0, n: 0 };
      report.push({ tag, p, closedH: a.h, closedN: a.n, openH: b.h, openN: b.n, details: nd, overflowX: over, errors: errs.splice(0).join(" | ").slice(0, 300) });
      console.log(tag, p, "h", a.h, "/", b.h, "details", nd, "overflowX", over);
    } catch (e) {
      report.push({ tag, p, error: String(e).slice(0, 200) });
      console.log(tag, p, "ERROR", String(e).slice(0, 120));
    }
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
