// The library of planted problems (variants/planted/, planted.md): list it, check that every plant reaches the screen,
// and write a panel run file for it.
//
//   node research/user-lab/tools/planted.mjs list
//   node research/user-lab/tools/planted.mjs check [<out-folder>] [--only <id-part>]
//   node research/user-lab/tools/planted.mjs run <run.json> --personas a,b [--split score|tune|all] [--kinds p01,p03]
//        [--no-controls] [--repeat 3]
//
// check: every instance and every control, captured screen by screen on its device (the shots step, no session, free).
//   An instance passes when every change showed on at least one screenshot; a control passes when its pictures were taken.
//   Writes <out>/<id>/page-N.png, <out>/<id>/variant-log.json and <out>/check.md. Browser-mode instances are captured in
//   their opening state; what they plant shows only when the session acts (pressing, typing), which check cannot see.
// run: one task per instance (and per control, unless --no-controls), each on its own variant, page, device and steps,
//   with findings asked for. The grading key stays in the variant (plants), which the panel copies into <out>/variants/;
//   it never reaches a session.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { capture, VARIANTS } from "./lib/variant.mjs";

const LIB = join(VARIANTS, "planted");
const TASKS = JSON.parse(readFileSync(join(LIB, "tasks.json"), "utf8"));

const args = process.argv.slice(2);
const opt = (name, d = null) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return d;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};

export function library() {
  return readdirSync(LIB)
    .filter((d) => existsSync(join(LIB, d, "variant.json")))
    .map((d) => ({ dir: d, ...JSON.parse(readFileSync(join(LIB, d, "variant.json"), "utf8")) }));
}

const cmd = args.shift();
const all = library();
const instances = all.filter((v) => v.purpose === "plant");
const controls = all.filter((v) => v.purpose === "control");

if (cmd === "list") {
  const kinds = [...new Set(instances.map((v) => v.instance.kind))].sort();
  for (const k of kinds) {
    const mine = instances.filter((v) => v.instance.kind === k);
    console.log(`${k}  ${mine.length} instances`);
    for (const v of mine) console.log(`    ${v.id.padEnd(30)} ${v.instance.device.padEnd(5)} ${v.instance.mode.padEnd(7)} ${v.instance.split.padEnd(5)} control ${v.instance.control}`);
  }
  console.log(`\n${kinds.length} kinds, ${instances.length} instances, ${controls.length} controls`);
} else if (cmd === "check") {
  const out = resolve(args[0] || join(LIB, "..", "..", "runs", "planted-check"));
  const only = opt("only");
  mkdirSync(out, { recursive: true });
  const rows = [];
  for (const v of [...instances, ...controls].filter((v) => !only || v.id.includes(only))) {
    const t0 = Date.now();
    let row;
    try {
      const r = await capture({ url: v.instance.url, device: v.instance.device, steps: v.instance.steps || [], variant: join(LIB, v.dir), out: join(out, v.id), prefix: "page", log: join(out, v.id, "variant-log.jsonl") });
      if (r.summary) writeFileSync(join(out, v.id, "variant-log.json"), JSON.stringify(r.summary, null, 2));
      const never = r.summary ? r.summary.neverShown : [];
      const errors = r.summary ? r.summary.errors : [];
      row = { id: v.id, purpose: v.purpose, shots: r.names.length, never, errors, ok: r.names.length > 0 && !never.length && !errors.length };
    } catch (e) {
      row = { id: v.id, purpose: v.purpose, shots: 0, never: [], errors: [String(e.message).split("\n")[0]], ok: false };
    }
    rows.push(row);
    console.log(`${row.ok ? "ok  " : "FAIL"} ${v.id}: ${row.shots} screens${row.never.length ? `, NEVER SHOWN ${row.never.join(", ")}` : ""}${row.errors.length ? `, errors: ${row.errors.join("; ")}` : ""} (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  const md = [
    `# Planted library check, ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
    "",
    `${rows.filter((r) => r.ok).length} of ${rows.length} passed. Pictures: \`<id>/page-N.png\`.`,
    "",
    "| Variant | Kind | Screens | Never shown | Errors |",
    "|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.id} | ${r.purpose} | ${r.shots} | ${r.never.join(", ")} | ${r.errors.join("; ")} |`),
    "",
  ].join("\n");
  writeFileSync(join(out, "check.md"), md);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
} else if (cmd === "run") {
  const file = args[0];
  const personas = (opt("personas") || "").split(",").filter(Boolean);
  const split = opt("split", "score");
  const kinds = (opt("kinds") || "").split(",").filter(Boolean);
  const repeat = Number(opt("repeat", "1"));
  const noControls = flag("no-controls");
  if (!file || !personas.length) {
    console.error("usage: node planted.mjs run <run.json> --personas a,b [--split score|tune|all] [--kinds p01,p03] [--no-controls] [--repeat 3]");
    process.exit(2);
  }
  const chosen = instances.filter((v) => (split === "all" || v.instance.split === split) && (!kinds.length || kinds.includes(v.instance.kind)));
  const ctl = noControls ? [] : controls.filter((c) => c.instance.for.some((id) => chosen.some((v) => v.id === id)));
  const task = (v) => {
    const t = TASKS[v.instance.task];
    if (!t) throw new Error(`${v.id}: no task "${v.instance.task}" in tasks.json`);
    const base = { key: v.id, text: t.text, variant: `planted/${v.dir}`, device: v.instance.device, findings: true };
    return v.instance.mode === "browser"
      ? { ...base, start: v.instance.url, minutes: t.minutes || 10, actions: t.actions || 30 }
      : { ...base, page: v.instance.url, ...(v.instance.steps && v.instance.steps.length ? { steps: v.instance.steps } : {}) };
  };
  const run = { personas, tasks: [...chosen, ...ctl].map(task), parallel: 2, repeat };
  writeFileSync(file, JSON.stringify(run, null, 2) + "\n");
  console.log(`${file}: ${chosen.length} planted and ${ctl.length} controls, ${personas.length} personas, repeat ${repeat}: ${(chosen.length + ctl.length) * personas.length * repeat} sessions`);
} else {
  console.error("usage: node planted.mjs list | check [<out>] [--only <id-part>] | run <run.json> --personas a,b [--split score|tune|all] [--kinds ...] [--no-controls] [--repeat n]");
  process.exit(2);
}
