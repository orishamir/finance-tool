// The index page's tiles and account notes rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { invest } from "../../copy";
import { buildInvest, indexById, tieShareOf, hasKinds, kindOf } from "../../lib/invest";
import { entered } from "../../lib/value";
import { fmt } from "../../lib/format";
import type { WorkbenchInputs } from "../../lib/providers";
import { AccountColumn, allFunds, crowned, FundColumn, ownBankHelp, PairResult, pickOfHeadline, tieCount, tieFunds } from "./pair";
import { Terms } from "./custom-entries";
import { DollarSection } from "./dollar";
import { bundle, t, plan, shown, fundRow, html } from "./render-fixtures";

describe("hedged or not: what happened (F-95, founder 2026-10-31)", () => {
  const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(sp)!;
  const out = html(createElement(DollarSection, { view: sp, bundle, plan, pick })).replace(/<!-- -->/g, "");
  it("says the 2022 and 2025 reports as they are, in the order of the card", () => {
    expect(out).toContain("המדד ירד");
    expect(out).toContain("18.5%");
    expect(out).toContain("21.8%");
    expect(out).toContain("קרה ההפך");
    expect(out).toContain("15.3%");
    expect(out).toContain("השורה התחתונה");
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
      return html(createElement(DollarSection, { view: v, bundle: b, plan, pick: pickOfHeadline(v)! })).replace(/<!-- -->/g, "");
    };
    const hedged = bundle.funds.filter((f) => f.exposure_id === "index-nasdaq100" && f.hedged === true && f.domicile === "IL" && f.tracking_record);
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
    for (const id of ["index-nasdaq100", "index-msci-world", "index-msci-acwi"]) {
      const v = buildInvest({ bundle, index: indexById(bundle, id)!, plan });
      expect(hasKinds(v), id).toBe(true);
      expect(html(createElement(DollarSection, { view: v, bundle, plan, pick: pickOfHeadline(v)! }))).toContain("השורה התחתונה");
    }
    expect(allFunds(sp).some((f) => kindOf(f.rec) === "hedged")).toBe(true);
  });
});

