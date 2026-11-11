// The receipt and the chosen pair's card in the side rail, rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { flags, groupPrices, invest } from "../../copy";
import { pickableGroups, withGroupPick } from "../../lib/group-pick";
import { PairLists } from "./lists";
import { buildInvest, indexById, kindOf, pairCostsKept } from "../../lib/invest";
import { receiptAmounts } from "../../lib/receipt";
import { ANCHOR, PairReceipt, PairStub } from "./receipt";
import { ChosenPair } from "./chosen";
import { allFunds, pickOfHeadline, pairVerdict } from "./pair";
import { stretchesOf } from "../../lib/stretch";
import { bundle, plan, shown, html, nisIn, fundRow, t } from "./render-fixtures";

const w = invest;
/** The figures the receipt writes, in its order, by their labels: the whole shekels a reader adds up. */
function lines(out: string): Record<string, number> {
  const got: Record<string, number> = {};
  const text = shown(out).replace(/[⁦-⁩‎‏]/g, "").replace(/ /g, " ");
  for (const label of [w.pair.paidIn, w.receipt.added, w.receipt.left, w.receipt.gain, w.receipt.lost]) {
    const at = text.indexOf(label);
    if (at >= 0) got[label] = nisIn(text.slice(at + label.length, at + label.length + 40));
  }
  return got;
}

describe("the receipt", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  it("its lines add up as a reader adds them, and the account's lines to the account's figure", () => {
    const out = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }));
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house })!;
    const r = receiptAmounts(pc);
    const l = lines(out);
    expect(l[w.pair.paidIn]).toBe(r.paidIn);
    expect(l[w.receipt.added]).toBe(r.added);
    expect(l[w.receipt.left]).toBe(r.left);
    expect(l[w.receipt.gain]).toBe(r.gain);
    expect(l[w.receipt.lost]).toBe(r.lost);
    expect(r.paidIn + r.added - r.tax - r.account - r.fund).toBe(r.left);
    // the closing bar is a chart the chart check finds, its parts from the start
    expect(out).toContain('data-chart="share-bar"');
    // the account's lines carry their rate as the price list prints it
    expect(shown(out)).toContain(w.rate.per.trade);
  });
  it("carries no verdict of its own: the headline above the lists says it, for the page's pair and for a pick that is not the cheapest", () => {
    const own = shown(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false })));
    for (const said of [w.pair.cheapestStar, w.pair.openTop, w.pair.yours]) expect(own).not.toContain(said);
    const leumi = { house: "leumi", fund: pick.fund };
    const v = pairVerdict(view, bundle, plan, leumi, true);
    expect(v.onBest || v.tied).toBe(false);
    const out = html(createElement(PairReceipt, { view, bundle, plan, pick: leumi, chosen: true }));
    expect(shown(out)).not.toContain(w.pair.moreIfCheapest);
    expect(out).not.toContain("border-primary");
  });
  it("the fund's fees are rows under its line, each by its whole name, as the account's are", () => {
    const raw = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }));
    const out = shown(raw);
    const names = w.receipt.fundFees;
    const at = [names.fixed, names.variable, names.trustee].map((n) => out.indexOf(n));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(raw).toContain("border-chart-by-fund");
  });
  it("the closing bar's key names every part with its share, and the shares add up to 100", () => {
    const raw = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }));
    const key = raw.slice(raw.indexOf('data-chart="share-bar"'));
    const shares = [...key.matchAll(/(\d+)%<\/bdi>/g)].map((m) => Number(m[1]));
    expect(shares).toHaveLength(3);
    expect(shares.reduce((a, n) => a + n, 0)).toBe(100);
    for (const n of [w.receipt.parts.account, w.receipt.parts.fund]) expect(key).toContain(n);
  });
  it("an Israeli index's caption says nothing of the dollar", () => {
    const ta = buildInvest({ bundle, index: indexById(bundle, "index-ta125")!, plan });
    const p = pickOfHeadline(ta)!;
    const out = html(createElement(PairReceipt, { view: ta, bundle, plan, pick: p, chosen: false }));
    // the caption's longest cases are laid out unseen; the shown one has no clause on a currency
    const said = shown(out);
    expect(said).toContain(w.receipt.caption(plan.years, null));
    expect(said).not.toContain(w.pair.steadyDollar);
  });
});

