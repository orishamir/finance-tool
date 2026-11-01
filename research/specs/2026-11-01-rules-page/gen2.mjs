// Builds rules-page-2.html: the field of sketch A with today's filters and a "הידעת?" block, working on the real data. Run from
// the repository root after a site build. The filters and sections are the page's own code (rules-filter.ts), the search is the
// site's own (search.ts), bundled in; the rule list comes from light.json, read from the built rules page. Chosen by hand, and
// marked on the page: the example claims, the twelve facts and their sentences, and the words that tie a claim to a document topic.
import fs from "fs";
import { buildSync } from "esbuild";

const here = "research/specs/2026-11-01-rules-page";
const client = "site/build/client";
const { light, productChips } = JSON.parse(fs.readFileSync(`${here}/light.json`, "utf8"));
const b64 = (p) => fs.readFileSync(p).toString("base64");
const font = (re) => b64(`${client}/assets/${fs.readdirSync(`${client}/assets`).find((f) => re.test(f))}`);

// the page's own words and group names
const tmp = `${here}/.copy.tmp.mjs`;
buildSync({ stdin: { contents: `export { rulesFront, topicName } from "./site/app/copy";`, resolveDir: process.cwd(), loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: tmp, logLevel: "error" });
const { rulesFront: copy, topicName } = await import(`${process.cwd()}/${tmp}`);
fs.unlinkSync(tmp);

// the page's filter code and the site's search, for the browser
const lib = buildSync({
  stdin: { contents: `export { matchRules, buildSections } from "./site/app/lib/rules-filter"; export { searchEntries, relaxedHits, analyze } from "./site/app/lib/search";`, resolveDir: process.cwd(), loader: "ts" },
  bundle: true, platform: "browser", format: "iife", globalName: "L", write: false, minify: true, logLevel: "error",
}).outputFiles[0].text;

// every rule, general and company, reduced to what a card shows
const unitWord = { days: "ימים", pct: "%", percent: "%", months: "חודשים", nis: "₪", usd: "$", business_days: "ימי עסקים", years: "שנים" };
const records = fs.readdirSync("data/rules").filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(`data/rules/${f}`, "utf8")));
const rules = Object.fromEntries(
  records.map((r) => [
    r.id,
    {
      t: r.title_he,
      x: r.text_he,
      co: (r.scope_institutions ?? []).map((i) => i.name_he),
      f: Object.entries(r.figures ?? {}).filter(([k, f]) => typeof f.value === "number" && r.figure_names_he?.[k] && unitWord[f.unit]).map(([k, f]) => [r.figure_names_he[k], f.value, unitWord[f.unit]]),
      s: (r.sources ?? []).map((s) => ({ p: s.publisher_he, t: s.title_he, l: s.locator_he, q: s.quote_he ?? s.quote, c: s.checked, u: s.page && /\.pdf/i.test(s.url ?? "") && !s.url.includes("#") ? `${s.url}#page=${s.page}` : s.url })),
    },
  ]),
);

// the search data, rules only
const index = JSON.parse(fs.readFileSync(`${client}/search-index.json`, "utf8")).filter((e) => e.kind === "rule" || e.kind === "companyRule");
const texts = JSON.parse(fs.readFileSync(`${client}/search-texts.json`, "utf8"));

// the company documents that say where each topic sits
const docsRaw = JSON.parse(fs.readFileSync("data/sources/documents.json", "utf8"));
const allDocs = Array.isArray(docsRaw) ? docsRaw : docsRaw.documents ?? Object.values(docsRaw);
const version = (v) => {
  if (!v) return "לא צוין";
  const p = String(v).split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : p.length === 2 ? `${p[1]}.${p[0]}` : v;
};
const docs = allDocs
  .filter((d) => d.topics?.length)
  .map((d) => ({
    co: d.publisher_he,
    t: d.title_he.replace(/\s*\(new-account-agreement\)/, ""),
    v: version(d.version),
    u: d.official_url,
    g: d.publisher_he.startsWith("בנק") || d.publisher_he === "הבנק הבינלאומי" ? "bank" : d.doc_kind === "regulations" ? "fund" : "other",
    tp: d.topics.map((t) => [t.topic, t.page]),
  }))
  .sort((a, b) => a.co.localeCompare(b.co, "he"));

