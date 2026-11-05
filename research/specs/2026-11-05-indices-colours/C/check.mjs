// Option C: every chart, legend, bar and chip row on the indices page, through the dataviz validator (the CLI, dark mode).
// Writes check.txt (the validator's own words) and check.json (for swatches.mjs). Run from the repository root:
//   node research/specs/2026-11-05-indices-colours/C/check.mjs
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { H, V, CARD, POP, SEL, pal } from "./lab.mjs";
import { C } from "./tokens.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const ok = (k) => `oklch(${pal[k].join(" ")})`;

// [name, Hebrew title for the swatch sheet, [[meaning in Hebrew, palette step]], surface, pairs, note]
const G = [
  ["Account rows: fee bar per row, all pairs (parts change order from row to row)", "כל החשבונות: פס העמלות בכל שורה", [["עמלות קנייה ומכירה", C.trade], ["דמי משמרת ודמי ניהול חשבון", C.keep], ["המרת מטבע", C.fx], ["העמלות זו על זו", C.rest]], CARD, "all"],
  ["Account rows: fee bar on the picked row's teal tint", "אותו פס, בשורה שנבחרה", [["עמלות קנייה ומכירה", C.trade], ["דמי משמרת ודמי ניהול חשבון", C.keep], ["המרת מטבע", C.fx], ["העמלות זו על זו", C.rest]], SEL, "all"],
  ["Own-price sheet: list and yours bars + legend (popover)", "בתנאים שלכם: פסי העלות והמקרא", [["עמלות קנייה ומכירה", C.trade], ["דמי משמרת ודמי ניהול חשבון", C.keep], ["המרת מטבע", C.fx], ["העמלות זו על זו", C.rest]], POP, "all"],
  ["No-fund section: house bars + legend", "חשבון בלי קרן: פסי העלות והמקרא", [["עמלות קנייה ומכירה", C.trade], ["דמי משמרת ודמי ניהול חשבון", C.keep], ["המרת מטבע", C.fx], ["העמלות זו על זו", C.rest]], CARD, "all"],
  ["NEW all-pairs dot plot + legend (place colour, kind shape, pick ring, path and best outline)", "כל הזוגות: נקודה לכל קרן", [["נקנית בישראל (עיגול, ריבוע, משולש)", C.israel], ["נקנית בחו״ל (מעוין)", C.abroad], ["הבחירה שלכם (טבעת)", C.pick], ["הדרך והזוג הטוב ביותר", C.path]], CARD, "all"],
  ["NEW result card strips (ticks by place, the pick ring, the track)", "כמה כל בחירה משנה: שני הפסים", [["קרן שנקנית בישראל", C.israel], ["קרן שנקנית בחו״ל", C.abroad], ["הבחירה שלכם (טבעת)", C.pick], ["הפס עצמו", "neutral-700"]], CARD, "all"],
  ["Fund chips and filter row, every tone", "כל הקרנות: התוויות ושורת הסינון", [["סוג הקרן, בישראל", C.israel], ["נקנית בחו״ל", C.abroad], ["תווית בלי צבע", C.plainChip], ["דורשת משהו מכם", C.chipCaution], ["כלל מס פתוח", C.chipBlocked]], CARD, "all"],
  ["Fund chips on the picked fund row's teal tint", "התוויות בשורה שנבחרה", [["סוג הקרן, בישראל", C.israel], ["נקנית בחו״ל", C.abroad], ["תווית בלי צבע", C.plainChip], ["דורשת משהו מכם", C.chipCaution], ["כלל מס פתוח", C.chipBlocked]], SEL, "all"],
  ["Fund group heads and dollar section fund bars: one grey, solid = unhedged, hollow = hedged", "בלי נטרול / עם נטרול: מלא מול חלול", [["בלי נטרול מט״ח (מלא) ועם נטרול (חלול)", C.unhedged]], CARD, "all"],
];
const ORD = [["Own-price sheet period strip (ordinal: from the start, some still hold, the price list after)", "בתנאים שלכם: פס התקופות", [["מחירי הקבוצה", C.period[0]], ["רק חלק ממחירי הקבוצה", C.period[1]], ["התעריפון", C.period[2]]], POP]];

const run = (hexes, surface, args) => { try { return execFileSync("node", [V, hexes.join(","), "--mode", "dark", "--surface", surface, ...args], { encoding: "utf8" }); } catch (e) { return e.stdout; } };
const grab = (out, name) => (out.split("\n").find((l) => l.includes(name)) || "").trim();
const num = (s) => +(s.match(/ΔE ([\d.]+)/) || [])[1];
const txt = [], res = [];
for (const [name, he, m, surface, pairs] of G) {
  const hexes = m.map(([, k]) => H(k));
  const args = pairs === "all" ? ["--pairs", "all"] : [];
  const out = run(hexes, surface, args);
  const nv = grab(out, "Normal-vision"), cv = grab(out, "CVD separation");
  const r = { name, he, meanings: m.map(([w, k]) => ({ he: w, step: k, oklch: ok(k), hex: H(k) })), surface, pairs, normal: num(nv) || null, cvd: num(cv) || null, normalLine: nv, cvdLine: cv, contrast: grab(out, "Contrast"), verdict: /FAIL\]/.test(nv) ? "FAIL" : /\[FAIL\] CVD/.test(out) ? "FAIL" : /floor|WARN/.test(cv) ? "PASS (CVD floor band, words on the mark)" : "PASS" };
  r.cmd = `node ${V} "${hexes.join(",")}" --mode dark --surface "${surface}"${pairs === "all" ? " --pairs all" : ""}`;
  res.push(r);
  txt.push(`## ${name}\n${r.cmd}\n${out}`);
}
for (const [name, he, m, surface] of ORD) {
  const hexes = m.map(([, k]) => H(k));
  const out = run(hexes, surface, ["--ordinal"]);
  const outAll = run(hexes, surface, ["--pairs", "all"]);
  const nv = grab(outAll, "Normal-vision"), cv = grab(outAll, "CVD separation");
  res.push({ name, he, meanings: m.map(([w, k]) => ({ he: w, step: k, oklch: ok(k), hex: H(k) })), surface, pairs: "ordinal", normal: num(nv), cvd: num(cv), normalLine: nv, cvdLine: cv, ordinal: out.split("\n").filter((l) => /\[/.test(l)).map((l) => l.trim()), verdict: /FAIL/.test(out) ? "FAIL" : "PASS", cmd: `node ${V} "${hexes.join(",")}" --mode dark --surface "${surface}" --ordinal` });
  txt.push(`## ${name}\n${res.at(-1).cmd}\n${out}\n(and as categorical, all pairs)\n${outAll}`);
}
writeFileSync(join(here, "check.txt"), txt.join("\n"));
writeFileSync(join(here, "check.json"), JSON.stringify(res, null, 1));
for (const r of res) console.log(r.verdict.padEnd(8), String(r.normal).padStart(5), String(r.cvd).padStart(5), r.name);
