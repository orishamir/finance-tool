// data/abroad/<guide id>.json: how the same kind of product works in other countries, the note at the end of a guide's "שווה לדעת"
// (product D114). docs/data-schema.md §3.16. Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, productId, valueObject } from "../value.ts";

/** The countries a note compares with, by ISO 3166 code: Britain, the United States, France, Italy. */
export const abroadCountry = z.enum(["gb", "us", "fr", "it"]);
export type AbroadCountry = z.infer<typeof abroadCountry>;

/** The one order of the countries on every guide (D114): a record lists all four, in this order. */
export const ABROAD_ORDER: readonly AbroadCountry[] = abroadCountry.options;

/**
 * The page a fact was read on: a government's or regulator's own page (D114), so `primary` only. `quote` is the page's own words the fact
 * rests on, verbatim; `locator` says where on the page they stand (a heading, a paragraph of a law), `locator_he` the same in Hebrew where
 * the sheet should show it.
 */
export const abroadSource = z.strictObject({
  url: z.string().regex(/^https:\/\//),
  title: z.string().min(1),
  publisher: z.string().min(1),
  publisher_he: z.string().min(1),
  kind: z.enum(["law", "regulator_page"]),
  strength: z.literal("primary"),
  locator: z.string().min(1).optional(),
  locator_he: z.string().min(1).optional(),
  quote: z.string().min(8),
});

/**
 * One fact, a value object read on its page: an amount in its own currency (`gbp`, `usd`, `eur`, never converted), a number of years, or
 * `text`, a short English statement of what the page says, which the guide's words say in Hebrew.
 */
export const abroadFact = z
  .strictObject({
    ...valueObject.shape,
    source: abroadSource,
    state: z.literal("sourced"),
  })
  .refine((v) => v.value !== null || (v.notes ?? "").trim() !== "", { message: "value is null, so notes must say why", path: ["notes"] });

/** The pages a note's source line names, the first being the one its link opens. */
export const abroadPage = z.strictObject({
  url: z.string().regex(/^https:\/\//),
  title: z.string().min(1),
  publisher: z.string().min(1),
  publisher_he: z.string().min(1),
  checked: isoDate,
});

/** A country with a product like the guide's: its name as its own pages write it, who may open it, and its facts by key. */
export const abroadFound = z.strictObject({
  country: abroadCountry,
  found: z.literal(true),
  /** The product's name or short name as its source writes it ("ISA", "Roth IRA", "PEA"): the chip's second word. */
  product: z.string().min(1),
  /** Its full name, where the short one is an abbreviation. */
  product_name: z.string().min(1).optional(),
  pages: z.array(abroadPage).min(1),
  /** Who may open it, as the page says it; absent where the page says nothing of it. */
  who: z.strictObject({ statement: z.string().min(1), source: abroadSource, checked: isoDate }).optional(),
  facts: z.record(z.string().regex(/^[a-z_]+$/), abroadFact),
});

/** A country where no product like the guide's was found: when it was looked for, and what was looked for. */
export const abroadNone = z.strictObject({
  country: abroadCountry,
  found: z.literal(false),
  checked: isoDate,
  /** In English: the kind of product looked for and where. Not finding one is no proof there is none. */
  looked_for: z.string().min(1),
});

export const abroadEntry = z.discriminatedUnion("found", [abroadFound, abroadNone]);

export const abroadRecord = z
  .strictObject({
    /** The guide page the note stands on. */
    id: productId,
    /** The country the note opens on: the closest match. */
    opens_on: abroadCountry,
    /** The three facts every found country shows, by key, in their order: the same three headings for every country of the guide. */
    tiles: z.tuple([z.string().regex(/^[a-z_]+$/), z.string().regex(/^[a-z_]+$/), z.string().regex(/^[a-z_]+$/)]),
    countries: z.array(abroadEntry),
  })
  .superRefine((r, ctx) => {
    const order = r.countries.map((c) => c.country).join(",");
    if (order !== ABROAD_ORDER.join(","))
      ctx.addIssue({ code: "custom", path: ["countries"], message: `the countries are ${ABROAD_ORDER.join(", ")}, each once and in that order (D114); found ${order}` });
    const opens = r.countries.find((c) => c.country === r.opens_on);
    if (!opens?.found) ctx.addIssue({ code: "custom", path: ["opens_on"], message: `opens_on ${r.opens_on} must be a country with a similar product` });
    if (new Set(r.tiles).size !== 3) ctx.addIssue({ code: "custom", path: ["tiles"], message: "the three tiles are three different facts" });
    r.countries.forEach((c, i) => {
      if (!c.found) return;
      for (const key of r.tiles) if (!c.facts[key]) ctx.addIssue({ code: "custom", path: ["countries", i, "facts"], message: `${c.country} has no fact "${key}", one of the guide's three tiles` });
    });
  });

export type AbroadSource = z.infer<typeof abroadSource>;
export type AbroadFact = z.infer<typeof abroadFact>;
export type AbroadFound = z.infer<typeof abroadFound>;
export type AbroadNone = z.infer<typeof abroadNone>;
export type AbroadEntry = z.infer<typeof abroadEntry>;
export type AbroadRecord = z.infer<typeof abroadRecord>;
