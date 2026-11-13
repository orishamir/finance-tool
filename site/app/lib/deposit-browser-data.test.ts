// The deposits page's offers from the real records: a deposit whose table prints a rate for each exit period shows the bank's one figure
// beside them (Mizrahi-Tefahot 189, read from its newest file, not an older one), and a deposit only for new joiners is limited.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";
import { cellOf, foldedOffers, isLinked, offersOf, sheetNames, unknownAt } from "./deposit-browser";

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
    // the minimum itself, and the tiers on either side whose bounds are known, open as before
    expect(cell(50_000).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-50000");
    expect(cell(40_000).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-1000");
    expect(cell(150_000).pick?.id).toBe("yahav-pikadon-leshana-kavua-from-100000");
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
