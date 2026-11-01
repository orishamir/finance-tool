// Builds rules-page.html, the sketch of the rules page, from the real records: run from the repository root after a site build.
// Every rule, figure, document, version and page below is read from data/; what was chosen by hand is marked on the page.
import fs from "fs";

const here = "research/specs/2026-11-01-rules-page";
const rule = (id) => JSON.parse(fs.readFileSync(`data/rules/${id.toLowerCase()}.json`, "utf8"));
const docsRaw = JSON.parse(fs.readFileSync("data/sources/documents.json", "utf8"));
const docs = Array.isArray(docsRaw) ? docsRaw : docsRaw.documents ?? Object.values(docsRaw);
const chips = JSON.parse(fs.readFileSync(`${here}/product-chips.json`, "utf8"));
const b64 = (p) => fs.readFileSync(p).toString("base64");
const assets = "site/build/client/assets";
const font = (re) => b64(`${assets}/${fs.readdirSync(assets).find((f) => re.test(f))}`);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => `<bdi dir="ltr" class="n">${esc(n)}</bdi>`;
const day = (d) => (d ? d.split("-").reverse().join(".") : "");
const claim = "מותר לבנק לשנות עמלה בלי להודיע";

// ---------------------------------------------------------------- the rules

const shelves = [
  { id: "state", name: "מה המדינה לוקחת", line: "מס בהפקדה, בדרך ובמשיכה; פטורים; מה חייב בדיווח", n: 168, ids: ["TXI-03", "TXI-07", "TXS-21", "TXS-09"] },
  { id: "costs", name: "מה הבנק או בית ההשקעות לוקחים", line: "דמי ניהול ותקרות, עמלות, הנחות שנגמרות, מינימום", n: 71, ids: ["BRK-16", "BANK-18", "PF-02", "PF-06"] },
  { id: "access", name: "מה אפשר לעשות עם הכסף", line: "מתי אפשר למשוך, איך עוברים, מי רשאי להצטרף, תקרות הפקדה", n: 143, ids: ["PF-17", "PF-23", "BANK-06", "PF-19"] },
  { id: "protection", name: "מי מפקח ומה מוגן", line: "מי מפקח, מה קורה אם החברה קורסת, מה מבוטח", n: 74, ids: ["REG-18", "REG-19", "REG-04", "REG-06"] },
  { id: "structure", name: "איך המוצר בנוי", line: "מטבע, חלוקה, מדדים, מה כתוב בדוח ואיך קוראים לדברים", n: 32, ids: ["IRA-11", "BANK-15", "MF-32", "ETF-10"] },
];
const found = ["BRK-21", "BANK-19"];
const rules = Object.fromEntries([...found, ...shelves.flatMap((s) => s.ids)].map((id) => [id, rule(id)]));

