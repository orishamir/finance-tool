# Data schema: the format of every fee, term and rule figure under `data/`

Written 2026-10-22 by the financial modeler, for `docs/method.md`. Every number the engine reads comes from a file in one of the collections below. No value appears without a source URL and a checked date (CLAUDE.md standing rule, D3).

Status: **draft for founder review.** Nothing under `data/` exists yet; the first files are written by the data-researcher after this schema is approved.

---

## 1. Common rules

**Format.** One JSON file per record, UTF-8, under the collection's folder. JSON was chosen because the site is static and the engine runs in the browser (D1); the files are also readable by hand and diffable. YAML would be friendlier to write but needs a parser in the browser; CSV cannot carry the nested `source` and `fees` blocks.

**File name.** `<collection>/<id>.json`, where `id` is the record's `id` field: lowercase ASCII, digits and hyphens. Dated snapshots (tariffs, series, funds) add the snapshot date: `<id>@<YYYY-MM-DD>.json`. The latest snapshot is the one the engine reads; older ones stay for the change log and for revisit (F-82).

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

**Strength vocabulary** follows `il-finance` README and D10, with two additions: `primary-mirror` for law read on Wikisource or Nevo (coverage.md §0 item 1; it computes, labelled, until re-read on the official text), and `entered` for values the person typed, which never live under `data/` but share the same object shape in saved state (3.9).

**Dates and money.** Dates are `YYYY-MM-DD`. Money is in NIS unless `currency` says otherwise. Percentages are stored as numbers in percent (`1.05` means 1.05%), never as fractions, to match how every source prints them.

**Hebrew.** Any name an institution, regulator or statement uses is stored exactly as the source spells it, in a `names` block, so the catalogue (3.10) and term matching (3.1) can match strings.

---

## 2. Units and enumerations

Units: `nis`, `pct` (a share), `pct_per_year`, `pct_of_deposit`, `pct_of_trade`, `pct_of_balance_per_period`, `nis_per_month`, `nis_per_trade`, `nis_per_transfer`, `months`, `years`, `days`, `business_days`, `index_points`, `count`, `boolean`, `text`.

Fee bases (`fee.base`): `deposit`, `balance`, `trade`, `custody`, `fx`, `exit`, `fixed_period`, `distribution_handling`, `spread`, `creation_redemption`, `transfer_out`, `load`, `redemption_deduction`, `variable_management`, `trustee`, `direct_expenses`, `insurance_premium`.

Security types for tariff lines (`fee.applies_to`): `tase_shares_bonds`, `makam`, `foreign_securities`, `mutual_fund_units`, `money_market_units`, `etf_units`, `tase_foreign_fund_units`, `all`.

Provider classes (`provider.class`): `bank`, `tase_member_nonbank`, `foreign_broker`, `fund_manager`, `provident_manager`, `pension_manager`, `insurer`.

Wrapper IDs (`data/instruments/wrappers/`): `current-account`, `bank-deposit`, `savings-plan`, `money-market-fund-daily`, `money-market-fund-renewable`, `makam`, `government-bond`, `brokerage-account`, `kupat-gemel-lehashkaa`, `keren-hishtalmut`, `pension-comprehensive`, `pension-general`, `provident-for-annuity`, `child-savings-provident`, `child-savings-bank`, `ira-hishtalmut`, `ira-provident`. Tier-2 wrappers get IDs when they graduate (D2).

Exposure IDs (`data/instruments/exposures/`): `cash-nis`, `cash-fx`, `makam`, `gov-bond-unlinked`, `gov-bond-linked`, `index-<index-code>` (for example `index-sp500`, `index-ta125`), `track-<cma-classification>` for provident tracks, `general-track`.

