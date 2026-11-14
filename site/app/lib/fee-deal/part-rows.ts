// The rows a fee's table stands its parts in (method §10.6, F-114): the price, then its bounds, then the rest of its parts, then its notes.
// The layout's table and the edits of a table's cells (edits/cells.ts) both read them. Pure; no Hebrew.
import type { PartId } from "./offers/parts";

/**
 * The rows of a fee's table, in the order they stand everywhere: the price, then its bounds, then the rest of its parts, then its notes.
 * The price's forms share one row (a case free and another charged stand side by side), and so do the notes.
 */
export const PART_ROWS = ["price", "min", "max", "cap", "flat", "maxPerSecurity", "discount", "third", "until", "offset", "refund", "notes"] as const;
export type PartRow = (typeof PART_ROWS)[number];

/** The row each part stands in: keyed by the part registry's ids, so a new part has a row before it compiles. */
export const ROW_OF: Readonly<Record<PartId, PartRow>> = {
  share: "price",
  perUnit: "price",
  perAction: "price",
  held: "price",
  sum: "price",
  free: "price",
  min: "min",
  max: "max",
  cap: "cap",
  flat: "flat",
  maxPerSecurity: "maxPerSecurity",
  discount: "discount",
  third: "third",
  until: "until",
  offset: "offset",
  refund: "refund",
  unfilled: "notes",
  unfilledClerk: "notes",
  unfilledClerkAbroad: "notes",
  capRead: "notes",
  partial: "notes",
  inTrade: "notes",
  sale: "notes",
};

/** The row a part stands in: a later price's parts stand with the month the price before it ends, in its own row. */
export const rowOf = (p: { id: PartId; stage?: number }): PartRow => (p.stage ? "until" : ROW_OF[p.id]);

export const isPartRow = (row: string): row is PartRow => (PART_ROWS as readonly string[]).includes(row);
