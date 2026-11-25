import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import { TERMS_MARK, loadTermsCode } from "./components/decoder/institutions/terms-code";

// GitHub Pages serves every page from a folder, so /guide loads as /guide/. Left in the history,
// that form makes the router fetch guide/_.data when it comes back to it (the back button), and the
// build writes only guide.data, so the page showed not-found. Drop the slash before the router reads
// the address; the site root keeps it, since it is the basename.
const { pathname, search, hash } = window.location;
if (pathname.endsWith("/") && pathname !== import.meta.env.BASE_URL) {
  window.history.replaceState(window.history.state, "", pathname.replace(/\/+$/, "") + search + hash);
}

// A page whose first view shows a house's terms hydrates once their code, a script of its own, is in: hydration finds it and keeps the
// pre-rendered terms in place (components/decoder/institutions/terms-code.ts). So does a company page whose address opens its securities
// account (`?product=brokerage`, read only in the browser): its terms then show at once, with no empty space that fills as the code comes.
// A failed load hydrates all the same, and the terms' error boundary says so.
const opensAccount = /^\/companies\//.test(pathname.slice(import.meta.env.BASE_URL.length - 1)) && new URLSearchParams(search).get("product") === "brokerage";
const terms = document.querySelector(`[${TERMS_MARK}]`) || opensAccount ? loadTermsCode().catch(() => null) : null;

void Promise.resolve(terms).then(() => startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
    // an error React recovers from by drawing the part again in the browser goes to the console, not to the page's failure notice
    // (lib/page-failure.ts): nothing on the screen is left wrong by it
    { onRecoverableError: (e) => console.error(e) },
  );
}));

// What a tap opens (the provenance sheet's cards) and what the search runs on are scripts of their own, kept out of what a page needs
// to show itself. They are fetched now, while the page hydrates and the connection is otherwise idle, so the first tap finds them in
// (fetched only at the tap, a card waits about a quarter of a second on a slow phone connection: tools/first-tap.mjs).
// Imported by name here (not through provenance.tsx and search.tsx) so these two stay apart from the script every page shares; their
// importers find them in when they ask (`loadSheets`, search.tsx's `results`).
import("./components/provenance-sheets").catch(() => undefined);
import("./components/search-results").catch(() => undefined);
