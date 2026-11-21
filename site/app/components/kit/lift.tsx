// Carrying a thing by the pointer, and stretching a cell by its knob (design-system 11, `Grip`). A grip (⋮⋮, `Grip`) lifts what it stands
// in (the nearest `data-liftable`): with a mouse once it moves a few pixels, on a phone after a long press anywhere on the thing; a thing
// marked `data-lift-body` lifts the same way from a mouse press on its own surface, away from what has a tap of its own. A chip
// whose tap acts is carried the same way where the pointer is fine (`useDragSource`). The thing follows the pointer as a clean copy of
// itself, upright and on the card's surface; a thing that has a head (`data-lift-head`, a fee's card) is carried as its head alone, and
// its place closes to that size. Its own place becomes the gap. Among the members of a sortable list (`DropZone`'s `sort`: a table's
// columns, a grid's rows, a fee's cases read as rows) and among liftable things that stand side by side with a place each that takes it
// (the fees of a group), the pointer's place picks where it lands, every place between two and both ends, and the others slide aside to
// open the gap there; over a plain place (a case for a part, an empty place for a case, a thing of the head to swap with) the place shows
// what a drop would do (`onPreview`), and moving away or Esc puts it back. Which place the pointer is over is read from the page as it
// stood when the thing was lifted, so what a place shows never moves the target under a still pointer. What a place shows never moves the
// page either: the blocks marked `data-carry-hold` keep the height they had when the thing was lifted, a shorter drawing leaving room in
// them and a taller one drawn over what follows (a case grid its rows the same way, each by what stands on it), and the bin is laid over the page, so the page's height, its scrollbar and its scroll
// stay as they were. Over the bin the picture dims and the bin says what goes. Let go, the thing settles where it lands; let go anywhere else, it goes back. Near the screen's top or foot the
// page scrolls, once the pointer moves that way. A tap on a grip opens its menu (`GripMenu`), which does the same by keyboard, the things
// moving there the same way. A knob (↔, `SpanKnob`), a strip along a cell's whole edge, stretches the cell over its neighbours or back, its
// edge following the pointer. Every grip and knob takes a 44 px press and no room of its own: it stands over the start of what it lifts.
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { createPortal, flushSync } from "react-dom";
import { GripVertical, MoveHorizontal, MoveVertical } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { useMedia } from "../../lib/hooks";
import { allZones, carry, listMembers, useCarried, useCarriedName, useOver, zoneElement, DropZone, type DropHow, type Zone } from "./drag-drop";
import { atRest, easing, flip, measure, motionMs, play } from "./flip";
import { around, inside, landing, placeAt, readingOrder, shifts, type Axis, type Box } from "./sortable";
import { onOwnSurface } from "./choice";
import { cx } from "./cx";
import { BinIcon } from "./remove-button";

/** How far a mouse moves before a press lifts; how long a finger holds before it lifts, and how far it may stray meanwhile. */
const MOUSE_SLOP = 4;
const HOLD_MS = 380;
const TOUCH_SLOP = 8;
/** The band at the screen's top and foot where the page scrolls under a carried thing, and the most it scrolls in a frame. */
const EDGE = 72;
const SCROLL = 16;
/** How far around a list's members the pointer still picks a place among them, in px. */
const LIST_MARGIN = 28;

/**
 * A place as it stood when the thing was lifted: its hands then (so a drop does what the page showed before any preview), and its box,
 * which says alone whether the pointer is over it (`placeAt`): in the page's coordinates, or the screen's where it is fixed on the screen
 * (`fixed`, a phone's bin); `depth`, how many places stand around it; `over`, it is laid over the page (a computer's bin).
 */
interface Frozen {
  hands: Zone;
  takes: boolean;
  box: Box;
  depth: number;
  fixed: boolean;
  over: boolean;
}
/** A sortable list as it stood when the thing was lifted: its members in reading order, the carried thing's place among them, its area. */
interface List {
  axis: Axis;
  keys: (string | null)[];
  boxes: Box[];
  source: number | null;
  area: Box;
  /** Members that slide by themselves (liftable things side by side): their elements, which take the shifts; none for a declared list, whose page draws the move. */
  slide?: HTMLElement[];
}
/** Where the carried thing would land now: a place by its key (null: back where it was), and the list and its landing, where in one. */
interface Target {
  key: string | null;
  list?: number;
  at?: number;
}

interface Lifting {
  item: string;
  name: string | null;
  from: HTMLElement;
  ghost: HTMLElement;
  note: HTMLElement;
  dx: number;
  dy: number;
  x: number;
  y: number;
  lastY: number;
  frame: number;
  zones: Map<string, Frozen>;
  lists: List[];
  target: Target | null;
  copy: boolean;
  /** The edge the pointer has moved toward inside its band, which arms the scroll. */
  armed: "up" | "down" | null;
  /** A thing carried by its head: its place's height as it was, put back when it lands. */
  collapsed: string | null;
  /** The elements marked as the gap now. */
  gaps: HTMLElement[];
  /** Lets go of the blocks held at their height (`holdBlocks`). */
  release: () => void;
}
let lifting: Lifting | null = null;

const pageBox = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left + window.scrollX, top: r.top + window.scrollY, right: r.right + window.scrollX, bottom: r.bottom + window.scrollY };
};
const pagePoint = (x: number, y: number) => ({ x: x + window.scrollX, y: y + window.scrollY });

/** The nearest element around all of `els` that draws a box of its own (a row drawn as `contents` has none). */
function commonAncestor(els: readonly Element[]): Element | null {
  let up: Element | null = els[0] ?? null;
  while (up && (!els.every((e) => up!.contains(e)) || getComputedStyle(up).display === "contents")) up = up.parentElement;
  return up;
}

