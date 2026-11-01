// Second round of indices page mockups. Every number comes from the engine (mock.json for the opening plan, grid.json for the others).
import { readFileSync, writeFileSync } from "node:fs";
const S = process.argv[2], OUT = process.argv[3];
const d = JSON.parse(readFileSync(S + "/mock.json"));
const grid = JSON.parse(readFileSync(S + "/grid.json"));
const css = readFileSync(S + "/mock.css", "utf8") + readFileSync(S + "/mock2.css", "utf8");

const fmt = (x) => Math.round(x).toLocaleString("en");
const LRI = "⁦", PDI = "⁩";
const iso = (s) => s.replace(/[−+]?\d[\d,.]*%?(?: ₪)?/g, (m) => LRI + m + PDI);
const N = (x) => `<span class="n">${fmt(x)} ₪</span>`;

const KINDS = [
  { id: "il-tracking", he: "קרן מחקה", shape: "circle", col: "var(--k-tracking)", lane: -7 },
  { id: "il-etf", he: "קרן סל", shape: "square", col: "var(--k-etf)", lane: -2.4 },
  { id: "tase-foreign", he: "קרן חוץ בתל אביב", shape: "triangle", col: "var(--k-foreign)", lane: 2.4, open: true },
  { id: "abroad", he: "קנייה בחו״ל", shape: "diamond", col: "var(--k-abroad)", lane: 7, open: true },
];
const NAMES = { fair: "פייר", psagot: "פסגות", ibi: "אי.בי.אי.", excellence: "אקסלנס", "interactive-israel": "אינטראקטיב ישראל", "interactive-brokers": "Interactive Brokers", leumi: "לאומי", "one-zero": "וואן זירו", fibi: "הבינלאומי", massad: "מסד", hapoalim: "הפועלים", yahav: "יהב", jerusalem: "ירושלים", discount: "דיסקונט", mercantile: "מרכנתיל", "mizrahi-tefahot": "מזרחי טפחות" };
const IN = { fibi: "בבינלאומי", jerusalem: "בבנק ירושלים" };
const GROUPS = [
  { he: "בתי השקעות", ids: ["fair", "psagot", "ibi", "excellence"] },
  { he: "ברוקרים זרים", ids: ["interactive-israel", "interactive-brokers"] },
  { he: "בנקים", ids: ["leumi", "one-zero", "fibi", "massad", "hapoalim", "yahav", "jerusalem", "discount", "mercantile", "mizrahi-tefahot"] },
];
const GREY = [["אלטשולר טרייד", "לא ברור מי משלם את התעריף שבמחשבון הבורסה"], ["מיטב טרייד", "לא ברור מי משלם את התעריף שבמחשבון הבורסה"], ["פפר", "אף מסמך לא אומר שאפשר לקנות שם קרן על מדד"]];

const opt = Object.fromEntries(d.options.map((o) => [o.id, o]));
const real = (f) => !f.id.startsWith("synthetic") && f.reason === null;
const fundsOf = (k, h) => opt[k].funds.filter((f) => real(f) && !f.hedged && f.byHouse[h]).map((f) => ({ id: f.id, name: f.name, v: f.byHouse[h].v }));
const bestOf = (k, h) => { const x = fundsOf(k, h); return x.length ? Math.max(...x.map((f) => f.v)) : null; };
const worstOf = (k, h) => { const x = fundsOf(k, h); return x.length ? Math.min(...x.map((f) => f.v)) : null; };
const cellLeft = (k, h) => opt[k].cells.find((c) => c.id === h)?.left ?? null;
const ALL = GROUPS.flatMap((g) => g.ids);
const OUTLIER = "excellence";
const rowsOf = ALL.map((h) => {
  const kinds = Object.fromEntries(KINDS.map((k) => [k.id, bestOf(k.id, h)]));
  const vals = Object.values(kinds).filter((v) => v !== null);
  return { h, kinds, top: Math.max(...vals), gap: vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : null };
});
const rowOf = (h) => rowsOf.find((r) => r.h === h);
const BEST = Math.max(...rowsOf.map((r) => r.top));

