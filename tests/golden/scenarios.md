# Golden scenarios: inputs only

Written 2026-10-22 by the financial modeler. Each scenario fixes every input the engine needs and names the formulas in `docs/method.md` it exercises. The founder adds the expected results from his own spreadsheet in the "Expected" block of each scenario. **2026-10-23:** the founder asked Claude to settle this; the independent check (`expected_calc.py`, its lines under each "Expected" block) stands as the expected result until a spreadsheet replaces it. Tolerance is P-06.

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
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S01): Real V_T/I_T = 86,024.80; nominal V_T = 94,001.62; paid in 87,690.80; fees 0; interest 7,424.49; tax during 1,113.67 (15% at each monthly maturity); tax at exit 0; TXI-20 deduction 0. Subject to Q1.

### S02 Same deposit, contributions constant in nominal terms
Exercises A-04 nominal branch of F-05.
- As S01 with A-04 = constant nominal.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S02): Real V_T/I_T = 84,428.96; nominal V_T = 92,257.81; paid in 86,000.00; fees 0; tax during 1,104.32; tax at exit 0. Subject to Q1.

### S03 CPI-linked one-year deposit
Exercises F-21 linked branch (TXI-05, TXI-02), F-03.
- Goal: 100,000 now; no monthly; horizon 3 years.
- Market: real rate 1.2% a year plus CPI linkage on principal and interest (BANK-26); π = 3%.
- Instrument: one-year fully linked deposit (A-15 = 12), three rolls; tax 25% on real interest at each maturity, linkage exempt.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S03): Real V_T/I_T = 102,724.37; nominal V_T = 112,249.70; fees 0; tax during 963.88 (25% of real interest at each maturity, linkage exempt); tax at exit 0. Subject to Q3 (income not given; TXI-20 assumed not to apply).

### S04 Prime-linked monthly deposit (15% bucket by reading)
Exercises F-21 partly-linked branch and its "reading" label (TXI-04, TXI OQ2).
- As S01 but rate = prime 4.75% minus 1.4% (BANK-25), monthly reset; prime constant over the horizon.
- Expected: _(founder)_ plus the label "tax bucket: Tax Authority reading, TXI-04".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S04): Real V_T/I_T = 85,771.83; nominal V_T = 93,725.19; fees 0; tax during 1,064.89; tax at exit 0; label "tax bucket: Tax Authority reading, TXI-04" (strength: the rule file's own reading, TXI OQ2). Subject to Q1.

### S05 Current-account credit balance
Exercises F-26, F-60 input side.
- Goal: 30,000 held; no contributions; horizon 1 year.
- Market: credit interest 0.5% a year (A-25); π = 3%.
- Tax 15% at monthly crediting.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S05): Real V_T/I_T = 29,249.96; nominal V_T = 30,127.46; fees 0; tax during 22.49 (15% at monthly crediting); tax at exit 0. Subject to Q3.

### S06 Makam rolled yearly
Exercises F-24 (GOV-06 price, TXI-11 15%), F-12 trade commission on makam, no custody (BRK-17), G-09 flag.
- Goal: 100,000 now; no monthly; horizon 2 years.
- Market: makam yield 3.9% (A-22); π = 3%.
- Wrapper: bank brokerage; buy commission on makam 0.1% min 20 NIS per order; sell commission not charged at redemption; custody 0 on makam.
- Instrument: two consecutive 365-day series bought at issue and held to redemption.
- Expected: _(founder)_ with the flag "makam rate conflict 15/20%, TXI OQ3".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S06): Real V_T/I_T = 100,411.66; nominal V_T = 106,526.73; fees: trade 203.01, custody 0; tax on the discount 1,187.60 (15% at each redemption; the month-24 one falls on the exit day); flag "makam rate conflict 15/20%, TXI OQ3".

### S07 Makam sold before redemption
Exercises F-24 sale branch (TXI-12, 15% on whole gain) and F-12 sell order.
- As S06 but horizon 18 months: the second series is sold after 6 months at the price implied by the unchanged 3.9% yield; sell commission 0.1% min 20.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S07): Real V_T/I_T = 100,155.62; nominal V_T = 104,696.26; fees: trade 308.11, custody 0; tax during 584.42 (series 1 discount); tax at exit 298.71 (15% of the sale gain; sale commission not deducted, D3 decided). Subject to Q22 (days to redemption at the sale).

### S08 Unlinked fixed-rate government bond
Exercises F-25 unlinked (TXI-15, TXI-12), coupon reinvestment lots, A-27.
- Goal: 100,000 now; horizon 3 years.
- Market: bond coupon 3.75% paid yearly (A-23); price 100 at purchase; A-27 = 0 (sold at par at exit); π = 3%.
- Wrapper: bank brokerage; buy and sell 0.2% min 30 NIS; custody 0.1% a quarter min 10 NIS on bonds.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S08): Real V_T/I_T = 98,902.71; nominal V_T = 108,073.66; fees: trade 469.47, custody 1,235.31; tax during 1,725.61 (15% of coupons); tax at exit 0.00 (gain ≤ 0). Subject to D4.

### S09 CPI-linked government bond
Exercises F-25 linked (TXI-14, GOV-11, GOV-12), F-03.
- As S08 but coupon 1.9% real, principal and coupon scale with CPI; tax 25% on real coupon and on real gain at exit.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S09): Real V_T/I_T = 102,625.72; nominal V_T = 112,141.89; fees: trade 481.17, custody 1,270.69; tax during 1,519.94 (25% of indexed coupons); tax at exit 0.00.

### S10 CPI-linked bond under deflation (no floor)
Exercises GOV-12 both directions and G-07 (no loss).
- As S09 with π = −1% for the whole horizon.
- Expected: _(founder)_ with the flags "deflation treatment open, TXI OQ6" and "real loss not carried, G-07".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S10): Real V_T/I_T = 102,622.17; nominal V_T = 99,574.19; fees: trade 456.34, custody 1,190.84; tax during 1,403.43 (25% of the reduced coupons, TXI-25); tax at exit 0.00; flag "real loss not carried, G-07".

### S11 Daily money-market fund at a bank
Exercises F-23 daily branch (A-20 proxy, MF-34), F-10 drag, F-12 zero commission at a bank (MF-26), BRK-17 no custody, F-44 exit 25% real (TXS-12), FIFO lots (TXS-06).
- Goal: 50,000 now; 1,000/month; horizon 2 years.
- Market: BoI rate 3.25% (A-20); fund fees: management 0.16% + trustee 0.02% (δ = 0.18%); π = 3%.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S11): Real V_T/I_T = 74,103.42; nominal V_T = 78,616.31; paid in 74,754.06; fees: fund (δ) 232.18, trade 0, custody 0; tax during 0; tax at exit 36.57 (25% of real gain 146.29). Subject to Q1.

