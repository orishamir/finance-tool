// The fund-variant row and its detail (design-system 8.4, design-spec 16.3 and 18): the ranked row for a ranked variant,
// its listed form for a listed one, the quiet form for one not evaluated.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { r4workbench as c } from "../../../copy";
import type { FundVariantRowView, VariantReason } from "../../../lib/variants";
import { IconAlert, IconDrillIn, IconLock } from "../../icons";
import { IconDash, IconDashed } from "../../compare/icons";
import { Num, RuleRef } from "../../provenance";
import { Tag, cx } from "../../ui";
import { CopyForFounder, FundFeesBlock, RowTags, SecurityNumber, TradingLine } from "./parts";

const quiet = "text-sm text-link hover:underline min-h-target inline-flex items-center";

export function reasonText(r: VariantReason): ReactNode {
  const t = c.funds.reasons;
  switch (r.code) {
    case "no-record":
      return t.noRecord;
    case "field-missing":
      return t.fieldMissing(t.fields[r.field] ?? r.field);
    case "g18":
      return t.g18;
    case "taxable-israeli":
      return (
        <>
          {t.taxableIsraeli} <RuleRef id="TXS-22" />
        </>
      );
    case "yield-missing":
      return t.yieldMissing;
    case "no-rate":
      return t.noRate(r.currency);
    case "withholding":
      return t.withholding(c.domicile[r.country] ?? r.country);
    case "money-market":
      return t.moneyMarket;
    case "other-currency":
      return t.otherCurrency(r.fund, r.exposure);
    case "exit-blocked":
      return t.exitBlocked(r.ruleId);
    case "other":
      return (
        <>
          {t.other} <bdi dir="ltr">{r.detail}</bdi>
        </>
      );
  }
}

function Marker({ row }: { row: FundVariantRowView }) {
  if (row.kind === "ranked" && row.rank !== undefined)
    return (
      <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold mt-0.5", row.rank === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={`דירוג ${row.rank}`}>
        {row.rank}
      </span>
    );
  if (row.kind === "listed") return <span className="size-7 shrink-0 inline-flex items-center justify-center mt-0.5">{row.reason?.code === "g18" || row.reason?.code === "exit-blocked" ? <IconLock size={20} className="text-blocked" /> : <IconDash size={20} className="text-muted-foreground" />}</span>;
  if (row.kind === "ranked") return <span className="size-7 shrink-0 inline-flex items-center justify-center mt-0.5"><IconDash size={20} className="text-muted-foreground" /></span>;
  const fixable = row.reason?.code === "yield-missing";
  return (
    <span className="size-7 shrink-0 inline-flex items-center justify-center mt-0.5">
      <IconDashed size={20} className={fixable ? "text-muted-foreground" : "text-caution"} />
    </span>
  );
}

function Outcome({ row }: { row: FundVariantRowView }) {
  if (row.waitsForReturn) return null;
  const w = c.funds.outcomes;
  if (row.kind === "ranked") return <Tag tone="positive">{w.ranked}</Tag>;
  if (row.kind === "listed") return row.reason?.code === "g18" || row.reason?.code === "exit-blocked" ? <Tag tone="blocked" icon={<IconLock size={14} />}>{w["listed-not-ranked"]}</Tag> : <Tag tone="neutral" icon={<IconDash size={14} />}>{w["listed-not-ranked"]}</Tag>;
  const fixable = row.reason?.code === "yield-missing";
  return fixable ? <Tag tone="neutral" icon={<IconDashed size={14} />}>{w["not-evaluated"]}</Tag> : <Tag tone="caution" icon={<IconDashed size={14} />}>{w["not-evaluated"]}</Tag>;
}

