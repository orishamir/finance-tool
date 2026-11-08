// A provident wrapper's company listing (design-spec 17 edge cases): every manager's list fees from the snapshots, not ranked,
// beside the wrapper's track page. The securities account's house ranking that this address also served was removed:
// the index page ranks the houses.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import type { Route } from "./+types/workbench-providers";
import { r4workbench as c, site } from "../copy";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout } from "../components/kit";
import { ProvidentListing } from "../components/workbench/providers/provident";
import { buildProvidentListing, loadWorkbenchBundle, type WorkbenchBundle } from "../lib/providers";
import { bundleLinks } from "../lib/bundle";
import { recordsById } from "../lib/scope";

/** The data files this page fetches after it starts, requested with the HTML (audit 2026-10-24, A52). */
export const links = () => bundleLinks("workbench-bundle.json");

export async function loader({ params }: Route.LoaderArgs) {
  const { providerWrapperIds } = await import("../lib/providers.server");
  const { loadWrappers, today } = await import("../lib/data.server");
  if (!providerWrapperIds().includes(params.wrapper)) throw new Response("Not found", { status: 404 });
  const wrapper = loadWrappers().find((w) => w.id === params.wrapper);
  return { today: today(), wrapperId: params.wrapper, wrapperName: wrapper?.names.he[0] ?? params.wrapper };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  const t = c.providers.provident.title;
  return [{ title: `${t.before}${data?.wrapperName ?? ""}${t.after} · ${site.name}` }];
}

export default function WorkbenchProviders() {
  const data = useLoaderData<typeof loader>();
  const [wb, setWb] = useState<WorkbenchBundle | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadWorkbenchBundle()
      .then(setWb)
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries((wb?.rules ?? []).map((r) => [r.id, r as RuleRecord]));
    return { rules, pointed: recordsById(wb?.pointed), terms: {}, dimensions: {}, today: data.today };
  }, [wb, data.today]);
  const listing = useMemo(() => (wb ? buildProvidentListing(wb, data.wrapperId) : null), [wb, data.wrapperId]);
  const title = c.providers.provident.title;
  return (
    <PageShell current="other" data={provenance}>
      <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
        <header className="flex flex-col gap-3">
          <Breadcrumb parent={{ href: `/guide/${data.wrapperId}`, label: c.providers.back }} current={`${title.before}${data.wrapperName}${title.after}`} />
          <h1 className="text-2xl lg:text-3xl font-semibold">
            {title.before}
            <bdi>{data.wrapperName}</bdi>
            {title.after}
          </h1>
        </header>
        {failed ? (
          <Callout tone="caution">{c.providers.failed}</Callout>
        ) : !listing ? (
          <p className="text-muted-foreground">{c.providers.loading}</p>
        ) : (
          <>
            <ProvidentListing listing={listing} wrapperId={data.wrapperId} />
            <nav className="flex flex-wrap gap-x-6 text-sm" aria-label={site.linksAria}>
              <Link to={`/guide/${data.wrapperId}`} className="text-link hover:underline min-h-target inline-flex items-center">
                {c.providers.links.guide}
              </Link>
            </nav>
          </>
        )}
      </div>
    </PageShell>
  );
}
