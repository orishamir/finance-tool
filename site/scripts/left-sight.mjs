// Lists the lines of text a reader sees on a page at 390 px in one build and no longer sees in another: what a change took out of sight.
// Each page's visible text is the innerText of its <main>, nothing opened, after the page settles. A line seen before and not after is
// printed under its page, once. Not part of `npm run check`: a change that moves sentences behind a "?" runs it and says where each went.
//
//   node site/scripts/left-sight.mjs <before build> <after build> <page path...>
//   e.g. node site/scripts/left-sight.mjs ../main/site/build/client site/build/client /tracks/child-savings-provident
import { resolve } from "node:path";
import { chromium } from "playwright";
import { newContext, settled } from "./browser.mjs";
import { serveBuild } from "./serve-build.mjs";

const [beforeDir, afterDir, ...paths] = process.argv.slice(2);
if (!beforeDir || !afterDir || paths.length === 0) {
  console.error("usage: node site/scripts/left-sight.mjs <before build> <after build> <page path...>");
  process.exit(2);
}

const browser = await chromium.launch();
/** The visible lines of each page in one build, trimmed, empty ones left out. */
async function linesOf(dir) {
  const server = await serveBuild(resolve(dir), { port: 0 });
  const base = server.url.replace(/\/$/, "");
  const out = new Map();
  const ctx = await newContext(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: "dark" });
  const page = await ctx.newPage();
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(settled);
    const text = await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
    out.set(path, text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean));
  }
  await ctx.close();
  server.close();
  return out;
}

const before = await linesOf(beforeDir);
const after = await linesOf(afterDir);
await browser.close();
for (const path of paths) {
  const now = new Set(after.get(path));
  const gone = [...new Set(before.get(path))].filter((l) => !now.has(l));
  console.log(`## ${path}`);
  for (const l of gone) console.log(`- ${l}`);
  console.log("");
}
