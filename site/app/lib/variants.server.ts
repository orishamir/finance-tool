// The fund-variant page's server side (flow 30, design-spec 18): the saved fund lists, when there are any, and the
// links out to the lists themselves. Server-only. `data/fund-lists/` does not exist, so the page holds no list and
// says so.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fundListFile, type FundListFile } from "@finance-tool/schema";
import { refLink, root } from "./data.server";
import { readJsonCached } from "./read-cache.server";

/** The latest file of each list under `data/fund-lists/`, none when the folder does not exist. */
export function loadFundLists(): FundListFile[] {
  const dir = join(root, "data/fund-lists");
  if (!existsSync(dir)) return [];
  const latest = new Map<string, FundListFile>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const parsed = fundListFile.safeParse(readJsonCached(join(dir, f)));
    if (!parsed.success) throw new Error(`data/fund-lists/${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    const prev = latest.get(parsed.data.list);
    if (!prev || parsed.data.snapshot >= prev.snapshot) latest.set(parsed.data.list, parsed.data);
  }
  return [...latest.values()];
}

/** The link the indices page gives: Maya's fund list (CAT-34) beside the funds without a record. */
export function workbenchLinks() {
  return {
    maya: refLink("tracks-catalogue-and-decoder.md", "CAT-34", /maya\.tase\.co\.il/),
  };
}
