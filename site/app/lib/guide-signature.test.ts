// D29 visuals: every figure equals an engine run, and the timeline fixes of the 2026-10-25 sweep hold.
import { describe, expect, it } from "vitest";
import { bondPrice, makamPrice } from "@finance-tool/engine";
import { buildGuidePage } from "./guide.server";
import { runTimeline } from "./engine";
import { accountAxis, accountFact, bankYearlyMax, bondModel, breakKindOf, bestWithin, bundleAtBank, currentAccountModel, depositModel, fact, fixedDateModel, largestCeiling, ladderRows, makamModel, payingBanks, planModel, runAtMonths, addMonthsIso, silentBanks, topPayer } from "./guide-signature";

const page = (id: string) => buildGuidePage(id)!;
const cashRate = (id: string) => ((page(id).bundle!.p05 as unknown as { inputs: { cash_rate: { value: number } } }).inputs.cash_rate.value);

describe("timeline fixes on the cash-like pages", () => {
  it("runs the deposit family on the record's published rate, not on P-05's 3.5", () => {
    expect(cashRate("bank-deposit")).toBe(1.8);
    expect(cashRate("savings-plan")).toBe(1.5);
    // 2026-10-25: the current account starts from the rate most of the collected banks publish (F-85), 0%, not Leumi's 1%
    expect(cashRate("current-account")).toBe(0);
    expect(cashRate("makam")).toBe(3.5);
  });
  it("starts the current account's timeline from F-85, computed over the banks' printed rates, with no ceiling at a rate of 0", () => {
    const b = page("current-account").bundle!;
    const rate = (b.p05 as unknown as { inputs: { cash_rate: { value: number; state: string; computed_from?: { formula: string; inputs: Record<string, unknown> } } } }).inputs.cash_rate;
    expect(rate.state).toBe("computed");
    expect(rate.computed_from?.formula).toBe("F-85");
    expect(Object.keys(rate.computed_from!.inputs)).toHaveLength(8);
    expect(b.terms.deposit?.balanceCeiling).toBeUndefined();
    expect(b.feeValues.balanceCeiling).toBeUndefined();
    const t = runTimeline(b, { entered: {}, age: null });
    if (t.kind !== "ok") throw new Error("run failed");
    // at 0% nothing grows: the balance is what was paid in, so in today's money it is less than what was paid in
    expect(t.years.at(-1)!.nominal).toBeCloseTo(t.years.at(-1)!.paidIn, 6);
    expect(t.years.at(-1)!.real).toBeLessThan(t.years.at(-1)!.paidInReal);
  });
  it("applies a paying bank's ceiling to its published rate; an entered rate applies to the whole balance", () => {
    const d = page("current-account").signature!;
    const discount = d.banks!.find((x) => x.bank === "discount")!;
    const b = bundleAtBank(d.bundles["current-account"]!, discount);
    expect(b.terms.deposit?.balanceCeiling).toBe(10000);
    const withCeiling = runTimeline(b, { entered: {}, age: null });
    const { balanceCeiling: _c, ...deposit } = b.terms.deposit!;
    const whole = runTimeline({ ...b, terms: { ...b.terms, deposit } }, { entered: {}, age: null });
    if (withCeiling.kind !== "ok" || whole.kind !== "ok") throw new Error("run failed");
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
    // at a rate of 0 the old line (what was paid in, divided by the last month's index) equals the net line: idle cash looked as if it had kept its value
    expect(end.paidIn / end.index).toBeCloseTo(end.real, 6);
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
  const entered = { amount_now: 10000, monthly_deposit: 0, horizon_years: 10 };
  it("equals the engine runs of the account and the daily fund", () => {
    const m = currentAccountModel(d, { balance: 10000, years: 10 })!;
    const a = runTimeline(d.bundles["current-account"]!, { entered, age: null });
    const f = runTimeline(d.bundles["money-market-fund-daily"]!, { entered, age: null });
    if (a.kind !== "ok" || f.kind !== "ok") throw new Error("run failed");
    expect(m.end.account).toBe(a.years.at(-1)!.real);
    expect(m.end.fund).toBe(f.years.at(-1)!.real);
    expect(m.end.cost).toBeCloseTo(m.end.fund - m.end.account, 9);
  });

  it("leads with the rate most banks pay (F-85): 0%, 4 of the 8 banks collected, 4 of them paying", () => {
    expect([fact(d, "commonRate")!.value, fact(d, "commonCount")!.value, fact(d, "bankCount")!.value, fact(d, "payingCount")!.value]).toEqual([0, 4, 8, 4]);
    expect(fact(d, "commonRate")!.state).toBe("computed");
    expect(fact(d, "commonRate")!.computed_from!.formula).toBe("F-85");
    expect(fact(d, "taxRate")!.value).toBe(15);
  });

  it("by default 10,000 NIS for ten years loses value: 8,203 NIS in today's money, 1,797 less (inflation only)", () => {
    const m = currentAccountModel(d, { balance: 10000, years: 10 })!;
    expect(m.bank).toBeNull();
    expect(m.rate.value).toBe(0);
    expect(m.ceiling).toBeNull();
    expect(m.end.account).toBeCloseTo(10000 / Math.pow(1.02, 10), 6);
    expect(Math.round(m.end.account)).toBe(8203);
    expect(Math.round(-m.end.change)).toBe(1797);
    expect(m.end.cost).toBeGreaterThan(0);
  });

  it("the picker redraws the account line at the bank's rate and ceiling, assuming its conditions are met", () => {
    const base = currentAccountModel(d, { balance: 10000, years: 10 })!;
    const discount = d.banks!.find((b) => b.bank === "discount")!;
    const picked = currentAccountModel(d, { balance: 10000, years: 10, bankId: discount.id })!;
    expect(picked.bank!.bank).toBe("discount");
    expect(picked.rate.value).toBe(3);
    expect(picked.ceiling!.value).toBe(10000);
    expect(picked.end.account).toBeGreaterThan(base.end.account);
    // the same run as the engine's on the bundle at that bank's rate
    const b = bundleAtBank(d.bundles["current-account"]!, discount);
    const a = runTimeline(b, { entered, age: null });
    if (a.kind !== "ok") throw new Error("run failed");
    expect(picked.end.account).toBe(a.years.at(-1)!.real);
    // the fund and the starting balance do not move
    expect(picked.end.fund).toBe(base.end.fund);
    expect(picked.points[0]).toEqual(base.points[0]);
    // a balance above the ceiling earns on the ceiling only: 50,000 gains at most what 255 a year (3% of 10,000 less 15%) adds up to in ten years, and still ends below what it started with
    const big = currentAccountModel(d, { balance: 50000, years: 10, bankId: discount.id })!;
    const gain = big.end.account - 50000 / Math.pow(1.02, 10);
    expect(gain).toBeGreaterThan(0);
    expect(gain).toBeLessThan(10 * 255);
    expect(big.end.account).toBeLessThan(50000);
  });

  it("a bank that pays nothing draws the same line as the default", () => {
    const base = currentAccountModel(d, { balance: 10000, years: 10 })!;
    for (const id of ["hapoalim", "massad", "mizrahi-tefahot", "mercantile"]) {
      const m = currentAccountModel(d, { balance: 10000, years: 10, bankId: `${id}-current-account` })!;
      expect(m.rate.value).toBe(0);
      expect(m.end.account).toBeCloseTo(base.end.account, 9);
    }
  });

  it("lists the banks that pay first, highest rate first, then the ones that pay nothing", () => {
    expect(payingBanks(d).map((b) => [b.bank, b.rate.value])).toEqual([["discount", 3], ["fibi", 2], ["leumi", 1], ["yahav", 0.75]]);
    expect(silentBanks(d).map((b) => b.bank).sort()).toEqual(["hapoalim", "massad", "mercantile", "mizrahi-tefahot"]);
    expect(topPayer(d)!.bank).toBe("discount");
    expect(largestCeiling(d)!.value).toBe(10000);
    expect(d.banks).toHaveLength(8);
  });

  it("the most each bank pays in a year on 10,000 NIS, after the 15% withheld, and the ceiling caps it", () => {
    const tax = Number(fact(d, "taxRate")!.value);
    const of = (bank: string, balance: number) => bankYearlyMax(d.banks!.find((b) => b.bank === bank)!, balance, tax);
    expect(of("discount", 10000)).toBeCloseTo(255, 9);
    expect(of("fibi", 10000)).toBeCloseTo(170, 9);
    expect(of("leumi", 10000)).toBeCloseTo(85, 9);
    expect(of("yahav", 10000)).toBeCloseTo(63.75, 9);
    expect(of("hapoalim", 10000)).toBe(0);
    expect(of("discount", 100000)).toBeCloseTo(255, 9);
    expect(of("discount", 4000)).toBeCloseTo(102, 9);
  });

  it("every bank carries the record's own Hebrew conditions; the doubts, the end date and the printed no-offer sentence travel with the rows", () => {
    expect(d.banks!.every((b) => !!b.conditions)).toBe(true);
    const by = (bank: string) => d.banks!.find((b) => b.bank === bank)!;
    expect(by("fibi").doubt).toContain("31.03.2026");
    expect(by("mercantile").doubt).toContain("דיסקונט");
    expect(d.banks!.filter((b) => b.doubt).map((b) => b.bank).sort()).toEqual(["fibi", "mercantile"]);
    expect(by("yahav").until).toBe("2026-12-31");
    expect(d.banks!.filter((b) => !b.until)).toHaveLength(7);
    // Hapoalim, Mizrahi-Tefahot and Massad print the no-interest sentence; Mercantile prints a rate of 0
    expect(d.banks!.filter((b) => b.noOffer).map((b) => b.bank).sort()).toEqual(["hapoalim", "massad", "mizrahi-tefahot"]);
    expect(by("mercantile").noOffer).toBe(false);
    expect(by("mercantile").rate.value).toBe(0);
    // the doubt is in the number's own sheet
    expect(by("fibi").rate.notes).toBe(by("fibi").doubt);
  });

  it("the worth-knowing fact counts the banks that pay, says they all have conditions and a ceiling, and names the highest", () => {
    const f = accountFact(d)!;
    expect([f.paying.value, f.of.value]).toEqual([4, 8]);
    expect(f.paying.state).toBe("computed");
    expect(f.ceiling!.value).toBe(10000);
    expect(f.allConditional).toBe(true);
    expect([f.top.bank, f.top.name, f.top.rate.value]).toEqual(["discount", "דיסקונט", 3]);
  });

  it("fits the value axis to the data, not to 0", () => {
    const m = currentAccountModel(d, { balance: 10000, years: 10 })!;
    const axis = accountAxis([10000, ...m.points.flatMap((p) => [p.account, p.fund])]);
    expect(axis.lo).toBeGreaterThan(7000);
    expect(axis.lo).toBeLessThan(m.end.account);
    expect(axis.hi).toBeGreaterThan(m.end.fund);
  });

  it("has no worth-knowing fact without bank records, and an unknown bank id falls back to the default line", () => {
    expect(accountFact({ ...d, banks: [] })).toBeNull();
    expect(payingBanks({ ...d, banks: [] })).toEqual([]);
    const base = currentAccountModel(d, { balance: 10000, years: 10 })!;
    expect(currentAccountModel(d, { balance: 10000, years: 10, bankId: "no-such-bank" })!.end.account).toBe(base.end.account);
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
      ["current-account", 0, "common"],
      ["money-market-fund-daily", 3.5, "assumption"],
      ["money-market-fund-renewable", 3.5, "assumption"],
      ["bank-deposit", 1.8, "published"],
    ]);
    expect(bestWithin(rows, "any-time")!.id).toBe("current-account");
    expect(bestWithin(rows, "at-maturity")!.rate.value).toBe(3.5);
  });
  it("shows the current account at the rate most banks publish, with the best a bank pays and the largest ceiling beside it", () => {
    const row = ladderRows(d)[0]!;
    expect([row.banks!.count.value, row.banks!.of.value]).toEqual([4, 8]);
    expect(row.top!.rate.value).toBe(3);
    expect(row.top!.name).toBe("דיסקונט");
    expect(row.top!.ceiling!.value).toBe(10000);
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