### S12 Renewable money-market fund, quarterly dates
Exercises F-23 renewable branch (A-24 net of fees, MF-37), exit at the last fixed date before the horizon (MF-35).
- Goal: 100,000 now; no monthly; horizon 14 months.
- Market: expected yield 3.57% net of fund fees (MF-37 example figure, test value); π = 3%.
- Instrument: 3-month fixed dates; the exit is at month 12.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S12): Exit at month 12: nominal V = 103,427.50; real V/I_12 = 100,415.05 (V/I_14 = 99,921.57 if the 2 idle months are counted, Q4); fees 0 (inside the yield); tax at exit 142.50. Subject to Q4.

### S13 Taxable shekel money-market fund (derived)
Exercises F-20 taxable-fund case (TXS-11, TXS-12 (b)), the holder's 0% at exit.
- As S11 with the fund taxable (TXS-24 example 5137559); fund-level tax 15% of nominal interest modelled as extra δ; no tax to the holder at exit; loss not offsettable (noted).
- Expected: _(founder)_ with the label "derived, TXS-12(b)".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S13): Real V_T/I_T = 73,540.48; nominal V_T = 78,019.09; fees: fund (δ) 231.18; fund-level tax borne 616.98 (inside the price); holder tax during 0, at exit 0; label "derived, TXS-12(b)"; loss not offsettable (TXS-11). Subject to Q11.

### S14 Israeli accumulating ETF on a foreign index, bank brokerage
Exercises F-10 with fixed + variable + trustee fees (ETF-13, ETF-14), F-13 half-spread, F-12, F-14 custody, F-40 real basis on CPI (TXS-13, TXS-14 shekel fund), F-09 same-year fee deduction (TXS-06).
- Goal: 20,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6%; π = 2.5%; f = 0 (the fund is in shekels; FX inside the tracking asset is part of r_g, ETF-10).
- Fund: fixed 0.80%, variable 0.30%, trustee 0.0085% (ETF-13 IBI example), tracking difference 0, half-spread 0.05%.
- Tariff: buy/sell 0.3% min 25 NIS; custody 0.15% a quarter min 15 NIS.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S14): Real V_T/I_T = 142,870.22; nominal V_T = 161,644.54; paid in 147,853.75; fees: trade 2,053.41, spread 155.42, custody 2,767.14, fund (δ) 4,956.03; tax during 0; tax at exit 2,392.18 (real gain 9,568.74). Subject to Q1, Q2.

### S15 Israeli open tracking fund, same index, no trading costs
Exercises F-10 with the low-fee open fund (ETF-13 Yalin example: manager 0%, trustee 0.02%), order through the distributor (MF-10, MF-11), distribution-fee-free (MF-25).
- As S14 with δ = 0.02%, no spread, buy/sell per the bank's mutual-fund line (0.1% min 10 NIS), custody as S14.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S15): Real V_T/I_T = 147,761.09; nominal V_T = 167,178.12; fees: trade 791.11, spread 0.00, custody 2,846.86, fund (δ) 91.87; tax at exit 3,777.28. Subject to Q1, Q2.

### S16 TASE-registered foreign fund (קרן חוץ), FX index for tax
Exercises F-04, F-40 with X as the index (TXF-04 90% test), F-20 foreign distributions withheld by the Israeli member (TXF-05), A-11 fund-level drag (TXF-16), G-05 flag.
- Goal: 100,000 now; no monthly; horizon 5 years.
- Market: r_g 6% in shekel terms; π = 2.5%; f = +1% a year (shekel weakens).
- Fund: Irish UCITS on S&P 500, accumulating (ETF-27), fixed fee 0.07%, 90% test met; fund-level withholding drag 0.23% (A-11 computed from a 1.5% dividend yield × 15%).
- Tariff: TASE foreign-fund units traded in shekels; buy/sell 0.3% min 25; custody 0.15%/quarter.
- Expected: _(founder)_ with the dimension "tax-during: blocked (TXF OQ1, F4)" and the row "listed, not ranked".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S16): Real V_T/I_T = 106,853.98; nominal V_T = 120,895.47; fees: trade 681.78, spread 0.00, custody 3,417.80, fund (δ) 1,693.24; tax at exit 6,279.39 (25% of real gain vs the exchange rate, 25,117.56); label "secondary source: tax only at sale, not confirmed by the Tax Authority" (TXF-11); row "listed, not ranked". Subject to Q21.

### S17 US-domiciled distributing ETF at a foreign broker, with W-8BEN
Exercises F-13 FX fee on contributions and exit, F-20 foreign branch (TXF-08, TXF-12, TXF-18 credit), F-22 timing note (TXF-21, TXF-22), F-40 with X index (TXF-03), F-17 fixed fees, TXF-27 estate note.
- Goal: 100,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6% in USD; π = 2.5%; f = +1% a year; distribution yield 1.3% (A-10).
- Fund: expense ratio 0.03% (ETF-30); US withholding 25% on distributions (W-8BEN on file); Israel 25% with credit → 0 extra.
- Broker: no custody; trade USD 2.5 minimum per order (BRK-36), FX conversion 0.2% each way; no Israeli withholding; advances by 30 April ignored in timing.
- Expected: _(founder)_ with the flag "US estate tax exposure above USD 60,000 (TXF-27)".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S17): Real V_T/I_T = 244,184.11; nominal V_T = 276,271.91; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 281.95, FX 1,030.98; tax during: US 25% withheld, nothing more in Israel (foreign 3,123.76, Israeli 0.00); tax at exit 10,788.08; flag "US estate tax exposure above USD 60,000 (TXF-27)" from month 33; timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

### S18 Same ETF without a W-8BEN
Exercises the 30% branch of F-20 (TXF-13) and the lost 5%.
- As S17 with US withholding 30%.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S18): Real V_T/I_T = 243,570.25; nominal V_T = 275,577.38; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 281.54, FX 1,029.56; tax during: US 30% withheld; the extra 5% is lost (foreign 3,743.19, Israeli 0.00); tax at exit 10,772.67; flag "US estate tax exposure above USD 60,000 (TXF-27)" from month 33; timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

