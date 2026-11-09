// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. Rule and term chips open their cards
// in the same sheet, with a back arrow when they were reached from a number.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router";
import { companyTermRule, type CompanyTermRef, type RuleRecord } from "@finance-tool/schema";
import { buttons, computedInputs, flags as flagCopy, formulaKeys, formulaNames, numbers, provenance as copy, rule as ruleCopy, ruleCardMore, rulesDetail, scopeWords, sourceBlock as sourceCopy, strength as strengthCopy, updateRules } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { ownFigures } from "../lib/rule-row";
import { fmt, formatValue, joinLead, SHORT_IN_ROW, shortBillions } from "../lib/format";
import { hasHebrew, hostOf, isHebrewTitle, mostlyHebrew, sourceLabel } from "../lib/source-label";
import { citationText, mayHaveChanged, moreSourcesLabel, pickSources, publicUrl, sourceHref, sourceLabel2, sourceParts, type CitedPlace, type RuleSource, type SourcedRule } from "../lib/sources";
import { useInputs } from "../lib/inputs";
import { isOpenValue, isParameter, isWeak, ownBy, ruleFigure, strengthOf, type SiteValue, type Strength } from "../lib/value";
import { parseAnswer } from "../lib/answer-slots";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconCalculator, IconCheck, IconClock, IconCopy, IconDrillIn, IconExternal, IconFile, IconLock, IconPencil, IconReset } from "./icons";
import { Sheet } from "./Sheet";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";
import { Card, CompanyLinks, FormulaBlock, GroupHead, LongestCase, PrintedText, StatRow, When, useAheadSaid, countsByItself, gershayim, keepTitleWhole, useCounting, useGlidingNumbers, useUnseen } from "./kit";
import { chipName, companyLinksOf, generalOnly, isGeneral, isNotRule, isOwnSourceOf, joinNames, listedCompanies, noCompanyAnchor, ownDocCompanies, scopeCompanies, pageView, shownCompanies, sourceCompany, sourcesForPage, type CompanyLink, type OwnDocs } from "../lib/scope";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue; /** The figure was shown with two decimals (a table cell, or near a threshold): the sheet shows the same digits. */ exact?: boolean; /** The word a value that is not a number was shown as ("אין", "עוד לא דווח", "לא צמוד"): the sheet heads with the same word. */ display?: string } | { kind: "rule"; id: string } | { kind: "rules"; ids: readonly string[]; /** What the list backs: the fact it closes, under the sheet's title. */ name?: string } | { kind: "term"; id: string } | { kind: "terms"; ids: readonly string[]; /** What the terms make up (a column's head): the sheet's title. */ name: string; /** One line under the title, before the terms; with no terms, the sheet's whole text (a "?" with a text of its own). */ lead?: string } | { kind: "formula"; id: string } | { kind: "question"; id: string };

interface ProvenanceApi {
  open: (item: Item, anchor: HTMLElement | null) => void;
}

const Ctx = createContext<ProvenanceApi>({ open: () => {} });
/** The run date of the page (`ProvenanceData.today`), for the future-date flag on a figure. Empty outside a provider: no flag. */
const TodayCtx = createContext("");

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
const ruleOf = (data: ProvenanceData | null | undefined, id: string): RuleRecord | undefined => data?.rules[id] ?? data?.pointed?.[id];

