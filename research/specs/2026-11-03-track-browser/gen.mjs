// Drawings for the track browser (#173): every company's tracks of one product, three options, real numbers.
// Reads the regulator's September 2026 file and writes mockups.html beside this script. Nothing on the page is made up.
// Run: node research/specs/2026-11-03-track-browser/gen.mjs
import { readFileSync, writeFileSync } from "node:fs";

const here = new URL(".", import.meta.url);
const data = JSON.parse(readFileSync(new URL("../../../data/cma/gemelnet@2026-09.json", here), "utf8"));
const css = readFileSync(new URL("mockups.css", here), "utf8");

const SHORT = {
  511880460: "אנליסט", 512065202: "מיטב", 512237744: "מגדל", 512244146: "כלל", 512245812: "מנורה מבטחים", 512267592: "הראל",
  513026484: "הפניקס", 513173393: "אלטשולר שחם", 513611509: "ילין לפידות", 513621110: "אינפיניטי", 514956465: "מור", 517085874: "איילון",
};
const num = (s) => (s === "" || s == null ? null : Number(s));

const rows = data.funds
  .filter((f) => f.fund_classification === "קופת גמל להשקעה")
  .map((f) => {
    const r = f.raw_fields;
    const assets = num(r.TOTAL_ASSETS);
    return {
      id: f.fund_id,
      name: f.names.cma[0].trim(),
      company: SHORT[f.managing_corporation.legal_id],
      kind: f.specialization,
      sub: f.sub_specialization,
      fee: num(r.AVG_ANNUAL_MANAGEMENT_FEE),
      dep: num(r.AVG_DEPOSIT_FEE),
      stock: assets ? (num(r.STOCK_MARKET_EXPOSURE) / assets) * 100 : null,
      fx: assets ? (num(r.FOREIGN_CURRENCY_EXPOSURE) / assets) * 100 : null,
      assets,
      y3: num(r.AVG_ANNUAL_YIELD_TRAILING_3YRS),
      y5: num(r.AVG_ANNUAL_YIELD_TRAILING_5YRS),
      isNew: !!f.inception_date && Number(f.inception_date.slice(0, 4)) >= 2025,
    };
  });

const byFee = (a, b) => (a.fee ?? 99) - (b.fee ?? 99) || (a.dep ?? 99) - (b.dep ?? 99) || a.company.localeCompare(b.company, "he");
const median = (xs) => { const s = xs.filter((x) => x != null).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };

const groupMap = new Map();
for (const r of rows) (groupMap.get(r.sub) ?? groupMap.set(r.sub, []).get(r.sub)).push(r);
// groups from the highest stock share to the lowest (median over the group's tracks), ties by size
const groups = [...groupMap.entries()]
  .map(([sub, list]) => ({ sub, kind: list[0].kind, list: list.sort(byFee), stock: median(list.map((r) => r.stock)) }))
  .sort((a, b) => b.stock - a.stock || b.list.length - a.list.length);
const companies = new Set(rows.map((r) => r.company)).size;

