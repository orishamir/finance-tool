// The track page (flows 6.12): the fund's official record and its date, what to check, and the guide link.
import { useLoaderData } from "react-router";
import { companyPath, dealPagePath, guidePath, trackBrowserPath, trackPath } from "../lib/site-paths";
import type { Route } from "./+types/track";
import { catalogue, companies as companiesCopy, company as companyCopy, feePageLink, pagePreview, trackBrowser, track as copy } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { feeLabel } from "../components/decoder/fees";
import { DimensionChecklist, checklistMark, type ChecklistRowView } from "../components/guide/sections";
import { IconDrillIn } from "../components/icons";
import { Num, NumAfter, OwnCompanyPage } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card, FeeNum, GemelNetLink, KeyValueList, MixedName, PageHead, Section, Sentence, ShareNum, Tag, TextLink, gershayim } from "../components/kit";
import { cmaFeeValue, feeYear, type SiteValue } from "../lib/value";
import { compactHoldings, exposureShares, holdingsTemplate, type ExposureShares, type Holdings } from "../lib/track-exposure";
import { trackLabels } from "../lib/track-labels";
import { fmt } from "../lib/format";

/** F-87 and F-88 for one track; null when its data file has no amounts. */
function exposureOf(h: Holdings | undefined, period: string, today: string): ExposureShares | null {
  const template = holdingsTemplate([h], period, today);
  return exposureShares(compactHoldings(h, template), template, period, today);
}

export async function loader({ params }: Route.LoaderArgs) {
  const { loadChecklistRows, loadCma, loadCmaFees, loadCmaHoldings, loadRules, loadWrappers, pointedRecords, today } = await import("../lib/data.server");
  const { institutionCompanies, loadCatalog, seenValue, seenWhere } = await import("../lib/instruments.server");
  const cma = loadCma();
  const track = cma.tracks.find((t) => t.companyId === params.id && String(t.fundId) === params.fund);
  if (!track) throw new Response("Not found", { status: 404 });
  const others = cma.tracks.filter((t) => t.companyId === track.companyId && t.name === track.name && t.fundId !== track.fundId);
  // the product the site has a guide and checks for: a self-directed (IRA) fund's own (lib/self-directed.ts), else its regulator type's;
  // the tracks page lists it under its regulator type either way
  const wrappers = loadWrappers();
  const wrapper = wrappers.find((w) => w.id === (track.selfDirected ?? track.wrapperId)) ?? null;
  const listedIn = wrappers.find((w) => w.id === track.wrapperId) ?? null;
  const rules = loadRules();
  // the fund's company (D30): its fund's page lists the general rules and this company's terms, never another
  // company's, and a record that names several companies shows this one's part
  const { registryIdsOfPage } = await import("../lib/institutions.server");
  const companyIds = registryIdsOfPage(track.companyId);
  const ours = (r: (typeof rules)[string]) => r.scope === "general" || (r.scope_institutions ?? []).some((c) => companyIds.includes(c.id));
  // the rules the wrapper's record names anywhere in it (a key or a whole string value equal to the rule's id), in the rule base's order:
  // its strings gathered once per page (searching the serialised record for every checklist row and every rule was most of the build's
  // prerender time)
  const strings = new Set<string>();
  const gather = (v: unknown): void => {
    if (typeof v === "string") strings.add(v);
    else if (Array.isArray(v)) v.forEach(gather);
    else if (v && typeof v === "object")
      for (const [k, x] of Object.entries(v)) {
        strings.add(k);
        gather(x);
      }
  };
  gather(wrapper);
  const cited = Object.values(rules).filter((r) => strings.has(r.id));
  const checklist = wrapper
    ? loadChecklistRows().map((row) => {
        const carrying = cited.filter((r) => r.dimensions.includes(row.id) && ours(r)).map((r) => r.id);
        return { id: row.id, name: row.name, explanation: row.explanation, ...checklistMark(wrapper.dimensions[row.id]), rules: carrying } as ChecklistRowView;
      })
    : [];
  const fees = loadCmaFees().get(track.fundId)!;
  const file = cma.files.find((f) => f.dataset === track.dataset)!;
  const t = today();
  const sourced = (value: string | number | null, unit: SiteValue["unit"], notes = ""): SiteValue => ({
    value,
    unit,
    source: file.source,
    checked: file.checked,
    effective_from: file.period + "-01",
    effective_to: null,
    update_rule: "market",
    state: "sourced",
    stale: cma.periodValue.stale,
    notes,
  });
  // and the rule the stock and currency shares' sheets name, so their chip carries its title and source
  const { EXPOSURE_RULE_IDS } = await import("../lib/track-exposure");
  const citedRules = Object.fromEntries([...cited, ...EXPOSURE_RULE_IDS.flatMap((id) => (rules[id] ? [rules[id]] : []))].map((r) => [r.id, r]));
  // names the catalogue gives this track alone (a fund-level or programme-level name is not this track's name)
  const catalog = loadCatalog();
  const owner = institutionCompanies(catalog, cma.tracks);
  const names = catalog
    .filter((c) => c.maps_to.track_ids.length === 1 && c.maps_to.track_ids[0] === track.fundId && owner.get(c.institution) === track.companyId)
    .map((c) => ({ id: c.id, names: c.names.he, where: seenWhere(c), seen: seenValue(c) }));
  // the fee page fills a deal from the track where the track's product record lists a fee base (method §10.6)
  const feePage = !!wrapper && wrapper.fee_bases_allowed.length > 0;
  const isDefault = catalog.some((c) => c.default_at_joining && c.maps_to.track_ids.includes(track.fundId) && owner.get(c.institution) === track.companyId);
  return {
    track,
    companyIds,
    names,
    isDefault,
    feePage,
    others: others.map((o) => ({ fundId: o.fundId, href: trackPath(o.companyId, o.fundId) })),
    wrapper: wrapper ? { id: wrapper.id, name: wrapper.names.he[0]! } : null,
    listedIn: listedIn ? { id: listedIn.id, name: listedIn.names.he[0]! } : null,
    checklist,
    rules: citedRules,
    pointed: pointedRecords(citedRules, rules),
    dimensionNames: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    values: {
      balanceFee: cmaFeeValue(fees.balance, t),
      depositFee: cmaFeeValue(fees.deposit, t),
      fundId: sourced(String(track.fundId), "text"),
      period: cma.periodValue,
      inception: track.inception ? sourced(track.inception, "text") : null,
      exposure: exposureOf(loadCmaHoldings().get(track.fundId), track.reportPeriod, t),
    },
    today: t,
  };
}

