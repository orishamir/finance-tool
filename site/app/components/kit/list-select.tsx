// The choice of one name out of a few, drawn by the kit in place of the browser's own list (`InlineSelect` uses it): a button that names
// the chosen option, and under it, while it is open, a list in the popover's panel (`DROP_PANEL`), each option a 44 px row, the chosen one
// marked by a check and bold words, the one the keys or the pointer are on lit. The button is a select-only combobox: the focus stays on it
// and `aria-activedescendant` names the lit option of the listbox. ArrowDown, ArrowUp, Enter, Space, Home, End or a letter open the list;
// open, the arrows, Home, End and the Page keys move the light, letters typed in a row jump to the first option that starts with them,
// Enter, Space or a press choose, Tab chooses and moves on, Escape closes it with nothing chosen, and a press outside closes it. The list is
// in the top layer (a manual popover), so no box that clips (a band, a sheet's body) cuts it, and it stays a part of the control's own tree,
// so an open dialog around the control does not make it inert. It opens under the button, or over it where only that side holds it, its
// inline start on the button's, and scrolls inside where neither side holds it all (`dropRoom`).
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { IconCheck } from "../icons";
import { cx } from "./cx";
import { DROP_PANEL, DROP_ROW, dropRoom, usePressAway } from "./drop-list";

/** An option: its id (null for the option that chooses none, a list's "all") and its name. */
export interface ListOption {
  id: string | null;
  name: string;
}

/** Letters typed within this long of each other are one search. */
const TYPE_PAUSE = 500;
/** How many rows PageUp and PageDown move. */
const PAGE = 10;
/** The gap between the button and the list. */
const GAP = 4;
/** The least room kept between the list and the window's sides. */
const SIDE = 8;

/**
 * The option a search of `typed` lands on, the light on option `at`: the first option from the one after it (from it, once the search is
 * longer than a letter) whose name starts with the search, round the list's end; a search of one letter typed again moves on among the
 * options that start with it, as a native list does. -1 where none starts with it.
 */
export function seekOption(names: readonly string[], typed: string, at: number): number {
  const n = names.length;
  if (n === 0 || typed === "") return -1;
  const same = [...typed].every((c) => c === typed[0]);
  const find = (q: string, from: number) => {
    for (let i = 0; i < n; i++) {
      const k = (from + i) % n;
      if (names[k]!.toLocaleLowerCase("he").startsWith(q)) return k;
    }
    return -1;
  };
  const q = typed.toLocaleLowerCase("he");
  const hit = find(q, q.length === 1 ? at + 1 : Math.max(at, 0));
  return hit >= 0 || !same ? hit : find(q[0]!, at + 1);
}

/** The next light from `at` on a key, in a list of `n` options; null for a key that does not move it. */
export function lightAfter(key: string, at: number, n: number): number | null {
  const last = n - 1;
  switch (key) {
    case "ArrowDown":
      return Math.min(at + 1, last);
    case "ArrowUp":
      return Math.max(at - 1, 0);
    case "Home":
      return 0;
    case "End":
      return last;
    case "PageDown":
      return Math.min(at + PAGE, last);
    case "PageUp":
      return Math.max(at - PAGE, 0);
    default:
      return null;
  }
}

/** What the caller draws: the button's props (its look and words are the caller's), the label's ids, and the list while it is open. */
export interface ListSelectParts {
  open: boolean;
  /** The label's own id and the button's: a `<label htmlFor={buttonId} id={labelId}>` names the control. */
  labelId: string;
  buttonId: string;
  button: {
    ref: RefObject<HTMLButtonElement | null>;
    id: string;
    type: "button";
    role: "combobox";
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-labelledby": string;
    "aria-activedescendant": string | undefined;
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
    onBlur: () => void;
  };
  list: ReactNode;
}

