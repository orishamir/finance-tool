// Fresh readers: each runs as its own Claude session in an empty folder outside the repository, with no project
// instructions, no memory, no skills and no tool servers, and may only read the screenshots it is given (founder,
// 2026-11-05: "make sure the reviewers have no access to our conventions and rules ... make sure they see the entire
// picture with context, not just the text itself"). Their reports are combined with the site's rules afterwards.
//
// Usage (from the repository root; needs the command line signed in: `claude auth status`):
//   node tools/fresh-reader.mjs <brief.json> <out-folder>
// brief.json: { "task": "...words every reader gets...", "readers": [ { "key": "new-phone", "who": "You are 24 ...",
//   "shots": ["path/a.png", ...] }, ... ], "model": "optional model id" }
// Each reader's answer is written to <out-folder>/<key>.md; nothing else is shared between readers.
import { spawn } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const [briefPath, outDir] = process.argv.slice(2);
if (!briefPath || !outDir) {
  console.error("usage: node fresh-reader.mjs <brief.json> <out-folder>");
  process.exit(2);
}
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
mkdirSync(outDir, { recursive: true });
const base = "/tmp/claude-1000/fresh-readers";
mkdirSync(base, { recursive: true });

function run(reader) {
  // an empty folder per reader, holding only its screenshots, numbered in reading order
  const dir = mkdtempSync(join(base, `${reader.key}-`));
  const names = reader.shots.map((p, i) => {
    const name = `${String(i + 1).padStart(2, "0")}-${basename(p)}`;
    copyFileSync(resolve(p), join(dir, name));
    return name;
  });
  const prompt = `${reader.who}\n\n${brief.task}\n\nThe screenshots are in this folder, in reading order, top of the page first: ${names.join(", ")}. Read every one of them before you answer. Read nothing else.`;
  const args = ["-p", prompt, "--allowedTools", "Read", "--disable-slash-commands", "--strict-mcp-config", "--output-format", "text"];
  if (brief.model) args.push("--model", brief.model);
  // a clean environment: nothing of the calling session (its settings, its project) reaches the reader
  const env = { HOME: process.env.HOME, PATH: process.env.PATH, TERM: "xterm", LANG: "C.UTF-8" };
  return new Promise((done) => {
    const child = spawn("claude", args, { cwd: dir, env });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      const text = `# ${reader.key}\n\nWho: ${reader.who}\n\nShots: ${reader.shots.join(", ")}\n\n${out.trim() || `(no answer; exit ${code}) ${err.trim()}`}\n`;
      writeFileSync(join(outDir, `${reader.key}.md`), text);
      console.log(`${reader.key}: ${code === 0 ? "done" : `exit ${code}`}`);
      done();
    });
  });
}

await Promise.all(brief.readers.map(run));
