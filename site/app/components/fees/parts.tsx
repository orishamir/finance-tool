// The small pieces of the fee page (design-spec 11.3): subject strip, headline, verdict tag, reference line, cap
// line, remainder line, thresholds line. Every figure goes through the provenance number.
import { Link } from "react-router";
import { r3fees } from "../../copy";
import type { CapView, LineView, NoRefReason, ReferenceView, SubjectView } from "../../lib/fees";
import type { SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconAlert, IconExternal, IconLock } from "../icons";
import { Num, RuleRef, StateTag } from "../provenance";
import { Callout, Card, Tag, cx } from "../ui";
import { IconNotWorth, IconPhone, IconSwap, IconUnevaluated } from "./icons";

// ---------------------------------------------------------------- subject strip

export function SubjectStrip({ subject, goalName }: { subject: SubjectView; goalName: string }) {
  const s = r3fees.strip;
  const record = <bdi className="font-medium">{subject.record}</bdi>;
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
      <Link to={subject.fromHref} className="text-link hover:underline shrink-0">
        {back}
      </Link>
    </Card>
  );
}

// ---------------------------------------------------------------- headline

export function FeeHeadline({ product, total, withFees, withoutFees, years, preTax, omitted }: { product: string; total: SiteValue; withFees: SiteValue; withoutFees: SiteValue; years: number; preTax: string[]; omitted: string[] }) {
  const h = r3fees.headline;
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl lg:text-3xl font-semibold">{r3fees.title}</h1>
      <p className="text-lg flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span>
          {h.before}
          <bdi>{product}</bdi>
          {h.mid}
        </span>
        <span className="figure">
          <Num value={total} size="figure" animate />
        </span>
        <span>
          {h.in}
          {fmt.years(years)}
          {h.after}
        </span>
        <StateTag state="computed" />
        {preTax.length > 0 && (
          <Tag tone="blocked" icon={<IconLock size={14} className="text-blocked" />}>
            {r3fees.preTax} <bdi dir="ltr">{preTax[0]}</bdi>
          </Tag>
        )}
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

export function VerdictTag({ line, thresholds }: { line: LineView; thresholds: { negotiate: SiteValue; avoid: SiteValue } }) {
  const word = r3fees.verdict[line.verdict]!;
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
      <div>{tag}</div>
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
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span>{t.before}</span>
      <Num value={negotiate} />
      <span>{t.mid}</span>
      <Num value={avoid} />
      <span>{t.after}</span>
      <Link to="/parameters" className="text-link hover:underline">
        {t.link}
      </Link>
    </p>
  );
}

export { cx };
