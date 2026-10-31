// Writes mockups.html from numbers.json (compute.ts) and the two screenshots of the site as it is today (shot-site.mjs).
// Run: node research/specs/2026-10-31-hedged/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const n = JSON.parse(readFileSync(join(here, "numbers.json"), "utf8"));
const img = (f) => `data:image/png;base64,${readFileSync(join(here, f)).toString("base64")}`;

// ------------------------------------------------ formats
const MINUS = "−";
const num = (x, d = 1) => Math.abs(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (x, d = 1) => `${x > 0 ? "+" : x < 0 ? MINUS : ""}${num(x, d)}`;
const iso = (s) => `<span class="n" dir="ltr">${s}</span>`;
const pct = (x, d = 1) => iso(`${signed(x, d)}%`);
const nis = (x) => `<span class="n">${Math.round(x).toLocaleString("en-US")} ₪</span>`;
const dateHe = n.today.split("-").reverse().join(".");

// ------------------------------------------------ the figures the text uses
const sc = n.scenarios;
const uLo = sc.unhedged[0].value, uMid = sc.unhedged.find((p) => p.fx === 0).value, uHi = sc.unhedged[sc.unhedged.length - 1].value;
const hV = sc.hedged.value, band = sc.hedged.band;
const years = n.dollar.years;
const yLo = Math.min(...years.map((y) => y.pct)), yHi = Math.max(...years.map((y) => y.pct));
const st = n.dollar.stretch10;
const unName = n.pairs.unhedged.name, heName = n.pairs.hedged.name;
const R = n.reported;
const compound = (xs) => (xs.reduce((a, x) => a * (1 + x / 100), 1) - 1) * 100;
const usd4 = compound(R.map((r) => r.hedgedTarget));
const he4 = n.hundreds.hedged - 100;
const un4lo = Math.min(...n.hundreds.unhedged.map((f) => f.v)) - 100, un4hi = Math.max(...n.hundreds.unhedged.map((f) => f.v)) - 100;
const d4 = n.hundreds.dollar - 100;
const heShort = R.map((r) => -r.hedgedShortfall);
const shLo = Math.min(...heShort), shHi = Math.max(...heShort);
const m5 = n.market[0], m9 = n.market[2];
const costRow = n.grid.rows[2];
const worthLo = Math.min(n.pointWorth.hedge.from2To3, n.pointWorth.hedge.from1To2, n.pointWorth.dollar.fromMinus1To0, n.pointWorth.dollar.from0To1);
const worthHi = Math.max(n.pointWorth.hedge.from2To3, n.pointWorth.hedge.from1To2, n.pointWorth.dollar.fromMinus1To0, n.pointWorth.dollar.from0To1);
const round100 = (x) => Math.round(x / 100) * 100;
const gapFlat = costRow.gaps[n.grid.fxs.indexOf(0)];
const allShorts = n.allHedged.flatMap((f) => f.years.map((y) => y.short));
const heFundsWithYears = n.allHedged.filter((f) => f.years.length > 0).length;
const hTax = n.tax.hedged.tax, uTax = n.tax.unhedged;
const taxShare = (uTax[2].tax - uTax[0].tax) / (uHi - uLo + uTax[2].tax - uTax[0].tax);

// ------------------------------------------------ charts (own SVG; axes left to right; every chart at two widths)
const C = { grid: "var(--chart-grid)", axis: "var(--chart-axis)", text: "var(--chart-text)", u: "var(--chart-kind-unhedged)", h: "var(--chart-kind-hedged)", d: "var(--chart-dollar)", dim: "var(--chart-dollar-dim)", m: "var(--chart-market)" };
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill ?? C.text}" font-size="${o.size ?? 12}" text-anchor="${o.anchor ?? "middle"}" ${o.weight ? `font-weight="${o.weight}"` : ""}>${s}</text>`;
const both = (fn) => `<div class="pc">${fn(true)}</div><div class="ph">${fn(false)}</div>`;

function yearBars(wide) {
  const w = wide ? 660 : 358, h = 250, l = 34, r = 4, top = 18, bot = 26;
  const y = (v) => top + ((20 - v) / 40) * (h - top - bot);
  const step = (w - l - r) / years.length;
  let s = `<svg dir="ltr" viewBox="0 0 ${w} ${h}" role="img" aria-label="השינוי של הדולר מול השקל בכל שנה">`;
  for (const v of [-20, -10, 0, 10, 20]) {
    s += `<line x1="${l}" x2="${w - r}" y1="${y(v)}" y2="${y(v)}" stroke="${v === 0 ? C.axis : C.grid}"/>`;
    s += t(l - 6, y(v) + 4, `${v > 0 ? "+" : v < 0 ? MINUS : ""}${Math.abs(v)}`, { anchor: "end" });
  }
  years.forEach((d, i) => {
    const on = d.year >= 2022;
    const x = l + i * step + step * 0.14, bw = step * 0.72;
    const top_ = Math.min(y(d.pct), y(0)), ht = Math.abs(y(d.pct) - y(0));
    s += `<rect x="${x}" y="${top_}" width="${bw}" height="${Math.max(ht, 1)}" rx="2" fill="${on ? C.d : C.dim}"><title>${d.year}: ${signed(d.pct)}%</title></rect>`;
    if (d.year === 2022 || d.year === 2025) s += t(d.year === 2025 ? x + bw : x + bw / 2, d.pct > 0 ? y(d.pct) - 5 : y(d.pct) + 14, signed(d.pct), { fill: "var(--foreground)", weight: 600, anchor: d.year === 2025 ? "end" : "middle" });
    if (d.year % (wide ? 2 : 4) === 0) s += t(x + bw / 2, h - 8, d.year);
  });
  return s + "</svg>";
}

