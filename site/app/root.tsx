import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, useLocation, useNavigationType, useRouteError } from "react-router";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import "./app.css";
import interLatin from "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import heeboHebrew from "../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2?url";
import { InputsProvider } from "./lib/inputs";
import NotFound from "./routes/not-found";
import { PageShell } from "./components/shell";
import { system } from "./copy";

/** What every page's provenance sheet needs to know: which parameters each formula uses, which parameter card each id belongs to, and the Hebrew name of each source host (PageShell reads it). */
export async function loader() {
  const { loadFormulaParameters, loadParameterAnchors, loadPublishersHe } = await import("./lib/data.server");
  return { formulaParameters: loadFormulaParameters(), parameterAnchors: loadParameterAnchors(), publishersHe: loadPublishersHe() };
}

export function links() {
  return [
    { rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
    // the two fonts every page uses, fetched with the HTML instead of after the CSS (audit 2026-10-24, A49)
    { rel: "preload", as: "font", type: "font/woff2", href: heeboHebrew, crossOrigin: "anonymous" as const },
    { rel: "preload", as: "font", type: "font/woff2", href: interLatin, crossOrigin: "anonymous" as const },
  ];
}

const SCROLL_KEY = "mekor.scroll";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const positions: Record<string, number> = {};
try {
  if (typeof window !== "undefined") Object.assign(positions, JSON.parse(window.sessionStorage.getItem(SCROLL_KEY) ?? "{}"));
} catch {
  /* private mode: positions then live only until reload */
}
const persist = () => {
  try {
    const keys = Object.keys(positions);
    for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete positions[k];
    window.sessionStorage.setItem(SCROLL_KEY, JSON.stringify(positions));
  } catch {
    /* as above */
  }
};

/**
 * The key a scroll position is kept under: the history entry and its address. Every page loaded fresh in a tab (a typed
 * address, a bookmark, a reload) has the entry key "default", so the key alone brought one page's position to another
 * page (2026-10-25, found by research/audit/tools/jump-check.mjs: a guide page typed after scrolling another opened 2,900 px down).
 */
const entryKey = (l: { key: string; pathname: string; search: string }) => `${l.key}:${l.pathname}${l.search}`;

/**
 * Scroll position per history entry (audit 2026-10-24, A51). Back and forward bring the page to where it was, waiting for
 * the page to be tall enough and turning off the smooth scrolling meanwhile (it made the jump arrive after the check);
 * a new page opens at the top, or at its `#` target. Replaces the router's ScrollRestoration. A change of the query on the
 * same page (a filter or a switch that keeps its state in the address, passing `preventScrollReset`) keeps the place: until
 * 2026-10-25 it went to the top, so pressing such a control moved the page under the pointer (research/audit/tools/jump-check.mjs).
 */
function RestoreScroll() {
  const location = useLocation();
  const type = useNavigationType();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const save = () => persist();
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);
  useEffect(() => {
    const key = entryKey(location);
    const on = () => {
      positions[key] = window.scrollY;
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      persist();
    };
  }, [location.key]);
  useIsoLayoutEffect(() => {
    const samePage = lastPath.current === location.pathname;
    lastPath.current = location.pathname;
    if (type !== "POP" && samePage && !location.hash) return;
    const html = document.documentElement;
    const target = type === "POP" ? positions[entryKey(location)] : undefined;
    if (target === undefined || target <= 0) {
      const el = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (el) el.scrollIntoView();
      else if (type !== "POP") window.scrollTo(0, 0);
      return;
    }
    html.style.scrollBehavior = "auto";
    let frame = 0;
    const started = performance.now();
    const stop = () => {
      window.cancelAnimationFrame(frame);
      html.style.scrollBehavior = "";
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
    const tick = () => {
      window.scrollTo(0, target);
      const reached = Math.abs(window.scrollY - target) < 2;
      if (reached || performance.now() - started > 1500) return stop();
      frame = window.requestAnimationFrame(tick);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    tick();
    return stop;
  }, [location.key]);
  return null;
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <RestoreScroll />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <InputsProvider>
      <Outlet />
    </InputsProvider>
  );
}

/** A route's `.data` file is missing: GitHub Pages answers it with 404.html, and the router reports a decode or
 * "no result" error instead of a 404 response. That is an unknown address, not a failure. */
function isMissingData(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /No result found for routeId|Unable to decode turbo-stream/.test(error.message);
}

export function ErrorBoundary() {
  const error = useRouteError();
  if ((isRouteErrorResponse(error) && error.status === 404) || isMissingData(error)) return <NotFound />;
  return (
    <PageShell current="other" data={{ rules: {}, terms: {}, dimensions: {}, today: "" }}>
      <div className="mx-auto w-full max-w-measure flex flex-col gap-4 pt-10">
        <h1 className="text-2xl font-semibold">{system.wentWrong.title}</h1>
        <p>{system.wentWrong.line}</p>
        <div className="flex flex-wrap gap-x-6">
          <a href={import.meta.env.BASE_URL} className="text-link min-h-target inline-flex items-center hover:underline">
            {system.wentWrong.home}
          </a>
          <button type="button" className="text-link min-h-target hover:underline" onClick={() => window.location.reload()}>
            {system.wentWrong.reload}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
