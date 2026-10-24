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

/** A switch inside the provident family (`keren-hishtalmut` or `kupat-gemel-lehashkaa`), or a transfer between pension funds. */
export interface ProvidentSide {
  kind: "provident";
  wrapper: "kupat-gemel-lehashkaa" | "keren-hishtalmut" | "pension-comprehensive" | "pension-general" | "provident-for-annuity";
  /**
   * `track-switch` (default): the member changes track inside one fund (TXK-04, TXH-19, PF-23 ...). `fund-transfer`: the
   * member moves money between two funds of the same kind (SW-39, SW-40); the carry-over of payment dates is
   * stated, but that the member's own transfer is not a tax event is a reading (SW-40: no official text says so).
   */
  move?: "track-switch" | "fund-transfer";
  /** Rule IDs from the wrapper records that say the switch costs nothing (TXK-04, TXH-17, TXH-19, PF-19, PF-23). */
  ruleIds: readonly string[];
  /** Share of the balance moved, 0 to 1; default 1. A hishtalmut moves whole only (PF-18, KH-17). */
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
  /** Zero: a switch inside the family is not a withdrawal and not taxed. */
  cost: ValueObject;
  ruleIds: string[];
  outcome: Outcome;
  /** `fund-transfer` when two funds of the same kind are involved (additive, 2026-10-24). */
  move: "track-switch" | "fund-transfer";
  /** The labels the rules read carry; a fund transfer's tax neutrality is a reading, `secondary-source` on SW-40. */
  labels: Label[];
}

/** The method cannot cost this switch: it is not allowed, or the rules or the run are not there. */
export interface SwitchRefused {
  formula: "F-66";
  kind: "not-allowed" | "not-evaluated";
  /** `hishtalmut-whole-only` (PF-18, KH-17), `different-kind` (no rule says a transfer between kinds is free), `rule-open`, `rule-missing`. */
  code: "hishtalmut-whole-only" | "different-kind" | "rule-open" | "rule-missing";
  ruleIds: string[];
}

export type SwitchingCost = BrokerageSwitch | ProvidentSwitch | SwitchRefused;

/**
 * F-66 Switching cost. Brokerage: A's run is cut at month `s` and sold there, tax per F-40 on A's lots (TXS-21), the
 * net proceeds open B's lot, and B runs to the horizon `T` of A's goal. Contributions after `s` go to B. Cost of
 * switching `= V_T^real(no switch) − V_T^real(switch)`. Provident: a track switch or a transfer to the same kind of
 * fund costs nothing (TXK-04, TXH-17, TXH-19, PF-19, PF-23, rule IDs from the wrapper records); a hishtalmut moves
 * whole, never in part (PF-18, KH-17), so a share below 1 is "not allowed"; a transfer to a different kind is
 * "not evaluated" because no rule says it is free.
 */
export function switchingCost(from: SwitchFrom, to: SwitchTo, atMonth: number, ctx: RunContext): SwitchingCost {
  if (from.kind === "provident" || to.kind === "provident") return providentSwitch(from, to, ctx);
  return brokerageSwitch(from.input, to, atMonth, ctx);
}

function providentSwitch(from: SwitchFrom, to: SwitchTo, ctx: RunContext): SwitchingCost {
  if (from.kind !== "provident" || to.kind !== "provident") throw new RecordInputError("F-66: a switch is between two brokerage funds or two provident tracks, not one of each");
  const move = from.move ?? to.move ?? "track-switch";
  // A transfer between two funds of the same kind rests on SW-39 (payment dates carry over) and SW-40 (the same for
  // annuity funds, and the reading that a member's own transfer is not a tax event); a track switch keeps the ids
  // the wrapper record gives (TXK-04, TXH-19, PF-23, ...).
  const transferIds = move === "fund-transfer" ? ["SW-39", "SW-40"] : [];
  const ids = [...new Set([...from.ruleIds, ...to.ruleIds, ...transferIds])];
  if (ids.length === 0) throw new RecordInputError("F-66: a provident switch needs the rule IDs from the wrapper records (TXK-04, PF-23, ...)");
  if (from.wrapper !== to.wrapper) return { formula: "F-66", kind: "not-evaluated", code: "different-kind", ruleIds: ids };
  const book = ruleBook(ctx);
  const share = from.share ?? to.share ?? 1;
  if (!(share > 0 && share <= 1)) throw new RangeError(`share ${share} must be above 0 and at most 1`);
  const wholeOnly = [...new Set([...(from.wholeOnlyRuleIds ?? []), ...(to.wholeOnlyRuleIds ?? [])])];
  try {
    if (from.wrapper === "keren-hishtalmut") {
      if (wholeOnly.length === 0) throw new RecordInputError("F-66: a hishtalmut switch needs the whole-only rule IDs (PF-18, KH-17) from its wrapper record");
      wholeOnly.forEach((id) => book.cite(id));
      if (share < 1) return { formula: "F-66", kind: "not-allowed", code: "hishtalmut-whole-only", ruleIds: wholeOnly };
    }
    ids.forEach((id) => book.cite(id));
    // SW-40: no official text says a member's own transfer between funds is not a tax event; the neutrality is a reading.
    if (move === "fund-transfer") book.label("secondary-source", "SW-40");
  } catch (e) {
    if (e instanceof BlockedError) return { formula: "F-66", kind: "not-evaluated", code: "rule-open", ruleIds: [e.ruleId] };
    if (e instanceof MissingRuleError) return { formula: "F-66", kind: "not-evaluated", code: "rule-missing", ruleIds: [e.ruleId] };
    throw e;
  }
  const used = book.used();
  const cost = computedValue(0, "nis", "F-66", { wrapper: from.wrapper, share, move, rule_ids: ids }, {
    checked: ctx.runDate,
    strength: weakestStrength([...used.map((r) => r.strength), ...(move === "fund-transfer" ? (["secondary"] as const) : [])]),
    ruleIds: used.map((r) => r.id),
    notes:
      move === "fund-transfer"
        ? "payment dates carry over on a transfer between two funds of the same kind (SW-39, SW-40); that the member's own transfer is not taxed is a reading (SW-40); no fee is set by these rules"
        : "a switch inside the provident family is not a withdrawal and is not taxed; no fee is set by these rules",
  });
  return { formula: "F-66", kind: "provident", wrapper: from.wrapper, cost, ruleIds: ids, outcome: { code: "eligible" }, move, labels: book.labels() };
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
