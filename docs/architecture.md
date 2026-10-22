# Architecture

Written 2026-10-22 by the engineer from `CLAUDE.md`, `docs/product.md` (D1 to D13), `docs/roadmap.md`, `docs/method.md` and `docs/data-schema.md`, with data-access facts from `research/discovery/data-landscape.md`.
Status: **stack chosen by the founder on 2026-10-22: option C, React** (section 5). Hosting chosen by the founder on 2026-10-22: GitHub Pages from a public GitHub repository (section 6). Gap answers are recorded in section 8. History of this draft: Revised the same day: the founder made clear the site is used interactively (fields and graphs) on nearly every page, not read like articles; K8, 3.5, section 5 and section 7 were changed and the stack recommendation moved from A to B. Revised again the same day: the founder made a polished interface and good-looking graphs a priority. K12 and section 3.9 were added, and the recommendation moved from B to C (React, now with a TypeScript pipeline). Section 5 gives three stack options and section 6 three hosting options, each with a recommendation. Nothing is scaffolded until the founder picks.

How to read it:

- Section 1 lists what forces the design, each item traced to a decision or document. Sections 2 to 4 describe the system in a way that holds for every stack option. Sections 5 and 6 are the choices. Section 7 places the work in the five releases. Section 8 lists gaps in the existing docs that the architecture ran into.
- No financial figure appears here. Where one matters, the data file, rule or formula is named.

---

## 1. What drives the design

| # | Driver | From |
|---|---|---|
| K1 | **No server-side personal data.** Every calculation that uses a person's inputs runs in their browser. The site is static files; there is no application server. | D1, product.md §4, data-schema §1 ("the engine runs in the browser") |
| K2 | **Engine separate from the UI**, testable alone against `tests/golden/` and checkable by the finance-reviewer formula by formula. | Founder brief; method.md §13 |
| K3 | **Every displayed number is a value object** (sourced, computed or entered) with source, date and state, and the page shows which. | CLAUDE.md, D3, D7, data-schema §1 |
| K4 | **Rule gating.** An `open` rule never computes; `secondary` and `institution` rules compute and label; a figure past its `effective_to` stops the run with "figure not updated". | D10, method.md §13 |
| K5 | **Data validated against the schema before every build**, including the cross-file checks in data-schema §4. | Founder brief; data-schema §4 |
| K6 | **Scheduled refresh** at the cadences of product.md §6, keeping dated snapshots because no public archive exists, appending to the change log, and never hiding a stale number. | D3, product.md §6, data-schema §3.12 |
| K7 | **Hebrew, right to left, phone first**, with numbers, percentages, fund numbers and Latin names embedded in Hebrew text. | CLAUDE.md, product.md §2 |
| K8 | **Interactive on nearly every page.** People change fields and watch graphs respond. Guide pages take optional inputs and carry a timeline graph (3.1), the catalogue shows a fit mark against the saved goal (3.10), and R2 to R5 are all tools (comparison, workbench, fee materiality, holdings). The person's goal and inputs follow them from page to page. Only the rules, parameters and terms pages are pure reference. | founder, 2026-10-22; product.md 3.1, 3.10; roadmap.md |
| K9 | **Saved state is local, versioned and portable**: automatic in R2, export and import in R3, revisit against the change log in R5. Old export files must keep importing. | 3.9, N3 |
| K10 | **Data sources are awkward**: CMA CSVs are Windows-1255, data.gov.il has a WAF that rejects some queries, CBS requires a User-Agent, gov.il, TASE and ISA block scripts. All research fetches were made from a home machine, so access from cloud IPs is unverified. | data-landscape.md §1 |
| K11 | **Non-commercial, small audience, one maintainer.** Low running cost and few moving parts beat scale. The founder does DevOps, so self-hosting is available but not required. | CLAUDE.md, founder brief |
| K12 | **Polished interface and good-looking graphs.** Look and feel is a requirement, not a finishing touch. | founder, 2026-10-22 |

---

## 2. Shape of the system

