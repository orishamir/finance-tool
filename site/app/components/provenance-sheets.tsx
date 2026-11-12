// What the provenance sheet shows (design-system 3.2, design-spec 1.3 and 3): a figure's source and how it was computed, a rule's card,
// a term's card, a formula, an open question, and the cards the rules page lays out. A script apart from the figures and chips
// (provenance.tsx `loadSheets`), fetched while the page hydrates (entry.client.tsx), so a page shows itself without waiting for it.
import { useContext, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { buttons, computedInputs, flags as flagCopy, formulaKeys, formulaNames, numbers, provenance as copy, rule as ruleCopy, ruleCardMore, rulesDetail, scopeWords, sourceBlock as sourceCopy, strength as strengthCopy, updateRules } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { ownFigures } from "../lib/rule-row";
import { fmt, formatValue } from "../lib/format";
import { hasHebrew, hostOf, isHebrewTitle, mostlyHebrew, sourceLabel } from "../lib/source-label";
import { citationText, mayHaveChanged, moreSourcesLabel, pickSources, publicUrl, sourceHref, sourceLabel2, sourceParts, type CitedPlace, type RuleSource, type SourcedRule } from "../lib/sources";
import { useInputs } from "../lib/inputs";
import { isOpenValue, isParameter, isWeak, ownBy, ruleFigure, strengthOf, type SiteValue } from "../lib/value";
import { parseAnswer } from "../lib/answer-slots";
import { IconAlert, IconCheck, IconClock, IconCopy, IconExternal, IconReset } from "./icons";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";
import { Card, CompanyLinks, DocLink, FormulaBlock, GroupHead, PrintedText, StatRow, When, gershayim, keepTitleWhole } from "./kit";
import { companyLinksOf, generalOnly, isGeneral, isNotRule, isOwnSourceOf, joinNames, listedCompanies, noCompanyAnchor, ownDocCompanies, scopeCompanies, pageView, sourceCompany, sourcesForPage, type OwnDocs } from "../lib/scope";
import type { SheetPart } from "./provenance";
import { CloseCtx, DataCtx, IdRef, IdText, InsideSheetCtx, Num, ReadingTag, RuleRef, RuleTitleRow, RulesLine, StateTag, StrengthLabel, TodayCtx, idKind, openQuestionOf, questionOf, ruleOf, scopeTag, startsAfter, textDir, type Item, type ProvenanceData } from "./provenance";

/** What a `RulesChip` opens: each rule by its title (`RuleTitleRow`), a company's term named; a row opens the card, with the sheet's back arrow to the list. */
function RulesListSheet({ ids, name, headId }: { ids: readonly string[]; name?: string; headId: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {ruleCopy.set} · <bdi dir="ltr">{ids.length}</bdi>
        </h2>
        {name && <p className="text-sm text-muted-foreground">{name}</p>}
      </div>
      <ul className="flex flex-col">
        {ids.map((id) => (
          <li key={id} className="border-t border-border">
            {idKind(id) === "rule" ? <RuleTitleRow id={id} /> : <span className="flex min-h-target items-center"><IdRef id={id} /></span>}
          </li>
        ))}
      </ul>
    </div>
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

/** The body of the sheet for what was opened (provenance.tsx renders it inside its `Sheet`). */
export function SheetContent({ item, data, headId, descId }: { item: Item; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <InsideSheetCtx.Provider value={true}>
      {item.kind === "value" && <ValueSheet value={item.value} exact={!!item.exact} display={item.display} data={data} headId={headId} descId={descId} />}
      {item.kind === "rule" && <RuleCard id={item.id} data={data} headId={headId} />}
      {item.kind === "rules" && <RulesListSheet ids={item.ids} name={item.name} headId={headId} />}
      {item.kind === "term" && <TermCard id={item.id} data={data} headId={headId} />}
      {item.kind === "terms" && <TermsSheet ids={item.ids} name={item.name} lead={item.lead} parts={item.parts} data={data} headId={headId} />}
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
      <h2 id={headId} data-code-ok className="text-lg font-semibold">
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

/**
 * The Hebrew name of a computed input: the copy's name for an English key, else the key as written (already Hebrew). A deal's key numbered
 * after its fee's kind (`deal:custody 5.min`, the fifth custody fee of a deal) takes the unnumbered key's name with the number after the
 * fee's name, so any count of one kind is named.
 */
export function inputName(key: string): string {
  const named = computedInputs.names[key];
  if (named !== undefined) return named;
  const m = /^(deal:[a-z_]+) (\d+)(\.[a-z]+)?$/.exec(key);
  const first = m ? computedInputs.names[m[1]!] : undefined;
  const whole = m ? computedInputs.names[m[1]! + (m[3] ?? "")] : undefined;
  return first !== undefined && whole?.startsWith(first) ? `${first} ${m![2]}${whole.slice(first.length)}` : key;
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

/** The month a rule's figure takes effect, as a figure of its own with the figure's source ("{ID:figure.from}"), or null when it has no date. */
export function ruleFigureFrom(rule: RuleRecord, name: string, today: string): SiteValue | null {
  const v = ruleFigure(rule, name, today);
  return v?.effective_from ? { ...v, value: v.effective_from.slice(0, 7), unit: "text" } : null;
}

/** A sentence with {ID:figure} slots (the questions' answers, the "הידעת?" facts, the flags' words): each slot is that rule's figure, with its unit in words where the number carries none; "{ID:figure.from}" is the month it takes effect. */
export function SlottedText({ text, rules, today }: { text: string; rules: Record<string, RuleRecord>; today: string }) {
  return (
    <>
      {parseAnswer(text).map((p, k) => {
        if (p.kind === "text") return <span key={k}>{p.text}</span>;
        const rule = rules[p.id];
        const from = p.figure.endsWith(".from");
        const v = rule ? (from ? ruleFigureFrom(rule, p.figure.slice(0, -5), today) : ruleFigure(rule, p.figure, today)) : null;
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
              {/* the chip says the formula's name; its sheet holds the math */}
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
              {/* a flag's words may carry {ID:figure} slots: the rule's figure, from the page's records or those its cards point at */}
              <SlottedText text={flagCopy[code] ?? copy.flagOther} rules={{ ...data.pointed, ...data.rules }} today={data.today} /> <bdi dir="ltr" className="text-xs">{code}</bdi>
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
      <div data-code-ok className="flex flex-col gap-2">
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
    // the rule's own card: the one place outside the rules page where its code stands, in the heading "id · title" (D25)
    <div data-code-ok className={cx("flex-1 flex flex-col gap-3", open && "rule-open")}>
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
              {/* a page kind with no single page for the rule (the fee pages, one per product) is named, not linked */}
              {uses.pages.map((u) =>
                u.href ? (
                  <Link key={u.href} to={u.href} className="text-link hover:underline">
                    {u.label}
                  </Link>
                ) : (
                  <span key={u.label}>{u.label}</span>
                ),
              )}
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
    <article data-code-ok className={cx("flex flex-col gap-5 min-w-0 [overflow-wrap:anywhere]", open && "rule-open")}>
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
                {/* a page kind with no single page for the rule (the fee pages, one per product) is named, not linked */}
                {uses.pages.map((u) =>
                  u.href ? (
                    <Link key={u.href} to={u.href} className="text-link hover:underline">
                      {u.label}
                    </Link>
                  ) : (
                    <span key={u.label}>{u.label}</span>
                  ),
                )}
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
/** One of a sheet's own sentences: what it is about, the sentence, and the document it rests on right under it. */
const sheetPart = (p: SheetPart) => (
  <div key={`${p.head ?? ""}${p.text}`} className="flex flex-col">
    <p className="text-muted-foreground">
      {p.head && <span className="text-foreground font-medium">{p.head}: </span>}
      {p.text}
    </p>
    {p.doc && <DocLink href={p.doc.href}>{p.doc.title}</DocLink>}
  </div>
);

function TermsSheet({ ids, name, lead, parts, data, headId }: { ids: readonly string[]; name: string; lead?: string; parts?: readonly SheetPart[] | undefined; data: ProvenanceData; headId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {name}
        </h2>
        {lead && <p className="text-muted-foreground">{lead}</p>}
      </div>
      {/* the sheet's own sentences, each with the document it rests on right under it; then each group under its heading, where a part
          with no head and no document is a line of a list */}
      {parts?.filter((p) => p.group === undefined).map(sheetPart)}
      {[...new Set(parts?.flatMap((p) => (p.group !== undefined ? [p.group] : [])))].map((g) => {
        const these = parts!.filter((p) => p.group === g);
        const listed = these.filter((p) => !p.head && !p.doc);
        return (
          <section key={g} className={cx("flex flex-col gap-2", g && "border-t border-border pt-4")}>
            {g && <h3 className="text-base font-semibold">{g}</h3>}
            {these.filter((p) => p.head || p.doc).map(sheetPart)}
            {listed.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 ps-5 text-muted-foreground">
                {listed.map((p) => (
                  <li key={p.text}>{p.text}</li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {ids.map((id) => (
        <div key={id} className="border-t border-border pt-4">
          <TermCard id={id} data={data} sub />
        </div>
      ))}
    </div>
  );
}

