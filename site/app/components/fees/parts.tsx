// The small pieces of the fee page (design-spec 11.3): subject strip, headline, verdict tag, reference line, cap
// line, remainder line, thresholds line. Every figure goes through the provenance number.
import { Link } from "react-router";
import { r3fees } from "../../copy";
import { headlineGap, type CapView, type LineView, type NoRefReason, type ReferenceView, type SubjectView } from "../../lib/fees";
import type { SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconAlert, IconExternal, IconLock } from "../icons";
import { LeadTail, Num, NumberLegend, RuleRef, StateTag, StrengthLabel } from "../provenance";
import { Callout, Card, Tag, cx } from "../ui";
import { IconNotWorth, IconPhone, IconSwap, IconUnevaluated } from "./icons";

// ---------------------------------------------------------------- subject strip

export function SubjectStrip({ subject, goalName, publisherNames, otherRecords }: { subject: SubjectView; goalName: string; publisherNames: Record<string, string>; otherRecords?: { href: string; label: string } | null }) {
  const s = r3fees.strip;
  // The record is named by its publisher, which the data keeps in English: show the provider's Hebrew name, keep the record for the popover.
  const recordName = publisherNames[subject.record] ?? subject.record;
  const record = (
    <bdi className="font-medium" title={subject.record}>
      {recordName}
    </bdi>
  );
  let body;
  let back: string;
  if (subject.from === "compare") {
    body = (
      <>
        {s.compare}
        <bdi>{goalName}</bdi>
        {s.compareMid}
        <bdi>{subject.productName}</bdi>
        {s.compareRecord}
        {record}
      </>
    );
    back = s.backCompare;
  } else if (subject.from === "track" && subject.track) {
    body = (
      <>
        {s.track}
        <bdi className="font-medium">{subject.track.name}</bdi> (<bdi>{subject.track.company}</bdi>
        {s.trackAverage}
        <bdi dir="ltr">{subject.feeYear ?? subject.track.period.slice(0, 4)}</bdi>
      </>
    );
    back = s.backTrack;
  } else if (subject.from === "holding") {
    body = (
      <>
        {s.holding}
        {record}
      </>
    );
    back = s.backHolding;
  } else {
    body = (
      <>
        {s.guide}
        <bdi>{subject.productName}</bdi>
        {s.compareRecord}
        {record}
      </>
    );
    back = s.backGuide;
  }
  return (
    <Card className="!p-3.5 md:!p-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
      <p className="min-w-0">{body}</p>
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 shrink-0">
        {otherRecords && (
          <Link to={otherRecords.href} className="text-link hover:underline">
            {otherRecords.label}
          </Link>
        )}
        <Link to={subject.fromHref} className="text-link hover:underline">
          {back}
        </Link>
      </span>
    </Card>
  );
}

// ---------------------------------------------------------------- headline

/** A value the engine read a rule into as an inference (the "reading" label, TXG-35): marked as a secondary source is (audit 2026-10-24, A2). */
export const hasReading = (v: SiteValue) => !!v.labels?.some((l) => l.code === "reading");

export function ReadingMark({ value }: { value: SiteValue }) {
  return hasReading(value) ? <StrengthLabel strength="secondary" /> : null;
}

/** A plain-Hebrew reason first, the code after it in a chip (audit 2026-10-24, A2): never the code inside the sentence. */
export function ReasonWithCode({ message, code }: { message: string; code?: string }) {
  const isId = !!code && /^[A-Z]{1,4}-\d+$/.test(code);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>{message}</span>
      {isId && <RuleRef id={code!} />}
    </span>
  );
}

