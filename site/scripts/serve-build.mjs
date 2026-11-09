// Serves a build of the site the way GitHub Pages serves the live one, so a variant's "build" can point the whole site at
// it: a branch's or a worktree's `site/build/client` at http://127.0.0.1:<port>/finance-tool/.
//
//   node site/scripts/serve-build.mjs [build-folder] [--port 4173]
//
// Default folder: site/build/client of this checkout. Build a branch first, for example:
//   git worktree add /tmp/claude-1000/wt-x <branch> && cd /tmp/claude-1000/wt-x && npm ci && npm run build -w site
// A folder path is answered with its index.html, a path without its last slash is sent to it with a 301 (as Pages does),
// and an unknown path gets 404.html with status 404 (the site's own fallback).
import { existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".data": "text/x-script",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};

/** Starts the server; resolves with { port, url, close, hits }. */
export function serveBuild(folder, { port = 0, base = "/finance-tool/" } = {}) {
  const root = resolve(folder);
  if (!existsSync(join(root, "index.html")) && !existsSync(join(root, "404.html"))) throw new Error(`not a site build: ${root}`);
  const hits = { n: 0 };
  const server = http.createServer((req, res) => {
    hits.n += 1;
    const [rawPath, query] = req.url.split("?");
    const path = decodeURIComponent(rawPath);
    if (!path.startsWith(base)) return res.writeHead(404).end();
    const rel = path.slice(base.length);
    let f = join(root, rel);
    if (!f.startsWith(root)) return res.writeHead(403).end();
    if (existsSync(f) && statSync(f).isDirectory()) {
      if (!path.endsWith("/")) return res.writeHead(301, { location: `${rawPath}/${query === undefined ? "" : `?${query}`}` }).end();
      f = join(f, "index.html");
    }
    if (!existsSync(f) || statSync(f).isDirectory()) {
      const nf = join(root, "404.html");
      return res.writeHead(404, { "content-type": TYPES[".html"] }).end(existsSync(nf) ? readFileSync(nf) : "");
    }
    // the build's assets/ are named by their content, so a browser keeps them across pages (the checks open hundreds of pages, each
    // fetching every script again before 2026-11-08); a page and its .data are always fetched afresh
    const cache = rel.startsWith("assets/") ? "public, max-age=31536000, immutable" : "no-cache";
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream", "cache-control": cache }).end(readFileSync(f));
  });
  return new Promise((ok) =>
    server.listen(port, "127.0.0.1", () => {
      const p = server.address().port;
      ok({ port: p, url: `http://127.0.0.1:${p}${base}`, hits, close: () => new Promise((r) => server.close(r)) });
    }),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const pi = args.indexOf("--port");
  const port = pi >= 0 ? Number(args.splice(pi, 2)[1]) : 4173;
  const folder = args[0] || resolve(fileURLToPath(import.meta.url), "..", "..", "..", "site", "build", "client");
  const s = await serveBuild(folder, { port });
  console.log(`serving ${resolve(folder)} at ${s.url} (a variant's "build": "${s.url}"); Ctrl+C to stop`);
}
