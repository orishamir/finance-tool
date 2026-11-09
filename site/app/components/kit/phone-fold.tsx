// A page's controls that fold on a phone (design-system 11): below md, one line says what is chosen and opens the controls; from md they
// stand open and the line is gone. For filters ahead of a list, so the list starts on a phone's first screen (the deposits page).
import { useId, useState, type ReactNode } from "react";
import { IconChevronDown } from "../icons";
import { cx } from "./cx";

export function PhoneFold({ summary, more, less, children }: { /** What is chosen, in a few words ("שנה · מ־10,000 ₪ · ריבית קבועה"). */ summary: ReactNode; /** The line's word while folded ("שינוי"). */ more: string; /** Its word while open ("סגירה"). */ less: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((x) => !x)} className="md:hidden flex items-center justify-between gap-3 min-h-12 px-3 py-2 rounded-md border border-input bg-card text-start text-sm cursor-pointer">
        <span className="min-w-0">{summary}</span>
        <span className="inline-flex items-center gap-1 shrink-0 text-link">
          {open ? less : more}
          <IconChevronDown size={18} className={cx("transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
        </span>
      </button>
      <div id={id} className={cx("flex-col gap-4", open ? "flex" : "hidden md:flex")}>
        {children}
      </div>
    </div>
  );
}
