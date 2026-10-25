// D29 visuals: every figure equals an engine run, and the timeline fixes of the 2026-10-25 sweep hold.
import { describe, expect, it } from "vitest";
import { bondPrice, makamPrice } from "@finance-tool/engine";
import { buildGuidePage } from "./guide.server";
import { runTimeline } from "./engine";
import { bondModel, breakKindOf, bestWithin, currentAccountModel, depositModel, fact, fixedDateModel, ladderRows, makamModel, planModel, runAtMonths, addMonthsIso } from "./guide-signature";

const page = (id: string) => buildGuidePage(id)!;
const cashRate = (id: string) => ((page(id).bundle!.p05 as unknown as { inputs: { cash_rate: { value: number } } }).inputs.cash_rate.value);

describe("timeline fixes on the cash-like pages", () => {
  it("runs the deposit family on the record's published rate, not on P-05's 3.5", () => {
    expect(cashRate("bank-deposit")).toBe(1.8);
    expect(cashRate("savings-plan")).toBe(1.5);
    expect(cashRate("current-account")).toBe(1);
    expect(cashRate("makam")).toBe(3.5);
  });
  it("applies the current account's ceiling, and an entered rate applies to the whole balance", () => {
    const b = page("current-account").bundle!;
    expect(b.terms.deposit?.balanceCeiling).toBe(10000);
    const withCeiling = runTimeline(b, { entered: {}, age: null });
    const { balanceCeiling: _c, ...deposit } = b.terms.deposit!;
    const whole = runTimeline({ ...b, terms: { ...b.terms, deposit } }, { entered: {}, age: null });
    if (withCeiling.kind !== "ok" || whole.kind !== "ok") throw new Error("run failed");
    expect(withCeiling.years.at(-1)!.real).toBeCloseTo(63375.2, 0);
    expect(whole.years.at(-1)!.real).toBeGreaterThan(withCeiling.years.at(-1)!.real);
  });
  it("counts what was paid in at each deposit's own price level (F-06), so idle cash shows its loss", () => {
    const b = page("current-account").bundle!;
    const t = runTimeline(b, { entered: {}, age: null });
    if (t.kind !== "ok") throw new Error("run failed");
    const end = t.years.at(-1)!;
    // P-05: 10,000 now, then 500 a month in today's money (A-04 constant real, F-05) for 120 months: 70,000 in today's money
    expect(end.paidInReal).toBeCloseTo(70000, 0);
    expect(end.paidInReal).toBeGreaterThan(end.real);
    expect(end.paidIn / end.index).toBeLessThan(end.real); // the old line, which drew a gain
  });
  it("ignores A-01 on a cash page", () => {
    const b = page("makam").bundle!;
    const a = runTimeline(b, { entered: {}, age: null });
    const c = runTimeline(b, { entered: { "A-01": 12 }, age: null });
    if (a.kind !== "ok" || c.kind !== "ok") throw new Error("run failed");
    expect(c.years.at(-1)!.nominal).toBe(a.years.at(-1)!.nominal);
  });
  it("keeps the brokerage account without a visual", () => {
    expect(page("brokerage-account").signature).toBeNull();
  });
});

describe("current account", () => {
  const d = page("current-account").signature!;
  it("equals the engine runs of the account and the daily fund", () => {
    const m = currentAccountModel(d, { balance: 10000, years: 10, conditionsMet: true })!;
    const a = runTimeline(d.bundles["current-account"]!, { entered: { amount_now: 10000, monthly_deposit: 0, horizon_years: 10 }, age: null });
    const f = runTimeline(d.bundles["money-market-fund-daily"]!, { entered: { amount_now: 10000, monthly_deposit: 0, horizon_years: 10 }, age: null });
    if (a.kind !== "ok" || f.kind !== "ok") throw new Error("run failed");
    expect(m.end.account).toBe(a.years.at(-1)!.real);
    expect(m.end.fund).toBe(f.years.at(-1)!.real);
    expect(m.end.cost).toBeCloseTo(m.end.fund - m.end.account, 9);
  });
  it("pays nothing without the conditions, and the cost grows", () => {
    const yes = currentAccountModel(d, { balance: 10000, years: 10, conditionsMet: true })!;
    const no = currentAccountModel(d, { balance: 10000, years: 10, conditionsMet: false })!;
    expect(no.end.account).toBeLessThan(yes.end.account);
    expect(no.end.account).toBeLessThan(10000);
  });
  it("carries the record's rate, ceiling and the card figure", () => {
    expect(fact(d, "rate")!.value).toBe(1);
    expect(fact(d, "ceiling")!.value).toBe(10000);
    expect(fact(d, "cardMonthly")!.value).toBe(7000);
  });
});

