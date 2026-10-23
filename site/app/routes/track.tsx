// The track page (flows 6.12): the fund's official record and its date, what to check, and the guide link.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/track";
import { companies as companiesCopy, company as companyCopy, site, track as copy } from "../copy";
import { DimensionChecklist, type ChecklistRowView } from "../components/guide/sections";
import { IconDrillIn } from "../components/icons";
import { Num } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card } from "../components/ui";
import type { SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  const { loadChecklistRows, loadCma, loadRules, loadWrappers, today } = await import("../lib/data.server");
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
  return {
    track,
    others: others.map((o) => ({ fundId: o.fundId, href: `/companies/${o.companyId}/${o.fundId}` })),
    wrapper: wrapper ? { id: wrapper.id, name: wrapper.names.he[0]! } : null,
    checklist,
    rules: citedRules,
    dimensionNames: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    values: {
      fundId: sourced(String(track.fundId), "text"),
      period: cma.periodValue,
      inception: track.inception ? sourced(track.inception, "text") : null,
    },
    today: t,
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
  return (
    <PageShell current="decoder" data={{ rules: data.rules, terms: {}, dimensions: data.dimensionNames, today: data.today }}>
      <div className="flex flex-col gap-8 pt-2 lg:pt-8 max-w-page">
        <header className="flex flex-col gap-3">
          <Breadcrumb parent={{ href: `/companies/${track.companyId}`, label: track.companyName }} current={track.name} />
          <h1 className="text-2xl lg:text-3xl font-semibold">
            <bdi>{track.name}</bdi>
          </h1>
          <p className="text-muted-foreground">
            {copy.fundLine} <Num value={data.values.fundId} />
          </p>
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
        </header>
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
              </span>,
            )}
            {track.specialization && row(copy.labels.classification, <bdi>{track.specialization}</bdi>)}
            {track.subSpecialization && row(copy.labels.holds, <bdi>{track.subSpecialization}</bdi>)}
            {track.targetPopulation && row(copy.labels.population, <bdi>{track.targetPopulation}</bdi>)}
            {row(copy.labels.feeBalance, <span className="text-muted-foreground">{copy.feePending}</span>)}
            {row(copy.labels.feeDeposit, <span className="text-muted-foreground">{copy.feePending}</span>)}
            {data.values.inception && row(copy.labels.inception, <Num value={data.values.inception} />)}
            {row(copy.labels.period, <Num value={data.values.period} />)}
          </dl>
        </Card>
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
  );
}
