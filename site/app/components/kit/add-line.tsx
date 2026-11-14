// What can be added to a list the person builds, as one quiet line under it: a dashed frame, a plus and a lead ("אפשר להוסיף:"), then a
// small chip for each thing. The only place the page speaks of what the list lacks.
import { useRef, type ReactNode } from "react";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { Plus } from "lucide-react";
import { cx } from "./cx";

export interface AddItem {
  id: string;
  label: ReactNode;
  /** One of the usual things for this list, set apart from the rarer ones by full-strength words and edge. */
  usual?: boolean;
}

/**
 * The chip that takes the focus once the chip at `at` added its thing and left the line: the one now in its place, else the last; none
 * where nothing was added, the line is empty, or the page gave the focus somewhere else meanwhile.
 */
export function chipAfterAdd(at: number | null, count: number, focusElsewhere: boolean): number | null {
  if (at === null || count === 0 || focusElsewhere) return null;
  return Math.min(at, count - 1);
}

/**
 * The chips are buttons that add their thing at once (the page then opens it). The usual ones come first in full ink, the rarer ones after
 * them in muted ink: the order and the ink set them apart, never colour alone. Each chip is 32 px tall with a 44 px tap area, which the
 * frame's 6 px above and below just holds; rows of
 * chips stand 12 px apart, so two areas never meet. A chip that added its thing leaves the line; the focus goes to the chip now in its
 * place (or the last one), so the keyboard stays in the line.
 */
export function AddLine({ lead, items, onAdd, className }: { lead: ReactNode; items: AddItem[]; onAdd: (id: string) => void; className?: string }) {
  const line = useRef<HTMLDivElement>(null);
  const added = useRef<number | null>(null);
  useIsoLayoutEffect(() => {
    const at = added.current;
    added.current = null;
    const chips = line.current?.querySelectorAll("button");
    const k = chipAfterAdd(at, chips?.length ?? 0, !!document.activeElement && document.activeElement !== document.body);
    if (k !== null) chips![k]!.focus({ preventScroll: true });
  }, [items]);
  if (items.length === 0) return null;
  return (
    <div ref={line} className={cx("flex flex-wrap items-center gap-x-2 gap-y-3 rounded-lg border border-dashed border-input px-3 py-1.5", className)}>
      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <Plus size={16} strokeWidth={1.75} aria-hidden className="text-primary" />
        {lead}
      </span>
      {items.map((it, k) => (
        <button
          key={it.id}
          type="button"
          onClick={() => {
            added.current = k;
            onAdd(it.id);
          }}
          className={cx("tap-area inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors duration-[var(--duration-fast)] hover:bg-accent", it.usual ? "border-input text-foreground font-medium" : "border-border text-muted-foreground")}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
