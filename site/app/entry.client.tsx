import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// GitHub Pages serves every page from a folder, so /guide loads as /guide/. Left in the history,
// that form makes the router fetch guide/_.data when it comes back to it (the back button), and the
// build writes only guide.data, so the page showed not-found. Drop the slash before the router reads
// the address; the site root keeps it, since it is the basename.
const { pathname, search, hash } = window.location;
if (pathname.endsWith("/") && pathname !== import.meta.env.BASE_URL) {
  window.history.replaceState(window.history.state, "", pathname.replace(/\/+$/, "") + search + hash);
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});

// What a tap opens (the provenance sheet's cards) and what the search runs on are scripts of their own, kept out of what a page needs
// to show itself. They are fetched now, while the page hydrates and the connection is otherwise idle, so the first tap finds them in
// (fetched only at the tap, a card waits about a quarter of a second on a slow phone connection: tools/first-tap.mjs).
// Imported by name here (not through provenance.tsx and search.tsx) so these two stay apart from the script every page shares; their
// importers find them in when they ask (`loadSheets`, `loadSearchCode`).
import("./components/provenance-sheets").catch(() => undefined);
import("./components/search-results").catch(() => undefined);
