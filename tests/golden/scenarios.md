# Golden scenarios: inputs only

Written 2026-10-22 by the financial modeler. Each scenario fixes every input the engine needs and names the formulas in `docs/method.md` it exercises. The founder adds the expected results from his own spreadsheet in the "Expected" block of each scenario; until then the block is empty. Tolerance is P-06.

How to read a scenario:

- **Profile** gives the taxpayer inputs (A-12, A-13). Unless stated: Israeli resident, not a substantial shareholder, under 60 at exit, salaried, no other capital income, refund claimed (A-14 on).
- **Goal** gives the outlay and horizon. Unless stated: contributions on the first of the month, constant in real terms (A-04), exit on the last day of the last month (A-05).
- **Market** gives `r_g` (A-01), `π` (A-02), `f` (A-03). These are test values, not forecasts; where the site would source a default the scenario says "sourced in production".
- **Instrument and wrapper** give the fee lines, drag and rule figures. Rule figures are the 2026 values recorded in `il-finance` on 2026-10-22; if a figure changes, the scenario's tax year keeps it fixed.
- **Expected** is left for the founder: real liquidation value `V_T/I_T`, nominal `V_T`, fees by type, tax during, tax at exit, and any flags.

Conventions shared by all scenarios: tax year 2026 for every rule figure; the engine's month-grid CPI convention (F-03); balance fees as a monthly twelfth (F-07).

---

## Part A: the ledger on single instruments

### S01 Unlinked bank deposit, one-month ladder
Exercises F-01 to F-09, F-21, F-41.
- Profile: salary 12,000/month; age 22.
- Goal: 50,000 now; 1,000/month; horizon 3 years.
- Market: deposit rate 3.5% effective annual (A-21, sourced in production); π = 3%; no FX.
- Instrument: one-month unlinked deposit (A-15 = 1, A-16 = unlinked fixed), auto-renewing; no fees; tax 15% withheld at each maturity (TXI-03, TXI-08).
- Expected: _(founder)_

### S02 Same deposit, contributions constant in nominal terms
Exercises A-04 nominal branch of F-05.
- As S01 with A-04 = constant nominal.
- Expected: _(founder)_

### S03 CPI-linked one-year deposit
Exercises F-21 linked branch (TXI-05, TXI-02), F-03.
- Goal: 100,000 now; no monthly; horizon 3 years.
- Market: real rate 1.2% a year plus CPI linkage on principal and interest (BANK-26); π = 3%.
- Instrument: one-year fully linked deposit (A-15 = 12), three rolls; tax 25% on real interest at each maturity, linkage exempt.
- Expected: _(founder)_

### S04 Prime-linked monthly deposit (15% bucket by reading)
Exercises F-21 partly-linked branch and its "reading" label (TXI-04, TXI OQ2).
- As S01 but rate = prime 4.75% minus 1.4% (BANK-25), monthly reset; prime constant over the horizon.
- Expected: _(founder)_ plus the label "tax bucket: Tax Authority reading, TXI-04".

### S05 Current-account credit balance
Exercises F-26, F-60 input side.
- Goal: 30,000 held; no contributions; horizon 1 year.
- Market: credit interest 0.5% a year (A-25); π = 3%.
- Tax 15% at monthly crediting.
- Expected: _(founder)_

### S06 Makam rolled yearly
Exercises F-24 (GOV-06 price, TXI-11 15%), F-12 trade commission on makam, no custody (BRK-17), G-09 flag.
- Goal: 100,000 now; no monthly; horizon 2 years.
- Market: makam yield 3.9% (A-22); π = 3%.
- Wrapper: bank brokerage; buy commission on makam 0.1% min 20 NIS per order; sell commission not charged at redemption; custody 0 on makam.
- Instrument: two consecutive 365-day series bought at issue and held to redemption.
- Expected: _(founder)_ with the flag "makam rate conflict 15/20%, TXI OQ3".

### S07 Makam sold before redemption
Exercises F-24 sale branch (TXI-12, 15% on whole gain) and F-12 sell order.
- As S06 but horizon 18 months: the second series is sold after 6 months at the price implied by the unchanged 3.9% yield; sell commission 0.1% min 20.
- Expected: _(founder)_

