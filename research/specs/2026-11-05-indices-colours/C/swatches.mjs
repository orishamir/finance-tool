// Option C swatch sheet: each chart's colours side by side with the meaning's Hebrew name and the validator's worst pairs,
// and one row with every hue family on the page and its one meaning. Reads check.json and families.json (run check.mjs and
// families.mjs first). Run from the repository root: node research/specs/2026-11-05-indices-colours/C/swatches.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const checks = JSON.parse(readFileSync(join(here, "check.json"), "utf8"));
const fam = JSON.parse(readFileSync(join(here, "families.json"), "utf8"));
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const hollow = (r) => /חלול/.test(r.he);
const card = (r) => `<div class="chart">
  <div class="title">${esc(r.he)}</div>
  <div class="sw">${r.meanings.map((m, i) => `<div class="s"><i style="background:${hollow(r) && i === 0 ? m.hex : m.hex}"></i>${hollow(r) ? `<i class="h" style="border-color:${m.hex}"></i>` : ""}<span>${esc(m.he)}</span><code>${m.step} ${m.hex}</code></div>`).join("")}</div>
  <div class="v">${r.normal == null ? "צבע אחד: מלא מול חלול, ומילים במקרא" : `הזוג הקרוב ביותר: רגיל ΔE ${r.normal} · עיוורון צבעים ΔE ${r.cvd}${r.pairs === "ordinal" ? " · סדר (בהיר עד כהה), מילים בכל קטע" : ""}`} <b class="${/FAIL/.test(r.verdict) ? "bad" : "ok"}">${/FAIL/.test(r.verdict) ? "נכשל" : "עובר"}</b></div>
  <div class="surf">משטח <code dir="ltr">${r.surface}</code></div>
</div>`;
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{font-family:Heebo;src:url(../../../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(../../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
body{margin:0;background:#0f0e0d;color:#f2f0ec;font-family:Inter,Heebo,Arial,sans-serif;font-size:14px;line-height:1.5}
.page{padding:20px 24px;width:1392px;box-sizing:border-box}h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:22px 0 8px}p{margin:0 0 8px;color:#c7c4be}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.chart{background:#171614;border:1px solid #2e2c29;border-radius:10px;padding:12px 14px}.title{font-weight:600;font-size:15px;margin-bottom:8px}
.sw{display:flex;flex-wrap:wrap;gap:10px 16px}.s{display:flex;flex-direction:column;align-items:flex-start;gap:3px;width:150px}
.s i{display:block;width:150px;height:28px;border-radius:5px}.s i.h{background:transparent;border:2.5px solid;height:28px;box-sizing:border-box;margin-top:4px}
.s span{font-size:13px}.s code{font:12px Inter,monospace;color:#a19e98;direction:ltr}
.v{margin-top:8px;font-size:13px;color:#e0ddd9}.v b{margin-inline-start:8px;padding:1px 8px;border-radius:4px}.ok{background:#1d3324;color:#92d8a0}.bad{background:#3d1a17;color:#feaba1}
.surf{font-size:12px;color:#7d7a74}.surf code{font:12px Inter,monospace}
.fam{display:grid;grid-template-columns:repeat(11,1fr);gap:8px}.f{background:#171614;border:1px solid #2e2c29;border-radius:8px;padding:8px}.f i{display:block;height:34px;border-radius:5px;margin-bottom:6px}
.f b{display:block;font-size:13px;direction:ltr;text-align:right}.f span{font-size:12.5px;color:#e0ddd9}
</style></head><body><div class="page">
<h1>אפשרות C, שפה אחת: הצבעים של כל תרשים</h1>
<p>כל שורה: הצבעים שיכולים לשבת זה ליד זה בתרשים, במקרא או בשורת התוויות, עם מה שכל צבע אומר. מתחת: הזוג הקרוב ביותר לפי הבודק (dataviz validate_palette.js, מצב כהה, כל הזוגות). הסף: רגיל 15 לפחות, עיוורון צבעים 8 (6 עד 8 רק כשמילה יושבת על הסימן).</p>
<div class="grid">${checks.map(card).join("")}</div>
<h2>כל משפחת צבע בעמוד, ומה היא אומרת (משמעות אחת לכל משפחה)</h2>
<div class="fam">${fam.families.map((f) => `<div class="f"><i style="background:${f.hex}"></i><b>${f.family} · ${f.step}</b><span>${esc(f.he)}</span></div>`).join("")}</div>
</div></body></html>`;
writeFileSync(join(here, "swatches.html"), html);
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1392, height: 400 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
await page.goto("file://" + join(here, "swatches.html"));
await page.waitForTimeout(300);
await page.screenshot({ path: join(here, "swatches.png"), fullPage: true });
await b.close();
console.log("swatches.png written");
