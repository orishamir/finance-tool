// The goals board above the goal form (design-system "Goals list", D12): the goals as chips in their order, right to
// left. A chip is dragged sideways to change the order; the current goal's chip renames and deletes in place
// (2026-10-24, the founder: the up and down arrows moved chips sideways, and there was no rename or delete).
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { r2 } from "../../copy";
import { isBlank, useGoals, type Goal } from "../../lib/goal";
import { Button, cx } from "../ui";
import { goalTitle } from "./goal-form";
import { IconEdit, IconGrip, IconPlus, IconTrash } from "./icons";

/** Pixels the pointer travels before a press on a chip becomes a drag; a shorter press is a click. */
const DRAG_START = 6;
/** The delete question's width: one line for "למחוק את המטרה מהמכשיר הזה?" and its two buttons. */
const CONFIRM_WIDTH = 264;

interface Drag {
  id: string;
  /** The order shown while dragging; the dragged chip's own place in it is the drop slot. */
  order: string[];
  startX: number;
  startY: number;
  /** Where the chip was grabbed, so the floating copy stays under the pointer at that spot. */
  grabX: number;
  grabY: number;
  width: number;
  x: number;
  y: number;
  active: boolean;
}

/**
 * Where a dragged chip lands: beside the chip nearest the pointer, on the side of that chip's middle the pointer is on.
 * Distance across rows counts double, so a wrapped row's chips win over the row above or below.
 */
export function dropOrder(order: string[], id: string, x: number, y: number, rects: Map<string, { left: number; right: number; top: number; bottom: number }>, rtl: boolean): string[] {
  const rest = order.filter((o) => o !== id);
  let best = -1;
  let bestD = Infinity;
  rest.forEach((o, i) => {
    const r = rects.get(o);
    if (!r) return;
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom) * 2;
    if (dx * dx + dy * dy < bestD) {
      bestD = dx * dx + dy * dy;
      best = i;
    }
  });
  if (best < 0) return order;
  const r = rects.get(rest[best]!)!;
  const mid = (r.left + r.right) / 2;
  rest.splice(best + ((rtl ? x < mid : x > mid) ? 1 : 0), 0, id);
  return rest;
}