### S19 Irish distributing ETF at a foreign broker
Exercises F-20 with unknown Irish withholding (G-05).
- As S17 but Irish-domiciled distributing class, expense 0.07%, A-11 drag 0.23%, Irish withholding 0 with flag.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S19): Real V_T/I_T = 242,260.32; nominal V_T = 274,095.31; fees: trade 653.45, spread 0.00, custody 0.00, fund (δ) 2,802.40, FX 1,025.20; tax during: Irish withholding 0 (open, flagged); Israel 25% by advance (foreign 0.00, Israeli 3,103.69); tax at exit 10,080.97; no US estate exposure: an Irish fund is not US-situs (TXF-27); timing note: advances by 30 April ignored. Filled in: start rate 3.107 NIS/USD (BoI, 22 Oct 2026), share price USD 776.56 (iShares, 21 Oct 2026).

---

## Part B: provident-family wrappers

### S20 Kupat gemel lehashkaa, list fees
Exercises F-11 deposit fee, F-15 balance fee, A-18 direct expenses, F-27, F-44 (25% real, labelled), G-02 sensitivity line, ceiling check (F-05, KGL-03).
- Goal: 20,000 now; 2,000/month; horizon 5 years.
- Market: r_g 6%; π = 2.5%.
- Fees: deposit 0%, balance 0.8% (KGL-15 example), direct expenses 0.10%.
- Expected: _(founder)_: value with 25% real, the alternative with 15% nominal, the label "base: secondary source".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S20): Real V_T/I_T = 148,018.98 with 25% of the real gain (label "base: secondary source"); nominal V_T = 167,469.89; alternative 15% of nominal gain: real 147,690.35, nominal 167,098.08; gross balance 170,494.14; fees: balance 3,686.78, direct expenses 460.85, deposit 0; tax during 0; tax at exit 3,024.25 (alt. 3,396.06); ceiling not reached in any year; flag G-11 (NII on deemed interest). Subject to D15, Q1.

### S21 Kupat gemel lehashkaa, ceiling breached
Exercises F-05 ceiling routing (KGL-02, KGL-04).
- Goal: 90,000 now; 0/month; horizon 1 year; a second goal exists in the person's order.
- Expected: _(founder)_: 83,641 accepted, 6,359 routed to the next goal, message shown.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S21): 83,641 accepted; 6,359.00 routed to the next goal; message shown. The 83,641 figure is institution-strength only (KGL-03; D15).

### S22 Kupat gemel lehashkaa, fee discount expiring
Exercises F-16 (A-19) with a 2-year discount reverting to 1.05% (KGL-16, PF-13 conflict flagged, G-15).
- As S20 with balance fee 0.5% for 24 months then 1.05%.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S22): Real V_T/I_T = 149,026.95 (25% real), nominal 168,610.32; 15%-nominal alternative real 148,832.72; balance fees 2,317.48; tax at exit 3,404.39. The discount cannot revert inside 5 years (PF-13 covers kupat gemel lehashkaa), so the fee stays 0.5% for the whole 60 months; the scenario's 24-month reversion is not allowed by the rule (it would give real 147,601.56). Subject to D15.

### S23 Keren hishtalmut, employee, horizon past 6 years
Exercises F-33, F-46 (TXH-09, TXH-08 cap), F-52 employer line (TXH-01, KH-04), F-15 within the 2% cap (KH-22), B2.
- Profile: salary 12,000; employer 7.5%, employee 2.5% (KH-04); fund opened at month 0.
- Goal: own contribution = 2.5% × 12,000 = 300/month, constant nominal (payroll); horizon 7 years.
- Market: r_g 6%; π = 2.5%.
- Fees: balance 0.6%, direct expenses 0.11% (PF-10 example).
- Expected: _(founder)_: ranked value (own money), the "only available here" employer line (900/month), both exempt at exit.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S23): Own money (ranked): real V_T/I_T = 25,547.77; nominal V_T = 30,368.28; paid in 25,200.00; fees: balance 607.70, direct 111.41; tax 0. Employer line "only available here" (900/month): real 76,643.32, nominal 91,104.83; both exempt at exit. Subject to Q1.

### S24 Keren hishtalmut, horizon 4 years (locked, listed not ranked)
Exercises B3, F-47 when the person opts in (TXH-13, TXH-15 47% withholding, refund A-14).
- As S23 with horizon 4 years. Two runs: (a) default, listed with value at the 6-year exit date; (b) opt-in early withdrawal at month 48.
- Expected: _(founder)_ for both.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S24): (a) Listed, not ranked, "locked until month 72": value at month 72 = 17,739.10 nominal, 15,296.37 real (deposits stop at month 48, product D16). Exempt then. (b) Opt-in at month 48: balance 16,013.59, gains 1,613.59; tax at 31% (income not from personal effort, TXG-03) = 500.21 → V = 15,513.38, real 14,054.35; 47% withheld (758.39), difference refunded (A-14). Employer line (b): balance 48,040.77, tax on deposits 8,640.00 + on gains 1,500.64 (31%). NI and health on early-withdrawal gains not modelled (G-27). Subject to Q1.

### S25 Keren hishtalmut, salary above the determining-salary cap
Exercises TXH-02 cap (15,712), TXH-03 employer excess taxed at τ_m (TXG-02), G-04 flag.
- Profile: salary 20,000; employer 7.5%, employee 2.5%.
- Goal: horizon 7 years; other inputs as S23.
- Expected: _(founder)_: employer line net of tax on the excess; own deposit capped at the benefited amount, excess flagged.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S25): Own money (500/month): real V_T/I_T = 42,362.61, nominal 50,355.83; benefited 392.80/month exempt, excess 107.20/month taxed 25% of its real gain at exit (257.96, institution source). Employer line: gross 151,841.38; less tax on the excess at deposit 8,374.46 (31%) and NI and health 3,287.65 (12.17%, inference), and 25% real on the excess gains at exit 773.87: net 139,405.39 nominal (deposit-time taxes subtracted at face value, as F-52). Subject to Q1.

### S26 Self-employed keren hishtalmut
Exercises F-46 self-employed limb (TXH-05 deduction at τ_m, TXH-08 20,566 benefited), F-30 equal net outlay with a deduction.
- Profile: self-employed, business income 200,000/year; marginal rate from TXG-02.
- Goal: 20,566/year deposited in December; horizon 6 years.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S26): Deduction 9,000.00 a year worth 1,800.00 at τ_m = 20%; net outlay 18,766.00 a year for 20,566 deposited. Balance at the 72-month horizon 141,371.97 (real 121,904.61), locked until month 84 (6 years from the first payment date); value at month 84, exempt, with deposits stopped at the horizon (product D16): 148,793.78 (real 125,175.03); listed, not ranked. Filled in: r_g 6%, π 2.5%, fees as the employee study-fund example.

