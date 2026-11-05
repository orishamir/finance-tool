// Round 2 drawings of the two new pieces (the result card's strips and the every-pair dot plot) in V1's and V2's colours, from the
// same numbers.json as the 5 November drawing (research/specs/2026-11-05-indices-visuals/gen.mjs, today's colours). Writes
// mockups-V1.html and mockups-V2.html; only the cards are photographed, so nothing outside a card reaches a reader.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/round2/gen.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { H } from "../rec/lib.mjs";
import { V, KIND_HE } from "./colours.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const N = JSON.parse(readFileSync(join(here, "../../2026-11-05-indices-visuals/numbers.json"), "utf8"));
const s = N.sp500;
const fmt = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });
const num = (n) => `${n < 0 ? "−" : ""}${fmt.format(Math.abs(Math.round(n)))}`;
const nis = (n) => `<span class="n">${num(n)}&nbsp;₪</span>`;
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
// the same short names as the 5 November drawing
const FUND_SHORT = { "5139282": "ילין לפידות מחקה", "1150333": "MTF סל", "5129275": "הראל מחקה", "5139100": "אלטשולר שחם מחקה", "5124482": "קסם מחקה KTF" };
const cell = (a, f) => s.cells[`${a}|${f}`];
const fundById = Object.fromEntries(s.funds.map((f) => [f.id, f]));
const acctName = Object.fromEntries(s.accounts.map((a) => [a.id, a.name]));
const best = Math.round(s.top.v);
const bestPos = s.top.pos;
const LOCK = (c, size = 12) => `<svg class="lock" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" fill="${c}"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;

function build(key) {
  const v = V[key];
  const kindOf = (f) => (v.mergeForeign && (f.kind === "tase-foreign" || f.kind === "abroad") ? "foreign" : f.kind);
  const colOf = (k) => H(v.kinds[k === "foreign" ? "abroad" : k]);
  const kindsShown = v.mergeForeign ? ["il-tracking", "il-etf", "foreign"] : ["il-tracking", "il-etf", "tase-foreign", "abroad"];
  const PICK = H(v.pick);

  // ------------------------------------------------------------ part 1: the result card
  const bestFund = bestPos.f;
  const acctStrip = s.accounts.map((a) => ({ a: a.id, v: cell(a.id, bestFund) })).filter((x) => x.v && !x.v.open).map((x) => ({ a: x.a, v: x.v.v })).sort((x, y) => x.v - y.v);
  const fundStrip = s.funds.filter((f) => !f.hedged).map((f) => ({ f: f.id, v: cell(bestPos.a, f.id) })).filter((x) => x.v && !x.v.open).map((x) => ({ f: x.f, v: x.v.v })).sort((x, y) => x.v - y.v);
  const lo = Math.floor(Math.min(acctStrip[0].v, fundStrip[0].v) / 5000) * 5000;
  const hi = Math.ceil(best / 2000) * 2000 + 2000;
  const px = (x) => ((x - lo) / (hi - lo)) * 100;
  const tickCol = (it, which) => (v.strips.mode === "two" ? H(v.strips[which]) : colOf(kindOf(fundById[it.f ?? bestFund])));
  function strip(items, label, sub, leftName, rightName, which) {
    const min = items[0], max = items[items.length - 1];
    const ticks = items.map((it) => `<i class="tick" style="left:${px(it.v)}%;background:${tickCol(it, which)}"></i>`).join("");
    return `<div class="srow">
      <div class="slab"><b>${label}</b><span>${sub}</span></div>
      <div class="splot">
        <div class="sbar" style="left:${px(min.v)}%;width:${px(max.v) - px(min.v)}%;background:${H(v.strips.band)}"></div>${ticks}
        <div class="send l" style="right:${100 - px(min.v) + 0.6}%">${leftName}<br>${nis(min.v)}</div>
        <div class="send r" style="left:${px(max.v) + 0.6}%">${rightName}<br>${nis(max.v)}</div>
        <div class="sspan" style="left:${px(min.v)}%;width:${px(max.v) - px(min.v)}%">עד ${nis(max.v - min.v)}</div>
      </div></div>`;
  }
  const axisTicks = [];
  for (let x = lo; x <= hi; x += 5000) axisTicks.push(`<span style="left:${px(x)}%">${num(x)}</span>`);
  const sw = (c) => `<i class="tick static" style="background:${c}"></i>`;
  const acctSub = v.strips.mode === "two"
    ? `אותה קרן, ${FUND_SHORT[bestFund]}, ב־${acctStrip.length} חשבונות`
    : `אותה קרן, ${FUND_SHORT[bestFund]}: ${sw(colOf("il-tracking"))}${KIND_HE["il-tracking"]}, ב־${acctStrip.length} חשבונות`;
  const fundSub = `אותו חשבון, ${acctName[bestPos.a]}, ${fundStrip.length} קרנות`;
  const stripKinds = [...new Set(fundStrip.map((x) => kindOf(fundById[x.f])))];
  const stripLegend = v.strips.mode === "two" ? "" : `<div class="legend">${stripKinds.map((k) => `<span>${sw(colOf(k))}${KIND_HE[k]}</span>`).join("")}</div>`;
  const part1 = `
  <section class="frame"><div class="card result" id="card1">
    <div class="tiles">
      <div class="tile"><div class="k">הפקדתם</div><div class="big">${nis(s.costs.top.paidIn)}</div><div class="sub">10,000 ₪ עכשיו ועוד 500 ₪ בחודש, 120 חודשים</div></div>
      <div class="tile main"><div class="k">הכי הרבה נשאר בזוג הזה</div><div class="big">${nis(best)}</div>
        <div class="pair">${acctName[bestPos.a]} · ${FUND_SHORT[bestFund]} (4D) S&amp;P 500</div>
        <div class="sub">בעוד 10 שנים, אחרי דמי ניהול ומס, בכסף של היום</div></div>
    </div>
    <h3>כמה כל בחירה משנה</h3>
    <div class="strips">
      ${strip(acctStrip, "החשבון", acctSub, acctName[acctStrip[0].a], acctName[acctStrip[acctStrip.length - 1].a], "account")}
      ${strip(fundStrip, "הקרן", fundSub, FUND_SHORT[fundStrip[0].f] ?? fundById[fundStrip[0].f].name, FUND_SHORT[fundStrip[fundStrip.length - 1].f], "fund")}
      <div class="srow axisrow"><div class="slab"></div><div class="splot axis">${axisTicks.join("")}</div></div>
    </div>
    ${stripLegend}
    <p class="speak">בחשבון היקר ביותר נשארים ${nis(acctStrip[acctStrip.length - 1].v - acctStrip[0].v)} פחות על אותה קרן. בחירת הקרן, בחשבון הזה, משנה עד ${nis(fundStrip[fundStrip.length - 1].v - fundStrip[0].v)}.</p>
  </div></section>`;

  // ------------------------------------------------------------ part 2: every pair at once
  const rows = s.accounts.map((a) => {
    const ok = [], hedged = [], open = [];
    let none = 0;
    for (const f of s.funds) {
      const c = cell(a.id, f.id);
      if (!c) { none++; continue; }
      (c.open ? open : f.hedged ? hedged : ok).push({ f, v: c.v });
    }
    const top = ok.length ? Math.max(...ok.map((x) => x.v)) : null;
    return { a, ok, hedged, open, none, top };
  }).sort((x, y) => (y.top ?? -1e9) - (x.top ?? -1e9));
  const all = rows.flatMap((r) => [...r.ok, ...r.hedged, ...r.open].map((x) => x.v - best));
  const dmin = Math.floor(Math.min(...all) / 5000) * 5000;
  const dx = (d) => ((d - dmin) / (0 - dmin)) * 100;
  const pickA = "jerusalem", pickF = "1150333";
  const viaV = cell(bestPos.a, pickF).v;
  const pickV = cell(pickA, pickF).v;
  const rowIdx = Object.fromEntries(rows.map((r, i) => [r.a.id, i]));
  const RH = 34;
  const dotRows = rows.map((r) => {
    const all = [
      ...r.ok.map((x) => ({ ...x, m: "dot" })), ...r.hedged.map((x) => ({ ...x, m: "hollow" })), ...r.open.map((x) => ({ ...x, m: "open" })),
    ].map((x) => ({ ...x, isBest: r.a.id === bestPos.a && x.f.id === bestPos.f, isPick: r.a.id === pickA && x.f.id === pickF }));
    // the open-rule funds' locks, then the best and the picked dots, are drawn last, so nothing covers them
    all.sort((a, b) => (a.isBest || a.isPick) - (b.isBest || b.isPick));
    const dots = all.map((x) => {
      const c = colOf(kindOf(x.f)), L = dx(x.v - best);
      return `<i class="dot${x.m === "hollow" ? " hollow" : ""}${x.isBest || x.isPick ? " top" : ""}" style="left:${L}%;--c:${c}"></i>` +
        (x.isPick ? `<i class="ring" style="left:${L}%"></i>` : "") + (x.isBest ? `<i class="bstar" style="left:${L}%">★</i>` : "");
    }).join("");
    const locks = all.filter((x) => x.m === "open").map((x) => `<i class="lockmark" style="left:${dx(x.v - best)}%">${LOCK(H(v.lock), 12)}</i>`).join("");
    const marks = dots + locks;
    const topTxt = r.top == null ? `<span class="muted">אין מחיר מדורג</span>` : r.top === best ? `<b class="star">★ ${nis(r.top)}</b>` : nis(r.top - best);
    return `<div class="drow"><div class="dname">${esc(r.a.name)}</div><div class="dbest">${topTxt}</div><div class="dplot">${marks}</div><div class="dnone">${r.none ? `אין מחיר: ${r.none}` : ""}</div></div>`;
  }).join("");
  const gx = [];
  for (let d = dmin; d <= 0; d += 5000) gx.push(`<span style="left:${dx(d)}%">${num(d)}</span>`);
  const grid = gx.map((_, i) => `<i class="vgrid" style="left:${dx(dmin + i * 5000)}%"></i>`).join("");
  const yP = rowIdx[pickA] * RH + RH / 2, yB = rowIdx[bestPos.a] * RH + RH / 2;
  const xP = dx(pickV - best), xV = dx(viaV - best), xB = dx(0);
  const path = `<svg class="path" viewBox="0 0 1000 ${rows.length * RH}" preserveAspectRatio="none" style="height:${rows.length * RH}px">
    <line x1="${xP * 10}" y1="${yP}" x2="${xV * 10}" y2="${yB}" vector-effect="non-scaling-stroke"/>
    <line x1="${xV * 10}" y1="${yB}" x2="${xB * 10}" y2="${yB}" vector-effect="non-scaling-stroke"/></svg>`;
  const legend =
    kindsShown.map((k) => `<span><i class="dot static" style="--c:${colOf(k)}"></i>${KIND_HE[k]}</span>`).join("") +
    `<span><i class="dot static hollow" style="--c:${colOf(kindOf(s.funds.find((f) => f.hedged)))}"></i>מנוטרלת מט״ח: מוצגת ולא מדורגת</span>` +
    `<span><span class="lockkey"><i class="dot static" style="--c:${colOf(kindOf(s.funds.find((f) => f.kind === "abroad") ?? s.funds[0]))}"></i>${LOCK(H(v.lock), 13)}</span>המס עליה עוד לא ברור: מוצגת ולא מדורגת</span>` +
    `<span><b class="bstar static">★</b>הזוג שמשאיר הכי הרבה</span>` +
    `<span><i class="ring static"></i>הבחירה שלכם (כאן: לדוגמה)</span>` +
    `<span><svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="${PICK}" stroke-width="1.5" stroke-dasharray="4 3"/></svg>הדרך ממנה לזוג הטוב ביותר: קודם חשבון אחר, אחר כך קרן אחרת</span>`;
  const part2 = `
  <section class="frame"><div class="card" id="card2">
    <h3>כל הזוגות של חשבון וקרן על S&amp;P 500</h3>
    <p class="sub">כמה פחות נשאר בכל זוג, לעומת הזוג שמשאיר הכי הרבה. כל שורה היא חשבון וכל נקודה היא קרן.</p>
    <div class="legend big">${legend}</div>
    <div class="dhead"><div class="dname">החשבון</div><div class="dbest">הכי טוב בחשבון</div><div class="dplot-h">← נשאר פחות &nbsp;·&nbsp; כמה פחות מהזוג הטוב ביותר (₪) &nbsp;·&nbsp; נשאר יותר →</div><div class="dnone"></div></div>
    <div class="dwrap"><div class="dplotbg">${grid}</div>${dotRows}<div class="dpathwrap">${path}</div></div>
    <div class="drow axisrow"><div class="dname"></div><div class="dbest"></div><div class="dplot axis">${gx.join("")}</div><div class="dnone"></div></div>
    <p class="speak">השורות רחוקות זו מזו והנקודות בכל שורה קרובות: החשבון משנה עד ${nis(rows[0].top - rows.filter((r) => r.top != null).at(-1).top)}, הקרן בתוך חשבון הרבה פחות. בבחירה לדוגמה, ${acctName[pickA]} ו־MTF סל, נשארים ${nis(best - pickV)} פחות: ${nis(viaV - pickV)} בגלל החשבון ו־${nis(best - viaV)} בגלל הקרן.</p>
  </div></section>`;

  const css = `
