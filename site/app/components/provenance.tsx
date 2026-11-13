// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. Rule and term chips open their cards
// in the same sheet, with a back arrow when they were reached from a number. What the sheet shows (the cards) is in
// provenance-sheets.tsx, fetched while the page hydrates, so the script a page needs to show itself holds only the figures and chips.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router";
import { companyTermRule, type CompanyTermRef, type RuleRecord } from "@finance-tool/schema";
import { formulaNames, numbers, parametersPage, provenance as copy, rule as ruleCopy, scopeWords, strength as strengthCopy } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { fmt, formatValue, joinLead, SHORT_IN_ROW, shortBillions } from "../lib/format";
import { isOpenValue, isParameter, isWeak, strengthOf, type SiteValue, type Strength } from "../lib/value";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconCalculator, IconClock, IconDrillIn, IconFile, IconLock, IconPencil } from "./icons";
import { Sheet } from "./Sheet";
import { cx, Disclosure, Tag } from "./ui";
import { CompanyLinks, LongestCase, When, gershayim, useAheadSaid, countsByItself, useCounting, useGlidingNumbers, useUnseen } from "./kit";
import { chipName, companyLinksOf, isGeneral, joinNames, listedCompanies, ownDocCompanies, shownCompanies, type CompanyLink, type OwnDocs } from "../lib/scope";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue; /** The figure was shown with two decimals (a table cell, or near a threshold): the sheet shows the same digits. */ exact?: boolean; /** The word a value that is not a number was shown as ("אין", "עוד לא דווח", "לא צמוד"): the sheet heads with the same word. */ display?: string } | { kind: "rule"; id: string } | { kind: "rules"; ids: readonly string[]; /** What the list backs: the fact it closes, under the sheet's title. */ name?: string } | { kind: "term"; id: string } | { kind: "terms"; ids: readonly string[]; /** What the terms make up (a column's head): the sheet's title. */ name: string; /** One line under the title, before the terms; with no terms, the sheet's whole text (a "?" with a text of its own). */ lead?: string; /** After the line: the chip of the rules it rests on (a "?" with a sentence of its own and its rules). */ rules?: readonly string[]; /** After the lead: sentences of the sheet's own, each with what it is about and the document it rests on (why an account sells no fund on an index, a sentence and a source for each kind of fund). */ parts?: readonly SheetPart[] } | { kind: "formula"; id: string } | { kind: "question"; id: string };

/** One sentence of a sheet's own text (`Item` "terms", `parts`): what it is about, the sentence, and the document it rests on. */
export interface SheetPart {
  head?: string;
  text: string;
  doc?: { href: string; title: string };
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
  /** Per formula, its Hebrew name and the site parameters it uses (the formula sheet). A page that does not pass it still gets the name from `formulaNames`. */
  formulas?: Record<string, { name: string; parameters: string[]; /** The math docs/method.md writes for it, in order (`loadFormulaTex`). */ tex?: string[] }>;
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
   * The records the page's rule cards point at (`derived_from`, `examples`) that the page does not hold itself, so each chip on a card
   * opens its record (`pointedRecords` in data.server.ts). Only chips and cards read it; the page's own logic reads `rules`.
   */
  pointed?: Record<string, RuleRecord>;
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

export function ProvenanceProvider({ data, children }: { data: ProvenanceData; children: ReactNode }) {
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
  const [states] = useState(statesStore);
  return (
    <Ctx.Provider value={api}>
      <StatesCtx.Provider value={states}>
      <DataCtx.Provider value={data}>
      <TodayCtx.Provider value={data.today}>
      {children}
      <PushCtx.Provider value={push}>
       <CloseCtx.Provider value={close}>
        <Sheet open={open} onClose={close} anchor={anchor} pc="popover" height={70} className="lg:max-h-[60vh] lg:backdrop:bg-transparent" labelledBy={headId} describedBy={descId} onBack={back} view={stack.length}>
          {top && code && <code.SheetContent item={top} data={data} headId={headId} descId={descId} />}
        </Sheet>
       </CloseCtx.Provider>
      </PushCtx.Provider>
      </TodayCtx.Provider>
      </DataCtx.Provider>
      </StatesCtx.Provider>
    </Ctx.Provider>
  );
}

/** The page's provenance data, for the chips that must know what exists (a parameter card, a formula). */
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
    let id: string;
    try {
      id = decodeURIComponent(m[1]!);
    } catch {
      return;
    }
    if (!terms[id]) return;
    const el = [...document.querySelectorAll<HTMLElement>("[data-term]")].find((n) => n.dataset.term === id) ?? null;
    el?.scrollIntoView({ block: "center" });
    api.open({ kind: "term", id }, el);
  }, [hash, terms, api]);
  return null;
}

