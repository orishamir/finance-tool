// The version 3 state document: migration from the release 2 keys and from version 2, the goals and saved comparisons it keeps empty, the export file, import (add,
// replace, refusals) and "delete what was imported". The device storage is a fake, so nothing here touches a browser.
import { beforeEach, describe, expect, it } from "vitest";
import {
  STATE_KEY,
  applyImport,
  applySideImport,
  buildStateFile,
  ensureLoaded,
  exportFileName,
  flush,
  getSnapshot,
  importedCount,
  nextExportName,
  readImport,
  resetStore,
  rereadState,
  saveHolding,
  stateFileText,
  updateState,
  withoutImported,
  type Holding,
  type StateV3,
} from "./state";
import { entered } from "./value";
import { readSideStores, sideCounts, type SideStores } from "./side-stores";
import type { PlanBounds } from "./plan-bounds";

/** The plan numbers' bounds an import checks against, fixed here (P-05's as written on 2026-11-23: the horizon slider's 1 to 40 years, its
 *  `pct` and `age` ranges). */
const BOUNDS: PlanBounds = {
  amount_now: { min: 0, max: null, whole: false },
  monthly_deposit: { min: 0, max: null, whole: false },
  horizon_years: { min: 1, max: 40, whole: true },
  "A-01": { min: -50, max: 50, whole: false },
  "A-02": { min: -50, max: 50, whole: false },
  age: { min: 0, max: 120, whole: true },
};

class FakeStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

const day = "2026-10-24";
const text = (v: string) => ({ ...entered(0, "text", day), value: v });

function holding(id: string, over: Partial<Holding> = {}): Holding {
  return {
    id,
    wrapperId: "provident-for-annuity",
    company: { name: "חברה א", legalId: "111" },
    track: { fundId: 1, name: "כללי" },
    balance: entered(80_000, "nis", day),
    feeBalance: entered(0.9, "pct_per_year", day),
    feeDeposit: entered(0, "pct_of_deposit", day),
    statementDate: text("2026-06-30"),
    order: 0,
    ...over,
  };
}

/** A goal as a version 2 or 3 document or file holds it: the site no longer reads it. */
const oldGoal = (id: string) => ({ id, name: "הון לטווח ארוך", preset: "none", horizonYears: { value: 15, entered: true }, exposures: {}, order: 0 });

const site = { version: "r3-test", data: "cma-test" };
// the moment an export file says it was made, fixed so no test reads the clock
const exported = new Date("2026-10-24T08:00:00Z");

const emptyOf = (): StateV3 => ({ version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] });

let storage: FakeStorage;
beforeEach(() => {
  storage = new FakeStorage();
  resetStore(storage);
});

describe("reading the document again (another tab, a page brought back by Back)", () => {
  const other = (name: string) => JSON.stringify({ ...emptyOf(), holdings: [holding("a", { company: { name } })] });
  const mine = (s: StateV3): StateV3 => ({ ...s, holdings: [holding("a", { company: { name: "שלי" } })] });
  it("takes what another tab wrote when the page holds nothing unwritten", () => {
    ensureLoaded();
    flush();
    storage.setItem(STATE_KEY, other("מהלשונית האחרת"));
    rereadState();
    expect(getSnapshot().state.holdings[0]?.company.name).toBe("מהלשונית האחרת");
  });
  it("keeps an edit not yet written: the page's edit is newer than the device", () => {
    ensureLoaded();
    updateState(mine);
    storage.setItem(STATE_KEY, other("ישן"));
    rereadState();
    expect(getSnapshot().state.holdings[0]?.company.name).toBe("שלי");
  });
  it("keeps an edit the device refused to write", () => {
    ensureLoaded();
    const setItem = storage.setItem.bind(storage);
    storage.setItem = () => {
      throw new Error("full");
    };
    updateState(mine);
    expect(flush()).toBe(false);
    storage.setItem = setItem;
    storage.setItem(STATE_KEY, other("ישן"));
    rereadState();
    expect(getSnapshot().state.holdings[0]?.company.name).toBe("שלי");
  });
});

