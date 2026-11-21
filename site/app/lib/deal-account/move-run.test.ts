// The move run on the device (method §10.4): a typed account's deal is written first and the account leaves the saved state only once the device
// holds it; a second run adds nothing; an older export file's typed accounts move the same way once imported; a device that cannot keep
// the deal keeps the account.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { fxRunInput } from "../fx";
import { buildIndicesBundle } from "../providers.server";
import { entered } from "../value";
import type { CustomBroker } from "../custom-entries";
import { DEALS_KEY, dealStore, parseDeals } from "../fee-deal/store";
import { applyImport, ensureLoaded, flush, getSnapshot, replaceState, resetStore } from "../state";
import { movedDealId, type MoveContext } from "./move";
import { moveTypedAccounts } from "./move-run";

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

  it("keeps the account where the device cannot keep its deal", () => {
    device(true);
    replaceState({ ...getSnapshot().state, customBrokers: [typed] });
    flush(true);
    moveTypedAccounts(accounts(), ctx);
    flush(true);
    expect(accounts().map((a) => a.id)).toEqual([typed.id]);
  });
});
