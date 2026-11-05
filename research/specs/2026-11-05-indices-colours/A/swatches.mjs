// The swatch sheet: per chart its colours with their Hebrew names and the validator's worst pairs; then the page's hue families.
// node research/specs/2026-11-05-indices-colours/A/swatches.mjs (after validate-all.mjs) -> A/swatches.html, A/swatches.png
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "node:fs";
import { H, check, CARD, POP, SEL } from "./lib.mjs";
import { A } from "./option.mjs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const dir = new URL(".", import.meta.url).pathname;
const sw = (step, he, shape = "box") => `<div class="sw"><i class="${shape}" style="${shape === "hollow" ? `border:2px solid ${H(step)}` : `background:${H(step)}`}"></i><b>${he}</b><code>${step} ${H(step)}</code></div>`;
const row = (title, items, steps, surface, pairs, note = "") => {
  const r = steps.length > 1 ? check(steps, { surface, pairs }) : null;
  const v = r ? `ΔE רגיל ${r.normal.toFixed(1)} <bdi dir="ltr">(${r.normalPair})</bdi> · עיוורון צבעים ${r.cvd.toFixed(1)} ${r.cvdKind} <bdi dir="ltr">(${r.cvdPair})</bdi> · ${r.normal >= 15 ? (r.cvd >= 8 ? "עובר" : "עובר, CVD ברצועת 6–8 עם מילה וסמל על הסימון") : "נכשל"}` : "צבע אחד: אין זוג צבעים לבדוק";
  return `<section style="background:${surface}"><h2>${title}</h2><div class="row">${items}</div><p class="v">${v}<span class="s"> · משטח ${surface} · ${pairs === "all" ? "כל הזוגות" : "שכנים"}</span></p>${note ? `<p class="note">${note}</p>` : ""}</section>`;
};
const fee = A.fee.map((f) => f.step);
const html = `<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><style>
@font-face{font-family:Heebo;src:url(../../../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(../../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
body{margin:0;background:#11100f;color:#f2f0ec;font-family:Inter,Heebo,sans-serif;width:1440px;padding:24px 32px;box-sizing:border-box}
h1{font-size:24px;margin:0 0 4px}.lead{color:#c7c4be;margin:0 0 16px;font-size:15px}
section{border:1px solid #3a3835;border-radius:10px;padding:12px 16px;margin:0 0 10px}h2{font-size:16px;margin:0 0 8px}
.row{display:flex;flex-wrap:wrap;gap:8px 22px}.sw{display:flex;align-items:center;gap:8px;font-size:14px}.sw code{font:12px Inter;color:#a19e98;direction:ltr}
.box{width:44px;height:22px;border-radius:3px;display:inline-block}.hollow{width:40px;height:18px;border-radius:3px;display:inline-block}.dot{width:14px;height:14px;border-radius:50%;display:inline-block}
.v{margin:8px 0 0;font-size:13px;color:#e0ddd9}.v .s{color:#a19e98}.note{margin:4px 0 0;font-size:13px;color:#a19e98}
</style><h1>אפשרות A, הכי מעט שינויים: הצבעים של דף השקעה במדד</h1>
<p class="lead">כל שורה: הצבעים של תרשים או מקרא אחד, השם מהאתר, והזוג הקרוב ביותר לפי בודק הצבעים (OKLab ×100; רגיל ≥ 15 חובה, עיוורון צבעים ≥ 8 יעד).</p>
${row("שורות החשבונות: פס העמלות והמקרא שלו (וגם בגיליון המחיר שלכם ובלי קרן)", A.fee.map((f) => sw(f.step, f.he)).join(""), fee, CARD, "all", "דמי ניהול חשבון עוברים מאדום (red-500) לוורוד בהיר (rose-200); השאר כמו היום.")}
${row("אותו פס על השורה הנבחרת", A.fee.map((f) => sw(f.step, f.he)).join(""), fee, SEL, "all")}
${row("גיליון המחיר שלכם: רצועת התקופות", A.period.map((p) => sw(p.step, p.he)).join(""), A.period.map((p) => p.step), POP, "all", "בלי גוון: אפור בשלוש בהירויות, והמילים כתובות בתוך כל קטע.")}
${row("התוויות של הקרנות ושורת הסינון", sw(A.chipPlain, "תווית (צוברת, קרן מחקה, חשיפה לדולר…)") + sw(A.chipCaution, "תווית שמבקשת משהו (אין נתון)") + sw(A.chipOpen, "מס בצבירה: לא ידוע (עם מנעול)"), [A.chipPlain, A.chipCaution, A.chipOpen], CARD, "all", "שש משפחות התוויות בלי גוון משלהן: הסמל והמילים נושאים אותן. אותו שינוי בדף החברה.")}
${row("עם נטרול מט״ח או בלי: מה הקרנות עשו", sw(A.mark, "בלי נטרול מט״ח") + sw(A.mark, "עם נטרול מט״ח", "hollow"), [A.mark], CARD, "all", "דיו אחד: מלא בלי נטרול, חלול עם נטרול, כמו הנקודה החלולה בתרשים כל הזוגות.")}
${row("כרטיס התוצאה: שתי הרצועות", sw(A.ink, "חשבון / קרן (שורה עם שם)") + sw(A.mark, "הבחירה שלכם", "hollow"), [A.ink, A.mark], CARD, "all")}
${row("כל הזוגות: נקודה לכל קרן", sw(A.ink, "● קרן מחקה ישראלית ■ קרן סל ישראלית ▲ קרן חוץ בבורסה בתל אביב ◆ קרן שנקנית בחו״ל") + sw(A.mark, "הבחירה שלכם, הזוג הטוב ביותר, הדרך", "hollow"), [A.ink, A.mark], CARD, "all", "סוג הקרן בצורה, לא בגוון: אין משפחת גוונים פנויה בדף (ראו למטה).")}
<section><h2>משפחות הגוונים בדף, משמעות אחת לכל אחת</h2><div class="row">
${sw("teal-300", "פעולה, קישור, הבחירה והזול")}${sw("blue-300", "מה שהזנתם")}${sw("violet-400", "מספר מחושב")}${sw("amber-400", "זהירות")}${sw("red-400", "חסום בכלל פתוח, ושגיאה בשדה")}
${sw("orange-500", "עמלות קנייה ומכירה")}${sw("gold-200", "דמי משמרת")}${sw("rose-200", "דמי ניהול חשבון")}${sw("magenta-400", "המרת מטבע")}${sw("neutral-400", "אפור: דיו בלי משמעות משלו, תמיד עם מילה")}${sw("green-400", "חיובי: שמור, לא מצויר בדף")}
</div><p class="note">כל עשר משפחות הגוונים בפלטה תפוסות. ארבע הפנויות לסדרות (כתום, זהב, ורוד, מג׳נטה) הולכות לסוגי העמלות, ולכן לסוגי הקרנות לא נשאר גוון.</p></section>`;
writeFileSync(dir + "swatches.html", html);
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("file://" + dir + "swatches.html"); await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: dir + "swatches.png", fullPage: true });
await b.close();
