# Child savings (חיסכון לכל ילד)

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/child-savings.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (instrument guide), 3.3 (dimension checklist), 3.6 (holdings review: "whether the child-savings plan is in a chosen or default track"), 3.10 (decoder for child-savings track names); roadmap releases R1 (guide, decoder) and R3 (holdings review).
Scope: the National Insurance (NII) long-term savings plan for every child: legal basis, eligibility, deposits, grants, where the money is held, default allocation, tracks, switching, withdrawal, death, fees, statements, participating institutions. Out: tax on withdrawal and on the plan (`tax-gemel-lehashkaa-ira-child.md`, TXK); general provident fee caps, transfer rules and statement formats (`provident-family-common.md`, PF); track catalogue mechanics (`tracks-catalogue-and-decoder.md`, CAT); bank deposit rules in general (`bank-current-account-deposits.md`, BANK).

## Summary

For every child who gets child allowance, NII deposits a fixed monthly sum (NIS 58 a month in 2026, CPI-linked, frozen in 2025) until age 18. A parent can add the same amount again out of the child allowance and can turn this on or off at any time. The money goes to a child-savings investment provident fund or to a bank savings plan, as the parent chooses within six months of birth. If the parent does not choose, the money goes to a provident fund. The default track is "increased risk", unless an older sibling's choice points elsewhere. Children born from 2017 get grants at 3 and at bar/bat mitzvah age. Children born up to 2016 get a grant at 18. Everyone gets a grant at 21 if nothing was withdrawn. Withdrawal is possible from 18 with a parent's signature, and from 21 without one. NII pays the management fee until 21 (0.23% a year to provident funds). After 21 the fee comes out of the balance. Banks cannot be switched. Since January 2025 a parent can move future deposits once from a bank to a provident fund. Roughly a third of plans are in a track NII chose, not the parents.

## Rules

