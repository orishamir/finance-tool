// Put each before and after side by side (before on the right, read first), with the list's height under each.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
import fs from "fs";
const D = "/home/ori/dev/finance-tool/research/specs/2026-11-05-indices-visuals/rows";
const heebo = "/home/ori/dev/finance-tool/node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2";
const inter = "/home/ori/dev/finance-tool/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2";
const pair = (title, a, b, ha, hb, note) => `
<section><h2>${title}</h2>
<div class="row">
  <figure><figcaption>היום</figcaption><img src="file://${D}/${a}"><p>גובה עד השורה השישית: <b>${ha}</b> פיקסלים</p></figure>
  <figure><figcaption class="new">מוצע</figcaption><img src="file://${D}/${b}"><p>גובה עד השורה השישית: <b>${hb}</b> פיקסלים</p></figure>
</div>${note ? `<p class="note">${note}</p>` : ""}</section>`;
const page = (body) => `<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(file://${inter})}@font-face{font-family:Heebo;src:url(file://${heebo})}
body{margin:0;padding:24px;background:#161514;color:#e8e4df;font-family:Inter,Heebo,sans-serif;font-size:15px}
h2{font-size:20px;margin:8px 0 12px}section{margin-bottom:36px}
.row{display:flex;gap:28px;align-items:flex-start}figure{margin:0}
figcaption{font-weight:600;font-size:16px;margin-bottom:6px;color:#b9b2aa}figcaption.new{color:#7fd6cf}
img{display:block;border:1px solid #333}p{margin:6px 0 0;color:#b9b2aa;font-variant-numeric:tabular-nums}.note{max-width:1500px}
</style><body>${body}</body></html>`;
const items = {
  "item4": page(
    pair("S&P 500 · תווית שיש לכל הקבוצה עוברת לכותרת הקבוצה, ויוצאת מהסינון", "4-sp-before.png", "4-sp-after.png", "1,082", "1,048",
      "&quot;חשיפה לדולר&quot; הופיעה ב־19 מתוך 19 השורות בקבוצה, ושוב כסינון (19) שמחזיר בדיוק את הקבוצה. כך גם &quot;מנוטרלת מט״ח&quot; בקבוצה השנייה (מחוץ לחיתוך).") +
    pair("ת״א-125 · תווית שיש לכל הרשימה עוברת לכותרת אחת מעל הרשימה", "4-ta-before.png", "4-ta-after.png", "779", "822",
      "&quot;צוברת&quot; הופיעה בכל 6 השורות. בלי קבוצות, הרשימה מקבלת כותרת אחת כמו כותרת קבוצה; היא מוסיפה שורה.")),
  "item5": page(
    pair("חשבונות · הסימון עובר לכותרת העמודה; התאים נקיים, ועדיין נפתחים לחישוב בלחיצה", "5-accounts-before.png", "5-accounts-after.png", "1,199", "1,227",
      "לעלות שמתחת לכל פס לא הייתה כותרת; עכשיו יש.") +
    pair("קרנות · אותו דבר", "5-funds-before.png", "5-funds-after.png", "1,082", "1,110", "")),
};
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [name, html] of Object.entries(items)) {
  const f = `${D}/${name}.html`; fs.writeFileSync(f, html);
  const p = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto("file://" + f); await p.waitForTimeout(400);
  await p.screenshot({ path: `${D}/../${name}-labels-and-marks.png`.replace("item4-labels-and-marks", "rows-item4-shared-labels").replace("item5-labels-and-marks", "rows-item5-marks-in-head"), fullPage: true });
  await p.close(); fs.unlinkSync(f);
}
await browser.close();
