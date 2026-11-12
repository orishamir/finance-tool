// A deposit's words, one form on every page that shows it: the amount range (wording.md: a range with "עד", the shekel sign once at its
// end), the break, the renewal and the tax.
import { describe, expect, it } from "vitest";
import { r4catalogue } from "../copy";
import { amountRangeForm, amountRangeText, breakText, renewText, taxWord } from "./deposit-kind";

describe("a deposit's amount range", () => {
  it("says a bottom and a top as one range with עד", () => {
    expect(amountRangeText(1000, 50000)).toBe("1,000 עד 50,000 ₪");
    expect(amountRangeText(1000, null)).toBe("מ־1,000 ₪");
    expect(amountRangeText(0, 50000)).toBe("עד 50,000 ₪");
    expect(amountRangeText(null, 50000)).toBe("עד 50,000 ₪");
  });
  it("says no bottom and no top as no minimum, never from zero", () => {
    expect(amountRangeForm(0, null)).toBe("none");
    expect(amountRangeText(0, null)).toBe(r4catalogue.amount.noMin);
    expect(amountRangeText(null, null)).toBe(r4catalogue.amount.noMin);
  });
  it("says ranges that follow one another by where each starts", () => {
    expect(amountRangeText(100000, 249999, true)).toBe("מ־100,000 ₪");
    expect(amountRangeText(0, 99999, true)).toBe("עד 99,999 ₪");
  });
});

describe("a deposit's break, renewal and tax", () => {
  it("says where the money comes out of a deposit that cannot be broken but has exits", () => {
    expect(breakText("not_allowed", true)).toBe(r4catalogue.breakAtExits);
    expect(breakText("not_allowed", false)).toBe(r4catalogue.breakWord.not_allowed);
    expect(breakText("with_penalty", true)).toBe(r4catalogue.breakWord.with_penalty);
  });
  it("says a renewal with its number of times", () => {
    expect(renewText(false, null)).toBe(r4catalogue.autoRenewWord.no);
    expect(renewText(true, null)).toBe(r4catalogue.autoRenewWord.yes);
    expect(renewText(true, 3)).toBe("עד 3 פעמים");
  });
  it("gives an empty tax bucket no word", () => {
    expect(taxWord("unlinked_15")).toBe(r4catalogue.tax.unlinked);
    expect(taxWord("linked_25")).toBe(r4catalogue.tax.linked);
    expect(taxWord(null)).toBeUndefined();
  });
});
