// Screen 5: the goal form (design-spec 7, flows 12 and 16): presets, the goal, the person and the assumptions.
// Everything typed is saved on the device as it is typed; the button only opens the comparison.
import { useLoaderData } from "react-router";
import { r2, site } from "../copy";
import { AssumptionFields, FormFooter, GoalFields, GoalsList, PresetRow, ProfileFields, type FormData } from "../components/compare/goal-form";
import { SavedGoalStrip } from "../components/compare/strip";
import { Breadcrumb, PageShell } from "../components/shell";
import { GoalsProvider, useGoals, type Presets } from "../lib/goal";

export async function loader() {
  const { goalFormData } = await import("../lib/compare.server");
  return goalFormData();
}

export function meta() {
  return [{ title: `${r2.form.title} · ${site.name}` }];
}

export default function GoalPage() {
  const data = useLoaderData<typeof loader>();
  const presets = data.presets as Presets;
  return (
    <GoalsProvider presets={presets}>
      <PageShell current="goal" data={{ rules: data.rules as never, terms: {}, dimensions: {}, today: data.today }}>
        <Form data={data.form as FormData} presets={presets} meta={data.meta} today={data.today} />
      </PageShell>
    </GoalsProvider>
  );
}

function Form({ data, presets, meta, today }: { data: FormData; presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { status } = useGoals();
  return (
    <div className="flex flex-col gap-6 pt-2 lg:pt-8">
      <Breadcrumb parent={{ href: "/", label: site.name }} current={r2.form.title} />
      {status === "old-version" && <SavedGoalStrip presets={presets} meta={meta} today={today} />}
      {status === "loading" ? (
        <p className="text-muted-foreground">{r2.loadingGoal}</p>
      ) : status === "old-version" ? null : (
        <>
          <GoalsList />
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl lg:text-3xl font-semibold">{r2.form.title}</h1>
            <p className="text-lg text-muted-foreground max-w-measure">{r2.form.lede}</p>
          </header>
          <PresetRow data={data} presets={presets} />
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:items-start">
            <div className="lg:col-start-1 lg:row-start-1">
              <GoalFields data={data} />
            </div>
            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <ProfileFields data={data} />
            </div>
            <div className="lg:col-start-1 lg:row-start-2">
              <AssumptionFields data={data} />
            </div>
            <div className="lg:col-start-1 lg:row-start-3">
              <FormFooter to="/goal/compare" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
