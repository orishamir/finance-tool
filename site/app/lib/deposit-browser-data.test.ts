// The deposits page's offers from the real records: a deposit whose table prints a rate for each exit period shows the bank's one figure
// beside them (Mizrahi-Tefahot 189, read from its newest file, not an older one), and a deposit only for new joiners is limited.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";
import { cellOf, foldedOffers, interestOn, isLinked, offersOf, opens, sheetNames, unknownAt } from "./deposit-browser";
import { entered } from "./value";

describe("the deposits page's offers", () => {
  const data = buildDepositBrowser();
  const offer = (id: string) => data.offers.find((o) => o.id === id);

  it("shows Lychee's printed effective rate, with its doubt", () => {
    const o = offer("mizrahi-tefahot-litchi-kvua-shana-189");
    expect(o?.rate_offered.value).toBe(1.52);
    expect(o?.rate_offered.doubt).toBeTruthy();
  });

  it("opens Yahav's one-year fixed deposit at every amount, each tier from its own amount as the bank's fixed-rate board prints it (F-108)", () => {
    const y = offer("yahav-pikadon-leshana-kavua-from-50000")!;
    expect(y.amount_range.max?.value).toBe(100_000);
    expect(y.amount_range.max?.doubt).toBeFalsy();
    const names = sheetNames(data);
    const cell = (amount: number) => cellOf(data, "yahav", "y1", "fixed", amount, (o) => names.get(o.id)!);
    const tier = (from: number) => `yahav-pikadon-leshana-kavua-from-${from}`;
    // "מ-50,000", "מ-100,000", "מ-200,000": the amount a tier starts at is that tier's, not the one below
    for (const [amount, from, rate] of [[49_999, 1_000, 1.95], [50_000, 50_000, 2.15], [60_000, 50_000, 2.15], [99_999, 50_000, 2.15], [100_000, 100_000, 2.3], [199_999, 100_000, 2.3], [200_000, 200_000, 2.8]] as const) {
      expect(cell(amount).pick?.id, `${amount}`).toBe(tier(from));
      expect(cell(amount).pick?.rate_offered.value, `${amount}`).toBe(rate);
    }
    for (const from of [1_000, 50_000, 100_000, 200_000]) for (const amount of [50_000, 60_000, 100_000, 200_000]) expect(unknownAt(offer(tier(from))!, amount), `${from} at ${amount}`).toBe(false);
  });

  it("pays Mizrahi-Tefahot's 166 and 167 interest out monthly, so it does not compound: 4,000 ₪ and 6,000 ₪ on 100,000 ₪ (F-21)", () => {
    const on = (id: string, amount: number) => interestOn(offer(id)!, amount, entered(amount, "nis", "2026-11-14"), "2026-11-14")?.value;
    for (const [id, years] of [["mizrahi-tefahot-duvdevan-hodshi-kvua-2-shanim-166", 2], ["mizrahi-tefahot-duvdevan-hodshi-kvua-3-shanim-167", 3]] as const) {
      expect(offer(id)?.paidOut, id).toBe(true);
      expect(on(id, 100_000) as number, id).toBeCloseTo(100_000 * (offer(id)!.rate_offered.value as number) / 100 * years, 6);
    }
    expect(on("mizrahi-tefahot-duvdevan-hodshi-kvua-2-shanim-166", 100_000) as number).toBeCloseTo(4_000, 6);
    expect(on("mizrahi-tefahot-duvdevan-hodshi-kvua-3-shanim-167", 100_000) as number).toBeCloseTo(6_000, 6);
    // Yahav's one-year tiers at the amounts each starts from: 2.15% on 50,000 ₪, 2.30% on 100,000 ₪, 2.80% on 200,000 ₪
    expect(on("yahav-pikadon-leshana-kavua-from-50000", 50_000) as number).toBeCloseTo(1_075, 6);
    expect(on("yahav-pikadon-leshana-kavua-from-100000", 100_000) as number).toBeCloseTo(2_300, 6);
    expect(on("yahav-pikadon-leshana-kavua-from-200000", 200_000) as number).toBeCloseTo(5_600, 6);
  });

  it("pays Mizrahi-Tefahot's 332, two years at 1.00% beside 1.00%, at m = 1, since a whole m fits its pair: 201 ₪ on 10,000 ₪, 2,010 ₪ on 100,000 ₪ (F-21)", () => {
    const on = (amount: number) => interestOn(offer("mizrahi-tefahot-pomelit-madad-2-shanim-332")!, amount, entered(amount, "nis", "2026-11-14"), "2026-11-14")?.value as number;
    expect(offer("mizrahi-tefahot-pomelit-madad-2-shanim-332")?.rate_offered.value).toBe(1);
    expect(on(10_000)).toBeCloseTo(201, 6);
    expect(on(100_000)).toBeCloseTo(2_010, 6);
  });

  it("does not open Mizrahi-Tefahot's lower tier at the bound its table prints as not included, nor a tier at a bound two tiers print that no other table decides (F-108)", () => {
    const names = sheetNames(data);
    const cell = (bank: string, term: "y1" | "y2" | "m6" | "week" | "m1" | "m3", kind: "fixed" | "variable", amount: number) => cellOf(data, bank, term, kind, amount, (o) => names.get(o.id)!);
    // 261, "טווח סכום להפקדה (לא כולל)": 100,000 ₪ is the upper tier's (1.97%), not 30,000 to 100,000 (1.72%)
    const low261 = offer("mizrahi-tefahot-duvdevan-hodshi-prime-shana-261")!;
    expect(opens(low261, 100_000)).toBe(false);
    expect(opens(low261, 99_999)).toBe(true);
    expect(opens(offer("mizrahi-tefahot-duvdevan-hodshi-prime-shana-261-from-100000")!, 100_000)).toBe(true);
    // 259 at 50,000 ₪: the tier from 50,000 (2%), not the one up to it (1.15%)
    expect(opens(offer("mizrahi-tefahot-rimonim-rivoni-prime-2-shanim-259")!, 50_000)).toBe(false);
    expect(opens(offer("mizrahi-tefahot-rimonim-rivoni-prime-2-shanim-259-from-50000")!, 50_000)).toBe(true);
    // Yahav's fixed deposits: the fixed-rate board on p.1 starts each tier at the amount the 447 table prints twice, at the same rates,
    // so the amount opens the higher tier
    for (const [term, amount, rate] of [["m6", 50_000, 2], ["m6", 100_000, 2.2], ["m6", 49_999, 1.8], ["week", 50_000, 0.1], ["week", 500_000, 0.2], ["m1", 500_000, 0.15], ["m3", 500_000, 0.6], ["m3", 499_999, 0.55]] as const) {
      expect(cell("yahav", term, "fixed", amount).pick?.rate_offered.value, `${term} ${amount}`).toBe(rate);
      expect(offersOf(data, term, "fixed").filter((o) => o.bank === "yahav" && unknownAt(o, amount)), `${term} ${amount}`).toEqual([]);
    }
    // its prime-linked weekly deposit at 500,000 ₪: printed by two tiers, which no table the records read decides, unknown and never both open
    const both = offersOf(data, "week", "variable").filter((o) => o.bank === "yahav");
    expect(both.filter((o) => opens(o, 500_000))).toEqual([]);
    expect(both.some((o) => unknownAt(o, 500_000))).toBe(true);
    expect(cell("yahav", "week", "variable", 500_000)).toMatchObject({ pick: null, gap: "unknownAtAmount" });
  });

  it("folds the offers the amount does not open under the list's own two chips, and says where it does not know (F-108)", () => {
    const y1 = offersOf(data, "y1", "fixed");
    // Yahav's prime-linked weekly deposit: 500,000 ₪ is printed by two of its tiers; every one-year table decides 60,000 ₪
    expect(foldedOffers(offersOf(data, "week", "variable"), 500_000, { conditional: false, linked: false }).unknown).toBe(true);
    expect(foldedOffers(y1, 60_000, { conditional: false, linked: false }).unknown).toBe(false);
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
