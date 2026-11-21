// D29 visuals: every figure equals an engine run, and the timeline's sums hold.
import { describe, expect, it } from "vitest";
import { bondPrice, makamPrice } from "@finance-tool/engine";
import { buildGuidePage, depositSheetNames } from "./guide.server";
import type { DepositTerms } from "@finance-tool/schema";
import { runTimeline } from "./engine";
import { guideSignature } from "../copy";
import { accountAxis, accountFact, bankYearlyMax, bondModel, brokenCondition, breakKindOf, slowerPayNoMore, bundleAtBank, currentAccountModel, fact, largestCeiling, ladderRows, makamModel, payingBanks, planModel, runAtMonths, silentBanks, topPayer, type SignatureData } from "./guide-signature";

const page = (id: string) => buildGuidePage(id)!;
const cashRate = (id: string) => ((page(id).bundle!.p05 as unknown as { inputs: { cash_rate: { value: number } } }).inputs.cash_rate.value);

describe("timeline fixes on the cash-like pages", () => {
  it("runs the deposit family on the record's published rate, not on P-05's cash rate", () => {
    // the deposit's example is the middle of the plain one-year deposits collected that cannot be broken (F-86). On 2026-11-09 seven of the
    // nine banks' picks cannot be broken: 1.55, 1.74, 1.8, 1.85, 1.85, 1.95 and 3.25; the middle is FIBI's 835 at 1.85%, the highest plain
    // one-year rate 10,000 ₪ opens at FIBI (F-108). Discount's and Mercantile's can be broken.
    expect(cashRate("bank-deposit")).toBe(1.85);
    expect(cashRate("savings-plan")).toBe(1.5);
    // the current account starts from the rate most of the collected banks publish (F-85), 0%, not Leumi's 1%
    expect(cashRate("current-account")).toBe(0);
    // the cash-like rate is the Bank of Israel's policy rate, quoted (D20 amended), not a round 3.5
    expect(cashRate("makam")).toBe(3.25);
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

  it("the most each bank pays in a year on a balance, after the 15% withheld: the ceiling caps it, and a balance that breaks the bank's own condition on it earns nothing", () => {
    const tax = Number(fact(d, "taxRate")!.value);
    const by = (bank: string) => d.banks!.find((b) => b.bank === bank)!;
    const of = (bank: string, balance: number) => bankYearlyMax(by(bank), balance, tax);
    expect(of("discount", 10000)).toBeCloseTo(255, 9);
    expect(of("fibi", 10000)).toBeCloseTo(170, 9);
    expect(of("leumi", 10000)).toBeCloseTo(85, 9);
    expect(of("hapoalim", 10000)).toBe(0);
    expect(of("discount", 4000)).toBeCloseTo(102, 9);
    expect(of("discount", 30000)).toBeCloseTo(255, 9);
    // Discount pays only while all the customer's assets in the account stay at or below 30,000 NIS (F-26, `balance_conditions`)
    expect(of("discount", 30001)).toBe(0);
    expect(of("discount", 50000)).toBe(0);
    expect(brokenCondition(by("discount"), 50000)).toMatchObject({ measure: "total_assets", bound: "max", inclusive: true });
    // Yahav only while the monthly average balance is below 10,000 NIS: at 10,000 it pays nothing, just below it 0.75%
    expect(of("yahav", 10000)).toBe(0);
    expect(of("yahav", 9999)).toBeCloseTo(9999 * 0.0075 * 0.85, 9);
    expect(of("yahav", 50000)).toBe(0);
    // First International: 10,000 NIS or more every day, and assets up to 50,000 NIS
    expect(of("fibi", 9999)).toBe(0);
    expect(of("fibi", 50000)).toBeCloseTo(170, 9);
    expect(of("fibi", 50001)).toBe(0);
    // Leumi prints no condition on the balance: its ceiling caps it
    expect(of("leumi", 50000)).toBeCloseTo(85, 9);
    expect(brokenCondition(by("leumi"), 50000)).toBeNull();
  });

  it("every bank carries the record's own Hebrew conditions; the doubts, the end date and the printed no-offer sentence travel with the rows", () => {
    expect(d.banks!.every((b) => !!b.conditions)).toBe(true);
    const by = (bank: string) => d.banks!.find((b) => b.bank === bank)!;
    // the doubt is the rate's own: it goes wherever the rate shows
    expect(by("fibi").rate.doubt).toContain("31.03.2026");
    expect(by("mercantile").rate.doubt).toContain("דיסקונט");
    expect(d.banks!.filter((b) => b.rate.doubt).map((b) => b.bank).sort()).toEqual(["fibi", "mercantile"]);
    expect(by("yahav").until).toBe("2026-12-31");
    expect(d.banks!.filter((b) => !b.until)).toHaveLength(7);
    // Hapoalim, Mizrahi-Tefahot and Massad print the no-interest sentence; Mercantile prints a rate of 0
    expect(d.banks!.filter((b) => b.noOffer).map((b) => b.bank).sort()).toEqual(["hapoalim", "massad", "mizrahi-tefahot"]);
    expect(by("mercantile").noOffer).toBe(false);
    expect(by("mercantile").rate.value).toBe(0);
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
  it("runs its timeline on the middle of the collected deposits that cannot be broken (F-86), and has no visual", () => {
    const own = page("bank-deposit").bundle!;
    // FIBI's 835 and Massad's 835 are both at 1.85%; the records come sorted by bank, so FIBI's stands at the middle (index 3 of 7)
    expect(own.pick).toMatchObject({ kind: "deposit", id: "fibi-pikadon-leshana-kavua-835-from-1000" });
    expect(own.pick!.count.value).toBe(7);
    expect(own.feeValues.term?.own).toBe("הבינלאומי");
    expect(page("bank-deposit").signature).toBeNull();
  });
  it("reads each bank's plain deposit, not a campaign, a variant or one with exit points (F-86, 2026-11-06)", () => {
    const d = page("money-market-fund-daily").signature!;
    // nine banks, one plain deposit each at 10,000 ₪ (F-108); all but Discount's and Mercantile's cannot be broken
    expect([fact(d, "depositNoExitCount")!.value, fact(d, "depositCount")!.value]).toEqual([7, 9]);
    expect(d.depositBanks!.map((b) => b.id).sort()).toEqual([
      "discount-pikadon-leshana-0122",
      "fibi-pikadon-leshana-kavua-835-from-1000",
      "hapoalim-pikadon-leshana-kavua",
      "jerusalem-pikadon-leshana-kavua",
      "leumi-pakam-kavua-365",
      "massad-pikadon-leshana-kavua-835-from-1000",
      "mercantile-pikadon-leshana-kavua-0122",
      "mizrahi-tefahot-pomelit-kvua-shana-131",
      "yahav-pikadon-leshana-kavua-from-1000",
    ]);
    expect(breakKindOf(d.depositBanks!.find((b) => b.bank === "hapoalim")!.exit)).toBe("not-allowed");
    expect(breakKindOf(d.depositBanks!.find((b) => b.bank === "discount")!.exit)).toBe("other");
  });
  it("counts breaking over the banks, and its sheet has one line for each deposit counted (F-104)", () => {
    const b = page("bank-deposit").breakTerms!;
    // 100 one-year deposits at ten banks (foreign-currency-linked rows are tier 2, D2, and not collected); at seven none can be
    // broken, five of them with exit points (FIBI, Hapoalim, Leumi, Massad, Mizrahi-Tefahot); Discount's 11 and Mercantile's 3 can, with a
    // penalty, and One Zero's 3, two with a penalty and its daily one free
    expect([b.deposits.value, b.banks.value, b.lockedBanks.value, b.lockedBanksWithExits.value]).toEqual([100, 10, 7, 5]);
    expect(b.breakable.map((x) => [x.id, x.deposits.value, x.withPenalty.value, x.free.value])).toEqual([
      ["discount", 11, 11, 0],
      ["mercantile", 3, 3, 0],
      ["one-zero", 3, 2, 1],
    ]);
    const lines = (v: { computed_from?: { inputs?: Record<string, unknown> } }) => Object.keys(v.computed_from?.inputs ?? {}).length;
    expect(lines(b.deposits as never)).toBe(100);
    // the banks with exits among those that lock every deposit read both columns of each deposit
    expect(lines(b.lockedBanksWithExits as never)).toBe(200);
    expect(lines(b.breakable[0]!.deposits as never)).toBe(11);
    // a sheet name still taken gets a number that replaces the last one, never a stack of them
    const twin = { bank: "x", names: { "447": ["פיקדון"] }, type_447: "t", rate_type: "fixed", linkage: "none", exit_points: { exists: false, every_months: null } };
    const names = depositSheetNames(["a", "b", "c"].map((id) => ({ ...twin, id }) as unknown as DepositTerms));
    expect([...names.values()].map((n) => n.replace(/^.* · /, ""))).toEqual(["ריבית קבועה", "ריבית קבועה (2)", "ריבית קבועה (3)"]);
    // each bank links its own break rule, not one bank's for all
    expect(b.breakable[0]!.rules).toContain("BANK-33");
    // the exit column says only the exits: no break rule, no condition about opening the deposit
    const exits = Object.entries((b.lockedBanksWithExits as { computed_from?: { inputs?: Record<string, { value: unknown; rule_ids?: string[]; notes?: string }> } }).computed_from!.inputs!)
      .filter(([name]) => name.endsWith(` · ${guideSignature.deposit.exitsInput}`))
      .map(([, v]) => v);
    expect(exits).toHaveLength(100);
    for (const e of exits) expect(e.rule_ids ?? []).toEqual([]);
    // a note only on a deposit with exits, never on "אין"
    expect(exits.filter((e) => e.notes).length).toBeGreaterThan(0);
    for (const e of exits) if (e.value === "אין") expect(e.notes ?? "").toBe("");
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
      ["money-market-fund-daily", 3.25, "assumption"],
      ["money-market-fund-renewable", 3.25, "assumption"],
      ["bank-deposit", 3.25, "range"],
    ]);
  });
  it("says waiting does not pay only when every slower row pays no more than the fund", () => {
    const rows = ladderRows(d);
    expect(slowerPayNoMore(rows, "money-market-fund-daily")).toBe(true);
    const richer = rows.map((r) => (r.id === "bank-deposit" ? { ...r, rate: { ...r.rate, value: 4 } } : r));
    expect(slowerPayNoMore(richer, "money-market-fund-daily")).toBe(false);
    expect(slowerPayNoMore(rows, "bank-deposit")).toBe(false); // nothing slower
  });
  it("shows the current account at the rate most banks publish, out of the banks collected", () => {
    const row = ladderRows(d)[0]!;
    expect([row.banks!.count.value, row.banks!.of.value]).toEqual([4, 8]);
  });
  it("counts the collected one-year deposits that cannot be left before the end (F-86), and reads the law's longest interval (MF-08)", () => {
    expect([d.facts.depositNoExitCount!.value, d.facts.depositNoExitCount!.state]).toEqual([7, "computed"]);
    expect(d.facts.maxInterval!.value).toBe(12);
  });
  it("shows the one-year deposit as the range across the collected banks' fixed rates (F-86), naming none", () => {
    const row = ladderRows(d).find((r) => r.id === "bank-deposit")!;
    // Mercantile's 1.05% to Jerusalem's 3.25%, over nine banks
    expect([row.range!.lo.value, row.rate.value, row.range!.count.value]).toEqual([1.05, 3.25, 9]);
    expect([row.rate.state, row.rate.own]).toEqual(["computed", undefined]);
    expect(d.depositBanks!.map((b) => [b.bank, b.rate.value])).toEqual([
      ["discount", 2.25],
      ["fibi", 1.85],
      ["hapoalim", 1.74],
      ["jerusalem", 3.25],
      ["leumi", 1.8],
      ["massad", 1.85],
      ["mercantile", 1.05],
      ["mizrahi-tefahot", 1.55],
      ["yahav", 1.95],
    ]);
  });
});


/** The signature with its bundle's cash rate (P-05 `cash_rate`) quoted as effective, as the Bank of Israel's averages are (BANK-53). */
const withEffectiveCash = (d: SignatureData, id: string): SignatureData => {
  const b = d.bundles[id]!;
  const inputs = (b.p05 as unknown as { inputs: Record<string, object> }).inputs;
  const p05 = { ...b.p05, inputs: { ...inputs, cash_rate: { ...inputs.cash_rate, unit: "pct_per_year_effective" } } } as unknown as typeof b.p05;
  return { ...d, bundles: { ...d.bundles, [id]: { ...b, p05 } } };
};

describe("makam", () => {
  const d = page("makam").signature!;
  it("prices by F-24 and takes gain, tax and net from the ledger run", () => {
    const m = makamModel(d, { amount: 10000, month: 6 })!;
    expect(m.price).toBe(makamPrice(0.0325, (365 * 6) / 12));
    const run = runAtMonths(d.bundles["makam"]!, { amount_now: 10000, monthly_deposit: 0 }, 6)!;
    expect(m.net).toBe(run.nominal);
    expect(m.tax).toBe(run.taxAtExit + run.taxDuring);
    expect(m.atRedemption).toBe(false);
    expect(makamModel(d, { amount: 10000, month: 12 })!.price).toBe(100);
    expect(makamModel(d, { amount: 10000, month: 12 })!.atRedemption).toBe(true);
  });
  it("states the tax's base so a reader can redo the tax: the sale's gain less the year's custody, or the discount at redemption", () => {
    const sale = makamModel(d, { amount: 10000, month: 6 })!;
    const run = runAtMonths(d.bundles["makam"]!, { amount_now: 10000, monthly_deposit: 0 }, 6)!;
    expect(sale.taxedBase).toBeCloseTo(run.detail.taxedGain!, 9);
    expect(sale.tax).toBeCloseTo(0.15 * sale.taxedBase, 9);
    const redeem = makamModel(d, { amount: 10000, month: 12 })!;
    expect(redeem.taxedBase).toBeCloseTo(runAtMonths(d.bundles["makam"]!, { amount_now: 10000, monthly_deposit: 0 }, 12)!.detail.taxedDiscount!, 9);
    expect(redeem.tax).toBeCloseTo(0.15 * redeem.taxedBase, 9);
  });
  // "15% of 154.96 ₪, the gain less 6.07 ₪" did not add up to the gain of 161.10 ₪
  // shown, because the gain on the slices sold for custody was in the gain and in no tax. The tax line's base and fees add up to the gain
  // figure as all three are printed, to the agora, at every month and amount.
  it("the tax line's base plus the fees deducted is the gain shown, to the agora", () => {
    const agorot = (v: number) => Math.round(v * 100);
    for (const amount of [1_000, 10_000, 123_456, 1_000_000]) {
      for (let month = 1; month <= 12; month++) {
        const m = makamModel(d, { amount, month })!;
        expect(agorot(m.taxedBase) + agorot(m.taxedFees), `${amount} at ${month}`).toBe(agorot(m.gain));
        expect(Math.abs(m.taxedFees - (m.gain - m.taxedBase)), `${amount} at ${month}`).toBeLessThan(0.01);
        // the two lines above hold by construction (the fees are the gain less the base, rounded): the fees printed must also be what the
        // run deducted, or a base that drops the slices' gain would hide in the fees figure
        const run = runAtMonths(d.bundles["makam"]!, { amount_now: amount, monthly_deposit: 0 }, month)!;
        expect(Math.abs(m.taxedFees - run.detail.deductedFees!), `${amount} at ${month}`).toBeLessThan(0.01);
      }
    }
  });
  it("reads a cash rate quoted as effective as the yield to redemption, an effective annual rate (F-24, F-60)", () => {
    const m = makamModel(withEffectiveCash(d, "makam"), { amount: 10000, month: 6 })!;
    expect(m.yieldPct).toBeCloseTo(3.25, 12);
    expect(m.price).toBe(makamPrice(0.0325, (365 * 6) / 12));
  });
  it("gives one answer for a month however the marker got there", () => {
    const at = (month: number) => JSON.stringify(makamModel(d, { amount: 10000, month }));
    const first = Array.from({ length: 12 }, (_, i) => at(i + 1));
    for (const path of [[6, 7, 6], [1, 2, 3, 4, 5, 6], [12, 1, 6], [6, 6]]) for (const month of path) expect(at(month)).toBe(first[month - 1]);
  });
});

describe("government bond", () => {
  const d = page("government-bond").signature!;
  it("prices by present value and equals par when rates do not move", () => {
    expect(bondModel(d, { amount: 10000, years: 10, shiftPct: 0 })!.price).toBeCloseTo(100, 9);
    const m = bondModel(d, { amount: 10000, years: 10, shiftPct: 1 })!;
    let pv = 0;
    for (let k = 1; k <= 10; k++) pv += 3.25 / Math.pow(1.0425, k);
    pv += 100 / Math.pow(1.0425, 10);
    expect(m.price).toBeCloseTo(pv, 9);
    expect(m.price).toBe(bondPrice(0.0325, 0.0425, 10, 1));
    expect(m.changePct).toBeLessThan(0);
    expect(Math.abs(m.makamChangePct)).toBeLessThan(Math.abs(m.changePct));
    expect(bondModel(d, { amount: 10000, years: 10, shiftPct: -1 })!.price).toBeGreaterThan(100);
  });
  it("takes a cash rate quoted as effective as the coupon whose payments compound to it, and prices at par when rates do not move (F-25, F-60)", () => {
    // twice a year at 3.25% effective: the coupon is 2 × (1.0325^(1/2) − 1) = 3.2241%, and at the same yield the bond is at par
    const half = { ...withEffectiveCash(d, "government-bond"), facts: { ...d.facts, couponEvery: { ...d.facts.couponEvery!, value: 6 } } };
    const m = bondModel(half, { amount: 10000, years: 10, shiftPct: 0 })!;
    expect(m.couponPct).toBeCloseTo(200 * (Math.sqrt(1.0325) - 1), 9);
    expect(m.price).toBeCloseTo(100, 9);
    // read as nominal, the same 3.25% is the coupon itself
    const nominal = bondModel({ ...d, facts: half.facts }, { amount: 10000, years: 10, shiftPct: 0 })!;
    expect(nominal.couponPct).toBeCloseTo(3.25, 12);
  });
});
