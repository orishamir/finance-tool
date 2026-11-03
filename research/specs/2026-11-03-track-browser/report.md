# Report: the track browser (issue #173), built 2026-11-03

Built by one builder (Sonnet, high effort) from `brief.md`, reviewed by the lead and by an independent reviewer that saw the diff
and the kit, not this report. The lead fixed what the review found (last section) before the merge.

## What was built
- **Page** `/tracks/:product?` ("כל המסלולים בכל החברות"), one route for the six products, `/tracks` showing
  `kupat-gemel-lehashkaa`. The product chips swap the list in place and the address follows. Tabs "לפי חברה" (`/companies`) and
  "לפי מוצר" (`/tracks`) on both pages; the menu item lights on both. Files: `routes/tracks.tsx`, `components/tracks/browser.tsx`
  (controls, state), `components/tracks/list.tsx` (the table and the phone rows), `components/decoder/company-tabs.tsx`.
- **Logic** (pure, tested): `lib/track-browser.ts` (the product view, the groups and their order, filter, search, sort, the
  words), `lib/track-names.ts` (the short names, ported from the prototype's `shortNames`), `lib/track-browser.server.ts` (the
  data the loader ships, compacted per product).
- **Data**: `buildYields` in `packages/pipeline/src/adapters/cma.ts` makes the 3- and 5-year average annual yields sourced value
  objects (CAT-04, CAT-05); `packages/pipeline/scripts/renormalise-cma.ts` rebuilt `data/cma/*.json` from their own `raw_fields`
  (no download; the lead checked that only the `yields` block was added, per fund, nothing reordered). Schema, JSON export and
  `docs/data-schema.md` section 3.13 follow. The formula-id pattern is widened to three digits (`F-NNN`) everywhere it is checked,
  which is why every JSON schema file changed.
- **Formulas**: F-99 (a company's assets in one product) and F-100 (a group's fee range; the kinds' order by the median of F-87)
  in `docs/method.md`, `packages/engine/src/formulas/track-groups.ts`, with tests on the September 2026 data (Harel in investment
  funds: 19,107.85 NIS millions; fee range 0.54% to 0.61%).
- **Kit**: promoted `PageTabs` (from the workbench tabs), `SortHead`, and the company page's track cells `FeeNum`, `FeeKey`,
  `TrackFeeLines`, `ExposureCell`, `ShareNum`, `TrackLabels` (`kit/track-cells.tsx`); `ProductTable` gained group headings,
  sortable heads and an opt-in sticky head. All in the gallery.
- **Ways in**: each of the six guides links to `/tracks/<id>`; every `/workbench/tracks/<id>` link now points to `/tracks/<id>`
  and the old address is pre-rendered as an immediate redirect (a test guards against new links to it).
- **Removed**: the old workbench tracks page and what only it used (`components/workbench/{workbench,group,controls,coverage}`,
  `lib/workbench*.ts`), and its strings. `/workbench/providers/<id>` stays.
- **Docs**: D54 in `docs/product.md`; `docs/design-system.md` names the new kit pieces.

## Checks
1. `npm run check` passes after the lead's fixes: 99 test files, 1,488 tests, data validation and the build.
2. Structure review: below.
3. Screenshots at 1280 and 390 px in `build/` (`shots.mjs`): every product, both groupings, a kind filter, a search with no
   result, each sort, the sticky head, `/companies` with the tabs, a guide with its link.
4. Nothing moves (`build/nothing-moves.mjs`, rerun by the lead after the fixes): changing the sort, the kind and the product
   leaves the controls' boxes and the table's column heads where they were, on the computer and the phone. The only boxes that
   change are the table's own height when grouping or a search changes its rows. The first run found the phone's controls moving
   22 px between products (the count line wrapped for a long product name); the count line now holds the longest of all six.
5. Speed (`build/speed.mjs`, rerun by the lead): every product's view is now built once when the page loads, so a click only
   redraws. Time from a click to the first screen redrawn: 31 to 82 ms on the computer and 31 to 72 ms at phone width (the 182-track
   product included); to the last row, 79 to 208 ms. To keep the first screen fast, the list draws its first 12 rows at once and the
   rest in a transition. The builder measured, before this change, with the processor slowed four times: 100 to 206 ms to the first
   screen on a product switch, 650 to 860 ms to the last row. **On a slow phone the 100 ms goal is likely still missed; not
   re-measured.**
6. Touch targets (`build/targets.mjs`): the page's own controls are at least 44 px at 390 px; two shared pieces it uses are
   smaller (the `TextField` input and a chip of `RulesLine`), left for a sweep of the kit. Nothing depends on hover.

## Decided differently from the brief
- The pre-rendered page holds the first 12 rows of the list; the rest arrive after the page loads (speed, check 5).
- The page shows the site's usual number legend and the stale-data callout, as the company page does.

## Independent review, and what the lead fixed
The reviewer confirmed the engine (F-99, F-100), the sort (natural directions, missing figures last, ties), filter and search,
the short names over all six products, the routes, the removals, `ProductTable` on the other pages (unchanged padding; the sticky
head is opt-in), touch targets and copy. It found, and the lead fixed:
1. **Self-managed funds showed a past return of 0%.** The file reports 0 in the yields of the self-managed (IRA) funds (1486,
   1487, 2023, 8888 and others, with a monthly yield and standard deviation of 0 too). Each member directs the money of such a
   fund (IRA-01), so it has no one return: the row now says "בניהול אישי: כל חוסך מחליט במה להשקיע" instead of the figures.
2. **The fee-from-deposits head sorted nothing in study funds** (every track there has none). The head sorts only where the fee
   differs between tracks; a fee the rule says is none (PF-06) sorts as 0, as the calculations take it.
3. **The old address waited 2 seconds on an English page.** The redirect is now permanent (301), which the pre-render writes as
   an immediate refresh.
4. **Short names failed when one track did not begin with the company's name** (Infinity, comprehensive pension: "מסלול בסיסי
   למקבלי קצבה"). The cut is now taken over the tracks that do begin with it.
5. **One kind was two groups** ("עוקב מדדים - גמיש" and "עוקב מדדים גמיש" in provident funds): one group now, under the spelling
   most tracks use.
6. The regulator's pension file writes "S&P" as "S1;P"; the short name puts the "&" back (the full name stays as written).
7. The default product came from a literal instead of `defaultProduct`; and `ShareNum` was missing from the gallery.

Left as they are: the phone's sort select cannot reverse the order (as in the prototype); F-99 sums carry float noise in the
inputs (the sheet rounds them).

## New strings
The `trackBrowser` section of `site/app/copy.ts` (about 70 strings, from the prototype's words). The lead read them as the
Hebrew editor: plural or impersonal throughout, full words; two sentences reworded (the order of the kinds, the pension products'
missing kinds).

## Structure review
`node research/audit/tools/merge-review.mjs main`: 81 code and doc files, so the independent reviewer above ran.
- **New components outside the kit (12)**: kept. `TrackBrowser`, `CountLine`, `TrackList`, `PhoneRow`, `NameCell`, `GroupLine`,
  `Yields`, `YieldFigure`, `AssetsFigure`, `FeeRange` compose kit pieces for this one page; `CompanyTabs` fixes the two tabs'
  words for the two pages that show them; `InstitutionChips` is the guide's existing piece, which gained the link.
- **Hebrew outside copy.ts (5)**: kept. They are patterns that match the regulator's text ("בע״מ", the Hebrew prefix letters,
  the child-savings kind's product name, "מסלול"), not words shown to the reader.
- **New kit pieces (8)**: promoted, each in the gallery (`ShareNum` added by the lead).
Nothing is left to send back.
