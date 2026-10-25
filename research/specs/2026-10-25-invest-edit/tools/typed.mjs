import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const out = process.argv[2]; const B = "http://127.0.0.1:4231/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "he-IL" });
const page = await ctx.newPage();
await page.goto(B + "/invest/index-sp500", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
const top = async () => (await page.locator("main").innerText()).match(/הדרך הזולה[\s\S]{0,80}/)?.[0].replace(/\n/g, " ");
console.log("before", await top());
await page.getByRole("button", { name: /^סכום/ }).first().click(); await page.waitForTimeout(500);
const inputs = page.getByRole("dialog").locator("input");
const n = 0;
for (let i = 0; i < n; i++) console.log(i, await inputs.nth(i).getAttribute("type"), await inputs.nth(i).getAttribute("inputmode"), await inputs.nth(i).evaluate((e) => (e.closest("div")?.parentElement?.innerText || "").slice(0, 30).replace(/\n/g, "|")));

const amt = inputs.nth(2);
await amt.click(); await page.keyboard.type("50000", { delay: 50 }); await page.waitForTimeout(700);
console.log("value", await amt.inputValue());
await page.keyboard.press("Tab"); await page.waitForTimeout(700);
await page.getByRole("dialog").getByRole("button", { name: /סגירה|close/i }).first().click().catch(() => page.keyboard.press("Escape"));
await page.waitForTimeout(700);
console.log("after", await top());
console.log("chips", JSON.stringify(await page.locator(".a-chip").allInnerTexts()));
for (const p of ["/fees?wrapper=brokerage-account", "/goal/compare"]) { await page.goto(B + p, { waitUntil: "networkidle" }); await page.waitForTimeout(2500); console.log(p, JSON.stringify(await page.locator(".a-chip").allInnerTexts())); await page.screenshot({ path: `${out}/typed_${p.replace(/\W+/g, "_")}.png` }); }
await browser.close();
