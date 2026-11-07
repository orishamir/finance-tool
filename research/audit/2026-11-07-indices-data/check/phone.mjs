import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const [base, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
for (const [idx, t] of [["sp500", "לא מושווה"], ["sp500", "מול מדד נטו"], ["msci-world", "מול מדד נטו"]]) {
  await p.goto(`${base}/indices/${idx}`, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const l = p.getByText(t, { exact: true }).locator("visible=true").first();
  if (!(await l.count())) { console.log("missing", idx, t); continue; }
  await l.scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -300)); await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/funds-${idx}-390-${t === "לא מושווה" ? "unstated" : "net"}.png` });
  const box = await l.evaluate((e) => { const r = e.getBoundingClientRect(); const c = e.parentElement.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), Math.round(c.width)]; });
  console.log(idx, t, box);
}
await b.close();
