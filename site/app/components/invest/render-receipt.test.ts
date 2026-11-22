// The receipt, with its account and fund parts, rendered on the collected data (part of render.test.ts, which says why it is split).
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { flags, groupPrices, help, invest } from "../../copy";
import { pickableGroups, withGroupPick } from "../../lib/group-pick";
import { PairLists } from "./lists";
import { buildInvest, indexById, kindOf, pairCostsKept } from "../../lib/invest";
import { receiptAmounts, receiptChain } from "../../lib/receipt";
import { ANCHOR, PairReceipt, PairStub, addedOf, inflationOf, leftOf, nominalOf, taxOf } from "./receipt";
import { allFunds, labelsOf, pickOfHeadline, pairVerdict } from "./pair";
import { stretchesOf } from "../../lib/stretch";
import { bundle, plan, shown, html, nisIn, fundRow, t } from "./render-fixtures";
import { entered, type SiteValue } from "../../lib/value";
import { planOf } from "../../lib/receipt-fixtures";

const w = invest;
/** The figures the receipt writes, in its order, by their labels: the whole shekels a reader adds up. */
function lines(out: string): Record<string, number> {
  const got: Record<string, number> = {};
  const text = shown(out).replace(/[⁦-⁩‎‏]/g, "").replace(/ /g, " ");
  for (const label of [w.pair.paidIn, w.receipt.added, w.receipt.inflation, w.pair.taxLine, w.receipt.left]) {
    const at = text.indexOf(label);
    if (at >= 0) got[label] = nisIn(text.slice(at + label.length, at + label.length + 40));
  }
  return got;
}

