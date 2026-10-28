// Steps to try (founder, 2026-10-28, the indices page): each button names one step of a plan number and what it adds at the end; a
// press applies it, a second press puts the number back. The figure inside keeps its own sheet, so the button is a role, not a <button>.
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cx } from "./cx";
import { Tag } from "./tag";

export interface TryItem {
  id: string;
  /** The step in words ("עוד שנה"). */
  step: ReactNode;
  /** What it adds at the end, through the provenance component. */
  delta: ReactNode;
  /** The change as a plain number: the largest is named. */
  size: number;
  /** The step is applied now. */
  active: boolean;
}

const inControl = (e: MouseEvent<HTMLElement>) => {
  const hit = (e.target as Element).closest?.("a, button, [role=link]");
  return !!hit && e.currentTarget.contains(hit);
};

export function TryButtons({ items, onToggle, lead, most, activeNote }: { items: TryItem[]; onToggle: (id: string) => void; lead?: ReactNode; most: string; activeNote?: ReactNode }) {
  const top = Math.max(0, ...items.map((i) => i.size));
  const key = (id: string) => (e: KeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    onToggle(id);
  };
  return (
    <div className="flex flex-col gap-2">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((i) => (
          <div
            key={i.id}
            role="button"
            tabIndex={0}
            aria-pressed={i.active}
            onClick={(e) => !inControl(e) && onToggle(i.id)}
            onKeyDown={key(i.id)}
            className={cx(
              "flex flex-col gap-0.5 min-h-target rounded-lg border p-3 cursor-pointer select-none transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring",
              i.active ? "border-entered bg-entered/10" : "border-border bg-card hover:bg-accent",
            )}
          >
            <span className="text-sm text-muted-foreground">{i.step}</span>
            <span className="font-semibold whitespace-nowrap">{i.delta}</span>
            {top > 0 && i.size === top && <Tag className="self-start mt-1">{most}</Tag>}
          </div>
        ))}
      </div>
      {activeNote && items.some((i) => i.active) && <p className="text-sm text-muted-foreground">{activeNote}</p>}
    </div>
  );
}
