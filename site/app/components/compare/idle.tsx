// The idle-cash screen's parts (design-system 6.4, design-spec 9): the cost row, the result card, the coverage line
// and the optional fields. Every figure is a value object (D7): the cost is computed, the offer is the person's,
// a published rate carries its source and date, the money-market and makam rate is a site parameter.
import { Link } from "react-router";
import { idle as copy, r2 } from "../../copy";
import { fmt } from "../../lib/format";
import type { IdleCoverageRow, IdleMateriality, IdleRowView, IdleVerdict, IdleView } from "../../lib/idle";
import { IconClock, IconExternal, IconFile } from "../icons";
import { IdRef, Num, RulesLine } from "../provenance";
import type { SiteValue } from "../../lib/value";
import { Card, CoverageFold, cx, Sentence, Tag } from "../kit";
import { ReasonText } from "./reasons";
import type { ResultCtx } from "./ctx";
import { IconBan, IconDash, IconDashed, IconEdit, IconOk } from "./icons";
import type { CompareBundle } from "../../lib/compare";
import { makeValues } from "../../lib/compare";
import type { RunGoal } from "../../lib/compare";

/** Each row's name leads to its guide page (audit A20). */
const guideOf: Record<IdleRowView["id"], string> = {
  "bank-deposit:average": "/guide/bank-deposit",
  "bank-deposit:own-offer": "/guide/bank-deposit",
  "money-market-fund-daily": "/guide/money-market-fund-daily",
  makam: "/guide/makam",
};

function RateTag({ row }: { row: IdleRowView }) {
  if (row.label === "published") return <Tag icon={<IconFile size={14} />}>{copy.labels.published}{fmt.date(row.rate.effective_from ?? row.rate.checked)}</Tag>;
  if (row.label === "entered") return <Tag tone="entered" icon={<IconEdit size={14} />}>{copy.labels.entered}</Tag>;
  return <Tag tone="parameter">{copy.labels.parameter}</Tag>;
}

/** One alternative: the name, the rate it rests on with its label, and the monthly cost of leaving the money. */
export function CostRow({ row, empty }: { row: IdleRowView | null; empty?: boolean }) {
  if (!row) return null;
  const name = copy.rowNames[row.id]!;
  const note = row.id === "money-market-fund-daily" ? copy.mmfNote : row.id === "makam" && row.notes.includes("no-commission-given") ? copy.makamNoCommission : null;
  return (
    <li className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3">
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="font-medium">
          <Link to={guideOf[row.id]} className="text-link hover:underline">
            {name}
          </Link>
          {row.rate.own && row.id === "bank-deposit:average" && (
            <>
              {" "}
              {copy.rowOwner} <bdi>{row.rate.own}</bdi>
            </>
          )}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground">{copy.rateOf}</span>
          <Num value={row.rate} />
          <RateTag row={row} />
          {row.rate.stale && <IconClock size={14} className="text-caution" />}
        </span>
        {note && <span className="text-xs text-muted-foreground max-w-measure">{note}</span>}
        {row.id === "bank-deposit:own-offer" && row.monthlyCost < 0 && <span className="text-xs text-caution-foreground max-w-measure">{copy.offerBelow}</span>}
      </div>
      <div className="flex flex-col items-end">
        {empty ? <span className="text-xl text-muted-foreground">—</span> : <Num value={row.cost} className="text-xl font-medium" animate />}
        <span className="text-xs text-muted-foreground">{copy.perMonth}</span>
      </div>
    </li>
  );
}

/** A cash option the run could not do: the name and the reason, in the quiet style. */
export function FailedRow({ id, reason }: { id: string; reason: ReactNodeLike }) {
  const name = id === "bank-deposit" ? copy.rowNames["bank-deposit:average"] : copy.rowNames[id];
  return (
    <li className="flex flex-col gap-1 py-3">
      <span className="font-medium">
        <Link to={`/guide/${id}`} className="text-link hover:underline">
          {name}
        </Link>
      </span>
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <IconDashed size={16} />
        {reason}
      </span>
    </li>
  );
}
type ReactNodeLike = React.ReactNode;

