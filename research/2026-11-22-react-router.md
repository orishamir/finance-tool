# React 19.3 and React Router 8.5 for a pre-rendered static site: best practice against code.md

Research track: React and React Router in framework mode, pre-rendered (`ssr: false`) to GitHub Pages. Measured against
`guidelines/code.md` as of 22.11.2026 and the installed versions: react and react-dom 19.3.1, react-router and
@react-router/dev 8.5.0, vite 8.3.5. Version-specific claims were checked against the installed packages' own code,
changelogs and docs (react-router 8.5.0 ships its docs in `node_modules/react-router/docs`). Where I give my own
judgement it is marked **(inference)**.

## Summary

code.md is already close to current best practice. It covers pure render, the first browser render matching the
pre-rendered page, deriving state instead of syncing it, `useEffectEvent`, `useDeferredValue`, the loader-data budget,
bfcache and the compiler-derived lint rules. Most of its React section matches react.dev in 2026. The gaps are at the
seams that a static, serverless site makes worse:

1. A hydration mismatch is silent, and it is costly. The site has no `<Suspense>` boundary, so React's recovery
   redraws the whole document in the browser. The entry only logs the error to the console, and no check fails on it.
2. Daily deploys break tabs that stay open. Each deploy deletes the old hashed chunks, and the site's own lazy
   imports retry a file that no longer exists.
3. The app-wide inputs live in a copy of the store. They are read in an effect and kept in a second copy beside the
   store, which goes against code.md's own hydration and "one fact" rules.

The past year changed four things that matter here:
- React 19.3 made `use(browser())` and `<ViewTransition>` stable.
- React Router 8.5 deprecated its own view-transition API.
- React Compiler 1.0 is stable, and its rules already run in Oxlint.
- Event Timing and LCP became Baseline with Safari 26.2.

Three smaller points:
- code.md's `prefetch="intent"` line describes code that doesn't exist.
- Data fetched in effects could use `use()`.
- Server-era features (Actions, `useOptimistic`, `useActionState`) don't apply to this site.

---

## 1. A hydration recovery must fail the checks, and browser-only parts get their own boundary

**The practice.** React treats every hydration mismatch as a bug. When one happens, React throws away the server
HTML up to the nearest `<Suspense>` boundary and draws that part again in the browser. With no boundary, it redraws
the entire root. For a page that hydrates `document`, that means the whole page is built twice: a long task on a
phone, and possibly a visible flash. React 19.3 adds `use(browser())`. It marks a subtree as browser-only: the
pre-render emits the nearest `<Suspense>` fallback, and the browser draws the real content without the bailout
counting as an error. react.dev now recommends it over the "isClient after an effect" pattern.

**The evidence.**
- The installed react-dom 19.3.1 (`cjs/react-dom-client.development.js`) has two recovery messages: "...recover by
  instead client rendering from the nearest Suspense boundary" and "...client rendering the entire root". Official
  code; strong.
- react.dev `hydrateRoot`: "React recovers from some hydration errors, but you must fix them like other bugs... In the
  best case, they'll lead to a slowdown". On browser-only content: "call `use(browser())` instead of waiting for an
  Effect". Official; strong.
- React 19.3.0 changelog, "New React DOM Features": `browser()` is a stable export. It is present in the installed
  `react-dom.production.js`. The react.dev `use` page: "must be inside a `<Suspense>` boundary during server
  rendering". Official; strong.

**Where code.md stands.**
- Covered: lines 109–116 (matching first render, `useSyncExternalStore` with a server snapshot,
  `suppressHydrationWarning` is never a fix).
- Missing: what happens when the rule is broken, and a check that catches it. Line 10 says a rule a script can check
  is checked by a script.

**Where the code stands.**
- `site/app/entry.client.tsx:22` sends `onRecoverableError` to `console.error` only.
- `site/scripts/csp-check.mjs:6-7` prints other console errors and "leaves them to the other checks". None of the
  layout, chart or response checks listens for them.
