// The exact place of each value in data/fees/ (issue 19), kept so another run can repeat it.
//   node research/2026-10-31-night/fee-places.mjs propose <provider> [--all]   print, for each value of the latest snapshot, the lines of its tariff that hold the number
//   node research/2026-10-31-night/fee-places.mjs apply                         for each reviewed entry in fee-places.txt: check, `library.mjs cite`, write source.page and source.quote
//   node research/2026-10-31-night/fee-places.mjs count                         values with and without a place, per provider
//   node research/2026-10-31-night/fee-places.mjs rules                         `library.mjs cite` for each place in rule-places.txt (rule records are generated: nothing written to them)
// `propose` only finds candidates. A person reads them; what was confirmed goes in fee-places.txt.
// An entry with no library id is a place read by eye from a copy not filed (brief, job 8).
// `apply` refuses an entry whose quote does not hold the value's own number, and changes nothing but source.page and source.quote.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const root = new URL("../../", import.meta.url).pathname;
const feesDir = `${root}data/fees/`;
const placesPath = `${root}research/2026-10-31-night/fee-places.txt`;
const FIELDS = ["rate", "min", "max", "cap", "spread", "discount_months", "reverts_to"];
const clean = (t) => t.replace(/[‎‏‪-‮⁦-⁩]/g, "");
const latest = () => {
  const by = {};
  for (const f of readdirSync(feesDir).sort()) if (f.endsWith(".json")) by[f.split("@")[0]] = f;
  return by;
};
const docs = () => readFileSync(`${root}research/library/index.jsonl`, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const pagesOf = (id) => clean(readFileSync(`${root}research/library/store/${id}.txt`, "utf8")).split("\f");
// The ways a tariff may print a number: 0.4 as 0.40, 7300 as 7,300, or with one more decimal.
export const forms = (v) => {
  const out = new Set([String(v)]);
  const [i, d = ""] = String(v).split(".");
  const c = i.replace(/\B(?=(\d{3})+$)/g, ",");
  for (const n of [i, c]) {
    out.add(d ? `${n}.${d}` : n);
    if (!d) { out.add(`${n}.0`); out.add(`${n}.00`); }
    if (d) { out.add(`${n}.${d}0`); out.add(`${n}.${d}00`); }
  }
  return [...out];
};
const hasNumber = (text, v) => forms(v).some((f) => new RegExp(`(^|[^\\d.,])${f.replace(/[.,]/g, "\\$&")}(?![\\d]|[.,]\\d)`).test(text));
const readingOrder = (line) => line.trim().split(/\s{2,}/).reverse().join(" ").replace(/\s+/g, " ");
const eachValue = function* (snap) {
  for (const l of snap.lines) for (const field of FIELDS) if (l[field]) yield { line: l, field, v: l[field] };
};

const sorted = (x) => Array.isArray(x) ? x.map(sorted) : x && typeof x === "object" ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, sorted(x[k])])) : x;
const [cmd, arg] = process.argv.slice(2);
if (cmd === "propose") {
  const file = latest()[arg];
  const snap = JSON.parse(readFileSync(feesDir + file, "utf8"));
  const lib = docs();
  const max = Number(process.argv[process.argv.indexOf("--rows") + 1]) || 4;
  for (const line of snap.lines) {
    const vals = FIELDS.filter((f) => line[f]).map((f) => ({ f, v: line[f] }));
    console.log(`# ${line.id} [${line.channel ?? ""}|${line.band ?? ""}] ${vals.map(({ f, v }) => `${f}=${v.value}`).join(" ")}`);
    const nums = vals.filter(({ v }) => typeof v.value === "number");
    const urls = [...new Set(nums.map(({ v }) => v.source.url))];
    const name = line.names.tariff.join(" ").split(/\s+/).filter((w) => w.length > 3);
    for (const url of urls) {
      const doc = lib.find((d) => d.from?.includes?.(url) || d.url === url);
      if (!doc) { console.log(`   no filed copy ${url.slice(0, 60)}`); continue; }
      if (doc.text === "none") { console.log(`   no text ${doc.id}`); continue; }
      const here = nums.filter(({ v }) => v.source.url === url);
      const secs = here.map(({ v }) => /סעיף\s+(\d+(?:\.\d+)+)/.exec(v.source.title)?.[1]).filter(Boolean);
      const rows = [];
      pagesOf(doc.id).forEach((p, k) => {
        let rowSec = null;
        for (const t of p.split("\n")) {
          const m = /(\d\.\d+(?:\.\d+)+)(?:\s*$|[\u05d0-\u05ea])/.exec(t);
          if (m) rowSec = m[1];
          const has = here.filter(({ v }) => hasNumber(t, v.value)).map(({ f }) => f);
          if (!has.length) continue;
          const score = (secs.includes(rowSec) ? 100 : 0) + has.length * 3 + name.filter((w) => t.includes(w)).length;
          rows.push({ k: k + 1, has, score, rowSec, text: readingOrder(t).slice(0, 150) });
        }
      });
      rows.sort((a, b) => b.score - a.score);
      console.log(`   ${doc.id} ${doc.ext}`);
      for (const r of rows.slice(0, max)) console.log(`   p${r.k} ${r.has.join(",")} (${r.rowSec}) ${r.text}`);
    }
  }
} else if (cmd === "apply") {
  // One line per place: snapshot | line id | fields | library id ("-" if not filed) | page ("-" for a web page) | the document's own words ("!" before them: the value is a word, not a number)
  const places = readFileSync(placesPath, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#")).map((l) => {
    const [snapshot, line, fields, doc, page, ...rest] = l.split(" | ");
    const q = rest.join(" | ");
    return { snapshot, line, fields: fields.split(","), doc: doc === "-" ? null : doc, page: page === "-" ? null : Number(page), quote: q.replace(/^!/, "") || null, noNumber: q.startsWith("!") };
  });
  const seen = new Set(docs().flatMap((d) => (d.cites ?? []).map((c) => `${d.id}|${c.page}|${c.quote}`)));
  const byId = Object.fromEntries(docs().map((d) => [d.id, { urls: [...(Array.isArray(d.from) ? d.from : [d.from]), d.url].filter(Boolean) }]));
  const raw = {};
  let placed = 0, cited = 0;
  const failed = [];
  for (const e of places) try {
    const file = feesDir + e.snapshot + ".json";
    raw[file] ??= readFileSync(file, "utf8");
    // A web page has no page of its own: its place is the quote, cited at the library's page 1.
    const citePage = e.page ?? 1;
    const key = `${e.doc}|${citePage}|${e.quote}`;
    if (e.doc && !seen.has(key)) {
      execFileSync("node", [`${root}research/library/library.mjs`, "cite", e.doc, "--page", String(citePage), "--quote", e.quote], { stdio: "pipe" });
      seen.add(key);
      cited++;
    }
    for (const field of e.fields) {
      const before = JSON.parse(raw[file]);
      const line = before.lines.find((l) => l.id === e.line);
      const v = line?.[field];
      if (!v) throw new Error(`no value: ${e.snapshot} ${e.line} ${field}`);
      if (v.source.page || v.source.quote) continue;
      if (e.doc && !byId[e.doc].urls.includes(v.source.url)) throw new Error(`${e.doc} is not this value's source: ${e.line} ${field} ${v.source.url}`);
      if (e.quote && typeof v.value === "number" && !e.noNumber && !hasNumber(e.quote, v.value)) throw new Error(`quote lacks ${v.value}: ${e.line} ${field}`);
      // Insert after this value's "strength", so the rest of the file stays byte for byte; then prove only source.page and source.quote changed.
      const at = raw[file].indexOf(`"id": "${e.line}"`);
      const key2 = raw[file].indexOf(`"${field}":`, at);
      const m = /([ \t]*)"strength":\s*"[a-z-]+"/.exec(raw[file].slice(key2));
      const end = key2 + m.index + m[0].length;
      const add = [e.page ? `"page": ${e.page}` : null, e.quote ? `"quote": ${JSON.stringify(e.quote)}` : null].filter(Boolean).map((x) => `,\n${m[1]}${x}`).join("");
      const after = raw[file].slice(0, end) + add + raw[file].slice(end);
      const want = structuredClone(before);
      const w = want.lines.find((l) => l.id === e.line)[field];
      if (e.page) w.source.page = e.page;
      if (e.quote) w.source.quote = e.quote;
      if (JSON.stringify(sorted(JSON.parse(after))) !== JSON.stringify(sorted(want))) throw new Error(`insert went astray: ${e.line} ${field}`);
      raw[file] = after;
      placed++;
    }
  } catch (err) { failed.push(`${e.line} ${e.fields}: ${String(err.stderr ?? err.message).trim().split("\n").at(-1)}`); }
  for (const [file, text] of Object.entries(raw)) writeFileSync(file, text);
  console.log(`${placed} values placed, ${cited} new citations, ${failed.length} entries refused`);
  for (const f of failed) console.log(`  refused ${f}`);
} else if (cmd === "count") {
  let all = [0, 0, 0];
  for (const [id, file] of Object.entries(latest())) {
    const snap = JSON.parse(readFileSync(feesDir + file, "utf8"));
    const c = [0, 0, 0];
    for (const { v } of eachValue(snap)) {
      if (v.value === null) c[2]++;
      else if (v.source.page || v.source.quote) c[0]++;
      else c[1]++;
    }
    all = all.map((x, i) => x + c[i]);
    console.log(`${id}\tplaced ${c[0]}\tleft ${c[1]}\tno value ${c[2]}`);
  }
  console.log(`all\tplaced ${all[0]}\tleft ${all[1]}\tno value ${all[2]}`);
} else if (cmd === "rules") {
  // Rule sources are generated from the rule base, so this only proves and files each place; the rule base's owner moves it there.
  const seen = new Set(docs().flatMap((d) => (d.cites ?? []).map((c) => `${d.id}|${c.page}|${c.quote}`)));
  for (const l of readFileSync(`${root}research/2026-10-31-night/rule-places.txt`, "utf8").split("\n")) {
    if (!l.trim() || l.startsWith("#")) continue;
    const [rule, doc, page, quote] = l.split(" | ");
    if (seen.has(`${doc}|${page}|${quote}`)) continue;
    try {
      execFileSync("node", [`${root}research/library/library.mjs`, "cite", doc, "--page", page, "--quote", quote], { stdio: "pipe" });
      console.log(`ok ${rule} ${doc} p${page}`);
    } catch (err) { console.log(`refused ${rule} ${doc} p${page}: ${String(err.stderr).trim().split("\n").at(-1)}`); }
  }
} else console.log("propose <provider> | apply | count | rules");
