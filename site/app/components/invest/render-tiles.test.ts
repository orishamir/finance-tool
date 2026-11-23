// The index page's tiles and account notes rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { buildInvest, indexById, tieShareOf, hasKinds, kindOf } from "../../lib/invest";
import { entered } from "../../lib/value";
import { fmt } from "../../lib/format";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, crowned, pairVerdict, pickOfHeadline, tieCount, tieFunds, tieSet } from "./pair";
import { Terms } from "./custom-entries";
import { bundle, t, plan, shown, fundRow, html, lists, DollarFor, ReceiptAndFees } from "./render-fixtures";

/** The value, or a failure that names what was not there. */
function sure<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`not found: ${what}`);
  return x;
}

describe("hedged or not: what happened (F-95, founder 2026-10-31)", () => {
  const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(sp)!;
  const out = html(createElement(DollarFor, { view: sp, bundle, plan, pick })).replace(/<!-- -->/g, "");
  it("says the 2022 and 2025 reports as they are, in the order of the card", () => {
    expect(out).toContain("המדד ירד");
    expect(out).toContain("18.5%");
    expect(out).toContain("21.8%");
    expect(out).toContain("קרה ההפך");
    expect(out).toContain("15.3%");
    expect(out).toContain(invest.dollar.bottomHead);
  });
  // 1146471's report prints 2022 to 2025 and its record holds them: eight funds without hedging report 2022
  it("draws on the eight funds of 2022 and the eleven of 2025", () => {
    expect(out).toContain("8 קרנות");
    expect(out).toContain("11 קרנות");
  });
  // a hedged report F-92 (d) does not compare gives no gap, and the sentence beside the range does not count it
  it("leaves a report it does not compare out of the gap range and out of the count beside it", () => {
    // the costs tile's figure, each end a computed figure that opens its sheet: "⁦1.8⁩ עד ⁦2.7⁩ נקודות בשנה"
    const tile = (o: string) => shown(o).match(new RegExp(`⁦[-−0-9.]+⁩ עד ⁦[-−0-9.]+⁩ ${invest.dollar.pointsAYear}`))?.[0] ?? "";
    const render = (b: typeof bundle) => {
      const v = buildInvest({ bundle: b, index: indexById(b, "index-nasdaq100")!, plan });
      return html(createElement(DollarFor, { view: v, bundle: b, plan, pick: pickOfHeadline(v)! })).replace(/<!-- -->/g, "");
    };
    // the report made uncompared is, where one of the two is not ranked (a fund listed before tax, F-118), that one: the tile reads the
    // hedged kind's pair, which the other then still gives
    const nq = buildInvest({ bundle, index: sure(indexById(bundle, "index-nasdaq100"), "the NASDAQ-100"), plan });
    const ranked = (id: string) => allFunds(nq).some((f) => f.rec.id === id && f.best !== undefined);
    const hedged = bundle.funds.filter((f) => f.exposure_id === "index-nasdaq100" && f.hedged === true && f.domicile === "IL" && f.tracking_record).sort((a, b) => Number(ranked(a.id)) - Number(ranked(b.id)));
    expect(hedged).toHaveLength(2);
    const [off, kept] = hedged as [(typeof hedged)[0], (typeof hedged)[0]];
    // the same record made "unstated", and twenty points behind its index every year: compared, its gap would widen the range
    const tr = off.tracking_record!;
    const changed = { ...bundle, funds: bundle.funds.map((f) => (f.id === off.id ? { ...f, tracking_record: { ...tr, benchmark: { ...tr.benchmark, dividends: "unstated" as const }, years: tr.years.map((y) => ({ ...y, fund_pct: y.tracking_pct - 20 })) } } : f)) };
    const base = render(bundle), out2 = render(changed);
    expect(tile(base)).not.toBe("");
    // the range rests on the compared report alone: its own gaps, not twenty points
    expect(tile(out2)).not.toBe("");
    expect(tile(out2)).not.toMatch(/⁦(19|20|21|22)\./);
    // the sentence beside it: two reports before, then the one compared report by its name
    expect(shown(base)).toContain("השיגו שתי הקרנות עם הנטרול");
    expect(shown(out2)).not.toContain("השיגו שתי הקרנות");
    expect(shown(out2)).toContain("השיגה פחות מהמדד שלה");
    expect(kept.id).not.toBe(off.id);
  });
  // the words say a hedged fund earned less than its index in every reported year: a report that says otherwise means changing them
  it("every hedged fund's report falls short of its index", () => {
    for (const f of bundle.funds.filter((x) => x.hedged === true)) for (const y of f.tracking_record?.years ?? []) expect(y.fund_pct, `${f.id} ${y.year}`).toBeLessThan(y.tracking_pct);
  });
  it("renders on every index with both kinds", () => {
    // on a plan where neither the CPI nor the dollar moves (A-02 = A-03 = 0), the two readings of TXS OQ26 give one result (method §13), so
    // no fund is listed before tax for its status and each of these indices has a ranked fund of both kinds
    const steady = { ...plan, inflation: 0, values: { ...plan.values, inflation: entered(0, "pct_per_year", t) } };
    for (const id of ["index-nasdaq100", "index-msci-world", "index-msci-acwi"]) {
      const v = buildInvest({ bundle, index: sure(indexById(bundle, id), id), plan: steady });
      expect(hasKinds(v), id).toBe(true);
      expect(html(createElement(DollarFor, { view: v, bundle, plan: steady, pick: sure(pickOfHeadline(v), `${id}'s top pair`) })), id).toContain(invest.dollar.bottomHead);
    }
    expect(allFunds(sp).some((f) => kindOf(f.rec) === "hedged")).toBe(true);
  });
});

