// Whether a change kept the built site the same: compares two builds' pages, data files and bundles, file by file.
// Usage (from the repo root): copy the build before the change, rebuild, then
//   cp -r site/build <scratch>/before && <change> && npm run build && node tools/build-diff.mjs <scratch>/before [site/build]
// Asset file hashes and module-preload links are masked (they change with any code change). A React Router `.data` file
// that differs as text is decoded and compared as data, key order ignored. Exits 1 when anything else differs.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const [before, after = "site/build"] = process.argv.slice(2);
if (!before || !existsSync(join(before, "client"))) {
  console.error("usage: node tools/build-diff.mjs <build before> [build after, default site/build]");
  process.exit(2);
}
const clientOf = (b) => join(b, "client");
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = (root) => walk(root).map((f) => relative(root, f)).filter((f) => !f.split("/").includes("assets")).sort();
const mask = (s) =>
  s
    .replace(/<link rel="modulepreload" href="[^"]*"\/>/g, "")
    .replace(/"\/[\w-]+\/assets\/[^"]*\.js",?/g, "")
    .replace(/([\w.-]+)-[A-Za-z0-9_-]{8}\.(js|css|woff2|map)/g, "$1-HASH.$2");

const turbo = await import(resolve("node_modules/react-router/dist/production/vendor/turbo-stream-v2/turbo-stream.js"));
const decode = async (text) => {
  const stream = new ReadableStream({ start: (c) => (c.enqueue(new TextEncoder().encode(text)), c.close()) });
  const r = await turbo.decode(stream, { plugins: [] });
  await r.done;
  return r.value;
};
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const sameData = async (a, b) => JSON.stringify(canon(await decode(a))) === JSON.stringify(canon(await decode(b)));
const markup = (s) => mask(s.replace(/<script[\s\S]*?<\/script>/g, ""));

const [a, b] = [clientOf(before), clientOf(after)];
const la = pages(a);
const lb = new Set(pages(b));
const problems = [];
for (const f of la) if (!lb.has(f)) problems.push(`only before: ${f}`);
for (const f of lb) if (!la.includes(f)) problems.push(`only after: ${f}`);
let reordered = 0;
for (const f of la.filter((x) => lb.has(x))) {
  const x = readFileSync(join(a, f), "utf8");
  const y = readFileSync(join(b, f), "utf8");
  if (mask(x) === mask(y)) continue;
  if (f.endsWith(".data") && (await sameData(x, y))) {
    reordered += 1;
    continue;
  }
  if (f.endsWith(".html") && markup(x) === markup(y)) {
    reordered += 1;
    continue;
  }
  let i = 0;
  while (i < x.length && x[i] === y[i]) i += 1;
  problems.push(`differs: ${f} at ${i}\n  before: ${JSON.stringify(x.slice(Math.max(0, i - 60), i + 100))}\n  after:  ${JSON.stringify(y.slice(Math.max(0, i - 60), i + 100))}`);
}
const jsBytes = (root) => walk(root).filter((f) => f.split("/").includes("assets") && f.endsWith(".js")).reduce((n, f) => n + statSync(f).size, 0);
console.log(`${la.length} files compared; ${reordered} with the same data or markup in another order; client JS ${jsBytes(a)} -> ${jsBytes(b)} bytes`);
for (const p of problems) console.log(p);
process.exit(problems.length ? 1 : 0);