### S08 Unlinked fixed-rate government bond
Exercises F-25 unlinked (TXI-15, TXI-12), coupon reinvestment lots, A-27.
- Goal: 100,000 now; horizon 3 years.
- Market: bond coupon 3.75% paid yearly (A-23); price 100 at purchase; A-27 = 0 (sold at par at exit); π = 3%.
- Wrapper: bank brokerage; buy and sell 0.2% min 30 NIS; custody 0.1% a quarter min 10 NIS on bonds.
- Expected: _(founder)_

### S09 CPI-linked government bond
Exercises F-25 linked (TXI-14, GOV-11, GOV-12), F-03.
- As S08 but coupon 1.9% real, principal and coupon scale with CPI; tax 25% on real coupon and on real gain at exit.
- Expected: _(founder)_

### S10 CPI-linked bond under deflation (no floor)
Exercises GOV-12 both directions and G-07 (no loss).
- As S09 with π = −1% for the whole horizon.
- Expected: _(founder)_ with the flags "deflation treatment open, TXI OQ6" and "real loss not carried, G-07".

### S11 Daily money-market fund at a bank
Exercises F-23 daily branch (A-20 proxy, MF-34), F-10 drag, F-12 zero commission at a bank (MF-26), BRK-17 no custody, F-44 exit 25% real (TXS-12), FIFO lots (TXS-06).
- Goal: 50,000 now; 1,000/month; horizon 2 years.
- Market: BoI rate 3.25% (A-20); fund fees: management 0.16% + trustee 0.02% (δ = 0.18%); π = 3%.
- Expected: _(founder)_

### S12 Renewable money-market fund, quarterly dates
Exercises F-23 renewable branch (A-24 net of fees, MF-37), exit at the last fixed date before the horizon (MF-35).
- Goal: 100,000 now; no monthly; horizon 14 months.
- Market: expected yield 3.57% net of fund fees (MF-37 example figure, test value); π = 3%.
- Instrument: 3-month fixed dates; the exit is at month 12.
- Expected: _(founder)_

### S13 Taxable shekel money-market fund (derived)
Exercises F-20 taxable-fund case (TXS-11, TXS-12 (b)), the holder's 0% at exit.
- As S11 with the fund taxable (TXS-24 example 5137559); fund-level tax 15% of nominal interest modelled as extra δ; no tax to the holder at exit; loss not offsettable (noted).
- Expected: _(founder)_ with the label "derived, TXS-12(b)".

### S14 Israeli accumulating ETF on a foreign index, bank brokerage
Exercises F-10 with fixed + variable + trustee fees (ETF-13, ETF-14), F-13 half-spread, F-12, F-14 custody, F-40 real basis on CPI (TXS-13, TXS-14 shekel fund), F-09 same-year fee deduction (TXS-06).
- Goal: 20,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6%; π = 2.5%; f = 0 (the fund is in shekels; FX inside the tracking asset is part of r_g, ETF-10).
- Fund: fixed 0.80%, variable 0.30%, trustee 0.0085% (ETF-13 IBI example), tracking difference 0, half-spread 0.05%.
- Tariff: buy/sell 0.3% min 25 NIS; custody 0.15% a quarter min 15 NIS.
- Expected: _(founder)_

### S15 Israeli open tracking fund, same index, no trading costs
Exercises F-10 with the low-fee open fund (ETF-13 Yalin example: manager 0%, trustee 0.02%), order through the distributor (MF-10, MF-11), distribution-fee-free (MF-25).
- As S14 with δ = 0.02%, no spread, buy/sell per the bank's mutual-fund line (0.1% min 10 NIS), custody as S14.
- Expected: _(founder)_

### S16 TASE-registered foreign fund (קרן חוץ), FX index for tax
Exercises F-04, F-40 with X as the index (TXF-04 90% test), F-20 foreign distributions withheld by the Israeli member (TXF-05), A-11 fund-level drag (TXF-16), G-05 flag.
- Goal: 100,000 now; no monthly; horizon 5 years.
- Market: r_g 6% in shekel terms; π = 2.5%; f = +1% a year (shekel weakens).
- Fund: Irish UCITS on S&P 500, accumulating (ETF-27), fixed fee 0.07%, 90% test met; fund-level withholding drag 0.23% (A-11 computed from a 1.5% dividend yield × 15%).
- Tariff: TASE foreign-fund units traded in shekels; buy/sell 0.3% min 25; custody 0.15%/quarter.
- Expected: _(founder)_ with the dimension "tax-during: blocked (TXF OQ1, F4)" and the row "listed, not ranked".

