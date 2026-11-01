// "הידעת?": short facts from the rule base, each with its source and a way to the whole rule (the rules page, 2026-11-01; meant for the
// guides too). Three at a time on a computer, a third fewer on a short screen, one on a phone; the next press brings the next ones, and
// every card keeps one height, sized for the longest fact.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./cx";
import { useSoftSwap } from "./soft-swap";

export interface FactItem {
  id: string;
  body: ReactNode;
  source: ReactNode;
  action: ReactNode;
}

const SHOWN = 3;

/** `items` in the order they should come; `orderKey` changes when that order does, and the block starts over. */
export function DidYouKnow({ title, items, more, orderKey, className }: { title: ReactNode; items: FactItem[]; more: string; orderKey: string; className?: string }) {
  const [at, setAt] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const started = useRef(orderKey);
  useEffect(() => {
    if (started.current === orderKey) return;
    started.current = orderKey;
    setAt(0);
  }, [orderKey]);
  const fade = useSoftSwap<HTMLDivElement>(`${orderKey}:${at}`);
  const next = () => {
    const visible = [...(list.current?.children ?? [])].filter((c) => (c as HTMLElement).offsetHeight > 0).length || 1;
    setAt((a) => (a + visible) % Math.max(items.length, 1));
  };
  const shown = Array.from({ length: Math.min(SHOWN, items.length) }, (_, i) => items[(at + i) % items.length]!);
  return (
    <aside className={cx("rounded-lg border border-info-border bg-card p-3 lg:p-4 flex flex-col gap-3 min-w-0", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div ref={fade}>
        <ul ref={list} className="flex flex-col gap-2.5 max-lg:[&>li:not(:first-child)]:hidden [@media(max-height:900px)]:[&>li:nth-child(3)]:hidden">
          {shown.map((f) => (
            <li key={f.id} className="rounded-md bg-background p-3 flex flex-col gap-1.5 text-[15px] leading-normal min-h-[216px] lg:min-h-[236px]">
              <p>{f.body}</p>
              <p className="mt-auto text-[13px] text-muted-foreground">{f.source}</p>
              <div className="text-sm">{f.action}</div>
            </li>
          ))}
        </ul>
      </div>
      <Button variant="secondary" onClick={next} className="self-start">
        {more}
      </Button>
    </aside>
  );
}
