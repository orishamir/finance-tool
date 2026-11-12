// Page not found (copy 4).
import { pagePreview, system } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { PageShell, useOpenSearch } from "../components/shell";
import { Button, PageHead, TextLink } from "../components/kit";

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: system.notFound.title, description: pagePreview.notFound, location });
}

export default function NotFound() {
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today: "" }}>
      <Body />
    </PageShell>
  );
}

function Body() {
  const open = useOpenSearch();
  return (
    <div className="max-w-measure flex flex-col gap-4">
      <PageHead title={system.notFound.title} />
      <div className="flex flex-wrap gap-x-6">
        <TextLink look="line" to="/">
          {system.notFound.home}
        </TextLink>
        <Button variant="quiet" flush onClick={(e) => open(e.currentTarget)}>
          {system.notFound.search}
        </Button>
      </div>
    </div>
  );
}
