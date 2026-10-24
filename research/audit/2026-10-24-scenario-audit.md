# Scenario audit, 2026-10-24 (morning): can the site answer a real dilemma?

The founder's question: a friend's 67,000 ₪ deposit matures next week; he finishes medical school in 7–8
years and presumably wants to buy a house; "where should I put that money? is it enough time for the
S&P 500 / stocks?" With only that in his head, can the site reliably help him? And, more generally, is the
part of the site that answers a person's dilemma on the home screen rather than behind buttons?

(The raw scenario reports and screenshots were lost when the machine rebooted and the tmpfs scratchpad was
wiped; this file is written from the lead's triage notes and the auditors' hand-back summaries.)

## Method

Eight auditors (Claude Fable 5.1, high effort), one person and one dilemma each, stated in the person's own
words, knowing nothing more than that; phone first, decisive screens repeated on a desktop; the live site as
updated the night before. The question was "can the site reliably help this person", meaning they leave with
an answer a competent, honest adviser would not contradict and understand what it rests on. Nobody verified
a number.

## The eight scenarios and their verdicts

| # | Person and dilemma | Verdict | What happened |
|---|---|---|---|
| 1 | The friend: 24, medical student, 67,000 ₪ landing, house in 7–8 years, "enough time for S&P 500?" | **No** | The stock options sit behind a return and a "worst fall" he cannot fill; nothing says what the site can or cannot conclude for 8 years. If he types the 10% his phone gives him, the headline crowns the S&P 500 with no caveat about the dollar, the single 0.8% fund or the unapplied fall filter; an invented fall then "disqualifies every exposure". The sensible step for next week (out of checking, decide on stocks separately) is never stated though the figures show it. Bonds rank first "by a representative record" while their minimum-amount rule is open. The cash ranking rests on a 3.5% site parameter disclosed 5,000 px down. |
| 2 | 34, salaried, study fund just became liquid (150,000 ₪, general track): withdraw, switch track, move provider, or keep? | **No** | The comparison treats the balance as new cash, excludes her own product ("deposited only through the employer") and crowns a brokerage S&P fund, which by omission says "withdraw". The decisive sentences exist on four pages and are never assembled; the holdings card offers only fees and a 13-step provider move. The form blocks on a fee the site shows for her track one tap earlier. |
| 3 | Couple, wedding in two years, 60,000 ₪ plus 4,000 ₪ a month | Partly | A sound direction (money-market fund over deposit; stocks kept out honestly), but the winner's rate is a site parameter against the deposit's real tariff, undisclosed in the headline; the wedding's cost is never asked, so "will it cover 150,000" is left to them; the deposit on the card is a one-year product for a two-year goal. |
| 4 | 41, inheritance of 250,000 ₪, no goal, "don't want to lose it" | Partly / no | No "no goal" path: years are mandatory, presets set a horizon silently, nothing says the horizon is the decision; no way to split the sum by horizon. With a guessed return and an acceptable drop of 0%, the headline crowns an S&P fund: her one constraint is accepted, displayed and ignored because the filter needs a forecast per index, and the site's own fit table (30% for equity) is not used to warn. |
| 5 | Father, daughter aged 3, 500 ₪ a month to 18; the state child-savings scheme | Partly | The guide explains the scheme well, but nothing says where the daughter's account is; the preset fills 18 years instead of 15; with no return, the headline names a money-market fund as the best fit for 15 years; the doubling decision and the own-name decision never meet on one screen. |
| 6 | 29, developer, 3,000 ₪ a month for 20+ years: provident-for-investment or a cheap S&P tracker in a brokerage account? | **No** | "Brokerage account" is computed from a single 1.115%-a-year S&P fund plus Leumi's full tariff; by the site's own what-if and broker ranking his cheap tracker would win, yet the headline says the provident product wins by about 100,000 ₪; the sensitivity says the fund fee "does not flip in the tested range" because the range stops at ×0.5. The ceiling, tax deferral and the annuity exemption live only in the guides. |
| 7 | 52, the bank offers to renew a 100,000 ₪ deposit at 3.8% for a year | Partly | The comparison with her 3.8% typed as an own rate gives a sound answer, but no door leads there: idle cash frames her offer as a one-month deposit, never asks the term, and its hand-off to the full comparison drops the deposit and switches on "must be withdrawable at any moment". Tax, the reason a 3.5% fund competes with a 3.8% deposit, appears only as rule codes. |
| 8 | 21, student, 12,000 ₪ saved, 300 ₪ a month, "is it even worth it?" | Partly | The cost of leaving it in checking is two taps away, but no screen judges whether a few hundred shekels a year is worth his afternoon; the thresholds that could say so are applied only to a fund's own fee. Years are required; the goal form is where he quits; makam ranks third while the page says its minimum prevents ranking. |

