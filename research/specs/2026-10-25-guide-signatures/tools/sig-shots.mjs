import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = process.argv[2];
const ids = process.argv.slice(3);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag] of [[1280, 900, "pc"], [390, 844, "phone"]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: tag === "phone", locale: "he-IL" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push(String(e)));
  for (const id of ids) {
    await page.goto(`${process.env.BASE || "http://127.0.0.1:4173/finance-tool"}/guide/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    const wide = await page.evaluate(() => [...document.querySelectorAll("#different *")].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 || e.getBoundingClientRect().left < -1).slice(0, 5).map((e) => e.tagName + "." + (e.getAttribute("class") || "").slice(0, 40)));
    const sec = page.locator("#different");
    const n = await sec.count();
    if (n) { await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: `${out}/${tag}_${id}.png` }); }
    console.log(tag, id, "section", n, "overflowX", over, "outside", JSON.stringify(wide), "errors", errs.splice(0).join(" | ").slice(0, 300));
  }
  await ctx.close();
}
await browser.close();
