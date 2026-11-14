// A fee copied from another house's price list (templates.ts, `copyHouseFee`): beside the deal's fees, read as a second fee of its kind,
// or in place of the deal's fee of that kind; as the list prints it, with its sources. Only a securities account's deal has price lists.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { newDeal, type FeeDeal } from "./model";
import { averagesOfFees, copyHouseFee, dealFromTemplate, feeAlone, housesToCopy, leftOfFees, templateOf, type LeftOut } from "./templates";
import { capacity } from "./offers/capacity";
import { readDealFor } from "./deal-read";

const data = feesData();
const TODAY = "2026-11-14";

describe("a fee copied from another price list", () => {
  it("carries each fee's own list's maximum on the whole deposit, as its maximum of holding", () => {
    const maxOf = (deal: FeeDeal, id: string) => [...JSON.stringify(deal.fees.find((f) => f.id === id)).matchAll(/"max":\{"v":(\d+)/g)].map((m) => Number(m[1]));
    const deal = fibi();
    const custody = deal.fees.find((f) => f.kind === "custody")!;
    expect(maxOf(deal, custody.id)).toContain(10000);
    // FIBI's custody replaced from a list that prints no maximum per deposit takes it away; Leumi's brings its own
    const discount = copyHouseFee(deal, "house:discount", "custody", "replace", data)!.deal;
    expect(maxOf(discount, custody.id)).toEqual([]);
    const leumi = copyHouseFee(discount, "house:leumi", "custody", "beside", data)!;
    expect(maxOf(leumi.deal, leumi.feeId)).toContain(11500);
  });

  it("lists what each fee's own list left out: a fee copied from another house brings that house's lines of its kind, in place of the template's", () => {
    const deal = fibi();
    const t = templateOf(deal, deal.template!.id, data, TODAY)!;
    const kindsOf = (left: LeftOut[]) => left.filter((x): x is Extract<LeftOut, { line: string }> => "line" in x);
    expect(kindsOf(leftOfFees(deal, t.left, data)).some((x) => x.line.startsWith("fibi-") && x.base === "trade")).toBe(true);
    const leumi = copyHouseFee(deal, "house:leumi", "trade", "replace", data)!.deal;
    const left = kindsOf(leftOfFees(leumi, t.left, data));
    expect(left.some((x) => x.line.startsWith("fibi-") && x.base === "trade")).toBe(false);
    expect(left.filter((x) => x.line.startsWith("leumi-") && x.base === "trade")).toHaveLength(data.houses.find((h) => h.id === "leumi")!.left.filter((l) => l.base === "trade").length);
    // the other kinds keep the template's lines
    expect(left.some((x) => x.line.startsWith("fibi-") && x.base === "fx")).toBe(true);
  });

  it("shows the template's averages for the kinds its own fees are of, and none for a fee copied from another list (F-122)", () => {
    const deal = fibi();
    const t = templateOf(deal, deal.template!.id, data, TODAY)!;
    const cols = (a: ReturnType<typeof averagesOfFees>) => [...new Set(a?.columns.map((c) => c.column.fee))];
    expect(cols(averagesOfFees(deal, t.averages))).toEqual(["trade", "custody"]);
    // FIBI's custody replaced by Leumi's: FIBI's custody columns go, and Leumi's are not shown
    const leumi = copyHouseFee(deal, "house:leumi", "custody", "replace", data)!.deal;
    expect(cols(averagesOfFees(leumi, t.averages))).toEqual(["trade"]);
    // beside the template's own custody, its custody columns stay
    const beside = copyHouseFee(deal, "house:leumi", "custody", "beside", data)!.deal;
    expect(cols(averagesOfFees(beside, t.averages))).toEqual(["trade", "custody"]);
    // both kinds from other lists: no line
    const none = copyHouseFee(leumi, "house:leumi", "trade", "replace", data)!.deal;
    expect(averagesOfFees(none, t.averages)).toBeUndefined();
  });

  it("never adds a second fee of a kind the law caps beside the first: only replaces it", () => {
    const deal = fibi();
    const capped = data.kinds.flatMap((k) => Object.values(k.caps)).find((c) => c && typeof c.value === "number");
    const base = capacity("trade").base!;
    const kinds = data.kinds.map((k) => (k.id === "brokerage-account" ? { ...k, caps: { ...k.caps, [base]: capped! } } : k));
    expect(feeAlone(deal, "trade", { kinds })).toBe(true);
    expect(copyHouseFee(deal, "house:jerusalem", "trade", "beside", { houses: data.houses, kinds })).toBeNull();
    expect(copyHouseFee(deal, "house:jerusalem", "trade", "replace", { houses: data.houses, kinds })).not.toBeNull();
    expect(feeAlone(deal, "trade", data)).toBe(false);
  });

  it("drops a pick of a thing only the replaced fee changed by", () => {
    // FIBI's conversion changes by the channel; Excellence's by nothing, and no other fee here changes by the channel
    const deal: FeeDeal = { ...fibi(), readFor: [{ by: "channel", is: "branch" }] };
    const only: FeeDeal = { ...deal, fees: deal.fees.filter((f) => f.kind === "fx") };
    const r = copyHouseFee(only, "house:excellence", "fx", "replace", data)!;
    expect(r.deal.readFor).toBeUndefined();
    // a pick another fee still changes by stays
    const kept = copyHouseFee(deal, "house:excellence", "fx", "replace", data)!;
    expect(kept.deal.readFor).toEqual([{ by: "channel", is: "branch" }]);
  });


  const fibi = (): FeeDeal => dealFromTemplate(newDeal("brokerage-account"), "house:fibi", data, TODAY)!;

  it("lists the houses with the fees each prints, for a securities account alone", () => {
    const houses = housesToCopy(fibi(), data);
    expect(houses.find((h) => h.id === "house:jerusalem")?.kinds).toContain("trade");
    expect(housesToCopy(newDeal("kupat-gemel-lehashkaa"), data)).toEqual([]);
  });

  it("adds it beside the deal's fee of its kind, as the list prints it, the two read as two fees", () => {
    const deal = fibi();
    const r = copyHouseFee(deal, "house:jerusalem", "trade", "beside", data)!;
    const trades = r.deal.fees.filter((f) => f.kind === "trade");
    expect(trades).toHaveLength(2);
    expect(trades[1]!.id).toBe(r.feeId);
    const jer = data.houses.find((h) => h.id === "jerusalem")!.fees.find((f) => f.kind === "trade")!;
    const { id: _i, house, ...copied } = trades[1]!;
    expect(copied).toEqual(jer);
    expect(house).toBe("house:jerusalem");
    expect(readDealFor(r.deal, data.kinds, TODAY).fees.filter((f) => f.kind === "trade").length).toBe(2);
  });

  it("replaces the deal's fee of its kind in its place, keeping its id", () => {
    const deal = fibi();
    const was = deal.fees.find((f) => f.kind === "trade")!;
    const r = copyHouseFee(deal, "house:jerusalem", "trade", "replace", data)!;
    expect(r.feeId).toBe(was.id);
    expect(r.deal.fees.filter((f) => f.kind === "trade")).toHaveLength(1);
    expect(r.deal.fees.findIndex((f) => f.id === was.id)).toBe(deal.fees.findIndex((f) => f.id === was.id));
    expect(copyHouseFee(deal, "house:nobody", "trade", "beside", data)).toBeNull();
  });
});
