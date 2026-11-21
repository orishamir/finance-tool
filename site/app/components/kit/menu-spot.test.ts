// Where a small menu of actions stands under its control (`menuSpot`, kit/lift.tsx): its start edge under the control's, or, where that
// runs off the screen (a control at a dialog's far end), its end edge under the control's; over the control where there is no room under it.
import { describe, expect, it } from "vitest";
import { menuSpot } from "./lift";

const screen = { width: 1440, height: 900 };
const size = { width: 176, height: 98 };

describe("menuSpot", () => {
  it("stands under the control, its right edge under the control's on a page read right to left", () => {
    expect(menuSpot({ top: 100, bottom: 144, left: 600, right: 644 }, size, screen, true)).toEqual({ top: 148, left: 644 - 176 });
  });

  it("keeps its left edge under the control's where the right-aligned menu would run off the screen's left side (the popup's ⋯)", () => {
    expect(menuSpot({ top: 40, bottom: 84, left: 73.5, right: 117.5 }, size, screen, true)).toEqual({ top: 88, left: 73.5 });
  });

  it("reads left to right the other way round, and opens over the control where the screen has no room under it", () => {
    expect(menuSpot({ top: 850, bottom: 894, left: 1350, right: 1394 }, size, screen, false)).toEqual({ top: 850 - 4 - 98, left: 1394 - 176 });
  });

  it("never stands closer than 8 px to a side when neither edge fits", () => {
    expect(menuSpot({ top: 0, bottom: 44, left: 0, right: 100 }, { width: 400, height: 40 }, { width: 390, height: 844 }, true).left).toBe(8);
  });
});
