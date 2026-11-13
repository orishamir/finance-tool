// The note on other countries (product D114, data-schema §3.16) as a guide page ships it: each country's product, the pages its facts
// were read on, and its facts as site values, whose sheets show the page's own words and link to no Israeli rule. Amounts stay in their
// own currency.
import type { AbroadCountry, AbroadFact, AbroadRecord } from "@finance-tool/schema";
import { abroad as copy } from "../copy";
import type { SiteValue } from "./value";

export type AbroadPlaceView =
  | {
      country: AbroadCountry;
      found: true;
      /** The product's name as its own pages write it. */
      product: string;
      /** The Hebrew names of the pages' publishers, each once, in the record's order. */
      publishers: string[];
      /** The first page, the one the note's link opens. */
      href: string;
      /** The last day a page was read. */
      checked: string;
      facts: Record<string, SiteValue>;
    }
  | { country: AbroadCountry; found: false; checked: string };

export interface AbroadView {
  opensOn: AbroadCountry;
  /** The three facts every found country shows, by key, under the guide's three headings. */
  tiles: [string, string, string];
  countries: AbroadPlaceView[];
}

/**
 * A fact as a sourced site value: its page's words go to `quote` for the sheet, and an amount's sheet says its currency in the note's word.
 * The record's English working notes and a source's coming replacement (a data check's matter) stay out of the page.
 */
export function abroadFactValue(f: AbroadFact): SiteValue {
  const { notes: _notes, source, ...rest } = f;
  const { locator: _locator, quote, superseded: _superseded, ...shown } = source;
  const word = copy.currency[f.unit];
  return { ...rest, source: shown, quote, foreign: true, ...(word ? { unitText: word } : {}) };
}

export function abroadView(r: AbroadRecord): AbroadView {
  return {
    opensOn: r.opens_on,
    tiles: r.tiles,
    countries: r.countries.map((c): AbroadPlaceView => {
      if (!c.found) return { country: c.country, found: false, checked: c.checked };
      return {
        country: c.country,
        found: true,
        product: c.product,
        publishers: [...new Set(c.pages.map((p) => p.publisher_he))],
        href: c.pages[0]!.url,
        checked: c.pages.map((p) => p.checked).sort().at(-1)!,
        facts: Object.fromEntries(Object.entries(c.facts).map(([k, f]) => [k, abroadFactValue(f)])),
      };
    }),
  };
}
