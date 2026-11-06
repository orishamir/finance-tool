// The shots step: a page of the site (live, or a variant of it) as a person would see it scrolling down, one screenshot
// per screen, top first, ready to give to a shots-mode session.
//
//   node research/user-lab/tools/shots.mjs <url> <out-folder> [--device pc|phone] [--variant <id>] [--steps <steps.json>]
//        [--prefix page]
//
// --steps is a JSON list of act.mjs commands run before the screenshots, e.g. [["fill","הפקדה חודשית","500"],
// ["slider","שנים","20"]]. With --variant, the variant's changes are on the page and <out>/variant-log.json says, per
// change, on how many screenshots it showed; a change that never showed is reported and the command exits with 3.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { capture } from "./lib/variant.mjs";

const args = process.argv.slice(2);
const opt = (name, d = null) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const device = opt("device", "pc");
const variant = opt("variant");
const stepsFile = opt("steps");
const prefix = opt("prefix", "page");
const [url, out] = args;
if (!url || !out) {
  console.error("usage: node shots.mjs <url> <out-folder> [--device pc|phone] [--variant <id>] [--steps steps.json] [--prefix page]");
  process.exit(2);
}
const steps = stepsFile ? JSON.parse(readFileSync(stepsFile, "utf8")) : [];
const r = await capture({ url, device, steps, variant, out: resolve(out), prefix, log: variant ? resolve(out, "variant-log.jsonl") : null });
console.log(`${r.names.length} screenshots in ${resolve(out)}: ${r.names.join(", ")}`);
if (r.summary) {
  writeFileSync(join(resolve(out), "variant-log.json"), JSON.stringify(r.summary, null, 2));
  for (const c of r.summary.changes) console.log(`  ${c.id} (${c.type}): showed on ${c.applied} of ${c.shots || r.summary.screenshots} screenshots, at most ${c.most} places`);
  if (r.summary.errors.length) console.log(`  errors: ${r.summary.errors.join("; ")}`);
  if (r.summary.neverShown.length) {
    console.log(`  NEVER SHOWN: ${r.summary.neverShown.join(", ")}`);
    process.exit(3);
  }
}