```
 sources (data.gov.il CMA + MoF, BoI EDGE, CBS)        hand-collected (tariffs, funds, Maya fund list,
            │  scheduled fetch                          catalog, deposit terms, rules figures, parameters)
            ▼                                                       │  pull request
   pipeline: fetch → raw archive → normalise → validate → diff ─────┤
            │  commit (or PR when a sanity check trips)             │
            ▼                                                       ▼
   data/  (JSON, git = snapshot history)  +  data/changelog.jsonl  ◄┘
            │
            ▼
   build: validate (schema + cross-file) → resolve data bundles → engine at build time
          (first view of each page, dimension marks) → pre-rendered pages + search index
            │
            ▼
   static host  ──────►  browser: interactive pages, engine in a Web Worker, local saved state,
                         stale flags and effective-date checks computed against today's date
```

Three properties matter more than any tool choice:

1. **One engine, three runtimes.** The same engine package runs in tests (Node), at build time (to pre-render each page's first view, such as a guide timeline at the default scenario P-05, so a graph appears before any script runs) and in the browser (for the person's own inputs). It has no DOM, network or file access; callers hand it resolved data.
2. **Time-dependent checks run in the browser, not at build.** Stale flags (D3) and the "figure not updated" stop (method §13) are computed against the reader's current date. If the refresh pipeline breaks and nothing rebuilds, the flags still fire. A flag computed at build would freeze in the "fresh" state exactly when it matters.
3. **Git is the snapshot store for normalised data.** Every refresh is a commit; `data/changelog.jsonl` is the human-readable index of what changed. Raw downloads (the evidence) go to a separate archive (section 3.3).

---

## 3. Components

### 3.1 Schema package

One schema per collection in `docs/data-schema.md` §3, written once in code and used by the validator, the pipeline, the build, the engine's input types and the import of saved-state files (section 3.6). The value object is the base type; every collection is built from it, so a bare number fails validation by construction.

The schema package also exports JSON Schema files, so hand-edited JSON under `data/` gets autocompletion and inline errors in the editor through a `$schema` line.

`docs/data-schema.md` stays the human description. A test parses its field tables and fails if the code schema and the document disagree on a field name or a required flag, so the two cannot drift silently.

### 3.2 Validator

Runs before every build, in CI on every change, and inside the pipeline before anything is committed. It fails the build; it never warns and continues.

Checks, data-schema §4 first:

1. Schema of every file (§4 items 1, 3, 4, 5).
2. Every `rule_ids` entry exists as a `### <ID>` heading in `.claude/skills/il-finance/references/`, and every `data/rules/` file's `strength` matches the rule base (§4 item 2). The rule base is markdown; the validator reads only headings and the strength line, it does not interpret rules.
3. Every `formula` named in a record exists as an `F-nn` in `docs/method.md` (§4 item 6) **and** is either implemented in the engine's formula registry or listed as not yet implemented for the current release (section 3.4).
4. Exposure and fund cross-links (§4 item 8). Stored dimension marks equal the marks regenerated from `rule_ids` (§4 item 9).
5. Added here: every changed value under `data/` in a commit has a matching line in `data/changelog.jsonl` (checked against the git diff), so the change log cannot be skipped.
6. Added here: guide and page content contains no bare digits outside the provenance component (section 3.7), with an explicit allow-list for things that are not figures (rule IDs, form numbers, section numbers of a law).

Staleness (§4 item 7) is **not** a build failure; it is computed in the browser (section 2, property 2). The validator only reports it.

### 3.3 Refresh pipeline

A command-line program with one adapter per source. The scheduler (section 6) only calls it; the program is the same on a laptop, a CI runner or a home server.

Per adapter: **fetch** (with the User-Agent and download-URL quirks from data-landscape.md §1) → **archive** the raw response, compressed, under `source/date`, recording its hash → **normalise** to the schema (including Windows-1255 to UTF-8 for CMA CSVs) → **validate** → **diff** against the current files → write the new snapshot or appended observations and the change-log lines with `affects_rankings` set per data-schema §3.12.