/** A copy of `el` for the pointer to carry: nothing in it is a place, a thing to lift or an id, and no one reads it. */
function pictureOf(el: HTMLElement, width: number): HTMLElement {
  const g = el.cloneNode(true) as HTMLElement;
  for (const x of [g, ...g.querySelectorAll<HTMLElement>("*")]) {
    x.removeAttribute("id");
    for (const a of ["data-liftable", "data-drop-key", "data-flip", "data-lifted", "data-sort-list", "data-drop-zone", "data-lift-item"]) x.removeAttribute(a);
  }
  g.setAttribute("aria-hidden", "true");
  g.setAttribute("data-lift-ghost", "");
  g.removeAttribute("style");
  // as compact as its words: a head as tall as its row is carried as its words alone
  Object.assign(g.style, { position: "fixed", left: "0", top: "0", width: `${width}px`, height: "auto", minHeight: "0", maxHeight: `${Math.max(44, el.getBoundingClientRect().height)}px`, margin: "0", pointerEvents: "none" });
  return g;
}

/** The elements that draw the carried thing now: its grip's thing (the page may have drawn it again elsewhere, a preview), else, at rest, where it was lifted from. */
function markGap(l: Lifting, previewing: boolean) {
  for (const el of l.gaps) el.removeAttribute("data-lifted");
  const grips = [...document.querySelectorAll<HTMLElement>(`[data-lift-item="${CSS.escape(l.item)}"]`)].filter((g) => !l.ghost.contains(g));
  const found = grips.map((g) => g.closest<HTMLElement>("[data-liftable]")).filter((x): x is HTMLElement => !!x);
  l.gaps = found.length ? found : !previewing && l.from.isConnected && l.from.hasAttribute("data-liftable") ? [l.from] : [];
  for (const el of l.gaps) el.setAttribute("data-lifted", "");
}

/**
 * The place under the pointer that takes the thing and is no member of a list (a list picks by the pointer's place, `listTarget`): the
 * innermost whose box held the point when the thing was lifted. Never read from the page as it is drawn now: a place shown (`onPreview`)
 * moves what stands under a still pointer, and a target read from that would change, take the preview away, and change back.
 */
function plainAt(l: Lifting, x: number, y: number): string | null {
  const members = new Set(l.lists.flatMap((s) => s.keys));
  const places = [...l.zones].filter(([key, z]) => z.takes && !z.hands.sort && !members.has(key)).map(([key, z]) => ({ key, box: z.box, depth: z.depth, fixed: z.fixed, over: z.over }));
  return placeAt(places, pagePoint(x, y), { x, y });
}

/** Where in a list the pointer would land the thing: the first list whose area holds it. */
function listTarget(l: Lifting, x: number, y: number): Target | null {
  const p = pagePoint(x, y);
  for (const [k, s] of l.lists.entries()) {
    if (!inside(s.area, p, LIST_MARGIN)) continue;
    const at = landing(s.boxes, s.source, p, s.axis);
    const key = at === s.source ? null : (s.keys[at] ?? null);
    return { key: key && l.zones.get(key)?.takes ? key : null, list: k, at };
  }
  return null;
}

const sameTarget = (a: Target | null, b: Target | null) => a === b || (!!a && !!b && a.key === b.key && a.list === b.list && a.at === b.at);

/** Moves the members of a list that slide by themselves to open the gap at `at` (`shifts`), or back where they stood. */
function slide(s: List, at: number | null) {
  if (!s.slide || s.source === null) return;
  const by = at === null ? s.boxes.map(() => 0) : shifts(s.boxes, s.source, at, s.axis);
  s.slide.forEach((el, i) => {
    el.style.transition = `transform ${motionMs()}ms ${easing()}`;
    el.style.transform = by[i] ? (s.axis === "y" ? `translateY(${by[i]}px)` : `translateX(${by[i]}px)`) : "";
  });
}

function aim(l: Lifting, t: Target | null) {
  const was = l.target;
  if (sameTarget(was, t)) return;
  l.target = t;
  const how: DropHow = { copy: l.copy };
  const before = was?.key ? l.zones.get(was.key) : undefined;
  const next = t?.key ? l.zones.get(t.key) : undefined;
  // a list that slides by itself opens the gap; a page's preview draws the rest
  for (const [k, s] of l.lists.entries()) if (s.slide) slide(s, t && t.list === k ? (t.at ?? null) : null);
  flip(() =>
    flushSync(() => {
      before?.hands.onPreview?.(null, how);
      if (next) next.hands.onPreview?.(l.item, how);
      carry(l.item, t?.key ?? null, l.name);
    }),
  );
  markGap(l, !!next?.hands.onPreview);
  const bin = !!t?.key && !!zoneElement(t.key)?.querySelector("[data-drop-bin]");
  l.ghost.toggleAttribute("data-over-bin", bin);
}

function moveGhost(x: number, y: number) {
  const l = lifting;
  if (!l) return;
  l.x = x;
  l.y = y;
  l.ghost.style.transform = `translate(${x - l.dx}px, ${y - l.dy}px)`;
  l.note.style.transform = `translate(${x + 12}px, ${y + 16}px)`;
  // where it would land follows the pointer alone, over the page as it stood when the thing was lifted (`plainAt`, `listTarget`)
  const plain = plainAt(l, x, y);
  const t = plain ? { key: plain } : listTarget(l, x, y);
  aim(l, t);
  // over a place that does not take it and says why, the why stands under the pointer
  const why = t ? null : (document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-why]")?.dataset.dropWhy ?? null);
  l.note.textContent = why ?? "";
  l.note.hidden = !why;
}

