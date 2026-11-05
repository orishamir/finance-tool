// The facts behind the founder's question on the indices page's fund list (2026-11-05): "are you sure we show the interesting
// information in the table? maybe other columns would be better?"
// Every figure comes from the site's own functions over data/ (feeInputs, buildInvest, gapOf, sumFees, trackingBeyondFees, pairCosts);
// none is typed by hand. The plan is the page's default: feeInputs with nothing entered, built the way routes/invest.tsx builds it.
// Run from the repository root: npx tsx research/specs/2026-11-05-fund-columns/compute.ts
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trackingBeyondFees } from "../../../packages/engine/src/formulas/fund-gap";
import { sumFees } from "../../../packages/engine/src/variants/fund-variants";
import { buildCompareBundle } from "../../../site/app/lib/compare.server";
import { feeInputs } from "../../../site/app/lib/fees";
import { buildInvest, gapOf, knownIndices, opensOn, pairCosts, pairValue, type FundWay, type WayPrice } from "../../../site/app/lib/invest";
import { buildWorkbenchBundle } from "../../../site/app/lib/providers.server";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const bundle = buildWorkbenchBundle();
const compare = buildCompareBundle();

// ---------------------------------------------------------------- the page's default plan (routes/invest.tsx, `livePlan`)
const fi = feeInputs(compare, null, { entered: {}, age: null, employment: null });
const plan = {
  amountNow: fi.g.amountNow,
  monthly: fi.g.monthly,
  years: fi.g.horizonYears,
  grossReturn: (fi.g.returnPct ?? 0) / 100,
  inflation: (fi.values.inflation.value as number) / 100,
  age: fi.g.age,
  income: fi.g.salary !== null && fi.g.salary > 0 ? 12 * fi.g.salary : null,
  values: fi.values,
  fromGoal: fi.fromGoal,
  returnFromParameter: fi.returnFromParameter,
} as never as Parameters<typeof buildInvest>[0]["plan"];
const p = plan as unknown as { amountNow: number; monthly: number; years: number; grossReturn: number; inflation: number; age: number | null; income: number | null; returnFromParameter: boolean };
const planText = `${p.amountNow} NIS now, ${p.monthly} NIS a month, ${p.years} years, return ${+(p.grossReturn * 100).toFixed(3)}% a year (${p.returnFromParameter ? "P-05's scenario" : "entered"}), inflation ${+(p.inflation * 100).toFixed(3)}% a year, age ${p.age}, income ${p.income}`;

// ---------------------------------------------------------------- helpers
const priced = (x: FundWay["byHouse"][string] | undefined): x is WayPrice => !!x && "valueN" in x;
const r2 = (x: number) => Math.round(x * 100) / 100;
const r3 = (x: number) => Math.round(x * 1000) / 1000;
const num = (v: { value?: unknown } | null | undefined) => (v && typeof v.value === "number" ? v.value : null);
const KIND: Record<string, string> = { "il-tracking": "tracking mutual fund (קרן מחקה)", "il-etf": "Israeli ETF (קרן סל)", "tase-foreign": "foreign fund on TASE", abroad: "foreign fund abroad" };

/** The yearly rate the calculation counts for the fund's own costs (A-06 + A-09 + A-07), percent, and where the binding part comes from. */
function counted(rec: FundWay["rec"]) {
  const fees = sumFees(rec); // fraction
  const published = num(rec.fees.tracking_difference_12m as never);
  if (published !== null) return { pct: (fees + published / 100) * 100, from: "published 12-month figure" as const, a07: published };
  const years = rec.tracking_record?.years ?? [];
  if (years.length === 0) return { pct: fees * 100, from: "fees (no record)" as const, a07: null };
  const a07 = trackingBeyondFees(years, fees)!;
  return { pct: (fees + a07) * 100, from: a07 > 0 ? ("reports" as const) : ("fees" as const), a07: a07 * 100 };
}