// the four comparisons on the opening plan; each changes one thing
const fundA = opt["il-tracking"].funds.find((f) => f.id === "5139282");
const acctVals = ALL.filter((h) => fundA.byHouse[h]).map((h) => ({ h, v: fundA.byHouse[h].v }));
const acctNoOut = acctVals.filter((x) => x.h !== OUTLIER);
const acctTop = Math.max(...acctNoOut.map((x) => x.v));
const acctLow = acctNoOut.reduce((a, b) => (b.v < a.v ? b : a));
const mAcct = acctTop - acctLow.v;
const mAcctAll = acctTop - fundA.byHouse[OUTLIER].v;
const kindBest = KINDS.map((k) => {
  const c = ALL.filter((h) => h !== OUTLIER && bestOf(k.id, h) !== null).map((h) => ({ h, v: bestOf(k.id, h) }));
  const b = c.reduce((a, x) => (x.v > a.v ? x : a));
  return { k, ...b };
});
const kindTop = Math.max(...kindBest.map((x) => x.v));
const mKind = kindTop - Math.min(...kindBest.map((x) => x.v));
const sameBank = ALL.filter((h) => h !== OUTLIER).map((h) => {
  const ta = ["il-tracking", "il-etf", "tase-foreign"].map((k) => bestOf(k, h)).filter((v) => v !== null);
  const ab = bestOf("abroad", h);
  return ta.length && ab !== null ? { h, gap: Math.max(...ta) - ab } : null;
}).filter(Boolean);
const sameMax = sameBank.reduce((a, b) => (b.gap > a.gap ? b : a));
const sameMin = sameBank.reduce((a, b) => (b.gap < a.gap ? b : a));
const etfP = fundsOf("il-etf", "psagot").sort((a, b) => b.v - a.v);
const mFund = etfP[0].v - etfP[etfP.length - 1].v;

// the same measures over other plans
function measure(a, m, y, idx = "index-sp500") {
  const rs = grid.filter((r) => r.idx === idx && r.a === a && r.m === m && r.y === y && !r.hedged && r.reason === null);
  const vals = (r) => Object.entries(r.byHouse).filter(([h, v]) => v && h !== OUTLIER);
  let best = -1, bf = null;
  for (const r of rs) for (const [, v] of vals(r)) if (v > best) { best = v; bf = r; }
  const av = vals(bf).map(([, v]) => v);
  const acct = Math.max(...av) - Math.min(...av);
  const houses = [...new Set(rs.flatMap((r) => vals(r).map(([h]) => h)))];
  const bestAt = (k, h) => { const x = rs.filter((r) => r.kind === k && r.byHouse[h]).map((r) => r.byHouse[h]); return x.length ? Math.max(...x) : null; };
  const kb = KINDS.map((k) => Math.max(...houses.map((h) => bestAt(k.id, h) ?? -1)));
  const kind = Math.max(...kb) - Math.min(...kb);
  let same = 0, fund = 0;
  for (const h of houses) {
    const ta = ["il-tracking", "il-etf", "tase-foreign"].map((k) => bestAt(k, h)).filter((v) => v !== null);
    const ab = bestAt("abroad", h);
    if (ta.length && ab !== null) same = Math.max(same, Math.max(...ta) - ab);
    for (const k of KINDS) { const x = rs.filter((r) => r.kind === k.id && r.byHouse[h]).map((r) => r.byHouse[h]); if (x.length > 1) fund = Math.max(fund, Math.max(...x) - Math.min(...x)); }
  }
  return { acct, kind, same, fund };
}

// ---------------------------------------------------------------- shared pieces
const nav = `<div class="nav"><b>מקור</b><span>מדריך</span><span>שאלות שכולם שואלים</span><span>חברות ומסלולים</span><span>השוואה למטרה</span><span class="on">השקעה במדד</span></div>`;
const knob = (label, value, pos) => `<label class="knob"><span class="muted small">${label}</span><strong class="n">${value}</strong><i class="track"><i style="inset-inline-start:${pos}%"></i></i></label>`;
const top = () => `${nav}
<div class="head"><h1>השקעה במדד</h1><div class="chips">${["S&P 500", "MSCI World", "MSCI AC World", "נאסד״ק 100", "ת״א-125", "ת״א-35", "ת״א-90", "אחר"].map((t, i) => `<span class="ix ${i === 0 ? "on" : ""}">${t}</span>`).join("")}</div></div>
<div class="plan">${knob("סכום היום", "10,000 ₪", 18)}${knob("הפקדה חודשית", "500 ₪", 30)}${knob("שנים", "10", 28)}${knob("תשואה בשנה", "7%", 55)}</div>`;

