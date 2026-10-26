// data/rules/: rule figures the engine reads. docs/data-schema.md §3.1.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";
import { ruleScope, scopeInstitution } from "../scope.ts";

const bracket = z.object({ up_to: valueObject, rate: valueObject });

const figure = z.union([
  valueObject,
  z.object({ by_tax_year: z.record(z.string().regex(/^\d{4}$/), valueObject) }),
  z.array(bracket),
]);

/** The strength vocabulary of a source entry (value.ts without `open` and `entered`). */
const sourceStrength = z.enum(["primary", "primary-mirror", "institution", "secondary"]);

/**
 * One source of a rule, read from the `- Source:` line of the rule base by `packages/pipeline/scripts/extract-sources.ts`
 * (docs/data-schema.md §3.1). Entries are sorted by preference: regulator or ministry document, Knesset gazette,
 * Wikisource, Nevo, institution, article.
 */
export const ruleSource = z.object({
  url: z.string().url(),
  /** As the markdown wrote it (an English working title is allowed). */
  title: z.string().min(1),
  /** The document's Hebrew name (documents.json, or a Hebrew markdown title). */
  title_he: z.string().min(1).optional(),
  /** English, from data/sources/publishers.json by host (fallback: the host). */
  publisher: z.string().min(1),
  publisher_he: z.string().min(1).optional(),
  kind: z.enum(["law", "regulation", "circular", "regulator_page", "official_pdf", "exchange_rules", "institution_doc", "article", "dataset", "form", "other"]),
  strength: sourceStrength,
  /** Set iff `strength` is primary-mirror; `other` is a copy of an official text on a host that is neither Wikisource nor Nevo. */
  mirror_host: z.enum(["wikisource", "nevo", "other"]).optional(),
  /** Raw, as written: "s. 3(ה4)(3)", "reg. 2(א)(7)", "pp. 27–30". */
  locator: z.string().optional(),
  /** "סעיף 3(ה4)(3)", "תקנה 2(א)(7)", "עמודים 27 עד 30". */
  locator_he: z.string().optional(),
  /** First page, for "#page=" on a PDF link. */
  page: z.number().int().positive().optional(),
  /** Wikisource section id without "#", e.g. "סעיף_3.ה4". */
  anchor: z.string().optional(),
  /** The document's own words, verbatim, Hebrew, at most 240 characters; only when the markdown holds them inside quotes. */
  quote: z.string().optional(),
  checked: isoDate,
  /** "(historical)", "(unofficial consolidation)" ... */
  qualifier: z.string().optional(),
  /** English working note; never shown. */
  note: z.string().optional(),
});

export type RuleSource = z.infer<typeof ruleSource>;

export const ruleRecord = z
  .object({
    id: z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/),
    title: z.string().min(1),
    strength: z.enum(["primary", "primary-mirror", "institution", "secondary", "open"]),
    dimensions: z.array(z.string()),
    likely_to_change: z.enum(["yes", "no"]),
    recheck_date: isoDate.nullable().optional(),
    figures: z.record(z.string(), figure).optional(),
    /** 2-4 sentences of plain Hebrew shown on the rule card; `title` (English) stays the key the rules page falls back to. */
    /** Hebrew title for lists and cards (added 2026-10-23); the English `title` stays the fallback. */
    title_he: z.string().min(1).optional(),
    text_he: z.string().min(1).optional(),
    /** Figure key to Hebrew name, for the rule card. */
    figure_names_he: z.record(z.string(), z.string().min(1)).optional(),
    /** Who it applies to (D30), extracted from the `- Scope:` line of the rule base (data-schema §3.1, spec 2026-10-25-rules-scope §1). */
    scope: ruleScope,
    /** `institution`: the companies whose own term it is (required); `unsettled`: the companies whose documents were seen ("seen at"), if any. */
    scope_institutions: z.array(scopeInstitution).min(1).optional(),
    /** `unsettled` only: what would settle it, as the rule base writes it (English working text, never shown). */
    scope_settle: z.string().min(1).optional(),
    /** Where the rule comes from, extracted from the rule base (data-schema §3.1). */
    sources: z.array(ruleSource).min(1).optional(),
    /** Why `sources` is absent: the raw Source line when it names no link. */
    sources_missing_reason: z.string().optional(),
    /** Rules this one is derived from or points to (chips on the card). A general rule's are general (D30: it never rests on a company's term). */
    derived_from: z.array(z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/)).optional(),
    /**
     * A general rule's pointers to companies' terms (its Source line names them beside the general source): named examples of how a
     * company applies it (spec §1), never a derivation. The card shows them under "לדוגמה" (review, 2026-10-26).
     */
    examples: z.array(z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/)).optional(),
    il_finance_file: z.string().regex(/\.md$/),
    checked: isoDate,
  })
  .refine((r) => r.strength !== "open" || r.figures === undefined, {
    message: "an open rule carries no figures (data-schema §4 item 3)",
    path: ["figures"],
  })
  .refine((r) => r.likely_to_change !== "yes" || !!r.recheck_date, {
    message: "a rule likely to change needs a recheck_date (product.md 3.8)",
    path: ["recheck_date"],
  })
  .refine((r) => r.scope !== "institution" || (r.scope_institutions?.length ?? 0) > 0, {
    message: "an institution rule names its companies in scope_institutions (D30)",
    path: ["scope_institutions"],
  })
  .refine((r) => (r.scope === "unsettled") === !!r.scope_settle, {
    message: "scope_settle is set exactly when the scope is unsettled (D30)",
    path: ["scope_settle"],
  })
  .refine((r) => r.scope === "general" || r.examples === undefined, {
    message: "only a general rule carries examples (its pointers to companies' terms)",
    path: ["examples"],
  })
  .refine((r) => r.scope !== "general" || r.scope_institutions === undefined, {
    message: "a general rule names no companies in scope_institutions (a company is a named example in its text)",
    path: ["scope_institutions"],
  });

export type RuleRecord = z.infer<typeof ruleRecord>;
