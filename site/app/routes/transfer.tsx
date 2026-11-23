// Screen 12 by link: the export and import panel as a page (design-spec 15, flow 26): `/transfer` is the link the founder
// sends to a friend.
import { useLoaderData } from "react-router";
import { r3transfer as copy, site } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Breadcrumb, PageShell } from "../components/shell";
import { TransferPanel } from "../components/transfer/panel";

export async function loader() {
  const { exportSiteInfo, loadParameters, today } = await import("../lib/data.server");
  const { p05Bounds } = await import("../lib/engine");
  const p05 = loadParameters().find((p) => p.method_id === "P-05");
  if (!p05) throw new Error("data/parameters/ holds no P-05 record");
  // an imported plan number is checked against the bound the fields hold (lib/plan-bounds.ts)
  return { site: exportSiteInfo(), today: today(), bounds: p05Bounds(p05) };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

export default function TransferPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <TransferPanel site={data.site} bounds={data.bounds} crumb={<Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />} />
    </PageShell>
  );
}