**Zero "yes".** The site computes well and judges little; it does not say which of its numbers are its own
assumptions where the verdict sits; and for the two most common dilemmas (a sum with a horizon, money
already inside a product) it either refuses to answer or answers the wrong question.

## Cross-cutting findings

1. **A long horizon with no return still produces a cash verdict.** The hedge ("only the liquid options could be ranked") sits in a small line above a headline that names a money-market fund as the best fit for 15 years. (scenarios 1, 3, 4, 5)
2. **The leader's rate is a site parameter and the headline does not say so.** The money-market fund runs on P-05's 3.5%; the deposit on a real tariff. (1, 3, 8)
3. **"Stocks" are one expensive fund and a full-price broker.** The representative instrument is never named on the card and cannot be replaced; the fee sensitivity range hides the flip. (1, 2, 6)
4. **Money already inside a product is treated as new cash.** The liquid study fund's own product is excluded; "keep it where it is" is not an option. (2)
5. **The person's one constraint can be ignored.** An acceptable drop of 0% is displayed and bypassed; the site's own fit table (P-04) is not used to demote equity. (1, 4)
6. **No home for "I don't know when" or "no goal".** Years are required; presets set a horizon silently; nothing says the horizon is the decision; no split by horizon. (4, 8, 1)
7. **An option whose eligibility rule is open can still rank, even first.** Government bonds with an open minimum-amount rule; makam. (1, 8)
8. **The next practical step is never stated.** Out of checking now, decide on stocks separately; renew the deposit or not; double the state deposit or not. (1, 5, 7)
9. **The idle-cash hand-off misleads.** It drops the entered rate and the deposit and switches on "withdrawable at any moment". (7, 8, 4)
10. **The known-date goal never asks what the purchase costs.** (3)
11. **Tax reasons appear as codes where the person decides.** (7, 2)
12. **The home page's first screen connects to none of the eight dilemmas.** Taps to the screen that should answer: 4 to 11; for the study fund, 10 and still no answer.

## What was built in response (same day, commit of 2026-10-24 afternoon)

