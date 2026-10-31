# Data schema: the format of every fee, term and rule figure under `data/`

Written 2026-10-22 by the financial modeler, for `docs/method.md`. Every number the engine reads comes from a file in one of the collections below. No value appears without a source URL and a checked date (CLAUDE.md standing rule, D3).

Status: **in force.** On 2026-10-23 the founder asked Claude to settle every open item ("do whatever you think fits"); Claude did, and the founder has not reviewed this document line by line.

---

## 1. Common rules

**Format.** One JSON file per record, UTF-8, under the collection's folder. JSON was chosen because the site is static and the engine runs in the browser (D1); the files are also readable by hand and diffable. YAML would be friendlier to write but needs a parser in the browser; CSV cannot carry the nested `source` and `fees` blocks.

**File name.** `<collection>/<id>.json`, where `id` is the record's `id` field: lowercase ASCII, digits and hyphens. Dated snapshots (tariffs, series, funds) add the snapshot date: `<id>@<YYYY-MM-DD>.json`. The latest snapshot is the one the engine reads; older ones stay for revisit (F-82) and as history (change log removed 2026-10-24, D24).

**Every value is wrapped.** A number never appears bare. It appears as a *value object*:

```json
{
  "value": 1.05,
  "unit": "pct_per_year",
  "source": {
    "url": "https://he.wikisource.org/wiki/...",
    "title": "תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע\"ב-2012, reg. 2(a)",
    "publisher": "Knesset (Wikisource mirror)",
    "strength": "primary-mirror"
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
| `value` | yes | number, string, boolean, or `null` when the value is unknown (then `notes` says why) |
| `unit` | yes | one of the units in section 2 |
| `source.url` | yes | the page or file actually opened; a search snippet is not a source |
| `source.title` | yes | document and section or page |
| `source.publisher` | yes | who published it |
| `source.strength` | yes | `primary`, `primary-mirror`, `institution`, `secondary`, `open`, `entered` (section 2) |
| `checked` | yes | date the source was read, `YYYY-MM-DD` |
| `effective_from` | yes | first date the value applies; `null` if unknown |
| `effective_to` | yes | last date, or `null` while current; the engine refuses a value past this date (method §13) |
| `tax_year` | when the value is a tax figure | the tax year it belongs to (TXG-01) |
| `update_rule` | yes | how the figure changes: `fixed in law`, `fixed in regulation`, `cpi-linked 1 jan`, `average-wage-linked`, `frozen 2025-2027`, `provider-set`, `market`, `founder` |
| `rule_ids` | when a rule governs the value | `il-finance` rule IDs |
| `state` | yes | `sourced`, `computed`, `entered` (D7). A value with `state: computed` carries `computed_from`: the formula ID and the inputs |
| `notes` | no | free text, including any conflict between sources |
| `rationale_he` | no, parameters only | the reader's own short line for this one number, in plain Hebrew (added 2026-10-25; §3.2). Only under `data/parameters/` |

**Strength vocabulary** follows `il-finance` README and D10, with two additions: `primary-mirror` for law read on Wikisource or Nevo (coverage.md §0 item 1; it computes, labelled, until re-read on the official text), and `entered` for values the person typed, which never live under `data/` but share the same object shape in saved state (3.9).

**Dates and money.** Dates are `YYYY-MM-DD`. Money is in NIS unless `currency` says otherwise. Percentages are stored as numbers in percent (`1.05` means 1.05%), never as fractions, to match how every source prints them.

**Hebrew.** Any name an institution, regulator or statement uses is stored exactly as the source spells it, in a `names` block, so the catalogue (3.10) and term matching (3.1) can match strings.

---

## 2. Units and enumerations

Units: `nis`, `nis_millions`, `usd`, `eur`, `pct` (a share), `pct_per_year`, `pct_of_deposit`, `pct_of_trade`, `pct_of_balance_per_period`, `nis_per_month`, `nis_per_trade`, `nis_per_transfer`, `usd_per_share`, `usd_per_trade`, `gbp_per_trade`, `nis_per_usd`, `fx_per_eur`, `months`, `years`, `days`, `business_days`, `index_points`, `count`, `boolean`, `text`.

**2026-10-31 (issue 144).** `nis_per_usd` (shekels per dollar converted: a conversion printed as agorot a dollar, Psagot's 1.5 agorot) was added; F-13 charges it on the dollars converted.

**2026-10-25 (invest page).** `usd_per_share` (a dollar amount per share, a per-share commission rate), `usd_per_trade` and `gbp_per_trade` (a dollar or pound amount per trade: a minimum or maximum commission in a foreign currency) were added for the foreign brokers' tariffs; the engine converts them at the run's exchange rate. `fx_per_eur` (units of a currency per one euro, the ECB reference rate) was added for the FX series `data/series/ecb-fx.json` (request of agent A3). **2026-10-29:** `data/series/ecb-fx-month-end.json` holds the same unit for the dollar and the shekel on each month's last reference day since January 2000 (the ECB Data Portal's EXR.M.<code>.EUR.SP00.E, `npm run fetch:ecb-month -w @finance-tool/pipeline`), for F-93.

**2026-10-26 (D34, the company page's stock-exposure column).** `nis_millions` (an amount in millions of shekels, as the CMA datasets report amounts, CAT-03) was added for the `holdings` of §3.13; the site shows it as `25,706.14 מיליון ₪` and does not convert it.

Fee bases (`fee.base`): `deposit`, `balance`, `trade`, `custody`, `fx`, `exit`, `fixed_period`, `distribution_handling`, `spread`, `creation_redemption`, `transfer_out`, `load`, `redemption_deduction`, `variable_management`, `trustee`, `direct_expenses`, `insurance_premium`.

Security types for tariff lines (`fee.applies_to`): `tase_shares_bonds`, `tase_bonds` (a bonds-only line, for a tariff that prices bonds apart from shares and ETFs; added 2026-10-24), `makam`, `foreign_securities`, `mutual_fund_units`, `money_market_units`, `etf_units`, `tase_foreign_fund_units`, `all`.

Provider classes (`provider.class`): `bank`, `tase_member_nonbank`, `foreign_broker`, `fund_manager`, `provident_manager`, `pension_manager`, `insurer`.

Wrapper IDs (`data/instruments/wrappers/`): `current-account`, `bank-deposit`, `savings-plan`, `brokerage-account`, `kupat-gemel-lehashkaa`, `keren-hishtalmut`, `pension-comprehensive`, `pension-general`, `provident-for-annuity`, `child-savings-provident`, `child-savings-bank`, `ira-hishtalmut`, `ira-provident`. Tier-2 wrappers get IDs when they graduate (D2).

Security IDs (`data/instruments/securities/`, added 2026-10-26 with D6's amendment): `makam`, `government-bond`, `money-market-fund-daily`, `money-market-fund-renewable`. Until that date the four were wrapper IDs; the IDs, the guide addresses and the keys the device stores are unchanged. A tier-2 instrument bought inside a securities account (corporate bonds, REITs) graduates as a security, not a wrapper.

Product IDs: a wrapper ID or a security ID, what a person chooses between. A guide page (`/guide/<id>`), a comparison option, a term's and an exposure's `wrapper_ids`, P-05's `instruments` and P-08's `holding` rows are named by product ID (`productId` in `packages/schema`).

Exposure IDs (`data/instruments/exposures/`): `cash-nis`, `cash-fx`, `makam`, `gov-bond-unlinked`, `gov-bond-linked`, `index-<index-code>` (for example `index-sp500`, `index-ta125`), `track-<cma-classification>` for provident tracks, `general-track`.

Dimensions (`data/dimensions/`): the vocabulary in `il-finance` README (`tax-at-exit`, `fee-management-balance`, ...), plus any of the proposed additions the founder adopts (coverage.md F5; **answered 2026-10-23: none adopted for release 1**, the 26 rows of `docs/glossary.md` section 2 stand).

---

## 3. Collections

### 3.1 `data/rules/` — rule figures the engine reads

The rules themselves stay in `il-finance` (markdown). This collection holds only their **figures**, one file per rule, so the engine never parses markdown and every figure carries its own tax year.

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
- Optional `text_he` (2 to 4 sentences of plain Hebrew, shown on the rule card) and `figure_names_he` (a map from figure key to its Hebrew name). The English `title` stays the key the rules page falls back to when `text_he` is absent. Added 2026-10-23.
- `strength: open` records exist (for the rules page and the blocked marks) but carry no `figures`.
- `title_he` (optional, added 2026-10-23): the Hebrew title shown in lists and on cards; the English `title` stays the key and the fallback. `text_he` and `figure_names_he` are the plain-Hebrew text and figure names.
- `recheck_date` is required for every rule on the "likely to change" list (product.md 3.8).
- Bracket tables (TXG-02, TXG-04) store `figures.brackets` as an ordered array of `{ "up_to": value object, "rate": value object }`.
- Conflicts (coverage.md §9) are recorded in `notes` on the figure and the engine uses the value the rule base says computes (for example TXI-11's 15%).
- `sources` (added 2026-10-24, extracted from the `- Source:` line under each rule's heading in `il-finance`; all 500 records carry it): an array of entries sorted by preference (regulator or ministry document, Knesset gazette, Wikisource, Nevo, institution, article; then locator present; then newer `checked`). Each entry: `url` (a raw Wikisource `index.php?title=T&action=raw` link is stored as `https://he.wikisource.org/wiki/T`), `title` (as the markdown wrote it, often an English working title), optional `title_he`, `publisher` (English, from `data/sources/publishers.json` by host, else the host) and optional `publisher_he`, `kind` (`law`, `regulation`, `circular`, `regulator_page`, `official_pdf`, `exchange_rules`, `institution_doc`, `article`, `dataset`, `form`, `other`), `strength` (`primary`, `primary-mirror`, `institution`, `secondary`; a copy on Wikisource, Nevo or any third-party host is `primary-mirror`, never `primary`), `mirror_host` (`wikisource`, `nevo`, or `other` for a copy of an official text on another host; set exactly when `strength` is `primary-mirror`), `locator` (raw: "s. 3(ה4)(3)", "pp. 27–30") with `locator_he` (only when the locator translates fully), `page` (first page for `#page=`, only on a PDF URL and never a printed page. A PDF URL is a `.pdf` path, a gov.il blob folder file, or, since 2026-10-25, a gazette file from the Ministry of Justice's Reshumot service at `free-justice.openapi.gov.il/…/Documents/…`, whose links already carry their `#page=`), `anchor` (Wikisource section id without `#`: `סעיף_3`, `סעיף_3.ה4`, `סעיף_125ג`; only on an HTML URL), `quote` (the document's own words, verbatim from a quoted Hebrew span in the markdown, 8 to 240 characters, never composed), `checked`, `qualifier` (the markdown's parenthetical after the strength word) and `note` (English, never shown). A figure's own `source` object stays as it is.
- `sources_missing_reason` replaces `sources` when the Source line names no link (the raw text). `derived_from` lists the rule ids a Source line points to ("as in FXD-07", "pointers to X, Y"), for the chips on the card. A general rule's pointer to a record that is not general (a company's term named beside the general source) goes to `examples` instead (2026-10-26): a named example, shown under "לדוגמה", never a derivation; a general rule's `derived_from` holds general rules only.
- `scope` (required, added 2026-10-26; D30, build spec `research/specs/2026-10-25-rules-scope/spec.md`): who the rule applies to, extracted from the `- Scope:` line of the rule's block. `general`: a law, regulation, regulator's text or exchange rule says it, and it binds every institution of that kind; `institution`: one named company's own term; `unsettled`: it reads like a general rule, but only company documents (or the press) support it so far. `scope_institutions` (an array of `{ id, name_he }`, ids and names from `data/sources/institutions.json`) names the companies: required for `institution`, the companies whose documents were seen ("seen at") for `unsettled`, absent for `general`. `scope_settle` (English working text, never shown) is what would settle an `unsettled` rule, and is set exactly for that scope. A Scope line has one of three forms: `general`; `institution: <names>`; `unsettled: <what would settle it>[; seen at: <names>]`. A name two companies of one group share (IBI, the broker and the fund manager) resolves by the registry's `only_records`.
- `packages/pipeline/scripts/extract-sources.ts` (`npm run extract:sources -w @finance-tool/pipeline`, `--dry` to only print the report) writes its keys in place (`scope`, `scope_institutions`, `scope_settle`, `sources`, `sources_missing_reason`, `derived_from`, `examples`) and nothing else, never edits the markdown, and saves `research/knowledge/2026-10-24-extraction-report.md`. It is re-runnable: it replaces its own keys and reads `data/sources/publishers.json`, `data/sources/documents.json` and `data/sources/institutions.json` when present. A `documents.json` row matches a link by substrings of its title; a row with `hosts` (2026-10-26) labels only links on those hosts, so a row that names where a copy is hosted (the consolidated regulations on btl.gov.il) leaves another copy of the same document to its own host's label. A host whose default kind is `law` (the official gazette) gives way to a title that names regulations. A Scope line that is missing or names a company the registry does not resolve is printed and leaves the run's exit code at 1. Since 2026-10-26 a company's own data page (a `dataset` of strength `institution`, such as TASE's index pages) ranks with the institutions, not with the regulators.
- **The institution registry** `data/sources/institutions.json` (added 2026-10-26): one row per company a scope can name, `{ id, name_he, kind, scope_names, cma_legal_id, fees_id, deposit_bank_id, own_hosts, filing_names?, note? }`. `own_hosts` (2026-10-26) are the hosts of the company's own sites, without "www." (a subdomain counts; a group's site serves each of its companies); `filing_names` are the names its filings on Maya (`mayafiles.tase.co.il`) open with. A source there is the company's own document; a record is listed in the company's section only when it cites one, and never when it is a not-rule (`listedAt` in `packages/schema/src/scope.ts`). A press report or a forum post about a company is not its document. `kind` is `provident-manager`, `bank`, `broker`, `foreign-broker`, `fund-manager`, `insurer`, `index-provider`, `exchange`, `regulator` or `other`. `scope_names` are the names the rule base writes (`{ name, only_records? }`; a name shared with another row carries `only_records` on every row but one). The company's page is `/companies/<cma_legal_id>` for a managing company, else `/companies/<fees_id>` or `/companies/<deposit_bank_id>` for a bank or broker the site has a page for; a row with none of these has no page, and its terms are listed on `/companies` under "companies with no page here".
- **The brands** `data/sources/brands.json` (added 2026-10-26, D33): one row per group the site shows as one company, `{ id, name_he, members, fund_managers, note? }`. `members` are registry ids, each in one brand at most; `fund_managers` are the `manager` strings of the fund records under `data/funds/` whose funds the brand's page lists. The page's address is the members' CMA id when one is in the CMA data (so track addresses do not change), else the broker's snapshot id, else the brand's id; every member's CMA, snapshot and deposit id and the brand's id show the same page. The validator fails a member missing from the registry, a member in two brands, a repeated id, and a fund manager no fund record names.

