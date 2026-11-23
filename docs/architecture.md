# Architecture

How the site is built: a React Router app pre-rendered to static files and served by GitHub Pages, a calculation engine that runs in the browser, and a refresh pipeline that keeps `data/` current, in one npm workspace. It holds the design and its reasons; what a module does is in its code. The rules it serves are in `guidelines/`, `docs/product.md`, `docs/method.md` and `docs/data-schema.md`.

No financial figure appears here. Where one matters, the data file, rule or formula is named.

---

## 1. What drives the design

| # | Driver | From |
|---|---|---|
| K1 | **No server-side personal data.** Every calculation that uses a person's inputs runs in their browser. The site is static files; there is no application server. | D1, product.md §4, data-schema §1 ("the engine runs in the browser") |
| K2 | **Engine separate from the UI**, testable alone against the golden scenarios (`tests/golden/`) and checkable by the finance-reviewer formula by formula. | method.md §13 |
| K3 | **Every displayed number is a value object** (sourced, computed or entered) with source, date and state, and the page shows which. | CLAUDE.md, D3, D7, data-schema §1 |
| K4 | **Rule gating.** An `open` rule never computes; `secondary` and `institution` rules compute and label; a figure past its `effective_to` stops the run with "figure not updated". | D10, method.md §13 |
| K5 | **Data validated against the schema before every build**, including the cross-file checks in data-schema §4. | data-schema §4 |
| K6 | **Scheduled refresh** at the cadences of product.md §6, keeping dated snapshots because no public archive exists, and never hiding a stale number. | D3, product.md §6 |
| K7 | **Hebrew, right to left, both screen sizes, each checked at 1440 and 390 px** (guidelines/design.md), with numbers, percentages, fund numbers and Latin names embedded in Hebrew text. | guidelines/project.md, product.md §2 |
| K8 | **Interactive on nearly every page.** People change fields and watch graphs respond. No page shows or reads a saved goal; the pages run on their own plan numbers (D34, D37). | product.md 3.1, 3.10 |
| K9 | **Saved state is local, versioned and portable**: saved automatically, exported and imported as a file, and revisited against the stored versions. Old export files must keep importing. | 3.9, N3 |
| K10 | **Data sources are awkward**: CMA CSVs are Windows-1255, data.gov.il has a WAF that rejects some queries, CBS requires a User-Agent, gov.il, TASE and ISA block scripts. | data-landscape.md §1 |
| K11 | **Non-commercial, small audience, one maintainer.** Low running cost and few moving parts beat scale. | CLAUDE.md |
| K12 | **Polished interface and good-looking graphs.** Look and feel is a requirement, not a finishing touch. | founder |

---

## 2. Shape of the system

```
 sources (data.gov.il CMA + MoF, CBS, ECB)             hand-collected (tariffs, funds, catalogue,
            │  scheduled fetch (GitHub Actions)          deposit terms, rules figures, parameters)
            ▼                                                       │  commit
   pipeline: fetch → raw archive → normalise → validate → diff ─────┤
            │  commit (or pull request when a sanity check trips)   │
            ▼                                                       ▼
   data/  (JSON, git = snapshot history)             ◄┘
            │
            ▼
   build: validate (schema + cross-file) → resolve data bundles → engine at build time
          (first view of each page, dimension marks) → pre-rendered pages + search index
            │
            ▼
   GitHub Pages ─────►  browser: interactive pages, engine in the page, local saved state,
                        stale flags and effective-date checks computed against today's date
```

Three properties matter more than any tool choice:

1. **One engine, three runtimes.** The same engine package runs in tests (Node), at build time (to pre-render each page's first view, such as a guide timeline at the default scenario P-05, so a graph appears before any script runs) and in the browser (for the person's own inputs). It has no DOM, network or file access; callers hand it resolved data.
2. **Time-dependent checks run in the browser, not at build.** Stale flags (D3) and the "figure not updated" stop (method §13) are computed against the reader's current date. If the refresh pipeline breaks and nothing rebuilds, the flags still fire. A flag computed at build would freeze in the "fresh" state exactly when it matters.
3. **Git is the snapshot store for normalised data.** Every refresh is a commit; git history and each file's `checked` date are the record of what changed (there is no change log, D24). Raw downloads (the evidence) go to a separate archive (section 3.3).

---

## 3. Components

### 3.1 Schema package

`packages/schema`: one Zod schema per collection in `docs/data-schema.md` §3, written once and used by the validator, the pipeline, the build, the engine's input types and the import of saved-state files (section 3.6). The value object is the base type; every collection is built from it, so a bare number fails validation by construction. The package also exports JSON Schema files (`packages/schema/json/`), so a hand-edited file under `data/` that names one in a `$schema` line gets autocompletion and inline errors in the editor.

