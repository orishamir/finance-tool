// On-screen check of the closed-questions branch, second round (2026-10-26): each changed paragraph, an unblocked checklist row, the not-covered
// page and two question sheets, at 1280 and 390 px. Serve the build first (tools/serve.mjs, port 4236).
//   node research/specs/2026-10-26-closed-questions/tools/shots.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:4236/finance-tool";
const OUT = fileURLToPath(new URL("../../shots/", import.meta.url));
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`;

/** [name, path, a text inside the changed paragraph, optional action: "chip:<id>" opens that chip's sheet, "checks" shows every check] */
const SHOTS = [
  ["r2-government-bond-unlinked-what", "/exposure/government-bond-unlinked", "בסדרה בריבית משתנה הריבית מתעדכנת כל"],
  ["r2-government-bond-unlinked-series", "/exposure/government-bond-unlinked", "הסדרות בריבית קבועה שנמכרות היום"],
  ["r2-government-bond-unlinked-gov-oq4", "/exposure/government-bond-unlinked", "הסדרות בריבית קבועה שנמכרות היום", "chip:GOV OQ4"],
  ["r2-government-bond-cpi-falling-index", "/exposure/government-bond-cpi", "במכירה אחרי ירידת מדד"],
  ["r2-current-account-bank-35", "/guide/current-account", "צו חדש קבע תקרה לדמי כרטיס חיוב מיידי"],
  ["r2-current-account-card-date", "/guide/current-account", "צו חדש קבע תקרה לדמי כרטיס חיוב מיידי", "num:1.10.2026"],
  ["r2-ira-provident-exit", "/guide/ira-provident", "לפחות, על כל הסכום שמשולם"],
  ["r2-sheet-rule-TXP-18", "/guide/ira-provident", "לפחות, על כל הסכום שמשולם", "chip:TXP-18"],
  ["r2-bank-deposit-prime", "/guide/bank-deposit", "פיקדון צמוד פריים ממוסה כפיקדון לא צמוד"],
  ["r2-mmf-daily-payout", "/guide/money-market-fund-daily", "מגיע לחשבון לפי התקנות"],
  ["r2-mmf-daily-falling-index", "/guide/money-market-fund-daily", "אם המדד יורד בתקופת ההחזקה"],
  ["r2-mmf-renewable-payout", "/guide/money-market-fund-renewable", "כסף מפדיון במועד הקבוע מגיע לחשבון"],
  ["r2-rule-card-TXF-28", "/rules?ids=TXF-28#TXF-28", "אירלנד לא מנכה מס"],
];

const browser = await chromium.launch({ executablePath: CHROME });
const report = [];
for (const [vpName, viewport] of [["pc", { width: 1280, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, locale: "he-IL", deviceScaleFactor: 1, ...(vpName === "phone" ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: "html { scroll-behavior: auto !important; }" }))));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const [name, path, text, action] of SHOTS.filter((x) => !process.env.ONLY || x[0].includes(process.env.ONLY))) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    if (action === "checks") {
      await page.waitForTimeout(500);
      const all = page.getByText("הצגת כל הבדיקות").filter({ visible: true });
      if (await all.count()) await all.first().click();
      await page.waitForTimeout(400);
    }
    const snippet = text.replace(/<\/?span>/g, "");
    const find = () => page.getByText(snippet, { exact: false }).filter({ visible: true }).first();
    let target = find();
    if (!(await target.count())) {
      // the paragraph may sit in a closed fold: open the folds in the page's main and look again
      for (const b of await page.locator("main button[aria-expanded=false]").all()) await b.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(200);
      target = find();
    }
    if (!(await target.count())) {
      report.push(`${vpName} ${name}: TEXT NOT FOUND (${snippet})`);
      continue;
    }
    try {
      await target.scrollIntoViewIfNeeded({ timeout: 5000 });
      // bring the snippet itself (not the top of a long paragraph) to the middle of the screen
      await page.evaluate((needle) => {
        const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const i = n.textContent.indexOf(needle);
          if (i < 0) continue;
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, Math.min(n.textContent.length, i + needle.length));
          const rect = r.getBoundingClientRect();
          if (rect.height === 0) continue;
          window.scrollBy(0, rect.top - window.innerHeight / 2);
          return;
        }
      }, snippet.slice(0, 18));
      if (action?.startsWith("num:")) {
        const num = page.locator("button.num", { hasText: action.slice(4) }).filter({ visible: true }).first();
        await num.scrollIntoViewIfNeeded({ timeout: 5000 });
        await num.click({ timeout: 5000 });
        await page.waitForTimeout(400);
      }
      if (action?.startsWith("chip:")) {
        const id = action.slice(5);
        const chip = page.locator("button.rule-chip", { hasText: id }).filter({ visible: true }).first();
        await chip.scrollIntoViewIfNeeded({ timeout: 5000 });
        await chip.click({ timeout: 5000 });
        await page.waitForTimeout(400);
      }
    } catch (e) {
      report.push(`${vpName} ${name}: FAILED ${String(e).split("\n")[0]}`);
      continue;
    }
    await page.screenshot({ path: `${OUT}${name}-${vpName}.png` });
    report.push(`${vpName} ${name}: ok`);
  }
  if (errors.length) report.push(`${vpName} page errors: ${errors.join(" | ")}`);
  await ctx.close();
}
await browser.close();
console.log(report.join("\n"));
