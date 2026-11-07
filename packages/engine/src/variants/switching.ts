// F-66 Switching cost: moving from fund A to fund B at month s. Brokerage: a sale (TXS-21) with tax per F-40 on
// A's lots, the net proceeds open B's lot. Provident: a track switch or a same-kind transfer costs nothing; a
// hishtalmut moves whole. Built on F-08 (`runSecurities`) run in two legs; no I/O.
import type { ValueObject } from "@finance-tool/schema";
import { computedValue, weakestStrength } from "../fees/computed.ts";
import { cpiPath, taxYearOf } from "../formulas/time.ts";
import { runSecurities, type Fund, type SecuritiesInput } from "../ledgers/securities.ts";
import { BlockedError, MissingRuleError, RecordInputError, ruleBook } from "../resolver.ts";
import type { Flag, Label, Outcome, RunContext, RunResult } from "../result.ts";

/** Fund A: the whole brokerage run it sits in (goal, market, tariff, profile) up to the horizon. */
export interface BrokerageFrom {
  kind: "brokerage";
  input: SecuritiesInput;
}

/** Fund B: its fund and, where they differ from A's, its market and the account's tariff and broker. */
export interface BrokerageTo {
  kind: "brokerage";
  fund: Fund;
  market?: SecuritiesInput["market"];
  tariff?: SecuritiesInput["tariff"];
  broker?: SecuritiesInput["broker"];
}

/** One side of a track switch or a transfer in the provident family: a study fund, a kupat gemel lehashkaa, a pension fund or a provident fund for annuity. */
export interface ProvidentSide {
  kind: "provident";
  wrapper: "kupat-gemel-lehashkaa" | "keren-hishtalmut" | "pension-comprehensive" | "pension-general" | "provident-for-annuity";
  /**
   * `track-switch` (default): the member changes track inside one fund (TXK-04, TXH-17, TXP-32, PF-23 ...). `fund-transfer`:
   * the member moves money between two funds of the same kind. Study funds: payment dates carry over for tax law (SW-39,
   * TXH-19); that the move is not a tax event is a reading (TXH open question 11). Kupat gemel lehashkaa: not a withdrawal, so
   * not taxed (TXK-04, a reading); whether payment dates carry over is open (SW open question 17). Annuity funds: payment
   * dates carry over (SW-40, reg. 2(ב); a provident fund for annuity moves by the same process, SW-23) and the member's transfer
   * is not taxed (TXP-32, a reading); severance money moved to a new account in a provident fund for annuity (TXP-32) is not
   * modelled.
   */
  move?: "track-switch" | "fund-transfer";
  /** Rule IDs from the wrapper records that say the switch costs nothing (TXK-04, TXH-17, TXH-19, TXP-32, PF-19, PF-23). */
  ruleIds: readonly string[];
  /** Share of the balance moved, 0 to 1; default 1. A hishtalmut moves to another fund whole only (PF-18, KH-17); a track switch may move part (KH-18, PF-23). */
  share?: number;
  /** Rule IDs for the whole-only rule of a hishtalmut, from its wrapper record (PF-18, KH-17). */
  wholeOnlyRuleIds?: readonly string[];
}

export type SwitchFrom = BrokerageFrom | ProvidentSide;
export type SwitchTo = BrokerageTo | ProvidentSide;

export interface BrokerageSwitch {
  formula: "F-66";
  kind: "brokerage";
  atMonth: number;
  /** `V_T^real(no switch) − V_T^real(switch)`, real NIS. */
  cost: ValueObject;
  realNoSwitch: number;
  realWithSwitch: number;
  /** F-40 tax on A's lots at month s (the run's exit tax, surtax included), nominal NIS. */
  taxAtSwitch: number;
  /** What opens B's lot: A's value at s after the sale's commission, spread and tax, nominal NIS. */
  netProceeds: number;
  runs: { noSwitch: RunResult; legA: RunResult; legB: RunResult };
  /** A real loss realised by the sale at `s` (G-07) and what became of it in leg B (2026-10-24); absent when A's sale had a gain. */
  loss?: {
    /** The real loss at month s, nominal NIS, as a positive number. */
    amount: number;
    /** Whether leg B carried it against its gain at exit; false with the reason when the rules do not let it. */
    applied: boolean;
    reason?: "taxable-fund" | "different-domain" | "not-a-capital-loss";
    /** The part of the loss that offset B's real gain at exit, and the part still unused at the horizon. */
    offset: number;
    unused: number;
    /** Rule ids the offset rests on (TXS-17, TXS-19 in the same tax year; TXS-18 carried to a later one). */
    ruleIds: string[];
  };
  flags: Flag[];
  labels: Label[];
  /** `listed-not-ranked` when A's sale is computed under a secondary reading (G-18); the cost is shown, not ranked. */
  outcome: Outcome;
}

