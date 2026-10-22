# Tax landscape: how saving and investing in Israel is taxed (discovery)

Track: tax rules and tax benefits for an individual Israeli resident who saves or invests.
Prepared: 2026-10-22. **Every rule below was checked on 2026-10-22** unless a different date is given.
Status: discovery input only. This is not a product decision and not tax advice. Per `CLAUDE.md`, nothing here
may be shown on the site until it is copied into `data/` with its source and date.

## How to read this file

- **Source strength.** Every rule has a source code (S1, S2, and so on; see the source list at the end) and a strength tag:
  - **[P]** primary: legislation text, or a Tax Authority, National Insurance, IRS or Knesset publication that I read directly.
  - **[S]** secondary: an industry or professional source that I read directly (insurer tables, accounting firms, press).
  - **[snip]** I saw only a search-result snippet and did not open the page. Treat it as a lead, not a source.
- **Tax years.** The year each figure applies to is stated. Most shekel thresholds are frozen at their 2024 values
  for 2025-2027 (see section 9.1). So a figure labelled "2025" usually equals the 2026 figure, but this is only
  confirmed where a 2026 source says so.
- **No gap is filled from memory.** If I could not source something, it is listed in section 12 (open questions).

---

## 0. Quick map (all figures sourced in the sections below)

| Instrument | Headline treatment (individual, not a substantial shareholder) | Section |
|---|---|---|
| Shekel deposit, not fully CPI-linked | 15% of nominal interest | 1 |
| CPI-linked deposit / savings plan | up to 25% of real interest | 1 |
| Foreign-currency deposit | The law uses the exchange rate as the "index", so the deposit falls in the linked (25%, real) bucket. Secondary sources confirm. See open question Q2 | 1 |
| Listed shares, ETFs, mutual funds, foreign shares | up to 25% of real capital gain | 2 |
| Unlinked shekel bonds, makam, commercial paper | up to 15% of the whole (nominal) gain or interest | 2 |
| Dividends (Israeli or foreign) | 25% (30% for a substantial shareholder) | 2 |
| Pension / kupat gemel lekitzba | 35% credit or deduction on deposits; growth exempt; annuity partly exempt (57.5% of a ceiling in 2026) | 3 |
| Keren hishtalmut | Gains exempt up to a deposit ceiling, after 6 years (3 years in some cases) | 3 |
| Kupat gemel lehashkaa | 25% of real gain on lump sum; gains exempt if taken as an annuity | 3 |
| Residential rent in Israel | Exempt up to 5,654 NIS/month, or 10% flat, or marginal rates | 4 |
| Foreign rent | 15% flat (no deductions except depreciation), or marginal rates | 4 |
| Crypto | An asset: capital gain at 25% real, unless it is a business | 5 |
| High incomes | +3% above 721,560 NIS of taxable income; +2% more on capital income above the same amount | 7 |

---

## 1. Interest on bank deposits, savings plans and bonds

| Rule | Conditions | Exceptions | Figures (year) | Source |
|---|---|---|---|---|
| Interest rate cap for individuals | Interest income of an individual is taxed at a rate "not exceeding 25%" and is treated as the top slice of income (s.125C(b)). "Interest" includes discount fees (דמי ניכיון), so makam discounts count. | See the s.125C(d) exceptions in the last row | 25% max (in force 2026) | S1 [P] s.125C(a),(b) |
| Reduced 15% rate | Interest on an asset that is not linked, or not fully linked, to the CPI is taxed at 15% on the nominal interest (s.125C(c)). The Finance Minister may change this rate by order. | Same exceptions | 15% (2026); the Tax Authority's 2026 table lists "deposit interest 15%, 25%" | S1 [P] s.125C(c); S2 p.116 [P] |
| Linked deposits | CPI-linked deposits and savings plans: up to 25% on the real interest (after removing the linkage). | | 25% | S2 pp.39-40 [P]; S1 |
| Foreign-currency deposits | s.125C(a) defines the "index" for an asset linked to or denominated in foreign currency as the exchange rate. The 2025 guide says the same. Secondary sources say FX deposits are taxed at 25% on real (FX-adjusted) interest. I found no Tax Authority sentence that says it in those words. | | | S1 [P]; S2 p.40 [P]; bizportal/capitax [snip]; **Q2** |
| Who the reduced rates do not apply to (marginal rates apply instead) | Interest that is business income or recorded in books; the individual claimed interest or linkage expenses as a deduction; a substantial shareholder in the payer; the individual is the payer's employee or service provider (unless the rate was set at arm's length); certain early withdrawals from study funds | | | S1 [P] s.125C(d) |
| Withholding | The bank withholds 15% or 25%. If the full tax was withheld and the interest is below the filing threshold, no return is needed (section 8). | | | S2 pp.3-4, 40 [P] |
| Section 125D deduction (low income) | If the income of the individual plus spouse does not exceed a ceiling, deduct a fixed amount from interest on bank deposits and savings plans. Above the ceiling, the deduction shrinks shekel for shekel. | Applies only to interest on deposits and savings plans | Ceiling 69,840; deduction 10,920 (2024-2027 per the law text; 2026 per S3) | S1 [P]; S2 p.90 [P]; S3 p.14 [P] |
| s.125D, retirement-age version | One spouse at mandatory retirement age and aged 55 or older on 1.1.2003: 15,000. Both spouses: 18,360. | | 15,000 / 18,360 (2026) | S3 p.14 [P]; S2 p.41 [P] |
| s.125E extra exemption (retirement age) | 35% of "qualifying interest" is exempt for someone at retirement age (or whose spouse is), both aged 55 or older on 1.1.2003. Qualifying interest is capped by the gap between the couple's other taxable income and the qualifying-annuity ceiling. | Interest above the cap is taxed normally | Ceiling for the gap: 113,160 (2025). Maximum exemption: 39,606 (2026 table) | S2 p.41 [P]; S3 p.14 [P] |
| Bond interest | Interest on traded bonds is taxed at 15% or 25% depending on linkage. There are special historic rates (35%, 20%) for older bonds and older accrual periods. | | | S2 p.39 [P] |