/** A select-only combobox over `options`, `value` the chosen id; `onChange` is called only with another option than the chosen one. */
export function useListSelect({ options, value, onChange }: { options: readonly ListOption[]; value: string | null; onChange: (id: string | null) => void }): ListSelectParts {
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;
  const buttonId = `${id}-button`;
  const optionId = (k: number) => `${id}-o${k}`;
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef({ text: "", at: 0 });
  const chosen = Math.max(0, options.findIndex((o) => o.id === value));
  const names = options.map((o) => o.name);

  const openAt = (k: number) => {
    setLight(Math.min(Math.max(k, 0), options.length - 1));
    setOpen(true);
  };
  const close = () => setOpen(false);
  const choose = (k: number) => {
    const o = options[k];
    close();
    button.current?.focus();
    if (o && o.id !== value) onChange(o.id);
  };
  // a letter typed adds to the search, which a pause ends; where it lands, or -1
  const typeAhead = (c: string, at: number) => {
    const now = Date.now();
    const s = search.current;
    s.text = now - s.at > TYPE_PAUSE ? c : s.text + c;
    s.at = now;
    return seekOption(names, s.text, at);
  };
  const searching = () => search.current.text !== "" && Date.now() - search.current.at <= TYPE_PAUSE;
  const letter = (e: KeyboardEvent) => e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAt(chosen);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        openAt(e.key === "Home" ? 0 : options.length - 1);
      } else if (letter(e)) {
        e.preventDefault();
        const hit = typeAhead(e.key, chosen);
        openAt(hit >= 0 ? hit : chosen);
      }
      return;
    }
    if (e.key === "Escape") {
      // the list closes, and only the list: a sheet or a dialog around it stays open
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === "Enter" || (e.key === " " && !searching())) {
      e.preventDefault();
      e.stopPropagation();
      choose(light);
    } else if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      choose(light);
    } else if (e.key === "Tab") {
      // the lit option is chosen and the focus goes on, as Tab leaves a native list
      const o = options[light];
      close();
      if (o && o.id !== value) onChange(o.id);
    } else if (letter(e) || e.key === " ") {
      e.preventDefault();
      const hit = typeAhead(e.key, light);
      if (hit >= 0) setLight(hit);
    } else {
      const next = lightAfter(e.key, light, options.length);
      if (next === null) return;
      e.preventDefault();
      setLight(next);
    }
  };

  usePressAway(open, [button, list], close);

  // the list in the top layer, placed by the button: under it, or over it where only that side holds it, its inline start on the button's
  // and kept inside the window's sides, again as the page scrolls or the window changes size
  useLayoutEffect(() => {
    const el = list.current;
    if (!open || !el) return;
    try {
      el.showPopover?.();
    } catch {
      // a browser without popovers draws it fixed where it stands
    }
    const place = () => {
      const b = button.current?.getBoundingClientRect();
      if (!b) return;
      const s = el.style;
      s.maxHeight = "";
      const width = document.documentElement.clientWidth;
      const r = dropRoom(b, el.scrollHeight, 0, window.innerHeight);
      s.maxHeight = r.room === null ? "" : `${r.room}px`;
      s.top = r.up ? "" : `${b.bottom + GAP}px`;
      s.bottom = r.up ? `${window.innerHeight - b.top + GAP}px` : "";
      s.minWidth = `${b.width}px`;
      const rtl = getComputedStyle(el).direction === "rtl";
      const w = el.offsetWidth;
      if (rtl) {
        s.left = "";
        s.right = `${Math.max(SIDE, Math.min(width - b.right, width - w - SIDE))}px`;
      } else {
        s.right = "";
        s.left = `${Math.max(SIDE, Math.min(b.left, width - w - SIDE))}px`;
      }
    };
    place();
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open]);
  // the lit option in view, in a list that scrolls
  useEffect(() => {
    if (open) document.getElementById(optionId(light))?.scrollIntoView({ block: "nearest" });
  }, [open, light]); // eslint-disable-line react-hooks/exhaustive-deps

  const listbox = open ? (
    <ul
      ref={list}
      id={listId}
      role="listbox"
      aria-labelledby={labelId}
      tabIndex={-1}
      popover="manual"
      // a press on the list keeps the focus on the button, and is no press on a box around it (a figure's box gives its own field the focus)
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={cx("fixed m-0 inset-auto overflow-y-auto overscroll-contain", DROP_PANEL)}
    >
      {options.map((o, k) => {
        const on = k === chosen && options[k]!.id === value;
        return (
          <li
            key={o.id ?? ""}
            id={optionId(k)}
            role="option"
            aria-selected={on}
            data-lit={k === light ? "" : undefined}
            onPointerMove={() => k !== light && setLight(k)}
            onClick={() => choose(k)}
            className={cx(DROP_ROW, "cursor-pointer select-none text-sm", k === light && "bg-accent")}
          >
            <IconCheck size={16} aria-hidden className={cx("shrink-0", !on && "invisible")} />
            <bdi className={cx("min-w-0 truncate", on && "font-semibold")}>{o.name}</bdi>
          </li>
        );
      })}
    </ul>
  ) : null;

  return {
    open,
    labelId,
    buttonId,
    button: {
      ref: button,
      id: buttonId,
      type: "button",
      role: "combobox",
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      "aria-controls": listId,
      "aria-labelledby": labelId,
      "aria-activedescendant": open ? optionId(light) : undefined,
      onClick: () => (open ? close() : openAt(chosen)),
      onKeyDown,
      // the focus leaving the button for anything but the list closes it
      onBlur: () =>
        requestAnimationFrame(() => {
          const a = document.activeElement;
          if (a !== button.current && !list.current?.contains(a)) close();
        }),
    },
    list: listbox,
  };
}

/**
 * The names of every option stacked in one place, name `at` seen and the rest kept unseen, so the button is as wide as its longest name and
 * no wider, and keeps that width whichever is chosen.
 */
export function NameStack({ names, at, className }: { names: readonly string[]; at: number; className?: string }) {
  return (
    <span className="grid min-w-0">
      {names.map((n, k) => (
        <span key={k} className={cx("min-w-0 truncate [grid-area:1/1]", k !== at && "invisible", className)} aria-hidden={k === at ? undefined : true}>
          {n}
        </span>
      ))}
    </span>
  );
}