// the words that tie a claim to a document topic: chosen by hand for the sketch
const topicWords = [
  ["שינוי תעריף והודעה עליו", "לשנות|שינוי|להעלות|העלאה|להודיע|הודעה"],
  ["תנאי משיכה", "למשוך|משיכה"],
  ["דמי ניהול", "דמי ניהול"],
  ["המרת מטבע", "המרה|המרת|להמיר|מט.?ח"],
  ["סגירת חשבון", "לסגור|סגירת|סוגר"],
  ["דמי משמרת", "משמרת"],
  ["עמלת קנייה ומכירה", "עמלת קני|עמלת מכיר|עמלת קנ"],
  ["דיבידנד וניכוי מס", "דיבידנד"],
  ["העברת ניירות ערך לגוף אחר", "להעביר ניירות|העברת ניירות|ניירות ערך לבנק|ניירות ערך לבית"],
  ["הוספה וניכוי בפדיון", "פדיון|הוספה|ניכוי"],
];

// the facts: a sentence written from the rule's own text, a figure read from the record through {v}
const num = (id, key) => records.find((r) => r.id === id).figures[key].value;
const facts = [
  { id: "BANK-20", x: "כשיתרת הזכות בעובר ושב עולה על {v} ברציפות לפחות רבעון, הבנק חייב לשלוח הודעה שמפנה לחלופות השקעה שעשויות להניב יותר.", v: Object.values(rules["BANK-20"].f)[0]?.[1] },
  { id: "REG-04", x: "אף חוק בישראל לא מקים ביטוח פיקדונות. חוק חדש מחייב את שר האוצר ואת הנגיד לבחון אם יש בו צורך." },
  { id: "BANK-18", x: "אסור לבנק לגבות דמי ניהול פיקדון ניירות ערך על מק״ם או על קרן כספית." },
  { id: "TXI-25", x: "פיקדון צמוד יכול להפסיד בסך הכול, והריבית עדיין ממוסה במלואה. בית המשפט העליון דחה את הערעור על כך." },
  { id: "TXS-21", x: "החלפת קרן בקרן נחשבת מכירה: המס מנוכה במקור גם אם הכסף לא יוצא מהחשבון." },
  { id: "PF-29", x: "נכסי קופת גמל אינם ניתנים לעיקול, והחברה המנהלת מחזיקה אותם בנפרד מרכושה." },
  { id: "BANK-09", x: "בנק שמשלם ריבית על יתרת זכות בעובר ושב חייב להציג בסניפים ובאתר את שיעור הריבית, סכום המינימום ומועדי הזיכוי." },
  { id: "IRA-02", x: "קרן פנסיה אי אפשר לנהל בניהול אישי: הכסף חייב קודם לעבור לקופת גמל בניהול אישי, וזה משפיע על הכיסוי הביטוחי." },
  { id: "REG-06", x: "אם בנק לא יכול לעמוד בהתחייבויותיו, הנגיד רשאי, לא חייב, להכריז שבנק ישראל או בנק אחר ערב לפיקדונות." },
  { id: "ETF-06", x: "המחיר של קרן סל בבורסה יכול להיות שונה משווי היחידה, והתקנות מחייבות לפרסם בדוח השנתי את טווח ההפרשים." },
  { id: "PF-23", x: "כסף עובר ממסלול למסלול באותה קופה בתוך {v} ימי עסקים, אלא אם התקנון קובע תקופה קצרה יותר.", v: Object.values(rules["PF-23"].f)[0]?.[1] },
  { id: "TXF-27", x: "מניות של חברות אמריקניות הן נכס אמריקני גם למי שאינו אמריקני: מעל {v} בנכסים בארצות הברית במות המנוח, מנהל העיזבון חייב להגיש דוח מס ירושה אמריקני.", v: num("TXF-27", "estate_threshold") },
];
const factUnit = { "BANK-20": " ₪", "TXF-27": " $" };
for (const f of facts) {
  if (!light.some((r) => r.id === f.id)) throw new Error(`fact ${f.id} is not on the rules page`);
  if (f.x.includes("{v}") && !f.v) throw new Error(`fact ${f.id} has no figure`);
  f.v = f.v ? `${new Intl.NumberFormat("en-US").format(f.v)}${factUnit[f.id] ?? ""}` : undefined;
}

// names of the groups, from the page's copy
const groupNames = Object.fromEntries([...new Set(light.map((r) => r.file))].map((f) => [f, copy.subgroups[f] ?? topicName(f)]));

const examples = ["מותר לבנק לשנות עמלה בלי להודיע", "אפשר למשוך קרן השתלמות אחרי 3 שנים", "הברוקר פושט רגל"];

