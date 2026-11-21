// The template picker (method §10.6): a sheet that lists the templates for the deal's kind, the houses' price lists for a securities account
// or the tracks of a provident-family kind grouped by company, with a box that filters them by name. The tracks' head names the deal's
// product, and each track is listed by its short name (D54: the company and the product cut from it, the group's head already says them);
// the box finds a track by its full name or its short one, or by its company. A price list says under its name how
// many of its lines it leaves out of the deal; a house whose price list prints several ways to buy what the deal holds lists them under its
// name, each a row with its trade price, which fills the deal with that plan; a track says at its end the yearly fee on the savings its
// pick fills. On opening, the focus is
// in the box, and the arrow keys go from it down the rows and back (`TemplateList`, which the indices page's popup holds too). A pick is the page's: opened from the bar it opens a new deal from the template and never
// changes the one on screen; opened from the builder's track step it sets the track on the deal on screen (`pickTrack`).
// Under the builder's strip, which names the template, the deal a template filled says what its price leaves out (`TemplateNote`): what the
// house's record says (D106), and each line the template left out, by its name, under why, in a sheet.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import { countPhrase, formatValue } from "../../lib/format";
import { matching, rowTitle, templateSource, type LeftOut, type TemplateOption } from "../../lib/fee-deal/templates";
import { Sheet } from "../Sheet";
import { Term, type SheetPart } from "../provenance";
import { GroupHead, HouseAverageTerm, LeftOutLine, ListRow, RowList, SearchField, Tag, gershayim } from "../kit";
import type { HouseAverages } from "../../lib/house-averages";
import type { LeftOutView } from "../../lib/left-out";
import type { SiteValue } from "../../lib/value";
import { feeName } from "./words";

const w = copy.picker;
const f = copy.filled;

/** What a price list's row says it leaves out: a count of its lines, or that it has none for what the deal holds. */
export function leavesText(left: readonly LeftOut[] | undefined): string | undefined {
  if (!left || left.length === 0) return undefined;
  return countPhrase(left.length, w.leaves);
}


/** What a track's row says at its end: the yearly fee on the savings its pick fills ("0.52% בשנה מהחיסכון"), as its source prints it. */
const savingText = (v: SiteValue | undefined): string | undefined => (v && typeof v.value === "number" ? `${formatValue(v.value, v.unit)} ${w.saving}` : undefined);

/** The words of a template list: its box's label and clear, what it says where no template matches, and the head of the houses' price lists. */
export interface TemplateListWords {
  search: string;
  clear: string;
  none: string;
  houses: string;
}

/**
 * The templates to pick from: a box that filters them by name, then their rows in groups (the houses' price lists under one head, the
 * tracks by company), each row saying what its pick leaves out of the deal or, for a track, the yearly fee it fills. Once `focus` is true
 * the focus is in the box, and the arrow keys go from it down the rows and back. The picker's sheet holds it, and so does the indices
 * page's popup to start a new deal.
 */
