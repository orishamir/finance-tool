// Guard over the built pages: a link to any page, pasted in a chat, shows what the page is. Every pre-rendered page (and the fallback,
// 404.html) has a title, a description of a sensible length, the Open Graph and Twitter tags a chat app reads (each once), its own
// absolute address as og:url, a picture whose file is in the build, and still the "noindex" that keeps the site out of search engines.
// The tags come from site/app/lib/page-meta.ts; the site's address is taken from the front page's og:url, and every page must share it.
// Runs after the build (`npm run build -w site`); prints each problem with its page, and fails.
// Usage: node scripts/link-preview-check.mjs [build/client]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** A description shorter than this says too little to tell the page apart; longer, a chat cuts it off in the middle. */
export const DESCRIPTION = { min: 30, max: 200 };
/** The basename the site is served under (react-router.config.ts); the front page's address ends with it. */
const BASENAME = "/finance-tool/";
const ONCE = ["og:type", "og:site_name", "og:locale", "og:title", "og:description", "og:url", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"];
const HEB = "א-ת";
const ASCII_QUOTE = new RegExp(`[${HEB}]"[${HEB}]`);

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/** The head's title and its meta tags, each key (name or property) with every content it was given. */
export function readHead(html) {
  const head = html.slice(0, html.search(/<\/head>/i) + 1 || html.length);
  const title = head.match(/<title>([\s\S]*?)<\/title>/i);
  const metas = new Map();
  for (const m of head.matchAll(/<meta\s[^>]*>/gi)) {
    const attr = (k) => m[0].match(new RegExp(`\\s${k}="([^"]*)"`, "i"))?.[1];
    const key = attr("property") ?? attr("name");
    const content = attr("content");
    if (!key || content === undefined) continue;
    metas.set(key, [...(metas.get(key) ?? []), decode(content)]);
  }
  return { title: title ? decode(title[1]).trim() : null, metas };
}

/** The address Pages serves a built file at, under the site's address: `guide/x/index.html` is `<site>guide/x/`. */
export const addressOf = (siteUrl, page) => siteUrl + page.split(sep).join("/").replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");

/**
 * What is wrong with one built page's card. `page` is its path in the build (`guide/x/index.html`), `siteUrl` the site's address,
 * `hasFile` whether a path under the build exists. 404.html answers every address, so its og:url is only checked to be the site's.
 */
export function previewProblems(html, { page, siteUrl, hasFile }) {
  const { title, metas } = readHead(html);
  const one = (k) => metas.get(k)?.[0];
  const out = [];
  if (!title) out.push("no <title>");
  const description = one("description");
  if (!description) out.push("no description");
  else if (description.length < DESCRIPTION.min || description.length > DESCRIPTION.max) out.push(`a description of ${description.length} characters (${DESCRIPTION.min} to ${DESCRIPTION.max}): ${description}`);
  for (const k of ONCE) {
    const n = metas.get(k)?.length ?? 0;
    if (n !== 1) out.push(n ? `${k} ${n} times` : `no ${k}`);
  }
  if (!metas.get("robots")?.includes("noindex")) out.push("no robots noindex");
  if (one("og:locale") && one("og:locale") !== "he_IL") out.push(`og:locale ${one("og:locale")}, not he_IL`);
  if (one("twitter:card") && one("twitter:card") !== "summary_large_image") out.push(`twitter:card ${one("twitter:card")}`);
  if (one("og:description") && one("og:description") !== description) out.push("og:description is not the description");
  const url = one("og:url");
  const want = page === "404.html" ? siteUrl : addressOf(siteUrl, page);
  if (url && url !== want) out.push(`og:url ${url}, not ${want}`);
  for (const k of ["og:image", "twitter:image"]) {
    const src = one(k);
    if (!src) continue;
    if (!src.startsWith(siteUrl)) out.push(`${k} ${src} is not on the site's address ${siteUrl}`);
    else if (!hasFile(decodeURI(src.slice(siteUrl.length)))) out.push(`${k} ${src}: no such file in the build`);
  }
  for (const [k, v] of [["title", title], ["description", description], ["og:title", one("og:title")]]) if (v && ASCII_QUOTE.test(v)) out.push(`an ASCII quote between Hebrew letters in the ${k} (write the gershayim ״): ${v}`);
  return out;
}

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] ?? fileURLToPath(new URL("../build/client/", import.meta.url));
  const front = join(root, "index.html");
  const siteUrl = existsSync(front) ? readHead(readFileSync(front, "utf8")).metas.get("og:url")?.[0] : undefined;
  if (!siteUrl || !/^https:\/\//.test(siteUrl) || !siteUrl.endsWith(BASENAME)) {
    console.error(`link-preview-check: the front page's og:url (${siteUrl ?? "none"}) is not an https address ending in ${BASENAME}`);
    process.exit(1);
  }
  const hasFile = (path) => existsSync(join(root, path));
  const problems = [];
  const all = pages(root);
  // each picture, read once: its file in the build, its size in bytes, and its width and height (in the PNG's first chunk)
  const pictures = new Map();
  const picture = (src) => {
    if (!pictures.has(src)) {
      const path = join(root, decodeURI(src.slice(siteUrl.length)));
      const png = existsSync(path) ? readFileSync(path) : null;
      pictures.set(src, { bytes: png?.length ?? 0, size: !png ? null : png.toString("latin1", 1, 4) === "PNG" ? `${png.readUInt32BE(16)}×${png.readUInt32BE(20)}` : "not a PNG" });
    }
    return pictures.get(src);
  };
  for (const p of all) {
    const page = relative(root, p);
    const html = readFileSync(p, "utf8");
    for (const x of previewProblems(html, { page, siteUrl, hasFile })) problems.push(`${page}: ${x}`);
    const { metas } = readHead(html);
    const src = metas.get("og:image")?.[0];
    const said = `${metas.get("og:image:width")?.[0]}×${metas.get("og:image:height")?.[0]}`;
    const real = src?.startsWith(siteUrl) ? picture(src).size : null;
    if (real && real !== said) problems.push(`${page}: the picture is ${real}, its tags say ${said}`);
  }
  if (problems.length) {
    console.error(`link-preview-check: ${problems.length} problems on the built pages`);
    for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
    if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
    process.exit(1);
  }
  const bytes = [...pictures.values()].reduce((n, x) => n + x.bytes, 0);
  console.log(`link-preview-check: ${all.length} pages carry a title, a description and the link card; ${pictures.size} picture${pictures.size === 1 ? "" : "s"}, ${Math.round(bytes / 1024)} KB`);
}
