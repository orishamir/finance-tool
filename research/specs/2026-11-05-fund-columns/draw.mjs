// Before and after crops of the indices page's fund list for the founder's question on its columns (2026-11-05).
// "After" swaps the column "מול המדד" (the past gap) for the yearly rate the calculation counts for the fund, and says what it rests on:
// the listed fees, or the shortfall in the fund's reports when it fell behind by more. The figures come from numbers.json (compute.ts).
// Run from the repository root: node research/specs/2026-11-05-fund-columns/draw.mjs. It reads the live page.
import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const DIR = "/home/ori/dev/finance-tool/research/specs/2026-11-05-fund-columns";
const nums = JSON.parse(fs.readFileSync(`${DIR}/numbers.json`, "utf8"));
const LABEL = "קרנות על המדד";

async function open(url, w, h) {
  const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]", { timeout: 20000 });
  await page.waitForTimeout(900);
  return { browser, page };
}
async function cardH(page) {
  return page.evaluate((label) => { const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label); return Math.round((g.closest("[class*='rounded']") ?? g.parentElement).getBoundingClientRect().height); }, LABEL);
}
async function crop(page, path) {
  const box = await page.evaluate((label) => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
    const card = g.closest("[class*='rounded']") ?? g.parentElement;
    const c = card.getBoundingClientRect();
    return { x: c.x, y: c.y + scrollY, width: c.width, height: c.height };
  }, LABEL);
  await page.screenshot({ path, clip: { x: Math.max(0, box.x - 2), y: box.y - 2, width: box.width + 4, height: box.height + 4 }, fullPage: true });
}

// the swap: head "מול המדד" becomes "עלות בשנה" at the same width; each row's cell shows the counted rate and what it rests on
async function swap(page, rows) {
  return page.evaluate(([label, rows]) => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
    const head = g.firstElementChild;
    const i = [...head.children].findIndex((c) => c.textContent.trim() === "מול המדד");
    head.children[i].textContent = "עלות בשנה";
    for (const el of g.querySelectorAll("*")) if (el.style && el.style.gridTemplateColumns && el.style.gridTemplateColumns.includes("5.5rem")) el.style.gridTemplateColumns = el.style.gridTemplateColumns.replace("5.5rem", "5.5rem");
    if (head.style.gridTemplateColumns?.includes("5.5rem")) head.style.gridTemplateColumns = head.style.gridTemplateColumns.replace("5.5rem", "5.5rem");
    const fmt = (x) => x.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 3 }) + "%";
    const years = (n) => (n === 1 ? "שנה אחת" : `${n} שנים`);
    let done = 0;
    for (const r of g.querySelectorAll("[role=radio]")) {
      const txt = r.innerText;
      const row = rows.find((x) => txt.includes(x.number) && txt.includes(x.fund.slice(0, 6)));
      if (!row) continue;
      const cell = r.children[i];
      const why = row.countedFrom === "reports" ? `פיגור · ${years(row.gapYears)}` : row.countedFrom === "fees" ? "דמי ניהול" : txt.includes("אין שנה מלאה") ? "אין שנה מלאה" : "עוד לא נאסף";
      cell.innerHTML = `<span class="flex flex-col leading-tight"><span class="font-semibold"><span class="num-computed" style="text-decoration:underline dotted;text-decoration-color:var(--computed);text-decoration-thickness:2px;text-underline-offset:4px">⁦${fmt(row.countedPct)}⁩</span></span><span class="text-xs text-muted-foreground whitespace-nowrap">${why}</span></span>`;
      done++;
    }
    // the note under the list says what the new column is
    const note = [...g.parentElement.querySelectorAll("span")].find((x) => x.textContent.startsWith("מול המדד:"));
    if (note) note.textContent = "עלות בשנה: מה שהחישוב מוריד מהקרן בכל שנה. זה דמי הניהול שלה, ואם בדוחות השנתיים היא פיגרה אחרי המדד יותר מזה, הפיגור. קרן שהקדימה את המדד לא מקבלת על זה הנחה.";
    return done;
  }, [LABEL, rows]);
}

const report = [];
for (const [slug, id] of [["ta125", "index-ta125"], ["sp500", "index-sp500"]]) {
  const ix = nums.indices.find((x) => x.id === id);
  const rows = ix.at[ix.accounts[0].id].rows;
  for (const [w, h, tag] of [[1440, 900, "pc"], [390, 844, "phone"]]) {
    const { browser, page } = await open("https://orishamir.github.io/finance-tool/indices/" + slug, w, h);
    const h0 = await cardH(page);
    await crop(page, `${DIR}/${slug}-${tag}-before.png`);
    const n = await swap(page, rows);
    await page.waitForTimeout(200);
    await crop(page, `${DIR}/${slug}-${tag}-after.png`);
    const h1 = await cardH(page);
    report.push({ slug, tag, rowsChanged: n, heightBefore: h0, heightAfter: h1 });
    await browser.close();
  }
}
console.log(JSON.stringify(report, null, 1));
