// The app shell: header, menu sheet, search sheet, footer and the page frame (design-spec 1.3, flows 6.2, 6.3).
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { buttons, companies as companiesCopy, search as searchCopy, site } from "../copy";
import { rememberUncatalogued } from "../lib/inputs";
import { normalize, type SearchEntry } from "../lib/search";
import { IconBack, IconClose, IconCopy, IconDrillIn, IconMenu, IconSearch } from "./icons";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { Sheet } from "./Sheet";
import { Button, cx } from "./ui";

export type Current = "guide" | "decoder" | "rules" | "parameters" | "home" | "goal" | "other";

export function PageShell({ current, data, children, wide }: { current: Current; data: ProvenanceData; children: ReactNode; wide?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const [seed, setSeed] = useState("");
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);
  const openSearch = (el: HTMLElement | null, text = "") => {
    setSeed(text);
    setSearchAnchor(el);
    setSearchOpen(true);
  };
  return (
    <ProvenanceProvider data={data}>
      <SearchOpenCtx.Provider value={openSearch}>
        <div className="min-h-dvh flex flex-col">
          <Header current={current} onMenu={() => setMenuOpen(true)} onSearch={openSearch} />
          <main className={cx("flex-1 w-full mx-auto px-gutter pb-10", wide ? "max-w-page" : "max-w-page")}>{children}</main>
          <Footer />
        </div>
        <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} current={current} />
        <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} anchor={searchAnchor} seed={seed} />
      </SearchOpenCtx.Provider>
    </ProvenanceProvider>
  );
}

import { createContext, useContext } from "react";
const SearchOpenCtx = createContext<(el: HTMLElement | null, text?: string) => void>(() => {});
export function useOpenSearch() {
  return useContext(SearchOpenCtx);
}