const css = `
@font-face{font-family:Heebo;src:url(data:font/woff2;base64,${font(/^heebo-hebrew-wght/)}) format("woff2");font-weight:100 900;unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F}
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font(/^inter-latin-wght/)}) format("woff2");font-weight:100 900}
:root{color-scheme:dark;--bg:oklch(.17 .004 80);--card:oklch(.2 .005 80);--sec:oklch(.27 .007 80);--line:oklch(.31 .008 80);--fg:oklch(.955 .005 80);--mut:oklch(.82 .008 80);--dim:oklch(.5 .01 80);--pri:oklch(.82 .081 190);--pri-fg:oklch(.17 .004 80);--amb:oklch(.895 .074 70);--amb-b:oklch(.39 .084 70);--amb-bg:oklch(.24 .054 70);--fact:oklch(.24 .042 190);--fact-b:oklch(.39 .066 190)}
*{box-sizing:border-box}
html,body{margin:0;background:oklch(.13 .004 80);color:var(--fg);font:16px/1.7 Inter,Heebo,sans-serif}
a{color:var(--pri);text-decoration:none}a:hover{text-decoration:underline}button,input{font:inherit;color:inherit}[hidden]{display:none!important}
.n,.id{font-variant-numeric:tabular-nums}.id{font-variant-numeric:tabular-nums slashed-zero;font-weight:600}.out{font-size:13px}
.bar{position:sticky;top:0;z-index:5;background:oklch(.13 .004 80);border-block-end:1px solid var(--line);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center}
.set{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.bar b{font-size:14px;font-weight:500;color:var(--mut)}
.bar button{min-height:40px;padding:0 12px;border:0;border-radius:6px;background:var(--sec);font-size:14px;cursor:pointer}.bar button[aria-pressed=true]{background:var(--pri);color:var(--pri-fg);font-weight:500}
.intro{max-width:1280px;margin:0 auto;padding:12px 16px;font-size:14px;color:var(--mut)}.intro p{margin:0}
.hand{font-style:normal;font-size:13px;color:var(--amb);background:var(--amb-bg);border:1px dashed var(--amb-b);border-radius:4px;padding:0 6px;display:inline-block;line-height:1.6}
.wrap{display:flex;justify-content:center;padding:0 16px 48px}
.frame{width:1280px;max-width:100%;background:var(--bg);border:1px solid var(--line);border-radius:8px;overflow:hidden;container:frame/inline-size}.frame.phone{width:390px}
.nav{display:flex;gap:24px;align-items:center;height:64px;padding-inline:88px;border-block-end:1px solid var(--line);font-size:15px;white-space:nowrap;overflow:hidden}.nav strong{font-weight:700;margin-inline-end:8px}.nav .on{color:var(--pri)}
main{max-width:1104px;margin:0 auto;padding:24px 16px 48px;display:flex;flex-direction:column;gap:20px}
h1{font-size:30px;line-height:1.3;margin:0;font-weight:600}h2{font-size:20px;line-height:1.4;margin:0;font-weight:600}h3{font-size:16px;line-height:1.5;margin:0;font-weight:600}
.head{display:flex;flex-direction:column;gap:6px}.lede{margin:0;font-size:18px;color:var(--mut)}
.count{font-weight:400;font-size:14px;color:var(--mut)}.sub{margin:0;font-size:14px;color:var(--mut)}
.field{display:flex;align-items:center;gap:10px;height:64px;font-size:18px;margin-block-start:6px;padding-inline:14px;border:1px solid var(--pri);border-radius:8px;background:var(--card);color:var(--mut)}.field input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--fg);direction:rtl}.field input::placeholder{color:var(--mut)}
.field button{min-width:44px;min-height:44px;background:none;border:0;color:var(--mut);cursor:pointer;font-size:18px}
.ex{margin:0;font-size:14px;color:var(--mut);display:flex;flex-wrap:wrap;gap:0 14px;align-items:center}.link{background:none;border:0;padding:0;color:var(--pri);cursor:pointer;min-height:36px}
.filters,.filterrows{display:flex;flex-direction:column;gap:10px}#filtertoggle{align-self:flex-start}.label{margin:0 0 4px;font-size:14px;color:var(--mut)}
.chips{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.chip{min-height:44px;display:inline-flex;align-items:center;gap:6px;padding:0 12px;border:0;border-radius:6px;background:var(--sec);font-size:14px;white-space:nowrap;cursor:pointer}.chip[aria-pressed=true]{background:var(--pri);color:var(--pri-fg);font-weight:500}.chip .n{opacity:.8;min-width:3ch;text-align:end;display:inline-block}.chip.zero{opacity:.45}
details.more{font-size:14px}details.more>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;gap:.3em}
.statusline{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:center;min-height:44px}.status{margin:0;font-size:14px;color:var(--mut)}
.body{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}.body.row,.body.nofacts{grid-template-columns:minmax(0,1fr)}
.results{display:flex;flex-direction:column;gap:28px;min-width:0;container:results/inline-size}.section{display:flex;flex-direction:column;gap:10px}
.fold{border:1px solid var(--line);border-radius:12px;background:var(--card)}.fold>button{width:100%;min-height:52px;display:flex;justify-content:space-between;gap:12px;align-items:center;background:none;border:0;padding:8px 16px;text-align:start;cursor:pointer;font-weight:500}.fold .inner{padding:0 12px 12px}
.cards{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}@container results (min-width:760px){.cards{grid-template-columns:1fr 1fr;align-items:start}}
.card{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0;overflow-wrap:anywhere}.results>.section>.cards>.card{background:var(--card)}
.text{margin:0;font-size:15px;line-height:1.65}.src{border-block-start:1px solid var(--line);padding-block-start:6px;font-size:14px}.src p{margin:0}.checked{color:var(--mut);font-size:13px}
.figs{margin:0;display:flex;flex-direction:column;gap:2px;font-size:14px}.figs div{display:flex;justify-content:space-between;gap:12px}.figs dt{color:var(--mut)}.figs dd{margin:0;white-space:nowrap}.sourced{border-block-end:1.5px solid var(--mut);font-weight:600}
.facts{background:var(--fact);border:1px solid var(--fact-b);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;min-width:0}.side{position:sticky;top:72px}.body.row #facts{order:-1}
.facts h2{font-size:18px}.factlist{display:grid;gap:10px;grid-template-columns:minmax(0,1fr)}.body.row .factlist{grid-template-columns:repeat(3,minmax(0,1fr))}
.fact{background:var(--bg);border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;font-size:15px;line-height:1.55;min-height:200px}.fact p{margin:0}.body.row .fact{min-height:204px}.fact .foot{margin-block-start:auto;font-size:13px;color:var(--mut)}.fact .open{background:none;border:0;padding:0;color:var(--pri);cursor:pointer;font-size:14px;text-align:start;min-height:32px}
.facts .next{align-self:flex-start;min-height:44px;padding:0 12px;border:0;border-radius:6px;background:var(--sec);font-size:14px;cursor:pointer}
.seg{display:flex;flex-wrap:wrap;gap:8px}table.docs{width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px}.docs th{font-weight:500;text-align:start;color:var(--mut);padding:8px;border-block-end:1px solid var(--line)}.docs td{padding:8px;border-block-end:1px solid var(--sec);vertical-align:top}.docs strong{font-weight:500}.c-co{width:20%}.c-ver{width:88px}.c-page{width:150px}.pages a{white-space:nowrap;display:inline-block;margin-inline-end:8px}.show-narrow{display:none}
details.co{border:1px solid var(--line);border-radius:8px;background:var(--card)}details.co>summary{cursor:pointer;min-height:44px;padding:8px 14px;font-size:15px}details.co>.card{margin:0 8px 8px}
.foot-note{font-size:13px;color:var(--mut);margin:0;border-block-start:1px solid var(--line);padding-block-start:10px}
@media (max-width:700px){.bar{position:static}.wrap{padding-inline:0}.frame{border-inline:0;border-radius:0}}
@container frame (max-width:700px){
 .nav{padding-inline:16px;gap:16px;font-size:14px}.nav span:not(.on){display:none}main{padding:16px 16px 40px}h1{font-size:24px}.lede{font-size:16px}.field{height:56px;font-size:16px}
 .chips.scroll{flex-wrap:nowrap;overflow-x:auto;margin-inline:-16px;padding-inline:16px;scrollbar-width:none}.chips.scroll li{flex:none}
 .body,.body.row{grid-template-columns:minmax(0,1fr);gap:20px}.side{position:static}#facts{order:-1}.body.row .factlist,.factlist{grid-template-columns:minmax(0,1fr)}.fact:not(:first-child){display:none}.fact,.body.row .fact{min-height:186px}
 .hide-narrow{display:none}.show-narrow{display:block;color:var(--mut);font-size:13px}.c-co{width:auto}.c-page{width:112px}.pages a{display:block;min-height:44px;line-height:44px;margin:0}.docs td{padding-block:4px}
}`;

