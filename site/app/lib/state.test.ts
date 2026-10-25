// The v2 state document: migration from the release 2 keys, the export file, import (add, replace, refusals) and
// "delete what was imported". The device storage is a fake, so nothing here touches a browser.
import { beforeEach, describe, expect, it } from "vitest";
import { emptyGoal } from "./goal";
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
import { readSideStores, sideCounts, type SideStores } from "./side-stores";
import { HORIZON_MAX, HORIZON_MIN } from "./goal-limits";

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
    expect(r.ok && r.preview.counts).toEqual({ goals: 1, holdings: 1, names: 1, comparisons: 0, offers: 0, variants: 0, ticks: 0, ownRates: 0 });
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

  it("keeps an unreadable saved comparison as it is, and leaves out a goal with a bare number in an exposure input", () => {
    const s = base() as unknown as { savedComparisons: unknown[]; goals: { exposures: Record<string, unknown> }[] };
    s.savedComparisons = [{ id: "x", goalId: s.goals[0] ? "g" : "", mode: "wrapper", savedOn: day }];
    expect(readImport(file(s)).ok).toBe(true);
    s.goals[0]!.exposures = { makam: { return: 3 } };
    // the goal with the bare number is left out of the load and named (A33), the rest of the file loads
    const r = readImport(file(s));
    expect(r.ok && r.preview.state.goals).toHaveLength(0);
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "goal", at: 1, field: "exposures", problem: "structure" }]);
  });

  it("migrates an older version (the goals document alone)", () => {
    const g = goalWithContent();
    const r = readImport(file({ version: 1, goals: [g], currentId: g.id }, 1));
    expect(r.ok && r.preview.migrated).toBe(true);
    expect(r.ok && r.preview.state.goals).toHaveLength(1);
  });

  it("leaves out a holding whose balance is a bare number, naming the field", () => {
    const s = base() as unknown as { holdings: { balance: unknown }[] };
    s.holdings[0]!.balance = 80_000;
    const r = readImport(file(s));
    expect(r.ok && r.preview.state.holdings).toHaveLength(0);
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "holding", at: 1, field: "balance", problem: "structure" }]);
  });

  it("leaves out a holding with an unknown wrapper", () => {
    const s = base();
    (s.holdings[0] as { wrapperId: string }).wrapperId = "bitcoin";
    const r = readImport(file(s));
    expect(r.ok && r.preview.rejected).toEqual([{ kind: "holding", at: 1, field: "wrapperId", problem: "wrapper" }]);
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


// ---------------------------------------------------------------- audit 2026-10-24 (A33, A69): the same file twice, hand-edited files

describe("import twice in add mode (A33, A69)", () => {
  const file = (state: unknown, extra: Record<string, unknown> = {}) => JSON.stringify({ format: "mekor-state", version: 3, exported: "2026-10-24T08:00:00Z", site, state, ...extra });
  const theirs = (): StateV3 => {
    const g = goalWithContent();
    g.id = "theirs";
    g.order = 0;
    return { version: 3, goals: [g], currentId: "theirs", inputs: {}, holdings: [holding("a")], uncatalogued: [{ name: "קרן Y", seen: day }], imports: [], savedComparisons: [{ id: "c1", goalId: "theirs", mode: "wrapper", savedOn: day } as never] };
  };
  const mine = (): StateV3 => {
    const g = goalWithContent();
    g.id = "mine";
    g.name = "שלי";
    return { version: 3, goals: [g], currentId: "mine", inputs: {}, holdings: [holding("m", { company: { name: "חברה ב" } })], uncatalogued: [], imports: [], savedComparisons: [] };
  };

  it("adds nothing the second time, and the count says so", () => {
    const incoming = theirs();
    const first = applyImport(mine(), incoming, "add", day);
    expect(first.added).toEqual({ goals: 1, holdings: 1, names: 1, comparisons: 1 });
    expect(first.firstAddedGoalId).toBe("theirs");
    expect(first.state.currentId).toBe("mine");
    const second = applyImport(first.state, incoming, "add", day);
    expect(second.added).toEqual({ goals: 0, holdings: 0, names: 0, comparisons: 0 });
    expect(second.skipped).toBe(4);
    expect(second.firstAddedGoalId).toBeUndefined();
    expect(second.state.goals).toHaveLength(2);
    expect(second.state.holdings).toHaveLength(2);
    expect(second.state.savedComparisons).toHaveLength(1);
    // a third time, a day later: still nothing
    const third = applyImport(second.state, incoming, "add", "2026-10-25");
    expect(third.state.goals).toHaveLength(2);
    expect(third.state.savedComparisons).toHaveLength(1);
  });

  it("a goal added under a new id (same id, other content) is not added again either", () => {
    const clash = theirs();
    clash.goals[0]!.id = "mine";
    clash.goals[0]!.name = "אחר";
    clash.savedComparisons = [];
    const first = applyImport(mine(), clash, "add", day);
    expect(first.added.goals).toBe(1);
    const second = applyImport(first.state, clash, "add", day);
    expect(second.added.goals).toBe(0);
    expect(second.state.goals).toHaveLength(2);
  });

  it("two holdings of the person's own that read alike are both kept by an import into an empty device", () => {
    const s = { ...mine(), goals: [], holdings: [holding("a"), holding("b", { order: 1 })] };
    const r = applyImport(emptyOf(), s, "add", day);
    expect(r.state.holdings.map((h) => h.id)).toEqual(["a", "b"]);
  });

  const emptyOf = (): StateV3 => ({ version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] });

  it("a hand-edited goal is left out field by field, and nothing NaN reaches the state", () => {
    const s = theirs();
    s.savedComparisons = [];
    const bad = (over: (g: ReturnType<typeof goalWithContent>) => void, id: string) => {
      const g = goalWithContent();
      g.id = id;
      over(g);
      return g;
    };
    s.goals = [
      s.goals[0]!,
      bad((g) => ((g.horizonYears as { value: unknown }).value = "ten"), "g-ten"),
      bad((g) => (g.amountNow = { value: -99_999, entered: true }), "g-neg"),
      bad((g) => (g.horizonYears = { value: HORIZON_MAX + 1, entered: true }), "g-long"),
      bad((g) => (g.horizonYears = { value: 7.5, entered: true }), "g-frac"),
      bad((g) => (g.profile.salary = -1), "g-salary"),
      bad((g) => (g.assumptions.acceptedFall = 150), "g-fall"),
    ];
    s.currentId = "g-ten";
    const r = readImport(file(s));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.preview.rejected).toEqual([
      { kind: "goal", at: 2, field: "horizonYears", problem: "not-number" },
      { kind: "goal", at: 3, field: "amountNow", problem: "negative" },
      { kind: "goal", at: 4, field: "horizonYears", problem: "years" },
      { kind: "goal", at: 5, field: "horizonYears", problem: "years" },
      { kind: "goal", at: 6, field: "salary", problem: "negative" },
      { kind: "goal", at: 7, field: "acceptedFall", problem: "over-100" },
    ]);
    expect(r.preview.state.goals.map((g) => g.id)).toEqual(["theirs"]);
    expect(r.preview.state.currentId).toBeUndefined();
    expect(JSON.stringify(r.preview.state)).not.toMatch(/NaN|null,"entered":true/);
  });

  it("a hand-edited holding and guide input are left out with their field", () => {
    const s = theirs();
    s.goals = [];
    s.savedComparisons = [];
    s.holdings = [holding("a"), holding("neg", { balance: entered(-5, "nis", day) }), holding("fee", { feeBalance: entered(140, "pct_per_year", day) }), holding("date", { statementDate: text("אתמול") }), holding("gain", { embeddedGain: entered(900_000, "nis", day) })];
    s.inputs = { amount_now: { ...entered(1, "nis", day), value: "הרבה" as never } };
    const r = readImport(file(s));
    expect(r.ok && r.preview.rejected).toEqual([
      { kind: "holding", at: 2, field: "balance", problem: "negative" },
      { kind: "holding", at: 3, field: "feeBalance", problem: "over-100" },
      { kind: "holding", at: 4, field: "statementDate", problem: "date" },
      { kind: "holding", at: 5, field: "embeddedGain", problem: "gain-over-balance" },
      { kind: "input", at: "amount_now", field: "amount_now", problem: "not-number" },
    ]);
    expect(r.ok && r.preview.state.holdings.map((h) => h.id)).toEqual(["a"]);
  });

  it("the horizon bounds are the goal form's (data/parameters/goal-presets.json ranges)", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const doc = JSON.parse(readFileSync(resolve(__dirname, "../../../data/parameters/goal-presets.json"), "utf8"));
    expect(doc.ranges.horizon_years.min.value).toBe(HORIZON_MIN);
    expect(doc.ranges.horizon_years.max.value).toBe(HORIZON_MAX);
  });
});