export function TemplateList({ options, left, focus, words, onPick }: {
  options: readonly TemplateOption[];
  /** What each price list leaves out of the deal, by its id (none for a track: the new deal says it). */
  left: ReadonlyMap<string, readonly LeftOut[]>;
  /** Whether the list is on screen: the focus goes to its box then. */
  focus: boolean;
  words: TemplateListWords;
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  // the focus starts in the box, once the list is on screen (a sheet that holds it has opened)
  useEffect(() => {
    if (!focus) return;
    const t = requestAnimationFrame(() => search.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [focus]);
  // the arrow keys: down from the box to the first row, then row to row; up from the first row back to the box
  const step = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const all = [...(rows.current?.querySelectorAll<HTMLElement>("li > button") ?? [])];
    const at = all.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? all[at + 1] : at > 0 ? all[at - 1] : at === 0 ? search.current : null;
    if (!next) return;
    e.preventDefault();
    next.focus();
  };
  const tracks = options.some((o) => o.source === "track");
  const groups = useMemo(() => {
    const shown = matching(options, query);
    const by = new Map<string, TemplateOption[]>();
    for (const o of shown) {
      const g = o.source === "track" ? o.company : words.houses;
      by.set(g, [...(by.get(g) ?? []), o]);
    }
    return [...by.entries()];
  }, [options, query, words.houses]);
  return (
    <>
      <SearchField label={words.search} labelHidden value={query} onChange={setQuery} clearLabel={words.clear} inputRef={search} onKeyDown={step} />
      {groups.length === 0 ? (
        <p className="text-muted-foreground">{words.none}</p>
      ) : (
        <div ref={rows} onKeyDown={step} className="flex flex-col gap-4">
          {groups.map(([group, items]) => (
            <div key={group} className="flex flex-col gap-2">
              <GroupHead count={tracks ? items.length : undefined}>{group}</GroupHead>
              <RowList label={group}>
                {items.map((o) => (
                  <ListRow key={o.id} title={rowTitle(o)} meta={o.source === "track" ? savingText(o.saving) : leavesText(left.get(o.id))} onSelect={() => onPick(o.id)} />
                ))}
              </RowList>
            </div>
          ))}
        </div>
      )}
    </>
  );
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
  const tracks = options.some((o) => o.source === "track");
  const head = tracks ? w.track : w.house;
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="center" height={80} labelledBy={headId}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id={headId} className="text-lg font-semibold">
              {head.title}
            </h2>
            {tracks && product && <Tag tone="outline" shape="roomy">{product}</Tag>}
          </div>
          <p className="text-sm text-muted-foreground">{newDeal ? `${head.lede} ${w.newDeal}` : head.lede}</p>
        </div>
        <TemplateList options={options} left={left} focus={open} words={PICKER_WORDS} onPick={onPick} />
      </div>
    </Sheet>
  );
}

const PICKER_WORDS: TemplateListWords = { search: w.search, clear: w.clear, none: w.none, houses: w.house.group };

/**
 * A left line as the reader reads it: its name as the price list prints it, its channel where the list prices channels apart, and the
 * house of its list where that is not the template's (a fee copied from another house's list), so lines of the same name from two houses
 * stand apart.
 */
const lineText = (l: { line: string; name?: string; channel?: string; house?: string }): string => {
  const channel = l.channel ? copy.cases.values.channel[l.channel] : undefined;
  return `${gershayim(l.name ?? l.line)}${channel ? `${copy.cases.sep}${channel}` : ""}${l.house ? `${dealCases.copyFee.houseSep}${gershayim(l.house)}` : ""}`;
};

/** The sheet of what a template left out: a track's fee with why, then a price list's lines, each by its name under why (a group). */
export function leftParts(left: readonly LeftOut[]): SheetPart[] {
  const parts: SheetPart[] = [];
  const lines = new Map<string, Set<string>>();
  for (const l of left) {
    if ("line" in l) lines.set(l.why, (lines.get(l.why) ?? new Set()).add(lineText(l)));
    else parts.push({ ...(l.why === "no-value" ? { head: feeName(l.fee) } : {}), text: f.why[l.why === "no-value" ? "track-no-value" : l.why]! });
  }
  for (const [why, names] of lines) for (const name of names) parts.push({ group: f.why[why]!, text: name });
  return parts;
}

/**
 * What the price of a deal a template filled leaves out, on one line: what the house's record says its price leaves out that can change what
 * some reader pays (`leftOut`, the kit's line that opens each with its reason and page, D106), then the template's own lines or fees that
 * stayed out of the deal, whose words open them: a price list's lines by their names under why each is left, a track's fee the product does
 * not charge by rule or the regulator's data has no figure for; then the words that open what the house charged on average (F-122). The
 * template's name is the strip's step, not said here.
 */
export function TemplateNote({ template, left, leftOut = null, averages }: { template: { id: string; name: string }; left: readonly LeftOut[]; leftOut?: LeftOutView | null; /** What the house charged on average (F-122), for reference only. */ averages?: HouseAverages }) {
  const source = templateSource(template.id);
  const parts = leftParts(left);
  const name = gershayim(template.name);
  const more = [
    parts.length > 0 && (
      <Term key="lines" id={[]} name={f.title[source](name)} lead={f.lead[source]} parts={parts}>
        {f.count[source](parts.length)}
      </Term>
    ),
    averages && averages.columns.length > 0 && <HouseAverageTerm key="averages" averages={averages.columns} house={name} from={averages.from} to={averages.to} page={averages.page} />,
  ].filter(Boolean);
  if (!leftOut && more.length === 0) return null;
  return (
    <div className="flex items-center">
      <LeftOutLine view={leftOut} house={name} className="text-sm" more={more.length > 0 && more.flatMap((m, i) => (i ? [" · ", m] : [m]))} />
    </div>
  );
}
