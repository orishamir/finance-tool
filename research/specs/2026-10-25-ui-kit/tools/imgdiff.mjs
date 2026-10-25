// Pixel-compares two folders of PNGs with the same names. usage: node imgdiff.mjs <dirA> <dirB> <diffOutDir>
import { createRequire } from "node:module";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const [a, b, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const only = process.env.ONLY_COMMON === "1";
const names = readdirSync(a).filter((n) => n.endsWith(".png") && (!only || existsSync(`${b}/${n}`))).sort();
const extra = readdirSync(b).filter((n) => n.endsWith(".png") && !names.includes(n));
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage();
await page.setContent("<canvas id=c></canvas>");
let same = 0;
const diffs = [];
for (const n of names) {
  if (!existsSync(`${b}/${n}`)) { diffs.push({ n, kind: "missing-in-B" }); continue; }
  const A = readFileSync(`${a}/${n}`).toString("base64");
  const B = readFileSync(`${b}/${n}`).toString("base64");
  const r = await page.evaluate(async ([A, B]) => {
    const load = (s) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = "data:image/png;base64," + s; });
    const [ia, ib] = [await load(A), await load(B)];
    if (ia.width !== ib.width || ia.height !== ib.height) return { size: [ia.width, ia.height, ib.width, ib.height] };
    const c = document.getElementById("c");
    c.width = ia.width; c.height = ia.height;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(ia, 0, 0);
    const da = x.getImageData(0, 0, c.width, c.height);
    x.clearRect(0, 0, c.width, c.height);
    x.drawImage(ib, 0, 0);
    const db = x.getImageData(0, 0, c.width, c.height);
    let n = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    const out = x.createImageData(c.width, c.height);
    for (let i = 0; i < da.data.length; i += 4) {
      const d = Math.abs(da.data[i] - db.data[i]) + Math.abs(da.data[i + 1] - db.data[i + 1]) + Math.abs(da.data[i + 2] - db.data[i + 2]);
      const px = (i / 4) % c.width, py = Math.floor(i / 4 / c.width);
      if (d > 24) { n++; minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 60; out.data[i + 3] = 255; }
      else { out.data[i] = da.data[i] * 0.35; out.data[i + 1] = da.data[i + 1] * 0.35; out.data[i + 2] = da.data[i + 2] * 0.35; out.data[i + 3] = 255; }
    }
    if (n === 0) return { n: 0 };
    x.putImageData(out, 0, 0);
    return { n, box: [minX, minY, maxX, maxY], png: c.toDataURL("image/png").split(",")[1] };
  }, [A, B]);
  if (r.size) diffs.push({ n, kind: "size", size: r.size });
  else if (r.n === 0) same++;
  else { diffs.push({ n, kind: "pixels", count: r.n, box: r.box }); writeFileSync(`${outDir}/${n}`, Buffer.from(r.png, "base64")); }
}
await browser.close();
console.log(`identical ${same} of ${names.length}; different ${diffs.length}; only in B ${extra.length}`);
for (const d of diffs) console.log(JSON.stringify(d));
for (const e of extra) console.log("only in B", e);
