# Cash rates: the Bank of Israel rate, prime, makam and money-market funds (2026-10-26)

Research only, at the founder's request ("do research without changing anything in the site"). Nothing under `site/`, `data/`, `docs/` or the rule base was changed. Everything below is staged in this folder for the founder's go.

Sources were read on 2026-10-26:
- Bank of Israel pages in the founder's Chrome;
- Bank of Israel and Knesset PDFs by curl;
- Leumi's page by curl, then in Chrome for the rows its script loads;
- Discount's page in Chrome.

No bot check was worked around: the Bank of Israel's HTML pages return a Radware check to scripts, so they were read in a normal browser. FlareSolverr was not used.

## 1. Does the site talk about prime?

Partly. Today it says:
- **BANK-25** (general): a variable-rate deposit moves with an anchor plus or minus a spread, and Directive 447 makes the bank show the anchor, the spread and the result. The directive names no anchor.
- **BANK-34** (institution): at Leumi, Hapoalim and Yahav the anchor is prime, each bank defines it itself, and Hapoalim states prime = Bank of Israel rate + 1.5%.
- **The glossary** has "ריבית משתנה (פריים)" (child savings) and "ריבית בנק ישראל".
- **The bank-deposit guide** says a prime-linked deposit is taxed as an unlinked one (TXI-04).
- **Open question BANK OQ14:** no official definition of prime was found.

What it lacks: a general statement of what prime is, and the "P−x" notation that bank tables use. Leumi's 447A page prints a deposit's rate as "P-2.70=2.05%", that is, prime 4.75% minus 2.70 points.

### Found today (narrows BANK OQ14)
- **Knesset Research and Information Center**, "השינוי בפער הריבית וברווחי הבנקים בעקבות עליית ריבית בנק ישראל" (Noam Botosh, 19.2.2023), pp. 3–4: ריבית הפריים "(מוגדרת כריבית בנק ישראל בתוספת 1.5%), שבה משתמשים בעת מתן הלוואות ללקוחות הבנקים − ובהן גם משכנתאות". URL: https://fs.knesset.gov.il/globaldocs/MMM/60df63df-bab2-ed11-8158-005056aa4246/2_60df63df-bab2-ed11-8158-005056aa4246_11_19986.pdf · general, not binding (a Knesset research paper).
- **Bank of Israel, Banking Supervision, "מערכת הבנקאות בישראל: סקירה שנתית לשנת 2023"** (21.5.2024):
  - p. 59: in variable-rate deposits "הריבית בפיקדונות אלה מורכבת מריבית עוגן (בדרך כלל ריבית הפריים) וממרווח (שיעור הפחתה מריבית העוגן), כאשר המרווח נשאר קבוע לכל אורכה של תקופת הפיקדון ואילו העוגן (שהינו חיצוני ואובייקטיבי לבנק) משתנה".
  - p. 79: "מועד עדכון ריבית הפריים משתנה בסמוך למועד השינוי בריבית בנק ישראל".

  URL: https://boi.org.il/media/32gc3dpb/ (file "מערכת-הבנקאות-בישראל-סקירה-שנתית-לשנת-2023.pdf") · general, a regulator's review, not binding.
- **Bank of Israel, Supervisor of Banks, letter "הלוואות לדיור בריבית משתנה"** (3.5.2011), p. 3: in a prime-track loan "שיעור הריבית בהלוואה מושפע מהריבית הנקבעת על ידי בנק ישראל, והוא משתנה בהתאם למנגנון שנקבע בהסכם"; the mechanism is written "(פריים+מרווח)". URL: https://www.boi.org.il/media/n5yb3vy2/201111.pdf · general.

**Reading:** prime is not set by law or by a Bank of Israel rule. A Knesset paper defines it as the Bank of Israel rate plus 1.5%. The Bank of Israel describes it as the usual anchor of variable-rate deposits, updated close to each change in its rate. Each bank's own definition stays BANK-34. "P−x" means prime minus x percentage points, fixed for the deposit's life (BoI review p. 59).

**Today's figure:** prime 4.75% is printed by Leumi ("החל מתאריך: 03.09.2026", already in `bank-product-names.md`). 3.25% + 1.5% = 4.75% agrees with the Knesset definition.

