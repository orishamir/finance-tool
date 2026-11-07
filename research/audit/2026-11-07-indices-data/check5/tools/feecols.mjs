import { readFileSync, readdirSync } from "node:fs";
const root = process.argv[2];
const idx = readFileSync(root + "/research/library/index.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const bidi = /[‎‏‪-‮]/g;
let bad = 0, checked = 0;
for (const f of readdirSync(root + "/data/funds").filter((x) => x.endsWith("@2026-10-25.json"))) {
  const r = JSON.parse(readFileSync(root + "/data/funds/" + f, "utf8"));
  const t = r.tracking_record; if (!t?.fees_page) continue;
  const hit = idx.find((e) => e.url && e.url.split("#")[0] === t.source.url.split("#")[0] && e.text === "ok");
  const lines = readFileSync(root + "/research/library/store/" + hit.id + ".txt", "utf8").split("\f")[t.fees_page - 1].replace(bidi, "").split("\n");
  const start = lines.findIndex((l) => /שנפרעו/.test(l));
  // header: lines after start until the first line with a %
  const cols = [];
  for (let i = start; i < start + 6; i++) {
    const l = lines[i]; if (/%/.test(l)) break;
    for (const m of l.matchAll(/\d{1,2}[./]\d{1,2}[./](20\d\d)/g)) cols.push({ pos: m.index + m[0].length / 2, year: null, line: i });
    for (const m of l.replace(/\d{1,2}[./]\d{1,2}[./]20\d\d/g, (s) => " ".repeat(s.length)).matchAll(/(?<![\d.])(20\d\d)(?![\d.])/g)) cols.push({ pos: m.index + 2, year: Number(m[1]), line: i });
  }
  const rowOf = (re) => { const i = lines.findIndex((l, k) => k > start && re.test(l)); if (i < 0) return null; let l = lines[i]; if (!/%|\s-\s|\*/.test(l.replace(/[^\d%*\s-]/g, " ")) && i > 0) l = lines[i - 1]; return { l, prev: lines[i - 1] }; };
  const read = (row) => {
    if (!row) return null; const out = new Map();
    for (const src of [row.prev, row.l]) for (const m of src.matchAll(/(\^?\s?-?\d+(?:\.\d+)?%)|((?<=\s)-(?=\s))|(\*(?=\s))/g)) {
      if (src === row.prev && !/^[\s\d.%^*-]+$/.test(src)) continue;
      const p = m.index + m[0].length / 2;
      const c = cols.reduce((a, x) => (Math.abs(x.pos - p) < Math.abs(a.pos - p) ? x : a), cols[0]);
      if (!c || c.year === null || Math.abs(c.pos - p) > 14) continue;
      const v = m[1] ? Number(m[1].replace(/[\^\s%]/g, "")) : 0;
      if (!out.has(c.year)) out.set(c.year, v);
    }
    return out;
  };
  const rows = { fixed: read(rowOf(/קבועים|שכר מנהל הקרן\s*$/)), variable: read(rowOf(/משתנים/)), trustee: read(rowOf(/נאמן/)) };
  for (const y of t.years) for (const k of ["fixed", "variable", "trustee"]) {
    const got = rows[k]?.get(y.year); checked++;
    const want = y.fees_charged[k];
    if (got === undefined) { console.log(`${r.id} ${y.year} ${k}: not read (record ${want})`); continue; }
    if (Math.abs(got - want) > 1e-9) { bad++; console.log(`${r.id} ${y.year} ${k}: page ${got}, record ${want}  MISMATCH`); }
  }
}
console.log(`checked ${checked}, mismatches ${bad}`);
