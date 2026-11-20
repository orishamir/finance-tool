// Where the reading says a fee it leaves out (left-out.ts): the panel its fee stands on, by its kind's base (F-111).
import { describe, expect, it } from "vitest";
import type { Panels } from "./charts";
import { leftByPanel, panelOfLeft, type LeftOut } from "./left-out";

const tab = (key: string, action: string, side: string) => ({ key, action, side, views: [] }) as unknown as Panels["actions"][number];
const held = [{}] as unknown as Panels["held"];
const panels = { actions: [tab("trade:all", "trade", "all"), tab("transfer_out:all", "transfer_out", "all")], held };

describe("the panel a fee left out is said in", () => {
  it("is its action's tab for a fee on an action, and holding for a fee on what is held or on the account", () => {
    expect(panelOfLeft({ fee: "a", kind: "trade" }, { foreign: false }, panels)).toBe("trade:all");
    expect(panelOfLeft({ fee: "b", kind: "transfer_out" }, { foreign: false }, panels)).toBe("transfer_out:all");
    expect(panelOfLeft({ fee: "c", kind: "custody" }, { foreign: false }, panels)).toBe("held");
    expect(panelOfLeft({ fee: "d", kind: "current_account" }, { foreign: false }, panels)).toBe("held");
  });
  it("is the purchase's tab for a conversion where what is bought is abroad, as the reading groups it (F-111)", () => {
    expect(panelOfLeft({ fee: "e", kind: "fx" }, { foreign: true }, panels)).toBe("trade:all");
  });
  it("falls back to holding where its action has no tab, to the first tab where there is no holding, and to none where there is no panel", () => {
    expect(panelOfLeft({ fee: "f", kind: "deposit" }, { foreign: false }, panels)).toBe("held");
    expect(panelOfLeft({ fee: "g", kind: "custody" }, { foreign: false }, { actions: panels.actions, held: [] })).toBe("trade:all");
    expect(panelOfLeft({ fee: "h", kind: "custody" }, { foreign: false }, { actions: [], held: [] })).toBeNull();
  });
  it("sorts each reason's fees by panel, those no panel takes apart", () => {
    const left: LeftOut = { unread: [{ fee: "c", kind: "custody" }], unpriced: [{ fee: "a", kind: "trade" }], unmatched: [], banned: [] };
    expect(leftByPanel(left, { foreign: false }, panels)).toEqual({
      byPanel: { held: { unread: [{ fee: "c", kind: "custody" }], unpriced: [], unmatched: [], banned: [] }, "trade:all": { unread: [], unpriced: [{ fee: "a", kind: "trade" }], unmatched: [], banned: [] } },
      rest: { unread: [], unpriced: [], unmatched: [], banned: [] },
    });
    expect(leftByPanel(left, { foreign: false }, { actions: [], held: [] }).rest).toEqual(left);
  });
});
