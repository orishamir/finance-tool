# Data inventory, release 1

Written 2026-10-23. Every file that the release 1 screens, the calculation engine and the data check read, taken from `docs/architecture.md`, `docs/data-schema.md`, `docs/design-spec.md`, `docs/flows.md` and the code in `packages/` and `site/`.

Status: **for founder review.** Section 3 lists what the inventory found that needs a decision before any of the missing files are written.

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
| 1 | `data/rules/<rule-id>.json` | Engine (figure resolver, every run); guide page figures; rule card; rules page; number sheet; data check | Rule base | **Partly.** 75 files. R1 needs one for every rule a wrapper record, a term or a dimension names, open rules included (the rules page lists them); the full count is known once the wrapper records exist. |
| 2 | `data/instruments/wrappers/<id>.json`, one per wrapper: `current-account`, `bank-deposit`, `savings-plan`, `money-market-fund-daily`, `money-market-fund-renewable`, `makam`, `government-bond`, `brokerage-account`, `kupat-gemel-lehashkaa`, `keren-hishtalmut`, `pension-comprehensive`, `pension-general`, `provident-for-annuity`, `child-savings-provident`, `child-savings-bank`, `ira-hishtalmut`, `ira-provident` (data-schema §2) | Guide list; product guide page (what it is, money in and out, fees, tax steps, risks, checklist); exposure guide page ("how to hold it"); company page group headings; track page "product type"; search index; data check (formulas, rule IDs, open questions). Engine: dispatches formulas by wrapper (architecture 3.4); the current engine code does not read these files yet, it takes only the rule figures. | Rule base (names from the glossary) | No |
| 3 | `data/instruments/exposures/<id>.json` | Guide list; exposure guide page; track page "what the money is invested in"; search index | Mixed: names and fields from the rule base; which exposures get a page is product D18 (2026-10-23) | No |
| 4 | `data/dimensions/<id>.json`, 26 rows | Dimension checklist on guide, exposure and track pages; data check (marks regenerated from rule IDs) | Rule base (vocabulary in the `il-finance` README) with the row names and explanations from `docs/glossary.md` §2 | No |
| 5 | `data/terms/<id>.json` | Term table and term cards on guide pages; search index ("terms from statements and ads") | Rule base, via `docs/glossary.md` §1 and §3 (generated from `research/glossary/terms/*.json`, 552 rows before de-duplication) | No |
| 6 | `data/catalog/<id>.json` | Company page (an institution's own name for a track, same-name groups and their resolution); track page; search index ("products"); data check (fund numbers exist in the CMA data) | **Published source.** Per data-schema §3.10 and product appendix E, an entry is a name an institution uses, with where and when it was seen (`where_seen`, `seen_on`). Some entries are already recorded in the rule base (CAT rules), and could be copied from there. It holds no UI wording (section 3, item 1). | No |
| 7 | `data/cma/gemelnet@2026-09.json` | Companies list; company page; track page; search index; data check | Published source (CMA, data.gov.il) | Yes |
| 8 | `data/cma/pensia-net@2026-09.json` | Same as 7, for pension | Published source (CMA, data.gov.il) | Yes |
| 9 | `data/parameters/tie-threshold.json` (P-01) | Parameters page (used in calculations from R2) | Founder's choice | Yes |
| 10 | `data/parameters/illustrative-scenario.json` (P-05), with the slider ranges (design-system Q6) | Guide page timeline start values; values sheet and panel; the graph drawn at build time; engine F-67 | Founder's choice (chosen by Claude at his request, 2026-10-23) | Yes |
| 11 | `data/parameters/sensitivity-bounds.json`, `fee-verdict-thresholds.json`, `classification-fit.json`, `golden-tolerance.json` (P-02, P-03, P-04, P-06) | Parameters page, which lists every parameter and shows "עוד לא נקבע" for one without a value. Not used in R1 calculations. | Founder's choice (chosen by Claude at his request, 2026-10-23) | Yes |
| 12 | `data/changelog.jsonl` | Data check. Nothing on screen reads it in R1. | Written with each data change | Yes |
| 13 | `data/averages/` | Written by the CMA refresh in R1 (architecture 3.3); no R1 screen reads it while the CMA fee fields are unconfirmed | Published source | No (not needed by an R1 screen) |

Not read in release 1: `data/series/` (R2), `data/fees/`, `data/funds/`, `data/fund-lists/`, `data/terms/deposits/` (R4).

---

## 2. Other files the engine and the data check read

| # | Path | Read by | Origin | Exists now |
|---|---|---|---|---|
| 14 | `.claude/skills/il-finance/references/*.md` | Data check (rule IDs and open-question IDs) | Rule base | Yes |
| 15 | `docs/method.md` | Data check (formula IDs); engine registry test | Project document | Yes |
| 16 | `docs/data-schema.md` | Schema test (field tables match the code) | Project document | Yes |
| 17 | `tests/golden/scenarios.md`, `tests/golden/workings.md`, `data/parameters/golden-tolerance.json` | Engine golden tests | Project document; tolerance is a site parameter | Yes |
| 18 | Site strings from `docs/copy.md` (headings, buttons, labels, messages) | Every screen | Approved wording (see section 3, item 2) | The document exists; no site file holds the strings yet |
| 19 | Guide prose, one content file per wrapper and exposure (architecture 3.5: "written in Hebrew in content files") | Product and exposure guide pages | Approved wording, but the prose is not written yet; `docs/copy.md` has only the fixed labels | No; no path is defined |
| 20 | Search index | Search | Derived (CMA names, catalogue, terms, guide pages) | No; built at build time |

---

## 3. Found while making the inventory

1. **`data/catalog/` holds no buttons or questions.** On 2026-10-23 the founder corrected the reading of the Meitav example (product appendix E): the catalogue lists every option an institution offers and does not mirror an app's screens. "The button-by-button 'what the app shows' view and the decoding of the app's questions" were removed, and `docs/flows.md` 6.11 redraws the company page as one list. `docs/design-spec.md` section 5 still describes the removed app view (`ProductMappingCard`, `AppQuestionCard`, "the default view shows what the company's app shows, from `data/catalog/`"); it was not updated with the correction. The catalogue's schema (data-schema §3.10) records institution names with where and when they were seen, which is collected data, not site wording. The site's own buttons and labels live in `docs/copy.md` and go into the site code (row 18).
2. **Wording.** Settled 2026-10-23: `docs/copy.md` and `docs/glossary.md` are in force (design-system Q3, settled by Claude at the founder's request).
3. **No schema yet for wrappers, exposures, terms, dimensions or catalogue.** The data check rejects a file in a folder without a schema ("schema first, then data"). Writing rows 2, 4, 5 and 6 needs their Zod schemas in `packages/schema/` first, following data-schema §3.3, §3.10 and §3.11.
4. **Things the screens show that have no file defined anywhere:**
   - the not-covered-yet list (flows 6.13): data-schema has no collection for tier-2 instruments; the content is in `docs/glossary.md` §3 and `research/glossary/terms/f-tier2.json`;
   - the rule in plain words, two to four sentences, on the rule card (flows 6.9): `data/rules/` holds only figures and an English title;
   - which wrappers can hold which exposure (exposure page "איך מחזיקים את זה"): neither record lists the other;
   - the track page's "why someone might pick this track" line and its "ברירת המחדל" tag: the CMA records have no such fields.
5. **`pension-general`**: settled 2026-10-23, it is in tier 1 (product D19).
