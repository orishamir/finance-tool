// node shoot.mjs <port> <outdir> <name>=<path>[#selector]...  : full-page shots at 1280 and 390 (clipped to the page height, up to 6000px).
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [port, out, ...items] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const [w, h, tag, touch] of [[1280, 900, "pc", false], [390, 844, "phone", true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("pageerror", e.message));
  for (const it of items) {
    const [name, spec] = it.split("=");
    const [path, sel] = spec.split("@");
    await page.goto(`http://127.0.0.1:${port}/finance-tool${path}`, { waitUntil: "networkidle" });
    if (sel) {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: `${out}/${name}-${tag}.png` });
    } else {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: true, clip: undefined });
    }
    console.log(name, tag);
  }
  await ctx.close();
}
await browser.close();
