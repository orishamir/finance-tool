// `/rules/<shelf>`: the five addresses that were live for an hour before the rules became one page with filters. A line and a
// link, and on mount a replace-navigation to `/rules?shelf=<shelf>` (the query and the hash it came with are kept).
import { useEffect } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/rules-shelf";
import { rulesFront as copy, site } from "../copy";
import { PageShell } from "../components/shell";
import { shelfIds, type ShelfId } from "../lib/rule-shelves";

export function loader({ params }: Route.LoaderArgs) {
  const shelf = params.shelf as ShelfId;
  if (!shelfIds.includes(shelf)) throw new Response("Not found", { status: 404 });
  return { shelf };
}

export function meta({ params }: Route.MetaArgs) {
  const name = copy.shelves[params.shelf ?? ""]?.name ?? copy.title;
  return [{ title: `${name} · ${copy.title} · ${site.name}` }];
}

export default function RulesShelf() {
  const { shelf } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { search, hash } = useLocation();
  const target = (() => {
    const p = new URLSearchParams(search);
    p.set("shelf", shelf);
    return `/rules?${p.toString().replace(/%2C/g, ",")}${hash}`;
  })();
  useEffect(() => {
    void navigate(target, { replace: true });
  }, [navigate, target]);
  return (
    <PageShell current="rules" data={{ rules: {}, terms: {}, dimensions: {}, today: "" }}>
      <div className="pt-2 lg:pt-8 flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.shelves[shelf]?.name}</h1>
        <Link to={target} replace className="text-link min-h-target inline-flex items-center hover:underline self-start">
          {copy.filters.presetAll}
        </Link>
      </div>
    </PageShell>
  );
}
