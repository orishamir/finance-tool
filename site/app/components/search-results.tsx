// The search's matching and its results (flows 6.3, architecture 3.5): a script of its own, fetched while the page hydrates or when a
// search opens (search.tsx `loadSearchCode`), so it stays out of what a page needs to show itself.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { buttons, search as searchCopy, searchMore, site } from "../copy";
import { formatValue } from "../lib/format";
import { rememberUncatalogued } from "../lib/inputs";
import { analyze, contentWords, groupHits, highlightRanges, isRuleKind, nearHits, normalize, relaxedHits, searchEntries, snippetOf, type Analysis, type SearchEntry, type SearchHit, type SearchKind, type SearchTexts } from "../lib/search";
import { IconCopy, IconLock } from "./icons";
import { Button, RowArrow, TextLink, gershayim } from "./kit";

export interface Found {
  q: string;
  hits: SearchHit[];
  nothing: boolean;
  analysis: Analysis;
  texts: SearchTexts | null;
  /** For an empty result: figures near the number, or the rules a relaxed pass would suggest. */
  maybe: SearchHit[];
}

/** What the text finds in the index (nothing before the index is in). */
export function findHits(index: SearchEntry[] | null, texts: SearchTexts | null, text: string): Found {
  const q = normalize(text);
  const analysis = analyze(text);
  const hits = index && q.length >= 2 ? searchEntries(index, q, texts) : [];
  const nothing = !!index && q.length >= 2 && hits.length === 0;
  const maybe = !nothing || !index ? [] : analysis.type === "number" ? nearHits(index, analysis) : analysis.type === "question" ? relaxedHits(index, texts, analysis) : [];
  return { q, hits, nothing, analysis, texts, maybe };
}

/** A group's heading; the guide group says so when a page that compares the product stands in it beside the guide. */
const groupLabel = (kind: SearchKind, items: SearchHit[]): string =>
  kind === "guide" && items.some((h) => h.entry.kind === "compare") ? searchCopy.guideAndCompare : ((searchMore.groups as Record<string, string>)[kind] ?? (searchCopy.groups as Record<string, string>)[kind] ?? "");

/** Ids, codes and numbers inside a Hebrew line are isolated so bidi reordering cannot scramble them. */
function Isolated({ text }: { text: string }): ReactNode {
  return (
    <>
      {text.split(/([A-Za-z0-9₪][A-Za-z0-9\-.,&%₪]*)/).map((part, i) => (i % 2 === 1 ? <bdi key={i}>{part}</bdi> : part))}
    </>
  );
}

/** The second line of a row: the figure that matched, the words of the text that matched, or the entry's own line. */
function RowLine({ hit, found, text }: { hit: SearchHit; found: Found; text: string }): ReactNode {
  const r = hit.entry;
  if (hit.fig) {
    const label = hit.fig.f ?? searchMore.figureLine;
    return <Isolated text={`${label} · ${formatValue(hit.fig.n, hit.fig.u)}`} />;
  }
  if (hit.viaText && found.texts && r.key) {
    const raw = found.texts[r.key];
    const snippet = raw ? snippetOf(raw, found.analysis) : null;
    if (snippet) return <Marked text={snippet} query={text} />;
  }
  return <Isolated text={r.line} />;
}

/** `text` with the words of the query in weight 600, through deleted characters. */
function Marked({ text, query }: { text: string; query: string }): ReactNode {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0) return text;
  const out: ReactNode[] = [];
  let at = 0;
  ranges.forEach(([a, b], i) => {
    out.push(text.slice(at, a), <span key={i} className="font-semibold">{text.slice(a, b)}</span>);
    at = b;
  });
  out.push(text.slice(at));
  return <>{out}</>;
}

/**
 * One result, in every list of the search (the groups, and an empty answer's "maybe" and "near" rows): the whole row is the link, the name
 * with the query's words marked and a lock on an open rule, the line the match gives, the other names it matched by, and the arrow.
 */
function HitRow({ hit, found, text }: { hit: SearchHit; found: Found; text: string }) {
  const { entry: r, also } = hit;
  return (
    <li>
      <Link to={r.href} className="flex items-center justify-between gap-3 min-h-12 py-1.5 border-b border-border hover:bg-accent/60 -mx-2 px-2 rounded-md">
        <span className="flex flex-col min-w-0">
          <span className="font-medium inline-flex items-center gap-1.5">
            <bdi>
              <Marked text={gershayim(r.name)} query={text} />
            </bdi>
            {isRuleKind(r.kind) && r.st === 4 && <IconLock size={14} className="text-muted-foreground shrink-0" />}
          </span>
          <span className="text-sm text-muted-foreground">
            <RowLine hit={hit} found={found} text={text} />
          </span>
          {also.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {searchCopy.also} <bdi>{also.map(gershayim).join(" · ")}</bdi>
            </span>
          )}
        </span>
        <RowArrow />
      </Link>
    </li>
  );
}