describe("the receipt", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  it("its lines add up as a reader adds them, top to bottom to one total: the horizon's shekels down to the value before tax, the inflation, the tax in today's money", () => {
    const out = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }));
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house })!;
    const ch = receiptChain(pc);
    const r = ch.nominal;
    const l = lines(out);
    expect(l[w.pair.paidIn]).toBe(r.paidIn);
    expect(l[w.receipt.added]).toBe(r.added);
    expect(l[w.receipt.inflation]).toBe(-ch.inflation);
    expect(l[w.pair.taxLine]).toBe(-ch.tax);
    expect(l[w.receipt.left]).toBe(receiptAmounts(pc).left);
    expect(r.paidIn + r.added - r.account - r.fund - r.waiting - ch.inflation - ch.tax).toBe(ch.left);
    // the order: the account and the fund before the inflation, the tax after it, the total last
    const text = shown(out);
    const order = [w.pair.paidIn, w.receipt.added, w.pair.who.account, w.pair.who.fund, w.receipt.inflation, w.pair.taxLine, w.receipt.left].map((x) => text.indexOf(x));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // nothing under the total: it is the receipt's last figure
    const after = text.slice(text.lastIndexOf(w.receipt.left) + w.receipt.left.length).replace(/[\u2066-\u2069]/g, "");
    expect([...after.matchAll(/[\d,]+ ₪/g)]).toHaveLength(1);
    expect(out).not.toContain('data-chart="share-bar"');
    // on paper the account's own lines are behind a tap on its name; the ticket shows them with their rate as the price list prints it
    expect(text).not.toContain(w.rate.per.trade);
    expect(shown(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false, layout: "ticket" })))).toContain(w.rate.per.trade);
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
  it("on the ticket the fund's fees are rows under its line, each by its whole name, as the account's are", () => {
    const raw = html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false, layout: "ticket" }));
    const out = shown(raw);
    const names = w.receipt.fundFees;
    const at = [names.fixed, names.variable, names.trustee].map((n) => out.indexOf(n));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(raw).toContain("border-chart-by-fund");
  });
  it("the total's \"?\" says it is in today's money, and is a caution \"?\" with the dollar's clause only where the figure rests on the dollar", () => {
    const cautionMark = /class="[^"]*help-mark[^"]*text-caution/;
    expect(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false }))).toMatch(cautionMark);
    const ta = buildInvest({ bundle, index: indexById(bundle, "index-ta125")!, plan });
    const p = pickOfHeadline(ta)!;
    const out = html(createElement(PairReceipt, { view: ta, bundle, plan, pick: p, chosen: false }));
    expect(out).not.toMatch(cautionMark);
    expect(out).toContain(`aria-label="${help.markLabel.replace("{about}", w.receipt.left)}"`);
    expect(w.receipt.leftIn(null)).not.toContain(w.pair.steadyDollar);
    expect(w.receipt.leftIn(w.pair.steadyDollar)).toContain(w.pair.steadyDollar);
  });
  it("the run's index at the horizon and its deposits as paid are F-03's and F-05's, which take the chain to the horizon's shekels", () => {
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house });
    if (!pc) throw new Error("the page's own pair is priced");
    // 2% a year over 20 years: I_T = 1.02^20 (F-02, F-03), and each monthly deposit rises with the index of its month (F-05, A-04)
    const months = 12 * plan.years;
    expect(pc.index.value as number).toBeCloseTo(1.02 ** plan.years, 9);
    let paid = plan.amountNow;
    for (let m = 1; m <= months; m++) paid += plan.monthly * 1.02 ** (m / 12);
    expect(pc.paidInNominal.value as number).toBeCloseTo(paid, 4);
    // a line in the horizon's shekels is its figure in today's money times I_T, and its sheet lists both
    const tax = nominalOf(pc, pc.tax, "x", t);
    expect(tax.value as number).toBeCloseTo((pc.tax.value as number) * 1.02 ** plan.years, 6);
    expect(Object.keys(tax.computed_from?.inputs ?? {})).toEqual([w.receipt.nominal.today, w.pair.indexInput]);
  });
  it("the total's sheet adds the deposits in today's money (F-106) and the gain, and the tax is in today's money with its sheet saying it holds the surtax", () => {
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house });
    if (!pc) throw new Error("the page's own pair is priced");
    const left = leftOf(pc, t);
    const inputs = left.computed_from?.inputs as Record<string, SiteValue>;
    expect(Object.keys(inputs)).toEqual([w.receipt.paidInToday, w.receipt.gain]);
    expect(inputs[w.receipt.paidInToday]?.computed_from?.formula).toBe("F-106");
    // 6,000 now and 400 a month for 20 years, in today's money: the deposits as entered (F-106)
    expect(inputs[w.receipt.paidInToday]?.value).toBe(6_000 + 400 * 12 * 20);
    expect(left.value).toBe(Math.round(pc.left.value as number));
    expect(taxOf(pc).about).toContain("מס נוסף");
    expect(taxOf(pc).value).toBe(pc.tax.value);
    // the tax line's sheet says it is in today's money, on a fund that pays out too
    for (const distributes of [false, true]) {
      const about = taxOf({ ...pc, distributes }).about;
      expect(about, `distributes: ${distributes}`).toContain("בכסף של היום");
      expect(about).toBe(distributes ? w.receipt.taxSheet.payouts : w.receipt.taxSheet.sale);
    }
  });
  it("the inflation's sheet is the line's own, what the account and the fund leave in both moneys as written, on every plan; the future-shekel one is the sum of the lines above it (F-129)", () => {
    for (const years of [1, 3, 7, 10, 20, 33]) for (const monthly of [0, 250, 1_234]) {
      const p = planOf(t, { years, monthly, returnPct: 7 });
      const v = buildInvest({ bundle, index: view.index, plan: p });
      const pc = pairCostsKept({ bundle, index: v.index, plan: p, fundId: pick.fund, providerId: pick.house });
      if (!pc) continue;
      const ch = receiptChain(pc);
      const infl = inflationOf(pc, ch, w.pair.taxLine, t);
      const inputs = infl.computed_from?.inputs as Record<string, SiteValue>;
      expect(infl.value, `${years} years, ${monthly} a month`).toBe(ch.inflation);
      const nominal = inputs[w.receipt.beforeTax.nominal];
      expect(nominal?.value).toBe(ch.beforeTax);
      expect(nominal?.computed_from?.formula).toBe("F-129");
      expect(nominal?.lead).toBe(w.receipt.beforeTax.lead);
      // its sheet lists the lines above it as written: the deposits and the index's addition less the costs
      const [paid = 0, added = 0, ...costs] = Object.values(nominal?.computed_from?.inputs ?? {}).map((x) => (x as SiteValue).value as number);
      expect(paid + added - costs.reduce((a, x) => a + x, 0)).toBe(ch.beforeTax);
      expect(inputs[w.receipt.beforeTax.today]?.value).toBe(ch.beforeTaxToday);
      expect(leftOf(pc, t).value).toBe(ch.left);
    }
  });
  it("its words about prices hold when they fall: a negative inflation gives back on its line, and no sheet says prices rise", () => {
    for (const words of [w.receipt.inflationLead, w.pair.indexAbout, w.pair.indexInput, w.receipt.addedLead]) expect(words).not.toMatch(/פחות|יעלו|עולים|עליית/);
    const p = { ...plan, inflation: -0.01, values: { ...plan.values, inflation: entered(-1, "pct_per_year", t) } };
    const v = buildInvest({ bundle, index: view.index, plan: p });
    const pc = pairCostsKept({ bundle, index: v.index, plan: p, fundId: pick.fund, providerId: pick.house });
    if (!pc) throw new Error("the page's own pair is priced");
    const r = receiptChain(pc);
    expect(r.inflation).toBeLessThan(0);
    const text = shown(html(createElement(PairReceipt, { view: v, bundle, plan: p, pick, chosen: false }))).replace(/[\u2066-\u2069]/g, "");
    expect(text).toContain(`${w.receipt.inflation}+${Math.abs(r.inflation).toLocaleString("en-US")}`);
  });
  it("what the index added keeps its label as its title and says in its sheet it is in the horizon's shekels (F-91)", () => {
    const pc = pairCostsKept({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house });
    if (!pc) throw new Error("the page's own pair is priced");
    const added = addedOf(pc, t);
    expect(added.about).toBe(w.receipt.added);
    expect(added.lead).toBe(w.receipt.addedLead);
    expect(added.value).toBe(Math.round(pc.base * (pc.index.value as number)) - Math.round(pc.paidInNominal.value as number));
  });
  it("its inflation line is the value before tax in the horizon's shekels less the same in today's money, with no rate under it, and follows an entered one", () => {
    const at = (pct: number) => {
      const p = { ...plan, inflation: pct / 100, values: { ...plan.values, inflation: entered(pct, "pct_per_year", t) } };
      const v = buildInvest({ bundle, index: view.index, plan: p });
      const pc = pairCostsKept({ bundle, index: v.index, plan: p, fundId: pick.fund, providerId: pick.house });
      if (!pc) throw new Error("the page's own pair is priced");
      const text = shown(html(createElement(PairReceipt, { view: v, bundle, plan: p, pick, chosen: false }))).replace(/[\u2066-\u2069]/g, "");
      const ch = receiptChain(pc);
      return { text, pc, ch, inflation: inflationOf(pc, ch, w.pair.taxLine, t) };
    };
    const two = at(2), three = at(3.5);
    // the slider shows the rate; the receipt does not repeat it
    expect(two.text).not.toContain("2% בשנה");
    expect(three.text).not.toContain("3.5% בשנה");
    expect(two.inflation.computed_from?.formula).toBe("F-130");
    expect(two.inflation.value).toBe(two.ch.beforeTax - two.ch.beforeTaxToday);
    // on the collected data, within a few shekels of what the account and the fund leave, in today's money, times (I_T − 1)
    expect(Math.abs((two.inflation.value as number) - ((two.pc.left.value as number) + (two.pc.tax.value as number)) * ((two.pc.index.value as number) - 1))).toBeLessThan(3);
    // a higher inflation takes more on the way to today's money
    expect(three.inflation.value as number).toBeGreaterThan(two.inflation.value as number);
  });
});

