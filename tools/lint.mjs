// npm run lint: Oxlint with its type-aware and React rules (.oxlintrc.json) and knip (knip.jsonc) over the whole repository, after the
// typecheck in npm run check (guidelines/code.md, "The checks decide"). Most rules have findings older than the check, so each is a
// ratchet whose count only goes down: tools/lint-baseline.json records how many findings each Oxlint rule and each kind of knip finding
// has, file by file, and the check fails when the counts differ from it in any of three ways:
// - a rule's total is above its record (a rule with no record allows none): fix the new findings;
// - a file's count for a rule grew though the rule's total did not: fix them, or, when findings moved with code or a renamed file,
//   lower the record so the move shows in its diff;
// - a rule's total is below its record: lower the record, so the findings fixed can't come back.
// `node tools/lint.mjs --lower` writes the counts as they are, and refuses while any rule's total is above its record.
// `node tools/lint.mjs --accept <rule>` writes one named rule's counts as they are, for a rule just turned on or renamed, and changes
// nothing else in the record. The check also fails on a comment that silences a rule other than the one way code.md allows.
// Usage: node tools/lint.mjs [--lower | --accept <rule>]
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(ROOT, "tools/lint-baseline.json");

/**
 * The rule an Oxlint finding counts under. A finding with no rule code is one of three things, told apart by what Oxlint gives: a
 * disable comment that silences nothing (Oxlint's words for it are the only mark it has), a file that does not parse (it points at a
 * place in the file), or a failure of the tool itself (it points nowhere).
 */
export function oxlintRule(d) {
  if (d.code) return d.code;
  if (/^Unused (?:oxlint|eslint)-disable directive/.test(d.message ?? "")) return "unused-disable-directive";
  return d.labels?.length ? "parse-error" : "tool-failure";
}

/** Oxlint's findings as `{ rule: { file: count } }`. */
export function oxlintCounts(diagnostics) {
  const out = {};
  for (const d of diagnostics) {
    const rule = oxlintRule(d);
    out[rule] ??= {};
    out[rule][d.filename] = (out[rule][d.filename] ?? 0) + 1;
  }
  return out;
}

/** The lists knip's JSON reporter gives a file, one per kind of finding; a row's other keys (`file`, `owners`) are not findings. */
const KNIP_KINDS = new Set([
  "binaries",
  "catalog",
  "catalogReferences",
  "cycles",
  "dependencies",
  "devDependencies",
  "duplicates",
  "enumMembers",
  "exports",
  "files",
  "namespaceMembers",
  "nsExports",
  "nsTypes",
  "optionalPeerDependencies",
  "subpaths",
  "types",
  "unlisted",
  "unresolved",
]);

/** knip's findings as `{ kind: { file: count } }`. */
export function knipCounts(issues) {
  const out = {};
  for (const issue of issues)
    for (const [kind, found] of Object.entries(issue)) {
      if (!KNIP_KINDS.has(kind) || !Array.isArray(found) || !found.length) continue;
      out[kind] ??= {};
      out[kind][issue.file] = (out[kind][issue.file] ?? 0) + found.length;
    }
  return out;
}

const total = (files) => Object.values(files ?? {}).reduce((a, b) => a + b, 0);

/**
 * How the counts differ from the record, rule by rule: `up`, each rule whose total is above its record, with the files where its count
 * grew; `grew`, each rule whose total is not above its record but whose count grew in a file, with those files; `down`, each rule whose
 * total is below its record. `baseline` and `current` are `{ tool: { rule: { file: count } } }`.
 */
export function compare(baseline, current) {
  const up = [];
  const grew = [];
  const down = [];
  for (const tool of new Set([...Object.keys(baseline), ...Object.keys(current)])) {
    const was = baseline[tool] ?? {};
    const now = current[tool] ?? {};
    for (const rule of [...new Set([...Object.keys(was), ...Object.keys(now)])].sort()) {
      const [a, b] = [total(was[rule]), total(now[rule])];
      const files = Object.entries(now[rule] ?? {})
        .filter(([f, n]) => n > (was[rule]?.[f] ?? 0))
        .map(([file, n]) => ({ file, was: was[rule]?.[file] ?? 0, now: n }));
      if (b > a) up.push({ tool, rule, was: a, now: b, files });
      else if (files.length) grew.push({ tool, rule, files });
      if (b < a) down.push({ tool, rule, was: a, now: b });
    }
  }
  return { up, grew, down };
}

/**
 * Whether a run fails. The check (`check`) passes only on counts equal to the record, file by file. Lowering the record (`lower`) is
 * refused while a rule's total is above it, and takes findings moved between files, so a move or a rename has a way through. Either fails
 * while a comment silences a rule other than the one way allowed (`directives`, the problems `directiveProblems` found).
 */
