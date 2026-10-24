# Site parameters: the founder's rationale

Each site parameter (`docs/method.md` §2.3, stored in `data/parameters/`) is a judgement, not a rule. This file records why each value was chosen, so the page can show it under "site parameter".

## Tie threshold

P-01, `data/parameters/tie-threshold.json`. Set by the founder on 2026-10-22.

**Value:** 0.5%. Two options are a tie when `|V_i − V_j| / max(V_i, V_j) < 0.5%`, where V is the real value at the horizon (method F-80).

**Why:** a difference under 0.5% of the final amount is not worth acting on. This is the same line the founder set the same day for what is worth modelling at all. Example from the golden scenarios: in the broker comparison (S44, regulator-average fees), broker C ends about 0.8% ahead of bank B, which is a clear win at 0.5% and would be a tie at 1%.

## Chosen by Claude at the founder's request

On 2026-10-23 the founder asked Claude to choose the remaining values ("do whatever you think fits"). They are signed off as his, dated 2026-10-23, and each file in `data/parameters/` records who chose it in `chosen_by`. Any of them can be changed at any time.

## Illustrative scenario

P-05, `data/parameters/illustrative-scenario.json`, with the slider ranges (design-system Q6).

**Values:** 10,000 NIS today; 500 NIS a month; 10 years; 5% a year for market products (funds, ETFs, provident, hishtalmut, pension); 3.5% a year for cash-like products (deposit, money-market fund, makam, government bond, current account); inflation 2% a year. Monthly-deposit slider 0 to 10,000 NIS in steps of 100; years slider 1 to 40 in steps of 1.

**Why:** round starting values for someone beginning to save, not a forecast. They match the test scenario for guide pages (S47), so every guide graph is checked. The cash-like rate stands in for the Bank of Israel series that arrive in release 2 (method A-20 to A-25), and the page shows it as a site parameter. The sliders cover what most people would try; a larger value can be typed.

**Representative instrument (`instruments`):** for each wrapper, the data records the illustrative run takes its terms from (deposit terms, fund, fees provider, government-bond series rule); wrappers whose records are not collected yet have no entry and their guide page shows no timeline.

**Why:** chosen by Claude at the founder's request, 2026-10-23: the representative instrument is the first collected record of each kind; revisable. The page names the records it used, and every term shown carries that record's source.

**Study fund run:** the `keren-hishtalmut` entry sets `employment` to `self-employed`, because an employee's run needs a salary, which comes from the person's entered profile and not from a site parameter; the self-employed run needs none (A-12, TXH-08).

**Income (`annual_income`):** 144,000 NIS a year, the income of the founder's own case (12,000 a month), read only by runs that need an income (the self-employed study-fund deduction, TXH-05); the person's entered income replaces it. **Why:** chosen by Claude at the founder's request, 2026-10-23, the founder's own case; revisable.

## Sensitivity bounds

P-02, `data/parameters/sensitivity-bounds.json`.

**Values:**
- yearly return 0% to 10%;
- inflation 0% to 5%;
- shekel against a foreign currency −3% to +3% a year;
- cost inside a fund 0% to 3% a year;
- each fee rate from half to double, one at a time;
- horizon 2 years shorter or longer.

**Why:** wide enough to show whether the answer depends on a guess, the return guess above all.

## Fee verdict thresholds

P-03, `data/parameters/fee-verdict-thresholds.json`.

**Values:** "worth negotiating" from 1,000 NIS of real cost over the horizon, when a cheaper reference exists; "worth avoiding" from 2,500 NIS, when another option removes the fee; share threshold 10% of total fee drag (method F-62 does not use it yet).

**Why:** below about 1,000 NIS over several years, a phone call is not worth the time.

