// The small pieces of the fee page (design-spec 11.3): subject strip, headline, verdict tag, reference line, cap
// line, remainder line, thresholds line. Every figure goes through the provenance number.
import { Link } from "react-router";
import { r3fees } from "../../copy";
import { headlineGap, REACH_LIMITS, type CapView, type Factory, type FeeReach, type LineView, type NoRefReason, type ReferenceView, type SubjectView } from "../../lib/fees";
import { anyWeak, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconAlert, IconExternal, IconLock } from "../icons";
import { IdRef, LeadTail, Num, NumberLegend, ReadingTag, RuleRef, RulesChip, StateTag } from "../provenance";
import { Callout, Card, cx, gershayim, LongestCase, MixedName, Sentence, Tag, When } from "../kit";
import { IconNotWorth, IconPhone, IconSwap, IconUnevaluated } from "./icons";

// ---------------------------------------------------------------- subject strip

export function SubjectStrip({ subject, publisherNames, otherRecords }: { subject: SubjectView; publisherNames: Record<string, string>; otherRecords?: { href: string; label: string } | null }) {
  const s = r3fees.strip;
  // The record is named by its publisher, which the data keeps in English: show the provider's Hebrew name, keep the record for the popover.
  const recordName = gershayim(publisherNames[subject.record] ?? subject.record);
  const record = (
    <bdi className="font-medium" title={subject.record}>
      {recordName}
    </bdi>
  );
  let body;
  let back: string | null;
  if (subject.from === "track" && subject.track) {
    body = (
      <>
        {s.track}
        <bdi className="font-medium">{gershayim(subject.track.name)}</bdi> (<bdi>{gershayim(subject.track.company)}</bdi>
        {s.trackAverage}
        <bdi dir="ltr">{subject.feeYear ?? subject.track.period.slice(0, 4)}</bdi>
      </>
    );
    back = s.backTrack;
  } else {
    body = (
      <>
        {s.guide}
        <bdi>{gershayim(subject.productName)}</bdi>
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
          <Link to={otherRecords.href} className="text-link hover:underline tap-area">
            {otherRecords.label}
          </Link>
        )}
        {subject.fromHref && back && (
          <Link to={subject.fromHref} className="text-link hover:underline tap-area">
            {back}
          </Link>
        )}
      </span>
    </Card>
  );
}

// ---------------------------------------------------------------- headline

/** A value the engine read a rule into as an inference (the "reading" label, e.g. TXK-07 when the CPI fell): marked as the site's reading (not as a secondary source, which it is not). */
export const hasReading = (v: SiteValue) => !!v.labels?.some((l) => l.code === "reading");

export function ReadingMark({ value }: { value: SiteValue }) {
  return hasReading(value) ? <ReadingTag /> : null;
}

/** A plain-Hebrew reason first, then the rule behind it as D48's chip ("חוקים וכללים · 1"): never a code in the line. */
export function ReasonWithCode({ message, code }: { message: string; code?: string }) {
  const isId = !!code && /^[A-Z]{1,4}-\d+$/.test(code);
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>{message}</span>
      {isId && <RuleRef id={code!} />}
    </span>
  );
}

