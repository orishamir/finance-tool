// A long text on a row of a list whose rows must keep their heights (#190, fourth pass: on a phone the account list held about 450 px of
// blank because a house's grey row carried its record's nine-line reason in one state and a two-line price in the other). The text shows
// its first two lines; the rest opens at the person's own tap, as a fold does, and closes again. The toggle is a 44 px target that takes
// no more height than a line of text, and stands only when the text is cut.
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./cx";

/** `open` and `onOpenChange`: kept by the list, so its held height starts over when a text opens or closes. `more`/`less`: the toggle's words. */
export function ClampedText({ children, open, onOpenChange, more, less, className }: { children: ReactNode; open: boolean; onOpenChange: (open: boolean) => void; more: string; less: string; className?: string }) {
  const text = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLSpanElement>(null);
  // whether the text is cut is read in the same layout pass, before the list around it measures its rows (a state set here came a render
  // late, after the list had held its height, and the first pick moved it 40 px)
  useLayoutEffect(() => {
    const el = text.current;
    if (!el || !toggle.current) return;
    toggle.current.hidden = !(open || el.scrollHeight > el.clientHeight + 1);
  });
  return (
    <span className={cx("flex flex-col items-start", className)}>
      <span ref={text} className={cx(!open && "line-clamp-2")}>
        {children}
      </span>
      <span ref={toggle} hidden className="block -my-3">
        <Button
          variant="quiet"
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(!open);
          }}
          className="px-1 underline underline-offset-[3px] hover:no-underline"
        >
          {open ? less : more}
        </Button>
      </span>
    </span>
  );
}
