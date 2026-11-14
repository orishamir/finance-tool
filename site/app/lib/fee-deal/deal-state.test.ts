// The deals kept on the device and the links that carry them, where they fail (store.ts, link.ts): a stored deal the page cannot open is
// kept as stored through every save; a reload opens the deal last on screen; a link that does not open says why, and one fee in it that
// does not open leaves the rest open; a fee taken away hands the toolbox to the fee under it on the page.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeSideStores, emptySide } from "../side-stores";
import { dealOfAddress, packDeal } from "./link";
import { newDeal, typed, type FeeDeal } from "./model";
import { DEALS_KEY, dealStore, dealsDoc, readDealsDoc, reopened, savedWith, unreadDeals } from "./store";
import { removeFeeKept } from "./undo";

const deal = (id: string, name = ""): FeeDeal => ({ id, name, kind: "brokerage-account", fees: [{ id: `fee-${id}`, kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) } }] }] });
/** A deal a later site might write: a fee kind this page does not know. */
const later = { id: "deal-later", name: "", kind: "brokerage-account", fees: [{ id: "fee-x", kind: "crypto_custody", stages: [] }] };

/** A device's storage, with the window the deal store reads it through. */
function device() {
  const kept = new Map<string, string>();
  const storage = { getItem: (k: string) => kept.get(k) ?? null, setItem: (k: string, v: string) => void kept.set(k, v), removeItem: (k: string) => void kept.delete(k) };
  return { kept, storage };
}

describe("a stored deal the page cannot open", () => {
  let dev: ReturnType<typeof device>;
  beforeEach(() => {
    dev = device();
    (globalThis as { window?: unknown }).window = { localStorage: dev.storage, addEventListener: () => {} };
    dealStore.reset();
  });
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    dealStore.reset();
  });

  it("is read apart, kept as stored, and written back after the deals that open", () => {
    const a = deal("deal-a");
    const r = readDealsDoc({ version: 1, deals: [a, later, { ...a, name: "twin" }] });
    expect(r.deals).toEqual([a]);
    expect(r.unread).toEqual([later, { ...a, name: "twin" }]);
    expect(dealsDoc(r.deals, r.unread).deals).toEqual([a, later, { ...a, name: "twin" }]);
    // a document of another version is kept whole
    expect(readDealsDoc({ version: 2, deals: [a] })).toEqual({ deals: [], unread: [{ version: 2, deals: [a] }] });
    expect(readDealsDoc(null)).toEqual({ deals: [], unread: [] });
  });
  it("survives a save of other deals through the store", () => {
    dev.kept.set(DEALS_KEY, JSON.stringify({ version: 1, deals: [deal("deal-a"), later] }));
    dealStore.update((ds) => savedWith(ds, deal("deal-b", "חדשה"), "2026-11-14"));
    expect(unreadDeals()).toBe(1);
    const stored = JSON.parse(dev.kept.get(DEALS_KEY)!);
    expect(stored.deals.map((d: FeeDeal) => d.id)).toEqual(["deal-b", "deal-a", "deal-later"]);
    expect(stored.deals[2]).toEqual(later);
    // and a second save keeps it still
    dealStore.update((ds) => ds.filter((d) => d.id !== "deal-a"));
    expect(JSON.parse(dev.kept.get(DEALS_KEY)!).deals.map((d: FeeDeal) => d.id)).toEqual(["deal-b", "deal-later"]);
  });
  it("is kept as stored where the stored text is not even JSON", () => {
    dev.kept.set(DEALS_KEY, "{cut sh");
    dealStore.update((ds) => savedWith(ds, deal("deal-b"), "2026-11-14"));
    expect(unreadDeals()).toBe(1);
    expect(JSON.parse(dev.kept.get(DEALS_KEY)!).deals.at(-1)).toBe("{cut sh");
  });
  it("survives an import that writes the deals", () => {
    dev.kept.set(DEALS_KEY, JSON.stringify({ version: 1, deals: [later] }));
    expect(writeSideStores(dev.storage, { ...emptySide(), deals: [deal("deal-a")] })).toBe(true);
    expect(JSON.parse(dev.kept.get(DEALS_KEY)!).deals).toEqual([deal("deal-a"), later]);
  });
});

