# Israeli index funds: TA-35, TA-90, TA-125, S&P 500, NASDAQ-100, MSCI World, MSCI ACWI

Collected 2026-10-25 by R-funds (data-update skill), for the founder's question whether the site considers Israeli tracking funds and ETFs (קרנות מחקות, קרנות סל), including those that use swaps.

## What was done

- **36 new fund records** in `data/funds/<id>@2026-10-25.json`: 5 TA-35, 6 TA-90 (the five largest plus the largest open tracking fund), 5 TA-125, 5 NASDAQ-100, 5 S&P 500, 5 MSCI World, 5 MSCI ACWI. "הראל מחקה (4A) ת"א 35" (5130661) is among them.
- **9 new snapshots** of the existing Israeli index records (1143718, 1148162, 1201656, 1218916, 5124482, 5127527, 5129275, 5139100, 5139282), dated 2026-10-25, that add the replication method to `legal_form` and a note to the tracking-difference value. Every other value is unchanged and keeps its original `checked` date. The iShares CSPX record (ie00b5bmr087) already says "Physical Replication" from its factsheet, so it got no new snapshot.
- **5 new exposures** in `data/instruments/exposures/`: `index-ta35`, `index-ta90`, `index-nasdaq100`, `index-msci-world`, `index-msci-acwi`. The `variants` of `index-sp500` and `index-ta125` now include the new funds.
- `npm run validate`: `data/ is valid`. Its warnings are only about rule files, none about funds or exposures.

## Sources and method

- **Choosing the candidates.** Maya's fund search API (`maya.tase.co.il/api/v1/funds/autocomplete`, then `/funds/etf/<id>` or `/funds/mutual/<id>`) was searched with several terms per index and with each manager's name. Only funds of type "קרן מחקה" or "קרן סל" whose reference asset on Maya is the plain index at 100% were kept, with or without the dollar. Leveraged, short, equal-weight, kosher-only and active funds were dropped. The autocomplete returns at most 100 hits per query, so a fund could have been missed. Nothing from these lists is stored in the repo (CAT-43); only the chosen funds' own records are.
- **Size for ranking.** Two different published measures had to be combined:
  - ETFs: Maya gives no net assets for an ETF, so TASE's "שווי שוק" (market value) on the security page was used (`api.tase.co.il/api/company/securitydata`, 23/10/2026).
  - Open tracking funds: Maya's "שווי נכסים" (net assets, 30/09/2026).
  - The two differ in measure and date, so ranks close to each other could swap. Each record states its size and source in `legal_form`; the engine does not use it.
- **Fees.** Fixed management fee, variable management fee and trustee fee are taken from each fund's latest annual report on Maya, with the page cited. Reports for TA indices are as of 30.06.2026; reports for foreign indices are as of 31.12.2025. All 36 matched Maya's fund page on 2026-10-25. Where a report prints a later change, the current rate is stored with `effective_from`: 5128905 variable fee 0.2% from 01.01.2026, 5124573 0.30% from 01.01.2026, 5140165 0.30% from 1.1.26. Trustee rises announced for 1.1.2027 (1148931, 1148899, 1150184, 1150283) are in the notes.
- **Replication.** Taken from each report's section "הדרך שבה הקרן תנוהל", quoted in Hebrew with its page in `legal_form` after the word `REPLICATION:`.

## Per index

Notes for the tables:
- Size is in million NIS. "E" is an ETF, sized by TASE market value on 23/10/2026. "T" is an open tracking fund, sized by Maya net assets on 30/09/2026.
- Fees are fixed / variable / trustee, in % a year.
- "Fund vs index" is the fund's return against its tracking asset, as the report prints it. For TA indices it is the 12 months 01.07.2025 to 30.06.2026; for foreign indices it is calendar 2025. The difference is not computed (data-update rule).

