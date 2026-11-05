// The recommended colours' copy of research/specs/2026-11-05-indices-visuals/gen.mjs (by way of option B's copy): the same
// numbers.json. Kinds: Israeli tracking fund rose-300, Israeli ETF gold-200 (as drawn), foreign fund magenta-400 (a fund bought abroad a
// circle, the foreign fund on the Tel Aviv exchange a triangle); the strips' ticks take the kind of their fund on a neutral-700
// band; the pick ring, the best outline and the path stay neutral-100 as in the D59 drawing; the hollow legend entry is neutral.
// Run from the repository root: node research/specs/2026-11-05-indices-colours/rec/gen.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const N = JSON.parse(readFileSync(join(here, "../../2026-11-05-indices-visuals/numbers.json"), "utf8"));
const s = N.sp500;
const fmt = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });
const num = (n) => `${n < 0 ? "−" : ""}${fmt.format(Math.abs(Math.round(n)))}`;
const nis = (n) => `<span class="n">${num(n)}&nbsp;₪</span>`;
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// clean short names for the drawing only (the site's own fix is the builder's job): the record's broken bracket names are not shown
const FUND_SHORT = { "5139282": "ילין לפידות מחקה", "1150333": "MTF סל", "5129275": "הראל מחקה", "5139100": "אלטשולר שחם מחקה", "5124482": "קסם מחקה KTF" };
const KIND = {
  "il-tracking": { he: "קרן מחקה ישראלית", c: "var(--k1)" },
  "il-etf": { he: "קרן סל ישראלית", c: "var(--k2)" },
  "tase-foreign": { he: "קרן חוץ בבורסה בתל אביב", c: "var(--k3)", tri: true },
  abroad: { he: "קרן חוץ שנקנית בחו״ל", c: "var(--k4)" },
};
const cell = (a, f) => s.cells[`${a}|${f}`];
const fundById = Object.fromEntries(s.funds.map((f) => [f.id, f]));
const acctName = Object.fromEntries(s.accounts.map((a) => [a.id, a.name]));
const best = Math.round(s.top.v);
const bestPos = s.top.pos;