`docs/data-schema.md` says what the schemas can't: what to record in each field and why. A test (`packages/schema/test/data-schema-doc.test.ts`) holds its value-object field table and its list of units to the code, so the two cannot drift silently.

### 3.2 Validator

`packages/pipeline/src/validate.ts`, run as `npm run validate`. It runs in CI on every change, as part of `npm run check`, and inside the pipeline before anything is committed. A problem fails the run; a warning (the rule-source, date, open-question and scope warnings of data-schema §4 items 12 to 14) is printed and does not fail it.

Checks, data-schema §4 first:

1. Schema of every file (§4 items 1, 3, 4, 5).
2. Every `rule_ids` entry exists as a `### <ID>` heading in `.claude/skills/il-finance/references/`, and every `data/rules/` file's `strength` matches the rule base (§4 item 2). The rule base is markdown; the validator reads only headings and the strength line, it does not interpret rules.
3. Every `formula` named in a record exists as an `F-nn` in `docs/method.md` (§4 item 6) **and** is either implemented in the engine's formula registry or listed in its `pending` list (section 3.4).
4. Exposure and fund cross-links (§4 item 8). Stored dimension marks equal the marks regenerated from `rule_ids` (§4 item 9).
5. (No check: there is no change log, D24.)
6. No typed digit in the pinned-rules facts and answers (`data/parameters/pinned-rules.json`): every figure there is a `{ID:figure}` slot over one of the row's rules.

Staleness (§4 item 7) is **not** a build failure; it is computed in the browser (section 2, property 2). The validator only reports it.

### 3.3 Refresh pipeline

`packages/pipeline`: a command-line program with one adapter per source, run as `npm run refresh -- <source>... [--dry-run] [--no-archive] [--force]`. The scheduled workflows only call it; the program is the same on a laptop, a CI runner or a home machine.

Per adapter: **fetch** (with the User-Agent and download-URL quirks from data-landscape.md §1) → **archive** the raw response, compressed, recording its key and hash → **normalise** to the schema (including Windows-1255 to UTF-8 for CMA CSVs) → **validate** → **diff** against the current files → write the new snapshot or appended observations. The commit of the refresh is the record (git history, `checked` dates).

| Adapter | Source | Cadence (product.md §6) | Writes to |
|---|---|---|---|
| `cma` (`adapters/cma.ts`) | CMA gemelnet and pensia-net, data.gov.il | daily check; acts when a new `REPORT_PERIOD` appears | `data/cma/<dataset>@<YYYY-MM>.json` (data-schema 3.13) |
| `cbs-cpi` (`adapters/cbs-cpi.ts`) | CBS consumer price index | daily check; monthly data | `data/series/cbs-cpi.json` |
| `mof-child-savings` (`adapters/mof-child-savings.ts`) | Ministry of Finance child-savings rates, data.gov.il | daily | `data/series/mof-child-savings-rates.json` |
| `ecb-fx`, `ecb-fx-month-end` (`adapters/ecb-fx.ts`) | ECB euro reference rates (D26) | daily, after the ECB publishes | `data/series/ecb-fx.json`, `data/series/ecb-fx-month-end.json` |
| none | tariffs, `data/funds/`, `data/catalog/`, `data/terms/deposits/`, rules figures, parameters | by hand | written by hand or by the data-researcher agent, with the helper scripts in `packages/pipeline/scripts/` |

The Bank of Israel series have no adapter (D20). There is no fund list: `data/fund-lists/` (data-schema 3.14) does not exist and the pages that would read it hold no list and say so.

**CMA adapter.** It reads the full 2024-to-today CSV (not the datastore API), keeps the latest `REPORT_PERIOD` and writes text fields exactly as received (untrimmed). Sanity checks (pipeline configuration, in the adapter): a required column missing, replacement characters in a text field, row count under 80% of the stored period's, more than 20% of fund ids gone, a period older than the stored one. Because `CURRENT_DATE` and the file hash change daily, "nothing changed" is decided on the normalised data, never on the hash.

**ECB adapter.** It runs on its own daily workflow (`refresh-rates.yml`, after the ECB publishes around 16:00 CET), so a failure in another source never holds the rates back. A move of more than 10% since the stored rate writes nothing and fails the run; the page keeps the last rate with its date, and the stale flag (D3) shows after 5 days.

**Exit codes and commit policy.** 0 = written or unchanged, 3 = a sanity check failed (that source writes nothing), 1 = error. A refresh that passes validation and the sanity checks is committed straight to `main`. A refresh that trips a sanity check (a field disappears, a row count drops sharply, a value outside a plausible range, an encoding change) is written once more with `--force` (never past a schema failure), only to give a pull request a diff to review, and nothing goes to `main`. Sanity ranges are pipeline configuration, not site parameters: they never reach a displayed number. A push made with the default `GITHUB_TOKEN` starts no workflow, so after its commit the refresh job dispatches `ci.yml` on `main`, which runs the checks and the deploy.

