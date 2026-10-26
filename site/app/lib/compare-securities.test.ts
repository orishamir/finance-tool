// D6 as amended 2026-10-26: makam and a government bond are securities held in the securities account, so the account's choice of
// provider (F-80) prices them too, on the lines for their own class, with the member's kind deciding custody on makam (F-14).
import { describe, expect, it } from "vitest";
import { applyOwnProviders, applyProviders, evaluate, providerOutcomes, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";

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
      expect(Object.keys(p.tariff).every((k) => ["buy", "sell", "custody", "monthlyFee"].includes(k))).toBe(true);
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

describe("the P-05 path carries the member's kind (F-14)", () => {
  it("makam on P-05's bank tariff runs as at a bank", () => {
    expect(entry("makam").terms?.memberKind).toBe("bank");
  });
});
