// data/instruments/exposures/: one record per exposure type. docs/data-schema.md §3.4.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, productId } from "../value.ts";

/** data-schema §3.4, `kind`. */
export const exposureKind = z.enum(["equity_index", "bond_index", "cash_like", "mixed", "commodity", "other"]);

export const exposureRecord = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id is lowercase ASCII, digits and single hyphens"),
  names: z.strictObject({ he: z.array(z.string().min(1)), en: z.array(z.string().min(1)) }),
  /** One Hebrew line on what the money is invested in (flows 6.6), shown under the h1 and on the guide list (added 2026-10-23). */
  one_line_he: z.string().min(1).optional(),
  kind: exposureKind,
  /** ISO 4217 code, e.g. "USD", "ILS". */
  currency: z.string().regex(/^[A-Z]{3}$/, "currency is an ISO 4217 code"),
  cash_like: z.boolean(),
  return_source: z.strictObject({ mode: z.enum(["entered", "series"]), series: z.string().min(1).nullable() }),
  /** Fund records under data/funds/, as `fund:<id>`; other entries are free text until the fund record exists. */
  variants: z.array(z.string().min(1)),
  /** Wrappers that can hold this exposure (data-schema §3.4). */
  wrapper_ids: z.array(productId).optional(),
  rule_ids: z.array(z.string().min(1)).optional(),
  open_questions: z.array(z.string().min(1)).optional(),
  /** S5 (2026-10-25): true when the index is made of Israeli companies. Left out for cash, bond and general tracks. */
  constituents_israeli: z.boolean().optional(),
  checked: isoDate,
});

export type ExposureRecord = z.infer<typeof exposureRecord>;