describe("the tie set of F-80 in the tiles", () => {
  // the plan: 10,000 now, 500 a month, 10 years, 7%; on the S&P 500 two pairs are within the threshold of the top, both at Psagot
  const base: WorkbenchInputs = {
    ...plan, amountNow: 10000, monthly: 500, years: 10,
    values: { ...plan.values, amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t) },
  };
  const sp = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: base });
  const theta = tieShareOf(bundle);
  const head = pickOfHeadline(sp)!;
  // the same over 30 years: three pairs within the threshold, two funds, one of them at two houses
  const long: WorkbenchInputs = { ...base, years: 30, values: { ...base.values, years: entered(30, "years", t) } };
  const sp3 = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: long });
  const head3 = pickOfHeadline(sp3)!;
  it("counts every pair within the threshold of the top, and crowns none", () => {
    expect(tieCount(sp, head, theta)).toBe(2);
    expect(crowned(sp, head, theta)).toBe(false);
    expect(tieCount(sp3, head3, theta)).toBe(3);
    expect(tieFunds(sp3, head3, theta)).toHaveLength(2);
    expect(crowned(sp3, head3, theta)).toBe(false);
  });
  it("the tied pair in neither tile is named under them, with its number where another fund has its name (fourth pass)", () => {
    // NASDAQ-100, 5,000 now, 500 a month, five years: three pairs within the threshold, the third iShares in Tel Aviv, whose name the
    // same fund abroad has too (scanned over 6 x 5 x 7 plans on every index)
    const short: WorkbenchInputs = { ...base, amountNow: 5000, monthly: 500, years: 5, values: { ...base.values, amount: entered(5000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(5, "years", t) } };
    const nq = buildInvest({ bundle, index: indexById(bundle, "index-nasdaq100")!, plan: short });
    const h = pickOfHeadline(nq)!;
    expect(tieCount(nq, h, theta)).toBe(3);
    const out = shown(html(createElement(PairResult, { view: nq, bundle, plan: short, pick: h, chosen: false, onPick: () => undefined }))).replace(/\u00a0/g, " ");
    const line = out.slice(out.indexOf(invest.pair.tieWhy(3)));
    expect(line).toContain(`${invest.pair.tieThird} פסגות ${invest.pair.tieWith} iShares NASDAQ 100 UCITS ETF USD (Acc)`);
    expect(line).toContain("1159243");
    // what makes a tie is said where the tie is named, with P-01 read from data/parameters
    const rule = line.slice(line.indexOf(invest.pair.tieRule.before.trim()));
    expect(rule.replace(/[\u2066-\u2069\u200e\u200f]/g, "")).toContain(`${invest.pair.tieRule.before.trim()}${fmt.pct((bundle.p01.value as { value: number }).value)}${invest.pair.tieRule.after}`);
  });
  it("before any pick, the fund list calls the page's own fund one of the tied, not the site's pick (pass 5 readers)", () => {
    const out = shown(html(createElement(FundColumn, { view: sp3, bundle, plan: long, today: t, pick: head3, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined })));
    expect(out).toContain(invest.pair.markedTie(2));
    // the column head names where the page's fund stands ("לעומת הקרן שבראש הכרטיס"), the row's tag must not
    expect(out.replaceAll(invest.pair.colDiffMarked, "")).not.toContain(invest.pair.marked);
  });
  it("every tied fund's row in the fund list says it is one of the tied, in the same words, and no other row does (independent check of pass 5)", () => {
    const out = html(createElement(FundColumn, { view: sp3, bundle, plan: long, today: t, pick: head3, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    const tied = tieFunds(sp3, head3, theta);
    for (const f of allFunds(sp3)) expect(fundRow(out, f.rec.id).includes(invest.pair.markedTie(2)), f.rec.id).toBe(tied.includes(f.rec.id));
  });
  it("the fund list counts tied funds, not pairs: one fund tied at two houses is one (independent check of pass 5)", () => {
    // MSCI World, 10,000 now, nothing a month, one year: five pairs within the threshold, three funds (scanned over 4 x 3 x 4 plans on every index)
    const one: WorkbenchInputs = { ...base, amountNow: 10000, monthly: 0, years: 1, values: { ...base.values, amount: entered(10000, "nis", t), monthly: entered(0, "nis_per_month", t), years: entered(1, "years", t) } };
    const w = buildInvest({ bundle, index: indexById(bundle, "index-msci-world")!, plan: one });
    const h = pickOfHeadline(w)!;
    expect(tieCount(w, h, theta)).toBe(5);
    const tied = tieFunds(w, h, theta);
    expect(tied).toHaveLength(3);
    const out = html(createElement(FundColumn, { view: w, bundle, plan: one, today: t, pick: h, chosen: false, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    expect(shown(out)).toContain(invest.pair.markedTie(3));
    expect(shown(out)).not.toContain(invest.pair.markedTie(5));
    for (const id of tied) expect(fundRow(out, id), id).toContain(invest.pair.markedTie(3));
  });
  it("before any pick, the tile says how many pairs share the top, and no pair is called first or next", () => {
    const out = shown(html(createElement(PairResult, { view: sp3, bundle, plan: long, pick: head3, chosen: false, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieTop(3, 2));
    expect(out).toContain(invest.pair.tieOther);
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.next);
    expect(out).not.toContain("★");
  });
  it("with the person's own pick far from the best pair, the best pair's tile is not crowned either (the account list's test)", () => {
    const out = shown(html(createElement(PairResult, { view: sp3, bundle, plan: long, pick: { house: "leumi", fund: head3.fund }, chosen: true, onPick: () => undefined })));
    expect(out).not.toContain(invest.pair.cheapestStar);
    expect(out).toContain(invest.pair.tieTop(3, 2));
  });
  it("a pick inside the tie set: the other pair is not called the cheap one, and the tie is counted as the title counts", () => {
    const tiedPick = { house: "psagot", fund: "5139100" };
    expect(tieCount(sp3, head3, theta)).toBe(3);
    expect(tieFunds(sp3, head3, theta)).toContain(tiedPick.fund);
    const out = shown(html(createElement(PairResult, { view: sp3, bundle, plan: long, pick: tiedPick, chosen: true, onPick: () => undefined })));
    expect(out).toContain(invest.pair.tieTop(3, 2));
    expect(out).toContain(invest.pair.tieWhy(3));
    expect(out).not.toContain(invest.pair.tieWhy(2));
    expect(out).not.toContain(invest.pair.moreIfCheapest);
    expect(out).toContain(invest.pair.vsYours);
  });
  it("the account list stars the one house all the tied pairs are at: its own funds tie with one another, no other house does", () => {
    // the shown row's own markup: a row's other states, laid out unseen beside it, carry every tag they can
    const rowOf = (out: string, key: string) => { const a = out.indexOf(`data-pick-key="${key}"`); const rest = out.slice(a + 1); const b = rest.search(/data-pick-key=|data-case-of=/); return shown(b < 0 ? rest : rest.slice(0, b)); };
    const out = rowOf(html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined })), "psagot");
    expect(head.house).toBe("psagot");
    expect(out).toContain(invest.pair.cheapestTag);
    // and not with a fund outside the set, nor when another house is in it (the tiles' R1 case keeps no star there)
    const far = allFunds(sp).find((f) => f.rec.id !== head.fund && "valueN" in (f.byHouse.psagot ?? {}) && !tieFunds(sp, head, theta).includes(f.rec.id))!;
    const farOut = rowOf(html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: { house: "psagot", fund: far.rec.id }, onPick: () => undefined })), "psagot");
    expect(farOut).not.toContain(invest.pair.cheapestTag);
  });
  it("a cost bar's fund name is never cut: on a phone it has the bar's whole width, and it wraps, held at the index's longest name", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    expect(out).toContain("[overflow-wrap:anywhere] max-md:row-start-3 max-md:col-span-2");
    expect(out).not.toContain("truncate text-xs");
    const longest = allFunds(sp).map((f) => f.name).sort((a, b) => b.length - a.length)[0]!;
    expect(out.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\u00a0/g, " ").split(longest).length - 1).toBeGreaterThanOrEqual(2);
  });
  it("a pick of another fund moves nothing below the lists: each account row carries the grey states it takes with the other funds; the fold holds the rows of every account's order (pick-list-hold)", () => {
    const out = html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined }));
    const abroad = allFunds(sp).find((f) => f.option === "abroad" && f.best && !("valueN" in (f.byHouse.psagot ?? {})))!;
    expect(abroad).toBeDefined();
    expect(out).toMatch(/data-case-of="psagot" data-case="grey\|/);
    const funds = html(createElement(FundColumn, { view: sp, bundle, plan: base, today: t, pick: head, onPick: () => undefined, filter: null, onFilter: () => undefined }));
    // no row is marked as one the fold never shows: the fold reads every account's order instead (fourth pass: a row so marked stood
    // in the fold the page opened with, and the first pick after a link moved what lies below by 233 px)
    expect(funds).toContain('data-pick-key="us-voo"');
    expect(funds).not.toContain("data-cannot");
  });
  it("why no pair is first is a line under both tiles, not inside one: held there, it left a hole in the tile when there was no tie", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    const tilesEnd = out.indexOf(invest.pair.pickCheapest);
    const why = out.indexOf(invest.pair.tieWhy(10));
    expect(why).toBeGreaterThan(tilesEnd);
  });
  it("the account list's head holds every fund's name laid out as the shown one, a wrapping tag on each, so a long name moves nothing", () => {
    const out = html(createElement(AccountColumn, { view: sp, bundle, years: 10, pick: head, onPick: () => undefined }));
    const headPart = out.slice(out.indexOf(invest.pair.accounts), out.indexOf(invest.pair.accountsHint));
    const tags = headPart.match(/<span class="inline-flex w-fit items-center[^"]*"/g) ?? [];
    expect(tags.length).toBe(allFunds(sp).length + 1);
    expect(tags.filter((x) => x.includes("whitespace-nowrap"))).toEqual([]);
  });
  it("each cost bar's figure has a column of one width on a phone, so a plan's long figure never rewraps the lines beside it", () => {
    const out = html(createElement(PairResult, { view: sp, bundle, plan: base, pick: head, chosen: false, onPick: () => undefined }));
    expect(out).not.toContain("grid-cols-[minmax(0,1fr)_auto]");
    expect(out).toContain("grid-cols-[minmax(0,1fr)_7rem]");
  });
});