export interface ProvidentSwitch {
  formula: "F-66";
  kind: "provident";
  wrapper: ProvidentSide["wrapper"];
  /** Zero: a switch inside the family is not a withdrawal and not taxed (a reading, `labels`); no fee is set by the rules, though a fee discount may end (`flags`). */
  cost: ValueObject;
  ruleIds: string[];
  outcome: Outcome;
  /** `fund-transfer` when two funds of the same kind are involved (additive, 2026-10-24). */
  move: "track-switch" | "fund-transfer";
  /** The labels the rules read carry; the tax neutrality of every provident switch or transfer is the site's reading: `reading` on TXK-04, TXP-32, or for a study fund TXH-17 (track switch) and TXH-19 (transfer). */
  labels: Label[];
  /**
   * What the page must show beside the 0: `PF-14` on every move (a track switch or a transfer, whole or part, lets the manager
   * end a fee discount early: PF-14 case 2, SW-15, PF-23, KGL-16); `SW-OQ17` on a transfer between two kupot gemel lehashkaa
   * (whether payment dates carry over is open: no tax at the move, the later exit tax unknown, so the outcome is listed, not
   * ranked); `SW-40` on a transfer into a comprehensive pension fund (reg. 2(ד)(1) caps what it may receive; not modelled);
   * `TXP-32` on a transfer between provident funds for annuity (severance money moved to a new account is taxed first; not modelled).
   */
  flags: Flag[];
}

/** The method cannot cost this switch: it is not allowed, or the rules or the run are not there. */
export interface SwitchRefused {
  formula: "F-66";
  kind: "not-allowed" | "not-evaluated";
  /** `hishtalmut-whole-only` (PF-18, KH-17), `different-kind` (not modelled: see `providentSwitch`), `rule-open`, `rule-missing`. */
  code: "hishtalmut-whole-only" | "different-kind" | "rule-open" | "rule-missing";
  ruleIds: string[];
}

export type SwitchingCost = BrokerageSwitch | ProvidentSwitch | SwitchRefused;

/**
 * F-66 Switching cost. Brokerage: A's run is cut at month `s` and sold there, tax per F-40 on A's lots (TXS-21), the
 * net proceeds open B's lot, and B runs to the horizon `T` of A's goal. Contributions after `s` go to B. Cost of
 * switching `= V_T^real(no switch) − V_T^real(switch)`. Provident: a track switch or a transfer to the same kind of
 * fund is costed 0, its tax neutrality a reading (TXK-04, TXH-17, TXH-19, TXP-32, PF-19, PF-23, rule IDs from the wrapper
 * records); a transfer between two kupot gemel lehashkaa is listed, not ranked, while SW open question 17 is open; a hishtalmut
 * moves to another fund whole, never in part (PF-18, KH-17), so a transfer of a share below 1 is "not allowed", while a
 * track switch may move part (KH-18, PF-23); a transfer to a different kind is "not evaluated" (between annuity kinds TXP-32
 * says it is not taxed, but the conditions are not modelled: which money may move between the kinds, the severance
 * exception, TXP-32, and reg. 2(ד)(1)'s cap on what a comprehensive fund may receive, SW-40). That cap binds a transfer
 * between two comprehensive funds too, which is costed 0 with the `SW-40` flag naming the cap, not modelled.
 */