## 2. The Bank of Israel rate
- **3.25%:** "הוועדה המוניטרית החליטה ב-21/10/2026 להותיר את הריבית ללא שינוי ברמה של 3.25%" (press release 21.10.2026, https://www.boi.org.il/publications/pressreleases/21-10-26b/).
- **Next decision:** "החלטת המדיניות המוניטרית הבאה תתפרסם ביום שני, ה-23.11.2026". The 2026 schedule is at https://www.boi.org.il/roles/monetary-policy/interest-rate-dates/.

D20 keeps Bank of Israel numbers off the site until the Bank consents, so these figures are in `staged/boi-reference.json` for reference only.

## 3. Makam
- **What it is** (Bank of Israel makam page, https://www.boi.org.il/roles/markets/monetarytools/makam/): "המק"ם מונפק בכל חודש, כך שבכל נקודת זמן ישנן 12 סדרות מק"ם סחירות עד טווח של שנה".
  - Auction of 6.10.2026: series 1017 (364 days), average yield 3.21%, closing 3.23%; series 117 (91 days), average 3.12%.
  - Next issue: 3.11.2026, series 1117 (https://www.boi.org.il/boi_files/hanpaka.pdf).
  - Reference only, under D20.
- **The yields a person sees at a bank** (Leumi's 447A page, last trades 23.10.2026): the series with three months or more to redemption yield 2.99% to 3.24% gross. The page says "התשואה המוצגת היא ברוטו ואינה כוללת עמלות קניה ומכירה ומס רווחי הון". The two shortest series (9 and 37 days) show 5.35% and 3.51%; a price rounded to the agora moves a short yield a lot.
  - All 12 series: `staged/makam-leumi.json`.
  - This page is the bank's own publication under Directive 447A (BANK-15), so D22 lets the site quote a figure from it with attribution.

## 4. Money-market funds
- **Daily funds:** Leumi's 447A page lists 44 shekel and 27 FX daily funds with the management fee each manager reported.
  - Shekel fees run from 0.03% (קסם אקטיב כספית כשרה) to 0.25% (מיטב כספית). Two funds print no fee.
  - Daily funds report no expected yield (MF-34: "no expected yield exists for these funds").
  - All 71 rows: `staged/mmf-fees-leumi.jsonl`.
- **Renewing funds** (Discount's 447A page, "הנתונים נכונים לתאריך 26.10.26"):

  | Fund | Number | Next date | Expected net yield (nominal, a year) | Management fee |
  |---|---|---|---|---|
  | אלטשולר שחם כספית מתחדשת חודשי לפדיון 16/11/2026 | 1223866 | 16.11.2026 16:00 | 2.81% | 0.19% |
  | מיטב כספית מתחדשת חודשי ב- 13/11/2026 | 1220227 | 13.11.2026 16:00 | 2.75% | 0.20% |

  - The expected yield is the manager's estimate, after the management and trustee fees and before tax and bank fees (BANK-15).
  - Fund 1223866 is already the site's example for the renewing fund. Its record has no management fee (`data/funds/1223866@2026-10-23.json`, "Management fee not printed on the manager's page"); Discount's page prints 0.19%.
  - Leumi lists no renewing fund.
  - Hapoalim's page (public.bankhapoalim.co.il/ng-portals/money-market-products) showed nothing after the fund type was chosen; not read.

## 5. What it means for the site
- **The guides run money-market funds, makam and government bonds at 3.5% a year** (P-05 `cash_rate`). Its reader line says: "ערך התחלה עגול שהאתר בחר, לא ריבית שפורסמה ולא תחזית". Every current figure found today is lower:
  - the Bank of Israel rate is 3.25%;
  - makam yields about 3.0% to 3.2% gross;
  - the renewing funds expect 2.75% to 2.81% net.
- **What doesn't use it:**
  - the bank deposit and the current account run on the bank's published rate;
  - the comparison runs cash-like options on the rate the person enters (A-26, under D20).
- **Size of the gap.** On the guide's own scenario (10,000 NIS now, 500 a month, 10 years), 3.5% ends at about 85,600 NIS and 2.81% at about 82,300, a difference of about 3,400 NIS. That is about 4% of the result, on the money-market, makam and government-bond guide timelines.

## 6. Staged for the founder's go (not applied)
1. **Rule base:**
   - A general record on prime: the Knesset definition, the BoI review's description of anchor and spread, and the meaning of "P−x". BANK OQ14 is narrowed: no binding definition exists in what was read; the Knesset paper and the BoI review describe it.
   - A general line in the makam record: monthly issue, 12 tradable series up to a year (BoI makam page).
2. **Glossary:** "ריבית הפריים" and "P−x / פריים פחות", sourced to the Knesset paper and the BoI review.
3. **Data:**
   - the renewing fund 1223866's fee (0.19%) and expected net yield (2.81%, dated 26.10.2026), from Discount's 447A page;
   - a second renewing fund (1220227, Meitav);
   - fee records for the most popular daily funds from Leumi's page.
4. **Rates the cash products run on, instead of one round 3.5%:**
   - renewing fund: the fund's own expected net yield (a company's figure about its own product, plain sourced by D31);
   - makam: the yield of a series at a bank's 447A page, gross, named with the bank and date;
   - daily fund: no published expected yield exists. Either the person's entered rate, or a site parameter set from the figures above, labelled as the site's choice.
   - This changes method (P-05, F-23, F-24) and needs golden values recomputed.
5. **D20:** the Bank of Israel's policy rate is one figure in a press release, not a series. Quoting it with attribution, as D22 allows for a single published figure, would let the daily fund run on "the Bank of Israel rate minus the fund's fee" (MF-34: the ISA says these funds track the rate less costs). That is the founder's call; D20 stands until then.

## 7. The Bank of Israel's terms, re-read in a browser (2026-10-26)
- **https://www.boi.org.il/website_terms/** ("דף זה עודכן לאחרונה בתאריך: 17/02/2025"), the same date D20 read in archived copies: "אסור למשתמש להעתיק, לפרסם, להפיץ, לשדר או למכור חומר המופיע באתר זה ללא קבלת רשות הבנק מראש ובכתב". D20's reading stands.
- **Against it,** GOV-19 records that each of the 87 SECDWH series on EDGE carries "Free (free for publication)" in its "Confidentiality status" column (fetched 2026-10-26). That reads as a confidentiality class (the data are public), not as a licence that overrides the site's terms.
- **So the clean routes are:**
  - a short written request to the Bank (the founder's call; on 2026-10-23 he chose not to ask for now);
  - or D22's line for one published figure (the policy rate in a press release) quoted with attribution, also his call.

## Blocked or not read
- Bank of Israel HTML pages: Radware check for scripts (read in Chrome instead).
- Hapoalim's money-market page: no table rendered.
- No official Bank of Israel definition of prime was found. The BoI site's search returned 404 for a query URL.
