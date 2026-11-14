// What a toolbox card does (`applyTool`), by tap or drop alike: a thing to change by asks its question, a part that needs its figure asks
// for it, a form of the price goes through the page, and any other part goes on the price at once, handed to `onPart` with the fee as it
// now is and the part and the price it went on, where the page puts the focus.
import { describe, expect, it } from "vitest";
import { newFee, type Fee } from "../../lib/fee-deal/model";
import { setPart } from "../../lib/fee-deal/offers/parts";
import { applyTool, type ToolHands } from "./toolbox";

/** Hands that keep every call. */
function hands() {
  const calls: { hand: keyof ToolHands; args: unknown[] }[] = [];
  const h: ToolHands = {
    onAsk: (...args) => void calls.push({ hand: "onAsk", args }),
    onPending: (...args) => void calls.push({ hand: "onPending", args }),
    onForm: (...args) => void calls.push({ hand: "onForm", args }),
    onPart: (...args) => void calls.push({ hand: "onPart", args }),
  };
  return { h, calls };
}

describe("applyTool", () => {
  const trade: Fee = newFee("trade");

  it("hands onPart the fee with the part on the purchase's price it acts on, and that part, side and price", () => {
    for (const part of ["partial", "sale", "discount"] as const) {
      const { h, calls } = hands();
      applyTool(part, trade, null, 0, h);
      expect(calls.map((c) => c.hand), part).toEqual(["onPart"]);
      const [next, at] = calls[0]!.args as [Fee, unknown];
      expect(next, part).toEqual(setPart(trade, part, true, { side: "buy", k: 0 }));
      expect(next, part).not.toEqual(trade);
      expect(at, part).toEqual({ part, side: "buy", k: 0 });
    }
  });

  it("puts it on the case named, and on the price named", () => {
    const { h, calls } = hands();
    applyTool("partial", trade, "case-2", 1, h);
    const [next, at] = calls[0]!.args as [Fee, unknown];
    expect(next).toEqual(setPart(trade, "partial", true, { side: "buy", k: 1, caseId: "case-2" }));
    expect(at).toEqual({ part: "partial", side: "buy", k: 1 });
  });

  it("asks a thing's question, a part's figure, and a form through the page, none of them through onPart", () => {
    for (const [item, hand, arg] of [["by:track", "onAsk", "track"], ["min", "onPending", "min"], ["perUnit", "onForm", "perUnit"]] as const) {
      const { h, calls } = hands();
      applyTool(item, trade, null, 0, h);
      expect(calls, item).toEqual([{ hand, args: [arg] }]);
    }
  });
});