function costsAt(index: ReturnType<typeof knownIndices>[number], fundId: string, providerId: string) {
  const c = pairCosts({ bundle, index, plan, fundId, providerId });
  if (!c) return null;
  const account = c.account.reduce((s, x) => s + ((x.cost.value as number) ?? 0), 0) + c.interaction;
  return { left: c.left.value as number, account, fund: c.fund.value as number, tax: c.tax.value as number, base: c.base, lines: c.account.map((x) => ({ line: x.line.names?.tariff?.[0] ?? x.line.id, base: x.line.base, cost: Math.round((x.cost.value as number) ?? 0) })), interaction: c.interaction };
}

function crossOf(index: ReturnType<typeof knownIndices>[number], fundId: string, pickId: string, house: string) {
  const r = bundle.dollarRange!;
  const at = (f: string, fx: number) => pairValue({ bundle, index, plan, fundId: f, providerId: house, fxChange: fx });
  const lo = at(fundId, r.lo), hi = at(fundId, r.hi), pLo = at(pickId, r.lo), pHi = at(pickId, r.hi);
  return lo === null || hi === null || pLo === null || pHi === null ? null : { dollarLo: r.lo, dollarHi: r.hi, atLo: Math.round(lo - pLo), atHi: Math.round(hi - pHi) };
}

/** The order of the ranked funds (priced, not on an open rule, the page's own kind) at one account, highest value first. */
function orderAt(funds: FundWay[], house: string) {
  return funds
    .filter((f) => opensOn(f.rec))
    .flatMap((f) => { const at = f.byHouse[house]; return priced(at) && !at.open ? [{ id: f.rec.id, v: at.valueN }] : []; })
    .sort((a, b) => b.v - a.v);
}

/** Spearman-like check: pairs of funds two orderings put the other way round. */
function discordant(a: string[], b: string[]) {
  const common = a.filter((x) => b.includes(x));
  const out: [string, string][] = [];
  for (let i = 0; i < common.length; i++) for (let j = i + 1; j < common.length; j++) {
    const x = common[i]!, y = common[j]!;
    if (Math.sign(a.indexOf(x) - a.indexOf(y)) !== Math.sign(b.indexOf(x) - b.indexOf(y))) out.push([x, y]);
  }
  return out;
}

// ---------------------------------------------------------------- every index with fund records
const indices = knownIndices(bundle).filter((i) => bundle.funds.some((f) => f.exposure_id === i.id));
const result: Record<string, unknown>[] = [];

