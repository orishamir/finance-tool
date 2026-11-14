// A carried chip's id travels under the site's own type alone: under a text type, a text field it was dropped on typed the id in. Every
// chip that can be carried starts its drag through `dragSource` (`useDragSource` hands it out where the pointer is fine), which puts the id
// on the drag's data with `putChip`.
import type { DragEvent } from "react";
import { describe, expect, it } from "vitest";
import { CHIP_TYPE, dragSource, putChip } from "./drag-drop";

/** A drag's data that keeps what is put on it. */
const dragData = () => {
  const set = new Map<string, string>();
  return { set, data: { setData: (type: string, value: string) => void set.set(type, value), effectAllowed: "none" as DataTransfer["effectAllowed"] } };
};

describe("a carried chip's data", () => {
  it("holds the id under the site's own type and no text type", () => {
    const { set, data } = dragData();
    putChip(data, "part:sale");
    expect([...set]).toEqual([[CHIP_TYPE, "part:sale"]]);
    expect(CHIP_TYPE.startsWith("text/")).toBe(false);
    expect(data.effectAllowed).toBe("copy");
  });

  it("is what a chip's drag puts on, through putChip, and nothing else", () => {
    const { set, data } = dragData();
    const source = dragSource("by:track");
    expect(source.draggable).toBe(true);
    source.onDragStart({ dataTransfer: data } as unknown as DragEvent<HTMLElement>);
    expect([...set]).toEqual([[CHIP_TYPE, "by:track"]]);
    expect(data.effectAllowed).toBe("copy");
    source.onDragEnd();
  });
});