Note: Section 125C(b) says "not exceeding 25%". Whether a 60+ or low-income individual can use lower personal-effort brackets on interest (as they can on capital gains, see section 2) was not confirmed. See **Q16**.

## 2. Securities: capital gains, dividends, losses, withholding, foreign holdings

### 2.1 Capital gains

| Rule | Conditions / detail | Figures | Source |
|---|---|---|---|
| Real vs nominal | Capital gain = real gain + "inflationary amount" (the CPI-driven part of the cost). The inflationary amount built up to 31.12.1993 is taxed at 10%; the rest is exempt. | | S1 s.88 [P]; S2 p.46 [P] |
| General individual rate | Real capital gain is taxed at up to 25%, as the top slice of income (s.91(b)(1)). | 25% | S1 [P]; S2 p.46 [P] |
| Substantial shareholder (10% or more of any means of control, now or at any time in the past 12 months) | Up to 30% | 30% | S1 s.88, s.91(b)(2) [P] |
| Unlinked debt | Gains on bonds, commercial paper and loans that are not CPI-linked are taxed at up to 15% (20% for a substantial shareholder). The whole gain counts as real. The Minister may adjust these rates by order. | 15% / 20% | S1 s.91(b)(3) [P] |
| Foreign-currency securities | For FX-denominated or FX-linked assets, s.88 uses the exchange rate as the "index". So the real gain on a foreign share is measured in that currency. | | S1 s.88 [P] (summary; exact wording should be re-read before encoding) |
| Assets bought before 2012 | Real gain is split linearly across periods (rates up to 20% and 25%, or marginal rates for older periods). This does not apply to listed securities in the standard way. | | S1 s.91(b1) [P]; S2 p.46 [P] |
| Age 60+ | For individuals aged 60 or older, the starting rates on capital gains follow the personal-effort brackets (10%, 14%, 20%, then 31% from 228,001 in 2026). This helps only when other income is low. | 2026 brackets in section 7 | S2 p.46 [P]; S1 s.121(b) [P]; S3 p.10 [P] |
| Mutual funds, ETFs, money-market funds | Redemption of units in an *exempt* mutual fund by an individual: 25% withheld on the real gain. Most money-market funds elect to be exempt funds, so tax is deferred to redemption. | 25% real | capitax content/2/179 [snip]; bizportal 20038659 [snip]; **Q15** |
| Advance payment, non-traded assets | Report and pay an advance within 30 days of a sale (form 1399). | | S1 s.91(d) [P]; S2 pp.46, 117 [P] |
| Advance payment, traded securities not fully withheld (for example, at a foreign broker) | Report twice a year: by 31 July for January-June, and by 31 January for July-December. An annual return is also required. | | S2 pp.46, 117 [P] |

### 2.2 Dividends

| Rule | Detail | Figures | Source |
|---|---|---|---|
| Israeli dividend | 25%; 30% for a substantial shareholder (s.125B). Overrides the s.121 brackets. | 25% / 30% | S1 [P]; S2 p.116 [P] |
| Foreign dividend | 25% / 30%. | | S2 p.116 [P] |
| Dividend from a preferred enterprise | 20% withholding (other legacy rates apply) | | S3 p.19 [P] |
| US withholding on US-source dividends to an Israeli resident (treaty rate, claimed by filing W-8BEN with the broker) | General 25%. 12.5% applies only to qualifying direct holdings by companies. US-source interest: 17.5%. Pensions: 0% (footnote f). Table rev. May 2023. | 25% / 12.5% / 17.5% | S10 [P] |
| Foreign tax credit | Foreign tax paid can be credited against Israeli tax, within statutory limits (sections 199-210, not read). | | S2 p.47, p.49 [P]; **Q14** |

### 2.3 Losses

