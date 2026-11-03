// A prototype of the track browser (#173) that can be clicked: every company's tracks of one product, grouped by company
// or by what the money is invested in, with a filter, a sort and a search that work. Reads the regulator's September 2026
// files and writes mockups.html beside this script, with the tracks of all six products inside it. Nothing is made up.
// The page itself is drawn in the browser by client.js. Run: node research/specs/2026-11-03-track-browser/gen.mjs
import { readFileSync, writeFileSync } from "node:fs";

const here = new URL(".", import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(`../../../data/cma/${f}`, here), "utf8"));
const css = readFileSync(new URL("mockups.css", here), "utf8");
const client = readFileSync(new URL("client.js", here), "utf8");
const files = [read("gemelnet@2026-09.json"), read("pensia-net@2026-09.json")];

// the six products, in the site's words, and the regulator's classification each one is (site/app/lib/data.server.ts)
const PRODUCTS = [
  { id: "provident-for-annuity", name: "תגמולים ואישית לפיצויים", cls: "תגמולים ואישית לפיצויים" },
  { id: "keren-hishtalmut", name: "קרן השתלמות", cls: "קרנות השתלמות" },
  { id: "kupat-gemel-lehashkaa", name: "קופת גמל להשקעה", cls: "קופת גמל להשקעה" },
  { id: "pension-comprehensive", name: "קרן חדשה מקיפה", cls: "קרנות חדשות" },
  { id: "pension-general", name: "קרן חדשה כללית", cls: "קרנות כלליות" },
  { id: "child-savings-provident", name: "חיסכון לכל ילד", cls: "קופת גמל להשקעה - חסכון לילד" },
];

const SHORT = {
  511880460: "אנליסט", 512065202: "מיטב", 512237744: "מגדל", 512244146: "כלל", 512245812: "מנורה מבטחים", 512267592: "הראל",
  513026484: "הפניקס", 513173393: "אלטשולר שחם", 513611509: "ילין לפידות", 513621110: "אינפיניטי", 514956465: "מור", 517085874: "איילון",
};
const shortName = (c) => SHORT[c.legal_id] ?? c.name.replace(/\s*בע["״]מ\s*/g, "").trim();
const num = (s) => (s === "" || s == null ? null : Number(s));
const r2 = (v) => (v == null || !isFinite(v) ? null : Math.round(v * 100) / 100);

const companies = [];
const coIndex = new Map();
const products = PRODUCTS.map((p) => {
  const funds = files.flatMap((f) => f.funds).filter((f) => f.fund_classification.trim() === p.cls);
  const rows = funds.map((f) => {
    const r = f.raw_fields;
    const assets = num(r.TOTAL_ASSETS);
    const name = shortName(f.managing_corporation);
    if (!coIndex.has(name)) coIndex.set(name, companies.push(name) - 1);
    // [fund id, company, name as written, sub-kind, kind, fee from savings, fee from deposits, stock %, currency %, assets (NIS m), 3y, 5y, opened]
    return [
      f.fund_id, coIndex.get(name), f.names.cma[0].trim(), f.sub_specialization.trim(), f.specialization.trim(),
      num(r.AVG_ANNUAL_MANAGEMENT_FEE), num(r.AVG_DEPOSIT_FEE),
      assets ? r2((num(r.STOCK_MARKET_EXPOSURE) / assets) * 100) : null, assets ? r2((num(r.FOREIGN_CURRENCY_EXPOSURE) / assets) * 100) : null,
      r2(assets), num(r.AVG_ANNUAL_YIELD_TRAILING_3YRS), num(r.AVG_ANNUAL_YIELD_TRAILING_5YRS), f.inception_date ?? "",
    ];
  });
  return { id: p.id, name: p.name, rows };
});
const data = { period: "2026-09", feeYear: 2025, companies, products };

// The page is published as an artifact: no doctype, html, head or body of its own (the host wraps it).
const html = `<title>אב טיפוס: כל המסלולים</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style>
<div class="doc" dir="rtl" lang="he">
<header class="doc-h">
  <h1>כל המסלולים בכל החברות: אב טיפוס</h1>
  <p class="muted small">אפשרות 2, עם תשואת העבר והגודל. הכול כאן עובד: המוצר, הקיבוץ, הסינון, המיון והחיפוש. כל המספרים מנתוני רשות שוק ההון לספטמבר 2026; אף מספר לא הומצא. הקישורים לעמודי החברה והמסלול לא פעילים באב הטיפוס.</p>
</header>
<div class="bar">
  <span class="small muted">גודל מסך</span>
  <div class="view" role="group" aria-label="גודל מסך"><button type="button" data-view="pc" aria-pressed="true">מחשב</button><button type="button" data-view="phone" aria-pressed="false">טלפון</button></div>
</div>
<div class="stage" id="stage"><div class="site" id="site"></div></div>
</div>
<script>const DATA = ${JSON.stringify(data)};</script>
<script>${client}</script>`;

writeFileSync(new URL("mockups.html", here), html);
console.log(`wrote mockups.html: ${products.map((p) => `${p.name} ${p.rows.length}`).join(", ")}; ${companies.length} companies; ${(html.length / 1024).toFixed(0)} KB`);