describe("bank deposit", () => {
  const d = page("bank-deposit").signature!;
  it("takes the term and break from the record and equals the engine", () => {
    expect(breakKindOf(fact(d, "break"))).toBe("not-allowed");
    const m = depositModel(d, { amount: 10000 })!;
    expect(m.term).toBe(12);
    expect(m.atTerm).toBe(runAtMonths(d.bundles["bank-deposit"]!, { amount_now: 10000, monthly_deposit: 0 }, 12)!.nominal);
    expect(m.fundAt(6)).toBe(runAtMonths(d.bundles["money-market-fund-daily"]!, { amount_now: 10000, monthly_deposit: 0 }, 6)!.nominal);
    expect(m.gap).toBeCloseTo(m.fundAtTerm - m.atTerm, 9);
  });
});

describe("savings plan", () => {
  const d = page("savings-plan").signature!;
  it("unlocks each deposit after the term and counts free and locked on a date", () => {
    const m = planModel(d, { monthly: 500, deposits: 12 })!;
    expect(m.term).toBe(36);
    expect(m.lastUnlock).toBe(47);
    expect(m.perDeposit).toBe(runAtMonths(d.bundles["savings-plan"]!, { amount_now: 500, monthly_deposit: 0 }, 36)!.nominal);
    const at = m.at(40);
    expect(at.free).toBe(5);
    expect(at.locked).toBe(7);
    expect(at.freeValue).toBeCloseTo(5 * m.perDeposit, 9);
    expect(at.lockedPrincipal).toBe(3500);
    expect(d.gaps).toContain("planLockPerDeposit");
  });
});

describe("the ladder", () => {
  const d = page("money-market-fund-daily").signature!;
  it("reads each row's rate from its record or the site's assumption, ordered by speed", () => {
    const rows = ladderRows(d);
    expect(rows.map((r) => [r.id, r.rate.value, r.kind])).toEqual([
      ["current-account", 1, "published"],
      ["money-market-fund-daily", 3.5, "assumption"],
      ["money-market-fund-renewable", 3.5, "assumption"],
      ["bank-deposit", 1.8, "published"],
    ]);
    expect(bestWithin(rows, "any-time")!.id).toBe("current-account");
    expect(bestWithin(rows, "at-maturity")!.rate.value).toBe(3.5);
  });
});

describe("renewable fund", () => {
  const d = page("money-market-fund-renewable").signature!;
  it("knows the series date from the fund record and bounds the next one by MF-08", () => {
    expect(fact(d, "seriesDate")!.value).toBe("2026-11-16");
    const m = fixedDateModel(d, { today: "2026-10-25", needOn: "2026-11-01" });
    expect(m.waitDays).toBe(15);
    expect(m.latestAfter).toBe("2027-11-16");
    expect(fixedDateModel(d, { today: "2026-10-25", needOn: "2026-12-01" }).waitDays).toBeNull();
    expect(addMonthsIso("2026-01-31", 1)).toBe("2026-02-28");
    expect(d.gaps).toContain("renewableDates");
  });
});

describe("makam", () => {
  const d = page("makam").signature!;
  it("prices by F-24 and takes gain, tax and net from the ledger run", () => {
    const m = makamModel(d, { amount: 10000, month: 6 })!;
    expect(m.price).toBe(makamPrice(0.035, (365 * 6) / 12));
    const run = runAtMonths(d.bundles["makam"]!, { amount_now: 10000, monthly_deposit: 0 }, 6)!;
    expect(m.net).toBe(run.nominal);
    expect(m.tax).toBe(run.taxAtExit + run.taxDuring);
    expect(m.atRedemption).toBe(false);
    expect(makamModel(d, { amount: 10000, month: 12 })!.price).toBe(100);
    expect(makamModel(d, { amount: 10000, month: 12 })!.atRedemption).toBe(true);
  });
});

describe("government bond", () => {
  const d = page("government-bond").signature!;
  it("prices by present value and equals par when rates do not move", () => {
    expect(bondModel(d, { amount: 10000, years: 10, shiftPct: 0 })!.price).toBeCloseTo(100, 9);
    const m = bondModel(d, { amount: 10000, years: 10, shiftPct: 1 })!;
    let pv = 0;
    for (let k = 1; k <= 10; k++) pv += 3.5 / Math.pow(1.045, k);
    pv += 100 / Math.pow(1.045, 10);
    expect(m.price).toBeCloseTo(pv, 9);
    expect(m.price).toBe(bondPrice(0.035, 0.045, 10, 1));
    expect(m.changePct).toBeLessThan(0);
    expect(Math.abs(m.makamChangePct)).toBeLessThan(Math.abs(m.changePct));
    expect(bondModel(d, { amount: 10000, years: 10, shiftPct: -1 })!.price).toBeGreaterThan(100);
  });
});
