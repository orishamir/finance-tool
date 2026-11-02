// Builds mockups.html: one self-contained page from mock.css, mock.js and numbers.json. Run: node gen.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), "utf8");

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>קרן השתלמות: שרטוט</title><style>${read("mock.css")}</style></head><body>
<div class="doc">
  <header class="head">
    <h1>קרן השתלמות: מה הכי מעניין, ושלוש דרכים לצייר את זה</h1>
    <p class="muted">שרטוט לבחירה, עם המספרים של מנוע החישוב של האתר (2.11.2026). כל הציורים חיים: אפשר לגרור את השנים.</p>
  </header>

  <section class="finds">
    <div class="find"><span class="t">הכסף של המעסיק</span><strong id="find-emp"></strong><p class="small muted" id="find-emp-t"></p></div>
    <div class="find"><span class="t">הקפיצה בשנה 6</span><strong class="n" id="find-jump"></strong><p class="small muted" id="find-jump-t"></p></div>
    <div class="find"><span class="t">הכסף שלכם לבד, בלי המעסיק</span><strong class="n" id="find-own"></strong><p class="small muted" id="find-own-t"></p></div>
  </section>
  <p class="note" id="assume"></p>

  <section class="option">
    <div class="opt-h"><h2>א. מגדלי מטבעות</h2><span class="tag">מומלץ</span></div>
    <p class="why">מגדל מול מגדל, כסף אמיתי שאפשר לספור. את הכסף של המעסיק רואים בזהב, ואת הקפיצה רואים ברצועת השנים בלי לגרור. כשעוברים משנה 5 לשנה 6 המטבעות המקווקווים הופכים למלאים. אותו ציור עובד גם לעצמאים, עם החזר המס במקום המעסיק.</p>
    <div class="site" id="opt-a"></div>
    <div class="later">
      <p class="small muted">אותו ציור שנה אחת אחר כך, בלי לגעת בכלום חוץ מהשנה:</p>
      <div class="site" id="opt-a2"></div>
    </div>
  </section>

  <section class="option">
    <div class="opt-h"><h2>ב. מדרגות</h2></div>
    <p class="why">מתחילים מחשבון ניירות ערך ורואים מה כל צעד מוסיף, דבר אחד בכל פעם. אבל המדרגה של המעבר לקרן כמעט לא נראית ליד הכסף של המעסיק, והיא גם מצב שאף אחד לא נמצא בו: קרן בלי המעסיק.</p>
    <div class="site" id="opt-b"></div>
  </section>

  <section class="option">
    <div class="opt-h"><h2>ג. כל השנים בעמודות</h2></div>
    <p class="why">הכול בבת אחת, בלי שום פקד: לוחצים על שנה רק כדי לקרוא מספרים. הצוק הכי ברור כאן, אבל זה גרף עמודות רגיל, וקשה יותר להרגיש את היחס מול חשבון ניירות ערך.</p>
    <div class="site" id="opt-c"></div>
  </section>
</div>
<script>window.__DATA__=${read("numbers.json")};</script>
<script>${read("mock.js")}</script>
</body></html>`;
writeFileSync(join(here, "mockups.html"), html);
