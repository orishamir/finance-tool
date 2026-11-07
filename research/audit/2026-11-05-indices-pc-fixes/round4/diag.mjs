// Diagnostic: which blocks change height for one action (the source of a move, not the footer it pushes).
//   node diag.mjs <base> <width> <path> <action: slider:i:key | fund:key | account:key | sheet | wait> [seed]
import { ACCOUNTS, BASES, FUNDS, context, landmarks, launch, load, pickRow, settle } from "./lib.mjs";
const [, , baseKey, w, path, action, seedArg] = process.argv;
const b = await launch();
const ctx = await context(b, Number(w), seedArg ? { seed: new URL("./seed-typed.json", import.meta.url).pathname } : {});
const page = await ctx.newPage();
await load(page, BASES[baseKey] + path);
const a = await landmarks(page);
const [kind, x, y] = action.split(":");
if (kind === "slider") { await page.locator("main input[type=range], main [role=slider]").nth(Number(x)).focus(); await page.keyboard.press(y); await settle(page, 1300); }
else if (kind === "fund") await pickRow(page, FUNDS, x);
else if (kind === "account") await pickRow(page, ACCOUNTS, x);
else if (kind === "sheet") { await page.locator("main button", { hasText: /^שינוי$/ }).first().click(); await settle(page, 700); }
else await settle(page, 3000);
await settle(page, 800);
const c = await landmarks(page);
const bm = new Map(c.marks.map((m) => [m.k, m]));
const grew = [];
for (const m of a.marks) { const n = bm.get(m.k); if (!n) continue; const dh = (n.bottom - n.top) - (m.bottom - m.top); if (Math.abs(dh) > 1) grew.push({ dh: Math.round(dh), depth: m.k.split("/").length, k: m.k.slice(-90), txt: m.txt, top: Math.round(m.top) }); }
grew.sort((p, q) => q.depth - p.depth);
for (const g of grew.filter((g, i, all) => !all.some((o) => o !== g && o.k.length > g.k.length && o.k.startsWith(g.k.slice(0, 10)) && false))) console.log(g.dh, g.depth, g.top, g.txt, "|", g.k);
console.log("H", a.H, "->", c.H);
await b.close();