### S17 US-domiciled distributing ETF at a foreign broker, with W-8BEN
Exercises F-13 FX fee on contributions and exit, F-20 foreign branch (TXF-08, TXF-12, TXF-18 credit), F-22 timing note (TXF-21, TXF-22), F-40 with X index (TXF-03), F-17 fixed fees, TXF-27 estate note.
- Goal: 100,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6% in USD; π = 2.5%; f = +1% a year; distribution yield 1.3% (A-10).
- Fund: expense ratio 0.03% (ETF-30); US withholding 25% on distributions (W-8BEN on file); Israel 25% with credit → 0 extra.
- Broker: no custody; trade USD 2.5 minimum per order (BRK-36), FX conversion 0.2% each way; no Israeli withholding; advances by 30 April ignored in timing.
- Expected: _(founder)_ with the flag "US estate tax exposure above USD 60,000 (TXF-27)".

### S18 Same ETF without a W-8BEN
Exercises the 30% branch of F-20 (TXF-13) and the lost 5%.
- As S17 with US withholding 30%.
- Expected: _(founder)_

### S19 Irish distributing ETF at a foreign broker
Exercises F-20 with unknown Irish withholding (G-05).
- As S17 but Irish-domiciled distributing class, expense 0.07%, A-11 drag 0.23%, Irish withholding 0 with flag.
- Expected: _(founder)_

---

## Part B: provident-family wrappers

### S20 Kupat gemel lehashkaa, list fees
Exercises F-11 deposit fee, F-15 balance fee, A-18 direct expenses, F-27, F-44 (25% real, labelled), G-02 sensitivity line, ceiling check (F-05, KGL-03).
- Goal: 20,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6%; π = 2.5%.
- Fees: deposit 0%, balance 0.8% (KGL-15 example), direct expenses 0.10%.
- Expected: _(founder)_: value with 25% real, the alternative with 15% nominal, the label "base: secondary source".

### S21 Kupat gemel lehashkaa, ceiling breached
Exercises F-05 ceiling routing (KGL-02, KGL-04).
- Goal: 90,000 now; 0/month; horizon 1 year; a second goal exists in the person's order.
- Expected: _(founder)_: 83,641 accepted, 6,359 routed to the next goal, message shown.

### S22 Kupat gemel lehashkaa, fee discount expiring
Exercises F-16 (A-19) with a 2-year discount reverting to 1.05% (KGL-16, PF-13 conflict flagged, G-15).
- As S20 with balance fee 0.5% for 24 months then 1.05%.
- Expected: _(founder)_

### S23 Keren hishtalmut, employee, horizon past 6 years
Exercises F-33, F-46 (TXH-09, TXH-08 cap), F-52 employer line (TXH-01, KH-04), F-15 within the 2% cap (KH-22), B2.
- Profile: salary 12,000; employer 7.5%, employee 2.5% (KH-04); fund opened at month 0.
- Goal: own contribution = 2.5% × 12,000 = 300/month, constant nominal (payroll); horizon 7 years.
- Market: r_g 6%; π = 2.5%.
- Fees: balance 0.6%, direct expenses 0.11% (PF-10 example).
- Expected: _(founder)_: ranked value (own money), the "only available here" employer line (900/month), both exempt at exit.

### S24 Keren hishtalmut, horizon 4 years (locked, listed not ranked)
Exercises B3, F-47 when the person opts in (TXH-13, TXH-15 47% withholding, refund A-14).
- As S23 with horizon 4 years. Two runs: (a) default, listed with value at the 6-year exit date; (b) opt-in early withdrawal at month 48.
- Expected: _(founder)_ for both.

### S25 Keren hishtalmut, salary above the determining-salary cap
Exercises TXH-02 cap (15,712), TXH-03 employer excess taxed at τ_m (TXG-02), G-04 flag.
- Profile: salary 20,000; employer 7.5%, employee 2.5%.
- Goal: horizon 7 years; other inputs as S23.
- Expected: _(founder)_: employer line net of tax on the excess; own deposit capped at the benefited amount, excess flagged.