- `grep '<Suspense' site/app` finds nothing.
- The browser-only reads go through `useHydrated` (`lib/hooks.ts:14`, used at `components/shell.tsx:67,115` and
  `routes/invest.tsx:139`). The code is correct but has no containment.

**Proposed guideline lines.**
- "A hydration recovery is a failure: the browser checks open every kind of page and fail on any
  `onRecoverableError`."
- "A part that can only draw in the browser sits under its own `<Suspense>`, whose fallback is the pre-rendered
  placeholder, and reads `use(browser())`. `useHydrated` stays for a single value inside a part that pre-renders."

**What it costs.**
- The check: about 20 lines. The entry pushes each recoverable error onto a `window` array that the existing
  Playwright checks read. A planted mismatch proves the check.
- The boundaries: a few `<Suspense>` wrappers around browser-only pieces, migrated as they are touched.
- Caveat from react.dev: don't suspend on a value read through `useSyncExternalStore`. Store updates can't be
  transitions, so the fallback would come back on every change.

## 2. A deploy must not strand a tab that is already open

**The practice.** A host may delete the previous deploy's assets. Vite's guidance is to listen for
`vite:preloadError` and reload the page, and to serve HTML that isn't cached.

React Router already reloads the page when a route module fails to import (installed `dom/ssr/routeModules.js:22-26`).
It has no version-skew detection for `ssr: false`. That detection exists only with lazy route discovery against a
server, in the 8.3–8.5 changelogs.

A tab brought back by bfcache days later is the common case on a phone. web.dev says to refresh state on `pageshow`
with `persisted`, and to use `location.reload()` when a full refresh is needed.

**The evidence.**
- vite.dev, "Load Error Handling" (Vite 8 docs): "When a new deployment occurs, the hosting service may delete the
  assets from previous deployments"; the handler shown is `window.location.reload()`. Official; strong.
- React Router 8.5.0's installed source (above). Official code; strong.
- web.dev bfcache (updated 16.10.2026). Official (Chrome); strong.

**Where code.md stands.** Missing. Line 159 covers state reread on `pageshow`, but not code or data that is out of
date.

**Where the code stands.**
- `.github/workflows/refresh-rates.yml:13` runs a daily cron, and every push to `main` deploys through
  `actions/deploy-pages` (`ci.yml:110`). So a tab kept since yesterday runs code whose chunks are gone.
- `components/provenance.tsx:93-99` and `components/search.tsx:28-40` retry a failed `import()` "at the next need".
  After a deploy, the retry asks for the same deleted file forever, so the provenance sheet and search stay broken
  until a manual reload. **(inference from the code; not reproduced)**
- A route module that is already loaded can also receive a `.data` file whose shape changed in the deploy.
  **(inference)**

**Proposed guideline line.** "A deploy never strands an open tab: a failed chunk load (`vite:preloadError`, or an
`import()` that fails on a file the server no longer has) reloads the page once, and a page brought back by Back or
by the tab becoming visible compares the build id with `version.json` and loads the next page as a full document if
they differ."

**What it costs.**
- One small module, a `version.json` written at build, and one browser test that serves two builds.
- Reloading is safe because entered values are already in storage. A guard in `sessionStorage` stops a reload loop.

## 3. The app-wide inputs come from the store, not from a copy of it

**The practice.** A value from storage is read through `useSyncExternalStore`, with a server snapshot. It is not set
into state by an effect. A single store is the one source, with no mirror state and no effect that writes back.
react.dev ("You Might Not Need an Effect"; `useSyncExternalStore`) and the compiler-backed lint rules
(`set-state-in-effect`, `no-deriving-state-in-effects`) say the same. A provider whose value changes re-renders every
consumer.

**The evidence.**
- react.dev `useSyncExternalStore`: the server snapshot "runs on the client during hydration", and `getSnapshot` must
  return a cached, immutable value. Official; strong.
