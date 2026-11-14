// Lifting a thing by its grip, and stretching a cell by its knob (design-system 11, "Cases and parts"). A grip (⋮⋮, `Grip`) lifts what it
// stands in (the nearest `data-liftable`): with a mouse once it moves a few pixels, on a phone after a long press. The lifted thing follows
// the pointer, a little turned, while an empty dashed slot keeps its place (on a phone no grip is drawn, and a long press anywhere on the
// thing lifts it); every place that takes it lights (`DropZone`), and a bin
// (`DropBin`) shows only while something is lifted, at the foot of its block on a computer and at the foot of the screen on a phone.
// Released on a place, the place does what it does with it (with the modifier key held, it copies); released elsewhere, or with Esc,
// nothing happens. A tap on a grip opens its menu (`GripMenu`), which does the same by keyboard: move, duplicate, remove. A knob (↔,
// `SpanKnob`) on a cell's edge stretches the cell over its neighbours or back, by dragging or by the arrow keys, and says how far it
// reaches. Every grip and knob takes a 44 px press: a grip is that tall, its dots drawn in its middle.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { GripVertical, MoveHorizontal, MoveVertical } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { carry, dropOn, useCarried, zoneAt, DropZone } from "./drag-drop";
import { cx } from "./cx";
import { BinIcon } from "./remove-button";

/** How far a mouse moves before a press on a grip lifts; how long a finger holds before it lifts, and how far it may stray meanwhile. */
const MOUSE_SLOP = 4;
const HOLD_MS = 380;
const TOUCH_SLOP = 8;
/** Near the screen's top or foot, the page scrolls under a lifted thing by this much a frame. */
const EDGE = 64;
/** The tallest a lifted thing's picture is drawn, in px. */
const GHOST_MAX = 160;
const SCROLL = 12;

/** The thing lifted now: its ghost, the element it came from, and where the pointer took it. */
let lifting: { item: string; ghost: HTMLElement; note: HTMLElement; from: HTMLElement; dx: number; dy: number; x: number; y: number; frame: number } | null = null;

function moveGhost(x: number, y: number) {
  if (!lifting) return;
  lifting.x = x;
  lifting.y = y;
  lifting.ghost.style.transform = `translate(${x - lifting.dx}px, ${y - lifting.dy}px) rotate(-2deg)`;
  lifting.note.style.transform = `translate(${x + 12}px, ${y + 16}px)`;
  const over = zoneAt(x, y, lifting.item);
  carry(lifting.item, over);
  // over a place that does not take it and says why, the why stands under the pointer
  const why = over ? null : (document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop-why]")?.dataset.dropWhy ?? null);
  lifting.note.textContent = why ?? "";
  lifting.note.hidden = !why;
}

function endLift(e: PointerEvent | null) {
  if (!lifting) return;
  const { item, ghost, note, from, x, y, frame } = lifting;
  lifting = null;
  cancelAnimationFrame(frame);
  ghost.remove();
  note.remove();
  from.removeAttribute("data-lifted");
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onCancel);
  window.removeEventListener("keydown", onKey, true);
  window.removeEventListener("touchmove", noScroll);
  const key = e ? zoneAt(x, y, item) : null;
  if (key) dropOn(key, item, { copy: !!e && (e.altKey || e.ctrlKey || e.metaKey) });
  else carry(null);
}
const onMove = (e: PointerEvent) => {
  e.preventDefault();
  moveGhost(e.clientX, e.clientY);
};
const onUp = (e: PointerEvent) => endLift(e);
const onCancel = () => endLift(null);
/** While a thing is lifted by a finger, the page does not scroll under it (the scroll would cancel the lift). */
const noScroll = (e: TouchEvent) => e.cancelable && e.preventDefault();
const onKey = (e: globalThis.KeyboardEvent) => {
  if (e.key !== "Escape") return;
  e.preventDefault();
  e.stopPropagation();
  endLift(null);
};
/** While a thing is lifted near the screen's top or foot, the page scrolls under it. */
function edgeScroll() {
  if (!lifting) return;
  const { y } = lifting;
  const by = y < EDGE ? -SCROLL : y > window.innerHeight - EDGE ? SCROLL : 0;
  if (by) {
    window.scrollBy(0, by);
    moveGhost(lifting.x, lifting.y);
  }
  lifting.frame = requestAnimationFrame(edgeScroll);
}

