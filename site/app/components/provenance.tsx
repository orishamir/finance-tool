// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. Rule and term chips open their cards
// in the same sheet, with a back arrow when they were reached from a number.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { buttons, computedInputs, flags as flagCopy, formulaNames, numbers, provenance as copy, rule as ruleCopy, ruleCardMore, sourceBlock as sourceCopy, strength as strengthCopy, updateRules } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { fmt, formatValue } from "../lib/format";
import { hasHebrew, isHebrewTitle, mostlyHebrew, sourceLabel } from "../lib/source-label";
import { isExperience } from "../lib/rule-shelves";
import { citationText, mayHaveChanged, moreSourcesLabel, pickSources, sourceHref, sourceLabel2, shownTitle, type RuleSource, type SourcedRule } from "../lib/sources";
import { useInputs } from "../lib/inputs";
import { isParameter, isProvisional, strengthOf, type SiteValue, type Strength } from "../lib/value";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconCalculator, IconCheck, IconClock, IconCopy, IconExternal, IconFile, IconLock, IconPencil, IconReset } from "./icons";
import { Sheet } from "./Sheet";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue; /** The figure was shown with two decimals (a table cell, or near a threshold): the sheet shows the same digits. */ exact?: boolean } | { kind: "rule"; id: string } | { kind: "term"; id: string };

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
}

/** What a rule affects: links to pages that use it, and whether the calculation engine reads it. */
export interface RuleUses {
  pages: { href: string; label: string }[];
  engine: boolean;
}

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
      <TodayCtx.Provider value={data.today}>
      {children}
      <PushCtx.Provider value={push}>
        <Sheet open={open} onClose={close} anchor={anchor} pc="popover" height={70} className="lg:max-h-[60vh] lg:backdrop:bg-transparent" labelledBy={headId} describedBy={descId} onBack={back}>
          {top && <SheetContent item={top} data={data} headId={headId} descId={descId} />}
        </Sheet>
      </PushCtx.Provider>
      </TodayCtx.Provider>
    </Ctx.Provider>
  );
}

const PushCtx = createContext<(item: Item) => void>(() => {});

export function useOpen() {
  const api = useContext(Ctx);
  const push = useContext(PushCtx);
  const inside = useContext(InsideSheetCtx);
  return (item: Item, el: HTMLElement | null) => (inside ? push(item) : api.open(item, el));
}

const InsideSheetCtx = createContext(false);

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
  const weak = strength === "institution" || strength === "secondary" ? numbers.weak[strength] : null;
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

/** A lead text that ends in a maqaf word ("נכון ל־", "ב־") followed by a number: only its last word is bound to the number
 * (one non-breaking span), so the rest of the sentence still wraps. */
export function LeadTail({ lead, children }: { lead: string; children: ReactNode }) {
  const m = /^([\s\S]*?)(\S+)(\s*)$/.exec(lead);
  if (!m) return <>{children}</>;
  return (
    <>
      {m[1]}
      <span className="whitespace-nowrap">
        {m[2]}
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
      <Num {...rest} prefix={m[2]} />
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

/** A rule chip: the ID in LTR with a slashed zero, a 44px tap area, opening the rule card. */
export function RuleRef({ id, className }: { id: string; className?: string }) {
  const open = useOpen();
  return (
    <button type="button" className={cx("rule-chip", className)} onClick={(e) => open({ kind: "rule", id }, e.currentTarget)} aria-label={`${ruleCopy.title} ${id}`}>
      <bdi dir="ltr">{id}</bdi>
    </button>
  );
}

/** "כללים:" then the chips. Always the last line of its block, never inside a sentence (design review C1). */
export function RulesLine({ ids, lead, className }: { ids: readonly string[]; lead?: ReactNode; className?: string }) {
  if (ids.length === 0 && !lead) return null;
  return (
    <p className={cx("rules-line text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {lead}
      {ids.length > 0 && <span>כללים:</span>}
      {ids.map((id) => (
        <RuleRef key={id} id={id} />
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
 * carries when it rests on a company's own document; `institution={false}` leaves it out on a page that has none. `term`
 * adds the glossary-term sample (dashed teal underline, `.term`) for pages whose text has `Term`s (the guide, exposure pages; wp6, A78).
 */
export function NumberLegend({ className, institution = true, term = false }: { className?: string; institution?: boolean; term?: boolean }) {
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

/** One source: the link line, the quoted words, then when it was read (synthesis 3.3). */
function OneSource({ source, rule, today, english }: { source: RuleSource; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; english?: boolean }) {
  const n = sourceLabel2(source);
  const title = shownTitle(n.title, source.url, source.kind);
  const pubHebrew = hasHebrew(n.publisher);
  const weak = source.strength !== "primary" ? sourceCopy.weak[source.strength] : null;
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
export function SourceBlock({ source, rule, today, inline, english }: { source: RuleSource | readonly RuleSource[]; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; inline?: boolean; english?: boolean }) {
  const list = Array.isArray(source) ? (source as readonly RuleSource[]) : [source as RuleSource];
  const [first, ...rest] = list;
  if (!first) return null;
  // no "לקריאה נוחה" copy after an official source any more: pickSources leaves copies out when there is one (2026-10-25)
  const more = rest.map((s) => <OneSource key={s.url + (s.locator ?? "")} source={s} rule={rule} today={today} english={english} />);
  return (
    <div className="flex flex-col gap-3">
      <OneSource source={first} rule={rule} today={today} english={english} />
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
    </InsideSheetCtx.Provider>
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
    const st = strengthOf(input);
    if (st === "institution" || st === "secondary") out.push(inputName(key));
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
  return <SourceBlock source={source} rule={owner} today={data.today} english />;
}

function ValueSheet({ value, exact, data, headId, descId }: { value: SiteValue; exact: boolean; data: ProvenanceData; headId: string; descId: string }) {
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
            <span className="text-sm">{value.parameter?.rationaleHe ?? (mostlyHebrew(value.parameter?.rationale) ? value.parameter?.rationale : copy.parameter.noRationale)}</span>
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
            <Row label={copy.computed.formula}>
              <span className="flex flex-wrap items-center gap-2">
                <span>{formulaNames[value.computed_from.formula] ?? formulaNames._other}</span>
                <span className="rule-chip rule-chip-static">
                  <bdi dir="ltr">{value.computed_from.formula}</bdi>
                </span>
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
                    {data.rules[r.id] && <FirstSourceLine rule={data.rules[r.id]!} />}
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

      {(strength === "institution" || strength === "secondary" || strength === "primary-mirror" || strength === "open") && value.state !== "entered" && (
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
  const rule = data.rules[id];
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
        {isExperience(id) ? (
          <Tag tone="neutral">{ruleCardMore.experienceTag}</Tag>
        ) : (
          (rule.strength === "open" || rule.strength === "institution" || rule.strength === "secondary") && <StrengthLabel strength={rule.strength} />
        )}
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
      {sources.length > 0 ? (
        <SourceBlock source={sources} rule={sourced} today={data.today} inline={inline} />
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
        {rule.dimensions.length > 0 && (
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
        {!inline && <LinkButton to={`/rules#${id}`}>{ruleCopy.all}</LinkButton>}
      </div>
    </div>
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
      {term.ruleIds.length > 0 && <RulesLine ids={term.ruleIds} />}
    </div>
  );
}

export { Disclosure };
