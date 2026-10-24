// The provider row and the not-comparable row (design-system 8.2, design-spec 16.3 and 17), and the row's detail.
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import type { NotComparable, ProviderRowView, UiLevel } from "../../../lib/providers";
import type { SiteValue } from "../../../lib/value";
import { IconDrillIn, IconPencil } from "../../icons";
import { IconDashed, IconEqual } from "../../compare/icons";
import { Num, RuleRef } from "../../provenance";
import { Disclosure, Tag, cx } from "../../ui";
import { BarLegend, CostByTypeBar, DecidingLine, MinimumsLine, ModelLines, ProtectionLine, TariffLine, typeHue, typeOrder } from "./parts";

export { BarLegend };

/** "ב־10 שנים", "בשנה", "בשנתיים" (copy 8.1: "{סכום} ב־{שנים}, בכסף של היום"). */
export const inYears = (n: number) => (n === 1 ? "בשנה" : n === 2 ? "בשנתיים" : `ב־${fmt.number(n)} שנים`);

export interface RowCtx {
  wrapperId: string;
  years: number;
  level: UiLevel;
  names: Record<string, string>;
  theta: SiteValue;
  rules: Record<string, RuleRecord>;
  vsId: string | null;
  onOffer: (id: string, el: HTMLElement) => void;
  onDetail: (id: string, el: HTMLElement) => void;
  onVs: (id: string | null) => void;
}

const quietLink = "text-sm text-link hover:underline min-h-target inline-flex items-center";

function ClassLine({ view }: { view: ProviderRowView }) {
  const regulator = c.regulators[view.protection.regulator];
  return (
    <span className="text-sm text-muted-foreground">
      {c.classWords[view.providerClass] ?? view.providerClass} · {regulator}
    </span>
  );
}

function RowLinks({ view, ctx }: { view: ProviderRowView; ctx: RowCtx }) {
  const t = c.providers.rowLinks;
  const switchTo = `/switch/${ctx.wrapperId}?to=${encodeURIComponent(view.id)}${ctx.vsId && ctx.vsId !== view.id ? `&from=${encodeURIComponent(ctx.vsId)}` : ""}`;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-0">
      <button type="button" className={quietLink} onClick={(e) => ctx.onOffer(view.id, e.currentTarget)}>
        {view.hasOffer ? t.edit : t.offer}
      </button>
      <Link to={switchTo} className={quietLink}>
        {t.switch}
      </Link>
      <Link to={`/companies/${view.id}`} className={quietLink}>
        {t.company(ctx.names[view.id] ?? view.name)}
      </Link>
      {view.kind === "ranked" && (
        <button type="button" className={quietLink} onClick={() => ctx.onVs(view.vs ? null : view.id)}>
          {view.vs ? c.providers.vsClear : c.providers.vsSet}
        </button>
      )}
    </div>
  );
}

