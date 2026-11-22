// The fee page's views of a deal (method §10.6) on the site's own data: the kinds and their caps, the templates, and the two picture deals
// read on 11.2026: a securities account and a provident fund, at a glance, in the builder, in one fee's panel and in the reading.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { depositFeeNoneByRule, type SiteValue } from "../value";
import { builder } from "./rows";
import { cardOf, toolbox } from "./toolbox";
import { panel } from "./panel";
import { leftOut } from "./left-out";
import { capLine, kindById, standingOf } from "./kinds";
import { dealOfAddress, packDeal, unpackDeal } from "./link";
import { monthKey, NAME_MAX, newDeal, newFee, readDeal, typed, untouched, type FeeDeal, type MonthKey, type Num, type SlimFee, type Stage } from "./model";
import { FEE_KIND_IDS, type FeeKindId } from "./shapes";
import { readDealFor } from "./deal-read";
import { readingOf } from "./reading";
import { ACCOUNT_CAP_RULES, accountCapOf, type ActionView, type HeldPanelView, type HeldView } from "./charts";
import { dataBar, dealFromTemplate, dealFromTrack, dealName, feePriceLists, fillDeal, fillFee, houseTemplate, lineFees, matching, pickTrack, rowTitle, templateOf, templateOptions, withLaterFills, withLaterFillsAll } from "./templates";
import { addFee, updateFee } from "./edits/deal";
import { withFigure } from "./edits/price";
import { editPrice } from "./edits/stage";
import { offerFor } from "./offers/offer";
import { BAN_RULES } from "./offers/rules";
import { latestSnapshots } from "../providers.server";
import { loadTerms } from "../data.server";
import { termKey, trackFees } from "../fee-page-data";
import { throughLink } from "./link-fixtures";

const data = feesData();
const kinds = data.kinds;
const TODAY = "2026-11-12";
/** A deal read once on 11.2026, as the page hands it to its views. */
const read = (deal: FeeDeal) => readDealFor(deal, kinds, TODAY);

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  readFor: [{ by: "what", is: "us" }],
  fees: [
    { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
    { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] },
    { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
    { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.07), per: 12, every: 12 } }] },
  ],
});

const provident = (): FeeDeal => ({
  id: "deal-p",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [
    { id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.6), per: 12, every: 12 }, until: "2028-03" }, { price: { form: "held", rate: typed(1.05), per: 12, every: 12 } }] },
    { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
  ],
});

const v = (x: SiteValue | null | undefined) => x?.value as number;

describe("the page's data", () => {
  it("ships the record of every rule its figures, caps and bans cite, and no other", () => {
    const cited = new Set<string>();
    const walk = (x: unknown): void => {
      if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === "object")
        for (const [k, v] of Object.entries(x)) {
          if ((k === "rule_ids" || k === "ruleIds") && Array.isArray(v)) v.forEach((id) => cited.add(id as string));
          else walk(v);
        }
    };
    walk([data.kinds, data.templates, data.houses, data.fx, data.terms]);
    // a ban's words open its rules and show MF-71's figure; BANK-35's cap flags a current account's year of holding
    for (const id of [...BAN_RULES, ...ACCOUNT_CAP_RULES]) cited.add(id);
    expect(cited.size).toBeGreaterThan(0);
    expect(data.rules.map((r) => r.id)).toEqual(expect.arrayContaining(["MF-71", "BANK-51"]));
    expect(data.rules.map((r) => r.id).sort()).toEqual([...cited].sort());
  });
});

describe("the kinds a deal can be", () => {
  it("lists every product record with fee bases, its caps with whom they bind", () => {
    const ids = kinds.map((k) => k.id);
    expect(ids).toEqual(expect.arrayContaining(["brokerage-account", "kupat-gemel-lehashkaa", "makam", "money-market-fund-daily"]));
    expect(ids).not.toContain("bank-deposit-x");
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    expect(capLine(mm, "custody")).toMatchObject({ state: "value", binds: "banks_and_fund_distributors" });
    expect(capLine(mm, "fund_management")).toEqual({ state: "absent" });
  });
  it("judges the ban on custody of money-market units only where the deal names a bank (F-113)", () => {
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    const p = { form: "held", rate: typed(0.1), per: 12, every: 12 } as const;
    expect(standingOf(mm, "custody", p, undefined)).toEqual({ judged: false, why: "binds" });
    expect(standingOf(mm, "custody", p, "non-bank")).toEqual({ judged: false, why: "binds" });
    expect(standingOf(mm, "custody", p, "bank")).toMatchObject({ judged: true, standing: "above" });
  });
  it("calls a rate of zero with a minimum above a cap of 0, and a price that charges nothing at it (F-113)", () => {
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    expect(capLine(mm, "custody")).toMatchObject({ state: "value", value: { value: 0 } });
    const held = (min?: number) => ({ form: "held", rate: typed(0), per: 12, every: 12, ...(min === undefined ? {} : { min: typed(min) }) }) as const;
    expect(standingOf(mm, "custody", held(5), "bank")).toEqual({ judged: true, standing: "above", share: null });
    expect(standingOf(mm, "custody", held(), "bank")).toEqual({ judged: true, standing: "at", share: null });
    expect(standingOf(mm, "custody", held(0), "bank")).toEqual({ judged: true, standing: "at", share: null });
    expect(standingOf(mm, "custody", { form: "free" }, "bank")).toEqual({ judged: true, standing: "at", share: null });
  });
});

describe("caps that hold only in a case the deal does not state, and converted prices (F-113)", () => {
  it("states the price of moving securities out and money-market purchases with their caveat, and judges neither at any provider", () => {
    const account = kinds.find((k) => k.id === "brokerage-account")!;
    expect(capLine(account, "transfer_out")).toMatchObject({ state: "value", binds: "banks", caveat: "closing_account" });
    const mm = kinds.find((k) => k.id === "money-market-fund-daily")!;
    expect(capLine(mm, "trade")).toMatchObject({ state: "none", caveat: "distribution_agreement" });
    for (const provider of [undefined, "bank", "non-bank"] as const) {
      expect(standingOf(account, "transfer_out", { form: "perAction", amount: typed(25) }, provider)).toEqual({ judged: false, why: "caveat" });
      expect(standingOf(mm, "trade", { form: "action", rate: typed(0.1) }, provider)).toEqual({ judged: false, why: "caveat" });
    }
    const row = readingOf(read({ ...newDeal("brokerage-account"), provider: "bank", fees: [{ id: "fee-out", kind: "transfer_out", stages: [{ price: { form: "perAction", amount: typed(25) } }] }] }), data.fx).law[0]!;
    // no price is judged; each carries the caveat and the cap's rules, and the row's tag says the caveat
    expect(row.prices[0]!.standing).toEqual({ standing: { judged: false, why: "caveat" }, share: null, caveat: { id: "closing_account", rules: expect.arrayContaining(["BRK-18"]) } });
    expect(row.now).toEqual(row.prices[0]?.standing);
  });
  it("calls a monthly rate from half a percent below a yearly cap to a tenth of a percent above it at it, and one further above it", () => {
    const study = kinds.find((k) => k.id === "keren-hishtalmut")!;
    const monthly = (rate: number) => ({ form: "held", rate: typed(rate), per: 1, every: 1 }) as const;
    expect(standingOf(study, "balance", monthly(0.1667), undefined)).toMatchObject({ judged: true, standing: "at" });
    expect(standingOf(study, "balance", monthly(0.1675), undefined)).toMatchObject({ judged: true, standing: "above" });
    expect(standingOf(study, "balance", monthly(0.18), undefined)).toMatchObject({ judged: true, standing: "above" });
    // typed for a year, 2.0004% is compared as typed
    expect(standingOf(study, "balance", { form: "held", rate: typed(2.0004), per: 12, every: 12 }, undefined)).toMatchObject({ judged: true, standing: "above" });
  });
});

