// The v2 state document: migration from the release 2 keys, the export file, import (add, replace, refusals) and
// "delete what was imported". The device storage is a fake, so nothing here touches a browser.
import { beforeEach, describe, expect, it } from "vitest";
import { emptyGoal } from "./goal";
import {
  STATE_KEY,
  applyImport,
  buildStateFile,
  ensureLoaded,
  exportFileName,
  flush,
  getSnapshot,
  importedCount,
  readImport,
  resetStore,
  saveHolding,
  stateFileText,
  updateState,
  withoutImported,
  type Holding,
  type StateV3,
} from "./state";
import { entered } from "./value";

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

const site = { version: "r3-test", data: "cma-test" };

function goalWithContent() {
  const g = emptyGoal(0);
  g.name = "הון לטווח ארוך";
  g.horizonYears = { value: 15, entered: true };
  return g;
}

let storage: FakeStorage;
beforeEach(() => {
  storage = new FakeStorage();
  resetStore(storage);
});

describe("migration from the release 2 keys", () => {
  it("reads the three v1 keys into one v2 document, then removes them after the write", () => {
    const g = goalWithContent();
    storage.setItem("mekor.v1.inputs", JSON.stringify({ entered: { "A-01": 6, amount_now: 30000 }, age: 22, employment: "employee" }));
    storage.setItem("mekor.v1.goals", JSON.stringify({ version: 1, goals: [g], currentId: g.id }));
    storage.setItem("mekor.v1.uncatalogued", JSON.stringify([{ name: "קרן X", date: "2026-10-01" }]));
    const snap = ensureLoaded();
    expect(snap.status).toBe("ok");
    expect(snap.state.goals).toHaveLength(1);
    expect(snap.state.currentId).toBe(g.id);
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

  it("keeps a goals document it cannot read under its own key and reports it", () => {
    storage.setItem("mekor.v1.goals", JSON.stringify({ version: 7, goals: [] }));
    storage.setItem("mekor.v1.inputs", JSON.stringify({ entered: {}, age: 30, employment: null }));
    const snap = ensureLoaded();
    expect(snap.status).toBe("old-version");
    flush();
    expect(storage.getItem("mekor.v1.goals")).not.toBeNull();
    expect(storage.getItem("mekor.v1.inputs")).toBeNull();
  });

  it("leaves a document of a newer version exactly as it is", () => {
    const raw = JSON.stringify({ version: 3, goals: [], whatever: true });
    storage.setItem(STATE_KEY, raw);
    expect(ensureLoaded().status).toBe("old-version");
    updateState((s) => ({ ...s, bank: "x" }));
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
  it("carries format, version, time, site ids and the state; blank goals are left out", () => {
    const state: StateV3 = { version: 3, savedComparisons: [], goals: [goalWithContent(), emptyGoal(1)], inputs: {}, holdings: [holding("a")], uncatalogued: [], imports: [] };
    const f = buildStateFile(state, site, new Date("2026-10-24T08:00:00Z"));
    expect(f).toMatchObject({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00.000Z", site });
    expect(f.state.goals).toHaveLength(1);
    expect(JSON.parse(stateFileText(f)).state.holdings[0].balance.value).toBe(80_000);
  });

  it("names the file by date, with -2 and -3 for repeats the same day", () => {
    expect(exportFileName("2026-10-24")).toBe("mekor-state-2026-10-24.json");
    expect(exportFileName("2026-10-24", 2)).toBe("mekor-state-2026-10-24-2.json");
    expect(exportFileName("2026-10-24", 3)).toBe("mekor-state-2026-10-24-3.json");
  });
});

describe("import", () => {
  const file = (state: unknown, version = 3) => JSON.stringify({ format: "mekor-state", version, exported: "2026-10-24T08:00:00Z", site, state });
  const base = (): StateV3 => ({ version: 3, savedComparisons: [], goals: [goalWithContent()], inputs: {}, holdings: [holding("a")], uncatalogued: [{ name: "קרן Y", seen: day }], imports: [] });

  it("reads a file it wrote, with the counts, and changes nothing on the device", () => {
    const r = readImport(file(base()));
    expect(r.ok && r.preview.counts).toEqual({ goals: 1, holdings: 1, names: 1, comparisons: 0 });
    expect(r.ok && r.preview.migrated).toBe(false);
    expect(storage.data.size).toBe(0);
  });

  it("refuses text that is not the site's format", () => {
    expect(readImport("דוח שנתי לעמית 2025")).toEqual({ ok: false, refusal: { kind: "format" } });
    expect(readImport(JSON.stringify({ hello: 1 }))).toEqual({ ok: false, refusal: { kind: "format" } });
  });

  it("refuses a newer version", () => {
    expect(readImport(file(base(), 4))).toEqual({ ok: false, refusal: { kind: "newer" } });
  });

  it("migrates a version 2 file: goals gain exposures, the document no saved comparisons, and a leftover visits field is ignored", () => {
    const { savedComparisons: _s, ...v2 } = base();
    const r = readImport(file({ ...v2, visits: { last: "2026-10-23" }, version: 2 }, 2));
    expect(r.ok && r.preview.migrated).toBe(true);
    expect(r.ok && r.preview.state.version).toBe(3);
    expect(r.ok && r.preview.state.goals[0]!.exposures).toEqual({});
    expect(r.ok && r.preview.state.savedComparisons).toEqual([]);
    expect(r.ok && "visits" in r.preview.state).toBe(false);
  });

  it("keeps an unreadable saved comparison as it is, and refuses a bare number in an exposure input", () => {
    const s = base() as unknown as { savedComparisons: unknown[]; goals: { exposures: Record<string, unknown> }[] };
    s.savedComparisons = [{ id: "x", goalId: s.goals[0] ? "g" : "", mode: "wrapper", savedOn: day }];
    expect(readImport(file(s)).ok).toBe(true);
    s.goals[0]!.exposures = { makam: { return: 3 } };
    const r = readImport(file(s));
    expect(!r.ok && r.refusal.kind === "invalid" && r.refusal.field.startsWith("goals.0.exposures.makam.return")).toBe(true);
  });

  it("migrates an older version (the goals document alone)", () => {
    const g = goalWithContent();
    const r = readImport(file({ version: 1, goals: [g], currentId: g.id }, 1));
    expect(r.ok && r.preview.migrated).toBe(true);
    expect(r.ok && r.preview.state.goals).toHaveLength(1);
  });

  it("refuses a bare number where a value object belongs, naming the field", () => {
    const s = base() as unknown as { holdings: { balance: unknown }[] };
    s.holdings[0]!.balance = 80_000;
    const r = readImport(file(s));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toMatchObject({ kind: "invalid" });
    expect(!r.ok && r.refusal.kind === "invalid" && r.refusal.field.startsWith("holdings.0.balance")).toBe(true);
  });

  it("refuses a holding with an unknown wrapper", () => {
    const s = base();
    (s.holdings[0] as { wrapperId: string }).wrapperId = "bitcoin";
    const r = readImport(file(s));
    expect(!r.ok && r.refusal).toEqual({ kind: "invalid", field: "holdings.0.wrapperId" });
  });

  it("add: appends with the imported tag and an order after the existing ones, skipping identical items", () => {
    const mine: StateV3 = { version: 3, savedComparisons: [], goals: [goalWithContent()], inputs: {}, holdings: [holding("a"), holding("m", { order: 1, company: { name: "חברה ב" } })], uncatalogued: [], imports: [] };
    mine.goals[0]!.id = "mine";
    const incoming = base();
    incoming.goals[0]!.id = "theirs";
    const r = applyImport(mine, incoming, "add", day);
    // holding "a" is identical to mine: skipped; the goal and the name are new
    expect(r.skipped).toBe(1);
    expect(r.added).toEqual({ goals: 1, holdings: 0, names: 1, comparisons: 0 });
    expect(r.state.holdings).toHaveLength(2);
    expect(r.state.goals.find((g) => g.id === "theirs")?.importedAt).toBe(day);
    expect(r.state.currentId).toBeUndefined();
    expect(importedCount(r.state)).toMatchObject({ goals: 1, holdings: 0, names: 1, total: 2 });
  });

  it("add: a holding with the same id and other content is kept as a new item", () => {
    const mine: StateV3 = { version: 3, savedComparisons: [], goals: [], inputs: {}, holdings: [holding("a")], uncatalogued: [], imports: [] };
    const theirs = { ...base(), goals: [], holdings: [holding("a", { balance: entered(1, "nis", day) })] };
    const r = applyImport(mine, theirs, "add", day);
    expect(r.state.holdings).toHaveLength(2);
    expect(r.state.holdings[1]!.importedAt).toBe(day);
    expect(r.state.holdings[1]!.order).toBe(1);
    expect(r.state.holdings[1]!.id).not.toBe("a");
  });

  it("replace: the file's state as it is", () => {
    const mine: StateV3 = { version: 3, savedComparisons: [], goals: [], inputs: {}, holdings: [holding("z")], uncatalogued: [], imports: [] };
    const r = applyImport(mine, base(), "replace", day);
    expect(r.state.holdings.map((h) => h.id)).toEqual(["a"]);
    expect(r.state.holdings[0]!.importedAt).toBeUndefined();
  });

  it("delete what was imported removes only the tagged items", () => {
    const mine: StateV3 = { version: 3, savedComparisons: [], goals: [], inputs: {}, holdings: [holding("z")], uncatalogued: [], imports: [] };
    const r = applyImport(mine, base(), "add", day);
    const cleaned = withoutImported(r.state);
    expect(cleaned.holdings.map((h) => h.id)).toEqual(["z"]);
    expect(cleaned.goals).toHaveLength(0);
    expect(cleaned.uncatalogued).toHaveLength(0);
  });

  it("an export, a cleared device and an import bring the holdings back", () => {
    ensureLoaded();
    saveHolding(holding("a"));
    saveHolding(holding("b", { order: 1 }));
    flush();
    const text = stateFileText(buildStateFile(getSnapshot().state, site));
    resetStore(new FakeStorage());
    ensureLoaded();
    const r = readImport(text);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const out = applyImport(getSnapshot().state, r.preview.state, "add", day);
    expect(out.state.holdings.map((h) => h.id)).toEqual(["a", "b"]);
  });
});