describe("migration from the release 2 keys and from version 2", () => {
  it("reads the three v1 keys into one document, of the goals nothing (the bank an old file names is left out), then removes them after the write", () => {
    const g = oldGoal("g1");
    storage.setItem("mekor.v1.inputs", JSON.stringify({ entered: { "A-01": 6, amount_now: 30000 }, age: 22, employment: "employee" }));
    storage.setItem("mekor.v1.goals", JSON.stringify({ version: 1, goals: [g], currentId: g.id, bank: "leumi" }));
    storage.setItem("mekor.v1.uncatalogued", JSON.stringify([{ name: "קרן X", date: "2026-10-01" }]));
    const snap = ensureLoaded();
    expect(snap.status).toBe("ok");
    expect(snap.state.version).toBe(3);
    expect(snap.state).not.toHaveProperty("bank");
    expect(snap.state.goals).toEqual([]);
    expect(snap.state.inputs["A-01"]).toMatchObject({ value: 6, unit: "pct_per_year", state: "entered" });
    expect(snap.state.inputs.age?.value).toBe(22);
    expect(snap.state.inputs.employment?.value).toBe("employee");
    expect(snap.state.uncatalogued).toEqual([{ name: "קרן X", seen: "2026-10-01" }]);
    expect(storage.getItem(STATE_KEY)).not.toBeNull();
    for (const k of ["mekor.v1.inputs", "mekor.v1.goals", "mekor.v1.uncatalogued"]) expect(storage.getItem(k)).toBeNull();
  });

  it("writes nothing when the device holds nothing", () => {
    ensureLoaded();
    expect(storage.data.size).toBe(0);
  });

  it("a goals document it cannot read carries nothing over and goes with the other two keys", () => {
    storage.setItem("mekor.v1.goals", JSON.stringify({ version: 7, goals: [] }));
    storage.setItem("mekor.v1.inputs", JSON.stringify({ entered: {}, age: 30, employment: null }));
    const snap = ensureLoaded();
    expect(snap.status).toBe("ok");
    expect(snap.state.inputs.age?.value).toBe(30);
    flush();
    expect(storage.getItem("mekor.v1.goals")).toBeNull();
    expect(storage.getItem("mekor.v1.inputs")).toBeNull();
  });

  it("writes a version 3 document that holds goals and saved comparisons back with both lists empty and no current goal", () => {
    const v3 = { version: 3, goals: [oldGoal("g1")], currentId: "g1", inputs: {}, holdings: [holding("a")], uncatalogued: [], imports: [{ at: day, mode: "add", goals: 1, holdings: 1, names: 0, skipped: 0 }], savedComparisons: [{ id: "c1", goalId: "g1", mode: "wrapper", savedOn: day }] };
    storage.setItem(STATE_KEY, JSON.stringify(v3));
    const snap = ensureLoaded();
    expect(snap.status).toBe("ok");
    expect(snap.state.holdings.map((h) => h.id)).toEqual(["a"]);
    flush();
    const back = JSON.parse(storage.getItem(STATE_KEY)!);
    expect(back.version).toBe(3);
    expect(back.goals).toEqual([]);
    expect(back.savedComparisons).toEqual([]);
    expect("currentId" in back).toBe(false);
  });

  it("leaves a document of a newer version exactly as it is", () => {
    const raw = JSON.stringify({ version: 4, whatever: true });
    storage.setItem(STATE_KEY, raw);
    expect(ensureLoaded().status).toBe("old-version");
    updateState((s) => ({ ...s, broker: "x" }));
    flush();
    expect(storage.getItem(STATE_KEY)).toBe(raw);
  });

  it("saves holdings through the store and reads them back", () => {
    ensureLoaded();
    saveHolding(holding("a"));
    saveHolding(holding("b", { company: { name: "חברה ב" } }));
    flush();
    resetStore(storage);
    const back = ensureLoaded().state.holdings;
    expect(back.map((h) => h.id)).toEqual(["a", "b"]);
    expect(back.map((h) => h.order)).toEqual([0, 1]);
  });
});