// ---------------------------------------------------------------- part 1: the result card with "how much each choice matters"
const bestFund = bestPos.f;
const acctStrip = s.accounts.map((a) => ({ a: a.id, v: cell(a.id, bestFund) })).filter((x) => x.v && !x.v.open).map((x) => ({ a: x.a, v: x.v.v })).sort((x, y) => x.v - y.v);
const fundStrip = s.funds.filter((f) => !f.hedged).map((f) => ({ f: f.id, v: cell(bestPos.a, f.id) })).filter((x) => x.v && !x.v.open).map((x) => ({ f: x.f, v: x.v.v })).sort((x, y) => x.v - y.v);
const lo = Math.floor(Math.min(acctStrip[0].v, fundStrip[0].v) / 5000) * 5000;
const hi = Math.ceil(best / 2000) * 2000 + 2000;
const px = (v) => ((v - lo) / (hi - lo)) * 100;
function strip(items, label, sub, leftName, rightName, colorOf) {
  const min = items[0], max = items[items.length - 1];
  const ticks = items.map((it) => `<i class="tick" style="left:${px(it.v)}%;background:${colorOf(it)}"></i>`).join("");
  return `<div class="srow">
    <div class="slab"><b>${label}</b><span>${sub}</span></div>
    <div class="splot">
      <div class="sbar" style="left:${px(min.v)}%;width:${px(max.v) - px(min.v)}%;background:var(--band)"></div>${ticks}
      <div class="send l" style="right:${100 - px(min.v) + 0.6}%">${leftName}<br>${nis(min.v)}</div>
      <div class="send r" style="left:${px(max.v) + 0.6}%">${rightName}<br>${nis(max.v)}</div>
      <div class="sspan" style="left:${px(min.v)}%;width:${px(max.v) - px(min.v)}%">עד ${nis(max.v - min.v)}</div>
    </div></div>`;
}
const axisTicks = [];
for (let v = lo; v <= hi; v += 5000) axisTicks.push(`<span style="left:${px(v)}%">${num(v)}</span>`);
const part1 = `
<section class="frame">
  <h2 class="note">1. The result card: the pair named, and how much each choice matters (replaces the two cost bars)</h2>
  <div class="card result">
    <div class="tiles">
      <div class="tile"><div class="k">הפקדתם</div><div class="big">${nis(s.costs.top.paidIn)}</div><div class="sub">10,000 ₪ עכשיו ועוד 500 ₪ בחודש, 120 חודשים</div></div>
      <div class="tile main"><div class="k">הכי הרבה נשאר בזוג הזה</div><div class="big">${nis(best)}</div>
        <div class="pair">${acctName[bestPos.a]} · ${FUND_SHORT[bestFund]} (4D) S&amp;P 500</div>
        <div class="sub">בעוד 10 שנים, אחרי דמי ניהול ומס, בכסף של היום</div></div>
    </div>
    <h3>כמה כל בחירה משנה</h3>
    <div class="strips">
      ${strip(acctStrip, "החשבון", `אותה קרן, ב־${acctStrip.length} חשבונות`, acctName[acctStrip[0].a], acctName[acctStrip[acctStrip.length - 1].a], () => KIND[fundById[bestFund].kind].c)}
      ${strip(fundStrip, "הקרן", `אותו חשבון, ${fundStrip.length} קרנות`, FUND_SHORT[fundStrip[0].f] ?? fundById[fundStrip[0].f].name, FUND_SHORT[fundStrip[fundStrip.length - 1].f], (it) => KIND[fundById[it.f].kind].c)}
      <div class="srow axisrow"><div class="slab"></div><div class="splot axis">${axisTicks.join("")}</div></div>
    </div>
    <div class="legend">${[...new Set([...fundStrip.map((x) => fundById[x.f].kind), fundById[bestFund].kind].map((k) => (k === "tase-foreign" || k === "abroad" ? "foreign" : k)))].map((k) => k === "foreign" ? `<span><i class="tick static" style="background:var(--k4)"></i>קרן חוץ</span>` : `<span><i class="tick static" style="background:${KIND[k].c}"></i>${KIND[k].he}</span>`).join("")}</div>
    <p class="speak">בחשבון היקר ביותר נשארים ${nis(acctStrip[acctStrip.length - 1].v - acctStrip[0].v)} פחות על אותה קרן. בחירת הקרן, בחשבון הזה, משנה עד ${nis(fundStrip[fundStrip.length - 1].v - fundStrip[0].v)}.</p>
  </div>
  <p class="note">Each tick is one account (top strip) or one fund (bottom strip), on one shared scale. Hovering a tick names it. Once the reader picks a pair, a ring marks it on both strips and the main tile shows their pair against this one. Today's runner-up tile (−43 ₪, same house) and the two near-identical cost bars, 83% tax, leave.</p>
</section>`;