| Adapter | Release | Cadence (product.md §6) | Writes to |
|---|---|---|---|
| CMA gemelnet, pensia-net (data.gov.il datastore API) | R1 | daily check; acts when a new `REPORT_PERIOD` appears | CMA fund records (gap 8.1), `data/averages/` |
| BoI EDGE: policy rate, per-bank deposit averages, makam and bond yields, FX, fee averages | R2 | daily; monthly and quarterly flows checked daily, written when new | `data/series/`, `data/averages/` |
| CBS CPI | R2 | daily check; monthly data | `data/series/cpi` |
| MoF child-savings rates (data.gov.il) | R2 | daily | `data/series/mof-child-savings-rates` |
| Tariffs, `data/funds/`, `data/catalog/`, `data/terms/deposits/` | R1 (catalog), R4 (rest) | manual | by hand or by the data-researcher agent, through a pull request |
| Maya fund-list export (CAT-33, CAT-34) and TASE's list of foreign funds traded on TASE (ETF-32): the set the fund-variant workbench chooses from (product D17) | R4 | manual, monthly (the pages block scripts) | `data/fund-lists/` (data-schema §3.14), through a pull request |

**Commit policy.** A refresh that passes validation and the sanity checks is committed directly. A refresh that trips a sanity check (a field disappears, a row count drops sharply, a value outside a plausible range, an encoding change) opens a pull request instead and alerts. Sanity ranges are pipeline configuration, not site parameters: they never reach a displayed number.

**Terms gate.** A series whose `terms_of_use.status` is not confirmed is fetched and archived but not shipped to the site; the page shows the link-out instead (product.md dependency 7, fallback "link out and show no number"). Switching to the data.gov.il copy is a change of adapter, not of the site.

**Raw archive.** CMA CSVs are several megabytes each and cumulative, so the normalised per-period extract goes in git and the raw file, compressed, is attached to a GitHub Release keyed by source and date (section 6), with its hash in the snapshot's `source` block. This keeps the repository small and still keeps the evidence D3 asks for.

**Failure.** A failed fetch changes nothing in `data/`, so the site keeps the last value with its date and the browser raises the stale flag (product.md §6, "on fetch failure"). A dead-man check alerts the founder when the daily job has not reported success.

**Helpers for hand-collected data.** Small CLI commands that scaffold a new catalogue entry, tariff or fund record with empty value objects, and that read an exported saved-state file and turn its "not catalogued yet" names (3.10) into catalogue stubs for the founder to complete.

### 3.4 Calculation engine

A TypeScript package with no dependencies on the UI, the DOM, the network or the file system.

**Structure follows `docs/method.md`.** One module per method section; one function per formula, named and headed by its ID (`F-40`), so the finance-reviewer can read the engine side by side with the method. A **formula registry** maps each F-ID to its implementation; wrapper records name their formulas (`tax_at_exit.formula` and so on, data-schema §3.3), and the engine dispatches through the registry. Adding a wrapper when a tier-2 instrument graduates (D2) is then a data change plus any new formulas, not a rewrite.

**Figure resolver.** The engine never reads a rule figure directly. It asks the resolver for `(rule ID, figure name, tax year)`. The resolver:

- refuses a rule whose strength is `open` and raises a **blocked** result with the open-question ID, which the engine turns into B3 "listed, not ranked" for that wrapper (method §1, §12);
- returns `secondary` and `institution` figures with a label that travels to every number they touch (D10);
- refuses a figure whose `effective_to` is before the run date ("figure not updated", method §13);
- records every rule it served. The run's **dimension checklist is derived from that record** (method §13: "derived from the rules used in the run, not hand-marked"), so a rule that enters the rule base as open turns a dimension to blocked without a page edit (3.3 "works when").

**Inputs and outputs.** Inputs are typed by assumption ID (`A-01` … `A-29`) and parameter ID (`P-01` … `P-06`), each a value object, so the state of every input (sourced or entered) is known to the engine. Outputs are value objects with `state: computed` and `computed_from` (formula ID and input references), plus the monthly ledger series, fees by type, tax during and at exit, labels, G-flags and the rules used. Every comparison also returns its coverage line (method F-83): the candidate count and one outcome code with its reason for each candidate. The engine returns **codes, never Hebrew text**: the site maps codes (formula, G-ID, rule ID, deciding factor from F-80) to copy. This keeps the engine testable in isolation and the wording in one place.

**Arithmetic.** IEEE double precision, rounding only for display (method §13). The method uses fractional powers (F-02, F-07, F-24), which decimal libraries handle poorly; double precision is far beyond the agora-level accuracy the golden tolerance (P-06) will ask for. Dates are civil dates (`YYYY-MM-DD`) and month indices; no time zones inside the engine.

**Determinism.** Same inputs and same data version give the same output on every device (3.2 "two people with the same inputs get the same answer", 3.9 "imports on another phone and reproduces the same results"). No randomness, no dependence on the device's locale or clock inside the engine; the run date is an input.

