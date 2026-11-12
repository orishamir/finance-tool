// The app shell: header, menu sheet, search, footer and the page frame (design-spec 1.3, flows 6.2, 6.3).
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link, useLocation, useRouteLoaderData } from "react-router";
import { companies as companiesCopy, formulaNames, knowledgeEntry, r3workbench, site } from "../copy";
import { IconBack, IconMenu, IconSearch } from "./icons";
import { ProvenanceProvider, TermFromAddress, type ProvenanceData } from "./provenance";
import { preloadSearch, SearchCombo, SearchSheet } from "./search";
import { Sheet } from "./Sheet";
import { Button, CountingFigures, clearOfReceiptStub, cx, gershayim, TextLink, When } from "./kit";
import { useHydrated } from "../lib/hooks";

export type Current = "guide" | "decoder" | "rules" | "documents" | "parameters" | "home" | "other";

/** The newest `checked` date across data/, fixed at build (vite.config.ts `define`, from `dataAsOf()` in lib/data.server.ts). */
declare const __DATA_AS_OF__: string;
const dataAsOf: string = typeof __DATA_AS_OF__ === "string" ? __DATA_AS_OF__ : "";

const byHref = (href: string) => site.menuItems.find((m) => m.href === href)!;
type NavItem = { href: string; label: string; current?: Current };
/** The doors, in the order the first page gives them: what the person came to do. */
const doorItems: NavItem[] = [
  byHref("/guide"),
  byHref("/companies"),
  byHref("/indices"),
  byHref("/fees"), // founder, 2026-11-13: the fee page "should have a link from the header"; placed beside the other tool
  byHref("/rules"), // the header order the founder set: guide, companies, indices, rules
];
/** "Behind the scenes": the rule base, the parameters, what is not covered, the tool for moving to another device. */
const documentsItem: NavItem = { href: "/documents", label: knowledgeEntry.menuDocuments, current: "documents" };
const behindItems: NavItem[] = [documentsItem, byHref("/parameters"), { href: site.notCovered.href, label: site.notCovered.label }, { href: r3workbench.entry.transfer.href, label: r3workbench.entry.transfer.label }];

