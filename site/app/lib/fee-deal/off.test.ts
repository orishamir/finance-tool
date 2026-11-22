// The fees switched off for a visit (off.ts): the deal as it is counted drops exactly the off fees and nothing else, the store keeps no id
// of a fee taken away past the next switch, and a reset brings every fee back on. No Hebrew.
import { afterEach, describe, expect, it, vi } from "vitest";
import { feesData } from "../fees.server";
import { newDeal, newFee, type Fee, type FeeDeal } from "./model";
import { countedDeal, feesOff, isFeeOff } from "./off";
import { readDealFor } from "./deal-read";
import { feeOf } from "./cases";
import { readingOf } from "./reading";
import { fillDeal } from "./templates";

const data = feesData();
const TODAY = "2026-11-01";

const dealOf = (id: string, kinds: Parameters<typeof newFee>[0][]): FeeDeal => ({ ...newDeal("brokerage-account"), id, fees: kinds.map((k) => newFee(k)) });

/** The `k`th fee of a deal, which the test made. */
const feeAt = (deal: FeeDeal, k: number): Fee => {
  const f = deal.fees[k];
  if (!f) throw new Error(`deal ${deal.id} has a fee at ${k}`);
  return f;
};

/** The ids switched off of deal `dealId`. */
const offIds = (dealId: string): string[] => [...(feesOff.get().get(dealId) ?? [])];

afterEach(() => feesOff.reset());

describe("the deal as it is counted", () => {
  it("drops exactly the fees switched off, in the order the rest stand, and keeps everything else of the deal", () => {
    const deal = { ...dealOf("deal-a", ["trade", "custody", "fx"]), readFor: [{ by: "what", is: "us" }] };
    const [trade, custody, fx] = [feeAt(deal, 0), feeAt(deal, 1), feeAt(deal, 2)];
    feesOff.set(deal, custody.id, true);
    const counted = countedDeal(deal, feesOff.get());
    expect(counted.fees.map((f) => f.id)).toEqual([trade.id, fx.id]);
    expect(counted.fees[0]).toBe(trade);
    const { fees: _a, ...rest } = counted;
    const { fees: _b, ...whole } = deal;
    expect(rest).toEqual(whole);
    // the deal itself is never changed
    expect(deal.fees).toHaveLength(3);
  });

  it("is the same deal where none of its fees is off, whatever other deals have off", () => {
    const a = dealOf("deal-a", ["trade", "custody"]);
    const b = dealOf("deal-b", ["trade"]);
    feesOff.set(b, feeAt(b, 0).id, true);
    expect(countedDeal(a, feesOff.get())).toBe(a);
    expect(countedDeal(b, feesOff.get()).fees).toEqual([]);
  });

  it("is read as a deal without those fees, and a reading with every fee off is read", () => {
    const deal = fillDeal({ ...newDeal("brokerage-account", "psagot"), id: "deal-psagot" }, "house:psagot", data, TODAY);
    const custody = deal?.fees.find((f) => f.kind === "custody");
    if (!deal || !custody) throw new Error("Psagot's list fills a deal with custody");
    feesOff.set(deal, custody.id, true);
    const read = readDealFor(countedDeal(deal, feesOff.get()), data.kinds, TODAY);
    expect(read.deal.fees.some((f) => f.id === custody.id)).toBe(false);
    expect(read.fees.some((f) => feeOf(f) === custody.id)).toBe(false);
    for (const f of deal.fees) feesOff.set(deal, f.id, true);
    const none = readDealFor(countedDeal(deal, feesOff.get()), data.kinds, TODAY);
    expect(none.fees).toEqual([]);
    expect(() => readingOf(none, data.fx)).not.toThrow();
  });
});

describe("the store of fees switched off", () => {
  it("switches a fee off and back on, telling each listener", () => {
    const deal = dealOf("deal-a", ["trade", "custody"]);
    const heard = vi.fn();
    const stop = feesOff.subscribe(heard);
    const [trade, custody] = [feeAt(deal, 0), feeAt(deal, 1)];
    feesOff.set(deal, custody.id, true);
    expect(isFeeOff(feesOff.get(), deal.id, custody.id)).toBe(true);
    expect(isFeeOff(feesOff.get(), deal.id, trade.id)).toBe(false);
    feesOff.set(deal, custody.id, false);
    expect(isFeeOff(feesOff.get(), deal.id, custody.id)).toBe(false);
    expect(feesOff.get().has(deal.id)).toBe(false);
    expect(heard).toHaveBeenCalledTimes(2);
    stop();
  });

  it("drops the id of a fee taken away from the deal at the next switch, and never switches off a fee the deal lacks", () => {
    const deal = dealOf("deal-a", ["trade", "custody", "fx"]);
    const [trade, custody, fx] = [feeAt(deal, 0), feeAt(deal, 1), feeAt(deal, 2)];
    feesOff.set(deal, custody.id, true);
    const without = { ...deal, fees: [trade, fx] };
    feesOff.set(without, fx.id, true);
    expect(offIds(deal.id)).toEqual([fx.id]);
    feesOff.set(without, "fee-not-there", true);
    expect(offIds(deal.id)).toEqual([fx.id]);
  });

  it("gives a new snapshot on each switch and keeps the old one as it was", () => {
    const deal = dealOf("deal-a", ["trade"]);
    const before = feesOff.get();
    feesOff.set(deal, feeAt(deal, 0).id, true);
    expect(feesOff.get()).not.toBe(before);
    expect(before.size).toBe(0);
  });

  it("resets to every fee on, telling each listener", () => {
    const a = dealOf("deal-a", ["trade"]);
    const b = dealOf("deal-b", ["custody"]);
    feesOff.set(a, feeAt(a, 0).id, true);
    feesOff.set(b, feeAt(b, 0).id, true);
    const heard = vi.fn();
    const stop = feesOff.subscribe(heard);
    feesOff.reset();
    expect(feesOff.get().size).toBe(0);
    expect(countedDeal(a, feesOff.get())).toBe(a);
    expect(heard).toHaveBeenCalledTimes(1);
    stop();
  });
});
