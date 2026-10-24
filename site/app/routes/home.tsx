// The first page (flows 6.1): the site name, one line, the search field, two doors and a small link.
import { lazy, Suspense } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { home as copy, r3workbench, site } from "../copy";
import { IconDrillIn } from "../components/icons";
import { PageSearchField, PageShell } from "../components/shell";
import { Card } from "../components/ui";
import { GoalsProvider, isBlank, useGoals, type Presets } from "../lib/goal";
import { useHoldings } from "../lib/state";

// The strip (and the comparison code behind it) is fetched only when a goal is saved on the device (audit 2026-10-24, A52).
const SavedGoalStrip = lazy(() => import("../components/compare/strip").then((m) => ({ default: m.SavedGoalStrip })));

export async function loader() {
  const { goalContext } = await import("../lib/compare.server");
  return goalContext();
}

export function meta() {
  return [{ title: site.name }, { name: "description", content: site.tagline }];
}

export default function Home() {
  const { today, presets, meta } = useLoaderData<typeof loader>();
  return (
    <GoalsProvider presets={presets as Presets}>
      <PageShell current="home" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
        <HomeBody presets={presets as Presets} meta={meta} today={today} />
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

/** The goal, which the comparison and the holdings depend on, as a card as heavy as the doors (audit 2026-10-24, A55).
 * The pre-rendered page and the first client render show the door; a saved goal replaces it, in a box of at least the same height. */
function GoalCard({ presets, meta, today }: { presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { status, current } = useGoals();
  const has = status === "old-version" || (status === "ok" && current && !isBlank(current));
  if (has) {
    return (
      <div className="min-h-[5.5rem] md:col-span-2">
        <Suspense fallback={<div className="h-14 rounded-lg bg-card border border-border" aria-hidden="true" />}>
          <SavedGoalStrip presets={presets} meta={meta} today={today} />
        </Suspense>
      </div>
    );
  }
  return (
    <Link to={copy.goalDoor.href} className="block group md:col-span-2 min-h-[5.5rem]">
      <DoorCard title={copy.goalDoor.title} line={copy.goalDoor.line} />
    </Link>
  );
}

function HomeBody({ presets, meta, today }: { presets: Presets; meta: { rationale: string; rationaleHe?: string | null; signedOffOn: string | null }; today: string }) {
  const { ready, holdings } = useHoldings();
  const names = holdings.map((h) => h.track?.name ?? h.typedName ?? h.company.name);
  const holdingsLine = ready && holdings.length > 0 ? (holdings.length === 1 ? copy.holdingsSaved.one : copy.holdingsSaved.many).replace("{n}", String(holdings.length)).replace("{names}", names.slice(0, 2).join(", ") + (names.length > 2 ? "…" : "")) : null;
  return (
    <div className="mx-auto max-w-measure flex flex-col gap-8 pt-10 lg:pt-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{site.name}</h1>
        <p className="text-lg text-muted-foreground">{site.tagline}</p>
        <p className="text-sm text-muted-foreground">{site.footerNote}</p>
      </header>
      <div className="flex flex-col gap-2">
        <label htmlFor="home-search" className="text-sm font-medium">
          {copy.searchLabel}
        </label>
        <PageSearchField inputId="home-search" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:w-[calc(100%+8rem)] lg:-mx-16">
        <GoalCard presets={presets} meta={meta} today={today} />
        {/* NEW: the third door (design-system 6.9) was added after the founder approved the first page with two doors;
            the fourth (design-system 7.9, flows 12.5, "chosen 2026-10-23, revisable") is for his review the same way */}
        {[copy.door1, copy.door2, copy.door3, r3workbench.entry.holdings].map((door) => (
          <Link key={door.href} to={door.href} className="block group">
            <DoorCard title={door.title} line={door.line} extra={door.href === r3workbench.entry.holdings.href ? holdingsLine : null} />
          </Link>
        ))}
      </div>
      <Link to={site.notCovered.href} className="text-sm text-link min-h-target inline-flex items-center hover:underline self-start">
        {site.notCovered.label}
      </Link>
    </div>
  );
}
