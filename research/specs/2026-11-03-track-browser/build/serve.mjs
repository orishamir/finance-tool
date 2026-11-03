// A static server for site/build/client under /finance-tool/, as GitHub Pages serves it (404.html for a path with no file).
//   node research/specs/2026-11-03-track-browser/build/serve.mjs [port]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const root = new URL("../../../../site/build/client/", import.meta.url).pathname;
const port = Number(process.argv[2] ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".data": "text/x-script", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (!url.startsWith("/finance-tool/") && url !== "/finance-tool") {
    res.writeHead(302, { location: "/finance-tool/" });
    res.end();
    return;
  }
  let file = join(root, url.slice("/finance-tool".length));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  let status = 200;
  if (!existsSync(file)) {
    file = join(root, "404.html");
    status = 404;
  }
  res.writeHead(status, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => console.log(`http://127.0.0.1:${port}/finance-tool/`));
