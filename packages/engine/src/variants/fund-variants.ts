// The fund the engine runs for a fund record (`fundOf`): its fees, tracking difference, spread, promotions, distribution, domicile,
// principal currency and unit price, read from `data/funds/`, with the record's distribution (A-10) and the exposure's F-107 inputs. The provider workbench and
// the site build each fund they run through it. No I/O: the records arrive as data.
import type { ExposureRecord, FundRecord, ValueObject } from "@finance-tool/schema";
import { comparedYears, trackingBeyondFees, variableForward, type GapList } from "../formulas/fund-gap.ts";
import type { Fund } from "../ledgers/securities.ts";
import { RecordInputError } from "../resolver.ts";
import type { TaxIndexStatement } from "../result.ts";

function fraction(vo: ValueObject | null | undefined, unit: ValueObject["unit"], what: string): number | undefined {
  if (!vo || vo.value === null) return undefined;
  if (vo.unit !== unit) throw new RecordInputError(`${what}: unit is ${vo.unit}, expected ${unit}`);
  if (typeof vo.value !== "number") throw new RecordInputError(`${what}: value ${JSON.stringify(vo.value)} is not a number`);
  return vo.value / 100;
}

/** The drag part each fee a promotion may lower is charged in (F-10, F-121). */
const PROMOTED_PART = { fixed_management: "management", variable_management: "variable", trustee: "trustee" } as const;

/** The fund's listed fixed, variable and trustee fees together, as an annual fraction (0 for a fee not collected). */
export function sumFees(rec: FundRecord): number {
  const v = (x: FundRecord["fees"]["trustee"]) => (x && typeof x.value === "number" ? x.value / 100 : 0);
  return v(rec.fees.fixed_management) + v(rec.fees.variable_management) + v(rec.fees.trustee);
}

/** A-10 as the record holds it: the yield as a fraction and the payments a year; undefined when the record has none. */
export function recordDistribution(rec: Pick<FundRecord, "id" | "distribution">): { yield: number; perYear: number } | undefined {
  if (!rec.distribution) return undefined;
  const y = fraction(rec.distribution.yield, "pct_per_year", `fund ${rec.id} distribution.yield`);
  return y === undefined ? undefined : { yield: y, perYear: rec.distribution.per_year };
}

/**
 * F-107's inputs from the fund's exposure (`us_dividends`), as fractions: the dividend yield of the index's US shares and their share of
 * the index (1 when the record gives no weight: an index of US companies). Undefined when the exposure has no yield.
 */
export function usDividendsOf(exposure: Pick<ExposureRecord, "id" | "us_dividends"> | undefined): { yield: number; weight: number } | undefined {
  const u = exposure?.us_dividends;
  const y = fraction(u?.yield, "pct_per_year", `exposure ${exposure?.id} us_dividends.yield`);
  if (y === undefined) return undefined;
  const w = u?.weight ? fraction(u.weight, "pct", `exposure ${exposure?.id} us_dividends.weight`) : 1;
  return w === undefined ? undefined : { yield: y, weight: w };
}

/**
 * F-04, D84: the tax index the fund's own Israeli prospectus annex states under its ruling (`tax_ruling.index`), as the fund's statement:
 * the main currency's exchange rate (the data check holds the currency to the exposure's) or the CPI. Undefined where the annex states none.
 */
export function taxIndexStatementOf(rec: Pick<FundRecord, "tax_ruling">): TaxIndexStatement | undefined {
  const ruling = rec.tax_ruling;
  const index = ruling?.index;
  if (!ruling || !index) return undefined;
  const at = { term: "tax-index", source: ruling.source, page: index.page, quote: index.quote, checked: index.checked } as const;
  return index.basis === "main-currency" ? { ...at, index: "fx", currency: index.currency } : { ...at, index: "cpi" };
}

/** What `fundOf` reads beside the record and its kind; each left out where the caller has none. */
export interface FundOfOptions {
  /** A-10: the distribution the run pays out (yield and payments a year), for a fund that distributes. */
  distribution?: { yield: number; perYear: number };
  /** W-8BEN on file with the US payer (TXF-12, TXF-13). */
  w8ben?: boolean;
  /** The list the fund is ranked on, for F-92 (d); without it a gross benchmark gives no A-07 from its years. */
  list?: GapList;
  /** The exposure's F-107 inputs (`usDividendsOf`), read for an Irish fund that holds the shares. */
  usDividends?: { yield: number; weight: number };
  /**
   * The exposure's currency where it is not the shekel, the candidate principal currency of an Israeli fund whose record says its status as
   * a foreign-investment fund is not known (F-04).
   */
  foreignCurrency?: string;
}