// ---------------------------------------------------------------- part 2A: every pair at once, as dots
const rows = s.accounts.map((a) => {
  const ok = [], hollow = [];
  let none = 0;
  for (const f of s.funds) {
    const c = cell(a.id, f.id);
    if (!c) { none++; continue; }
    (c.open || f.hedged ? hollow : ok).push({ f, v: c.v });
  }
  const top = ok.length ? Math.max(...ok.map((x) => x.v)) : null;
  return { a, ok, hollow, none, top };
}).sort((x, y) => (y.top ?? -1e9) - (x.top ?? -1e9));
const all = rows.flatMap((r) => [...r.ok, ...r.hollow].map((x) => x.v - best));
const dmin = Math.floor(Math.min(...all) / 5000) * 5000;
const dx = (d) => ((d - dmin) / (0 - dmin)) * 100;
const pickA = "jerusalem", pickF = "1150333";
const viaV = cell(bestPos.a, pickF).v;
const pickV = cell(pickA, pickF).v;
const rowIdx = Object.fromEntries(rows.map((r, i) => [r.a.id, i]));
const RH = 34;
const dotRows = rows.map((r) => {
  const dots = [...r.ok.map((x) => ({ ...x, h: false })), ...r.hollow.map((x) => ({ ...x, h: true }))]
    .map((x) => {
      const isBest = r.a.id === bestPos.a && x.f.id === bestPos.f;
      const isPick = r.a.id === pickA && x.f.id === pickF;
      return `<i class="dot${KIND[x.f.kind].tri ? " tri" : ""}${x.h ? " hollow" : ""}${isBest ? " best" : ""}" style="left:${dx(x.v - best)}%;--c:${KIND[x.f.kind].c}" title="${esc(x.f.name)}: ${num(x.v)} ₪"></i>${isPick ? `<i class="ring" style="left:${dx(x.v - best)}%"></i>` : ""}`;
    }).join("");
  const topTxt = r.top == null ? `<span class="muted">אין מחיר מדורג</span>` : r.top === best ? `<b class="star">★ ${nis(r.top)}</b>` : nis(r.top - best);
  return `<div class="drow"><div class="dname">${esc(r.a.name)}</div><div class="dbest">${topTxt}</div><div class="dplot">${dots}</div><div class="dnone">${r.none ? `אין מחיר: ${r.none}` : ""}</div></div>`;
}).join("");
const gx = [];
for (let d = dmin; d <= 0; d += 5000) gx.push(`<span style="left:${dx(d)}%">${num(d)}</span>`);
const grid = gx.map((_, i) => `<i class="vgrid" style="left:${dx(dmin + i * 5000)}%"></i>`).join("");
// the example pick's two moves: down the column of the same fund to the best account, then along that row to the best fund
const yP = rowIdx[pickA] * RH + RH / 2, yB = rowIdx[bestPos.a] * RH + RH / 2;
const xP = dx(pickV - best), xV = dx(viaV - best), xB = dx(0);
const path = `<svg class="path" viewBox="0 0 1000 ${rows.length * RH}" preserveAspectRatio="none" style="height:${rows.length * RH}px">
  <line x1="${xP * 10}" y1="${yP}" x2="${xV * 10}" y2="${yB}" vector-effect="non-scaling-stroke"/>
  <line x1="${xV * 10}" y1="${yB}" x2="${xB * 10}" y2="${yB}" vector-effect="non-scaling-stroke"/></svg>
`;
const legend = [KIND["il-tracking"], KIND["il-etf"]].map((k) => `<span><i class="dot static" style="--c:${k.c}"></i>${k.he}</span>`).join("") +
  `<span><i class="dot static" style="--c:var(--k4)"></i>קרן חוץ: שנקנית בחו״ל, או <i class="dot static tri" style="--c:var(--k3)"></i> בבורסה בתל אביב</span>` +
  `<span><i class="dot static hollow" style="--c:var(--mut)"></i>מנוטרלת מט״ח, או קרן שהמס עליה עוד לא ברור: מוצגת ולא מדורגת</span>` +
  `<span><i class="ring static"></i>הבחירה שלכם (כאן: לדוגמה)</span>` +
  `<span><svg width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/></svg>הדרך ממנה לזוג הטוב ביותר: קודם חשבון אחר, אחר כך קרן אחרת</span>`;
const part2a = `
<section class="frame">
  <h2 class="note">2A (recommended). Every pair at once: one row per account, one dot per fund, on one money axis</h2>
  <div class="card">
    <h3>כל הזוגות של חשבון וקרן על S&amp;P 500</h3>
    <p class="sub">כמה פחות נשאר בכל זוג, לעומת הזוג שמשאיר הכי הרבה. כל שורה היא חשבון וכל נקודה היא קרן.</p>
    <div class="legend">${legend}</div>
    <div class="dhead"><div class="dname">החשבון</div><div class="dbest">הכי טוב בחשבון</div><div class="dplot-h">← נשאר פחות &nbsp;·&nbsp; כמה פחות מהזוג הטוב ביותר (₪) &nbsp;·&nbsp; נשאר יותר →</div><div class="dnone"></div></div>
    <div class="dwrap"><div class="dplotbg">${grid}</div>${dotRows}<div class="dpathwrap">${path}</div></div>
    <div class="drow axisrow"><div class="dname"></div><div class="dbest"></div><div class="dplot axis">${gx.join("")}</div><div class="dnone"></div></div>
    <p class="speak">השורות רחוקות זו מזו והנקודות בכל שורה קרובות: החשבון משנה עד ${nis(rows[0].top - rows.filter((r) => r.top != null).at(-1).top)}, הקרן בתוך חשבון הרבה פחות. בבחירה לדוגמה, ${acctName[pickA]} ו־MTF סל, נשארים ${nis(best - pickV)} פחות: ${nis(viaV - pickV)} בגלל החשבון ו־${nis(best - viaV)} בגלל הקרן.</p>
  </div>
  <p class="note">This replaces the stairs and its three tables: the path drawn from the reader's pick is the stairs, on the same axis as everything else, starting from the reader's own pick (here an example). Clicking a dot picks that pair. Rows and dots never move when a slider changes; only the dots' positions do.</p>
</section>`;

