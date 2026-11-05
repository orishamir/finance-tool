// Three options for the fund list's columns, drawn on the live indices page (founder's question, 2026-11-05:
// "are you sure we show the interesting information in the table? maybe other columns would be better?").
// Each option edits the list in the page (DOM and CSS) with figures read from numbers.json (made by compute.ts from the
// site's own functions); no figure is typed here. Today's list is cropped first, then the option's.
// Run from the repository root: node research/specs/2026-11-05-fund-columns/draw-options.mjs
// Output: option{1,2,3}-{ta125-pc,sp500-pc,ta125-phone}.png (today on the right, the option on the left),
// the raw crops in raw/, and heights.json.
import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const DIR = "/home/ori/dev/finance-tool/research/specs/2026-11-05-fund-columns";
const RAW = `${DIR}/raw`;
fs.mkdirSync(RAW, { recursive: true });
const nums = JSON.parse(fs.readFileSync(`${DIR}/numbers.json`, "utf8"));
const LABEL = "קרנות על המדד";
const CHROME = "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";

// rows of one index at the account the page opens on, keyed by the row's data-pick-key
function rowsOf(id) {
  const ix = nums.indices.find((x) => x.id === id);
  const rows = ix.at[ix.accounts[0].id].rows;
  return rows.map((r) => ({
    id: r.id, fund: r.fund, feesTotal: r.fees?.total ?? null, counted: r.countedPct, from: r.countedFrom,
    beyond: r.countedPct != null && r.fees?.total != null ? Math.max(0, r.countedPct - r.fees.total) : 0,
    gap: r.gap, gapYears: r.gapYears, ranked: r.ranked,
  }));
}

async function open(browser, slug, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(8000);
  await page.goto("https://orishamir.github.io/finance-tool/indices/" + slug, { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]", { timeout: 20000 });
  await page.waitForTimeout(900);
  return page;
}

// heights: the list alone (its column head to the bottom of the nth row) and the whole card to that row
async function measure(page, n) {
  return page.evaluate(([label, n]) => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
    const card = g.closest("[class*='rounded']");
    const r = [...g.querySelectorAll("[role=radio]")];
    const last = r[Math.min(n, r.length) - 1].getBoundingClientRect();
    const top = (g.querySelector("[data-opt-headline]") ?? g.firstElementChild).getBoundingClientRect().top;
    return { list: Math.round(last.bottom - top), card: Math.round(last.bottom - card.getBoundingClientRect().top), cardAll: Math.round(card.getBoundingClientRect().height) };
  }, [LABEL, n]);
}
async function crop(page, n, path) {
  const box = await page.evaluate(([label, n]) => {
    const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === label);
    const card = g.closest("[class*='rounded']");
    const c = card.getBoundingClientRect();
    const r = [...g.querySelectorAll("[role=radio]")];
    const last = r[Math.min(n, r.length) - 1].getBoundingClientRect();
    return { x: c.x, y: c.y + scrollY, width: c.width, height: last.bottom - c.top };
  }, [LABEL, n]);
  await page.screenshot({ path, clip: { x: Math.max(0, box.x - 2), y: box.y - 2, width: box.width + 4, height: box.height + 4 }, fullPage: true });
}