| Rule | Detail | Source |
|---|---|---|
| Order of offset | A capital loss is offset first against real capital gain. Any remaining loss offsets inflationary amounts at 1 NIS of loss per 3.5 NIS of inflationary amount. | S1 s.92(a)(1) [P]; S2 p.47 [P] |
| Foreign assets | A loss on an asset abroad is offset first against foreign gains. | S1 s.92(a)(3) [P] |
| Against dividends and interest | A securities loss *in the same tax year* can offset (a) interest or dividends on the same security, and (b) interest or dividends on other securities, if the tax rate on that interest or dividend does not exceed the individual rate in s.125B(1) or s.125C(b) (25%). | S1 s.92(a)(4) [P]; S2 p.47 [P] |
| Carry forward | A loss can be carried forward without time limit, but only against capital gains and betterment (not against dividends or interest), and only if it was reported in the year it arose. | S1 s.92(b) [P]; S2 pp.47, 58 [P] |
| Across banks | A bank offsets automatically within the bank. Offsetting across institutions requires an annual return (form 1322, appendix C; form 867 certificates). | S2 pp.45-47 [P] |

### 2.4 Accumulating vs distributing foreign ETFs

**Not sourced.** I found no Tax Authority publication or legislation summary that says how an Israeli resident is taxed on an accumulating foreign fund (for example, Irish-domiciled UCITS). Two questions are open: is tax due only on sale, or is there an attribution or deemed-distribution rule? See **Q1**. The IRS table (S10) shows a 15% US treaty rate on dividends to Ireland. That is a fund-level cost, not an Israeli tax rule, and it does not say whether an Israeli credit exists.

## 3. Tax-advantaged wrappers

### 3.1 Pension, kupat gemel lekitzba (sections 45A and 47)

All figures below are for 2026 unless stated.

| Rule | Detail | Figures | Source |
|---|---|---|---|
| Employee credit, s.45A | 35% credit on the employee's own contributions, up to 7% of insured salary, with insured salary capped at 9,700 NIS/month. (Life-insurance credits are 25%.) | 9,700/month | S3 p.12 [P]; S11 p.2 [S] |
| Self-employed: deduction s.47 plus credit s.45A | "Beneficiary member" (עמית מוטב): an 11% deduction plus a 5% credit (5.5% if no disability-insurance deduction), on income up to 19,400 NIS/month (232,800/year). The exact computation has several tiers. | 19,400/month; additional income ceiling 24,250/month | S3 p.12 [P]; S11 [S]; S2 pp.59-62 [P] (worked examples) |
| "Beneficiary member" test | Total pension deposits for the year must be at least 16% of the annual average wage. | 26,436 for 2026 (16% of 165,228); 24,069 for 2025 | S3 p.12 [P]; S11 [S]; S2 p.61 [P] |
| Age 50+ boost (2025 rules) | Higher deduction rates (10.5% instead of 7%; 16.5% instead of 11%) for those aged 50 or older at the start of the year, subject to caps. | 2025 | S2 p.61 [P] |
| Employer contributions | Exempt up to 7.5% of salary, with salary capped at 34,423 NIS/month (2026); severance component up to 45,600/year. | | S3 p.12 [P]; S11 [S] |
| Mandatory pension for the self-employed | 4.45% of income up to half the average wage; 12.55% on the part from half to the full average wage. | Average wage 13,769 (2026) | S11 [S]; S3 p.12 [P] (average wage) |
| Growth inside the fund | Interest, linkage and gains credited to an individual's kupat gemel from their own or their employer's deposits are exempt. | | S2 p.87, s.9(18) [P] |
| Annuity exemption, s.9A ("qualifying annuity") | Part of a qualifying annuity is exempt from retirement age. The exempt share was amended in Amendment 275. | Ceiling 9,430/month; exempt share 57% (2025), **57.5% (2026)** = 5,422/month, 62.5% (2027), 67% (2028+) | S3 pp.6, 12 [P] |
| "Recognized annuity" (קצבה מוכרת, Amendment 190) | The part of an annuity that comes from deposits that were *not* tax-benefited (for example, deposits by a self-employed person that got no credit or deduction) is fully exempt with no ceiling. Conditions: age 60 or older, or retirement because of disability of 75% or more. | | S5 pp.2-4 [P] (circular 2/2013, s.9A(b1)) |
| Lump sum ("tikun 190" route) | A lump sum is allowed only if a minimum pension is kept. Tax on capitalizing the recognized annuity: S5 says rates were "set", without the number on the pages read. Secondary sources say 15% of the nominal profit for 60+. | Minimum pension 5,306/month (2026) | S3 p.12 [P]; S5 [P]; supermarker/meitav [snip]; **Q6** |
| Non-compliant withdrawal | A withdrawal from a pension or provident fund not in line with the law: 35% (withholding table: "the higher of 35% and the marginal rate" for pension funds). | 35% | S2 p.43 [P]; S3 p.19 [P] |
| Severance grant exemption | 13,750 NIS per year of employment (27,520 on death). Pension continuity floor ("רצף קצבה") 405,900. | 2026 | S3 p.13 [P] |

### 3.2 Keren hishtalmut (study fund)

