// A word with senses in several products opens its sense in the product the page is about: the deposits page's "תחנות יציאה" "?" opened
// the child savings card (a date every few years to switch tracks) instead of the deposit's (a date to take the money out without breaking it).
import { describe, expect, it } from "vitest";
import { HELP_TERMS, KIND_TERMS } from "./deposit-browser";
import { termsFor } from "./data.server";

describe("termsFor", () => {
  it("takes each word's sense in the product asked for", () => {
    const deposit = termsFor([HELP_TERMS.exits], "bank-deposit")[HELP_TERMS.exits];
    const child = termsFor([HELP_TERMS.exits], "child-savings-bank")[HELP_TERMS.exits];
    expect(deposit?.wrapperIds).toContain("bank-deposit");
    expect(child?.wrapperIds).toContain("child-savings-bank");
    expect(deposit?.explanation).not.toBe(child?.explanation);
  });

  it("gives the deposits page a deposit card for every word it opens", () => {
    const words = [...Object.values(HELP_TERMS), ...KIND_TERMS];
    const terms = termsFor(words, "bank-deposit");
    for (const w of words) expect(terms[w], w).toBeDefined();
    for (const w of words) expect(terms[w]!.wrapperIds, w).toContain("bank-deposit");
  });
});
