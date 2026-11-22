// The search (flows 6.3, architecture 3.5): on a phone a bottom sheet with its own field; on a PC the field in the header
// or on the first page is itself the field, and the results open under it. One body for both. The field is in every page's
// first view; the matching and the results list (search-results.tsx) are a script of their own, fetched while the page hydrates
// (entry.client.tsx) or, should that fail, when a search opens, so a page shows itself without waiting for them.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { search as searchCopy, site } from "../copy";
import type { SearchEntry, SearchTexts } from "../lib/search";
import { IconClose, IconSearch } from "./icons";
import { Sheet } from "./Sheet";
import { cx, SearchField } from "./kit";
import { MQ, useMedia } from "../lib/hooks";

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

/** A module fetched once, at its first need, and kept; a failed fetch (the connection dropped) is tried again at the next need. */
function lazyModule<T>(load: () => Promise<T>): { now: () => T | null; get: () => Promise<T> } {
  let mod: T | null = null;
  let pending: Promise<T> | null = null;
  const get = () =>
    (pending ??= load().then(
      (m) => (mod = m),
      (e: unknown) => {
        pending = null;
        throw e;
      },
    ));
  return { now: () => mod, get };
}

/** The matching (lib/search), for deciding when the texts are worth fetching; the rules page has it already. */
const matching = lazyModule(() => import("../lib/search"));
/** The matching and the results list. */
const results = lazyModule(() => import("./search-results"));

/** Starts fetching the results code and the index: on a pointer down or a focus on a search, before its tap opens it. */
export function preloadSearch(): void {
  results.get().catch(() => undefined);
  loadIndex().catch(() => undefined);
}

/** A lazy module once `active` is true (null until it is in). */
function useLazy<T>(m: { now: () => T | null; get: () => Promise<T> }, active: boolean): T | null {
  const [mod, setMod] = useState<T | null>(m.now);
  useEffect(() => {
    if (!active || mod) return;
    let live = true;
    m.get().then(
      (x) => live && setMod(() => x),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [m, active, mod]);
  return mod;
}

/** A device asking to save data fetches the texts only once the query has two or more content words. */
function saveData(): boolean {
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
}

/** The index once `active` is true (it is fetched at the first need, then kept), and the texts right after it. */
export function useSearchIndex(active: boolean, text: string): { index: SearchEntry[] | null; texts: SearchTexts | null } {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [texts, setTexts] = useState<SearchTexts | null>(null);
  const m = useLazy(matching, active);
  useEffect(() => {
    if (!active) return;
    loadIndex().then(setIndex).catch(() => setIndex([]));
  }, [active]);
  const wantTexts = active && index !== null && m !== null && (!saveData() || m.contentWords(m.normalize(text)).length >= 2);
  useEffect(() => {
    if (!wantTexts) return;
    loadTexts().then(setTexts).catch(() => undefined);
  }, [wantTexts]);
  return { index, texts };
}

/** The results code once `active`, and what the text finds with it. */
function useFound(active: boolean, index: SearchEntry[] | null, texts: SearchTexts | null, text: string) {
  const r = useLazy(results, active);
  const found = useMemo(() => (r ? r.findHits(index, texts, text) : null), [r, index, texts, text]);
  return { r, found, hits: found?.hits ?? [] };
}

/**
 * The body while the results code is still on its way (the first moments of the first search on a page): the hint or the "too short"
 * line the body would give. Results need the index, which comes with the code, so nothing else is missing meanwhile.
 */
function Waiting({ text }: { text: string }) {
  const n = text.trim().length;
  if (n === 0) return <p className="text-sm text-muted-foreground">{searchCopy.hint}</p>;
  if (n === 1) return <p className="text-sm text-muted-foreground">{searchCopy.tooShort}</p>;
  return null;
}

/** The phone search: a bottom sheet with its own field. */
export function SearchSheet({ open, onClose, anchor, seed }: { open: boolean; onClose: () => void; anchor: HTMLElement | null; seed: string }) {
  const id = useId();
  const [text, setText] = useState(seed);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { index, texts } = useSearchIndex(open, text);
  const { r, found, hits } = useFound(open, index, texts, text);
  // each opening, and each new seed, starts the field from the seed
  const [seeded, setSeeded] = useState({ seed, open });
  if (seeded.seed !== seed || seeded.open !== open) {
    setSeeded({ seed, open });
    setText(seed);
  }
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);
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
        <h2 id={id} className="text-lg font-semibold">
          {searchCopy.label}
        </h2>
        <SearchField label={searchCopy.label} labelHidden inputRef={inputRef} value={text} onChange={(v) => setText(v)} placeholder={site.searchPlaceholder} clearLabel={searchCopy.clear} />
      </form>
      {r && found ? <r.SearchBody text={text} setText={setText} found={found} /> : <Waiting text={text} />}
    </Sheet>
  );
}

/**
 * The search field that is on the page (the header, the first page). On a PC it is the field itself and the results
 * open under it; Escape, the X and a click elsewhere close them. On a phone it only opens the bottom sheet.
 * In the header, shown from 64rem where the five sections share its line, it rests as an icon and widens into the space
 * left of them while in use.
 */
export function SearchCombo({ inputId, variant, ready, onSheet }: { inputId: string; variant: "header" | "home"; ready: boolean; onSheet: (el: HTMLElement | null, text: string, via: "focus" | "tap") => void }) {
  // on a PC the field is the search itself; the pre-rendered page is the phone form
  const desktop = useMedia(MQ.lg);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const { index, texts } = useSearchIndex(open && desktop, text);
  const { r, found, hits } = useFound(open && desktop, index, texts, text);
  // a move to another page or place closes the results
  const place = `${location.pathname}${location.hash}`;
  const [placeOpened, setPlaceOpened] = useState(place);
  if (place !== placeOpened) {
    setPlaceOpened(place);
    setOpen(false);
  }
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
    <div ref={wrap} className={cx(variant === "header" ? "absolute inset-e-0 top-1/2 -translate-y-1/2 transition-[width] duration-(--duration-fast)" : "relative", variant === "header" && (resting ? "w-10" : "w-72"))}>
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
            "flex items-center rounded-md border border-input bg-card text-muted-foreground focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-1",
            variant === "header" ? "h-10" : "h-field",
            resting ? "px-0 gap-0 justify-center cursor-pointer" : "gap-2 px-3",
            !ready && "opacity-60",
          )}
          onClick={() => input.current?.focus()}
          onPointerDown={preloadSearch}
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
            className={cx("min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-wait text-mixed", variant === "header" ? "text-sm text-foreground" : "field-input", resting ? "w-0 flex-none" : "flex-1")}
            onFocus={(e) => {
              preloadSearch();
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
        <div id={panelId} className="absolute inset-e-0 top-full mt-2 z-(--z-popover) w-[min(30rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg p-4 flex flex-col gap-3">
          {r && found ? <r.SearchBody text={text} setText={setText} found={found} /> : <Waiting text={text} />}
        </div>
      )}
    </div>
  );
}
