# Architecture

How the site is built: a React Router app pre-rendered to static files and served by GitHub Pages, a calculation engine that runs in the browser, and a refresh pipeline that keeps `data/` current, in one npm workspace. It describes the code as it is; the rules it serves are in `guidelines/`, `docs/product.md`, `docs/method.md` and `docs/data-schema.md`.

No financial figure appears here. Where one matters, the data file, rule or formula is named.

---

## 1. What drives the design

| # | Driver | From |
|---|---|---|
| K1 | **No server-side personal data.** Every calculation that uses a person's inputs runs in their browser. The site is static files; there is no application server. | D1, product.md §4, data-schema §1 ("the engine runs in the browser") |
| K2 | **Engine separate from the UI**, testable alone against the golden scenarios (`tests/golden/`) and checkable by the finance-reviewer formula by formula. | Founder brief; method.md §13 |
| K3 | **Every displayed number is a value object** (sourced, computed or entered) with source, date and state, and the page shows which. | CLAUDE.md, D3, D7, data-schema §1 |
| K4 | **Rule gating.** An `open` rule never computes; `secondary` and `institution` rules compute and label; a figure past its `effective_to` stops the run with "figure not updated". | D10, method.md §13 |
| K5 | **Data validated against the schema before every build**, including the cross-file checks in data-schema §4. | Founder brief; data-schema §4 |
| K6 | **Scheduled refresh** at the cadences of product.md §6, keeping dated snapshots because no public archive exists, and never hiding a stale number. | D3, product.md §6 |
| K7 | **Hebrew, right to left, both screen sizes, each checked at 1440 and 390 px** (guidelines/design.md), with numbers, percentages, fund numbers and Latin names embedded in Hebrew text. | guidelines/project.md, product.md §2 |
| K8 | **Interactive on nearly every page.** People change fields and watch graphs respond. Guide pages take optional inputs and carry a timeline graph (3.1), and the tools (fees, indices, tracks) are interactive throughout. No page shows or reads a saved goal; the pages run on their own plan numbers, and the company and track pages show no fit mark (D34, D37). Only the rules, parameters and terms pages are pure reference. | founder; product.md 3.1, 3.10 |
| K9 | **Saved state is local, versioned and portable**: saved automatically, exported and imported as a file, and revisited against the stored versions. Old export files must keep importing. | 3.9, N3 |
| K10 | **Data sources are awkward**: CMA CSVs are Windows-1255, data.gov.il has a WAF that rejects some queries, CBS requires a User-Agent, gov.il, TASE and ISA block scripts. | data-landscape.md §1 |
| K11 | **Non-commercial, small audience, one maintainer.** Low running cost and few moving parts beat scale. | CLAUDE.md, founder brief |
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

`packages/schema`: one Zod schema per collection in `docs/data-schema.md` §3, written once and used by the validator, the pipeline, the build, the engine's input types and the import of saved-state files (section 3.6). The value object is the base type; every collection is built from it, so a bare number fails validation by construction.

The package also exports JSON Schema files to `packages/schema/json/` (`npm run export-json-schema -w @finance-tool/schema`), so a hand-edited JSON file under `data/` that names one in a `$schema` line gets autocompletion and inline errors in the editor.

`docs/data-schema.md` stays the human description. A test (`packages/schema/test/data-schema-doc.test.ts`) parses its field tables and fails if the code schema and the document disagree on a field name or a required flag, so the two cannot drift silently.

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
| none | tariffs, `data/funds/`, `data/catalog/`, `data/terms/deposits/`, rules figures, parameters | by hand | written by hand or by the data-researcher agent |

The Bank of Israel series have no adapter (D20). There is no fund list: `data/fund-lists/` (data-schema 3.14) does not exist and the pages that would read it hold no list and say so.

**CMA adapter.** It reads the full 2024-to-today CSV (not the datastore API), keeps the latest `REPORT_PERIOD` and writes text fields exactly as received (untrimmed). Sanity checks (pipeline configuration, in the adapter): a required column missing, replacement characters in a text field, row count under 80% of the stored period's, more than 20% of fund ids gone, a period older than the stored one. Because `CURRENT_DATE` and the file hash change daily, "nothing changed" is decided on the normalised data, never on the hash. `npm run renormalise:cma -w @finance-tool/pipeline` rebuilds the derived value objects of every stored CMA file from its own raw fields, with no download.

