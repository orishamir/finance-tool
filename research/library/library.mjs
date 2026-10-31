// The document library: a document read once is never hunted down or read whole again.
// index.jsonl (in git) holds what each document is, where it came from, its hash, a short digest and
// where each topic sits. store/ (not in git: the repository is public and company documents are not
// ours to republish) holds the file and its text, one form feed between pages. tried.jsonl (in git)
// holds what was looked for and not found; unreachable.jsonl (in git) the links that could not be fetched.
//
//   node research/library/library.mjs find <words> [--publisher X] [--limit N] [--all]   best pages first
//   node research/library/library.mjs add <url|file> --publisher X --title Y [--kind K] [--version D] [--url U]
//   node research/library/library.mjs note <id> [--topic T --page N] [--digest "what this document is"]
//   node research/library/library.mjs tried "what was looked for" --result "what came of it" [--where W]
//   node research/library/library.mjs mirror [--limit N]      fetch every link the repository cites
//   node research/library/library.mjs scan <folder>           file what is already on disk
//   node research/library/library.mjs recheck [--older-than DAYS]   which links changed since read
//   node research/library/library.mjs status
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const indexPath = join(here, "index.jsonl");
const triedPath = join(here, "tried.jsonl");
const unreachablePath = join(here, "unreachable.jsonl");
const store = join(here, "store");
const today = new Date().toISOString().slice(0, 10);
const agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
// Maya refuses automated browsing (it stays by the founder's hand); the others are not documents.
const skipHosts = /(^|\.)(maya\.tase\.co\.il|github\.com|githubusercontent\.com|claude\.ai|localhost)$/;
const kept = /pdf|html|text|spreadsheet|excel|word|csv|json|xml/;
const botCheck = /just a moment|attention required|enable javascript and cookies|captcha|radware|verify you are human|security violation|incapsula|access denied/i;