describe("the receipt's account and fund parts", () => {
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const pick = pickOfHeadline(view)!;
  it("say when the account's price list was collected, and the fund's number, kind, labels and gap", () => {
    const out = shown(html(createElement(PairReceipt, { view, bundle, plan, pick, chosen: false, layout: "ticket" })));
    expect(out).not.toContain(w.shownPair(true).name);
    expect(out).toContain(w.chosen.collected);
    const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
    if (!fund) throw new Error("the page's own pair has its fund");
    const follow = labelsOf(view, fund, bundle).filter((l) => l.family === "follow");
    expect(follow.length).toBeGreaterThan(0);
    for (const l of follow) expect(out).toContain(l.text);
    expect(out).toContain(w.typeTags[fund.option] ?? "a kind's tag");
    expect(out).toContain(w.kinds.gapHead.net);
    expect(out).toContain(w.chosen.number);
  });
});

describe("in whole units, the fees charged and the waiting cash apart (F-91, F-109)", () => {
  // the S&P 500 page's plan at a fall and at a rise; Interactive Brokers with the Irish fund buys whole units while its record is silent
  const pick = { house: "interactive-brokers", fund: "ie00b5bmr087" };
  for (const returnPct of [-5, 7]) {
    it(`at ${returnPct}%: the receipt writes the account's fees with a minus, and the waiting cash on its own line`, () => {
      const p = planOf(t, { years: 10, monthly: 500, returnPct });
      const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan: p });
      const pc = pairCostsKept({ bundle, index: view.index, plan: p, fundId: pick.fund, providerId: pick.house });
      // in whole units while the house's record says nothing of selling that listing by amount (F-109); a record that does moves the case
      expect(pc?.units, "the pair is no longer bought in whole units: pick another").toBeTruthy();
      // the receipt writes its costs in the shekels of the horizon; the card, in today's money
      if (!pc) return;
      const ch = receiptChain(pc);
      const r = ch.nominal;
      const bare = (x: string) => x.replace(/[⁦-⁩‎‏]/g, "").replace(/ /g, " ");
      for (const layout of ["paper", "ticket"] as const) {
        const out = bare(shown(html(createElement(PairReceipt, { view, bundle, plan: p, pick, chosen: true, layout }))));
        // the account's fees are taken: a minus, never the plus the waiting cash's gain made of them
        expect(r.account).toBeGreaterThan(0);
        expect(out).toContain(`−${r.account.toLocaleString("en-US")} ₪`);
        // the waiting cash: its own words and its own sign, a plus where the fund fell, a minus where it rose
        const at = out.indexOf(w.pair.waiting);
        expect(at).toBeGreaterThan(0);
        const sign = returnPct < 0 ? "+" : "−";
        expect(out.slice(at, at + 60)).toContain(`${sign}${Math.abs(r.waiting).toLocaleString("en-US")} ₪`);
        // why it waited: on the account's own lines, the ticket's side part, and on paper behind a tap on the account's name
        if (layout === "ticket") expect(out).toContain(returnPct < 0 ? w.pair.waitingWhy.fell : w.pair.waitingWhy.rose);
        // the waiting cash is among the lines that add up to the total
        expect(r.paidIn + r.added - r.account - r.fund - r.waiting - ch.inflation - ch.tax).toBe(ch.left);
        expect(lines(out)[w.receipt.left]).toBe(ch.left);
      }
    });
  }
});

