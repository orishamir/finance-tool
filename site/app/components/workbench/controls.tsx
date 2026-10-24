// The workbench's controls (design-spec 11.3): exposure chips, filter and sort, and the provider tab placeholder.
import { r3workbench as copy } from "../../copy";
import type { SortKey } from "../../lib/workbench";
import { IconSearch } from "../icons";
import { cx, SegmentedControl } from "../ui";

export function ExposureChips({ groups, open, onToggle, onAll }: { groups: { key: string; label: string; count: number }[]; open: Set<string>; onToggle: (key: string) => void; onAll: () => void }) {
  const all = groups.every((g) => open.has(g.key));
  return (
    <div role="group" aria-label={copy.chips.aria} className="-mx-gutter px-gutter flex gap-2 overflow-x-auto scrollbar-none md:flex-wrap md:overflow-visible md:mx-0 md:px-0">
      <button type="button" aria-pressed={all} onClick={onAll} className={cx("sec-chip shrink-0", all && "sec-chip-on")}>
        {copy.chips.all}
      </button>
      {groups.map((g) => (
        <button key={g.key} type="button" aria-pressed={open.has(g.key)} onClick={() => onToggle(g.key)} className={cx("sec-chip shrink-0", open.has(g.key) && "sec-chip-on")}>
          <bdi>{g.label}</bdi>
          <span aria-hidden="true">&nbsp;·&nbsp;</span>
          <bdi dir="ltr" className="tabular-nums">{g.count}</bdi>
        </button>
      ))}
    </div>
  );
}

export function WorkbenchControls({ filter, sort, onFilter, onSort }: { filter: string; sort: SortKey; onFilter: (v: string) => void; onSort: (v: SortKey) => void }) {
  return (
    <div className="sticky top-14 lg:static z-[var(--z-sticky)] bg-background/95 backdrop-blur lg:backdrop-blur-none -mx-gutter px-gutter py-2 lg:mx-0 lg:px-0 lg:py-0 flex flex-col gap-2 lg:gap-3 border-b border-border lg:border-b-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
        <div className="field-box text-muted-foreground lg:w-80 lg:shrink-0">
          <IconSearch size={18} />
          <label htmlFor="wb-filter" className="sr-only">
            {copy.filter}
          </label>
          <input id="wb-filter" dir="auto" value={filter} onChange={(e) => onFilter(e.target.value)} placeholder={copy.filter} className="field-input !text-start" autoComplete="off" />
        </div>
        <SegmentedControl<SortKey>
          label={copy.sort.aria}
          value={sort}
          onChange={onSort}
          className="lg:max-w-2xl [&_button]:px-1.5 lg:[&_button]:px-3 [&_button]:leading-tight"
          options={(["company", "fee-balance", "fee-deposit", "name"] as const).map((v) => ({ value: v, label: copy.sort[v] }))}
        />
      </div>
      <p className="text-xs text-muted-foreground">{copy.notAnOffer}</p>
    </div>
  );
}
