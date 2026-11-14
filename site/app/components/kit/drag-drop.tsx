// The places a carried thing can be dropped on (design-system 11, `DropZone`), and the one thing carried on the whole page. Two kinds of
// thing are carried, both by the pointer through lift.tsx, which draws the thing's picture under the pointer and finds the place it is
// over: a thing lifted by its grip (with any pointer, a long press on a phone) and a chip whose tap already acts, dragged where the pointer
// is fine (`useDragSource`). A place either takes the thing dropped onto it (a plain zone, outlined while something it takes is carried)
// or is one member of a sortable list (`sort`): the members of a list are not targets to hit, the pointer's place among them picks where
// the thing lands, and the others open its gap there. A place may show what a drop there would do while the thing is over it
// (`onPreview`). The carried thing, the place it is over and the thing's words are held once, here, for every place to read.
import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useIsoLayoutEffect } from "../../lib/hooks";
import type { Axis } from "./sortable";
import { cx } from "./cx";

let carried: string | null = null;
/** The place the carried thing is over now, by its key (`DropZone`), where that place takes it. */
let overKey: string | null = null;
/** The carried thing's own words, for the bin to say what goes ("המקרה בסניף"). */
let carriedName: string | null = null;
/** The places that are members of a list the carried thing lands in by the pointer's place (lift.tsx finds them): they draw no frame. */
let members: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
const tell = () => {
  for (const on of listeners) on();
};
/** Sets the thing carried (null: none), the place it is over, and its words. */
export const carry = (item: string | null, over: string | null = null, name: string | null = carriedName) => {
  carried = item;
  overKey = item === null ? null : over;
  carriedName = item === null ? null : name;
  if (item === null) members = new Set();
  tell();
};

/** Marks the places that are members of a list the carried thing lands in (`DropZone` then draws no frame on them). */
export const listMembers = (keys: Iterable<string>) => {
  members = new Set(keys);
  tell();
};
const useMember = (key: string): boolean => useSyncExternalStore(subscribe, () => members.has(key), () => false);

/** How a thing was dropped: with the modifier key held (`copy`: the thing stays where it was too). */
export interface DropHow {
  copy: boolean;
}

/** A sortable list a place is one member of: its name, unique on the page, and the axis its members stand along. */
export interface SortOf {
  list: string;
  axis: Axis;
}

/** A place, as lift.tsx reads it while a thing is carried. */
export interface Zone {
  accepts: (item: string) => boolean;
  onDrop: (item: string, how: DropHow) => void;
  /** What a drop here would do, shown while the thing is over this place (null: shown no more). */
  onPreview?: (item: string | null, how: DropHow) => void;
  sort?: SortOf;
}
const zones = new Map<string, { current: Zone }>();

/**
 * Every place on the page, by its key, with its hands as the last drawing left them: a copy, so a drop made later does what the page
 * showed then, whatever a preview has drawn since.
 */
export const allZones = (): Map<string, Zone> => new Map([...zones].map(([k, h]) => [k, { ...h.current }]));

/** The element of the place `key`. */
export const zoneElement = (key: string): HTMLElement | null => document.querySelector<HTMLElement>(`[data-drop-key="${CSS.escape(key)}"]`);

const subscribe = (on: () => void) => {
  listeners.add(on);
  return () => void listeners.delete(on);
};
const useOverKey = (): string | null => useSyncExternalStore(subscribe, () => overKey, () => null);

/** The thing being carried, by the id its source gave it, or null. */
export function useCarried(): string | null {
  return useSyncExternalStore(subscribe, () => carried, () => null);
}

/** The words of the thing being carried, or null. */
export function useCarriedName(): string | null {
  return useSyncExternalStore(subscribe, () => carriedName, () => null);
}

/** Whether the carried thing is over the place `key` now. */
export function useOver(key: string): boolean {
  return useOverKey() === key;
}

/**
 * A place a carried thing can be dropped on: `accepts` says whether it takes it (asked only while one is carried), `onDrop` does what the
 * thing does here (`how.copy`: dropped with the modifier key held), `onPreview` shows that while the thing is over it. A zone inside another
 * takes the drop alone. `why`, where it does not take the thing, says why, under the pointer. `sort`: the place is a member of a sortable
 * list, which shows no frame (the gap the others open is what shows where the thing lands). A plain place that takes the thing draws its
 * frame on what it wraps, on that element's own edge and rounding, over its border: one frame, dashed, solid and filled while the thing is
 * over it. `tone="danger"`: a bin, in the danger colour. `className` is the zone's own layout, `rounded` its rounding.
 */
export function DropZone({ accepts, onDrop, onPreview, sort, why, rounded = "rounded-lg", tone, className, children }: { accepts: (item: string) => boolean; onDrop: (item: string, how: DropHow) => void; onPreview?: (item: string | null, how: DropHow) => void; sort?: SortOf; why?: (item: string) => string | null; rounded?: string; tone?: "danger"; className?: string; children: ReactNode }) {
  const item = useCarried();
  const key = useId();
  const hands = useRef<Zone>({ accepts, onDrop });
  hands.current = { accepts, onDrop, ...(onPreview ? { onPreview } : {}), ...(sort ? { sort } : {}) };
  useIsoLayoutEffect(() => {
    zones.set(key, hands);
    return () => void zones.delete(key);
  }, [key]);
  const over = useOver(key);
  const takes = item !== null && accepts(item);
  const refused = item !== null && !takes && why ? why(item) : null;
  const ink = tone === "danger" ? "*:outline-destructive" : "*:outline-primary";
  const member = useMember(key);
  const framed = takes && !sort && !member;
  return (
    <div
      data-drop-key={key}
      data-drop-zone={framed ? "" : undefined}
      data-sort-list={sort?.list}
      title={refused ?? undefined}
      data-drop-why={refused ?? undefined}
      className={cx(rounded, framed && cx("*:outline-2 *:-outline-offset-2 *:transition-[background-color] *:duration-[var(--duration-fast)]", ink, over ? "*:bg-accent *:outline-solid" : "*:outline-dashed"), className)}
    >
      {children}
    </div>
  );
}