export function switchingCost(from: SwitchFrom, to: SwitchTo, atMonth: number, ctx: RunContext): SwitchingCost {
  if (from.kind === "provident" || to.kind === "provident") return providentSwitch(from, to, ctx);
  return brokerageSwitch(from.input, to, atMonth, ctx);
}

function providentSwitch(from: SwitchFrom, to: SwitchTo, ctx: RunContext): SwitchingCost {
  if (from.kind !== "provident" || to.kind !== "provident") throw new RecordInputError("F-66: a switch is between two brokerage funds or two provident tracks, not one of each");
  const move = from.move ?? to.move ?? "track-switch";
  // A transfer between two funds of the same kind: a track switch keeps the ids the wrapper record gives (TXK-04, TXH-17,
  // TXP-32, PF-23, ...); a fund transfer adds the rules of its pair (`transferRules`).
  const transferIds = move === "fund-transfer" && from.wrapper === to.wrapper ? transferRules(from.wrapper) : [];
  // The rule that holds the reading of the tax neutrality, for a track switch and a transfer alike (finance review, 2026-11-07)
  const taxRule = from.wrapper === to.wrapper ? readingRule(from.wrapper, move) : undefined;
  // Between two annuity kinds the refusal names the rules its reasons rest on: TXP-32 (not taxed, but the severance exception),
  // SW-40 (reg. 2(ד)(1)'s cap into a comprehensive fund) and SW-22 (reg. 4(8): no move into a comprehensive fund while active elsewhere).
  const acrossAnnuity = from.wrapper !== to.wrapper && ANNUITY.includes(from.wrapper) && ANNUITY.includes(to.wrapper) ? ["TXP-32", "SW-40", ...(to.wrapper === "pension-comprehensive" ? ["SW-22"] : [])] : [];
  const ids = [...new Set([...from.ruleIds, ...to.ruleIds, ...transferIds, ...(taxRule ? [taxRule] : []), ...acrossAnnuity])];
  if (ids.length === 0) throw new RecordInputError("F-66: a provident switch needs the rule IDs from the wrapper records (TXK-04, PF-23, ...)");
  if (from.wrapper !== to.wrapper) return { formula: "F-66", kind: "not-evaluated", code: "different-kind", ruleIds: ids };
  const book = ruleBook(ctx);
  const share = from.share ?? to.share ?? 1;
  if (!(share > 0 && share <= 1)) throw new RangeError(`share ${share} must be above 0 and at most 1`);
  const wholeOnly = [...new Set([...(from.wholeOnlyRuleIds ?? []), ...(to.wholeOnlyRuleIds ?? [])])];
  try {
    if (from.wrapper === "keren-hishtalmut" && move === "fund-transfer") {
      if (wholeOnly.length === 0) throw new RecordInputError("F-66: a hishtalmut switch needs the whole-only rule IDs (PF-18, KH-17) from its wrapper record");
      wholeOnly.forEach((id) => book.cite(id));
      if (share < 1) return { formula: "F-66", kind: "not-allowed", code: "hishtalmut-whole-only", ruleIds: wholeOnly };
    }
    ids.forEach((id) => book.cite(id));
    // the fee discount that may end (flag PF-14) and, on a kupat gemel lehashkaa transfer, the exit tax the open dates bear on
    feeRules(from.wrapper).forEach((id) => book.cite(id));
    if (move === "fund-transfer" && from.wrapper === "kupat-gemel-lehashkaa") ["TXK-05", "TXK-07"].forEach((id) => book.cite(id));
    // No official text says in those words that a provident switch or transfer is not a tax event: TXK-04 and TXP-32 hold that
    // reading, and for a study fund TXH-19 (reg. 3(ב)(1) keeps the payment dates, TXH open question 11 is only narrowed) and TXH-17
    // (the Chief Economist's non-binding paper), so each carries the "reading" label, not "secondary-source" (checker and finance
    // reviews, 2026-11-07). Every such rule cited is labelled, whichever the caller passed.
    const readings = new Set([readingRule(from.wrapper, "track-switch"), readingRule(from.wrapper, "fund-transfer")]);
    for (const id of ids) if (readings.has(id)) book.label("reading", id);
  } catch (e) {
    if (e instanceof BlockedError) return { formula: "F-66", kind: "not-evaluated", code: "rule-open", ruleIds: [e.ruleId] };
    if (e instanceof MissingRuleError) return { formula: "F-66", kind: "not-evaluated", code: "rule-missing", ruleIds: [e.ruleId] };
    throw e;
  }
  const used = book.used();
  const cost = computedValue(0, "nis", "F-66", { wrapper: from.wrapper, share, move, rule_ids: ids }, {
    checked: ctx.runDate,
    strength: weakestStrength(used.map((r) => r.strength)),
    ruleIds: used.map((r) => r.id),
    notes: `${move === "fund-transfer" ? transferNote(from.wrapper) : `a switch inside the provident family is not a withdrawal and is not taxed${taxRule ? ` (${taxRule}, a reading)` : ""}`}; ${FEE_NOTE}`,
  });
  const flags: Flag[] = [{ code: "PF-14" }];
  const openDates = move === "fund-transfer" && from.wrapper === "kupat-gemel-lehashkaa";
  if (openDates) flags.push({ code: "SW-OQ17" });
  if (move === "fund-transfer" && from.wrapper === "pension-comprehensive") flags.push({ code: "SW-40" });
  if (move === "fund-transfer" && from.wrapper === "provident-for-annuity") flags.push({ code: "TXP-32" });
  // F-66's cost is V_T(no switch) − V_T(switch), after exit tax: while the payment dates are open the later exit tax may differ
  // (TXK-07's linkage runs from each deposit's date), so the 0 is the tax at the move only, shown and not ranked (finance review, 2026-11-07)
  const outcome: Outcome = openDates ? { code: "listed-not-ranked", reason: "SW-OQ17" } : { code: "eligible" };
  return { formula: "F-66", kind: "provident", wrapper: from.wrapper, cost, ruleIds: ids, outcome, move, labels: book.labels(), flags };
}