### TA-35 (all physical)

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index |
|---|---|---|---|---|---|---|
| 1 | 1146570 קסם ETF ת"א 35 | 5,015.7 E | new | 0.25 / 0.10 / 0.01 | physical + synthetic contracts | 37.09% vs 37.45% |
| 2 | 1143700 תכלית סל ת"א 35 | 3,137.1 E | new | 0.25 / 0.10 / 0.02 | physical + options | 37.08% vs 37.45% |
| 3 | 1148907 הראל סל ת"א 35 | 2,020.9 E | new | 0.25 / 0.10 / 0.008 | shares and/or index options | 37.10% vs 37.45% |
| 4 | 5130661 הראל מחקה ת"א 35 | 1,997.2 T | new | 0 / 0.05 / 0.02 | shares and/or index options | 37.45% vs 37.45% |
| 5 | 1150184 MTF סל ת"א 35 | 1,405.5 E | new | 0.24 / 0.10 / 0.005 | shares and/or index options | 37.12% vs 37.45% |

Not recorded (by size): 1194380 מור סל 964.0 E; 5109897 MTF מחקה 790.9 T; 5124490 קסם KTF 743.4 T; 5130687 אי.בי.אי מחקה 395.9 T; 1225994 אי.בי.אי סל 234.9 E; 5109418 תכלית TTF 186.5 T; 5101506 מור מחקה 157.6 T; 5142419 אלטשולר שחם מחקה 50.8 T; 5143151 ילין לפידות מחקה (no size on Maya).

### TA-90 (all physical)

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index |
|---|---|---|---|---|---|---|
| 1 | 1146331 קסם ETF ת"א 90 | 3,418.0 E | new | 0.60 / 0.10 / 0.014 | physical | 16.39% vs 17.07% |
| 2 | 1150259 MTF סל ת"א 90 | 2,965.0 E | new | 0.60 / 0.10 / 0.005 | physical | 16.36% vs 17.07% |
| 3 | 1148931 הראל סל ת"א 90 | 2,666.2 E | new | 0.60 / 0.10 / 0.0085 | shares and/or options | 16.35% vs 17.07% |
| 4 | 1143783 תכלית סל ת"א 90 | 2,307.4 E | new | 0.60 / 0.10 / 0.02 | physical | 16.34% vs 17.07% |
| 5 | 1209444 אי.בי.אי סל ת"א-90 | 1,627.5 E | new | 0.10 / 0.10 / 0.01 | physical | 16.94% vs 17.07% |
| 6 | 5130638 הראל מחקה ת"א 90 | 1,218.9 T | new (largest open fund) | 0 / 0.10 / 0.02 | physical | 17.04% vs 17.07% |

Not recorded: 1196146 מור סל 1,073.6 E; 5130620 MTF מחקה 737.1 T; 5118740 תכלית TTF 557.1 T; 5130919 אי.בי.אי מחקה 484.1 T; 5124508 קסם KTF 384.5 T; 1166172 הראל סל כשרה 170.2 E; 5115126 מור מחקה 141.5 T; 5141056 אלטשולר שחם מחקה 35.2 T.

### TA-125 (all physical)

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index |
|---|---|---|---|---|---|---|
| 1 | 1146356 קסם ETF ת"א 125 | 10,247.9 E | new | 0.25 / 0.10 / 0.01 | physical + synthetic contracts | 32.35% vs 32.70% |
| 2 | 1143718 תכלית סל ת"א 125 | 5,478.2 E | existing (new snapshot) | 0.25 / 0.10 / 0.02 | physical + options | 32.34% vs 32.70% |
| 3 | 1150283 MTF סל ת"א 125 | 5,365.0 E | new | 0.24 / 0.10 / 0.005 | shares and/or options | 32.37% vs 32.70% |
| 4 | 1148899 הראל סל ת"א 125 | 4,830.4 E | new | 0.25 / 0.10 / 0.0085 | shares and/or options | 32.36% vs 32.70% |
| 5 | 1148808 אי.בי.אי סל ת"א 125 | 3,362.8 E | new | 0.35 / 0.10 / 0.008 | physical | 32.22% vs 32.70% |
| 6 | 5112628 אי.בי.אי מחקה ת"א 125 | 2,506.3 T | new (largest open fund) | 0.10 / 0 / 0.025 | physical | 32.60% vs 32.70% |

