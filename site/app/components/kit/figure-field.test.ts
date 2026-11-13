// A figure typed in place: what its box does with what is typed, and the arrows' step.
import { describe, expect, it } from "vitest";
import { values as valuesCopy } from "../../copy";
import { parseInBox, readTyped, stepped } from "./figure-field";

describe("the arrows' step", () => {
  it("adds or takes away the step, never below zero, keeping the decimals typed", () => {
    expect(stepped(0.25, 0.01, true)).toBe(0.26);
    expect(stepped(0.125, 0.01, true)).toBe(0.135);
    expect(stepped(0.125, 0.01, false)).toBe(0.115);
    expect(stepped(0.005, 0.01, false)).toBe(0);
    expect(stepped(15, 1, true)).toBe(16);
    expect(stepped(7.5, 1, false)).toBe(6.5);
  });
});

describe("a number typed in a box", () => {
  it("takes its own unit's sign, and no other", () => {
    expect(parseInBox("7 $", "$")).toBe(7);
    expect(parseInBox("0,25%", "%")).toBe(0.25);
    expect(parseInBox("7 ₪", "$")).toBeNaN();
    expect(parseInBox("7 €", "$")).toBeNaN();
    expect(parseInBox("7%", "₪")).toBeNaN();
    expect(parseInBox("7", undefined)).toBe(7);
  });
});

describe("what the box does with its text", () => {
  const box = { sign: "%", validate: (n: number) => (n > 100 ? "too much" : null), clearable: true };
  it("commits a number as it is typed, and a number ending in its separator as the number before it, with no error", () => {
    expect(readTyped("0.3", { ...box, left: false })).toEqual({ kind: "commit", n: 0.3 });
    expect(readTyped("0,", { ...box, left: false })).toEqual({ kind: "commit", n: 0 });
    expect(readTyped("1,", { ...box, left: false })).toEqual({ kind: "commit", n: 1 });
    expect(readTyped("1.", { ...box, left: true })).toEqual({ kind: "commit", n: 1 });
  });
  it("waits while an emptied box has the focus, and clears the figure once it is left empty; a figure that may not be cleared then asks for a number", () => {
    expect(readTyped("", { ...box, left: false })).toEqual({ kind: "wait" });
    expect(readTyped(" ", { ...box, left: true })).toEqual({ kind: "clear" });
    expect(readTyped("", { ...box, clearable: false, left: true })).toEqual({ kind: "error", message: valuesCopy.errors.nan });
  });
  it("says what is wrong with what is not a number or fails its check", () => {
    expect(readTyped("abc", { ...box, left: false })).toEqual({ kind: "error", message: valuesCopy.errors.nan });
    expect(readTyped(",", { ...box, left: false })).toEqual({ kind: "error", message: valuesCopy.errors.nan });
    expect(readTyped("200", { ...box, left: false })).toEqual({ kind: "error", message: "too much" });
    expect(readTyped("7 $", { ...box, left: false })).toEqual({ kind: "error", message: valuesCopy.errors.nan });
  });
});
