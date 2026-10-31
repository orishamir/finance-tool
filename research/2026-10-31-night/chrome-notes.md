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
