// Third round of the study-fund signature (founder, 2026-11-02): the money's story step by step, each step showing the whole pile so far.
// No sentence about a shekel. No securities account beside an employee's fund: an employee's comparison is taking the money now or waiting for
// year 6; a self-employed person's is the same money in an account, which is the choice they really have. A mockup, not site code.
const D = window.__DATA__;
const LOCK = D.facts.lockYears;
const YEARS = D.rows.length;
const row = (y) => D.rows[y - 1];
const fmtN = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");
const signTxt = (n, plus) => `${Math.round(n) < 0 ? "−" : plus && Math.round(n) > 0 ? "+" : ""}${fmtN(n)} ₪`;
const nis = (n, plus) => `<span class="n c">${signTxt(n, plus)}</span>`;
const yrs = (y) => (y === 1 ? "שנה אחת" : y === 2 ? "שנתיים" : `${y} שנים`);
const narrow = () => window.innerWidth <= 640;
const VEIL = "oklch(.17 .004 80 / .62)";
const FILL = { own: "var(--own)", extra: "var(--employer)", gain: "var(--gain)" };
const DIM = 0.36;
let uid = 0;

function fundOf(y, who) {
  const r = row(y);
  if (who === "employee") {
    const net = r.own.net + r.emp.net, tax = r.own.tax + r.emp.tax;
    return { own: r.own.paid, extra: r.emp.paid, gain: net + tax - r.own.paid - r.emp.paid, tax, net };
  }
  const s = r.self.study;
  if (!s) return null;
  return { own: s.paid, extra: r.self.relief, gain: s.net + s.tax - s.paid - r.self.relief, tax: s.tax, net: s.net };
}
const gross = (m) => m.own + m.extra + m.gain;
const maxGross = (who) => Math.max(...D.rows.map((_, i) => { const f = fundOf(i + 1, who); return f ? gross(f) : 0; }));
function hatch(id, gap = 5) {
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${gap}" height="${gap}" patternTransform="rotate(45)"><rect width="${gap}" height="${gap}" fill="${VEIL}"/><line x1="0" y1="0" x2="0" y2="${gap}" stroke="var(--tax)" stroke-width="1.8"/></pattern>`;
}