**Raw archive.** CMA CSVs are several megabytes each and cumulative, so the normalised per-period extract goes in git and the raw file, gzipped, is attached to a GitHub Release (`raw-cma-<period>`, section 6), with its archive key and hash in the snapshot's `raw` block. This keeps the repository small and still keeps the evidence D3 asks for. `--no-archive` skips the upload; the key and hash are still recorded.

**Failure.** A failed fetch changes nothing in `data/`, so the site keeps the last value with its date and the browser raises the stale flag (product.md §6, "on fetch failure"). A dead-man check (`refresh-watchdog.yml`, weekly) fails its run, which GitHub mails to the owner, when `refresh.yml` or `refresh-rates.yml` had no successful run in the last 3 days.

### 3.4 Calculation engine

`packages/engine`: TypeScript with no dependencies on the UI, the DOM, the network or the file system.

**Structure follows `docs/method.md`.** Modules by method topic; one function per formula, named and headed by its ID (`F-40`), so the finance-reviewer can read the engine side by side with the method. A **formula registry** (`src/registry.ts`) maps each F-ID to its implementation and lists in `pending` the formulas not implemented yet; wrapper records name their formulas (`tax_at_exit.formula` and so on, data-schema §3.3), and the engine dispatches through the registry. Adding a wrapper when a tier-2 instrument graduates (D2) is then a data change plus any new formulas, not a rewrite.

**Figure resolver** (`src/resolver.ts`). The engine never reads a rule figure directly. It asks the resolver for `(rule ID, figure name, tax year)`. The resolver:

- refuses a rule whose strength is `open` and raises a **blocked** result with the open-question ID, which the engine turns into B3 "listed, not ranked" for that wrapper (method §1, §12);
- returns `secondary` and `institution` figures with a label that travels to every number they touch (D10);
- refuses a figure whose `effective_to` is before the run date ("figure not updated", method §13);
- records every rule it served. The run's **dimension checklist is derived from that record** (method §13: "derived from the rules used in the run, not hand-marked"), so a rule that enters the rule base as open turns a dimension to blocked without a page edit (3.3 "works when").

**Inputs and outputs.** Inputs are typed by assumption ID (`A-nn`) and parameter ID (`P-nn`), each a value object, so the state of every input (sourced or entered) is known to the engine. Outputs are value objects with `state: computed` and `computed_from` (formula ID and input references). Every comparison also returns its coverage line (method F-83). The engine returns **codes, never Hebrew text**: the site maps codes to copy. This keeps the engine testable in isolation and the wording in one place.

**Arithmetic.** IEEE double precision, rounding only for display (method §13). The method uses fractional powers (F-02, F-07, F-24), which decimal libraries handle poorly; double precision is far beyond the agora-level accuracy the golden tolerance (P-06) asks for. Dates are civil dates (`YYYY-MM-DD`) and month indices; no time zones inside the engine.

**Determinism.** Same inputs and same data version give the same output on every device (3.2 "two people with the same inputs get the same answer", 3.9 "imports on another phone and reproduces the same results"). No randomness, no dependence on the device's locale or clock inside the engine; the run date is an input.

**Where it runs.** At build time it computes each page's first view (for example the guide timeline, F-67 with P-05) and the dimension marks. In the browser the same code re-runs on every field change, on the page's own thread, except the index page's heaviest work, which runs in a Web Worker (`site/app/lib/invest-worker.ts`). Work that takes longer than a slider allows waits until the hand rests (guidelines/design.md).

### 3.5 Site

`site/`: React Router in framework mode, every route pre-rendered at build (`ssr: false`), with no runtime server.

**One interactive app, every page pre-rendered.** Each page is generated from `data/` at build so its first view arrives as HTML, then becomes interactive: fields the person can change, and graphs and numbers that recompute through the engine as they do. Guide prose is written in Hebrew in content files (`site/app/content/guide/`); every figure inside it is a component that reads a value object, never a typed number (section 3.7).

**Inputs.** No page carries a goal; the pages run on their own plan numbers (D34, D37). Where an input appears on a page that product.md does not list it for, that is a product question, not an engineering one.

**Data bundles.** The tools load a **resolved data bundle**, pre-rendered as a static JSON resource, holding what their runs read; the fee page's carries no parameters, since a deal runs no plan. Manager-level CMA data is split into small files and loaded on demand. Pages that need a bundle preload it with the HTML.

**Provenance on every number.** One component (`site/app/components/provenance.tsx`) renders every number. It takes a value object, never a bare number, and shows the state (sourced, computed, entered by you), and on tap: the source with its date, the rule and its strength, the formula and inputs for a computed number, "site parameter" with its rationale, and the stale flag.

