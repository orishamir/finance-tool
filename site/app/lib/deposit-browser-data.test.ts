// The deposits page's offers from the real records: a deposit whose table prints a rate for each exit period shows the bank's one figure
// beside them (Mizrahi-Tefahot 189, read from its newest file, not an older one), and a deposit only for new joiners is limited.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";
import { cellOf, foldedOffers, isLinked, offersOf, opens, sheetNames, unknownAt } from "./deposit-browser";

describe("the deposits page's offers", () => {
  const data = buildDepositBrowser();
  const offer = (id: string) => data.offers.find((o) => o.id === id);

  it("shows Lychee's printed effective rate, with its doubt", () => {
    const o = offer("mizrahi-tefahot-litchi-kvua-shana-189");
    expect(o?.rate_offered.value).toBe(1.52);
    expect(o?.rate_offered.doubt).toBeTruthy();
  });

  it("says Yahav's one-year fixed deposit is unknown above 50,000 ₪, where its table prints the top short of a digit, never closed (F-108)", () => {
    const y = offer("yahav-pikadon-leshana-kavua-from-50000")!;
    expect(y.amount_range.max?.value).toBeNull();
    expect(y.amount_range.max?.doubt).toBeTruthy();
    expect(unknownAt(y, 60_000)).toBe(true);
    const names = sheetNames(data);
    const cell = (amount: number) => cellOf(data, "yahav", "y1", "fixed", amount, (o) => names.get(o.id)!);
    expect(cell(60_000)).toMatchObject({ pick: null, gap: "unknownAtAmount" });
    expect(cell(99_999)).toMatchObject({ pick: null, gap: "unknownAtAmount" });
    // the tiers on either side whose bounds are known open as before
    expect(cell(40_000).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-1000");
    expect(cell(150_000).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-100000");
    // 50,000 ₪ itself is printed by two tiers, "1,000 עד 50,000" and "50,000 עד 100,00": the table does not say which takes it
    expect(cell(50_000)).toMatchObject({ pick: null, gap: "unknownAtAmount" });
    expect(cell(49_999).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-1000");
  });

  it("does not open Mizrahi-Tefahot's lower tier at the bound its table prints as not included, nor any Yahav tier at a bound two tiers print (F-108)", () => {
    const names = sheetNames(data);
    const cell = (bank: string, term: "y1" | "y2" | "m6" | "week", kind: "fixed" | "variable", amount: number) => cellOf(data, bank, term, kind, amount, (o) => names.get(o.id)!);
    // 261, "טווח סכום להפקדה (לא כולל)": 100,000 ₪ is the upper tier's (1.97%), not 30,000 to 100,000 (1.72%)
    const low261 = offer("mizrahi-tefahot-duvdevan-hodshi-prime-shana-261")!;
    expect(opens(low261, 100_000)).toBe(false);
    expect(opens(low261, 99_999)).toBe(true);
    expect(opens(offer("mizrahi-tefahot-duvdevan-hodshi-prime-shana-261-from-100000")!, 100_000)).toBe(true);
    // 259 at 50,000 ₪: the tier from 50,000 (2%), not the one up to it (1.15%)
    expect(opens(offer("mizrahi-tefahot-rimonim-rivoni-prime-2-shanim-259")!, 50_000)).toBe(false);
    expect(opens(offer("mizrahi-tefahot-rimonim-rivoni-prime-2-shanim-259-from-50000")!, 50_000)).toBe(true);
    // Yahav's six-month fixed deposit at 50,000 and 100,000 ₪: printed by two tiers each, unknown, never both open
    for (const amount of [50_000, 100_000]) {
      const both = offersOf(data, "m6", "fixed").filter((o) => o.bank === "yahav");
      expect(both.filter((o) => opens(o, amount))).toEqual([]);
      expect(both.some((o) => unknownAt(o, amount))).toBe(true);
      expect(cell("yahav", "m6", "fixed", amount)).toMatchObject({ pick: null, gap: "unknownAtAmount" });
    }
  });

  it("folds the offers the amount does not open under the list's own two chips, and says where it does not know (F-108)", () => {
    const y1 = offersOf(data, "y1", "fixed");
    expect(foldedOffers(y1, 60_000, { conditional: false, linked: false }).unknown).toBe(true);
    // 100 ₪ opens few: the fold holds linked offers and offers only some may open, and loses them with their chips off
    const all = foldedOffers(y1, 100, { conditional: true, linked: true });
    expect(all.offers.some(isLinked)).toBe(true);
    expect(all.offers.some((o) => o.limited)).toBe(true);
    const plain = foldedOffers(y1, 100, { conditional: false, linked: false });
    expect(plain.offers.length).toBeGreaterThan(0);
    expect(plain.offers.some(isLinked)).toBe(false);
    expect(plain.offers.some((o) => o.limited)).toBe(false);
    // at 10,000 ₪ every table decides the amount
    expect(foldedOffers(y1, 10_000, { conditional: true, linked: true }).unknown).toBe(false);
  });

  it("says One Zero's one-year fixed cell has a rate only with a condition, never that the bank has only a variable one (F-108)", () => {
    const names = sheetNames(data);
    const cell = cellOf(data, "one-zero", "y1", "fixed", 10_000, (o) => names.get(o.id)!);
    expect(cell).toMatchObject({ pick: null, gap: "conditionalOnly" });
    // the variable kind is open to everyone there, and a bank with no record of a term is still "לא מציע"
    expect(cellOf(data, "one-zero", "y1", "variable", 10_000, (o) => names.get(o.id)!).pick).not.toBeNull();
    expect(cellOf(data, "one-zero", "day", "fixed", 10_000, (o) => names.get(o.id)!).gap).toBe("none");
  });

  it("limits One Zero's deposit for new joiners, and only it of One Zero's", () => {
    expect(offer("one-zero-hisachon-shnati-kvua-12m")?.limited).toBe(true);
    expect(offer("one-zero-hisachon-shnati-mishtana-12m")?.limited).toBe(false);
    expect(offer("one-zero-hisachon-yomi-12m")?.limited).toBe(false);
  });
});