### S27 Pension deposit by an employee, credit cap not binding
Exercises F-30, F-31 (TXP-01, TXP-02 35% credit, floor), B2 employer line (PEN-03, PEN-04, TXP-10), F-53 insurance (A-17), F-15 selected-fund fees (PEN-23), F-49 blocked, B3 listing.
- Profile: age 30; salary 10,000; existing employee 6%, employer 6.5% + 6% severance, all in the selected fund at 0.22% balance / 1% deposits (PEN-23); A-17 insurance 1.5% of deposits (entered).
- Goal: extra own deposit 300/month net outlay; horizon 30 years (exit at 60).
- Market: r_g 5%; π = 2%.
- Expected: _(founder)_: gross deposit per month from F-30, gross balance at 60, the "exit: annuity rules, blocked (G-03)" flag, employer line value.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S27): Gross deposit D_m = 300 × I_m + 27.65 (credit 331.80 a year; the 7% cap binds — the scenario title says it does not, see Q18); month-1 gross deposit 328.15. Gross balance at 60 (month 360): 314,795.14 nominal, 173,789.23 real; fees: deposit 1,575.76, insurance 2,363.65, balance 7,626.14. Flag "exit: annuity rules, blocked (G-03)"; listed, not ranked. Employer line (1,250/month, same fees and insurance): 957,985.61 nominal, 528,875.97 real (972,723.85 if insurance is not charged on employer money, Q18). Subject to Q1, Q18.

### S28 Pension deposit, credit cap binding
Exercises F-31 cap (7% of 116,400 = 8,148/year) and the existing-deposit interaction.
- Profile: salary 15,000; existing employee 6% (10,800/year already credited).
- Goal: extra 1,000/month net outlay; horizon 10 years.
- Expected: _(founder)_: only the part within the cap earns the credit.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S28): No part of the extra deposit earns the credit (existing 10,800 > cap 8,148; the text "10,800/year already credited" should read 8,148); gross = net = 1,000 × I_m. Gross balance at the 10-year horizon: 164,004.04 nominal, 134,540.44 real; fees: deposit 1,328.16, insurance 1,992.24, balance 1,632.98; flag "exit: annuity rules, blocked"; listed, locked until 60. Employer line (1,875/month): 279,975.19 nominal, 229,677.17 real. Filled in: age 30, r_g 5%, π 2%, fees, insurance and employer rates as the 300 NIS pension example.

### S29 Beneficiary member, self-employed
Exercises F-32 (TXP-03 16% test, TXP-04 credit, TXP-06 deduction tiers), G-13 flag.
- Profile: self-employed, income 240,000/year, no employer deposits; deposits 40,000/year.
- Goal: horizon 20 years.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S29): Deposit side: deduction 20,952.00 (first tier 12,804.00, second tier 8,148.00) worth 5,510.40; credit 35% × 11,640.00 = 4,074.00; total relief 9,584.40 a year, so 40,000 deposited costs 30,415.60 net. Gross balance at 20 years: 1,290,845.92 nominal, 868,702.30 real; flag "exit: annuity rules, blocked"; 0.5% credit and age-50 enlargement blocked (G-13). Filled in: r_g 5%, π 2%, fees and insurance as the 300 NIS pension example.

### S30 Provident fund for annuity vs pension, same money
Exercises PEN-22 vs PEN-21 caps, F-53 zero insurance (PEN-35), F-49 blocked for both.
- As S27, run in `provident-for-annuity` with fees 0.5% balance, 0% deposits, no insurance.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S30): Gross deposit as S27 (300 × I_m + 27.65). Gross balance at 60: 307,835.20 nominal, 169,946.85 real; balance fees 17,195.57; no deposit fee, no insurance. Employer line: 933,375.45 nominal, 515,289.41 real. Exit blocked (G-03), listed. Subject to Q1, Q18.

### S31 Child savings, provident route, doubled
Exercises F-54 (CS-03, CS-04, CS-13 cohort, CS-18 fees), F-50 blocked.
- Child born 2026-01-01; doubling on from birth; increased-risk track r_g 6%; π = 2%; horizon to age 21.
- Expected: _(founder)_: gross balance at 18 and 21, grants, fees from 21, the flag "exit tax blocked (G-17)".
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S31): Gross balance at 18 = 52,470.43 (boy) / 52,490.19 (girl), real 36,737.67 / 36,751.50; at 21 = 63,375.24 / 63,398.77, real 41,813.45 / 41,828.98. Tax if withdrawn at 21: 6,009.76 / 6,015.64 (25% of the real gain, label "secondary source", TXK-23); at 18: 4,058.57 / 4,063.51. Grants: 308.81 at 3, 376.44 at 13 (boy) or 369.06 at 12 (girl), 882.12 at 21. Fees 0 until 21, then up to 1.05% of the balance (CS-18; see S54). Subject to Q10 (sex).

### S32 Child savings, bank route
Exercises CS-10 tracks, F-21 as a savings plan (derived label), CS-23 stale data flag.
- As S31 at a bank: fixed unlinked 3% to 18, entered (A-26); no exit stations.
- Expected: _(founder)_ with "derived" and "rates data stale" flags.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S32): At 18 (boy): 39,701.73 nominal, 27,797.54 real; interest 9,210.54; tax if withdrawn 1,381.58. At 21: 44,265.27 nominal, 29,205.15 real; interest 12,891.96; tax if withdrawn 1,933.79 (15% of the nominal gain, label "secondary source"); net 42,331.47. Flag "rates data stale". Filled in: 3% after 18.

### S33 IRA hishtalmut with brokerage inside
Exercises F-51, two fee layers (PF-06 manager fee + IRA-21 bank tariff), F-46.
- Profile: existing hishtalmut balance 250,000 moved to an IRA at month 0 (clock already past 6 years).
- Goal: no contributions; horizon 5 years; holding an Israeli ETF as S14.
- Fees: manager 0.3% balance; bank annex buy/sell 0.1% min 15, custody 0.05%/quarter.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S33): Real V_T/I_T = 272,096.32; nominal V_T = 307,852.01; fees: trade 557.91, spread 278.97, custody 2,795.48, fund (δ) 15,380.19, IRA manager 4,178.85; tax 0 (exempt). Subject to Q19, Q21.

---

## Part C: exit-year tax features