/** The fund the engine runs for a record, and the fee fields the record leaves empty. */
export function fundOf(rec: FundRecord, kind: Fund["kind"], { distribution: dist, w8ben, list, usDividends, foreignCurrency }: FundOfOptions = {}) {
  const notCollected: string[] = [];
  const f = rec.fees;
  const get = (key: keyof FundRecord["fees"], unit: ValueObject["unit"]) => {
    const v = fraction(f[key], unit, `fund ${rec.id} fees.${key}`);
    if (v === undefined) notCollected.push(key);
    return v;
  };
  const management = get("fixed_management", "pct_per_year");
  const trustee = get("trustee", "pct_per_year");
  const listedVariable = get("variable_management", "pct_per_year");
  // A-07: the published 12-month figure when the record has one, else F-92 from the yearly returns the fund's report prints
  const published = fraction(f.tracking_difference_12m, "pct_per_year", `fund ${rec.id} fees.tracking_difference_12m`);
  const years = comparedYears(rec.tracking_record, list);
  const fromReports = published === undefined && years ? trackingBeyondFees(years, sumFees(rec)) : null;
  // F-92 (b): where A-07 comes from the reports, measured against the fees charged, the variable fee counted forward is the mean
  // charged in the record's years at today's rate; a record without such years (a foreign one, or a rate new this year) keeps the listed rate
  const charged = fromReports !== null && rec.tracking_record ? variableForward(rec.tracking_record.years, rec.tracking_record.variable_rate_since) : null;
  const variable = charged ?? listedVariable;
  if (charged !== null && listedVariable === undefined) notCollected.splice(notCollected.indexOf("variable_management"), 1);
  const tracking = published ?? fromReports ?? get("tracking_difference_12m", "pct_per_year");
  const spread = get("median_spread", "pct_of_trade");
  const withholding = get("fund_level_withholding_drag", "pct_per_year");
  const drag: NonNullable<Fund["drag"]> = {};
  if (management !== undefined) drag.management = management;
  if (trustee !== undefined) drag.trustee = trustee;
  if (variable !== undefined) drag.variable = variable;
  if (tracking !== undefined) drag.tracking = tracking;
  if (withholding !== undefined) drag.foreignWithholding = withholding;
  // F-121: a fee lowered for a stated period, charged at the promotion's rate in the months it covers
  const promotions = (rec.promotions ?? []).flatMap((p) => {
    const rate = fraction(p.rate, "pct_per_year", `fund ${rec.id} promotions.${p.fee}`);
    return rate === undefined || !p.rate.effective_from || !p.rate.effective_to ? [] : [{ part: PROMOTED_PART[p.fee], rate, from: p.rate.effective_from, to: p.rate.effective_to }];
  });
  if (promotions.length) drag.promotions = promotions;
  // A-11 by F-107: an Irish fund that holds the shares, with no figure of its own and no published 12-month gap (which could hold the tax
  // already); an A-07 from its years stands against a net index (F-92 (d)), where its own withholding does not show as a shortfall
  const usWithholding = withholding === undefined && published === undefined && rec.domicile === "IE" && rec.replication?.method === "physical" && usDividends !== undefined;
  if (usWithholding) {
    drag.usDividends = usDividends;
    notCollected.splice(notCollected.indexOf("fund_level_withholding_drag"), 1);
  }
  const fund: Fund = { kind, drag };
  // A-08: half of the published median bid-ask spread.
  if (spread !== undefined) fund.halfSpread = spread / 2;
  if (dist) fund.distribution = dist;
  const domicile = rec.domicile === "US" ? "us" : rec.domicile === "IE" ? "ireland" : undefined;
  if (domicile) fund.domicile = domicile;
  if (w8ben !== undefined) fund.w8ben = w8ben;
  // E1, F-109: the price of one unit, in the unit's currency, for per-share commissions and whole units.
  const price = rec.share_price;
  if (price && typeof price.value === "number") {
    const unitCode = { nis: "ILS", usd: "USD", eur: "EUR" }[price.unit as string];
    if (!unitCode) throw new RecordInputError(`fund ${rec.id} share_price: unit is ${price.unit}, expected a currency`);
    fund.sharePrice = price.value;
    fund.sharePriceCurrency = unitCode;
  }
  if (kind === "tase-foreign-fund" && rec.tax_status.tase_foreign_fund_90pct_test?.value === true) fund.ninetyPercentTest = true;
  // F-04, D84: the index a Tel Aviv line's own annex states; a record of the same units bought abroad may carry it, and keeps TXF-03
  const stated = kind === "tase-foreign-fund" ? taxIndexStatementOf(rec) : undefined;
  if (stated) fund.statedIndex = stated;
  // TXS-14, F-04: the principal currency the fund's own documents name; where its record says the status is not known (`value: null`), the
  // exposure's foreign currency as the candidate, so the run meets both readings rather than reading the gap as either answer
  const status = rec.tax_status.foreign_investment_fund;
  const principal = typeof status?.value === "string" ? status.value : status?.value === null ? foreignCurrency : undefined;
  if (kind === "israeli-fund" && principal !== undefined) fund.principalCurrency = principal;
  // TXF-11: the fund's own annex reports a ruling that taxes it at sale and on distributions only.
  if (rec.tax_ruling && rec.distribution_policy === "accumulating") fund.saleOnlyRuling = true;
  return { fund, notCollected, hasManagement: management !== undefined };
}