describe("the export file", () => {
  it("carries format, version, time, site ids and the state", () => {
    const state: StateV3 = { ...emptyOf(), holdings: [holding("a")] };
    const f = buildStateFile(state, site, new Date("2026-10-24T08:00:00Z"));
    expect(f).toMatchObject({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00.000Z", site, state });
    expect(JSON.parse(stateFileText(f)).state.holdings[0].balance.value).toBe(80_000);
  });

  it("counts the exports of the day on the device, from 1 where what it kept is unreadable", () => {
    expect(nextExportName("2026-10-24")).toBe("mekor-state-2026-10-24.json");
    expect(nextExportName("2026-10-24")).toBe("mekor-state-2026-10-24-2.json");
    expect(nextExportName("2026-10-25")).toBe("mekor-state-2026-10-25.json");
    storage.setItem("mekor.v2.exports", JSON.stringify({ date: "2026-10-26", n: "2" }));
    expect(nextExportName("2026-10-26")).toBe("mekor-state-2026-10-26.json");
    storage.setItem("mekor.v2.exports", "not json");
    expect(nextExportName("2026-10-26")).toBe("mekor-state-2026-10-26.json");
  });

  it("names the file by date, with -2 and -3 for repeats the same day", () => {
    expect(exportFileName("2026-10-24")).toBe("mekor-state-2026-10-24.json");
    expect(exportFileName("2026-10-24", 2)).toBe("mekor-state-2026-10-24-2.json");
    expect(exportFileName("2026-10-24", 3)).toBe("mekor-state-2026-10-24-3.json");
  });
});

describe("import", () => {
  const file = (state: unknown, version = 3) => JSON.stringify({ format: "mekor-state", version, exported: "2026-10-24T08:00:00Z", site, state });
  const base = (): StateV3 => ({ ...emptyOf(), holdings: [holding("a")], uncatalogued: [{ name: "קרן Y", seen: day }] });

  it("reads a file it wrote, with the counts, and changes nothing on the device", () => {
    const r = readImport(file(base()), BOUNDS);
    expect(r.ok && r.preview.counts).toEqual({ holdings: 1, names: 1, inputs: false, indices: 0, funds: 0, accounts: 0, offers: 0, variants: 0, ticks: 0, ownRates: 0, deals: 0 });
    expect(r.ok && r.preview.migrated).toBe(false);
    expect(storage.data.size).toBe(0);
  });

  it("refuses text that is not the site's format", () => {
    expect(readImport("דוח שנתי לעמית 2025", BOUNDS)).toEqual({ ok: false, refusal: { kind: "format" } });
    expect(readImport(JSON.stringify({ hello: 1 }), BOUNDS)).toEqual({ ok: false, refusal: { kind: "format" } });
  });

  it("names the header field that is out of order, and shows the header of a file it reads", () => {
    const head = { format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site, state: base() };
    expect(readImport(JSON.stringify({ ...head, version: "3" }), BOUNDS)).toEqual({ ok: false, refusal: { kind: "invalid", field: "version" } });
    expect(readImport(JSON.stringify({ ...head, exported: 5 }), BOUNDS)).toEqual({ ok: false, refusal: { kind: "invalid", field: "exported" } });
    expect(readImport(JSON.stringify({ ...head, site: { version: "r3-test" } }), BOUNDS)).toEqual({ ok: false, refusal: { kind: "invalid", field: "site" } });
    const r = readImport(JSON.stringify(head), BOUNDS);
    expect(r.ok && r.preview.file).toEqual({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site });
  });

  it("refuses a newer version", () => {
    expect(readImport(file(base(), 4), BOUNDS)).toEqual({ ok: false, refusal: { kind: "newer" } });
  });

  it("imports a version 3 file with goals and saved comparisons, even unreadable ones, and leaves them out without a word", () => {
    const v3 = { ...base(), version: 3, goals: [oldGoal("g1"), { ...oldGoal("g2"), exposures: { makam: { return: 3 } }, horizonYears: { value: "ten", entered: true } }], currentId: "g1", savedComparisons: [{ id: "c1", goalId: "g1", mode: "wrapper", savedOn: day }, 5] };
    const r = readImport(file(v3, 3), BOUNDS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.rejected).toEqual([]);
    expect(r.preview.counts).toMatchObject({ holdings: 1, names: 1 });
    expect(r.preview.migrated).toBe(false);
    expect(r.preview.state.goals).toEqual([]);
    expect(r.preview.state.savedComparisons).toEqual([]);
    expect("currentId" in r.preview.state).toBe(false);
    const out = applyImport(emptyOf(), r.preview.state, "add", day);
    expect(out.added).toEqual({ holdings: 1, names: 1, inputs: 0, indices: 0, funds: 0, accounts: 0 });
  });

  it("migrates a version 2 file: its goals and a leftover visits field are left out", () => {
    const r = readImport(file({ ...base(), version: 2, goals: [oldGoal("g1")], visits: { last: "2026-10-23" } }, 2), BOUNDS);
    expect(r.ok && r.preview.migrated).toBe(true);
    expect(r.ok && r.preview.state.version).toBe(3);
    expect(r.ok && r.preview.state.goals).toEqual([]);
    expect(r.ok && r.preview.state.savedComparisons).toEqual([]);
    expect(r.ok && "visits" in r.preview.state).toBe(false);
    expect(r.ok && r.preview.state.holdings).toHaveLength(1);
  });

  it("migrates an older version (the goals document alone), leaving out the bank it names", () => {
    const r = readImport(file({ version: 1, goals: [oldGoal("g1")], currentId: "g1", bank: "hapoalim" }, 1), BOUNDS);
    expect(r.ok && r.preview.migrated).toBe(true);
    expect(r.ok && r.preview.state).not.toHaveProperty("bank");
    expect(r.ok && r.preview.state.goals).toEqual([]);
  });

  it("leaves out a holding whose balance is a bare number, naming the field", () => {
    const s = base() as unknown as { holdings: { balance: unknown }[] };
    s.holdings[0]!.balance = 80_000;
    const r = readImport(file(s), BOUNDS);
    expect(r.ok && r.preview.state.holdings).toHaveLength(0);
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "holding", at: 1, field: "balance", problem: "structure" }]);
  });

  it("leaves out a holding with an unknown wrapper", () => {
    const s = base();
    (s.holdings[0] as { wrapperId: string }).wrapperId = "bitcoin";
    const r = readImport(file(s), BOUNDS);
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "holding", at: 1, field: "wrapperId", problem: "wrapper" }]);
  });

  it("add: appends with the imported tag and an order after the existing ones, skipping identical items", () => {
    const mine: StateV3 = { ...emptyOf(), holdings: [holding("a"), holding("m", { order: 1, company: { name: "חברה ב" } })] };
    const r = applyImport(mine, base(), "add", day);
    // holding "a" is identical to mine: skipped; the name is new
    expect(r.skipped).toBe(1);
    expect(r.added).toEqual({ holdings: 0, names: 1, inputs: 0, indices: 0, funds: 0, accounts: 0 });
    expect(r.state.holdings).toHaveLength(2);
    expect(r.state.uncatalogued[0]?.importedAt).toBe(day);
    expect(importedCount(r.state)).toEqual({ holdings: 0, names: 1, inputs: 0, indices: 0, funds: 0, accounts: 0, total: 1 });
  });

  it("add: a holding with the same id and other content is kept as a new item", () => {
    const mine: StateV3 = { ...emptyOf(), holdings: [holding("a")] };
    const theirs = { ...base(), holdings: [holding("a", { balance: entered(1, "nis", day) })] };
    const r = applyImport(mine, theirs, "add", day);
    expect(r.state.holdings).toHaveLength(2);
    expect(r.state.holdings[1]!.importedAt).toBe(day);
    expect(r.state.holdings[1]!.order).toBe(1);
    expect(r.state.holdings[1]!.id).not.toBe("a");
  });

  it("replace: the file's state as it is", () => {
    const mine: StateV3 = { ...emptyOf(), holdings: [holding("z")] };
    const r = applyImport(mine, base(), "replace", day);
    expect(r.state.holdings.map((h) => h.id)).toEqual(["a"]);
    expect(r.state.holdings[0]!.importedAt).toBeUndefined();
  });

  it("delete what was imported removes only the tagged items", () => {
    const mine: StateV3 = { ...emptyOf(), holdings: [holding("z")] };
    const r = applyImport(mine, base(), "add", day);
    const cleaned = withoutImported(r.state);
    expect(cleaned.holdings.map((h) => h.id)).toEqual(["z"]);
    expect(cleaned.uncatalogued).toHaveLength(0);
  });

  it("an export, a cleared device and an import bring the holdings back", () => {
    ensureLoaded();
    saveHolding(holding("a"));
    saveHolding(holding("b", { order: 1 }));
    flush();
    const text = stateFileText(buildStateFile(getSnapshot().state, site, exported));
    resetStore(new FakeStorage());
    ensureLoaded();
    const r = readImport(text, BOUNDS);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const out = applyImport(getSnapshot().state, r.preview.state, "add", day);
    expect(out.state.holdings.map((h) => h.id)).toEqual(["a", "b"]);
  });
});