export function ProviderRow({ view, ctx }: { view: ProviderRowView; ctx: RowCtx }) {
  const tied = view.tiedWith.length > 0;
  const enteredRow = !!view.offer;
  return (
    <li data-flip={view.id} data-tied={tied ? "" : undefined} className={cx("bg-card border border-border rounded-lg p-4 md:p-5 flex flex-col gap-3", (tied || view.vs) && "border-s-[3px]", tied && "border-s-chart-marker", view.vs && !tied && "border-s-chart-fee-4")}>
      <div className="flex items-start gap-3">
        <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold mt-0.5", view.rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={`דירוג ${view.rank}`}>
          {view.rank}
        </span>
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold leading-snug">
            <Link to={`/companies/${view.id}`} className="text-link hover:underline">
              {view.name}
            </Link>
          </h3>
          <ClassLine view={view} />
        </div>
        <button type="button" aria-label={c.providers.detail.heading} onClick={(e) => ctx.onDetail(view.id, e.currentTarget)} className="size-target -me-2 -mt-1.5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
          <IconDrillIn />
        </button>
      </div>

      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr] sm:items-end">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="flex flex-col">
            <span className="text-xl font-semibold">{view.horizonCost && <Num value={view.horizonCost} />}</span>
            <span className="text-xs text-muted-foreground">
              {inYears(ctx.years)}
              {c.providers.horizon.after}
            </span>
          </span>
          <span className="flex flex-col">
            <span>{view.yearOneCost && <Num value={view.yearOneCost} />}</span>
            <span className="text-xs text-muted-foreground flex flex-wrap gap-x-1.5">
              <span>{c.providers.yearOne}</span>
              <span>({c.providers.yearOneTag})</span>
            </span>
          </span>
        </div>
        <CostByTypeBar view={view} />
      </div>

      {(tied || enteredRow || view.vs) && (
        <div className="flex flex-wrap items-center gap-2">
          {tied && (
            <Tag tone="parameter" icon={<IconEqual size={14} className="shrink-0" />} className="!whitespace-normal max-w-full min-w-0 items-start [overflow-wrap:anywhere] [&>svg]:mt-0.5">
              {view.tiedWith.length === 1 ? c.providers.tie(ctx.names[view.tiedWith[0]!] ?? view.tiedWith[0]!) : c.providers.tieMany(view.tiedWith.map((id) => ctx.names[id] ?? id).join(", "))}
            </Tag>
          )}
          {enteredRow && (
            <Tag tone="entered" icon={<IconPencil size={14} />}>
              {c.enteredTag}
            </Tag>
          )}
          {view.vs && <Tag tone="caution">{c.providers.vsTag}</Tag>}
        </div>
      )}
      <DecidingLine view={view} />

      <div className="flex flex-col gap-1.5">
        <TariffLine tariff={view.tariff} />
        <MinimumsLine view={view} />
        <ProtectionLine protection={view.protection} rules={ctx.rules} />
        <ModelLines view={view} />
      </div>
      <RowLinks view={view} ctx={ctx} />
    </li>
  );
}

// ---------------------------------------------------------------- not comparable

export function reasonSentence(r: NotComparable, instrumentClass: string, channelWord: string): string {
  const n = c.notComparable;
  const cls = c.instrumentClasses[instrumentClass] ?? instrumentClass;
  switch (r.code) {
    case "data-missing":
      return n.dataMissing;
    case "no-applicable-line":
      return / through /.test(r.detail) ? n.noLineChannel(cls, channelWord) : n.noLine(cls);
    case "no-average":
      return n.noAverage(cls);
    case "line-without-value":
      return n.lineWithoutValue(r.lineName ?? r.detail);
    case "ambiguous":
      return n.ambiguous(cls);
  }
}