- React Compiler 1.0 post: lint rules such as `set-state-in-effect`. Official; strong.

**Where code.md stands.** In conflict with the code. Line 110 says storage comes through `useSyncExternalStore`.
Line 119 says no effect copies state into state. Line 127 says one fact, one place.

**Where the code stands.**
- `site/app/lib/inputs.tsx:40-43` reads storage in an effect and calls `setState(load())`.
- Lines 46-52 copy the store into state again when another tab writes.
- Lines 56-62 write the copy back in an effect.
- The store itself is already a `useSyncExternalStore` hook (`lib/state.ts:471`), and `lib/device-store.ts` shows the
  intended pattern.
- `InputsProvider` wraps every page (`root.tsx:160`), so the read after hydration re-renders the whole app once.
- The lint ratchet lists this file under `react(set-state-in-effect)`.

**Proposed guideline line.** None. The code should be brought to code.md. Add only: "A provider never holds a copy of
a store's value; it passes the store's hook."

**What it costs.**
- A refactor of one 90-line module. `useInputs()` keeps its interface, so callers don't change.
- It needs its own commit and the build diff (line 240). It removes one entry from the lint ratchet.

## 4. Decide on React Compiler 1.0, then make line 135 say what is true

**The practice.**
- React Compiler 1.0 has been stable since October 2025. For new code, react.dev recommends relying on the compiler
  for memoization and keeping `useMemo`/`useCallback` as escape hatches, for example for an effect dependency.
- For existing code: "leaving existing memoization in place (removing it can change compilation output) or carefully
  testing before removing".
- The compiler skips any component that breaks a rule, so adoption is safe and can be gradual.
- For React Router framework mode, react.dev documents adding it through a Babel Vite plugin. Oxc's native compiler
  for Vite 8 is labelled experimental.

**The evidence.**
- react.dev blog "React Compiler v1.0" (07.10.2025). Official; strong.
- react.dev compiler installation page (Vite and React Router sections). Official; strong.
- oxc.rs blog (18.08.2026): `react({ compiler: true })` is "experimental", and 22 compiler rules are in Oxlint.
  Official (Oxc); medium.

**Where code.md stands.**
- Line 135: "`memo`, `useMemo` and `useCallback` only where a measurement shows they help".
- Line 131: "a `memo` child".
- Neither mentions the compiler.

**Where the code stands.**
- `site/app` has 125 `useMemo`, 20 `useCallback` and 1 `memo`, so line 135 doesn't describe the code.
- `.oxlintrc.json:21-36` already enables the compiler's rules (`purity`, `refs`, `immutability`,
  `preserve-manual-memoization`, and others).
- The ratchet still allows `react(refs)` 79 and `react(immutability)` 10. Those components would be skipped.
- `site/vite.config.ts` has no compiler.

**Proposed guideline line**, if adopted: "React Compiler memoizes. New code adds `useMemo`/`useCallback`/`memo` only
as an escape hatch (an effect dependency, a measured case), and existing ones stay until a measurement shows removing
them is safe." If not adopted, say so in line 135 and record why.

**What it costs.**
- Two or three dev dependencies (the Babel plugin and a Vite Babel plugin), against line 182.
- A Babel pass per module at build, which adds time and memory on a 20 GB WSL machine.
- Gain unmeasured. Meta reports interactions "more than 2.5× faster" in some cases. Run the response check (line 232)
  before and after. **(inference: worth trying behind a branch; adopt only on a measured gain)**

## 5. Data fetched after start: a cached promise read with `use()`

**The practice.** react.dev no longer recommends fetching in an effect with manual loading and error state. A promise
created outside render and cached (in a module, or keyed by URL) is read with `use()` inside `<Suspense>`, and an
error boundary catches a rejection. A refresh starts the new promise in a transition, so the old content stays on
screen.

**The evidence.** react.dev `use`: "Promises passed to `use` in Client Components must be cached"; "Compared to
`use`, this approach requires managing loading and error states manually". Official; strong.

