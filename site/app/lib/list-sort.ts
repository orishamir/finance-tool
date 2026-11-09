// A sortable list's order as its column heads set it and the address keeps it: `?sort=<column>&order=reverse`, the default left out.

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
