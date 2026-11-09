// The first page (flows 6.1): the site name, one line, the search field, two doors and a small link. From xl the name stands at the
// start and the search and doors at the end.
import { Link, useLoaderData } from "react-router";
import { home as copy, knowledgeEntry, site } from "../copy";
import { IconDrillIn } from "../components/icons";
import { PageSearchField, PageShell } from "../components/shell";
import { Card, ChipList } from "../components/kit";

export async function loader() {
  const { loadHomeGuideDoor, today } = await import("../lib/data.server");
  return { today: today(), guideTypes: loadHomeGuideDoor() };
}

export function meta() {
  return [{ title: site.name }, { name: "description", content: site.tagline }];
}

export default function Home() {
  const { today, guideTypes } = useLoaderData<typeof loader>();
  return (
    <PageShell current="home" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
      <HomeBody guideTypes={guideTypes} />
    </PageShell>
  );
}

function DoorCard({ title, line }: { title: string; line: string }) {
  return (
    <Card className="h-full !p-5 flex items-start gap-3 hover:bg-accent/70 hover:border-primary/40 transition-colors duration-[var(--duration-fast)]">
      <span className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-sm text-muted-foreground">{line}</span>
      </span>
      <IconDrillIn size={24} className="text-foreground/70 shrink-0 mt-0.5 transition-transform group-hover:-translate-x-1" />
    </Card>
  );
}

/** The guide door: not a link to the list but the kinds themselves (P-10), each pill opening its own
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

function HomeBody({ guideTypes }: { guideTypes: { id: string; name: string }[] }) {
  return (
    <div className="mx-auto max-w-measure xl:max-w-none flex flex-col gap-8 pt-6 lg:pt-20 xl:grid xl:grid-cols-12 xl:gap-x-12 xl:items-start">
      <div className="flex flex-col gap-8 xl:col-span-7">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{site.name}</h1>
          <p className="text-lg text-muted-foreground">{site.tagline}</p>
          <p className="text-sm text-muted-foreground">{site.footerNote}</p>
        </header>
      </div>
      <div className="flex flex-col gap-8 xl:col-span-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="home-search" className="text-sm font-medium">
            {copy.searchLabel}
          </label>
          <PageSearchField inputId="home-search" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:w-[calc(100%+8rem)] lg:-mx-16 xl:w-auto xl:mx-0 xl:grid-cols-1">
          <GuideDoor types={guideTypes} />
          <Link to={copy.door2.href} className="block group">
            <DoorCard title={copy.door2.title} line={copy.door2.line} />
          </Link>
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
