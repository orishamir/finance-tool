// Screen 11: the track workbench (design-spec 14, flows 25, 27). Every track of every managing company for one
// wrapper in the latest regulator period, with the two average fees, the class reference and the fit mark.
// Pre-rendered per wrapper with no goal; the marks and the coverage counts fill in after hydration.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/workbench-tracks";
import { companies as companiesCopy, company as companyCopy, fit as fitCopy, r3workbench as copy, site } from "../copy";
import { Workbench, WorkbenchTabs } from "../components/workbench/workbench";
import { Num, RulesLine } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { SavedGoalStrip } from "../components/compare/strip";
import { useGoalHorizon } from "../components/compare/fit";
import { Callout } from "../components/ui";
import { GoalsProvider, useGoals, type Presets } from "../lib/goal";
import { fmt } from "../lib/format";
import { feeYear } from "../lib/value";
import type { WbData } from "../lib/workbench";

const ruleIds = ["CAT-36", "CAT-37", "CAT-10"] as const;

export async function loader({ params }: Route.LoaderArgs) {
  const { buildWorkbench } = await import("../lib/workbench.server");
  const { loadRules } = await import("../lib/data.server");
  const { goalContext } = await import("../lib/compare.server");
  const wb = buildWorkbench(params.wrapper);
  if (!wb) throw new Response("Not found", { status: 404 });
  const rules = loadRules();
  const ids = wb.dataset === "pensia-net" ? [...ruleIds, "CAT-39"] : [...ruleIds];
  return { wb, goal: goalContext(), rules: Object.fromEntries(ids.filter((id) => rules[id]).map((id) => [id, rules[id]!])), ruleIds: ids.filter((id) => rules[id]) };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${copy.title.before}${data?.wb.wrapperName ?? ""}${copy.title.after} · ${site.name}` }];
}

function NoGoalLine() {
  const { status } = useGoals();
  const goal = useGoalHorizon();
  if (status === "loading") return <div className="h-5" aria-hidden="true" />;
  if (goal) return null;
  return (
    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
      {copy.noGoal}
      <Link to="/goal" className="text-link min-h-target inline-flex items-center hover:underline">
        {fitCopy.noGoalLink}
      </Link>
    </p>
  );
}

export default function WorkbenchTracks() {
  const { wb, goal, rules, ruleIds: ids } = useLoaderData<typeof loader>();
  const year = wb.feeYear ? feeYear(wb.feeYear) : null;
  return (
    <GoalsProvider presets={goal.presets as Presets}>
      <PageShell current="decoder" data={{ rules, terms: {}, dimensions: {}, today: goal.today }}>
        <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8 max-w-page">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={`${copy.title.before}${wb.wrapperName}${copy.title.after}`} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              {copy.title.before}
              <bdi>{wb.wrapperName}</bdi>
              {copy.title.after}
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground max-w-measure">
              {copy.line.before}
              <Num value={wb.period} />
              {wb.feeYear && year ? (
                <>
                  {copy.line.mid}
                  <Num value={wb.feeYear} />
                  {copy.line.after}
                </>
              ) : (
                copy.line.noYear
              )}
            </p>
            {wb.stale && (
              <Callout tone="caution">
                {copy.oldData}
                <bdi dir="ltr">{fmt.period(String(wb.period.value))}</bdi>.
              </Callout>
            )}
            <SavedGoalStrip variant="compact" label={fitCopy.companyLine} presets={goal.presets as Presets} meta={goal.meta} today={goal.today} />
            <NoGoalLine />
            <Link to={`/guide/${wb.wrapperId}`} className="text-sm text-link hover:underline min-h-target inline-flex items-center self-start">
              {companyCopy.toGuide} {wb.wrapperName}
            </Link>
          </header>
          <WorkbenchTabs current="track" wrapperId={wb.wrapperId} />
          {wb.rows.length === 0 ? <Callout tone="info">{copy.noTracks}</Callout> : <Workbench data={wb as unknown as WbData} />}
          <RulesLine ids={ids} />
        </div>
      </PageShell>
    </GoalsProvider>
  );
}