export function NotComparableRow({ view, ctx, instrumentClass, channelWord }: { view: ProviderRowView; ctx: RowCtx; instrumentClass: string; channelWord: string }) {
  const r = view.reason!;
  return (
    <li data-flip={view.id} className="bg-card/60 border border-dashed border-border rounded-lg p-4 flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        <IconDashed size={20} className="text-caution shrink-0 mt-1" />
        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="text-base font-semibold leading-snug">
            <Link to={`/companies/${view.id}`} className="text-link hover:underline">
              {view.name}
            </Link>
          </h4>
          <ClassLine view={view} />
        </div>
      </div>
      <p className="text-sm">
        {reasonSentence(r, instrumentClass, channelWord)}
      </p>
      {r.code === "ambiguous" && (
        <ul className="text-sm text-muted-foreground list-disc ps-5">
          {r.lines.map((l) => (
            <li key={l.id}>
              <bdi>{l.band ?? l.name}</bdi>
            </li>
          ))}
        </ul>
      )}
      {r.code === "data-missing" && r.recorded && (
        <Disclosure label={<span className="text-sm text-link">{c.recordedReason}</span>} summaryClassName="min-h-9 justify-start gap-2">
          <p dir="ltr" className="text-xs font-mono text-muted-foreground bg-muted rounded-md p-3 text-start whitespace-pre-wrap">
            {r.recorded}
          </p>
        </Disclosure>
      )}
      <TariffLine tariff={view.tariff} />
      <ProtectionLine protection={view.protection} rules={ctx.rules} />
      <button type="button" className={cx(quietLink, "self-start")} onClick={(e) => ctx.onOffer(view.id, e.currentTarget)}>
        {c.providers.notComparableOffer(ctx.names[view.id] ?? view.name)}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------- the row's detail

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const periodWord = (p: "month" | "quarter" | "year" | null) => (p ? c.providers.offer.periods[p] : null);

export function RowDetail({ view, ctx }: { view: ProviderRowView; ctx: RowCtx }) {
  const d = c.providers.detail;
  const typeCost = (t: (typeof typeOrder)[number]) => view.byType?.find((x) => x.type === t);
  const gaps = view.deciding?.gaps;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{view.name}</h2>
      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{d.heading}</h3>
        {view.lines.length === 0 && !view.offer ? <p className="text-sm text-muted-foreground">{c.providers.noLine("")}</p> : null}
        <ul className="flex flex-col gap-3">
          {view.lines.map((l) => (
            <li key={l.id} className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0">
              <span className="text-sm font-medium">
                <bdi>{l.name}</bdi>
              </span>
              <dl className="flex flex-col">
                <Fact label={d.bases[l.base] ?? l.base}>
                  <Num value={l.rate} size="cell" />
                </Fact>
                {l.min && (
                  <Fact label={d.min}>
                    <Num value={l.min} size="cell" />
                  </Fact>
                )}
                {l.max && (
                  <Fact label={d.max}>
                    <Num value={l.max} size="cell" />
                  </Fact>
                )}
                {periodWord(l.period) && <Fact label={d.period}>{periodWord(l.period)}</Fact>}
                {l.channel && <Fact label={d.channel}>{c.providers.behaviour.channelOptions[l.channel as "direct" | "branch"] ?? l.channel}</Fact>}
                {l.level !== "list" && <Fact label={d.level}>{d.fromAverage}</Fact>}
              </dl>
            </li>
          ))}
        </ul>
        {view.offer && (
          <>
            <p className="text-sm text-entered">{d.entered(view.offer.lines.map((l) => c.feeTypes[l.base]).join(", "))}</p>
            <ul className="flex flex-col gap-2">
              {view.offer.lines.map((l) => (
                <li key={l.base} className="flex flex-col text-sm">
                  <dl className="flex flex-col">
                    <Fact label={c.feeTypes[l.base]!}>
                      <Num value={l.rate} size="cell" />
                    </Fact>
                    {l.min && (
                      <Fact label={d.min}>
                        <Num value={l.min} size="cell" />
                      </Fact>
                    )}
                    {l.max && (
                      <Fact label={d.max}>
                        <Num value={l.max} size="cell" />
                      </Fact>
                    )}
                  </dl>
                  {l.aboveList && <span className="text-xs text-muted-foreground">{c.providers.offer.above}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
      {view.byType && (
        <section className="flex flex-col gap-1.5">
          <h3 className="font-medium">{d.typeCosts}</h3>
          <dl className="flex flex-col">
            {typeOrder.map((t) => {
              const x = typeCost(t);
              return x ? (
                <Fact key={t} label={c.feeTypes[t]!}>
                  <span className="inline-flex items-center gap-2">
                    <span className={cx("size-2.5 rounded-sm", typeHue[t].bg)} />
                    <Num value={x.cost} size="cell" />
                  </span>
                </Fact>
              ) : null;
            })}
            {view.interaction && Math.abs(view.interaction.value as number) >= 0.005 && (
              <Fact label={d.remainder}>
                <Num value={view.interaction} size="cell" />
              </Fact>
            )}
          </dl>
        </section>
      )}
      {gaps && view.deciding && (
        <section className="flex flex-col gap-1.5">
          <h3 className="font-medium">{c.providers.decidingDetail}</h3>
          <dl className="flex flex-col">
            {typeOrder.map((t) => (gaps[t] ? (
              <Fact key={t} label={c.feeTypes[t]!}>
                <Num value={gaps[t] as SiteValue} size="cell" />
              </Fact>
            ) : null))}
          </dl>
        </section>
      )}
      {view.tiedWith.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {c.providers.tieThreshold} <Num value={ctx.theta} size="cell" />
          {c.providers.tieThresholdAfter}
        </p>
      )}
      {view.ruleIds.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{d.rules}:</span>
          {view.ruleIds.map((id) => (
            <RuleRef key={id} id={id} />
          ))}
        </p>
      )}
    </div>
  );
}