export function FeeHeadline({ product, total, withFees, withoutFees, years, preTax, omitted, gap, place, compareHref }: { product: string; total: SiteValue; withFees: SiteValue; withoutFees: SiteValue; years: number; preTax: string[]; omitted: string[]; gap: ReturnType<typeof headlineGap>; place: { rank: number; tied: boolean } | null; compareHref: string }) {
  const h = r3fees.headline;
  const g = r3fees.gap;
  const rk = r3fees.ranked;
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl lg:text-3xl font-semibold">{r3fees.title}</h1>
      <NumberLegend />
      {/* the one plain sentence first (audit 2026-10-24, A18): what bringing the fee to the average is worth, from the figure of the "אם יורידו ל־" field */}
      {gap && (
        <p className="text-lg font-medium">
          {gap.kind === "more" ? (
            <>
              {g.more[0]}
              <Num value={gap.worth} size="figure" />
              <LeadTail lead={g.more[1]}>{fmt.years(years)}</LeadTail>
              {g.more[2]}
            </>
          ) : (
            g.less
          )}
        </p>
      )}
      {place && (
        <p>
          {place.rank === 1 ? rk.first : (
            <>
              {rk.other[0]}
              <bdi>{place.rank}</bdi>
              {rk.other[1]}
            </>
          )}
          {place.tied && rk.tied}{" "}
          <Link to={compareHref} className="text-link hover:underline">
            {rk.link}
          </Link>
        </p>
      )}
      <p className="text-lg">
        {h.before}
        <bdi>{product}</bdi>
        {h.mid}
        <span className="figure">
          <Num value={total} size="figure" animate />
        </span>
        <LeadTail lead={h.in}>{fmt.years(years)}</LeadTail>
        {h.after}
        {/* On a phone the state tag sits under the sentence (UX fix 31); from md it follows it inline. */}
        <span className="mt-2 flex flex-wrap items-center gap-2 md:mt-0 md:ms-2 md:inline-flex">
          <StateTag state="computed" />
          <ReadingMark value={total} />
          {preTax.length > 0 && (
            <Tag tone="blocked" icon={<IconLock size={14} className="text-blocked" />}>
              {r3fees.preTax} <bdi dir="ltr">{preTax[0]}</bdi>
            </Tag>
          )}
        </span>
      </p>
      <p className="text-muted-foreground">
        {h.under}
        <Num value={withoutFees} />
        {h.with}
        <Num value={withFees} />.
      </p>
      {omitted.length > 0 && (
        <Callout tone="caution">
          {omitted.map((o) => (
            <span key={o} className="block">
              {r3fees.names[o === "deposit" ? "deposit" : o] ?? o}
              {r3fees.omitted[0]}
            </span>
          ))}
        </Callout>
      )}
    </header>
  );
}

// ---------------------------------------------------------------- verdict

