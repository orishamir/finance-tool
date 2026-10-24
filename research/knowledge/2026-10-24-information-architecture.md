# Information architecture of the knowledge layer: inventory, importance signal, grouping, verify-field audit

Written 2026-10-24 (night) by the information-architecture agent for the lead's synthesis. Read-only: no number on the site was verified, no site code was touched. The companion file `2026-10-24-rule-signals.csv` (500 rows, one per rule) holds every signal this report quotes. The scripts that produced it (`signals.py`, `score.py`) ran in the session scratchpad and are not in the repository; everything they compute is reproducible from the description in section 2.1.

What was read: `CLAUDE.md`, `docs/product.md` (D2, 3.8), `docs/flows.md` 6.9 and 6.14, `docs/copy.md` 3.14 and section 10 (the Hebrew style guide), `docs/data-inventory.md`, `research/discovery/ux-landscape.md` sections 3 and 4, `research/discovery/tax-landscape.md` section 10, `site/app/routes/rules.tsx`, `site/app/copy.ts` (`rulesPage`), every file under `data/`, the 30 reference files of `.claude/skills/il-finance/references/`, and the rule ids that `site/app` and `packages/engine/src` mention.

---

## 1. Inventory: what there is to browse

| Collection | Count | What a record holds | In the knowledge layer? | Form |
|---|---|---|---|---|
| `data/rules/` | **500** | id, English and Hebrew title, `text_he` (plain-Hebrew rule, median 419 characters, longest 891), strength, dimensions, likely-to-change flag, re-check date, figures with per-figure source, `il_finance_file` | **Yes, the core** | A card per rule (today's rule card of flows 6.9), inside the groups of section 3; the 214 rules with figures also show the figure as a number with its source tag |
| Rules in the skill only | **360** (860 headings in the `.md` files minus the 500 records) | Same structure in markdown, no JSON record, so no card on the site | Not today | Nothing until a record exists. By prefix: TXA 26, CORP 25, CAT 25, INS 24, RG 23, MGD 23, TXG 21, MF 18, FXD 17, TX2 16, TXP 13, REG 12, BPN 12, BANK 12, PF 11, KGL 11, BRK 11, TXK 9, TXH 8, TXF 8, TXI 7, ETF 7, PEN 5, KH 5, IRA 5, CS 5, TXS 1. Four fifths of the tier-2 rules (CORP, INS, RG, MGD, FXD) and a fifth of the tier-1 ones are in this state. The record exists today only when a wrapper, exposure, term, dimension or figure cites the rule (`docs/data-inventory.md` row 1). Whether the other 360 should become records is a decision for the lead; see section 5 |
| `data/parameters/` | 8 (P-01 to P-08) | value, rationale in Hebrew, founder sign-off date, where used | Yes, already a page | Keep the parameters page; link to it from the knowledge layer as "החלטות של האתר, לא כללים" so a reader sees the line between a law and a site judgement |
| `data/fees/` | 20 snapshots, 17 providers (3 providers keep a 2026-10-23 "missing" record beside a 2026-10-24 one) | provider, tariff URL and date, 12 to 20 fee lines each with base, level, rate, source | Yes, as evidence behind the fee pages | A table row per provider (name, tariff date, link to the tariff, count of lines, "missing" state for Meitav Trade and Phoenix); the lines themselves stay on the fee page and the provider workbench, which already render them |
| `data/funds/` | 12 (11 Israeli, 1 Irish) | names, TASE number or ISIN, manager, domicile, legal form, exposure, currency, distribution policy, tax status, fee layers with source, prospectus | Yes | A row per fund (name, number, exposure, three fee figures, source date) on the fund-variant page that already exists; in the knowledge layer only a count with a link ("12 קרנות שהאתר קרא את התשקיף שלהן") |
| `data/terms/deposits/` | 3 (Leumi) | product names as the bank prints them, term, rate type, rate offered, exit points, each with source | Yes | A row per product on the bank page (exists); in the knowledge layer a count with a link |
| `data/series/` | 2 (CBS CPI, MoF child-savings rates) | publisher, flow, cadence, terms of use and attribution line, values | Partly | One line each: publisher, what it is, when last refreshed, link to the publisher. The CBS attribution line must appear where the series is shown (its licence). No chart in the knowledge layer |
| `data/dimensions/` | 26 | id, Hebrew name, one-line explanation, the rule ids behind the row | Yes, as the second navigation axis | Not a page of its own: each dimension is a filter chip or a "see also" that gathers rules across products (section 3). Note: rules use 8 further dimension ids that have no record (`statement-disclosure` 15 rules, `fee-direct-expenses` 4, `fee-account`, `surtax`, `default-allocation`, `product-marking`, `estate-situs`, `fund-tax-track` 1 each); they need a record or a merge before dimensions can drive navigation |
| `data/catalog/` | 38 (all Meitav; 36 catalogued, 2 not yet) | institution's own names, where and when seen, what they map to, same-name resolutions | Already on the company and track pages | In the knowledge layer only a sentence with a count: "38 שמות של מיטב פוענחו". A separate catalogue browse would duplicate the company pages |
| `data/cma/` | 2 datasets (Gemel-Net 764 funds, Pensia-Net 293) | regulator rows per track with fee averages, refreshed daily | Already on the companies and track pages | A line per dataset: publisher, period (2026-09), count, link to data.gov.il; plus the three rules that say what the fee fields mean (CAT-35, CAT-36, CAT-37), which every CMA row already cites |
| `data/terms/` (glossary) | 451 | Hebrew term, meaning, where it appears, wrapper ids, variants, rule ids, source | Yes, already searchable | Keep as the term cards and the search group "מונחים". In the knowledge layer: the glossary is the entry for someone who has a word, not a question; one link, no table |
| `data/instruments/wrappers/`, `exposures/` | 17 + 7 | names as apps and statements print them, regulator, rule ids per field, open questions | Already the guide pages | The product axis of section 3 reuses these 17 names. Nothing new to build |

Facts about the rules that shape the design:

- Strength: 278 primary, 144 primary-mirror, 70 institution, 7 secondary, 1 open (SW-37). The "open" state is rare because open questions live as numbered lists in the reference files (488 numbered open items across the 30 files) rather than as rule records; the rules page shows a group's open questions only where a wrapper record lists them.
- 241 rules are flagged likely to change and every one carries a re-check date (138 in January 2027, 61 in April 2027). This is the single best "intriguing" hook in the data: "מה עומד להשתנות" is a list the site can already produce.
- 214 rules carry 484 figures (123 percentages, 76 counts, 60 shekel amounts, 35 year counts, 34 business-day counts). 287 rules carry no figure, and so no source link in their JSON record; their sources are in the reference files (section 4).
- Every rule has `title_he` and `text_he`. 452 were checked on 2026-10-22, 30 on the 23rd, 18 on the 24th.
- 493 of the 500 rules are cited by at least one other data record; 417 are mentioned in site or engine code; 150 are read by the calculation engine. The seven uncited rules are the four experience records SW-X01 to SW-X04, MKT-01, CAT-42 and PF-37.
- 5 rules have no dimension (SW-X01 to SW-X04 and MKT-01); 133 have one, 231 have two, 131 have three or more.

---

## 2. A data-driven importance signal for rules

### 2.1 Signals computed (the CSV columns)

For every rule:

- `ref_<collection>`: how many `rule_ids` entries in other data records name it, by collection (wrappers, exposures, dimensions, glossary terms, funds, fees, deposit terms, catalog, parameters, CMA, series), counting `rule_ids` nested inside figures too. `ref_total` is their sum. The CMA datasets inflate five CAT rules (CAT-06, CAT-35, CAT-36, CAT-37 at 2,114 each; CAT-39 at 586) because every track row cites them; the scoring therefore uses the number of distinct collections (`n_collections`), not the raw sum.
- `rule_xrefs`: how many other rule records mention the id in their text or notes.
- `site_files`: how many files under `site/app` and `packages/engine/src` mention the id; `engine_files` the engine subset; `site_only_files` the difference (guide prose, cards, copy).
- `n_figures`, `json_source_links`, `strength`, `likely_to_change`, `recheck_date`, `n_dimensions`.
- `tier1_topic`: 1 unless the rule's file is one of the seven tier-2 files (corporate bonds, FX and structured deposits, managed and robo portfolios, REITs and gold, savings policies and executive insurance, tax on insurance and Amendment 190, tax tier-2 other), per product.md D2.
- `ux_questions`: which of the recurring questions Q1 to Q14 of `ux-landscape.md` 3.1, or themes 4.1 to 4.8, the rule answers. This mapping is by hand (130 rules mapped; the file names only one rule id, so the mapping reads the question and names the rules that answer it; it is a judgement, not a measurement).
- `md_source_*`: what the `- Source:` line in the reference file contains (section 4).
- `curated`: a one-line reason when the rule is on the hand list of section 2.5.

### 2.2 What raw usage says (top 50 by `raw_usage` = 3 × engine files + site-only files + collections + cross-references)

| # | Rule | Engine files | Site-only files | Collections | Figures | Asked (UX) | Title |
|---|---|---|---|---|---|---|---|
| 1 | TXI-03 | 3 | 11 | 5 | 1 | Q1, Q9, Q11, 4.7 | 15% on interest from an asset not fully CPI-linked |
| 2 | TXH-09 | 4 | 9 | 3 | 2 | | Study fund: exempt withdrawal after 6 years |
| 3 | PF-06 | 4 | 6 | 4 | 1 | Q3 | 2% cap for study fund and IRA |
| 4 | TXH-11 | 4 | 7 | 3 | 2 | | Gains on non-benefited study-fund deposits: up to 25% |
| 5 | TXG-02 | 5 | 2 | 2 | 1 | | Income-tax brackets 2026 |
| 6 | TXH-01 | 3 | 6 | 3 | 1 | | Employer study-fund deposit not taxed at deposit |
| 7 | PF-04 | 3 | 5 | 4 | 2 | | 0.5% / 6% cap, new comprehensive pension |
| 8 | BANK-18 | 2 | 8 | 4 | 0 | Q1 | No custody fee on makam and money-market funds at a bank |
| 9 | MF-34 | 2 | 8 | 4 | 0 | Q1, Q11 | Daily money-market funds |
| 10 | PF-02 | 3 | 4 | 4 | 2 | Q3 | 1.05% / 4% cap for provident funds |
| 11 | PF-13 | 3 | 7 | 2 | 1 | Q3, 4.2 | A fee discount must last a minimum period |
| 12 | PF-23 | 1 | 11 | 4 | 1 | Q4 | Track switch within 3 business days, no fee |
| 13 | TXI-12 | 2 | 6 | 4 | 1 | Q2 | Selling makam or an unlinked bond early: up to 15% |
| 14 | TXI-20 | 3 | 4 | 4 | 2 | | Low-income deduction from deposit interest |
| 15 | TXI-25 | 3 | 5 | 4 | 0 | | Negative linkage does not reduce the tax |
| 16 | TXS-09 | 2 | 6 | 4 | 1 | | Exempt fund: what the saver pays on sale |
| 17 | BRK-17 | 3 | 3 | 5 | 0 | Q1, Q7 | Banks may not charge custody on makam and money-market funds |
| 18 | CAT-10 | 1 | 11 | 3 | 0 | | CMA classification and specialization values |
| 19 | TXG-04 | 4 | 2 | 2 | 2 | | Age 60+: lower brackets |
| 20 | TXH-03 | 3 | 4 | 3 | 0 | | Employer deposit above the limits taxed as salary |
| 21 | PF-18 | 2 | 7 | 3 | 0 | Q6 | Study fund: no partial transfer |
| 22 | TXI-05 | 3 | 2 | 4 | 0 | | Linkage on a fully linked asset is exempt |
| 23 | TXP-02 | 2 | 5 | 3 | 4 | Q12 | Employee pension deposit: 35% credit and ceiling |
| 24 | TXS-12 | 2 | 6 | 4 | 2 | Q1, 4.7 | Money-market funds: what a saver pays |
| 25 | BRK-16 | 1 | 7 | 5 | 0 | Q7 | Banks: the full tariff fixes the securities fee types |
| 26 | PEN-35 | 3 | 3 | 3 | 0 | Q12 | Provident fund for annuity vs pension fund |
| 27 | TXF-13 | 2 | 4 | 4 | 1 | Q13 | W-8BEN or 30% |
| 28 | TXI-04 | 2 | 3 | 5 | 0 | | What counts as "linked" |
| 29 | MF-26 | 1 | 6 | 4 | 0 | | What a distributor may charge the unit holder |
| 30 | PF-05 | 2 | 4 | 3 | 2 | | 1.05% / 4% cap, new general pension |
| 31 | PF-10 | 3 | 2 | 3 | 0 | | Direct investment expenses on top of the fee |
| 32 | PF-17 | 1 | 8 | 3 | 0 | Q6 | Transfer routes between provident funds |
| 33 | SW-39 | 2 | 7 | 1 | 0 | Q6 | Seniority on a transfer |
| 34 | TXI-08 | 2 | 3 | 5 | 2 | | Bank withholding on deposit interest |
| 35 | BANK-06 | 0 | 8 | 4 | 0 | Q1 | Breaking a deposit |
| 36 | PEN-22 | 2 | 4 | 3 | 2 | | Fee caps, provident fund for annuity |
| 37 | REG-17 | 1 | 7 | 3 | 0 | | The CMA: legal basis |
| 38 | REG-18 | 0 | 9 | 4 | 0 | | Provident assets held in trust |
| 39 | TXF-11 | 2 | 3 | 4 | 0 | | No deemed-distribution rule for foreign funds |
| 40 | TXH-10 | 2 | 3 | 3 | 1 | | Study fund: exempt after 3 years at retirement age or for study |
| 41 | TXK-04 | 1 | 6 | 4 | 0 | Q4 | Gemel lehashkaa: track switch and transfer not taxed |
| 42 | TXS-21 | 1 | 6 | 4 | 0 | | Switching between funds is a sale |
| 43 | GOV-11 | 2 | 2 | 4 | 4 | | CPI-linked government bond |
| 44 | GOV-23 | 1 | 3 | 4 | 2 | | Makam issue schedule |
| 45 | IRA-11 | 0 | 8 | 4 | 0 | | IRA: what may be held |
| 46 | IRA-25 | 3 | 0 | 3 | 0 | | IRA liquidity follows the underlying product |
| 47 | KH-17 | 2 | 3 | 3 | 0 | Q6 | Transfers out of a study fund: whole balance |
| 48 | KH-22 | 2 | 2 | 4 | 1 | Q3 | Study-fund fee cap 2% |
| 49 | PEN-26 | 2 | 3 | 3 | 3 | Q12 | Retirement ages |
| 50 | TXF-04 | 2 | 2 | 4 | 1 | Q8, Q13 | Foreign fund on TASE: exchange rate or CPI as the index |

Reading: raw usage measures what the **site's calculations and guide prose** lean on. It is dominated by the study-fund tax chain (TXH-01/03/09/11), the fee caps (PF-02/04/05/06) and the interest-tax chain (TXI-03/04/05/08/12/20/25), because the engine computes those. It does not see what a person knows or asks about: TXS-01 (the 25% rule) is cited by zero engine files, because the engine taxes fund units through TXS-09 and TXS-12 and never needs the share rule itself.

### 2.3 Proposed formula

Eight additive components, each explainable in one Hebrew sentence to a reader who asks "why is this first":

| Component | Values | Meaning |
|---|---|---|
| `c_engine` | 0 / 1 / 2 / 3 | read by the calculation engine: none / 1 file / 2 to 4 / 5 or more |
| `c_site` | 0 / 1 / 2 / 3 | shown in guide prose or cards (site files beyond the engine): none / 1 to 2 / 3 to 5 / 6 or more |
| `c_records` | 0 to 3 | distinct data collections that cite it (capped at 3) |
| `c_figure` | 0 / 2 | carries a number the site shows |
| `c_asked` | 0 / 2 / 4 | answers one, or two or more, of the UX study's recurring questions |
| `c_tier` | +1 / −2 | tier-1 topic / tier-2 topic |
| `c_strength` | +1 / 0 / −1 | primary or primary-mirror / institution / secondary or open |
| `c_changes` | 0 / 1 | on the likely-to-change list (a reader should see what moves) |

`score` = sum (range 0 to 18 in theory; observed 0 to 17, median 7). Top 30:

| # | Rule | Score | One-line justification |
|---|---|---|---|
| 1 | TXI-03 | 17 | The 15% rule on unlinked interest: engine, 11 guide files, 5 collections, asked in Q1, Q9, Q11; the rule behind every deposit, makam and money-market verdict |
| 2 | PF-13 | 16 | A fee discount must last a minimum period: the playbook's retention logic rests on it; asked in Q3 and the fee-opacity theme |
| 3 | TXS-12 | 16 | What a money-market fund saver pays: the idle-cash preset's tax step; the rule the UX study found sources disagreeing on |
| 4 | TXI-12 | 15 | Selling makam or an unlinked bond early: the bond and makam engine formulas; Q2 (yields falling, where to move) |
| 5 | TXF-04 | 15 | Foreign fund on TASE, exchange rate or CPI: the only rule that separates an Irish ETF's tax from an Israeli one's; Q8 and Q13 |
| 6 | PF-06 | 14 | The 2% cap for study funds and IRA: materiality, fee verdicts, both IRA guides |
| 7 | MF-34 | 14 | Daily money-market fund: the idle-cash candidate the site recommends most; Q1 and Q11 |
| 8 | PF-23 | 14 | Track switch in 3 business days, no fee: 11 guide files; Q4 (which track) |
| 9 | TXP-02 | 14 | The 35% pension credit and its ceiling: the holdings employer line; Q12 |
| 10 | PEN-26 | 14 | Retirement ages: every annuity and 60+ rule hangs on it; Q12 |
| 11 | TXS-24 | 14 | A fund's tax status is published by TASE, some money-market funds are taxable: the "check the fund, not the class" rule; Q1, Q8 |
| 12 | TXF-27 | 14 | US estate tax exposure: the 216-reply forum thread; Q13 and the tax theme |
| 13 | TXS-01 | 14 | 25% on real capital gain: the best-known rule; no engine use, high "asked" |
| 14 | TXH-09 | 13 | Study fund exempt after 6 years: 4 engine files, 9 guide files |
| 15 | TXH-11 | 13 | Non-benefited study-fund gains up to 25%: the exit-tax formula |
| 16 | TXH-01 | 13 | Employer study-fund deposit untaxed within limits: the employer line |
| 17 | PF-02 | 13 | 1.05% / 4% cap for provident funds: fee verdicts; Q3 |
| 18 | BRK-17 | 13 | No custody fee on makam and money-market funds: 5 collections; Q1, Q7 |
| 19 | TXF-13 | 13 | W-8BEN or 30%: the brokerage guide's first warning; Q13 |
| 20 | KH-22 | 13 | Study-fund fee cap 2%: the product-side twin of PF-06; Q3 |
| 21 | REG-04 | 13 | No deposit insurance, 2026 law orders an examination: 6 guide files; Q1 |
| 22 | TXP-14 | 13 | Qualifying annuity partial exemption: the retirement-stage question; Q12 |
| 23 | TXS-03 | 13 | Unlinked bonds 15% of the whole gain: Q11 (3-year apartment money) |
| 24 | CS-18 | 13 | Child savings: who pays the fee and until when; Q10 |
| 25 | PEN-23 | 13 | Default pension funds and their fees: Q3, Q5 and the inertia theme |
| 26 | PF-16 | 13 | Notice before a fee increase: the "teaser fee" trap of theme 4.2; Q3 |
| 27 | BANK-18 | 12 | No custody fee on makam and money-market funds at a bank: 8 guide files; Q1 |
| 28 | TXI-20 | 12 | Low-income deduction from deposit interest: 3 engine files |
| 29 | TXS-09 | 12 | Exempt fund, what the saver pays on sale: the fund exit-tax formula |
| 30 | PF-18 | 12 | Study fund: no partial transfer, consolidation only once liquid; Q6 |

### 2.4 Where the formula disagrees with common sense

The formula rewards what the **site** uses and what the **forum** asks. Neither is what a friend already "knows" and wants to check. The misses, with the formula's rank out of 500:

| Rule | Rank | Why the formula misses it | Why a person expects it first |
|---|---|---|---|
| TXS-01, 25% on real capital gain | 13 | zero engine files; cited by only 2 wrappers | the one rule everybody has heard; the founder's own example |
| TXS-02, real not nominal (inflationary amount exempt) | 69 | one engine file, one guide file, no figure | the half of the 25% rule people get wrong |
| TXI-02, 25% ceiling on linked interest | 139 | the engine reads TXI-03/05/14 instead | the counterpart that makes "15% or 25%" a pair |
| KGL-02 and KGL-03, the gemel lehashkaa ceiling | 48, 68 | one engine file; KGL-03 is institution strength (Harel's table, not a law text) | the one figure every gemel lehashkaa ad quotes |
| TXH-17 and TXK-04, track switch without tax | 63, 33 | no figure, one engine file | the sentence that makes a track switch feel safe |
| BANK-23 and REG-04, no deposit insurance in Israel | 100, 21 | no figure on BANK-23; no engine use | the surprise fact of the current-account guide; the "wait, really?" the founder's brief names |
| REG-06, what happens if a bank fails | 96 | no engine use | the natural follow-up to BANK-23 |
| PEN-03, minimum pension contribution rates | 109 | one engine file | the payslip percentages every employee sees |
| TXG-02, 2026 brackets | 52 | 5 engine files but only 2 guide files and no UX question | the tax report's first "likely to be misremembered" item |
| TXG-09 and TXG-10, the surtax | 60, 97 | low usage | the tax report's second item |
| SW-06 and PF-19, transfer in 10 business days with no fee | 255, 43 | SW-06 has no engine or wrapper citation (the wrappers cite PF-19) | the one promise a saver should hold a fund to |
| MKT-01, the S&P 500 past record | 177 | secondary strength, no dimension, no citation | the question of the scenario audit ("is N years enough") |
| TXS-16, dividends 25% | 222 | no use | a rule people know by heart |
| TXG-28, no National Insurance on capital gains | 334 | no use | a common worry the site can close in a line |
| REG-18 and REG-19, provident assets held in trust, management moves if a company fails | 183, 187 | no figure, no engine | the protection answer behind "is my pension safe" |

Two false positives to note: PF-13 (discount minimum period) at rank 2 and TXF-27 (US estate tax) at rank 12 are right for a saver mid-decision but are not what a first-time visitor expects at the top; TXI-20 (low-income deduction) at 28 is an engine artefact (the holdings tax step reads it) and matters to few of this audience.

**Conclusion:** the formula is a good **within-group** order and a fair "what the site relies on" order; it must not pick the headline list. The headline list is curated.

### 2.5 The curated list and how it overrides

Proposal: a short hand list of about twelve "הכללים שכולם שואלים עליהם" pinned above everything, ordered by hand, each shown as one line (figure, six-word verdict, source tag, id). The formula orders everything below it and inside each group. The twelve (my draft, for the lead and founder to edit; the `curated` column of the CSV holds 45 candidates with a reason each):

1. TXS-01 with TXS-02 as its second line: 25% מס על רווח הון ריאלי (לא על האינפלציה)
2. TXI-03 with TXI-02: 15% על ריבית לא צמודה, 25% על צמודה
3. TXS-12 with TXS-24: קרן כספית: מה משלמים ועל מה; בודקים את הקרן, לא את הסוג
4. KGL-02 with KGL-03: תקרה שנתית אחת לקופת גמל להשקעה, לכל האדם
5. TXH-09 with TXH-01: קרן השתלמות: פטור אחרי 6 שנים; הפקדת המעסיק לא ממוסה בהפקדה
6. TXH-17, TXK-04, PF-23 as one line: מעבר מסלול בתוך הקופה: לא אירוע מס, תוך 3 ימי עסקים, בלי עמלה
7. BANK-23 with REG-04 and REG-06: אין ביטוח פיקדונות בישראל; מה כן קורה אם בנק נופל
8. PF-06, PF-02, PF-04 as one line: תקרות דמי ניהול: 2% השתלמות וניהול אישי, 1.05%/4% גמל, 0.5%/6% פנסיה מקיפה
9. PF-19 with SW-06 and SW-15: העברה בין קופות: 10 ימי עסקים, בלי עמלת העברה, אבל אפשר להפסיד הנחה
10. TXG-02 with TXG-09 and TXG-10: מדרגות 2026 ומס יסף
11. TXP-01 with TXP-02: זיכוי 35% מול ניכוי: מה שווה יותר
12. REG-18 with REG-19: הכסף בקופה מוחזק בנאמנות; אם החברה נופלת, הניהול עובר

Where the list lives is a decision: it is a site judgement, not a rule, so by the project's own rule it belongs in `data/parameters/` (a candidate P-09 "the pinned rules", with the founder's sign-off), not in copy. I did not create it.

---

## 3. Grouping proposal

### 3.1 Evidence from the data

Today's page groups by the 29 rule-base files, in Hebrew alphabetical order of the file name, which puts "אג״ח קונצרניות" (tier 2, 0 records on the site) first and "מס: כללי" in the middle. Group sizes run from 1 (bank product names) to 48 (switching). Three ways to regroup were tested against the records:

**By product (the 17 wrappers).** The files already are products for 10 of the 29; the 7 tax files cut across products (TXG applies to all, TXI to five wrappers), as do switching (48 rules across all provident wrappers), regulators (19), provident-common (28) and the catalogue (18). A product-only grouping would need to duplicate about 160 rules or hide them under "common".

**By dimension cluster ("who takes what").** Each rule's dimensions map onto five shelves. Counting each rule by its first dimension: *what you can do with the money* (liquidity, transfer process, eligibility, ceilings) 154; *what the state takes* (the eight tax dimensions and age/use exemptions) 153; *who protects the money* (protection, regulator, insurance cover) 80; *what the bank or manager takes* (the seven fee dimensions and minimums) 74; *how the product is built* (currency, distribution policy) 22; plus 12 rules on dimensions without a record (statements) and 5 with no dimension. 224 rules have dimensions on more than one shelf, most often state + you (57), protect + you (32), inst + you (24), how + state (23). So one home shelf per rule is workable (the first dimension is the author's primary), and the cross-shelf rules want a "see also" rather than a second card.

