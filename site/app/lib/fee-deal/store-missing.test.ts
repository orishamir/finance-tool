// The deal store keeps the stored entries it cannot open and writes them back with every save; when another tab removes the deals
// key, those entries go with it, so a later save in this tab does not bring them back.
import { afterEach, describe, expect, it } from "vitest";
import { DEALS_KEY, dealStore, unreadDeals } from "./store";

function device(stored: unknown) {
  const kept = new Map<string, string>([[DEALS_KEY, JSON.stringify(stored)]]);
  const heard: ((e: { key: string | null }) => void)[] = [];
  const storage = {
    getItem: (k: string) => kept.get(k) ?? null,
    setItem: (k: string, v: string) => void kept.set(k, v),
    removeItem: (k: string) => void kept.delete(k),
  } as unknown as Storage;
  (globalThis as { window?: unknown }).window = {
    localStorage: storage,
    addEventListener: (type: string, l: (e: { key: string | null }) => void) => {
      if (type === "storage") heard.push(l);
    },
  };
  dealStore.reset();
  return { kept, otherTab: (key: string) => heard.forEach((l) => l({ key })) };
}

describe("the deal store when another tab removes the deals key", () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
    dealStore.reset();
  });

  it("forgets the entries it could not open, so the next save writes none of them back", () => {
    const { kept, otherTab } = device({ version: 1, deals: [{ not: "a deal" }] });
    dealStore.update((d) => d);
    expect(unreadDeals()).toBe(1);
    kept.delete(DEALS_KEY);
    otherTab(DEALS_KEY);
    expect(unreadDeals()).toBe(0);
    dealStore.set([]);
    expect(JSON.parse(kept.get(DEALS_KEY)!).deals).toEqual([]);
  });
});
