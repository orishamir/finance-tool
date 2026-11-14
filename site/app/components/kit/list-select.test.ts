import { describe, expect, it } from "vitest";
import { dropRoom } from "./drop-list";
import { lightAfter, seekOption } from "./list-select";

describe("the kit's own list (InlineSelect)", () => {
  const months = ["לחודש", "לרבעון", "לחצי שנה", "לשנה"];
  it("jumps to the option a search starts, from the one after the light, round the end", () => {
    expect(seekOption(months, "לש", 0)).toBe(3);
    expect(seekOption(months, "לח", 3)).toBe(0);
    // one letter again moves on among the options it starts, as a native list does
    expect(seekOption(months, "ל", 0)).toBe(1);
    expect(seekOption(months, "לל", 1)).toBe(2);
    expect(seekOption(months, "ש", 0)).toBe(-1);
    expect(seekOption(["Alpha", "beta"], "B", 0)).toBe(1);
    expect(seekOption([], "a", 0)).toBe(-1);
  });
  it("moves the light by the arrows, Home, End and the Page keys, never past either end", () => {
    expect(lightAfter("ArrowDown", 3, 4)).toBe(3);
    expect(lightAfter("ArrowDown", 1, 4)).toBe(2);
    expect(lightAfter("ArrowUp", 0, 4)).toBe(0);
    expect(lightAfter("Home", 2, 4)).toBe(0);
    expect(lightAfter("End", 0, 4)).toBe(3);
    expect(lightAfter("PageDown", 0, 4)).toBe(3);
    expect(lightAfter("PageUp", 3, 4)).toBe(0);
    expect(lightAfter("Enter", 1, 4)).toBeNull();
  });
  it("opens under the button where the list fits, over it where only that side holds it, else scrolls on the larger side", () => {
    expect(dropRoom({ top: 100, bottom: 144 }, 200, 0, 1000)).toEqual({ up: false, room: null });
    expect(dropRoom({ top: 900, bottom: 944 }, 200, 0, 1000)).toEqual({ up: true, room: null });
    expect(dropRoom({ top: 300, bottom: 344 }, 900, 0, 800)).toEqual({ up: false, room: 448 });
    expect(dropRoom({ top: 500, bottom: 544 }, 900, 0, 800)).toEqual({ up: true, room: 492 });
    expect(dropRoom({ top: 30, bottom: 74 }, 900, 0, 120)).toEqual({ up: false, room: 120 });
  });
});
