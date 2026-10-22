// data/parameters/: site parameters. docs/data-schema.md §3.2.
// Parameter-specific fields (lo/hi bounds, thresholds, the fit table) are kept loose until the
// founder's first values are written (N1); each gets its own shape then.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";

export const parameterRecord = z.looseObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  method_id: z.string().regex(/^P-\d{2}$/),
  value: valueObject.optional(),
  rationale: z.string().min(1),
  signed_off_by: z.literal("founder"),
  signed_off_on: isoDate,
  shown_as: z.literal("site parameter"),
});

export type ParameterRecord = z.infer<typeof parameterRecord>;
