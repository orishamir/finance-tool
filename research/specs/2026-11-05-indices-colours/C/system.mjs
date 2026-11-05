// Search the whole page at once for option C: families {orange, gold, magenta, rose} go to
// Israel (dots, ticks, kind chips), abroad (dots, ticks, abroad chip, conversion fee), buy-and-sell fee, keeping the account.
import { H, check, CARD, POP, SEL } from "./lab.mjs";
const steps = { orange: ["orange-400","orange-500","orange-600"], gold: ["gold-200"], magenta: ["magenta-400"], rose: ["rose-300","rose-400","rose-500","rose-600"] };
const perms = (a) => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
const ok = (keys, surface = CARD, cvdMin = 6) => { const r = check(keys.map(H), surface, "all"); return r.normal >= 15 && r.cvd >= cvdMin ? r : null; };
const out = [];
for (const [fI, fA, fT, fK] of perms(["orange", "gold", "magenta", "rose"])) {
  for (const I of steps[fI]) for (const A of steps[fA]) for (const T of steps[fT]) for (const K of steps[fK])
  for (const Ic of steps[fI]) for (const Ac of steps[fA]) for (const R of ["neutral-400","neutral-500","neutral-600"]) for (const P of ["neutral-200","neutral-300","neutral-400"]) for (const Cw of ["amber-200","amber-300","amber-400"]) for (const Bw of ["red-200","red-300","red-400"]) {
    const dot = ok([I, A, "teal-300", "neutral-100"], CARD, 8); if (!dot) continue;
    const fee = ok([T, K, A, R], CARD, 6), feeS = fee && ok([T, K, A, R], SEL, 6), feeP = fee && ok([T, K, A, R], POP, 6); if (!fee || !feeS || !feeP) continue;
    const chip = ok([Ic, Ac, P, Cw, Bw], CARD, 6); if (!chip) continue;
    out.push({ s: Math.min(dot.normal, fee.normal, chip.normal) + Math.min(dot.cvd, fee.cvd, chip.cvd), fI, fA, fT, fK, I, A, T, K, Ic, Ac, R, P, Cw, Bw, dot: [dot.normal, dot.cvd], fee: [fee.normal, fee.cvd], chip: [chip.normal, chip.cvd] });
  }
}
out.sort((a, b) => b.s - a.s);
console.log(out.length, "passing systems");
for (const o of out.slice(0, 25)) console.log(JSON.stringify(o));