### S34 Exit at age 60 with low other income
Exercises F-42 (TXG-04, TXG-08, TXI-19, TXS-23), A-13, A-14.
- Profile: age 55 at start; other income in exit year 60,000.
- Goal: 300,000 now in an Israeli ETF as S14 (no monthly); horizon 5 years.
- Market: r_g 6%; π = 2.5%.
- Expected: _(founder)_: tax at the brackets on the real gain, capped at 25%, and the refund amount versus the 25% withheld.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S34): Real gain 36,635.17; tax at the brackets 4,164.12 (capped at 25% slice by slice, method F-42); 25% withheld 9,158.79; refund 4,994.67; V_T after refund 361,941.76, real 319,903.77; fees: trade 1,998.93, spread 333.17, custody 10,026.38, fund (δ) 18,378.58. Subject to Q2 (exit year = year 5, age 60 reached in it).

### S35 Exit at 60 holding an unlinked bond (fixed 15% unchanged)
Exercises F-42 fixed-rate branch (TXG-08 (c)).
- As S34 in the S08 bond.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S35): Real V_T/I_T = 302,752.55; nominal V_T = 342,536.72; fees: trade 1,383.98, custody 6,358.59; tax during 8,872.82 (15% fixed on coupons, unchanged at 60); tax at exit 0 (gain -1,333.69). Subject to D4, D12, Q2.

### S36 Surtax year
Exercises F-43 (TXG-09, TXG-10).
- Profile: salary 50,000/month (600,000/year).
- Goal: 2,000,000 now in an Israeli ETF as S14; horizon 3 years.
- Market: r_g 8%; π = 2%.
- Expected: _(founder)_: 3% on the slice above 721,560 and 2% on the capital-source slice.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S36): Real gain 292,128.70; capital-gains tax 73,032.17; surtax 3% 5,117.06 on 170,568.70 above 721,560; 2% capital-source surtax 0.00 (capital income below the threshold); V_T 2,299,136.04, real 2,166,527.24; fees: trade 13,135.37, spread 2,189.33, custody 39,656.72, fund (δ) 72,465.71.

### S37 Negative real gain
Exercises F-40 `max(0, real)`, G-07.
- Goal: 100,000 now in the S11 money-market fund; horizon 2 years.
- Market: BoI rate 1%; δ 0.18%; π = 3%.
- Expected: _(founder)_: tax 0, nominal gain positive, real gain negative, flag.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S37): Real V_T/I_T = 95,808.94; nominal V_T = 101,643.70; nominal gain 1,643.70 (positive); real gain -4,446.30 (negative); tax 0; fees: fund 362.83; flag "real loss not carried, G-07" (TXG OQ13).

### S38 Brokerage switch versus provident track switch
Exercises F-66 (TXS-21 vs TXK-04).
- Two runs, each 100,000 now, horizon 6 years, r_g 6%, π 2.5%: (a) brokerage, switch funds at month 36 (same fees as S14); (b) kupat gemel lehashkaa, track switch at month 36 (fees as S20).
- Expected: _(founder)_: cost of switching in each.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S38): (a) Brokerage: real V_T without switch 106,368.36, with switch 105,721.95; cost of switching 646.40 real (tax paid at the switch 1,649.27). (b) Kupat gemel lehashkaa: cost of switching 0 (TXK-04); note the ceiling accepts only 83,641 of the 100,000 now (Q23); with 83,641 the real value (25% real) is 93,606.46 either way.

---

## Part D: capability outputs

### S39 Wrapper mode: the founder's ETF-vs-provident case
Exercises F-80 ranking and ties (P-01), F-81 sensitivity (P-02), B1 to B3, dimension marks.
- Profile: age 22; salary 12,000; pension and hishtalmut through work exist.
- Goal: long-term wealth preset: 30,000 now; 2,000/month; horizon 20 years; nothing must stay available.
- Market: r_g 6% entered; π 2.5% entered.
- Wrappers: brokerage with S14's ETF; kupat gemel lehashkaa as S20; hishtalmut own-money as S23 (clock from month 0; exit after 6 years is lawful); pension extra deposit as S27 (listed, not ranked: locked and G-03).
- Expected: _(founder)_: ranking, the deciding formula per F-80, tie status, the sensitivity flips for r_g, π and the balance fee within the bounds the founder sets in P-02.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S39): Computed: brokerage (S14 ETF) real V_T/I_T = 572,640.51, nominal 938,338.16; kupat gemel lehashkaa (S20 fees) real 630,640.90 with 25% real (label "secondary source"), 629,850.66 with 15% nominal. Pension: listed, not ranked (locked, G-03; no credit on new money since 6% × 144,000 > 8,148). Ranking: 1. kupat gemel lehashkaa, 2. brokerage; gap 9.20% → not a tie (θ = 0.5%). Deciding formula: fee drag (the brokerage pays 113,833.04 in fees against 55,832.65, real; tax at exit 31,048.97 against 40,213.63). Hishtalmut: listed, not ranked (employee, product D15). Sensitivity (P-02 bounds): no change flips the result within the bounds.

