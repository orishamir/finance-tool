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
  /**
   * Optional: the hosts (without "www.") whose links the row may label (2026-10-26). A row that names where a copy is hosted ("נוסח
   * משולב באתר המוסד לביטוח לאומי") is limited to that host, so another copy of the same document keeps its own host's label.
   */
  hosts: z.array(z.string().min(1)).min(1).optional(),
  /** Optional working note; never shown. */
  note: z.string().optional(),
});

export const documentsTable = z.array(documentRow);

/**
 * One row of `institutions.json` (spec 2026-10-25-rules-scope §3): a company a rule's scope can name, so that an `institution` or
 * `unsettled` rule resolves to its page (`/companies/:id`: the CMA legal id of a managing company, else the fee snapshot or deposit
 * bank id of a bank or broker). A company with none of the three has no page on the site.
 */
export const institutionRow = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** The name the site shows (rule card, chip, search row, company section). */
  name_he: z.string().min(1),
  kind: z.enum(["provident-manager", "bank", "broker", "foreign-broker", "fund-manager", "insurer", "index-provider", "exchange", "regulator", "other"]),
  /**
   * The names the rule base writes in its `- Scope:` lines. A name two companies of one group share ("IBI": the broker and the fund
   * manager) is the default of one row and carries `only_records` on the other: the records where it means that company.
   */
  scope_names: z.array(z.strictObject({ name: z.string().min(1), only_records: z.array(z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/)).min(1).optional() })).min(1),
  /** The managing company's legal id in the CMA data (data/cma/), which is its page id. */
  cma_legal_id: z.string().regex(/^\d{9}$/).nullable(),
  /** The id of its fee snapshot under data/fees/. */
  fees_id: z.string().min(1).nullable(),
  /** The `bank` of its records under data/terms/deposits/. */
  deposit_bank_id: z.string().min(1).nullable(),
  /**
   * The hosts of its own sites, without "www." (a subdomain counts; a group's site serves each of its companies). A source there is the
   * company's own document, so a record that cites it is listed in the company's section; a press report or a forum post about the
   * company is not (review, 2026-10-26). Empty when no document of the company is collected.
   */
  own_hosts: z.array(z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/)),
  /** The names its filings on a filing host (Maya) open with: "הראל" for "הראל, דוח שנתי …". A fund manager's documents are filings. */
  filing_names: z.array(z.string().min(1)).min(1).optional(),
  /** Optional working note; never shown. */
  note: z.string().optional(),
});

export const institutionsTable = z.array(institutionRow);

/** A file under data/sources/ is one of the three tables. */
export const sourcesFile = z.union([publishersTable, documentsTable, institutionsTable]);

export type PublisherRow = z.infer<typeof publisherRow>;
export type DocumentRow = z.infer<typeof documentRow>;
export type InstitutionRegistryRow = z.infer<typeof institutionRow>;
