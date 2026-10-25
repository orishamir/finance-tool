// Finds sentences broken by flex layout: an element laid out as a flex/grid column whose direct children mix text nodes and elements
// (each piece becomes its own line), and row flex whose direct text child is only punctuation (a stray gap before "." or ",").
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const [listFile, outFile] = process.argv.slice(2);
const paths = readFileSync(listFile, "utf8").split("\n").filter(Boolean);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "he-IL" });
const found = [];
async function worker(queue) {
  const page = await ctx.newPage();
  while (queue.length) {
    const p = queue.shift();
    try {
      await page.goto("http://127.0.0.1:4173/finance-tool" + p, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(300);
      // open every disclosure so folded content is checked too
      await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
      const hits = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (!/flex|grid/.test(cs.display)) continue;
          const kids = [...el.childNodes];
          const texts = kids.filter((n) => n.nodeType === 3 && n.textContent.trim());
          if (!texts.length) continue;
          const elems = kids.filter((n) => n.nodeType === 1 && getComputedStyle(n).display !== "none");
          if (!elems.length) continue;
          const column = cs.display.includes("grid") ? cs.gridTemplateColumns.split(" ").length <= 1 : cs.flexDirection.startsWith("column");
          const punct = texts.some((n) => /^[.,;:)\]״"׳']+$/.test(n.textContent.trim()));
          if (!column && !punct) continue;
          if (el.getBoundingClientRect().width === 0) continue;
          out.push({ kind: column ? "column" : "punct", cls: (el.getAttribute("class") || "").slice(0, 80), tag: el.tagName, text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 120) });
        }
        return out;
      });
      for (const h of hits) found.push({ page: p, ...h });
    } catch (e) {
      found.push({ page: p, kind: "error", text: String(e).slice(0, 100) });
    }
  }
  await page.close();
}
const queue = [...paths];
await Promise.all([1, 2, 3, 4].map(() => worker(queue)));
await browser.close();
writeFileSync(outFile, JSON.stringify(found, null, 1));
console.log("pages", paths.length, "hits", found.length);