### S40 Wrapper mode: the founder's apartment case
Exercises eligibility filters (section 8, D13 constraints), B3, and the coverage line (F-83, product D17).
- Goal: purchase at a known date: 150,000 now; 4,000/month; horizon 4 years; 50,000 must stay available at once.
- Wrappers: all tier-1, and the tier-2 list for the coverage line (D17); expected eligible: current account (for the 50,000, and ranked for the rest), deposits, money-market funds, makam, bonds, brokerage, kupat gemel lehashkaa; hishtalmut listed not ranked (clock 4 years); pension listed not ranked. Every tier-1 wrapper and tier-2 instrument is accounted for once (F-83).
- Market: cash-like sourced in production (test values: deposit 3.5%, BoI 3.25%, makam 3.9%); r_g for the ETF 5% entered; π 2.5%.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S40): Ranked (real at 4 years, same money in each): 1. makam ladder at 3.9% 296,362.17; 2. bank deposits, one-month ladder at 3.5% 296,034.36; 3. daily money-market fund (BoI 3.25%, δ 0.18%) 295,594.33; 4. ETF in a bank brokerage account (r_g 5%) 293,119.64; 5. fixed-rate government bond, 3.75% coupon 291,761.83; 6. current account at 0.5% 276,722.74. Top two: gap 0.11% → tie (θ = 0.5%). The 50,000 kept available in the current account grows to 50,855.14 (46,072.25 real). Kupat gemel lehashkaa: listed, not ranked (the 83,641 ceiling takes only part of year 1; 65,006.55 routed to the next goal). Study fund and pension: listed, not ranked (locked). Coverage line (F-83): considered 26; ranked 6; listed, not ranked 7; not eligible 2; excluded by the person's constraint 0; not evaluated 11; not ranked, with reasons: savings plan (not evaluated: no savings-plan terms among the inputs (production: data/terms/deposits/, R4)); renewable money-market fund (not evaluated: monthly deposits into fixed-date series are not set (G-30)); kupat gemel lehashkaa (listed, not ranked: the yearly ceiling takes only part of the money (KGL-02, KGL-04; F-05)); keren hishtalmut (listed, not ranked: employee (product D15); locked 6 years (TXH-09)); comprehensive pension fund (listed, not ranked: locked to 60 (PEN-26)); general pension fund (listed, not ranked: locked to 60 (PEN-26)); provident fund for annuity (listed, not ranked: exit as pension, locked to 60 (PEN-34, PEN-26)); IRA in a study fund (listed, not ranked: as the study fund it is held in (IRA-25)); IRA in a provident fund (listed, not ranked: as the provident fund it is held in (IRA-25)); child savings, provident route (not eligible: takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16)); child savings, bank route (not eligible: takes the NII amounts and the parent's matching deposit only, not this money (method section 8; CS-02, CS-04, CS-16)); savings policies (not evaluated: tier 2, open questions (G-24)); executive insurance (not evaluated: tier 2, open questions (G-24)); structured deposits (not evaluated: tier 2, open questions (G-24)); corporate bonds (not evaluated: tier 2, open questions (G-24)); managed and robo portfolios (not evaluated: tier 2, open questions (G-24)); foreign-currency deposits (not evaluated: tier 2, open questions (G-24)); REITs (not evaluated: tier 2, open questions (G-24)); gold via funds (not evaluated: tier 2, open questions (G-24)); Amendment 190 deposits (not evaluated: tier 2, open questions (G-24)). Fund variants, tracks and providers inside each wrapper: compared in the workbench (3.4). Filled in: every wrapper's terms from the earlier examples.
  - Note, 2026-10-23 (engine and method): the independent check priced accrued interest on the bond (291,761.83) while the method does not model it (G-10, TXI OQ5), and that moves the bond's value by about 1.1%. The method therefore treats the bond as a B3 case: listed, not ranked, with reason G-10 and the run's value shown (295,024.12 real), and the ETF ranks fourth. The engine's coverage line reads: considered 26; ranked 5; listed, not ranked 8; not eligible 2; excluded 0; not evaluated 11. The independent-check numbers above are unchanged. The engine's test fills the pension wrappers' terms (the fees and A-17 of S27, salary 12,000): without terms a pension run is "not evaluated: missing input" (F-83 order 3 before 4), so it would not be listed as locked.

### S41 Idle-cash preset
Exercises F-60 with the three labels (A-21 "average paid at this bank", A-26 "entered by you", A-20). Also the coverage line (F-83, G-28).
- Inputs: balance 80,000; must stay available 20,000; bank average one-month deposit 3.2%; own offer 3.6%; BoI 3.25%; daily fund δ 0.18%; makam 3.9%; current-account interest 0.5%.
- Expected: _(founder)_: monthly cost of leaving 60,000 where it is, per alternative.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S41): Monthly cost of leaving 60,000 in the current account: one-month deposit, bank average 3.2% ("average paid at this bank last month") 113.12; one-month deposit, own offer 3.6% ("entered by you") 129.69; makam 3.9% (no commission given) 142.07; daily money-market fund (BoI 3.25%, δ 0.18%), one-year hold 129.13. BoI rate labelled as the source of the fund's return (proxy). Coverage line (F-83): considered 26; baseline 1; compared 3; not eligible 2; not evaluated 20; child savings (both routes) not eligible; savings plan, renewable money-market fund, government bond, brokerage account and the provident wrappers not evaluated (G-28); tier 2 not evaluated (G-24). Filled in: π 3% for the fund row.

### S42 Fee materiality on the founder's hishtalmut
Exercises F-61, F-62 (P-03), regulator reference (KH-23 averages), caps (KH-22).
- Holding: balance 120,000; own 300/month; employer 900/month; balance fee 0.74%; direct expenses 0.11%; horizon 10 years; r_g 6%; π 2.5%.
- Reduction tested: fee to 0.34%.
- Expected: _(founder)_: cost of each fee line, interaction remainder, value of the reduction, verdict under the founder's thresholds.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S42): Real V_T/I_T with fees 300,266.26; total fee drag 20,664.79; cost of balance fee 0.74% = 17,901.59; cost of direct expenses 0.11% = 2,587.05; interaction remainder 176.15; value of cutting the balance fee to 0.34% = 9,530.01 (all real NIS over 10 years). Verdicts (P-03): balance fee "worth negotiating" (reference 0.34%, KH-23); direct expenses "not worth the effort" (no reference collected). Subject to Q20.
  - Note, 2026-10-24 (engine): the test in `packages/engine/test/golden/r3.test.ts` runs the scenario's balance and deposits through the run inputs (`existingBalance: 120_000`; `goal.monthly: 1_200`, of which `hishtalmut.employerMonthly: 900` is the employer's line, leaving the 300 own), so the deposits are inputs of the case and no rule figure is lifted for them; the ceilings and the reference come from the rule records and the thresholds from the P-03 record passed in.

### S43 Fee materiality on a brokerage plan
Exercises F-61 across trade, custody, spread, fund fees and FX.
- Holding as S17 but at a bank: buy/sell 0.3% min 25, custody 0.15%/quarter, FX 0.25% each way, fund 0.03%, half-spread 0.02%.
- Expected: _(founder)_: ranked fee costs over 5 years.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S43): Ranked real fee costs over 5 years: custody 5,032.56; trade 3,068.41; fx 1,213.40; fund 207.68; spread 75.28; interaction remainder 106.09; total drag 9,703.42; real V_T with all fees 236,360.08. Subject to Q15.