// ---------------------------------------------------------------- part 2B: the same as a grid of numbers
const kinds = Object.keys(KIND).filter((k) => s.funds.some((f) => f.kind === k));
const heat = rows.map((r) => {
  const tds = kinds.map((k) => {
    const vs = r.ok.filter((x) => x.f.kind === k).map((x) => x.v);
    if (!vs.length) {
      const h = r.hollow.some((x) => x.f.kind === k);
      return `<td class="grey">${h ? "מוצג, לא מדורג" : "אין מחיר"}</td>`;
    }
    const d = Math.max(...vs) - best;
    const a = Math.min(1, -d / 30000);
    return `<td style="--a:${a.toFixed(2)}" class="${d === 0 ? "top" : ""}">${d === 0 ? `★ ${nis(best)}` : nis(d)}</td>`;
  }).join("");
  return `<tr><th>${esc(r.a.name)}</th>${tds}</tr>`;
}).join("");
const part2b = `
<section class="frame">
  <h2 class="note">2B. The same, as a grid of numbers: the best fund of each kind at each account</h2>
  <div class="card">
    <h3>כל החשבונות וכל סוגי הקרנות על S&amp;P 500</h3>
    <p class="sub">בכל משבצת: הקרן הטובה מהסוג הזה בחשבון הזה, כמה פחות היא משאירה מהזוג הטוב ביותר. ככל שהאדום חזק יותר, נשאר פחות.</p>
    <table class="heat"><colgroup><col style="width:180px">${kinds.map(() => `<col>`).join("")}</colgroup>
      <thead><tr><th>החשבון</th>${kinds.map((k) => `<th>${KIND[k].he}</th>`).join("")}</tr></thead><tbody>${heat}</tbody></table>
  </div>
  <p class="note">Exact numbers, and it fits a phone. It hides how far apart funds of one kind are (small here), and colour carries the size less well than position does in 2A.</p>
</section>`;

// ---------------------------------------------------------------- part 3: does the answer change with the plan?
const THETA = 0.5;
const R = N.robustSp500;
function rstrip(list, label, key, fmtv, mine) {
  const cells = list.filter(Boolean).map((r) => {
    const tie = r.second && r.second.gapPct < THETA;
    const who = r.top.a;
    const cls = tie ? "tie" : who === "פסגות" ? "h1" : "h2";
    const isMine = r[key] === mine;
    const t = tie ? `${[who, r.second.a].sort().join(", ")}<br><small>שקולות</small>` : `${who}<br><small>${nis(r.second.gap)} יותר</small>`;
    return `<div class="rc ${cls}${isMine ? " mine" : ""}" title="${esc(r.top.f)}"><div class="rt">${t}</div><div class="rv">${fmtv(r[key])}</div></div>`;
  }).join("");
  return `<div class="rrow"><div class="rlab">${label}</div><div class="rcells">${cells}</div></div>`;
}
const part3 = `
<section class="frame">
  <h2 class="note">3. Does the answer change with the plan? (replaces the change chart)</h2>
  <div class="card">
    <h3>האם התשובה משתנה עם התוכנית שלכם?</h3>
    <p class="sub">בכל משבצת: הבית שמשאיר הכי הרבה כשמשנים מספר אחד בתוכנית והשאר נשאר, וכמה יותר הוא משאיר מהבית הבא. ״שקולות״: הפרש של פחות מ־${THETA}%.</p>
    ${rstrip(R.amounts, "סכום היום (₪)", "amount", (v) => fmt.format(v), 10000)}
    ${rstrip(R.monthlies, "הפקדה חודשית (₪)", "monthly", (v) => fmt.format(v), 500)}
    ${rstrip(R.years, "שנים", "years", (v) => `${v}`, 10)}
    <p class="speak">בתוכנית שלכם פסגות משאירה ${nis(R.amounts.find((r) => r.amount === 10000).second.gap)} יותר מהבית הבא. התשובה לא משתנה בשום מספר שנים, וגם לא בהפקדה חודשית בין 100 ל־2,000 ₪. מסכום של 200,000 ₪ ומעלה, ומהפקדה חודשית של 3,000 ₪ ומעלה, פסגות וגם וואן זירו שקולות, ובלי הפקדה חודשית וואן זירו משאירה יותר.</p>
  </div>
  <p class="note">Same founder's form as the year strip he liked: a strip with words in it, the reader's own value outlined. The fund is the same in every cell (Yelin Lapidot tracking on S&amp;P 500), so only the house is named. The cells are the values tried, not a scale: they are labelled under each cell.</p>
</section>`;