describe("templates", () => {
  it("lists a custody line with a rate and no period as left out, and every line the template does not read with why", () => {
    const leumi = data.houses.find((h) => h.id === "leumi")!;
    expect(leumi.left).toContainEqual(expect.objectContaining({ lineId: "leumi-tracking-fund-standing-order", why: "set-aside" }));
    const snap = latestSnapshots().find((s) => s.id === "leumi")!;
    const custody = snap.lines.find((l) => l.base === "custody")!;
    expect(lineFees({ ...custody, period: null }, "")).toEqual({ fees: [], left: ["no-period"] });
    expect(lineFees({ ...custody, period: null, rate: { ...custody.rate, value: 0 } }, "").fees).toHaveLength(1);
    // a fee on a distribution that applies to the holding is a base the template does not fill, and is listed
    const line = { ...custody, id: "x-per-payment", base: "distribution_handling" as const, applies_to: ["all"], period: null, min: null, max: null, rate: { ...custody.rate, unit: "nis_per_trade" as const, value: 0.25 } };
    expect(houseTemplate({ ...snap, lines: [...snap.lines, line] }).left).toContainEqual(expect.objectContaining({ lineId: "x-per-payment", why: "other-base" }));
  });
  it("lists a bank's yearly distribution fee on the units of a mutual or money-market fund as a fee the deal holds no price for", () => {
    const snaps = latestSnapshots();
    const distribution = snaps.flatMap((s) => s.lines.filter((l) => l.base === "distribution_handling" && l.rate.unit === "pct_of_balance_per_period"));
    expect(distribution.length).toBeGreaterThan(0);
    for (const s of snaps) for (const l of s.lines.filter((x) => distribution.includes(x))) expect(houseTemplate(s).left, l.id).toContainEqual(expect.objectContaining({ lineId: l.id, why: "distribution-yearly" }));
  });
  it("reads every house's whole latest price list into fees, each figure sourced, and lists every line it leaves out", () => {
    expect(data.houses.length).toBeGreaterThan(3);
    const snaps = latestSnapshots();
    for (const h of data.houses) {
      const trade = h.fees.find((f) => f.kind === "trade");
      if (!trade) continue;
      for (const priced of trade.cases ?? [trade as { stages: Stage[] }]) {
        const p = priced.stages[0]!.price;
        if (p.form === "action") expect(p.rate.src, h.id).toBeDefined();
      }
      // every line of the house's list either fills a case or is listed with why
      const snap = snaps.find((s) => s.id === h.id);
      if (snap) expect(h.left.every((l) => snap.lines.some((x) => x.id === l.lineId)), h.id).toBe(true);
    }
  });
  it("fills deals that check out, from every house for every pick and from every track (a link and the device keep them)", async () => {
    for (const h of data.houses)
      for (const is of ["tase", "us", "world"]) {
        const d = fillDeal({ ...newDeal("brokerage-account"), readFor: [{ by: "what", is }] }, `house:${h.id}`, data, TODAY)!;
        expect(readDeal(JSON.parse(JSON.stringify(d))), `${h.id} ${is}`).toEqual(d);
        // a whole list's link is short enough for any address: under 8,000 characters, the query GitHub Pages still answers
        const packed = (await packDeal(d))!;
        expect(packed.length, `${h.id} ${is}`).toBeLessThan(8_000);
        const back = (await unpackDeal(packed))!;
        expect(back.fees.map(({ id: _i, ...f }) => f), `${h.id} ${is}`).toEqual(d.fees.map(({ id: _i, ...f }) => f));
        // the reading never throws on a filled deal, whatever it picks
        readingOf(read(d), data.fx);
      }
    for (const t of data.tracks) {
      const d = dealFromTrack(t.id, data, TODAY);
      if (d) expect(readDeal(JSON.parse(JSON.stringify(d))), `track ${t.id}`).toEqual(d);
    }
  });
  it("fills a securities account from a house, keeping each fee's place and naming the house", () => {
    const h = data.houses.find((x) => x.fees.some((f) => f.kind === "fx"))!;
    const filled = fillDeal(account(), `house:${h.id}`, data, TODAY)!;
    // the deal keeps the kinds of `LATER_FILLS` its list filled, so a fee of them taken away is not put back (`withLaterFills`)
    const later = h.fees.some((f) => f.kind === "current_account") ? { laterFills: ["current_account"] } : {};
    expect(filled.template).toEqual({ id: `house:${h.id}`, name: h.name, ...later });
    expect(filled.provider).toBe(h.provider);
    expect(filled.fees[0]!.id).toBe("fee-trade");
    expect(filled.fees.find((f) => f.kind === "fund_management")!.stages![0]!.price).toMatchObject({ rate: { v: 0.07 } });
  });
  it("names a deal by its template's whole name where it fits, and otherwise cuts it between words, never inside one or an open bracket", () => {
    expect(dealName("Interactive Brokers")).toBe("Interactive Brokers");
    const plan = 'Interactive Brokers, IBKR Pro - Fixed: מניות ותעודות סל בארה"ב';
    expect(dealName(plan)).toBe("Interactive Brokers, IBKR Pro - Fixed: מניות ותעודות סל…");
    expect(dealName('מיטב גמל להשקעה אשראי ואג"ח עם מניות (עד 25% במניות) (מיטב גמל ופנסיה בע"מ)')).toBe('מיטב גמל להשקעה אשראי ואג"ח עם מניות (עד 25% במניות)…');
    for (const n of [plan, "x".repeat(80), `${"מילה ".repeat(20)}סוף`]) expect(dealName(n).length).toBeLessThanOrEqual(NAME_MAX);
  });
  it("fills One Zero's charge for each corporate event, as its list prints it", () => {
    expect(fillDeal(newDeal("brokerage-account"), "house:one-zero", data, TODAY)!.fees.map((f) => f.kind)).toContain("corporate_event");
  });
  it("fills the conversion F-63 prices a house by: Interactive Brokers' automatic conversion, which charges nothing, over its spot line", () => {
    const filled = fillDeal({ ...newDeal("brokerage-account"), readFor: [{ by: "what", is: "us" }] }, "house:interactive-brokers", data, TODAY)!;
    const fx = filled.fees.filter((f) => f.kind === "fx");
    expect(fx).toHaveLength(1);
    expect(fx[0]!.stages![0]!.price).toMatchObject({ form: "action", rate: { v: 0 } });
    expect(fx[0]!.stages![0]!.price).not.toHaveProperty("min.v");
    expect(data.houses.find((h) => h.id === "interactive-brokers")!.left).toContainEqual(expect.objectContaining({ lineId: "interactive-brokers-fx-spot", why: "another-line" }));
  });
  it("offers the houses for a securities account and the kind's tracks for the provident family", () => {
    expect(templateOptions("brokerage-account", data, TODAY).every((o) => o.source === "house")).toBe(true);
    const tracks = templateOptions("kupat-gemel-lehashkaa", data, TODAY);
    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.every((o) => o.source === "track")).toBe(true);
    expect(templateOptions("bank-deposit", data, TODAY)).toEqual([]);
  });
  it("gives each track the yearly fee on the savings its pick fills, the same figure the deal gets", () => {
    const o = templateOptions("kupat-gemel-lehashkaa", data, TODAY).find((x) => x.source === "track" && x.saving)!;
    expect(o.source === "track" && o.saving!.value).toBeGreaterThan(0);
    const d = dealFromTemplate({ ...account(), kind: "kupat-gemel-lehashkaa", fees: [] }, o.id, data, TODAY)!;
    expect(d.fees.find((f) => f.kind === "balance")!.stages![0]!.price).toMatchObject({ rate: { v: o.source === "track" ? o.saving!.value : -1 } });
  });
  it("bars a fee from deposits where every track of the kind has none by rule (PF-06), and no fee for a kind with no tracks", () => {
    const kinds = [...new Set(data.tracks.map((t) => t.wrapperId).filter((k): k is string => !!k))];
    for (const k of kinds) {
      const all = data.tracks.filter((t) => t.wrapperId === k).every((t) => { const v = trackFees(t, data, TODAY); return !!v && depositFeeNoneByRule(v.deposit); });
      expect(dataBar(k as FeeDeal["kind"], data, TODAY)).toEqual(all ? { fees: ["deposit"], cite: ["PF-06"] } : null);
    }
    expect(dataBar("brokerage-account", data, TODAY)).toBeNull();
    expect(kinds.some((k) => dataBar(k as FeeDeal["kind"], data, TODAY) !== null)).toBe(true);
  });
  it("makes a new deal from a template beside the one on screen, of its kind and holding, named by the template", () => {
    const h = data.houses.find((x) => x.fees.some((f) => f.kind === "fx"))!;
    const from = account();
    const before = JSON.stringify(from);
    const d = dealFromTemplate(from, `house:${h.id}`, data, TODAY)!;
    expect(JSON.stringify(from)).toBe(before);
    expect(d.id).not.toBe(from.id);
    expect(d).toMatchObject({ kind: "brokerage-account", readFor: from.readFor, name: h.name, template: { id: `house:${h.id}`, name: h.name } });
    expect(d.fees.some((f) => f.kind === "fund_management")).toBe(false);
    expect(d.fees.some((f) => f.kind === "fx")).toBe(true);
    expect(readDeal(JSON.parse(JSON.stringify(d)))).toEqual(d);
    expect(dealFromTemplate(from, "house:nothing", data, TODAY)).toBeNull();
  });
  it("says what a template leaves out, with why: a house's lines for the holding, a track's fees the data or the rule leave empty", () => {
    const leumi = data.houses.find((x) => x.id === "leumi")!;
    const left = templateOf(account(), "house:leumi", data, TODAY)!.left;
    expect(left).toEqual(leumi.left.map(({ lineId, ...rest }) => ({ line: lineId, ...rest })));
    // each line by its name as the list prints it, with its channel where it has one; and what the record says the price leaves out (D106)
    expect(left.every((l) => "line" in l && !!l.name)).toBe(true);
    expect(templateOf(account(), "house:leumi", data, TODAY)!.leftOut?.warn).toBeGreaterThan(0);
    // a track whose deposit fee the product may not charge (PF-06) says so; one with both figures leaves nothing out; a figure of zero
    // fills nothing and is not left out
    for (const t of data.tracks.filter((x) => x.wrapperId === "keren-hishtalmut").slice(0, 20)) {
      const deal = newDeal("keren-hishtalmut");
      const filled = fillDeal(deal, `track:${t.id}`, data, TODAY)!;
      const out = templateOf(deal, `track:${t.id}`, data, TODAY)!.left;
      const zeros = [t.b, t.d].filter((c) => c.value === 0).length;
      expect(out.length + filled.fees.length + zeros, `track ${t.id}`).toBe(2);
    }
    const t = data.tracks.find((x) => x.wrapperId === "kupat-gemel-lehashkaa")!;
    expect(templateOf(newDeal("keren-hishtalmut"), `track:${t.id}`, data, TODAY)).toBeNull();
    expect(templateOf(account(), "nothing", data, TODAY)).toBeNull();
  });
  it("fills nothing for a track's fee of zero and lists nothing left out for it; a fee above zero fills as given", () => {
    const t = data.tracks.find((x) => x.wrapperId === "kupat-gemel-lehashkaa" && typeof x.b.value === "number" && x.b.value > 0)!;
    const free = { ...t, id: -1, d: { ...t.d, value: 0 } };
    const paid = { ...t, id: -2, d: { ...t.d, value: 0.5 } };
    const freeAll = { ...t, id: -3, b: { ...t.b, value: 0 }, d: { ...t.d, value: 0 } };
    const withThem = { ...data, tracks: [...data.tracks, free, paid, freeAll] };
    const deal = newDeal("kupat-gemel-lehashkaa");
    const a = templateOf(deal, "track:-1", withThem, TODAY)!;
    expect(a.fees.map((f) => f.kind)).toEqual(["balance"]);
    expect(a.left).toEqual([]);
    expect(dealFromTemplate(deal, "track:-1", withThem, TODAY)!.fees.map((f) => f.kind)).toEqual(["balance"]);
    const b = templateOf(deal, "track:-2", withThem, TODAY)!;
    expect(b.fees.map((f) => f.kind)).toEqual(["balance", "deposit"]);
    expect(b.fees[1]!.stages![0]!.price).toMatchObject({ form: "action", rate: { v: 0.5 } });
    expect(b.left).toEqual([]);
    expect(templateOf(deal, "track:-3", withThem, TODAY)).toMatchObject({ fees: [], left: [] });
  });
  it("opens a new deal from a track, its yearly fee charged each month, both figures sourced", () => {
    const t = data.tracks.find((x) => x.wrapperId === "kupat-gemel-lehashkaa")!;
    const d = dealFromTrack(t.id, data, TODAY)!;
    expect(d.kind).toBe("kupat-gemel-lehashkaa");
    const balance = d.fees.find((f) => f.kind === "balance")!.stages![0]!.price;
    expect(balance).toMatchObject({ form: "held", per: 12, every: 1 });
    if (balance.form === "held") expect(balance.rate.src).toBeDefined();
    expect(d.template?.id).toBe(`track:${t.id}`);
    // named as a deal that picked the same track in the builder
    expect(d.name).toBe(pickTrack(newDeal("kupat-gemel-lehashkaa"), `track:${t.id}`, data, TODAY)!.name);
    expect(d.name).not.toBe("");
  });
});

