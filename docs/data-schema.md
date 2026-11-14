# Data schema: the format of every fee, term and rule figure under `data/`

Every number the engine reads comes from a file in one of the collections below, for `docs/method.md`. No value appears without a source URL and a checked date (CLAUDE.md standing rule, D3). The checked schemas are in `packages/schema` (Zod); where this text and the schema differ, the schema is the truth and this text is corrected.

---

## 1. Common rules

**Format.** One JSON file per record, UTF-8, under the collection's folder. JSON was chosen because the site is static and the engine runs in the browser (D1); the files are also readable by hand and diffable. YAML would be friendlier to write but needs a parser in the browser; CSV cannot carry the nested `source` and `fees` blocks.

**File name.** `<collection>/<id>.json`, where `id` is the record's `id` field: lowercase ASCII, digits and hyphens. Dated snapshots (tariffs, series, funds) add the snapshot date: `<id>@<YYYY-MM-DD>.json`. The latest snapshot is the one the engine reads; older ones stay for a saved comparison's revisit (F-82) and as history.

**Every value is wrapped.** A number never appears bare. It appears as a *value object* (`valueObject` in `packages/schema/src/value.ts`):

```json
{
  "value": 1.05,
  "unit": "pct_per_year",
  "source": {
    "url": "https://fs.knesset.gov.il/...",
    "title": "תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע\"ב-2012, reg. 2(a)",
    "publisher": "Knesset",
    "strength": "primary"
  },
  "checked": "2026-10-22",
  "effective_from": "2014-01-01",
  "effective_to": null,
  "tax_year": null,
  "update_rule": "fixed in regulation",
  "rule_ids": ["PF-02"],
  "state": "sourced",
  "notes": ""
}
```

Field rules:

| Field | Required | Meaning |
|---|---|---|
| `value` | yes | number, string, boolean, or `null` when the value is unknown (then `notes` says why; the schema fails a `null` with empty notes). In a wrapper's `fee_caps`, `null` means no cap was found in the law and the rules read, and the guide writes so ("לא נמצאה תקרה בחוק") |
| `unit` | yes | one of the units in section 2 |
| `source.url` | yes | the page or file actually opened; a search snippet is not a source |
| `source.title` | yes | document and section or page |
| `source.publisher` | yes | who published it |
| `source.strength` | yes | `primary`, `institution`, `secondary`, `open`, `entered` (below) |
| `checked` | yes | date the source was read, `YYYY-MM-DD`, on Israel's calendar (`israelToday` in `packages/schema`, `tools/israel-date.mjs` for the tools), never the UTC date |
| `effective_from` | yes | first date the value applies; `null` if unknown |
| `effective_to` | yes | last date, or `null` while current; the engine refuses a value past this date (method §13) |
| `tax_year` | when the value is a tax figure | the tax year it belongs to (TXG-01); optional and nullable in the schema |
| `update_rule` | yes | how the figure changes: `fixed in law`, `fixed in regulation`, `cpi-linked 1 jan`, `average-wage-linked`, `frozen <YYYY-YYYY>` (the years it is frozen, for example `frozen 2025-2027`), `provider-set`, `market`, `founder`, `set yearly` (set anew for each year by its authority, with no rule the site follows; with `effective_from` and `effective_to` the year it is for) |
| `rule_ids` | when a rule governs the value | `il-finance` rule IDs |
| `state` | yes | `sourced`, `computed`, `entered` (D7). A value with `state: computed` carries `computed_from`: the formula ID (`F-nn` or `A-nn`) and the inputs |
| `notes` | no | free text, including any conflict between sources |
| `rationale_he` | no, parameters only | the reader's own short line for this one number, in plain Hebrew (§3.2). Only under `data/parameters/` |

**Strength vocabulary** follows `il-finance` README and D10, with one addition: `entered` for values the person typed, which never live under `data/` but share the same object shape in saved state (`site/app/lib/state.ts`).

**Dates and money.** Dates are `YYYY-MM-DD`. Money is in NIS unless `currency` says otherwise. Percentages are stored as numbers in percent (`1.05` means 1.05%), never as fractions, to match how every source prints them.

**Hebrew.** Any name an institution, regulator or statement uses is stored exactly as the source spells it, in a `names` block, so the catalogue (3.10) and term matching (3.1) can match strings.

---

## 2. Units and enumerations

Units: `nis`, `nis_millions`, `usd`, `eur`, `gbp`, `pct` (a share), `pct_per_year`, `pct_of_deposit`, `pct_of_trade`, `pct_of_balance_per_period`, `nis_per_month`, `nis_per_trade`, `nis_per_transfer`, `usd_per_share`, `nis_per_share`, `eur_per_share`, `gbp_per_share`, `usd_per_trade`, `gbp_per_trade`, `usd_per_event`, `nis_per_usd`, `fx_per_eur`, `months`, `years`, `days`, `business_days`, `index_points`, `count`, `boolean`, `text`.

Units that need a word:

- `nis_millions`: an amount in millions of shekels, as the CMA datasets report amounts (CAT-03), used by the `holdings` of §3.13 (D34). The site shows it as `25,706.14 מיליון ₪` and does not convert it.
- `usd`, `eur`, `gbp`: an amount in dollars, euros or pounds sterling, as its source prints it. An amount abroad (§3.16) stays in its own currency and is never converted, since a conversion would add a rate that needs a source and a date of its own.
- `usd_per_share`: a dollar amount per share, a per-share commission rate. `nis_per_share`, `eur_per_share` and `gbp_per_share`: the same in shekels, euros or pounds, a sum per unit the person types on the fee page (method F-112); no price list collected prints one. `usd_per_trade` and `gbp_per_trade`: a dollar or pound amount per trade, a minimum or maximum commission in a foreign currency. They serve the foreign brokers' tariffs; the engine converts them at the run's exchange rate.
- `usd_per_event`: a dollar amount for each corporate event of a security held abroad, as One Zero prints its custodian's cost (D67). F-103 charges it on each dividend of a fund bought abroad, converted at the run's rate.
- `nis_per_usd`: shekels per dollar converted, for a conversion printed as agorot a dollar (Psagot's 1.5 agorot). F-13 charges it on the dollars converted.
- `fx_per_eur`: units of a currency per one euro, the ECB reference rate, for the FX series of §3.8.

Fee bases (`fee.base`): `deposit`, `balance`, `trade`, `custody`, `fx`, `exit`, `fixed_period`, `corporate_event`, `distribution_handling`, `spread`, `creation_redemption`, `transfer_out`, `load`, `redemption_deduction`, `variable_management`, `trustee`, `direct_expenses`, `insurance_premium`.

Security types for tariff lines (`fee.applies_to`, and a snapshot's `availability.applies_to`): `tase_shares_bonds`, `tase_bonds` (a bonds-only line, for a tariff that prices bonds apart from shares and ETFs), `makam`, `foreign_securities`, `mutual_fund_units`, `money_market_units`, `etf_units`, `tase_foreign_fund_units`, `all`.

Provider classes (`provider.class` of a fee snapshot): `bank`, `broker`, `foreign_broker`, `provident-manager`, `fund-manager`, `insurer`. Regulators (`provider.regulator`): `BoI`, `ISA`, `CMA`, `foreign`.

Wrapper IDs (`data/instruments/wrappers/`): `current-account`, `bank-deposit`, `savings-plan`, `brokerage-account`, `kupat-gemel-lehashkaa`, `keren-hishtalmut`, `pension-comprehensive`, `pension-general`, `provident-for-annuity`, `child-savings-provident`, `child-savings-bank`, `ira-hishtalmut`, `ira-provident`. Tier-2 wrappers get IDs when they graduate (D2).

Security IDs (`data/instruments/securities/`, D6): `makam`, `government-bond`, `money-market-fund-daily`, `money-market-fund-renewable`. A tier-2 instrument bought inside a securities account (corporate bonds, REITs) graduates as a security, not a wrapper.

Product IDs: a wrapper ID or a security ID, what a person chooses between. A guide page (`/guide/<id>`), a comparison option, a term's and an exposure's `wrapper_ids`, P-05's `instruments` and P-08's `holding` rows are named by product ID (`productId` in `packages/schema`).

Exposure IDs (`data/instruments/exposures/`): `shekel-cash`, `makam`, `government-bond-unlinked`, `government-bond-cpi`, `index-<index-code>` (for example `index-sp500`, `index-ta125`), `general-track`.

Dimensions (`data/dimensions/`): the vocabulary in `il-finance` README (`tax-at-exit`, `fee-management-balance`, ...): the 26 rows of `docs/glossary.md` section 2, an enum in the schema (`dimensionId`).

---

## 3. Collections

### 3.1 `data/rules/` — rule figures the engine reads

The rules themselves stay in `il-finance` (markdown). This collection holds only their **figures**, one file per rule, so the engine never parses markdown and every figure carries its own tax year. The schema is `ruleRecord`.

```json
{
  "id": "TXS-09",
  "title": "Exempt fund: tax on real gain at sale or redemption",
  "strength": "primary",
  "dimensions": ["tax-at-exit", "real-vs-nominal"],
  "likely_to_change": "no",
  "recheck_date": "2027-01-15",
  "figures": {
    "rate_on_real_gain": { "value": 25, "unit": "pct", "tax_year": 2026, "...": "value object" },
    "withholding_rate": { "value": 25, "unit": "pct", "tax_year": 2026, "...": "value object" }
  },
  "il_finance_file": "tax-securities-israeli.md",
  "checked": "2026-10-22"
}
```

- `figures` keys are the names used in `docs/method.md` formulas. A figure that differs by tax year is stored once per year in `figures.<name>.by_tax_year`, a map from year to value object.
- Bracket tables (TXG-02, TXG-04) store `figures.brackets` as an ordered array of `{ "up_to": value object, "rate": value object }`.
- `strength: open` records exist (for the rules page and the blocked marks) but carry no `figures`.
- `recheck_date` is required for every rule on the "likely to change" list (`likely_to_change: "yes"`, product.md 3.8).
- **Hebrew.** `title_he` (optional) is the Hebrew title shown in lists and on cards; `text_he` (optional, 2 to 4 sentences of plain Hebrew) is shown on the rule card; `figure_names_he` (optional) maps each figure key to its Hebrew name. The English `title` stays the key and the fallback when they are absent.
- Conflicts (coverage.md §9) are recorded in `notes` on the figure and the engine uses the value the rule base says computes (for example TXI-11's 15%).
- **`sources`**, extracted from the `- Source:` line under each rule's heading in `il-finance`; every record carries it or `sources_missing_reason`. An array of entries sorted by preference (regulator or ministry document, Knesset gazette, institution, article; then locator present; then newer `checked`); a company's own data page (a `dataset` of strength `institution`, such as TASE's index pages) ranks with the institutions, not with the regulators. Each entry:
  - `url`: the link as the block writes it, except that an entry split off a link carrying `#page=` (below) names its own page there, so the address opens where its passage is; the data check holds the address to the block but for that number;
  - `title` (as the markdown wrote it, often an English working title), optional `title_he`;
  - `publisher` (English, from `data/sources/publishers.json` by host, else the host) and optional `publisher_he`;
  - `kind`: `law`, `regulation`, `circular`, `regulator_page`, `official_pdf`, `exchange_rules`, `institution_doc`, `article`, `dataset`, `form`, `other`;
  - `strength`: `primary`, `institution`, `secondary`. A copy of an official text (on Wikisource, Nevo or any third-party host) is never a source: the extraction leaves it out as a lead, and the data check fails one;
  - `locator` (raw: "s. 3(ה4)(3)", "pp. 27–30") with `locator_he` (only when the locator translates fully); a remark in English, in parentheses or as a part after "; " that opens on a word naming no place and holds no reference ("; the ISA directives list shows no later version"), is left out;
  - `page`: first page for `#page=`, only on a PDF URL and never a printed page: the page of the first passage of the locator that names one, plain (`p.5`) or the file's (`file p.9 (gazette p.300)`); within one passage a `file p.` wins over a plain `p.`, which is then the printed number (`p.909 (file p.21)`). A PDF URL is a `.pdf` path, a gov.il blob folder file, or a gazette file from the Ministry of Justice's Reshumot service at `free-justice.openapi.gov.il/…/Documents/…`, whose links already carry their `#page=`;
  - `anchor`: a section id on an HTML page, without `#`; only on an HTML URL;
  - `quote`: the document's own words, verbatim from a quoted Hebrew span in the markdown, 8 to 240 characters, never composed;
  - `checked`; `qualifier` (the markdown's parenthetical after the strength word); `note` (English, never shown).

  One link may cite several passages, each opening with its page (`p.8, s.4.1 "…"; p.9, s.4.2.3 "…"`). The passages before the first one whose quoted words become a `quote` are one entry, opening at their first page; that passage and each after it is an entry of its own, with its own `locator`, `page` and `quote`. So every entry's `page` is the first page its own `locator` names, and where the link carries `#page=`, each entry's address carries its own page.

  A figure's own `source` object stays as it is.
- `sources_missing_reason` replaces `sources` when the Source line names no link (the raw text). `derived_from` lists the rule ids a Source line points to ("as in FXD-07", "pointers to X, Y"), for the chips on the card. A general rule's pointer to a record that is not general (a company's term named beside the general source) goes to `examples` instead: a named example, shown under "לדוגמה", never a derivation; a general rule's `derived_from` holds general rules only, and only a general rule carries `examples`.
- **`scope`** (required; D30, build spec `8dd1f013:research/specs/2026-10-25-rules-scope/spec.md`): who the rule applies to, extracted from the `- Scope:` line of the rule's block.
  - `general`: a law, regulation, regulator's text or exchange rule says it, and it binds every institution of that kind;
  - `institution`: one named company's own term;
  - `unsettled`: it reads like a general rule, but only company documents (or the press) support it so far.

  `scope_institutions` (an array of `{ id, name_he }`, ids and names from `data/sources/institutions.json`) names the companies: required for `institution`, the companies whose documents were seen ("seen at") for `unsettled`, absent for `general`. `scope_settle` (English working text, never shown) is what would settle an `unsettled` rule, and is set exactly for that scope. A Scope line has one of three forms: `general`; `institution: <names>`; `unsettled: <what would settle it>[; seen at: <names>]`. A name two companies of one group share (IBI, the broker and the fund manager) resolves by the registry's `only_records`.
- **The extraction.** `packages/pipeline/scripts/extract-sources.ts` (`npm run extract:sources -w @finance-tool/pipeline`, `--dry` to only print the report, `-- --only=KGL-12,MF-25` to write only the records of the blocks just edited, `-- --drift` to list the records that differ from what their blocks give today; the check fails while any does, `packages/pipeline/test/records-match-blocks.test.ts`) writes its keys in place (`scope`, `scope_institutions`, `scope_settle`, `sources`, `sources_missing_reason`, `derived_from`, `examples`) and nothing else, never edits the markdown, and saves `8dd1f013:research/knowledge/2026-10-24-extraction-report.md`. It is re-runnable: it replaces its own keys and reads `data/sources/publishers.json`, `data/sources/documents.json` and `data/sources/institutions.json` when present. A `documents.json` row matches a link by substrings of its title; a row with `hosts` labels only links on those hosts. A link to a copy of an official text is left out as a lead and listed in the report. A host whose default kind is `law` (the official gazette) gives way to a title that names regulations. A Scope line that is missing or names a company the registry does not resolve is printed and leaves the run's exit code at 1.
- **The source tables** (`packages/schema/src/collections/sources.ts`). `data/sources/publishers.json` maps each host (without "www.") to `{ publisher, publisher_he, kind }`. `data/sources/documents.json` holds one row per recurring document, `{ id, match, title_he, publisher_he, kind, official_url, hosts?, library_id?, doc_kind?, institution?, version?, pages?, topics?, read_note?, note? }`: `match` are the substrings that find it, and the optional fields after `hosts` describe a company's own terms for the law and terms browser (its row in the document library, the kind of document, the institution whose term it is, the edition it prints, its pages, where each topic sits, and why no copy is in the library). A company's term is shown under its name and never as a fact about a product (D30).
- **The institution registry** `data/sources/institutions.json`: one row per company a scope can name, `{ id, name_he, kind, scope_names, cma_legal_id, fees_id, deposit_bank_id, own_hosts, filing_names?, note? }`.
  - `kind` is `provident-manager`, `bank`, `broker`, `foreign-broker`, `fund-manager`, `insurer`, `index-provider`, `exchange`, `regulator` or `other`.
  - `scope_names` are the names the rule base writes (`{ name, only_records? }`; a name shared with another row carries `only_records` on every row but one).
  - `own_hosts` are the hosts of the company's own sites, without "www." (a subdomain counts; a group's site serves each of its companies); `filing_names` are the names its filings on Maya (`mayafiles.tase.co.il`) open with. A source there is the company's own document; a record is listed in the company's section only when it cites one, and never when it is a not-rule (`listedAt` in `packages/schema/src/scope.ts`). A press report or a forum post about a company is not its document.
  - The company's page is `/companies/<cma_legal_id>` for a managing company, else `/companies/<fees_id>` or `/companies/<deposit_bank_id>` for a bank or broker the site has a page for; a row with none of these has no page, and its terms are listed on `/companies` under "companies with no page here".
- **The quote fragments** `data/sources/fragments.json` (founder, 2026-11-07): one row per cited web page and quoted words, `{ url, words, text: { prefix?, start, end?, suffix? }, seen }`, so the link opens at those words by text fragment (`#:~:text=`). `url` and `words` are exactly a record's link and its `quote` (or an advertising entry's `claim_he` or `binding_he`); `text` is the fragment's terms in the page's own characters, kept only where the words stand on the page as it prints them and the fragment lands on them first; `seen` is the day the page was read (not `checked`, so it never moves the data's date). Written only by `tools/quote-fragments.mjs`, which keeps a row only where Chromium lands on the words and paints them; the site attaches each row to its record when it reads it (`site/app/lib/fragments.server.ts`: an object with `url` and `quote`, or a place `<x>_source` beside its words `<x>_he`) and `sourceHref` builds the link. The places that can carry it declare an optional `fragment` (`textFragment` in `value.ts`) so a record checked again after reading keeps it; the validator fails a record file that writes one. A PDF has no row: its link opens at its `page`.
- **The brands** `data/sources/brands.json` (D33): one row per group the site shows as one company, `{ id, name_he, members, fund_managers, note? }`. `members` are registry ids, each in one brand at most; `fund_managers` are the `manager` strings of the fund records under `data/funds/` whose funds the brand's page lists. The page's address is the members' CMA id when one is in the CMA data (so track addresses do not change), else the broker's snapshot id, else the brand's id; every member's CMA, snapshot and deposit id and the brand's id show the same page. The validator fails a member missing from the registry, a member in two brands, a repeated id, and a fund manager no fund record names.

### 3.2 `data/parameters/` — site parameters (N1)

```json
{
  "id": "tie-threshold",
  "method_id": "P-01",
  "value": { "value": 0.5, "unit": "pct", "state": "sourced", "source": { "url": "docs/parameters-rationale.md#tie-threshold", "title": "Founder rationale", "publisher": "founder", "strength": "primary" }, "checked": "2026-10-22", "effective_from": "2026-10-22", "effective_to": null, "update_rule": "founder" },
  "rationale": "text the page shows under 'site parameter'",
  "shown_as": "site parameter"
}
```

The schema is `parameterRecord`: `id`, `method_id` (`P-nn`), `rationale` and `shown_as` (`site parameter`) are required, `value` is optional, and the object is loose, so each parameter's own fields (below) pass unchecked except P-05's `instruments`. An optional `rationale_he` (string) holds the Hebrew version of `rationale` for the page: the file's general line, what the whole parameter is and why the site sets it.

**A line for each number.** Every value object inside a parameter file (an input, a slider bound, a table cell, a preset field, a bound of the sensitivity test) may carry its own optional `rationale_he` (string, plain Hebrew, one or two sentences, `valueObject` in `packages/schema/src/value.ts`). The number's sheet shows that line first, and the file's general `rationale_he` only behind "עוד על הפרמטר"; a number with no line of its own shows the file's line directly. **What the reader text may say:** what the number is, what it is used for, and, when the site chose it, that it is a round starting value or a judgement, not a measured average, a forecast or a rule. **What it may not say:** who chose it ("Claude"), test scenarios, audit ids, a history of earlier values or a repair; all of that stays in `docs/parameters-rationale.md`. A digit that repeats the number is avoided too, because the sheet shows the number above the line and a copy drifts when the value changes. A saved comparison does not see these lines: `parameterVersions` (`packages/engine/src/compare/revisit.ts`) leaves them out, so editing a line is never a "parameter changed" on a revisit.

The parameters and their fields:

- `tie-threshold` (P-01): `value`.
- `sensitivity-bounds` (P-02): one entry per assumption ID (`A-01` ...) with `lo` and `hi` value objects.
- `fee-verdict-thresholds` (P-03): `negotiate_nis`, `avoid_nis`, `negotiate_share`.
- `classification-fit` (P-04): an array of `{ "classification": "<CMA value, exact spelling>", "horizon_min_years", "horizon_max_years", "max_fall_pct" }`.
- `illustrative-scenario` (P-05): `inputs` (`amount_now`, `monthly_deposit`, `horizon_years`, `A-01`, `A-02`, `cash_rate`, and the optional `annual_income`, `nis`, read only by runs that need an income) and `sliders` (`min`, `max`, `step` for the monthly deposit, the years, the amount today and A-01, and `change_share` with its `start` for the indices page's change chart, F-90), and `instruments`, below.
- `golden-tolerance` (P-06): `abs_nis` and `rel_pct`.
- The other files: `goal-presets` (P-07), `exposure-holding-wrapper` (P-08), `pinned-rules` (P-09, checked by §4 item 12) and `home-guide-door` (P-10).

**P-05 `instruments`** (`instrumentSpec`, strict): a map from product id to the data records of the representative instrument the guide page's illustrative run takes its terms from, each key naming a record by id:

- `deposit_terms`: a `data/terms/deposits/` id (deposit family). `current-account` names a `deposit_terms` record whose `term_months` may be null (no term; the run uses the ledger's month-to-month balance).
- `fund` (a `data/funds/` id) and `tariff` (a `data/fees/` provider id whose `list` lines are the tariff) for the securities family; `ira_fees` (a fees provider id; only `ira-hishtalmut`); `tariff` alone for `makam`; `tariff` with `series_rule` (a `data/rules/` GOV rule id) for `government-bond`.
- `track` (a CMA `fund_id`) for a provident-family wrapper that no managing company publishes a list fee for (`keren-hishtalmut`, `pension-general` and `provident-for-annuity` today): the run takes the track's `avg_annual_management_fee` and `avg_deposit_fee` (§3.13) as its balance and deposit fees, labelled as an average actually charged, not a list price.
- `employment` (`self-employed` or `employee`; `keren-hishtalmut` only): the employment type the illustrative run uses.
- `chosen_by` (text): an entry chosen after the record says who chose it (2026-11-07: `kupat-gemel-lehashkaa`'s `track`, D88; its run prices the collected lists, F-80).
- The two money-market funds name a `fund` and no `tariff`: their trade and custody lines are 0 under MF-26 and BANK-18.

A product with no entry has no timeline on its guide page, and the build logs which input is missing. The validator checks that every id the map names exists, and that a `track` is a `fund_id` of the latest period in `data/cma/` (§4). The mapping is in `docs/method.md` §2.4 "Instrument terms". The values are the founder's (`docs/parameters-rationale.md`).

### 3.3 `data/instruments/wrappers/` — one record per wrapper (D6)

```json
{
  "id": "kupat-gemel-lehashkaa",
  "names": { "he": ["קופת גמל להשקעה"], "statement": [], "app": ["חיסכון פלוס"] },
  "regulator": { "value": "CMA", "...": "value object with REG rule_ids" },
  "fee_bases_allowed": ["deposit", "balance", "direct_expenses"],
  "fee_caps": {
    "deposit": { "value": 4, "unit": "pct_of_deposit", "rule_ids": ["PF-02", "KGL-14"], "...": "value object" },
    "balance": { "value": 1.05, "unit": "pct_per_year", "rule_ids": ["PF-02", "KGL-14"], "...": "value object" }
  },
  "ceiling": { "per": "person_per_calendar_year", "amount": { "value": 83641, "unit": "nis", "tax_year": 2026, "update_rule": "cpi-linked 1 jan", "rule_ids": ["KGL-02", "KGL-03", "KGL-24"], "...": "value object" } },
  "deposit_side_tax": { "formula": "F-33", "rule_ids": ["TXK-01"] },
  "tax_during": { "formula": "F-27", "rule_ids": ["TXK-03"] },
  "tax_at_exit": { "formula": "F-44", "rule_ids": ["TXK-05", "TXK-06", "TXK-07"], "blocked_by": [], "labels": ["secondary source: base"] },
  "lawful_exit": { "kind": "any_time", "payout_business_days": { "value": 4, "unit": "business_days", "rule_ids": ["KGL-08"], "...": "value object" } },
  "switch_is_tax_event": { "value": false, "rule_ids": ["TXK-04"], "...": "value object" },
  "transfer_routes": [{ "to": "kupat-gemel-lehashkaa", "rule_ids": ["PF-17", "KGL-10"] }, { "to": "provident-for-annuity", "condition": "age >= 60", "rule_ids": ["KGL-09", "TXK-10"] }],
  "eligibility": { "rule_ids": ["KGL-06"], "text": "anyone, any age" },
  "protection": { "rule_ids": ["PF-29"], "text": "assets held in trust, cannot be attached" },
  "dimensions": { "tax-at-exit": "covered", "age-or-use-exemption": "covered", "loss-offset": "blocked:TXK-OQ10" },
  "tier": 1,
  "open_questions": ["TXK-OQ3", "TXK-OQ10"],
  "checked": "2026-10-22"
}
```

- The schema is `wrapperRecord` in `packages/schema`. It is strict: a field not named here is an error. Which fields become a run's inputs is in `docs/method.md` §2.4.
- `tax_*.formula` points to `docs/method.md` (an `F-nn` id); `blocked_by` lists open-question IDs; when non-empty the engine applies B3.
- A `fee_caps` entry is a value object with two more optional fields. `binds` is whom the cap binds where it binds only some providers. `banks` is a cap that binds banks only (the price of moving securities out, BRK-18; the ban on custody of makam, BRK-17); `banks_and_fund_distributors` is a cap that binds banks, and a fund's distributor that is not an investment marketer where it has a distribution agreement for the fund (the ban on custody of money-market units, BANK-18, MF-26 reg. 2(ד)). Set it only where the entry's own `notes` say so. With no `binds` the cap binds every provider of the product. The fee page judges a cap with `binds` only where the deal names a bank, since which non-bank members are such distributors is not known (method F-113, BRK-52). `caveat` marks a cap that holds only in a case a deal does not state: the fee page states it in the caveat's words and judges no price against it, at any provider (method F-113). `closing_account`: a bank's price for moving securities out is at most the value only when the account is being closed and the securities move to the client's own account at another financial body; the rules name third-party costs with the value, and whether they are inside it or on top of it is not settled; while the account stays open the supervised price holds (BRK-18, SW-33). So a price above the value may be lawful and one below it may not be. `distribution_agreement`: no cap is set in general (the value is empty), but a bank, or another distributor of the fund that is not an investment marketer, with a distribution agreement for the fund may charge the holder nothing for buying or redeeming its units (MF-26 regs. 1 and 2(ד)). Set it only where the entry's own `notes` say so. The schema is `feeCap`.
- `ceiling` may be `null`; `tier` is `1` or `2`; `transfer_routes[].to` is a product ID.
- `dimensions` is computed from `rule_ids` at build time (product.md 3.3) and stored for display; a hand edit is not allowed. A mark is `covered` or `blocked:<id>`, where `<id>` is an open question of the rule base that the record also lists in `open_questions`; the data check fails a bare `blocked` (2026-11-07: two records had one with no question opened, and a page showed "חסום" with nothing to open). A page still reads a bare mark as blocked, with no question beside it.
- `company_terms` (optional, D30): a property each company sets for itself, as a map from dimension id to the `institution` or `unsettled` rule records that hold the companies' own terms (`{ "fee-fx": ["BRK-23"] }`). An entry is a record id when the record names one company, or `{ "rule": "BRK-28", "companies": ["meitav-trade", "fair"] }` naming the companies whose own term on the property the record states (BRK-28 gives an opening minimum for Meitav Trade and Fair, not for Leumi or Psagot). A record that names several companies is always written this way, even when it states the property for all of them. The guide's fee rows and its rows under "מי מציע ומי מפקח" (D49) say "תלוי בחברה" there and link to those companies' pages. They are not `rule_ids`: a wrapper is a product context and cites general rules only, and a company's term marks no dimension.
- `lawful_exit.kind` is a string with this vocabulary: `any_time`, `at_maturity`, `after_years`, `at_age`, `at_child_age`, `trading_day` (the schema checks only that it is a non-empty string). Besides `payout_business_days`, a record may carry `years`, `age`, `term_months` (each a value object) and `text` (the condition in plain words). The object stays strict.
- A closed wrapper (for example after a future merger of wrappers, D6) keeps its record with `effective_to` set; the field is absent or `null` while the wrapper is open.

### 3.3a `data/instruments/securities/` — one record per security held in a wrapper (D6)

A security, in the site's model, is what a person buys inside a wrapper and that carries rules of its own: a security held directly (makam, a government bond) or units of a fund (the money-market funds). Only the securities that are products a person chooses between have a record here; the index funds an account holds are `data/funds/` records with their exposure. Its record has every field of a wrapper record, with the same meaning, plus two:

```json
{
  "id": "makam",
  "held_as": "direct",
  "held_in": {
    "wrapper_ids": ["brokerage-account", "ira-hishtalmut", "ira-provident"],
    "rule_ids": ["GOV-21", "GOV-22", "GOV-05", "BRK-01", "IRA-11"],
    "text": "a security held directly in a securities account at a bank or a TASE member ..."
  },
  "names": { "he": ["מק\"מ"], "statement": [], "app": ["מק\"מ"] },
  "...": "the fields of §3.3"
}
```

- `held_as` is `direct` (held directly) or `fund_units` (units of a fund).
- `held_in.wrapper_ids` names the wrappers that can hold it; the first is the one its guide page and its comparison option run in (the securities account for all four). `rule_ids` are the rules that say it is held there; they may cover a dimension the security's own rules do not (validator §4 item 9), but a dimension only they carry need not be marked.
- The other fields hold what belongs to the security: its tax in a taxable account, its own liquidity, the issuer or fund law behind it (`regulator`, `protection`), its own route and minimum (`eligibility`), and a fee rule set by its security type (`fee_caps`: a bank may not charge custody on makam or money-market units, BRK-17). What the wrapper decides (who may open the account, who supervises it, how client assets are kept, what happens if the member fails) is read from the wrapper's record and is not copied into the security's.
- Inside a wrapper that sets its own tax (an IRA), the wrapper's tax applies instead of the security's.
- The schema is `securityRecord` in `packages/schema`; `productRecord` is either, `productSchemaOf` picks the schema by the presence of `held_in`.

### 3.4 `data/instruments/exposures/` — one record per exposure type

```json
{
  "id": "index-sp500",
  "names": { "he": ["S&P 500", "אס אנד פי 500"], "en": ["S&P 500"] },
  "kind": "equity_index",
  "currency": "USD",
  "cash_like": false,
  "return_source": { "mode": "entered", "series": null },
  "variants": ["fund:1159250", "fund:ie00b5bmr087", "fund:us4642872000", "fund:11xxxxx-ibi-sp500"],
  "wrapper_ids": ["brokerage-account"],
  "checked": "2026-10-22"
}
```

- The schema is `exposureRecord` in `packages/schema` (strict). `id` is lowercase kebab. `names` holds `he` and `en`. `kind` is one of `equity_index`, `bond_index`, `cash_like`, `mixed`, `commodity`, `other`. `currency` is an ISO 4217 code. Optional `rule_ids` and `open_questions` list rule and open-question IDs.
- `wrapper_ids` (optional) lists the products that can hold the exposure, as product IDs: `brokerage-account` means "through a fund in a securities account", a security ID (`makam`, `government-bond`) means "bought directly". The makam exposure does not list `brokerage-account`, because holding makam directly in the account is the `makam` security record.
- `return_source.mode` is `entered` or `series`. For cash-like exposures it is `series`, and `series` names the `data/series/` ID (A-20 to A-24).
- `one_line_he` (optional) is the one Hebrew line on what the money is invested in, shown under the page's h1 and on the guide list.
- `constituents_israeli` (optional boolean, S5): `true` when the index is made of Israeli companies (TA-35, TA-90, TA-125), `false` when it is not (S&P 500, NASDAQ-100, MSCI World, MSCI ACWI). Left out for the cash and bond exposures and the general track, where the question has no meaning. The indices page reads it to decide which ways of owning the index exist (an Israeli index has only Israeli funds).
- `other_currencies` (optional boolean): `true` when the index holds shares priced in currencies other than `currency` (MSCI World and ACWI: 23 or 47 countries, ETF-48). A fund that neutralises `currency` keeps the others, against it; the labels say so. Left out for a one-currency index.
- `us_dividends` (optional, F-107): the index's US shares, as an Irish fund that holds them meets them. `yield` is a value object, the dividend yield of those shares in `pct_per_year`; `weight` (optional value object, `pct`) is their share of the index, left out when the index is made of US companies only. Both come from the index provider's own factsheet: the S&P 500's, or MSCI USA's yield with the country weights of MSCI World or ACWI. Left out where the provider prints no dividend yield (NASDAQ-100). The engine counts F-107 from it for an Irish fund that holds the shares (A-11).
- `variants` lists the funds that have a `data/funds/` record; a `fund:<id>` entry must be the `id` of a record under `data/funds/` (validator). It is not the candidate set: for Israeli funds and foreign funds traded on TASE the workbench takes every fund in the latest list in `data/fund-lists/` that matches the exposure (§3.14, method F-65, product D17), and a fund with no record here is shown as not evaluated.

### 3.5 `data/funds/` — hand-collected fund details (dependency 6, N4)

One record per fund whose details have been collected. The set of Israeli funds and of foreign funds traded on TASE that the workbench chooses from is `data/fund-lists/` (§3.14); foreign-domiciled funds traded abroad exist only here, because no complete list of them was found (method G-29).

```json
{
  "id": "ie00b5bmr087",
  "names": { "en": ["iShares Core S&P 500 UCITS ETF USD (Acc)"], "he": [], "tase": ["01159250"] },
  "identifiers": { "isin": "IE00B5BMR087", "tase_number": "1159250", "cusip": null, "ticker": { "LSE": "CSPX", "TASE": "..." } },
  "manager": "BlackRock", "domicile": "IE", "legal_form": "UCITS",
  "exposure_id": "index-sp500",
  "currency": "USD", "trading_currency_on_tase": "NIS",
  "distribution_policy": "accumulating",
  "tax_status": { "il_fund_tax_track": null, "tase_foreign_fund_90pct_test": { "value": true, "rule_ids": ["TXF-04"], "...": "value object" } },
  "fees": {
    "fixed_management": { "value": 0.07, "unit": "pct_per_year", "source": { "...": "prospectus or factsheet" }, "...": "value object" },
    "trustee": null, "variable_management": null,
    "tracking_difference_12m": { "value": null, "unit": "pct_per_year", "...": "value object" },
    "median_spread": { "value": null, "unit": "pct_of_trade", "...": "value object" },
    "fund_level_withholding_drag": null
  },
  "dimensions": { "foreign-withholding-domicile": "covered", "tax-during": "blocked:TXF-OQ1", "estate-situs": "covered:TXF-27" },
  "prospectus": { "url": "...", "date": "2025-..." },
  "snapshot": "2026-10-22"
}
```

- **Schema.** `fundRecord` (strict). `id` is lowercase ASCII, digits and hyphens, without a prefix; an exposure's `variants` names the record as `fund:<id>`, and the file is `funds/<id>@<snapshot>.json`. `distribution_policy` is `accumulating`, `distributing` or `null`; `tax_status.il_fund_tax_track` is `exempt`, `taxable` or `null`; `tax_status.tase_foreign_fund_90pct_test` is a value object or `null`; `trading_currency_on_tase` and `prospectus.date` may be `null`. `dimensions` marks use the wrapper format (`covered`, `blocked:<OQ>`).
- **Fees.** Each entry of `fees` is a value object, `null`, or left out. On a fund whose `domicile` is not `IL`, `fees.variable_management` and `fees.trustee` hold `null`: the fund does not have these lines, because they belong to Israeli fund law (ETF-14, MF-20), which does not apply to it (ETF-71). The site writes "אין". On any other field, or on an Israeli fund, a missing fee is not collected, and a value object with `value: null` always is; the site writes "לא נאסף".
- **Withholding** (`fees.fund_level_withholding_drag`, A-11): the tax withheld inside the fund, in `pct_per_year`, where a document of the fund gives it; it replaces F-107. Left null, an Irish fund that holds its index's shares takes F-107 from its exposure's `us_dividends`.
- **The load** (`fees.load`, optional, MF-21): the load on purchase (הוספה) as a value object in `pct_of_trade`, from the fund's own document, with the page in `source.url` (`#page=`) and the document's words in `source.title`; `update_rule` is `provider-set`, `rule_ids` holds `MF-21`. `0` means a document was read and says zero; left out means not read, so a missing value is never shown as zero. ETFs and foreign funds leave it out: they print no such line. It stands apart from `creation_redemption_fee_category`, a different cost paid by a different person, and from a distributor's commission, which is a tariff line. The reports state the load as a share of the unit price (`ממחיר היחידה`); `pct_of_trade` is the nearest unit. A load above zero fails the validator (§4 item 15) because the page does not price one yet. The redemption deduction (MF-22) has not been read and has no field.
- **Distribution** (`distribution`, optional, A-10): `{ yield, per_year }`. `yield` is a value object in `pct_per_year` from the fund's own factsheet or the manager's page, with the document's words and date in `source.title` and `effective_from` the date the figure is as of; `update_rule` is `provider-set`. `per_year` is the payments a year the same source prints (1, 2, 3, 4, 6 or 12). The validator fails it on a fund that does not distribute. Left out, not estimated, when it was not read: a distributing fund without it has no price.
- **How the fund is built** (S4), three optional fields, all left out when the record does not say:
  - `replication: { method, source }`: how the fund follows its index. `method` is `physical` (holds the index securities), `swap` (unfunded swaps on the index), `futures` (futures on the index) or `mixed` (more than one of these as co-equal parts, for example swaps and futures, or the securities plus synthetic options). `source` is `{ url, page?, checked }`: the document that says so (the annual report or the factsheet), the PDF page that says it (never a printed page), and the date it was read. The Israeli records carry it from the sentence after `REPLICATION:` in `legal_form`; the iShares record from its factsheet ('Methodology: Physical Replication').
  - `hedged` (boolean): `true` when the fund's name or its Maya record says the currency is neutralised (מנוטרלת מט"ח / דולר, currency-hedged). Left out, not `false`, when the record does not say.
  - `share_price`: a value object in a currency unit (`usd`, `nis`, `eur`) with its own source and date: the price of one unit, which a per-share commission (`usd_per_share`) and buying in whole units (F-109, D94) need. It is the issuer's own figure, from its page for the fund (the NAV per share it prints, `effective_from` the day it is as of); a market price is not collected. A Tel Aviv line of a foreign fund takes its issuer's NAV of the same share class, in the class's currency, where the line's own Israeli document names that share class (its ISIN); the run converts it at its own rate. Never a price from TASE or Maya, whose terms forbid republishing it: the data check refuses a source on their hosts. An Israeli ETF without one is priced by amount and its row says the unit price was not collected.
- **Tracking record** (`tracking_record`, optional, F-92): `{ years: [{ year, fund_pct, tracking_pct, fees_charged? }], years_printed, source, page, fees_page?, changes_page?, variable_rate_since?, variable_positive_only?, checked }`, the fund's return and its tracking asset's in each full calendar year its report prints, in percent, from the report named in `source` (the same document as `fees.tracking_difference_12m`; `page` is the PDF page when the notes name it, else null). `fees_charged` is `{ fixed, variable, trustee }`, the fees charged that year in percent of average net assets as the same report's table "הוצאות שנפרעו מנכסי הקרן" prints them on `fees_page` (2026-11-07, F-92 (b)): each figure as printed, a cell printed "-" or "* שיעור זניח" and a row the table does not print recorded as 0, the variable fee negative where the table prints it so. Every year of an Israeli record carries it; a foreign record leaves it out, its document printing no yearly table. An Israeli record with `fees_page` also names `changes_page`, the page of the same report's table "שינויים במאפייני הקרן", and `variable_rate_since`, the day today's listed variable management fee came into force as that table prints it, or null when it prints no change of the variable fee in its years or after them (2026-11-07, pass 6, F-92 (b): the years charged at today's rate give the variable fee counted forward). `variable_positive_only: true` marks a report whose footnote says its table leaves out the negative variable fees ("נתון זה לא מקבל ביטוי בטבלה"); no net figure is estimated. A part year is left out, and a fund with no full year has no field. `years_printed` lists, oldest first, every full calendar year the returns table on `page` prints, and `years` holds exactly those (§4 item 17): an Israeli annual report prints the last three or four calendar years and the current part year, a factsheet up to ten. A foreign fund's record takes its figures from the issuer's own factsheet, key investor information or fund page (2026-11-07), in its own currency; a foreign record without the field has not had them collected, which says nothing about its age, so the page tells the two apart by domicile. `benchmark` (required on every record that has the field, Israeli and foreign alike) is `{ name, dividends, source?, page?, rule_ids? }`: the benchmark's name as the document prints it (an Israeli fund's tracking asset as Maya's fund page names it), and `dividends` `net` (the index counts dividends after the tax withheld at source), `gross` (before it) or `unstated` (no official document says), by the fund's own binding documents (its prospectus, Israeli annex or annual report, whose line "אופן חישוב המדד" says NTR or GTR), TASE's own name for the tracking asset ("... - NTR"), TASE's own page for a Tel Aviv index ("אופן חישוב המדד: תשואה כוללת ברוטו (GTR)", the page the fund's annual report links to; `rule_ids` then names the rule that records it: ETF-42 for TA-125, ETF-44 for TA-35, ETF-45 for TA-90), or the issuer's own factsheet line naming the net index as the benchmark ("MSCI World Index (Net)", "S&P 500 Net Total Return"), its statement about its own product (F-92 (d)); `page` is the PDF page that says so, and `source` the document when it is not the one in `source`. A `net` record shows a gap and takes A-07 from its years; a `gross` one does only on TA-35, TA-90 or TA-125, for an exempt Israeli fund, when every fund on its index measures against a gross series too (F-92 (d)). The values are the report's own figures; the gap and A-07 are computed (F-92), never stored.
- **Tax ruling** (`tax_ruling`, optional, TXF-11): `{ ruling_date, source, pages: { ruling, sale, distribution }, quote, checked }`, on a foreign fund whose own Israeli prospectus annex reports a Tax Authority ruling given to it and names a sale and a distribution as the only taxed events. `source` is the annex; `pages` are its PDF pages; `quote` is the annex's own sentence on the ruling. The founder judged it enough for that fund (D10): an accumulating fund that carries it is ranked rather than listed under G-18. A record of the same ISIN bought abroad carries it too, since the units are the same.
- **Israeli funds** (Maya export, CAT-34, TXS-24) add `il_fund_tax_track` (`exempt` or `taxable`, MF/TXS), the exposure code (MF-54, field `exposure_code`), `distribution_fee_type` (MF-24) and `creation_redemption_fee_category` (ETF-05); the last three are optional strings (or `null`).

### 3.6 `data/fees/` — provider tariffs, dated snapshots (dependency 5)

One file per provider per snapshot: `fees/<provider-id>@<date>.json`. The schema is `feesSnapshot` (strict).

```json
{
  "id": "leumi",
  "provider": { "name_he": "בנק לאומי", "class": "bank", "regulator": "BoI", "tase_member": true, "protection_rule_ids": ["BRK-10", "BRK-13"] },
  "tariff": { "url": "...", "title": "תעריפון מלא, חלק 4", "published": "2026-10-01", "format": "pdf" },
  "snapshot": "2026-10-22",
  "missing": false,
  "missing_reason": null,
  "lines": [
    {
      "id": "leumi-buy-sell-tase",
      "base": "trade",
      "applies_to": ["tase_shares_bonds"],
      "level": "list",
      "rate": { "value": 0.5, "unit": "pct_of_trade", "...": "value object" },
      "min": { "value": 25, "unit": "nis_per_trade", "...": "value object" },
      "max": null,
      "period": null,
      "channel": "direct",
      "band": null,
      "statement_code": null,
      "names": { "tariff": ["קנייה, מכירה ופדיון של ניירות ערך הנסחרים בבורסה"] }
    },
    {
      "id": "leumi-custody-israel",
      "base": "custody", "applies_to": ["tase_shares_bonds", "etf_units", "mutual_fund_units"],
      "excludes": ["makam", "money_market_units"], "excludes_rule_ids": ["BRK-17", "BANK-18"],
      "level": "list",
      "rate": { "value": 0.15, "unit": "pct_of_balance_per_period", "...": "value object" },
      "period": "quarter", "min": { "...": "value object" }, "max": { "...": "value object" }
    },
    {
      "id": "leumi-fx-conversion", "base": "fx", "applies_to": ["all"], "level": "list",
      "rate": { "...": "value object" }, "spread": { "value": null, "notes": "FXD OQ2: spread not published" }
    }
  ],
  "averages": [
    { "line_id": "leumi-buy-sell-tase", "level": "regulator_average", "band": "100k-200k",
      "rate": { "value": 0.21, "unit": "pct_of_trade", "source": { "url": "https://edge.boi.org.il/...FEES_DASH", "publisher": "Bank of Israel", "strength": "primary" }, "checked": "2026-10-22", "effective_from": "2026-04-01", "effective_to": "2026-06-30", "rule_ids": ["BRK-26"] } },
    { "line_id": "leumi-buy-sell-tase", "level": "tase_average", "band": "100k-200k", "rate": { "...": "TASE s.45טז calculator, BRK-33" } }
  ],
  "minimums": { "account_opening": null },
  "notice_rule_ids": ["BRK-21"]
}
```

**The provider and the document.**

- `provider.class` and `provider.regulator` take the values of §2. For a foreign broker (S1), `class: foreign_broker` and `regulator: foreign` go together; the validator fails one without the other. `provider.regulator_foreign: { name, name_he, country }` is required exactly when `regulator` is `foreign` and names the supervisor (for Interactive Israel, CySEC in Cyprus).
- `provider.israeli_tax_service` (optional, BRK-36): `true` on a foreign broker whose own terms offer a service that withholds Israeli tax.
- **A house within another** (D43). `provider.part_of` names the house whose price list holds this record's prices (PEPPER: `leumi`, whose price list has a PEPPER annex; its prices stand as a group of Leumi). The record stays as read; the indices page lists no house with `part_of`. The data check holds it to another house with a record under `data/fees/`.
- `tariff.title` is the document's name as its publisher writes it ("תעריפון יחיד/עסק קטן - בנק דיסקונט לישראל"): the site shows it as the source's name on every figure from the record. How the document was read (its parts, pages and dates per part, files read alongside, file metadata, links, what was blocked) goes in the optional `tariff.notes`, which the site does not show. A figure's `source.title` is the document's name and its section, without such notes. The data check fails a tariff title with a link, process words or more than 100 characters. `tariff.published` may be `null`; `tariff.format` is `pdf`, `html` or `xlsx`. Where `published` is `null` on a collected record, `tariff.printed` says what the document prints instead, so the page says what is known rather than only that a date is missing (2026-11-07): `{ "kind": "part", "part_he", "date", "as_printed" }` for a document that dates each part and not the whole (the part the site reads, named as the site shows it, "חלק ניירות הערך"; `date` is the printed date, `null` where the print is no real date, such as "06/02/20217", and the data check compares it with `as_printed`); `{ "kind": "version", "version": "04/2026" }` for a version printed in place of a date; `{ "kind": "none" }` for nothing printed. The data check asks for it on every latest record that has no `published` and is not `missing`, and refuses it beside a `published` date. The site writes the line with the kit's `TariffDate`: "תעריפון מ־{date}", "חלק ניירות הערך מ־{date}", "חלק ניירות הערך מ־06/02/20217 (כך במקור)", "תעריפון גרסת 04/2026" or "בלי תאריך מודפס" (under a heading that already names the price list, `titled`: "מתאריך {date}", "גרסת 04/2026"), the misprint and the empty forms followed by "נאסף ב־" and the day the record was checked (`snapshot`) where the page shows no other day.
- A provider whose tariff could not be obtained has `missing: true` and `missing_reason` (for example "PDF not located"), and no `lines`; the workbench shows the row as "not comparable, data missing". The optional `missing_reason_he` is the reason in Hebrew, for the page, where the plain "not collected" would be untrue.

**Lines.**

- `applies_to` lists security types (§2) or wrapper IDs; `all` is every one. A bonds-only line uses `applies_to: ["tase_bonds"]`.
- `level` is `list`, `regulator_average` or `tase_average` (D4). A fourth level, `entered`, is never stored under `data/`; it lives in saved state with the same shape.
- `period` is `month`, `quarter`, `year` or `null`.
- A line's `band` is the tariff's own text for a plan or sub-class; `band: null` is the standard line, which F-63 prefers, and a plan line is read only when the person names the plan.
- A banded line the price list prints but the house's own documents do not show an ordinary customer can use for the holdings it names (a standing order limited to a list of funds the house does not publish, or one no document says where to set up) carries `not_ranked: { reason_he, source: { url, title, checked, page?, quote } }` (D41, D56): `reason_he` says why in the reader's words (at most 240 characters), `source` is the document whose words, or silence, it rests on. The ranked price never reads the line: the standard line prices those orders, and the indices page shows the line beside the house's row with `reason_he`; the company pages show it as printed. The data check refuses it on a standard line (`band: null`).
- **By amount** (`by_amount`, optional; F-109, D94): `[{ venue, orders, list_only, shares_only?, source: { url, title, checked, page?, quote }, note? }]`, the listings abroad (`us`, `europe`, as `venueOfBand` tells them apart) the house's own document says it sells by amount: an order in money, or in fractions of a unit. `orders` is `all`, or `recurring_plan` for the monthly purchases of its recurring plan only (the purchases its recurring-plan conversion line prices, F-13). `list_only: true` marks a document that limits it to a list of securities the house does not publish and that names none of the site's funds: the entry is kept, and changes nothing (D42). `shares_only: true` marks words that name shares and no exchange-traded fund, where the house's own records name funds when they mean them ("מניות ו-ETF'S"): for a fund that is silence (D56), and the entry is kept for its reason and changes nothing. `quote` is the document's words, which must name fractions ("שבר") or an order by sum ("סכום"). A listing with no entry, and every listing on TASE, is bought in whole units (silence is not a yes, D56). The data check holds one entry to a listing, a recurring-plan entry to a record that prints a recurring-plan conversion line, and an entry to a record that prices funds bought abroad.
- A line with `band` `פדיון` (F-24) prices a redemption of makam: `applies_to: ["makam"]`, `channel: null`, the tariff's line that names redemption; a house whose document does not name it has no such line and pays nothing at redemption. It is not an order's line, so F-63 never picks it for a buy or a sale.
- A conversion line printed for one currency carries `conversion_currency` (ISO code): it prices a fund in that currency, and a line without one prices the others (F-13).
- A line takes an optional `cap` value object (unit `pct_of_trade`, S2): a ceiling as a share of the trade value. Commission = min(cap x trade value, max(`min`, `rate` x base)); a cap below the minimum wins. A per-share line has `rate` in `usd_per_share` and `min` and `max` in `usd_per_trade` (or `gbp_per_trade`).
- A line takes an optional `flat_up_to: { amount, up_to }`, two value objects: an order up to `up_to` pays `amount`; a larger order pays the line's rate, minimum and maximum. On a conversion line (`base: fx`, F-13) the two sums are in the same currency as the line's minimum and maximum (dollars at the banks) and the flat price is below the minimum; the data check holds both (`checkFlatPrices`).
- Provident and pension managers use the same file with `base: deposit`, `base: balance`, `base: direct_expenses` lines per track (`track_id` = CMA fund number), the discount period (`discount_months`, A-19) and the list fee the discount reverts to (`reverts_to`). A list rate printed below the most the binding documents allow carries `reverts_to` (that most) and `discount_months` (`value: null` when no period is printed; the run then uses PF-13's five years). A printed rate made conditional on a document that is not published carries `offer_he`, the document's own words for the condition: it is an offer (D56), shown with those words and priced at `reverts_to` from the start; the data check fails `offer_he` without `reverts_to`.
- Non-bank extra lines (BRK-24) use `fixed_period` (monthly fee), `distribution_handling`, `spread`.
- A `corporate_event` line (unit `usd_per_event`, `applies_to: ["foreign_securities"]`) is a charge for each corporate event of a security held abroad; F-103 reads it as a charge on each dividend of a fund bought abroad that pays dividends, and an accumulating fund pays none (D67).
- **The place of a value.** A value's `source` may also carry its exact place, both optional: `page`, the file's own page of a PDF (the document library's count, not the number printed on the sheet), and `quote`, the document's own words that carry the value, at most 240 characters. A web page has only `quote`. A value gets them only when its own line was read on that page; no `page` means not yet confirmed, not absent from the document. The same two fields may sit on an `availability` entry's `source`. They are read by nothing on the site yet.
- `current_account: { monthly_minimum }` (D64): what a current account at the bank costs an ordinary customer a month, the price list's monthly minimum as a value object in `nis_per_month`, with its quote (and its page in a PDF) as "the place of a value" above says. Where the minimum is "not above the price of one teller action", the quote is either the line that prints the price or the clause, and the notes quote the other. The data check requires a quote on a minimum above 0; a free account read only in a browser (One Zero) may have none, and its notes say how it was read. A bank's latest record must carry it; a house that is not a bank, or that is part of another (`part_of`), must not. F-102 counts it on the bank's row on the indices page unless the person marks that bank as their own. A group entry may carry its own price for it, `groups.entries[].current_account: { price_he, exempt: true, for_months, source }`, only where the group's annex prints the minimum itself free: the data check holds `for_months` to the entry's printed end, the words and quote to "פטור" and the quote to the minimum ("מינימום"), and the record must price a current account (F-102, F-101). An exemption read from other rows (a free teller action under a minimum bounded by its price) is not recorded: the group pays the ordinary minimum, the most the documents allow (D56, D64).
- `averages[]` holds `{ line_id, level, band, rate }`, `level` being `regulator_average` or `tase_average`. `minimums.account_opening` is a value object or `null`.

**What can be bought there** (S3). The snapshot takes an optional `availability: [{ applies_to, available, source: { url, title, checked, page?, quote? }, note?, reason_he?, rule_ids? }]`. `rule_ids` (optional) names the rules of the rule base that hold the entry's fact; the house's row on the indices page opens their cards from its words ("לא אפשרי שם", "לא ברור אם אפשר שם"), and it changes no price. `applies_to` lists instrument classes (the security types of §2, `all` included), and a class appears in at most one entry. `available: false` is a sourced statement that a private client cannot buy that class there (Interactive Israel and TASE securities: 'ללקוחות מוסדיים בלבד'); `true` is a sourced statement that it can. With no entry for a class, availability is derived: it is available when a trade line applies. A class the source does not settle gets no entry, or an `"unknown"` entry where its row should say why (next paragraph); "not found" is never "not available".

**Who pays, what it covers, what was left out.** `available` may also be `"unknown"`, with `reason_he` for the row: the documents leave it open, so the kind of holding is not priced. A bank's or broker's record must carry `price_for_he` (who pays) and `left_out` (`[{ what, page?, why, why_he?, could_change_price? }]`, empty when nothing was found; `why_he` is the reason in plain Hebrew for the reader, and `could_change_price` marks what can make a reader's real price differ from the one shown, which a page says beside the house's price), and every kind of holding it prices needs an `availability` entry; an entry with `available: true` quotes the document's words naming that kind. `npm run validate` fails otherwise, and the ranking drops any kind of holding without such an entry.

**By phone only** (2026-11-08). An entry with `available: true` may carry `phone_only: { venues?, source: { url, title, checked, page?, quote }, note? }`: the house says that kind can be bought there only by phone, through its trading desk, and `quote` is the house's own words saying so (it must say "טלפון" or "טלפוני"). `venues` (`us`, `europe`) narrows it to a fund bought on those exchanges, read from the trade line that prices the fund (`venueOfBand`), and only an entry for `foreign_securities` alone may carry it. It changes no price and no ranking: the site shows a small tag "בטלפון בלבד" beside the house, which opens this source, and one line on the chosen pair's card. A house's written answer is cited at `docs/company-answers.md#<company>-<date>` (below).

**Proposed, not in the schema: the funds a house may sell** (2026-11-14, BRK-38). Some houses sell an Israeli fund only where its manager has a distribution agreement with them (One Zero: "אשר הבנק התקשר בהסכמי הפצה בגינם", information/5683). The manager reports each agreement on Maya as event 5307 "התקשרות בהסכם הפצה", listing every fund it covers with its fund number, and an end as event 5308 "סיום התקשרות מנהל עם מפיץ". A new kind of fact, so a field of its own rather than a note:

- On the snapshot, `distribution_agreements: { searched, reports }`, read by the availability of `mutual_fund_units` (and of `etf_units` if a rule says an agreement makes an Israeli ETF buyable there).
- `searched: { url, words, checked, result }`: the search that found the reports (its link, the event ids and words, the count), so "no report" is a sourced statement and not a gap.
- `reports: [{ url, manager, published, agreement_date, ends?, funds: [fund_number] }]`: `url` is the report's page `https://maya.tase.co.il/he/reports/funds/<id>`; `ends` is the event-5308 report that ends it; `funds` holds only the fund numbers of records under `data/funds/` that the report names, each checked against the report's own list.
- A fund is available there when a report that has not ended names it; a fund in `data/funds/` that no report names is `unknown`, with a reason, never `false`: an agreement can come later, and a fund launched after an agreement is not in its list.
- Why only the funds of `data/funds/`: the reports are on TASE's Maya, whose terms forbid publishing a database built from it (CAT-43), so the repository keeps the facts the site uses, each with its link, and not the whole list. The full list, read on 2026-11-14, is in the private folder.

**A company's written answer.** A value may cite a company's written answer, or a document it sent on request that has no public copy, at `docs/company-answers.md#<company>-<date>`: that section holds the answer in the company's words with its date, and the words of the document with its version and pages, never the name or money of whoever asked (`guidelines/research.md`, "Privacy"). The site opens it at the file's public page in the repository. The document itself is filed in the document library, not in the repository.

**Group prices** (D43). A bank's or broker's snapshot must carry `groups: { state, note, read: [{ url, title, read_in? }], entries }`.

- `state` is `prices`, `none_on_securities` (a group annex with no securities row), `no_mention` (what was read names no group) or `not_read`. `read_in` (optional) is `chrome`: the document was read in Chrome.
- An entry is `{ kind, name_he, who_he, who_source, ends_printed, ends_he, ends_source?, prices, inferred?, who_short_he, cheaper_he, ends_short_he }`. `kind` is `young`, `soldier`, `released`, `student`, `salary` (a lower price for those who move their salary to the bank or hold a portfolio there) or `other`. A price is `{ fee, price_he, holdings_he, names_fund, source, value? }`, `fee` being `trade_israel`, `trade_abroad`, `custody_israel` or `custody_abroad`; a source is `{ url, title, page?, row?, quote }`. `holdings_he` is the document's words, and `names_fund` must agree with them; words after "למעט" take funds out of `names_fund`.
- **The sub-row.** The three short fields are the sub-row under the house's row on the indices page (who, what is cheaper, until when; at most 48, 80 and 40 characters) and restate the long words with no new fact. On the latest record the data check requires them, and holds:
  - every number in `who_short_he` to `name_he` and `who_he`, and every number in `ends_short_he` to `ends_he`;
  - every number in `cheaper_he` to the entry's prices, except an ordinary price after "במקום", which must be a rate on a line of the same fee (the fee named by the last fee word before it) and above the group's; "פטור" only where a price says it;
  - the same words for entries with the same prices (they are one sub-row), and the same fees for entries that share words;
  - an `other` entry's `who_short_he` not opening with the article (the line above the sub-rows puts "ל" before it).
- **A price's numbers** (F-101). A price may carry `value`, the numbers its words state and nothing more:
  - exactly one of `exempt: true` ("פטור", "0 עמלה"), `discount_pct` off the house's own price for the same fee (with `not_below_pct` where the words floor it), `rate_pct` with `per` (`trade` for a trade fee; `month`, `quarter` or `year` for custody), `flat` for each operation (with `flat_up_to` where the words limit the order's size) or `per_share_cents`;
  - `min` and `max` where the words print a bound (a custody `max` is the one per security); an exempt price has no bounds;
  - `currency` (`ILS` or `USD`) whenever there is an amount;
  - `side` (`buy` or `sell`, a trade fee only) only where the words name a purchase only or a sale only (Mercantile Top's and Deluxe's "עמלת קניה בחו\"ל"), absent for both, and the other side keeps the house's price;
  - `for_months`, how long the price holds from joining, where the price's words say so or its entry prints a plain period from joining as its end (`ends_printed`).

  A bound the words do not print is left out and the house's own stays (silence is not zero). A price whose words give two prices, tiers, a condition on the balance or on the number of orders, or an extra fee they do not size has no `value`: the words alone stand. The data check holds every number of `value` to the price's words or its quote, the period and the currency to the words, `exempt` to a word of the price, `side` to the purchase or sale the words name alone, and `for_months` to the months the words say. A price that rests on advertising (a joining offer outside the binding price list) or on a condition on the number of orders has no `value` (Altshuler Trade's joining offer, PEPPER's "עד 30 פעולות בחודש", Excellence's 40 purchases).
- A price whose `names_fund` is false is not applied by the site to a fund unless the person adopts it as their own value (D42). Only an account the person builds on a house reads `value` (F-101, `site/app/lib/own-account.ts`); the rest of the group data is read by no calculation.

**Advertising against the binding documents** (D57). A snapshot may carry `advertising: [{ fee, verdict, claim_he, claim_source: { url, title, seen }, binding_he?, binding_source: { kind, url, title, page?, row?, dated, dated_from, checked } }]`, one entry per claim the house's own advertising makes about a fee the indices page counts (`fee`: `custody`, `account` for a handling, usage or periodic fee, `trade`, `conversion`, `standing_order`).

- `verdict` is `contradicted` (a binding document prints the fee the advert says is not charged), `offer` (the advert reads as for everyone; the binding terms give it to some customers, for a time, or let the house withdraw it) or `not_found` (no binding document says it).
- `claim_he` (at most 240 characters) and `binding_he` (at most 400) are the documents' own words; fragments of one place are joined with " … ".
- `binding_source.kind` is `price_list`, `account_terms`, `fee_annex` or `promotion_terms`; `dated` is the document's own date, printed (`dated_from: printed`) or, when it prints none, the file's (`file`).
- The data check fails a `contradicted` or `offer` entry without `binding_he`, a `not_found` entry with it, a binding source that is the advert's own page, a `price_list` that is not a document the record's tariff or lines cite, any other kind on another site than the house's tariff, and a date after the day it was checked.
- A guarantee is not a finding, and offers for one profession, employer, age group or community stay under `groups`. The house's page shows the entries; the calculation reads none of them.

### 3.7 `data/terms/deposits/` — deposit and savings-plan product terms (BANK, BPN)

One file per bank per product per snapshot. The folder `terms/deposits/` is matched before `terms/`.

```json
{
  "id": "discount-pikadon-shavui",
  "bank": "discount",
  "names": { "447": ["פיקדון שבועי"], "app": [], "ad": [], "abbrev": ["פז\"ק"] },
  "type_447": "פיקדון שבועי",
  "wrapper_id": "bank-deposit",
  "term_months": { "value": 0.25, "unit": "months", "...": "value object" },
  "term_days": "optional: value object in days, the term as the table prints it in days",
  "rate_type": "variable",
  "anchor": "prime", "spread": { "value": -1.5, "unit": "pct_per_year", "...": "value object" },
  "rate_offered": { "value": 3.25, "unit": "pct_per_year", "notes": "nominal annual, before tax (BANK-13)", "...": "value object" },
  "rate_effective": "optional: value object, the bank's own one-figure rate where rate_offered is not one number",
  "interest_calc": "optional: { \"effective_annual\": value object in pct_per_year, \"periods_per_year\": value object in count }, either or both",
  "linkage": "none",
  "tax_bucket": { "value": "unlinked_15", "rule_ids": ["TXI-03", "TXI-04"], "...": "value object" },
  "amount_range": { "min": { "...": "value object" }, "max": null, "min_edge": "optional: \"excluded\" | \"unknown\"", "max_edge": "optional, likewise" },
  "break": { "allowed": true, "penalty": "with_penalty", "mechanism_text": "..." , "rule_ids": ["BANK-06", "BANK-14"] },
  "exit_points": { "exists": false, "every_months": null, "first_after_months": "number or null where exit points exist; otherwise absent or null" },
  "auto_renew": { "value": true, "max_renewals": null },
  "balance_conditions": "optional, a current account: [{ \"measure\": \"daily_balance\" | \"average_balance\" | \"total_assets\", \"bound\": \"min\" | \"max\", \"inclusive\": true, \"value\": value object in nis }]",
  "conditions_he": "optional: a short plain-Hebrew summary of the conditions the bank prints for the rate",
  "variant": "optional: [\"campaign\" | \"closed_system\" | \"new_customers\" | \"interest_during_term\" | \"best_of\"], absent on a plain deposit",
  "doubt_he": "optional: one sentence on an open doubt about the record",
  "snapshot": "2026-10-22",
  "source": { "url": "...", "title": "Discount 447 concentrated publication", "publisher": "Discount Bank", "strength": "institution" }
}
```

- The schema is `depositTerms` (strict). Enums: `rate_type` is `fixed` or `variable`; `linkage` is `none`, `cpi` or `fx`; `break.penalty` is `none`, `with_penalty` or `not_allowed`, and `break.allowed` is false exactly when `break.penalty` is `not_allowed` (the schema fails a record where they disagree). `anchor` and `spread` are `null` or absent for a fixed rate. `exit_points.every_months` and `auto_renew.max_renewals` are numbers or `null`. `exit_points.every_months` is the interval between exit points, as the bank prints how often they come; `exit_points.first_after_months` (added 2026-11-12) is the months from the deposit's start to its first exit point, as the bank prints it ("בתום 6 חודשים, וכל 3 חודשים לאחר מכן" is 6 and 3), a week being 0.25. A record with exit points always carries the key: it is `null` where the bank prints only how often they come, and the first exit point is then not known and is never taken to fall one interval after the start; the key left out would be a record nobody read for it, and the schema fails that. A record without exit points leaves it out or `null`, and its `every_months` is `null`. Both figures are above zero, and the first falls inside the term (`packages/schema/test/deposit-exit-points.test.ts`).
- `tax_bucket.value` (an enum, `taxBucket` in the schema) says which tax the deposit's interest bears: `unlinked_15`, 15% fixed on the whole nominal interest (TXI-03), for any deposit not fully linked to the index, a prime-linked one included (TXI-04); `linked_25`, a deposit fully linked to the consumer price index: the linkage is exempt and the interest above it is taxed at up to 25% (TXI-02, TXI-05), at a lower bracket from age 60 (TXI-19). It is `null` with `source.strength` `open` while no rule covers the deposit (a best-of deposit, BPN-09); the page then shows the open question with its lock, never a rate. The engine reads no `tax_bucket` today.
- `conditions_he` (optional, plain Hebrew) summarises the conditions the bank prints for the rate (who gets it, on what balance, how often it is paid); it is faithful to the printed text quoted in the notes of `rate_offered` and adds nothing that is not printed. A bank that pays nothing gets the sentence it prints ("לא מוצעת ריבית…").
- `variant` (optional, added 2026-11-06) says what sets a deposit apart from the bank's plain deposit of its term and kind, from the bank's own table or terms: `campaign` (the bank calls it a campaign product), `closed_system` (a deposit through a closed-system account: the money comes only from and returns only to the person's account at another bank, BANK-21; who may open one is the bank's own term), `new_customers` (only people who join the bank may open it, until a date the bank prints, which `conditions_he` says), `interest_during_term` (interest paid during the term, not at its end), `best_of` (a choice at the end between two returns). It is absent on a plain deposit; exit points and linkage have their own fields. F-86 reads one plain deposit per bank by it.
- `rate_effective` (optional, a value object in `pct_per_year`) is the rate the bank prints in a column of its own beside the offered rate ("ריבית אפקטיבית" in Mizrahi-Tefahot's table), recorded only where `rate_offered` is not one number because the table prints a rate for each period between exit points. A page shows it, as the bank's figure, where it would show `rate_offered`; the engine does not read it. The bank defines the column only in some product terms (an average rate where the rate is not uniform over the term), so the record's `doubt_he` says what the figure is.
- `doubt_he` (optional, plain Hebrew) is one sentence on an open doubt the researcher found (the printed rate and its conditions disagree, a stated end date has passed); the page shows it beside the figure with the caution mark, and the doubt stays out of the rate itself.
- `amount_range.min_edge` and `amount_range.max_edge` (optional) say how the amount at a bound stands (F-108). Absent, the bound is in the range, as "מ־X" and "עד X" read. `excluded`: the bank's table prints the bound as not included (Mizrahi-Tefahot heads its amount column "טווח סכום להפקדה (לא כולל)"; Yahav prints "מעל 25,000"). `unknown`: two amount tiers of one product print the same figure, each as its own ("1,000 עד 50,000" beside "50,000 עד 100,000", or "500,000 ומעלה"), so which rate that amount gets is not in the source; the amount is then unknown at both tiers. Set only on a bound that is a number; the schema fails one set on a bound with no number or on no maximum.
- `term_days` (optional, a value object in `days`) is the term as the bank's table prints it in days beside the term ("פיקדון ל-3 חודשים (90 יום)", Mercantile's "30 יום"), its notes quoting it. F-21 counts a term under a year by these days; a range of days ("30-59 יום") is no term and is not recorded.
- `interest_calc` (optional) says how the product calculates interest, where the bank prints it (BANK-50: the disclosure rules' Schedule A leaves `m`, the times a year interest is calculated, to each product; BANK OQ21 where unread). `effective_annual` is the effective annual rate the bank prints beside the nominal one ("ריבית מתואמת"; Mizrahi-Tefahot's column "ריבית אפקטיבית", recorded where its table prints one figure in every tier of the row), in `pct_per_year`; `periods_per_year` is the times a year the bank's words say interest is calculated or credited ("בריבית דריבית חודשית" is 12, a current account's "בכל סוף רבעון" 4), in `count`. Each value's notes quote the record. F-21 reads it for a term over a year (with neither, the term's interest is not known), F-26 for a current account's crediting. The schema fails an `interest_calc` with neither.
- `balance_conditions` (optional, a current account) holds the bank's printed conditions on the balance itself, each `{ measure, bound, inclusive, value }`: `measure` is `daily_balance` (the balance on every day of the month), `average_balance` (the month's average balance) or `total_assets` (everything the customer holds in the account: the current account, securities, deposits); `bound` is `min` or `max`; `inclusive` is false where the bank prints "below" or "above" rather than "up to" or "and more"; `value` is a value object in `nis` whose notes quote the bank's words. F-26 tests the balance against them. A condition that is not a figure on a balance (a salary, card spending, a tariff track) stays in `conditions_he` only.
- **The current account.** A current-account record with `amount_range.max` is read as the balance that earns the rate (BANK-09, F-26). The page of the current account reads every `wrapper_id: "current-account"` record: the most common `rate_offered` among them is the default (F-85).

### 3.8 `data/series/` — sourced time series (dependency 7)

One file per series, appended on each refresh. Observations are value objects with `date`.

```json
{
  "id": "boi-policy-rate",
  "names": { "he": ["ריבית בנק ישראל"] },
  "publisher": "Bank of Israel",
  "flow": "EDGE ...", "series_code": "...",
  "unit": "pct_per_year",
  "cadence": "on change", "stale_after_days": 45,
  "terms_of_use": { "status": "unconfirmed", "fallback": "data.gov.il copy (product.md dependency 7)" },
  "rule_ids": ["BANK-22", "BANK-25"],
  "observations": [ { "date": "2026-09-03", "value": 3.25, "source": { "...": "value object fields" }, "checked": "2026-10-22" } ]
}
```

- The schema is `seriesRecord` (strict; `packages/schema/src/collections/series.ts`). `names` holds `he` (at least one) and optional `en`. `cadence` is `daily`, `monthly` or `on change`; `stale_after_days` is a positive integer; `unit` comes from §2 (`index_points` for an index, `pct_per_year` for rates). Optional `notes` says what the base period or a value means and how the file is thinned; optional `raw` (`archive_key`, `sha256`) is the evidence of the latest download that changed the file.
- **The terms gate.** `terms_of_use.status` is `confirmed`, `unconfirmed` or `not-permitted`; the validator fails any series file whose status is not `confirmed` ("terms gate: not shipped", architecture 3.3), so a series the publisher's terms do not allow is never committed. `terms_of_use` has `fallback` (required) and optional `terms_url`, `read_on` and `attribution` (the attribution line the licence prescribes, shown next to the numbers).
- **Observations.** Each is a value object with `date` (a full ISO date; a monthly index uses the first day of its month, with `effective_to` the last day) and, for a series that holds several (a multi-key series such as bank rates by plan), an optional `key` string, unique per `date`. The validator checks that observations are sorted by `date` then `key`, with no two the same, and that every `rule_ids` entry is in the rule base.
- **The series in the data**, written by the pipeline (`npm run refresh -- <source>...`):
  - `cbs-cpi` (source `cbs-cpi`): the general CPI, base 2024 average = 100 from 2025-01; the CPI history of F-03.
  - `mof-child-savings-rates` (source `mof-child-savings`; CS-10, CS-22, CS-23): key `<bank>|<plan>|<age>|<saving period>|<metric>`, thinned to first, changes and latest per key, latest 14 months.
  - `ecb-fx` (source `ecb-fx`): the ECB's daily euro reference rates in `fx_per_eur` (D26).
  - `ecb-fx-month-end` (source `ecb-fx-month-end`): the same unit for the dollar and the shekel on each month's last reference day since January 2000, from the ECB Data Portal's `EXR.M.<code>.EUR.SP00.E`, for F-93.
- **Series the method names that are not in the data.** The Bank of Israel's series (`boi-policy-rate` for A-20; `bank-deposit-rate-avg-<bank>-<term>` from INTEREST_DASH for A-21; `makam-yield-<months>` for A-22; `gov-bond-yield-<type>-<years>` and auction coupons for A-23) have no adapter: their terms do not permit republication (status `not-permitted`, D20). `cpi-expectations` (A-02, G-01) and `average-wage` (TXP-03, PEN-04, PEN-08) are not sourced.

### 3.9 `data/averages/` (not built)

There is no such collection: no schema and no file, so the validator fails any file put there. The regulator fee averages the data holds are the CMA's per-track averages (§3.13) and a fee line's `averages` (§3.6).

### 3.10 `data/catalog/` — institution-facing names (3.10)

Names the CMA data and the Maya export do not hold: an institution's own name for a product or track where it differs from the regulator's name, and bank deposit and savings-plan products. One entry per name and institution.

```json
{
  "id": "meitav-kaspi-shikli",
  "institution": "meitav",
  "where_seen": "מיטב, פלייר תפעולי, עמוד 3: ״גמל להשקעה - מ.ה קופה 7857״, https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf",
  "seen_on": "2026-10-22",
  "seen_by": "il-finance CAT-11, CAT-13",
  "names": { "he": ["כספי (שיקלי)"] },
  "maps_to": { "wrapper_id": "kupat-gemel-lehashkaa", "cma_fund_id": 7857, "track_ids": [7861] },
  "near_duplicates": [],
  "status": "catalogued | not-catalogued-yet"
}
```

- `where_seen` is what the track page shows after "מקור:": each document in Hebrew, as a reader would name it, followed by its link, the documents separated by "; ". The page drops the links; the first one is the source its date opens.
- The schema is `catalogEntry` (strict, optional `notes`). `status` is `catalogued` or `not-catalogued-yet`. `near_duplicates` is an array of `{ name, track_ids, resolution }`. Optional `default_at_joining` (boolean) is the institution's own statement that this is the track a joiner gets without choosing; the track page shows the "ברירת המחדל" tag from it.
- `cma_fund_id` is the fund (קופה) number as the institution's documents and the CMA transfer directory give it (CAT-09); the monthly datasets list tracks, not funds, so the validator checks only that every `track_ids` entry is a `fund_id` in the latest file of a `data/cma/` dataset (§4 item 10).
- `cma_fund_id` and `track_ids` are empty for a bank product; `maps_to` then names the wrapper and, once collected, the `data/terms/deposits/` record.
- `near_duplicates` records names that one institution uses for more than one product or track, with the resolution from the data, or "unresolved".

### 3.11 `data/terms/` — term matching (3.1) and `data/dimensions/` (3.3)

`terms/<id>.json` (schema `termRecord`, strict; `id` matches `^[a-z0-9-]+$`):

```json
{
  "id": "kupat-gemel",
  "he": "קופת גמל",
  "en": null,
  "meaning": "one-line Hebrew explanation",
  "where": ["statement", "payslip", "app", "law"],
  "wrapper_ids": ["kupat-gemel-lehashkaa"],
  "variants": ["other spellings"],
  "rule_ids": ["KGL-01"],
  "source": { "url": "...", "title": "...", "publisher": "...", "strength": "institution", "checked": "2026-10-23" },
  "seen_by": "optional, for payslip labels (G-19)"
}
```

- `where` entries come from `statement`, `bank-statement`, `payslip`, `app`, `ad`, `law`, `form`, `bylaws`, `gemel-net`, `prospectus` (a fund prospectus), `tariff` (a provider tariff), `fund-name` (a fund's name), `tax-form` (a tax form such as form 106 or 867), `pensia-net` (the pension-net site), `provider-site` (a provider's site or rate table).
- `wrapper_ids` are product IDs, for guide pages; optional `exposure_ids` lists the exposure records the term belongs to (ids as in §3.4). `en` may be `null`.
- Payslip labels carry `strength: institution` and `seen_by` (G-19). `source` here is the `source` block of a value object plus `checked`, not a full value object.
- Two records may not share a Hebrew name and a page (§4 item 16).

`dimensions/<id>.json` (schema `dimensionRecord`, strict): `{ "id": "tax-at-exit", "he": "...", "one_line": "...", "source": { ...as above }, "rule_ids": [...] }`. `id` is one of the 26 rows of `docs/glossary.md` section 2 (an enum in the schema). The list is hand-maintained; the marks are computed.

### 3.12 (removed)

The change log, removed by D24: the site keeps no change log.

### 3.13 `data/cma/` — CMA fund and track records (3.10, F-64, F-70, 3.6)

One file per dataset per report period, written by the pipeline: `cma/<dataset>@<YYYY-MM>.json`, where `dataset` is `gemelnet` (provident, hishtalmut, gemel lehashkaa, child savings) or `pensia-net` (pension). The latest period is the one the catalogue and the track workbench read. The schema is `cmaPeriodFile`.

```json
{
  "dataset": "gemelnet",
  "report_period": "2026-09",
  "source": { "url": "https://data.gov.il/he/datasets/cma/gemelnet", "title": "גמל נט, resource 2024-today", "publisher": "Capital Market, Insurance and Savings Authority (data.gov.il)", "strength": "primary" },
  "checked": "2026-10-22",
  "raw": { "archive_key": "cma/gemelnet/2026-10-22.csv.gz", "sha256": "..." },
  "funds": [
    {
      "fund_id": 7978,
      "names": { "cma": ["<FUND_NAME exactly as in the source>"] },
      "managing_corporation": { "name": "<MANAGING_CORPORATION>", "legal_id": "<MANAGING_CORPORATION_LEGAL_ID>" },
      "controlling_corporation": "<CONTROLLING_CORPORATION>",
      "fund_classification": "<FUND_CLASSIFICATION>",
      "target_population": "<TARGET_POPULATION>",
      "specialization": "<SPECIALIZATION>",
      "sub_specialization": "<SUB_SPECIALIZATION>",
      "inception_date": "YYYY-MM-DD",
      "raw_fields": { "AVG_ANNUAL_MANAGEMENT_FEE": "<as received>", "AVG_DEPOSIT_FEE": "<as received>", "TOTAL_ASSETS": "<as received>", "STOCK_MARKET_EXPOSURE": "<as received>", "...": "the kept columns, below" },
      "fees": {
        "avg_annual_management_fee": { "value": 0.61, "unit": "pct_per_year", "...": "value object, below" },
        "avg_deposit_fee": { "value": 0, "unit": "pct_of_deposit", "...": "value object, below" }
      },
      "holdings": {
        "total_assets": { "value": 3947.03, "unit": "nis_millions", "...": "value object, below" },
        "stock_market_exposure": { "value": 1933.12, "unit": "nis_millions", "...": "value object, below" },
        "foreign_currency_exposure": { "value": 822.49, "unit": "nis_millions", "...": "value object, below" }
      },
      "yields": {
        "avg_annual_yield_3y": { "value": 13.16, "unit": "pct_per_year", "...": "value object, below" },
        "avg_annual_yield_5y": { "value": 8.19, "unit": "pct_per_year", "...": "value object, below" }
      }
    }
  ]
}
```

- Text fields are stored exactly as the source spells them (§1, Hebrew), after decoding the CSV from Windows-1255. `inception_date` may be `null`.
- Identity, names, manager and classification serve the catalogue (3.10) and the fit mark (F-70), the two fee fields the track workbench (F-64), and the amounts of `holdings` the stock and currency exposure shares (F-87, F-88).
- **Kept columns** (the founder: "for future use"). `raw_fields` also keeps, as received and only when the file has them, `FOREIGN_EXPOSURE`, `LIQUID_ASSETS_PERCENT`, `DEPOSITS`, `MONTHLY_DEPOSITS`, `WITHDRAWLS`, `INTERNAL_TRANSFERS`, `NET_MONTHLY_DEPOSITS`, `MONTHLY_YIELD`, `YEAR_TO_DATE_YIELD`, `YIELD_TRAILING_3_YRS`, `YIELD_TRAILING_5_YRS`, `AVG_ANNUAL_YIELD_TRAILING_3YRS`, `AVG_ANNUAL_YIELD_TRAILING_5YRS`, `STANDARD_DEVIATION`, `ALPHA` and `SHARPE_RATIO` (the adapter's `KEPT_COLUMNS`). Only the two average annual yields have value objects (`yields`, below); no page reads the others, and a capability that shows one first adds its value object beside `fees`, `holdings` and `yields`, with its unit from the dictionary (CAT-03). A past return stays history, never a ranking key (product.md section 2). The refresh diff compares them, so a change writes the file.
- **Fee fields** (CAT-35 to CAT-39, CAT-06). `raw_fields` keeps the two fields as received; `fees` is required and holds `avg_annual_management_fee` (unit `pct_per_year`, from `AVG_ANNUAL_MANAGEMENT_FEE`) and `avg_deposit_fee` (unit `pct_of_deposit`, from `AVG_DEPOSIT_FEE`) as value objects. Both are percent (0.61 is 0.61%).
  - Each is the average fee actually charged from all members, after discounts, over the last completed calendar year, so a row of report year Y holds the Y−1 average (CAT-36, CAT-37): `effective_from`/`effective_to` are 1 January and 31 December of Y−1, `tax_year` is `null`, `update_rule` is `market`, `state` is `sourced`, `checked` is the file's `checked`, and `source` is the dataset source with the field name in the title. `rule_ids` are `CAT-35`, `CAT-36`, `CAT-37`, `CAT-06` (pensia-net adds `CAT-39`: the pair is per fund, every track of a fund carries the fund's values).
  - An empty raw field gives `value: null` with `notes` starting "לא דווח" and the reason (no full calendar year yet, or unknown, CAT OQ22); empty is not zero, and zero is a reported 0.00%.
  - An empty `AVG_DEPOSIT_FEE` of a product type whose fee regulation has no deposit-fee item (study funds, central severance funds and other-purpose funds by `fund_classification`, and IRA funds by a name with "בניהול אישי" or "IRA", IRA-03) gets a note that starts "אין דמי ניהול מהפקדה" instead of "לא דווח" and adds `PF-06` to `rule_ids`: the value stays `null` as reported, and the site reads it as no fee.
  - A negative value is kept as reported, with a note (it can be a refund, CAT-40).
  - The weighting of the average (by assets or by members) is not published and stays open (CAT OQ2, OQ23): the site says "ממוצע" and the year, never "משוקלל".
  - The site marks the figure stale when the previous calendar year is older than the fee's year (`staleCmaFee`), not by the monthly rule.
- **Holdings** (D34, F-87, F-88). Optional: a file written before 2026-10-26 has none, and the adapter writes it only when the CSV has `TOTAL_ASSETS`, `STOCK_MARKET_EXPOSURE` or `FOREIGN_CURRENCY_EXPOSURE`. `total_assets`, `stock_market_exposure` and `foreign_currency_exposure` (optional: only when the CSV has the column) are value objects in `nis_millions` at the end of the report period: `effective_from` and `effective_to` are the period's first and last day, `rule_ids` is `CAT-24`, `state` is `sourced`, `source` is the dataset source with the field name in the title. The unit of `TOTAL_ASSETS` is the dictionary's (CAT-03); those of `STOCK_MARKET_EXPOSURE` and `FOREIGN_CURRENCY_EXPOSURE` are read the same way, which the dictionary does not state (CAT OQ4), and the note says so, and that the regulator does not publish whether the exposure counts derivatives or looks through the funds a track holds. An empty field is `value: null` with the note "לא דווח."; the site marks both stale by the monthly rule (`staleCma`).
- **Yields** (D54, the track browser). Optional: the adapter writes it when the CSV has `AVG_ANNUAL_YIELD_TRAILING_3YRS` or `AVG_ANNUAL_YIELD_TRAILING_5YRS`, and `renormaliseFees` rebuilds it from `raw_fields` (`npm run renormalise:cma -w @finance-tool/pipeline`, no download). `avg_annual_yield_3y` and `avg_annual_yield_5y` are value objects in `pct_per_year` (13.16 is 13.16%): the track's average annual yield over its last 3 and 5 years. `effective_from` and `effective_to` are the first and last day of the report period, `rule_ids` are `CAT-04` and `CAT-05`, `state` is `sourced`, `source` is the dataset source with the field name in the title.
  - The regulator states that every yield is nominal and gross (CAT-04): before management fees, and not net of tax; the note says so, and that it is a past return. That the window ends at the report month and that the figure is a geometric annualisation are read from the data, not stated (CAT-05), and the note says that too.
  - An empty field is `value: null` with the note "לא דווח." (CAT-05: null when the track is younger than the window), or "לא דווח: למסלול עוד אין N שנים מלאות (נפתח …)" when the track opened less than N years before the period's end. A negative yield is kept as reported.
  - The site marks both stale by the monthly rule (`staleCma`) and never ranks by them.

### 3.14 `data/fund-lists/` — the fund lists (3.4 fund variants, 3.10, product D17)

**No file is in the repository.** TASE's terms forbid publishing the lists or a database built from them without written consent (CAT-43), so the site gives the counts with a link to the lists and the by-hand download path, and no fund list (product.md dependency 6, D22). The schema and the reader stand for a list whose terms are confirmed: the site reads the latest file of each list whose `terms_of_use.status` is `confirmed` (`loadFundLists` in `site/app/lib/variants.server.ts`).

The two lists, each saved by hand, because the pages block scripts:

- `fund-lists/maya-mutual-funds@<YYYY-MM-DD>.json`, from the export of TASE's Maya fund list (CAT-33, CAT-34): the Israeli open-end funds (mutual funds, tracking funds and money-market funds).
- `fund-lists/tase-foreign-funds@<YYYY-MM-DD>.json`, from TASE's list of foreign funds traded on TASE (ETF-32): fund number, name, manager, classification and reference index, in the same shape with the fields that list has.

Together they are the set of funds the workbench chooses from (method F-65, F-83) and that a fund manager's catalogue page lists. The file:

```json
{
  "list": "maya-mutual-funds",
  "snapshot": "2026-10-22",
  "source": { "url": "https://maya.tase.co.il/he/funds/mutual-funds", "title": "...", "publisher": "...", "strength": "primary" },
  "checked": "2026-10-22",
  "terms_of_use": { "status": "...", "fallback": "..." },
  "raw": { "archive_key": "...", "sha256": "..." },
  "funds": [
    {
      "fund_number": "<as in the export>",
      "isin": "<as in the export, or null>",
      "names": { "he": ["<as in the export>"] },
      "manager": "<as in the export>",
      "trustee": "<as in the export>",
      "classification": ["<top heading>", "<main heading>", "<sub heading>"],
      "characteristics": ["<as in the export>"],
      "exposure_code": "<as in the export>",
      "reference_asset": "<as in the export>",
      "tax_status": "<as in the export>",
      "distribution_fee_class": "<as in the export>",
      "management_fee": { "value": null, "unit": "pct_per_year", "...": "value object" },
      "trustee_fee": { "value": null, "unit": "pct_per_year", "...": "value object" },
      "data_date": "YYYY-MM-DD"
    }
  ]
}
```

- The schema is `fundListFile` (`packages/schema/src/collections/fund-lists.ts`), strict: `list` (`maya-mutual-funds` or `tase-foreign-funds`), `snapshot` (the save date, equal to the `@<date>` in the file name), `source` (the source block of §1), `checked`, `terms_of_use` (as the series schema, §3.8), `raw { archive_key, sha256 }` and `funds[]`.
- A row's text is stored as the list prints it. `isin`, `exposure_code` and `tax_status` are `null` where the list prints none; `trustee`, `reference_asset` and `distribution_fee_class` may be `null` or left out; `characteristics`, `management_fee` and `trustee_fee` are optional. `classification` holds the headings top to bottom (Maya: three; the TASE foreign list: the one it has).
- Only the fields the catalogue, the candidate set (F-65 matches on classification and reference asset) and the fee comparison use are kept; prices and returns are not, since the site does not rank by past return (product.md section 4).
- The validator fails a file whose `terms_of_use.status` is not `confirmed` ("terms gate: not shipped"), whose name differs from `<list>@<snapshot>.json`, or that repeats a `fund_number`. An exposure's `fund:<id>` variants resolve against `data/funds/` only, never against these lists.

### 3.15 `data/open-questions.json` — the open questions of the rule base

One file, an array with one entry per numbered item of the "## Open questions" section of every rule-base file (`.claude/skills/il-finance/references/*.md`), in file order:

```json
[
  { "id": "TXI OQ19", "status": "open", "title_he": "<one short line: what is unknown>" },
  { "id": "PEN OQ7", "status": "narrowed", "title_he": "<what is unknown>", "blocks_he": "<what on the site waits for it>" },
  { "id": "BANK OQ1", "status": "open" }
]
```

- `id` is the code the site uses: the file's prefix from the references README's file table, a space, `OQ` and the item's number. Guide records write the same question as `PEN-OQ7` (§3.3). An id appears once.
- `status`: `open` or `narrowed`. The markdown does not mark narrowing, so the file keeps the status it has, and a new id takes the class of the open-questions audit (8dd1f013:research/knowledge/2026-10-26-open-questions/merged.json) when there is one.
- An answered question is deleted from the markdown once its answer is in a rule, and leaves the file with it (founder, 2026-11-08); git keeps the history. Its number is never used again: a new question takes a number above any its file has used. A struck item left in the markdown stops the generator and fails the validator.
- `title_he` (one short Hebrew line, what is unknown, in plain words) and `blocks_he` (what on the site waits for the answer, only where something does) are written by hand; every question the site names has them. The question sheet shows them.
- Generated by `npm run gen:open-questions -w @finance-tool/pipeline` (`packages/pipeline/scripts/gen-open-questions.ts`), which keeps the hand-written fields and prints any id that left the markdown with its Hebrew. The schema is `openQuestionsFile` in `packages/schema`, strict.
- Every question the repository names exists: the validator (§4 item 13) fails a code in data/, the docs, the rule base, the packages' sources or the golden workings that the rule base does not have, and the kit guard (`site/app/components/kit/guards.test.ts`) fails a site source that names one. A citation of an answered question points at the rule that answered it instead. The not-covered page names each closure of a tier-2 status section by the rules that answered it.

### 3.16 `data/abroad/` — the same kind of product in other countries (D114)

One file per guide page that has the note "במדינות אחרות" at the end of its "שווה לדעת", named by the guide's product id (`data/abroad/<id>.json`). The rule base covers Israel only, so these facts live here, each with the page it was read on and the day.

```json
{
  "id": "kupat-gemel-lehashkaa",
  "opens_on": "gb",
  "tiles": ["deposit_limit", "tax_on_gain", "withdraw"],
  "countries": [
    {
      "country": "gb", "found": true, "product": "ISA", "product_name": "Individual Savings Account",
      "pages": [{ "url": "https://www.gov.uk/individual-savings-accounts", "title": "…", "publisher": "GOV.UK", "publisher_he": "אתר ממשלת בריטניה", "checked": "2026-11-13" }],
      "who": { "statement": "18 or over, and resident in the UK …", "source": { "…": "as a fact's source" }, "checked": "2026-11-13" },
      "facts": {
        "deposit_limit": {
          "value": 20000, "unit": "gbp",
          "source": { "url": "https://www.gov.uk/individual-savings-accounts", "title": "…", "publisher": "GOV.UK", "publisher_he": "אתר ממשלת בריטניה", "kind": "regulator_page", "strength": "primary", "locator": "Overview", "quote": "In the 2026 to 2027 tax year, the maximum you can save in ISAs is £20,000" },
          "checked": "2026-11-13", "effective_from": "2026-04-06", "effective_to": "2027-04-05", "update_rule": "set yearly", "state": "sourced", "notes": "…"
        }
      }
    },
    { "country": "us", "found": false, "checked": "2026-11-13", "looked_for": "…" }
  ]
}
```

- `countries` holds the four countries the note compares with, Britain (`gb`), the United States (`us`), France (`fr`) and Italy (`it`), each once and in that order on every guide (D114). A country is `found` with a product like the guide's, or not, with the day it was looked for (`checked`) and what was looked for (`looked_for`, English, never shown).
- `opens_on` is the country the note opens on, the closest match; it must be found.
- `tiles` are the three facts every found country shows, by key, so the three headings are the same for every country of the guide; each found country carries all three in `facts`. Its other facts are the figures and statements the note's sentences rest on (an age, a number of years).
- A fact is a value object (§1) whose `state` is `sourced` and whose `source` is the page it was read on: a government's or regulator's own page, or the law on the state's own portal (`kind` `regulator_page` or `law`), so `strength` is `primary`. The source also carries `publisher_he` (the name the note's source line and the fact's sheet show), `quote` (the page's own words the fact rests on, verbatim, in the page's language; where it rests on two places of the page, the two joined by " … ", each verbatim), `locator` (where on the page: a heading, a paragraph of a law) and, where the sheet should show it, `locator_he`.
- An amount keeps its own currency (`gbp`, `usd`, `eur`) and the decimals its source prints, never converted (§2). An amount set for one year (a yearly deposit limit, a yearly ceiling) carries that year in `effective_from` and `effective_to` (the British tax year runs from 6 April to 5 April) and `update_rule` `set yearly`, so its sheet says the year. A statement that is no number is `unit` `text`, its `value` a short English line of what the page says; the guide's words say it in Hebrew.
- `product` is the product's name as its own pages write it ("ISA", "Roth IRA"), the chip's second word; `product_name` its full name where that is an abbreviation. `who` says who may open it where the page says so (an age, residence, an income from work), sourced like a fact, and is absent where the page is silent; the page ships it among the facts under the key `who`, so no fact is keyed `who`.
- `pages` are the pages the note's source line names, the first being the one its link opens; `checked` is the day each was read.
- A source whose text stops being in force on a known day carries `superseded`: `from`, that day; `by`, the text that carries the same rule from then; and `basis`, the provisions that repeal the text and set the day, each with its `url`, `title`, `locator` and verbatim `quote`. From `from` on, the data check warns that the source must move, naming `by`; the fact may still hold, and the page keeps showing it. Italy's PIR: its facts cite Law 232/2016 art. 1 cc.100-114, which the Testo unico of D.Lgs. 19 June 2026 n. 117 repeals (art. 376 c.1 lett. eeeee)) from the day it applies, 1.1.2027 (art. 377 c.1), and whose art. 209 carries the same rules; each fact names its comma of art. 209 in `by`, as `"by": "D.Lgs. 19 giugno 2026, n. 117, Testo unico imposte sui redditi, art. 209, comma 2"`.
- The schema is `abroadRecord` in `packages/schema/src/collections/abroad.ts`, strict. The validator fails a record whose `id` differs from its file name, and checks every source's host as it checks any primary source (§4 item 12): the governments' and regulators' hosts are listed in `OFFICIAL_HOSTS`.

## 4. Validation (run before every build)

1. Every value object has `source.url`, `checked`, `effective_from`, `unit`, `state`.
2. Every `rule_ids` entry exists in `il-finance`; every `data/rules/` file has a matching rule heading.
3. No `strength: open` rule has `figures`.
4. Every tax figure has `tax_year`; a run in year `y` finds a figure for `y` or stops with "figure not updated".
5. Every fee line has a `base` in the vocabulary and `applies_to`.
6. Every wrapper record's `tax_at_exit.formula` exists in `docs/method.md`.
7. Every series file's last observation is within `stale_after_days`, else the page shows the stale flag (D3).
8. Every `data/funds/` record names its `exposure_id` and its `exposure_id` lists it under `variants`.
9. Dimension marks in wrappers, securities and funds are regenerated from `rule_ids`, never edited by hand. A security's `held_in.rule_ids` may cover a mark but do not require one.
10. Every `track_ids` entry in `data/catalog/` exists in the latest `data/cma/` period of its dataset; one that has disappeared is reported, not silently dropped. `cma_fund_id` is the fund number (CAT-09), which the track datasets do not list, so it is not checked against them.
11. Every Israeli fund and every foreign fund traded on TASE in `data/funds/` has its fund number in the latest matching list in `data/fund-lists/`; one that has disappeared is reported, not silently dropped.
12. Rule sources.
    - Fails: a rule has neither `sources` nor `sources_missing_reason` (a warning only while no record carries either); `page` on a URL that is not a PDF (path ends `.pdf` or contains `BlobFolder`); in any record of `data/`, a source whose address carries `#page=` with another number than its `page`, or whose link opens past the last page of the file as the document library counts it (`checkCitedPages`: a page is the file's page, the one the link opens; a printed number goes in the locator); `anchor` on a PDF; a `sources[].url` is not in the rule's markdown block verbatim, but for the number of its `#page=`; a `derived_from` id has no record; a `data/parameters/pinned-rules.json` id has no record, or a row's first rule has no `primary` source; a row's `answer_he` carries a digit outside a `{ID:figure}` slot, or a slot names a rule outside the row or a figure that rule does not have.
    - Warns (printed, not failing): the rule's `strength` differs from its strongest source (`open` excepted); a source `checked` later than the rule's; the first source lacks `publisher_he` or `title_he`; `recheck_date` has passed; a rule's latest `tax_year` is behind the current year.
13. Open questions (§3.15). Fails: `data/open-questions.json` breaks its schema; a rule base's "Open questions" section keeps a struck item (an answered question is deleted); a question code (`TXI OQ19` or `TXI-OQ19`, and the numbers that continue a list, `GOV OQ2, OQ8`) in any file of data/, docs/, the rule base, `packages/{engine,pipeline,schema}/src` or `tests/golden`, or a question a rule-base file names in words ("open question 7", "TXA open question 3", "`tax-general.md` open question 13"), that is not a question of the rule base; a guide record under `data/instruments/` that lists in `open_questions` or `blocked_by`, or marks a dimension `blocked:` on, an id that is not one. Warns: the file is behind the rule base (an id missing or extra).
14. Scope (D30; `packages/pipeline/src/scope.ts`).
    - Fails on a rule: it has no `scope` (the schema), or `institution` without `scope_institutions`, or `scope_settle` on any scope but `unsettled`; the record's scope differs from its rule-base Scope line, or the line names a company the registry does not resolve; a `scope_institutions` id is not in the registry or carries another `name_he`; a `general` rule's first source is a company's document (`institution_doc`, or strength `institution`), or is neither a general kind (law, regulation, circular, regulator page, official PDF, exchange rule, dataset) nor another official text of strength `primary` (a court ruling, a government form); a general rule's `derived_from` names a rule that is not general, or its `examples` name one that is; a record that is not general, and not a not-rule, cites no own document (`own_hosts`, `filing_names`) of a company it names.
    - Fails on what cites rules: a P-09 question row or "שווה לדעת" block holds a rule that is not general; a wrapper cites a rule that is not general in any `rule_ids`, or holds a value whose `source.strength` is `institution`, or names in `company_terms` a general rule or one that does not carry the dimension; an exposure cites a rule that is not general, except the records `ownContextExposures` names for it (D31: ETF-37 to ETF-40 on `index-sp500`), each an index provider's own. A `company_terms` entry `{ rule, companies }` names only companies whose section lists the record, and an entry whose record names several companies is written that way (a bare id would name them all).
    - Fails on the registry: it repeats an id, gives a name two defaults, or names a CMA id, fee snapshot or deposit bank that does not exist.
    - Not-rules. The records the rule base keeps that are not rules (`notRules` in `packages/schema/src/scope.ts`) and are not general each name every file that cites them: the validator reads every `rule_ids` under `data/` (but `data/rules` and `data/sources`: the wrappers, exposures, dimension records, glossary terms and the rest) and fails a not-rule cited in a data file its entry does not name, a named data file that is gone, and one that no longer cites it; the site test `site/app/lib/scope.test.ts` does the same for every source file under `site/app` (the playbook's SW-X01 to SW-X04, SW-34, SW-37 and SW-53, the fees page's MF-55, the rules page's experience list). A general not-rule (SW-19, BANK-27 and the like) may stand anywhere, so its entry names no files.
    - Warns: a general rule with no source to check; a glossary term citing a rule that is not general (its card shows only the general ones).
    - The run prints the counts by scope: `scope: <n> general, <n> institution, <n> unsettled`.
15. Fund load (§3.5). Fails: a `data/funds/` record has `fees.load` above zero, with the message that the page does not yet price it. The page shows no load and prices none while every collected load is zero, so this guard stands until a fund charges one; building the label and the price removes it.
16. Glossary names (§3.11). Fails: two `data/terms/` records share a Hebrew name and a page (a `wrapper_ids` or `exposure_ids` entry in common). A page keys its term cards by the Hebrew name, so one of the two would win silently; two records of one name stand only for different products. `TERM_NAME_LEFTOVERS` in `packages/pipeline/src/validate.ts` lists the pairs still allowed, and only shrinks (it is empty).
17. Tracking records (§3.5, F-92). Fails: a `data/funds/` record's `tracking_record.years` leaves out a year of its `years_printed`, holds one that is not there, or holds a year twice; a `gross` benchmark sits on an index other than TA-125, TA-35 or TA-90, names no document (neither its own `source` nor a `page` of the record's report), or lacks its index's rule (ETF-42 for TA-125, ETF-44 for TA-35, ETF-45 for TA-90) or carries another index's; an Israeli record has a year without `fees_charged`, or any record has `fees_charged` without `fees_page`; an Israeli record with `fees_page` lacks `changes_page` or `variable_rate_since`; a year charged at today's variable rate (every year when `variable_rate_since` is null, else from the first whole year at it) charged more than that rate either way (ETF-14). Where the report's text is in the research library, `packages/pipeline/test/tracking-years-library.test.ts` reads the page and holds `years_printed` to the years its returns table prints, each year's two figures to that year's column in the fund's row and the index's row (a swapped year label fails), and each fee charged to its year's column and its row on `fees_page` (where the text layer does not keep a cell's place, to the page), `variable_positive_only` to the footnote on `fees_page`, and `variable_rate_since` to `changes_page` (null where the page counts and dates no change of the variable fee, else a date the page prints for it); a record whose source text is not in the library fails unless it is named, with its reason, in the test's excuse list, which only shrinks (it skips only where the library is not on disk).
18. By amount and unit prices (§3.5, §3.6, F-109). Fails: a `by_amount` quote that names neither fractions nor an order by sum, a listing with two entries, a recurring-plan entry on a record with no recurring-plan conversion line, an entry on a record that prices no fund bought abroad, and a `share_price` that is not in a currency or whose source is on TASE's or Maya's host.
19. No religious-law products (`guidelines/project.md`). Fails: any text in a record under `data/` that names a product defined by religious law (a Halacha or Sharia track, a kosher fund), by `isReligiousLaw` in `packages/schema/src/religious-law.ts`, the matcher the CMA refresh drops such tracks by.
20. Notes on other countries (§3.16). Fails: a record breaks `abroadRecord` (the four countries out of their order, one missing or repeated, `opens_on` on a country with no similar product, a found country without one of the three `tiles`, a fact whose source is not `primary`), or its `id` differs from its file name. Warns: a source whose `superseded.from` has come, by guide, country and fact, with the text it must move to.
