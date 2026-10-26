// The app shell: header, menu sheet, search, footer and the page frame (design-spec 1.3, flows 6.2, 6.3).
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useLocation, useRouteLoaderData } from "react-router";
import { companies as companiesCopy, formulaNames, home as homeCopy, knowledgeEntry, r3workbench, site } from "../copy";
import { fmt } from "../lib/format";
import { IconBack, IconMenu, IconSearch } from "./icons";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { SearchCombo, SearchSheet } from "./search";
import { Sheet } from "./Sheet";
import { Button, cx } from "./kit";

export type Current = "guide" | "questions" | "decoder" | "rules" | "documents" | "parameters" | "home" | "goal" | "holdings" | "other";

/** The newest `checked` date across data/, fixed at build (vite.config.ts `define`, from `dataAsOf()` in lib/data.server.ts). */
declare const __DATA_AS_OF__: string;
const dataAsOf: string = typeof __DATA_AS_OF__ === "string" ? __DATA_AS_OF__ : "";

const goalItem = site.menuItems.find((m) => m.href === "/goal")!;
const byHref = (href: string) => site.menuItems.find((m) => m.href === href)!;
type NavItem = { href: string; label: string; current?: Current };
/** The doors, in the order the first page gives them (audit 2026-10-24, A54): what the person came to do. */
const doorItems: NavItem[] = [
  byHref("/guide"),
  byHref("/questions"),
  byHref("/companies"),
  goalItem,
  { href: r3workbench.entry.holdings.href, label: r3workbench.entry.holdings.title, current: r3workbench.entry.holdings.current },
  byHref("/indices"),
  { href: homeCopy.door3.href, label: homeCopy.door3.title },
];
/** "Behind the scenes": the rule base, the parameters, what is not covered, the tool for moving to another device. */
const documentsItem: NavItem = { href: "/documents", label: knowledgeEntry.menuDocuments, current: "documents" };
const behindItems: NavItem[] = [byHref("/rules"), documentsItem, byHref("/parameters"), { href: site.notCovered.href, label: site.notCovered.label }, { href: r3workbench.entry.transfer.href, label: r3workbench.entry.transfer.label }];

/** The footer links: the same pages, destinations first, then the reference pages, then the tool. */
const footerLinks = (() => {
  const by = (href: string) => site.footer.find((f) => f.href === href)!;
  return [by("/questions"), by("/goal"), { href: r3workbench.entry.holdings.href, label: r3workbench.entry.holdings.title }, by("/rules"), { href: documentsItem.href, label: documentsItem.label }, by("/parameters"), by("/not-covered"), { href: r3workbench.entry.transfer.href, label: r3workbench.entry.transfer.label }];
})();

