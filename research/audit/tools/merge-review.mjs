// Structure review of a builder's branch before it merges (CLAUDE.md, "Structure review before every merge", founder 2026-10-25).
// It lists the pieces the branch adds so the lead can judge each against the kit: kept (a one-off, with the reason), sent back
// (the kit has it) or promoted (it becomes a kit piece). It finds candidates; it decides nothing.
// Usage: node research/audit/tools/merge-review.mjs <base-ref> [<head-ref>]   (head defaults to HEAD; run from the repo root)
import { execFileSync } from "node:child_process";

const [base, head = "HEAD"] = process.argv.slice(2);
if (!base) {
  console.error("usage: node research/audit/tools/merge-review.mjs <base-ref> [<head-ref>]");
  process.exit(2);
}
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
const range = `${base}...${head}`;
const KIT = "site/app/components/kit/";
const LARGE = 30;

const changed = git("diff", "--name-status", range).trim().split("\n").filter(Boolean).map((l) => l.split("\t"));
const kitIndex = (() => {
  try {
    return git("show", `${head}:${KIT}index.ts`);
  } catch {
    return "";
  }
})();
const kitNames = new Set([...kitIndex.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) => m[1].split(",").map((x) => x.trim())).filter((x) => !x.startsWith("type ")).map((x) => x.split(/\s+as\s+/).pop()).filter((n) => /^[A-Z]/.test(n)));

/** Added lines of the site's source, with their file and new line number. */
function addedLines() {
  const out = [];
  const diff = git("diff", "-U0", "--no-color", range, "--", "site/app");
  let file = null;
  let line = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("+++ ")) file = raw.slice(4).replace(/^b\//, "");
    else if (raw.startsWith("@@")) line = Number(/\+(\d+)/.exec(raw)?.[1] ?? 0);
    else if (raw.startsWith("+") && !raw.startsWith("+++")) {
      out.push({ file, line, text: raw.slice(1) });
      line++;
    }
  }
  return out;
}

const withoutComment = (t) => (/^\s*(\/\/|\*|\/\*)/.test(t) ? "" : t.replace(/\s\/\/\s.*$/, "").replace(/\{\/\*.*?\*\/\}/g, ""));
const findings = new Map();
const note = (group, where, what) => {
  if (!findings.has(group)) findings.set(group, []);
  findings.get(group).push(`${where} — ${what}`);
};

const checks = [
  { group: "Hand-styled pill (kit: ChoiceChips, or the pill list)", test: (t) => /\b(sec-chip|a-chip)\b/.test(t) || (/rounded-full/.test(t) && /\bborder\b/.test(t) && /\bpx-[34]/.test(t)) },
  { group: "Hand-styled card (kit: Card)", test: (t) => /\bbg-card\b/.test(t) && /\bborder\b/.test(t) && /\brounded-(lg|xl)\b/.test(t) },
  { group: "Raw number or text input (kit: NumberField, RangeField, PercentField)", test: (t) => /<input\b/.test(t) && !/type="(checkbox|radio|range|hidden)"/.test(t) },
  { group: "Raw select (no kit piece yet: a second one means promote)", test: (t) => /<select\b/.test(t) },
  { group: "Stat grid (kit: StatRow, KeyValueList)", test: (t) => /<dl\b[^>]*className="[^"]*\bgrid\b/.test(t) },
  { group: "Literal colour (use a role token)", test: (t) => /(fill|stroke|color|background|bg-\[|text-\[|border-\[)[^"'`]*#[0-9a-fA-F]{3,8}\b/.test(t) || /\b(oklch|rgba?|hsla?)\(/.test(t) },
  { group: "Import of the old ui.tsx (import from components/kit)", test: (t) => /from\s+["'](\.\.?\/)+(components\/)?ui["']/.test(t) },
];

const lines = addedLines();
for (const { file, line, text } of lines) {
  if (!file || !/\.(tsx|ts)$/.test(file) || /\.test\.tsx?$/.test(file)) continue;
  const inKit = file.startsWith(KIT);
  const code = withoutComment(text);
  if (!code.trim()) continue;
  const where = `${file}:${line}`;
  const comp = /^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*[(<]/.exec(code) ?? /^\s*(?:export\s+)?const\s+([A-Z]\w*)\s*=\s*(?:\(|memo\(|forwardRef\()/.exec(code);
  if (comp && !inKit) {
    const page = file.includes("/routes/") && /default\s+function/.test(code);
    if (!page) note(kitNames.has(comp[1]) ? "New component with a kit piece's name (likely a copy)" : "New component outside the kit (one-off, or promote?)", where, comp[1]);
  }
  if (inKit) continue;
  for (const c of checks) if (c.test(code)) note(c.group, where, code.trim().slice(0, 110));
  if (/[֐-׿]/.test(code) && !/^site\/app\/(copy\.ts|content\/)/.test(file)) note("Hebrew outside copy.ts and content/ (move the string)", where, code.trim().slice(0, 110));
}

// the kit itself: a changed piece shows in the gallery, a new export has a gallery entry
const kitTouched = changed.filter(([, f]) => f?.startsWith(KIT) && !/\.test\.tsx?$/.test(f) && !f.endsWith("gallery.tsx") && !f.endsWith("index.ts"));
const galleryTouched = changed.some(([, f]) => f === `${KIT}gallery.tsx`);
if (kitTouched.length && !galleryTouched) note("Kit changed but the gallery did not", kitTouched.map(([, f]) => f).join(", "), "show the new or changed state at /kit");
const baseIndex = (() => {
  try {
    return git("show", `${base}:${KIT}index.ts`);
  } catch {
    return "";
  }
})();
const gallery = (() => {
  try {
    return git("show", `${head}:${KIT}gallery.tsx`);
  } catch {
    return "";
  }
})();
for (const n of kitNames) if (!baseIndex.includes(n)) note("New kit piece", `${KIT}index.ts`, `${n}${gallery.includes(n) ? "" : " (not in the gallery)"}`);

const total = changed.length;
// research files (screenshots, reports, tools) don't make a branch large; code and docs do
const code = changed.filter(([, f]) => f && !f.startsWith("research/")).length;
console.log(`# Structure review: ${range}\n`);
console.log(`${total} files changed, ${code} of them code or docs${code > LARGE ? ` (more than ${LARGE}: add an independent reviewer that sees the diff and the kit, not the builder's report)` : ""}.\n`);
if (findings.size === 0) console.log("Nothing to judge: no new pieces outside the kit.");
for (const [group, items] of findings) {
  console.log(`## ${group} (${items.length})`);
  for (const i of items.slice(0, 40)) console.log(`- ${i}`);
  if (items.length > 40) console.log(`- … and ${items.length - 40} more`);
  console.log("");
}
console.log("Judge each item: kept (one-off, say why), sent back (the kit has it) or promoted (becomes a kit piece with a gallery entry and, if it can be named, a guard). Compare the builder's screenshots with /kit.");