const ANNUITY: readonly ProvidentSide["wrapper"][] = ["pension-comprehensive", "pension-general", "provident-for-annuity"];

/**
 * The rules a member's transfer between two funds of the same kind rests on, by kind; PF-17 names every route. Study funds:
 * reg. 3(ב)(1) carries the payment dates over for tax law (SW-39, TXH-19). Kupat gemel lehashkaa: not a withdrawal (TXK-04);
 * SW-39 and SW-40 say the carry-over of the payment dates is not stated for this route (SW open question 17). Annuity funds:
 * reg. 2(ב) carries the payment dates over (SW-40), a provident fund for annuity by the same process (SW-23), and the member's
 * side is TXP-32. An annuity fund is never a source under reg. 3 (PF-17), so reg. 3(ב)(1) (SW-39) is not cited for one.
 */
function transferRules(wrapper: ProvidentSide["wrapper"]): string[] {
  if (wrapper === "keren-hishtalmut") return ["PF-17", "SW-39", "TXH-19"];
  if (wrapper === "kupat-gemel-lehashkaa") return ["PF-17", "TXK-04", "SW-39", "SW-40"];
  if (wrapper === "provident-for-annuity") return ["PF-17", "SW-40", "SW-23", "TXP-32"];
  return ["PF-17", "SW-40", "TXP-32"];
}

/** The rules of the fee discount a move may end early: PF-14 case 2 and SW-15 for every kind, KGL-16 for a kupat gemel lehashkaa's bylaws. */
function feeRules(wrapper: ProvidentSide["wrapper"]): string[] {
  return wrapper === "kupat-gemel-lehashkaa" ? ["PF-14", "SW-15", "KGL-16"] : ["PF-14", "SW-15"];
}

/**
 * The rule whose reading says a switch or a transfer inside this kind is not taxed: TXK-04, TXP-32; for a study fund TXH-17 on a
 * track switch (the Chief Economist's non-binding paper) and TXH-19 on a transfer (reg. 3(ב)(1) keeps the payment dates and
 * says nothing of a tax event; TXH open question 11, narrowed, not closed).
 */