/** A page is the current one when the address is under the item's, or the page says it belongs to the item. */
function isCurrentItem(item: NavItem, current: Current, pathname: string): boolean {
  if (item.current && current === item.current) return true;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type OpenSearch = (el: HTMLElement | null, text?: string, via?: "focus" | "tap") => void;
const SearchOpenCtx = createContext<OpenSearch>(() => {});
export function useOpenSearch() {
  return useContext(SearchOpenCtx);
}

export function PageShell({ current, data: pageData, children, wide }: { current: Current; data: ProvenanceData; children: ReactNode; wide?: boolean }) {
  // every page's sheets know the method: the formulas with their parameters, the parameter cards, the source hosts' Hebrew names, the open questions and where each company's terms are listed (root loader)
  const method = useRouteLoaderData("root") as { formulaParameters: Record<string, string[]>; parameterAnchors: Record<string, string>; publishersHe: Record<string, string>; openQuestions: NonNullable<ProvenanceData["openQuestions"]>; companies: NonNullable<ProvenanceData["companies"]>; ownDocs: NonNullable<ProvenanceData["ownDocs"]> } | undefined;
  const data = useMemo<ProvenanceData>(() => {
    if (!method) return pageData;
    const formulas = pageData.formulas ?? Object.fromEntries([...new Set([...Object.keys(formulaNames), ...Object.keys(method.formulaParameters)])].filter((f) => f !== "_other").map((f) => [f, { name: formulaNames[f] ?? "", parameters: method.formulaParameters[f] ?? [] }]));
    return { ...pageData, formulas, parameters: pageData.parameters ?? method.parameterAnchors, publishersHe: pageData.publishersHe ?? method.publishersHe, openQuestions: pageData.openQuestions ?? method.openQuestions, companies: pageData.companies ?? method.companies, ownDocs: pageData.ownDocs ?? method.ownDocs };
  }, [pageData, method]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const [seed, setSeed] = useState("");
  // The menu and the search do nothing before the page is interactive; until then they look disabled (audit A52).
  const [ready, setReady] = useState(false);
  const closedAt = useRef(0);
  const location = useLocation();
  useEffect(() => setReady(true), []);
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);
  const openSearch: OpenSearch = (el, text = "", via = "tap") => {
    // Closing a sheet returns focus to the field it opened from; that must not open it again (audit A5).
    if (via === "focus" && Date.now() - closedAt.current < 600) return;
    setSeed(text);
    setSearchAnchor(el);
    setSearchOpen(true);
  };
  return (
    <ProvenanceProvider data={data}>
      <SearchOpenCtx.Provider value={openSearch}>
        <div className="min-h-dvh flex flex-col">
          <Header current={current} ready={ready} onMenu={() => setMenuOpen(true)} onSearch={openSearch} />
          <main className={cx("flex-1 w-full mx-auto px-gutter pb-10", wide ? "max-w-page" : "max-w-page")}>{children}</main>
          <Footer />
        </div>
        <ToTop />
        <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} current={current} />
        <SearchSheet
          open={searchOpen}
          onClose={() => {
            closedAt.current = Date.now();
            setSearchOpen(false);
          }}
          anchor={searchAnchor}
          seed={seed}
        />
      </SearchOpenCtx.Provider>
    </ProvenanceProvider>
  );
}

/** The first-page field and the header field are the same component; this is the page's. */
export function PageSearchField({ inputId }: { inputId: string }) {
  const open = useOpenSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <SearchCombo inputId={inputId} variant="home" ready={ready} onSheet={open} />;
}

/** The room the header's line keeps besides the name and the menu, in px: the gaps (32 after the name, 16 before the end group), the resting search icon (40) and a margin (8). */
const HEADER_REST = 32 + 16 + 40 + 8;

/**
 * Whether the menu fits on the header's line beside the name and the resting search icon (2026-10-25, the founder: the
 * search field ran over the last menu item; each item added since release 1 had narrowed the room). When it doesn't,
 * the menu folds into the menu button, at any width and with any number of items.
 */