describe("the securities account of the picture, on 11.2026", () => {
  it("in the builder: a row per fee, the minimum said, custody's start in its line, the fund's fee inside the fund, the suggestions", () => {
    const b = builder(read(account()));
    expect(b.rows.map((r) => r.kind)).toEqual(["trade", "custody", "fixed_period", "fx", "fund_management"]);
    expect(b.rows[0]).toMatchObject({ bounds: { min: true, max: false } });
    // custody's start is said in its own line, after its free price: no separate note
    expect(b.rows[1]!.block).toMatchObject({ kind: "slim" });
    expect(b.rows[1]!.block.kind === "slim" && b.rows[1]!.block.parts.map((p) => [p.id, p.stage ?? 0])).toEqual([["free", 0], ["until", 1], ["held", 1]]);
    expect(b.rows[1]!.stages!).toHaveLength(2);
    expect(b.rows[4]!.insideFund).toBe(true);
    expect(b.suggestions.usual).toEqual(["distribution_handling", "transfer_out"]);
    expect(b.suggestions.rarer).toEqual(["fx_spread", "corporate_event", "current_account", "own"]);
    expect(b.rows.map((r) => r.block.kind)).toEqual(["slim", "slim", "slim", "slim", "slim"]);
  });
  it("in the reading: three periods, one chart of a purchase or sale, and a holding chart per period whose fees differ", () => {
    const r = readingOf(read(account()), data.fx);
    expect(r.periods.map((p) => [p.from, p.to])).toEqual([["2026-11", "2027-03"], ["2027-03", "2028-03"], ["2028-03", null]]);
    expect(r.periods[0]).toMatchObject({ current: true, started: true });
    expect(v(r.periods[0]!.left)).toBe(4);
    expect(v(r.periods[1]!.length)).toBe(12);
    expect(r.periods[1]!.rows.find((x) => x.kind === "fixed_period")!.change).toBe("starts");
    // a purchase or sale costs the same in every period: one chart, from 1,000 ₪ to 20,000 ₪ round its mark at 6,000 ₪ (F-112)
    const tab = r.panels.actions.find((t) => t.action === "trade")!;
    expect(tab.side).toBe("all");
    expect(tab.views).toHaveLength(1);
    const action = (tab.views[0] as { chart: ActionView }).chart;
    expect(action.periods).toEqual(["2026-11", "2027-03", "2028-03"]);
    expect(action.range).toEqual({ lo: 1000, hi: 20000 });
    expect(action.marks.map((m) => m.at)).toEqual([expect.closeTo(6000, 6)]);
    expect(action.start).toBeCloseTo(6000, 6);
    expect(action.lanes.map((l) => l.fee.ref.kind)).toEqual(["trade", "fx"]);
    // the minimum decides up to 6,000 ₪: 15 ₪ on 3,000 ₪, and 0.25% (25 ₪) on 10,000 ₪, with the conversion's 0.2% on top
    const part = (a: number, kind: string) => action.readAt(a).parts.find((x) => x.fee.ref.kind === kind)!.cost.value;
    expect(part(3000, "trade")).toBeCloseTo(15, 10);
    expect(part(10000, "trade")).toBeCloseTo(25, 10);
    expect(action.readAt(20000).total.value).toBeCloseTo(20000 * 0.0045, 6);
    expect(action.head).toMatchObject({ kind: "below", rate: { value: expect.closeTo(0.45, 10) } });
    // holding: nothing until the sums start, then the sums against the fund's fee, then against custody and the fund's fee (F-124)
    const held = r.panels.held.map((x) => ("chart" in x ? x.chart : null));
    expect(held.map((x) => x?.periods ?? null)).toEqual([null, ["2027-03"], ["2028-03"]]);
    expect(held[1]!.cross).toBeCloseTo(120 / 0.0007, 6);
    expect(held[2]!.cross).toBeCloseTo(120 / 0.0047, 6);
    expect(held[2]!.readAt(30000).total.value).toBeCloseTo(120 + 30000 * 0.0047, 6);
    expect(r.law.map((l) => l.kind)).toEqual(["trade", "custody", "fixed_period", "fx"]);
    expect(r.law.every((l) => l.cap.state === "none")).toBe(true);
  });
});

