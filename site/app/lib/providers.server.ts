// The data the provider workbench and the fund-variant page need besides the comparison bundle (flows 28 to 30, 33),
// built at build time and served as /workbench-bundle.json: the latest snapshot of every provider, the fund records, the
// exposure records, the saved fund lists (none yet), the rule records a securities run may read, P-01 and P-05, and the
// link-outs. Server-only.
import type { ParameterRecord, RuleRecord } from "@finance-tool/schema";
import { loadFees, loadParameters, loadRules, today } from "./data.server";
import { loadExposures, loadFunds } from "./instruments.server";
import { BROKERAGE, PROVIDENT_WRAPPERS, type WorkbenchBundle } from "./providers";
import { loadFundLists, workbenchLinks } from "./variants.server";

/** Rules a securities run, the protection lines and the pages' quotes may read, by family prefix, plus every rule the shipped records cite. */
const families = ["BRK-", "ETF-", "TXS-", "TXF-", "TXI-", "TXG-", "REG-", "BANK-", "MF-", "CAT-3", "SW-"];

function collectRuleIds(node: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(node)) node.forEach((n) => collectRuleIds(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k === "rule_ids" || k === "protection_rule_ids" || k === "notice_rule_ids") {
        if (Array.isArray(v)) v.forEach((id) => typeof id === "string" && out.add(id));
      } else collectRuleIds(v, out);
    }
  }
  return out;
}

/** The latest snapshot of each provider id (`<id>@<date>.json`): files are loaded in name order, the later date wins. */
function latestSnapshots() {
  const best = new Map<string, ReturnType<typeof loadFees>[number]>();
  for (const s of loadFees()) {
    const prev = best.get(s.id);
    if (!prev || s.snapshot >= prev.snapshot) best.set(s.id, s);
  }
  return [...best.values()];
}

export function buildWorkbenchBundle(): WorkbenchBundle {
  const t = today();
  const parameters = loadParameters();
  const find = (id: string) => {
    const p = parameters.find((x) => (x as { method_id?: string }).method_id === id) as ParameterRecord | undefined;
    if (!p) throw new Error(`data/parameters/ holds no ${id} record`);
    return p;
  };
  const snapshots = latestSnapshots();
  const funds = loadFunds();
  const exposures = loadExposures();
  const fundLists = loadFundLists();
  const allRules = loadRules();
  const needed = collectRuleIds({ snapshots, funds, exposures });
  const rules: RuleRecord[] = Object.values(allRules).filter((r) => needed.has(r.id) || families.some((f) => r.id.startsWith(f)));
  const bundle: WorkbenchBundle = { today: t, snapshots, funds, exposures, fundLists, rules, p01: find("P-01"), p05: find("P-05"), links: workbenchLinks() };
  console.log(`[workbench] bundle: ${snapshots.length} snapshots, ${funds.length} funds, ${exposures.length} exposures, ${fundLists.length} fund lists, ${rules.length} rules, ${(JSON.stringify(bundle).length / 1024).toFixed(0)} KB`);
  return bundle;
}

let cached: WorkbenchBundle | null = null;
export function workbenchBundle(): WorkbenchBundle {
  return (cached ??= buildWorkbenchBundle());
}

/** The wrappers whose provider page is built: the brokerage account (ranked) and the provident wrappers (a listing of managers' list fees; empty where none is collected, and the page says so). */
export function providerWrapperIds(): string[] {
  return [BROKERAGE, ...PROVIDENT_WRAPPERS];
}
