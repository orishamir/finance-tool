// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. The words a rule states (Ruled), glossary terms (Term) and the
// rule chips open their cards in the same sheet, with a back arrow when they were reached from a number. What the sheet shows (the cards) is in
// provenance-sheets.tsx, fetched while the page hydrates, so the script a page needs to show itself holds only the figures and chips.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { assertNever, companyTermRule, isOwnDocument, type CompanyTermRef, type RuleRecord } from "@finance-tool/schema";
import { formulaNames, numbers, parametersPage, provenance as copy, rule as ruleCopy, scopeWords, strength as strengthCopy } from "../copy";
import type { RuleHead } from "../lib/rule-card-file";
import { ruleHeadOf } from "../lib/rule-head";
import { fmt, formatValue, joinLead, SHORT_IN_ROW, shortBillions } from "../lib/format";
import type { FundStatement } from "@finance-tool/engine";
import { isOpenValue, isParameter, isWeak, ownBy, sheetFlags, sheetReadings, statementKey, strengthOf, type SiteValue, type Staleness, type Strength } from "../lib/value";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconClock, IconDrillIn, IconFile, IconLock, IconPencil } from "./icons";
import { CatchesSaidCtx, OwnCompanyCtx, Sheet, StaleSaidCtx } from "./Sheet";
import { cx, Disclosure, Tag } from "./ui";
import { CatchMark, CompanyLinks, LongestCase, When, gershayim, useAheadSaid, countsByItself, useCounting, useGlidingNumbers, useUnseen } from "./kit";
import { chipName, companyLinksOf, isGeneral, joinNames, listedCompanies, ownDocCompanies, shownCompanies, type CompanyLink, type OwnDocs } from "../lib/scope";
import { decodedPart } from "../lib/address-hash";
import { useHydrated } from "../lib/hooks";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue; /** The figure was shown with two decimals (a table cell, or near a threshold): the sheet shows the same digits. */ exact?: boolean; /** The word a value that is not a number was shown as ("אין", "עוד לא דווח", "לא צמוד"): the sheet heads with the same word. */ display?: string; /** The rules the place the figure was opened from already opens (`opensAround`): its sheet leaves their chips out. */ shown?: readonly string[] } | { kind: "rule"; id: string } | { kind: "rules"; ids: readonly string[]; /** What the list backs: the fact it closes, under the sheet's title. */ name?: string } | { kind: "term"; id: string } | { kind: "terms"; ids: readonly string[]; /** What the terms make up (a column's head): the sheet's title. */ name: string; /** One line under the title, before the terms; with no terms, the sheet's whole text (a "?" with a text of its own). */ lead?: string; /** After the line: the chip of the rules it rests on (a "?" with a sentence of its own and its rules). */ rules?: readonly string[]; /** After the lead: sentences of the sheet's own, each with what it is about and the document it rests on (why an account sells no fund on an index, a sentence and a source for each kind of fund). */ parts?: readonly SheetPart[] } | { kind: "catch"; value: SiteValue; /** What its "?" says, as the figure's place decided them (`catchesOf`). */ catches: readonly Catch[]; /** As a value's: the figure was shown with two decimals. */ exact?: boolean; /** As a value's: the word a value that is not a number was shown as. */ display?: string } | { kind: "list-catch"; /** What the figures are (a column's head): the sheet's title. */ name: string; scope: "column" | "list"; /** The catches every figure there carries (`sharedCatches`). */ catches: readonly Catch[] } | { kind: "obliged"; value: SiteValue; /** Its catches, as the figure's place decided them (`catchesOf`). */ catches: readonly Catch[]; exact?: boolean; display?: string } | { kind: "question"; id: string } | { kind: "proof"; id: string } | { kind: "proofs"; ids: readonly string[] };

/** One sentence of a sheet's own text (`Item` "terms", `parts`): what it is about, the sentence, and the document it rests on. */
export interface SheetPart {
  head?: string;
  text: string;
  doc?: { href: string; title: string };
  /** The open question the sentence rests on (a run its readings stopped, method §13): its chip after the sentence opens its card. */
  question?: string;
  /** A heading the part stands under, after the parts with none ("" for a list with no heading of its own): a part of a group with no
   *  head and no document is a line of a list (what a price list holds and the price leaves out, D106). */
  group?: string;
}

interface ProvenanceApi {
  open: (item: Item, anchor: HTMLElement | null) => void;
}

const Ctx = createContext<ProvenanceApi>({ open: () => {} });
/** The run date of the page (`ProvenanceData.today`), for the future-date flag on a figure. Empty outside a provider: no flag. */
export const TodayCtx = createContext("");

export interface ProvenanceData {
  rules: Record<string, RuleRecord>;
  terms: Record<string, TermRow>;
  /** Checklist row names, for the dimension tags on a rule card. */
  dimensions: Record<string, string>;
  today: string;
  /** "לכל הכללים של {product}" target, on pages about one product. */
  rulesOf?: { name: string; href: string };
  /** Where each rule is used (the rules pages fill it): pages that show it, and whether the calculation engine reads it. */
  ruleUses?: Record<string, RuleUses>;
  /** Per id a card on /parameters answers to: `P-01` to itself, an `A-01` that is an input of a card to that card. PageShell fills it for every page. */
  parameters?: Record<string, string>;
  /**
   * Per open question (`TX2 OQ6`), from data/open-questions.json: the root loader fills it for every page (PageShell), as `parameters`.
   * The sheet shows its status and Hebrew lines. An answered question is deleted from the rule base, so none here is closed.
   */
  openQuestions?: Record<string, { status?: "open" | "narrowed"; title_he?: string; status_he?: string; blocks_he?: string }>;
  /** Per source host, the company's Hebrew name (`data/sources/publishers.json`); PageShell fills it for every page. */
  publishersHe?: Record<string, string>;
  /** Per company of `data/sources/institutions.json`, where its terms are listed (D30): its page, or its group on /companies. PageShell fills it for every page. */
  companies?: Record<string, CompanyLink>;
  /** Per record that is not general, the companies whose own document it cites: only they list it, and the card names only them. PageShell fills it for every page. */
  ownDocs?: OwnDocs;
  /**
   * The records the page's rule cards point at (`derived_from`, `examples`, the rules their figures cite and fill their slots) that the
   * page does not hold itself but ships in full beside `heads`: those whose figures fill a card's slots (`pointedShipment`). Only chips
   * and cards read it; the page's own logic reads `rules`.
   */
  pointed?: Record<string, RuleRecord>;
  /**
   * The heads of the other rules those cards point at (`pointedShipment` in data.server.ts): a chip says the rule's title and its
   * company from it, and its card is fetched from the rule's own file when the chip is tapped (`RuleCard`).
   */
  heads?: Record<string, RuleHead>;
  /** On a company's page, its registry id: a chip of a term that names several companies shows this one's name. */
  company?: string;
  /** On a company's page, every registry id it stands for (a brand's companies): a rule card leads with their documents and names another company's figure. */
  pageCompanies?: readonly string[];
}

/** What a rule affects: links to pages that use it, and whether the calculation engine reads it. */
export interface RuleUses {
  pages: { href: string; label: string }[];
  engine: boolean;
}

/** A rule's record for a chip or a card: the page's own, else one of the records its cards point at (`pointed`). */
export const ruleOf = (data: ProvenanceData | null | undefined, id: string): RuleRecord | undefined => data?.rules[id] ?? data?.pointed?.[id];

/** What a chip names of a rule (`RuleHead`): read from its record where the page holds it, else its head; nothing when the page has neither. */
export function headOf(data: ProvenanceData | null | undefined, id: string): RuleHead | undefined {
  const rule = ruleOf(data, id);
  if (!rule || !data) return data?.heads?.[id];
  return ruleHeadOf(rule, data);
}

type Sheets = typeof import("./provenance-sheets");
let sheets: Sheets | null = null;
let sheetsPending: Promise<Sheets> | null = null;
/** The sheet's code, fetched once and kept; a failed fetch (the connection dropped) is tried again at the next need. */
export function loadSheets(): Promise<Sheets> {
  return (sheetsPending ??= import("./provenance-sheets").then(
    (m) => (sheets = m),
    (e: unknown) => {
      sheetsPending = null;
      throw e;
    },
  ));
}

