// Part 9: the result card (the drawing of parts 1 and 2, in each set of colours) standing over the top of the two lists (the live page
// in the same colours, from live.mjs), as the page will put them, so the strips and the first fee bars and chips are seen together.
// Run after shoot-drawings.mjs and live.mjs: node research/specs/2026-11-05-indices-colours/round2/compose9.mjs
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const key of ["today", "V1", "V2"]) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#171614}.w{width:1376px;padding:24px 32px}img{display:block;width:100%}.g{height:24px}</style></head>
  <body><div class="w"><img src="${pathToFileURL(join(here, key, "2-result-card.png")).href}"><div class="g"></div><img src="${pathToFileURL(join(here, "work", `${key}-lists-top.png`)).href}"></div></body></html>`;
  const f = join(here, "work", `compose-${key}.html`); writeFileSync(f, html);
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(f).href); await p.waitForTimeout(300);
  await p.locator(".w").screenshot({ path: join(here, key, "9-card-to-lists.png") });
  await p.close();
}
await b.close();
console.log("part 9 composed");