### S44 Provider workbench, 1 trade vs 10 trades a month
Exercises F-63, A-28, D4 three levels, "not comparable" row, F-80 ties.
- Goal: 10,000 now; 2,000/month; horizon 5 years; Israeli ETF as S14.
- Providers: bank A (list 0.3% min 25; regulator average 0.21% band 100k–200k; custody 0.15%/q min 15); bank B (list 0.25% min 30; average 0.19%; custody 0.12%/q min 20); broker C (list 0.08% min 8; TASE average 0.07%; monthly fee 15 NIS; custody 0); broker D tariff missing.
- Two runs: 1 order per month; 10 orders per month of 200 each.
- Expected: _(founder)_: year-1 cost, horizon cost, deciding fee type, ties, the missing row.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S44): Horizon cost = real V_T(no provider fees) − real V_T(provider), cheapest first. 1 order(s)/month — list level: C 1,422.01 (year 1: 272.38), B 3,803.34 (year 1: 579.41), A 3,990.32 (year 1: 558.28); deciding fee type between C and B: custody (gap 2,381.34 by type: trade commission +1,527.95, custody +1,659.04, monthly account fee -830.90); gap 1.76% → not a tie (θ = 0.5%); average level: C 1,023.22 (year 1: 187.19), B 2,199.41 (year 1: 227.65), A 2,667.90 (year 1: 264.44); deciding fee type between C and B: custody (gap 1,176.19 by type: trade commission +322.80, custody +1,678.27, monthly account fee -830.99); gap 0.87% → not a tie (θ = 0.5%) | 10 order(s)/month — list level: C 5,666.73 (year 1: 1,154.33), A 17,032.17 (year 1: 3,300.51), B 19,508.61 (year 1: 3,874.36); deciding fee type between C and A: trade commission (gap 11,365.43 by type: trade commission +10,095.70, custody +1,878.62, monthly account fee -830.90); gap 8.70% → not a tie (θ = 0.5%); average level: C 1,023.22 (year 1: 187.19), B 2,199.41 (year 1: 227.65), A 2,667.90 (year 1: 264.44); deciding fee type between C and B: custody (gap 1,176.19 by type: trade commission +322.80, custody +1,678.27, monthly account fee -830.99); gap 0.87% → not a tie (θ = 0.5%). Broker D: "not comparable, data missing". Subject to Q16.
  - Note, 2026-10-24 (engine and site): the scenario's four providers are fixtures with one line per fee base at each level, so the engine ranks them. On the site's own snapshots two providers (One Zero, Psagot) carry more than one line for the same base at the same level and channel; the engine refuses to choose between them and throws `RecordInputError` by design (`providers/workbench.ts`), and the workbench page lists each of the two as not comparable with the reason "ambiguous lines" and the competing lines named, beside the "data missing" row this scenario tests. Resolved later on 2026-10-24: `buildTariff` prefers the standard (unbanded) line over a plan line unless a plan is asked for by `band`, and Psagot's bonds line now applies to bonds only (`tase_bonds`), so both providers rank; the engine still throws for a genuine ambiguity (method F-63).

### S45 Provider with "entered by you" fee
Exercises D4 entered level in F-63.
- As S44 bank A with an entered buy/sell fee of 0.1% min 10.
- Expected: _(founder)_
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S45): Bank A with entered 0.1% min 10: horizon real cost 2,828.84 (1 order/month), 8,056.19 (10 orders/month); year-1 liquidation-value cost 284.65 / 1,383.75; label "entered by you". Subject to Q16.

### S46 Holdings review: parental kupot gemel
Exercises F-70 (P-04), F-72 (PF-17, PF-18), hand-off to F-61.
- Holdings: two provident funds for annuity at different managers, balances 80,000 and 40,000, fees 0.9%/0% and 0.6%/0%, classifications "כללי" and "מניות"; a child-savings plan; horizon 15 years; loss filter 30%.
- Expected: _(founder)_: fit marks, consolidation answer with rule IDs, the fee figures, the child-savings default check flagged (CS OQ10).
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S46): Consolidation: allowed (annuity fund to annuity fund, PF-17); barred only if a loan, attachment or started annuity applies. Fee cost over 15 years (real): 0.9% on 80,000 = 16,723.25; 0.6% on 40,000 = 5,698.23; moving the 80,000 into the 0.6% fund is worth 5,326.80. Fit marks (P-04 table): "כללי" fits, "מניות" fits. Child-savings default check blocked (CS OQ10). Filled in: r_g 6%, π 2.5%.

### S47 Illustrative timeline for guide pages
Exercises F-67 with P-05.
- P-05 test values: 10,000 now; 500/month; 10 years; r_g 5%; π 2%; each tier-1 wrapper with its list fees from S01, S11, S14, S20, S23, S27.
- Expected: _(founder)_: the series per wrapper.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S47): Real value at year 10 after exit tax: deposit 74,044.07, daily MMF 73,339.31, ETF 70,220.43, kupat gemel lehashkaa 76,594.44; pension gross 83,402.21 (exit blocked); yearly series in workings.md. Study fund not shown (product D15). Filled in: pension terms from the 300 NIS pension example.

### S48 Revisit after a rule change
Exercises F-82 and the change log.
- Save S39, then change `data/rules/TXS-09` rate to 30 (test only) and re-run.
- Expected: _(founder)_: the changed entry is reported, the brokerage value changes, ranking status reported.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S48): Changed entry: TXS-09 rate 25% → 30%. Brokerage real V_T/I_T falls from 572,640.51 to 566,430.72 (nominal 938,338.16 → 928,162.69). Ranking unchanged: the kupat gemel lehashkaa stays first (gap 10.18% → not a tie (θ = 0.5%)).

### S49 Exposure mode with entered returns and the loss filter
Exercises F-71, D9 labels.
- Goal: as S39. Exposures: cash (sourced 3.25%), bonds entered 3%, equity entered 6%; worst fall entered 10% / 40%; largest fall accepted 30%.
- Expected: _(founder)_: equity excluded by the filter, cash and bonds ranked, every entered return labelled.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S49): Equity excluded by the filter (40% > 30%). Ranked: 1. cash 534,012.31, 2. bonds 495,867.60 (real); gap 7.14% → not a tie (θ = 0.5%). Bonds' 3% labelled "entered by you"; cash labelled with the BoI rate (sourced). Filled in: holding wrappers and fees from the money-market and open tracking fund examples.
  - Note, 2026-10-24 (engine and site): the engine's test (`r5.test.ts`) reproduces the counts, ranked 2 and excluded 1. On the site's data the bond exposure is the CPI-linked government bond run through the government-bond product (P-08, series GOV-11), and that run is listed, not ranked, for the same reason as in S39's note above (G-10, accrued interest not modelled); so on the site "cash and bonds ranked" holds for cash only, and the bond row shows its value with the reason. The cash rate on the site is Leumi's published deposit rate (institution strength), not a Bank of Israel figure (D20).

### S50 Tie
Exercises F-80 tie with P-01.
- Two brokerage providers whose horizon costs differ by less than the founder's θ.
- Expected: _(founder)_: declared tie.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S50): Bank A2 132,426.40 vs bank A 132,353.91 (real, after fees and tax): gap 0.05% → tie (θ = 0.5%) → declared tie. Filled in: both providers constructed from the broker-comparison example.

---

## Part E: follow-ups (2026-10-26)

Added 2026-10-26 with the follow-ups brief (`research/specs/2026-10-26-followups/brief.md`): the falling index (TXS-02, TXF-03), the relief from 60 on a kupat gemel lehashkaa lump sum (TXK-06), the child-savings fee after 21 at the legal cap (CS-18), and money-market custody at a non-bank member (F-14). The independent check computes them in `expected_calc.py` like the rest.

