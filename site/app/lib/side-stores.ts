// The four side stores the export file carries beside the state document (audit 2026-10-24, A32): the entered offers
// (`mekor.v2.offers`), the variant assumptions (`mekor.v2.variants`) and the playbook ticks (`mekor.v2.playbook-ticks`).
// Each is owned by its own module (lib/offers.ts, lib/variants.ts, lib/playbook.ts) through `device-store.ts`; this file
// only reads and writes their storage keys, checks every item, and merges. The merge of the three INTO the state
// document is pending the founder's approval (roadmap), so the document's version stays 3.
//
// File shape (`StateFile.sideStores`, optional: a file from before this carries none):
//   { offers: EnteredOffer[], variantAssumptions: { [exposureId]: FundAssumptions }, playbookTicks: { [key]: string[] },
//     ownRates: { [goalId]: { [wrapperId]: pctPerYear | { rate?, fee?, provider? } } } }  (an object form holds an entered fee, 2026-10-24, and the provider id chosen for the brokerage wrapper, 2026-10-24; an unknown provider id is read and ignored)   (ownRates added 2026-10-24 (sweep); a file without it reads as none;
//   a tick key of the old `wrapper|from|to` shape is folded into the wrapper's key on import)
// Keys of the stores are kept verbatim (a tick key is whatever lib/playbook.ts writes), so a change of the tick keying
// there needs nothing here.
import { valueObject } from "@finance-tool/schema";
import { parseOwnRates, type OwnRates } from "./own-rate";
import { migrateTickKeys } from "./playbook";

export const SIDE_KEYS = { offers: "mekor.v2.offers", variants: "mekor.v2.variants", ticks: "mekor.v2.playbook-ticks", ownRates: "mekor.v2.own-rates" } as const;
/** What the last "add" imports put into the side stores (a `SideStores` holding only those items), so "מחיקת מה שיובא" can take exactly them out. */
export const IMPORTED_SIDE_KEY = "mekor.v2.imported-side";

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

export interface SideStores {
  offers: Rec[];
  variantAssumptions: Record<string, Rec>;
  playbookTicks: Record<string, string[]>;
  /** goal id -> wrapper id -> % a year (lib/own-rate.ts); absent in a file from before the own-rate store. */
  ownRates: OwnRates;
}

export const emptySide = (): SideStores => ({ offers: [], variantAssumptions: {}, playbookTicks: {}, ownRates: {} });

export interface SideCounts {
  offers: number;
  variants: number;
  ticks: number;
  ownRates: number;
}

export const noSideCounts = (): SideCounts => ({ offers: 0, variants: 0, ticks: 0, ownRates: 0 });
const countRates = (r: OwnRates) => Object.values(r).reduce((n, w) => n + Object.keys(w).length, 0);

export function sideCounts(s: SideStores): SideCounts {
  return { offers: s.offers.length, variants: Object.keys(s.variantAssumptions).length, ticks: Object.values(s.playbookTicks).reduce((n, ids) => n + ids.length, 0), ownRates: countRates(s.ownRates) };
}

export const sideTotal = (s: SideStores) => {
  const c = sideCounts(s);
  return c.offers + c.variants + c.ticks + c.ownRates;
};

export const sideIsEmpty = (s: SideStores) => {
  const c = sideCounts(s);
  return c.offers + c.variants + c.ticks + c.ownRates === 0;
};

export interface SideProblem {
  /** Which side store and which item, for the message. */
  store: "offers" | "variants" | "ticks" | "ownRates";
  item: string;
  reason: "structure" | "not-number";
}

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// ---------------------------------------------------------------- checking one item