// ---- the year strip, as in the second round
function stripSvg(width, year, who) {
  const id = `h${++uid}`;
  const H = 156, top = 24, base = H - 28, band = width / YEARS, barW = Math.min(band - 4, 40), max = maxGross(who);
  const y = (v) => base - (v / max) * (base - top);
  let bars = "";
  for (let i = 1; i <= YEARS; i++) {
    const f = fundOf(i, who), x = (i - 0.5) * band - barW / 2, on = i === year;
    if (!f) { bars += `<rect x="${x}" y="${base - 8}" width="${barW}" height="8" fill="none" stroke="var(--n-600)" stroke-dasharray="2 2"/>`; continue; }
    const seg = (from, to, fill) => (to - from > 0 ? `<rect x="${x}" y="${y(to)}" width="${barW}" height="${Math.max(0.5, y(from) - y(to) - 1)}" fill="${fill}"/>` : "");
    const g = gross(f);
    bars += `<g opacity="${on ? 1 : 0.86}">${seg(0, f.own, FILL.own)}${seg(f.own, f.own + f.extra, FILL.extra)}${seg(f.own + f.extra, g, FILL.gain)}`;
    if (f.tax > 1) bars += `<rect x="${x}" y="${y(g)}" width="${barW}" height="${y(g - f.tax) - y(g)}" fill="url(#${id})" stroke="var(--tax)" stroke-width="1"/>`;
    bars += `</g>`;
    if (on) bars += `<rect x="${x - 2.5}" y="${y(g) - 2.5}" width="${barW + 5}" height="${base - y(g) + 2.5}" fill="none" stroke="var(--n-50)" stroke-width="1.5" rx="2"/>`;
  }
  const lockX = (LOCK - 1) * band, mx = (year - 0.5) * band;
  const ticks = Array.from({ length: YEARS }, (_, k) => k + 1).map((t) => `<text x="${(t - 0.5) * band}" y="${base + 18}" text-anchor="middle" font-size="13" fill="${t === year ? "var(--n-50)" : "var(--muted)"}" font-weight="${t === year ? 600 : 400}">${t}</text>`).join("");
  return `<svg width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" dir="ltr"><defs>${hatch(id, 4)}</defs>
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

// ---- the story: what each step adds or takes, and the comparison that is a real choice for this person
function story(y, who) {
  const m = fundOf(y, who);
  const emp = who === "employee", a = emp ? null : row(y).self.broker;
  const steps = m && [
    { key: "own", name: ["הפקדתם"], line: "הפקדתם", num: m.own, plus: false, dim: [], bright: [["own", 0, m.own]], top: m.own },
    { key: "extra", name: emp ? ["המעסיק", "הוסיף"] : ["החזר המס", "הוסיף"], line: emp ? "המעסיק הוסיף" : "החזר המס הוסיף", num: m.extra, plus: true, dim: [["own", 0, m.own]], bright: [["extra", m.own, m.own + m.extra]], top: m.own + m.extra },
    { key: "gain", name: ["התשואה", "הוסיפה"], fine: "אחרי דמי ניהול", line: "התשואה הוסיפה, אחרי דמי ניהול", num: m.gain, plus: true, dim: [["own", 0, m.own], ["extra", m.own, m.own + m.extra]], bright: [["gain", m.own + m.extra, gross(m)]], top: gross(m) },
    { key: "tax", name: ["המס", "לקח"], line: "המס לקח", num: -m.tax, plus: false, dim: [["own", 0, m.own], ["extra", m.own, m.own + m.extra], ["gain", m.own + m.extra, gross(m)]], tax: [gross(m) - m.tax, gross(m)], top: m.net },
    { key: "left", name: ["נשאר", "בידיים"], line: "נשאר בידיים", num: m.net, plus: false, white: [0, m.net], top: m.net, strong: true },
  ];
  let other = null;
  if (emp && y < LOCK) other = { name: [`אם מחכים`, `לשנה ${LOCK}`], fine: "בלי להפקיד עוד", line: `אם מחכים לשנה ${LOCK}, בלי להפקיד עוד`, num: row(y).wait, to: row(y).wait };
  else if (emp) other = { name: ["אין על מה", "לחכות"], fine: `המס כבר ${fmtN(0)} ₪`, line: "אין על מה לחכות: המס כבר 0 ₪", num: null, to: 0 };
  else other = { name: ["אותו כסף", "בחשבון"], fine: "ניירות ערך", line: "אותו כסף בחשבון ניירות ערך", num: a.net, to: a.net };
  return { m, steps, other };
}
const subOf = (who) => (who === "employee" ? `קרן השתלמות במסלול מדד. ${fmtN(D.own)} ₪ בחודש מכם, ${fmtN(D.emp)} ₪ מהמעסיק.` : `קרן השתלמות במסלול מדד. ${D.selfMonthly} ₪ בחודש מכם, אחרי החזר המס.`);
const GAP = `לעצמאים אין עדיין מספר לפני ${LOCK} שנים: משיכה מוקדמת ממוסה כהכנסה מעסק, כולל ההפקדות שנוכו.`;
function notesOf(y, who) {
  const r = row(y);
  let fair = "";
  if (who === "employee" && y < LOCK) fair = `אם מושכים עכשיו ושמים את הכסף בחשבון ניירות ערך עד שנה ${LOCK}: ${nis(r.reinvest)}, כלומר ${nis(r.wait - r.reinvest)} פחות מאשר לחכות.`;
  let range = "";
  if (who === "employee") range = `בין ${D.facts.rangeCount} המסלולים שנאספו, בלי לשנות דבר אחר: ${nis(r.high)} בדמי ניהול של ${D.facts.rangeMax}% עד ${nis(r.low)} בדמי ניהול של ${D.facts.rangeMin}%.`;
  else if (r.self.range?.manager) range = `בין ${D.facts.rangeCount} המסלולים שנאספו: ${nis(r.self.broker.net + r.self.range.manager.low)} עד ${nis(r.self.broker.net + r.self.range.manager.high)}. בחשבון, בין ${D.facts.brokerCount} התעריפים שנאספו: ${nis(r.self.study.net - r.self.range.broker.high)} עד ${nis(r.self.study.net - r.self.range.broker.low)}.`;
  return { fair, range };
}
function shell(el, opts, plotClass) {
  el.innerHTML = `
    ${opts.fixed ? "" : `<div class="seg"><button data-w="employee">שכירים</button><button data-w="self">עצמאים</button></div>`}
    <h3>מושכים את הכסף אחרי <span class="slot" data-k="yrs"></span></h3>
    <div class="strip"></div>
    <p class="hsub" data-k="sub"></p>
    <div class="${plotClass}" data-k="plot"></div>
    <p class="note fair" data-k="fair"></p>
    ${opts.fixed ? "" : `<p class="note range" data-k="range"></p>`}
    <p class="note">הגובה נמתח בכל שנה, והגדילה משנה לשנה נראית ברצועה.</p>`;
}
function wire(el, st, opts, draw) {
  const $ = (k) => el.querySelector(`[data-k="${k}"]`);
  const drawStrip = strip(el.querySelector(".strip"), () => st, (y) => { if (opts.fixed) return; st.year = y; paint(); });
  function paint() {
    $("yrs").textContent = yrs(st.year);
    drawStrip();
    $("sub").textContent = subOf(st.who);
    draw($("plot"), st);
    const n = notesOf(st.year, st.who);
    $("fair").innerHTML = n.fair;
    if ($("range")) $("range").innerHTML = n.range;
    el.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.w === st.who));
  }
  el.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => { st.who = b.dataset.w; paint(); }));
  return paint;
}

// ---- drawing A: the pile grows column by column; what was just added is bright, what was there already is dimmed
function pileBlock(el, start, opts = {}) {
  const st = { year: start, who: "employee" };
  shell(el, opts, "pile");
  const OWN_ROW = { employee: 0.3, self: 0.78 };
  return wire(el, st, opts, (plot, s) => {
    const W = plot.clientWidth, compact = W < 520, id = `p${++uid}`;
    const H = compact ? 366 : 400, top = compact ? 46 : 30, nameH = compact ? 78 : 58, base = H - nameH, room = base - top;
    const { m, steps, other } = story(s.year, s.who);
    const n = 6, gapSlot = compact ? 6 : 16, band = (W - gapSlot) / n, bw = Math.min(band - (compact ? 7 : 22), 96), fs = compact ? 12 : 15;
    const biggest = Math.max(m ? gross(m) : 0, other.to || 0) || 1;
    const scale = (room / biggest) * (m ? 1 : 0.6);
    const y = (v) => base - v * scale;
    const cx = (i) => (i < 5 ? (i + 0.5) * band : 5 * band + gapSlot + 0.5 * band);
    let t = `<defs>${hatch(id)}</defs><line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--axis)"/>`;
    const label = (i, txt, yy, strong) => `<text class="st-n" x="${cx(i)}" y="${yy}" text-anchor="middle" font-size="${fs}" font-weight="${strong ? 700 : 600}" fill="var(--foreground)" direction="ltr">${compact ? txt.replace(" ₪", "") : txt}</text>`;
    const names = (i, lines, fine) => {
      let o = "";
      lines.forEach((l, k) => { o += `<text class="st-l" x="${cx(i)}" y="${base + 17 + k * 16}" text-anchor="middle" font-size="${compact ? 12 : 14}" fill="var(--foreground)" direction="rtl">${l}</text>`; });
      if (fine) (compact && fine.length > 10 ? [fine.split(" ").slice(0, 2).join(" "), fine.split(" ").slice(2).join(" ")] : [fine]).forEach((l, k) => { o += `<text class="st-l" x="${cx(i)}" y="${base + 17 + lines.length * 16 + k * 13}" text-anchor="middle" font-size="${compact ? 10.5 : 12}" fill="var(--muted)" direction="rtl">${l}</text>`; });
      return o;
    };
    if (m) {
      steps.forEach((c, i) => {
        const x = cx(i) - bw / 2;
        const seg = (k, from, to, op) => (to - from > 0 ? `<rect x="${x}" y="${y(to)}" width="${bw}" height="${Math.max(1, y(from) - y(to) - 1.5)}" rx="1.5" fill="${FILL[k]}" opacity="${op}"/>` : "");
        for (const [k, f, to] of c.dim ?? []) t += seg(k, f, to, DIM);
        for (const [k, f, to] of c.bright ?? []) t += seg(k, f, to, 1);
        if (c.tax && c.tax[1] - c.tax[0] > 1) t += `<rect x="${x}" y="${y(c.tax[1])}" width="${bw}" height="${y(c.tax[0]) - y(c.tax[1])}" fill="url(#${id})" stroke="var(--tax)" stroke-width="1.2"/>`;
        if (c.white) t += `<rect x="${x}" y="${y(c.white[1])}" width="${bw}" height="${y(c.white[0]) - y(c.white[1])}" rx="2" fill="var(--n-100)"/>`;
        if (i < 4) t += `<line x1="${x + bw}" x2="${cx(i + 1) - bw / 2}" y1="${y(c.top)}" y2="${y(c.top)}" stroke="var(--n-400)" stroke-dasharray="3 3"/>`;
        t += label(i, signTxt(c.num, c.plus), i === 0 ? base - OWN_ROW[s.who] * room - 8 : top - 8 - (compact && i % 2 === 0 ? 16 : 0), c.strong);
        t += names(i, c.name, c.fine);
      });
    } else {
      t += `<foreignObject x="0" y="${top}" width="${5 * band - 8}" height="${room}"><div xmlns="http://www.w3.org/1999/xhtml" class="gap3">${GAP}</div></foreignObject>`;
    }
    const sx = 5 * band + gapSlot / 2;
    t += `<line x1="${sx}" x2="${sx}" y1="${top - 22}" y2="${H - 4}" stroke="var(--n-600)" stroke-dasharray="1.5 3"/>`;
    if (other.to > 0) t += `<rect x="${cx(5) - bw / 2}" y="${y(other.to)}" width="${bw}" height="${base - y(other.to)}" rx="2" fill="oklch(.955 .005 80 / .07)" stroke="var(--n-100)" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    if (other.num !== null) t += label(5, signTxt(other.num), top - 8, true);
    t += names(5, other.name, other.fine);
    plot.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" dir="ltr">${t}</svg>`;
  });
}

