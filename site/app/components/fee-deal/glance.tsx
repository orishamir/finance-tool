// The deal at a glance, the column "העסקה במבט אחד" (method §10.6, `glance`): the fees that hold throughout, grouped by what they are
// charged on, each group with the rate its shares add to (F-111) and the sums its prices mark (F-112); then what changes and when: the
// fees that change at their price today, each group with its rate today, and by date. A fee with a cap shows its bar and its standing
// (F-113) inside its own block.
import type { ReactNode } from "react";
import type { DealSide } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import type { Glance, GlanceChange, GlanceFee, GlanceGroup } from "../../lib/fee-deal/glance";
import { capLine, type DealKind } from "../../lib/fee-deal/kinds";
import { groupKey, type GroupOn, type MarkView, type StandingView } from "../../lib/fee-deal/parts";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { GroupHead, Section, Tag, TextLink, When } from "../kit";
import { Num } from "../provenance";
import { FeeCapBar, FeeName, PriceWords, StandingTag, StandingWords, refName } from "./words";

/** The id of the reading's section under the columns, which the column's last line links to. */
export const READING_ID = "deal-reading";

/** A group's heading key: what is held reads "what has built up" in a product that saves. */
const headKey = (on: GroupOn, saved: boolean) => (on.on === "held" && saved ? "heldSaved" : groupKey(on));

/** A fee's later price where its standing is judged, and the month it starts. */
type Later = { at: string; standing: StandingView };

const differs = (a: StandingView, b: StandingView) => JSON.stringify(a.standing) !== JSON.stringify(b.standing);

const SideLead = ({ side }: { side: DealSide }) => (side === "all" ? null : <>{copy.sides[side]} </>);