export function FeeHeadline({ product, total, withFees, withoutFees, years, preTax, omitted, gap, place }: { product: string; total: SiteValue; withFees: SiteValue; withoutFees: SiteValue; years: number; preTax: string[]; omitted: string[]; gap: ReturnType<typeof headlineGap>; place: { rank: number; tied: boolean } | null }) {
  const h = r3fees.headline;
  const g = r3fees.gap;
  const rk = r3fees.ranked;
  // stands in for any figure in the unseen longest case of a line: what the longest amount a slider can reach takes on the screen
  const big: SiteValue = { ...total, value: 9_999_999 };
  // D86, D90: the figure is a reduction held for the discount period, then back to the rate after it; said in the field's own words
  const held = gap?.kind === "more" ? gap.held : undefined;
  const gapLine = (worth: SiteValue, overYears: number) => (
    <div className="flex flex-col gap-1">
      <p className="text-lg font-medium">
        {g.more[0]}
        <Num value={worth} size="figure" />
        <LeadTail lead={g.more[1]} text={fmt.years(overYears)}>{fmt.years(overYears)}</LeadTail>
        {g.more[2]}
      </p>
      {held && (
        <Sentence size="sm" tone="muted">
          {r3fees.reduction.held.before}
          <Num value={held.period} display={fmt.number(Number(held.period.value))} />
          <LeadTail lead={r3fees.reduction.held[held.unit]}>
            <Num value={held.rate} />
            {r3fees.reduction.held.end}
          </LeadTail>
        </Sentence>
      )}
    </div>
  );
  const placeLine = (rank: number, tied: boolean) => (
    <p>
      {rank === 1 ? rk.first : (
        <>
          {rk.other[0]}
          <bdi>{rank}</bdi>
          {rk.other[1]}
        </>
      )}
      {tied && rk.tied}
    </p>
  );
  const totalLine = (value: SiteValue, overYears: number, animate: boolean) => (
    <Sentence size="lg">
      {h.before}
      <bdi>{product}</bdi>
      {h.mid}
      <span className="figure">
        <Num value={value} size="figure" animate={animate} />
      </span>
      <LeadTail lead={h.in} text={fmt.years(overYears)}>{fmt.years(overYears)}</LeadTail>
      {h.after}
      {/* from md the state tag follows the sentence inline; on a phone it sits under the sentence's held room (UX fix 31), so a
          longer figure that wraps the sentence onto another line no longer moves it (29 px at 390) */}
      <span className="hidden md:ms-2 md:inline-flex md:flex-wrap md:items-center md:gap-2">{totalTags(value)}</span>
    </Sentence>
  );
  const totalTags = (value: SiteValue) => (
    <>
      <StateTag state="computed" />
      <ReadingMark value={value} />
      {preTax.length > 0 && (
        <Tag tone="blocked" icon={<IconLock size={14} className="text-blocked" />}>
          {r3fees.preTax} <bdi dir="ltr">{preTax[0]}</bdi>
        </Tag>
      )}
    </>
  );
  const underLine = (without: SiteValue, withThem: SiteValue) => (
    <Sentence tone="muted">
      {h.under}
      <Num value={without} />
      {h.with}
      <Num value={withThem} />.
    </Sentence>
  );
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl lg:text-3xl font-semibold">{r3fees.title}</h1>
      <NumberLegend canEnter institution={anyWeak([total, withFees, withoutFees])} />
      {/* the one plain sentence first: what bringing the fee to the average is worth, from the figure of the "אם יורידו ל־" field */}
      {/* the first line is always there: with no average of similar tracks it says so, and the header kept growing by a line at 390 px
          when an average came and went */}
      <LongestCase cases={[gapLine(big, 40), <p key="less" className="text-lg font-medium">{g.less}</p>, <p key="after" className="text-lg font-medium">{g.after}</p>, <p key="none" className="text-lg font-medium">{g.none}</p>]}>
        {gap?.kind === "more" ? gapLine(gap.worth, years) : <p className="text-lg font-medium">{gap ? g[gap.kind] : g.none}</p>}
      </LongestCase>
      {/* the place among the options is not there on every plan: its room stays, or the page moves when it comes back */}
      <LongestCase cases={[placeLine(1, true), placeLine(99, true)]}>{place && placeLine(place.rank, place.tied)}</LongestCase>
      <LongestCase cases={[totalLine(big, 40, false)]}>{totalLine(total, years, true)}</LongestCase>
      <span className="flex flex-wrap items-center gap-2 md:hidden">{totalTags(total)}</span>
      <Sentence tone="muted">{h.meaning}</Sentence>
      <LongestCase cases={[underLine(big, big)]}>{underLine(withoutFees, withFees)}</LongestCase>
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

/** The badge's word for a card (the sensitivity names the verdict a flip leaves in the same words). */
export function verdictWord(line: LineView): string {
  // D90 revised: a fee not worth negotiating now whose discount ends within the period says "not now", since it may be worth it then; "avoid"
  // comes only with an option that ranks above the product (D90 revised the same day), so no softened word is needed for the first place
  return line.reason === "check-after" ? r3fees.verdictLater : r3fees.verdict[line.verdict]!;
}

export function VerdictTag({ line, thresholds, reach, mk }: { line: LineView; thresholds: { negotiate: SiteValue; avoid: SiteValue }; /** What would make the cut worth negotiating (the sensitivity's search); its room is held before it comes */ reach?: FeeReach; mk?: Factory }) {
  const word = verdictWord(line);
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
  // D90: when the discount ends and what the fee can rise to, which is when to check again; each maqaf lead is bound to its figure, and the
  // colon to the rate before it, so neither starts or ends a line alone (390 px)
  const ends = (rate: SiteValue | null, a: NonNullable<LineView["after"]>) => {
    const n = Number(a.period.value);
    return (
      <>
        <LeadTail lead={r.ends.lead}>
          <Num value={a.period} display={a.unit === "years" ? fmt.years(n) : fmt.months(n)} />
        </LeadTail>
        {rate && (
          <LeadTail lead={r.ends.from}>
            <Num value={rate} />
          </LeadTail>
        )}
        <LeadTail lead={rate ? r.ends.to : r.ends.risesTo}>
          <Num value={a.rate} />
          {r.ends.end}
        </LeadTail>
      </>
    );
  };
  // "the page never says what would push the 108 ₪ above 1,000 ₪": one plain line after a "not worth it" reason
  const reachLine = (x: FeeReach | undefined, l: LineView) => {
    if (!x || !mk || (x.amountNow === undefined && x.horizonYears === undefined)) return null;
    const rr = r3fees.reach;
    // F-61's search (D90 revised): the amount or the years at which bringing the line from its rate to the regulator's mean is worth the
    // site's negotiate threshold (P-03), so each found figure lists those three beside the plan's run
    const searched: Record<string, SiteValue> = {
      [rr.thresholdName]: thresholds.negotiate,
      ...(l.reference.cma ? { [rr.toName]: l.reference.cma.mean } : {}),
      ...(l.rate ? { [r3fees.names[l.line]!]: l.rate } : {}),
    };
    // the 1,000 ₪ the cut reaches, in the same line; the maqaf lead is bound to its figure, the colon after it
    return (
      <>
        <LeadTail lead={`${rr.lead}${rr.to}`}>
          <Num value={thresholds.negotiate} />
          {rr.colon}
        </LeadTail>{" "}
        {x.amountNow !== undefined && (
          <>
            {rr.amount[0]}
            <Num value={mk.nis(x.amountNow, "F-61", rr.amountName, undefined, searched)} />
            {rr.amount[1]}
          </>
        )}
        {x.amountNow !== undefined && x.horizonYears !== undefined && rr.or}
        {x.horizonYears !== undefined && (
          <>
            {rr.years[0]}
            <Num value={mk.plain(x.horizonYears, "years", "F-61", rr.yearsName, searched)} display={fmt.years(x.horizonYears)} />
            {rr.years[1]}
          </>
        )}
        {rr.end}
      </>
    );
  };
  const reasonOf = (kind: LineView["reason"], l: LineView, x?: FeeReach): React.ReactNode => {
    switch (kind) {
      case "negotiate":
      case "negotiate-ends":
        return (
          <>
            {r.negotiate[0]}
            <Num value={thresholds.negotiate} />
            {r.negotiate[1]}
          </>
        );
      case "check-after":
        // the cut to the average now is worth less than the threshold, or the fee is not above the average now: not "worth negotiating" now
        return (
          <>
            {l.suggestion !== null ? (
              <>
                {r.nowSmall[0]}
                <Num value={thresholds.negotiate} />
                {r.nowSmall[1]}
              </>
            ) : (
              r.nowNothing
            )}
            {l.suggestion !== null && reachLine(x, l)}
          </>
        );
      case "avoid":
        // a discount that ends within the period: the card says when the fee rises, whatever the verdict (D90 revised). The products above
        // follow in the same line, named; held apart, the reason's room left a gap
        // of three lines at 390 px between the cost and the names
        return (
          <>
            {r.avoid[0]}
            <Num value={thresholds.avoid} />
            {r.avoid[1]}
            <AboveNames removedBy={l.removedBy} />
          </>
        );
      case "below":
        return (
          <>
            {r.below[0]}
            <Num value={thresholds.negotiate} />
            {r.below[1]}
            {reachLine(x, l)}
          </>
        );
      case "no-reference":
        return r.noReference;
      case "nothing-removes":
        return r.nothingRemoves;
      default:
        return r3fees.review.refNotBelow;
    }
  };
  // every reason a slider can bring is laid out unseen: "העלות נמוכה מ־1,000 ₪." took one line at 390 px where the others took two
  // the reach line comes after the sensitivity's search: its room is held by a case with the longest sum and horizon it can say
  const longReach: FeeReach = { amountNow: REACH_LIMITS.amountNow, horizonYears: REACH_LIMITS.years - 1 };
  const casesOf = (l: LineView): [LineView["reason"], LineView, FeeReach?][] => [
    ["negotiate", l],
    // under "avoid" the line names every option above the product, which a slider and the ranking can change: its room is every option's that could be one
    ["avoid", { ...l, removedBy: l.alternativesRoom }],
    ["below", l, longReach],
    ["no-reference", l],
    ["nothing-removes", l],
    ["not-below", l],
    ...(l.after
      ? ([
          ["negotiate-ends", l],
          ["avoid", { ...l, judgedFraction: l.judgedFraction ?? 0, removedBy: l.alternativesRoom }],
          ["check-after", { ...l, suggestion: l.suggestion ?? 0 }, longReach],
          ["check-after", { ...l, suggestion: null }],
        ] as [LineView["reason"], LineView, FeeReach?][])
      : []),
  ];
  // the cards keep their order, so a card holds only its own reasons
  const cases = casesOf(line);
  // when the discount ends comes first, on its own line, the same under every verdict: inside the reason it followed words that change
  // with the verdict, and at a 40-year horizon at 390 px it rose a line with its three figures
  const endsShown = (kind: LineView["reason"], l: LineView) => kind === "negotiate-ends" || kind === "check-after" || (kind === "avoid" && l.judgedFraction !== undefined);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{tag}</div>
      {line.after && (
        <LongestCase cases={[<p key="e" className="text-sm">{ends(line.rate, line.after)}</p>]}>
          <p className="text-sm text-muted-foreground">{endsShown(line.reason, line) && ends(line.rate, line.after)}</p>
        </LongestCase>
      )}
      <LongestCase cases={cases.map(([k, l, x], i) => <p key={i} className="text-sm">{reasonOf(k, l, x)}</p>)}>
        <p className="text-sm text-muted-foreground">{reasonOf(line.reason, line, reach)}</p>
      </LongestCase>
      {!line.avoidEvaluated && (
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <IconUnevaluatedInline />
          <span>{r3fees.avoidNotEvaluated}</span>
        </p>
      )}
    </div>
  );
}

