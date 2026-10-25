// The documents page (research/knowledge/2026-10-24-synthesis.md §3.5): the documents the rules were read from, one card
// each with the rules that rest on it, then the data records the site read, each pointing at the page that uses it.
import { Link, useLoaderData } from "react-router";
import { documents as copy, site } from "../copy";
import { IconExternal } from "../components/icons";
import { Num, NumberLegend, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, cx, Disclosure, Sentence } from "../components/kit";
import { fmt } from "../lib/format";
import type { DocumentCard, SectionId } from "../lib/documents.server";
import { isPdfUrl } from "../lib/sources";

/** The five sections in order (duplicated from the server module, which the client bundle must not import). */
const sectionOrder: readonly SectionId[] = ["laws", "regulators", "exchange", "institutions", "secondary"] as const;

export async function loader() {
  const { today } = await import("../lib/data.server");
  const { loadDocuments, loadDocumentData } = await import("../lib/documents.server");
  // the rule links open the rule on its shelf page, so the page carries no rule records (the chips of 500 rules made it 2 MB)
  const docs = loadDocuments();
  return { docs, data: await loadDocumentData(), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const firstRules = 6;

function Latin({ text, english }: { text: string; english: boolean }) {
  return english ? <bdi dir="ltr">{text}</bdi> : <bdi>{text}</bdi>;
}

function DocCard({ doc }: { doc: DocumentCard }) {
  const shown = doc.rules.slice(0, firstRules);
  const rest = doc.rules.slice(firstRules);
  const chip = (r: { id: string; title: string; href: string }) => (
    <li key={r.id} className="min-w-0">
      <Link to={r.href} className="inline-flex items-center gap-1.5 min-h-target hover:underline">
        <bdi dir="ltr" className="rule-chip">{r.id}</bdi>
        <span className="text-sm text-muted-foreground">{r.title}</span>
      </Link>
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
        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary underline underline-offset-4 min-h-target">
          {copy.open}
          {isPdfUrl(doc.url) && <span className="text-xs font-medium rounded-sm bg-muted text-foreground px-1.5">PDF</span>}
          <IconExternal size={16} className="shrink-0" />
        </a>
        {doc.strength !== "primary" && <StrengthLabel strength={doc.strength} />}
      </p>
      {doc.checked && (
        <p className="text-sm text-muted-foreground">
          {copy.checked} <bdi dir="ltr" className="tabular-nums">{fmt.date(doc.checked)}</bdi>
        </p>
      )}
      {doc.rules.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{copy.rulesLead}</p>
          <ul className="flex flex-col gap-1">{shown.map(chip)}</ul>
          {rest.length > 0 && (
            <Disclosure label={copy.rulesMore.replace("{n}", fmt.number(rest.length))} openLabel={copy.rulesMore.replace("{n}", fmt.number(rest.length))} summaryClassName="text-sm text-primary">
              <ul className="flex flex-col gap-1">{rest.map(chip)}</ul>
            </Disclosure>
          )}
        </div>
      )}
    </Card>
  );
}

/** A collapsible group like the rules page; the first starts open, a closed one paints nothing. */
function Group({ id, title, open, children }: { id: string; title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <Disclosure id={id} defaultOpen={open} className="scroll-mt-[112px] lg:scroll-mt-[88px] flex flex-col" spread size="field" as="h2" labelClassName="text-xl lg:text-2xl font-semibold" label={title}>
      {children}
    </Disclosure>
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

export default function Documents() {
  const { docs, data, today } = useLoaderData<typeof loader>();
  const pd = { rules: {}, terms: {}, dimensions: {}, today };
  const d = copy.data;
  return (
    <PageShell current="other" data={pd}>
      <div className="flex flex-col gap-6 lg:gap-8 pt-2 lg:pt-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <NumberLegend />
        </header>
        <div className="flex flex-col gap-3">
          {sectionOrder.map((sec, i) => {
            const list = docs.filter((x) => x.section === sec);
            if (list.length === 0) return null;
            const cards = list.filter((x) => x.featured);
            const rows = list.filter((x) => !x.featured);
            return (
              <Group key={sec} id={sec} title={copy.sections[sec]} open={i === 0}>
                <ul className="grid gap-4 lg:grid-cols-2 pt-2">
                  {cards.map((doc) => (
                    <DocCard key={doc.key} doc={doc} />
                  ))}
                </ul>
                {rows.length > 0 && (
                  <Disclosure label={rows.length === 1 ? copy.more.one : copy.more.many.replace("{n}", fmt.number(rows.length))} className="pt-3" summaryClassName="text-sm text-primary">
                    <p className="text-sm text-muted-foreground max-w-measure pb-2">{copy.more.line}</p>
                    <ul className="flex flex-col">
                      {rows.map((doc) => (
                        <li key={doc.key} id={doc.key} className="scroll-mt-[112px] flex flex-wrap items-center gap-x-2 gap-y-0.5 py-2 border-b border-border text-sm min-w-0 [overflow-wrap:anywhere]">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4 min-h-target">
                            <Latin text={doc.title} english={doc.titleEnglish} />
                            <IconExternal size={14} className="shrink-0" />
                          </a>
                          <span className="text-muted-foreground">
                            <bdi>{doc.publisher}</bdi>
                          </span>
                          <span className="text-muted-foreground">
                            {doc.rules.map((r, k) => (
                              <span key={r.id}>
                                {k > 0 && ", "}
                                <Link to={r.href} className="hover:underline">
                                  <bdi dir="ltr">{r.id}</bdi>
                                </Link>
                              </span>
                            ))}
                          </span>
                          {doc.strength !== "primary" && <StrengthLabel strength={doc.strength} />}
                        </li>
                      ))}
                    </ul>
                  </Disclosure>
                )}
              </Group>
            );
          })}
        </div>

        <header className="flex flex-col gap-2 pt-4">
          <h2 className="text-xl lg:text-2xl font-semibold">{d.title}</h2>
          <p className="text-base text-muted-foreground max-w-measure">{d.lede}</p>
        </header>
        <div className="flex flex-col gap-3">
          <Group id="data-tariffs" title={d.tariffs}>
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.tariffs.map((t) => (
                <Card as="li" key={t.key} id={`tariff-${t.key}`} className="scroll-mt-[112px] flex flex-col gap-1 min-w-0">
                  <h3 className="text-lg font-semibold">{d.tariffLine.replace("{provider}", t.title)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.missing ? d.missing : t.date ? <bdi dir="ltr" className="tabular-nums">{fmt.date(t.date)}</bdi> : d.noPrintedDate}
                    {!t.missing && !!t.lines && <> · <bdi dir="ltr" className="tabular-nums">{fmt.number(t.lines ?? 0)}</bdi>{d.linesAfter}</>}
                  </p>
                  <DataLink href={t.href} />
                </Card>
              ))}
            </ul>
          </Group>
          <Group id="data-funds" title={d.funds}>
            <p className="text-sm text-muted-foreground max-w-measure pt-1">{d.fundsLine}</p>
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.funds.map((f) => (
                <Card as="li" key={f.key} className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-lg font-semibold"><bdi>{f.title}</bdi></h3>
                  <p className="text-sm text-muted-foreground"><bdi>{f.line}</bdi></p>
                  <DataLink href={f.href} />
                </Card>
              ))}
            </ul>
          </Group>
          <Group id="data-deposits" title={d.deposits}>
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.deposits.map((x) => (
                <Card as="li" key={x.key} className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-lg font-semibold"><bdi>{x.title}</bdi></h3>
                  <p className="text-sm text-muted-foreground"><bdi>{x.line}</bdi></p>
                  <DataLink href={x.href} />
                </Card>
              ))}
            </ul>
          </Group>
          <Group id="data-series" title={d.series}>
            <ul className="grid gap-4 lg:grid-cols-2 pt-2">
              {data.series.map((s) => (
                <Card as="li" key={s.key} className="flex flex-col gap-1 min-w-0 [overflow-wrap:anywhere]">
                  <h3 className="text-lg font-semibold"><bdi>{s.title}</bdi></h3>
                  {s.valueDate && (
                    <Sentence size="sm" tone="muted">
                      {s.value ? <>{d.latest}: <Num value={s.value} /> </> : <>{copy.checked} </>}
                      <bdi dir="ltr" className="tabular-nums">{s.value ? `(${fmt.date(s.valueDate)})` : fmt.date(s.valueDate)}</bdi>
                    </Sentence>
                  )}
                  {s.attribution && <p className={cx("text-xs text-muted-foreground")}><bdi>{s.attribution}</bdi></p>}
                </Card>
              ))}
            </ul>
          </Group>
          <Group id="data-datasets" title={d.datasets}>
            <Card className="mt-2 flex flex-col gap-1">
              <p className="text-sm text-muted-foreground max-w-measure">{d.datasetsLine}</p>
              <DataLink href={data.datasetsHref} />
            </Card>
          </Group>
        </div>
      </div>
    </PageShell>
  );
}
