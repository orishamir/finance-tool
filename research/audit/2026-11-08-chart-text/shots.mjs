// A screenshot of each chart svg (with 40 px around it) on the given page at 320, 390 and 1440 px, saved here as svg-<page>-<width>-<n>.png.
// Usage: node shots.mjs <site/build/client> /indices/sp500
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const { serveBuild } = await import(join(here, "../../../site/scripts/serve-build.mjs"));
const [build, ...paths] = process.argv.slice(2);
const server = await serveBuild(build, { port: 0 });
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const width of [320, 390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, ...(width < 800 ? { hasTouch: true, isMobile: true } : {}) });
  for (const p of paths) {
    await page.goto(server.url.replace(/\/$/, "") + p, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const clips = await page.evaluate(() =>
      [...document.querySelectorAll("svg:has(text)")].filter((s) => s.getBoundingClientRect().width > 40).map((s) => {
        const r = s.getBoundingClientRect();
        return { x: Math.max(0, r.left - 40), y: r.top + scrollY - 40, width: Math.min(innerWidth - Math.max(0, r.left - 40), r.width + 80), height: r.height + 80 };
      }),
    );
    for (const [k, clip] of clips.entries()) await page.screenshot({ path: join(here, `svg-${p.replace(/^\//, "").replace(/\W+/g, "-")}-${width}-${k + 1}.png`), fullPage: true, clip });
  }
  await page.close();
}
await browser.close();
server.close();
