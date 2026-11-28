// What the provenance sheet shows (design-system 3.2, design-spec 1.3 and 3): a figure's source, a calculated figure's catches, a rule's
// card, a term's card, an open question, a statement math proves, and the cards the rules page lays out. A script apart from the figures and chips
// (provenance.tsx `loadSheets`), fetched while the page hydrates (entry.client.tsx), so a page shows itself without waiting for it.
import { useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { documentsPath, rulesPath } from "../lib/site-paths";
import { Link, useLocation } from "react-router";
import { assertNever, type RuleRecord } from "@finance-tool/schema";
import type { FundStatement } from "@finance-tool/engine";
import { system, buttons, computedInputs, flags as flagCopy, numbers, provenance as copy, rule as ruleCopy, ruleCardMore, rulesDetail, scopeWords, sourceBlock as sourceCopy, strength as strengthCopy, updateRules } from "../copy";
import { ruleTitle } from "../lib/rule-title";
import { ownFigures, spanWords } from "../lib/rule-row";
import { fillSlot, missingSlot, wordUnits, type SlotSource } from "../lib/figure-slots";
import { fmt } from "../lib/format";
import { headText } from "../lib/working";
import { hasHebrew, hostOf, isHebrewTitle, mostlyHebrew, sourceLabel } from "../lib/source-label";
import { citationText, mayHaveChanged, moreSourcesLabel, pickSources, publicUrl, sourceHref, sourceLabel2, sourceParts, type CitedPlace, type RuleSource, type SourcedRule } from "../lib/sources";
import { useInputs } from "../lib/inputs";
import { isOpenValue, isParameter, isWeak, ownBy, recheckStale, sheetReading, strengthOf, type SiteValue, type Staleness } from "../lib/value";
import { parseAnswer } from "../lib/answer-slots";
import type { RuleCardFile } from "../lib/rule-card-file";
import { IconAlert, IconCheck, IconClock, IconCopy, IconExternal, IconReset } from "./icons";
import { Button, Callout, cx, Disclosure, LinkButton, Tag } from "./ui";
import { Card, CompanyLinks, DocLink, GroupHead, PrintedText, StatRow, When, gershayim, keepTitleWhole } from "./kit";
import { companyLinksOf, generalOnly, isGeneral, isNotRule, isOwnSourceOf, joinNames, listedCompanies, noCompanyAnchor, ownDocCompanies, sameCompanies, scopeCompanies, tagCompanies, pageScope, pageView, sourceCompany, sourcesForPage, type OwnDocs } from "../lib/scope";
import type { SheetPart } from "./provenance";
import { CloseCtx, DataCtx, IdRef, IdText, InsideSheetCtx, Num, ReadingTag, RuleRef, RuleTitleList, RuleTitleRow, StateTag, StrengthLabel, TitleRow, TodayCtx, headOf, idKind, openQuestionOf, questionOf, ruleOf, scopeTag, startsAfter, textDir, useOpen, type Item, type ProvenanceData, type Catch } from "./provenance";
import { proofOf } from "../content/proofs";

/** What words that state several rules (`Ruled`) open: each rule by its title (`RuleTitleRow`), a company's term named; a row opens the card, with the sheet's back arrow to the list. */
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

/** Text that may hold Latin letters or digits: isolated so it keeps its order inside Hebrew. Words with Hebrew in them are laid out right
 *  to left whatever letter they start with: a plain <bdi> took "LAYA: דף הבית" left to right from its first letter. */
function Iso({ children, ltr }: { children: ReactNode; ltr?: boolean }) {
  return <bdi dir={ltr ? "ltr" : typeof children === "string" && hasHebrew(children) ? "rtl" : undefined}>{children}</bdi>;
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

/**
 * One source: the link line, the quoted words, then when it was read and how strong it is (synthesis 3.3). `strengthSaid`: the sheet
 * states the strength itself (a figure's strength callout over its one source), so the line leaves its word out.
 */
function OneSource({ source, rule, today, english, own, strengthSaid }: { source: RuleSource; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; english?: boolean; own?: OwnSource; strengthSaid?: boolean }) {
  // a data file names its company in English: the publishers table gives the Hebrew name by the source's host
  const publishersHe = useContext(DataCtx)?.publishersHe;
  const host = hostOf(source.url);
  const he = source.publisher_he ?? (host ? publishersHe?.[host] : undefined);
  const n = sourceLabel2(he ? { ...source, publisher_he: he } : source);
  const parts = sourceParts(he ? { ...source, publisher_he: he } : source);
  // D31: a company's own document on its own term is shown with a neutral source line, no "לפי החברה"; `own` lifts only that label,
  // never "מקור משני"
  const isOwn = typeof own === "function" ? own(source) : !!own;
  const weak = !strengthSaid && source.strength !== "primary" && !(isOwn && source.strength === "institution") ? sourceCopy.weak[source.strength] : null;
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
export function SourceBlock({ source, rule, today, inline, english, own, strengthSaid }: { source: RuleSource | readonly RuleSource[]; rule?: Pick<SourcedRule, "likely_to_change" | "recheck_date">; today: string; inline?: boolean; english?: boolean; own?: OwnSource; strengthSaid?: boolean }) {
  const list = Array.isArray(source) ? (source as readonly RuleSource[]) : [source as RuleSource];
  const [first, ...rest] = list;
  if (!first) return null;
  // no "לקריאה נוחה" copy after an official source any more: pickSources leaves copies out when there is one
  // one page may be cited twice, for two quotes (IRA-29): the place in the list keeps the keys apart
  const more = rest.map((s, i) => <OneSource key={`${i}:${s.url}${s.locator ?? ""}`} source={s} rule={rule} today={today} english={english} own={own} strengthSaid={strengthSaid} />);
  return (
    <div className="flex flex-col gap-3">
      <OneSource source={first} rule={rule} today={today} english={english} own={own} strengthSaid={strengthSaid} />
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
// ---------------------------------------------------------------- the cards fetched when opened

/** Where the fetch of one rule's card file stands: on its way, in, or failed (tried again on the retry). */
export type CardFetch = { kind: "loading" } | { kind: "loaded"; file: RuleCardFile } | { kind: "failed" };

/** The card files fetched in this visit, by rule id, kept for the session: a card opened again, on this page or another, draws at once. */
let cardFetches: ReadonlyMap<string, CardFetch> = new Map();
const noFetches: ReadonlyMap<string, CardFetch> = new Map();
const cardListeners = new Set<() => void>();
function setCardFetch(id: string, f: CardFetch): void {
  cardFetches = new Map(cardFetches).set(id, f);
  for (const l of cardListeners) l();
}
function watchCardFetches(l: () => void): () => void {
  cardListeners.add(l);
  return () => {
    cardListeners.delete(l);
  };
}

/**
 * A rule's card file, read: a dropped connection, a server's error or no file is a failure; a file that does not match its schema
 * throws. A file is fetched only for a rule the page has the head of, which the build gives a file, so no file means the page is older
 * than the site's files, and the card says it did not load rather than that the rule has no text. The schema comes with the first file
 * fetched, so a page's own script carries none of it. Exported for its test.
 */
export async function loadCardFile(id: string): Promise<CardFetch> {
  let r: Response;
  let body: unknown;
  let schema: typeof import("../lib/rule-card-file");
  try {
    schema = await import("../lib/rule-card-file");
    r = await fetch(`${import.meta.env.BASE_URL}${schema.ruleCardPath(id).slice(1)}`);
    body = r.ok ? await r.json() : null;
  } catch {
    // the connection dropped, or the body was cut short: the card says the fetch failed, with its retry
    return { kind: "failed" };
  }
  if (!r.ok) return { kind: "failed" };
  const parsed = schema.ruleCardFile.safeParse(body);
  if (!parsed.success) throw new Error(`the card file of ${id} does not match its schema`, { cause: parsed.error });
  return { kind: "loaded", file: parsed.data };
}

/**
 * Fetches a rule's card file (routes/rule-card.ts), unless it is in or on its way; a failed one is fetched again. Settles when the fetch
 * does. Exported for its test.
 */
export function fetchCard(id: string): Promise<void> {
  const now = cardFetches.get(id);
  if (now && now.kind !== "failed") return Promise.resolve();
  setCardFetch(id, { kind: "loading" });
  return loadCardFile(id).then(
    (f) => setCardFetch(id, f),
    (e: unknown) => {
      // the site's own file is broken: the card says it failed, and the page's notice that something broke says it too
      setCardFetch(id, { kind: "failed" });
      throw e;
    },
  );
}

/** Where the fetch of a rule's card file stands, fetching it as the card opens; nothing for a card the page holds the record of (`id` null). */
function useCardFile(id: string | null): CardFetch | undefined {
  // the server never fetches, so the store it reads is empty, as the browser's is before a card opens
  const get = () => (id ? cardFetches.get(id) : undefined);
  const fetched = useSyncExternalStore(watchCardFetches, get, get);
  useEffect(() => {
    if (id) void fetchCard(id);
  }, [id]);
  return fetched;
}

/**
 * The page's data with every card file fetched in this visit over it: a fetched card, the chips in it and its figures' sheets read its
 * records and heads as they read the page's own. Where each record is used joins only a page whose cards say it (`ruleUses`). Exported for
 * its test.
 */
export function withFetched(data: ProvenanceData, fetches: ReadonlyMap<string, CardFetch>): ProvenanceData {
  const files = [...fetches.values()].flatMap((f) => (f.kind === "loaded" ? [f.file] : []));
  if (files.length === 0) return data;
  const pointed = { ...data.pointed };
  const heads = { ...data.heads };
  const uses = { ...data.ruleUses };
  for (const f of files) {
    Object.assign(heads, f.heads);
    Object.assign(pointed, f.pointed, { [f.record.id]: f.record });
    Object.assign(uses, f.uses);
  }
  return { ...data, pointed, heads, ...(data.ruleUses ? { ruleUses: uses } : {}) };
}

export function SheetContent({ item, data: page, headId, descId }: { item: Item; data: ProvenanceData; headId: string; descId: string }) {
  const data = withFetched(page, useSyncExternalStore(watchCardFetches, () => cardFetches, () => noFetches));
  return (
    <DataCtx.Provider value={data}>
    <InsideSheetCtx.Provider value={true}>
      {item.kind === "value" && <ValueSheet value={item.value} exact={!!item.exact} display={item.display} shown={item.shown} data={data} headId={headId} descId={descId} />}
      {item.kind === "rule" && <RuleCard id={item.id} data={data} headId={headId} />}
      {item.kind === "rules" && <RulesListSheet ids={item.ids} name={item.name} headId={headId} />}
      {item.kind === "term" && <TermCard id={item.id} data={data} headId={headId} />}
      {item.kind === "terms" && <TermsSheet ids={item.ids} name={item.name} lead={item.lead} rules={item.rules} parts={item.parts} data={data} headId={headId} />}
      {item.kind === "catch" && <CatchSheet value={item.value} catches={item.catches} exact={!!item.exact} display={item.display} data={data} headId={headId} descId={descId} />}
      {item.kind === "list-catch" && <ListCatchSheet name={item.name} scope={item.scope} catches={item.catches} data={data} headId={headId} descId={descId} />}
      {item.kind === "obliged" && <ObligedSheet value={item.value} catches={item.catches} exact={!!item.exact} display={item.display} data={data} headId={headId} descId={descId} />}
      {item.kind === "question" && <QuestionSheet id={item.id} data={data} headId={headId} />}
      {item.kind === "proof" && <ProofSheet id={item.id} headId={headId} />}
      {item.kind === "proofs" && <ProofsListSheet ids={item.ids} headId={headId} />}
    </InsideSheetCtx.Provider>
    </DataCtx.Provider>
  );
}

const METHOD_URL = "https://github.com/orishamir/finance-tool/blob/main/docs/method.md";
/** Section 14 of method.md, "What the math proves about bonds", by the anchor GitHub gives its heading. */
const PROOFS_URL = `${METHOD_URL}#14-what-the-math-proves-about-bonds`;

/**
 * A proof's sheet: its Hebrew title with the code small beside it (as a formula's), what it shows, the assumptions under which it holds,
 * what it leaves out where it says, and a link to the proof itself in docs/method.md, in English. The words are content/proofs.ts.
 */
function ProofSheet({ id, headId }: { id: string; headId: string }) {
  const proof = proofOf(id);
  return (
    <div className="flex flex-col gap-4">
      <h2 id={headId} data-code-ok className="text-lg font-semibold leading-snug">
        {proof?.title ?? copy.proofChip.one} <bdi dir="ltr" className="slashed-zero text-muted-foreground text-base">{id}</bdi>
      </h2>
      {proof && (
        <>
          <p className="text-sm">{proof.holds}</p>
          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold">{copy.proofSheet.when}</h3>
            <ul className="flex list-disc flex-col gap-1 ps-5 text-sm">
              {proof.when.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
          {proof.notCovered && (
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-semibold">{copy.proofSheet.notCovered}</h3>
              <p className="text-sm">{proof.notCovered}</p>
            </section>
          )}
        </>
      )}
      <DocLink href={PROOFS_URL} className="text-sm">{copy.proofSheet.full}</DocLink>
    </div>
  );
}

/** What a `ProofsChip` of several opens: each proof by its title, a row opening its sheet, with the sheet's back arrow to the list (as `RulesListSheet`). */
function ProofsListSheet({ ids, headId }: { ids: readonly string[]; headId: string }) {
  const open = useOpen();
  return (
    <div className="flex flex-col gap-3">
      <h2 id={headId} className="text-lg font-semibold">
        {copy.proofChip.many} · <bdi dir="ltr">{ids.length}</bdi>
      </h2>
      <ul className="flex flex-col">
        {ids.map((id) => (
          <li key={id} className="border-t border-border">
            <TitleRow onClick={(e) => open({ kind: "proof", id }, e.currentTarget)}>{proofOf(id)?.title ?? copy.proofChip.one}</TitleRow>
          </li>
        ))}
      </ul>
    </div>
  );
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
const suffixUnits = wordUnits;

function unitWordOf(unit: string): string | null {
  return (copy.unit as Record<string, string>)[unit] ?? null;
}

/**
 * The sourced figure's one source block: the figure's own source and date, with the Hebrew names and the locator of the same link in its
 * rule record when there is one. `strengthSaid`: the sheet's strength callout already names the source's strength.
 */
function FigureSource({ value, data, strengthSaid }: { value: SiteValue; data: ProvenanceData; strengthSaid: boolean }) {
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
  // the figure's own place in the document (its PDF page, the words its web page opens at, the words it quotes) before the rule's; a
  // data file's source object may carry them beside the schema's four fields (a price list's quoted line)
  const at = value.source as CitedPlace & { quote?: string };
  // a figure whose source names itself in Hebrew (a page abroad: its publisher, its kind, the paragraph of a law) keeps those names
  const named = value.source as Partial<Pick<RuleSource, "publisher_he" | "title_he" | "kind" | "locator_he">>;
  const own = { ...(named.publisher_he ? { publisher_he: named.publisher_he } : {}), ...(named.title_he ? { title_he: named.title_he } : {}), ...(named.kind ? { kind: named.kind } : {}), ...(named.locator_he ? { locator_he: named.locator_he } : {}) };
  const source: RuleSource = {
    ...(known ?? { title: value.source.title, publisher: value.source.publisher, ...own }),
    ...(value.quote ?? at.quote ? { quote: value.quote ?? at.quote } : {}),
    url: value.source.url,
    ...(at.page ? { page: at.page } : {}),
    ...(at.fragment ? { fragment: at.fragment } : {}),
    strength: strengthOk(value.source.strength) ? value.source.strength : (known?.strength ?? "secondary"),
    checked: value.checked,
  };
  // a figure's source can be a file of the site, not a web address: the old plain label stays for it
  if (!/^https?:/.test(publicUrl(source.url))) return <SourceLink url={source.url} title={source.title} />;
  return <SourceBlock source={source} rule={owner} today={data.today} english own={!!value.own} strengthSaid={strengthSaid} />;
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

/** A sentence with {ID:figure} slots (the questions' answers, the "הידעת?" facts, the flags' words, a rule's text): each slot is that rule's figure, with its unit in words where the number carries none; "{ID:figure.from}" is the month it takes effect. */
export function SlottedText({ text, source }: { text: string; source: SlotSource }) {
  return (
    <>
      {parseAnswer(text).map((p, k) => {
        if (p.kind === "text") return <span key={k}>{p.text}</span>;
        const fill = fillSlot(p, source);
        switch (fill.kind) {
          case "from-now":
            return <span key={k}>{copy.fromNoDate}</span>;
          case "missing":
            return <span key={k}>{missingSlot}</span>;
          case "figure":
            return (
              <span key={k} className="whitespace-nowrap">
                <Num value={{ ...fill.value, notes: "" }} />
                {fill.unitWord && <> {fill.unitWord}</>}
              </span>
            );
          default:
            return assertNever(fill);
        }
      })}
    </>
  );
}


/**
 * Why a figure has no number, said once in its sheet, or null where nothing is said: its note in Hebrew; else, for a sourced figure, that
 * the source does not hold it. An open value's reason is its blocked callout, and an empty value a rule explains ("אין", PF-06) has that
 * rule's chip: "not found in the source" would be untrue of either.
 */
function missingReason(value: SiteValue, display: string | undefined, blocked: boolean): string | null {
  if (value.value === null && mostlyHebrew(value.notes)) return value.notes ?? null;
  if (value.value !== null || blocked || value.state !== "sourced") return null;
  return display && value.rule_ids?.length ? null : copy.sourced.noValue;
}

/**
 * A figure's head in its sheet: the figure as its line shows it, with its unit's word, then what else stands beside it (a state tag), and
 * its `about` line under it. `ink`: the figure in its state's ink (a sourced or entered figure's sheet), or plain (a catch's sheet).
 */
function FigureHead({ value, text, ink, headId, descId, children }: { value: SiteValue; text: string; ink: boolean; headId: string; descId: string; children?: ReactNode }) {
  // a long word (a deposit's tax: "ריבית לא צמודה. השיעור בעמוד המדריך.") wraps in a smaller size; kept on one line it ran past a phone's edge
  const longHead = text.length > 24;
  // the row's own words where they differ from the unit's (a one-year gap: "ב־2025"), so the head says what the row says (copy 10.4)
  const unitWord = typeof value.value === "number" ? (value.unitText ?? unitWordOf(value.unit)) : null;
  return (
    <header className="flex flex-col gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span id={headId} className={cx("font-semibold tabular-nums", longHead ? "text-xl" : "text-2xl", ink && `num num-static num-${value.state}`, value.value === null && "text-muted-foreground")}>
          <bdi dir={textDir(text)} className={longHead ? undefined : "whitespace-nowrap"}>{text}</bdi>
        </span>
        {unitWord && <span className="text-sm text-muted-foreground">{unitWord}</span>}
        {children}
      </div>
      {value.about && (
        <p id={descId} className="text-sm text-muted-foreground">
          {value.about}
        </p>
      )}
    </header>
  );
}

/** A figure not in force yet: its first day, and what that means. */
function AheadLine({ from }: { from: string }) {
  return (
    <p className="text-sm text-caution-foreground flex items-start gap-2">
      <IconAlert size={16} className="text-caution shrink-0 mt-1" />
      <span>
        <When iso={from} lead={numbers.startsOn} />. {copy.sourced.notYetInForce}
      </span>
    </p>
  );
}

/**
 * The doubt about a figure (SiteValue.doubt), the record's own or the site's reading of an open rule, with the rules it rests on: a doubt
 * carried from the inputs names them (`from`, by their keys), as the weak inputs are named, and each input's own sheet says the doubt in words.
 */
function DoubtCallout({ doubt, rules, from }: { doubt: string; rules: readonly string[]; from?: readonly string[] | undefined }) {
  return (
    <Callout tone="caution" title={numbers.doubt}>
      {from ? `${copy.computed.doubtedInputs} ${from.map(inputName).join(" · ")}` : <PrintedText text={doubt} />}
      {rules.length > 0 && <RuleTitleList ids={rules} className="mt-1.5" />}
    </Callout>
  );
}

/** A weak or open strength, said once: what it means, and for an open value the question it waits on (`openQuestionOf`, "TXI OQ19"). */
function StrengthNote({ strength, question = null }: { strength: "institution" | "secondary" | "open"; question?: string | null }) {
  return (
    <Callout tone={strength === "open" ? "blocked" : "caution"} title={strengthCopy[strength].label}>
      {strengthCopy[strength].line}
      {question && (
        <>
          {" "}
          <IdRef id={question} />
        </>
      )}
    </Callout>
  );
}

/** What a stale figure's source last said, and how often it should. */
function StaleLine({ stale }: { stale: Staleness }) {
  return (
    <p className="text-sm text-caution-foreground flex items-start gap-2">
      <IconClock size={16} className="text-caution shrink-0 mt-1" />
      <span>
        <When iso={stale.since} lead={`${copy.stale.before} `} />. {copy.stale.middle} {copy.stale.cadence[stale.cadence]}.
      </span>
    </p>
  );
}

/**
 * The engine's flags on a figure, in one callout, so its first line stands where the smallest phone's sheet shows it: each flag's words,
 * whose {ID:figure} slots are the rule's figure from the page's records or those its cards point at, and its code.
 */
function FlagsCallout({ codes, data }: { codes: readonly string[]; data: ProvenanceData }) {
  return (
    <Callout tone="caution">
      <span className="flex flex-col gap-1.5">
        {codes.map((code) => (
          <span key={code}>
            <SlottedText text={flagCopy[code] ?? copy.flagOther} source={data} /> <bdi dir="ltr" className="text-xs">{code}</bdi>
          </span>
        ))}
      </span>
    </Callout>
  );
}

/** Every sheet's way out: the rules of the page's product, or all rules; a fact of another country's product has no Israeli rules behind it. */
function AllRulesLink({ value, data }: { value?: SiteValue; data: ProvenanceData }) {
  if (value?.foreign) return null;
  return data.rulesOf ? (
    <LinkButton to={data.rulesOf.href}>
      {copy.allRulesOf} {data.rulesOf.name}
    </LinkButton>
  ) : (
    <LinkButton to="/rules">{buttons.allRules}</LinkButton>
  );
}

/**
 * The sheet a calculated figure's caution "?" opens: the figure in plain ink and what it is, then only its catches (provenance `catchesOf`,
 * as the figure's place decided them), each as a sourced figure's sheet says it, the fund's own statements it rests on, and the way to the
 * rules. The weak inputs are named, each with its figure, which opens its own sheet with its source.
 */
export function CatchSheet({ value, catches, exact, display, data, headId, descId }: { value: SiteValue; catches: readonly Catch[]; exact: boolean; display?: string; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <FigureHead value={value} text={headText(value, exact, display)} ink={false} headId={headId} descId={descId} />
      {catches.map((c) => (
        <CatchPart key={c.kind} c={c} data={data} />
      ))}
      <AllRulesLink value={value} data={data} />
    </div>
  );
}

/**
 * The sheet of the caution "?" that says once what every calculated figure of a list carries (provenance `ListCatchMark`): what the figures
 * are, that it holds for each of them, then the catches as a figure's own sheet says them, and the way to the rules.
 */
function ListCatchSheet({ name, scope, catches, data, headId, descId }: { name: string; scope: "column" | "list"; catches: readonly Catch[]; data: ProvenanceData; headId: string; descId: string }) {
  return (
    <div className="flex flex-col gap-3.5">
      <header className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">{name}</h2>
        <p id={descId} className="text-sm text-muted-foreground">{copy.computed.listCatch[scope]}</p>
      </header>
      {catches.map((c) => (
        <CatchPart key={c.kind} c={c} data={data} />
      ))}
      <AllRulesLink data={data} />
    </div>
  );
}

/**
 * The sheet of a calculated figure whose sources' terms require a line beside them (`SiteValue.obligation`, the ECB's attribution): the
 * figure in the sourced ink and what it is, its catches, each source its figures come from with their date, then that line, which no
 * place may leave out.
 */
function ObligedSheet({ value, catches, exact, display, data, headId, descId }: { value: SiteValue; catches: readonly Catch[]; exact: boolean; display?: string; data: ProvenanceData; headId: string; descId: string }) {
  // each source once, with the first input's figure that cites it: the ECB's two rates come from one file of one day
  const bySource = new Map<string, SiteValue>();
  for (const input of Object.values((value.computed_from?.inputs ?? {}) as Record<string, SiteValue>)) if (input.state === "sourced" && !bySource.has(input.source.url)) bySource.set(input.source.url, input);
  return (
    <div className="flex flex-col gap-3.5">
      <FigureHead value={{ ...value, state: "sourced" }} text={headText(value, exact, display)} ink headId={headId} descId={descId} />
      {value.lead && <p className="text-sm">{value.lead}</p>}
      {catches.map((c) => (
        <CatchPart key={c.kind} c={c} data={data} />
      ))}
      {bySource.size > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{copy.computed.obliged.sources}</span>
          {[...bySource.values()].map((input) => (
            <div key={input.source.url} className="flex flex-col gap-1">
              <FigureSource value={input} data={data} strengthSaid={false} />
              {input.effective_from && (
                <dl className="sheet-dl">
                  <Row label={copy.computed.obliged.dated}>
                    <When iso={input.effective_from} />
                  </Row>
                </dl>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground" data-obligation="">{value.obligation}</p>
      <AllRulesLink value={value} data={data} />
    </div>
  );
}

/**
 * A fund's own statements a figure rests on (D84, D119), each said as the fund's, with its document linked at the page and the day the site
 * read it; nothing where there are none.
 */
function Statements({ statements }: { statements: readonly FundStatement[] }) {
  if (statements.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">{copy.computed.statements}</span>
      {statements.map((st) => {
        const shown = statementShown(st);
        return (
          <div key={`${st.term}|${shown.href}`} className="flex flex-col">
            <p className="text-sm">{shown.sentence}</p>
            <DocLink href={shown.href}>{shown.doc}</DocLink>
            <p className="text-xs text-muted-foreground">
              {sourceCopy.checked} <Iso ltr>{fmt.date(st.checked)}</Iso>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A fund statement by the term it states: its sentence, and its document linked at the page: a stated tax index's annex at the page the
 * statement names (D84); a document naming the fund a foreign-investment fund by the record's own source, whose address opens at the page and
 * whose title names it (D119, data-schema §3.5).
 */
function statementShown(st: FundStatement): { sentence: string; href: string; doc: string } {
  switch (st.term) {
    case "tax-index":
      return { sentence: copy.computed.statement["tax-index"](st), href: sourceHref({ url: st.source.url, page: st.page }), doc: copy.computed.statementDoc(st.source.title, st.page) };
    case "foreign-investment-fund":
      return { sentence: copy.computed.statement["foreign-investment-fund"](st), href: sourceHref({ url: st.source.url }), doc: st.source.title };
    default:
      return assertNever(st);
  }
}

/** One catch as a catch's sheet says it. */
function CatchPart({ c, data }: { c: Catch; data: ProvenanceData }) {
  switch (c.kind) {
    case "ahead":
      return <AheadLine from={c.from} />;
    case "doubt":
      return <DoubtCallout doubt={c.doubt} rules={c.rules} from={c.from} />;
    case "caveat":
      return (
        <Callout tone="caution">
          <PrintedText text={c.text} />
        </Callout>
      );
    case "weak":
      return <WeakInputs strength={c.strength} inputs={c.inputs} />;
    case "open":
      return <StrengthNote strength="open" />;
    case "stale":
      return <StaleLine stale={c.stale} />;
    case "flags":
      return <FlagsCallout codes={c.codes} data={data} />;
    case "reading":
      return (
        <div className="flex flex-col items-start gap-1.5">
          <ReadingTag />
          <RuleTitleList ids={c.rules} className="self-stretch" />
        </div>
      );
    case "statements":
      return <Statements statements={c.statements} />;
    default:
      return assertNever(c);
  }
}

/**
 * The inputs a calculated figure's weak strength comes from, each named with its figure, under a line by its strength; a secondary strength,
 * and one no input carries (a rule or a fund's statement the calculation read), is said as a sourced figure's is (`StrengthNote`).
 */
function WeakInputs({ strength, inputs }: { strength: "institution" | "secondary"; inputs: Extract<Catch, { kind: "weak" }>["inputs"] }) {
  const groups = (["institution", "secondary"] as const).map((st) => [st, inputs.filter(([, x]) => strengthOf(x) === st)] as const).filter(([, list]) => list.length > 0);
  return (
    <>
      {(strength === "secondary" || groups.length === 0) && <StrengthNote strength={strength} />}
      {groups.map(([st, list]) => (
        <div key={st} className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{copy.computed.weakInputs[st]}</span>
          <dl className="readout">
            {list.map(([key, input]) => (
              <div key={key} className="readout-row">
                <dt>{inputName(key)}</dt>
                <dd>
                  <Num value={input} display={inputDisplay(key, input)} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </>
  );
}

/**
 * The sheet behind a sourced or entered figure (exported for the render tests). `shown`: the rules the place it was opened from already
 * opens, whose chips it leaves out, as it leaves out the doubt's rules, which the doubt's callout opens.
 */
export function ValueSheet({ value, exact, display, shown = [], data, headId, descId }: { value: SiteValue; exact: boolean; display?: string; shown?: readonly string[]; data: ProvenanceData; headId: string; descId: string }) {
  const strength = strengthOf(value);
  const param = isParameter(value);
  const today = useContext(TodayCtx);
  const blocked = isOpenValue(value);
  // a figure shown with its sign heads its sheet with it: "+0.37%" in the row read "0.37%" in the sheet
  const text = headText(value, exact, display);
  const { setEntered } = useInputs();
  const fromDate = startsAfter(value, today);
  const year = calendarYearOf(value);
  // the sheet says a weak or open strength once, in this callout: a sourced figure's source line leaves its word out
  const weakOrOpen = value.state !== "entered" && (strength === "open" || (isWeak(value) && (strength === "institution" || strength === "secondary"))) ? strength : null;
  const strengthSaid = weakOrOpen !== null;
  const hidden = new Set([...shown, ...(value.doubtRules ?? [])]);
  const chips = (value.rule_ids ?? []).filter((id) => !hidden.has(id));
  const chipRow = chips.length > 0 && (
    <Row label={chips.length === 1 ? copy.sourced.rule : copy.sourced.rules}>
      <span className="flex flex-wrap gap-2">
        {chips.map((id) => <RuleRef key={id} id={id} />)}
      </span>
    </Row>
  );
  const missing = value.value === null;
  const reason = missingReason(value, display, blocked);
  return (
    <div className="flex flex-col gap-3.5">
      <FigureHead value={value} text={text} ink headId={headId} descId={descId}>
        {/* a missing figure is no figure of any kind: no state tag */}
        {!blocked && !missing && value.state !== "computed" && <StateTag state={param ? "parameter" : value.state} />}
        {/* a figure that rests on the site's reading of official texts says so wherever it is opened */}
        {sheetReading(value) && <ReadingTag />}
        {value.stale && <IconClock size={16} className="text-caution" />}
      </FigureHead>

      {/* what the figure means, before anything else in the sheet: at the end it sat below the popover's edge */}
      {value.lead && <p className="text-sm">{value.lead}</p>}

      {fromDate && <AheadLine from={fromDate} />}

      {/* the doubt, near the top of the figure's sheet, wherever the figure shows; at the end it sat below a phone's fold */}
      {value.doubt && <DoubtCallout doubt={value.doubt} rules={value.doubtRules ?? []} from={value.doubtFrom} />}

      {/* why a figure is missing, once (`missingReason`); the working notes are English, and only a note written in Hebrew is shown */}
      {reason && <p className="text-sm">{reason}</p>}
      {/* a missing sourced figure: where it was looked for, and the rules that explain its absence ("אין", PF-06; a track too young) */}
      {missing && value.state === "sourced" && !blocked && !param && (
        <>
          <FigureSource value={value} data={data} strengthSaid={strengthSaid} />
          {chipRow && <dl className="sheet-dl">{chipRow}</dl>}
        </>
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
        <FigureSource value={value} data={data} strengthSaid={strengthSaid} />
        <dl className="sheet-dl">
          {year ? (
            <Row label={copy.sourced.forYear}>
              <bdi dir="ltr">{year}</bdi>
            </Row>
          ) : (
            <>
              {/* a figure not in force yet says its first day above, with what that means */}
              {value.effective_from && !fromDate && (
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
          {chipRow}
          {mostlyHebrew(value.notes) && <Row label=""><span className="text-sm text-muted-foreground"><IdText text={value.notes ?? ""} /></span></Row>}
        </dl>
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

      {weakOrOpen && <StrengthNote strength={weakOrOpen} question={blocked ? openQuestionOf(value) : null} />}
      {value.stale && <StaleLine stale={value.stale} />}

      <AllRulesLink value={value} data={data} />
    </div>
  );
}

// ---------------------------------------------------------------- rule card

/** A figure's Hebrew name when the record has one; else its key as written. */
function figureLabel(rule: RuleRecord, name: string, className = "text-xs"): ReactNode {
  return rule.figure_names_he?.[name] ? <span className={className}>{rule.figure_names_he[name]}</span> : <bdi dir="ltr" className={className}>{name}</bdi>;
}

/** A rule figure's head line in its sheet: its Hebrew name, with the tax year of a figure by year; nothing where the record names it in English only. */
function aboutOf(rule: RuleRecord, name: string, year?: string | null): { about?: string } {
  const he = rule.figure_names_he?.[name];
  return he ? { about: year ? `${he} ${year}` : he } : {};
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
          // a bracket's edges and its rates are updated each by its own rule (TXG-02: the edges frozen in 2025–2027, the rates fixed in
          // law): the first row says each under its own figure, the edge's under the edge and the rate's under the rate
          if (Array.isArray(f))
            return f.map((b, i) => {
              const edge = i === 0 && b.up_to.value !== null;
              return (
                <div key={`${name}-${i}`} className="readout-row">
                  <dt>
                    {figureLabel(rule, name)} {b.up_to.value === null ? "" : "≤"} {b.up_to.value !== null && <Num value={pageValue({ ...b.up_to, rule_ids: b.up_to.rule_ids ?? [id], ...aboutOf(rule, name) })} />}
                    {i === 0 && <FigureNote v={edge ? b.up_to : b.rate} labelYear={null} />}
                  </dt>
                  <dd>
                    <Num value={pageValue({ ...b.rate, rule_ids: b.rate.rule_ids ?? [id], ...aboutOf(rule, name) })} />
                    {unitSuffix(b.rate.unit)}
                    {edge && b.rate.update_rule !== b.up_to.update_rule && <FigureNote v={{ update_rule: b.rate.update_rule }} labelYear={null} />}
                  </dd>
                </div>
              );
            });
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
                {/* one or two years or months in words ("שנה"), never "1 שנים" */}
                <Num value={pageValue({ ...v, rule_ids: v.rule_ids ?? [id], ...aboutOf(rule, name, year) })} {...(spanWords(v.value, v.unit) ? { display: spanWords(v.value, v.unit)! } : {})} />
                {spanWords(v.value, v.unit) ? null : unitSuffix(v.unit)}
              </dd>
            </div>
          ));
        })}
      </dl>
    </div>
  );
}

function ShownRuleTitle({ rule, slots }: { rule: RuleRecord; slots: SlotSource }) {
  const t = ruleTitle(rule, slots);
  return t.english ? <bdi dir="ltr">{t.text}</bdi> : <>{t.text}</>;
}

/** The card of a rule that has no record (none in data/rules, or none the page holds or has the head of): its code, and that its text is not written. */
function NoRecordCard({ id, headId }: { id: string; headId?: string }) {
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

/**
 * A rule card's heading: "id · title" (D25), or an open question's words before its code, then who it applies to and a weak source's
 * strength. The same element on the card and while the card's file is on its way (`CardOnWay`), so the heading stays put when the body
 * comes. While the body is on its way it holds nothing to act on, so the heading takes the focus a new view in the sheet gives
 * (`data-autofocus`), and keeps it as the body comes.
 */
function RuleCardHead({ id, rule, title, data, headId, waiting }: { id: string; rule: Pick<RuleRecord, "id" | "strength" | "scope" | "scope_institutions">; title: ReactNode; data: ProvenanceData; headId: string | undefined; waiting?: boolean }) {
  const open = rule.strength === "open";
  return (
    <header className="flex flex-col gap-1.5">
      <h2 id={headId} tabIndex={-1} data-autofocus={waiting || undefined} className="text-lg font-semibold leading-snug outline-none">
        {open && <>{ruleCopy.open.title} </>}
        <bdi dir="ltr" className="slashed-zero">{id}</bdi>
        {!open && " · "}
        {!open && title}
      </h2>
      {/* who it applies to (D30): a neutral label, never a warning; the strength tag stays only for an open or second-hand source, or a general rule read from a company's document */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag tone="neutral" wrap>{scopeTag(rule, data.ownDocs, { company: data.company })}</Tag>
        {/* a record the rule base keeps that is not a rule says so, general or not: its foot leads to "לא נכלל ככלל" on /companies */}
        {isNotRule(id) && <Tag tone="neutral">{scopeWords.notRule.tag}</Tag>}
        {/* an open record's heading already says it is an open question */}
        {(rule.strength === "secondary" || (rule.strength === "institution" && rule.scope === "general")) && <StrengthLabel strength={rule.strength} />}
      </div>
    </header>
  );
}

/**
 * In the body's place, while a card's file is on its way (`fetchCard`) or after its fetch failed: a quiet "טוען…", or that it did not
 * load and a retry. It holds a few lines' room, so the card does not jump when the body comes.
 */
function CardOnWay({ id, fetched }: { id: string; fetched: CardFetch | undefined }) {
  return fetched?.kind === "failed" ? (
    <div className="flex min-h-24 flex-col items-start gap-1">
      <p role="status" className="text-sm">
        {ruleCopy.loadFailed}
      </p>
      <Button variant="quiet" flush size="sm" onClick={() => void fetchCard(id)}>
        {ruleCopy.retry}
      </Button>
    </div>
  ) : (
    <p role="status" className="min-h-24 text-sm text-muted-foreground">
      {system.loading}
    </p>
  );
}

export function RuleCard({ id, data, headId, inline }: { id: string; data: ProvenanceData; headId?: string; inline?: boolean }) {
  const record = ruleOf(data, id);
  // a rule the page ships only the head of: its card comes from its own file, fetched as it opens; once the file is in, the sheet's data
  // holds the record (`withFetched`)
  const head = record ? undefined : data.heads?.[id];
  const fetched = useCardFile(head ? id : null);
  // on a company's page only that company's part of the record (D30): its name, its own documents, the law and the regulator, its figures
  const page = data.pageCompanies ?? (data.company ? [data.company] : []);
  if (!record) {
    if (!head) return <NoRecordCard id={id} headId={headId} />;
    // the heading the card will have, from the rule's head, with the title its chip shows and the page's companies its record will name
    // (`pageScope`): the same root and heading as the card below, so both stay in place as the body comes
    const title = head.title.english ? <bdi dir="ltr">{head.title.text}</bdi> : head.title.text;
    return (
      <div data-code-ok data-opens-scope data-opens={id} className={cx("flex-1 flex flex-col gap-3", head.strength === "open" && "rule-open")}>
        <RuleCardHead id={id} rule={pageScope(head, page)} title={title} data={data} headId={headId} waiting />
        <CardOnWay id={id} fetched={fetched} />
      </div>
    );
  }
  const rule = pageView(record, page, data.companies);
  // the text's slots, its shown title and its citation read the card's own view of the record, so none names a figure the card hides
  const slots: SlotSource = { ...data, rules: { ...data.rules, [id]: rule } };
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
    // a figure of the card opens no chip of the card's own rule (`opensAround`)
    <div data-code-ok data-opens-scope data-opens={id} className={cx("flex-1 flex flex-col gap-3", open && "rule-open")}>
      <RuleCardHead id={id} rule={rule} title={<ShownRuleTitle rule={rule} slots={slots} />} data={data} headId={headId} />
      {open ? (
        <Callout tone="blocked">
          <span className="block">
            <ShownRuleTitle rule={rule} slots={slots} />
          </span>
          {rule.text_he && (
            <span className="block">
              <SlottedText text={rule.text_he} source={slots} />
            </span>
          )}
          {/* only where the page knows the calculation does not read the record (TXF-04's text says what the site computes meanwhile) */}
          {uses && !uses.engine && <span className="block">{ruleCopy.open.last}</span>}
        </Callout>
      ) : rule.text_he ? (
        // its figure slots read the card's own view of the record and the records it points at (`pointedIds`)
        <p className="text-sm">
          <SlottedText text={rule.text_he} source={slots} />
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
      )}
      {/* the text's sources right under it, then who it applies to and the rules it points to */}
      {sources.length > 0 ? (
        // a company's term read from that company's own document is its own context (D31): the source line carries no "לפי החברה"
        <SourceBlock source={sources} rule={sourced} today={data.today} inline={inline} own={rule.scope === "institution" ? (s) => isOwnSourceOf(rule, s, data.ownDocs, data.companies) : false} />
      ) : (
        // rule records without a source link are shown as such, not hidden
        <p className="text-sm text-muted-foreground">{ruleCopy.sourceMissing}</p>
      )}
      {!isGeneral(rule) && <p className="text-sm text-muted-foreground">{scopeLine(rule, data.ownDocs, tagCompanies(rule, data.ownDocs, { company: data.company }))}</p>}
      <RulePointers rule={rule} />
      <RuleFigures rule={rule} id={id} pageValue={pageValue} />
      <dl className="sheet-dl">
        {/* each source line says the day the site read it; the record's own date stands only on a card with no source */}
        {sources.length === 0 && (
          <Row label={ruleCopy.checked}>
            <When iso={rule.checked} />
          </Row>
        )}
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
        {sources[0] && <CitationBox text={citationText(sourced, sources[0], sources[0].checked, slots)} />}
        {!inline && <CardFoot rule={rule} data={data} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the rules page's detail and top match

/**
 * "ראו גם:" and the rules the record's Source line points to (`derived_from`: the general rule a company's term sits under, a rule read
 * the same way), each beside the record's own sources, so the words claim no derivation; "לדוגמה:" and a general rule's named examples
 * at companies.
 */
function RulePointers({ rule }: { rule: RuleRecord }) {
  const derived = asSourced(rule).derived_from ?? [];
  const examples = rule.examples ?? [];
  return (
    <>
      {derived.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ruleCardMore.seeAlso}</span>
          {derived.map((d) => <RuleRef key={d} id={d} />)}
        </p>
      )}
      {examples.length > 0 && (
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{ruleCardMore.examples}</span>
          {examples.map((d) => <RuleRef key={d} id={d} />)}
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
    <Button variant="quiet" flush size="sm" gap="sm" className="ms-auto" onClick={() => void copy()} aria-live="polite">
      {copied ? <IconCheck size={14} className="text-positive" /> : <IconCopy size={14} />}
      <span className={copied ? "text-positive" : undefined}>{copied ? sourceCopy.citation.copied : ruleCardMore.copyCitation}</span>
    </Button>
  );
}

/** A rule's sources by document: one block per address (its names, its PDF tag), each cited place in it on its own line with its quoted words, then when it was read and the document's copy button. */
function SourcesByDocument({ sources, rule, slots }: { sources: readonly RuleSource[]; rule: SourcedRule; /** The page's records and its day: a citation's title read from the text fills its slots. */ slots: SlotSource }) {
  const today = slots.today;
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
              <CopyCitation text={list.map((s) => citationText(rule, s, s.checked, slots)).join("\n")} />
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
    <article data-code-ok data-opens-scope data-opens={id} className={cx("flex flex-col gap-5 min-w-0 [overflow-wrap:anywhere]", open && "rule-open")}>
      <p className="text-xs-flow text-muted-foreground">
        <bdi dir="ltr" className="tabular-nums slashed-zero">{id}</bdi>
      </p>
      <header className="flex flex-col gap-2 -mt-3">
        <h2 id={headId} tabIndex={-1} className="text-xl font-semibold leading-snug outline-none">
          {open && <>{ruleCopy.open.title} </>}
          <ShownRuleTitle rule={rule} slots={data} />
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {products.map((p) => (
            <Tag key={p} tone="neutral">{gershayim(p)}</Tag>
          ))}
          {/* who it applies to: shown only when it is not every case (D30) */}
          {!isGeneral(rule) && <Tag tone="neutral" wrap>{scopeTag(rule, data.ownDocs)}</Tag>}
          {isNotRule(id) && <Tag tone="neutral">{scopeWords.notRule.tag}</Tag>}
          {/* an open record's heading already says it is an open question */}
          {(rule.strength === "secondary" || (rule.strength === "institution" && rule.scope === "general")) && <StrengthLabel strength={rule.strength} />}
        </div>
      </header>
      {open ? (
        <Callout tone="blocked">
          {rule.text_he && (
            <span className="block">
              <SlottedText text={rule.text_he} source={data} />
            </span>
          )}
          {uses && !uses.engine && <span className="block">{ruleCopy.open.last}</span>}
        </Callout>
      ) : rule.text_he ? (
        <p className="text-base leading-relaxed">
          <SlottedText text={rule.text_he} source={data} />
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{ruleCopy.noText}</p>
      )}
      {!isGeneral(rule) && <p className="text-sm text-muted-foreground">{scopeLine(rule, data.ownDocs, tagCompanies(rule, data.ownDocs))}</p>}
      <RulePointers rule={rule} />
      <RuleFigures rule={rule} id={id} head={<GroupHead>{ruleCopy.figures}</GroupHead>} />
      {sources.length > 0 ? <SourcesByDocument sources={sources} rule={sourced} slots={data} /> : <p className="text-sm text-muted-foreground">{ruleCopy.sourceMissing}</p>}
      {(dims.length > 0 || uses || sources.length === 0 || rule.recheck_date) && (
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
        {/* each document says the day the site read it; the record's own date stands only on a rule with no source */}
        {sources.length === 0 ? (
          <Row label={ruleCopy.checked}>
            <span className="text-sm flex flex-wrap gap-x-2">
              <When iso={rule.checked} />
              {rule.recheck_date ? (
                <span className={recheckStale(rule, data.today) ? "text-caution-foreground" : "text-muted-foreground"}>
                  · <When iso={rule.recheck_date} lead={`${ruleCopy.recheck} `} />
                </span>
              ) : rule.likely_to_change === "no" ? (
                <span className="text-muted-foreground">· {ruleCardMore.stable}</span>
              ) : null}
            </span>
          </Row>
        ) : (
          rule.recheck_date && (
            <Row label={ruleCopy.recheck}>
              {/* the caution colour only once the date has passed, as on the rule card */}
              <span className={cx("text-sm", recheckStale(rule, data.today) ? "text-caution-foreground" : "text-muted-foreground")}>
                <When iso={rule.recheck_date} />
              </span>
            </Row>
          )
        )}
      </dl>
      )}
      {sources.length > 0 && !rule.recheck_date && rule.likely_to_change === "no" && <p className="text-xs text-muted-foreground">{ruleCardMore.stable}</p>}
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
    <Card edge="accent" pad="tight" className="flex flex-col gap-3" data-opens-scope data-opens={id}>
      <span className="text-xs-flow font-medium text-primary">{label}</span>
      <h3 className="text-lg font-semibold leading-snug -mt-1">
        <button type="button" onClick={onOpen} className="text-start hover:underline">
          <ShownRuleTitle rule={rule} slots={data} />
        </button>
      </h3>
      {figures.length > 0 ? (
        <StatRow cols={2}>
          {figures.map(({ key, value }) => (
            <div key={key} className="flex flex-col gap-0.5 min-w-0">
              <dd className="order-1 flex items-baseline gap-1.5">
                <span className="figure">
                  <Num value={{ ...value, rule_ids: value.rule_ids ?? [id], ...aboutOf(rule, key) }} size="figure" />
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
        <p className="text-xs-flow text-muted-foreground">
          <SourceNames parts={parts} hebrewTitle={isHebrewTitle(sourceLabel2(first).title)} /> · {sourceCopy.checked} <Iso ltr>{fmt.date(first.checked)}</Iso>
        </p>
      )}
    </Card>
  );
}

/**
 * "נמצא במסמכים של …; בחברות אחרות זה יכול להיות אחרת." for a company's term, naming only the companies whose own documents it cites,
 * and only "בחברות אחרות…" when the card's tag (`tagged`, `tagCompanies`) already names those same companies; the unsettled line for a rule not shown to hold everywhere; "המקורות כאן אינם מסמכים של …" for a record about companies that cites
 * none of their documents. A not-rule that cites a company's document says it is
 * kept, not shown as a rule, so its line agrees with its foot ("לכל מה שלא נכלל ככלל").
 */
function scopeLine(rule: RuleRecord, ownDocs: OwnDocs | undefined, tagged: readonly { id: string }[]): string {
  const ownList = ownDocCompanies(rule, ownDocs);
  const own = joinNames(ownList.map((c) => c.name_he));
  const named = joinNames(scopeCompanies(rule).map((c) => c.name_he));
  if (own && isNotRule(rule.id)) return scopeWords.notRule.lineOwn.replace("{names}", own);
  if (rule.scope === "institution") return !own ? scopeWords.line.notTheirs.replace("{names}", named) : sameCompanies(tagged, ownList) ? scopeWords.line.institutionTagged : scopeWords.line.institution.replace("{names}", own);
  return own ? scopeWords.line.unsettledSeen.replace("{names}", own) : scopeWords.line.unsettled;
}

/**
 * Where to read on (spec §4): a general rule to the rules page, filtered to the page's product when there is one; a company's term to
 * everything found at each company whose section lists it (one link per company), and a record no section lists (a not-rule) to its
 * group on /companies.
 */
/** An address without its fragment and its trailing slash: the page it opens. */
const pageOfHref = (href: string): string => (href.split("#")[0] ?? "").replace(/(.)\/$/, "$1");

/** The card's foot: where the record is listed. A link to the page the card is open on is left out, and two links to one place are one. */
function CardFoot({ rule, data }: { rule: RuleRecord; data: ProvenanceData }) {
  const close = useContext(CloseCtx);
  const here = pageOfHref(useLocation().pathname);
  const elsewhere = (href: string) => pageOfHref(href) !== here;
  if (isGeneral(rule)) {
    const to = data.rulesOf ? `${data.rulesOf.href}#${rule.id}` : rulesPath({ hash: rule.id });
    if (!elsewhere(to)) return null;
    return data.rulesOf ? <LinkButton to={to} onClick={close}>{scopeWords.rulesOf.replace("{product}", data.rulesOf.name)}</LinkButton> : <LinkButton to={to} onClick={close}>{ruleCopy.all}</LinkButton>;
  }
  const listed = companyLinksOf(listedCompanies(rule, data.ownDocs), data.companies).map((c) => ({ name: c.name, href: c.hasPage ? `${c.href}#${rule.id}` : c.href }));
  const links = listed.filter((l, i) => elsewhere(l.href) && listed.findIndex((x) => x.href === l.href) === i);
  if (listed.length > 0 && links.length === 0) return null;
  if (links.length === 0) return elsewhere(documentsPath({ hash: noCompanyAnchor })) ? <LinkButton to={documentsPath({ hash: noCompanyAnchor })} onClick={close}>{scopeWords.allNoCompany}</LinkButton> : null;
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
      className="group flex items-center gap-2 w-full min-h-10 tap-area px-3 rounded-md border border-border bg-background text-xs text-start hover:border-input transition-colors duration-(--duration-fast)"
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
        </dl>
      )}
      {/* a weak source says so in its tag, as on a rule card; a primary one needs no word, and no row with an empty label */}
      {term.source && term.source.strength !== "primary" && (
        <div className="flex flex-wrap items-center gap-1.5">
          <StrengthLabel strength={term.source.strength} />
        </div>
      )}
      {/* a definition rests on general rules only (D30): a company's term the glossary row cites is on that company's page; the rules are
          a list whose rows are the rules, each by its title (D116), and only those whose record the page holds (a row whose rule has no
          record anywhere would open an empty card) */}
      <RuleTitleList ids={generalOnly(term.ruleIds.filter((r) => headOf(data, r)), { ...data.heads, ...data.pointed, ...data.rules })} />
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
      {p.question && <> <IdRef id={p.question} /></>}
    </p>
    {p.doc && <DocLink href={p.doc.href}>{p.doc.title}</DocLink>}
  </div>
);

function TermsSheet({ ids, name, lead, rules, parts, data, headId }: { ids: readonly string[]; name: string; lead?: string; rules?: readonly string[] | undefined; parts?: readonly SheetPart[] | undefined; data: ProvenanceData; headId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {name}
        </h2>
        {/* an open question named in the text ("… שאלה פתוחה CS OQ9") is its chip, as in a value's note */}
        {lead && <p className="text-muted-foreground"><IdText text={lead} /></p>}
      </div>
      {/* the rules the text rests on, under it: a list whose rows are the rules, each by its title (D116) */}
      {rules && <RuleTitleList ids={rules} />}
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