/** The ghost settles on where the thing now stands (`to`), or fades where it went away; then it goes. */
function settle(ghost: HTMLElement, to: HTMLElement | null, away: boolean) {
  const ms = motionMs();
  if (ms <= 0 || (!to && !away)) return ghost.remove();
  const r = to?.getBoundingClientRect();
  const end = r && !away ? `translate(${r.left}px, ${r.top}px)` : `${ghost.style.transform} scale(0.92)`;
  const a = ghost.animate([{ transform: ghost.style.transform, opacity: 1 }, { transform: end, opacity: away ? 0 : 1 }], { duration: ms, easing: easing(), fill: "forwards" });
  a.onfinish = () => ghost.remove();
  a.oncancel = () => ghost.remove();
}

function endLift(drop: boolean) {
  const l = lifting;
  if (!l) return;
  lifting = null;
  cancelAnimationFrame(l.frame);
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onCancel);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("keyup", onModifier, true);
  window.removeEventListener("touchmove", noScroll);
  l.note.remove();
  const key = drop ? (l.target?.key ?? null) : null;
  const z = key ? l.zones.get(key) : undefined;
  const bin = !!key && !!zoneElement(key)?.querySelector("[data-drop-bin]");
  const how: DropHow = { copy: l.copy };
  const shown = l.target?.key ? l.zones.get(l.target.key) : undefined;
  // what slid and the gap measured where they stand on the screen, then put back and the drop made: each slides from there to its place
  const before = measure();
  l.release();
  for (const s of l.lists) for (const el of s.slide ?? []) Object.assign(el.style, { transition: "", transform: "" });
  for (const el of l.gaps) el.removeAttribute("data-lifted");
  l.from.removeAttribute("data-lifted");
  if (l.collapsed !== null) {
    l.from.style.height = l.collapsed;
    l.from.style.overflow = "";
  }
  flushSync(() => {
    shown?.hands.onPreview?.(null, how);
    if (z) z.hands.onDrop(l.item, how);
    carry(null);
  });
  play(before);
  const landed = [...document.querySelectorAll<HTMLElement>(`[data-lift-item="${CSS.escape(l.item)}"]`)].map((g) => g.closest<HTMLElement>("[data-liftable]")).find((x) => !!x);
  settle(l.ghost, bin ? null : (landed ?? (l.from.isConnected ? l.from : null)), bin || (!!z && !landed));
}

const onMove = (e: PointerEvent) => {
  if (!lifting) return;
  e.preventDefault();
  const dy = e.clientY - lifting.lastY;
  lifting.lastY = e.clientY;
  // the page scrolls only once the pointer moves toward the edge it is near
  const h = window.innerHeight;
  if (e.clientY > h - EDGE && dy > 0) lifting.armed = "down";
  else if (e.clientY < EDGE && dy < 0) lifting.armed = "up";
  else if (e.clientY >= EDGE && e.clientY <= h - EDGE) lifting.armed = null;
  setCopy(e.altKey || e.ctrlKey || e.metaKey);
  moveGhost(e.clientX, e.clientY);
};
const onUp = () => endLift(true);
const onCancel = () => endLift(false);
/** While a thing is carried by a finger, the page does not scroll under it (the scroll would cancel the carry). */
const noScroll = (e: TouchEvent) => e.cancelable && e.preventDefault();
const onKey = (e: globalThis.KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    endLift(false);
  } else onModifier(e);
};
const onModifier = (e: globalThis.KeyboardEvent) => setCopy(e.altKey || e.ctrlKey || e.metaKey);
function setCopy(on: boolean) {
  if (!lifting || lifting.copy === on) return;
  lifting.copy = on;
  lifting.ghost.toggleAttribute("data-copy", on);
}

/** Near the screen's top or foot, once the pointer moved that way, the page scrolls under the carried thing, faster the nearer the edge. */
function edgeScroll() {
  const l = lifting;
  if (!l) return;
  const h = window.innerHeight;
  const deep = l.armed === "down" ? (l.y - (h - EDGE)) / EDGE : l.armed === "up" ? (EDGE - l.y) / EDGE : 0;
  const bin = !!l.target?.key && !!zoneElement(l.target.key)?.querySelector("[data-drop-bin]");
  if (deep > 0 && !bin) {
    const before = window.scrollY;
    window.scrollBy(0, Math.ceil(SCROLL * Math.min(1, deep)) * (l.armed === "down" ? 1 : -1));
    if (window.scrollY !== before) moveGhost(l.x, l.y);
  }
  l.frame = requestAnimationFrame(edgeScroll);
}

/** Whether `el` stands fixed on the screen, itself or inside something that does (a phone's bin): the page scrolls under it. */
function onScreen(el: Element): boolean {
  for (let x: Element | null = el; x; x = x.parentElement) if (getComputedStyle(x).position === "fixed") return true;
  return false;
}

/** How many places stand around `el`. */
function countAround(el: Element): number {
  let n = 0;
  for (let x = el.parentElement?.closest("[data-drop-key]"); x; x = x.parentElement?.closest("[data-drop-key]")) n++;
  return n;
}

