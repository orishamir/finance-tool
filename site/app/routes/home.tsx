// The first page (flows 6.1, amended 2026-10-24): the site name, one line, the question card (a saved goal replaces it with the
// strip), the search field, four doors and a small link. A phone shows the question first and the doors on the second screen;
// from xl the question stands at the start and the search and doors at the end.
import { lazy, Suspense } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { home as copy, knowledgeEntry, questions as questionsCopy, r3workbench, site } from "../copy";
import { IconDrillIn } from "../components/icons";
import { PageSearchField, PageShell } from "../components/shell";
import { QuickGoalCard } from "../components/compare/quick-goal";
import { Card, ChipList, Disclosure } from "../components/kit";
import { GoalsProvider, isBlank, useGoals, type Presets } from "../lib/goal";
import type { Range } from "../components/compare/goal-form";
import { useHoldings } from "../lib/state";
import { shown } from "../lib/review";

// The strip (and the comparison code behind it) is fetched only when a goal is saved on the device (audit 2026-10-24, A52).
const SavedGoalStrip = lazy(() => import("../components/compare/strip").then((m) => ({ default: m.SavedGoalStrip })));

export async function loader() {
  const { goalContext, goalFormData } = await import("../lib/compare.server");
  const { loadHomeGuideDoor, loadPinnedRules } = await import("../lib/data.server");
  const { form } = goalFormData();
  // the question card validates with the goal form's ranges (P-07 horizon, P-05 monthly)
  return { ...goalContext(), form: { horizon: form.horizon, monthly: form.monthly }, questions: loadPinnedRules().rows.slice(0, 3).map((r) => r.question_he), guideTypes: loadHomeGuideDoor() };
}

export function meta() {
  return [{ title: site.name }, { name: "description", content: site.tagline }];
}

export default function Home() {
  const { today, presets, meta, form, questions, guideTypes } = useLoaderData<typeof loader>();
  return (
    <GoalsProvider presets={presets as Presets}>
      <PageShell current="home" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
        <HomeBody presets={presets as Presets} meta={meta} today={today} bounds={form} questions={questions} guideTypes={guideTypes} />
      </PageShell>
    </GoalsProvider>
  );
}

function DoorCard({ title, line, extra }: { title: string; line: string; extra?: string | null }) {
  return (
    <Card className="h-full !p-5 flex items-start gap-3 hover:bg-accent/70 hover:border-primary/40 transition-colors duration-[var(--duration-fast)]">
      <span className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{line}</span>
        {extra && <span className="text-sm text-foreground">{extra}</span>}
      </span>
      <IconDrillIn size={24} className="text-foreground/70 shrink-0 mt-0.5 transition-transform group-hover:-translate-x-1" />
    </Card>
  );
}

/** The guide door (founder 2026-10-26, option A): not a link to the list but the kinds themselves (P-10), each pill opening its own
 * guide page, and a link to the whole list. The card keeps the other doors' title and line; the pills are the kit's ChipList. */
function GuideDoor({ types }: { types: { id: string; name: string }[] }) {
  return (
    <Card className="h-full !p-5 flex flex-col gap-3">
      <span className="flex flex-col gap-1">
        <span className="text-lg font-semibold">{copy.door1.title}</span>
        <span className="text-sm text-muted-foreground">{copy.door1.line}</span>
      </span>
      <ChipList
        heading={copy.door1.title}
        headingHidden
        items={types.map((t) => ({ id: t.id, label: t.name, href: `/guide/${t.id}` }))}
        value={null}
        footer={
          <Link to={copy.door1.href} className="text-sm text-link min-h-target inline-flex items-center gap-1 hover:underline self-start">
            {copy.door1.all}
            <IconDrillIn size={16} />
          </Link>
        }
      />
    </Card>
  );
}

type Bounds = { horizon: Range; monthly: Range };

/** The question, which the comparison and the holdings depend on (docs/design-spec.md 1a). The pre-rendered page and the first client render show
 * the card; a saved goal replaces it with the strip (in a box of at least the strip's height) and the card waits closed as "מטרה נוספת" (D12). */
