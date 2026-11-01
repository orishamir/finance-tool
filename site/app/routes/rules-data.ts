// One shelf's rule records and their uses, pre-rendered as /rules-data/<shelf>.json: the rules page fetches a shelf's file only
// when a group of that shelf is opened, a filter shows its cards, or the address names one of its rules.
import type { Route } from "./+types/rules-data";
import { shelfIds, type ShelfId } from "../lib/rule-shelves";

export async function loader({ params }: Route.LoaderArgs) {
  const shelf = params.shelf as ShelfId | "companies";
  const { companyTermsBundle, shelfBundle } = await import("../lib/rule-uses.server");
  // the terms the site read at companies, for what a claim finds there (the rules page, 2026-11-01)
  if (shelf === "companies") return Response.json(companyTermsBundle());
  if (!shelfIds.includes(shelf)) throw new Response("Not found", { status: 404 });
  return Response.json(shelfBundle(shelf));
}
