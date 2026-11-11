// Screen 12 by link: the export and import panel as a page (design-spec 15, flow 26): `/transfer` is the link the founder
// sends to a friend.
import { useLoaderData } from "react-router";
import { r3transfer as copy, site } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Breadcrumb, PageShell } from "../components/shell";
import { TransferPanel } from "../components/transfer/panel";

export async function loader() {
  const { exportSiteInfo, today } = await import("../lib/data.server");
  return { site: exportSiteInfo(), today: today() };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

export default function TransferPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-6 pt-2 lg:pt-8">
        <Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />
        <TransferPanel site={data.site} />
      </div>
    </PageShell>
  );
}