| Rule | Detail | Figures (2026) | Source |
|---|---|---|---|
| Employee: exempt employer deposit | Employer contribution up to 7.5%, employee up to 2.5%, on salary up to the "determining salary". Employer amounts above the cap are taxed as salary when deposited, and gains on them are taxed at up to 25% on withdrawal. | 15,712/month = 188,544/year | S3 p.12 [P]; S2 p.40 [P]; S11 [S] |
| Self-employed deduction (s.17(5A)) | Deduct up to 4.5% of income, with income capped. Someone who is also an employee: the cap is reduced by salary that had employer study-fund contributions. | Cap 293,397; maximum deduction 13,203 | S2 p.90, p.59 [P]; S3 p.12 [P] |
| Self-employed "benefited deposit" (gains exempt) | Deposits up to this amount, and the gains on them, are exempt on withdrawal. | 20,566 | S3 p.12 [P]; S11 [S] |
| When withdrawals are exempt | 6 years from the first deposit. 3 years if the member has reached retirement age, or for study purposes. Survivors are exempt. Gains on deposits made before 1.1.2003 are exempt even if the deposit was not benefited. | | S2 p.87, s.9(16A), (16B) [P] |
| Early (non-exempt) withdrawal | Withholding at 47% | 47% | S3 p.19 [P] |

### 3.3 Kupat gemel lehashkaa, chisachon lekol yeled, polisat chisachon, IRA

| Product | What I could source | Source |
|---|---|---|
| Kupat gemel lehashkaa | Gains are exempt if the money is withdrawn as an annuity under the conditions of s.23(1A) of the Provident Funds Law (s.9(18B)). A government guide and industry sources: a lump sum at any age pays 25% capital-gains tax; an annuity is tax-free. Annual deposit ceiling **83,641 NIS (2026)**, across all such accounts. No deduction or credit on deposits (not stated explicitly; inferred from no listing in S2/S3, see **Q12**). | S2 p.87 [P]; S11 [S]; fnx.co.il and igemel [snip]; CSC 2026 guide [snip] |
| Chisachon lekol yeled | National Insurance FAQ: "on withdrawal, capital-gains tax is charged". **Rate not stated.** Money left in the provident-fund track until retirement and taken as an annuity is said to avoid capital-gains tax. | S9 [P]; kolzchut [snip]; **Q4** |
| Polisat chisachon (insurance savings policy) | Only secondary sources: 25% of the real gain on withdrawal; switching tracks inside the policy is not a tax event; moving to another insurer is. s.125D and s.125E may apply. | as-invest, pensuni, bizportal [snip]; **Q5** |
| IRA (self-managed account) | No IRA-specific tax rule found. Presumably it follows the underlying product (kupat gemel or keren hishtalmut), but this is unconfirmed. | **Q13** |

## 4. Real estate

### 4.1 Residential rent in Israel: three tracks

| Track | Conditions | Exceptions / notes | Figures | Source |
|---|---|---|---|---|
| Exemption (Rental Income Exemption Law 1990) | Apartment let for housing to an individual; not business income; ceiling tested monthly. If rent exceeds the ceiling, the exemption shrinks: exempt = ceiling minus the excess. | No expenses can be deducted against the exempt part | **5,654 NIS/month** (2025 and 2026; 67,848/year in 2025) | S2 p.50 [P]; S3 p.13 [P] |
| 10% track (s.122) | 10% of gross rent from a dwelling in Israel. Not business income. Paid within 30 days after the end of the tax year (or through advances). | No expenses, credits or exemptions. Depreciation is added back when computing betterment on a later sale. Since 2023 (s.122(f)), rent the individual pays for their only home can be deducted, up to the lower of the rental income and 90,000/year. | 10% | S1 [P]; S2 pp.41-42, 122 [P] |
| Marginal track | Ordinary brackets, with expenses and depreciation deducted | | Brackets in section 7 | S2 p.50 [P] |
| Filing | Rent under the 10% track up to 375,000 (2025) is exempt from filing if paid correctly. Track choice affects the annual return. | | S3 p.15 [P] |

### 4.2 Foreign rent and foreign real estate

| Rule | Detail | Source |
|---|---|---|
| 15% track (s.122A) | Rent from property abroad (not business income): 15% with only depreciation deductible, no credits. Alternative: marginal rates with expenses and a credit for foreign tax. | S1 [P]; S2 p.42, 116 [P] |
| Sale of foreign property | Capital gain under Part E (25% real); FX index per s.88. Foreign tax credit applies. Interaction not checked in detail: **Q14** | S1 [P] |

### 4.3 Purchase tax (mas rechisha), Tax Authority real estate instruction 1/2026

| Case | Brackets | Validity | Source |
|---|---|---|---|
| Single residential apartment (Israeli resident) | 0% up to 1,978,745; 3.5% to 2,347,040; 5% to 6,055,070; 8% to 20,183,565; 10% above | 16.1.2025-15.1.2028 (frozen) | S4 p.2 [P] |
| Apartment that is not the only one | 8% up to 6,055,070; 10% above | **Temporary order valid to 31.12.2026** | S4 p.2 [P] |
| Oleh, single apartment (reg. 12A) | 0% to 1,978,745; 0.5% to 6,055,070; 8% to 20,183,565 (no relief above) | 16.1.2025-15.1.2028 | S4 p.3 [P] |
| "Single apartment" definition | Also counts as single if the buyer owns at most 1/3 of another apartment, or will sell the other apartment within 18 months (24 months in some cases; see instruction 2/2026) | | gov.il simulator [snip]; real estate instruction 2/2026 (not read) |

