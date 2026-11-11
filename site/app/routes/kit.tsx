// The component gallery (/kit): every component of the kit in its states. For builders and for reviewing the look; not in the menu, the
// search or the sitemap, and marked noindex.
import { useLoaderData } from "react-router";
import { kit as copy } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { KitGallery } from "../components/kit/gallery";
import { PageShell } from "../components/shell";

export async function loader() {
  const { today } = await import("../lib/data.server");
  return { today: today() };
}

export function meta({ location }: MetaPlace) {
  return [...pageMeta({ title: copy.gallery.title, description: copy.gallery.lede, location }), { name: "robots", content: "noindex" }];
}

export default function Kit() {
  const { today } = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today }}>
      <KitGallery today={today} />
    </PageShell>
  );
}
