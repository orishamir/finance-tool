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
