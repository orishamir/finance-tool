// `/rules/<shelf>`: the five addresses that were live for an hour before the rules became one page with filters. A line and a
// link, and on mount a replace-navigation to `/rules?shelf=<shelf>` (the query and the hash it came with are kept).
import { useEffect } from "react";
import { rulesPath } from "../lib/site-paths";
import { useLoaderData, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/rules-shelf";
import { pagePreview, rulesFront as copy } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { PageShell } from "../components/shell";
import { PageHead, TextLink } from "../components/kit";
import { shelfIds, type ShelfId } from "../lib/rule-shelves";

export function loader({ params }: Route.LoaderArgs) {
  const shelf = params.shelf as ShelfId;
  if (!shelfIds.includes(shelf)) throw new Response("Not found", { status: 404 });
  return { shelf };
}

export function meta({ params, location }: Route.MetaArgs) {
  const shelf = copy.shelves[params.shelf ?? ""];
  return pageMeta({ title: shelf ? `${shelf.name} · ${copy.title}` : copy.title, description: shelf ? pagePreview.shelf(shelf.line) : copy.lede, location });
}

export default function RulesShelf() {
  const { shelf } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { search, hash } = useLocation();
  const target = (() => {
    const p = new URLSearchParams(search);
    p.set("shelf", shelf);
    return rulesPath({ search: `?${p.toString().replace(/%2C/g, ",")}`, hash: hash.slice(1) });
  })();
  useEffect(() => {
    void navigate(target, { replace: true });
  }, [navigate, target]);
  return (
    <PageShell current="rules" data={{ rules: {}, terms: {}, dimensions: {}, today: "" }}>
      <div className="flex flex-col gap-2">
        <PageHead title={copy.shelves[shelf]?.name} />
        <TextLink look="line" to={target} replace>
          {copy.presetAll}
        </TextLink>
      </div>
    </PageShell>
  );
}
