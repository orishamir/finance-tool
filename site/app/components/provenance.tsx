// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. Rule and term chips open their cards
// in the same sheet, with a back arrow when they were reached from a number.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { companyTermRule, type CompanyTermRef, type RuleRecord } from "@finance-tool/schema";
import { buttons, computedInputs, flags as flagCopy, formulaNames, numbers, provenance as copy, rule as ruleCopy, ruleCardMore, scopeWords, sourceBlock as sourceCopy, strength as strengthCopy, updateRules } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { fmt, formatValue } from "../lib/format";
import { hasHebrew, hostOf, isHebrewTitle, mostlyHebrew, sourceLabel } from "../lib/source-label";
import { isExperience } from "../lib/rule-shelves";
import { citationText, mayHaveChanged, moreSourcesLabel, pickSources, sourceHref, sourceLabel2, shownTitle, type RuleSource, type SourcedRule } from "../lib/sources";
import { useInputs } from "../lib/inputs";
import { isParameter, isProvisional, isWeak, strengthOf, type SiteValue, type Strength } from "../lib/value";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconCalculator, IconCheck, IconClock, IconCopy, IconExternal, IconFile, IconLock, IconPencil, IconReset } from "./icons";
import { Sheet } from "./Sheet";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";
import { CompanyLinks, Tpl } from "./kit";
import { chipName, companyLinksOf, generalOnly, isGeneral, isNotRule, isOwnSourceOf, joinNames, listedCompanies, noCompanyAnchor, ownDocCompanies, scopeCompanies, shownCompanies, type CompanyLink, type OwnDocs } from "../lib/scope";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue; /** The figure was shown with two decimals (a table cell, or near a threshold): the sheet shows the same digits. */ exact?: boolean } | { kind: "rule"; id: string } | { kind: "term"; id: string } | { kind: "formula"; id: string } | { kind: "question"; id: string; /** The question was closed on this date (a closure on the not-covered page): the sheet says so. */ closedOn?: string };

interface ProvenanceApi {
  open: (item: Item, anchor: HTMLElement | null) => void;
}