// ---------------------------------------------------------------- the same file twice, hand-edited files

describe("import twice in add mode (A33, A69)", () => {
  const file = (state: unknown, extra: Record<string, unknown> = {}) => JSON.stringify({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site, state, ...extra });
  const theirs = (): StateV3 => ({ ...emptyOf(), holdings: [holding("a")], uncatalogued: [{ name: "קרן Y", seen: day }] });
  const mine = (): StateV3 => ({ ...emptyOf(), holdings: [holding("m", { company: { name: "חברה ב" } })] });

  it("adds nothing the second time, and the count says so", () => {
    const incoming = theirs();
    const first = applyImport(mine(), incoming, "add", day);
    expect(first.added).toEqual({ holdings: 1, names: 1, inputs: 0, indices: 0, funds: 0, accounts: 0 });
    const second = applyImport(first.state, incoming, "add", day);
    expect(second.added).toEqual({ holdings: 0, names: 0, inputs: 0, indices: 0, funds: 0, accounts: 0 });
    expect(second.skipped).toBe(2);
    expect(second.state.holdings).toHaveLength(2);
    // a third time, a day later: still nothing
    const third = applyImport(second.state, incoming, "add", "2026-10-25");
    expect(third.state.holdings).toHaveLength(2);
    expect(third.state.uncatalogued).toHaveLength(1);
  });

  it("a holding added under a new id (same id, other content) is not added again either", () => {
    const clash: StateV3 = { ...emptyOf(), holdings: [holding("m", { balance: entered(1, "nis", day) })] };
    const first = applyImport(mine(), clash, "add", day);
    expect(first.added.holdings).toBe(1);
    const second = applyImport(first.state, clash, "add", day);
    expect(second.added.holdings).toBe(0);
    expect(second.state.holdings).toHaveLength(2);
  });

  it("two holdings of the person's own that read alike are both kept by an import into an empty device", () => {
    const s = { ...mine(), holdings: [holding("a"), holding("b", { order: 1 })] };
    const r = applyImport(emptyOf(), s, "add", day);
    expect(r.state.holdings.map((h) => h.id)).toEqual(["a", "b"]);
  });

  it("a hand-edited holding and guide input are left out with their field", () => {
    const s = theirs();
    s.holdings = [holding("a"), holding("neg", { balance: entered(-5, "nis", day) }), holding("fee", { feeBalance: entered(140, "pct_per_year", day) }), holding("date", { statementDate: text("אתמול") }), holding("gain", { embeddedGain: entered(900_000, "nis", day) })];
    s.inputs = { amount_now: { ...entered(1, "nis", day), value: "הרבה" as never } };
    const r = readImport(file(s), BOUNDS);
    expect(r.ok && r.preview.rejected).toEqual([
      { kind: "holding", at: 2, field: "balance", problem: "negative" },
      { kind: "holding", at: 3, field: "feeBalance", problem: "over-100" },
      { kind: "holding", at: 4, field: "statementDate", problem: "date" },
      { kind: "holding", at: 5, field: "embeddedGain", problem: "gain-over-balance" },
      { kind: "input", key: "amount_now", problem: "not-number" },
    ]);
    expect(r.ok && r.preview.state.holdings.map((h) => h.id)).toEqual(["a"]);
    expect(JSON.stringify(r.ok && r.preview.state)).not.toMatch(/NaN/);
  });
});

