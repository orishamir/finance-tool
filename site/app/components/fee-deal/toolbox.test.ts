// What a toolbox card does at its place (`applyTool`), by tap or drop alike: a thing to change by asks its question, a part that needs its
// figure asks for it there (a later price its month, at its side), a charge goes through the page onto the price, and any other part goes
// on at once, handed to `onPart` with the fee as it now is and the part and the price it went on, where the page puts the focus.
import { describe, expect, it } from "vitest";
import { newFee, type Fee } from "../../lib/fee-deal/model";
import { setPart } from "../../lib/fee-deal/offers/parts";
import type { Place } from "../../lib/fee-deal/places";
import { applyTool, type ToolHands } from "./toolbox";

/** Hands that keep every call. */
function hands() {
  const calls: { hand: keyof ToolHands; args: unknown[] }[] = [];
  const h: ToolHands = {
    onAsk: (...args) => void calls.push({ hand: "onAsk", args }),
    onPending: (...args) => void calls.push({ hand: "onPending", args }),
    onCharge: (...args) => void calls.push({ hand: "onCharge", args }),
    onPart: (...args) => void calls.push({ hand: "onPart", args }),
  };
  return { h, calls };
}

const first: Place = { on: "price", side: "buy", k: 0 };

describe("applyTool", () => {
  const trade: Fee = newFee("trade");

  it("hands onPart the fee with the part at its place, and that part, side and price", () => {
    for (const [part, place] of [["partial", first], ["discount", first], ["sale", { on: "fee" }]] as const) {
      const { h, calls } = hands();
      applyTool(part, trade, null, place, h);
      expect(calls.map((c) => c.hand), part).toEqual(["onPart"]);
      const [next, at] = calls[0]!.args as [Fee, unknown];
      expect(next, part).toEqual(setPart(trade, part, true, place.on === "price" ? { side: "buy", k: 0 } : {}));
      expect(next, part).not.toEqual(trade);
      expect(at, part).toEqual({ part, side: "buy", k: 0 });
    }
  });

  it("puts it on the case named, and on the price named", () => {
    const { h, calls } = hands();
    applyTool("partial", trade, "case-2", { on: "price", side: "sell", k: 1 }, h);
    const [next, at] = calls[0]!.args as [Fee, unknown];
    expect(next).toEqual(setPart(trade, "partial", true, { side: "sell", k: 1, caseId: "case-2" }));
    expect(at).toEqual({ part: "partial", side: "sell", k: 1 });
  });

  it("asks a thing's question, a part's figure or month at its place, and a charge through the page, none of them through onPart", () => {
    const side: Place = { on: "side", side: "sell" };
    for (const [item, hand, args, place] of [["by:track", "onAsk", ["track"], { on: "fee" }], ["min", "onPending", ["min", first], first], ["until", "onPending", ["until", side], side], ["perUnit", "onCharge", ["perUnit", first], first]] as const) {
      const { h, calls } = hands();
      applyTool(item, trade, null, place, h);
      expect(calls, item).toEqual([{ hand, args }]);
    }
  });
});
