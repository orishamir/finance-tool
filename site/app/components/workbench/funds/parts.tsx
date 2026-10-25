// The small pieces of the fund-variant page (design-system 8.4, design-spec 16.3): list line, security number with copy,
// the three tags, the fund fees block, the group line and the coverage line.
import { useState, type ReactNode } from "react";
import { r2, buttons, r4workbench as c } from "../../../copy";
import { feeKeys, type FeeKey, type FundVariantRowView, type FundVariantsView } from "../../../lib/variants";
import type { RefLink } from "../../../lib/providers";
import { computed, type SiteValue } from "../../../lib/value";
import { IconAlert, IconCheck, IconCopy, IconExternal } from "../../icons";
import { Num } from "../../provenance";
import { CoverageFold, Disclosure, FoldGroup, Tag } from "../../kit";

/** Pieces of a sentence around its placeholders: `{A}` and `{B}` become the given nodes (dates and counts are Nums). */
function fill(sentence: string, parts: Record<string, ReactNode>): ReactNode[] {
  return sentence.split(/(\{[A-Z]\})/).map((x, i) => {
    const m = /^\{([A-Z])\}$/.exec(x);
    return m ? <span key={i}>{parts[m[1]!]}</span> : x;
  });
}

const linkCls = "text-link hover:underline inline-flex items-center gap-1 min-h-9";

export function ListLine({ lists, links }: { lists: FundVariantsView["lists"]; links: { maya: RefLink | null; taseForeign: RefLink | null } }) {
  const t = c.funds.listLine;
  const a = lists.israeli;
  const b = lists.tase;
  const israeliMissing = (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3">
      <span>{t.israeliMissing}</span>
      {links.maya && (
        <a href={links.maya.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {t.links.maya} <IconExternal size={14} />
        </a>
      )}
    </p>
  );
  const taseMissing = (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3">
      <span>{t.taseMissing}</span>
      {links.taseForeign && (
        <a href={links.taseForeign.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
          {t.links.tase} <IconExternal size={14} />
        </a>
      )}
    </p>
  );
  const old = (v: SiteValue | null) => v?.stale && <span className="text-sm text-caution-foreground">{t.old(v.stale.since.slice(0, 10).split("-").reverse().join("."))}</span>;
  if (a && b)
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm">{fill(t.both("{A}", "{B}"), { A: <Num value={a} />, B: <Num value={b} /> })}</p>
        {old(a)}
        {old(b)}
      </div>
    );
  return (
    <div className="flex flex-col gap-1">
      {a ? (
        <>
          <p className="text-sm">{fill(t.onlyIsraeli("{A}"), { A: <Num value={a} /> })}</p>
          {old(a)}
        </>
      ) : (
        israeliMissing
      )}
      {b ? (
        <>
          <p className="text-sm">{fill(t.onlyTase("{A}"), { A: <Num value={b} /> })}</p>
          {old(b)}
        </>
      ) : (
        taseMissing
      )}
    </div>
  );
}

// ---------------------------------------------------------------- security number

/** What the bank's order screen asks for: the number in the identifier style, with a copy button that says "הועתק" for two seconds. */
export function SecurityNumber({ number, label = c.funds.security.label }: { number: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = number;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* the number stays selectable on the page */
      }
      ta.remove();
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 2000);
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <bdi dir="ltr" className="slashed-zero font-medium select-all tabular-nums">
        {number}
      </bdi>
      <button type="button" onClick={copy} className="min-h-target -my-2 px-2 inline-flex items-center gap-1 text-link hover:underline text-xs" aria-live="polite">
        {done ? <IconCheck size={14} /> : <IconCopy size={14} />}
        {done ? c.funds.security.copied : c.funds.security.copy}
      </button>
    </span>
  );
}

/** Copy of the fund's name and number, for the founder to ask for the details (flow 30 step 7). */
export function CopyForFounder({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="text-sm text-link hover:underline inline-flex items-center gap-1 min-h-target"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* the text is on the page */
        }
        setDone(true);
        window.setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {done ? buttons.copied : c.funds.noFundsCopy}
    </button>
  );
}

// ---------------------------------------------------------------- tags

export function RowTags({ row }: { row: FundVariantRowView }) {
  const t = c.funds;
  const dom = row.tags.domicile;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Tag tone="neutral">{t.sourceTags[row.source]}</Tag>
      {row.recordId && row.source !== "data-funds" && <Tag tone="neutral">{t.sourceTags["data-funds"]}</Tag>}
      {row.notInLatestList && (
        <Tag tone="caution" icon={<IconAlert size={14} />}>
          {t.sourceTags.notInList}
        </Tag>
      )}
      {dom && (
        <Tag tone="neutral">
          <span className="sr-only">{t.domicileSr("")}</span>
          {c.domicile[dom] ?? <bdi dir="ltr">{dom}</bdi>}
        </Tag>
      )}
      <Tag tone={row.tags.policy === "not-collected" ? "caution" : "neutral"}>{c.policy[row.tags.policy]}</Tag>
      {row.secondary.length > 0 && (
        <Tag tone="caution" icon={<IconAlert size={14} />}>
          {t.secondaryTag}
        </Tag>
      )}
    </div>
  );
}

