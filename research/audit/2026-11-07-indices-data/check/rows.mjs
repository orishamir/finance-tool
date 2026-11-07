import { createRequire } from "node:module";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/");
const { chromium } = require("playwright");
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
for (const idx of process.argv.slice(3)) {
  await p.goto(`${process.argv[2]}/indices/${idx}`, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const rows = await p.evaluate(() => [...document.querySelectorAll("[role=radio], [role=radiogroup] > *")].map((r) => r.innerText.replace(/\s+/g, " ")).filter((t) => /מושווה|בשנה ·|נאסף|שנה מלאה|נטו/.test(t)));
  console.log("==", idx, rows.length);
  for (const r of rows) { const m = r.match(/^(.{0,70}).*?((?:לא מושווה|[+−-]\d[\d.]*%[^·]*· [^₪]*?(?=\s[‎−+\d]|$)|עוד לא נאסף|אין שנה מלאה))/); console.log("  ", m ? m[1].slice(0, 60) + " ⇒ " + m[2] : r.slice(0, 120)); }
}
await b.close();