for (const index of indices) {
  const view = buildInvest({ bundle, index, plan });
  const funds = view.options.filter((o) => o.exists).flatMap((o) => o.funds);
  if (!view.headline) { result.push({ index: index.name, id: index.id, note: "no headline: nothing ranked" }); continue; }
  const open = view.headline.providerId;
  const pickFund = view.headline.fund.rec.id;
  const nameOf = (id: string) => view.providers.find((x) => x.id === id)?.short ?? id;

  // every account that prices at least two ranked funds: how its order compares with the opening account's
  const houses = view.providers.map((x) => x.id);
  const base = orderAt(funds, open).map((x) => x.id);
  const byAccount = houses.map((h) => {
    const o = orderAt(funds, h);
    if (o.length < 2) return null;
    const ids = o.map((x) => x.id);
    const swapped = discordant(base, ids);
    // the account's best fund, and its own spread across the funds it prices
    return { id: h, name: nameOf(h), ranked: o.length, top: funds.find((f) => f.rec.id === ids[0])?.name, topSame: ids[0] === base[0], swappedPairs: swapped.length, swapped: swapped.map(([x, y]) => `${funds.find((f) => f.rec.id === x)?.name} / ${funds.find((f) => f.rec.id === y)?.name}`), bestLeft: Math.round(o[0]!.v), spread: Math.round(o[0]!.v - o[o.length - 1]!.v) };
  }).filter((x) => x !== null);

  // the two other accounts: the one whose order differs most from the opening one, and the one whose best way leaves the least
  // (a dear tariff); each different from the opening account and from each other
  const others = byAccount.filter((x) => x.id !== open);
  const mostDifferent = [...others].sort((a, b) => b.swappedPairs - a.swappedPairs || a.bestLeft - b.bestLeft)[0];
  const dearest = [...others].filter((x) => x.id !== mostDifferent?.id).sort((a, b) => a.bestLeft - b.bestLeft)[0];
  const accounts = [open, mostDifferent?.id, dearest?.id].filter((x): x is string => !!x);

  const rowsAt = (house: string) => {
    const order = orderAt(funds, house);
    const bestId = order[0]?.id ?? null;
    const best = bestId ? costsAt(index, bestId, house) : null;
    return funds.map((f) => {
      const rec = f.rec;
      const at = f.byHouse[house];
      const fees = { fixed: num(rec.fees.fixed_management as never), variable: num(rec.fees.variable_management as never), trustee: num(rec.fees.trustee as never), total: r3(sumFees(rec) * 100) };
      const g = gapOf(rec);
      const cnt = counted(rec);
      const k = priced(at) ? costsAt(index, rec.id, house) : null;
      const diff = priced(at) && order[0] ? at.valueN - order[0].v : null;
      return {
        fund: f.name,
        number: f.number,
        id: rec.id,
        kind: KIND[f.option] + (rec.hedged ? ", currency-hedged" : ""),
        replication: rec.replication?.method ?? null,
        payout: rec.distribution_policy ?? null,
        fees,
        gap: g ? r2(g.pct) : null,
        gapYears: g ? g.years : 0,
        gapBeyondFees: g ? r2(g.pct + fees.total) : null, // positive: the fund lost less than its listed fees
        countedPct: r3(cnt.pct),
        countedFrom: cnt.from,
        a07: cnt.a07 === null ? null : r3(cnt.a07),
        ranked: priced(at) && !at.open && opensOn(rec),
        open: priced(at) ? at.open : null,
        notPriced: priced(at) ? null : (at && "reason" in at ? (at.reason as { code: string }).code : "no row"),
        left: priced(at) ? Math.round(at.valueN) : null,
        diffNis: diff === null ? null : Math.round(diff),
        // the difference against the account's best ranked fund, by who takes it (F-91): a cost higher than the best's is a minus
        diffFund: k && best ? Math.round(best.fund - k.fund) : null,
        diffAccount: k && best ? Math.round(best.account - k.account) : null,
        diffTax: k && best ? Math.round(best.tax - k.tax) : null,
        account: k ? Math.round(k.account) : null,
        fundCost: k ? Math.round(k.fund) : null,
        tax: k ? Math.round(k.tax) : null,
        accountLines: k ? k.lines : null,
        // a fund of the other kind (currency-hedged): the page shows its difference over the dollar's range (F-94), from its fall to its rise
        crossRange: !opensOn(rec) && priced(at) && bestId && bundle.dollarRange ? crossOf(index, rec.id, bestId, house) : null,
      };
    }).sort((a, b) => Number(b.ranked) - Number(a.ranked) || (b.left ?? -1e12) - (a.left ?? -1e12));
  };

  const at = Object.fromEntries(accounts.map((h) => [h, { name: nameOf(h), rows: rowsAt(h) }]));
  // at the opening account: the order by the gap column, by listed fees and by the counted rate, against the order by shekels
  const rows0 = at[open]!.rows.filter((r) => r.ranked);
  const byShekel = rows0.map((r) => r.id);
  const sortBy = (key: (r: (typeof rows0)[number]) => number | null, desc: boolean) => [...rows0].filter((r) => key(r) !== null).sort((a, b) => (desc ? key(b)! - key(a)! : key(a)! - key(b)!)).map((r) => r.id);
  const orders = {
    byGap: sortBy((r) => r.gap, true),
    byListedFees: sortBy((r) => r.fees.total, false),
    byCounted: sortBy((r) => r.countedPct, false),
  };
  const nm = (id: string) => funds.find((f) => f.rec.id === id)?.name ?? id;
  const disagree = Object.fromEntries(Object.entries(orders).map(([k, o]) => [k, discordant(byShekel, o).map(([x, y]) => `${nm(x)} / ${nm(y)}`)]));
  // pairs the shekel column shows as equal (within 1 NIS) while a column tells them apart
  const ties: { a: string; b: string; diffNis: number; gap: [number | null, number | null]; fees: [number, number]; counted: [number, number] }[] = [];
  for (let i = 0; i < rows0.length; i++) for (let j = i + 1; j < rows0.length; j++) {
    const a = rows0[i]!, b = rows0[j]!;
    if (a.left !== null && b.left !== null && Math.abs(a.left - b.left) <= 1) ties.push({ a: a.fund, b: b.fund, diffNis: a.diffNis!, gap: [a.gap, b.gap], fees: [a.fees.total, b.fees.total], counted: [a.countedPct, b.countedPct] });
  }
  // what varies across the index's ranked funds, and across all its rows
  const all0 = at[open]!.rows;
  const uniq = <T,>(xs: T[]) => [...new Set(xs.map((x) => JSON.stringify(x)))].map((x) => JSON.parse(x) as T);
  const range = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x !== null); return v.length ? [Math.min(...v), Math.max(...v)] : null; };
  const varies = {
    rows: all0.length,
    rankedRows: rows0.length,
    kinds: uniq(all0.map((r) => r.kind)),
    kindsRanked: uniq(rows0.map((r) => r.kind)),
    replication: uniq(all0.map((r) => r.replication)),
    payout: uniq(all0.map((r) => r.payout)),
    listedFees: range(rows0.map((r) => r.fees.total)),
    variableFeeRows: rows0.filter((r) => (r.fees.variable ?? 0) > 0).length,
    gap: range(rows0.map((r) => r.gap)),
    gapAheadOfIndex: rows0.filter((r) => (r.gap ?? -1) > 0).map((r) => `${r.fund} ${r.gap}`),
    gapBetterThanFees: rows0.filter((r) => r.gap !== null && r.gap > -r.fees.total).map((r) => `${r.fund}: gap ${r.gap}, fees ${r.fees.total}`),
    gapWorseThanFees: rows0.filter((r) => r.gap !== null && r.gap < -r.fees.total).map((r) => `${r.fund}: gap ${r.gap}, fees ${r.fees.total}, counted ${r.countedPct}`),
    noRecord: all0.filter((r) => r.gapYears === 0).map((r) => r.fund),
    gapYears: uniq(all0.map((r) => r.gapYears)),
    counted: range(rows0.map((r) => r.countedPct)),
    accountPartAtOpen: range(rows0.map((r) => r.account)),
    diffAccountAtOpen: range(rows0.map((r) => r.diffAccount)),
    diffTaxAtOpen: range(rows0.map((r) => r.diffTax)),
    diffFundAtOpen: range(rows0.map((r) => r.diffFund)),
  };
  result.push({
    index: index.name,
    id: index.id,
    opensOn: { account: nameOf(open), fund: view.headline.fund.name, left: Math.round(view.headline.valueN) },
    accounts: accounts.map((h) => ({ id: h, name: nameOf(h), why: h === open ? "the page opens on it" : h === mostDifferent?.id ? "its fund order differs most from the opening account's" : "the account whose best way leaves the least" })),
    at,
    orders,
    disagreeWithShekels: disagree,
    equalInShekels: ties,
    varies,
    allAccounts: byAccount,
    pick: pickFund,
  });
}

