import { describe, expect, it } from "vitest";
import { onSurface } from "./choice";

/** A stand-in for an element: its tag, its attributes and its parent, enough for `onSurface`'s matching and walking. */
interface Node {
  tag: string;
  attrs: string[];
  parentElement: Node | null;
  matches: (sel: string) => boolean;
  contains: (other: Node) => boolean;
}
function el(tag: string, parent: Node | null, attrs: string[] = []): Node {
  const n: Node = {
    tag,
    attrs,
    parentElement: parent,
    matches: (sel) => sel.split(",").some((s) => {
      const one = s.trim();
      return one === tag || attrs.some((a) => one === `[${a}]` || one.startsWith(`[${a}=`));
    }),
    contains: (other) => {
      for (let x: Node | null = other; x; x = x.parentElement) if (x === n) return true;
      return false;
    },
  };
  return n;
}
const press = (target: Node, card: Node) => onSurface({ target: target as unknown as EventTarget, currentTarget: card as unknown as EventTarget });

describe("a press on a card's surface (onSurface)", () => {
  it("opens the card from its plain surface, also where the card stands inside a sheet", () => {
    for (const host of [el("main", null), el("dialog", el("body", null))]) {
      const card = el("div", host);
      const cell = el("div", card);
      expect(press(cell, card)).toBe(true);
      expect(press(el("span", cell), card)).toBe(true);
    }
  });
  it("never takes a press on a control, a grip or a sheet inside the card, nor one outside the card", () => {
    const card = el("div", el("dialog", null));
    const cell = el("div", card);
    expect(press(el("svg", el("button", cell)), card)).toBe(false);
    expect(press(el("span", el("span", cell, ["data-grip-box"])), card)).toBe(false);
    expect(press(el("p", el("dialog", cell)), card)).toBe(false);
    expect(press(el("div", null), card)).toBe(false);
  });
});
