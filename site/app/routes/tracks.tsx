// "כל המסלולים בכל החברות" (D54): every company's tracks of one product, grouped by company or by what the money
// is invested in, with the regulator's fee averages, the stock and currency exposure, the past yield and the assets beside them.
// Every product is one route (`tracks/:product?`): choosing another keeps the page and fetches nothing, as the index page does.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/tracks";
import type { SiteValue } from "../lib/value";
import { pagePreview, trackBrowser as copy } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { TrackBrowser, TracksHelp } from "../components/tracks/browser";
import { CompanyTabs } from "../components/decoder/company-tabs";
import { StaleSaid } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Callout, HeldMark, PageHead, When } from "../components/kit";

/** The data covers the six products, so moving between them keeps it (the address is read from the params). */
export function shouldRevalidate() {
  return false;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { buildTrackBrowser, templateRuleIds, trackProductIds } = await import("../lib/track-browser.server");
  const { loadRules, loadTerms, pointedShipment } = await import("../lib/data.server");
  const { HELP_TERMS } = await import("../lib/track-browser");
  if (params.product && !(trackProductIds as readonly string[]).includes(params.product)) throw new Response("Not found", { status: 404 });
  const data = buildTrackBrowser();
  const all = loadRules();
  // the rules the figures name (a fee's year and its "actually charged", a yield's period and "before fees", a deposit fee no law allows:
  // the CMA values' and templates' rule_ids), which their sheets open, and the child-savings note's age's (CS-18)
  const wanted = new Set<string>(["CAT-36", "CAT-37", "CAT-04", "CAT-05", "PF-06", "CS-18", ...templateRuleIds(data)]);
  // the cards behind the column heads' "?" (and the phone's line of them), with the rules they cite
  const wantedTerms = new Set<string>(Object.values(HELP_TERMS));
  const terms = Object.fromEntries(loadTerms().filter((x) => wantedTerms.has(x.he)).map((x) => [x.he, x]));
  for (const term of Object.values(terms)) for (const id of term.ruleIds) wanted.add(id);
  const ids = [...wanted].filter((id) => all[id]);
  const rules = Object.fromEntries(ids.map((id) => [id, all[id]!]));
  // the age until which National Insurance pays a child-savings fee, for the note over that list (CS-18, as the company page reads it)
  const childAge = (all["CS-18"]?.figures?.nii_pays_until_age ?? null) as SiteValue | null;
  return { data, rules, ...pointedShipment(rules, all), terms, childAge };
}

export function meta({ location }: Route.MetaArgs) {
  return pageMeta({ title: copy.title, description: pagePreview.tracks, location });
}

export default function Tracks() {
  const { data, rules, pointed, heads, terms, childAge } = useLoaderData<typeof loader>();
  return (
    <PageShell current="decoder" data={{ rules, pointed, heads, terms, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-5 lg:gap-6">
        <PageHead
          tabs={<CompanyTabs current="product" />}
          // on a phone, how to read the list is one "?" held to the title's last word (`TracksHelp`); the figures' underlines say they open,
          // and each figure's sheet says whether it is sourced or computed
          title={<HeldMark words={copy.title} mark={<TracksHelp data={data} childAge={childAge} />} />}
        >
          {data.period.stale && (
            <Callout tone="caution">
              <When iso={String(data.period.value)} lead={`${copy.oldData} `} />.
            </Callout>
          )}
        </PageHead>
        {/* the notice above says the regulator's figures are old: the list's figures do not each repeat it */}
        <StaleSaid on={!!data.period.stale}>
          <TrackBrowser data={data} childAge={childAge} />
        </StaleSaid>
      </div>
    </PageShell>
  );
}

