// The sketch for issue 15: the real built brokerage guide page, cut down to three of its sections, in today's form and three proposals.
// Run after `npm run build -w site`, with the build served at http://127.0.0.1:4173/finance-tool (see the preview note in the repo's memory):
//   node gen.mjs [phone-today.jpg phone-b.jpg]
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, "../../..");
const assets = path.join(root, "site/build/client/assets");
const [phoneToday, phoneB] = process.argv.slice(2);
const uri = (f) => (f && fs.existsSync(f) ? `data:image/jpeg;base64,${fs.readFileSync(f).toString("base64")}` : "");

const rules = {};
for (const f of fs.readdirSync(path.join(root, "data/rules"))) {
  const r = JSON.parse(fs.readFileSync(path.join(root, "data/rules", f)));
  if (r.id) rules[r.id] = r;
}

const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto("http://127.0.0.1:4173/finance-tool/guide/brokerage-account", { waitUntil: "networkidle" });

// each proposal is built from the same real sections, in the browser, so every word and class on it is the page's own
const built = await p.evaluate(() => {
  const IDS = ["inout", "cost", "tax"];
  const fresh = () => IDS.map((id) => document.getElementById(id).cloneNode(true));
  const idsOf = (el) => [...new Set([...el.querySelectorAll("button")].map((x) => /[A-Z]+-\d+/.exec(x.getAttribute("aria-label") || x.textContent)?.[0]).filter(Boolean))];
  const toggleOf = (s) => [...s.querySelectorAll("button")].find((x) => x.textContent.includes("החוקים והכללים"));
  const inert = (s) => s.querySelectorAll("button:not([data-m]), a").forEach((x) => x.setAttribute("tabindex", "-1"));
  const blockName = (line, s) => {
    const row = line.closest("tr");
    if (row) return row.querySelector("th")?.textContent.trim();
    const holder = line.parentElement;
    const head = holder.querySelector("h3, .text-xl.font-semibold, .font-medium");
    return (head && head !== line && head.textContent.trim()) || s.querySelector("h2").textContent.trim();
  };
  const collected = new Set();
  const link = (ids, name, short) => {
    ids.forEach((i) => collected.add(i));
    const a = document.createElement("button");
    a.type = "button";
    a.className = "rule-chip m-open";
    a.dataset.m = "open";
    a.dataset.ids = ids.join(",");
    a.dataset.name = name;
    a.innerHTML = short ? `<bdi>${ids.length}</bdi>` : `חוקים וכללים<span aria-hidden="true" class="mx-1 text-muted-foreground">·</span><bdi>${ids.length}</bdi>`;
    return a;
  };
  const tableCell = (s) => [...s.querySelectorAll("tbody td:last-child")].filter((td) => td.closest("table") && td.parentElement.children.length === 4);

  const today = fresh().map((s) => {
    const t = toggleOf(s);
    if (t) t.dataset.m = "today";
    s.querySelectorAll("button").forEach((x) => { if (!x.dataset.m) x.classList.add("m-inert"); });
    return s.outerHTML;
  });

  const a = fresh().map((s) => {
    toggleOf(s)?.remove();
    s.querySelectorAll("table").forEach((t) => t.classList.add("m-a-table"));
    return s.outerHTML;
  });

  const bb = fresh().map((s) => {
    toggleOf(s)?.remove();
    s.querySelectorAll(".rules-line").forEach((line) => {
      const ids = idsOf(line);
      const pp = document.createElement("p");
      pp.className = "m-line " + (line.className.includes("mt-auto") ? "mt-auto" : "");
      pp.append(link(ids, blockName(line, s)));
      line.replaceWith(pp);
    });
    tableCell(s).forEach((td) => {
      const ids = idsOf(td);
      const name = td.parentElement.querySelector("th")?.textContent.trim();
      td.replaceChildren(ids.length ? link(ids, name, true) : "");
    });
    s.querySelectorAll("colgroup, table > col").length;
    s.querySelectorAll("table").forEach((t) => {
      const cols = t.querySelectorAll("col");
      ["20%", "36%", "30%", "14%"].forEach((w, i) => { if (cols[i]) cols[i].style.width = w; });
    });
    return s.outerHTML;
  });

  const c = fresh().map((s) => {
    toggleOf(s)?.remove();
    const all = [...new Set([...s.querySelectorAll(".rules-line")].flatMap(idsOf).concat(tableCell(s).flatMap(idsOf)))];
    all.forEach((i) => collected.add(i));
    s.querySelectorAll(".rules-line").forEach((l) => l.remove());
    s.querySelectorAll("table").forEach((t) => {
      t.querySelectorAll("tr").forEach((tr) => tr.lastElementChild?.remove());
      const cols = t.querySelectorAll("col");
      cols[3]?.remove();
      ["24%", "42%", "34%"].forEach((w, i) => { if (cols[i]) cols[i].style.width = w; });
    });
    if (all.length) {
      const d = document.createElement("div");
      d.className = "m-foot";
      d.dataset.ids = all.join(",");
      s.append(d);
    }
    return s.outerHTML;
  });
  return { today, a, b: bb, c, ids: [...collected] };
});
await b.close();

