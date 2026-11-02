// Three drawings of the study-fund guide's signature, over the engine's figures in numbers.json. A mockup, not site code.
const D = window.__DATA__;
const LOCK = D.facts.lockYears;
const YEARS = D.rows.length;
const COIN = 1000;
const row = (y) => D.rows[y - 1];
const fmtN = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");
const nis = (n) => `<span class="n c">${n < 0 ? "−" : ""}${fmtN(n)} ₪</span>`;
const signed = (n) => `<span class="n c">${n < 0 ? "−" : "+"}${fmtN(n)} ₪</span>`;
const per = (n) => `<span class="n c">${n.toFixed(2)} ₪</span>`;
const yrs = (y) => (y === 1 ? "שנה אחת" : y === 2 ? "שנתיים" : `${y} שנים`);
const narrow = () => window.innerWidth <= 640;

function fundOf(y, who) {
  const r = row(y);
  if (who === "employee") {
    const net = r.own.net + r.emp.net, tax = r.own.tax + r.emp.tax;
    return { own: r.own.paid, extra: r.emp.paid, gain: net + tax - r.own.paid - r.emp.paid, tax, net, paid: r.own.paid };
  }
  const s = r.self.study;
  if (!s) return null;
  return { own: s.paid, extra: r.self.relief, gain: s.net + s.tax - s.paid - r.self.relief, tax: s.tax, net: s.net, paid: s.paid };
}
function acctOf(y, who) {
  const a = who === "employee" ? row(y).acct : row(y).self.broker;
  return { own: a.paid, extra: 0, gain: a.net + a.tax - a.paid, tax: a.tax, net: a.net, paid: a.paid };
}
const MAX_GROSS = Math.max(...D.rows.map((_, i) => { const f = fundOf(i + 1, "employee"); return f.net + f.tax; }));

// ---- the year strip: twelve small columns, the tax hatched on top, and a marker to drag
function hatch(id, color, gap = 4) {
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${gap}" height="${gap}" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${color}" stroke-width="1.6"/></pattern>`;
}
let uid = 0;
function stripSvg(width, year, who) {
  const id = `h${++uid}`;
  const H = 132, top = 24, base = 104, band = width / YEARS, barW = Math.min(band - 4, 34);
  const y = (v) => base - (v / MAX_GROSS) * (base - top);
  let bars = "";
  for (let i = 1; i <= YEARS; i++) {
    const f = fundOf(i, who), x = (i - 0.5) * band - barW / 2;
    if (!f) { bars += `<rect x="${x}" y="${base - 6}" width="${barW}" height="6" fill="none" stroke="var(--n-600)" stroke-dasharray="2 2"/>`; continue; }
    const on = i === year;
    bars += `<rect x="${x}" y="${y(f.net)}" width="${barW}" height="${base - y(f.net)}" rx="2" fill="${on ? "var(--n-50)" : "var(--n-600)"}"/>`;
    if (f.tax > 1) bars += `<rect x="${x}" y="${y(f.net + f.tax)}" width="${barW}" height="${y(f.net) - y(f.net + f.tax)}" fill="url(#${id})" stroke="var(--tax)" stroke-width="1"/>`;
  }
  const lockX = (LOCK - 1) * band, mx = (year - 0.5) * band;
  const ticks = Array.from({ length: YEARS }, (_, k) => k + 1).map((t) => `<text x="${(t - 0.5) * band}" y="${base + 18}" text-anchor="middle" font-size="13" fill="${t === year ? "var(--n-50)" : "var(--muted)"}" font-weight="${t === year ? 600 : 400}">${t}</text>`).join("");
  return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" dir="ltr"><defs>${hatch(id, "var(--tax)")}</defs>
    <text x="${lockX / 2}" y="13" text-anchor="middle" font-size="13" fill="var(--tax)" direction="rtl">לפני ${LOCK} שנים: מס</text>
    <text x="${lockX + (width - lockX) / 2}" y="13" text-anchor="middle" font-size="13" fill="var(--muted)" direction="rtl">מ-${LOCK} שנים: פטור ממס</text>
    <line x1="${lockX}" x2="${lockX}" y1="2" y2="${base + 4}" stroke="var(--n-500)" stroke-dasharray="3 3"/>
    <line x1="0" x2="${width}" y1="${base}" y2="${base}" stroke="var(--axis)"/>${bars}${ticks}
    <circle cx="${mx}" cy="${base + 13}" r="12" fill="none" stroke="var(--primary)" stroke-width="2"/></svg>`;
}
function strip(el, get, set) {
  const draw = () => { el.innerHTML = stripSvg(el.clientWidth, get().year, get().who); };
  const pick = (ev) => {
    const b = el.getBoundingClientRect();
    set(Math.max(1, Math.min(YEARS, Math.ceil(((ev.clientX - b.left) / b.width) * YEARS))));
  };
  el.addEventListener("pointerdown", (ev) => { el.setPointerCapture(ev.pointerId); pick(ev); });
  el.addEventListener("pointermove", (ev) => { if (ev.buttons) pick(ev); });
  return draw;
}