export function meta({ loaderData: data, location }: Route.MetaArgs) {
  if (!data) return pageMeta({ title: companiesCopy.title, description: pagePreview.companies, location });
  return pageMeta({ title: gershayim(data.track.name), description: pagePreview.track(data.track.companyName, data.wrapper?.name ?? null), location });
}

export default function TrackPage() {
  const data = useLoaderData<typeof loader>();
  const { track } = data;
  // pension fees belong to the fund, not to the track (CAT-39)
  const feeText = (template: string, v: SiteValue) => feeLabel(template, feeYear(v)) + (track.dataset === "pensia-net" ? ` ${copy.feeWhole}` : "");
  // a page about one company's track: its own figures carry no "לפי החברה"
  return (
    <OwnCompanyPage>
    <PageShell current="decoder" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: data.dimensionNames, today: data.today, ...(data.companyIds[0] ? { company: data.companyIds[0], pageCompanies: data.companyIds } : {}) }}>
      <div className="flex flex-col gap-8">
        <PageHead
          crumb={<Breadcrumb parent={{ href: companyPath(track.companyId), label: gershayim(track.companyName) }} current={gershayim(track.name)} />}
          title={<bdi>{gershayim(track.name)}</bdi>}
          marks={
            (data.isDefault || trackLabels(track).length > 0) && (
              <>
                {data.isDefault && <Tag tone="parameter">{companyCopy.default}</Tag>}
                {trackLabels(track).map((l) => (
                  <Tag key={l}>{companyCopy.labels[l]}</Tag>
                ))}
              </>
            )
          }
        >
          <Sentence tone="muted">
            {copy.fundLine} <Num value={data.values.fundId} /> <GemelNetLink fundId={track.fundId} dataset={track.dataset} />
          </Sentence>
          {data.others.length > 0 && (
            <Callout tone="caution">
              {copy.sameNameElsewhere} {companyCopy.sameName.distinct}.{" "}
              {data.others.map((o) => (
                <TextLink key={o.href} to={o.href}>
                  {copy.toOther}
                </TextLink>
              ))}
            </Callout>
          )}
        </PageHead>
        <Card>
          <KeyValueList
            plain
            wide
            items={[
              { id: "manager", label: copy.labels.manager, value: <TextLink to={companyPath(track.companyId)}><bdi>{gershayim(track.companyName)}</bdi></TextLink> },
              {
                id: "product",
                label: copy.labels.product,
                value: (
                  <span className="flex flex-wrap items-center gap-x-3">
                    {/* the site's name for the product where it has one; the regulator's type where the site has no product for it */}
                    <MixedName>{data.wrapper?.name ?? track.classification}</MixedName>
                    {data.wrapper && (
                      <span className="flex flex-wrap items-center gap-x-3 text-sm">
                        <TextLink look="line" to={guidePath(data.wrapper.id)}>
                          {copy.toGuide}
                          <IconDrillIn size={16} />
                        </TextLink>
                        {data.listedIn && (
                          <TextLink look="line" to={trackBrowserPath(data.listedIn.id)}>
                            {trackBrowser.guideLink.before}
                            {data.listedIn.name}
                            {trackBrowser.guideLink.after}
                            <IconDrillIn size={16} />
                          </TextLink>
                        )}
                      </span>
                    )}
                  </span>
                ),
              },
              ...(track.specialization ? [{ id: "classification", label: copy.labels.classification, value: <bdi>{gershayim(track.specialization)}</bdi> }] : []),
              ...(track.subSpecialization ? [{ id: "holds", label: copy.labels.holds, value: <bdi>{gershayim(track.subSpecialization)}</bdi> }] : []),
              { id: "balanceFee", label: feeText(copy.feeBalanceLabel, data.values.balanceFee), value: <FeeNum value={data.values.balanceFee} /> },
              { id: "depositFee", label: feeText(copy.feeDepositLabel, data.values.depositFee), value: <FeeNum value={data.values.depositFee} /> },
              ...(data.values.exposure?.stock ? [{ id: "stock", label: companyCopy.stock.rowStock.replace("{period}", fmt.period(track.reportPeriod)), value: <ShareNum value={data.values.exposure.stock} /> }] : []),
              ...(data.values.exposure?.currency ? [{ id: "currency", label: companyCopy.stock.rowCurrency.replace("{period}", fmt.period(track.reportPeriod)), value: <ShareNum value={data.values.exposure.currency} /> }] : []),
              ...(data.values.inception ? [{ id: "inception", label: copy.labels.inception, value: <Num value={data.values.inception} /> }] : []),
              { id: "period", label: copy.labels.period, value: <Num value={data.values.period} /> },
            ]}
          />
          {data.feePage && <div className="pt-1 border-t border-border">
            <TextLink look="line" to={dealPagePath({ track: track.fundId })}>
              {feePageLink}
              <IconDrillIn size={16} />
            </TextLink>
          </div>}
        </Card>
        {data.names.length > 0 && (
          <Section title={catalogue.alsoCalled}>
            <Card pad="none">
              <ul className="flex flex-col divide-y divide-border">
                {data.names.map((n) => (
                  <li key={n.id} className="flex flex-col gap-1 p-4">
                    <span className="font-medium flex flex-col gap-0.5">
                      {n.names.map((x) => (
                        <bdi key={x}>{x}</bdi>
                      ))}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {catalogue.seenAt} {n.where} <NumAfter lead={catalogue.seenOn} value={n.seen as SiteValue} />
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        )}
        {data.checklist.length > 0 && (
          <Section title={copy.checklist}>
            <DimensionChecklist rows={data.checklist} />
          </Section>
        )}
      </div>
    </PageShell>
    </OwnCompanyPage>
  );
}