describe("the provident fund of the picture, on 11.2026", () => {
  it("in the builder: the fee on the savings tagged below the cap, as it stands now, its rise in 03.2028 in its line", () => {
    const row = builder(read(provident())).rows[0]!;
    expect(row.standingNow.standing).toMatchObject({ standing: "below" });
    // its rise in 03.2028 is in its line: the month, then the later price
    expect(row.block.kind === "slim" && row.block.parts.filter((p) => p.stage).map((p) => p.id)).toEqual(["until", "held"]);
    // the law card's row too: its tag is of now, its later price stands at the cap in its own line
    const law = readingOf(read(provident()), data.fx).law.find((x) => x.fee === "fee-balance")!;
    expect(law.now?.standing).toMatchObject({ standing: "below" });
    expect(law.prices.at(-1)!.standing.standing).toMatchObject({ standing: "at" });
    expect(row.insideFund).toBe(false);
  });
  it("open in place: two prices in time order, the month between them the divider's, each a share of what is held; nothing of a sale", () => {
    const p = panel(read(provident()), "fee-balance")!;
    expect(p.open.buy.map((s) => s.parts.map((x) => x.id))).toEqual([["held"], ["held"]]);
    expect(p.open.buy.map((s) => s.until)).toEqual(["2028-03", undefined]);
    expect(p.open.buy[0]!.parts[0]!.fields.map((f) => f.figure)).toEqual(["rate"]);
    expect(p.open.sell).toBeUndefined();
    expect(panel(read(provident()), "nothing")).toBeNull();
  });
  it("in the reading: the law rows read each price against its cap", () => {
    const r = readingOf(read(provident()), data.fx);
    const balance = r.law.find((l) => l.kind === "balance")!;
    expect(balance.prices.map((x) => [x.from, x.to, x.standing.standing])).toEqual([
      ["2026-11", "2028-03", expect.objectContaining({ standing: "below" })],
      ["2028-03", null, expect.objectContaining({ standing: "at" })],
    ]);
    expect(r.law.find((l) => l.kind === "deposit")!.prices).toHaveLength(1);
    // nothing in the fund's prices varies by size: each panel is one number
    expect([...r.panels.actions.flatMap((t) => t.views), ...r.panels.held].every((x) => "one" in x)).toBe(true);
  });
});

describe("a fee its product is not offered (the rule table)", () => {
  const of = (kind: FeeDeal["kind"], fees: SlimFee[] = []): FeeDeal => ({ ...newDeal(kind), id: "deal-o", fees });
  it("is not suggested: a study fund's deposit fee (KH-22), a fee of the person's own on a provident fund (PF-01), a bank deposit's fees", () => {
    const study = builder(read(of("keren-hishtalmut"))).suggestions;
    expect([...study.usual, ...study.rarer]).toEqual(["balance", "direct_expenses"]);
    const gemel = builder(read(of("kupat-gemel-lehashkaa"))).suggestions;
    expect([...gemel.usual, ...gemel.rarer]).not.toContain("own");
    const deposit = builder(read(of("bank-deposit"))).suggestions;
    expect([...deposit.usual, ...deposit.rarer]).toEqual([]);
    // a product outside them keeps the person's own
    expect(builder(read(of("makam"))).suggestions.rarer).toContain("own");
  });
  it("adds a fee in the first form its product's fee is offered: a pension's insurance premium as a share of each deposit (PEN-15)", () => {
    const pension = of("pension-comprehensive");
    const { fee } = addFee(pension, "insurance_premium", offerFor(kindById(kinds, "pension-comprehensive"), "insurance_premium").usual ?? undefined)!;
    expect(fee.stages?.[0]?.price.form).toBe("action");
    expect(addFee(pension, "insurance_premium")!.fee.stages?.[0]?.price.form).toBe("sum");
  });
  it("still opens and reads in a saved deal that holds one, through the device and a link", async () => {
    const deal = of("keren-hishtalmut", [{ id: "fee-dep", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] }]);
    expect(readDeal(JSON.parse(JSON.stringify(deal)))).toEqual(deal);
    expect((await throughLink(deal))?.fees[0]?.kind).toBe("deposit");
    const b = builder(read(deal));
    expect(b.rows.map((r) => r.fee)).toEqual(["fee-dep"]);
    expect(b.rows[0]!.priced).toBe(true);
    expect(read(deal).fees.map((f) => f.kind)).toEqual(["deposit"]);
  });
});