### S26 Self-employed keren hishtalmut
Exercises F-46 self-employed limb (TXH-05 deduction at τ_m, TXH-08 20,566 benefited), F-30 equal net outlay with a deduction.
- Profile: self-employed, business income 200,000/year; marginal rate from TXG-02.
- Goal: 20,566/year deposited in December; horizon 6 years.
- Expected: _(founder)_

### S27 Pension deposit by an employee, credit cap not binding
Exercises F-30, F-31 (TXP-01, TXP-02 35% credit, floor), B2 employer line (PEN-03, PEN-04, TXP-10), F-53 insurance (A-17), F-15 selected-fund fees (PEN-23), F-49 blocked, B3 listing.
- Profile: age 30; salary 10,000; existing employee 6%, employer 6.5% + 6% severance, all in the selected fund at 0.22% balance / 1% deposits (PEN-23); A-17 insurance 1.5% of deposits (entered).
- Goal: extra own deposit 300/month net outlay; horizon 30 years (exit at 60).
- Market: r_g 5%; π = 2%.
- Expected: _(founder)_: gross deposit per month from F-30, gross balance at 60, the "exit: annuity rules, blocked (G-03)" flag, employer line value.

### S28 Pension deposit, credit cap binding
Exercises F-31 cap (7% of 116,400 = 8,148/year) and the existing-deposit interaction.
- Profile: salary 15,000; existing employee 6% (10,800/year already credited).
- Goal: extra 1,000/month net outlay; horizon 10 years.
- Expected: _(founder)_: only the part within the cap earns the credit.

### S29 Beneficiary member, self-employed
Exercises F-32 (TXP-03 16% test, TXP-04 credit, TXP-06 deduction tiers), G-13 flag.
- Profile: self-employed, income 240,000/year, no employer deposits; deposits 40,000/year.
- Goal: horizon 20 years.
- Expected: _(founder)_

### S30 Provident fund for annuity vs pension, same money
Exercises PEN-22 vs PEN-21 caps, F-53 zero insurance (PEN-35), F-49 blocked for both.
- As S27, run in `provident-for-annuity` with fees 0.5% balance, 0% deposits, no insurance.
- Expected: _(founder)_

### S31 Child savings, provident route, doubled
Exercises F-54 (CS-03, CS-04, CS-13 cohort, CS-18 fees), F-50 blocked.
- Child born 2026-01-01; doubling on from birth; increased-risk track r_g 6%; π = 2%; horizon to age 21.
- Expected: _(founder)_: gross balance at 18 and 21, grants, fees from 21, the flag "exit tax blocked (G-17)".

### S32 Child savings, bank route
Exercises CS-10 tracks, F-21 as a savings plan (derived label), CS-23 stale data flag.
- As S31 at a bank: fixed unlinked 3% to 18, entered (A-26); no exit stations.
- Expected: _(founder)_ with "derived" and "rates data stale" flags.

### S33 IRA hishtalmut with brokerage inside
Exercises F-51, two fee layers (PF-06 manager fee + IRA-21 bank tariff), F-46.
- Profile: existing hishtalmut balance 250,000 moved to an IRA at month 0 (clock already past 6 years).
- Goal: no contributions; horizon 5 years; holding an Israeli ETF as S14.
- Fees: manager 0.3% balance; bank annex buy/sell 0.1% min 15, custody 0.05%/quarter.
- Expected: _(founder)_

---

## Part C: exit-year tax features

### S34 Exit at age 60 with low other income
Exercises F-42 (TXG-04, TXG-08, TXI-19, TXS-23), A-13, A-14.
- Profile: age 55 at start; other income in exit year 60,000.
- Goal: 300,000 now in an Israeli ETF as S14 (no monthly); horizon 5 years.
- Market: r_g 6%; π = 2.5%.
- Expected: _(founder)_: tax at the brackets on the real gain, capped at 25%, and the refund amount versus the 25% withheld.

### S35 Exit at 60 holding an unlinked bond (fixed 15% unchanged)
Exercises F-42 fixed-rate branch (TXG-08 (c)).
- As S34 in the S08 bond.
- Expected: _(founder)_

### S36 Surtax year
Exercises F-43 (TXG-09, TXG-10).
- Profile: salary 50,000/month (600,000/year).
- Goal: 2,000,000 now in an Israeli ETF as S14; horizon 3 years.
- Market: r_g 8%; π = 2%.
- Expected: _(founder)_: 3% on the slice above 721,560 and 2% on the capital-source slice.

