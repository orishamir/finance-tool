// data/averages/: the fees a house actually charged on average, as an official publication reports them. docs/data-schema.md §3.9.
// One file per house per snapshot: averages/tase-<provider-id>@<date>.json. Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";

const thousands = z.number().nonnegative().nullable();

/**
 * A portfolio band as the sheet prints it, in thousands of shekels of the securities portfolio as its band header says (`band_header_he`): its words and
 * the bounds they state (`above` exclusive, `up_to` inclusive; `null` where the band is open at that end).
 */
export const averagesBand = z
  .strictObject({ text_he: z.string().min(1), above_thousands_nis: thousands, up_to_thousands_nis: thousands })
  .refine((b) => b.above_thousands_nis === null || b.up_to_thousands_nis === null || b.above_thousands_nis < b.up_to_thousands_nis, { message: "a band's lower bound is below its upper bound" });

/**
 * One cell of a member's sheet in TASE's fee calculator: the average fee the house charged over the reporting period, for one kind of fee and
 * of security and one portfolio band. `fee` is `trade` (a share of the trade, `pct_of_trade`) or `custody` (a yearly share of the value held,
 * `pct_per_year`, whatever the period of the house's own custody line); `securities` is the column's kind: for a trade `il_shares_bonds`,
 * `il_makam` or `foreign`, for custody `il` or `foreign`. `column_he` is the column's heading as printed. A cell the sheet leaves empty is a
 * value of `null` with a note. Shown beside the house's list price for reference only; no calculation reads it (F-122).
 */
export const averagesRow = z
  .strictObject({
    fee: z.enum(["trade", "custody"]),
    securities: z.enum(["il_shares_bonds", "il_makam", "foreign", "il"]),
    column_he: z.string().min(1),
    band: averagesBand,
    rate: valueObject,
  })
  .superRefine((r, ctx) => {
    const kinds = r.fee === "trade" ? ["il_shares_bonds", "il_makam", "foreign"] : ["il", "foreign"];
    if (!kinds.includes(r.securities)) ctx.addIssue({ code: "custom", path: ["securities"], message: `a ${r.fee} average is of ${kinds.join(", ")}` });
    const unit = r.fee === "trade" ? "pct_of_trade" : "pct_per_year";
    if (r.rate.unit !== unit) ctx.addIssue({ code: "custom", path: ["rate", "unit"], message: `a ${r.fee} average is in ${unit}` });
    if (r.rate.value !== null && typeof r.rate.value !== "number") ctx.addIssue({ code: "custom", path: ["rate", "value"], message: "an average is a number, or null with a note" });
  });

/** A list row of the member's sheet, each cell as printed (`unit: text`), `null` where the cell is empty; the member's report, not its price list. */
export const averagesListRow = z.strictObject({
  desc_he: z.string().min(1),
  no_service: z.boolean(),
  amount: valueObject.nullable(),
  min: valueObject.nullable(),
  max: valueObject.nullable(),
});

/**
 * TASE's fee calculator, one record per member whose house has a record under `data/fees/` (BRK-15, BRK-33): the average fees the member
 * actually charged over a reporting period, by band and kind, and the list rows of its sheet. `page` is the calculator's public page, each
 * figure's source the member's sheet. `exceptional_message_he` is the sheet's note on what the member serves, `member_tariff_link` the link it
 * gives to the member's price list, `card_date_as_printed` the date on the member's card in the comparison view.
 */
export const taseMemberFees = z
  .strictObject({
    id: z.string().regex(/^tase-[a-z0-9-]+$/),
    kind: z.literal("tase_member_fees"),
    provider_id: z.string().regex(/^[a-z0-9-]+$/),
    member: z.strictObject({ tase_id: z.number().int().positive(), name_he: z.string().min(1) }),
    page: z.strictObject({ url: z.string().min(1), title: z.string().min(1), publisher: z.string().min(1), checked: isoDate }),
    exceptional_message_he: z.string().min(1).nullable(),
    member_tariff_link: z.string().min(1).nullable(),
    averages: z.strictObject({
      period: z.strictObject({ from: isoDate, to: isoDate }),
      band_header_he: z.string().min(1),
      band_note_he: z.string().min(1).nullable(),
      definitions_he: z.strictObject({ trade: z.string().min(1), custody: z.string().min(1) }),
      comment_he: z.string().min(1).nullable(),
      rows: z.array(averagesRow).min(1),
    }),
    list: z.strictObject({
      updated: isoDate.nullable(),
      header_he: z.array(z.string().min(1)),
      comment_he: z.string().min(1).nullable(),
      rows: z.array(averagesListRow),
    }),
    card_date_as_printed: z.string().min(1).nullable(),
    snapshot: isoDate,
  })
  .superRefine((r, ctx) => {
    if (r.id !== `tase-${r.provider_id}`) ctx.addIssue({ code: "custom", path: ["id"], message: `id is tase-<provider_id> (tase-${r.provider_id})` });
    const { from, to } = r.averages.period;
    if (from > to) ctx.addIssue({ code: "custom", path: ["averages", "period"], message: "the period ends before it starts" });
    const seen = new Set<string>();
    // the bands of one column do not overlap: (above, up_to] intervals, an open end reaching every portfolio on that side
    const bands = new Map<string, { above: number; upTo: number; i: number }[]>();
    r.averages.rows.forEach((row, i) => {
      const col = `${row.fee}|${row.securities}`;
      const band = { above: row.band.above_thousands_nis ?? -Infinity, upTo: row.band.up_to_thousands_nis ?? Infinity, i };
      for (const other of bands.get(col) ?? []) if (band.above < other.upTo && other.above < band.upTo) ctx.addIssue({ code: "custom", path: ["averages", "rows", i, "band"], message: `the band overlaps row ${other.i}'s in the same column` });
      bands.set(col, [...(bands.get(col) ?? []), band]);
    });
    r.averages.rows.forEach((row, i) => {
      if (row.rate.effective_from !== from || row.rate.effective_to !== to)
        ctx.addIssue({ code: "custom", path: ["averages", "rows", i, "rate"], message: "an average's effective_from and effective_to are the reporting period" });
      const key = `${row.fee}|${row.securities}|${row.band.text_he}`;
      if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["averages", "rows", i], message: `two cells for ${key}` });
      seen.add(key);
    });
  });

/** A record of `data/averages/`, by its kind; one kind today. */
export const averagesRecord = taseMemberFees;

export type AveragesBand = z.infer<typeof averagesBand>;
export type AveragesRow = z.infer<typeof averagesRow>;
export type TaseMemberFees = z.infer<typeof taseMemberFees>;
export type AveragesRecord = z.infer<typeof averagesRecord>;