### 4.4 Betterment tax (mas shevach)

| Rule | Detail | Figures | Source |
|---|---|---|---|
| Rates | Real betterment accrued from 7.11.2001 to 31.12.2011: up to 20%. From 1.1.2012: up to 25%. Earlier portions: marginal rates (at least 31% on a linear share). Linear split by holding period. | | S2 p.48 [P] |
| Single-apartment exemption (s.49B(2)) | Israeli residents; the only apartment; held at least 18 months; no other exempt sale in the previous 18 months; exemption capped. | Cap 5,008,000 (1.1.2025-31.12.2027) | S2 p.54 [P]; S4 p.3 [P] |
| Two-apartment sale (s.49E) and additional building rights (s.49Z) | Additional caps | 2,252,000 / 3,746,000; 2,428,100 cap and 607,000 floor | S4 pp.3-4 [P] |
| Surtax on a home sale | Betterment counts toward the s.121B surtax only if the sale value exceeds the threshold | 5,385,285 (16.1.2025-15.1.2028) | S4 p.4 [P]; S3 p.11 [P] |
| Advance and reporting | Report within 30 days of the sale; self-assessment payment within 60 days | | S2 p.122 [P] |

### 4.5 REITs (קרן להשקעות במקרקעין)

Distributed income is taxed in the shareholder's hands (single-level). For individuals: the part from **residential** rent (and real betterment from selling such property) is taxed at **20%**; "excess income" at 70%; depreciation-equivalent amounts are treated as capital gain or betterment; other taxable income at the s.121 rates. The fund withholds at 20% (residential), 70% (excess), s.91 rates (gains), or the **maximum s.121 rate** on other income, unless a lower rate is approved. Source: S1 s.64A4-64A5 [P] (summary via the fetch tool; re-read before encoding).

## 5. Crypto, NFTs, gold, P2P, foreign pensions, olim

| Topic | Rule | Source |
|---|---|---|
| Crypto | Income Tax circular 05/2018 (17.1.2018): a virtual currency is an asset, not currency, so a sale is a capital gain (25% real). Swapping one coin for another is a sale. If the activity meets the business tests, it is business income at marginal rates. Mining is ordinary income. Report within 30 days on form 1399 (transactions can be grouped monthly). A process (form 909) exists for paying tax from crypto-origin funds. | S6 [P, landing page only]; S2 p.45 [P]; Knesset Research Center and State Comptroller summaries [snip] |
| NFTs | An NFT is a digital asset; its sale is a capital gain. Income from minting or creating NFTs is ordinary income (circular 05/2018 section 3.5.1 referenced). | S2 p.46 [P] |
| Gold (physical or ETF) | **Not sourced.** Presumably a capital asset, but whether VAT applies on purchase and the rate were not researched. | **Q9** |
| P2P lending | Tax rulings exist (for example, ruling 8093/17 on withholding from P2P interest) but I did not read them. Rate (15% vs 25%), withholding mechanics and bad-debt losses are unconfirmed. | capitax [snip]; **Q7** |
| Foreign pension received by an Israeli resident | s.9C: tax on a foreign-source pension is capped at the tax the source country would charge a resident there. A US pension is 0% at US source under the treaty (S10, footnote f). | S2 p.89 [P]; S10 [P] |
| New immigrant / veteran returning resident, foreign income | 10-year exemption on foreign-source income and gains (s.14(a)). | S2 p.89, p.52 [P] |
| **Reporting** exemption for olim | s.134B was **repealed for anyone who becomes a first-time or veteran returning resident from 2026**. Those people must report foreign income and assets. | S1 s.134B note [P] |
| New temporary benefit for olim (2026-2030) | Olim and veteran returning residents arriving 5.11.2025-31.12.2026 are exempt on Israeli personal-effort income up to: 600,000 (2026), 1,000,000 (2027), 1,000,000 (2028), 350,000 (2029), 150,000 (2030). A circular with conditions was promised. | S3 p.4 [P]; S7 pp.416-418 [P] |
| Foreign-currency deposits of new or returning residents | Interest exempt under conditions (for example, money transferred from abroad within 90 days, form 2402/2409) | S2 p.52 [P] |

## 6. National Insurance (Bituach Leumi) and health insurance on passive income

| Rule | Detail | Figures (from 1.1.2026) | Source |
|---|---|---|---|
| Rates on "income not from work" | Exempt up to the first threshold; reduced rate up to the second; full rate up to the ceiling | Exempt to 3,442/month; 6.92% NI + 5.17% health up to 7,703; 7% + 5.17% up to 51,910 | S8 [P] |
| Minimum | Someone with no work and no income pays the minimum | 143 + 123 = 266/month | S8 [P] |
| Employee with passive income | Pays on all income up to the 51,910 ceiling | | btl "employee with non-work income" page [P] |
| Which passive income is excluded | Secondary sources: dividends taxed under s.125B are exempt (NI law s.350(a)(6), with an exception for s.373A family companies); income taxed under s.122 (10% rent) and s.122A is exempt (s.350(a)(7)); capital gains on securities are not chargeable. Interest, and the scope of the 3,442 exemption, were **not confirmed**. | | capitax print/1724 [snip]; **Q10** |