// ---------------------------------------------------------------- the side stores in the file

describe("side stores in the export file (A32)", () => {
  const offer = { providerId: "p1", lines: { trade: { rate: entered(0.1, "pct", day) } }, savedAt: day };
  const device = (): SideStores => ({ offers: [offer], variantAssumptions: { "index-sp500": { fxChange: 2, w8ben: true } }, playbookTicks: { "keren-hishtalmut": ["s1", "s2"] }, ownRates: { g1: { "bank-deposit": 3.5 } }, deals: [] });
  const seed = (s: FakeStorage, side: SideStores) => {
    s.setItem("mekor.v2.offers", JSON.stringify({ version: 1, offers: side.offers }));
    s.setItem("mekor.v2.variants", JSON.stringify({ version: 1, byExposure: side.variantAssumptions }));
    s.setItem("mekor.v2.playbook-ticks", JSON.stringify({ version: 1, byKey: side.playbookTicks }));
    s.setItem("mekor.v2.own-rates", JSON.stringify(side.ownRates));
  };

  it("the keys are the ones the stores write", async () => {
    const { SIDE_KEYS } = await import("./side-stores");
    expect([SIDE_KEYS.offers, SIDE_KEYS.variants, SIDE_KEYS.ticks, SIDE_KEYS.ownRates]).toEqual(["mekor.v2.offers", "mekor.v2.variants", "mekor.v2.playbook-ticks", "mekor.v2.own-rates"]);
  });

  it("reads the three keys, writes them into the file, and a second device takes them back; the same file again adds nothing", () => {
    seed(storage, device());
    const side = readSideStores(storage);
    expect(sideCounts(side)).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1, deals: 0 });
    ensureLoaded();
    saveHolding(holding("a"));
    const text = stateFileText(buildStateFile(getSnapshot().state, site, exported, side));
    expect(JSON.parse(text).version).toBe(3);

    const other = new FakeStorage();
    resetStore(other);
    ensureLoaded();
    const r = readImport(text, BOUNDS);
    expect(r.ok && r.preview.counts).toMatchObject({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    if (!r.ok) return;
    const first = applySideImport(r.preview.side, "add");
    expect(first.added).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1, deals: 0 });
    expect(readSideStores(other)).toEqual(side);
    const again = applySideImport(r.preview.side, "add");
    expect(again.added).toEqual({ offers: 0, variants: 0, ticks: 0, ownRates: 0, deals: 0 });
    expect(again.skipped).toBe(5);
    expect(readSideStores(other)).toEqual(side);
  });

  it("add keeps the device's own offer and unions the ticks; replace takes the file's", () => {
    seed(storage, { ...device(), playbookTicks: { k: ["s1"] } });
    const file: SideStores = { offers: [{ ...offer, savedAt: "2026-01-01" }], variantAssumptions: {}, playbookTicks: { k: ["s1", "s9"] }, ownRates: {}, deals: [] };
    const added = applySideImport(file, "add");
    expect(added.merged.offers[0]!.savedAt).toBe(day);
    expect(added.merged.playbookTicks.k).toEqual(["s1", "s9"]);
    const replaced = applySideImport(file, "replace");
    expect(readSideStores(storage).offers[0]!.savedAt).toBe("2026-01-01");
    expect(replaced.merged.variantAssumptions).toEqual({});
  });

  it("an item that fails its check is left out and named; a file with no side stores leaves the device's alone", () => {
    seed(storage, device());
    const bad = { ...JSON.parse(stateFileText(buildStateFile(emptyOf(), site, exported, device()))) };
    bad.sideStores.offers.push({ providerId: "p2", lines: { trade: { rate: { ...entered(0.1, "pct", day), value: -3 } } }, savedAt: day });
    bad.sideStores.variantAssumptions.x = { fxChange: "הרבה" };
    bad.sideStores.playbookTicks.k = [1];
    const r = readImport(JSON.stringify(bad), BOUNDS);
    expect(r.ok && r.preview.sideProblems).toEqual([
      { store: "offers", item: "p2", reason: "not-number" },
      { store: "variants", item: "x", reason: "not-number" },
      { store: "ticks", item: "k", reason: "structure" },
    ]);
    expect(r.ok && r.preview.counts).toMatchObject({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    const none = applySideImport(null, "replace");
    expect(none.added).toEqual({ offers: 0, variants: 0, ticks: 0, ownRates: 0, deals: 0 });
    expect(sideCounts(readSideStores(storage))).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1, deals: 0 });
  });

  it("a state with only side stores is not an empty export", async () => {
    const { isEmptyState } = await import("./state");
    expect(isEmptyState(emptyOf())).toBe(true);
    expect(isEmptyState(emptyOf(), device())).toBe(false);
  });

  it("an old-shaped tick key in a file folds into its wrapper's key on import", () => {
    const f = JSON.parse(stateFileText(buildStateFile(emptyOf(), site, exported, device())));
    f.sideStores.playbookTicks = { "keren-hishtalmut|a|b": ["s1"], "keren-hishtalmut|c|d": ["s2"], other: ["x"] };
    const r = readImport(JSON.stringify(f), BOUNDS);
    expect(r.ok && r.preview.side?.playbookTicks).toEqual({ "keren-hishtalmut": ["s1", "s2"], other: ["x"] });
  });

  it("a file without own rates reads as none; an own rate out of range is named", () => {
    const f = JSON.parse(stateFileText(buildStateFile(emptyOf(), site, exported, device())));
    delete f.sideStores.ownRates;
    expect(readImport(JSON.stringify(f), BOUNDS).ok && sideCounts((readImport(JSON.stringify(f), BOUNDS) as { preview: { side: SideStores } }).preview.side).ownRates).toBe(0);
    f.sideStores.ownRates = { g1: { "bank-deposit": 3, makam: 400 } };
    const r = readImport(JSON.stringify(f), BOUNDS);
    expect(r.ok && r.preview.sideProblems).toEqual([{ store: "ownRates", item: "g1/makam", reason: "not-number" }]);
  });

  it("delete-imported takes out the side items an add import brought, and only those", async () => {
    const { deleteImported, importedSideCount } = await import("./state");
    seed(storage, { offers: [], variantAssumptions: {}, playbookTicks: { keren: ["own"] }, ownRates: {}, deals: [] });
    const file: SideStores = { ...device(), playbookTicks: { keren: ["own", "s1"] } };
    const r = applySideImport(file, "add");
    expect(r.added).toEqual({ offers: 1, variants: 1, ticks: 1, ownRates: 1, deals: 0 });
    expect(importedSideCount()).toBe(4);
    deleteImported();
    expect(importedSideCount()).toBe(0);
    expect(readSideStores(storage)).toEqual({ offers: [], variantAssumptions: {}, playbookTicks: { keren: ["own"] }, ownRates: {}, deals: [] });
  });

  it("replace leaves nothing tagged as imported", async () => {
    const { importedSideCount } = await import("./state");
    applySideImport(device(), "add");
    applySideImport(device(), "replace");
    expect(importedSideCount()).toBe(0);
  });
});

