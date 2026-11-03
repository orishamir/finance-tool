# Brief: the track browser, every company's tracks of one product (issue #173, 2026-11-03)

For one builder (Sonnet, high effort), working alone in its own worktree. Do not start subagents. Commit on your
branch; do not push to `main` and do not open a pull request. The lead reviews and merges.

## Why
The founder chose this page over three rounds of drawings on 2026-11-03. The approved prototype is
`research/specs/2026-11-03-track-browser/mockups.html` (built by `gen.mjs` + `client.js` + `mockups.css` in the same
folder; open it in a browser and click everything before writing code). **The prototype is the spec for layout,
behaviour and words.** Where this brief and the prototype disagree, this brief wins.

His words, in order: "i like ג" (past returns and fund size beside the fees); "i want to have a notion of the
different companies not only the different tracks"; "i like 2 better" (a switch: group by company or by kind);
"i dont like that ... this is repeated a lot of times" (a row must not repeat its group heading); "instead of the
sort buttons make the table clickable" (column heads sort).

Read first: `CLAUDE.md` (ground rules and standing rules, all binding), `docs/design-system.md` section 2.5a
("nothing moves") and section 11 ("Lists of products", the kit), issue #173, and the prototype.

## What to build

### 1. Address, menu, ways in
- New route `tracks/:product?` in `site/app/routes.ts`, one route for every product (like `indices/:slug?`):
  choosing another product keeps the page and swaps the list without a full reload. `/tracks` with no product
  shows `kupat-gemel-lehashkaa` (the lead's provisional choice). Pre-render `/tracks` and `/tracks/<id>` for the six
  ids in `classificationToWrapper` (`site/app/lib/data.server.ts`) that map to a product:
  `provident-for-annuity`, `keren-hishtalmut`, `kupat-gemel-lehashkaa`, `pension-comprehensive`, `pension-general`,
  `child-savings-provident`.
- Page name (h1 and title): "כל המסלולים בכל החברות".
- The menu item "חברות ומסלולים" stays pointed at `/companies` and lights up on `/tracks` too. Both `/companies` and
  `/tracks` show two tabs at the top: "לפי חברה" (`/companies`) and "לפי מוצר" (`/tracks`). Promote
  `WorkbenchTabs` (`components/workbench/workbench.tsx`) into the kit as a general page-tabs piece, or use one the
  kit already has; add it to the gallery.
- Each of the six products' guides (`site/app/content/guide/<id>.tsx`) links to `/tracks/<id>`, in the place the
  guide already puts its links to lists.
- Every link to `/workbench/tracks/<id>` now goes to `/tracks/<id>`: `lib/rule-uses.server.ts`,
  `routes/company.tsx`, `routes/track.tsx`, `routes/fees.tsx`, `routes/holdings.tsx`, `lib/compare.ts`,
  `components/workbench/providers/provident.tsx`. The old address keeps working as a redirect to the new one
  (static site: a page that sends the browser on), and `lib/paths.server.ts` pre-renders it.

### 2. Controls (the prototype's order and words)
1. **מוצר**: six chips with each product's track count; the chosen one filled. Switches the list in place; the
   address follows (`/tracks/<id>`), so the back button and a shared link work.
2. A count line: "143 מסלולים של 12 חברות", "(מתוך N)" when filtered, and a link "מה זה <product>" to its guide.
   On the two pension products, add the line saying the regulator does not classify their tracks by kind.
3. **קיבוץ לפי**: "חברה" (default) | "במה הכסף מושקע". On the pension products the second is disabled.
4. **חיפוש**: matches the full track name as the company writes it, and the company name.
5. **במה הכסף מושקע**: chips on the computer, a select on the phone; "הכול" plus each kind with its count, in
   the kinds' order (below). Hidden on the pension products.
6. **Sorting** on the computer is by clicking column heads (no sort buttons). The phone has a select "מיון בתוך
   כל קבוצה" (its list has no heads).
7. A line above the list says the order in words, as the prototype's `#order` does.
Use the kit's pieces (`FilterChip`/`ChoiceChips`, `SegmentedControl`, `TextField`/`SelectField` in
`kit/fields.tsx`); add to the kit only what it lacks.