### CS-01 Legal basis
- Rule: The plan is set by the National Insurance Law, chapter ד (child insurance), סימן ה' "חיסכון ארוך טווח לילד", sections 74ב to 74ה. It was added by Amendment 164 (Economic Arrangements Law, Sefer HaChukim 2511, 30.11.2015). The details are in the National Insurance (Long-Term Savings for a Child) Regulations, 5777-2016 (ק"ת תשע"ז 135, signed 10 Oct 2016). NII opened the plan in January 2017.
- Conditions / exceptions: The section headings in the consolidated law list amendments תשע"ו־3, תשע"ז־9 and תשפ"ד־14 (74ב), and תשפ"ה־3 (74ה). The Wikisource copy of the regulations shows no amendments, but the default rules (CS-07) changed after 2016 (open question 3).
- Figures: none.
- Source: [National Insurance Law, Wikisource mirror](https://he.wikisource.org/wiki/חוק_הביטוח_הלאומי), sections 74ב–74ה (read from character offset 100000) · checked 2026-10-22 · primary (mirror of the law text). [NII circular 1356, 30 Nov 2016](https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf), pp. 27–30 (image of Sefer HaChukim 2511, s.28 of the amending law) and pp. 31–38 (the regulations as approved by the Knesset Finance Committee on 6 Sep 2016) · checked 2026-10-22 · primary. [Regulations, Wikisource mirror](https://he.wikisource.org/wiki/תקנות_הביטוח_הלאומי_(חיסכון_ארוך_טווח_לילד)) · checked 2026-10-22 · primary (mirror).
- Dimensions: `regulator`, `eligibility`
- Likely to change: yes. The law has been amended at least three times since 2016 (cohort grants, default fund, bank-to-provident move).

### CS-02 Who is eligible, and when deposits start and stop
- Rule: NII deposits for every child for whom child allowance (קצבת ילדים) is paid, each month, until the child turns 18. Law 74ב(א)(1): "המוסד יעביר, בעד כל ילד שמשתלמת בעדו קצבת ילדים לפי פרק זה". Law 74ב(ג): the sums are saved "בעד כל חודש לטובת הילד ועד הגיעו לגיל 18". At 18 the deposits stop.
- Conditions / exceptions: Child-allowance eligibility on NII's page: the parent is an Israeli resident (or a non-resident who meets work and permit conditions, or a guardian with a guardianship order); the child is under 18, lives in Israel, and is not married. A child abroad gets deposits only for months in which child allowance is still paid (NII FAQ). If the child allowance is offset against a parent's debt to NII, the basic deposit is not reduced or offset. The parent's extra deposit (CS-04) cannot be made until the debt is settled (NII FAQ). Historical: the plan opened in January 2017 for children who received child allowance from May 2015, with retroactive NII deposits for May 2015 to December 2016 (NII FAQ; NII 2025 report p.2).
- Figures: start of entitlement period May 2015; programme start January 2017 (historical, fixed).
- Source: law 74ב(א)(1), 74ב(ג) (Wikisource mirror, above) · checked 2026-10-22 · primary. [NII, child allowance eligibility](https://www.btl.gov.il/benefits/children/Pages/תנאי%20זכאות.aspx) · checked 2026-10-22 · primary. [NII child-savings FAQ](https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx), questions "למי נפתחת תכנית חיסכון?", the stay-abroad question and the debt-offset question · checked 2026-10-22 · primary.
- Dimensions: `eligibility`, `deposit-ceiling`
- Likely to change: no

### CS-03 NII basic monthly deposit
- Rule: NII deposits NIS 58 a month per child in 2026, on the 20th of the month (the child-allowance payment date). The amount is updated on 1 January each year by the CPI rise (regulation 12). The update was skipped on 1 January 2025, when the amount stayed at its 1 January 2024 level (law 74ה(4)).
- Conditions / exceptions: The parent cannot opt out and take the sum as allowance. NII FAQ: "האם אפשר לקבל את הכסף בקצבה ולא בתכנית חיסכון?" "לא, החיסכון הוא חיסכון חובה."
- Figures: NIS 58/month from 1 Jan 2026 (NII pages; law 74ב(א)(1) bracket "בשנת 2026, 58 ש״ח"). NIS 57/month in 2025, unchanged from 2024 because of the freeze (NII 2025 report p.1 and footnote 2). NIS 50/month at the 2017 start. CPI-linked, updated each 1 January (regulation 12: "סכום החיסכון הבסיסי יעודכן ב־1 בינואר של כל שנה, לפי שיעור עליית המדד").
- Source: [NII programme page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx) and [NII savings-amount page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/sum.aspx) ("מופקדים 58 ש"ח מדי חודש", effective 01.01.2026) · checked 2026-10-22 · primary. Law 74ב(א)(1), 74ה(4) (Wikisource mirror) · checked 2026-10-22 · primary. Regulation 12 (Wikisource mirror) · checked 2026-10-22 · primary. [NII Research, "חיסכון ארוך-טווח לכל ילד וילדה – דוח הביטוח הלאומי לשנת 2025", 28 Jul 2026](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), p.1 · checked 2026-10-22 · primary.
- Dimensions: `deposit-ceiling`, `real-vs-nominal`
- Likely to change: yes. Re-set every 1 January. The 2025 freeze shows the update can be suspended by law.

### CS-04 Parental addition from the child allowance ("doubling")
- Rule: A parent can tell NII to take a further NIS 58 a month (2026) out of that child's allowance and deposit it in the plan, so NIS 116 a month goes in. The addition can be cancelled at any time. A start or a cancellation takes effect from the month after the request. It is done only through NII (website, or call centre *6050), not through the fund or bank.
- Conditions / exceptions: The parent cannot deposit any other money. Regulation 2: "בחשבונות אלה לא יהיה ניתן להפקיד סכומים נוספים על אלה שיופקדו על ידי המוסד". NII FAQ: "לא ניתן לחסוך לילד את כל סכום קצבת הילדים או להוסיף כספים באופן עצמאי". Harel bylaw s.8: deposits are made by NII only. Only the parent who receives the child allowance can turn the addition on or off (NII FAQ, divorced-parents question). It is blocked while the allowance is being offset for a debt (CS-02). The law lets a parent direct "all or part" of the allowance (74ב(א)(2)). The amount is fixed by a Finance Minister order (74ב(א)(3)), and NII's pages give only the NIS 58 figure. No source found says whether a late choice can be made up retroactively (open question 15).
- Figures: NIS 58/month in 2026 (NIS 57 in 2025). Updated each 1 January by the CPI from 2017 (74ב(א)(2): "סכום החיסכון הנוסף יעודכן משנת 2017 ואילך, ב־1 בינואר של כל שנה, לפי שיעור עליית המדד"). Take-up: 63.2% of plans that had a deposit in 2025 (NII 2025 report p.3).
- Source: [NII doubling page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx) ("הסכום הנוסף יופקד לחיסכון של הילד בחודש שלאחר ביצוע הבחירה"; "ניתן לבטל את הסכום הנוסף בכל שלב של התכנית") · checked 2026-10-22 · primary. NII FAQ (above) · checked 2026-10-22 · primary. Regulations 2 and 5 (Wikisource mirror) · checked 2026-10-22 · primary. [Harel standard bylaw, April 2026](https://media.harel-group.co.il/media/lved10ua/תקנון-הראל-חיסכון-לכל-ילד-אפריל-2026-_.pdf), s.8 · checked 2026-10-22 · institution.
- Dimensions: `deposit-ceiling`, `transfer-switch-process`
- Likely to change: yes. CPI each 1 January. The Minister may, with Finance Committee approval, decide the addition is not transferred (74ב(א)(3)).

### CS-05 Protection of the money
- Rule: The accumulated amount belongs to the child but is held in trust, and the trustee is the parent who receives the allowance (law 74ב(ב); Yahav agreement 1.5). It cannot be transferred, pledged or attached. Law 74ב(ג): "סכום החיסכון הצבור הכולל לא יהיה ניתן להעברה, לשעבוד או לעיקול". In a bank, the agreement promises the balance will not fall below the sums NII deposited, in nominal terms (Yahav 3.8). No equivalent floor was found for the provident option, and the Harel bylaw says the default track's investment "may be exposed" to currency risk (CS-09).
- Conditions / exceptions: Law 74ב(ו) says the accumulated amount is not treated as income for income tax, for mandatory payments, or for benefits under the NII law and the Income Support Law. The tax side belongs to TXK.
- Figures: none.
- Source: law 74ב(ב), (ג), (ו) (Wikisource mirror; (ו) read as a summary, not verbatim) · checked 2026-10-22 · primary. NII FAQ (debt-offset question: "אינה ניתנת לעיקול") · checked 2026-10-22 · primary. [Bank Yahav, child-savings agreement](https://bank-yahav.co.il/media/qxed4yhi/השקעות-מונגש-חסכון-לכל-ילד-צפייה-בהסכם-חיסכון-לכל-ילד.pdf), s.1.5, 3.8, 7.1 (undated) · checked 2026-10-22 · institution. Harel bylaw, Annex A · checked 2026-10-22 · institution.
- Dimensions: `protection`, `regulator`
- Likely to change: no

### CS-06 Where the money goes: the parent's choice and its deadline
- Rule: The parent chooses a managing body, either a child-savings investment provident fund or a bank, from the list approved by the Ministry of Finance and published on NII's site, together with a track. The choice must be made within six months of birth. NII: "בתוך 6 חודשים מיום הלידה". The first choice is made only through NII. Harel bylaw 7.1: joining the fund is done "באמצעות המוסד לביטוח לאומי, ובאמצעותו בלבד".
- Conditions / exceptions: Deposits for the months of the choice period are paid into the chosen body with the first deposit (regulation 3(ד), 2016 text). Only the parent receiving the allowance can choose or change (NII FAQ). After 18, only the child can (CS-11).
- Figures: choice period 6 months from birth (fixed in law 74ב(ד)(1א)).
- Source: [NII newborn page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/nolad.aspx) · checked 2026-10-22 · primary. Law 74ב(ד)(1א) (Wikisource mirror) · checked 2026-10-22 · primary. Regulation 3 (Wikisource mirror; 2016 text in NII circular 1356 p.33) · checked 2026-10-22 · primary. Harel bylaw s.7.1 · checked 2026-10-22 · institution.
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: no

### CS-07 Default when the parent does not choose
- Rule: If no choice is made within six months of birth, the money is deposited and managed in an investment provident fund. This also applies when the parent chose a bank for other children (law 74ב(ד)(1א)). The fund and track follow the older sibling: the same provident fund chosen for the older child. If the older child is at a bank, or this is the first child, the money goes to a provident fund in the "increased risk" track. NII: "בקופת גמל בסיכון מוגבר" and "במסלול סיכון מוגבר". NII's 2025 report states the rule since January 2025: the default is a provident fund in the increased-risk track, unless an older sibling's parents chose a provident fund at a different risk level, in which case that level is used.
- Conditions / exceptions: The default is by birth order, not by age. History (NII 2025 report p.2): January 2017 to December 2019, a bank for those whose older child was at a bank, otherwise a low-risk provident fund. From January 2020, a low-risk provident fund for the first child, and the parents' earlier choice for later children. From December 2022, an increased-risk provident fund for the first child, and a track like the older sibling's for later children. From January 2025, as above. At the 2017 launch, children born before 2017 were defaulted to a random provident fund (under 15) or to the bank paying the allowance (15 to 18) (NII report footnote 3; circular 1356 pp.6–7). Altshuler Shaham states that accounts opened up to 30.11.2022 defaulted to low risk, and from 1.12.2022 to increased risk. How a first child's default fund is picked today is not stated by NII. The 2016 regulation 3(ב) used a fixed rotation among the listed funds ("בדרך של סבב קבוע בין כל קופות הגמל האמורות"), and Altshuler's page says rotation (open question 4). The parent can change the fund or track after the six months (CS-11).
- Figures: In plans reported for 2025, 33.1% (1,312,519) had the track chosen by NII, 53.8% by parents, and 13.1% unspecified. Of children born in 2025 with a plan opened by year end, 33% were defaulted, and 80% of those were second or later children (NII 2025 report pp.3, 6).
- Source: [NII newborn page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/nolad.aspx) · checked 2026-10-22 · primary. Law 74ב(ד)(1א) (Wikisource mirror) · checked 2026-10-22 · primary. [NII 2025 report](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), pp.2–3, 6 · checked 2026-10-22 · primary. Harel bylaw s.7.4–7.5 ("מסלול לחוסכים המעדיפים סיכון מוגבר ... יהיה מסלול ברירת המחדל במקרה שבו ההורה לא בחר מסלול השקעה אחר במקומו") · checked 2026-10-22 · institution. [Altshuler Shaham child-savings Q&A](https://www.as-invest.co.il/interstedin/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%95%D7%94%D7%A9%D7%A7%D7%A2%D7%94/%D7%A9%D7%90%D7%9C%D7%95%D7%AA-%D7%95%D7%AA%D7%A9%D7%95%D7%91%D7%95%D7%AA-%D7%91%D7%A0%D7%95%D7%A9%D7%90-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%9C%D7%9B%D7%9C-%D7%99%D7%9C%D7%93/) · checked 2026-10-22 · institution.
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: yes. Changed three times in 2020–2025.

### CS-08 Provident-fund option: managers and tracks
- Rule: In the provident option the money sits in a fund classified "קופת גמל להשקעה - חסכון לילד". Each manager offers some of these tracks: low risk (מועט), medium risk (בינוני), increased risk (מוגבר), Jewish-law (הלכה), and Islamic-law (שריעה). Not every manager offers all five (Institutions table). The parent picks one track, and funds cannot be split across tracks (Altshuler Shaham). Tracks are not age-based. There is no lifecycle default (CS-07).
- Conditions / exceptions: NII's 2025 report says the programme has 9 provident managers (after mergers: Helman Aldubi and Psagot in October 2021, Kal Gemel into Phoenix in March 2025). The CMA Gemel-Net data for period 202609 has 41 child-savings tracks at 10 managers, including 4 Clal tracks with inception date 2026-03-09 (open question 2). The 2016 tender picked 13 provident funds and 9 banks. One fund withdrew, leaving 12.
- Figures: 3,050,069 active plans in provident funds at end-2025 (84% of active plans). By share: Altshuler Shaham 31.4%, Harel 19.3%, Phoenix 10.4%, Analyst 8.5%, Infinity 7.8%, Meitav 7.7%, Menora 5.3%, Mor 4.95%, Migdal 4.7% (NII 2025 report p.4).
- Source: [CMA Gemel-Net dataset, resource a30dcbea-a1d2-482c-ae29-8f781f5025fb](https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb&filters={"REPORT_PERIOD":202609,"FUND_CLASSIFICATION":"קופת גמל להשקעה - חסכון לילד"}&limit=200), period 202609, 41 records · checked 2026-10-22 · primary. [NII 2025 report](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), pp.1, 3–4 · checked 2026-10-22 · primary. NII FAQ ("one of 5 investment tracks") · checked 2026-10-22 · primary. Altshuler Q&A ("ניתן לשנות מסלול בכל עת, אך לא לפצל כספים בין מסלולים") · checked 2026-10-22 · institution.
- Dimensions: `regulator`, `protection`
- Likely to change: yes. Managers merge and join; a new manager appears in the CMA data in 2026.

### CS-09 What the default (increased-risk) track holds
- Rule: At Harel, the increased-risk track (fund 11377, "מסלול ברירת המחדל של הקופה") holds equity exposure, in Israel and abroad, of no less than 75% and no more than 120% of track assets. It may use derivatives, ETFs and mutual funds, and it may be exposed to currency risk. The medium and low tracks are described only as invested "at the investment committee's discretion" for members who prefer medium or low risk. The halacha track invests only under halachic rules.
- Conditions / exceptions: This is Harel's bylaw only. Other managers' track policies were not read (open question 7). The CMA dataset field STOCK_MARKET_EXPOSURE exists per track, but its units are not defined in the dataset (data-landscape 1.2.1).
- Figures: equity exposure 75%–120% (Harel, bylaw edition 3, 04/2026).
- Source: [Harel bylaw](<https://media.harel-group.co.il/media/lved10ua/תקנון-הראל-חיסכון-לכל-ילד-אפריל-2026-_.pdf>), Annex A · checked 2026-10-22 · institution.
- Dimensions: `currency`, `protection`
- Likely to change: yes. Bylaw editions change; edition 3 is dated 04/2026.

### CS-10 Bank option: tracks, exit stations, how interest is set
- Rule: Each participating bank offers three savings tracks: fixed unlinked interest (ריבית קבועה לא צמודה), variable interest set as a spread from prime (ריבית משתנה (פריים)), and fixed CPI-linked interest (ריבית קבועה צמודה). Each comes either without exit stations until 18, or with an exit station every 5 years. In the Yahav agreement, the exit-station type is for children under 13 when the plan starts. The bank gives notice 60 days before each station, and the parent instructs it 3 to 10 business days before. The rate is the bank's quoted rate on the day the account opens, for a period of 18 minus the child's age (Yahav 3.5–3.6). The balance never falls below the nominal sums NII deposited (Yahav 3.8).
- Conditions / exceptions: No bank-to-bank move (CS-12). The Yahav agreement is undated (it refers to a 50 NIS base and a 1.5.2017 minimum balance), and other banks' agreements were not read (open question 12). Banks' quoted rates are in a Ministry of Finance dataset whose newest rows are dated 02/09/2025 (CS-23).
- Figures: none current.
- Source: [NII circular 1356](<https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf>) p.5 and FAQ pp.21–22 (2016) · checked 2026-10-22 · primary (historical). [NII FAQ](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx>) ("3 tracks per bank, either with no exit points or with an exit point every 5 years") · checked 2026-10-22 · primary. [Yahav agreement](<https://bank-yahav.co.il/media/qxed4yhi/השקעות-מונגש-חסכון-לכל-ילד-צפייה-בהסכם-חיסכון-לכל-ילד.pdf>) s.3.3–3.8 · checked 2026-10-22 · institution.
- Dimensions: `real-vs-nominal`, `liquidity-lockup`, `protection`
- Likely to change: no

### CS-11 Switching within the provident option (tracks and managers)
- Rule: The track can be changed at any time during the saving period by contacting the managing fund (NII; regulation 4(ג)). Harel's bylaw executes a track switch within 3 business days of a complete request (s.16.2). The savings can move at any stage to another provident fund on the approved list, by contacting the receiving fund. The balance and gains move automatically, and NII sends future deposits to the new fund. They cannot move to a bank. Before 18 the parent acts. After 18 only the child can. NII FAQ: "לפני גיל 18 השינוי ייעשה על ידי ההורה. אחרי גיל 18 רק הילד יוכל לעשות את השינוי."
- Conditions / exceptions: Regulation 7 (2016 text) timelines: the receiving manager notifies NII within 7 business days. NII then deposits into the receiving fund from the following month. The receiving manager sends the transfer request within 2 business days of that first deposit. The transferring manager moves the balance within 5 business days. NII's 2016 FAQ said the move takes effect about a month after the request (historical). No limit on the number of switches was found.
- Figures: track switch ≤3 business days (Harel). Fund transfer per regulation 7: 7 + 2 + 5 business days, plus deposit timing.
- Source: [NII change page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/mavar.aspx) · checked 2026-10-22 · primary. NII FAQ · checked 2026-10-22 · primary. Regulations 4(ג), 7 (Wikisource mirror; 2016 text in circular 1356 pp.34–35) · checked 2026-10-22 · primary. Harel bylaw s.14–16 · checked 2026-10-22 · institution.
- Dimensions: `transfer-switch-process`
- Likely to change: no

### CS-12 Switching from a bank
- Rule: Savings at a bank cannot move to another bank. The bank track can change only if an exit-station track was chosen, and only on a station date. Without exit stations, the track is fixed until 18. Since January 2025 a parent whose child saves at a bank can choose, once only, to have future deposits go to an investment provident fund. The amount already saved stays at the bank. Law 74ב(א)(2א): "בחירה כאמור תיעשה פעם אחת בלבד; סכום שנצבר ערב בחירתו של הורה זכאי לפי פסקה זו ימשיך להיות מנוהל בבנק". The child then has two accounts.
- Conditions / exceptions: NII's change page says this can be done "at any point during the saving period". The request is made through NII's online form. NII's 2025 report: "עד ינואר 2025 לא ניתן היה לנייד חסכונות בין הבנקים השונים וגם לא לקופת גמל". A provident fund cannot move back to a bank (CS-11). After 18, Yahav's agreement (4.6) says the money cannot move to another financial body unless the Accountant General instructs otherwise.
- Figures: 98,119 bank plans closed and moved to provident funds in 2025, 40.9% of them from Hapoalim (NII 2025 report p.2).
- Source: Law 74ב(א)(2א) (Wikisource mirror) · checked 2026-10-22 · primary. [NII change page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/mavar.aspx) · checked 2026-10-22 · primary. NII 2025 report pp.1–2 · checked 2026-10-22 · primary. Altshuler Q&A ("החל מיום 1.1.2025 ... הפקדות חדשות בלבד") · checked 2026-10-22 · institution. Yahav agreement s.3.3, 4.6 · checked 2026-10-22 · institution.
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: yes. Recent amendment; the exact amendment number and effective date were not read (open question 14).

### CS-13 Grants by birth cohort
- Rule: Children born up to 31.12.2016 get NIS 582 (2026) deposited at 18. Children born from 1.1.2017 get no grant at 18. Instead they get NIS 291 (2026) at age 3 and NIS 291 at age 13 (boys) or 12 (girls). All children get a further NIS 582 (2026) at 21, if nothing was withdrawn before then. Law 74ג(ב): "לא משך הילד את סכום החיסכון הצבור הכולל, כולו או חלקו, קודם לכן – יעביר המוסד ... בהגיע הילד הזכאי לגיל 21".
- Conditions / exceptions: Any withdrawal, even a partial one, before 21 forfeits the age-21 grant. The age-18 grant for the pre-2017 cohort is stated by NII and in bank agreements, but its legal source in the current law text was not found (open question 5). In 2025: 184,123 age-3 grants, 157,703 age-18 grants and 90,633 age-21 grants (NII 2025 report p.5).
- Figures: 2026: 291 / 291 / 582 / 582 NIS. 2025: 284 / 568 (NII 2025 report). 2017: 250 and 500 (law). CPI-updated each 1 January from 2017 (74ג(ג)).
- Source: [NII withdrawal page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx) · checked 2026-10-22 · primary. [NII savings-amount page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/sum.aspx) · checked 2026-10-22 · primary. Law 74ב(א)(1)(א)–(ב), 74ג(ב)–(ג) (Wikisource mirror) · checked 2026-10-22 · primary. NII 2025 report pp.1, 5 · checked 2026-10-22 · primary.
- Dimensions: `age-or-use-exemption`, `liquidity-lockup`
- Likely to change: yes. CPI each year; the cohort rule was changed by amendment once already.

### CS-14 Withdrawal at 18 and at 21; parental consent
- Rule: The money can be withdrawn only from 18 (NII: from the end of the month of the 18th birthday), whole or in part. Up to 21 a parent must sign. Law 74ג(ב): "ובלבד שאחד מהוריו אישר בחתימתו את עצם המשיכה". Harel bylaw 10.2 limits the consent requirement to ages 18 to 21 minus one day. NII: from 21 the child withdraws without parental approval. The request goes to the fund or bank, not to NII, on the withdrawal form, with the child's bank account details.
- Conditions / exceptions: There is no withdrawal for financial hardship and none before 18 for a child married at 17 (NII FAQ). Leumi pays only into a current account held solely in the child's name. Its digital request withdraws the whole balance and closes the account, and it is processed within 3 business days. Harel pays within 4 business days of a complete request (s.10.4) and sends a confirmation within 10 business days (s.11). Yahav allows a partial withdrawal only if at least NIS 100 stays in the account (as of 1.5.2017, s.6.6). NII warns that private firms charge for help with withdrawal, which is free when done directly.
- Figures: in 2025, 122,300 plans fully and 2,960 partly redeemed, totalling NIS 1.075 bn (NII 2025 report p.3).
- Source: Law 74ג(ב) (Wikisource mirror) · checked 2026-10-22 · primary. [NII withdrawal page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx) · checked 2026-10-22 · primary. NII FAQ ("את כספי החיסכון הילד יוכל למשוך מגיל 18 באישור ההורה") · checked 2026-10-22 · primary. Harel bylaw s.10–12 · checked 2026-10-22 · institution. [Leumi, child-savings withdrawal](https://www.leumi.co.il/Saving-Kids) · checked 2026-10-22 · institution. Yahav agreement s.6 · checked 2026-10-22 · institution.
- Dimensions: `liquidity-lockup`, `minimum`, `transfer-switch-process`
- Likely to change: no

### CS-15 Early withdrawal for a medical condition
- Rule: Before 18, the money can be withdrawn only to fund the child's medical needs, where a medical condition endangers the child's life, body or mind, and an NII-appointed doctor approves (law 74ד(א)). NII: on approval a NIS 582 grant is deposited (instead of at 18) and the parent may withdraw. Monthly deposits continue until 18, no age-18 grant is paid later, and the age-21 grant is still paid if the child then saves to 21.
- Conditions / exceptions: Law 74ד(ב), read as a summary of the mirror and not verbatim, says NII adds the age-3 and age-13 sums. NII's page describes the NIS 582 grant. How these differ by birth cohort is open question 6.
- Figures: NIS 582 (2026).
- Source: Law 74ד (Wikisource mirror, summary) · checked 2026-10-22 · primary. [NII withdrawal page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx) · checked 2026-10-22 · primary. NII FAQ (disabled-child question) · checked 2026-10-22 · primary.
- Dimensions: `liquidity-lockup`, `age-or-use-exemption`
- Likely to change: no

### CS-16 If the money is not withdrawn
- Rule: The accumulated amount not withdrawn at redemption age keeps being managed in the provident fund or bank (regulation 11(א): "ימשיך להתנהל בקופת גמל או בבנק, לפי העניין"). After 18 the child may switch between investment provident funds or tracks under the provident-fund law, or between bank savings tracks under the bank agreement (regulation 11(ב)). No new money can be added (regulation 2; Harel bylaw s.8). In a provident fund, NII says the child can keep saving until retirement age and take the money as an annuity (the tax effect is in TXK).
- Conditions / exceptions: At a bank (Yahav 4.1–4.5), the bank contacts the parent 21 to 45 days before 18 about a further saving period of one month, one year, two years or three years. If no instruction is given, the account renews for one month at a time in the fixed unlinked track. From 18 to 21 the bank writes after every calendar quarter, and before 21 it offers renewal. If contact is lost, the account is treated as a dormant deposit (פיקדון ללא תנועה) (Yahav 5.3). Breaking a further saving period early can lose interest and linkage and incur costs (Yahav 6.3). A provident-fund membership ends only when all money is withdrawn or transferred (Harel s.28.1). Whether the money can move into a regular, non-child investment provident fund or another product is open question 13.
- Figures: none.
- Source: Regulations 2, 11 (Wikisource mirror) · checked 2026-10-22 · primary. [NII withdrawal page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx) · checked 2026-10-22 · primary. Harel bylaw s.8, 28 · checked 2026-10-22 · institution. Yahav agreement s.4–6 · checked 2026-10-22 · institution.
- Dimensions: `liquidity-lockup`, `transfer-switch-process`, `fee-exit`
- Likely to change: no

### CS-17 Death of the child
- Rule: NII: for a child who dies, child allowance continues for the month of death and 3 more months, and the monthly deposits continue during that time. Then both stop and the parents may withdraw through the fund or bank. Regulation 9 (2016 text): if the child dies before 16 with two living parents, each parent may withdraw half. With one parent, that parent withdraws all. With no parent, the fund bylaw (provident) or the Succession Law (bank) applies. From 16, the bylaw or the Succession Law applies. From 18, a member in a provident fund may name beneficiaries (Harel s.18.3).
- Conditions / exceptions: If the child dies before the end of the choice period, NII pays the basic sums owed directly to the parents (regulation 9(ד)).
- Figures: 3 months of continued deposits.
- Source: [NII withdrawal page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx) · checked 2026-10-22 · primary. NII FAQ · checked 2026-10-22 · primary. Regulation 9 (Wikisource mirror; 2016 text in circular 1356 pp.35–36) · checked 2026-10-22 · primary. Harel bylaw s.18–22 · checked 2026-10-22 · institution.
- Dimensions: `liquidity-lockup`, `eligibility`
- Likely to change: no

### CS-18 Management fees: who pays and until when
- Rule: NII bears the cost of managing the accounts (law 74ב(ה): "המוסד יישא בעלויות הנובעות מניהולם של החשבונות לפי סימן זה"). NII says it pays until the child turns 21, after which fees are deducted from the savings. NII pays provident funds 0.23% a year of the accumulated assets, and pays banks an operating fee of 6 agorot per reporting line. Harel's bylaw charges 0.23% of the balance and 0% of deposits (s.31.1.1–31.1.2). Altshuler Shaham states that after 21 it charges 0.23% of the balance only.
- Conditions / exceptions: For a member aged 21 or over, a manager may raise the fee by notice in a separate document (Harel s.33.1). The increase takes effect at the later of two months after the notice or the date stated in it, and the notice may not be sent more than four months before that date (s.33.2). A manager may offer a discount for at least two years (s.32.1). The bylaw cap refers to "דמי הניהול השנתי המרבי הקבוע בהסדר התחיקתי" without a figure; that cap belongs to PF. The 2016 regulation 13 lets a manager collect fees "עד הגיעו לגיל 21" quarterly or half-yearly. At a bank, the shadow current account opened for the plan is exempt from fees (Yahav 5.4). Whether the 0.23% after-21 rate holds at all nine or ten managers was not checked (open question 8).
- Figures: 0.23% a year of balance (NII payment to funds, per the 2025 report; Harel and Altshuler after 21). 0% of deposits (Harel). 6 agorot per reporting line to banks.
- Source: Law 74ב(ה) (Wikisource mirror) · checked 2026-10-22 · primary. [NII savings-amount page](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/sum.aspx) and NII FAQ ("Who pays management fees?") · checked 2026-10-22 · primary. [NII 2025 report](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), p.1 ("ולקופות הגמל דמי ניהול בשיעור של 0.23% לשנה מהכספים הצבורים בקופות") · checked 2026-10-22 · primary. Harel bylaw s.31–33 · checked 2026-10-22 · institution. Altshuler Q&A ("יגבו דמי ניהול בגובה 0.23% מהיתרה בחשבונו בלבד") · checked 2026-10-22 · institution. Regulation 13 (Wikisource mirror) · checked 2026-10-22 · primary.
- Dimensions: `fee-management-balance`, `fee-deposit`, `fee-change-over-time`
- Likely to change: yes. The rate comes from the tender and the bylaw, and managers may raise it after 21.

### CS-19 Statements and where to see the account
- Rule: Each year, by 1 March, the managing fund or bank sends the parents a report on the child's balance (law 74ב(ז): "בכל שנה ולא יאוחר מ־1 במרס, ישלח הגוף ... דוח להורי הילד הזכאי"). Harel's bylaw s.27 sends an annual report in the format set by the Commissioner, by 1 March, with a short report by post unless e-mail is requested. The balance can also be seen on the manager's website (personal area). NII's page "מידע אישי על תכנית החיסכון של הילד/ה" needs the parent's ID number and ID issue date. It shows the managing institution, whether the saving was doubled, the track, and the amount deposited without returns. Amounts with returns come only from the fund or bank.
- Conditions / exceptions: The field layout of the annual child-savings statement was not found (open question 11). Parents should update the institution with address changes (NII FAQ).
- Figures: none.
- Source: Law 74ב(ז) (Wikisource mirror) · checked 2026-10-22 · primary. NII FAQ (questions on where the savings are, doubling, and how much has accumulated) · checked 2026-10-22 · primary. [NII personal-information page](https://b2b.btl.gov.il/BTL.ILG.Payments/TochnitChisachonYeledListInfo.aspx) · checked 2026-10-22 · primary. Harel bylaw s.25–27 · checked 2026-10-22 · institution. Altshuler Q&A (personal area) · checked 2026-10-22 · institution.
- Dimensions: `reporting-obligation`
- Likely to change: no

### CS-20 Chosen vs default track: what is known
- Rule: Managing bodies report to NII whether the track was chosen by the parents or by NII. In plans reported for 2025: parents 53.8%, NII 33.1%, unspecified 13.1%. Since the start of the programme, parents chose for 60% of 4.7 million children. For plans whose choice period ended July 2024 to June 2025, the figure is 54%.
- Conditions / exceptions: No source found shows a parent, on a statement or NII's personal page, whether their own child's track was a default (open question 10). This is the input product.md 3.6 needs.
- Figures: as above, end-2025.
- Source: [NII 2025 report](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), pp.3, 6 · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`
- Likely to change: yes. Annual figures.

### CS-21 Who may act on the plan
- Rule: Before 18, only the parent who receives the child allowance can choose or change the managing body or track, or turn the addition on or off (NII FAQ: "רק ההורה שמקבל את קצבת הילדים יכול לבצע שינויים"). A guardian or appointed recipient who receives the allowance can choose where the money is managed (circular 1356 p.5). From 18, only the child can change fund or track. Withdrawal needs a parent's signature between 18 and 21 (CS-14).
- Conditions / exceptions: none found.
- Figures: none.
- Source: [NII FAQ](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx>) · checked 2026-10-22 · primary. [NII circular 1356](<https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf>) p.5 · checked 2026-10-22 · primary (historical).
- Dimensions: `eligibility`, `transfer-switch-process`
- Likely to change: no

### CS-22 Participating banks
- Rule: Nine banks manage child savings: Otzar Hahayal, Discount, First International (הבינלאומי), Hapoalim, Yahav, Leumi, Mizrahi-Tefahot, Massad and Mercantile. These are the same nine that won the 2016 tender. The programme "today" has 9 banks, per the July 2026 report.
- Conditions / exceptions: New bank plans were 5.2% of plans opened in 2025 (NII 2025 report p.5).
- Figures: 583,504 active bank plans at end-2025 (16% of active plans). Hapoalim 40.5%, Leumi 20.7%, Mercantile 11.4%, Discount 8.8%, Mizrahi 6.7%, First International 3.8%, Yahav 3.2%, Massad 2.5%, Otzar Hahayal 2.4% (NII 2025 report p.3).
- Source: [NII 2025 report](https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf), pp.1, 3 · checked 2026-10-22 · primary. NII circular 1356 p.4 (2016 list) · checked 2026-10-22 · primary. [MoF dataset savingsplaninterest](https://data.gov.il/dataset/savingsplaninterest) (the same 9 bank names) · checked 2026-10-22 · primary.
- Dimensions: `regulator`
- Likely to change: yes, at a new tender.

### CS-23 Public data on bank rates is stale
- Rule: The Ministry of Finance dataset "ריביות של פיקדונות חסכון לכל ילד - עדכון יומי" holds each bank's quoted rates by age band, plan type and saving period. The fields are fixed unlinked rate, fixed CPI-linked rate, and variable spread from prime. It says it updates daily and holds up to two years of history.
- Conditions / exceptions: On 2026-10-22 the resource had last_modified 2026-10-22T04:00, but the highest-ID rows are dated 02/09/2025. A full-text search for "2026" returned no rows. Plan types: "הפקדה ללא תחנות יציאה" and "הפקדה עם אפשרות לתחנות יציאה כל 5 שנים" (up to 18), and "צבירת ריבית על סכום חד פעמי" (over 18). No licence is attached to the dataset.
- Figures: not used (stale).
- Source: [data.gov.il package savingsplaninterest](https://data.gov.il/api/3/action/package_show?id=savingsplaninterest); resource a737b311-c6d8-4084-9ac9-c40d0fd01125 (SQL query ordered by _id desc; distinct SAVINGSPLAN; q=2026); description resource d4b0d8f5-a0c0-4614-866c-107fe879cf26 · checked 2026-10-22 · primary.
- Dimensions: `real-vs-nominal`
- Likely to change: unknown

### CS-24 NII's official provident list and tracks (hly.gov.il)
- Rule: NII's child-savings site lists 10 provident managers parents may choose: אינפיניטי, אלטשולר שחם גמל ופנסיה, אנליסט, הפניקס פנסיה וגמל, הראל פנסיה, כלל פנסיה וגמל, מגדל מקפת, מור גמל ופנסיה, מיטב גמל ופנסיה, מנורה פנסיה. Each offers up to five tracks: "חוסכים המעדיפים סיכון מועט", "סיכון בינוני", "סיכון מוגבר", "הלכה" and "שריעה". Parents may move between listed funds, and change track, at any time.
- Conditions / exceptions: The page shows, as illustration only, each child track's ID next to a "similar" adult track and its 5-year average return. Some funds have no halacha or sharia track.
- Figures: none recorded (returns are illustrative).
- Source: [hly.gov.il, מידע על ניהול החיסכון בקופות הגמל](https://hly.gov.il/ProvidentFunds.html) · checked 2026-10-22 · primary
- Dimensions: `default-assignment`, `transfer-switch-process`
- Likely to change: yes, with tenders.

### CS-25 Bank vs provident: what NII says differs
- Rule: In a bank, the money earns interest known in advance and the bank tracks guarantee at least the deposited principal. Bank tracks: fixed unlinked, variable, and fixed CPI-linked, each with or without an exit point every 5 years. Bank money cannot move to another bank or to a provident fund during the saving period, and the bank track can change only at a 5-yearly exit point. Provident money cannot move to a bank. NII pays management fees (provident) or operating costs (bank) until 21; afterwards fees come out of the savings.
- Conditions / exceptions: "Bank money cannot move to a provident fund" conflicts with the one-time January 2025 bank-to-provident move in CS findings (CS OQ14); the page may describe the standing rule only.
- Figures: none.
- Source: [hly.gov.il, ההבדלים בין חיסכון בקופת גמל לחיסכון בבנק](https://hly.gov.il/Differences.html) · checked 2026-10-22 · primary
- Dimensions: `protection`, `transfer-switch-process`, `fee-management-balance`
- Likely to change: possible.

## Proposed dimensions

- `state-contribution`: money the state adds that the saver does not pay (NII deposits, cohort grants), and the conditions that forfeit it (CS-03, CS-13).
- `default-allocation`: what happens to the money if the saver makes no choice, and whether the current holding is chosen or default (CS-07, CS-20). This is needed by product.md 3.6.
- `signatory-control`: who may act on the account at each age, for example a parent's signature from 18 to 21 (CS-14, CS-21).

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| תכנית חיסכון לכל ילד | Savings for every child programme | The programme name NII uses | NII site, ads | NII programme page |
| חיסכון ארוך טווח לילד | Long-term savings for a child | Legal name of the plan | Law, regulations, bylaw titles | Law 74ב; regulations title |
| סכום החיסכון הבסיסי | Basic savings amount | NII's monthly deposit | Law, bank agreements | Law 74ב; Yahav 2.3.1 |
| הפקדת בסיס | Basic deposit | Same, in NII's reports | NII reports | NII 2025 report |
| סכום החיסכון הנוסף | Additional savings amount | Parent's addition from the allowance | Law, bank agreements | Law 74ב(א)(2); Yahav 1.3 |
| הפקדה נוספת | Additional deposit | Same, in NII wording | NII pages, reports | NII 2025 report; circular 1356 |
| להכפיל את סכום החיסכון | Double the saving | NII's wording for turning on the addition | NII site | NII FAQ |
| סכום החיסכון הצבור הכולל | Total accumulated savings | The balance | Law, regulations | Law 74ב(ג) |
| גיל הפדיון | Redemption age | 18 | Law, bylaw | Law 74ג(ב) |
| הילד הזכאי | The entitled child | Child for whom allowance is paid | Law, bylaw | Law 74ב(א)(1) |
| מקבל הקצבה | Allowance recipient | The parent who receives child allowance | Bylaw | Harel bylaw definitions |
| הגוף החוסך | The saving body | The fund or bank holding the plan | NII site | NII FAQ |
| קופת גמל להשקעה - חסכון לילד | Investment provident fund, child savings | CMA classification of these funds | CMA Gemel-Net data | Gemel-Net FUND_CLASSIFICATION |
| קופת גמל להשקעה לחיסכון ארוך טווח לילד | Investment provident fund for long-term child savings | Bylaw and fund name form | Bylaw, some fund names (Meitav, Analyst) | Harel bylaw title; Gemel-Net FUND_NAME |
| תקנון תקני | Standard bylaw | The uniform bylaw template the fund uses | Bylaw | Harel bylaw cover |
| מסלול השקעה ברירת מחדל | Default investment track | Track used when the parent did not choose | Bylaw | Harel bylaw definitions |
| מסלול ברירת המחדל של הקופה | The fund's default track | Label on Harel's increased-risk track | Bylaw | Harel bylaw Annex A |
| קופת ברירת מחדל | Default fund | Fund assigned when no choice was made (2016 rule) | Regulations | Regulation 3(ב) |
| חוסכים המעדיפים סיכון מועט | Savers preferring low risk | Low-risk track | Fund names, app | Gemel-Net; Harel |
| חוסכים המעדיפים סיכון בינוני | Savers preferring medium risk | Medium-risk track | Fund names, app | Gemel-Net; Harel |
| חוסכים המעדיפים סיכון מוגבר | Savers preferring increased risk | Increased-risk track, the default since Dec 2022 | Fund names, app | Gemel-Net; Harel |
| סיכון גבוה | High risk | CMA sub-specialisation label for the "מוגבר" tracks ("חיסכון לילד -חוסכים המעדיפים סיכון גבוה") | CMA data | Gemel-Net SUB_SPECIALIZATION |
| הלכה / מסלול הלכה | Halacha track | Track invested under Jewish law | Fund names | Gemel-Net; circular 1356 |
| שריעה | Sharia track | Track invested under Islamic law | Fund names (Mor, Phoenix) | Gemel-Net |
| ריבית קבועה לא צמודה | Fixed unlinked interest | Bank track | Bank, NII | Circular 1356 p.5; MoF dataset |
| ריבית קבועה צמודה | Fixed CPI-linked interest | Bank track | Bank, NII | Circular 1356 p.5 |
| ריבית משתנה (פריים) / ריבית משתנה - מרווח מריבית הפריים | Variable (prime-based) interest | Bank track priced as a spread from prime | Bank, NII, MoF data | Circular 1356 p.22; MoF dataset field description |
| תחנת יציאה | Exit station | Date (every 5 years) at which a bank track may be changed | Bank, NII | NII mavar page; Yahav 3.3.2 |
| הפקדה ללא תחנות יציאה | Deposit without exit stations | Bank plan type, fixed until 18 | MoF data | MoF dataset SAVINGSPLAN |
| הפקדה עם אפשרות לתחנות יציאה כל 5 שנים | Deposit with exit stations every 5 years | Bank plan type | MoF data | MoF dataset SAVINGSPLAN |
| צבירת ריבית על סכום חד פעמי | Interest on a one-off sum | Bank plan type after 18 | MoF data | MoF dataset SAVINGSPLAN |
| תקופת החיסכון הנוספת | Additional saving period | Renewal period after 18 at a bank | Bank agreement | Yahav 4.1 |
| מענק המשיכה הראשון / מענק המשיכה השני | First / second withdrawal grant | Age-18 and age-21 grants (pre-2017 cohort wording) | Bank agreement | Yahav 2.3.4 |
| שבירת חיסכון | Breaking the saving | Early withdrawal from a bank saving period | Bank agreement | Yahav 6.3 |
| פיקדון ללא תנועה | Dormant deposit | Status if the bank loses contact after 21 | Bank agreement | Yahav 5.3 |
| חשבון עו"ש תמורה | Shadow current account | Fee-free account the bank opens for the plan | Bank agreement | Yahav 5.4 |
| מידע אישי על תכנית החיסכון של הילד/ה | Personal information on the child's plan | NII lookup page (amounts without returns) | NII site | NII b2b page |
| הוראת מוטבים | Beneficiary designation | Who receives the money on death, from 18 | Bylaw | Harel bylaw s.18 |
| דין וחשבון שנתי | Annual report | Statement by 1 March | Bylaw, statement | Harel bylaw s.27 |
| דמי ניהול | Management fees | 0.23% of balance (NII-paid until 21) | Statement, bylaw | Harel bylaw s.31 |

## Institutions

**Provident managers.** These are from the CMA Gemel-Net dataset, resource `a30dcbea-a1d2-482c-ae29-8f781f5025fb` ("2024–today"), filter `REPORT_PERIOD = 202609` and `FUND_CLASSIFICATION = "קופת גמל להשקעה - חסכון לילד"`. The query returned 41 records, all target population "כלל האוכלוסיה", read 2026-10-22. Fund names are copied exactly from the data. "M" = מועט, "B" = בינוני, "G" = מוגבר, "H" = הלכה, "S" = שריעה.

| Managing company | M | B | G | H | S | Fund IDs (M, B, G, H, S) | In NII end-2025 list |
|---|---|---|---|---|---|---|---|
| אלטשולר שחם גמל ופנסיה בע"מ | ✓ | ✓ | ✓ | ✓ | | 11325, 11326, 11327, 11328 | yes |
| אנליסט קופות גמל בע"מ | ✓ | ✓ | ✓ | | | 11365, 11366, 11367 | yes |
| אינפיניטי השתלמות, גמל ופנסיה בע"מ | ✓ | ✓ | ✓ | ✓ | | 11374, 11372, 11373, 11914 | yes |
| הפניקס פנסיה וגמל בע"מ | ✓ | ✓ | ✓ | ✓ | ✓ | 11310, 11312, 11311, 11335, 11352 | yes |
| הראל פנסיה וגמל בע"מ | ✓ | ✓ | ✓ | ✓ | | 11375, 11376, 11377, 9555 | yes |
| מגדל מקפת קרנות פנסיה וקופות גמל בע"מ | ✓ | ✓ | ✓ | ✓ | | 9896, 9897, 9898, 9895 | yes |
| מור גמל ופנסיה בע"מ | ✓ | ✓ | ✓ | ✓ | ✓ | 9421, 9414, 9420, 9113, 9303 | yes |
| מיטב גמל ופנסיה בע"מ | ✓ | ✓ | ✓ | ✓ | | 11385, 11386, 11387, 11388 | yes ("מיטב דש") |
| מנורה מבטחים פנסיה וגמל בע"מ | ✓ | ✓ | ✓ | ✓ | | 11321, 11322, 11323, 11320 | yes |
| כלל פנסיה וגמל בע"מ | ✓ | ✓ | ✓ | ✓ | | 15676, 15677, 15678, 15679 (inception 2026-03-09) | **no** (open question 2) |

Notes. All tracks except Infinity 11914 (2017-05-14) and Clal's four (2026-03-09) have inception date 2016-11-28. Harel's fund carries Tax Authority number 9438 (bylaw cover). The Gemel-Net field AVG_ANNUAL_MANAGEMENT_FEE shows 0 to 0.02 for these tracks, and some are null. That does not match the 0.23% NII pays, and the field's meaning is undefined (open question 9).

**Banks.** The 9 banks in NII's 2025 report (28 Jul 2026), p.3, read 2026-10-22: אוצר החייל, דיסקונט, הבינלאומי, הפועלים, יהב, לאומי, מזרחי (טפחות), מסד, מרכנתיל (דיסקונט). The same names appear in the MoF dataset `savingsplaninterest`. NII's withdrawal page lists e-mail channels for Yahav, Hapoalim and Mercantile, and an online form for Leumi.

**Regulators.** NII runs the programme (law). The Ministry of Finance (Accountant General) sets the list via tender (law 74ב(ד)(2); NII 2025 report). The CMA supervises the provident funds (Harel bylaw refers to the Commissioner, "הממונה"). The Bank of Israel supervises the banks; this is stated in Yahav 7.5 as bank-supervision directives.

## Open questions

1. **hly.gov.il blocked.** The current official list of approved funds and banks, and NII's track descriptions, are on hly.gov.il. NII's sub-pages redirect there, and it returned 403 to scripts on 2026-10-22: https://hly.gov.il/ProvidentFunds.html, https://hly.gov.il/banksManageInfo.html, https://hly.gov.il/Differences.html, https://hly.gov.il/. Next step: read it in a browser. **[2026-10-22 browser pass: Closed: hly.gov.il opens in a browser (CS-24, CS-25).]**
2. **Clal.** Is Clal on the approved provident list, since when, and through which tender? Gemel-Net 202609 has four Clal child-savings tracks with inception 2026-03-09 and very small TOTAL_ASSETS values, while NII's end-2025 report lists 9 funds without Clal. The answer is probably on hly.gov.il or in a Ministry of Finance tender notice. The web-search budget ran out before this could be searched further. **[2026-10-22 browser pass: Closed by CS-24: Clal is on NII's official list.]**
3. **Amendments to the 2016 regulations.** The Wikisource copy shows no amendments. Yet the default rules changed in 2020, 2022 and 2025, and law 74ב(ד)(1א) and (2א) were added. It is not known which instrument sets the default track. The answer is probably in the Knesset legislation database or Reshumot (Kovetz Takanot).
4. **First child's default fund.** How is the default fund for a first child picked today? The 2016 regulation 3(ב) used a fixed rotation, and Altshuler's page says rotation, but NII's current pages and report do not say. The answer is probably on hly.gov.il or in an amended regulation 3.
5. **Legal source of the age-18 grant (born up to 2016).** The current law 74ג(ב) mentions only the age-21 sum, and 74ג(א) was repealed. The age-18 grant is stated by NII and in bank agreements. The source is probably a transitional provision of amendment תשע"ז־9; its text was not read.
6. **Medical early withdrawal.** Law 74ד(ב) (read as a mirror summary) says the age-3 and age-13 sums are added. NII's page says a NIS 582 grant is deposited. Which applies to which birth cohort? Next step: read the verbatim 74ד(ב) and NII's medical-withdrawal procedure.
7. **Track definitions at other managers.** Only Harel's bylaw was read: equity 75%–120% in the increased-risk track, with the low and medium tracks at committee discretion. Are all managers' bylaws a uniform "standard bylaw" set by the CMA, and what equity range does each manager's low and medium track have? The answer is in each manager's bylaw and the CMA circular on the standard bylaw (gov.il, blocked for scripts).
8. **Fee after 21 at every manager.** 0.23% of balance is sourced for Harel (bylaw) and Altshuler (Q&A) only. The bylaw cap "דמי הניהול השנתי המרבי הקבוע בהסדר התחיקתי" has no figure here; it belongs to PF. Next step: read the bylaws of the other managers.
9. **Gemel-Net fee field for child-savings tracks.** AVG_ANNUAL_MANAGEMENT_FEE is 0 to 0.02 (or null) for all 41 tracks, while NII pays 0.23%. Is the field the fee charged to members (zero before 21), and in what unit? This is the same as discovery O11.
10. **Can a parent see whether the child's track was chosen or defaulted?** Funds report this to NII (CS-20), but no statement field or NII-page field was found that shows it to the parent. This directly blocks product.md 3.6. Possible places: the NII personal-information page (needs an ID), the annual statement, the manager's personal area.
11. **Annual statement layout for child savings.** The fields and labels were not found. The statement follows the Commissioner's format (Harel s.27). The answer is probably in the CMA circular on annual reports (PF) and a sample statement.
12. **Per-bank terms.** Only Yahav's agreement (undated, 2017-era figures) was read. Leumi's terms PDF (https://www.leumi.co.il/leumi-hebrew/s3fs-public/2023-06/SavingsForEachChild/terms_25.07.18.pdf), FIBI's (https://www.fibi.co.il/media/ypgewotq/הסכם-חיסכון.pdf) and Massad's (https://www.bankmassad.co.il/media/23kock3b/פ-409-מסד-הסכם-לפתיחת-חשבון-חיסכון-כולל-מדיניות-הפרטיות-2-26.pdf) appeared in search results but were not opened. Current rates are also missing, because the MoF dataset stops at 02/09/2025 (CS-23).
13. **After 18 or 21: moving into another product.** Can the child move the money into a regular (non-child) investment provident fund, or into another product, or add their own deposits? Regulation 11(ב) allows transfers "בין קופות גמל להשקעה", and it is unclear whether this is limited to child-savings funds. The bylaw allows deposits by NII only. The answer is probably in the CMA transfer rules (PF) and the manager's service pages.
14. **Bank-to-provident move: amendment and effective date.** The law text is from the mirror without a per-paragraph amendment note. NII's report says January 2025 and Altshuler says 1.1.2025. Next step: the Knesset amendment text. **[2026-10-22 browser pass: See CS-25: NII's page says bank money cannot move to a provident fund.]**
15. **Retroactive parental addition.** Can a parent who turns on the addition late make up past months? No source says so. Sources only say it starts the month after the request.
16. **KGL rules that may or may not apply.** Does the general investment-provident-fund deposit ceiling or any other KGL rule apply to child-savings funds? Not found. This belongs to the KGL and PF owners.

## Left out and why

- **Tax** on withdrawal, on the annuity option, and on track switches: this is in TXK's scope. The leads found here were passed to that file's owner.
- **General provident-fund rules** that the child fund shares (fee caps, transfer regulation detail, unclaimed-money and beneficiary mechanics such as Harel s.21's NIS 8,000 threshold, late-payment interest): these belong to PF.
- **Per-track returns, assets and exposures** from Gemel-Net: these are data, not rules, and the field definitions are unconfirmed (O11).
- **Historical 2017–2019 mechanics**, such as retroactive payment instalments and the 2016 notification campaign, are kept only where they explain today's holdings (CS-02, CS-07).
- **Per-manager online withdrawal links and phone numbers**: process detail for the switching playbook (R5), not rules.
- **NII savings calculator**: not read, because it is a calculator, not a rule source.
- **Kol Zchut**: returned 403. It was not needed, because primary sources covered the same ground.

## Sources

| Title | Publisher | Strength | URL | Checked |
|---|---|---|---|---|
| תכנית חיסכון לכל ילד (programme page) | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/default.aspx | 2026-10-22 |
| סכום החיסכון | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/sum.aspx | 2026-10-22 |
| פתיחת תכנית לילד שנולד | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/nolad.aspx | 2026-10-22 |
| הכפלת סכום החיסכון | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/HisahonKupot.aspx | 2026-10-22 |
| שינוי הגוף החוסך או המסלול | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/mavar.aspx | 2026-10-22 |
| משיכת החיסכון | NII | primary | https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/MeshihaHisahon.aspx | 2026-10-22 |
| שאלות ותשובות – חיסכון לכל ילד | NII | primary | https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx | 2026-10-22 |
| קצבת ילדים – תנאי זכאות | NII | primary | https://www.btl.gov.il/benefits/children/Pages/תנאי%20זכאות.aspx | 2026-10-22 |
| מידע אישי על תכנית החיסכון של הילד/ה | NII | primary | https://b2b.btl.gov.il/BTL.ILG.Payments/TochnitChisachonYeledListInfo.aspx | 2026-10-22 |
| חוזר 1356 "תוכנית חיסכון לכל ילד" (30 Nov 2016), with appendices 4 (law text, Sefer HaChukim 2511) and 5 (regulations as approved) | NII Benefits Administration | primary (historical) | https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf | 2026-10-22 |
| חיסכון ארוך-טווח לכל ילד וילדה – דוח הביטוח הלאומי לשנת 2025 (28 Jul 2026) | NII Research and Planning | primary | https://www.btl.gov.il/Publications/more_publications/Documents/HISAHON2025%20new.pdf | 2026-10-22 |
| חוק הביטוח הלאומי [נוסח משולב], ss.74ב–74ה | Wikisource (mirror of the law) | primary (mirror) | https://he.wikisource.org/wiki/חוק_הביטוח_הלאומי | 2026-10-22 |
| תקנות הביטוח הלאומי (חיסכון ארוך טווח לילד), התשע"ז-2016 | Wikisource (mirror) | primary (mirror) | https://he.wikisource.org/wiki/תקנות_הביטוח_הלאומי_(חיסכון_ארוך_טווח_לילד) | 2026-10-22 |
| Gemel-Net, resource 2024–today, period 202609, child-savings classification | CMA via data.gov.il | primary | https://data.gov.il/api/3/action/datastore_search?resource_id=a30dcbea-a1d2-482c-ae29-8f781f5025fb | 2026-10-22 |
| ריביות של פיקדונות חסכון לכל ילד - עדכון יומי | Ministry of Finance via data.gov.il | primary (stale) | https://data.gov.il/dataset/savingsplaninterest | 2026-10-22 |
| תקנון תקני לקופת גמל להשקעה לחיסכון ארוך טווח לילד – הראל חיסכון לכל ילד, מהדורה 3, 04/2026 | Harel Pension and Gemel | institution | https://media.harel-group.co.il/media/lved10ua/תקנון-הראל-חיסכון-לכל-ילד-אפריל-2026-_.pdf | 2026-10-22 |
| הסכם חיסכון ארוך טווח לילד ("חיסכון לכל ילד") (undated) | Bank Yahav | institution | https://bank-yahav.co.il/media/qxed4yhi/השקעות-מונגש-חסכון-לכל-ילד-צפייה-בהסכם-חיסכון-לכל-ילד.pdf | 2026-10-22 |
| חיסכון לכל ילד – withdrawal page | Bank Leumi | institution | https://www.leumi.co.il/Saving-Kids | 2026-10-22 |
| שאלות ותשובות בנושא חיסכון לכל ילד | Altshuler Shaham | institution | https://www.as-invest.co.il/interstedin/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%95%D7%94%D7%A9%D7%A7%D7%A2%D7%94/%D7%A9%D7%90%D7%9C%D7%95%D7%AA-%D7%95%D7%AA%D7%A9%D7%95%D7%91%D7%95%D7%AA-%D7%91%D7%A0%D7%95%D7%A9%D7%90-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%9C%D7%9B%D7%9C-%D7%99%D7%9C%D7%93/ | 2026-10-22 |
| חיסכון לכל ילד – הדוח השנתי (registration code and retro deposits only) | Altshuler Shaham | institution | https://www.as-invest.co.il/interstedin/חיסכון-והשקעה/חיסכון-לכל-ילד-הדוח-השנתי/ | 2026-10-22 |
| hly.gov.il pages (ProvidentFunds, banksManageInfo, Differences, home) | NII / Ministry of Finance | not read (403) | https://hly.gov.il/ | 2026-10-22 |
| Kol Zchut, חיסכון לכל ילד | Kol Zchut | not read (403) | https://www.kolzchut.org.il/he/חיסכון_לכל_ילד | 2026-10-22 |