describe("the index page's saved state (D28)", () => {
  const nikkei = { id: "custom-nikkei", name: "ניקיי 225", added: day };

  it("keeps a custom index and the current broker through the store and the export file", async () => {
    const { saveCustomIndex, setCurrentBroker, removeCustomIndex } = await import("./state");
    ensureLoaded();
    saveCustomIndex(nikkei);
    setCurrentBroker("leumi");
    flush(true);
    const raw = JSON.parse(storage.data.get(STATE_KEY)!);
    expect(raw.customIndices).toEqual([nikkei]);
    expect(raw.broker).toBe("leumi");
    const file = buildStateFile(getSnapshot().state, site, new Date("2026-10-25T10:00:00Z"));
    const read = readImport(stateFileText(file), BOUNDS);
    if (!read.ok) throw new Error("refused");
    expect(read.preview.state.customIndices).toEqual([nikkei]);
    removeCustomIndex("custom-nikkei");
    expect(getSnapshot().state.customIndices).toBeUndefined();
  });

  it("leaves out a bank an earlier version 3 document marked as the person's own, and writes none back", () => {
    storage.data.set(STATE_KEY, JSON.stringify({ version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [], bank: "hapoalim" }));
    expect(ensureLoaded().status).toBe("ok");
    expect(getSnapshot().state).not.toHaveProperty("bank");
    updateState((s) => ({ ...s, broker: "x" }));
    flush(true);
    expect(JSON.parse(storage.data.get(STATE_KEY)!)).not.toHaveProperty("bank");
  });

  it("loads a version 3 document, and leaves out a custom index that fails its shape", () => {
    const old = { version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] };
    storage.data.set(STATE_KEY, JSON.stringify(old));
    expect(ensureLoaded().status).toBe("ok");
    expect(getSnapshot().state.customIndices).toBeUndefined();
    resetStore(storage);
    storage.data.set(STATE_KEY, JSON.stringify({ ...old, customIndices: [nikkei, { id: "x" }, 5] }));
    ensureLoaded();
    expect(getSnapshot().state.customIndices).toEqual([nikkei]);
  });

  it("import add keeps the device's indices and adds the file's others", () => {
    const base = emptyOf();
    const merged = applyImport({ ...base, customIndices: [nikkei] }, { ...base, customIndices: [nikkei, { id: "custom-b", name: "ב", added: day }] }, "add", day);
    expect(merged.state.customIndices!.map((c) => c.id)).toEqual(["custom-nikkei", "custom-b"]);
  });
});

