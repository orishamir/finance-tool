// A carried chip's id travels under the site's own type alone: under a text type, a text field it was dropped on typed the id in.
import { describe, expect, it } from "vitest";
import { CHIP_TYPE, putChip } from "./drag-drop";

describe("a carried chip's data", () => {
  it("holds the id under the site's own type and no text type", () => {
    const set = new Map<string, string>();
    const data = { setData: (type: string, value: string) => void set.set(type, value), effectAllowed: "none" as DataTransfer["effectAllowed"] };
    putChip(data, "part:sale");
    expect([...set]).toEqual([[CHIP_TYPE, "part:sale"]]);
    expect(CHIP_TYPE.startsWith("text/")).toBe(false);
    expect(data.effectAllowed).toBe("copy");
  });
});