function groupBars(wide) {
  const w = wide ? 440 : 358, h = 250, l = 34, r = 4, top = 18, bot = 26;
  const y = (v) => top + ((40 - v) / 70) * (h - top - bot);
  const step = (w - l - r) / R.length;
  let s = `<svg dir="ltr" viewBox="0 0 ${w} ${h}" role="img" aria-label="התשואה של שני סוגי הקרנות בכל שנה">`;
  for (const v of [-30, -20, -10, 0, 10, 20, 30, 40]) {
    s += `<line x1="${l}" x2="${w - r}" y1="${y(v)}" y2="${y(v)}" stroke="${v === 0 ? C.axis : C.grid}"/>`;
    if (v % 20 === 0 || v === -30) s += t(l - 6, y(v) + 4, `${v > 0 ? "+" : v < 0 ? MINUS : ""}${Math.abs(v)}`, { anchor: "end" });
  }
  R.forEach((d, i) => {
    const cx = l + i * step + step / 2, bw = Math.min(step * 0.3, 34), gap = 3;
    const mid = (d.unhedgedLow + d.unhedgedHigh) / 2;
    const bar = (x, v, fill, title) => `<rect x="${x}" y="${Math.min(y(v), y(0))}" width="${bw}" height="${Math.max(Math.abs(y(v) - y(0)), 1)}" rx="3" fill="${fill}"><title>${title}</title></rect>`;
    const xu = cx - bw - gap / 2, xh = cx + gap / 2;
    s += bar(xu, mid, C.u, `${d.year}, בלי נטרול: ${signed(d.unhedgedLow)}% עד ${signed(d.unhedgedHigh)}%`);
    s += bar(xh, d.hedged, C.h, `${d.year}, עם נטרול: ${signed(d.hedged)}%`);
    const lab = (x, v) => t(x + bw / 2, v >= 0 ? y(v) - 5 : y(v) + 14, signed(v), { fill: "var(--foreground)", size: wide ? 12 : 11, weight: 600 });
    s += lab(xu - (wide ? 0 : 2), mid) + lab(xh + (wide ? 0 : 2), d.hedged);
    s += t(cx, h - 8, d.year);
  });
  return s + "</svg>";
}

const strip = { lo: -30, hi: 30 };
function stripRow(wide, marks, axis) {
  const w = wide ? 1040 : 326, l = 22, r = 22, h = axis ? 62 : 44, mid = 22;
  const x = (v) => l + ((v - strip.lo) / (strip.hi - strip.lo)) * (w - l - r);
  let s = `<svg dir="ltr" viewBox="0 0 ${w} ${h}" aria-hidden="true">`;
  for (let v = strip.lo; v <= strip.hi; v += 10) s += `<line x1="${x(v)}" x2="${x(v)}" y1="2" y2="42" stroke="${v === 0 ? C.axis : C.grid}"/>`;
  s += marks(x, mid);
  if (axis) for (let v = strip.lo; v <= strip.hi; v += 10) s += t(x(v), 58, `${v > 0 ? "+" : v < 0 ? MINUS : ""}${Math.abs(v)}%`);
  return s + "</svg>";
}
const dots = (values, fill, labels = true) => (x, mid) => {
  const sorted = [...values].sort((a, b) => a - b);
  const r = values.length > 10 ? 4.5 : 5.5;
  let out = "";
  sorted.forEach((v, i) => {
    const off = [0, -11, 11, -6, 6][i % 5];
    out += `<circle cx="${x(v)}" cy="${mid + off}" r="${r}" fill="${fill}" stroke="var(--card)" stroke-width="1.5"><title>${signed(v)}%</title></circle>`;
  });
  return out + (labels ? "" : "");
};
const rangeBar = (lo, hi, fill) => (x, mid) => `<rect x="${x(lo)}" y="${mid - 7}" width="${x(hi) - x(lo)}" height="14" rx="4" fill="${fill}"><title>${signed(lo)}% עד ${signed(hi)}%</title></rect>`;

function stripRowHtml(label, range, marks, axis = false) {
  return `<div class="strip"><div class="strip-l"><span>${label}</span><strong>${range}</strong></div>${both((wide) => stripRow(wide, marks, axis))}</div>`;
}