### 3.2 `data/parameters/` — site parameters (N1)

```json
{
  "id": "tie-threshold",
  "method_id": "P-01",
  "value": { "value": 2, "unit": "pct", "state": "sourced", "source": { "url": "docs/parameters-rationale.md#tie-threshold", "title": "Founder rationale", "publisher": "founder", "strength": "primary" }, "checked": "2026-10-22", "effective_from": "2026-10-22", "effective_to": null, "update_rule": "founder" },
  "rationale": "text the page shows under 'site parameter'",
  "signed_off_by": "founder",
  "signed_off_on": "2026-10-22",
  "shown_as": "site parameter"
}
```

An optional `rationale_he` (string) holds the Hebrew version of `rationale` for the page (added 2026-10-23). It is the file's general line: what the whole parameter is and why the site sets it.

**A line for each number (added 2026-10-25).** Every value object inside a parameter file (an input, a slider bound, a table cell, a preset field, a bound of the sensitivity test) may carry its own optional `rationale_he` (string, plain Hebrew, one or two sentences, `valueObject` in `packages/schema/src/value.ts`). The number's sheet shows that line first, and the file's general `rationale_he` only behind "עוד על הפרמטר"; a number with no line of its own shows the file's line directly. **What the reader text may say:** what the number is, what it is used for, and, when the site chose it, that it is a round starting value or a judgement, not a measured average, a forecast or a rule. **What it may not say:** who chose it ("Claude"), that the founder has not approved it, test scenarios, audit ids, a history of earlier values or a repair; all of that stays in `docs/parameters-rationale.md`. A digit that repeats the number is avoided too, because the sheet shows the number above the line and a copy drifts when the value changes. A saved comparison does not see these lines: `parameterVersions` (`packages/engine/src/compare/revisit.ts`) leaves them out, so editing a line is never a "parameter changed" on a revisit.