function QuestionBlock({ presets, meta, today, bounds }: { presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string; bounds: Bounds }) {
  const { status, goals } = useGoals();
  // any goal holding something: the rows list them all, the blank ones too (2026-10-25)
  const has = status === "old-version" || (status === "ok" && goals.some((g) => !isBlank(g)));
  const wide = "lg:w-[calc(100%+8rem)] lg:-mx-16 xl:w-auto xl:mx-0";
  if (!has) return <QuickGoalCard mode="current" bounds={bounds} presets={presets} meta={meta} today={today} className={wide} />;
  return (
    <div className={`min-h-[5.5rem] flex flex-col gap-3 ${wide}`}>
      <Suspense fallback={<div className="h-14 rounded-lg bg-card border border-border" aria-hidden="true" />}>
        <SavedGoalStrip presets={presets} meta={meta} today={today} all />
      </Suspense>
      {status === "ok" && (
        <Disclosure label={<span className="font-medium">{copy.quick.another}</span>} summaryClassName="bg-card border border-border rounded-lg px-4">
          <QuickGoalCard mode="new" bounds={bounds} presets={presets} meta={meta} today={today} className="mt-3" />
        </Disclosure>
      )}
    </div>
  );
}

function HomeBody({ presets, meta, today, bounds, questions, guideTypes }: { questions: string[]; guideTypes: { id: string; name: string }[]; presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string; bounds: Bounds }) {
  const { ready, holdings } = useHoldings();
  const names = holdings.map((h) => h.track?.name ?? h.typedName ?? h.company.name);
  const holdingsLine = ready && holdings.length > 0 ? (holdings.length === 1 ? copy.holdingsSaved.one : copy.holdingsSaved.many).replace("{n}", String(holdings.length)).replace("{names}", names.slice(0, 2).join(", ") + (names.length > 2 ? "…" : "")) : null;
  return (
    <div className="mx-auto max-w-measure xl:max-w-page flex flex-col gap-8 pt-6 lg:pt-20 xl:grid xl:grid-cols-12 xl:gap-x-12 xl:items-start">
      <div className="flex flex-col gap-8 xl:col-span-7">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{site.name}</h1>
          <p className="text-lg text-muted-foreground">{site.tagline}</p>
          <p className="text-sm text-muted-foreground">{site.footerNote}</p>
        </header>
        <QuestionBlock presets={presets} meta={meta} today={today} bounds={bounds} />
        <Card className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{questionsCopy.home.title}</h2>
          <ul className="flex flex-col">
            {questions.map((q, i) => (
              <li key={q} className={i > 0 ? "border-t border-border" : undefined}>
                <Link to={`/questions#q-${i + 1}`} className="min-h-target flex items-center justify-between gap-3 py-2 hover:underline">
                  <span>{q}</span>
                  <IconDrillIn size={20} className="text-foreground/70 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/questions" className="text-link min-h-target inline-flex items-center hover:underline self-start">
            {questionsCopy.home.all}
          </Link>
        </Card>
      </div>
      <div className="flex flex-col gap-8 xl:col-span-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="home-search" className="text-sm font-medium">
            {copy.searchLabel}
          </label>
          <PageSearchField inputId="home-search" />
        </div>
        {/* NEW: the third door (design-system 6.9) was added after the founder approved the first page with two doors;
            the fourth (design-system 7.9, flows 12.5, "chosen 2026-10-23, revisable") is for his review the same way */}
        <div className="grid gap-4 md:grid-cols-2 lg:w-[calc(100%+8rem)] lg:-mx-16 xl:w-auto xl:mx-0 xl:grid-cols-1">
          <GuideDoor types={guideTypes} />
          {[copy.door2, copy.door3, r3workbench.entry.holdings].filter((door) => shown(door.href)).map((door) => (
            <Link key={door.href} to={door.href} className="block group">
              <DoorCard title={door.title} line={door.line} extra={door.href === r3workbench.entry.holdings.href ? holdingsLine : null} />
            </Link>
          ))}
        </div>
        <Link to={site.notCovered.href} className="text-sm text-link min-h-target inline-flex items-center hover:underline self-start">
          {site.notCovered.label}
        </Link>
        <p className="text-sm text-muted-foreground">
          {knowledgeEntry.homeLine}{" "}
          <Link to="/rules" className="text-link min-h-target inline-flex items-center hover:underline">
            {knowledgeEntry.homeLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
