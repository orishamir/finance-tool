// The fee page's data (lib/fees.server.ts, served as /deal-data.json and fetched once per visit): the kinds a deal can be with their caps,
// every house's price list and the regulator's tracks in compact form (with the value object they share) as templates, the ECB's
// reference rates, and the rules the page cites. What a track's fees are as value objects is read here.
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import type { DealKind } from "./fee-deal/kinds";
import type { HouseTemplate } from "./fee-deal/templates";
import type { FxSnapshot } from "./fx";
import type { TermRow } from "./data.server";
import { expandFee, staleCmaFee, type CompactFee, type SiteValue } from "./value";

/**
 * A track of the regulator's data as a template: its fund id, name, company, the product it is, its dataset and its two fees; `short`, the
 * name the track browser shows under its company (D54, `shortTrackNames`), only where it is shorter than the full name.
 */
export interface TrackLite {
  id: number;
  name: string;
  short?: string;
  company: string;
  wrapperId: string | null;
  dataset: string;
  b: CompactFee;
  d: CompactFee;
}

export interface FeesData {
  /** The rules the page's figures and cap lines cite. */
  rules: RuleRecord[];
  /** The records those rules' cards point at (derived_from, examples) that `rules` does not hold: only chips and cards read them. */
  pointed?: RuleRecord[];
  /** The value object shared by a dataset's tracks (source, dates, rule ids), per fee. */
  templates: Record<string, { balance: ValueObject; deposit: ValueObject }>;
  tracks: TrackLite[];
  /** Every product record that lists fee bases, as a kind of deal with its bases and caps (method §10.6, F-113). */
  kinds: DealKind[];
  /** Every bank's and broker's latest price list as a template for a securities account's deal. */
  houses: HouseTemplate[];
  /** The ECB's reference rates (F-84): a bound typed in another currency enters a cost curve in shekels at them (F-112). */
  fx: FxSnapshot | null;
  /**
   * The glossary cards of the fees a deal can hold, by the fee's name: a fee's "מה זה" opens its card. Where a product has a sense of the
   * name of its own, that card is kept under `termKey(name, product)` too.
   */
  terms: Record<string, TermRow>;
}

/** The key of a fee name's glossary card in one product's sense, among `FeesData.terms`. */
export const termKey = (name: string, product: string): string => `${name}@${product}`;

/**
 * A track's two fees as value objects, the CMA averages of its dataset's value object with its own figure (D3: stale once the next year's
 * average is overdue on `today`). Null where the data holds no value object for the track's dataset.
 */
export function trackFees(track: TrackLite, data: Pick<FeesData, "templates">, today: string): { balance: SiteValue; deposit: SiteValue } | null {
  const tpl = data.templates[track.dataset];
  if (!tpl) return null;
  return {
    balance: expandFee(track.b, { ...tpl.balance, stale: staleCmaFee(tpl.balance.effective_to, today) }),
    deposit: expandFee(track.d, { ...tpl.deposit, stale: staleCmaFee(tpl.deposit.effective_to, today) }),
  };
}

let dataPromise: Promise<FeesData> | null = null;

/** The fee page's data (fees.server.ts), fetched once per visit. */
export function loadFeesData(): Promise<FeesData> {
  if (!dataPromise) dataPromise = fetch(`${import.meta.env.BASE_URL}deal-data.json`).then((r) => r.json() as Promise<FeesData>);
  return dataPromise;
}
