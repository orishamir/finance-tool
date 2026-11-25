import { describe, expect, it } from "vitest";
import { loadCma, loadFees } from "./data.server";
import { loadDepositTerms, loadFunds } from "./instruments.server";
import { loadInstitutionRegistry } from "./institutions.server";
import { fundRun, shortName } from "./providers";

describe("shortName", () => {
  it("drops the legal suffix and a parenthesis", () => {
    expect(shortName("", 'אלטשולר שחם גמל ופנסיה בע"מ')).toBe("אלטשולר שחם גמל ופנסיה");
    expect(shortName("", "פסגות ניירות ערך בע״מ (פסגות טרייד)")).toBe("פסגות ניירות ערך");
    expect(shortName("leumi", 'בנק לאומי לישראל בע"מ')).toBe("לאומי");
  });

  it("leaves no suffix and no parenthesis on any company name the data holds", () => {
    const names = new Set<string>();
    for (const s of loadFees()) names.add(s.provider.name_he);
    for (const f of loadFunds()) names.add(f.manager);
    for (const c of loadCma().companies) names.add(c.name);
    for (const r of loadInstitutionRegistry()) names.add(r.name_he);
    for (const d of loadDepositTerms()) names.add(d.bank);
    for (const n of names) {
      const short = shortName("", n);
      expect(short, n).not.toMatch(/בע["״]מ|[()]/);
      expect(short, n).toBe(short.trim());
      expect(short.length, n).toBeGreaterThan(0);
    }
  });
});

describe("fundRun: the principal currency's path (F-04, TXS-14)", () => {
  const rec = loadFunds().find((f) => f.id === "5129275");
  const status = rec?.tax_status.foreign_investment_fund;
  if (!rec || !status) throw new Error("the S&P 500 fund 5129275 and its status are in the data");
  const subject = (hedged: boolean, value: string | false | null) => {
    const record = { ...rec, hedged, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } };
    return { recordId: rec.id, name: "", number: rec.id, instrumentClass: "etf_units", currency: "ILS", exposureId: rec.exposure_id, fromP05: false, record };
  };
  const dollarIndex = { id: rec.exposure_id, cash_like: false, currency: "USD" };
  const market = (hedged: boolean, value: string | false | null, exposure: { cash_like: boolean; currency: string } = dollarIndex) => {
    const run = fundRun(subject(hedged, value), exposure, 0.07, { fxChange: 3 });
    if ("kind" in run) throw new Error(run.kind);
    return run.market;
  };
  it("moves the principal currency by A-03 whether or not the fund neutralises it in its value; only the unhedged fund's return takes A-03", () => {
    expect(market(false, "USD")).toEqual({ grossReturn: 1.07 * 1.03 - 1, principalFxChange: 0.03 });
    expect(market(true, "USD")).toEqual({ grossReturn: 0.07, principalFxChange: 0.03 });
  });
  it("gives a status not known the index's currency as the candidate, on a foreign index only, and no path to a fund that is not one", () => {
    expect(market(true, null).principalFxChange).toBe(0.03);
    expect(market(false, null, { cash_like: false, currency: "ILS" }).principalFxChange).toBeUndefined();
    expect(market(false, false).principalFxChange).toBeUndefined();
  });
});

describe("fundRun: a Tel Aviv foreign fund's stated main currency (F-04, D84)", () => {
  const rec = loadFunds().find((f) => f.id === "1159250");
  const stated = rec?.tax_ruling?.index;
  if (!rec?.tax_ruling || stated?.basis !== "main-currency") throw new Error("the S&P 500's Tel Aviv line 1159250 and the main currency its annex states are in the data");
  const ruling = rec.tax_ruling;
  const run = (currency: string) => {
    const record = { ...rec, tax_ruling: { ...ruling, index: { ...stated, currency } } };
    const subject = { recordId: rec.id, name: "", number: rec.id, instrumentClass: "tase_foreign_fund_units", currency: rec.currency, exposureId: rec.exposure_id, fromP05: false, record };
    return () => fundRun(subject, { id: rec.exposure_id, cash_like: false, currency: rec.currency }, 0.07, {});
  };
  it("runs a fund whose annex states its own currency, and stops on one that states another", () => {
    expect(run(rec.currency)).not.toThrow();
    expect(run("EUR")).toThrow(`F-04: fund 1159250 states main currency EUR, not its own ${rec.currency}`);
  });
});