- A **question card on the home page's first screen**: the sum (now and/or monthly), the years with "don't know", and the purpose in people's words (דירה, חתונה, לימודים, ילד, פרישה, כרית ביטחון, בלי מטרה), one tap into the comparison; "don't know" becomes a visible parameter default with a note and the horizon sensitivity pinned first; "כרית ביטחון" opens idle cash prefilled. Four taps and two numbers to the headline, instead of eleven.
- **An honest line on the result when the horizon is below the site's equity minimum** (P-04): the site does not decide whether N years is enough for stocks; what its fit table says; how to check with one's own numbers. Plus the **published past record**: J.P. Morgan's Guide to the Markets rolling 5-, 10- and 20-year S&P 500 return ranges (1950–2025, nominal), single figures quotable with attribution under D22, labelled as the past and never fed into a ranking (record MKT-01).
- **Representative instrument named on the card** with an entered fee that replaces it in the ranking (within D4); the fee sensitivity extended to the class minimum and its flip point stated in fee terms; an option whose eligibility rule is open is shown, not ranked.
- **Holdings for a liquid study fund**: the fee prefilled from the track as a sourced value; "first deposit more than six years ago" as a checkbox; a decision block with the four options (keep, switch track, move provider, withdraw), each one sentence from the rule base with its chip.
- **Goal form**: the child's age sets the horizon; an optional purchase cost for known-date goals with "enough / short by" on the result; a cue on the preset row; a line for couples; a hint that the worst-fall field only matters for equity.
- **Consistency fixes** found on the way: the S&P exposure note now states the study-fund exit treatment and its two open questions with rule ids; the makam and government-bond guides name the open trading-minimum question their cards cite; the comparison's coverage row must show a product's blocked state (request filed).
- **Comparison honesty layer (built):** on a long horizon with no return the headline leads with the limitation and demotes the cash winner to a second line; when the leader's rate is a site parameter the headline says so with an own-rate field; an equity option is listed, not ranked, when the accepted drop is below the fit table's figure for its own classification (general tracks use the "כללי" row); an entered return carries "האתר לא יודע אם היא סבירה", the currency note and "מסנן הירידה לא הופעל"; the "next step" line (cost of leaving the sum in checking, from the idle-cash formula on the comparison's own rates); the published past record under the fit sentence; "ההבדל הגדול ביותר" for any two ranked options; flip sentences never name the winner; listed options show no headline figure; the "enough / short by" line for a known-date goal in today's money; the real-terms line; the two horizon figures when the horizon is a default.
- **Idle cash (built):** the offer's term; a one-year after-tax verdict against the money-market fund with the tax rules as chips; a materiality line against the site's threshold; the small-sum sentence; the hand-off keeps the rate and the deposit and no longer switches on "withdrawable at any moment"; options whose minimum rule is open are not compared.
- **Broker choice (built):** the brokerage option runs on the broker the person picks from the comparison card or from the providers workbench (14 tariffs in the bundle); the site's default is Leumi's direct channel, equal to the picker's "Leumi". Twenty-year case (40,000 ₪ now, 3,000 ₪ a month, 7 %, 2.5 % inflation, real): provident-for-investment 1,032,222 ₪; brokerage on the site's default 1,030,053 ₪ (a tie under the 0.5 % threshold; it was 929,929 ₪ on the old 1.115 % fund); on One Zero's tariff 1,098,743 ₪, leading by 66,521 ₪.
- **Finance review (two passes, defects fixed):** the fit-table demotion now reads each option's own classification; the exposure-mode return label is in shekel terms; the liquid-from date is on a month-end basis per TXH-09; the trustee fee is named as such; makam is treated the same on both pages; P-03's new uses are recorded; the past-record wording follows the slide; the withdraw row cites the employee rule and the study exception.

## Decisions for the founder

1. **Amend D9 to allow a past record.** D9 says no equity return appears as a sourced number. Showing the published past record of an index (ranges of outcomes over N-year windows, share of losing windows) beside the person's horizon, labelled as the past and never used to rank or project, is the honest answer to "is 7 years enough". Option A (single published figures from the J.P. Morgan guide, with attribution) fits D22 as written and ships now. Option B (a series: Damodaran's annual S&P 500 total returns 1928–2025, from which the site computes min, max and share-below-zero over every N-year window, nominal and real) needs D9 amended and a reading of Damodaran's terms, which are a permissive statement ("no strings attached", "I want the data to be widely used") rather than a licence; the Jordà–Schularick–Taylor database carries a CC BY-NC-SA licence but covers the broad US market, not the S&P 500 by name. For TA-125 nothing republishable exists (TASE forbids; Bank of Israel link-only). Recommendation: amend D9 for a past record, adopt Damodaran's series with his statement quoted in the record, and show the 7-year window the person actually asked about.
2. **"Keep it where it is" as a ranked option.** When the money already sits inside a wrapper (a liquid study fund), the comparison should rank staying (same track or another track in the same fund, with the holding's fees and the fund's exit rule) beside moving it. A method addition over F-61's existing-balance line; recommended.
3. **A manual split by horizon.** A lump sum with no goal should be splittable into a short-horizon part and a long-horizon part as two goals (D12 allows several goals). Recommended as a "split" affordance on the result; no allocation engine.
4. **Where is my child's account.** A sourced line pointing to the official lookup; small, needs the source recorded.
5. **A fit-table row for general pension funds.** Track 2158's regulator record has no classification, so the fit table (P-04) has no row for it and the general pension is never demoted whatever fall the person accepts; a "קרנות כלליות" row (or a mapping) is your parameter to set.
6. **Altshuler Trade's custody line** reads 0.15 % with a 75 ₪ monthly minimum; the tariff does not say whether the 0.15 % is per month or per year (the record is marked unconfirmed and runs as per month, 1.8 % a year, which puts that broker last). *Founder, 2026-10-24: keep the caution for now; do not ask the broker.* The same answer covers asking the regulator's data site about past-return columns: not for now.
7. The 16 decisions of the overnight audit still stand; decisions 5 (entered fund fee in the ranking), 16 (prefill exposure returns) and the representative-fund change (D21, provisional) were taken by the lead because the scenarios showed them to be blockers. D9 carries a provisional amendment for the past-record line (decision 1 above), recorded in docs/product.md for your confirmation.

## Founder's answers (2026-10-24, afternoon)
- No name on the site ("it doesn't matter"); the footer's "אתר אישי, לא מסחרי" line stays as is.
- Keep the caution on the unconfirmed custody line; do not ask the companies for now.

## Still open after this round
- The offer's term on idle cash is page state and is not carried into the comparison's deposit line (the own rate is).
- In product mode nothing sets a forecast fall, so the "entered a fall that passes" exception to the fit-table demotion works only in exposure mode.
- The wrapper records' protection text is English only, so the cards show no "what is protected" line yet.
- Exposure mode and holdings still run the brokerage on the site's default tariff; a saved comparison does not record the chosen broker.
- The home card's "יש לכם כבר…" row scrolls sideways on a phone, so its third chip is partly off-screen.

## Sources found for the horizon question (terms as read on 2026-10-24)