Not recorded: 5109889 MTF מחקה 2,378.1 T; 5114657 תכלית TTF 2,266.5 T; 5122510 הראל מחקה 2,077.8 T; 1196153 מור סל 1,930.3 E; 5113345 קסם KTF 1,573.1 T; kosher ETFs 1155324 (892.1) and 1155365 (849.1).

### NASDAQ-100 (all derivatives)

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index, 2025 |
|---|---|---|---|---|---|---|
| 1 | 1165844 מור סל NASDAQ 100 מנוטרלת מט"ח | 1,969.6 E | new | 0.10 / 0.30 / 0.02 | swap, FX hedged | 18.19% vs 20.77% (USD index) |
| 2 | 5128905 קסם NASDAQ 100 KTF | 1,915.1 T | new | 0 / 0.20 / 0.025 | futures + swaps | 5.85% vs 5.52% |
| 3 | 5129283 הראל מחקה NASDAQ 100 | 1,673.9 T | new | 0 / 0.10 / 0.025 | mainly unfunded swaps and/or futures | 5.67% vs 5.52% |
| 4 | 1146505 קסם NASDAQ 100 ETF | 1,506.8 E | new | 0.59 / 0.30 / 0.03 | futures + swaps | 4.97% vs 5.52% |
| 5 | 1143734 תכלית סל NASDAQ 100 מנוטרלת מט"ח | 1,371.6 E | new | 0.80 / 0.30 / 0.03 | futures + unfunded swaps, FX hedged | 17.32% vs 20.77% (USD index) |

Not recorded: 5134549 MTF מחקה hedged 1,339.5 T; 1146612 קסם ETF hedged 1,308.2 E; 5133574 הראל מחקה hedged 1,153.9 T; 5123179 תכלית TTF hedged 1,121.9 T; 5131644 אי.בי.אי מחקה hedged 1,029.1 T; 1181445 MTF סל hedged 1,028.7 E; 5127766 אי.בי.אי מחקה 864.4 T; 5134531 MTF מחקה 816.5 T; 5117585 מור מחקה 789.1 T.

### S&P 500 (all derivatives)

The five largest had no record, so all five are new. The existing records rank 6th (1148162 IBI, 5,911.6 E) and 7th (5124482 Kesem KTF, 4,341.1 T) and below.

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index, 2025 |
|---|---|---|---|---|---|---|
| 1 | 1144385 תכלית סל S&P 500 | 9,636.1 E | new | 0.70 / 0.30 / 0.03 | futures, unfunded swaps, forwards | 2.14% vs 2.61% |
| 2 | 1149020 הראל סל S&P 500 | 8,267.4 E | new | 0.60 / 0.30 / 0.008 | mainly unfunded swaps and/or futures | 2.28% vs 2.61% |
| 3 | 1146471 קסם S&P 500 ETF | 7,950.3 E | new | 0.60 / 0.30 / 0.03 | futures + swaps | 2.18% vs 2.61% |
| 4 | 1165810 מור סל S&P 500 | 7,340.4 E | new | 0.10 / 0.30 / 0.02 | swaps | 2.59% vs 2.61% |
| 5 | 1150333 MTF סל S&P 500 | 6,731.6 E | new | 0.25 / 0.30 / 0.03 | mainly unfunded swaps | 2.39% vs 2.61% |

Replication added to the existing S&P 500 records:
- mainly OTC derivatives: IBI 1148162;
- mainly unfunded swaps: Yelin Lapidot 1201656 and 5139282;
- futures and swaps: ATF 1218916 and Kesem 5124482;
- unfunded swaps and/or futures: Harel 5127527 and 5129275;
- derivatives including futures, swaps and forwards: Altshuler Shaham 5139100;
- physical: CSPX, already recorded.

### World indices

Israeli funds track **MSCI World** and **MSCI ACWI (AC World)**. No Israeli tracking fund or ETF on FTSE All-World was found. "S&P World" appears only as the benchmark of an active fund.