// ---- drawing A: two towers of coins
function towerGrid() {
  return narrow() ? { cols: 10, rows: 24, cell: Math.floor(((Math.min(window.innerWidth, 640) - 62 - 16) / 2) / 10) } : { cols: 20, rows: 12, cell: 19 };
}
function towerSvg(g, id) {
  const W = g.cols * g.cell, H = g.rows * g.cell + 1, r = g.cell * 0.43;
  let c = "";
  for (let i = 0; i < g.cols * g.rows; i++) {
    const col = i % g.cols, rw = Math.floor(i / g.cols);
    c += `<circle class="coin c-none" data-i="${i}" cx="${(col + 0.5) * g.cell}" cy="${H - 1 - (rw + 0.5) * g.cell}" r="${r}" stroke-width="1"/>`;
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${hatch(id, "var(--tax)", 3.5)}</defs>${c}<line x1="0" x2="${W}" y1="${H - 0.5}" y2="${H - 0.5}" stroke="var(--axis)"/></svg>`;
}
function paintTower(svg, m, hatchId) {
  const kinds = [];
  if (m) {
    const a = Math.round(m.own / COIN), b = Math.round((m.own + m.extra) / COIN), g = Math.round((m.own + m.extra + m.gain) / COIN), t = Math.round(m.tax / COIN);
    for (let i = 0; i < g; i++) kinds.push(i >= g - t ? "tax" : i < a ? "c-own" : i < b ? "c-extra" : "c-gain");
  }
  svg.querySelectorAll("circle").forEach((c, i) => {
    const k = kinds[i] ?? "c-none";
    c.setAttribute("class", `coin ${k === "tax" ? "" : k}`);
    if (k === "tax") { c.style.fill = `url(#${hatchId})`; c.style.stroke = "var(--tax)"; } else { c.style.fill = ""; c.style.stroke = ""; }
  });
}
function towersBlock(el, start, opts = {}) {
  const st = { year: start, who: "employee" };
  const id = `t${++uid}`;
  el.innerHTML = `
    ${opts.fixed ? "" : `<div class="seg"><button data-w="employee">שכירים</button><button data-w="self">עצמאים</button></div>`}
    <h3>מושכים את הכסף אחרי <span class="slot" data-k="yrs"></span></h3>
    <div class="strip"></div>
    <p class="sentence" data-k="line"></p>
    <div class="towers">
      <div class="tower"><div class="stage" data-k="stA"></div><div class="big" data-k="netA"></div><div class="under">נשאר בידיים</div><div class="name">חשבון ניירות ערך</div><div class="sub" data-k="subA"></div></div>
      <div class="tower"><div class="stage" data-k="stF"><div class="gap" data-k="gap">לעצמאים אין עדיין מספר לפני ${LOCK} שנים: משיכה מוקדמת ממוסה כהכנסה מעסק, כולל ההפקדות שנוכו.</div></div><div class="big" data-k="netF"></div><div class="under">נשאר בידיים</div><div class="name">קרן השתלמות</div><div class="sub" data-k="subF"></div></div>
    </div>
    ${opts.fixed ? "" : `<table class="keytable"><colgroup><col style="width:44%"><col style="width:28%"><col style="width:28%"></colgroup>
      <thead><tr><th scope="col">מה יש במגדל</th><th scope="col">חשבון ניירות ערך</th><th scope="col">קרן השתלמות</th></tr></thead>
      <tbody>
        <tr><th scope="row"><span class="dot own"></span>ההפקדות שלכם</th><td data-k="ownA"></td><td data-k="ownF"></td></tr>
        <tr><th scope="row"><span class="dot extra"></span><span data-k="extraName"></span></th><td data-k="extraA"></td><td data-k="extraF"></td></tr>
        <tr><th scope="row"><span class="dot gain"></span>רווח אחרי דמי ניהול</th><td data-k="gainA"></td><td data-k="gainF"></td></tr>
        <tr><th scope="row"><span class="dot tax"></span>מס במשיכה</th><td data-k="taxA"></td><td data-k="taxF"></td></tr>
        <tr class="total"><th scope="row">נשאר בידיים</th><td data-k="netA2"></td><td data-k="netF2"></td></tr>
      </tbody></table>
    <p class="note" data-k="range"></p>`}
    <p class="note">מטבע אחד הוא ${COIN.toLocaleString("en-US")} ₪, בעיגול. מטבע מקווקו הולך למס.</p>`;
  const $ = (k) => el.querySelector(`[data-k="${k}"]`);
  const set = (k, html) => { const n = $(k); if (n) n.innerHTML = html; };
  const stripEl = el.querySelector(".strip");
  const g = towerGrid();
  $("stA").insertAdjacentHTML("afterbegin", towerSvg(g, `${id}a`));
  $("stF").insertAdjacentHTML("afterbegin", towerSvg(g, `${id}f`));
  const drawStrip = strip(stripEl, () => st, (y) => { if (opts.fixed) return; st.year = y; paint(); });
  function paint() {
    const f = fundOf(st.year, st.who), a = acctOf(st.year, st.who), emp = st.who === "employee";
    set("yrs", yrs(st.year));
    drawStrip();
    paintTower($("stA").querySelector("svg"), a, `${id}a`);
    paintTower($("stF").querySelector("svg"), f, `${id}f`);
    $("gap").style.display = f ? "none" : "flex";
    set("subA", emp ? `${fmtN(D.own)} ₪ בחודש מכם` : `${D.selfMonthly} ₪ בחודש מכם`);
    set("subF", emp ? `${fmtN(D.own)} ₪ בחודש מכם, ${fmtN(D.emp)} ₪ מהמעסיק` : `${D.selfMonthly} ₪ בחודש מכם, אחרי החזר המס`);
    set("netA", nis(a.net)); set("netF", f ? nis(f.net) : `<span class="n">אין מספר</span>`);
    set("line", f ? `כל שקל שהפקדתם נהיה ${per(f.net / f.paid)} בקרן <span style="white-space:nowrap">ו-${per(a.net / a.paid)}</span> בחשבון ניירות ערך.` : `כל שקל שהפקדתם נהיה ${per(a.net / a.paid)} בחשבון ניירות ערך.`);
    set("extraName", emp ? "הפקדות המעסיק" : "החזר המס על ההפקדות");
    const v = (x) => (f ? nis(x) : "");
    set("ownA", nis(a.own)); set("ownF", v(f?.own));
    set("extraA", `<span class="n">אין</span>`); set("extraF", v(f?.extra));
    set("gainA", nis(a.gain)); set("gainF", v(f?.gain));
    set("taxA", nis(-a.tax)); set("taxF", f ? nis(-f.tax) : "");
    set("netA2", nis(a.net)); set("netF2", f ? nis(f.net) : "");
    const r = row(st.year);
    const rangeText = (lowF, highF, lowA, highA) => `בקרן, בין ${D.facts.rangeCount} המסלולים שנאספו: ${nis(lowF)} בדמי ניהול של ${D.facts.rangeMax}% עד ${nis(highF)} בדמי ניהול של ${D.facts.rangeMin}%. בחשבון, בין ${D.facts.brokerCount} התעריפים שנאספו: ${nis(lowA)} בתעריף היקר עד ${nis(highA)} בתעריף הזול.`;
    if (emp) set("range", rangeText(r.high, r.low, r.acctWorst, r.acct.net));
    else if (r.self.range?.manager) set("range", rangeText(r.self.broker.net + r.self.range.manager.low, r.self.broker.net + r.self.range.manager.high, r.self.study.net - r.self.range.broker.high, r.self.study.net - r.self.range.broker.low));
    else set("range", "");
    el.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.w === st.who));
  }
  el.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => { st.who = b.dataset.w; paint(); }));
  return paint;
}