// ---- drawing B: the same story in rows, with the sentence beside each row
function rowsBlock(el, start, opts = {}) {
  const st = { year: start, who: "employee" };
  shell(el, opts, "rows");
  return wire(el, st, opts, (plot, s) => {
    const textW = narrow() ? 118 : 220, gap = 12, W = plot.clientWidth - textW - gap, rowH = narrow() ? 68 : 56, barH = 26, id = `r${++uid}`;
    const { m, steps, other } = story(s.year, s.who);
    const list = m ? [...steps, other] : [other];
    const biggest = Math.max(m ? gross(m) : 0, other.to || 0) || 1;
    const x = (v) => v * ((W - 4) / biggest);
    const H = rowH * 6;
    const yOf = (i) => (m ? i : 5) * rowH + (rowH - barH) / 2;
    let t = `<defs>${hatch(id)}</defs><line x1="0.5" x2="0.5" y1="0" y2="${H}" stroke="var(--axis)"/>`;
    if (m) steps.forEach((c, i) => {
      const yy = yOf(i);
      const seg = (k, f, to, op) => (to - f > 0 ? `<rect x="${x(f)}" y="${yy}" width="${Math.max(1, x(to) - x(f) - 1.5)}" height="${barH}" rx="1.5" fill="${FILL[k]}" opacity="${op}"/>` : "");
      for (const [k, f, to] of c.dim ?? []) t += seg(k, f, to, DIM);
      for (const [k, f, to] of c.bright ?? []) t += seg(k, f, to, 1);
      if (c.tax && c.tax[1] - c.tax[0] > 1) t += `<rect x="${x(c.tax[0])}" y="${yy}" width="${x(c.tax[1]) - x(c.tax[0])}" height="${barH}" fill="url(#${id})" stroke="var(--tax)" stroke-width="1.2"/>`;
      if (c.white) t += `<rect x="0" y="${yy}" width="${x(c.white[1])}" height="${barH}" rx="2" fill="var(--n-100)"/>`;
      if (i < 4) t += `<line x1="${x(c.top)}" x2="${x(c.top)}" y1="${yy + barH}" y2="${yOf(i + 1)}" stroke="var(--n-400)" stroke-dasharray="3 3"/>`;
    });
    if (other.to > 0) t += `<rect x="0.5" y="${yOf(5)}" width="${x(other.to)}" height="${barH}" rx="2" fill="oklch(.955 .005 80 / .07)" stroke="var(--n-100)" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    const texts = (m ? list : [null, null, null, null, null, other]).map((c) => (c ? `<div class="rt${c.strong ? " strong" : ""}" style="height:${rowH}px"><span class="ln">${c.line}</span><span class="lv">${c.num === null ? "" : nis(c.num, c.plus)}</span></div>` : `<div class="rt" style="height:${rowH}px"></div>`)).join("");
    plot.innerHTML = `<div class="rtexts" style="width:${textW}px">${texts}</div><div class="rplot" style="width:${W}px"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" dir="ltr">${t}</svg>${m ? "" : `<div class="gap4">${GAP}</div>`}</div>`;
  });
}