describe("a fee the law bans at a bank (BRK-17, MF-71)", () => {
  const held = (rate: number) => ({ form: "held" as const, rate: typed(rate), per: 12 as const, every: 3 as const });
  const at = (provider: FeeDeal["provider"], is: string, fees: SlimFee[]): FeeDeal => ({ ...newDeal("brokerage-account"), id: "deal-ban", ...(provider ? { provider } : {}), readFor: [{ by: "what", is }], fees });
  it("reads a bank's custody on makam as nothing charged, says it is banned by law with its rules, and keeps the other fees", () => {
    // Discount's price list, read for makam: its custody prices no makam, and the law bans a bank's custody there
    const d = dealFromTemplate({ ...newDeal("brokerage-account"), readFor: [{ by: "what", is: "makam" }] }, "house:discount", data, TODAY)!;
    expect(d.provider).toBe("bank");
    const r = read(d);
    const custody = d.fees.find((f) => f.kind === "custody")!;
    expect(r.banned).toEqual([{ fee: custody.id, rules: ["BRK-17", "BANK-18", "MF-71", "BANK-51"] }]);
    expect(r.unmatched).not.toContain(custody.id);
    expect(r.fees.some((f) => f.kind === "custody")).toBe(false);
    expect(r.fees.some((f) => f.kind === "trade")).toBe(true);
    const row = builder(r).rows.find((x) => x.fee === custody.id)!;
    expect(row.banned).toEqual({ rules: ["BRK-17", "BANK-18", "MF-71", "BANK-51"] });
    expect(row.priced).toBe(false);
    expect(leftOut(r).banned.map((f) => f.fee)).toEqual([custody.id]);
    const law = readingOf(r, data.fx).law.find((x) => x.fee === custody.id)!;
    expect(law.cap).toEqual({ state: "banned", ban: { rules: ["BRK-17", "BANK-18", "MF-71", "BANK-51"] } });
    expect(law.prices).toEqual([]);
  });
  it("bans a typed price too, a bank's trade on money-market units (MF-71), and nothing at a non-bank or for another pick", () => {
    const fees: SlimFee[] = [
      { id: "fee-c", kind: "custody", stages: [{ price: held(0.1) }] },
      { id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) } }] },
    ];
    expect(read(at("bank", "makam", fees)).banned.map((b) => b.fee)).toEqual(["fee-c"]);
    expect(read(at("bank", "moneyMarket", fees)).banned.map((b) => b.fee)).toEqual(["fee-c", "fee-t"]);
    expect(read(at("non-bank", "makam", fees)).banned).toEqual([]);
    expect(read(at(undefined, "makam", fees)).banned).toEqual([]);
    expect(read(at("bank", "tase", fees)).banned).toEqual([]);
    // a makam deal at a bank: its custody, whatever is picked
    const makam: FeeDeal = { ...newDeal("makam"), id: "deal-m", provider: "bank", fees: [{ id: "fee-c", kind: "custody", stages: [{ price: held(0.1) }] }] };
    expect(read(makam).banned).toEqual([{ fee: "fee-c", rules: ["BRK-17", "BANK-18", "BANK-51"] }]);
    // the trade's ban is the site's reading of the rules (MF-71), and the distribution fee may still be charged; custody's is the rules' words
    const mm = read(at("bank", "moneyMarket", fees)).banned;
    expect(mm.find((b) => b.fee === "fee-t")).toEqual({ fee: "fee-t", rules: ["MF-71", "BRK-16", "BANK-51"], reading: true, distribution: true });
    expect(mm.find((b) => b.fee === "fee-c")).toEqual({ fee: "fee-c", rules: ["BRK-17", "BANK-18", "MF-71", "BANK-51"] });
    // a money-market fund's own deal at a bank: custody by the rules' words, its trade as the site's reading
    const fund: FeeDeal = { ...newDeal("money-market-fund-daily"), id: "deal-f", provider: "bank", fees };
    expect(read(fund).banned.map((b) => [b.fee, !!b.reading])).toEqual([["fee-c", false], ["fee-t", true]]);
  });
});

describe("a deal the views cannot read whole", () => {
  it("leaves a fee whose prices are out of order out, and names it", () => {
    const d = account();
    d.fees[1]!.stages = [{ price: { form: "free" } }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }];
    expect(leftOut(read(d)).unread.map((f) => f.fee)).toEqual(["fee-custody"]);
    expect(builder(read(d)).rows.map((r) => r.fee)).not.toContain("fee-custody");
    // it still opens with its prices to edit, and the reading has no law row for it
    expect(panel(read(d), "fee-custody")!.open.buy).toHaveLength(2);
    expect(readingOf(read(d), data.fx).law.map((r) => r.fee)).not.toContain("fee-custody");
  });
  it("draws no curve whose bound is in a currency it has no rate for, and says so", () => {
    const d = account();
    d.fees[0]!.stages![0]!.price = { form: "action", rate: typed(0.1), min: typed(7), currency: "USD" };
    const trade = (fx: typeof data.fx) => readingOf(read(d), fx).panels.actions.find((t) => t.action === "trade")!.views[0]!;
    expect(trade(null)).toMatchObject({ undrawn: { why: "rate", currency: "USD" } });
    if (data.fx) {
      const c = (trade(data.fx) as { chart: ActionView }).chart;
      expect(c.rates).toHaveLength(1);
      expect(c.marks[0]!.at).toBeGreaterThan(7000);
    }
  });
});

describe("a track picked in the builder, on the deal on screen", () => {
  const both = data.tracks.filter((x) => x.wrapperId === "kupat-gemel-lehashkaa" && typeof x.b.value === "number" && x.b.value > 0 && typeof x.d.value === "number" && x.d.value > 0);
  const [a, b] = [both[0]!, both.find((x) => x.b.value !== both[0]!.b.value)!];
  const kept = (d: FeeDeal) => ({ id: d.id, saved: d.saved });

  it("keeps a typed name and typed fees, and records the track", async () => {
    const deal: FeeDeal = { ...provident(), name: "ההצעה של הסוכן", saved: "2026-11-10" };
    const next = pickTrack(deal, `track:${a.id}`, data, TODAY)!;
    expect(kept(next)).toEqual(kept(deal));
    expect(next.name).toBe("ההצעה של הסוכן");
    expect(next.fees).toEqual(deal.fees);
    expect(next.template).toMatchObject({ id: `track:${a.id}`, feesKept: true });
    expect(readDeal(JSON.parse(JSON.stringify(next)))).toEqual(next);
    expect((await throughLink(next))?.template).toEqual(next.template);
  });
  it("fills and names an empty deal, keeping its id", () => {
    const deal = newDeal("kupat-gemel-lehashkaa");
    const next = pickTrack(deal, `track:${a.id}`, data, TODAY)!;
    const t = templateOf(deal, `track:${a.id}`, data, TODAY)!;
    expect(next.id).toBe(deal.id);
    expect(next.name).toBe(dealName(t.name));
    expect(next.template).toEqual({ id: `track:${a.id}`, name: t.name });
    expect(next.fees.map(({ id: _id, ...f }) => f)).toEqual(t.fees);
    expect(next.fees.every(untouched)).toBe(true);
  });
  it("refills a deal filled from one track and left untouched from another, and its name with it", () => {
    const first = pickTrack(newDeal("kupat-gemel-lehashkaa"), `track:${a.id}`, data, TODAY)!;
    const next = pickTrack(first, `track:${b.id}`, data, TODAY)!;
    const t = templateOf(first, `track:${b.id}`, data, TODAY)!;
    expect(next.id).toBe(first.id);
    expect(next.name).toBe(dealName(t.name));
    expect(next.template).toEqual({ id: `track:${b.id}`, name: t.name });
    expect(next.fees.map(({ id: _id, ...f }) => f)).toEqual(t.fees);
    expect(next.fees.map((f) => f.id)).toEqual(first.fees.map((f) => f.id));
    // a name the person typed over the first track's stays
    expect(pickTrack({ ...first, name: "שלי" }, `track:${b.id}`, data, TODAY)!.name).toBe("שלי");
  });
  it("counts a fee still asking for its price as untouched: one of a kind the track fills is filled, keeping its id; another stays", () => {
    const t = templateOf(newDeal("kupat-gemel-lehashkaa"), `track:${a.id}`, data, TODAY)!;
    const kind = t.fees[0]!.kind as Exclude<FeeKindId, "own">;
    const blank = { ...newFee(kind), id: "fee-blank" };
    const other = FEE_KIND_IDS.find((k) => k !== "own" && !t.fees.some((f) => f.kind === k))!;
    const mine = { ...newFee(other), id: "fee-mine" };
    const deal: FeeDeal = { ...newDeal("kupat-gemel-lehashkaa"), fees: [blank, mine] };
    expect(untouched(blank)).toBe(true);
    const next = pickTrack(deal, `track:${a.id}`, data, TODAY)!;
    expect(next.template?.feesKept).toBeUndefined();
    const filled = next.fees.find((f) => f.kind === kind)!;
    expect(filled.id).toBe("fee-blank");
    expect(filled.stages).toEqual(t.fees[0]!.stages!);
    expect(next.fees.at(-1)).toEqual(mine);
  });
  it("keeps every fee where one among the filled ones is typed or changed", () => {
    const first = pickTrack(newDeal("kupat-gemel-lehashkaa"), `track:${a.id}`, data, TODAY)!;
    const deposit = first.fees.find((f) => f.kind === "deposit")!;
    const changed = updateFee(first, deposit.id, (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0.1)));
    expect(untouched(changed.fees.find((f) => f.id === deposit.id)!)).toBe(false);
    const next = pickTrack(changed, `track:${b.id}`, data, TODAY)!;
    expect(next.fees).toEqual(changed.fees);
    expect(next.template).toMatchObject({ id: `track:${b.id}`, feesKept: true });
    // the name the first track gave is still the template's, so it follows the track picked
    expect(next.name).toBe(dealName(templateOf(first, `track:${b.id}`, data, TODAY)!.name));
    const added = { ...first, fees: [...first.fees, { id: "fee-own", kind: "own" as const, name: "x", stages: [{ price: { form: "free" as const } }] }] };
    expect(pickTrack(added, `track:${b.id}`, data, TODAY)!.fees).toEqual(added.fees);
  });
  it("calls a fee untouched only as a template fills it: one price, every figure sourced", () => {
    const first = pickTrack(newDeal("kupat-gemel-lehashkaa"), `track:${a.id}`, data, TODAY)!;
    const f = first.fees[0] as SlimFee;
    expect(untouched(f)).toBe(true);
    expect(untouched(editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 99)))).toBe(false);
    expect(untouched({ ...f, stages: [{ ...f.stages![0]!, until: "2027-01" }, f.stages![0]!] })).toBe(false);
    expect(untouched({ ...f, stages: [{ price: { form: "free" } }] })).toBe(false);
    expect(provident().fees.some(untouched)).toBe(false);
  });
});

