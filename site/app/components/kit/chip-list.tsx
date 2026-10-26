// A list of things the person can choose among, add to, rename, delete or put in order (design-system 11): the goals board's
// pills, moved here whole (2026-10-25). The chosen pill is light on dark; it carries a pencil (rename in place) and a bin
// (delete, after a "are you sure" popover) when the item is editable; a pill is dragged sideways to reorder; the last pill
// adds one (dashed). A pill with `href` is a link (a page per item), otherwise a button calling `onSelect`.
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./button";
import { cx } from "./cx";

/** Pixels the pointer travels before a press on a pill becomes a drag; a shorter press is a click. */
const DRAG_START = 6;
/** The delete question's width: one line for the question and its two buttons. */
const CONFIRM_WIDTH = 264;

export interface ChipItem {
  id: string;
  label: string;
  /** A link pill (a page per item). Without it the pill is a button calling `onSelect`. */
  href?: string;
  /** The chosen pill shows the pencil and the bin (needs `onRename` / `onDelete`). */
  editable?: boolean;
  /** Counts toward drag to reorder (needs `onMove`). */
  movable?: boolean;
}

export interface ChipListWords {
  /** The delete question, e.g. "למחוק את המטרה מהמכשיר הזה?". */
  confirm: string;
  confirmYes: string;
  confirmNo: string;
  rename: string;
  remove: string;
  /** The rename field's accessible name. */
  renameField: string;
}

export interface ChipListProps {
  heading: string;
  /** Beside the heading, smaller and muted; wraps under it when the line is full. */
  note?: ReactNode;
  items: ChipItem[];
  /** The chosen pill's id. */
  value: string | null;
  words: ChipListWords;
  onSelect?: (id: string) => void;
  /** `name` is trimmed and may be empty; the page decides what an empty name means. */
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  /** The bin is hidden for an item this returns false for (the single fresh goal). */
  canRemove?: (id: string) => boolean;
  /** Reorder: the id and the place (index) it lands in. */
  onMove?: (id: string, to: number) => void;
  /** The name the rename field starts with (default: the label). */
  renameInitial?: (id: string) => string;
  /** What the rename field shows when empty (default: the label). */
  renamePlaceholder?: (id: string) => string;
  /** The last pill: dashed, with a plus. */
  add?: { label: string; onClick: () => void; expanded?: boolean };
  /** Under the list, inside the section (a line about the order). */
  footer?: ReactNode;
  headingId?: string;
}

interface Drag {
  id: string;
  /** The order shown while dragging; the dragged pill's own place in it is the drop slot. */
  order: string[];
  startX: number;
  startY: number;
  /** Where the pill was grabbed, so the floating copy stays under the pointer at that spot. */
  grabX: number;
  grabY: number;
  width: number;
  x: number;
  y: number;
  active: boolean;
}

