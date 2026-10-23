# Data inventory, release 1

Written 2026-10-23. Every file that the release 1 screens, the calculation engine and the data check read, taken from `docs/architecture.md`, `docs/data-schema.md`, `docs/design-spec.md`, `docs/flows.md` and the code in `packages/` and `site/`.

Status: **for founder review.** Section 3 lists what the inventory found that needs a decision before any of the missing files are written.

**Status 2026-10-23:** every file in section 1 that release 1 reads now exists (rows 1 to 12a), the schemas of section 3 item 3 are written, and three of the four "no file defined" gaps of item 4 are covered. The "Exists now" column is updated per row; the "Read by" and "Origin" columns are as written in the morning.

**Origins** (the founder's four, plus two that some files need):

- **Published source**: collected from an official or institution page, file or dataset, with the URL and the date read.
- **Rule base**: copied from the `il-finance` skill, with each rule's source link and checked date.
- **Approved wording**: the site's Hebrew text as approved in the design phase (`docs/copy.md`, `docs/glossary.md`, `docs/flows.md`, `docs/design-spec.md`).
- **Founder's choice**: a site parameter or a scope decision that only the founder makes.
- **Project document**: a document in this repository that the code reads for IDs or test values (not shown on the site).
- **Derived**: built from other files at build time; never edited by hand.

---

## 1. Files under `data/`

| # | Path | Read by | Origin | Exists now |
|---|---|---|---|---|
| 1 | `data/rules/<rule-id>.json` | Engine (figure resolver, every run); guide page figures; rule card; rules page; number sheet; data check | Rule base | **Yes.** 430 files (2026-10-23), one for every rule the wrapper records, exposure records, terms and dimensions name, open rules included; every record carries `text_he`, the rule in plain Hebrew that the rule card shows (section 3, item 4). |
| 2 | `data/instruments/wrappers/<id>.json`, one per wrapper: `current-account`, `bank-deposit`, `savings-plan`, `money-market-fund-daily`, `money-market-fund-renewable`, `makam`, `government-bond`, `brokerage-account`, `kupat-gemel-lehashkaa`, `keren-hishtalmut`, `pension-comprehensive`, `pension-general`, `provident-for-annuity`, `child-savings-provident`, `child-savings-bank`, `ira-hishtalmut`, `ira-provident` (data-schema §2) | Guide list; product guide page (what it is, money in and out, fees, tax steps, risks, checklist); exposure guide page ("how to hold it"); company page group headings; track page "product type"; search index; data check (formulas, rule IDs, open questions). Engine: dispatches formulas by wrapper (architecture 3.4); `runInputs` maps a record and P-05 to a run's inputs (method §2.4); no record file exists yet, so the tests use test records. | Rule base (names from the glossary) | **Yes, all 17** (2026-10-23; the validator regenerates each record's marks from its rule IDs). Every wrapper has its guide page; the illustrative run of each one takes its terms from the record P-05 `instruments` names (method §2.4, product D21). |
| 3 | `data/instruments/exposures/<id>.json` | Guide list; exposure guide page; track page "what the money is invested in"; search index | Mixed: names and fields from the rule base; which exposures get a page is product D18 (2026-10-23) | **Yes, 7** (2026-10-23): `shekel-cash`, `makam`, `government-bond-unlinked`, `government-bond-cpi`, `index-sp500`, `index-ta125`, `general-track`. Each lists the wrappers that can hold it (`wrapper_ids`, section 3 item 4); the index pages rest on ETF-33 to ETF-42. |
| 4 | `data/dimensions/<id>.json`, 26 rows | Dimension checklist on guide, exposure and track pages; data check (marks regenerated from rule IDs) | Rule base (vocabulary in the `il-finance` README) with the row names and explanations from `docs/glossary.md` §2 | **Yes, 26** (2026-10-23, generated from `research/glossary` and `docs/glossary.md`). |
| 5 | `data/terms/<id>.json` | Term table and term cards on guide pages; search index ("terms from statements and ads") | Rule base, via `docs/glossary.md` §1 and §3 (generated from `research/glossary/terms/*.json`, 552 rows before de-duplication) | **Yes, 449** (2026-10-23, generated). `data/terms/deposits/` holds 3 more records of another kind, Leumi's deposit terms, read by the illustrative runs of the deposit wrappers (row 10). |
| 6 | `data/catalog/<id>.json` | Company page (an institution's own name for a track, same-name groups and their resolution); track page; search index ("products"); data check (fund numbers exist in the CMA data) | **Published source.** Per data-schema §3.10 and product appendix E, an entry is a name an institution uses, with where and when it was seen (`where_seen`, `seen_on`). Some entries are already recorded in the rule base (CAT rules), and could be copied from there. It holds no UI wording (section 3, item 1). | **Yes, 38 Meitav entries** (2026-10-23): the kupat gemel lehashkaa (fund 7857) and all 16 of its tracks, 7 study-fund, 7 provident-for-annuity and 6 child-savings entries, each with Meitav's names, old names, where and when seen, and the same-name resolutions; `default_at_joining` marks the default track (section 3, item 4). Two entries are `not-catalogued-yet` (מיטב קידס and one child-savings name). |
| 7 | `data/cma/gemelnet@2026-09.json` | Companies list; company page; track page; search index; data check | Published source (CMA, data.gov.il) | Yes. Since 2026-10-23 the two fee fields are value objects (`fees.avg_annual_management_fee`, `fees.avg_deposit_fee`) with source, calendar year and rules CAT-35 to CAT-37 and CAT-40, and the company and track pages show them (discovery O11 confirmed). Refreshed daily by `refresh.yml`. |
| 8 | `data/cma/pensia-net@2026-09.json` | Same as 7, for pension | Published source (CMA, data.gov.il) | Yes, as row 7; a pension fund's fee pair belongs to the fund, not the track (CAT-39), and the page says so. |
| 9 | `data/parameters/tie-threshold.json` (P-01) | Parameters page (used in calculations from R2) | Founder's choice | Yes; read by the ranking (F-80) since 2026-10-23. |
| 10 | `data/parameters/illustrative-scenario.json` (P-05), with the slider ranges (design-system Q6) | Guide page timeline start values; values sheet and panel; the graph drawn at build time; engine F-67 | Founder's choice (chosen by Claude at his request, 2026-10-23) | Yes. Since 2026-10-23 it also holds `instruments`, the representative record per wrapper the illustrative run takes its terms from (method §2.4, product D21), and `annual_income` for the runs that need an income. |
| 11 | `data/parameters/sensitivity-bounds.json`, `fee-verdict-thresholds.json`, `classification-fit.json`, `golden-tolerance.json` (P-02, P-03, P-04, P-06) | Parameters page, which lists every parameter and shows "עוד לא נקבע" for one without a value. Not used in R1 calculations. | Founder's choice (chosen by Claude at his request, 2026-10-23) | Yes; and `goal-presets.json` (P-07, 2026-10-23, product D21), read by the release 2 goal form. |
| 12 | `data/changelog.jsonl` | Data check. Nothing on screen reads it in R1. | Written with each data change | Yes; it records the creation of every generated term and dimension (2026-10-23) and each refresh. |
| 12a | `data/fees/meitav@2026-10-23.json` | Guide page timeline: the list fees the illustrative run uses (method F-67, scenario S47 via S20; KGL-15) | Published source (Meitav product page, institution strength) | Yes (schema `feesSnapshot`, 2026-10-23). Also `leumi@2026-10-23.json` (12 tariff lines, the tariff the illustrative runs of the deposit, fund, makam and bond wrappers use) and `phoenix@2026-10-23.json`, a missing-snapshot record: no manager publishes a study-fund list fee, so the study-fund timeline runs on the regulator's average for the named track (method §2.4). |
| 13 | `data/averages/` | Written by the CMA refresh in R1 (architecture 3.3); no R1 screen reads it while the CMA fee fields are unconfirmed | Published source | No, and not needed: the company and track pages show the per-track CMA fee from row 7 itself; a class average is a computation for `docs/method.md` in R3. |

Not read in release 1: `data/series/` (R2; `cbs-cpi` and `mof-child-savings-rates` exist since 2026-10-23), `data/fund-lists/` (R4). `data/fees/`, `data/funds/` (3 records: Altshuler Shaham 5138763 and 1223866, IBI 1148162) and `data/terms/deposits/` are read since 2026-10-23 through P-05 `instruments` (rows 10 and 12a).

---

## 2. Other files the engine and the data check read

| # | Path | Read by | Origin | Exists now |
|---|---|---|---|---|
| 14 | `.claude/skills/il-finance/references/*.md` | Data check (rule IDs and open-question IDs) | Rule base | Yes |
| 15 | `docs/method.md` | Data check (formula IDs); engine registry test | Project document | Yes |
| 16 | `docs/data-schema.md` | Schema test (field tables match the code) | Project document | Yes |
| 17 | `tests/golden/scenarios.md`, `tests/golden/workings.md`, `data/parameters/golden-tolerance.json` | Engine golden tests | Project document; tolerance is a site parameter | Yes |
| 18 | Site strings from `docs/copy.md` (headings, buttons, labels, messages) | Every screen | Approved wording (see section 3, item 2) | `site/app/copy.ts` (2026-10-23); strings copy.md lacks are marked NEW there, and a later pass folds them back into `docs/copy.md` (release 2 strings are in copy.md §6) |
| 19 | Guide prose, one content file per wrapper and exposure (architecture 3.5: "written in Hebrew in content files") | Product and exposure guide pages | Approved wording, but the prose is not written yet; `docs/copy.md` has only the fixed labels | `site/app/content/guide/<wrapper-id>.tsx` (2026-10-23), one module per wrapper, all 17 written; `site/app/content/exposure/<exposure-id>.tsx`, all 7 written |
| 20 | Search index | Search | Derived (CMA names, catalogue, terms, guide pages) | Yes: the `search-index.json` resource route, pre-rendered at build (wrapper and exposure names, CMA track names, every name the catalogue records, the terms of the guide and exposure pages) |

---

## 3. Found while making the inventory

1. **`data/catalog/` holds no buttons or questions.** On 2026-10-23 the founder corrected the reading of the Meitav example (product appendix E): the catalogue lists every option an institution offers and does not mirror an app's screens. "The button-by-button 'what the app shows' view and the decoding of the app's questions" were removed, and `docs/flows.md` 6.11 redraws the company page as one list. `docs/design-spec.md` section 5 still describes the removed app view (`ProductMappingCard`, `AppQuestionCard`, "the default view shows what the company's app shows, from `data/catalog/`"); it was not updated with the correction. The catalogue's schema (data-schema §3.10) records institution names with where and when they were seen, which is collected data, not site wording. The site's own buttons and labels live in `docs/copy.md` and go into the site code (row 18). *Status 2026-10-23:* `docs/design-spec.md` section 5 now opens with a note that the page was built as one list and the app view was not built.
2. **Wording.** Settled 2026-10-23: `docs/copy.md` and `docs/glossary.md` are in force (design-system Q3, settled by Claude at the founder's request).
3. **No schema yet for exposures, terms, dimensions or catalogue** (wrappers and fees have theirs since 2026-10-23; the guide page reads the terms and checklist rows from `research/glossary/terms/` and `docs/glossary.md` at build until `data/terms/` and `data/dimensions/` exist). The data check rejects a file in a folder without a schema ("schema first, then data"). Writing rows 2, 4, 5 and 6 needs their Zod schemas in `packages/schema/` first, following data-schema §3.3, §3.10 and §3.11. *Resolved 2026-10-23:* the schemas exist and the files are written; the guide page reads the terms and the checklist rows from `data/terms/` and `data/dimensions/`.
4. **Things the screens show that have no file defined anywhere:**
   - the not-covered-yet list (flows 6.13): data-schema has no collection for tier-2 instruments; the content is in `docs/glossary.md` §3 and `research/glossary/terms/f-tier2.json`;
   - the rule in plain words, two to four sentences, on the rule card (flows 6.9): `data/rules/` holds only figures and an English title; *covered 2026-10-23:* every rule record has `text_he`;
   - which wrappers can hold which exposure (exposure page "איך מחזיקים את זה"): neither record lists the other; *covered 2026-10-23:* the exposure record lists them (`wrapper_ids`);
   - the track page's "why someone might pick this track" line and its "ברירת המחדל" tag: the CMA records have no such fields. *2026-10-23:* the tag is covered by the catalogue entry's `default_at_joining`; the "why someone might pick this track" line still has no file and is not shown.

   *Status 2026-10-23:* of the four, the not-covered-yet list (still from `docs/glossary.md` §3 and `research/glossary/terms/f-tier2.json`, no tier-2 collection) and the "why pick this track" line remain.
5. **`pension-general`**: settled 2026-10-23, it is in tier 1 (product D19).
