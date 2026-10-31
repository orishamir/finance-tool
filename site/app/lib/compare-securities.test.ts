// D6 as amended 2026-10-26: makam and a government bond are securities held in the securities account, so the account's choice of
// provider (F-80) prices them too, on the lines for their own class, with the member's kind deciding custody on makam (F-14).
import { describe, expect, it } from "vitest";
import { applyOwnProviders, applyProviders, evaluate, providerOutcomes, type RunGoal } from "./compare";
import { isTie } from "@finance-tool/engine";
import { compareBundle } from "./compare.server";
import { loadParameters, loadProducts, loadRules, today } from "./data.server";
import { accountRuns } from "./guide-signature-bundle.server";
import { shortName } from "./providers";
import { buildGuidePage } from "./guide.server";

const bundle = compareBundle();
// a year of idle cash: 100,000 now, nothing monthly, the makam yield entered as the cash rate the guides use
const goal: RunGoal = { horizonYears: 2, amountNow: 100_000, monthly: 0, available: 0, anytime: true, returnPct: null, inflationPct: 2.5, age: 35, employment: "employee", salary: 15_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const entry = (id: string) => bundle.wrappers.find((w) => w.id === id)!;

describe("makam is priced like the account that holds it", () => {
  const makam = entry("makam");
  it("carries every Israeli bank and broker with a makam trade line, and no foreign broker", () => {
    const ids = Object.keys(makam.providers ?? {});
    for (const id of ["leumi", "hapoalim", "discount", "psagot", "ibi", "altshuler-trade"]) expect(ids).toContain(id);
    expect(ids).not.toContain("interactive-brokers");
    for (const p of Object.values(makam.providers!)) {
      expect(p.tariff.buy).toBeDefined();
      expect(Object.keys(p.tariff).every((k) => ["buy", "sell", "redeem", "custody", "monthlyFee"].includes(k))).toBe(true);
      expect(["bank", "non-bank"]).toContain(p.memberKind);
    }
  });
  it("a bank's run charges no custody (BRK-17); a broker's charges its custody and monthly lines", () => {
    const run = (provider: string) => evaluate(applyOwnProviders(bundle, { ownProviders: { makam: provider } }), goal).candidates.find((c) => c.id === "makam")?.run;
    const leumi = run("leumi")!;
    const altshuler = run("altshuler-trade")!;
    expect(leumi.fees.custody).toBe(0);
    expect(altshuler.fees.custody).toBeGreaterThan(0);
    expect(altshuler.fees.fixed).toBeGreaterThan(0); // its 80 NIS a month account fee is the account's, on whatever it holds
    expect(altshuler.real).toBeLessThan(leumi.real);
  });
  it("the site picks the provider that leaves the goal the most, and says so", () => {
    const picked = applyProviders(bundle, goal).wrappers.find((w) => w.id === "makam")!;
    expect(picked.representative).toMatchObject({ pickedBy: "site", compared: Object.keys(makam.providers!).length });
    const rows = providerOutcomes(bundle, goal, "makam").providers;
    expect(picked.representative!.providerId).toBe(rows[0]!.id);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1]!.real).toBeGreaterThanOrEqual(rows[i]!.real);
  });
});

describe("the government bond is priced like the account that holds it", () => {
  it("carries the account's providers at the bond class", () => {
    const bond = entry("government-bond");
    expect(Object.keys(bond.providers ?? {}).length).toBeGreaterThan(5);
    for (const p of Object.values(bond.providers!)) expect(p.tariff.buy).toBeDefined();
  });
});

describe("the money-market funds keep the bank case", () => {
  it("carry no provider list: at a bank with a distribution agreement the holder pays nothing (MF-26, BANK-18)", () => {
    expect(entry("money-market-fund-daily").providers).toBeUndefined();
    expect(entry("money-market-fund-daily").record).toHaveProperty("held_in");
  });
});