const fontFiles = fs.readdirSync(assets);
let css = fs.readdirSync(assets).filter((f) => f.endsWith(".css")).map((f) => fs.readFileSync(path.join(assets, f), "utf8")).join("\n");
// the site's fonts travel with the file, so the sketch opens with its real type anywhere
css = css.replace(/url\(([^)]+\.woff2)\)/g, (m, u) => {
  const name = path.basename(u.replace(/["']/g, ""));
  return fontFiles.includes(name) ? `url(data:font/woff2;base64,${fs.readFileSync(path.join(assets, name)).toString("base64")})` : m;
});

const data = {};
for (const id of built.ids) {
  const r = rules[id];
  if (!r) continue;
  const s = (r.sources ?? [])[0];
  data[id] = { t: r.title_he, x: r.text_he, scope: r.scope, src: s ? { title: s.title, url: s.url, publisher: s.publisher } : null };
}
const nonGeneral = built.ids.filter((i) => rules[i] && rules[i].scope !== "general");
console.log("rules", built.ids.length, "not general:", nonGeneral.join(" ") || "none");

const sections = (list) => list.join("\n");
const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>חוקים וכללים בעמודי המדריך</title>
<style>${css}</style>
<style>
body{background:var(--background);color:var(--foreground)}
.m-wrap{width:min(900px,100%);margin-inline:auto;padding:24px 16px 96px;display:flex;flex-direction:column;gap:24px}
.m-h1{font-size:24px;font-weight:600}
.m-lead{font-size:16px;line-height:1.7;max-width:44rem}
.m-facts{width:100%;border-collapse:collapse;table-layout:fixed;font-size:14px}
.m-facts th,.m-facts td{border-bottom:1px solid var(--border);padding:8px;text-align:start;vertical-align:top}
.m-facts thead th{color:var(--muted-foreground);font-weight:500}
.m-facts td{font-variant-numeric:tabular-nums}
.m-tabs{position:sticky;top:0;z-index:30;display:flex;gap:8px;overflow-x:auto;background:var(--background);padding-block:8px;border-bottom:1px solid var(--border)}
.m-tab{min-height:44px;padding:0 14px;border:1px solid var(--border);border-radius:999px;background:var(--card);white-space:nowrap;font-size:14px;cursor:pointer;color:var(--foreground)}
.m-tab[aria-selected=true]{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary);font-weight:600}
.m-pane{display:none;flex-direction:column;gap:32px}
.m-pane.on{display:flex}
.m-say{border-inline-start:3px solid var(--primary);padding-inline-start:12px;font-size:16px;line-height:1.7;max-width:44rem}
.m-say b{font-weight:600}
.m-note{font-size:14px;color:var(--caution-foreground);border:1px dashed var(--caution-foreground);border-radius:8px;padding:6px 10px;align-self:flex-start}
.m-inert{cursor:default}
section .rules-line{}
.m-pane[data-p=today] section.m-open-lines .rules-line{display:flex!important}
.m-pane[data-p=a].m-show .rules-line{display:flex!important}
.m-pane[data-p=a]:not(.m-show) .m-a-table col:nth-child(4),.m-pane[data-p=a]:not(.m-show) .m-a-table th:nth-child(4),.m-pane[data-p=a]:not(.m-show) .m-a-table td:nth-child(4){display:none}
.m-switch{position:sticky;top:61px;z-index:20;align-self:flex-start;min-height:44px;padding:0 14px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--link);font-size:14px;cursor:pointer}
.m-line{display:flex;margin-top:4px}
.m-open{cursor:pointer}
.m-open::after{inset:-11px -4px}
.m-foot{margin-top:16px;border-top:1px solid var(--border)}
.m-foot summary{min-height:44px;display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--link);font-size:14px;list-style:none}
.m-foot summary::-webkit-details-marker{display:none}
.m-foot summary::after{content:"⌄";margin-inline-start:4px}
.m-foot details[open] summary::after{content:"⌃"}
.m-row{display:flex;gap:8px;width:100%;min-height:44px;align-items:center;text-align:start;padding:8px 4px;border:0;border-top:1px solid var(--border);background:none;color:var(--foreground);font-size:14px;line-height:1.5;cursor:pointer}
.m-row:hover{background:var(--card)}
.m-row .id{color:var(--link);font-size:12px;flex:none;width:58px;font-variant-numeric:tabular-nums slashed-zero}
.m-row .tx{flex:1;min-width:0}
.m-row .go{flex:none;color:var(--muted-foreground)}
.m-scrim{position:fixed;inset:0;background:rgb(0 0 0 / .45);z-index:60;display:none}
.m-scrim.on{display:block}
.m-sheet{position:fixed;z-index:70;display:none;flex-direction:column;background:var(--popover);border:1px solid var(--border);box-shadow:0 16px 48px rgb(0 0 0 / .5);overflow:hidden;
  inset-block-start:10vh;inset-inline-start:50%;transform:translateX(50%);width:440px;max-height:80vh;border-radius:12px}
