// Builds mockups-3.html: the third round, one self-contained page. Run: node gen3.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), "utf8");
const before = readFileSync(join(here, "before-2.png")).toString("base64");

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>קרן השתלמות: שרטוט 3</title><style>${read("mock.css")}${read("mock3.css")}</style></head><body>
<div class="doc">
  <header class="head">
    <h1>קרן השתלמות: הסיפור של הכסף, שלב אחרי שלב</h1>
    <p class="muted">בלי המשפט על כל שקל, ובלי חשבון ניירות ערך לצד הקרן של שכירים. אפשר לגרור את השנים.</p>
  </header>
  <section class="option">
    <p class="small muted">מה היה: חלקים שמרחפים, משפט על כל שקל, וחשבון ניירות ערך שאין בו מעסיק.</p>
    <img class="beforeimg" alt="הציור הקודם" src="data:image/png;base64,${before}">
  </section>
  <p class="note" id="assume"></p>

  <section class="option">
    <div class="opt-h"><h2>א. הערימה גדלה</h2><span class="tag">מומלץ</span></div>
    <p class="why">כל שלב בעמודה משלו, אז יש תזוזה וסיפור. אבל כל עמודה היא כל הערימה עד לאותו רגע: מה שנוסף עכשיו בהיר, ומה שכבר היה עמום. העמודה המקווקוות בסוף היא ההשוואה: לפני שנה 6 היא מראה כמה יהיה אם מחכים, ולעצמאים את אותו כסף בחשבון ניירות ערך.</p>
    <div class="site" id="opt-a"></div>
    <div class="later">
      <p class="small muted">אותו ציור שנה אחת אחר כך, בלי לגעת בכלום חוץ מהשנה:</p>
      <div class="site" id="opt-a2"></div>
    </div>
  </section>

  <section class="option">
    <div class="opt-h"><h2>ב. אותו סיפור בשורות</h2></div>
    <p class="why">המשפט כתוב ליד כל שורה, והכי נוח לקרוא בטלפון. אבל זה פחות דומה לעמודות של הרצועה, אז החיבור בין השנה שנבחרה לפירוט שלה פחות מיידי.</p>
    <div class="site" id="opt-b"></div>
  </section>
</div>
<script>window.__DATA__=${read("numbers.json")};</script>
<script>${read("mock3.js")}</script>
</body></html>`;
writeFileSync(join(here, "mockups-3.html"), html);