describe("the tie set of F-80 in the fees panel and the lists", () => {
  // the plan: 10,000 now, 500 a month, 10 years, 7%
  const base: WorkbenchInputs = {
    ...plan, amountNow: 10000, monthly: 500, years: 10,
    values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) },
  };
  // the same over 30 years
  const long: WorkbenchInputs = { ...base, years: 30, values: { ...base.values, years: entered(30, "years", t) } };
  const theta = tieShareOf(bundle);
  const key = (x: { house: string; fund: string }) => `${x.house} ${x.fund}`;
  // A fixed input built for the ties: the collected data with a twin of the S&P 500 page's top fund, the same record under its own number
  // and the same name, so the two leave the same at every house that sells both. IBI sells the twin's kind fund by fund here, under an
  // agreement that names the top fund alone (BRK-38), so the twin has no price there. Whatever the collected data's tie set T is, the
  // twin's is T with (h, twin) beside every (h, top fund) of T at a house that sells the twin: every expected count below is derived from T.
  const real = (p: WorkbenchInputs) => buildInvest({ bundle, index: sure(indexById(bundle, "index-sp500"), "the S&P 500"), plan: p });
  const top = sure(pickOfHeadline(real(base)), "the S&P 500 page's top pair");
  const rec = sure(bundle.funds.find((f) => f.id === top.fund), "the top fund's record");
  const twinId = "9999903";
  const twin = { ...rec, id: twinId, identifiers: { ...rec.identifiers, isin: null, tase_number: twinId } };
  const ibi = sure(bundle.snapshots.find((s) => s.id === "ibi"), "IBI's price list");
  const one = sure(bundle.snapshots.find((s) => s.fundByFund)?.fundByFund, "a house's distribution agreements");
  const tied = {
    ...bundle,
    funds: [...bundle.funds, twin],
    snapshots: bundle.snapshots.map((s) => (s.id === "ibi" ? { ...ibi, fundByFund: { ...one, applies_to: ["mutual_fund_units"], named: [rec.id] } } : s)),
  };
  /** A house sells the twin where it sells the top fund, except IBI, whose agreement here names the top fund alone. */
  const sellsTwin = (house: string) => house !== "ibi";
  const expected = (t0: { house: string; fund: string }[]) => new Set([...t0.map(key), ...t0.filter((x) => x.fund === rec.id && sellsTwin(x.house)).map((x) => key({ house: x.house, fund: twinId }))]);
  const e10 = expected(tieSet(real(base), top, theta));
  const e30 = expected(tieSet(real(long), sure(pickOfHeadline(real(long)), "the 30-year top pair"), theta));
  const fundsOf = (e: Set<string>) => new Set([...e].map((k) => k.split(" ")[1]));
  const spIndex = sure(indexById(tied, "index-sp500"), "the S&P 500");
  const sp = buildInvest({ bundle: tied, index: spIndex, plan: base });
  const head = sure(pickOfHeadline(sp), "the fixed input's top pair");
  const sp3 = buildInvest({ bundle: tied, index: spIndex, plan: long });
  const head3 = sure(pickOfHeadline(sp3), "the fixed input's 30-year top pair");
  const n10 = e10.size;
  const n30 = e30.size;
  it("the fixed input: the collected data's tie sets, with the twin beside the top fund wherever it is sold", () => {
    expect(new Set(tieSet(sp, head, theta).map(key))).toEqual(e10);
    expect(new Set(tieSet(sp3, head3, theta).map(key))).toEqual(e30);
    // the twin is there: the top house sells it (else no tie below is built)
    expect(e10.has(key({ house: top.house, fund: twinId }))).toBe(true);
  });
  it("counts every pair within the threshold of the top, and crowns none", () => {
    expect(tieCount(sp, head, theta)).toBe(n10);
    expect(crowned(sp, head, theta)).toBe(false);
    expect(tieCount(sp3, head3, theta)).toBe(n30);
    expect(tieFunds(sp3, head3, theta)).toHaveLength(fundsOf(e30).size);
    expect(crowned(sp3, head3, theta)).toBe(false);
  });
  it("before any pick, the fund list calls the page's own fund one of the tied, not the site's pick (pass 5 readers)", () => {
    const out = shown(lists(sp3, tied, long, head3));
    expect(fundRow(lists(sp3, tied, long, head3), head3.fund)).toContain(invest.pair.tiedWord);
    expect(out).not.toContain(invest.pair.cheapestTag);
  });
  it("every tied fund's row in the fund list says it is one of the tied, in the same words, and no other row does (independent check of pass 5)", () => {
    const out = lists(sp3, tied, long, head3);
    const set = fundsOf(e30);
    for (const f of allFunds(sp3)) expect(fundRow(out, f.rec.id).includes(invest.pair.tiedWord), f.rec.id).toBe(set.has(f.rec.id));
  });
  it("the fund list marks tied funds, not pairs: one fund tied at two houses is one row marked (independent check of pass 5)", () => {
    // the fixed input with a twin of the top house too, the same price list under its own id and name, so the top fund and its twin tie
    // at both houses; the tie set has more pairs than it has funds, and each fund is one row
    const house = sure(tied.snapshots.find((s) => s.id === top.house), "the top house's price list");
    const twinHouse = { ...house, id: "twin-house", provider: { ...house.provider, name_he: `${house.provider.name_he} תאום` } };
    const doubled = { ...tied, snapshots: [...tied.snapshots, twinHouse] };
    const v = buildInvest({ bundle: doubled, index: sure(indexById(doubled, "index-sp500"), "the S&P 500"), plan: base });
    const h = sure(pickOfHeadline(v), "the doubled input's top pair");
    const set = tieSet(v, h, theta);
    const funds = tieFunds(v, h, theta);
    for (const fund of [rec.id, twinId]) expect(set.filter((x) => x.fund === fund).map((x) => x.house), fund).toEqual(expect.arrayContaining([top.house, "twin-house"]));
    expect(set.length).toBeGreaterThan(funds.length);
    const out = lists(v, doubled, base, h);
    const marked = allFunds(v).filter((f) => fundRow(out, f.rec.id).includes(invest.pair.tiedWord)).map((f) => f.rec.id);
    expect(marked).toHaveLength(funds.length);
    expect(new Set(marked)).toEqual(new Set(funds));
  });
  it("no list row carries the star", () => {
    expect(shown(lists(sp, tied, base, head))).not.toContain(invest.pair.cheapestTag);
  });
  it("a pick of another fund changes nothing in the accounts list but which row is chosen: each account's stretch is over all its funds (D104)", () => {
    const accounts = (out: string) => out.slice(out.indexOf('data-anchor="accounts"'), out.indexOf('data-anchor="funds"'));
    const first = accounts(lists(sp, tied, base, head));
    // the other fund of the tie, of the same kind, at the same house
    const other = sure(tieFunds(sp, head, theta).find((f) => f !== head.fund), "the other fund of the tie");
    const two = accounts(lists(sp, tied, base, { house: head.house, fund: other }));
    const keys = (x: string) => [...x.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1]);
    expect(keys(first).length).toBeGreaterThan(2);
    expect(keys(two)).toEqual(keys(first));
    expect(shown(two)).toEqual(shown(first));
    // no row is marked as one the fold never shows
    expect(lists(sp, tied, base, head)).not.toContain("data-cannot");
  });
});