// ------------------------------------------------ the table of what happened
function reportedTable() {
  const row = (d) => {
    const gapLo = d.hedged - d.unhedgedHigh, gapHi = d.hedged - d.unhedgedLow;
    return `<tr><th scope="row">${d.year}</th><td>${pct(d.dollar)}</td><td class="hide-ph">${pct(d.hedgedTarget)}</td><td>${pct(d.unhedgedLow)} <span class="to">עד</span> ${pct(d.unhedgedHigh)}<span class="sub">${d.unhedgedCount} קרנות</span></td><td>${pct(d.hedged)}</td><td>${pct(gapLo)} <span class="to">עד</span> ${pct(gapHi)}</td></tr>`;
  };
  return `<div class="table-wrap"><table class="fixed t-rep">
    <thead><tr><th scope="col">שנה</th><th scope="col">הדולר מול השקל</th><th scope="col" class="hide-ph">S&amp;P 500 בדולרים</th><th scope="col">קרנות בלי נטרול</th><th scope="col">עם נטרול (הראל)</th><th scope="col">עם נטרול מול בלי נטרול, בנקודות אחוז</th></tr></thead>
    <tbody>${R.map(row).join("")}
    <tr class="sum"><th scope="row">ארבע השנים יחד</th><td>${pct(d4)}</td><td class="hide-ph">${pct(usd4)}</td><td>${pct(un4lo)} <span class="to">עד</span> ${pct(un4hi)}<span class="sub">${n.hundreds.unhedged.length} הקרנות שיש להן ארבע שנים</span></td><td>${pct(he4)}</td><td>${pct(he4 - un4hi)} <span class="to">עד</span> ${pct(he4 - un4lo)}</td></tr>
    </tbody></table></div>`;
}

// ------------------------------------------------ the grid of option B
function gridTable() {
  const cols = n.grid.fxs.map((f, i) => ({ f, i })).filter((c) => c.f >= -3);
  const maxAbs = Math.max(...n.grid.rows.flatMap((r) => cols.map((c) => Math.abs(r.gaps[c.i]))));
  const cell = (g) => {
    const share = Math.round(12 + (Math.abs(g) / maxAbs) * 62);
    const color = g >= 0 ? "var(--chart-kind-unhedged)" : "var(--chart-kind-hedged)";
    const mark = g >= 0 ? "" : "◆\u00a0";
    return `<td style="background:color-mix(in oklch, ${color} ${share}%, var(--card))"><span class="pc-i">${mark}${Math.abs(g).toLocaleString("en-US")}</span><span class="ph-i">${mark}${num(Math.abs(g) / 1000)}</span></td>`;
  };
  const rowHead = (c, i) => {
    if (i === 2) return `<th scope="row" dir="rtl" class="rh">${iso(num(c, 1))} נקודות<span class="sub">הממוצע בדוחות של הקרן</span></th>`;
    return `<th scope="row" dir="rtl" class="rh">${iso(num(c, 0))} נקודות<span class="sub madeup">ערך לדוגמה</span></th>`;
  };
  return `<div class="table-wrap"><table class="fixed t-grid" dir="ltr">
    <thead>
      <tr><th scope="colgroup" colspan="${cols.length}" dir="rtl">השינוי הממוצע בשנה של הדולר מול השקל, לאורך 10 השנים</th><th scope="col" rowspan="2" dir="rtl" class="rh">כמה הקרן המנוטרלת מפגרת בכל שנה, מעבר לדמי הניהול</th></tr>
      <tr>${cols.map((c) => `<th scope="col">${pct(c.f, 0)}</th>`).join("")}</tr>
    </thead>
    <tbody>${n.grid.rows.map((r, i) => `<tr class="${i === 2 ? "row-rep" : ""}">${cols.map((c) => cell(r.gaps[c.i])).join("")}${rowHead(n.grid.costs[i], i)}</tr>`).join("")}</tbody>
  </table></div>`;
}

// ------------------------------------------------ the page
const legendKinds = `<div class="legend"><span><i style="background:var(--chart-kind-unhedged)"></i><em>בלי נטרול מט״ח: אמצע הטווח של כל קרנות S&amp;P 500 עם דוח לאותה שנה</em></span><span><i style="background:var(--chart-kind-hedged)"></i><em>עם נטרול מט״ח: <bdi>${heName}</bdi>, היחידה שנאספה על המדד הזה</em></span></div>`;