const P = d.pair;
const acctCost = P.account.reduce((s, x) => s + x.cost, 0) + P.interaction;
const result = () => `<div class="card result"><div class="res-main"><span class="muted small">נשאר בסוף 10 השנים, בכסף של היום</span><strong class="big n c">${fmt(P.left)} ₪</strong><span class="muted small">מתוך ${N(P.paidIn)} שהופקדו</span></div>
  <div class="res-picks"><span class="pick"><span class="muted xs">חשבון</span><b>פייר</b><i>▾</i></span><span class="pick"><span class="muted xs">קרן</span><b>ילין לפידות מחקה (4D) S&P 500</b><i>▾</i></span></div>
  <div class="res-lines"><span><i class="sw" style="background:var(--chart-cost-trade)"></i>החשבון ${N(acctCost)}</span><span><i class="sw" style="background:var(--chart-fee)"></i>הקרן ${N(P.fund)}</span><span><i class="sw" style="background:var(--chart-tax)"></i>מס ${N(P.tax)}</span></div></div>`;

const shape = (k, x, y, r, { hollow = k.open, stroke = 2 } = {}) => {
  const fill = hollow ? "var(--card)" : k.col;
  const st = `stroke="${k.col}" stroke-width="${hollow ? stroke : 0}"`;
  if (k.shape === "circle") return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${st}/>`;
  if (k.shape === "square") return `<rect x="${x - r * 0.88}" y="${y - r * 0.88}" width="${r * 1.76}" height="${r * 1.76}" rx="1.5" fill="${fill}" ${st}/>`;
  if (k.shape === "triangle") return `<path d="M${x} ${y - r * 1.05}L${x + r} ${y + r * 0.8}L${x - r} ${y + r * 0.8}Z" fill="${fill}" ${st} stroke-linejoin="round"/>`;
  return `<rect x="${x - r * 0.8}" y="${y - r * 0.8}" width="${r * 1.6}" height="${r * 1.6}" transform="rotate(45 ${x} ${y})" fill="${fill}" ${st}/>`;
};
const icon = (k, size = 16) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 20 20">${shape(k, 10, 10, 6.5)}</svg>`;
const legend = () => `<div class="lg">${KINDS.map((k) => `<span>${icon(k)}${k.he}</span>`).join("")}<span class="muted xs">צורה חלולה: המס עליה נשען על כלל פתוח 🔒</span></div>`;

// text in an SVG: Hebrew reads right to left, every number isolated
const T = (x, y, s, { a = "right", size = 13, fill = "var(--muted-foreground)", w = 400 } = {}) => {
  const anchor = a === "right" ? "start" : a === "left" ? "end" : "middle";
  return `<text x="${x}" y="${y}" direction="rtl" text-anchor="${anchor}" font-size="${size}" font-weight="${w}" fill="${fill}">${iso(s)}</text>`;
};

// ---------------------------------------------------------------- what moves the money
const bar = ({ title, sub, note, value, tail, tailLabel, col, ticks = [], marks = [], max }) => {
  const pct = (v) => (v / max) * 100;
  return `<div class="tr">
    <div class="tl"><b>${title}</b><span class="tsub">${sub}</span><span class="xs muted">${note}</span></div>
    <div class="tb">
      <div class="track2">
        ${tail ? `<i class="seg tail" style="inset-inline-start:${pct(value)}%;width:${pct(tail - value)}%;--c:${col}"></i>` : ""}
        <i class="seg" style="inset-inline-start:0;width:${pct(value)}%;background:${col}"></i>
        ${ticks.map((t) => `<i class="tick" style="inset-inline-start:${pct(t)}%"></i>`).join("")}
        ${marks.map((m) => `<span class="mk" style="inset-inline-start:${pct(m.v)}%">${icon(m.k, 22)}</span>`).join("")}
        <strong class="val n${tail ? " onbar" : ""}" style="right:calc(${pct(value)}% + ${marks.length ? 18 : 10}px)">${fmt(value)} ₪</strong>
        ${tail ? `<span class="taillab xs muted" style="right:calc(${pct(tail)}% + 8px)">${iso(tailLabel)}</span>` : ""}
      </div>
    </div>
  </div>`;
};
const kKind = Object.fromEntries(KINDS.map((k) => [k.id, k]));
const movers = () => {
  const max = Math.max(mAcctAll, sameMax.gap) * 1.3;
  const kb = kindBest;
  const names = kb.map((x) => `${x.k.he} ב${NAMES[x.h]}`).join(" · ");
  return `<div class="card flush"><div class="sec-h"><h2>מה מזיז הכי הרבה כסף בתוכנית הזו?</h2><p class="muted small">כל פס משנה דבר אחד בלבד. ככל שהפס ארוך יותר, הבחירה הזו מזיזה יותר כסף בסוף 10 השנים.</p></div>
  <div class="tornado">
    ${bar({ title: "החשבון", sub: "אותה קרן, חשבון אחר", note: iso(`ילין לפידות מחקה, ב־${acctNoOut.length} חשבונות, מ${NAMES[acctNoOut.reduce((a, b) => (b.v > a.v ? b : a)).h]} עד ${NAMES[acctLow.h]}`), value: mAcct, tail: mAcctAll, tailLabel: `${fmt(mAcctAll)} ₪ עם אקסלנס`, col: "var(--palette-neutral-300)", ticks: acctNoOut.map((x) => acctTop - x.v).filter((t) => t > 0 && t < mAcct), max })}
    ${bar({ title: "סוג הקרן", sub: "כל סוג בחשבון הכי זול לו", note: names, value: mKind, col: "var(--palette-neutral-600)", marks: kb.map((x) => ({ k: x.k, v: kindTop - x.v })), max })}
    ${bar({ title: "סוג הקרן, בלי להחליף חשבון", sub: "קנייה בחו״ל במקום בתל אביב", note: iso(`${sameBank.length} חשבונות, מ־${fmt(sameMin.gap)} ₪ ${IN[sameMin.h] ?? "ב" + NAMES[sameMin.h]} עד ${fmt(sameMax.gap)} ₪ ${IN[sameMax.h] ?? "ב" + NAMES[sameMax.h]}`), value: sameMax.gap, col: "var(--k-abroad)", ticks: sameBank.map((x) => x.gap).filter((t) => t < sameMax.gap), max })}
    ${bar({ title: "הקרן", sub: "אותו סוג, אותו חשבון", note: iso(`${etfP.length} קרנות סל בפסגות, מ־ATF עד אי.בי.אי.`), value: mFund, col: "var(--k-etf)", ticks: etfP.map((f) => etfP[0].v - f.v).filter((t) => t > 0 && t < mFund), max })}
  </div></div>`;
};

// ---------------------------------------------------------------- the map
const map = (W, phone) => {
  const nameW = phone ? 92 : 150, valW = phone ? 0 : 92, gapW = phone ? 56 : 92;
  const x0 = gapW + 10, x1 = W - nameW - valW - 10;
  const LO = -28000;
  const sx = (v) => x0 + ((v - BEST - LO) / -LO) * (x1 - x0);
  const rowH = phone ? 36 : 30, groupH = 34, head = 58;
  let y = head;
  const grp = [];
  const rs = [];
  for (const g of GROUPS) {
    grp.push({ he: g.he, y });
    y += groupH;
    for (const h of g.ids) { rs.push({ ...rowOf(h), y: y + rowH / 2 }); y += rowH; }
  }
  const H = y + 62;
  const grid = [-25000, -20000, -15000, -10000, -5000, 0];
  const r = phone ? 4.6 : 5.6;
  const k1 = phone ? 0.75 : 1;
  const nameX = W, valX = W - nameW - (phone ? 0 : 8);
  const parts = [];
  grid.forEach((g) => {
    const x = sx(BEST + g);
    parts.push(`<line x1="${x}" x2="${x}" y1="${head - 6}" y2="${H - 62}" stroke="${g === 0 ? "var(--palette-neutral-600)" : "var(--chart-grid)"}"/>`);
    if (!phone || g % 10000 === 0) parts.push(`<text x="${x}" y="${head - 12}" text-anchor="middle" font-size="${phone ? 11 : 12}" fill="var(--chart-text)">${g === 0 ? "0" : "−" + fmt(-g)}</text>`);
  });
  parts.push(T(x1, 16, phone ? `כמה פחות מ־${fmt(BEST)} ₪` : `כמה פחות נשאר מהשילוב הטוב ביותר (${fmt(BEST)} ₪)`, { a: "right", size: phone ? 12 : 13 }));
  if (!phone) {
    parts.push(T(valX, head - 26, "נשאר", { size: 12 }), T(valX, head - 12, "בסוג הכי טוב", { size: 12 }));
    parts.push(T(gapW, head - 26, "פער בין", { a: "right", size: 12 }), T(gapW, head - 12, "הסוגים", { a: "right", size: 12 }));
  } else {
    parts.push(T(gapW, head - 12, "פער סוגים", { a: "right", size: 11 }));
  }
  grp.forEach((g) => parts.push(`<line x1="0" x2="${W}" y1="${g.y + 1}" y2="${g.y + 1}" stroke="var(--border)"/>`, T(nameX, g.y + 22, g.he, { size: phone ? 12 : 13, fill: "var(--foreground)", w: 600 })));
  for (const row of rs) {
    const vals = KINDS.map((k) => row.kinds[k.id]).filter((v) => v !== null);
    const sel = row.h === "fair";
    if (sel) parts.push(`<rect x="0" y="${row.y - rowH / 2}" width="${W}" height="${rowH}" fill="var(--popover)"/>`);
    if (phone) {
      parts.push(T(nameX, row.y - 3, NAMES[row.h], { size: NAMES[row.h].length > 14 ? 10 : 12, fill: "var(--foreground)", w: sel ? 600 : 400 }));
      parts.push(`<text x="${nameX}" y="${row.y + 12}" text-anchor="end" font-size="11" fill="var(--chart-text)">${fmt(row.top)} ₪</text>`);
    } else {
      parts.push(T(nameX, row.y + 4.5, NAMES[row.h], { size: 14, fill: "var(--foreground)", w: sel ? 600 : 400 }));
      parts.push(`<text x="${valX}" y="${row.y + 4.5}" text-anchor="end" font-size="13.5" fill="var(--foreground)">${fmt(row.top)} ₪</text>`);
    }
    const taVals = ["il-tracking", "il-etf", "tase-foreign"].map((k) => row.kinds[k]).filter((v) => v !== null);
    const abV = row.kinds.abroad;
    const abroadLow = abV !== null && taVals.length > 0 && abV < Math.min(...taVals);
    if (taVals.length > 1) parts.push(`<line x1="${sx(Math.min(...taVals))}" x2="${sx(Math.max(...taVals))}" y1="${row.y}" y2="${row.y}" stroke="var(--palette-neutral-600)" stroke-width="1.5"/>`);
    if (abroadLow) parts.push(`<line x1="${sx(abV)}" x2="${sx(Math.min(...taVals))}" y1="${row.y + 3}" y2="${row.y + 3}" stroke="var(--k-abroad)" stroke-width="2.5"/>`);
    for (const k of KINDS) {
      const v = row.kinds[k.id];
      if (v !== null) parts.push(`<g>${shape(k, sx(v), row.y + k.lane * k1, r)}<title>${NAMES[row.h]}, ${k.he}: ${fmt(v)} ₪</title></g>`);
    }
    parts.push(`<text x="${gapW}" y="${row.y + 4.5}" text-anchor="end" font-size="${phone ? 11.5 : 13.5}" font-weight="${abroadLow ? 600 : 400}" fill="${row.gap === null ? "var(--chart-text)" : abroadLow ? "var(--k-abroad)" : "var(--foreground)"}">${row.gap === null ? "—" : fmt(row.gap) + " ₪"}</text>`);
  }
  const by = H - 50;
  const bx0 = sx(acctLow.v), bx1 = sx(acctTop);
  parts.push(`<path d="M${bx0} ${by - 6}V${by}H${bx1}V${by - 6}" fill="none" stroke="var(--palette-neutral-300)" stroke-width="2"/>`);
  parts.push(T(bx1, by + 18, `החשבון, באותה קרן: ${fmt(mAcct)} ₪`, { size: phone ? 11.5 : 13.5, fill: "var(--foreground)", w: 600 }));
  parts.push(`<text x="${x0}" y="${H - 6}" font-size="12" fill="var(--chart-text)">← פחות נשאר</text>`, `<text x="${x1}" y="${H - 6}" text-anchor="end" font-size="12" fill="var(--chart-text)">יותר נשאר →</text>`);
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${parts.join("")}</svg>`;
};
const mapCard = () => `<div class="card flush"><div class="sec-h"><h2>כל חשבון, כל סוג</h2><p class="muted small">שורה לכל חשבון וצורה לכל סוג קרן, בקרן הזולה של אותו סוג. מלמעלה למטה רואים את החשבון; בתוך שורה רואים את סוג הקרן.</p></div>
  <div class="chartpad">${legend()}<div class="pc">${map(1060, false)}</div><div class="ph">${map(346, true)}</div>
  <div class="greys">${GREY.map(([n, w]) => `<span><span class="tag caution">אין מחיר</span> ${n}: <span class="muted">${w}</span></span>`).join("")}</div></div></div>`;

// ---------------------------------------------------------------- the funds, on the same axis
const strips = (W, phone) => {
  const nameW = phone ? 86 : 242, gapW = phone ? 56 : 92;
  const x0 = gapW + 10, x1 = W - nameW - 10;
  const LO = -28000;
  const sx = (v) => x0 + ((v - BEST - LO) / -LO) * (x1 - x0);
  const R = [
    { k: kKind["il-tracking"], h: "fair" }, { k: kKind["il-etf"], h: "psagot" }, { k: kKind["tase-foreign"], h: "psagot" }, { k: kKind.abroad, h: "interactive-israel" },
  ];
  const rowH = phone ? 40 : 38, head = 44;
  const parts = [];
  const H = head + rowH * R.length + 46;
  [-25000, -20000, -15000, -10000, -5000, 0].forEach((g) => {
    const x = sx(BEST + g);
    parts.push(`<line x1="${x}" x2="${x}" y1="${head}" y2="${head + rowH * R.length}" stroke="${g === 0 ? "var(--palette-neutral-600)" : "var(--chart-grid)"}"/>`);
    if (!phone || g % 10000 === 0) parts.push(`<text x="${x}" y="${head - 8}" text-anchor="middle" font-size="${phone ? 11 : 12}" fill="var(--chart-text)">${g === 0 ? "0" : "−" + fmt(-g)}</text>`);
  });
  parts.push(T(gapW, 16, "פער בין", { size: phone ? 11 : 12 }), T(gapW, 31, "הקרנות", { size: phone ? 11 : 12 }));
  R.forEach((row, i) => {
    const y = head + rowH * i + rowH / 2;
    const fs = fundsOf(row.k.id, row.h);
    const vs = fs.map((f) => f.v);
    parts.push(`<line x1="0" x2="${W}" y1="${y - rowH / 2}" y2="${y - rowH / 2}" stroke="var(--border)"/>`);
    if (phone) { parts.push(T(W, y - 3, row.k.he, { size: 11.5, fill: "var(--foreground)" }), T(W, y + 12, "ב" + NAMES[row.h], { size: 11 })); }
    else parts.push(T(W, y + 4.5, `${row.k.he}, ב${NAMES[row.h]}`, { size: 14, fill: "var(--foreground)" }));
    if (vs.length > 1) parts.push(`<rect x="${sx(Math.min(...vs))}" y="${y - 3}" width="${sx(Math.max(...vs)) - sx(Math.min(...vs))}" height="6" rx="3" fill="${row.k.col}" opacity=".35"/>`);
    fs.forEach((f) => parts.push(`<g>${shape(row.k, sx(f.v), y, phone ? 4.6 : 5.6)}<title>${f.name}: ${fmt(f.v)} ₪</title></g>`));
    parts.push(`<text x="${gapW}" y="${y + 4.5}" text-anchor="end" font-size="${phone ? 11.5 : 13.5}" fill="var(--foreground)">${vs.length > 1 ? fmt(Math.max(...vs) - Math.min(...vs)) + " ₪" : "—"}</text>`);
    if (row.h === "fair") {
      const hedged = opt["il-tracking"].funds.find((f) => real(f) && f.hedged);
      const hv = hedged.byHouse.fair.v;
      parts.push(`<circle cx="${sx(hv)}" cy="${y}" r="${phone ? 4.6 : 5.6}" fill="var(--card)" stroke="var(--k-tracking)" stroke-width="2" stroke-dasharray="2 2"/>`);
      parts.push(T(sx(hv) - 10, y + 4.5, `קרן שמנטרלת מטבע: ${fmt(BEST - hv)} ₪ פחות`, { a: "right", size: phone ? 10.5 : 12.5 }));
    }
  });
  const noFee = opt["il-tracking"].funds.find((f) => f.id === "synthetic-0").byHouse.fair.v;
  const one = noFee - opt["il-tracking"].funds.find((f) => f.id === "synthetic-1").byHouse.fair.v;
  const by = head + rowH * R.length + 20;
  parts.push(`<line x1="0" x2="${W}" y1="${by - 20}" y2="${by - 20}" stroke="var(--border)"/>`);
  parts.push(`<line x1="${sx(BEST)}" x2="${sx(BEST - one)}" y1="${by}" y2="${by}" stroke="var(--foreground)" stroke-width="3"/><line x1="${sx(BEST)}" x2="${sx(BEST)}" y1="${by - 5}" y2="${by + 5}" stroke="var(--foreground)" stroke-width="2"/><line x1="${sx(BEST - one)}" x2="${sx(BEST - one)}" y1="${by - 5}" y2="${by + 5}" stroke="var(--foreground)" stroke-width="2"/>`);
  parts.push(T(sx(BEST - one) - 10, by + 4.5, phone ? `נקודת אחוז של עלות בשנה: ${fmt(one)} ₪` : `סרגל: נקודת אחוז אחת של עלות הקרן בשנה = ${fmt(one)} ₪`, { a: "right", size: phone ? 10.5 : 13, fill: "var(--foreground)" }));
  return `<svg viewBox="0 0 ${W} ${H}" role="img">${parts.join("")}</svg>`;
};
const stripsCard = () => `<div class="card flush"><div class="sec-h"><h2>כל הקרנות, על אותו ציר</h2><p class="muted small">כל צורה היא קרן. הציר זהה לציר של החשבונות, אז אפשר להשוות אורכים ישירות.</p></div>
  <div class="chartpad"><div class="pc">${strips(1060, false)}</div><div class="ph">${strips(346, true)}</div></div>
  <div class="foot"><span class="link">כל הקרנות בטבלה ▾</span></div></div>`;

// ---------------------------------------------------------------- other plans
const PLANS = [
  { he: "פעם אחת 50,000 ₪", a: 50000, m: 0, y: 10 },
  { he: "500 ₪ בכל חודש", a: 0, m: 500, y: 10 },
  { he: "5,000 ₪ בכל חודש", a: 0, m: 5000, y: 10 },
  { he: "פעם אחת 1,000,000 ₪", a: 1000000, m: 0, y: 10 },
];
const miniLabels = [["acct", "החשבון", "var(--palette-neutral-300)"], ["kind", "סוג הקרן, כל סוג בחשבון הזול לו", "var(--palette-neutral-600)"], ["same", "קנייה בחו״ל, באותו חשבון", "var(--k-abroad)"], ["fund", "הקרן, באותו סוג ובאותו חשבון", "var(--k-etf)"]];
const plansCard = () => `<div class="card flush"><div class="sec-h"><h2>ובתוכניות אחרות?</h2><p class="muted small">אותם ארבעה פסים בתוכניות אחרות, כולן ל־10 שנים. הסרגלים למעלה מזיזים את הפסים באותו אופן.</p></div>
  <div class="minis2">${PLANS.map((p) => {
    const m = measure(p.a, p.m, p.y);
    const mx = Math.max(...miniLabels.map(([k]) => m[k]));
    return `<div class="mini"><b>${iso(p.he)}</b>${miniLabels.map(([k, l, c]) => `<div class="mrow"><span class="xs muted">${l}</span><div class="mbar"><i style="width:${(m[k] / mx) * 74}%;background:${c}"></i><strong class="n xs">${fmt(m[k])} ₪</strong></div></div>`).join("")}</div>`;
  }).join("")}</div></div>`;

// ---------------------------------------------------------------- option B: where the money goes
const REF = Math.max(...ALL.flatMap((h) => KINDS.map((k) => cellLeft(k.id, h) ?? 0)));
const costCell = (k, h, scale) => {
  const left = cellLeft(k.id, h), b = bestOf(k.id, h), w = worstOf(k.id, h);
  if (b === null) return `<td class="na"><span class="xs muted">לא נמכר</span></td>`;
  const acct = REF - left, fund = left - b, more = b - w;
  const px = (v) => (v / scale) * 100;
  const best = kindBest.find((x) => x.k.id === k.id)?.h === h;
  return `<td class="${best ? "bc" : ""}"><span class="cn n">−${fmt(REF - b)} ₪</span><span class="cb"><i style="width:${Math.max(px(acct), acct > 0 ? 0.6 : 0)}%;background:var(--chart-cost-trade)"></i><i style="width:${Math.max(px(fund), 0.8)}%;background:var(--chart-fee)"></i>${more > 1 ? `<i class="hatch" style="width:${px(more)}%"></i>` : ""}</span></td>`;
};
const costLegend = () => `<div class="lg big"><span><i class="sw2" style="background:var(--chart-cost-trade)"></i>מה שהחשבון גובה</span><span><i class="sw2" style="background:var(--chart-fee)"></i>מה שהקרן הזולה בסוג גובה</span><span><i class="sw2 hatch"></i>כמה עוד, בקרן היקרה באותו סוג</span></div>`;
const costGrid = () => {
  const scale = 30000;
  return `<div class="card flush"><div class="sec-h"><h2>לאן הולך הכסף, בכל חשבון ובכל סוג</h2><p class="muted small">ככל שהפס קצר יותר, נשאר יותר. כל פס נמדד מול ${N(REF)}, מה שהיה נשאר בחשבון הכי זול בלי שום עלות קרן.</p></div>
  <div class="chartpad">${costLegend()}</div>
  <div class="pc"><table class="fixed t-cost"><colgroup><col class="c1"><col><col><col><col></colgroup><thead><tr><th>חשבון</th>${KINDS.map((k) => `<th>${icon(k)} ${k.he}</th>`).join("")}</tr></thead>
  <tbody>${GROUPS.map((g) => `<tr class="gr"><th colspan="5">${g.he}</th></tr>${g.ids.map((h) => `<tr><th scope="row">${NAMES[h]}</th>${KINDS.map((k) => costCell(k, h, scale)).join("")}</tr>`).join("")}`).join("")}</tbody></table></div>
  <div class="ph phcost">${GROUPS.map((g) => `<div class="gr">${g.he}</div>${g.ids.map((h) => `<div class="pr"><b>${NAMES[h]}</b>${KINDS.map((k) => {
    const b = bestOf(k.id, h);
    if (b === null) return "";
    const left = cellLeft(k.id, h), w = worstOf(k.id, h);
    const px = (v) => (v / scale) * 100;
    return `<div class="pl">${icon(k, 13)}<span class="cb"><i style="width:${px(REF - left)}%;background:var(--chart-cost-trade)"></i><i style="width:${Math.max(px(left - b), 0.8)}%;background:var(--chart-fee)"></i>${b - w > 1 ? `<i class="hatch" style="width:${px(b - w)}%"></i>` : ""}</span><span class="n xs">−${fmt(REF - b)} ₪</span></div>`;
  }).join("")}</div>`).join("")}`).join("")}</div>
  <div class="chartpad"><div class="greys">${GREY.map(([n, w]) => `<span><span class="tag caution">אין מחיר</span> ${n}: <span class="muted">${w}</span></span>`).join("")}</div></div></div>`;
};

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>עמוד המדד: סיבוב שני</title><style>${css}</style></head><body><div class="doc">
<header class="doc-h"><h1>עמוד המדד: סיבוב שני</h1><p class="muted small">S&P 500, על התוכנית שהעמוד נפתח בה: <span class="n">10,000 ₪</span> היום ועוד <span class="n">500 ₪</span> בחודש, 10 שנים, תשואה של 7% ואינפלציה של 2%. כל מספר מהמחשבון של האתר, בכסף של היום ואחרי מס. אין כאן מספר מומצא.</p></header>
<section class="option"><div class="opt-h"><h2>אפשרות א: ציר אחד לכל העמוד</h2><span class="tag rec">מומלצת</span></div>
<p class="muted small">קודם כמה כל בחירה מזיזה; אחר כך המפה של כל החשבונות וכל הסוגים; ואז הקרנות על אותו ציר.</p>
<div class="site">${top()}${result()}${movers()}${mapCard()}${stripsCard()}${plansCard()}</div></section>
<section class="option"><div class="opt-h"><h2>אפשרות ב: לאן הולך הכסף</h2></div>
<p class="muted small">פס לכל שילוב של חשבון וסוג. הכתום הוא החשבון והצהוב הוא הקרן, ואורך הפס הוא הכסף שהלך.</p>
<div class="site">${top()}${result()}${costGrid()}${plansCard()}</div></section>
</div></body></html>`;
writeFileSync(OUT, html);
console.log({ BEST, mAcct, mAcctAll, mKind, same: sameMax, sameMin, mFund, REF, kinds: kindBest.map((x) => [x.k.id, x.h, Math.round(x.v)]), plans: PLANS.map((p) => measure(p.a, p.m, p.y)) });