**Right to left.** `lang="he" dir="rtl"` on the document; CSS logical properties only (start and end, never left and right); every number, fund number, ISIN and Latin name wrapped in an isolating element so bidi reordering cannot scramble "25%" or a security number; numbers and dates formatted with `Intl` for `he-IL`; the Hebrew and Latin web fonts self-hosted (no request to a font CDN, in keeping with D1).

**Charts.** Our own SVG chart components (section 3.9), pre-rendered at build and redrawn in the browser on every field change. Every chart axis runs left to right, time included (guidelines/charts.md).

**Search.** One client-side index, built at build time over the names, terms and numbers a person might paste (wrapper names, the CMA fund names, `data/catalog/` names, `data/terms/`, fund numbers, company legal ids, TASE numbers and ISINs) and light entries for rules, parameters and documents. A second file holds the rule texts, term meanings and parameter rationales; it is fetched after the index loads and used only to re-rank or to answer a question-form query, and a pre-rendered page never waits for it. Neither file is fetched from a third party. The field is part of every page; the matching and the results list are a script of their own, fetched while the page hydrates, and the index is fetched when a search first opens, so a page shows itself without waiting for them. Hebrew is normalised before matching (`site/app/lib/normalize.ts`). A name with no match is recorded in local state as "not catalogued yet" (3.10) only when the person presses "העתקה".

**Rules and documents.** Every rule record carries `sources[]` (extracted by script from the rule base, checked by the validator). The shelf of a rule is derived at build (`site/app/lib/rule-shelves.ts`), with no field on the record. A rule's uses are computed at build (`site/app/lib/rule-uses.server.ts`) by scanning the site's sources for its id, so a rule's id stays a quoted string where it is cited (3.10). A pinned answer or fact is a string with `{ID:figure}` slots that the page renders through the provenance component over the rule's figure, so it never carries a typed number, and the validator checks every slot against the row's rules (3.2 item 6). In the interface the set of rules is named "חוקים וכללים" and a single record has no noun; the code keeps `rule`.

**Shared behaviour.** Display rounding of shekel amounts is a display rule over unchanged method figures (design-system 2.7).

**What every page loads.** The browser build reads the site's own modules, and the engine and schema packages, as free of side effects, except the few that run code when they load (`site/app/lib/side-effect-modules.ts`; its test fails when one is missing). So a page's scripts hold only what it uses, and the script every page shares holds the frame (header, search field, figures and chips, saved state), not the whole kit and engine. `node tools/weight.mjs` and `node tools/first-tap.mjs` measure it.

**What the site does not load.** No analytics, no third-party scripts, no external fonts or CDNs at run time (D1, product.md §4). Pages carry `noindex`.

### 3.6 Local saved state

- **Store.** One state document per browser in `localStorage` under `mekor.v2.state`, written automatically (product 3.9; `site/app/lib/state.ts`). Entered values are value objects with `state: entered` (data-schema §1).
- **Versioned.** The document is version 3 under the unchanged key `mekor.v2.state` (N3). A chain of migrations upgrades any older version on load and on import; an older site that finds a newer version refuses it and leaves it alone. The version 3 fields `goals` and `savedComparisons` stay in the document as empty lists, so an older tab still open reads it as its own and keeps the holdings and entries; a version 4 would make that tab offer to start again over them. The goals, the current goal and the saved comparisons a document or file holds are left out without a word, since no page reads them. Import validates with the schema and rejects a file it cannot read, without touching the existing state. The export file (`/transfer`) carries the version.
- **Side stores.** The entered offers, the variant assumptions, the playbook ticks and the own rates are four device stores on their own keys (`site/app/lib/device-store.ts`), not merged into the state document; merging them is a code decision not yet made, and the document's version stays 3. The export file carries them, and the import validates each item (`site/app/lib/side-stores.ts`). The own-rates store keeps fields no page reads (`fee`, `provider`, `index`), so the export file carries what the device holds.
- **Safari may clear it.** Safari deletes a site's storage after seven days of use without a tap, click or key on the site. A copy added to the Home Screen is exempt, but its storage is separate from Safari's and starts empty. The site ships no web-app manifest; after the first write of something the person made (the saved state, their own rates, their fee deals) or an export, it asks once for persistent storage (`navigator.storage.persist()` in `lib/keep-storage.ts`, where the browser has it, saying nothing either way), and notes on the device that it has asked, so no later visit asks again: Firefox puts the question to the person. The export file is the way across and the backup. The risk is accepted; it is revisited if a friend loses saved state.
- **Back brings it back fresh.** A page the Back button brings back from the browser's page cache reads the saved state again (`pageshow` with `persisted`): the state document and every device store, as they do when another tab changes them.

### 3.7 How "every number traces to a source" is enforced

The rule is enforced in layers, so no single slip shows an untraced number:

1. **Data:** the schema has no place for a bare number (3.1).
2. **Engine:** outputs are computed value objects with their formula and inputs (3.4).
3. **Rendering:** the only way to show a number is the provenance component, which takes a value object (3.5).
4. **Content:** the validator rejects typed digits in the pinned-rules facts and answers (3.2 item 6). There is no such check over guide prose.
5. **End to end:** a browser crawl of every page that fails on any text node containing a digit that is not inside a provenance element or on the allow-list (chart ticks carry `data-scale` and are allowed). No such crawl is built.

### 3.8 Testing

All tests run with Vitest from the repository root (`npm test`, `vitest.config.ts`: `packages/*/test/**`, `site/app/**` and `tests/`).

**Fast and deep.** `vitest.config.ts` holds one project per run. `npm test` runs `fast`: every test file except the deep ones, in about 15 s, for every change. A deep file, `<name>.<topic>.deep.test.ts` beside the module it tests, holds a sweep too slow for that (every fund of every index at many plans, every index rendered at the sliders' ends) and belongs to the project `deep:<topic>`, one of `deals`, `fees`, `tax`, `data` and `pages` (`DEEP_TOPICS`); its fast neighbour keeps a slice of the same checks (a few indices, two of the plans), enough to catch a broken invariant. `npm run test:deep -- <topic>` runs one topic, `npm run test:deep` all of them (`tools/test-deep.mjs`); a topic with no deep file yet passes empty. `npm run check` runs the deep suites after the fast ones, and so does GitHub's test job before the site updates. `npx vitest run` with no `--project` runs everything. To add a deep test: put the sweep in a file named for its topic, put what it shares with the fast file in a `-fixtures.ts` module beside them, and keep a slice in the fast file; a new topic is a name added to `DEEP_TOPICS`.

**Property tests.** A file that holds a property test (fast-check) is named `<name>.property.test.ts`. It runs in `fast` at 25 cases a property and again in the project `deep:properties` at 1,000 (`npm run test:deep -- properties`, and every `npm run test:deep`). The number is set once per project (`PROPERTY_RUNS` in `vitest.config.ts`, through `tests/setup.ts`), never in a test. A failure prints its counterexample and `{ seed, path, endOnFailure }`: those passed to `fc.assert` as its settings replay the one case, and the case then becomes an example test.

**The same clock everywhere.** Every run is on Israel's clock zone: `vitest.config.ts` sets `TZ=Asia/Jerusalem` before the workers start, here and on GitHub alike, and `tests/environment.test.ts` fails where `Date` or `Intl` inside a worker sees another zone. A test that needs "today" or "now" passes a fixed one; only a test about the real clock reads it (the footer's "data as of" is not in the future). A test over the live `data/` checks what must hold whatever the data says; an exact figure is asserted only over fixed inputs.

| Level | What | Where |
|---|---|---|
| Engine, golden | Every scenario in `tests/golden/scenarios.md` as a machine-readable case; expected values come from the independent check (`tests/golden/expected_calc.py`, worked in `tests/golden/workings.md`); tolerance P-06 | `packages/engine/test/golden/` |
| Engine, properties | Invariants that need no expected value: no fees and no tax gives the gross path; a higher fee never raises the value; real equals nominal when inflation is zero; a blocked rule always yields "listed, not ranked"; every candidate of a comparison appears exactly once in its coverage line (F-83); monthly rates compound back to the annual one; P-05 reaches the runs converted only from percent and years | `packages/engine/test/*.property.test.ts` (fast-check) |
| Engine, coverage of the method | Every F-ID in `docs/method.md` is implemented or in the registry's `pending` list | `packages/engine/test/registry.test.ts` |
| Schema | The code schema against `docs/data-schema.md` | `packages/schema/test/` |
| Data | The validator (3.2) on the real `data/` and on fixtures that must fail | `packages/pipeline/test/validate.test.ts` |
| Pipeline | Each adapter against recorded raw responses, including Windows-1255 CSVs | `packages/pipeline/test/`, `fixtures/` |
| Site | Library modules, the kit's guards and ratchets, saved-state migrations and import | `site/app/**/*.test.ts` |
| Test runs | Israel's clock zone inside the workers; each project's number of property cases | `tests/environment.test.ts` |
| Built site, in a browser | Charts, layout, the main flows' response, each kind of page's weight (below) | `site/scripts/`, `tools/weight.mjs` |
| Review | Engine against the method and the rule base after any engine or schema change | finance-reviewer agent |

**In a browser.** Round 2 of `npm run check` (`tools/check.mjs`) opens the built site in the repository's Playwright Chromium, one script after the other: the chart check (`site/scripts/chart-check/`), the layout check (`site/scripts/layout-check.mjs`), the response check and the weight check. Every browser script, these and the ones in `tools/` run by hand, shares `site/scripts/browser.mjs`: every page opens with `locale: "he-IL"` and `timezoneId: "Asia/Jerusalem"`, a script waits for a condition and never for a time, and a slow phone is a processor slowed four times through Chrome's DevTools protocol (and with `SLOW_4G` the connection). The chart check turns motion off (`reducedMotion: "reduce"`): it measures where marks come to rest, and with no glide they are drawn there at once.