const css = `
:root{
  --palette-neutral-50:oklch(.978 .004 80);--palette-neutral-100:oklch(.955 .005 80);--palette-neutral-300:oklch(.82 .008 80);--palette-neutral-500:oklch(.6 .009 80);--palette-neutral-600:oklch(.5 .01 80);--palette-neutral-700:oklch(.4 .009 80);--palette-neutral-850:oklch(.27 .007 80);--palette-neutral-900:oklch(.235 .006 80);--palette-neutral-950:oklch(.2 .005 80);--palette-neutral-975:oklch(.17 .004 80);
  --palette-teal-300:oklch(.82 .081 190);--palette-gold-200:oklch(.84 .17 85);--palette-magenta-400:oklch(.66 .17 335);--palette-amber-400:oklch(.73 .149 70);
  --background:var(--palette-neutral-975);--foreground:var(--palette-neutral-100);--card:var(--palette-neutral-950);--popover:var(--palette-neutral-900);--muted-foreground:var(--palette-neutral-300);--border:var(--palette-neutral-850);--primary:var(--palette-teal-300);--link:var(--palette-teal-300);--caution:var(--palette-amber-400);
  --chart-grid:var(--palette-neutral-850);--chart-axis:var(--palette-neutral-700);--chart-text:var(--muted-foreground);--chart-kind-unhedged:var(--palette-teal-300);--chart-kind-hedged:var(--palette-gold-200);
  --chart-dollar:var(--palette-neutral-100);--chart-dollar-dim:var(--palette-neutral-500);--chart-market:var(--palette-magenta-400);
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--background);color:var(--foreground)}
body{font-family:Inter,Heebo,system-ui,sans-serif;font-size:16px;line-height:1.7;font-variant-numeric:tabular-nums}
.page{max-width:1160px;margin:0 auto;padding:32px 32px 64px;display:flex;flex-direction:column;gap:48px}
h1{font-size:30px;line-height:1.25;margin:0;font-weight:700}
h2{font-size:24px;line-height:1.3;margin:0;font-weight:600}
h3{font-size:18px;line-height:1.4;margin:0;font-weight:600}
p{margin:0}
.measure{max-width:44rem}
.muted{color:var(--muted-foreground)}
.small{font-size:14px;line-height:1.6}
.xs{font-size:13px;line-height:1.55}
.n{unicode-bidi:isolate;white-space:nowrap}
section{display:flex;flex-direction:column;gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;display:flex;flex-direction:column;gap:16px}
.mock{border-color:var(--palette-neutral-700)}
.tag{display:inline-block;font-size:13px;font-weight:600;padding:2px 10px;border-radius:999px;border:1px solid var(--border);color:var(--muted-foreground);white-space:nowrap}
.tag.rec{color:var(--primary);border-color:var(--primary)}
.opt-h{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.shot{position:relative;border:1px solid var(--border);border-radius:10px;overflow:hidden;line-height:0}
.shot img{width:100%;height:auto;display:block}
.pin{position:absolute;width:26px;height:26px;border-radius:50%;background:var(--palette-neutral-50);color:var(--palette-neutral-975);font-size:14px;font-weight:700;line-height:26px;text-align:center;transform:translate(50%,-50%);box-shadow:0 0 0 2px var(--palette-neutral-975)}
.pin-l{display:inline-block;width:22px;height:22px;border-radius:50%;background:var(--palette-neutral-50);color:var(--palette-neutral-975);font-size:13px;font-weight:700;line-height:22px;text-align:center;flex:none;margin-top:3px}
.flaws{display:grid;gap:12px;grid-template-columns:1fr 1fr;margin:0;padding:0;list-style:none}
.flaws li{display:flex;gap:10px}
.two{display:grid;gap:24px;grid-template-columns:minmax(0,3fr) minmax(0,2fr);align-items:start}
.col{display:flex;flex-direction:column;gap:8px;min-width:0}
.tiles{display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr))}
.tile{border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;flex-direction:column;gap:2px}
.tile b{font-size:14px;font-weight:500;color:var(--muted-foreground)}
.tile strong{font-size:24px;line-height:1.3;font-weight:700}
.tile strong .to{font-size:16px;font-weight:500}
.legend{display:flex;flex-direction:column;gap:2px;font-size:14px;line-height:1.5;color:var(--muted-foreground)}
.legend span{display:flex;gap:8px;align-items:baseline}
.legend em{font-style:normal}
.legend i{width:11px;height:11px;border-radius:3px;flex:none;transform:translateY(1px)}
svg{direction:ltr;display:block;width:100%;height:auto;font-family:Inter,Heebo,sans-serif;font-variant-numeric:tabular-nums}
.ph{display:none}
.ph-i{display:none}
.table-wrap{max-width:100%}
table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.45}
table.fixed{table-layout:fixed}
th,td{padding:8px;border-bottom:1px solid var(--border);text-align:start;vertical-align:top}
thead th{font-weight:500;color:var(--muted-foreground);font-size:13px;vertical-align:bottom}
tbody th{font-weight:600}
.sub{display:block;font-size:12px;font-weight:400;color:var(--muted-foreground);line-height:1.35}
.madeup{color:var(--caution)}
.madeup::before{content:"⚠ "}
.to{color:var(--muted-foreground);font-size:12px}
.sum th,.sum td{border-top:2px solid var(--palette-neutral-700);font-weight:600}
.t-rep col{width:auto}
.t-grid .rh{width:21%;text-align:right}
.t-grid td{text-align:center;font-weight:500;color:var(--foreground);border:1px solid var(--card);padding:10px 2px}
.t-grid thead th{text-align:center}
.row-rep th,.row-rep td{outline:1px solid var(--palette-neutral-50);outline-offset:-1px}
.check td,.check th{padding:12px 8px}
.verdict{font-weight:600;white-space:nowrap}
.verdict.bad{color:var(--caution)}
.verdict.ok{color:var(--primary)}
.verdict.none{color:var(--muted-foreground)}
.strip{display:flex;flex-direction:column;gap:2px}
.strip-l{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0 16px;font-size:14px;line-height:1.5}
.strip-l span{color:var(--muted-foreground)}
.strip-l strong{font-weight:600}
.flow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14px}
.flow span{border:1px solid var(--border);border-radius:8px;padding:4px 12px;white-space:nowrap}
.flow .new{border-color:var(--primary);color:var(--primary);font-weight:600}
.pros{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}
.pros b{display:block;font-weight:600}
a{color:var(--link)}
@media (max-width:760px){
  .page{padding:20px 16px 48px;gap:40px}
  h1{font-size:24px}h2{font-size:20px}
  .card{padding:16px}
  .pc{display:none}.ph{display:block}
  .pc-i{display:none}.ph-i{display:inline}
  .two,.tiles,.flaws,.pros{grid-template-columns:minmax(0,1fr)}
  .hide-ph{display:none}
  table{font-size:13px}
  th,td{padding:6px 4px}
  .t-grid{font-size:12px}
  .t-grid .rh{width:27%}
  .t-grid td{padding:8px 0}
  .t-grid thead th{font-size:11px;padding:6px 1px}
  .check,.check tbody,.check tr,.check td,.check th{display:block;width:100%}
  .check thead{display:none}
  .check tr{padding:10px 0;border-bottom:1px solid var(--border)}
  .check td,.check th{padding:2px 0;border:0}
  .verdict{white-space:normal}
  .pin{width:22px;height:22px;line-height:22px;font-size:12px}
  .flow span{white-space:normal}
}`;

