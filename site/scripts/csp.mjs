// Writes each built page's Content Security Policy into its head (guidelines/code.md, "Safety"; docs/architecture.md section 6).
// GitHub Pages sends no headers a site can set, so the policy is a <meta http-equiv>, placed right after the charset, before any
// script, since a page's policy covers only what comes after it. Scripts run only from the site's own files and from the page's own
// inline scripts, each named by its hash: React Router's context and its route data, which differ on every page. Pre-rendered `style`
// attributes (KaTeX's, the charts') need 'unsafe-inline' for styles. Fonts and pictures come from the site or from data: addresses (the
// build writes a file under 4 KB into the stylesheet that uses it, as KaTeX's smallest fonts are), fetches and forms stay on the site,
// and plugins and a changed base address are refused.
// Runs after the build (`npm run build -w site`), on every .html under the build, the fallback 404.html among them; csp-check.mjs then
// opens a sample of the pages in a browser and fails on any violation.
// Usage: node scripts/csp.mjs [build/client]
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const EXISTING = /<meta http-equiv="Content-Security-Policy"[^>]*>/i;
// A script element's text runs to the first `</script`, whatever case (the HTML standard's "script data" state); one with a src runs
// that file and not its text.
const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const CHARSET = /<meta charset="[^"]*"\s*\/?>/i;

/** The hashes of a page's inline scripts, as CSP sources ('sha256-…'), in the order they appear, each once. */
function inlineScriptHashes(html) {
  const out = new Set();
  for (const [, attrs, text] of html.matchAll(SCRIPT)) {
    if (/\ssrc\s*=/i.test(attrs)) continue;
    out.add(`'sha256-${createHash("sha256").update(text.replace(/\r\n?/g, "\n"), "utf8").digest("base64")}'`);
  }
  return [...out];
}

/** The policy for a page whose inline scripts have these hashes. */
function policy(hashes) {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...hashes].join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/** The page with its policy in the head, right after the charset (or first in the head without one), replacing a policy already there. */
function withPolicy(html) {
  const page = html.replace(EXISTING, "");
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(inlineScriptHashes(page))}"/>`;
  const charset = page.match(CHARSET);
  const headOpen = page.match(/<head\b[^>]*>/i);
  if (!headOpen || headOpen.index === undefined) throw new Error("a page with no <head>");
  const at = charset?.index !== undefined ? charset.index + charset[0].length : headOpen.index + headOpen[0].length;
  const firstScript = page.search(/<script\b/i);
  if (firstScript !== -1 && firstScript < at) throw new Error("a script before the charset: the policy would not cover it");
  return page.slice(0, at) + meta + page.slice(at);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ?? fileURLToPath(new URL("../build/client/", import.meta.url));
  const all = pages(root);
  let scripts = 0;
  for (const p of all) {
    let html;
    try {
      html = withPolicy(readFileSync(p, "utf8"));
    } catch (e) {
      throw new Error(`csp: ${p}`, { cause: e });
    }
    scripts += inlineScriptHashes(html).length;
    writeFileSync(p, html);
  }
  console.log(`csp: ${all.length} pages carry their Content Security Policy, with the hashes of ${scripts} inline scripts`);
}