/** Every place on the page as it stands now, and the lists its members make (declared, `sort`, or liftable things side by side). */
function freeze(item: string, from: HTMLElement): { zones: Map<string, Frozen>; lists: List[] } {
  const zones = new Map<string, Frozen>();
  const els = new Map<string, HTMLElement>();
  for (const [key, z] of allZones()) {
    const el = zoneElement(key);
    if (!el) continue;
    const fixed = onScreen(el);
    const r = el.getBoundingClientRect();
    const depth = countAround(el);
    const over = !fixed && getComputedStyle(el).position === "absolute";
    zones.set(key, { hands: z, takes: z.accepts(item), box: fixed ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : pageBox(el), depth, fixed, over });
    els.set(key, el);
  }
  const lists: List[] = [];
  const byList = new Map<string, string[]>();
  for (const [key, f] of zones) if (f.hands.sort) byList.set(f.hands.sort.list, [...(byList.get(f.hands.sort.list) ?? []), key]);
  let inList = false;
  for (const keys of byList.values()) {
    const axis = zones.get(keys[0]!)!.hands.sort!.axis;
    const order = readingOrder(keys.map((k) => zones.get(k)!.box), axis);
    const sorted = order.map((i) => keys[i]!);
    // the member the thing was lifted from: the place around it (a list inside the thing, a fee's columns, is not its list)
    const source = sorted.findIndex((k) => els.get(k)!.contains(from));
    if (source >= 0) inList = true;
    if (!sorted.some((k, i) => i !== source && zones.get(k)!.takes)) continue;
    const boxes = sorted.map((k) => zones.get(k)!.box);
    const common = commonAncestor(sorted.map((k) => els.get(k)!));
    lists.push({ axis, keys: sorted, boxes, source: source >= 0 ? source : null, area: around(common ? [...boxes, pageBox(common)] : boxes) });
  }
  // liftable things side by side, each with a place that takes the thing: a list that slides by itself
  if (!inList && from.parentElement) {
    const sibs = [...from.parentElement.children].filter((el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute("data-liftable"));
    const keyIn = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>("[data-drop-key]")].map((z) => z.dataset.dropKey!).find((k) => zones.get(k)?.takes) ?? null;
    const keys = sibs.map((el) => (el === from ? null : keyIn(el)));
    if (keys.some((k) => k !== null)) {
      const raw = sibs.map(pageBox);
      const axis: Axis = raw.length > 1 && Math.abs(raw[1]!.top - raw[0]!.top) > Math.abs(raw[1]!.left - raw[0]!.left) ? "y" : "x";
      const order = readingOrder(raw, axis);
      const members = order.map((i) => sibs[i]!);
      const boxes = order.map((i) => raw[i]!);
      lists.push({ axis, keys: order.map((i) => keys[i]!), boxes, source: members.indexOf(from), area: around([...boxes, pageBox(from.parentElement)]), slide: members });
    }
  }
  return { zones, lists };
}

/**
 * Holds every block marked `data-carry-hold` at the height it has now, until the returned function lets go: what a place shows while the
 * thing is over it draws inside, a shorter drawing leaving room at the block's foot and a taller one drawn over what follows it (app.css
 * draws the block after it while something is carried), so nothing after the block moves and the page keeps its height and its scrollbar.
 * A case grid holds its rows' tracks itself, each by what stands on it (case-table.tsx, `useHeldTracks`), since a preview may add or take
 * away a line under a row.
 */
function holdBlocks(): () => void {
  const els = [...document.querySelectorAll<HTMLElement>("[data-carry-hold]")];
  // read every size before setting any, to the fraction of a pixel (a rounded one would move the page by it)
  const heights = els.map((el) => getComputedStyle(el).height);
  const was = els.map((el) => el.style.height);
  els.forEach((el, i) => (el.style.height = heights[i]!));
  return () => {
    els.forEach((el, i) => (el.style.height = was[i]!));
  };
}

/** What the page tells `lift` about the thing: its words, for the bin to say what goes; `keep`, it stays where it was (a chip, which adds a copy of itself). */
export interface LiftAbout {
  name?: string;
  keep?: boolean;
}

/** Lifts `item` from element `from` at a point (the pointer's, on the screen): its picture follows the pointer until it lands (`endLift`). */
export function lift(item: string, from: HTMLElement, x: number, y: number, about: LiftAbout = {}): void {
  if (lifting) endLift(false);
  const head = from.querySelector<HTMLElement>("[data-lift-head]");
  const shown = head ?? from;
  const box = shown.getBoundingClientRect();
  const ghost = pictureOf(shown, box.width);
  document.body.appendChild(ghost);
  const note = document.createElement("div");
  note.setAttribute("data-lift-why", "");
  note.setAttribute("role", "status");
  note.hidden = true;
  document.body.appendChild(note);
  // a thing carried by its head leaves a gap of its head's size: its place closes up to it, and what stood under it slides up
  let collapsed: string | null = null;
  if (head) {
    const before = measure();
    collapsed = from.style.height;
    Object.assign(from.style, { height: `${Math.round(box.height)}px`, overflow: "hidden" });
    from.setAttribute("data-lifted", "");
    play(before);
  } else if (!about.keep) from.setAttribute("data-lifted", "");
  flushSync(() => carry(item, null, about.name ?? null));
  const release = holdBlocks();
  const { zones, lists } = atRest(() => freeze(item, from));
  // the members of a list that slides by itself are places of their own (a fee's card): they draw no frame, the gap shows where it lands
  flushSync(() => listMembers(lists.flatMap((s) => (s.slide ? s.keys.filter((k): k is string => k !== null) : []))));
  lifting = { item, name: about.name ?? null, from, ghost, note, dx: x - box.left, dy: Math.max(0, Math.min(y - box.top, box.height)), x, y, lastY: y, frame: 0, zones, lists, target: null, copy: false, armed: null, collapsed, gaps: about.keep ? [] : [from], release };
  moveGhost(x, y);
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("keyup", onModifier, true);
  window.addEventListener("touchmove", noScroll, { passive: false });
  lifting.frame = requestAnimationFrame(edgeScroll);
}

