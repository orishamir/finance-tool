# Golden scenarios: independent workings

Written 2026-10-22 as an independent check of `tests/golden/scenarios.md`, at the founder's request.

## How this was done

- Every formula was derived from the `il-finance` rule base (`.claude/skills/il-finance/references/`, all rules checked 2026-10-22). `docs/method.md` was used only for what each output means, the comparison basis (B1 to B3) and the default assumptions (A-nn).
- All arithmetic is in [`expected_calc.py`](expected_calc.py) (Python 3, standard library only). Run `python3 tests/golden/expected_calc.py` from the repository root. It rewrites the generated part of this file and the "Independent check" line under each scenario's "Expected" in `scenarios.md`. Full precision throughout; figures are rounded to two decimals for display only.
- No scenario input was changed. Where an input is missing, the scenario says so and the question is listed below. Where a rule is open, the number is not computed.
- Each step in the scenario sections names the rule it uses, linked to that rule's first source. The full list of rules is at the end.
- Where my formula differs from `docs/method.md`, I did not pick a side. Both versions are listed under "Differences" and, where both can be computed, the scenario gives both results. Those scenarios are marked "pending".

## Conventions: modelling choices no rule decides

These are not rules. The first four come from the scenario header and the method's stated defaults; the rest are my choices where the method is silent, each listed again under Questions if it matters.