// ---- the three options, applied inside the page
function apply(opt, rows) {
  const g = [...document.querySelectorAll("[role=radiogroup]")].find((x) => x.getAttribute("aria-label") === "קרנות על המדד");
  const phone = innerWidth < 768;
  const head = g.firstElementChild;
  const radios = [...g.querySelectorAll("[role=radio]")];
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
  const pct = (x) => "⁦" + x.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 3 }) + "%⁩";
  const years = (n) => (n === 1 ? "שנה אחת" : `${n} שנים`);
  const num = (txt, kind = "computed") => `<button type="button" class="num num-${kind} whitespace-nowrap"><bdi dir="ltr" class="whitespace-nowrap">${txt}</bdi></button>`;
  const setCols = (pc) => { for (const el of [head, ...radios]) el.style.setProperty("--pick-cols", pc); };
  // a line above the column head, in the head's own type
  const headline = (html) => { const d = document.createElement("div"); d.dataset.optHeadline = "1"; d.className = "px-4 pt-2 pb-1 text-xs text-muted-foreground leading-snug"; d.innerHTML = html; head.before(d); };
  const note = [...g.parentElement.querySelectorAll("span, p, div")].find((x) => x.children.length === 0 && x.textContent.startsWith("מול המדד:"));
  const gapHtml = (r) => r.querySelector(":scope > span:nth-child(3)")?.innerHTML ?? "";
  // the picked fund's card above the list gets the past gap, so it stays on the page when it leaves the rows
  const gapToCard = () => {
    const picked = radios.find((r) => r.getAttribute("aria-checked") === "true");
    const card = g.closest("[class*='rounded']").firstElementChild;
    const fees = [...card.querySelectorAll("div, span, p")].filter((x) => !x.closest("[aria-hidden=true]") && x.textContent.trim().startsWith("דמי ניהול:")).pop();
    const row = byId[picked.dataset.pickKey];
    const d = document.createElement(fees.tagName.toLowerCase());
    d.className = fees.className;
    d.innerHTML = row.gap == null ? `מול המדד: <span class="text-sm text-muted-foreground">אין שנה מלאה בדוחות</span>`
      : `מול המדד: ${num((row.gap > 0 ? "+" : row.gap < 0 ? "−" : "") + pct(Math.abs(row.gap)))} <span class="text-sm text-muted-foreground">בשנה · ${years(row.gapYears)}</span>`;
    fees.after(d);
  };
  const nameWrap = () => { for (const r of radios) { const n = r.children[1]?.firstElementChild; if (n) n.style.whiteSpace = "normal"; } };

  if (opt === 1) {
    nameWrap();
    head.children[2].textContent = "עלות בשנה";
    for (const r of radios) {
      const row = byId[r.dataset.pickKey]; if (!row) continue;
      const why = row.from === "reports" ? "לפי הדוחות" : "דמי ניהול";
      r.children[2].innerHTML = `<span class="flex flex-col leading-tight"><span class="font-semibold">${num(pct(row.counted))}</span><span class="text-xs text-muted-foreground whitespace-nowrap">${phone ? "עלות בשנה · " : ""}${why}</span></span>`;
    }
    gapToCard();
    if (note) note.textContent = "עלות בשנה: מה שהחישוב מוריד מהקרן בכל שנה. זה דמי הניהול שלה, ואם לפי הדוחות השנתיים היא פיגרה אחרי המדד ביותר מזה, הפיגור. קרן שהקדימה את המדד לא מקבלת על זה הנחה. הפיגור של הקרן שנבחרה כתוב למעלה, ליד דמי הניהול שלה.";
  }

  if (opt === 2) {
    setCols("minmax(0,1fr) 5rem 5.5rem 7rem");
    nameWrap();
    const h = document.createElement("span"); h.className = "max-md:hidden"; h.textContent = "דמי ניהול";
    head.children[2].before(h);
    headline("החישוב מוריד מכל קרן בכל שנה את הגבוה מבין שניים: דמי הניהול, או הפיגור אחרי המדד כשהוא גדול מהם. המספר שנספר בהיר, השני אפור.");
    for (const r of radios) {
      const row = byId[r.dataset.pickKey]; if (!row) continue;
      const feesCounted = row.from !== "reports";
      const dim = "opacity:.55;font-weight:400";
      const feesInner = `<span class="flex flex-col leading-tight"><span class="font-semibold" style="${feesCounted ? "" : dim}">${num(pct(row.feesTotal))}</span><span class="text-xs text-muted-foreground whitespace-nowrap">${phone ? "דמי ניהול" : "בשנה"}</span></span>`;
      const gapCell = r.children[2];
      const gapFig = gapCell.querySelector(".font-semibold"); if (gapFig && feesCounted) gapFig.style.cssText = dim;
      if (phone) {
        const sub = gapCell.querySelector(".text-xs"); if (sub && row.gap != null) sub.textContent = "מול המדד · " + years(row.gapYears);
        if (row.gap == null) gapCell.firstElementChild.textContent = "מול המדד: " + gapCell.textContent.trim();
        gapCell.innerHTML = `<span class="flex gap-6 items-start">${feesInner}<span>${gapCell.innerHTML}</span></span>`;
      } else {
        const f = document.createElement("span"); f.className = "self-center"; f.innerHTML = feesInner; gapCell.before(f);
      }
    }
    if (note) note.textContent = "דמי ניהול: קבועים, משתנים ונאמן יחד, לפי מסמכי הקרן. מול המדד: כמה הקרן הקדימה (+) או פיגרה (−) אחרי המדד שלה בשנה, בממוצע השנים המלאות בדוחות השנתיים שלה, אחרי כל ההוצאות. החישוב סופר את הגבוה מבין דמי הניהול והפיגור; קרן שהקדימה את המדד לא מקבלת על זה הנחה.";
  }

  if (opt === 3) {
    setCols("minmax(0,1fr) 10rem 8rem");
    nameWrap();
    head.children[2].textContent = "עלות בשנה";
    const scale = Math.max(...rows.filter((r) => r.ranked).map((r) => r.counted));
    const solid = "var(--palette-neutral-300)";
    const hatch = `repeating-linear-gradient(-45deg, ${solid} 0 2px, transparent 2px 5px)`;
    headline(`<span style="display:inline-flex;align-items:center;gap:6px"><span style="display:inline-block;width:14px;height:10px;background:${solid};border-radius:2px"></span>דמי ניהול</span><span style="display:inline-flex;align-items:center;gap:6px;margin-inline-start:16px"><span style="display:inline-block;width:14px;height:10px;background:${hatch};box-shadow:inset 0 0 0 1px ${solid};border-radius:2px"></span>פיגור אחרי המדד מעבר לדמי הניהול, לפי הדוחות</span>`);
    for (const r of radios) {
      const row = byId[r.dataset.pickKey]; if (!row) continue;
      const over = row.counted > scale;
      const f = Math.min(row.feesTotal, scale) / scale * 100, b = Math.min(row.beyond, Math.max(0, scale - row.feesTotal)) / scale * 100;
      const bar = `<div class="relative min-w-0" style="flex:1"><div class="flex h-3" title="${row.from === "reports" ? "דמי ניהול ופיגור לפי הדוחות" : "דמי ניהול"}">`
        + `<span style="width:${f}%;background:${solid};border-start-start-radius:2px;border-end-start-radius:2px"></span>`
        + (b > 0 ? `<span style="width:${b}%;background:${hatch};box-shadow:inset 0 0 0 1px ${solid}"></span>` : "")
        + (over ? `<span class="text-xs text-muted-foreground" style="margin-inline-start:2px;line-height:12px">⟵</span>` : "")
        + `</div></div>`;
      const cell = r.children[2];
      cell.className = "self-center flex items-center gap-2 min-w-0";
      if (phone) { cell.style.gridRow = "2"; cell.style.gridColumn = "2 / -1"; }
      cell.innerHTML = bar + `<span class="w-[3.5rem] shrink-0 text-sm font-semibold whitespace-nowrap">${num(pct(row.counted))}</span>`;
    }
    gapToCard();
    if (note) note.textContent = "עלות בשנה: מה שהחישוב מוריד מהקרן בכל שנה. זה דמי הניהול שלה, ואם לפי הדוחות השנתיים היא פיגרה אחרי המדד ביותר מזה, גם ההפרש (החלק המקווקו). קרן שהקדימה את המדד לא מקבלת על זה הנחה. הפיגור של הקרן שנבחרה כתוב למעלה, ליד דמי הניהול שלה.";
  }
}

