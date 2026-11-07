// Fix pass 2 (2026-11-07): whole-page shots of the provident fund guide at 1440 and 390, the cost block, the terms fold open (PC aside,
// phone sheet), the workbench cards, the study-fund guide, and a click on every figure of the cost block's paragraphs: each must open
// its own sheet (the "0.7%" that opened "5 שנים").
//   BASE=http://127.0.0.1:4797/finance-tool node research/audit/2026-11-07-kgl-prices/fix2/shots.mjs <outdir>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://127.0.0.1:4797/finance-tool";
const OUT = process.argv[2] ?? "research/audit/2026-11-07-kgl-prices/fix2";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const views = { pc: { width: 1440, height: 900 }, phone: { width: 390, height: 844, hasTouch: true, isMobile: true } };
const report = [];
for (const [name, vp] of Object.entries(views)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.hasTouch, isMobile: !!vp.isMobile, locale: "he-IL", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/guide/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  report.push(`${name} kgl page height ${H}`);
  // whole page in screens, overlapping by 80 px
  let i = 0;
  for (let y = 0; y < H; y += vp.height - 80) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${name}-${String(++i).padStart(2, "0")}.png` });
  }
  // the cost block
  const cost = page.locator("#cost");
  await cost.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await cost.screenshot({ path: `${OUT}/cost-${vp.width}.png` });
  // every figure in the cost block's running text opens its own sheet when clicked at its centre
  const figs = cost.locator("p .num:visible, span.block .num:visible");
  const n = await figs.count();
  for (let k = 0; k < n; k++) {
    const f = figs.nth(k);
    const text = (await f.innerText()).trim();
    await f.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
    await page.waitForTimeout(400);
    const box = await f.boundingBox();
    if (!box) continue;
    const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const b = e?.closest(".num"); return b ? b.innerText.trim() : `(${e?.tagName})`; }, [box.x + box.width / 2, box.y + box.height / 2]);
    // and just above and below the figure, inside its own line: no other figure takes the point
    const near = await page.evaluate(([x, y1, y2]) => [y1, y2].map((y) => { const e = document.elementFromPoint(x, y); const b = e?.closest(".num"); return b ? b.innerText.trim() : "-"; }), [box.x + box.width / 2, box.y + 1, box.y + box.height - 1]);
    report.push(`${name} click "${text}" -> "${hit}"; top/bottom edge -> ${near.join(" / ")}${hit !== text || near.some((t) => t !== "-" && t !== text) ? "  WRONG" : ""}`);
  }
  if (name === "pc") {
    const sum = page.locator("aside summary, summary", { hasText: "תנאי המוצר בדוגמה" }).first();
    await sum.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/terms-closed-1440.png` });
    await sum.click();
    await page.waitForTimeout(400);
    const box = await sum.boundingBox();
    await page.evaluate((y) => window.scrollBy(0, y - 120), box.y);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/terms-open-1440.png` });
    report.push(`pc kgl page height with the terms open ${await page.evaluate(() => document.documentElement.scrollHeight)}`);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
    const chip = page.locator("button.a-chip:visible").last();
    await chip.scrollIntoViewIfNeeded();
    await chip.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/phone-sheet-1.png` });
    const sum = page.locator("summary:visible", { hasText: "תנאי המוצר בדוגמה" }).first();
    await sum.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await sum.click();
    await page.waitForTimeout(400);
    await sum.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/phone-sheet-terms-1.png` });
    await page.mouse.wheel(0, 600);
    await page.evaluate(() => { const s = document.querySelector("summary:has(h4)"); const sc = s?.closest("[class*='overflow']"); if (sc) sc.scrollBy(0, 600); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/phone-sheet-terms-2.png` });
  }
  // workbench
  await page.goto(`${BASE}/workbench/providers/kupat-gemel-lehashkaa`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/workbench-${vp.width}.png`, fullPage: true });
  for (const who of ["מור", "הראל", "ילין"]) {
    const card = page.locator("li", { has: page.locator("h3", { hasText: who }) }).first();
    if (await card.count()) await card.screenshot({ path: `${OUT}/wb-${who === "מור" ? "mor" : who === "הראל" ? "harel" : "yalin"}-${vp.width}.png` });
  }
  // the study fund guide (shares the fee table)
  await page.goto(`${BASE}/guide/keren-hishtalmut`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  report.push(`${name} keren-hishtalmut height ${await page.evaluate(() => document.documentElement.scrollHeight)}`);
  await page.screenshot({ path: `${OUT}/kh-${vp.width}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(report.join("\n"));
