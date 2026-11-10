// A page's controls that fold on a phone (design-system 11): below md (or lg, with `below="lg"`), one line says what is chosen and opens the
// controls; from there up they stand open and the line is gone. For filters ahead of a list, so the list starts on a phone's first screen (the
// deposits page), and for a page's side list (`SidePage`). The page may hold the open state itself (`open`, `onOpenChange`).
import { useId, useState, type ReactNode } from "react";
import { IconChevronDown } from "../icons";
import { cx } from "./cx";

// "always" folds at every width and "never" stands open at every width: for a page that decides by measuring (`SidePage`)
const LINE = { md: "md:hidden", lg: "lg:hidden", always: "", never: "!hidden" } as const;
const BODY = { md: "hidden md:flex", lg: "hidden lg:flex", always: "hidden", never: "flex" } as const;

export function PhoneFold({ summary, more, less, children, below = "md", open: given, onOpenChange }: { /** What is chosen, in a few words ("שנה · מ־10,000 ₪ · ריבית קבועה"). */ summary: ReactNode; /** The line's word while folded ("שינוי"). */ more: string; /** Its word while open ("סגירה"). */ less: string; children: ReactNode; /** The width under which it folds. */ below?: "md" | "lg" | "always" | "never"; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [own, setOwn] = useState(false);
  const open = given ?? own;
  const set = (v: boolean) => (onOpenChange ? onOpenChange(v) : setOwn(v));
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => set(!open)} className={cx(LINE[below], "flex items-center justify-between gap-3 min-h-12 px-3 py-2 rounded-md border border-input bg-card text-start text-sm cursor-pointer")}>
        <span className="min-w-0">{summary}</span>
        <span className="inline-flex items-center gap-1 shrink-0 text-link">
          {open ? less : more}
          <IconChevronDown size={18} className={cx("transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
        </span>
      </button>
      <div id={id} className={cx("flex-col gap-4", open ? "flex" : BODY[below])}>
        {children}
      </div>
    </div>
  );
}
