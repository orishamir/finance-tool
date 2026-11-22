// Whether the order of the lists holds at the ends of P-02's return range: said once under the lists, in sight (design.md: a "?" never
// holds a fact the choice needs). The "?" beside the return in the line under the sliders says what the return is and, where the order
// changes, which order changes at which end.
import { invest as c } from "../../copy";
import { sensitivityBound, type Flip, type InvestView } from "../../lib/invest";
import type { IndicesBundle } from "../../lib/providers";
import { Num } from "../provenance";
import { Tpl } from "../kit";

const flipWords = (w: Flip): string => (w.kind === "options" ? c.foot.flipWhat.options : w.kind === "brokers" ? c.foot.flipWhat.brokers(c.optionIn[w.option]!) : c.foot.flipWhat.funds(c.optionIn[w.option]!));

export function returnHelpOf(view: InvestView): string {
  const o = view.order;
  const which = o && !o.holds ? `${c.foot.flips} ${[...new Set(o.flips.map((f) => `${flipWords(f.what)} (${c.foot.flipsAt(f.at)})`))].join("; ")}.` : "";
  return [view.returnIllustrative ? c.foot.example : c.foot.enteredHelp, which].filter(Boolean).join(" ");
}

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