const checks = [
  ["שינוי קבוע של הדולר בכל שנה", `על אותה תוכנית, בכל ${n.path.h10.count} התקופות של 10 שנים מאז 2000: אותו ממוצע של הדולר נותן סכום שונה ב־${pct(n.path.h10.low * 100)} עד ${pct(n.path.h10.high * 100)}, לפי הסדר שבו השנים הגיעו, כי ההפקדות החודשיות קונות בשערים שונים (לפני עמלות ומס). זה יותר מהמרחק בין הקו לרצועה בכל הצד השמאלי של הגרף.`, "מטעה", "bad"],
  ["טווח לסוג אחד, מספר אחד לשני", `התשואה של 7% היא הנחה גם בקרן המנוטרלת. ב־5% עד 9% בשנה היא משאירה ${nis(m5.hedged)} עד ${nis(m9.hedged)}: הפרש של ${nis(m9.hedged - m5.hedged)}, פי ${num((m9.hedged - m5.hedged) / (band.high - band.low), 1)} מהרצועה שלה (${nis(band.low)} עד ${nis(band.high)}). ובפועל היא ירדה ${iso(`${num(-R[0].hedged)}%`)} ב־2022, כשהקרנות בלי נטרול ירדו ${iso(`${num(-R[0].unhedgedHigh)}%`)} עד ${iso(`${num(-R[0].unhedgedLow)}%`)}.`, "מטעה, וזה העיקר", "bad"],
  ["נקודת המפגש נראית כמו תחזית", `${pct(sc.crossing, 2)} יוצא אותו דבר ב־5, 10, 20 ו־30 שנים (ו־${pct(n.crossings[4].crossing, 2)} עד ${pct(n.crossings[5].crossing, 2)} בתשואה של 4% עד 10%). זו לא תכונה של התוכנית: זה רק כמה הקרן המנוטרלת מפגרת בשנה, בשתי ספרות שלא מגיעות לה. והרצועה האפורה משווה תנועות מ־2000 עד 2026 לפיגור שנמדד רק ב־2022 עד 2025, ואז ${n.dollar.stretchesTotal - n.dollar.stretchesBelowCrossing} מתוך ${n.dollar.stretchesTotal} התקופות יוצאות "לטובת" קרן בלי נטרול, בלי שנאמר כך.`, "מטעה", "bad"],
  ["המס על תנועת הדולר בקרן ישראלית", `החישוב נכון. שתי הקרנות בשקלים, והרווח הריאלי נמדד מול מדד המחירים לצרכן, אז גם רווח שבא מהדולר ממוסה: ${num(taxShare * 100, 0)}% מכל הפרש הולך למס (${nis(uTax[0].tax)} מס ב־${pct(-3, 0)} לדולר, ${nis(uTax[2].tax)} ב־${pct(3, 0)}). רק שהעמוד לא אומר את זה. בקרן שנקנית בחו״ל המס נמדד אחרת.`, "לא מטעה, רק חסר", "ok"],
  ["עלות הנטרול תלויה בפער הריביות", `אי אפשר לבדוק את זה כאן: באתר אין נתון ריבית של ארצות הברית מול ישראל, ובבסיס הכללים אין כלל שאומר למה הנטרול עולה ומה יקבע את זה. מה שכן יש: בכל ${allShorts.length} שנות הדוח של ${heFundsWithYears} הקרנות המנוטרלות הקרן מפגרת אחרי המדד שלה, ב־${iso(num(-Math.min(...allShorts)))} נקודות לכל היותר כולל דמי ניהול, אבל הדוחות הם רק מ־2022 ואילך. הרצועה היום מניחה שכך יימשך 10 שנים.`, "לא ידוע, חסר מקור", "none"],
];

