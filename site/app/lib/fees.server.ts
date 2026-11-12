// The fee page's data (method §10.6), built at build time and served as /fees-data.json: the kinds a deal can be with their caps, every
// house's latest price list and the regulator's tracks in compact form as templates that fill a deal, the ECB's reference rates, and the
// rule records the page's figures and cap lines cite with the records their cards point at. Server-only.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cmaPeriodFile, type RuleRecord, type ValueObject } from "@finance-tool/schema";
import { latestTracks, type CmaTrack } from "@finance-tool/engine";
import { classificationToWrapper, loadProducts, loadRules, pointedRecords, root } from "./data.server";
import { dealKindsOf } from "./fee-deal/kinds";
import { houseTemplate } from "./fee-deal/templates";
import type { FeesData, TrackLite } from "./fee-page-data";
import { loadFx } from "./fx.server";
import { BROKERAGE, onlyWhatCanBeDone, providersOf } from "./providers";
import { latestSnapshots } from "./providers.server";
import { compactFee } from "./value";
import { readParsedCached } from "./read-cache.server";

function cmaFiles() {
  const dir = join(root, "data/cma");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readParsedCached(join(dir, f), cmaPeriodFile));
}

/** Every `rule_ids` and `ruleIds` inside a node: the rules a figure's sheet or a cap's line cites. */
function ruleIdsIn(node: unknown, into: Set<string>): Set<string> {
  if (Array.isArray(node)) {
    for (const x of node) ruleIdsIn(x, into);
  } else if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if ((k === "rule_ids" || k === "ruleIds") && Array.isArray(v)) {
        for (const id of v) if (typeof id === "string") into.add(id);
      } else ruleIdsIn(v, into);
    }
  }
  return into;
}

export function buildFeesData(): FeesData {
  const mapped: CmaTrack[] = latestTracks(cmaFiles()).filter((x) => classificationToWrapper[x.fund_classification.trim()] != null);
  const templates: FeesData["templates"] = {};
  const tracks: TrackLite[] = [];
  for (const x of mapped) {
    const tpl = (templates[x.dataset] ??= { balance: { ...x.fees.avg_annual_management_fee } as ValueObject, deposit: { ...x.fees.avg_deposit_fee } as ValueObject });
    tracks.push({
      id: x.fund_id,
      name: x.names.cma[0]!.trim(),
      company: x.managing_corporation.name.trim(),
      wrapperId: classificationToWrapper[x.fund_classification.trim()] ?? null,
      dataset: x.dataset,
      b: compactFee(x.fees.avg_annual_management_fee, tpl.balance),
      d: compactFee(x.fees.avg_deposit_fee, tpl.deposit),
    });
  }
  const kinds = dealKindsOf(loadProducts());
  // the houses a securities account's deal can start from: the ones the comparison ranks, each read as it can be done (providers.ts)
  const houses = providersOf({ snapshots: latestSnapshots().map(onlyWhatCanBeDone) }, BROKERAGE)
    .filter((s) => !s.missing)
    .map(houseTemplate);
  const fx = loadFx();
  const allRules = loadRules();
  const rules: RuleRecord[] = [...ruleIdsIn({ kinds, templates, houses, fx }, new Set())].sort().flatMap((id) => (allRules[id] ? [allRules[id]] : []));
  return { rules, pointed: Object.values(pointedRecords(rules, allRules)), templates, tracks, kinds, houses, fx };
}

let cached: FeesData | null = null;
export function feesData(): FeesData {
  return (cached ??= buildFeesData());
}