const OPTIONS = {
  1: { title: "אפשרות 1 · עלות בשנה, ולידה מאיפה היא באה", choice: "בוחרים קרן לפי מה שהחישוב באמת מוריד ממנה בכל שנה: סדר העמודה הוא סדר השקלים, ושתי קרנות שיוצאות שוות מראות אותו מספר." },
  2: { title: "אפשרות 2 · דמי ניהול, מול המדד, לעומת הבחירה", choice: "משווים את דמי הניהול, המספר שמשווים בכל מקום, ליד הפיגור בעבר, ורואים איזה מהשניים קובע את המחיר של כל קרן." },
  3: { title: "אפשרות 3 · פס של העלות בשנה: דמי ניהול ופיגור מעבר להם", choice: "רואים בעין כמה כל קרן עולה בשנה, וכמה מזה כתוב במחירון שלה וכמה נשען על פיגור בדוחות, ובוחרים בהתאם." },
};
const VIEWS = [
  { key: "ta125-pc", slug: "ta125", id: "index-ta125", w: 1440, h: 900, rows: 6 },
  { key: "sp500-pc", slug: "sp500", id: "index-sp500", w: 1440, h: 900, rows: 9 },
  { key: "ta125-phone", slug: "ta125", id: "index-ta125", w: 390, h: 844, rows: 6 },
];