@font-face{font-family:Heebo;src:url(../../../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(../../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
:root{--bg:oklch(0.17 0.004 80);--card:oklch(0.2 0.005 80);--pop:oklch(0.235 0.006 80);--fg:oklch(0.955 0.005 80);--mut:oklch(0.82 0.008 80);--bd:oklch(0.27 0.007 80);--grid:oklch(0.27 0.007 80);--axis:oklch(0.4 0.009 80);--computed:oklch(0.7 0.15 295);--pick:${PICK}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:Inter,Heebo,Arial,sans-serif;font-size:16px;line-height:1.7}
.page{max-width:1376px;margin:0 auto;padding:24px 32px 80px}.frame{margin:0 0 40px}
.n{font-variant-numeric:tabular-nums;white-space:nowrap;unicode-bidi:isolate;direction:ltr;border-bottom:1.5px dotted var(--computed)}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:24px 28px}
h3{font-size:20px;margin:0 0 4px}.sub{color:var(--mut);font-size:14px;margin:0 0 12px}.speak{margin:16px 0 0;font-size:16px;max-width:none}
.tiles{display:flex;gap:24px;align-items:stretch;margin-bottom:20px}.tile{padding:12px 16px}.tile.main{flex:1;background:var(--pop);border:1px solid var(--axis);border-radius:10px}
.k{color:var(--mut);font-size:14px}.big{font-size:32px;font-weight:700;line-height:1.3}.pair{font-size:18px;font-weight:600}.tile .sub{margin:0}
.strips{margin-top:8px}.srow{display:flex;align-items:center;height:72px}.srow.axisrow{height:28px}.slab{width:230px;flex:none}.slab b{display:block;font-size:16px}.slab span{font-size:13px;color:var(--mut);line-height:1.45;display:block}
.splot{position:relative;flex:1;height:100%;direction:ltr}.sbar{position:absolute;top:34px;height:6px;border-radius:3px}
.tick.static{position:static;display:inline-block;margin:0 0 0 5px;width:4px;height:14px;vertical-align:-2px;border-radius:1px}.tick{position:absolute;top:28px;width:3px;height:18px;margin-left:-1.5px;border-radius:1px}
.send{position:absolute;top:18px;font-size:13px;line-height:1.35;color:var(--fg);white-space:nowrap;direction:rtl}.send.l{text-align:left}.send.r{text-align:right}
.sspan{position:absolute;top:0;text-align:center;font-size:13px;color:var(--mut);direction:rtl}
.axis span{position:absolute;top:2px;transform:translateX(-50%);font-size:13px;color:var(--mut);font-variant-numeric:tabular-nums}
.legend{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:13px;color:var(--mut);margin:4px 0 12px}.legend span{display:inline-flex;align-items:center;gap:7px}
.legend.big{font-size:14px;gap:8px 26px}
.dhead,.drow{display:grid;grid-template-columns:150px 130px 1fr 90px;align-items:center}.dhead{font-size:13px;color:var(--mut);border-bottom:1px solid var(--bd);padding-bottom:4px}
.dplot-h{direction:ltr;text-align:center}.drow{height:${RH}px;border-bottom:1px solid oklch(0.235 0.006 80)}.dname{font-weight:500;font-size:15px}.dbest{font-size:14px}.dnone{font-size:13px;color:var(--mut);text-align:left}
.dwrap{position:relative}.dplotbg{position:absolute;top:0;bottom:0;left:90px;right:280px}.dplot{position:relative;height:100%;direction:ltr}
.vgrid{position:absolute;top:0;bottom:0;width:1px;background:var(--grid)}
.dpathwrap{position:absolute;top:0;bottom:0;left:90px;right:280px;pointer-events:none}.path{position:absolute;top:0;left:0;width:100%}.path line{stroke:var(--pick);stroke-width:1.5;stroke-dasharray:4 3;opacity:.9}
.dot{position:absolute;top:50%;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:var(--c);box-shadow:0 0 0 1.5px var(--card)}.dot.hollow{background:var(--card);border:2px solid var(--c)}
.dot.top{z-index:3}.dot.static{position:static;margin:0;display:inline-block;width:16px;height:16px;box-shadow:none}.dot.static.hollow{border-width:2.5px}
.lockmark{position:absolute;top:50%;margin:-19px 0 0 -2px;line-height:0;z-index:4;filter:drop-shadow(0 0 1.5px var(--card)) drop-shadow(0 0 1px var(--card))}.lock{display:inline-block}
.lockkey{display:inline-flex;align-items:flex-start;gap:0}.lockkey .lock{margin:-8px 0 0 -3px}
.ring{position:absolute;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid var(--pick);z-index:3}.ring.static{position:static;margin:0;display:inline-block;width:18px;height:18px}
.bstar{position:absolute;top:50%;margin:-21px 0 0 -6px;font-style:normal;font-size:13px;line-height:1;color:var(--fg);z-index:4;text-shadow:0 0 2px var(--card),0 0 2px var(--card)}.bstar.static{position:static;margin:0;font-size:15px}
.star{color:var(--fg)}.muted{color:var(--mut)}.axisrow{border:none;height:28px}
`;
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${key}</title><style>${css}</style></head><body><div class="page">${part1}${part2}</div></body></html>`;
}
for (const key of ["V1", "V2"]) writeFileSync(join(here, `mockups-${key}.html`), build(key));
console.log("mockups-V1.html, mockups-V2.html written");