describe("a typed entry's line", () => {
  it("with nothing typed, the line says what is not known, with no entered tag before its own negation", () => {
    const out = shown(html(createElement(Terms, { terms: { shown: [], empty: [invest.customEntries.fields.trustee] }, editing: { kind: "fund", id: "x" } })));
    expect(out).toContain(invest.customEntries.unknownLine(invest.customEntries.fields.trustee));
    expect(out.replace(invest.customEntries.unknownLine(invest.customEntries.fields.trustee), "")).not.toContain("הזנתם");
  });
});

describe("the account card's notes on prices abroad (D65, D66)", () => {
  const sp = indexById(bundle, "index-sp500")!;
  const ta = indexById(bundle, "index-ta125")!;
  const card = (index: typeof sp) => {
    const view = buildInvest({ bundle, index, plan: { ...plan, currentAccounts: true } });
    return shown(lists(view, bundle, { ...plan, currentAccounts: true }, pickOfHeadline(view)!));
  };

  it("names the houses whose price lists limit the spread, from their records, on an index with funds bought abroad", () => {
    const out = card(sp);
    expect(out).toContain(invest.pair.abroadSpread(["אי.בי.אי", "אלטשולר טרייד", "מיטב טרייד"]));
    // F-103 (D67): One Zero prints a charge per dividend abroad, which its figures count; the note says so
    expect(out).toContain(invest.pair.abroadOthers);
    // why One Zero's charge is counted while other written ceilings are not, and on which funds
    for (const part of invest.pair.abroadPerDividend.replace("{name}", "וואן זירו").split(/\{amount\}|\{custody\}/)) expect(out).toContain(part);
    expect(out).toContain(fmt.usd(50));
    // the custody abroad it calls free is the price list's own 0, not typed
    expect(out).toContain(fmt.pct(0));
  });

  it("the fees panel names a bank's current account as an item only where the pair's account charges one", () => {
    const p = { ...plan, currentAccounts: true as const };
    const view = buildInvest({ bundle, index: sp, plan: p });
    const fund = pickOfHeadline(view)!.fund;
    const panel = (house: string) => {
      const out = html(createElement(ReceiptAndFees, { view, bundle, plan: p, pick: { house, fund }, chosen: true }));
      return shown(out.slice(out.indexOf('data-chart="option-bars"')));
    };
    let banks = 0;
    for (const h of view.providers.filter((x) => !x.custom).map((x) => x.id)) {
      const pc = pairVerdict(view, bundle, p, { house: h, fund }, true).pc;
      if (!pc) continue;
      const current = pc.account.some((l) => l.line === "account");
      if (current) banks++;
      expect(panel(h).includes(invest.pair.lines.account!), h).toBe(current);
    }
    expect(banks).toBeGreaterThan(0);
  });

  it("says neither on an index whose funds are all bought in Tel Aviv, if it has none bought abroad", () => {
    const view = buildInvest({ bundle, index: ta, plan });
    const out = card(ta);
    const abroad = view.options.some((o) => o.id === "abroad" && o.exists);
    expect(out.includes(invest.pair.abroadTitle)).toBe(abroad);
  });
});
