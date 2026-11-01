// Third round: three sketches that start from real choices. Every number is the site's engine output for the plan named in the header (scen.json).
import { readFileSync, writeFileSync } from "node:fs";
const S = process.argv[2], OUT = process.argv[3];
const d = JSON.parse(readFileSync(S + "/scen.json"));
const css = readFileSync(S + "/mock.css", "utf8") + readFileSync(S + "/mock3.css", "utf8");
const fmt = (x) => Math.round(x).toLocaleString("en");
const iso = (s) => s.replace(/[−+]?\d[\d,.]*%?(?: ₪)?/g, (m) => "⁦" + m + "⁩");
const T = (x, y, s, { a = "right", size = 13, fill = "var(--muted-foreground)", w = 400 } = {}) => `<text x="${x}" y="${y}" direction="rtl" text-anchor="${a === "right" ? "start" : a === "left" ? "end" : "middle"}" font-size="${size}" font-weight="${w}" fill="${fill}">${iso(s)}</text>`;
const pair = (h, f) => d.pairs.find((p) => p.h === h && p.f === f);
const Y = "5139282", ATF = "1218916", IBI = "1148162", IS = "ie00b5bmr087";
const C = { left: "var(--k-tracking)", tax: "var(--chart-tax)", account: "var(--chart-cost-trade)", fund: "var(--chart-fee)" };

