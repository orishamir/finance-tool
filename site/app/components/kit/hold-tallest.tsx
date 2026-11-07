// A block held at the tallest of its cases, when the cases are too many to keep laid out in the page as LongestCase keeps them (#190, the
// stairs' lanes on the indices page: a lane lists every account, every kind or every fund from where the person stands, so it has as many
// cases as there are starts). The cases are laid out unseen once, measured and dropped; they are laid out again only when `id` or the
// block's width changes, never when a figure does, so a slider costs nothing here. The cases are a function, called only then.
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Unseen } from "./longest-case";

export function HoldTallest({ id, cases, children, className }: { /** What the cases depend on (an index, a list): another id measures again. */ id: string; cases: () => ReactNode[]; children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState<{ id: string; width: number; height: number } | null>(null);
  // the cases are laid out only while measuring: never in the pre-rendered page, and gone again before the browser paints
  const [measuring, setMeasuring] = useState(false);
  // another id or another width: lay the cases out (a layout effect, so the frame painted already holds the new height)
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const check = () => {
      const width = Math.round(el.getBoundingClientRect().width);
      if (width > 0 && (!held || held.id !== id || held.width !== width)) setMeasuring(true);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, held]);
  useLayoutEffect(() => {
    if (!measuring || !probe.current || !box.current) return;
    const kids = [...probe.current.children] as HTMLElement[];
    const height = Math.ceil(Math.max(0, ...kids.map((k) => k.getBoundingClientRect().height)));
    setHeld({ id, width: Math.round(box.current.getBoundingClientRect().width), height });
    setMeasuring(false);
  }, [measuring, id]);
  return (
    <div ref={box} className={cx("relative", className)} style={held ? { minHeight: held.height } : undefined}>
      {children}
      {measuring && (
        <div ref={probe} aria-hidden="true" className="invisible absolute inset-x-0 top-0 h-0 overflow-hidden">
          <Unseen>
            {cases().map((x, i) => (
              <div key={i}>{x}</div>
            ))}
          </Unseen>
        </div>
      )}
    </div>
  );
}
