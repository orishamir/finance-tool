// Provenance: the number component and the sheet behind it (design-system 3.2, design-spec 1.3 and 3).
// Every figure on the site is a Num; a tap opens where it comes from. Rule and term chips open their cards
// in the same sheet, with a back arrow when they were reached from a number.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { buttons, flags as flagCopy, formulaNames, numbers, provenance as copy, rule as ruleCopy, strength as strengthCopy } from "../copy";
import { fmt, formatValue } from "../lib/format";
import { useInputs } from "../lib/inputs";
import { isParameter, isProvisional, strengthOf, type SiteValue, type Strength } from "../lib/value";
import type { TermRow } from "../lib/data.server";
import { IconAlert, IconCalculator, IconClock, IconExternal, IconFile, IconLock, IconPencil, IconReset } from "./icons";
import { Sheet } from "./Sheet";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";

// ---------------------------------------------------------------- context

export type Item = { kind: "value"; value: SiteValue } | { kind: "rule"; id: string } | { kind: "term"; id: string };

interface ProvenanceApi {
  open: (item: Item, anchor: HTMLElement | null) => void;
}

const Ctx = createContext<ProvenanceApi>({ open: () => {} });

export interface ProvenanceData {
  rules: Record<string, RuleRecord>;
  terms: Record<string, TermRow>;
  /** Checklist row names, for the dimension tags on a rule card. */
  dimensions: Record<string, string>;
  today: string;
  /** "לכל הכללים של {product}" target, on pages about one product. */
  rulesOf?: { name: string; href: string };
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
      {children}
      <PushCtx.Provider value={push}>
        <Sheet open={open} onClose={close} anchor={anchor} pc="popover" height={70} labelledBy={headId} describedBy={descId} onBack={back}>
          {top && <SheetContent item={top} data={data} headId={headId} descId={descId} />}
        </Sheet>
      </PushCtx.Provider>
    </Ctx.Provider>
  );
}

const PushCtx = createContext<(item: Item) => void>(() => {});

function useOpen() {
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
  /** Replaces the formatted text (for example "שנתיים" for a horizon of two years). */
  display?: string;
  /** Moves the digits to a new value over --duration-chart when it changes (design-spec 1.6). */
  animate?: boolean;
  className?: string;
}

const stateWord = { sourced: numbers.legend.sourced, computed: numbers.legend.computed, entered: numbers.legend.entered };

/** The provenance number: a button holding the formatted value in an isolating span, then its flags. */
export function Num({ value, size = "inline", display, animate, className }: NumProps) {
  const open = useOpen();
  const shown = useAnimatedValue(typeof value.value === "number" ? value.value : null, !!animate);
  const text = display ?? (shown !== null && typeof value.value === "number" ? formatValue(shown, value.unit) : formatValue(value.value, value.unit));
  const strength = strengthOf(value);
  const weak = strength === "institution" || strength === "secondary" ? numbers.weak[strength] : null;
  const param = isParameter(value);
  const label = [text, stateWord[value.state], param ? numbers.parameter : null, weak, value.stale ? `${numbers.staleSince} ${fmt.date(staleDate(value))}` : null, numbers.details].filter(Boolean).join(", ");
  return (
    <button
      type="button"
      className={cx("num", `num-${value.state}`, size === "figure" && "num-figure", size === "cell" && "num-cell", value.value === null && "num-unknown", className)}
      aria-label={label}
      onClick={(e) => open({ kind: "value", value }, e.currentTarget)}
    >
      <bdi dir="ltr">{text}</bdi>
      {value.stale && <IconClock size={14} className="text-caution inline-block align-[-2px] ms-1" />}
      {weak && <span className="text-xs text-caution-foreground font-normal ms-1 no-underline">{weak}</span>}
    </button>
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

/** A glossary term in running text: dashed underline, opens its card. The content decides which use is the first. */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const open = useOpen();
  return (
    <button type="button" className="term" onClick={(e) => open({ kind: "term", id }, e.currentTarget)}>
      {children ?? id}
    </button>
  );
}

/** The key to the three number styles (copy 2). Samples are marks, not figures. */
export function NumberLegend({ className }: { className?: string }) {
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
      <span className="lg:hidden">{numbers.legendHintPhone}</span>
      <span className="hidden lg:inline">{numbers.legendHintPc}</span>
    </p>
  );
}

