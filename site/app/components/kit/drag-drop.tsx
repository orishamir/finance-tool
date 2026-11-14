// Dragging a chip onto a place that takes it, on a computer (design-system 11, "Cases and parts"): a chip that a tap already acts with
// (`useDragSource`) can also be carried onto a place on the page (`DropZone`), and dropping it there does what its tap does, in that place.
// While a chip is carried, every place that takes it is outlined in the action colour, solid under the pointer; a place that would not
// take it shows nothing. Only with a fine pointer: a phone keeps the tap alone, and the keyboard keeps its own ways. One chip is carried at
// a time on the whole page, so the carried chip is held once, here, for every place to read.
import { useEffect, useState, useSyncExternalStore, type DragEvent, type ReactNode } from "react";
import { useMedia } from "../../lib/hooks";
import { cx } from "./cx";

let carried: string | null = null;
const listeners = new Set<() => void>();
const carry = (item: string | null) => {
  carried = item;
  for (const on of listeners) on();
};
const subscribe = (on: () => void) => {
  listeners.add(on);
  return () => void listeners.delete(on);
};

/** The chip being carried, by the id its source gave it, or null. */
export function useCarried(): string | null {
  return useSyncExternalStore(subscribe, () => carried, () => null);
}

/** What a chip that can be carried spreads on its element: nothing where the pointer is coarse or `item` is null (a chip that can't be). */
export type DragSourceProps = { draggable?: true; onDragStart?: (e: DragEvent<HTMLElement>) => void; onDragEnd?: () => void };

/** Makes a chip carriable as `item` where the pointer is fine; null leaves it a tap alone. */
export function useDragSource(item: string | null): DragSourceProps {
  const fine = useMedia("(pointer: fine)");
  if (!fine || item === null) return {};
  return {
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.setData("text/plain", item);
      e.dataTransfer.effectAllowed = "copy";
      carry(item);
    },
    onDragEnd: () => carry(null),
  };
}

/** Whether chips can be carried here: the pointer is fine. */
export const useCanDrag = (): boolean => useMedia("(pointer: fine)");

/**
 * A place a carried chip can be dropped on: `accepts` says whether it takes the chip (asked only while one is carried), `onDrop` does what
 * the chip's tap does, here. A zone inside another takes the drop alone. `className` is the zone's own layout; its outline follows its
 * rounding (`rounded`, a large radius by default).
 */
export function DropZone({ accepts, onDrop, rounded = "rounded-lg", className, children }: { accepts: (item: string) => boolean; onDrop: (item: string) => void; rounded?: string; className?: string; children: ReactNode }) {
  const item = useCarried();
  const takes = item !== null && accepts(item);
  // enter and leave fire for each element inside, so the pointer is over the zone while more enters than leaves have been seen
  const [over, setOver] = useState(0);
  useEffect(() => {
    if (!takes) setOver(0);
  }, [takes]);
  const handlers = takes
    ? {
        onDragEnter: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOver((n) => n + 1);
        },
        onDragOver: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: (e: DragEvent) => {
          e.stopPropagation();
          setOver((n) => Math.max(0, n - 1));
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setOver(0);
          carry(null);
          onDrop(item);
        },
      }
    : {};
  return (
    <div data-drop-zone={takes ? "" : undefined} className={cx(rounded, takes && "outline-2 outline-offset-2 outline-primary", takes && (over > 0 ? "bg-accent outline-solid" : "outline-dashed"), className)} {...handlers}>
      {children}
    </div>
  );
}