const js = `
const DATA=${JSON.stringify({ light, rules, index, texts, docs, topicWords, facts, groupNames, shelves: copy.shelves, productChips, filters: copy.filters, changing: copy.changing, products: copy.products, examples })};
const {light:LIGHT,rules:RULES,index:IDX,texts:TEXTS,docs:DOCS,topicWords:TW,facts:FACTS,groupNames:GN,shelves:SH,productChips:PC,filters:FW,changing:CH,products:PW}=DATA;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const num=n=>'<bdi dir="ltr" class="n">'+esc(n)+'</bdi>';
const fnum=n=>new Intl.NumberFormat('en-US').format(n);
const day=d=>d?d.split('-').reverse().join('.'):'';
const shelfIds=Object.keys(SH);
const st={shelf:null,product:null,prefix:null,changing:false,ids:[],claim:'',opened:new Set(),fact:0,place:'side',width:'pc',docG:'bank',lawAll:false};
const LIGHT_HAY={light:new Map(),full:new Map()};
const prefixes=(()=>{const m=new Map();for(const r of LIGHT)m.set(r.prefix,(m.get(r.prefix)||0)+1);return [...m.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(x=>x[0])})();
const pass=(r,skip)=>(skip==='shelf'||!st.shelf||r.shelf===st.shelf)&&(skip==='product'||!st.product||r.products.includes(st.product))&&(skip==='prefix'||!st.prefix||r.prefix===st.prefix)&&(skip==='changing'||!st.changing||!!r.recheck_date)&&(!st.ids.length||st.ids.includes(r.id));
let found=null;
function search(c){
  if(!c.trim())return null;
  let hits=L.searchEntries(IDX,c,TEXTS),near=false;
  if(!hits.length){hits=L.relaxedHits(IDX,TEXTS,L.analyze(c),8);near=hits.length>0}
  const key=h=>h.entry.key;
  const topics=TW.filter(([,w])=>new RegExp(w).test(c)).map(([t])=>t);
  return{law:hits.filter(h=>h.entry.kind==='rule').map(key),co:hits.filter(h=>h.entry.kind==='companyRule').map(key),near,topics};
}
function pool(){const set=found?new Set(found.law):null;return set?LIGHT.filter(r=>set.has(r.id)):LIGHT}
function card(id){const r=RULES[id];if(!r)return'';
  const [f,...rest]=r.s;const src=s=>'<div class="src"><a href="'+esc(s.u)+'" target="_blank" rel="noreferrer">'+esc(s.p)+' · '+esc(s.t)+(s.l?', '+esc(s.l):'')+' <span class="out">↗</span></a>'+(s.q?'<p>״'+esc(s.q)+'״</p>':'')+'<p class="checked">נבדק '+num(day(s.c))+'</p></div>';
  return '<article class="card"><h3><bdi dir="ltr" class="id">'+esc(id)+'</bdi> · '+esc(r.t)+'</h3><p class="text">'+esc(r.x)+'</p>'+(r.f.length?'<dl class="figs">'+r.f.slice(0,3).map(([n,v,u])=>'<div><dt>'+esc(n)+'</dt><dd><span class="sourced">'+num(fnum(v))+'</span> '+esc(u)+'</dd></div>').join('')+'</dl>':'')+(f?src(f):'')+(rest.length?'<details class="more"><summary>עוד '+num(rest.length)+(rest.length===1?' מקור':' מקורות')+'</summary>'+rest.map(src).join('')+'</details>':'')+'</article>'}
function chipsUpdate(){
  const P=pool();
  const c=(d,test)=>P.filter(r=>pass(r,d)&&test(r)).length;
  qa('[data-dim]').forEach(b=>{const d=b.dataset.dim,v=b.dataset.val||null;let on,n;
    if(d==='shelf'){on=st.shelf===v;n=v?c('shelf',r=>r.shelf===v):c('shelf',()=>true)}
    if(d==='product'){on=st.product===v;n=v?c('product',r=>r.products.includes(v)):null}
    if(d==='prefix'){on=st.prefix===v;n=c('prefix',r=>r.prefix===v)}
    if(d==='changing'){on=st.changing;n=c('changing',r=>!!r.recheck_date)}
    b.setAttribute('aria-pressed',on);const s=q('.n',b);if(s&&n!==null){s.textContent=fnum(n);b.classList.toggle('zero',n===0&&!on)}})}
function docTable(){
  const rows=DOCS.map(d=>({...d,pp:d.tp.filter(([t])=>found.topics.includes(t)).map(x=>x[1])})).filter(d=>d.pp.length);
  if(!rows.length)return '<p class="sub">במסמכי החברות שנקראו אין כרגע נושא שמתאים לטענה הזאת.</p>';
  const groups={bank:'בנקים',fund:'קופות גמל וקרנות השתלמות',other:'ברוקרים ובתי השקעות'};
  const count=g=>rows.filter(d=>d.g===g).length;
  if(!count(st.docG))st.docG=Object.keys(groups).find(count);
  const link=(d,p)=>'<a href="'+esc(d.u)+(/\\.pdf/i.test(d.u)?'#page='+p:'')+'" target="_blank" rel="noreferrer">עמוד '+num(p)+' <span class="out">↗</span></a>';
  return '<p class="sub">כל מסמך חל רק על החברה שלו. הקישור פותח את העמוד שבו הנושא מופיע; האתר לא מסכם מה כתוב שם. <em class="hand">הקשר בין הטענה לנושא במסמכים נבחר ביד לסקיצה</em></p>'+
   '<div class="seg">'+Object.entries(groups).map(([g,n])=>'<button type="button" class="chip" data-docg="'+g+'" aria-pressed="'+(st.docG===g)+'">'+n+' <span class="n">'+count(g)+'</span></button>').join('')+'</div>'+
   '<table class="docs"><colgroup><col class="c-co"><col class="hide-narrow"><col class="c-ver hide-narrow"><col class="c-page"></colgroup><thead><tr><th>חברה</th><th class="hide-narrow">מסמך</th><th class="hide-narrow">מהדורה</th><th>איפה כתוב</th></tr></thead><tbody>'+
   rows.filter(d=>d.g===st.docG).map(d=>'<tr><td><strong>'+esc(d.co)+'</strong><span class="show-narrow">'+esc(d.t)+'</span></td><td class="hide-narrow">'+esc(d.t)+'</td><td class="hide-narrow n">'+esc(d.v)+'</td><td class="pages">'+[...new Set(d.pp)].map(p=>link(d,p)).join(' ')+'</td></tr>').join('')+'</tbody></table>'}
function results(){
  const out=q('#results');
  if(found){
    const ok=new Set(LIGHT.filter(r=>pass(r)).map(r=>r.id));
    const law=found.law.filter(id=>ok.has(id));const shown=st.lawAll?law:law.slice(0,6);
    const cos=found.co.slice(0,6);
    const docCount=DOCS.filter(d=>d.tp.some(([t])=>found.topics.includes(t))).length;
    q('#status').innerHTML=(found.near?'לא נמצאה התאמה מלאה; הכי קרובים: ':'נמצאו ')+num(law.length)+' חוקים וכללים · '+num(found.co.length+docCount)+' של חברות';
    out.innerHTML='<section class="section"><h2>מה כתוב בחוק ובכללים <span class="count">· '+num(law.length)+'</span></h2>'+(law.length?'<div class="cards">'+shown.map(card).join('')+'</div>':'<p class="sub">אין כאן כלל שמתאים לטענה ולסינון יחד.</p>')+(law.length>shown.length?'<button type="button" class="link" id="lawall">לכל ה־'+num(law.length)+'</button>':'')+'</section>'+
    '<section class="section"><h2>מה כתוב אצל החברות</h2>'+docTable()+(cos.length?'<h3>מה שהאתר כבר קרא בתנאים של חברות</h3>'+cos.map(id=>'<details class="co"><summary><bdi dir="ltr" class="id">'+esc(id)+'</bdi> · '+esc(RULES[id]?.t)+'</summary>'+card(id)+'</details>').join(''):'')+'</section>';
    return}
  const m=L.matchRules(LIGHT,{shelf:st.shelf,product:st.product,prefix:st.prefix,changing:st.changing,ids:st.ids,q:''},LIGHT_HAY);
  const filtering=!!(st.shelf||st.product||st.prefix||st.changing||st.ids.length);
  const auto=filtering&&m.length<=120;
  q('#status').innerHTML=m.length?FW.showing.replace('{n}',num(fnum(m.length))).replace('{total}',num(fnum(LIGHT.length))):esc(FW.none);
  const secs=L.buildSections(m,st.changing);
  out.innerHTML=secs.map(sec=>{const nm=sec.shelf?SH[sec.shelf]:{name:CH.title,line:CH.line};
    return '<section class="section"><div><h2>'+esc(nm.name)+' <span class="count">· '+num(sec.count)+'</span></h2><p class="sub">'+esc(nm.line)+'</p></div>'+sec.groups.map(g=>{const open=auto||st.opened.has(g.id);
      const title=g.kind==='month'?g.month.slice(5)+'.'+g.month.slice(0,4):g.kind==='experience'?'ניסיון של אחרים':GN[g.file];
      return '<div class="fold"><button type="button" data-fold="'+esc(g.id)+'" aria-expanded="'+open+'"><span>'+esc(title)+' <span class="count">· '+num(g.ids.length)+'</span></span><span aria-hidden="true">'+(open?'▴':'▾')+'</span></button>'+(open?'<div class="inner"><div class="cards">'+g.ids.map(card).join('')+'</div></div>':'')+'</div>'}).join('')+'</section>'}).join('')}
function factsRender(){
  const box=q('#facts');const body=q('#body');
  body.className='body'+(found?' nofacts':st.place==='row'?' row':'');box.hidden=!!found;box.classList.toggle('side',st.place==='side');
  if(found)return;
  const lid=new Map(LIGHT.map(r=>[r.id,r]));
  const fits=f=>{const r=lid.get(f.id);return pass(r)};
  const order=[...FACTS.filter(fits),...FACTS.filter(f=>!fits(f))];
  const list=[0,1,2].map(i=>order[(st.fact+i)%order.length]);
  q('#factlist').innerHTML=list.map(f=>{const r=RULES[f.id];const s=r.s[0];const parts=f.x.split('{v}');
    return '<div class="fact"><p>'+esc(parts[0])+(f.v?'<span class="sourced">'+num(f.v)+'</span>':'')+esc(parts[1]??'')+'</p><p class="foot">'+esc(s.p)+'</p><button type="button" class="open" data-fact="'+f.id+'"><bdi dir="ltr" class="id">'+f.id+'</bdi> · לכלל המלא</button></div>'}).join('')}
function render(keepFocus){
  found=search(st.claim);
  chipsUpdate();results();factsRender();
  q('#clear').style.visibility=(st.shelf||st.product||st.prefix||st.changing||st.ids.length)?'visible':'hidden';
  q('#fieldclear').hidden=!st.claim;
  q('#examples').hidden=!!st.claim;
  q('#filtertoggle').hidden=!found;q('#filtertoggle').setAttribute('aria-expanded',!!st.showFilters);q('#filterrows').hidden=!!found&&!st.showFilters;
  qa('[data-place]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.place===st.place));
  qa('[data-width]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.width===st.width));
  q('#frame').classList.toggle('phone',st.width==='phone');
}
let timer;q('#claim').addEventListener('input',e=>{st.claim=e.target.value;st.lawAll=false;clearTimeout(timer);timer=setTimeout(render,150)});
document.addEventListener('click',e=>{const t=e.target.closest('button,[data-ex]');if(!t)return;
  if(t.dataset.dim){const d=t.dataset.dim,v=t.dataset.val||null;if(d==='changing')st.changing=!st.changing;else st[d]=(st[d]===v)?null:v;st.ids=[];render()}
  else if(t.dataset.fold){const id=t.dataset.fold;st.opened.has(id)?st.opened.delete(id):st.opened.add(id);results()}
  else if(t.dataset.ex!==undefined){q('#claim').value=t.dataset.ex;st.claim=t.dataset.ex;render()}
  else if(t.id==='filtertoggle'){st.showFilters=!st.showFilters;render()}
  else if(t.id==='clear'){st.shelf=st.product=st.prefix=null;st.changing=false;st.ids=[];render()}
  else if(t.id==='fieldclear'){q('#claim').value='';st.claim='';render()}
  else if(t.id==='nextfact'){st.fact=(st.fact+(q('#frame').offsetWidth<700?1:3))%FACTS.length;factsRender()}
  else if(t.dataset.fact){st.ids=[t.dataset.fact];st.shelf=st.product=st.prefix=null;st.changing=false;render();q('#statusline').scrollIntoView({block:'start'})}
  else if(t.dataset.docg){st.docG=t.dataset.docg;results()}
  else if(t.id==='lawall'){st.lawAll=true;results()}
  else if(t.dataset.place){st.place=t.dataset.place;render()}
  else if(t.dataset.width){st.width=t.dataset.width;render()}
});
render();
`;

