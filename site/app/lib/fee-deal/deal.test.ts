// The deal as stored and carried (method §10.6): the fee shapes, the checker, the one place percents become fractions, the link, the saved
// deals' side store and the export file that carries them.
import { describe, expect, it } from "vitest";
import { emptySide, mergeSide, readSideFile, readSideStores, writeSideStores } from "../side-stores";
import { decodeDeal, dealOfAddress, encodeDeal, parseSubject } from "./link";
import { blankPrice, engineDeal, feeInOrder, newDeal, newFee, readDeal, typed, type FeeDeal, type Sourced } from "./model";
import { DEALS_KEY, parseDeals, savedWith, without } from "./store";
import { engineBase, FEE_KIND_IDS, FEE_SHAPES, fitsHeld, suggestions } from "./shapes";

const src: Sourced = { url: "https://www.example.org/tariff.pdf", title: "Tariff", publisher: "Bank", strength: "institution", checked: "2026-10-01", effectiveFrom: "2026-01-01" };

/** The picture's securities account: 0.25% a trade (min 15), custody free until 03.2028 then 0.4% a year, 10 a month from 03.2027, 0.2% conversion, the fund's 0.07%. */
function account(): FeeDeal {
  return {
    id: "deal-a",
    name: "",
    kind: "brokerage-account",
    held: { place: "abroad", currency: "USD", payout: "accumulating" },
    fees: [
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: { v: 0.25, src }, min: typed(15) } }] },
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] },
      { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
      { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.07), per: 12, every: 12 } }] },
    ],
  };
}

describe("fee shapes", () => {
  it("gives every kind a usual form among its forms, and fields for each", () => {
    for (const k of FEE_KIND_IDS) {
      const s = FEE_SHAPES[k];
      expect(s.forms, k).toContain(s.usual);
      for (const f of s.forms) expect(s.fields[f]?.length, `${k} ${f}`).toBeGreaterThan(0);
    }
  });
  it("gives the fund's own management fee a stable id of its own, read by name, not as a record's fee base", () => {
    expect(FEE_SHAPES.fund_management.base).toBeNull();
    expect(engineBase("fund_management")).toEqual({ name: "fund_management" });
    expect(engineBase("trade")).toEqual({ key: "trade" });
    expect(engineBase("fx_spread")).toEqual({ key: "fx" });
  });
  it("suggests a conversion only for a holding in another currency, and a distribution's fee only for one that distributes", () => {
    const ils = { place: "israel", currency: "ILS", payout: "accumulating" } as const;
    expect(fitsHeld("fx", ils)).toBe(false);
    expect(fitsHeld("fx", { ...ils, place: "abroad", currency: "USD" })).toBe(true);
    expect(fitsHeld("distribution_handling", ils)).toBe(false);
    const s = suggestions("brokerage-account", ["trade", "custody", "fx", "fixed_period", "distribution_handling", "transfer_out"], ["trade"], ils);
    expect(s.usual).toEqual(["custody", "fixed_period", "transfer_out", "fund_management"]);
    expect(s.rarer).toContain("fx");
    expect(s.rarer.at(-1)).toBe("own");
    expect(s.rarer).not.toContain("distribution_handling");
    const unsaid = suggestions("brokerage-account", ["trade", "distribution_handling"], [], undefined);
    expect([...unsaid.usual, ...unsaid.rarer]).not.toContain("distribution_handling");
  });
});

describe("the deal as the engine reads it", () => {
  it("turns typed percents into fractions in one place, a held rate per charge", () => {
    const e = engineDeal(account());
    expect(e.foreign).toBe(true);
    expect(e.fees[0]!.stages[0]!.price).toEqual({ kind: "action", rate: 0.0025, min: 15 });
    expect(e.fees[1]!.stages).toEqual([{ price: { kind: "free" }, until: { y: 2028, m: 3 } }, { price: { kind: "held", rate: 0.004, everyMonths: 12 } }]);
    const quarterly = engineDeal({ ...newDeal("brokerage-account"), fees: [{ id: "f", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.4), per: 12, every: 3 } }] }] });
    expect(quarterly.fees[0]!.stages[0]!.price).toMatchObject({ kind: "held", everyMonths: 3 });
    expect((quarterly.fees[0]!.stages[0]!.price as { rate: number }).rate).toBeCloseTo(0.001, 12);
  });
  it("carries a bound's currency only with a bound typed", () => {
    const fx = (price: Parameters<typeof engineDeal>[0]["fees"][number]["stages"][number]["price"]) =>
      engineDeal({ ...newDeal("brokerage-account"), fees: [{ id: "f", kind: "fx", stages: [{ price }] }] }).fees[0]!.stages[0]!.price;
    expect(fx({ form: "action", rate: typed(0.2), currency: "USD" })).toEqual({ kind: "action", rate: 0.002 });
    expect(fx({ form: "action", rate: typed(0.2), min: typed(3), currency: "USD" })).toEqual({ kind: "action", rate: 0.002, min: 3, currency: "USD" });
  });
  it("starts a new fee in its usual form", () => {
    expect(newFee("custody").stages).toEqual([{ price: blankPrice("held") }]);
    expect(newFee("own", "x".repeat(80)).name).toHaveLength(60);
  });
});