export function fails({ up, grew, down }, mode, directives = []) {
  if (directives.length) return true;
  return mode === "lower" ? up.length > 0 : up.length + grew.length + down.length > 0;
}

/** `{ tool: { rule: { file: count } } }` with its keys sorted, so the record's diff shows only what changed. */
export function sorted(counts) {
  const by = (o, f) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, f(o[k])]));
  return by(counts, (rules) => by(rules, (files) => by(files, (n) => n)));
}

/**
 * The record with one named rule's counts replaced by its current ones (a rule with none now leaves the record), and every other rule as
 * it was. Throws when neither the record nor the current counts know the rule.
 */
export function accept(baseline, current, rule) {
  const tools = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].filter((t) => rule in (baseline[t] ?? {}) || rule in (current[t] ?? {}));
  if (!tools.length) throw new Error(`no rule or kind named ${rule} in the record or in the findings`);
  const out = structuredClone(baseline);
  for (const tool of tools) {
    out[tool] ??= {};
    if (current[tool]?.[rule]) out[tool][rule] = current[tool][rule];
    else delete out[tool][rule];
  }
  return sorted(out);
}

/**
 * The rules a comment may never silence: a dependency list and the rules of hooks (guidelines/code.md). Oxlint takes a rule under its
 * plugin's name, its package's name, in any case or bare, so a rule is known by the last part of its name, lower-cased.
 */
const NEVER_SILENCED = new Set(["exhaustive-deps", "rules-of-hooks"]);
const neverSilenced = (rule) => NEVER_SILENCED.has((rule.split("/").at(-1) ?? "").toLowerCase());

/** A rule's name: a letter or `@`, then letters, digits, `_`, `-`, `/` and `@`. */
const RULE = String.raw`[A-Za-z@][\w@/-]*`;

/**
 * Each comment in a source file that silences a rule the way code.md does not allow. The one way allowed is a comment alone on its line
 * (in JSX, inside its braces) that silences the next line: `oxlint-disable-next-line <rule>[, <rule>…] -- <reason>`. Anything else is
 * a problem: an ESLint comment (no ESLint runs here, and Oxlint is set not to read them), an Oxlint comment for a block, a whole file or
 * the line it ends, one after code on its line, one without its rules or its reason, one that silences a rule never silenced, and one in
 * a block comment that spans lines. A silencing word counts where Oxlint could read it as one: just after the `//` or `/*` that opens a
 * comment, or at the start of a later line of a block comment (after spaces and a `*`). A block comment is open from a `/*` to the next
 * `*\/`, read over the whole text, with no regard to strings: a word in a string is then at worst read as a comment, never missed.
 */
export function directiveProblems(text) {
  const out = [];
  const listed = new RegExp(String.raw`^\s+(${RULE}(?:\s*,\s*${RULE})*)\s+--\s+\S`);
  for (const m of text.matchAll(/(?:eslint|oxlint)-(?:disable|enable)(?:-next-line|-line)?\b/g)) {
    const kind = m[0];
    const lineStart = text.lastIndexOf("\n", m.index) + 1;
    const lineEnd = text.indexOf("\n", m.index) < 0 ? text.length : text.indexOf("\n", m.index);
    const before = text.slice(lineStart, m.index);
    const opener = /(\/\/|\/\*)\s*$/.exec(before);
    const inBlock = text.lastIndexOf("/*", m.index) > text.lastIndexOf("*/", m.index);
    const laterLine = !opener && inBlock && /^[\s*]*$/.test(before);
    if (!opener && !laterLine) continue;
    const rest = text.slice(m.index + kind.length, lineEnd);
    const at = `line ${text.slice(0, m.index).split("\n").length}: ${kind}`;
    const rules = listed.exec(rest)?.[1]?.split(/\s*,\s*/);
    if (kind.startsWith("eslint")) out.push(`${at}: an ESLint comment; write the Oxlint one, on its own line, with its reason`);
    else if (kind !== "oxlint-disable-next-line") out.push(`${at}: silences more than the next line; write oxlint-disable-next-line on the line before, with its reason`);
    else if (laterLine || (opener?.[1] === "/*" && !rest.includes("*/")))
      out.push(`${at}: in a block comment that spans lines; write it in a comment on one line, alone on the line before`);
    else if (!/^\s*\{?\s*$/.test(before.slice(0, opener?.index))) out.push(`${at}: follows code on its line; put it alone on the line before`);
    else if (!rules) out.push(`${at}: names no rule or gives no reason after " -- "`);
    else for (const r of rules.filter(neverSilenced)) out.push(`${at}: silences ${r}, which is never silenced; fix the code`);
  }
  return out;
}

/** The source files the directive scan reads: those in git or not ignored by it, outside research/ and data/ and the vendored code. */
function sourceFiles() {
  const r = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
  return r.stdout
    .split("\n")
    .filter((f) => /\.(?:[cm]?[jt]sx?)$/.test(f) && !/^(?:research|data)\//.test(f) && !f.startsWith("site/scripts/chart-check/vendor/"));
}

/** A program's JSON output; exits with its words when it printed none. */
function runJson(name, args) {
  const r = spawnSync(join(ROOT, "node_modules/.bin", name), args, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 << 20 });
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    console.error(`${name} did not report (exit ${r.status}):\n${r.stderr || r.stdout}`);
    throw new Error(`${name} printed no JSON`, { cause: e });
  }
}

