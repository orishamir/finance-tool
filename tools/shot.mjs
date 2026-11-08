// One screenshot command for every builder: a page of a built site, whole or one spot, at phone and PC widths.
// Usage (from the repo or worktree root, after `npm run build`):
//   node tools/shot.mjs <page path> [--spot <selector>] [--width 390,1440] [--out <dir>] [--build <dir>]
//   e.g. node tools/shot.mjs /guide/kupat-gemel-lehashkaa --spot "#who"
// --spot takes any Playwright locator (CSS, "text=…", "#id"); without it the whole page is taken. Sticky and fixed bars are
// unstuck first so they don't cover the spot. Phone widths (under 800) are taken as a touch phone. Prints each file's path.
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: { spot: { type: "string" }, width: { type: "string", default: "390,1440" }, out: { type: "string", default: "shots" }, build: { type: "string", default: "site/build/client" } },
});
const path = positionals[0];
if (!path) { console.error("usage: node shot.mjs <page path> [--spot <selector>] [--width 390,1440] [--out <dir>] [--build <dir>]"); process.exit(2); }

const tryRequire = (from) => { try { return createRequire(from)("playwright"); } catch { return null; } };
const npx = join(homedir(), ".npm/_npx");
const pw = tryRequire(join(process.cwd(), "package.json")) ??
  (existsSync(npx) ? readdirSync(npx).map((d) => tryRequire(join(npx, d, "node_modules/"))).find(Boolean) : null);
if (!pw) { console.error("Playwright not found"); process.exit(2); }
const cache = join(homedir(), ".cache/ms-playwright");
const chromeDir = existsSync(cache) && readdirSync(cache).find((d) => /^chromium-\d/.test(d));
const executablePath = chromeDir ? join(cache, chromeDir, "chrome-linux64/chrome") : undefined;

const here = new URL(".", import.meta.url).pathname;
const { serveBuild } = await import(join(here, "../site/scripts/serve-build.mjs"));
const server = await serveBuild(resolve(o.build), { port: 0 });
const browser = await pw.chromium.launch({ executablePath });
mkdirSync(o.out, { recursive: true });
const name = path.replace(/^\/|\/$/g, "").replace(/\W+/g, "-") || "home";
try {
  for (const width of o.width.split(",").map(Number)) {
    const phone = width < 800;
    const page = await browser.newPage({ viewport: { width, height: phone ? 844 : 900 }, ...(phone ? { hasTouch: true, isMobile: true } : {}) });
    await page.goto(server.url.replace(/\/$/, "") + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "*{transition:none!important;animation:none!important}" });
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("body *")) {
        const p = getComputedStyle(el).position;
        if (p === "sticky" || p === "fixed") el.style.position = "static";
      }
    });
    const file = join(o.out, `${name}${o.spot ? "-spot" : ""}-${width}.png`);
    if (o.spot) await page.locator(o.spot).first().screenshot({ path: file });
    else await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