/**
 * Where a dragged pill lands: beside the pill nearest the pointer, on the side of that pill's middle the pointer is on.
 * Distance across rows counts double, so a wrapped row's pills win over the row above or below.
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

const ic = { strokeWidth: 1.75, "aria-hidden": true } as const;

export function ChipList({ heading, headingId, note, items, value, words, onSelect, onRename, onDelete, canRemove, onMove, renameInitial, renamePlaceholder, add, footer }: ChipListProps) {
  const [drag, setDragState] = useState<Drag | null>(null);
  /** The drag as the pointer handlers last left it (they can run before React renders the previous move). */
  const live = useRef<Drag | null>(null);
  const setDrag = (d: Drag | null) => {
    live.current = d;
    setDragState(d);
  };
  const [renaming, setRenaming] = useState<string | null>(null);
  /** The pill asking "delete?", and which of its edges the question hangs from so it stays on the screen. */
  const [confirm, setConfirm] = useState<{ id: string; edge: "start" | "end" } | null>(null);
  const pills = useRef(new Map<string, HTMLLIElement>());
  /** A drag just ended on this pill: the click the browser sends after it is not a select. */
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
    const close = (e: MouseEvent) => !pills.current.get(confirm.id)?.contains(e.target as Node) && setConfirm(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [confirm]);

  const movable = onMove ? items.filter((i) => i.movable).length > 1 : false;
  const byId = new Map(items.map((i) => [i.id, i]));
  // The drop preview reorders the pills with CSS `order` only: moving the dragged pill's node in the page would make the
  // browser drop its pointer capture, and the drop would never arrive.
  const slot = drag?.active ? new Map(drag.order.map((id, i) => [id, i])) : null;
  const canEdit = (i: ChipItem) => i.id === value && i.editable;
  const hasRename = (i: ChipItem) => canEdit(i) && !!onRename;
  const hasBin = (i: ChipItem) => canEdit(i) && !!onDelete && (canRemove ? canRemove(i.id) : true);

  const press = (e: ReactPointerEvent<HTMLButtonElement>, i: ChipItem) => {
    dragged.current = false;
    const li = pills.current.get(i.id);
    if (!movable || !i.movable || e.button !== 0 || !li) return;
    const r = li.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id: i.id, order: items.map((x) => x.id), startX: e.clientX, startY: e.clientY, grabX: e.clientX - r.left, grabY: e.clientY - r.top, width: r.width, x: e.clientX, y: e.clientY, active: false });
  };
  const follow = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = live.current;
    const { clientX: x, clientY: y } = e;
    if (!d || !(d.active || Math.hypot(x - d.startX, y - d.startY) > DRAG_START)) return;
    const rects = new Map([...pills.current].map(([id, el]) => [id, el.getBoundingClientRect()]));
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    setDrag({ ...d, active: true, x, y, order: dropOrder(d.order, d.id, x, y, rects, rtl) });
  };
  const release = () => {
    const d = live.current;
    if (d?.active) {
      dragged.current = true;
      onMove?.(d.id, d.order.indexOf(d.id));
    }
    setDrag(null);
  };
  const askDelete = (i: ChipItem) => {
    if (confirm?.id === i.id) return setConfirm(null);
    const el = pills.current.get(i.id);
    const r = el?.getBoundingClientRect();
    const rtl = el && getComputedStyle(el).direction === "rtl";
    // Hung from the pill's start edge it opens toward the end; when that would cross the screen's edge, from the other one.
    const room = r ? (rtl ? r.right : window.innerWidth - r.left) : Infinity;
    setConfirm({ id: i.id, edge: room >= CONFIRM_WIDTH + 16 ? "start" : "end" });
  };
  const finishRename = (i: ChipItem, name: string | null) => {
    if (name !== null) onRename?.(i.id, name);
    setRenaming(null);
    requestAnimationFrame(() => pills.current.get(i.id)?.querySelector<HTMLElement>("[data-chip-face]")?.focus());
  };

  const faceClass = (i: ChipItem, lifted: boolean) => cx("sec-chip gap-1.5 min-w-0 max-w-full", movable && i.movable && "ps-2.5 touch-pan-y", movable && i.movable && (lifted ? "cursor-grabbing" : "cursor-grab"), i.id === value && "sec-chip-on");
  const inside = (i: ChipItem) => (
    <>
      {movable && i.movable && <GripVertical size={14} className="opacity-60 shrink-0" {...ic} />}
      <bdi className="block truncate">{i.label}</bdi>
    </>
  );

  return (
    <section aria-labelledby={headingId} aria-label={headingId ? undefined : heading} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 id={headingId} className="text-lg font-semibold">
          {heading}
        </h2>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((i) => {
          const on = i.id === value;
          const lifted = !!drag?.active && drag.id === i.id;
          return (
            <li
              key={i.id}
              ref={(el) => {
                if (el) pills.current.set(i.id, el);
                else pills.current.delete(i.id);
              }}
              data-chip-id={i.id}
              style={slot ? { order: slot.get(i.id) } : undefined}
              className={cx("relative inline-flex max-w-full items-center rounded-full border border-border bg-card select-none", lifted && "opacity-40 border-dashed")}
            >
              {renaming === i.id ? (
                <RenameInput initial={renameInitial ? renameInitial(i.id) : i.label} placeholder={renamePlaceholder ? renamePlaceholder(i.id) : i.label} label={words.renameField} onDone={(name) => finishRename(i, name)} />
              ) : i.href ? (
                <Link to={i.href} data-chip-face aria-current={on ? "page" : undefined} className={faceClass(i, false)}>
                  {inside(i)}
                </Link>
              ) : (
                <button
                  type="button"
                  data-chip-face
                  aria-current={on}
                  onPointerDown={(e) => press(e, i)}
                  onPointerMove={follow}
                  onPointerUp={release}
                  onLostPointerCapture={release}
                  onPointerCancel={() => setDrag(null)}
                  onClick={() => {
                    if (dragged.current) dragged.current = false;
                    else onSelect?.(i.id);
                  }}
                  onDoubleClick={() => hasRename(i) && setRenaming(i.id)}
                  className={faceClass(i, lifted)}
                >
                  {inside(i)}
                </button>
              )}
              {renaming !== i.id && (
                <>
                  {hasRename(i) && (
                    <Button variant="icon" className="size-9 rounded-full" aria-label={words.rename} title={words.rename} onClick={() => setRenaming(i.id)}>
                      <Pencil size={16} {...ic} />
                    </Button>
                  )}
                  {hasBin(i) && (
                    <Button variant="icon" className="size-9 rounded-full me-0.5" aria-label={words.remove} title={words.remove} aria-expanded={confirm?.id === i.id} onClick={() => askDelete(i)}>
                      <Trash2 size={16} {...ic} />
                    </Button>
                  )}
                </>
              )}
              {confirm?.id === i.id && (
                <div style={{ width: CONFIRM_WIDTH }} className={cx("absolute top-full mt-1 z-[var(--z-popover)] rounded-lg border border-border bg-popover p-3 shadow-md flex flex-col gap-2", confirm.edge === "start" ? "start-0" : "end-0")} onKeyDown={(e) => e.key === "Escape" && setConfirm(null)}>
                  <span className="text-sm">{words.confirm}</span>
                  <span className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete?.(i.id);
                        setConfirm(null);
                      }}
                    >
                      {words.confirmYes}
                    </Button>
                    <Button variant="quiet" onClick={() => setConfirm(null)}>
                      {words.confirmNo}
                    </Button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
        {add && (
          <li style={slot ? { order: items.length } : undefined}>
            <button type="button" aria-expanded={add.expanded} onClick={add.onClick} className="sec-chip-add gap-1.5">
              <Plus size={16} {...ic} /> {add.label}
            </button>
          </li>
        )}
      </ul>
      {footer}
      {drag?.active &&
        byId.get(drag.id) &&
        createPortal(
          <div aria-hidden="true" className="fixed z-[var(--z-popover)] pointer-events-none inline-flex items-center rounded-full border border-border bg-card shadow-lg cursor-grabbing" style={{ left: drag.x - drag.grabX, top: drag.y - drag.grabY, width: drag.width }}>
            <span className={cx("sec-chip gap-1.5 ps-2.5", drag.id === value && "sec-chip-on")}>
              <GripVertical size={14} className="opacity-60 shrink-0" {...ic} />
              <bdi>{byId.get(drag.id)!.label}</bdi>
            </span>
            {drag.id === value && (
              <span className="inline-flex text-foreground">
                {hasRename(byId.get(drag.id)!) && (
                  <span className="size-9 inline-flex items-center justify-center">
                    <Pencil size={16} {...ic} />
                  </span>
                )}
                {hasBin(byId.get(drag.id)!) && (
                  <span className="size-9 inline-flex items-center justify-center">
                    <Trash2 size={16} {...ic} />
                  </span>
                )}
              </span>
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}

/** The pill's name as a field: Enter or leaving the field keeps it, Escape goes back. */
function RenameInput({ initial, placeholder, label, onDone }: { initial: string; placeholder: string; label: string; onDone: (name: string | null) => void }) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      type="text"
      dir="rtl"
      value={value}
      maxLength={80}
      aria-label={label}
      placeholder={placeholder}
      size={Math.max(10, [...(value || placeholder)].length + 2)}
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
      className="min-h-target rounded-full border border-ring bg-background px-3.5 text-sm text-foreground outline-none text-mixed"
    />
  );
}