describe("a typed entry's line", () => {
  it("with nothing typed, the line says what is not known, with no entered tag before its own negation", () => {
    const out = shown(html(createElement(Terms, { terms: { shown: [], empty: [invest.customEntries.fields.fx] }, editing: { kind: "fund", id: "x" } })));
    expect(out).toContain(invest.customEntries.unknownLine(invest.customEntries.fields.fx));
    expect(out.replace(invest.customEntries.unknownLine(invest.customEntries.fields.fx), "")).not.toContain("הזנתם");
  });
});

describe("the account card's notes on prices abroad and its own-bank list (D64, D65, D66)", () => {
  const sp = indexById(bundle, "index-sp500")!;
  const ta = indexById(bundle, "index-ta125")!;
  const card = (index: typeof sp, own: string | null) => {
    const view = buildInvest({ bundle, index, plan: { ...plan, currentAccounts: { own } } });
    return shown(html(createElement(AccountColumn, { view, bundle, years: 20, pick: pickOfHeadline(view)!, onPick: () => undefined, ownBank: { value: own, onChange: () => undefined } })));
  };

  it("names the houses whose price lists limit the spread, from their records, on an index with funds bought abroad", () => {
    const out = card(sp, null);
    expect(out).toContain(invest.pair.abroadSpread(["אי.בי.אי", "אלטשולר טרייד", "מיטב טרייד"]));
    // F-103 (D67): One Zero prints a charge per dividend abroad, which its figures count; the note says so
    expect(out).toContain(invest.pair.abroadOthers);
    // why One Zero's charge is counted while other written ceilings are not, and on which funds
    const [before, between, after] = invest.pair.abroadPerDividend.replace("{name}", "וואן זירו").split("{amount}");
    expect(out).toContain(before);
    expect(out).toContain(between);
    expect(out).toContain(after);
    expect(out).toContain(fmt.usd(50));
  });

  it("names the current account in the legend only where a bar shown counts one", () => {
    // the list of the S&P 500 has banks, whose rows count it; the pair result of two investment houses has none (pair.tsx `CostLegend`)
    expect(card(sp, null)).toContain(invest.pair.legendAccount);
    const view = buildInvest({ bundle, index: sp, plan: { ...plan, currentAccounts: { own: null } } });
    const result = (pick: { house: string; fund: string }) => shown(html(createElement(PairResult, { view, bundle, plan: { ...plan, currentAccounts: { own: null } }, pick, chosen: true, onPick: () => undefined })));
    const fund = pickOfHeadline(view)!.fund;
    const houses = view.providers.filter((p) => !p.custom && !bundle.snapshots.find((s) => s.id === p.id)?.current_account).map((p) => p.id);
    const atHouse = houses.find((h) => view.options.some((o) => o.funds.some((f) => f.rec.id === fund && "valueN" in (f.byHouse[h] ?? {}))));
    expect(atHouse).toBeDefined();
    // the page's pair sits beside the cheapest, which may be a bank; the legend names the current account only when one of the two bars has it
    const out = result({ house: atHouse!, fund });
    const bankShown = [atHouse!, view.headline?.providerId].some((h) => !!bundle.snapshots.find((s) => s.id === h)?.current_account);
    // on the default plan the page opens on a house's pair beside a house's (the legend promised a current account there)
    expect(bankShown).toBe(false);
    expect(out.includes(invest.pair.legendAccount)).toBe(bankShown);
    expect(out).toContain(invest.pair.legendSecurities);
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
    const raw = html(createElement(AccountColumn, { view: buildInvest({ bundle, index: sp, plan }), bundle, years: 20, pick: pickOfHeadline(buildInvest({ bundle, index: sp, plan }))!, onPick: () => undefined, ownBank: { value: null, onChange: () => undefined } }));
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
