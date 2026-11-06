// Copy or render the drawings the founder judged into ../shots/<case>/, cut into tiles in reading order.
//   node drawings.mjs [caseId ...]       (from any folder)
// A source is "git:<commit>:<path>" (the file as it was then) or a path in the repository as it is now.
// A drawing that was a working page (.html, with the files beside it in "with") is served and photographed whole at 1440 px.
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, copyFileSync, mkdtempSync } from "node:fs";
import { join, basename, dirname, extname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
const { createRequire } = await import("node:module");
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const repo = "/home/ori/dev/finance-tool";
const shots = join(here, "..", "shots");
const only = process.argv.slice(2);
const all = JSON.parse(readFileSync(join(here, "drawings.json"), "utf8"));
for (const c of all) if (c.same_as) c.drawings = all.find((o) => o.case === c.same_as).drawings;
const plan = all.filter((c) => !only.length || only.includes(c.case));

const read = (src) => {
  const m = src.match(/^git:([0-9a-f]+):(.*)$/);
  return m ? execFileSync("git", ["-C", repo, "show", `${m[1]}:${m[2]}`], { maxBuffer: 1 << 28 }) : readFileSync(join(repo, src));
};
function tile(file, prefix, tileH = 1800) {
  const [w, h] = execFileSync("identify", ["-format", "%w %h", file]).toString().trim().split(" ").map(Number);
  const n = Math.max(1, Math.ceil(h / tileH));
  const out = [];
  for (let i = 0; i < n; i++) {
    const dest = `${prefix}-${String(i + 1).padStart(2, "0")}.png`;
    execFileSync("convert", [file, "-crop", `${w}x${tileH}+0+${i * tileH}`, "+repage", dest]);
    out.push(basename(dest));
  }
  return out;
}

const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const c of plan) {
  const dir = join(shots, c.case);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files = [];
  let n = 0;
  for (const d of c.drawings) {
    n++;
    const tag = String(n).padStart(2, "0") + "-" + (d.name || basename(d.src.split(":").pop(), extname(d.src)));
    if (/\.html$/.test(d.src)) {
      const tmp = mkdtempSync(join(tmpdir(), "drawing-"));
      writeFileSync(join(tmp, basename(d.src.split(":").pop())), read(d.src));
      for (const w of d.with || []) writeFileSync(join(tmp, basename(w.split(":").pop())), read(w));
      const server = createServer((req, res) => {
        const f = join(tmp, decodeURIComponent(new URL(req.url, "http://x").pathname));
        if (existsSync(f)) { res.writeHead(200, { "content-type": { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" }[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f)); }
        else { res.writeHead(404); res.end(); }
      });
      await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
      const page = await browser.newPage({ viewport: { width: d.width || 1440, height: 900 }, locale: "he-IL", colorScheme: "dark" });
      await page.goto(`http://127.0.0.1:${server.address().port}/${basename(d.src.split(":").pop())}`);
      await page.waitForLoadState("networkidle"); await page.waitForTimeout(800);
      for (const s of d.steps || []) { if (s.click) await page.getByText(s.click, { exact: true }).first().click(); if (s.eval) await page.evaluate(s.eval); await page.waitForTimeout(500); }
      const raw = join(dir, tag + ".full.png");
      await page.screenshot({ path: raw, fullPage: true });
      await page.close(); server.close(); rmSync(tmp, { recursive: true, force: true });
      files.push(...tile(raw, join(dir, tag))); rmSync(raw);
    } else {
      const raw = join(dir, tag + ".full.png");
      writeFileSync(raw, read(d.src));
      files.push(...tile(raw, join(dir, tag))); rmSync(raw);
    }
  }
  console.log(JSON.stringify({ case: c.case, files }));
}
await browser.close();