**ECB adapter.** It runs on its own daily workflow (`refresh-rates.yml`, after the ECB publishes around 16:00 CET), so a failure in another source never holds the rates back. A move of more than 10% since the stored rate writes nothing and fails the run; the page keeps the last rate with its date, and the stale flag (D3) shows after 5 days.

**Exit codes and commit policy.** 0 = written or unchanged, 3 = a sanity check failed (that source writes nothing), 1 = error. A refresh that passes validation and the sanity checks is committed straight to `main`. A refresh that trips a sanity check (a field disappears, a row count drops sharply, a value outside a plausible range, an encoding change) is written once more with `--force` (never past a schema failure), only to give a pull request a diff to review, and nothing goes to `main`. Sanity ranges are pipeline configuration, not site parameters: they never reach a displayed number. A push made with the default `GITHUB_TOKEN` starts no workflow, so after its commit the refresh job dispatches `ci.yml` on `main`, which runs the checks and the deploy.

**Raw archive.** CMA CSVs are several megabytes each and cumulative, so the normalised per-period extract goes in git and the raw file, gzipped, is attached to a GitHub Release (`raw-cma-<period>`, section 6), with its archive key and hash in the snapshot's `raw` block. This keeps the repository small and still keeps the evidence D3 asks for. `--no-archive` skips the upload; the key and hash are still recorded.

**Failure.** A failed fetch changes nothing in `data/`, so the site keeps the last value with its date and the browser raises the stale flag (product.md §6, "on fetch failure"). A dead-man check (`refresh-watchdog.yml`, weekly) fails its run, which GitHub mails to the owner, when `refresh.yml` or `refresh-rates.yml` had no successful run in the last 3 days.

**Helpers for hand-collected data** (`packages/pipeline/scripts/`): `extract-sources.ts` writes each rule record's `sources`, derivation and scope from the rule base; `gen-open-questions.ts` writes `data/open-questions.json` from the rule base's open-question sections; `merge_terms.py`, `gen_glossary.py` and `gen-terms.ts` write the glossary's tables in `docs/glossary.md`, then `data/terms/` and `data/dimensions/`, from the rows in `research/glossary/terms/` (`npm run gen:terms` runs the three in turn).

### 3.4 Calculation engine

`packages/engine`: TypeScript with no dependencies on the UI, the DOM, the network or the file system.

**Structure follows `docs/method.md`.** Modules by method topic (`ledgers/`, `formulas/`, `fees/`, `holdings/`, `providers/`, `variants/`, `compare/`); one function per formula, named and headed by its ID (`F-40`), so the finance-reviewer can read the engine side by side with the method. A **formula registry** (`src/registry.ts`) maps each F-ID to its implementation and lists in `pending` the formulas not implemented yet; wrapper records name their formulas (`tax_at_exit.formula` and so on, data-schema §3.3), and the engine dispatches through the registry. Adding a wrapper when a tier-2 instrument graduates (D2) is then a data change plus any new formulas, not a rewrite.

**Figure resolver** (`src/resolver.ts`). The engine never reads a rule figure directly. It asks the resolver for `(rule ID, figure name, tax year)`. The resolver:

- refuses a rule whose strength is `open` and raises a **blocked** result with the open-question ID, which the engine turns into B3 "listed, not ranked" for that wrapper (method §1, §12);
- returns `secondary` and `institution` figures with a label that travels to every number they touch (D10);
- refuses a figure whose `effective_to` is before the run date ("figure not updated", method §13);
- records every rule it served. The run's **dimension checklist is derived from that record** (method §13: "derived from the rules used in the run, not hand-marked"), so a rule that enters the rule base as open turns a dimension to blocked without a page edit (3.3 "works when").

**Inputs and outputs.** Inputs are typed by assumption ID (`A-nn`) and parameter ID (`P-nn`), each a value object, so the state of every input (sourced or entered) is known to the engine. Outputs are value objects with `state: computed` and `computed_from` (formula ID and input references), plus the monthly ledger series, fees by type, tax during and at exit, labels, G-flags and the rules used. Every comparison also returns its coverage line (method F-83): the candidate count and one outcome code with its reason for each candidate. The engine returns **codes, never Hebrew text**: the site maps codes (formula, G-ID, rule ID, deciding factor from F-80) to copy. This keeps the engine testable in isolation and the wording in one place.

