// Builds mockups-2.html: the second round, one self-contained page. Run: node gen2.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), "utf8");
const before = readFileSync(join(here, "before.png")).toString("base64");

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>קרן השתלמות: שרטוט 2</title><style>${read("mock.css")}${read("mock2.css")}</style></head><body>
<div class="doc">
  <header class="head">
    <h1>קרן השתלמות: בלי כדורים ובלי טבלה</h1>
    <p class="muted">רצועת השנים נשארת, עכשיו בצבעים. השנה שבוחרים נפתחת למטה, וכל מה שהיה בטבלה כתוב על הגרף עצמו. אפשר לגרור את השנים.</p>
  </header>
  <section class="option">
    <p class="small muted">מה היה: רצועה אפורה, כדורים, וטבלה שצריך כדי לפענח את הצבעים.</p>
    <img class="beforeimg" alt="הציור הקודם" src="data:image/png;base64,${before}">
  </section>
  <p class="note" id="assume"></p>

  <section class="option">
    <div class="opt-h"><h2>א. עמודה לכל דרך</h2><span class="tag">מומלץ</span></div>
    <p class="why">אותה עמודה כמו ברצועה, רק גדולה ועם השמות עליה, אז רואים מיד כמה ממנה זהב. המס מסומן בקווים על החלק שהוא לוקח. החיסרון: החלק של הרווח והחלק של המס יושבים זה על זה לפני ${"6"} שנים.</p>
    <div class="site" id="opt-a"></div>
    <div class="later">
      <p class="small muted">אותו ציור שנה אחת אחר כך, בלי לגעת בכלום חוץ מהשנה:</p>
      <div class="site" id="opt-a2"></div>
    </div>
  </section>

  <section class="option">
    <div class="opt-h"><h2>ב. כל חלק בעמודה משלו</h2></div>
    <p class="why">כל מספר על החלק שלו, והחשבון ברור עד הסוף: הפקדה, רווח, מס, מה שנשאר. אבל יש תשע עמודות, והערימה כולה נראית רק בעמודה האחרונה של כל דרך.</p>
    <div class="site" id="opt-b"></div>
  </section>
</div>
<script>window.__DATA__=${read("numbers.json")};</script>
<script>${read("mock2.js")}</script>
</body></html>`;
writeFileSync(join(here, "mockups-2.html"), html);
