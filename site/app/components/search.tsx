// The search (flows 6.3, architecture 3.5): on a phone a bottom sheet with its own field; on a PC the field in the header
// or on the first page is itself the field, and the results open under it (audit 2026-10-24, A5). One body for both.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { buttons, search as searchCopy, searchMore, site } from "../copy";
import { formatValue } from "../lib/format";
import { rememberUncatalogued } from "../lib/inputs";
import { analyze, contentWords, groupHits, highlightRanges, nearHits, normalize, relaxedHits, searchEntries, snippetOf, type Analysis, type SearchEntry, type SearchHit, type SearchKind, type SearchTexts } from "../lib/search";
import { IconClose, IconCopy, IconDrillIn, IconLock, IconSearch } from "./icons";
import { Sheet } from "./Sheet";
import { Button, cx } from "./kit";

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex(): Promise<SearchEntry[]> {
  if (!indexPromise) indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`).then((r) => r.json() as Promise<SearchEntry[]>);
  return indexPromise;
}

/** The second file (rule texts, term meanings, parameter rationales), fetched after the index; a failure leaves the name search as it is. */
let textsPromise: Promise<SearchTexts> | null = null;
function loadTexts(): Promise<SearchTexts> {
  if (!textsPromise) textsPromise = loadIndex().then(() => fetch(`${import.meta.env.BASE_URL}search-texts.json`).then((r) => r.json() as Promise<SearchTexts>));
  return textsPromise;
}

/** A device asking to save data fetches the texts only once the query has two or more content words. */
function saveData(): boolean {
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
}

/** The index once `active` is true (it is fetched at the first need, then kept), and the texts right after it. */
function useSearchIndex(active: boolean, text: string): { index: SearchEntry[] | null; texts: SearchTexts | null } {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [texts, setTexts] = useState<SearchTexts | null>(null);
  useEffect(() => {
    if (!active) return;
    loadIndex().then(setIndex).catch(() => setIndex([]));
  }, [active]);
  const wantTexts = active && index !== null && (!saveData() || contentWords(normalize(text)).length >= 2);
  useEffect(() => {
    if (!wantTexts) return;
    loadTexts().then(setTexts).catch(() => undefined);
  }, [wantTexts]);
  return { index, texts };
}

/** Whether the viewport is PC width (the `lg` breakpoint); false until the first effect, so the pre-rendered page is the phone form. */
export function useDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 64rem)");
    const on = () => setDesktop(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return desktop;
}

interface Found {
  q: string;
  hits: SearchHit[];
  nothing: boolean;
  analysis: Analysis;
  texts: SearchTexts | null;
  /** For an empty result: figures near the number, or the rules a relaxed pass would suggest. */
  maybe: SearchHit[];
}

function useHits(index: SearchEntry[] | null, texts: SearchTexts | null, text: string): Found {
  return useMemo(() => {
    const q = normalize(text);
    const analysis = analyze(text);
    const hits = index && q.length >= 2 ? searchEntries(index, q, texts) : [];
    const nothing = !!index && q.length >= 2 && hits.length === 0;
    const maybe = !nothing || !index ? [] : analysis.type === "number" ? nearHits(index, analysis) : analysis.type === "question" ? relaxedHits(index, texts, analysis) : [];
    return { q, hits, nothing, analysis, texts, maybe };
  }, [index, texts, text]);
}

const groupLabel = (kind: SearchKind): string => (searchMore.groups as Record<string, string>)[kind] ?? (searchCopy.groups as Record<string, string>)[kind] ?? "";

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
    return <Isolated text={`${label} · ${formatValue(hit.fig.n, hit.fig.u)} · ${r.key ?? ""}`} />;
  }
  if (hit.viaText && found.texts && r.key) {
    const raw = found.texts[r.key];
    const snippet = raw ? snippetOf(raw, found.analysis) : null;
    if (snippet) {
      const tail = r.kind === "rule" || r.kind === "parameter" ? ` · ${r.key}` : "";
      return (
        <>
          <Marked text={snippet} query={text} />
          {tail && <Isolated text={tail} />}
        </>
      );
    }
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

/** The hint, the grouped results or the "not on the site yet" answer. A name is kept on the device only when its copy button is pressed. */
function SearchBody({ text, setText, found }: { text: string; setText: (t: string) => void; found: Found }) {
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
              <section key={g.kind} aria-label={groupLabel(g.kind)} className="flex flex-col gap-1">
                <h3 className="text-xs text-muted-foreground">{groupLabel(g.kind)}</h3>
                <ul className="flex flex-col">
                  {show.map((hit) => {
                    const { entry: r, also } = hit;
                    return (
                    <li key={r.href + r.name}>
                      <Link to={r.href} className="flex items-center justify-between gap-3 min-h-12 py-1.5 border-b border-border hover:bg-accent/60 -mx-2 px-2 rounded-md">
                        <span className="flex flex-col min-w-0">
                          <span className="font-medium inline-flex items-center gap-1.5">
                            <bdi>
                              <Marked text={r.name} query={text} />
                            </bdi>
                            {r.kind === "rule" && r.st === 4 && <IconLock size={14} className="text-muted-foreground shrink-0" />}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            <RowLine hit={hit} found={found} text={text} />
                          </span>
                          {also.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {searchCopy.also} <bdi>{also.join(" · ")}</bdi>
                            </span>
                          )}
                        </span>
                        <IconDrillIn className="text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                    );
                  })}
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
          <Link to={site.notCovered.href} className="text-link min-h-target inline-flex items-center hover:underline self-start">
            {searchCopy.empty.notProduct}
          </Link>
          <Button variant="primary" onClick={copy} className="self-start">
            <IconCopy size={18} /> {copied === "done" ? buttons.copied : buttons.copy}
          </Button>
          <p className="text-sm text-muted-foreground">{copied === "failed" ? searchCopy.empty.copyFailed : searchCopy.empty.underButton}</p>
          <div className="flex flex-wrap gap-x-4">
            <Link to="/companies" className="text-link min-h-target inline-flex items-center hover:underline">
              {searchCopy.empty.links.companies}
            </Link>
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
            <Link to="/rules" className="text-link min-h-target inline-flex items-center hover:underline">
              {searchMore.empty.questionLink}
            </Link>
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

/** The rows of an empty answer's "maybe" and "near" lists: the rule's title and the line the match gives. */
function MaybeRows({ rows, found, text, heading }: { rows: SearchHit[]; found: Found; text: string; heading: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-sm text-muted-foreground">{heading}</h4>
      <ul className="flex flex-col">
        {rows.map((hit) => (
          <li key={hit.entry.href}>
            <Link to={hit.entry.href} className="flex items-center justify-between gap-3 min-h-12 py-1.5 border-b border-border hover:bg-accent/60 -mx-2 px-2 rounded-md">
              <span className="flex flex-col min-w-0">
                <bdi className="font-medium">{hit.entry.name}</bdi>
                <span className="text-sm text-muted-foreground">
                  <RowLine hit={hit} found={found} text={text} />
                </span>
              </span>
              <IconDrillIn className="text-muted-foreground shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The phone search: a bottom sheet with its own field. */
export function SearchSheet({ open, onClose, anchor, seed }: { open: boolean; onClose: () => void; anchor: HTMLElement | null; seed: string }) {
  const id = useId();
  const [text, setText] = useState(seed);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { index, texts } = useSearchIndex(open, text);
  useEffect(() => setText(seed), [seed, open]);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);
  const found = useHits(index, texts, text);
  const { hits } = found;
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="center" height={100} labelledBy={id} className="sheet-search">
      <form
        role="search"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (hits[0]) navigate(hits[0].entry.href);
        }}
      >
        <label htmlFor={`${id}-q`} className="text-lg font-semibold">
          {searchCopy.label}
        </label>
        <div className="flex items-center gap-2 h-field px-3 rounded-md border border-input bg-card focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1">
          <IconSearch size={18} className="text-muted-foreground" />
          <input
            id={`${id}-q`}
            ref={inputRef}
            dir="rtl"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={site.searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground text-mixed"
            autoComplete="off"
          />
          {text && (
            <button type="button" aria-label={searchCopy.clear} onClick={() => setText("")} className="size-target -me-3 inline-flex items-center justify-center text-muted-foreground">
              <IconClose size={18} />
            </button>
          )}
        </div>
      </form>
      <SearchBody text={text} setText={setText} found={found} />
    </Sheet>
  );
}

/**
 * The search field that is on the page (the header, the first page). On a PC it is the field itself and the results
 * open under it; Escape, the X and a click elsewhere close them. On a phone it only opens the bottom sheet.
 * In the header from 80rem, where the menu shares the line, it rests as an icon and widens while in use, and the menu
 * fades out meanwhile (2026-10-25, the founder: the full field ran over the last menu item).
 */
export function SearchCombo({ inputId, variant, ready, onSheet }: { inputId: string; variant: "header" | "home"; ready: boolean; onSheet: (el: HTMLElement | null, text: string, via: "focus" | "tap") => void }) {
  const desktop = useDesktop();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const { index, texts } = useSearchIndex(open && desktop, text);
  const found = useHits(index, texts, text);
  const { hits } = found;
  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);
  const panelOpen = open && desktop;
  const resting = variant === "header" && !focused && !open && !text;
  return (
    <div ref={wrap} data-search-active={(variant === "header" && !resting) || undefined} className={cx("relative", variant === "header" && "w-56 xl:absolute xl:end-0 xl:top-1/2 xl:-translate-y-1/2 xl:transition-[width] xl:duration-[var(--duration-fast)]", variant === "header" && (resting ? "xl:w-10" : "xl:w-64"))}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (hits[0]) {
            setOpen(false);
            navigate(hits[0].entry.href);
          }
        }}
      >
        <div
          className={cx(
            "flex items-center gap-2 px-3 rounded-md border border-input bg-card text-muted-foreground focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1",
            variant === "header" ? "h-10" : "h-field",
            resting && "xl:px-0 xl:gap-0 xl:justify-center xl:cursor-pointer",
            !ready && "opacity-60",
          )}
          onClick={() => input.current?.focus()}
        >
          <IconSearch size={18} />
          {variant === "header" && (
            <label htmlFor={inputId} className="sr-only">
              {site.search}
            </label>
          )}
          <input
            ref={input}
            id={inputId}
            dir="rtl"
            value={text}
            disabled={!ready}
            readOnly={!desktop}
            role="combobox"
            aria-expanded={panelOpen}
            aria-controls={panelId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={site.searchPlaceholder}
            className={cx("flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-wait text-mixed", variant === "header" ? "text-sm text-foreground" : "field-input !text-start", resting && "xl:w-0 xl:flex-none")}
            onFocus={(e) => {
              setFocused(true);
              if (desktop) setOpen(true);
              else onSheet(e.currentTarget, text, "focus");
            }}
            onBlur={() => setFocused(false)}
            onClick={(e) => (desktop ? setOpen(true) : onSheet(e.currentTarget, text, "tap"))}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              if (open) setOpen(false);
              else setText("");
              e.preventDefault();
            }}
          />
          {text && desktop && (
            <button
              type="button"
              aria-label={searchCopy.clear}
              onClick={() => {
                setText("");
                setOpen(false);
              }}
              className="size-target -me-3 inline-flex items-center justify-center text-muted-foreground"
            >
              <IconClose size={18} />
            </button>
          )}
        </div>
      </form>
      {panelOpen && (
        <div id={panelId} className="absolute end-0 top-full mt-2 z-[var(--z-popover)] w-[min(30rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-4 flex flex-col gap-3">
          <SearchBody text={text} setText={setText} found={found} />
        </div>
      )}
    </div>
  );
}