// ---- drawing B: stairs in shekels
function stairsBlock(el, start) {
  const st = { year: start, who: "employee" };
  el.innerHTML = `<h3>מושכים את הכסף אחרי <span class="slot" data-k="yrs"></span></h3><div class="strip"></div><div data-k="plot"></div><p class="note">בשקלים. אותם ${fmtN(D.own)} ₪ בחודש מכם בכל העמודות, וכל עמודה משנה דבר אחד.</p>`;
  const stripEl = el.querySelector(".strip"), plot = el.querySelector('[data-k="plot"]');
  const drawStrip = strip(stripEl, () => st, (y) => { st.year = y; paint(); });
  function paint() {
    const r = row(st.year), a = r.acct.net, ownGross = r.own.net + r.own.tax, empGross = r.emp.net + r.emp.tax, tax = r.own.tax + r.emp.tax, end = r.own.net + r.emp.net;
    el.querySelector('[data-k="yrs"]').textContent = yrs(st.year);
    drawStrip();
    const W = plot.clientWidth, compact = W < 520, H = compact ? 300 : 340, top = compact ? 44 : 40, base = H - (compact ? 74 : 62), left = compact ? 44 : 62;
    const y = (v) => base - (v / 240000) * (base - top);
    const cols = [
      { name: compact ? ["בחשבון", "ניירות ערך"] : ["אותו כסף בחשבון", "ניירות ערך"], from: 0, to: a, fill: "var(--own)", label: nis0(a) },
      { name: ["אותו כסף", "עובר לקרן"], from: a, to: ownGross, fill: ownGross >= a ? "var(--up)" : "var(--tax-deep)", label: sign0(ownGross - a) },
      { name: ["הכסף", "של המעסיק"], from: ownGross, to: ownGross + empGross, fill: "var(--employer)", label: sign0(empGross) },
      { name: ["מס", "במשיכה"], from: ownGross + empGross, to: end, fill: "url(#sh)", stroke: "var(--tax)", label: tax > 1 ? sign0(-tax) : "0 ₪" },
      { name: ["נשאר", "בידיים"], from: 0, to: end, fill: "var(--gain)", label: nis0(end), strong: true },
    ];
    const band = (W - left) / cols.length, bw = Math.min(band - (compact ? 10 : 28), 92);
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" dir="ltr"><defs>${hatch("sh", "var(--tax)")}</defs>`;
    for (const t of [0, 50000, 100000, 150000, 200000]) s += `<line x1="${left}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text x="${left - 6}" y="${y(t) + 4}" text-anchor="end" font-size="${compact ? 11 : 13}" fill="var(--muted)">${t.toLocaleString("en-US")}</text>`;
    cols.forEach((c, i) => {
      const cx = left + (i + 0.5) * band, x = cx - bw / 2, hi = Math.max(c.from, c.to), lo = Math.min(c.from, c.to), h = Math.max(y(lo) - y(hi), hi - lo > 1 ? 2 : 0);
      s += `<rect x="${x}" y="${y(hi)}" width="${bw}" height="${h}" rx="3" fill="${c.fill}" ${c.stroke ? `stroke="${c.stroke}"` : ""}/>`;
      if (i < cols.length - 1) s += `<line x1="${x + bw}" x2="${x + band}" y1="${y(c.to)}" y2="${y(c.to)}" stroke="var(--n-500)" stroke-dasharray="3 3"/>`;
      s += `<text x="${cx}" y="${top - 16}" text-anchor="middle" font-size="${compact ? 11 : 15}" font-weight="${c.strong ? 700 : 500}" fill="var(--foreground)" direction="ltr">${compact ? c.label.replace(" ₪", "") : c.label}</text>`;
      c.name.forEach((n, k) => { s += `<text x="${cx}" y="${base + 20 + k * (compact ? 15 : 18)}" text-anchor="middle" font-size="${compact ? 11 : 13}" fill="var(--muted)" direction="rtl">${n}</text>`; });
    });
    plot.innerHTML = s + "</svg>";
  }
  return paint;
}
const nis0 = (n) => `${fmtN(n)} ₪`;
const sign0 = (n) => `${n < 0 ? "−" : "+"}${fmtN(n)} ₪`;

