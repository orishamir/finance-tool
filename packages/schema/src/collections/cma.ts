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
  // The average annual yields of the last 3 and 5 years, percent per year, nominal and before management fees (CAT-04, CAT-05); absent in files written before 2026-11-03.
  yields: z.object({ avg_annual_yield_3y: valueObject, avg_annual_yield_5y: valueObject }).optional(),
  // Closed to new members on its managing company's own terms (its bylaws or its own pages), with the rules that quote them, as the
  // pipeline's track readings hold it (`company-closed`); absent where no reading closes it so. The data keeps such a track; the site
  // leaves it out (D51).
  closed_to_joiners: z.strictObject({ by: z.enum(["company-terms"]), rule_ids: z.array(z.string().min(1)).min(1) }).optional(),
  // Whether new members may join is open, with the open question that holds it, as the rule base writes it ("CAT-OQ36"), as the
  // pipeline's track readings hold it (`unsettled`); absent where a reading settles it. The data and the site keep such a track, and the
  // site says the question is open beside it.
  joining_open: z.strictObject({ open_question: z.string().min(1) }).optional(),
});

/** Whether a stored track takes new members as far as the readings say: false where its company's own terms close it (`closed_to_joiners`, D51). */
export const takesNewMembers = (fund: { closed_to_joiners?: unknown }): boolean => fund.closed_to_joiners === undefined;

/** The open question that holds whether a stored track takes new members (`joining_open`), or null where the readings settle it. */
export const joiningQuestion = (fund: { joining_open?: { open_question: string } }): string | null => fund.joining_open?.open_question ?? null;

export const cmaPeriodFile = z.object({
  dataset: z.enum(["gemelnet", "pensia-net"]),
  report_period: z.string().regex(/^\d{4}-\d{2}$/),
  source,
  checked: isoDate,
  raw: z.object({ archive_key: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }),
  funds: z.array(cmaFund),
});

export type CmaPeriodFile = z.infer<typeof cmaPeriodFile>;