// ---------------------------------------------------------------- what the fund records hold (data/funds, the latest record of each fund)
const files = readdirSync(join(root, "data/funds")).filter((f) => f.endsWith(".json"));
const latest = new Map<string, Record<string, any>>();
for (const f of files.sort()) { const d = JSON.parse(readFileSync(join(root, "data/funds", f), "utf8")); latest.set(d.id, d); }
const recs = [...latest.values()];
const has = (pred: (d: Record<string, any>) => boolean) => recs.filter(pred).length;
const isNum = (v: any) => v && typeof v.value === "number";
const coverage = {
  files: files.length,
  funds: recs.length,
  fixed_management: has((d) => isNum(d.fees?.fixed_management)),
  variable_management: has((d) => isNum(d.fees?.variable_management)),
  trustee: has((d) => isNum(d.fees?.trustee)),
  tracking_record: has((d) => (d.tracking_record?.years ?? []).length > 0),
  tracking_years: Object.fromEntries([0, 1, 2, 3, 4, 5].map((n) => [n, has((d) => (d.tracking_record?.years ?? []).length === n)])),
  tracking_difference_12m_value: has((d) => isNum(d.fees?.tracking_difference_12m)),
  median_spread_value: has((d) => isNum(d.fees?.median_spread)),
  load_value: has((d) => isNum(d.fees?.load)),
  load_nonzero: has((d) => isNum(d.fees?.load) && d.fees.load.value !== 0),
  withholding_drag_value: has((d) => isNum(d.fees?.fund_level_withholding_drag)),
  replication: has((d) => !!d.replication?.method),
  replicationMethods: [...new Set(recs.map((d) => d.replication?.method ?? null))],
  distribution_policy: has((d) => !!d.distribution_policy),
  distribution_yield: has((d) => isNum(d.distribution?.yield)),
  share_price: has((d) => isNum(d.share_price)),
  hedged_true: has((d) => d.hedged === true),
  assets_or_size_field: has((d) => "aum" in d || "assets" in d || "net_assets" in d || "size" in d),
  inception_field: has((d) => "inception" in d || "launch_date" in d || "inception_date" in d),
};