export function VerdictTag({ line, thresholds, soften, compareHref }: { line: LineView; thresholds: { negotiate: SiteValue; avoid: SiteValue }; soften?: boolean; compareHref?: string }) {
  // lead decision 4c: the product ranks first for the saved goal, so "avoid" reads as a relative statement, with the way to the comparison
  const word = soften && line.verdict === "avoid" ? r3fees.verdictSoft : r3fees.verdict[line.verdict]!;
  const tag =
    line.verdict === "negotiate" ? (
      <Tag tone="caution" icon={<IconPhone size={14} />} className="text-sm">
        {word}
      </Tag>
    ) : line.verdict === "avoid" ? (
      <Tag tone="caution" icon={<IconSwap size={14} />} className="text-sm">
        {word}
      </Tag>
    ) : (
      <Tag tone="neutral" icon={<IconNotWorth size={14} />} className="text-sm">
        {word}
      </Tag>
    );
  const r = r3fees.reason;
  let reason: React.ReactNode;
  switch (line.reason) {
    case "negotiate":
      reason = (
        <>
          {r.negotiate[0]}
          <Num value={thresholds.negotiate} />
          {r.negotiate[1]}
        </>
      );
      break;
    case "avoid":
      reason = (
        <>
          {r.avoid[0]}
          <Num value={thresholds.avoid} />
          {r.avoid[1]}
        </>
      );
      break;
    case "below":
      reason = (
        <>
          {r.below[0]}
          <Num value={thresholds.negotiate} />
          {r.below[1]}
        </>
      );
      break;
    case "no-reference":
      reason = r.noReference;
      break;
    case "nothing-removes":
      reason = r.nothingRemoves;
      break;
    default:
      reason = r3fees.review.refNotBelow;
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {tag}
        {soften && line.verdict === "avoid" && compareHref && (
          <Link to={compareHref} className="text-link text-sm hover:underline">
            {r3fees.ranked.link}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{reason}</p>
      {!line.avoidEvaluated && (
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <IconUnevaluatedInline />
          <span>
            {r3fees.avoidNotEvaluated}{" "}
            <Link to="/goal" className="text-link hover:underline">
              {r3fees.setGoal}
            </Link>
          </span>
        </p>
      )}
    </div>
  );
}

function IconUnevaluatedInline() {
  return <IconUnevaluated size={16} className="shrink-0 mt-1" />;
}

// ---------------------------------------------------------------- reference

function LinkOutA({ link, label }: { link: { href: string }; label: string }) {
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline">
      {label}
      <IconExternal size={14} />
    </a>
  );
}

const linkLabel = (reason: NoRefReason) => (reason === "D20" ? r3fees.linkOuts.boi : reason === "isa-unconfirmed" ? r3fees.linkOuts.isa : reason === "tase-uncollected" ? r3fees.linkOuts.tase : "");

export function ReferenceLine({ reference }: { reference: ReferenceView }) {
  const r = r3fees.referenceLine;
  const cma = reference.cma;
  return (
    <div className="flex flex-col gap-1 text-sm">
      {cma ? (
        <>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <StateTag state="computed" />
            <span>
              {r.before}
              <bdi>{cma.specialization ? `${cma.classification} · ${cma.specialization}` : cma.classification}</bdi>
              {r.mid}
            </span>
            <Num value={cma.mean} />
            <span>{r.median}</span>
            <Num value={cma.median} />
            <span>{r.yearBefore}</span>
            {cma.year && <Num value={cma.year} display={String(cma.year.value)} />}
            {cma.count.value === 1 ? (
              <span>{r.tracksOne}</span>
            ) : (
              <>
                <span>{r.tracksBefore}</span>
                <Num value={cma.count} />
                <span>{r.tracksAfter.replace(/^ /, " ")}</span>
              </>
            )}
          </p>
          {reference.ownAverage && (
            <p className="text-muted-foreground">
              {r3fees.ownAverage[0]}
              <Num value={reference.ownAverage} />
              {r3fees.ownAverage[1]}
            </p>
          )}
        </>
      ) : (
        reference.none && (
          <p className="text-muted-foreground flex flex-col gap-0.5">
            <span>
              <span className="font-medium">{r3fees.noReference}</span>: {r3fees.noReferenceReasons[reference.none.reason] ?? (reference.none.reason === "no-class" ? r3fees.review.noClass : r3fees.review.emptyClass)}
            </span>
            {reference.none.linkOut && <LinkOutA link={reference.none.linkOut} label={linkLabel(reference.none.reason)} />}
          </p>
        )
      )}
      {reference.official && (
        <p className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span>
            {r3fees.review.official[0]}
            <bdi dir="ltr">{reference.official.year}</bdi>
            {r3fees.review.official[1]}
          </span>
          <Num value={reference.official.value} />
          <RuleRef id="PF-39" />
        </p>
      )}
      {reference.stale && (
        <p className="text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-0.5" />
          <span>
            {r3fees.review.staleLine} <bdi dir="ltr">{fmt.date(/^\d{4}-\d{2}$/.test(reference.stale.since) ? `${reference.stale.since}-01` : reference.stale.since)}</bdi>.
          </span>
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- cap

export function CapLine({ cap }: { cap: CapView }) {
  const c = r3fees.cap;
  if (cap.state === "none") return <p className="text-sm text-muted-foreground">{c.none}</p>;
  if (cap.state === "each-manager")
    return (
      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{c.eachManager}</span>
        {cap.ruleIds.map((id) => (
          <RuleRef key={id} id={id} />
        ))}
      </p>
    );
  if (cap.state === "open")
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <IconLock size={16} className="text-blocked shrink-0" />
        <span>
          {c.open}
          <bdi dir="ltr">{cap.code}</bdi>
        </span>
      </p>
    );
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span>{c.yearly}</span>
      <Num value={cap.rate} />
      <span>{cap.word === "per-year" ? c.perYear.trim() : c.perDeposit.trim()}</span>
      {cap.ruleIds.map((id) => (
        <RuleRef key={id} id={id} />
      ))}
    </p>
  );
}

// ---------------------------------------------------------------- remainder and thresholds

export function RemainderLine({ value }: { value: SiteValue }) {
  // an engine-speak line with nothing in it is not shown (audit 2026-10-24, A63)
  if (typeof value.value === "number" && Math.abs(value.value) < 0.5) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        {r3fees.remainder.before}
        <Num value={value} />
      </p>
      <p className="text-xs text-muted-foreground">{r3fees.remainder.line}</p>
    </div>
  );
}

export function ThresholdsLine({ negotiate, avoid }: { negotiate: SiteValue; avoid: SiteValue }) {
  const t = r3fees.thresholds;
  // Plain inline flow: no flex gap, so no space opens between a figure (or its flag) and the punctuation after it.
  return (
    <p className="text-sm text-muted-foreground">
      {t.before}
      <Num value={negotiate} exact={!Number.isInteger(negotiate.value)} />
      {t.mid}
      <Num value={avoid} exact={!Number.isInteger(avoid.value)} />
      {t.after}{" "}
      <Link to="/parameters" className="text-link hover:underline">
        {t.link}
      </Link>
    </p>
  );
}

export { cx };