// ---------------------------------------------------------------- audit 2026-10-24 (A32): the side stores in the file

describe("side stores in the export file (A32)", () => {
  const offer = { providerId: "p1", lines: { trade: { rate: entered(0.1, "pct", day) } }, savedAt: day };
  const device = (): SideStores => ({ offers: [offer], variantAssumptions: { "index-sp500": { fxChange: 2, w8ben: true } }, playbookTicks: { "keren-hishtalmut": ["s1", "s2"] }, ownRates: { g1: { "bank-deposit": 3.5 } } });
  const seed = (s: FakeStorage, side: SideStores) => {
    s.setItem("mekor.v2.offers", JSON.stringify({ version: 1, offers: side.offers }));
    s.setItem("mekor.v2.variants", JSON.stringify({ version: 1, byExposure: side.variantAssumptions }));
    s.setItem("mekor.v2.playbook-ticks", JSON.stringify({ version: 1, byKey: side.playbookTicks }));
    s.setItem("mekor.v2.own-rates", JSON.stringify(side.ownRates));
  };

  it("the keys are the ones the stores write", async () => {
    const { OFFERS_KEY } = await import("./offers");
    const { VARIANTS_KEY } = await import("./variants");
    const { TICKS_KEY } = await import("./playbook");
    const { SIDE_KEYS } = await import("./side-stores");
    expect([SIDE_KEYS.offers, SIDE_KEYS.variants, SIDE_KEYS.ticks, SIDE_KEYS.ownRates]).toEqual([OFFERS_KEY, VARIANTS_KEY, TICKS_KEY, "mekor.v2.own-rates"]);
  });

  it("reads the three keys, writes them into the file, and a second device takes them back; the same file again adds nothing", () => {
    seed(storage, device());
    const side = readSideStores(storage);
    expect(sideCounts(side)).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    ensureLoaded();
    saveHolding(holding("a"));
    const text = stateFileText(buildStateFile(getSnapshot().state, site, new Date(), side));
    expect(JSON.parse(text).version).toBe(3);

    const other = new FakeStorage();
    resetStore(other);
    ensureLoaded();
    const r = readImport(text);
    expect(r.ok && r.preview.counts).toMatchObject({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    if (!r.ok) return;
    const first = applySideImport(r.preview.side, "add");
    expect(first.added).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    expect(readSideStores(other)).toEqual(side);
    const again = applySideImport(r.preview.side, "add");
    expect(again.added).toEqual({ offers: 0, variants: 0, ticks: 0, ownRates: 0 });
    expect(again.skipped).toBe(5);
    expect(readSideStores(other)).toEqual(side);
  });

  it("add keeps the device's own offer and unions the ticks; replace takes the file's", () => {
    seed(storage, { ...device(), playbookTicks: { k: ["s1"] } });
    const file: SideStores = { offers: [{ ...offer, savedAt: "2026-01-01" }], variantAssumptions: {}, playbookTicks: { k: ["s1", "s9"] }, ownRates: {} };
    const added = applySideImport(file, "add");
    expect(added.merged.offers[0]!.savedAt).toBe(day);
    expect(added.merged.playbookTicks.k).toEqual(["s1", "s9"]);
    const replaced = applySideImport(file, "replace");
    expect(readSideStores(storage).offers[0]!.savedAt).toBe("2026-01-01");
    expect(replaced.merged.variantAssumptions).toEqual({});
  });

  it("an item that fails its check is left out and named; a file with no side stores leaves the device's alone", () => {
    seed(storage, device());
    const bad = { ...JSON.parse(stateFileText(buildStateFile(emptyOf2(), site, new Date(), device()))) };
    bad.sideStores.offers.push({ providerId: "p2", lines: { trade: { rate: { ...entered(0.1, "pct", day), value: -3 } } }, savedAt: day });
    bad.sideStores.variantAssumptions.x = { fxChange: "הרבה" };
    bad.sideStores.playbookTicks.k = [1];
    const r = readImport(JSON.stringify(bad));
    expect(r.ok && r.preview.sideProblems).toEqual([
      { store: "offers", item: "p2", reason: "not-number" },
      { store: "variants", item: "x", reason: "not-number" },
      { store: "ticks", item: "k", reason: "structure" },
    ]);
    expect(r.ok && r.preview.counts).toMatchObject({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
    const none = applySideImport(null, "replace");
    expect(none.added).toEqual({ offers: 0, variants: 0, ticks: 0, ownRates: 0 });
    expect(sideCounts(readSideStores(storage))).toEqual({ offers: 1, variants: 1, ticks: 2, ownRates: 1 });
  });

  it("a state with only side stores is not an empty export", async () => {
    const { isEmptyState } = await import("./state");
    expect(isEmptyState(emptyOf2())).toBe(true);
    expect(isEmptyState(emptyOf2(), device())).toBe(false);
  });

  it("an old-shaped tick key in a file folds into its wrapper's key on import", () => {
    const f = JSON.parse(stateFileText(buildStateFile(emptyOf2(), site, new Date(), device())));
    f.sideStores.playbookTicks = { "keren-hishtalmut|a|b": ["s1"], "keren-hishtalmut|c|d": ["s2"], other: ["x"] };
    const r = readImport(JSON.stringify(f));
    expect(r.ok && r.preview.side?.playbookTicks).toEqual({ "keren-hishtalmut": ["s1", "s2"], other: ["x"] });
  });

  it("a file without own rates reads as none; an own rate out of range is named", () => {
    const f = JSON.parse(stateFileText(buildStateFile(emptyOf2(), site, new Date(), device())));
    delete f.sideStores.ownRates;
    expect(readImport(JSON.stringify(f)).ok && sideCounts((readImport(JSON.stringify(f)) as { preview: { side: SideStores } }).preview.side).ownRates).toBe(0);
    f.sideStores.ownRates = { g1: { "bank-deposit": 3, makam: 400 } };
    const r = readImport(JSON.stringify(f));
    expect(r.ok && r.preview.sideProblems).toEqual([{ store: "ownRates", item: "g1/makam", reason: "not-number" }]);
  });

  it("delete-imported takes out the side items an add import brought, and only those", async () => {
    const { deleteImported, importedSideCount } = await import("./state");
    seed(storage, { offers: [], variantAssumptions: {}, playbookTicks: { keren: ["own"] }, ownRates: {} });
    const file: SideStores = { ...device(), playbookTicks: { keren: ["own", "s1"] } };
    const r = applySideImport(file, "add");
    expect(r.added).toEqual({ offers: 1, variants: 1, ticks: 1, ownRates: 1 });
    expect(importedSideCount()).toBe(4);
    deleteImported();
    expect(importedSideCount()).toBe(0);
    expect(readSideStores(storage)).toEqual({ offers: [], variantAssumptions: {}, playbookTicks: { keren: ["own"] }, ownRates: {} });
  });

  it("replace leaves nothing tagged as imported", async () => {
    const { importedSideCount } = await import("./state");
    applySideImport(device(), "add");
    applySideImport(device(), "replace");
    expect(importedSideCount()).toBe(0);
  });
});

const emptyOf2 = (): StateV3 => ({ version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] });

describe("the index page's saved state (D28)", () => {
  const nikkei = { id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: day };

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
    const read = readImport(stateFileText(file));
    if (!read.ok) throw new Error("refused");
    expect(read.preview.state.customIndices).toEqual([nikkei]);
    removeCustomIndex("custom-nikkei");
    expect(getSnapshot().state.customIndices).toBeUndefined();
  });

  it("loads a document saved before this release, and leaves out a custom index that fails its shape", () => {
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
    const base: StateV3 = { version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] };
    const merged = applyImport({ ...base, customIndices: [nikkei] }, { ...base, customIndices: [nikkei, { id: "custom-b", name: "ב", israeli: true, added: day }] }, "add", day);
    expect(merged.state.customIndices!.map((c) => c.id)).toEqual(["custom-nikkei", "custom-b"]);
  });
});
