// Diagnostic: every block (to depth 7) whose box changes for one action after a sequence, on the branch build.
//   node diag2.mjs <width> <path> <setup: ends|none> <action: account:key | fund:key | slider:i:key>
import { ACCOUNTS, BASES, FUNDS, context, launch, load, pickRow, settle } from "./lib.mjs";
const [, , w, path, setup, action] = process.argv;
const b = await launch();
const ctx = await context(b, Number(w));
const page = await ctx.newPage();
const url = BASES.branch + path;
await load(page, url);
const sl = () => page.locator("main input[type=range], main [role=slider]");
if (setup === "ends") {
  const n = await sl().count();
  for (let i = 0; i < n; i++) for (const k of ["End", "Home", "End"]) { await sl().nth(i).focus(); await page.keyboard.press(k); await settle(page, 300); }
  for (let i = 0; i < n; i++) { await sl().nth(i).focus(); await page.keyboard.press("Home"); await settle(page, 300); }
  await load(page, url);
}
const snap = () => page.evaluate(() => { const out = new Map(); const walk = (el, d, path) => { const seen = {}; for (const c of el.children) { const s = c.tagName.toLowerCase() + "." + (c.getAttribute("class") || "").split(" ").slice(0, 3).join("."); const n = (seen[s] = (seen[s] ?? -1) + 1); const k = path + "/" + s + "#" + n; if (c.closest(".invisible,[aria-hidden=true]")) continue; const r = c.getBoundingClientRect(); out.set(k, [Math.round(r.top + scrollY), Math.round(r.height), (c.textContent || "").trim().slice(0, 40)]); if (d < 7) walk(c, d + 1, k); } }; walk(document.querySelector("main"), 0, ""); return [...out]; });
const a = new Map(await snap());
const [kind, x, y] = action.split(":");
if (kind === "account") await pickRow(page, ACCOUNTS, x); else if (kind === "fund") await pickRow(page, FUNDS, x); else { await sl().nth(Number(x)).focus(); await page.keyboard.press(y); await settle(page, 1300); }
await settle(page, 800);
const c = new Map(await snap());
const rows = [];
for (const [k, [t, h, txt]] of a) { const n = c.get(k); if (!n) continue; if (n[1] !== h) rows.push([n[1] - h, n[0] - t, t, k.split("/").length, txt, k.slice(-100)]); }
rows.sort((p, q) => q[3] - p[3]);
for (const r of rows.slice(0, 25)) console.log(r.join(" | "));
await b.close();
