// The fund chips once the six families lose their hue: one plain ink, the caution words and the open-rule words, all pairs.
import { check, H } from "./lib.mjs";
const out = [];
for (const p of ["neutral-100", "neutral-200", "neutral-300", "neutral-400", "neutral-500"])
  for (const c of ["amber-200", "amber-300", "amber-400"])
    for (const b of ["red-200", "red-300", "red-400"]) {
      const r = check([p, c, b]);
      const changes = (c !== "amber-200") + (b !== "red-200");
      out.push({ p, c, b, n: r.normal, cv: r.cvd, k: r.cvdKind, pair: r.normalPair, changes });
    }
out.sort((x, y) => x.changes - y.changes || y.n - x.n);
for (const o of out) if (o.n >= 15) console.log(o.changes, o.p, o.c, o.b, "normal", o.n.toFixed(1), o.pair, "cvd", o.cv.toFixed(1), o.k);