function readingRule(wrapper: ProvidentSide["wrapper"], move: "track-switch" | "fund-transfer"): string {
  if (wrapper === "kupat-gemel-lehashkaa") return "TXK-04";
  if (wrapper === "keren-hishtalmut" && move === "fund-transfer") return "TXH-19";
  if (wrapper === "keren-hishtalmut") return "TXH-17";
  return "TXP-32";
}

/** What every provident move's note says of fees: no transfer fee, but the move may end a discount early. */
const FEE_NOTE = "no fee is set by these rules, but the move, whole or part, lets the manager end a fee discount early (PF-14 case 2, SW-15, PF-23; flagged PF-14); the higher fee is not modelled";

function transferNote(wrapper: ProvidentSide["wrapper"]): string {
  if (wrapper === "keren-hishtalmut") return "payment dates carry over for tax law on a transfer between two study funds (SW-39, TXH-19); that the transfer is not a tax event is a reading (TXH-19, TXH open question 11)";
  if (wrapper === "kupat-gemel-lehashkaa")
    return "a transfer between two kupot gemel lehashkaa is not a withdrawal and is not taxed at the move (TXK-04, a reading; KGL-16 for the bylaws' discount); whether the payment dates carry over on this route is open (SW open question 17: reg. 3(ב)(1) leaves out reg. 3(א)(11א) by its numbering, SW-39, TXK-04), and the dates bear on the tax at a later withdrawal (TXK-05, TXK-07: the linkage is computed from each deposit's date), so the 0 is the tax at the move only: flagged SW-OQ17, listed, not ranked";
  const dates =
    wrapper === "provident-for-annuity"
      ? "payment dates carry over on a transfer between two provident funds for annuity (SW-40, reg. 2(ב); the same process, SW-23; routes PF-17)"
      : "payment dates carry over on a transfer between two annuity funds (SW-40, reg. 2(ב); routes PF-17)";
  const base = `${dates}; the member's transfer is not taxed and keeps its tax history (TXP-32, a reading)`;
  // reg. 2(ד)(1) caps what a comprehensive fund may receive, from any fund (SW-40)
  const cap = wrapper === "pension-comprehensive" ? "; not modelled: a comprehensive fund may not receive more than the monthly deposit ceiling times the months since the first payment to the transferring fund (reg. 2(ד)(1), SW-40), so money above it cannot move there; flagged SW-40" : "";
  // the new account of s.23(א)(2א) is never in a pension fund or a central fund (TXP-32), so the exception reaches only this kind
  const severance = wrapper === "provident-for-annuity" ? "; not modelled: severance money moved to a new account has income tax withheld under s.164 before it moves on its part not exempt under s.9(7א) (TXP-32, s.23(א)(2א)), so that transfer is not free; flagged TXP-32" : "";
  return `${base}${cap}${severance}`;
}

