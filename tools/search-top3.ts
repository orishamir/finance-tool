// The first three results of the site search for each question of `siteQuestions` (site/app/lib/search-claims.ts), over the real
// index and texts built by the two route loaders, and how long each search takes. Run from the repository root:
//   npx tsx tools/search-top3.ts            the table
//   npx tsx tools/search-top3.ts --json     the same as JSON, to compare two runs
import { performance } from "node:perf_hooks";
import { searchEntries, type SearchEntry, type SearchTexts } from "../site/app/lib/search";
import { siteQuestions } from "../site/app/lib/search-claims";
import { loader as indexLoader } from "../site/app/routes/search-index";
import { loader as textsLoader } from "../site/app/routes/search-texts";

const index = (await (await indexLoader()).json()) as SearchEntry[];
const texts = (await (await textsLoader()).json()) as SearchTexts;
// warm the caches the way a first keystroke does
searchEntries(index, "קרן", texts);

const rows = siteQuestions.map(({ q, lead }) => {
  const t0 = performance.now();
  const hits = searchEntries(index, q, texts);
  const ms = performance.now() - t0;
  const top = hits.slice(0, 3).map((h) => `${h.entry.name} <${h.entry.href}>`);
  const ok = lead.every((href, i) => hits[i]?.entry.href === href);
  return { q, ok, ms: Math.round(ms * 10) / 10, top };
});

// every prefix of every question, as typed one letter at a time: the slowest keystroke is what a person could feel
let slowest = { q: "", ms: 0 };
for (const { q } of siteQuestions) {
  for (let i = 2; i <= q.length; i++) {
    const part = q.slice(0, i);
    const t0 = performance.now();
    searchEntries(index, part, texts);
    const ms = performance.now() - t0;
    if (ms > slowest.ms) slowest = { q: part, ms: Math.round(ms * 10) / 10 };
  }
}

if (process.argv.includes("--json")) console.log(JSON.stringify({ rows, slowest }, null, 2));
else {
  for (const r of rows) console.log(`${r.ok ? "ok  " : "MISS"} ${r.ms} ms  ${r.q}\n      ${r.top.join("\n      ")}`);
  console.log(`\n${rows.filter((r) => r.ok).length} of ${rows.length} lead as expected; slowest keystroke ${slowest.ms} ms ("${slowest.q}")`);
}
