// data/cma/: CMA fund and track records. docs/data-schema.md §3.13.
import { z } from "zod";
import { isoDate, source, valueObject } from "../value.ts";

const cmaFund = z.object({
  fund_id: z.number().int().positive(),
  names: z.object({ cma: z.array(z.string().min(1)).min(1) }),
  managing_corporation: z.object({ name: z.string().min(1), legal_id: z.string().min(1) }),
  controlling_corporation: z.string(),
  fund_classification: z.string(),
  target_population: z.string(),
  specialization: z.string(),
  sub_specialization: z.string(),
  inception_date: isoDate.nullable(),
  // As received, kept beside the confirmed `fees` (CAT-35 to CAT-39, discovery O11).
  raw_fields: z.record(z.string(), z.string()),
  fees: z.object({ avg_annual_management_fee: valueObject, avg_deposit_fee: valueObject }),
  // NIS millions at the period end (D34, F-87, F-88); absent in files written before 2026-10-26.
  holdings: z.object({ total_assets: valueObject, stock_market_exposure: valueObject, foreign_currency_exposure: valueObject.optional() }).optional(),
});

export const cmaPeriodFile = z.object({
  dataset: z.enum(["gemelnet", "pensia-net"]),
  report_period: z.string().regex(/^\d{4}-\d{2}$/),
  source,
  checked: isoDate,
  raw: z.object({ archive_key: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }),
  funds: z.array(cmaFund),
});

export type CmaPeriodFile = z.infer<typeof cmaPeriodFile>;
