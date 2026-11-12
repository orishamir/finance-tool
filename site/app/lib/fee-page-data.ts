// The fee page's data (lib/fees.server.ts, served as /fees-data.json and fetched once per visit): the regulator's tracks in compact
// form with the value object they share, F-68's reference of every provident-family class, the rules the page quotes, the kinds a deal
// can be with their caps, every house's price list as a template, and the ECB's reference rates. What a track's fees are as value objects
// is read here, for every page that shows them.
import type { RegulatorReference } from "@finance-tool/engine";
import type { ParameterRecord, RuleRecord, ValueObject } from "@finance-tool/schema";
import type { DealKind } from "./fee-deal/kinds";
import type { HouseTemplate } from "./fee-deal/templates";
import type { FxSnapshot } from "./fx";
import type { RefLink } from "./sources";
import { expandFee, staleCmaFee, type CompactFee, type SiteValue } from "./value";

export interface TrackLite {
  id: number;
  name: string;
  company: string;
  companyId: string;
  classification: string;
  specialization: string;
  wrapperId: string | null;
  dataset: string;
  period: string;
  b: CompactFee;
  d: CompactFee;
}

export interface FeesData {
  today: string;
  p03: ParameterRecord;
  rules: RuleRecord[];
  /** The records those rules' cards point at (derived_from, examples) that the bundle does not ship: only chips and cards read them. */
  pointed?: RuleRecord[];
  /** F-68 for every provident-family class, by `classKey`. */
  references: Record<string, RegulatorReference>;
  /** The value object shared by a dataset's tracks (source, dates, rule ids), per fee. */
  templates: Record<string, { balance: ValueObject; deposit: ValueObject }>;
  tracks: TrackLite[];
  /** The track P-05 names for a wrapper (its representative instrument, D21). */
  wrapperTrack: Record<string, number>;
  /** The class of the provider whose tariff a securities wrapper uses (`bank`, ...). */
  tariffClass: Record<string, string>;
  links: { boi: RefLink | null; isa: RefLink | null; tase: RefLink | null };
  /** Every product record that lists fee bases, as a kind of deal with its bases and caps (method §10.6, F-113). */
  kinds: DealKind[];
  /** Every bank's and broker's latest price list as a template for a securities account's deal. */
  houses: HouseTemplate[];
  /** The ECB's reference rates (F-84): a bound typed in another currency enters a cost curve in shekels at them (F-112). */
  fx: FxSnapshot | null;
}

export const classKey = (classification: string, specialization: string) => `${classification.trim()}|${specialization.trim()}`;

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
  if (!dataPromise) dataPromise = fetch(`${import.meta.env.BASE_URL}fees-data.json`).then((r) => r.json() as Promise<FeesData>);
  return dataPromise;
}
