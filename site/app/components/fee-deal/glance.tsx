// The deal at a glance, the column "העסקה במבט אחד" (method §10.6, `glance`): the fees that hold throughout, grouped by what they are
// charged on, each group with the rate its shares add to (F-111) and the sums its prices mark (F-112); then what changes and when: the
// fees that change at their price today, each group with its rate today, and by date. A fee with a cap shows its bar and its standing
// (F-113) inside its own block, read from its row of the reading's law card.
import type { ReactNode } from "react";
import type { DealSide } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import type { Glance, GlanceChange, GlanceFee, GlanceGroup } from "../../lib/fee-deal/glance";
import { groupKey, type GroupOn, type MarkView } from "../../lib/fee-deal/parts";
import type { LawRow } from "../../lib/fee-deal/reading";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { IconArrowDown } from "../icons";
import { GroupHead, Section, Tag, TextLink, TypedPlain, When, fill } from "../kit";
import { Num } from "../provenance";
import { CapBlock, FeeName, MeetSentence, PriceWords, StandingWords, refName } from "./words";

/** The id of the reading's section under the columns, which the column's last line links to. */
export const READING_ID = "deal-reading";

/** A group's heading key: what is held reads "what has built up" in a product that saves. */
const headKey = (on: GroupOn, saved: boolean) => (on.on === "held" && saved ? "heldSaved" : groupKey(on));

/** The deal's fees with a cap line, by id: each one's row of the reading's law card. */
type LawRows = ReadonlyMap<string, LawRow>;

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
        <MeetSentence mark={mark} />
      </p>
    );
  const words = mark.on === "held" ? (mark.kind === "min" ? m.minHeld : m.maxHeld) : mark.kind === "min" ? m.minAction : m.maxAction;
  return (
    <p>
      <SideLead side={mark.side} />
      {many && fill(m.whose, { name: refName(mark.fee) })}
      {fill(words.before, { noun: m.noun[action] ?? m.noun.none! })}
      <Num value={mark.amount} />
      {words.after}
    </p>
  );
}

/**
 * One fee in a group. A fee whose price is judged against its cap is a block (`row`, its law row): its name and standing tag, the bar,
 * and the price with what its standing says. Any other fee is one line: its name and its price (and its sale's, where a sale is priced apart).
 */
function FeeLine({ fee, row, saved, lead }: { fee: GlanceFee; row: LawRow | undefined; saved: boolean; lead?: string }) {
  const price = <PriceWords price={fee.price} kind={fee.kind} saved={saved} />;
  if (row?.cap.state === "value" && fee.standing.standing.judged)
    return (
      <li className="flex flex-col gap-2">
        <CapBlock row={row}>
          <p className="text-sm text-muted-foreground">
            {lead}
            {price}
            <StandingWords standing={fee.standing} {...(row.cap.binds ? { binds: row.cap.binds } : {})} />
          </p>
        </CapBlock>
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

function Group({ group, rows, saved, lead }: { group: GlanceGroup; rows: LawRows; saved: boolean; lead?: string }) {
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
          {group.fees.map((f) => (
            <FeeLine key={f.fee} fee={f} row={rows.get(f.fee)} saved={saved} {...(lead ? { lead } : {})} />
          ))}
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

/**
 * A change at a date: "{name}: {the new price}, במקום {the old}", and the new price's standing where it is judged. A fee that starts after a
 * free time says so before its name, the verb agreeing with the name ("מתחילים דמי חשבון קבועים, 10 ₪ בחודש"); a fee of the person's own
 * keeps the first form, which agrees with nothing.
 */
function ChangeLine({ change, row, saved }: { change: GlanceChange; row: LawRow | undefined; saved: boolean }) {
  const form = change.change === "starts" && change.kind !== "own" ? copy.nameForms[change.kind] : undefined;
  const standing = change.standing.standing.judged && row?.cap.state === "value" ? <StandingWords standing={change.standing} /> : ".";
  if (form)
    return (
      <li className="flex flex-wrap items-baseline gap-x-1">
        <FeeName fee={change} before={`${change.side === "all" ? "" : `${copy.sides[change.side]} `}${copy.glance.starts[form.g]}`} after=", " />
        <span>
          <PriceWords price={change.to} kind={change.kind} saved={saved} />
          {standing}
        </span>
      </li>
    );
  return (
    <li className="flex flex-wrap items-baseline gap-x-1">
      <FeeName fee={change} after={copy.price.sep} />
      <span>
        <SideLead side={change.side} />
        <PriceWords price={change.to} kind={change.kind} saved={saved} />
        {copy.glance.instead}
        <PriceWords price={change.from} kind={change.kind} saved={saved} />
        {standing}
      </span>
    </li>
  );
}

/**
 * The column, for a deal with a fee. `law`: the reading's law rows, which a fee with a cap draws its block from; `saved`: the deal's product
 * saves, so a share of what is held reads "what has built up". The figures the person typed read as plain words here: the builder's boxes
 * beside it carry their blue.
 */
export function GlanceColumn({ glance, law, saved, names }: { glance: Glance; law: readonly LawRow[]; saved: boolean; names: (feeId: string) => string }) {
  const rows: LawRows = new Map(law.map((r) => [r.fee, r]));
  // a fee that is free now is said by its date's change; a group of such fees alone stays where its fees that hold throughout add to a rate today
  const changing = glance.changing.map((g) => ({ ...g, fees: g.fees.filter((f) => f.price.form !== "free") })).filter((g) => g.fees.length > 0 || g.rates.some((r) => r.fees.length > 1));
  return (
    <Section title={copy.glance.title} level="kick" heading="h2">
      <TypedPlain className="flex flex-col gap-4">
          {glance.throughout.length > 0 && (
            <Section title={copy.glance.throughout} level="card" heading="h3" gap="snug">
              {glance.throughout.map((g) => (
                <Group key={groupKey(g.on)} group={g} rows={rows} saved={saved} />
              ))}
            </Section>
          )}
          <Section title={copy.glance.changes} level="card" heading="h3" gap="snug" className="border-t border-border pt-4">
            {glance.dates.length === 0 && <p className="text-sm text-muted-foreground">{copy.glance.still}</p>}
            {changing.map((g) => (
              <Group key={groupKey(g.on)} group={g} rows={rows} saved={saved} lead={copy.standing.now} />
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
                    <ChangeLine key={`${c.fee}-${c.side}-${k}`} change={c} row={rows.get(c.fee)} saved={saved} />
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
      </TypedPlain>
      <TextLink to={`#${READING_ID}`} className="inline-flex items-center gap-1 self-start text-sm">
        {copy.glance.toReading}
        <IconArrowDown size={14} aria-hidden="true" />
      </TextLink>
    </Section>
  );
}
