// The fee lines a plan charges, and the same plan with one of them removed: the re-run without one line that the provider
// workbench (F-63) prices each line's cost from, all other assumptions held fixed.
import { RecordInputError, type RunPlan } from "../inputs.ts";
import { conversionCharges, feeCharged, withFee, type Commission, type Custody } from "../formulas/fees.ts";
import type { FeeType } from "../result.ts";
import { assertNever } from "@finance-tool/schema";

/** The fee lines of a run, as the result reports them (`FeeType`). */
export type FeeLine = FeeType;

/** Every line, in the order the result lists them. */
export const feeLineOrder: readonly FeeLine[] = ["deposit", "balance", "direct", "trade", "spread", "custody", "fixed", "account", "fund", "fx", "manager"];

const positive = (n: number | undefined) => (n ?? 0) > 0;
const configured = (c: Commission | Custody | undefined) => c !== undefined && (positive(c.rate) || positive(c.min) || ("perCurrencyUnit" in c && positive(c.perCurrencyUnit)) || ("flatUpTo" in c && positive(c.flatUpTo?.amount)));

/** The fee lines this plan charges: those whose input is set and not zero. Deposits (bank) have none. */
export function feeLines(plan: RunPlan): FeeLine[] {
  const has = new Set<FeeLine>();
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      const f = plan.input.fees;
      // A-19: a line at 0% whose discount reverts to a positive rate is charged after the discount
      if (feeCharged(f, "deposit")) has.add("deposit");
      if (feeCharged(f, "balance")) has.add("balance");
      if (positive(f.direct)) has.add("direct");
      break;
    }
    case "runSecurities": {
      const { tariff, fund, wrapper } = plan.input;
      // F-101: a price for a time is a sequence of tariffs; a line any of them charges counts
      const chain = [];
      for (let t: typeof tariff | undefined = tariff; t; t = t.until?.then) chain.push(t);
      for (const t of chain) {
        if (configured(t.buy) || configured(t.sell)) has.add("trade");
        if (configured(t.custody)) has.add("custody");
        if (conversionCharges(t.fx) || conversionCharges(t.fxSpread) || conversionCharges(t.fxSale?.fx) || conversionCharges(t.fxSale?.fxSpread)) has.add("fx");
        if (positive(t.monthlyFee)) has.add("fixed");
      }
      // F-102 is read from each stretch (F-101: a group exempt for a time); F-103 from the first tariff only, and the custodian's charge per
      // dividend counts with custody where a dividend is paid
      if (chain.some((t) => positive(t.currentAccount))) has.add("account");
      if (positive(tariff.perDividend?.amount) && fund.distribution) has.add("custody");
      if (positive(fund.halfSpread)) has.add("spread");
      const d = fund.drag;
      if (positive(d?.management) || positive(d?.variable) || positive(d?.trustee)) has.add("fund");
      if (positive(wrapper?.managerFee)) has.add("manager");
      break;
    }
    case "runMakam":
    case "runBond": {
      const t = plan.input.tariff as { buy?: Commission; sell?: Commission; custody?: Custody };
      if (configured(t.buy) || configured(t.sell)) has.add("trade");
      if (configured(t.custody)) has.add("custody");
      break;
    }
    case "runDeposit":
      break;
    default:
      assertNever(plan);
  }
  return feeLineOrder.filter((l) => has.has(l));
}

function noLine(plan: RunPlan, line: FeeLine): never {
  throw new RecordInputError(`${plan.run} has no "${line}" fee line to remove`);
}

/**
 * The same plan with one fee line zeroed (V(F \ {f})). Everything else, including non-fee drag and tax, stays. A discounted line (A-19)
 * is one line over both of its periods: removing it removes the rate it reverts to as well.
 */
