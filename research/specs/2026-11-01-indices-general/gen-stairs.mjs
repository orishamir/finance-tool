// Builds stairs.html: the working sketch, one file with its styles, figures and script inside. Run: node gen-stairs.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, f), "utf8");
const data = JSON.parse(read("stairs.json"));
const src = read("stairs-app.js");
const { makeApp } = new Function("module", `${src}; return module.exports;`)({ exports: {} });
const app = makeApp(data);
const s0 = app.firstState();
const f0 = app.fieldOptions(s0);
const css = read("sketches-3.css") + read("stairs.css");

const TITLES = [
  ["הצעה א׳ (מומלצת)", "המדרגות, ומתחתיהן כל בחירה לפי מה שהיא משנה"],
  ["הצעה ב׳", "כל הבחירות בדירוג אחד, ולידו המדרגות"],
  ["הצעה ג׳", "סרגל כסף אחד: המדרגות שוכבות עליו וכל בחירה היא נקודה"],
];
const knob = (id, label, max, value, text) => `<label class="knb"><span class="xs muted">${label}</span><strong class="n entered" id="${id}-v">${text}</strong><input id="${id}" type="range" min="0" max="${max}" step="1" value="${value}"></label>`;
const fmt = (x) => x.toLocaleString("en");

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>המדרגות: שרטוט עובד</title><style>${css}</style></head><body>
<main class="lab">
<header class="lab-h"><h1>השקעה במדד S&amp;P 500</h1><p class="muted">מתחילים מבחירה אחת, ורואים מה משפר אותה ובכמה.</p></header>
<nav class="tabs" id="tabs">${TITLES.map(([t, d], i) => `<button type="button" data-opt="${i}" class="${i === 0 ? "on" : ""}"><b>${t}</b><span class="xs">${d}</span></button>`).join("")}</nav>
<section class="fields">
${knob("ai", "סכום עכשיו", data.AMOUNTS.length - 1, s0.ai, `${fmt(data.AMOUNTS[s0.ai])} ₪`)}
${knob("mi", "בכל חודש", data.MONTHLY.length - 1, s0.mi, `${fmt(data.MONTHLY[s0.mi])} ₪`)}
${knob("yi", "לכמה שנים", data.YEARS.length - 1, s0.yi, `${data.YEARS[s0.yi]}`)}
<label class="pick-f"><span class="xs muted">החשבון שמתחילים ממנו</span><select id="acct">${f0.accts}</select></label>
<label class="pick-f"><span class="xs muted">הקרן שמתחילים ממנה</span><select id="fund">${f0.funds}</select></label>
<p class="xs muted note-f" id="msg">תשואה <span class="n">7%</span> לשנה, אינפלציה <span class="n">2%</span>, לפי המחירונים המפורסמים של כל חשבון.</p>
</section>
<div id="out">${TITLES.map((_, i) => `<section class="option ${i === 0 ? "on" : ""}" data-o="${i}"><h2 class="nojs">${TITLES[i][0]}: ${TITLES[i][1]}</h2>${app.render(s0, i, 1160)}</section>`).join("")}</div>
<aside class="lab-n xs muted"><b>על השרטוט.</b> בדף עצמו הקטע הזה מתווסף מתחת לגרף הקיים, ולא מחליף אותו. כל הסכומים יצאו ממנוע האתר, ל־${Object.keys(data.plans).length} תוכניות שחושבו מראש, ולכן הסרגלים כאן קופצים בין ערכים; בדף עצמו הם רציפים. אין כאן אף מספר מומצא. שמות החשבונות והקרנות קוצרו לשרטוט. הפתיחה היא החשבון האמצעי והקרן האמצעית מבין קרנות הסל, ולא מקרה של מישהו מסוים.</aside>
</main>
<script>${src}
const app=makeApp(${JSON.stringify(data)});
${read("stairs-boot.js")}</script></body></html>`;
writeFileSync(join(here, "stairs.html"), html);
console.log("stairs.html", Math.round(html.length / 1024), "KB");
