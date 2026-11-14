// Every flag an engine run can raise has its words on the site (copy.ts `flags`): a figure's sheet shows the line beside the code, and a
// code with no line would show "הערה על החישוב:" and the bare code.
import { describe, expect, it } from "vitest";
import { RUN_FLAG_CODES } from "@finance-tool/engine";
import { flags } from "../copy";

describe("the flag lines", () => {
  it("has a line in copy.ts for every flag code an engine run can raise (RUN_FLAG_CODES)", () => {
    const missing = RUN_FLAG_CODES.filter((code) => !(code in flags) || !flags[code]!.trim());
    expect(missing).toEqual([]);
  });
});

describe("each line says what its rule says", () => {
  it("G-20: leaving commissions out of the gain is the site's choice, beside form 1325, which counts them (TXS-06)", () => {
    expect(flags["G-20"]).toContain("בחירה של האתר");
    expect(flags["G-20"]).toContain("1325");
    expect(flags["G-20"]).not.toContain("לא נמצא מקור");
  });

  it("G-39: a makam's commissions against its discount at redemption are not in the rule base, with no claim the tax is high", () => {
    expect(flags["G-39"]).toContain("דמי הניכיון");
    expect(flags["G-39"]).not.toContain("1325");
    expect(flags["G-39"]).not.toContain("גבוה");
  });

  it("G-09: the makam discount is taxed at TXI-11's 15%, with no conflict left to state", () => {
    expect(flags["G-09"]).toContain("15%");
    expect(flags["G-09"]).not.toContain("20%");
  });

  it("TXF-21 is a distribution's advance by 30 April, and TXF-22 a sale's report and advance by 31 July and 31 January", () => {
    expect(flags["TXF-21"]).toContain("30 באפריל");
    expect(flags["TXF-21"]).not.toContain("רווחי הון");
    expect(flags["TXF-22"]).toContain("31 ביולי");
    expect(flags["TXF-22"]).toContain("31 בינואר");
    expect(flags["TXF-22"]).not.toContain("30 באפריל");
  });

  it("G-03 names commuting the part above the minimum annuity (PEN-28)", () => {
    expect(flags["G-03"]).toContain("סכום הקצבה המזערי");
    expect(flags["G-03"]).toContain("להוון");
  });

  it("G-10 gives the accrued-interest payment as the site's assumption (TXI OQ5)", () => {
    expect(flags["G-10"]).toContain("האתר מניח");
  });

  it("TXF-27 labels a trust-form fund's US situs as the site's reading with gaps", () => {
    expect(flags["TXF-27"]).toContain("נאמנות");
    expect(flags["TXF-27"]).toContain("קריאה של האתר");
  });

  it("G-23 excepts the cases TXG-05 names where credit points are limited", () => {
    expect(flags["G-23"]).toContain("מוגבלות");
  });
});
