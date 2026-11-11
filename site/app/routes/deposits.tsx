// "פיקדונות בכל הבנקים" (D92): every bank's standard shekel deposits side by side, by term, amount and kind of rate, with a chart of the
// highest rate in each term over the list and a grid of the banks by the eight terms (F-108). Its place on the site (the menu item, the tab beside the companies and the tracks) is `DEPOSITS_PLACE`.
import { useLoaderData } from "react-router";
import { depositBrowser as copy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { DepositBrowser } from "../components/deposits/browser";
import { HELP_TERMS, KIND_TERMS } from "../lib/deposit-browser";
import { CompanyTabs, DEPOSITS_PLACE } from "../components/decoder/company-tabs";
import { RulesLine } from "../components/provenance";
import { PageShell } from "../components/shell";

export async function loader() {
  const { buildDepositBrowser, depositBrowserRuleIds } = await import("../lib/deposit-browser.server");
  const { loadRules, termsFor, pointedRecords } = await import("../lib/data.server");
  const data = buildDepositBrowser();
  const all = loadRules();
  const lineIds = depositBrowserRuleIds(data).filter((id) => all[id]);
  // the cards behind the "?" of the column heads and of the kind of rate, in their deposit sense, with the rules they cite
  const terms = termsFor([...Object.values(HELP_TERMS), ...KIND_TERMS], "bank-deposit");
  const wanted = new Set(lineIds);
  for (const term of Object.values(terms)) for (const id of term.ruleIds) wanted.add(id);
  const rules = Object.fromEntries([...wanted].filter((id) => all[id]).map((id) => [id, all[id]!]));
  return { data, rules, pointed: pointedRecords(rules, all), ruleIds: lineIds, terms };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lead, location });
}

export default function Deposits() {
  const { data, rules, pointed, ruleIds, terms } = useLoaderData<typeof loader>();
  return (
    <PageShell current={DEPOSITS_PLACE.menu} data={{ rules, pointed, terms, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8">
        {DEPOSITS_PLACE.tab && <CompanyTabs current="deposits" />}
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-muted-foreground max-w-measure">{copy.lead}</p>
        </header>
        <DepositBrowser data={data} />
        <RulesLine ids={ruleIds} />
      </div>
    </PageShell>
  );
}