const optionA = `<div class="card mock">
    <div class="col"><h3 style="font-size:20px">עם נטרול מט״ח או בלי: מה קרה בפועל</h3>
    <p>שתי הקרנות עוקבות אחרי אותו מדד אמריקאי. קרן בלי נטרול מט״ח זזה גם עם המדד וגם עם שער הדולר מול השקל. קרן עם נטרול מט״ח זזה כמעט רק עם המדד, אבל בכל שנה שיש עליה דוח היא השיגה פחות ממנו.</p></div>
    <div class="tiles">
      <div class="tile"><b>מה הנטרול מבטל: שער הדולר</b><strong>${pct(yLo)} <span class="to">עד</span> ${pct(yHi)}</strong><span class="xs muted">כך זז הדולר מול השקל בשנה אחת, 2001 עד 2025. בממוצע של 10 שנים רצופות: ${pct(st.low)} עד ${pct(st.high)} בשנה.</span></div>
      <div class="tile"><b>מה הנטרול עולה: פער מהמדד</b><strong>${iso(num(shLo))} <span class="to">עד</span> ${iso(num(shHi))} נקודות בשנה</strong><span class="xs muted">בכמה <bdi>${heName}</bdi> השיגה פחות מהמדד שלה, 2022 עד 2025, כולל דמי ניהול של ${iso(`${num(n.hedgedCost.fees, 2)}%`)}. קרנות בלי נטרול נשארו קרובות למדד שלהן: ${iso(signed(n.unhedgedRecord.low))} עד ${iso(signed(n.unhedgedRecord.high))} נקודות.</span></div>
      <div class="tile"><b>מה הנטרול לא מבטל: ירידה של השוק</b><strong>${pct(R[0].hedged)} ב־2022</strong><span class="xs muted">ב־2022 המדד ירד ${iso(`${num(-R[0].hedgedTarget)}%`)} בדולרים, אבל הדולר עלה ${iso(`${num(R[0].dollar)}%`)}. זה ריכך את הירידה: קרנות בלי נטרול ירדו רק ${iso(`${num(-R[0].unhedgedHigh)}%`)} עד ${iso(`${num(-R[0].unhedgedLow)}%`)}, והקרן עם הנטרול ירדה ${iso(`${num(-R[0].hedged)}%`)}. ב־2025 קרה ההפך: המדד עלה ${iso(`${num(R[3].hedgedTarget)}%`)} בדולרים, אבל הדולר ירד ${iso(`${num(-R[3].dollar)}%`)}. זה לקח את רוב העלייה: קרנות בלי נטרול עלו רק ${iso(`${num(R[3].unhedgedLow)}%`)} עד ${iso(`${num(R[3].unhedgedHigh)}%`)}, והקרן עם הנטרול עלתה ${iso(`${num(R[3].hedged)}%`)}.</span></div>
    </div>
    <div class="two">
      <div class="col"><h3>מה הדולר עשה מול השקל בכל שנה</h3><p class="xs muted">באחוזים. ב־${n.fallsOfYears.falls} מתוך ${n.fallsOfYears.count} שנים הדולר ירד. העמודות הבהירות: השנים שיש עליהן דוחות של הקרנות.</p>${both(yearBars)}</div>
      <div class="col"><h3>מה הקרנות עשו באותן שנים</h3><p class="xs muted">באחוזים, אחרי כל ההוצאות של הקרן, לפני מס.</p>${legendKinds}${both(groupBars)}</div>
    </div>
    ${reportedTable()}
    <p><strong>בתוכנית שלכם:</strong> הפרש של נקודת אחוז אחת בכל שנה, בין שהוא בא מהדולר ובין שהוא בא מהפער, שווה בסוף ${n.plan.years} השנים ${nis(round100(worthLo))} עד ${nis(round100(worthHi))}, בכסף של היום ואחרי מס. אם שער הדולר לא ישתנה והפער יישאר כמו בדוחות, קרן בלי נטרול תשאיר ${nis(gapFlat)} יותר. ככל שהדולר ייחלש ההפרש קטן, ואם הוא ייחלש בקצב גדול מהפער, ההפרש יתהפך.</p>
    <p class="small muted">זה בסיס קטן: ארבע שנים, וקרן אחת עם נטרול על המדד הזה. זה מה שקרה, לא מה שיקרה. גם רווח שבא מהדולר ממוסה: כל עוד יש רווח ריאלי, ${num(taxShare * 100, 0)}% מכל הפרש בין הקרנות הולך למס. למה הקרן עם הנטרול משיגה פחות מהמדד, ומה יקבע את זה בעתיד: עוד אין לאתר מקור.</p>
  </div>`;

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>נטרול מט״ח: אפשרויות</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}</style></head><body><main class="page">

<section>
  <h1>עם נטרול מט״ח או בלי: מה מטעה, ומה אפשר להראות במקום</h1>
  <p class="measure muted">הכול על מדד S&amp;P 500 בעמוד ההשקעה במדד, בתוכנית לדוגמה של האתר: ${nis(n.plan.amountNow)} ועוד ${nis(n.plan.monthly)} בחודש, ${n.plan.years} שנים, ${iso(`${Math.round(n.plan.grossReturn * 100)}%`)} בשנה בדולרים, אינפלציה ${iso(`${Math.round(n.plan.inflation * 100)}%`)}. נתונים של ${iso(dateHe)}. כל סכום חושב בפונקציות של האתר; כל מה שאינו כזה מסומן.</p>
  <p class="measure"><strong>בקצרה:</strong> הגרף מציג את הקרן המנוטרלת כמספר בטוח ואת הקרן הרגילה כהימור, ואת הבחירה ביניהן כתחזית על הדולר. בפועל שתיהן עוקבות אחרי אותו שוק. הנטרול מחליף תנודה גדולה לשני הכיוונים בפיגור קטן לכיוון אחד, כפי שנראה בדוחות, ושום נקודה על ציר הדולר לא מכריעה ביניהן.</p>
