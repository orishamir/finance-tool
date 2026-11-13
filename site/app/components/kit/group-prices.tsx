// Group prices (D43): who pays less than the ordinary customer, stated beside a ranking and never in it. Under a
// house's row one closed line names who gets another price and opens to one sub-row per price, in three columns: who, what is cheaper,
// until when. Entries whose short words for what is cheaper are the same are one sub-row (the data check makes entries with the same
// prices share those words). On a house's own page the same rows also say where each one's words stand.
import type { FeesSnapshot } from "@finance-tool/schema";
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { groupPrices as copy } from "../../copy";
import { cx } from "./cx";
import { Disclosure } from "./disclosure";
import { HelpMark } from "./help-mark";
import { isPdfUrl, sourceHref, type CitedPlace } from "../../lib/sources";
import { DocLink } from "./doc-link";
import { TableCols } from "./table-cols";
import { Tag } from "./tag";

type Groups = NonNullable<FeesSnapshot["groups"]>;
export type GroupEntry = Groups["entries"][number];
type Source = GroupEntry["who_source"];
type Fee = GroupEntry["prices"][number]["fee"];

export interface GroupBlock {
  /** What is cheaper, in the entries' own short words. */
  cheaper: string;
  entries: GroupEntry[];
  /** Every entry of the sub-row ends the same way: one "until when" for all. */
  sameEnd: boolean;
  /** The fees whose document names funds, over the sub-row's entries; `all` when every fee of the sub-row does. */
  funds: Fee[] | "all";
}

const FEES: Fee[] = ["trade_israel", "trade_abroad", "custody_israel", "custody_abroad"];
const ends = (e: GroupEntry) => e.ends_short_he ?? e.ends_he;

const priced = (e: GroupEntry) => e.prices.some((p) => p.value != null);

/**
 * The sub-rows, in the order the record lists its entries: one per short words for what is cheaper, a priced entry never with one not
 * priced (the data check fails such a pair, checkGroupWords).
 */
export function groupBlocks(entries: readonly GroupEntry[]): GroupBlock[] {
  const out: GroupBlock[] = [];
  for (const e of entries) {
    const cheaper = e.cheaper_he ?? e.name_he;
    const b = out.find((x) => x.cheaper === cheaper && priced(x.entries[0]!) === priced(e));
    if (b) b.entries.push(e);
    else out.push({ cheaper, entries: [e], sameEnd: true, funds: "all" });
  }
  for (const b of out) {
    b.sameEnd = b.entries.every((e) => ends(e) === ends(b.entries[0]!));
    // a fee names funds when one of the documents behind the sub-row says the price is for funds too
    const fees = FEES.filter((f) => b.entries.some((e) => e.prices.some((x) => x.fee === f)));
    const named = fees.filter((f) => b.entries.some((e) => e.prices.some((x) => x.fee === f && x.names_fund)));
    b.funds = named.length === fees.length ? "all" : named;
  }
  return out;
}

/**
 * The ages the priced young entries' short words print ("בגילאי 14 עד 21.5", "מגיל 14 עד 21", "מגיל 14", "עד גיל 25"): the youngest and the
 * oldest over them. An entry that is not priced (no price carries a value: the bank's advertising, D56, or a binding price not modelled) is not read. A bound one entry
 * leaves out is left out of the line too, so the line never tells someone in a group that the price is not theirs (Leumi's 18+ runs to 21
 * or the end of army service, whichever is later, which its short words do not try to say); null where an entry prints no age at all. The
 * data check holds every number of `who_short_he` to the entry's long words, so these are the documents' ages ("none
 * of them says what age counts as young").
 */
export function youngAges(entries: readonly GroupEntry[]): { from: string | null; to: string | null; /** Some groups print a top age and others none: the line says the top age differs by group (re-check F2: "מגיל 14" read as no upper age). */ topVaries?: true } | null {
  const young = entries.filter((e) => e.kind === "young" && e.prices.some((p) => p.value != null));
  if (young.length === 0) return null;
  const num = "(\\d+(?:\\.\\d+)?)";
  let from: number | null = null, to: number | null = null, fromOpen = false, toOpen = false, someTop = false;
  for (const e of young) {
    const w = e.who_short_he ?? "";
    const span = w.match(new RegExp(`(?:בגילאי|מגיל) ${num} עד (?:גיל )?${num}`));
    const lo = span?.[1] ?? w.match(new RegExp(`מגיל ${num}`))?.[1];
    const hi = span?.[2] ?? w.match(new RegExp(`עד גיל ${num}`))?.[1];
    if (lo === undefined && hi === undefined) return null;
    if (lo === undefined) fromOpen = true;
    else from = from === null ? Number(lo) : Math.min(from, Number(lo));
    if (hi === undefined) toOpen = true;
    else {
      to = to === null ? Number(hi) : Math.max(to, Number(hi));
      someTop = true;
    }
  }
  return { from: fromOpen || from === null ? null : String(from), to: toOpen || to === null ? null : String(to), ...(toOpen && someTop ? { topVaries: true as const } : {}) };
}

