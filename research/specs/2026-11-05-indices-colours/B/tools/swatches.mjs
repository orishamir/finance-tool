// The swatch sheet: for each chart its colours with the site's Hebrew names and the validator's worst pairs, and one row
// with every hue family on the page and its one meaning. Run from the repository root after validate-all.mjs:
// node research/specs/2026-11-05-indices-colours/B/tools/swatches.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { B, X } from "./colours.mjs";
import { H } from "./vlib.mjs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url)), dir = join(here, "..");
const R = JSON.parse(readFileSync(join(here, "results.json"), "utf8"));
const nameOfHex = (h, ks) => ks.filter((k) => X[k] === h).map((k) => B[k][0]).join(" / ");
const worst = (s, ks) => { if (!s) return ""; const m = s.match(/(#[0-9a-f]{6})↔(#[0-9a-f]{6}) ΔE ([\d.]+) \((\w+)\)/); return m ? `${m[3]} (${m[4] === "normal" ? "רגיל" : m[4]}): ${nameOfHex(m[2], ks)} ↔ ${nameOfHex(m[1], ks)}` : s; };
const sw = (k, extra = "") => `<div class="s"><i style="background:${X[k]};${extra}"></i><b>${B[k][0]}</b><small>${B[k][1]} ${X[k]}</small></div>`;
const rows = [
  ["שורות החשבונות: פס העמלות ומקרא שלו (וגם בגיליון המחיר שלכם ובקטע בלי קרן)", ["trade", "custody", "fixed", "fx", "rest"], 0],
  ["כל הזוגות: נקודה לכל קרן, לפי סוג הקרן (עם הטבעת והמסגרת הלבנה)", ["ilTracking", "ilEtf", "taseForeign", "abroad", "best"], 4],
  ["כרטיס התוצאה: שתי הרצועות (שנתות לפי סוג הקרן, פס הטווח)", ["ilTracking", "ilEtf", "taseForeign", "band", "pick"], 5],
  ["תוויות הקרנות ושורת הסינון: רגילה, מבקשת משהו, כלל מס פתוח", ["chipNeutral", "chipCaution", "chipOpen"], 6],
];
let html = rows.map(([t, ks, i]) => `<section><h2>${t}</h2><div class="row">${ks.map((k) => sw(k)).join("")}</div>
  <p>הזוג החלש, ראייה רגילה: ${worst(R[i].normal, ks)} · עיוורון צבעים: ${worst(R[i].cvd, ks)} · ${R[i].pass ? "עובר" : "לא עובר"}</p></section>`).join("");
html += `<section><h2>עם נטרול מט״ח או בלי: הקרנות לפי שנה (צבע אחד, מלא מול חלול)</h2><div class="row">
  <div class="s"><i style="background:${X.hedgeBoth}"></i><b>בלי נטרול מט״ח</b><small>neutral-300 מלא</small></div>
  <div class="s"><i style="background:transparent;box-shadow:inset 0 0 0 2px ${X.hedgeBoth}"></i><b>עם נטרול מט״ח</b><small>neutral-300 חלול</small></div></div>
  <p>לא צבע מול צבע: הצורה (מלא מול חלול) נושאת את ההבדל, כמו הנקודה החלולה בכל הזוגות. המקרא כותב את המילים.</p></section>`;
html += `<section><h2>גיליון המחיר שלכם: רצועת התקופות (סדר בזמן, גוון אחד, מילים בכל קטע)</h2><div class="row">${["periodStart", "periodSome", "periodAfter"].map((k) => sw(k)).join("")}</div>
  <p>נבדק כסולם מסודר (--ordinal): ${R[7].pass ? "עובר" : "לא עובר"}, בהירות יורדת בצעדים של 0.08 ו־0.12, ניגוד 6.2:1 בקצה הכהה.</p></section>`;
const fam = [
  ["teal-300", "פעולה והבחירה שלכם ברשימות: קישור, כפתור, השורה שנבחרה"], ["blue-300", "מספר שהזנתם"], ["violet-400", "מספר מחושב (קו מנוקד)"],
  ["amber-400", "זהירות (עם סמל ומילים)"], ["red-400", "חסום: כלל מס פתוח 🔒, ושגיאת הזנה"], ["green-400", "חיובי (שמור, לא מצויר בעמוד)"],
  ["orange-500", "עמלות קנייה ומכירה"], ["gold-200", "דמי משמרת"], ["rose-300", "דמי ניהול חשבון"], ["magenta-400", "בחו״ל: המרת מטבע, וקרן שנקנית בחו״ל"],
  ["lime-300", "קרן מחקה ישראלית"], ["olive-500", "קרן סל ישראלית"], ["brown-600", "קרן חוץ בבורסה בתל אביב"], ["neutral-300", "בלי צבע: טקסט, תוויות, ראשי קבוצות, ★, טבעות, מלא/חלול, רצועות"],
];
const hx = (s) => (X[Object.keys(B).find((k) => B[k][1] === s)] ?? H(s));
html += `<section><h2>כל משפחות הצבע בעמוד, ולכל אחת משמעות אחת</h2><div class="row fam">${fam.map(([s, m]) => `<div class="s"><i style="background:${hx(s)}"></i><b>${m}</b><small>${s} ${hx(s)}</small></div>`).join("")}</div></section>`;
const page = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
body{margin:0;background:#171614;color:#f2f0ec;font-family:Heebo,Inter,Arial,sans-serif;width:1440px}
.wrap{padding:24px 32px;display:flex;flex-direction:column;gap:22px}h1{font-size:24px;margin:0}
section{border:1px solid #2e2c29;border-radius:10px;padding:14px 18px;background:#171614}h2{font-size:17px;margin:0 0 10px}
.row{display:flex;flex-wrap:wrap;gap:14px 22px}.s{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:180px}
.fam .s{width:300px}.s i{display:block;width:56px;height:28px;border-radius:4px}.s b{font-size:14px;font-weight:600;line-height:1.3}
.s small{font-size:12px;color:#a19e98;font-family:Inter,monospace;direction:ltr}p{margin:10px 0 0;font-size:14px;color:#c7c4be}
</style></head><body><div class="wrap"><h1>אפשרות B: צבע רק כשהוא מה שקוראים. משטח הכרטיס #171614, בודק הצבעים במצב כהה, כל הזוגות</h1>${html}</div></body></html>`;
writeFileSync(join(here, ".cache", "swatches.html"), page);
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(join(here, ".cache", "swatches.html")).href); await p.waitForTimeout(300);
await p.screenshot({ path: join(dir, "swatches.png"), fullPage: true });
await b.close(); console.log("wrote swatches.png");
