// What a saved deal says of where it came from, on the indices page's pair card (H): the house's price list it was filled from and that
// list's date, the fees the person changed from it, and the day it was saved. Pure; no Hebrew.
import type { HouseTemplate } from "../fee-deal/templates";
import type { Fee, FeeDeal } from "../fee-deal/model";
import type { FeeKindId } from "../fee-deal/shapes";
import { dealHouseId } from "./plan";

export interface DealBasis {
  /** The house whose whole price list filled the deal, by its id, and the list's name as the deal keeps it. */
  house: string;
  name: string;
  /** The day the list's figures were read (their sources' latest), YYYY-MM-DD; null where none of its figures is left. */
  date: string | null;
  /** The fees changed from the list, each once in the deal's order: a figure typed, a fee added, and the list's fees taken away. */
  changed: { kind: FeeKindId; name?: string }[];
}

/** Each figure of a fee (`Num`, anywhere in it): `v` with its source where the list filled it, none where the person typed it. */
function figures(x: unknown, out: { v: number; src?: { checked: string } }[] = []): { v: number; src?: { checked: string } }[] {
  if (Array.isArray(x)) for (const y of x) figures(y, out);
  else if (x && typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (typeof o.v === "number" && Object.keys(o).every((k) => k === "v" || k === "src" || k === "blank")) out.push(o as { v: number; src?: { checked: string } });
    else for (const y of Object.values(o)) figures(y, out);
  }
  return out;
}

/** A fee the person changed: one of its figures typed (no source), or none of them the list's (a fee added). */
const changedFee = (f: Fee): boolean => {
  const all = figures(f);
  return all.length === 0 || all.some((n) => !n.src) || f.name !== undefined;
};

/** Where a deal filled from a house's whole list came from, and what was changed from it; null for a deal filled from none. */
export function dealBasis(deal: FeeDeal, houses: readonly Pick<HouseTemplate, "id" | "fees">[]): DealBasis | null {
  const house = dealHouseId(deal);
  if (!house || !deal.template) return null;
  const dates = deal.fees.flatMap((f) => figures(f).flatMap((n) => (n.src ? [n.src.checked] : []))).sort();
  const listKinds = houses.find((h) => h.id === house)?.fees.map((f) => f.kind) ?? [];
  const changed = deal.fees.filter((f) => changedFee(f) || !listKinds.includes(f.kind)).map((f) => ({ kind: f.kind, ...(f.name ? { name: f.name } : {}) }));
  const gone = [...new Set(listKinds.filter((k) => !deal.fees.some((f) => f.kind === k)))].map((kind) => ({ kind }));
  return { house, name: deal.template.name, date: dates.at(-1) ?? null, changed: [...changed, ...gone] };
}
