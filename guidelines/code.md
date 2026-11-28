# How to write code

How the site's code is written: types, numbers, modules, React, pages and
their data, the browser, safety, tests, commits and review. Where code
goes and the shared pieces to reuse are in `docs/architecture.md` 3.10;
interface pieces follow [design.md](design.md).

## The checks decide

- **A rule a script can check is checked by a script,** in `npm run check`,
  not by a reviewer's eye. When a mistake gets past the checks, add a check
  only if it is a kind of mistake that can come back elsewhere, and add it
  to a run that already exists (the layout check, the speed check, the unit
  tests), with a planted failure it must catch. No browser flow for one
  feature. `npm run check` stays under about 7 minutes, its time today.
- **A count that can't reach zero at once is a ratchet:** new code adds
  none, and the allowed count only goes down.
- `npm run check` runs Oxlint with its type-aware and React rules, and
  knip, beside the typecheck. The rules that catch real mistakes are on:
  promises left unawaited, a `switch` that misses a kind, the rules of
  hooks and of React (no state copied in an effect, pure render), `any`,
  `!` (as a ratchet), and `undefined` inside a template string. Style
  rules are off. A rule is silenced only on its own line, with the reason
  in the same comment.

## Types

- **A kind is a union, and code that branches on it handles every member.**
  A `switch` on a `kind` ends with `default: return assertNever(x)`, or the
  branches are a `Record<Kind, …>`. Adding a kind then fails to compile
  everywhere it isn't handled. This is the type side of "a new kind of
  thing gets its own abstraction" ([working.md](working.md)).
- **States that exclude each other are separate shapes,** not optional
  fields plus flags. A blocked figure has no value to read by mistake.
- **Units that are easy to confuse get their own type:** a fraction and a
  percent (0.25 and 25), a yearly and a monthly rate, an ISO date, a fund
  or rule id. The brand is set where the value is parsed (Zod `.brand()`),
  and a small helper sets it again after arithmetic. An ordinary amount
  stays a `number`.
- **What comes from outside the code is `unknown` until its schema parses
  it:** device storage, the address, an imported file, fetched JSON. Never
  `JSON.parse(x) as T`. A type comes from its schema (`z.infer`), never
  from a hand-written twin.
- **No `any`, `as unknown as` or `@ts-ignore` outside tests.**
  - An `as` only after a check the compiler can't follow, with a comment
    saying which check.
  - A `!` only where the line before proves it. Otherwise narrow, or read
    through a helper that throws with the reason.
  - `@ts-expect-error` carries its reason.
- **Small rules:**
  - `satisfies` for tables and settings;
  - `as const` for literal tables;
  - a union instead of an `enum`;
  - an exported function other than a component declares its return
    type;
  - a generic only where it ties two places together.

## Numbers and dates

- **The engine works in shekels as floating-point numbers.**
  - It compares results within the golden tolerance.
  - It rounds only where the rule base says the authority rounds, through
    one named helper.
  - No integer agorot and no decimal library: a double keeps 15
    significant digits, far more than these sums need.
- **What the reader sees is formatted only by `fmt`** (`lib/format.ts`,
  with cached `Intl.NumberFormat`s), never with `toFixed` or `Math.round`.
  - `(2.55).toFixed(1)` is "2.5", and `Math.round(-2.5)` is -2.
  - `toFixed` is fine for SVG coordinates.
  - A value that rounds to zero never prints with a minus sign.
  - A calculated figure shows whole shekels ([wording.md](wording.md)),
    so a breakdown's lines add up to its total.
- **Never `formatRange` or compact notation.** They print a dash and a
  Latin "K", against [wording.md](wording.md).
- **"Today" is the date on the person's own clock (`lib/today.ts`).**
  Never `toISOString().slice(0, 10)`: that is the UTC date, a day behind in
  Israel for two or three hours after midnight. A date-only string parses
  as UTC.

## Modules

