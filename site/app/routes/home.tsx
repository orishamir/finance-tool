// The first page (flows 6.1): the name, the search, and three groups by what the reader came to do (components/home/body.tsx). The
// deposits row's figure is picked here, at build, from the deposits page's own data with its own pick (`startBest`).
import { useLoaderData } from "react-router";
import { site } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { PageShell } from "../components/shell";
import { HomeBody, type HomeDeposit } from "../components/home/body";

export async function loader() {
  const { loadHomeGuideDoor, today } = await import("../lib/data.server");
  const { buildDepositBrowser } = await import("../lib/deposit-browser.server");
  const { startBest } = await import("../lib/deposit-browser");
  const deposits = buildDepositBrowser();
  const best = startBest(deposits);
  const deposit: HomeDeposit | null = best ? { rate: best.rate_offered, bank: deposits.banks.find((b) => b.id === best.bank)?.name ?? best.bank, amount: deposits.start } : null;
  return { today: today(), guideTypes: loadHomeGuideDoor(), deposit };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: null, description: site.tagline, location });
}

export default function Home() {
  const { today, guideTypes, deposit } = useLoaderData<typeof loader>();
  return (
    <PageShell current="home" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
      <HomeBody guideTypes={guideTypes} deposit={deposit} />
    </PageShell>
  );
}