describe("the chosen pair's card", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  it("says when the account's price list was collected and what it leaves out, and the fund's number, kind, labels and gap", () => {
    const out = shown(html(createElement(ChosenPair, { view, bundle, plan, pick, chosen: false })));
    expect(out).toContain(w.shownPair(false).cardTitle);
    expect(out).not.toContain(w.shownPair(true).name);
    expect(out).toContain(w.chosen.collected);
    expect(out).toContain(w.chosen.aside);
    expect(out).toContain(w.chosen.groups.follow!);
    expect(out).toContain(w.kinds.gapHead.net);
    expect(out).toContain(w.chosen.number);
    expect(out).toContain(w.chosen.kind);
    expect(out).toContain(w.chosen.together.after);
  });
});

describe("a customer group picked in the account tile (D43, F-101)", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view = buildInvest({ bundle, index, plan });
  // the first house and fund the page offers a group for
  const found = allFunds(view).flatMap((f) => view.providers.flatMap((p) => { const at = f.byHouse[p.id]; const keys = at && "valueN" in at ? [...pickableGroups(bundle.snapshots.find((s) => s.id === p.id), f.option)] : []; return keys.map((key) => ({ house: p.id, short: p.short, fund: f.rec.id, key })); }))[0];
  it("the data has a group to pick", () => expect(found).toBeTruthy());
  if (!found) return;
  const g = withGroupPick({ bundle, index, plan }, view, found.house, found.key, found.short)!;
  const pick = { house: g.id, fund: found.fund };
  const group = { house: found.house, key: found.key, name: g.name };
  it("the tile describes the house, with its own links, and says how long the group's price holds", () => {
    const out = html(createElement(ChosenPair, { view: g.view, bundle: g.bundle, plan, pick, chosen: true, group, onPick: () => undefined }));
    expect(shown(out)).toContain(groupPrices.pickedLine(g.name));
    expect(shown(out)).toContain(found.short);
    // never the held account's id, in a word or a link
    expect(out).not.toContain("custom-broker-group");
  });
  it("the house's row keeps its own name and place (D43), and the funds' differences are from the group's pair", () => {
    const out = html(createElement(PairLists, { view: g.view, bundle: g.bundle, plan, livePlan: plan, today: t, pick, chosen: true, onPick: () => undefined, moved: null, group }));
    const row = fundRow(out, found.house).replace(/[\u2066-\u2069\u200e\u200f]/g, "");
    expect(row).not.toContain(groupPrices.pickLabel(g.name));
    expect(row).toContain(found.short);
    expect(row).toContain(w.shownPair(true).row);
    // another fund's difference: its value at the group's prices less the pair's
    const valueAt = (f: ReturnType<typeof allFunds>[number]) => (f.byHouse[g.id] as { valueN: number }).valueN;
    const all = allFunds(g.view);
    const mine = valueAt(all.find((f) => f.rec.id === found.fund)!);
    const other = all.find((f) => f.rec.id !== found.fund && "valueN" in (f.byHouse[g.id] ?? {}) && !fundRow(out, f.rec.id).includes(w.kinds.between))!;
    const oRow = fundRow(out, other.rec.id).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
    const d = Math.round(valueAt(other) - mine);
    expect(oRow).toContain(d === 0 ? w.lists.funds.same : `${Math.abs(d).toLocaleString("en-US")} ₪`);
    if (d !== 0) expect(oRow).toContain(d < 0 ? w.lists.funds.less : w.lists.funds.more);
  });
});

