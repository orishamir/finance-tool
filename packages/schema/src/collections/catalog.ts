// data/catalog/: institution-facing names. docs/data-schema.md §3.10.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, wrapperId } from "../value.ts";

export const catalogEntry = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  institution: z.string().min(1),
  where_seen: z.string().min(1),
  seen_on: isoDate,
  seen_by: z.string().min(1),
  names: z.strictObject({ he: z.array(z.string().min(1)).min(1) }),
  maps_to: z.strictObject({
    wrapper_id: wrapperId,
    cma_fund_id: z.number().int().nullable(),
    track_ids: z.array(z.number().int()),
  }),
  near_duplicates: z.array(
    z.strictObject({ name: z.string().min(1), track_ids: z.array(z.number().int()), resolution: z.string().min(1) }),
  ),
  status: z.enum(["catalogued", "not-catalogued-yet"]),
  notes: z.string().optional(),
  /** The institution's own statement that this is the track a joiner gets without choosing (data-schema §3.10). */
  default_at_joining: z.boolean().optional(),
});

export type CatalogEntry = z.infer<typeof catalogEntry>;