describe("what an import brings of the index page's own and of the plan (the transfer page)", () => {
  const fund = (id: string, indexId: string) => ({ id, name: id, number: null, indexId, kind: "il-tracking" as const, fixed: null, variable: null, trustee: null, hedged: false, payout: null, yield: null, perYear: null, domicile: null, tracking: null, tradesIn: "ILS" as const, added: day });
  const theirs = (): StateV3 => ({
    ...emptyOf(),
    inputs: { horizon_years: entered(20, "years", day), "A-01": entered(5, "pct_per_year", day) },
    customIndices: [{ id: "custom-nikkei", name: "ניקיי", added: day }],
    customFunds: [fund("custom-fund-n", "custom-nikkei"), fund("custom-fund-s", "index-sp500")],
    broker: "leumi",
  });
  const mine = (): StateV3 => ({ ...emptyOf(), inputs: { "A-01": entered(6, "pct_per_year", day) }, customIndices: [{ id: "custom-own", name: "שלי", added: day }], customFunds: [fund("custom-fund-own", "custom-own")] });

  it("counts a file's custom index, its funds and its plan numbers in the preview", () => {
    const r = readImport(JSON.stringify({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site, state: theirs() }), BOUNDS);
    expect(r.ok && r.preview.counts).toMatchObject({ holdings: 0, names: 0, inputs: true, indices: 1, funds: 2, accounts: 0 });
  });

  it("a file with only a custom index adds it into an empty device, and says it added it", () => {
    const only: StateV3 = { ...emptyOf(), customIndices: [{ id: "custom-nikkei", name: "ניקיי", added: day }] };
    const r = applyImport(emptyOf(), only, "add", day);
    expect(r.added).toEqual({ holdings: 0, names: 0, inputs: 0, indices: 1, funds: 0, accounts: 0 });
    expect(r.state.customIndices).toHaveLength(1);
  });

  it("delete what was imported takes away exactly the indices, funds, plan numbers and broker the import brought", () => {
    const r = applyImport(mine(), theirs(), "add", day);
    expect(r.added).toEqual({ holdings: 0, names: 0, inputs: 1, indices: 1, funds: 2, accounts: 0 });
    expect(importedCount(r.state).total).toBe(5);
    const cleaned = withoutImported(r.state);
    expect(cleaned.inputs).toEqual(mine().inputs);
    expect(cleaned.customIndices).toEqual(mine().customIndices);
    expect(cleaned.customFunds).toEqual(mine().customFunds);
    expect(cleaned.broker).toBeUndefined();
    expect(importedCount(cleaned).total).toBe(0);
  });

  it("a fund the person added later on an imported index goes with the index", () => {
    const r = applyImport(mine(), theirs(), "add", day);
    const later = { ...r.state, customFunds: [...(r.state.customFunds ?? []), fund("custom-fund-later", "custom-nikkei")] };
    expect(withoutImported(later).customFunds?.map((f) => f.id)).toEqual(["custom-fund-own"]);
  });

  it("the same file a second time adds nothing and writes no record of an import", () => {
    const first = applyImport(mine(), theirs(), "add", day);
    const second = applyImport(first.state, theirs(), "add", day);
    expect(second.added).toEqual({ holdings: 0, names: 0, inputs: 0, indices: 0, funds: 0, accounts: 0 });
    expect(second.state.imports).toHaveLength(1);
  });
});

