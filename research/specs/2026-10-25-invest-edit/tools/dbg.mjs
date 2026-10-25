import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const B = "http://127.0.0.1:4231/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "he-IL" })).newPage();
page.on("pageerror", (e) => console.log("pageerror", String(e).slice(0, 300)));
page.on("console", (m) => m.type() === "error" && console.log("console", m.text().slice(0, 300)));
page.on("crash", () => console.log("CRASH"));
await page.goto(B + "/invest", { waitUntil: "networkidle" }); await page.waitForTimeout(800);
await page.getByRole("button", { name: "אחר", exact: true }).click();
await page.getByPlaceholder("למשל ניקיי 225").fill("מדד בדיקה ארוך");
await page.getByRole("button", { name: "המשך" }).click();
await page.getByRole("button", { name: "כן", exact: true }).click();
await page.getByRole("button", { name: "שמירה במכשיר" }).click();
console.log("saved");
for (let i = 0; i < 5; i++) { await page.waitForTimeout(500); console.log(i, await Promise.race([page.evaluate(() => document.body.innerText.length), new Promise((r) => setTimeout(() => r("HUNG"), 3000))])); }
await browser.close();
