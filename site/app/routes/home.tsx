// The first page (flows 6.1): the site name, one line, the search field, two doors and a small link.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import { home as copy, site } from "../copy";
import { IconDrillIn, IconSearch } from "../components/icons";
import { PageShell, useOpenSearch } from "../components/shell";
import { Card } from "../components/ui";

export async function loader() {
  const { today } = await import("../lib/data.server");
  return { today: today() };
}

export function meta() {
  return [{ title: site.name }, { name: "description", content: site.tagline }];
}

export default function Home() {
  const { today } = useLoaderData<typeof loader>();
  return (
    <PageShell current="home" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
      <HomeBody />
    </PageShell>
  );
}

function HomeBody() {
  const open = useOpenSearch();
  return (
    <div className="mx-auto max-w-measure flex flex-col gap-8 pt-10 lg:pt-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{site.name}</h1>
        <p className="text-lg text-muted-foreground">{site.tagline}</p>
      </header>
      <div className="flex flex-col gap-2">
        <label htmlFor="home-search" className="text-sm font-medium">
          {copy.searchLabel}
        </label>
        <div className="field-box text-muted-foreground">
          <IconSearch size={18} />
          <input id="home-search" dir="auto" placeholder={site.searchPlaceholder} className="field-input !text-start" onFocus={(e) => open(e.currentTarget, e.currentTarget.value)} onChange={(e) => open(e.currentTarget, e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[copy.door1, copy.door2].map((door) => (
          <Link key={door.href} to={door.href} className="block group">
            <Card className="h-full flex items-center justify-between gap-4 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)]">
              <span className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{door.title}</span>
                <span className="text-sm text-muted-foreground">{door.line}</span>
              </span>
              <IconDrillIn className="text-muted-foreground shrink-0" />
            </Card>
          </Link>
        ))}
      </div>
      <Link to={site.notCovered.href} className="text-sm text-link min-h-target inline-flex items-center hover:underline self-start">
        {site.notCovered.label}
      </Link>
    </div>
  );
}
