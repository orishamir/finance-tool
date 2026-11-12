// The column "בונים את העסקה" (method §10.6, `builder`): the deal's kind, what it holds (or, in the provident family, the place for its
// company and track), and its fees, one row each with its figures typed in place, the chosen row marked. Under the rows, one quiet line
// offers the fees the deal could add: the kind's usual ones it lacks first, then the rarer ones and a fee of the person's own.
import { useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder, BuilderRow, StageView } from "../../lib/fee-deal/builder";
import type { DealKind } from "../../lib/fee-deal/kinds";
import type { Fee, FeeDeal } from "../../lib/fee-deal/model";
import { FEE_SHAPES, type FeeKindId, type Held } from "../../lib/fee-deal/shapes";
import { AddLine, Button, Card, ChoiceChips, PickCard, Section, SegmentedControl, Step, Tag, When, monthText, type AddItem } from "../kit";
import { Num } from "../provenance";
import { setHeld, setKind, updateFee } from "./edit";
import { PriceFigure } from "./figures";
import { FeeName, StandingTag, feeName, refName } from "./words";

const b = copy.builder;

/** The words after a price's box in a row: what it is per ("לכל פעולה", "בשנה"), then the month it ends, or "אחר כך" for a later price. */
function rowWords(kind: FeeKindId, s: StageView, later: boolean): string {
  const p = s.price;
  const unit =
    p.form === "action" || p.form === "perAction" ? (copy.price.perAction[kind] ?? copy.price.perAction.default!) : p.form === "held" ? copy.price.per[p.per!]! : p.form === "sum" ? copy.price.per[p.every!]! : "";
  const when = s.until ? `${copy.standing.until}${monthText(s.until)}` : later ? b.then : "";
  return [unit, when].filter(Boolean).join(" ");
}

/** The facts a row says beside its prices: its standing against the cap, its next change, where it is charged, its sale, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  const now = row.standingNow.standing;
  if (row.standingLater) notes.push(<StandingTag key="later" standing={row.standingLater.standing} from={row.standingLater.at} />);
  else if (now.judged && now.standing === "below" && row.standingNow.share)
    notes.push(
      <span key="share">
        <Num value={row.standingNow.share} />
        {copy.standing.shareShort}
      </span>,
    );
  else if (now.judged) notes.push(<StandingTag key="now" standing={row.standingNow} />);
  if (!row.standingLater && row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.saleSame !== null) notes.push(row.saleSame ? b.facts.saleSame : b.facts.saleApart);
  if (row.stages[0]!.price.form === "action" && FEE_SHAPES[fee.kind].fields.action?.includes("min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  const shown = notes.filter((n) => n !== null && n !== false);
  if (shown.length === 0) return null;
  return (
    <ul className="flex flex-col items-start gap-1 text-sm text-muted-foreground sm:items-end">
      {shown.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/** A row's figures: each price from now on in its box, and a single price's bounds beside it. */
function RowFigures({ row, fee, onFee }: { row: BuilderRow; fee: Fee; onFee: (f: Fee) => void }) {
  const name = refName(row);
  // the row shows the prices from the reading's month on: the passed ones are a prefix of the fee's prices
  const offset = fee.stages.length - row.stages.length;
  return (
    <div className="flex flex-wrap items-start gap-2">
      {row.stages.map((s, j) => {
        const k = offset + j;
        const words = rowWords(fee.kind, s, j > 0);
        if (s.price.form === "free")
          return (
            <span key={k} className="inline-flex min-h-target items-center gap-1.5">
              <Tag tone="entered" size="sm">
                {copy.price.free}
              </Tag>
              {words && <span className="text-sm text-muted-foreground">{words}</span>}
            </span>
          );
        const main = s.price.form === "action" || s.price.form === "held" ? "rate" : "amount";
        return <PriceFigure key={k} fee={fee} side="buy" k={k} view={s.price} figure={main} label={b.fieldName(name, copy.panel.howMuch)} words={words} onFee={onFee} />;
      })}
      {row.stages.length === 1 &&
        (["min", "max"] as const).map((m) =>
          row.stages[0]!.price.figures[m] ? <PriceFigure key={m} fee={fee} side="buy" k={offset} view={row.stages[0]!.price} figure={m} label={b.fieldName(name, copy.panel[m])} words={m === "min" ? b.minWord : b.maxWord} onFee={onFee} /> : null,
        )}
    </div>
  );
}

/** One fee's row: the chosen one framed in the action colour with the word, the others whole cards that choose it. */
function FeeRowCard({ chosen, label, onChoose, children }: { chosen: boolean; label: string; onChoose: () => void; children: ReactNode }) {
  if (chosen)
    return (
      <Card pad="snug" edge="accent" as="li">
        {children}
      </Card>
    );
  return (
    <li>
      <PickCard label={label} onPick={onChoose} className="p-4 md:p-5">
        {children}
      </PickCard>
    </li>
  );
}