describe("readDeal", () => {
  it("reads back a deal as written", () => {
    expect(readDeal(JSON.parse(JSON.stringify(account())))).toEqual(account());
  });
  it("keeps prices out of order as typed, and the reading leaves that fee out", () => {
    const d = account();
    d.fees[1]!.stages = [{ price: { form: "free" } }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }];
    const back = readDeal(JSON.parse(JSON.stringify(d)))!;
    expect(back.fees[1]!.stages).toHaveLength(2);
    expect(feeInOrder(back.fees[1]!)).toBe(false);
  });
  it.each([
    ["a kind that is no record", (d: any) => (d.kind = "lottery")],
    ["a fee kind that is none", (d: any) => (d.fees[0].kind = "bribe")],
    ["a form the fee does not take", (d: any) => (d.fees[3].stages[0].price = { form: "sum", amount: { v: 1 }, every: 1 })],
    ["a negative rate", (d: any) => (d.fees[0].stages[0].price.rate.v = -1)],
    ["a rate above a hundred percent", (d: any) => (d.fees[0].stages[0].price.rate.v = 101)],
    ["a month that is not one", (d: any) => (d.fees[1].stages[0].until = "2028-13")],
    ["a source that is a script", (d: any) => (d.fees[0].stages[0].price.rate.src.url = "javascript:alert(1)")],
    ["a source over plain http", (d: any) => (d.fees[0].stages[0].price.rate.src.url = "http://example.org")],
    ["a sale's price on a fee priced on one side alone", (d: any) => d.fees.push({ id: "fee-load", kind: "load", stages: [{ price: { form: "action", rate: { v: 1 } } }], sale: [{ price: { form: "free" } }] })],
    ["a name on a fee that is not the person's own", (d: any) => (d.fees[0].name = "x")],
    ["what is held on a kind that holds no funds", (d: any) => (d.kind = "kupat-gemel-lehashkaa")],
    ["two fees with one id", (d: any) => (d.fees[1].id = "fee-trade")],
    ["a currency of a bound no price list prints", (d: any) => (d.fees[0].stages[0].price.currency = "JPY")],
  ])("refuses %s", (_, spoil) => {
    const d = JSON.parse(JSON.stringify(account()));
    spoil(d);
    expect(readDeal(d)).toBeNull();
  });
  it("refuses what is not a deal at all", () => {
    for (const x of [null, 1, "x", [], {}, { id: "deal-a" }]) expect(readDeal(x)).toBeNull();
  });
});

