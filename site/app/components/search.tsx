// The search (flows 6.3, architecture 3.5): on a phone a bottom sheet with its own field; on a PC the field in the header
// or on the first page is itself the field, and the results open under it (audit 2026-10-24, A5). One body for both.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { buttons, search as searchCopy, site } from "../copy";
import { rememberUncatalogued } from "../lib/inputs";
import { groupHits, normalize, searchEntries, type SearchEntry, type SearchHit } from "../lib/search";
import { IconClose, IconCopy, IconDrillIn, IconSearch } from "./icons";
import { Sheet } from "./Sheet";
import { Button, cx } from "./ui";

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex(): Promise<SearchEntry[]> {
  if (!indexPromise) indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`).then((r) => r.json() as Promise<SearchEntry[]>);
  return indexPromise;
}

/** The index once `active` is true (it is fetched at the first need, then kept). */
function useSearchIndex(active: boolean): SearchEntry[] | null {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  useEffect(() => {
    if (!active) return;
    loadIndex().then(setIndex).catch(() => setIndex([]));
  }, [active]);
  return index;
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

function useHits(index: SearchEntry[] | null, text: string) {
  const q = normalize(text);
  const hits = index && q.length >= 2 ? searchEntries(index, q) : [];
  return { q, hits, nothing: !!index && q.length >= 2 && hits.length === 0 };
}

/** The hint, the grouped results or the "not on the site yet" answer. A name is kept on the device only when its copy button is pressed. */
function SearchBody({ text, setText, q, hits, nothing }: { text: string; setText: (t: string) => void; q: string; hits: SearchHit[]; nothing: boolean }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const groups = groupHits(hits);
  const copy = async () => {
    rememberUncatalogued(text.trim());
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
              <section key={g.kind} aria-label={searchCopy.groups[g.kind]} className="flex flex-col gap-1">
                <h3 className="text-xs text-muted-foreground">{searchCopy.groups[g.kind]}</h3>
                <ul className="flex flex-col">
                  {show.map(({ entry: r, also }) => (
                    <li key={r.href + r.name}>
                      <Link to={r.href} className="flex items-center justify-between gap-3 min-h-12 py-1.5 border-b border-border hover:bg-accent/60 -mx-2 px-2 rounded-md">
                        <span className="flex flex-col min-w-0">
                          <bdi className="font-medium">{highlight(r.name, text)}</bdi>
                          <span className="text-sm text-muted-foreground">{r.line}</span>
                          {also.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {searchCopy.also} <bdi>{also.join(" · ")}</bdi>
                            </span>
                          )}
                        </span>
                        <IconDrillIn className="text-muted-foreground shrink-0" />
                      </Link>
                    </li>
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
      {nothing && (
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
    </>
  );
}

function highlight(name: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return name;
  const i = normalize(name).indexOf(normalize(q));
  if (i < 0) return name;
  // The normalised and raw strings share positions except for stripped niqqud, which these names lack.
  return (
    <>
      {name.slice(0, i)}
      <span className="font-semibold">{name.slice(i, i + q.length)}</span>
      {name.slice(i + q.length)}
    </>
  );
}

/** The phone search: a bottom sheet with its own field. */
export function SearchSheet({ open, onClose, anchor, seed }: { open: boolean; onClose: () => void; anchor: HTMLElement | null; seed: string }) {
  const id = useId();
  const [text, setText] = useState(seed);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const index = useSearchIndex(open);
  useEffect(() => setText(seed), [seed, open]);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);
  const { q, hits, nothing } = useHits(index, text);
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
            dir="auto"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={site.searchPlaceholder}
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
          {text && (
            <button type="button" aria-label={searchCopy.clear} onClick={() => setText("")} className="size-target -me-3 inline-flex items-center justify-center text-muted-foreground">
              <IconClose size={18} />
            </button>
          )}
        </div>
      </form>
      <SearchBody text={text} setText={setText} q={q} hits={hits} nothing={nothing} />
    </Sheet>
  );
}

/**
 * The search field that is on the page (the header, the first page). On a PC it is the field itself and the results
 * open under it; Escape, the X and a click elsewhere close them. On a phone it only opens the bottom sheet.
 */
export function SearchCombo({ inputId, variant, ready, onSheet }: { inputId: string; variant: "header" | "home"; ready: boolean; onSheet: (el: HTMLElement | null, text: string, via: "focus" | "tap") => void }) {
  const desktop = useDesktop();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const index = useSearchIndex(open && desktop);
  const { q, hits, nothing } = useHits(index, text);
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
  return (
    <div ref={wrap} className={cx("relative", variant === "header" && "w-56 xl:w-64")}>
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
            !ready && "opacity-60",
          )}
        >
          <IconSearch size={18} />
          {variant === "header" && (
            <label htmlFor={inputId} className="sr-only">
              {site.search}
            </label>
          )}
          <input
            id={inputId}
            dir="auto"
            value={text}
            disabled={!ready}
            readOnly={!desktop}
            role="combobox"
            aria-expanded={panelOpen}
            aria-controls={panelId}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={site.searchPlaceholder}
            className={cx("flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-wait", variant === "header" ? "text-sm text-foreground" : "field-input !text-start")}
            onFocus={(e) => (desktop ? setOpen(true) : onSheet(e.currentTarget, text, "focus"))}
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
          <SearchBody text={text} setText={setText} q={q} hits={hits} nothing={nothing} />
        </div>
      )}
    </div>
  );
}