**Pension and annuity tracks (`instruments`, added 2026-10-23, second release 2 pass):** no managing company publishes a list fee for a general pension fund or a provident fund for annuity, so, as for the study fund, the comparison uses the regulator's average on a named track (method 2.4). `pension-general` names track **2158**, "מיטב פנסיה כללית לבני 50 ומטה" (Meitav, classification "קרנות כלליות", the age-banded default track for someone under 50, which fits the founder's 22): the CMA reports the pension fees per fund and not per track (CAT-39), so every Meitav general-pension track shows the same 0.14% balance and 1.07% deposit average for 2025, and the choice moves no number. `provident-for-annuity` names track **923**, "מיטב בטחון" (Meitav, classification "תגמולים ואישית לפיצויים", specialization and sub-specialization "כללי"; the other "כללי" track in that classification, 1486, is a personally managed product with a different fee). The regulator has no separate classification for a provident fund for annuity, so this classification is the nearest the data offers; the comprehensive pension fund keeps Meitav's list fee lines. **Why:** the first collected Meitav track of each kind, chosen by Claude at the founder's request, revisable; the page names the track and every fee carries the CMA record's source and year. The insurance cost (A-17) is not a site parameter: the person enters it, and a pension fund without it is "not evaluated".

## Classification fit

P-04, `data/parameters/classification-fit.json`.

**Values:**
- an equity track ("מניות") fits a horizon of 10 years or more, if the person accepts a fall of at least 30%;
- a general track ("כללי") fits 5 years or more and a fall of at least 20%;
- every other classification shows "no rule".

**Why:** the other regulator classifications put very different mixes under one name (for example index trackers of shares and of bonds), so a mark at that level would mislead. A finer table needs the sub-classification and comes with the fit mark in release 2.

## Golden tolerance

P-06, `data/parameters/golden-tolerance.json`.

**Values:** 1 NIS or 0.01%, whichever is larger.

**Why:** the engine and the independent check use the same conventions, so they should agree to the shekel.

## Goal presets

Added 2026-10-23 for release 2 (P-07, `data/parameters/goal-presets.json`), chosen by Claude at the founder's request; revisable. A preset fills starting values into the goal form (product D13) and never an amount: liquid reserve one year with the whole amount kept available at once and withdrawable at any time (the idle-cash entry point); purchase at a known date four years (the founder's apartment case, S40); long-term wealth twenty years (the founder's ETF-vs-provident case, S39); lump sum ten years with no monthly deposit (the illustrative scenario); a child eighteen years (the child-savings withdrawal age, CS-14), to be shortened by the child's age. The horizon slider runs from one to forty years in whole years.

## Exposure holding wrapper

Added 2026-10-24 for release 5 (P-08, `data/parameters/exposure-holding-wrapper.json`), chosen by Claude at the founder's request; revisable. Exposure mode runs each exposure through one wrapper (method F-71: the caller names it; the engine never picks one), so the site needs a default per exposure record. **Values:** shekel cash in a bank deposit (at the published rate of the P-05 deposit-terms record, Leumi's 365-day deposit; D20); makam in the makam product (no sourced yield exists, so the person enters one); the CPI-linked government bond in the government-bond product (series GOV-11, the series P-05's government-bond entry names); the unlinked government bond in the same product but **not evaluated** until the coupon frequency of a fixed-rate series is in the rule base (GOV OQ4); the S&P 500 in a brokerage account through fund 1148162 (the fund P-05's brokerage entry names); the TA-125 in a brokerage account through collected fund 1143718 (Tachlit Sal TA 125, Leumi tariff); the general track in a kupat gemel lehashkaa at the manager's list fees (Meitav), with the return entered (D9). **Why:** each default is the plain way to hold the exposure that the site already has collected terms for, taken from the wrapper the exposure record lists first among those it can run; the alternative, ranking every wrapper for every exposure, is wrapper mode's job and is offered by the link "באיזה מוצר להחזיק את זה". A row that cannot run says why instead of borrowing another instrument's terms. The person can change the wrapper on any row (the choice is then theirs, entered), among the wrappers the exposure record allows.
