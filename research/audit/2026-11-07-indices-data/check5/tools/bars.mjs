import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = "http://127.0.0.1:5191/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const num = (s) => Number(s.replace(/[^\d−-]/g, "").replace("−", "-"));
for (const p of process.argv.slice(2)) {
  await page.goto(`${base}/indices/${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const bars = page.locator('[role=img][aria-label*="₪"]');
  const n = await bars.count();
  console.log(`== ${p}: ${n} bars`);
  for (let b = 0; b < n; b++) {
    const bar = bars.nth(b);
    if (!(await bar.isVisible())) continue;
    const label = await bar.getAttribute("aria-label");
    const parts = bar.locator(":scope > span");
    const k = await parts.count();
    const amounts = [];
    for (let i = 0; i < k; i++) {
      const part = parts.nth(i);
      const box = await part.boundingBox();
      const st = await part.getAttribute("style");
      if (!box || box.width < 1) { amounts.push({ tip: null, w: box?.width ?? 0, st }); continue; }
      await part.scrollIntoViewIfNeeded();
      await part.hover({ force: true });
      await page.waitForTimeout(60);
      const tip = await part.locator("span.absolute").first().innerText().catch(() => null);
      const inside = (await part.locator(":scope > span.overflow-hidden").innerText().catch(() => "")).trim();
      amounts.push(tip ? { tip: tip.split("\n")[0], inside, w: box.width } : { tip: null, w: box.width, st });
    }
    const total = num(label.split(":").pop());
    const sum = amounts.filter((x) => x.tip).reduce((a, x) => a + num(x.tip.split(":")[1].split("(")[0]), 0);
    const insideBad = amounts.filter((x) => x.tip && x.inside && num(x.inside) !== num(x.tip.split(":")[1].split("(")[0]));
    console.log(`${label} | parts ${amounts.length} sum ${sum} ${sum === total ? "OK" : "MISMATCH"}${insideBad.length ? " INSIDE≠TIP " + JSON.stringify(insideBad) : ""}`);
    if (b < 2 || sum !== total) for (const a of amounts) console.log("    ", a.tip ?? `(no box on hover, ${a.w.toFixed(2)} px wide)`, a.inside ? `[written: ${a.inside}]` : "");
    await page.mouse.move(0, 0);
  }
}
await browser.close();
