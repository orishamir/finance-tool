import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
const lines = (p) => existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const raw = execFileSync("rg", ["-oN", "--no-heading", "https?://[^\\s\"'<>)\\]\\\\`|]*gov\\.il[^\\s\"'<>)\\]\\\\`|]*", "data", "docs", "site/app/content", ".claude/skills/il-finance", "research/knowledge", "research/discovery", "--glob", "!**/work/**"], { maxBuffer: 1 << 30, encoding: "utf8" });
const cites = new Map();
for (const l of raw.split("\n").filter(Boolean)) {
  const at = l.indexOf(":http");
  const file = l.slice(0, at); const u = l.slice(at + 1).split("#")[0].replace(/[.,;:*_]+$/, "");
  if (/[$\{]/.test(u)) continue;
  let host; try { host = new URL(u).hostname; } catch { continue; }
  if (!/(^|\.)gov\.il$/.test(host)) continue;
  const c = cites.get(u) ?? { n: 0, live: 0 };
  c.n++; if (/^(data|\.claude|site|docs)/.test(file)) c.live++;
  cites.set(u, c);
}
const have = new Set(lines("research/library/index.jsonl").map((d) => d.url));
const failed = new Map(lines("research/library/unreachable.jsonl").map((u) => [u.url, u.why]));
const rows = [...cites].filter(([u]) => !have.has(u)).map(([u, c]) => ({ u, ...c, why: failed.get(u), host: new URL(u).hostname, blob: /BlobFolder/i.test(u) }));
const by = {};
for (const r of rows) { const k = `${r.host}${r.blob ? " (BlobFolder)" : ""}${r.why ? " FAILED" : ""}`; by[k] = (by[k] ?? 0) + 1; }
console.log("cited gov.il links", cites.size, "in library", cites.size - rows.length, "missing", rows.length);
console.log(by);
const html = rows.filter((r) => !r.blob && /(^|\.)gov\.il$/.test(r.host));
console.log(html.filter((r)=>r.live).length, "cited by rules/data/site");
console.log(rows.filter((r)=>/^(www\.gov\.il|www\.new\.isa\.gov\.il|www\.isa\.gov\.il|www\.investors\.isa\.gov\.il)$/.test(r.host)&&!r.blob).sort((a,b)=>b.live-a.live||b.n-a.n).map((r)=>`${r.live}/${r.n} ${r.u}`).join("\n"));
