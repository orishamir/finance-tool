// A figure or a month typed in place: what its box does with what is typed, the arrows' step, and the month picker's months, keys and place.
import { describe, expect, it } from "vitest";
import { values as valuesCopy } from "../../copy";
import { monthText, parseInBox, parseMonth, readTyped, stepped } from "./figure-field";
import { floatAt, moveMonth, offered, pickCommit, shiftMonth, startMonth, yearMonths, yearOffered } from "./month-picker";

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

describe("a month typed in its box", () => {
  it("reads a month with a point, a slash or a dash, a year of two digits in this century, and the ISO form", () => {
    expect(parseMonth("3.2027")).toBe("2027-03");
    expect(parseMonth("03/2027")).toBe("2027-03");
    expect(parseMonth("3-2027")).toBe("2027-03");
    expect(parseMonth(" 3.27 ")).toBe("2027-03");
    expect(parseMonth("2027-03")).toBe("2027-03");
    expect(parseMonth("2027-3")).toBe("2027-03");
  });
  it("reads nothing that is not a month", () => {
    for (const t of ["", "13.2027", "0.2027", "2027-13", "מרץ 2027", "3.202", "3.2027.1"]) expect(parseMonth(t), t).toBeNull();
  });
  it("writes a month as the box shows it", () => {
    expect(monthText("2027-03")).toBe("03.2027");
  });
});

describe("the month picker", () => {
  const b = { earliest: "2027-02", latest: "2027-09" };
  it("offers a year's twelve months in order, each inside the earliest and the latest", () => {
    const all = yearMonths(2027, {});
    expect(all.map((m) => m.key)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m) => `2027-${m}`));
    expect(all.every((m) => m.offered)).toBe(true);
    expect(yearMonths(2027, b).filter((m) => m.offered).map((m) => m.key)).toEqual(["2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09"]);
    expect(yearMonths(2027, { earliest: "2027-11" }).filter((m) => !m.offered).length).toBe(10);
    expect(offered("2027-02", b) && offered("2027-09", b)).toBe(true);
    expect(offered("2027-01", b) || offered("2027-10", b)).toBe(false);
  });
  it("goes to a year only where it offers one of its months", () => {
    expect(yearOffered(2026, b)).toBe(false);
    expect(yearOffered(2027, b)).toBe(true);
    expect(yearOffered(2028, b)).toBe(false);
    expect(yearOffered(2030, {})).toBe(true);
    expect(yearOffered(2026, { earliest: "2026-12" })).toBe(true);
  });
  it("opens on the box's month, else on today's brought inside the earliest and the latest", () => {
    expect(startMonth("2027-05", "2026-11", b)).toBe("2027-05");
    expect(startMonth(null, "2026-11", {})).toBe("2026-11");
    expect(startMonth(null, "2026-11", b)).toBe("2027-02");
    expect(startMonth(null, "2028-04", b)).toBe("2027-09");
  });
  it("commits a month it offers that the box does not hold already, and nothing else", () => {
    expect(pickCommit("2027-04", "2027-03", b)).toBe("2027-04");
    expect(pickCommit("2027-04", null, {})).toBe("2027-04");
    expect(pickCommit("2027-03", "2027-03", b)).toBeNull();
    expect(pickCommit("2027-10", "2027-03", b)).toBeNull();
  });
  it("moves by the arrows, right to left: the right arrow to the month before, a row up or down three months, Page Up and Down a year", () => {
    expect(moveMonth("2027-03", "ArrowRight", true)).toBe("2027-02");
    expect(moveMonth("2027-03", "ArrowLeft", true)).toBe("2027-04");
    expect(moveMonth("2027-03", "ArrowRight", false)).toBe("2027-04");
    expect(moveMonth("2027-01", "ArrowRight", true)).toBe("2026-12");
    expect(moveMonth("2027-12", "ArrowLeft", true)).toBe("2028-01");
    expect(moveMonth("2027-02", "ArrowUp", true)).toBe("2026-11");
    expect(moveMonth("2027-11", "ArrowDown", true)).toBe("2028-02");
    expect(moveMonth("2027-03", "PageUp", true)).toBe("2026-03");
    expect(moveMonth("2027-03", "PageDown", true)).toBe("2028-03");
    expect(moveMonth("2027-07", "Home", true)).toBe("2027-01");
    expect(moveMonth("2027-07", "End", true)).toBe("2027-12");
    expect(moveMonth("2027-07", "a", true)).toBeNull();
  });
  it("keeps the year control within the years a box can hold", () => {
    expect(shiftMonth("2027-03", -12)).toBe("2026-03");
    expect(shiftMonth("9999-11", 12)).toBe("9999-12");
    expect(shiftMonth("0001-02", -12)).toBe("0001-01");
  });
  it("stands under its box, or over it where only that side has the room, and inside the window's width", () => {
    const view = { top: 0, bottom: 844, width: 390 };
    const size = { w: 260, h: 250 };
    // under the box, its right edge on the box's right edge (right to left)
    expect(floatAt({ top: 300, bottom: 344, left: 200, right: 380 }, size, view, 56, true)).toEqual({ top: 348, left: 120 });
    // a box near the window's left edge: shifted to stay 8 px inside
    expect(floatAt({ top: 300, bottom: 344, left: 10, right: 150 }, size, view, 56, true)).toEqual({ top: 348, left: 8 });
    // a box near the bottom: over it
    expect(floatAt({ top: 700, bottom: 744, left: 200, right: 380 }, size, view, 56, true)).toEqual({ top: 446, left: 120 });
    // no room on either side: the side with more, kept under the header and inside the window
    expect(floatAt({ top: 150, bottom: 194, left: 200, right: 380 }, size, { top: 0, bottom: 400, width: 390 }, 56, true)).toEqual({ top: 142, left: 120 });
  });
});