**The response check** (`site/scripts/response-check.mjs`) times the main flows on a 390 px phone with its processor slowed four times: on the index page, the fee page's filled deal and the government bond guide, a finger drags the first slider and a number is typed key by key into the first number field. A step fails on a tap, key or move answered over 100 ms after it, a layout shift while the finger drags, or a drag that moved its slider through fewer than three values. Before the site's flows count, the same flow runs with a slow key, a slow move and a growing block planted, and must catch each. What failed when the check came in is in `site/scripts/response-check-leftovers.json`, each with why: reported, not failed; a new finding fails.

**Weight budgets.** `tools/weight.mjs --check` opens one page of each page route at phone size with an empty cache and holds it to its budget in `tools/weight-budgets.json`, in KB gzipped: `script`, what it fetches before its load event, and `data`, the loader data written into its HTML plus every data file it fetches before it is at rest. A kind over either budget fails, as do a kind with no budget, a budget with no kind and a kind missing from the build. A budget is raised only by an edit of that file, in a commit of its own that says why.

The checks before a change goes live are in `guidelines/working.md`, "4. Check before it goes live".

### 3.9 Look and feel

Polished interface and good-looking graphs are a requirement (K12), so they get their own components rather than being left to a library's defaults. Tokens and components are in `docs/design-system.md` and the kit (`site/app/components/kit/`, gallery at `/kit`); styling is Tailwind CSS over the tokens of `site/app/theme.css`; icons are `lucide-react`.

- **Our own chart components, not an off-the-shelf chart library.** Charts are SVG components built from D3's scale, shape and array modules. Off-the-shelf chart libraries fight back on exactly what this site needs:
  - right-to-left layout with Hebrew labels, legend order and axis placement;
  - the three number states drawn distinctly, so an "entered by you" return can never be mistaken for a sourced one;
  - ranges and sensitivity bands (F-81);
  - annotations such as "locked until", "tie" and "blocked";
  - smooth transitions when a field changes;
  - the same chart pre-rendered as SVG at build, so it appears before any script runs.
- **Touch and pointer.** On a phone, touching and dragging across a chart shows a readout (nothing depends on hover); on a PC, hover does the same. Inputs that are changed often use controls that suit thumbs: sliders with a typed value beside them, steppers, and bottom sheets for the less common fields.
- **Motion.** Numbers and graphs move to their new values when an input changes, briefly, with the kit's own pieces and no animation library, and stay still when the device asks for reduced motion.

### 3.10 Code conventions

Where code goes in `site/app/`, and the shared pieces a change reuses before writing its own.

- **Where code goes.** `routes/`: one file per page or resource route, listed in `routes.ts`; a loader reads data through `await import("../lib/<name>.server")`, so nothing that reads files reaches the browser. `lib/*.server.ts` run only at build (they read `data/`, `docs/` and the rule base); every other `lib/` file is pure and runs in the browser too. `components/kit/` is the shared kit (design-system 11); `components/<feature>/` holds the pieces of one page or family of pages. `copy.ts` holds the interface strings, `content/guide/` the prose of the guide pages. A test sits beside its module (`name.test.ts`).
- **Shared pieces.** Reuse these rather than writing a local copy:

| Need | Use |
|---|---|
| State read only in the browser, after hydration; a layout effect that also pre-renders | `useHydrated`, `useIsoLayoutEffect` (`lib/hooks.ts`) |
| A list's filters and order kept in the address, read once hydrated | `useAddressParams` (`lib/hooks.ts`); `ListSort`, `pressSort`, `sortFromParams`, `sortParams` (`lib/list-sort.ts`) |
| The id the address's fragment names, followed as it changes; a page that writes its own address without a router navigation | `useHash`, `useAddressSearch`, `moveAddress` (`lib/address.ts`) |
| A tool that can throw on odd input, kept from taking the page down | `ToolBoundary` (`components/tool-boundary.tsx`) |
| Asking the browser once to keep the site's storage, after the first write of something the person made or an export (a device store says which it holds: `holds: "made" \| "kept"`) | `askToKeepStorage` (`lib/keep-storage.ts`) |
| A value object's number; a rule's figure for the tax year, with its stale flag; the unit of a P-05 input | `numberOf`, `ruleFigure`, `p05Units` (`lib/value.ts`) |
| A figure worked out from two others on the page, from them as the page writes them (`amountShown`, `lib/format.ts`) | `differenceOf` (`lib/value.ts`) |
| The date beside figures from many records: their oldest and newest, said once where they agree | `dateSpan` (`lib/date-span.ts`) and the kit's `DateSpanText`; a bank's rates `asOfSpan` (`lib/bank-table.ts`); the deposits list `readSpan` (`lib/deposit-browser.ts`) |
| The end of a `switch` over a union's kind, so a new kind fails to compile where it isn't handled | `default: return assertNever(x)` (`@finance-tool/schema`) |
| Numbers, dates and Hebrew sort order; the shekel's currency code | `fmt`, `parseNumber`, `heCollator` (`lib/format.ts`), every number format through `numberFormat` (`lib/number-format.ts`); `isShekel` (`lib/fx.ts`) |
| Reading `data/` at build | the `load*` functions, `readDirFiles`, `collectRuleIds`, `refLink` (`lib/data.server.ts`), all through the read cache (`lib/read-cache.server.ts`) |
| A guide-style page | `GuideFrame`, `GuideHeader`, `GuideSection`, `SectionIndex` (`components/guide/sections.tsx`) |
| A guide page that is prose only | a route file with its rule ids, `proseGuideData` (`lib/prose-guide.server.ts`) and `ProseGuide` (`components/guide/prose-guide.tsx`); `routes/guide-limited-bond-fund.tsx` is the smallest example |
| The build context of a guide page's visual | `SignatureCtx`, `figureOf`, `withRules`, `emptyData` (`lib/guide-signature-ctx.server.ts`) |