describe("the guides price an account and its securities on the comparison's pick (issue 112)", () => {
  // the guide's example plan: P-05's amount, monthly deposit and horizon
  const plan: RunGoal = { ...goal, horizonYears: 10, amountNow: 10_000, monthly: 500, inflationPct: 2 };
  for (const id of ["makam", "government-bond"]) {
    it(`${id}: the same house out of the same count`, () => {
      const own = buildGuidePage(id)!.bundle!;
      const rows = providerOutcomes(bundle, plan, id).providers;
      expect(own.pick!.id).toBe(rows[0]!.id);
      expect(own.pick!.count.value).toBe(Object.keys(entry(id).providers!).length);
      expect(own.feeValues.tradeRate?.own).toBeTruthy();
    });
  }
  it("government bond: a house's own line for bonds, on both paths (F-63, Psagot's tariff, 4(א)1)", () => {
    const own = buildGuidePage("government-bond")!.bundle!;
    expect(own.pick!.id).toBe("psagot");
    expect(own.terms.tariff!.buy).toEqual({ rate: 0.0006, min: 2 });
    expect(entry("government-bond").providers!.psagot!.tariff.buy).toEqual(own.terms.tariff!.buy);
    expect(own.feeValues.tradeRate?.value).toBe(0.06);
    expect(own.pick!.tied).toBeUndefined();
  });
  it("the guide path counts a monthly minimum per charging period (F-14), as the engine's path does", () => {
    const p05 = loadParameters().find((p) => p.method_id === "P-05")!;
    const rows = accountRuns(loadProducts().find((w) => w.id === "makam")!, "makam", p05, loadRules(), today());
    const custody = (id: string) => rows.find((r) => r.id === id)!.bundle.terms.tariff!.custody;
    expect(custody("altshuler-trade")).toMatchObject({ everyMonths: 12, min: 900 });
    expect(custody("excellence")).toMatchObject({ everyMonths: 3, min: 120 });
  });
  it("the guide path reads each house's order line as the comparison does", () => {
    const p05 = loadParameters().find((p) => p.method_id === "P-05")!;
    for (const [id, family] of [["makam", "makam"], ["government-bond", "bond"]] as const) {
      const record = loadProducts().find((w) => w.id === id)!;
      const rows = accountRuns(record, family, p05, loadRules(), today());
      expect(rows.length).toBe(Object.keys(entry(id).providers!).length);
      for (const r of rows) {
        const theirs = entry(id).providers![r.id]!.tariff;
        expect(r.bundle.terms.tariff!.buy).toEqual(theirs.buy);
        expect(r.bundle.terms.tariff!.sell).toEqual(theirs.sell);
      }
    }
  });
  it("makam: a redemption is priced by the house's line that names it, on both paths (F-24)", () => {
    const makam = entry("makam");
    for (const p of Object.values(makam.providers!)) expect(p.tariff.redeem).toBeDefined();
    expect(makam.providers!.pepper!.tariff.redeem).toMatchObject({ flatUpTo: { amount: 4, upTo: 30_000 }, rate: 0.001, min: 20 });
    expect(makam.providers!.psagot!.tariff.redeem).toMatchObject({ rate: 0.0005, min: 2 });
    // the reduced price of an order placed online is not the redemption's
    expect(makam.providers!.leumi!.tariff.redeem).toMatchObject({ rate: 0.001, min: 20 });
    expect(makam.providers!.leumi!.tariff.buy).toMatchObject({ rate: 0.00095, min: 18 });
    const own = buildGuidePage("makam")!.bundle!;
    expect(own.terms.tariff!.redeem).toEqual(makam.providers![own.pick!.id]!.tariff.redeem);
    expect(own.feeValues.redeemRate?.own).toBe(own.feeValues.tradeRate?.own);
  });
  it("makam: houses within the tie threshold of the top tie, and the page crowns none (F-80, P-01)", () => {
    const own = buildGuidePage("makam")!.bundle!;
    const rows = providerOutcomes(bundle, plan, "makam").providers;
    const tied = rows.filter((r) => isTie(rows[0]!.real, r.real, 0.005));
    expect(tied.length).toBeGreaterThan(1);
    expect(own.pick!.tied!.names).toEqual(tied.map((r) => shortName(r.id, r.name)));
    expect(own.pick!.tied!.names).toEqual(["פסגות", "פפר"]);
    expect(own.pick!.tied!.theta.value).toBe(0.5);
  });
  it("names no bank on a money-market fund: the fees are the law's zero (MF-26, BANK-18)", () => {
    const own = buildGuidePage("money-market-fund-daily")!.bundle!;
    expect(own.feeValues.tradeRate?.value).toBe(0);
    expect(own.feeValues.tradeRate?.own).toBeUndefined();
    expect(own.feeValues.custodyRate?.own).toBeUndefined();
  });
  it("the securities account's page is the study-fund page's pick", () => {
    const own = buildGuidePage("brokerage-account")!.bundle!;
    const other = buildGuidePage("keren-hishtalmut")!.signature!;
    expect(own.pick!.id).toBe("fair");
    expect(own.pick!.count.value).toBe(other.facts.brokerCount!.value);
    expect(own.feeValues.tradeRate?.own).toBeTruthy();
  });
});

describe("the P-05 path carries the member's kind (F-14)", () => {
  it("makam on P-05's bank tariff runs as at a bank", () => {
    expect(entry("makam").terms?.memberKind).toBe("bank");
  });
});
