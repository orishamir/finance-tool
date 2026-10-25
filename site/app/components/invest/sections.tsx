// The index page's top sections: the index header, the headline card, "מה כל בחירה שווה" and the option cards (א).
import { Link } from "react-router";
import { invest as c } from "../../copy";
import type { Bar, InvestView, OptionView, ProviderInfo } from "../../lib/invest";
import { optionLabels } from "../../lib/labels";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { Callout, Tag, cx } from "../ui";
import { LabelRow } from "./parts";

export const providerName = (view: InvestView, id: string): ProviderInfo | undefined => view.providers.find((p) => p.id === id);

export function ProviderLink({ p, className }: { p: ProviderInfo; className?: string }) {
  return p.hasPage ? (
    <Link to={`/companies/${p.id}`} className={cx("text-link hover:underline", className)}>
      {p.name}
    </Link>
  ) : (
    <span className={className}>{p.name}</span>
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
    <section className="bg-card border border-border rounded-lg p-5 lg:p-6 flex flex-col gap-3" aria-labelledby="invest-headline">
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
            <ProviderLink p={sp} className="font-medium" /> {c.headline.withFund} <bdi className="font-medium">{shown.fund.name}</bdi>
          </p>
          <LabelRow labels={optionLabels(shown.option)} />
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
    </section>
  );
}

function AtYours({ view }: { view: InvestView }) {
  const y = view.atYours!;
  const p = providerName(view, y.providerId);
  if (!p) return null;
  return (
    <p className="text-sm flex flex-wrap items-baseline gap-x-2 border-t border-border pt-3">
      {y.price && y.less ? (
        y.less.value !== null && (y.less.value as number) > 0.5 ? (
          <>
            <span>{c.headline.yours(p.name)}:</span>
            <Num value={y.less} />
            <span>{c.headline.yoursLess}</span>
          </>
        ) : (
          <span>
            {c.headline.yours(p.name)}: {c.headline.yoursSame}
          </span>
        )
      ) : (
        <span>{c.headline.yoursCannot(p.name)}</span>
      )}
    </p>
  );
}

// ---------------------------------------------------------------- 6. what each choice is worth

export function Worth({ view }: { view: InvestView }) {
  const max = Math.max(1, ...view.bars.map((b) => (b.spread && typeof b.spread.value === "number" ? b.spread.value : 0)));
  const note = (b: Bar): string => {
    if (b.id === "broker") return c.worth.barNote.broker(c.optionIn[b.option ?? "il-etf"] ?? "");
    if (b.id === "fund") return c.worth.barNote.fund(c.optionIn[b.option ?? "il-etf"] ?? "");
    return c.worth.barNote[b.id];
  };
  return (
    <section className="flex flex-col gap-3" aria-labelledby="invest-worth">
      <h2 id="invest-worth" className="text-lg font-semibold">
        {c.worth.heading}
      </h2>
      <p className="text-sm text-muted-foreground">{c.worth.sub}</p>
      <ul className="flex flex-col gap-3 max-w-2xl">
        {view.bars.map((b) => (
          <li key={b.id} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-medium">{c.worth.bars[b.id]}</span>
              <span className="text-xs text-muted-foreground">{note(b)}</span>
            </div>
            {b.spread && typeof b.spread.value === "number" ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-sm bg-muted overflow-hidden" aria-hidden="true">
                  <div className={cx("h-full", b.open ? "bg-chart-blocked" : "bg-chart-value")} style={{ width: `${Math.max(2, (b.spread.value / max) * 100)}%` }} />
                </div>
                <span className="whitespace-nowrap">
                  {c.worth.upTo} <Num value={b.spread} />
                </span>
              </div>
            ) : (
              <div className="h-8 rounded-sm border border-dashed border-border px-3 inline-flex items-center text-sm text-muted-foreground">{b.pending === "no-records" ? c.worth.pendingNoRecords : c.worth.pendingNotPriced}</div>
            )}
            {b.open && b.spread && <span className="text-xs text-blocked-foreground inline-flex items-center gap-1"><IconLock size={14} />{c.worth.open}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------- 7. (א) the options

export function Options({ view, selected, onSelect }: { view: InvestView; selected: string | null; onSelect: (id: OptionView["id"]) => void }) {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="invest-options">
      <h2 id="invest-options" className="text-lg font-semibold">
        {c.options.heading}
      </h2>
      <p className="text-sm text-muted-foreground">{c.options.sub}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {view.options.filter((o) => o.exists).map((o) => (
          <li key={o.id}>
            <OptionCard view={view} option={o} selected={selected === o.id} onSelect={() => onSelect(o.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function OptionCard({ view, option: o, selected, onSelect }: { view: InvestView; option: OptionView; selected: boolean; onSelect: () => void }) {
  const best = o.bestCell ? providerName(view, o.bestCell.providerId) : undefined;
  const way = o.bestWay;
  const wp = way ? providerName(view, way.providerId) : undefined;
  const venue = o.bestCell?.venue ? c.options.exchange[o.bestCell.venue] : null;
  return (
    <div className={cx("h-full bg-card border rounded-lg p-4 flex flex-col gap-2", selected ? "border-primary border-2" : "border-border")}>
      <button type="button" aria-pressed={selected} onClick={onSelect} className="text-start flex items-center justify-between gap-2 min-h-target">
        <span className="text-lg font-semibold">{c.options.titles[o.id]}</span>
        {selected && <Tag tone="positive">{c.options.selected}</Tag>}
      </button>
      <LabelRow labels={optionLabels(o.id)} />
      <p className="text-sm text-muted-foreground">{c.options.funds(o.funds.length)}</p>
      {o.notRunnable ? (
        <p className="text-sm">
          <Tag tone="caution">{c.options.notYet}</Tag> {c.options.noRate}
        </p>
      ) : (
        <dl className="text-sm flex flex-col gap-1">
          {(wp || best) && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{c.options.bestBroker}:</dt>
              <dd>
                {(wp ?? best) && <ProviderLink p={(wp ?? best)!} className="font-medium" />}
                {venue && <span className="text-muted-foreground"> · {c.options.on(venue)}</span>}
              </dd>
            </div>
          )}
          {way ? (
            <>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted-foreground">{c.options.bestFund}:</dt>
                <dd>
                  <bdi>{way.fund.name}</bdi>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-x-2">
                <dt className="text-muted-foreground">{c.options.left}:</dt>
                <dd>
                  <Num value={way.value} />
                </dd>
                {way.open && (
                  <Tag tone="blocked" icon={<IconLock size={14} />}>
                    {c.options.open}
                  </Tag>
                )}
              </div>
            </>
          ) : o.bestCell?.cost ? (
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="text-muted-foreground">{c.options.brokerCost}:</dt>
              <dd>
                <Num value={o.bestCell.cost} />
              </dd>
            </div>
          ) : (
            <p className="text-muted-foreground">{c.options.noBroker}</p>
          )}
          {!way && o.funds.length === 0 && view.index.exposure === null && <p className="text-muted-foreground">{c.options.noFundsFor}</p>}
        </dl>
      )}
    </div>
  );
}