describe("the track picker's rows", () => {
  const kindsWithTracks = [...new Set(data.tracks.map((t) => t.wrapperId).filter((k): k is NonNullable<typeof k> => !!k))];

  it("lists for a kind only tracks of that kind", () => {
    for (const k of kindsWithTracks) {
      const ids = new Set(templateOptions(k as FeeDeal["kind"], data, TODAY).map((o) => o.id));
      for (const t of data.tracks) if (ids.has(`track:${t.id}`)) expect(t.wrapperId).toBe(k);
    }
  });
  it("names a track in its company's group by its short name, and finds it by its company's name", () => {
    const options = templateOptions("kupat-gemel-lehashkaa", data, TODAY);
    const cut = options.filter((o) => o.source === "track" && o.short);
    expect(cut.length).toBeGreaterThan(0);
    for (const o of cut) {
      if (o.source !== "track") continue;
      expect(rowTitle(o)).toBe(o.short);
      expect(o.short!.length).toBeLessThan(o.name.length);
    }
    const one = cut[0]!;
    if (one.source !== "track") throw new Error("a track");
    const found = matching(options, one.company);
    expect(found.some((o) => o.id === one.id)).toBe(true);
    expect(found.every((o) => o.source === "track" && (o.company.includes(one.company) || o.name.includes(one.company) || o.short?.includes(one.company)))).toBe(true);
    expect(matching(options, one.name).some((o) => o.id === one.id)).toBe(true);
    expect(matching(options, one.short!).some((o) => o.id === one.id)).toBe(true);
  });
  it("names the deal by the track's full name once picked", () => {
    const o = templateOptions("kupat-gemel-lehashkaa", data, TODAY).find((x) => x.source === "track" && x.short)!;
    const next = pickTrack(newDeal("kupat-gemel-lehashkaa"), o.id, data, TODAY)!;
    // the full name, with its company after it, as the template names it; never the short name the picker's row shows
    const full = templateOf(newDeal("kupat-gemel-lehashkaa"), o.id, data, TODAY)!.name;
    expect(full.startsWith(o.name)).toBe(true);
    expect(next.name).toBe(dealName(full));
    expect(next.template?.name).toBe(full);
  });
});

describe("one fee filled from a price list", () => {
  it("offers only the houses with a line for the fee, and fills that fee alone, keeping its id, place and sources", () => {
    const deal = account();
    const houses = feePriceLists(deal, "trade", data);
    expect(houses.length).toBeGreaterThan(0);
    const next = fillFee(deal, "fee-trade", houses[0]!.id, data)!;
    expect(next.fees.map((f) => f.id)).toEqual(deal.fees.map((f) => f.id));
    expect(next.fees.filter((f) => f.id !== "fee-trade")).toEqual(deal.fees.filter((f) => f.id !== "fee-trade"));
    expect({ name: next.name, template: next.template, provider: next.provider }).toEqual({ name: deal.name, template: deal.template, provider: deal.provider });
    expect(untouched(next.fees[0]!)).toBe(true);
    expect(feePriceLists(provident(), "balance", data)).toEqual([]);
  });
  it("replaces every price of a fee with several and its own sale price with the list's one price, which prices a sale as a purchase", () => {
    const deal = updateFee(account(), "fee-trade", (f) => ({
      ...(f as SlimFee),
      stages: [{ price: { form: "free" }, until: "2027-06" }, { price: { form: "action", rate: typed(0.3), min: typed(20) } }],
      sale: [{ price: { form: "action", rate: typed(0.5) } }],
    }));
    const house = feePriceLists(deal, "trade", data)[0]!;
    const next = fillFee(deal, "fee-trade", house.id, data)!;
    const fee = next.fees[0]!;
    expect(fee.sale).toBeUndefined();
    // the list's fee whole: each of its prices one, holding on, none priced apart for a sale
    for (const x of fee.cases ?? [fee as { stages: Stage[]; sale?: Stage[] }]) expect([x.stages.length, x.stages[0]!.until, x.sale]).toEqual([1, undefined, undefined]);
    expect(untouched(fee)).toBe(true);
    expect(panel(read(next), "fee-trade")!.open.sell).toBeUndefined();
  });
});

describe("a fee's glossary card", () => {
  it("is, for each product, the sense of the fee's name that names the product, where one does", () => {
    const all = loadTerms();
    const names = Object.keys(data.terms).filter((k) => !k.includes("@"));
    expect(names.length).toBeGreaterThan(0);
    for (const k of data.kinds)
      for (const name of names) {
        const shown = data.terms[termKey(name, k.id)] ?? data.terms[name]!;
        if (all.some((t) => t.he === name && t.wrapperIds.includes(k.id))) expect(shown.wrapperIds).toContain(k.id);
      }
  });
});

describe("a fee with a price not given yet", () => {
  const withBlank = (): FeeDeal => {
    const d = provident();
    return { ...d, fees: [d.fees[0]!, { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: { v: 0, blank: true } } }] }] };
  };
  it("is read nowhere: not in the reading's periods, charts or law rows, and never judged against its cap; its action's tab says so", () => {
    const r = read(withBlank());
    expect(r.fees.map((f) => f.id)).not.toContain("fee-deposit");
    expect(r.unpriced).toEqual(["fee-deposit"]);
    const reading = readingOf(r, data.fx);
    expect(reading.law.map((x) => x.fee)).not.toContain("fee-deposit");
    expect(reading.periods.flatMap((p) => p.rows.map((x) => x.fee))).not.toContain("fee-deposit");
    // the deposit's tab stands, saying the fee is not worked out, in place of a chart; the rest is the reading without the fee
    const [deposit, ...others] = reading.panels.actions;
    expect(deposit).toMatchObject({ key: "deposit:all", views: [{ unpriced: { fees: [{ fee: { fee: "fee-deposit" }, unpriced: { cases: [], missing: "rate" } }] } }] });
    const alone = provident();
    expect({ ...reading, panels: { ...reading.panels, actions: others } }).toEqual(readingOf(read({ ...alone, fees: [alone.fees[0]!] }), data.fx));
  });
  it("keeps its line in the builder, with its box empty and no standing, open with its box empty", () => {
    const row = builder(read(withBlank())).rows.find((x) => x.fee === "fee-deposit")!;
    expect(row.priced).toBe(false);
    expect(row.stages[0]!.price).toMatchObject({ form: "action", blank: true, figures: {} });
    expect(panel(read(withBlank()), "fee-deposit")!.open.buy[0]!.parts[0]!.fields[0]!.value).toBeNull();
  });
  it("is read once a figure is typed, a zero among them", () => {
    const typedZero = updateFee(withBlank(), "fee-deposit", (f) => editPrice(f, "buy", 0, (p) => withFigure(p, "rate", 0)));
    expect(read(typedZero).fees.map((f) => f.id)).toContain("fee-deposit");
  });
  it("is listed among the fees the reading leaves out, by its name, apart from the fees read", () => {
    const g = leftOut(read(withBlank()));
    expect(g.unpriced.map((f) => f.fee)).toEqual(["fee-deposit"]);
    expect(leftOut(read(provident())).unpriced).toEqual([]);
  });
  it("counts only from the month the reading starts: a blank price that has ended does not hold the fee back, a later blank one does", () => {
    const blank: Num = { v: 0, blank: true };
    const withPrices = (first: Num, until: MonthKey, then: Num): FeeDeal => ({
      ...provident(),
      fees: [{ id: "fee-m", kind: "balance", stages: [{ price: { form: "held", rate: first, per: 12, every: 12 }, until }, { price: { form: "held", rate: then, per: 12, every: 12 } }] }],
    });
    const ended = withPrices(blank, "2026-06", typed(0.5));
    expect(read(ended).fees.map((f) => f.id)).toEqual(["fee-m"]);
    expect(read(ended).unpriced).toEqual([]);
    const later = withPrices(typed(0.5), "2027-06", blank);
    expect(read(later).fees).toEqual([]);
    expect(read(later).unpriced).toEqual(["fee-m"]);
    expect(read(withPrices(blank, "2027-02", typed(0.5))).unpriced).toEqual(["fee-m"]);
  });
});