### 3. Groups and their order
- **By company:** one group per company, ordered by the company's total assets in this product, largest first
  (new formula, section 6). Heading: company name (a link to its company page), then "16 מסלולים · נכסים 19.1
  מיליארד ₪ · דמי ניהול מהחיסכון: מ־0.54% עד 0.61%" ("16 מתוך 16" style when filtered).
- **By kind:** one group per regulator sub-kind (`SUBSPECIALIZATION`), ordered by the median stock share (F-87) of
  its tracks, highest first, ties by size. Heading: the kind, then the regulator's kind (`SPECIALIZATION`), count and
  fee range.
- All groups open. Sorting acts inside each group; groups keep their order.

### 4. The row (reuse `ProductTable`, `ProductPhoneRow`, `ProductFigures`, `ShareRings`, `Tag` from the kit, and the
company page's `ExposureCell` / `ShareNum` / fee cells in `components/decoder/tracks.tsx`; move what both pages need
into the kit rather than copying)
- Columns (computer): name | קופה | דמי ניהול, ממוצע 2025 (two lines: מהחיסכון, מההפקדות) | exposure rings (stocks,
  currency) | תשואה שנתית ממוצעת, לפני דמי ניהול (two lines: 3 שנים, 5 שנים) | נכסים בסוף ספטמבר 2026 | open.
  `table-layout: fixed`, fixed widths, tabular figures. The heading row stays at the top of the screen while the
  table scrolls (the lead promised this; solve it with the table's horizontal scroll, or say why not).
- **Short name, no repetition** (the founder's tweak). A track shows its name without the words that every track of
  its company in this product begins with, and without a leading dash or "מסלול"; the cut never removes a word that
  is part of a kind's name; a company with one track loses only its own name. Port `shortNames` from `client.js`
  into a pure, tested function in `site/app/lib/` (test cases from the real data: Harel in investment funds → "אשראי
  ואג"ח"; Analyst and Phoenix in child savings; Mor in study funds; a one-track company). Also trim the product name
  the child-savings kinds repeat ("חיסכון לילד -", the prototype's `kindName`).
  - By company: the short name, plus the kind as a label chip only when the short name does not contain the kind
    (compare with spaces, dashes, quotes and case ignored).
  - By kind: the company name first (bold), with its track count and assets in this product; under it the short name
    only when it says more than the group's kind.
  - The full name as the company writes it stays on the track page and in the search.
- The "חדש" label and "עוד לא דווח" for tracks opened in or after the fee year (`lib/track-labels.ts`).
- Missing returns: "פחות מ־3 שנים" / "פחות מ־5 שנים" when the track is younger than that, else "לא דווח".
- The name and the open arrow lead to the track page (`/companies/<company>/<fund>`).
- **Sort by column heads:** name, fee from savings, fee from deposits (two clickable words under the fee heading),
  stock exposure, assets. First click gives the natural order (lowest fee, most stocks, largest assets, A to ת), a
  second click reverses; a missing figure is last either way; ties by the lower fee, then company. The active head
  is bold with ▲/▼, the others show a faint ⇅; set `aria-sort`. **No sort by past return** (the note under the table
  says why, as in the prototype). Every head is at least 44 px tall where it is the only control in its cell.
- Phone: one row per track (name; fees and fund number; exposure; returns; assets), as the prototype draws it.

### 5. Removed
The saved-goal strip, the fit column and its coverage line, the "לפי ספק" tab, the switch for closed tracks, the
"no goal" line. Delete the code only this page used (`routes/workbench-tracks.tsx`, `components/workbench/
{workbench,group,controls,coverage}.tsx`, `lib/workbench*.ts`, `routes/workbench-bundle.ts` if nothing else reads
it); keep `/workbench/providers/<id>` and what it needs (D52 keeps the provident company listings), only without a
tab leading from this page. Check with `grep` that nothing else imports what you delete.

### 6. Data, formulas, provenance (standing rule: every number traces to a source)
- **Returns as sourced values.** The CMA files hold the yields only in `raw_fields`. In
  `packages/pipeline/src/adapters/cma.ts` add `buildYields` beside `buildHoldings` (same pattern, value objects with
  source, field name, report period, `rule_ids` CAT-04 and CAT-05), for `AVG_ANNUAL_YIELD_TRAILING_3YRS` and
  `AVG_ANNUAL_YIELD_TRAILING_5YRS`; extend `renormaliseFees` (or a sibling) so the stored files are rebuilt from
  their own `raw_fields`, and regenerate `data/cma/*.json` that way (no download). Extend the Zod schema in
  `packages/schema`, its JSON export, and `docs/data-schema.md` §3.13. The rule base says the yields are nominal and
  gross of management fees (`.claude/skills/il-finance/references/tracks-catalogue-and-decoder.md`, CAT-04): the
  column says "לפני דמי ניהול" and the note adds "ולפני מס". Do not state anything about yields beyond that file.
- **New formulas in `docs/method.md`, each with an engine function in `packages/engine` and a test with a worked
  example from the 2026-09 data:** F-99, a company's assets in one product (the sum of its tracks' `TOTAL_ASSETS` at
  the period end; computed, not a ranking key, used to order the company groups); F-100, a group's fee range (the
  lowest and highest reported fee from savings among the group's shown tracks; tracks without a reported fee are
  left out) and the kinds' order (median of F-87 over the kind's tracks). Next free ids are F-99 and F-100; check
  first.