// ---- A: squares of 1,000 shekels
const SC = [
  ["פייר", "קרן מחקה של ילין לפידות", "fair", Y], ["לאומי", "אותה קרן", "leumi", Y], ["מזרחי טפחות", "אותה קרן", "mizrahi-tefahot", Y],
  ["פסגות", "קרן סל יקרה של אי.בי.אי.", "psagot", IBI], ["אינטראקטיב ישראל", "קנייה בחו״ל", "interactive-israel", IS], ["בנק ירושלים", "קנייה בחו״ל", "jerusalem", IS],
];
const waffle = (p) => {
  const cell = 16, gap = 2, cols = 10, unit = 1000;
  const segs = [["left", p.left], ["tax", p.tax], ["account", p.account], ["fund", p.fund]];
  const total = segs.reduce((s, x) => s + x[1], 0) / unit;
  const n = Math.ceil(total);
  const rows = Math.ceil(n / cols);
  const out = [];
  let pos = 0;
  const bounds = segs.map(([k, v]) => { const b = [k, pos, pos + v / unit]; pos += v / unit; return b; });
  for (let i = 0; i < n; i++) {
    const x = (i % cols) * (cell + gap), y = Math.floor(i / cols) * (cell + gap);
    for (const [k, a, b] of bounds) {
      const lo = Math.max(a, i), hi = Math.min(b, i + 1);
      if (hi > lo) out.push(`<rect x="${x + (lo - i) * cell}" y="${y}" width="${Math.max((hi - lo) * cell, k === "fund" ? 2 : 0)}" height="${cell}" fill="${C[k]}"/>`);
    }
  }
  const W = cols * (cell + gap) - gap, H = 10 * (cell + gap) - gap;
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${out.join("")}</svg>`;
};
const partA = `<div class="wfs">${SC.map(([n, what, h, f]) => { const p = pair(h, f); return `<div class="wf"><b>${n}</b><span class="xs muted">${what}</span>${waffle(p)}<strong class="big n">${fmt(p.left)} ₪</strong><span class="xs"><i class="sw" style="background:${C.account}"></i> החשבון <span class="n">${fmt(p.account)} ₪</span></span><span class="xs"><i class="sw" style="background:${C.fund}"></i> הקרן <span class="n">${fmt(p.fund)} ₪</span></span></div>`; }).join("")}</div>`;
const legendA = `<div class="lg3"><span><i class="sw" style="background:${C.left}"></i>נשאר לכם</span><span><i class="sw" style="background:${C.tax}"></i>מס</span><span><i class="sw" style="background:${C.account}"></i>החשבון</span><span><i class="sw" style="background:${C.fund}"></i>הקרן</span></div>`;

// ---- B: the years
const deposits = [...Array(11).keys()].map((t) => { let v = 10000; for (let m = 1; m <= 12 * t; m++) v += 500 / Math.pow(1.02, m / 12); return v; });
const LN = [
  ["קרן מחקה בפייר", "fair|" + Y, "var(--k-tracking)"], ["קרן סל יקרה בפסגות", "psagot|" + IBI, "var(--k-etf)"], ["קרן מחקה במזרחי טפחות", "mizrahi-tefahot|" + Y, "var(--k-foreign)"], ["קנייה בחו״ל בבנק ירושלים", "jerusalem|" + IS, "var(--k-abroad)"],
];
const lines = (W, H, phone) => {
  const m = { l: phone ? 44 : 56, r: phone ? 14 : 270, t: 12, b: 34 };
  const sx = (t) => m.l + (t / 10) * (W - m.l - m.r), sy = (v) => H - m.b - (v / 90000) * (H - m.t - m.b);
  const o = [];
  for (const g of [0, 30000, 60000, 90000]) o.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${sy(g)}" y2="${sy(g)}" stroke="var(--chart-grid)"/><text x="${m.l - 8}" y="${sy(g) + 4}" text-anchor="end" font-size="12" fill="var(--chart-text)">${g ? fmt(g) : "0"}</text>`);
  for (let t = 0; t <= 10; t += 2) o.push(`<text x="${sx(t)}" y="${H - m.b + 18}" text-anchor="middle" font-size="12" fill="var(--chart-text)">${t}</text>`);
  o.push(T(sx(5), H - 2, "שנים", { a: "mid", size: 12 }));
  o.push(`<path d="${deposits.map((v, t) => `${t ? "L" : "M"}${sx(t)} ${sy(v)}`).join("")}" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-dasharray="5 5"/>`);
  for (const [, k, col] of LN) o.push(`<path d="M${sx(0)} ${sy(10000)}${d.lines[k].map((v, i) => `L${sx(i + 1)} ${sy(v)}`).join("")}" fill="none" stroke="${col}" stroke-width="2.5"/><circle cx="${sx(10)}" cy="${sy(d.lines[k][9])}" r="4" fill="${col}"/>`);
  if (!phone) {
    for (const [n, k] of LN) { const v = d.lines[k][9]; o.push(T(sx(10) + 12, sy(v) + 5, `${fmt(v)} ₪ ${n}`, { a: "left", size: 14, fill: "var(--foreground)" })); }
    o.push(T(sx(10) + 12, sy(deposits[10]) + 5, `${fmt(deposits[10])} ₪ מה שהופקד`, { a: "left", size: 13 }));
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${o.join("")}</svg>`;
};
const linesKey = `<div class="ph lg4">${LN.map(([n, k, c]) => `<span><i class="sw" style="background:${c}"></i>${n}: <b class="n">${fmt(d.lines[k][9])} ₪</b></span>`).join("")}<span><i class="sw" style="background:var(--muted-foreground)"></i>מה שהופקד: <b class="n">${fmt(deposits[10])} ₪</b></span></div>`;

// ---- C: stairs from what was picked
const COL = { fund: "var(--k-etf)", type: "var(--k-foreign)", account: "var(--k-tracking)" };
const v = (h, f) => pair(h, f).left;
const ST = [
  { from: "קרן סל יקרה של אי.בי.אי., בלאומי", start: v("leumi", IBI), steps: [["fund", "קרן סל זולה", "ATF, בלאומי", v("leumi", ATF)], ["type", "קרן מחקה", "ילין לפידות, בלאומי", v("leumi", Y)], ["account", "חשבון אחר", "אותה קרן, בפייר", v("fair", Y)]] },
  { from: "קנייה בחו״ל, בבנק ירושלים", start: v("jerusalem", IS), steps: [["type", "קרן מחקה", "באותו בנק", v("jerusalem", Y)], ["account", "חשבון אחר", "אותה קרן, בפייר", v("fair", Y)]] },
  { from: "קרן מחקה של ילין לפידות, במזרחי טפחות", start: v("mizrahi-tefahot", Y), steps: [["account", "חשבון אחר", "אותה קרן, בפייר", v("fair", Y)]] },
];
const stairs = (s) => {
  const W = 370, H = 330, top = 34, bottom = 56, LO = 50000, HI = 90000;
  const sy = (x) => H - bottom - ((x - LO) / (HI - LO)) * (H - top - bottom);
  const n = s.steps.length + 1, bw = (W - 8) / 4 - 10;
  const xOf = (i) => 4 + i * (bw + 10);
  const o = [];
  o.push(`<rect x="${xOf(0)}" y="${sy(s.start)}" width="${bw}" height="${sy(LO) - sy(s.start)}" fill="var(--palette-neutral-600)"/>`);
  o.push(`<text x="${xOf(0) + bw / 2}" y="${sy(s.start) - 8}" text-anchor="middle" font-size="14" font-weight="600" fill="var(--foreground)">${fmt(s.start)} ₪</text>`);
  o.push(T(xOf(0) + bw / 2, H - bottom + 18, "מה שנבחר", { a: "mid", size: 12.5, fill: "var(--foreground)" }));
  let cur = s.start;
  s.steps.forEach(([k, l1, l2, to], i) => {
    const x = xOf(i + 1);
    o.push(`<line x1="${x - 10}" x2="${x}" y1="${sy(cur)}" y2="${sy(cur)}" stroke="var(--palette-neutral-600)"/>`);
    o.push(`<rect x="${x}" y="${sy(to)}" width="${bw}" height="${Math.max(sy(cur) - sy(to), 2)}" fill="${COL[k]}"/>`);
    o.push(`<text x="${x + bw / 2}" y="${sy(to) - 8}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--foreground)">+${fmt(to - cur)} ₪</text>`);
    o.push(T(x + bw / 2, H - bottom + 18, l1, { a: "mid", size: 12.5, fill: "var(--foreground)" }));
    const w = l2.split(", ");
    w.forEach((t, j) => o.push(T(x + bw / 2, H - bottom + 34 + j * 15, t, { a: "mid", size: 11.5 })));
    cur = to;
  });
  o.push(`<line x1="0" x2="${W}" y1="${sy(LO)}" y2="${sy(LO)}" stroke="var(--chart-axis)"/>`);
  return `<div class="st"><span class="xs muted">מתחילים מ:</span><b>${s.from}</b><svg viewBox="0 0 ${W} ${H}" role="img">${o.join("")}</svg><span class="xs">בסוף: <strong class="n">${fmt(cur)} ₪</strong></span></div>`;
};
const legendC = `<div class="lg3"><span><i class="sw" style="background:${COL.fund}"></i>להחליף קרן</span><span><i class="sw" style="background:${COL.type}"></i>להחליף סוג קרן</span><span><i class="sw" style="background:${COL.account}"></i>להחליף חשבון</span></div>`;

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>עמוד המדד: שלושה רעיונות</title><style>${css}</style></head><body><div class="doc">
<header class="doc-h"><h1>עמוד המדד: שלושה רעיונות אחרים</h1><p class="muted small">סקיצות בלבד. S&P 500, <span class="n">10,000 ₪</span> היום ועוד <span class="n">500 ₪</span> בחודש, 10 שנים, תשואה של 7% ואינפלציה של 2%. כל מספר מהמחשבון של האתר, אחרי מס ובכסף של היום, לפי המחירון הרגיל.</p></header>
<section class="option"><div class="opt-h"><h2>רעיון א: מה שבחרתם, ומה כדאי להחליף קודם</h2><span class="tag rec">מומלץ</span></div>
<p class="muted small">בעמוד עצמו נקודת ההתחלה היא החשבון והקרן שבוחרים בשני השדות. כאן שלוש נקודות התחלה לדוגמה. כל מדרגה מחליפה דבר אחד, וגובה המדרגה הוא הכסף שהיא מוסיפה. הגובה זהה בשלוש התמונות.</p>
<div class="card pad">${legendC}<div class="sts">${ST.map(stairs).join("")}</div></div></section>
<section class="option"><div class="opt-h"><h2>רעיון ב: לאן הולך הכסף</h2></div>
<p class="muted small">כל ריבוע הוא 1,000 ₪. בלי מס ובלי עלויות היו בסוף <span class="n">${fmt(pair("fair", Y).base)} ₪</span>, ולכן בכל תמונה אותו מספר ריבועים. רק הצבעים משתנים.</p>
<div class="card pad">${legendA}${partA}</div></section>
<section class="option"><div class="opt-h"><h2>רעיון ג: הכסף לאורך השנים</h2></div>
<p class="muted small">ארבע בחירות אמיתיות על אותו גרף, אחרי מס ובכסף של היום. כל נקודה היא מה שהיה נשאר אם מוכרים באותה שנה. הקו המקווקו הוא מה שהופקד, בכסף של היום.</p>
<div class="card pad"><div class="pc">${lines(1100, 420, false)}</div><div class="ph">${lines(346, 300, true)}</div>${linesKey}</div></section>
</div></body></html>`;
writeFileSync(OUT, html);
console.log(ST.map((s) => [Math.round(s.start), s.steps.map((x) => Math.round(x[3]))]), Math.round(deposits[10]));
