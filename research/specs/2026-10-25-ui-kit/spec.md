# Build spec: one shared component kit (2026-10-25)

## Why
The founder, 2026-10-25, after two layout bugs in a day: "maybe there are some custom components you can make so we a. have consistent UI and b. have an easier and faster time programming, like the equivalent of a class … but for UI components"; and on the second bug, "this just reiterates the point about using shared components such as 'expandable' etc."

The bugs:
1. The fees page's what-if sentence ("שווה … ב־8 שנים.") was laid out as a flex column, so each piece took its own line (fixed in `FeeRow.tsx`; a sweep found no other case: `research/audit/tools/flex-sentence-sweep.mjs`).
2. A fold inside an open fold showed its open label ("הסתרת הטבלה") while closed: the CSS `group-open:` variant matches any open ancestor. The shared `Disclosure` now keeps its state in React (`site/app/components/ui.tsx`), but **16 hand-built `<details>`** elsewhere still use the fragile pattern (`grep -rn "<details" site/app`).

The cause of both: the shared layer is thin (`ui.tsx`: Button, LinkButton, Tag, Callout, Disclosure, SegmentedControl, Card; `provenance.tsx`: Num and friends), so each feature builds its own pieces. Duplicates today include three `ChartLegend`, `ChartReadout` and `ChartTable`, three `Row`, two `Marker`, two number-field sets (`timeline/fields.tsx`, `compare/fields.tsx`), and the guide visuals' own kits (`guide-signature/kit.tsx`, `g2-parts.tsx`).

## What to build
1. **Survey.** List every component under `site/app/components/` and every component defined inside `site/app/routes/`, and find the repeated patterns: folds, a label with a big figure and a note, sentences that carry numbers, number and range fields, segmented choices, chart legend, readout and table, section headers, source lines, "עוד לא חושב" notes, tags, cards. Write the list to `research/specs/2026-10-25-ui-kit/survey.md` with each duplicate and where it is.
2. **The kit**, in `site/app/components/kit/` (one file per component or per small family, re-exported from `kit/index.ts`; `ui.tsx` re-exports for old imports or its callers move). Each component: typed props, role tokens only, logical properties, works at 390 px, a one-line doc comment saying when to use it. Build each from the best existing version: no new look. At least:
   - `Disclosure` (the fixed one), and a list-group variant if the folds need it;
   - `Sentence`: inline text with `Num`s and links, never a flex container, so it can't break apart;
   - `Stat` (label, figure, optional note and tone), `StatRow` (two to four of them), `KeyValueList`;
   - `NumberField`, `RangeField` (slider and number together), `PercentField`, `SegmentedControl`;
   - `Marker` (a draggable marker on a chart axis), `GainBars` (two bars and a bracket);
   - `ChartLegend`, `ChartReadout`, `ChartTable` (one each);
   - `SourceLine`, `GapNote` ("עוד לא חושב" with its reason), `Callout`, `Tag`, `Card`, `Section` (heading, lead and body).
3. **Migrate** every duplicate and hand-built instance to the kit, the 16 `<details>` first. The look must not change except where a bug is fixed. Prove it: photograph a list of pages at 1280 and 390 px before and after (`research/specs/2026-10-25-guide-signatures/tools/sig-shots.mjs` is a model; photograph whole pages, not only one section) and compare them.
4. **A gallery page**: route `/kit`, pre-rendered, not in the menu or the search index, `noindex`. It shows every kit component in its states (empty, filled, entered, sourced, computed, open and closed, error), right to left, with the component's name beside each. It's the reference for builders and lets the founder review the look in one place.
5. **Guards** (tests in `site/`):
   - no `<details>` outside the kit;
   - no `group-open:` anywhere;
   - a `<p>` or `<span>` that mixes text and `Num` is never given `flex` or `grid` classes (a source scan is enough).
   - A section "Kit" in `docs/design-system.md`: every component, when to use it, and the rule that a new pattern goes into the kit first.

## Rules
Don't touch `site/app/components/provenance.tsx`, `data/`, `site/app/routes/switch.tsx`, or the workbench tab list in `site/app/routes/workbench-*.tsx` (another builder fixes them now). Run `npx vitest run site packages/engine` and `npm run typecheck`; never `npm run check` or the site build except as said below, never `pkill`. You may build the site in your own worktree for the screenshots (`npm run build -w site`) and serve it on your own port. Keep shell commands simple: scripts in files, then run them.
