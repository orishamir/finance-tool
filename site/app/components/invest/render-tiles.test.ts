// The index page's tiles and account notes rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { buildInvest, indexById, knownIndices, tieShareOf, hasKinds, kindOf } from "../../lib/invest";
import { entered } from "../../lib/value";
import { fmt } from "../../lib/format";
import type { WorkbenchInputs } from "../../lib/providers";
import { allFunds, crowned, ownBankHelp, pairVerdict, pickOfHeadline, tieCount, tieFunds, tieSet } from "./pair";
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
    // both kinds ranked at a house: a kind whose funds are all listed before tax (F-118) has no pair to draw
    let both = 0;
    for (const index of knownIndices(bundle)) {
      const v = buildInvest({ bundle, index, plan });
      if (!hasKinds(v)) continue;
      both++;
      expect(html(createElement(DollarFor, { view: v, bundle, plan, pick: pickOfHeadline(v)! })), index.id).toContain(invest.dollar.bottomHead);
    }
    expect(both).toBeGreaterThan(0);
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
  // A fixed input built for the ties: the collected data with a twin of the S&P 500 page's top fund, the same record under its own number
  // and the same name, so the two leave the same at every house that sells both. IBI sells the twin's kind fund by fund here, under an
  // agreement that names the top fund alone (BRK-38), so the twin has no price there. On the collected data the top fund at Psagot is
  // alone within the threshold over 10 years, and over 30 years IBI's price of it is within it too; so over 10 years two pairs tie, both
  // at Psagot, and over 30 three, two funds, the top one at two houses.
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
  const spIndex = sure(indexById(tied, "index-sp500"), "the S&P 500");
  const sp = buildInvest({ bundle: tied, index: spIndex, plan: base });
  const head = pickOfHeadline(sp)!;
  const sp3 = buildInvest({ bundle: tied, index: spIndex, plan: long });
  const head3 = pickOfHeadline(sp3)!;
  it("the fixed input: the collected data's tie sets, with the twin beside the top fund wherever it is sold", () => {
    expect(tieSet(real(base), top, theta).map((x) => [x.house, x.fund])).toEqual([["psagot", rec.id]]);
    expect(tieSet(real(long), pickOfHeadline(real(long)), theta).map((x) => [x.house, x.fund])).toEqual([["psagot", rec.id], ["ibi", rec.id]]);
    expect(new Set(tieSet(sp, head, theta).map((x) => `${x.house} ${x.fund}`))).toEqual(new Set([`psagot ${rec.id}`, `psagot ${twinId}`]));
    expect(new Set(tieSet(sp3, head3, theta).map((x) => `${x.house} ${x.fund}`))).toEqual(new Set([`psagot ${rec.id}`, `psagot ${twinId}`, `ibi ${rec.id}`]));
  });
  it("counts every pair within the threshold of the top, and crowns none", () => {
    expect(tieCount(sp, head, theta)).toBe(2);
    expect(crowned(sp, head, theta)).toBe(false);
    expect(tieCount(sp3, head3, theta)).toBe(3);
    expect(tieFunds(sp3, head3, theta)).toHaveLength(2);
    expect(crowned(sp3, head3, theta)).toBe(false);
  });
  it("the tied pair neither chosen nor set beside it is named in the fees panel, with its number where another fund has its name (fourth pass)", () => {
    const out = shown(html(createElement(ReceiptAndFees, { view: sp3, bundle: tied, plan: long, pick: head3, chosen: false, onPick: () => undefined }))).replace(/\u00a0/g, " ");
    const line = out.slice(out.indexOf(invest.pair.tieWhy(3)));
    expect(line).toContain(invest.pair.tieThird);
    const third = line.slice(line.indexOf(invest.pair.tieThird));
    // the third pair's fund shares its name with the other fund of the set, so its number follows its name
    expect(third.includes(rec.id) || third.includes(twinId)).toBe(true);
    // what makes a tie is said where the tie is named, with P-01 read from data/parameters
    const rule = line.slice(line.indexOf(invest.pair.tieRule.before.trim()));
    expect(rule.replace(/[\u2066-\u2069\u200e\u200f]/g, "")).toContain(`${invest.pair.tieRule.before.trim()}${fmt.pct((bundle.p01.value as { value: number }).value)}${invest.pair.tieRule.after}`);
  });
  it("before any pick, the fund list calls the page's own fund one of the tied, not the site's pick (pass 5 readers)", () => {
    const out = shown(lists(sp3, tied, long, head3));
    expect(fundRow(lists(sp3, tied, long, head3), head3.fund)).toContain(invest.pair.tiedWord);
    expect(out).not.toContain(invest.pair.cheapestTag);
  });
  it("every tied fund's row in the fund list says it is one of the tied, in the same words, and no other row does (independent check of pass 5)", () => {
    const out = lists(sp3, tied, long, head3);
    const set = tieFunds(sp3, head3, theta);
    for (const f of allFunds(sp3)) expect(fundRow(out, f.rec.id).includes(invest.pair.tiedWord), f.rec.id).toBe(set.includes(f.rec.id));
  });
  it("the fund list marks tied funds, not pairs: one fund tied at two houses is one row marked (independent check of pass 5)", () => {
    // the top fund is tied at Psagot and at IBI: one row marked for it, and one for the twin
    const set = tieSet(sp3, head3, theta);
    expect(set.filter((x) => x.fund === rec.id)).toHaveLength(2);
    const out = lists(sp3, tied, long, head3);
    for (const f of allFunds(sp3)) expect(fundRow(out, f.rec.id).includes(invest.pair.tiedWord), f.rec.id).toBe(tieFunds(sp3, head3, theta).includes(f.rec.id));
  });
  it("before any pick, the pair set beside the page's is the other of the tie, and no pair is called first or next", () => {
    const out = shown(html(createElement(ReceiptAndFees, { view: sp3, bundle: tied, plan: long, pick: head3, chosen: false, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieOther);
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.next);
    expect(out).not.toContain("★");
  });
  it("with the person's own pick far from the best pair, the best pair is not crowned either, and the tie is counted (the account list's test)", () => {
    const out = shown(html(createElement(ReceiptAndFees, { view: sp3, bundle: tied, plan: long, pick: { house: "leumi", fund: head3.fund }, chosen: true, onPick: () => undefined })));
    expect(out).not.toContain(invest.pair.cheapestStar);
    expect(out).toContain(invest.pair.tieTop(3, 2));
  });
  it("a pick inside the tie set: the other pair is not called the cheap one, and the tie is counted as the title counts", () => {
    const tiedPick = sure(tieSet(sp3, head3, theta).find((x) => !(x.house === head3.house && x.fund === head3.fund)), "a pair of the tie other than the top");
    const out = shown(html(createElement(ReceiptAndFees, { view: sp3, bundle: tied, plan: long, pick: tiedPick, chosen: true, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieTop(3, 2));
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.tieWhy(2));
    expect(out).not.toContain(invest.pair.moreIfCheapest);
    expect(out).toContain(invest.pair.vsYours);
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
  it("why no pair is first follows the pair it is set beside, never before it", () => {
    const out = html(createElement(ReceiptAndFees, { view: sp, bundle: tied, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    const other = out.indexOf(invest.pair.pickCheapest);
    const why = out.indexOf(invest.pair.tieWhy(2));
    expect(other).toBeGreaterThan(0);
    expect(why).toBeGreaterThan(other);
  });
});

describe("a typed entry's line", () => {
  it("with nothing typed, the line says what is not known, with no entered tag before its own negation", () => {
    const out = shown(html(createElement(Terms, { terms: { shown: [], empty: [invest.customEntries.fields.trustee] }, editing: { kind: "fund", id: "x" } })));
    expect(out).toContain(invest.customEntries.unknownLine(invest.customEntries.fields.trustee));
    expect(out.replace(invest.customEntries.unknownLine(invest.customEntries.fields.trustee), "")).not.toContain("הזנתם");
  });
});

describe("the account card's notes on prices abroad and its own-bank list (D64, D65, D66)", () => {
  const sp = indexById(bundle, "index-sp500")!;
  const ta = indexById(bundle, "index-ta125")!;
  const card = (index: typeof sp, own: string | null) => {
    const view = buildInvest({ bundle, index, plan: { ...plan, currentAccounts: { own } } });
    return shown(lists(view, bundle, { ...plan, currentAccounts: { own } }, pickOfHeadline(view)!, { ownBank: { value: own, onChange: () => undefined } }));
  };

  it("names the houses whose price lists limit the spread, from their records, on an index with funds bought abroad", () => {
    const out = card(sp, null);
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
    const p = { ...plan, currentAccounts: { own: null } };
    const view = buildInvest({ bundle, index: sp, plan: p });
    const fund = pickOfHeadline(view)!.fund;
    const panel = (house: string) => {
      const out = html(createElement(ReceiptAndFees, { view, bundle, plan: p, pick: { house, fund }, chosen: true, onPick: () => undefined }));
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
    const out = card(ta, null);
    const abroad = view.options.some((o) => o.id === "abroad" && o.exists);
    expect(out.includes(invest.pair.abroadTitle)).toBe(abroad);
  });

  it("offers every bank whose current account costs something, under the list, with what it does in its \"?\"", () => {
    // the bank whose current account is free is named, so its row reads as a bank's
    expect(ownBankHelp(buildInvest({ bundle, index: sp, plan }), bundle)).toBe(invest.pair.ownBank.counted(["וואן זירו"]));
    const raw = lists(buildInvest({ bundle, index: sp, plan }), bundle, plan, pickOfHeadline(buildInvest({ bundle, index: sp, plan }))!, { ownBank: { value: null, onChange: () => undefined } });
    // at the bottom of the card, under the list it changes, its words in the "?" and not in a line under it
    expect(raw.indexOf(invest.pair.ownBank.label)).toBeGreaterThan(raw.indexOf(invest.pair.listLabelAccounts));
    expect(shown(raw)).not.toContain(invest.pair.ownBank.counted(["וואן זירו"]));
    for (const id of ["discount", "fibi", "hapoalim", "jerusalem", "leumi", "massad", "mercantile", "mizrahi-tefahot", "yahav"]) expect(raw).toContain(`value="${id}"`);
    // One Zero's price list prints its current account free: marking it would change no figure (guidelines/design.md)
    expect(raw).not.toContain(`value="one-zero"`);
    expect(raw).not.toContain(`value="psagot"`);
    expect(raw).not.toContain(`value="pepper"`);
  });
});