/** Rows as the result card lists them: the bank's published rate and, directly under it, the person's own offer, paired by a bar. */
export function CostRows({ view, ctx }: { view: IdleView; ctx: ResultCtx }) {
  const by = (id: string) => view.rows.find((r) => r.id === id) ?? null;
  const pair = [by("bank-deposit:average"), by("bank-deposit:own-offer")].filter((r): r is IdleRowView => r !== null);
  const rest = [by("money-market-fund-daily"), by("makam")].filter((r): r is IdleRowView => r !== null);
  const failedFor = (id: string) => view.failed.find((f) => f.id === id);
  const failedRow = (id: string) => {
    const f = failedFor(id);
    if (!f) return null;
    const r = f.reasons[0]!;
    return <FailedRow key={id} id={id} reason={<ReasonText r={r} id={id} ctx={ctx} />} />;
  };
  return (
    <ul className="flex flex-col divide-y divide-border">
      {pair.length > 0 && (
        <li className="py-0">
          <ul className={cx("flex flex-col divide-y divide-border", pair.length > 1 && "border-s-[3px] border-border ps-3")}>
            {pair.map((r) => (
              <CostRow key={r.id} row={r} />
            ))}
          </ul>
        </li>
      )}
      {pair.length === 0 && failedRow("bank-deposit")}
      {rest.some((r) => r.id === "money-market-fund-daily") ? <CostRow row={by("money-market-fund-daily")} /> : failedRow("money-market-fund-daily")}
      {rest.some((r) => r.id === "makam") ? <CostRow row={by("makam")} /> : failedRow("makam")}
    </ul>
  );
}

