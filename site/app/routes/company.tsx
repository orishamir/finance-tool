// Screen 4: the company page (design-spec 5 as redrawn 2026-10-23; flows 6.11): every track the company
// runs, grouped by the regulator's product type, same-name tracks grouped, the fee-pending note, the paste card.
// Since 2026-11-03 (founder: "a more similar UI to the one we have in /tracks") what the company offers is the tracks page's list over
// this company alone (components/tracks/company-browser.tsx): its products, funds and securities account are chips, "כל המוצרים" first.
import { useLoaderData, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/company";
import { brands as brandsCopy, catalogue, companies as companiesCopy, company as copy, r4catalogue, site, trackBrowser } from "../copy";
import { PasteCard } from "../components/decoder/tracks";
import { InstitutionPage } from "../components/decoder/institutions/page";
import { CompanyTerms } from "../components/decoder/company-terms";
import { BrandFundList } from "../components/decoder/brand-funds";
import { BrokerageGroupCard } from "../components/decoder/institutions/brokerage-card";
import { IdRef, Num, NumAfter, NumberLegend, StaleSaid } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { CompanyTracks, type CompanyExtra } from "../components/tracks/company-browser";
import type { TbData } from "../lib/track-browser";
import { Callout, Card, FeeWordsNote } from "../components/kit";
import type { SiteValue } from "../lib/value";
import { fmt } from "../lib/format";

/**
 * The order of a company page's products, by how often a reader comes for them (founder, 2026-10-27): its tracks' products in
 * `classificationOrder`, then its funds and securities account in `extraOrder` (since 2026-11-03 the tracks are one list, so they come
 * first); a product not named comes after those named.
 */
const extraOrder = ["funds-tracking", "brokerage", "funds-money-market"];
const classificationOrder = ["קופת גמל להשקעה", "קרנות השתלמות", "תגמולים ואישית לפיצויים", "קופת גמל להשקעה - חסכון לילד", "קרנות חדשות", "קרנות כלליות", "מרכזית לפיצויים", "מטרה אחרת"];

/**
 * What a house's page says beside its prices (D57 amended 2026-11-04): its advertising against its binding documents and its group
 * prices. Read here, for the page alone: the site's calculations never read them (site/app/lib stays blind to both). The groups the index
 * page offers as radios are named here too, so each links to that page with it picked (D43 amended (5)).
 */
async function houseNotes(id: string) {
  const { latestSnapshots } = await import("../lib/institutions.server");
  const { pickableOnEitherSide } = await import("../lib/group-pick");
  const snap = latestSnapshots().find((s) => s.id === id);
  return { advertising: snap?.advertising ?? [], groups: snap?.groups ?? null, linked: [...pickableOnEitherSide(snap)] };
}

export async function loader({ params }: Route.LoaderArgs) {
  const { loadCma, loadTerms, loadWrappers, today } = await import("../lib/data.server");
  const { institutionCompanies, loadCatalog, seenValue, seenWhere } = await import("../lib/instruments.server");
  const cma = loadCma();
  // D33: a brand's every address shows its one page: the managing company's tracks, the funds, the brokerage account
  const { brandOfPage, brandFunds } = await import("../lib/brands.server");
  const { buildTrackBrowser, shortCompanyName, templateRuleIds } = await import("../lib/track-browser.server");
  const brand = brandOfPage(params.id) ?? null;
  const companyId = brand ? brand.cmaId : params.id;
  const company = companyId ? cma.companies.find((c) => c.id === companyId) : undefined;
  if (!company && !brand) {
    // the id is not a managing company: a bank or broker of the fee snapshots or deposit records (flows 15.4)
    const { buildInstitution } = await import("../lib/institutions.server");
    const institution = buildInstitution(params.id);
    if (!institution) throw new Response("Not found", { status: 404 });
    return { kind: "institution" as const, institution, notes: await houseNotes(params.id) };
  }
  const wrapperCaps = new Map<string, { balance: SiteValue | null; deposit: SiteValue | null }>(
    loadWrappers()
      .filter((w) => w.fee_caps?.balance || w.fee_caps?.deposit)
      .map((w) => [w.id, { balance: (w.fee_caps?.balance?.value != null ? w.fee_caps.balance : null) as SiteValue | null, deposit: (w.fee_caps?.deposit?.value != null ? w.fee_caps.deposit : null) as SiteValue | null }]),
  );
  const terms = loadTerms();
  const t = today();
  // every track the company runs: the tracks page's data over this company, its products in the founder's order
  const tracks = cma.tracks.filter((x) => x.companyId === company?.id);
  const rank = (id: string) => classificationOrder.indexOf(tracks.find((x) => x.wrapperId === id || (!x.wrapperId && x.classification === id))?.classification ?? "") + 1 || 99;
  const tb = company ? buildTrackBrowser(company.id) : null;
  // a brand with no managing company (funds and an account only) has no tracks: its list holds those alone
  const browser: TbData = tb ? { ...tb, products: [...tb.products].sort((a, b) => rank(a.id) - rank(b.id)) } : { today: t, reportPeriod: String(cma.periodValue.value), feeYear: null, period: cma.periodValue, companies: [], products: [] };
  // the product's legal caps (its wrapper record's fee_caps, sourced to the regulations), for the line under its list
  const caps = Object.fromEntries(browser.products.map((p) => [p.id, wrapperCaps.get(p.id) ?? null]));
  // the catalogue: this company's entries (data/catalog/), found through the tracks they name
  const catalog = loadCatalog();
  const owner = institutionCompanies(catalog, cma.tracks);
  const mine = company ? catalog.filter((c) => owner.get(c.institution) === company.id) : [];
  const defaultIds = mine.filter((c) => c.default_at_joining).flatMap((c) => c.maps_to.track_ids);
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
  // the rules the funds' label sheets name (the label set's own, as on the index page)
  const labelRuleIds = [...new Set(funds.flatMap((g) => g.funds.flatMap((f) => f.labels.flatMap((l) => l.rules))))].filter((id) => allRules[id]);
  // the glossary cards behind the track list's "?" (the fee and exposure heads) and the fund lists' fees, with the rules they cite
  const { HELP_TERMS } = await import("../lib/track-browser");
  const helpNames = new Set<string>([...Object.values(HELP_TERMS), ...(funds.length ? brandsCopy.funds.feeTerms : [])]);
  const helpTerms = Object.fromEntries(terms.filter((x) => helpNames.has(x.he)).map((x) => [x.he, x]));
  const helpRuleIds = Object.values(helpTerms).flatMap((x) => x.ruleIds).filter((id) => allRules[id]);
  // and the rules the browser's figures name (their sheets), as on the tracks page
  const browserRuleIds = ["PF-06", "PF-10", ...templateRuleIds(browser)].filter((id) => allRules[id]);
  const termRules = { ...brokerage?.rules, ...Object.fromEntries([...termGroups.flatMap((g) => g.ids), ...labelRuleIds, ...helpRuleIds, ...browserRuleIds].map((id) => [id, allRules[id]!])) };
  const { loadInstitutionRegistry } = await import("../lib/institutions.server");
  const name = brand?.name ?? shortCompanyName(company!.id, company!.name);
  const shortName = brand?.name ?? loadInstitutionRegistry().find((r) => r.id === registryIds[0])?.name_he ?? name;
  const companyTerms = { groups: termGroups, rules: termRules, pointed: pointedRecords(termRules, allRules), company: registryIds[0] ?? null, pageCompanies: registryIds, helpTerms, name: shortName, dimensions: termGroups.length ? Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) : {} };
  // the legal companies the page stands for, as their own data writes them (the CMA, the tariff, the fund records)
  const members = brand ? [...new Set([company?.name, brokerage?.tariff.providerName, ...brand.fundManagers].filter((x): x is string => !!x))] : [];
  const brokerageCard = brokerage && brand?.brokerId ? { id: brand.brokerId, kind: brokerage.kind, tariff: brokerage.tariff, ...(await houseNotes(brand.brokerId)) } : null;
  return { kind: "company" as const, name, company: company ?? null, browser, caps, funds, brokerage: brokerageCard, members, period: cma.periodValue, defaultIds, unassigned, today: t, companyTerms };
}

