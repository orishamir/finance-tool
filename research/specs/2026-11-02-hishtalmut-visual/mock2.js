// Second round of the study-fund signature (founder, 2026-11-02): no coins and no table to decode the graph. The year strip stays, in colour,
// and the chosen year opens below with its names and numbers written on the marks. A mockup, not site code.
const D = window.__DATA__;
const LOCK = D.facts.lockYears;
const YEARS = D.rows.length;
const row = (y) => D.rows[y - 1];
const fmtN = (n) => Math.round(Math.abs(n)).toLocaleString("en-US");
const nis = (n) => `<span class="n c">${n < 0 && Math.round(Math.abs(n)) > 0 ? "−" : ""}${fmtN(n)} ₪</span>`;
const per = (n) => `<span class="n c">${n.toFixed(2)} ₪</span>`;
const yrs = (y) => (y === 1 ? "שנה אחת" : y === 2 ? "שנתיים" : `${y} שנים`);
const narrow = () => window.innerWidth <= 640;
const VEIL = "oklch(.17 .004 80 / .62)";
const NAMES = { own: "ההפקדות שלכם", employer: "הפקדות המעסיק", relief: "החזר המס על ההפקדות", gain: "רווח אחרי דמי ניהול", tax: "מס במשיכה", left: "נשאר בידיים" };
const FILL = { own: "var(--own)", extra: "var(--employer)", gain: "var(--gain)" };
let uid = 0;

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
const gross = (m) => m.own + m.extra + m.gain;
const maxGross = (who) => Math.max(...D.rows.map((_, i) => { const f = fundOf(i + 1, who); return f ? gross(f) : 0; }));
function hatch(id, gap = 5) {
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${gap}" height="${gap}" patternTransform="rotate(45)"><rect width="${gap}" height="${gap}" fill="${VEIL}"/><line x1="0" y1="0" x2="0" y2="${gap}" stroke="var(--tax)" stroke-width="1.8"/></pattern>`;
}

// ---- the year strip: each year's parts in their own colours, the tax hatched over the part it takes
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
const sentenceOf = (f, a) => (f ? `כל שקל שהפקדתם נהיה ${per(f.net / f.paid)} בקרן <span style="white-space:nowrap">ו-${per(a.net / a.paid)}</span> בחשבון ניירות ערך.` : `כל שקל שהפקדתם נהיה ${per(a.net / a.paid)} בחשבון ניירות ערך.`);
const subOf = (who) => (who === "employee" ? { a: `${fmtN(D.own)} ₪ בחודש מכם`, f: `${fmtN(D.own)} ₪ בחודש מכם, ${fmtN(D.emp)} ₪ מהמעסיק` } : { a: `${D.selfMonthly} ₪ בחודש מכם`, f: `${D.selfMonthly} ₪ בחודש מכם, אחרי החזר המס` });
const ROWS = { employee: { F: [0.11, 0.5, 0.8, 0.95], A: [0.1, 0.25, 0.4] }, self: { F: [0.3, 0.62, 0.8, 0.95], A: [0.3, 0.62, 0.78] } };
const GAP = `לעצמאים אין עדיין מספר לפני ${LOCK} שנים: משיכה מוקדמת ממוסה כהכנסה מעסק, כולל ההפקדות שנוכו.`;