**MSCI World** (all swaps; the market is small and mostly open tracking funds):

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index |
|---|---|---|---|---|---|---|
| 1 | 5122569 MTF מחקה MSCI World | 571.7 T | new | 0.25 / 0.30 / 0.02 | mainly unfunded swaps | 2025 4.68% vs 4.96% |
| 2 | 5124573 תכלית MSCI WORLD TTF | 374.2 T | new | 0.31 / 0.30 / 0.03 | unfunded swaps, forwards, ETFs | 2025 5.43% vs 4.96% |
| 3 | 5139696 קסם KTF MSCI World מנוטרלת דולר | 204.1 T | new | 0 / 0.30 / 0.03 | swaps, FX hedged | 2025 18.20% vs 20.32% |
| 4 | 5140165 MTF מחקה MSCI World מנוטרלת דולר | 117.9 T | new | 0 / 0.30 / 0.03 | mainly unfunded swaps, hedged | 23.4.25-31.12.25 24.14% vs 27.19% |
| 5 | 1145804 קסם MSCI World ETF | 64.4 E | new | 0.83 / 0.30 / 0.03 | swaps | 2025 4.05% vs 4.96% |

Not recorded: 1143866 תכלית סל hedged 54.6 E; 1147073 קסם ETF hedged 36.7 E.

**MSCI ACWI** (all derivatives):

| Rank | Fund | Size | Record | Fees | Replication | Fund vs index, 2025 |
|---|---|---|---|---|---|---|
| 1 | 1149772 אי.בי.אי סל MSCI AC World | 645.4 E | new | 0.80 / 0.15 / 0.02 | mainly OTC derivatives | 5.27% vs 6.01% |
| 2 | 1144237 תכלית סל MSCI AC World | 401.3 E | new | 1.00 / 0.30 / 0.03 | futures, unfunded swaps, forwards | 5.18% vs 6.01% |
| 3 | 1201003 MTF סל MSCI AC World | 302.2 E | new | 0.17 / 0.30 / 0.03 | mainly an unfunded swap | 5.81% vs 6.01% |
| 4 | 1147362 קסם MSCI AC World ETF מנוטרלת דולר | 300.7 E | new | 0.22 / 0.30 / 0.03 | swaps, FX hedged | 19.06% vs 21.52% (USD index) |
| 5 | 1144336 תכלית סל MSCI AC World מנוטרלת דולר | 284.7 E | new | 0.60 / 0.30 / 0.03 | unfunded swaps + ETFs, FX hedged | 18.61% vs 21.52% (USD index) |

Not recorded: 1150200 הראל סל hedged 283.4 E; 1149335 הראל סל 255.9 E; 5135330 קסם KTF 174.0 T; 1146679 קסם ETF 169.4 E; 1176031 MTF סל hedged 133.8 E; 5139605 אי.בי.אי מחקה 86.4 T.

### What the printed figures show, without computing

- **TA indices.** Every fund holds the shares, with options at most. Open tracking funds with no fixed fee came out at or near the index over the 12 months: Harel TA-35 37.45% against 37.45%, Harel TA-90 17.04% against 17.07%, IBI TA-125 32.60% against 32.70%. The large ETFs printed about a third to two thirds of a point less.
- **Foreign indices.** The swap and futures funds with a 0% fixed fee printed returns above the unhedged index in 2025:
  - Kesem NASDAQ KTF 5.85% against 5.52%;
  - Harel NASDAQ 5.67% against 5.52%;
  - Tachlit MSCI World TTF 5.43% against 4.96%;
  - earlier records: Kesem S&P KTF 2.98% against 2.61%, Yelin Lapidot tracking fund 2.98% against 2.61%.
- **Founder's point.** This is the swap advantage the founder pointed to. The tracking asset is a net-of-withholding index (NTR), and the report of Yelin Lapidot 5139282 credits the excess to derivatives exposure (ETF-09).
- **Hedged variants.** They printed 2 to 3.5 points below the dollar index in 2025, which includes the cost of the currency hedge.
- **How the engine sees this.** The engine sees none of it while the tracking difference stays null: A-07 defaults to 0 (see below).

## What was not found or not stored

