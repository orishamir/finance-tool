---
name: il-finance
description: Sourced rule base for Israeli saving and investing - tax rules, ceilings, fee caps, product terms, transfer rules, regulators and protection - each rule with its source link, checked date and strength. Use it whenever work in this project needs an Israeli financial or tax fact rather than recalling one, for example capital-gains or interest tax rates, section 45A/47 pension credits, keren hishtalmut or kupat gemel lehashkaa ceilings and exemptions, money-market fund or ETF taxation, management-fee caps, child savings, IRA, makam and government bonds, bank deposit types, switching providers, or decoding a bank or fund product name. Also use it when writing data files, docs/method.md, test cases, guide pages or reviewing the calculation engine. Not for UI, RTL or Hebrew copy, code structure, or finance outside Israel.
user-invocable: false
---

# il-finance

The project's rule base (`docs/product.md` 3.8). 824 rules in 31 topic files under `references/`, researched 2026-10-22 from official sources first (four TA-125 index rules, seven CMA fee-field rules, CAT-35 to CAT-41, and six index rules from the providers' own documents, ETF-37 to ETF-42, added 2026-10-23). CLAUDE.md forbids stating a financial or tax rule from memory, so look the rule up here instead.

## How to use it

1. Find the topic in the index below. Read only the files you need; they are long.
2. Find the rule by its ID (for example `TXS-12`). Each rule has the rule itself, conditions, figures with tax year, source link, checked date, strength, dimensions, and how likely it is to change.
3. When you use a rule, cite its ID, link and checked date.
4. If the rule you need sits under a file's **Open questions**, or is not in any file, say the rule is missing and stop. Do not guess or approximate. `references/coverage.md` lists the known gaps and contradictions.
5. Respect strength (D10):
   - `primary`: computes.
   - `secondary`: computes, labelled "secondary source".
   - `open`: does not compute.
   - `institution` (a provider's own bylaw, prospectus or tariff): D10 does not cover it yet (coverage.md F1), so flag it rather than treat it as primary.
6. `primary (mirror)` means the law was read on Wikisource or Nevo through a tool that paraphrases. Re-read the exact wording in the official text before encoding the rule.
7. Figures change: check each rule's tax year and "Likely to change" line. Annotations marked "browser pass" record later updates.

## Index

| File | Covers |
|---|---|
| **Tax** | |
| `tax-general.md` (TXG) | Brackets, surtax, filing duty, withholding vs self-reporting, NII and health on passive income, age-60 rates |
| `tax-interest-deposits-bonds.md` (TXI) | Interest on deposits, savings plans, current accounts; makam and government bonds |
| `tax-securities-israeli.md` (TXS) | Capital gains, dividends, losses; Israeli funds incl. money-market funds and each fund's tax status |
| `tax-securities-foreign.md` (TXF) | Foreign securities and foreign-domiciled funds, withholding, credit, US estate tax |
| `tax-pension-gemel-lekitzba.md` (TXP) | 45A/47, employer deposits, annuity exemption, form 161 and 161ד |
| `tax-hishtalmut.md` (TXH) | Study fund tax |
| `tax-gemel-lehashkaa-ira-child.md` (TXK) | Investment provident fund (incl. the age-60 question), IRA, child savings |
| `tax-insurance-and-amendment-190.md` (TXA) | Savings policies, executive insurance, Amendment 190 |
| `tax-tier2-other.md` (TX2) | FX and structured deposits, corporate bonds, REITs, gold funds, managed portfolios |
| **Products and wrappers** | |
| `bank-current-account-deposits.md` (BANK) | Current account, deposit types, savings plans, directives 447/447A, deposit abbreviations |
| `mutual-funds-and-money-market-funds.md` (MF) | Israeli mutual and money-market funds, fees, exposure codes |
| `etfs-and-index-funds.md` (ETF) | Israeli ETFs, foreign funds on TASE, foreign-domiciled ETFs |
| `brokerage-account.md` (BRK) | Brokers, fee types, client-asset protection, TASE members and average fees |
| `government-bonds-and-makam.md` (GOV) | Makam and government bond series |
| `kupat-gemel-lehashkaa.md` (KGL) | Investment provident fund, ceiling |
| `keren-hishtalmut.md` (KH) | Study fund |
| `pension-and-gemel-lekitzba.md` (PEN) | Pension funds, mandatory pension, default funds, provident fund for annuity |
| `child-savings.md` (CS) | Chisachon lekol yeled |
| `ira-self-directed.md` (IRA) | Self-directed provident and study funds |
| **Cross-cutting** | |
| `provident-family-common.md` (PF) | Fee caps, transfers, statements, clearing house, lost accounts |
| `regulators-and-protection.md` (REG) | Regulators, registers, what is protected if an institution fails |
| `tracks-catalogue-and-decoder.md` (CAT) | CMA fund catalogue, track names, Maya fund list, the Meitav case |
| `bank-product-names.md` (BPN) | Per-bank deposit and savings-plan names |
| `switching-and-transfers.md` (SW) | Switching playbook per wrapper |
| **Tier 2** | |
| `savings-policies-and-executive-insurance.md` (INS), `corporate-bonds.md` (CORP), `managed-and-robo-portfolios.md` (MGD), `fx-and-structured-deposits.md` (FXD), `reits-and-gold-funds.md` (RG) | Tier-2 instruments, each with a graduation status |
| **About the base** | |
| `README.md` | Conventions, file template, dimension vocabulary |
| `coverage.md` | What product.md still lacks, founder decisions F1-F8, contradictions, corrections |

## Keeping it current

This folder is the maintained copy; `research/knowledge/` is the 2026-10-22 research snapshot it came from. When adding or changing a rule, follow `references/README.md`: a link and checked date on every rule, strength, tax year on every figure, and anything unsourced goes under Open questions.
