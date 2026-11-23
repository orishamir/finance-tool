# Site parameters: the founder's rationale

Each site parameter (`docs/method.md` §2.3, stored in `data/parameters/`) is a judgement, not a rule. This file records the current value of each and why it was chosen, so the page can show it under "site parameter". There are eleven, P-01 to P-11, one file each.

The founder set P-01 and chose P-10 himself. He asked Claude to choose the others ("do whatever you think fits"); each of those files records who chose it in `chosen_by`. Parameters are Claude's to decide and carry no sign-off (guidelines/working-with-the-founder.md). Any value can be changed at any time.

**Reader text.** Each number in every parameter file carries its own short Hebrew line (`rationale_he` on the value object), and the file has a general line; what the reader text may and may not say is in `docs/data-schema.md` section 3.2. Who chose a value, test scenarios and audit ids stay in this file, never on the page, and `site/app/lib/parameter-text.test.ts` fails if they appear there.

## Tie threshold

P-01, `data/parameters/tie-threshold.json`. Set by the founder.

**Value:** 0.5%. Two options are a tie when `|V_i − V_j| / max(V_i, V_j) < 0.5%`, where V is the real value at the horizon (method F-80).

**Why:** a difference under 0.5% of the final amount is not worth acting on. It is the same line the founder set for what is worth modelling at all. Example from the golden scenarios: in the broker comparison (S44, regulator-average fees), broker C ends about 0.8% ahead of bank B, which is a clear win at 0.5% and would be a tie at 1%.

## Sensitivity bounds

P-02, `data/parameters/sensitivity-bounds.json`.

**Values:**
- yearly return (A-01) 0% to 10%;
- inflation (A-02) 0% to 5%;
- shekel against a foreign currency (A-03) −3% to +3% a year;
- cost inside a fund (A-06) 0% to 3% a year;
- each fee rate from half to double, one at a time;
- horizon 2 years shorter or longer.

**Why:** wide enough to show whether the answer depends on a guess, the return guess above all.

## Fee verdict thresholds

P-03. Removed: no page reads it, and `data/parameters/fee-verdict-thresholds.json` is gone; the fee verdict it set (method F-62) is not built.

## Classification fit

P-04. Removed: no page reads it, and `data/parameters/classification-fit.json` is gone; the formulas that name it (method F-70, F-71, F-83) are not built.

## Illustrative scenario

P-05, `data/parameters/illustrative-scenario.json`: the starting values of the guide graphs and the indices page, the slider ranges, the representative instrument per wrapper and an income for the runs that need one.

### Inputs

**Values:** 10,000 NIS today; 500 NIS a month; 10 years; 7% a year for market products (A-01: funds, ETFs, provident, hishtalmut, pension); inflation 2% a year (A-02); 3.25% a year for cash-like products (`cash_rate`); 144,000 NIS a year of income (`annual_income`).

**Why:** round starting values for someone beginning to save, not a forecast and not a measured average; each can be changed on the page. The amount, the monthly deposit and the horizon match the test scenario for guide pages (S47), so every guide graph is checked.

- **A-01, 7%:** a round starting value the person can change, not a forecast (D9).
- **A-02, 2%:** a round starting value the site chose, like the other inputs; it is not a measured average and not a forecast, and no inflation series or target is collected for it, so its line says only that.
- **`cash_rate`, 3.25%:** the Bank of Israel's policy rate, quoted as one published figure from its press release of 21.10.2026 (D20, D22). It is the site's assumption for cash-like options with no published rate of their own (the money-market fund, makam, the government bond); a daily money-market fund tracks it less its costs (MF-34). The bank deposit and the current account run on their banks' published rates. When it was set, every current cash figure read was below it: makam about 3.0% to 3.2% gross, renewing money-market funds' expected net yields 2.75% to 2.81% (`research/2026-10-26-cash-rates.md`). It is rechecked at each Bank of Israel rate decision. On the comparison page a person can enter another rate to replace it.
- **`annual_income`, 144,000 NIS a year (12,000 a month):** read only by runs that need an income: the self-employed study-fund deduction (TXH-05), the other income above which a gain is taxed from 60 (method F-42: the kupat gemel lehashkaa lump sum and the brokerage account) and the surtax threshold (F-43); the person's entered income replaces it. Chosen by Claude at the founder's request; revisable.

### Sliders

