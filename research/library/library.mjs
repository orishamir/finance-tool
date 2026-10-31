// The document library: a document read once is never hunted down or read whole again.
// index.jsonl (in git) holds what each document is, where it came from, its hash and where each
// topic sits. store/ (not in git: the repository is public and company documents are not ours to
// republish) holds the file and its text, one form feed between pages.
//
//   node research/library/library.mjs find <words> [--publisher X] [--all]   pages holding every word
//   node research/library/library.mjs add <url|file> --publisher X --title Y [--kind K] [--version D] [--url U]
//   node research/library/library.mjs note <id> --topic T --page N           where a topic sits
//   node research/library/library.mjs scan <folder>                          file what is already on disk
//   node research/library/library.mjs recheck [--older-than DAYS]            which links changed since read
//   node research/library/library.mjs status
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const indexPath = join(here, "index.jsonl");
const store = join(here, "store");
const today = new Date().toISOString().slice(0, 10);
const agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const load = () => (existsSync(indexPath) ? readFileSync(indexPath, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const save = (docs) => writeFileSync(indexPath, [...docs].sort((a, b) => a.id.localeCompare(b.id)).map((d) => JSON.stringify(d)).join("\n") + "\n");
const textOf = (d) => join(store, `${d.id}.txt`);
const fileOf = (d) => join(store, `${d.id}${d.ext}`);

const args = process.argv.slice(2);
const [command] = args;
const flag = (name) => {
  const at = args.indexOf(`--${name}`);
  return at < 0 ? undefined : args[at + 1];
};
const positional = args.slice(1).filter((a, k, all) => !a.startsWith("--") && !all[k - 1]?.startsWith("--"));

// A PDF with a symbol font extracts as punctuation, and a scan as nothing: say so rather than search it.
const quality = (text, pages) => {
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  const marks = text.replace(/\s/g, "").length;
  if (letters / Math.max(pages, 1) < 20) return "none";
  return letters / marks < 0.6 ? "poor" : "ok";
};

const extract = (path, ext) => {
  if (ext === ".pdf") {
    const info = spawnSync("pdfinfo", [path], { encoding: "utf8" });
    const pages = Number(info.stdout?.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0);
    const out = spawnSync("pdftotext", ["-layout", path, "-"], { encoding: "utf8", maxBuffer: 1 << 30 });
    return { text: out.status === 0 ? out.stdout : "", pages };
  }
  if (ext === ".html" || ext === ".htm") {
    const raw = readFileSync(path, "utf8").replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ");
    return { text: raw.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/[ \t]+/g, " "), pages: 1 };
  }
  return { text: "", pages: 0 };
};

const file = (docs, path, fields) => {
  const bytes = readFileSync(path);
  const id = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const have = docs.find((d) => d.id === id);
  if (have) {
    for (const [k, v] of Object.entries(fields)) if (v && !have[k]) have[k] = v;
    return have;
  }
  mkdirSync(store, { recursive: true });
  const ext = extname(path).toLowerCase() || (bytes.subarray(0, 4).toString() === "%PDF" ? ".pdf" : ".html");
  const doc = { id, ext, bytes: bytes.length, retrieved: today, ...fields };
  copyFileSync(path, fileOf(doc));
  const { text, pages } = extract(fileOf(doc), ext);
  writeFileSync(textOf(doc), text);
  doc.pages = pages;
  doc.text = quality(text, pages);
  docs.push(doc);
  return doc;
};

const fetchTo = (url, dir) => {
  const path = join(dir, basename(new URL(url).pathname) || "page.html");
  const r = spawnSync("curl", ["-sL", "--max-time", "120", "-A", agent, "-o", path, "-w", "%{http_code}", url], { encoding: "utf8" });
  return { path, status: r.stdout };
};

// Hebrew from a PDF is often stored in visual order, so each word is tried both ways.
const reversed = (w) => [...w].reverse().join("");

if (command === "find") {
  const words = positional;
  const publisher = flag("publisher");
  let shown = 0;
  let total = 0;
  for (const d of load()) {
    if (d.superseded_by && !args.includes("--all")) continue;
    if (publisher && !d.publisher?.includes(publisher)) continue;
    if (!existsSync(textOf(d))) continue;
    readFileSync(textOf(d), "utf8").split("\f").forEach((page, k) => {
      if (!words.every((w) => page.includes(w) || page.includes(reversed(w)))) return;
      total++;
      if (shown++ >= 40) return;
      const at = Math.max(page.indexOf(words[0]), page.indexOf(reversed(words[0])));
      const snippet = page.slice(Math.max(0, at - 70), at + 90).replace(/\s+/g, " ").trim();
      console.log(`${d.id} p.${k + 1} | ${d.publisher ?? "?"} | ${d.title ?? d.from} | ${d.url ?? "no link"}\n    ${snippet}`);
    });
  }
  console.log(`${total} pages`);
} else if (command === "add") {
  const docs = load();
  const [source] = positional;
  const fields = { publisher: flag("publisher"), title: flag("title"), kind: flag("kind"), version: flag("version"), url: flag("url") };
  const isUrl = /^https?:/.test(source);
  if (isUrl) fields.url ??= source;
  const dir = mkdtempSync(join(tmpdir(), "library-"));
  const got = isUrl ? fetchTo(source, dir) : { path: source, status: "200" };
  if (got.status !== "200") {
    rmSync(dir, { recursive: true });
    console.error(`${source}: answered ${got.status}, not filed`);
    process.exit(1);
  }
  const doc = file(docs, got.path, fields);
  rmSync(dir, { recursive: true });
  // A new file at a link already filed is that document's next version.
  for (const d of docs) if (d.id !== doc.id && d.url && d.url === doc.url && !d.superseded_by) d.superseded_by = doc.id;
  doc.checked = today;
  save(docs);
  console.log(`${doc.id} ${doc.pages} pages, text ${doc.text}: ${doc.title ?? doc.from ?? doc.url}`);
} else if (command === "note") {
  const docs = load();
  const doc = docs.find((d) => d.id === positional[0]);
  if (!doc) throw new Error(`no document ${positional[0]}`);
  doc.topics = [...(doc.topics ?? []), { topic: flag("topic"), page: Number(flag("page")) }];
  save(docs);
} else if (command === "scan") {
  const docs = load();
  const before = docs.length;
  const walk = (dir) => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return walk(p);
    return [".pdf", ".html", ".htm"].includes(extname(n).toLowerCase()) ? [p] : [];
  });
  for (const p of walk(resolve(positional[0]))) file(docs, p, { from: relative(root, p) });
  save(docs);
  console.log(`${docs.length - before} new, ${docs.length} in the library`);
} else if (command === "recheck") {
  const days = Number(flag("older-than") ?? 0);
  const docs = load();
  const count = { same: 0, changed: [], failed: [] };
  const dir = mkdtempSync(join(tmpdir(), "library-"));
  for (const d of docs) {
    if (!d.url || d.superseded_by) continue;
    if (d.checked && (Date.now() - Date.parse(d.checked)) / 864e5 < days) continue;
    const got = fetchTo(d.url, dir);
    if (got.status !== "200") {
      count.failed.push(`${got.status} ${d.url}`);
    } else if (createHash("sha256").update(readFileSync(got.path)).digest("hex").startsWith(d.id)) {
      d.checked = today;
      count.same++;
    } else {
      count.changed.push(`${d.publisher ?? "?"} | ${d.title ?? ""} | ${d.url}`);
    }
    rmSync(got.path, { force: true });
    await new Promise((r) => setTimeout(r, 1000));
  }
  rmSync(dir, { recursive: true });
  save(docs);
  console.log(`${count.same} unchanged\n${count.changed.length} changed, read these again:\n${count.changed.join("\n")}\n${count.failed.length} could not be fetched:\n${count.failed.join("\n")}`);
} else if (command === "status") {
  const docs = load();
  const tally = (key) => Object.entries(Object.groupBy(docs, key)).map(([k, v]) => `${k} ${v.length}`).join(", ");
  console.log(`${docs.length} documents, ${docs.reduce((n, d) => n + (d.pages ?? 0), 0)} pages, ${(docs.reduce((n, d) => n + d.bytes, 0) / 1e6).toFixed(0)} MB`);
  console.log(`text: ${tally((d) => d.text)}`);
  console.log(`link known: ${tally((d) => (d.url ? "yes" : "no"))}`);
  console.log(`publishers: ${tally((d) => d.publisher ?? "not named")}`);
} else {
  console.error(execFileSync("sed", ["-n", "5,10p", fileURLToPath(import.meta.url)], { encoding: "utf8" }));
  process.exit(1);
}