const css = `
@font-face{font-family:Heebo;src:url(../../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(../../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2) format("woff2");font-weight:100 900}
:root{--bg:oklch(0.17 0.004 80);--card:oklch(0.2 0.005 80);--pop:oklch(0.235 0.006 80);--fg:oklch(0.955 0.005 80);--mut:oklch(0.82 0.008 80);--bd:oklch(0.27 0.007 80);--grid:oklch(0.27 0.007 80);--axis:oklch(0.4 0.009 80);
--band:oklch(0.4 0.009 80);--k1:oklch(0.82 0.111 358);--k2:oklch(0.84 0.17 85);--k3:oklch(0.66 0.17 335);--k4:oklch(0.66 0.17 335);--loss:oklch(0.63 0.2 25);--computed:oklch(0.7 0.15 295)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:Inter,Heebo,Arial,sans-serif;font-size:16px;line-height:1.7}
.page{max-width:1376px;margin:0 auto;padding:24px 32px 80px}
.n{font-variant-numeric:tabular-nums;white-space:nowrap;unicode-bidi:isolate;direction:ltr;border-bottom:1.5px dotted var(--computed)}
h1{font-size:24px;margin:0 0 4px}h2.note{font-size:13px;font-weight:500;color:oklch(0.73 0.149 70);margin:40px 0 8px;direction:ltr;text-align:left}
p.note{font-size:13px;color:var(--mut);direction:ltr;text-align:left;max-width:80ch;margin:8px 0 0}
.intro{color:var(--mut);font-size:14px;direction:ltr;text-align:left}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:24px 28px}
h3{font-size:20px;margin:0 0 4px}.sub{color:var(--mut);font-size:14px;margin:0 0 12px}.speak{margin:16px 0 0;font-size:16px;max-width:none}
.tiles{display:flex;gap:24px;align-items:stretch;margin-bottom:20px}.tile{padding:12px 16px}.tile.main{flex:1;background:var(--pop);border:1px solid var(--axis);border-radius:10px}
.k{color:var(--mut);font-size:14px}.big{font-size:32px;font-weight:700;line-height:1.3}.pair{font-size:18px;font-weight:600}.tile .sub{margin:0}
.strips{margin-top:8px}.srow{display:flex;align-items:center;height:72px}.srow.axisrow{height:28px}.slab{width:190px;flex:none}.slab b{display:block;font-size:16px}.slab span{font-size:13px;color:var(--mut)}
.splot{position:relative;flex:1;height:100%;direction:ltr}.sbar{position:absolute;top:34px;height:6px;border-radius:3px}.tick.static{position:static;display:inline-block;margin:0;width:3px;height:14px;vertical-align:middle}.tick{position:absolute;top:28px;width:3px;height:18px;margin-left:-1.5px;border-radius:1px}
.send{position:absolute;top:18px;font-size:13px;line-height:1.35;color:var(--fg);white-space:nowrap;direction:rtl}.send.l{text-align:left}.send.r{text-align:right}
.sspan{position:absolute;top:0;text-align:center;font-size:13px;color:var(--mut);direction:rtl}
.axis span{position:absolute;top:2px;transform:translateX(-50%);font-size:13px;color:var(--mut);font-variant-numeric:tabular-nums}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--mut);margin:4px 0 12px}.legend span{display:inline-flex;align-items:center;gap:6px}
.dhead,.drow{display:grid;grid-template-columns:150px 130px 1fr 90px;align-items:center}.dhead{font-size:13px;color:var(--mut);border-bottom:1px solid var(--bd);padding-bottom:4px}
.dplot-h{direction:ltr;text-align:center}.drow{height:${RH}px;border-bottom:1px solid oklch(0.235 0.006 80)}.dname{font-weight:500;font-size:15px}.dbest{font-size:14px}.dnone{font-size:13px;color:var(--mut);text-align:left}
.dwrap{position:relative}.dplotbg{position:absolute;top:0;bottom:0;left:90px;right:280px}.dplot{position:relative;height:100%;direction:ltr}
.vgrid{position:absolute;top:0;bottom:0;width:1px;background:var(--grid)}
.dpathwrap{position:absolute;top:0;bottom:0;left:90px;right:280px;pointer-events:none}.path{position:absolute;top:0;left:0;width:100%}.path line{stroke:var(--fg);stroke-width:1.5;stroke-dasharray:4 3;opacity:.85}
.plab{position:absolute;font-size:13px;white-space:nowrap;background:var(--card);padding:0 6px;border-radius:4px;direction:rtl;box-shadow:0 0 0 1px var(--axis)}
.dot{position:absolute;top:50%;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:var(--c);box-shadow:0 0 0 1.5px var(--card)}.dot.hollow{background:transparent;border:1.5px solid var(--c)}
.dot.tri{border-radius:0;width:13px;height:12px;margin:-6px 0 0 -6.5px;clip-path:polygon(50% 0,100% 100%,0 100%);box-shadow:none}.dot.tri.static{margin:0}.dot.best{width:15px;height:15px;margin:-7.5px 0 0 -7.5px;box-shadow:0 0 0 2px var(--fg)}.dot.static{position:static;margin:0;display:inline-block}
.ring{position:absolute;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid var(--fg)}.ring.static{position:static;margin:0;display:inline-block;width:14px;height:14px}
.star{color:var(--fg)}.muted{color:var(--mut)}.axisrow{border:none;height:28px}
table.heat{width:100%;border-collapse:collapse;table-layout:fixed;font-size:15px}table.heat th{text-align:right;font-weight:500;padding:8px 10px;border-bottom:1px solid var(--bd);font-size:14px;color:var(--mut)}
table.heat tbody th{color:var(--fg);font-size:15px}table.heat td{padding:8px 10px;border-bottom:1px solid oklch(0.235 0.006 80);background:color-mix(in oklch,var(--loss) calc(var(--a,0)*55%),transparent)}
table.heat td.grey{background:repeating-linear-gradient(135deg,transparent 0 6px,oklch(0.235 0.006 80) 6px 12px);color:var(--mut);font-size:13px}table.heat td.top{background:oklch(0.31 0.053 190)}
.rrow{display:flex;align-items:stretch;margin:10px 0}.rlab{width:150px;flex:none;font-weight:500;padding-top:12px}.rcells{flex:1;display:flex;gap:3px;direction:ltr}
.rc{flex:1;border-radius:6px;padding:6px 4px;text-align:center;font-size:13px;line-height:1.35;direction:rtl}.rc .rt{min-height:38px}.rc .rv{color:var(--mut);margin-top:4px;font-variant-numeric:tabular-nums}
.rc.h1{background:oklch(0.31 0.053 190)}.rc.h2{background:oklch(0.39 0.084 70 / .7)}.rc.tie{background:repeating-linear-gradient(135deg,oklch(0.31 0.053 190) 0 7px,oklch(0.39 0.084 70 / .7) 7px 14px)}
.rc.mine{outline:2px solid var(--fg);outline-offset:1px}.rc small{color:var(--mut)}
`;

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Indices page visuals</title><style>${css}</style></head><body><div class="page">
<h1>השקעה במדד: מה כדאי לצייר</h1>
<p class="intro">Mockups for the founder, 05.11.2026. S&amp;P 500, the site's example plan (${esc(s.plan)}), on collected list tariffs. Every figure comes from the site's engine (compute.ts → numbers.json → gen.mjs); none is typed by hand or made up. The Hebrew is a draft and has not been through the Hebrew editor. Notes in English are for the founder, not site text.</p>
${part1}${part2a}${part2b}${part3}
</div></body></html>`;
writeFileSync(join(here, "mockups-rec.html"), html);
console.log("mockups-rec.html written");
