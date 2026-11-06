// One isolated Claude session: `claude -p` in an empty folder outside the repository, with a clean environment and every
// source of our project's context switched off. Used by panel.mjs and canary.mjs. See ../isolation.md for the proof.
import { spawn, spawnSync } from "node:child_process";
import { createWriteStream, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// sessions live here: outside the repository, under a neutral name (the folder's path is the only place a session sees)
export const EMAIL = /[\w.+-]+@[\w-]+\.[a-z][\w.]*/gi;

export const SESSION_BASE = "/tmp/claude-1000/ws";

export function sessionDir() {
  mkdirSync(SESSION_BASE, { recursive: true });
  return mkdtempSync(join(SESSION_BASE, "s-"));
}

// nothing of the calling session reaches the child: no CLAUDE_* variables, no project path, no editor or sandbox hints
export function cleanEnv(extra = {}) {
  return { HOME: process.env.HOME, PATH: process.env.PATH, TERM: "xterm", LANG: "C.UTF-8", ...extra };
}

// the flags that keep a session blind to our project, each one load-bearing (isolation.md says what each removes)
export function isolationFlags({ bash = false, noTools = false } = {}) {
  const settings = {
    permissions: {
      // belt and braces: --restricted already confines the file tools to the session's folder
      deny: ["Read(//home/**)", "Read(~/**)", "Read(//mnt/**)", "Read(//etc/**)", "Read(//root/**)", "Read(//proc/**)"],
    },
  };
  return [
    "--safe-mode", // no CLAUDE.md (project or user), skills, plugins, hooks, MCP servers, custom agents, output styles
    "--restricted", // ignores user, project and local settings; file tools only inside the working folder; no Bash unless named
    "--setting-sources",
    "",
    "--strict-mcp-config", // no MCP servers at all (none is passed)
    "--disable-slash-commands", // no skills or commands
    "--no-session-persistence", // nothing saved to ~/.claude/projects, so no later session can find it
    "--permission-mode",
    "dontAsk", // anything not allowed below is refused, never asked
    "--tools",
    noTools ? "" : bash ? "Read,Bash" : "Read",
    ...(noTools ? [] : ["--allowedTools", bash ? "Read,Bash(node act.mjs *),Bash(node act.mjs)" : "Read"]),
    "--settings",
    JSON.stringify(settings),
  ];
}

/**
 * Run one session. Streams its events to `transcriptPath` (one JSON per line) and resolves with
 * { result, init, events, code, timedOut, ms }.
 */
export function runSession({ dir, prompt, system, bash = false, noTools = false, schema, model, effort, timeoutMs = 15 * 60 * 1000, transcriptPath, env = {} }) {
  const args = ["-p", prompt, ...isolationFlags({ bash, noTools }), "--output-format", "stream-json", "--verbose"];
  if (system) args.push("--system-prompt", system);
  if (schema) args.push("--json-schema", JSON.stringify(schema));
  if (model) args.push("--model", model);
  if (effort) args.push("--effort", effort);
  const t0 = Date.now();
  return new Promise((resolve) => {
    const child = spawn("claude", args, { cwd: dir, env: cleanEnv(env), stdio: ["ignore", "pipe", "pipe"] });
    const out = transcriptPath ? createWriteStream(transcriptPath) : null;
    const events = [];
    let buf = "",
      err = "",
      timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000).unref();
    }, timeoutMs);
    child.stdout.on("data", (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let ev = null;
        try {
          ev = JSON.parse(line);
          events.push(ev);
        } catch {}
        // the signed-in account's email can surface in a session (isolation.md); it never reaches a saved file, and
        // neither do the images it read (they are the screenshots saved beside the transcript)
        out?.write((ev ? JSON.stringify(withoutImages(ev)) : line).replace(EMAIL, "<email>") + "\n");
      }
    });
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      clearTimeout(timer);
      out?.end();
      const result = events.findLast?.((e) => e.type === "result") ?? [...events].reverse().find((e) => e.type === "result");
      const init = events.find((e) => e.type === "system" && e.subtype === "init");
      resolve({ result, init, events, code, timedOut, stderr: err.trim(), ms: Date.now() - t0 });
    });
  });
}

// a copy of an event with every image's bytes left out
export function withoutImages(ev) {
  return JSON.parse(
    JSON.stringify(ev, (k, v) => {
      if (k === "base64" && typeof v === "string") return `<${v.length} bytes of image left out>`;
      if (v && typeof v === "object" && v.type === "base64" && typeof v.data === "string") return { ...v, data: `<${v.data.length} bytes of image left out>` };
      return v;
    }),
  );
}

// the measured cost of a session, from its result event
export function costOf(r) {
  const u = r.result?.usage || {};
  return {
    ms: r.ms,
    turns: r.result?.num_turns ?? null,
    usd: r.result?.total_cost_usd ?? null,
    input: u.input_tokens ?? 0,
    cacheWrite: u.cache_creation_input_tokens ?? 0,
    cacheRead: u.cache_read_input_tokens ?? 0,
    output: u.output_tokens ?? 0,
    model: r.init?.model ?? null,
  };
}

// puts the browser command in a session's folder, without the machine's paths in it (the session's shell gets them from
// its environment); returns that environment
export const PLAYWRIGHT = "/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/";
export const CHROME = "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome";
// The lab's own lines of act.mjs (between "// lab:begin" and "// lab:end": variants, and the shots step's commands) are
// cut out of the session's copy, so nothing it can read says the page could be changed.
export function sessionAct() {
  const src = readFileSync(new URL("../act.mjs", import.meta.url), "utf8")
    .replace(/^[ \t]*\/\/ lab:begin\n[\s\S]*?^[ \t]*\/\/ lab:end\n/gm, "")
    .replace(PLAYWRIGHT, "")
    .replace(CHROME, "");
  if (/labTools|ACT_LAB|ACT_VARIANT|x-lab|variant|hook/i.test(src)) throw new Error("act.mjs: a lab line is outside the lab:begin/lab:end markers");
  return src;
}
export function installAct(dir, config = {}) {
  writeFileSync(join(dir, "act.mjs"), sessionAct());
  writeFileSync(join(dir, "act-config.json"), JSON.stringify(config));
  return { ACT_PLAYWRIGHT: PLAYWRIGHT, ACT_CHROME: CHROME };
}

// closes the browser a session started (if it started one)
export function closeAct(dir, env) {
  spawnSync(process.execPath, ["act.mjs", "__quit"], { cwd: dir, env: { ...process.env, ...env }, timeout: 15000 });
}