/** The closed line's words: each kind once (the young with their ages), and an other entry by its own short words, in the record's order. */
export function groupLineWho(entries: readonly GroupEntry[]): string[] {
  const out: string[] = [];
  const ages = youngAges(entries);
  for (const e of entries) {
    const w = e.kind === "other" ? (e.who_short_he ?? e.name_he) : e.kind === "young" && ages ? copy.youngAges(ages.from, ages.to, ages.topVaries) : (copy.kinds[e.kind] ?? e.name_he);
    if (!out.includes(w)) out.push(w);
  }
  return out;
}

/** "נוקב בקרנות רק בדמי הניהול": a pair of fees in both places is said once. */
function fundWords(named: Fee[]): string[] {
  const out: string[] = [];
  for (const base of ["trade", "custody"] as const) {
    const both = named.includes(`${base}_israel`) && named.includes(`${base}_abroad`);
    if (both) out.push(copy.fees[base]!);
    else for (const f of named) if (f.startsWith(base)) out.push(copy.fees[f]!);
  }
  return out;
}

function FundMark({ b }: { b: GroupBlock }) {
  if (b.funds === "all") return null;
  return <span className="block text-xs text-muted-foreground">{b.funds.length ? copy.fundsOnly(fundWords(b.funds)) : copy.noFund}</span>;
}

/** Where a sub-row's words stand: one link per page of a PDF, a sheet's rows as one, a web page once. */
function SourceLinks({ entries }: { entries: readonly GroupEntry[] }) {
  const all = entries.flatMap((e) => [e.who_source, e.ends_source, ...e.prices.map((x) => x.source)]).filter((s): s is Source => !!s);
  const urls = [...new Set(all.map((s) => s.url))];
  const links = urls.flatMap((url) => {
    const here = all.filter((s) => s.url === url);
    const title = here[0]!.title;
    const rows = [...new Set(here.flatMap((s) => (s.row ? [s.row] : [])))].sort((x, y) => x - y);
    if (rows.length) return [{ href: sourceHref({ url }), title, word: `${title}, ${copy.atRows(rows)}` }];
    const pdf = isPdfUrl(url);
    const pages = pdf ? [...new Set(here.flatMap((s) => (s.page ? [s.page] : [])))].sort((x, y) => x - y) : [];
    // a web page is linked once, opening at the first quoted words found on it
    if (pages.length === 0) return [{ href: sourceHref(here.find((s) => (s as CitedPlace).fragment) ?? { url }), title, word: title }];
    return pages.map((n) => ({ href: sourceHref({ url, page: n }), title, word: `${title}, ${copy.atPage(n)}` }));
  });
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-0 text-xs">
      <span className="text-muted-foreground">{copy.sources}</span>
      {links.map((l) => (
        <DocLink key={`${l.href}-${l.word}`} href={l.href}>
          {l.word}
        </DocLink>
      ))}
    </span>
  );
}

/**
 * The sub-rows as a table with three heads. A sub-row of several groups gives each group its own line of who and until when, beside
 * one "what is cheaper" (one "until when" too when they all end alike). `sources`: a line under each sub-row with where its words stand
 * (a house's own page). What "names no fund" means, when a sub-row carries it, is a note under the rows, or with `headHelp` a "?" beside
 * "מה זול יותר", whose cells it explains (a house's own page; the indices page's fold keeps the note).
 */