export function ProvenanceProvider({ data, children }: { data: ProvenanceData; children: ReactNode }) {
  const [stack, setStack] = useState<Item[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const api = useMemo<ProvenanceApi>(
    () => ({
      open: (item, el) => {
        setStack([item]);
        setAnchor(el);
        setOpen(true);
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
          {top && <SheetContent item={top} data={data} headId={headId} descId={descId} />}
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
const DataCtx = createContext<ProvenanceData | null>(null);

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

const InsideSheetCtx = createContext(false);
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
const CloseCtx = createContext<() => void>(() => {});

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
const textDir = (text: string): "ltr" | "rtl" => (/[\u0590-\u05FF]/.test(text) ? "rtl" : "ltr");

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
export function Num({ value: given, size = "inline", display, animate, className, prefix, exact, fullWord }: NumProps) {
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
  const label = [fullWord ?? text, blocked ? null : stateWord[value.state], param ? numbers.parameter : null, weak, doubt, future, value.stale ? `${numbers.staleSince} ${fmt.date(value.stale.since)}` : null, numbers.details].filter(Boolean).join(", ");
  // one caution icon, before the digits, for a weak source or a date still ahead (the sheet says which); a computed figure
  // carries the weak-source icon only at figure size, since its sheet names the weak input. The words stay out of the line: a
  // word between a number and its unit ("4 לפי החברה ימי עסקים") broke the sentence. At figure size a date ahead
  // is also said in words, before the digits.
  const markWeak = weak && (value.state !== "computed" || size === "figure");
  const mark = "inline-block align-[-2px] select-none";
  // a long text value (a fund's full name) may wrap: kept on one line it ran 73 px past a phone's edge; any other figure is
  // one unit with its icon, which stood alone on the line above its digits in a phone's table
  const oneLine = !(typeof value.value === "string" && text.length > 24);
  // a field's value (its default, or what the reader typed) is a plain number: no mark, no sheet; the field beside it is where it changes
  // (charts.md)
  if (plain) {
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
 * One chip for any id the site shows: a rule opens its card, a formula its sheet, an open question its sheet,
 * a parameter goes to its card on the parameters page. The ID is LTR with a slashed zero and a 44px tap area.
 * - `asLabel`: the id as a label that does nothing (a parameter's own card, which a link would only point back at).
 * An empty id renders nothing; an id that is no kind, or an `A-nn` no card has, renders as plain text.
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

export function IdRef(props: { id: string; className?: string; asLabel?: boolean; /** A list of questions: the chip says the question's title, the rows being otherwise alike (D49). A rule: its Hebrew title before its id, where the chip stands in reader's text with no words of its own. */ titled?: boolean; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
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
  // an open question's chip says a word, not its code: the sentence around it says "שאלה פתוחה", the sheet says which
  const title = titled && kind === "question" ? questionOf(data, shown)?.title_he : undefined;
  const ruleTitle = titled && kind === "rule" ? ruleOf(data, shown)?.title_he : undefined;
  const chip = title ? (
    <span className="text-start">{title}</span>
  ) : ruleTitle ? (
    <span className="text-start">
      {ruleTitle} · <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{shown}</bdi>
    </span>
  ) : kind === "question" ? <span className="whitespace-nowrap">{copy.idRef.questionChip}</span> : <bdi dir="ltr" className="whitespace-nowrap">{shown}</bdi>;
  if (asLabel) return <span className={cx("rule-chip pointer-events-none", className)}>{chip}</span>;
  let card: string | undefined;
  if (kind === "parameter") card = data?.parameters ? data.parameters[id] : id;
  if (kind === "assumption") card = data?.parameters?.[id];
  if ((kind === "parameter" || kind === "assumption") && !card) return plain;
  if (card) {
    return (
      <Link to={`/parameters#${card}`} className={cx("rule-chip", className)} onClick={close} aria-label={`${copy.idRef.parameter} ${id}`}>
        <bdi dir="ltr">{id}</bdi>
      </Link>
    );
  }
  const aria = kind === "rule" ? `${ruleCopy.title} ${id}` : kind === "formula" && id.startsWith("A-") ? `${copy.idRef.howComputed} ${id}` : kind === "question" ? copy.idRef.question : `${copy.idRef.formula} ${shown}`;
  const item: Item = kind === "question" ? { kind: "question", id: shown } : { kind: kind as "rule" | "formula", id: shown };
  return (
    <button type="button" className={cx("rule-chip", (title || ruleTitle) && "whitespace-normal", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={aria}>
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
 * "ועוד" and the count of the others. The code stays in the card it opens and in the chip's spoken name.
 */
export function RuleRef({ id, className, titled, end }: { id: string; className?: string; /** A general rule's chip says its Hebrew title before its id (`IdRef`'s `titled`). */ titled?: boolean; /** Punctuation that closes the sentence on the chip (`ChipEnd`). */ end?: string }) {
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
function scopeTag(rule: RuleRecord, ownDocs: OwnDocs | undefined, short?: { company: string | undefined }): string {
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

/** What a `RulesChip` opens: each rule as "id, title", a company's term named; a row opens the card, with the sheet's back arrow to the list. */
function RulesListSheet({ ids, name, data, headId }: { ids: readonly string[]; name?: string; data: ProvenanceData; headId: string }) {
  const open = useOpen();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {ruleCopy.set} · <bdi dir="ltr">{ids.length}</bdi>
        </h2>
        {name && <p className="text-sm text-muted-foreground">{name}</p>}
      </div>
      <ul className="flex flex-col">
        {ids.map((id) => {
          const rule = ruleOf(data, id);
          const title = rule ? ruleTitle(rule) : null;
          return (
            <li key={id} className="border-t border-border">
              {idKind(id) === "rule" ? (
                <button type="button" onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} className="flex w-full min-h-target items-center gap-3 py-2 text-start text-sm hover:underline">
                  <span className="min-w-16 shrink-0 text-xs text-link">
                    <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{id}</bdi>
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    {title && (title.english ? <bdi dir="ltr">{title.text}</bdi> : <span>{title.text}</span>)}
                    {rule && !isGeneral(rule) && <span className="text-xs text-muted-foreground">{scopeTag(rule, data.ownDocs, { company: data.company })}</span>}
                  </span>
                  <IconDrillIn size={16} className="shrink-0 text-muted-foreground" />
                </button>
              ) : (
                <span className="flex min-h-target items-center"><IdRef id={id} /></span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * A glossary term in running text: dashed underline, opens its card. The content decides which use is the first.
 * `prefix` is the one-letter Hebrew prefix of the word ("ה", "ו", "ב", "ל", "מ", "ש", "כ"; "וה" and the like too): it is
 * rendered inside the same non-breaking span, so a line never breaks between the letter and the term.
 */
export function Term({ id, children, prefix, name, lead }: { /** Several ids open one sheet of them all, titled `name` (`HelpMark`'s too). */ id: string | readonly string[]; children?: ReactNode; prefix?: string; name?: string; lead?: string }) {
  const open = useOpen();
  const item: Item = typeof id === "string" ? { kind: "term", id } : { kind: "terms", ids: id, name: name ?? "", lead };
  // An inline element, not a <button>: a line may break after a button, which left a sentence's full stop alone at the start of the next line.
  const button = (
    <span
      role="button"
      tabIndex={0}
      className="term"
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

// ---------------------------------------------------------------- source block

const asSourced = (r: RuleRecord): SourcedRule => r as unknown as SourcedRule;

/** Text that may hold Latin letters or digits: isolated so it keeps its order inside Hebrew. */
function Iso({ children, ltr }: { children: ReactNode; ltr?: boolean }) {
  return <bdi dir={ltr ? "ltr" : undefined}>{children}</bdi>;
}

/**
 * Whether a source is the company's own document on its own term (D31): `true` for a figure's one source (`SiteValue.own`), or a test
 * of each source on a rule card (a source on the named company's own sites; BRK-43 cites IB Ireland's page, which
 * is not Interactive Brokers' own, so it keeps "לפי החברה").
 */
type OwnSource = boolean | ((source: RuleSource) => boolean);

/** A source's names on its link line, each once (`sourceParts`): the publisher, a dot, the document's title; either may be left out. */
function SourceNames({ parts, hebrewTitle }: { parts: ReturnType<typeof sourceParts>; hebrewTitle: boolean }) {
  const pub = parts.publisher && <Iso ltr={!hasHebrew(parts.publisher)}>{gershayim(parts.publisher)}</Iso>;
  const title = parts.title && <Iso ltr={parts.title.host || !hebrewTitle}>{keepTitleWhole(parts.title.text)}</Iso>;
  return (
    <>
      {pub}
      {pub && title && " · "}
      {title}
    </>
  );
}

/** One source: the link line, the quoted words, then when it was read (synthesis 3.3). */
function OneSource({ source, rule, today, english, own }: { source: RuleSource; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; english?: boolean; own?: OwnSource }) {
  // a data file names its company in English: the publishers table gives the Hebrew name by the source's host
  const publishersHe = useContext(DataCtx)?.publishersHe;
  const host = hostOf(source.url);
  const he = source.publisher_he ?? (host ? publishersHe?.[host] : undefined);
  const n = sourceLabel2(he ? { ...source, publisher_he: he } : source);
  const parts = sourceParts(he ? { ...source, publisher_he: he } : source);
  // D31: a company's own document on its own term is shown with a neutral source line, no "לפי החברה"; `own` lifts only that label,
  // never "מקור משני"
  const isOwn = typeof own === "function" ? own(source) : !!own;
  const weak = source.strength !== "primary" && !(isOwn && source.strength === "institution") ? sourceCopy.weak[source.strength] : null;
  const changed = mayHaveChanged(rule ?? { likely_to_change: "no" }, source, today);
  return (
    <div className="flex flex-col gap-1">
      <a href={sourceHref(source)} target="_blank" rel="noopener noreferrer" className="text-link inline-flex max-w-full items-start gap-1 hover:underline">
        <span className="min-w-0 [overflow-wrap:anywhere]">
          <SourceNames parts={parts} hebrewTitle={isHebrewTitle(n.title)} />
          {n.locator && (
            <>
              , <Iso>{n.locator}</Iso>
            </>
          )}
        </span>
        {n.pdf && <span className="shrink-0 mt-1 text-xs leading-none rounded-sm border border-border px-1 py-0.5 text-muted-foreground">{sourceCopy.pdfTag}</span>}
        <IconExternal size={16} className="shrink-0 mt-1" />
      </a>
      {source.quote && <p className="text-sm text-muted-foreground line-clamp-3">״{source.quote}״</p>}
      <p className={cx("text-xs", changed ? "text-caution-foreground" : "text-muted-foreground")}>
        {sourceCopy.checked} <Iso ltr>{fmt.date(source.checked)}</Iso>
        {weak && ` · ${weak}`}
        {changed && ` · ${sourceCopy.mayHaveChanged}`}
      </p>
      {english && !isHebrewTitle(n.title) && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">{copy.sourced.englishTitle}</summary>
          <bdi dir="ltr" className="[overflow-wrap:anywhere]">
            {source.title}
          </bdi>
        </details>
      )}
    </div>
  );
}

/**
 * The source block (synthesis 3.3): the first source in full; further ones behind "עוד מקור אחד" in the sheet and all
 * shown when `inline` (the rules pages). `english` keeps the English title in a collapsed line when the shown name is a host.
 */
export function SourceBlock({ source, rule, today, inline, english, own }: { source: RuleSource | readonly RuleSource[]; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; inline?: boolean; english?: boolean; own?: OwnSource }) {
  const list = Array.isArray(source) ? (source as readonly RuleSource[]) : [source as RuleSource];
  const [first, ...rest] = list;
  if (!first) return null;
  // no "לקריאה נוחה" copy after an official source any more: pickSources leaves copies out when there is one
  // one page may be cited twice, for two quotes (IRA-29): the place in the list keeps the keys apart
  const more = rest.map((s, i) => <OneSource key={`${i}:${s.url}${s.locator ?? ""}`} source={s} rule={rule} today={today} english={english} own={own} />);
  return (
    <div className="flex flex-col gap-3">
      <OneSource source={first} rule={rule} today={today} english={english} own={own} />
      {rest.length > 0 &&
        (inline ? (
          more
        ) : (
          <Disclosure label={<span className="text-sm">{moreSourcesLabel(rest.length)}</span>}>
            <div className="flex flex-col gap-3 pt-1">{more}</div>
          </Disclosure>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------- sheet content

function SheetContent({ item, data, headId, descId }: { item: Item; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <InsideSheetCtx.Provider value={true}>
      {item.kind === "value" && <ValueSheet value={item.value} exact={!!item.exact} display={item.display} data={data} headId={headId} descId={descId} />}
      {item.kind === "rule" && <RuleCard id={item.id} data={data} headId={headId} />}
      {item.kind === "rules" && <RulesListSheet ids={item.ids} name={item.name} data={data} headId={headId} />}
      {item.kind === "term" && <TermCard id={item.id} data={data} headId={headId} />}
      {item.kind === "terms" && <TermsSheet ids={item.ids} name={item.name} lead={item.lead} data={data} headId={headId} />}
      {item.kind === "formula" && <FormulaSheet id={item.id} data={data} headId={headId} />}
      {item.kind === "question" && <QuestionSheet id={item.id} data={data} headId={headId} />}
    </InsideSheetCtx.Provider>
  );
}

/**
 * A formula's sheet: its Hebrew name; the formula itself in math type with a key to its symbols, when docs/method.md writes it as math
 * , else a link to its full definition there; and the
 * site parameters it uses, each a chip to its card (left out when there are none, or when the page did not pass `formulas`).
 */
function FormulaSheet({ id, data, headId }: { id: string; data: ProvenanceData; headId: string }) {
  const known = data.formulas?.[id];
  const name = formulaNames[id] || known?.name || formulaNames._other;
  const parameters = known?.parameters ?? [];
  const tex = known?.tex ?? [];
  const key = formulaKeys[id];
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {name} <bdi dir="ltr" className="slashed-zero text-muted-foreground text-base">{id}</bdi>
      </h2>
      {tex.length > 0 ? (
        <FormulaBlock lines={tex.map((t, i) => ({ tex: t, label: tex.length > 1 ? key?.lines?.[i] : undefined }))} symbols={key?.symbols ?? []} where={copy.formulaSheet.where} />
      ) : (
        <a href={METHOD_URL} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-start gap-1 text-sm hover:underline" dir="ltr">
          <span className="min-w-0 [overflow-wrap:anywhere]">{copy.formulaSheet.full}</span>
          <IconExternal size={16} className="shrink-0 mt-0.5" />
        </a>
      )}
      {parameters.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{copy.formulaSheet.usesLabel}</span>
          <span className="flex flex-wrap gap-2">
            {parameters.map((p) => <IdRef key={p} id={p} />)}
          </span>
        </div>
      )}
    </div>
  );
}
const METHOD_URL = "https://github.com/orishamir/finance-tool/blob/main/docs/method.md";

/** A question's entry in the page's `openQuestions`, by either spelling of its code (`TX2 OQ6`, `TX2-OQ6`). */
function questionOf(data: ProvenanceData | null, id: string) {
  return data?.openQuestions?.[id.replace("-OQ", " OQ")] ?? data?.openQuestions?.[id];
}

/**
 * An open question's sheet: its title, status and what it blocks from data/open-questions.json, then what an open question means on
 * the site. An answered question is deleted from the rule base once its answer is in a rule, so no sheet is closed.
 */
function QuestionSheet({ id, data, headId }: { id: string; data: ProvenanceData; headId: string }) {
  const q = questionOf(data, id);
  const status = q?.status_he ?? (q?.status ? copy.questionSheet.statuses[q.status] : undefined);
  const blocks = q?.blocks_he;
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {q?.title_he ?? copy.idRef.question}
      </h2>
      {(status || blocks) && (
        <dl className="sheet-dl">
          {status && <Row label={copy.questionSheet.status}>{status}</Row>}
          {blocks && <Row label={copy.questionSheet.blocks}>{blocks}</Row>}
        </dl>
      )}
      <p className="text-sm">{copy.questionSheet.what}</p>
      <p className="text-sm text-muted-foreground">{copy.questionSheet.onSite}</p>
    </div>
  );
}

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

/** A source: its Hebrew title, or the link's host with the English title in a collapsed line. */
function SourceLink({ url, title }: { url: string; title: string }) {
  const external = /^https?:/.test(publicUrl(url));
  const label = sourceLabel({ url, title }, copy.sourced.localFile);
  const text = label.host ? <bdi dir="ltr">{label.text}</bdi> : label.text;
  const link = !external ? (
    <span className="[overflow-wrap:anywhere]">{text}</span>
  ) : (
    <a href={sourceHref({ url })} target="_blank" rel="noopener noreferrer" className="text-link inline-flex max-w-full items-start gap-1 hover:underline">
      <span className="min-w-0 [overflow-wrap:anywhere]">{text}</span>
      <IconExternal size={16} className="shrink-0 mt-1" />
    </a>
  );
  if (!label.english) return link;
  return (
    <span className="flex flex-col gap-1">
      {link}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer">{copy.sourced.englishTitle}</summary>
        <bdi dir="ltr" className="[overflow-wrap:anywhere]">
          {label.english}
        </bdi>
      </details>
    </span>
  );
}

/** The inputs of a computed value that rest on a weak source (institution or secondary), by their names: what the caution in the sheet points at. */
export function weakInputNames(value: SiteValue): string[] {
  const out: string[] = [];
  for (const [key, input] of Object.entries((value.computed_from?.inputs ?? {}) as Record<string, SiteValue>)) {
    if (!input || typeof input !== "object" || !("state" in input)) continue;
    if (isWeak(input)) out.push(inputName(key));
  }
  return out;
}

/** The Hebrew name of a computed input: the copy's name for an English key, else the key as written (already Hebrew). */
export function inputName(key: string): string {
  return computedInputs.names[key] ?? key;
}

/** An input that is a word the engine wrote in English ("mean"): its Hebrew word; a numeric or already-Hebrew input is shown as it is. */
function inputDisplay(key: string, input: SiteValue): string | undefined {
  if (typeof input.value !== "string") return undefined;
  const word = computedInputs.valueWords[input.value];
  if (word) return word;
  if (key in computedInputs.names && !hasHebrew(input.value) && !/^\d{4}-\d{2}(-\d{2})?$/.test(input.value)) return input.value.replace(/_/g, " ");
  return undefined;
}

/** A fee or rate takes effect after the run date, or is a calendar-year average: the row the sheet shows instead of "in force until". */
function calendarYearOf(v: SiteValue): string | null {
  const f = v.effective_from;
  const t = v.effective_to;
  if (!f || !t) return null;
  return f.slice(0, 4) === t.slice(0, 4) && f.slice(5) === "01-01" && t.slice(5) === "12-31" ? f.slice(0, 4) : null;
}

/** Units whose number has no sign of its own: the rule card prints the word after it. */
const suffixUnits = new Set(["months", "years", "days", "business_days", "usd", "eur"]);

function unitWordOf(unit: string): string | null {
  return (copy.unit as Record<string, string>)[unit] ?? null;
}

/** The sourced figure's one source block: the figure's own source and date, with the Hebrew names and the locator of the same link in its rule record when there is one. */
function FigureSource({ value, data }: { value: SiteValue; data: ProvenanceData }) {
  if (value.state !== "sourced") return null;
  const ids = value.rule_ids ?? [];
  const strengthOk = (st: string): st is RuleSource["strength"] => st === "primary" || st === "institution" || st === "secondary";
  let known: RuleSource | undefined;
  let owner: SourcedRule | undefined;
  for (const id of ids) {
    const r = data.rules[id];
    if (!r) continue;
    owner ??= asSourced(r);
    known ??= pickSources(asSourced(r)).find((x) => x.url === value.source.url);
  }
  // the figure's own place in the document (its PDF page, the words its web page opens at) before the rule's
  const at = value.source as CitedPlace;
  const source: RuleSource = {
    ...(known ?? { title: value.source.title, publisher: value.source.publisher }),
    url: value.source.url,
    ...(at.page ? { page: at.page } : {}),
    ...(at.fragment ? { fragment: at.fragment } : {}),
    strength: strengthOk(value.source.strength) ? value.source.strength : (known?.strength ?? "secondary"),
    checked: value.checked,
  };
  // a figure's source can be a file of the site, not a web address: the old plain label stays for it
  if (!/^https?:/.test(publicUrl(source.url))) return <SourceLink url={source.url} title={source.title} />;
  return <SourceBlock source={source} rule={owner} today={data.today} english own={!!value.own} />;
}

/**
 * Why a site parameter has this value. The clicked number's own line comes first; the parameter file's general line, which
 * covers every number of the file, waits behind "more" (one line for all of P-05's numbers does not say
 * what "2%" is). A number with no line of its own shows the general line directly.
 */
export function ParameterWhy({ value }: { value: SiteValue }) {
  const general = value.parameter?.rationaleHe ?? (mostlyHebrew(value.parameter?.rationale) ? value.parameter?.rationale : null) ?? null;
  const own = value.rationale_he ?? null;
  const first = own ?? general ?? copy.parameter.noRationale;
  const more = own && general && general !== own ? general : null;
  return (
    <>
      <span className="text-sm">{first}</span>
      {more && (
        <Disclosure label={<span className="text-sm">{copy.parameter.more}</span>} className="mt-0.5">
          <p className="text-sm text-muted-foreground pt-1">{more}</p>
        </Disclosure>
      )}
    </>
  );
}

const slotUnitWords = ["months", "years", "days", "business_days", "usd", "eur"];

/** A sentence with {ID:figure} slots (the questions' answers, the "הידעת?" facts): each slot is that rule's figure, with its unit in words where the number carries none. */
export function SlottedText({ text, rules, today }: { text: string; rules: Record<string, RuleRecord>; today: string }) {
  return (
    <>
      {parseAnswer(text).map((p, k) => {
        if (p.kind === "text") return <span key={k}>{p.text}</span>;
        const rule = rules[p.id];
        const v = rule ? ruleFigure(rule, p.figure, today) : null;
        if (!v) return <span key={k}>—</span>;
        const word = (copy.unit as Record<string, string>)[v.unit];
        return (
          <span key={k} className="whitespace-nowrap">
            <Num value={{ ...v, notes: "" }} />
            {typeof v.value === "number" && word && slotUnitWords.includes(v.unit) && <> {word}</>}
          </span>
        );
      })}
    </>
  );
}

/** The sheet behind a figure (exported for the render tests). */
export function ValueSheet({ value, exact, display, data, headId, descId }: { value: SiteValue; exact: boolean; display?: string; data: ProvenanceData; headId: string; descId: string }) {
  const strength = strengthOf(value);
  const param = isParameter(value);
  const today = useContext(TodayCtx);
  const blocked = isOpenValue(value);
  const bare = (typeof value.value !== "number" ? display : undefined) ?? (blocked ? strengthCopy.open.label : formatValue(value.value, value.unit, exact ? undefined : value.state, param));
  // a figure shown with its sign heads its sheet with it: "+0.37%" in the row read "0.37%" in the sheet
  const text = value.signed && typeof value.value === "number" && value.value !== 0 ? `${value.value > 0 ? "+" : "−"}${formatValue(Math.abs(value.value), value.unit, exact ? undefined : value.state, param)}` : bare;
  // a long word (a deposit's tax: "ריבית לא צמודה; השיעור בעמוד המדריך.") wraps in a smaller size; kept on one line it ran past a phone's edge
  const longHead = text.length > 24;
  // the row's own words where they differ from the unit's (a one-year gap: "ב־2025"), so the head says what the row says (copy 10.4)
  const unitWord = typeof value.value === "number" ? (value.unitText ?? unitWordOf(value.unit)) : null;
  const { setEntered } = useInputs();
  const fromDate = startsAfter(value, today);
  const year = calendarYearOf(value);
  const weakNames = value.state === "computed" ? weakInputNames(value) : [];
  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span id={headId} className={cx("num num-static font-semibold", longHead ? "text-xl" : "text-2xl", `num-${value.state}`, value.value === null && "text-muted-foreground")}>
            <bdi dir={textDir(text)} className={longHead ? undefined : "whitespace-nowrap"}>{text}</bdi>
          </span>
          {unitWord && <span className="text-sm text-muted-foreground">{unitWord}</span>}
          {!blocked && <StateTag state={param ? "parameter" : value.state} />}
          {/* a figure that rests on the site's reading of official texts says so wherever it is opened (the
              guide visuals and the holdings page carried the engine's reading label and nothing showed it) */}
          {value.labels?.some((l) => l.code === "reading") && <ReadingTag />}
          {value.stale && <IconClock size={16} className="text-caution" />}
        </div>
        {value.about && (
          <p id={descId} className="text-sm text-muted-foreground">
            {value.about}
          </p>
        )}
      </header>

      {/* what the figure means, before anything else in the sheet: at the end it sat below the popover's edge */}
      {value.lead && <p className="text-sm">{value.lead}</p>}

      {fromDate && (
        <p className="text-sm text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-1" />
          <span>
            <When iso={fromDate} lead={numbers.startsOn} />. {copy.sourced.notYetInForce}
          </span>
        </p>
      )}

      {/* the record's own doubt about this figure (SiteValue.doubt): said near the top of the figure's sheet, wherever the figure shows; at the end it sat below a phone's fold */}
      {value.doubt && (
        <Callout tone="caution" title={numbers.doubt}>
          <PrintedText text={value.doubt} />
        </Callout>
      )}

      {/* the working notes are English; only a note written in Hebrew is shown */}
      {/* an open value's reason is the blocked callout below; "not found in the source" would be untrue of it */}
      {value.value === null && !(blocked && !mostlyHebrew(value.notes)) && <p className="text-sm">{mostlyHebrew(value.notes) ? value.notes : copy.sourced.noValue}</p>}
      {/* an empty value a rule explains ("אין", PF-06) names that rule as a chip, as a sourced figure does */}
      {value.value === null && display && value.rule_ids && value.rule_ids.length > 0 && (
        <dl className="sheet-dl">
          <Row label={copy.sourced.rule}>
            <span className="flex flex-wrap gap-2">
              {value.rule_ids.map((id) => <RuleRef key={id} id={id} titled />)}
            </span>
          </Row>
        </dl>
      )}

      {value.state === "sourced" && !param && value.value !== null && !value.about && (
        <p className="text-sm text-muted-foreground">
          {copy.sourced.lineBefore}
        </p>
      )}

      {value.state === "sourced" && param && (
        <dl className="sheet-dl">
          <Row label={copy.parameter.why}>
            <ParameterWhy value={value} />
          </Row>
        </dl>
      )}

      {value.state === "sourced" && !param && value.value !== null && (
        <>
        <FigureSource value={value} data={data} />
        <dl className="sheet-dl">
          {year ? (
            <Row label={copy.sourced.forYear}>
              <bdi dir="ltr">{year}</bdi>
            </Row>
          ) : (
            <>
              {value.effective_from && (
                <Row label={copy.sourced.from}>
                  <When iso={value.effective_from} />
                </Row>
              )}
              {value.effective_to && (
                <Row label={copy.sourced.to}>
                  <When iso={value.effective_to} />
                </Row>
              )}
            </>
          )}
          {value.rule_ids && value.rule_ids.length > 0 && (
            <Row label={copy.sourced.rule}>
              <span className="flex flex-wrap gap-2">
                {value.rule_ids.map((id) => <RuleRef key={id} id={id} titled />)}
              </span>
            </Row>
          )}
          {mostlyHebrew(value.notes) && <Row label=""><span className="text-sm text-muted-foreground"><IdText text={value.notes ?? ""} /></span></Row>}
        </dl>
        </>
      )}

      {value.state === "computed" && value.computed_from && (
        <>
          <dl className="sheet-dl">
            <Row label={value.computed_from.formula.startsWith("A-") ? copy.idRef.howComputed : copy.computed.formula}>
              {/* the chip alone: its name is on its own sheet */}
              <IdRef id={value.computed_from.formula} />
            </Row>
          </dl>
          {/* a figure computed from no value (a count of a comparison's own options) has no inputs to list, and no heading over nothing */}
          {Object.keys(value.computed_from.inputs).length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">{copy.computed.inputs}</span>
            <dl className="readout">
              {/* each input is a figure that opens its own sheet, with its source: the sheet names no source of its own under it */}
              {Object.entries(value.computed_from.inputs as Record<string, SiteValue>).map(([label, input]) => (
                <div key={label} className="readout-row">
                  <dt>{inputName(label)}</dt>
                  <dd>
                    <Num value={input} display={inputDisplay(label, input)} />
                    {/* a field's value (its default or what the reader typed) shows plainly: no parameter tag */}
                    {isParameter(input) && !input.field && <Tag tone="parameter">{numbers.parameter}</Tag>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          )}
          {value.rulesUsed && value.rulesUsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">{copy.computed.rules}</span>
              <div className="flex flex-col gap-2">
                {/* each rule is a chip that opens its card, with its source; beside it only a source weaker than primary, which the reader
                    must see here */}
                {value.rulesUsed.map((r) => (
                  <span key={r.id} className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <RuleRef id={r.id} titled />
                    {r.strength !== "primary" && <StrengthLabel strength={r.strength} />}
                  </span>
                ))}
              </div>
            </div>
          )}
          {value.flags?.map((code) => (
            <Callout key={code} tone="caution">
              {flagCopy[code] ?? copy.flagOther} <bdi dir="ltr" className="text-xs">{code}</bdi>
            </Callout>
          ))}
          {mostlyHebrew(value.notes) && <p className="text-sm text-muted-foreground"><IdText text={value.notes ?? ""} /></p>}
        </>
      )}

      {value.state === "entered" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">{copy.entered.line}</p>
          {value.replaces && (
            <dl className="readout">
              <div className="readout-row">
                <dt>{copy.entered.instead}</dt>
                <dd>
                  <Num value={value.replaces} />
                  {isParameter(value.replaces) && !value.replaces.field && <Tag tone="parameter">{numbers.parameter}</Tag>}
                </dd>
              </div>
            </dl>
          )}
          {value.resetKey && (
            <Button variant="quiet" className="self-start -ms-2" onClick={() => setEntered(value.resetKey as never, null)}>
              <IconReset size={16} /> {buttons.resetOne}
            </Button>
          )}
        </div>
      )}

      {(isWeak(value) || strength === "open") && value.state !== "entered" && (
        <Callout tone={strength === "open" ? "blocked" : "caution"} title={strengthCopy[strength].label}>
          {strengthCopy[strength].line}
          {/* the question an open value waits on, named in its source or notes ("TXI OQ19"): its chip opens the question */}
          {blocked && openQuestionOf(value) && (
            <>
              {" "}
              <IdRef id={openQuestionOf(value)!} />
            </>
          )}
          {weakNames.length > 0 && (
            <span className="block">
              {copy.computed.weakInputs} {weakNames.join(" · ")}
            </span>
          )}
        </Callout>
      )}
      {value.stale && (
        <p className="text-sm text-caution-foreground flex items-start gap-2">
          <IconClock size={16} className="text-caution shrink-0 mt-1" />
          <span>
            <When iso={value.stale.since} lead={`${copy.stale.before} `} />. {copy.stale.middle} {copy.stale.cadence[value.stale.cadence]}.
          </span>
        </p>
      )}

      {data.rulesOf ? (
        <LinkButton to={data.rulesOf.href}>
          {copy.allRulesOf} {data.rulesOf.name}
        </LinkButton>
      ) : (
        <LinkButton to="/rules">{buttons.allRules}</LinkButton>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- rule card

/** A figure's Hebrew name when the record has one; else its key as written. */
function figureLabel(rule: RuleRecord, name: string, className = "text-xs"): ReactNode {
  return rule.figure_names_he?.[name] ? <span className={className}>{rule.figure_names_he[name]}</span> : <bdi dir="ltr" className={className}>{name}</bdi>;
}

const unitSuffix = (unit: string, className = "text-sm text-muted-foreground") => (suffixUnits.has(unit) ? <span className={className}> {unitWordOf(unit)}</span> : null);

/** "לשנת המס 2026 · קבוע בחוק": the tax year the figure is for (when its label does not say) and how it is updated. */
function FigureNote({ v, labelYear, className = "block text-xs text-muted-foreground font-normal" }: { v: { tax_year?: number | null; update_rule: string }; labelYear: string | null; className?: string }) {
  const bits: ReactNode[] = [];
  if (v.tax_year && String(v.tax_year) !== labelYear)
    bits.push(
      <span key="y">
        {ruleCardMore.forTaxYear} <bdi dir="ltr">{v.tax_year}</bdi>
      </span>,
    );
  const frozen = /^frozen (\d{4})-(\d{4})$/.exec(v.update_rule);
  const word = frozen ? updateRules.frozen : (updateRules as Record<string, string>)[v.update_rule];
  if (word) {
    const [before, after] = word.split("{years}");
    bits.push(
      <span key="u">
        {before}
        {frozen && (
          <bdi dir="ltr">
            {frozen[1]}–{frozen[2]}
          </bdi>
        )}
        {after}
      </span>,
    );
  }
  if (bits.length === 0) return null;
  return <span className={className}>{bits.flatMap((b, i) => (i ? [" · ", b] : [b]))}</span>;
}

/** The rule's "המספרים" block: every figure of the record, by tax year and by bracket, each a Num. */
function RuleFigures({ rule, id, pageValue = (v) => v, head }: { rule: RuleRecord; id: string; pageValue?: (v: SiteValue) => SiteValue; /** In place of the plain muted "המספרים". */ head?: ReactNode }) {
  const figures = Object.entries(rule.figures ?? {});
  if (figures.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {head ?? <span className="text-sm text-muted-foreground">{ruleCopy.figures}</span>}
      <dl className="readout">
        {figures.flatMap(([name, f]) => {
          if (Array.isArray(f))
            return f.map((b, i) => (
              <div key={`${name}-${i}`} className="readout-row">
                <dt>
                  {figureLabel(rule, name)} {b.up_to.value === null ? "" : "≤"} {b.up_to.value !== null && <Num value={pageValue({ ...b.up_to, rule_ids: b.up_to.rule_ids ?? [id] })} />}
                  {i === 0 && <FigureNote v={b.rate} labelYear={null} />}
                </dt>
                <dd>
                  <Num value={pageValue({ ...b.rate, rule_ids: b.rate.rule_ids ?? [id] })} />
                  {unitSuffix(b.rate.unit)}
                </dd>
              </div>
            ));
          const byYear = "by_tax_year" in f ? Object.entries(f.by_tax_year) : [[null, f] as const];
          return byYear.map(([year, v]) => (
            <div key={`${name}-${year ?? ""}`} className="readout-row">
              <dt>
                {figureLabel(rule, name)}
                {year && (
                  <>
                    {" "}
                    <bdi dir="ltr">{year}</bdi>
                  </>
                )}
                <FigureNote v={v} labelYear={year} />
              </dt>
              <dd>
                <Num value={pageValue({ ...v, rule_ids: v.rule_ids ?? [id] })} />
                {unitSuffix(v.unit)}
              </dd>
            </div>
          ));
        })}
      </dl>
    </div>
  );
}

function ShownRuleTitle({ rule }: { rule: RuleRecord }) {
  const t = ruleTitle(rule);
  return t.english ? <bdi dir="ltr">{t.text}</bdi> : <>{t.text}</>;
}

export function RuleCard({ id, data, headId, inline }: { id: string; data: ProvenanceData; headId?: string; inline?: boolean }) {
  const record = ruleOf(data, id);
  if (!record) {
    return (
      <div className="flex flex-col gap-2">
        <h2 id={headId} className="text-lg font-semibold">
          <bdi dir="ltr" className="slashed-zero">{id}</bdi>
        </h2>
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
        <LinkButton to="/rules">{ruleCopy.all}</LinkButton>
      </div>
    );
  }
  // on a company's page only that company's part of the record (D30): its name, its own documents, the law and the regulator, its figures
  const page = data.pageCompanies ?? (data.company ? [data.company] : []);
  const rule = pageView(record, page, data.companies);
  const open = rule.strength === "open";
  const sourced = asSourced(rule);
  const sources = page.length ? sourcesForPage(rule, pickSources(sourced), page, data.companies) : pickSources(sourced);
  /** A company's figure on its own term, on its own page, is its own (D31): no "לפי החברה". */
  const pageValue = (v: SiteValue): SiteValue => {
    const c = page.length && v.source.strength === "institution" ? sourceCompany(rule, v.source, data.companies) : null;
    return c && page.includes(c.id) && rule.scope === "institution" ? ownBy(v, c.id) : v;
  };
  const uses = data.ruleUses?.[id];
  return (
    <div className={cx("flex-1 flex flex-col gap-3", open && "rule-open")}>
      <header className="flex flex-col gap-1.5">
        <h2 id={headId} className="text-lg font-semibold leading-snug">
          {open && <>{ruleCopy.open.title} </>}
          <bdi dir="ltr" className="slashed-zero">{id}</bdi>
          {!open && " · "}
          {!open && <ShownRuleTitle rule={rule} />}
        </h2>
        {/* who it applies to (D30): a neutral label, never a warning; the strength tag stays only for an open or second-hand source, or a general rule read from a company's document */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone="neutral" wrap>{scopeTag(rule, data.ownDocs, { company: data.company })}</Tag>
          {/* a record the rule base keeps that is not a rule says so: its foot leads to "לא נכלל ככלל" on /companies */}
          {isNotRule(id) && !isGeneral(rule) && <Tag tone="neutral">{scopeWords.notRule.tag}</Tag>}
          {(rule.strength === "open" || rule.strength === "secondary" || (rule.strength === "institution" && rule.scope === "general")) && <StrengthLabel strength={rule.strength} />}
        </div>
      </header>
      {open ? (
        <Callout tone="blocked">
          <span className="block">
            <ShownRuleTitle rule={rule} />
          </span>
          <span className="block">{ruleCopy.open.last}</span>
        </Callout>
      ) : rule.text_he ? (
        <p className="text-sm">{rule.text_he}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
      )}
      {!isGeneral(rule) && <p className="text-sm text-muted-foreground">{scopeLine(rule, data.ownDocs)}</p>}
      <RulePointers rule={rule} />
      {sources.length > 0 ? (
        // a company's term read from that company's own document is its own context (D31): the source line carries no "לפי החברה"
        <SourceBlock source={sources} rule={sourced} today={data.today} inline={inline} own={rule.scope === "institution" ? (s) => isOwnSourceOf(rule, s, data.ownDocs, data.companies) : false} />
      ) : (
        // rule records without a source link are shown as such, not hidden
        <p className="text-sm text-muted-foreground">{ruleCopy.sourceMissing}</p>
      )}
      <RuleFigures rule={rule} id={id} pageValue={pageValue} />
      <dl className="sheet-dl">
        <Row label={ruleCopy.checked}>
          <When iso={rule.checked} />
        </Row>
        {rule.recheck_date && (
          <Row label={ruleCopy.recheck}>
            <When iso={rule.recheck_date} />
          </Row>
        )}
        {/* only the dimensions the page can name: a page that passes none shows no empty row */}
        {rule.dimensions.some((d) => data.dimensions[d]) && (
          <Row label={ruleCopy.dimensions}>
            <span className="flex flex-wrap gap-1.5">
              {rule.dimensions.filter((d) => data.dimensions[d]).map((d) => (
                <Tag key={d} tone="neutral">
                  {data.dimensions[d]}
                </Tag>
              ))}
            </span>
          </Row>
        )}
        {uses && (uses.pages.length > 0 || uses.engine) && (
          <Row label={ruleCardMore.usesLead}>
            <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {uses.pages.map((u) => (
                <Link key={u.href} to={u.href} className="text-link hover:underline">
                  {u.label}
                </Link>
              ))}
              {uses.engine && <span>{ruleCardMore.usesEngine}</span>}
            </span>
          </Row>
        )}
      </dl>
      {rule.likely_to_change === "no" && !rule.recheck_date && <p className="text-xs text-muted-foreground">{ruleCardMore.stable}</p>}
      {uses && uses.pages.length === 0 && !uses.engine && <p className="text-xs text-muted-foreground">{ruleCardMore.usesNone}</p>}
      {/* the card's foot: pushed to the bottom, so cards side by side have it at one height */}
      <div className="mt-auto flex flex-col gap-3 pt-1">
        {sources[0] && <CitationBox text={citationText(sourced, sources[0], sources[0].checked)} />}
        {!inline && <CardFoot rule={rule} data={data} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the rules page's detail and top match

/** "נגזר מ־" and the rules a conclusion rests on; "לדוגמה:" and a general rule's named examples at companies (never a derivation). */
function RulePointers({ rule }: { rule: RuleRecord }) {
  const derived = asSourced(rule).derived_from ?? [];
  const examples = rule.examples ?? [];
  return (
    <>
      {derived.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{ruleCardMore.derivedFrom}</span>
            {derived.map((d) => <RuleRef key={d} id={d} titled />)}
          </p>
          <p className="text-xs text-muted-foreground">{ruleCardMore.derivedLine}</p>
        </div>
      )}
      {examples.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ruleCardMore.examples}</span>
          {examples.map((d) => <RuleRef key={d} id={d} titled />)}
        </p>
      )}
    </>
  );
}


/** A document's citation copied by a press: the citation box's line for each place cited in it, behind a small button with the box's words. Its 44 px reach spills into the block's padding, so the line stays as tall as the date beside it. */
function CopyCitation({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // no clipboard permission: nothing is written, nothing is claimed
    }
  };
  return (
    <Button variant="quiet" className="!px-0 -my-3 ms-auto text-xs gap-1" onClick={() => void copy()} aria-live="polite">
      {copied ? <IconCheck size={14} className="text-positive" /> : <IconCopy size={14} />}
      <span className={copied ? "text-positive" : undefined}>{copied ? sourceCopy.citation.copied : ruleCardMore.copyCitation}</span>
    </Button>
  );
}

/** A rule's sources by document: one block per address (its names, its PDF tag), each cited place in it on its own line with its quoted words, then when it was read and the document's copy button. */
function SourcesByDocument({ sources, rule, today }: { sources: readonly RuleSource[]; rule: SourcedRule; today: string }) {
  const publishersHe = useContext(DataCtx)?.publishersHe;
  const docs: RuleSource[][] = [];
  const at = new Map<string, number>();
  for (const s of sources) {
    const key = publicUrl(s.url).split("#")[0]!;
    if (!at.has(key)) {
      at.set(key, docs.length);
      docs.push([]);
    }
    docs[at.get(key)!]!.push(s);
  }
  const w = rulesDetail;
  return (
    <section className="flex flex-col gap-3" aria-label={w.sourcesHead}>
      <GroupHead>{w.sourcesHead}</GroupHead>
      {docs.map((list) => {
        const first = list[0]!;
        const host = hostOf(first.url);
        const he = first.publisher_he ?? (host ? publishersHe?.[host] : undefined);
        const named = he ? { ...first, publisher_he: he } : first;
        const parts = sourceParts(named);
        const n = sourceLabel2(named);
        const dates = [...new Set(list.map((s) => s.checked))];
        return (
          <div key={first.url} className="flex flex-col gap-1.5 rounded-md border border-border p-3">
            <a href={sourceHref(list.length === 1 ? first : { url: first.url })} target="_blank" rel="noopener noreferrer" className="text-link inline-flex max-w-full items-start gap-1 hover:underline font-medium">
              <span className="min-w-0 [overflow-wrap:anywhere]">
                <SourceNames parts={parts} hebrewTitle={isHebrewTitle(n.title)} />
              </span>
              {n.pdf && <span className="shrink-0 mt-1 text-xs leading-none rounded-sm border border-border px-1 py-0.5 text-muted-foreground font-normal">{sourceCopy.pdfTag}</span>}
              <IconExternal size={16} className="shrink-0 mt-1" />
            </a>
            <ul className="flex flex-col gap-1.5">
              {list.map((s, i) => {
                const loc = sourceLabel2(s).locator;
                const weak = s.strength !== "primary" ? sourceCopy.weak[s.strength] : null;
                const changed = mayHaveChanged(rule, s, today);
                return (
                  <li key={`${i}:${s.locator ?? ""}`} className="flex flex-col gap-0.5 border-s-2 border-border ps-2.5">
                    {loc && (
                      <a href={sourceHref(s)} target="_blank" rel="noopener noreferrer" className="text-link text-sm hover:underline w-fit [overflow-wrap:anywhere]">
                        <Iso>{loc}</Iso>
                      </a>
                    )}
                    {s.quote && <p className="text-sm text-muted-foreground">״{s.quote}״</p>}
                    {(weak || changed || dates.length > 1) && (
                      <p className={cx("text-xs", changed ? "text-caution-foreground" : "text-muted-foreground")}>
                        {dates.length > 1 && (
                          <>
                            {sourceCopy.checked} <Iso ltr>{fmt.date(s.checked)}</Iso>
                          </>
                        )}
                        {weak && `${dates.length > 1 ? " · " : ""}${weak}`}
                        {changed && `${dates.length > 1 || weak ? " · " : ""}${sourceCopy.mayHaveChanged}`}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-3">
              {dates.length === 1 && (
                <p className="text-xs text-muted-foreground">
                  {sourceCopy.checked} <Iso ltr>{fmt.date(dates[0]!)}</Iso>
                </p>
              )}
              <CopyCitation text={list.map((s) => citationText(rule, s, s.checked)).join("\n")} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

/**
 * The rules page's whole rule, opened from its row: everything the rule card holds, in the order a reader checks it. Its id; the title and the products it applies to; the text; its numbers; its sources by document; then what it touches,
 * what it changes on the site, and when it was read. `after` is the search's line to the companies' documents.
 */
export function RuleDetail({ id, data, products, headId, after }: { id: string; data: ProvenanceData; products: readonly string[]; headId?: string; after?: ReactNode }) {
  const rule = ruleOf(data, id);
  if (!rule) return <RuleCard id={id} data={data} headId={headId} inline />;
  const open = rule.strength === "open";
  const sourced = asSourced(rule);
  const sources = pickSources(sourced);
  const uses = data.ruleUses?.[id];
  const dims = rule.dimensions.filter((d) => data.dimensions[d]);
  const usesSome = !!uses && (uses.pages.length > 0 || uses.engine);
  return (
    <article className={cx("flex flex-col gap-5 min-w-0 [overflow-wrap:anywhere]", open && "rule-open")}>
      <p className="text-[13px] text-muted-foreground">
        <bdi dir="ltr" className="tabular-nums slashed-zero">{id}</bdi>
      </p>
      <header className="flex flex-col gap-2 -mt-3">
        <h2 id={headId} tabIndex={-1} className="text-xl font-semibold leading-snug outline-none">
          {open && <>{ruleCopy.open.title} </>}
          <ShownRuleTitle rule={rule} />
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {products.map((p) => (
            <Tag key={p} tone="neutral">{gershayim(p)}</Tag>
          ))}
          {/* who it applies to: shown only when it is not every case (D30) */}
          {!isGeneral(rule) && <Tag tone="neutral" wrap>{scopeTag(rule, data.ownDocs)}</Tag>}
          {isNotRule(id) && !isGeneral(rule) && <Tag tone="neutral">{scopeWords.notRule.tag}</Tag>}
          {(rule.strength === "open" || rule.strength === "secondary" || (rule.strength === "institution" && rule.scope === "general")) && <StrengthLabel strength={rule.strength} />}
        </div>
      </header>
      {open ? (
        <Callout tone="blocked">
          <span className="block">{ruleCopy.open.last}</span>
        </Callout>
      ) : rule.text_he ? (
        <p className="text-base leading-relaxed">{rule.text_he}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
      )}
      {!isGeneral(rule) && <p className="text-sm text-muted-foreground">{scopeLine(rule, data.ownDocs)}</p>}
      <RulePointers rule={rule} />
      <RuleFigures rule={rule} id={id} head={<GroupHead>{ruleCopy.figures}</GroupHead>} />
      {sources.length > 0 ? <SourcesByDocument sources={sources} rule={sourced} today={data.today} /> : <p className="text-sm text-muted-foreground">{ruleCopy.sourceMissing}</p>}
      <dl className="sheet-dl border-t border-border pt-3">
        {dims.length > 0 && (
          <Row label={ruleCopy.dimensions}>
            <span className="flex flex-wrap gap-1.5">
              {dims.map((d) => (
                <Tag key={d} tone="neutral">
                  {data.dimensions[d]}
                </Tag>
              ))}
            </span>
          </Row>
        )}
        {uses && (
          <Row label={ruleCardMore.usesLead}>
            {usesSome ? (
              <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {uses.pages.map((u) => (
                  <Link key={u.href} to={u.href} className="text-link hover:underline">
                    {u.label}
                  </Link>
                ))}
                {uses.engine && <span>{ruleCardMore.usesEngine}</span>}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">{ruleCardMore.usesNone}</span>
            )}
          </Row>
        )}
        <Row label={ruleCopy.checked}>
          <span className="text-sm flex flex-wrap gap-x-2">
            <When iso={rule.checked} />
            {rule.recheck_date ? (
              <span className="text-caution-foreground">
                · <When iso={rule.recheck_date} lead={`${ruleCopy.recheck} `} />
              </span>
            ) : rule.likely_to_change === "no" ? (
              <span className="text-muted-foreground">· {ruleCardMore.stable}</span>
            ) : null}
          </span>
        </Row>
      </dl>
      {after}
    </article>
  );
}

/**
 * The search's closest match, drawn larger: its title, then its own numbers as headline figures (each with its unit, its name under it
 * and how it is updated), or its first sentence when it has none, then its first source and when it was read. Only what the record
 * holds: no verdict, no answer written for the search.
 */
export function TopMatch({ id, data, label, lead, onOpen }: { id: string; data: ProvenanceData; label: string; lead: string; onOpen: () => void }) {
  const rule = ruleOf(data, id);
  if (!rule) return null;
  const figures = ownFigures(rule, Number(data.today.slice(0, 4))).slice(0, 2);
  const sources = pickSources(asSourced(rule));
  const first = sources[0];
  const parts = first ? sourceParts(first) : null;
  return (
    <Card edge="accent" pad="tight" className="flex flex-col gap-3">
      <span className="text-[13px] font-medium text-primary">{label}</span>
      <h3 className="text-lg font-semibold leading-snug -mt-1">
        <button type="button" onClick={onOpen} className="text-start hover:underline">
          <ShownRuleTitle rule={rule} />
        </button>
      </h3>
      {figures.length > 0 ? (
        <StatRow cols={2}>
          {figures.map(({ key, value }) => (
            <div key={key} className="flex flex-col gap-0.5 min-w-0">
              <dd className="order-1 flex items-baseline gap-1.5">
                <span className="figure">
                  <Num value={{ ...value, rule_ids: value.rule_ids ?? [id] }} size="figure" />
                </span>
                {unitSuffix(value.unit, "text-lg text-muted-foreground")}
              </dd>
              <dt className="order-2 text-sm text-muted-foreground">{figureLabel(rule, key, "text-sm")}</dt>
              <FigureNote v={value} labelYear={null} className="order-3 text-xs text-muted-foreground" />
            </div>
          ))}
        </StatRow>
      ) : (
        lead && <p className="text-base">{lead}</p>
      )}
      {first && parts && (
        <p className="text-[13px] text-muted-foreground">
          <SourceNames parts={parts} hebrewTitle={isHebrewTitle(sourceLabel2(first).title)} /> · {sourceCopy.checked} <Iso ltr>{fmt.date(first.checked)}</Iso>
        </p>
      )}
    </Card>
  );
}

/**
 * "נמצא במסמכים של …; בחברות אחרות זה יכול להיות אחרת." for a company's term, naming only the companies whose own documents it cites;
 * the unsettled line for a rule not shown to hold everywhere; "המקורות כאן אינם מסמכים של …" for a record about companies that cites
 * none of their documents. A not-rule that cites a company's document says it is
 * kept, not shown as a rule, so its line agrees with its foot ("לכל מה שלא נכלל ככלל").
 */
function scopeLine(rule: RuleRecord, ownDocs: OwnDocs | undefined): string {
  const own = joinNames(ownDocCompanies(rule, ownDocs).map((c) => c.name_he));
  const named = joinNames(scopeCompanies(rule).map((c) => c.name_he));
  if (own && isNotRule(rule.id)) return scopeWords.notRule.lineOwn.replace("{names}", own);
  if (rule.scope === "institution") return own ? scopeWords.line.institution.replace("{names}", own) : scopeWords.line.notTheirs.replace("{names}", named);
  return own ? scopeWords.line.unsettledSeen.replace("{names}", own) : scopeWords.line.unsettled;
}

/**
 * Where to read on (spec §4): a general rule to the rules page, filtered to the page's product when there is one; a company's term to
 * everything found at each company whose section lists it (one link per company), and a record no section lists (a not-rule) to its
 * group on /companies.
 */
function CardFoot({ rule, data }: { rule: RuleRecord; data: ProvenanceData }) {
  const close = useContext(CloseCtx);
  if (isGeneral(rule)) {
    return data.rulesOf ? <LinkButton to={`${data.rulesOf.href}#${rule.id}`} onClick={close}>{scopeWords.rulesOf.replace("{product}", data.rulesOf.name)}</LinkButton> : <LinkButton to={`/rules#${rule.id}`} onClick={close}>{ruleCopy.all}</LinkButton>;
  }
  const links = companyLinksOf(listedCompanies(rule, data.ownDocs), data.companies).map((c) => ({ name: c.name, href: c.hasPage ? `${c.href}#${rule.id}` : c.href }));
  if (links.length === 0) return <LinkButton to={`/documents#${noCompanyAnchor}`} onClick={close}>{scopeWords.allNoCompany}</LinkButton>;
  if (links.length === 1) return <LinkButton to={links[0]!.href} onClick={close}>{scopeWords.allAt.replace("{name}", links[0]!.name)}</LinkButton>;
  return (
    <span onClick={close}>
      <CompanyLinks lead={scopeWords.allAt.replace(" {name}", "")} items={links} />
    </span>
  );
}

/**
 * The rule's citation ("מראה מקום") on one line, copied by a press anywhere on it; the line shows what will be copied
 * ("העתקת ההפניה" was a bare text button at another height on every card).
 */
function CitationBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // no clipboard permission: nothing is written, nothing is claimed
    }
  };
  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={ruleCardMore.copyCitation}
      className="group flex items-center gap-2 w-full min-h-10 tap-area px-3 rounded-md border border-border bg-background text-xs text-start hover:border-input transition-colors duration-[var(--duration-fast)]"
    >
      <span className={cx("shrink-0 font-medium", copied ? "text-positive" : "text-foreground")}>
        {copied ? sourceCopy.citation.copied : ruleCardMore.citationLabel}
      </span>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{text}</span>
      {copied ? <IconCheck size={16} className="shrink-0 text-positive" /> : <IconCopy size={16} className="shrink-0 text-muted-foreground group-hover:text-foreground" />}
    </button>
  );
}

// ---------------------------------------------------------------- term card

export function TermCard({ id, data, headId, sub }: { id: string; data: ProvenanceData; headId?: string; /** One of several on a sheet (`TermsSheet`): a smaller heading under the sheet's own. */ sub?: boolean }) {
  const term = data.terms[id];
  if (!term) return <p id={headId}>{id}</p>;
  const Heading = sub ? "h3" : "h2";
  return (
    <div className="flex flex-col gap-3">
      <Heading id={headId} className={sub ? "text-base font-semibold" : "text-lg font-semibold"}>
        {gershayim(term.he)}
      </Heading>
      <p>{gershayim(term.explanation)}</p>
      {term.variants.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {copy.termAlso} {term.variants.map(gershayim).join(" · ")}
        </p>
      )}
      {term.source && (
        <dl className="sheet-dl">
          <Row label={copy.sourced.source}>
            <SourceLink url={term.source.url} title={term.source.title} />
          </Row>
          <Row label={copy.sourced.checked}>
            <When iso={term.source.checked} />
          </Row>
          <Row label="">
            <StrengthLabel strength={term.source.strength} />
          </Row>
        </dl>
      )}
      {/* a definition rests on general rules only (D30): a company's term the glossary row cites is on that company's page */}
      {generalOnly(term.ruleIds, data.rules).length > 0 && <RulesLine ids={generalOnly(term.ruleIds, data.rules)} />}
    </div>
  );
}

/** Several glossary terms that make up one thing (a column of three fees): its name, a line, then each term's card under a rule. */
function TermsSheet({ ids, name, lead, data, headId }: { ids: readonly string[]; name: string; lead?: string; data: ProvenanceData; headId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {name}
        </h2>
        {lead && <p className="text-muted-foreground">{lead}</p>}
      </div>
      {ids.map((id) => (
        <div key={id} className="border-t border-border pt-4">
          <TermCard id={id} data={data} sub />
        </div>
      ))}
    </div>
  );
}

export { Disclosure };
