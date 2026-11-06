// Live probe of option C's override on /indices/sp500 (checker's own script).
import { createRequire } from "module";
import fs from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const OVR = `:root{
 --chart-cost-trade: var(--palette-rose-600) !important;
 --chart-cost-custody: var(--palette-gold-200) !important;
 --chart-cost-fixed: var(--palette-gold-200) !important;
 --chart-cost-fx: var(--palette-orange-500) !important;
 --chart-cost-other: var(--palette-neutral-400) !important;
 --chart-kind-unhedged: var(--palette-neutral-300) !important;
 --chart-kind-hedged: var(--palette-neutral-300) !important;
 --caution-foreground: var(--palette-amber-300) !important;
}`;
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
p.setDefaultTimeout(8000);
const out = {};
for (const idx of ["sp500", "ta125"]) {
  await p.goto(`https://orishamir.github.io/finance-tool/indices/${idx}`, { waitUntil: "networkidle" });
  await p.waitForSelector("[role=radiogroup]");
  await p.addStyleTag({ content: OVR });
  await p.waitForTimeout(400);
  out[idx] = await p.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; };
    const cs = (el, k) => getComputedStyle(el)[k];
    const parts = [...document.querySelectorAll('[class*="bg-chart-cost-"]')].map((el) => ({ cls: [...el.classList].find((c) => c.startsWith("bg-chart-cost-")), bg: cs(el, "backgroundColor"), box: r(el) }));
    const byCls = {}; for (const x of parts) { byCls[x.cls] ??= { n: 0, bg: x.bg, widths: [] }; byCls[x.cls].n++; byCls[x.cls].widths.push(x.box[2]); }
    const caution = [...document.querySelectorAll('[class*="text-caution-foreground"]')].map((el) => ({ text: el.textContent.trim().slice(0, 40), color: cs(el, "color"), box: r(el) }));
    // caution chips sharing a row (within 140px vertically) with a custody part
    const custody = parts.filter((x) => x.cls === "bg-chart-cost-custody" && x.box[2] > 0);
    const near = caution.map((c) => ({ text: c.text, y: c.box[1], nearestCustodyDy: custody.length ? Math.min(...custody.map((x) => Math.abs(x.box[1] - c.box[1]))) : null }));
    const legends = [...document.querySelectorAll("li, span")].filter((el) => el.querySelector?.('[class*="bg-chart-cost-fixed"]') && el.children.length <= 3 && el.textContent.length < 60).map((el) => el.textContent.trim());
    return { byCls, caution, near, fixedLegend: [...new Set(legends)].slice(0, 6), kind: [...document.querySelectorAll('[class*="chart-kind-"]')].map((el) => ({ cls: el.getAttribute("class").match(/(bg|fill)-chart-kind-\w+/)?.[0], bg: cs(el, "backgroundColor"), fill: cs(el, "fill") })).slice(0, 6) };
  });
}
fs.writeFileSync(new URL("./probe.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
await b.close();