/** The click a carry ends in, swallowed, so a thing let go does not open, nor a chip add itself too. */
const swallowClick = () => {
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 600);
};

/**
 * A mouse press on the surface of a thing that lifts from it (`data-lift-body`, the grip's thing `from`): moved past `MOUSE_SLOP`, it lifts
 * the thing as its grip does, words the press had begun to select let go; let go before, it is a plain click (a cell opens its case).
 * Meanwhile the browser drags no selected words away, and the click the carry's release makes is swallowed. Returns what lets go of it
 * while it has not lifted.
 */
function bodyPress(e: PointerEvent, item: string, from: HTMLElement, name: string | undefined): () => void {
  const x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
  let lifted = false;
  const noDrag = (d: DragEvent) => d.preventDefault();
  const move = (m: PointerEvent) => {
    if (lifted || m.pointerId !== id || Math.hypot(m.clientX - x0, m.clientY - y0) <= MOUSE_SLOP) return;
    lifted = true;
    getSelection()?.removeAllRanges();
    lift(item, from, m.clientX, m.clientY, { ...(name ? { name } : {}) });
  };
  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", stop);
    window.removeEventListener("dragstart", noDrag, true);
  };
  const up = () => {
    if (lifted) swallowClick();
    stop();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("dragstart", noDrag, true);
  // once lifted, the press is kept until its release, whose click it swallows, though the grip that began it is drawn again meanwhile
  return () => !lifted && stop();
}

/** What a chip that can be carried spreads on its element: nothing where the pointer is coarse or `item` is null (a chip that can't be). */
export type DragSourceProps = { "data-drag-source"?: ""; onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void };

/**
 * What a chip carriable as `item` spreads on its element: pressed and moved a few pixels, it is carried as itself (`lift`), its words its
 * name; the click its release would make is swallowed, so it adds itself only where it lands.
 */
export function dragSource(item: string): Required<DragSourceProps> {
  return {
    "data-drag-source": "",
    onPointerDown: (e) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      const el = e.currentTarget;
      const x0 = e.clientX, y0 = e.clientY, id = e.pointerId;
      const move = (m: PointerEvent) => {
        if (m.pointerId !== id || Math.hypot(m.clientX - x0, m.clientY - y0) <= MOUSE_SLOP) return;
        stop();
        swallowClick();
        lift(item, el, m.clientX, m.clientY, { name: el.textContent?.trim() ?? "", keep: true });
      };
      const stop = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", stop);
        window.removeEventListener("pointercancel", stop);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    },
  };
}

/** Makes a chip carriable as `item` where the pointer is fine (`dragSource`); null leaves it a tap alone. */
export function useDragSource(item: string | null): DragSourceProps {
  const fine = useMedia("(pointer: fine)");
  return !fine || item === null ? {} : dragSource(item);
}

/** Whether chips can be carried here: the pointer is fine. */
export const useCanDrag = (): boolean => useMedia("(pointer: fine)");

/** What a grip's menu offers: each action's words, and what it does; or, with `then`, the choices it opens in its place. */
export interface GripAction {
  label: string;
  onPick: () => void;
  /** The action takes something away: in the danger colour. */
  danger?: boolean;
  /** Chosen, the menu shows these in its place (the parts a row may take), the focus on the first. */
  then?: GripAction[];
}

/**
 * A grip (⋮⋮): pressed and moved (on a phone, a long press anywhere on what it lifts; with a mouse, a press on the surface of a thing
 * marked `data-lift-body`, moved, which shows the grab hand by `data-lift-grab`), it lifts the nearest element marked `data-liftable`
 * around it as `item`, `name` the thing's words (the bin says them); tapped or pressed with Enter, it opens its menu (`actions`), where there
 * is one. `still`: it lifts nothing (nothing would take the thing), its menu alone. `label` is its spoken name. Delete takes the thing
 * away where the menu can (`onRemove`). It takes no room: it stands over the start of the element around it (`inside`), or just before
 * it, over the room between it and its neighbour (`outside`, a table's cell, a fee's name). It is drawn while what it lifts
 * is under a fine pointer or has the focus; on touch only inside the open fee, where what it stands over makes room for it.
 */
