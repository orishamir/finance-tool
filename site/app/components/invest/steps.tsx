// "מה עושים עכשיו" (three steps) and the page's footnote (the return used and whether the order holds).
import { useState } from "react";
import { Link } from "react-router";
import { invest as c } from "../../copy";
import type { InvestView } from "../../lib/invest";
import { IconCopy } from "../icons";
import { Num } from "../provenance";
import { Button, Disclosure, Sentence } from "../kit";
import { ProviderLink, providerName } from "./sections";

export function Steps({ view, monthly, pick }: { view: InvestView; monthly: import("../../lib/value").SiteValue; pick?: { house: string; fund: string } | null }) {
  // the person's chosen account and fund (the two linked lists, 2026-10-27), else the cheapest way
  const chosen = pick ? view.options.flatMap((o) => o.funds).find((f) => f.rec.id === pick.fund) : undefined;
  const w = chosen && pick ? { fund: chosen, providerId: pick.house } : (view.headline ?? view.options.find((o) => o.bestWay)?.bestWay ?? null);
  const p = w ? providerName(view, w.providerId) : view.genericHeadline ? providerName(view, view.genericHeadline.cell.providerId) : undefined;
  const yours = view.yourBroker ? providerName(view, view.yourBroker) : undefined;
  const [copied, setCopied] = useState(false);
  if (!p) return null;
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const stay = !!yours && yours.id === p.id;
  return (
    <div className="flex flex-col gap-3 pt-2">
      <ol className="flex flex-col gap-3 list-decimal ps-6 max-w-measure marker:font-semibold">
        <li className="ps-1">
          <span>
            {stay ? (
              c.steps.stay(p.name)
            ) : (
              <>
                {c.steps.openLead}
                <ProviderLink p={p} className="font-medium" />
              </>
            )}
          </span>
          {yours && !stay && !pick && view.atYours?.less && typeof view.atYours.less.value === "number" && view.atYours.less.value > 0.5 && (
            <Sentence as="span" size="sm" tone="muted">
              {c.steps.stayDiff}: <Num value={view.atYours.less} />
            </Sentence>
          )}
          <div>
            <Link to={`/switch/brokerage-account?to=${encodeURIComponent(p.id)}${yours ? `&from=${encodeURIComponent(yours.id)}` : ""}`} className="text-sm text-link hover:underline min-h-target inline-flex items-center">
              {c.steps.switchLink}
            </Link>
          </div>
        </li>
        <li className="ps-1">
          {w ? (
            <span className="flex flex-col gap-1">
              <span>{c.steps.buy(w.fund.name)}</span>
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">{c.steps.buyNumber}</span>
                <bdi dir="ltr" className="font-mono">{w.fund.number}</bdi>
                <Button variant="quiet" onClick={() => copy(w.fund.number)}>
                  <IconCopy size={14} />
                  {copied ? c.steps.copied : c.steps.copy}
                </Button>
              </span>
            </span>
          ) : (
            c.steps.buyCustom
          )}
        </li>
        <li className="ps-1">
          <Sentence as="span">
            {c.steps.standing}: <Num value={monthly} />
          </Sentence>
        </li>
      </ol>
    </div>
  );
}

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