/** The hint, the grouped results or the "not on the site yet" answer. A name is kept on the device only when its copy button is pressed. */
export function SearchBody({ text, setText, found }: { text: string; setText: (t: string) => void; found: Found }) {
  const { q, hits, nothing, analysis, maybe } = found;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const groups = groupHits(hits);
  const copy = async () => {
    // a name goes to the device's list of names the site lacks; a question is only copied
    if (analysis.type === "name") rememberUncatalogued(text.trim());
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied("done");
      window.setTimeout(() => setCopied("idle"), 2000);
    } catch {
      setCopied("failed");
    }
  };
  return (
    <>
      {q.length === 0 && <p className="text-sm text-muted-foreground">{searchCopy.hint}</p>}
      {q.length === 1 && <p className="text-sm text-muted-foreground">{searchCopy.tooShort}</p>}
      {groups.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          {groups.map((g) => {
            const show = expanded.has(g.kind) ? g.items : g.items.slice(0, 5);
            return (
              <section key={g.kind} aria-label={groupLabel(g.kind, g.items)} className="flex flex-col gap-1">
                <h3 className="text-xs text-muted-foreground">{groupLabel(g.kind, g.items)}</h3>
                <ul className="flex flex-col">
                  {show.map((hit) => (
                    <HitRow key={hit.entry.href + hit.entry.name} hit={hit} found={found} text={text} />
                  ))}
                </ul>
                {g.items.length > show.length && (
                  <Button variant="quiet" className="self-start -ms-2" onClick={() => setExpanded(new Set([...expanded, g.kind]))}>
                    {searchCopy.more}
                  </Button>
                )}
              </section>
            );
          })}
        </div>
      )}
      {nothing && analysis.type === "name" && (
        <section className="flex flex-col gap-3 mt-2" aria-live="polite">
          <h3 className="text-lg font-semibold">{searchCopy.empty.title}</h3>
          <p className="text-sm">
            {searchCopy.empty.bodyBefore}
            <bdi dir="auto">{text.trim()}</bdi>
            {searchCopy.empty.bodyAfter}
          </p>
          <TextLink look="line" to={site.notCovered.href} className="self-start">
            {searchCopy.empty.notProduct}
          </TextLink>
          <Button variant="primary" onClick={copy} className="self-start">
            <IconCopy size={18} /> {copied === "done" ? buttons.copied : buttons.copy}
          </Button>
          <p className="text-sm text-muted-foreground">{copied === "failed" ? searchCopy.empty.copyFailed : searchCopy.empty.underButton}</p>
          <div className="flex flex-wrap gap-x-4">
            <TextLink look="line" to="/companies">
              {searchCopy.empty.links.companies}
            </TextLink>
            <button type="button" className="text-link min-h-target hover:underline" onClick={() => setText(text.trim().split(/\s+/).slice(0, 2).join(" "))}>
              {searchCopy.empty.links.shorter}
            </button>
          </div>
        </section>
      )}
      {nothing && analysis.type === "number" && (
        <section className="flex flex-col gap-3 mt-2" aria-live="polite">
          <h3 className="text-lg font-semibold">{searchMore.empty.numberTitle}</h3>
          {maybe.length > 0 && <MaybeRows rows={maybe} found={found} text={text} heading={searchMore.empty.numberNear} />}
        </section>
      )}
      {nothing && analysis.type === "question" && (
        <section className="flex flex-col gap-3 mt-2" aria-live="polite">
          <h3 className="text-lg font-semibold">{searchMore.empty.questionTitle}</h3>
          <p className="text-sm">{searchMore.empty.questionBody}</p>
          {maybe.length > 0 && <MaybeRows rows={maybe} found={found} text={text} heading={searchMore.maybe} />}
          <div className="flex flex-wrap gap-x-4">
            <TextLink look="line" to="/rules">
              {searchMore.empty.questionLink}
            </TextLink>
            {contentWords(q).length > 0 && contentWords(q).join(" ") !== q && (
              <button type="button" className="text-link min-h-target hover:underline" onClick={() => setText(contentWords(q).join(" "))}>
                {searchMore.empty.mainWords}
              </button>
            )}
          </div>
          <Button variant="quiet" onClick={copy} className="self-start -ms-2">
            <IconCopy size={18} /> {copied === "done" ? buttons.copied : searchMore.empty.questionCopy}
          </Button>
          <p className="text-sm text-muted-foreground">{copied === "failed" ? searchCopy.empty.copyFailed : searchMore.empty.questionUnder}</p>
        </section>
      )}
    </>
  );
}

/** An empty answer's "maybe" and "near" lists, under their heading, in the rows every result list draws. */
function MaybeRows({ rows, found, text, heading }: { rows: SearchHit[]; found: Found; text: string; heading: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm text-muted-foreground">{heading}</h4>
      <ul className="flex flex-col">
        {rows.map((hit) => (
          <HitRow key={hit.entry.href} hit={hit} found={found} text={text} />
        ))}
      </ul>
    </div>
  );
}
