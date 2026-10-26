// node serve.mjs <dir> <port>: serves <dir> under /finance-tool/ (the pre-rendered build).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const [dir, port] = [process.argv[2], Number(process.argv[3] || 4231)];
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".data": "text/x-script", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain" };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!p.startsWith("/finance-tool")) { res.writeHead(404).end(); return; }
  p = p.slice("/finance-tool".length) || "/";
  let f = path.join(dir, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  else if (!fs.existsSync(f) && fs.existsSync(f + "/index.html")) f += "/index.html";
  if (!fs.existsSync(f)) { res.writeHead(404).end("nf"); return; }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1", () => console.log("serving", dir, port));