const lines = (p) => (existsSync(p) ? readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const load = () => lines(indexPath);
const save = (docs) => {
  writeFileSync(`${indexPath}.tmp`, [...docs].sort((a, b) => a.id.localeCompare(b.id)).map((d) => JSON.stringify(d)).join("\n") + "\n");
  renameSync(`${indexPath}.tmp`, indexPath);
};
// The mirror runs for hours beside the researchers, so every change to the index takes this lock.
const lockPath = join(here, ".lock");
const withIndex = (change) => {
  for (let waited = 0; ; waited += 100) {
    try {
      mkdirSync(lockPath);
      break;
    } catch {
      if (waited > 60000) rmdirSync(lockPath, { recursive: true });
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
  try {
    const docs = load();
    const result = change(docs);
    save(docs);
    return result;
  } finally {
    rmdirSync(lockPath);
  }
};
const textOf = (d) => join(store, `${d.id}.txt`);
const fileOf = (d) => join(store, `${d.id}${d.ext}`);

const args = process.argv.slice(2);
const [command] = args;
const flag = (name) => {
  const at = args.indexOf(`--${name}`);
  return at < 0 ? undefined : args[at + 1];
};
const positional = args.slice(1).filter((a, k, all) => !a.startsWith("--") && !(all[k - 1]?.startsWith("--") && !["--all"].includes(all[k - 1])));

// A PDF with a symbol font extracts as punctuation, and a scan as nothing: say so rather than search it.
const quality = (text, pages) => {
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  const marks = text.replace(/\s/g, "").length;
  if (letters / Math.max(pages, 1) < 20) return "none";
  return letters / marks < 0.6 ? "poor" : "ok";
};

const decode = (bytes) => {
  const head = bytes.subarray(0, 2000).toString("latin1");
  return new TextDecoder(/charset=["']?(windows-1255|iso-8859-8)/i.test(head) ? "windows-1255" : "utf-8").decode(bytes);
};
const htmlText = (raw) => raw.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n");
const extract = (path, ext) => {
  if (ext === ".pdf") {
    const info = spawnSync("pdfinfo", [path], { encoding: "utf8" });
    const pages = Number(info.stdout?.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0);
    const out = spawnSync("pdftotext", ["-layout", path, "-"], { encoding: "utf8", maxBuffer: 1 << 30 });
    return { text: out.status === 0 ? out.stdout : "", pages };
  }
  if (ext === ".html" || ext === ".htm") return { text: htmlText(decode(readFileSync(path))), pages: 1 };
  if (ext === ".txt" || ext === ".csv" || ext === ".json" || ext === ".xml") return { text: decode(readFileSync(path)), pages: 1 };
  return { text: "", pages: 0 };
};
const sniff = (bytes, url) => {
  if (bytes.subarray(0, 4).toString() === "%PDF") return ".pdf";
  const fromUrl = url ? extname(new URL(url).pathname).toLowerCase() : "";
  if (bytes.subarray(0, 2).toString() === "PK") return /^\.(xlsx|docx|pptx)$/.test(fromUrl) ? fromUrl : ".zip";
  if (/<html|<!doctype html/i.test(bytes.subarray(0, 3000).toString("latin1"))) return ".html";
  return /^\.(csv|json|xml|xls|doc)$/.test(fromUrl) ? fromUrl : ".txt";
};

const hashOf = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 16);
const file = (docs, path, fields, sourceUrl) => {
  const bytes = readFileSync(path);
  const id = hashOf(bytes);
  const have = docs.find((d) => d.id === id);
  if (have) {
    for (const [k, v] of Object.entries(fields)) if (v && !have[k]) have[k] = v;
    return have;
  }
  mkdirSync(store, { recursive: true });
  const ext = sourceUrl ? sniff(bytes, sourceUrl) : extname(path).toLowerCase();
  const doc = { id, ext, bytes: bytes.length, retrieved: today, ...fields };
  copyFileSync(path, fileOf(doc));
  const { text, pages } = extract(fileOf(doc), ext);
  writeFileSync(textOf(doc), text);
  doc.pages = pages;
  doc.text = quality(text, pages);
  if (ext === ".html") doc.text_hash = hashOf(text);
  docs.push(doc);
  return doc;
};

const fetchTo = (url, dir) => {
  const path = join(dir, "download");
  const r = spawnSync("curl", ["-sL", "--max-time", "180", "--max-filesize", "2000000000", "-A", agent, "-o", path, "-w", "%{http_code} %{content_type}", url], { encoding: "utf8" });
  const [status, type = ""] = r.stdout.split(" ");
  return { path, status, type };
};
// What a host answers instead of the document is not the document: nothing here tries to get past it.
const refusal = (got) => {
  if (got.status !== "200") return `answered ${got.status || "nothing"}`;
  if (!kept.test(got.type) && got.type) return `type ${got.type}`;
  const bytes = readFileSync(got.path);
  if (bytes.subarray(0, 2).toString() === "MZ") return "a program";
  if (bytes.subarray(0, 4).toString() !== "%PDF" && bytes.length < 200000 && botCheck.test(bytes.toString("latin1"))) return "a bot check";
  return null;
};

// Hebrew from a PDF is often stored in visual order, so each word is tried both ways.
const reversed = (w) => [...w].reverse().join("");
const clean = (t) => t.replace(/[‎‏‪-‮⁦-⁩]/g, "");
const count = (page, w) => page.split(w).length - 1 + (w.length > 1 ? page.split(reversed(w)).length - 1 : 0);

if (command === "find") {
  const words = positional;
  const publisher = flag("publisher");
  const limit = Number(flag("limit") ?? 12);
  const all = args.includes("--all");
  const hits = [];
  const docs = load();
  for (const t of lines(triedPath)) if (words.some((w) => t.looked_for.includes(w))) console.log(`TRIED ${t.date}: ${t.looked_for} -> ${t.result}${t.where ? ` (${t.where})` : ""}`);
  for (const d of docs) {
    if (d.superseded_by && !all) continue;
    if (publisher && !d.publisher?.includes(publisher)) continue;
    for (const t of d.topics ?? []) if (words.some((w) => t.topic.includes(w))) console.log(`TOPIC ${d.id} p.${t.page} | ${t.topic} | ${d.publisher ?? "?"} | ${d.title ?? d.from} | ${d.url ?? "no link"}`);
    if (!existsSync(textOf(d))) continue;
    clean(readFileSync(textOf(d), "utf8")).split("\f").forEach((page, k) => {
      if (!words.every((w) => count(page, w))) return;
      const phrase = words.length > 1 && (page.includes(words.join(" ")) || page.includes(reversed(words.join(" "))));
      hits.push({ d, k, page, score: words.reduce((n, w) => n + count(page, w), 0) + (phrase ? 50 : 0) });
    });
  }
  hits.sort((a, b) => b.score - a.score);
  // A long law can fill the list by itself; three pages of each document is enough to see it holds the answer.
  const seen = new Map();
  let shown = 0;
  for (const h of hits) {
    if (shown >= limit) break;
    const n = seen.get(h.d.id) ?? 0;
    seen.set(h.d.id, n + 1);
    if (n >= 3) continue;
    shown++;
    const at = Math.max(h.page.indexOf(words[0]), h.page.indexOf(reversed(words[0])));
    const snippet = h.page.slice(Math.max(0, at - 70), at + 90).replace(/\s+/g, " ").trim();
    console.log(`${h.d.id} p.${h.k + 1} | ${h.d.publisher ?? "?"} | ${h.d.title ?? h.d.from} | ${h.d.url ?? "no link"}${h.d.digest ? `\n    digest: ${h.d.digest}` : ""}\n    ${snippet}`);
  }
  console.log(`${hits.length} pages in ${new Set(hits.map((h) => h.d.id)).size} documents, ${shown} shown`);
  mkdirSync(store, { recursive: true });
  appendFileSync(join(store, "searches.log"), `${new Date().toISOString()}\t${words.join(" ")}\t${hits.length}\n`);
} else if (command === "add") {
  const [source] = positional;
  const fields = { publisher: flag("publisher"), title: flag("title"), kind: flag("kind"), version: flag("version"), url: flag("url") };
  const isUrl = /^https?:/.test(source);
  if (isUrl) fields.url ??= source;
  const dir = mkdtempSync(join(tmpdir(), "library-"));
  const got = isUrl ? fetchTo(source, dir) : { path: source };
  const refused = isUrl ? refusal(got) : null;
  if (refused) {
    rmSync(dir, { recursive: true });
    appendFileSync(unreachablePath, JSON.stringify({ url: source, why: refused, date: today }) + "\n");
    console.error(`${source}: ${refused}, not filed; for Chrome or the founder`);
    process.exit(1);
  }
  const doc = withIndex((docs) => {
    const d = file(docs, got.path, fields, isUrl ? source : undefined);
    // A new file at a link already filed is that document's next version.
    for (const o of docs) if (o.id !== d.id && o.url && o.url === d.url && !o.superseded_by) o.superseded_by = d.id;
    d.checked = today;
    return d;
  });
  rmSync(dir, { recursive: true });
  console.log(`${doc.id} ${doc.pages} pages, text ${doc.text}: ${doc.title ?? doc.from ?? doc.url}`);
} else if (command === "note") {
  withIndex((docs) => {
    const doc = docs.find((d) => d.id === positional[0]);
    if (!doc) throw new Error(`no document ${positional[0]}`);
    if (flag("digest")) doc.digest = flag("digest");
    if (flag("topic")) doc.topics = [...(doc.topics ?? []), { topic: flag("topic"), page: Number(flag("page")) }];
  });
} else if (command === "tried") {
  appendFileSync(triedPath, JSON.stringify({ looked_for: positional[0], result: flag("result"), where: flag("where"), date: today }) + "\n");
} else if (command === "scan") {
  const walk = (dir) => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return walk(p);
    return [".pdf", ".html", ".htm"].includes(extname(n).toLowerCase()) ? [p] : [];
  });
  console.log(withIndex((docs) => {
    const before = docs.length;
    for (const p of walk(resolve(positional[0]))) file(docs, p, { from: relative(root, p) });
    return `${docs.length - before} new, ${docs.length} in the library`;
  }));
} else if (command === "mirror") {
  const raw = execFileSync("rg", ["-oIN", "--no-heading", "https?://[^\\s\"'<>)\\]\\\\`|]+", "data", "docs", "site/app/content", ".claude/skills/il-finance", "research/knowledge", "research/discovery", "--glob", "!**/work/**"], { cwd: root, maxBuffer: 1 << 30, encoding: "utf8" });
  const urls = [...new Set(raw.split("\n").map((u) => u.split("#")[0].replace(/[.,;:*_]+$/, "")).filter(Boolean))].filter((u) => {
    try {
      return !skipHosts.test(new URL(u).hostname);
    } catch {
      return false;
    }
  });
  const known = new Set([...load().map((d) => d.url), ...lines(unreachablePath).map((u) => u.url)]);
  const todo = urls.filter((u) => !known.has(u)).sort((a, b) => Number(/\.pdf/i.test(b)) - Number(/\.pdf/i.test(a))).slice(0, Number(flag("limit") ?? Infinity));
  console.log(`${urls.length} links cited, ${todo.length} to fetch`);
  const dir = mkdtempSync(join(tmpdir(), "library-"));
  const tally = { filed: 0, refused: 0 };
  for (const url of todo) {
    const got = fetchTo(url, dir);
    const refused = refusal(got);
    if (refused) {
      appendFileSync(unreachablePath, JSON.stringify({ url, why: refused, date: today }) + "\n");
      tally.refused++;
    } else {
      withIndex((docs) => {
        const d = file(docs, got.path, { url, from_mirror: true }, url);
        d.checked = today;
      });
      tally.filed++;
    }
    rmSync(got.path, { force: true });
    await new Promise((r) => setTimeout(r, 1000));
  }
  rmSync(dir, { recursive: true });
  console.log(JSON.stringify(tally));
} else if (command === "recheck") {
  const days = Number(flag("older-than") ?? 0);
  const out = { same: 0, changed: [], failed: [] };
  const dir = mkdtempSync(join(tmpdir(), "library-"));
  for (const d of load()) {
    if (!d.url || d.superseded_by) continue;
    if (d.checked && (Date.now() - Date.parse(d.checked)) / 864e5 < days) continue;
    const got = fetchTo(d.url, dir);
    const refused = refusal(got);
    if (refused) {
      out.failed.push(`${refused} ${d.url}`);
    } else {
      // A web page changes its bytes on every visit, so a page is compared by its text.
      const bytes = readFileSync(got.path);
      const same = d.text_hash ? hashOf(htmlText(decode(bytes))) === d.text_hash : hashOf(bytes) === d.id;
      if (same) {
        withIndex((docs) => {
          docs.find((x) => x.id === d.id).checked = today;
        });
        out.same++;
      } else {
        out.changed.push(`${d.publisher ?? "?"} | ${d.title ?? ""} | ${d.url}`);
      }
    }
    rmSync(got.path, { force: true });
    await new Promise((r) => setTimeout(r, 1000));
  }
  rmSync(dir, { recursive: true });
  console.log(`${out.same} unchanged\n${out.changed.length} changed, read these again:\n${out.changed.join("\n")}\n${out.failed.length} could not be fetched:\n${out.failed.join("\n")}`);
} else if (command === "status") {
  const docs = load();
  const tally = (key, top = 12) => Object.entries(Object.groupBy(docs, key)).map(([k, v]) => [k, v.length]).sort((a, b) => b[1] - a[1]).slice(0, top).map(([k, n]) => `${k} ${n}`).join(", ");
  console.log(`${docs.length} documents, ${docs.reduce((n, d) => n + (d.pages ?? 0), 0)} pages, ${(docs.reduce((n, d) => n + d.bytes, 0) / 1e6).toFixed(0)} MB`);
  console.log(`text: ${tally((d) => d.text)}`);
  console.log(`link known: ${tally((d) => (d.url ? "yes" : "no"))}`);
  console.log(`digests: ${docs.filter((d) => d.digest).length}, documents with topics: ${docs.filter((d) => d.topics).length}, things tried: ${lines(triedPath).length}`);
  const why = lines(unreachablePath).map((u) => u.why.replace(/ .*/, (m) => (/^ \d/.test(m) ? m : "")));
  console.log(`unreachable: ${why.length} (${Object.entries(Object.groupBy(why, (w) => w)).map(([k, v]) => `${k} ${v.length}`).join(", ")})`);
  const log = join(store, "searches.log");
  if (existsSync(log)) {
    const rows = readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => l.split("\t"));
    console.log(`searches: ${rows.length}, with a hit: ${rows.filter((r) => Number(r[2]) > 0).length}`);
  }
} else {
  console.error(execFileSync("sed", ["-n", "7,14p", fileURLToPath(import.meta.url)], { encoding: "utf8" }));
  process.exit(1);
}
