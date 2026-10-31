// The page's footnote (the return used and whether the order holds).
import { invest as c } from "../../copy";
import type { InvestView } from "../../lib/invest";
import { Disclosure } from "../kit";

export function Foot({ view }: { view: InvestView }) {
  const o = view.order;
  const flips = o && !o.holds ? o.flips : [];
  const words = (f: (typeof flips)[number]) => {
    const w = f.what;
    return w.kind === "options" ? c.foot.flipWhat.options : w.kind === "brokers" ? c.foot.flipWhat.brokers(c.optionIn[w.option]!) : c.foot.flipWhat.funds(c.optionIn[w.option]!);
  };
  return (
    <footer className="flex flex-col gap-1.5 text-sm text-muted-foreground border-t border-border pt-4 max-w-measure">
      <p>
        {c.foot.returnUsed}: {view.returnIllustrative ? c.foot.example : c.foot.entered}
      </p>
      {o && o.holds && <p>{c.foot.holds}</p>}
      {o && !o.holds && (
        <Disclosure plain label={c.foot.flipsSummary(new Set(flips.map((f) => words(f))).size)}>
          <p className="mt-1">{`${c.foot.flips} ${[...new Set(flips.map((f) => `${words(f)} (${c.foot.flipsAt(f.at)})`))].join("; ")}.`}</p>
        </Disclosure>
      )}
      <p>{c.foot.values}</p>
      <p>{c.foot.sharePrice}</p>
      <p>{c.foot.engine}</p>
      <p>{c.foot.d27}</p>
    </footer>
  );
}
