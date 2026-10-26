// data/open-questions.json: one entry per numbered open question of the rule base (docs/data-schema.md §3.15, 2026-10-26).
// `id`, `status` and `closed_on` are generated from the markdown (packages/pipeline/scripts/gen-open-questions.ts);
// `title_he` and `blocks_he` are written by hand and kept when the script runs again. Strict.
import { z } from "zod";
import { isoDate } from "../value.ts";

/** `TX2 OQ6`: the prefix of the rule-base file, then the item's number. */
export const openQuestionId = z.string().regex(/^[A-Z][A-Z0-9]* OQ\d+$/, "an open-question id is `<PREFIX> OQ<n>`");

export const openQuestionStatus = z.enum(["open", "narrowed", "closed"]);

export const openQuestionEntry = z
  .strictObject({
    id: openQuestionId,
    status: openQuestionStatus,
    /** The date of the closure in the rule base's struck line; set exactly when `status` is `closed`. */
    closed_on: isoDate.optional(),
    /** One short Hebrew line: what is unknown, in plain words (the question sheet's title). */
    title_he: z.string().min(1).optional(),
    /** What on the site waits for the answer, in Hebrew; only where something does. */
    blocks_he: z.string().min(1).optional(),
  })
  .refine((q) => (q.status === "closed") === (q.closed_on !== undefined), { message: "closed_on is set exactly when status is closed", path: ["closed_on"] });

export const openQuestionsFile = z.array(openQuestionEntry).refine((list) => new Set(list.map((q) => q.id)).size === list.length, { message: "an id appears twice" });

export type OpenQuestionEntry = z.infer<typeof openQuestionEntry>;
export type OpenQuestionStatus = z.infer<typeof openQuestionStatus>;
