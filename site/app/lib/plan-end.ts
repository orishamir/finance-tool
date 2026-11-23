// F-22: the savings plans whose own terms, read into their records, run the plan as one term from its start: a deposit every month from
// the start up to the month before the term ends, each deposit's interest from its own date to the end, and all of it paid out at the
// end. The run takes such a plan's pieces to mature at the plan's end (the engine's `planEnd`), and the savings plan guide's picture runs
// only such a plan. Any other plan's terms are not read so, and the run locks each instalment for the term from its own month (G-42).

/** By record id, the fields of the record whose notes quote the terms that say so. */
export const planEndPlans: Readonly<Record<string, string>> = {
  // Leumi's fixed-rate instalment form (pikadon_ribit_p.pdf) ss.2.1, 2.2, 2.3.1 and 4.1, and its general terms 310-93 ss.2.4 and 2.1.6,
  // quoted in the notes of the record's `term_months` and `rate_offered`, read 2026-11-23
  "leumi-tashlumim-shekeli-3y": "term_months, rate_offered",
};

/** Whether a savings plan's record is one whose terms are read as paying every deposit out at the plan's end. */
export const paysAtPlanEnd = (recordId: string): boolean => Object.hasOwn(planEndPlans, recordId);