- Damodaran, NYU Stern, "Historical Returns on Stocks, Bonds and Bills: 1928–2025" (spreadsheet histretSP.xls, page updated 5 Jan 2026): annual S&P 500 total returns nominal and real; usage page says he has "very few rules", wants the data "widely used", "no strings attached", acknowledgement welcome. From it (lead's agent, calendar-year windows): every 7-year window since 1928 ended between −24.9% and +351.9% nominal (−40.6% to +304.5% real); 6 of 92 windows lower nominal, 13 of 92 real; 20-year windows never negative; real recovery from the 1999 peak took 14 year-ends. Not shown on the site until D9 is amended.
- J.P. Morgan Asset Management, Guide to the Markets – U.S., 4Q 2026 (30 Sep 2026), slide "Time, diversification and the volatility of returns": S&P 500 rolling annualised return ranges 1950–2025, 1-year −37%/+52%, 5-year −2%/+29%, 10-year −1%/+20%, 20-year +6%/+18%; slides usable unaltered with credit; single figures quotable with attribution (D22). Being recorded as MKT-01.
- Jordà–Schularick–Taylor Macrohistory Database (CC BY-NC-SA 4.0): broad US equity total returns since 1870; not the S&P 500 by name; Israel not covered.
- CMA circular 2015-9-29 (age-based default tracks, in force 1 Jan 2016): the regulator's own horizon-to-risk answer, without equity percentages; usable as a sourced sentence.
- Dimson–Marsh–Staunton/UBS Yearbook 2026 and the MSCI World factsheet: figures exist but their terms forbid reproduction; link only. S&P DJI's factsheet and terms could not be read by script.

## Doron's case (2026-10-24, evening): the tariff decided more than the product

A reader's saved goal (67,000 NIS for eight years at 7 %, nothing monthly, no profile) showed the comparison with a kupat gemel lehashkaa first: a tie at 0.42 % with the securities account, the card blaming "מס (בהחזקה וביציאה)" and the flip line naming the gemel. Traced with the engine (scripts in the session's scratchpad, `doron/probe*.ts`):

| Securities account priced at | Value at 8 years, today's NIS | Against the gemel's 85,870 |
|---|---|---|
| One Zero, published tariff: 0 % custody, 0.3 % a trade (min 30) | 89,759 | fund first by 3,889 |
| Psagot Trade, published tariff: 0.12 % a year custody, 0.07 % a trade (min 2) | 89,357 | fund first by 3,488 |
| Leumi list price (the page's default): 0.15 % custody a quarter, 0.4 % a trade (min 26) | 85,507 | tie |
| IBI (50 NIS a month), Altshuler Trade (80 a month plus a custody minimum), Excellence (99 a month) | 82,527 / 71,125 / 65,703 | gemel first |

Both options pay 25 % on the real gain; the tax gap on the page (6,290 against 7,243) was the gemel's fee lowering its taxable gain while Leumi's custody fee, paid by selling units, does not except in the exit year (TXS-06). The gemel's 0.8 % is Meitav's list price; the regulator reports 0.39 % to 0.71 % on S&P 500 gemel tracks (2026-09), and even at 0.4 % the account at One Zero or Psagot stays ahead. A foreign broker (Interactive Israel) is not priced: its commission page was unreadable; on the method's own numbers an Irish S&P ETF abroad at zero commissions lands between the gemel and the Israeli fund at a cheap Israeli broker, because the tax index becomes the dollar rate (TXF-03).

**Fixed the same evening (method F-80, docs/parameters-rationale.md):** the comparison prices the securities account on the collected list tariff that leaves the goal the most and names it as the site's pick; the headline carries the tariff's name; a tax gap that is a fee effect says so with the TXS-06 chip; a tie-breaking move reads "התיקו נשבר אם … ראשונה לבדה" and a fee row names the option. **Still open:** a second list price for the gemel lehashkaa (only Meitav's is collected); Interactive Israel's tariff; exposure mode and holdings still run the brokerage on P-05's tariff.


**The fee page, later the same evening (the founder's screenshot of Doron's securities-account fees: "every legend item has the same colour").** The fee-drag chart drew its bands in four steps of the orange ramp, validated only as an ordinal ramp; as a legend of identities they failed the dataviz validator (adjacent pairs ΔE 8.1), the total line shared the largest band's swatch, the FX line with no cost took a band and a label, and the two-line direct labels overlapped. Fixed: the four fee slots are four clearly different hues (orange, gold, teal, magenta; a first warm-only set drew "why use similar colors" from the founder; design-system 2.3), the total line is neutral, a fee with no cost over the horizon has no band, and every fee kind has a one-line short name. The same slots colour the providers page's cost-by-type bars and cumulative-cost lines.
