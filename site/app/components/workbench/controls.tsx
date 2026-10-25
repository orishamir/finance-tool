// The workbench's controls (design-spec 11.3): exposure chips (filters), search, sort (a second press reverses), the
// open-to-all toggle. On a phone the sticky block shrinks to the search row once the page is scrolled.
import { useEffect, useState } from "react";
import { r3workbench as copy } from "../../copy";
import { fmt } from "../../lib/format";
import type { SortDir, SortKey } from "../../lib/workbench";
import { IconChevronDown, IconSearch } from "../icons";
import { cx } from "../ui";

/** Chips filter: a press shows that group alone; "הכול" shows every group; the pressed chip again returns to the default. */
export function ExposureChips({ groups, open, onPress, onAll }: { groups: { key: string; label: string; count: number }[]; open: Set<string>; onPress: (key: string) => void; onAll: () => void }) {
  const all = groups.every((g) => open.has(g.key));
  return (
    <div role="group" aria-label={copy.chips.aria} className="-mx-gutter px-gutter flex gap-2 overflow-x-auto scrollbar-none md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
      <button type="button" aria-pressed={all} onClick={onAll} className={cx("sec-chip shrink-0", all && "sec-chip-on")}>
        {copy.chips.all}
      </button>
      {groups.map((g) => (
        <button key={g.key} type="button" aria-pressed={!all && open.has(g.key)} onClick={() => onPress(g.key)} className={cx("sec-chip shrink-0", !all && open.has(g.key) && "sec-chip-on")}>
          <bdi>{g.label}</bdi>
          <span aria-hidden="true">&nbsp;·&nbsp;</span>
          <bdi dir="ltr" className="tabular-nums">{g.count}</bdi>
        </button>
      ))}
    </div>
  );
}

/** True once the page is scrolled past `on` px; back to false under `off` (two limits, so the shrinking does not flicker). */
function useScrolled(on = 160, off = 40): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const read = () => setScrolled((was) => (was ? window.scrollY > off : window.scrollY > on));
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, [on, off]);
  return scrolled;
}

const sortKeys = ["company", "fee-balance", "fee-deposit", "name"] as const;

export function WorkbenchControls({
  filter,
  sort,
  dir,
  openToAll,
  hiddenCount,
  onFilter,
  onSort,
  onOpenToAll,
}: {
  filter: string;
  sort: SortKey;
  dir: SortDir;
  openToAll: boolean;
  /** Tracks open only to a sector or an employer's staff: how many the toggle hides. */
  hiddenCount: number;
  onFilter: (v: string) => void;
  onSort: (v: SortKey) => void;
  onOpenToAll: (v: boolean) => void;
}) {
  const compact = useScrolled();
  return (
    <div className="sticky top-14 lg:static [@media(max-height:500px)]:static z-[var(--z-sticky)] bg-background/95 backdrop-blur lg:backdrop-blur-none -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 flex flex-col gap-2 lg:gap-3 border-b border-border lg:border-b-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
        <div className="field-box text-muted-foreground lg:w-80 lg:shrink-0">
          <IconSearch size={18} />
          <label htmlFor="wb-filter" className="sr-only">
            {copy.filter}
          </label>
          <input id="wb-filter" dir="rtl" value={filter} onChange={(e) => onFilter(e.target.value)} placeholder={copy.filter} className="field-input !text-start text-mixed" autoComplete="off" />
        </div>
        <div role="group" aria-label={copy.sort.aria} className={cx("inline-flex w-full rounded-md bg-muted p-[3px] gap-[3px] lg:max-w-2xl", compact && "max-lg:hidden")}>
          {sortKeys.map((v) => {
            const on = sort === v;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={on}
                onClick={() => onSort(v)}
                className={cx(
                  "flex-1 min-h-target lg:min-h-10 px-1.5 lg:px-3 rounded-[5px] text-sm leading-tight inline-flex items-center justify-center gap-1 transition-colors duration-[var(--duration-fast)]",
                  on ? "bg-secondary font-medium text-foreground shadow-sm" : "text-foreground hover:bg-accent/60",
                )}
              >
                {copy.sort[v]}
                {on && (
                  <>
                    <IconChevronDown size={14} aria-hidden="true" className={cx(dir === "asc" && "rotate-180")} />
                    <span className="sr-only">{copy.sortDir[dir]}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <label className={cx("flex items-center gap-2 text-sm min-h-target lg:min-h-0 cursor-pointer", compact && "max-lg:hidden")}>
        <input type="checkbox" checked={openToAll} onChange={(e) => onOpenToAll(e.target.checked)} className="size-5 accent-[var(--primary)]" />
        <span className="font-medium whitespace-nowrap">{copy.openToAll.label}</span>
        <span className="text-muted-foreground">
          {openToAll ? (
            hiddenCount > 0 ? (
              <>
                · <bdi dir="ltr" className="tabular-nums">{fmt.number(hiddenCount)}</bdi> {copy.openToAll.hidden}
              </>
            ) : null
          ) : null}
        </span>
      </label>
      <p className={cx("text-xs text-muted-foreground", compact && "max-lg:hidden")}>{copy.notAnOffer}</p>
    </div>
  );
}
