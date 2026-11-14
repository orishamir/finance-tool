// One item of a list chosen from a drop-down that sits in a line of text (the indices page's title: "… להשקיע במדד [S&P 500 ⌄] לאורך
// זמן"): a 44 px button that shows the chosen item and a chevron, and under it the list. The items are links (a page each) or buttons;
// an item the person added can be renamed in place or deleted after a question, as `ChipList` does for pills (or at once, where the page
// can undo it); the last row adds one. A row may carry a muted line under its name that tells two rows apart. The list opens upward where
// the window (or a box around it that clips) has no room for it below the button, and scrolls inside where neither side holds it.
// A native select cannot hold the rename, the delete or the add, so this is a disclosure: the button says whether the list is open, the
// arrow keys move between the rows, Escape and a tap outside close it and give the focus back to the button, and the focus leaving the
// list (a Tab past its last row) closes it. In a heading, the button stays in the heading's words and the list is drawn in `listHost`, an
// element after the heading, placed under the button: a heading holds no list of controls, and the Tab order still runs from the button
// into the list.
import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { Pencil, Plus } from "lucide-react";
import { IconCheck, IconChevronDown } from "../icons";
import { Button } from "./button";
import { RenameInput, type ChipListWords } from "./chip-list";
import { RemoveButton } from "./remove-button";
import { cx } from "./cx";
import { DROP_PANEL, DROP_ROW, dropRoom, usePressAway } from "./drop-list";

export interface MenuItem {
  id: string;
  label: string;
  /** A link row (a page per item); without it the row is a button calling `onSelect`. */
  href?: string;
  /** The row carries a pencil (rename in place) and a bin (delete, after a question); needs `onRename` / `onDelete` and `words`. */
  editable?: boolean;
  /** A muted line under the name (what the item is, when it was saved), so two rows of one name can be told apart. */
  meta?: string;
}

const ic = { strokeWidth: 1.75, "aria-hidden": true } as const;