/** Lifts `item` from element `from` at a point: its ghost follows the pointer until release (`endLift`). */
export function lift(item: string, from: HTMLElement, x: number, y: number): void {
  if (lifting) endLift(null);
  const box = from.getBoundingClientRect();
  const ghost = from.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  for (const el of ghost.querySelectorAll("[id]")) el.removeAttribute("id");
  ghost.setAttribute("aria-hidden", "true");
  ghost.setAttribute("data-lift-ghost", "");
  ghost.classList.add("bg-card");
  // a tall thing (a fee's card) is carried as its top, so its picture never covers the page
  Object.assign(ghost.style, { position: "fixed", left: "0", top: "0", width: `${box.width}px`, height: `${Math.min(box.height, GHOST_MAX)}px`, overflow: "hidden", margin: "0", pointerEvents: "none", zIndex: "60" });
  document.body.appendChild(ghost);
  const note = document.createElement("div");
  note.setAttribute("data-lift-why", "");
  note.setAttribute("role", "status");
  note.hidden = true;
  document.body.appendChild(note);
  from.setAttribute("data-lifted", "");
  lifting = { item, ghost, note, from, dx: x - box.left, dy: Math.min(y - box.top, GHOST_MAX - 16), x, y, frame: 0 };
  moveGhost(x, y);
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("touchmove", noScroll, { passive: false });
  lifting.frame = requestAnimationFrame(edgeScroll);
}

/** The click a long press ends in, swallowed, so lifting a cell does not open it too. */
const swallowClick = () => {
  const swallow = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
  window.addEventListener("click", swallow, { capture: true, once: true });
  setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 600);
};

/** What a grip's menu offers: each action's words, and what it does. */
export interface GripAction {
  label: string;
  onPick: () => void;
  /** The action takes something away: in the danger colour. */
  danger?: boolean;
}

/**
 * A grip (⋮⋮): pressed and moved (a long press on a phone), it lifts the nearest element marked `data-liftable` around it as `item`; tapped
 * or pressed with Enter, it opens its menu (`actions`), where there is one. `label` is its spoken name. Delete takes the thing away where
 * the menu can (`onRemove`).
 */
