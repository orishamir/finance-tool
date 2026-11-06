// Which step can carry the fixed account fee beside the kept orange-500, gold-200, magenta-400 and neutral-500, all pairs?
import { check, H, CARD, POP, SEL } from "./lib.mjs";
const keep = ["orange-500", "gold-200", "magenta-400", "neutral-500"];
const fams = ["rose", "red", "orange", "amber", "neutral"];
for (const f of fams) for (const s of [200, 300, 400, 500, 600]) {
  const k = `${f}-${s}`; try { H(k); } catch { continue; }
  const r = check([...keep, k]);
  const vsBlocked = check([k, "red-400"]).normal, vsCaution = check([k, "amber-400"]).normal;
  console.log(k.padEnd(12), H(k), "normal", r.normal.toFixed(1), r.normalPair, "cvd", r.cvd.toFixed(1), r.cvdKind, r.cvdPair, "| vs blocked", vsBlocked.toFixed(1), "vs caution", vsCaution.toFixed(1));
}