**Arithmetic.** IEEE double precision, rounding only for display (method §13). The method uses fractional powers (F-02, F-07, F-24), which decimal libraries handle poorly; double precision is far beyond the agora-level accuracy the golden tolerance (P-06) asks for. Dates are civil dates (`YYYY-MM-DD`) and month indices; no time zones inside the engine.

**Determinism.** Same inputs and same data version give the same output on every device (3.2 "two people with the same inputs get the same answer", 3.9 "imports on another phone and reproduces the same results"). No randomness, no dependence on the device's locale or clock inside the engine; the run date is an input.

**Where it runs.** At build time it computes each page's first view (for example the guide timeline, F-67 with P-05) and the dimension marks. In the browser the same code re-runs on every field change, on the page's own thread (`site/app/lib/engine.ts` and the tools' modules); there is no Web Worker. Work that takes longer than a slider allows waits until the hand rests (guidelines/design.md).

### 3.5 Site

`site/`: React Router in framework mode, every route pre-rendered at build (`ssr: false`, the paths from `site/app/lib/paths.server.ts`), with no runtime server.

**One interactive app, every page pre-rendered.** Each page is generated from `data/` at build (the loaders read `data/`, `docs/` and `research/` through `site/app/lib/data.server.ts`) so its first view arrives as HTML, then becomes interactive: fields the person can change, and graphs and numbers that recompute through the engine as they do. The routes are in `site/app/routes.ts`: the guide (one page per tier-1 wrapper and exposure, with its optional inputs and timeline graph), the companies and their tracks from the CMA data (3.10), every track of one product (`/tracks`), the indices page (`/indices`), every bank's deposits side by side (`/deposits`, D92), the rules, documents and parameters pages, the tier-2 "not covered yet" page, and the tools (fees, export and import). The site has no goal comparison, idle-cash page or holdings page. Guide prose is written in Hebrew in content files (`site/app/content/guide/`); every figure inside it is a component that reads a value object, never a typed number (section 3.7).

**Inputs.** The profile inputs and entered values live in one app-wide state, saved locally (3.6). No page carries a goal; the pages run on their own plan numbers (D34, D37). Where an input appears on a page that product.md does not list it for, that is a product question, not an engineering one.

**Data bundles.** The tools load a **resolved data bundle**, pre-rendered as a static JSON resource. `compare-bundle.json` and `indices-bundle.json` carry the rule figures for the current tax year, parameters, wrapper records, the tier-2 list, latest series values and averages, stamped with the build's version and data snapshot (`site`). The fee page's `deal-data.json` carries no parameters: the kinds of deal with their caps, the houses' price lists and the regulator's tracks as templates, the ECB's reference rates and the rules its figures cite (`site/app/lib/fee-page-data.ts`), since a deal runs no plan. A comparison's candidate set is built from the bundle and never from what a page happens to show (product D17, method F-83). Manager-level CMA data is split into small files and loaded on demand. Pages that need a bundle preload it with the HTML (`bundleLinks()`, `site/app/lib/bundle.ts`).

**Provenance on every number.** One component (`site/app/components/provenance.tsx`) renders every number. It takes a value object, never a bare number, and shows the state (sourced, computed, entered by you), and on tap: the source with its date, the rule and its strength, the formula and inputs for a computed number, "site parameter" with its rationale, and the stale flag. It opens in a native `<dialog>` (`site/app/components/Sheet.tsx`): a bottom sheet on a phone, a card beside the number on a PC. What the sheet shows (the value, rule, term, formula and question cards) is in `provenance-sheets.tsx`, a script of its own: it is fetched while the page hydrates (`entry.client.tsx`), and a tap that comes before it is in opens the sheet as it arrives.

**Right to left.** `lang="he" dir="rtl"` on the document; CSS logical properties only (start and end, never left and right); every number, fund number, ISIN and Latin name wrapped in an isolating element so bidi reordering cannot scramble "25%" or a security number; numbers and dates formatted with `Intl` for `he-IL`; the Hebrew and Latin web fonts self-hosted (no request to a font CDN, in keeping with D1).

**Charts.** Our own SVG chart components (section 3.9), pre-rendered at build and redrawn in the browser on every field change. Every chart axis runs left to right, time included (guidelines/charts.md; this settled gap 8.6).

**Search.** A client-side index built at build time (`search-index.json`, `site/app/routes/search-index.ts`) over wrapper names, the CMA fund names, `data/catalog/` names, `data/terms/`, fund numbers, company legal ids, TASE numbers and ISINs, and light entries for rules (title, id, figures as `{n, unit}` numbers, figure names, topic, address), parameters and documents. A second file, `search-texts.json`, holds the rule texts, term meanings and parameter rationales; it is fetched after the index loads and used only to re-rank or to answer a question-form query, and a pre-rendered page never waits for it. Neither file is fetched from a third party. The field is part of every page; the matching and the results list (`components/search-results.tsx`) are a script of their own, fetched while the page hydrates; the index is fetched when a search first opens (or the pointer goes down on it). Hebrew is normalised before matching (`site/app/lib/search.ts`): final letter forms, geresh and gershayim against ASCII quotes, maqaf against hyphen, niqqud stripped, whitespace collapsed. Matches are ranked (exact, prefix, word, contained, all words) with one row per page. On a PC the header field is a combobox whose results open under it; on a phone the search is a bottom sheet. A name with no match is recorded in local state as "not catalogued yet" (3.10) only when the person presses "העתקה".

**Rules and documents.** Every rule record carries `sources[]` (extracted by script from the rule base, checked by the validator). The rules page (`/rules`) pre-renders the "הידעת?" facts and a light list of every rule, enough to draw its row (`{id, title, shelf, file, strength, likely_to_change, recheck_date, score, products, lead, pills, authority, sources}`; the row's parts come from `site/app/lib/rule-row.ts`: the text's first sentence, the record's own figures as value and unit, the first source's publisher and the count). The filters and the product list's groups are pure functions in `site/app/lib/rules-filter.ts`, and their state is the address (`?product=&shelf=&changing=1&q=`, written with `history.replaceState`, never a navigation); the open rule is the hash, replaced on a computer and pushed on a narrow screen so the back gesture closes it. The full records and their uses come from resource routes `/rules-data/<shelf>.json` (`shelfBundle`, which also carries the records a rule derives from) and `/rules-data/companies.json` (the terms the site read at companies), each fetched once through a module cache for the rule that is open, the search's closest match, and the company terms a search found. `/rules/<shelf>` pre-renders a line and a link and replaces itself with `/rules?shelf=<shelf>`. The product filter comes from `ruleProducts()`: the wrappers whose record cites the rule's id, the wrapper behind the rule's file (`fileProducts`), "common" for the provident-family file and "tier2" for the files of products the site does not cover. The shelf of a rule is derived at build (`shelfOf`, `site/app/lib/rule-shelves.ts`) from its first dimension, a default per research file and a short list of explicit moves, with no field on the record. A rule's uses are computed at build and cached for the build (`site/app/lib/rule-uses.server.ts`): the pages that cite its id (a scan of `site/app/content/`, `routes/` and `components/`), whether `packages/engine/src/` mentions it, and the data collections that reference it (wrappers, exposures, dimensions, terms, parameters, funds, fees, deposit terms); the same scan gives the score that orders rules inside a group and picks the teasers. A pinned answer or fact is a string with `{ID:figure}` slots (parsed by `site/app/lib/answer-slots.ts`) that the page renders through the provenance component over the rule's figure, so it never carries a typed number, and the validator checks every slot against the row's rules (3.2 item 6). The documents page (`/documents`) is grouped at build: every `sources[]` entry and every sourced figure's `source` by document key (an id of `data/sources/documents.json` when the address or title matches, else the address without fragment and query), plus cards for the data collections. In the interface the set of rules is named "חוקים וכללים" and a single record has no noun; the code keeps `rule`.

**Shared behaviour.** One number parser (`parseNumber`, `site/app/lib/format.ts`) reads every typed number, with comma decimals; display rounding of shekel amounts is a display rule over unchanged method figures (design-system 2.7). The newest `checked` date in `data/` is read at build (`newestChecked()`, `site/app/lib/data-as-of.ts`; `dataAsOf()` in `data.server.ts` is the same) and baked in by `define: __DATA_AS_OF__` in the Vite config, for the footer. `RestoreScroll` (`site/app/root.tsx`) replaces the router's scroll restoration: a position per history entry and address together, in `sessionStorage`, restored on back and forward with retries until the page is tall enough (the address is part of the key because every page loaded fresh in a tab shares the entry key "default"). The error boundary shows the not-found page for a 404 or for a missing data file on the static host, and a "משהו השתבש" page for any other failure. Only the Inter latin and Heebo hebrew font files are loaded, and both are preloaded. The menu and search buttons stay disabled until hydration.

**What every page loads.** The browser build reads the site's own modules, and the engine and schema packages, as free of side effects, except the few that run code when they load (`site/app/lib/side-effect-modules.ts`; its test fails when one is missing). So a page's scripts hold only what it uses: a module reached only through a re-export no one uses (the kit's index, the schema package's index) is left out, and the script every page shares holds the frame (header, search field, figures and chips, saved state), not the whole kit and engine. `node tools/weight.mjs` measures what each kind of page downloads before and after its load event, and with a build made with `CHUNK_REPORT=1`, what the largest scripts hold; `node tools/first-tap.mjs` measures the first term card, rule card and search results on a slow phone connection.

**What the site does not load.** No analytics, no third-party scripts, no external fonts or CDNs at run time (D1, product.md §4). Pages carry `noindex`.

### 3.6 Local saved state

- **Store.** One state document per browser in `localStorage` under `mekor.v2.state`, written automatically (product 3.9; `site/app/lib/state.ts`). It holds the person's goals, entered values (as value objects with `state: entered`, data-schema §1), holdings, the import record, saved comparisons and uncatalogued names.
- **Versioned.** The document is version 3 under the unchanged key `mekor.v2.state` (N3). A chain of migrations upgrades any older version (the release 2 keys `mekor.v1.*`, version 2) on load and on import; an older site that finds version 3 refuses it and leaves it alone. Import validates with the schema and rejects a file it cannot read, without touching the existing state. The export file (`/transfer`) carries the version.
- **Saved comparisons carry what they used.** A saved comparison stores its inputs, the build's version and data snapshot, and the actual figures, parameters and series values it read (small). The document keeps the field; no page saves or revisits a comparison now.
- **Side stores.** The entered offers, the variant assumptions, the playbook ticks and the own rates are four device stores on their own keys through `site/app/lib/device-store.ts` (`mekor.v2.offers`, `mekor.v2.variants`, `mekor.v2.playbook-ticks`, `mekor.v2.own-rates`), not merged into the state document; merging them is a code decision, Claude's, not yet made, and the document's version stays 3. The export file carries them in an optional `sideStores` field, and the import validates each item and merges them (add: the device wins per provider or exposure and ticks are unioned; replace: the file's). Playbook ticks are keyed by the wrapper alone; old keys migrate once. `mekor.v2.imported-side` records the side items an "add" import brought, so the undo removes exactly those; a "replace" clears it. The import dedupe ignores id, order and import tag, and a failing item is left out and listed by field (`site/app/lib/side-stores.ts`).
- **Own terms.** `mekor.v2.own-rates` (a map from goal id to wrapper id, no version wrapper; in the export as `sideStores.ownRates`) keeps the person's own terms per goal. A wrapper's entry is a bare number (a rate, percent a year) or an object `{ rate?: number; fee?: number; provider?: string }`: the rate the bank offered for the deposit, the fund fee level (percent a year) for the representative instrument (D4), and, for the brokerage account, the id of the provider the person chose. `site/app/lib/own-rate.ts` exports `useOwnTerms` (the hook, one goal), `useOwnRates` (keeps a stored fee), `splitOwnTerms` (to `ownRates`, `ownFees`, `ownProviders` and `ownIndices` for `RunGoal`), `termsOfGoal` and `parseOwnRates`; `applyOwnProviders` applies the chosen provider to the compare bundle, which carries each brokerage provider's tariff lines built by `compare.server.ts` from the fee snapshots. `lib/side-stores.ts` accepts either form on import, names an object that is not a rate or fee as a problem, and merges by JSON equality. An entered fee is a value object with `replaces`, applied in `termsFor` before the F-81 scale.
- **Holdings.** `Holding` (`site/app/lib/state.ts`) has `firstDepositOverSix` (an entered boolean true) and a fee may be a sourced snapshot of the track's CMA average, dated at save time. No page saves or reads a holding now; the export and import carry the ones a device holds. The goal fields `childAge` and `targetCost` are optional and absent in older saved goals (no version change).
- **Phones may clear it.** Safari can delete a site's stored data after a period without a visit unless the site is added to the home screen. The site ships no web-app manifest and makes no persistent-storage request; the export file is the backup. The founder accepted this risk; it is revisited if a friend loses saved state.

### 3.7 How "every number traces to a source" is enforced

The rule is enforced in layers, so no single slip shows an untraced number:

1. **Data:** the schema has no place for a bare number (3.1).
2. **Engine:** outputs are computed value objects with their formula and inputs (3.4).
3. **Rendering:** the only way to show a number is the provenance component, which takes a value object (3.5).
4. **Content:** the validator rejects typed digits in the pinned-rules facts and answers (3.2 item 6). There is no such check over guide prose.
5. **End to end:** a browser crawl of every page that fails on any text node containing a digit that is not inside a provenance element or on the allow-list (chart ticks carry `data-scale` and are allowed). No such crawl is built.

### 3.8 Testing

All tests run with Vitest from the repository root (`npm test`, `vitest.config.ts`: `packages/*/test/**` and `site/app/**`).

| Level | What | Where |
|---|---|---|
| Engine, golden | Every scenario in `tests/golden/scenarios.md` as a machine-readable case; expected values come from the independent check (`tests/golden/expected_calc.py`, worked in `tests/golden/workings.md`); tolerance P-06 | `packages/engine/test/golden/` |
| Engine, properties | Invariants that need no expected value: no fees and no tax gives the gross path; a higher fee never raises the value; real equals nominal when inflation is zero; a blocked rule always yields "listed, not ranked"; every candidate of a comparison appears exactly once in its coverage line (F-83) | `packages/engine/test/properties.test.ts` (fast-check) |
| Engine, coverage of the method | Every F-ID in `docs/method.md` is implemented or in the registry's `pending` list | `packages/engine/test/registry.test.ts` |
| Schema | The code schema against `docs/data-schema.md` | `packages/schema/test/` |
| Data | The validator (3.2) on the real `data/` and on fixtures that must fail | `packages/pipeline/test/validate.test.ts` |
| Pipeline | Each adapter against recorded raw responses, including Windows-1255 CSVs | `packages/pipeline/test/`, `fixtures/` |
| Site | Library modules, the kit's guards and ratchets, saved-state migrations and import | `site/app/**/*.test.ts` |
| Review | Engine against the method and the rule base after any engine or schema change | finance-reviewer agent |

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
| A value object's number; a rule's figure for the tax year, with its stale flag; the unit of a P-05 input | `numberOf`, `ruleFigure`, `p05Units` (`lib/value.ts`) |
| Numbers, dates and Hebrew sort order; the shekel's currency code | `fmt`, `parseNumber`, `heCollator` (`lib/format.ts`); `isShekel` (`lib/fx.ts`) |
| Reading `data/` at build | the `load*` functions, `readDirFiles`, `collectRuleIds`, `refLink` (`lib/data.server.ts`), all through the read cache (`lib/read-cache.server.ts`) |
| A guide-style page | `GuideFrame`, `GuideHeader`, `GuideSection`, `SectionIndex` (`components/guide/sections.tsx`) |
| A guide page that is prose only | a route file with its rule ids, `proseGuideData` (`lib/prose-guide.server.ts`) and `ProseGuide` (`components/guide/prose-guide.tsx`); `routes/guide-limited-bond-fund.tsx` is the smallest example |
| The build context of a guide page's visual | `SignatureCtx`, `figureOf`, `withRules`, `emptyData` (`lib/guide-signature-ctx.server.ts`) |

- **TypeScript.** Every workspace is strict, with `noUncheckedIndexedAccess`, `noUnusedLocals` and `verbatimModuleSyntax` (`import type` for a type), from `tsconfig.base.json`. A rule's id stays a quoted string in the route or component that cites it: the rule-uses scan (3.5, "Rules and documents") finds a rule's pages that way.
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

Root commands: `npm run check` (typecheck, tests, validation and site build, what CI runs), `npm test`, `npm run validate`, `npm run refresh -- <source>`, `npm run dev`, `npm run build`.

---

## 5. Stack

React, pre-rendered (React Router in framework mode, no server; option C), chosen by the founder over Astro (option A) and SvelteKit (option B) because polish is built by iteration, and React has the richest set of right-to-left-capable interface parts and is the framework Claude refines most fluently; the price is a heavier download on old phones, softened by pre-rendering the first view.

---

## 6. Hosting and scheduled refresh

**GitHub Pages, from a public repository** (`orishamir/finance-tool`), chosen by the founder; the site is static files and the pipeline is one command, so the choice is reversible at low cost.

- **Address and paths.** The site is served at `https://orishamir.github.io/finance-tool/`. The app's `basename` and Vite's `base` are both `/finance-tool/`. After the build, `site/scripts/pages-layout.mjs` lays out `site/build/client` for Pages: pre-rendered pages at the root, and React Router's SPA fallback as `404.html`, so a path without a pre-rendered page still loads the app.
- **A link pasted in a chat.** Every page's head carries its title, a one-sentence description and the Open Graph and Twitter tags a chat app reads to show the link as a card, with absolute addresses: `site/app/lib/page-meta.ts` writes them for every route's `meta`, and holds the site's address above, the only copy of it in the code. The card's picture is one for the whole site, `site/public/preview.png` (1200 × 630), made by hand with `node tools/preview-picture.mjs` in the site's own headless Chrome, so the Hebrew is shaped as on the site; run it again after a change to the site's name, line, colours or fonts. A picture per page would be made in the build, without a browser, and needs a renderer the build doesn't have. `site/scripts/link-preview-check.mjs` runs after the build and fails a page without the tags, with a description under 30 or over 200 characters, with another page's address, or whose picture file is missing or not the size its tags give. The pages keep `noindex`.
- **Deploy.** The `ci` workflow deploys `main` to Pages only after typecheck, tests, validation, the build and its chart and layout checks pass, in two jobs side by side (the tests; the build and the checks that open it in a browser). Pull requests run the checks only. The site to run offline is made only when asked: the `offline` workflow (Actions > offline > Run workflow, or `gh workflow run offline.yml`) builds the branch and keeps it as a workflow artifact, `finance-tool-site` (a `.tar.gz`, two weeks): extract it, run `python3 -m http.server` in the folder and open `http://localhost:8000/`. One difference from Pages: an address the build has no page for gets Python's own 404, not the site's not-found page.
- **Everything in the repository is public.** That includes the founder interview in `docs/discovery.md`, the research, and every file under `data/`. CMA and MoF data are under the data.gov.il open licence.
- **Raw archive.** The original file each refresh downloads is attached, gzipped, to a GitHub Release in the same repository: one release per source and month (`raw-<source>-<YYYY-MM>`), and for CMA one per report period (`raw-cma-<period>`). The raw files stay out of the git history, so clones stay small, and they need no extra service. Releases are public. Nothing on the site reads these files: they are evidence of what the source said on that date, and they let the pipeline re-derive fields later.
- **Scheduled refresh.** `refresh.yml` runs daily at 05:30 UTC (CMA, CBS consumer price index, MoF child-savings rates, in one CLI call, committed together); `refresh-rates.yml` runs daily at 15:30 UTC (ECB rates). GitHub disables scheduled workflows in a public repository after a stretch with no repository activity; the refresh commits keep it active, and the dead-man check (3.3) catches it if not.
- **Fallback for blocked fetches (H3, the hybrid option named when hosting was chosen).** A self-hosted runner attached to a public repository can be made to run code from a fork's pull request, which GitHub advises against. If a source blocks GitHub's runners, or the scheduled workflows stop, the refresh runs on the home machine (`npm run refresh -- cma cbs-cpi mof-child-savings`) and pushes its commit, rather than as a self-hosted runner.

---

## 7. Work by release

All five releases of the roadmap (`8dd1f013:research/2026-10-23-release-1/roadmap.md`, a record of its day) are built. Release 1 computed F-01 to F-28, F-33, F-40 to F-46, F-50, F-51 and F-54 for the guide timelines (F-67); a formula in `docs/method.md` that is not implemented yet is in the engine registry's `pending` list with the release that was to bring it.
