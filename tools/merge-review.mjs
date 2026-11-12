// Structure review of a builder's branch before it merges (CLAUDE.md, "Structure review before every merge", founder 2026-10-25).
// It lists the pieces the branch adds so the lead can judge each against the kit: kept (a one-off, with the reason), sent back
// (the kit has it) or promoted (it becomes a kit piece). It finds candidates; it decides nothing.
// Usage: node tools/merge-review.mjs <base-ref> [<head-ref>]   (head defaults to HEAD; run from the repo root)
//        node tools/merge-review.mjs --self-check   (proves a copied kit name outside kit/ is flagged and a gallery-shown shared piece is
//        not, and that each check of the kit's text pieces sees its planted copy and not the shared piece)
import { execFileSync } from "node:child_process";

const [base, head = "HEAD"] = process.argv.slice(2);
const SELF_CHECK = base === "--self-check";
if (!base) {
  console.error("usage: node tools/merge-review.mjs <base-ref> [<head-ref>]");
  process.exit(2);
}
const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "pipe"] });
const range = `${base}...${head}`;
const KIT = "site/app/components/kit/";
const LARGE = 30;

const changed = SELF_CHECK ? [] : git("diff", "--name-status", range).trim().split("\n").filter(Boolean).map((l) => l.split("\t"));
const kitIndex = (() => {
  try {
    return git("show", `${head}:${KIT}index.ts`);
  } catch {
    return "";
  }
})();
const kitNames = new Set([...kitIndex.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) => m[1].split(",").map((x) => x.trim())).filter((x) => !x.startsWith("type ")).map((x) => x.split(/\s+as\s+/).pop()).filter((n) => /^[A-Z]/.test(n)));

// The gallery at head: a shared piece that lives outside kit/ by convention (the provenance pieces) is in the kit when the gallery
// imports it from that very file (`import { ReadingTag } from "../provenance"`). Only those names, defined in that file, are exempt:
// a word in a demo's title exempts nothing, and a kit piece's name defined anywhere outside kit/ is always a likely copy
// (third check, 2026-11-07: matching demo titles hid a new `function Button(` in a feature folder).
const gallery = SELF_CHECK
  ? ""
  : (() => {
      try {
        return git("show", `${head}:${KIT}gallery.tsx`);
      } catch {
        return "";
      }
    })();
/** name -> the file under site/app/components/ the gallery imports it from (sibling folders of kit/ only). */
const galleryImports = (src) => {
  const out = new Map();
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']\.\.\/([\w./-]+)["']/g)) {
    if (m[2].startsWith(".")) continue;
    for (const part of m[1].split(",")) {
      const n = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop();
      if (/^[A-Z]/.test(n)) out.set(n, `site/app/components/${m[2]}`);
    }
  }
  return out;
};
/**
 * A component's definition on one line: `function X(`, or `const X =` (with a type, `const X: React.FC<P> =`) followed by an arrow,
 * a `function`, or `memo(`/`forwardRef(` with or without `React.` (fourth check, 2026-11-07: the typed const and `React.memo(function`
 * were not seen at all).
 */