export function Grip({ item, name, label, actions = [], onRemove, still, place = "inside", className }: { item: string; name?: string; label: string; actions?: GripAction[]; onRemove?: () => void; still?: boolean; place?: "inside" | "outside"; className?: string }) {
  const press = useRef<{ x: number; y: number; id: number; timer: number; touch: boolean } | null>(null);
  const lifted = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const clear = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  };
  const start = (x: number, y: number) => {
    const from = btn.current?.closest<HTMLElement>("[data-liftable]");
    clear();
    if (!from || still) return;
    lifted.current = true;
    setMenu(false);
    lift(item, from, x, y, { ...(name ? { name } : {}) });
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const touch = e.pointerType === "touch";
    lifted.current = false;
    // the moves that follow come here even once the pointer leaves the grip, so a quick drag still lifts
    e.currentTarget.setPointerCapture(e.pointerId);
    const x = e.clientX, y = e.clientY;
    press.current = { x, y, id: e.pointerId, touch, timer: touch && !still ? window.setTimeout(() => start(x, y), HOLD_MS) : 0 };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    const far = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (p.touch) {
      if (far > TOUCH_SLOP) clear();
    } else if (far > MOUSE_SLOP) start(e.clientX, e.clientY);
  };
  // on touch a long press anywhere on what it lifts lifts it (on what is inside it that lifts itself, that alone); with a mouse, on a
  // thing marked `data-lift-body`, a press on its own surface moved a few pixels (`bodyPress`)
  useEffect(() => {
    const from = btn.current?.closest<HTMLElement>("[data-liftable]");
    if (!from || still) return;
    const body = from.hasAttribute("data-lift-body");
    if (body) from.setAttribute("data-lift-grab", "");
    let hold: { x: number; y: number; id: number; timer: number } | null = null;
    let press: (() => void) | null = null;
    const stop = () => {
      if (hold) clearTimeout(hold.timer);
      hold = null;
    };
    const down = (e: PointerEvent) => {
      const t = e.target as Element;
      if (t.closest("[data-liftable]") !== from) return;
      if (e.pointerType === "mouse") {
        if (body && e.button === 0 && onOwnSurface(t, from)) press = bodyPress(e, item, from, name);
        return;
      }
      if (e.pointerType !== "touch" || t.closest("input, select, textarea, [data-grip], [data-span-knob]")) return;
      const x = e.clientX, y = e.clientY;
      hold = {
        x,
        y,
        id: e.pointerId,
        timer: window.setTimeout(() => {
          hold = null;
          swallowClick();
          lift(item, from, x, y, { ...(name ? { name } : {}) });
        }, HOLD_MS),
      };
    };
    const move = (e: PointerEvent) => hold && e.pointerId === hold.id && Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > TOUCH_SLOP && stop();
    from.addEventListener("pointerdown", down);
    from.addEventListener("pointermove", move);
    from.addEventListener("pointerup", stop);
    from.addEventListener("pointercancel", stop);
    return () => {
      stop();
      press?.();
      from.removeAttribute("data-lift-grab");
      from.removeEventListener("pointerdown", down);
      from.removeEventListener("pointermove", move);
      from.removeEventListener("pointerup", stop);
      from.removeEventListener("pointercancel", stop);
    };
  }, [item, name, still]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Delete" || e.key === "Backspace") && onRemove) {
      e.preventDefault();
      onRemove();
    }
  };
  return (
    <span data-grip-box={place} className={className}>
      <button
        ref={btn}
        type="button"
        data-grip=""
        data-lift-item={item}
        aria-label={label}
        title={label}
        aria-haspopup={actions.length ? "menu" : undefined}
        aria-expanded={actions.length ? menu : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clear}
        onPointerCancel={clear}
        onContextMenu={(e) => press.current?.touch && e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          if (lifted.current) return void (lifted.current = false);
          if (actions.length) setMenu((m) => !m);
        }}
        onKeyDown={onKeyDown}
        className={cx("tap-wide inline-flex h-7 w-5 shrink-0 touch-none select-none items-center justify-center rounded border border-border bg-popover text-muted-foreground shadow-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring", still ? "cursor-pointer" : "cursor-grab active:cursor-grabbing")}
      >
        <GripVertical size={14} strokeWidth={1.75} aria-hidden />
      </button>
      {menu && <ActionMenu actions={actions} onClose={() => setMenu(false)} back={btn} />}
    </span>
  );
}

/**
 * The room a grip takes where it stands inside (`Grip`'s `inside`), with no grip in it: a part's landing copy keeps the room of the grip the
 * part will have (on touch, inside the open fee, the padding a grip's part makes for it), and lifts nothing.
 */
export const GripRoom = () => <span aria-hidden data-grip-box="inside" />;

/**
 * A grip's menu, or any small menu of actions opened from a control (`back`): its actions in a small list under the control, or over it
 * where the screen has no room under it, fixed to the screen so a table that scrolls inside itself never cuts it, and following the
 * control as the page scrolls. Its start edge stands under the control's start edge, or, where that runs off the screen, its end edge
 * under the control's end edge (`menuSpot`). A control inside an open dialog (a popup, a sheet) has its menu drawn in that dialog, on the
 * dialog's own layer, since a dialog shown modally covers everything drawn on the page's body. It opens with the focus on its first action.
 * Esc, a press outside, the control leaving the screen or an action closes it, the focus back on the control; an action that moves things
 * moves them as a drag does (`flip`); an action with `then` shows its choices in its place.
 */
