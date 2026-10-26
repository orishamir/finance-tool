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

**Reader text and the per-number lines (2026-10-25):** the founder clicked the yearly inflation (A-02) on a guide page and got the file's one general line, which covered every input, the test scenarios, the fund swap below and "chosen by Claude; the founder has not signed this value off". Now each number in every file under `data/parameters/` carries its own short Hebrew line (`rationale_he` on the value object, `docs/data-schema.md` section 3.2); the sheet shows it first and the file's general line only behind "עוד על הפרמטר". The reader text (both kinds of line) says what the number is, what it is used for and that the site chose it; it does not name who chose it, mention test scenarios or audit ids, tell a history of earlier values or say what the founder has approved. That working history stays in this file, and a test (`site/app/lib/parameter-text.test.ts`) fails if it comes back. **A-02:** 2% is a round starting value the site chose, like the other inputs; it is not a measured average and not a forecast, and no inflation series or target is collected for it, so the line says only that.

**Representative instrument (`instruments`):** for each wrapper, the data records the illustrative run takes its terms from (deposit terms, fund, fees provider, government-bond series rule); wrappers whose records are not collected yet have no entry and their guide page shows no timeline.

**Why:** chosen by Claude at the founder's request, 2026-10-23: the representative instrument is the first collected record of each kind; revisable. The page names the records it used, and every term shown carries that record's source.

**Representative fund of the brokerage account, changed 2026-10-24 (provisional; the founder signs off):** `instruments["brokerage-account"].fund` was IBI's 1148162 (0.80 % fixed + 0.30 % variable + trustee, about 1.115 % a year), the only S&P 500 record then; a scenario audit found it misrepresents "a cheap tracker in a brokerage account" by about 100,000 NIS over 20 years. It is now **5139282 Yelin Lapidot tracking fund (4D) S&P 500** (0 % fixed, 0 % variable, 0.02 % trustee, no load; 0.02 % a year in all, all of it the trustee fee, the management fee is 0 %, ETF-13). **Why:** the lowest all-in cost inside the fund among the nine S&P 500 funds collected on 2026-10-24: ATF ETF 1218916 (about 0.2 % variable, 0.008 % trustee), Yelin ETF 1201656 (0.32 %), Yelin tracking fund 5139282 (0.02 %), Altshuler Shaham 5139100 (0.03 % trustee from 15.01.2026), Kesem 5124482 (0.125 %), Harel 5129275 (0.125 %), Harel currency-hedged 5127527 (0.32 %), iShares CSPX ie00b5bmr087 (TER 0.07 %), IBI 1148162 (about 1.115 %). Runner-up: 5139100. The fees provider stays Leumi (a separate change lets the person pick a broker). Chosen by Claude, revisable; the old value is kept here as history.

**Default channel of the fees provider, changed 2026-10-24 (review fix):** the site's default tariff for every wrapper that reads Leumi's list lines (brokerage account, makam, government bond) took the first list trade line of the snapshot, the branch line (0.65 % a trade), while the providers workbench and the broker picker rank the direct channel (0.4 % a trade, minimum 26 NIS, maximum 6,300 NIS). The site now reads the direct-channel line first (a line with no channel counts as direct; a snapshot with branch lines only still uses its first), so the default and "Leumi" in the picker agree. Effect on the scenario audit's 20-year case (40,000 now, 3,000 a month, 7 %): the brokerage account ends at about 1,030,053 NIS in today's money (was about 1,029,068), 2,169 NIS under the kupat gemel lehashkaa (was 3,154). Chosen by Claude, revisable.

