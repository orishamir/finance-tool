# TypeScript, Zod, CSS, Vite, tests, lint and supply chain: current practice against the guidelines

22.11.2026. One of five research tracks; React, React Router and UI/UX are other tracks' work. Versions checked are the ones
installed: TypeScript 7.0.2, Zod 4.6.7, Tailwind 4.3.3, Vite 8.3.5 (Rolldown 1.2.15), Vitest 5.0.5, Playwright 1.63.0,
Oxlint 1.93.0 with oxlint-tsgolint 7.0.2007, knip 6.45.1, fast-check 4.10.2. Baseline statuses come from web-features 3.47.0,
read today. Nothing was installed or built. One 10-line Playwright script ran in the scratchpad to confirm a CSP behaviour.

## Summary

The guidelines already ask for most of what current practice recommends, and in most places the code does it: strict
TypeScript with `erasableSyntaxOnly`, brands set by Zod, exhaustive switches checked by lint, cascade layers, logical
properties, `@container`, `field-sizing` behind `@supports`, a hashed CSP in a meta tag with a check that plants a failure,
SHA-pinned actions, `npm ci`, `ignore-scripts`, weight budgets, property tests split into fast and deep runs. The gaps are
places where a rule is written down but nothing enforces it, or where the enforcement doesn't reach the readers' setup.
Five matter most. Every browser check runs in Chromium only, though most readers are on iPhones, and Playwright ships a
current WebKit. `min-release-age=7` does nothing on either machine, because the local npm is 9.2.0 and CI's is 10.9.9.
No check fails on a hydration error; the last one, on /kit, was found by hand. Nothing ever runs the suite in shuffled
order, though `isolate: false` depends on the claim that it passes that way. And about 45 files of TypeScript and check
scripts sit outside every `tsc` run. Smaller items: two type-aware lint rules worth turning on, a script for "check
web-features", Trusted Types (now Baseline, iOS 26), updating the GitHub actions for Node 24, and a fixed clock in browser
checks.

## Findings, by impact

### 1. Run the browser checks in WebKit as well as Chromium

- **The practice.** To catch Safari-only failures cheaply, test in Playwright's WebKit on Linux CI. Playwright says its
  WebKit "is derived from the latest WebKit main branch sources", and calls Linux CI "the most affordable option". For the
  closest match to Safari it recommends macOS.
- **The evidence.** playwright.dev/docs/browsers (official, strong). The 1.63 release notes list WebKit 26.6 beside
  Chromium 153 (official). Linux WebKit is not iOS Safari: it has no iOS visual viewport, no on-screen keyboard and no iOS
  font stack. It does share the engine's layout, CSS support, popover and dialog behaviour **(inference)**.
- **Guidelines.** code.md:164 says "Target what Safari on an iPhone runs". design.md:116–124 lists features that need an
  iPhone fallback. Neither says to run any check in WebKit: **missing**.
- **Code.** Every browser check launches `chromium`: site/scripts/layout-check.mjs:89, csp-check.mjs, response-check.mjs,
  kit-input-check.mjs and chart-check. CI installs only `--only-shell chromium` (.github/workflows/ci.yml, "Install Chrome").
  No script in site/scripts or tools mentions WebKit.
- **Proposed line (code.md, Tests).** "The layout check and the policy check run in WebKit too, at 390 and 320 px, since
  readers are on iPhones. A gesture test may stay in Chrome, which alone gives real touch."
- **Cost.** One more browser install in CI, about 1–2 minutes with its system packages **(inference)**, and roughly double
  the time of the two checks. The gesture tests can't move, because `Input.dispatchTouchEvent` is a Chrome DevTools call.
  Expect a first round of WebKit-only findings to fix or list as leftovers.

### 2. `min-release-age` is not in force anywhere

- **The practice.** Install a version only after a waiting period, so a hijacked release is usually caught and pulled
  first. npm documents `min-release-age` as "only versions that were available more than the given number of days ago
  will be installed". A setting that silently does nothing is worse than none: people believe they are covered.
