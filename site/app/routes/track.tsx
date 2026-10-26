// The track page (flows 6.12): the fund's official record and its date, what to check, and the guide link.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/track";
import { catalogue, companies as companiesCopy, company as companyCopy, r3workbench, site, track as copy } from "../copy";
import { FeeNum, feeLabel } from "../components/decoder/fees";
import { DimensionChecklist, type ChecklistRowView } from "../components/guide/sections";
import { IconDrillIn } from "../components/icons";
import { Num, NumAfter } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { FitMarkCard } from "../components/compare/fit";
import { SavedGoalStrip } from "../components/compare/strip";
import { Callout, Card, Sentence, Tag } from "../components/kit";
import { GoalsProvider, type Presets } from "../lib/goal";
import { cmaFeeValue, feeYear, type SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  const { loadChecklistRows, loadCma, loadCmaFees, loadRules, loadWrappers, pointedRecords, today } = await import("../lib/data.server");
  const { fitTable, goalContext } = await import("../lib/compare.server");
  const { institutionCompanies, loadCatalog, seenValue, seenWhere } = await import("../lib/instruments.server");
  const cma = loadCma();
  const track = cma.tracks.find((t) => t.companyId === params.id && String(t.fundId) === params.fund);
  if (!track) throw new Response("Not found", { status: 404 });
  const others = cma.tracks.filter((t) => t.companyId === track.companyId && t.name === track.name && t.fundId !== track.fundId);
  const wrapper = loadWrappers().find((w) => w.id === track.wrapperId) ?? null;
  const rules = loadRules();
  const checklist = wrapper
    ? loadChecklistRows().map((row) => {
        const mark = wrapper.dimensions[row.id];
        const carrying = Object.values(rules).filter((r) => r.dimensions.includes(row.id) && JSON.stringify(wrapper).includes(`"${r.id}"`)).map((r) => r.id);
        return { id: row.id, name: row.name, explanation: row.explanation, mark: mark === "covered" ? "covered" : mark?.startsWith("blocked:") ? "blocked" : "na", code: mark?.startsWith("blocked:") ? mark.slice(8) : undefined, rules: carrying } as ChecklistRowView;
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
  const citedRules = Object.fromEntries(Object.values(rules).filter((r) => wrapper && JSON.stringify(wrapper).includes(`"${r.id}"`)).map((r) => [r.id, r]));
  // names the catalogue gives this track alone (a fund-level or programme-level name is not this track's name)
  const catalog = loadCatalog();
  const owner = institutionCompanies(catalog, cma.tracks);
  const names = catalog
    .filter((c) => c.maps_to.track_ids.length === 1 && c.maps_to.track_ids[0] === track.fundId && owner.get(c.institution) === track.companyId)
    .map((c) => ({ id: c.id, names: c.names.he, where: seenWhere(c), seen: seenValue(c) }));
  const isDefault = catalog.some((c) => c.default_at_joining && c.maps_to.track_ids.includes(track.fundId) && owner.get(c.institution) === track.companyId);
  return {
    track,
    names,
    isDefault,
    others: others.map((o) => ({ fundId: o.fundId, href: `/companies/${o.companyId}/${o.fundId}` })),
    wrapper: wrapper ? { id: wrapper.id, name: wrapper.names.he[0]! } : null,
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
    },
    today: t,
    goal: goalContext(),
    fit: fitTable(),
    stale: cma.periodValue.stale ?? null,
  };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${data?.track.name ?? companiesCopy.title} · ${site.name}` }];
}

export default function TrackPage() {
  const data = useLoaderData<typeof loader>();
  const { track } = data;
  const row = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col gap-0.5 py-3 border-b border-border last:border-b-0 md:grid md:grid-cols-[14rem_1fr] md:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
  // pension fees belong to the fund, not to the track (CAT-39)
  const feeText = (template: string, v: SiteValue) => feeLabel(template, feeYear(v)) + (track.dataset === "pensia-net" ? ` ${copy.feeWhole}` : "");
  return (
    <GoalsProvider presets={data.goal.presets as Presets}>
    <PageShell current="decoder" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: data.dimensionNames, today: data.today }}>
      <div className="flex flex-col gap-8 pt-2 lg:pt-8 max-w-page">
        <header className="flex flex-col gap-3">
          <Breadcrumb parent={{ href: `/companies/${track.companyId}`, label: track.companyName }} current={track.name} />
          <h1 className="text-2xl lg:text-3xl font-semibold flex flex-wrap items-center gap-3">
            <bdi>{track.name}</bdi>
            {data.isDefault && <Tag tone="parameter">{companyCopy.default}</Tag>}
          </h1>
          <Sentence tone="muted">
            {copy.fundLine} <Num value={data.values.fundId} />
          </Sentence>
          {data.others.length > 0 && (
            <Callout tone="caution">
              {copy.sameNameElsewhere} {companyCopy.sameName.distinct}.{" "}
              {data.others.map((o) => (
                <Link key={o.href} to={o.href} className="text-link underline">
                  {copy.toOther}
                </Link>
              ))}
            </Callout>
          )}
          <SavedGoalStrip variant="compact" presets={data.goal.presets as Presets} meta={data.goal.meta} today={data.today} />
        </header>
        <FitMarkCard table={data.fit} track={track} stale={data.stale} period={String(data.values.period.value)} />
        <Card>
          <dl className="flex flex-col">
            {row(copy.labels.manager, <Link to={`/companies/${track.companyId}`} className="text-link hover:underline"><bdi>{track.companyName}</bdi></Link>)}
            {row(
              copy.labels.product,
              <span className="flex flex-wrap items-center gap-3">
                <bdi>{track.classification}</bdi>
                {data.wrapper && (
                  <Link to={`/guide/${data.wrapper.id}`} className="inline-flex items-center gap-0.5 text-sm text-link hover:underline">
                    {copy.toGuide} {data.wrapper.name}
                    <IconDrillIn size={16} />
                  </Link>
                )}
                {data.wrapper && (
                  <Link to={`/workbench/tracks/${data.wrapper.id}`} className="inline-flex items-center gap-0.5 text-sm text-link hover:underline">
                    {r3workbench.links.group.before}
                    {data.wrapper.name}
                    {r3workbench.links.group.after}
                    <IconDrillIn size={16} />
                  </Link>
                )}
              </span>,
            )}
            {track.specialization && row(copy.labels.classification, <bdi>{track.specialization}</bdi>)}
            {track.subSpecialization && row(copy.labels.holds, <bdi>{track.subSpecialization}</bdi>)}
            {track.targetPopulation && row(copy.labels.population, <bdi>{track.targetPopulation}</bdi>)}
            {row(feeText(copy.feeBalanceLabel, data.values.balanceFee), <FeeNum value={data.values.balanceFee} />)}
            {row(feeText(copy.feeDepositLabel, data.values.depositFee), <FeeNum value={data.values.depositFee} />)}
            {data.values.inception && row(copy.labels.inception, <Num value={data.values.inception} />)}
            {row(copy.labels.period, <Num value={data.values.period} />)}
          </dl>
          <div className="pt-1 border-t border-border">
            <Link to={`/fees?track=${track.fundId}`} className="inline-flex items-center gap-0.5 text-link hover:underline min-h-target">
              {r3workbench.links.fees}
              <IconDrillIn size={16} />
            </Link>
          </div>
        </Card>
        {data.names.length > 0 && (
          <section aria-labelledby="also-h" className="flex flex-col gap-3">
            <h2 id="also-h" className="text-xl lg:text-2xl font-semibold">
              {catalogue.alsoCalled}
            </h2>
            <Card className="p-0 md:p-0">
              <ul className="flex flex-col divide-y divide-border">
                {data.names.map((n) => (
                  <li key={n.id} className="flex flex-col gap-1 p-4">
                    <span className="font-medium flex flex-col gap-0.5">
                      {n.names.map((x) => (
                        <bdi key={x}>{x}</bdi>
                      ))}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {catalogue.seenAt} <bdi dir="ltr">{n.where}</bdi> <NumAfter lead={catalogue.seenOn} value={n.seen as SiteValue} />
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}
        {data.checklist.length > 0 && (
          <section aria-labelledby="check-h" className="flex flex-col gap-4">
            <h2 id="check-h" className="text-xl lg:text-2xl font-semibold">
              מה לבדוק
            </h2>
            <DimensionChecklist rows={data.checklist} />
          </section>
        )}
      </div>
    </PageShell>
    </GoalsProvider>
  );
}
