// A sortable list's order as its column heads set it and the address keeps it: `?sort=<column>&order=reverse`, the default left out.
import { useAddressParams } from "./hooks";

export interface ListSort<Id extends string> {
  id: Id;
  /** 1: the column's natural order; -1: reversed. */
  dir: 1 | -1;
}

/** A press on a column head: another column starts in its natural order; the same column again reverses it. */
export const pressSort = <Id extends string>(s: ListSort<Id>, id: Id): ListSort<Id> => (s.id === id ? { id, dir: s.dir === 1 ? -1 : 1 } : { id, dir: 1 });

/** The order the address asks for, when `sort` names one of `ids`. */
export function sortFromParams<Id extends string>(params: URLSearchParams, ids: readonly Id[]): ListSort<Id> | null {
  const id = params.get("sort");
  return id !== null && (ids as readonly string[]).includes(id) ? { id: id as Id, dir: params.get("order") === "reverse" ? -1 : 1 } : null;
}

/** The address parameters that keep an order: none for the default. */
export const sortParams = <Id extends string>(s: ListSort<Id>, byDefault: ListSort<Id>): Record<"sort" | "order", string | null> => ({
  sort: s.id === byDefault.id && s.dir === byDefault.dir ? null : s.id,
  order: s.dir === -1 ? "reverse" : null,
});

/**
 * A list sorted by its column heads, its order kept in the address. `chosen` is the order the address asks for, or the default; `press`
 * is a column head's handler: it takes the order in force (a page may set `chosen` aside where a column does not sort the rows shown)
 * and the list's element: where the list's top has scrolled up past its scroll margin, the list starts again from its first row, with
 * the pressed head in view.
 */
export function useAddressSort<Id extends string>(ids: readonly Id[], byDefault: ListSort<Id>): {
  chosen: ListSort<Id>;
  set: (s: ListSort<Id>) => void;
  press: (id: Id, inForce: ListSort<Id>, list?: HTMLElement | null) => void;
} {
  const { params, update } = useAddressParams();
  const chosen = sortFromParams(params, ids) ?? byDefault;
  const set = (s: ListSort<Id>) => update(sortParams(s, byDefault));
  const press = (id: Id, inForce: ListSort<Id>, list?: HTMLElement | null) => {
    set(pressSort(inForce, id));
    if (list && list.getBoundingClientRect().top < parseFloat(getComputedStyle(list).scrollMarginTop)) list.scrollIntoView({ block: "start", behavior: "instant" });
  };
  return { chosen, set, press };
}