**Where code.md stands.** Missing. Line 150 says to fetch "when needed" from a resource route but not how to read
the result.

**Where the code stands.**
- `routes/documents.tsx:42-56` (`useDocs`, an effect with a race guard and three states).
- Similar module-cached fetches: `lib/bundle.ts:8`, `components/search.tsx:16`, `routes/companies.tsx:58` and
  `routes/rules.tsx:131`.
- The caching half of the pattern is already there.

**Proposed guideline line.** "Data fetched after the page starts is a promise cached in its module and read with
`use()` under a `<Suspense>` and an error boundary; an effect that fetches into state is the old form."

**What it costs.**
- Per use: a `<Suspense>` and a boundary (`ToolBoundary` exists). Migrate as each place is touched.
- Don't apply it to anything that depends on a store value (finding 1's caveat).

## 6. `prefetch="intent"`: the guideline describes code that doesn't exist

**The practice.**
- In framework mode, `<Link prefetch>` adds `<link rel="prefetch">` for the route module, its CSS and its `.data`.
- `"intent"` starts 100 ms after `mouseenter`, `focus` or `touchstart`, and cancels on leave or blur (installed
  `dom/ssr/components.js:28-86`). On a phone the tap often completes before that. **(inference)**
- `"viewport"` would fetch the `.data` of every link in view: 425 KB raw (98 KB compressed) for `/tracks`.

**Where code.md stands.** Line 156: "with `prefetch="intent"` on the likely next page". In conflict with the code.

**Where the code stands.** `grep prefetch= site/app` finds nothing. `entry.client.tsx:31-32` warms its own chunks
instead.

**Proposed guideline line.** "`prefetch="intent"` on a link to a page whose script and first data are small; never
`viewport` or `render` on a list of links." Or drop the clause if the founder prefers.

**What it costs.** One attribute per chosen link. The weight check is unaffected, since prefetch is fetched only on
intent.

## 7. View transitions: React's `<ViewTransition>`, not the router's prop

**The practice.**
- React Router 8.5 deprecates `viewTransition` on `Link`/`NavLink`/`Form`, `useViewTransitionState`, and
  `isTransitioning`, in favour of React 19.3's `<ViewTransition>` placed around the `<Outlet>`.
- Router updates are already transitions, so no wrapper is needed.
- Back/Forward (`popstate`) doesn't animate.
- Turn animations off under `prefers-reduced-motion`.
- Same-document view transitions have been Baseline "newly available" since 14.10.2025 (Safari 18, Firefox 144).
  Without support, navigation simply happens, which is the fallback line 164 asks for.

**The evidence.**
- react-router CHANGELOG 8.5.0, "Minor Changes", and the shipped `docs/how-to/view-transitions.md`. Official; strong.
- react.dev React 19.3 post: "Updates outside of a Transition don't trigger animations". Official; strong.
- web-features data. Official; strong.

**Where code.md stands.** Missing. **Where the code stands.** Not used. `RestoreScroll` (`root.tsx:77-133`) scrolls
in a layout effect, and any page animation would have to be tested against it. **(inference)**

**Proposed guideline line.** "A page animation uses React's `<ViewTransition>`, never the router's deprecated
`viewTransition`, and stops under reduced motion."

**What it costs.** Nothing until wanted.

## 8. What `ssr: false` already does for revalidation

**The practice.** With `ssr: false`, React Router replaces the default revalidation. A route's loader runs again only
when its own path parameters change (installed `dom/ssr/routes.js:253-266`). A change to the query, or to another
route's parameters, fetches no `.data`. The root, which has no parameters, never reloads. A route's
`shouldRevalidate` is needed only to stop a reload when an optional parameter changes.

**Where code.md stands.** Missing (lines 127-128 and 150 assume it). **Where the code stands.** Correct:
`routes/tracks.tsx:16` and `routes/invest.tsx:56` stop refetching when the optional parameter changes, and
`routes/company.tsx:134` does the same for `:fund`. The address filters (`lib/hooks.ts:48-60`) fetch nothing.

