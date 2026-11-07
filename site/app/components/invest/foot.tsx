// The page's footnote (the return used and whether the order holds).
import { invest as c } from "../../copy";
import type { InvestView } from "../../lib/invest";
import { Disclosure, LongestCase } from "../kit";

export function Foot({ view }: { view: InvestView }) {
  const o = view.order;
  const flips = o && !o.holds ? o.flips : [];
  const words = (f: (typeof flips)[number]) => {
    const w = f.what;
    return w.kind === "options" ? c.foot.flipWhat.options : w.kind === "brokers" ? c.foot.flipWhat.brokers(c.optionIn[w.option]!) : c.foot.flipWhat.funds(c.optionIn[w.option]!);
  };
  const everyWhat = [c.foot.flipWhat.options, ...view.options.filter((x) => x.exists).flatMap((x) => [c.foot.flipWhat.brokers(c.optionIn[x.id]!), c.foot.flipWhat.funds(c.optionIn[x.id]!)])];
  return (
    <footer className="flex flex-col gap-1.5 text-sm text-muted-foreground border-t border-border pt-4 max-w-measure">
      {/* one height for both words and whether or not a return was entered: this block closes the page, and the page's length holds */}
      <p className="max-md:min-h-[2lh]">
        {c.foot.returnUsed}: {view.returnIllustrative ? c.foot.example : c.foot.entered}
      </p>
      <div className="min-h-[1lh] max-md:min-h-[2lh]">
        {o && o.holds && <p>{c.foot.holds}</p>}
        {o && !o.holds && (
          <Disclosure plain label={c.foot.flipsSummary(new Set(flips.map((f) => words(f))).size)}>
            {/* opened, held at its longest list (every order on the index changing, at 0% and at 10%): a slider changes which orders change, and the lines
                under it moved 112 px on a phone (#190) */}
            <LongestCase cases={[<p key="all" className="mt-1">{`${c.foot.flips} ${everyWhat.flatMap((w) => [0, 10].map((at) => `${w} (${c.foot.flipsAt(at)})`)).join("; ")}.`}</p>]}>
              <p className="mt-1">{`${c.foot.flips} ${[...new Set(flips.map((f) => `${words(f)} (${c.foot.flipsAt(f.at)})`))].join("; ")}.`}</p>
            </LongestCase>
          </Disclosure>
        )}
      </div>
      <p>{c.foot.values}</p>
      <p>{c.foot.sharePrice}</p>
      <p>{c.foot.engine}</p>
      <p>{c.foot.d27}</p>
    </footer>
  );
}
