// Daily money-market fund (D29): how fast can I get my money, and what does it pay? A table of four cash products from the fastest to
// the slowest way back (founder, 2026-10-26): how soon the money is back is a coloured tag with an icon and a word (an order, not a
// measure, so no bar), and the rate is a bar with its figure, all on one scale. Each rate says where it comes from (the rate most of the
// collected banks publish, F-85, in the notes; the range across the collected banks, F-86; the site's assumption, D20). The other
// products link to their own guide pages. Until 2026-10-26 it was a filter over cards ("when do you need the money?"), with bars measured
// against the highest rate.
import { CalendarCheck, CalendarDays, Lock, Zap } from "lucide-react";
import { Link } from "react-router";
import { guideSignature as copy } from "../../copy";
import { fact, ladderRows, slowerPayNoMore, speedOrder, type LadderRow, type Speed } from "../../lib/guide-signature";
import { Num, RulesLine } from "../provenance";
import { ChartLegend, CompareTable, NoteList, Sentence, StepTag, Swatch, Tag, ValueBar } from "../kit";
import { CommonRateLine, type VisualProps } from "./kit";

const icons: Record<Speed, React.ReactNode> = { "any-time": <Zap aria-hidden="true" />, "trading-day": <CalendarCheck aria-hidden="true" />, "fixed-dates": <CalendarDays aria-hidden="true" />, "at-maturity": <Lock aria-hidden="true" /> };

export function MoneyMarketDailyVisual({ data }: VisualProps) {
  const rows = ladderRows(data);
  // the rate column's scale: the next whole percent above the highest rate, the same in every row
  const scale = Math.max(1, Math.ceil(Math.max(...rows.map((r) => Number(r.rate.value) || 0)) + 1e-9));
  const interval = fact(data, "maxInterval");
  const noExit = fact(data, "depositNoExitCount");
  const deposit = rows.find((r) => r.range);
  const current = rows.find((r) => r.banks);
  return (
    <div className="flex flex-col gap-4">
      {slowerPayNoMore(rows, data.id) && <Sentence measure>{copy.ladder.take}</Sentence>}

      <CompareTable
        caption={copy.ladder.caption}
        columns={[copy.ladder.columns.product, copy.ladder.columns.when, copy.ladder.columns.rate]}
        rows={rows.map((r) => {
          const mine = r.id === data.id;
          return {
            key: r.id,
            highlight: mine,
            head: mine ? (
              <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                <RowName row={r} />
                <Tag tone="positive">{copy.ladder.thisOne}</Tag>
              </span>
            ) : (
              <Link to={`/guide/${r.id}`} className="text-link hover:underline">
                <RowName row={r} />
              </Link>
            ),
            cells: [
              <div key="when" className="flex flex-col gap-1">
                <StepTag step={(speedOrder.indexOf(r.speed) + 1) as 1 | 2 | 3 | 4} icon={icons[r.speed]}>
                  {copy.ladder.when[r.speed]}
                </StepTag>
                <WhenNote speed={r.speed} interval={interval} />
              </div>,
              <ValueBar
                key="rate"
                value={
                  r.range ? (
                    <span dir="ltr" className="inline-block">
                      <Num value={r.range.lo} />–<Num value={r.rate} />
                    </span>
                  ) : (
                    <Num value={r.rate} />
                  )
                }
                frac={(Number(r.rate.value) || 0) / scale}
                lo={r.range ? (Number(r.range.lo.value) || 0) / scale : undefined}
                note={
                  r.kind === "assumption" ? (
                    copy.ladder.kinds.assumption
                  ) : r.range ? (
                    <>
                      {copy.ladder.kinds.range.before}
                      <Num value={r.range.count} /> {copy.ladder.kinds.range.after}
                    </>
                  ) : undefined
                }
              />,
            ],
          };
        })}
      />

      <ChartLegend
        items={[
          { id: "rate", swatch: <Swatch shape="box" className="bg-chart-value" />, label: copy.ladder.legend.rate },
          ...(deposit ? [{ id: "range", swatch: <Swatch shape="box" className="hatch-value" />, label: copy.ladder.legend.range }] : []),
        ]}
      />

      <NoteList
        items={[
          copy.ladder.notes.beforeTax,
          copy.ladder.notes.assumption,
          ...(current?.banks ? [<CommonRateLine key="common" rate={current.rate} count={current.banks.count} of={current.banks.of} />] : []),
          ...(deposit?.range && noExit
            ? [
                <span key="exit">
                  {Number(noExit.value) === Number(deposit.range.count.value) ? (
                    copy.ladder.notes.exit.all
                  ) : (
                    <>
                      {copy.ladder.notes.exit.before}
                      <Num value={noExit} /> {copy.ladder.notes.exit.of} <Num value={deposit.range.count} /> {copy.ladder.notes.exit.after}
                    </>
                  )}{" "}
                  <Link to={`/guide/bank-deposit#${copy.ladder.range.anchorId}`} className="text-link hover:underline">
                    {copy.ladder.notes.banksLink}
                  </Link>
                </span>,
              ]
            : []),
        ]}
      />
      <RulesLine ids={data.ruleIds} />
    </div>
  );
}

/** The line under a tag, where the word alone leaves out how: the fund's set hour (MF-10, MF-11), the longest wait between fixed dates (MF-08). */
function WhenNote({ speed, interval }: { speed: Speed; interval: ReturnType<typeof fact> }) {
  if (speed === "trading-day") return <span className="text-sm text-muted-foreground">{copy.ladder.tradingDay}</span>;
  if (speed === "fixed-dates" && interval)
    return (
      <span className="text-sm text-muted-foreground">
        {copy.ladder.interval.before} <Num value={interval} display={String(interval.value)} /> {copy.ladder.interval.after}
      </span>
    );
  return null;
}

/** A row's product, with the bank's name when its rate is one bank's own published figure (D30, D31): never a bank's rate as the product's. */
function RowName({ row }: { row: LadderRow }) {
  const name = copy.ladder.rows[row.id] ?? row.id;
  return row.rate.own ? (
    <>
      {name} {copy.ladder.ofBank} <bdi>{row.rate.own}</bdi>
    </>
  ) : (
    <>{name}</>
  );
}