// ---- formatting ----
const n = (s, cls = "") => `<span class="n ${cls}">${s}</span>`;
const pct2 = (v) => (v === 0 ? "0%" : `${v.toFixed(2)}%`);
const signed = (v) => (v < 0 ? `−${Math.abs(v).toFixed(2)}%` : `${v.toFixed(2)}%`);
const clock = `<svg class="clock" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.6V8l2.3 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const sourced = (s, stale = false) => `${stale ? clock : ""}${n(s, "s")}`;
const computedNum = (s, stale = true) => `<span class="fig">${stale ? clock : ""}${n(s, "c")}</span>`;
const money = (m) => `<span class="fig">${clock}${m >= 1000 ? `${n((m / 1000).toLocaleString("he-IL", { maximumFractionDigits: 1 }), "s")} מיליארד ₪` : `${n(Math.round(m).toLocaleString("he-IL"), "s")} מיליון ₪`}</span>`;

function rings(stock, fx, size = 30) {
  const c = size / 2;
  const ring = (r, frac, cls) => {
    const len = 2 * Math.PI * r;
    const f = Math.max(0, Math.min(1, (frac ?? 0) / 100));
    return `<circle cx="${c}" cy="${c}" r="${r}" class="ring-bg"/><circle cx="${c}" cy="${c}" r="${r}" class="${cls}" stroke-dasharray="${(f * len).toFixed(2)} ${len.toFixed(2)}" transform="rotate(-90 ${c} ${c})"/>`;
  };
  return `<svg class="rings" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${ring(c - 3, stock, "ring-stock")}${ring(c - 8, fx, "ring-fx")}</svg>`;
}

const feeCell = (r) =>
  r.fee == null
    ? `<span class="muted small">עוד לא דווח</span>`
    : `<span class="fig">${sourced(pct2(r.fee))}<span class="w">מהחיסכון</span></span><span class="fig">${sourced(pct2(r.dep ?? 0))}<span class="w">מההפקדות</span></span>`;
const exposureCell = (r) =>
  `<span class="expo">${rings(r.stock, r.fx)}<span class="expo-g"><span class="lbl"><i class="sw sw-stock"></i>מניות</span>${computedNum(`${Math.round(r.stock)}%`)}<span class="lbl"><i class="sw sw-fx"></i>מט״ח</span>${computedNum(`${Math.round(r.fx)}%`)}</span></span>`;
const yieldCell = (r) =>
  `<span class="fig">${r.y3 == null ? `<span class="muted small">פחות מ־3 שנים</span>` : `${sourced(signed(r.y3), true)}<span class="w">3 שנים</span>`}</span><span class="fig">${r.y5 == null ? `<span class="muted small">פחות מ־5 שנים</span>` : `${sourced(signed(r.y5), true)}<span class="w">5 שנים</span>`}</span>`;
const chev = `<span class="chev" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const tags = (r, withKind) => {
  const t = [];
  if (r.isNew) t.push(`<span class="tag">חדש</span>`);
  if (withKind) t.push(`<span class="tag kind">${r.sub}</span>`);
  return t.length ? `<span class="tags">${t.join("")}</span>` : "";
};
const nameCell = (r, withKind) => `<span class="nm"><a class="tname">${r.name}</a>${tags(r, withKind)}</span>`;

function groupHead(g, cols) {
  const fees = g.list.map((r) => r.fee).filter((v) => v != null);
  const range = fees.length ? `דמי ניהול מהחיסכון: מ־${n(pct2(Math.min(...fees)), "s")} עד ${n(pct2(Math.max(...fees)), "s")}` : "דמי ניהול עוד לא דווחו";
  const count = g.list.length === 1 ? "מסלול אחד" : `${g.list.length} מסלולים`;
  return `<tr class="grp"><th colspan="${cols}" scope="rowgroup"><span class="grp-t">${g.sub}</span><span class="grp-l">${g.kind} · ${count} · ${range}</span></th></tr>`;
}

// ---- one table (PC) and one list (phone) ----
function table({ list, groups: gs, withKind = false, withPast = false, tail = "" }) {
  const cols = 5 + (withPast ? 2 : 0);
  const head = `<thead><tr><th class="c-name">שם המסלול, כמו שהחברה כותבת אותו</th><th class="c-id">קופה</th><th class="c-fee">דמי ניהול, ממוצע 2025</th><th class="c-exp">חשיפה בסוף ספטמבר 2026</th>${withPast ? `<th class="c-y">תשואה שנתית ממוצעת, לפני דמי ניהול</th><th class="c-a">נכסים בסוף ספטמבר 2026</th>` : ""}<th class="c-open"><span class="sr">פתיחה</span></th></tr></thead>`;
  const row = (r) =>
    `<tr><td>${nameCell(r, withKind)}</td><td>${n(r.id, "id")}</td><td><span class="figs">${feeCell(r)}</span></td><td>${exposureCell(r)}</td>${withPast ? `<td><span class="figs">${yieldCell(r)}</span></td><td>${money(r.assets)}</td>` : ""}<td>${chev}</td></tr>`;
  const body = gs ? gs.map((g) => `<tbody>${groupHead(g, cols)}${g.list.map(row).join("")}</tbody>`).join("") : `<tbody>${list.map(row).join("")}</tbody>`;
  return `<div class="pc"><table class="fixed${withPast ? " past" : ""}">${head}${body}${tail ? `<tbody><tr class="more"><td colspan="${cols}">${tail}</td></tr></tbody>` : ""}</table></div>`;
}

