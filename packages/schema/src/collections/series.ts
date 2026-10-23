// data/series/<id>.json: sourced time series (dependency 7). docs/data-schema.md §3.8.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, unit, valueObject } from "../value.ts";

/**
 * The terms gate (docs/architecture.md 3.3, product.md dependency 7): a series ships only when the
 * publisher's terms allow republication. `unconfirmed` and `not-permitted` are valid values so a file can
 * say so; the validator then fails it ("terms gate: not shipped").
 */
export const termsStatus = z.enum(["confirmed", "unconfirmed", "not-permitted"]);

export const seriesTerms = z.strictObject({
  status: termsStatus,
  /** What the site does when the status is not `confirmed` (link out, show no number, ...). */
  fallback: z.string().min(1),
  /** The licence or terms page that was read. */
  terms_url: z.string().min(1).optional(),
  read_on: isoDate.optional(),
  /** The attribution line the licence prescribes; shown next to the numbers. */
  attribution: z.string().min(1).optional(),
});

/** One observation: a value object plus its `date`, and a `key` for a series that holds several (multi-key). */
export const seriesObservation = valueObject.and(
  z.object({
    date: isoDate,
    /** Multi-key series only, e.g. `<bank>|<plan>|<age>|<period>|<metric>`; unique per date. */
    key: z.string().min(1).optional(),
  }),
);

export const seriesRecord = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  names: z.strictObject({ he: z.array(z.string().min(1)).min(1), en: z.array(z.string().min(1)).optional() }),
  publisher: z.string().min(1),
  flow: z.string().min(1),
  series_code: z.string().min(1),
  unit,
  cadence: z.enum(["daily", "monthly", "on change"]),
  stale_after_days: z.number().int().positive(),
  terms_of_use: seriesTerms,
  rule_ids: z.array(z.string().min(1)),
  /** Free text: base period, how the file is thinned, what a value means. */
  notes: z.string().min(1).optional(),
  /** Evidence for the latest download that changed the file: archive key (GitHub release asset) and sha256. Written by the pipeline. */
  raw: z.strictObject({ archive_key: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).optional(),
  observations: z.array(seriesObservation),
});

export type SeriesRecord = z.infer<typeof seriesRecord>;
export type SeriesObservation = z.infer<typeof seriesObservation>;
