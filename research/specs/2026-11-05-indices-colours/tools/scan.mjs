import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const out = process.argv[2];
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);
const res = {};
for (const idx of ["sp500", "ta125"]) {
  await page.goto(`https://orishamir.github.io/finance-tool/indices/${idx}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[role=radiogroup]");
  // scroll whole page so lazy parts render
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150); }
  await page.waitForTimeout(800);
  res[idx] = await page.evaluate(() => {
    const NEUTRAL = /^(text-(foreground|muted-foreground|background|card-foreground|primary-foreground|xs|sm|base|lg|xl|2xl|3xl|figure|center|start|end)|bg-(card|popover|muted|secondary|background|accent|transparent)|border-(border|input|t|b|e|s|0|2|card|transparent|chart-axis|muted-foreground)|fill-(chart-text|chart-grid|chart-axis|foreground|none|transparent)|stroke-(chart-grid|chart-axis)|ring-offset-card|outline-ring)/;
    const COLORCLS = /^(?:[a-z-]+:)*(bg|text|fill|stroke|border|ring|outline|decoration)-[a-z]/;
    const map = new Map();
    let heading = "";
    const all = document.querySelectorAll("body *");
    for (const el of all) {
      if (/^H[1-3]$/.test(el.tagName)) heading = el.textContent.trim().slice(0, 40);
      const cls = (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").split(/\s+/).filter((c) => COLORCLS.test(c) && !NEUTRAL.test(c.replace(/^(?:[a-z-]+:)*/, "")) && !/^(text|border|ring|outline)-(\[|\d|e$|s$|x|y)/.test(c.replace(/^(?:[a-z-]+:)*/, "")) && !/-(xs|sm|lg|md|none|t-2|dashed|dotted)$/.test(c));
      const st = el.style?.cssText || "";
      const inlineColour = /(background|fill|stroke|color|--)/.test(st) && /(oklch|var\(|#|rgb)/.test(st) ? st : "";
      if (!cls.length && !inlineColour) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const cs = getComputedStyle(el);
      const key = cls.join(" ") + (inlineColour ? " | " + inlineColour.replace(/width:[^;]+;?|left:[^;]+;?/g, "") : "");
      const e = map.get(key) || { key, n: 0, sections: new Set(), sample: "", bg: cs.backgroundColor, color: cs.color, fill: cs.fill, border: cs.borderTopColor };
      e.n++; e.sections.add(heading);
      if (!e.sample) e.sample = (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 50);
      map.set(key, e);
    }
    return [...map.values()].map((e) => ({ ...e, sections: [...e.sections] }));
  });
  await page.screenshot({ path: `${out}/${idx}-full.png`, fullPage: true });
}
const fs = await import("fs");
fs.writeFileSync(`${out}/scan.json`, JSON.stringify(res, null, 1));
await b.close();