### S37 Negative real gain
Exercises F-40 `max(0, real)`, G-07.
- Goal: 100,000 now in the S11 money-market fund; horizon 2 years.
- Market: BoI rate 1%; δ 0.18%; π = 3%.
- Expected: _(founder)_: tax 0, nominal gain positive, real gain negative, flag.

### S38 Brokerage switch versus provident track switch
Exercises F-66 (TXS-21 vs TXK-04).
- Two runs, each 100,000 now, horizon 6 years, r_g 6%, π 2.5%: (a) brokerage, switch funds at month 36 (same fees as S14); (b) kupat gemel lehashkaa, track switch at month 36 (fees as S20).
- Expected: _(founder)_: cost of switching in each.

---

## Part D: capability outputs

### S39 Wrapper mode: the founder's ETF-vs-provident case
Exercises F-80 ranking and ties (P-01), F-81 sensitivity (P-02), B1 to B3, dimension marks.
- Profile: age 22; salary 12,000; pension and hishtalmut through work exist.
- Goal: long-term wealth preset: 30,000 now; 2,000/month; horizon 20 years; nothing must stay available.
- Market: r_g 6% entered; π 2.5% entered.
- Wrappers: brokerage with S14's ETF; kupat gemel lehashkaa as S20; hishtalmut own-money as S23 (clock from month 0; exit after 6 years is lawful); pension extra deposit as S27 (listed, not ranked: locked and G-03).
- Expected: _(founder)_: ranking, the deciding formula per F-80, tie status, the sensitivity flips for r_g, π and the balance fee within the bounds the founder sets in P-02.

### S40 Wrapper mode: the founder's apartment case
Exercises eligibility filters (section 8, D13 constraints), B3.
- Goal: purchase at a known date: 150,000 now; 4,000/month; horizon 4 years; 50,000 must stay available at once.
- Wrappers: all tier-1; expected eligible: current account for the 50,000, deposits, money-market funds, makam, bonds, brokerage, kupat gemel lehashkaa; hishtalmut listed not ranked (clock 4 years); pension listed not ranked.
- Market: cash-like sourced in production (test values: deposit 3.5%, BoI 3.25%, makam 3.9%); r_g for the ETF 5% entered; π 2.5%.
- Expected: _(founder)_

### S41 Idle-cash preset
Exercises F-60 with the three labels (A-21 "average paid at this bank", A-26 "entered by you", A-20).
- Inputs: balance 80,000; must stay available 20,000; bank average one-month deposit 3.2%; own offer 3.6%; BoI 3.25%; daily fund δ 0.18%; makam 3.9%; current-account interest 0.5%.
- Expected: _(founder)_: monthly cost of leaving 60,000 where it is, per alternative.

### S42 Fee materiality on the founder's hishtalmut
Exercises F-61, F-62 (P-03), regulator reference (KH-23 averages), caps (KH-22).
- Holding: balance 120,000; own 300/month; employer 900/month; balance fee 0.74%; direct expenses 0.11%; horizon 10 years; r_g 6%; π 2.5%.
- Reduction tested: fee to 0.34%.
- Expected: _(founder)_: cost of each fee line, interaction remainder, value of the reduction, verdict under the founder's thresholds.

### S43 Fee materiality on a brokerage plan
Exercises F-61 across trade, custody, spread, fund fees and FX.
- Holding as S17 but at a bank: buy/sell 0.3% min 25, custody 0.15%/quarter, FX 0.25% each way, fund 0.03%, half-spread 0.02%.
- Expected: _(founder)_: ranked fee costs over 5 years.

### S44 Provider workbench, 1 trade vs 10 trades a month
Exercises F-63, A-28, D4 three levels, "not comparable" row, F-80 ties.
- Goal: 10,000 now; 2,000/month; horizon 5 years; Israeli ETF as S14.
- Providers: bank A (list 0.3% min 25; regulator average 0.21% band 100k–200k; custody 0.15%/q min 15); bank B (list 0.25% min 30; average 0.19%; custody 0.12%/q min 20); broker C (list 0.08% min 8; TASE average 0.07%; monthly fee 15 NIS; custody 0); broker D tariff missing.
- Two runs: 1 order per month; 10 orders per month of 200 each.
- Expected: _(founder)_: year-1 cost, horizon cost, deciding fee type, ties, the missing row.

