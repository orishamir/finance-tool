// data/fund-lists/: the Maya export of Israeli mutual funds and TASE's list of foreign funds traded on TASE.
// docs/data-schema.md §3.14. Strict: a field the doc does not name is an error. Text is stored as the list prints it.
import { z } from "zod";
import { isoDate, source, valueObject } from "../value.ts";
import { seriesTerms } from "./series.ts";

/** The two lists; the file is `fund-lists/<list>@<snapshot>.json`. */
export const fundListId = z.enum(["maya-mutual-funds", "tase-foreign-funds"]);

const printed = z.string().min(1);
const fee = valueObject.nullable().optional();

export const fundListRow = z.strictObject({
  /** The fund (Maya) or security (TASE foreign list) number, as printed. */
  fund_number: printed,
  /** Only where the list prints it. */
  isin: printed.nullable(),
  names: z.strictObject({ he: z.array(printed).min(1) }),
  manager: printed,
  trustee: printed.nullable().optional(),
  /** Headings as printed, top to bottom (Maya: three; the TASE foreign list: the one it has). */
  classification: z.array(printed).min(1),
  characteristics: z.array(printed).optional(),
  /** The exposure code the list prints; null when it prints none. */
  exposure_code: printed.nullable(),
  reference_asset: printed.nullable().optional(),
  /** The tax track as printed; null when the list prints none. */
  tax_status: printed.nullable(),
  distribution_fee_class: printed.nullable().optional(),
  management_fee: fee,
  trustee_fee: fee,
  /** The list's own date for this row. */
  data_date: isoDate,
});

export const fundListFile = z.strictObject({
  list: fundListId,
  /** The date the list was saved; equals the `@<date>` in the file name. */
  snapshot: isoDate,
  source,
  checked: isoDate,
  /** Republishing terms (architecture 3.3): the file ships only when `status` is `confirmed`. */
  terms_of_use: seriesTerms,
  raw: z.strictObject({ archive_key: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }),
  funds: z.array(fundListRow),
});

export type FundListFile = z.infer<typeof fundListFile>;