// ---- drawing A: one bar for each way of holding the money, the same bar as in the strip with its names on it
function placeLabels(items, H) {
  // bottom to top, in the order of the bar: each label as near its part as the ones below it allow, then pushed down from the top if needed
  const pos = items.map((it) => it.want);
  items.forEach((it, i) => {
    const floor = i === 0 ? H - it.h / 2 : pos[i - 1] - (items[i - 1].h + it.h) / 2 - 4;
    pos[i] = Math.min(it.want, floor);
  });
  for (let i = items.length - 1; i >= 0; i--) {
    const ceil = i === items.length - 1 ? items[i].h / 2 : pos[i + 1] + (items[i + 1].h + items[i].h) / 2 + 4;
    pos[i] = Math.max(pos[i], ceil);
  }
  return pos;
}
function paintBar(stage, m, scale, who, rows) {
  const W = stage.clientWidth, H = stage.clientHeight, id = `b${++uid}`, barW = narrow() ? 40 : 104, barX = W - barW - 10;
  const y = (v) => H - v * scale;
  const holder = stage.querySelector(".lbls");
  if (!m) { stage.querySelector("svg").innerHTML = `<line x1="0" x2="${W}" y1="${H - 0.5}" y2="${H - 0.5}" stroke="var(--axis)"/>`; holder.innerHTML = ""; return; }
  const g = gross(m), parts = [];
  parts.push({ name: NAMES.own, value: m.own, from: 0, to: m.own, color: "var(--own)" });
  if (m.extra > 0) parts.push({ name: who === "employee" ? NAMES.employer : NAMES.relief, value: m.extra, from: m.own, to: m.own + m.extra, color: "var(--employer)" });
  parts.push({ name: NAMES.gain, value: m.gain, from: m.own + m.extra, to: g, color: "var(--gain)" });
  const tax = { name: NAMES.tax, value: -m.tax, from: g - m.tax, to: g, color: "var(--tax)" };
  const items = [...parts, tax];
  holder.innerHTML = items.map((it) => `<div class="lbl" style="right:${barW + 26}px"><span class="ln">${it.name}</span><span class="lv">${nis(it.value)}</span></div>`).join("");
  const nodes = [...holder.children];
  items.forEach((it, i) => { it.h = nodes[i].offsetHeight; it.want = H * (1 - rows[i]); it.mid = y((it.from + it.to) / 2); });
  const pos = placeLabels(items, H);
  nodes.forEach((n, i) => { n.style.top = `${pos[i] - items[i].h / 2}px`; });
  let s = `<defs>${hatch(id)}</defs>`;
  for (const p of parts) if (p.to > p.from) s += `<rect x="${barX}" y="${y(p.to)}" width="${barW}" height="${Math.max(1, y(p.from) - y(p.to) - 1.5)}" rx="1.5" fill="${p.color}"/>`;
  if (m.tax > 1) s += `<rect x="${barX}" y="${y(g)}" width="${barW}" height="${y(g - m.tax) - y(g)}" fill="url(#${id})" stroke="var(--tax)" stroke-width="1.2"/>`;
  items.forEach((it, i) => { s += `<line x1="${barX - 13}" y1="${pos[i]}" x2="${barX - 2}" y2="${it.mid}" stroke="${it.color}" stroke-width="1.5"/>`; });
  s += `<line x1="${barX - 6}" x2="${W}" y1="${H - 0.5}" y2="${H - 0.5}" stroke="var(--axis)"/>`;
  s += `<path d="M${W - 8} ${y(m.net)}H${W - 2}V${H + 10}" fill="none" stroke="var(--n-50)" stroke-width="1.5"/>`;
  stage.querySelector("svg").innerHTML = s;
}
function barsBlock(el, start, opts = {}) {
  const st = { year: start, who: "employee" };
  const grp = (k, name) => `<div class="grp"><div class="gname">${name}</div><div class="sub" data-k="sub${k}"></div><div class="stage2" data-k="st${k}"><svg width="100%" height="100%"></svg><div class="lbls"></div>${k === "F" ? `<div class="gap2" data-k="gap">${GAP}</div>` : ""}</div><div class="big" data-k="net${k}"></div><div class="under">${NAMES.left}</div></div>`;
  el.innerHTML = `
    ${opts.fixed ? "" : `<div class="seg"><button data-w="employee">שכירים</button><button data-w="self">עצמאים</button></div>`}
    <h3>מושכים את הכסף אחרי <span class="slot" data-k="yrs"></span></h3>
    <div class="strip"></div>
    <p class="sentence" data-k="line"></p>
    <div class="pair">${grp("A", "חשבון ניירות ערך")}${grp("F", "קרן השתלמות")}</div>
    ${opts.fixed ? "" : `<p class="note" data-k="range"></p>`}
    <p class="note">העמודות נמתחות לגובה הציור בכל שנה, באותו קנה מידה לשתיהן. הגדילה משנה לשנה נראית ברצועה.</p>`;
  const $ = (k) => el.querySelector(`[data-k="${k}"]`);
  const set = (k, html) => { const n = $(k); if (n) n.innerHTML = html; };
  const drawStrip = strip(el.querySelector(".strip"), () => st, (y) => { if (opts.fixed) return; st.year = y; paint(); });
  function paint() {
    const f = fundOf(st.year, st.who), a = acctOf(st.year, st.who), H = $("stA").clientHeight;
    const scale = (H - 2) / gross(f ?? a);
    set("yrs", yrs(st.year));
    drawStrip();
    set("line", sentenceOf(f, a));
    const sub = subOf(st.who);
    set("subA", sub.a); set("subF", sub.f);
    paintBar($("stA"), a, f ? scale : scale * 0.6, st.who, ROWS[st.who].A);
    paintBar($("stF"), f, scale, st.who, ROWS[st.who].F);
    $("gap").style.display = f ? "none" : "block";
    set("netA", nis(a.net)); set("netF", f ? nis(f.net) : `<span class="n">אין מספר</span>`);
    const r = row(st.year);
    const rangeText = (lowF, highF, lowA, highA) => `בקרן, בין ${D.facts.rangeCount} המסלולים שנאספו: ${nis(lowF)} בדמי ניהול של ${D.facts.rangeMax}% עד ${nis(highF)} בדמי ניהול של ${D.facts.rangeMin}%. בחשבון, בין ${D.facts.brokerCount} התעריפים שנאספו: ${nis(lowA)} בתעריף היקר עד ${nis(highA)} בתעריף הזול.`;
    if (st.who === "employee") set("range", rangeText(r.high, r.low, r.acctWorst, r.acct.net));
    else if (r.self.range?.manager) set("range", rangeText(r.self.broker.net + r.self.range.manager.low, r.self.broker.net + r.self.range.manager.high, r.self.study.net - r.self.range.broker.high, r.self.study.net - r.self.range.broker.low));
    else set("range", "");
    el.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("on", b.dataset.w === st.who));
  }
  el.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => { st.who = b.dataset.w; paint(); }));
  return paint;
}