## 7. Brackets, surtax, filing obligations

### 7.1 2026 brackets (after the bracket-widening law of 31.3.2026, retroactive to 1.1.2026)

Personal-effort income (annual): 10% to 84,120; 14% to 120,720; 20% to 228,000; 31% to 301,200; 35% to 560,280; 47% above.
Monthly: 7,010 / 10,060 / 19,000 / 25,100 / 46,690.
Non-personal-effort income: 31% to 301,200; 35% to 560,280; 47% above. The reduced brackets also apply to income of an individual aged 60 or older.
Credit point: 242/month (2026); 2,904/year (2025).
Sources: S3 pp.4, 10, 12 [P]; S1 s.121 [P]; S7 p.416 [P]. The 2025 brackets (20% only to 193,800; 31% to 269,280) are in S2 p.96.

### 7.2 Surtax (mas yesef), s.121B

| Rule | Detail | Figures | Source |
|---|---|---|---|
| Base surtax | 3% on taxable income above the threshold | 721,560 (2024-2027) | S1 [P]; S3 p.11 [P] |
| Capital surtax (from 2025) | **An additional 2%** on "taxable income from capital sources" above the same threshold. The statute's text tests capital income *on its own* against the threshold ("יחיד אשר הכנסתו החייבת ממקורות הוניים ... עלתה על הסכום"). Capital income = taxable income excluding s.2(1)-(2) (business, employment) and personal-effort income. Above the threshold, capital income therefore carries 3% + 2% = 5%. | 2% | S1 s.121B(a1) [P]; S3 p.11 [P]; capitax [snip] agrees; **Q11** |
| What counts as taxable income | Excludes the inflationary amount; includes betterment, but a home sale counts only if its value exceeds 5,385,285 | | S1 s.121B(e) [P]; S4 [P] |
| No advance payments | s.91(d) advances do not apply to the surtax | | S1 [P] |

### 7.3 Who must file an annual return

| Trigger | Detail | Source |
|---|---|---|
| General rule | Every resident aged 18 or older must file unless exempted by the Exemption Regulations (1988). A person required to file last year must file this year unless the assessing officer exempts them. | S1 s.131, 134A [P]; S2 pp.3-4 [P] |
| Ceilings for the exemption (2025 figures, in S3 under "for tax year 2025") | Salary 723,000; rent under the 10% track 375,000; foreign income 375,000; foreign pension 375,000; interest 717,000; **sale proceeds from securities 2,810,000**; other income 375,000. Tax must have been fully withheld. | S3 p.15 [P]; S2 p.4 [P] |
| Must file regardless | Liable for surtax (taxable income above 721,560); held foreign assets worth more than 2,086,000, or foreign bank accounts above 2,086,000 on any day; control of a foreign company; any income where tax was not fully withheld (for example, a foreign broker) | S2 pp.3-4 [P]; S3 p.15 [P] |
| Transfers abroad | A resident individual who transferred 500,000 NIS or more **out of Israel** within 12 months (s.131(a)(5F)) | S1 [P] |
| Shortened route | Capital gains, interest and dividends taxed at 15% or 25% where an advance was paid through the "shortened reporting" route can be exempt from a full return, subject to the ceilings | S2 p.3 [P] |
| Deadlines | Tax year 2025 return (form 1301): 31.3.2026 nominal (the Tax Authority grants extensions every year); online filers: 31 May | S2 pp.3, 122 [P] |

## 8. Withholding vs self-reporting (summary)

- An Israeli bank or broker withholds on interest (15%/25%), dividends (25%/30%) and capital gains on securities (25% real; 15% unlinked bonds). Losses are offset automatically within that institution. (S2 pp.39-47, 116-117 [P])
- At a foreign broker nothing is withheld in Israel: report semi-annually, pay advances, and file an annual return. (S2 p.117 [P])
- Foreign withholding (for example, US 25% under the treaty with W-8BEN) is credited in the return. (S10, S2 p.47 [P])

## 9. Changes legislated or announced for 2025-2027

### 9.1 Legislated

| Change | Effective | Source |
|---|---|---|
| Freeze of statutory indexation of tax amounts (brackets, credit points, many ceilings) | Tax years 2025-2027 (Economic Efficiency Law 2025, published 26.12.2024, SH 3342) | S3 p.3 [P]; S4 p.1 [P] |
| Extra 2% surtax on capital income | From 2025 | S1 s.121B(a1) [P]; S2 p.96 [P] |
| Tax on undistributed ("trapped") profits of closely held companies: 2% of "excess profits" a year, with exemptions (for example, if enough is distributed) | From 2025 (Amendment 2025-3; transitional rules not read). Petitions against it dismissed 5.5.2026 [snip]. Relevant only if the user owns a company. | S1 s.81A-81F [P] |
| Bracket widening: 20% up to 228,000/year, 31% up to 301,200 | From 1.1.2026 (law of 31.3.2026) | S7 [P]; S3 p.4 [P] |
| Olim personal-effort income exemption (temporary order 2026-2030) | Arrivals from 5.11.2025 to 31.12.2026 | S7 [P]; S3 p.4 [P] |
| Repeal of the olim reporting exemption (s.134B) | People who become residents from 2026 | S1 [P] |
| Qualifying-annuity exemption path: 57% / 57.5% / 62.5% / 67% | 2025 / 2026 / 2027 / 2028+ (Amendment 275) | S3 p.6 [P] |
| Purchase-tax temporary order for additional apartments (8%/10%) | Ends 31.12.2026. What applies from 2027 is unknown. | S4 [P]; **Q21** |
| Quarterly reporting by financial service providers (s.141A) | From Q3 2026; not a tax on savers | S7 p.415 [P] |
| "Material holding" definition for provident funds (s.9(2)(b)) | 2026 law, chapter B; technical, fund-level | S7 p.415 [P] |

