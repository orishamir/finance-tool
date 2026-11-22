// One screenshot command for every builder: a page of a built site, whole or one spot, at phone and PC widths.
// Usage (from the repo or worktree root, after `npm run build`):
//   node tools/shot.mjs <page path> [--spot <selector>] [--width 390,1440] [--out <dir>] [--build <dir>] [--name <file name>]
//   e.g. node tools/shot.mjs /guide/kupat-gemel-lehashkaa --spot "#who"
// --spot takes any Playwright locator (CSS, "text=…", "#id"); without it the whole page is taken. Sticky and fixed bars are
// unstuck first so they don't cover the spot. Phone widths (under 800) are taken as a touch phone. Prints each file's path.
// --name names the files where the page path is too long for one (a fee page's deal in its address).
import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { newContext } from "../site/scripts/browser.mjs";

const { values: o, positionals } = parseArgs({
  allowPositionals: true,
  options: { spot: { type: "string" }, width: { type: "string", default: "390,1440" }, out: { type: "string", default: "shots" }, build: { type: "string", default: "site/build/client" }, name: { type: "string" } },
});
const path = positionals[0];
if (!path) { console.error("usage: node shot.mjs <page path> [--spot <selector>] [--width 390,1440] [--out <dir>] [--build <dir>] [--name <file name>]"); process.exit(2); }


const here = new URL(".", import.meta.url).pathname;
const { serveBuild } = await import(join(here, "../site/scripts/serve-build.mjs"));
const server = await serveBuild(resolve(o.build), { port: 0 });
const browser = await chromium.launch();
mkdirSync(o.out, { recursive: true });
const name = o.name ?? (path.replace(/^\/|\/$/g, "").replace(/\W+/g, "-") || "home");
try {
  for (const width of o.width.split(",").map(Number)) {
    const phone = width < 800;
    const page = await (await newContext(browser, { viewport: { width, height: phone ? 844 : 900 }, ...(phone ? { hasTouch: true, isMobile: true } : {}) })).newPage();
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
    await page.context().close();
  }
} finally {
  await browser.close();
  server.close();
}