// ---- the page
document.querySelector("#assume").innerHTML = `הדוגמה: שכר ברוטו ${fmtN(D.salary)} ₪ בחודש (הדוגמה של האתר). <span class="madeup">⚠ הנחה: אתם ${D.facts.ownPct}% והמעסיק ${D.facts.employerPct}%, עד התקרה בחוק. האחוזים האמיתיים כתובים בהסכם העבודה.</span> תשואה ${D.facts.returnPct}% בשנה, אינפלציה ${D.facts.inflationPct}%, הכול בכסף של היום. הקרן: מסלול ״<bdi>${D.names.trackName}</bdi>״ (<bdi>${D.names.trackNumber}</bdi>), דמי ניהול ${D.facts.trackFee}%. החשבון, איפה שמופיע: קרן ״<bdi>${D.names.fundName}</bdi>״ (<bdi>${D.names.fundNumber}</bdi>) בתעריף של <bdi>${D.names.brokerName}</bdi>, החשבון שמשאיר הכי הרבה מבין ${D.facts.brokerCount} שנאספו. עצמאים: ${D.selfMonthly} ₪ בחודש.`;
const paints = [
  pileBlock(document.querySelector("#opt-a"), LOCK - 1),
  pileBlock(document.querySelector("#opt-a2"), LOCK, { fixed: true }),
  rowsBlock(document.querySelector("#opt-b"), LOCK - 1),
];
paints.forEach((p) => p());
window.__ready = true;