describe("a plan number outside the bound the fields hold (P-05's) is left out of an import", () => {
  const file = (inputs: Record<string, unknown>) => JSON.stringify({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site, state: { ...emptyOf(), inputs } });

  it("a thousand years is refused with the bound; forty years is kept", () => {
    const r = readImport(file({ horizon_years: entered(1000, "years", day), amount_now: entered(5000, "nis", day) }), BOUNDS);
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "input", key: "horizon_years", problem: "out-of-bound", bound: BOUNDS.horizon_years }]);
    expect(r.ok && Object.keys(r.preview.state.inputs)).toEqual(["amount_now"]);
    const ok = readImport(file({ horizon_years: entered(40, "years", day) }), BOUNDS);
    expect(ok.ok && ok.preview.rejected).toEqual([]);
  });

  it("a part of a year, a negative amount, a return past the percent range and an age past its range are each refused", () => {
    const r = readImport(file({ horizon_years: entered(2.5, "years", day), monthly_deposit: entered(-1, "nis_per_month", day), "A-01": entered(80, "pct_per_year", day), age: entered(130, "years", day) }), BOUNDS);
    expect(r.ok && r.preview.rejected).toEqual([
      { kind: "input", key: "horizon_years", problem: "not-whole" },
      { kind: "input", key: "monthly_deposit", problem: "negative" },
      { kind: "input", key: "A-01", problem: "out-of-bound", bound: BOUNDS["A-01"] },
      { kind: "input", key: "age", problem: "out-of-bound", bound: BOUNDS.age },
    ]);
  });

  it("a file cut short is called damaged, not another kind of file", () => {
    const whole = file({ horizon_years: entered(20, "years", day) });
    expect(readImport(whole.slice(0, Math.floor(whole.length / 2)), BOUNDS)).toEqual({ ok: false, refusal: { kind: "damaged" } });
    expect(readImport("{ not json", BOUNDS)).toEqual({ ok: false, refusal: { kind: "format" } });
  });
});