export const InsideSheetCtx = createContext(false);
/**
 * A page about one company (its company page, a track's page): every company-sourced figure on it is that company's own (D31), so
 * none carries "לפי החברה" or its caution.
 */
const OwnCompanyCtx = createContext(false);
export function OwnCompanyPage({ children }: { children: ReactNode }) {
  return <OwnCompanyCtx.Provider value={true}>{children}</OwnCompanyCtx.Provider>;
}

/** A notice above already says the figures are old. */
const StaleSaidCtx = createContext(false);

/**
 * Inside a block that sums up figures the person typed in boxes elsewhere on the screen (the kit's `TypedPlain`): an entered figure is
 * plain words, not a control. Its sheet would only say the person typed it, and the box it was typed in is beside the block.
 */
export const TypedPlainCtx = createContext(false);

/** How many figures the person entered the page shows now: the legend's "you entered" sample stands only beside one.
 * A store, not state, so a figure that comes or goes redraws the legend alone. */
/** How many figures of each state the page shows (a `Num` counts itself while it is on the page), so the legend names only the states the
 *  page has. */
function statesStore() {
  const n: Record<string, number> = {};
  const subs = new Set<() => void>();
  const ping = () => subs.forEach((f) => f());
  return {
    add: (state: string) => {
      n[state] = (n[state] ?? 0) + 1;
      ping();
      return () => {
        n[state]! -= 1;
        ping();
      };
    },
    subscribe: (f: () => void) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    has: (state: string) => (n[state] ?? 0) > 0,
  };
}
const StatesCtx = createContext<ReturnType<typeof statesStore> | null>(null);

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

const stateWord = { sourced: numbers.legend.sourced, computed: numbers.legend.computed, entered: numbers.legend.entered };

/**
 * A sourced figure that takes effect after the run date: a rate "from tomorrow" rolled forward for years is
 * not in force yet. Computed figures never carry the flag themselves; their sheet lists the inputs.
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
 * "unlinked_15". A number keeps its digits, exact or rounded as shown.
 */
export function valueItem(value: SiteValue, written: string | undefined, exact: boolean): Item {
  return { kind: "value", value, ...(exact ? { exact: true } : {}), ...(typeof value.value !== "number" && written ? { display: written } : {}) };
}

