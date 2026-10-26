// On-screen check of the closed-questions branch (2026-10-26): each changed paragraph, an unblocked checklist row, the not-covered
// page and two question sheets, at 1280 and 390 px. Serve the build first (tools/serve.mjs, port 4236).
//   node research/specs/2026-10-26-closed-questions/tools/shots.mjs
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:4236/finance-tool";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`;

/** [name, path, a text inside the changed paragraph, optional action: "chip:<id>" opens that chip's sheet, "checks" shows every check] */
const SHOTS = [
  ["ira-hishtalmut-fee-cap", "/guide/ira-hishtalmut", "התקרה לדמי הניהול של קופה אישית היא"],
  ["ira-provident-exit", "/guide/ira-provident", "משיכה</span> שלא כדין ממוסה על כל הסכום"],
  ["ira-provident-fee-cap", "/guide/ira-provident", "התקרה לדמי הניהול של קופה אישית היא"],
  ["pension-comprehensive-exit", "/guide/pension-comprehensive", "משיכה שלא כדין לפני הפרישה ממוסה על כל הסכום"],
  ["pension-comprehensive-guarantee", "/guide/pension-comprehensive", "צמוד למדד, ונבדק כל חמש שנים"],
  ["pension-general-exit", "/guide/pension-general", "משיכה שלא כדין ממוסה על כל הסכום"],
  ["provident-for-annuity-exit", "/guide/provident-for-annuity", "משיכה שלא כדין ממוסה על כל הסכום"],
  ["index-sp500-hishtalmut", "/exposure/index-sp500", "מהרווח הנומינלי בניכוי עליית המדד"],
  ["index-ta125-tracks", "/exposure/index-ta125", "שם מתוך רשימת מסלולי ההשקעה"],
  ["index-ta125-min-order", "/exposure/index-ta125", "יחידת המסחר בקרן סל היא יחידה אחת"],
  ["general-track-list", "/exposure/general-track", "את המדיניות שכל שם מסלול מחייב"],
  ["government-bond-unlinked-floating", "/exposure/government-bond-unlinked", "הסדרות בריבית משתנה שמונפקות היום"],
  ["shekel-cash-track", "/exposure/shekel-cash", "הוא מחזיק נכסים שקליים לא צמודים"],
  ["current-account-basic-track", "/guide/current-account", "ובמסלול הבסיסי העמלה מוגבלת בצו"],
  ["current-account-loss-offset", "/guide/current-account", "לא מקוזז כנגד ריבית שהבנק משלם"],
  ["bank-deposit-loss-offset", "/guide/bank-deposit", "לא מקוזז כנגד ריבית על פיקדון"],
  ["savings-plan-loss-offset", "/guide/savings-plan", "לא מקוזז כנגד ריבית על תוכנית חיסכון"],
  ["kgl-60-brackets", "/guide/kupat-gemel-lehashkaa", "המס על הרווח במשיכה יכול להיות נמוך יותר"],
  ["current-account-checks", "/guide/current-account", "קיזוז הפסדים", "checks"],
  ["kgl-checks", "/guide/kupat-gemel-lehashkaa", "פטורים לפי גיל ושימוש", "checks"],
  ["not-covered-amendment-190", "/not-covered", "TXA OQ10"],
  ["sheet-closed-TXA-OQ10", "/not-covered", "TXA OQ10", "chip:TXA OQ10"],
  ["sheet-open-PEN-OQ7", "/guide/pension-comprehensive", "PEN OQ7", "chip:PEN OQ7"],
  ["sheet-rule-TXP-18", "/guide/pension-comprehensive", "משיכה שלא כדין לפני הפרישה ממוסה על כל הסכום", "chip:TXP-18"],
  ["switch-employer-step", "/switch/pension-comprehensive", "ודאו שהמעסיק מפקיד לקופה החדשה"],
];

const browser = await chromium.launch({ executablePath: CHROME });
const report = [];
for (const [vpName, viewport] of [["pc", { width: 1280, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, locale: "he-IL", deviceScaleFactor: 1, ...(vpName === "phone" ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.addInitScript(() => document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: "html { scroll-behavior: auto !important; }" }))));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const [name, path, text, action] of SHOTS) {
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