const browser = await chromium.launch({ executablePath: CHROME });
const heights = {};
for (const v of VIEWS) {
  const rows = rowsOf(v.id);
  for (const opt of [1, 2, 3]) {
    const page = await open(browser, v.slug, v.w, v.h);
    if (opt === 1) { heights[`today ${v.key}`] = { row6: await measure(page, 6), cropRows: v.rows }; await crop(page, v.rows, `${RAW}/today-${v.key}.png`); }
    await page.evaluate(([fn, opt, rows]) => { eval("(" + fn + ")")(opt, rows); }, [apply.toString(), opt, rows]);
    await page.waitForTimeout(250);
    heights[`option${opt} ${v.key}`] = { row6: await measure(page, 6) };
    await crop(page, v.rows, `${RAW}/option${opt}-${v.key}.png`);
    await page.close();
  }
}
fs.writeFileSync(`${DIR}/heights.json`, JSON.stringify(heights, null, 1));

// compose: the option's title and its one-line choice, then today (right) and the option (left), heights under each
const heebo = "/home/ori/dev/finance-tool/node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2";
const inter = "/home/ori/dev/finance-tool/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
const fmt = (n) => n.toLocaleString("he-IL");
for (const opt of [1, 2, 3]) for (const v of VIEWS) {
  const t = heights[`today ${v.key}`].row6, o = heights[`option${opt} ${v.key}`].row6;
  const fig = (cap, img, h, cls) => `<figure><figcaption class="${cls}">${cap}</figcaption><img src="file://${RAW}/${img}"><p>הרשימה עד השורה השישית: <b>${fmt(h.list)}</b> פיקסלים · הכרטיס עד השורה השישית: <b>${fmt(h.card)}</b> · כל הכרטיס: <b>${fmt(h.cardAll)}</b></p></figure>`;
  const html = `<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(file://${inter})}@font-face{font-family:Heebo;src:url(file://${heebo})}
body{margin:0;padding:24px;background:#161514;color:#e8e4df;font-family:Inter,Heebo,sans-serif;font-size:15px;width:max-content}
h1{font-size:20px;margin:0 0 6px}.choice{font-size:17px;margin:0 0 18px;color:#7fd6cf;max-width:${v.w > 400 ? 1500 : 720}px;line-height:1.5}
.row{display:flex;gap:28px;align-items:flex-start}figure{margin:0;max-width:${v.w > 400 ? 760 : 360}px}
figcaption{font-weight:600;font-size:16px;margin-bottom:6px;color:#b9b2aa}figcaption.new{color:#7fd6cf}
img{display:block;border:1px solid #333}p{margin:6px 0 0;color:#b9b2aa;font-variant-numeric:tabular-nums;font-size:13px;line-height:1.5}
</style><body><h1>${OPTIONS[opt].title} · ${v.slug === "ta125" ? "ת״א-125" : "S&amp;P 500"}${v.w < 400 ? " · טלפון 390" : ""}</h1>
<p class="choice">${OPTIONS[opt].choice}</p>
<div class="row">${fig("היום", `today-${v.key}.png`, t, "")}${fig(`אפשרות ${opt}`, `option${opt}-${v.key}.png`, o, "new")}</div></body></html>`;
  const f = `${RAW}/compose.html`; fs.writeFileSync(f, html);
  const p = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto("file://" + f); await p.waitForTimeout(400);
  await p.screenshot({ path: `${DIR}/option${opt}-${v.key}.png`, fullPage: true });
  await p.close(); fs.unlinkSync(f);
}
await browser.close();
console.log(JSON.stringify(heights, null, 1));