const COMPONENT_DEF = [
  /^\s*(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w*)\s*[(<]/,
  /^\s*(?:export\s+)?const\s+([A-Z]\w*)\s*(?::\s*[^=]+?)?=\s*(?:\(|<|async\b|function\b|(?:React\.)?(?:memo|forwardRef)\s*(?:<[^(]*>)?\()/,
];
/**
 * What a new component definition is: null (a page, the kit, or a shared piece the gallery shows, in its own file), "copy" (a kit
 * piece's name, or a gallery-shown piece's name defined in any file but the one the gallery imports it from) or "one-off".
 */
const componentKind = (file, code, kit, imported) => {
  const comp = COMPONENT_DEF.map((re) => re.exec(code)).find(Boolean);
  if (!comp || file.startsWith(KIT)) return null;
  const name = comp[1];
  if (file.includes("/routes/") && /default\s+function/.test(code)) return null;
  if (kit.has(name)) return { name, kind: "copy" };
  const from = imported.get(name);
  if (from) return file.replace(/\.tsx?$/, "") === from ? null : { name, kind: "copy" };
  return { name, kind: "one-off" };
};
const checks = [
  { group: "Hand-styled pill (kit: ChoiceChips, or the pill list)", test: (t) => /\b(sec-chip|a-chip)\b/.test(t) || (/rounded-full/.test(t) && /\bborder\b/.test(t) && /\bpx-[34]/.test(t)) },
  { group: "Hand-styled card (kit: Card)", test: (t) => /\bbg-card\b/.test(t) && /\bborder\b/.test(t) && /\brounded-(lg|xl)\b/.test(t) },
  { group: "Raw number or text input (kit: NumberField, RangeField, PercentField)", test: (t) => /<input\b/.test(t) && !/type="(checkbox|radio|range|hidden)"/.test(t) },
  { group: "Raw select (no kit piece yet: a second one means promote)", test: (t) => /<select\b/.test(t) },
  { group: "Stat grid (kit: StatRow, KeyValueList)", test: (t) => /<dl\b[^>]*className="[^"]*\bgrid\b/.test(t) },
  { group: "Literal colour (use a role token)", test: (t) => /(fill|stroke|color|background|bg-\[|text-\[|border-\[)[^"'`]*#[0-9a-fA-F]{3,8}\b/.test(t) || /\b(oklch|rgba?|hsla?)\(/.test(t) },
  { group: "Import of the old ui.tsx (import from components/kit)", test: (t) => /from\s+["'](\.\.?\/)+(components\/)?ui["']/.test(t) },
  // From the criticism look-back (2026-11-06): rules a script cannot judge alone, so the lead looks at each new instance.
  { group: "Chart legend added (design-system 12, rule 3: said once; a legend only for marks that carry no label of their own, one above a list and never one per row)", test: (t) => /<ChartLegend\b/.test(t) },
  { group: "Caution mark added (design-system 3.2: only where there is a doubt, once per list, never on an explanation)", test: (t) => /<IconAlert\b|tone=["']caution["']|<StaleSaid\b/.test(t) },
  // The text pieces the kit shares (kit ratchets in kit/ratchets.test.ts count what is left on the site; these catch a new copy).
  { group: "Page title written by hand (kit: PageHead)", test: (t) => /<h1\b/.test(t) },
  { group: "Section heading written by hand (kit: Section)", test: (t) => /<h[23]\b[^>]*\btext-xl lg:text-2xl\b/.test(t) },
  { group: "Scroll margin written by hand (kit: the anchor-target utility, or Section's id)", test: (t) => /(?<![\w:-])scroll-mt-|\bscrollMarginTop\s*:/.test(t) },
  { group: "Link within the site styled by hand (kit: TextLink, GoLink, LinkButton)", test: (t) => /<(Nav)?Link\b[^>]*\btext-(link|primary)\b/.test(t) },
  { group: "Link out written by hand (kit: DocLink, with source or href)", test: (t) => /\btarget=(?:"_blank"|\{\s*"_blank"\s*\})/.test(t) },
  { group: "A ! override of a class (kit: the piece's own prop; a choice it lacks is added to the kit)", test: (t) => /[cC]lassName\b/.test(t) && [...t.matchAll(/"([^"]*)"|`([^`]*)`|'([^']*)'/g)].some((m) => (m[1] ?? m[2] ?? m[3] ?? "").split(/\s+/).some((w) => /^(?:[^\s:]+:)*![a-z]/.test(w) || /[\w\]]!$/.test(w))) },
  { group: "Media query asked by hand (kit: useMedia with MQ.md, MQ.lg, MQ.xl in lib/hooks.ts)", test: (t, file) => file !== "site/app/lib/hooks.ts" && /\bmatchMedia\((?!\s*["'`]\(prefers-reduced-motion)/.test(t) },
  { group: "Fold label painted as a link (kit: Disclosure look=\"link\")", test: (t) => /<Disclosure\b.*\btext-(link|primary)\b/.test(t) },
  { group: "A bare \"מס\" in new words (copy.md 1, the exact word: income tax or capital gains tax)", test: (t) => /(?<![\u0590-\u05FF])מס(?![\u0590-\u05FF])(?!\s+(ה?הכנסה|רווחי ה?הון|ה?שבח|בולי|ירושה|על רווחי ה?הון))/.test(t) },
];

if (SELF_CHECK) {
  const kit = new Set(["Button", "Tag", "Card", "Callout"]);
  const imported = galleryImports('import { IdRef, ReadingTag, type Foo } from "../provenance";\nimport { fmt } from "../../lib/format";\nimport { Button } from "./index";');
  const cases = [
    ["site/app/routes/goal-compare.tsx", "function Button({ children }) {", "copy"],
    ["site/app/components/exposure-mode/result.tsx", "export const Card = (props) => null;", "copy"],
    ["site/app/components/provenance.tsx", "export function Button() {", "copy"],
    ["site/app/components/provenance.tsx", "export function ReadingTag() {", null],
    ["site/app/components/compare/rows.tsx", "function ReadingTag() {", "copy"],
    ["site/app/components/goal/fake.tsx", "export const ReadingTag = () => null;", "copy"],
    ["site/app/components/goal/fake.tsx", "export const Card: React.FC<{ a: number }> = (p) => null;", "copy"],
    ["site/app/components/goal/fake.tsx", "export const Callout = React.memo(function Callout() {", "copy"],
    ["site/app/components/goal/fake.tsx", "const Tag = memo<Props>((p) => null);", "copy"],
    ["site/app/components/goal/fake.tsx", "export const Panel: FC<PanelProps> = function Panel(p) {", "one-off"],
    ["site/app/components/goal/fake.tsx", "const Widget = React.forwardRef((p, ref) => null);", "one-off"],
    ["site/app/components/goal/fake.tsx", "const Cell = <T,>(p: { v: T }) => null;", "one-off"],
    ["site/app/components/goal/fake.tsx", "const MAX_ROWS: number = 4;", null],
    ["site/app/components/goal/fake.tsx", "const Names = names.map((n) => n.trim());", null],
    ["site/app/components/guide/sections.tsx", "export function BlockedGroups({ groups }) {", "one-off"],
    ["site/app/components/kit/button.tsx", "export function Button() {", null],
    ["site/app/routes/guide.tsx", "export default function Guide() {", null],
  ];
  const bad = cases.filter(([f, c, want]) => (componentKind(f, c, kit, imported)?.kind ?? null) !== want);
  for (const [f, c, want] of bad) console.error(`self-check: ${f}: ${c} gave ${componentKind(f, c, kit, imported)?.kind ?? null}, want ${want}`);
  // each text-piece check sees its planted copy on an added line, and not the shared piece
  const lineCases = [
    ["Page title", '<h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>', '<PageHead title={copy.title} />'],
    ["Section heading", '<h2 id="x-h" className="text-xl lg:text-2xl font-semibold">', '<h2 className="text-lg font-semibold">'],
    ["Scroll margin", '<li id={id} className="scroll-mt-24">', '<li id={id} className="anchor-target">'],
    ["Link within the site", '<Link to="/a" className="text-link hover:underline">', '<TextLink to="/a">'],
    ["Link out", '<a href={href} target="_blank" rel="noopener noreferrer">', '<DocLink source={doc}>'],
    ["A ! override", '<Button variant="quiet" className="!px-0" onClick={go}>', '<Button variant="quiet" flush className={cx(!open && "hidden")}>'],
    ["Media query", 'const m = window.matchMedia("(min-width: 64rem)");', 'const still = matchMedia("(prefers-reduced-motion: reduce)").matches;'],
    ["Fold label", '<Disclosure label={<span className="text-link">{x}</span>}>', '<Disclosure look="link" label={x}>'],
  ];
  const lineBad = lineCases.flatMap(([prefix, copy, shared]) => {
    const c = checks.find((x) => x.group.startsWith(prefix));
    const file = "site/app/routes/a.tsx";
    return !c ? [`${prefix}: no such check`] : [...(c.test(copy, file) ? [] : [`${prefix}: missed ${copy}`]), ...(c.test(shared, file) ? [`${prefix}: flagged ${shared}`] : [])];
  });
  for (const b of lineBad) console.error(`self-check: ${b}`);
  const failed = bad.length + lineBad.length;
  console.log(failed ? `self-check failed (${failed})` : `self-check passed (${cases.length + lineCases.length * 2} cases)`);
  process.exit(failed ? 1 : 0);
}
const shownInGallery = galleryImports(gallery);

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


const lines = addedLines();
for (const { file, line, text } of lines) {
  if (!file || !/\.(tsx|ts)$/.test(file) || /\.test\.tsx?$/.test(file)) continue;
  const inKit = file.startsWith(KIT);
  const code = withoutComment(text);
  if (!code.trim()) continue;
  const where = `${file}:${line}`;
  const comp = componentKind(file, code, kitNames, shownInGallery);
  if (comp) note(comp.kind === "copy" ? "New component with a kit piece's name (likely a copy)" : "New component outside the kit (one-off, or promote?)", where, comp.name);
  if (inKit) continue;
  for (const c of checks) if (c.test(code, file)) note(c.group, where, code.trim().slice(0, 110));
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