export function MenuPicker({ name, items, value, placeholder, buttonLabel, words, onSelect, onFollow, onRename, onDelete, deleteAsks = true, add, listHost }: {
  /** The list's spoken name ("המדד"). */
  name: string;
  items: MenuItem[];
  /** The chosen item's id; null shows `placeholder`. */
  value: string | null;
  placeholder: string;
  /** The button's words in place of the chosen item, where the button names the list rather than what is chosen in it ("העסקאות שלי · 3"):
   *  the chosen item is still marked in the list. */
  buttonLabel?: string;
  /** Needed only when an item can be renamed or deleted (the same words `ChipList` takes). */
  words?: ChipListWords;
  onSelect?: (id: string) => void;
  /** A link the page follows itself, to answer the tap before the next page is laid out (useSwapGlide); a plain link without it. */
  onFollow?: (href: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  /** Whether the bin asks first; a page that can undo a delete deletes at once and offers the undo. */
  deleteAsks?: boolean;
  /** The last row, with a plus: starts adding an item. */
  add?: { label: string; onClick: () => void };
  /** Where the list is drawn when the button stands inside a heading: a positioned element right after the heading (the list is placed
   *  under the button); without it the list is drawn under the button, inside the picker. */
  listHost?: HTMLElement | null;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const root = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const chosen = items.find((i) => i.id === value) ?? null;
  // the list opens upward where it has less room under the button than over it and too little for the list; the room is the window's,
  // cut by any box around the picker that clips what overflows it (a panel that scrolls on its own). Where neither side holds the whole
  // list, it takes the larger side's room and scrolls inside.
  const [up, setUp] = useState(false);
  const [room, setRoom] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!open || listHost) return;
    const b = button.current?.getBoundingClientRect();
    if (!b) return;
    let top = 0, bottom = window.innerHeight;
    for (let el = root.current?.parentElement; el; el = el.parentElement) {
      if (getComputedStyle(el).overflowY === "visible") continue;
      const r = el.getBoundingClientRect();
      top = Math.max(top, r.top);
      bottom = Math.min(bottom, r.bottom);
    }
    const r = dropRoom(b, list.current?.scrollHeight ?? 0, top, bottom);
    setUp(r.up);
    setRoom(r.room);
  }, [open, listHost, items.length]);
  // in a host: the list's place under the button, measured against the host, again when the window changes size
  const [at, setAt] = useState<CSSProperties | null>(null);
  useLayoutEffect(() => {
    if (!open || !listHost) return;
    const place = () => {
      const b = button.current?.getBoundingClientRect();
      if (!b) return;
      const h = listHost.getBoundingClientRect();
      const rtl = getComputedStyle(listHost).direction === "rtl";
      setAt({ top: b.bottom - h.top + 4, insetInlineStart: rtl ? h.right - b.right : b.left - h.left, minWidth: b.width });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, listHost]);

  const close = (focus = true) => {
    setOpen(false);
    setRenaming(null);
    setConfirm(null);
    if (focus) button.current?.focus();
  };
  // a press outside the picker closes it, and leaves the focus where the press put it
  usePressAway(open, [root, list], () => close(false));

  const faces = () => [...(list.current?.querySelectorAll<HTMLElement>("[data-menu-face]") ?? [])];
  const move = (by: number | "first" | "last") => {
    const all = faces();
    if (all.length === 0) return;
    const at = all.indexOf(document.activeElement as HTMLElement);
    const next = by === "first" ? 0 : by === "last" ? all.length - 1 : (at + by + all.length) % all.length;
    all[next]!.focus();
  };
  const onListKey = (e: KeyboardEvent) => {
    if (renaming) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      move(e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      move(e.key === "Home" ? "first" : "last");
    }
  };
  const onButtonKey = (e: KeyboardEvent) => {
    // a list opened by a press leaves the focus on the button: Escape there closes the list, and only the list
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => move("first"));
  };
  const finishRename = (item: MenuItem, next: string | null) => {
    if (next !== null) onRename?.(item.id, next);
    setRenaming(null);
    requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-menu-id="${CSS.escape(item.id)}"] [data-menu-face]`)?.focus());
  };
  // the focus leaving the list for another control but the button (a Tab past its last row, a Shift+Tab before its first) closes it;
  // read after the frame, where the focus has landed: a row's own control that goes (the rename field, the delete question) leaves it on
  // the page's body for a moment, and the rename gives it back to its row
  const onListBlur = () =>
    requestAnimationFrame(() => {
      const a = document.activeElement;
      if (!open || !a || a === document.body || list.current?.contains(a) || a === button.current) return;
      close(false);
    });
  const face = cx(DROP_ROW, "hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring");

  const menu = (
    <ul
      ref={list}
      id={`${id}-list`}
      aria-label={name}
      onKeyDown={onListKey}
      onBlur={onListBlur}
      style={listHost ? (at ?? undefined) : room !== null ? { maxHeight: room } : undefined}
      className={cx(
        "absolute z-[var(--z-popover)]",
        DROP_PANEL,
        !listHost && cx("start-0 min-w-full", up ? "bottom-full mb-1" : "top-full mt-1", room !== null && "overflow-y-auto"),
      )}
    >
      {items.map((item) => {
        const on = item.id === value;
        const inner = (
          <>
            <IconCheck size={16} className={cx("shrink-0", !on && "invisible")} />
            {item.meta ? (
              <span className="flex min-w-0 flex-col py-1">
                <bdi className={cx("min-w-0 truncate", on && "font-semibold")}>{item.label}</bdi>
                <span className="text-sm text-muted-foreground">{item.meta}</span>
              </span>
            ) : (
              <bdi className={cx("min-w-0 truncate", on && "font-semibold")}>{item.label}</bdi>
            )}
          </>
        );
        return (
          <li key={item.id} data-menu-id={item.id} className="flex flex-col">
            <span className="flex items-center gap-1">
              {renaming === item.id ? (
                <RenameInput initial={item.label} placeholder={item.label} label={words?.renameField ?? ""} onDone={(n) => finishRename(item, n)} />
              ) : item.href ? (
                <Link
                  to={item.href}
                  data-menu-face
                  aria-current={on ? "page" : undefined}
                  className={face}
                  onClick={(e) => {
                    // a plain tap: the page follows it itself; a new tab stays the browser's
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    close(false);
                    if (!onFollow || on) return;
                    e.preventDefault();
                    onFollow(item.href!);
                  }}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  data-menu-face
                  aria-current={on}
                  className={face}
                  onClick={() => {
                    close();
                    onSelect?.(item.id);
                  }}
                >
                  {inner}
                </button>
              )}
              {item.editable && renaming !== item.id && (
                <>
                  {onRename && (
                    <Button variant="icon" className="size-9 tap-area rounded-full shrink-0" aria-label={`${words?.rename ?? ""}: ${item.label}`} title={words?.rename} onClick={() => setRenaming(item.id)}>
                      <Pencil size={16} {...ic} />
                    </Button>
                  )}
                  {onDelete && (
                    <RemoveButton
                      label={`${words?.remove ?? ""}: ${item.label}`}
                      {...(deleteAsks ? { expanded: confirm === item.id } : {})}
                      onRemove={() => {
                        if (deleteAsks) return setConfirm((c) => (c === item.id ? null : item.id));
                        close();
                        onDelete(item.id);
                      }}
                    />
                  )}
                </>
              )}
            </span>
            {confirm === item.id && (
              <span className="flex flex-col gap-2 rounded-md bg-card p-3 m-1">
                <span className="text-sm">{words?.confirm}</span>
                <span className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setConfirm(null);
                      close();
                      onDelete?.(item.id);
                    }}
                  >
                    {words?.confirmYes}
                  </Button>
                  <Button variant="quiet" onClick={() => setConfirm(null)}>
                    {words?.confirmNo}
                  </Button>
                </span>
              </span>
            )}
          </li>
        );
      })}
      {add && (
        <li className="flex border-t border-border mt-0.5 pt-0.5">
          <button
            type="button"
            data-menu-face
            className={cx(face, "text-link")}
            onClick={() => {
              close();
              add.onClick();
            }}
          >
            <Plus size={16} {...ic} />
            <span>{add.label}</span>
          </button>
        </li>
      )}
    </ul>
  );
  return (
    <span ref={root} className="relative inline-block align-middle text-start">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={buttonLabel ?? `${name}: ${chosen?.label ?? placeholder}`}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={onButtonKey}
        className="inline-flex max-w-full items-center gap-3 min-h-target rounded-md border border-input bg-card ps-4 pe-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
      >
        <bdi className="truncate">{buttonLabel ?? chosen?.label ?? placeholder}</bdi>
        <IconChevronDown size={18} className={cx("shrink-0 text-muted-foreground transition-transform duration-[var(--duration-fast)]", open && "rotate-180")} />
      </button>
      {open && (listHost ? at && createPortal(menu, listHost) : menu)}
    </span>
  );
}

