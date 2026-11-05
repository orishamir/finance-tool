// compare.png: today's colours (right) and the recommended colours (left) of every coloured part of the indices page.
// Run: node research/specs/2026-11-05-indices-colours/rec/compose.mjs
import { createRequire } from "module";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { H } from "./lib.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const img = (f) => `data:image/png;base64,${readFileSync(join(here, f)).toString("base64")}`;
const sw = [
  ["orange-500", "כל חלקי עמלת החשבון (כל חלק בשמו)"], ["rose-300", "קרן מחקה ישראלית"], ["gold-200", "קרן סל ישראלית"],
  ["magenta-400", "קרן חוץ (● בחו״ל, ▲ בתל אביב)"], ["neutral-100", "הבחירה שלכם, הזוג הטוב והדרך"], ["neutral-700", "רצועת הטווח"],
  ["teal-600", "קרן בגרף הדולר: מלא בלי נטרול, חלול עם נטרול"], ["neutral-400", "תוויות (סמל ומילים, בלי צבע משפחה)"],
  ["red-400", "כלל פתוח, שגיאה"], ["neutral-50", "פס התקופות: ראשונה"], ["neutral-300", "שנייה"], ["neutral-500", "שלישית"],
];
const rows = [
  ["כל הזוגות: נקודה לכל קרן", "crops/today-new-2-every-pair.png", "new-2-every-pair.png", "השרטוט שאושר (לא באתר עדיין)"],
  ["כרטיס התוצאה: כמה כל בחירה משנה", "crops/today-new-1-result-card.png", "new-1-result-card.png", "השרטוט שאושר (לא באתר עדיין)"],
  ["כל החשבונות: פס העמלות, ראש הרשימה", "crops/today-acc-top.png", "crops/rec-acc-top.png", "באתר היום"],
  ["כל החשבונות: שורות שהעמלה הקבועה בהן הגדולה", "crops/today-acc-fixed.png", "crops/rec-acc-fixed.png", "באתר היום"],
  ["כל הקרנות: התוויות", "crops/today-funds.png", "crops/rec-funds.png", "באתר היום"],
  ["כלל פתוח: התווית והתג", "crops/today-blocked.png", "crops/rec-blocked.png", "באתר היום"],
  ["עם נטרול מט״ח או בלי", "crops/today-dollar.png", "crops/rec-dollar.png", "באתר היום"],
  ["מחיר משלכם: פס התקופות ופסי העלות", "crops/today-sheet.png", "crops/rec-sheet.png", "באתר היום"],
];
const html = `<!doctype html><html dir="rtl"><body style="margin:0;background:#0f0e0d;color:#f2f0ec;font:18px Heebo,Arial,sans-serif;width:2760px">
<div style="padding:24px 32px 8px;font-size:30px;font-weight:700">עמוד המדדים: הצבעים של היום (מימין) והצבעים המומלצים (משמאל)</div>
<div style="padding:0 32px 8px;font-size:18px;color:#c7c4be">כל צבע אומר דבר אחד בעמוד. כחול וסגול נשארים למספרים שהוזנו ושחושבו; ענבר, אדום וירוק למצב; טורקיז לפעולה ולערך.</div>
<div style="display:flex;flex-wrap:wrap;gap:10px 28px;padding:12px 32px 20px">${sw.map(([s, t]) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:28px;height:18px;border-radius:3px;background:${H(s)};border:1px solid #444"></span><span>${t}</span><span style="color:#7d7a74;font:14px monospace;direction:ltr">${s} ${H(s)}</span></div>`).join("")}</div>
${rows.map(([t, a, b, note]) => `<section style="padding:16px 32px 24px;border-top:1px solid #333">
<div style="font-size:24px;font-weight:700;margin-bottom:10px">${t} <span style="font-size:16px;font-weight:400;color:#a19e98">${note}</span></div>
<div style="display:flex;gap:32px;align-items:flex-start;justify-content:flex-start">
<figure style="margin:0;max-width:1340px"><figcaption style="font-size:22px;font-weight:700;margin-bottom:6px">היום</figcaption><img src="${img(a)}" style="max-width:100%;display:block;border:1px solid #333"></figure>
<figure style="margin:0;max-width:1340px"><figcaption style="font-size:22px;font-weight:700;margin-bottom:6px;color:#ff9a6a">מומלץ</figcaption><img src="${img(b)}" style="max-width:100%;display:block;border:2px solid #555"></figure>
</div></section>`).join("")}
</body></html>`;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 2760, height: 800 }, deviceScaleFactor: 1 });
await page.setContent(html); await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "..", "compare.png"), fullPage: true });
console.log(await page.evaluate(() => document.body.scrollHeight));
await b.close();