const write = (record) => writeFileSync(BASELINE, `${JSON.stringify(record, null, 1)}\n`);

function main() {
  const args = process.argv.slice(2);
  const lower = args.includes("--lower");
  const acceptAt = args.indexOf("--accept");
  const accepted = acceptAt >= 0 ? args[acceptAt + 1] : undefined;
  if (acceptAt >= 0 && !accepted) {
    console.error("Usage: node tools/lint.mjs --accept <rule>, with the rule's name as the lint prints it.");
    process.exit(2);
  }
  const ox = runJson("oxlint", ["--format", "json"]);
  const knip = runJson("knip", ["--reporter", "json", "--no-progress", "--no-exit-code", "--no-config-hints"]);
  const current = sorted({ oxlint: oxlintCounts(ox.diagnostics), knip: knipCounts(knip.issues) });
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));

  if (accepted) {
    const tools = Object.keys(current).filter((t) => accepted in current[t] || accepted in (baseline[t] ?? {}));
    let next;
    try {
      next = accept(baseline, current, accepted);
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    }
    write(next);
    for (const t of tools) console.log(`${t} ${accepted}: recorded ${total(current[t][accepted])} findings, was ${total(baseline[t]?.[accepted])}.`);
    console.log("tools/lint-baseline.json holds this rule's counts as they are and every other rule's as they were; commit it.");
    return;
  }

  const result = compare(baseline, current);
  const directives = sourceFiles().flatMap((f) => directiveProblems(readFileSync(join(ROOT, f), "utf8")).map((p) => `${f} ${p}`));

  const findings = (tool, rule, file) =>
    tool === "oxlint"
      ? ox.diagnostics.filter((d) => oxlintRule(d) === rule && d.filename === file).map((d) => `    ${file}:${d.labels?.[0]?.span.line ?? "?"} ${d.message}`)
      : (knip.issues.find((i) => i.file === file)?.[rule] ?? []).map((x) => `    ${file}:${x.line ?? "?"} ${x.name ?? ""}`);
  const where = (files) => {
    for (const f of files) {
      console.log(`  ${f.file}: ${f.now}, recorded ${f.was}`);
      for (const line of findings(f.tool, f.rule, f.file)) console.log(line);
    }
  };

  for (const u of result.up) {
    console.log(`${u.tool} ${u.rule}: ${u.now} findings, above the record of ${u.was}. Where it grew:`);
    where(u.files.map((f) => ({ ...f, tool: u.tool, rule: u.rule })));
  }
  for (const g of result.grew) {
    console.log(`${g.tool} ${g.rule}: the total is within its record, but a file's count grew:`);
    where(g.files.map((f) => ({ ...f, tool: g.tool, rule: g.rule })));
  }
  for (const d of result.down) console.log(`${d.tool} ${d.rule}: ${d.now} findings, below the record of ${d.was}`);
  for (const p of directives) console.log(`silencing comment: ${p}`);

  if (lower) {
    if (fails(result, "lower", directives)) {
      console.log("\nThe record is not lowered while a rule's total is above it or a silencing comment breaks the rule: fix those first.");
      process.exit(1);
    }
    write(current);
    console.log(`\ntools/lint-baseline.json now holds the counts as they are; commit it.`);
    return;
  }
  const sum = (tool) => Object.values(current[tool]).reduce((a, files) => a + total(files), 0);
  console.log(`\noxlint: ${sum("oxlint")} findings over ${Object.keys(current.oxlint).length} rules; knip: ${sum("knip")} over ${Object.keys(current.knip).length} kinds.`);
  if (result.up.length) console.log('A total went up: fix the new findings above (guidelines/code.md, "The checks decide").');
  if (result.grew.length)
    console.log("A file's count grew: fix the findings above, or, if they moved with code or a renamed file, run `node tools/lint.mjs --lower` and commit tools/lint-baseline.json.");
  if (result.down.length && !result.up.length) console.log("A total went down: run `node tools/lint.mjs --lower` and commit tools/lint-baseline.json.");
  if (fails(result, "check", directives)) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