</section>

<section>
  <h2>היום</h2>
  <div class="shot"><img src="${img("today-cards.png")}" alt="שתי הכרטיסיות בראש העמוד כפי שהן היום"><span class="pin" style="right:73%;top:29%">1</span></div>
  <div class="shot"><img src="${img("today-section.png")}" alt="הגוש עם נטרול מט״ח או בלי כפי שהוא היום"><span class="pin" style="right:49%;top:62%">3</span><span class="pin" style="right:32%;top:73%">1</span><span class="pin" style="right:27%;top:59%">2</span><span class="pin" style="right:25%;top:44%">4</span></div>
  <ol class="flaws small">
    <li><span class="pin-l">1</span><span>מספר אחד מול טווח: נראה שרק הקרן בלי נטרול אינה ודאית. המילים "בלי קשר לשער הדולר" נשמעות כמו "בטוח".</span></li>
    <li><span class="pin-l">2</span><span>קו ישר של שינוי קבוע כל 10 שנים. הדולר לא זז כך: בשנה אחת הוא זז בין ${pct(yLo)} ל־${pct(yHi)}.</span></li>
    <li><span class="pin-l">3</span><span>${pct(sc.crossing, 2)} בשתי ספרות, וגם המשפט "משאירה יותר רק אם": נראה כמו סף להחלטה, וקוראים אותו כתחזית.</span></li>
    <li><span class="pin-l">4</span><span>הרצועה האפורה מלמדת "מה סביר" על ציר הדולר, אבל הפיגור שמולה נמדד רק בארבע שנים.</span></li>
  </ol>
  <h3>מה נבדק, ומה יצא</h3>
  <div class="table-wrap"><table class="check small">
    <thead><tr><th scope="col" style="width:20%">החשד</th><th scope="col">מה החישוב הראה</th><th scope="col" style="width:14%">התוצאה</th></tr></thead>
    <tbody>${checks.map(([a, b, v, cls]) => `<tr><th scope="row">${a}</th><td>${b}</td><td><span class="verdict ${cls}">${v}</span></td></tr>`).join("")}</tbody>
  </table></div>
</section>

<section>
  <h2>בכל שלוש האפשרויות</h2>
  <div class="flow"><span>התוכנית</span><span>התוצאה: שתי הכרטיסיות הרגילות</span><span>חשבונות וקרנות</span><span>מחירים לקבוצות</span><span>מה הכי משנה</span><span class="new">עם נטרול מט״ח או בלי</span></div>
  <ul class="small measure" style="margin:0;padding-inline-start:20px">
    <li>הגוש יורד לתחתית העמוד. הגרף "מה הדולר עשה מול השקל בכל שנה" נשאר בו.</li>
    <li>בראש העמוד הכרטיסיות חוזרות להיות כמו בכל מדד אחר, ומתחת לסכום של קרן בלי נטרול נוספת השורה "אם הדולר לא זז מול השקל". בלעדיה הסכום היחיד מסתיר הנחה.</li>
    <li>רשימת הקרנות לא משתנה.</li>
  </ul>
</section>

<section>
  <div class="opt-h"><h2>אפשרות א: מה קרה בכל שנה</h2><span class="tag rec">מומלצת</span></div>
  <p class="measure muted">בלי שום הנחה על העתיד: הגרף של הדולר נשאר, ולידו מה שתי הקרנות עשו באותן שנים, לפי הדוחות.</p>
  ${optionA}
  <div class="pros small"><div><b>למה מומלצת</b>היא לא מסיקה ולא מנחשת: מספרים מדוחות ומשערי מטבע, באותן שנים, ועוד משפט אחד על התוכנית. היא בונה על הגרף שכבר עובד. מי שקורא אותה רואה ש־2022 ו־2025 הפוכות, וזו האמת על הבחירה.</div><div><b>מה חסר בה</b>רק ארבע שנים של קרנות, כי זה מה שהדוחות שנאספו נותנים. בתקופה ארוכה יותר ייתכן שהתמונה שונה, והעמוד אומר זאת.</div></div>
</section>

<section>
  <div class="opt-h"><h2>אפשרות ב: ההפרש, לפי שני דברים שלא יודעים</h2></div>
  <p class="measure muted">נשארים בחישוב קדימה, אבל בהפרש בלבד, ובלי להעמיד פנים שרק הדולר לא ידוע: גם הפיגור של הקרן המנוטרלת הוא ציר.</p>
  <div class="card mock">
    <div class="col"><h3 style="font-size:20px">עם נטרול מט״ח או בלי: כמה יותר משאירה כל אחת</h3>
    <p class="muted">בתוכנית שלכם, בעוד ${n.plan.years} שנים, בכסף של היום ואחרי מס. <bdi>${unName}</bdi> מול <bdi>${heName}</bdi>, באותו חשבון. <span class="pc-i">בשקלים.</span><span class="ph-i">באלפי שקלים.</span></p></div>
    <div class="legend"><span><i style="background:var(--chart-kind-unhedged)"></i>בלי נטרול משאירה יותר</span><span><i style="background:var(--chart-kind-hedged)"></i>◆ עם נטרול משאירה יותר</span></div>
    ${gridTable()}
    <p class="small muted">השורה המסומנת מהדוחות; בשאר השורות הפיגור הוא ערך לדוגמה, כי אין לאתר מקור למה שיקבע אותו. בעבר הדולר נע בממוצע של 10 שנים בין ${pct(st.low)} ל־${pct(st.high)} בשנה. שינוי קבוע הוא פישוט: על אותו ממוצע, סדר השנים לבדו מזיז את הסכום של קרן בלי נטרול ב־${pct(n.path.h10.low * 100, 0)} עד ${pct(n.path.h10.high * 100, 0)}.</p>
  </div>
  <div class="pros small"><div><b>מה טוב בה</b>מראה הכול בבת אחת, מחליפה את נקודת המפגש בגבול אלכסוני, ומבטלת את הרושם שרק צד אחד לא ודאי. מתעדכנת לפי התוכנית.</div><div><b>מה חסר בה</b>עדיין מניחה שינוי קבוע ותשואה זהה בשתי הקרנות, ולא מראה ש־2022 הייתה הפוכה. ארבע משורותיה הן ערכים לדוגמה. קוראים אותה מהר כתחזית.</div></div>
