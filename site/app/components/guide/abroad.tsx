// The guide's note on other countries (D114): the record's countries (lib/abroad.ts) with the guide's words for each, as the kit's
// AbroadNote. Nothing renders where the guide has no record or its content has no words for a country the record found a product in.
import { abroad as copy } from "../../copy";
import type { AbroadWords } from "../../content/guide/types";
import type { AbroadView } from "../../lib/abroad";
import { AbroadNote, type AbroadPlace } from "../kit";

export function abroadPlaces(view: AbroadView, words: AbroadWords): AbroadPlace[] | null {
  const places: AbroadPlace[] = [];
  for (const c of view.countries) {
    const name = copy.countries[c.country] ?? c.country;
    if (!c.found) {
      if (!words.none) return null;
      places.push({ id: c.country, name, body: words.none(name), checked: c.checked });
      continue;
    }
    const w = words.countries[c.country];
    if (!w) return null;
    const f = (key: string) => {
      const v = c.facts[key];
      if (!v) throw new Error(`data/abroad: ${c.country} has no fact "${key}"`);
      return v;
    };
    places.push({ id: c.country, name, product: c.product, title: w.title(c.product), body: w.body(f), source: { publishers: c.publishers, href: c.href }, facts: w.tiles(f), checked: c.checked });
  }
  return places;
}

export function GuideAbroad({ view, words }: { view: AbroadView; words: AbroadWords }) {
  const places = abroadPlaces(view, words);
  return places ? <AbroadNote places={places} start={view.opensOn} heads={words.heads} /> : null;
}
