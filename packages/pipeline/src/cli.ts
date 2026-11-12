import { appendFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { israelToday } from "@finance-tool/schema";
import { refreshCbsCpi } from "./adapters/cbs-cpi.ts";
import { refreshCma } from "./adapters/cma.ts";
import { refreshEcbFx, refreshEcbMonthEnd } from "./adapters/ecb-fx.ts";
import { refreshMofChildSavings } from "./adapters/mof-child-savings.ts";
import type { SourceReport } from "./adapters/series-common.ts";
import { readFormulaIds, readQuestionPrefixes, readRuleBaseIds } from "./references.ts";
import { validateData } from "./validate.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const [command, ...rest] = process.argv.slice(2);

/**
 * Refresh sources. They run in the order given.
 * Gated, no adapter on purpose: the Bank of Israel series (policy rate A-20, per-bank deposit averages A-21,
 * makam yields A-22). Its terms of use forbid copying and publishing without the Bank's prior written
 * consent and no data.gov.il copy exists (research report r2-series, finding 1), so under the terms
 * gate (docs/architecture.md 3.3) they are not fetched into data/. Revisit if the Bank consents in writing.
 */
const SOURCES = ["cma", "cbs-cpi", "mof-child-savings", "ecb-fx", "ecb-fx-month-end"] as const;
const USAGE = `usage: cli.ts refresh <${SOURCES.join("|")}>... [--dry-run] [--no-archive] [--force]`;

/** Exit codes of `refresh`: 0 ok (written or nothing changed), 1 error, 3 sanity failed, 2 usage. */
async function refresh(args: string[]): Promise<number> {
  const sources = args.filter((a) => !a.startsWith("--"));
  const flags = args.filter((a) => a.startsWith("--"));
  const known = ["--dry-run", "--no-archive", "--force"];
  if (sources.length === 0 || sources.some((s) => !(SOURCES as readonly string[]).includes(s)) || flags.some((f) => !known.includes(f))) {
    console.error(USAGE);
    return 2;
  }
  const opts = {
    dataDir: `${root}data`,
    runDate: israelToday(),
    dryRun: flags.includes("--dry-run"),
    archive: !flags.includes("--no-archive"),
    force: flags.includes("--force"),
  };
  const reports: SourceReport[] = [];
  for (const source of sources) {
    if (source === "cma") {
      for (const r of await refreshCma(opts)) {
        reports.push({ source: r.dataset, status: r.status, period: r.period, reasons: r.reasons, written: r.written, ...(r.note ? { note: r.note } : {}) });
      }
    } else if (source === "cbs-cpi") reports.push(await refreshCbsCpi(opts));
    else if (source === "ecb-fx") reports.push(await refreshEcbFx(opts));
    else if (source === "ecb-fx-month-end") reports.push(await refreshEcbMonthEnd(opts));
    else reports.push(await refreshMofChildSavings(opts));
  }
  const failed = reports.some((r) => r.status === "sanity-failed");
  const errored = reports.some((r) => r.status === "error");
  const changed = reports.filter((r) => r.status === "new-period" || r.status === "updated");
  const status = errored ? "error" : failed ? "sanity-failed" : changed.length > 0 ? "changed" : "unchanged";
  // What changed, for the commit message: "<source> <period>", e.g. "cma 2026-09, cbs-cpi 2026-09-01".
  const period = changed.map((r) => `${r.source} ${r.period}`).join(", ");
  console.log(`refresh ${sources.join(" ")}: ${status}${period ? ` (${period})` : ""}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `status=${status}\nperiod=${period}\nreasons<<EOF\n${reports.flatMap((r) => r.reasons.map((x) => `${r.source}: ${x}`)).join("\n")}\nEOF\n`,
    );
  }
  return errored ? 1 : failed ? 3 : 0;
}

/** Every file under `dir` whose name matches, test files left out (their fixtures name questions that need not exist). */
function filesUnder(dir: string, name: RegExp): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && name.test(e.name) && !/\.test\.[jt]sx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name));
}

if (command === "validate") {
  const refs = `${root}.claude/skills/il-finance/references`;
  // where the repository names open questions, besides data/: the docs, the rule base itself, the packages' sources and the golden
  // workings; the site's sources are the kit guard's (site/app/components/kit/guards.test.ts). research/ holds dated records.
  const citing = [
    ...filesUnder(`${root}docs`, /\.md$/),
    ...filesUnder(refs, /\.md$/),
    ...["engine", "pipeline", "schema"].flatMap((p) => filesUnder(`${root}packages/${p}/src`, /\.ts$/)),
    ...filesUnder(`${root}tests/golden`, /\.(md|py)$/),
  ];
  const problems = validateData({
    dataDir: `${root}data`,
    ruleBase: readRuleBaseIds(refs),
    formulas: readFormulaIds(`${root}docs/method.md`),
    citing: { files: citing, prefixOf: readQuestionPrefixes(refs) },
    filePages: readFilePages(`${root}research/library/index.jsonl`),
  });
  for (const p of problems) console.error(`${p.file}: ${p.message}`);
  console.log(problems.length === 0 ? "data/ is valid" : `${problems.length} problem(s) in data/`);
  process.exit(problems.length === 0 ? 0 : 1);
} else if (command === "refresh") {
  process.exit(await refresh(rest));
} else {
  console.error(`usage: cli.ts validate | ${USAGE.replace("usage: cli.ts ", "")}`);
  process.exit(2);
}

/** The page count of every filed PDF by its address, from the library's index; a document's newest row wins. */
function readFilePages(indexPath: string): Map<string, number> {
  const pages = new Map<string, number>();
  if (!existsSync(indexPath)) return pages;
  for (const line of readFileSync(indexPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const d = JSON.parse(line) as { url?: string; ext?: string; pages?: number; superseded_by?: string };
    if (!d.url || d.ext !== ".pdf" || !d.pages) continue;
    const key = d.url.replace(/#.*$/, "");
    if (!d.superseded_by || !pages.has(key)) pages.set(key, d.pages);
  }
  return pages;
}