describe("the deal a reload opens", () => {
  it("is the one last on screen, else the one last saved", () => {
    const ds = [deal("deal-a"), deal("deal-b")];
    expect(reopened(ds, "deal-b")!.id).toBe("deal-b");
    expect(reopened(ds, "deal-gone")!.id).toBe("deal-a");
    expect(reopened(ds, null)!.id).toBe("deal-a");
    expect(reopened([], "deal-a")).toBeUndefined();
  });
});

describe("a link that does not open", () => {
  const data = { kinds: [{ id: "brokerage-account" as const, name: "", bases: [], caps: {}, regulator: "" }], houses: [], tracks: [], templates: {} };
  const of = async (search: string, hash = "") => (await dealOfAddress(search, hash, data, "2026-11-14"))!;
  const text = (x: unknown) => Buffer.from(JSON.stringify(x)).toString("base64url");

  it("says why", async () => {
    const good = (await packDeal(deal("deal-a")))!;
    expect(await of("", "#d=")).toMatchObject({ given: false, failed: "empty", deal: { kind: null, fees: [] } });
    expect(await of("", `#d=${good.slice(0, -6)}`)).toMatchObject({ given: false, failed: "broken" });
    const flipped = good.slice(0, 20) + (good[20] === "A" ? "B" : "A") + good.slice(21);
    expect((await of("", `#d=${flipped}`)).failed).not.toBeNull();
    expect(await of(`?d=${text([9, { n: "", k: null, f: [] }, []])}`)).toMatchObject({ given: false, failed: "version" });
    expect(await of("?wrapper=nope")).toMatchObject({ given: false, failed: "wrapper" });
    expect(await of("?track=99999999")).toMatchObject({ given: false, failed: "track" });
    expect(await of("", `#d=${good}`)).toMatchObject({ given: true, failed: null, left: [] });
  });
  it("opens the rest of a deal where one fee does not open, naming it and why", async () => {
    const link = text([2, { n: "", k: "brokerage-account", f: [{ k: "trade", s: [{ P: { F: "action", r: 0.1 } }] }, { k: "crypto_custody", s: [] }, { k: "custody", s: [{ P: { F: "nope" } }] }] }, []]);
    const a = await of(`?d=${link}`);
    expect(a).toMatchObject({ given: true, failed: null, deal: { kind: "brokerage-account", fees: [{ kind: "trade" }] } });
    expect(a.left).toEqual([{ kind: null, why: "kind" }, { kind: "custody", why: "prices" }]);
    // where no fee opens, the link is a broken one
    expect(await of(`?d=${text([2, { n: "", k: "brokerage-account", f: [{ k: "crypto_custody", s: [] }] }, []])}`)).toMatchObject({ given: false, failed: "broken" });
  });
});

describe("a fee taken away", () => {
  it("hands the toolbox to the fee under it on the page, else the one above", () => {
    const d: FeeDeal = { ...newDeal("brokerage-account"), fees: ["trade", "custody", "fx"].map((k) => ({ id: k, kind: k as "trade", stages: [{ price: { form: "free" as const } }] })) };
    // the page shows them as fx, trade, custody (grouped by what each is charged on)
    const shown = ["fx", "trade", "custody"];
    expect(removeFeeKept(d, "fx", "fx", shown)!.chosen).toBe("trade");
    expect(removeFeeKept(d, "custody", "custody", shown)!.chosen).toBe("trade");
    expect(removeFeeKept(d, "trade", "trade", shown)!.chosen).toBe("custody");
    // the deal's own order where the page gave none
    expect(removeFeeKept(d, "fx", "fx")!.chosen).toBe("custody");
    expect(removeFeeKept(d, "fx", "trade", shown)!.chosen).toBe("trade");
  });
});