export function GoalsList() {
  const { goals, current, select, add, remove, moveTo, rename } = useGoals();
  const [drag, setDragState] = useState<Drag | null>(null);
  /** The drag as the pointer handlers last left it (they can run before React renders the previous move). */
  const live = useRef<Drag | null>(null);
  const setDrag = (d: Drag | null) => {
    live.current = d;
    setDragState(d);
  };
  const [renaming, setRenaming] = useState<string | null>(null);
  /** The chip asking "delete?", and which of its edges the question hangs from so it stays on the screen. */
  const [confirm, setConfirm] = useState<{ id: string; edge: "start" | "end" } | null>(null);
  const chips = useRef(new Map<string, HTMLLIElement>());
  /** A drag just ended on this chip: the click the browser sends after it is not a select. */
  const dragged = useRef(false);

  useEffect(() => {
    if (!drag?.active) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      live.current = null;
      setDragState(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [drag?.active]);

  useEffect(() => {
    if (!confirm) return;
    const close = (e: MouseEvent) => !chips.current.get(confirm.id)?.contains(e.target as Node) && setConfirm(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [confirm]);

  // Shown from the first goal on, blank or not: until 2026-10-25 it appeared once the first goal held something, so typing
  // a name or choosing a preset pushed the whole form down under the pointer.
  if (goals.length === 0) return null;
  const many = goals.length > 1;
  const fresh = !many && isBlank(goals[0]!);
  const byId = new Map(goals.map((g) => [g.id, g]));
  // The drop preview reorders the chips with CSS `order` only: moving the dragged chip's node in the page would make the
  // browser drop its pointer capture, and the drop would never arrive.
  const slot = drag?.active ? new Map(drag.order.map((id, i) => [id, i])) : null;

  const press = (e: ReactPointerEvent<HTMLButtonElement>, g: Goal) => {
    dragged.current = false;
    const li = chips.current.get(g.id);
    if (!many || e.button !== 0 || !li) return;
    const r = li.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id: g.id, order: goals.map((x) => x.id), startX: e.clientX, startY: e.clientY, grabX: e.clientX - r.left, grabY: e.clientY - r.top, width: r.width, x: e.clientX, y: e.clientY, active: false });
  };
  const follow = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = live.current;
    const { clientX: x, clientY: y } = e;
    if (!d || !(d.active || Math.hypot(x - d.startX, y - d.startY) > DRAG_START)) return;
    const rects = new Map([...chips.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    setDrag({ ...d, active: true, x, y, order: dropOrder(d.order, d.id, x, y, rects, rtl) });
  };
  const release = () => {
    const d = live.current;
    if (d?.active) {
      dragged.current = true;
      moveTo(d.id, d.order.indexOf(d.id));
    }
    setDrag(null);
  };
  const askDelete = (g: Goal) => {
    if (confirm?.id === g.id) return setConfirm(null);
    const r = chips.current.get(g.id)?.getBoundingClientRect();
    const rtl = r && getComputedStyle(chips.current.get(g.id)!).direction === "rtl";
    // Hung from the chip's start edge it opens toward the end; when that would cross the screen's edge, from the other one.
    const room = r ? (rtl ? r.right : window.innerWidth - r.left) : Infinity;
    setConfirm({ id: g.id, edge: room >= CONFIRM_WIDTH + 16 ? "start" : "end" });
  };
  const finishRename = (g: Goal, name: string | null) => {
    if (name !== null) rename(g.id, name);
    setRenaming(null);
    requestAnimationFrame(() => chips.current.get(g.id)?.querySelector<HTMLButtonElement>("[data-chip-face]")?.focus());
  };

  return (
    <section aria-labelledby="goals-h" className="flex flex-col gap-3">
      <h2 id="goals-h" className="text-lg font-semibold">
        {r2.form.goalsHeading}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {goals.map((g) => {
          const on = g.id === current?.id;
          const lifted = drag?.active && drag.id === g.id;
          return (
            <li
              key={g.id}
              ref={(el) => {
                if (el) chips.current.set(g.id, el);
                else chips.current.delete(g.id);
              }}
              data-goal-chip={g.id}
              style={slot ? { order: slot.get(g.id) } : undefined}
              className={cx("relative inline-flex items-center rounded-full border border-border bg-card select-none", lifted && "opacity-40 border-dashed")}
            >
              {renaming === g.id ? (
                <RenameInput goal={g} onDone={(name) => finishRename(g, name)} />
              ) : (
                <button
                  type="button"
                  data-chip-face
                  aria-current={on}
                  onPointerDown={(e) => press(e, g)}
                  onPointerMove={follow}
                  onPointerUp={release}
                  onLostPointerCapture={release}
                  onPointerCancel={() => setDrag(null)}
                  onClick={() => {
                    if (dragged.current) dragged.current = false;
                    else select(g.id);
                  }}
                  onDoubleClick={() => setRenaming(g.id)}
                  className={cx("sec-chip gap-1.5", many && "ps-2.5 touch-pan-y", many && (lifted ? "cursor-grabbing" : "cursor-grab"), on && "sec-chip-on")}
                >
                  {many && <IconGrip size={14} className="opacity-60 shrink-0" />}
                  <bdi>{goalTitle(g)}</bdi>
                </button>
              )}
              {on && renaming !== g.id && (
                <>
                  <Button variant="icon" className="size-9 rounded-full" aria-label={r2.form.renameGoal} title={r2.form.renameGoal} onClick={() => setRenaming(g.id)}>
                    <IconEdit size={16} />
                  </Button>
                  {!fresh && (
                    <Button variant="icon" className="size-9 rounded-full me-0.5" aria-label={r2.form.deleteGoal} title={r2.form.deleteGoal} aria-expanded={confirm?.id === g.id} onClick={() => askDelete(g)}>
                      <IconTrash size={16} />
                    </Button>
                  )}
                </>
              )}
              {confirm?.id === g.id && (
                <div style={{ width: CONFIRM_WIDTH }} className={cx("absolute top-full mt-1 z-[var(--z-popover)] rounded-lg border border-border bg-popover p-3 shadow-md flex flex-col gap-2", confirm.edge === "start" ? "start-0" : "end-0")} onKeyDown={(e) => e.key === "Escape" && setConfirm(null)}>
                  <span className="text-sm">{r2.strip.confirm}</span>
                  <span className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        remove(g.id);
                        setConfirm(null);
                      }}
                    >
                      {r2.strip.confirmYes}
                    </Button>
                    <Button variant="quiet" onClick={() => setConfirm(null)}>
                      {r2.strip.confirmNo}
                    </Button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
        <li style={slot ? { order: goals.length } : undefined}>
          <Button variant="quiet" onClick={add}>
            <IconPlus size={16} /> {r2.form.addGoal}
          </Button>
        </li>
      </ul>
      {many && <p className="text-sm text-muted-foreground max-w-measure">{r2.form.goalsLine}</p>}
      {drag?.active &&
        createPortal(
          <div aria-hidden="true" className="fixed z-[var(--z-popover)] pointer-events-none inline-flex items-center rounded-full border border-border bg-card shadow-lg cursor-grabbing" style={{ left: drag.x - drag.grabX, top: drag.y - drag.grabY, width: drag.width }}>
            <span className={cx("sec-chip gap-1.5 ps-2.5", drag.id === current?.id && "sec-chip-on")}>
              <IconGrip size={14} className="opacity-60 shrink-0" />
              <bdi>{goalTitle(byId.get(drag.id)!)}</bdi>
            </span>
            {drag.id === current?.id && (
              <span className="inline-flex text-foreground">
                <span className="size-9 inline-flex items-center justify-center">
                  <IconEdit size={16} />
                </span>
                <span className="size-9 inline-flex items-center justify-center">
                  <IconTrash size={16} />
                </span>
              </span>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}

/** The chip's name as a field: Enter or leaving the field keeps it, Escape goes back. Empty falls back to the preset's or the default title. */
function RenameInput({ goal, onDone }: { goal: Goal; onDone: (name: string | null) => void }) {
  const [value, setValue] = useState(goal.name);
  const ref = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);
  const fallback = goalTitle({ ...goal, name: "" });
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      type="text"
      dir="auto"
      value={value}
      maxLength={80}
      aria-label={r2.form.renameField}
      placeholder={fallback}
      size={Math.max(10, [...(value || fallback)].length + 2)}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          ref.current?.blur();
        } else if (e.key === "Escape") {
          cancelled.current = true;
          ref.current?.blur();
        }
      }}
      onBlur={() => onDone(cancelled.current ? null : value.trim())}
      className="min-h-target rounded-full border border-ring bg-background px-3.5 text-sm text-foreground outline-none"
    />
  );
}
