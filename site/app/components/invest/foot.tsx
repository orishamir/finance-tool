// Whether the order of the lists holds at the ends of P-02's return range: said once under the lists, in sight (design.md: a "?" never
// holds a fact the choice needs).
import { invest as c } from "../../copy";
import { sensitivityBound, type InvestView } from "../../lib/invest";
import type { IndicesBundle } from "../../lib/providers";
import { Num } from "../provenance";
import { Tpl } from "../kit";

/** Whether the lists' order is the same at both ends of P-02's yearly return range (A-01), each end a figure that opens P-02; nothing where the page checked no order (an entered return). */
export function OrderLine({ view, bundle }: { view: InvestView; bundle: Pick<IndicesBundle, "p02"> }) {
  const o = view.order;
  const lo = sensitivityBound(bundle, "A-01", "lo"), hi = sensitivityBound(bundle, "A-01", "hi");
  if (!o || !lo || !hi) return null;
  const at = { lo: <Num value={lo} />, hi: <Num value={hi} /> };
  if (o.holds) return <Tpl t={c.foot.holds} vars={at} />;
  const atLo = o.flips.some((f) => f.at === lo.value), atHi = o.flips.some((f) => f.at === hi.value);
  return atLo && atHi ? <Tpl t={c.foot.changes.both} vars={at} /> : <Tpl t={c.foot.changes.one} vars={{ at: atLo ? at.lo : at.hi }} />;
}
