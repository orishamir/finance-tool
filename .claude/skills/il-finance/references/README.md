# Knowledge base

Research input for the `il-finance` rule base (`docs/product.md` 3.8) and for the
instrument guide, dimension checklist and catalogue of every option. One file per topic.
Started 2026-10-22. Written by the domain-specialist and tax-specialist agents;
`coverage.md` lists what in `docs/product.md` this knowledge base does not cover yet.

This is research, not site data. Nothing here is shown on the site until it is
copied into `data/` or the rule base with its source and date.

## Rules for every file

1. **Official sources first.** Legislation (Knesset, Nevo text only as a mirror of
   the law), Tax Authority, Capital Market Authority (CMA), Israel Securities
   Authority (ISA), Bank of Israel (BoI), National Insurance (NII), Ministry of
   Finance, TASE. Then the institution's own documents (bylaws, prospectus,
   tariff, product page). Then secondary sources (Kol Zchut, accounting firms,
   press), only where nothing official was reachable, and labelled as such.
2. **Every rule has a link and the date it was checked** (YYYY-MM-DD). A search
   snippet that was not opened is not a source.
3. **Never guess or fill from memory.** Anything without a source goes under
   "Open questions". "Not found" is an acceptable answer.
4. **Strength** per rule: `primary` (law, regulator, official publication read
   directly), `institution` (the provider's own binding document), `secondary`.
5. **Figures carry their tax year or effective date.** Say how a figure is
   updated (CPI-linked, average-wage-linked, frozen, fixed in law).
6. **Hebrew terms** are given next to the English, exactly as the source writes
   them, so the site can match app, statement and ad wording.
7. Cover whatever changes the outcome for a saver: rules, terms, costs, tax,
   eligibility, limits, liquidity, protection, process, and anything else the
   research shows matters. Lists in briefs are starting points.
8. Do not duplicate another file's topic. Point to it by file name and rule ID.

## File structure

```
# <Topic>

Checked: 2026-10-22 · Owner: domain-specialist | tax-specialist
Serves: product.md capabilities and roadmap release(s)
Scope: what is in, what is out (and which file has it)

## Summary
Plain-English, at most ten lines.

## Rules
### <PREFIX>-<NN> <short title>
- Rule: one or two sentences.
- Conditions / exceptions:
- Figures: value, unit, tax year or effective date, how it is updated
- Source: [title](url), section or page · checked YYYY-MM-DD · strength
- Dimensions: from the list below
- Likely to change: no | yes, why

## Terms
| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |

## Institutions (domain files, where relevant)
Who offers it, from which official register, checked date.

## Open questions
Numbered, each with what was tried and where the answer probably is.

## Left out and why

## Sources
Every URL used, with title, publisher, strength and date checked.
```

## Dimension vocabulary

Tag every rule with one or more of these (from `docs/product.md` 3.3). Propose
new ones under a "Proposed dimensions" heading in the file.

`tax-at-deposit`, `tax-during`, `tax-at-exit`, `real-vs-nominal`,
`age-or-use-exemption`, `switching-tax-event`, `loss-offset`,
`foreign-withholding-domicile`, `distribution-policy`, `fee-<type>`
(for example `fee-management-balance`, `fee-deposit`, `fee-trade`,
`fee-custody`, `fee-fx`, `fee-exit`), `fee-change-over-time`,
`liquidity-lockup`, `deposit-ceiling`, `protection`, `currency`,
`minimum`, `regulator`, `reporting-obligation`, `eligibility`,
`transfer-switch-process`, `insurance-cover`.

## Files

Release 1 (tier-1 wrappers and exposures, the catalogue, cross-cutting rules):

| File | Prefix | Owner | Topic |
|---|---|---|---|
| `bank-current-account-deposits.md` | BANK | domain | Current account, shekel deposits of every kind, savings plans, BoI disclosure rules |
| `mutual-funds-and-money-market-funds.md` | MF | domain | Israeli mutual funds: money-market, active, tracking; fee types; ISA rules |
| `etfs-and-index-funds.md` | ETF | domain | Israeli ETFs, foreign funds registered on TASE, foreign-domiciled ETFs |
| `brokerage-account.md` | BRK | domain | The brokerage wrapper: banks, TASE members, foreign brokers; fee types; client-asset protection |
| `government-bonds-and-makam.md` | GOV | domain | Makam, Shahar, Galil, Gilon and other government bonds; buying and holding |
| `kupat-gemel-lehashkaa.md` | KGL | domain | Investment provident fund |
| `keren-hishtalmut.md` | KH | domain | Study fund |
| `pension-and-gemel-lekitzba.md` | PEN | domain | Comprehensive and general pension fund, provident fund for annuity, mandatory pension |
| `child-savings.md` | CS | domain | Chisachon lekol yeled |
| `ira-self-directed.md` | IRA | domain | Self-directed provident and study funds |
| `provident-family-common.md` | PF | domain | Rules shared by CMA products: fee caps, transfers, tracks, statements, clearing house |
| `regulators-and-protection.md` | REG | domain | Who regulates what; what is and is not protected if an institution fails |
| `tracks-catalogue-and-decoder.md` | CAT | domain | CMA fund catalogue, classification fields, track naming, the Meitav case |
| `tax-general.md` | TXG | tax | Brackets, surtax, filing, withholding vs self-reporting, NII and health on passive income, inflationary amount |
| `tax-interest-deposits-bonds.md` | TXI | tax | Interest on deposits, savings plans, current accounts, makam and government bonds |
| `tax-securities-israeli.md` | TXS | tax | Capital gains, dividends and losses on Israeli-listed securities and Israeli funds, including money-market funds |
| `tax-securities-foreign.md` | TXF | tax | Foreign securities and foreign-domiciled funds: domicile, accumulation, withholding, credit |
| `tax-pension-gemel-lekitzba.md` | TXP | tax | Pension and provident-for-annuity: 45A, 47, employer contributions, withdrawals, annuity exemption |
| `tax-hishtalmut.md` | TXH | tax | Study fund taxation |
| `tax-gemel-lehashkaa-ira-child.md` | TXK | tax | Investment provident fund, IRA, child savings |

Releases 2 to 5:

| File | Prefix | Owner | Topic |
|---|---|---|---|
| `switching-and-transfers.md` | SW | domain | Switching process per wrapper (R4, 3.7) |
| `bank-product-names.md` | BPN | domain | Per-bank deposit and savings-plan product names (R4, 3.10) |
| `savings-policies-and-executive-insurance.md` | INS | domain | Tier 2 |
| `corporate-bonds.md` | CORP | domain | Tier 2 |
| `managed-and-robo-portfolios.md` | MGD | domain | Tier 2 |
| `fx-and-structured-deposits.md` | FXD | domain | Tier 2 |
| `reits-and-gold-funds.md` | RG | domain | Tier 2 |
| `tax-insurance-and-amendment-190.md` | TXA | tax | Tier 2: savings policies, executive insurance, Amendment 190 |
| `tax-tier2-other.md` | TX2 | tax | Tier 2: FX and structured deposits, corporate bonds, REITs, gold funds, managed portfolios |
