// Screen 12 by link: the export and import sheet as a page (design-spec 15, flow 26): `/transfer` is the link the founder
// sends to a friend. From the holdings page, the saved-goal strip and the footer the same panel opens as a sheet.
import { useLoaderData } from "react-router";
import { r3transfer as copy, site } from "../copy";
import { Breadcrumb, PageShell } from "../components/shell";
import { TransferPanel } from "../components/transfer/panel";

export async function loader() {
  const { exportSiteInfo } = await import("../lib/holdings.server");
  const { today } = await import("../lib/data.server");
  return { site: exportSiteInfo(), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function TransferPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-6 pt-2 lg:pt-8 max-w-measure">
        <Breadcrumb parent={{ href: "/", label: site.name }} current={copy.title} />
        <TransferPanel site={data.site} />
      </div>
    </PageShell>
  );
}