1. **The 12-month tracking difference (A-07) is null in all 45 Israeli records.** No annual report prints it as one number. Each report points to a third-party page for it: `chart.bursagraph.co.il/funds.shtml?m=…` or `fundscenter.co.il/funds.shtml?m=…`, the "Funds Center" platform by Guideline that the managers use to meet ETF-07(e). That page was read; for example, it shows the 12-month tracking difference and the tracking error by fund with the date 22/10/2026. Its page says: "אין להפיץ בכל דרך כלשהי או לְמַסְחֵר (להפיק רווח) את הנתונים המוצגים באתר". Like TASE's lists under CAT-43, its figures were not copied into the repo. **Founder decision needed:** may the site show those figures (non-commercial, a few people), or should A-07 come from the annual reports' side-by-side returns, which the records already carry in the notes, through a defined computation in `docs/method.md`?
2. **Median bid-ask spread: null for all ETFs.** It is not printed in the reports. The same Funds Center page publishes it under ETF-07(b), under the same terms, and the column was empty in the static table read.
3. **Prospectuses.** The current prospectus is on Magna, which returns 403 to scripts, so it was not opened. Each record cites the annual report, which states the prospectus date and Magna reference. Maya's "lastProspectusReportId" is the fund's original offer document from years ago, so it was not used.
4. **English names.** Not collected (`names.en` is empty).
5. **Hebrew names.** Maya's long names for some Kesem and MTF funds have their parentheses in a visibly garbled bidi order, for example "קסם 4A) ETF) ת"א 35" and "MTF סל (S&P 500 (4D". They are stored as Maya prints them, beside Maya's short name, which is clean. Term matching may need to ignore parentheses.
6. **Candidates the search could miss.** Maya's autocomplete caps each query at 100 hits. Several terms and per-manager queries were used, but a small fund could still be missing from the lists above.

## Conflicts and doubts

- **1148162 (IBI S&P 500 ETF), trustee fee.** The existing record stores 0.015% from 01.07.2026, as the report announced. Maya's fund API on 2026-10-25 shows 0.0085%. That value was not changed (it is outside this task); the lead should re-check it.
- **Ranking measures.** ETF market value (TASE, 23/10/2026) is ranked against open-fund net assets (Maya, 30/09/2026). A different measure or date could swap neighbours, for example TA-35 ranks 3 and 4: 2,020.9 E against 1,997.2 T.
- **5139696.** The name says "מנוטרלת דולר", but the exposure code is 4D. Maya's tracking asset is MSCI World without the dollar, so it is treated as hedged.
- **`distribution_policy`.** It is "accumulating" for all, following the existing records. Maya says "לא מתחייבת לחלק תשלומים" (no commitment to distribute) for most; IBI ETFs say "קרן צבירה - מתחייבת לא לחלק". The exact wording is in each `legal_form`.

## Schema needs (not changed: `packages/` is outside this task)

- **A replication field** on `fundRecord`: an enum `physical | swap | futures | mixed`, plus the source page. Today it lives as free text after `REPLICATION:` in `legal_form`, which the engine cannot read.
- **Optionally, a sourced size field** (net assets or market value, with date) if the site should show the fund's size.
- **Optionally, structured "fund vs tracking asset" figures** (period, fund return, tracking-asset return), if the founder chooses the annual-report route for A-07.

## What the lead must wire

- **Site.** The five new exposures (`index-ta35`, `index-ta90`, `index-nasdaq100`, `index-msci-world`, `index-msci-acwi`) need the site wiring each exposure has: guide page, lists and comparison entry points. `site/` was not touched.
- **Rules.** The new exposures' `rule_ids` hold only existing generic rules: ETF, TXS and CAT-10 for all; ETF-35 and ETF-36 for the TASE indices; ETF-10 and TXS-14/15 for the foreign ones. The index rules R-index is writing (TA-35, TA-90, NASDAQ-100, MSCI World, MSCI ACWI) still need linking. No `open_questions` were set.
- **Wrappers.** `wrapper_ids` are brokerage-account, ira-hishtalmut and ira-provident, as on `index-ta125`. The provident wrappers that `index-sp500` lists were not claimed for the new indices, because no source was read for them.
- **Hebrew copy.** The `one_line_he` lines of the five exposures are new Hebrew copy, drawn from the index descriptions in the reports. They should go through the Hebrew review.
- **Tracking difference.** The founder's tracking-difference decision (item 1 above) decides whether the swap advantage reaches the comparison.
