# What the lead read in Chrome, 2026-10-31 night

Read with the page open normally; no check was completed. A page that showed a check is listed as skipped. Figures are as printed on the page, on the date the page states.

## Hapoalim

**Standard contracts page** (https://www.bankhapoalim.co.il/standard-contract) opens, and its links under `/api/media/` download by plain curl, unlike the addresses job 4 tried. Filed: general terms for an adult `5164629834e3d870` (68 pages, edition 09.23 by its file name), securities and foreign securities chapters `7f80485c391113cb` (10 pages), further securities instructions `26b5b237d3abb937` (6 pages), flexible savings `cc4db5c54a19e635`, growing savings `530208756e1866f1`. So Hapoalim's terms are no longer blocked; they are filed and not yet read for the topics of job 4.

**Tariff:** see "Hapoalim's tariff, settled" below.

**Deposit rates** (https://www.bankhapoalim.co.il/forms/he/savings/deposit-interest; the page says "המידע נכון ל-01.11.2026 ולפני חישוב מס במקור"). The usual deposits, no break: one year fixed 1.74%, one year variable 2.19% (prime minus 2.56), two years fixed 3%, two years variable 2.24% (prime minus 2.51), three years fixed 2.5%. Savings plans on the second table: חיסכון גמיש, variable, standing order, 0.14% (prime minus 4.61); חיסכון צומח לעתיד, fixed, standing order, "לאחר 12 חודשים - 2.4%"; WIN WIN one year 2.35%, two years 2.45%, three 2.6%, four 2.7%; מנצח 13 months 2.5%, 15 months 2.75%; חיסכון מניב five years 2.58%; שיקלי לכל עת from 25 months 2.27% up to 180 months 3.6%; חיסכון מדדי לכל עת from 25 months 1.09% up to 180 months 2.15%; חיסכון משלם שקלי from 24 months 2.2% up to 108 months 2.92%; שיקלי לצעד הבא after 36 months 2.4%. A row for bit customers (כיס פיקדון) has higher rates, 3.1% to 3.25%, "פיקדון ללקוחות ביט בלבד". "לא מוצעת ריבית על יתרת זכות בחשבון".

## First International ([issue 95](https://github.com/orishamir/finance-tool/issues/95))

https://www.fibi.co.il/private/depositsandsavings/interest/ links to https://online.fibi.co.il/appsng/Resources/PortalNG/deposits-details/#/details/31, which opens. "הנתונים נכונים לתאריך 01/11/2026 והינם לפני חישוב וניכוי מס", "שיעור הפריים (P) הנוכחי הינו 4.75% לשנה".

Section "פיקדון לשנה", not linked to the index, no break (rate offered, then the usual-deposit rate):

| Row | Rate type | Amount, NIS | Exit points | Offered | Usual |
| --- | --- | --- | --- | --- | --- |
| איתן | fixed | 1,000 to 249,999 | none | 1.85% | 1.85% |
| איתן | fixed | 250,000 and up | none | 1.95% | 3.50% |
| גלבוע קבועה שנה | fixed | 10,000 to 249,999 | withdrawal on 33 days' notice | 1.75% | 1.75% |
| גלבוע קבועה שנה | fixed | 250,000 to 4,999,999 | same | 1.85% | 1.85% |
| גלבוע קבועה שנה | fixed | 5,000,000 and up | same | 2.40% | 2.40% |
| כפיר שנה תחנות | fixed | 10,000 to 249,999 | none printed | 1.50% | 3.00% |
| משתנה שנה ומעלה | variable, prime minus 2.7 | 10,000 to 250,000 | none | 2.05% | prime minus 2.7 |
| משתנה שנה ומעלה | variable, prime minus 2.6 | 250,001 and up | none | 2.15% | prime minus 2.6 |
| לביא משתנה לשנה | variable, prime minus 2.6 | 1,000 and up | none | 2.15% | prime minus 1.75 |
| ארגמן שנה נזיל | variable, prime minus 2.3 | 1,000 and up | liquid, exit points not copied | 2.45% | prime minus 2 |

The plain one-year rows comparable to the records of the other banks are איתן (fixed, 1.85%) and משתנה שנה ומעלה (variable, 2.05%). Current account: "תשלום ריבית על יתרות זכות בעו"ש ללקוחות פרטיים", fixed, 2%, on its own conditions.

## Hapoalim's tariff, settled ([issue 39](https://github.com/orishamir/finance-tool/issues/39))

The file addresses under `/sites/default/files/media/PDFS/Taarifon/` answer plain curl with a browser's name, though Chrome got a refusal page on the PDF and the earlier line above used the wrong path. Filed: the sheet `e939af51e5b97376` (one sheet, 2,296 rows, dated 05.10.2026) and its PDF twin `40bd62035edbad6f` (a font with no text mapping, so its text is unreadable; read the sheet). Row 947: "קניה מכירה ופדיון של ני"ע הנסחרים בבורסה של ת"א", 0.60%, minimum 26.00, maximum 7,500.00. Row 958, note (05): "למעט קרנות נאמנות ... אך לרבות "קרן מחקה"". Row 93 (benefits annex): direct channel 0.40%, minimum 20, maximum 7,000. All match `data/fees/hapoalim@2026-10-31.json`. Row 981: securities custody 0.15% a quarter, ceiling 10,600 per security, also as recorded. Hapoalim's one-year deposits on the page dated 01.11.2026 (1.74%, prime minus 2.56) equal the records dated 26.10.2026.

The six spreadsheets in the library had no text; each now has a text copy with "שורה n" before each row, so they are searchable (Hapoalim, Yahav's `5a675100ac5dc956`, Leumi's `c3c577471efe712d`, Discount's `22d38d417b066922`, Jerusalem's `43f072a68f52d203` and `ce9cc8e070981b3b`).

## Massad

Rates page https://online.bankmassad.co.il/appsng/Resources/PortalNG/deposits-details/#/details/46 (linked from /private/depositsandsavings/interestratesondeposits/), the same application as First International: "הנתונים נכונים לתאריך 01/11/2026 והינם לפני חישוב וניכוי מס", prime 4.75%. "לא מוצעת ריבית על יתרת זכות בחשבון".

One-year rows, no index link: משתנה שנה ומעלה prime minus 2.7 (2.05%) from 10,000, no exit points; גלבוע קבועה שנה 1.75% (10,000 to 249,999), 1.85% above, withdrawal on 33 days' notice; גלבוע משתנה שנה prime minus 2.85 (1.90%), prime minus 2.75 (2.00%) from 250,000; כפיר שנה תחנות 1.50%, 1.60% from 250,000; אדיר שנה תחנות 1.50%, 1.60%, exit every three months; פולג משתנה לשנה prime minus 3.2 (1.55%); גולן משתנה לשנה prime minus 3.3 (1.45%), exit weekly; צמוד מדד לשנה 0.50%, 0.80% from 250,000.

Standing-order plans (`#/details/46/4`): חסכון גמיש variable, from 200, monthly exit, prime minus 4 (0.75%); אופק להשתלמות variable, from 100, exit after two years and each year after, prime minus 2 (2.75%); מנוף פיננסי and מנוף גמיש fixed, index-linked, from 100, 0.01% for the first period.

Massad's securities chapter C: `https://www.bankmassad.co.il/media/r1vmkylx/` (the file name is in the morning report); curl gets a check page, so it needs saving from a browser.

## Bank of Jerusalem

https://www.bankjerusalem.co.il/deposits-savings and its product pages open in Chrome. The pages print no date. /deposits-savings/nis-renewing-deposit: מאדים one year variable 3.45% "p-1.4%"; מאדים one year fixed 3.25%. /deposits-savings/monthly-deposit-savings-plan: ירח five years with exit points variable 3.1% "P-1.65%"; ירח 18 years index-linked fixed 1.5%. Note: 3.45% and prime minus 1.4 differ by 0.1 from First International's stated prime of 4.75%, so one of them is stale; the page does not say which. Not fit for a record until a dated copy is read. The bank's dated list under the Bank of Israel's publication rule was not looked for. /deposits-savings/shemesh-deposit and /interest-option-deposit print no rate.

## One Zero

Footer links, opened in Chrome: standard contracts /company/information/114, capital market documents /company/information/5681, deposit and rate table "תנאי פקדונות" https://www.onezerobank.com/warehouse/userUploadFiles/Image/ONE%20ZERO%20-%20Savings%20_accessible.pdf , money-market fund details https://www.onezerobank.com/warehouse/userUploadFiles/Image/table_%20October%202026_accessible.pdf , general terms https://www.onezerobank.com/warehouse/userUploadFiles/Image/One%20Zero%20General%20terms%20and%20conditions_output%20(3)%20(1).pdf . Scripts get 403 on these, so they go on the list of files to save from a browser.

The rate table, one page, undated: חיסכון יומי variable, 10 NIS to 1 million, exit every business day, no break penalty, prime minus 4 (0.75%). חיסכון חודשי variable, 100 NIS to 1 million, exit monthly, break keeps 10% of the accrued interest, prime minus 2.25 (2.50%). חיסכון שנתי בריבית משתנה one year, renews once, same break, prime minus 1.5 (3.25%). חיסכון שנתי בריבית קבועה * one year, 100 NIS to 100,000, same break, 3%. Its note: new joiners to 31.12.26, up to 100,000 NIS, a 3% bonus on top of the 3% base if each month in 9 of 12 they move a salary of at least 10,000 NIS net and charge at least 2,000 NIS on the bank's credit cards. No savings plan by standing order appears.

## Mizrahi-Tefahot

https://www.mizrahi-tefahot.co.il/about-mizrahi-tefahot-he/disclosure-links/deposits-interest-rates/ opens but shows a filter with no table until one is chosen; "ענבים" is not on the page as loaded. Not read further: the plain one-year records exist, and the plans can wait for the guide that needs them.

## TASE's list of foreign funds

https://market.tase.co.il/he/market_data/f-etfs opens in Chrome, "נכון ל- 30/10/2026", "סה"כ 40 רשומות". All 40 lines are iShares or Invesco: no Vanguard line and no iShares MSCI World line. The list cannot be republished, so only the lines that bear on tonight's records: iShares S&P 500 01159250, iShares NASDAQ 100 01159243, iShares MSCI AC World 01159235 (these three match BlackRock's brochure `5fae6c1d0933c1bc` p.1); Invesco S&P 500 01183441, Invesco NASDAQ 100 Swap 01186063, Invesco MSCI World 01185164, Invesco FTSE All World 01209220.

TASE's security pages open in Chrome at `https://market.tase.co.il/he/market_data/security/<number>/major_data` and print "דמי ניהול (%)"; all units in US dollars, all under the European directive; no ISIN on the page. Read 2026-10-31: Invesco S&P 500 01183441 0.05; Invesco NASDAQ 100 Swap 01186063 0.2; Invesco MSCI World 01185164 0.05; Invesco FTSE All World 01209220 0.15; iShares S&P 500 01159250 0.07; iShares NASDAQ 100 01159243 0.3; iShares MSCI AC World 01159235 0.2. The three iShares figures match the issuer's records from job 3. The Invesco figures are not yet compared with Invesco's own key information documents (not read: the links answer 406 to scripts), so treat 0.05% on MSCI World as unconfirmed until then. Guessed paths `/fund/` and `/mutual_fund/` do not exist on this site.

## Money-market fund fee pages ([issue 91](https://github.com/orishamir/finance-tool/issues/91))

Harel: https://www.harel-group.co.il/investments/mutual-funds answers "הגישה נדחתה" in Chrome (the path was a guess; skipped). 5127790 is "הראל כספית מגמת ריבית" by Leumi's page `6ff0a4ddc9e738c6`. Yalin Lapidot: https://www.yl-invest.co.il/קרנות-נאמנות-מנוהלות/ opens; its text has neither 5139258 nor 5141452, and its fund links go to Maya, which refuses automated browsing. So these fees wait on the founder's hand at Maya, unless the prospectus already filed settles them.

Other pages: Yahav's clients-agreements answers "Request Rejected" (skipped). https://www.boi.org.il/roles/markets/interestrates/ is a 404, a wrong guess and not a block.

The filed prospectus of Yalin Lapidot's money-market fund 5139258 (`337dea8fad898d27`, dated 26 November 2024) p.1 gives the manager's fee as 0.12% and the trustee's as 0.01%, no load; footnote 4 says the manager may raise it on 1 January 2026. Leumi's page (`6ff0a4ddc9e738c6` p.1) shows 0.19% for the same fund. So the prospectus does not settle today's fee: a rise on that date would explain the gap, and that is not checked. The fund's current annual or immediate report is on Maya.

## The Securities Authority's fund report

https://www.new.isa.gov.il/nav-index/supervised-mutualfunds/mutualfundsActivities opens in Chrome and links to the reports, which curl fetches. Filed: 2025 `3066e83c8398e3c3`, 2024 `14b296eb56570779`. It does not rank single funds: every table is by kind of fund, and no fund is named. Table 2 (p.14, checked against the page image, 2025, simple average then weighted): shekel money-market funds 0.14%, 0.16%; open tracking funds on foreign shares 0.47%, 0.24%; on Israeli shares 0.29%, 0.21%; ETFs on foreign shares 0.59%, 0.50%; on Israeli shares 0.37%, 0.40%; active funds on foreign shares 1.68%, 1.68%; on Israeli shares 1.54%, 1.63%. P.13: "העלאות דמי ניהול מבוצעות ביום הראשון של השנה בלבד"; cuts can come at any time. P.2: 2,444 funds, about 757 billion NIS at the end of 2025. This is a general source for the fund guides: a figure about the market from the regulator, no company's.

## The Bank of Israel's comparison of rates actually paid

https://www.boi.org.il/information/bank-paymnts/financial-education/campaigns/boi-equator/deposit/ opens in Chrome; its chart is drawn by a script, but "כאן" links to https://www.boi.org.il/boi_files/Pikuah/g060a.xls , which curl fetches (it is an xlsx file under an .xls name). Filed: `24b1ea7836362c4b`. Monthly, June 2024 to September 2026, per bank (all ten that report, One Zero included), by term. Banks report under section 16יא of the Banking (Service to Customer) Law; the page says the rate assumes no early exit, households without private banking, and no rate is shown for fewer than 10 deposits or under 5% of deposits (the sheet writes 0).

September 2026, fixed, unindexed, average actually given:

| Term | Hapoalim | Leumi | Discount | Mizrahi | First International | Yahav | Mercantile | Massad | Jerusalem | One Zero | All banks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 months to a year | 3.77 | 3.66 | 3.51 | 3.30 | 3.30 | 2.91 | 2.90 | 2.79 | 3.71 | 6.00 | 3.54 |
| A year to two years | 2.83 | 3.86 | 2.43 | 3.35 | 3.29 | 3.70 | 3.18 | 3.15 | 3.73 | not shown | 3.22 |

Variable, September 2026: 6 months to a year, Leumi 2.00, Discount 2.85, Mizrahi 3.30, First International 1.63, Mercantile 2.75, Massad 1.92, Jerusalem 3.44, One Zero 3.28, all banks 2.20.

Why it matters: Hapoalim's page dated 01.11.2026 offers 1.74% fixed for a year and First International's 1.85%, while the same banks gave households 2.83% to 3.77% and 3.29% to 3.30% on average in September. The sheet is an average over deposits of every size and the months differ, so this is not a like-for-like gap, and whether a deposit of exactly one year falls in the first band or the second is not stated. But it says the published rate is not what depositors got. One Zero's 6.00 fits the 3% bonus on its fixed one-year saving. Nothing on the site uses this sheet yet; `data/` has no record of it, and a screen needs a mockup.

## Form 747 and the government bonds page (2026-10-31)

Form 747, read in Chrome on https://www.gov.il/he/service/notice-cost-declaration-for-traded-securities and then filed by plain curl from the page's own links (the attachments under `/BlobFolder/` answered at once):

- `31a616b98ccaa856` p.1, the form: for an individual only, who files returns under section 131, holding a traded security through an Israeli exchange member whose recorded cost does not match what was paid; total declared cost up to 500,000 NIS a year; resident, active tax file, must file for the year of sale and attach the form; for withholding only. Accessible copy `d601c1c6c8627b84`.
- `cbb3d775be9e3a8f` p.1, Tax Authority notice of 19 May 2025: forms 746, 747 and 748 are new; 746 and 747 replace form 938; 748 exempts from withholding on a donated security; for withholding only, not an assessment.
- The service page adds: once per tax year.

So the 500,000 NIS cap job 1 asked about is current on the form's own page. (Corrected later that night: the rule base holds no stale mention of form 938; the hit was a fund number, and `switching-and-transfers.md` already names form 747.)

Government bonds page, https://www.gov.il/he/pages/govermental-bonds, published 24.08.2020, its traded-bond table updated 02.01.2011 (four tabs: traded features, non-traded features, traded regulations, non-traded regulations). Series seen: גליל from 31.12.1984, fixed, by yields, at least 1%, annual; ממשלתית צמודה from 26.6.2006, annual; גילון חדש from 28.4.1999, variable by makam of 3 to 12 months, every 3 months, no longer issued; ממשלתית בריבית משתנה from 8.1.2008, by 12-month makam, every 3 months; שחר from 24.8.1995, annual; ממשלתית from 6.11.2006, annual. Not filed: scripts get a check on this page. It is on the morning list.

Filed as well: `d386a692cce2ad86`, the Securities Authority's own full text of the Joint Investment Trust Law with amendments to 5784, 99 pages. `447225a31c1b5b55` (the Authority's `takanon2` address) holds only the empty shell of a script-drawn page.

## Regulators' live lists, read in Chrome 2026-10-31

Job 9 could not open these by script. Both open normally in a browser.

**Securities Authority, directives to fund managers** (`/nav-index/supervised-mutualfunds/Mutual-Funds-Instructions`, three pages). Newest first: outsourcing of investment management 17.9.2026 (filed `6b4ac6bcd303de99`, not studied); "(!)" in a fund's name, new text 19.4.2026 (filed `72ea4b4036f64284`, read in full, MF-57 rewritten: the proposal of 4.8.2025 is now final); hedge-fund assets, temporary, 30.9.2025 (out of scope); managing investments in a tracking fund 9.10.2024, with nothing later, so ETF-70's proposal shows no final text on this list; custody and credit-risk disclosure 15.9.2024; return calculation 11.9.2024; money-market fund conditions 11.9.2024.

**Securities Authority, foreign traded funds approved to offer in Israel**: 37 funds, all iShares or Invesco, all Irish. Saved in `isa-foreign-funds.tsv`; rule ETF-71. No Vanguard fund and no iShares MSCI World, which agrees with the exchange's list. The list of actively managed foreign funds was not read. The foreign fund questions and answers page (`tax-foreignfunds-faq`) is about what a manager must file and holds nothing for a holder.

**Bank of Israel, conduct directives** (`/roles/supervisionregulation/nbt/`, read in full; the page says updated 25.8.2025, while its rows run to 7.10.2026). Rows dated after the archive copy job 9 used (15.12.2025): 253 temporary, 301, 311, 312, 313, 314A, 315, 323, 327, 329, 332, 336, 337, 345, 362, 366, 367 banking by communication 17.6.2026, 411 money laundering 7.10.2026, 412 sanctions 30.12.2025, 425 annual reports 21.6.2026, 470, 472, 490. Of these only 425 bears on this site's products, and the rule base already holds its version 6 (BANK-32). Directive 367 was not opened; it governs online banking and is not cited in the rule base.

**Bank of Israel, cancelled directives** (`/nbt_canceled/`): 480 on 30.6.2026, 423 track service on 21.6.2026, old 461 and 419 on 1.8.2025, and older ones. The old 461's cancellation is already in the rule base (brokerage-account). Directive 423 is not cited there, and its cancellation fits the fee rules' removal of the tracks from 1.7.2027 (bank-current-account-deposits, the tracks rule).