const out = { generated: new Date().toISOString().slice(0, 10), plan: planText, indices: result, coverage };
writeFileSync(join(here, "numbers.json"), JSON.stringify(out, null, 1));
console.log("plan:", planText);
for (const r of result as any[]) {
  if (!r.at) { console.log(r.index, r.note); continue; }
  console.log(`\n== ${r.index} — opens on ${r.opensOn.account}, ${r.opensOn.fund}, ${r.opensOn.left}`);
  for (const [h, a] of Object.entries(r.at) as [string, any][]) {
    console.log(` -- at ${a.name}`);
    for (const x of a.rows) console.log(`   ${x.ranked ? " " : "x"} ${x.fund.padEnd(42)} ${x.kind.slice(0, 22).padEnd(22)} fees ${String(x.fees.total).padEnd(6)} gap ${String(x.gap).padEnd(6)} (${x.gapYears}y) counted ${String(x.countedPct).padEnd(6)} ${x.countedFrom.padEnd(16)} diff ${String(x.diffNis).padStart(7)} = fund ${String(x.diffFund).padStart(6)} acct ${String(x.diffAccount).padStart(6)} tax ${String(x.diffTax).padStart(6)}${x.crossRange ? ` | page: ${x.crossRange.atLo} to ${x.crossRange.atHi} over the dollar ${x.crossRange.dollarLo}%..${x.crossRange.dollarHi}%` : ""}${x.notPriced ? ` | not priced: ${x.notPriced}` : ""}${x.open ? " | open rule" : ""}`);
  }
  console.log("  disagree:", JSON.stringify(r.disagreeWithShekels));
  console.log("  equal in shekels:", JSON.stringify(r.equalInShekels));
  console.log("  varies:", JSON.stringify(r.varies));
  for (const a of r.allAccounts) if (a.swappedPairs) console.log("  swaps at", a.name, a.topSame ? "" : `(top: ${a.top})`, JSON.stringify(a.swapped));
  console.log("  accounts:", r.allAccounts.map((a: any) => `${a.name}:${a.swappedPairs}${a.topSame ? "" : "*"}`).join(" "));
}
console.log("\ncoverage", JSON.stringify(coverage));
