// data/sources/: the two hand tables the source extraction reads (research/knowledge/2026-10-24-synthesis.md §3.2).
// `publishers.json` names every host a rule source points at; `documents.json` names the recurring documents.
import { z } from "zod";

export const sourceKind = z.enum(["law", "regulation", "circular", "regulator_page", "official_pdf", "exchange_rules", "institution_doc", "article", "dataset", "form", "other"]);

/** One row of `publishers.json`, keyed by host without "www.". */
export const publisherRow = z.strictObject({
  publisher: z.string().min(1),
  publisher_he: z.string().min(1),
  kind: sourceKind,
  mirror: z.enum(["wikisource", "nevo", "other"]).nullable(),
});

export const publishersTable = z.record(z.string().min(1), publisherRow);

/** One row of `documents.json`: a recurring document, matched by substrings of the markdown link titles or the url. */
export const documentRow = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  match: z.array(z.string().min(1)).min(1),
  title_he: z.string().min(1),
  publisher_he: z.string().min(1),
  kind: sourceKind,
  official_url: z.string().min(1).nullable(),
  /** Optional working note; never shown. */
  note: z.string().optional(),
});

export const documentsTable = z.array(documentRow);

/** A file under data/sources/ is one of the two tables. */
export const sourcesFile = z.union([publishersTable, documentsTable]);

export type PublisherRow = z.infer<typeof publisherRow>;
export type DocumentRow = z.infer<typeof documentRow>;
