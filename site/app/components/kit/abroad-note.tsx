// How a product like the page's works in other countries (product D114), at the end of a guide's "שווה לדעת": a box in the info frame
// with its tag, a chip for each country in one fixed order, and the chosen country's note. A found product's note is a heading, two or
// three sentences, the source line with a link to the page, and three facts under the same three headings for every country: tiles
// beside the text where the box is 56 rem wide or more (a computer), rows under it in a narrower box (a phone, a laptop's narrow column).
// A country with no such product keeps its chip, dashed and muted; choosing it says so, with the day it was looked for. The note holds
// the height of its longest country, so choosing one moves nothing below the box.
import { useState, type ReactNode } from "react";
import { abroad as copy } from "../../copy";
import { Card } from "./card";
import { ChoiceChips } from "./choice";
import { DocLink } from "./doc-link";
import { LongestCase } from "./longest-case";
import { useSoftSwap } from "./soft-swap";
import { Tag } from "./tag";
import { When } from "./when";

export interface AbroadPlace {
  id: string;
  /** The country's name. */
  name: string;
  /** The product's name as its own pages write it, the chip's second word; absent where nothing like the page's product was found. */
  product?: string;
  /** A found product's heading; a country with none heads with "לא נמצא מוצר דומה". */
  title?: ReactNode;
  /** Two or three sentences, or the one that says what was looked for. */
  body: ReactNode;
  /** Under the sentences: the rules their comparison with the page's own product rests on (a `RulesLine`). */
  rules?: ReactNode;
  /** Where a found product's facts were read: the publishers' names (the first one's page is the link) and that page's address. */
  source?: { publishers: string[]; href: string };
  /** A found product's three facts, in the order of `heads`. */
  facts?: readonly ReactNode[];
  /** The day the facts were read, or the day nothing was found. */
  checked: string;
}

function PlaceNote({ place, heads }: { place: AbroadPlace; heads: readonly string[] }) {
  return (
    <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-end @4xl:gap-x-8">
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-lg font-semibold">{place.title ?? copy.noneTitle(place.name)}</h3>
        <p className="max-w-measure">{place.body}</p>
        {place.rules}
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span>
            {place.source && `${copy.source(place.source.publishers)} `}
            <When iso={place.checked} lead={copy.checked} />
          </span>
          {place.source && (
            <DocLink href={place.source.href} look="compact">
              {copy.link(place.source.publishers[0]!)}
            </DocLink>
          )}
        </p>
      </div>
      {place.facts && (
        <dl className="flex flex-col gap-2 @4xl:flex-row">
          {place.facts.map((fact, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 rounded-md bg-background px-3 py-2.5 @4xl:w-41 @4xl:flex-col @4xl:justify-start @4xl:gap-1 @4xl:px-3.5 @4xl:py-3">
              <dt className="shrink-0 text-xs text-muted-foreground">{heads[i]}</dt>
              <dd className="text-end font-semibold @4xl:text-start">{fact}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** `places` in the one order of the countries; `start`, the id of the closest match, which the note opens on. */
export function AbroadNote({ places, start, heads }: { places: AbroadPlace[]; start: string; /** The three facts' headings. */ heads: readonly string[] }) {
  const [at, setAt] = useState(start);
  const shown = places.find((p) => p.id === at) ?? places[0]!;
  const fade = useSoftSwap<HTMLDivElement>(shown.id);
  const labels = Object.fromEntries(
    places.map((p) => [
      p.id,
      <>
        {p.name} <span className="opacity-70">{p.product ? <bdi dir="ltr">{p.product}</bdi> : copy.notFound}</span>
      </>,
    ]),
  );
  return (
    <Card as="aside" pad="snug" edge="info" aria-label={copy.tag} className="@container flex min-w-0 flex-col gap-3">
      <Tag tone="info">{copy.tag}</Tag>
      <ChoiceChips ids={places.map((p) => p.id)} labels={labels} value={shown.id} onChange={setAt} ariaLabel={copy.chipsLabel} missing={Object.fromEntries(places.map((p) => [p.id, !p.product]))} wrap />
      <LongestCase cases={places.map((p) => <PlaceNote key={p.id} place={p} heads={heads} />)}>
        <div ref={fade}>
          <PlaceNote place={shown} heads={heads} />
        </div>
      </LongestCase>
    </Card>
  );
}