- Every figure goes through the provenance component (`components/provenance`): fees and assets and returns as
  sourced, exposure and the F-99/F-100 figures as computed; the stale clock as the company page shows it.
- `docs/product.md` section 1: add **D54 (2026-11-03)** in the table's style, saying: the track browser at `/tracks`
  lists every company's tracks of one product, grouped by company (default) or by kind, with past returns (3 and 5
  years, gross of fees, never a sort key) and assets beside the fees; the founder chose it over three rounds of
  drawings (`research/specs/2026-11-03-track-browser/`); this answers issue #60 (yes: returns and size join the
  fees); it ranks and recommends nothing. Reason column: the founder's words above.

### 7. Copy
All Hebrew in `site/app/copy.ts` (a new section; remove `r3workbench` strings no page reads any more), plural or
impersonal, full words, no process language. Take the words from the prototype. List every new string at the end of
your report for the lead's Hebrew review.

## Checks before you report
1. `npm run check` passes (typecheck, tests, data validation, build).
2. `node research/audit/tools/merge-review.mjs main` and answer each item it lists in your report.
3. Screenshots at 1280 and 390 px (model the script on `research/specs/2026-11-03-track-browser`'s use of the
   Playwright chromium in `~/.cache/ms-playwright/chromium-1243`, serving `site/build/client`): `/tracks`, each of the
   six products, both groupings, a kind filter, a search with no result, and each sort; plus `/companies` with the
   tabs and one guide with its new link. Put them in `research/specs/2026-11-03-track-browser/build/`.
4. **Nothing moves:** a script that changes the product, the grouping, the filter, the search and the sort and
   compares the boxes of the controls and the table's columns before and after; say what it found.
5. **Fast:** measure in the browser the time from a click to the list redrawn for the largest product (182 tracks);
   under 100 ms, or report the number.
6. 44 px touch targets at 390 px; nothing depends on hover.

## Report (to `research/specs/2026-11-03-track-browser/report.md`)
What you built, file by file; the formulas added; the screenshots; the results of checks 1 to 6; the new strings;
anything you could not do or decided differently from this brief, with why. Last line of the final commit message:
`Closes #173`, and a line `Closes #60`.