**Representative tariff in the comparison, changed 2026-10-24 (Doron's case):** P-05's `tariff` entry for the brokerage account (Leumi) no longer prices the account in the comparison. A reader's goal (67,000 NIS for eight years at 7 %, nothing monthly) ended at 85,507 NIS in today's money on Leumi's list tariff against 85,870 in a kupat gemel lehashkaa at Meitav's 0.8 % list fee, a tie the page showed with the gemel first and explained by "tax"; the same account on One Zero's published tariff ended at 89,759 and on Psagot Trade's at 89,357. The page had put the choice worth 0.4 % in the headline and the one worth 4 % behind "להחליף". The comparison now runs the account once on every collected list tariff and keeps the one that leaves the goal the most, naming it as the site's pick (method F-80); the fund inside the account already followed that rule. P-05's entry still serves the guide page's illustrative run and the fee page. Chosen by Claude, revisable. The gemel keeps Meitav's list fee, the only one collected; the regulator's data shows S&P 500 tracks in a gemel lehashkaa charging 0.39 % to 0.71 % in 2026-09, so collecting more list prices is the open hand-off.

**Study fund run:** the `keren-hishtalmut` entry sets `employment` to `self-employed`, because an employee's run needs a salary, which comes from the person's entered profile and not from a site parameter; the self-employed run needs none (A-12, TXH-08).

**Income (`annual_income`):** 144,000 NIS a year, the income of the founder's own case (12,000 a month), read only by runs that need an income: the self-employed study-fund deduction (TXH-05), the other income above which a gain is taxed from 60 (method F-42: the kupat gemel lehashkaa lump sum and the brokerage account, since 2026-10-26) and the surtax threshold (F-43); the person's entered income replaces it. **Why:** chosen by Claude at the founder's request, 2026-10-23, the founder's own case; revisable.

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

**Presentation rule (2026-10-24, UX audit; threshold and verdict unchanged):** when the saved goal ranks the product first, the "avoid" verdict is worded as a relative statement, "יקר יחסית לחלופות בלי עמלה", with a link, instead of "שווה להימנע" (ties share a place, so the softer wording applies to rank 1 only); the fee page also shows a ranked sentence under its legend, and the "if they lower it" row says it does not change the ranking. The verdict, the thresholds and the reason line are the ones above.

**Two more uses of the negotiate threshold (2026-10-24, scenario audit; the value is unchanged):** the idle-cash page reads the 1,000 NIS over one year of holding, not over the horizon. (1) The yearly gap, after tax, between a bank's offer (on its own term) and the daily money-market fund is judged against it: a gap below 1,000 NIS a year is "not worth a phone call", a gap at or above it is worth checking. (2) The "small sum" line: when the whole sum's yearly cost of staying in the current account (the headline's monthly cost over twelve months) is below 1,000 NIS, the page says the sum is too small for the difference to matter. Both are site judgements of the same kind as the fee verdict, shown as a site parameter beside their reason; they are not rules and not forecasts.

**Pension and annuity tracks (`instruments`, added 2026-10-23, second release 2 pass):** no managing company publishes a list fee for a general pension fund or a provident fund for annuity, so, as for the study fund, the comparison uses the regulator's average on a named track (method 2.4). `pension-general` names track **2158**, "מיטב פנסיה כללית לבני 50 ומטה" (Meitav, classification "קרנות כלליות", the age-banded default track for someone under 50, which fits the founder's 22): the CMA reports the pension fees per fund and not per track (CAT-39), so every Meitav general-pension track shows the same 0.14% balance and 1.07% deposit average for 2025, and the choice moves no number. `provident-for-annuity` names track **923**, "מיטב בטחון" (Meitav, classification "תגמולים ואישית לפיצויים", specialization and sub-specialization "כללי"; the other "כללי" track in that classification, 1486, is a personally managed product with a different fee). The regulator has no separate classification for a provident fund for annuity, so this classification is the nearest the data offers; the comprehensive pension fund keeps Meitav's list fee lines. **Why:** the first collected Meitav track of each kind, chosen by Claude at the founder's request, revisable; the page names the track and every fee carries the CMA record's source and year. The insurance cost (A-17) is not a site parameter: the person enters it, and a pension fund without it is "not evaluated".

## Classification fit

P-04, `data/parameters/classification-fit.json`.

**Values:**
- an equity track ("מניות") fits a horizon of 10 years or more, if the person accepts a fall of at least 30%;
- a general track ("כללי") fits 5 years or more and a fall of at least 20%;
- every other classification shows "no rule".

**Why:** the other regulator classifications put very different mixes under one name (for example index trackers of shares and of bonds), so a mark at that level would mislead. A finer table needs the sub-classification and comes with the fit mark in release 2.

**Use in the comparison (2026-10-24, corrected the same day):** each row's `max_fall_pct` also decides whether an option is ranked: when the fall the person accepts is below the fall of the option's own row, the option is listed, not ranked, and the row says so (F-83). The row is the representative track's classification for a provident or pension wrapper (a general track, 20%), the equity row (30%) for a fund-based wrapper on an equity-index exposure; an option with no classification is not demoted; an unset accepted fall changes nothing. The equity row's 30% is the founder's choice made on 2026-10-23 for the fit mark, now used as a demotion line; it is a site judgement, not a rule or a forecast, and the comparison shows it as a site parameter beside its reason.

## Golden tolerance

P-06, `data/parameters/golden-tolerance.json`.

**Values:** 1 NIS or 0.01%, whichever is larger.

**Why:** the engine and the independent check use the same conventions, so they should agree to the shekel.

## Goal presets

Added 2026-10-23 for release 2 (P-07, `data/parameters/goal-presets.json`), chosen by Claude at the founder's request; revisable. A preset fills starting values into the goal form (product D13) and never an amount: liquid reserve one year with the whole amount kept available at once and withdrawable at any time (the idle-cash entry point); purchase at a known date four years (the founder's apartment case, S40); long-term wealth twenty years (the founder's ETF-vs-provident case, S39); lump sum ten years with no monthly deposit (the illustrative scenario); a child eighteen years (the child-savings withdrawal age, CS-14), to be shortened by the child's age. The horizon slider runs from one to forty years in whole years.

## Exposure holding wrapper

Added 2026-10-24 for release 5 (P-08, `data/parameters/exposure-holding-wrapper.json`), chosen by Claude at the founder's request; revisable. Exposure mode runs each exposure through one wrapper (method F-71: the caller names it; the engine never picks one), so the site needs a default per exposure record. **Values:** shekel cash in a bank deposit (at the published rate of the P-05 deposit-terms record, Leumi's 365-day deposit; D20); makam in the makam product (no sourced yield exists, so the person enters one); the CPI-linked government bond in the government-bond product (series GOV-11, the series P-05's government-bond entry names); the unlinked government bond in the same product but **not evaluated**: the engine does not run a fixed-rate unlinked series yet (changed 2026-10-26: it said the row waits for the coupon frequency, GOV OQ4; GOV-13 now gives a yearly coupon, so evaluating it is the lead's call); the S&P 500 in a brokerage account through fund 1148162 (the fund P-05's brokerage entry names); the TA-125 in a brokerage account through collected fund 1143718 (Tachlit Sal TA 125, Leumi tariff); the general track in a kupat gemel lehashkaa at the manager's list fees (Meitav), with the return entered (D9). **Why:** each default is the plain way to hold the exposure that the site already has collected terms for, taken from the wrapper the exposure record lists first among those it can run; the alternative, ranking every wrapper for every exposure, is wrapper mode's job and is offered by the link "באיזה מוצר להחזיק את זה". A row that cannot run says why instead of borrowing another instrument's terms. The person can change the wrapper on any row (the choice is then theirs, entered), among the wrappers the exposure record allows.

## Pinned rules

Added 2026-10-24 for the knowledge layer (P-09, `data/parameters/pinned-rules.json`), chosen by the lead (Claude) at the founder's request on 2026-10-24 and **kept by the founder the same evening** ("if I want to change which rules are pinned I would have told you"); no tag marks the list on the page (the founder asked for the "בחירה של האתר" tag to go). Importance is a judgement, so it is a parameter: the data-driven score (engine use, site use, references, figure, tier, strength) orders rules inside groups and picks the teasers, and never this list. **Selection rule:** the rule decides an outcome on the site or is documented as a common misconception or recurring question (`research/knowledge/2026-10-24-user-lens.md` section 2, the BGU 2019 study, the forum catalogue), and it has a primary or primary-mirror source with a link after the extraction of 2026-10-24. Row 1 is the capital-gains rule because it is the most known and the founder's own example, not because a formula ranks it (it ranks 13th). No formula reads P-09.

**Answers (2026-10-24, late evening).** The questions moved from the top of the rules page to their own page, and each row carries `answer_he`: one sentence written only from the row's rules, every figure a `{ID:figure}` slot that the page renders as a sourced number, so the validator can reject a typed digit. An answer is prose, so it is the site's reading of the records; the lead reviews each against its records' `text_he`, and a row whose rules do not support a one-line answer says only what they say.

**The twelve rows** (the question is the record's `question_he`, polished by the Hebrew editor):

| # | Rules | Question (topic) |
|---|---|---|
| 1 | TXS-01, TXS-02 | tax on a gain in the market |
| 2 | TXI-03, TXI-02 | tax on deposit interest |
| 3 | TXH-17, TXK-04, PF-23 | switching track inside the fund: tax, fee |
| 4 | KGL-02, KGL-03 | how much may go into a provident fund for investment a year |
| 5 | TXH-09, KH-15 | when a study fund is liquid without tax |
| 6 | BANK-23, REG-04, REG-06 | is money in a deposit insured |
| 7 | PF-06, PF-02 | the management-fee cap |
| 8 | PF-19, SW-06 | transfer between funds: how long, what it costs |
| 9 | PF-13, PF-14, SW-15 | a fee discount: for how long is it guaranteed |
| 10 | TXS-24, MF-37 | whether all money-market funds are the same |
| 11 | BANK-20 | money sitting in a current account: what the bank must say |
| 12 | REG-18, REG-19 | what happens to a pension if the managing company fails |

**Per-guide lists** (`guide_blocks`, two or three rules each, shown as "שווה לדעת"):

- current-account: BANK-20, BANK-23, BANK-15
- bank-deposit: TXI-03, BANK-06, BANK-23
- savings-plan: TXI-03, BANK-26, BANK-23
- money-market-fund-daily: TXS-24, MF-37, BANK-18
- money-market-fund-renewable: MF-37, MF-35, TXS-24
- makam: TXI-01, BANK-18, TXI-12
- government-bond: TXI-14, GOV-17, TXI-12
- brokerage-account: TXS-21, TXS-02, TXS-19
- kupat-gemel-lehashkaa: TXK-04, KGL-02, TXK-05
- keren-hishtalmut: TXH-09, KH-15, PF-18
- pension-comprehensive: PEN-23, PEN-15, REG-18
- pension-general: REG-18, PEN-15, TXP-15
- provident-for-annuity: TXP-15, REG-18, PF-19
- child-savings-provident: CS-18, CS-20, CS-12
- child-savings-bank: CS-05, CS-12, CS-18
- ira-hishtalmut: TXH-09, IRA-16, IRA-18
- ira-provident: IRA-16, IRA-17, IRA-18

**Why:** a friend arriving at the rules page asks a question, not a topic; the twelve rows are the questions the research found people actually ask or get wrong, each answered by the rules that settle it, so a reader reaches a source in one tap. **Revisable:** the founder may change any row or list; a changed row is re-checked against the selection rule, and the validator fails if a first id has no primary or mirror source.
