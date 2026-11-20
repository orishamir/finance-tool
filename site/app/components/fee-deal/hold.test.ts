// What ends the hold on a toolbox card, and where Tab goes while it is held (use-let-go.ts): Tab and Shift+Tab go round the places' landing
// copies and "ביטול", Escape lets go with the focus back on the card, a click on a place, a card or the hold line keeps the card held, and
// a click elsewhere lets go, leaving the focus on the box or button it landed on, else putting it back on the card.
import { describe, expect, it } from "vitest";
import { HOLD_RING, KEEPS_HOLD, TAKES_FOCUS, holdClick, holdKey, type Landed } from "./use-let-go";

/**
 * An element for a click to land on: its tag and attributes, inside `parent`. Its `closest` matches simple selectors, a list of `tag`,
 * `[attr]` and `tag[attr]`, as the hold's selectors are written.
 */
function el(tag: string, attrs: string[] = [], parent: Landed | null = null): Landed {
  const self = {
    tag,
    attrs,
    closest(selectors: string): unknown {
      const hit = selectors.split(",").some((sel) => {
        const m = /^([a-z]*)(?:\[([a-z-]+)\])?$/.exec(sel.trim());
        return !!m && (!m[1] || m[1] === tag) && (!m[2] || attrs.includes(m[2])) && (!!m[1] || !!m[2]);
      });
      return hit ? self : (parent?.closest(selectors) ?? null);
    },
  };
  return self;
}

describe("a key while a card is held", () => {
  it("Tab goes round the ring, Shift+Tab back, from outside it to its first or its last", () => {
    expect(holdKey("Tab", false, 3, -1)).toEqual({ k: "ring", to: 0 });
    expect(holdKey("Tab", true, 3, -1)).toEqual({ k: "ring", to: 2 });
    expect(holdKey("Tab", false, 3, 0)).toEqual({ k: "ring", to: 1 });
    expect(holdKey("Tab", false, 3, 2)).toEqual({ k: "ring", to: 0 });
    expect(holdKey("Tab", true, 3, 0)).toEqual({ k: "ring", to: 2 });
  });

  it("Tab is left to the page where the ring is empty; Escape lets go; other keys do nothing", () => {
    expect(holdKey("Tab", false, 0, -1)).toBeNull();
    expect(holdKey("Escape", false, 3, 1)).toEqual({ k: "letGo" });
    expect(holdKey("Enter", false, 3, 1)).toBeNull();
  });

  it("goes round the places' buttons and the hold line's", () => {
    expect(HOLD_RING).toContain("button[data-add-here]");
    expect(HOLD_RING).toContain("[data-tool-hold] button");
  });
});

describe("a click while a card is held", () => {
  it("keeps the card held on a place's \"+\", a toolbox card, or the hold line and its \"ביטול\"", () => {
    expect(holdClick(el("button", ["data-add-here"]))).toBe("keep");
    expect(holdClick(el("span", [], el("button", ["data-part"])))).toBe("keep");
    expect(holdClick(el("button", [], el("div", ["data-tool-hold"])))).toBe("keep");
  });

  it("lets go elsewhere: the focus stays on a box or a button it landed on, and goes back to the card from anything else", () => {
    expect(holdClick(el("input"))).toBe("stay");
    expect(holdClick(el("svg", [], el("button")))).toBe("stay");
    expect(holdClick(el("a", ["href"]))).toBe("stay");
    expect(holdClick(el("p", [], el("div")))).toBe("refocus");
    expect(holdClick(null)).toBe("refocus");
  });

  it("reads the selectors the page marks its places, cards and hold line with", () => {
    expect(KEEPS_HOLD.split(", ")).toEqual(["[data-add-here]", "[data-part]", "[data-tool-hold]"]);
    expect(TAKES_FOCUS).toContain("[tabindex]");
  });
});