/** Every value object under an offer's lines (and its date) must be one, with a finite number or a text. */
function offerProblem(o: unknown): "structure" | "not-number" | null {
  if (!isRec(o) || typeof o.providerId !== "string" || o.providerId === "" || !isRec(o.lines) || typeof o.savedAt !== "string") return "structure";
  const vos: unknown[] = [];
  const l = o.lines;
  for (const k of ["trade", "custody", "fx"] as const) {
    const line = l[k];
    if (line === undefined) continue;
    if (!isRec(line)) return "structure";
    vos.push(line.rate, line.min, line.max);
    if (k === "custody" && !(num(line.everyMonths) && line.everyMonths > 0)) return "not-number";
  }
  vos.push(l.monthlyFee, o.offeredOn);
  for (const v of vos) {
    if (v === undefined) continue;
    const r = valueObject.safeParse(v);
    if (!r.success) return "structure";
    if (r.data.unit === "text") continue;
    if (!num(r.data.value) || r.data.value < 0) return "not-number";
  }
  if (l.trade === undefined && l.custody === undefined && l.fx === undefined && l.monthlyFee === undefined) return "structure";
  return null;
}

function assumptionsProblem(v: unknown): "structure" | "not-number" | null {
  if (!isRec(v)) return "structure";
  if (v.fxChange !== undefined && !num(v.fxChange)) return "not-number";
  if (v.w8ben !== undefined && typeof v.w8ben !== "boolean") return "structure";
  if (v.fxStart !== undefined) {
    if (!isRec(v.fxStart)) return "structure";
    for (const n of Object.values(v.fxStart)) if (!num(n) || n <= 0) return "not-number";
  }
  if (v.distributions !== undefined) {
    if (!isRec(v.distributions)) return "structure";
    for (const d of Object.values(v.distributions)) {
      if (!isRec(d) || !num(d.yield) || d.yield < 0 || !num(d.perYear) || ![1, 2, 3, 4, 6, 12].includes(d.perYear)) return "not-number";
    }
  }
  return null;
}

/** Reads the `sideStores` of an import file: what is sound, and one problem per item that is not. */
export function readSideFile(raw: unknown): { side: SideStores | null; problems: SideProblem[] } {
  if (raw === undefined) return { side: null, problems: [] };
  const problems: SideProblem[] = [];
  const side = emptySide();
  if (!isRec(raw)) return { side: null, problems: [{ store: "offers", item: "", reason: "structure" }] };
  if (raw.offers !== undefined) {
    if (!Array.isArray(raw.offers)) problems.push({ store: "offers", item: "", reason: "structure" });
    else
      for (const o of raw.offers) {
        const p = offerProblem(o);
        if (p) problems.push({ store: "offers", item: isRec(o) && typeof o.providerId === "string" ? o.providerId : "", reason: p });
        else if (!side.offers.some((x) => x.providerId === (o as Rec).providerId)) side.offers.push(o as Rec);
      }
  }
  if (raw.variantAssumptions !== undefined) {
    if (!isRec(raw.variantAssumptions)) problems.push({ store: "variants", item: "", reason: "structure" });
    else
      for (const [id, v] of Object.entries(raw.variantAssumptions)) {
        const p = assumptionsProblem(v);
        if (p) problems.push({ store: "variants", item: id, reason: p });
        else side.variantAssumptions[id] = v as Rec;
      }
  }
  if (raw.playbookTicks !== undefined) {
    if (!isRec(raw.playbookTicks)) problems.push({ store: "ticks", item: "", reason: "structure" });
    else
      for (const [k, ids] of Object.entries(raw.playbookTicks)) {
        if (!Array.isArray(ids) || !ids.every((x) => typeof x === "string")) problems.push({ store: "ticks", item: k, reason: "structure" });
        else side.playbookTicks[k] = [...new Set(ids as string[])];
      }
  }
  if (raw.ownRates !== undefined) {
    if (!isRec(raw.ownRates)) problems.push({ store: "ownRates", item: "", reason: "structure" });
    else {
      side.ownRates = parseOwnRates(raw.ownRates);
      for (const [goal, rates] of Object.entries(raw.ownRates)) {
        const kept = side.ownRates[goal] ?? {};
        if (!isRec(rates)) problems.push({ store: "ownRates", item: goal, reason: "structure" });
        else for (const [w, v] of Object.entries(rates)) if (!(w in kept)) problems.push({ store: "ownRates", item: `${goal}/${w}`, reason: num(v) || isRec(v) ? "not-number" : "structure" });
      }
    }
  }
  // a tick key written by the old keying folds into its wrapper's key (lib/playbook.ts)
  side.playbookTicks = migrateTickKeys(side.playbookTicks);
  return { side, problems };
}