describe("the link", () => {
  it("carries a deal both ways, with new ids and each figure's source", () => {
    const d = { ...account(), name: "חשבון", start: "2026-03", provider: "bank" as const, saved: "2026-11-01", template: { id: "house:leumi", name: "לאומי" } };
    const back = decodeDeal(encodeDeal(d))!;
    expect(back.id).not.toBe(d.id);
    expect(back.saved).toBeUndefined();
    const strip = (x: FeeDeal) => ({ ...x, id: "", saved: undefined, fees: x.fees.map((f) => ({ ...f, id: "" })) });
    expect(strip(back)).toEqual(strip(d));
    expect(back.fees[0]!.stages[0]!.price).toMatchObject({ rate: { v: 0.25, src } });
  });
  it("writes a source once however many figures carry it", () => {
    const d = account();
    d.fees[3]!.stages[0]!.price = { form: "action", rate: { v: 0.2, src } };
    const raw = JSON.parse(Buffer.from(encodeDeal(d), "base64url").toString("utf8"));
    expect(raw[2]).toHaveLength(1);
  });
  it.each([
    ["empty", ""],
    ["not base64url", "a+b/c="],
    ["not JSON", Buffer.from("{nope", "utf8").toString("base64url")],
    ["another version", Buffer.from(JSON.stringify([2, {}, []])).toString("base64url")],
    ["a source index out of the table", Buffer.from(JSON.stringify([1, { n: "", k: null, f: [{ k: "trade", s: [{ P: { F: "action", r: [1, 5] } }] }] }, []])).toString("base64url")],
    ["too long", "a".repeat(13_000)],
  ])("opens nothing from a link that is %s", (_, d) => {
    expect(decodeDeal(d)).toBeNull();
    // an empty deal opens, and the address gave none: the page keeps nothing of it
    expect(dealOfAddress(`?d=${d}`, { kinds: [], houses: [], tracks: [], templates: {} }, "2026-11-12")).toMatchObject({ deal: { kind: null, fees: [] }, given: false });
  });
  it("sets no stray key from a hostile link", () => {
    const hostile = Buffer.from('[1,{"n":"","k":null,"f":[],"__proto__":{"polluted":1},"constructor":{"x":1}},[]]').toString("base64url");
    const d = decodeDeal(hostile)!;
    expect(d).toMatchObject({ name: "", kind: null, fees: [] });
    expect(({} as { polluted?: number }).polluted).toBeUndefined();
    expect(Object.keys(d).sort()).toEqual(["fees", "id", "kind", "name"]);
  });
  it("opens a new deal of the kind ?wrapper= names, and an empty one the address did not give for a kind or a track that is none", () => {
    const data = { kinds: [{ id: "brokerage-account" as const, name: "", bases: [], caps: {} }], houses: [], tracks: [], templates: {} };
    expect(dealOfAddress("?wrapper=brokerage-account", data, "2026-11-12")).toMatchObject({ deal: { kind: "brokerage-account", fees: [] }, given: true });
    expect(dealOfAddress("?wrapper=nothing", data, "2026-11-12")).toMatchObject({ deal: { kind: null }, given: false });
    expect(dealOfAddress("?track=999", data, "2026-11-12")).toMatchObject({ deal: { kind: null }, given: false });
    expect(dealOfAddress(`?d=${encodeDeal(account())}`, data, "2026-11-12")).toMatchObject({ deal: { kind: "brokerage-account" }, given: true });
    expect(dealOfAddress("", data, "2026-11-12")).toBeNull();
    expect(parseSubject("?track=12")).toEqual({ kind: "track", trackId: 12 });
  });
});

describe("the saved deals", () => {
  it("keeps the deals that check out, once each", () => {
    const a = account();
    expect(parseDeals({ version: 1, deals: [a, { ...a }, { id: "bad" }] })).toEqual([a]);
    expect(parseDeals({ version: 2, deals: [a] })).toEqual([]);
  });
  it("saves a deal first, in place of the one with its id, stamped with the day", () => {
    const a = account(), b = { ...account(), id: "deal-b" };
    const one = savedWith([], a, "2026-11-12");
    expect(one).toEqual([{ ...a, saved: "2026-11-12" }]);
    const two = savedWith(one, b, "2026-11-12");
    expect(two.map((d) => d.id)).toEqual(["deal-b", "deal-a"]);
    const three = savedWith(two, { ...a, name: "x" }, "2026-11-13");
    expect(three.map((d) => d.id)).toEqual(["deal-a", "deal-b"]);
    expect(three[0]).toMatchObject({ name: "x", saved: "2026-11-13" });
    expect(without(two, "deal-a").map((d) => d.id)).toEqual(["deal-b"]);
  });
  it("travels in the export file: read with each deal checked, added by id, written and read back from the device", () => {
    const a = account();
    const { side, dealProblems } = readSideFile({ deals: [a, { id: "deal-x", name: 3 }] });
    expect(side!.deals).toEqual([a]);
    expect(dealProblems).toEqual([{ store: "deals", item: "deal-x", reason: "structure" }]);
    const device = { ...emptySide(), deals: [a] };
    const b = { ...account(), id: "deal-b" };
    const m = mergeSide(device, { ...emptySide(), deals: [{ ...a, name: "other" }, b] }, "add");
    expect(m.merged.deals.map((d) => [d.id, d.name])).toEqual([["deal-a", ""], ["deal-b", ""]]);
    expect(m.added.deals).toBe(1);
    expect(m.skipped).toBe(1);
    const store = new Map<string, string>();
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
    expect(writeSideStores(s, m.merged)).toBe(true);
    expect(JSON.parse(store.get(DEALS_KEY)!).version).toBe(1);
    expect(readSideStores(s).deals).toEqual(m.merged.deals);
  });
});
