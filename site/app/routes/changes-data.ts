// One year of the change log (lib/changes.server.ts), pre-rendered at build and fetched by /changes when the picked
// date reaches into it.
import type { Route } from "./+types/changes-data";

export async function loader({ params }: Route.LoaderArgs) {
  const { changesYear } = await import("../lib/changes.server");
  return Response.json(changesYear(Number(params.year)));
}
