// The small pieces of a provider row (design-system 8.2, 8.3; design-spec 16.3): cost-by-type bar and its legend,
// deciding line, tariff line, minimums line, protection line, the not-modelled and no-line lines. Every figure is a Num.
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import { ruleTitle } from "../../../lib/rule-title";
import type { FeeType, ProviderRowView, RowProtection, RowTariff } from "../../../lib/providers";
import type { RuleRecord } from "@finance-tool/schema";
import { IconAlert, IconClock, IconExternal } from "../../icons";
import { Num, RuleRef } from "../../provenance";
import { Disclosure, Tag, cx } from "../../ui";

/** One fixed colour per fee type, the same on every row (design-system 8.3). */
export const typeHue: Record<FeeType, { bg: string; stroke: string }> = {
  trade: { bg: "bg-chart-fee-1", stroke: "stroke-chart-fee-1" },
  custody: { bg: "bg-chart-fee-2", stroke: "stroke-chart-fee-2" },
  fx: { bg: "bg-chart-fee-3", stroke: "stroke-chart-fee-3" },
  fixed: { bg: "bg-chart-fee-4", stroke: "stroke-chart-fee-4" },
};
export const typeOrder: FeeType[] = ["trade", "custody", "fx", "fixed"];

export function BarLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label={c.providers.barAria}>
      {typeOrder.map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className={cx("size-2.5 rounded-sm", typeHue[t].bg)} />
          {c.feeTypes[t]}
        </li>
      ))}
    </ul>
  );
}

/** One stacked bar: its width against the dearest compared row, a segment under 4% a hairline (design-system 8.3). */
export function CostByTypeBar({ view }: { view: ProviderRowView }) {
  if (!view.byType || view.byType.length === 0) return null;
  const parts = view.byType.filter((t) => t.share > 0);
  return (
    <div className="h-2 w-full rounded-sm bg-muted/50 overflow-hidden" role="img" aria-label={`${c.providers.barAria}: ${parts.map((t) => c.feeTypes[t.type]).join(", ")}`}>
      <div className="h-full flex" style={{ width: `${Math.max(2, (view.barScale ?? 1) * 100)}%` }}>
        {parts.map((t) => (
          <span key={t.type} title={`${c.feeTypes[t.type]}: ${fmt.nis(t.cost.value as number)}`} className={cx("h-full border-e-[1.5px] border-card last:border-e-0", typeHue[t.type].bg)} style={{ flexGrow: t.share, flexBasis: 0, minWidth: t.share < 0.04 ? 2 : undefined }} />
        ))}
      </div>
    </div>
  );
}

export function DecidingLine({ view }: { view: ProviderRowView }) {
  const d = view.deciding;
  if (!d || !d.line) return null;
  return (
    <p className="text-sm text-muted-foreground">
      {c.providers.deciding(d.againstName, c.feeTypes[d.line]!)}
    </p>
  );
}

export function TariffLine({ tariff, noPublished = true }: { tariff: RowTariff; noPublished?: boolean }) {
  const t = c.providers;
  return (
    <p className="text-sm flex flex-col gap-0.5">
      <span className="flex flex-wrap items-center gap-x-1.5">
        {tariff.published ? (
          <>
            {t.tariffLine.before}
            <Num value={tariff.published} />
            {t.tariffLine.mid}
          </>
        ) : (
          <>
            <span className="text-caution-foreground">{noPublished ? c.noPublishedDate : ""}</span>
            {" · "}
            {t.tariffLine.collected}
          </>
        )}
        <Num value={tariff.snapshot} />
        <a href={tariff.href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-9">
          {t.tariffLink} <span className="text-xs text-muted-foreground">({t.formats[tariff.format]})</span>
          <IconExternal size={14} />
        </a>
      </span>
      {tariff.stale && (
        <span className="text-caution-foreground flex items-start gap-1.5">
          <IconClock size={14} className="text-caution mt-1 shrink-0" />
          <span>
            {c.staleTariff.before}
            <bdi dir="ltr">{fmt.date(tariff.snapshot.value as string)}</bdi>
            {c.staleTariff.after}
          </span>
        </span>
      )}
    </p>
  );
}

export function MinimumsLine({ view }: { view: ProviderRowView }) {
  const m = view.minimums;
  return (
    <p className="text-sm text-muted-foreground flex flex-col gap-0.5">
      <span>
        {m.accountOpening ? (
          <>
            {c.providers.minimums} <Num value={m.accountOpening} />
          </>
        ) : (
          `${c.providers.minimums} ${c.providers.minimumsNone}`
        )}
      </span>
      {m.perTrade.map((p) => (
        <span key={p.name}>
          {p.min && (
            <>
              {c.providers.perTrade.min} <Num value={p.min} />
            </>
          )}
          {p.min && p.max && " · "}
          {p.max && (
            <>
              {c.providers.perTrade.max} <Num value={p.max} />
            </>
          )}
        </span>
      ))}
    </p>
  );
}

export function ProtectionLine({ protection, rules }: { protection: RowProtection; rules: Record<string, RuleRecord> }) {
  return (
    <div className="text-sm flex flex-col gap-0.5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          {c.providers.protection} {c.regulators[protection.regulator]}
        </span>
        {protection.taseMember && <Tag tone="neutral">{c.providers.taseMember}</Tag>}
        {protection.notIsaSupervised && (
          <Tag tone="caution" icon={<IconAlert size={14} />}>
            {c.providers.notIsaSupervised}
          </Tag>
        )}
      </p>
      {protection.ruleIds.length > 0 && (
        <Disclosure label={<span className="text-link text-sm">{c.providers.protectionDisclosure}</span>} summaryClassName="min-h-9 justify-start gap-2">
          <ul className="flex flex-col gap-2 pb-2 text-sm">
            {protection.ruleIds.map((id) => {
              const r = rules[id];
              return (
                <li key={id} className="flex flex-wrap items-baseline gap-x-2">
                  <RuleRef id={id} />
                  {r && <span className="text-muted-foreground">{ruleTitle(r).english ? <bdi dir="ltr">{ruleTitle(r).text}</bdi> : ruleTitle(r).text}</span>}
                </li>
              );
            })}
          </ul>
        </Disclosure>
      )}
    </div>
  );
}

/** "לא נכלל בחישוב" for a line no formula charges, and "אין בתעריפון שורה ל…" for a base the tariff has no line for (caution: never read as free). */
export function ModelLines({ view }: { view: ProviderRowView }) {
  const t = c.providers;
  return (
    <>
      {view.notModelled.map((n) => (
        <p key={n.lineId} className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          <span>
            {t.notModelled(n.name)} {n.reason === "F-18" ? t.notModelledF18 : t.notModelledOther}
          </span>
          {n.reason === "F-18" && (
            <>
              <Tag tone="parameter">F-18</Tag>
              <span className="sr-only">{t.pendingLine("F-18")}</span>
            </>
          )}
        </p>
      ))}
      {view.noLine.map((b) => (
        <p key={b} className="text-sm text-caution-foreground flex items-start gap-1.5">
          <IconAlert size={16} className="text-caution mt-0.5 shrink-0" />
          <span>{t.noLine(t.noLineBases[b]!)}</span>
        </p>
      ))}
      {view.fixedSpread.map((n) => (
        <p key={n} className="text-sm text-muted-foreground">
          {t.fixedSpread(n)}
        </p>
      ))}
    </>
  );
}