**Where it runs.** In the browser it runs in a Web Worker, so the sensitivity panel (F-81, many re-runs by bisection) never freezes a phone's UI. At build time it computes each page's first view (for example the guide timeline, F-67 with P-05) and the dimension marks; in the browser the same code re-runs on every field change.

### 3.5 Site

**One interactive app, every page pre-rendered.** Each page is generated from `data/` at build so its first view arrives as HTML, then becomes interactive: fields the person can change, and graphs and numbers that recompute through the engine as they do. Pages: one guide page per tier-1 wrapper and exposure (3.1) with its optional inputs and timeline graph, the tier-2 "not covered yet" page, one catalogue page per managing company listing every fund and track from the CMA data (3.10) with search and the fit mark (from R4 also each fund manager's funds from the Maya list), and from R2 the tools. The rules, parameters and terms pages are reference text. Guide prose is written in Hebrew in content files; every figure inside it is a component that reads a value object, never a typed number (section 3.7).

**Inputs follow the person.** The goal, profile inputs and entered values live in one app-wide state, saved locally (3.6), so a horizon set on a guide page or a goal set in the comparison is already filled in on the catalogue and the workbench. Where an input appears on a page that product.md does not list it for, that is a product question, not an engineering one (gap 8.9).

**Tools** (added from R2): goal comparison with presets and sensitivity, catalogue search and fit mark, fee materiality, holdings review, workbench, playbook, revisit. They load a **resolved data bundle**: the rule figures for the current tax year, parameters, wrapper records, the tier-2 list, latest series values and averages, stamped with a `data_version` (commit and build date). A comparison's candidate set is built from the bundle and never from what a page happens to show (product D17, method F-83). Manager-level CMA data and fund lists are split into small files and loaded on demand.

**Provenance on every number.** One component renders every number. It takes a value object, never a bare number, and shows the state (sourced, computed, entered by you), and on tap: the source with its date, the rule and its strength, the formula and inputs for a computed number, "site parameter" with its rationale, and the stale flag. It uses the native HTML popover, so it works in the pre-rendered first view before any script has loaded.

**Right to left.** `lang="he" dir="rtl"` on the document; CSS logical properties only (start and end, never left and right), enforced by a stylelint rule; every number, fund number, ISIN and Latin name wrapped in an isolating element so bidi reordering cannot scramble "25%" or a security number; numbers and dates formatted with `Intl` for `he-IL`; a Hebrew web font self-hosted (no request to a font CDN, in keeping with D1). Layout is designed at phone width first and widened for PC.

**Charts.** Our own SVG chart components (section 3.9), pre-rendered at build and redrawn in the browser on every field change. The direction of the time axis is a question for the founder (gap 8.6).

**Catalogue search.** A small client-side index built at build time over CMA fund names, `data/catalog/` names, `data/terms/` and, from R4, the Maya fund names. Hebrew normalisation before matching: final letter forms, geresh and gershayim against ASCII quotes, maqaf against hyphen, niqqud stripped, whitespace collapsed. A name with no match is recorded in local state as "not catalogued yet" (3.10).

**What the site does not load.** No analytics, no third-party scripts, no external fonts or CDNs at run time (D1, product.md §4). Pages carry `noindex` (gap 8.7).

### 3.6 Local saved state

- **Store.** One state document per browser in IndexedDB, written automatically (3.9). It holds the person's goals, entered values (as value objects with `state: entered`, data-schema §1), holdings, saved comparisons and uncatalogued names.
- **Versioned from the first write** (R2), even though export only arrives in R3 (N3). Every state document carries a format version; a chain of migrations upgrades any older version on load and on import. Import validates with the schema package and rejects a file it cannot read, without touching the existing state.
- **Saved comparisons carry what they used.** A saved comparison stores its inputs, the `data_version`, and the actual figures, parameters and series values it read (small). Revisit (F-82, R5) compares those stored values with the current bundle and the change log, so the site never needs to ship old snapshots to the browser.
- **Phones may clear it.** Safari can delete a site's stored data after a period without a visit unless the site is added to the home screen. The site requests persistent storage where the browser supports it and ships a web-app manifest so it can be installed; this needs checking on a real iPhone in R2. Between R2 and R3 there is no export to fall back on (gap 8.5).

### 3.7 How "every number traces to a source" is enforced

The rule is enforced in layers, so no single slip shows an untraced number:

1. **Data:** the schema has no place for a bare number (3.1).
2. **Engine:** outputs are computed value objects with their formula and inputs (3.4).
3. **Rendering:** the only way to show a number is the provenance component, which takes a value object (3.5).
4. **Content:** the validator rejects digits in guide prose outside that component (3.2 item 6).
5. **End to end:** a browser test visits every page and fails on any text node containing a digit that is not inside a provenance element or on the allow-list.

### 3.8 Testing

| Level | What | Tool |
|---|---|---|
| Engine, golden | Every scenario in `tests/golden/scenarios.md` as a machine-readable case; expected values come from the founder's spreadsheet; tolerance P-06 | unit test runner |
| Engine, properties | Invariants that need no expected value: no fees and no tax gives the gross path; a higher fee never raises the value; real equals nominal when inflation is zero; a blocked rule always yields "listed, not ranked"; every candidate of a comparison appears exactly once in its coverage line (F-83) | property-based testing |
| Engine, coverage of the method | Every F-ID in `docs/method.md` is implemented or listed as not yet implemented for the release | unit test |
| Data | The validator (3.2) on the real `data/` and on fixtures that must fail | unit test runner |
| Pipeline | Each adapter against recorded raw responses, including a Windows-1255 CSV | unit test runner |
| Site | Phone and desktop sizes, right-to-left layout, the provenance crawl (3.7 item 5), import of every historical export format | Playwright (the qa-engineer agent) |
| Review | Engine against the method and the rule base after any engine or schema change | finance-reviewer agent |

Engine and data tests run on every change; the browser tests run before each release and on changes to the site.

### 3.9 Look and feel

Polished interface and good-looking graphs are a requirement (K12), so they get their own step and their own components rather than being left to a library's defaults.

- **Design before building pages.** Before the R1 pages are built, a design pass produces:
  - design tokens: a Hebrew type scale and font, colour palette, spacing; dark only (founder, 2026-10-22; `docs/design-system.md`);
  - the visual language for the three number states (sourced, computed, entered by you), the stale flag and "site parameter";
  - a chart style guide;
  - mockups of three key screens at phone and PC widths, for the founder to approve: a guide page, a company page of the catalogue and the R2 comparison.
  Pages are then built to the approved mockups. Each later release starts with mockups of its new screens.
- **Our own chart components, not an off-the-shelf chart library.** Charts are SVG components built from D3's scale, shape and axis modules, the approach interactive-graphics teams use. Off-the-shelf chart libraries are quick to start with but fight back on exactly what this site needs:
  - right-to-left layout with Hebrew labels, legend order and axis placement;
  - the three number states drawn distinctly, so an "entered by you" return can never be mistaken for a sourced one (roadmap R5 risk);
  - ranges and sensitivity bands (F-81);
  - annotations such as "locked until", "tie" and "blocked";
  - smooth transitions when a field changes;
  - the same chart pre-rendered as SVG at build, so it appears before any script runs.
  A small set of chart types covers the product: value over time for several options, stacked fee drag, cumulative cost by provider, and a ranked bar with tie bands.
- **Phone first interaction.** On a phone, touching and dragging across a chart shows a readout (no hover); on PC, hover does the same. Inputs that are changed often use controls that suit thumbs: sliders with a typed value beside them, steppers, and bottom sheets for the less common fields.
- **Motion.** Numbers and graphs move to their new values when an input changes, briefly, and stay still when the device asks for reduced motion.
- **Review.** Each release's screens are captured at phone and PC sizes by the qa-engineer, and the founder reviews the screenshots before the release ships.

---

## 4. Repository layout

```
docs/  research/  data/  tests/golden/        as today
packages/schema/      schemas, types, JSON Schema export, data-schema.md consistency test
packages/engine/      formulas by method section, registry, figure resolver; no I/O
packages/pipeline/    adapters, normaliser, validator, change-log writer, CLI helpers
site/                 pages, content, components, tools, worker wrapper around the engine
infra/                scheduler definitions (CI workflows or systemd units), host config
```

A single workspace with one lockfile; versions pinned. The repository is not under git yet; scaffolding starts with `git init`, because the change log, snapshots and CI all rely on it.

---

## 5. Stack options

Common to all three, so not part of the choice:
- a TypeScript engine package (it must run in the browser, K1; separate from the UI, K2);
- the schema-first validator (K5);
- the pipeline in TypeScript, one language end to end (the first draft's Python pipeline is dropped: its only advantage was CSV handling, which TypeScript does well enough);
- static hosting (K1);
- Tailwind CSS with logical-property utilities for right-to-left layout;
- our own D3-based SVG chart components (3.9);
- Playwright for browser tests.

What decides it is K8 and K12. The site is an interactive app on nearly every page, and it must look polished. Polish comes from many rounds of small refinements, so what matters is:
- how good the ready-made interface parts are (sliders, number fields, bottom sheets, popovers, tabs) and whether they support right to left;
- how easy animation is;
- how fluently the builder, Claude, writes the framework, since that sets the cost of each round.

### Option A: Astro, static first, with interactive islands

Pre-rendered HTML pages, with interactive parts as Preact islands.

- **For:** the lightest pages.
- **Against:** nearly every page here is interactive, so most pages become islands, and the person's inputs have to be passed between islands and pages through a separate store. Not recommended for this site.

### Option B: SvelteKit, pre-rendered

One app with every route pre-rendered.

- **For:**
  - Built-in motion: values that glide to a new position make a graph animate when a field changes with almost no code.
  - SVG charts sit naturally in its templates, and Svelte has a long record in newsroom interactive graphics.
  - The smallest runtime of the three on a phone.
- **Against:**
  - A smaller and younger set of ready-made interface parts (shadcn-svelte on Bits UI), with right-to-left support less proven.
  - Svelte 5 is recent, and Claude writes it less fluently than React, so the same level of polish takes more rounds.

### Option C: React, pre-rendered (recommended; chosen 2026-10-22)

One app with every route pre-rendered: React Router in framework mode with pre-rendering, no server.

- **For:**
  - The richest set of polished interface parts: shadcn/ui on Radix primitives, which accept a direction setting for right to left. The components are copied into the repository, so every detail can be changed.
  - Motion (formerly Framer Motion) for transitions.
  - The most examples, and the stack Claude writes most fluently, so look-and-feel iterations are fastest.
- **Against:**
  - The heaviest runtime of the three. It is noticeable mainly on old phones and is softened by pre-rendering the first view and running the engine in a worker.
  - Animation needs a library rather than being built in.

### Comparison

| | A Astro + islands | B SvelteKit | C React |
|---|---|---|---|
| Interactive on every page, inputs carried between pages | awkward | natural | natural |
| Ready-made interface parts with right-to-left support | via Preact/React, partly | younger, less proven | richest |
| Animated graphs on field change | possible | built in | with a library |
| How fluently Claude builds and refines it | good | fair | best |
| Runtime weight on a phone | lightest | light | heaviest |
| Languages | one | one | one |

**Recommendation: C.** Between B and C it is close, and either can produce beautiful graphs: the graphs are our own components in both, and the look comes from the design pass (3.9) more than from the framework. What tips it to React is that polish is built by iteration. React has the deepest set of ready-made parts that handle right to left, and it is the framework in which each round of refinement is cheapest and least error-prone. The price is a heavier download on old phones. Choose B if that runtime weight, or Svelte's built-in motion, matters more to you than the larger component ecosystem.

---

## 6. Hosting and scheduled refresh

The site is static files and the pipeline is one command, so this choice is reversible at low cost.

**Chosen by the founder on 2026-10-22: GitHub Pages, from a public repository** (`orishamir/finance-tool`). This is H1 with GitHub Pages as the static host. What follows from it:

- **Address and paths.** The site is served at `https://orishamir.github.io/finance-tool/`. The app's `basename` and Vite's `base` are both `/finance-tool/`. The build lays out `site/build/client` for Pages: pre-rendered pages at the root, and React Router's SPA fallback as `404.html`, so a path without a pre-rendered page still loads the app.
- **Deploy.** The `ci` workflow deploys `main` to Pages only after typecheck, tests, validation and build pass. Other branches and pull requests run the checks only.
- **Everything in the repository is public.** That includes the founder interview in `docs/discovery.md`, the research, and every file under `data/`. So the terms gate (3.3) applies to the repository too: a series whose redistribution terms are unconfirmed (BoI EDGE, CBS; product.md dependency 7) is not committed to `data/` until the terms are confirmed or the data.gov.il copy is used. CMA and MoF data are under the data.gov.il open licence and can be committed.
- **Raw archive.** The original file each refresh downloads is attached, compressed, to a GitHub Release in the same repository (one release per source and month). The raw files stay out of the git history, so clones stay small, and they need no extra service. Releases are public, which is fine for openly licensed data (CMA, MoF on data.gov.il). A file with unconfirmed terms is not attached (see above). Nothing on the site reads these files: they are evidence of what the source said on that date, and they let the pipeline re-derive fields later, for example the CMA fees once O11 confirms their definitions.
- **Scheduled refresh.** GitHub disables scheduled workflows in a public repository after a stretch with no repository activity. The refresh commits keep it active; the dead-man check (3.3) catches it if not.
- **Fallback for blocked fetches (H3).** A self-hosted runner attached to a public repository can be made to run code from a fork's pull request, which GitHub advises against. If a source blocks GitHub's runners, the refresh runs on the home machine from cron and pushes its commit, rather than as a self-hosted runner.

| | H1 Managed | H2 Self-hosted | H3 Hybrid |
|---|---|---|---|
| Code | private GitHub repository | self-hosted git (for example Forgejo), or GitHub | GitHub |
| Scheduled refresh | GitHub Actions cron on GitHub's runners | systemd timer or cron running the pipeline in a container | GitHub Actions on a **self-hosted runner** at the founder's place |
| Build and serve | Actions builds; a static host with a free tier serves (Cloudflare or similar) | the same box builds; Caddy or nginx serves; a tunnel if served from home | Actions builds; the managed static host serves |
| Raw archive | object storage (for example Cloudflare R2) | local disk with an off-site backup | object storage |
| Alerts | failed-workflow email plus a dead-man check | dead-man check (for example healthchecks) | both |
| For | nothing to run; free at this size | full control; fetches come from a home IP like the research did | fetches from a home IP; serving stays up when the home box is down (stale flags then fire, as designed) |
| Against | cloud runner IPs may be blocked by the data.gov.il or CBS firewalls (K10, unverified) | the founder maintains uptime, TLS, patches and backups | two places to look when something breaks |

**Recommendation: start on H1, with H3 as the planned fallback.** The first task of R1 is a spike that runs every R1 and R2 adapter from a GitHub-hosted runner. If a source rejects it, the refresh job moves to a self-hosted runner by changing one line in the workflow, and nothing else changes. H2 is the right choice if the founder would rather own the whole chain; the design does not depend on it.

---

## 7. Work by release

What each release adds to each component. Capabilities and their order are those of `docs/roadmap.md`.

| | R1 understand | R2 decide for a goal | R3 fees and holdings | R4 providers, funds, switching | R5 exposures, revisit, growth |
|---|---|---|---|---|---|
| **Schema and validator** | all collections R1 uses; cross-file checks; change-log check; content digit check | series, averages | holdings and export format | `data/fees/`, `data/funds/`, `data/fund-lists/`, `data/terms/deposits/` in use | tier-2 records as they graduate |
| **Pipeline** | CMA adapters, raw archive, change log, dead-man check; runner spike (section 6); catalogue scaffolding helper | BoI, CBS, MoF adapters; terms gate | uncatalogued-names import helper | tariff and fund scaffolding helpers; fund-list import helper | none new |
| **Engine** | resolver and gating; registry; F-01 to F-28, F-33, F-40 to F-46, F-50, F-51, F-54 as needed for the guide timelines (F-67); dimension marks | F-30 to F-32, F-47 to F-49 (blocked where the method says), F-52, F-53, F-60, F-80, F-81, F-83; worker | F-61, F-62, F-64, F-70, F-72 | F-12 to F-14 at full tariff detail, F-63, F-65, F-66 | F-71, F-82 |
| **Site** | design pass and approved mockups (3.9); design tokens and chart components; app shell and shared input state; guide pages with optional inputs and live timeline graphs; tier-2 page, rules, parameters, terms; per-manager catalogue pages and search; provenance component | comparison tool with presets, ranking, ties, sensitivity, idle-cash preset; coverage line; catalogue fit mark | fee materiality, holdings review, track workbench | provider workbench, fund variants, bank products and Maya funds in the catalogue, playbook rendered from rule entries | exposure mode with entered returns; revisit and "what changed since" |
| **Local state** | guide inputs and uncatalogued names, versioned | automatic saved state, manifest and persistence request | export and import with migrations | none new | saved comparisons re-run (they already store what they used, from R2) |
| **Tests** | golden scenarios for the R1 formulas; property tests; provenance crawl | golden apartment and ETF-vs-provident cases; sensitivity cases | 3.5 and 3.6 cases on the founder's holdings; old-format import | provider ranking case (one versus ten trades a month) | revisit before and after a rule change |

Two R1 items gate everything after them, in this order: the schema and validator, then the engine's resolver and registry. The guide pages cannot show a timeline until the formulas they use pass their golden scenarios, which need the founder's expected values (roadmap R1 risk).

---

## 8. Gaps the architecture found in the existing docs

Each needs a decision or a document change; none is filled in here.

1. **No collection for CMA fund records.** The catalogue (3.10, R1), the track workbench (F-64) and holdings review (3.6) read every fund and track per manager from the CMA datasets, and `data/catalog/` points to `cma_fund_id`, but `docs/data-schema.md` defines no collection that holds them. Proposal: `data/cma/<dataset>@<YYYY-MM>.json`, one normalised file per dataset per report period, holding only the fields the method uses, each in value-object form. Needs the founder's approval and an entry in data-schema §3; the field units wait for O11 (product.md dependency 4). **Approved by the founder on 2026-10-22**; added as `docs/data-schema.md` §3.13.
2. **Tax-year figures over a multi-year horizon.** method.md §13 says a run in tax year `y` reads the figures for `y`; the golden scenarios fix every figure at 2026. The method does not say explicitly that today's figures apply to every future month of the projection. The engine will do that, as the scenarios do, once method.md states it.
3. **`tests/cases/` or `tests/golden/`.** product.md says one, method.md and the repository use the other (method §13 already notes it). The architecture uses `tests/golden/`, which exists; product.md should be changed to match. **Answered 2026-10-23:** `tests/golden/`; product.md and roadmap.md changed.
4. **Strength vocabularies differ.** `il-finance` uses `primary`, `institution`, `secondary` (and open questions); data-schema adds `primary-mirror` and `entered`. The validator will check `data/rules/` strength against the rule base, so the mapping between the two needs writing down in data-schema §1.
5. **Saved state without export between R2 and R3.** On iPhones, browser-stored data can be cleared after a period without visits unless the site is installed to the home screen. Saved state ships in R2 and export in R3, so a friend's R2 goal can disappear with no backup. Options: move export and import to R2, or ship R2 with the install prompt and say so. A roadmap decision. **Founder, 2026-10-22: fine as is, not a concern now.** Revisit if a friend loses saved state.
6. **Direction of the time axis in charts.** Text, legends and layout are right to left; whether time on a chart runs left to right or right to left is a UI choice not made anywhere. Proposal: left to right, as is common for time series; the founder decides. **Founder, 2026-10-22: yes, time runs left to right.**
7. **Search engines and analytics.** The site is not for the general public (product.md §4) and holds no personal data on a server (D1). Proposal: `noindex` on every page and no analytics of any kind. Neither is written down yet. **Founder, 2026-10-22: not a concern now.** Nothing is added for either until it is raised again.
8. **Data terms as a release gate.** The terms gate (3.3) means BoI series stay hidden until EDGE terms are confirmed or the data.gov.il fallback is in place (dependency 7). If neither is done before R2, the idle-cash preset ships without the per-bank average, showing the link-out instead.

9. **Which fields each page offers.** product.md 3.1 gives guide pages optional age, employment type and horizon, and an illustrative timeline. It does not say whether the amount, the monthly contribution or the return used by that graph can be changed on the guide page, or only in the comparison (3.2). The architecture supports either; the choice belongs in product.md. **Founder, 2026-10-22: every value behind the guide graph is editable, starting from the illustrative scenario** (product.md 3.1, appendix C; method.md F-67).

---

## 9. Next step

Stack chosen (C), hosting chosen (GitHub Pages), gap 8.9 answered. Scaffolding starts with `git init`, the workspace, the schema package and the validator. The design pass (3.9) runs alongside, and no page is built before its mockup is approved.