`sensitivity-bounds` (P-02) holds one entry per assumption ID (`A-01` ...) with `lo` and `hi` value objects. `fee-verdict-thresholds` (P-03) holds `negotiate_nis`, `avoid_nis`, `negotiate_share`. `classification-fit` (P-04) holds an array of `{ "classification": "<CMA value, exact spelling>", "horizon_min_years", "horizon_max_years", "max_fall_pct" }`. `illustrative-scenario` (P-05) holds `inputs` (`amount_now`, `monthly_deposit`, `horizon_years`, `A-01`, `A-02`, `cash_rate`, and the optional `annual_income`, `nis`, read only by runs that need an income) and `sliders` (`min`, `max`, `step` for the monthly deposit and the years). It also holds `instruments` (added 2026-10-23, typed in `parameterRecord`): a map from wrapper id to the data records of the representative instrument the guide page's illustrative run takes its terms from, each key naming a record by id: `deposit_terms` (a `data/terms/deposits/` id; deposit family), `fund` (a `data/funds/` id) and `tariff` (a `data/fees/` provider id whose `list` lines are the tariff) for the securities family, `ira_fees` (a fees provider id; only `ira-hishtalmut`), `tariff` alone for `makam`, and `tariff` with `series_rule` (a `data/rules/` GOV rule id) for `government-bond`. `track` (a CMA `fund_id`; added 2026-10-23) is for a provident-family wrapper that no managing company publishes a list fee for (today `keren-hishtalmut`, track `880`): the run takes the track's `avg_annual_management_fee` and `avg_deposit_fee` (§3.13) as its balance and deposit fees, labelled as an average actually charged, not a list price. `current-account` names a `deposit_terms` record whose `term_months` may be null (no term; the run uses the ledger's month-to-month balance). The two money-market wrappers read no tariff line (`tariff` stays, unread): their trade and custody lines are 0 under MF-26 and BANK-18. A wrapper with no entry has no timeline on its guide page, and the build logs which input is missing. The validator checks that every id the map names exists, and that a `track` is a `fund_id` of the latest period in `data/cma/` (§4). The mapping is in `docs/method.md` §2.4 "Instrument terms". `golden-tolerance` (P-06) holds `abs_nis` and `rel_pct`. The values are the founder's (`docs/parameters-rationale.md`).

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
  "open_questions": ["TXK-OQ2", "TXK-OQ3"],
  "checked": "2026-10-22"
}
```

- `tax_*.formula` points to `docs/method.md`; `blocked_by` lists open-question IDs; when non-empty the engine applies B3.
- `dimensions` is computed from `rule_ids` at build time (product.md 3.3) and stored for display; a hand edit is not allowed.
- `company_terms` (optional, added 2026-10-26, D30): a property each company sets for itself, as a map from dimension id to the `institution` or `unsettled` rule records that hold the companies' own terms (`{ "fee-fx": ["BRK-23"] }`). An entry is a record id when the record names one company, or `{ "rule": "BRK-28", "companies": ["meitav-trade", "fair"] }` naming the companies whose own term on the property the record states (review round 3, 2026-10-26: BRK-28 gives an opening minimum for Meitav Trade and Fair, not for Leumi or Psagot); since round 4 a record that names several companies is always written this way, even when it states the property for all of them. The guide's checklist and fee rows say "תלוי בחברה" there and link to those companies' pages. They are not `rule_ids`: a wrapper is a product context and cites general rules only, and a company's term marks no dimension.
- `lawful_exit.kind` is a string with this vocabulary: `any_time`, `at_maturity`, `after_years`, `at_age`, `at_child_age`, `trading_day`. Besides `payout_business_days`, a record may carry `years`, `age`, `term_months` (each a value object) and `text` (the condition in plain words). The object stays strict (added 2026-10-23).
- A closed wrapper (for example after a future merger of wrappers, D6) keeps its record with `effective_to` set.
- The schema is `wrapperRecord` in `packages/schema` (added 2026-10-23). It is strict: a field not named above is an error. Which fields become a run's inputs is in `docs/method.md` §2.4.

### 3.3a `data/instruments/securities/` — one record per security held in a wrapper (D6, amended 2026-10-26)

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

The schema is `exposureRecord` in `packages/schema` (strict). `id` is lowercase kebab. `kind` is one of `equity_index`, `bond_index`, `cash_like`, `mixed`, `commodity`, `other`. `currency` is an ISO 4217 code. Optional `wrapper_ids` lists the products that can hold the exposure (the link had no home before 2026-10-23); since 2026-10-26 these are product IDs: `brokerage-account` means "through a fund in a securities account", a security ID (`makam`, `government-bond`) means "bought directly", and the makam exposure no longer lists `brokerage-account`, because holding makam directly in the account is the `makam` security record; optional `rule_ids` and `open_questions` list rule and open-question IDs. A `variants` entry `fund:<id>` must be the `id` of a record under `data/funds/` once that folder has files (validator).

**2026-10-29 (index page).** `other_currencies` (optional boolean): `true` when the index holds shares priced in currencies other than `currency` (MSCI World and ACWI: 23 or 47 countries, ETF-48). A fund that neutralises `currency` keeps the others, against it; the labels say so. Left out for a one-currency index.

**2026-10-25 (invest page).** `constituents_israeli` (optional boolean, S5): `true` when the index is made of Israeli companies (TA-35, TA-90, TA-125), `false` when it is not (S&P 500, NASDAQ-100, MSCI World, MSCI ACWI). Left out for the cash and bond exposures and the general track, where the question has no meaning. The invest page reads it to decide which ways of owning the index exist (an Israeli index has only Israeli funds).

`one_line_he` (optional, added 2026-10-23) is the one Hebrew line on what the money is invested in, shown under the page's h1 and on the guide list.

For cash-like exposures `return_source.mode` is `series` and `series` names the `data/series/` ID (A-20 to A-24).

`variants` lists the funds that have a `data/funds/` record. It is not the candidate set: for Israeli funds and foreign funds traded on TASE the workbench takes every fund in the latest list in `data/fund-lists/` that matches the exposure (§3.14, method F-65, product D17), and a fund with no record here is shown as not evaluated.

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
    "fund_level_withholding_drag": { "value": 0.23, "unit": "pct_per_year", "state": "computed", "computed_from": { "formula": "A-11", "inputs": { "us_dividend_yield": "...", "us_ie_treaty_rate": "TXF-16" } } }
  },
  "dimensions": { "foreign-withholding-domicile": "covered", "tax-during": "blocked:TXF-OQ1", "estate-situs": "covered:TXF-27" },
  "prospectus": { "url": "...", "date": "2025-..." },
  "snapshot": "2026-10-22"
}
```

