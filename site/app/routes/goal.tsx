// Screen 5: the goal form (design-spec 7, flows 12 and 16): presets, the goal, the person and the assumptions.
// Everything typed is saved on the device as it is typed; the button only opens the comparison.
import { useLoaderData } from "react-router";
import { r2, site } from "../copy";
import { GoalFormBody, PresetRow, type FormData } from "../components/compare/goal-form";
import { GoalsList } from "../components/compare/goals-board";
import { SavedGoalStrip } from "../components/compare/strip";
import { Breadcrumb, PageShell } from "../components/shell";
import { GoalsProvider, useGoals, type Presets } from "../lib/goal";

export async function loader() {
  const { goalFormData, fitTable } = await import("../lib/compare.server");
  const d = goalFormData();
  // scenario fix 2026-10-24: P-04's equity minimum, for the worst-fall field's short-horizon hint
  const eq = fitTable().rows.find((r) => r.classification === "מניות")?.minYears.value;
  return { ...d, form: { ...d.form, equityMinYears: typeof eq === "number" ? eq : null } };
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
          <GoalFormBody data={data} to="/goal/compare" />
        </>
      )}
    </div>
  );
}