/**
 * The sheet's code is fetched while the page hydrates (entry.client.tsx); should that fetch fail, it is tried again at once when the
 * reader first touches, clicks or types (the pointer goes down before the tap opens anything).
 */
function usePreloadSheets(): void {
  useEffect(() => {
    if (sheets) return;
    const go = () => {
      stop();
      loadSheets().catch(() => undefined);
    };
    const events = ["pointerdown", "keydown", "focusin"] as const;
    for (const e of events) document.addEventListener(e, go, { capture: true, passive: true });
    function stop() {
      for (const e of events) document.removeEventListener(e, go, { capture: true });
    }
    return stop;
  }, []);
}

/** Set by a provider for what it holds: a provider inside it is nested (a deal's popup, which reads the fee page's data). */
const NestedCtx = createContext(false);

export function ProvenanceProvider({ data, children }: { data: ProvenanceData; children: ReactNode }) {
  // A nested provider's sheet opens over the sheet that holds it, which then closes as a dialog (sheet-stack): drawn inside that sheet, it
  // would close with it, out of sight yet modal, and leave the whole page inert. So it is drawn at the body's end, once in the browser.
  const nested = useContext(NestedCtx);
  const hydrated = useHydrated();
  const [stack, setStack] = useState<Item[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<Sheets | null>(sheets);
  usePreloadSheets();
  const api = useMemo<ProvenanceApi>(
    () => ({
      // the sheet opens with its card, never empty: when its code is not in yet (a tap in the first moments), it opens as the code arrives
      open: (item, el) => {
        const show = (m: Sheets) => {
          setCode(() => m);
          setStack([item]);
          setAnchor(el);
          setOpen(true);
        };
        if (sheets) show(sheets);
        else loadSheets().then(show, () => undefined);
      },
    }),
    [],
  );
  const top = stack[stack.length - 1];
  const close = useCallback(() => setOpen(false), []);
  const back = stack.length > 1 ? () => setStack((s) => s.slice(0, -1)) : undefined;
  const push = useCallback((item: Item) => setStack((s) => [...s, item]), []);
  const headId = useId();
  const descId = useId();
  const sheet = (
    <Sheet open={open} onClose={close} anchor={anchor} pc="popover" height={70} className="lg:max-h-[60vh] lg:backdrop:bg-transparent" labelledBy={headId} describedBy={descId} onBack={back} view={stack.length}>
      {top && code && <code.SheetContent item={top} data={data} headId={headId} descId={descId} />}
    </Sheet>
  );
  return (
    <Ctx.Provider value={api}>
      <DataCtx.Provider value={data}>
      <TodayCtx.Provider value={data.today}>
      <OpenAnchorCtx.Provider value={open ? anchor : null}><NestedCtx.Provider value={true}>{children}</NestedCtx.Provider></OpenAnchorCtx.Provider>
      <PushCtx.Provider value={push}>
       <CloseCtx.Provider value={close}>
        {nested && hydrated ? createPortal(sheet, document.body) : sheet}
       </CloseCtx.Provider>
      </PushCtx.Provider>
      </TodayCtx.Provider>
      </DataCtx.Provider>
    </Ctx.Provider>
  );
}

/** The page's provenance data, for the chips that must know what exists (a parameter card, a rule). */
export const DataCtx = createContext<ProvenanceData | null>(null);

/** The page's provenance data, for a block that lays out rule cards or company links (the company pages' section, "תלוי בחברה"). */
export function useProvenanceData(): ProvenanceData | null {
  return useContext(DataCtx);
}

const PushCtx = createContext<(item: Item) => void>(() => {});

export function useOpen() {
  const api = useContext(Ctx);
  const push = useContext(PushCtx);
  const inside = useContext(InsideSheetCtx);
  return (item: Item, el: HTMLElement | null) => (inside ? push(item) : api.open(item, el));
}

/**
 * Where a search hit for a term leads (`/guide/x#term=<the term>`): the term's card opens at its first marked use on the page, or alone
 * when the page lists it without a mark. The pages' terms list is gone: every term is marked where it is used.
 */
export function TermFromAddress({ hash }: { hash: string }) {
  const api = useContext(Ctx);
  const data = useContext(DataCtx);
  const terms = data?.terms;
  useEffect(() => {
    const m = /^#term=(.+)$/.exec(hash);
    if (!m || !terms) return;
    const id = decodedPart(m[1]!);
    if (id === null || !terms[id]) return;
    const el = [...document.querySelectorAll<HTMLElement>("[data-term]")].find((n) => n.dataset.term === id) ?? null;
    el?.scrollIntoView({ block: "center" });
    api.open({ kind: "term", id }, el);
  }, [hash, terms, api]);
  return null;
}

export const InsideSheetCtx = createContext(false);
/** The element whose tap opened the sheet, while the sheet is open (null when it is closed): words that opened it show so (`TapWords`). */
const OpenAnchorCtx = createContext<HTMLElement | null>(null);
/**
 * A page about one company (its company page, a track's page): a company-sourced figure on it that rests on a document of the page's
 * company is that company's own (D31), so it carries no "לפי החברה" or its caution (`Num`), in the page and in every sheet opened on it
 * alike; a figure from another company's document keeps both.
 */
export function OwnCompanyPage({ children }: { children: ReactNode }) {
  return <OwnCompanyCtx.Provider value={true}>{children}</OwnCompanyCtx.Provider>;
}

/**
 * Inside a block that sums up figures the person typed in boxes elsewhere on the screen (the kit's `TypedPlain`): an entered figure is
 * plain words, not a control. Its sheet would only say the person typed it, and the box it was typed in is beside the block.
 */
export const TypedPlainCtx = createContext(false);

/**
 * The figures inside leave out their own clock: a notice above them already says their source is old (the regulator's period on the
 * track browser and a company's track list). Their aria-label and their sheet still say it. Use it only where that notice covers every
 * figure inside, from the same source.
 */
export function StaleSaid({ on = true, children }: { on?: boolean; children: ReactNode }) {
  return <StaleSaidCtx.Provider value={on}>{children}</StaleSaidCtx.Provider>;
}
/** Closes the sheet: a link inside it that leaves the page calls it. */
export const CloseCtx = createContext<() => void>(() => {});

// ---------------------------------------------------------------- Num

export interface NumProps {
  value: SiteValue;
  size?: "inline" | "cell" | "figure";
  /** Keeps two decimals on a shekel amount (it sits within 0.50 ₪ of a threshold, so rounding could cross it). */
  exact?: boolean;
  /** Replaces the formatted text (for example "שנתיים" for a horizon of two years). */
  display?: string | ((shown: number) => string | undefined);
  /** Moves the digits to a new value over --duration-chart when it changes (design-spec 1.6). */
  animate?: boolean;
  className?: string;
  /** Text that must stay on the line with the number ("ב־", "נכון ל־"): both sit in one non-breaking span. */
  prefix?: ReactNode;
  /** The full word behind a short mark in a crowded cell ("—" for "עוד לא דווח"): what the sheet heads with and a screen reader says. */
  fullWord?: string;
  /** What the figure is of, said first by a screen reader where the words around it do not say it (a cap's figure: whose cap, and that its sheet holds the rules). */
  name?: string;
  /** Its text may take a second line: words in a narrow column ("אין נכסים" under a share's head) that would otherwise set the column's width. */
  wrap?: boolean;
}

const stateWord = { sourced: numbers.legend.sourced, entered: numbers.legend.entered };

/**
 * A sourced figure that takes effect after the run date: a rate "from tomorrow" rolled forward for years is
 * not in force yet. A calculated figure never carries it itself: each input that does says it where it shows.
 */
export function startsAfter(value: SiteValue, today: string): string | null {
  if (!today || value.state !== "sourced" || typeof value.value !== "number" || !value.effective_from) return null;
  return value.effective_from > today ? value.effective_from : null;
}

/** A figure is isolated left to right ("1,234.50 ₪"), unless its text carries Hebrew words ("36 חודשים", "חודשיים"), which a forced LTR isolate would print backwards. */
export const textDir = (text: string): "ltr" | "rtl" => (/[\u0590-\u05FF]/.test(text) ? "rtl" : "ltr");

/** A row (of a list or a table) that writes one of its shekel figures in the short form writes its other large ones in it too. */
const ShortRowCtx = createContext(false);
/** Whether a row's figures read in the short form on a phone: one of them is a billion shekels or more. */
export const shortRow = (...values: (number | null | undefined)[]) => values.some((v) => typeof v === "number" && Math.abs(v) >= 1e9);
/** The figures inside read in one form: "758,833,521 ₪" beside "1.57 מיליארד ₪" read as the larger. */
export function ShortRow({ when, children }: { when: boolean; children: ReactNode }) {
  return <ShortRowCtx.Provider value={when}>{children}</ShortRowCtx.Provider>;
}

/**
 * A short form's text: the digits and the words may part at a line's end as a last resort, so a figure past what its column holds takes
 * a second line in it rather than running over its neighbour (three figures printed over each other at 390 px).
 */
function ShortText({ text, className }: { text: string; className: string }) {
  const at = text.indexOf(` ${numbers.billion}`);
  return (
    <bdi dir={textDir(text)} className={cx("whitespace-normal", className)}>
      <span className="whitespace-nowrap">{text.slice(0, at)}</span> <span className="whitespace-nowrap">{text.slice(at + 1)}</span>
    </bdi>
  );
}

/**
 * What a figure's sheet opens with. A value that is not a number (a word, yes or no, or empty) heads its sheet with the word the figure was
 * shown as, so the sheet never prints the record's raw value: the linkage and tax sheets on every deposit card headed with "none" and
 * "unlinked_15". A number keeps its digits, exact or rounded as shown. `shown`: the rules the place it was opened from opens (`opensAround`).
 */
export function valueItem(value: SiteValue, written: string | undefined, exact: boolean, shown: readonly string[] = []): Item {
  return { kind: "value", value, ...(exact ? { exact: true } : {}), ...(typeof value.value !== "number" && written ? { display: written } : {}), ...(shown.length ? { shown } : {}) };
}

/** The ids an element's `data-opens` names, space-separated. */
const opensOf = (el: Element): string[] => (el.getAttribute("data-opens") ?? "").split(/\s+/).filter(Boolean);

/**
 * The rules the place a figure is tapped in already opens, which its sheet then leaves out. The place is the closest element marked
 * `data-opens-scope` (a rule's card, a /rules fact row, a section of a company's card) and, outside a sheet only, else the paragraph or list
 * item the figure stands in. Every element that opens a rule carries `data-opens` with its ids (a phrase that states it, a chip, a row
 * of a list of rules), and a scope may carry the id it is about itself. Inside a sheet only an explicit scope inside that sheet counts, so a
 * figure named in a sheet (a calculated figure's weak input) keeps its chips. No place, no ids.
 */
export function opensAround(el: Element, insideSheet: boolean): string[] {
  const sheet = insideSheet ? el.closest("dialog") : null;
  const marked = el.closest("[data-opens-scope]");
  const scope = insideSheet ? (marked && (!sheet || sheet.contains(marked)) ? marked : null) : (marked ?? el.closest("p, li"));
  if (!scope) return [];
  const ids = new Set(opensOf(scope));
  for (const n of scope.querySelectorAll("[data-opens]")) for (const id of opensOf(n)) ids.add(id);
  return [...ids];
}

/**
 * The page's company a company-sourced figure is the own figure of (D31): the one whose document is its source, or, for a computed
 * figure, the one company whose documents every company-sourced input it rests on comes from; none where that is not one of the page's.
 */
function pageOwner(v: SiteValue, data: ProvenanceData | null): string | null {
  if (v.state === "computed") {
    const weak = Object.values((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>).filter((x) => strengthOf(x) === "institution" && !x.own);
    const owners = new Set(weak.map((x) => pageOwner(x, data)));
    const [c] = owners;
    return owners.size === 1 && c ? c : null;
  }
  return (
    (data?.pageCompanies ?? []).find((id) => {
      const docs = data?.companies?.[id]?.docs;
      return !!docs && isOwnDocument(v.source, docs);
    }) ?? null
  );
}

/** A company-sourced figure on a page about one company, marked as that company's own where it rests on that company's documents. */
function ownOnPage(v: SiteValue, data: ProvenanceData | null): SiteValue {
  const c = pageOwner(v, data);
  return c ? ownBy(v, c) : v;
}

/** A figure as a page shows it: on a page about one company (`OwnCompanyCtx`), a company-sourced figure that rests on that company's documents is its own (`ownOnPage`). */
function onPage(v: SiteValue, ownPage: boolean, data: ProvenanceData | null): SiteValue {
  return ownPage && !v.own && strengthOf(v) === "institution" ? ownOnPage(v, data) : v;
}

/**
 * A catch a calculated figure carries: what to know before trusting it, which its caution "?" opens (`catchesOf`). A calculated figure shows
 * nothing else of where it came from. Each catch holds what its sheet says, so a sheet can say catches that several figures share.
 * - `ahead`: it takes effect after the page's date;
 * - `doubt`: its own doubt (`SiteValue.doubt`), with the rules it rests on and the inputs it is carried from;
 * - `caveat`: an assumption its value rests on (`SiteValue.caveat`);
 * - `weak`: it rests on a secondary source, or, at figure size, on a company's document out of its own context, with the inputs that do,
 *   by their key (in a line or a cell each such input says its own source where it stands);
 * - `open`: it rests on an open rule;
 * - `stale`: what it rests on is older than its cadence;
 * - `flags`: the engine's flags on it (`sheetFlags`);
 * - `reading`: it rests on the site's own reading of the rules it names (`sheetReadings`).
 */
export type Catch =
  | { kind: "ahead"; from: string }
  | { kind: "doubt"; doubt: string; rules: readonly string[]; from?: readonly string[] }
  | { kind: "caveat"; text: string }
  | { kind: "weak"; strength: "institution" | "secondary"; inputs: readonly (readonly [key: string, input: SiteValue])[] }
  | { kind: "open" }
  | { kind: "stale"; stale: Staleness }
  | { kind: "flags"; codes: readonly string[] }
  | { kind: "reading"; rules: readonly string[] }
  /** The fund's own statements the figure rests on (D84's tax index, D119's foreign-investment fund): no other place shows them. */
  | { kind: "statements"; statements: readonly FundStatement[] };

/**
 * The parts of a catch that can be said once for many figures, each by a key: a flag and a rule read are each a part of their own, so a list
 * whose every figure carries one flag says that flag once while a flag some figures carry stays on them; any other catch is one part.
 */
function partsOf(c: Catch): string[] {
  switch (c.kind) {
    case "ahead":
      return [`ahead ${c.from}`];
    case "doubt":
      return [["doubt", c.doubt, c.rules.join(" "), (c.from ?? []).join(" ")].join("|")];
    case "caveat":
      return [`caveat ${c.text}`];
    case "weak":
      return [`weak ${c.strength}|${c.inputs.map(([k, x]) => `${k}=${String(x.value)}@${x.source.url}`).join(" ")}`];
    case "open":
      return ["open"];
    case "stale":
      return [`stale ${c.stale.since} ${c.stale.cadence}`];
    case "flags":
      return c.codes.map((code) => `flag ${code}`);
    case "reading":
      return c.rules.map((r) => `reading ${r}`);
    case "statements":
      return c.statements.map((st) => `statement ${statementKey(st)}`);
    default:
      return assertNever(c);
  }
}

/** The catches with only the parts `keep` accepts: a flag or a rule read goes alone, any other catch goes whole; one left with no part goes. */
function catchParts(catches: readonly Catch[], keep: (part: string) => boolean): Catch[] {
  return catches.flatMap((c): Catch[] => {
    if (c.kind === "flags") {
      const codes = c.codes.filter((code) => keep(`flag ${code}`));
      return codes.length ? [{ ...c, codes }] : [];
    }
    if (c.kind === "reading") {
      const rules = c.rules.filter((r) => keep(`reading ${r}`));
      return rules.length ? [{ ...c, rules }] : [];
    }
    if (c.kind === "statements") {
      const statements = c.statements.filter((st) => keep(`statement ${statementKey(st)}`));
      return statements.length ? [{ ...c, statements }] : [];
    }
    return partsOf(c).every(keep) ? [c] : [];
  });
}

/**
 * The catches every one of several figures carries (each figure's `catchesOf`), to say once for them all: a list, a table's column or a set
 * of rows (`CatchesSaid`, `ListCatchMark`). None for fewer than two figures, whose own "?" says as much.
 */
export function sharedCatches(each: readonly (readonly Catch[])[]): Catch[] {
  const [first, ...rest] = each;
  if (!first || rest.length === 0) return [];
  const sets = rest.map((cs) => new Set(cs.flatMap(partsOf)));
  return catchParts(first, (part) => sets.every((set) => set.has(part)));
}

/**
 * The figures inside leave out of their own "?" the catches said once around them, in the head of their column or above their list
 * (`ListCatchMark`); a figure left with no catch has no "?". Nested, the outer ones stay said. No sheet inherits it (Sheet.tsx).
 */
export function CatchesSaid({ catches, children }: { catches: readonly Catch[]; children?: ReactNode }) {
  const outer = useContext(CatchesSaidCtx);
  const said = useMemo(() => (catches.length === 0 ? outer : new Set([...outer, ...catches.flatMap(partsOf)])), [outer, catches]);
  return <CatchesSaidCtx.Provider value={said}>{children}</CatchesSaidCtx.Provider>;
}

/** What decides a figure's catches beyond the figure: the page's date, its size, the notices around it that already say a catch, and how the page shows a figure (`onPage`). */
export interface CatchPlace {
  today: string;
  /** At figure size (a headline): a company's document out of its own context is a catch there. */
  figure: boolean;
  /** A notice around it already says its source is old (`StaleSaid`). */
  staleSaid: boolean;
  /** A callout around it already says these rules start later (`useAheadSaid`). */
  aheadSaid: boolean;
  /** The parts of catches said once around it (`CatchesSaid`), which it leaves out. */
  said?: ReadonlySet<string>;
  onPage: (v: SiteValue) => SiteValue;
}

/** Where a figure stands, for its catches (`CatchPlace`): the page's date, the notices around it and the page's company, at a size. */
export function useCatchPlace(): (figure: boolean) => CatchPlace {
  const today = useContext(TodayCtx);
  const staleSaid = useContext(StaleSaidCtx);
  const aheadSaid = useAheadSaid();
  const said = useContext(CatchesSaidCtx);
  const ownPage = useContext(OwnCompanyCtx);
  const data = useContext(DataCtx);
  return (figure) => ({ today, figure, staleSaid, aheadSaid, said, onPage: (v) => onPage(v, ownPage, data) });
}

/**
 * The catches several figures share where they stand (`sharedCatches` over each one's `catchesOf`): for a list to say once, in its column's
 * head or above it (`ListCatchMark`), and to leave out of each figure's own "?" (`CatchesSaid`). Only calculated figures count; a list of
 * fewer than two has none to share.
 */
export function useSharedCatches(): (values: readonly (SiteValue | null | undefined | false)[], figure?: boolean) => Catch[] {
  const placeAt = useCatchPlace();
  return (values, figure = false) => {
    const place = placeAt(figure);
    return sharedCatches(values.filter((v): v is SiteValue => !!v && v.state === "computed").map((v) => catchesOf(place.onPage(v), place)));
  };
}

/**
 * The catches a figure carries (`Catch`), in the order its sheet says them, less those said once around it (`CatchPlace.said`). A plain
 * difference or sum (`SiteValue.plain`) is its inputs and nothing else: it carries only a catch none of its inputs carries, since each input
 * shows its own where it stands (`sheetFlags`, `sheetReadings`, and the same for its doubt, weakness, open rule and staleness).
 */
export function catchesOf(v: SiteValue, place: CatchPlace): Catch[] {
  const inputs = Object.entries((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>).map(([k, x]) => [k, place.onPage(x)] as const);
  const carried = (has: (x: SiteValue) => boolean) => !!v.plain && inputs.some(([, x]) => has(x));
  const out: Catch[] = [];
  const from = place.aheadSaid ? null : startsAfter(v, place.today);
  if (from) out.push({ kind: "ahead", from });
  if (v.doubt && !(v.plain && v.doubtFrom?.length)) out.push({ kind: "doubt", doubt: v.doubt, rules: v.doubtRules ?? [], ...(v.doubtFrom ? { from: v.doubtFrom } : {}) });
  if (v.caveat) out.push({ kind: "caveat", text: v.caveat });
  const strength = strengthOf(v);
  if (isWeak(v) && (strength === "secondary" || (strength === "institution" && place.figure)) && !carried(isWeak)) out.push({ kind: "weak", strength, inputs: inputs.filter(([, x]) => isWeak(x)) });
  if ((strength === "open" || isOpenValue(v)) && !carried((x) => strengthOf(x) === "open")) out.push({ kind: "open" });
  if (v.stale && !place.staleSaid && !carried((x) => !!x.stale)) out.push({ kind: "stale", stale: v.stale });
  const flags = sheetFlags(v);
  if (flags.length > 0) out.push({ kind: "flags", codes: flags });
  const rules = [...new Set(sheetReadings(v).map((l) => l.ruleId))];
  if (rules.length > 0) out.push({ kind: "reading", rules });
  // a plain difference or sum leaves out a statement one of its inputs carries: that input's own "?" names it
  const carriedStatement = (st: FundStatement) => !!v.plain && inputs.some(([, x]) => (x.statements ?? []).some((y) => statementKey(y) === statementKey(st)));
  const statements = (v.statements ?? []).filter((st) => !carriedStatement(st));
  if (statements.length > 0) out.push({ kind: "statements", statements });
  const said = place.said;
  return said && said.size > 0 ? catchParts(out, (part) => !said.has(part)) : out;
}

/**
 * The caution "?" that says once the catches every figure of a list carries (`useSharedCatches`): in the head of their column, as a column's
 * shared mark stands in its head (D60), or after the words above a list that has no head. It opens their sheet, under `name`, what the
 * figures are; nothing where they share none. The figures inside its `CatchesSaid` leave them out of their own "?".
 */
export function ListCatchMark({ catches, name, scope, className }: { catches: readonly Catch[]; name: string; /** Where the figures stand: a table's column, or a list or a set of lines. */ scope: "column" | "list"; className?: string }) {
  if (catches.length === 0) return null;
  return <CatchMark about={name} item={{ kind: "list-catch", name, scope, catches }} className={className} />;
}

/**
 * The provenance number. A sourced or entered figure is a button holding the formatted value in an isolating span, its marks before the
 * digits, never between a number and the unit word that follows it; a tap opens where it comes from. A calculated figure is plain text, with
 * a caution "?" after it only where it carries a catch (`catchesOf`).
 */
export function Num({ value: given, size = "inline", display, animate, className, prefix, exact, fullWord, name, wrap }: NumProps) {
  const ownPage = useContext(OwnCompanyCtx);
  const pageData = useContext(DataCtx);
  const value = onPage(given, ownPage, pageData);
  const open = useOpen();
  const inside = useContext(InsideSheetCtx);
  const today = useContext(TodayCtx);
  const staleSaid = useContext(StaleSaidCtx);
  const aheadSaid = useAheadSaid();
  const catchPlace = useCatchPlace();
  const param = isParameter(value);
  const counting = useCounting();
  const unseen = useUnseen();
  // a copy that only holds a block's size (LongestCase) is not on the page
  const plain = !!value.field;
  const typedPlain = useContext(TypedPlainCtx);
  // a copy laid out unseen holds a height only: it lands at once, and its frames cost nothing (a list's cases counted on every key)
  const shown = useAnimatedValue(typeof value.value === "number" ? value.value : null, !unseen && (animate ?? (counting && countsByItself(value.state, value.unit))));
  // display rounding (A13): computed and entered amounts round, in table cells too ("16,000.00 ₪" in a table); `exact` keeps the agorot
  const keepDecimals = !!exact;
  const roundState = keepDecimals ? undefined : value.state;
  // a figure that lands on whole shekels glides through whole shekels: the frames showed agorot, then snapped
  const target = typeof value.value === "number" ? value.value : null;
  const landing = landingOf(target, shown, display, (n) => formatValue(n, value.unit, roundState, param));
  const frame = glideFrame(shown, landing);
  // a formatter gets the moving value, so a signed figure counts like any other
  const written = typeof display === "function" ? (frame !== null ? display(frame) : undefined) : display;
  // an empty value whose rule is open (D7 blocked: no rule covers it) says so, with the lock, instead of "unknown" (a deposit's
  // tax bucket printed "null")
  const blocked = isOpenValue(value);
  const text = written ?? (blocked ? strengthCopy.open.label : frame !== null && typeof value.value === "number" ? formatValue(frame, value.unit, roundState, param) : formatValue(value.value, value.unit, roundState, param));
  // a billion shekels or more reads in its short form on a phone, so no column cuts it, and a thousand billion on a
  // computer; a row with one short figure writes its other large ones short too. The sheet and label keep the digits.
  const inShortRow = useContext(ShortRowCtx);
  const nisFigure = typeof value.value === "number" && !keepDecimals && /^nis/.test(value.unit);
  const short = nisFigure ? shortBillions(text, inShortRow ? SHORT_IN_ROW : 1e9) : null;
  const shortPc = nisFigure ? shortBillions(text, 1e12) : null;
  const strength = strengthOf(value);
  const weak = isWeak(value) && (strength === "institution" || strength === "secondary") ? numbers.weak[strength] : null;
  // in a callout that already says these rules start later, the figure leaves out its own "starts on" mark; its sheet says it
  const fromDate = aheadSaid ? null : startsAfter(value, today);
  const future = fromDate ? `${numbers.startsOn}${fmt.date(fromDate)}` : null;
  // an open value is no sourced figure: its label says the open question and the lock, not "ממקור"
  const doubt = value.doubt ? numbers.doubt : null;
  // a long text value (a fund's full name) may wrap: kept on one line it ran 73 px past a phone's edge; any other figure is
  // one unit with its icon, which stood alone on the line above its digits in a phone's table
  const oneLine = !wrap && !(typeof value.value === "string" && text.length > 24);
  // a field's value (its default, or what the reader typed) is a plain number: no mark, no sheet; the field beside it is where it changes
  // (charts.md); so is a typed figure in a block that sums up typed boxes (`TypedPlainCtx`)
  if (plain || (typedPlain && value.state === "entered")) {
    const bare = <bdi dir={textDir(text)} className={cx("whitespace-nowrap", className)}>{text}</bdi>;
    return prefix ? <span className="whitespace-nowrap">{typeof prefix === "string" ? joinLead(prefix, text) : prefix}{bare}</span> : bare;
  }
  const digits = short ? (
    <>
      {shortPc ? <ShortText text={shortPc} className="max-md:hidden" /> : <bdi dir={textDir(text)} className="whitespace-nowrap max-md:hidden">{text}</bdi>}
      <ShortText text={short} className="md:hidden" />
    </>
  ) : (
    <bdi dir={textDir(text)} className={oneLine ? "whitespace-nowrap" : undefined}>{text}</bdi>
  );
  // a maqaf lead before a figure said in words ("תעריפון מ־" before "נובמבר 2025") writes its letter on the word: "מנובמבר 2025" (copy.md 10)
  const led = (figure: ReactElement): ReactElement => (prefix ? <span className="whitespace-nowrap">{typeof prefix === "string" ? joinLead(prefix, text) : prefix}{figure}</span> : figure);
  // a calculated figure is plain text in the ink around it: it opens nothing, and only a catch it carries shows, as a caution "?" held to
  // its last digit, which opens what the catch is (`catchesOf`)
  if (value.state === "computed") {
    const catches = catchesOf(value, catchPlace(size === "figure"));
    const shownAs = typeof value.value !== "number" && (fullWord ?? written) ? { display: fullWord ?? written } : {};
    // a figure whose source's terms require a line beside it (the ECB's attribution, `obligation`) keeps a way to that source: it draws as a
    // sourced figure does and opens its sources, that line and its catches; a catch shows as a sourced figure's does, by an icon before it
    if (value.obligation) {
      const others = catches.some((c) => c.kind !== "stale");
      return led(
        <button
          type="button"
          className={cx("num num-sourced", size === "figure" && "num-figure", size === "cell" && "num-cell", oneLine && "whitespace-nowrap", className)}
          aria-label={[name, fullWord ?? text, numbers.legend.sourced, value.stale ? `${numbers.staleSince} ${fmt.date(value.stale.since)}` : null, numbers.details].filter(Boolean).join(", ")}
          onClick={(e) => open({ kind: "obliged", value, catches, ...(keepDecimals ? { exact: true } : {}), ...shownAs }, e.currentTarget)}
        >
          {catches.some((c) => c.kind === "stale") && <IconClock size={14} className="text-caution me-1 inline-block align-[-2px] select-none" aria-hidden="true" />}
          {others && <IconAlert size={14} className="text-caution me-1 inline-block align-[-2px] select-none" aria-hidden="true" />}
          {digits}
        </button>,
      );
    }
    const figure = <span className={cx("num-plain", size === "figure" && "num-figure", value.value === null && "num-unknown", oneLine && "whitespace-nowrap", className)}>{digits}</span>;
    if (catches.length === 0) return led(figure);
    return led(
      <span className="whitespace-nowrap">
        {figure}
        <CatchMark about={value.about ?? text} item={{ kind: "catch", value, catches, ...(keepDecimals ? { exact: true } : {}), ...shownAs }} className="ms-1" />
      </span>,
    );
  }
  const label = [name, fullWord ?? text, blocked ? null : stateWord[value.state], param ? numbers.parameter : null, weak, doubt, future, value.stale ? `${numbers.staleSince} ${fmt.date(value.stale.since)}` : null, numbers.details].filter(Boolean).join(", ");
  // one caution icon, before the digits, for a weak source, a doubt or a date still ahead (the sheet says which). The words stay out of the
  // line: a word between a number and its unit ("4 לפי החברה ימי עסקים") broke the sentence. At figure size a date ahead is also said in
  // words, before the digits.
  const mark = "inline-block align-[-2px] select-none";
  const button = (
    <button
      type="button"
      className={cx("num", `num-${value.state}`, doubt && "num-doubt", size === "figure" && "num-figure", size === "cell" && "num-cell", value.value === null && "num-unknown", oneLine && "whitespace-nowrap", className)}
      aria-label={label}
      onClick={(e) => open(valueItem(value, fullWord ?? written, keepDecimals, opensAround(e.currentTarget, inside)), e.currentTarget)}
    >
      {value.stale && !staleSaid && <IconClock size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {(fromDate || weak || doubt) && <IconAlert size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {blocked && <IconLock size={14} className={cx("text-blocked me-1", mark)} aria-hidden="true" />}
      {fromDate && size === "figure" && <span className="text-xs text-caution-foreground font-normal me-1 no-underline select-none"><When iso={fromDate} lead={numbers.startsOn} /></span>}
      {digits}
    </button>
  );
  return led(button);
}

/** A lead text that ends in a maqaf word ("נכון ל־", "ב־") or a word and a space ("ממוצע ") followed by a number: only its last word is
 * bound to the number (one non-breaking span, the space kept), so the rest of the sentence still wraps. `text`, the words of what follows
 * when it is not digits ("נובמבר 2025", "שנה"), drops a maqaf lead's "־": "מנובמבר 2025", "בשנה" (copy.md 10). */
export function LeadTail({ lead: written, text, children }: { lead: string; text?: string; children: ReactNode }) {
  const lead = text === undefined ? written : joinLead(written, text);
  const m = /^([\s\S]*?)(\S+)(\s*)$/.exec(lead);
  if (!m) return <>{children}</>;
  return (
    <>
      {m[1]}
      <span className="whitespace-nowrap">
        {m[2]}
        {m[3]}
        {children}
      </span>
    </>
  );
}

/** A mark before a text (a caution icon, a lock): bound to the text's first word, so it never ends a line alone. The mirror
 *  of `LeadTail`, which binds a text's last word to what follows it: a mark after a text is `<LeadTail lead={text}>{mark}</LeadTail>`. */
export function MarkHead({ mark, text }: { mark: ReactNode; text: string }) {
  const m = /^(\s*\S+)([\s\S]*)$/.exec(text);
  if (!m) return <>{mark}{text}</>;
  return (
    <>
      <span className="whitespace-nowrap">
        {mark}
        {m[1]}
      </span>
      {m[2]}
    </>
  );
}

export function NumAfter({ lead, ...rest }: NumProps & { lead: string }) {
  const m = /^([\s\S]*?)(\S+)(\s*)$/.exec(lead);
  if (!m) return <Num {...rest} />;
  return (
    <>
      {m[1]}
      {/* the space after the last word stays: a lead that ends "ממוצע " read "ממוצע2025" */}
      <Num {...rest} prefix={`${m[2]}${m[3]}`} />
    </>
  );
}

/** Digits count to a new value over --duration-chart; zero when the device asks for reduced motion. */
/**
 * How a gliding figure will be written once it lands on `target` (null where it has landed, or has no number): by the page's formatter,
 * or as the value is written (`written`) where the formatter has no form for it (a computed percent: `computedSum` writes only money).
 */
export function landingOf(target: number | null, shown: number | null, display: NumProps["display"], written: (n: number) => string): string | null {
  if (target === null || shown === target) return null;
  return (typeof display === "function" ? display(target) : undefined) ?? written(target);
}

/**
 * The number a gliding figure shows on its way (`shown`) to a value written `landing` (null once it has landed): a figure that lands on a
 * whole number glides through whole numbers, one written with decimals glides through them. A 0.065% never shows as 0% on its way.
 */
export function glideFrame(shown: number | null, landing: string | null): number | null {
  return shown !== null && landing !== null && !/\d\.\d/.test(landing) ? Math.round(shown) : shown;
}

export function useAnimatedValue(target: number | null, enabled: boolean): number | null {
  // not a number to glide to: NaN takes its goal at once, either way
  const moves = enabled && target !== null;
  const shown = useGlidingNumbers([moves ? target : NaN])[0]!;
  return moves && Number.isFinite(shown) ? shown : target;
}

// ---------------------------------------------------------------- tags, chips, lines

export function StateTag({ state }: { state: "sourced" | "entered" | "parameter" }) {
  if (state === "parameter") return <Tag tone="parameter">{numbers.parameter}</Tag>;
  if (state === "entered") return <Tag tone="entered" icon={<IconPencil size={14} />}>{numbers.legend.entered}</Tag>;
  return <Tag tone="neutral" icon={<IconFile size={14} />}>{numbers.legend.sourced}</Tag>;
}

export function StrengthLabel({ strength }: { strength: Strength }) {
  const label = strengthCopy[strength].label;
  if (strength === "institution" || strength === "secondary") return <Tag tone="caution" icon={<IconAlert size={14} />}>{label}</Tag>;
  if (strength === "open") return <Tag tone="blocked" icon={<IconLock size={14} />}>{label}</Tag>;
  if (strength === "entered") return <Tag tone="entered" icon={<IconPencil size={14} />}>{label}</Tag>;
  return <Tag tone="neutral">{label}</Tag>;
}

/**
 * A figure or rate that rests on the site's own reading of official texts (the engine's "reading" label): never "מקור משני".
 * `held`: a row that may come to rest on a reading as the person types keeps the tag's place, empty while `shown` is false, on a
 * line that is always there (a card's assumptions line, an exposure row's return line), so the tag appearing moves nothing
 * and costs no line of its own.
 */
export function ReadingTag({ held = false, shown = true }: { held?: boolean; shown?: boolean } = {}) {
  const tag = <Tag tone="caution" icon={<IconAlert size={14} />}>{numbers.reading}</Tag>;
  if (!held) return shown ? tag : null;
  return <LongestCase cases={[tag]}>{shown ? tag : null}</LongestCase>;
}

export type IdKind = "rule" | "formula" | "parameter" | "assumption" | "question" | "proof";
const QUESTION_ID = /^([A-Z0-9]+)[ -]OQ(\d+)$/;
/** The open question an open value cites (`TXI OQ19`), in its source's title or its notes; null when it names none. */
export const openQuestionOf = (v: SiteValue): string | null => {
  const src = v.state === "sourced" ? (v.source as { title?: string }).title ?? "" : "";
  const m = /\b([A-Z][A-Z0-9]*)[ -]OQ(\d+)\b/.exec(`${src} ${v.notes ?? ""}`);
  return m ? `${m[1]} OQ${m[2]}` : null;
};
/**
 * What an id is, from its shape: `TX2 OQ6` a question; `M-01` a statement math proves (docs/method.md section 14), which has the
 * shape of a rule's code and is told apart first; `F-80`, and any id `formulaNames` names (`A-06`, which is a method
 * assumption that has a formula of its own), a formula; `P-01` a site parameter; any other `A-nn` an assumption of the
 * method (a parameter card links to it only when the card has it as an input); `ABC-12` a rule. Anything else is null: no chip.
 */
export function idKind(id: string): IdKind | null {
  if (QUESTION_ID.test(id)) return "question";
  if (/^M-\d+$/.test(id)) return "proof";
  if (/^F-\d+$/.test(id) || (id !== "_other" && Object.hasOwn(formulaNames, id))) return "formula";
  if (/^P-\d+$/.test(id)) return "parameter";
  if (/^A-\d+$/.test(id)) return "assumption";
  if (/^[A-Z][A-Z0-9]*-\d+$/.test(id)) return "rule";
  return null;
}

/**
 * The punctuation that closes a sentence on a chip (".", ",", ";", ":"): held to the chip on one line, right after its edge, so it
 * never reads as a stray mark with a gap before it ("פרטים ."). A chip is its own frame and takes no
 * brackets (`IdText` drops them too). Kit guard 20.
 */
function ChipEnd({ chip, end }: { chip: ReactNode; end?: string }) {
  if (!end) return <>{chip}</>;
  return (
    <span className="whitespace-nowrap">
      {chip}
      {end}
    </span>
  );
}

/**
 * One chip for any id the site has: a rule opens its card, an open question its sheet, a proof its sheet, a parameter goes to its card on
 * the parameters page. The chip says words, never the code (D101): a rule's chip is the rule's title, or "חוק או כלל" for a record the page
 * does not hold; a parameter's says its name, an open question's "פרטים", a proof's "הוכחה" (`ProofsChip`). The code stays in the card or
 * sheet it opens and in the chip's address. A 44px tap area.
 * - `asLabel`: the chip as a label that does nothing (a parameter's own card, which a link would only point back at).
 * An empty id renders nothing; an id that is no kind, or a formula, renders as plain text; a parameter or an `A-nn` no card has, nothing.
 */
export function IdRef(props: { id: string; className?: string; asLabel?: boolean; /** A list of questions: the chip says the question's title, the rows being otherwise alike (D49). */ titled?: boolean; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
  return <ChipEnd chip={<IdChip {...props} />} end={props.end} />;
}

function IdChip({ id, className, asLabel, titled }: { id: string; className?: string; asLabel?: boolean; titled?: boolean }) {
  const open = useOpen();
  const close = useContext(CloseCtx);
  const data = useContext(DataCtx);
  if (!id) return null;
  const kind = idKind(id);
  const plain = <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{id}</bdi>;
  // a formula opens nothing: a figure the site calculates is plain, and says only its catches
  if (!kind || kind === "formula") return plain;
  const shown = kind === "question" ? id.replace("-OQ", " OQ") : id;
  // a rule's chip says its title, from its record or its head; a rule the page has neither of says "חוק או כלל", and its card says so
  const rule = kind === "rule" ? headOf(data, shown) : undefined;
  // a proof's chip says "הוכחה"; its title is in the sheet's script (content/proofs.ts), which a page's own script does not carry
  if (kind === "proof" && !asLabel) return <ProofsChip ids={[id]} className={className} />;
  // an open question's chip says a word, not its code: the sentence around it says "שאלה פתוחה", the sheet says which
  const title = titled && kind === "question" ? questionOf(data, shown)?.title_he : undefined;
  const ruleName = rule?.title;
  let card: string | undefined;
  if (kind === "parameter") card = data?.parameters ? data.parameters[id] : id;
  if (kind === "assumption") card = data?.parameters?.[id];
  if ((kind === "parameter" || kind === "assumption") && !card) return null;
  const words = title ?? (ruleName ? ruleName.text : card ? parametersPage.names[card] ?? copy.idRef.parameter : kind === "question" ? copy.idRef.questionChip : kind === "proof" ? copy.proofChip.one : ruleCopy.title);
  // a short word stays on one line; a title or a name wraps inside the chip
  const long = !!(title || ruleName || (card && parametersPage.names[card]));
  const chip = ruleName?.english ? <bdi dir="ltr" className="text-start">{words}</bdi> : <span className={long ? "text-start" : "whitespace-nowrap"}>{words}</span>;
  if (asLabel) return <span className={cx("rule-chip pointer-events-none", long && "whitespace-normal", className)}>{chip}</span>;
  if (card) {
    return (
      <Link to={`/parameters#${card}`} className={cx("rule-chip", long && "whitespace-normal", className)} onClick={close} aria-label={`${copy.idRef.parameter}: ${words}`}>
        {chip}
      </Link>
    );
  }
  const aria = kind === "rule" ? (rule ? `${ruleCopy.title}: ${words}` : ruleCopy.title) : copy.idRef.question;
  const item: Item = kind === "question" ? { kind: "question", id: shown } : { kind: "rule", id: shown };
  return (
    <button type="button" className={cx("rule-chip", long && "whitespace-normal", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={aria} data-opens={kind === "rule" ? shown : undefined}>
      {chip}
    </button>
  );
}

/**
 * Text that names open questions inside a sentence (a copy string that ends "... שאלה פתוחה SW OQ4"): each code in it becomes an `IdRef`.
 * `assumptions` also turns the method's assumption ids (`A-01`) into chips: printed as plain text, "(A-03)" broke at its hyphen on a phone
 * (the parameters page). A string with no code comes back unchanged.
 */
export function IdText({ text, assumptions }: { text: string; assumptions?: boolean }) {
  // the chip is its own frame: "(A-03)" and "(SW OQ4)" lose their brackets; the punctuation after a chip is held to it (ChipEnd)
  const unbracketed = text.replace(assumptions ? /\(\s*([A-Z0-9]+[ -]OQ\d+|A-\d+)\s*\)/g : /\(\s*([A-Z0-9]+[ -]OQ\d+)\s*\)/g, "$1");
  const parts = assumptions ? unbracketed.split(/\b([A-Z0-9]+[ -]OQ\d+|A-\d+)\b/) : unbracketed.split(/\b([A-Z0-9]+[ -]OQ\d+)\b/);
  if (parts.length === 1) return <>{text}</>;
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // the punctuation right after a chip went to the chip
      const rest = i > 0 && /^[.,;:]/.test(parts[i]!) ? parts[i]!.slice(1) : parts[i]!;
      if (rest) out.push(rest);
      continue;
    }
    const end = /^[.,;:]/.test(parts[i + 1] ?? "") ? parts[i + 1]![0] : undefined;
    out.push(<IdRef key={i} id={parts[i]!} {...(end ? { end } : {})} />);
  }
  return <>{out}</>;
}

/**
 * The rule chip, where the chip names the rule itself (a figure's sheet's "rules used", the rule a run stopped on): `IdRef` for a rule
 * id, the rule's title. A company's term (scope `institution`, or `unsettled` seen at named companies) shows the company's name instead
 * (spec 2026-10-25-rules-scope §4): on that company's page its own name, elsewhere the first with "ועוד" and the count of the others.
 * The code stays in the card it opens and in the chip's spoken name.
 */
export function RuleRef({ id, className, end }: { id: string; className?: string; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
  const open = useOpen();
  const data = useContext(DataCtx);
  const rule = headOf(data, id);
  const name = rule && !isGeneral(rule) ? chipName(rule, data?.ownDocs, data?.company, chipMore) : null;
  if (!name) return <IdRef id={id} className={className} end={end} />;
  return (
    <ChipEnd
      end={end}
      chip={
        <button type="button" className={cx("rule-chip", className)} onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} aria-label={`${ruleCopy.title} ${id}, ${scopeTag(rule!, data?.ownDocs)}`} data-opens={id}>
          <bdi className="whitespace-nowrap">{name}</bdi>
        </button>
      }
    />
  );
}

const chipMore = (n: number) => (n === 1 ? scopeWords.chipMore.one : n === 2 ? scopeWords.chipMore.two : scopeWords.chipMore.many.replace("{n}", String(n)));

/**
 * The card's scope label: "חל על כולם", "של הראל ואלטשולר שחם" (the companies whose own documents say it), "לא הוכח שחל על כולם";
 * "על סלייס וגלובלנט" for a record about companies that rests on none of their documents (a regulator's announcement about them).
 */
export function scopeTag(rule: Pick<RuleRecord, "id" | "scope" | "scope_institutions">, ownDocs: OwnDocs | undefined, short?: { company: string | undefined }): string {
  if (rule.scope === "general") return scopeWords.tag.general;
  if (rule.scope === "unsettled") return scopeWords.tag.unsettled;
  // the same companies the chip counts (`shownCompanies`): those whose own documents say it, else everyone it is about. `short` (the card's
  // tag) names them as the chip does, the page's company or the first and "ועוד N": six fund managers in one tag ran 400 px past a phone's
  // edge; the card's scope line under the text names them all.
  const names = short ? chipName(rule, ownDocs, short.company, chipMore) ?? "" : joinNames(shownCompanies(rule, ownDocs).map((c) => c.name_he));
  return (ownDocCompanies(rule, ownDocs).length > 0 ? scopeWords.tag.institution : scopeWords.tag.about).replace("{names}", names);
}

/**
 * "תלוי בחברה" and the companies, each a link to where its terms are listed: for a property each company sets for itself (spec §4: the
 * guide never states one company's term as the product's). `ids` are the records that hold the companies' terms (a wrapper's
 * `company_terms` entries: a record, or a record with the companies whose term on the property it states); the companies are those
 * whose sections list them (their own documents say it), in order, once each. `lead` replaces "תלוי בחברה" ("תלוי בבנק"). Nothing
 * renders when none of the records is on the page.
 */
export function VariesByCompany({ ids, lead = scopeWords.varies, size, end, className }: { ids: readonly CompanyTermRef[]; /** A ReactNode, so a glossary term it names first on its page carries its mark. */ lead?: ReactNode; size?: "sm" | "xs"; /** Closes a line that is a sentence ("."). */ end?: string; className?: string }) {
  const data = useContext(DataCtx);
  const seen = new Set<string>();
  const items = ids
    .flatMap((ref) => {
      const r = headOf(data, companyTermRule(ref));
      if (!r) return [];
      const listed = listedCompanies(r, data?.ownDocs);
      return companyLinksOf(typeof ref === "string" ? listed : listed.filter((c) => ref.companies.includes(c.id)), data?.companies);
    })
    .filter((c) => !seen.has(c.id) && seen.add(c.id));
  return <CompanyLinks lead={lead} items={items} size={size} end={end} className={className} />;
}

/** What words resting on rules open: one rule's card at once, or the list of their titles under `name`. */
const rulesItem = (ids: readonly string[], name?: string): Item => (ids.length === 1 ? { kind: "rule", id: ids[0]! } : { kind: "rules", ids, ...(name ? { name } : {}) });

/**
 * The statements math proves that a fact rests on (docs/method.md section 14), as one chip: "הוכחה" for one, which opens its sheet at
 * once, and "הוכחות · N" for several, which opens the list of their titles. Never the code (D101). No ids, no chip. It stands after the
 * sentence it backs first (`IdRef` for one proof in a sentence).
 */
export function ProofsChip({ ids, className }: { ids: readonly string[]; className?: string }) {
  const open = useOpen();
  const only = ids.length === 1 ? ids[0]! : null;
  if (ids.length === 0) return null;
  const item: Item = only ? { kind: "proof", id: only } : { kind: "proofs", ids };
  return (
    <button type="button" className={cx("rule-chip", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={only ? copy.proofChip.one : `${copy.proofChip.many}, ${ids.length}`}>
      {only ? (
        copy.proofChip.one
      ) : (
        <>
          {copy.proofChip.many}
          <span aria-hidden="true" className="mx-1 text-muted-foreground">·</span>
          <bdi dir="ltr">{ids.length}</bdi>
        </>
      )}
    </button>
  );
}

/**
 * A row that is a rule itself (a list of rules, a company's terms from its documents): the rule's title is the link, and opens its card;
 * a company's term says whose it is under the title (`scope`). No code: it stays in the card. The whole row is one button, at least 44 px.
 */
export function RuleTitleRow({ id, scope = true, className }: { id: string; /** Under a company's term, the companies it is about. */ scope?: boolean; className?: string }) {
  const open = useOpen();
  const data = useContext(DataCtx);
  const rule = headOf(data, id);
  // a rule the page has neither the record nor the head of: the row still opens the card, which says so
  if (!rule || !data) return <TitleRow onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} opens={id} className={className}>{ruleCopy.title}</TitleRow>;
  const title = rule.title;
  return (
    <TitleRow onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} opens={id} under={scope && !isGeneral(rule) ? scopeTag(rule, data.ownDocs, { company: data.company }) : undefined} className={className}>
      {title.english ? <bdi dir="ltr">{title.text}</bdi> : gershayim(title.text)}
    </TitleRow>
  );
}

/**
 * A list whose items are rules (a text's rules under it in a sheet, a checklist row's "מאיפה זה"): one `RuleTitleRow` per rule, each
 * opening the rule's card (inside a sheet with the back arrow), divided by a line. No chip and no count (D116). No ids, nothing.
 */
export function RuleTitleList({ ids, className }: { ids: readonly string[]; className?: string }) {
  if (ids.length === 0) return null;
  return (
    <ul className={cx("flex flex-col", className)}>
      {ids.map((id) => (
        <li key={id} className="border-t border-border first:border-t-0">
          <RuleTitleRow id={id} />
        </li>
      ))}
    </ul>
  );
}

/**
 * A row of a list whose row is the thing itself (a rule, a proof): its title in the link colour opens it, with a drill-in arrow and an
 * optional line under the title. The whole row is one button, at least 44 px. `opens`: the rule a rule's row opens (`opensAround`).
 */
export function TitleRow({ children, under, onClick, opens, className }: { children: ReactNode; under?: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void; opens?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} data-opens={opens} className={cx("group flex w-full min-h-target items-center gap-3 py-2 text-start text-sm", className)}>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-link group-hover:underline leading-snug [overflow-wrap:anywhere]">{children}</span>
        {under && <span className="text-xs text-muted-foreground">{under}</span>}
      </span>
      <IconDrillIn size={16} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

/**
 * Words in running text that open where they come from (`Term`, `Ruled`): an inline element, not a <button>, since a line may break after
 * a button, which left a sentence's full stop alone at the start of the next line; inline, the mark that closes the sentence follows the
 * words on their line with nothing between (`</Ruled>.`). `prefix`, a one-letter Hebrew prefix ("ה", "ו", "ב", "ל", "מ", "ש", "כ"; "וה" and
 * the like too), stays outside the control, in one non-breaking span with it, so a line never breaks between the letter and the words.
 * `aria-expanded` is true while the sheet it opened is open, which the look reads (teal while open).
 */
function TapWords({ item, look, prefix, data, children }: { item: Item; look: string; prefix?: string; /** `data-term`, where a search hit for a term finds its first use (`TermFromAddress`). */ data?: string; children: ReactNode }) {
  const open = useOpen();
  const tap = useId();
  const expanded = useContext(OpenAnchorCtx)?.dataset.tap === tap;
  const button = (
    <span
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      className={look}
      data-tap={tap}
      data-term={data}
      data-opens={item.kind === "rule" ? item.id : item.kind === "rules" ? item.ids.join(" ") : undefined}
      onClick={(e) => open(item, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(item, e.currentTarget);
        }
      }}
    >
      {children}
    </span>
  );
  // The prefix touches the words with no space between them, so a line can never break there; no no-wrap span is needed, and
  // without one a long phrase of `Ruled` wraps with its sentence (a glossary term stays whole by its own `.term` style).
  return (
    <>
      {prefix}
      {button}
    </>
  );
}

/**
 * A glossary term in running text: a dotted grey underline (`.term`), opens its card. The content decides which use is the first.
 * `prefix`: the word's one-letter Hebrew prefix, outside the term and held to it (`TapWords`).
 */
export function Term({ id, children, prefix, name, lead, parts, rules, className }: { /** Several ids open one sheet of them all, titled `name` (`HelpMark`'s too). */ id: string | readonly string[]; children?: ReactNode; prefix?: string; name?: string; lead?: string; /** With several ids or none: the sheet's own sentences, each with its document (a status word in a row that opens why and the source). */ parts?: readonly SheetPart[]; /** The word rests on rules, not on a glossary term: it opens the rule's card, or the list of them under `name` (a row's status words open the rule that says so, with its sources). */ rules?: readonly string[]; /** Added to the term's own classes (a mark that is an icon widens its touch area). */ className?: string }) {
  const item: Item = rules?.length ? rulesItem(rules, name) : typeof id === "string" ? { kind: "term", id } : { kind: "terms", ids: id, name: name ?? "", lead, ...(parts ? { parts } : {}) };
  return (
    <TapWords item={item} look={className ? `term ${className}` : "term"} prefix={prefix} data={typeof id === "string" ? id : undefined}>
      {children ?? (typeof id === "string" ? id : name)}
    </TapWords>
  );
}

/**
 * The words of a sentence that state what a rule says ("מוגבל בצו", "מנכה מס הכנסה"): they are the link to the rule, the way a figure is
 * its own citation. A solid grey underline (`.ruled`), the line of a sourced figure, so a solid grey line means "tap to see where this comes
 * from" for a figure or for words. A tap opens the rule's card, or with several rules the list of their titles (`name` heads it), in the
 * sheet a figure opens. The words are the shortest phrase that states the rule; a rule marks one phrase in a block, and a figure from the
 * rule needs no words marked, since it opens the rule itself. `prefix` and the closing mark as in `TapWords`. No ids: the words, plain.
 */
export function Ruled({ id, prefix, name, children }: { /** The rule or rules the words state. */ id: string | readonly string[]; prefix?: string; /** With several rules: what they back, under the list's title. */ name?: string; children: ReactNode }) {
  const ids = typeof id === "string" ? [id] : id;
  if (ids.length === 0) return <>{prefix}{children}</>;
  return (
    <TapWords item={rulesItem(ids, name)} look="ruled" prefix={prefix}>
      {children}
    </TapWords>
  );
}

/** A question's entry in the page's `openQuestions`, by either spelling of its code (`TX2 OQ6`, `TX2-OQ6`). */
export function questionOf(data: ProvenanceData | null, id: string) {
  return data?.openQuestions?.[id.replace("-OQ", " OQ")] ?? data?.openQuestions?.[id];
}

export { Disclosure };
