// A fee duplicated from its closed card or its grip's menu (edits/deal.ts, `duplicateFee`): a copy of all it holds under a new id, right
// after it, refused past the fees a deal may hold.
import { describe, expect, it } from "vitest";
import { duplicateFee } from "./edits/deal";
import { FEES_MAX } from "./limits";
import { typed, type FeeDeal } from "./model";

const deal = (): FeeDeal => ({
  id: "deal-d",
  name: "",
  kind: "brokerage-account",
  fees: [
    { id: "fee-a", kind: "trade", rank: 1, house: "leumi", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(20) } }] },
    { id: "fee-b", kind: "custody", rank: 0, stages: [{ price: { form: "free" } }] },
  ],
} as FeeDeal);

describe("a fee duplicated", () => {
  it("stands right after it, holding all it holds under a new id, its place among the person's order kept", () => {
    const r = duplicateFee(deal(), "fee-a")!;
    expect(r.deal.fees.map((f) => f.id)).toEqual(["fee-a", r.feeId, "fee-b"]);
    const { id, ...copy } = r.deal.fees[1]!;
    const { id: _id, ...original } = deal().fees[0]!;
    expect(id).not.toBe("fee-a");
    expect(copy).toEqual(original);
    // a copy, not the same object: changing one leaves the other
    expect(r.deal.fees[1]!.stages).not.toBe(r.deal.fees[0]!.stages);
  });
  it("is refused for a fee the deal does not have, and past the fees a deal may hold", () => {
    expect(duplicateFee(deal(), "fee-x")).toBeNull();
    const full: FeeDeal = { ...deal(), fees: Array.from({ length: FEES_MAX }, (_, k) => ({ ...deal().fees[1]!, id: `fee-${k}` })) };
    expect(duplicateFee(full, "fee-0")).toBeNull();
  });
});