/** D90 revised the same day: the options that rank above the product, without the fee or with a lower one, in two groups, each a link. */
function AboveNames({ removedBy }: { removedBy: LineView["removedBy"] }) {
  const groups = [
    { lead: r3fees.removedBy.without, list: removedBy.filter((o) => !o.lower) },
    { lead: r3fees.removedBy.lower, list: removedBy.filter((o) => o.lower) },
  ].filter((g) => g.list.length > 0);
  return (
    <>
      {groups.map((g) => (
        <span key={g.lead}>
          {" "}
          {g.lead}
          {g.list.map((o, i) => (
            <span key={o.id}>
              {i > 0 && ", "}
              <Link to={`/guide/${o.id}`} className="text-link hover:underline">
                <MixedName>{o.name}</MixedName>
              </Link>
            </span>
          ))}
          .
        </span>
      ))}
    </>
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

/** `noAverageSaid`: the verdict's reason above already says there is no average, so the line gives only why (the deposit card said "אין ממוצע להשוואה" twice). */
export function ReferenceLine({ reference, noAverageSaid = false }: { reference: ReferenceView; noAverageSaid?: boolean }) {
  const r = r3fees.referenceLine;
  const cma = reference.cma;
  return (
    <div className="flex flex-col gap-1 text-sm">
      {cma ? (
        <>
          <Sentence as="p">
            <StateTag state="computed" /> {r.before}
            <bdi>{cma.specialization ? `${cma.classification} · ${cma.specialization}` : cma.classification}</bdi>
            {r.mid}
            <Num value={cma.mean} />
            {r.yearBefore}
            {cma.year && <Num value={cma.year} display={String(cma.year.value)} />}
            {cma.count.value === 1 ? (
              r.tracksOne
            ) : (
              <>
                {r.tracksBefore}
                <Num value={cma.count} />
                {r.tracksAfter}
              </>
            )}
          </Sentence>
          {reference.ownAverage && (
            <Sentence tone="muted">
              {r3fees.ownAverage[0]}
              <Num value={reference.ownAverage} />
              {r3fees.ownAverage[1]}
            </Sentence>
          )}
          {/* the class comes from a track the site chose, not from the record the run prices: said plainly, and that the average is of no
              one fund, beside a strip that names another company */}
          {reference.bySite && (
            <Sentence tone="muted">
              {r3fees.bySite[0]}
              <bdi dir="ltr" className="slashed-zero">{reference.bySite.trackId}</bdi>
              {r3fees.bySite[1]}
              <Link to={`/companies/${reference.bySite.companyId}/${reference.bySite.trackId}`} className="text-link hover:underline">
                <MixedName>{reference.bySite.name}</MixedName>
              </Link>
              {r3fees.bySite[2]}
              <MixedName>{reference.bySite.company}</MixedName>
              {r3fees.bySite[3]}
            </Sentence>
          )}
        </>
      ) : (
        reference.none && (
          <p className="text-muted-foreground flex flex-col gap-0.5">
            <span>
              {!noAverageSaid && <><span className="font-medium">{r3fees.noReference}</span>: </>}
              {r3fees.noReferenceReasons[reference.none.reason] ?? (reference.none.reason === "no-class" ? r3fees.review.noClass : r3fees.review.emptyClass)}
            </span>
            {reference.none.linkOut && <LinkOutA link={reference.none.linkOut} label={linkLabel(reference.none.reason)} />}
          </p>
        )
      )}
      {reference.official && (
        <Sentence tone="muted">
          {r3fees.review.official[0]}
          <bdi dir="ltr">{reference.official.year}</bdi>
          {r3fees.review.official[1]} <Num value={reference.official.value} />. {r3fees.review.officialNotUsed}{" "}
          {/* the rule chip's words, not the bare code ("PF-39" said nothing), last in its line as the cap line's */}
          <RulesChip ids={["PF-39"]} />
        </Sentence>
      )}
      {reference.stale && (
        <p className="text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-0.5" />
          <span>
            <When iso={reference.stale.since} lead={`${r3fees.review.staleLine} `} />.
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
        <RulesChip ids={cap.ruleIds} />
      </p>
    );
  if (cap.state === "open")
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <IconLock size={16} className="text-blocked shrink-0" />
        <span>
          {c.open} <IdRef id={cap.code} />
        </span>
      </p>
    );
  return (
    <Sentence size="sm" tone="muted">
      {c.yearly} <Num value={cap.rate} /> {cap.word === "per-year" ? c.perYear.trim() : c.perDeposit.trim()}
      {" "}
      <RulesChip ids={cap.ruleIds} />
    </Sentence>
  );
}

// ---------------------------------------------------------------- remainder and thresholds

export function RemainderLine({ value }: { value: SiteValue }) {
  // an engine-speak line with nothing in it is not shown
  if (typeof value.value === "number" && Math.abs(value.value) < 0.5) return null;
  return (
    <div className="flex flex-col gap-1">
      <Sentence size="sm">
        {r3fees.remainder.before}
        <Num value={value} />
      </Sentence>
      <p className="text-xs text-muted-foreground">{r3fees.remainder.line}</p>
    </div>
  );
}

export function ThresholdsLine({ negotiate, avoid }: { negotiate: SiteValue; avoid: SiteValue }) {
  const t = r3fees.thresholds;
  // Plain inline flow: no flex gap, so no space opens between a figure (or its flag) and the punctuation after it.
  return (
    <Sentence size="sm" tone="muted">
      {t.before}
      <Num value={negotiate} exact={!Number.isInteger(negotiate.value)} />
      {t.mid}
      <Num value={avoid} exact={!Number.isInteger(avoid.value)} />
      {t.after}{" "}
      <Link to="/parameters" className="text-link hover:underline">
        {t.link}
      </Link>
    </Sentence>
  );
}

export { cx };
