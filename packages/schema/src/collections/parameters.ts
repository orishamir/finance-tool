// data/parameters/: site parameters. docs/data-schema.md §3.2.
// Parameter-specific fields (lo/hi bounds, thresholds, the fit table) are kept loose until the
// founder's first values are written (N1); each gets its own shape then.
import { z } from "zod";
import { valueObject } from "../value.ts";

/**
 * P-05 `instruments` (data-schema §3.2): per wrapper id, the data records of the representative instrument the
 * illustrative run takes its terms from. Each key names a record by id; which keys a wrapper needs is in
 * docs/method.md §2.4 "Instrument terms".
 */
export const instrumentSpec = z.strictObject({
  /** `data/terms/deposits/` record id (deposit family). */
  deposit_terms: z.string().min(1).optional(),
  /** `data/funds/` record id (securities family). */
  fund: z.string().min(1).optional(),
  /** `data/fees/` provider id whose list lines are the tariff (securities, makam, bond). */
  tariff: z.string().min(1).optional(),
  /** `data/fees/` provider id of the IRA manager's balance line (`ira-hishtalmut`, F-51). */
  ira_fees: z.string().min(1).optional(),
  /** `data/rules/` GOV rule id whose figures give the series (bond: linkage, coupon_every_months; makam: term_months). */
  series_rule: z.string().min(1).optional(),
  /**
   * A CMA `fund_id` (latest `data/cma/` period): the track whose regulator average fees (`avg_annual_management_fee`,
   * `avg_deposit_fee`) the run uses for a provident-family wrapper when no managing company publishes a list fee
   * for it (method §2.4). The run labels them as an average actually charged, not a list price. Where a managing company does publish
   * one, the run prices that list (F-80, D56) and the track only names the class whose averages the fee page compares with (F-68, D88).
   */
  track: z.number().int().positive().optional(),
  /** Who chose this instrument when it was not chosen with the record (D88: the provident fund for investing's track). */
  chosen_by: z.string().min(1).optional(),
  /** `keren-hishtalmut` only: the employment type the illustrative run uses (an employee's salary would come from the person's entered profile). */
  employment: z.enum(["self-employed", "employee"]).optional(),
});

/**
 * One segment of a stepped slider: it runs from where the one before ended (or the slider's `min`) to `to`, in steps of `step`. The last
 * segment has no `to`: it runs to the slider's `max`.
 */
const sliderSegment = z.strictObject({ to: valueObject.optional(), step: valueObject });

/**
 * What is wrong with a stretch of a slider from `from` to `to` in steps of `step`, each fault in its own words: it must grow, its step must
 * be above zero, and its length a whole number of steps (the kit's `steppedScale` throws on any of these).
 */
function stepFaults(from: number, to: number, step: number): string[] {
  const faults: string[] = [];
  if (!(to > from)) faults.push(`${from} to ${to} does not grow`);
  if (!(step > 0)) faults.push(`the step ${step} is not above zero`);
  else if (to > from) {
    const count = (to - from) / step;
    if (Math.abs(count - Math.round(count)) > 1e-9) faults.push(`${from} to ${to} is not a whole number of steps of ${step}`);
  }
  return faults;
}

/**
 * P-05 `sliders` (data-schema §3.2): one slider's range. A linear slider (years, a return) has `step`; a money slider has `segments`
 * instead, each taking an equal part of the track, so its steps grow with the amount (design guideline "Fields"). A linear slider's
 * range, and each segment, grows by a whole number of its steps, above zero. `start` is the change chart's opening share (F-90).
 */
export const sliderRange = z
  .strictObject({ min: valueObject, max: valueObject, step: valueObject.optional(), segments: z.array(sliderSegment).min(1).optional(), start: valueObject.optional() })
  .superRefine((r, ctx) => {
    if ((r.step === undefined) === (r.segments === undefined)) ctx.addIssue({ code: "custom", message: "a slider has either a step or segments, not both and not neither" });
    const min = Number(r.min.value);
    const max = Number(r.max.value);
    if (r.step) for (const fault of stepFaults(min, max, Number(r.step.value))) ctx.addIssue({ code: "custom", path: ["step"], message: `slider: ${fault}` });
    const segments = r.segments;
    if (!segments) return;
    let from = min;
    for (const [i, seg] of segments.entries()) {
      const last = i === segments.length - 1;
      if (last && seg.to !== undefined) ctx.addIssue({ code: "custom", path: ["segments", i, "to"], message: "the last segment runs to max and has no `to` of its own" });
      if (!last && seg.to === undefined) ctx.addIssue({ code: "custom", path: ["segments", i], message: "a segment before the last needs its `to`" });
      const to = last ? max : seg.to === undefined ? null : Number(seg.to.value);
      // a segment without its end can't be measured, nor any after it
      if (to === null) return;
      for (const fault of stepFaults(from, to, Number(seg.step.value))) ctx.addIssue({ code: "custom", path: ["segments", i], message: `segment ${i + 1}: ${fault}` });
      from = to;
    }
  });

export type SliderRange = z.infer<typeof sliderRange>;

export const parameterRecord = z.looseObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  method_id: z.string().regex(/^P-\d{2}$/),
  value: valueObject.optional(),
  rationale: z.string().min(1),
  rationale_he: z.string().min(1).optional(),
  shown_as: z.literal("site parameter"),
  /** P-05 only. */
  instruments: z.record(z.string().min(1), instrumentSpec).optional(),
  /** P-05 only. */
  sliders: z.record(z.string().min(1), sliderRange).optional(),
});

export type ParameterRecord = z.infer<typeof parameterRecord>;
