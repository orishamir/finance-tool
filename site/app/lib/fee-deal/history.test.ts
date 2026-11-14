// The fee page's history of a deal's changes (history.ts): steps back and ahead, the cap, a name's keystrokes as one step, no step for a
// change that changes nothing, and the keys that ask for it.
import { describe, expect, it } from "vitest";
import { emptyHistory, HISTORY_MAX, historyKey, recorded, stepAhead, stepBack, type History, type Step } from "./history";
import { typed, type FeeDeal } from "./model";

const deal = (rate: number, name = "", feeName?: string): FeeDeal => ({
  id: "deal-h",
  name,
  kind: "brokerage-account",
  fees: [
    { id: "fee-a", kind: "trade", ...(feeName !== undefined ? { name: feeName } : {}), stages: [{ price: { form: "action", rate: typed(rate) } }] },
    { id: "fee-b", kind: "custody", stages: [{ price: { form: "free" } }] },
  ],
});
const at = (d: FeeDeal, chosen: string | null = "fee-a"): Step => ({ deal: d, chosen });

/** Changes made one after another from `first`, as the page records them (each with the field it was typed in, if any). */
function made(first: FeeDeal, ...next: (FeeDeal | [FeeDeal, string])[]): { h: History; now: FeeDeal } {
  let h = emptyHistory;
  let now = first;
  for (const x of next) {
    const [d, typing] = Array.isArray(x) ? x : [x, null];
    h = recorded(h, at(now), d, typing);
    now = d;
  }
  return { h, now };
}

describe("a deal's history", () => {
  it("steps back through its changes one by one and ahead again", () => {
    const { h, now } = made(deal(0.1), deal(0.2), deal(0.3));
    const b1 = stepBack(h, at(now))!;
    expect(b1.to.deal).toEqual(deal(0.2));
    const b2 = stepBack(b1.h, b1.to)!;
    expect(b2.to.deal).toEqual(deal(0.1));
    expect(stepBack(b2.h, b2.to)).toBeNull();
    const a1 = stepAhead(b2.h, b2.to)!;
    expect(a1.to.deal).toEqual(deal(0.2));
    const a2 = stepAhead(a1.h, a1.to)!;
    expect(a2.to.deal).toEqual(deal(0.3));
    expect(stepAhead(a2.h, a2.to)).toBeNull();
  });

  it("puts back the fee chosen at each step", () => {
    const h = recorded(emptyHistory, at(deal(0.1), "fee-b"), deal(0.2));
    expect(stepBack(h, at(deal(0.2), "fee-a"))!.to.chosen).toBe("fee-b");
  });

  it("drops the steps ahead once a new change is made after a step back", () => {
    const { h, now } = made(deal(0.1), deal(0.2), deal(0.3));
    const back = stepBack(h, at(now))!;
    const after = recorded(back.h, back.to, deal(0.9));
    expect(after.ahead).toEqual([]);
    expect(stepAhead(after, at(deal(0.9)))).toBeNull();
  });

  it("keeps at most HISTORY_MAX steps, the oldest falling off", () => {
    const steps = Array.from({ length: HISTORY_MAX + 20 }, (_, k) => deal(k + 1));
    const { h } = made(deal(0), ...steps);
    expect(h.back).toHaveLength(HISTORY_MAX);
    expect(h.back[0]!.deal).toEqual(deal(20));
  });

  it("records no step for a change that changes nothing, or only the day it was saved", () => {
    expect(recorded(emptyHistory, at(deal(0.1)), deal(0.1))).toBe(emptyHistory);
    expect(recorded(emptyHistory, at(deal(0.1)), { ...deal(0.1), saved: "2026-11-15" })).toBe(emptyHistory);
  });

  it("takes what is typed into one field while it keeps the focus as one step, and a change between two runs as its own", () => {
    const { h, now } = made(deal(0.1), [deal(0.1, "ע"), "f1"], [deal(0.1, "עס"), "f1"], [deal(0.1, "עסק"), "f1"]);
    expect(h.back).toHaveLength(1);
    expect(stepBack(h, at(now))!.to.deal.name).toBe("");
    // a figure that changes the deal as it is typed: 0, 0.7 in one focus, then a drop, then the same field focused again
    const runs = made(deal(0.3), [deal(0), "f2"], [deal(0.7), "f2"], deal(0.7, "", "x"), [deal(0.8, "", "x"), "f2"], [deal(0.9, "", "x"), "f3"]);
    expect(runs.h.back.map((s) => [(s.deal.fees[0]!.stages![0]!.price as { rate: { v: number } }).rate.v, s.deal.fees[0]!.name])).toEqual([
      [0.3, undefined],
      [0.7, undefined],
      [0.7, "x"],
      [0.8, "x"],
    ]);
  });

  it("puts back a fee taken away, with its place, by a step back", () => {
    const gone: FeeDeal = { ...deal(0.1), fees: [deal(0.1).fees[1]!] };
    const h = recorded(emptyHistory, at(deal(0.1)), gone);
    expect(stepBack(h, at(gone, "fee-b"))!.to.deal.fees.map((f) => f.id)).toEqual(["fee-a", "fee-b"]);
  });
});

describe("the history's keys", () => {
  const key = (code: string, o: Partial<{ ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean; key: string }> = {}) =>
    historyKey({ code, key: o.key ?? code.slice(3).toLowerCase(), ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...o });
  it("Ctrl+Z or ⌘Z steps back; Ctrl+Shift+Z or Ctrl+Y ahead; a Hebrew layout's keys by their place", () => {
    expect(key("KeyZ", { ctrlKey: true })).toBe("back");
    expect(key("KeyZ", { metaKey: true })).toBe("back");
    expect(key("KeyZ", { ctrlKey: true, shiftKey: true })).toBe("ahead");
    expect(key("KeyY", { ctrlKey: true })).toBe("ahead");
    expect(key("KeyZ", { ctrlKey: true, key: "ז" })).toBe("back");
  });
  it("asks nothing without Ctrl, with Alt, or for another key", () => {
    expect(key("KeyZ")).toBeNull();
    expect(key("KeyZ", { ctrlKey: true, altKey: true })).toBeNull();
    expect(key("KeyC", { ctrlKey: true })).toBeNull();
  });
});
