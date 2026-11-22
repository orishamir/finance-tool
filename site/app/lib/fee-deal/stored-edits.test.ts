// A saved deal deleted, put back or renamed on the device changes that deal alone: every other deal is written back as it was stored, not
// as a page shows it, though a page shows an old deal with what its house's list fills later (`withLaterFills`), which nobody saved.
import { afterEach, describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import { DEALS_KEY, dealStore } from "./store";
import { newDeal, readDeal, type FeeDeal } from "./model";
import { fillDeal, withLaterFills } from "./templates";
import { deleteStored, renameStored, undoDeleteStored } from "./undo";

const data = feesData();
const TODAY = "2026-11-12";

/** A device holding `deals` as stored, with the page's listeners. */
function device(deals: unknown[]) {
  const kept = new Map<string, string>([[DEALS_KEY, JSON.stringify({ version: 1, deals })]]);
  const storage = {
    getItem: (k: string) => kept.get(k) ?? null,
    setItem: (k: string, v: string) => void kept.set(k, v),
    removeItem: (k: string) => void kept.delete(k),
  };
  (globalThis as { window?: unknown }).window = { localStorage: storage, addEventListener: () => {} };
  dealStore.reset();
  return { stored: (): unknown[] => (JSON.parse(kept.get(DEALS_KEY) ?? "{}") as { deals: unknown[] }).deals };
}

/** A deal filled from Leumi's list before templates filled a current account: no such fee, nothing settled. */
function oldLeumi(): unknown {
  const d = fillDeal({ ...newDeal("brokerage-account"), id: "deal-a", name: "לאומי" }, "house:leumi", data, TODAY);
  if (!d?.template) throw new Error("Leumi's template fills a deal");
  const { laterFills: _l, ...template } = d.template;
  const old: FeeDeal = { ...d, fees: d.fees.filter((f) => f.kind !== "current_account"), template };
  return JSON.parse(JSON.stringify(old));
}
const plain = (id: string, name: string): unknown => JSON.parse(JSON.stringify({ ...newDeal("brokerage-account", name), id }));

describe("a saved deal deleted, put back or renamed writes the others as stored", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    dealStore.reset();
  });

  it("deleting deal B leaves old deal A as stored, and its undo puts B back as stored", () => {
    const a = oldLeumi();
    const b = plain("deal-b", "ב");
    const c = plain("deal-c", "ג");
    const { stored } = device([a, b, c]);
    // the page shows A with the current account its list fills now, which the device does not hold
    const readA = readDeal(a);
    expect(readA && withLaterFills(readA, data)).not.toEqual(readA);
    const u = deleteStored("deal-b", "deal-a");
    expect(u?.deal).toEqual(readDeal(b));
    expect(u?.shown).toBe(false);
    expect(stored()).toEqual([a, c]);
    expect(undoDeleteStored(u!)).toBe(true);
    expect(stored()).toEqual([a, b, c]);
    // put back already: nothing changes
    expect(undoDeleteStored(u!)).toBe(false);
    expect(deleteStored("deal-x", "deal-a")).toBeNull();
    expect(stored()).toEqual([a, b, c]);
  });

  it("deleting old deal A keeps it as stored for the undo", () => {
    const a = oldLeumi();
    const b = plain("deal-b", "ב");
    const { stored } = device([a, b]);
    const u = deleteStored("deal-a", "deal-a");
    expect(u?.shown).toBe(true);
    expect(stored()).toEqual([b]);
    undoDeleteStored(u!);
    expect(stored()).toEqual([a, b]);
  });

  it("renaming deal B changes its name alone and leaves old deal A as stored", () => {
    const a = oldLeumi();
    const b = plain("deal-b", "ב");
    const { stored } = device([a, b]);
    renameStored("deal-b", "שם אחר");
    expect(stored()).toEqual([a, { ...(b as object), name: "שם אחר" }]);
  });
});
