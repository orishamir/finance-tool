// The documents page (8dd1f013:research/knowledge/2026-10-24-synthesis.md §3.5): the documents the rules were read from, one card
// each with the rules that rest on it, then the data records the site read, each pointing at the page that uses it.
// Every kind of document and every kind of data starts folded, its head with its count. A folded group draws nothing, and the documents'
// cards are not in the page's first HTML: they come from /documents-data.json when a kind of document is opened, or when the address
// names a document (a rule's card, the search), which opens its group, and the fold of the short rows if it is one of them, and scrolls to it.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import { documents as copy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { IconExternal } from "../components/icons";
import { Num, NumberLegend, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { NoPageCompanyTerms } from "../components/decoder/company-terms";
import { Card, cx, Disclosure, FoldGroup, gershayim, MixedName, Sentence, TariffDate, When } from "../components/kit";
import { fmt } from "../lib/format";
import type { DocumentCard, DocumentSection } from "../lib/documents.server";
import { isPdfUrl, sourceHref } from "../lib/sources";

export async function loader() {
  const { today, loadChecklistRows, loadRules, pointedRecords } = await import("../lib/data.server");
  const { loadDocuments, loadDocumentData, documentSections } = await import("../lib/documents.server");
  const { noPageCompanyTerms } = await import("../lib/institutions.server");
  // the rule links open the rule on its shelf page, so the page carries no rule records (the chips of 500 rules made it 2 MB), except the
  // cards of what the documents of companies with no page of their own say, and of what the site keeps that is not a rule
  const all = loadRules();
  const noPage = noPageCompanyTerms(all);
  const rules = Object.fromEntries([...noPage.companies.flatMap((c) => c.ids), ...noPage.none].map((id) => [id, all[id]!]));
  return { sections: documentSections(loadDocuments()), data: await loadDocumentData(), today: today(), noPage, rules, pointed: pointedRecords(rules, all), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) };
}

/** The documents' cards, fetched once for the page (the first group opened, or a document the address names). */
let docsOnce: Promise<DocumentCard[]> | null = null;
function fetchDocs(): Promise<DocumentCard[]> {
  docsOnce ??= fetch(`${import.meta.env.BASE_URL}documents-data.json`).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json() as Promise<DocumentCard[]>;
  });
  docsOnce.catch(() => (docsOnce = null));
  return docsOnce;
}

/** The documents, once a group needs them: `null` while they load, `"failed"` if they could not. */
function useDocs(wanted: boolean): DocumentCard[] | null | "failed" {
  const [docs, setDocs] = useState<DocumentCard[] | null | "failed">(null);
  useEffect(() => {
    if (!wanted || (docs && docs !== "failed")) return;
    let live = true;
    fetchDocs().then(
      (d) => live && setDocs(d),
      () => live && setDocs("failed"),
    );
    return () => {
      live = false;
    };
  }, [wanted, docs]);
  return docs;
}

/** The data groups' anchors: a group's own id, and the cards inside it a link may name. */
const dataGroups = ["data-tariffs", "data-funds", "data-deposits", "data-series", "data-datasets"] as const;

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

const firstRules = 6;

function Latin({ text, english }: { text: string; english: boolean }) {
  return english ? <bdi dir="ltr">{text}</bdi> : <bdi>{text}</bdi>;
}

/** A rule that rests on a document: its title is the link to the rule; the code stays in the rule's card. */
function RuleLink({ rule }: { rule: DocumentCard["rules"][number] }) {
  return (
    <Link to={rule.href} className="flex items-center min-h-target text-sm text-link hover:underline">
      <bdi>{gershayim(rule.title)}</bdi>
    </Link>
  );
}

function DocCard({ doc }: { doc: DocumentCard }) {
  const shown = doc.rules.slice(0, firstRules);
  const rest = doc.rules.slice(firstRules);
  const chip = (r: DocumentCard["rules"][number]) => (
    <li key={r.id} className="min-w-0">
      <RuleLink rule={r} />
    </li>
  );
  return (
    <Card as="li" id={doc.key} className="scroll-mt-[112px] lg:scroll-mt-[88px] min-w-0 [overflow-wrap:anywhere] flex flex-col gap-2">
      <h3 className="text-lg font-semibold">
        <Latin text={doc.title} english={doc.titleEnglish} />
      </h3>
      <p className="text-sm text-muted-foreground">
        <bdi>{doc.publisher}</bdi> · {copy.kinds[doc.kind] ?? copy.kinds.other}
      </p>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={sourceHref(doc)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 min-h-target">
          {copy.open}
          {isPdfUrl(doc.url) && <span className="text-xs font-medium rounded-sm bg-muted text-foreground px-1.5">PDF</span>}
          <IconExternal size={16} className="shrink-0" />
        </a>
        {doc.strength !== "primary" && <StrengthLabel strength={doc.strength} />}
      </p>
      {doc.checked && (
        <p className="text-sm text-muted-foreground">
          <When iso={doc.checked} lead={`${copy.checked} `} />
        </p>
      )}
      {doc.rules.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{copy.rulesLead}</p>
          <ul className="flex flex-col">{shown.map(chip)}</ul>
          {rest.length > 0 && (
            <Disclosure label={copy.rulesMore.replace("{n}", fmt.number(rest.length))} openLabel={copy.rulesMore.replace("{n}", fmt.number(rest.length))} summaryClassName="text-sm text-primary">
              <ul className="flex flex-col">{rest.map(chip)}</ul>
            </Disclosure>
          )}
        </div>
      )}
    </Card>
  );
}