### S45 Provider with "entered by you" fee
Exercises D4 entered level in F-63.
- As S44 bank A with an entered buy/sell fee of 0.1% min 10.
- Expected: _(founder)_

### S46 Holdings review: parental kupot gemel
Exercises F-70 (P-04), F-72 (PF-17, PF-18), hand-off to F-61.
- Holdings: two provident funds for annuity at different managers, balances 80,000 and 40,000, fees 0.9%/0% and 0.6%/0%, classifications "כללי" and "מניות"; a child-savings plan; horizon 15 years; loss filter 30%.
- Expected: _(founder)_: fit marks, consolidation answer with rule IDs, the fee figures, the child-savings default check flagged (CS OQ10).

### S47 Illustrative timeline for guide pages
Exercises F-67 with P-05.
- P-05 test values: 10,000 now; 500/month; 10 years; r_g 5%; π 2%; each tier-1 wrapper with its list fees from S01, S11, S14, S20, S23, S27.
- Expected: _(founder)_: the series per wrapper.

### S48 Revisit after a rule change
Exercises F-82 and the change log.
- Save S39, then change `data/rules/TXS-09` rate to 30 (test only) and re-run.
- Expected: _(founder)_: the changed entry is reported, the brokerage value changes, ranking status reported.

### S49 Exposure mode with entered returns and the loss filter
Exercises F-71, D9 labels.
- Goal: as S39. Exposures: cash (sourced 3.25%), bonds entered 3%, equity entered 6%; worst fall entered 10% / 40%; largest fall accepted 30%.
- Expected: _(founder)_: equity excluded by the filter, cash and bonds ranked, every entered return labelled.

### S50 Tie
Exercises F-80 tie with P-01.
- Two brokerage providers whose horizon costs differ by less than the founder's θ.
- Expected: _(founder)_: declared tie.

---

## Coverage matrix

| Formula | Scenarios |
|---|---|
| F-01 to F-09 | all |
| F-10 | S11, S13, S14, S15, S16, S17 |
| F-11 | S20, S27 |
| F-12 | S06, S07, S08, S14, S15, S16, S17, S33, S44 |
| F-13 | S14, S16, S17, S43 |
| F-14 | S08, S14, S33, S44 |
| F-15 | S20, S22, S23, S27, S33, S42 |
| F-16 | S22 |
| F-17 | S17, S44 |
| F-20 | S13, S16, S17, S18, S19 |
| F-21 | S01, S02, S03, S04, S32 |
| F-22 | S32 |
| F-23 | S11, S12, S41 |
| F-24 | S06, S07, S41 |
| F-25 | S08, S09, S10, S35 |
| F-26 | S05, S41 |
| F-27 | S20, S23, S27, S33 |
| F-28 | all (zero), flag in S20 |
| F-30 to F-32 | S26, S27, S28, S29 |
| F-33 | S20, S23 |
| F-40 | S14 to S19, S34, S36, S37 |
| F-41 | S01 to S05 |
| F-42 | S34, S35 |
| F-43 | S36 |
| F-44 | S11, S20, S37 |
| F-45 | guide text only (blocked) |
| F-46 | S23, S25, S26, S33 |
| F-47 | S24 |
| F-48, F-49 | S27, S30 (blocked, listed) |
| F-50 | S31, S32 |
| F-51 | S33 |
| F-52 | S23, S25, S27 |
| F-53 | S27, S30 |
| F-54 | S31 |
| F-60 | S41 |
| F-61, F-62 | S42, S43 |
| F-63 | S44, S45 |
| F-64 | needs CMA field confirmation first (product.md dependency 4) |
| F-65 | S16, S17, S19 |
| F-66 | S38 |
| F-67 | S47 |
| F-70, F-72 | S46 |
| F-71 | S49 |
| F-80 | S39, S40, S44, S50 |
| F-81 | S39 |
| F-82 | S48 |
| Eligibility and ceilings (section 8) | S21, S24, S40 |
| Gaps G-01 to G-26 | flags appear in S06, S10, S16, S19, S20, S24, S25, S27, S31, S32, S37, S46 |

Formulas with no scenario: none. Formulas that cannot produce a number (F-45, F-48, F-49, F-50) are covered by scenarios that check the blocked output.
