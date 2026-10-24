// The fund-variant page's server side (flow 30, design-spec 18): the saved fund lists, when there are any, and the
// links out to the lists themselves. Server-only. A list ships only when its republishing terms are confirmed
// (architecture 3.3; CAT-43: Maya's export may be downloaded for personal use, not republished), so until then the
// page holds no list and says so.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fundListFile, type FundListFile } from "@finance-tool/schema";
import { root } from "./data.server";
import type { RefLink } from "./providers";

/** The latest file of each list whose terms are confirmed. `data/fund-lists/` does not exist yet. */
export function loadFundLists(): FundListFile[] {
  const dir = join(root, "data/fund-lists");
  if (!existsSync(dir)) return [];
  const latest = new Map<string, FundListFile>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const parsed = fundListFile.safeParse(JSON.parse(readFileSync(join(dir, f), "utf8")));
    if (!parsed.success) throw new Error(`data/fund-lists/${f}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    if (parsed.data.terms_of_use.status !== "confirmed") continue;
    const prev = latest.get(parsed.data.list);
    if (!prev || parsed.data.snapshot >= prev.snapshot) latest.set(parsed.data.list, parsed.data);
  }
  return [...latest.values()];
}

/** A link written in an il-finance reference under a rule's heading, found by its link text or address. */
export function refLink(file: string, heading: string, match: RegExp): RefLink | null {
  const path = join(root, ".claude/skills/il-finance/references", file);
  if (!existsSync(path)) return null;
  const doc = readFileSync(path, "utf8");
  const start = doc.indexOf(`### ${heading}`);
  if (start < 0) return null;
  const end = doc.indexOf("\n### ", start + 5);
  const section = doc.slice(start, end < 0 ? undefined : end);
  for (const m of section.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) if (match.test(m[1]!) || match.test(m[2]!)) return { href: m[2]!, title: m[1]!, ruleId: heading.split(" ")[0]! };
  return null;
}

/** The links the two pages give: the Bank of Israel's fee dashboard (BRK-26), TASE's fee calculator (BRK-37), Maya's fund list (CAT-34) and TASE's foreign-fund list (ETF-32). */
export function workbenchLinks() {
  return {
    boi: refLink("brokerage-account.md", "BRK-26", /FEES_DASH/),
    tase: refLink("brokerage-account.md", "BRK-37", /market\.tase\.co\.il|trading_fees/),
    maya: refLink("tracks-catalogue-and-decoder.md", "CAT-34", /maya\.tase\.co\.il/),
    taseForeign: refLink("etfs-and-index-funds.md", "ETF-32", /f-etfs/),
  };
}