function phone({ list, groups: gs, withKind = false, withPast = false, tail = "" }) {
  const row = (r) => `<div class="prow"><div class="pmain">${nameCell(r, withKind)}<span class="pline">${r.fee == null ? `<span class="muted small">דמי ניהול עוד לא דווחו</span>` : `<span class="fig">${sourced(pct2(r.fee))}<span class="w">מהחיסכון</span></span><span class="fig">${sourced(pct2(r.dep ?? 0))}<span class="w">מההפקדות</span></span>`}<span class="fig pid"><span class="w">קופה</span>${n(r.id, "id")}</span></span><span class="pline">${exposureCell(r)}</span>${withPast ? `<span class="pline">${yieldCell(r)}</span><span class="pline"><span class="w">נכסים</span>${money(r.assets)}</span>` : ""}</div>${chev}</div>`;
  const grp = (g) => {
    const fees = g.list.map((r) => r.fee).filter((v) => v != null);
    return `<div class="pgrp"><span class="grp-t">${g.sub}</span><span class="grp-l">${g.list.length} מסלולים · מ־${n(pct2(Math.min(...fees)), "s")} עד ${n(pct2(Math.max(...fees)), "s")} מהחיסכון</span></div>${g.list.map(row).join("")}`;
  };
  return `<div class="ph">${gs ? gs.map(grp).join("") : list.map(row).join("")}${tail ? `<p class="more">${tail}</p>` : ""}</div>`;
}

// ---- the page around the list ----
const PRODUCTS = [["תגמולים ואישית לפיצויים", 182], ["קרן השתלמות", 154], ["קופת גמל להשקעה", 143], ["קרן חדשה מקיפה", 139], ["קרן חדשה כללית", 131], ["חיסכון לכל ילד", 41]];
function frame(inner, { sortPast = false } = {}) {
  const prod = PRODUCTS.map(([p, c]) => `<span class="ix${p === "קופת גמל להשקעה" ? " on" : ""}">${p} <span class="cnt">${c}</span></span>`).join("");
  const kinds = [`<span class="ix on">הכול <span class="cnt">${rows.length}</span></span>`, ...groups.map((g) => `<span class="ix">${g.sub} <span class="cnt">${g.list.length}</span></span>`)].join("");
  const sorts = ["דמי ניהול מהחיסכון", "דמי ניהול מההפקדות", "חשיפה למניות", "שם החברה"].map((s, i) => `<span class="seg${i === 0 ? " on" : ""}">${s}</span>`).join("");
  return `<div class="site">
  <nav class="nav"><b>מקור</b><span>מדריכים</span><span>חוקים וכללים</span><span>שאלות</span><span class="on">חברות ומסלולים</span><span>השקעה במדד</span></nav>
  <div class="tabs"><span>לפי חברה</span><span class="on">לפי מוצר</span></div>
  <header class="ph-head">
    <h2 class="h1">כל המסלולים בכל החברות</h2>
    <p class="muted lead">בוחרים מוצר ורואים את המסלולים של כל החברות שמנהלות אותו, לפי במה הכסף מושקע. דמי הניהול הם הממוצע שנגבה בפועל ב־${n("2025")}; החשיפה נכונה לסוף ספטמבר ${n("2026")}. מנתוני רשות שוק ההון.</p>
  </header>
  <div class="ctl"><span class="ctl-l">מוצר</span><div class="chips">${prod}</div></div>
  <p class="small muted">${n(String(rows.length))} מסלולים של ${n(String(companies))} חברות. <a class="link">מה זה קופת גמל להשקעה</a></p>
  <div class="ctl pc-only"><span class="ctl-l">במה הכסף מושקע</span><div class="chips">${kinds}</div></div>
  <div class="ctl-row pc-only"><div class="ctl"><span class="ctl-l">מיון לפי</span><div class="segs">${sorts}</div></div><span class="search">חיפוש בשם המסלול</span></div>
  <div class="ph-ctl"><label class="field"><span class="ctl-l">במה הכסף מושקע</span><span class="select">הכול (${rows.length})<i>▾</i></span></label><label class="field"><span class="ctl-l">מיון לפי</span><span class="select">דמי ניהול מהחיסכון<i>▾</i></span></label></div>
  ${inner}
</div>`;
}