function useNavFits(row: RefObject<HTMLDivElement | null>, name: RefObject<HTMLAnchorElement | null>, nav: RefObject<HTMLElement | null>): boolean {
  const [fits, setFits] = useState(true);
  /** The menu's own width, taken while it is shown (folded, it measures nothing). */
  const natural = useRef(0);
  useEffect(() => {
    const r = row.current;
    const n = nav.current;
    if (!r || !n) return;
    const measure = () => {
      if (n.offsetParent !== null) natural.current = n.scrollWidth;
      const pad = parseFloat(getComputedStyle(r).paddingInlineStart) + parseFloat(getComputedStyle(r).paddingInlineEnd);
      setFits((name.current?.offsetWidth ?? 0) + natural.current + HEADER_REST <= r.clientWidth - pad);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    ro.observe(n);
    document.fonts?.ready.then(measure);
    measure();
    return () => ro.disconnect();
  }, [row, name, nav]);
  return fits;
}

function Header({ current, ready, onMenu, onSearch }: { current: Current; ready: boolean; onMenu: () => void; onSearch: OpenSearch }) {
  const { pathname } = useLocation();
  const row = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navFits = useNavFits(row, name, navRef);
  return (
    <header className="group/header sticky top-0 z-[var(--z-sticky)] bg-background/90 backdrop-blur border-b border-border">
      <div ref={row} className="mx-auto max-w-page h-14 lg:h-16 px-gutter flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 xl:gap-8 min-w-0">
          <Link ref={name} to="/" className="text-lg font-semibold text-foreground py-2 whitespace-nowrap">
            {site.name}
          </Link>
          <nav ref={navRef} aria-label="ראשי" className={cx("hidden items-center gap-5 transition-opacity duration-[var(--duration-fast)] group-has-[[data-search-active]]/header:opacity-0 group-has-[[data-search-active]]/header:pointer-events-none", navFits && "xl:flex")}>
            {doorItems.map((item) => {
              const on = isCurrentItem(item, current, pathname);
              return (
                <Link key={item.href} to={item.href} aria-current={on ? "page" : undefined} className={cx("py-2 border-b-2 -mb-px whitespace-nowrap", on ? "font-medium border-primary" : "border-transparent hover:border-border")}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1 -me-2.5 lg:me-0 shrink-0">
          <Button variant="icon" aria-label={site.search} disabled={!ready} onClick={(e) => onSearch(e.currentTarget)} className="lg:hidden disabled:opacity-40 disabled:cursor-wait">
            <IconSearch />
          </Button>
          <Button variant="icon" aria-label={site.menu} disabled={!ready} onClick={onMenu} className={cx(navFits && "xl:hidden", "disabled:opacity-40 disabled:cursor-wait")}>
            <IconMenu />
          </Button>
          {/* the first page has its own large field; the header's would be a second one on the same screen */}
          {current !== "home" && (
            <div className="hidden lg:block xl:relative xl:size-10">
              <SearchCombo inputId="header-search" variant="header" ready={ready} onSheet={onSearch} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-section">
      <div className="mx-auto max-w-page px-gutter py-3 pb-7 flex flex-wrap items-center gap-x-6 gap-y-0 text-sm">
        <span className="w-full lg:w-auto font-medium text-foreground pt-2 lg:pt-0">{site.name}</span>
        {footerLinks.map((f) => (
          <Link key={f.href} to={f.href} className="min-h-target inline-flex items-center text-link hover:underline">
            {f.label}
          </Link>
        ))}
        <p className="w-full text-muted-foreground pt-2 flex flex-wrap gap-x-4">
          <span>{site.footerNote}</span>
          {dataAsOf && (
            <span>
              {site.footerAsOf}
              <bdi>{fmt.date(dataAsOf)}</bdi>
            </span>
          )}
        </p>
      </div>
    </footer>
  );
}

/** A small "back to the top" after a screen or so of scrolling (audit 2026-10-24, A96). */
function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 1.2);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      aria-label={site.toTop}
      onClick={() => window.scrollTo({ top: 0 })}
      className="fixed bottom-20 md:bottom-6 start-4 z-[var(--z-sticky)] size-target rounded-full border border-border bg-popover text-foreground shadow-md inline-flex items-center justify-center hover:bg-accent"
    >
      <span aria-hidden="true" className="-rotate-90 inline-flex">
        <IconBack size={20} />
      </span>
    </button>
  );
}

function MenuSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current: Current }) {
  const id = useId();
  const { pathname } = useLocation();
  const row = (item: NavItem) => {
    const on = isCurrentItem(item, current, pathname);
    return (
      <Link key={item.href} to={item.href} aria-current={on ? "page" : undefined} className={cx("min-h-12 flex items-center gap-3 px-2 -mx-2 rounded-md hover:bg-accent", on && "font-medium")}>
        <span className={cx("w-0.5 self-stretch rounded-full", on ? "bg-primary" : "bg-transparent")} aria-hidden="true" />
        {item.label}
        {on && <span className="sr-only">{site.currentPage}</span>}
      </Link>
    );
  };
  return (
    <Sheet open={open} onClose={onClose} pc="center" height={78} labelledBy={id}>
      <h2 id={id} className="text-lg font-semibold mb-2">
        {site.menu}
      </h2>
      <nav aria-label={site.menu} className="flex flex-col">
        {doorItems.map(row)}
        <hr className="border-border my-2" />
        <p className="text-xs text-muted-foreground px-0 pt-1 pb-0.5">{site.menuBehind}</p>
        {behindItems.map(row)}
      </nav>
    </Sheet>
  );
}

// ---------------------------------------------------------------- breadcrumbs

/** Phone: the parent as a back link with a chevron pointing right. PC: parent › current (design-system 3.1). */
export function Breadcrumb({ parent, current }: { parent: { href: string; label: string }; current: string }) {
  // the first page is "ראשי", not the site's name (audit 2026-10-24, A54)
  if (parent.href === "/") parent = { href: "/", label: site.homeCrumb };
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