describe("the toolbox adds to every price of the open case", () => {
  it("names no price: a slim fee's toolbox has no first line, and a card that goes on several prices lists each as a place", () => {
    const r = read(account());
    // custody: free until 03.2028, then 0.4% a year
    const t = toolbox(r, "fee-custody")!;
    expect(t.addTo).toBeNull();
    expect(cardOf(t, "until")!.places).toEqual([{ on: "side", side: "buy" }]);
  });
});

describe("a bank's current account, filled from its whole list (F-102, D64)", () => {
  const snaps = latestSnapshots();
  /** What must be there for the test to mean anything: the value, else the test fails saying what is missing. */
  const must = <T,>(x: T | null | undefined, what: string): T => {
    if (x === null || x === undefined) throw new Error(`missing: ${what}`);
    return x;
  };
  const leumi = () => must(fillDeal({ ...newDeal("brokerage-account"), id: "deal-leumi" }, "house:leumi", data, TODAY), "Leumi's template");
  const card = (d: FeeDeal) => d.fees.find((f) => f.kind === "current_account");
  const monthly = () => {
    const v = snaps.find((s) => s.id === "leumi")?.current_account?.monthly_minimum.value;
    return must(typeof v === "number" ? v : null, "Leumi's monthly minimum");
  };
  /** A deal saved before templates filled a current account: the same deal with no such fee and nothing settled. */
  const before = (d: FeeDeal): FeeDeal => {
    const { laterFills: _l, ...template } = must(d.template, "the deal's template");
    return { ...d, fees: d.fees.filter((f) => f.kind !== "current_account"), template };
  };
  /** The site's data with Leumi's record pricing no current account, as a house's record may before its price is collected. */
  const leumiWithout = { ...data, houses: data.houses.map((h) => (h.id === "leumi" ? { ...h, fees: h.fees.filter((f) => f.kind !== "current_account") } : h)) };

  it("fills the record's monthly minimum, a sum each month with its source, at a house whose record prices one, and nothing elsewhere", () => {
    for (const h of data.houses) {
      const rec = snaps.find((s) => s.id === h.id)?.current_account?.monthly_minimum;
      const fee = h.fees.find((f) => f.kind === "current_account");
      if (typeof rec?.value !== "number") {
        // an investment house, and a bank that is part of another, whose record carries none
        expect(fee, h.id).toBeUndefined();
        continue;
      }
      expect(fee?.stages, h.id).toEqual([{ price: { form: "sum", amount: { v: rec.value, src: expect.objectContaining({ url: rec.source.url, checked: rec.checked }) }, every: 1 } }]);
    }
    expect(data.houses.find((h) => h.id === "psagot")?.fees.some((f) => f.kind === "current_account")).toBe(false);
  });

  it("a deal filled from a bank's list holds it as one more fee from that list, which the palette then no longer offers", () => {
    const d = leumi();
    expect(card(d)).toMatchObject({ kind: "current_account", house: "house:leumi" });
    expect(builder(read(d)).suggestions.rarer).not.toContain("current_account");
    expect(builder(read(before(d))).suggestions.rarer).toContain("current_account");
  });

  it("on the fee page, its year is twelve monthly minimums on what a year of holding costs, and nothing once the card is taken away", () => {
    const d = leumi();
    const yearAt = (deal: FeeDeal) => (must(readingOf(read(deal), data.fx).panels.held[0], "the holding panel") as { chart: HeldView }).chart.readAt(100_000);
    const withCard = yearAt(d);
    const without = yearAt({ ...d, fees: d.fees.filter((f) => f.kind !== "current_account") });
    expect((withCard.total.value as number) - (without.total.value as number)).toBeCloseTo(monthly() * 12, 6);
    const fixed = withCard.groups.find((g) => g.layer === "fixed")?.rows.find((x) => x.fee.ref.kind === "current_account");
    expect(fixed?.cost.value).toBeCloseTo(monthly() * 12, 6);
  });

  it("a deal saved before gets it from the same list when it opens, once, with nothing it holds changed", () => {
    const old = must(readDeal(JSON.parse(JSON.stringify(before(leumi())))), "the old deal read back");
    expect(old.template?.laterFills).toBeUndefined();
    const opened = withLaterFills(old, data);
    expect(opened.fees.slice(0, old.fees.length)).toEqual(old.fees);
    expect(opened.fees.slice(old.fees.length)).toEqual([{ ...must(card(leumi()), "the template's card"), id: "fee-current-account" }]);
    expect(opened.template).toEqual({ ...old.template, laterFills: ["current_account"] });
    // opened again, and saved and read back, it is the same deal
    expect(withLaterFills(opened, data)).toBe(opened);
    expect(withLaterFills(must(readDeal(JSON.parse(JSON.stringify(opened))), "the opened deal read back"), data)).toEqual(opened);
  });

  it("a card taken away since stays away, a current account of the person's own stays theirs, and a house with none adds none", async () => {
    const taken = { ...leumi(), fees: leumi().fees.filter((f) => f.kind !== "current_account") };
    expect(withLaterFills(taken, data)).toBe(taken);
    // a link carries what is settled, so the deal it opens keeps the card taken away
    const linked = must(await unpackDeal(must(await packDeal(taken), "the link")), "the linked deal");
    expect(linked.template?.laterFills).toEqual(["current_account"]);
    expect(card(withLaterFills(linked, data))).toBeUndefined();
    const own = before(leumi());
    const typedAccount: FeeDeal = { ...own, fees: [...own.fees, { id: "fee-mine", kind: "current_account", stages: [{ price: { form: "sum", amount: typed(12), every: 1 } }] }] };
    const opened = withLaterFills(typedAccount, data);
    expect(opened.fees).toEqual(typedAccount.fees);
    expect(opened.template?.laterFills).toEqual(["current_account"]);
    // the person's own card taken away later is not replaced by the list's
    const ownTaken = { ...opened, fees: opened.fees.filter((f) => f.id !== "fee-mine") };
    expect(withLaterFills(ownTaken, data)).toBe(ownTaken);
    const psagot = before(must(fillDeal({ ...newDeal("brokerage-account"), id: "deal-psagot" }, "house:psagot", data, TODAY), "Psagot's template"));
    expect(withLaterFills(psagot, data).fees).toEqual(psagot.fees);
    // a deal filled from no house is as it was
    const scratch = account();
    expect(withLaterFills(scratch, data)).toBe(scratch);
  });

  it("an old deal opens with it from a link the site wrote before, and among the saved deals as the pages show them", async () => {
    const old = before(leumi());
    const want = { ...must(card(leumi()), "the template's card"), id: "fee-current-account" };
    const linked = must(await dealOfAddress("", `#d=${must(await packDeal(old), "the link")}`, data, TODAY), "the deal the address opens");
    expect(linked.given).toBe(true);
    expect(card(linked.deal)).toEqual(want);
    // a link gives each fee a fresh id; its fees are the old deal's, then the card
    expect(linked.deal.fees.map((f) => f.kind)).toEqual([...old.fees.map((f) => f.kind), "current_account"]);
    // the saved deals: the old one with the card, every other as it is, the same list where none changes or before the data comes
    const scratch = account();
    const shown = withLaterFillsAll([old, scratch], data);
    expect(card(must(shown[0], "the old deal shown"))).toEqual(want);
    expect(shown[1]).toBe(scratch);
    const none = [scratch];
    expect(withLaterFillsAll(none, data)).toBe(none);
    const both = [old, scratch];
    expect(withLaterFillsAll(both, null)).toBe(both);
  });

  it("BANK-35's cap flags a current account's year of holding in a period that reaches the cap's month, where a month is charged above the cap", () => {
    const cap = must(accountCapOf(data.rules), "BANK-35's cap among the fee page's rules");
    // a current account at a sum a month, priced `first` until `until`, then `then`; with custody, so the holding is a chart
    const deal = (first: number, until: MonthKey | null, then: number, custody = true): FeeDeal => ({
      id: "deal-cap",
      name: "",
      kind: "brokerage-account",
      fees: [
        ...(custody ? [{ id: "fee-custody", kind: "custody" as const, stages: [{ price: { form: "held" as const, rate: typed(0.1), per: 12 as const, every: 12 as const } }] }] : []),
        { id: "fee-account", kind: "current_account", stages: until ? [{ price: { form: "sum", amount: typed(first), every: 1 }, until }, { price: { form: "sum", amount: typed(then), every: 1 } }] : [{ price: { form: "sum", amount: typed(first), every: 1 } }] },
      ],
    });
    /** Each holding view's flags: the current account's row and the year's total at 100,000 ₪ on a chart, the one figure otherwise. */
    const flags = (d: FeeDeal) =>
      readingOf(read(d), data.fx, null, cap).panels.held.map((v: HeldPanelView) => {
        if ("chart" in v) {
          const at = v.chart.readAt(100_000);
          const row = at.groups.flatMap((g) => g.rows).find((x) => x.fee.ref.kind === "current_account");
          return { row: row?.cost.flags ?? [], total: at.total.flags ?? [] };
        }
        return "one" in v ? { one: v.one.one?.value.flags ?? [] } : null;
      });
    const above = cap.value + 0.5;
    const below = cap.value - 1;
    expect(flags(deal(above, null, 0))).toEqual([{ row: ["BANK-35"], total: ["BANK-35"] }]);
    expect(flags(deal(cap.value, null, 0))).toEqual([{ row: [], total: [] }]);
    expect(flags(deal(above, null, 0, false))).toEqual([{ one: ["BANK-35"] }]);
    // above the cap only in a period that ends before the cap's month: no flag; above it from a period that holds the cap's month: flagged
    const from = must(cap.from, "the cap's month");
    const capMonth = monthKey(from);
    const afterCap = monthKey({ y: from.y + Math.floor(from.m / 12), m: (from.m % 12) + 1 });
    expect(flags(deal(above, capMonth, below))).toEqual([{ row: [], total: [] }, { row: [], total: [] }]);
    expect(flags(deal(above, afterCap, below))).toEqual([{ row: ["BANK-35"], total: ["BANK-35"] }, { row: [], total: [] }]);
    expect(flags(deal(below, capMonth, above))).toEqual([{ row: [], total: [] }, { row: ["BANK-35"], total: ["BANK-35"] }]);
    // without the cap given, nothing is flagged
    expect(readingOf(read(deal(above, null, 0)), data.fx).panels.held.every((v) => !("chart" in v) || !v.chart.readAt(100_000).total.flags?.length)).toBe(true);
    // two current accounts, each under the cap, are summed as the run sums a month's: both rows and the total are flagged
    const half = cap.value / 2 + 0.5;
    const two: FeeDeal = { ...deal(half, null, 0), fees: [...deal(half, null, 0).fees, { id: "fee-account-2", kind: "current_account", stages: [{ price: { form: "sum", amount: typed(half), every: 1 } }] }] };
    const twoAt = readingOf(read(two), data.fx, null, cap).panels.held.flatMap((v) => ("chart" in v ? [v.chart.readAt(100_000)] : []));
    expect(twoAt.flatMap((at) => at.groups.flatMap((g) => g.rows).filter((x) => x.fee.ref.kind === "current_account").map((x) => x.cost.flags ?? []))).toEqual([["BANK-35"], ["BANK-35"]]);
    expect(twoAt.map((at) => at.total.flags ?? [])).toEqual([["BANK-35"]]);
  });

  it("a cap with no month it takes effect holds throughout, as the run reads it; a deal with no current account keeps its holding views whole", () => {
    const rule = must(data.rules.find((r) => r.id === "BANK-35"), "BANK-35");
    const undated = structuredClone(rule);
    const figure = undated.figures?.account_fee_up_to_2_actions;
    if (!figure || Array.isArray(figure) || !("effective_from" in figure)) throw new Error("the cap's figure");
    figure.effective_from = null;
    const cap = must(accountCapOf(data.rules), "the cap");
    expect(accountCapOf([undated])).toEqual({ ...cap, from: null });
    // a trade price that changes at the cap's month cuts two periods whose holding is the same: one holding view where no current account is held
    const from = must(cap.from, "the cap's month");
    const custody: FeeDeal = {
      id: "deal-custody",
      name: "",
      kind: "brokerage-account",
      fees: [
        { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) }, until: monthKey(from) }, { price: { form: "action", rate: typed(0.2) } }] },
        { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] },
      ],
    };
    expect(readingOf(read(custody), data.fx, null, cap).panels.held).toHaveLength(1);
    expect(readingOf(read(custody), data.fx, null, cap).panels.held).toHaveLength(readingOf(read(custody), data.fx).panels.held.length);
  });

  it("a deal filled while its house's record priced no current account gets the card once the record prices one", () => {
    const early = must(fillDeal({ ...newDeal("brokerage-account"), id: "deal-early" }, "house:leumi", leumiWithout, TODAY), "Leumi's template without the account");
    expect(card(early)).toBeUndefined();
    expect(early.template?.laterFills).toBeUndefined();
    // the record still prices none: nothing is settled, so nothing changes
    expect(withLaterFills(early, leumiWithout)).toBe(early);
    const later = withLaterFills(early, data);
    expect(later.fees.slice(0, early.fees.length)).toEqual(early.fees);
    expect(card(later)).toEqual({ ...must(card(leumi()), "the template's card"), id: "fee-current-account" });
    expect(later.template).toEqual({ ...early.template, laterFills: ["current_account"] });
    // and once taken away it stays away
    const taken = { ...later, fees: later.fees.filter((f) => f.kind !== "current_account") };
    expect(withLaterFills(taken, data)).toBe(taken);
  });

  it("a deal whose fees a bank's list fills by the template picker settles the card as a fill does, so taken away it stays away", () => {
    const picked = must(pickTrack({ ...newDeal("brokerage-account"), id: "deal-picked" }, "house:leumi", data, TODAY), "Leumi's list picked");
    expect(picked.template).toEqual(leumi().template);
    const taken = { ...picked, fees: picked.fees.filter((f) => f.kind !== "current_account") };
    expect(withLaterFills(taken, data)).toBe(taken);
  });

  it("a card added later takes the kind's own id, with a count after it where the deal holds that id for another fee", () => {
    const old = before(leumi());
    const clash: FeeDeal = { ...old, fees: old.fees.map((f, i) => (i === 0 ? { ...f, id: "fee-current-account" } : f)) };
    expect(card(withLaterFills(clash, data))?.id).toBe("fee-current-account-2");
  });
});