### 9.2 Announced or proposed (not law)

- Narrowing the keren hishtalmut gains exemption, for example to gains accrued in the first 6 years only. Proposed for 2025 and 2026 and dropped. The Finance Ministry tax committee is still considering it for the 2027 budget. (S12 [S], 12.10.2026)
- Further bracket widening (31% starting above about 19,000/month), cutting child credit points, a vacant-land tax; an estate tax was considered and dropped. (S12 [S])

## 10. Rules most likely to change or to be misremembered

1. **2026 brackets.** Many websites still show the 2024/2025 brackets (20% only to 16,150/month). The 2026 table is different (S3).
2. **Surtax is now two-part** (3% + 2% on capital income above 721,560). Older material shows 3% only. How the 2% threshold is tested (capital income alone) is easy to get wrong (Q11).
3. **Annuity exemption percentage.** Circular 2/2013 says 67% "in 2025". Amendment 275 changed this to 57% (2025), 57.5% (2026), 62.5% (2027), 67% (2028+).
4. **Frozen vs indexed figures.** Most tax amounts are frozen 2025-2027, but anything tied to the average wage (pension ceilings, the "beneficiary member" test 24,069 → 26,436, minimum pension) still changes every year.
5. **15% vs 25% on interest and bonds**: unlinked = 15% nominal; linked and FX = 25% real. Mutual and money-market funds are taxed at 25% real on redemption even when they hold unlinked bonds (secondary, Q15).
6. **Purchase-tax temporary order** for additional apartments expires 31.12.2026.
7. **Keren hishtalmut exemption** has been proposed for cuts in three budgets in a row.
8. **Olim rules** changed in 2026 (reporting exemption gone for new arrivals; new income exemption).
9. **National Insurance thresholds** are reset every 1 January.
10. **Rental exemption ceiling** (5,654/month) and the s.125D/E amounts look stable only because of the freeze. They will move when the freeze ends after 2027.

## 11. Coverage method, and what was left out

### 11.1 What I enumerated from

- **Income Tax Ordinance, consolidated text** (Hebrew Wikisource, updated through 5786/2026 amendments), S1. I worked through it by parts: s.2, 9, 9A, 9C, 14 (exemptions); 17(5A), 45A, 47 (deductions and credits); 64A2-64A11 (REITs); 81A-81F (trapped profits); Part E s.88-101A (capital gains); Part G s.121-126 (rates); Part H s.131, 134A, 134B (filing).
- **Tax Authority annual guide "דע זכויותיך וחובותיך 2025"** (S2), read cover to cover: filing obligations, every field of form 1301, the exemptions/deductions/credits table (pp.86-95), rates (p.96), special-income rates (p.116), deadlines (p.122).
- **Tax Authority deductions booklet for January 2026 onward, updated April 2026** (S3): all 2026 amounts.
- **Real Estate Taxation Instruction 1/2026** (S4).
- **Income Tax circulars**: 2/2013 (Amendment 190, S5), 05/2018 (crypto, S6; landing page only).
- **Sefer HaChukim 3511, 31.3.2026** (Economic Efficiency Law 2026), S7.
- **National Insurance** rate pages and the chisachon lekol yeled FAQ (S8, S9).
- **IRS Table 1** (S10).
- Industry cross-check: Harel 2026 ceilings (S11). Press for proposals: Calcalist 12.10.2026 (S12).
- **Kol Zchut returned HTTP 403 on every fetch**, so no Kol Zchut page was used as a source.

### 11.2 Deliberately left out

- Business and self-employment taxation beyond pension and study-fund benefits; VAT; municipal tax (arnona). These are not about saving or investing.
- Employee equity (s.102 options, RSUs, ESPP). Large topic; a separate track if relevant.
- Trusts, controlled foreign companies, family companies (except a pointer to the trapped-profits tax).
- US citizenship-based taxation (FATCA, PFIC) for dual citizens. Important if the user is a US person, but that is US law and out of scope.
- Derivatives and forex trading as a business; gambling and prizes.
- Detailed pre-2012 and pre-2006 transitional computations (they matter only for very old holdings).
- Inheritance and gift: none researched beyond the press note that an estate tax was considered and dropped.

## 12. Open questions (do not fill from memory)