// ---- the three options ----
const shown = groups.slice(0, 3);
const restA = groups.slice(3).map((g) => `${g.sub} (${g.list.length})`).join(" · ");
const optA = frame(
  `<p class="small muted">הקבוצות מסודרות מהחשיפה למניות הגבוהה לנמוכה; בתוך כל קבוצה מהזול ליקר.</p>${table({ groups: shown, tail: `<span class="note">בציור בלבד, כדי לקצר: אחרי שלוש הקבוצות האלה באות עוד ${groups.length - 3}, פתוחות באותו אופן: ${restA}.</span>` })}${phone({ groups: shown.slice(0, 1), tail: `<span class="note">בציור בלבד: אחרי הקבוצה הזאת באות עוד ${groups.length - 1}.</span>` })}`,
);

const flat = [...rows].sort(byFee);
const top = flat.slice(0, 14);
const optB = frame(table({ list: top, withKind: true, tail: `<span class="note">בציור בלבד, כדי לקצר: עוד ${rows.length - top.length} מסלולים.</span>` }) + phone({ list: top.slice(0, 6), withKind: true, tail: `<span class="note">בציור בלבד: עוד ${rows.length - 6} מסלולים.</span>` }));

const sp = groups.find((g) => g.sub.includes("s&p"));
const optC = frame(
  `${table({ groups: [sp], withPast: true })}${phone({ groups: [sp], withPast: true })}<p class="small muted past-note">התשואה היא תשואת עבר כמו שהרשות מפרסמת אותה: לפני דמי הניהול ולפני מס. היא לא אומרת מה יקרה בהמשך, ולכן הרשימה לא ממוינת לפיה.</p>`,
);

