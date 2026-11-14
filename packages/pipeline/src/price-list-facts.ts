// The data check for the price-list facts of data-schema §3.6a and the distribution agreements of §3.6: each field on the kind of line it
// belongs to, its words holding what it says, and a custody maximum's scope on every latest record that prints one.
import type { FeesSnapshot, FundRecord } from "@finance-tool/schema";

type Line = FeesSnapshot["lines"][number];

const TRADE_CCY = "trade_ccy_per_trade";
/** The words a bound in the trade's currency rests on: "במטבע העסקה", "בהתאם למטבע העסקה". */
const TRADE_CCY_WORDS = /מטבע העסקה/;

/** data-schema §3.6a items 1 to 4 and 6, line by line. `latest`: the house's latest record, which must say a custody maximum's scope. */
export function checkLineFacts(line: Line, latest: boolean): string[] {
  const out: string[] = [];
  const at = `lines ${line.id}`;
  // 1. a bound in the trade's currency: only a trade line's minimum or maximum, its quote naming the trade's currency
  for (const key of ["rate", "cap", "spread", "discount_months", "reverts_to", "max_deposit"] as const) {
    const v = line[key];
    if (v && v.unit === TRADE_CCY) out.push(`${at}: ${key} is in ${TRADE_CCY}, which only a trade line's min or max takes`);
  }
  const ccyBounds = [line.min, line.max].filter((b) => b?.unit === TRADE_CCY);
  if (ccyBounds.length > 0 && line.base !== "trade") out.push(`${at}: a bound in ${TRADE_CCY} on a ${line.base} line; only a trade line takes one`);
  for (const b of ccyBounds) if (!TRADE_CCY_WORDS.test(b!.source.quote ?? "")) out.push(`${at}: a bound in ${TRADE_CCY} quotes no words naming the trade's currency ("מטבע העסקה")`);
  if (line.trade_currencies && ccyBounds.length === 0) out.push(`${at}: trade_currencies belongs to a bound in ${TRADE_CCY}`);
  // 2. a custody maximum's scope
  const hasMax = typeof line.max?.value === "number";
  if (line.max_per !== undefined && (line.base !== "custody" || !hasMax)) out.push(`${at}: max_per belongs to a custody line with a maximum`);
  if (latest && line.base === "custody" && hasMax && line.max_per === undefined) out.push(`${at}: a custody maximum says what it bounds (max_per: security, deposit or unstated)`);
  // a scope read from another document of the house (its own sheet in TASE's calculator) cites it; an unstated scope cites nothing
  if (line.max_per_source && (line.max_per === undefined || line.max_per === "unstated")) out.push(`${at}: max_per_source cites where max_per's security or deposit is read`);
  if (line.max_per_source && line.max_per_source.strength !== "institution") out.push(`${at}: max_per_source is the house's own document (strength institution)`);
  if (line.max_deposit) {
    if (line.max_per !== "security") out.push(`${at}: max_deposit stands beside a maximum on each security (max_per: security)`);
    if (line.max_deposit.unit !== "nis") out.push(`${at}: max_deposit is in nis`);
    if (!line.max_deposit.source.quote) out.push(`${at}: max_deposit carries the list's words (source.quote)`);
    if (typeof line.max_deposit.value === "number" && typeof line.max?.value === "number" && line.max_deposit.value < line.max.value)
      out.push(`${at}: the maximum on the whole deposit is below the maximum on each security`);
  }
  // 3. a conversion priced by its size
  if (line.size_tiers) {
    if (line.base !== "fx") out.push(`${at}: size_tiers belongs to a conversion line`);
    const tops = line.size_tiers.map((t) => t.up_to?.value ?? null);
    tops.forEach((top, i) => {
      if (top === null && i !== tops.length - 1) out.push(`${at}: only the last size step is open above`);
      const prev = tops[i - 1];
      if (i > 0 && top !== null && typeof prev === "number" && !(typeof top === "number" && top > prev)) out.push(`${at}: size steps run from the smallest up`);
    });
    // the line's flat price is the step the run prices (F-13): the two say the same
    const flat = line.flat_up_to;
    if (flat) {
      const step = line.size_tiers.find((t) => t.on === "fee" && t.flat);
      if (!step || step.flat!.value !== flat.amount.value || step.up_to?.value !== flat.up_to.value) out.push(`${at}: flat_up_to and the flat size step differ`);
    }
  }
  // 4. a fixed fee the month's trading offsets; 6. when a fee is collected
  if (line.offset && line.base !== "fixed_period") out.push(`${at}: offset belongs to a fixed_period line`);
  if (line.collection && line.base !== "custody" && line.base !== "fixed_period") out.push(`${at}: collection belongs to a custody or fixed_period line`);
  return out;
}

/** data-schema §3.6a item 5 and §3.6's distribution agreements, on the snapshot. */
export function checkSnapshotFacts(snap: FeesSnapshot): string[] {
  const out: string[] = [];
  const houseClass = ["bank", "broker", "foreign_broker"].includes(snap.provider.class);
  if (snap.third_party && !houseClass) out.push("third_party: only a bank's, broker's or foreign broker's record says what third parties may add");
  const da = snap.distribution_agreements;
  if (da) {
    if (!houseClass) out.push("distribution_agreements: only a bank's, broker's or foreign broker's record sells funds under distribution agreements");
    for (const cls of da.applies_to) {
      const entry = (snap.availability ?? []).find((a) => a.applies_to.includes(cls));
      // the class-wide entry stays open, since which fund is sold is asked fund by fund; it says why for a fund the site does not name
      if (!entry || entry.available !== "unknown") out.push(`distribution_agreements: ${cls} is decided fund by fund, so its availability entry is "unknown" with the reason for a fund no record names`);
    }
    for (const r of da.reports) {
      if (new Set(r.funds).size !== r.funds.length) out.push(`distribution_agreements: report ${r.reference} names a fund twice`);
      if (r.ends && r.ends.published < r.published) out.push(`distribution_agreements: report ${r.reference} ends before it was published`);
      if (r.published > r.checked) out.push(`distribution_agreements: report ${r.reference} was checked before it was published`);
    }
  }
  return out;
}

/** data-schema §3.5: a promotion lowers a fee the record holds, in its unit, for a stated period. */
export function checkFundPromotions(rec: Pick<FundRecord, "fees" | "promotions">): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of rec.promotions ?? []) {
    const fee = rec.fees[p.fee];
    const at = `promotions ${p.fee}`;
    if (seen.has(p.fee)) out.push(`${at}: two promotions of one fee`);
    seen.add(p.fee);
    if (!fee || typeof fee.value !== "number") out.push(`${at}: the fee has no value of its own to return to after the promotion`);
    else {
      if (fee.unit !== p.rate.unit) out.push(`${at}: the promotion's unit ${p.rate.unit} is not the fee's ${fee.unit}`);
      if (typeof p.rate.value !== "number" || !(p.rate.value < fee.value)) out.push(`${at}: a promotion's rate is a number below the fee's own`);
    }
    const { effective_from: from, effective_to: to } = p.rate;
    if (!from || !to) out.push(`${at}: a promotion states its first and last days (effective_from, effective_to)`);
    else if (from > to) out.push(`${at}: the promotion ends before it starts`);
  }
  return out;
}