**Values:** monthly deposit 0 to 10,000 NIS, in steps of 50 to 1,000, of 100 to 3,000 and of 500 to 10,000; years 1 to 40 in steps of 1; on the indices page, the amount today 0 to 500,000 NIS, in steps of 1,000 to 20,000, of 5,000 to 100,000 and of 25,000 to 500,000, the return 0% to 12% in steps of 0.5%, and inflation 0% to 5% in steps of 0.5%. The change chart at the bottom of the indices page changes each plan number by the same share, −50% to +50% in steps of 5%, and opens at +20%.

**Why:** the sliders cover what most people would try; a larger amount or another return can be typed (the years stop at the slider's 40). A money slider moves in steps that grow with the amount (`guidelines/design.md`, "Fields"): each of its three parts takes a third of the track, its steps are round amounts, and the starting value (10,000 NIS, 500 NIS a month) lands in the first third rather than against the slider's end; an amount between the steps can be typed and keeps its own place on the track. Years, the return and inflation move in equal steps; inflation's slider ends where the sensitivity check's inflation range ends (P-02, 0% to 5%), and another inflation, a negative one included, can be typed. Half and one and a half times the plan cover the changes a person would weigh; +20% is a change large enough to tell the numbers apart and small enough to be within reach. Chosen by Claude, revisable.

### Field ranges

**Values:** an age 0 to 120; a horizon 1 to 40 whole years (the horizon slider's ends); a yearly percentage (a return, inflation) −50% to 50%; an amount of money 0 to 1,000,000,000 NIS (`ranges.amount`), in every whole-shekel field and in the deposits page's address.

**Why:** bounds that catch a typing mistake, not rules. The amount's top is one billion shekels: the fee page already refuses a sum above it, it is twenty times the largest bound any bank deposit table read prints (50,000,000 NIS on 2026-11-23), and far above a personal saving; with no top, a typed 99,999,999,999,999 ran through the guides' charts and an address's amount of twenty digits lost its last ones. Chosen by Claude, revisable.

### Field ranges

**Values:** the age field 0 to 120; a yearly percentage (a return, inflation, a money-market fund's rate) −50% to 50% (`ranges.pct`); the interest rate of a guide whose run taxes it as interest (the current account, a bank deposit, a savings plan, makam, a government bond) 0% to 50% (`ranges.interest`).

**Why:** the bounds catch a typing mistake, not a forecast. A return, inflation and a money-market fund's return can fall below zero, so their range does: the money-market fund's guides take −1% as typed, keep it on the device and run it. Interest below zero is not run: the rule base holds no rule for its tax (method G-41, TXI OQ20), so its field starts at 0. The range applies where the rate is typed: which range a guide's rate field takes is its wrapper's kind (`cashRateRange`, `site/app/lib/guide-signature.ts`), and the device keeps any rate typed, so a negative interest rate kept from an older device or an imported file reaches the run, which stops on G-41 and says why. The interest range is the site's choice (Claude), not the founder's; revisable.

### Representative instruments

`instruments` names, for each wrapper, the collected records the illustrative run takes its terms from (deposit terms, fund, fees provider, government-bond series rule, track). A wrapper with no entry has no timeline on its guide page.

**Values:**
- bank deposit: `leumi-pakam-kavua-365`; savings plan: `leumi-tashlumim-shekeli-3y`; current account: `leumi-current-account`;
- daily money-market fund: 5138763; renewable money-market fund: 1223866;
- brokerage account: fund 5139100, tariff Leumi. **Chosen by Claude**: the entry says so (`chosen_by`); makam: tariff Leumi; government bond: tariff Leumi, series rule GOV-11;
- study fund (`keren-hishtalmut`): track 880, run as self-employed;
- general pension fund: track 2158; provident fund for annuity: track 7215;
- provident fund for investing (`kupat-gemel-lehashkaa`): track 7978, Meitav's general track; the run prices the collected lists (F-80). **Chosen by Claude**: the entry says so (`chosen_by`).

**Why:** the representative instrument is the first collected record of each kind, chosen by Claude at the founder's request; revisable. It is not a recommendation: the page names the records it used, and every term shown carries that record's source. Where a page chooses among all collected records instead, the entry does not price the run:

- **Guide pages.** The securities account, makam and the government bond take the collected tariff that leaves the example plan the most, or the page says the houses tie within P-01 (method F-80); the bank deposit takes the middle rate of the collected one-year deposits that cannot be broken (method F-86); the range of all of them shows where a deposit is set beside another product (the makam page, the daily money-market fund's table), not on the bank deposit's own page. The kupat gemel lehashkaa runs on the collected list whose fees, as priced on the binding documents, are the lowest on both bases in every month (method F-80, D56), or the page says it has no run when none is. The page says which record it used.

**Brokerage fund, 5139100** (Altshuler Shaham tracking fund (4D) S&P 500: 0% fixed, 0% variable, 0.03% trustee from 15.01.2026, no load; 0.03% a year in all; ETF-13). **Why:** the lowest all-in cost inside the fund (fixed and variable management and trustee) among the Israeli S&P 500 funds collected whose status as a foreign-investment fund is settled not one (`tax_status.foreign_investment_fund` `false`, data-schema §3.5): Harel currency-hedged 5127527 (0.32%), MTF 1150333 (0.58%). The guides' example is an Israeli tracking fund (its houses are priced on their lines for `mutual_fund_units`). A fund whose documents name a principal currency, or whose status is not known, is run under both readings of TXS OQ26 (method F-04), and at P-05's plan (A-02 2%, A-03 0) the two give different results, so a guide on it would compute nothing: of the S&P 500 funds, 1144385, 1146471, 1148162, 1149020, 1165810, 1218916 and 5129275 name the dollar, and 1201656, 5124482 and 5139282 (0.02%, the cheapest of all) have a status not known. IBI 1148162, at about 1.115% a year, would misrepresent "a cheap tracker in a brokerage account" by about 100,000 NIS over 20 years. Chosen by Claude, revisable.

**Channel of the fees provider.** Where a run reads Leumi's list lines (brokerage account, makam, government bond), it reads the direct-channel line first (a line with no channel counts as direct; a snapshot with branch lines only uses its first), so the default agrees with "Leumi" as the indices page ranks it (0.4% a trade, minimum 26 NIS, maximum 6,300 NIS, against 0.65% at the branch). Chosen by Claude, revisable.

**Study fund run:** the `keren-hishtalmut` entry sets `employment` to `self-employed`, because an employee's run needs a salary, which comes from the person's entered profile and not from a site parameter; the self-employed run needs none (A-12, TXH-08). The study fund's page shows no timeline of this run: its visual runs its own bundle, on the fund's track that holds the brokerage fund's index, with the employment the reader picks, and opens on an employee at `annual_income` over 12 (method F-67, F-96). The entry's employment lets the page's own bundle run and decides no figure the page shows.

**Pension and annuity tracks:** no managing company publishes a list fee for a general pension fund or a provident fund for annuity, so, as for the study fund, the guides use the regulator's average on a named track (method 2.4).
- `pension-general` names track **2158**, "מיטב פנסיה כללית לבני 50 ומטה" (Meitav, classification "קרנות כלליות", the age-banded default track for someone under 50). The CMA reports the pension fees per fund and not per track (CAT-39), so every Meitav general-pension track shows the same 0.14% balance and 1.07% deposit average for 2025, and the choice moves no number.
- `provident-for-annuity` names track **7215**, "מיטב גמל לבני 50 ומטה" (Meitav, classification "תגמולים ואישית לפיצויים", specialization "מדרגות", sub-specialization "עד 50"): the age-banded default track a new member under 50 joins when they choose none (CAT-19 s.4(ב)), as 2158 is for the general pension fund. A provident fund for annuity may keep a general track only closed to members who were not in it on 1.1.2016 (CAT-19), so its "כללי" tracks are not what a new member can join, except in a fund the circular leaves out: Gemel-Net's general tracks 119, 260 and 263 sit in guaranteed-yield funds the circular leaves out, and whether that takes their general tracks is open (CAT-53, CAT OQ36, D51); 923 "מיטב בטחון" is closed to new members on Meitav's own terms (CAT-54, D51). **Chosen by Claude**: the entry says so (`chosen_by`). The regulator has no separate classification for a provident fund for annuity, so this classification is the nearest the data offers.
- The comprehensive pension fund keeps Meitav's list fee lines.

**Why:** the first collected Meitav track of each kind, chosen by Claude at the founder's request, revisable; the page names the track and every fee carries the CMA record's source and year. The insurance cost (A-17) is not a site parameter: the person enters it, and a pension fund without it is "not evaluated".

## Golden tolerance

P-06, `data/parameters/golden-tolerance.json`.

**Values:** 1 NIS or 0.01%, whichever is larger.

**Why:** the engine and the independent check use the same conventions, so they should agree to the shekel.

## Goal presets

P-07. Removed: no page reads it, and `data/parameters/goal-presets.json` is gone; the goal form it filled (product D13, D21) is not built.

## Exposure holding wrapper

P-08. Removed: no page reads it, and `data/parameters/exposure-holding-wrapper.json` is gone; exposure mode (method F-71) is not built.

## Pinned rules

P-09, `data/parameters/pinned-rules.json`. Chosen by Claude at the founder's request and kept by the founder as drafted. No tag marks the list on the page (the founder asked for the "בחירה של האתר" tag to go). No formula reads P-09.

Importance is a judgement, so it is a parameter: the data-driven score (engine use, site use, references, figure, tier, strength) orders rules inside groups and picks the teasers, and never this list.

**Selection rule:** the rule decides an outcome on the site or is documented as a common misconception or recurring question (`8dd1f013:research/knowledge/2026-10-24-user-lens.md` section 2, the BGU 2019 study, the forum catalogue), and it has a primary source with a link. Row 1 is the capital-gains rule because it is the most known and the founder's own example, not because a formula ranks it (it ranks 13th).

**The twelve questions** (`rows`; the question is the row's `question_he`, polished by the Hebrew editor). The rules page (`/rules`) names a question when its filters match the question's rules. Each row carries `answer_he`: one sentence written only from the row's rules, every figure a `{ID:figure}` slot that the page renders as a sourced number, and the validator rejects a typed digit. An answer is prose, so it is the site's reading of the records; the lead reviews each against its records' `text_he`, and a row whose rules do not support a one-line answer says only what they say.

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

**Facts** (`facts`): the short facts of the rules page's "הידעת?" block, 36 today, each with its `text_he`. The validator checks that each rests on one general rule (never a company's term) with a primary source, appears once, and carries no typed digit: every figure is a `{ID:figure}` slot over that rule.

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
- keren-hishtalmut: KH-19, KH-15, PF-18
- pension-comprehensive: PEN-23, PEN-15, REG-18
- pension-general: REG-18, PEN-15, TXP-15
- provident-for-annuity: TXP-15, REG-18, PF-19
- child-savings-provident: CS-18, CS-20, CS-12
- child-savings-bank: CS-05, CS-12, CS-10
- ira-hishtalmut: TXH-09, IRA-16, IRA-18
- ira-provident: IRA-16, IRA-17, IRA-18

**Why:** a friend arriving at the rules page asks a question, not a topic; the twelve rows are the questions the research found people actually ask or get wrong, each answered by the rules that settle it, so a reader reaches a source in one tap. **Revisable:** the founder may change any row or list; a changed row is re-checked against the selection rule, and the validator fails if an id has no record or a row's first id has no primary source.

## Home guide door

P-10, `data/parameters/home-guide-door.json`. Chosen by the founder (option A of the door sketch); revisable. No formula reads P-10.

**Value:** the six kinds of saving the first page's guide door names as chips, in order, each opening its own guide page: keren-hishtalmut, kupat-gemel-lehashkaa, money-market-fund-daily, bank-deposit, brokerage-account, child-savings-provident. The rest are one link away in the guide list.

**Why:** the kinds most people in the audience hold or are offered first (popular first), from the everyday short-term ones to the tax-benefit ones.

## Deposit amounts

P-11, `data/parameters/deposit-amounts.json`. Chosen by Claude with the drawing of the deposits page the founder approved; revisable.

**Values:** 250, 1,000, 10,000, 100,000, 250,000 and 500,000 NIS, offered on the deposits page as "מפקידים לפחות", one at a time. The page starts at P-05's amount now, 10,000 NIS, the site's example; the validator fails if that amount is not one of the steps.

**Why:** an amount opens an offer when it is within the offer's printed range (F-108), so the steps that change the page are the minimums the banks print. On the standard tables read on 2026-11-09 the minimums fall mostly at 50 to 250, 1,000, 10,000, 100,000 and 250,000 NIS, with a few at 250,001 and 500,000; 250 opens almost every short deposit, 1,000 most of the longer ones, 10,000 is the example, and 100,000, 250,000 and 500,000 open the large tiers. Amounts between two steps open the same offers as the step below, except for the few ranges that end between them. Not an average and not a recommendation.