const Ctx = createContext<ProvenanceApi>({ open: () => {} });
/** The run date of the page (`ProvenanceData.today`), for the future-date flag on a figure. Empty outside a provider: no flag. */
const TodayCtx = createContext("");
/** The page's today (the data's run date), the one `Num` tests `startsAfter` against. */
export const useToday = () => useContext(TodayCtx);

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
  formulas?: Record<string, { name: string; parameters: string[] }>;
  /** Per id a card on /parameters answers to: `P-01` to itself, an `A-01` that is an input of a card to that card. PageShell fills it for every page. */
  parameters?: Record<string, string>;
  /**
   * Per open question (`TX2 OQ6`), from data/open-questions.json: the root loader fills it for every page (PageShell), as `parameters`.
   * `status` and `closed_on` make a closed question's chip open the closure wherever it appears; the sheet shows the Hebrew lines.
   */
  openQuestions?: Record<string, { status?: "open" | "narrowed" | "closed"; closed_on?: string; title_he?: string; status_he?: string; blocks_he?: string }>;
  /** Per source host, the company's Hebrew name (`data/sources/publishers.json`); PageShell fills it for every page. */
  publishersHe?: Record<string, string>;
  /** Per company of `data/sources/institutions.json`, where its terms are listed (D30): its page, or its group on /companies. PageShell fills it for every page. */
  companies?: Record<string, CompanyLink>;
  /** Per record that is not general, the companies whose own document it cites (review, 2026-10-26): only they list it, and the card names only them. PageShell fills it for every page. */
  ownDocs?: OwnDocs;
  /**
   * The records the page's rule cards point at (`derived_from`, `examples`) that the page does not hold itself, so each chip on a card
   * opens its record (`pointedRecords` in data.server.ts). Only chips and cards read it; the page's own logic reads `rules`.
   */
  pointed?: Record<string, RuleRecord>;
  /** On a company's page, its registry id: a chip of a term that names several companies shows this one's name. */
  company?: string;
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
  return (
    <Ctx.Provider value={api}>
      <DataCtx.Provider value={data}>
      <TodayCtx.Provider value={data.today}>
      {children}
      <PushCtx.Provider value={push}>
       <CloseCtx.Provider value={close}>
        <Sheet open={open} onClose={close} anchor={anchor} pc="popover" height={70} className="lg:max-h-[60vh] lg:backdrop:bg-transparent" labelledBy={headId} describedBy={descId} onBack={back}>
          {top && <SheetContent item={top} data={data} headId={headId} descId={descId} />}
        </Sheet>
       </CloseCtx.Provider>
      </PushCtx.Provider>
      </TodayCtx.Provider>
      </DataCtx.Provider>
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

const InsideSheetCtx = createContext(false);
/** Closes the sheet: a link inside it that leaves the page calls it. */
const CloseCtx = createContext<() => void>(() => {});

// ---------------------------------------------------------------- Num

export interface NumProps {
  value: SiteValue;
  size?: "inline" | "cell" | "figure";
  /** Keeps two decimals on a shekel amount (it sits within 0.50 ₪ of a threshold, so rounding could cross it). */
  exact?: boolean;
  /** Replaces the formatted text (for example "שנתיים" for a horizon of two years). */
  display?: string;
  /** Moves the digits to a new value over --duration-chart when it changes (design-spec 1.6). */
  animate?: boolean;
  className?: string;
  /** Text that must stay on the line with the number ("ב־", "נכון ל־"): both sit in one non-breaking span. */
  prefix?: ReactNode;
  /** `false` leaves out the inline caution icon of a weak source (secondary, institution) and of a date ahead; the caller then shows the strength mark once for the group of figures (the past-record line). The aria-label and the sheet still say it. */
  mark?: boolean;
}

const stateWord = { sourced: numbers.legend.sourced, computed: numbers.legend.computed, entered: numbers.legend.entered };

/**
 * A sourced figure that takes effect after the run date (audit A25): a rate "from tomorrow" rolled forward for years is
 * not in force yet. Computed figures never carry the flag themselves; their sheet lists the inputs.
 */
export function startsAfter(value: SiteValue, today: string): string | null {
  if (!today || value.state !== "sourced" || typeof value.value !== "number" || !value.effective_from) return null;
  return value.effective_from > today ? value.effective_from : null;
}

/** A figure is isolated left to right ("1,234.50 ₪"), unless its text carries Hebrew words ("36 חודשים", "חודשיים"), which a forced LTR isolate would print backwards (2026-10-25). */
const textDir = (text: string): "ltr" | "rtl" => (/[\u0590-\u05FF]/.test(text) ? "rtl" : "ltr");

/** The provenance number: a button holding the formatted value in an isolating span, then its flags. Marks sit before the digits, never between a number and the unit word that follows it. */
export function Num({ value, size = "inline", display, animate, className, prefix, exact, mark: showMark = true }: NumProps) {
  const open = useOpen();
  const today = useContext(TodayCtx);
  const param = isParameter(value);
  const shown = useAnimatedValue(typeof value.value === "number" ? value.value : null, !!animate);
  // display rounding (A13): a table cell keeps two decimals, everything else rounds computed and entered amounts
  const keepDecimals = size === "cell" || !!exact;
  const roundState = keepDecimals ? undefined : value.state;
  const text = display ?? (shown !== null && typeof value.value === "number" ? formatValue(shown, value.unit, roundState, param) : formatValue(value.value, value.unit, roundState, param));
  const strength = strengthOf(value);
  const weak = isWeak(value) && (strength === "institution" || strength === "secondary") ? numbers.weak[strength] : null;
  const fromDate = startsAfter(value, today);
  const future = fromDate ? `${numbers.startsOn}${fmt.date(fromDate)}` : null;
  const label = [text, stateWord[value.state], param ? numbers.parameter : null, weak, future, value.stale ? `${numbers.staleSince} ${fmt.date(staleDate(value))}` : null, numbers.details].filter(Boolean).join(", ");
  // one caution icon, before the digits, for a weak source or a date still ahead (the sheet says which); a computed figure
  // carries the weak-source icon only at figure size, since its sheet names the weak input. The words stay out of the line: a
  // word between a number and its unit ("4 לפי החברה ימי עסקים") broke the sentence (audit A23). At figure size a date ahead
  // is also said in words, before the digits.
  const markWeak = showMark && weak && (value.state !== "computed" || size === "figure");
  const mark = "inline-block align-[-2px] select-none";
  const button = (
    <button
      type="button"
      className={cx("num", `num-${value.state}`, size === "figure" && "num-figure", size === "cell" && "num-cell", value.value === null && "num-unknown", className)}
      aria-label={label}
      onClick={(e) => open({ kind: "value", value, ...(keepDecimals ? { exact: true } : {}) }, e.currentTarget)}
    >
      {value.stale && <IconClock size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {((showMark && fromDate) || markWeak) && <IconAlert size={14} className={cx("text-caution me-1", mark)} aria-hidden="true" />}
      {fromDate && size === "figure" && <span className="text-xs text-caution-foreground font-normal me-1 no-underline select-none">{numbers.startsOn}<bdi dir="ltr">{fmt.date(fromDate)}</bdi></span>}
      <bdi dir={textDir(text)} className="whitespace-nowrap">{text}</bdi>
    </button>
  );
  return prefix ? <span className="whitespace-nowrap">{prefix}{button}</span> : button;
}

/** A lead text that ends in a maqaf word ("נכון ל־", "ב־") or a word and a space ("ממוצע ") followed by a number: only its last word is
 * bound to the number (one non-breaking span, the space kept), so the rest of the sentence still wraps. */
export function LeadTail({ lead, children }: { lead: string; children: ReactNode }) {
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

export function NumAfter({ lead, ...rest }: NumProps & { lead: string }) {
  const m = /^([\s\S]*?)(\S+)(\s*)$/.exec(lead);
  if (!m) return <Num {...rest} />;
  return (
    <>
      {m[1]}
      {/* the space after the last word stays: a lead that ends "ממוצע " read "ממוצע2025" (2026-10-26) */}
      <Num {...rest} prefix={`${m[2]}${m[3]}`} />
    </>
  );
}

function staleDate(v: SiteValue): string {
  const s = v.stale!.since;
  return /^\d{4}-\d{2}$/.test(s) ? `${s}-01` : s;
}

/** Digits count to a new value over --duration-chart; zero when the device asks for reduced motion. */
export function useAnimatedValue(target: number | null, enabled: boolean): number | null {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (!enabled || target === null || from.current === null || from.current === target) {
      setShown(target);
      from.current = target;
      return;
    }
    const ms = durationChart();
    if (ms === 0) {
      setShown(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(a + (target - a) * e);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return enabled ? shown : target;
}

export function durationChart(): number {
  if (typeof window === "undefined") return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--duration-chart")) || 0;
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

export type IdKind = "rule" | "formula" | "parameter" | "assumption" | "question";
const QUESTION_ID = /^([A-Z0-9]+)[ -]OQ(\d+)$/;
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
 * One chip for any id the site shows (2026-10-26): a rule opens its card, a formula its sheet, an open question its sheet,
 * a parameter goes to its card on the parameters page. The ID is LTR with a slashed zero and a 44px tap area.
 * - `closedOn`: a question that was closed on that date; the chip looks the same, its sheet says it was closed. Since 2026-10-26 the
 *   status and date also come from the page's `openQuestions` (data/open-questions.json), so a closed question shows as closed
 *   without the prop.
 * - `asLabel`: the id as a label that does nothing (a parameter's own card, which a link would only point back at).
 * An empty id renders nothing; an id that is no kind, or an `A-nn` no card has, renders as plain text.
 */
export function IdRef({ id, className, closedOn, asLabel }: { id: string; className?: string; closedOn?: string; asLabel?: boolean }) {
  const open = useOpen();
  const close = useContext(CloseCtx);
  const data = useContext(DataCtx);
  if (!id) return null;
  const kind = idKind(id);
  const plain = <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{id}</bdi>;
  if (!kind) return plain;
  const shown = kind === "question" ? id.replace("-OQ", " OQ") : id;
  if (asLabel) return <span className={cx("rule-chip pointer-events-none", className)}><bdi dir="ltr" className="whitespace-nowrap">{shown}</bdi></span>;
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
  const aria = kind === "rule" ? `${ruleCopy.title} ${id}` : kind === "formula" && id.startsWith("A-") ? `${copy.idRef.howComputed} ${id}` : `${copy.idRef[kind as "formula" | "question"]} ${shown}`;
  const known = kind === "question" ? questionOf(data, shown) : undefined;
  const closed = closedOn ?? (known?.status === "closed" ? known.closed_on : undefined);
  const item: Item = kind === "question" ? { kind: "question", id: shown, ...(closed ? { closedOn: closed } : {}) } : { kind: kind as "rule" | "formula", id: shown };
  return (
    <button type="button" className={cx("rule-chip", className)} onClick={(e) => open(item, e.currentTarget)} aria-label={aria}>
      <bdi dir="ltr" className="whitespace-nowrap">{shown}</bdi>
    </button>
  );
}

/**
 * Text that names open questions inside a sentence (a copy string that ends "... שאלה פתוחה SW OQ4"): each code in it becomes an `IdRef`.
 * `assumptions` also turns the method's assumption ids (`A-01`) into chips: printed as plain text, "(A-03)" broke at its hyphen on a phone
 * (the parameters page, 2026-10-26). A string with no code comes back unchanged.
 */
export function IdText({ text, assumptions }: { text: string; assumptions?: boolean }) {
  // the chip is its own frame: "(A-03)" loses its brackets
  const parts = assumptions ? text.replace(/\((A-\d+)\)/g, "$1").split(/\b([A-Z0-9]+[ -]OQ\d+|A-\d+)\b/) : text.split(/\b([A-Z0-9]+[ -]OQ\d+)\b/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <IdRef key={i} id={part} /> : part))}
    </>
  );
}

/**
 * The rule chip: `IdRef` for a rule id. A company's term (scope `institution`, or `unsettled` seen at named companies) shows the
 * company's name instead of the code (spec 2026-10-25-rules-scope §4): on that company's page its own name, elsewhere the first with
 * "ועוד" and the count of the others. The code stays in the card it opens and in the chip's spoken name.
 */
export function RuleRef({ id, className, withId }: { id: string; className?: string; /** Adds the code after the name: a line where two chips would read the same (RulesLine sets it). */ withId?: boolean }) {
  const open = useOpen();
  const data = useContext(DataCtx);
  const rule = ruleOf(data, id);
  const name = rule && !isGeneral(rule) ? chipName(rule, data?.ownDocs, data?.company, chipMore) : null;
  if (!name) return <IdRef id={id} className={className} />;
  return (
    <button type="button" className={cx("rule-chip", className)} onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} aria-label={`${ruleCopy.title} ${id}, ${scopeTag(rule!, data?.ownDocs)}`}>
      <bdi className="whitespace-nowrap">{name}</bdi>
      {withId && (
        <>
          {/* the chip lays its children out as flex items, so the separator carries its own space */}
          <span aria-hidden="true" className="mx-1 text-muted-foreground">·</span>
          <bdi dir="ltr" className="slashed-zero whitespace-nowrap">{id}</bdi>
        </>
      )}
    </button>
  );
}

/** The chip words a line would show for each id (a company's name, or null for a code), so a name two chips share can carry its code. */
function useChipNames(ids: readonly string[]): (string | null)[] {
  const data = useContext(DataCtx);
  return ids.map((id) => {
    const rule = ruleOf(data, id);
    return rule && !isGeneral(rule) ? chipName(rule, data?.ownDocs, data?.company, chipMore) : null;
  });
}

const chipMore = (n: number) => (n === 1 ? scopeWords.chipMore.one : n === 2 ? scopeWords.chipMore.two : scopeWords.chipMore.many.replace("{n}", String(n)));

/**
 * The card's scope label: "חל על כולם", "של הראל ואלטשולר שחם" (the companies whose own documents say it), "לא הוכח שחל על כולם";
 * "על סלייס וגלובלנט" for a record about companies that rests on none of their documents (a press report, a forum post).
 */
function scopeTag(rule: RuleRecord, ownDocs: OwnDocs | undefined, short?: { company: string | undefined }): string {
  if (rule.scope === "general") return scopeWords.tag.general;
  if (rule.scope === "unsettled") return scopeWords.tag.unsettled;
  // the same companies the chip counts (`shownCompanies`): those whose own documents say it, else everyone it is about. `short` (the card's
  // tag) names them as the chip does, the page's company or the first and "ועוד N": six fund managers in one tag ran 400 px past a phone's
  // edge (2026-10-26); the card's scope line under the text names them all.
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
export function VariesByCompany({ ids, lead = scopeWords.varies, size, className }: { ids: readonly CompanyTermRef[]; lead?: string; size?: "sm" | "xs"; className?: string }) {
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
  return <CompanyLinks lead={lead} items={items} size={size} className={className} />;
}

/** "כללים:" then the chips. Always the last line of its block, never inside a sentence (design review C1). */
export function RulesLine({ ids, lead, className }: { ids: readonly string[]; lead?: ReactNode; className?: string }) {
  const names = useChipNames(ids);
  if (ids.length === 0 && !lead) return null;
  // a company's name shown on two chips of the line (four S&P rulebook records on the index page) keeps each chip's code beside it
  const repeated = new Set(names.filter((n, i) => n !== null && names.indexOf(n) !== i));
  return (
    <p className={cx("rules-line text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {lead}
      {ids.length > 0 && <span>כללים:</span>}
      {ids.map((id, i) => (
        <RuleRef key={id} id={id} withId={names[i] !== null && repeated.has(names[i]!)} />
      ))}
    </p>
  );
}

/**
 * A glossary term in running text: dashed underline, opens its card. The content decides which use is the first.
 * `prefix` is the one-letter Hebrew prefix of the word ("ה", "ו", "ב", "ל", "מ", "ש", "כ"; "וה" and the like too): it is
 * rendered inside the same non-breaking span, so a line never breaks between the letter and the term (audit A48).
 */
export function Term({ id, children, prefix }: { id: string; children?: ReactNode; prefix?: string }) {
  const open = useOpen();
  const button = (
    <button type="button" className="term" onClick={(e) => open({ kind: "term", id }, e.currentTarget)}>
      {children ?? id}
    </button>
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
 * The key to the number styles (copy 2). Samples are marks, not figures. The fourth item (audit A23) is the mark a figure
 * carries when it rests on a company's document used out of its own context (D31); a page passes `institution` only when it has such a figure. `term`
 * adds the glossary-term sample (dashed teal underline, `.term`) for pages whose text has `Term`s (the guide, exposure pages; wp6, A78).
 */
export function NumberLegend({ className, institution = false, term = false }: { className?: string; institution?: boolean; term?: boolean }) {
  return (
    <p className={cx("flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground", className)} data-sample>
      <span>
        <span className="num num-sourced num-sample" aria-hidden="true">123</span> {numbers.legend.sourced}
      </span>
      <span>
        <span className="num num-computed num-sample" aria-hidden="true">123</span> {numbers.legend.computed}
      </span>
      <span>
        <span className="num num-entered num-sample" aria-hidden="true">123</span> {numbers.legend.entered}
      </span>
      {institution && (
        <span>
          <IconAlert size={14} className="text-caution inline-block align-[-2px] me-1" aria-hidden="true" />
          {numbers.legend.institution}
        </span>
      )}
      {term && (
        <span>
          <span className="term" aria-hidden="true">{numbers.legend.term}</span> {numbers.legend.termMeaning}
        </span>
      )}
      <span className="lg:hidden">{numbers.legendHintPhone}</span>
      <span className="hidden lg:inline">{numbers.legendHintPc}</span>
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
 * of each source on a rule card (a source on the named company's own sites; review, 2026-10-26: BRK-43 cites IB Ireland's page, which
 * is not Interactive Brokers' own, so it keeps "לפי החברה").
 */
type OwnSource = boolean | ((source: RuleSource) => boolean);

/** One source: the link line, the quoted words, then when it was read (synthesis 3.3). */
function OneSource({ source, rule, today, english, own }: { source: RuleSource; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; english?: boolean; own?: OwnSource }) {
  // a data file names its company in English: the publishers table gives the Hebrew name by the source's host (founder, 2026-10-26)
  const publishersHe = useContext(DataCtx)?.publishersHe;
  const host = hostOf(source.url);
  const he = source.publisher_he ?? (host ? publishersHe?.[host] : undefined);
  const n = sourceLabel2(he ? { ...source, publisher_he: he } : source);
  const title = shownTitle(n.title, source.url, source.kind);
  const pubHebrew = hasHebrew(n.publisher);
  // D31: a company's own document on its own term is shown with a neutral source line, no "לפי החברה"; `own` lifts only that label,
  // never "מקור משני" (a press article, a forum post) or "עותק" (a copy of an official text): review, 2026-10-26
  const isOwn = typeof own === "function" ? own(source) : !!own;
  const weak = source.strength !== "primary" && !(isOwn && source.strength === "institution") ? sourceCopy.weak[source.strength] : null;
  const changed = mayHaveChanged(rule ?? { likely_to_change: "no" }, source, today);
  const titleNode = <Iso ltr={title.host || !isHebrewTitle(n.title)}>{title.text}</Iso>;
  return (
    <div className="flex flex-col gap-1">
      <a href={sourceHref(source)} target="_blank" rel="noopener noreferrer" className="text-link inline-flex max-w-full items-start gap-1 hover:underline">
        <span className="min-w-0 [overflow-wrap:anywhere]">
          {n.mirror ? (
            <>
              {titleNode} · {n.mirrorKind}, {n.mirror}
            </>
          ) : title.text.startsWith(n.publisher) ? (
            // the title already opens with the company ("בנק לאומי, 'שיעורי הריבית…'"): its name is not repeated before it
            titleNode
          ) : (
            <>
              <Iso ltr={!pubHebrew}>{n.publisher}</Iso> · {titleNode}
            </>
          )}
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
  // no "לקריאה נוחה" copy after an official source any more: pickSources leaves copies out when there is one (2026-10-25)
  const more = rest.map((s) => <OneSource key={s.url + (s.locator ?? "")} source={s} rule={rule} today={today} english={english} own={own} />);
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

/** The rule's first source as one line, under a rule chip in a computed figure's sheet. */
function FirstSourceLine({ rule }: { rule: RuleRecord }) {
  const s = pickSources(asSourced(rule))[0];
  if (!s) return null;
  const n = sourceLabel2(s);
  const title = shownTitle(n.title, s.url, s.kind);
  return (
    <a href={sourceHref(s)} target="_blank" rel="noopener noreferrer" className="text-link text-xs block max-w-full truncate hover:underline">
      <Iso ltr={!hasHebrew(n.publisher)}>{n.publisher}</Iso> · <Iso ltr={title.host}>{title.text}</Iso>
      {n.locator && (
        <>
          , <Iso>{n.locator}</Iso>
        </>
      )}
    </a>
  );
}

// ---------------------------------------------------------------- sheet content

function SheetContent({ item, data, headId, descId }: { item: Item; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <InsideSheetCtx.Provider value={true}>
      {item.kind === "value" && <ValueSheet value={item.value} exact={!!item.exact} data={data} headId={headId} descId={descId} />}
      {item.kind === "rule" && <RuleCard id={item.id} data={data} headId={headId} />}
      {item.kind === "term" && <TermCard id={item.id} data={data} headId={headId} />}
      {item.kind === "formula" && <FormulaSheet id={item.id} data={data} headId={headId} />}
      {item.kind === "question" && <QuestionSheet id={item.id} closedOn={item.closedOn} data={data} headId={headId} />}
    </InsideSheetCtx.Provider>
  );
}

/** A formula's sheet: its Hebrew name, the site parameters it uses (only when the page passed `formulas`: otherwise the list is unknown, not empty) (each a chip to its card), and the full definition in method.md. */
function FormulaSheet({ id, data, headId }: { id: string; data: ProvenanceData; headId: string }) {
  const known = data.formulas?.[id];
  const name = formulaNames[id] || known?.name || formulaNames._other;
  const parameters = known?.parameters ?? [];
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {name} <bdi dir="ltr" className="slashed-zero text-muted-foreground text-base">{id}</bdi>
      </h2>
      {data.formulas && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{copy.formulaSheet.usesLabel}</span>
          {parameters.length > 0 ? (
            <span className="flex flex-wrap gap-2">
              {parameters.map((p) => (
                <IdRef key={p} id={p} />
              ))}
            </span>
          ) : (
            <span className="text-sm">{copy.formulaSheet.noParameters}</span>
          )}
        </div>
      )}
      <a href={METHOD_URL} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-start gap-1 text-sm hover:underline" dir="ltr">
        <span className="min-w-0 [overflow-wrap:anywhere]">{copy.formulaSheet.full}</span>
        <IconExternal size={16} className="shrink-0 mt-0.5" />
      </a>
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
 * the site. A closed one (from the data, or `closedOn` from the not-covered page) says when it closed and blocks nothing.
 */
function QuestionSheet({ id, closedOn, data, headId }: { id: string; closedOn?: string; data: ProvenanceData; headId: string }) {
  const q = questionOf(data, id);
  const status = closedOn ? undefined : (q?.status_he ?? (q?.status ? copy.questionSheet.statuses[q.status] : undefined));
  const blocks = closedOn ? undefined : q?.blocks_he;
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {q?.title_he ?? copy.idRef.question} <bdi dir="ltr" className="slashed-zero whitespace-nowrap text-muted-foreground text-base">{id}</bdi>
      </h2>
      {(status || blocks) && (
        <dl className="sheet-dl">
          {status && <Row label={copy.questionSheet.status}>{status}</Row>}
          {blocks && <Row label={copy.questionSheet.blocks}>{blocks}</Row>}
        </dl>
      )}
      {closedOn ? (
        <p className="text-sm">
          <Tpl t={copy.questionSheet.closed} vars={{ date: <bdi dir="ltr">{fmt.date(closedOn)}</bdi> }} />
        </p>
      ) : (
        <>
          <p className="text-sm">{copy.questionSheet.what}</p>
          <p className="text-sm text-muted-foreground">{copy.questionSheet.onSite}</p>
        </>
      )}
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

/** A source: its Hebrew title, or the link's host with the English title in a collapsed line (audit A21). */
function SourceLink({ url, title }: { url: string; title: string }) {
  const external = /^https?:/.test(url);
  const label = sourceLabel({ url, title }, copy.sourced.localFile);
  const text = label.host ? <bdi dir="ltr">{label.text}</bdi> : label.text;
  const link = !external ? (
    <span className="[overflow-wrap:anywhere]">{text}</span>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex max-w-full items-start gap-1 hover:underline">
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

/** A fee or rate takes effect after the run date, or is a calendar-year average: the row the sheet shows instead of "in force until" (audit A25). */
function calendarYearOf(v: SiteValue): string | null {
  const f = v.effective_from;
  const t = v.effective_to;
  if (!f || !t) return null;
  return f.slice(0, 4) === t.slice(0, 4) && f.slice(5) === "01-01" && t.slice(5) === "12-31" ? f.slice(0, 4) : null;
}

/** Units whose number has no sign of its own: the rule card prints the word after it (audit A76). */
const suffixUnits = new Set(["months", "years", "days", "business_days", "usd", "eur"]);

function unitWordOf(unit: string): string | null {
  return (copy.unit as Record<string, string>)[unit] ?? null;
}

/** The sourced figure's one source block: the figure's own source and date, with the Hebrew names and the locator of the same link in its rule record when there is one. */
function FigureSource({ value, data }: { value: SiteValue; data: ProvenanceData }) {
  if (value.state !== "sourced") return null;
  const ids = value.rule_ids ?? [];
  const strengthOk = (st: string): st is RuleSource["strength"] => st === "primary" || st === "primary-mirror" || st === "institution" || st === "secondary";
  let known: RuleSource | undefined;
  let owner: SourcedRule | undefined;
  for (const id of ids) {
    const r = data.rules[id];
    if (!r) continue;
    owner ??= asSourced(r);
    known ??= pickSources(asSourced(r)).find((x) => x.url === value.source.url);
  }
  const source: RuleSource = {
    ...(known ?? { title: value.source.title, publisher: value.source.publisher }),
    url: value.source.url,
    strength: strengthOk(value.source.strength) ? value.source.strength : (known?.strength ?? "secondary"),
    checked: value.checked,
  };
  // a figure's source can be a file of the site, not a web address: the old plain label stays for it
  if (!/^https?:/.test(source.url)) return <SourceLink url={source.url} title={source.title} />;
  return <SourceBlock source={source} rule={owner} today={data.today} english own={!!value.own} />;
}

/**
 * Why a site parameter has this value. The clicked number's own line comes first; the parameter file's general line, which
 * covers every number of the file, waits behind "more" (2026-10-25: one line served all of P-05's numbers, and the founder
 * asked what "2%" was and got the lot). A number with no line of its own shows the general line directly.
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

/** The sheet behind a figure (exported for the render tests). */
export function ValueSheet({ value, exact, data, headId, descId }: { value: SiteValue; exact: boolean; data: ProvenanceData; headId: string; descId: string }) {
  const strength = strengthOf(value);
  const param = isParameter(value);
  const provisional = isProvisional(value);
  const today = useContext(TodayCtx);
  const text = formatValue(value.value, value.unit, exact ? undefined : value.state, param);
  const unitWord = typeof value.value === "number" ? unitWordOf(value.unit) : null;
  const { setEntered } = useInputs();
  const fromDate = startsAfter(value, today);
  const year = calendarYearOf(value);
  const weakNames = value.state === "computed" ? weakInputNames(value) : [];
  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span id={headId} className={cx("num num-static text-2xl font-semibold", `num-${value.state}`, value.value === null && "text-muted-foreground")}>
            <bdi dir={textDir(text)} className="whitespace-nowrap">{text}</bdi>
          </span>
          {unitWord && <span className="text-sm text-muted-foreground">{unitWord}</span>}
          <StateTag state={param ? "parameter" : value.state} />
          {param && provisional && <Tag tone="caution">{numbers.provisionalTag}</Tag>}
          {value.stale && <IconClock size={16} className="text-caution" />}
        </div>
        {value.about && (
          <p id={descId} className="text-sm text-muted-foreground">
            {value.about}
          </p>
        )}
      </header>

      {fromDate && (
        <p className="text-sm text-caution-foreground flex items-start gap-2">
          <IconAlert size={16} className="text-caution shrink-0 mt-1" />
          <span>
            {numbers.startsOn}
            <bdi dir="ltr">{fmt.date(fromDate)}</bdi>. {copy.sourced.notYetInForce}
          </span>
        </p>
      )}

      {/* the working notes are English; only a note written in Hebrew is shown (audit A21) */}
      {value.value === null && <p className="text-sm">{mostlyHebrew(value.notes) ? value.notes : copy.sourced.noValue}</p>}

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
          <Row label={copy.parameter.approved}>{!provisional && value.parameter?.signedOffOn ? <bdi dir="ltr">{fmt.date(value.parameter.signedOffOn)}</bdi> : <span className="text-sm">{copy.parameter.notApproved}</span>}</Row>
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
                  <bdi dir="ltr">{fmt.date(value.effective_from)}</bdi>
                </Row>
              )}
              {value.effective_to && (
                <Row label={copy.sourced.to}>
                  <bdi dir="ltr">{fmt.date(value.effective_to)}</bdi>
                </Row>
              )}
            </>
          )}
          {value.rule_ids && value.rule_ids.length > 0 && (
            <Row label={copy.sourced.rule}>
              <span className="flex flex-wrap gap-2">
                {value.rule_ids.map((id) => (
                  <RuleRef key={id} id={id} />
                ))}
              </span>
            </Row>
          )}
          {mostlyHebrew(value.notes) && <Row label=""><span className="text-sm text-muted-foreground">{value.notes}</span></Row>}
        </dl>
        </>
      )}

      {value.state === "computed" && value.computed_from && (
        <>
          <dl className="sheet-dl">
            <Row label={value.computed_from.formula.startsWith("A-") ? copy.idRef.howComputed : copy.computed.formula}>
              <span className="flex flex-wrap items-center gap-2">
                <span>{formulaNames[value.computed_from.formula] ?? formulaNames._other}</span>
                <IdRef id={value.computed_from.formula} />
              </span>
            </Row>
          </dl>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">{copy.computed.inputs}</span>
            <dl className="readout">
              {Object.entries(value.computed_from.inputs as Record<string, SiteValue>).map(([label, input]) => (
                <div key={label} className="readout-row">
                  <dt>{inputName(label)}</dt>
                  <dd>
                    <Num value={input} display={inputDisplay(label, input)} />
                    {isParameter(input) && <Tag tone="parameter">{numbers.parameter}</Tag>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {value.rulesUsed && value.rulesUsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">{copy.computed.rules}</span>
              <div className="flex flex-col gap-2">
                {value.rulesUsed.map((r) => (
                  <div key={r.id} className="flex flex-col gap-0.5 min-w-0">
                    <span className="inline-flex items-center gap-1.5">
                      <RuleRef id={r.id} />
                      <StrengthLabel strength={r.strength} />
                    </span>
                    {ruleOf(data, r.id) && <FirstSourceLine rule={ruleOf(data, r.id)!} />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {value.flags?.map((code) => (
            <Callout key={code} tone="caution">
              {flagCopy[code] ?? copy.flagOther} <bdi dir="ltr" className="text-xs">{code}</bdi>
            </Callout>
          ))}
          {mostlyHebrew(value.notes) && <p className="text-sm text-muted-foreground">{value.notes}</p>}
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
                  <Tag tone="parameter">{numbers.parameter}</Tag>
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

      {(isWeak(value) || strength === "primary-mirror" || strength === "open") && value.state !== "entered" && (
        <Callout tone={strength === "open" ? "blocked" : strength === "primary-mirror" ? "info" : "caution"} title={strengthCopy[strength].label}>
          {strengthCopy[strength].line}
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
            {copy.stale.before} <bdi dir="ltr">{fmt.date(staleDate(value))}</bdi>. {copy.stale.middle} {copy.stale.cadence[value.stale.cadence]}.
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

function ShownRuleTitle({ rule }: { rule: RuleRecord }) {
  const t = ruleTitle(rule);
  return t.english ? <bdi dir="ltr">{t.text}</bdi> : <>{t.text}</>;
}

export function RuleCard({ id, data, headId, inline }: { id: string; data: ProvenanceData; headId?: string; inline?: boolean }) {
  const rule = ruleOf(data, id);
  if (!rule) {
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
  const open = rule.strength === "open";
  const figures = Object.entries(rule.figures ?? {});
  const sourced = asSourced(rule);
  const sources = pickSources(sourced);
  const uses = data.ruleUses?.[id];
  const derived = sourced.derived_from ?? [];
  const examples = rule.examples ?? [];
  // the figure's Hebrew name when the record has one; else its key as written
  const figureLabel = (name: string) => (rule.figure_names_he?.[name] ? <span className="text-xs">{rule.figure_names_he[name]}</span> : <bdi dir="ltr" className="text-xs">{name}</bdi>);
  const unitSuffix = (unit: string) => (suffixUnits.has(unit) ? <span className="text-sm text-muted-foreground"> {unitWordOf(unit)}</span> : null);
  /** "לשנת המס 2026 · קבוע בחוק": the tax year the figure is for (when its label does not say) and how it is updated. */
  const figureNote = (v: { tax_year?: number | null; update_rule: string }, labelYear: string | null) => {
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
    return (
      <span className="block text-xs text-muted-foreground font-normal">
        {bits.flatMap((b, i) => (i ? [" · ", b] : [b]))}
      </span>
    );
  };
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
          {/* a record the rule base keeps that is not a rule says so: its foot leads to "לא נכלל ככלל" on /companies (review, 2026-10-26) */}
          {isNotRule(id) && !isGeneral(rule) && !isExperience(id) && <Tag tone="neutral">{scopeWords.notRule.tag}</Tag>}
          {isExperience(id) ? (
            <Tag tone="neutral">{ruleCardMore.experienceTag}</Tag>
          ) : (
            (rule.strength === "open" || rule.strength === "secondary" || (rule.strength === "institution" && rule.scope === "general")) && <StrengthLabel strength={rule.strength} />
          )}
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
      {derived.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{ruleCardMore.derivedFrom}</span>
            {derived.map((d) => (
              <RuleRef key={d} id={d} />
            ))}
          </p>
          <p className="text-xs text-muted-foreground">{ruleCardMore.derivedLine}</p>
        </div>
      )}
      {/* a general rule's pointers to companies' terms: named examples (spec §1), never "נגזר מ־" (review, 2026-10-26) */}
      {examples.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ruleCardMore.examples}</span>
          {examples.map((d) => (
            <RuleRef key={d} id={d} />
          ))}
        </p>
      )}
      {sources.length > 0 ? (
        // a company's term read from that company's own document is its own context (D31): the source line carries no "לפי החברה"
        <SourceBlock source={sources} rule={sourced} today={data.today} inline={inline} own={rule.scope === "institution" ? (s) => isOwnSourceOf(rule, s, data.ownDocs, data.companies) : false} />
      ) : (
        // audit A26: rule records without a source link are shown as such, not hidden
        <p className="text-sm text-muted-foreground">{ruleCopy.sourceMissing}</p>
      )}
      {figures.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{ruleCopy.figures}</span>
          <dl className="readout">
            {figures.flatMap(([name, f]) => {
              if (Array.isArray(f))
                return f.map((b, i) => (
                  <div key={`${name}-${i}`} className="readout-row">
                    <dt>
                      {figureLabel(name)} {b.up_to.value === null ? "" : "≤"} {b.up_to.value !== null && <Num value={{ ...b.up_to, rule_ids: b.up_to.rule_ids ?? [id] }} />}
                      {i === 0 && figureNote(b.rate, null)}
                    </dt>
                    <dd>
                      <Num value={{ ...b.rate, rule_ids: b.rate.rule_ids ?? [id] }} />
                      {unitSuffix(b.rate.unit)}
                    </dd>
                  </div>
                ));
              const byYear = "by_tax_year" in f ? Object.entries(f.by_tax_year) : [[null, f] as const];
              return byYear.map(([year, v]) => (
                <div key={`${name}-${year ?? ""}`} className="readout-row">
                  <dt>
                    {figureLabel(name)}
                    {year && (
                      <>
                        {" "}
                        <bdi dir="ltr">{year}</bdi>
                      </>
                    )}
                    {figureNote(v, year)}
                  </dt>
                  <dd>
                    <Num value={{ ...v, rule_ids: v.rule_ids ?? [id] }} />
                    {unitSuffix(v.unit)}
                  </dd>
                </div>
              ));
            })}
          </dl>
        </div>
      )}
      <dl className="sheet-dl">
        <Row label={ruleCopy.checked}>
          <bdi dir="ltr">{fmt.date(rule.checked)}</bdi>
        </Row>
        {rule.recheck_date && (
          <Row label={ruleCopy.recheck}>
            <bdi dir="ltr">{fmt.date(rule.recheck_date)}</bdi>
          </Row>
        )}
        {/* only the dimensions the page can name: a page that passes none (the playbook) shows no empty row */}
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

/**
 * "נמצא במסמכים של …; בחברות אחרות זה יכול להיות אחרת." for a company's term, naming only the companies whose own documents it cites;
 * the unsettled line for a rule not shown to hold everywhere; "המקורות כאן אינם מסמכים של …" for a record about companies that cites
 * none of their documents (a press report, a forum post: review, 2026-10-26). A not-rule that cites a company's document says it is
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
  if (links.length === 0) return <LinkButton to={`/companies#${noCompanyAnchor}`} onClick={close}>{scopeWords.allNoCompany}</LinkButton>;
  if (links.length === 1) return <LinkButton to={links[0]!.href} onClick={close}>{scopeWords.allAt.replace("{name}", links[0]!.name)}</LinkButton>;
  return (
    <span onClick={close}>
      <CompanyLinks lead={scopeWords.allAt.replace(" {name}", "")} items={links} />
    </span>
  );
}

/**
 * The rule's citation ("מראה מקום") on one line, copied by a press anywhere on it; the line shows what will be copied
 * (2026-10-25, the founder: "העתקת ההפניה" was a bare text button at another height on every card).
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
      className="group flex items-center gap-2 w-full min-h-10 px-3 rounded-md border border-border bg-background text-xs text-start hover:border-input transition-colors duration-[var(--duration-fast)]"
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

export function TermCard({ id, data, headId }: { id: string; data: ProvenanceData; headId?: string }) {
  const term = data.terms[id];
  if (!term) return <p id={headId}>{id}</p>;
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {term.he}
      </h2>
      <p>{term.explanation}</p>
      {term.variants.length > 0 && (
        <p className="text-sm text-muted-foreground">
          נקרא גם: {term.variants.join(" · ")}
        </p>
      )}
      {term.source && (
        <dl className="sheet-dl">
          <Row label={copy.sourced.source}>
            <SourceLink url={term.source.url} title={term.source.title} />
          </Row>
          <Row label={copy.sourced.checked}>
            <bdi dir="ltr">{fmt.date(term.source.checked)}</bdi>
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

export { Disclosure };
