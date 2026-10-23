// data/fees/: provider tariffs, dated snapshots. docs/data-schema.md §3.6.
// One file per provider per snapshot: fees/<provider-id>@<date>.json. In R1 only the list fees the
// illustrative guide timeline runs on are collected (method F-67, scenario S47); the workbench's
// averages, bands and minimums arrive with R4.
import { z } from "zod";
import { feeBase, isoDate, valueObject } from "../value.ts";

const ruleIds = z.array(z.string().min(1));

export const feeLine = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  base: feeBase,
  /** Wrapper IDs or instrument classes the line applies to (`all` for every one). */
  applies_to: z.array(z.string().min(1)).min(1),
  excludes: z.array(z.string()).optional(),
  excludes_rule_ids: ruleIds.optional(),
  /** D4: a list price, a regulator average, a TASE average. An `entered` line never lives under data/. */
  level: z.enum(["list", "regulator_average", "tase_average"]),
  rate: valueObject,
  min: valueObject.nullable(),
  max: valueObject.nullable(),
  spread: valueObject.nullable().optional(),
  period: z.enum(["month", "quarter", "year"]).nullable(),
  channel: z.string().nullable(),
  band: z.string().nullable(),
  statement_code: z.string().nullable(),
  /** The CMA fund number, when the line is for one track. */
  track_id: z.number().int().positive().optional(),
  /** A-19: how long a discount lasts, and the list fee it reverts to. */
  discount_months: valueObject.optional(),
  reverts_to: valueObject.optional(),
  names: z.strictObject({ tariff: z.array(z.string()) }),
});

export const feesSnapshot = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  provider: z.strictObject({
    name_he: z.string().min(1),
    class: z.enum(["bank", "broker", "provident-manager", "fund-manager", "insurer"]),
    regulator: z.enum(["BoI", "ISA", "CMA"]),
    tase_member: z.boolean(),
    protection_rule_ids: ruleIds,
  }),
  tariff: z.strictObject({
    url: z.string().min(1),
    title: z.string().min(1),
    published: isoDate.nullable(),
    format: z.enum(["pdf", "html", "xlsx"]),
  }),
  snapshot: isoDate,
  missing: z.boolean(),
  missing_reason: z.string().nullable(),
  lines: z.array(feeLine),
  averages: z.array(
    z.strictObject({
      line_id: z.string().min(1),
      level: z.enum(["regulator_average", "tase_average"]),
      band: z.string().nullable(),
      rate: valueObject,
    }),
  ),
  minimums: z.strictObject({ account_opening: valueObject.nullable() }),
  notice_rule_ids: ruleIds,
});

export type FeeLine = z.infer<typeof feeLine>;
export type FeesSnapshot = z.infer<typeof feesSnapshot>;
