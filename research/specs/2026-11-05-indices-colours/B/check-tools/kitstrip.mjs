// The kit gallery's PeriodStrip, today and with option B's three neutrals, side by side.
import { createRequire } from "module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const OUT = process.argv[2];
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
page.setDefaultTimeout(8000);
await page.goto("https://orishamir.github.io/finance-tool/kit", { waitUntil: "networkidle" });
const sel = ".bg-chart-value.text-background, .bg-chart-net.text-background, .bg-chart-alt.text-background";
await page.waitForSelector(sel);
const shot = async (name) => {
  const el = page.locator(sel).first(); await el.scrollIntoViewIfNeeded();
  const host = el.locator("xpath=ancestor::div[.//span[contains(@class,'size-2.5')]][1]");
  await host.screenshot({ path: `${OUT}/kit-strip-${name}.png` });
  console.log(name, await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => getComputedStyle(e).backgroundColor + " '" + e.textContent.trim().slice(0, 30) + "'").join(" | "), sel));
};
await shot("today");
await page.addStyleTag({ content: ":root{--chart-value: var(--palette-neutral-200); --chart-net: var(--palette-neutral-300); --chart-alt: var(--palette-neutral-400)}" });
await page.waitForTimeout(200);
await shot("B");
await b.close();
