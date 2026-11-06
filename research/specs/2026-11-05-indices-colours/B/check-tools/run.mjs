import { execFileSync } from "node:child_process";
import { hx } from "./ok.mjs";
const V = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const card = hx("neutral-950"), pop = hx("neutral-900"), tint = "#222927";
const fee = ["orange-500", "gold-200", "rose-300", "magenta-400", "neutral-500"];
const kinds = ["lime-300", "olive-500", "brown-600", "magenta-400"];
const runs = [
  ["Account fee bar + legend (card)", fee, card, "all"],
  ["Account fee bar on picked-row tint", fee, tint, "all"],
  ["Own-price sheet bars + legend (popover)", fee, pop, "all"],
  ["Israeli index (no fx): fee bar", ["orange-500", "gold-200", "rose-300", "neutral-500"], card, "all"],
  ["Dot plot kinds + legend", kinds, card, "all"],
  ["Dot plot + white ring/outline", [...kinds, "neutral-100"], card, "all"],
  ["Result card strips as designer fed (no magenta)", ["lime-300", "olive-500", "brown-600", "neutral-700", "neutral-100"], card, "all"],
  ["Result card strips WITH abroad ticks (magenta)", [...kinds, "neutral-700", "neutral-100"], card, "all"],
  ["Fund chips text: neutral fg, caution amber-300, open red-500 (on card)", ["neutral-100", "amber-300", "red-500"], card, "all"],
  ["Account-row chips + fund chips incl. muted-fg words", ["neutral-100", "neutral-300", "amber-300", "red-500"], card, "all"],
  ["Period strip as ordinal", ["neutral-200", "neutral-300", "neutral-400"], pop, "ordinal"],
  ["Period strip as categorical adjacent", ["neutral-200", "neutral-300", "neutral-400"], pop, "adjacent"],
  ["Dollar section: unhedged solid vs dollar dim/bright (neighbouring charts)", ["neutral-300", "neutral-100"], card, "all"],
  ["Kit gallery cost stack line 1109 (trade,custody,fixed,fund,tax)", ["orange-500", "gold-200", "rose-300", "green-300", "rose-600"], card, "all"],
  ["Kit gallery cost stack lines 1119-1121 (trade,custody,fixed)", ["orange-500", "gold-200", "rose-300"], card, "all"],
  ["Kit gallery fee stack 1318-1321 (trade,custody,fixed,other)", ["orange-500", "gold-200", "rose-300", "neutral-500"], card, "all"],
];
const out = [];
for (const [name, steps, surf, pairs] of runs) {
  const hexes = steps.map(hx).join(",");
  const args = [V, hexes, "--mode", "dark", "--surface", surf];
  if (pairs === "all") args.push("--pairs", "all");
  if (pairs === "ordinal") args.push("--ordinal");
  let txt, code = 0;
  try { txt = execFileSync("node", args, { encoding: "utf8" }); } catch (e) { txt = (e.stdout || "") + (e.stderr || ""); code = e.status; }
  out.push(`\n=== ${name}\nsteps: ${steps.join(", ")}\nhexes: ${hexes}  surface ${surf}  pairs ${pairs}  exit ${code}\n${txt}`);
}
console.log(out.join("\n"));