**By life question (the UX study's three jobs).** "Where should this money live" / "am I paying too much and how do I move" / "am I set up right" are the questions the site's **pages** answer (goal compare, fees and playbook, holdings). As rule groups they fail: 370 of 500 rules fit none of the three directly.

The per-file first-dimension matrix shows how clean the split is:

| File | state | inst | you | protect | how | other |
|---|---|---|---|---|---|---|
| the 7 tier-1 tax files (123 rules) | 113 | 0 | 5 | 2 | 3 | 1 (fund-tax-track) |
| regulators-and-protection (19) | | | | 19 | | |
| switching-and-transfers (48) | 1 | 3 | 39 | 1 | | 4 no dimension |
| provident-family-common (28) | | 11 | 8 | 1 | | 8 (statements, direct expenses) |
| brokerage-account (28) | 3 | 12 | 1 | 11 | 1 | |
| mutual-funds-and-money-market (37) | 3 | 12 | 9 | 11 | 2 | |
| etfs-and-index-funds (37) | 2 | 7 | 10 | 5 | 12 | 1 no dimension (MKT-01) |
| bank-current-account-deposits (20) | 7 | 3 | 9 | 1 | | |
| government-bonds-and-makam (23) | 10 | 3 | 8 | 2 | | |
| pension-and-gemel-lekitzba (31) | 2 | 4 | 15 | 10 | | |
| keren-hishtalmut (21) | 1 | 1 | 17 | 2 | | |
| kupat-gemel-lehashkaa (13) | | 3 | 9 | 1 | | |
| ira-self-directed (23) | | 7 | 10 | 5 | 1 | |
| child-savings (22) | 3 | 1 | 11 | 4 | 1 | 2 |
| tracks-catalogue-and-decoder (18) | 3 | 5 | 2 | 5 | 2 | 1 |
| bank-product-names (1) | | | 1 | | | |
| the 2 tier-2 tax files (6) | 5 | 1 | | | | |
| savings-policies (2) | 1 | 1 | | | | |

### 3.2 Recommendation: shelves first, products second, numbers always

Two axes, both already in the data, no new taxonomy to maintain:

- **Shelf** (top level, five groups; the reader's question "who is this rule about"), derived from the rule's first dimension, with a per-file default where a file is uniform (all tax files → shelf 1, regulators → shelf 4).
- **Product chip** (second level, inside a shelf; the reader's "which of my products"), derived from the wrappers that cite the rule (`ref_instruments/wrappers`) and the file, using the 17 wrapper names the guide already uses, plus "משותף לכל הקופות" and "עוד לא באתר" (tier 2).
- **The id stays on every card**, trailing the title as a tag ("TXS-01"), and a flat "לפי מספר" index at the foot of the page lists the prefixes with their counts (TXS 23, TXG 14, PF 28, SW 48 ...), each opening a filter. That keeps the founder's numbering as a browsing path without making it the structure.

Drafted shelf names (style guide section 10: everyday educated Hebrew, one idea per name, no form words, no exclamation):

| # | Shelf (Hebrew) | English gloss | Dimensions that land here | Rules (first dimension) | Pinned examples |
|---|---|---|---|---|---|
| 1 | **מה המדינה לוקחת** | what the state takes | tax at deposit, during, at exit; switching tax event; loss offset; real vs nominal; reporting obligation; foreign withholding and domicile; age or use exemptions | 153 | TXS-01, TXI-03, TXH-09, TXG-02 |
| 2 | **מה הבנק או בית ההשקעות לוקחים** | what the bank or manager takes | fee from balance, from deposit, custody, trade, FX, exit; fee change over time; minimums; direct expenses | 74 (+5 statements and direct-expense rules) | PF-06, PF-02, PF-13, BRK-16, MF-16 |
| 3 | **מה אפשר לעשות עם הכסף** | what you can do with the money | liquidity and lock-up; transfer process; who can join; deposit ceilings | 154 | KGL-02, PF-19, PF-23, KH-17, CS-14 |
| 4 | **מי מפקח ומה מוגן** | who supervises and what is protected | protection; regulator; insurance cover | 80 | BANK-23, REG-06, REG-18, MF-02, BRK-07 |
| 5 | **איך המוצר בנוי** | how the product is built | currency; distribution policy; the index and fund-construction rules; statements and what they show; product names | 22 (+ the catalogue, statement and name rules, about 40 when moved by file) | ETF-11, ETF-37, GOV-11, CAT-17, PF-34 |

Second-level sub-groups inside shelf 1 keep today's seven tax files, renamed to the reader's words (today's names start with "מס:", which reads as a database label):

| File | Today | Proposed |
|---|---|---|
| tax-securities-israeli | מס: ניירות ערך וקרנות ישראליות | מניות, קרנות ואג״ח בבורסה בישראל |
| tax-securities-foreign | מס: ניירות ערך וקרנות זרות | קרנות וניירות ערך מחו״ל |
| tax-interest-deposits-bonds | מס: ריבית, פיקדונות ואג״ח | ריבית: פיקדונות, מק״מ ואג״ח ממשלתיות |
| tax-hishtalmut | מס: קרן השתלמות | קרן השתלמות |
| tax-pension-gemel-lekitzba | מס: פנסיה וקופת גמל לקצבה | פנסיה וקופת גמל לקצבה |
| tax-gemel-lehashkaa-ira-child | מס: קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד | קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד |
| tax-general | מס: כללי | מדרגות המס, מס יסף וביטוח לאומי |
| tax-insurance-and-amendment-190, tax-tier2-other | (two names) | עוד לא באתר: פוליסות, תיקון 190, מט״ח, אג״ח קונצרניות, ריט וזהב |

Mapping of the other 20 files (home shelf; the rules whose first dimension says otherwise follow their dimension, which the matrix above counts):

| File | Home shelf | Notes |
|---|---|---|
| regulators-and-protection (REG) | 4 | whole file |
| switching-and-transfers (SW) | 3 | SW-15, SW-33, SW-34 (what moving costs) also surface in 2; SW-36 (tax on moving securities) in 1; SW-X01 to SW-X04 are a sub-group "ניסיון של אחרים", labelled secondary, at the foot of shelf 3 |
| provident-family-common (PF) | 2 and 3 | PF-01 to PF-16, PF-35, PF-39 → 2 (caps, discounts, direct expenses, averages); PF-17 to PF-24, PF-28 → 3 (routes, deadline, track switch); PF-29 → 4; PF-26, PF-33, PF-34, PF-36 to PF-38 → 5 as "מה כתוב בדוח" |
| brokerage-account (BRK) | 2 and 4 | fee lines and tariffs → 2 (BRK-15 to BRK-25, BRK-33, BRK-37 to BRK-39); custody, trust and failure → 4 (BRK-07, 08, 10, 12, 13, 35, 36); provider classes and opening → 3; BRK-27 → 1 |
| mutual-funds-and-money-market-funds (MF) | 2, 3, 4 | fees MF-16 to MF-27 → 2; what a money-market fund is and how orders work (MF-07 to MF-15, MF-29 to MF-39) → 3 and 5; trust and supervision (MF-01 to MF-04, MF-40, MF-41, MF-52, MF-55) → 4 |
| etfs-and-index-funds (ETF) | 5 | the index rules ETF-33 to ETF-42 and the construction rules ETF-10 to ETF-12, ETF-27 to ETF-30 → 5; fee layers ETF-05, ETF-13, ETF-14, ETF-17 → 2; access and listing (ETF-04, 22 to 26, 31, 32, 43) → 3; MKT-01 → 5 as "עבר, לא תחזית" |
| bank-current-account-deposits (BANK) | 3 | terms and notices → 3; BANK-17 to BANK-19 → 2; BANK-23 → 4; the directive-447 display rules (BANK-09, 13, 14, 15, 22) → 5 |
| government-bonds-and-makam (GOV) | 5 and 3 | structure (GOV-03, 06, 08, 11 to 15) → 5; who may buy, how to sell (GOV-04, 05, 10, 16 to 21) → 3; GOV-02 → 4; GOV-23 (issue schedule) → 3 |
| pension-and-gemel-lekitzba (PEN) | 3 and 4 | eligibility, rates, ceilings, retirement, withdrawal → 3; insurance cover and actuarial balance (PEN-11 to PEN-19) → 4; PEN-21 to PEN-23 → 2 |
| keren-hishtalmut (KH) | 3 | KH-22 → 2; KH-25 → 4 |
| kupat-gemel-lehashkaa (KGL) | 3 | KGL-14 to KGL-16 → 2 |
| ira-self-directed (IRA) | 3 | IRA-16 to IRA-18, IRA-21, IRA-22 → 2; IRA-26, IRA-28 → 4 |
| child-savings (CS) | 3 | CS-05 → 4; CS-18 → 2; CS-20, CS-26, CS-27 → 5 |
| tracks-catalogue-and-decoder (CAT) | 5 | CAT-06, CAT-35 to CAT-39 (what the regulator's fee figures mean) → 2; CAT-15, CAT-16 (names must match policy) → 4 |
| bank-product-names (BPN) | 5 | one rule |
| the 5 tier-2 product files | tier-2 chip | 0 records today except savings-policies (2: INS-25 → 2, INS-26 → 5); the "עוד לא באתר" page remains their home |

### 3.3 How it reads on the page (not spam)

- **Top:** the pinned twelve as one-line rows (figure, verdict, source tag, id). No cards. Twelve rows fit one phone screen.
- **Then five shelves**, closed, each with its name, a count ("153 כללים") and its three highest-scored rules named inline as a teaser ("בין השאר: 25% על רווח הון ריאלי · 15% על ריבית לא צמודה · פטור אחרי 6 שנים").
- **Inside a shelf:** product chips filter; the rules order by `score`; the first five render as cards, the rest as one-line rows with "עוד N כללים". A likely-to-change rule shows its re-check date as it does today; a secondary or institution rule shows its strength word as it does today.
- **A second entry, "מה עומד להשתנות":** the 241 likely-to-change rules by re-check month (138 in January 2027, 61 in April). It is the most "intriguing" list the data already contains and needs no new content.
- **Foot:** "לפי מספר", the prefix index with counts, for the founder and for anyone who arrives from a card with an id.
- Today's filter field stays; its placeholder can say "מספר, כותרת או מילה מהכלל".

What this does not need: a new field on any rule. Shelf comes from `dimensions[0]` with a file default; product comes from `rule_ids` in the wrapper records; order comes from the CSV's components, which the build can recompute. The only new artefact is the pinned list, which is a parameter.

---

## 4. The "verify" field audit

### 4.1 What the `- Source:` line looks like

Across the 30 reference files there are 860 rule headings (`### <ID> <title>`) and 861 `- Source:` lines; every one of the 500 rules with a record has one. Format findings, from parsing all of them:

- **Links:** 783 lines carry inline markdown links `[title](url)`; 33 lines (all in `switching-and-transfers.md`) use reference-style links `[title][tr]` with the URL defined once at the foot of the file (`[tr]: https://...`); 26 lines carry no link at all. Of those 26, 15 are MGD rules (managed portfolios, tier 2, no record) whose Source line is empty, and the rest point to another rule ("as in FXD-07", "link above", "per-bank URLs are in the table below") or name a document without a URL ("Altshuler bylaws 1.12.2024, s.9 · institution"). Some URLs are wrapped in angle brackets `(<url>)` because they contain Hebrew and parentheses.
- **Links per rule (all 860):** 0 links 24, 1 link 311, 2 links 275, 3 links 148, 4 links 46, 5 or more 32. Total 1,679 links; 1,350 "checked YYYY-MM-DD" stamps, so about four links in five carry their own date and the rest share the line's date.
- **Strength words** follow each link after "·": `primary`, `primary (mirror)`, `primary (Nevo mirror)`, `primary (official circular on a third-party host)`, `primary (dated)`, `institution`, `secondary`, `secondary (experience)`. Parseable with a small vocabulary; the parenthetical qualifiers are free text.
- **Section references** (s.91(b)(1), reg. 2(א), p.47, "printed p.116") sit inside the link title or right after it, in English and Hebrew; they are the most useful "where on the page" hint for a reader and the hardest to extract by rule.

Verdict on extraction: a parser that handles the three link forms (inline, angle-bracketed, reference-style with foot definitions), splits on "·" for the checked date and strength word, and treats everything else as free text, recovers a link list for 836 of 860 headings and for all 500 records. The 24 link-less lines need a hand pass (15 are tier-2 MGD rules with no record; 4 are "see rule X" pointers; 5 are documents without URLs).

### 4.2 Publisher types

Across the 1,679 links (all 860 headings): institution and other 529, gov.il (including knesset.gov.il, btl.gov.il, isa.gov.il) 415, Hebrew Wikisource mirror 345, Bank of Israel 106, TASE (including Maya filings and content.tase.co.il) 94, data.gov.il 64, press 63, Nevo mirror 58, forum 4, Wikipedia 1. The top hosts: he.wikisource.org 221, www.gov.il 159, boi.org.il 83 (two hostnames), www.meitav.co.il 51, www.nevo.co.il 50, www.btl.gov.il 44, www.new.isa.gov.il 40, www.moreinvest.co.il 34, mayafiles.tase.co.il 32, www.as-invest.co.il 32, data.gov.il 22, content.tase.co.il 20, fs.knesset.gov.il 17.

Classifying each of the **500 recorded rules** by the best publisher on its Source line, where "official" means at least one link on gov.il, knesset.gov.il, boi.org.il, btl.gov.il, isa.gov.il, data.gov.il or tase.co.il:

| Class | All 500 | The 287 without a source link in JSON |
|---|---|---|
| At least one official link | 295 (59%) | 159 (55%) |
| Only mirrors (Wikisource, Nevo) | 70 (14%) | 48 (17%) |
| Mirrors plus institution or press (no official) | 38 (8%) | 17 (6%) |
| Only institution, press or forum | 97 (19%) | 63 (22%) |
| No link | 0 | 0 |

Two cautions on "official":

- 20 rules are official only through **Maya filings** (`mayafiles.tase.co.il`): BRK-07, BRK-08, TXS-07 to TXS-10, TXS-12 to TXS-15, TXS-24, CAT-42, ETF-05, ETF-06, ETF-09, ETF-12 to ETF-14, ETF-19, ETF-20. The host is TASE's but the document is the fund manager's prospectus or annual report; for the reader that is "לפי החברה" on an official host. The page should say "תשקיף או דוח של מנהל הקרן, באתר מאיה" rather than "רשות".
- 5 rules are official only through **data.gov.il API calls** (CAT-06, CAT-10, PEN-34, IRA-03, IRA-17): the URL returns JSON and is not a page a person can read. A reader-facing "verify" link needs the dataset's landing page instead.

The mirror question is the one that matters for the brief's "third-party source, a government paper": 108 of the 500 rules (70 + 38) cite the law only through Wikisource or Nevo. The reference README treats those mirrors as equal in status to the official text, and the JSON records label them `primary-mirror` (144 figures). For the reader, a mirror link should carry the word "העתק" or "מראה" ("נוסח החוק באתר ויקיטקסט, מראה של הנוסח הרשמי"), and the lead may want a follow-up that adds the Reshumot or Knesset law-database link beside it for the twelve pinned rules at least.

### 4.3 The sample of 30

| Rule | Links | Publishers | Observation |
|---|---|---|---|
| BANK-23 | 6 | knesset (bill PDF, two OData queries), gov.il, BoI, press | rich; the OData links are machine queries, not pages |
| BPN-10 | 4 | Hapoalim contract PDFs | institution only; URLs with encoded Hebrew |
| BRK-16 | 1 | BoI (banking fee rules PDF) | one official PDF with section and page numbers |
| BRK-24 | 4 | IBI, Excellence, Altshuler, Psagot tariff PDFs | institution only, two "no date on document" notes |
| CAT-10 | 5 | data.gov.il SQL queries | official but machine-only |
| CAT-42 | 1 | Maya | "read in the founder's Chrome"; a page whose counts change daily |
| CS-03 | 3 | btl.gov.il ×2, then law and regulation named "(Wikisource mirror)" **without a link** | mixed: two links plus two unlinked citations in the same line |
| ETF-13 | 2 | Maya filings (two annual reports) | institution documents on an official host |
| ETF-28 | 3 | iShares factsheet and product pages | institution only, foreign |
| GOV-11 | 1 | Nevo | mirror only, with the Kovetz Takanot citation in text |
| INS-25 | 3 | Wikisource ×3 | mirror only (tier 2) |
| IRA-08 | 3 | Meitav-hosted copy of the Reshumot amendment ("primary"), Meitav, Mor | the "primary" link is a regulation PDF hosted by an institution |
| KGL-03 | 5 | Harel, Altshuler, Phoenix, Meitav, Mor | institution only; five managers agreeing on one figure, which the text says |
| KH-22 | 2 | Nevo, a law-firm mirror | mirror only |
| KH-10 | 1 | Altshuler form PDF; two bylaws named without links | institution; two unlinked documents |
| MF-16 | 2 | Wikisource, ISA guide (2017) | mirror plus official, the official one marked "(dated)" |
| MKT-01 | 2 | J.P. Morgan PDF and FAQ | secondary, with the licence terms quoted on the line |
| PEN-21 | 3 | Wikisource, Mor bylaws, Menora | mirror plus institution |
| PF-02 | 2 | Wikisource, Nevo | two mirrors cross-read |
| REG-04 | 2 | BoI-hosted law PDF, Knesset OData | official; the OData link is machine-only |
| SW-06 | 3 | reference-style: Transfer Regulations (Wikisource), circular (third-party host), Phoenix FAQ | the reference-style form; "third-party host" for a CMA circular |
| SW-X01 | 1 | Hasolidit thread | forum, marked "secondary (experience)" |
| TX2-19 | 2 | Wikisource ×2 | mirror only (tier 2) |
| TXA-28 | 2 | Clal, Phoenix pages | institution only (tier 2) |
| TXF-08 | 2 | Wikisource (Ordinance), gov.il guide | the standard tax pair: mirror of the law plus the Tax Authority guide |
| TXG-02 | 3 | gov.il booklet, Knesset (Sefer HaChukim PDF), gov.il | all official, with page numbers |
| TXH-09 | 2 | Wikisource, gov.il guide (angle-bracketed URLs) | the standard pair |
| TXI-03 | 2 | Wikisource with the Hebrew text quoted, gov.il guide | the standard pair with a verbatim quote: the best "verify" line in the sample |
| TXK-06 | 1 | Wikisource PDF render of the Ordinance, "PDF p.131" | mirror only, and a PDF rather than the page |
| TXP-02 | 1 | gov.il booklet; the Ordinance cited as "(link above)" | one of the "link above" cases: the law link must be taken from an earlier rule in the same file |
| TXS-01 | 2 | Wikisource, gov.il guide with two page quotes | the standard pair |
| TXS-12 | 5 | Wikisource ×2, Maya ×2, press | the fullest line: law, regulation, two prospectuses, one article |

Pattern: the **tax files** (TXS, TXI, TXF, TXG, TXH, TXP, TXK) nearly always pair the Ordinance on Wikisource with the Tax Authority guide on gov.il, with page numbers and often a verbatim quote; they are the easiest to turn into a reader-facing "verify" row ("סעיף 91(ב)(1) לפקודה · מדריך רשות המסים, עמ' 47"). The **product files** (KH, KGL, PEN, IRA, BRK, BPN) lean on institution pages and PDFs, often several, often undated; their "verify" row should say "לפי החברה" and name the company. The **regulator-data files** (CAT) cite API queries that need a landing page. The **switching file** needs the reference-style resolver.

### 4.4 What an extraction task would need to decide

1. Parse all three link forms and the foot definitions; treat "link above", "as in X" and unlinked document names as `needs_hand_pass` (about 24 of 860 lines, 9 of them in recorded rules: CS-03's two unlinked citations, KH-10's two bylaws, TXP-02's and TXA-26's "link above", KH-26, BPN-02, BPN-05, CAT-05, CORP-25 and FXD-17 among the unrecorded).
2. Decide the reader-facing label per host class: official page, official document (PDF), law text on a mirror, regulator dataset, fund filing on Maya, institution page or document, press, forum. Eight words in Hebrew; the glossary and copy.md section 10 already have "לפי החברה" for the institution case.
3. Replace machine links (data.gov.il API, Knesset OData) with the dataset or bill landing page for display, keeping the query as the recorded source.
4. Keep the section and page hint as free text on the row; it is the part a reader actually uses.
5. Write the result into the 287 records as a `sources` array (or, for the 213 that already have figure-level sources, confirm the two agree), under the existing schema's source object (url, title, publisher, strength, checked). This touches `packages/schema`, so it is a lead decision, not something this report assumes.

---

## 5. Decisions for the lead (not taken here)

1. **The pinned list.** Twelve rows, hand-ordered, as a site parameter with the founder's sign-off. My draft is in 2.5.
2. **Shelf as the top level.** Derived from `dimensions[0]` with file defaults, as in 3.2. Requires records for the 8 dimension ids rules use without one (or merging them: `statement-disclosure` into a new row, `fee-direct-expenses` and `fee-account` into the fee rows, `surtax` into tax-at-exit, `estate-situs` into foreign-withholding-domicile, `fund-tax-track` into tax-at-exit, `default-allocation` into eligibility, `product-marking` into regulator).
3. **The 360 skill-only rules.** They are invisible on the site. Three options: leave them (the rule base is for the site's own use), generate records for the tier-1 ones (about 190: TXG 21, MF 18, CAT 25, TXP 13, REG 12, BPN 12, BANK 12, PF 11, KGL 11, BRK 11, TXK 9, TXH 8, TXF 8, TXI 7, ETF 7, PEN 5, KH 5, IRA 5, CS 5, TXS 1) so the browse is complete, or generate all 360 with the tier-2 ones under the "עוד לא באתר" chip. Each needs `text_he`, which the markdown does not have.
4. **Source extraction** for the 287 records without a link, per 4.4, including how a mirror is labelled.
5. **The "what will change" entry**, which needs no decision beyond agreeing it belongs on the page.

What this report did not do: verify any figure, read any source page, change any site file, or test the proposal with a reader.