/** The provenance number: a button holding the formatted value in an isolating span, then its flags. Marks sit before the digits, never between a number and the unit word that follows it. */
export function Num({ value: given, size = "inline", display, animate, className, prefix, exact, fullWord, name, wrap }: NumProps) {
  const ownPage = useContext(OwnCompanyCtx);
  const value = ownPage && !given.own && strengthOf(given) === "institution" ? { ...given, own: "page" } : given;
  const open = useOpen();
  const today = useContext(TodayCtx);
  const staleSaid = useContext(StaleSaidCtx);
  const aheadSaid = useAheadSaid();
  const param = isParameter(value);
  const counting = useCounting();
  const states = useContext(StatesCtx);
  const unseen = useUnseen();
  // a copy that only holds a block's size (LongestCase) is not on the page; a field's value shows no state, so the legend leaves it out
  const plain = !!value.field;
  const typedPlain = useContext(TypedPlainCtx);
  useEffect(() => (!unseen && !plain && states ? states.add(value.state) : undefined), [value.state, unseen, plain, states]);
  // a copy laid out unseen holds a height only: it lands at once, and its frames cost nothing (a list's cases counted on every key)
  const shown = useAnimatedValue(typeof value.value === "number" ? value.value : null, !unseen && (animate ?? (counting && countsByItself(value.state, value.unit))));
  // display rounding (A13): computed and entered amounts round, in table cells too ("16,000.00 ₪" in a table); `exact` keeps the agorot
  const keepDecimals = !!exact;
  const roundState = keepDecimals ? undefined : value.state;
  // a figure that lands on whole shekels glides through whole shekels: the frames showed agorot, then snapped
  const target = typeof value.value === "number" ? value.value : null;
  const landing = target === null || shown === target ? null : typeof display === "function" ? display(target) : formatValue(target, value.unit, roundState, param);
  const frame = shown !== null && landing !== null && !/\d\.\d/.test(landing ?? "") ? Math.round(shown) : shown;
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
  const label = [name, fullWord ?? text, blocked ? null : stateWord[value.state], param ? numbers.parameter : null, weak, doubt, future, value.stale ? `${numbers.staleSince} ${fmt.date(value.stale.since)}` : null, numbers.details].filter(Boolean).join(", ");
  // one caution icon, before the digits, for a weak source or a date still ahead (the sheet says which); a computed figure
  // carries the weak-source icon only at figure size, since its sheet names the weak input. The words stay out of the line: a
  // word between a number and its unit ("4 לפי החברה ימי עסקים") broke the sentence. At figure size a date ahead
  // is also said in words, before the digits.
  const markWeak = weak && (value.state !== "computed" || size === "figure");
  const mark = "inline-block align-[-2px] select-none";
  // a long text value (a fund's full name) may wrap: kept on one line it ran 73 px past a phone's edge; any other figure is
  // one unit with its icon, which stood alone on the line above its digits in a phone's table
  const oneLine = !wrap && !(typeof value.value === "string" && text.length > 24);
  // a field's value (its default, or what the reader typed) is a plain number: no mark, no sheet; the field beside it is where it changes
  // (charts.md); so is a typed figure in a block that sums up typed boxes (`TypedPlainCtx`)
  if (plain || (typedPlain && value.state === "entered")) {
    const bare = <bdi dir={textDir(text)} className={cx("whitespace-nowrap", className)}>{text}</bdi>;
    return prefix ? <span className="whitespace-nowrap">{typeof prefix === "string" ? joinLead(prefix, text) : prefix}{bare}</span> : bare;
  }
  const button = (
    <button
      type="button"
      className={cx("num", `num-${value.state}`, doubt && "num-doubt", size === "figure" && "num-figure", size === "cell" && "num-cell", value.value === null && "num-unknown", oneLine && "whitespace-nowrap", className)}
      aria-label={label}
      onClick={(e) => open(valueItem(value, fullWord ?? written, keepDecimals), e.currentTarget)}
    >
      {value.stale && !staleSaid && <IconClock size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {(fromDate || markWeak || doubt) && <IconAlert size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {blocked && <IconLock size={14} className={cx("text-blocked me-1", mark)} aria-hidden="true" />}
      {fromDate && size === "figure" && <span className="text-xs text-caution-foreground font-normal me-1 no-underline select-none"><When iso={fromDate} lead={numbers.startsOn} /></span>}
      {short ? (
        <>
          {shortPc ? <ShortText text={shortPc} className="max-md:hidden" /> : <bdi dir={textDir(text)} className="whitespace-nowrap max-md:hidden">{text}</bdi>}
          <ShortText text={short} className="md:hidden" />
        </>
      ) : (
        <bdi dir={textDir(text)} className={oneLine ? "whitespace-nowrap" : undefined}>{text}</bdi>
      )}
    </button>
  );
  // a maqaf lead before a figure said in words ("תעריפון מ־" before "נובמבר 2025") writes its letter on the word: "מנובמבר 2025" (copy.md 10)
  return prefix ? <span className="whitespace-nowrap">{typeof prefix === "string" ? joinLead(prefix, text) : prefix}{button}</span> : button;
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
export function useAnimatedValue(target: number | null, enabled: boolean): number | null {
  // not a number to glide to: NaN takes its goal at once, either way
  const moves = enabled && target !== null;
  const shown = useGlidingNumbers([moves ? target : NaN])[0]!;
  return moves && Number.isFinite(shown) ? shown : target;
}

// ---------------------------------------------------------------- tags, chips, lines

export function StateTag({ state }: { state: "sourced" | "computed" | "entered" | "parameter" }) {
  if (state === "parameter") return <Tag tone="parameter">{numbers.parameter}</Tag>;
  if (state === "computed") return <Tag tone="computed" icon={<IconCalculator size={14} />}>{numbers.legend.computed}</Tag>;
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

export type IdKind = "rule" | "formula" | "parameter" | "assumption" | "question";
const QUESTION_ID = /^([A-Z0-9]+)[ -]OQ(\d+)$/;
/** The open question an open value cites (`TXI OQ19`), in its source's title or its notes; null when it names none. */
export const openQuestionOf = (v: SiteValue): string | null => {
  const src = v.state === "sourced" ? (v.source as { title?: string }).title ?? "" : "";
  const m = /\b([A-Z][A-Z0-9]*)[ -]OQ(\d+)\b/.exec(`${src} ${v.notes ?? ""}`);
  return m ? `${m[1]} OQ${m[2]}` : null;
};
/**
 * What an id is, from its shape: `TX2 OQ6` a question; `F-80`, and any id `formulaNames` names (`A-06`, which is a method
 * assumption that has a formula of its own), a formula; `P-01` a site parameter; any other `A-nn` an assumption of the
 * method (a parameter card links to it only when the card has it as an input); `ABC-12` a rule. Anything else is null: no chip.
 */
export function idKind(id: string): IdKind | null {
  if (QUESTION_ID.test(id)) return "question";
  if (/^F-\d+$/.test(id) || (id !== "_other" && Object.hasOwn(formulaNames, id))) return "formula";
  if (/^P-\d+$/.test(id)) return "parameter";
  if (/^A-\d+$/.test(id)) return "assumption";
  if (/^[A-Z][A-Z0-9]*-\d+$/.test(id)) return "rule";
  return null;
}

/**
 * One chip for any id the site has: a rule opens its card, a formula its sheet, an open question its sheet,
 * a parameter goes to its card on the parameters page. The chip says words, never the code (D48): a rule's chip is
 * "חוקים וכללים · 1" (`RulesChip`), or with `titled` the rule's title; a formula's says its name, a parameter's its name,
 * an open question's "פרטים". The code stays in the card or sheet it opens and in the chip's address. A 44px tap area.
 * - `asLabel`: the chip as a label that does nothing (a parameter's own card, which a link would only point back at).
 * An empty id renders nothing; an id that is no kind renders as plain text; a parameter or an `A-nn` no card has, nothing.
 */
/**
 * The punctuation that closes a sentence on a chip (".", ",", ";", ":"): held to the chip on one line and drawn close to its frame, so
 * it never reads as a stray mark with a gap before it ("פרטים ."). A chip is its own frame and takes no
 * brackets (`IdText` drops them too). Kit guard 20.
 */
function ChipEnd({ chip, end }: { chip: ReactNode; end?: string }) {
  if (!end) return <>{chip}</>;
  return (
    <span className="whitespace-nowrap">
      {chip}
      <span className="chip-end">{end}</span>
    </span>
  );
}

export function IdRef(props: { id: string; className?: string; asLabel?: boolean; /** A list of questions: the chip says the question's title, the rows being otherwise alike (D49). A rule: its title, where the chip stands for the rule in a list of them. */ titled?: boolean; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
  return <ChipEnd chip={<IdChip {...props} />} end={props.end} />;
}

function IdChip({ id, className, asLabel, titled }: { id: string; className?: string; asLabel?: boolean; titled?: boolean }) {
  const open = useOpen();
  const close = useContext(CloseCtx);
  const data = useContext(DataCtx);
  if (!id) return null;
  const kind = idKind(id);
  const plain = <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{id}</bdi>;
  if (!kind) return plain;
  const shown = kind === "question" ? id.replace("-OQ", " OQ") : id;
  // a rule's chip says "חוקים וכללים · 1", or its title where the chip stands for the rule in a list (`titled`)
  const rule = kind === "rule" ? ruleOf(data, shown) : undefined;
  if (kind === "rule" && !(titled && rule) && !asLabel) return <RulesChip ids={[shown]} className={className} />;
  // an open question's chip says a word, not its code: the sentence around it says "שאלה פתוחה", the sheet says which
  const title = titled && kind === "question" ? questionOf(data, shown)?.title_he : undefined;
  const ruleName = rule ? ruleTitle(rule) : undefined;
  let card: string | undefined;
  if (kind === "parameter") card = data?.parameters ? data.parameters[id] : id;
  if (kind === "assumption") card = data?.parameters?.[id];
  if ((kind === "parameter" || kind === "assumption") && !card) return null;
  const formulaName = kind === "formula" ? formulaNames[id] || data?.formulas?.[id]?.name || formulaNames._other : undefined;
  const words = title ?? (ruleName ? ruleName.text : card ? parametersPage.names[card] ?? copy.idRef.parameter : formulaName ?? (kind === "question" ? copy.idRef.questionChip : ruleCopy.set));
  // a short word stays on one line; a title or a name wraps inside the chip
  const long = !!(title || ruleName || formulaName || (card && parametersPage.names[card]));
  const chip = ruleName?.english ? <bdi dir="ltr" className="text-start">{words}</bdi> : <span className={long ? "text-start" : "whitespace-nowrap"}>{words}</span>;
  if (asLabel) return <span className={cx("rule-chip pointer-events-none", long && "whitespace-normal", className)}>{chip}</span>;
  if (card) {
    return (
      <Link to={`/parameters#${card}`} className={cx("rule-chip", long && "whitespace-normal", className)} onClick={close} aria-label={`${copy.idRef.parameter}: ${words}`}>
        {chip}
      </Link>
    );
  }
  const aria = kind === "rule" ? `${ruleCopy.title}: ${words}` : kind === "formula" && id.startsWith("A-") ? `${copy.idRef.howComputed}: ${words}` : kind === "question" ? copy.idRef.question : `${copy.idRef.formula}: ${words}`;
  const item: Item = kind === "question" ? { kind: "question", id: shown } : { kind: kind as "rule" | "formula", id: shown };
  return (
    <button type="button" className={cx("rule-chip", long && "whitespace-normal", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={aria}>
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
 * The rule chip: `IdRef` for a rule id. A company's term (scope `institution`, or `unsettled` seen at named companies) shows the
 * company's name instead of the code (spec 2026-10-25-rules-scope §4): on that company's page its own name, elsewhere the first with
 * "ועוד" and the count of the others. A general rule's chip is D48's "חוקים וכללים · 1", which opens its card at once. The code stays in
 * the card it opens and in the chip's spoken name.
 */
export function RuleRef({ id, className, titled, end }: { id: string; className?: string; /** A general rule's chip says its title (`IdRef`'s `titled`): where it stands for the rule in a list of them. */ titled?: boolean; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
  const open = useOpen();
  const data = useContext(DataCtx);
  const rule = ruleOf(data, id);
  const name = rule && !isGeneral(rule) ? chipName(rule, data?.ownDocs, data?.company, chipMore) : null;
  if (!name) return <IdRef id={id} className={className} titled={titled} end={end} />;
  return (
    <ChipEnd
      end={end}
      chip={
        <button type="button" className={cx("rule-chip", className)} onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} aria-label={`${ruleCopy.title} ${id}, ${scopeTag(rule!, data?.ownDocs)}`}>
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
export function scopeTag(rule: RuleRecord, ownDocs: OwnDocs | undefined, short?: { company: string | undefined }): string {
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
      const r = ruleOf(data, companyTermRule(ref));
      if (!r) return [];
      const listed = listedCompanies(r, data?.ownDocs);
      return companyLinksOf(typeof ref === "string" ? listed : listed.filter((c) => ref.companies.includes(c.id)), data?.companies);
    })
    .filter((c) => !seen.has(c.id) && seen.add(c.id));
  return <CompanyLinks lead={lead} items={items} size={size} end={end} className={className} />;
}

/**
 * The rules behind one fact, as one chip with their count: a code says nothing to the reader, and a block
 * could carry 25 of them. It opens the list of their titles; one rule opens its card at once. No ids, no chip: a control with nothing behind it cannot exist.
 */
export function RulesChip({ ids, name, className }: { ids: readonly string[]; /** The fact it closes, under the title of the list. */ name?: string; className?: string }) {
  const open = useOpen();
  const only = ids.length === 1 ? ids[0]! : null;
  if (ids.length === 0) return null;
  // a line that cites one formula or open question keeps that id's own chip
  if (only && idKind(only) !== "rule") return <IdRef id={only} className={className} />;
  const item: Item = only ? { kind: "rule", id: only } : { kind: "rules", ids, ...(name ? { name } : {}) };
  return (
    <button type="button" className={cx("rule-chip", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={`${ruleCopy.set}, ${ids.length}`}>
      {ruleCopy.set}
      {/* the chip lays its children out as flex items, so the separator carries its own space */}
      <span aria-hidden="true" className="mx-1 text-muted-foreground">·</span>
      <bdi dir="ltr">{ids.length}</bdi>
    </button>
  );
}

/** `RulesChip` as the last line of its block, never inside a sentence. */
export function RulesLine({ ids, lead, name, className }: { ids: readonly string[]; lead?: ReactNode; name?: string; className?: string }) {
  if (ids.length === 0 && !lead) return null;
  return (
    <p className={cx("rules-line text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {lead}
      <RulesChip ids={ids} name={name} />
    </p>
  );
}

/**
 * A row that is a rule itself (a list of rules, a company's terms from its documents): the rule's title is the link, and opens its card;
 * a company's term says whose it is under the title (`scope`). No code: it stays in the card. The whole row is one button, at least 44 px.
 */
export function RuleTitleRow({ id, scope = true, className }: { id: string; /** Under a company's term, the companies it is about. */ scope?: boolean; className?: string }) {
  const open = useOpen();
  const data = useContext(DataCtx);
  const rule = ruleOf(data, id);
  // a record the page does not hold: its chip still opens the card, which says so
  if (!rule) return <span className={cx("flex min-h-target items-center", className)}><RulesChip ids={[id]} /></span>;
  const title = ruleTitle(rule);
  return (
    <button type="button" onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} className={cx("group flex w-full min-h-target items-center gap-3 py-2 text-start text-sm", className)}>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-link group-hover:underline leading-snug [overflow-wrap:anywhere]">{title.english ? <bdi dir="ltr">{title.text}</bdi> : gershayim(title.text)}</span>
        {scope && !isGeneral(rule) && <span className="text-xs text-muted-foreground">{scopeTag(rule, data?.ownDocs, { company: data?.company })}</span>}
      </span>
      <IconDrillIn size={16} className="shrink-0 text-muted-foreground" />
    </button>
  );
}

/**
 * A glossary term in running text: dashed underline, opens its card. The content decides which use is the first.
 * `prefix` is the one-letter Hebrew prefix of the word ("ה", "ו", "ב", "ל", "מ", "ש", "כ"; "וה" and the like too): it is
 * rendered inside the same non-breaking span, so a line never breaks between the letter and the term.
 */
export function Term({ id, children, prefix, name, lead, parts, rules, className }: { /** Several ids open one sheet of them all, titled `name` (`HelpMark`'s too). */ id: string | readonly string[]; children?: ReactNode; prefix?: string; name?: string; lead?: string; /** With several ids or none: the sheet's own sentences, each with its document (a status word in a row that opens why and the source). */ parts?: readonly SheetPart[]; /** The word rests on rules, not on a glossary term: it opens the rule's card, or the list of them under `name` (a row's status words open the rule that says so, with its sources). */ rules?: readonly string[]; /** Added to the term's own classes (a mark that is an icon widens its touch area). */ className?: string }) {
  const open = useOpen();
  const item: Item = rules?.length ? (rules.length === 1 ? { kind: "rule", id: rules[0]! } : { kind: "rules", ids: rules, ...(name ? { name } : {}) }) : typeof id === "string" ? { kind: "term", id } : { kind: "terms", ids: id, name: name ?? "", lead, ...(parts ? { parts } : {}) };
  // An inline element, not a <button>: a line may break after a button, which left a sentence's full stop alone at the start of the next line.
  const button = (
    <span
      role="button"
      tabIndex={0}
      className={className ? `term ${className}` : "term"}
      data-term={typeof id === "string" ? id : undefined}
      onClick={(e) => open(item, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(item, e.currentTarget);
        }
      }}
    >
      {children ?? (typeof id === "string" ? id : name)}
    </span>
  );
  return prefix ? (
    <span className="whitespace-nowrap">
      {prefix}
      {button}
    </span>
  ) : (
    button
  );
}

/**
 * The key to the number styles (copy 2). Samples are marks, not figures. The fourth item is the mark a figure
 * carries when it rests on a company's document used out of its own context (D31); a page passes `institution` only when it has such a figure. `term`
 * adds the glossary-term sample (dashed teal underline, `.term`) for pages whose text has `Term`s (the guide, exposure pages; wp6, A78).
 */
const noSubscribe = () => () => {};
const yes = () => true;
const no = () => false;

/** The key to the number states: each sample stands only while the page shows a figure of its state ("you entered"
 *  on a page where nothing was entered, "computed" on a page with no computed figure). The room of every sample is kept, so nothing below
 *  moves when one comes or goes; "you entered" has room only on a page with fields (`canEnter`), and "press a number" stands only beside a
 *  number sample (a calculator before anything is typed has no figure to press). Before the page is in the browser the
 *  figures are not counted yet, and the legend shows the sourced and computed samples as it always did. */
export function NumberLegend({ className, institution = false, doubt = false, term = false, canEnter = false }: { className?: string; institution?: boolean; /** The page shows a figure its record doubts (`anyDoubt`). */ doubt?: boolean; term?: boolean; canEnter?: boolean }) {
  const store = useContext(StatesCtx);
  const subscribe = store?.subscribe ?? noSubscribe;
  const sourced = useSyncExternalStore(subscribe, () => store?.has("sourced") ?? true, yes);
  const computed = useSyncExternalStore(subscribe, () => store?.has("computed") ?? true, yes);
  const entered = useSyncExternalStore(subscribe, () => store?.has("entered") ?? false, no);
  const legend = (shown: { sourced: boolean; computed: boolean; entered: boolean }) => <LegendLine className={className} institution={institution} doubt={doubt} term={term} {...shown} />;
  return <LongestCase cases={[legend({ sourced: true, computed: true, entered: canEnter })]}>{legend({ sourced, computed, entered: canEnter && entered })}</LongestCase>;
}

function LegendLine({ className, institution, doubt, term, sourced, computed, entered }: { className?: string; institution: boolean; doubt: boolean; term: boolean; sourced: boolean; computed: boolean; entered: boolean }) {
  // Each state's own word drawn in its style, after a lead that says what the key is: the old "123" samples read as a placeholder left in
  // the page. A key never shows a made-up figure (design-system 3.2).
  const anyNumber = sourced || computed || entered || institution || doubt;
  return (
    <p className={cx("flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground", className)} data-sample>
      {(sourced || computed || entered) && <span className="whitespace-nowrap">{numbers.legend.lead}</span>}
      {sourced && (
        <span className="num num-sourced num-sample whitespace-nowrap">
          {numbers.legend.sourced}
        </span>
      )}
      {computed && (
        <span className="num num-computed num-sample whitespace-nowrap">
          {numbers.legend.computed}
        </span>
      )}
      {entered && (
        <span className="num num-entered num-sample whitespace-nowrap">
          {numbers.legend.enteredSample}
        </span>
      )}
      {institution && (
        <span>
          <MarkHead mark={<IconAlert size={14} className="text-caution inline-block align-[-2px] me-1" aria-hidden="true" />} text={numbers.legend.institution} />
        </span>
      )}
      {/* the figure a record doubts, drawn as the figure is: the amber tint and the caution mark on the word itself */}
      {doubt && (
        <span>
          <span className="num-doubt whitespace-nowrap">
            <IconAlert size={14} className="text-caution inline-block align-[-2px] me-1" aria-hidden="true" />
            {numbers.doubt}
          </span>
          : {numbers.legend.doubtMeaning}
        </span>
      )}
      {anyNumber && (
        <>
          <span className="lg:hidden">{numbers.legendHintPhone}</span>
          <span className="hidden lg:inline">{numbers.legendHintPc}</span>
        </>
      )}
      {term && (
        <span className="whitespace-nowrap">
          <span className="term" aria-hidden="true">{numbers.legend.term}</span> {numbers.legend.termMeaning}
        </span>
      )}
    </p>
  );
}

/** A question's entry in the page's `openQuestions`, by either spelling of its code (`TX2 OQ6`, `TX2-OQ6`). */
export function questionOf(data: ProvenanceData | null, id: string) {
  return data?.openQuestions?.[id.replace("-OQ", " OQ")] ?? data?.openQuestions?.[id];
}

export { Disclosure };