const chip = (dim, val, label, extra = "") => `<li><button type="button" class="chip" data-dim="${dim}" data-val="${val}" aria-pressed="false">${label}${extra}</button></li>`;
const n = '<span class="n" dir="ltr">0</span>';
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const prefixes = [...new Set(light.map((r) => r.prefix))];

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>סקיצה: חוקים וכללים, שילוב</title><style>${css}</style></head><body>
<div class="bar"><div class="set"><b>סקיצה 2: השדה של א׳ והמסננים של היום. ״הידעת?״</b><button data-place="side">בצד (מומלץ)</button><button data-place="row">בשורה מעל הרשימה</button></div><div class="set"><b>רוחב</b><button data-width="pc">מחשב</button><button data-width="phone">טלפון</button></div></div>
<div class="intro"><p>הסקיצה עובדת: המסננים והחלוקה הם הקוד של העמוד, החיפוש הוא החיפוש של האתר, על כל הכללים האמיתיים. אפשר להקליד כל טענה. הדירוג עוד לא שופר. מה שנבחר ביד מסומן במסגרת כתומה.</p></div>
<div class="wrap"><div class="frame" id="frame">
<header class="nav"><strong>מקור</strong><span>מדריך</span><span class="on">חוקים וכללים</span><span>שאלות שכולם שואלים</span><span>חברות ומסלולים</span><span>השוואה למטרה</span><span>השקעה במדד</span></header>
<main>
  <div class="head"><h1>חוקים וכללים</h1><p class="lede">אמרו לכם משהו על הכסף, או שאתם קוראים תנאים של בנק? כתבו את זה כאן ותראו מה כתוב, ואיפה.</p>
    <div class="field"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="claim" placeholder="כתבו מה אמרו לכם, או מה קראתם בתנאים" aria-label="הטענה" autocomplete="off"><button type="button" id="fieldclear" aria-label="ניקוי" hidden>×</button></div>
    <p class="ex" id="examples"><span>למשל:</span>${examples.map((e) => `<button type="button" class="link" data-ex="${esc(e)}">${esc(e)}</button>`).join("")}<em class="hand">נבחרו ביד לסקיצה</em></p>
  </div>
  <div class="filters">
    <button type="button" class="chip" id="filtertoggle" aria-expanded="false" hidden>סינון התוצאות</button>
    <div class="filterrows" id="filterrows">
    <div><p class="label">${copy.filters.shelfLabel}</p><ul class="chips scroll">${chip("shelf", "", copy.filters.all, n)}${Object.entries(copy.shelves).map(([k, v]) => chip("shelf", k, v.name, n)).join("")}</ul></div>
    <div><p class="label">${copy.filters.productLabel}</p><ul class="chips scroll">${chip("product", "", copy.products.all)}${productChips.map((c) => chip("product", c.id, esc(c.name), n)).join("")}</ul></div>
    <ul class="chips">${chip("changing", "1", copy.filters.changing, n)}</ul>
    <details class="more"><summary>${copy.filters.prefixLabel}</summary><ul class="chips">${prefixes.map((p) => chip("prefix", p, `<bdi dir="ltr" class="id">${p}</bdi>`, n)).join("")}</ul></details>
    </div>
    <div class="statusline" id="statusline"><p class="status" id="status" role="status"></p><button type="button" class="chip" id="clear" style="visibility:hidden">${copy.filters.clear}</button></div>
  </div>
  <div class="body" id="body">
    <div class="results" id="results"></div>
    <aside class="facts side" id="facts"><h2>הידעת? <em class="hand" style="font-weight:400">העובדות נבחרו ונוסחו ביד מתוך הכללים</em></h2><div class="factlist" id="factlist"></div><button type="button" class="next" id="nextfact">עוד עובדות</button></aside>
  </div>
  <p class="foot-note">הכול נכתב מנוסח החוק או ממסמך של הרשות כשאפשר; מה שנלקח ממסמך של חברה מסומן לידו. התאריך הוא היום שבו האתר קרא את המקור.</p>
</main></div></div>
<script>${lib}</script>
<script>${js.replace(/<\/script>/g, "<\\/script>")}</script></body></html>`;

fs.writeFileSync(`${here}/rules-page-2.html`, html);
console.log("written", Math.round(html.length / 1024), "KB; rules", Object.keys(rules).length, "; docs", docs.length, "; facts", facts.map((f) => `${f.id}${f.v ? `=${f.v}` : ""}`).join(" "));
