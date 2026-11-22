import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { RangeControls, RangeField, startText, type RangeFieldProps } from "./fields";
import { cx } from "./cx";
import { dropRoom } from "./drop-list";

export type Knob = RangeFieldProps & {
  id: string;
  /** Tiles only: the tile's own id, for a control elsewhere that opens it (an `EmptyState`'s action clicks it); a generated one without it. */
  tileId?: string;
};

/**
 * How the knobs stand. `columns`: each a `RangeField`, two columns on a computer, one on a phone, a row of four on a wide one. `tiles`: each
 * a tile that shows its number, and a tap on it opens its slider in a popup over the page (`KnobTiles`), so the card stays short and what the
 * slider moves stays in sight behind it.
 */
export type KnobLayout = "columns" | "tiles";

/**
 * The plan's numbers as controls that stay on screen, for a page meant to be played with (the indices page), in one of two layouts
 * (`KnobLayout`). The result across a range is `ResultCurves`.
 */
export function KnobStrip({ knobs, lead, layout = "columns" }: { knobs: Knob[]; lead?: ReactNode; layout?: KnobLayout }) {
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      {layout === "tiles" ? (
        <KnobTiles knobs={knobs} />
      ) : (
        <div className={cx("grid gap-x-6 gap-y-1 md:grid-cols-2", knobs.length === 4 && "xl:grid-cols-4")}>
          {knobs.map((k) => (
            <RangeField key={k.id} {...k} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The gap between a tile and its popup, and the least room kept between the popup and the window's sides. */
const GAP = 6;
const SIDE = 8;

/**
 * The tiles: a small muted label over the number, large, in the entered blue once the person changed it. In a narrow box the first two
 * stand side by side and the rest three to a row; in a wide one (from 42rem) all stand in one row. A tile is a button: a tap, Enter or Space
 * opens its popup, a second one closes it, another tile's moves the popup there. The popup holds the number's box, its reset as the ↺ icon
 * beside it (shown once the value differs from its start) and its slider; it is a manual popover in the top layer, placed by script under
 * its tile, or over it where only that side has the room, and kept inside the window, so opening it moves nothing on the page. On open the
 * focus goes to the box, or to the popup itself when a finger opened it (a box with the focus raises the phone's keyboard over what the
 * slider moves, and a slider with the focus makes the next tap on the box answer late); Escape closes it and gives the tile the focus back,
 * a press outside it or the focus leaving it closes it. Tab from the open tile goes into the popup, and out of it back to the tile or on to
 * the next tile.
 */
function KnobTiles({ knobs }: { knobs: Knob[] }) {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(null);
  const tiles = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const byFinger = useRef(false);
  const tileIdOf = (k: Knob) => k.tileId ?? `${uid}-tile-${k.id}`;
  const knob = knobs.find((k) => k.id === open) ?? null;
  const at = knob ? knobs.indexOf(knob) : -1;
  const popId = `${uid}-pop`;
  const tileOf = (k: Knob | null | undefined) => (k ? document.getElementById(tileIdOf(k)) : null);

  // the popup in the top layer, by its tile, again as the page scrolls or the window changes size; the focus into it as it opens
  const tileNow = useEffectEvent(() => tileOf(knob));
  useLayoutEffect(() => {
    const el = pop.current;
    if (!open || !el) return;
    try {
      if (!el.matches(":popover-open")) el.showPopover?.();
    } catch {
      // a browser without popovers draws it fixed where it stands
    }
    const place = () => {
      const t = tileNow()?.getBoundingClientRect();
      if (!t) return;
      const h = el.offsetHeight;
      const w = el.offsetWidth;
      const width = document.documentElement.clientWidth;
      const { up } = dropRoom(t, h, 0, window.innerHeight);
      el.style.top = `${up ? t.top - GAP - h : t.bottom + GAP}px`;
      el.style.left = `${Math.max(SIDE, Math.min(t.left + t.width / 2 - w / 2, width - w - SIDE))}px`;
    };
    place();
    window.addEventListener("scroll", place, { capture: true, passive: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open]);
  useLayoutEffect(() => {
    const el = pop.current;
    if (open && el) (byFinger.current ? el : el.querySelector<HTMLInputElement>("input:not([type=range])"))?.focus({ preventScroll: true });
  }, [open]);

  // a press outside the popup and the tiles closes it; a press on a tile is the tile's own (it closes or moves the popup)
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (pop.current?.contains(t) || (t instanceof Element && t.closest("[data-knob-tile]") && tiles.current?.contains(t))) return;
      setOpen(null);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const close = (back: boolean) => {
    const tile = tileOf(knob);
    setOpen(null);
    if (back) tile?.focus();
  };
  /** What takes the focus inside the popup, in order: the box, the reset while it shows, the slider. */
  const stops = () => [...(pop.current?.querySelectorAll<HTMLElement>("input, button") ?? [])].filter((e) => e.checkVisibility({ visibilityProperty: true }));
  const onPopKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      const list = stops();
      const next = e.shiftKey ? (e.target === list[0] || e.target === pop.current ? tileOf(knob) : null) : e.target === list[list.length - 1] ? tileOf(knobs[at + 1]) : null;
      if (!next) return;
      e.preventDefault();
      if (!e.shiftKey) setOpen(null);
      next.focus();
    }
  };
  const onTileKey = (e: KeyboardEvent<HTMLButtonElement>, k: Knob) => {
    if (k.id !== open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(null);
    } else if (e.key === "Tab" && !e.shiftKey) {
      const first = stops()[0];
      if (!first) return;
      e.preventDefault();
      first.focus();
    }
  };
  // the focus gone by the keys to something outside the popup and the tiles closes it
  const onPopBlur = (e: FocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget;
    if (to && !pop.current?.contains(to) && !tiles.current?.contains(to)) setOpen(null);
  };

  return (
    <div className="@container">
      <div ref={tiles} className="grid grid-cols-6 gap-2 @2xl:grid-cols-5">
        {knobs.map((k, n) => {
          const on = k.id === open;
          return (
            <button
              key={k.id}
              type="button"
              id={tileIdOf(k)}
              data-knob-tile=""
              aria-expanded={on}
              aria-controls={on ? popId : undefined}
              disabled={k.disabled}
              onPointerDown={(e) => {
                byFinger.current = e.pointerType === "touch";
              }}
              onClick={(e) => {
                // Enter, Space and a click from code come with no pointer
                if (e.detail === 0) byFinger.current = false;
                setOpen(on ? null : k.id);
              }}
              onKeyDown={(e) => onTileKey(e, k)}
              className={cx(
                "flex min-h-target min-w-0 flex-col items-start gap-0.5 rounded-md border bg-card px-3 py-2 text-start transition-colors duration-(--duration-fast) hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60 @2xl:col-span-1",
                n < 2 ? "col-span-3" : "col-span-2",
                on ? "border-primary" : "border-input",
              )}
            >
              <span id={`${tileIdOf(k)}-l`} className="max-w-full text-xs text-muted-foreground">
                {k.label}
              </span>
              <bdi dir="ltr" className={cx("text-lg font-semibold tabular-nums", k.isEntered ? "text-entered" : "text-foreground")}>
                {k.value === null ? "" : startText(k.value, k.unit)}
              </bdi>
            </button>
          );
        })}
      </div>
      {knob && (
        <div
          ref={pop}
          id={popId}
          popover="manual"
          tabIndex={-1}
          onKeyDown={onPopKey}
          onBlur={onPopBlur}
          className="fixed m-0 inset-auto outline-none w-80 max-w-[calc(100vw-1rem)] touch-pan-y rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md"
        >
          {/* a fresh box for each number: what was typed in one never shows in another */}
          <RangeControls key={knob.id} {...knob} labelledBy={`${tileIdOf(knob)}-l`} />
        </div>
      )}
    </div>
  );
}