export function FundVariantRow({ row, onDetail, onField }: { row: FundVariantRowView; onDetail: (id: string, el: HTMLElement) => void; onField: (f: "yield" | "rate" | "return") => void }) {
  const t = c.funds;
  const hasFigure = row.kind !== "not-evaluated" && row.value;
  const listedBlocked = row.kind === "listed" && (row.reason?.code === "g18" || row.reason?.code === "exit-blocked");
  const fixable = row.reason?.code === "yield-missing";
  return (
    <li data-flip={row.id} className={cx("bg-card border border-border rounded-lg p-4 md:p-5 flex flex-col gap-3", row.kind === "not-evaluated" && "bg-card/70")}>
      <div className="flex items-start gap-3">
        <Marker row={row} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className="text-lg font-semibold leading-snug">
            <bdi>{row.name}</bdi>
          </h3>
          {row.manager && (
            <span className="text-sm text-muted-foreground">
              <bdi>{row.manager}</bdi>
            </span>
          )}
        </div>
        {row.detail && (
          <button type="button" aria-label={t.detail.heading} onClick={(e) => onDetail(row.id, e.currentTarget)} className="size-target -me-2 -mt-1.5 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
            <IconDrillIn />
          </button>
        )}
      </div>
      <SecurityNumber number={row.number} />
      <RowTags row={row} />
      <TradingLine row={row} />
      <FundFeesBlock row={row} />
      {hasFigure && row.value && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xl font-semibold">
            <Num value={row.value} />
          </span>
          <span className="text-sm text-muted-foreground">{t.value}</span>
        </div>
      )}
      {row.waitsForReturn && (
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
          {t.noReturn}
          <button type="button" className="text-link hover:underline min-h-9" onClick={() => onField("return")}>
            {t.needsReturnLink}
          </button>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Outcome row={row} />
        {row.duplicateOf && (
          <Tag tone="caution" icon={<IconAlert size={14} />}>
            {t.duplicates.tag} · {t.duplicates.unresolved}
          </Tag>
        )}
      </div>
      {row.reason && !(row.waitsForReturn && row.reason.code !== "g18") && (
        <p className={cx("text-sm flex items-start gap-1.5", listedBlocked ? "text-blocked-foreground" : fixable ? "text-muted-foreground" : "text-foreground")}>
          {listedBlocked && <IconLock size={16} className="text-blocked mt-0.5 shrink-0" />}
          {fixable ? (
            <button type="button" className="text-link hover:underline text-start" onClick={() => onField("yield")}>
              {reasonText(row.reason)}
            </button>
          ) : (
            <span>{reasonText(row.reason)}</span>
          )}
        </p>
      )}
      {row.kind === "not-evaluated" && (row.reason?.code === "no-record" || row.reason?.code === "field-missing") && <CopyForFounder text={`${row.name} ${row.number}`} />}
      <div className="flex flex-wrap gap-x-5">
        <Link to={row.providersHref} className={quiet}>
          {t.rowLinks.providers}
        </Link>
        <Link to={row.checkHref} className={quiet}>
          {t.rowLinks.check}
        </Link>
      </div>
    </li>
  );
}

export function VariantDetail({ row }: { row: FundVariantRowView }) {
  const t = c.funds.detail;
  const d = row.detail;
  if (!d || !row.value) return null;
  const items: [string, ReactNode][] = [
    [t.fund, <Num key="f" value={d.fund} size="cell" />],
    [t.spread, <Num key="s" value={d.spread} size="cell" />],
    [t.provider, <Num key="p" value={d.provider} size="cell" />],
    [t.taxDuring, <Num key="td" value={d.taxDuring} size="cell" />],
    [t.taxExit, <Num key="te" value={d.taxExit} size="cell" />],
  ];
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">
        <bdi>{row.name}</bdi>
      </h2>
      <h3 className="font-medium">{t.heading}</h3>
      <p className="text-xs text-muted-foreground">{t.nominalNote}</p>
      <dl className="flex flex-col">
        {items.map(([label, node]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-1.5 text-sm border-b border-border">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{node}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm font-medium">
          <dt>{t.result}</dt>
          <dd>
            <Num value={row.value} size="cell" />
          </dd>
        </div>
      </dl>
      {row.reason?.code === "g18" && <p className="text-sm text-blocked-foreground">{reasonText(row.reason)}</p>}
      {row.ruleIds.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{t.rules}:</span>
          {row.ruleIds.map((id) => (
            <RuleRef key={id} id={id} />
          ))}
        </p>
      )}
    </div>
  );
}