describe("the lists beside the receipt", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  const props = { view, bundle, plan, livePlan: plan, today: t, pick, chosen: false, onPick: () => undefined, moved: null, group: null };
  it("a row is one line: the name and one figure, no fee bar and no fees column, and the figures' mark only in the column's head", () => {
    const out = html(createElement(PairLists, props));
    expect(out).not.toContain('data-chart="cost-stack"');
    const from = out.indexOf('aria-checked="true"');
    expect(from).toBeGreaterThan(0);
    expect(shown(out)).toContain(w.lists.colLeft);
    expect(out).toContain("nums-plain");
    expect(out).toContain("num-sample");
    // no star and no open-question line on any row
    expect(shown(out)).not.toContain("*");
  });
  it("the accounts are sorted by what is left with their cheapest fund, each with its stretch on one scale", () => {
    const out = html(createElement(PairLists, props));
    const funds = allFunds(view);
    const mine = kindOf(funds.find((f) => f.rec.id === pick.fund)!.rec);
    const houses = view.providers.map((p) => p.id);
    // the chosen fund's kind only, ranked pairs only (D104)
    const stretches = stretchesOf(funds.filter((f) => kindOf(f.rec) === mine), houses);
    const order = stretches.map((s) => ({ s, at: out.indexOf(`data-pick-key="${s.house}"`) })).filter((x) => x.at > 0).sort((a, b) => a.at - b.at);
    expect(order.length).toBeGreaterThan(2);
    for (let i = 1; i < order.length; i++) expect(order[i - 1]!.s.best).toBeGreaterThanOrEqual(order[i]!.s.best);
    // an account not chosen says "up to" its best, in whole shekels
    const second = order.find((x) => x.s.house !== pick.house)!;
    const row = fundRow(out, second.s.house).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
    const best = funds.find((f) => f.rec.id === second.s.bestFund)!.byHouse[second.s.house] as { value: unknown; valueN: number };
    expect(row).toContain(w.lists.accounts.upTo);
    expect(row).toContain(`${Math.round(best.valueN).toLocaleString("en-US")} ₪`);
    expect((out.match(/data-stretch-bar=""/g) ?? []).length).toBeGreaterThanOrEqual(order.length);
  });
  it("on a wide screen the ruler stands between the two lists, with no small bars on the funds and a spot for each ranked fund", () => {
    const out = html(createElement(PairLists, { ...props, ruler: true }));
    const at = (name: string) => out.indexOf(`data-anchor="${name}"`);
    expect(at(ANCHOR.accounts)).toBeGreaterThan(0);
    expect(at(ANCHOR.accounts)).toBeLessThan(at(ANCHOR.funds));
    const priced = allFunds(view).filter((f) => { const a = f.byHouse[pick.house]; return !!a && "valueN" in a && !a.open; }).length;
    expect((out.match(/data-spot-dot=""/g) ?? []).length).toBe(priced);
    expect(shown(out)).toContain(w.lists.note(true));
    expect(shown(out)).toContain(w.lists.accounts.barRuler);
  });
  it("a fund on an open rule is shown, not ranked: after the ranked funds of its kind, under one heading, with no spot and no tag on its row (G-18)", () => {
    const at = (f: ReturnType<typeof allFunds>[number]) => f.byHouse[pick.house];
    const open = allFunds(view).filter((f) => { const a = at(f); return !!a && "valueN" in a && a.open; });
    expect(open.length).toBeGreaterThan(0);
    const out = html(createElement(PairLists, { ...props, ruler: true }));
    for (const f of open) {
      const row = fundRow(out, f.rec.id);
      expect(row, f.rec.id).not.toContain(w.lists.openRow);
      expect(out.slice(out.indexOf(`data-pick-key="${f.rec.id}"`), out.indexOf(`data-pick-key="${f.rec.id}"`) + 400)).not.toContain("data-spot-dot");
      // after every ranked fund of its kind
      for (const r of allFunds(view).filter((x) => { const a = at(x); return kindOf(x.rec) === kindOf(f.rec) && !!a && "valueN" in a && !a.open; }))
        expect(out.indexOf(`data-pick-key="${r.rec.id}"`), `${r.rec.id} before ${f.rec.id}`).toBeLessThan(out.indexOf(`data-pick-key="${f.rec.id}"`));
    }
    expect(shown(out)).toContain(w.lists.funds.unranked);
    // chosen, the note under the lists says so, and the ruler keeps the account's band
    const chosenOpen = html(createElement(PairLists, { ...props, pick: { house: pick.house, fund: open[0]!.rec.id }, chosen: true }));
    expect(shown(chosenOpen)).toContain(w.lists.openRow);
  });
  it("on an index with both kinds, the stretch counts the chosen fund's kind only: a hedged fund sets no account's stretch (D28)", () => {
    const funds = allFunds(view);
    const mine = kindOf(funds.find((f) => f.rec.id === pick.fund)!.rec);
    const ranked = (f: (typeof funds)[number]) => { const a = f.byHouse[pick.house]; return a && "valueN" in a && !a.open ? a.valueN : null; };
    const kindValues = funds.filter((f) => kindOf(f.rec) === mine).map(ranked).filter((v): v is number => v !== null);
    const otherValues = funds.filter((f) => kindOf(f.rec) !== mine).map(ranked).filter((v): v is number => v !== null);
    expect(otherValues.length).toBeGreaterThan(0);
    // the other kind would lengthen the stretch: the data holds the case the rule is for
    expect(Math.min(...otherValues)).toBeLessThan(Math.min(...kindValues));
    const out = shown(html(createElement(PairLists, props))).replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\u00a0/g, " ");
    const span = Math.round(Math.max(...kindValues) - Math.min(...kindValues));
    const short = view.providers.find((p) => p.id === pick.house)!.short;
    expect(out).toContain(`${w.lists.funds.inHouse(short)}: עד ${span.toLocaleString("en-US")} ₪`);
    const withOther = Math.round(Math.max(...kindValues, ...otherValues) - Math.min(...kindValues, ...otherValues));
    expect(out).not.toContain(`${w.lists.funds.inHouse(short)}: עד ${withOther.toLocaleString("en-US")} ₪`);
  });
  it("an account whose every priced fund is on an open rule has no stretch: after the ranked accounts, before the ones with no price, with G-18's words (MSCI World)", () => {
    const v = buildInvest({ bundle, index: indexById(bundle, "index-msci-world")!, plan });
    const pk = pickOfHeadline(v)!;
    const out = html(createElement(PairLists, { ...props, view: v, pick: pk }));
    const mine = kindOf(allFunds(v).find((f) => f.rec.id === pk.fund)!.rec);
    const kindF = allFunds(v).filter((f) => kindOf(f.rec) === mine);
    const allOpen = v.providers.filter((p) => { const a = kindF.map((f) => f.byHouse[p.id]).filter((x) => !!x && "valueN" in x) as { open: boolean }[]; return a.length > 0 && a.every((x) => x.open); });
    expect(allOpen.map((p) => p.id).sort()).toEqual(["interactive-brokers", "interactive-israel"]);
    const ranked = stretchesOf(kindF, v.providers.map((p) => p.id)).map((s) => s.house);
    const none = v.providers.filter((p) => !allFunds(v).some((f) => "valueN" in (f.byHouse[p.id] ?? {}))).map((p) => p.id);
    const pos = (id: string) => out.indexOf(`data-pick-key="${id}"`);
    for (const p of allOpen) {
      expect(fundRow(out, p.id)).toContain(w.lists.accounts.unranked);
      // its "?" (G-18's words, which a tap opens)
      expect(out.slice(pos(p.id), pos(p.id) + 1500)).toContain("help-mark");
      expect(flags["G-18"]).toContain("לא מדרג");
      for (const r of ranked) expect(pos(r), `${r} before ${p.id}`).toBeLessThan(pos(p.id));
      for (const n of none) expect(pos(n), `${n} after ${p.id}`).toBeGreaterThan(pos(p.id));
    }
  });
  it("on a wide screen the receipt is a ticket: the account, the middle with what is left large, the fund, and the footer", () => {
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house })!;
    const out = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false, layout: "ticket" }));
    expect(out).toContain("text-total");
    expect(shown(out)).toContain(w.receipt.accountCharges);
    expect(shown(out)).toContain(w.receipt.fundCharges);
    expect(shown(out)).toContain(receiptAmounts(pc).left.toLocaleString("en-US"));
    expect(lines(out)).toEqual(lines(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }))));
  });
  it("the stub shows what the receipt shows is left, on the same plan and pick, and stays inert until the receipt is out of sight", () => {
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house })!;
    const target = { current: null };
    const out = html(createElement(PairStub, { view, bundle, plan, pick, fundName: "x", target, area: target }));
    expect(shown(out)).toContain(receiptAmounts(pc).left.toLocaleString("en-US"));
    expect(shown(out)).toContain(w.receipt.left);
    expect(shown(out)).toContain(w.receipt.toReceipt);
    expect(out).toContain('data-receipt-stub="hidden"');
    expect(out).toMatch(/inert=""/);
  });
});
