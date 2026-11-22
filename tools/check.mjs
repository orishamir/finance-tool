// npm run check: everything that must pass before the site goes live (CLAUDE.md), in two rounds.
// Round 1 runs side by side: the typecheck, the tests and the data check beside the site build, which takes longest. The deep tests
// (vitest.config.ts) run after the fast ones, in the same lane, so two test runs never hold the data in their workers at once.
// Round 2 opens the built site in a browser: the chart check, the layout check, then the policy check (one after the other, so two
// browsers' tabs never run at once on a machine shared with other builds). Each command's output is printed when it
// ends; the check fails if any command fails, and round 2 does not start when round 1 failed.
import { spawn } from "node:child_process";

const run = (script) =>
  new Promise((done) => {
    const t0 = Date.now();
    const child = spawn("npm", ["run", "-s", script], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => {
      const s = ((Date.now() - t0) / 1000).toFixed(0);
      process.stdout.write(`\n── ${script}: ${code === 0 ? "passed" : `FAILED (exit ${code})`}, ${s} s\n${out}`);
      done(code === 0);
    });
  });

/** Scripts run one after the other, stopping at the first that fails. */
const lane = async (...scripts) => {
  for (const script of scripts) if (!(await run(script))) return false;
  return true;
};

const t0 = Date.now();
const first = await Promise.all([run("typecheck"), lane("test", "test:deep"), run("validate"), run("build")]);
let ok = first.every(Boolean);
if (ok) for (const script of ["chart-check", "layout-check", "csp-check"]) ok = (await run(script)) && ok;
console.log(`\n${ok ? "check passed" : "check FAILED"} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(ok ? 0 : 1);
