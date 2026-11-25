// The move run on the device (method §10.4): a typed account's deal is written first and the account leaves the saved state only once the device
// holds it; a second run adds nothing; an older export file's typed accounts move the same way once imported; a device that cannot keep
// the deal keeps the account.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { fxRunInput } from "../fx";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import type { CustomBroker } from "../custom-entries";
import { DEALS_KEY, dealStore, parseDeals, unreadDeals } from "../fee-deal/store";
import { applyImport, ensureLoaded, flush, getSnapshot, replaceState, resetStore } from "../state";
import { movedDealId, type MoveContext } from "./move";
import { moveTypedAccounts } from "./move-run";
import { full, on } from "./move-fixtures";

const data = feesData();
const bundle = buildIndicesBundle();
const t = bundle.today;
const ctx: MoveContext = { houses: data.houses, kinds: data.kinds, snapshots: bundle.snapshots, fx: bundle.fx ? fxRunInput(bundle.fx) : {}, today: t };
const typed: CustomBroker = { id: "custom-broker-mine", name: "החשבון שלי", added: t, tradePct: entered(0.1, "pct_of_trade", t), tradeMin: entered(5, "nis_per_trade", t), custodyPct: entered(0.1, "pct_per_year", t), custodyMin: null, fxPct: null, monthlyFee: entered(0, "nis_per_month", t), sells: { israeli: true, abroad: true } };

function device(refuseDeals = false) {
  const kept = new Map<string, string>();
  const storage = {
    getItem: (k: string) => kept.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (refuseDeals && k === DEALS_KEY) throw new Error("full");
      kept.set(k, v);
    },
    removeItem: (k: string) => void kept.delete(k),
    clear: () => kept.clear(),
    key: () => null,
    get length() {
      return kept.size;
    },
  } as unknown as Storage;
  (globalThis as { window?: unknown }).window = { localStorage: storage, addEventListener: () => {} };
  (globalThis as { document?: unknown }).document = { addEventListener: () => {}, visibilityState: "visible" };
  dealStore.reset();
  resetStore(storage);
  ensureLoaded();
  return kept;
}

const storedDeals = (kept: Map<string, string>) => parseDeals(JSON.parse(kept.get(DEALS_KEY) ?? "null"));
const accounts = () => getSnapshot().state.customBrokers ?? [];

describe("the move on the device", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;
    dealStore.reset();
  });

  describe("on a device that keeps what it is given", () => {
    let kept: Map<string, string>;
    beforeEach(() => {
      kept = device();
      replaceState({ ...getSnapshot().state, customBrokers: [typed] });
      flush(true);
    });

    it("writes the deal, then takes the account out of the saved state; a second run adds nothing", () => {
      moveTypedAccounts(accounts(), ctx);
      flush(true);
      expect(storedDeals(kept).map((d) => d.id)).toEqual([movedDealId(typed.id)]);
      expect(accounts()).toEqual([]);
      moveTypedAccounts([typed], ctx);
      expect(storedDeals(kept)).toHaveLength(1);
    });

    it("moves the typed accounts of an older export file the same way, once imported, adding no second deal for one moved before", () => {
      moveTypedAccounts(accounts(), ctx);
      flush(true);
      const before = getSnapshot().state;
      replaceState(applyImport(before, { ...before, customBrokers: [typed, { ...typed, id: "custom-broker-other", name: "עוד חשבון" }] }, "add", t).state);
      flush(true);
      expect(accounts().map((a) => a.id)).toEqual([typed.id, "custom-broker-other"]);
      moveTypedAccounts(accounts(), ctx);
      flush(true);
      expect(storedDeals(kept).map((d) => d.id)).toEqual([movedDealId(typed.id), movedDealId("custom-broker-other")]);
      expect(accounts()).toEqual([]);
    });
  });

  describe("an account the move cannot make a deal of, or one it once could not", () => {
    /** A load of the page: the stores read afresh from the device, then the move. */
    const load = () => {
      dealStore.reset();
      ensureLoaded();
      dealStore.update((d) => d);
      const left = moveTypedAccounts(accounts(), ctx);
      flush(true);
      return left;
    };
    const entries = (kept: Map<string, string>) => (JSON.parse(kept.get(DEALS_KEY) ?? "null")?.deals ?? []).length;

    it("loaded four times, an account on a house that sells only the side it does not leaves one stored entry", () => {
      const kept = device();
      replaceState({ ...getSnapshot().state, customBrokers: [{ ...on("interactive-brokers", full), sells: { israeli: true, abroad: false } }] });
      flush(true);
      for (let n = 0; n < 4; n++) load();
      expect(entries(kept)).toBe(1);
      expect(unreadDeals()).toBe(0);
      expect(accounts()).toEqual([]);
    });

    it("writes no deal the device would not open again: loaded four times, nothing is stored, and the account stays with why", () => {
      const kept = device();
      const big = on("leumi", { custodyMin: 1e9 });
      replaceState({ ...getSnapshot().state, customBrokers: [big] });
      flush(true);
      const said = [1, 2, 3, 4].map(() => load());
      expect(entries(kept)).toBe(0);
      expect(accounts().map((a) => a.id)).toEqual([big.id]);
      expect(said.at(-1)).toEqual([{ id: big.id, name: big.name, why: "deal" }]);
    });

    it("says a missing rate and any other failure, each for its own account, keeps those accounts and moves the rest", () => {
      device();
      const rateless = on("interactive-israel", { tradeMin: 3 });
      const broken = on("leumi", {});
      replaceState({ ...getSnapshot().state, customBrokers: [rateless, broken, typed] });
      flush(true);
      // the price list of one account's house throws once read past its id, as a fault in the move would
      const houses = ctx.houses.map((h) =>
        h.id === "leumi"
          ? new Proxy(h, {
              get: (t, k) => {
                if (k !== "id") throw new Error("broken");
                return t.id;
              },
            })
          : h,
      );
      const left = moveTypedAccounts(accounts(), { ...ctx, houses, fx: {} });
      flush(true);
      expect(left).toEqual([
        { id: rateless.id, name: rateless.name, why: "rate" },
        { id: broken.id, name: broken.name, why: "error" },
      ]);
      expect(accounts().map((a) => a.id)).toEqual([rateless.id, broken.id]);
    });
  });

  it("keeps the account where the device cannot keep its deal", () => {
    device(true);
    replaceState({ ...getSnapshot().state, customBrokers: [typed] });
    flush(true);
    moveTypedAccounts(accounts(), ctx);
    flush(true);
    expect(accounts().map((a) => a.id)).toEqual([typed.id]);
  });
});
