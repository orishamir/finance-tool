// data/fees/: provider tariffs, dated snapshots. docs/data-schema.md §3.6.
// One file per provider per snapshot: fees/<provider-id>@<date>.json. In R1 only the list fees the
// illustrative guide timeline runs on are collected (method F-67, scenario S47); the workbench's
// averages, bands and minimums arrive with R4.
import { z } from "zod";
import { feeBase, instrumentClass, isoDate, valueObject } from "../value.ts";

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
  /** S2 (2026-10-25): a cap as a share of the trade value (unit `pct_of_trade`): commission = min(cap x trade, max(min, rate x base)). */
  cap: valueObject.optional(),
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

/** S3 (2026-10-25): sourced availability of an instrument class at the provider. */
export const availabilityEntry = z.strictObject({
  applies_to: z.array(instrumentClass).min(1),
  available: z.boolean(),
  source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate }),
  note: z.string().optional(),
});

export const feesSnapshot = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  provider: z.strictObject({
    name_he: z.string().min(1),
    class: z.enum(["bank", "broker", "foreign_broker", "provident-manager", "fund-manager", "insurer"]),
    regulator: z.enum(["BoI", "ISA", "CMA", "foreign"]),
    /** S1 (2026-10-25): required when `regulator` is `foreign`. */
    regulator_foreign: z.strictObject({ name: z.string().min(1), name_he: z.string().min(1), country: z.string().min(1) }).optional(),
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
  availability: z.array(availabilityEntry).optional(),
})
  .superRefine((snap, ctx) => {
    const { regulator, regulator_foreign } = snap.provider;
    if (regulator === "foreign" && !regulator_foreign)
      ctx.addIssue({ code: "custom", path: ["provider", "regulator_foreign"], message: 'regulator "foreign" requires regulator_foreign' });
    if (regulator !== "foreign" && regulator_foreign)
      ctx.addIssue({ code: "custom", path: ["provider", "regulator_foreign"], message: 'regulator_foreign is only for regulator "foreign"' });
  });

export type FeeLine = z.infer<typeof feeLine>;
export type FeesSnapshot = z.infer<typeof feesSnapshot>;
