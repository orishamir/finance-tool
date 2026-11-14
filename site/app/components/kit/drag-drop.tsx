// Carrying a thing onto a place that takes it (design-system 11, "Cases and parts"). Two ways carry: a chip that a tap already acts with
// (`useDragSource`), by the browser's own drag, with a fine pointer only; and a thing lifted by its grip (lift.tsx), with any pointer, a
// long press on a phone. Either way, dropping it on a place (`DropZone`) does what that place does with it. While a thing is carried, every
// place that takes it is outlined in the action colour, solid under the pointer; a place that would not take it shows nothing, or, where
// it says why (`why`), says so under the pointer. One thing is carried at a time on the whole page, so it is held once, here, for every place
// to read, with the place a lifted thing is over.
import { useEffect, useId, useRef, useState, useSyncExternalStore, type DragEvent, type ReactNode } from "react";
import { useIsoLayoutEffect, useMedia } from "../../lib/hooks";
import { cx } from "./cx";

let carried: string | null = null;
/** The place a lifted thing is over, by its key (`DropZone`), where that place takes it. */
let overKey: string | null = null;
const listeners = new Set<() => void>();
const tell = () => {
  for (const on of listeners) on();
};
/** Sets the thing carried (null: none), and the place a lifted one is over. */
export const carry = (item: string | null, over: string | null = null) => {
  carried = item;
  overKey = item === null ? null : over;
  tell();
};

/** How a thing was dropped: with the modifier key held (`copy`: the thing stays where it was too). */
export interface DropHow {
  copy: boolean;
}

/** A place that takes carried things, as a lifted thing finds it under the pointer (`zoneAt`). */
interface Zone {
  accepts: (item: string) => boolean;
  onDrop: (item: string, how: DropHow) => void;
}
const zones = new Map<string, Zone>();

/** The place under a point that takes `item`, by its key; null where none does. */
export function zoneAt(x: number, y: number, item: string): string | null {
  let el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-key]") ?? null;
  while (el) {
    const key = el.dataset.dropKey!;
    if (zones.get(key)?.accepts(item)) return key;
    el = el.parentElement?.closest<HTMLElement>("[data-drop-key]") ?? null;
  }
  return null;
}

/** Drops `item` on the place `key`, as a lifted thing does on release. */
export function dropOn(key: string, item: string, how: DropHow): void {
  const z = zones.get(key);
  carry(null);
  if (z?.accepts(item)) z.onDrop(item, how);
}

const useOverKey = (): string | null => useSyncExternalStore(subscribe, () => overKey, () => null);
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

/**
 * The type a carried chip's id travels under: the site's own, never a text type, so a text field it is dropped on (or another program)
 * takes nothing from it.
 */
export const CHIP_TYPE = "application/x-mekor-chip";

/** Puts a carried chip's id on a drag's data, under `CHIP_TYPE` alone. */
export function putChip(data: Pick<DataTransfer, "setData" | "effectAllowed">, item: string): void {
  data.setData(CHIP_TYPE, item);
  data.effectAllowed = "copy";
}

/** What a chip carriable as `item` spreads on its element: its id put on the drag's data (`putChip`) and held as the carried chip until it ends. */
export function dragSource(item: string): Required<DragSourceProps> {
  return {
    draggable: true,
    onDragStart: (e) => {
      putChip(e.dataTransfer, item);
      carry(item);
    },
    onDragEnd: () => carry(null),
  };
}

/** Makes a chip carriable as `item` where the pointer is fine (`dragSource`); null leaves it a tap alone. */
export function useDragSource(item: string | null): DragSourceProps {
  const fine = useMedia("(pointer: fine)");
  return !fine || item === null ? {} : dragSource(item);
}

/** Whether chips can be carried here: the pointer is fine. */
export const useCanDrag = (): boolean => useMedia("(pointer: fine)");

/**
 * A place a carried thing can be dropped on: `accepts` says whether it takes it (asked only while one is carried), `onDrop` does what the
 * thing's tap does, here (`how.copy`: dropped with the modifier key held). A zone inside another takes the drop alone. `why`, where it
 * does not take the thing, says why, under the pointer. `className` is the zone's own layout, `rounded` its rounding. While it takes the
 * thing, its frame is drawn on what it wraps, on that element's own edge and rounding, over its border: one frame, dashed, solid and filled
 * while the thing is over it. `tone="danger"`: a bin, in the danger colour.
 */
export function DropZone({ accepts, onDrop, why, rounded = "rounded-lg", tone, className, children }: { accepts: (item: string) => boolean; onDrop: (item: string, how: DropHow) => void; why?: (item: string) => string | null; rounded?: string; tone?: "danger"; className?: string; children: ReactNode }) {
  const item = useCarried();
  const key = useId();
  const hands = useRef<Zone>({ accepts, onDrop });
  hands.current = { accepts, onDrop };
  useIsoLayoutEffect(() => {
    zones.set(key, { accepts: (it) => hands.current.accepts(it), onDrop: (it, how) => hands.current.onDrop(it, how) });
    return () => void zones.delete(key);
  }, [key]);
  const liftedOver = useOverKey() === key;
  const takes = item !== null && accepts(item);
  const refused = item !== null && !takes && why ? why(item) : null;
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
          onDrop(item, { copy: false });
        },
      }
    : {};
  const ink = tone === "danger" ? "*:outline-destructive" : "*:outline-primary";
  return (
    <div
      data-drop-key={key}
      data-drop-zone={takes ? "" : undefined}
      title={refused ?? undefined}
      data-drop-why={refused ?? undefined}
      className={cx(rounded, takes && cx("*:outline-2 *:-outline-offset-2", ink), takes && (over > 0 || liftedOver ? "*:bg-accent *:outline-solid" : "*:outline-dashed"), className)}
      {...handlers}
    >
      {children}
    </div>
  );
}