### S51 Kupat gemel lehashkaa, lump sum at 60 with low other income
Exercises F-44 with F-42 (TXK-06, TXG-04, TXG-07; the withholding and its settlement, TXK-26), A-13, A-14.
- Profile: age 55 at start; other income in the exit year 60,000.
- Goal: 80,000 now (within the yearly ceiling); no monthly; horizon 5 years.
- Market: r_g 6%; π = 2.5%. Fees as S20: balance 0.8%, direct expenses 0.1%, no deposit fee.
- Expected: _(founder)_: tax at the brackets on the real gain, each slice capped at 25%, against the full 25%.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S51): Gross balance 102,345.49; real gain 11,832.84; tax at the brackets 1,183.28 (method F-44 with F-42); at the full 25% it would be 2,958.21, so the relief is 1,774.93; V_T 101,162.21, real 89,412.65; fees: balance 3,638.76, direct expenses 454.85; flag TXK-26 (the manager withholds 20%; the final tax is settled in the return).

### S52 TASE foreign fund when the shekel strengthens
Exercises F-09 and F-40 with a falling index (TXS-02, TXF-04: a TASE foreign fund takes the exchange rate under TXF-04, not TXF-03), G-07.
- As S16 with f = −3% for the whole horizon; (a) r_g 6%, (b) r_g −1% (a nominal loss smaller than the currency's fall).
- Expected: _(founder)_: (a) the real gain no larger than the nominal gain; (b) no tax and no allowable loss beyond the exit-year custody.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S52): (a) r_g 6%: nominal gain 30,805.42; real gain 30,052.89 (the inflationary amount is 0, not negative; without the rule it would be 43,720.67); tax at exit 7,513.22; V_T 119,661.64, real 105,763.45. (b) r_g −1%: real gain -548.57 (the nominal loss is smaller than the fall, so none of it is allowable; without the rule 7,006.23); tax at exit 0.00; V_T 90,367.21, real 79,871.45; flag "real loss not carried, G-07".

### S53 Israeli ETF and kupat gemel lehashkaa under CPI deflation
Exercises F-09 and F-40 (TXS-02), F-44 (TXK-05, TXK-07) with π < 0.
- (a) As S14 with π = −1%. (b) As S20 with π = −1%.
- Expected: _(founder)_: in both, the taxable gain equals the nominal gain (less the exit-year custody in (a)); (b) labelled a reading.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S53): (a) ETF: nominal gain 19,717.36; real gain 18,862.65 (inflationary amount 0); tax at exit 4,715.66; V_T 147,697.08, real 155,308.75. (b) Kupat gemel lehashkaa: real gain 21,663.90, equal to the nominal gain; tax at exit 5,415.98; V_T 153,233.70, real 161,130.71; label "reading" on TXK-07.

### S54 Child savings, provident route, withdrawn at 25
Exercises F-54 after 21 (CS-18, CS-30), F-50.
- As S31 (boy) with the withdrawal at 25 (month 300); (a) the fee after 21 at the legal cap, labelled "עד"; (b) a rate the person enters, 0.23%.
- Expected: _(founder)_: fees after 21, tax if withdrawn and the net value in each case.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S54): (a) At the legal cap (1.05% of the balance after 21, labelled "עד"): balance at 25 76,717.55; fees after 21 2,941.45; tax if withdrawn 8,534.69 (25% of the real gain 34,138.78); net 68,182.86, real 41,559.56; flag "fee after 21 at the cap". (b) With an entered 0.23%: balance 79,277.00; fees after 21 655.12; tax 9,174.56; net 70,102.44, real 42,729.60.

### S55 Daily money-market fund at a non-bank member
Exercises F-14 at a non-bank member (BRK-17, MF-26), F-23, F-09.
- As S11 at a TASE member that is not a bank, whose tariff charges custody of 0.1% a quarter with no minimum on money-market units.
- Expected: _(founder)_: the custody paid and its effect on the value.
  - Independent check, 2026-10-22 (steps in [workings.md](workings.md), section S55): Real V_T/I_T = 73,630.68; nominal V_T = 78,114.79; fees: fund (δ) 231.41, trade 0, custody 525.11; tax at exit 0.00 (25% of real gain -145.27).

---

## Coverage matrix

| Formula | Scenarios |
|---|---|
| F-01 to F-09 | all |
| F-10 | S11, S13, S14, S15, S16, S17 |
| F-11 | S20, S27 |
| F-12 | S06, S07, S08, S14, S15, S16, S17, S33, S44 |
| F-13 | S14, S16, S17, S43 |
| F-14 | S08, S14, S33, S44, S55 |
| F-15 | S20, S22, S23, S27, S33, S42 |
| F-16 | S22 |
| F-17 | S17, S44 |
| F-20 | S13, S16, S17, S18, S19 |
| F-21 | S01, S02, S03, S04, S32 |
| F-22 | S32 |
| F-23 | S11, S12, S41, S55 |
| F-24 | S06, S07, S41 |
| F-25 | S08, S09, S10, S35 |
| F-26 | S05, S41 |
| F-27 | S20, S23, S27, S33 |
| F-28 | all (zero), flag in S20 |
| F-30 to F-32 | S26, S27, S28, S29 |
| F-33 | S20, S23 |
| F-40 | S14 to S19, S34, S36, S37, S52, S53 |
| F-41 | S01 to S05 |
| F-42 | S34, S35, S51 |
| F-43 | S36 |
| F-44 | S11, S20, S37, S51, S53 |
| F-45 | guide text only (blocked) |
| F-46 | S23, S25, S26, S33 |
| F-47 | S24 |
| F-48, F-49 | S27, S30 (blocked, listed) |
| F-50 | S31, S32, S54 |
| F-51 | S33 |
| F-52 | S23, S25, S27 |
| F-53 | S27, S30 |
| F-54 | S31, S54 |
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
| F-83 | S40 (wrapper mode), S41 (idle-cash preset); the fund-variant candidate set (F-65, G-29) needs a fund-list fixture and is added with R4 |
| Eligibility and ceilings (section 8) | S21, S24, S40 |
| Gaps G-01 to G-30 | flags appear in S06, S10, S16, S19, S20, S24, S25, S27, S31, S32, S37, S46; G-24 and G-30 in S40's coverage line; G-24 and G-28 in S41's |

Formulas with no scenario: none, except F-83's fund-variant candidate set, which waits for a fund-list fixture (R4). Formulas that cannot produce a number (F-45, F-48, F-49, F-50) are covered by scenarios that check the blocked output.