describe("a customer group picked (D43, F-101)", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view = buildInvest({ bundle, index, plan });
  // the first house and fund the page offers a group for
  const found = allFunds(view).flatMap((f) => view.providers.flatMap((p) => { const at = f.byHouse[p.id]; const keys = at && "valueN" in at ? [...pickableGroups(bundle.snapshots.find((s) => s.id === p.id), f.option)] : []; return keys.map((key) => ({ house: p.id, short: p.short, fund: f.rec.id, key })); }))[0];
  it("the data has a group to pick", () => expect(found).toBeTruthy());
  if (!found) return;
  const g = withGroupPick({ bundle, index, plan }, view, found.house, found.key, found.short)!;
  const pick = { house: g.id, fund: found.fund };
  const group = { house: found.house, key: found.key, name: g.name };
  it("the receipt's account part keeps its house's price list and when it was collected", () => {
    const out = html(createElement(PairReceipt, { view: g.view, bundle: g.bundle, plan, pick, chosen: true, layout: "ticket" }));
    const tariff = bundle.snapshots.find((s) => s.id === found.house)?.tariff;
    expect(shown(out)).toContain(w.chosen.collected);
    expect(out).toContain((tariff?.url ?? "the house's price list").replace(/&/g, "&amp;"));
    expect(shown(out)).toContain(found.short);
    // never the held account's id, in a word or a link
    expect(out).not.toContain("house-account-group");
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
    // what the ruler measures is its title
    expect(shown(out)).toContain(w.lists.rulerTitle);
  });
  it("a fund on an open rule is shown, not ranked: after the ranked funds of its kind, under one heading, with no spot and no tag on its row (G-18)", () => {
    // an account that prices a fund on an open rule (an accumulating Irish fund bought abroad): the headline's house sells none abroad
    const isOpen = (f: ReturnType<typeof allFunds>[number], house: string) => { const a = f.byHouse[house]; return !!a && "valueN" in a && a.open; };
    const house = view.providers.find((p) => allFunds(view).some((f) => isOpen(f, p.id)))!.id;
    const ranked = allFunds(view).find((f) => { const a = f.byHouse[house]; return !!a && "valueN" in a && !a.open; })!;
    const pick = { house, fund: ranked.rec.id };
    const at = (f: ReturnType<typeof allFunds>[number]) => f.byHouse[pick.house];
    const open = allFunds(view).filter((f) => isOpen(f, house));
    expect(open.length).toBeGreaterThan(0);
    const out = html(createElement(PairLists, { ...props, pick, ruler: true }));
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
    // below 1280 px each fund row carries the chosen account's stretch with the fund's spot: the kind's last fund sits at the band's foot
    const out = html(createElement(PairLists, props));
    const worst = funds.find((f) => kindOf(f.rec) === mine && ranked(f) === Math.min(...kindValues));
    const raw = out.slice(out.indexOf(`data-pick-key="${worst?.rec.id}"`));
    const [, top, height] = /top:min\(([\d.]+)%[^;]*;height:([\d.]+)%/.exec(raw) ?? [];
    const [, spot] = /top:([\d.]+)%;height:calc/.exec(raw) ?? [];
    expect(Number(spot)).toBeCloseTo(Number(top) + Number(height), 2);
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
  it("on a wide screen the receipt is a ticket: the account with its own lines, the middle with what is left large, the fund with its own lines", () => {
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