- **A module is judged by depth, not length:** much behind a small
  interface. Past about 2,000 lines, check whether it splits along a clean
  seam. A swarm of tiny files is worse than one deep module.
- **No barrel files inside `site/app`.** A package's one entry point
  (`@finance-tool/engine`) is its interface and stays.
- **The engine imports only the schema:** nothing from the site, no I/O,
  no clock. A test holds it.
- **One number, one function.** A new way to reach a number reuses the
  function that already computes it, never a second copy. Where it can't,
  a test holding the two equal on every case is written first, before the
  new way is built.
- **Repeated knowledge goes; code that only looks alike may stay.** Two
  pieces of code that look alike merge only when they change for the same
  reason. When a shared function grows a parameter or a branch for one
  caller, move that code back into the caller.
- **An expected outcome is a value, not an exception:** a blocked rule, a
  missing figure, an entry that doesn't parse.
  - Throw only on a broken invariant, with a message naming it.
  - Re-throw with `{ cause }`.
  - Never an empty `catch`.
- **Look before writing a helper.** The table in architecture 3.10 lists
  the shared pieces, and a second copy of one is removed when found. knip
  finds files, exports and dependencies that nothing uses.

## React

- **Render is pure.** No reading the clock, storage, `window` or a random
  number while rendering, and no changing anything. StrictMode stays on:
  in development it runs renders and effects twice to show what isn't
  pure.
- **The first render in the browser matches the pre-rendered page.**
  - A value only the browser has comes through `useSyncExternalStore`,
    with a cached snapshot and a server snapshot, one hook per source.
    Such values are storage, a media query, the address hash and other
    tabs.
  - Otherwise, read it after `useHydrated`.
  - Ids come from `useId`.
  - `suppressHydrationWarning` is never a fix.
- **Derive, don't sync.**
  - What can be computed from props or state is computed while rendering.
  - No effect copies a prop or state into state.
  - No effect tells a parent about a change: the event handler that made
    the change does that.
  - A `key` resets a part that must start fresh.
- **An effect only keeps React in step with something outside it** (a
  listener, an observer, a timer, focus), and always cleans up. To read
  the latest value without re-running, use `useEffectEvent`. A list of
  dependencies is never silenced.
- **One fact, one place.** Filters and order live in the address
  (`useAddressParams`), not also in state.
- **Slow work never delays the field.**
  - The field updates at once. The slow chart or table renders from
    `useDeferredValue` inside a `memo` child.
  - Measure first ([design.md](design.md): under 100 ms).
  - Work that still takes over about 50 ms on a phone slowed four times
    moves to a Web Worker. The engine is pure, so it can.
- **`memo`, `useMemo` and `useCallback` only where a measurement shows they
  help.** First move state down, or pass `children`.
- **A list's keys are stable ids.** An index only in a list that never
  reorders. A component is never defined inside another.
- **A kit piece's options are one `variant` union,** not booleans that can
  contradict each other. Content comes in as `children`. No polymorphic
  `as` prop.
- **A failure never leaves wrong figures on screen in silence.**
  - A tool that can throw on odd input has its own error boundary, so the
    rest of the page stands.
  - A page-wide handler for `error` and `unhandledrejection` shows a
    notice that something broke.

## Pages and their data

- **A loader returns only what the first view draws.** Its data is paid
  for twice, inside the page and again as the route's `.data` file. The
  rest is a resource route fetched when needed.
- **Internal pages are reached with `<Link>`,** with `prefetch="intent"`
  on the likely next page. `<a>` is only for jumps within a page and for
  other sites.
- **A page brought back by the Back button reads saved state again**
  (`pageshow` with `persisted`). Nothing listens to `unload`.

## In the browser

- **Target what Safari on an iPhone runs.** The build targets Baseline
  "widely available". A newer feature is used only with a fallback that
  does the same job; check web-features before using it.
- **Within a frame, read layout first, then write.** Listeners for scroll,
  touch and wheel are passive unless they must cancel the gesture.
