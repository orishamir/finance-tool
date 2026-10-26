// Screen 4: the company page (design-spec 5 as redrawn 2026-10-23; flows 6.11): every track the company
// runs, grouped by the regulator's product type, same-name tracks grouped, the fee-pending note, the paste card.
import { useId } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/company";
import { catalogue, companies as companiesCopy, company as copy, r3workbench, site } from "../copy";
import { feeLabel } from "../components/decoder/fees";
import { groupTracks, PasteCard, TrackList } from "../components/decoder/tracks";
import { InstitutionPage } from "../components/decoder/institutions/page";
import { CompanyTerms } from "../components/decoder/company-terms";
import { IconDrillIn } from "../components/icons";
import { NumAfter, NumberLegend } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { FitProvider } from "../components/compare/fit";
import { SavedGoalStrip } from "../components/compare/strip";
import { Callout, Card, Disclosure } from "../components/kit";
import { GoalsProvider, type Presets } from "../lib/goal";
import { fit as fitCopy } from "../copy";
import type { SiteValue } from "../lib/value";
import { fmt } from "../lib/format";
import { cmaFeeValue, compactFee, expandFee, feeYear, type CompactFee } from "../lib/value";

const classificationOrder = ["קופת גמל להשקעה", "קרנות השתלמות", "תגמולים ואישית לפיצויים", "קופת גמל להשקעה - חסכון לילד", "קרנות חדשות", "קרנות כלליות", "מרכזית לפיצויים", "מטרה אחרת"];

export async function loader({ params }: Route.LoaderArgs) {
  const { loadCma, loadCmaFees, loadTerms, loadProducts, today } = await import("../lib/data.server");
  const { fitTable, goalContext } = await import("../lib/compare.server");
  const { institutionCompanies, loadCatalog, resolutionOf, seenValue, seenWhere } = await import("../lib/instruments.server");
  const cma = loadCma();
  const company = cma.companies.find((c) => c.id === params.id);
  if (!company) {
    // the id is not a managing company: a bank or broker of the fee snapshots or deposit records (flows 15.4); a fund manager once a fund list exists
    const { buildInstitution } = await import("../lib/institutions.server");
    const institution = buildInstitution(params.id);
    if (!institution) throw new Response("Not found", { status: 404 });
    return { kind: "institution" as const, institution };
  }
  const wrappers = loadProducts();
  const terms = loadTerms();
  const collator = new Intl.Collator("he");
  const tracks = cma.tracks.filter((t) => t.companyId === company.id).sort((a, b) => collator.compare(a.name, b.name));
  const feesOf = loadCmaFees();
  const t = today();
  const groups = [...new Set(tracks.map((t) => t.classification))]
    .sort((a, b) => (classificationOrder.indexOf(a) + 1 || 99) - (classificationOrder.indexOf(b) + 1 || 99))
    .map((classification) => {
      const list = tracks.filter((t) => t.classification === classification);
      const wrapper = wrappers.find((w) => w.id === list[0]!.wrapperId);
      // one value object per group (source, year, rules), then the number and its own note per track
      const balances = list.map((x) => feesOf.get(x.fundId)!.balance);
      const template = cmaFeeValue(balances.find((b) => b.value !== null) ?? balances[0]!, t);
      const fees: Record<number, CompactFee> = Object.fromEntries(list.map((x, i) => [x.fundId, compactFee(balances[i]!, template)]));
      return {
        classification,
        workbenchId: list[0]!.wrapperId,
        tracks: list,
        fees,
        feeTemplate: template,
        wrapper: wrapper ? { id: wrapper.id, name: wrapper.names.he[0]!, line: terms.find((t) => t.he === wrapper.names.he[0])?.explanation ?? null } : null,
      };
    });
  // the catalogue: this company's entries (data/catalog/), found through the tracks they name
  const catalog = loadCatalog();
  const owner = institutionCompanies(catalog, cma.tracks);
  const mine = catalog.filter((c) => owner.get(c.institution) === company.id);
  const defaultIds = mine.filter((c) => c.default_at_joining).flatMap((c) => c.maps_to.track_ids);
  const known = mine.flatMap((c) => c.near_duplicates.map((d) => ({ name: d.name, trackIds: d.track_ids, resolution: resolutionOf(d.resolution) }))).filter((k): k is { name: string; trackIds: number[]; resolution: "distinct" | "twice" | "unresolved" } => k.resolution !== null);
  const unassigned = mine
    .filter((c) => c.status === "not-catalogued-yet")
    .map((c) => ({ id: c.id, names: c.names.he, where: seenWhere(c), seen: seenValue(c) }));
  // what the site found in the company's own documents (D30): the records that cite them, by topic, with their cards' data
  const { companyTermGroups, registryIdsOfPage } = await import("../lib/institutions.server");
  const { loadChecklistRows, loadRules, pointedRecords } = await import("../lib/data.server");
  const { topicName } = await import("../copy");
  const allRules = loadRules();
  const registryIds = registryIdsOfPage(company.id);
  const termGroups = companyTermGroups(registryIds, allRules, topicName);
  const termRules = Object.fromEntries(termGroups.flatMap((g) => g.ids).map((id) => [id, allRules[id]!]));
  const { loadInstitutionRegistry } = await import("../lib/institutions.server");
  const shortName = loadInstitutionRegistry().find((r) => r.id === registryIds[0])?.name_he ?? company.name;
  const companyTerms = { groups: termGroups, rules: termRules, pointed: pointedRecords(termRules, allRules), company: registryIds[0] ?? null, name: shortName, dimensions: termGroups.length ? Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) : {} };
  return { kind: "company" as const, company, groups, period: cma.periodValue, defaultIds, known, unassigned, today: t, goal: goalContext(), fit: fitTable(), companyTerms };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const name = data?.kind === "institution" ? data.institution.name : data?.company.name;
  return [{ title: `${name ?? companiesCopy.title} · ${site.name}` }];
}

