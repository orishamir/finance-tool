// Asks the live page what one element is: its tag, role, whether it acts, and its box.   node probe.mjs <path> <text> [pc|phone]
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const BASE = "https://orishamir.github.io/finance-tool";
const [path, ...texts] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "he-IL" })).newPage();
await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
for (const t of texts) {
  const r = await page.evaluate((t) => {
    const els = [...document.querySelectorAll("body *")].filter((e) => (e.innerText ?? "").replace(/\s+/g, " ").trim() === t || e.getAttribute("aria-label") === t);
    return els.slice(0, 4).map((e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { tag: e.tagName, role: e.getAttribute("role"), aria: e.getAttribute("aria-label"), acts: !!e.closest("a,button,summary,[role=button],[role=radio],label"), closest: e.closest("a,button,summary,[role=button],[role=radio]")?.outerHTML.slice(0, 160), cursor: cs.cursor, x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height), html: e.outerHTML.slice(0, 200) }; });
  }, t);
  console.log(t, JSON.stringify(r, null, 1));
}
await browser.close();