// ---------------------------------------------------------------- sheet content

function SheetContent({ item, data, headId, descId }: { item: Item; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <InsideSheetCtx.Provider value={true}>
      {item.kind === "value" && <ValueSheet value={item.value} data={data} headId={headId} descId={descId} />}
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

function SourceLink({ url, title }: { url: string; title: string }) {
  const external = /^https?:/.test(url);
  if (!external) return <span>{title}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-start gap-1 hover:underline">
      <span>{title}</span>
      <IconExternal size={16} className="shrink-0 mt-1" />
    </a>
  );
}

function unitWordOf(unit: string): string | null {
  return (copy.unit as Record<string, string>)[unit] ?? null;
}

function ValueSheet({ value, data, headId, descId }: { value: SiteValue; data: ProvenanceData; headId: string; descId: string }) {
  const strength = strengthOf(value);
  const param = isParameter(value);
  const provisional = isProvisional(value);
  const text = formatValue(value.value, value.unit);
  const unitWord = typeof value.value === "number" ? unitWordOf(value.unit) : null;
  const { setEntered } = useInputs();
  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span id={headId} className={cx("num num-static text-2xl font-semibold", `num-${value.state}`, value.value === null && "text-muted-foreground")}>
            <bdi dir="ltr">{text}</bdi>
          </span>
          {unitWord && <span className="text-sm text-muted-foreground">{unitWord}</span>}
          <StateTag state={param ? "parameter" : value.state} />
          {value.stale && <IconClock size={16} className="text-caution" />}
        </div>
        {value.about && (
          <p id={descId} className="text-sm text-muted-foreground">
            {value.about}
          </p>
        )}
      </header>

      {value.value === null && value.notes && <p className="text-sm">{value.notes}</p>}

      {value.state === "sourced" && param && (
        <dl className="sheet-dl">
          <Row label={copy.parameter.why}>
            <span className="text-sm">{value.parameter?.rationale ?? value.notes}</span>
          </Row>
          <Row label={copy.parameter.approved}>{provisional ? <span className="text-sm">{numbers.provisional}</span> : value.parameter?.signedOffOn ? <bdi dir="ltr">{fmt.date(value.parameter.signedOffOn)}</bdi> : <span className="text-sm">{numbers.provisional}</span>}</Row>
          {provisional && value.notes && <Row label={copy.sourced.rule}><span className="text-sm text-muted-foreground">{value.notes}</span></Row>}
        </dl>
      )}

      {value.state === "sourced" && !param && value.value !== null && (
        <dl className="sheet-dl">
          <Row label={copy.sourced.source}>
            <SourceLink url={value.source.url} title={value.source.title} />
          </Row>
          <Row label={copy.sourced.publisher}>{value.source.publisher}</Row>
          <Row label={copy.sourced.checked}>
            <bdi dir="ltr">{fmt.date(value.checked)}</bdi>
          </Row>
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
          {value.rule_ids && value.rule_ids.length > 0 && (
            <Row label={copy.sourced.rule}>
              <span className="flex flex-wrap gap-2">
                {value.rule_ids.map((id) => (
                  <RuleRef key={id} id={id} />
                ))}
              </span>
            </Row>
          )}
          {value.notes && <Row label=""><span className="text-sm text-muted-foreground">{value.notes}</span></Row>}
        </dl>
      )}

      {value.state === "computed" && value.computed_from && (
        <>
          <dl className="sheet-dl">
            <Row label={copy.computed.formula}>
              <span className="flex flex-wrap items-center gap-2">
                <span>{formulaNames[value.computed_from.formula] ?? value.computed_from.formula}</span>
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
                  <dt>{label}</dt>
                  <dd>
                    <Num value={input} />
                    {isParameter(input) && <Tag tone="parameter">{numbers.parameter}</Tag>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          {value.rulesUsed && value.rulesUsed.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">{copy.computed.rules}</span>
              <div className="flex flex-wrap items-center gap-2">
                {value.rulesUsed.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1.5">
                    <RuleRef id={r.id} />
                    <StrengthLabel strength={r.strength} />
                  </span>
                ))}
              </div>
            </div>
          )}
          {value.flags?.map((code) => (
            <Callout key={code} tone="caution">
              {flagCopy[code] ?? code} <bdi dir="ltr" className="text-xs">{code}</bdi>
            </Callout>
          ))}
          {value.notes && <p className="text-sm text-muted-foreground">{value.notes}</p>}
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

export function RuleCard({ id, data, headId, inline }: { id: string; data: ProvenanceData; headId?: string; inline?: boolean }) {
  const rule = data.rules[id];
  if (!rule) {
    return (
      <div className="flex flex-col gap-2">
        <h2 id={headId} className="text-lg font-semibold">
          {ruleCopy.title} <bdi dir="ltr" className="slashed-zero">{id}</bdi>
        </h2>
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
        <LinkButton to="/rules">{ruleCopy.all}</LinkButton>
      </div>
    );
  }
  const open = rule.strength === "open";
  const figures = Object.entries(rule.figures ?? {});
  const firstSource = figures.map(([, f]) => (Array.isArray(f) ? f[0]?.rate : "by_tax_year" in f ? Object.values(f.by_tax_year)[0] : f)).find(Boolean);
  return (
    <div className={cx("flex flex-col gap-3", open && "rule-open")}>
      <header className="flex flex-col gap-1.5">
        <h2 id={headId} className="text-lg font-semibold leading-snug">
          {open ? ruleCopy.open.title : `${ruleCopy.title}`} <bdi dir="ltr" className="slashed-zero">{id}</bdi>
          {!open && ": "}
          {!open && <bdi dir="ltr">{rule.title}</bdi>}
        </h2>
        <StrengthLabel strength={rule.strength} />
      </header>
      {open ? (
        <Callout tone="blocked">
          <span className="block">
            <bdi dir="ltr">{rule.title}</bdi>
          </span>
          <span className="block">{ruleCopy.open.last}</span>
        </Callout>
      ) : (
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
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
                      <bdi dir="ltr" className="text-xs">{name}</bdi> {b.up_to.value === null ? "" : "≤"} {b.up_to.value !== null && <Num value={{ ...b.up_to, rule_ids: b.up_to.rule_ids ?? [id] }} />}
                    </dt>
                    <dd>
                      <Num value={{ ...b.rate, rule_ids: b.rate.rule_ids ?? [id] }} />
                    </dd>
                  </div>
                ));
              const byYear = "by_tax_year" in f ? Object.entries(f.by_tax_year) : [[null, f] as const];
              return byYear.map(([year, v]) => (
                <div key={`${name}-${year ?? ""}`} className="readout-row">
                  <dt>
                    <bdi dir="ltr" className="text-xs">{name}</bdi>
                    {year && (
                      <>
                        {" "}
                        <bdi dir="ltr">{year}</bdi>
                      </>
                    )}
                  </dt>
                  <dd>
                    <Num value={{ ...v, rule_ids: v.rule_ids ?? [id] }} />
                  </dd>
                </div>
              ));
            })}
          </dl>
        </div>
      )}
      <dl className="sheet-dl">
        <Row label={ruleCopy.source}>{firstSource ? <SourceLink url={firstSource.source.url} title={firstSource.source.title} /> : <bdi dir="ltr">{rule.il_finance_file}</bdi>}</Row>
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
              {rule.dimensions.map((d) => (
                <Tag key={d} tone="neutral">
                  {data.dimensions[d] ?? <bdi dir="ltr">{d}</bdi>}
                </Tag>
              ))}
            </span>
          </Row>
        )}
      </dl>
      {!inline && <LinkButton to={`/rules#${id}`}>{ruleCopy.all}</LinkButton>}
    </div>
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