- **The evidence.** docs.npmjs.com config (official; it shows 11.21.3 as "Legacy", so npm 12 is current). The Node release
  index (official): Node 22.23.5 ships npm 10.9.9, Node 24.22.3 ships npm 11.19.1 and Node 26.13.1 ships npm 11.20.0.
  Node 22 has been in maintenance since 21.10.2025 and ends 30.04.2027 (nodejs/Release schedule, official). This machine
  runs `/usr/bin/npm` 9.2.0, the distribution's package, and there `npm audit signatures` fails with `EEXPIREDSIGNATUREKEY`
  on d3-time, a registry key that expired on 29.01.2025. Signature checking works only on a newer npm. npm's own audit page
  says to update "beyond the version that ships with Node.js".
- **Guidelines.** code.md:187–188 says "A version is installed only after it has been public for a week
  (`min-release-age=7`, from npm 11.10)". The rule is **covered** on paper, but nothing makes it true.
- **Code.** .npmrc:13 sets it. Its own comment, .npmrc:11–12, warns that "an older npm ignores it without a word". CI runs
  Node 22 (ci.yml:33, 55), but there `npm ci` ignores the setting anyway. The gap that counts is on the machine where
  `npm install` and `npm update` run.
- **Proposed line (code.md, Safety).** "npm is 11.10 or newer wherever a version is chosen; `package.json`'s `devEngines`
  says so and a check fails on an older npm. `npm audit signatures` passes before an update lands."