// ---- drawing C: all the years at once, in shekels
function yearsBlock(el, start) {
  const st = { year: start };
  el.innerHTML = `<div class="legend"><span><span class="dot own"></span>ההפקדות שלכם</span><span><span class="dot extra"></span>הפקדות המעסיק</span><span><span class="dot gain"></span>רווח אחרי דמי ניהול</span><span><span class="dot tax"></span>מס במשיכה</span><span>▬ אותם ${fmtN(D.own)} ₪ בחודש בחשבון ניירות ערך, אחרי מס</span></div><div class="strip" data-k="plot"></div><div class="selected" data-k="sel"></div>`;
  const plot = el.querySelector('[data-k="plot"]'), sel = el.querySelector('[data-k="sel"]');
  function paint() {
    const W = plot.clientWidth, compact = W < 520, H = compact ? 320 : 400, top = 44, base = H - 40, left = compact ? 44 : 62;
    const band = (W - left) / YEARS, bw = Math.min(band - (compact ? 3 : 10), 52);
    const y = (v) => base - (v / 240000) * (base - top);
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" dir="ltr"><defs>${hatch("yh", "var(--tax)")}</defs>`;
    for (const t of [0, 50000, 100000, 150000, 200000]) s += `<line x1="${left}" x2="${W}" y1="${y(t)}" y2="${y(t)}" stroke="var(--grid)"/><text x="${left - 6}" y="${y(t) + 4}" text-anchor="end" font-size="${compact ? 11 : 13}" fill="var(--muted)">${t.toLocaleString("en-US")}</text>`;
    const lockX = left + (LOCK - 1) * band;
    let linePts = "";
    for (let i = 1; i <= YEARS; i++) {
      const f = fundOf(i, "employee"), cx = left + (i - 0.5) * band, x = cx - bw / 2, on = i === st.year;
      const gross = f.net + f.tax;
      const seg = (from, to, fill, extra = "") => (to > from ? `<rect x="${x}" y="${y(to)}" width="${bw}" height="${y(from) - y(to)}" fill="${fill}" ${extra}/>` : "");
      // the solid part ends where the tax starts, so the hatched part sits on top of what is left
      const a = Math.min(f.own, f.net), b = Math.min(f.own + f.extra, f.net);
      s += seg(0, a, "var(--own)") + seg(a, b, "var(--employer)") + seg(b, f.net, "var(--gain)");
      if (f.tax > 1) s += seg(f.net, gross, "url(#yh)", 'stroke="var(--tax)"');
      if (on) s += `<rect x="${x - 2}" y="${y(gross) - 2}" width="${bw + 4}" height="${base - y(gross) + 2}" fill="none" stroke="var(--n-50)" stroke-width="1.5" rx="2"/>`;
      s += `<text x="${cx}" y="${base + 18}" text-anchor="middle" font-size="13" fill="${on ? "var(--n-50)" : "var(--muted)"}" font-weight="${on ? 600 : 400}">${i}</text>`;
      linePts += `${linePts ? "L" : "M"}${cx} ${y(row(i).acct.net)}`;
    }
    s += `<path d="${linePts}" fill="none" stroke="var(--n-50)" stroke-width="2"/>`;
    s += `<line x1="${lockX}" x2="${lockX}" y1="${top - 26}" y2="${base}" stroke="var(--n-500)" stroke-dasharray="3 3"/>`;
    const jump = fundOf(LOCK, "employee").net - fundOf(LOCK - 1, "employee").net;
    s += `<text x="${lockX - 8}" y="${top - 12}" text-anchor="start" font-size="${compact ? 12 : 14}" font-weight="600" fill="var(--foreground)" direction="rtl">${compact ? "" : "בשנה הזאת: "}\u2066+${fmtN(jump)} ₪\u2069</text>`;
    s += `<text x="${lockX + 8}" y="${top - 12}" text-anchor="end" font-size="13" fill="var(--muted)" direction="rtl">מ-${LOCK} שנים: פטור ממס</text>`;
    s += `<text x="${(left + W) / 2}" y="${H - 2}" text-anchor="middle" font-size="13" fill="var(--muted)" direction="rtl">שנים עד המשיכה</text>`;
    plot.innerHTML = s + "</svg>";
    const f = fundOf(st.year, "employee");
    sel.innerHTML = `<div>אחרי ${yrs(st.year)}, נשאר בידיים<b>${nis(f.net)}</b></div><div>מתוך זה הפקדתם<b>${nis(f.paid)}</b></div><div>אותו כסף בחשבון ניירות ערך<b>${nis(row(st.year).acct.net)}</b></div>`;
  }
  plot.addEventListener("pointerdown", (ev) => { plot.setPointerCapture(ev.pointerId); pick(ev); });
  plot.addEventListener("pointermove", (ev) => { if (ev.buttons) pick(ev); });
  function pick(ev) {
    const b = plot.getBoundingClientRect(), left = b.width < 520 ? 44 : 62;
    st.year = Math.max(1, Math.min(YEARS, Math.ceil(((ev.clientX - b.left - left) / (b.width - left)) * YEARS)));
    paint();
  }
  return paint;
}