// ---------------------------------------------------------------- the device

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

function readDoc(s: Storage, key: string): Rec | null {
  try {
    const raw = s.getItem(key);
    const v = raw ? JSON.parse(raw) : null;
    return isRec(v) && v.version === 1 ? v : null;
  } catch {
    return null;
  }
}

/** What the device holds in the three keys (items that do not check out are left out, as the stores themselves drop them). */
export function readSideStores(s: Storage | null): SideStores {
  const out = emptySide();
  if (!s) return out;
  const o = readDoc(s, SIDE_KEYS.offers);
  if (o && Array.isArray(o.offers)) for (const x of o.offers) if (!offerProblem(x)) out.offers.push(x as Rec);
  const v = readDoc(s, SIDE_KEYS.variants);
  if (v && isRec(v.byExposure)) for (const [id, a] of Object.entries(v.byExposure)) if (!assumptionsProblem(a)) out.variantAssumptions[id] = a as Rec;
  const t = readDoc(s, SIDE_KEYS.ticks);
  if (t && isRec(t.byKey)) for (const [k, ids] of Object.entries(t.byKey)) if (Array.isArray(ids) && ids.every((x) => typeof x === "string")) out.playbookTicks[k] = ids as string[];
  const r = s.getItem(SIDE_KEYS.ownRates);
  try {
    out.ownRates = r ? parseOwnRates(JSON.parse(r)) : {};
  } catch {
    out.ownRates = {};
  }
  return out;
}

/** The items the last imports added (see IMPORTED_SIDE_KEY), empty when none. */
export function readImportedSide(s: Storage | null): SideStores {
  if (!s) return emptySide();
  try {
    const raw = s.getItem(IMPORTED_SIDE_KEY);
    if (!raw) return emptySide();
    const j = JSON.parse(raw);
    const out = emptySide();
    if (isRec(j) && Array.isArray(j.offers)) out.offers = j.offers.filter((o: unknown) => isRec(o) && typeof o.providerId === "string") as Rec[];
    if (isRec(j) && isRec(j.variantAssumptions)) out.variantAssumptions = j.variantAssumptions as Record<string, Rec>;
    if (isRec(j) && isRec(j.playbookTicks)) for (const [k, ids] of Object.entries(j.playbookTicks)) if (Array.isArray(ids)) out.playbookTicks[k] = ids.filter((x) => typeof x === "string");
    if (isRec(j)) out.ownRates = parseOwnRates(j.ownRates);
    return out;
  } catch {
    return emptySide();
  }
}

/** Takes the items an "add" import brought out of the device's side stores (those not since replaced by the person), and forgets the record. */
export function removeImportedSide(s: Storage | null): boolean {
  if (!s) return false;
  const imp = readImportedSide(s);
  const dev = readSideStores(s);
  const offers = dev.offers.filter((o) => !imp.offers.some((x) => x.providerId === o.providerId && JSON.stringify(x) === JSON.stringify(o)));
  const variantAssumptions = Object.fromEntries(Object.entries(dev.variantAssumptions).filter(([id, a]) => !(id in imp.variantAssumptions && JSON.stringify(imp.variantAssumptions[id]) === JSON.stringify(a))));
  const playbookTicks: Record<string, string[]> = {};
  for (const [k, ids] of Object.entries(dev.playbookTicks)) {
    const left = ids.filter((id) => !(imp.playbookTicks[k] ?? []).includes(id));
    if (left.length > 0) playbookTicks[k] = left;
  }
  const ownRates: OwnRates = {};
  for (const [g, rates] of Object.entries(dev.ownRates)) {
    const left = Object.fromEntries(Object.entries(rates).filter(([w, v]) => JSON.stringify(imp.ownRates[g]?.[w]) !== JSON.stringify(v)));
    if (Object.keys(left).length > 0) ownRates[g] = left;
  }
  const ok = writeSideStores(s, { offers, variantAssumptions, playbookTicks, ownRates });
  try {
    s.removeItem(IMPORTED_SIDE_KEY);
  } catch {
    return false;
  }
  return ok;
}

