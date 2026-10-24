// The fund-variant page's controls (design-system 8.4, design-spec 16.3 and 18): the filter and sort, the assumption chips
// and the fields behind them (W-8BEN, exchange rate, distribution yield, the tariff provider, trades a month).
import { Link } from "react-router";
import { buttons, r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import type { FundAssumptions, WorkbenchInputs } from "../../../lib/providers";
import { DISTRIBUTION_PAYMENTS, type FundVariantsView, type SortKey } from "../../../lib/variants";
import { IconReset, IconSearch } from "../../icons";
import { RuleRef } from "../../provenance";
import { NumberField } from "../../timeline/fields";
import { Button, SegmentedControl, cx } from "../../ui";

export function VariantControls({ filter, sort, onFilter, onSort, enteredReturn }: { filter: string; sort: SortKey; onFilter: (v: string) => void; onSort: (s: SortKey) => void; enteredReturn: boolean }) {
  const t = c.funds;
  return (
    <div className="sticky top-14 lg:static z-[var(--z-sticky)] bg-background/95 backdrop-blur lg:backdrop-blur-none -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 flex flex-col gap-2 border-b border-border lg:border-b-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
        <div className="field-box text-muted-foreground lg:w-80 lg:shrink-0">
          <IconSearch size={18} />
          <label htmlFor="fv-filter" className="sr-only">
            {t.filter}
          </label>
          <input id="fv-filter" dir="auto" value={filter} onChange={(e) => onFilter(e.target.value)} placeholder={t.filter} className="field-input !text-start" autoComplete="off" />
        </div>
        <SegmentedControl<SortKey>
          label={t.sort.aria}
          value={sort}
          onChange={onSort}
          className="lg:max-w-md"
          options={[
            { value: "rank", label: t.sort.rank, disabled: !enteredReturn },
            { value: "fee", label: t.sort.fee },
            { value: "name", label: t.sort.name },
          ]}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t.sortLine}</p>
    </div>
  );
}

export function FundChips({ view, inputs, assumptions, onOpen }: { view: FundVariantsView; inputs: WorkbenchInputs; assumptions: FundAssumptions; onOpen: () => void }) {
  const t = c.funds.chips;
  const v = inputs.values;
  const ccy = view.currency === "ILS" ? "שקלים" : view.currency;
  const chips: { key: string; label: string; text: string; entered: boolean }[] = [
    { key: "amount", label: t.amount, text: fmt.nisWhole(v.amount.value as number), entered: v.amount.state === "entered" },
    { key: "monthly", label: t.monthly, text: fmt.nisWhole(v.monthly.value as number), entered: v.monthly.state === "entered" },
    { key: "years", label: t.years, text: fmt.years(v.years.value as number), entered: v.years.state === "entered" },
    { key: "return", label: t.return(ccy), text: inputs.returnFromParameter ? "" : fmt.pct(v.returnV.value as number), entered: !inputs.returnFromParameter },
    { key: "inflation", label: t.inflation, text: fmt.pct(v.inflation.value as number), entered: v.inflation.state === "entered" },
  ];
  if (view.needsFx) {
    chips.push({ key: "fx", label: t.fxChange(ccy), text: assumptions.fxChange !== undefined ? fmt.pct(assumptions.fxChange) : "0%", entered: assumptions.fxChange !== undefined });
    for (const code of view.startRateCurrencies) chips.push({ key: `start-${code}`, label: t.fxStart(code), text: assumptions.fxStart?.[code] !== undefined ? fmt.nis(assumptions.fxStart[code]!) : "", entered: assumptions.fxStart?.[code] !== undefined });
    chips.push({ key: "w8", label: t.w8ben, text: assumptions.w8ben === undefined ? "" : assumptions.w8ben ? c.funds.sheet.w8ben.yes : c.funds.sheet.w8ben.no, entered: assumptions.w8ben !== undefined });
  }
  chips.push({ key: "provider", label: t.provider(view.provider.name).replace(/ ?\(.*$/, ""), text: "", entered: false });
  chips.push({ key: "orders", label: t.orders, text: String(view.ordersN), entered: view.orders.state === "entered" });
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible flex md:flex-wrap gap-2 pb-1 scrollbar-none">
      {chips.map((x) => (
        <button key={x.key} type="button" onClick={onOpen} className={cx("a-chip shrink-0", x.entered && "a-chip-entered")}>
          <span className="text-muted-foreground">{x.label}</span>
          {x.text && (
            <bdi dir="ltr" className={cx("font-medium", x.entered && "text-entered")}>
              {x.text}
            </bdi>
          )}
        </button>
      ))}
      <button type="button" onClick={onOpen} className="a-chip shrink-0">
        {t.all}
      </button>
    </div>
  );
}