**Proposed guideline line.** "A route whose data covers every value of an optional parameter exports
`shouldRevalidate` returning false; nothing else is needed for query changes, which never refetch."

**What it costs.** Nothing.

## 9. Error reporting without a server

**The practice.**
- React Router's documented client hook is `<HydratedRouter onError>`. It runs for every error the router's
  boundaries catch.
- React's `hydrateRoot` adds `onCaughtError` and `onUncaughtError` beside `onRecoverableError`. By default React logs
  all of them to the console.
- With no server, the only uses are the console, the page's own notice, and the checks.

**The evidence.** Shipped `docs/how-to/error-reporting.md`, and `HydratedRouterProps.onError` in the 8.5.0 types;
react.dev `hydrateRoot`. Official; strong.

**Where code.md stands.** Covered for the reader (lines 142-146). **Where the code stands.**
- `lib/page-failure.ts` covers uncaught errors.
- `root.tsx:166-171` recognizes a missing `.data` file by matching the error message ("No result found for routeId|
  Unable to decode turbo-stream"). Those strings are internal: 8.4.0 changed that error to carry a `cause`. A decode
  failure caused by a deploy mismatch would also show "not found". **(inference)**

**Proposed guideline line.** "The checks fail on an error any boundary caught on a page that should have none
(`onCaughtError`), as they do for hydration recoveries."

**What it costs.** It shares the hook from finding 1. A test that pins the two message strings stops a router update
from silently turning them into "something broke".

## 10. Smaller points

- **Route props over `useLoaderData`.** React Router's route-module docs prefer the typed `loaderData` prop
  (`Route.ComponentProps`), which is "automatically typed correctly for the route". `useLoaderData<T = any>`
  defaults to `any`. The routes use `useLoaderData<typeof loader>()` 20 times (`routes/tracks.tsx:46`). Proposed:
  "A route component takes `loaderData` from its props." Cheap, mechanical.
- **`meta` export.** React Router's docs recommend React 19's `<title>`/`<meta>` in the component over the `meta`
  export. The export isn't deprecated, and pre-rendering handles both. The site's `pageMeta` works; no migration is
  needed. **(inference)**
- **Server-era React features don't apply.** Actions, `useActionState`, `useOptimistic` and form actions are for
  async mutations. Storage writes here are synchronous. `<Activity>` (19.2) keeps hidden UI's state, but no current
  page needs it. Don't adopt them for their own sake. **(inference)**
- **React 19 forms of old APIs.** `forwardRef` has 0 uses (ref is a prop), which is good. Two `<Ctx.Provider>`
  remain; React 19 allows `<Ctx value>`, and react.dev says `Provider` will be deprecated later.
- **Measuring on iPhones is now possible.** Event Timing and LCP became Baseline on 12.12.2025 with Safari 26.2, so
  a field reading of INP and LCP works on the phones the site targets. `scheduler.yield()` is still not in Safari
  (web.dev); use a `setTimeout` fallback. Module workers have been Baseline widely available since 06.2023, so line
  133's Worker path is open. A worker needs `worker-src 'self'` (or `script-src`) in the policy written at line 193.
- **Resource routes get a `.data` twin.** The build writes `.data` beside each pre-rendered resource route
  (installed `@react-router/dev/dist/vite.js:2140`), for fetchers. The site uses no fetchers, so files such as
  `indices-bundle.json.data` (2.8 MB) are dead weight in the deploy. Readers never fetch them. The post-build step
  could delete them. Low value.
- **Pre-render concurrency.** `prerender: { paths, concurrency }` is available. It isn't worth it on this machine's
  memory. **(inference)**

## What changed in the last year, and what's deprecated

- **React 19.2 (10.2025):** `<Activity>`, `useEffectEvent` stable, Performance Tracks, `useId` prefix `_r_`.
- **React 19.3 (09.09.2026):** stable `<ViewTransition>`, `addTransitionType`, Fragment refs, and `use(browser())`.
  Transitions render independently. A `useDeferredValue` that got stuck is fixed. Effects run twice in StrictMode
  during hydration (development only). Updates from `resize` events are batched until the next frame. No
  deprecations.
- **React Compiler 1.0 (10.2025):** stable. Its lints are in `eslint-plugin-react-hooks` and Oxlint.
- **React Router 8.0:**
  - `react-router-dom` removed.
  - `future.v8_*` flags removed; trailing-slash-aware `.data` requests are now the default (`entry.client.tsx:9-12`
    already handles this).
  - `splitRouteModules` defaults to true (no effect without `clientLoader`).
  - `meta`'s `data` argument removed in favour of `loaderData`.
  - Minimum React 19.2.7.
- **React Router 8.4:** `createStaticRouter({ branches })` deprecated.
- **React Router 8.5:** the router's view-transition APIs deprecated. `unstable_fetch` and API-only mode are
  unstable, so don't use them.

## Sources

- React 19.3 post, react.dev, 09.09.2026: https://react.dev/blog/2026/09/09/react-19-3 (official)
- React CHANGELOG (19.3.0 section): https://raw.githubusercontent.com/facebook/react/main/CHANGELOG.md (official)
- Installed react-dom 19.3.1, `cjs/react-dom-client.development.js` (hydration recovery messages) and
  `cjs/react-dom.production.js` (`browser` export) (official code)
- React 19.2 post: https://react.dev/blog/2025/10/01/react-19-2 (official)
- React Compiler v1.0: https://react.dev/blog/2025/10/07/react-compiler-1 (official)
- Compiler installation: https://react.dev/learn/react-compiler/installation (official)
- `hydrateRoot`: https://react.dev/reference/react-dom/client/hydrateRoot (official)
- `use`: https://react.dev/reference/react/use (official)
- `browser`: https://react.dev/reference/react-dom/browser (official)
- `useSyncExternalStore`: https://react.dev/reference/react/useSyncExternalStore (official)
- react-router 8.5.0 and @react-router/dev 8.5.0 CHANGELOG.md, as installed (official); online at
  https://github.com/remix-run/react-router/releases
- Docs shipped in react-router 8.5.0 (`node_modules/react-router/docs`), online at reactrouter.com:
  - Pre-rendering: https://reactrouter.com/how-to/pre-rendering
  - View transitions: https://reactrouter.com/how-to/view-transitions
  - Error reporting: https://reactrouter.com/how-to/error-reporting
  - React transitions: https://reactrouter.com/explanation/react-transitions
  - Route module: https://reactrouter.com/start/framework/route-module (official)
- Installed react-router 8.5.0 code (official code):
  - `dist/development/lib/dom/ssr/routes.js` (`ssr: false` revalidation)
  - `single-fetch.js` (data decode errors)
  - `routeModules.js` (reload on module failure)
  - `components.js` (prefetch timing)
- Installed @react-router/dev 8.5.0 `dist/vite.js` (pre-render requests, resource-route `.data`) (official code)
- Vite build guide, Load Error Handling: https://vite.dev/guide/build.html (official)
- Oxc, React Compiler support, 18.08.2026: https://oxc.rs/blog/2026-08-18-react-compiler-support (official, Oxc)
- web.dev, Optimize long tasks: https://web.dev/articles/optimize-long-tasks (official, Chrome; updated 19.12.2024)
- web.dev, bfcache: https://web.dev/articles/bfcache (official, Chrome; updated 16.10.2026)
- web-features data (Baseline status for view-transitions, event-timing, largest-contentful-paint,
  js-modules-workers, scheduler): https://cdn.jsdelivr.net/npm/web-features/data.json (official, W3C WebDX)
- Leads only, not cited:
  - devx.com, codercops, infoq on React 19.3
  - recca0120 and dev.to on compiler setup for Vite 8