.m-sheet.on{display:flex}
.m-sheet-head{display:flex;align-items:flex-start;gap:8px;padding:16px 16px 8px}
.m-sheet-head h2{flex:1;font-size:18px;font-weight:600;line-height:1.4}
.m-sheet-sub{padding:0 16px 8px;font-size:14px;color:var(--muted-foreground)}
.m-sheet-body{overflow-y:auto;padding:0 16px 16px;font-size:14px;line-height:1.7;display:flex;flex-direction:column;gap:12px}
.m-x,.m-back{min-width:44px;min-height:44px;border:0;background:none;color:var(--muted-foreground);cursor:pointer;font-size:14px}
.m-back{color:var(--link);text-align:start;padding-inline-start:0;align-self:flex-start;min-width:0}
@media (max-width:640px){.m-sheet{inset:auto 0 0 0;transform:none;width:100%;max-height:85vh;border-radius:12px 12px 0 0}.m-switch{top:61px}}
.m-phones{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.m-phones figure{display:flex;flex-direction:column;gap:8px;font-size:14px;color:var(--muted-foreground)}
.m-phones img{width:100%;max-width:320px;border:1px solid var(--border);border-radius:12px}
</style></head>
<body><div class="m-wrap">
  <h1 class="m-h1">איך להציג חוקים וכללים בעמודי המדריך</h1>
  <p class="m-lead">הכפתור "הצגת החוקים והכללים" מופיע ליד כל כותרת סעיף. כאן שלוש הצעות במקומו, על הסעיפים האמיתיים של עמוד חשבון ניירות ערך. הכול לחיץ: כל הטקסטים והחוקים והכללים הם של האתר, רק הסידור שונה.</p>
  <table class="m-facts"><thead><tr><th scope="col">נמדד על כל עמודי המדריך, במחשב</th><th scope="col" style="width:30%">התוצאה</th></tr></thead><tbody>
    <tr><th scope="row" style="font-weight:400">כפתורים כאלה באתר</th><td><bdi>130</bdi> ב־<bdi>18</bdi> עמודים</td></tr>
    <tr><th scope="row" style="font-weight:400">כפתורים שלחיצה עליהם לא משנה כלום</th><td><bdi>23</bdi></td></tr>
    <tr><th scope="row" style="font-weight:400">מתוכם: אין בסעיף שום חוק או כלל</th><td><bdi>11</bdi></td></tr>
    <tr><th scope="row" style="font-weight:400">מתוכם: "כמה זה עולה", שבו הטבלה מציגה את החוקים והכללים תמיד</th><td><bdi>12</bdi></td></tr>
    <tr><th scope="row" style="font-weight:400">הכי הרבה בבלוק אחד</th><td><bdi>25</bdi> מספרים בלי שם</td></tr>
  </tbody></table>
  <div class="m-tabs" role="tablist">
    <button class="m-tab" role="tab" data-t="today">היום</button>
    <button class="m-tab" role="tab" data-t="a">א. מתג אחד לעמוד</button>
    <button class="m-tab" role="tab" data-t="b">ב. קישור לכל עובדה (מומלץ)</button>
    <button class="m-tab" role="tab" data-t="c">ג. רשימה בסוף כל סעיף</button>
  </div>

  <div class="m-pane" data-p="today">
    <p class="m-say"><b>מה רואים היום.</b> נסו את הכפתור בכל סעיף: ב"כסף נכנס ויוצא" וב"כמה זה עולה" לא קורה כלום, וב"מיסוי" נפתח קיר של מספרים שלא אומרים מה כתוב בהם.</p>
    ${sections(built.today)}
  </div>

  <div class="m-pane" data-p="a">
    <p class="m-say"><b>מתג אחד לכל העמוד, במקום כפתור ליד כל כותרת.</b> נעלמים הכפתורים שלא עושים כלום, וגם עמודת המספרים בטבלה מצייתת למתג. אבל כשפותחים אותו, אותו קיר של מספרים נשאר: עדיין אי אפשר לדעת מה כל אחד אומר בלי ללחוץ עליו.</p>
    <button class="m-switch" data-m="switch">הצגת החוקים והכללים</button>
    ${sections(built.a)}
  </div>

  <div class="m-pane" data-p="b">
    <p class="m-say"><b>בלי מצב מוסתר: בסוף כל עובדה קישור אחד עם מספר.</b> הקישור פותח רשימה של השמות המלאים, ומשם כל אחד נפתח בכרטיס שלו, עם המקור. אין חוקים וכללים? אין קישור, ולכן כפתור מת לא יכול להיווצר. העמוד לא זז בלחיצה, והטבלה מקבלת בחזרה את המקום. המחיר: שורה קטנה אחת בכל בלוק, ורשימה ארוכה כשיש <bdi>25</bdi>.</p>
    ${sections(built.b)}
    <div class="m-phones">
      ${phoneToday ? `<figure><img alt="" src="${uri(phoneToday)}"><figcaption>בטלפון, היום, אחרי לחיצה</figcaption></figure>` : ""}
      ${phoneB ? `<figure><img alt="" src="${uri(phoneB)}"><figcaption>בטלפון, בהצעה הזו</figcaption></figure>` : ""}
    </div>
  </div>

  <div class="m-pane" data-p="c">
    <p class="m-say"><b>רשימה אחת בסוף כל סעיף, בשמות מלאים.</b> העמוד הכי נקי, וכל חוק וכלל מופיע פעם אחת. אבל הקשר נשבר: אי אפשר לדעת איזה מתוך <bdi>40</bdi> החוקים והכללים של "מיסוי" עומד מאחורי <bdi>25%</bdi> בכרטיס "כשמושכים", וזו בדיוק השאלה שקוראים שואלים.</p>
    ${sections(built.c)}
  </div>
</div>

<div class="m-scrim"></div>
<div class="m-sheet" role="dialog" aria-modal="true"><div class="m-sheet-head"><h2></h2><button class="m-x" aria-label="סגירה">✕</button></div><div class="m-sheet-sub"></div><div class="m-sheet-body"></div></div>

<script>
const R = ${JSON.stringify(data)};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

function show(t) {
  $$(".m-pane").forEach((p) => p.classList.toggle("on", p.dataset.p === t));
  $$(".m-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.t === t)));
  history.replaceState(null, "", "#" + t);
}
$$(".m-tab").forEach((b) => b.addEventListener("click", () => show(b.dataset.t)));
show(["today", "a", "b", "c"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "b");

// today: the real toggle, one per section
$$("[data-m=today]").forEach((b) => b.addEventListener("click", () => {
  const s = b.closest("section");
  const on = s.classList.toggle("m-open-lines");
  b.textContent = on ? "הסתרת החוקים והכללים" : "הצגת החוקים והכללים";
}));
// proposal A: one switch
$("[data-m=switch]").addEventListener("click", (e) => {
  const on = e.currentTarget.closest(".m-pane").classList.toggle("m-show");
  e.currentTarget.textContent = on ? "הסתרת החוקים והכללים" : "הצגת החוקים והכללים";
});

const sheet = $(".m-sheet"), scrim = $(".m-scrim");
function closeSheet() { sheet.classList.remove("on"); scrim.classList.remove("on"); }
function row(id, onClick) {
  const b = el("button", "m-row"); b.type = "button";
  const i = el("bdi", "id", id); i.dir = "ltr";
  b.append(i, el("span", "tx", R[id] ? R[id].t : id), el("span", "go", "‹"));
  b.addEventListener("click", onClick);
  return b;
}
function card(id, back) {
  const r = R[id]; const body = $(".m-sheet-body");
  $(".m-sheet-head h2").textContent = id + " · " + (r ? r.t : "");
  $(".m-sheet-sub").textContent = r && r.scope === "general" ? "חל על כולם" : "";
  body.replaceChildren();
  if (back) { const k = el("button", "m-back", "› חזרה לרשימה"); k.type = "button"; k.addEventListener("click", back); body.append(k); }
  if (r && r.src) { const a = el("a", "text-link", (r.src.publisher ? r.src.publisher + " · " : "") + r.src.title); a.href = r.src.url; a.target = "_blank"; a.rel = "noopener noreferrer"; body.append(a); }
  if (r) body.append(el("p", "", r.x));
  body.scrollTop = 0;
}
function list(ids, name) {
  const body = $(".m-sheet-body");
  $(".m-sheet-head h2").textContent = "חוקים וכללים · " + ids.length;
  $(".m-sheet-sub").textContent = name || "";
  body.replaceChildren(...ids.map((id) => row(id, () => card(id, () => list(ids, name)))));
  body.scrollTop = 0;
}
document.addEventListener("click", (e) => {
  const o = e.target.closest("[data-m=open]");
  if (!o) return;
  const ids = o.dataset.ids.split(",");
  sheet.classList.add("on"); scrim.classList.add("on");
  ids.length === 1 ? card(ids[0]) : list(ids, o.dataset.name);
});
$(".m-x").addEventListener("click", closeSheet);
scrim.addEventListener("click", closeSheet);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

// proposal C: the section's list, closed
$$(".m-foot").forEach((f) => {
  const ids = f.dataset.ids.split(",");
  const d = el("details"); const s = el("summary");
  s.append(el("span", "", "חוקים וכללים של הסעיף · " + ids.length));
  d.append(s, ...ids.map((id) => row(id, () => { sheet.classList.add("on"); scrim.classList.add("on"); card(id); })));
  f.append(d);
});
</script>
</body></html>`;
fs.writeFileSync(path.join(here, "rules-display.html"), html);
console.log("written", Math.round(html.length / 1024), "KB");