/** The three facts of what a fund-holding deal holds, chosen one by one; once all three are, the deal says what it holds. */
function HeldChoices({ held, onHeld }: { held: Held | undefined; onHeld: (h: Held) => void }) {
  const [draft, setDraft] = useState<Partial<Held>>(held ?? {});
  const pick = (part: Partial<Held>) => {
    const next = { ...draft, ...part };
    setDraft(next);
    if (next.place && next.currency && next.payout) onHeld(next as Held);
  };
  const opts = <T extends string>(ids: readonly T[], words: Record<string, string>) => ids.map((value) => ({ value, label: words[value]! }));
  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl label={b.place.label} options={opts(["israel", "abroad"] as const, b.place)} value={draft.place ?? null} onChange={(place) => pick({ place })} />
      <SegmentedControl label={b.currency.label} options={opts(["ILS", "USD", "EUR", "GBP"] as const, b.currency)} value={(draft.currency as "ILS" | "USD" | "EUR" | "GBP" | undefined) ?? null} onChange={(currency) => pick({ currency })} />
      <SegmentedControl label={b.payout.label} options={opts(["accumulating", "distributing"] as const, b.payout)} value={draft.payout ?? null} onChange={(payout) => pick({ payout })} />
    </div>
  );
}

export function BuilderColumn({ deal, view, kinds, chosen, hasTracks, onDeal, onChoose, onAdd }: {
  deal: FeeDeal;
  view: Builder;
  kinds: readonly DealKind[];
  chosen: string | null;
  /** The kind is of the provident family, whose deal may name a company and a track. */
  hasTracks: boolean;
  onDeal: (deal: FeeDeal) => void;
  onChoose: (feeId: string) => void;
  onAdd: (kind: FeeKindId) => void;
}) {
  const kind = kinds.find((k) => k.id === deal.kind) ?? null;
  const [picking, setPicking] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const onFee = (f: Fee) => onDeal(updateFee(deal, f.id, () => f));
  const rows = new Map(view.rows.map((r) => [r.fee, r]));
  const adds: AddItem[] = [...view.suggestions.usual.map((k) => ({ id: k, label: feeName(k), usual: true })), ...view.suggestions.rarer.map((k) => ({ id: k, label: feeName(k) }))];
  let n = 1;
  return (
    <Section title={b.title} level="kick" heading="h2">
      <div className="flex flex-col gap-4">
        <Step
          n={n++}
          done={!!kind}
          title={b.kind}
          value={kind?.name}
          action={
            kind && (
              <Button variant="quiet" size="sm" onClick={() => setPicking((x) => !x)} aria-expanded={picking}>
                {picking ? b.close : b.kindChange}
              </Button>
            )
          }
        >
          {(!kind || picking) && (
            <ChoiceChips
              wrap
              bleed=""
              ids={kinds.map((k) => k.id)}
              labels={Object.fromEntries(kinds.map((k) => [k.id, k.name]))}
              value={deal.kind}
              ariaLabel={b.kindsAria}
              onChange={(id: ProductId) => {
                onDeal(setKind(deal, id));
                setPicking(false);
              }}
            />
          )}
        </Step>
        {kind && view.holdsFunds && (
          <Step
            n={n++}
            done={!!view.held}
            title={b.held}
            value={view.held && [b.heldSaid[view.held.place], b.heldSaid[view.held.currency] ?? view.held.currency, b.heldSaid[view.held.payout]].join(" · ")}
            action={
              view.held && (
                <Button variant="quiet" size="sm" onClick={() => setHeldOpen((x) => !x)} aria-expanded={heldOpen}>
                  {heldOpen ? b.close : b.heldChange}
                </Button>
              )
            }
          >
            {(!view.held || heldOpen) && <HeldChoices held={view.held} onHeld={(h) => onDeal(setHeld(deal, h))} />}
          </Step>
        )}
        {kind && !view.holdsFunds && hasTracks && <Step n={n++} title={b.track} value={b.trackNone} />}
        {kind && (
          <Step n={n++} done={deal.fees.length > 0} title={b.fees}>
            {deal.fees.length > 0 && <p className="text-sm text-muted-foreground">{b.feesLead}</p>}
            <ul className="flex flex-col gap-3">
              {deal.fees.map((fee) => {
                const row = rows.get(fee.id);
                const name = feeName(fee.kind, fee.name);
                return (
                  <FeeRowCard key={fee.id} chosen={fee.id === chosen} label={b.open(name)} onChoose={() => onChoose(fee.id)}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="flex flex-wrap items-center gap-2">
                          <FeeName fee={{ fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) }} className="font-semibold" />
                          {fee.id === chosen && <Tag tone="primary">{b.chosen}</Tag>}
                        </span>
                        {row ? <RowFigures row={row} fee={fee} onFee={onFee} /> : <p className="text-sm text-muted-foreground">{b.unread}</p>}
                      </div>
                      {row && <RowNotes row={row} fee={fee} />}
                    </div>
                  </FeeRowCard>
                );
              })}
            </ul>
            <AddLine lead={b.add} items={adds} onAdd={(id) => onAdd(id as FeeKindId)} />
          </Step>
        )}
      </div>
    </Section>
  );
}
