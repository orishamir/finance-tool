import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [path, width, bank] = process.argv.slice(2);
const VIEW = width === "phone" ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } };
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const ctx = await browser.newContext({ ...VIEW, locale: "he-IL", colorScheme: "dark" });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:4816/finance-tool${path}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const s = page.locator("select").filter({ has: page.locator("option", { hasText: "לא באחד מהבנקים האלה" }) }).first();
await s.evaluate((e) => e.scrollIntoView({ block: "center" }));
await page.waitForTimeout(2500);
const boxes = () => page.evaluate(() => {
  const g = document.querySelector("[role=radiogroup]");
  const rows = [...g.querySelectorAll(":scope > [role=radio][data-pick-key]")].map((r) => { const b = r.getBoundingClientRect(); return { k: r.dataset.pickKey, y: Math.round(b.top), h: Math.round(b.height), vis: b.bottom > 0 && b.top < innerHeight }; });
  const sel = document.querySelector("select").getBoundingClientRect();
  return { rows, sel: Math.round(sel.top), scrollY };
});
if (process.env.PICK) { await page.locator(`[role=radio][data-pick-key="${process.env.PICK}"]`).first().focus(); await page.keyboard.press(" "); await page.waitForTimeout(3000); console.log("checked", await page.locator(`[role=radio][data-pick-key="${process.env.PICK}"]`).first().getAttribute("aria-checked")); await s.evaluate((e) => e.scrollIntoView({ block: "center" })); await page.waitForTimeout(2500); }
const before = await boxes();
if (process.env.NATIVE) { await s.evaluate((e, v) => { const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set; set.call(e, v); e.dispatchEvent(new Event("change", { bubbles: true })); e.dispatchEvent(new Event("input", { bubbles: true })); }, bank); } else await s.selectOption(bank);
const samples = [];
for (const t of [100, 300, 600, 1000, 2000, 3500]) { await page.waitForTimeout(t - (samples.at(-1)?.t ?? 0)); samples.push({ t, b: await boxes() }); }
console.log("select top", before.sel, "->", samples.at(-1).b.sel, "scrollY", before.scrollY, "->", samples.at(-1).b.scrollY);
for (const r of before.rows.filter((r) => r.vis)) {
  const traj = samples.map((s) => { const x = s.b.rows.find((q) => q.k === r.k); return x ? `${x.y}/${x.h}` : "-"; });
  console.log(r.k.padEnd(18), `${r.y}/${r.h}`, "->", traj.join(" "));
}
await browser.close();