The schema is `fundRecord` (strict). `id` is lowercase ASCII, digits and hyphens, without a prefix; an exposure's `variants` names the record as `fund:<id>`, and the file is `funds/<id>@<snapshot>.json`. Each entry of `fees` is a value object or `null`. `distribution_policy` is `accumulating`, `distributing` or `null`; `tax_status.il_fund_tax_track` is `exempt`, `taxable` or `null`; `tax_status.tase_foreign_fund_90pct_test` is a value object or `null`. `dimensions` marks use the wrapper format (`covered`, `blocked:<OQ>`).

**2026-10-25 (invest page).** Three optional fields (S4), all left out when the record does not say:
- `replication: { method, source }`: how the fund follows its index. `method` is `physical` (holds the index securities), `swap` (unfunded swaps on the index), `futures` (futures on the index) or `mixed` (more than one of these as co-equal parts, for example swaps and futures, or the securities plus synthetic options). `source` is `{ url, page?, checked }`: the document that says so (the annual report or the factsheet), the PDF page that says it (never a printed page), and the date it was read. The Israeli records carry it from the sentence after `REPLICATION:` in `legal_form`; the iShares record from its factsheet ('Methodology: Physical Replication').
- `hedged` (boolean): `true` when the fund's name or its Maya record says the currency is neutralised (מנוטרלת מט"ח / דולר, currency-hedged). Left out, not `false`, when the record does not say.
- `share_price`: a value object in a currency unit (`usd`, `nis`, `eur`) with its own source and date: the price of one unit, which a per-share commission (`usd_per_share`) needs. No record carries it yet.

**2026-10-29 (index page, F-92).** `tracking_record` (optional): `{ years: [{ year, fund_pct, tracking_pct }], source, page, checked }`, the fund's return and its tracking asset's in each full calendar year its report prints, in percent, from the report named in `source` (the same document as `fees.tracking_difference_12m`; `page` is the PDF page when the notes name it, else null). A part year is left out, and a fund with no full year has no field. The values are the report's own figures; the gap and A-07 are computed (F-92), never stored.

Israeli funds (Maya export, CAT-34, TXS-24) add `il_fund_tax_track` (`exempt` or `taxable`, MF/TXS), the exposure code (MF-54, field `exposure_code`), `distribution_fee_type` (MF-24) and `creation_redemption_fee_category` (ETF-05); the last three are optional strings.

### 3.6 `data/fees/` — provider tariffs, dated snapshots (dependency 5)