export function Grip({ item, label, actions = [], onRemove, className }: { item: string; label: string; actions?: GripAction[]; onRemove?: () => void; className?: string }) {
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
    if (!from) return;
    lifted.current = true;
    setMenu(false);
    lift(item, from, x, y);
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    const touch = e.pointerType === "touch";
    lifted.current = false;
    const x = e.clientX, y = e.clientY;
    press.current = { x, y, id: e.pointerId, touch, timer: touch ? window.setTimeout(() => start(x, y), HOLD_MS) : 0 };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    const far = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (p.touch) {
      if (far > TOUCH_SLOP) clear();
    } else if (far > MOUSE_SLOP) start(e.clientX, e.clientY);
  };
  // on touch no grip is drawn: a long press anywhere on what it lifts lifts it (on what is inside it that lifts itself, that alone)
  useEffect(() => {
    const from = btn.current?.closest<HTMLElement>("[data-liftable]");
    if (!from) return;
    let hold: { x: number; y: number; id: number; timer: number } | null = null;
    const stop = () => {
      if (hold) clearTimeout(hold.timer);
      hold = null;
    };
    const down = (e: PointerEvent) => {
      const t = e.target as Element;
      if (e.pointerType !== "touch" || t.closest("[data-liftable]") !== from || t.closest("input, select, textarea, [data-grip], [data-span-knob]")) return;
      const x = e.clientX, y = e.clientY;
      hold = {
        x,
        y,
        id: e.pointerId,
        timer: window.setTimeout(() => {
          hold = null;
          swallowClick();
          lift(item, from, x, y);
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
      from.removeEventListener("pointerdown", down);
      from.removeEventListener("pointermove", move);
      from.removeEventListener("pointerup", stop);
      from.removeEventListener("pointercancel", stop);
    };
  }, [item]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === "Delete" || e.key === "Backspace") && onRemove) {
      e.preventDefault();
      onRemove();
    }
  };
  return (
    <span className={cx("relative inline-flex", className)}>
      <button
        ref={btn}
        type="button"
        data-grip=""
        aria-label={label}
        title={label}
        aria-haspopup={actions.length ? "menu" : undefined}
        aria-expanded={actions.length ? menu : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clear}
        onPointerCancel={clear}
        onContextMenu={(e) => press.current?.touch && e.preventDefault()}
        onClick={() => {
          if (lifted.current) return void (lifted.current = false);
          if (actions.length) setMenu((m) => !m);
        }}
        onKeyDown={onKeyDown}
        className="relative z-[1] -my-2.5 inline-flex h-11 w-5 shrink-0 cursor-grab before:absolute before:inset-x-0 before:-inset-y-0.5 touch-none select-none items-center justify-center rounded text-muted-foreground transition-opacity duration-[var(--duration-fast)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:cursor-grabbing"
      >
        <GripVertical size={16} strokeWidth={1.75} aria-hidden />
      </button>
      {menu && <GripMenu actions={actions} onClose={() => setMenu(false)} back={btn} />}
    </span>
  );
}

/**
 * A grip's menu: its actions in a small list under the grip, fixed to the screen so a table that scrolls inside itself never cuts it; Esc,
 * a tap outside, a scroll or an action closes it, the focus back on the grip.
 */
