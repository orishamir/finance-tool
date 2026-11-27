// data/open-questions.json: one entry per numbered open question of the rule base (docs/data-schema.md §3.15).
// `id` and `status` are generated from the markdown (packages/pipeline/scripts/gen-open-questions.ts); `title_he` and `blocks_he`
// are written by hand and kept when the script runs again; `answered_by` and `meanwhile_he` are not carried over by it yet, so they stay
// empty until it keeps them. An answered question is deleted from the markdown once its answer is in a
// rule, so the file lists only open and narrowed questions. Strict.
import { z } from "zod";

/** `TX2 OQ6`: the prefix of the rule-base file, then the item's number. */
export const openQuestionId = z.string().regex(/^[A-Z][A-Z0-9]* OQ\d+$/, "an open-question id is `<PREFIX> OQ<n>`");

export const openQuestionStatus = z.enum(["open", "narrowed"]);

export const openQuestionEntry = z.strictObject({
  id: openQuestionId,
  status: openQuestionStatus,
  /** One short Hebrew line: what is unknown, in plain words (the question sheet's title). */
  title_he: z.string().min(1).optional(),
  /** What on the site waits for the answer, in Hebrew; only where something does. */
  blocks_he: z.string().min(1).optional(),
  /** The rules that hold the part of the answer already found (rule ids): what narrowed the question. */
  answered_by: z.array(z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/)).min(1).optional(),
  /** What the site does meanwhile, in Hebrew, apart from what waits for the answer (`blocks_he`); only where it does something. */
  meanwhile_he: z.string().min(1).optional(),
});

export const openQuestionsFile = z.array(openQuestionEntry).refine((list) => new Set(list.map((q) => q.id)).size === list.length, { message: "an id appears twice" });

export type OpenQuestionEntry = z.infer<typeof openQuestionEntry>;
export type OpenQuestionStatus = z.infer<typeof openQuestionStatus>;