- Q1. How are accumulating foreign ETFs (for example, Irish UCITS) taxed for an Israeli resident: on sale only, or with any attribution rule? No official source found.
- Q2. Is there an explicit Tax Authority statement that FX deposit interest is taxed at 25% on FX-adjusted real interest?
- Q3. Has the Minister ever used the power (s.125C(c), s.91(b)(3)) to change the 15% rate?
- Q4. What is the tax rate and base on chisachon lekol yeled withdrawals?
- Q5. Is there a primary source for polisat chisachon taxation (25% real; switching insurers)?
- Q6. What is the rate on lump-sum capitalization of a recognized annuity (Amendment 190), and its exact conditions? Secondary sources say 15% nominal.
- Q7. P2P lending: rate, withholding, and loss treatment (tax ruling 8093/17 not read).
- Q8. Crypto: any update to circular 05/2018 (staking, airdrops, DeFi), and treatment of Israeli crypto mutual funds.
- Q9. Gold: capital-gains treatment of physical gold, and VAT on purchase.
- Q10. National Insurance: the full list of passive income excluded under NI law s.350; whether interest is charged; who gets the 3,442 exemption; treatment of pensioners.
- Q11. The 2% capital surtax: confirm with a Tax Authority circular that the threshold is tested on capital income alone.
- Q12. Official (Capital Market Authority) source for the kupat gemel lehashkaa ceiling, and confirmation that deposits get no deduction or credit.
- Q13. IRA-specific tax rules, if any.
- Q14. Foreign tax credit mechanics (s.199-210): per-country or per-income-type limits; whether Israeli banks withhold extra on foreign dividends already taxed abroad.
- Q15. Mutual funds: exempt vs taxable funds; whether any fund type gets 15% nominal; a primary source.
- Q16. Can a 60+ or low-income individual use the lower brackets on interest (as on capital gains)?
- Q17. Salary filing threshold: 723,000 (S3 table) vs the 721,560 surtax trigger. Which governs in practice for 2025 and 2026?
- Q18. 2027 budget: will the keren hishtalmut exemption narrowing, a vacant-land tax, or more bracket changes be legislated? Re-check after the budget is published.
- Q19. Is there any Israeli rule similar to the US PFIC rule for foreign funds?
- Q20. The circular on conditions for the 2026-2030 olim exemption.
- Q21. Purchase-tax brackets for additional apartments from 1.1.2027.
- Q22. The official gov.il URL of the April 2026 deductions booklet. Only a January link was seen in search; S3 was read from a mirror.

## Sources

| Code | Source | Type | Checked |
|---|---|---|---|
| S1 | Income Tax Ordinance (consolidated), Hebrew Wikisource: https://he.wikisource.org/wiki/פקודת_מס_הכנסה (raw: `?action=raw`) | Legislation [P]; read in 100k-character chunks via a fetch tool that paraphrases. Exact wording must be re-read before encoding. | 2026-10-22 |
| S2 | Tax Authority, "דע זכויותיך וחובותיך 2025" (guide to form 1301 for 2025): https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf | Tax Authority [P] | 2026-10-22 |
| S3 | Tax Authority, deductions booklet for January 2026 onward, "updated April 2026". Read from a mirror: https://www.capitax.co.il/Attachments/15042026.pdf. A January 2026 edition appears on gov.il: https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf (not opened) | Tax Authority [P] | 2026-10-22 |
| S4 | Real Estate Taxation Instruction 1/2026 (18.1.2026): https://www.gov.il/BlobFolder/policy/inst-01-2026/he/realestate_inst-01-2026.pdf | Tax Authority [P] | 2026-10-22 |
| S5 | Income Tax circular 2/2013 (Amendment 190, s.9A): https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf (pp.1-5 read) | Tax Authority [P] | 2026-10-22 |
| S6 | Income Tax circular 05/2018 (virtual currencies): https://www.gov.il/he/departments/policies/income-tax-professional-inst-5-2018 | Tax Authority [P]; landing page seen, full text not read | 2026-10-22 |
| S7 | Sefer HaChukim 3511 (31.3.2026), Economic Efficiency Law 2026: https://fs.knesset.gov.il/25/law/25_lsr_12235101.pdf (pp.414-418 read) | Legislation [P] | 2026-10-22 |
| S8 | National Insurance, rates for non-employees and non-work income: https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx | Regulator [P] | 2026-10-22 |
| S9 | National Insurance, chisachon lekol yeled tax FAQ: https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx | Regulator [P] | 2026-10-22 |
| S10 | IRS Tax Treaty Table 1 (rev. May 2023): https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf | IRS [P] | 2026-10-22 |
| S11 | Harel, "תקרות וסכומים לשנת 2026": https://media.harel-group.co.il/media/eh3fyryd/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf | Industry [S] | 2026-10-22 |
| S12 | Calcalist, 12.10.2026, Finance Ministry tax committee plans: https://www.calcalist.co.il/local_news/article/skys1wkozg | Press [S] | 2026-10-22 |
| other | Snippet-only leads: capitax.co.il (content/2/179, print/1724, print/3171), fnx.co.il, igemel-net.co.il, bizportal, bshcpa.co.il, supermarker | [snip] | 2026-10-22 |