function GripMenu({ actions, onClose, back }: { actions: GripAction[]; onClose: () => void; back: RefObject<HTMLButtonElement | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const at = back.current?.getBoundingClientRect();
  useEffect(() => {
    box.current?.querySelector<HTMLElement>("button")?.focus();
    const away = (e: globalThis.PointerEvent) => !box.current?.contains(e.target as Node) && !back.current?.contains(e.target as Node) && onClose();
    const scrolled = (e: Event) => !box.current?.contains(e.target as Node) && onClose();
    window.addEventListener("pointerdown", away);
    window.addEventListener("scroll", scrolled, true);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", scrolled, true);
    };
  }, [onClose, back]);
  const close = () => {
    onClose();
    back.current?.focus();
  };
  return (
    <div
      ref={box}
      role="menu"
      onKeyDown={(e) => {
        const items = [...(box.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const at = items.indexOf(document.activeElement as HTMLElement);
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          items[(at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
        }
      }}
      // right to left: the menu's right edge under the grip's
      style={at ? { top: at.bottom + 4, right: Math.max(8, window.innerWidth - at.right) } : undefined}
      className="fixed z-[var(--z-popover)] flex min-w-44 flex-col rounded-md border border-border bg-popover p-1 shadow-lg"
    >
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          role="menuitem"
          onClick={() => {
            close();
            a.onPick();
          }}
          className={cx("flex min-h-target items-center gap-2 rounded px-3 text-start text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", a.danger && "text-destructive")}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The bin a lifted thing is taken away in: shown only while something it takes (`accepts`) is lifted, at the foot of its block on a
 * computer, and on a phone (`phone`) fixed at the foot of the screen. A red dashed frame and "גוררים לכאן כדי למחוק".
 */
export function DropBin({ accepts, onDrop, phone }: { accepts: (item: string) => boolean; onDrop: (item: string) => void; phone?: boolean }) {
  const item = useCarried();
  if (item === null || !accepts(item)) return null;
  return (
    <DropZone accepts={accepts} onDrop={(it) => onDrop(it)} tone="danger" rounded="rounded-md" className={cx(phone && "fixed inset-x-3 bottom-3 z-50")}>
      <div data-drop-bin="" className="flex min-h-target items-center justify-center gap-2 rounded-md border border-dashed border-destructive bg-card px-3 py-2 text-sm text-destructive">
        <BinIcon />
        {copy.lift.bin}
      </div>
    </DropZone>
  );
}

/**
 * A cell's knob (↔) on one of its edges (`edge`: toward the columns before it, or after it): dragged over its neighbours, it stretches the
 * cell over them, and back, off them; the arrow keys do the same one column at a time (left goes on in reading order, right back). It
 * reaches from column `from` to column `to` and may reach from `min` to `max`; `onReach` hears a new reach as the pointer moves
 * (`done` false) and once it is released or a key is pressed (`done` true). `valueText` says the reach ("חל על 2 מתוך 3 גדלים"). The
 * columns are found across from the pointer by their heads' `data-col` (their index) inside the nearest `data-span-table`.
 */
export function SpanKnob({ edge, from, to, min, max, label, valueText, onReach, axis = "x" }: { edge: "before" | "after"; from: number; to: number; min: number; max: number; label: string; valueText: string; onReach: (from: number, to: number, done: boolean) => void; /** Across the columns (`x`), or down the rows of a grid (`y`: its edges above and below the cell, found by the rows' `data-rowpos`). */ axis?: "x" | "y" }) {
  const drag = useRef<{ id: number; reach: [number, number] } | null>(null);
  const reachTo = (col: number): [number, number] => (edge === "after" ? [from, Math.max(from, Math.min(max, col))] : [Math.min(to, Math.max(min, col)), to]);
  // the column whose head stands over the pointer, across (the knob may be dragged along any row); down, the row whose head stands beside it
  const colAt = (el: HTMLElement, x: number, y: number): number | null => {
    const heads = [...(el.closest("[data-span-table]")?.querySelectorAll<HTMLElement>(axis === "x" ? "[data-col]" : "[data-rowpos]") ?? [])];
    const hit = heads.find((h) => {
      const r = h.getBoundingClientRect();
      return axis === "x" ? x >= r.left && x <= r.right : y >= r.top && y <= r.bottom;
    });
    return hit ? Number(axis === "x" ? hit.dataset.col : hit.dataset.rowpos) : null;
  };
  const step = (by: number) => {
    const [a, b] = edge === "after" ? [from, Math.max(from, Math.min(max, to + by))] : [Math.min(to, Math.max(min, from - by)), to];
    if (a !== from || b !== to) onReach(a, b, true);
  };
  return (
    // the page is right to left: the edge after the cell is its left one; the knob sits across the edge (down: across its top, toward its
    // start, or its foot, toward its end, so a cell's foot knob and the top knob of the cell under it never stand on each other)
    <span
      className={cx(
        "absolute z-10",
        axis === "x" ? cx("top-1/2 -translate-y-1/2", edge === "after" ? "end-0 -translate-x-1/2" : "start-0 translate-x-1/2") : edge === "after" ? "bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2" : "top-0 right-1/4 translate-x-1/2 -translate-y-1/2",
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
        drag.current = { id: e.pointerId, reach: [from, to] };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
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
        drag.current = null;
        if (d && d.id === e.pointerId) onReach(d.reach[0], d.reach[1], true);
      }}
      onPointerCancel={() => {
        drag.current = null;
        onReach(from, to, false);
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        // right to left: the left arrow goes on to the next column in reading order; down, the down arrow to the next row
        const by = axis === "x" ? (e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0) : e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!by) return;
        e.preventDefault();
        e.stopPropagation();
        step(edge === "after" ? by : -by);
      }}
      className={cx("tap-area flex touch-none items-center justify-center rounded-sm border border-border bg-popover text-muted-foreground transition-opacity duration-[var(--duration-fast)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring", axis === "x" ? "h-6 w-4 cursor-ew-resize" : "h-4 w-6 cursor-ns-resize")}
    >
      {axis === "x" ? <MoveHorizontal size={12} strokeWidth={2} aria-hidden /> : <MoveVertical size={12} strokeWidth={2} aria-hidden />}
    </button>
    </span>
  );
}