export function withoutFeeLine(plan: RunPlan, line: FeeLine): RunPlan {
  switch (plan.run) {
    case "runProvident":
    case "runPension": {
      if (line !== "deposit" && line !== "balance" && line !== "direct") return noLine(plan, line);
      // A-19: the line's own discount goes with it, so "without this fee" charges nothing in any month
      const fees = withFee(plan.input.fees, line, 0);
      return plan.run === "runProvident"
        ? { run: "runProvident", input: { ...plan.input, fees } }
        : { run: "runPension", input: { ...plan.input, fees } };
    }
    case "runSecurities": {
      // F-101: a tariff line is removed from every tariff of a price for a time; a tariff without the line stays as it is
      const { until, ...head } = plan.input.tariff;
      if (until && (line === "trade" || line === "custody" || line === "fx" || line === "fixed" || line === "account")) {
        const part = (tariff: typeof head): typeof head | null => {
          try {
            const changed = withoutFeeLine({ run: "runSecurities", input: { ...plan.input, tariff } }, line);
            return changed.run === "runSecurities" ? changed.input.tariff : null;
          } catch (e) {
            if (e instanceof RecordInputError) return null;
            throw e;
          }
        };
        const first = part(head);
        const second = part({ ...until.then, ...(head.currency ? { currency: head.currency } : {}) });
        if (!first && !second) return noLine(plan, line);
        const { currency: _, ...then } = second ?? until.then;
        return { run: "runSecurities", input: { ...plan.input, tariff: { ...(first ?? head), until: { months: until.months, then } } } };
      }
      const input = plan.input;
      const tariff = { ...input.tariff };
      switch (line) {
        case "trade":
          if (!input.tariff.buy && !input.tariff.sell) return noLine(plan, line);
          // F-12: a standing-order price goes with the trade line
          delete tariff.buy;
          delete tariff.sell;
          delete tariff.buyStanding;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "custody":
          if (!tariff.custody && !tariff.perDividend) return noLine(plan, line);
          // F-103: the custodian's charge per dividend is part of custody, and goes with it
          delete tariff.custody;
          delete tariff.perDividend;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "fx":
          if (tariff.fx === undefined) return noLine(plan, line);
          // F-13 (D65): the spread, a recurring plan's conversion and a sale's own are part of the conversion line
          delete tariff.fxSpread;
          delete tariff.fx;
          delete tariff.fxStanding;
          delete tariff.fxSale;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "fixed":
          if (tariff.monthlyFee === undefined) return noLine(plan, line);
          delete tariff.monthlyFee;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "account":
          // a sequence (F-101) is changed stretch by stretch above
          if (tariff.currentAccount === undefined) return noLine(plan, line);
          delete tariff.currentAccount;
          return { run: "runSecurities", input: { ...input, tariff } };
        case "spread": {
          if (input.fund.halfSpread === undefined) return noLine(plan, line);
          const fund = { ...input.fund };
          delete fund.halfSpread;
          return { run: "runSecurities", input: { ...input, fund } };
        }
        case "fund": {
          const d = input.fund.drag;
          if (!d || (d.management === undefined && d.variable === undefined && d.trustee === undefined)) return noLine(plan, line);
          const drag = { ...d };
          delete drag.management;
          delete drag.variable;
          delete drag.trustee;
          return { run: "runSecurities", input: { ...input, fund: { ...input.fund, drag } } };
        }
        case "manager":
          if (!input.wrapper) return noLine(plan, line);
          return { run: "runSecurities", input: { ...input, wrapper: { ...input.wrapper, managerFee: 0 } } };
        case "balance":
        case "deposit":
        case "direct":
          return noLine(plan, line);
        default:
          return assertNever(line);
      }
    }
    case "runMakam":
    case "runBond": {
      if (line !== "trade" && line !== "custody") return noLine(plan, line);
      const tariff = { ...(plan.input.tariff as { buy?: Commission; sell?: Commission; redeem?: Commission; custody?: Custody }) };
      if (line === "trade") {
        if (!tariff.buy && !tariff.sell) return noLine(plan, line);
        delete tariff.buy;
        delete tariff.sell;
        delete tariff.redeem;
      } else {
        if (!tariff.custody) return noLine(plan, line);
        delete tariff.custody;
      }
      return plan.run === "runMakam"
        ? { run: "runMakam", input: { ...plan.input, tariff } }
        : { run: "runBond", input: { ...plan.input, tariff } };
    }
    case "runDeposit":
      return noLine(plan, line);
    default:
      return assertNever(plan);
  }
}
