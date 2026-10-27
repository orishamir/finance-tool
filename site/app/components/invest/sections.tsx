// The index page's top sections: the index header, and the headline card an index with no fund records still uses (the linked lists, components/invest/pair.tsx, replaced the rest on 2026-10-27).
import { Link } from "react-router";
import { invest as c } from "../../copy";
import type { Bar, InvestView, OptionView, ProviderInfo } from "../../lib/invest";
import { optionLabels } from "../../lib/labels";
import type { SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { Callout, Card, cx, KeyValue, LabelRow, Sentence, Tag, Tpl } from "../kit";
import { OptionTag } from "./parts";

export const providerName = (view: InvestView, id: string): ProviderInfo | undefined => view.providers.find((p) => p.id === id);

/** The house's name as a link to its page; `short` writes the short name (the rows of a list), the full name otherwise. */
export function ProviderLink({ p, className, short }: { p: ProviderInfo; className?: string; short?: boolean }) {
  const name = short ? p.short : p.name;
  return p.hasPage ? (
    <Link to={`/companies/${p.id}`} className={cx("text-link hover:underline", className)}>
      {name}
    </Link>
  ) : (
    <span className={className}>{name}</span>
  );
}

// ---------------------------------------------------------------- 4. the index header

export function IndexHeader({ view, onChangeAnswer }: { view: InvestView; onChangeAnswer: (() => void) | null }) {
  const { index } = view;
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl lg:text-2xl font-semibold">{index.name}</h2>
        <Tag tone="neutral">{index.israeli ? c.chips.israeliTag : c.chips.foreignTag}</Tag>
      </div>
      <p className="text-muted-foreground max-w-measure">{index.oneLine ?? (index.israeli ? c.header.israeliNote : c.header.foreignNote)}</p>
      {index.oneLine && <p className="text-sm text-muted-foreground max-w-measure">{index.israeli ? c.header.israeliNote : c.header.foreignNote}</p>}
      {index.custom && (
        <p className="text-sm flex flex-wrap items-center gap-x-3">
          <span>{c.custom.savedNote}</span>
          {onChangeAnswer && (
            <button type="button" onClick={onChangeAnswer} className="text-link hover:underline min-h-target">
              {c.custom.change}
            </button>
          )}
        </p>
      )}
      {(index.custom?.currency || index.custom?.region || index.exposure) && (
        <p className="text-sm text-muted-foreground">
          {c.header.forInfo}: {index.exposure ? `${c.header.currency} ${index.exposure.currency}` : [index.custom?.currency && `${c.header.currency} ${index.custom.currency}`, index.custom?.region && `${c.header.region} ${index.custom.region}`].filter(Boolean).join(" · ")}
        </p>
      )}
    </header>
  );
}

// ---------------------------------------------------------------- 5. the headline

export function Headline({ view }: { view: InvestView }) {
  const w = view.headline;
  const p = w ? providerName(view, w.providerId) : undefined;
  const openWay = !w ? view.options.find((o) => o.bestWay)?.bestWay ?? null : null;
  const shown = w ?? openWay;
  const sp = shown ? providerName(view, shown.providerId) : undefined;
  const g = view.genericHeadline;
  const gp = g ? providerName(view, g.cell.providerId) : undefined;
  return (
    <Card as="section" pad="roomy" className="flex flex-col gap-3" aria-labelledby="invest-headline">
      <h2 id="invest-headline" className="text-lg font-semibold">
        {c.headline.title}
      </h2>
      {shown && sp ? (
        <>
          <div className="flex flex-col gap-0.5">
            <span className="text-2xl lg:text-3xl font-semibold">
              <Num value={shown.value} size="figure" />
            </span>
            <span className="text-sm text-muted-foreground">{c.headline.left}</span>
          </div>
          <p className="text-lg">
            {c.headline.at}
            <ProviderLink p={sp} className="font-medium" /> {c.headline.withFund} <bdi className="font-medium">{shown.fund.name}</bdi> <OptionTag option={shown.option} />
          </p>
          {shown.open && (
            <Callout tone="blocked" className="max-w-measure">
              <span className="inline-flex items-start gap-1.5">
                <IconLock size={16} className="mt-1 shrink-0" />
                {w ? c.headline.open : c.headline.onlyOpen}
              </span>
            </Callout>
          )}
          {view.atYours && view.yourBroker && p && w && <AtYours view={view} />}
        </>
      ) : g && gp ? (
        <>
          <p className="text-lg flex flex-wrap items-baseline gap-x-2">
            <span>{c.headline.noFunds}</span>
            <ProviderLink p={gp} className="font-medium" />
          </p>
          <p className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold">{g.cell.cost && <Num value={g.cell.cost} size="figure" />}</span>
            <span className="text-sm text-muted-foreground">{c.headline.noFundsCost}</span>
          </p>
          <p className="text-sm text-muted-foreground max-w-measure">{c.headline.noFundsWhy}</p>
        </>
      ) : (
        <p className="text-muted-foreground">{c.headline.noWay}</p>
      )}
    </Card>
  );
}

function AtYours({ view }: { view: InvestView }) {
  const y = view.atYours!;
  const p = providerName(view, y.providerId);
  if (!p) return null;
  return (
    <p className="text-sm border-t border-border pt-3">
      {y.price && y.less ? (
        y.less.value !== null && (y.less.value as number) > 0.5 ? (
          <>
            {c.headline.yours(p.name)}: <Num value={y.less} /> {c.headline.yoursLess}
          </>
        ) : (
          <>
            {c.headline.yours(p.name)}: {c.headline.yoursSame}
          </>
        )
      ) : (
        c.headline.yoursCannot(p.name)
      )}
    </p>
  );
}