- **Cost.** Upgrading npm on this machine once (the founder's step). A `devEngines.packageManager` entry, which npm checks
  before `install`, `ci` and `run`, with `onFail` defaulting to error. npm 9 doesn't know the field, so a three-line version
  check in tools/check.mjs is the reliable guard **(inference)**. Moving CI to Node 24 LTS is optional and not needed for
  this.

### 3. Fail every browser check on a hydration error

- **The practice.** React treats a mismatch between the pre-rendered HTML and the first browser render as a bug: "You
  should treat mismatches as bugs and fix them". It recovers from some, and reports them through `onRecoverableError` or
  the console. React also gives "no guarantees that attribute differences will be patched up". So a check must read the
  console of the production build and fail on what it finds. Production reports text and structure mismatches, but
  attribute mismatches only in development **(inference from the docs' wording)**.
- **The evidence.** react.dev/reference/react-dom/client/hydrateRoot (official, strong).
- **Guidelines.** code.md:109 says "The first render in the browser matches the pre-rendered page", and code.md:10 says a
  rule a script can check is checked by a script. No check enforces this one: **missing**.
- **Code.** site/app/entry.client.tsx:22 sends recoverable errors to `console.error`. csp-check.mjs:56 and :114 collect
  console errors and uncaught errors, but only print them: "an error the policy did not cause is another check's to judge:
  said, not failed". No other browser script listens for `console` or `pageerror`. Commit 5f376c75c fixed "the /kit
  hydration error", which a person found.
- **Proposed line (code.md, React).** "Every browser check fails on an error in the console or an uncaught error, a
  hydration mismatch above all. An expected one is listed with its reason, as the layout check's leftovers are."
- **Cost.** About 20 lines in site/scripts/browser.mjs, shared by every check, and a short leftovers file for the
  existing noise. Optionally, a separate run of /kit and one page of each kind against a development build, the only build
  that reports attribute mismatches **(inference)**.

### 4. Make the shuffled-order claim a check

- **The practice.** When test files share modules (`isolate: false`), one test can leak state into the next. Run the suite
  in random order with a printed seed, so a dependence on order shows up and can be repeated. Vitest has
  `sequence.shuffle` (files and tests), with `sequence.seed` defaulting to `Date.now()`. Vitest 5 also adds `--repeats` to
  "help find flaky tests".
- **The evidence.** vitest.dev/config/sequence and vitest.dev/blog/vitest-5 (official). The blog also says inline
  projects "inherit the root config by default, so `extends: true` is no longer needed".
- **Guidelines.** code.md:218–223 says a flaky test is fixed or set aside, never retried. It says nothing on order:
  **missing**.
- **Code.** vitest.config.ts:49–50 says "The suite passes with one worker and in shuffled order" above `isolate: false`.
  No script runs it shuffled: tools/check.mjs and tools/test-deep.mjs never pass `--sequence`. vitest.config.ts:36, 39 and
  40 still set `extends: true`.
- **Proposed line (code.md, Tests).** "The deep run shuffles files and tests and prints its seed. A failure in shuffled
  order is a leak between tests and is fixed like any other."
- **Cost.** One flag in tools/test-deep.mjs. Vitest notes the run loses its longest-first scheduling, so it is a little
  slower. Removing `extends: true` is a separate refactor commit.

### 5. Bring the files outside the workspaces into the typecheck

- **The practice.** Every TypeScript file passes the compiler. Plain JavaScript can be checked too, with `allowJs` and
  `checkJs` reading its JSDoc types.
- **The evidence.** TypeScript's tsconfig reference for `checkJs` (official). TypeScript 7 makes `types` default to `[]`
  and `strict` default to true (devblogs, "Announcing TypeScript 7.0", official). Every tsconfig here already lists its
  `types`.
- **Guidelines.** code.md:15 says `npm run check` runs the typecheck. The Types section assumes every file is typed. That
  some files sit outside it is **missing**.
- **Code.** There is no root tsconfig.json. `npm run typecheck` runs only the workspaces, so tests/environment.test.ts,
  tests/setup.ts, tools/rank-scan.ts, tools/search-top3.ts and vitest.config.ts are never type-checked. About 40 `.mjs`
  checks in tools/ and site/scripts/ are never type-checked either. That includes layout-check, csp.mjs and weight.mjs,
  the scripts that decide whether the site goes live; site/tsconfig.json has no `allowJs`. **(Inference:** tsgolint may
  build an inferred program for these files. Not tested.)
- **Proposed line (code.md, The checks decide).** "Every `.ts` file and every check script is in a tsconfig that the
  typecheck runs; scripts are checked through JSDoc (`checkJs`)."
- **Cost.** A root tsconfig with `allowJs` and `checkJs` over tools/, tests/, site/scripts/ and the config files. A first
  pass of JSDoc types or `// @ts-check` fixes, held as a ratchet if the count is large. TypeScript 7's speed keeps the
  added time small, but its default of 4 `--checkers` uses more memory: watch this machine's 20 GB.

### 6. Two more type-aware lint rules

- **The practice.** Oxlint's type-aware backend now covers "60 of the 62" type-aware rules from typescript-eslint. It runs
  on TypeScript 7's Go code, so it needs no compiler API, which TypeScript 7.0 doesn't ship ("We expect TypeScript 7.1 to
  ship with a new (and different) API"). Two rules that are off by default fit code.md's rules:
  - `typescript/no-unnecessary-type-assertion` (category suspicious, with an automatic fix) removes an `as` or `!` that
    changes nothing.
  - `typescript/restrict-plus-operands` (category pedantic) refuses `number + string`, a silent way to print "1000" + "5"
    in a sentence.

  `require-array-sort-compare`, `no-base-to-string` and `no-misused-spread` are in the correctness category and already on.
- **The evidence.** oxc.rs type-aware guide and rules list (official). TypeScript 7.0 announcement (official).
- **Guidelines.** code.md:15–21 names the rules that are on. code.md:43–46 says an `as` only after a check and a `!` only
  where the line before proves it. Lint enforces neither rule: **partly covered**.
- **Code.** .oxlintrc.json:5–9 turns on `typeAware`. tools/lint-baseline.json holds 5,488 `no-non-null-assertion` findings
  and 11 for `require-array-sort-compare`. Many `!` added because of `noUncheckedIndexedAccess` may be on values that are
  already non-null, and the new rule's fixer would remove those **(inference)**.
- **Proposed line (code.md:15–21, added to the list).** "…, an `as` or `!` that changes nothing, `+` between a number and a
  string, …"
- **Cost.** Two lines in .oxlintrc.json, a `--accept` of their counts as a ratchet, and the fixer run in its own refactor
  commit.

### 7. Check Baseline by script, not by eye

- **The practice.** ESLint's CSS plugin has a `use-baseline` rule. It flags properties, values, at-rules, functions, units
  and selectors that are not Baseline "widely" available, and it understands `@supports` guards. Its data is web-features.
- **The evidence.** github.com/eslint/css, docs/rules/use-baseline.md (official). Status of the features asked about,
  from web-features 3.47.0 (official, strong):

  | Feature | Baseline | iOS Safari | Here |
  |---|---|---|---|
  | cascade layers, logical properties, `<dialog>`, container size queries, `svh`/`dvh` | widely | 15–16 | used |
  | `:has()` | widely since 19.06.2026 | 15.4 | used |
  | oklch/oklab, `color-mix()` | widely since 09.11.2025 | 15.4 / 16.2 | used (theme.css) |
  | `text-wrap: balance` | widely since 13.11.2026 | 17.5 | allowed for headings (design.md:207) |
  | popover | newly (27.01.2025) | 18.3 | used, after a feature test (value-menus.tsx:202) |
  | `@starting-style`, `transition-behavior` | newly (2024) | 17.5 / 17.4 | not used |
  | same-document view transitions | newly (14.10.2025) | 18 | not used |
  | `::details-content` | newly (16.09.2025) | 18.4 | used; a browser without it snaps (app.css:122–140) |
  | `field-sizing` | newly (16.06.2026) | 26.2 | inside `@supports` (app.css:1103) |
  | Trusted Types | newly (24.02.2026) | 26 | not used (finding 8) |
  | anchor positioning | not Baseline; Firefox lacks it | 27 | not used; menus are placed by script, keep it so |
  | `interpolate-size` | Chrome only | none | used as an enhancement (app.css:125) |
  | `text-wrap: pretty`, cross-document view transitions, `closedby`, `popover="hint"`, `overscroll-behavior`, customizable `<select>` | not Baseline | 26 / 18.2 / none / none / none / 27 | design.md:116–124 lists the last four |

- **Guidelines.** design.md:124 says "Check web-features before using anything newer", and code.md:164–166 says the same.
  It is a manual step, against code.md:10: **in conflict**.
- **Code.** The CSS is careful, as the table shows, but nothing would stop the next feature added without a guard.
- **Proposed line (design.md, CSS).** "A script checks the built stylesheet against web-features: a feature not widely
  available fails unless it sits inside `@supports` or is listed with its fallback."
- **Cost.** Running the rule on build/client/assets/*.css, not on the sources, sees every utility Tailwind emitted and
  avoids Tailwind's own syntax **(inference)**. That takes two dev dependencies (eslint, @eslint/css), against "few
  dependencies", or a script of about 100 lines over `web-features` and the CSS parser Vite already ships. Expect a short
  allow-list of enhancements that are fine to lose: `interpolate-size`, `::details-content`, `scrollbar-gutter`.

### 8. Add Trusted Types to the policy

- **The practice.** `require-trusted-types-for 'script'` makes the browser throw when a plain string reaches `innerHTML`
  or another DOM XSS sink. Only values from a named policy pass. It is Baseline newly available since February 2026
  (MDN, official), with iOS Safari 26 (web-features). Older browsers ignore it, so the fallback is today's behaviour.
- **The evidence.** MDN `require-trusted-types-for` and the MDN CSP guide (official). The guide adds that "a report-only
  policy cannot be delivered in a `<meta>` element", so it can't be tried in report-only mode first.
- **Guidelines.** code.md:179–180 says "Never put HTML built from data into the page", with KaTeX the one exception, and
  code.md:193 covers the meta policy. The browser enforcing that rule is **missing**.
- **Code.** There are exactly two sinks: site/app/components/kit/formula.tsx:34 (KaTeX) and site/app/root.tsx:145 (a
  constant inline script). site/scripts/csp.mjs:36–43 builds the policy. csp-check would exercise it on /kit, where KaTeX
  draws.
- **Proposed line (code.md, Safety).** "The policy requires Trusted Types; KaTeX's output passes through the one named
  policy, `katex`."
- **Cost.** Two directives in csp.mjs and a small policy wrapper in formula.tsx. The risk is a library or React path that
  writes a string into a sink in some state csp-check doesn't visit. Run the kit input check and the layout check under it
  before it goes live **(inference)**.

### 9. Update the pinned GitHub actions to Node 24, and consider the workflow lockfile

- **The practice.** GitHub removed Node 20 from Actions runners on 23.09.2026 and asks workflow authors to "update to the
  latest versions of JavaScript actions that support Node 24". Workflow lockfiles became generally available on 28.10.2026,
  Free plan included. They pin "actions and their transitive dependencies", and a check mode can run in CI.
- **The evidence.** github.blog changelog, both notices (official).
- **Guidelines.** code.md:191–192 says permissions start read-only and every action is locked to a commit: **covered**.
  Composite actions' own dependencies are **missing**.
- **Code.** The pinned commits declare `using: node20`: actions/checkout and setup-node at ci.yml:25, 31, 47 and 53, and
  deploy-pages at ci.yml:110 (each action.yml read at its pinned SHA). upload-pages-artifact (ci.yml:89) is composite and
  pulls in `actions/upload-artifact@ea165f8…`, pinned by its authors, not by us. Checkout keeps its token in .git/config
  by default. `persist-credentials: false` closes that, at no cost **(inference; zizmor's "artipacked" rule)**.
- **Proposed line (code.md:192).** "…locked to a commit, transitive ones too (`.github/workflows/actions.lock`)."
- **Cost.** One commit bumping four actions to their Node 24 releases. `gh actions-lock` is a CLI extension on the
  founder's machine.

### 10. Fix the clock in the browser checks

- **The practice.** Playwright's `page.clock.setFixedTime()` fixes `Date.now()` and `new Date()` while timers keep
  running.
- **The evidence.** playwright.dev/docs/clock (official).
- **Guidelines.** code.md:214–217 says "Time zone, language and clock are fixed in every run". It is **covered** for
  Vitest, but only zone and language are fixed in the browser.
- **Code.** site/scripts/browser.mjs:5 sets `locale` and `timezoneId` only. Among the browser scripts, only
  tools/alone-check.mjs mentions a clock. A page that computes from "today" (lib/today.ts) can render differently on the
  day of the check than on the day of the build **(inference)**.
- **Proposed line.** None needed: browser.mjs follows the existing rule by fixing the clock to the build's date.
- **Cost.** About two lines in browser.mjs.

### 11. Covered, with small notes

- **TypeScript 7.** tsconfig.base.json:7–19 has `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`,
  `noImplicitOverride`, `erasableSyntaxOnly`, `verbatimModuleSyntax` and `isolatedModules`, and no `baseUrl` or other
  option that TypeScript 7 now refuses. Branded units, `satisfies`, a union over an enum, and exhaustiveness through
  `assertNever` plus `switch-exhaustiveness-check` with `considerDefaultExhaustiveForUnions: false` (.oxlintrc.json:17)
  are all in code.md:25–55. `exactOptionalPropertyTypes: false` is a deliberate choice. Turning it on is the one strictness
  flag left, and it costs many `| undefined` edits for little gain where states are already separate shapes
  **(inference)**.
- **Zod 4.** Parsing at boundaries, `z.infer` and `.brand()` are all in code.md:32–40. In the browser, a `z.object()` runs
  a `new Function("")` probe when it is built (zod v4/core/util.js:218). A run in Chrome confirmed that a caught
  `new Function` under this policy still raises a `script-src eval` violation. root.tsx:145 turns the probe off through
  `globalThis.__zod_globalConfig`, which is Zod's internal store; the documented call is `z.config({ jitless: true })`.
  The inline script is the only way to set it before route modules build their schemas, and csp-check would catch a Zod
  update that moves the store. Keep it, with this reason beside it.
- **Vite 8.** The default `build.target`, `'baseline-widely-available'`, is fixed for the major at 01.01.2026:
  `chrome111, edge111, firefox114, safari16.4, ios16.4`. That is Tailwind 4's own floor (Safari 16.4). code.md:164's
  "widely available" means that dated target, not today's wider set: `Object.groupBy` became widely available in September
  2026 but is outside both the target and `lib: ES2023`. Saying so in code.md would end the doubt. Lightning CSS minifies
  by default. The `moduleSideEffects` setting (vite.config.ts) is the supported Rolldown route.
- **Performance budgets.** Covered by code.md:153–155 and tools/weight-budgets.json. As a scale only: Alex Russell's 2026
  survey (a lead, not a source) puts a P75 mobile budget near 300–350 KiB of gzipped JS. The front page's 327 KB budget is
  at that edge; iPhones are faster than the P75 device. web.dev's "good" INP is 200 ms, and the 100 ms rule (design.md:36)
  is stricter.
- **Snapshots and screenshots.** "No large snapshots" and "no screenshots" stand. Playwright 1.59–1.63 added
  `page.ariaSnapshot()` and ARIA snapshots as JSON: a text record of roles and names, which fits "found by its role and its
  words". It is worth using only for a single small piece.
- **Mutation testing.** The StrykerJS Vitest runner doesn't support browser mode and always uses per-test coverage. Running
  it with `npx` would fetch a version outside the lockfile and the waiting period. If it is used, install it pinned like
  any other dependency **(inference)**.
- **SRI.** Low value here: the scripts are same-origin, and anyone who can change them can change the HTML that would
  carry their hashes **(inference)**. In CSP, `'self'` on a github.io project site also admits scripts from the account's
  other Pages sites, which share the origin. A path source such as `…/finance-tool/assets/` would narrow it **(inference;
  low risk while the founder owns every site there)**.

## Sources

Official:
- TypeScript 7.0 announcement, 08.07.2026: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- TypeScript tsconfig reference (`checkJs`, `exactOptionalPropertyTypes`): https://www.typescriptlang.org/tsconfig
- Oxlint type-aware linting: https://oxc.rs/docs/guide/usage/linter/type-aware.html
- Oxlint rules: https://oxc.rs/docs/guide/usage/linter/rules.html
- Zod compile and jitless: https://zod.dev/compile ; Zod 4.6.7 source, node_modules/zod/v4/core/util.js:218 and schemas.js:1194–1196
- Vite build options (v8.3.7 docs): https://vite.dev/config/build-options
- Vite 8 announcement: https://vite.dev/blog/announcing-vite8
- Tailwind CSS compatibility: https://tailwindcss.com/docs/compatibility ; v4.3 post: https://tailwindcss.com/blog/tailwindcss-v4-3
- Vitest 5 announcement, 03.09.2026: https://vitest.dev/blog/vitest-5
- Vitest sequence options: https://vitest.dev/config/sequence
- Playwright release notes: https://playwright.dev/docs/release-notes
- Playwright browsers: https://playwright.dev/docs/browsers
- Playwright clock: https://playwright.dev/docs/clock
- React `hydrateRoot`: https://react.dev/reference/react-dom/client/hydrateRoot
- web-features 3.47.0 data: https://unpkg.com/web-features/data.json
- ESLint CSS `use-baseline`: https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md
- MDN `require-trusted-types-for`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for
- MDN CSP guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
- npm config (`min-release-age`, `ignore-scripts`, `allow-git`): https://docs.npmjs.com/cli/v11/using-npm/config
- npm package.json `devEngines`: https://docs.npmjs.com/cli/v11/configuring-npm/package-json#devengines
- npm audit (signatures): https://docs.npmjs.com/cli/v11/commands/npm-audit
- Node.js release index: https://nodejs.org/dist/index.json ; schedule: https://github.com/nodejs/Release/blob/main/schedule.json
- GitHub, Node 20 removed from Actions, 23.09.2026: https://github.blog/changelog/2026-09-23-node-20-is-no-longer-available-in-github-actions
- GitHub, workflow lockfiles GA, 28.10.2026: https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available
- GitHub, SHA-pinning policy, 15.08.2025: https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/
- OpenSSF npm Best Practices Guide v1.1 (archived 2023): https://github.com/ossf/package-manager-best-practices/blob/main/published/npm.md
- StrykerJS Vitest runner: https://stryker-mutator.io/docs/stryker-js/vitest-runner/

Other (leads only):
- Alex Russell, "The Performance Inequality Gap, 2026", known only through summaries; the original is at infrequently.org
- zizmor's "artipacked" audit, for `persist-credentials`

Local observations, 22.11.2026: `npm --version` gives 9.2.0 (`/usr/bin/npm`); `npm audit signatures` fails with
EEXPIREDSIGNATUREKEY; each pinned action's action.yml was read at its SHA; a Chrome run of `new Function("")` under
`script-src 'self' 'unsafe-inline'` raised `script-src eval`.
