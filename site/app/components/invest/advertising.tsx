// What the site found when it read the houses' advertising against their binding documents (D57, amended 2026-11-04): a short block
// on the indices page. The finding in plain words with one example from the records, that a better price can often be had by
// negotiating, the add-a-broker control for a price someone got (D44), and each house with findings as a link to its own page, where
// both sides stand with their sources. Nothing here reads the page's inputs, so nothing in it moves when they change.
import type { FeesSnapshot } from "@finance-tool/schema";
import { Link } from "react-router";
import { claims as claimWords, invest as c } from "../../copy";
import { brokeragePagePath } from "../../lib/invest";
import { Card, ProseList } from "../kit";
import { AddEntryButton } from "./custom-entries";

type Entry = NonNullable<FeesSnapshot["advertising"]>[number];

/** The example: a custody claim the price list contradicts, the one whose document says it in the fewest words (a sentence, not a table row). */
function exampleOf(snapshots: readonly FeesSnapshot[]): { house: string; e: Entry } | null {
  const all = snapshots.flatMap((s) => (s.advertising ?? []).filter((e) => e.verdict === "contradicted" && e.fee === "custody" && e.binding_source.kind === "price_list" && e.binding_he).map((e) => ({ id: s.id, e })));
  const best = all.sort((a, b) => a.e.binding_he!.length - b.e.binding_he!.length)[0];
  return best ? { house: best.id, e: best.e } : null;
}

export function AdvertisingBlock({ snapshots, nameOf }: { snapshots: readonly FeesSnapshot[]; nameOf: (id: string) => string }) {
  const houses = snapshots
    .filter((s) => (s.advertising?.length ?? 0) > 0)
    .map((s) => ({ id: s.id, name: nameOf(s.id), n: s.advertising!.length }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
  if (houses.length === 0) return null;
  const example = exampleOf(snapshots);
  return (
    <Card as="section" aria-labelledby="invest-advertising-h" className="flex flex-col gap-3">
      <h2 id="invest-advertising-h" className="text-lg font-semibold">
        {c.advertising.title}
      </h2>
      <p className="max-w-measure">{c.advertising.lead(houses.length)}</p>
      {example && (
        <p className="max-w-measure">
          {c.advertising.example.before}
          {nameOf(example.house)}
          {c.advertising.example.ad}
          <bdi>{claimWords.quote(example.e.claim_he)}</bdi>
          {c.advertising.example.tariff}
          <bdi>{claimWords.quote(example.e.binding_he!)}</bdi>.
        </p>
      )}
      <p className="max-w-measure">{c.advertising.negotiate}</p>
      <div className="flex flex-col gap-1 items-start">
        <p className="max-w-measure">{c.advertising.addOwn}</p>
        <AddEntryButton kind="broker" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{c.advertising.housesLead}</p>
        <ProseList
          className="text-sm"
          items={houses.map((h) => (
            <span key={h.id}>
              <Link to={brokeragePagePath(h.id)} className="text-link hover:underline inline-flex items-center min-h-target">
                {h.name}
              </Link>
              <span className="text-muted-foreground"> · {c.advertising.count(h.n)}</span>
            </span>
          ))}
        />
      </div>
    </Card>
  );
}