export function ActionMenu({ actions, onClose, back }: { actions: GripAction[]; onClose: () => void; back: RefObject<HTMLElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(actions);
  // the dialog the control stands in, which the menu is drawn in; none: the page's body
  const [host] = useState<HTMLDialogElement | null>(() => back.current?.closest<HTMLDialogElement>("dialog[open]") ?? null);
  // where it stands, `top` and `left` in its containing box (the screen, or the dialog it is drawn in); hidden until its size is known
  const [at, setAt] = useState<{ top: number; left: number } | null>(null);
  const close = (focus = true) => {
    onClose();
    if (focus) back.current?.focus({ preventScroll: true });
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  const place = () => {
    const control = back.current;
    const g = control?.getBoundingClientRect();
    if (!control || !g || !box.current) return;
    if (g.bottom < 0 || g.top > window.innerHeight) return closeRef.current(false);
    const spot = menuSpot(g, { width: box.current.offsetWidth, height: box.current.offsetHeight }, { width: window.innerWidth, height: window.innerHeight }, getComputedStyle(control).direction === "rtl");
    // drawn in a dialog, whose padding box holds it: a dialog moved by a transform carries what is fixed inside it, so the menu is placed
    // in the dialog's own terms
    const d = host?.getBoundingClientRect();
    setAt(host && d ? { top: spot.top - d.top - host.clientTop, left: spot.left - d.left - host.clientLeft } : spot);
  };
  useLayoutEffect(() => {
    place();
    requestAnimationFrame(() => box.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true }));
    const away = (e: globalThis.PointerEvent) => !box.current?.contains(e.target as Node) && !back.current?.contains(e.target as Node) && closeRef.current(box.current?.contains(document.activeElement) ?? false);
    const moved = () => place();
    window.addEventListener("pointerdown", away);
    window.addEventListener("scroll", moved, true);
    window.addEventListener("resize", moved);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", moved, true);
      window.removeEventListener("resize", moved);
    };
  }, []);
  // drawn on the page's body: what holds its control may be moved (a grip stands translated over its thing), which would carry a fixed menu
  return createPortal(
    <div
      ref={box}
      role="menu"
      onKeyDown={(e) => {
        const items = [...(box.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const k = items.indexOf(document.activeElement as HTMLElement);
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          items[(k + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
        } else if (e.key === "Tab") close();
      }}
      style={at ? { top: at.top, left: at.left } : { visibility: "hidden", top: 0, left: 0 }}
      className={cx("come-in z-[var(--z-popover)] flex min-w-44 flex-col rounded-md border border-border bg-popover p-1 shadow-lg", host ? "absolute" : "fixed")}
    >
      {items.map((a) => (
        <button
          key={a.label}
          type="button"
          role="menuitem"
          onClick={() => {
            if (a.then) {
              setItems(a.then);
              requestAnimationFrame(() => {
                place();
                box.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
              });
              return;
            }
            close();
            flip(() => flushSync(() => a.onPick()));
          }}
          className={cx("flex min-h-target items-center gap-2 rounded px-3 text-start text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", a.danger && "text-destructive")}
        >
          {a.label}
        </button>
      ))}
    </div>,
    host ?? document.body,
  );
}

/**
 * Where a menu of `size` opened from a control at `g` stands on a screen of `screen` (`ActionMenu`): under the control, or over it where the
 * screen has no room under it; its start edge under the control's start edge (the right one on a page read right to left), or, where that
 * runs off the screen, its end edge under the control's end edge; never closer than 8 px to a side of the screen.
 */
export function menuSpot(g: { top: number; bottom: number; left: number; right: number }, size: { width: number; height: number }, screen: { width: number; height: number }, rtl: boolean): { top: number; left: number } {
  const below = g.bottom + 4;
  const top = below + size.height > screen.height - 8 && g.top - 4 - size.height >= 8 ? g.top - 4 - size.height : below;
  const atStart = rtl ? g.right - size.width : g.left;
  const atEnd = rtl ? g.left : g.right - size.width;
  const fits = (x: number) => x >= 8 && x + size.width <= screen.width - 8;
  const left = fits(atStart) ? atStart : fits(atEnd) ? atEnd : Math.max(8, Math.min(atStart, screen.width - size.width - 8));
  return { top, left };
}

/**
 * The bin a carried thing is taken away in: shown only while something it takes (`accepts`) is carried, at the foot of its block on a
 * computer, laid over what follows the block (the nearest positioned element around it) so it adds no height to the page, and on a phone
 * (`phone`) fixed at the foot of the screen, over the carried thing's picture. One frame, the zone's own outline:
 * red and dashed while something is carried, solid and filled while it is over the bin, which then says what goes ("משחררים כדי למחוק:
 * המקרה בסניף", the thing's words from its grip); "גוררים לכאן כדי למחוק" before that. It stands on the card's fill, so it reads
 * over what it is laid on.
 */
export function DropBin({ accepts, onDrop, phone }: { accepts: (item: string) => boolean; onDrop: (item: string) => void; phone?: boolean }) {
  const item = useCarried();
  const name = useCarriedName();
  if (item === null || !accepts(item)) return null;
  return (
    <DropZone accepts={accepts} onDrop={(it) => onDrop(it)} tone="danger" rounded="rounded-md" className={cx("come-in z-[61] bg-card shadow-lg", phone ? "fixed inset-x-3 bottom-3" : "absolute inset-x-0 top-full mt-2")}>
      <BinWords name={name} />
    </DropZone>
  );
}

/** The bin's words: where to drag, or, the thing over it, what goes. */
function BinWords({ name }: { name: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => setKey(ref.current?.closest<HTMLElement>("[data-drop-key]")?.dataset.dropKey ?? null), []);
  const over = useOver(key ?? "");
  return (
    <div ref={ref} data-drop-bin="" className={cx("flex min-h-target items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-destructive", over && "bg-destructive/15 font-medium")}>
      <BinIcon />
      {over && name ? copy.lift.binOver.replace("{what}", name) : copy.lift.bin}
    </div>
  );
}

/**
 * A cell's knob (↔) on one of its edges (`edge`: toward the columns before it, or after it): a grab strip along the whole edge, about 10 px
 * straddling the border with the resize cursor, the small knob drawn in its middle as the hint. Dragged over its neighbours, it stretches the
 * cell over them, and back, off them, the cell's edge following the pointer as a frame; the arrow keys do the same one column at a time (left
 * goes on in reading order, right back). It reaches from column `from` to column `to` and may reach from `min` to `max`; `onReach` hears a
 * new reach as the pointer moves (`done` false: the page shows the cells it would cover taking its price) and once it is released or a key is
 * pressed (`done` true). `valueText` says the reach ("חל על 2 מתוך 3 גדלים"). The columns are found across from the pointer by their heads'
 * `data-col` (their index) inside the nearest `data-span-table`.
 */
export function SpanKnob({ edge, from, to, min, max, label, valueText, onReach, axis = "x" }: { edge: "before" | "after"; from: number; to: number; min: number; max: number; label: string; valueText: string; onReach: (from: number, to: number, done: boolean) => void; /** Across the columns (`x`), or down the rows of a grid (`y`: its edges above and below the cell, found by the rows' `data-rowpos`). */ axis?: "x" | "y" }) {
  const drag = useRef<{ id: number; reach: [number, number]; frame: HTMLElement; cell: DOMRect } | null>(null);
  const reachTo = (col: number): [number, number] => (edge === "after" ? [from, Math.max(from, Math.min(max, col))] : [Math.min(to, Math.max(min, col)), to]);
  const heads = (el: HTMLElement) => [...(el.closest("[data-span-table]")?.querySelectorAll<HTMLElement>(axis === "x" ? "[data-col]" : "[data-rowpos]") ?? [])];
  const index = (h: HTMLElement) => Number(axis === "x" ? h.dataset.col : h.dataset.rowpos);
  // the column whose head stands over the pointer, across (the knob may be dragged along any row); down, the row whose head stands beside it
  const colAt = (el: HTMLElement, x: number, y: number): number | null => {
    const hit = heads(el).find((h) => {
      const r = h.getBoundingClientRect();
      return axis === "x" ? x >= r.left && x <= r.right : y >= r.top && y <= r.bottom;
    });
    return hit ? index(hit) : null;
  };
  // the cell's moving edge follows the pointer, held within the columns it may reach
  const frameTo = (el: HTMLElement, x: number, y: number) => {
    const d = drag.current;
    if (!d) return;
    const hs = heads(el);
    const lo = hs.find((h) => index(h) === min)?.getBoundingClientRect();
    const hi = hs.find((h) => index(h) === max)?.getBoundingClientRect();
    const c = d.cell;
    let { left, right, top, bottom } = c;
    if (axis === "x") {
      // right to left: the edge after the cell is its left one
      const far = edge === "after" ? Math.max(hi?.left ?? c.left, Math.min(c.right, x)) : Math.min(lo?.right ?? c.right, Math.max(c.left, x));
      if (edge === "after") left = far;
      else right = far;
    } else {
      const far = edge === "after" ? Math.min(hi?.bottom ?? c.bottom, Math.max(c.top, y)) : Math.max(lo?.top ?? c.top, Math.min(c.bottom, y));
      if (edge === "after") bottom = far;
      else top = far;
    }
    Object.assign(d.frame.style, { left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
  };
  const step = (by: number) => {
    const [a, b] = edge === "after" ? [from, Math.max(from, Math.min(max, to + by))] : [Math.min(to, Math.max(min, from - by)), to];
    if (a !== from || b !== to) onReach(a, b, true);
  };
  const stop = () => {
    drag.current?.frame.remove();
    drag.current = null;
  };
  useEffect(() => stop, []);
  return (
    // the page is right to left: the edge after the cell is its left one. The strip runs along the whole edge, straddling it, so the edge
    // is grabbed anywhere; the knob drawn in its middle is the hint. The strip is placed by a span of its own: a cell makes every button
    // inside it relative, to stand over its open button (`LIFT_INNER`)
    <span
      data-knob-strip={axis}
      className={cx(
        "absolute z-10",
        axis === "x" ? cx("inset-y-0 w-2.5", edge === "after" ? "end-0 -translate-x-1/2" : "start-0 translate-x-1/2") : cx("inset-x-0 h-2.5", edge === "after" ? "bottom-0 translate-y-1/2" : "top-0 -translate-y-1/2"),
      )}
    >
      <button
        type="button"
        role="slider"
        data-span-knob={edge}
        aria-label={label}
        aria-orientation={axis === "x" ? "horizontal" : "vertical"}
        aria-valuemin={1}
        aria-valuemax={max - min + 1}
        aria-valuenow={to - from + 1}
        aria-valuetext={valueText}
        title={label}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          const cell = (e.currentTarget.closest("[role=gridcell]") ?? e.currentTarget.closest("[data-liftable]") ?? e.currentTarget.parentElement!).getBoundingClientRect();
          const frame = document.createElement("div");
          frame.setAttribute("data-reach-frame", "");
          frame.setAttribute("aria-hidden", "true");
          document.body.appendChild(frame);
          drag.current = { id: e.pointerId, reach: [from, to], frame, cell };
          frameTo(e.currentTarget, e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          frameTo(e.currentTarget, e.clientX, e.clientY);
          const col = colAt(e.currentTarget, e.clientX, e.clientY);
          if (col === null) return;
          const r = reachTo(col);
          if (r[0] !== d.reach[0] || r[1] !== d.reach[1]) {
            d.reach = r;
            onReach(r[0], r[1], false);
          }
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          stop();
          if (d && d.id === e.pointerId) flip(() => flushSync(() => onReach(d.reach[0], d.reach[1], true)));
        }}
        onPointerCancel={() => {
          stop();
          onReach(from, to, false);
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // right to left: the left arrow goes on to the next column in reading order; down, the down arrow to the next row
          const by = axis === "x" ? (e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0) : e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
          if (!by) return;
          e.preventDefault();
          e.stopPropagation();
          flip(() => flushSync(() => step(edge === "after" ? by : -by)));
        }}
        className={cx("group/knob flex size-full touch-none items-center justify-center focus-visible:outline-none", axis === "x" ? "cursor-ew-resize" : "cursor-ns-resize")}
      >
        <span aria-hidden className={cx("tap-area flex shrink-0 items-center justify-center rounded-sm border border-border bg-popover text-muted-foreground group-hover/knob:text-foreground group-focus-visible/knob:outline-2 group-focus-visible/knob:outline-ring", axis === "x" ? "h-6 w-4" : "h-4 w-6")}>
          {axis === "x" ? <MoveHorizontal size={12} strokeWidth={2} /> : <MoveVertical size={12} strokeWidth={2} />}
        </span>
      </button>
    </span>
  );
}
