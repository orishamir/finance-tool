// The fee page's data (method §10.6), built at build time and served as /deal-data.json: the kinds a deal can be with their caps, every
// house's latest price list and the regulator's tracks in compact form as templates that fill a deal, the ECB's reference rates, and the
// rule records the page's figures and cap lines cite with the records their cards point at, the glossary cards of the fees a deal can hold,
// and each track's short name under its company as the track browser shows it. Server-only.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { cmaPeriodFile, type RuleRecord, type ValueObject } from "@finance-tool/schema";
import { latestTracks, type CmaTrack } from "@finance-tool/engine";
import { feeDeal, guideBlocks } from "../copy";
import { classificationToWrapper, loadProducts, loadRules, openTracksOf, pointedRecords, root, termsFor } from "./data.server";
import { ACCOUNT_KIND, dealKindsOf } from "./fee-deal/kinds";
import { houseDeal } from "./deal-account/house-deal";
import { FEE_KIND_IDS } from "./fee-deal/shapes";
import { STATED_RULES } from "./fee-deal/reading";
import { BAN_RULES } from "./fee-deal/offers/rules";
import { ACCOUNT_CAP_RULES } from "./fee-deal/charts";
import { houseTemplateRead } from "./fee-deal/templates";
import { termKey, termsHouse, type FeesData, type HouseTermsData, type TrackLite } from "./fee-page-data";
import { distributionRuleIds } from "../components/decoder/institutions/types";
import { loadFx } from "./fx.server";
import { BROKERAGE, onlyWhatCanBeDone, providersOf, startsDeal } from "./providers";
import { latestSnapshots } from "./providers.server";
import { compactFee, templateRow } from "./value";
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
  // each dataset's template: for each fee, a track's with a number and no note where one exists, so few tracks ship a note of their own
  for (const dataset of new Set(mapped.map((x) => x.dataset))) {
    const rows = mapped.filter((x) => x.dataset === dataset);
    templates[dataset] = { balance: { ...templateRow(rows, (x) => x.fees.avg_annual_management_fee)!.fees.avg_annual_management_fee } as ValueObject, deposit: { ...templateRow(rows, (x) => x.fees.avg_deposit_fee)!.fees.avg_deposit_fee } as ValueObject };
  }
  for (const x of mapped) {
    const tpl = templates[x.dataset]!;
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
  const latest = latestSnapshots();
  const full = new Map(latest.map((s) => [s.id, s]));
  const houses = providersOf({ snapshots: latest.map(onlyWhatCanBeDone) }, BROKERAGE)
    .filter(startsDeal)
    .map((s) => {
      // the lines reading the house as it can be done took away whole, which the template lists with why
      const kept = new Set(s.lines.map((l) => l.id));
      const unavailable = (full.get(s.id)?.lines ?? []).filter((l) => !kept.has(l.id));
      // F-122: what the house charged on average for the kinds its read lines are of, for reference only (never a price of the deal)
      const { template: t, read } = houseTemplateRead(s, unavailable, kinds.find((k) => k.id === BROKERAGE) ?? null);
      const rec = loadHouseAverages().get(s.id);
      const columns = s.lines.filter((l) => read.includes(l.id)).map(columnOf).filter((c): c is AverageColumn => c !== null);
      const averages = rec ? houseAverages(rec, columns) : null;
      const every = rec ? houseAverages(rec) : null;
      return { ...t, ...(averages && averages.columns.length ? { averages } : {}), ...(every && every.columns.length ? { everyColumn: every } : {}) };
    });
  const fx = loadFx();
  // each fee name's card, and where a product has a sense of the name that differs from it, that sense under the product's key
  const names = FEE_KIND_IDS.flatMap((k) => feeNameOf(k) ?? []);
  const terms = termsFor(names, "");
  for (const k of kinds) for (const [name, t] of Object.entries(termsFor(names, k.id))) if (t.explanation !== terms[name]?.explanation) terms[termKey(name, k.id)] = t;
  return { ...citedRules({ kinds, templates, houses, fx, terms }), templates, tracks, kinds, houses, fx, terms };
}

/**
 * The rules the data's figures and cap lines cite, with the records their cards point at: those its records name, the rules the reading's
 * stated sentences state (a bank's order through a clerk, BRK-71), those of the rule table's bans, which a ban's words open and whose figure
 * they show (MF-71's distribution fee), and BANK-35, whose cap flags a current account's year of holding (F-102, `accountCapOf`).
 */
function citedRules(parts: Pick<FeesData, "kinds" | "templates" | "houses" | "fx" | "terms">): Pick<FeesData, "rules" | "pointed"> {
  const allRules = loadRules();
  const stated = [...Object.values(STATED_RULES).flatMap((ids) => ids ?? []), ...BAN_RULES, ...ACCOUNT_CAP_RULES];
  const rules: RuleRecord[] = [...ruleIdsIn(parts, new Set(stated))].sort().flatMap((id) => (allRules[id] ? [allRules[id]] : []));
  return { rules, pointed: Object.values(pointedRecords(rules, allRules)) };
}

let cached: FeesData | null = null;
export function feesData(): FeesData {
  return (cached ??= buildFeesData());
}

/**
 * What a house's terms draw in a company page's first view (`HouseTerms`): the deal filled from the house's latest price list
 * (`houseDeal`), the house cut to what its terms draw (`termsHouse`), and the fee page's data their read-only editor reads, cut to a
 * securities account: the rules the deal's figures and the house's lines cite, those its distribution fee's "?" opens where it prints one,
 * and the records they point at, but those the page holds already (`held`: a rule among its rules, a record its cards point at among its
 * rules or those records), which the page's provenance gives the terms.
 * Null where the house's list starts no deal (`startsDeal`): the fee page's houses are those.
 */
export function houseTermsData(id: string, today: string, held: { rules: ReadonlySet<string>; pointed: ReadonlySet<string> }): HouseTermsData | null {
  const all = feesData();
  const template = all.houses.find((h) => h.id === id);
  const deal = template ? houseDeal(`house:${id}`, all, today) : null;
  if (!template || !deal) return null;
  const house = termsHouse(template);
  const allRules = loadRules();
  const asks = house.distribution ? distributionRuleIds(house.provider === "bank" ? "bank" : "broker") : [];
  const rules = [...ruleIdsIn({ deal, house }, new Set(asks))].filter((r) => !held.rules.has(r)).sort().flatMap((r) => (allRules[r] ? [allRules[r]] : []));
  const pointed = Object.values(pointedRecords(rules, allRules)).filter((r) => !held.rules.has(r.id) && !held.pointed.has(r.id));
  return { deal, house, data: { rules, pointed, kinds: all.kinds.filter((k) => k.id === ACCOUNT_KIND), terms: {} } };
}