const kindWord = (s) => (/\.pdf($|#|\?)/i.test(s.url ?? "") ? "PDF" : "");
const srcHref = (s) => (s.page && kindWord(s) && !String(s.url).includes("#") ? `${s.url}#page=${s.page}` : s.url);
function source(s) {
  const q = s.quote_he ?? s.quote;
  return `<div class="src">
    <a href="${esc(srcHref(s))}" target="_blank" rel="noreferrer">${esc(s.publisher_he)} · ${esc(s.title_he)}${s.locator_he ? `, ${esc(s.locator_he)}` : ""} <span class="out">↗</span></a>
    ${q ? `<p class="quote">״${esc(q)}״</p>` : ""}
    <p class="checked">נבדק ${num(day(s.checked))}</p>
  </div>`;
}
function figures(r) {
  const names = r.figure_names_he ?? {};
  const rows = Object.entries(r.figures ?? {}).filter(([, f]) => typeof f.value === "number" && names);
  if (!rows.length) return "";
  const unit = { days: "ימים", percent: "%", years: "שנים", nis: "₪" };
  return `<dl class="figs">${rows
    .slice(0, 3)
    .map(([k, f]) => `<div><dt>${esc(names[k] ?? k)}</dt><dd><span class="sourced">${num(f.value)}</span> ${esc(unit[f.unit] ?? "")}</dd></div>`)
    .join("")}</dl>`;
}
function card(id) {
  const r = rules[id];
  const [first, ...rest] = r.sources;
  if (/[{}]/.test(r.text_he)) throw new Error(`slot in ${id}`);
  return `<article class="card" data-rule="${id}">
    <h3><bdi dir="ltr" class="id">${esc(id)}</bdi> · ${esc(r.title_he)}</h3>
    <p class="text">${esc(r.text_he)}</p>
    ${figures(r)}
    ${source(first)}
    ${rest.length ? `<details class="more"><summary>עוד ${num(rest.length)} ${rest.length === 1 ? "מקור" : "מקורות"}</summary>${rest.map(source).join("")}</details>` : ""}
  </article>`;
}

// ---------------------------------------------------------------- the company documents on one topic

const topic = "שינוי תעריף והודעה עליו";
const version = (v) => {
  if (!v) return "לא צוין";
  const p = String(v).split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : p.length === 2 ? `${p[1]}.${p[0]}` : v;
};
const docRows = docs
  .filter((d) => d.topics?.some((t) => t.topic === topic))
  .map((d) => ({
    co: d.publisher_he,
    title: d.title_he.replace(/\s*\([a-z-]+\)\s*$/i, "").replace(/\s*\(new-account-agreement\)/, ""),
    ver: version(d.version),
    pages: d.topics.filter((t) => t.topic === topic).map((t) => t.page),
    url: d.official_url,
    group: d.publisher_he.startsWith("בנק") || d.publisher_he === "הבנק הבינלאומי" ? "bank" : d.doc_kind === "regulations" ? "fund" : "other",
  }))
  .sort((a, b) => a.group.localeCompare(b.group) || a.co.localeCompare(b.co, "he"));
const groupNames = { bank: "בנקים", fund: "קופות גמל וקרנות השתלמות", other: "ברוקרים ובתי השקעות" };
const groupCount = (g) => docRows.filter((d) => d.group === g).length;
const pageLinks = (d) =>
  d.pages.map((p) => `<a href="${esc(d.url)}${/\.pdf/i.test(d.url) ? `#page=${p}` : ""}" target="_blank" rel="noreferrer">עמוד ${num(p)} <span class="out">↗</span></a>`).join(" ");

function docTable(id) {
  return `<div class="seg" role="group" aria-label="סוג החברה" data-table="${id}">
      ${["bank", "fund", "other"].map((g, i) => `<button type="button" data-g="${g}" aria-pressed="${i === 0}">${groupNames[g]} ${num(groupCount(g))}</button>`).join("")}
    </div>
    <table class="docs" id="${id}">
      <colgroup><col class="c-co"><col class="c-doc"><col class="c-ver"><col class="c-page"></colgroup>
      <thead><tr><th>חברה</th><th class="hide-narrow">מסמך</th><th class="hide-narrow">מהדורה</th><th>איפה כתוב</th></tr></thead>
      <tbody>${docRows
        .map(
          (d) => `<tr data-g="${d.group}"${d.group === "bank" ? "" : " hidden"}>
        <td><strong>${esc(d.co)}</strong><span class="show-narrow">${esc(d.title)}</span></td>
        <td class="hide-narrow">${esc(d.title)}</td>
        <td class="hide-narrow n">${esc(d.ver)}</td>
        <td class="pages">${pageLinks(d)}</td></tr>`,
        )
        .join("")}</tbody>
    </table>`;
}

const lawTitle = `<h2>מה כתוב בחוק ובכללים <span class="count">· ${num(found.length)}</span></h2>`;
const coTitle = `<h2>מה כתוב אצל החברות <span class="count">· ${num(docRows.length)} מסמכים</span></h2>
  <p class="sub">כל מסמך חל רק על החברה שלו. הקישור פותח את העמוד שבו הנושא מופיע; האתר לא מסכם מה כתוב שם.</p>`;

// document topics, by how many documents carry each (the Hebrew topic names only)
const topicCounts = {};
for (const d of docs) for (const t of new Set((d.topics ?? []).map((x) => x.topic))) topicCounts[t] = (topicCounts[t] ?? 0) + 1;
const topics = Object.entries(topicCounts).filter(([t, n]) => /[א-ת]/.test(t) && n >= 8).sort((a, b) => b[1] - a[1]);

// the product list, read from today's page
const products = [];
for (let i = 1; i < chips.length; i += 2) products.push({ name: chips[i], n: Number(chips[i + 1]) });
const productSelect = (id) => `<label class="pick"><span>מוצר</span><select id="${id}" data-product><option value="">כל המוצרים</option>${products.map((p) => `<option value="${p.n}">${esc(p.name)}</option>`).join("")}</select></label>`;

// ---------------------------------------------------------------- the shell of one drawn screen

const nav = `<header class="nav"><strong>מקור</strong><span>מדריך</span><span class="on">חוקים וכללים</span><span>שאלות שכולם שואלים</span><span>חברות ומסלולים</span><span>השוואה למטרה</span><span>השקעה במדד</span></header>`;
const field = (value, cls = "") => `<div class="field ${cls}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input value="${esc(value)}" placeholder="כתבו מה אמרו לכם, או מה קראתם בתנאים" aria-label="הטענה" readonly></div>`;
const head = (value) => `<div class="head"><h1>חוקים וכללים</h1><p class="lede">אמרו לכם משהו על הכסף, או שאתם קוראים תנאים של בנק? כתבו את זה כאן ותראו מה כתוב, ואיפה.</p>${field(value, "big")}</div>`;
const examples = ["קרן כספית פטורה ממס", claim, "הפיקדון מובטח"];
const exampleRow = `<p class="ex"><span>למשל:</span> ${examples.map((e) => `<button type="button" class="link" data-to="claim">${esc(e)}</button>`).join(" ")} <em class="hand">נבחרו ביד לסקיצה</em></p>`;
const handFound = `<em class="hand">השורות כאן נבחרו ביד: זה מה שהחיפוש החדש צריך להחזיר על הטענה הזאת</em>`;

const blocks = shelves
  .map(
    (s) => `<section class="block"><h3>${esc(s.name)} <span class="count">· ${num(s.n)}</span></h3><p class="sub">${esc(s.line)}</p><ul>${s.ids.map((id) => `<li><a href="#"><bdi dir="ltr" class="id">${esc(id)}</bdi> · ${esc(rules[id].title_he)}</a></li>`).join("")}</ul><a class="all" href="#">לכל ה־${num(s.n)}</a></section>`,
  )
  .join("");
const topicBlock = `<section class="block co"><h3>מה כתוב אצל החברות</h3><p class="sub">מסמכים של בנקים, בתי השקעות וקופות, לפי נושא</p><ul>${topics.map(([t, n]) => `<li><a href="#" ${t === topic ? 'data-to="claim"' : ""}>${esc(t)} <span class="count">· ${num(n)}</span></a></li>`).join("")}</ul></section>`;

// A: the claim first, the results stacked
const aClaim = `${nav}<main>${head(claim)}
  <p class="status" role="status">נמצאו ${num(found.length)} חוקים וכללים · ${num(docRows.length)} מסמכים של חברות ${handFound}</p>
  <section>${lawTitle}<div class="two">${found.map(card).join("")}</div></section>
  <section>${coTitle}${docTable("a-docs")}</section></main>`;
const aEmpty = `${nav}<main>${head("")}${exampleRow}
  <div class="filterline">${productSelect("a-prod")}<p class="status" role="status" data-status>כל ${num(488)} החוקים והכללים, לפי השאלה</p></div>
  <div class="blocks">${blocks}${topicBlock}</div></main>`;

// B: law and company side by side
const coOptions = [...new Set(docRows.map((d) => d.co))];
const bClaim = `${nav}<main>${head(claim)}
  <p class="status" role="status">נמצאו ${num(found.length)} חוקים וכללים · ${num(docRows.length)} מסמכים של חברות ${handFound}</p>
  <div class="vs">
    <section class="col-law">${lawTitle}${found.map(card).join("")}</section>
    <section class="col-co"><h2>מה כתוב אצל החברות</h2>
      <label class="pick wide"><span>החברה</span><select data-company><option value="">כל ${docRows.length} המסמכים</option>${coOptions.map((c) => `<option>${esc(c)}</option>`).join("")}</select></label>
      <p class="sub">כל מסמך חל רק על החברה שלו. הקישור פותח את העמוד שבו הנושא מופיע.</p>
      <table class="docs tight" data-company-table><colgroup><col><col class="c-page"></colgroup><thead><tr><th>חברה ומסמך</th><th>איפה כתוב</th></tr></thead>
      <tbody>${docRows.map((d) => `<tr data-co="${esc(d.co)}"><td><strong>${esc(d.co)}</strong><span class="block-line">${esc(d.title)} · ${d.ver === "לא צוין" ? "מהדורה לא צוינה" : `מהדורה <span class="n">${esc(d.ver)}</span>`}</span></td><td class="pages">${pageLinks(d)}</td></tr>`).join("")}</tbody></table>
    </section>
  </div></main>`;
const bEmpty = `${nav}<main>${head("")}${exampleRow}
  <div class="vs">
    <section class="col-law"><h2>מה כתוב בחוק ובכללים <span class="count">· ${num(488)}</span></h2>
      <ul class="plain">${shelves.map((s) => `<li><a href="#"><strong>${esc(s.name)}</strong> <span class="count">· ${num(s.n)}</span></a><p class="sub">${esc(s.line)}</p></li>`).join("")}</ul></section>
    <section class="col-co"><h2>מה כתוב אצל החברות</h2>
      <ul class="plain">${topics.map(([t, n]) => `<li><a href="#" ${t === topic ? 'data-to="claim"' : ""}><strong>${esc(t)}</strong> <span class="count">· ${num(n)} מסמכים</span></a></li>`).join("")}</ul></section>
  </div></main>`;

// C: a list and a reading pane
const row = (id) => `<button type="button" class="row" data-open="${id}"><bdi dir="ltr" class="id">${esc(id)}</bdi> ${esc(rules[id].title_he)}</button>`;
const docRow = (d, i) => `<button type="button" class="row" data-open-doc="${i}"><strong>${esc(d.co)}</strong> ${esc(d.title)}</button>`;
const rail = (value, on) => `<aside class="rail">${field(value)}
  ${on === "claim" ? "" : `<fieldset><legend>לפי השאלה</legend>${shelves.map((s) => `<label class="radio"><input type="radio" name="q${on}" value="${s.id}" ${on === "empty" && s.id === "state" ? "checked" : ""}>${esc(s.name)} <span class="count">${num(s.n)}</span></label>`).join("")}</fieldset>${productSelect(`c-prod-${on}`)}`}</aside>`;
const panes = Object.fromEntries(Object.keys(rules).map((id) => [id, card(id)]));
const docPanes = docRows.map((d) => `<article class="card"><h3>${esc(d.co)}</h3><p class="text">${esc(d.title)}</p><dl class="figs"><div><dt>מהדורה</dt><dd class="n">${esc(d.ver)}</dd></div><div><dt>הנושא</dt><dd>${esc(topic)}</dd></div></dl><p class="pages">${pageLinks(d)}</p><p class="sub">המסמך חל רק על החברה הזאת. האתר לא מסכם מה כתוב שם.</p></article>`);
const cClaim = `${nav}<main class="wide"><div class="head slim"><h1>חוקים וכללים</h1></div><div class="trio">${rail(claim, "claim")}
  <div class="list"><p class="status" role="status">${handFound}</p>
    <h2>חוקים וכללים <span class="count">· ${num(found.length)}</span></h2>${found.map(row).join("")}
    <h2>מסמכי חברות <span class="count">· ${num(docRows.length)}</span></h2>${docRows.map(docRow).join("")}</div>
  <div class="pane" data-pane>${panes["BRK-21"]}</div></div></main>`;
const cEmpty = `${nav}<main class="wide"><div class="head slim"><h1>חוקים וכללים</h1></div><div class="trio">${rail("", "empty")}
  <div class="list"><p class="status" role="status" data-status>מה המדינה לוקחת: ${num(168)} חוקים וכללים. מוצגים כאן ${num(4)} לדוגמה.</p>${shelves.map((s) => `<div data-shelf="${s.id}"${s.id === "state" ? "" : " hidden"}><h2>${esc(s.name)} <span class="count">· ${num(s.n)}</span></h2>${s.ids.map(row).join("")}</div>`).join("")}</div>
  <div class="pane" data-pane>${panes["TXI-03"]}</div></div></main>`;

const options = {
  a: { name: "הטענה קודם", tag: "מומלצת", why: "שדה אחד בראש העמוד, ומתחתיו שתי קבוצות: החוק, ואז החברות. בלי טענה, העמוד נפתח על החוקים עצמם.", claim: aClaim, empty: aEmpty },
  b: { name: "החוק מול החברה", tag: "", why: "אותו שדה, אבל החוק והחברות זה לצד זה, ובוחרים חברה אחת. נוח להשוואה; פחות מקום לטקסט של הכלל.", claim: bClaim, empty: bEmpty },
  c: { name: "רשימה וחלון קריאה", tag: "", why: "הכי קרוב ל״דפדפן״: סינון בצד, רשימה באמצע, קריאה בחלון. טוב למי ששוטט; החיפוש כבר לא במרכז.", claim: cClaim, empty: cEmpty },
};

// ---------------------------------------------------------------- the page

const css = `
@font-face{font-family:Heebo;src:url(data:font/woff2;base64,${font(/^heebo-hebrew-wght/)}) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font(/^inter-latin-wght/)}) format("woff2");font-weight:100 900}
:root{color-scheme:dark;--bg:oklch(.17 .004 80);--card:oklch(.2 .005 80);--pop:oklch(.235 .006 80);--sec:oklch(.27 .007 80);--line:oklch(.31 .008 80);--fg:oklch(.955 .005 80);--mut:oklch(.82 .008 80);--dim:oklch(.5 .01 80);--pri:oklch(.82 .081 190);--pri-fg:oklch(.17 .004 80);--inf:oklch(.895 .052 190);--amb:oklch(.895 .074 70);--amb-b:oklch(.39 .084 70);--amb-bg:oklch(.24 .054 70)}
*{box-sizing:border-box}
html,body{margin:0;background:oklch(.13 .004 80);color:var(--fg);font:16px/1.7 Inter,Heebo,sans-serif}
a{color:var(--pri);text-decoration:none}a:hover{text-decoration:underline}
button,input,select{font:inherit;color:inherit}
.n,.id{font-variant-numeric:tabular-nums}.id{font-variant-numeric:tabular-nums slashed-zero;font-weight:600}.out{font-size:13px}
.bar{position:sticky;top:0;z-index:5;background:oklch(.13 .004 80);border-block-end:1px solid var(--line);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center}
.set[hidden]{display:none!important}.bar b{font-size:14px;font-weight:500;color:var(--mut)}.bar .set{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.bar button{min-height:40px;padding:0 12px;border:0;border-radius:6px;background:var(--sec);font-size:14px;cursor:pointer}
.bar button[aria-pressed=true]{background:var(--pri);color:var(--pri-fg);font-weight:500}
.rec{font-size:13px;margin-inline-start:6px}
.intro{max-width:1280px;margin:0 auto;padding:16px}
.intro h1{font-size:20px;margin:0 0 4px;font-weight:600}.intro p{margin:0;font-size:14px;color:var(--mut);max-width:820px}
.why{font-size:15px!important;color:var(--fg)!important;margin-block-start:8px!important}
.hand{font-style:normal;font-size:13px;color:var(--amb);background:var(--amb-bg);border:1px dashed var(--amb-b);border-radius:4px;padding:0 6px;white-space:normal;display:inline-block;line-height:1.6}
.frame-wrap{display:flex;justify-content:center;padding:0 16px 48px}
.frame{width:1280px;max-width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;overflow:hidden;container-type:inline-size;min-height:700px}
.frame.phone{width:390px}
.nav{display:flex;gap:24px;align-items:center;height:64px;padding-inline:88px;border-block-end:1px solid var(--line);font-size:15px;white-space:nowrap;overflow:hidden}
.nav strong{font-weight:700;margin-inline-end:8px}.nav .on{color:var(--pri)}
main{max-width:1104px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:32px}
main.wide{max-width:none;padding-inline:24px;gap:12px}
h1{font-size:30px;line-height:1.3;margin:0;font-weight:600}h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}h3{font-size:16px;line-height:1.5;margin:0;font-weight:600}
.head{display:flex;flex-direction:column;gap:8px}.lede{margin:0;font-size:18px;color:var(--mut)}
.count{font-weight:400;font-size:14px;color:var(--mut)}.sub{margin:0;font-size:14px;color:var(--mut)}
.field{display:flex;align-items:center;gap:10px;height:48px;padding-inline:14px;border:1px solid var(--dim);border-radius:8px;background:var(--card);color:var(--mut)}
.field input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--fg);direction:rtl}.field input::placeholder{color:var(--mut)}
.field.big{height:64px;font-size:18px;margin-block-start:8px;border-color:var(--pri)}
.status{margin:0;font-size:14px;color:var(--mut)}
.ex{margin:-16px 0 0;font-size:14px;color:var(--mut)}.link{background:none;border:0;padding:0 0 0 12px;color:var(--pri);cursor:pointer;min-height:32px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 20px;display:flex;flex-direction:column;gap:10px;min-width:0;overflow-wrap:anywhere}
.text{margin:0;font-size:15px;line-height:1.65}
.src{border-block-start:1px solid var(--line);padding-block-start:8px;font-size:14px}.src p{margin:0}.quote{color:var(--fg)}.checked{color:var(--mut);font-size:13px}
.figs{margin:0;display:flex;flex-direction:column;gap:2px;font-size:14px}.figs div{display:flex;justify-content:space-between;gap:12px}.figs dt{color:var(--mut)}.figs dd{margin:0;white-space:nowrap}
.sourced{border-block-end:1.5px solid var(--mut);font-weight:600}
.more summary{cursor:pointer;font-size:14px;color:var(--pri);min-height:32px}
.seg{display:flex;flex-wrap:wrap;gap:8px;margin-block:12px}.seg button{min-height:44px;padding:0 12px;border:0;border-radius:6px;background:var(--sec);font-size:14px;cursor:pointer}.seg button[aria-pressed=true]{background:var(--pri);color:var(--pri-fg);font-weight:500}
table.docs{width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px}
.docs th{font-weight:500;text-align:start;color:var(--mut);padding:8px 8px 8px 12px;border-block-end:1px solid var(--line)}.docs td{padding:9px 8px 9px 12px;border-block-end:1px solid var(--sec);vertical-align:top}
.c-co{width:22%}.c-doc{width:auto}.c-ver{width:96px}.c-page{width:150px}
.docs strong{font-weight:500}.pages a{white-space:nowrap;display:inline-block;margin-inline-end:8px}
.show-narrow{display:none}.block-line{display:block;color:var(--mut);font-size:13px}
.pick{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--mut)}.pick select{height:44px;background:var(--card);border:1px solid var(--dim);border-radius:6px;padding-inline:8px;color:var(--fg);max-width:100%;min-width:0}.pick.wide{margin-block-end:8px}.pick.wide select{flex:1}
.filterline{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-block-start:-16px}
.blocks{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.block{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;min-width:0}
.block ul{list-style:none;margin:6px 0;padding:0;font-size:14px;display:flex;flex-direction:column;gap:6px;line-height:1.5}.block .all{font-size:14px;margin-block-start:auto}.block a .id{color:inherit}
.vs{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}.col-law{display:flex;flex-direction:column;gap:12px}.col-law h2{margin:0}
.plain{list-style:none;margin:8px 0 0;padding:0}.plain li{padding-block:10px;border-block-end:1px solid var(--sec)}
.trio{display:grid;grid-template-columns:260px 380px 1fr;gap:16px;align-items:start}
.rail{display:flex;flex-direction:column;gap:12px;position:sticky;top:12px}.rail fieldset{border:0;margin:0;padding:0;display:flex;flex-direction:column}.rail legend{font-size:14px;color:var(--mut);padding:0;margin-block-end:4px}
.radio{display:flex;align-items:center;gap:8px;min-height:44px;font-size:14px;line-height:1.35}.radio .count{margin-inline-start:auto}
.list>*{flex-shrink:0}.list{display:flex;flex-direction:column;gap:2px;max-height:780px;overflow-y:auto;padding-inline-end:4px;border-inline:1px solid var(--line);padding-inline:12px}.list h2{font-size:16px;margin:12px 0 4px}
.row{display:block;width:100%;text-align:start;background:none;border:0;border-block-end:1px solid var(--sec);padding:9px 6px;font-size:14px;line-height:1.5;cursor:pointer;min-height:44px}.row strong{font-weight:500;display:block}.row:hover,.row[aria-current=true]{background:var(--sec)}.row .id{margin-inline-end:6px}
.today{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;padding:16px}.today img{width:100%;display:block;border:1px solid var(--line);border-radius:6px}.today figcaption{font-size:14px;color:var(--mut);margin-block-end:6px}.today figure{margin:0}
@media (max-width:700px){.bar{position:static}.frame-wrap{padding-inline:0}.frame{border-inline:0;border-radius:0}}
@container (max-width:700px){
 .nav{padding-inline:16px;gap:16px;font-size:14px}.nav span:not(.on){display:none}
 main{padding:16px 16px 40px;gap:24px}main.wide{padding-inline:16px}h1{font-size:24px}.lede{font-size:16px}.field.big{height:56px;font-size:16px}
 .two,.vs,.blocks,.trio,.today{grid-template-columns:minmax(0,1fr)}.vs{gap:24px}.rail{position:static}.list{max-height:none;border:0;padding-inline:0}
 .hide-narrow{display:none}.show-narrow{display:block;color:var(--mut);font-size:13px}.c-co{width:auto}.c-doc,.c-ver{width:0}.c-page{width:116px}
 .pages a{display:block;min-height:44px;line-height:44px;margin:0}.docs td{padding-block:4px}.card{padding:14px}
}`;

const js = `
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const options=${JSON.stringify(Object.fromEntries(Object.entries(options).map(([k, v]) => [k, { name: v.name, tag: v.tag, why: v.why, claim: v.claim, empty: v.empty }])))};
const panes=${JSON.stringify(panes)},docPanes=${JSON.stringify(docPanes)};
const today=q('#today').innerHTML;
const st={opt:'a',state:'claim',width:'pc'};
function render(){
  qa('[data-opt]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.opt===st.opt));
  qa('[data-state]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.state===st.state));
  qa('[data-width]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.width===st.width));
  q('#stateset').hidden=st.opt==='today';
  const f=q('#frame');f.classList.toggle('phone',st.width==='phone');
  if(st.opt==='today'){q('#why').textContent='אותה טענה בעמוד של היום: החיפוש בעמוד מחפש את כל המשפט כמו שהוא, ולכן לא נמצא כלום, וכל המסך הראשון הוא מסננים.';f.innerHTML=today;return}
  const o=options[st.opt];q('#why').textContent=o.name+': '+o.why;f.innerHTML=o[st.state];wire(f);
}
function wire(f){
  qa('.seg',f).forEach(seg=>{const t=q('#'+seg.dataset.table,f);qa('button',seg).forEach(b=>b.onclick=()=>{qa('button',seg).forEach(x=>x.setAttribute('aria-pressed',x===b));qa('tbody tr',t).forEach(r=>r.hidden=r.dataset.g!==b.dataset.g)})});
  qa('[data-company]',f).forEach(s=>s.onchange=()=>qa('[data-company-table] tbody tr',f).forEach(r=>r.hidden=!!s.value&&r.dataset.co!==s.value));
  qa('[data-to=claim]',f).forEach(a=>a.onclick=e=>{e.preventDefault();st.state='claim';render()});
  qa('a[href="#"]:not([data-to])',f).forEach(a=>a.onclick=e=>e.preventDefault());
  const pane=q('[data-pane]',f);
  qa('[data-open]',f).forEach(b=>b.onclick=()=>{pane.innerHTML=panes[b.dataset.open];mark(f,b)});
  qa('[data-open-doc]',f).forEach(b=>b.onclick=()=>{pane.innerHTML=docPanes[+b.dataset.openDoc];mark(f,b)});
  const first=q('.row:not([hidden])',f);if(first&&pane)mark(f,first);
  qa('[data-product]',f).forEach(s=>s.onchange=()=>{const stat=q('[data-status]',f);if(!stat)return;const name=s.options[s.selectedIndex].text;stat.textContent=s.value?(name+': '+s.value+' חוקים וכללים'):'כל 488 החוקים והכללים, לפי השאלה'});
  qa('.radio input',f).forEach(r=>r.onchange=()=>{qa('[data-shelf]',f).forEach(d=>d.hidden=d.dataset.shelf!==r.value);const box=q('[data-shelf="'+r.value+'"]',f);const stat=q('[data-status]',f);if(stat&&box){stat.textContent=q('h2',box).textContent.replace(' · ',': ')+' חוקים וכללים. מוצגים כאן 4 לדוגמה.';const b=q('.row',box);pane.innerHTML=panes[b.dataset.open];mark(f,b)}});
}
function mark(f,b){qa('.row',f).forEach(x=>x.setAttribute('aria-current',x===b))}
qa('[data-opt]').forEach(b=>b.onclick=()=>{st.opt=b.dataset.opt;render()});
qa('[data-state]').forEach(b=>b.onclick=()=>{st.state=b.dataset.state;render()});
qa('[data-width]').forEach(b=>b.onclick=()=>{st.width=b.dataset.width;render()});
render();`;

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>סקיצה: עמוד חוקים וכללים</title><style>${css}</style></head><body>
<div class="bar">
  <div class="set"><b>סקיצה</b>
    <button data-opt="a">א. הטענה קודם <span class="rec">(מומלצת)</span></button><button data-opt="b">ב. החוק מול החברה</button><button data-opt="c">ג. רשימה וחלון קריאה</button><button data-opt="today">היום</button></div>
  <div class="set" id="stateset"><b>מצב</b><button data-state="claim">עם טענה</button><button data-state="empty">בלי טענה</button></div>
  <div class="set"><b>רוחב</b><button data-width="pc">מחשב</button><button data-width="phone">טלפון</button></div>
</div>
<div class="intro"><p id="why" class="why"></p>
<p>הכללים, המספרים, המסמכים, המהדורות והעמודים נקראו מנתוני האתר. מה שנבחר ביד מסומן במסגרת כתומה מקווקוות. הקישורים פותחים את המקור האמיתי.</p></div>
<div class="frame-wrap"><div class="frame" id="frame"></div></div>
<template id="today"></template>
<div id="today" hidden><div class="today"><figure><figcaption>מחשב, אחרי הקלדת הטענה: ״${esc(claim)}״</figcaption><img alt="העמוד של היום במחשב" src="data:image/jpeg;base64,${b64(`${here}/today-pc.jpg`)}"></figure><figure><figcaption>טלפון, אותה טענה</figcaption><img alt="העמוד של היום בטלפון" src="data:image/jpeg;base64,${b64(`${here}/today-390.jpg`)}"></figure></div></div>
<script>${js.replace(/<\/script>/g, "<\\/script>")}</script></body></html>`;

fs.writeFileSync(`${here}/rules-page.html`, html.replace('<template id="today"></template>\n', ""));
console.log("written", Math.round(html.length / 1024), "KB; documents", docRows.length, Object.keys(groupNames).map((g) => `${g}:${groupCount(g)}`).join(" "), "; topics", topics.length);