</section>

<section>
  <div class="opt-h"><h2>אפשרות ג: כמה כל דבר מזיז בשנה</h2></div>
  <p class="measure muted">תמונה אחת, ציר אחד, בלי כסף ובלי תוכנית: השוק, הדולר והפיגור באותו קנה מידה.</p>
  <div class="card mock">
    <div class="col"><h3 style="font-size:20px">עם נטרול מט״ח או בלי: מה גדול ומה קטן</h3>
    <p class="muted">כל נקודה היא שנה אחת. הנטרול מסיר את השורה של הדולר ומוסיף את השורה של הפיגור. השוק נשאר בכל מקרה.</p></div>
    <div class="col" style="gap:14px">
      ${stripRowHtml("מדד S&amp;P 500 בדולרים, 2022 עד 2025", `${pct(Math.min(...n.marketYears.map((m) => m.usd)))} עד ${pct(Math.max(...n.marketYears.map((m) => m.usd)))}`, dots(n.marketYears.map((m) => m.usd), C.m))}
      ${stripRowHtml(`הדולר מול השקל בשנה אחת, ${years[0].year} עד ${years[years.length - 1].year}`, `${pct(yLo)} עד ${pct(yHi)}`, dots(years.map((y) => y.pct), C.d))}
      ${stripRowHtml(`הדולר מול השקל, ממוצע לשנה בכל ${st.count} התקופות של 10 שנים`, `${pct(st.low)} עד ${pct(st.high)}`, rangeBar(st.low, st.high, C.dim))}
      ${stripRowHtml(`קרנות מנוטרלות מול המדד שלהן: ${heFundsWithYears} קרנות, כל המדדים, ${allShorts.length} שנות דוח`, `${pct(Math.min(...allShorts))} עד ${pct(Math.max(...allShorts))}`, dots(allShorts, C.h))}
      ${stripRowHtml(`קרנות S&amp;P 500 בלי נטרול מול המדד שלהן: ${n.unhedgedRecord.count} שנות דוח`, `${pct(n.unhedgedRecord.low)} עד ${pct(n.unhedgedRecord.high)}`, dots(n.unhedgedRecord.fundYears, C.u), true)}
    </div>
    <p class="small muted">ציר משותף באחוזים בשנה, משמאל לימין. הפיגור כולל את דמי הניהול. למה הקרנות המנוטרלות מפגרות ומה יקבע את זה בעתיד: עוד אין לאתר מקור.</p>
  </div>
  <div class="pros small"><div><b>מה טוב בה</b>הכי קצרה, ותופסת במבט אחד את העיקר: השוק גדול מהכול, הדולר רחב ולשני הכיוונים, הפיגור צר ולכיוון אחד. כוללת את כל הקרנות המנוטרלות, לא אחת.</div><div><b>מה חסר בה</b>לא מראה איך זה נגמר בכסף, ולא ש־2022 ו־2025 הפוכות. בפיגור מעורבבים מדדים שונים, ובשורת הקרנות בלי נטרול רק S&amp;P 500. היא מדויקת אבל מופשטת.</div></div>
</section>

</main></body></html>`;
writeFileSync(join(here, "mockups.html"), html);
const head = html.slice(0, html.indexOf("<section>"));
const onlyA = `${head}<section>
  <h1>אפשרות א, בניסוח החדש</h1>
  <p class="measure muted">הגוש שיישב בתחתית עמוד ההשקעה במדד, על מדד S&amp;P 500. התוכנית לדוגמה של האתר: ${nis(n.plan.amountNow)} ועוד ${nis(n.plan.monthly)} בחודש, ${n.plan.years} שנים, ${iso(`${Math.round(n.plan.grossReturn * 100)}%`)} בשנה בדולרים, אינפלציה ${iso(`${Math.round(n.plan.inflation * 100)}%`)}. נתונים של ${iso(dateHe)}. הגרפים, הכרטיסים והטבלה כמו בגרסה הראשונה; השתנה רק הניסוח.</p>
</section>
<section>${optionA}</section>
</main></body></html>`;
writeFileSync(join(here, "option-a.html"), onlyA);
console.log("written", html.length, onlyA.length);
