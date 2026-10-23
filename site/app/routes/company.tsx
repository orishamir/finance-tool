// Screen 4: the company page (design-spec 5 as redrawn 2026-10-23; flows 6.11): every track the company
// runs, grouped by the regulator's product type, same-name tracks grouped, the fee-pending note, the paste card.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/company";
import { companies as companiesCopy, company as copy, site } from "../copy";
import { groupTracks, PasteCard, TrackList } from "../components/decoder/tracks";
import { IconDrillIn } from "../components/icons";
import { Num } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Callout, Card, Disclosure } from "../components/ui";
import { fmt } from "../lib/format";

const classificationOrder = ["קופת גמל להשקעה", "קרנות השתלמות", "תגמולים ואישית לפיצויים", "קופת גמל להשקעה - חסכון לילד", "קרנות חדשות", "קרנות כלליות", "מרכזית לפיצויים", "מטרה אחרת"];

export async function loader({ params }: Route.LoaderArgs) {
  const { loadCma, loadTerms, loadWrappers, today } = await import("../lib/data.server");
  const cma = loadCma();
  const company = cma.companies.find((c) => c.id === params.id);
  if (!company) throw new Response("Not found", { status: 404 });
  const wrappers = loadWrappers();
  const terms = loadTerms();
  const collator = new Intl.Collator("he");
  const tracks = cma.tracks.filter((t) => t.companyId === company.id).sort((a, b) => collator.compare(a.name, b.name));
  const groups = [...new Set(tracks.map((t) => t.classification))]
    .sort((a, b) => (classificationOrder.indexOf(a) + 1 || 99) - (classificationOrder.indexOf(b) + 1 || 99))
    .map((classification) => {
      const list = tracks.filter((t) => t.classification === classification);
      const wrapper = wrappers.find((w) => w.id === list[0]!.wrapperId);
      return {
        classification,
        tracks: list,
        wrapper: wrapper ? { id: wrapper.id, name: wrapper.names.he[0]!, line: terms.find((t) => t.he === wrapper.names.he[0])?.explanation ?? null } : null,
      };
    });
  return { company, groups, period: cma.periodValue, today: today() };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${data?.company.name ?? companiesCopy.title} · ${site.name}` }];
}

function countLine(n: number) {
  if (n === 1) return copy.tracks.one;
  if (n === 2) return copy.tracks.two;
  return `${fmt.number(n)} ${copy.tracks.many}`;
}

export default function Company() {
  const data = useLoaderData<typeof loader>();
  const first = data.groups[0];
  const side = first?.wrapper;
  return (
    <PageShell current="decoder" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="lg:flex lg:gap-12 lg:items-start pt-2 lg:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={data.company.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              <bdi>{data.company.name}</bdi>
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground max-w-measure">
              {copy.lineBefore}
              <Num value={data.period} />.
            </p>
            {data.period.stale && (
              <Callout tone="caution">
                {copy.oldData} <bdi dir="ltr">{fmt.period(String(data.period.value))}</bdi>.
              </Callout>
            )}
          </header>

          <section aria-labelledby="tr-h" className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="tr-h" className="text-xl lg:text-2xl font-semibold">
                {copy.listHeading} <bdi>{data.company.name}</bdi>
              </h2>
              <span className="hidden lg:inline text-sm text-muted-foreground">{"בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק"}</span>
            </div>
            <Callout tone="caution">{copy.feesPending}</Callout>

            {data.groups.map((g, i) => (
              <Disclosure
                key={g.classification}
                defaultOpen={i === 0}
                className="flex flex-col gap-2"
                summaryClassName="min-h-12 md:min-h-14"
                label={
                  <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
                    <span className="text-lg lg:text-xl font-semibold">
                      <bdi>{g.classification}</bdi>
                    </span>
                    <span className="text-sm text-muted-foreground">{countLine(g.tracks.length)}</span>
                  </span>
                }
              >
                {g.wrapper && (
                  <Link to={`/guide/${g.wrapper.id}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline self-start px-1">
                    {copy.whatIs} {g.wrapper.name}
                    <IconDrillIn size={16} />
                  </Link>
                )}
                <TrackList groups={groupTracks(g.tracks.map((t) => ({ track: t, href: `/companies/${data.company.id}/${t.fundId}` })))} />
              </Disclosure>
            ))}
          </section>
          <PasteCard className="lg:hidden" />
        </div>

        <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-4 pt-[150px]" aria-label="עוד">
          {side && (
            <Card as="section" className="flex flex-col gap-2.5 lg:p-5" aria-labelledby="w-h">
              <span className="text-sm text-muted-foreground">{copy.productType}</span>
              <h2 id="w-h" className="text-lg font-semibold">
                {side.name}
              </h2>
              {side.line && <p className="text-sm">{side.line}</p>}
              <Link to={`/guide/${side.id}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline">
                {copy.toGuide} {side.name}
                <IconDrillIn size={16} />
              </Link>
            </Card>
          )}
          <PasteCard />
        </aside>
      </div>
    </PageShell>
  );
}
