// Tabs that switch what one part of a page shows, without leaving it (the rules page's five questions, and its search's "בחוק ובכללים"
// and "אצל חברות"): buttons in a tab list, each with the number of rows it holds, the chosen one underlined as PageTabs and the site's
// menu are. The arrow keys move between tabs (right to left: the left arrow is the next tab), Home and End to the ends. On a phone the
// strip scrolls sideways and the chosen tab is kept in view; with `wrap`, a wider screen breaks it onto a second line. `end` sits at the far end of the line (a page's filters).
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { fmt } from "../../lib/format";
import { cx } from "./cx";

export interface StripTab {
  key: string;
  label: ReactNode;
  count?: number;
}

/** The ids a tab panel names its tab by: `${idBase}-tab-${key}`, and the panel `${idBase}-panel`. */
export const tabId = (idBase: string, key: string) => `${idBase}-tab-${key}`;
export const panelId = (idBase: string) => `${idBase}-panel`;

export function TabStrip({ tabs, current, onChange, ariaLabel, idBase, end, wrap, className }: { tabs: StripTab[]; current: string; onChange: (key: string) => void; ariaLabel: string; idBase: string; end?: ReactNode; /** From 768 px the tabs wrap onto a second line instead of scrolling (more tabs than the column is wide). */ wrap?: boolean; className?: string }) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    const box = list.current;
    if (!el || !box || box.scrollWidth <= box.clientWidth) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);
  const keys = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = tabs.findIndex((t) => t.key === current);
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "ArrowLeft" ? (rtl ? 1 : -1) : e.key === "ArrowRight" ? (rtl ? -1 : 1) : 0;
    const to = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : step ? (i + step + tabs.length) % tabs.length : -1;
    if (to < 0) return;
    e.preventDefault();
    const next = tabs[to]!;
    onChange(next.key);
    requestAnimationFrame(() => document.getElementById(tabId(idBase, next.key))?.focus());
  };
  return (
    <div className={cx("flex items-end gap-3 border-b border-border min-w-0", className)}>
      <div ref={list} role="tablist" aria-label={ariaLabel} className={cx("flex flex-1 min-w-0 gap-x-5 -mb-px overflow-x-auto scrollbar-none", wrap && "md:flex-wrap md:overflow-visible")}>
        {tabs.map((t) => {
          const on = t.key === current;
          return (
            <button
              key={t.key}
              id={tabId(idBase, t.key)}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={panelId(idBase)}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.key)}
              onKeyDown={keys}
              className={cx("min-h-target md:min-h-9 md:tap-area shrink-0 inline-flex items-center gap-1.5 border-b-2 font-medium whitespace-nowrap transition-colors duration-[var(--duration-fast)]", on ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              {t.label}
              {t.count !== undefined && (
                <bdi dir="ltr" className="text-[13px] font-normal tabular-nums text-muted-foreground">
                  {fmt.number(t.count)}
                </bdi>
              )}
            </button>
          );
        })}
      </div>
      {end && <div className="shrink-0 flex items-center gap-2 pb-1">{end}</div>}
    </div>
  );
}
