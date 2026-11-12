// The template picker (method §10.6): a sheet that lists the templates for the deal's kind, the houses' price lists for a securities account
// or the tracks of a provident-family kind grouped by company, with a box that filters them by name. The tracks' head names the deal's
// product, and each track is listed by its short name (D54: the company and the product cut from it, the group's head already says them);
// the box finds a track by its full name or its short one, or by its company. A price list says under its name how
// many of its lines it leaves out of the deal. A pick is the page's: opened from the bar it opens a new deal from the template and never
// changes the one on screen; opened from the builder's track step it sets the track on the deal on screen (`pickTrack`).
// The deal a template filled says so in the builder (`TemplateNote`), with what the template left out and why.
import { useId, useMemo, useState } from "react";
import { feeDeal as copy } from "../../copy";
import { countPhrase } from "../../lib/format";
import { templateSource, type LeftOut, type TemplateOption } from "../../lib/fee-deal/templates";
import { Sheet } from "../Sheet";
import { Disclosure, GroupHead, ListRow, RowList, SearchField, Tag } from "../kit";
import { feeName } from "./words";

const w = copy.picker;
const f = copy.filled;

/** What a price list's row says it leaves out: a count of its lines, or that it has none for what the deal holds. */
export function leavesText(left: readonly LeftOut[] | undefined): string | undefined {
  if (!left || left.length === 0) return undefined;
  if (left.some((l) => l.why === "no-holding")) return w.noHolding;
  return countPhrase(left.length, w.leaves);
}

/** A row's title: a track's short name where it has one, else the template's name. */
export const rowTitle = (o: TemplateOption): string => (o.source === "track" ? (o.short ?? o.name) : o.name);

/** The templates whose name, a track's short name or its company holds the words typed. */
export function matching(options: readonly TemplateOption[], query: string): readonly TemplateOption[] {
  const q = query.trim();
  if (!q) return options;
  return options.filter((o) => o.name.includes(q) || (o.source === "track" && (o.short?.includes(q) || o.company.includes(q))));
}

export function TemplatePicker({ open, onClose, anchor, options, left, newDeal, product, onPick }: {
  open: boolean;
  onClose: () => void;
  /** The button the sheet opened from; the focus goes back to it. */
  anchor: HTMLElement | null;
  options: readonly TemplateOption[];
  /** What each price list leaves out of the deal, by its id (none for a track: the new deal says it). */
  left: ReadonlyMap<string, readonly LeftOut[]>;
  /** Whether a pick opens a new deal (the bar's picker), which the lede then says. */
  newDeal: boolean;
  /** The deal's product, as the site names it: the tracks' head says them. */
  product: string | null;
  onPick: (id: string) => void;
}) {
  const headId = useId();
  const [query, setQuery] = useState("");
  const tracks = options.some((o) => o.source === "track");
  const head = tracks ? w.track : w.house;
  const groups = useMemo(() => {
    const shown = matching(options, query);
    const by = new Map<string, TemplateOption[]>();
    for (const o of shown) {
      const g = o.source === "track" ? o.company : w.house.group;
      by.set(g, [...(by.get(g) ?? []), o]);
    }
    return [...by.entries()];
  }, [options, query]);

  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="center" height={80} labelledBy={headId}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id={headId} className="text-lg font-semibold">
              {head.title}
            </h2>
            {tracks && product && <Tag tone="outline" shape="pill">{product}</Tag>}
          </div>
          <p className="text-sm text-muted-foreground">{newDeal ? `${head.lede} ${w.newDeal}` : head.lede}</p>
        </div>
        <SearchField label={w.search} labelHidden value={query} onChange={setQuery} clearLabel={w.clear} />
        {groups.length === 0 ? (
          <p className="text-muted-foreground">{w.none}</p>
        ) : (
          groups.map(([group, items]) => (
            <div key={group} className="flex flex-col gap-2">
              <GroupHead count={tracks ? items.length : undefined}>{group}</GroupHead>
              <RowList label={group}>
                {items.map((o) => (
                  <ListRow key={o.id} title={rowTitle(o)} meta={leavesText(left.get(o.id))} onSelect={() => onPick(o.id)} />
                ))}
              </RowList>
            </div>
          ))
        )}
      </div>
    </Sheet>
  );
}

/**
 * The template a deal was filled from, and what it left out: a price list's lines counted by why, a price list with nothing for what the
 * deal holds, a track's fee the product does not charge by rule or the regulator's data has no figure for.
 */
export function TemplateNote({ template, left }: { template: { id: string; name: string }; left: readonly LeftOut[] }) {
  const lines = new Map<string, number>();
  const rest: { key: string; fee?: string; why: string }[] = [];
  for (const l of left) {
    if ("line" in l) lines.set(l.why, (lines.get(l.why) ?? 0) + 1);
    else if ("fee" in l) rest.push({ key: l.fee, ...(l.why === "no-value" ? { fee: feeName(l.fee) } : {}), why: f.why[l.why === "no-value" ? "track-no-value" : l.why]! });
    else rest.push({ key: l.why, why: f.why[l.why]! });
  }
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-muted-foreground">
        {f.from[templateSource(template.id)]}
        {template.name}
      </p>
      {left.length > 0 && (
        <Disclosure label={f.left} summaryClassName="text-sm">
          <ul className="flex flex-col gap-2 pt-1">
            {rest.map((r) => (
              <li key={r.key}>
                {r.fee && <span className="font-medium">{r.fee}: </span>}
                {r.why}
              </li>
            ))}
            {[...lines].map(([why, n]) => (
              <li key={why} className="flex flex-col">
                <span>{f.why[why]}</span>
                <span className="text-xs text-muted-foreground">{countPhrase(n, f.lines)}</span>
              </li>
            ))}
          </ul>
        </Disclosure>
      )}
    </div>
  );
}
