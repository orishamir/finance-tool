// Page not found (copy 4).
import { Link } from "react-router";
import { pagePreview, system } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { PageShell, useOpenSearch } from "../components/shell";

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
    <div className="max-w-measure flex flex-col gap-4 pt-10">
      <h1 className="text-2xl font-semibold">{system.notFound.title}</h1>
      <div className="flex flex-wrap gap-x-6">
        <Link to="/" className="text-link min-h-target inline-flex items-center hover:underline">
          {system.notFound.home}
        </Link>
        <button type="button" className="text-link min-h-target hover:underline" onClick={(e) => open(e.currentTarget)}>
          {system.notFound.search}
        </button>
      </div>
    </div>
  );
}