export function TradingLine({ row }: { row: FundVariantRowView }) {
  const tr = row.trading;
  if (!tr) return null;
  const ccy = tr.currency === "ILS" ? "שקלים" : tr.currency;
  return <p className="text-sm text-muted-foreground">{tr.onTaseInNis ? c.funds.trading.nis : tr.abroad ? c.funds.trading.abroad(ccy) : c.funds.trading.quoted(ccy)}</p>;
}

// ---------------------------------------------------------------- the fund's own fees

export function FundFeesBlock({ row }: { row: FundVariantRowView }) {
  if (!row.fees) return null;
  const t = c.funds;
  return (
    <Disclosure label={<span className="text-sm text-link">{t.feesHeading}</span>} summaryClassName="min-h-9 justify-start gap-2" defaultOpen>
      <dl className="flex flex-col pb-1">
        {feeKeys.map((k: FeeKey) => {
          const v = row.fees![k];
          const zero = row.takenAsZero.includes(k);
          return (
            <div key={k} className="flex items-baseline justify-between gap-3 py-1 text-sm border-b border-border last:border-b-0">
              <dt className="text-muted-foreground">{t.fees[k]}</dt>
              <dd className="text-end">
                {v ? (
                  <Num value={v} size="cell" />
                ) : (
                  <span className="text-muted-foreground">
                    {t.feeNotCollected}
                    {zero && ` · ${t.feeTakenZero}`}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Disclosure>
  );
}

// ---------------------------------------------------------------- group line and coverage

export function GroupLine({ held }: { held: SiteValue }) {
  const t = c.funds.groupLine;
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
      <span>
        {t.before}
        <Num value={held} />
        {t.after}
      </span>
      <Tag tone="parameter"><bdi dir="ltr">G-29</bdi></Tag>
    </p>
  );
}

export function VariantCoverage({ view, today }: { view: FundVariantsView; today: string }) {
  const t = c.funds.coverage;
  const n = (v: number, about: string) => <Num value={computed(v, "count", "F-83", {}, { today, about })} />;
  const cov = view.coverage;
  /** One is the word "אחת" in a Num with the singular verb; any other count is its digits with the plural. */
  const part = (v: number, key: "ranked" | "listed" | "notEvaluated" | "waits", about: string) =>
    v === 1 ? (
      <>
        <Num value={computed(v, "count", "F-83", {}, { today, about })} display="אחת" /> {t.one[key].replace(/^אחת /, "")}
      </>
    ) : (
      <>
        {n(v, about)} {t.many[key]}
      </>
    );
  const groups = [
    { key: "ranked", label: c.funds.groups[view.waitsForReturn ? "waits" : "ranked"]!, rows: view.rows.filter((r) => r.kind === "ranked") },
    { key: "listed", label: c.funds.groups.listed!, rows: view.rows.filter((r) => r.kind === "listed") },
    { key: "not-evaluated", label: c.funds.groups["not-evaluated"]!, rows: view.rows.filter((r) => r.kind === "not-evaluated") },
  ].filter((g) => g.rows.length > 0);
  const rowsCount = view.rows.length;
  if (import.meta.env.DEV && (!cov.invariantOk || cov.ranked + cov.listed + cov.notEvaluated !== rowsCount)) console.error("fund coverage: counts do not equal rows", cov, rowsCount);
  return (
    <CoverageFold
      lead={
        <>
          {rowsCount === 1 ? (
            <>
              {t.beforeOne}
              {t.oneFund}
              {t.midOne}
            </>
          ) : (
            <>
              {t.before}
              {n(rowsCount, "קרנות")}
              {t.mid1}
            </>
          )}
          {part(cov.ranked, view.waitsForReturn ? "waits" : "ranked", c.funds.groups[view.waitsForReturn ? "waits" : "ranked"]!)}
          {", "}
          {part(cov.listed, "listed", c.funds.groups.listed!)}
          {", "}
          {part(cov.notEvaluated, "notEvaluated", c.funds.groups["not-evaluated"]!)}
          {", "}
          {t.end}
        </>
      }
      openLabel={r2.result.coverageOpen}
      closeLabel={r2.result.coverageClose}
      pad="snug"
      bodyPad="snug"
      bodyClassName="flex flex-col gap-1"
    >
      {groups.map((g) => (
        <FoldGroup key={g.key} title={g.label} count={g.rows.length} defaultOpen={g.key !== "ranked"}>
          <ul className="flex flex-col">
            {g.rows.map((r) => (
              <li key={r.id} className="py-2 border-b border-border last:border-b-0 text-sm">
                <bdi>{r.name}</bdi> <bdi dir="ltr" className="text-xs text-muted-foreground slashed-zero">{r.number}</bdi>
              </li>
            ))}
          </ul>
        </FoldGroup>
      ))}
      <p className="text-sm text-muted-foreground pt-2">{c.funds.groupLine.before}{n(view.held.value as number, "קרנות זרות")}{c.funds.groupLine.after}</p>
    </CoverageFold>
  );
}