- **TypeScript.** Every workspace is strict, with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, `noImplicitReturns`, `noImplicitOverride`, `verbatimModuleSyntax` (`import type` for a type) and `erasableSyntaxOnly` (no `enum`, `namespace` or constructor parameter properties: a class declares its fields), from `tsconfig.base.json`. A rule's id stays a quoted string in the route or component that cites it: the rule-uses scan (3.5, "Rules and documents") finds a rule's pages that way.
- **Lint.** `npm run lint`, in `npm run check`, runs Oxlint with its type-aware and React rules (`.oxlintrc.json`) and knip (`knip.jsonc`) over the whole repository (`tools/lint.mjs`). Each rule is a ratchet: `tools/lint-baseline.json` records its findings file by file, and the check passes only when every count equals its record. A rule's total going up fails; a total that went down, or findings that moved between files while no total rose, are recorded with `node tools/lint.mjs --lower` and committed; a new or renamed rule is recorded alone with `node tools/lint.mjs --accept <rule>`. A rule is silenced only on its own line, `// oxlint-disable-next-line <rule> -- <reason>`, and never for the rules of hooks or a dependency list; the lint fails on any other silencing comment. It runs after the typecheck, whose route types its type-aware rules read.
- **Comments** say what something is and why, as it stands (guidelines/project.md): no dates, no who asked, no review rounds. A formula's implementation is headed `* F-nn <title>`; the engine's registry test reads that line.
- **A refactor keeps the site the same.** Copy `site/build` before the change, rebuild after it, and run `node tools/build-diff.mjs <copy>`: it compares every page, data file and bundle with asset hashes masked, decodes a route's data file that differs only in key order, and fails on any other difference.

---

## 4. Repository layout

One npm workspace (`package.json` `workspaces`: `packages/*` and `site`) with one lockfile, TypeScript throughout, Node 22.12 or later.

```
docs/  research/  data/        product docs, research, source data
tests/golden/                  golden scenarios and the independent check (Python)
packages/schema/               Zod schemas, types, JSON Schema export (json/), data-schema.md consistency test
packages/engine/               formulas by method topic, registry, figure resolver; no I/O
packages/pipeline/             adapters, validator, CLI (src/cli.ts), helpers (scripts/)
site/                          React Router app: app/ (routes, components, kit, lib, content, copy.ts), scripts/, public/
.github/workflows/             ci, offline, refresh, refresh-rates, refresh-watchdog
```

Root commands: `npm run check` (typecheck, lint, tests, validation and site build, what CI runs), `npm test`, `npm run lint`, `npm run test:deep [-- <topic>]`, `npm run validate`, `npm run refresh -- <source>`, `npm run dev`, `npm run build`.

---

## 5. Stack

React, pre-rendered (React Router in framework mode, no server; option C), chosen over Astro (option A) and SvelteKit (option B) because polish is built by iteration, and React has the richest set of right-to-left-capable interface parts and is the framework Claude refines most fluently; the price is a heavier download on old phones, softened by pre-rendering the first view.

---

## 6. Hosting and scheduled refresh

**GitHub Pages, from a public repository** (`orishamir/finance-tool`); the site is static files and the pipeline is one command, so the choice is reversible at low cost.