// ---- the page
const f5 = fundOf(LOCK - 1, "employee"), f6 = fundOf(LOCK, "employee"), f4 = fundOf(LOCK - 2, "employee"), f7 = fundOf(LOCK + 1, "employee");
document.querySelector("#find-jump").innerHTML = `+${fmtN(f6.net - f5.net)} ₪`;
document.querySelector("#find-jump-t").innerHTML = `בין משיכה אחרי ${LOCK - 1} שנים למשיכה אחרי ${LOCK}: ${nis(f5.net)} מול ${nis(f6.net)}, כי המס נעלם. שנה קודם הקפיצה היא ${nis(f5.net - f4.net)}, שנה אחר כך ${nis(f7.net - f6.net)}.`;
document.querySelector("#find-own").innerHTML = `+${fmtN(row(10).own.net - row(10).acct.net)} ₪`;
document.querySelector("#find-own-t").innerHTML = `אחרי 10 שנים, אותם ${fmtN(D.own)} ₪ בחודש בקרן מול חשבון ניירות ערך. אחרי ${LOCK - 1} שנים הקרן דווקא ${nis(row(LOCK - 1).acct.net - row(LOCK - 1).own.net)} פחות. זה כל מה שהגרפיקה מראה היום.`;
document.querySelector("#find-emp").innerHTML = `<span class="n">+${fmtN(D.emp)} ₪</span> בחודש`;
document.querySelector("#find-emp-t").innerHTML = `על כל שקל שלכם נכנסים עוד ${D.emp / D.own} שקלים מהמעסיק: <span class="n">${fmtN(D.own)} ₪</span> בחודש הופכים ל-<span class="n">${fmtN(D.own + D.emp)} ₪</span>. הגרפיקה היום משאירה את זה בחוץ.`;
document.querySelector("#assume").innerHTML = `הדוגמה: שכר ברוטו ${fmtN(D.salary)} ₪ בחודש (הדוגמה של האתר). <span class="madeup">⚠ הנחה: אתם ${D.facts.ownPct}% והמעסיק ${D.facts.employerPct}%, עד התקרה בחוק. האחוזים האמיתיים כתובים בהסכם העבודה.</span> תשואה ${D.facts.returnPct}% בשנה, אינפלציה ${D.facts.inflationPct}%, הכול בכסף של היום. הקרן: מסלול ״<bdi>${D.names.trackName}</bdi>״ (<bdi>${D.names.trackNumber}</bdi>), דמי ניהול ${D.facts.trackFee}%. החשבון: קרן ״<bdi>${D.names.fundName}</bdi>״ (<bdi>${D.names.fundNumber}</bdi>) בתעריף של <bdi>${D.names.brokerName}</bdi>, החשבון שמשאיר הכי הרבה מבין ${D.facts.brokerCount} שנאספו. עצמאים: ${D.selfMonthly} ₪ בחודש.`;
const paints = [
  towersBlock(document.querySelector("#opt-a"), +(new URLSearchParams(location.search).get("y") ?? LOCK - 1)),
  towersBlock(document.querySelector("#opt-a2"), LOCK, { fixed: true }),
  stairsBlock(document.querySelector("#opt-b"), LOCK - 1),
  yearsBlock(document.querySelector("#opt-c"), LOCK - 1),
];
const all = () => paints.forEach((p) => p());
all();
window.__ready = true;
