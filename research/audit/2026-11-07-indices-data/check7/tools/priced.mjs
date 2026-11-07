// Independent check of pass 7, lens 2: pick a fund, read its card's fee line and the sheet of the pair's value left (the one that lists the
// fund's yearly costs), as a reader sees them. Usage: BASE=... node priced.mjs <out dir> <slug:fund> ...
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = process.env.BASE;
const [out, ...pairs] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" })).newPage();
for (const p of pairs) {
  const [slug, id] = p.split(":");
  await page.goto(`${base}/indices/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const row = page.locator(`[role="radio"][data-pick-key="${id}"]:visible`).first();
  await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await row.click({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(900);
  const card = await page.evaluate(() => [...document.querySelectorAll("span")].filter((s) => /^דמי ניהול:/.test(s.textContent ?? "") && s.offsetParent && !s.closest('[aria-hidden="true"]') && !s.closest(".invisible")).map((s) => s.innerText.replace(/\s+/g, " ")).join(" || "));
  console.log(`== ${slug} ${id}\nCARD: ${card}`);
  // the result's computed figures, top of the page first, until one sheet lists the fund's own yearly costs
  const buttons = page.locator("button.num-computed:visible");
  const n = await buttons.count();
  let found = false;
  for (let i = 0; i < Math.min(n, 12) && !found; i++) {
    const b = buttons.nth(i);
    const t = (await b.innerText()).trim();
    if (!/₪/.test(t)) continue;
    await b.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await b.click();
    await page.waitForTimeout(600);
    const txt = await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].pop()?.innerText ?? "");
    if (/הקרן: דמי ניהול קבועים/.test(txt)) {
      found = true;
      console.log(`SHEET of ${t}:\n${txt.replace(/\n+/g, " | ")}`);
      await page.screenshot({ path: `${out}/priced-${slug}-${id}-sheet.png` });
      // the A-07 line's own sheet: the years it rests on
      const a07 = page.locator("dialog[open] button").filter({ hasText: /%/ }).last();
      const beyond = page.locator("dialog[open] .sheet-body").getByText(/פיגור מעבר/).first();
      if (await beyond.count()) {
        const btn = beyond.locator("xpath=following::button[1]");
        if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(500);
          const t2 = await page.evaluate(() => [...document.querySelectorAll("dialog[open]")].pop()?.innerText ?? "");
          console.log(`A-07 SHEET:\n${t2.replace(/\n+/g, " | ")}`);
          await page.screenshot({ path: `${out}/priced-${slug}-${id}-a07.png` });
        }
      }
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }
  if (!found) console.log("NO SHEET with the fund's costs");
}
await browser.close();