/** The fields this page adds to the goal's: the provider, trades a month, W-8BEN, A-03, start rates, distribution yields (flow 30 step 2). */
export function VariantFields({
  view,
  assumptions,
  providers,
  onProvider,
  onOrders,
  patch,
  reset,
}: {
  view: FundVariantsView;
  assumptions: FundAssumptions;
  providers: { id: string; name: string }[];
  onProvider: (id: string) => void;
  onOrders: (n: number | null) => void;
  patch: (fn: (a: FundAssumptions) => FundAssumptions) => void;
  reset: () => void;
}) {
  const t = c.funds.sheet;
  const ccy = view.currency;
  const hasAny = assumptions.fxChange !== undefined || assumptions.w8ben !== undefined || !!assumptions.fxStart || !!assumptions.distributions;
  return (
    <div className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="fv-provider" className="field-label">
          {t.providerLabel}
        </label>
        <div className="field-box">
          <select id="fv-provider" value={view.provider.id} onChange={(e) => onProvider(e.target.value)} className="field-input !text-start">
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted-foreground">
          {view.provider.fellBack ? c.funds.providerNote.missing(view.provider.name) : view.provider.fromP05 ? c.funds.providerNote.p05(view.provider.name) : c.funds.providerNote.chosen(view.provider.name)}{" "}
          <Link to={`/workbench/providers/brokerage-account`} className="text-link hover:underline">
            {c.links.providersCompare}
          </Link>
        </span>
      </div>
      <NumberField
        label={c.providers.behaviour.orders}
        unit="count"
        value={view.ordersN}
        isEntered={view.orders.state === "entered"}
        validate={(n) => (!Number.isInteger(n) || n < 1 || n > 30 ? c.providers.offer.errors.orders(1, 30) : null)}
        onCommit={(n) => onOrders(n)}
        onReset={() => onOrders(null)}
        inputMode="numeric"
        optional
      />
      {view.needsFx && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="field-label" id="fv-w8">
              {t.w8ben.label}
            </span>
            <SegmentedControl<"yes" | "no"> labelledBy="fv-w8" value={assumptions.w8ben === undefined ? null : assumptions.w8ben ? "yes" : "no"} onChange={(v) => patch((a) => ({ ...a, w8ben: v === "yes" }))} options={[{ value: "yes", label: t.w8ben.yes }, { value: "no", label: t.w8ben.no }]} />
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
              <span>{t.w8ben.line}</span>
              <RuleRef id="TXF-13" />
            </p>
          </div>
          <NumberField
            label={t.fxChangeLabel(ccy)}
            unit="pct_per_year"
            value={assumptions.fxChange ?? null}
            isEntered={assumptions.fxChange !== undefined}
            validate={(n) => (n < -100 || n > 1000 ? c.providers.offer.errors.percent(1000) : null)}
            onCommit={(n) => patch((a) => ({ ...a, fxChange: n }))}
            onReset={() => patch(({ fxChange: _x, ...a }) => (void _x, a))}
            hint={<span>{t.fxD20}</span>}
            optional
          />
          {view.startRateCurrencies.map((code) => (
            <NumberField
              key={code}
              label={t.fxStartLabel(code)}
              unit="nis"
              value={assumptions.fxStart?.[code] ?? null}
              isEntered={assumptions.fxStart?.[code] !== undefined}
              validate={(n) => (n <= 0 ? c.providers.offer.errors.negative : null)}
              onCommit={(n) => patch((a) => ({ ...a, fxStart: { ...(a.fxStart ?? {}), [code]: n } }))}
              onReset={() =>
                patch((a) => {
                  const m = { ...(a.fxStart ?? {}) };
                  delete m[code];
                  return { ...a, fxStart: m };
                })
              }
              hint={<span>{t.fxD20}</span>}
              optional
            />
          ))}
        </>
      )}
      {view.distributing.map((f) => (
        <div key={f.recordId} className="flex flex-col gap-3 border-t border-border pt-3">
          <NumberField
            label={t.yieldLabel(f.name)}
            unit="pct_per_year"
            value={assumptions.distributions?.[f.recordId]?.yield ?? null}
            isEntered={assumptions.distributions?.[f.recordId] !== undefined}
            validate={(n) => (n < 0 || n > 100 ? c.providers.offer.errors.percent(100) : null)}
            onCommit={(n) => patch((a) => ({ ...a, distributions: { ...(a.distributions ?? {}), [f.recordId]: { yield: n, perYear: a.distributions?.[f.recordId]?.perYear ?? 4 } } }))}
            onReset={() =>
              patch((a) => {
                const m = { ...(a.distributions ?? {}) };
                delete m[f.recordId];
                return { ...a, distributions: m };
              })
            }
            hint={<span>{t.yieldLine}</span>}
            optional
          />
          <div className="flex flex-col gap-1.5">
            <span className="field-label">{t.perYear}</span>
            <SegmentedControl<string>
              value={String(assumptions.distributions?.[f.recordId]?.perYear ?? 4)}
              onChange={(v) => patch((a) => ({ ...a, distributions: { ...(a.distributions ?? {}), [f.recordId]: { yield: a.distributions?.[f.recordId]?.yield ?? 0, perYear: Number(v) } } }))}
              options={DISTRIBUTION_PAYMENTS.map((n) => ({ value: String(n), label: fmt.number(n) }))}
            />
          </div>
        </div>
      ))}
      {hasAny && (
        <Button variant="quiet" className="self-start -ms-2" onClick={reset}>
          <IconReset size={16} /> {buttons.resetOne}
        </Button>
      )}
    </div>
  );
}