/** The footer links: the same pages, destinations first, then the reference pages, then the tool. */
const footerLinks = (() => {
  const by = (href: string) => site.footer.find((f) => f.href === href)!;
  return [{ href: documentsItem.href, label: documentsItem.label }, by("/parameters"), by("/not-covered"), { href: r3workbench.entry.transfer.href, label: r3workbench.entry.transfer.label }];
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

export function PageShell({ current, data: pageData, children }: { current: Current; data: ProvenanceData; children: ReactNode }) {
  // every page's sheets know the method: the formulas with their parameters and their math, the parameter cards, the source hosts' Hebrew names, the open questions and where each company's terms are listed (root loader)
  const method = useRouteLoaderData("root") as { formulaParameters: Record<string, string[]>; formulaTex: Record<string, string[]>; parameterAnchors: Record<string, string>; publishersHe: Record<string, string>; openQuestions: NonNullable<ProvenanceData["openQuestions"]>; companies: NonNullable<ProvenanceData["companies"]>; ownDocs: NonNullable<ProvenanceData["ownDocs"]> } | undefined;
  const data = useMemo<ProvenanceData>(() => {
    if (!method) return pageData;
    const formulas = pageData.formulas ?? Object.fromEntries([...new Set([...Object.keys(formulaNames), ...Object.keys(method.formulaParameters), ...Object.keys(method.formulaTex)])].filter((f) => f !== "_other").map((f) => [f, { name: formulaNames[f] ?? "", parameters: method.formulaParameters[f] ?? [], tex: method.formulaTex[f] }]));
    return { ...pageData, formulas, parameters: pageData.parameters ?? method.parameterAnchors, publishersHe: pageData.publishersHe ?? method.publishersHe, openQuestions: pageData.openQuestions ?? method.openQuestions, companies: pageData.companies ?? method.companies, ownDocs: pageData.ownDocs ?? method.ownDocs };
  }, [pageData, method]);
  // One frame for every page (some pages used the room of a large screen and others did not): the header, the page and
  // the footer share it, so their edges stay put from page to page; prose keeps its own measure inside it.
  const width = "max-w-wide";
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const [seed, setSeed] = useState("");
  // The menu and the search do nothing before the page is interactive; until then they look disabled.
  const ready = useHydrated();
  const closedAt = useRef(0);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);
  const openSearch: OpenSearch = (el, text = "", via = "tap") => {
    // Closing a sheet returns focus to the field it opened from; that must not open it again.
    if (via === "focus" && Date.now() - closedAt.current < 600) return;
    setSeed(text);
    setSearchAnchor(el);
    setSearchOpen(true);
  };
  return (
    <ProvenanceProvider data={data}>
      <TermFromAddress hash={location.hash} />
      <SearchOpenCtx.Provider value={openSearch}>
        <div className="min-h-dvh flex flex-col">
          <Header width={width} current={current} ready={ready} onMenu={() => setMenuOpen(true)} onSearch={openSearch} />
          <main className={cx("flex-1 w-full mx-auto px-gutter pb-10", width)}>
            <CountingFigures>{children}</CountingFigures>
          </main>
          <Footer width={width} />
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
  const ready = useHydrated();
  return <SearchCombo inputId={inputId} variant="home" ready={ready} onSheet={open} />;
}

/** The room the header's line keeps besides the name and the menu, in px: the gaps (32 after the name, 16 before the end group), the resting search icon (40) and a margin (8). */
const HEADER_REST = 32 + 16 + 40 + 8;

/**
 * Whether the menu fits on the header's line beside the name and the resting search icon (the
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

function Header({ width, current, ready, onMenu, onSearch }: { width: string; current: Current; ready: boolean; onMenu: () => void; onSearch: OpenSearch }) {
  const { pathname } = useLocation();
  const row = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navFits = useNavFits(row, name, navRef);
  return (
    <header className="group/header sticky top-0 z-[var(--z-sticky)] bg-background/90 backdrop-blur border-b border-border">
      <div ref={row} className={cx("mx-auto h-14 lg:h-16 px-gutter flex items-center justify-between gap-4", width)}>
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
          <Button variant="icon" aria-label={site.search} disabled={!ready} onPointerDown={preloadSearch} onClick={(e) => onSearch(e.currentTarget)} className="lg:hidden disabled:opacity-40 disabled:cursor-wait">
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

function Footer({ width }: { width: string }) {
  return (
    <footer className="border-t border-border mt-section">
      <div className={cx("mx-auto px-gutter py-3 pb-7 flex flex-wrap items-center gap-x-6 gap-y-0 text-sm", width)}>
        <span className="w-full lg:w-auto font-medium text-foreground pt-2 lg:pt-0">{site.name}</span>
        {footerLinks.map((f) => (
          <TextLink key={f.href} look="line" to={f.href}>
            {f.label}
          </TextLink>
        ))}
        <p className="w-full text-muted-foreground pt-2 flex flex-wrap gap-x-4">
          <span>{site.footerNote}</span>
          {dataAsOf && (
            <span>
              <When iso={dataAsOf} lead={site.footerAsOf} />
            </span>
          )}
        </p>
      </div>
    </footer>
  );
}

/**
 * A small "back to the top" after a screen or so of scrolling, at the left: in right-to-left pages the names a row starts with sit at the right,
 * and the button covered them. It steps aside while it would cover a block marked `data-keep-clear` (the deposits grid's cells on a phone),
 * and stands above the receipt's stub while the stub shows (`clearOfReceiptStub`).
 */
function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const far = window.scrollY > window.innerHeight * 1.2;
      // the button's place: 16 px from the left, 80 px (phone) or 24 px from the bottom, 44 px square
      const bottom = window.innerHeight - (window.innerWidth < 768 ? 80 : 24);
      const covers = [...document.querySelectorAll("[data-keep-clear]")].some((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.top < bottom && r.bottom > bottom - 44 && r.left < 60;
      });
      setShow(far && !covers);
    };
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
      className={cx("fixed bottom-20 md:bottom-6 end-4 z-[var(--z-sticky)] size-target rounded-full border border-border bg-popover text-foreground shadow-md inline-flex items-center justify-center hover:bg-accent", clearOfReceiptStub)}
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
export function Breadcrumb({ parent, middle, current }: { parent: { href: string; label: string }; /** A step between the parent and this page (a company, before the product shown on its page); on a phone the back link goes to it. */ middle?: { href: string; label: string }; current: string }) {
  // the first page is "ראשי", not the site's name
  if (parent.href === "/") parent = { href: "/", label: site.homeCrumb };
  const back = middle ?? parent;
  return (
    <nav aria-label="מיקום" className="text-sm text-muted-foreground">
      <TextLink look="line" tone="muted" to={back.href} className="lg:hidden">
        <IconBack size={16} />
        {gershayim(back.label)}
      </TextLink>
      <TextLink tone="muted" to={parent.href} className="hidden lg:inline-flex lg:tap-area">
        {gershayim(parent.label)}
      </TextLink>
      <span className="hidden lg:inline" aria-hidden="true">
        {" › "}
      </span>
      {middle && (
        <>
          <TextLink tone="muted" to={middle.href} className="hidden lg:inline-flex lg:tap-area">
            {gershayim(middle.label)}
          </TextLink>
          <span className="hidden lg:inline" aria-hidden="true">
            {" › "}
          </span>
        </>
      )}
      <span className="hidden lg:inline" aria-current="page">
        {gershayim(current)}
      </span>
    </nav>
  );
}

export { companiesCopy };