function brokerageSwitch(a: SecuritiesInput, b: BrokerageTo, s: number, ctx: RunContext): SwitchingCost {
  const T = a.goal.months;
  if (!Number.isInteger(s) || s < 1 || s >= T) throw new RangeError(`atMonth ${s} must be a whole month from 1 to ${T - 1} (before the horizon)`);
  if (a.wrapper || a.gridOffset) throw new RecordInputError("F-66: a brokerage switch starts from a plain brokerage account run, not one inside an IRA wrapper or a later leg");

  const noSwitch = runSecurities(a, ctx);
  // Leg A: the same run cut at month s and sold there (F-09 at s, F-40 tax on A's lots).
  const legA = runSecurities({ ...a, goal: { ...a.goal, months: s } }, ctx);
  if (legA.outcome.code === "listed-not-ranked" && !legA.outcome.reason.startsWith("G-")) {
    return { formula: "F-66", kind: "not-evaluated", code: "rule-open", ruleIds: [legA.outcome.reason] };
  }
  // Leg B: the proceeds buy B at month s; later contributions follow, raised by the CPI index of month s so
  // they stay constant in real terms (A-04); CPI and the exchange rate start again at 1 here.
  const I = cpiPath(a.market.inflation, T);
  const bMarket = b.market ?? a.market;
  if (bMarket.inflation !== a.market.inflation) throw new RecordInputError("F-66: fund B's market must use the same inflation A-02 as A's");
  // A real loss at the sale (G-07) is a capital loss that carries into leg B (TXS-17 same year, TXS-18 later years):
  // it offsets B's real gain at exit. A taxable fund's unit loss is not a capital loss (TXS-11), a loss abroad is
  // offset first against foreign gains (TXS-17), so a loss is carried only between two funds of the same domain.
  const lossAtSwitch = Math.max(0, -((legA.detail.realGain) ?? 0));
  const foreign = (f: Fund) => f.kind === "foreign-fund" || f.kind === "tase-foreign-fund";
  let loss: BrokerageSwitch["loss"];
  let carried: SecuritiesInput["carriedLoss"];
  if (lossAtSwitch > 0) {
    const first = a.goal.firstMonth ?? 1;
    const sameYear = taxYearOf(s, first) === taxYearOf(T, first);
    const ruleIds = sameYear ? ["TXS-17", "TXS-19"] : ["TXS-17", "TXS-18"];
    const reason =
      a.fund.kind === "money-market-taxable" || b.fund.kind === "money-market-taxable"
        ? ("taxable-fund" as const)
        : foreign(a.fund) !== foreign(b.fund)
          ? ("different-domain" as const)
          : undefined;
    loss = { amount: lossAtSwitch, applied: reason === undefined, ...(reason ? { reason } : {}), offset: 0, unused: lossAtSwitch, ruleIds: reason ? [] : ruleIds };
    if (!reason) carried = { amount: lossAtSwitch, ruleIds, carriedForward: !sameYear };
  }
  const next: SecuritiesInput = {
    ...a,
    ...(carried ? { carriedLoss: carried } : {}),
    goal: { ...a.goal, amountNow: legA.nominal, monthly: a.goal.contributions === "nominal" ? a.goal.monthly : a.goal.monthly * I[s]!, months: T - s },
    market: bMarket,
    fund: b.fund,
    tariff: b.tariff ?? a.tariff,
    gridOffset: s,
  };
  if (b.broker) next.broker = b.broker;
  else if (a.broker) next.broker = a.broker;
  const legB = runSecurities(next, ctx);
  if (loss && carried) {
    loss.offset = legB.detail.lossOffset ?? 0;
    loss.unused = legB.detail.lossUnused ?? lossAtSwitch;
  }
  const realWithSwitch = legB.nominal / I[T]!;
  const cost = noSwitch.real - realWithSwitch;

  const rules = [...legA.rules, ...legB.rules, ...noSwitch.rules];
  const ruleBookIds = [...new Set(["TXS-21", ...rules.map((r) => r.id)])];
  const book = ruleBook(ctx);
  book.cite("TXS-21");
  const strength = weakestStrength([...rules.map((r) => r.strength), ...book.used().map((r) => r.strength)]);
  const flags = [...legA.flags, ...legB.flags.filter((f) => !legA.flags.some((g) => g.code === f.code))];
  const labels = [...legA.labels, ...legB.labels.filter((l) => !legA.labels.some((m) => m.ruleId === l.ruleId))];
  const outcome: Outcome = legA.outcome.code !== "eligible" ? legA.outcome : legB.outcome;
  return {
    formula: "F-66",
    kind: "brokerage",
    atMonth: s,
    cost: computedValue(cost, "nis", "F-66", { real_value_no_switch: noSwitch.real, real_value_with_switch: realWithSwitch, at_month: s, tax_at_switch: legA.taxAtExit }, {
      checked: ctx.runDate,
      strength,
      ruleIds: ruleBookIds,
      notes: `real NIS at month ${T}: the sale at month ${s} is taxed on A's lots (TXS-21), B opens with the net proceeds`,
    }),
    realNoSwitch: noSwitch.real,
    realWithSwitch,
    taxAtSwitch: legA.taxAtExit,
    netProceeds: legA.nominal,
    runs: { noSwitch, legA, legB },
    ...(loss ? { loss } : {}),
    flags,
    labels,
    outcome,
  };
}