Dimensions (`data/dimensions/`): the vocabulary in `il-finance` README (`tax-at-exit`, `fee-management-balance`, ...), plus any of the proposed additions the founder adopts (coverage.md F5).

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
- `strength: open` records exist (for the rules page and the blocked marks) but carry no `figures`.
- `recheck_date` is required for every rule on the "likely to change" list (product.md 3.8).
- Bracket tables (TXG-02, TXG-04) store `figures.brackets` as an ordered array of `{ "up_to": value object, "rate": value object }`.
- Conflicts (coverage.md §9) are recorded in `notes` on the figure and the engine uses the value the rule base says computes (for example TXI-11's 15%).

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

`sensitivity-bounds` (P-02) holds one entry per assumption ID (`A-01` ...) with `lo` and `hi` value objects. `fee-verdict-thresholds` (P-03) holds `negotiate_nis`, `avoid_nis`, `negotiate_share`. `classification-fit` (P-04) holds an array of `{ "classification": "<CMA value, exact spelling>", "horizon_min_years", "horizon_max_years", "max_fall_pct" }`. `illustrative-scenario` (P-05) holds the inputs by assumption ID. `golden-tolerance` (P-06) holds `abs_nis` and `rel_pct`. The values are the founder's; none is proposed here.

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
- A closed wrapper (for example after a future merger of wrappers, D6) keeps its record with `effective_to` set.

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
  "checked": "2026-10-22"
}
```

For cash-like exposures `return_source.mode` is `series` and `series` names the `data/series/` ID (A-20 to A-24).

`variants` lists the funds that have a `data/funds/` record. It is not the candidate set: for Israeli funds and foreign funds traded on TASE the workbench takes every fund in the latest list in `data/fund-lists/` that matches the exposure (§3.14, method F-65, product D17), and a fund with no record here is shown as not evaluated.

### 3.5 `data/funds/` — hand-collected fund details (dependency 6, N4)

One record per fund whose details have been collected. The set of Israeli funds and of foreign funds traded on TASE that the workbench chooses from is `data/fund-lists/` (§3.14); foreign-domiciled funds traded abroad exist only here, because no complete list of them was found (method G-29).

```json
{
  "id": "fund:ie00b5bmr087",
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

Israeli funds (Maya export, CAT-34, TXS-24) add `il_fund_tax_track` (`exempt` or `taxable`, MF/TXS), the exposure code (MF-54), `distribution_fee_type` (MF-24) and `creation_redemption_fee_category` (ETF-05).

### 3.6 `data/fees/` — provider tariffs, dated snapshots (dependency 5)

One file per provider per snapshot: `fees/<provider-id>@<date>.json`.

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
  "snapshot": "2026-10-22",
  "source": { "url": "...", "title": "Discount 447 concentrated publication", "publisher": "Discount Bank", "strength": "institution" }
}
```

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

Required series for the method: `boi-policy-rate` (A-20); `bank-deposit-rate-avg-<bank>-<term>` from INTEREST_DASH (A-21); `makam-yield-<months>` (A-22); `gov-bond-yield-<type>-<years>` and auction coupons (A-23); `cpi` (F-03 history); `fx-usd-nis` and others (A-03 start value); `cpi-expectations` (A-02, **not yet sourced**, G-01); `mof-child-savings-rates` (CS-23, stale, kept for the record); `average-wage` (TXP-03, PEN-04; NII publication not reached, PEN OQ5).

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

- `cma_fund_id` and `track_ids` are empty for a bank product; `maps_to` then names the wrapper and, once collected, the `data/terms/deposits/` record.
- `near_duplicates` records names that one institution uses for more than one product or track, with the resolution from the data, or "unresolved".

### 3.11 `data/terms/` — term matching (3.1) and `data/dimensions/` (3.3)

`terms/<id>.json`: `{ "he": "...", "en": "...", "meaning": "...", "where": ["statement", "payslip", "app", "law"], "wrapper_ids": [...], "source": value object }`. Payslip labels carry `strength: institution` and `seen_by` (G-19).

`dimensions/<id>.json`: `{ "id": "tax-at-exit", "he": "...", "one_line": "...", "source": value object, "rule_ids": [...] }`. The list is hand-maintained; the marks are computed.

### 3.12 `data/changelog.jsonl` — one line per change (3.8, 3.9)

```json
{ "date": "2026-10-22", "collection": "rules", "id": "TXS-09", "field": "figures.rate_on_real_gain", "old": null, "new": 25, "reason": "seeded from il-finance", "affects_rankings": true }
```

`affects_rankings` is `true` for rules, parameters, fee lines and series the engine reads, `false` for names and catalogue entries, so the revisit view (F-82) can tell a change that matters from one that does not.

### 3.13 `data/cma/` — CMA fund and track records (3.10, F-64, F-70, 3.6)

Added 2026-10-22 (approved by the founder, `docs/architecture.md` gap 8.1). One file per dataset per report period, written by the pipeline: `cma/<dataset>@<YYYY-MM>.json`, where `dataset` is `gemelnet` (provident, hishtalmut, gemel lehashkaa, child savings) or `pensia-net` (pension). The latest period is the one the catalogue and the track workbench read.

```json
{
  "dataset": "gemelnet",
  "report_period": "2026-09",
  "source": { "url": "https://data.gov.il/dataset/gemelnet", "title": "גמל נט, resource 2024-today", "publisher": "Capital Market, Insurance and Savings Authority (data.gov.il)", "strength": "primary" },
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
      "raw_fields": { "AVG_ANNUAL_MANAGEMENT_FEE": "<as received>", "AVG_DEPOSIT_FEE": "<as received>" },
      "fees": null
    }
  ]
}
```

- Text fields are stored exactly as the source spells them (§1, Hebrew), after decoding the CSV from Windows-1255.
- Only the fields a formula or capability uses are kept: identity, names, manager and classification for the catalogue (3.10) and the fit mark (F-70), and the two fee fields for the track workbench (F-64). Other CMA fields are added when a capability needs them.
- **Fee fields stay raw until their definitions are confirmed** (product.md dependency 4, discovery O11). Until then `raw_fields` holds them as received and `fees` is `null`, and the site shows names and classification only. Once confirmed, `fees` holds `avg_annual_management_fee` and `avg_deposit_fee` as value objects with their unit, and validation requires them.
- Change-log lines for fee fields carry `affects_rankings: true`; names and classification changes carry `false` (§3.12).

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
- Republishing terms are not confirmed (product.md dependency 7). Until they are, the lists are used to build the candidate set and counts, and the pages link to the source for the list itself.

## 4. Validation (run before every build)

1. Every value object has `source.url`, `checked`, `effective_from`, `unit`, `state`.
2. Every `rule_ids` entry exists in `il-finance`; every `data/rules/` file has a matching rule heading.
3. No `strength: open` rule has `figures`.
4. Every tax figure has `tax_year`; a run in year `y` finds a figure for `y` or stops with "figure not updated".
5. Every fee line has a `base` in the vocabulary and `applies_to`.
6. Every wrapper record's `tax_at_exit.formula` exists in `docs/method.md`.
7. Every series file's last observation is within `stale_after_days`, else the page shows the stale flag (D3).
8. Every `data/funds/` record names its `exposure_id` and its `exposure_id` lists it under `variants`.
9. Dimension marks in wrappers and funds are regenerated from `rule_ids`, never edited by hand.
10. Every `cma_fund_id` and `track_ids` entry in `data/catalog/` exists in the latest `data/cma/` period of its dataset; one that has disappeared is reported, not silently dropped.
11. Every Israeli fund and every foreign fund traded on TASE in `data/funds/` has its fund number in the latest matching list in `data/fund-lists/`; one that has disappeared is reported, not silently dropped.
