// The working sketch of the stairs: start somewhere, see what each one change adds. Used by gen-stairs.mjs (first paint) and by the page itself.
// Every figure is the site's engine output in stairs.json; nothing here computes money except differences and tax = base - left - account - fund (F-91).
function makeApp(D) {
  const AN = { "interactive-israel": "אינטראקטיב ישראל", "altshuler-trade": "אלטשולר שחם טרייד", excellence: "אקסלנס טרייד", discount: "בנק דיסקונט", hapoalim: "בנק הפועלים", yahav: "בנק יהב", jerusalem: "בנק ירושלים", leumi: "בנק לאומי", "mizrahi-tefahot": "מזרחי טפחות", massad: "בנק מסד", mercantile: "בנק מרכנתיל", fibi: "הבינלאומי", "one-zero": "וואן זירו", "meitav-trade": "מיטב טרייד", fair: "פייר", psagot: "פסגות", pepper: "פפר", ibi: "אי.בי.אי.", "interactive-brokers": "Interactive Brokers" };
  const FN = { 5139282: "ילין לפידות מחקה", 5139100: "אלטשולר שחם מחקה", 5124482: "קסם מחקה", 5129275: "הראל מחקה", 5127527: "הראל מחקה מנוטרלת", 1218916: "ATF סל", 1201656: "ילין לפידות סל", 1165810: "מור סל", 1150333: "MTF סל", 1149020: "הראל סל", 1146471: "קסם סל", 1144385: "תכלית סל", 1148162: "אי.בי.אי. סל", 1159250: "iShares בתל אביב", ie00b5bmr087: "iShares צוברת", ie00bfmxxd54: "Vanguard צוברת", ie0031442068: "iShares מחלקת", ie00b3xxrp09: "Vanguard מחלקת" };
  const KN = { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "קרן שנקנית בחו״ל" };
  const KINDS = Object.keys(KN);
  const DOUBT = new Set(["excellence"]);
  const LANE = {
    account: { hue: "var(--lane-account)", word: "חשבון אחר", title: "חשבון אחר, אותה קרן", head: "החשבון" },
    kind: { hue: "var(--lane-kind)", word: "סוג קרן אחר", title: "סוג קרן אחר, אותו חשבון", head: "סוג הקרן" },
    fund: { hue: "var(--lane-fund)", word: "קרן אחרת", title: "קרן אחרת מאותו סוג, אותו חשבון", head: "הקרן" },
  };
  const LOCK = `<svg class="lock" viewBox="0 0 12 14" width="11" height="13" aria-label="כלל מס פתוח"><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="1.5" y="6" width="9" height="7" rx="1.5" fill="currentColor"/></svg>`;
  const fmt = (x) => Math.round(Math.abs(x)).toLocaleString("en");
  const money = (x) => `${x < 0 ? "−" : ""}${fmt(x)} ₪`;
  const signed = (d) => (Math.round(d) === 0 ? "0 ₪" : `${d < 0 ? "−" : "+"}${fmt(d)} ₪`);
  const N = (s) => `<span class="n">${s}</span>`;
  const iso = (s) => s.replace(/[−+]?\d[\d,.]*%?(?: ₪)?/g, (m) => "⁦" + m + "⁩");
  const T = (x, y, s, { a = "right", size = 13, fill = "var(--muted-foreground)", w = 400 } = {}) => `<text x="${x}" y="${y}" direction="rtl" text-anchor="${a === "right" ? "start" : a === "left" ? "end" : "middle"}" font-size="${size}" font-weight="${w}" fill="${fill}" stroke="var(--card)" stroke-width="4" paint-order="stroke">${iso(s)}</text>`;

  const planOf = (s) => D.plans[`${D.AMOUNTS[s.ai]}|${D.MONTHLY[s.mi]}|${D.YEARS[s.yi]}`];
  const val = (p, pos) => (DOUBT.has(D.accts[pos.a]) ? null : p.v[pos.f][pos.a]);
  const costs = (p, pos) => { const v = val(p, pos), a = p.c[pos.f][pos.a], f = p.f[pos.f]; return { v, a, f, t: p.b - v - a - f }; };
  const fundsOf = (kind) => D.funds.flatMap((x, i) => (x.kind === kind ? [i] : []));
  const whyOf = (a, f) => (DOUBT.has(D.accts[a]) ? "d" : D.why[`${D.accts[a]}|${D.funds[f].id}`] ?? "n");
  const WHY = { u: "לא נמכרת שם", n: "אין מחיר", d: "המחיר לא אומת" };

  // every single change from one holding: another account, another kind of fund, another fund of the same kind
  function rowsAt(p, pos) {
    const cur = val(p, pos);
    const row = (lane, to, label, extra = {}) => {
      const v = val(p, to);
      return { lane, to, label, v, d: v == null || cur == null ? null : v - cur, open: !!p.o[to.f], hedged: D.funds[to.f].hedged, why: v == null ? whyOf(to.a, to.f) : null, key: `${lane}|${label}`, ...extra };
    };
    const out = [];
    D.accts.forEach((id, a) => { if (a !== pos.a) out.push(row("account", { a, f: pos.f }, AN[id])); });
    const here = D.funds[pos.f].kind;
    for (const k of KINDS) {
      if (k === here) continue;
      const cand = fundsOf(k).filter((f) => !D.funds[f].hedged);
      const priced = cand.filter((f) => val(p, { a: pos.a, f }) != null).sort((x, y) => val(p, { a: pos.a, f: y }) - val(p, { a: pos.a, f: x }));
      out.push(row("kind", { a: pos.a, f: priced[0] ?? cand[0] }, KN[k], { sub: priced.length ? FN[D.funds[priced[0]].id] : null }));
    }
    for (const f of fundsOf(here)) if (f !== pos.f) out.push(row("fund", { a: pos.a, f }, FN[D.funds[f].id]));
    return out;
  }
  const byGain = (x, y) => (y.d ?? -Infinity) - (x.d ?? -Infinity);
  const ranks = (r) => r.d != null && !r.open && !r.hedged;

  function ceilingOf(p) {
    let top = null;
    D.funds.forEach((fund, f) => { if (fund.hedged || p.o[f]) return; D.accts.forEach((_, a) => { const v = val(p, { a, f }); if (v != null && (!top || v > top.v)) top = { v, a, f }; }); });
    return top;
  }
  function openTopOf(p) {
    let top = null;
    D.funds.forEach((fund, f) => { if (fund.hedged || !p.o[f]) return; D.accts.forEach((_, a) => { const v = val(p, { a, f }); if (v != null && (!top || v > top.v)) top = { v, a, f }; }); });
    return top;
  }
  function climbFrom(p, from) {
    const path = [];
    let at = from;
    for (let i = 0; i < 6; i++) {
      const best = rowsAt(p, at).filter((r) => ranks(r) && r.d > 0).sort(byGain)[0];
      if (!best) break;
      path.push(best);
      at = best.to;
    }
    return path;
  }
  // the chain on the current plan: the start, what was taken, then the largest step left each time
  function chainOf(s) {
    const p = planOf(s);
    const taken = [];
    for (const t of s.taken) { if (val(p, t.to) == null) break; taken.push(t); }
    const at = taken.length ? taken[taken.length - 1].to : s.start;
    const next = climbFrom(p, at);
    const items = [{ pos: s.start, lane: null }, ...taken.map((t) => ({ pos: t.to, lane: t.lane, taken: true })), ...next.map((n) => ({ pos: n.to, lane: n.lane }))];
    const chain = items.map((it, i) => { const c = costs(p, it.pos); const pv = i ? costs(p, items[i - 1].pos) : null; return { ...it, c, d: pv ? c.v - pv.v : null, da: pv ? c.a - pv.a : null, df: pv ? c.f - pv.f : null, dt: pv ? c.t - pv.t : null, open: !!p.o[it.pos.f] }; });
    return { p, at, chain, here: taken.length, ceiling: ceilingOf(p) };
  }
  function yScale(p, chain, ceiling) {
    const all = [];
    D.funds.forEach((fund, f) => { if (!fund.hedged) D.accts.forEach((_, a) => { const v = val(p, { a, f }); if (v != null) all.push(v); }); });
    all.sort((x, y) => x - y);
    const lvl = chain.map((c) => c.c.v);
    const lo = Math.min(all[Math.floor(all.length * 0.05)], ...lvl), hi = Math.max(ceiling.v, ...lvl);
    const raw = (hi - lo) / 4;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= raw);
    const LO = Math.max(0, Math.floor((lo - (hi - lo) * 0.06) / step) * step);
    return { LO, HI: hi, step };
  }
  const nameOf = (pos) => `${FN[D.funds[pos.f].id]}, ${AN[D.accts[pos.a]]}`;
  const swatch = (lane) => `<i class="sw" style="background:${LANE[lane].hue}"></i>`;

  // ---- the stairs: money up, order of the steps left to right
  const SLOTS = 5;
  function stairsSVG(view, { W, H, compact }) {
    const { p, chain, here, ceiling } = view;
    const fold = Math.max(0, chain.length - SLOTS);
    const cols = chain.slice(fold);
    const m = compact ? { l: 44, r: 6, t: 40, b: 6 } : { l: W * 0.095, r: W * 0.175, t: 44, b: 6 };
    const cw = (W - m.l - m.r) / SLOTS;
    const { LO, HI, step } = yScale(p, chain, ceiling);
    const y = (v) => m.t + (1 - (v - LO) / (HI - LO)) * (H - m.t - m.b);
    const floor = y(LO);
    const o = [];
    for (let g = LO; g <= HI; g += step) o.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${y(g)}" y2="${y(g)}" stroke="var(--chart-grid)"/><text x="${m.l - 8}" y="${y(g) + 4}" text-anchor="end" font-size="${compact ? 10.5 : 12}" fill="var(--chart-text)">${compact && g >= 1000 ? fmt(g / 1000) + "K" : fmt(g)}</text>`);
    const bx = (i) => m.l + i * cw + cw * 0.1, bw = cw * 0.8;
    cols.forEach((c, i) => {
      const lvl = c.c.v, prev = i || fold ? chain[fold + i - 1].c.v : lvl;
      const low = Math.min(lvl, prev), high = Math.max(lvl, prev);
      const first = i === 0;
      const solid = first || c.taken;
      if (first) {
        o.push(`<rect x="${bx(i)}" y="${y(lvl)}" width="${bw}" height="${floor - y(lvl)}" rx="3" fill="var(--palette-neutral-600)"/>`);
        if (c.open) o.push(`<rect x="${bx(i) + 1}" y="${y(lvl) + 1}" width="${bw - 2}" height="${floor - y(lvl) - 2}" rx="3" fill="var(--card)" stroke="var(--palette-neutral-400)" stroke-width="1.5"/>`);
        o.push(`<path d="M${bx(i)} ${floor - 12}l${bw / 6} -5l${bw / 3} 10l${bw / 3} -10l${bw / 6} 5" fill="none" stroke="var(--card)" stroke-width="3"/>`);
      } else {
        const hue = c.d < 0 ? "var(--loss)" : LANE[c.lane].hue;
        o.push(`<rect x="${bx(i)}" y="${y(low)}" width="${bw}" height="${floor - y(low)}" fill="var(--palette-neutral-850)"/>`);
        if (c.open) o.push(`<rect x="${bx(i) + 1}" y="${y(high) + 1}" width="${bw - 2}" height="${Math.max(y(low) - y(high) - 2, 2)}" rx="3" fill="var(--card)" stroke="${hue}" stroke-width="2"/>`);
        else o.push(`<rect x="${bx(i)}" y="${y(high)}" width="${bw}" height="${Math.max(y(low) - y(high), 2)}" rx="3" fill="${hue}" opacity="${solid ? 1 : 0.5}"/>${solid ? "" : `<rect x="${bx(i) + 0.75}" y="${y(high) + 0.75}" width="${bw - 1.5}" height="${Math.max(y(low) - y(high) - 1.5, 1)}" rx="3" fill="none" stroke="${hue}" stroke-width="1.5"/>`}`);
      }
      if (i < cols.length - 1) o.push(`<line x1="${bx(i) + bw}" x2="${bx(i + 1)}" y1="${y(lvl)}" y2="${y(lvl)}" stroke="var(--palette-neutral-400)" stroke-width="1.5"/>`);
      const top = first ? y(lvl) : y(high);
      const txt = first ? money(lvl) : signed(c.d);
      o.push(T(bx(i) + bw / 2, top - 7, txt, { a: "mid", size: compact ? 11.5 : 15, fill: "var(--foreground)", w: 600 }));
      if (fold + i === here) o.push(`<path d="M${bx(i) + bw / 2 - 6} ${top - 30}h12l-6 7z" fill="var(--primary)"/>`, T(bx(i) + bw / 2, top - 34, "עכשיו", { a: "mid", size: compact ? 11 : 13, fill: "var(--primary)", w: 600 }));
      o.push(`<rect class="hit" data-go="${fold + i}" x="${m.l + i * cw}" y="0" width="${cw}" height="${H}" fill="transparent"/>`);
    });
    // the highest over every collected pair, and the end of this climb when it stops below it
    const last = chain[chain.length - 1].c.v;
    o.unshift(`<line x1="${m.l}" x2="${W - m.r + (compact ? 0 : 4)}" y1="${y(ceiling.v)}" y2="${y(ceiling.v)}" stroke="var(--palette-neutral-300)" stroke-width="1.5" stroke-dasharray="3 5"/>`);
    if (!compact) {
      const x = W - m.r + 10;
      o.push(T(x + m.r - 12, y(ceiling.v) - 22, "הכי הרבה בכל המחירונים", { size: 13 }), T(x + m.r - 12, y(ceiling.v) - 3, money(ceiling.v), { size: 18, fill: "var(--foreground)", w: 600 }), T(x + m.r - 12, y(ceiling.v) + 17, FN[D.funds[ceiling.f].id], { size: 13 }), T(x + m.r - 12, y(ceiling.v) + 35, AN[D.accts[ceiling.a]], { size: 13 }));
      const lastX = bx(cols.length - 1) + bw + 8;
      if (Math.round(last) !== Math.round(ceiling.v) && cols.length < SLOTS && cols.length > 1) o.push(T(lastX, y(last) + 5, `בסוף: ${money(last)}`, { a: "left", size: 14, fill: "var(--foreground)", w: 600 }));
    }
    return `<svg class="stairs" viewBox="0 0 ${W} ${H}" role="img" aria-label="מדרגות">${o.join("")}</svg>`;
  }

  // the table under the stairs, one column per step, on the chart's own columns
  function underTable(view, W) {
    const { chain } = view;
    const fold = Math.max(0, chain.length - SLOTS);
    const cols = chain.slice(fold);
    const g = 9.5, r = 17.5, c = (100 - g - r) / SLOTS;
    const blanks = (n) => Array(n).fill("<div></div>").join("");
    const line = (head, cell, cls = "") => `<div class="uh ${cls}">${head}</div>${cols.map(cell).join("")}${blanks(SLOTS - cols.length)}<div></div>`;
    const big = (x) => { const v = [x.da, x.df, x.dt].map((z) => Math.abs(z ?? 0)); return Math.max(...v); };
    const diff = (x, key, abs) => {
      if (x[key] == null) return `<div class="uc">${N(money(abs))}</div>`;
      return `<div class="uc ${Math.abs(x[key]) === big(x) && Math.abs(x[key]) >= 1 ? "hot" : Math.round(x[key]) === 0 ? "dim" : ""}">${N(signed(x[key]))}</div>`;
    };
    return `<div class="under" style="grid-template-columns:${g}% ${Array(SLOTS).fill(c + "%").join(" ")} ${r}%">`
      + line("הצעד", (x, i) => `<div class="uc what">${x.lane ? `${swatch(x.lane)}${LANE[x.lane].word}` : fold ? `אחרי ${fold} צעדים` : "נקודת ההתחלה"}</div>`, "first")
      + line("הקרן", (x, i) => `<div class="uc ${x.lane && x.lane !== "account" ? "chg" : "dim"}">${FN[D.funds[x.pos.f].id]}${x.open ? " " + LOCK : ""}</div>`)
      + line("החשבון", (x) => `<div class="uc ${x.lane === "account" ? "chg" : "dim"}">${AN[D.accts[x.pos.a]]}</div>`)
      + line("עלות החשבון", (x) => diff(x, "da", x.c.a), "sep")
      + line("עלות הקרן", (x) => diff(x, "df", x.c.f))
      + line("מס", (x) => diff(x, "dt", x.c.t))
      + line("נשאר בסוף", (x) => `<div class="uc total">${N(money(x.c.v))}</div>`, "sep")
      + `</div>`;
  }

  // the same steps as a list, where the columns do not fit
  function stepList(view) {
    const { chain } = view;
    const parts = (x) => [["עלות החשבון", x.da], ["עלות הקרן", x.df], ["מס", x.dt]].filter(([, v]) => Math.round(v) !== 0).map(([n, v]) => `${n} ${N(signed(v))}`).join(" · ");
    return `<ol class="steps">${chain.map((x, i) => {
      const head = !x.lane ? `נקודת ההתחלה: ${nameOf(x.pos)}` : x.lane === "account" ? `${LANE[x.lane].word}: ${AN[D.accts[x.pos.a]]}` : `${LANE[x.lane].word}: ${FN[D.funds[x.pos.f].id]}`;
      return `<li><button data-go="${i}" class="${x.taken || !x.lane ? "" : "next"}" type="button"><span class="st-h">${x.lane ? swatch(x.lane) : '<i class="sw" style="background:var(--palette-neutral-600)"></i>'}<b>${head}</b>${x.open ? LOCK : ""}<span class="n st-d">${x.lane ? signed(x.d) : money(x.c.v)}</span></span>${x.lane ? `<span class="st-w">${parts(x)}</span>` : ""}</button></li>`;
    }).join("")}</ol>`;
  }

  // one row of a choice: its name, a bar from "as it is now", the difference
  function bar(r, U) {
    if (Math.round(r.d) === 0) return `<span class="tk"><i class="zr"></i></span>`;
    const w = (Math.abs(r.d) / U) * 50, up = r.d > 0, col = up ? "var(--gain)" : "var(--loss)";
    const look = r.open ? `border:1.5px solid ${col};background:none` : `background:${col}`;
    return `<span class="tk"><i class="zr"></i><i class="br" style="${up ? "left" : "right"}:50%;width:${Math.min(w, 50)}%;${look}"></i>${w > 50 ? `<i class="cut ${up ? "cr" : "cl"}"></i>` : ""}</span>`;
  }
  // one unit for every row on screen, set by the rows that rank; one on an open rule that runs further is cut, with a mark
  const unitOf = (rows) => { const ranked = rows.filter(ranks); return Math.max(1, ...(ranked.length ? ranked : rows.filter((r) => r.d != null)).map((r) => Math.abs(r.d))); };
  const barHead = () => `<span class="tkh"><i class="zr"></i><span class="l">פחות<span class="ks"> כסף</span></span><span class="r">יותר<span class="ks"> כסף</span></span></span>`;
  const more = (d) => (Math.round(d) === 0 ? `<span class="df same">אותו סכום</span>` : `<span class="df ${d < 0 ? "less" : ""}"><span class="w">${d < 0 ? "פחות" : "עוד"}</span>${N(money(Math.abs(d)))}</span>`);
  function choiceRow(r, U, withKind, turn) {
    const kd = withKind ? `<span class="kd">${swatch(r.lane)}<span class="kw">${LANE[r.lane].word}</span></span>` : "";
    const nm = `<span class="nm"><b>${r.label}${r.open ? LOCK : ""}</b>${r.sub ? `<small>${r.sub}</small>` : ""}${r.hedged ? '<small class="chip mini">מנוטרלת מט״ח</small>' : ""}</span>`;
    return `<button type="button" class="rw ${withKind ? "wk" : ""} ${turn ? "turn" : ""} ${r.d < 0 ? "less" : ""}" data-step="${r.lane}|${r.to.a}|${r.to.f}">${kd}${nm}<span class="vl n">${money(r.v)}</span>${bar(r, U)}${more(r.d)}</button>`;
  }
  const priced = (rows, U, withKind) => rows.filter((r) => r.d != null).map((r, i, all) => choiceRow(r, U, withKind, i > 0 && all[i - 1].d >= 0 && r.d < 0)).join("");
  function greyLines(rows) {
    const out = [];
    for (const why of ["u", "n", "d"]) { const mine = rows.filter((r) => r.d == null && r.why === why); if (mine.length) out.push(`<div class="gl xs"><b>${WHY[why]}:</b> ${mine.map((r) => r.label).join(", ")}</div>`); }
    return out.join("");
  }
  function ordered(s, rows) {
    if (s.frozen) { const ix = new Map(s.frozen.map((k, i) => [k, i])); return [...rows].sort((a, b) => (ix.get(a.key) ?? 99) - (ix.get(b.key) ?? 99)); }
    return [...rows].sort(byGain);
  }
  function laneBlock(s, rows, lane, U) {
    const mine = ordered(s, rows.filter((r) => r.lane === lane));
    return `<div class="lane"><h4>${swatch(lane)}${LANE[lane].title}</h4><div class="rw hd"><span>${LANE[lane].head}</span><span class="vl">נשאר בסוף</span>${barHead()}<span>לעומת עכשיו</span></div>${mine.length ? priced(mine, U) + greyLines(mine) : '<p class="xs muted">אין קרן אחרת מהסוג הזה.</p>'}</div>`;
  }

  // what is true where the climb stopped; one height, so nothing under it moves
  function statusLine(view) {
    const { p, chain, ceiling, at } = view;
    const end = chain[chain.length - 1];
    const ot = openTopOf(p);
    const openNote = ot && ot.v > ceiling.v ? ` עם כלל מס פתוח מופיע גם ${N(money(ot.v))}: ${nameOf(ot)}.` : "";
    if (Math.round(end.c.v) >= Math.round(ceiling.v)) return `<p class="status small">אחרי המדרגות האלה אין בחירה אחרת שמשאירה יותר, בכל החשבונות שיש להם מחיר.${openNote}</p>`;
    return `<p class="status small">מכאן אין שינוי אחד שמשפר. עד הכי הרבה חסרים עוד ${N(money(ceiling.v - end.c.v))}, וכדי להגיע אליו צריך לשנות כמה דברים יחד. <button type="button" class="lnk" data-jump="${ceiling.a}|${ceiling.f}">לעבור אל ${nameOf(ceiling)}</button>${openNote}</p>`;
  }
  const headBar = (s, view, title) => `<div class="phd"><h3>${title}</h3><button type="button" class="ghost" data-reset ${s.taken.length ? "" : "disabled"}>חזרה לנקודת ההתחלה</button></div>`;
  const legend = () => `<div class="lgd xs"><span><i class="sw" style="background:var(--palette-neutral-600)"></i>נקודת ההתחלה</span>${Object.keys(LANE).map((l) => `<span>${swatch(l)}${LANE[l].word}</span>`).join("")}<span><i class="sw ghosted"></i>הצעד הכי גדול שנשאר, עוד לא נלקח</span><span>${LOCK} נשען על כלל מס פתוח: מוצג ולא מדורג</span></div>`;
  const here = (view) => `עכשיו: ${nameOf(view.at)}. נשארים בסוף ${N(money(view.chain[view.here].c.v))}.`;

  // ---- option A: the stairs, and under them every choice, by what it changes
  function optionA(s, W) {
    const compact = W < 720;
    const view = chainOf(s);
    const rows = rowsAt(view.p, view.at);
    const U = unitOf(rows);
    return `<div class="panel">${headBar(s, view, "מנקודת ההתחלה ועד הכי הרבה")}<p class="xs muted axis-t">הגובה הוא מה שנשאר בסוף, אחרי מס, בכסף של היום. לחיצה על מדרגה לוקחת אותה, או חוזרת אליה אם כבר נלקחה.</p>${stairsSVG(view, { W, H: compact ? 300 : 340, compact })}${compact ? stepList(view) : underTable(view, W)}${statusLine(view)}${legend()}</div>
    <div class="panel"><div class="phd"><h3>${here(view)}</h3></div><p class="small muted">כל שורה משנה דבר אחד. לחיצה על שורה מוסיפה אותה למדרגות.</p><div class="lanes"><div>${laneBlock(s, rows, "account", U)}</div><div class="stack">${laneBlock(s, rows, "kind", U)}${laneBlock(s, rows, "fund", U)}</div></div></div>`;
  }

  // ---- option B: every choice in one ranked list, beside the stairs
  function optionB(s, W) {
    const compact = W < 900;
    const view = chainOf(s);
    const rows = ordered(s, rowsAt(view.p, view.at));
    const U = unitOf(rows);
    const sw = compact ? W : W * 0.42 - 16;
    const list = `<div class="panel"><div class="phd"><h3>${here(view)}</h3></div><p class="small muted">כל שורה משנה דבר אחד. מה שמשאיר הכי הרבה למעלה, ומה שמשאיר פחות מעכשיו למטה. לחיצה על שורה מוסיפה אותה למדרגות.</p><div class="rw hd wk"><span class="kw">מה משתנה</span><span>אל מה</span><span class="vl">נשאר בסוף</span>${barHead()}<span>לעומת עכשיו</span></div>${priced(rows, U, true)}${greyLines(rows)}</div>`;
    const stairs = `<div class="panel">${headBar(s, view, "המדרגות")}<p class="xs muted axis-t">הגובה הוא מה שנשאר בסוף, אחרי מס, בכסף של היום. לחיצה על מדרגה לוקחת אותה, או חוזרת אליה אם כבר נלקחה.</p>${stairsSVG(view, { W: sw - 40, H: 300, compact: true })}${stepList(view)}<p class="small">הכי הרבה בכל המחירונים: <b>${N(money(view.ceiling.v))}</b>, ${nameOf(view.ceiling)}.</p>${statusLine(view)}${legend()}</div>`;
    return `<div class="two">${list}${stairs}</div>`;
  }

  // ---- option C: one money ruler; the stairs lie on it, and every choice is a dot on it
  function rulerSVG(s, view, { W, compact }) {
    const { p, chain, here: hereI, at, ceiling } = view;
    const rows = rowsAt(p, at).filter((r) => r.d != null && !r.hedged);
    const m = compact ? { l: 12, r: 12 } : { l: W * 0.17, r: W * 0.2 };
    const all = [];
    D.funds.forEach((fund, f) => { if (!fund.hedged) D.accts.forEach((_, a) => { const v = val(p, { a, f }); if (v != null) all.push(v); }); });
    const lo = Math.min(...all, ...chain.map((c) => c.c.v)), hi = Math.max(...all, ...chain.map((c) => c.c.v));
    const x = (v) => m.l + ((v - lo) / (hi - lo || 1)) * (W - m.l - m.r);
    const rowH = compact ? 26 : 25, laneH = compact ? 92 : 76;
    const shown = chain.slice(-6);
    const startI = chain.length - shown.length;
    const y0 = 34, yLanes = y0 + shown.length * rowH + 22;
    const H = yLanes + 3 * laneH + 34;
    const cur = chain[hereI].c.v;
    const o = [];
    const step = (() => { const raw = (hi - lo) / 5, mag = 10 ** Math.floor(Math.log10(raw)); return [1, 2, 2.5, 5, 10].map((q) => q * mag).find((q) => q >= raw); })();
    for (let g = Math.ceil(lo / step) * step; g <= hi; g += step) o.push(`<line x1="${x(g)}" x2="${x(g)}" y1="${y0 - 4}" y2="${H - 26}" stroke="var(--chart-grid)"/><text x="${x(g)}" y="${H - 8}" text-anchor="middle" font-size="${compact ? 10.5 : 12}" fill="var(--chart-text)">${fmt(g)}</text>`);
    o.push(`<line x1="${x(ceiling.v)}" x2="${x(ceiling.v)}" y1="${y0 - 8}" y2="${H - 26}" stroke="var(--palette-neutral-300)" stroke-width="1.5" stroke-dasharray="3 5"/>`);
    o.push(`<line x1="${x(cur)}" x2="${x(cur)}" y1="${y0 - 8}" y2="${H - 26}" stroke="var(--primary)" stroke-width="2"/>`, x(ceiling.v) - x(cur) < 150 ? T(x(cur) + 4, y0 - 14, `עכשיו: ${money(cur)}`, { a: "right", size: compact ? 12 : 13, fill: "var(--primary)", w: 600 }) : T(x(cur), y0 - 14, `עכשיו: ${money(cur)}`, { a: "mid", size: compact ? 12 : 13, fill: "var(--primary)", w: 600 }));
    if (!compact) o.push(T(x(ceiling.v) + 8, y0 - 14, `הכי הרבה: ${money(ceiling.v)}`, { a: "left", size: 13, fill: "var(--foreground)" }));
    shown.forEach((c, i) => {
      const yy = y0 + i * rowH, h = rowH - 9, lvl = c.c.v;
      const solid = !c.lane || c.taken;
      if (!c.lane || i === 0) {
        o.push(`<rect x="${m.l}" y="${yy}" width="${x(lvl) - m.l}" height="${h}" rx="3" fill="var(--palette-neutral-600)"/>`);
        if (!compact) o.push(T(m.l - 8, yy + h - 3, `נקודת ההתחלה ${money(lvl)}`, { a: "right", size: 13, fill: "var(--foreground)" }));
      } else {
        const from = lvl - c.d, a = Math.min(from, lvl), b = Math.max(from, lvl), hue = c.d < 0 ? "var(--loss)" : LANE[c.lane].hue;
        o.push(c.open ? `<rect x="${x(a)}" y="${yy}" width="${Math.max(x(b) - x(a), 2)}" height="${h}" rx="3" fill="var(--card)" stroke="${hue}" stroke-width="2"/>` : `<rect x="${x(a)}" y="${yy}" width="${Math.max(x(b) - x(a), 2)}" height="${h}" rx="3" fill="${hue}" opacity="${solid ? 1 : 0.5}"/>`);
        const name = c.lane === "account" ? AN[D.accts[c.pos.a]] : FN[D.funds[c.pos.f].id];
        if (compact) o.push(T(x(a) > W / 2 ? x(a) - 6 : x(b) + 6, yy + h - 3, x(a) > W / 2 ? `${signed(c.d)} ${name}` : `${signed(c.d)} ${name}`, { a: x(a) > W / 2 ? "right" : "left", size: 11.5, fill: "var(--foreground)" }));
        else o.push(T(x(b) + 8, yy + h - 3, `${signed(c.d)} ${LANE[c.lane].word}: ${name}`, { a: "left", size: 13, fill: "var(--foreground)" }));
      }
      if (i < shown.length - 1) o.push(`<line x1="${x(lvl)}" x2="${x(lvl)}" y1="${yy + h}" y2="${yy + rowH}" stroke="var(--palette-neutral-400)"/>`);
      o.push(`<rect class="hit" data-go="${startI + i}" x="0" y="${yy - 3}" width="${W}" height="${rowH}" fill="transparent"/>`);
    });
    ["account", "kind", "fund"].forEach((lane, li) => {
      const top = yLanes + li * laneH, cy = top + 34, hue = LANE[lane].hue;
      const mine = rows.filter((r) => r.lane === lane).sort(byGain);
      o.push(`<rect x="${W - 12}" y="${top + 2}" width="12" height="12" rx="2" fill="${hue}"/>`, T(W - 18, top + 13, LANE[lane].title, { size: 13.5, fill: "var(--foreground)", w: 500 }));
      o.push(`<line x1="${m.l}" x2="${W - m.r}" y1="${cy}" y2="${cy}" stroke="var(--palette-neutral-800)"/>`);
      if (!mine.length) { o.push(T(x(cur) + 10, cy - 8, "אין כאן בחירה אחרת", { a: "left", size: 12 })); return; }
      const best = mine.find((r) => !r.open) ?? mine[0], worst = mine[mine.length - 1];
      if (best.d > 0) o.push(`<line x1="${x(cur)}" x2="${x(best.v)}" y1="${cy}" y2="${cy}" stroke="var(--gain)" stroke-width="6"/>`);
      for (const r of [...mine].reverse()) o.push(`<circle cx="${x(r.v)}" cy="${cy}" r="${r === best ? 8 : 6}" fill="${r.open ? "var(--card)" : r.d < 0 ? "var(--loss)" : "var(--gain)"}" stroke="${r.open ? (r.d < 0 ? "var(--loss)" : "var(--gain)") : "var(--card)"}" stroke-width="2"/>`);
      for (const r of [...mine].reverse()) o.push(`<circle class="hit" data-step="${r.lane}|${r.to.a}|${r.to.f}" cx="${x(r.v)}" cy="${cy}" r="${compact ? 14 : 11}" fill="transparent"/>`);
      const lb = (r) => `${r.lane === "kind" ? r.sub ?? r.label : r.label}: ${Math.round(r.d) === 0 ? "אותו סכום" : `${r.d < 0 ? "פחות" : "עוד"} ${money(Math.abs(r.d))}`}`;
      if (compact) {
        o.push(T(W - 2, cy + 26, lb(best), { size: 11.5, fill: "var(--foreground)" }));
        if (worst !== best) o.push(T(2, cy + 26, lb(worst), { a: "left", size: 11.5 }));
      } else {
        o.push(T(x(best.v) + 12, cy + 5, lb(best), { a: "left", size: 13, fill: "var(--foreground)", w: 500 }));
        if (worst !== best) o.push(T(x(worst.v) - 12, cy + 5, lb(worst), { a: "right", size: 13 }));
      }
    });
    return `<svg class="ruler" viewBox="0 0 ${W} ${H}" role="img" aria-label="סרגל">${o.join("")}</svg>`;
  }
  function optionC(s, W) {
    const compact = W < 720;
    const view = chainOf(s);
    return `<div class="panel">${headBar(s, view, here(view))}<p class="small muted">סרגל אחד של כסף: מה שנשאר בסוף, אחרי מס, בכסף של היום. הקו הוא עכשיו. נקודה מימין לקו משאירה יותר, ונקודה משמאל לו פחות. לחיצה על נקודה מוסיפה אותה למדרגות.</p>${rulerSVG(s, view, { W, compact })}${statusLine(view)}${legend()}</div><div class="panel"><div class="phd"><h3>מה השתנה בכל צעד</h3></div>${stepList(view)}</div>`;
  }

  const OPTS = [optionA, optionB, optionC];
  const render = (s, i, W) => OPTS[i](s, W);
  const firstState = () => {
    const a = D.accts.indexOf("hapoalim"), f = D.funds.findIndex((x) => x.id === "1150333");
    return { ai: 1, mi: 1, yi: 1, start: { a, f }, taken: [], opt: 0, frozen: null };
  };
  const fieldOptions = (s) => {
    const p = planOf(s);
    const accts = D.accts.map((id, a) => { const any = DOUBT.has(id) ? null : D.funds.some((_, f) => p.v[f][a] != null); return `<option value="${a}" ${a === s.start.a ? "selected" : ""} ${any ? "" : "disabled"}>${AN[id]}${DOUBT.has(id) ? " (המחיר לא אומת)" : any ? "" : " (אין מחיר)"}</option>`; }).join("");
    const funds = KINDS.map((k) => `<optgroup label="${KN[k]}">${fundsOf(k).map((f) => { const ok = val(p, { a: s.start.a, f }) != null; return `<option value="${f}" ${f === s.start.f ? "selected" : ""} ${ok ? "" : "disabled"}>${FN[D.funds[f].id]}${ok ? "" : " (לא בחשבון הזה)"}</option>`; }).join("")}</optgroup>`).join("");
    return { accts, funds };
  };
  return { render, firstState, fieldOptions, planOf, val, fundsOf, chainOf, rowsAt, ceilingOf, climbFrom, money, D };
}
if (typeof module !== "undefined") module.exports = { makeApp };
