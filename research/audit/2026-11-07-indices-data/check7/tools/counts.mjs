// Independent check of pass 7, lens 6: every count on an index page as a reader sees it (the filter chips, the group heads, the fold's
// button, the tie's words on the tiles and rows), beside the fund rows themselves (each row's number and the "same fund as" words that pair
// a Tel Aviv row with its foreign twin). Usage: BASE=... node counts.mjs <slug...>
import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const base = process.env.BASE;
const slugs = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
for (const w of [1440, 390]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: w > 500 ? 900 : 844 }, hasTouch: w < 500, isMobile: w < 500 })).newPage();
  for (const slug of slugs) {
    await page.goto(`${base}/indices/${slug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const vis = (e) => e && e.offsetParent !== null && !e.closest('[aria-hidden="true"]') && !e.closest(".invisible");
      const list = [...document.querySelectorAll('[role="radiogroup"]')].find((g) => /קרנות/.test(g.getAttribute("aria-label") ?? ""));
      const rows = list ? [...list.querySelectorAll('[role="radio"][data-pick-key]')].filter(vis) : [];
      const allRows = list ? [...new Set([...list.querySelectorAll('[role="radio"][data-pick-key]')].map((x) => x.getAttribute("data-pick-key")))] : [];
      const twins = rows.filter((x) => /אותה קרן כמו/.test(x.innerText)).map((x) => x.getAttribute("data-pick-key"));
      const heads = list ? [...list.querySelectorAll("*")].filter((e) => vis(e) && /· .*קרנות?|· קרן אחת|· שתי קרנות/.test(e.textContent ?? "") && e.children.length < 4 && (e.textContent ?? "").length < 90).map((e) => e.textContent.trim()) : [];
      const chips = [...document.querySelectorAll("button, label")].filter((b) => vis(b) && b.closest("[role=group], fieldset, [data-filter]") && /\d/.test(b.innerText) && b.innerText.length < 50).map((b) => b.innerText.replace(/\s+/g, " ").trim());
      const fold = [...document.querySelectorAll("button")].filter((b) => vis(b) && /^עוד .*קרנ|^עוד קרן/.test(b.innerText.trim())).map((b) => b.innerText.trim());
      const tie = [...document.querySelectorAll("span, p")].filter((s) => vis(s) && /הזוגות הזולים|הקרנות השקולות|שקול/.test(s.textContent ?? "") && s.children.length === 0).map((s) => s.textContent.trim());
      return { rows: rows.length, allRows: allRows.length, twins, heads: [...new Set(heads)], chips: [...new Set(chips)], fold, tie: [...new Set(tie)] };
    });
    console.log(`== ${w} ${slug}: fund rows shown ${r.rows} of ${r.allRows}; rows naming a twin: ${r.twins.join(", ") || "none"}`);
    console.log(`   heads: ${r.heads.join(" / ")}`);
    console.log(`   chips: ${r.chips.join(" / ")}`);
    console.log(`   fold: ${r.fold.join(" / ") || "none"}`);
    console.log(`   tie: ${r.tie.join(" / ") || "none"}`);
  }
  await page.context().close();
}
await browser.close();
