// Serves site/build/client under /finance-tool/ on port 4236 (the GitHub Pages layout), for the on-screen check.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../../../../site/build/client/", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".data": "text/x-script" };
createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (!url.startsWith("/finance-tool")) { res.writeHead(302, { location: "/finance-tool/" }); return res.end(); }
  let p = normalize(join(dir, url.slice("/finance-tool".length)));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  if (!existsSync(p)) p = join(dir, "404.html");
  res.writeHead(200, { "content-type": types[extname(p)] ?? "application/octet-stream" });
  res.end(readFileSync(p));
}).listen(4236, "127.0.0.1", () => console.log("serving on 4236"));
