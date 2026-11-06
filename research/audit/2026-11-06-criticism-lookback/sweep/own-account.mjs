// Adds an account on one's own terms on the index page, then looks at its row: can it be renamed, changed or deleted there?
//   node own-account.mjs <outDir>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const outDir = process.argv[2];
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "he-IL" })).newPage();
page.setDefaultNavigationTimeout(90000);
await page.goto("https://orishamir.github.io/finance-tool/indices/sp500", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
for (const [btn, field] of [["הוספת חשבון בתנאים שקיבלתם", "שם הבנק או בית ההשקעות"], ["הוספת קרן שלא ברשימה", "שם הקרן"]]) {
  await page.getByRole("button", { name: btn }).first().click();
  await page.waitForTimeout(800);
  await page.getByLabel(field).first().fill("בדיקה שלי");
  await page.getByRole("button", { name: "שמירה במכשיר" }).first().click();
  await page.waitForTimeout(1500);
}
const rows = await page.evaluate(() => [...document.querySelectorAll("[role=radio]")].filter((r) => r.innerText.includes("בדיקה שלי")).map((r) => {
  r.scrollIntoView({ block: "center" });
  const b = r.getBoundingClientRect();
  const ctrls = [...r.querySelectorAll("button, a")].map((c) => c.getAttribute("aria-label") || c.innerText.trim());
  const near = [...(r.parentElement?.querySelectorAll("button") ?? [])].filter((c) => !r.contains(c) && Math.abs(c.getBoundingClientRect().top - b.top) < b.height).map((c) => c.getAttribute("aria-label") || c.innerText.trim());
  return { text: r.innerText.replace(/\s+/g, " ").slice(0, 120), ctrls, near, y: Math.round(b.top + scrollY), x: Math.round(b.left), w: Math.round(b.width), h: Math.round(b.height) };
}));
console.log(JSON.stringify(rows, null, 1));
for (const [i, r] of rows.entries()) { await page.evaluate((y) => scrollTo(0, y - 300), r.y); await page.waitForTimeout(500); await page.screenshot({ path: `${outDir}/own-row-${i}.png` }); }
await browser.close();