// ---- drawing B: the same parts, each in a column of its own
function stepsBlock(el, start) {
  const st = { year: start, who: "employee" };
  el.innerHTML = `<h3>מושכים את הכסף אחרי <span class="slot" data-k="yrs"></span></h3><div class="strip"></div><p class="sentence" data-k="line"></p><div class="steps"><div class="stepg" data-k="A"></div><div class="stepg" data-k="F"></div></div><p class="note">כל מספר יושב על החלק שלו. העמודות נמתחות לגובה הציור בכל שנה, באותו קנה מידה לשתי הדרכים.</p>`;
  const $ = (k) => el.querySelector(`[data-k="${k}"]`);
  const drawStrip = strip(el.querySelector(".strip"), () => st, (y) => { st.year = y; paint(); });
  function group(host, title, m, scale) {
    const W = host.clientWidth, compact = W < 420, H = compact ? 236 : 300, top = 26, base = H - (compact ? 40 : 44), id = `s${++uid}`;
    const y = (v) => base - v * scale;
    const g = gross(m), cols = [
      { name: ["ההפקדות", "שלכם"], from: 0, to: m.own, fill: "var(--own)", label: m.own },
      ...(m.extra > 0 ? [{ name: ["הפקדות", "המעסיק"], from: m.own, to: m.own + m.extra, fill: "var(--employer)", label: m.extra }] : []),
      { name: ["רווח אחרי", "דמי ניהול"], from: m.own + m.extra, to: g, fill: "var(--gain)", label: m.gain },
      { name: ["מס", "במשיכה"], from: g, to: m.net, fill: `url(#${id})`, stroke: "var(--tax)", label: -m.tax },
      { name: [NAMES.left.split(" ")[0], NAMES.left.split(" ")[1]], from: 0, to: m.net, fill: "var(--n-100)", label: m.net, strong: true },
    ];
    const band = W / cols.length, bw = Math.min(band - (compact ? 10 : 18), 74), fs = compact ? 12 : 14;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" dir="ltr"><defs>${hatch(id)}</defs><line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="var(--axis)"/>`;
    cols.forEach((c, i) => {
      const cx = (i + 0.5) * band, x = cx - bw / 2, hi = Math.max(c.from, c.to), lo = Math.min(c.from, c.to), h = hi - lo > 1 ? Math.max(y(lo) - y(hi), 2) : 0;
      if (h) s += `<rect x="${x}" y="${y(hi)}" width="${bw}" height="${h}" rx="2" fill="${c.fill}" ${c.stroke ? `stroke="${c.stroke}"` : ""}/>`;
      if (i < cols.length - 1) s += `<line x1="${x + bw}" x2="${x + band}" y1="${y(c.to)}" y2="${y(c.to)}" stroke="var(--n-500)" stroke-dasharray="3 3"/>`;
      const text = `${c.label < 0 && Math.round(-c.label) > 0 ? "−" : ""}${fmtN(c.label)}${compact ? "" : " ₪"}`;
      s += `<text class="stepn" x="${cx}" y="${y(hi) - 7}" text-anchor="middle" font-size="${fs}" font-weight="${c.strong ? 700 : 500}" fill="var(--foreground)" direction="ltr">${text}</text>`;
      c.name.forEach((n, k) => { s += `<text class="stepl" x="${cx}" y="${base + 16 + k * 15}" text-anchor="middle" font-size="${compact ? 11 : 12.5}" fill="var(--muted)" direction="rtl">${n}</text>`; });
    });
    host.innerHTML = `<div class="gname">${title}</div>${s}</svg>`;
  }
  function paint() {
    const f = fundOf(st.year, st.who), a = acctOf(st.year, st.who);
    $("yrs").textContent = yrs(st.year);
    drawStrip();
    $("line").innerHTML = sentenceOf(f, a);
    const compact = $("F").clientWidth < 420, H = compact ? 236 : 300, room = H - (compact ? 40 : 44) - 26;
    const scale = room / gross(f);
    group($("A"), "חשבון ניירות ערך", a, scale);
    group($("F"), "קרן השתלמות", f, scale);
  }
  return paint;
}