| ID | Convention | Basis |
|---|---|---|
| C1 | Monthly grid: T = 12 × years. The "now" amount is invested at t = 0, the start of month 1. Monthly contributions are made at the start of months 1..T. Growth runs over the month; fees, coupons and distributions fall at month end; exit is at the end of month T. | A-05; scenario header |
| C2 | CPI index I_m = (1 + π)^(m/12), exchange-rate index X_m = (1 + f)^(m/12). A lot opened in month m uses I_m; the "now" lot uses I_0 = 1. | F-03/F-04 grid, named in the scenario header |
| C3 | Constant-real contributions C_m = C × I_m unless the scenario says nominal. | A-04 |
| C4 | Balance fees are φ/12 of the month-end balance. | scenario header (F-07) |
| C5 | Effective annual rates become monthly rates as (1 + r)^(1/12) − 1. Rates the rules say are annual nominal tariff rates become r/12 (see D2). | [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>), [BANK-13](<https://www.boi.org.il/media/orgfwntb/447.pdf>) |
| C6 | A fund's own annual costs δ (management, trustee, variable fee, fund-level withholding) come off the monthly return as δ/12. | [MF-16](<https://he.wikisource.org/wiki/חוק_השקעות_משותפות_בנאמנות>) (computed daily, deducted from fund assets); same approximation as method F-10 |
| C7 | Quarterly items (custody, distributions) fall at the end of months 3, 6, 9, 12 and so on. | tariff periods in the scenarios |
| C8 | Tax years follow the grid: months 1–12 are the first calendar year. This decides which fees are "same year" for TXS-06, which calendar year a kupat gemel lehashkaa deposit counts in, and the year the person turns 60. | Q2 |
| C9 | A custody, account or IRA manager fee charged on a brokerage holding is paid by removing units at NAV, oldest lot first, and those units take their cost with them. The removal itself is not taxed. That last part is a simplification: a real sale would be taxed. | Needed for B1 (equal outlay); decided with D3, now in method F-08 step 5 |
| C10 | A commission is a percentage of the trade value, so cash = trade value + commission. | [BRK-16](<https://boi.org.il/media/w2lgmymp/159a.pdf>) |
| C11 | Cost basis = the price paid on the exchange (including the half-spread). Commissions and FX fees are left out, a conservative choice because no rule allows them (G-20). | [TXG-12](<https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw>) |
| C12 | Consideration on a sale = gross sale value at the bid. The year's custody and management fees are deducted from the gain once. | [TXG-12](<https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw>), [TXS-06](<https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)>) |
| C13 | Default profile: under 60, salaried, Israeli resident. Passive income then starts at 31%, so the 25% and 15% ceilings bind. | [TXG-03](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) |

## Differences from docs/method.md: your decision needed

For each difference: what the method says, what the rule base says (with its source), which scenarios it touches, and both results where both can be computed.

**D1. National Insurance and health contributions on interest, dividends and gains (F-28). Decided 2026-10-22: health tax is outside what the site compares (product D14). F-28 now says so, and the expected results, which never included it, stand. Then checked in the founder's Chrome the same day: the Health Insurance Law charges health tax on the income National Insurance is charged on (s.2, new rule [TXG-34](<https://he.wikisource.org/wiki/חוק_ביטוח_בריאות_ממלכתי>)). So the exemptions in TXG-27 and TXG-28 cover it too, and zero is now a sourced figure. Exception: early study-fund withdrawal gains (G-27, Q24).** Kept for the record:
- Method F-28: zero on everything the engine models, citing TXG-27 and TXG-28.
- Rule base: National Insurance is exempt for special-rate interest and dividends ([TXG-27](<https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw>), s.350(a)(6)), and capital gains are outside the NI base by inference ([TXG-28](<https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw>)). Whether health-insurance contributions follow the same exemptions is open (TXG OQ2(a)). So is whether an employee's passive income gets the 25%-of-average-wage disregard (TXG OQ2(b), [TXG-26](<https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx>)).
- Scenarios: every scenario with interest, dividends or gains.
- Results: the numbers here use zero, as the method does. Under D10 the health part of the "social contributions" dimension would show as blocked. No second number is possible, because the health rule is not in the rule base.

**D2. Bank rates quoted as nominal or effective (F-07, F-26, F-60). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method F-07 kept (rates converted as effective); the other reading moves results by under 0.01%.**
- Method F-07: converts bank deposit rates as effective annual rates, (1 + r)^(1/12) − 1, saying bank deposits "are quoted that way (BANK-04)".
- Rule base: rates in the directive 447 publication are "annual nominal percentages" ([BANK-13](<https://www.boi.org.il/media/orgfwntb/447.pdf>)). That publication is the source of A-25 (current account) and of the offer a person sees in the bank's app (A-26). [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>) requires the effective rate to be stated as well, but it does not make the quoted rate effective. A rate credited monthly at an annual nominal r gives r/12 a month. The rule base does not say which convention the BoI average series (A-21) uses.
- Scenarios: S05 (current account, A-25), S41 (A-21, A-25, A-26), S04 if 3.35% is a tariff rate. S01 is unaffected because it says "effective".
- Results: both are computed in those scenarios. The gap is small: 0.29 NIS in S05 and about 2 NIS a month in S41.

**D3. Tax basis and fee deductions on securities (F-08, F-09). Decided 2026-10-22: the founder chose the rule-base version of all four parts.** `docs/method.md` F-08, F-09, F-12 and G-20 were corrected to match, and the expected results use it. Kept for the record, the four parts were:
- (a) Fees taken from the holding. F-08 step 5 reduces B by custody and account fees but does not reduce P or K. F-09 then subtracts the exit year's fees from the gain again. Read as written, every fee from every year lowers the taxable gain, and the exit year's fees count twice. [TXS-06](<https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)>) allows only management and custody fees paid in the same tax year, once. In my ledger a fee removes units together with their cost (C9), and the exit year's fees are deducted once.
- (b) Sale commission and FX fee at exit. F-09 sets R_T = B_T − fee_exit − fee_fx, so both reduce the gain. No rule allows deducting a sale commission. [TXG-12](<https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw>) defines the gain as consideration minus cost, and TXS-06's deductible "expenses" are only management and custody fees. G-20 covers purchase commissions, not sale commissions. In my ledger the consideration is the gross sale value.
- (c) Half-spread. F-08 subtracts the half-spread like a fee, so the basis N_m excludes it. The cost of a security is the price paid ([TXG-12](<https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw>)), and the ask price includes the half-spread ([ETF-06](<https://mayafiles.tase.co.il/rpdf/1727001-1728000/P1727829-00.pdf>)). In my ledger the basis includes it.
- (d) Commission base. F-08 charges fee_trade(D_m) on the whole cash amount. A commission is a percentage of the trade ([BRK-16](<https://boi.org.il/media/w2lgmymp/159a.pdf>)), so cash = trade + commission. This changes results by less than 0.1% of the commission.
- Scenarios: S06–S09, S14–S16, S33–S36, S38, S39, S43–S45, S47, S48.
- What the choice changed, before it was made: S34 real gain 36,635 by the rules vs 25,693 by the method (tax at the brackets 4,164 vs 2,632); S36 capital-gains tax 73,032 vs 62,063; S14 tax at exit 2,392 vs 1,616. Part (a) accounted for nearly all of it. The rules version gives more tax, because fees from earlier years no longer reduce the taxable gain.

**D4. Coupon frequency of a fixed-rate government bond (F-25). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method F-25 citation corrected; frequency for fixed-rate series comes from data.**
- Method F-25: "Coupon c once a year (GOV-11)" for every government bond.
- Rule base: [GOV-11](<https://www.nevo.co.il/law_html/law01/999_564.htm>) covers CPI-linked bonds only. For fixed-rate shekel bonds the coupon frequency is not sourced ([GOV-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf>), GOV OQ4).
- Scenarios: S08 and S35. Their numbers stand because the scenario fixes "paid yearly", but the method's citation is wrong and real series will need the frequency from data.

**D5. CPI-linked bond under deflation (F-25, S10). Decided 2026-10-22 by research in the founder's Chrome: a Supreme Court ruling (עע"מ 7486/14, new rule TXI-25) says interest is taxed in full even when linkage is negative, and the linkage loss is not offset. That supports the method's result. The one open piece, a sale loss offsetting the year's coupon, is worth at most about 410 NIS (0.4%), under the 0.5% line.** Kept for the record:
- Method: computes 25% tax on the reduced coupon and does not carry the real loss.
- Rule base: the TXI worked statement says "with deflation (negative linkage) do not compute (open question 6)". The Galil row also leaves "negative real yield and deflation" open ([TXI-14](<https://www.nevo.co.il/law_html/law01/999_564.htm>), [GOV-12](<https://www.nevo.co.il/law_html/law01/999_564.htm>)).
- Results: S10 gives the pre-tax ledger (the rule base's side) and the method's taxed result.

**D6. Accumulating foreign fund (F-65, S16). Decided 2026-10-22 by Chrome research: no Tax Authority statement exists; one secondary source (a personal-finance blog, recorded in TXF-11) agrees that tax falls only at sale. The value computes, labelled "secondary source", and stays listed, not ranked.** Kept for the record:
- Method F-65: computes the value under the TXF-11 reading and lists the variant without ranking it.
- Rule base: [TXF-11](<https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94>) treats accumulating-fund taxation as open until TXF OQ1 closes or you accept the reading. coverage.md F4 says the variant "stays blocked ... unless you accept the reading". Under D10 an open rule does not compute.
- Results: S16 gives the computed value and marks it "pending D6".

**D7. Child-savings deposit indexation (F-54, S31, S32). Decided 2026-10-22: the rule is clear and primary (CS-03, annual 1 January update), so method F-54 now uses it.** Kept for the record:
- Method F-54: indexes the deposit monthly, 58 × I_m.
- Rule base: the 58 NIS is updated once a year, on 1 January, by the CPI rise ([CS-03](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx>); the parental addition the same way, [CS-04](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx>)).
- Results: both are computed. At 18 the annual step gives 52,470.43 and the monthly index 53,018.76 (S31, boy).

**D8. Minimum fee-discount period (F-16, A-19, S22). Decided 2026-10-22 by research: the circular's scope (s.5(a)) excludes only sector and guaranteed-return funds, so it covers kupat gemel lehashkaa: 5 years. The bylaws' 2 years is the replaced 2012 rule (PF-13 note). S22's 24-month reversion is not allowed; the expected result keeps 0.5% for all 60 months.** Kept for the record:
- Method: takes the period from the provider record; S22 reverts the fee at month 24.
- Rule base: the CMA circular sets 5 years (primary) and the bylaws say 2 years (institution, [KGL-16](<https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf>)). [PF-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) says "the site should show both and not compute with either".
- Results: S22 gives both.

**D9. Study-fund early withdrawal: the tax rate on gains (F-47, S24b). Decided 2026-10-22: no outside statement was found, but the rule base's primary rules settle it (TXH-11, TXH-13, TXG-03): 31%. F-47 now says so.** Kept for the record:
- Method F-47: gains taxed "at the marginal brackets". Its τ_m (F-31) comes from the personal-effort brackets on salary, which for a 144,000 salary is 20%.
- Rule base: the gains are interest income taxed at the ordinary s.121 rates ([TXH-13](<https://he.wikisource.org/wiki/צו_מס_הכנסה_(קביעת_סכומים_ששולמו_מקרן_השתלמות_כהכנסה)>), [TXH-11](<https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מסכומים_ששולמו_מקרן_השתלמות)>)). Income that is not from personal effort starts at 31% for someone under 60 ([TXG-03](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>)).
- Results: S24 gives both, 500.27 at 31% and 322.76 at 20%.

**D10. Child savings, bank route: tax (F-50, F-21, S32). Decided 2026-10-22 by research: a dated press guide (Tashkif, 25.9.2026, recorded in TXK-23) gives 15% of the nominal gain for an unlinked bank deposit and 25% of the real gain for the provident route and linked deposits. Computes, labelled "secondary source". This also unblocked S31's exit tax (G-17).** Kept for the record:
- Method: "derived": 15% of the interest, as F-21.
- Rule base: tax on the bank route is not sourced ([TXK-22](<https://he.wikisource.org/api/rest_v1/page/pdf/חוק_הביטוח_הלאומי>), TXK OQ1), and [TXK-20](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx>) gives no official rate. Under D10 it does not compute.
- Results: S32 gives the gross figure and the method's 15%.

**D11. Irish withholding on an Irish fund's distributions (F-20, S19). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method kept; no effect while Irish withholding is 25% or less.**
- Method: uses 0% and flags it (G-05).
- Rule base: open ([TXF-16](<https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94>), TXF OQ6).
- Effect: because Israel's 25% is credited against foreign tax, any Irish rate up to 25% leaves the total at 25%. The open point only matters above 25%. S19 is not computed anyway (Q5).

**D12. Gain on an unlinked bond at 60 or over (F-42, S35). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method kept; no effect in any scenario.**
- Method: "Fixed-rate items (15% unlinked interest, unlinked bonds) are not reduced."
- Rule base: the gain on an unlinked bond is taxed at a rate "not exceeding 15%", which is a maximum rate ([TXI-12](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>), [TXS-03](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>)). Whether the 60+ brackets reduce it is open ([TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), TXG OQ10). Coupon interest is a fixed 15% ([TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>); TXI OQ9 still noted).
- Effect: none in S35, where the gain is at most 0.

**D13. How the 25% cap combines with the 60+ brackets (F-42, S34). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method F-42 rewritten to the slice-by-slice formula, which costs nothing and is what TXG-07 says; same numbers.**
- Method: min(25% × real, Brk(Y + real) − Brk(Y)).
- Rule base: the lower brackets apply first and 25% is only a ceiling ([TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>)). Read slice by slice, that is min(bracket rate, 25%) for each slice. The two formulas differ once Y + real reaches the 31% band.
- Effect: none in S34 (Y + real = 96,635); both give 4,164.12.

**D14. Wrong formula cited for the money-market fund exit, and the after-tax conversion in F-60. Closed 2026-10-22 as too small to matter (under 0.5% of the result): F-60 citation corrected to F-40; F-60 formula kept (about 0.3 NIS a month).**
- F-60, and the S11 and S13 headers, cite F-44 (the kupat gemel lehashkaa exit) for the money-market fund's exit tax. The fund rule is F-40, from [TXS-12](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>).
- F-60's (1 + r_net)^(1/12) − (1 + r_cc)^(1/12) applies tax to an annual rate. A one-month deposit is taxed at each monthly maturity, which gives 0.85 × the monthly rate. The two differ by about 0.3 NIS a month on 60,000 (S41).

**D15. Institution-strength figures used without a label. Closed 2026-10-22 as too small to matter (under 0.5% of the result): no change; affects labels only, not numbers.**
- The kupat gemel lehashkaa ceiling of 83,641 comes from institution sources only ([KGL-03](<https://media.harel-group.co.il/media/eh3fyryd/תקרות-הפקדה-בקופות-הגמל-ובקרנות-השתלמות-2026.pdf>)). So does the 2-year discount period (KGL-16). The 25%-of-real-gain withholding rests on institution and press sources ([TXK-07](<https://www.harel-group.co.il/long-term-savings/funding-saving/join/doclib/%d7%92%d7%9e%d7%9c%20%d7%9c%d7%94%d7%a9%d7%a7%d7%a2%d7%94.pdf>)).
- D10 has no policy for institution strength (coverage F1). Method §8 uses 83,641 without a label; F-44 labels the base "secondary".
- Scenarios: labels only, in S20–S22, S38 and S39.

**D16. Direct investment expenses (F-15, A-18). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method F-15 kept (expenses added to the balance fee); about 3 NIS on 170,000.**
- Method: adds them to the balance fee charged on the member's balance.
- Rule base: they are deducted from the fund and show in returns ([PF-10](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(הוצאות_ישירות_בשל_ביצוע_עסקאות)>)).
- Effect: second order. S20 shows both.

**D17. When the pension credit arrives (F-30). Closed 2026-10-22 as too small to matter (under 0.5% of the result): method kept (credit in the same month); timing only.**
- Method: assumes the s.45A credit arrives through payroll in the same month.
- Rule base: whether payroll grants it monthly is open ([TXP-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), TXP OQ6).
- What I did: spread the annual credit evenly over the months. This affects timing only (S27, S30).

## Questions: missing or unclear rules, and missing inputs

**Closed 2026-10-23 by filling missing test inputs from neighbouring examples (the founder approved). Each scenario section marks its filled values:**
- Q5 (S17–S19): start rate 3.107 NIS/USD, the BoI representative rate of 22.10.2026 ([EDGE](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS?format=csv&lastNObservations=3&labels=name>)). IVV share price USD 776.56, NAV of 21.10.2026 ([iShares](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>)). Distributions quarterly.
- Q7 (S26): market and fees as S23.
- Q8 (S28): as S27.
- Q9 (S29) inputs: market and fees as S27.
- Q11 (S32): 3% kept after 18.
- Q13 (S40): every wrapper's terms from S01, S05, S06, S08, S11, S14 and S20.
- Q14 (S41): π 3%, as S11.
- Q17:
  - S46: r_g 6%, π 2.5%; P-04 from data/parameters.
  - S49: cash held as S11, bonds as S15.
  - S50: two brokers built from S44's bank A.

**Closed 2026-10-23 as technical choices Claude makes (the founder deferred these):**
- P-04 (classification fit) in `data/parameters/classification-fit.json`.
- Q16: S44 and S45 assumptions kept as stated in Q16.
- Q18 (ii) and (iii): insurance charged on all deposits, as entered; salary constant.
- Q18 (i): the S27 title "credit cap not binding" is wrong (the cap binds). That is a text fix for the scenario author; the numbers already follow the rule.
- P-02, P-03 and P-06 in `data/parameters/`, with the reasons in `docs/parameters-rationale.md`.

**Closed 2026-10-22 as under the founder's 0.5% line (current choice kept):**
- Q1: paying each month a month later moves S14 by 0.23% and S39 by 0.28%.
- Q2: tax-year alignment only moves which quarter's custody fee counts.
- Q3: income assumed above the TXI-20 range, as in the founder's own profile.
- Q4: S12 uses the exit-date value V/I_12; V/I_14 is 0.49% lower.
- Q10: S31 boy vs girl differs by about 20 NIS; both stay shown.
- Q11: the S13 part only; the fund-level base question is a few shekels. The S32 rate after 18 stays open.
- Q15, Q19, Q20, Q21 and Q22: as assumed.
- Q23: the switching cost is 0 either way.

**Timing and profile (all scenarios)**
- Q1. Is the first monthly contribution made at the same moment as the "now" amount (my C1), or a month later? Is each one a separate order (A-28, "1 trade per contribution")?
- Q2. Do tax years follow the grid, with month 1 = January (C8)?
- Q3. S03 and S05 give no income. I assumed income above 80,760, which makes the low-income deduction zero ([TXI-20](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>)). Whether that deduction applies to current-account interest is open (TXI OQ11).

**Missing inputs, by scenario**
- Q4. S12: the exit is at month 12 and the horizon is month 14. Should the real value be V/I_12 or V/I_14? Both are shown.
- Q5. S17–S19: I need the NIS/USD rate at the start and the ETF's share price. The broker's minimum is USD 2.5, plus USD 0.01 a share above 250 shares ([BRK-36](<https://www.inter-il.com/regulation-and-security/>)), and the estate-tax flag tests USD 60,000 ([TXF-27](<https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns>)). Should distributions be quarterly (ETF-30)?
- Q6. S24(a): when B3 moves the horizon to month 72, do the 300/month contributions continue past month 48? **Decided 2026-10-23 as product D16:** contributions stop at the goal's horizon and the balance grows to the unlock date. Applied to S24 and S26.
- Q7. S26 has no r_g, π or fees. Also, the first lawful exit is month 84, not 72: the first payment is in December of year 1, and the clock runs from the end of that month ([TXH-09](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>), [KH-11](<https://as-invest.co.il/media/khpp32k5/אלטשולר-שחם-השתלמות-תקנון-מהדורת-שינויים-דצמבר-2024.pdf>)). Should the horizon be 7 years, or should it be listed under B3?
- Q8. S28 has no r_g, π, fees or employer rates. Are they "as S27"? Its text says "10,800/year already credited", but only 8,148 can be credited ([TXP-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>)).
- Q10. S31: the child's sex decides whether the grant comes at 12 or 13 ([CS-13](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx>)). Both are shown, with doubling from month 1.
- Q11. S13: is the fund-level 15% charged on gross interest (used here) or on interest after fund fees? TXS-11 is derived and silent on this. S32: what is the bank rate after 18? The horizon runs to 21.
- Q13. S40 gives no terms for any wrapper: deposit term and rate type, current-account rate, bond coupon, makam and brokerage tariffs, KGL and ETF fees.
- Q14. S41: the daily money-market fund's after-tax return needs π. No makam commission is given, so the makam row is computed without one.
- Q15. S43: I assumed quarterly distributions. I ignored the bank's Israeli withholding on top of the US 25% and used final tax only (A-14), because what the bank withholds is open ([TXF-10](<https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%A8%D7%99%D7%91%D7%99%D7%AA,_%D7%9E%D7%93%D7%99%D7%91%D7%99%D7%93%D7%A0%D7%93_%D7%95%D7%9E%D7%A8%D7%95%D7%95%D7%97%D7%99%D7%9D_%D7%9E%D7%A1%D7%95%D7%99%D7%9E%D7%99%D7%9D)>), TXF OQ3).
- Q16. S44 and S45 — I made these assumptions; confirm or change them:
  - The regulator average is a percentage with no minimum, ignoring the 100k–200k band, and replaces only the trade commission.
  - ∅ means no provider fees; the fund's costs and the spread stay.
  - "Year-1 cost" is the difference in liquidation value at month 12. Fees paid are shown as well.
  - Broker C's monthly fee is a deductible management fee under TXS-06.
- Q17. S46 has no r_g or π. S49 has no wrapper or fees. S50 has no inputs at all.
- Q18. S27 and S30:
  - (i) The 7% credit cap binds: the existing 7,200 leaves 948 of headroom a year. The title says "credit cap not binding". Should the title change, or the inputs?
  - (ii) Is the 1.5% insurance also charged on the employer line? Both are shown.
  - (iii) Does the salary stay at a nominal 10,000 for 30 years?
- Q19. S33: r_g and π are taken from S14, and the 250,000 is assumed to be all benefited money.
- Q20. S42: the 300 + 900 contributions are taken as constant nominal, as in S23, and the whole account is analysed.
- Q21. S16 and S33 give no custody minimum, so 0 is used.
- Q22. S07: 182.5 days to redemption are taken at the sale (half of 365).
- Q23. S38(b): 100,000 "now" exceeds the 83,641 ceiling ([KGL-02](<https://fs.knesset.gov.il//20/law/20_lsr_343169.pdf>)). The switching cost is 0 either way.

**Rules missing or unclear (each needs a rule-base update before it can compute)**
- Q9. S29: the rule base does not say how a beneficiary member's 40,000 is split between the s.45A(e) credit ([TXP-04](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>)) and the s.47(b1) deduction tiers ([TXP-06](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>)). It is also unclear how "the deposits that made the person a beneficiary member are not deducted again" and "+4% above 12%" work. TXP-06 points to worked examples in the 2025 guide (pp.60–62) that are not in the rule base. S29 also has no r_g, π or fees. **Rule part closed 2026-10-22:** the 2025 guide works this exact case (printed pp.61-62), now rule TXP-31; S29's deposit side is computed. Still missing: r_g, π and fees.
- Q24. National Insurance and health on employer study-fund money taxed as salary are not in the rule base. Nor is NI and health on study-fund gains withdrawn early: those gains are taxed at marginal rates, which is outside the TXG-27 exemption (method G-27). That covers S25 (the excess, at deposit) and S24(b) (early withdrawal). TXG-26 covers only income that is not from work, and [TXH-01](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) mentions the exemption only within the ceiling. **Partly closed 2026-10-22:** employee salary rates added (TXG-35, NII page). The above-ceiling employer deposit is charged 12.17% as an inference; S25 uses it. Early-withdrawal gains stay unmodelled (G-27).

**Product decisions and site parameters**
- Q12. Product decisions and site parameters:
  - There is no `data/parameters/`, so P-01 (θ), P-02 (sensitivity bounds), P-03 (fee verdicts), P-04 (fit table) and P-06 (tolerance) are not set. **P-01 set 2026-10-22: 0.5%** (`data/parameters/tie-threshold.json`, rationale in `docs/parameters-rationale.md`); S39 and S44 now report ties. That blocks S39's ranking, ties and sensitivity, S42's verdicts, ties in S44 and S50, and S46's fit marks.
  - S39 and S47 also need a product decision not in product.md: how the hishtalmut "own money" wrapper takes a goal's money when the person already deposits the benefited 2.5% through work (S39), or when the money is a lump sum or above the benefited cap. An employee deposits only through the employer ([KH-02](<https://www.meitav.co.il/provident_pension/hishtalmut/>)); the cap is [TXH-08](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>). **Decided 2026-10-23 as product D15:** for an employee the study fund is listed, not ranked; for a self-employed person it is ranked up to 20,566 a year. S39 now ranks fully; S47's study-fund series stays out because the illustration has no self-employed income.

<!-- generated by expected_calc.py: start -->

## Status at a glance

| Status | Scenarios |
|---|---|
| computed — one expected result (subject to the conventions) | S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44, S45, S46, S47, S48, S49, S50, S51, S52, S53, S54, S55 |
| pending — two results, one per side of a difference you decide |  |
| partial — some outputs computed, the rest blocked |  |
| blocked — missing inputs or an unclear rule |  |

## Scenario workings

### S01 Unlinked bank deposit, one-month ladder

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Monthly rate from the quoted effective annual rate: g = 1.035^(1/12) − 1 | [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>) (effective annual rate is the compounding convention for unlinked shekel deposits); scenario says "effective annual" | g = 0.002871 |
| 2 | CPI path I_m = 1.03^(m/12) | scenario convention (F-03); no rule | I_36 = 1.092727 |
| 3 | Contributions: 50,000 at t = 0 (start of month 1) and C_m = 1,000 × I_m at the start of months 1..36 (constant real) | A-04 default; timing A-05 (Q1) | Σ paid = 87,690.80 |
| 4 | Each month the one-month deposit matures: interest = balance × g; 15% withheld; principal plus net interest rolls into a new deposit with the new contribution | [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [BANK-14](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | see table |
| 5 | Low-income deduction from deposit interest: income 144,000.00 exceeds 69,840 by more than 10,920, so the deduction is max(0, 10,920 − (income − 69,840)) | [TXI-20](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0.00 |
| 6 | No fees on the deposit (scenario); the last deposit matures on the exit day | [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 7 | Real value = V_T / I_36 | output definition (method F-06) | see result |


| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 62,194.12 | 63,872.36 | 0.00 | 296.16 | 62,012.00 |
| 2 | 74,754.06 | 78,528.10 | 0.00 | 666.01 | 74,020.27 |
| 3 | 87,690.80 | 94,001.62 | 0.00 | 1,113.67 | 86,024.80 |

Result: V_T = 94,001.62; real V_T/I_T = 86,024.80; fees 0; interest 7,424.49; tax during (15% at each maturity) 1,113.67; tax at exit 0 (the month-36 deposit is taxed at its own maturity on the exit day).

**Expected (as written to scenarios.md):** Real V_T/I_T = 86,024.80; nominal V_T = 94,001.62; paid in 87,690.80; fees 0; interest 7,424.49; tax during 1,113.67 (15% at each monthly maturity); tax at exit 0; TXI-20 deduction 0. Subject to Q1.

### S02 Same deposit, contributions constant in nominal terms

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Monthly rate from the quoted effective annual rate: g = 1.035^(1/12) − 1 | [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>) (effective annual rate is the compounding convention for unlinked shekel deposits); scenario says "effective annual" | g = 0.002871 |
| 2 | CPI path I_m = 1.03^(m/12) | scenario convention (F-03); no rule | I_36 = 1.092727 |
| 3 | Contributions: 50,000 at t = 0 and C_m = 1,000 (constant nominal) at the start of months 1..36 | A-04 nominal branch | Σ paid = 86,000.00 |
| 4 | Each month the one-month deposit matures: interest = balance × g; 15% withheld; principal plus net interest rolls into a new deposit with the new contribution | [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [BANK-14](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | see table |
| 5 | Low-income deduction from deposit interest: income 144,000.00 exceeds 69,840 by more than 10,920, so the deduction is max(0, 10,920 − (income − 69,840)) | [TXI-20](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0.00 |
| 6 | No fees on the deposit (scenario); the last deposit matures on the exit day | [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 7 | Real value = V_T / I_36 | output definition (method F-06) | see result |


| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 62,000.00 | 63,676.02 | 0.00 | 295.77 | 61,821.38 |
| 2 | 74,000.00 | 77,757.94 | 0.00 | 663.17 | 73,294.32 |
| 3 | 86,000.00 | 92,257.81 | 0.00 | 1,104.32 | 84,428.96 |

Result: V_T = 92,257.81; real 84,428.96; interest 7,362.13; tax during 1,104.32.

**Expected (as written to scenarios.md):** Real V_T/I_T = 84,428.96; nominal V_T = 92,257.81; paid in 86,000.00; fees 0; tax during 1,104.32; tax at exit 0. Subject to Q1.

### S03 CPI-linked one-year deposit

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Principal and interest linked to CPI; quoted rate is the real rate (1.2%) | [BANK-26](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | — |
| 2 | At each 12-month maturity: value = principal × I_end/I_start × 1.012 | [BANK-26](<https://www.boi.org.il/media/orgfwntb/447.pdf>); grid index F-03 | see table |
| 3 | Linkage = principal × (I_end/I_start − 1) is exempt | [TXI-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | see table |
| 4 | Taxable = "profit above the rise in the index" = value − principal − linkage; rate up to 25% (under 60, passive income starts at 31%, so 25% applies) | [TXI-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | see table |
| 5 | Bank withholds 25% on linked interest at maturity; net rolls into the next one-year deposit | [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 6 | Low-income deduction not applied: the profile gives no income (Q3) | [TXI-20](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |

| Year | Principal at start | I_end/I_start | Linkage (exempt) | Real interest | Tax 25% | Rolled to next year |
|---|---|---|---|---|---|---|
| 1 | 100,000.00 | 1.030000 | 3,000.00 | 1,236.00 | 309.00 | 103,927.00 |
| 2 | 103,927.00 | 1.030000 | 3,117.81 | 1,284.54 | 321.13 | 108,008.21 |
| 3 | 108,008.21 | 1.030000 | 3,240.25 | 1,334.98 | 333.75 | 112,249.70 |

Result: V_T = 112,249.70; real V_T/I_36 = 102,724.37; fees 0; tax during 963.88; tax at exit 0 (third maturity is the exit day).

**Expected (as written to scenarios.md):** Real V_T/I_T = 102,724.37; nominal V_T = 112,249.70; fees 0; tax during 963.88 (25% of real interest at each maturity, linkage exempt); tax at exit 0. Subject to Q3 (income not given; TXI-20 assumed not to apply).

### S04 Prime-linked monthly deposit

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Rate = prime − 1.4% = 4.75% − 1.40% = 3.35%, constant (scenario) | [BANK-25](<https://www.boi.org.il/media/orgfwntb/447.pdf>) (prime as the anchor) | 3.35% |
| 2 | Read as an effective annual rate, as in S01: g = 1.0335^(1/12) − 1 (D2 closed: reading it as r/12 changes the result by under 0.1%) | [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>) | g = 0.002750 |
| 3 | Tax bucket: prime is neither CPI nor an exchange rate, so the deposit is "not linked": 15% of all interest. This is the rule file's own reading, not a published statement | [TXI-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXI OQ2) | 15% |
| 4 | Ledger as S01 (contributions constant real, monthly maturity, 15% withheld) | [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | see below |

Result: V_T = 93,725.19; real 85,771.83; tax during 1,064.89.

**Expected (as written to scenarios.md):** Real V_T/I_T = 85,771.83; nominal V_T = 93,725.19; fees 0; tax during 1,064.89; tax at exit 0; label "tax bucket: Tax Authority reading, TXI-04" (strength: the rule file's own reading, TXI OQ2). Subject to Q1.

### S05 Current-account credit balance

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Monthly credit rate from 0.5% a year, converted as an effective annual rate (method F-07; D2 closed: reading the 447 rate as r/12 changes V_T by 0.29 NIS) | [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>), [BANK-13](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | g = 0.000416 |
| 2 | Bank withholds 15% of current-account credit interest at monthly crediting | [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 3 | TXI-20 deduction: whether current-account interest is "deposit" interest is open (TXI OQ11), and income is not given (Q3); not applied | [TXI-20](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |

Result: V_T = 30,127.46; interest 149.95; tax during 22.49; real V_T/I_12 = 29,249.96.

**Expected (as written to scenarios.md):** Real V_T/I_T = 29,249.96; nominal V_T = 30,127.46; fees 0; tax during 22.49 (15% at monthly crediting); tax at exit 0. Subject to Q3.

### S06 Makam rolled yearly

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Price per 100 face = 100 / (1 + y)^(N/365), N = 365 days | [GOV-06](<https://www.boi.org.il/media/ytal5ozx/makam.pdf>) | 96.246391 |
| 2 | Buy at issue: trade value V and commission c with V + c = cash, c = max(20, 0.1% × V) (commission is a % of the trade) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>); tariff from the scenario | see table |
| 3 | No custody fee on makam at a bank | [BRK-17](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [BANK-18](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | 0 |
| 4 | At redemption the discount (face − price paid) is interest, taxed and withheld at 15%. Purchase commission is not deducted (no rule allows it) | [TXI-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-09](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | see table |
| 5 | Net proceeds buy the next 365-day series; no sale commission at redemption (scenario) | [GOV-22](<https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/makam/>), [GOV-23](<https://www.boi.org.il/boi_files/hanpaka.pdf>) | see table |
| 6 | 15% used; the 2025 guide's 20% line conflicts (flag) | [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXI OQ3) | flag |

| Series | Trade value | Commission | Face | Discount | Tax 15% | Cash at redemption |
|---|---|---|---|---|---|---|
| Series 1 bought at issue | 99,900.10 | 99.90 | 103,796.20 | 3,896.10 | 584.42 | 103,211.79 |
| Series 2 bought, redeemed | 103,108.68 | 103.11 | 107,129.92 | 4,021.24 | 603.19 | 106,526.73 |

Result: V_T = 106,526.73; real V_T/I_24 = 100,411.66; fees (commissions) 203.01; tax during 1,187.60 (the second series is taxed at redemption on the exit day); tax at exit 0 beyond that.

**Expected (as written to scenarios.md):** Real V_T/I_T = 100,411.66; nominal V_T = 106,526.73; fees: trade 203.01, custody 0; tax on the discount 1,187.60 (15% at each redemption; the month-24 one falls on the exit day); flag "makam rate conflict 15/20%, TXI OQ3".

### S07 Makam sold before redemption

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Series 1 as S06 | [GOV-06](<https://www.boi.org.il/media/ytal5ozx/makam.pdf>), [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | see table |
| 2 | Sale price of series 2 after 6 months at the unchanged 3.9% yield: N_remaining/365 taken as 0.5 (grid) | [GOV-06](<https://www.boi.org.il/media/ytal5ozx/makam.pdf>); Q22 | price 98.105245 |
| 3 | Gross sale value; sell commission max(20, 0.1%) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | gross 105,100.07, commission 105.10 |
| 4 | Sale before redemption: capital gain at up to 15%, whole gain treated as real; consideration is the sale price (no rule deducts the sale commission) | [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | gain 1,991.39, tax 298.71 |
| 5 | Interest/capital split of the sale price is open but both are 15% | [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXI OQ3, OQ5) | no effect |

| Series | Trade value | Commissions | Face | Discount / gain | Tax 15% | Cash |
|---|---|---|---|---|---|---|
| Series 1 bought at issue | 99,900.10 | 99.90 | 103,796.20 | 3,896.10 | 584.42 | 103,211.79 |
| Series 2 bought, sold after 6 months | 103,108.68 | 208.21 | 107,129.92 | 1,991.39 | 298.71 | 104,696.26 |

Result: V_T = 104,696.26; real V_T/I_18 = 100,155.62; fees 308.11; tax 883.12.

**Expected (as written to scenarios.md):** Real V_T/I_T = 100,155.62; nominal V_T = 104,696.26; fees: trade 308.11, custody 0; tax during 584.42 (series 1 discount); tax at exit 298.71 (15% of the sale gain; sale commission not deducted, D3 decided). Subject to Q22 (days to redemption at the sale).

### S08 Unlinked fixed-rate government bond

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Buy at price 100: trade value V, commission max(30, 0.2% × V), V + c = 100,000 | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | V = 99,800.40 |
| 2 | Coupon 3.75% of face once a year (scenario input; the coupon frequency of fixed-rate bonds is not sourced, D4) | [GOV-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf>) (GOV OQ4) | see table |
| 3 | Coupon on an unlinked bond: 15% of the nominal coupon, withheld | [TXI-15](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-09](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | see table |
| 4 | Net coupons at months 12 and 24 bought back at 100 (new lots, commission min 30); the month-36 coupon is paid out | method F-25 convention; [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 5 | Custody 0.1% of market value per quarter, min 10, taken from the holding (units leave with their cost) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>); convention C9 | Σ 1,235.31 |
| 6 | Exit: sold at 100 (A-27 = 0); gain on unlinked bond taxed at up to 15%, whole gain real; exit-year custody fees deducted from the gain | [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | gain -420.79 → tax 0.00 |

| Year | Coupon | Tax 15% |
|---|---|---|
| 1 | 3,731.30 | 559.69 |
| 2 | 3,833.74 | 575.06 |
| 3 | 3,939.02 | 590.85 |

Result: V_T = 108,073.66; real V_T/I_36 = 98,902.71; fees: trade 469.47, custody 1,235.31; tax during 1,725.61; tax at exit 0.00.

**Expected (as written to scenarios.md):** Real V_T/I_T = 98,902.71; nominal V_T = 108,073.66; fees: trade 469.47, custody 1,235.31; tax during 1,725.61 (15% of coupons); tax at exit 0.00 (gain ≤ 0). Subject to D4.

### S09 CPI-linked government bond

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Principal and coupon linked to CPI up or down; coupon once a year | [GOV-11](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>), [GOV-12](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=5>) | — |
| 2 | Price = 100 × I_m (base index at purchase I_0; A-27 = 0) | [GOV-11](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>); F-03 grid | — |
| 3 | Coupon = 1.9% × face × I_m; taxed at 25% as real interest on a fully linked asset (linkage of principal exempt) | [TXI-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>), [TXI-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-09](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | see table |
| 4 | Net coupons at months 12, 24 reinvested at 100 × I_m | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 5 | Custody as S08 on market value | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | Σ 1,270.69 |
| 6 | Exit: real gain per lot = sale value − cost × I_36/I_buy, less exit-year custody (TXS-06); up to 25% | [TXI-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | real gain -439.36 → tax 0.00 |

| Year | Indexed coupon | Tax 25% |
|---|---|---|
| 1 | 1,947.24 | 486.81 |
| 2 | 2,025.53 | 506.38 |
| 3 | 2,106.99 | 526.75 |

Result: V_T = 112,141.89; real 102,625.72; fees: trade 481.17, custody 1,270.69; tax during 1,519.94; tax at exit 0.00.  
Reading used in step 3: the whole indexed coupon is "profit above the rise in the index" (TXI-05 guide wording); the rule base does not split linkage on the coupon itself.

**Expected (as written to scenarios.md):** Real V_T/I_T = 102,625.72; nominal V_T = 112,141.89; fees: trade 481.17, custody 1,270.69; tax during 1,519.94 (25% of indexed coupons); tax at exit 0.00.

### S10 CPI-linked bond under deflation

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | π = −1%: principal and coupon are reduced with the index, no floor | [GOV-12](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=5>), [GOV-11](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>) | I_36 = 0.970299 |
| 2 | The reduced coupon is still taxed in full at 25%; interest and linkage are separate incomes (Supreme Court, applied here by analogy from an FX-linked deposit) | [TXI-25](<https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2>), [TXI-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>) | tax during 1,403.43 |
| 3 | The negative linkage on the principal is not offset: a positive linkage would have been exempt | [TXI-25](<https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2>), [TXI-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | no loss carried |
| 4 | Exit at indexed par: the CPI fell, so each lot's inflationary amount is 0 and its nominal loss counts only beyond the fall, which here takes it all; the exit-year custody is the only loss left → no exit tax (TXS OQ15 closed 2026-10-26) | [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | gain -395.95, tax at exit 0.00 |

| Year | Indexed coupon | Tax 25% |
|---|---|---|
| 1 | 1,871.62 | 467.90 |
| 2 | 1,871.24 | 467.81 |
| 3 | 1,870.86 | 467.71 |

Result: V_T = 99,574.19; real 102,622.17; fees: trade 456.34, custody 1,190.84.

**Expected (as written to scenarios.md):** Real V_T/I_T = 102,622.17; nominal V_T = 99,574.19; fees: trade 456.34, custody 1,190.84; tax during 1,403.43 (25% of the reduced coupons, TXI-25); tax at exit 0.00; flag "real loss not carried, G-07".

### S11 Daily money-market fund at a bank

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Gross return of a daily money-market fund: the BoI rate, as the regulator describes these funds (proxy) | [MF-34](<https://boi.org.il/media/gcmk52bw/447a.pdf>) | g = 0.002669 |
| 2 | Fund fees (management 0.16% + trustee 0.02%) are deducted inside the price: δ/12 a month | [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>), [MF-20](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-64186b589b352/080217.pdf>) | δ = 0.18% |
| 3 | No commission at a bank under a distribution agreement; no custody on money-market funds at a bank | [MF-26](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=10>), [BRK-17](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | 0 |
| 4 | Exempt fund: nothing while holding | [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |
| 5 | Exit: 25% of the real gain, lots FIFO, inflationary amount = cost × (I_T/I_buy − 1) | [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain 146.29 → tax 36.57 |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 62,194.12 | 63,927.10 | 103.20 | 0.00 | 62,065.15 |
| 2 | 74,754.06 | 78,652.89 | 232.18 | 0.00 | 74,137.89 |

Result: V_T = 78,616.31; real 74,103.42; fund fees 232.18; tax at exit 36.57; lots with negative real gain: 0.

**Expected (as written to scenarios.md):** Real V_T/I_T = 74,103.42; nominal V_T = 78,616.31; paid in 74,754.06; fees: fund (δ) 232.18, trade 0, custody 0; tax during 0; tax at exit 36.57 (25% of real gain 146.29). Subject to Q1.

### S12 Renewable money-market fund, quarterly dates

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Expected yield is net of fund fees, before tax: g = 1.0357^(1/12) − 1, δ = 0 | [MF-37](<https://boi.org.il/media/gcmk52bw/447a.pdf>) | g = 0.002927 |
| 2 | Liquidity only on fixed dates; 3-month dates → the last fixed date before month 14 is month 12 | [MF-35](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/MoneyMarketFund_Prospectus25.pdf>) | exit month 12 |
| 3 | Exempt fund: 25% of real gain at exit | [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | tax 142.50 |
| 4 | No bank commission | [MF-26](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=10>) | 0 |


**Expected (as written to scenarios.md):** Exit at month 12: nominal V = 103,427.50; real V/I_12 = 100,415.05 (V/I_14 = 99,921.57 if the 2 idle months are counted, Q4); fees 0 (inside the yield); tax at exit 142.50. Subject to Q4.

### S13 Taxable shekel money-market fund (derived)

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Taxable fund: the fund pays tax at individual rates on its income; the holder pays nothing on sale or distributions; a loss cannot be offset | [TXS-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-24](<https://maya.tase.co.il/he/funds/mutual-funds>) | — |
| 2 | Fund-level rate on unlinked shekel interest: 15% of nominal interest (derived in the rule file, not stated by the Tax Authority) | [TXS-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXS OQ11) | 15% × g each month |
| 3 | Monthly NAV growth = g − δ/12 − 0.15 × g (tax on gross interest; whether fees are deductible at fund level is not in the rule base, Q11) | as above | — |
| 4 | Holder exit tax 0 | [TXS-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 62,194.12 | 63,648.59 | 102.98 | 274.84 | 61,794.74 |
| 2 | 74,754.06 | 78,019.09 | 231.18 | 616.98 | 73,540.48 |

Result: V_T = 78,019.09; real 73,540.48; fund-level tax borne 616.98.

**Expected (as written to scenarios.md):** Real V_T/I_T = 73,540.48; nominal V_T = 78,019.09; fees: fund (δ) 231.18; fund-level tax borne 616.98 (inside the price); holder tax during 0, at exit 0; label "derived, TXS-12(b)"; loss not offsettable (TXS-11). Subject to Q11.

### S14 Israeli accumulating ETF on a foreign index, bank brokerage

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Gross return of the exposure g = (1 + r_g)^(1/12) − 1 (A-01 entered) | method A-01 (input) | — |
| 2 | Fund costs inside the price, δ/12 a month: fixed 0.80% + variable 0.30% + trustee 0.0085% = 1.1085% (tracking difference 0) | [ETF-13](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=2>), [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | — |
| 3 | Each contribution is one order: trade value V and commission c with V + c = cash, c = max(25, 0.3% × V) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 4 | Bought at the ask: NAV × (1 + half-spread 0.05%); the price paid is the cost basis (commission excluded, G-20) | [ETF-06](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-07](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Custody 0.15% (min 15) of market value at each quarter end, taken from the holding (units leave FIFO with their cost) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>); convention C9 | — |
| 6 | Exit: sell at the bid, commission on the gross sale; consideration = gross sale value | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 7 | Real gain per lot = sale value − cost × J_T/J_buy, index J = CPI (shekel fund, not a foreign-investment fund, TXS-14); FIFO; exit-year custody (and management) fees deducted once | [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 8 | Tax 25% of the real gain, withheld by the bank (under 60: 25% binds) | [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-05](<https://www.btl.gov.il/Laws1/02_0103_100228.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | — |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 44,323.77 | 45,310.46 | 966.83 | 0.00 | 44,205.33 |
| 2 | 69,255.64 | 72,380.15 | 2,313.55 | 0.00 | 68,892.47 |
| 3 | 94,810.81 | 101,225.93 | 4,139.61 | 0.00 | 93,998.33 |
| 4 | 121,004.85 | 131,938.45 | 6,476.20 | 0.00 | 119,529.73 |
| 5 | 147,853.75 | 164,612.62 | 9,356.10 | 0.00 | 145,493.57 |

Exit: gross sale 164,530.32, commission 493.59, spread 82.31, exit-year custody deducted 914.59, real gain 9,568.74, tax 2,392.18.  
Result: V_T = 161,644.54; real 142,870.22.

**Expected (as written to scenarios.md):** Real V_T/I_T = 142,870.22; nominal V_T = 161,644.54; paid in 147,853.75; fees: trade 2,053.41, spread 155.42, custody 2,767.14, fund (δ) 4,956.03; tax during 0; tax at exit 2,392.18 (real gain 9,568.74). Subject to Q1, Q2.

### S15 Israeli open tracking fund, same index, no trading costs

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Gross return of the exposure g = (1 + r_g)^(1/12) − 1 (A-01 entered) | method A-01 (input) | — |
| 2 | Fund costs inside the price, δ/12 a month: trustee 0.02% (manager 0%) | [ETF-13](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=2>), [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | — |
| 3 | Each contribution is one order: trade value V and commission c with V + c = cash, c = max(10, 0.1% × V) (bank mutual-fund line; a distributor may charge only a transaction fee on tracking funds, MF-26) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 4 | Bought at the ask: NAV × (1 + half-spread 0 (no exchange trade)); the price paid is the cost basis (commission excluded, G-20) | [ETF-06](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-07](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Custody 0.15% (min 15) of market value at each quarter end, taken from the holding (units leave FIFO with their cost) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>); convention C9 | — |
| 6 | Exit: sell at the bid, commission on the gross sale; consideration = gross sale value | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 7 | Real gain per lot = sale value − cost × J_T/J_buy, index J = CPI; FIFO; exit-year custody (and management) fees deducted once | [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 8 | Tax 25% of the real gain, withheld by the bank (under 60: 25% binds) | [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-05](<https://www.btl.gov.il/Laws1/02_0103_100228.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | — |
| 9 | No distribution fee on tracking funds; order through the distributor | [MF-25](<https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(עמלת_הפצה)>), [MF-11](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>), [MF-26](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=10>) | — |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 44,323.77 | 45,931.63 | 363.34 | 0.00 | 44,811.34 |
| 2 | 69,255.64 | 73,895.39 | 875.53 | 0.00 | 70,334.70 |
| 3 | 94,810.81 | 103,994.47 | 1,569.51 | 0.00 | 96,569.21 |
| 4 | 121,004.85 | 136,359.02 | 2,459.04 | 0.00 | 123,534.54 |
| 5 | 147,853.75 | 171,126.52 | 3,558.71 | 0.00 | 151,250.91 |

Result: V_T = 167,178.12; real 147,761.09; tax 3,777.28.

**Expected (as written to scenarios.md):** Real V_T/I_T = 147,761.09; nominal V_T = 167,178.12; fees: trade 791.11, spread 0.00, custody 2,846.86, fund (δ) 91.87; tax at exit 3,777.28. Subject to Q1, Q2.

### S16 TASE-registered foreign fund (קרן חוץ), FX index for tax

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Gross return of the exposure g = (1 + r_g)^(1/12) − 1 (A-01 entered) | method A-01 (input) | — |
| 2 | Fund costs inside the price, δ/12 a month: fixed fee 0.07% + fund-level withholding drag 0.23% (A-11 = 1.5% × 15%, TXF-16) | [ETF-13](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=2>), [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | — |
| 3 | Each contribution is one order: trade value V and commission c with V + c = cash, c = max(25, 0.3% × V) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 4 | Bought at the ask: NAV × (1 + half-spread 0 (not given; A-08 default)); the price paid is the cost basis (commission excluded, G-20) | [ETF-06](<https://olaw.org.il/takanot/takanot-7646.pdf>), [ETF-07](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Custody 0.15% (no minimum given, Q21) of market value at each quarter end, taken from the holding (units leave FIFO with their cost) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>); convention C9 | — |
| 6 | Exit: sell at the bid, commission on the gross sale; consideration = gross sale value | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 7 | Real gain per lot = sale value − cost × J_T/J_buy, index J = the exchange rate X_m = 1.01^(m/12): 90% test met (TXF-04); FIFO; exit-year custody (and management) fees deducted once | [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 8 | Tax 25% of the real gain, withheld by the bank (under 60: 25% binds) | [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-05](<https://www.btl.gov.il/Laws1/02_0103_100228.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | — |
| 9 | Fund-level foreign withholding is a cost inside the fund, not creditable | [TXF-16](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-06](<http://www.capitax.co.il/Attachments/04072019.pdf>) | — |
| 10 | Accumulating foreign fund: no Israeli rule taxes undistributed income of a non-controlling holder, so tax falls only at sale. No Tax Authority statement was found (Chrome search, 2026-10-22); one secondary source agrees → computes, labelled "secondary source" | [TXF-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXF OQ1) | secondary |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 100,000.00 | 104,737.08 | 1,223.12 | 0.00 | 102,182.52 |
| 2 | 100,000.00 | 110,027.66 | 2,193.82 | 0.00 | 104,725.91 |
| 3 | 100,000.00 | 115,585.48 | 3,213.55 | 0.00 | 107,332.61 |
| 4 | 100,000.00 | 121,424.05 | 4,284.79 | 0.00 | 110,004.19 |
| 5 | 100,000.00 | 127,557.53 | 5,410.14 | 0.00 | 112,742.27 |

Under the TXF-11 reading: real gain vs X 25,117.56, tax 6,279.39, V_T 120,895.47, real 106,853.98.

**Expected (as written to scenarios.md):** Real V_T/I_T = 106,853.98; nominal V_T = 120,895.47; fees: trade 681.78, spread 0.00, custody 3,417.80, fund (δ) 1,693.24; tax at exit 6,279.39 (25% of real gain vs the exchange rate, 25,117.56); label "secondary source: tax only at sale, not confirmed by the Tax Authority" (TXF-11); row "listed, not ranked". Subject to Q21.

### S17 US-domiciled distributing ETF at a foreign broker, with W-8BEN

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** start rate 3.107 NIS per USD (Bank of Israel representative rate, 22 Oct 2026, [EDGE](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS?format=csv&lastNObservations=3&labels=name>)); share price USD 776.56 ([iShares IVV, NAV 21 Oct 2026](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>)); distributions quarterly (ETF-30); no half-spread given (0) |
| 1 | Return 6% in USD; shekel weakens 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |
| 2 | Each contribution converted at 0.2% and bought with one order; commission USD 2.5 a trade while an order is under 250 shares (it always is here: at most 91 shares) | [BRK-36](<https://www.inter-il.com/regulation-and-security/>), [BRK-23](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>) | — |
| 3 | Distributions 1.3% a year, quarterly; foreign withholding credited up to the Israeli 25%; at a foreign broker the Israeli part is paid by advance (timing ignored) | [TXF-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-21](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 4 | Exit: sell, commission USD 2.5, convert at 0.2%; 25% of the real gain against the exchange rate, by advance | [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-22](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | US withholding 25% with W-8BEN; Israel 25% fully credited → nothing more | [TXF-12](<https://www.irs.gov/pub/irs-trty/israel.pdf>), [TXF-13](<https://www.irs.gov/forms-pubs/about-form-w-8-ben>) | — |

Result: V_T = 276,271.91; real 244,184.11; foreign tax on distributions 3,123.76, Israeli tax on distributions 0.00; tax at exit 10,788.08 (real gain 43,152.30).

**Expected (as written to scenarios.md):** Real V_T/I_T = 244,184.11; nominal V_T = 276,271.91; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 281.95, FX 1,030.98; tax during: US 25% withheld, nothing more in Israel (foreign 3,123.76, Israeli 0.00); tax at exit 10,788.08; flag "US estate tax exposure above USD 60,000 (TXF-27)" from month 33; timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

### S18 Same ETF without a W-8BEN

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** start rate 3.107 NIS per USD (Bank of Israel representative rate, 22 Oct 2026, [EDGE](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS?format=csv&lastNObservations=3&labels=name>)); share price USD 776.56 ([iShares IVV, NAV 21 Oct 2026](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>)); distributions quarterly (ETF-30); no half-spread given (0) |
| 1 | Return 6% in USD; shekel weakens 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |
| 2 | Each contribution converted at 0.2% and bought with one order; commission USD 2.5 a trade while an order is under 250 shares (it always is here: at most 90 shares) | [BRK-36](<https://www.inter-il.com/regulation-and-security/>), [BRK-23](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>) | — |
| 3 | Distributions 1.3% a year, quarterly; foreign withholding credited up to the Israeli 25%; at a foreign broker the Israeli part is paid by advance (timing ignored) | [TXF-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-21](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 4 | Exit: sell, commission USD 2.5, convert at 0.2%; 25% of the real gain against the exchange rate, by advance | [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-22](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Without W-8BEN the US withholds 30%; credit capped at the Israeli 25%, so 5% is lost | [TXF-13](<https://www.irs.gov/forms-pubs/about-form-w-8-ben>), [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |

Result: V_T = 275,577.38; real 243,570.25; foreign tax on distributions 3,743.19, Israeli tax on distributions 0.00; tax at exit 10,772.67 (real gain 43,090.68).

**Expected (as written to scenarios.md):** Real V_T/I_T = 243,570.25; nominal V_T = 275,577.38; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 281.54, FX 1,029.56; tax during: US 30% withheld; the extra 5% is lost (foreign 3,743.19, Israeli 0.00); tax at exit 10,772.67; flag "US estate tax exposure above USD 60,000 (TXF-27)" from month 33; timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

### S19 Irish distributing ETF at a foreign broker

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** start rate 3.107 NIS per USD (Bank of Israel representative rate, 22 Oct 2026, [EDGE](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS?format=csv&lastNObservations=3&labels=name>)); share price USD 776.56 ([iShares IVV, NAV 21 Oct 2026](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>)); distributions quarterly (ETF-30); no half-spread given (0) |
| 1 | Return 6% in USD; shekel weakens 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |
| 2 | Each contribution converted at 0.2% and bought with one order; commission USD 2.5 a trade while an order is under 250 shares (it always is here: at most 91 shares) | [BRK-36](<https://www.inter-il.com/regulation-and-security/>), [BRK-23](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>) | — |
| 3 | Distributions 1.3% a year, quarterly; foreign withholding credited up to the Israeli 25%; at a foreign broker the Israeli part is paid by advance (timing ignored) | [TXF-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-21](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 4 | Exit: sell, commission USD 2.5, convert at 0.2%; 25% of the real gain against the exchange rate, by advance | [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-22](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Irish fund: expense 0.07% + fund-level US withholding 0.23%; Irish withholding on its distributions open, 0 used; Israel 25% on distributions | [TXF-16](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXF OQ6) | flag G-05 |

Result: V_T = 274,095.31; real 242,260.32; foreign tax on distributions 0.00, Israeli tax on distributions 3,103.69; tax at exit 10,080.97 (real gain 40,323.87).

**Expected (as written to scenarios.md):** Real V_T/I_T = 242,260.32; nominal V_T = 274,095.31; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 2,802.40, FX 1,025.20; tax during: Irish withholding 0 (open, flagged); Israel 25% by advance (foreign 0.00, Israeli 3,103.69); tax at exit 10,080.97; no US estate exposure: an Irish fund is not US-situs (TXF-27); timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

### S20 Kupat gemel lehashkaa, list fees

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Deposits: 20,000 at t = 0 and 2,000 × I_m monthly; no deduction or credit | [TXK-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Σ 147,853.75 |
| 2 | Annual ceiling 83,641 per person per calendar year, checked at deposit (figure is institution-strength) | [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-04](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [TXK-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | all years within |
| 3 | Deposit fee 0% (cap 4%); balance fee 0.8%/12 of the month-end balance (cap 1.05%) | [KGL-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>), [KGL-15](<https://www.meitav.co.il/provident_pension/provident_invest/>), [PF-02](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>), [PF-09](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)>) | — |
| 4 | Direct investment expenses 0.10% added to the balance fee, 0.10%/12 of the month-end balance (method F-15; D16 closed as immaterial) | [PF-10](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpsFM+Hq~v6+ysOsYBj7v7sI=#page=2>) | — |
| 5 | No tax during | [TXK-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |
| 6 | Lump sum at exit: gains are interest income at up to 25%; managers withhold 25% of the real gain (deposits indexed from each deposit month) — institution/secondary strength, label "base: secondary source" | [TXK-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain 12,096.99 |
| 7 | Sensitivity line: 15% of the nominal gain (s.125C(c) limb) | [TXK-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXK OQ2) | nominal gain 22,640.39 |
| 8 | NII on the deemed interest is open | [TXK-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (TXK OQ9) | flag G-11 |

| Calendar year | Deposits | Within 83,641 |
|---|---|---|
| 1 | 44,323.77 | yes |
| 2 | 24,931.87 | yes |
| 3 | 25,555.17 | yes |
| 4 | 26,194.04 | yes |
| 5 | 26,848.90 | yes |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 44,323.77 | 45,991.58 | 305.54 | 0.00 | 44,869.84 |
| 2 | 69,255.64 | 73,920.26 | 854.54 | 0.00 | 70,358.37 |
| 3 | 94,810.81 | 103,899.47 | 1,665.01 | 0.00 | 96,480.99 |
| 4 | 121,004.85 | 136,048.77 | 2,755.99 | 0.00 | 123,253.47 |
| 5 | 147,853.75 | 170,494.14 | 4,147.63 | 0.00 | 150,691.97 |

Result: B_T = 170,494.14; 25% real: tax 3,024.25, V 167,469.89, real 148,018.98; 15% nominal: tax 3,396.06, V 167,098.08, real 147,690.35.

**Expected (as written to scenarios.md):** Real V_T/I_T = 148,018.98 with 25% of the real gain (label "base: secondary source"); nominal V_T = 167,469.89; alternative 15% of nominal gain: real 147,690.35, nominal 167,098.08; gross balance 170,494.14; fees: balance 3,686.78, direct expenses 460.85, deposit 0; tax during 0; tax at exit 3,024.25 (alt. 3,396.06); ceiling not reached in any year; flag G-11 (NII on deemed interest). Subject to D15, Q1.

### S21 Kupat gemel lehashkaa, ceiling breached

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | One ceiling per person per calendar year across all managers: 83,641 in 2026 (institution sources only) | [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [TXK-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | 83,641 |
| 2 | Checked at deposit, not at year end | [KGL-04](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | — |
| 3 | Accepted = min(90,000, 83,641); excess routed to the next goal (D12) | [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>); product D12 | accepted 83,641, routed 6,359.00 |
| 4 | The value of the accepted part over 1 year is not asked for, and no market inputs are given | — | — |


**Expected (as written to scenarios.md):** 83,641 accepted; 6,359.00 routed to the next goal; message shown. The 83,641 figure is institution-strength only (KGL-03; D15).

### S22 Kupat gemel lehashkaa, fee discount expiring

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | As S20 with a 0.5% balance-fee discount; the scenario has it revert to 1.05% after 24 months | [KGL-16](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>), [PF-02](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | — |
| 2 | A discount must last at least 5 years; the CMA circular covers kupat gemel lehashkaa (its scope excludes only sector and guaranteed-return funds). The bylaws' 2 years is the replaced 2012 rule (checked 2026-10-22) | [PF-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>), [KGL-16](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | 5 years |
| 3 | So inside the 60-month horizon the fee stays 0.5%; no PF-14 trigger (withdrawal, transfer, deposits stopping) occurs | [PF-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>), [PF-14](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | B_T 172,014.71 |
| 3' | For reference, reverting at month 24 as the scenario states would give B_T 169,864.44; the rule does not allow it | [PF-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | flag |
| 4 | Exit tax as S20 | [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |


**Expected (as written to scenarios.md):** Real V_T/I_T = 149,026.95 (25% real), nominal 168,610.32; 15%-nominal alternative real 148,832.72; balance fees 2,317.48; tax at exit 3,404.39. The discount cannot revert inside 5 years (PF-13 covers kupat gemel lehashkaa), so the fee stays 0.5% for the whole 60 months; the scenario's 24-month reversion is not allowed by the rule (it would give real 147,601.56). Subject to D15.

### S23 Keren hishtalmut, employee, horizon past 6 years

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Employee deposit 2.5% × 12,000 = 300 from net salary, no deduction or credit; benefited (≤ 2.5% of determining salary) | [TXH-04](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf>), [TXH-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [KH-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 300/month nominal |
| 2 | Employer 7.5% × 12,000 = 900 ≤ 7.5% × 15,712: not taxed at deposit | [TXH-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 900/month |
| 3 | Balance fee 0.6% (cap 2%), no deposit fee; direct expenses 0.11% inside the return | [KH-22](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>), [PF-06](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>), [PF-10](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpsFM+Hq~v6+ysOsYBj7v7sI=#page=2>) | — |
| 4 | No tax during | [TXH-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |
| 5 | Exit at month 84 > 6 years from the first payment date (clock from month 0 per the scenario): all exempt | [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [KH-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | tax 0 |

Own money:

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 3,600.00 | 3,701.57 | 14.13 | 0.00 | 3,611.29 |
| 2 | 7,200.00 | 7,597.47 | 55.30 | 0.00 | 7,231.38 |
| 3 | 10,800.00 | 11,697.90 | 124.93 | 0.00 | 10,862.66 |
| 4 | 14,400.00 | 16,013.59 | 224.52 | 0.00 | 14,507.52 |
| 5 | 18,000.00 | 20,555.85 | 355.62 | 0.00 | 18,168.38 |
| 6 | 21,600.00 | 25,336.57 | 519.91 | 0.00 | 21,847.65 |
| 7 | 25,200.00 | 30,368.28 | 719.11 | 0.00 | 25,547.77 |

Employer line:

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 10,800.00 | 11,104.72 | 42.40 | 0.00 | 10,833.87 |
| 2 | 21,600.00 | 22,792.41 | 165.91 | 0.00 | 21,694.14 |
| 3 | 32,400.00 | 35,093.69 | 374.80 | 0.00 | 32,587.98 |
| 4 | 43,200.00 | 48,040.77 | 673.55 | 0.00 | 43,522.57 |
| 5 | 54,000.00 | 61,667.55 | 1,066.86 | 0.00 | 54,505.13 |
| 6 | 64,800.00 | 76,009.72 | 1,559.72 | 0.00 | 65,542.94 |
| 7 | 75,600.00 | 91,104.83 | 2,157.34 | 0.00 | 76,643.32 |

**Expected (as written to scenarios.md):** Own money (ranked): real V_T/I_T = 25,547.77; nominal V_T = 30,368.28; paid in 25,200.00; fees: balance 607.70, direct 111.41; tax 0. Employer line "only available here" (900/month): real 76,643.32, nominal 91,104.83; both exempt at exit. Subject to Q1.

### S24 Keren hishtalmut, horizon 4 years (locked, listed not ranked)

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Horizon 48 < 72 months: locked; listed, not ranked, valued at its first lawful exit date (month 72) | method B3; [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [KH-10](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | Value at month 72: contributions stop at the goal's horizon (month 48), the balance grows to month 72 (product D16) | [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 17,739.10 (real 15,296.37) |
| 3 | Opt-in early withdrawal at month 48: own deposits are not taxed again; gains are taxed at ordinary s.121 rates (s.125C(d)(5)); the fund withholds 47% and the excess is refunded (A-14) | [TXH-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-15](<https://www.btl.gov.il/Laws1/02_0103_100097.pdf>), [TXI-06](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) | gains 1,613.59 |
| 4 | Which schedule: the gains are interest income, not personal-effort income, so the s.121 schedule for passive income starts at 31% (salary 144,000 + gains stays below 301,200) | [TXG-03](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXH-11](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | 31% → 500.21 |
| 5 | Withholding 47% at payment, refund through a return | [TXH-15](<https://www.btl.gov.il/Laws1/02_0103_100097.pdf>), [TXG-25](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | withheld 758.39 |
| 6 | Employer line on early withdrawal: benefited employer deposits (43,200) are work income when received, stacked on salary 144,000 → 20% band; their gains at 31% | [TXH-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXG-03](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | tax on deposits 8,640.00, on gains 1,500.64 |


**Expected (as written to scenarios.md):** (a) Listed, not ranked, "locked until month 72": value at month 72 = 17,739.10 nominal, 15,296.37 real (deposits stop at month 48, product D16). Exempt then. (b) Opt-in at month 48: balance 16,013.59, gains 1,613.59; tax at 31% (income not from personal effort, TXG-03) = 500.21 → V = 15,513.38, real 14,054.35; 47% withheld (758.39), difference refunded (A-14). Employer line (b): balance 48,040.77, tax on deposits 8,640.00 + on gains 1,500.64 (31%). NI and health on early-withdrawal gains not modelled (G-27). Subject to Q1.

### S25 Keren hishtalmut, salary above the determining-salary cap

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Determining salary capped at 15,712 a month | [TXH-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | Own deposit 2.5% × 20,000 = 500: benefited part 392.80 (2.5% of 15,712), excess 107.20 | [TXH-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 3 | Gains on the excess own deposits: 25% of the real gain at withdrawal (two managers state this; institution) | [TXH-11](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | tax 257.96 |
| 4 | Employer 7.5% × 20,000 = 1,500: benefited 1,178.40; excess 321.60 is salary when paid | [TXH-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Income tax on the excess at the marginal rate: salary 240,000 + 3,859.20 a year is in the 31% band | [TXG-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXH-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 8,374.46 over 84 months |
| 6 | Employee NI and health on the excess at the full salary rate 12.17% (salary is above 7,703 a month); that the excess is in the base is an inference | [TXG-35](<https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx>), [TXH-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 3,287.65 over 84 months |
| 7 | Gains on the employer excess: 25% of the real gain at withdrawal (institution) | [TXH-11](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | tax 773.87 |
| 8 | Benefited parts exempt after 6 years | [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |


**Expected (as written to scenarios.md):** Own money (500/month): real V_T/I_T = 42,362.61, nominal 50,355.83; benefited 392.80/month exempt, excess 107.20/month taxed 25% of its real gain at exit (257.96, institution source). Employer line: gross 151,841.38; less tax on the excess at deposit 8,374.46 (31%) and NI and health 3,287.65 (12.17%, inference), and 25% real on the excess gains at exit 773.87: net 139,405.39 nominal (deposit-time taxes subtracted at face value, as F-52). Subject to Q1.

### S26 Self-employed keren hishtalmut

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** r_g 6%, π 2.5%, balance fee 0.6%, direct expenses 0.11% (as the employee study-fund example) |
| 1 | Deduction up to 4.5% of income (capped at 293,397): 9,000, worth its marginal tax (200,000 → 191,000, all in the 20% band) | [TXH-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | 1,800.00 a year |
| 2 | All 20,566 is benefited; gains exempt after 6 years | [TXH-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 3 | First payment in December of year 1 → 6 years ends at month 84, after the 72-month horizon: locked at the horizon, listed with its value at month 84 | [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [KH-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |

| Point | Balance (nominal) | Real |
|---|---|---|
| horizon (month 72) | 141,371.97 | 121,904.61 |
| first lawful exit (month 84), deposits stopped at month 72 (product D16) | 148,793.78 | 125,175.03 |

**Expected (as written to scenarios.md):** Deduction 9,000.00 a year worth 1,800.00 at τ_m = 20%; net outlay 18,766.00 a year for 20,566 deposited. Balance at the 72-month horizon 141,371.97 (real 121,904.61), locked until month 84 (6 years from the first payment date); value at month 84, exempt, with deposits stopped at the horizon (product D16): 148,793.78 (real 125,175.03); listed, not ranked. Filled in: r_g 6%, π 2.5%, fees as the employee study-fund example.

### S27 Pension deposit by an employee

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Credit 35% on employee deposits up to 7% of eligible income, eligible income capped at 116,400 a year | [TXP-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-27](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | cap 8,148.00 |
| 2 | Existing employee deposits 6% × 120,000 = 7,200.00 use the cap first | [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | headroom 948.00 |
| 3 | New deposits a year (≥ 3,638.88) exceed the headroom, so the credit cap binds: credit = 35% × 948.00 | [TXP-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 331.80 a year |
| 4 | Equal net outlay: gross deposit D_m = 300 × I_m + credit/12 (credit spread evenly; whether payroll gives it monthly is open, TXP OQ6) | method F-30 (B1); [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | D_1 = 328.15 |
| 5 | Beneficiary-member test (16% of average wage = 26,436, employer money counted): year 1 total 26,170.68; year 5 26,470.64 crosses it with 2026 figures held fixed — no effect: all salary is insured income, so the s.45A(e) cap is the same 8,148 and the s.47(b1) tiers are 0 | [TXP-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | no change |
| 6 | Selected fund fees 1% of deposits + 0.22% of balance (caps 6%, 0.5%); insurance 1.5% of deposits (entered, A-17) | [PEN-23](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2024-097/he/Regulations_regarding_the_selection_of_%20a_provident_fund-updating%20_(pdf).pdf>), [PF-04](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=5>), [PEN-15](<https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201634a.pdf>) | — |
| 7 | Employer 6.5% + 6% severance = 1,250 a month, within the 7.5% and severance ceilings: not taxed at deposit | [PEN-03](<https://www.gov.il/BlobFolder/guide/labor-wage/he/workers-rights_working-conditions_pension_Pension2016.pdf>), [TXP-10](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 8 | No tax during; exit at 60 is an annuity whose value needs conversion factors: blocked | [TXP-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (PEN OQ7) | blocked (G-03) |


**Expected (as written to scenarios.md):** Gross deposit D_m = 300 × I_m + 27.65 (credit 331.80 a year; the 7% cap binds — the scenario title says it does not, see Q18); month-1 gross deposit 328.15. Gross balance at 60 (month 360): 314,795.14 nominal, 173,789.23 real; fees: deposit 1,575.76, insurance 2,363.65, balance 7,626.14. Flag "exit: annuity rules, blocked (G-03)"; listed, not ranked. Employer line (1,250/month, same fees and insurance): 957,985.61 nominal, 528,875.97 real (972,723.85 if insurance is not charged on employer money, Q18). Subject to Q1, Q18.

### S28 Pension deposit, credit cap binding

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** age 30, r_g 5%, π 2%, selected fund 1% of deposits + 0.22% of balance, insurance 1.5% of deposits, employer 6.5% + 6% severance (as the 300 NIS pension example) |
| 1 | Existing 6% × 180,000 = 10,800 already exceeds the 8,148 cap → no credit on new money; gross = net = 1,000 × I_m | [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | Fees and insurance as the pension example | [PEN-23](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2024-097/he/Regulations_regarding_the_selection_of_%20a_provident_fund-updating%20_(pdf).pdf>), [PEN-15](<https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201634a.pdf>) | — |
| 3 | Locked until 60 and the annuity exit is blocked: listed with its gross balance at the horizon | [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (PEN OQ7) | G-03 |


**Expected (as written to scenarios.md):** No part of the extra deposit earns the credit (existing 10,800 > cap 8,148; the text "10,800/year already credited" should read 8,148); gross = net = 1,000 × I_m. Gross balance at the 10-year horizon: 164,004.04 nominal, 134,540.44 real; fees: deposit 1,328.16, insurance 1,992.24, balance 1,632.98; flag "exit: annuity rules, blocked"; listed, locked until 60. Employer line (1,875/month): 279,975.19 nominal, 229,677.17 real. Filled in: age 30, r_g 5%, π 2%, fees, insurance and employer rates as the 300 NIS pension example.

### S29 Beneficiary member, self-employed

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** r_g 5%, π 2%, fund fees 1% + 0.22%, insurance 1.5% (as the 300 NIS pension example); deposits 40,000/12 a month, constant nominal |
| 1 | Deposits 40,000 ≥ 26,436 → beneficiary member | [TXP-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | yes |
| 2 | First tier: 11% × min(240,000, 116,400) | [TXP-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-31](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | 12,804.00 |
| 3 | Second tier on the base 40,000 − 26,436 with additional income 116,400.00: min(base, 7% × AI) + min(4% × AI, base − 12% × AI if positive) | [TXP-31](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | 8,148.00 |
| 4 | Deduction worth its marginal tax: 240,000 → 219,048.00 | [TXG-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | 5,510.40 |
| 5 | Rest 19,048.00 to the s.45A(e) credit, cap 5% × min(240,000, 232,800) | [TXP-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | credited 11,640.00, credit 4,074.00 |
| 6 | Exit blocked (annuity), listed with the gross balance at the horizon | [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (PEN OQ7) | G-03 |


**Expected (as written to scenarios.md):** Deposit side: deduction 20,952.00 (first tier 12,804.00, second tier 8,148.00) worth 5,510.40; credit 35% × 11,640.00 = 4,074.00; total relief 9,584.40 a year, so 40,000 deposited costs 30,415.60 net. Gross balance at 20 years: 1,290,845.92 nominal, 868,702.30 real; flag "exit: annuity rules, blocked"; 0.5% credit and age-50 enlargement blocked (G-13). Filled in: r_g 5%, π 2%, fees and insurance as the 300 NIS pension example.

### S30 Provident fund for annuity vs pension, same money

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Same tax category as a pension fund: same deposit-side credit as S27 | [TXP-24](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>), [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | credit 331.80 a year |
| 2 | Fees 0.5% of balance, 0% of deposits (caps 1.05% / 4%); no pooled insurance | [PEN-22](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>), [PEN-35](<https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf>) | — |
| 3 | Exit blocked as S27 | [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) (PEN OQ7) | G-03 |


**Expected (as written to scenarios.md):** Gross deposit as S27 (300 × I_m + 27.65). Gross balance at 60: 307,835.20 nominal, 169,946.85 real; balance fees 17,195.57; no deposit fee, no insurance. Employer line: 933,375.45 nominal, 515,289.41 real. Exit blocked (G-03), listed. Subject to Q1, Q18.

### S31 Child savings, provident route, doubled

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | NII deposits 58 a month (2026), updated once a year on 1 January by the CPI rise: year k deposit = 58 × I_(12(k−1)) (D7 closed: the rule's annual step) | [CS-03](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx>) | — |
| 2 | Parental addition of the same amount from birth (doubling) → 116 a month in 2026; deposits months 1..216 | [CS-04](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx>) | — |
| 3 | Born 2026-01-01 (2017+ cohort): 291 at age 3, 291 at 13 (boy) or 12 (girl), 582 at 21 if nothing was withdrawn; each CPI-updated each 1 January | [CS-13](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx>) | sex not given (Q10): both shown |
| 4 | Growth at r_g 6%; no management fees until 21 (NII pays); after 21 up to the legal cap of 1.05% of the balance (not reached here) | [CS-18](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | — |
| 5 | Deposits, addition and grants are not income: they are principal | [TXK-19](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | — |
| 6 | Tax at withdrawal, provident route: 25% of the real gain, withheld (secondary source, TXK-23; no official rate) | [TXK-20](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx>), [TXK-23](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | see table |

| Case | Paid in by 18 | Balance at 18 | Real gain at 18 | Tax if withdrawn at 18 | Balance at 21 | Real gain at 21 | Tax if withdrawn at 21 |
|---|---|---|---|---|---|---|---|
| boy | 30,491.19 | 52,470.43 | 16,234.29 | 4,058.57 | 63,375.24 | 24,039.04 | 6,009.76 |
| girl | 30,483.81 | 52,490.19 | 16,254.04 | 4,063.51 | 63,398.77 | 24,062.57 | 6,015.64 |

Grants (nominal): month 36: 308.81, month 156: 376.44, month 252: 882.12

**Expected (as written to scenarios.md):** Gross balance at 18 = 52,470.43 (boy) / 52,490.19 (girl), real 36,737.67 / 36,751.50; at 21 = 63,375.24 / 63,398.77, real 41,813.45 / 41,828.98. Tax if withdrawn at 21: 6,009.76 / 6,015.64 (25% of the real gain, label "secondary source", TXK-23); at 18: 4,058.57 / 4,063.51. Grants: 308.81 at 3, 376.44 at 13 (boy) or 369.06 at 12 (girl), 882.12 at 21. Fees 0 until 21, then up to 1.05% of the balance (CS-18; see S54). Subject to Q10 (sex).

### S32 Child savings, bank route

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** 3% kept after 18 (same rate) |
| 1 | Deposits and grants as the provident child-savings example (boy; grant at 13 = month 156; 582 at 21) | [CS-03](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx>), [CS-04](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx>), [CS-13](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx>) | — |
| 2 | Bank track: fixed unlinked 3%, compounded annually-effective | [CS-23](<https://data.gov.il/he/datasets/mof/savingsplaninterest>) (public rate data stale) | — |
| 3 | Tax at withdrawal on an unlinked bank deposit: 15% of the nominal gain, withheld (secondary source) | [TXK-23](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-20](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx>) | — |


**Expected (as written to scenarios.md):** At 18 (boy): 39,701.73 nominal, 27,797.54 real; interest 9,210.54; tax if withdrawn 1,381.58. At 21: 44,265.27 nominal, 29,205.15 real; interest 12,891.96; tax if withdrawn 1,933.79 (15% of the nominal gain, label "secondary source"); net 42,331.47. Flag "rates data stale". Filled in: 3% after 18.

### S33 IRA hishtalmut with brokerage inside

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | An IRA is a provident fund in personal management; an IRA hishtalmut follows hishtalmut tax rules | [TXK-16](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>), [TXK-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | Two fee layers: manager balance fee 0.3% (cap 2%) plus the bank tariff inside the account | [IRA-17](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>), [PF-06](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>), [IRA-21](<https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf>) | — |
| 3 | Holding the S14 ETF: δ = 1.1085%, half-spread 0.05%; buy and sell 0.1% min 15; custody 0.05% a quarter (no minimum given, Q21) | [ETF-13](<https://olaw.org.il/takanot/takanot-7646.pdf>), [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | — |
| 4 | r_g 6%, π 2.5% taken from S14 (not restated in S33, Q19) | — | — |
| 5 | No tax inside; exit after the 6-year clock: exempt (balance assumed all benefited, Q19) | [TXK-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0 |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 250,000.00 | 260,393.30 | 4,476.03 | 0.00 | 254,042.25 |
| 2 | 250,000.00 | 271,625.66 | 8,754.41 | 0.00 | 258,537.21 |
| 3 | 250,000.00 | 283,342.53 | 13,217.35 | 0.00 | 263,111.70 |
| 4 | 250,000.00 | 295,564.82 | 17,872.80 | 0.00 | 267,767.14 |
| 5 | 250,000.00 | 308,314.33 | 22,729.08 | 0.00 | 272,504.94 |

**Expected (as written to scenarios.md):** Real V_T/I_T = 272,096.32; nominal V_T = 307,852.01; fees: trade 557.91, spread 278.97, custody 2,795.48, fund (δ) 15,380.19, IRA manager 4,178.85; tax 0 (exempt). Subject to Q19, Q21.

### S34 Exit at age 60 with low other income

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Ledger as S14 with 300,000 now, no monthly | as S14 | real gain 36,635.17 |
| 2 | Person reaches 60 in the exit tax year: the 10/14/20/31% brackets apply to all taxable income | [TXG-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-23](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 3 | Real capital gain is taxed at a maximum rate of 25% as the top slice; lower brackets apply first | [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXS-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 4 | Tax = Σ over the slice from Y = 60,000 to Y + real of min(bracket rate, 25%) | [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | 4,164.12 |
| 5 | Bank withholds 25% regardless; difference refunded through a return or form 0135 (A-14 on) | [TXS-23](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [TXS-05](<https://www.btl.gov.il/Laws1/02_0103_100228.pdf>), [TXG-25](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | withheld 9,158.79, refund 4,994.67 |
| 6 | Credit points come off the whole computed tax, special-rate income included; the person's points are not an input, so none are applied (flag G-23) | [TXG-05](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | — |


**Expected (as written to scenarios.md):** Real gain 36,635.17; tax at the brackets 4,164.12 (capped at 25% slice by slice, method F-42); 25% withheld 9,158.79; refund 4,994.67; V_T after refund 361,941.76, real 319,903.77; fees: trade 1,998.93, spread 333.17, custody 10,026.38, fund (δ) 18,378.58. Subject to Q2 (exit year = year 5, age 60 reached in it).

### S35 Exit at 60 holding an unlinked bond (fixed 15% unchanged)

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Ledger as S08 with 300,000 for 60 months, π 2.5% | as S08 | — |
| 2 | Coupons: 15% on unlinked interest is a fixed rate, not reduced at 60 (statute wording "of 15%"; the guide's maximum-rate list omits these fields) | [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [TXI-19](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) (TXI OQ9) | tax during 8,872.82 |
| 3 | Capital gain at sale: at par, so ≤ 0 after exit-year custody; no tax. (The rate for unlinked bond gains is worded "not exceeding 15%" — whether 60+ brackets reduce it is open, TXG OQ10 — no effect here) | [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | -1,333.69 |


**Expected (as written to scenarios.md):** Real V_T/I_T = 302,752.55; nominal V_T = 342,536.72; fees: trade 1,383.98, custody 6,358.59; tax during 8,872.82 (15% fixed on coupons, unchanged at 60); tax at exit 0 (gain -1,333.69). Subject to D4, D12, Q2.

### S36 Surtax year

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Ledger as S14 with 2,000,000 now, r_g 8%, π 2%, 36 months | as S14 | real gain 292,128.70 |
| 2 | Capital-gains tax 25% of real gain (under 60) | [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 73,032.17 |
| 3 | Surtax 3% on taxable income above 721,560; taxable income excludes the inflationary amount: Z = 600,000 + real gain | [TXG-09](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | 5,117.06 |
| 4 | Extra 2% on capital-source income above 721,560, tested on capital income alone (real gain 292,128.70 < 721,560) | [TXG-10](<https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf>) | 0.00 |
| 5 | Settled through the annual return | [TXG-11](<https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf>) | — |


**Expected (as written to scenarios.md):** Real gain 292,128.70; capital-gains tax 73,032.17; surtax 3% 5,117.06 on 170,568.70 above 721,560; 2% capital-source surtax 0.00 (capital income below the threshold); V_T 2,299,136.04, real 2,166,527.24; fees: trade 13,135.37, spread 2,189.33, custody 39,656.72, fund (δ) 72,465.71.

### S37 Negative real gain

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | As S11 with BoI 1%: g = 1.01^(1/12) − 1, δ = 0.18% | [MF-34](<https://boi.org.il/media/gcmk52bw/447a.pdf>), [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | g = 0.000830 |
| 2 | Real gain = gain − inflationary amount; tax 25% of real gain; a negative real gain gives no tax | [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real -4,446.30 |
| 3 | The nominal gain is positive, so the CPI rise above it is exempt and no capital loss arises: a capital loss is measured in nominal terms only (TXG OQ13 closed 2026-10-26) | [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | flag |


**Expected (as written to scenarios.md):** Real V_T/I_T = 95,808.94; nominal V_T = 101,643.70; nominal gain 1,643.70 (positive); real gain -4,446.30 (negative); tax 0; fees: fund 362.83; flag "real loss not carried, G-07" (TXG OQ13).

### S38 Brokerage switch versus provident track switch

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | (a) Moving from fund A to fund B is a sale: tax on A's real gain at month 36 (year-3 custody deducted), commission and spread out, net proceeds buy B (same fees as S14) | [TXS-21](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>), [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | tax at switch 1,649.27 |
| 2 | Cost of switching = V_T(no switch) − V_T(switch), real | method F-66 (output definition) | 646.40 |
| 3 | (b) A track switch inside a kupat gemel lehashkaa is not a withdrawal and not taxed; no fee in the regulation; a fee rise is permitted but not automatic | [TXK-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [PF-23](<https://www.btl.gov.il/Laws1/02_0103_100022.pdf>), [PF-14](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | cost 0 |
| 4 | (b) 100,000 now exceeds the 83,641 annual ceiling: only 83,641 is accepted and 16,359 routed (D12) — the switching cost is 0 either way | [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | note (Q23) |


**Expected (as written to scenarios.md):** (a) Brokerage: real V_T without switch 106,368.36, with switch 105,721.95; cost of switching 646.40 real (tax paid at the switch 1,649.27). (b) Kupat gemel lehashkaa: cost of switching 0 (TXK-04); note the ceiling accepts only 83,641 of the 100,000 now (Q23); with 83,641 the real value (25% real) is 93,606.46 either way.

### S39 Wrapper mode: the founder's ETF-vs-provident case

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Brokerage with the S14 ETF, 30,000 now + 2,000 × I_m, 240 months | as S14 | real V_T 572,640.51 |
| 2 | Kupat gemel lehashkaa with S20 fees; ceiling check (largest calendar year 54,323.77 ≤ 83,641) | as S20; [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | real V_T 630,640.90 (25% real) / 629,850.66 (15% nominal) |
| 3 | Hishtalmut: the person is an employee, so under product D15 it is listed, not ranked: "only funded through your employer; you already deposit the tax-free maximum" | [TXH-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [KH-02](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>); product D15 | listed |
| 4 | Pension extra deposit: existing 6% × 144,000 = 8,640 > cap 8,148 → no credit on new money; exit blocked (G-03) and locked to 60: listed, not ranked | [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | listed |
| 5 | Tie test between the two ranked rows with θ = 0.5% (P-01) | method F-80 | gap 9.20% → not a tie (θ = 0.5%) |
| 6 | Deciding formula: the larger of the gaps in fee drag (V without fees − V) and in tax at exit, brokerage minus kupat gemel lehashkaa, real | method F-80 | fee drag gap 58,000.39; tax gap -9,164.67 → fee drag |
| 7 | Sensitivity: move each guess to the P-02 bounds (bisection if the winner changes) | method F-81; data/parameters/sensitivity-bounds.json | no change flips the result within the bounds |

| Guess | Base | At the bounds |
|---|---|---|
| yearly return | 0.06 | no flip at 0; no flip at 0.1 |
| inflation | 0.025 | no flip at 0; no flip at 0.05 |
| horizon (years) | 20 | no flip at 18; no flip at 22 |
| etf fund fee (× rate) | 1 | no flip at 0.5; no flip at 2 |
| custody (× rate) | 1 | no flip at 0.5; no flip at 2 |
| trade commission (× rate) | 1 | no flip at 0.5; no flip at 2 |
| kgl balance fee (× rate) | 1 | no flip at 0.5; no flip at 2 |
| kgl direct expenses (× rate) | 1 | no flip at 0.5; no flip at 2 |


**Expected (as written to scenarios.md):** Computed: brokerage (S14 ETF) real V_T/I_T = 572,640.51, nominal 938,338.16; kupat gemel lehashkaa (S20 fees) real 630,640.90 with 25% real (label "secondary source"), 629,850.66 with 15% nominal. Pension: listed, not ranked (locked, G-03; no credit on new money since 6% × 144,000 > 8,148). Ranking: 1. kupat gemel lehashkaa, 2. brokerage; gap 9.20% → not a tie (θ = 0.5%). Deciding formula: fee drag (the brokerage pays 113,833.04 in fees against 55,832.65, real; tax at exit 31,048.97 against 40,213.63). Hishtalmut: listed, not ranked (employee, product D15). Sensitivity (P-02 bounds): no change flips the result within the bounds.

### S40 Wrapper mode: the founder's apartment case

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** terms from the earlier examples: deposit ladder 3.5%; daily fund BoI 3.25%, δ 0.18%; makam 3.9%, 0.1% min 20; bond 3.75% yearly, 0.2% min 30, custody 0.1%/q min 10; ETF at r_g 5% with the bank-brokerage ETF fees; kupat gemel lehashkaa fees 0.8% + 0.1%; current account 0.5% |
| 1 | 50,000 must stay available at once: kept in the current account (0.5%, 15% at crediting) | product D13; [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | 50,855.14 at 4 years |
| 2 | Compared money: 100,000 now + 4,000 × I_m a month for 48 months, the same in every row | method B1 | paid 302,009.70 |
| 3 | Makam: each contribution buys a new 12-month series, redemptions roll; open series sold at the horizon at the unchanged yield, 15% on the gain | [GOV-06](<https://www.boi.org.il/media/ytal5ozx/makam.pdf>), [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [GOV-23](<https://www.boi.org.il/boi_files/hanpaka.pdf>) | — |
| 4 | Bond: bought at par plus accrued interest; the full coupon taxed 15% (whether the accrued interest paid offsets it is open, so the conservative reading is used; under 0.5%) | [TXI-15](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-16](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 5 | Kupat gemel lehashkaa: 100,000 now exceeds the 83,641 yearly ceiling; it takes 83,641 and nothing more in year 1, so 65,006.55 goes to the next goal. It cannot take the same money, so it is listed, not ranked | [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>), [KGL-04](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>); method F-05 | value 258,650.91 on what it takes |
| 6 | Study fund: employee, and locked for 6 years → listed, not ranked. Pension: locked to 60 → listed | product D15; [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [PEN-26](<https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf>) | listed |
| 7 | Rank by real value at 4 years after fees and tax; tie test between the top two with θ = 0.5%. The current account also takes the compared money (exit any time), so it is ranked | method F-80, F-83; [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | see table |
| 8 | Coverage line: every tier-1 wrapper and tier-2 instrument accounted for once | method F-83; product D17 | see second table |

| Rank | Option | Nominal V | Real V | Fees and tax |
|---|---|---|---|---|
| 1 | makam ladder at 3.9% | 327,128.38 | 296,362.17 | commissions 2,504.92, tax 4,874.75 |
| 2 | bank deposits, one-month ladder at 3.5% | 326,766.55 | 296,034.36 | tax 4,368.85 |
| 3 | daily money-market fund (BoI 3.25%, δ 0.18%) | 326,280.83 | 295,594.33 | exit tax 1,322.49 |
| 4 | ETF in a bank brokerage account (r_g 5%) | 323,549.24 | 293,119.64 | fees 17,361.64, exit tax 2,406.13 |
| 5 | fixed-rate government bond, 3.75% coupon | 322,050.47 | 291,761.83 | trade 2,355.00, custody 3,367.37, tax 5,143.23 |
| 6 | current account at 0.5% | 305,450.13 | 276,722.74 | tax during 607.13 |

| Candidate | Outcome | Reason |
|---|---|---|
| makam ladder at 3.9% | ranked | rank 1 |
| bank deposits, one-month ladder at 3.5% | ranked | rank 2 |
| daily money-market fund (BoI 3.25%, δ 0.18%) | ranked | rank 3 |
| ETF in a bank brokerage account (r_g 5%) | ranked | rank 4 |
| fixed-rate government bond, 3.75% coupon | ranked | rank 5 |
| current account at 0.5% | ranked | rank 6 |
| savings plan | not evaluated | no savings-plan terms among the inputs (production: data/terms/deposits/, R4) |
| renewable money-market fund | not evaluated | monthly deposits into fixed-date series are not set (G-30) |
| kupat gemel lehashkaa | listed, not ranked | the yearly ceiling takes only part of the money (KGL-02, KGL-04; F-05) |
| keren hishtalmut | listed, not ranked | employee (product D15); locked 6 years (TXH-09) |
| comprehensive pension fund | listed, not ranked | locked to 60 (PEN-26) |
| general pension fund | listed, not ranked | locked to 60 (PEN-26) |
| provident fund for annuity | listed, not ranked | exit as pension, locked to 60 (PEN-34, PEN-26) |
| IRA in a study fund | listed, not ranked | as the study fund it is held in (IRA-25) |
| IRA in a provident fund | listed, not ranked | as the provident fund it is held in (IRA-25) |
| child savings, provident route | not eligible | takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16) |
| child savings, bank route | not eligible | takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16) |
| savings policies | not evaluated | tier 2, open questions (G-24) |
| executive insurance | not evaluated | tier 2, open questions (G-24) |
| structured deposits | not evaluated | tier 2, open questions (G-24) |
| corporate bonds | not evaluated | tier 2, open questions (G-24) |
| managed and robo portfolios | not evaluated | tier 2, open questions (G-24) |
| foreign-currency deposits | not evaluated | tier 2, open questions (G-24) |
| REITs | not evaluated | tier 2, open questions (G-24) |
| gold via funds | not evaluated | tier 2, open questions (G-24) |
| Amendment 190 deposits | not evaluated | tier 2, open questions (G-24) |

Considered 26: ranked 6, listed, not ranked 7, not eligible 2, excluded by the person's constraint 0, not evaluated 11

**Expected (as written to scenarios.md):** Ranked (real at 4 years, same money in each): 1. makam ladder at 3.9% 296,362.17; 2. bank deposits, one-month ladder at 3.5% 296,034.36; 3. daily money-market fund (BoI 3.25%, δ 0.18%) 295,594.33; 4. ETF in a bank brokerage account (r_g 5%) 293,119.64; 5. fixed-rate government bond, 3.75% coupon 291,761.83; 6. current account at 0.5% 276,722.74. Top two: gap 0.11% → tie (θ = 0.5%). The 50,000 kept available in the current account grows to 50,855.14 (46,072.25 real). Kupat gemel lehashkaa: listed, not ranked (the 83,641 ceiling takes only part of year 1; 65,006.55 routed to the next goal). Study fund and pension: listed, not ranked (locked). Coverage line (F-83): considered 26; ranked 6; listed, not ranked 7; not eligible 2; excluded by the person's constraint 0; not evaluated 11; not ranked, with reasons: savings plan (not evaluated: no savings-plan terms among the inputs (production: data/terms/deposits/, R4)); renewable money-market fund (not evaluated: monthly deposits into fixed-date series are not set (G-30)); kupat gemel lehashkaa (listed, not ranked: the yearly ceiling takes only part of the money (KGL-02, KGL-04; F-05)); keren hishtalmut (listed, not ranked: employee (product D15); locked 6 years (TXH-09)); comprehensive pension fund (listed, not ranked: locked to 60 (PEN-26)); general pension fund (listed, not ranked: locked to 60 (PEN-26)); provident fund for annuity (listed, not ranked: exit as pension, locked to 60 (PEN-34, PEN-26)); IRA in a study fund (listed, not ranked: as the study fund it is held in (IRA-25)); IRA in a provident fund (listed, not ranked: as the provident fund it is held in (IRA-25)); child savings, provident route (not eligible: takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16)); child savings, bank route (not eligible: takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16)); savings policies (not evaluated: tier 2, open questions (G-24)); executive insurance (not evaluated: tier 2, open questions (G-24)); structured deposits (not evaluated: tier 2, open questions (G-24)); corporate bonds (not evaluated: tier 2, open questions (G-24)); managed and robo portfolios (not evaluated: tier 2, open questions (G-24)); foreign-currency deposits (not evaluated: tier 2, open questions (G-24)); REITs (not evaluated: tier 2, open questions (G-24)); gold via funds (not evaluated: tier 2, open questions (G-24)); Amendment 190 deposits (not evaluated: tier 2, open questions (G-24)). Fund variants, tracks and providers inside each wrapper: compared in the workbench (3.4). Filled in: every wrapper's terms from the earlier examples.

Note, 2026-10-23: the independent check above priced accrued interest on the bond (291,761.83) while the method does not model it (G-10, TXI OQ5), so the engine lists the bond as not ranked (B3, reason G-10) and the ETF ranks fourth; the engine's counts are ranked 5, listed, not ranked 8, not eligible 2, excluded 0, not evaluated 11. The numbers above are kept as the independent check produced them.

### S41 Idle-cash preset

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** π 3% (as the daily money-market fund example) |
| 1 | Amount considered: 80,000 − 20,000 that must stay available = 60,000 | product D13 | 60,000 |
| 2 | Current account 0.5%, 15% withheld; deposits and makam 85% of the rate after tax | [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 3 | Daily money-market fund: one-year return 3.065%, tax 25% of the part above inflation → 3.049% after tax | [MF-34](<https://boi.org.il/media/gcmk52bw/447a.pdf>), [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 4 | Monthly cost = 60,000 × [(1 + r_alt after tax)^(1/12) − (1 + r_cc after tax)^(1/12)] | method F-60 | see table |
| 5 | Coverage line: every tier-1 wrapper and tier-2 instrument accounted for once; the preset runs only the cash options with a sourced or entered rate | method F-60, F-83, G-28; product D17 | see second table |

| Alternative | Monthly cost of leaving 60,000 in the current account |
|---|---|
| one-month deposit, bank average 3.2% ("average paid at this bank last month") | 113.12 |
| one-month deposit, own offer 3.6% ("entered by you") | 129.69 |
| makam 3.9% (no commission given) | 142.07 |
| daily money-market fund (BoI 3.25%, δ 0.18%), one-year hold | 129.13 |

| Candidate | Outcome | Reason |
|---|---|---|
| current account | baseline | where the money is now (F-60) |
| bank deposit, one month | compared | F-60 |
| makam | compared | F-60 |
| daily money-market fund | compared | F-60 |
| child savings, provident route | not eligible | takes the NII amounts and the parent's matching deposit only (method section 8; CS-02, CS-04, CS-16) |
| child savings, bank route | not eligible | takes the NII amounts and the parent's matching deposit only (method section 8; CS-02, CS-04, CS-16) |
| savings plan | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| renewable money-market fund | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| government bond | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| brokerage account | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| kupat gemel lehashkaa | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| keren hishtalmut | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| comprehensive pension fund | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| general pension fund | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| provident fund for annuity | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| IRA in a study fund | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| IRA in a provident fund | not evaluated | not run by the idle-cash preset (G-28); see the full goal comparison |
| savings policies | not evaluated | tier 2, open questions (G-24) |
| executive insurance | not evaluated | tier 2, open questions (G-24) |
| structured deposits | not evaluated | tier 2, open questions (G-24) |
| corporate bonds | not evaluated | tier 2, open questions (G-24) |
| managed and robo portfolios | not evaluated | tier 2, open questions (G-24) |
| foreign-currency deposits | not evaluated | tier 2, open questions (G-24) |
| REITs | not evaluated | tier 2, open questions (G-24) |
| gold via funds | not evaluated | tier 2, open questions (G-24) |
| Amendment 190 deposits | not evaluated | tier 2, open questions (G-24) |

Considered 26: baseline 1, compared 3, not eligible 2, not evaluated 20

**Expected (as written to scenarios.md):** Monthly cost of leaving 60,000 in the current account: one-month deposit, bank average 3.2% ("average paid at this bank last month") 113.12; one-month deposit, own offer 3.6% ("entered by you") 129.69; makam 3.9% (no commission given) 142.07; daily money-market fund (BoI 3.25%, δ 0.18%), one-year hold 129.13. BoI rate labelled as the source of the fund's return (proxy). Coverage line (F-83): considered 26; baseline 1; compared 3; not eligible 2; not evaluated 20; child savings (both routes) not eligible; savings plan, renewable money-market fund, government bond, brokerage account and the provident wrappers not evaluated (G-28); tier 2 not evaluated (G-24). Filled in: π 3% for the fund row.

### S42 Fee materiality on the founder's hishtalmut

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Holding: 120,000 existing + 300 own + 900 employer a month (constant nominal, as S23), r_g 6%, π 2.5%, 120 months; exempt at exit (past 6 years) | [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXH-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | Balance fee 0.74% (cap 2%); direct expenses 0.11% inside the return | [KH-22](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>), [PF-10](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpsFM+Hq~v6+ysOsYBj7v7sI=#page=2>) | — |
| 3 | Real values with all fees, none, and each fee removed | method F-61 (output definition) | V(F) 300,266.26, V(∅) 320,931.05 |
| 4 | Regulator reference: Gemel-Net study-fund track averages 0.34–0.74 (units not confirmed) | [KH-23](<https://data.gov.il/he/datasets/cma/gemelnet>) | reference |
| 5 | Verdicts with the P-03 thresholds: negotiate if the cost is at least 1,000.00 and a lower reference exists (balance fee: Gemel-Net averages go down to 0.34%); direct expenses have no collected reference (G-14) | method F-62; data/parameters/fee-verdict-thresholds.json | balance fee: worth negotiating; direct expenses: not worth the effort |


**Expected (as written to scenarios.md):** Real V_T/I_T with fees 300,266.26; total fee drag 20,664.79; cost of balance fee 0.74% = 17,901.59; cost of direct expenses 0.11% = 2,587.05; interaction remainder 176.15; value of cutting the balance fee to 0.34% = 9,530.01 (all real NIS over 10 years). Verdicts (P-03): balance fee "worth negotiating" (reference 0.34%, KH-23); direct expenses "not worth the effort" (no reference collected). Subject to Q20.

### S43 Fee materiality on a brokerage plan

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | US-domiciled distributing ETF bought through an Israeli bank: USD return 6% with the shekel weakening 1% a year → NIS return (1.06 × 1.01) − 1 | method A-01, A-03 | — |
| 2 | Distributions 1.3% a year, paid quarterly (IVV pays quarterly); US 25% withheld with W-8BEN; Israel 25% with credit → nothing extra (final, A-14) | [ETF-30](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>), [TXF-12](<https://www.irs.gov/pub/irs-trty/israel.pdf>), [TXF-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-10](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) (TXF OQ3 on what the bank withholds) | — |
| 3 | Fee lines: trade 0.3% min 25; custody 0.15% a quarter; FX 0.25% each way; fund 0.03%; half-spread 0.02% | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [BRK-23](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>), [ETF-30](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>) | — |
| 4 | Exit: real gain against the exchange rate, 25% | [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | tax 9,976.41 |
| 5 | Cost of each fee = V(F without f) − V(F), real | method F-61 | see result |


**Expected (as written to scenarios.md):** Ranked real fee costs over 5 years: custody 5,032.56; trade 3,068.41; fx 1,213.40; fund 207.68; spread 75.28; interaction remainder 106.09; total drag 9,703.42; real V_T with all fees 236,360.08. Subject to Q15.

### S44 Provider workbench, 1 trade vs 10 trades a month

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Instrument and market as S14 (r_g 6%, π 2.5%, δ 1.1085%, half-spread 0.05%); 10,000 now + 2,000 × I_m | as S14 | — |
| 2 | Three fee levels: list, regulator average, entered | product D4; [BRK-33](<https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf>), [BRK-26](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/FEES_DASH/1.0/?format=csv&lastNObservations=1&labels=name>) | averages used as % with no minimum (Q16) |
| 3 | Custody per tariff on market value; broker C monthly fee 15 (deductible as a management fee, Q16) | [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [BRK-24](<https://content.tase.co.il/media/q2mhob4u/274690.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | — |
| 4 | Horizon cost = V_T(∅) − V_T(F_p), real; ∅ = no provider fees, fund costs and spread kept (Q16) | method F-63 | see tables |
| 5 | Broker D: tariff missing → row "not comparable, data missing" | product 3.4 | — |
| 6 | Tie between the top two at each level: |V1 − V2| / max < θ, θ = 0.5% (site parameter P-01) | method F-80; data/parameters/tie-threshold.json | see result |


1 order(s) a month:

| Provider and level | Horizon cost (real) | Year-1 cost (liquidation value at 12, nominal) | Year-1 fees paid incl. exit commission | trade / custody / account (real, horizon) |
|---|---|---|---|---|
| C average | 1,023.22 | 187.19 | 228.65 | 191.60 / 0.00 / 830.99 |
| C list | 1,422.01 | 272.38 | 312.09 | 590.39 / 0.00 / 830.90 |
| B average | 2,199.41 | 227.65 | 255.77 | 514.40 / 1,678.27 / 0.00 |
| A average | 2,667.90 | 264.44 | 299.66 | 566.55 / 2,092.02 / 0.00 |
| A entered (S45) | 2,828.84 | 284.65 | 318.78 | 727.49 / 2,090.08 / 0.00 |
| B list | 3,803.34 | 579.41 | 600.06 | 2,118.34 / 1,659.04 / 0.00 |
| A list | 3,990.32 | 558.28 | 587.49 | 1,888.97 / 2,071.91 / 0.00 |

10 order(s) a month:

| Provider and level | Horizon cost (real) | Year-1 cost (liquidation value at 12, nominal) | Year-1 fees paid incl. exit commission | trade / custody / account (real, horizon) |
|---|---|---|---|---|
| C average | 1,023.22 | 187.19 | 228.65 | 191.60 / 0.00 / 830.99 |
| B average | 2,199.41 | 227.65 | 255.77 | 514.40 / 1,678.27 / 0.00 |
| A average | 2,667.90 | 264.44 | 299.66 | 566.55 / 2,092.02 / 0.00 |
| C list | 5,666.73 | 1,154.33 | 1,175.38 | 4,835.12 / 0.00 / 830.90 |
| A entered (S45) | 8,056.19 | 1,383.75 | 1,393.56 | 5,954.84 / 2,012.60 / 0.00 |
| A list | 17,032.17 | 3,300.51 | 3,268.92 | 14,930.82 / 1,878.62 / 0.00 |
| B list | 19,508.61 | 3,874.36 | 3,822.86 | 17,823.61 / 1,474.06 / 0.00 |

**Expected (as written to scenarios.md):** Horizon cost = real V_T(no provider fees) − real V_T(provider), cheapest first. 1 order(s)/month — list level: C 1,422.01 (year 1: 272.38), B 3,803.34 (year 1: 579.41), A 3,990.32 (year 1: 558.28); deciding fee type between C and B: custody (gap 2,381.34 by type: trade commission +1,527.95, custody +1,659.04, monthly account fee -830.90); gap 1.76% → not a tie (θ = 0.5%); average level: C 1,023.22 (year 1: 187.19), B 2,199.41 (year 1: 227.65), A 2,667.90 (year 1: 264.44); deciding fee type between C and B: custody (gap 1,176.19 by type: trade commission +322.80, custody +1,678.27, monthly account fee -830.99); gap 0.87% → not a tie (θ = 0.5%) | 10 order(s)/month — list level: C 5,666.73 (year 1: 1,154.33), A 17,032.17 (year 1: 3,300.51), B 19,508.61 (year 1: 3,874.36); deciding fee type between C and A: trade commission (gap 11,365.43 by type: trade commission +10,095.70, custody +1,878.62, monthly account fee -830.90); gap 8.70% → not a tie (θ = 0.5%); average level: C 1,023.22 (year 1: 187.19), B 2,199.41 (year 1: 227.65), A 2,667.90 (year 1: 264.44); deciding fee type between C and B: custody (gap 1,176.19 by type: trade commission +322.80, custody +1,678.27, monthly account fee -830.99); gap 0.87% → not a tie (θ = 0.5%). Broker D: "not comparable, data missing". Subject to Q16.

### S45 Provider with "entered by you" fee

Status: computed.

See S44 tables, row "A entered (S45)".

**Expected (as written to scenarios.md):** Bank A with entered 0.1% min 10: horizon real cost 2,828.84 (1 order/month), 8,056.19 (10 orders/month); year-1 liquidation-value cost 284.65 / 1,383.75; label "entered by you". Subject to Q16.

### S46 Holdings review: parental kupot gemel

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** r_g 6%, π 2.5% (as the long-term example); fit table P-04 |
| 1 | Consolidation: annuity fund to annuity fund is a permitted transfer route; barred only in the reg. 4 cases | [PF-17](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | allowed |
| 2 | Fee cost over 15 years, real: V(no fee) − V(fee), gross (exit blocked for annuity funds) | method F-61; [PF-02](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | see result |
| 3 | Fit marks from the P-04 table | method F-70; data/parameters/classification-fit.json | {'מניות': 'fits', 'כללי': 'fits'} |
| 4 | Child-savings default check | (CS OQ10) | blocked |


**Expected (as written to scenarios.md):** Consolidation: allowed (annuity fund to annuity fund, PF-17); barred only if a loan, attachment or started annuity applies. Fee cost over 15 years (real): 0.9% on 80,000 = 16,723.25; 0.6% on 40,000 = 5,698.23; moving the 80,000 into the 0.6% fund is worth 5,326.80. Fit marks (P-04 table): "כללי" fits, "מניות" fits. Child-savings default check blocked (CS OQ10). Filled in: r_g 6%, π 2.5%.

### S47 Illustrative timeline for guide pages

Status: computed.

**filled in:** pension row uses the 300 NIS pension example terms (salary 10,000, existing 6%, credit 331.80 a year, fees and insurance)

Real balance before exit tax at each year end (series); exit values below.

| Year | Deposit (3.5%) | Daily MMF | ETF (r_g 5%) | Kupat gemel lehashkaa (r_g 5%) | Pension, gross (exit blocked) |
|---|---|---|---|---|---|
| 1 | 16,135.65 | 16,148.23 | 15,828.74 | 16,277.27 | 16,285.48 |
| 2 | 22,329.53 | 22,360.64 | 21,768.65 | 22,681.25 | 22,992.02 |
| 3 | 28,582.19 | 28,637.91 | 27,785.65 | 29,214.49 | 29,874.39 |
| 4 | 34,894.18 | 34,980.71 | 33,880.54 | 35,879.61 | 36,937.47 |
| 5 | 41,266.07 | 41,389.71 | 40,054.15 | 42,679.27 | 44,186.30 |
| 6 | 47,698.42 | 47,865.63 | 46,307.31 | 49,616.18 | 51,626.05 |
| 7 | 54,191.82 | 54,409.15 | 52,640.88 | 56,693.11 | 59,261.99 |
| 8 | 60,746.84 | 61,020.97 | 59,055.72 | 63,912.89 | 67,099.59 |
| 9 | 67,364.06 | 67,701.82 | 65,552.70 | 71,278.40 | 75,144.42 |
| 10 | 74,044.07 | 74,452.41 | 72,132.71 | 78,792.58 | 83,402.21 |

Exit at year 10 (real): deposit 74,044.07; MMF 73,339.31; ETF 70,220.43; KGL 76,594.44 (25% real); pension: gross 83,402.21, exit blocked.

Rules as in the deposit, money-market, ETF, kupat gemel lehashkaa and pension examples ([TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>)). The study fund is not shown: an employee cannot put this money in (product D15), and the illustration has no self-employed income.

**Expected (as written to scenarios.md):** Real value at year 10 after exit tax: deposit 74,044.07, daily MMF 73,339.31, ETF 70,220.43, kupat gemel lehashkaa 76,594.44; pension gross 83,402.21 (exit blocked); yearly series in workings.md. Study fund not shown (product D15). Filled in: pension terms from the 300 NIS pension example.

### S48 Revisit after a rule change

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Re-run S39 brokerage with the TXS-09 rate set to 30% (test only) | [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real V_T 566,430.72 |
| 2 | The changed entry is TXS-09; the brokerage value falls by the extra 5% of the real gain | method F-82 | — |
| 3 | Ranking status: the kupat gemel lehashkaa still ranks first; its exit tax comes from TXK-07, not TXS-09, so only the brokerage moves | method F-82 | gap 10.18% → not a tie (θ = 0.5%) |


**Expected (as written to scenarios.md):** Changed entry: TXS-09 rate 25% → 30%. Brokerage real V_T/I_T falls from 572,640.51 to 566,430.72 (nominal 938,338.16 → 928,162.69). Ranking unchanged: the kupat gemel lehashkaa stays first (gap 10.18% → not a tie (θ = 0.5%)).

### S49 Exposure mode with entered returns and the loss filter

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** cash held as the daily money-market fund example (BoI 3.25%, δ 0.18%); bonds held as the low-fee open tracking fund example (δ 0.02%, 0.1% min 10, custody 0.15%/q min 15) at the entered 3%; goal and π as the long-term example |
| 1 | Loss filter: equity worst fall 40% > accepted 30% → excluded; bonds 10% ≤ 30% kept; cash has no entered worst fall → kept | method F-71 | — |
| 2 | Rank cash and bonds by real value at 20 years after fees and exit tax | method F-80; [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | see result |


**Expected (as written to scenarios.md):** Equity excluded by the filter (40% > 30%). Ranked: 1. cash 534,012.31, 2. bonds 495,867.60 (real); gap 7.14% → not a tie (θ = 0.5%). Bonds' 3% labelled "entered by you"; cash labelled with the BoI rate (sourced). Filled in: holding wrappers and fees from the money-market and open tracking fund examples.

### S50 Tie

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 0 | Filled-in inputs | — | **filled in:** two brokers built from the broker-comparison example: bank A as listed (0.3% min 25, custody 0.15%/q min 15) and a bank A2 identical except 0.25% commission; 10,000 now + 2,000 a month, 5 years, ETF and market as that example |
| 1 | Tie when |V1 − V2| / max < θ (P-01 = 0.5%) | method F-80 | gap 0.05% → tie (θ = 0.5%) |


**Expected (as written to scenarios.md):** Bank A2 132,426.40 vs bank A 132,353.91 (real, after fees and tax): gap 0.05% → tie (θ = 0.5%) → declared tie. Filled in: both providers constructed from the broker-comparison example.

### S51 Kupat gemel lehashkaa, lump sum at 60 with low other income

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | Ledger as S20 with 80,000 now (within the 83,641 ceiling), no monthly, 60 months | as S20; [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | gross 102,345.49 |
| 2 | Lump sum: gains are interest income at up to 25%, on the real gain | [TXK-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain 11,832.84 |
| 3 | The person reaches 60 in the exit tax year: the reduced 10/14/20/31% brackets apply to all their taxable income; 25% is a maximum rate, so lower brackets apply first, and the gains are the top slice | [TXK-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | — |
| 4 | Tax = Σ over the slice from Y = 60,000 to Y + real of min(bracket rate, 25%) | [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | 1,183.28 |
| 5 | At the full rate it would be 25% of the real gain; the difference comes back through a return (A-14 on) | [TXG-25](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | full 2,958.21, relief 1,774.93 |
| 6 | Surtax: Y + real is far below the threshold | [TXG-09](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | 0 |


**Expected (as written to scenarios.md):** Gross balance 102,345.49; real gain 11,832.84; tax at the brackets 1,183.28 (method F-44 with F-42); at the full 25% it would be 2,958.21, so the relief is 1,774.93; V_T 101,162.21, real 89,412.65; fees: balance 3,638.76, direct expenses 454.85; flag G-21 (settled through a return).

### S52 TASE foreign fund when the shekel strengthens

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | As S16 (TASE foreign fund, 90% test met, so the exchange rate is the index) with the shekel strengthening: f = −3% a year, X_60 = 0.858734 | [TXF-04](<https://www.capitax.co.il/Attachments/04072019.pdf>), [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | (a) r_g 6% in shekels: each lot's inflationary amount would be negative; it is 0, so the real gain is the nominal gain, less the exit-year custody 752.53 | [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | nominal gain 30,805.42, real gain 30,052.89 (without the rule 43,720.67) |
| 3 | (a) Tax 25% of that gain | [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 7,513.22 |
| 4 | (b) r_g −1% in shekels: the sale ends in a nominal loss of 6,112.98, smaller than the part caused by the fall, 13,667.78; that part is not allowable, so no loss is left beyond the exit-year custody, and no tax | [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain -548.57 (without the rule 7,006.23, which would have been taxed) |
| 5 | (b) Tax | [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 0.00 |

(a) V_T 119,661.64, real 105,763.45; fees: trade 681.78, spread 0.00, custody 3,417.80, fund (δ) 1,693.24.  
(b) V_T 90,367.21, real 79,871.45; fees: trade 571.02, spread 0.00, custody 2,850.43, fund (δ) 1,428.32.

**Expected (as written to scenarios.md):** (a) r_g 6%: nominal gain 30,805.42; real gain 30,052.89 (the inflationary amount is 0, not negative; without the rule it would be 43,720.67); tax at exit 7,513.22; V_T 119,661.64, real 105,763.45. (b) r_g −1%: real gain -548.57 (the nominal loss is smaller than the fall, so none of it is allowable; without the rule 7,006.23); tax at exit 0.00; V_T 90,367.21, real 79,871.45; flag "real loss not carried, G-07".

### S53 Israeli ETF and kupat gemel lehashkaa under CPI deflation

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | (a) As S14 (Israeli ETF, CPI index) with π = −1%: monthly 2,000 × I_m, so contributions fall with the index; I_60 = 0.950990 | method A-04; [TXS-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | — |
| 2 | (a) Each lot was bought at a higher CPI than at the sale: its inflationary amount is 0, so the real gain is the nominal gain, less the exit-year custody 854.71 | [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | nominal 19,717.36, real 18,862.65 |
| 3 | (a) Tax 25% | [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 4,715.66 |
| 4 | (b) As S20 (kupat gemel lehashkaa) with π = −1%: with a falling CPI there is no gain equal to linkage, so each deposit counts at its amount and the base is the nominal gain (reading of s.3(ה4)(3) with s.9(13)) | [TXK-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain 21,663.90 = nominal 21,663.90 |
| 5 | (b) Tax 25% | [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 5,415.98 |

(a) V_T 147,697.08, real 155,308.75; fees: trade 2,018.43, spread 144.15, custody 2,643.23, fund (δ) 4,739.09.  
(b) gross 158,649.68; V_T 153,233.70, real 161,130.71; fees: balance 3,527.77, direct 440.97.

**Expected (as written to scenarios.md):** (a) ETF: nominal gain 19,717.36; real gain 18,862.65 (inflationary amount 0); tax at exit 4,715.66; V_T 147,697.08, real 155,308.75. (b) Kupat gemel lehashkaa: real gain 21,663.90, equal to the nominal gain; tax at exit 5,415.98; V_T 153,233.70, real 161,130.71; label "reading" on TXK-07.

### S54 Child savings, provident route, withdrawn at 25

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | As S31 (boy, doubled, r_g 6%, π 2%), withdrawn at 25 (month 300) | as S31 | — |
| 2 | No fees until 21 (NII pays); after 21 the fee comes out of the savings, within the general cap: up to 1.05% a year of the balance and 4% of deposits (no deposits after 18) | [CS-18](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>), [PF-02](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | — |
| 3 | (a) The site's figure is the cap, an upper bound ("עד"): 1.05%/12 of the month-end balance, months 253 to 300 | [CS-18](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | fees 2,941.45 |
| 4 | (b) A rate the person enters from their manager's bylaw replaces the cap; here 0.23%, the rate two companies state | [CS-30](<https://media.harel-group.co.il/media/lved10ua/תקנון-הראל-חיסכון-לכל-ילד-אפריל-2026-_.pdf>) | fees 655.12 |
| 5 | Tax at withdrawal: 25% of the real gain (secondary source) | [TXK-20](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx>), [TXK-23](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | (a) 8,534.69, (b) 9,174.56 |

| Case | Balance at 25 | Fees after 21 | Real gain | Tax | Net | Net / I_300 |
|---|---|---|---|---|---|---|
| (a) cap | 76,717.55 | 2,941.45 | 34,138.78 | 8,534.69 | 68,182.86 | 41,559.56 |
| (b) entered 0.23% | 79,277.00 | 655.12 | 36,698.22 | 9,174.56 | 70,102.44 | 42,729.60 |

**Expected (as written to scenarios.md):** (a) At the legal cap (1.05% of the balance after 21, labelled "עד"): balance at 25 76,717.55; fees after 21 2,941.45; tax if withdrawn 8,534.69 (25% of the real gain 34,138.78); net 68,182.86, real 41,559.56; flag "fee after 21 at the cap". (b) With an entered 0.23%: balance 79,277.00; fees after 21 655.12; tax 9,174.56; net 70,102.44, real 42,729.60.

### S55 Daily money-market fund at a non-bank member

Status: computed.

| Step | What | Rule | Value |
|---|---|---|---|
| 1 | As S11 (daily money-market fund, BoI 3.25% as the proxy, δ 0.18%) at a TASE member that is not a bank | [MF-34](<https://boi.org.il/media/gcmk52bw/447a.pdf>), [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | — |
| 2 | A bank may not charge custody on money-market units; that ban binds banks only, and the distribution-fee regulations leave out an investment marketer, so no rule limits a non-bank member's custody: its tariff line applies (scenario: 0.1% a quarter, no minimum; regulators report it is customarily waived, which is practice, not a term) | [BRK-17](<https://www.boi.org.il/media/mi2driua/159a.pdf>), [MF-26](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=10>), [MF-27](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | custody 525.11 |
| 3 | Custody is paid by removing units oldest first; the exit-year custody is deducted from the gain once | [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | deducted 290.88 |
| 4 | Exit: 25% of the real gain | [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>), [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | real gain -145.27 → tax 0.00 |

| Year end | Paid in (nominal) | Balance (nominal) | Fees to date | Tax during to date | Balance / I_m (real) |
|---|---|---|---|---|---|
| 1 | 62,194.12 | 63,690.32 | 337.29 | 0.00 | 61,835.27 |
| 2 | 74,754.06 | 78,114.79 | 756.52 | 0.00 | 73,630.68 |

Result: V_T = 78,114.79; real 73,630.68.

**Expected (as written to scenarios.md):** Real V_T/I_T = 73,630.68; nominal V_T = 78,114.79; fees: fund (δ) 231.41, trade 0, custody 525.11; tax at exit 0.00 (25% of real gain -145.27).

## Rules cited

Strength is the one recorded on the rule's first source.

| Rule | Title | Checked | Strength |
|---|---|---|---|
| [BANK-04](<https://boi.org.il/media/rvzi1ngd/151.pdf>) | Interest is quoted as an annual rate; effective annual rate for unlinked shekel deposits | 2026-10-22 | primary |
| [BANK-13](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | Directive 447: concentrated publication of deposit and credit-balance rates (since 1 April 2025) | 2026-10-25 | primary; |
| [BANK-14](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | Directive 447 Annex A: the standard deposit taxonomy | 2026-10-25 | primary; |
| [BANK-18](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | No securities custody fee on makam or money-market funds at a bank | 2026-10-25 | primary |
| [BANK-25](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | Fixed vs variable rate: what the bank must show and state | 2026-10-25 | primary; |
| [BANK-26](<https://www.boi.org.il/media/orgfwntb/447.pdf>) | CPI-linked vs unlinked deposits | 2026-10-26 | primary; |
| [BRK-16](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | Banks: the full tariff fixes the securities fee types (part 4) | 2026-10-25 | primary |
| [BRK-17](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | Banks may not charge a custody fee on makam or money-market funds | 2026-10-25 | primary; |
| [BRK-23](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>) | Bank Leumi: foreign-currency conversion for foreign securities | 2026-10-25 | institution. General counterpart: BRK-16 |
| [BRK-24](<https://content.tase.co.il/media/q2mhob4u/274690.pdf>) | Every TASE member reports its fees to TASE in the bank fee schedule's format, and states them in the client agreement | 2026-10-25 | primary (exchange rules, ISA-approved); |
| [BRK-26](<https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.BankingSupervision/FEES_DASH/1.0/?format=csv&lastNObservations=1&labels=name>) | Regulator averages exist for banks only | 2026-10-22 | primary; |
| [BRK-33](<https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf>) | TASE publishes average fees actually charged, per member, including non-bank brokers | 2026-10-26 | primary; |
| [BRK-36](<https://www.inter-il.com/regulation-and-security/>) | Interactive Israel: tax withholding service and fee claims | 2026-10-25 | institution. General counterpart: TXS-05, TXF-22 |
| [CS-02](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | Who is eligible, and when deposits start and stop | 2026-10-25 | primary |
| [CS-03](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx>) | NII basic monthly deposit | 2026-10-25 | primary |
| [CS-04](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx>) | Parental addition from the child allowance ("doubling") | 2026-10-25 | primary |
| [CS-13](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx>) | Grants by birth cohort | 2026-10-25 | primary |
| [CS-16](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/8OfazOM9J2n~VjyzV5AWsITYS27PjZHrqw3iJWE0YJI=#page=7>) | If the money is not withdrawn | 2026-10-25 | primary |
| [CS-18](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | Management fees: who pays, until when, and the legal cap after 21 | 2026-10-25 | primary |
| [CS-23](<https://data.gov.il/he/datasets/mof/savingsplaninterest>) | Public data on bank rates: current in the CSV file (corrected 2026-10-23) | 2026-10-23 | primary. Superseded: datastore queries of 2026-10-22 (SQL ordered by _id desc; q=2026), which showed rows only to 02/09/2025 |
| [CS-30](<https://media.harel-group.co.il/media/lved10ua/תקנון-הראל-חיסכון-לכל-ילד-אפריל-2026-_.pdf>) | Harel, Altshuler Shaham and Bank Yahav: the fees they state for child savings | 2026-10-25 | institution |
| [ETF-06](<https://olaw.org.il/takanot/takanot-7646.pdf>) | ETF price on the exchange is not the NAV | 2026-10-25 | primary (mirror of Reshumot); |
| [ETF-07](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf>) | Managers must publish INAV, median spread, holdings and tracking data | 2026-10-22 | primary |
| [ETF-13](<https://olaw.org.il/takanot/takanot-7646.pdf>) | Fee layers in an Israeli tracking fund or ETF | 2026-10-25 | primary (mirror of Reshumot). ETF-14, ETF-05 |
| [ETF-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=2>) | Variable management fee: definition, cap, timing | 2026-10-25 |  |
| [ETF-30](<https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf>) | iShares: its US-domiciled S&P 500 ETF (IVV), distributing, with a CUSIP | 2026-10-25 |  |
| [GOV-06](<https://www.boi.org.il/media/ytal5ozx/makam.pdf>) | Makam yield and price convention | 2026-10-25 | primary |
| [GOV-11](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>) | CPI-linked bond (אג"ח ממשלתית צמודה): coupon, linkage, redemption | 2026-10-26 | primary |
| [GOV-12](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=5>) | CPI-linked bond in deflation: no floor in the regulation text | 2026-10-25 | primary |
| [GOV-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/annual-debt-report-2024/he/annual-debt-report_annual-debt-report-2024-accessible-version-he.pdf>) | Fixed-rate shekel bond (אג"ח ממשלתית; the older type "שחר" is separate) | 2026-10-25 | primary |
| [GOV-22](<https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/makam/>) | Bank of Israel's consumer page on makam | 2026-10-25 | primary |
| [GOV-23](<https://www.boi.org.il/boi_files/hanpaka.pdf>) | Makam issue schedule | 2026-10-25 | primary |
| [IRA-17](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>) | Management fee level and cap | 2026-10-25 | primary; |
| [IRA-21](<https://www.meitav.co.il/media/r2djwzpw/26061426l-תוצאות-מכרז-לניהול-אישי-2026-לאומי.pdf>) | Meitav: brokerage tariffs inside the IRA, effective 01.05.2026 | 2026-10-25 | institution; |
| [IRA-25](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=4>) | Liquidity and withdrawal follow the underlying product | 2026-10-25 | primary; |
| [KGL-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | Annual deposit ceiling: one ceiling per person across all managers, CPI-linked | 2026-10-25 | primary |
| [KGL-03](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | The 2026 ceiling figure: the law's NIS 70,000 indexed to the CPI | 2026-10-25 | primary; |
| [KGL-04](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | One ceiling per person, checked when the money is deposited | 2026-10-25 | primary; |
| [KGL-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | Fee bases and the regulated maximum (domain open question 8, for this product) | 2026-10-25 | primary; |
| [KGL-15](<https://www.meitav.co.il/provident_pension/provident_invest/>) | Meitav: a published list price (example, not a cap) | 2026-10-25 | institution; |
| [KGL-16](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | Fee discounts: minimum duration and when they can end early | 2026-10-25 | primary. The same circular: PF-13, PF-14, PF-16 |
| [KH-02](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | Who can be a member: salaried member and self-employed member | 2026-10-25 | primary |
| [KH-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Contribution rates: set by agreement, within the tax-benefited limits of 7.5% employer and 2.5% employee | 2026-10-25 | primary |
| [KH-10](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Withdrawal grounds; early withdrawal is allowed and taxed | 2026-10-25 | primary |
| [KH-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | First payment date starts the clock | 2026-10-25 | primary. TXH-09 |
| [KH-22](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>) | Fee cap: up to 2% a year of the balance, and no deposit fee is authorised | 2026-10-25 | primary; |
| [KH-23](<https://data.gov.il/he/datasets/cma/gemelnet>) | Fees actually charged: the CMA's reported averages, and how long a discount lasts | 2026-10-22 | primary |
| [MF-11](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | Orders go through a distributor (bank or TASE member), in cash, through the clearing house | 2026-10-25 | primary (mirror) |
| [MF-16](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf>) | Management fee (דמי ניהול / שכר מנהל הקרן): annual % of assets, inside the price, set by the prospectus | 2026-10-25 |  |
| [MF-20](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-64186b589b352/080217.pdf>) | Trustee fee (שכר נאמן) | 2026-10-25 |  |
| [MF-25](<https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(עמלת_הפצה)>) | No distribution fee on tracking funds, listed units and some holdings | 2026-10-22 | primary (mirror) |
| [MF-26](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=10>) | What a distributor that is not an investment marketer may charge the unit holder directly | 2026-10-25 |  |
| [MF-27](<https://www.boi.org.il/media/mi2driua/159a.pdf>) | Bank and broker commissions and custody on fund units: what the rules allow | 2026-10-25 | primary |
| [MF-34](<https://boi.org.il/media/gcmk52bw/447a.pdf>) | Daily money-market funds (קרנות כספיות יומיות) | 2026-10-25 |  |
| [MF-35](<https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/MoneyMarketFund_Prospectus25.pdf>) | Renewable (fixed-date) money-market funds (קרן כספית מתחדשת / קרנות כספיות מועדים קבועים) | 2026-10-25 |  |
| [MF-37](<https://boi.org.il/media/gcmk52bw/447a.pdf>) | The expected yield is net of fees, before tax, and not guaranteed | 2026-10-26 |  |
| [PEN-03](<https://www.gov.il/BlobFolder/guide/labor-wage/he/workers-rights_working-conditions_pension_Pension2016.pdf>) | Minimum contribution rates | 2026-10-26 | primary; |
| [PEN-15](<https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz201634a.pdf>) | Cost of insurance | 2026-10-25 | primary (third-party host); |
| [PEN-22](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | Fee caps for a provident fund for annuity | 2026-10-25 | primary; |
| [PEN-23](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2024-097/he/Regulations_regarding_the_selection_of_%20a_provident_fund-updating%20_(pdf).pdf>) | Selected (default) pension funds and their fees | 2026-10-25 | primary; |
| [PEN-26](<https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf>) | Retirement ages | 2026-10-25 | primary; |
| [PEN-34](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | What a provident fund for annuity is since 2008 | 2026-10-25 | primary; |
| [PEN-35](<https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf>) | Provident fund for annuity versus pension fund | 2026-10-25 | primary; |
| [PF-02](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4>) | Cap for provident funds (regulation 2): 1.05% a year of balance and 4% of deposits | 2026-10-26 | primary; |
| [PF-04](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=5>) | Cap for a new comprehensive pension fund: 0.5% a year of balance and 6% of deposits | 2026-10-25 | primary; |
| [PF-06](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6>) | Cap for keren hishtalmut and IRA (regulation 4): 2% a year of balance, no deposit-fee item | 2026-10-25 | primary; |
| [PF-09](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)>) | How the balance fee is collected and prorated | 2026-10-22 | primary |
| [PF-10](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpsFM+Hq~v6+ysOsYBj7v7sI=#page=2>) | Direct investment-management expenses are charged on top of the management fee, from a closed list | 2026-10-25 | primary; |
| [PF-13](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | A fee discount must last a minimum period | 2026-10-25 | primary |
| [PF-14](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>) | When a manager may raise the fee before the discount period ends | 2026-10-25 | primary; |
| [PF-17](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | A member may transfer money between provident funds; which routes are allowed | 2026-10-25 | primary; |
| [PF-23](<https://www.btl.gov.il/Laws1/02_0103_100022.pdf>) | Track switching: within three business days; no fee or frequency limit in the regulation | 2026-10-25 | primary; |
| [TXF-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Rate on the real capital gain | 2026-10-25 | primary |
| [TXF-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Real gain on a foreign-currency security is measured against the exchange rate (automatic) | 2026-10-25 | primary |
| [TXF-04](<https://www.capitax.co.il/Attachments/04072019.pdf>) | Foreign fund registered on TASE ("קרן חוץ"): exchange rate or CPI as the index | 2026-10-26 | primary (copy: no gov.il copy found) |
| [TXF-06](<http://www.capitax.co.il/Attachments/04072019.pdf>) | "קרן חוץ" on TASE: foreign tax credit only for tax on the fund's own distributions | 2026-10-22 | primary |
| [TXF-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Dividends from foreign companies and foreign funds: 25% | 2026-10-25 | primary |
| [TXF-10](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | Israeli intermediary that receives a foreign dividend for an Israeli resident withholds 25% | 2026-10-26 | primary |
| [TXF-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | A non-controlling holder of a listed foreign fund is taxed on sale and distributions only (by implication; no deemed-distribution rule) | 2026-10-25 | primary |
| [TXF-12](<https://www.irs.gov/pub/irs-trty/israel.pdf>) | US withholding on US dividends paid to an Israeli resident: treaty cap 25% | 2026-10-25 | primary |
| [TXF-13](<https://www.irs.gov/forms-pubs/about-form-w-8-ben>) | W-8BEN: given to the withholding agent; otherwise 30% may apply | 2026-10-25 | primary |
| [TXF-16](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Tax suffered inside a foreign fund is a fund-level cost, not creditable in Israel | 2026-10-25 | primary |
| [TXF-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Foreign tax credit: what qualifies | 2026-10-25 | primary |
| [TXF-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Foreign tax credit cap: by income source ("basket"), not by country | 2026-10-25 | primary |
| [TXF-21](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Foreign dividends and interest not withheld in Israel: advance payment by 30 April; shortened route | 2026-10-25 | primary |
| [TXF-22](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Securities sold at a foreign broker (no Israeli withholding): semi-annual report and advance | 2026-10-26 | primary |
| [TXG-02](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | Income-tax brackets for 2026, personal-effort income | 2026-10-25 | primary |
| [TXG-03](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | Income that is not from personal effort starts at 31% | 2026-10-25 | primary |
| [TXG-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Age 60 and over: lower brackets on all taxable income | 2026-10-25 | primary |
| [TXG-05](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | Credit point value | 2026-10-22 | primary |
| [TXG-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | "Maximum rate" vs "fixed rate" on special-rate income; capital income as the top slice | 2026-10-25 | primary |
| [TXG-08](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | Who can pay less than 25% on capital income (Q16, general rule) | 2026-10-22 | primary (derived) |
| [TXG-09](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) | Surtax (מס נוסף, "מס יסף"), base 3% | 2026-10-25 | primary |
| [TXG-10](<https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf>) | Additional 2% surtax on capital-source income (closes Q11) | 2026-10-25 | primary |
| [TXG-11](<https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf>) | Surtax is settled through the annual return, not through advances | 2026-10-22 | primary |
| [TXG-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Capital gain, real gain and inflationary amount (definitions) | 2026-10-25 | primary |
| [TXG-25](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Refunds: six years back, and a short form for non-filers | 2026-10-22 | primary |
| [TXG-35](<https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9C%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%A9%D7%9B%D7%99%D7%A8%D7%99%D7%9D.aspx>) | National Insurance and health contributions on an employee's salary (2026) | 2026-10-25 | primary |
| [TXH-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Employer deposit within the limits is not taxed at deposit (employee) | 2026-10-25 | primary |
| [TXH-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Determining salary (`משכורת קובעת`): definition and update | 2026-10-25 | primary |
| [TXH-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Employer deposit above the limits is taxed as salary when paid | 2026-10-25 | primary |
| [TXH-04](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf>) | Employee's own deposit: no deduction or credit | 2026-10-25 | primary |
| [TXH-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Self-employed deduction (s.17(5A)) | 2026-10-25 | primary |
| [TXH-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | What counts as a "benefited deposit" (`הפקדה מוטבת`) | 2026-10-25 | primary |
| [TXH-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Exempt withdrawal after 6 years | 2026-10-25 | primary |
| [TXH-11](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Gains on non-benefited deposits: interest income, up to 25% of the real gain | 2026-10-25 | primary |
| [TXH-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Early withdrawal by an employee: what is taxed and at what rate | 2026-10-25 | primary |
| [TXH-15](<https://www.btl.gov.il/Laws1/02_0103_100097.pdf>) | Withholding by the fund | 2026-10-25 | primary |
| [TXH-18](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Gains are not taxed while in the fund | 2026-10-25 | primary |
| [TXI-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | "Interest" includes the makam discount | 2026-10-25 | primary |
| [TXI-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Ceiling of 25% on interest, as the top slice | 2026-10-25 | primary |
| [TXI-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | 15% on interest from an asset that is not fully CPI-linked | 2026-10-25 | primary |
| [TXI-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | What counts as "linked": the index, partly linked, prime-linked, FX | 2026-10-25 | primary |
| [TXI-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Linkage on a fully linked asset is exempt, so only real interest is taxed | 2026-10-25 | primary |
| [TXI-06](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) | When the reduced interest rates do not apply (marginal rates instead) | 2026-10-22 | primary |
| [TXI-07](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Timing: deposits and savings plans are taxed on withdrawal; tax is withheld when interest is paid | 2026-10-26 | primary |
| [TXI-08](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | Bank withholding on deposit, savings-plan and current-account interest | 2026-10-25 | primary |
| [TXI-09](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>) | Withholding by other payers (bond coupons, makam discount) | 2026-10-25 | primary |
| [TXI-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Makam held to redemption: the discount is interest at 15% | 2026-10-25 | primary |
| [TXI-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Selling an unlinked government bond or makam before maturity: capital gain up to 15%, all treated as real | 2026-10-25 | primary |
| [TXI-14](<https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmWhyAjAO9sieYV7GsTkIsdY=#page=4>) | CPI-linked government bond (Galil type): real interest and real gain, up to 25% | 2026-10-25 | primary |
| [TXI-15](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Unlinked government bonds (Shahar type, fixed; Gilon type, variable): the rate follows linkage, not the product name | 2026-10-25 | primary |
| [TXI-16](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Accrued interest bought with a bond (s.3(h)) | 2026-10-25 | primary |
| [TXI-19](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Maximum rate vs fixed rate: people aged 60 or over can pay less than 25% on linked interest (tax open question Q16) | 2026-10-26 | primary |
| [TXI-20](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Low-income deduction from deposit and savings-plan interest (s.125D(b)), any age | 2026-10-25 | primary |
| [TXI-25](<https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2>) | Negative linkage does not reduce the tax on interest; the linkage loss was not offset, and the Supreme Court left the offset question open | 2026-10-25 | primary (court ruling; opened in Chrome 2026-10-25; by script the court's site resets the connection, 2026-10-26) |
| [TXK-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | No deduction or credit on deposits to a kupat gemel lehashkaa | 2026-10-25 | primary |
| [TXK-02](<https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf>) | Annual deposit ceiling (tax-relevant limit; the product rule is in `kupat-gemel-lehashkaa.md`) | 2026-10-26 | primary (base, indexation) |
| [TXK-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | No tax on growth inside the fund | 2026-10-25 | primary |
| [TXK-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Track switches and transfers between kupot gemel lehashkaa are not taxed | 2026-10-25 | primary |
| [TXK-05](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Lump-sum withdrawal: gains are treated as interest income | 2026-10-25 | primary |
| [TXK-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Rate on that interest: up to 25%, as the top slice of income | 2026-10-25 | primary |
| [TXK-07](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Lump sum: the linkage part is exempt, the rest is taxed at up to 25% (the real gain); the manager withholds | 2026-10-25 | primary |
| [TXK-16](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | IRA: in law, a provident fund in personal management | 2026-10-25 | primary |
| [TXK-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | IRA: no IRA-specific tax rule; the wrapper's rules apply (Q13) | 2026-10-26 | primary |
| [TXK-19](<https://www.btl.gov.il/Laws1/00_0001_000000.pdf>) | Child savings: deposits, the parental addition and grants are not income | 2026-10-25 | primary |
| [TXK-20](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/tax.aspx>) | Child savings: gains are taxed on withdrawal; no official rate found (Q4) | 2026-10-25 | primary |
| [TXK-23](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Child savings, provident track: the kupat gemel lehashkaa lump-sum rule appears to apply (inference) | 2026-10-25 | primary |
| [TXP-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Credit versus deduction: what each is worth | 2026-10-25 | primary |
| [TXP-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Employee's own deposit: s.45A credit and its ceiling (not a beneficiary member) | 2026-10-25 | primary |
| [TXP-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Beneficiary member (`עמית מוטב`): definition and test | 2026-10-25 | primary |
| [TXP-04](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Beneficiary member: s.45A(e) credit ceiling | 2026-10-25 | primary |
| [TXP-06](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | s.47(b1) deduction for a beneficiary member (the self-employed case) | 2026-10-25 | primary |
| [TXP-10](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Employer pension deposit (employer-contribution component): not taxed at deposit up to the ceiling | 2026-10-25 | primary |
| [TXP-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Employer severance deposit: not taxed at deposit up to the severance ceiling | 2026-10-25 | primary |
| [TXP-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Growth inside the fund: the fund's income is exempt; exceptions | 2026-10-25 | primary |
| [TXP-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Qualifying annuity (`קצבה מזכה`): partial exemption from retirement age | 2026-10-25 | primary |
| [TXP-24](<https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf>) | Provident fund for annuity versus pension fund: one tax category | 2026-10-25 | primary |
| [TXP-27](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Which figures are frozen for 2025 to 2027 and which move with the average wage | 2026-10-25 | primary |
| [TXP-31](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Beneficiary member with income that is not work income: how one year's deposits split between deduction and credit | 2026-10-22 | primary (page image; downloaded and read, browser pass 3) |
| [TXS-01](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Capital gain on Israeli-listed shares: rate | 2026-10-25 | primary |
| [TXS-02](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Real vs nominal: the inflationary amount | 2026-10-25 | primary |
| [TXS-03](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Unlinked bonds and other unlinked debt: 15% of the whole gain | 2026-10-25 | primary |
| [TXS-05](<https://www.btl.gov.il/Laws1/02_0103_100228.pdf>) | Withholding by banks and TASE members on securities sales | 2026-10-25 | primary |
| [TXS-06](<https://www.btl.gov.il/Laws1/02_0103_100223.pdf>) | Which lot is sold, and which fees reduce the gain | 2026-10-25 | primary |
| [TXS-08](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Exempt fund: what the fund itself pays | 2026-10-25 | primary |
| [TXS-09](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Exempt fund: what the saver pays on sale or redemption | 2026-10-25 | primary |
| [TXS-11](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Taxable fund: the fund pays, the saver does not, and losses are lost | 2026-10-25 | primary |
| [TXS-12](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Money-market funds: what a saver pays, and on what base (closes Q15) | 2026-10-25 | primary |
| [TXS-13](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Israeli tracking funds and ETFs (קרנות מחקות, קרנות סל): tax status is set fund by fund | 2026-10-26 | primary |
| [TXS-14](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Currency component of a shekel fund that holds foreign assets | 2026-10-26 | primary |
| [TXS-17](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Loss offset in the same year | 2026-10-25 | primary |
| [TXS-21](<https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf>) | Switching between funds or securities is a sale | 2026-10-25 | primary |
| [TXS-23](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) | Age 60 and over | 2026-10-25 | primary |
| [TXS-24](<https://maya.tase.co.il/he/funds/mutual-funds>) | Each fund's tax status is published by TASE, and some money-market funds are taxable | 2026-10-25 | primary |

<!-- generated by expected_calc.py: end -->