export function GroupPriceRows({ entries, sources, className, own, choice, headHelp }: { entries: readonly GroupEntry[]; sources?: boolean; className?: string; /** What "names no fund" means as a "?" beside the head of the cells that say it, instead of a note under the rows. */ headHelp?: boolean; /** The caller's link under a sub-row: it gets the key of the sub-row's first group it can link (`group:<n>`, its place in the house's record); a house's page sends it to the index page with that group picked. */ own?: GroupLink; /** A radio before each group the person can pick (`group:<n>`), the picked one checked (opening the fold shows more choices). */ choice?: GroupChoice }) {
  const blocks = groupBlocks(entries);
  // the sub-row's first entry that states a price in numbers: the one the account panel starts from
  const startOf = (b: GroupBlock) => {
    const e = own && b.entries.find((x) => own.can(`group:${entries.indexOf(x)}`));
    return e ? `group:${entries.indexOf(e)}` : null;
  };
  const marked = blocks.some((b) => b.funds !== "all");
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {/* three columns on a phone too: the cells keep a narrower padding than a list's */}
      <table className="tbl text-sm [&_td]:px-2 [&_th]:px-2 md:[&_td]:px-3 md:[&_th]:px-3">
        <TableCols widths={[{ pc: "32%", phone: "31%" }, { pc: "40%", phone: "39%" }, "auto"]} />
        <thead>
          <tr>
            <th scope="col">{copy.colWho}</th>
            <th scope="col">
              {marked && headHelp ? (
                <span className="inline-flex items-center gap-1">
                  {copy.colCheaper}
                  <HelpMark about={copy.colCheaper} text={copy.noFundNote} />
                </span>
              ) : (
                copy.colCheaper
              )}
            </th>
            <th scope="col">{copy.colEnds}</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((b) => (
            <Fragment key={b.cheaper}>
              {b.entries.map((e, i) => {
                // the lines of one sub-row are ruled once, under the last; a cell that spans them keeps its own rule
                const own = cx(i < b.entries.length - 1 || sources ? "border-b-0 pb-1" : undefined, i > 0 && "pt-1");
                return (
                  <tr key={e.name_he}>
                    <td className={cx("[overflow-wrap:anywhere]", own)}>
                      {choice?.can(`group:${entries.indexOf(e)}`) ? (
                        <GroupRadio choice={choice} k={`group:${entries.indexOf(e)}`} who={e.who_short_he ?? e.name_he} />
                      ) : (
                        <bdi>{e.who_short_he ?? e.name_he}</bdi>
                      )}
                      {sources && e.who_short_he && e.who_short_he !== e.name_he && <span className="block text-xs text-muted-foreground"><bdi>{e.name_he}</bdi></span>}
                    </td>
                    {i === 0 && (
                      <td rowSpan={b.entries.length} className={cx("[overflow-wrap:anywhere]", sources && "border-b-0")}>
                        <bdi>{b.cheaper}</bdi>
                        <FundMark b={b} />
                      </td>
                    )}
                    {(!b.sameEnd || i === 0) && (
                      <td rowSpan={b.sameEnd ? b.entries.length : undefined} className={cx("[overflow-wrap:anywhere]", b.sameEnd ? sources && "border-b-0" : own)}>
                        <bdi>{ends(e)}</bdi>
                      </td>
                    )}
                  </tr>
                );
              })}
              {sources && (
                <tr>
                  <td colSpan={3} className={cx("pt-0", own && startOf(b) && "border-b-0")}>
                    <SourceLinks entries={b.entries} />
                  </td>
                </tr>
              )}
              {own && startOf(b) && (
                <tr>
                  <td colSpan={3} className="pt-0">
                    {own.link(startOf(b)!)}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      {marked && !headHelp && <p className="text-xs text-muted-foreground max-w-measure">{copy.noFundNote}</p>}
      {choice && entries.some((_, i) => choice.can(`group:${i}`)) && <p className="text-xs text-muted-foreground max-w-measure">{copy.pickNote}</p>}
    </div>
  );
}

/** The groups a person can pick in a fold, the picked one, and what picking does. */
/** A link under each sub-row with a group the caller can link, to that group (a house's page: the index page with it picked). */
export interface GroupLink {
  can: (key: string) => boolean;
  link: (key: string) => ReactNode;
}

export interface GroupChoice {
  can: (key: string) => boolean;
  selected: string | null;
  onChoose: (key: string) => void;
}

/** A group's radio and its words, one 44 px target; a click on it is not a pick of the row around it (a button, `PickList`). */
function GroupRadio({ choice, k, who }: { choice: GroupChoice; k: string; who: string }) {
  const on = choice.selected === k;
  return (
    <button type="button" role="radio" aria-checked={on} aria-label={copy.pickLabel(who)} onClick={() => choice.onChoose(k)} className="flex items-start gap-2 min-h-target -my-2 py-2 text-start cursor-pointer focus-visible:outline-2 focus-visible:outline-ring rounded-sm">
      <span aria-hidden="true" className={cx("size-4 shrink-0 rounded-full border-[1.5px] mt-1", on ? "border-[5px] border-primary" : "border-input")} />
      <bdi>{who}</bdi>
    </button>
  );
}

/**
 * The closed line under a house's row on a comparison: a "not in the figure" tag and who gets another price; it opens, at the person's
 * own tap, to the sub-rows and a link to the house's page, where the sources stand. Nothing in it is a figure of the ranking.
 */
export function GroupPriceFold({ entries, house, href, open, onOpenChange, className, choice }: { entries: readonly GroupEntry[]; /** The house's short name, for the link. */ house: string; /** The house's page, where the sources stand. */ href: string; open?: boolean; onOpenChange?: (open: boolean) => void; className?: string; /** See `GroupPriceRows`. */ choice?: GroupChoice }) {
  if (entries.length === 0) return null;
  return (
    <Disclosure
      className={cx("text-xs", className)}
      open={open}
      onOpenChange={onOpenChange}
      summaryClassName="py-1.5 text-muted-foreground"
      labelClassName="leading-snug"
      label={
        <>
          <Tag className="me-1.5">{copy.notCounted}</Tag>
          {copy.line(groupLineWho(entries))}
        </>
      }
    >
      <div className="flex flex-col gap-2 pb-2">
        <GroupPriceRows entries={entries} choice={choice} />
        <GroupPageLink house={house} href={href} />
      </div>
    </Disclosure>
  );
}

function GroupPageLink({ house, href }: { house: string; href: string }): ReactNode {
  return (
    <Link to={href} className="text-link hover:underline inline-flex items-center min-h-target self-start text-sm">
      {copy.toPage(house)}
    </Link>
  );
}