/** A kind of document or of data, folded until opened, its head with its count; a folded group draws nothing. */
function Group({ id, title, count, level, open, onOpen, children }: { id: string; title: string; count?: number; level: 2 | 3; open: boolean; onOpen: (open: boolean) => void; children: () => ReactNode }) {
  return (
    <FoldGroup id={id} variant="section" level={level} title={title} count={count} open={open} onOpenChange={onOpen} className="scroll-mt-[112px] lg:scroll-mt-[88px]">
      {open && children()}
    </FoldGroup>
  );
}

function DataLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <Link to={href} className="text-primary underline underline-offset-4 min-h-target inline-flex items-center">
      {copy.data.toPage}
    </Link>
  );
}


/** The rows of a kind of document that only one or two rules rest on, under the group's second fold. */
function DocRows({ rows }: { rows: DocumentCard[] }) {
  return (
    <ul className="flex flex-col">
      {rows.map((doc) => (
        <li key={doc.key} id={doc.key} className="scroll-mt-[112px] flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2 border-b border-border text-sm min-w-0 [overflow-wrap:anywhere]">
          <a href={sourceHref(doc)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4 min-h-target">
            <Latin text={doc.title} english={doc.titleEnglish} />
            <IconExternal size={14} className="shrink-0" />
          </a>
          <span className="text-muted-foreground">
            <bdi>{doc.publisher}</bdi>
          </span>
          {doc.strength !== "primary" && <StrengthLabel strength={doc.strength} />}
          <ul className="basis-full flex flex-col">
            {doc.rules.map((r) => (
              <li key={r.id} className="min-w-0">
                <RuleLink rule={r} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** An open kind of document: its cards, then the fold of its short rows; a line while the cards load, or if they could not. */
function DocSection({ docs, section, moreOpen, onMore }: { docs: DocumentCard[] | null | "failed"; section: DocumentSection; moreOpen: boolean; onMore: (open: boolean) => void }) {
  if (docs === null) return <p className="text-sm text-muted-foreground py-3">{copy.loading}</p>;
  if (docs === "failed") return <p className="text-sm text-muted-foreground py-3">{copy.failed}</p>;
  const list = docs.filter((x) => x.section === section.id);
  const cards = list.filter((x) => x.featured);
  const rows = list.filter((x) => !x.featured);
  return (
    <>
      <ul className="grid gap-4 lg:grid-cols-2 pt-2">
        {cards.map((doc) => (
          <DocCard key={doc.key} doc={doc} />
        ))}
      </ul>
      {rows.length > 0 && (
        <Disclosure open={moreOpen} onOpenChange={onMore} label={rows.length === 1 ? copy.more.one : copy.more.many.replace("{n}", fmt.number(rows.length))} className="pt-3" summaryClassName="text-sm text-primary">
          <p className="text-sm text-muted-foreground max-w-measure pb-2">{copy.more.line}</p>
          {moreOpen && <DocRows rows={rows} />}
        </Disclosure>
      )}
    </>
  );
}

/** Which group an address's id opens, and whether it is one of the short rows: a group's own id, a document's, or a price list's card. */
function groupOf(id: string, sections: readonly DocumentSection[]): { group: string; more?: boolean } | null {
  if (!id) return null;
  for (const s of sections) {
    if (id === s.id || s.cards.includes(id)) return { group: s.id };
    if (s.rows.includes(id)) return { group: s.id, more: true };
  }
  if ((dataGroups as readonly string[]).includes(id)) return { group: id };
  if (id.startsWith("tariff-")) return { group: "data-tariffs" };
  return null;
}

export default function Documents() {
  const { sections, data, today, noPage, rules, pointed, dimensions } = useLoaderData<typeof loader>();
  const pd = { rules, pointed, terms: {}, dimensions, today };
  const d = copy.data;
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [more, setMore] = useState<ReadonlySet<string>>(() => new Set());
  const toggle = (set: typeof setOpen, key: string) => (now: boolean) =>
    set((o) => {
      if (o.has(key) === now) return o;
      const n = new Set(o);
      if (now) n.add(key);
      else n.delete(key);
      return n;
    });
  const docs = useDocs(sections.some((s) => open.has(s.id)));
  // the id the address names (a rule's card, the search, another page): its group opens, then the page scrolls to it once it is drawn
  const { hash } = useLocation();
  const target = useRef<string | null>(null);
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1));
    const at = groupOf(id, sections);
    if (!at) return;
    target.current = id;
    setOpen((o) => (o.has(at.group) ? o : new Set(o).add(at.group)));
    if (at.more) setMore((o) => (o.has(at.group) ? o : new Set(o).add(at.group)));
  }, [hash, sections]);
  useEffect(() => {
    const id = target.current;
    const el = id && document.getElementById(id);
    if (!el) return;
    target.current = null;
    // and again once the folds that opened have grown to their height
    const fold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--duration-fold")) || 0;
    requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    const later = window.setTimeout(() => el.scrollIntoView({ block: "start" }), fold + 60);
    return () => window.clearTimeout(later);
  }, [open, more, docs]);
  const dataGroup = (id: (typeof dataGroups)[number], title: string, count: number | undefined, body: () => ReactNode) => (
    <Group id={id} title={title} count={count} level={3} open={open.has(id)} onOpen={toggle(setOpen, id)}>
      {body}
    </Group>
  );
  return (
    <PageShell current="other" data={pd}>
      <div className="flex flex-col gap-6 lg:gap-8 pt-2 lg:pt-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <NumberLegend />
        </header>
        <div className="flex flex-col gap-3">
          {sections.map((sec) => (
            <Group key={sec.id} id={sec.id} title={copy.sections[sec.id]} count={sec.count} level={2} open={open.has(sec.id)} onOpen={toggle(setOpen, sec.id)}>
              {() => <DocSection docs={docs} section={sec} moreOpen={more.has(sec.id)} onMore={toggle(setMore, sec.id)} />}
            </Group>
          ))}
        </div>

        <div className="pt-4">
          <NoPageCompanyTerms companies={noPage.companies} none={noPage.none} />
        </div>

        <header className="flex flex-col gap-2 pt-4">
          <h2 className="text-xl lg:text-2xl font-semibold">{d.title}</h2>
          <p className="text-base text-muted-foreground max-w-measure">{d.lede}</p>
        </header>
        <div className="flex flex-col gap-3">
          {dataGroup("data-tariffs", d.tariffs, data.tariffs.length, () => (
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.tariffs.map((t) => (
                <Card as="li" key={t.key} id={`tariff-${t.key}`} className="scroll-mt-[112px] flex flex-col gap-1 min-w-0">
                  <h4 className="text-lg font-semibold">{d.tariffLine.replace("{provider}", t.title)}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.missing ? d.missing : <TariffDate dated={t.dated} titled />}
                    {!t.missing && !!t.lines && <> · <bdi dir="ltr" className="tabular-nums">{fmt.number(t.lines ?? 0)}</bdi>{d.linesAfter}</>}
                  </p>
                  <DataLink href={t.href} />
                </Card>
              ))}
            </ul>
          ))}
          {dataGroup("data-funds", d.funds, data.funds.length, () => (
            <>
              <p className="text-sm text-muted-foreground max-w-measure pt-1">{d.fundsLine}</p>
              <ul className="grid gap-4 lg:grid-cols-2 pt-2">
                {data.funds.map((f) => (
                  <Card as="li" key={f.key} className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-lg font-semibold"><bdi>{f.title}</bdi></h4>
                    <p className="text-sm text-muted-foreground"><bdi>{f.line}</bdi></p>
                    <DataLink href={f.href} />
                  </Card>
                ))}
              </ul>
            </>
          ))}
          {dataGroup("data-deposits", d.deposits, data.deposits.length, () => (
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.deposits.map((x) => (
                <Card as="li" key={x.key} className="flex flex-col gap-1 min-w-0">
                  <h4 className="text-lg font-semibold"><MixedName>{x.title}</MixedName></h4>
                  <p className="text-sm text-muted-foreground"><MixedName>{x.line ?? ""}</MixedName></p>
                  <DataLink href={x.href} />
                </Card>
              ))}
            </ul>
          ))}
          {dataGroup("data-series", d.series, data.series.length, () => (
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.series.map((s) => (
                <Card as="li" key={s.key} className="flex flex-col gap-1 min-w-0 [overflow-wrap:anywhere]">
                  <h4 className="text-lg font-semibold"><bdi>{s.title}</bdi></h4>
                  {s.valueDate && (
                    <Sentence size="sm" tone="muted">
                      {s.value ? <>{d.latest}: <Num value={s.value} /> </> : <>{copy.checked} </>}
                      {s.value ? <>(<When iso={s.valueDate} />)</> : <When iso={s.valueDate} />}
                    </Sentence>
                  )}
                  {s.attribution && <p className={cx("text-xs text-muted-foreground")}><bdi>{s.attribution}</bdi></p>}
                </Card>
              ))}
            </ul>
          ))}
          {/* one card that points at the regulator's lists, not a list of its own: no count */}
          {dataGroup("data-datasets", d.datasets, undefined, () => (
            <Card className="mt-2 flex flex-col gap-1">
              <p className="text-sm text-muted-foreground max-w-measure">{d.datasetsLine}</p>
              <DataLink href={data.datasetsHref} />
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
