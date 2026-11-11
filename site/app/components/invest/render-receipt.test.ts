// The receipt and the chosen pair's card in the side rail, rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { groupPrices, invest } from "../../copy";
import { pickableGroups, withGroupPick } from "../../lib/group-pick";
import { PairLists } from "./lists";
import { buildInvest, indexById, pairCostsKept } from "../../lib/invest";
import { receiptAmounts } from "../../lib/receipt";
import { PairReceipt } from "./receipt";
import { ChosenPair } from "./chosen";
import { allFunds, pickOfHeadline, pairVerdict } from "./pair";
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
  it("the page's own pair, the cheapest, carries today's crown in a filled badge and is never called the person's", () => {
    const out = shown(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false })));
    const v = pairVerdict(view, bundle, plan, pick, false);
    expect(out).toContain(v.tie ? w.pair.tieTop(v.n, v.nFunds) : w.pair.cheapestStar);
    expect(out.replace(/<[^>]+>/g, "")).not.toMatch(new RegExp(`^${w.pair.yours}`));
  });
  it("a pick that is not among the cheapest: an outline badge with how much more the cheapest leaves", () => {
    const leumi = { house: "leumi", fund: pick.fund };
    const v = pairVerdict(view, bundle, plan, leumi, true);
    expect(v.onBest || v.tied).toBe(false);
    const out = html(createElement(PairReceipt, { view, bundle, plan, pick: leumi, chosen: true }));
    expect(shown(out)).toContain(w.pair.moreIfCheapest);
    expect(out).toContain("border-primary text-primary");
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
  it("the house's row keeps its price-list figure and place (D43), and the differences are from that figure", () => {
    const out = html(createElement(PairLists, { view: g.view, bundle: g.bundle, plan, livePlan: plan, today: t, pick, chosen: true, onPick: () => undefined, moved: null, group }));
    const row = fundRow(out, found.house).replace(/[\u2066-\u2069\u200e\u200f]/g, "");
    expect(row).not.toContain(groupPrices.pickLabel(g.name));
    const fundOf = (v: typeof view) => allFunds(v).find((f) => f.rec.id === found.fund)!;
    const house = fundOf(g.view).byHouse[found.house] as { valueN: number };
    expect(row).toContain(`${Math.round(house.valueN).toLocaleString("en-US")} ₪`);
    // another house's difference: its figure less the house's own
    const other = view.providers.find((p) => p.id !== found.house && "valueN" in (fundOf(view).byHouse[p.id] ?? {}))!;
    const oAt = fundOf(g.view).byHouse[other.id] as { valueN: number };
    const oRow = fundRow(out, other.id).replace(/[\u2066-\u2069\u200e\u200f]/g, "");
    const d = Math.round(oAt.valueN - house.valueN);
    expect(oRow).toContain(`${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d).toLocaleString("en-US")} ₪`);
  });
});
