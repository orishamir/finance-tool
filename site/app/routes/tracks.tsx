// "כל המסלולים בכל החברות" (D54): every company's tracks of one product, grouped by company or by what the money
// is invested in, with the regulator's fee averages, the stock and currency exposure, the past yield and the assets beside them.
// Every product is one route (`tracks/:product?`): choosing another keeps the page and fetches nothing, as the index page does.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/tracks";
import { pagePreview, trackBrowser as copy } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { TrackBrowser } from "../components/tracks/browser";
import { CompanyTabs } from "../components/decoder/company-tabs";
import { NumAfter, NumberLegend, RulesLine, StaleSaid } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Callout, PageHead, When } from "../components/kit";

/** The data covers the six products, so moving between them keeps it (the address is read from the params). */
export function shouldRevalidate() {
  return false;
}

export async function loader({ params }: Route.LoaderArgs) {
  const { buildTrackBrowser, templateRuleIds, trackProductIds } = await import("../lib/track-browser.server");
  const { loadRules, loadTerms, pointedRecords } = await import("../lib/data.server");
  const { HELP_TERMS } = await import("../lib/track-browser");
  if (params.product && !(trackProductIds as readonly string[]).includes(params.product)) throw new Response("Not found", { status: 404 });
  const data = buildTrackBrowser();
  const all = loadRules();
  const wanted = new Set<string>(["CAT-36", "CAT-37", "CAT-04", "CAT-05", "PF-06", ...templateRuleIds(data)]);
  const lineIds = [...wanted].filter((id) => all[id]);
  // the cards behind the column heads' "?" (and the phone's line of them), with the rules they cite
  const wantedTerms = new Set<string>(Object.values(HELP_TERMS));
  const terms = Object.fromEntries(loadTerms().filter((x) => wantedTerms.has(x.he)).map((x) => [x.he, x]));
  for (const term of Object.values(terms)) for (const id of term.ruleIds) wanted.add(id);
  const ids = [...wanted].filter((id) => all[id]);
  const rules = Object.fromEntries(ids.map((id) => [id, all[id]!]));
  return { data, rules, pointed: pointedRecords(rules, all), ruleIds: lineIds, terms };
}

export function meta({ location }: Route.MetaArgs) {
  return pageMeta({ title: copy.title, description: pagePreview.tracks, location });
}

export default function Tracks() {
  const { data, rules, pointed, ruleIds, terms } = useLoaderData<typeof loader>();
  return (
    <PageShell current="decoder" data={{ rules, pointed, terms, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-5 lg:gap-6">
        <PageHead
          tabs={<CompanyTabs current="product" />}
          title={copy.title}
          lede={
            <>
              {data.feeYear ? (
                <>
                  <NumAfter lead={copy.lead.intro} value={data.feeYear} />
                  <NumAfter lead={copy.lead.figures} value={data.period} />
                </>
              ) : (
                <NumAfter lead={copy.lead.noYear} value={data.period} />
              )}
              {copy.lead.source}
            </>
          }
        >
          <NumberLegend />
          {data.period.stale && (
            <Callout tone="caution">
              <When iso={String(data.period.value)} lead={`${copy.oldData} `} />.
            </Callout>
          )}
        </PageHead>
        {/* the notice above says the regulator's figures are old: the list's figures do not each repeat it */}
        <StaleSaid on={!!data.period.stale}>
          <TrackBrowser data={data} />
        </StaleSaid>
        <RulesLine ids={ruleIds} />
      </div>
    </PageShell>
  );
}

