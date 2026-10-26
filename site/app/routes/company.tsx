// Screen 4: the company page (design-spec 5 as redrawn 2026-10-23; flows 6.11): every track the company
// runs, grouped by the regulator's product type, same-name tracks grouped, the fee-pending note, the paste card.
import { useId } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/company";
import { brands as brandsCopy, catalogue, companies as companiesCopy, company as copy, r3workbench, r4catalogue, site } from "../copy";
import { feeLabel } from "../components/decoder/fees";
import { groupTracks, PasteCard, TrackList } from "../components/decoder/tracks";
import { InstitutionPage } from "../components/decoder/institutions/page";
import { CompanyTerms } from "../components/decoder/company-terms";
import { BrandFundList } from "../components/decoder/brand-funds";
import { BrokerageGroupCard } from "../components/decoder/institutions/brokerage-card";
import { IconDrillIn } from "../components/icons";
import { NumAfter, NumberLegend } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card, Disclosure } from "../components/kit";
import type { SiteValue } from "../lib/value";
import { fmt } from "../lib/format";
import { cmaFeeValue, compactFee, expandFee, feeYear, type CompactFee } from "../lib/value";
import { compactHoldings, holdingsTemplate, stockShare } from "../lib/track-exposure";

const classificationOrder = ["קופת גמל להשקעה", "קרנות השתלמות", "תגמולים ואישית לפיצויים", "קופת גמל להשקעה - חסכון לילד", "קרנות חדשות", "קרנות כלליות", "מרכזית לפיצויים", "מטרה אחרת"];

