// One rule's card, pre-rendered as /rule-card/<id>.json for every rule (lib/paths.server.ts): a page ships in full only the rules its
// first view names, with the heads of the rules their cards point at, and the sheet fetches a rule's file when its chip is tapped.
import type { Route } from "./+types/rule-card";

export async function loader({ params }: Route.LoaderArgs) {
  const { ruleCardData } = await import("../lib/rule-uses.server");
  const file = ruleCardData(params.id);
  if (!file) throw new Response("Not found", { status: 404 });
  return Response.json(file);
}