// ---- numbers quoted in the notes, from the same rows ----
const b0 = top[0], b3 = top[3];
const feeAll = rows.map((r) => r.fee).filter((v) => v != null);
const blanks = rows.filter((r) => r.fee == null).length;
const spRange = sp.list.map((r) => r.fee).filter((v) => v != null);
const spY3 = sp.list.filter((r) => r.y3 != null).length, spY5 = sp.list.filter((r) => r.y5 != null).length;

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>כל המסלולים בכל החברות: אפשרויות</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body><main class="doc">
<header class="doc-h">
  <h1>כל המסלולים בכל החברות: שלוש אפשרויות</h1>
  <p class="muted">קופת גמל להשקעה: ${n(String(rows.length))} מסלולים של ${n(String(companies))} חברות, מנתוני רשות שוק ההון לספטמבר ${n("2026")}. כל מספר כאן אמיתי; אף מספר לא הומצא.</p>
  <ul class="small">
    <li><b>משותף לשלוש:</b> התפריט "חברות ומסלולים" מוביל לשתי לשוניות, לפי חברה (העמוד של היום) ולפי מוצר (העמוד הזה), וכל אחד משישת המדריכים מקשר לכאן. המוצר מתחלף במקום. השורה היא השורה של עמוד החברה. יורדים פס המטרה השמורה, עמודת ההתאמה, הלשונית "לפי ספק" והמתג למסלולים סגורים.</li>
    <li><b>מה שהנתונים מראים:</b> דמי הניהול מהחיסכון בכל ${n(String(feeAll.length))} המסלולים שדיווחו נעים רק בין ${n(pct2(Math.min(...feeAll)))} ל־${n(pct2(Math.max(...feeAll)))}, וכל סוג השקעה חוצה כמעט את כל הטווח. מה שבאמת מבדיל בין המסלולים הוא במה הכסף מושקע. ${n(String(blanks))} מסלולים חדשים עוד לא דיווחו דמי ניהול, והם בסוף כל קבוצה.</li>
    <li><b>בשתי הקרנות החדשות</b> (מקיפה וכללית) הרשות לא מסווגת מסלולים, ולכן שם אין קבוצות: רשימה אחת מהזול ליקר, והחשיפה מבדילה ביניהם. האתר לא מנחש סוג מהשם.</li>
  </ul>
</header>

<section class="option">
  <div class="opt-h"><h2>א. קבוצה לכל סוג השקעה</h2><span class="tag rec">מומלץ</span></div>
  <p class="muted small opt-p">כל הקבוצות פתוחות, לפי הסיווג של הרשות, ובתוך כל קבוצה מהזול ליקר. כך כל השוואה היא בין מסלולים שמשקיעים באותו דבר, ורק החברה משתנה. עמודת "במה הכסף מושקע" יורדת, כי בתוך קבוצה היא זהה בכל שורה; שם הקבוצה אומר אותה פעם אחת, עם הטווח של דמי הניהול בה.</p>
  ${optA}
</section>

<section class="option">
  <div class="opt-h"><h2>ב. רשימה אחת מהזול ליקר</h2></div>
  <p class="muted small opt-p">כל ${n(String(rows.length))} המסלולים ברשימה אחת, וסוג ההשקעה כתווית בכל שורה. פשוט יותר, אבל בראש הרשימה עומדים זה ליד זה מסלולים שמחזיקים דברים שונים: ${b0.sub} ב־${n(pct2(b0.fee))} עם ${n(Math.round(b0.stock) + "%")} מניות, ומתחתיו ${b3.sub} ב־${n(pct2(b3.fee))} עם ${n(Math.round(b3.stock) + "%")} מניות. ההבדל בדמי הניהול קטן בהרבה מההבדל במה שהם מחזיקים.</p>
  ${optB}
</section>

<section class="option">
  <div class="opt-h"><h2>ג. כמו א׳, ועוד תשואת עבר וגודל</h2><span class="tag">השאלה הפתוחה על תשואה וגודל</span></div>
  <p class="muted small opt-p">קבוצה אחת מאפשרות א׳ (${sp.sub}, ${n(String(sp.list.length))} מסלולים) עם שתי עמודות נוספות מאותו קובץ של הרשות: תשואה שנתית ממוצעת לשלוש ולחמש שנים, ונכסי המסלול. ${n(String(spY3))} מתוך ${n(String(sp.list.length))} המסלולים בקבוצה הזאת קיימים שלוש שנים, ו־${n(String(spY5))} חמש. הרשימה עדיין ממוינת לפי דמי הניהול.</p>
  ${optC}
</section>
</main></body></html>`;

writeFileSync(new URL("mockups.html", here), html);
console.log(`wrote mockups.html: ${rows.length} tracks, ${groups.length} groups; first groups ${shown.map((g) => g.sub).join(", ")}; S&P fees ${Math.min(...spRange)}-${Math.max(...spRange)}`);
