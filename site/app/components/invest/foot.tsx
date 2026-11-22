// What the return the page runs on is, and whether the order of the lists holds at another return: said in the "?" beside the return in
// the line under the sliders (wording.md: a note beside the figure it qualifies, not collected at the page's foot).
import { invest as c } from "../../copy";
import type { InvestView } from "../../lib/invest";

export function returnHelpOf(view: InvestView): string {
  const o = view.order;
  const flips = o && !o.holds ? o.flips : [];
  const words = (f: (typeof flips)[number]) => {
    const w = f.what;
    return w.kind === "options" ? c.foot.flipWhat.options : w.kind === "brokers" ? c.foot.flipWhat.brokers(c.optionIn[w.option]!) : c.foot.flipWhat.funds(c.optionIn[w.option]!);
  };
  const order = !o ? "" : o.holds ? c.foot.holds : `${c.foot.flips} ${[...new Set(flips.map((f) => `${words(f)} (${c.foot.flipsAt(f.at)})`))].join("; ")}.`;
  return [view.returnIllustrative ? c.foot.example : c.foot.enteredHelp, order].filter(Boolean).join(" ");
}
