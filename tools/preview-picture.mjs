// Makes the picture a link to any page shows when it is pasted in a chat: site/public/preview.png, 1200 × 630, the site's mark, its
// name and its line (site.name and site.tagline in site/app/copy.ts) in its dark look and its fonts (theme.css, the fonts app.css
// loads). Every page's og:image points at it (site/app/lib/page-meta.ts). The picture is kept in git; run this again after changing
// the name, the line, the colours or the fonts, and look at the result.
// The site's own headless Chrome draws it, so Hebrew is shaped and laid out right to left as on the site. A picture per page, made in
// the build, needs a renderer that runs without a browser; the build has none yet.
// Usage (from the repo or worktree root): node tools/preview-picture.mjs [--out site/public/preview.png]
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { tsImport } from "tsx/esm/api";

const { values: o } = parseArgs({ options: { out: { type: "string", default: "site/public/preview.png" } } });
const repo = fileURLToPath(new URL("..", import.meta.url));
const { site } = await tsImport(join(repo, "site/app/copy.ts"), import.meta.url);

const pw = createRequire(join(repo, "package.json"))("playwright");
const cache = join(homedir(), ".cache/ms-playwright");
const chromeDir = existsSync(cache) && readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const executablePath = chromeDir ? join(cache, chromeDir, "chrome-linux64/chrome") : undefined;

// the fonts as app.css loads them, inlined, and the colour roles from theme.css (the page is drawn from a string, with no files beside it)
const font = (path) => `url(data:font/woff2;base64,${readFileSync(join(repo, "node_modules/@fontsource-variable", path)).toString("base64")}) format("woff2-variations")`;
const theme = readFileSync(join(repo, "site/app/theme.css"), "utf8");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
${theme}
@font-face { font-family: "Inter Variable"; font-weight: 100 900; src: ${font("inter/files/inter-latin-wght-normal.woff2")}; unicode-range: U+0000-00FF, U+2000-206F, U+20AC, U+2212; }
@font-face { font-family: "Heebo Variable"; font-weight: 100 900; src: ${font("heebo/files/heebo-hebrew-wght-normal.woff2")}; unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F; }
html, body { margin: 0; }
body {
  width: 1200px; height: 630px; box-sizing: border-box; overflow: hidden;
  background: var(--background); color: var(--foreground);
  font-family: "Inter Variable", "Heebo Variable", sans-serif;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px;
  border-block-end: 12px solid var(--primary);
}
.name { display: flex; align-items: center; gap: 36px; }
.mark {
  width: 148px; height: 148px; border-radius: 32px; background: var(--primary); color: var(--primary-foreground);
  display: flex; align-items: center; justify-content: center; font-size: 104px; font-weight: 700; line-height: 1;
}
h1 { margin: 0; font-size: 150px; font-weight: 700; line-height: 1; }
p { margin: 0; max-width: 960px; text-align: center; text-wrap: balance; font-size: 46px; line-height: 1.4; color: var(--muted-foreground); }
</style></head><body>
<div class="name"><div class="mark">${esc([...site.name][0])}</div><h1>${esc(site.name)}</h1></div>
<p>${esc(site.tagline)}</p>
</body></html>`;

const browser = await pw.chromium.launch({ executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family));
  if (!loaded.some((f) => f.includes("Heebo"))) throw new Error(`Heebo did not load (loaded: ${loaded.join(", ") || "none"})`);
  const out = resolve(repo, o.out);
  await page.screenshot({ path: out, type: "png" });
  console.log(out);
} finally {
  await browser.close();
}