One file per provider per snapshot: `fees/<provider-id>@<date>.json`. A line's `band` is the tariff's own text for a plan or sub-class; `band: null` is the standard line, which F-63 prefers, and a plan line is read only when the person names the plan. A bonds-only line uses `applies_to: ["tase_bonds"]`. A conversion line printed for one currency carries `conversion_currency` (ISO code, 2026-10-31): it prices a fund in that currency, and a line without one prices the others (F-13).

A value's `source` here may also carry its exact place (issue 19, 2026-10-31), both optional: `page`, the file's own page of a PDF (the document library's count, not the number printed on the sheet), and `quote`, the document's own words that carry the value, at most 240 characters. A web page has only `quote`. A value gets them only when its own line was read on that page; no `page` means not yet confirmed, not absent from the document. The same two fields may sit on an `availability` entry's `source`. They are read by nothing on the site yet.

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

- **2026-10-25 (invest page).** Foreign brokers (S1 to S3):
  - `provider.class` takes `foreign_broker`, and `provider.regulator` takes `foreign` (they go together; the validator fails one without the other). `provider.regulator_foreign: { name, name_he, country }` is required exactly when `regulator` is `foreign` and names the supervisor (for Interactive Israel, CySEC in Cyprus).
  - A fee line takes an optional `cap` value object (unit `pct_of_trade`): a ceiling as a share of the trade value. Commission = min(cap x trade value, max(`min`, `rate` x base)); a cap below the minimum wins. A per-share line has `rate` in `usd_per_share` and `min` and `max` in `usd_per_trade` (or `gbp_per_trade`).
  - (2026-10-31) A fee line takes an optional `flat_up_to: { amount, up_to }`, two value objects: an order up to `up_to` pays `amount`; a larger order pays the line's rate, minimum and maximum.
  - The snapshot takes an optional `availability: [{ applies_to, available, source: { url, title, checked }, note? }]`. `applies_to` lists instrument classes (the security types of this section, `all` included), and a class appears in at most one entry. `available: false` is a sourced statement that a private client cannot buy that class there (Interactive Israel and TASE securities: 'ללקוחות מוסדיים בלבד'); `true` is a sourced statement that it can. With no entry for a class, availability is derived as before: it is available when a trade line applies. A class the source does not settle gets no entry ("not found" is not "not available").
  - **Who pays, what it covers, what was left out (founder, 2026-10-31).** `available` may also be `"unknown"`, with `reason_he` for the row: the documents leave it open, so the kind of holding is not priced. A bank's or broker's record must carry `price_for_he` (who pays) and `left_out` (`[{ what, page?, why }]`, empty when nothing was found), and every kind of holding it prices needs an entry; an entry with `available: true` quotes the document's words naming that kind. `npm run validate` fails otherwise, and the ranking drops any kind of holding without such an entry.
  - **Group prices (founder, 2026-10-31, D43).** A bank's or broker's snapshot must carry `groups: { state, note, row_he?, read: [{ url, title, read_in? }], entries }`. `state` is `prices`, `none_on_securities` (a group annex with no securities row), `no_mention` (what was read names no group) or `not_read`. An entry is `{ kind, name_he, who_he, who_source, ends_printed, ends_he, ends_source?, prices, inferred? }`; a price is `{ fee, price_he, holdings_he, names_fund, source }`; a source is `{ url, title, page?, row?, quote }`. `holdings_he` is the document's words, and `names_fund` must agree with them. `row_he` is the line under the house's row: in every "X% במקום Y%" in it, Y must be a rate on a line of the same fee and X must stand in an entry. Words after "למעט" take funds out of `names_fund`. The calculation reads none of this.
- `level` is `list`, `regulator_average`, `tase_average` or `entered` (D4). An `entered` line is never stored under `data/`; it lives in saved state with the same shape.
- A provider whose tariff could not be obtained has `missing: true` and `missing_reason` (for example "PDF not located, BRK OQ18"), and no `lines`; the workbench shows the row as "not comparable, data missing".
- Provident and pension managers use the same file with `base: deposit`, `base: balance`, `base: direct_expenses` lines per track (`track_id` = CMA fund number), the discount period (`discount_months`, A-19) and the list fee the discount reverts to.
- Non-bank extra lines (BRK-24) use `fixed_period` (monthly fee), `distribution_handling`, `spread`.

### 3.7 `data/terms/deposits/` — deposit and savings-plan product terms (BANK, BPN)

One file per bank per product per snapshot.

```json
{
  "id": "discount-pikadon-shavui",
  "bank": "discount",
  "names": { "447": ["פיקדון שבועי"], "app": [], "ad": [], "abbrev": ["פז\"ק"] },
  "type_447": "פיקדון שבועי",
  "wrapper_id": "bank-deposit",
  "term_months": { "value": 0.25, "unit": "months", "...": "value object" },
  "rate_type": "variable",
  "anchor": "prime", "spread": { "value": -1.5, "unit": "pct_per_year", "...": "value object" },
  "rate_offered": { "value": 3.25, "unit": "pct_per_year", "notes": "nominal annual, before tax (BANK-13)", "...": "value object" },
  "linkage": "none",
  "tax_bucket": { "value": "unlinked_15", "rule_ids": ["TXI-03", "TXI-04"], "...": "value object" },
  "amount_range": { "min": { "...": "value object" }, "max": null },
  "break": { "allowed": true, "penalty": "with_penalty", "mechanism_text": "..." , "rule_ids": ["BANK-06", "BANK-14"] },
  "exit_points": { "exists": false, "every_months": null },
  "auto_renew": { "value": true, "max_renewals": null },
  "conditions_he": "optional: a short plain-Hebrew summary of the conditions the bank prints for the rate",
  "doubt_he": "optional: one sentence on an open doubt about the record",
  "snapshot": "2026-10-22",
  "source": { "url": "...", "title": "Discount 447 concentrated publication", "publisher": "Discount Bank", "strength": "institution" }
}
```

The schema is `depositTerms` (strict). Enums: `rate_type` is `fixed` or `variable`; `linkage` is `none`, `cpi` or `fx`; `break.penalty` is `none`, `with_penalty` or `not_allowed`. `anchor` and `spread` are `null` or absent for a fixed rate. `exit_points.every_months` and `auto_renew.max_renewals` are numbers or `null`. The folder `terms/deposits/` is matched before `terms/`. **`conditions_he` and `doubt_he` (added 2026-10-25, the current-account page).** Both are optional plain Hebrew strings. `conditions_he` summarises the conditions the bank prints for the rate (who gets it, on what balance, how often it is paid); it is faithful to the printed text quoted in the notes of `rate_offered` and adds nothing that is not printed. A bank that pays nothing gets the sentence it prints ("לא מוצעת ריבית…"). `doubt_he` is one sentence on an open doubt the researcher found (the printed rate and its conditions disagree, a stated end date has passed); the page shows it beside the figure with the caution mark, and the doubt stays out of the rate itself. A current-account record with `amount_range.max` is read as the balance that earns the rate (BANK-09, F-26). The page of the current account reads every `wrapper_id: "current-account"` record: the most common `rate_offered` among them is the default (F-85).

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

The schema is `seriesRecord` (strict; `packages/schema/src/collections/series.ts`). `terms_of_use.status` is `confirmed`, `unconfirmed` or `not-permitted`; the validator fails any series file whose status is not `confirmed` ("terms gate: not shipped", architecture 3.3), so a series the publisher's terms do not allow is never committed. `terms_of_use` has `fallback` (required) and optional `terms_url`, `read_on` and `attribution` (the attribution line the licence prescribes, shown next to the numbers). `cadence` is `daily`, `monthly` or `on change`; `stale_after_days` is an integer; `unit` comes from §2 (`index_points` for an index, `pct_per_year` for rates). Optional `notes` says what the base period or a value means and how the file is thinned; optional `raw` (`archive_key`, `sha256`) is the evidence of the latest download that changed the file. Each observation is a value object with `date` (a full ISO date; a monthly index uses the first day of its month, with `effective_to` the last day) and, for a series that holds several (a multi-key series such as bank rates by plan), an optional `key` string, unique per `date`. The validator checks that observations are sorted by `date` then `key`, with no two the same, and that every `rule_ids` entry is in the rule base. Written by the pipeline (`npm run refresh -- cbs-cpi mof-child-savings`): `cbs-cpi` (id `cbs-cpi`, the general CPI, base 2024 average = 100 from 2025-01) and `mof-child-savings-rates` (key `<bank>|<plan>|<age>|<saving period>|<metric>`, thinned to first, changes and latest per key, latest 14 months). No adapter exists for the Bank of Israel series: their terms do not permit republication (status `not-permitted`).

Required series for the method: `boi-policy-rate` (A-20); `bank-deposit-rate-avg-<bank>-<term>` from INTEREST_DASH (A-21); `makam-yield-<months>` (A-22); `gov-bond-yield-<type>-<years>` and auction coupons (A-23); `cpi` (F-03 history); `fx-usd-nis` and others (A-03 start value); `cpi-expectations` (A-02, **not yet sourced**, G-01); `mof-child-savings-rates` (CS-10, CS-22, CS-23; current, corrected 2026-10-23); `average-wage` (TXP-03, PEN-04; NII publication not reached, PEN OQ5).

### 3.9 `data/averages/` — regulator averages not tied to one provider

ISA category averages (MF-18, MF-19, ETF-17), CMA fee averages per track (from the monthly CMA files), the Comptroller's figures where used. Same value-object shape, with `category` and `period`.

### 3.10 `data/catalog/` — institution-facing names (3.10)

Names the CMA data and the Maya export do not hold: an institution's own name for a product or track where it differs from the regulator's name, and bank deposit and savings-plan products. One entry per name and institution.

```json
{
  "id": "meitav-kaspi-shikli",
  "institution": "meitav",
  "where_seen": "Meitav operations flyer (פלייר תפעולי), https://www.meitav.co.il/media/0lhfrzgy/פלייר-תפעולי-מונגש.pdf",
  "seen_on": "2026-10-22",
  "seen_by": "il-finance CAT-11, CAT-13",
  "names": { "he": ["כספי (שיקלי)"] },
  "maps_to": { "wrapper_id": "kupat-gemel-lehashkaa", "cma_fund_id": 7857, "track_ids": [7861] },
  "near_duplicates": [],
  "status": "catalogued | not-catalogued-yet"
}
```

- The schema is `catalogEntry` (strict, optional `notes`). `status` is `catalogued` or `not-catalogued-yet`. `near_duplicates` is an array of `{ name, track_ids, resolution }`. Optional `default_at_joining` (boolean) is the institution's own statement that this is the track a joiner gets without choosing; the track page shows the "ברירת המחדל" tag from it. `cma_fund_id` is the fund (קופה) number as the institution's documents and the CMA transfer directory give it (CAT-09); the monthly datasets list tracks, not funds, so the validator checks only that every `track_ids` entry is a `fund_id` in the latest file of a `data/cma/` dataset (§4 item 10).
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

`where` entries come from `statement`, `bank-statement`, `payslip`, `app`, `ad`, `law`, `form`, `bylaws`, `gemel-net`, `prospectus`, `tariff`, `fund-name`, `tax-form`, `pensia-net`, `provider-site`; the last six were added 2026-10-23 (a fund prospectus, a provider tariff, a fund's name, a tax form such as form 106 or 867, the pension-net site, a provider's site or rate table). Optional `exposure_ids` lists the exposure records the term belongs to (ids as in §3.4), next to `wrapper_ids` for guide pages. `en` may be `null`. Payslip labels carry `strength: institution` and `seen_by` (G-19). `source` here is the `source` block of a value object plus `checked`, not a full value object.

`dimensions/<id>.json` (schema `dimensionRecord`, strict): `{ "id": "tax-at-exit", "he": "...", "one_line": "...", "source": { ...as above }, "rule_ids": [...] }`. `id` is one of the 26 rows of `docs/glossary.md` section 2 (an enum in the schema). The list is hand-maintained; the marks are computed.

### 3.12 (removed)

§3.12 removed 2026-10-24, D24.

### 3.13 `data/cma/` — CMA fund and track records (3.10, F-64, F-70, 3.6)

Added 2026-10-22 (approved by the founder, `docs/architecture.md` gap 8.1). One file per dataset per report period, written by the pipeline: `cma/<dataset>@<YYYY-MM>.json`, where `dataset` is `gemelnet` (provident, hishtalmut, gemel lehashkaa, child savings) or `pensia-net` (pension). The latest period is the one the catalogue and the track workbench read.

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
      }
    }
  ]
}
```

- Text fields are stored exactly as the source spells them (§1, Hebrew), after decoding the CSV from Windows-1255.
- Identity, names, manager and classification serve the catalogue (3.10) and the fit mark (F-70), the two fee fields the track workbench (F-64), and the amounts of `holdings` the stock and currency exposure shares (F-87, F-88). **Kept columns (2026-10-26, the founder: "for future use").** `raw_fields` also keeps, as received and only when the file has them, `FOREIGN_EXPOSURE`, `LIQUID_ASSETS_PERCENT`, `DEPOSITS`, `MONTHLY_DEPOSITS`, `WITHDRAWLS`, `INTERNAL_TRANSFERS`, `NET_MONTHLY_DEPOSITS`, `MONTHLY_YIELD`, `YEAR_TO_DATE_YIELD`, `YIELD_TRAILING_3_YRS`, `YIELD_TRAILING_5_YRS`, `AVG_ANNUAL_YIELD_TRAILING_3YRS`, `AVG_ANNUAL_YIELD_TRAILING_5YRS`, `STANDARD_DEVIATION`, `ALPHA` and `SHARPE_RATIO` (the adapter's `KEPT_COLUMNS`). No page reads them and none has a value object; a capability that shows one first adds its value object beside `fees` and `holdings`, with its unit from the dictionary (CAT-03), and a past return stays history, never a ranking key (product.md section 2). The refresh diff compares them, so a change writes the file.
- **Holdings (2026-10-26, D34, F-87, F-88).** Optional: a file written before 2026-10-26 has none, and the adapter writes it only when the CSV has `TOTAL_ASSETS`, `STOCK_MARKET_EXPOSURE` or `FOREIGN_CURRENCY_EXPOSURE`. `total_assets`, `stock_market_exposure` and `foreign_currency_exposure` (optional: only when the CSV has the column) are value objects in `nis_millions` at the end of the report period: `effective_from` and `effective_to` are the period's first and last day, `rule_ids` is `CAT-24`, `state` is `sourced`, `source` is the dataset source with the field name in the title. The unit of `TOTAL_ASSETS` is the dictionary's (CAT-03); those of `STOCK_MARKET_EXPOSURE` and `FOREIGN_CURRENCY_EXPOSURE` are read the same way, which the dictionary does not state (CAT OQ4), and the note says so, and that the regulator does not publish whether the exposure counts derivatives or looks through the funds a track holds. An empty field is `value: null` with the note "לא דווח."; the site marks both stale by the monthly rule (`staleCma`).
- **Fee fields (definitions confirmed 2026-10-23, CAT-35 to CAT-39, CAT-06).** `raw_fields` keeps the two fields as received; `fees` is required and holds `avg_annual_management_fee` (unit `pct_per_year`, from `AVG_ANNUAL_MANAGEMENT_FEE`) and `avg_deposit_fee` (unit `pct_of_deposit`, from `AVG_DEPOSIT_FEE`) as value objects. Both are percent (0.61 is 0.61%). Each is the average fee actually charged from all members, after discounts, over the last completed calendar year, so a row of report year Y holds the Y−1 average (CAT-36, CAT-37): `effective_from`/`effective_to` are 1 January and 31 December of Y−1, `tax_year` is `null`, `update_rule` is `market`, `state` is `sourced`, `checked` is the file's `checked`, and `source` is the dataset source with the field name in the title. `rule_ids` are `CAT-35`, `CAT-36`, `CAT-37`, `CAT-06` (pensia-net adds `CAT-39`: the pair is per fund, every track of a fund carries the fund's values). An empty raw field gives `value: null` with `notes` starting "לא דווח" and the reason (no full calendar year yet, or unknown, CAT OQ22); empty is not zero, and zero is a reported 0.00%. An empty `AVG_DEPOSIT_FEE` of a product type whose fee regulation has no deposit-fee item (study funds, central severance funds and other-purpose funds by `fund_classification`, and IRA funds by a name with "בניהול אישי" or "IRA", IRA-03) gets a note that starts "אין דמי ניהול מהפקדה" instead of "לא דווח" and adds `PF-06` to `rule_ids`: the value stays `null` as reported, and the site reads it as no fee (2026-10-27). A negative value is kept as reported, with a note (it can be a refund, CAT-40). The weighting of the average (by assets or by members) is not published and stays open (CAT OQ2, OQ23): the site says "ממוצע" and the year, never "משוקלל". The site marks the figure stale when the previous calendar year is older than the fee's year (`staleCmaFee`), not by the monthly rule.

---

### 3.14 `data/fund-lists/` — the fund lists (3.4 fund variants, 3.10, product D17)

Added 2026-10-23 for product D17. One file per list per save, saved by hand each month because the pages block scripts:

- `fund-lists/maya-mutual-funds@<YYYY-MM-DD>.json`, from the export of TASE's Maya fund list (CAT-33, CAT-34): the Israeli open-end funds (mutual funds, tracking funds and money-market funds).
- `fund-lists/tase-foreign-funds@<YYYY-MM-DD>.json`, from TASE's list of foreign funds traded on TASE (ETF-32): fund number, name, manager, classification and reference index, in the same shape with the fields that list has.

Together they are the set of funds the workbench chooses from (method F-65, F-83) and that a fund manager's catalogue page lists. The Maya file:

```json
{
  "export": "maya-mutual-funds",
  "exported_on": "2026-10-22",
  "source": { "url": "https://maya.tase.co.il/he/funds/mutual-funds", "checked": "2026-10-22", "strength": "primary" },
  "funds": [
    {
      "fund_number": "<as in the export>",
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

- Only the fields the catalogue, the candidate set (F-65 matches on classification and reference asset) and the fee comparison use are kept; prices and returns are not, since the site does not rank by past return (product.md section 4).
- **Schema shape (2026-10-23).** The checked schema is `fundListFile` (`packages/schema/src/collections/fund-lists.ts`), strict: `list` (`maya-mutual-funds` or `tase-foreign-funds`), `snapshot` (the save date, equal to the `@<date>` in the file name; replaces `export`/`exported_on`), `source` (as §2), `checked`, `terms_of_use` (as the series schema, §3.8), `raw {archive_key, sha256}` and `funds[]` with the row fields above, plus `isin` (null where the list prints none); `exposure_code` and `tax_status` are null where the list prints none. The validator fails a file whose `terms_of_use.status` is not `confirmed` ("terms gate: not shipped"), whose name differs from `<list>@<snapshot>.json`, or that repeats a `fund_number`. An exposure's `fund:<id>` variants resolve against `data/funds/` only, never against these lists.
- Republishing terms are not confirmed (product.md dependency 7). Until they are, the lists are used to build the candidate set and counts, and the pages link to the source for the list itself.

### 3.15 `data/open-questions.json` — the open questions of the rule base (added 2026-10-26)

One file, an array with one entry per numbered item of the "## Open questions" section of every rule-base file (`.claude/skills/il-finance/references/*.md`), in file order:

```json
[
  { "id": "TXP OQ3", "status": "closed", "closed_on": "2026-10-26", "title_he": "<one short line: what was unknown>" },
  { "id": "PEN OQ7", "status": "narrowed", "title_he": "<what is unknown>", "blocks_he": "<what on the site waits for it>" },
  { "id": "BANK OQ1", "status": "open" }
]
```

- `id` is the code the site uses: the file's prefix from the references README's file table, a space, `OQ` and the item's number. Guide records write the same question as `TXP-OQ3` (§3.3).
- `status`: `closed` when the item starts struck in the rule base's format, `~~…~~ Closed <date>`, with `closed_on` that date (set exactly when the status is `closed`); otherwise `open` or `narrowed`. The markdown does not mark narrowing, so the file keeps the status it has, and a new id takes the class of the open-questions audit (research/knowledge/2026-10-26-open-questions/merged.json) when there is one.
- `title_he` (one short Hebrew line, what is unknown, in plain words) and `blocks_he` (what on the site waits for the answer, only where something does) are written by hand; every question the site names has them. The question sheet shows them.
- Generated by `npm run gen:open-questions -w @finance-tool/pipeline` (`packages/pipeline/scripts/gen-open-questions.ts`), which keeps the hand-written fields and prints any id that left the markdown with its Hebrew. The schema is `openQuestionsFile` in `packages/schema`, strict.
- A closed question is never named as open on the site: the validator fails a guide record that lists one (§4 item 13), and the kit guard (`site/app/components/kit/guards.test.ts`) fails a content file, `copy.ts` or the playbook's step list that names one. The not-covered page shows closures on purpose.

## 4. Validation (run before every build)

1. Every value object has `source.url`, `checked`, `effective_from`, `unit`, `state`.
2. Every `rule_ids` entry exists in `il-finance`; every `data/rules/` file has a matching rule heading.
3. No `strength: open` rule has `figures`.
4. Every tax figure has `tax_year`; a run in year `y` finds a figure for `y` or stops with "figure not updated".
5. Every fee line has a `base` in the vocabulary and `applies_to`.
6. Every wrapper record's `tax_at_exit.formula` exists in `docs/method.md`.
7. Every series file's last observation is within `stale_after_days`, else the page shows the stale flag (D3).
8. Every `data/funds/` record names its `exposure_id` and its `exposure_id` lists it under `variants`.
9. Dimension marks in wrappers, securities and funds are regenerated from `rule_ids`, never edited by hand. A security's `held_in.rule_ids` may cover a mark but do not require one (2026-10-26).
10. Every `track_ids` entry in `data/catalog/` exists in the latest `data/cma/` period of its dataset; one that has disappeared is reported, not silently dropped. `cma_fund_id` is the fund number (CAT-09), which the track datasets do not list, so it is not checked against them.
11. Every Israeli fund and every foreign fund traded on TASE in `data/funds/` has its fund number in the latest matching list in `data/fund-lists/`; one that has disappeared is reported, not silently dropped.
12. Rule sources (added 2026-10-24). Fails: a rule has neither `sources` nor `sources_missing_reason` (a warning only while no record carries either); a `he.wikisource.org` or `nevo.co.il` source is `primary`; `mirror_host` is set exactly when `strength` is `primary-mirror`; `page` on a URL that is not a PDF (path ends `.pdf` or contains `BlobFolder`); `anchor` on a PDF; a `sources[].url` is not in the rule's markdown block verbatim (or as the rewrite of a raw Wikisource URL that is); a `derived_from` id has no record; a `data/parameters/pinned-rules.json` id has no record, or a row's first rule has no `primary` or `primary-mirror` source; a row's `answer_he` (the questions page, 2026-10-24 late evening) carries a digit outside a `{ID:figure}` slot, or a slot names a rule outside the row or a figure that rule does not have. Warns (printed, not failing): the rule's `strength` differs from its strongest source (`open` excepted); a source `checked` later than the rule's; the first source lacks `publisher_he` or `title_he`; `recheck_date` has passed; a rule's latest `tax_year` is behind the current year.
13. Open questions (added 2026-10-26, §3.15). Fails: `data/open-questions.json` breaks its schema; a guide record under `data/instruments/` lists in `open_questions` or `blocked_by`, or marks a dimension `blocked:` on, a question the file has as `closed`. Warns: the file is behind the rule base (an id missing or extra, or a closure the file and the markdown do not agree on).
14. Scope (added 2026-10-26, D30; `packages/pipeline/src/scope.ts`). Fails: a rule has no `scope` (the schema), or `institution` without `scope_institutions`, or `scope_settle` on any scope but `unsettled`; the record's scope differs from its rule-base Scope line, or the line names a company the registry does not resolve; a `scope_institutions` id is not in the registry or carries another `name_he`; a `general` rule's first source is a company's document (`institution_doc`, or strength `institution`), or is neither a general kind (law, regulation, circular, regulator page, official PDF, exchange rule, dataset) nor another official text of strength `primary` or `primary-mirror` (a court ruling, a government form); a P-09 question row or "שווה לדעת" block holds a rule that is not general; a wrapper cites a rule that is not general in any `rule_ids`, or holds a value whose `source.strength` is `institution`, or names in `company_terms` a general rule or one that does not carry the dimension; an exposure cites a rule that is not general, except the records `ownContextExposures` names for it (D31: ETF-37 to ETF-40 on `index-sp500`), each an index provider's own; a general rule's `derived_from` names a rule that is not general, or its `examples` name one that is; a record that is not general, and not a not-rule, cites no own document (`own_hosts`, `filing_names`) of a company it names; the registry repeats an id, gives a name two defaults, or names a CMA id, fee snapshot or deposit bank that does not exist. The records the rule base keeps that are not rules (`notRules` in `packages/schema/src/scope.ts`, from the scope settling requests §4) and are not general each name every file that cites them today (2026-10-26, review round 3): the validator reads every `rule_ids` under `data/` (but `data/rules` and `data/sources`: the wrappers, exposures, dimension records, glossary terms and the rest) and fails a not-rule cited in a data file its entry does not name, a named data file that is gone, and one that no longer cites it; the site test `site/app/lib/scope.test.ts` does the same for every source file under `site/app` (the comparison's MKT-01, the playbook's SW-X01 to SW-X04, SW-34, SW-37 and SW-53, the fees page's MF-55, the rules page's experience list). A general not-rule (SW-19, BANK-27 and the like) may stand anywhere, so its entry names no files. A `company_terms` entry `{ rule, companies }` names only companies whose section lists the record, and an entry whose record names several companies is written that way (a bare id would name them all). Warns: a general rule with no source to check; a glossary term citing a rule that is not general (its card shows only the general ones). The run prints the counts: `scope: 482 general, 101 institution, 13 unsettled` on 2026-10-26 (596 records, after the closed-questions records and the thirteen records the scope settling's new ids got).