/** The quiet box under a group: the rate its fees add to, and the sums its prices mark. */
function GroupBox({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1 rounded-md bg-muted/50 px-3 py-2 text-sm">{children}</div>;
}

/** The rate a group's fees add to; `lead` says when it holds ("היום ") where the group's rate changes later. */
function RateLine({ side, rate, of, lead }: { side: DealSide; rate: SiteValue; of: string; lead?: string }) {
  return (
    <p>
      {lead}
      <SideLead side={side} />
      {copy.glance.together}
      <Num value={rate} /> {of}
    </p>
  );
}

/** One sum a group's prices mark (F-112), as a sentence. */
function MarkLine({ mark, action, many }: { mark: MarkView; action: string; many: boolean }) {
  const m = copy.marks;
  if (mark.kind === "meet")
    return (
      <p>
        {m.meet.before}
        <Num value={mark.sum} />
        {m.meet.sum}
        <Num value={mark.rate} />
        {m.meet.rate}
        <Num value={mark.amount} />
        {m.meet.after}
      </p>
    );
  const words = mark.on === "held" ? (mark.kind === "min" ? m.minHeld : m.maxHeld) : mark.kind === "min" ? m.minAction : m.maxAction;
  return (
    <p>
      <SideLead side={mark.side} />
      {many && m.whose.replace("{name}", refName(mark.fee))}
      {words.before.replace("{noun}", m.noun[action] ?? m.noun.none!)}
      <Num value={mark.amount} />
      {words.after}
    </p>
  );
}

/**
 * One fee in a group. A fee whose price is judged against its cap is a block: its name and standing tag, the bar, and the price with what
 * its standing says. Any other fee is one line: its name and its price (and its sale's, where a sale is priced apart).
 */
function FeeLine({ fee, kind, saved, lead, later }: { fee: GlanceFee; kind: DealKind | null; saved: boolean; lead?: string; later?: Later }) {
  const cap = capLine(kind, fee.kind);
  const judged = fee.standing.standing.judged && cap.state === "value";
  const price = <PriceWords price={fee.price} kind={fee.kind} saved={saved} />;
  if (judged)
    return (
      <li className="flex flex-col gap-2">
        <span className="flex flex-wrap items-center gap-2">
          <FeeName fee={fee} className="font-medium" />
          {later && differs(later.standing, fee.standing) ? <StandingTag standing={later.standing} from={later.at} /> : <StandingTag standing={fee.standing} />}
        </span>
        <FeeCapBar kind={fee.kind} now={fee.standing} {...(later ? { later: later.standing } : {})} cap={cap.value} />
        <p className="text-sm text-muted-foreground">
          {lead}
          {price}
          <StandingWords standing={fee.standing} {...(cap.binds ? { binds: cap.binds } : {})} />
        </p>
      </li>
    );
  return (
    <li className="flex flex-wrap items-baseline gap-x-1">
      <FeeName fee={fee} after={copy.price.sep} />
      {fee.sale ? (
        <span>
          {copy.sides.buy} {price}; {copy.sides.sell} <PriceWords price={fee.sale.price} kind={fee.kind} saved={saved} />
        </span>
      ) : (
        price
      )}
    </li>
  );
}

function Group({ group, kind, saved, lead, laterOf }: { group: GlanceGroup; kind: DealKind | null; saved: boolean; lead?: string; laterOf?: (feeId: string) => Later | undefined }) {
  const key = headKey(group.on, saved);
  const action = group.on.on === "action" ? (group.on.action ?? "none") : "none";
  const rates = group.rates.filter((r) => r.fees.length > 1);
  return (
    <div className="flex flex-col gap-2">
      <GroupHead as="h4" plain>
        {copy.on[key]}
      </GroupHead>
      {group.fees.length > 0 && (
        <ul className="flex flex-col gap-3">
          {group.fees.map((f) => {
            const later = laterOf?.(f.fee);
            return <FeeLine key={f.fee} fee={f} kind={kind} saved={saved} {...(lead ? { lead } : {})} {...(later ? { later } : {})} />;
          })}
        </ul>
      )}
      {(rates.length > 0 || group.marks.length > 0) && (
        <GroupBox>
          {rates.map((r) => (
            <RateLine key={r.side} side={r.side} rate={r.rate} of={copy.glance.of[key] ?? ""} {...(lead ? { lead } : {})} />
          ))}
          {group.marks.map((m, k) => (
            <MarkLine key={k} mark={m} action={action} many={group.fees.length > 1} />
          ))}
        </GroupBox>
      )}
    </div>
  );
}

/** A change at a date: "{name}: {the new price}, במקום {the old}", and the new price's standing where it is judged. */
function ChangeLine({ change, kind, saved }: { change: GlanceChange; kind: DealKind | null; saved: boolean }) {
  const cap = capLine(kind, change.kind);
  return (
    <li className="flex flex-wrap items-baseline gap-x-1">
      <FeeName fee={change} after={copy.price.sep} />
      <span>
        <SideLead side={change.side} />
        <PriceWords price={change.to} kind={change.kind} saved={saved} />
        {copy.glance.instead}
        <PriceWords price={change.from} kind={change.kind} saved={saved} />
        {change.standing.standing.judged && cap.state === "value" ? <StandingWords standing={change.standing} /> : "."}
      </span>
    </li>
  );
}

/** The column. `saved`: the deal's product saves, so a share of what is held reads "what has built up". */
export function GlanceColumn({ glance, kind, saved, empty, names }: { glance: Glance; kind: DealKind | null; saved: boolean; empty: boolean; names: (feeId: string) => string }) {
  // a fee that changes shows its later price's outline on its bar: the standing of its first change that is judged
  const laterOf = (feeId: string): Later | undefined => {
    for (const d of glance.dates) {
      const c = d.changes.find((x) => x.fee === feeId && x.standing.standing.judged);
      if (c) return { at: d.at, standing: c.standing };
    }
    return undefined;
  };
  // a fee that is free now is said by its date's change; a group of such fees alone stays where its fees that hold throughout add to a rate today
  const changing = glance.changing.map((g) => ({ ...g, fees: g.fees.filter((f) => f.price.form !== "free") })).filter((g) => g.fees.length > 0 || g.rates.some((r) => r.fees.length > 1));
  return (
    <Section title={copy.glance.title} level="kick" heading="h2">
      {empty ? (
        <p className="text-sm text-muted-foreground">{copy.glance.empty}</p>
      ) : (
        <>
          {glance.throughout.length > 0 && (
            <Section title={copy.glance.throughout} level="card" heading="h3" className="gap-3">
              {glance.throughout.map((g) => (
                <Group key={groupKey(g.on)} group={g} kind={kind} saved={saved} />
              ))}
            </Section>
          )}
          <Section title={copy.glance.changes} level="card" heading="h3" className="gap-3 border-t border-border pt-4">
            {glance.dates.length === 0 && <p className="text-sm text-muted-foreground">{copy.glance.still}</p>}
            {changing.map((g) => (
              <Group key={groupKey(g.on)} group={g} kind={kind} saved={saved} lead={copy.standing.now} laterOf={laterOf} />
            ))}
            {glance.dates.map((d) => (
              <div key={d.at} className="flex flex-col gap-2">
                <h4 className="flex flex-wrap items-center gap-2 font-semibold">
                  <When iso={d.at} />
                  {d.months && (
                    <Tag tone="neutral" shape="pill">
                      <Num value={d.months} prefix={copy.glance.inMonths} display={fmt.months} />
                    </Tag>
                  )}
                </h4>
                <ul className="flex flex-col gap-2 text-sm">
                  {d.changes.map((c, k) => (
                    <ChangeLine key={`${c.fee}-${c.side}-${k}`} change={c} kind={kind} saved={saved} />
                  ))}
                </ul>
                {d.groups.some((g) => g.fees.length > 1) && (
                  <GroupBox>
                    {d.groups
                      .filter((g) => g.fees.length > 1)
                      .map((g, k) => (
                        <RateLine key={k} side={g.side} rate={g.rate} of={copy.glance.of[headKey(g.on, saved)] ?? ""} />
                      ))}
                  </GroupBox>
                )}
              </div>
            ))}
          </Section>
          {glance.unread.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {copy.glance.unread}
              {glance.unread.map(names).join(", ")}
            </p>
          )}
        </>
      )}
      <TextLink to={`#${READING_ID}`} className="text-sm">
        {copy.glance.toReading}
      </TextLink>
    </Section>
  );
}
