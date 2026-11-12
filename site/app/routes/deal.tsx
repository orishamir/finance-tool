// The fee page (method §10.6): one deal's fees as the person enters them, and what the deal charges, on what and when. The deal is kept on
// this device; the page's data (the kinds a deal can be with their caps, the price lists and tracks that fill a deal, the rules the caps
// cite, the glossary cards of its fees) is fetched once after the page starts. Pre-rendered as its head alone: everything under it waits
// for the device's day and deals.
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { feeDeal, pagePreview } from "../copy";
import { FeeDealPage } from "../components/fee-deal/page";
import { PageShell } from "../components/shell";
import { bundleLinks } from "../lib/bundle";
import { loadFeesData, type FeesData } from "../lib/fee-page-data";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { recordsById } from "../lib/scope";

/** The data file this page fetches after it starts, requested with the HTML. */
export const links = () => bundleLinks("deal-data.json");

export async function loader() {
  const { today } = await import("../lib/data.server");
  return { today: today() };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: feeDeal.title, description: pagePreview.fees, location });
}

export default function FeesPage() {
  const { today } = useLoaderData<typeof loader>();
  const [data, setData] = useState<FeesData | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    loadFeesData()
      .then(setData)
      .catch(() => setFailed(true));
  }, []);
  const provenance = useMemo(() => {
    const rules: Record<string, RuleRecord> = Object.fromEntries((data?.rules ?? []).map((r) => [r.id, r]));
    return { rules, pointed: recordsById(data?.pointed), terms: data?.terms ?? {}, dimensions: {}, today };
  }, [data, today]);
  return (
    <PageShell current="other" data={provenance}>
      <FeeDealPage data={data} failed={failed} />
    </PageShell>
  );
}