/** The product, the kind and the order are in the query: changing them keeps the page's data (it is all loaded). */
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const name = data?.kind === "institution" ? data.institution.name : data?.name;
  return [{ title: `${name ?? companiesCopy.title} · ${site.name}` }];
}

export default function Company() {
  const data = useLoaderData<typeof loader>();
  if (data.kind === "institution") return <InstitutionPage data={data.institution} notes={data.notes} />;
  return <ManagerCompany data={data} />;
}

type CompanyData = Extract<ReturnType<typeof useLoaderData<typeof loader>>, { kind: "company" }>;

function fundCountLine(n: number) {
  if (n === 1) return brandsCopy.funds.count.one;
  if (n === 2) return brandsCopy.funds.count.two;
  return `${fmt.number(n)} ${brandsCopy.funds.count.many}`;
}

function ManagerCompany({ data }: { data: CompanyData }) {
  const company = data.company;
  const browser = data.browser;
  const hasTracks = browser.products.length > 0;
  // the funds and the securities account are chips after the tracks, in the founder's order (extraOrder)
  const extras: CompanyExtra[] = [
    ...data.funds.map((g) => ({
      id: `funds-${g.kind}`,
      name: brandsCopy.funds.groups[g.kind],
      count: g.funds.length,
      countText: fundCountLine(g.funds.length),
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground max-w-measure">{brandsCopy.funds.collected}</p>
          {g.funds.some((f) => f.noVariable || f.noTrustee) && <FeeWordsNote />}
          <BrandFundList funds={g.funds} kind={g.kind} />
        </div>
      ),
    })),
    ...(data.brokerage ? [{ id: "brokerage", name: r4catalogue.groups.brokerage, content: <BrokerageGroupCard id={data.brokerage.id} tariff={data.brokerage.tariff} kind={data.brokerage.kind} advertising={data.brokerage.advertising} groups={data.brokerage.groups} linked={data.brokerage.linked} /> }] : []),
  ]
    .map((e, i) => ({ e, i, rank: extraOrder.indexOf(e.id) === -1 ? extraOrder.length : extraOrder.indexOf(e.id) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .map((x) => x.e);
  return (
    <PageShell current="decoder" data={{ rules: data.companyTerms.rules, pointed: data.companyTerms.pointed, terms: data.companyTerms.helpTerms, dimensions: data.companyTerms.dimensions, today: data.today, ...(data.companyTerms.company ? { company: data.companyTerms.company } : {}), pageCompanies: data.companyTerms.pageCompanies }}>
      <div className="pt-2 lg:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              <bdi>{data.name}</bdi>
            </h1>
            {hasTracks && (
              // the tracks page's line: what the fee, the exposure, the yield and the assets are and when
              <p className="text-muted-foreground max-w-measure">
                {browser.feeYear ? (
                  <>
                    <NumAfter lead={trackBrowser.lead.intro} value={browser.feeYear} />
                    <NumAfter lead={trackBrowser.lead.figures} value={data.period} />
                  </>
                ) : (
                  <NumAfter lead={trackBrowser.lead.noYear} value={data.period} />
                )}
                {trackBrowser.lead.source}
              </p>
            )}
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

          <section aria-labelledby="tr-h" className="flex flex-col gap-3.5">
            <h2 id="tr-h" className="text-xl lg:text-2xl font-semibold">
              {brandsCopy.listHeading} <bdi>{data.name}</bdi>
            </h2>
            <StaleSaid on={!!data.period.stale}>
              <CompanyTracks data={browser} extras={extras} defaults={data.defaultIds} foot={(id) => <FeeFoot caps={data.caps[id] ?? null} />} />
            </StaleSaid>
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

/** Under each track table (D34): the product's legal caps, then that the direct expenses come on top (PF-10). */
function FeeFoot({ caps }: { caps: { balance: SiteValue | null; deposit: SiteValue | null } | null }) {
  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {caps && (caps.balance || caps.deposit) && (
        <span>
          {copy.fees.cap}{" "}
          {caps.balance && (
            <>
              <Num value={caps.balance} /> {caps.deposit ? copy.fees.capSavings : copy.fees.savings}{" "}
            </>
          )}
          {caps.deposit && (
            <>
              <Num value={caps.deposit} /> {copy.fees.capDeposits}
            </>
          )}
        </span>
      )}
      <span>
        {copy.fees.direct} <IdRef id="PF-10" />
      </span>
    </div>
  );
}
