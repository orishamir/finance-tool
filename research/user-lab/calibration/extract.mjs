// Copies every case's drawings and screenshots into <out>/<case id>/, so a fresh reader can be given plain files.
// A "git:<commit>:<path>" shot is read from that commit (the drawing as the founder saw it, since replaced);
// a plain path is copied as it is; a "rebuild:<commit>:<route>" shot is listed in <out>/rebuild.txt, to be built and
// screenshotted at that commit. Files of one drawing (an HTML page with its CSS, script and data) land side by side,
// so the page renders when opened through a local server.
//
// Usage, from the repository root: node research/user-lab/calibration/extract.mjs <out-folder> [case-id ...]
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const [out, ...only] = process.argv.slice(2);
if (!out) {
  console.error("usage: node research/user-lab/calibration/extract.mjs <out-folder> [case-id ...]");
  process.exit(2);
}
const cases = readFileSync("research/user-lab/calibration/cases.jsonl", "utf8")
  .split("\n").filter(Boolean).map((l) => JSON.parse(l))
  .filter((c) => only.length === 0 || only.includes(c.id));
const rebuild = [];
for (const c of cases) {
  const dir = join(out, c.id);
  mkdirSync(dir, { recursive: true });
  c.shots.forEach((s, i) => {
    if (s.startsWith("rebuild:")) {
      const [, commit, route] = s.match(/^rebuild:([0-9a-f]+):(.*)$/);
      rebuild.push(`${c.id}\t${commit}\t${route}`);
      return;
    }
    const n = String(i + 1).padStart(2, "0");
    if (s.startsWith("git:")) {
      const [, commit, path] = s.match(/^git:([0-9a-f]+):(.*)$/);
      const name = /\.(png|jpe?g)$/.test(path) ? `${n}-${basename(path)}` : basename(path);
      writeFileSync(join(dir, name), execFileSync("git", ["show", `${commit}:${path}`], { maxBuffer: 1 << 28 }));
    } else {
      copyFileSync(s, join(dir, `${n}-${basename(s)}`));
    }
  });
}
writeFileSync(join(out, "rebuild.txt"), rebuild.join("\n") + (rebuild.length ? "\n" : ""));
console.log(`${cases.length} cases into ${out}; ${rebuild.length} screens to rebuild (rebuild.txt)`);
