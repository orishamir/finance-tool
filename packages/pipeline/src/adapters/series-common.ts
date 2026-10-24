// Shared by the series adapters (cbs-cpi, mof-child-savings): docs/architecture.md section 3.3 for data/series/.
// fetch -> archive -> normalise -> sanity -> diff -> write. The adapters supply the pure steps; this runs them.
// The CMA adapter (cma.ts) keeps its own runner; the decode, hash and gzip helpers are shared from there.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seriesRecord, type SeriesRecord } from "@finance-tool/schema";
import { gzipRaw, sha256Hex, type Downloaded } from "./cma.ts";

export type SourceStatus = "new-period" | "updated" | "unchanged" | "sanity-failed" | "error";

export interface SourceReport {
  source: string;
  status: SourceStatus;
  /** What the commit message names: the latest month or day in the file. */
  period: string | null;
  reasons: string[];
  written: boolean;
  note?: string;
}

export interface SeriesRefreshOptions {
  dataDir: string;
  runDate: string; // YYYY-MM-DD
  dryRun: boolean;
  /** Skip the upload; the archive key and sha256 are still recorded. */
  archive: boolean;
  /** Write even when the sanity check failed (to prepare the pull request). The schema must still pass. */
  force: boolean;
  fetchRaw?: () => Promise<Downloaded>;
  archiveRaw?: Archive;
  log?: (line: string) => void;
}

export type Archive = (args: { tag: string; assetName: string; gz: Buffer; title: string; notes: string }) => string;

export interface SeriesDiff {
  isEmpty: boolean;
  /** The latest date moved (a new month or day), as opposed to values changing within it. */
  newPeriod: boolean;
  summary: string;
}

export interface SeriesSpec {
  source: string;
  id: string;
  fetchRaw: () => Promise<Downloaded>;
  /** Decode and normalise; `file` is null when the download cannot be used. */
  build: (dl: Downloaded, previous: SeriesRecord | null, ctx: { runDate: string; sha256: string }) => { file: SeriesRecord | null; problems: string[] };
  sanity: (next: SeriesRecord, previous: SeriesRecord | null) => string[];
  diff: (previous: SeriesRecord | null, next: SeriesRecord) => SeriesDiff;
  archive: { tag: (runDate: string) => string; title: string; notes: string };
}

export const seriesPath = (dataDir: string, id: string): string => join(dataDir, "series", `${id}.json`);

export function readSeries(dataDir: string, id: string): SeriesRecord | null {
  const path = seriesPath(dataDir, id);
  return existsSync(path) ? seriesRecord.parse(JSON.parse(readFileSync(path, "utf8"))) : null;
}

/** Header pretty-printed, one observation per line (the files hold thousands; a diff then shows one line per change). */
export function serialiseSeries(file: SeriesRecord): string {
  const { observations, ...head } = file;
  const body =
    observations.length === 0 ? "[]" : `[\n${observations.map((o) => `    ${JSON.stringify(o)}`).join(",\n")}\n  ]`;
  const json = JSON.stringify({ ...head, observations: "@@OBSERVATIONS@@" }, null, 2);
  return json.replace('"@@OBSERVATIONS@@"', () => body) + "\n";
}

export const lastDate = (file: SeriesRecord): string | null => file.observations.reduce<string | null>((m, o) => (m === null || o.date > m ? o.date : m), null);

/** Uploads through the gh CLI (GITHUB_TOKEN in CI, the user's login locally). Returns a note. Same method as the CMA adapter. */
export const ghArchive: Archive = ({ tag, assetName, gz, title, notes }) => {
  try {
    execFileSync("gh", ["--version"], { stdio: "ignore" });
  } catch {
    return "gh is not available: raw file not archived (archive key and sha256 are still recorded)";
  }
  const dir = mkdtempSync(join(tmpdir(), "series-raw-"));
  try {
    const file = join(dir, assetName);
    writeFileSync(file, gz);
    let exists = true;
    try {
      execFileSync("gh", ["release", "view", tag], { stdio: "ignore" });
    } catch {
      exists = false;
    }
    if (!exists) execFileSync("gh", ["release", "create", tag, "--title", title, "--notes", notes, "--latest=false"], { stdio: "inherit" });
    execFileSync("gh", ["release", "upload", tag, file, "--clobber"], { stdio: "inherit" });
    return `archived as asset ${assetName} of release ${tag}`;
  } catch (e) {
    return `archive upload failed: ${(e as Error).message}`;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export async function refreshSeries(spec: SeriesSpec, opts: SeriesRefreshOptions): Promise<SourceReport> {
  const log = opts.log ?? ((l: string) => console.log(l));
  const report: SourceReport = { source: spec.source, status: "error", period: null, reasons: [], written: false };
  try {
    const previous = readSeries(opts.dataDir, spec.id);
    const dl = await (opts.fetchRaw ?? spec.fetchRaw)();
    const sha = sha256Hex(dl.bytes);
    const built = spec.build(dl, previous, { runDate: opts.runDate, sha256: sha });
    const reasons = [...built.problems];
    if (built.file) reasons.push(...spec.sanity(built.file, previous));
    report.reasons = reasons;
    if (!built.file || (reasons.length > 0 && !opts.force)) {
      report.status = "sanity-failed";
      log(`${spec.source}: sanity failed, nothing written`);
      for (const r of reasons) log(`  - ${r}`);
      return report;
    }
    const file = built.file;
    if (reasons.length > 0) log(`${spec.source}: sanity failed, written anyway because of --force`);
    report.period = lastDate(file);
    const diff = spec.diff(previous, file);
    if (diff.isEmpty) {
      report.status = "unchanged";
      log(`${spec.source}: latest ${report.period}, ${file.observations.length} observations, nothing changed`);
      return report;
    }
    report.status = diff.newPeriod ? "new-period" : "updated";
    log(`${spec.source}: ${diff.summary}`);
    if (opts.dryRun) {
      log("  dry run: nothing written, nothing archived");
      return report;
    }
    if (opts.archive) {
      const key = file.raw?.archive_key ?? "";
      report.note = (opts.archiveRaw ?? ghArchive)({
        tag: spec.archive.tag(opts.runDate),
        assetName: key.replaceAll("/", "--"),
        gz: gzipRaw(dl.bytes),
        title: spec.archive.title,
        notes: spec.archive.notes,
      });
    } else report.note = "archive skipped (--no-archive); archive key and sha256 recorded";
    log(`  ${report.note}`);
    mkdirSync(join(opts.dataDir, "series"), { recursive: true });
    writeFileSync(seriesPath(opts.dataDir, spec.id), serialiseSeries(file));
    report.written = true;
    log(`  wrote data/series/${spec.id}.json`);
  } catch (e) {
    report.status = "error";
    report.reasons.push((e as Error).message);
    log(`${spec.source}: error: ${(e as Error).message}`);
  }
  return report;
}
