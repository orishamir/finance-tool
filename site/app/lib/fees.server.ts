// The fee page's data (method §10.6), built at build time and served as /deal-data.json: the kinds a deal can be with their caps, every
// house's latest price list and the regulator's tracks in compact form as templates that fill a deal, the ECB's reference rates, and the
// rule records the page's figures and cap lines cite with the records their cards point at, the glossary cards of the fees a deal can hold,
// and each track's short name under its company as the track browser shows it. Server-only.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cmaPeriodFile, type FeesSnapshot, type RuleRecord, type ValueObject } from "@finance-tool/schema";
import { dearerCurrency, latestTracks, type CmaTrack } from "@finance-tool/engine";
import { feeDeal, guideBlocks } from "../copy";
import { classificationToWrapper, loadProducts, loadRules, openTracksOf, pointedRecords, root, termsFor } from "./data.server";
import { dealKindsOf } from "./fee-deal/kinds";
import { FEE_KIND_IDS } from "./fee-deal/shapes";
import { STATED_RULES } from "./fee-deal/reading";
import { houseTemplateRead } from "./fee-deal/templates";
import { termKey, type FeesData, type TrackLite } from "./fee-page-data";
import { loadFx } from "./fx.server";
import { nisPerNumber } from "./fx";
import { BOUND_CURRENCIES, type BoundCurrency } from "./fee-deal/model";
import { BROKERAGE, onlyWhatCanBeDone, providersOf } from "./providers";
import { latestSnapshots } from "./providers.server";
import { compactFee } from "./value";
import { readParsedCached } from "./read-cache.server";
import { buildProductView } from "./track-browser";
import { buildTrackBrowser } from "./track-browser.server";
import { selfDirectedProduct } from "./self-directed";
import { siteTrackName } from "./track-names";
import { columnOf, houseAverages, type AverageColumn } from "./house-averages";
import { loadHouseAverages } from "./house-averages.server";

/**
 * Each track's short name under its company, as the track browser works it out (D54: `shortTrackNames` over one company's tracks in one
 * product, never cutting a word of the product's kinds), by fund id, where the full name is the one the fee page lists.
 */
function shortNames(): Map<number, { name: string; short: string }> {
  const tb = buildTrackBrowser();
  const out = new Map<number, { name: string; short: string }>();
  for (const p of tb.products) for (const t of buildProductView(tb, p.id)?.tracks ?? []) out.set(t.id, { name: t.fullName, short: t.short });
  return out;
}

/** A fee's name as the page writes it: the guide's for a base the records list, else the page's own (words.tsx, `feeName`). */
const feeNameOf = (kind: string): string | undefined => (guideBlocks.fees[kind] as { name?: string } | undefined)?.name ?? feeDeal.names[kind];

function cmaFiles() {
  const dir = join(root, "data/cma");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => openTracksOf(readParsedCached(join(dir, f), cmaPeriodFile)));
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
  const shorts = shortNames();
  for (const x of mapped) {
    const tpl = (templates[x.dataset] ??= { balance: { ...x.fees.avg_annual_management_fee } as ValueObject, deposit: { ...x.fees.avg_deposit_fee } as ValueObject });
    const name = siteTrackName(x.names.cma[0]!.trim());
    const regulatorProduct = classificationToWrapper[x.fund_classification.trim()] ?? null;
    const cut = shorts.get(x.fund_id);
    tracks.push({
      id: x.fund_id,
      name,
      // only where the browser lists this very name and cut it: one short name for one track on both pages
      ...(cut && cut.name === name && cut.short !== name ? { short: cut.short } : {}),
      company: x.managing_corporation.name.trim(),
      // a self-directed (IRA) fund fills a deal of its own product, which has the trading and custody fees beside the manager's
      wrapperId: selfDirectedProduct(regulatorProduct, name) ?? regulatorProduct,
      dataset: x.dataset,
      b: compactFee(x.fees.avg_annual_management_fee, tpl.balance),
      d: compactFee(x.fees.avg_deposit_fee, tpl.deposit),
    });
  }
  const kinds = dealKindsOf(loadProducts());
  // the houses a securities account's deal can start from: the ones the comparison ranks, each read as it can be done (providers.ts)
  // a bound the list leaves open between currencies is filled in the dearer of them at the ECB's rates of the build (F-12, F-84, D56)
  const rates = loadFx();
  const dearer = (l: FeesSnapshot["lines"][number]): BoundCurrency | null => {
    if (!l.bound_readings || !rates) return null;
    const d = dearerCurrency(l.bound_readings.currencies, (code) => nisPerNumber(rates, code));
    return d && (BOUND_CURRENCIES as readonly string[]).includes(d.code) ? (d.code as BoundCurrency) : null;
  };
  const houses = providersOf({ snapshots: latestSnapshots().map(onlyWhatCanBeDone) }, BROKERAGE)
    .filter((s) => !s.missing)
    .map((s) => {
      // F-122: what the house charged on average for the kinds its read lines are of, for reference only (never a price of the deal)
      const { template: t, read } = houseTemplateRead(s, dearer);
      const rec = loadHouseAverages().get(s.id);
      const columns = s.lines.filter((l) => read.includes(l.id)).map(columnOf).filter((c): c is AverageColumn => c !== null);
      const averages = rec ? houseAverages(rec, columns) : null;
      return averages && averages.columns.length ? { ...t, averages } : t;
    });
  const fx = loadFx();
  // each fee name's card, and where a product has a sense of the name that differs from it, that sense under the product's key
  const names = FEE_KIND_IDS.flatMap((k) => feeNameOf(k) ?? []);
  const terms = termsFor(names, "");
  for (const k of kinds) for (const [name, t] of Object.entries(termsFor(names, k.id))) if (t.explanation !== terms[name]?.explanation) terms[termKey(name, k.id)] = t;
  const allRules = loadRules();
  // with the rules the reading's stated sentences state (a bank's order through a clerk, BRK-16)
  const stated = Object.values(STATED_RULES).flatMap((ids) => ids ?? []);
  const rules: RuleRecord[] = [...ruleIdsIn({ kinds, templates, houses, fx, terms }, new Set(stated))].sort().flatMap((id) => (allRules[id] ? [allRules[id]] : []));
  return { rules, pointed: Object.values(pointedRecords(rules, allRules)), templates, tracks, kinds, houses, fx, terms };
}

let cached: FeesData | null = null;
export function feesData(): FeesData {
  return (cached ??= buildFeesData());
}