- **Storage can fail.** Every access is in `try`/`catch`. A failure means
  "not saved": the page says so and keeps working. The site asks once for
  persistent storage (`navigator.storage.persist()`).
- **Safari deletes a site's storage after seven days of use without a tap,
  click or key on it.** A site added to the Home Screen is exempt, but its
  storage is separate from Safari's and starts empty. The export file is
  the way across and the backup.

## Safety

- **Never put HTML built from data into the page.** The one exception is
  KaTeX output from the repository's own text, with `trust` off.
- **Links to other sites carry `rel="noopener noreferrer"`.**
- **Few dependencies.** A new one needs a reason the code can't meet in a
  few lines.
  - Install with `npm ci` from the lockfile.
  - Install scripts are off (`ignore-scripts=true` in `.npmrc`). A package
    that truly needs one is rebuilt by name and listed there, with why.
  - A version is installed only after it has been public for a week
    (`min-release-age=7`, from npm 11.10).
  - Updates are done by hand, on a schedule, each in its own commit,
    through the full check and the build diff.
- **A workflow starts with read-only permissions** and raises them per
  job. Every action it uses is locked to a commit.
- **Each page sets a Content Security Policy** in a `<meta>`, written after
  pre-rendering with the hashes of that page's inline scripts.

## Tests

- **A test checks what the reader sees or what a function returns,** never
  how it is built: no class names, no internal names. A page element is
  found by its role and its words.
- **An expected value comes from somewhere other than the code under
  test.**
  - The sources are the Python check for the golden cases, a worked
    example in `docs/method.md`, and the rule base.
  - It is never copied from what the code printed.
  - A builder never changes an expected value or loosens an assertion to
    make a test pass. A changed expectation is reported on its own, with
    why.
- **See a new test fail before trusting it:** break the code it guards,
  or run it on the old version.
- **Exact values only over fixed inputs.** A test over the live `data/`
  checks what must hold whatever the data says, so a routine refresh
  never breaks a test about logic.
- **Time zone, language and clock are fixed in every run:**
  - `TZ=Asia/Jerusalem` for the tests;
  - `locale: "he-IL"` and `timezoneId` in every browser context;
  - a fixed "today" passed in.
- **No fixed waits.**
  - A browser script waits for a condition, or turns motion off
    (`reducedMotion: "reduce"`). Never `waitForTimeout`.
  - A test is never retried until it passes.
  - A flaky test is fixed, or set aside in a list with a reason, as the
    layout check's leftovers are.
- **No large snapshots.** Each assertion says what it expects.
- **Property tests run a few cases in the fast run and many in the deep
  run.** A failure's seed and path become an example test.
- **A piece people drag, scroll inside or tap through layers gets a
  browser test with real pointer and touch input,** kept with the layout
  check. A drag or a pan uses Chrome's `Input.dispatchTouchEvent`;
  Playwright's `touchscreen` only taps. Each QA step that found a bug
  becomes a test.
- **The main flows are timed** on a CPU slowed four times: the check fails
  on any input that takes over 100 ms or a layout shift while dragging.
- **Now and then, mutation testing** on the engine files a change touched
  shows assertions that wouldn't notice a wrong formula. It is a measure,
  never a gate.

## Commits and review

- **A refactor and a change in behaviour never share a commit.** A
  refactor passes the build diff (architecture 3.10).
- **The commit message says what changed and why.** That is where history
  goes, since comments and docs hold none ([project.md](project.md)).
- **Builder work gets a code review before it lands,** by an agent that
  sees the brief, the diff and this file, but not the builder's reasoning.
  - It checks the design, correctness, needless complexity, names, and
    whether the tests would fail if the code broke.
  - Style is a note, never a reason to send work back.
  - A finding that serves only screen readers is not a finding:
    accessibility is out of scope ([project.md](project.md)). Keyboard use
    on a computer, real buttons and links, and focus that returns are
    ordinary engineering and stay in scope.