function feeHeadOf(v: SiteValue) {
  return feeLabel(copy.feeColumn, feeYear(v));
}

function countLine(n: number) {
  if (n === 1) return copy.tracks.one;
  if (n === 2) return copy.tracks.two;
  return `${fmt.number(n)} ${copy.tracks.many}`;
}

export default function Company() {
  const data = useLoaderData<typeof loader>();
  if (data.kind === "institution") return <InstitutionPage data={data.institution} />;
  return <ManagerCompany data={data} />;
}

function ManagerCompany({ data }: { data: Extract<ReturnType<typeof useLoaderData<typeof loader>>, { kind: "company" }> }) {
  const first = data.groups[0];
  const side = first?.wrapper;
  return (
    <GoalsProvider presets={data.goal.presets as Presets}>
    <FitProvider table={data.fit} stale={data.period.stale ?? null}>
    <PageShell current="decoder" data={{ rules: data.companyTerms.rules, pointed: data.companyTerms.pointed, terms: {}, dimensions: data.companyTerms.dimensions, today: data.today, ...(data.companyTerms.company ? { company: data.companyTerms.company } : {}) }}>
      <div className="pt-2 lg:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={data.company.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              <bdi>{data.company.name}</bdi>
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground max-w-measure">
              <NumAfter lead={copy.lineBefore} value={data.period} />.
            </p>
            <NumberLegend />
            {data.period.stale && (
              <Callout tone="caution">
                {copy.oldData} <bdi dir="ltr">{fmt.period(String(data.period.value))}</bdi>.
              </Callout>
            )}
          </header>

          <div className="hidden lg:grid grid-cols-2 gap-4 items-start">
            {side && <WrapperCard side={side} />}
            <PasteCard />
          </div>

          <section aria-labelledby="tr-h" className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="tr-h" className="text-xl lg:text-2xl font-semibold">
                {copy.listHeading} <bdi>{data.company.name}</bdi>
              </h2>
              <span className="hidden lg:inline text-sm text-muted-foreground">{"בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק"}</span>
            </div>
            <Callout tone="info">{copy.feesLine}</Callout>
            <SavedGoalStrip variant="compact" label={fitCopy.companyLine} presets={data.goal.presets as Presets} meta={data.goal.meta} today={data.today} />

            {data.groups.map((g, i) => (
              <Disclosure
                key={g.classification}
                defaultOpen={i === 0}
                className="flex flex-col gap-2"
                summaryClassName="min-h-12 md:min-h-14"
                label={
                  <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
                    <span className="text-lg lg:text-xl font-semibold">
                      <bdi>{g.classification}</bdi>
                    </span>
                    <span className="text-sm text-muted-foreground">{countLine(g.tracks.length)}</span>
                  </span>
                }
              >
                {g.wrapper && (
                  <Link to={`/guide/${g.wrapper.id}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline self-start px-1">
                    {copy.whatIs} {g.wrapper.name}
                    <IconDrillIn size={16} />
                  </Link>
                )}
                {g.workbenchId && (
                  <Link to={`/workbench/tracks/${g.workbenchId}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline self-start px-1">
                    {r3workbench.links.group.before}
                    {g.wrapper?.name ?? g.classification}
                    {r3workbench.links.group.after}
                    <IconDrillIn size={16} />
                  </Link>
                )}
                <TrackList
                  feeHead={feeHeadOf(g.feeTemplate) + (g.tracks[0]?.dataset === "pensia-net" ? ` ${copy.feeRowWhole}` : "")}
                  groups={groupTracks(
                    g.tracks.map((t) => ({ track: t, href: `/companies/${data.company.id}/${t.fundId}`, isDefault: data.defaultIds.includes(t.fundId), fee: expandFee(g.fees[t.fundId]!, g.feeTemplate) })),
                    data.known,
                  )}
                />
              </Disclosure>
            ))}
          </section>
          {data.unassigned.length > 0 && (
            <section aria-labelledby="un-h" className="flex flex-col gap-3">
              <div>
                <h2 id="un-h" className="text-xl lg:text-2xl font-semibold">
                  {catalogue.unassigned.title}
                </h2>
                <p className="text-sm text-muted-foreground max-w-measure">{catalogue.unassigned.line}</p>
              </div>
              <Card as="div" className="p-0 md:p-0">
                <ul className="flex flex-col divide-y divide-border">
                  {data.unassigned.map((u) => (
                    <li key={u.id} className="flex flex-col gap-1 p-4">
                      <span className="font-medium flex flex-col gap-0.5">
                        {u.names.map((n) => (
                          <bdi key={n}>{n}</bdi>
                        ))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {catalogue.seenAt} <bdi dir="ltr">{u.where}</bdi> <NumAfter lead={catalogue.seenOn} value={u.seen as SiteValue} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
          <CompanyTerms name={data.companyTerms.name} groups={data.companyTerms.groups} />
          <PasteCard className="lg:hidden" />
        </div>

      </div>
    </PageShell>
    </FitProvider>
    </GoalsProvider>
  );
}

function WrapperCard({ side }: { side: { id: string; name: string; line: string | null } }) {
  const hid = useId();
  return (
    <Card as="section" className="flex flex-col gap-2.5 lg:p-5" aria-labelledby={hid}>
      <span className="text-sm text-muted-foreground">{copy.productType}</span>
      <h2 id={hid} className="text-lg font-semibold">
        {side.name}
      </h2>
      {side.line && <p className="text-sm">{side.line}</p>}
      <Link to={`/guide/${side.id}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline">
        {copy.toGuide} {side.name}
        <IconDrillIn size={16} />
      </Link>
    </Card>
  );
}
