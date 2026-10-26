// probe: where the chips the round-3 shots need sit on their pages
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");
const base = "http://127.0.0.1:4237/finance-tool";
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const [path, id] of [["/guide/brokerage-account", "BRK-35"], ["/switch/brokerage-account", "SW-53"], ["/companies", "SW-53"]]) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  const chips = page.locator(`button.rule-chip[aria-label*="${id}"]`);
  const n = await chips.count();
  const vis = [];
  for (let i = 0; i < n; i++) vis.push(await chips.nth(i).isVisible());
  const text = n ? await chips.first().innerText() : "";
  console.log(path, id, n, vis.join(","), JSON.stringify(text));
  const toggles = await page.getByText("כללים", { exact: false }).count();
  console.log("  'כללים' texts:", toggles);
}
await browser.close();