/** The sentence with the four counts and the list of every option and where it stands, behind a disclosure (flow 11, step 4). */
export function IdleCoverage({ view, ctx }: { view: IdleView; ctx: ResultCtx }) {
  const cov = view.coverage;
  const order: IdleCoverageRow["kind"][] = ["not-eligible", "not-evaluated", "compared", "baseline"];
  const n = (k: IdleCoverageRow["kind"]) => <Num value={ctx.mk.count(cov.counts[k], copy.kinds[k]!)} animate />;
  return (
    <CoverageFold
      lead={
        <>
          {copy.coverageBefore} <Num value={ctx.mk.count(cov.considered, copy.coverageBefore)} animate /> {copy.coverageMid} {n("baseline")} {copy.kinds.baseline}, {n("compared")} {copy.kinds.compared}, {n("not-eligible")} {copy.kinds["not-eligible"]}, {n("not-evaluated")}{" "}
          {copy.kinds["not-evaluated"]}.
        </>
      }
      openLabel={copy.coverageOpen}
      closeLabel={copy.coverageClose}
      bodyClassName="flex flex-col gap-5"
    >
      {order.map((kind) => {
        const list = view.coverageRows.filter((r) => r.kind === kind);
        if (list.length === 0) return null;
        return (
          <section key={kind} className="flex flex-col gap-1">
            <h4 className="font-medium">
              {copy.kinds[kind]} <span className="text-muted-foreground font-normal">({list.length})</span>
            </h4>
            <ul className="flex flex-col">
              {list.map((row) => (
                <li key={row.id} className="flex flex-col gap-1 py-3 border-b border-border last:border-b-0">
                  <span className="flex items-center gap-2 flex-wrap">
                    <Link to={row.href ?? "/not-covered"} className="font-medium text-link hover:underline">
                      <bdi>{row.name}</bdi>
                    </Link>
                    <KindTag kind={kind} />
                  </span>
                  {row.reasons.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {row.reasons.map((r, i) => (
                        <span key={i} className="block">
                          <IdleReason r={r} id={row.id} ctx={ctx} />
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </CoverageFold>
  );
}

function KindTag({ kind }: { kind: IdleCoverageRow["kind"] }) {
  const word = copy.kindsTag[kind]!;
  if (kind === "compared") return <Tag tone="positive" icon={<IconOk size={14} />}>{word}</Tag>;
  if (kind === "baseline") return <Tag tone="neutral" icon={<IconDash size={14} />}>{word}</Tag>;
  if (kind === "not-eligible") return <Tag tone="neutral" icon={<IconBan size={14} />}>{word}</Tag>;
  return <Tag tone="neutral" icon={<IconDashed size={14} />}>{word}</Tag>;
}

/** The preset runs only the cash options (G-28): every other tier-1 option reads "not in the quick comparison" with a pointer to the full one. */
function IdleReason({ r, id, ctx }: { r: IdleCoverageRow["reasons"][number]; id: string; ctx: ResultCtx }) {
  if (r.code === "idle-cash-not-run")
    return (
      <>
        {copy.notQuick}. {copy.notQuickLine} <bdi dir="ltr" className="text-xs ms-1">G-28</bdi>
      </>
    );
  return <ReasonText r={r as never} id={id} ctx={ctx} />;
}

/** The link-out line for the Bank of Israel's average (D20): no number, the page it lives on. */
export function BoiLine({ bundle }: { bundle: CompareBundle }) {
  return (
    <p className="text-sm text-muted-foreground max-w-measure flex flex-wrap items-center gap-x-1.5">
      <span>{copy.boiBefore}</span>
      {bundle.cashLink && (
        <a href={bundle.cashLink.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-9">
          {copy.boiLink}
          <IconExternal size={16} />
        </a>
      )}
      <span className="basis-full">{copy.boiParam}</span>
    </p>
  );
}


/** The threshold half of the judgement lines: "below the site's threshold (P-03)" or the worth-it word, with the threshold beside it. */
function Judged({ worth, below, yes, threshold, label }: { worth: boolean; below: string; yes: string; threshold: SiteValue; label: string }) {
  return (
    <>
      <span className="font-medium">{worth ? yes : below}</span>
      {!worth && (
        <>
          {" "}
          (<IdRef id="P-03" />)
        </>
      )}
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {" "}
        ({label} <Num value={threshold} />)
      </span>
    </>
  );
}

/** The one-year verdict on the offer (F-60, 2026-10-24): both options after tax a year, the gap, P-03 over it, and the tax in words. */
export function VerdictBlock({ verdict, depositRate, fundRate }: { verdict: IdleVerdict; depositRate: SiteValue | null; fundRate: SiteValue | null }) {
  const v = copy.verdict;
  const termKey = String(verdict.termMonths);
  const term = v.termOf[termKey] ?? `${v.termMonths.before}${fmt.number(verdict.termMonths)}${v.termMonths.after}`;
  return (
    <Card as="section" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{v.heading}</h2>
      <Sentence size="lg" measure>
        {v.bank} <Num value={verdict.offerRate} /> {term}
        {v.afterTax}
        <Num value={verdict.offerAfterTax} />
        {v.perYear}
      </Sentence>
      <Sentence size="lg" measure>
        {v.fund}
        <Num value={verdict.fundRate} /> <span className="text-sm text-muted-foreground">({v.fundState})</span>
        {v.afterTax}
        <Num value={verdict.fundAfterTax} />
        {v.perYear}
      </Sentence>
      <Sentence size="lg" measure>
        {v.gap} <Num value={verdict.gap} size="figure" />
        {v.perYearShort}{verdict.better !== "even" && <span className="text-base"> {v.inFavor[verdict.better]}</span>} —{" "}
        <Judged worth={verdict.worth} below={v.below} yes={v.worth} threshold={verdict.threshold} label={v.thresholdLabel} />
      </Sentence>
      <p className="text-sm text-muted-foreground max-w-measure">{v.liquidity}</p>
      <RulesLine ids={["MF-34", "BANK-06"]} />
      {verdict.termMonths < 12 && <p className="text-sm text-muted-foreground max-w-measure">{v.rolled}</p>}
      {verdict.termMonths > 12 && <p className="text-sm text-muted-foreground max-w-measure">{v.longer}</p>}
      <TaxWords depositRate={depositRate} fundRate={fundRate} />
    </Card>
  );
}

/** The two tax sentences, in the guides' words (bank-deposit and money-market guides), each with its rule chips. */
export function TaxWords({ depositRate, fundRate }: { depositRate: SiteValue | null; fundRate: SiteValue | null }) {
  const t = copy.taxWords;
  return (
    <div className="border-t border-border pt-3 flex flex-col gap-2">
      <h3 className="font-medium">{t.heading}</h3>
      <Sentence measure>
        {t.deposit} {depositRate ? <Num value={depositRate} /> : null} {t.depositMid}
      </Sentence>
      <RulesLine ids={["TXI-03", "TXI-07"]} />
      <Sentence measure>
        {t.fund} {fundRate ? <Num value={fundRate} /> : null} {t.fundMid} {t.fundTrack}
      </Sentence>
      <RulesLine ids={["TXS-12", "TXS-07"]} />
    </div>
  );
}

/** One judgement line (2026-10-24): the yearly size against P-03's negotiate threshold. */
export function MaterialityLine({ m }: { m: IdleMateriality }) {
  const t = copy.materiality;
  return (
    <Sentence measure>
      {t.before}
      <Num value={m.amount} />
      {t.perYear}
      <Judged worth={m.worth} below={t.below} yes={t.worth} threshold={m.threshold} label={t.thresholdLabel} />
    </Sentence>
  );
}

/** Shown when the yearly size is under P-03's threshold: a small sum is no obstacle to a money-market fund (MF-15, MF-26, BANK-18). */
export function SmallSumLine() {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm max-w-measure">{copy.smallSum}</p>
      <RulesLine ids={["MF-15", "MF-26", "BANK-18"]} />
    </div>
  );
}

/** What `ReasonText` reads from the page, for the idle screen, which has no goal result behind it. */
export function idleCtx(bundle: CompareBundle, view: IdleView): ResultCtx {
  const g = { horizonYears: 1, amountNow: 0, monthly: 0, available: 0, anytime: false, returnPct: null, inflationPct: null, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } } as RunGoal;
  return { bundle, view: { names: view.names } as never, g, mk: makeValues(bundle, g), mode: "real", openField: () => undefined };
}

export { r2 };