function Header({ current, onMenu, onSearch }: { current: Current; onMenu: () => void; onSearch: (el: HTMLElement | null, text?: string) => void }) {
  const fieldRef = useRef<HTMLInputElement>(null);
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-page h-14 lg:h-16 px-gutter flex items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-lg font-semibold text-foreground py-2">
            {site.name}
          </Link>
          <nav aria-label="ראשי" className="hidden lg:flex items-center gap-6">
            {site.menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                aria-current={current === item.current ? "page" : undefined}
                className={cx("py-2 border-b-2 -mb-px", current === item.current ? "font-medium border-primary" : "border-transparent hover:border-border")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center -me-2.5 lg:me-0">
          <Button variant="icon" aria-label={site.search} onClick={(e) => onSearch(e.currentTarget)} className="lg:hidden">
            <IconSearch />
          </Button>
          <Button variant="icon" aria-label={site.menu} onClick={onMenu} className="lg:hidden">
            <IconMenu />
          </Button>
          <div className="hidden lg:flex items-center gap-2 w-[340px] h-10 px-3 rounded-md border border-input bg-card text-muted-foreground">
            <IconSearch size={18} />
            <label htmlFor="header-search" className="sr-only">
              {site.search}
            </label>
            <input
              id="header-search"
              ref={fieldRef}
              dir="auto"
              placeholder={site.searchPlaceholder}
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              onFocus={(e) => onSearch(e.currentTarget, e.currentTarget.value)}
              onChange={(e) => onSearch(e.currentTarget, e.currentTarget.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-section">
      <div className="mx-auto max-w-page px-gutter py-3 pb-7 flex flex-wrap gap-x-6 text-sm">
        {site.footer.map((f) => (
          <Link key={f.href} to={f.href} className="min-h-target inline-flex items-center text-link hover:underline">
            {f.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

function MenuSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current: Current }) {
  const id = useId();
  const rows = [...site.menuItems.map((m) => ({ ...m })), null, { href: site.notCovered.href, label: site.notCovered.label, current: "other" as const }] as const;
  return (
    <Sheet open={open} onClose={onClose} pc="center" height={70} labelledBy={id}>
      <h2 id={id} className="text-lg font-semibold mb-2">
        {site.menu}
      </h2>
      <nav aria-label={site.menu} className="flex flex-col">
        {rows.map((row, i) =>
          row === null ? (
            <hr key={i} className="border-border my-2" />
          ) : (
            <Link
              key={row.href}
              to={row.href}
              aria-current={current === row.current ? "page" : undefined}
              className={cx("min-h-12 flex items-center gap-3 px-2 -mx-2 rounded-md hover:bg-accent", current === row.current && "font-medium")}
            >
              <span className={cx("w-0.5 self-stretch rounded-full", current === row.current ? "bg-primary" : "bg-transparent")} aria-hidden="true" />
              {row.label}
              {current === row.current && <span className="sr-only">{site.currentPage}</span>}
            </Link>
          ),
        )}
      </nav>
    </Sheet>
  );
}

// ---------------------------------------------------------------- search

let indexPromise: Promise<SearchEntry[]> | null = null;
function loadIndex(): Promise<SearchEntry[]> {
  if (!indexPromise) indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`).then((r) => r.json() as Promise<SearchEntry[]>);
  return indexPromise;
}

const groupOrder: SearchEntry["kind"][] = ["product", "track", "term", "guide"];

function SearchSheet({ open, onClose, anchor, seed }: { open: boolean; onClose: () => void; anchor: HTMLElement | null; seed: string }) {
  const id = useId();
  const [text, setText] = useState(seed);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => setText(seed), [seed, open]);
  useEffect(() => {
    if (!open) return;
    loadIndex().then(setIndex).catch(() => setIndex([]));
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);
  const q = normalize(text);
  const results = index && q.length >= 2 ? index.filter((e) => e.norm.includes(q)) : [];
  const groups = groupOrder.map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) })).filter((g) => g.items.length > 0);
  const nothing = index && q.length >= 2 && results.length === 0;
  useEffect(() => {
    if (nothing && text.trim()) rememberUncatalogued(text.trim());
  }, [nothing, text]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied("done");
      window.setTimeout(() => setCopied("idle"), 2000);
    } catch {
      setCopied("failed");
    }
  };
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="popover" height={100} labelledBy={id} className="sheet-search">
      <form
        role="search"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const first = results[0];
          if (first) navigate(first.href);
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
        {q.length === 0 && <p className="text-sm text-muted-foreground">{searchCopy.hint}</p>}
        {q.length === 1 && <p className="text-sm text-muted-foreground">{searchCopy.tooShort}</p>}
      </form>
      {groups.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          {groups.map((g) => {
            const show = expanded.has(g.kind) ? g.items : g.items.slice(0, 5);
            return (
              <section key={g.kind} aria-label={searchCopy.groups[g.kind]} className="flex flex-col gap-1">
                <h3 className="text-xs text-muted-foreground">{searchCopy.groups[g.kind]}</h3>
                <ul className="flex flex-col">
                  {show.map((r) => (
                    <li key={r.href + r.name}>
                      <Link to={r.href} className="flex items-center justify-between gap-3 min-h-12 py-1.5 border-b border-border hover:bg-accent/60 -mx-2 px-2 rounded-md">
                        <span className="flex flex-col min-w-0">
                          <bdi className="font-medium">{highlight(r.name, text)}</bdi>
                          <span className="text-sm text-muted-foreground">{r.line}</span>
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
    </Sheet>
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

// ---------------------------------------------------------------- breadcrumbs

/** Phone: the parent as a back link with a chevron pointing right. PC: parent › current (design-system 3.1). */
export function Breadcrumb({ parent, current }: { parent: { href: string; label: string }; current: string }) {
  return (
    <nav aria-label="מיקום" className="text-sm text-muted-foreground">
      <Link to={parent.href} className="inline-flex items-center gap-0.5 min-h-target lg:min-h-0 lg:py-0 hover:underline">
        <IconBack size={16} className="lg:hidden" />
        {parent.label}
      </Link>
      <span className="hidden lg:inline" aria-hidden="true">
        {" › "}
      </span>
      <span className="hidden lg:inline" aria-current="page">
        {current}
      </span>
    </nav>
  );
}

export { companiesCopy };