// ---- the page
document.querySelector("#assume").innerHTML = `הדוגמה: שכר ברוטו ${fmtN(D.salary)} ₪ בחודש (הדוגמה של האתר). <span class="madeup">⚠ הנחה: אתם ${D.facts.ownPct}% והמעסיק ${D.facts.employerPct}%, עד התקרה בחוק. האחוזים האמיתיים כתובים בהסכם העבודה.</span> תשואה ${D.facts.returnPct}% בשנה, אינפלציה ${D.facts.inflationPct}%, הכול בכסף של היום. הקרן: מסלול ״<bdi>${D.names.trackName}</bdi>״ (<bdi>${D.names.trackNumber}</bdi>), דמי ניהול ${D.facts.trackFee}%. החשבון: קרן ״<bdi>${D.names.fundName}</bdi>״ (<bdi>${D.names.fundNumber}</bdi>) בתעריף של <bdi>${D.names.brokerName}</bdi>, החשבון שמשאיר הכי הרבה מבין ${D.facts.brokerCount} שנאספו. עצמאים: ${D.selfMonthly} ₪ בחודש.`;
const paints = [
  barsBlock(document.querySelector("#opt-a"), LOCK - 1),
  barsBlock(document.querySelector("#opt-a2"), LOCK, { fixed: true }),
  stepsBlock(document.querySelector("#opt-b"), LOCK - 1),
];
paints.forEach((p) => p());
window.__ready = true;