- **Address and paths.** The site is served at `https://orishamir.github.io/finance-tool/`. The app's `basename` and Vite's `base` are both `/finance-tool/`. After the build, `site/scripts/pages-layout.mjs` lays out `site/build/client` for Pages: pre-rendered pages at the root, and React Router's SPA fallback as `404.html`, so a path without a pre-rendered page still loads the app.
- **A link pasted in a chat.** Every page's head carries its title, a one-sentence description and the Open Graph and Twitter tags a chat app reads to show the link as a card, with absolute addresses (`site/app/lib/page-meta.ts`, which holds the only copy of the site's address in the code). The card's picture is one for the whole site, `site/public/preview.png`, made by hand with `node tools/preview-picture.mjs` in the site's own headless Chrome, so the Hebrew is shaped as on the site; run it again after a change to the site's name, line, colours or fonts. A picture per page would be made in the build, without a browser, and needs a renderer the build doesn't have. `site/scripts/link-preview-check.mjs` runs after the build and fails a page whose tags are missing or wrong. The pages keep `noindex`.
- **Deploy.** The `ci` workflow deploys `main` to Pages only after typecheck, tests, validation, the build and its policy, chart and layout checks pass, in two jobs side by side (the tests; the build and the checks that open it in a browser). Pull requests run the checks only. The site to run offline is made only when asked: the `offline` workflow (Actions > offline > Run workflow, or `gh workflow run offline.yml`) builds the branch and keeps it as a workflow artifact, `finance-tool-site` (a `.tar.gz`, two weeks): extract it, run `python3 -m http.server` in the folder and open `http://localhost:8000/`. One difference from Pages: an address the build has no page for gets Python's own 404, not the site's not-found page.
- **Workflows.** Every workflow starts with `permissions: contents: read`, and a job that needs more raises it on itself only. Every action is locked to a commit, with its version as a comment beside it (`uses: actions/checkout@<sha> # v4.4.0`); a new version is taken by hand, with its commit looked up (`gh api repos/<owner>/<action>/commits/<tag> --jq .sha`), in a commit of its own.
- **Installing packages.** Every workflow installs with `npm ci` from the lockfile. `.npmrc` turns install scripts off (`ignore-scripts=true`): of the two packages that have one, esbuild's only swaps its wrapper for its binary (tsx reaches the binary through the platform package npm installs beside it) and fsevents is macOS's alone, so no workflow rebuilds any. A package that comes to need its script is listed in `.npmrc` with why and rebuilt by name after `npm ci` (`npm rebuild <name>`). `min-release-age=7` makes npm 11.10 and later pick only versions public for seven days when it chooses one (`npm install`, `npm update`); `npm ci` installs the lockfile's versions as they are, so the workflows keep the npm their Node brings. The setting is not yet in effect anywhere: the machine's npm is older than 11.10.
- **Content Security Policy.** GitHub Pages sets no headers for a site, so each page carries its policy in a `<meta http-equiv="Content-Security-Policy">`, which `site/scripts/csp.mjs` writes after pre-rendering into every built page, `404.html` among them, right after the charset and before any script. Scripts run only from the site's own files and the page's own inline scripts, each named by its hash; that also admits the index page's Web Worker, a script file of the site, since with no `worker-src` a worker falls back to `script-src`. A `<meta>` policy cannot set `frame-ancestors`. `site/scripts/csp-check.mjs`, in the `ci` workflow beside the layout check, opens the kinds of page in Chrome and fails on anything the policy refused; it first plants an inline script with no hash and fails unless that is refused.
- **Everything in the repository is public.** That includes the founder interview in `docs/discovery.md`, the research, and every file under `data/`. CMA and MoF data are under the data.gov.il open licence.
- **Raw archive.** The original file each refresh downloads is attached, gzipped, to a GitHub Release in the same repository: one release per source and month (`raw-<source>-<YYYY-MM>`), and for CMA one per report period (`raw-cma-<period>`). The raw files stay out of the git history, so clones stay small, and they need no extra service. Releases are public. Nothing on the site reads these files: they are evidence of what the source said on that date, and they let the pipeline re-derive fields later.
- **Scheduled refresh.** `refresh.yml` runs daily at 05:30 UTC (CMA, CBS consumer price index, MoF child-savings rates, in one CLI call, committed together); `refresh-rates.yml` runs daily at 15:30 UTC (ECB rates). GitHub disables scheduled workflows in a public repository after a stretch with no repository activity; the refresh commits keep it active, and the dead-man check (3.3) catches it if not.
- **Fallback for blocked fetches (H3).** A self-hosted runner attached to a public repository can be made to run code from a fork's pull request, which GitHub advises against. If a source blocks GitHub's runners, or the scheduled workflows stop, the refresh runs on the home machine (`npm run refresh -- cma cbs-cpi mof-child-savings`) and pushes its commit, rather than as a self-hosted runner.

---

## 7. Work by release

All five releases of the roadmap (`8dd1f013:research/2026-10-23-release-1/roadmap.md`, a record of its day) are built. Release 1 computed F-01 to F-28, F-33, F-40 to F-46, F-50, F-51 and F-54 for the guide timelines (F-67); a formula in `docs/method.md` that is not implemented yet is in the engine registry's `pending` list with the release that was to bring it.
