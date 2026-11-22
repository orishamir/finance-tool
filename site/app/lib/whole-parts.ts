// Whole numbers that add up to a set total (largest remainder): a sentence of parts never disagrees with its total. The cost bars
// (kit CostStack) and the index page's receipt (lib/receipt) share it.
/**
 * Whole shekels that add up to `target` (by default the rounded sum; largest remainder): a sentence of parts never disagrees with its total.
 * `can`: the parts whose amounts are written; the rounding goes only to them, and an amount not written is only rounded.
 */
export function wholeParts(xs: number[], target = Math.round(xs.reduce((a, x) => a + x, 0)), can?: readonly boolean[]): number[] {
  const ok = (i: number) => !can || !!can[i];
  // rounding moves each part by less than a shekel, and a target made of rounded figures (a bar's total is the rounded value without costs
  // less the rounded value left, less a group's rounded figure) is up to a shekel and a half from its exact sum: a target further off than
  // both is a part missing from the sum, never rounding (with the remainder dropped, its shekels went to the
  // other parts and every sum still matched; a hedged pair on MSCI ACWI was 1.46 off with one written part, and the page fell over)
  // plus the float's own precision on a huge total (a plan typed at 1,000 billion ₪ for 40 years at 50% gives
  // figures near 10^18, whose last 512 ₪ a double cannot hold; the guard fired on every bar there)
  const room = Math.max(1, xs.filter((_, i) => ok(i)).length) + 1.5 + Math.abs(target) * 1e-12;
  const off = target - xs.reduce((a, x) => a + x, 0);
  // a check for the builders: in tests and in development it stops the render; on the site the page goes on with the amounts rounded
  if (Math.abs(off) > room + 1e-6) {
    const msg = `wholeParts: the target ${target} is ${off.toFixed(2)} from the parts' sum, more than a shekel a part (${room})`;
    if (import.meta.env.DEV) throw new Error(msg);
    console.error(msg);
  }
  const out = xs.map((x, i) => (ok(i) ? Math.floor(x) : Math.round(x)));
  const order = xs.map((x, i) => ({ i, r: x - Math.floor(x) })).filter((x) => ok(x.i)).sort((a, b) => b.r - a.r);
  if (order.length === 0) return out;
  let left = target - out.reduce((a, x) => a + x, 0);
  for (let k = 0; left > 0; k++, left--) out[order[k % order.length]!.i]! += 1;
  for (let k = order.length - 1; left < 0; k--, left++) out[order[((k % order.length) + order.length) % order.length]!.i]! -= 1;
  return out;
}

