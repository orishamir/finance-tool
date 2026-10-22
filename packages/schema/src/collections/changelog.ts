// data/changelog.jsonl: one line per change. docs/data-schema.md §3.12.
import { z } from "zod";
import { isoDate } from "../value.ts";

export const changelogLine = z.object({
  date: isoDate,
  collection: z.string().min(1),
  id: z.string().min(1),
  field: z.string().min(1),
  old: z.unknown(),
  new: z.unknown(),
  reason: z.string().min(1),
  affects_rankings: z.boolean(),
});

export type ChangelogLine = z.infer<typeof changelogLine>;
