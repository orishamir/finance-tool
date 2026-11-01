// The page's behaviour: the fields set the plan and the start, a tap takes a step, and only the active drawing is on screen.
const D = app.D;
const s = app.firstState();
const $ = (id) => document.getElementById(id);
const nf = (x) => x.toLocaleString("en");
const MSG = $("msg").innerHTML;
document.body.classList.add("js");

function width() {
  const on = document.querySelector(".option.on");
  return Math.max(320, on.clientWidth);
}
function paint() {
  const on = document.querySelector(".option.on");
  on.innerHTML = app.render(s, s.opt, panelWidth(on));
}
function panelWidth(on) {
  // the panel's inner width: the drawing is sized to it, so the table under the stairs keeps the chart's columns
  const pad = innerWidth < 720 ? 24 : 48;
  return Math.max(300, on.clientWidth - pad);
}
function syncFields() {
  $("ai-v").textContent = `${nf(D.AMOUNTS[s.ai])} ₪`;
  $("mi-v").textContent = `${nf(D.MONTHLY[s.mi])} ₪`;
  $("yi-v").textContent = `${D.YEARS[s.yi]}`;
  $("ai").value = s.ai; $("mi").value = s.mi; $("yi").value = s.yi;
  const f = app.fieldOptions(s);
  $("acct").innerHTML = f.accts;
  $("fund").innerHTML = f.funds;
}
function say(text) { $("msg").innerHTML = text || MSG; }

function freeze() {
  // while the hand is on a slider a list keeps its order; it sorts again when the hand rests
  const view = app.chainOf(s);
  const rows = app.rowsAt(view.p, view.at).slice().sort((a, b) => (b.d ?? -Infinity) - (a.d ?? -Infinity));
  s.frozen = rows.map((r) => r.key);
}
for (const id of ["ai", "mi", "yi"]) {
  const el = $(id);
  el.addEventListener("pointerdown", freeze);
  el.addEventListener("input", () => {
    if (!s.frozen) freeze();
    s[id] = +el.value;
    say("");
    if (D.AMOUNTS[s.ai] === 0 && D.MONTHLY[s.mi] === 0) {
      const other = id === "ai" ? "mi" : "ai";
      s[other] = 1;
      say("בלי סכום עכשיו ובלי הפקדה חודשית אין מה לחשב, ולכן השדה השני עבר לערך הראשון.");
    }
    // the start may have no price on this plan
    if (app.val(app.planOf(s), s.start) == null) resetStart("");
    syncFields();
    paint();
  });
  el.addEventListener("change", () => { s.frozen = null; paint(); });
}
function resetStart(text) {
  const p = app.planOf(s);
  if (app.val(p, s.start) == null) {
    const sameKind = app.fundsOf(D.funds[s.start.f].kind).filter((f) => app.val(p, { a: s.start.a, f }) != null);
    const any = D.funds.map((_, f) => f).filter((f) => app.val(p, { a: s.start.a, f }) != null);
    const list = sameKind.length ? sameKind : any;
    list.sort((x, y) => app.val(p, { a: s.start.a, f: y }) - app.val(p, { a: s.start.a, f: x }));
    s.start = { a: s.start.a, f: list[0] };
    if (text) say(text);
  }
  s.taken = [];
}
$("acct").addEventListener("change", (e) => {
  s.start = { a: +e.target.value, f: s.start.f };
  say("");
  resetStart("הקרן שנבחרה לא נמכרת בחשבון הזה, ולכן נבחרה הקרן שמשאירה בו הכי הרבה.");
  syncFields();
  paint();
});
$("fund").addEventListener("change", (e) => {
  s.start = { a: s.start.a, f: +e.target.value };
  say("");
  s.taken = [];
  syncFields();
  paint();
});
$("tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-opt]");
  if (!b) return;
  s.opt = +b.dataset.opt;
  document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
  document.querySelectorAll(".option").forEach((x) => x.classList.toggle("on", +x.dataset.o === s.opt));
  paint();
});
$("out").addEventListener("click", (e) => {
  const t = e.target.closest("[data-go],[data-step],[data-reset],[data-jump]");
  if (!t) return;
  if (t.dataset.reset !== undefined) { s.taken = []; paint(); return; }
  if (t.dataset.jump) { const [a, f] = t.dataset.jump.split("|").map(Number); s.start = { a, f }; s.taken = []; syncFields(); paint(); return; }
  if (t.dataset.go !== undefined) {
    const i = +t.dataset.go;
    const view = app.chainOf(s);
    // a stair already taken goes back to it; a stair still ahead takes it and the ones before it
    s.taken = view.chain.slice(1, i + 1).map((c) => ({ lane: c.lane, to: c.pos }));
    paint();
    return;
  }
  const [lane, a, f] = t.dataset.step.split("|");
  s.taken = [...s.taken, { lane, to: { a: +a, f: +f } }];
  paint();
});
let raf = 0;
addEventListener("resize", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); });
syncFields();
paint();