export async function loader({ params }: Route.LoaderArgs) {
  const { loadCma, loadCmaFees, loadCmaHoldings, loadTerms, loadProducts, today } = await import("../lib/data.server");
  const { institutionCompanies, loadCatalog, resolutionOf, seenValue, seenWhere } = await import("../lib/instruments.server");
  const cma = loadCma();
  // D33: a brand's every address shows its one page: the managing company's tracks, the funds, the brokerage account
  const { brandOfPage, brandFunds } = await import("../lib/brands.server");
  const brand = brandOfPage(params.id) ?? null;
  const companyId = brand ? brand.cmaId : params.id;
  const company = companyId ? cma.companies.find((c) => c.id === companyId) : undefined;
  if (!company && !brand) {
    // the id is not a managing company: a bank or broker of the fee snapshots or deposit records (flows 15.4)
    const { buildInstitution } = await import("../lib/institutions.server");
    const institution = buildInstitution(params.id);
    if (!institution) throw new Response("Not found", { status: 404 });
    return { kind: "institution" as const, institution };
  }
  const wrappers = loadProducts();
  const terms = loadTerms();
  const collator = new Intl.Collator("he");
  const tracks = cma.tracks.filter((t) => t.companyId === company?.id).sort((a, b) => collator.compare(a.name, b.name));
  const feesOf = loadCmaFees();
  const holdingsOf = loadCmaHoldings();
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
      // F-87 (D34): the same compaction for the two amounts the stock share is computed from
      const period = list[0]!.reportPeriod;
      const stockTemplate = holdingsTemplate(list.map((x) => holdingsOf.get(x.fundId)), period, t);
      const holdings = Object.fromEntries(list.map((x) => [x.fundId, compactHoldings(holdingsOf.get(x.fundId), stockTemplate)]));
      return {
        classification,
        period,
        stockTemplate,
        holdings,
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
  const mine = company ? catalog.filter((c) => owner.get(c.institution) === company.id) : [];
  const defaultIds = mine.filter((c) => c.default_at_joining).flatMap((c) => c.maps_to.track_ids);
  const known = mine.flatMap((c) => c.near_duplicates.map((d) => ({ name: d.name, trackIds: d.track_ids, resolution: resolutionOf(d.resolution) }))).filter((k): k is { name: string; trackIds: number[]; resolution: "distinct" | "twice" | "unresolved" } => k.resolution !== null);
  const unassigned = mine
    .filter((c) => c.status === "not-catalogued-yet")
    .map((c) => ({ id: c.id, names: c.names.he, where: seenWhere(c), seen: seenValue(c) }));
  // what the site found in the company's own documents (D30): the records that cite them, by topic, with their cards' data
  const { brokeragePart, companyTermGroups, registryIdsOfPage } = await import("../lib/institutions.server");
  const { loadChecklistRows, loadRules, pointedRecords } = await import("../lib/data.server");
  const { topicName } = await import("../copy");
  const allRules = loadRules();
  const pageId = brand?.page ?? company!.id;
  const registryIds = registryIdsOfPage(pageId);
  const termGroups = companyTermGroups(registryIds, allRules, topicName);
  const brokerage = brand?.brokerId ? brokeragePart(brand.brokerId) : null;
  const funds = brand ? brandFunds(brand) : [];
  const termRules = { ...brokerage?.rules, ...Object.fromEntries(termGroups.flatMap((g) => g.ids).map((id) => [id, allRules[id]!])) };
  const { loadInstitutionRegistry } = await import("../lib/institutions.server");
  const name = brand?.name ?? company!.name;
  const shortName = brand?.name ?? loadInstitutionRegistry().find((r) => r.id === registryIds[0])?.name_he ?? name;
  const companyTerms = { groups: termGroups, rules: termRules, pointed: pointedRecords(termRules, allRules), company: registryIds[0] ?? null, name: shortName, dimensions: termGroups.length ? Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) : {} };
  // the legal companies the page stands for, as their own data writes them (the CMA, the tariff, the fund records)
  const members = brand ? [...new Set([company?.name, brokerage?.tariff.providerName, ...brand.fundManagers].filter((x): x is string => !!x))] : [];
  const brokerageCard = brokerage && brand?.brokerId ? { id: brand.brokerId, kind: brokerage.kind, tariff: brokerage.tariff } : null;
  return { kind: "company" as const, name, company: company ?? null, groups, funds, brokerage: brokerageCard, members, period: cma.periodValue, defaultIds, known, unassigned, today: t, companyTerms };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const name = data?.kind === "institution" ? data.institution.name : data?.name;
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

type CompanyData = Extract<ReturnType<typeof useLoaderData<typeof loader>>, { kind: "company" }>;

function fundCountLine(n: number) {
  if (n === 1) return brandsCopy.funds.count.one;
  if (n === 2) return brandsCopy.funds.count.two;
  return `${fmt.number(n)} ${brandsCopy.funds.count.many}`;
}

function GroupLabel({ title, count }: { title: string; count?: string }) {
  return (
    <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
      <span className="text-lg lg:text-xl font-semibold">
        <bdi>{title}</bdi>
      </span>
      {count && <span className="text-sm text-muted-foreground">{count}</span>}
    </span>
  );
}

function ManagerCompany({ data }: { data: CompanyData }) {
  // the product-type card says what the page sells, so it shows only when that is one type: a single group of tracks and no funds
  // or brokerage account (most managing companies run several types; each group heading links to its own guide)
  const side = data.groups.length === 1 && data.funds.length === 0 && !data.brokerage ? data.groups[0]!.wrapper : null;
  const company = data.company;
  // the page's groups in one order: the managing company's products, the funds, the brokerage account; the first is open
  const firstOpen = company && data.groups.length > 0 ? "tracks" : data.funds.length > 0 ? "funds" : "brokerage";
  return (
    <PageShell current="decoder" data={{ rules: data.companyTerms.rules, pointed: data.companyTerms.pointed, terms: {}, dimensions: data.companyTerms.dimensions, today: data.today, ...(data.companyTerms.company ? { company: data.companyTerms.company } : {}) }}>
      <div className="pt-2 lg:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              <bdi>{data.name}</bdi>
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground max-w-measure">
              {company ? (
                <>
                  <NumAfter lead={copy.lineBefore} value={data.period} />.
                </>
              ) : (
                brandsCopy.lede
              )}
            </p>
            {data.members.length > 1 && (
              <p className="text-sm text-muted-foreground max-w-measure">
                {brandsCopy.members}{" "}
                {data.members.map((m, i) => (
                  <span key={m}>
                    {i > 0 && " · "}
                    <bdi>{m}</bdi>
                  </span>
                ))}
              </p>
            )}
            <NumberLegend />
            {company && data.period.stale && (
              <Callout tone="caution">
                {copy.oldData} <bdi dir="ltr">{fmt.period(String(data.period.value))}</bdi>.
              </Callout>
            )}
          </header>

          {side && (
            <div className="hidden lg:grid grid-cols-2 gap-4 items-start">
              <WrapperCard side={side} />
            </div>
          )}

          <section aria-labelledby="tr-h" className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="tr-h" className="text-xl lg:text-2xl font-semibold">
                {company && data.funds.length === 0 && !data.brokerage ? copy.listHeading : brandsCopy.listHeading} <bdi>{data.name}</bdi>
              </h2>
              {company && <span className="hidden lg:inline text-sm text-muted-foreground">{"בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק"}</span>}
            </div>
            {company && <Callout tone="info">{copy.feesLine}</Callout>}

            {company &&
              data.groups.map((g, i) => (
                <Disclosure key={g.classification} defaultOpen={firstOpen === "tracks" && i === 0} className="flex flex-col gap-2" summaryClassName="min-h-12 md:min-h-14" label={<GroupLabel title={g.classification} count={countLine(g.tracks.length)} />}>
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
                    stockHead={g.stockTemplate ? copy.stock.column.replace("{period}", fmt.period(g.period)) : undefined}
                    groups={groupTracks(
                      g.tracks.map((t) => ({
                        track: t,
                        href: `/companies/${company.id}/${t.fundId}`,
                        isDefault: data.defaultIds.includes(t.fundId),
                        fee: expandFee(g.fees[t.fundId]!, g.feeTemplate),
                        ...(g.stockTemplate ? { stock: stockShare(g.holdings[t.fundId] ?? null, g.stockTemplate, g.period, data.today) } : {}),
                      })),
                      data.known,
                    )}
                  />
                </Disclosure>
              ))}

            {data.funds.map((g, i) => (
              <Disclosure key={g.kind} defaultOpen={firstOpen === "funds" && i === 0} className="flex flex-col gap-2" summaryClassName="min-h-12 md:min-h-14" label={<GroupLabel title={brandsCopy.funds.groups[g.kind]} count={fundCountLine(g.funds.length)} />}>
                <p className="text-sm text-muted-foreground max-w-measure px-1">{brandsCopy.funds.collected}</p>
                <BrandFundList funds={g.funds} />
              </Disclosure>
            ))}

            {data.brokerage && (
              <Disclosure defaultOpen={firstOpen === "brokerage"} className="flex flex-col gap-2" summaryClassName="min-h-12 md:min-h-14" label={<GroupLabel title={r4catalogue.groups.brokerage} />}>
                <BrokerageGroupCard id={data.brokerage.id} tariff={data.brokerage.tariff} kind={data.brokerage.kind} />
              </Disclosure>
            )}
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
          {/* the fallback search comes after everything the page lists, at every width (founder, 2026-10-26: above the list it was in the way) */}
          {company && <PasteCard className="lg:w-1/2" />}
        </div>

      </div>
    </PageShell>
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
