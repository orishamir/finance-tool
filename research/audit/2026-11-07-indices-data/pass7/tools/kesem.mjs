// Item 2: on the MSCI ACWI, the two hedged funds whose gaps are 2.93 and 2.91: pick each, shoot its card and the sheet of the value it leaves.
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" })).newPage();
for (const id of ["1147362", "1144336"]) {
  await page.goto(`${base}/indices/msci-acwi`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const row = page.locator(`[data-pick-key="${id}"]`).first();
  await row.scrollIntoViewIfNeeded();
  await row.locator("span.font-semibold").first().click();
  await page.waitForTimeout(1200);
  // the fund card
  const card = page.getByText("כל הקרנות על מדד", { exact: false }).first();
  await card.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -260));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/kesem-${id}-card.png` });
  const fees = await page.evaluate(() => [...document.querySelectorAll("span")].filter((s) => s.textContent?.startsWith("דמי ניהול:") && s.offsetParent && !s.closest('[aria-hidden="true"]')).map((s) => s.textContent).join(" || "));
  console.log(id, "CARD:", fees);
  // the tile's value sheet (the person's pair)
  await page.evaluate(() => window.scrollTo(0, 0));
  const texts = await page.locator("button.num-computed:visible").allInnerTexts();
  console.log(texts.slice(0, 6).join(" / "));
  const tile = page.locator("button.num-computed:visible").filter({ hasText: /^\d{2},\d{3} ₪$/ }).nth(1);
  await tile.scrollIntoViewIfNeeded();
  await tile.click();
  await page.waitForTimeout(700);
  const txt = await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].pop()?.innerText ?? "");
  console.log(id, "SHEET:", txt.replace(/\n+/g, " | ").slice(0, 1500));
  await page.screenshot({ path: `${out}/kesem-${id}-sheet.png` });
  const b = page.locator("dialog[open] .sheet-body");
  await b.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/kesem-${id}-sheet-end.png` });
  await page.keyboard.press("Escape");
}
await browser.close();