/** The result of merging a file's side stores into the device's. */
export interface SideMerge {
  merged: SideStores;
  added: SideCounts;
  /** Items the file had that the device already held (same provider, same exposure, same tick). */
  skipped: number;
  /** Only the items this merge put in (for the "delete what was imported" record). */
  addedItems: SideStores;
}

/**
 * "Add": an offer of a provider the device already has stays as it is (the device's own wins), a variant assumption of an
 * exposure likewise, and ticks are a union. "Replace": each store takes the file's (a file with no `sideStores`
 * leaves them as they are).
 */
export function mergeSide(device: SideStores, file: SideStores | null, mode: "add" | "replace"): SideMerge {
  if (!file) return { merged: device, added: noSideCounts(), skipped: 0, addedItems: emptySide() };
  if (mode === "replace") return { merged: file, added: sideCounts(file), skipped: 0, addedItems: emptySide() };
  let skipped = 0;
  const added = noSideCounts();
  const addedItems = emptySide();
  const offers = [...device.offers];
  for (const o of file.offers) {
    if (offers.some((x) => x.providerId === o.providerId)) skipped += 1;
    else {
      offers.push(o);
      addedItems.offers.push(o);
      added.offers += 1;
    }
  }
  const variantAssumptions = { ...device.variantAssumptions };
  for (const [id, a] of Object.entries(file.variantAssumptions)) {
    if (id in variantAssumptions) skipped += 1;
    else {
      variantAssumptions[id] = a;
      addedItems.variantAssumptions[id] = a;
      added.variants += 1;
    }
  }
  const playbookTicks: Record<string, string[]> = Object.fromEntries(Object.entries(device.playbookTicks).map(([k, v]) => [k, [...v]]));
  for (const [k, ids] of Object.entries(file.playbookTicks)) {
    const have = (playbookTicks[k] ??= []);
    for (const id of ids) {
      if (have.includes(id)) skipped += 1;
      else {
        have.push(id);
        (addedItems.playbookTicks[k] ??= []).push(id);
        added.ticks += 1;
      }
    }
  }
  const ownRates: OwnRates = Object.fromEntries(Object.entries(device.ownRates).map(([g, r]) => [g, { ...r }]));
  for (const [g, rates] of Object.entries(file.ownRates)) {
    for (const [w, v] of Object.entries(rates)) {
      if (ownRates[g]?.[w] !== undefined) skipped += 1;
      else {
        (ownRates[g] ??= {})[w] = v;
        (addedItems.ownRates[g] ??= {})[w] = v;
        added.ownRates += 1;
      }
    }
  }
  return { merged: { offers, variantAssumptions, playbookTicks, ownRates }, added, skipped, addedItems };
}

/** Writes the three keys and tells the stores of this page (a `storage` event reaches only other tabs on its own). Returns whether the device kept them. */
export function writeSideStores(s: Storage | null, side: SideStores): boolean {
  if (!s) return false;
  const docs: [string, unknown][] = [
    [SIDE_KEYS.offers, { version: 1, offers: side.offers }],
    [SIDE_KEYS.variants, { version: 1, byExposure: side.variantAssumptions }],
    [SIDE_KEYS.ticks, { version: 1, byKey: side.playbookTicks }],
    [SIDE_KEYS.ownRates, side.ownRates],
  ];
  let ok = true;
  for (const [key, doc] of docs) {
    try {
      s.setItem(key, JSON.stringify(doc));
      if (typeof window !== "undefined" && typeof StorageEvent !== "undefined") window.dispatchEvent(new StorageEvent("storage", { key }));
    } catch {
      ok = false;
    }
  }
  return ok;
}
