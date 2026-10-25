# R-prov: official texts for the provident-fund, pension, insurance and labour sources (2026-10-25)

Agent R-prov. Scope: the map of official texts for the provident-fund, pension, insurance and labour laws and regulations, and the Capital Market Authority (CMA) documents that the rule base cites through copies (Wikisource, Nevo, and PDFs re-hosted by analyst.co.il, prisha.co.il, adif-web-bucket and meitav.co.il). I edited no rule-base or data file. Outputs:

- `maps/prov.json`: 83 entries (77 official, 6 "not-a-copy" institution documents), 143 official citations. Every quote was checked by script against the cited file page (pdftotext, normalised), and 0 failed.
- `requests/R-prov.json`: 55 rows: the Reshumot host, `official_url` for 9 existing documents.json rows, one row to remove a generic token that hijacks titles, and full-title rows for each amendment booklet and circular.
- This report. The paste-ready link forms are in the appendix.

How to read the map: `file_page` is the PDF file page, checked on the page. For Reshumot file-service URLs the page goes in the URL as `#page=N` and stays in the locator as `p.N`. For `fs.knesset.gov.il` gazettes, `p.N` is the file page and each basis gives the gazette offset. Quotes come from normalised pdftotext. When you paste one, keep the words and fix the spacing around numbers (pdftotext writes "2%לשנה" for "2% לשנה").

## Per document: what the official text is and what changed

**CMA circular 2017-9-17 "העברת כספים בין קופות גמל"** (27 citations: SW-02 to SW-12, PF-20)
- The official text is the gov.il collector PDF `regulation-988/he/regulation_h_2017-9-17.pdf`. It is byte-identical to the 28-page circular. The analyst.co.il copy is a Dec 2017 re-save with the same pages, so every page number carries over.
- Mapped: 15 provisions, covering ss.3(א)-(יג), 4, 5, 5א, 6, 9, 11 and annexes A, D, E, F and 11. Kind: copy replaced, page verified.
- Currency: it is still the latest in-force circular on this subject.
  - The consolidated circular (קודקס הרגולציה, updated 04.06.2026) publishes no pension-product file (gate 6 part 4). Its list of absorbed circulars dates from 2014.
  - After 2017-9-17 the collector shows only a 2018 draft amendment, circular 2020-9-2 (central severance funds) and clarification 2020-7709.
- SW-16, SW-19, SW-23 and SW-38 cite this circular with no locator. They should take the entry that fits their point.

**CMA circular 2017-9-15 "דמי ניהול במכשירי החיסכון הפנסיוני – תיקון"** (PF-16 and its 4 figures; SW-15, SW-38)
- Official: `regulation-989/he/regulation_h_2017-9-15.pdf` (7 pages). The prisha copy matches it page for page.
- s.3א is on p.2 and s.4 is on p.3, with appendices on pp.5-7.
- The 2020-9-14 COVID temporary order touches only s.3(ב)(1).

**CMA circular 2020-9-22 "דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון"** (PF-33 to PF-38)
- Official: `r_2020-9-22/he/2020-9-22.pdf` (152 pages). It matches the prisha copy page for page, so the rule pages stand.
- A 2025 draft amendment (notice_2025_51) is not in force.

**CMA annual report** (PEN-06, PEN-19, PEN-23; the adif-web-bucket copy is a 112-page full report)
- gov.il publishes the report only chapter by chapter:
  - 2024: page `press_0083`.
  - 2025: page `tender-0102`, published 07.09.2026.
- Page conversions from the copy:
  - Copy p.10 is 2024 chapter 2, file p.2.
  - Copy p.57 (table ד-13) is 2024 chapter 4, file p.14.
- The 2025 report supersedes table ד-13 with table ד-14 (chapter 4, file p.12). I mapped PEN-19 to the 2025 table as the newest edition (see "Figures that differ").
- The 2025 chapter 2, p.4, adds the June 2025 allocation mechanism among the selected funds. It does not replace the fourth selection process, which PEN-06 and PEN-23 cite.

**תקנות ... (העברת כספים בין קופות גמל), התשס"ח-2008** (Wikisource and Nevo 999_929; about 30 citations)
- Official text: the base booklet ק"ת 6657 plus the amendment booklets 7407 (2014), 8735 (2020), 10170 (2022) and 10716 (2023), all on the Reshumot file service and all read.
- Mapped: regs. 1, 2, 3, 4, 5, 6-7, 8 and 9.
- Points from the amendments:
  - Reg. 3(א)(11א) (gemel lehashkaa to gemel lehashkaa) and reg. 2(א)(7) come from 2020.
  - Reg. 4(8) and the reg. 9(ד) wording SW-14 quotes come from 2014.
  - The 2022 amendment renamed "קרן חדשה זכאית" to "קרן חדשה מקיפה".
- Open: the 2020 amendment's footnote cites a "התשע"ו, עמ' 634" amendment that is not in the Wikisource list. It is unverified.

**תקנות ... (דמי ניהול), התשע"ב-2012** (Wikisource and Nevo 500_714)
- Official: ק"ת 7131 (base), 7358 (2014) and 9942 (2022).
- Every figure matches the gazette: 1.05% / 4%, 0.5% / 6%, 2%, 0.3% for lost-contact members, and 0.3% for old-age annuitants from 1.2.2022.

**תקנות ... (הוצאות ישירות בשל ביצוע עסקאות), התשס"ח-2008** (PF-10, PF-12)
- Official: ק"ת 6652 (base), 8744 (2020, adds reg. 3ב) and 10377 (2022/3).
- The 2022/3 amendment rewrote reg. 2, added reg. 2א, amended reg. 3ב (expected annual cost) and repealed reg. 4. The gazette confirms PF-12's summary.

**תקנות ... (קופת גמל בניהול אישי), התש"ע-2009** (Nevo 500_217; Meitav's re-host of the 2017 amendment)
- Official: ק"ת 6820 (base, gazette pp.54-60). The Wikisource box links 6829 by mistake; I took the token from the gov.il gazette collector.
- Amendments: 6901 (2010), 7819 (2017) and 7880 (2017/8). The Meitav PDF is a re-host of booklet 7819; reg. 11(ב) is on p.5 of both.
- **IRA-18 is out of date.** Since ק"ת 7880, reg. 12 requires a competitive process among at least **eight** participants, not four. The 20% cap on related-party commissions is gone; only "not above the winner's commission" remains. A new reg. 12(ג) lets the member choose a broker.

**חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005** (Wikisource and Nevo 70391; 28 rule citations plus 5 link-less mentions)
- No consolidated official text exists:
  - The CMA collector has bills only.
  - The Knesset serves gazettes only (31 amending laws, all downloaded).
- Mapped: base ס"ח 2024 plus the amendment that last touched each cited section.
  - Amendment 15 (2016): gemel lehashkaa in ss.1, 13, 22, 25.
  - Amendments 12 and 16: s.20.
  - Amendment 13: ss.24א-24ב.
  - Amendment 20: s.32.
  - Economic Efficiency Law 2021, ס"ח 2932: ss.34א-34ז, including 5.15% and 30% / 70%, which match PEN-18.
  - Amendments 3, 5 and 21: s.23.
- Not pinned to their last amending page: the current wording of s.23(א)(1)(ב) and (2א); s.22 after 2016; s.39(ג) after 2018. Each entry lists these amendments.
- Several 2015-2016 Knesset PDFs have a doubled text layer, so the quotes there are short.
- Link-less mentions to turn into links: KH-02 (s.1), KH-03 (s.20), KH-17 (s.23(ב)(2)), KH-22 (s.32(א)), TXA-13 (s.1). I added them to `cited_by`.

**חוק גיל פרישה, התשס"ד-2004** (KH-12, PEN-26, KGL-09, TXK-10, SW-21)
- Official: base ס"ח 1919 plus the Economic Plan Law 2021-2022, ס"ח 2933.
  - s.3 now reads "לגבר וגיל 65 לאישה": file p.172 (gazette p.250).
  - The new schedule rows run up to December 1969: file p.174 (gazette p.252).
- ss.4-5 (67; early retirement at 60) are unchanged base text. All figures match.

**חוק הגנת השכר** (PEN-36)
- Official: Amendment 24, ס"ח 2162 (2008). s.24 is on p.2 and the schedule items 5(6), 6(4) and 7 are on p.6.
- The 2014 law replacing the term "מעביד" (ס"ח 2459) is why PEN-36's quote reads "המעסיק" where the 2008 page reads "המעביד".

**חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים)** (PF-22, SW-17, SW-18)
- Official: base ס"ח 2024 p.918 plus Amendment 3 (ס"ח 2280, 2011), which added the clearing-house chapter (ss.31ט-31טז).
- Not pinned: later changes to s.13 (2015), s.31ט (2015, 2016), s.31טז (2024) and s.32 (2023 and 22.7.2026).

**חוק הפיקוח על שירותים פיננסיים (ביטוח)** (REG-17, REG-19)
- s.1א is from ס"ח 2582 (2016), p.2. ss.68 and 70 are base 1981 pp.15-16.
- Their 2016 rewording ("המפקח" to "הממונה") is not pinned.

**Insurance regulations** (INS-25, INS-26)
- תנאים בחוזי ביטוח:
  - reg. 6א: ק"ת 6284 (2004: the 1/12% and 2/12% rates; scanned, OCR), 6609 (2007: 6א(א2)) and 7131 p.9 (2012: "פוליסה שאינה קופת ביטוח").
  - reg. 6ב: ק"ת 5804 (1996).
- דרכי השקעת ההון: reg. 1 is in ק"ת 6094, pp.7-8.
- פרטי דין וחשבון: **repealed on 20.6.2023** (ק"ת 10695, p.2).

**Institution documents marked as copies** (SW-15, SW-21, SW-38)
- These are not copies of official texts:
  - Altshuler Shaham and Infinity standard bylaws (תקנון תקני) for gemel lehashkaa.
  - Harel's one-page gemel lehashkaa flyer.
  - Two Phoenix FAQ pages.
  - The ice.co.il news article, which is secondary.
- The extract labelled them copies because they sit as bare links [1]..[8] in pointer rules, with no strength word per link.
- Fix: give each link its own word (institution or secondary), or keep only pointers to the cited rules.
- The bylaws follow the CMA template "תקנון תקני לקופת גמל להשקעה" (gov.il `regulation-2829/he/regulation_hm_takanongemel.pdf`, 2016).

## Rules whose text does not match the official text (rule text not changed)

1. **IRA-18** (reg. 12):
   - Figures that differ: `min_participants` is 4 in the record and 8 in ק"ת 7880 p.2.
   - `related_party_commission_cap` (20%) was repealed by 7880.
   - Missing from the rule: the new reg. 12(ג), a broker the member chooses.
2. **SW-05 and PF-20** (circular s.3(ז)): the rules say the three business days run from the determining date. The circular counts them "ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה" (p.2).
3. **INS-25**: the quoted reg. 6א(א) reads "פוליסות ... שאינה קופת ביטוח". The 2012 gazette text (7131 p.9) reads "פוליסת ביטוח חיים משתתף ברווחים שאינה קופת ביטוח". The quote needs the singular.
4. **INS-25 definition chain**: the investment regulations define "ביטוח חיים משתתף ברווחים" by reference to the report-details regulations, which were repealed in 2023.
5. **PEN-36**: the quote "הפרשות המעסיק" is the post-2014 wording. If the 2008 page is cited, also cite the 2014 term-change law, as the map does.

## Figures that differ (newer official edition)

- PEN-19: the record shows the 2024 actuarial surplus/deficit for the new pension funds. The 2025 report, table ד-14 (chapter 4, file p.12), repeats the same 2024 values and adds 2025: Infinity 0.14%, Altshuler Shaham 0.02%, Mor -0.06%, Phoenix 0.01%, Meitav 0.13%, Clal -0.03%, Harel -0.03%, Migdal Makefet 0.09%, Menora -0.28%.
- IRA-18: see item 1 above.
- All other checked figures match the official texts: PEN-18, PEN-21, PEN-22, KH-22, SW-04 to SW-12, PF-16, IRA-14, PEN-26, KH-12, INS-25, INS-26.

## For the founder

- IRA-18 needs a rule update: eight participants, no 20% cap, and the member's own broker.
- PEN-19: move to the 2025 figures, or keep the 2024 year and say so.

## Left open

- Found later with the Wayback CDX index the coordinator suggested, and added to the map (3 entries, 83 in total):
  - KGL-13: circular 2020-9-18 (`investmentsoptions16112020/he/2020-9-18.pdf`). The wording is on p.4, and the current edition 2022-9-30 keeps it on p.4.
  - PEN-17: circular 2022-9-30 (`notice-2022-9-30/...pdf`, p.3, the halacha track).
  - CAT-41: circular 2018-9-26 (`regulation-710`). It is superseded by 2020-9-22, which carries the same note on p.13.
- Still not found (not in the Wayback index): circular 2015-9-9 (CAT-40) and notice 2024-1471 (PEN-17).
- Provident Funds Law: last-amendment pages for ss.22, 23(א)(1)(ב), 23(א)(2א) and 39(ג).
- Advice law: s.13 (2015), s.31ט, s.31טז (2024) and s.32 (2023, 2026).
- Insurance law: ss.2, 68, 70 (2016, 2018).
- Insurance terms: reg. 1 changes of 1995 and 2004.
- Transfer regulations: the possible 2016 (התשע"ו p.634) amendment.
- Not in my scope: the Nevo pages 255_001b and 255_226 (income-tax regulations), the "כללי מס הכנסה (פטור ממס בשל העברה ושינוי יעוד)" Wikisource page, and the government-bond regulations (Nevo 999_564, 999_782, 221_031, 221_001, 72417, already in other.json).

## Appendix: paste-ready link forms (one per official citation in the map)

#### חוזר גופים מוסדיים 2017-9-17 "העברת כספים בין קופות גמל" (2.10.2017)

- s.3(א)-(ג) (receiving fund checks eligibility, gives forms) (cited by SW-02, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(א)-(ג) "הגוף המנהל של קופה מקבלת יבדוק אם ניתן לבצע העברה של עמית המבקש לעבור מקופה מעבירה לקופה המקבלת" · checked 2026-10-25 · primary`
- s.3(ו) (forwarding within two business days of the determining date) (cited by SW-04, SW-04, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(ו) "בתוך שני ימי עסקים מהמועד הקובע; לבקשה תצורף הצהרה בטופס לפי הנוסח שבנספח ד'" · checked 2026-10-25 · primary`
- s.3(ז)-(ח) (rejection or delay notice within three business days) (cited by SW-05, SW-05, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(ז) "בתוך שלושה ימי עסקים ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה" · checked 2026-10-25 · primary`
- s.3(ט)-(יא) (cancellation notice; deposits returned within ten business days) (cited by SW-07, SW-07, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.2-3, s.3(ט)-(יא); p.3 for the ten business days "בתוך עשרה ימי עסקים מהיום שבו התברר לו כי בוטלה הבקשה" · checked 2026-10-25 · primary`
- s.3(יב)-(יג) (request lapses: 120 / 60 days) (cited by SW-08, SW-08):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.3, s.3(יב), (יג) "כי לא יופקדו בשלו כספים לקופה ,בקשתו תפקע אם לא תועבר לגוף המנהל של קופה המעבירה" · checked 2026-10-25 · primary`
- s.4 (transfer to a new pension fund: notional deposit, cover, qualifying months) (cited by SW-12, SW-12):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.3-5, s.4(א) on p.3 (12 months), s.4(ב)(2) on p.4 (10%) "החודשים האחרונים שבשלם הופקדו בפועל כספים כאמור; לעניין זה לא יובאו בחשבון הפקדות כספים בשל מרכיב הפיצויים" · checked 2026-10-25 · primary`
- s.5(א)-(ג) (data file sent with the money) (cited by SW-11):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.7, s.5(א)-(ג) "לפי הפורמט ופירוט השדות שבנספח ז'" · checked 2026-10-25 · primary`
- s.5(ה)-(ו) (late transfer: data within five business days) (cited by SW-06, SW-06):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.8, s.5(ה), (ו) "בדואר אלקטרוני ובתוך חמישה ימי עסקים ממועד העברת הכספים" · checked 2026-10-25 · primary`
- s.5א and Annex 11 (notice to the employer within 15 business days) (cited by SW-10, SW-10):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.8, s.5א; Annex 11 on pp.26-27 "בתוך חמישה עשר ימי עסקים ממועד העברת הכספים" · checked 2026-10-25 · primary`
- s.6 (confirmations to the member within 15 business days) (cited by SW-09, SW-09, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.8-9, s.6(א) on p.8, s.6(ב) on p.9 "לא יאוחר מחמישה עשר ימי עסקים מיום העברת הכספים ,אישור על העברת הכספים שיכלול לפחות פרטים אלה" · checked 2026-10-25 · primary`
- ss.9, 11 (repeal of circular 2015-9-1; commencement) (cited by PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.9, s.9; p.10, s.11 "תחילתן של הוראות חוזר זה" · checked 2026-10-25 · primary`
- Annex A (transfer request form, parts 1-3; cancellation sentence) (cited by SW-02, SW-03, SW-08, PF-20):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.11-17 (Annex A1 from p.11); cancellation sentence on p.12 "בקשת העברה זו ניתנת לביטול ובלבד שהכספים טרם הועברו" · checked 2026-10-25 · primary`
- Annex D (handling employee declaration) (cited by SW-04):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.19, Annex D "טופס הצהרת עובד מטפל" · checked 2026-10-25 · primary`
- Annex E, E1 (rejection, delay) (cited by SW-05):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.20 (Annex E), p.21 (Annex E1) "דחיית בקשה להעברת כספים" · checked 2026-10-25 · primary`
- Annex F (member cancellation notice) (cited by SW-07):
  - `[חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.22, Annex F "הודעת עמית על ביטול בקשת העברה" · checked 2026-10-25 · primary`

#### חוזר גופים מוסדיים 2017-9-15 "דמי ניהול במכשירי החיסכון הפנסיוני - תיקון" (11.9.2017)

- s.3א (notice of a discount; email within 10 business days) (cited by PF-16, PF-16):
  - `[חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf) p.2, s.3א(א)-(ג) "יציג הגוף המוסדי ,בהקדם האפשרי ,הודעה על מתן ההנחה ,בחשבון האישי המקוון של העמית" · checked 2026-10-25 · primary`
- s.4 (notice before a fee increase; two / four months; SMS 30 days ahead; appendices A, B) (cited by PF-16, PF-16, SW-15, SW-38):
  - `[חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf) p.3, s.4(א)-(ד); appendices A and B follow on pp.5-7 "הודעה כאמור לא תישלח מוקדם יותר מארבעה חודשים לפני מועד ההעלאה הצפוי" · checked 2026-10-25 · primary`

#### חוזר גופים מוסדיים 2020-9-22 "דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי - תיקון" (14.12.2020)

- ss.1-10 (who gets which report, when) (cited by PF-33):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.2-5, ss.1-10; p.35 (chapter 1 sign ב general directions) "מדי שנה ,תוך שלושה חודשים מתום השנה ,דוח שנתי מקוצר בגין השנה שהסתיימה" · checked 2026-10-25 · primary`
- chapter 1 sign ב (shortened annual report, provident / study fund / gemel lehashkaa) (cited by PF-34, PF-35):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.32-42 (template p.32, directions pp.35-42; fee definitions pp.37-39) "דוח שנתי לעמית בקופת גמל/להשקעה/קרן השתלמות" · checked 2026-10-25 · primary`
- chapter 1 sign ב, table ג (fee definitions) (cited by PF-35):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.37-39; quarterly directions pp.149-150 "דמי ניהול מהפקדה – יש להציג את שיעור דמי הניהול מהפקדה שוטפת שנגבו בפועל מהחשבון בתקופת הדוח" · checked 2026-10-25 · primary`
- chapter 1 sign ג (shortened annual report, new pension fund) (cited by PF-38):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.44-45; detailed pension report pp.116-121 "דוח שנתי לעמית בקרן הפנסיה החדשה" · checked 2026-10-25 · primary`
- chapter 2 sign ב (detailed annual report, provident / study fund / gemel lehashkaa) (cited by PF-36):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.92-114 "דוח שנתי מפורט לעמית בקופת גמל ,בקרן השתלמות ובקופת גמל להשקעה" · checked 2026-10-25 · primary`
- chapter 3 (quarterly report) (cited by PF-37, PF-35):
  - `[חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf) pp.149-151 "את מלא הדוח במתכונת הדוח השנתי המקוצר לפי סימן ב' לפרק 1בחוזר זה" · checked 2026-10-25 · primary`

#### דוח הממונה על שוק ההון, ביטוח וחיסכון לשנת 2024 (re-hosted at adif-web-bucket)

- p.10 of the copy (chapter 2: fourth selected-pension-fund process) (cited by PEN-06, PEN-23, pension-and-gemel-lekitzba.md):
  - `[דוח הממונה על שוק ההון, החיסכון והביטוח לשנת 2024 – פרק 2: סקירת פעילות הרשות](https://www.gov.il/BlobFolder/news/press_0083/he/Commisioner%20Report%20Design%20B_chapter2%20ver6_digital.pdf) p.2 (printed 10) "השלימה הרשות את ההליך הרביעי לקביעת קרנות פנסיה נבחרות" · checked 2026-10-25 · primary`
  - `[דוח הממונה על שוק ההון, ביטוח וחיסכון לשנת 2025 – פרק 2: סקירת פעילות הרשות](https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%202_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf) p.4 "נכנס לתוקף מנגנון חלוקה חדש בין קרנות הפנסיה הנבחרות" · checked 2026-10-25 · primary`
- p.57 of the copy, table ד-13 (actuarial surplus / deficit of new pension funds 2021-2024) (cited by PEN-19):
  - `[דוח הממונה על שוק ההון, ביטוח וחיסכון לשנת 2025 – פרק 4: נתונים כמותיים – החיסכון הפנסיוני](https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%204_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf) p.12, table ד-14 (2022-2025) "שיעור העודף או הגירעון האקטוארי בקרנות הפנסיה החדשות" · checked 2026-10-25 · primary`
  - `[דוח הממונה על שוק ההון, החיסכון והביטוח לשנת 2024 – פרק 4: נתונים כמותיים בתחום החיסכון הפנסיוני](https://www.gov.il/BlobFolder/news/press_0083/he/Commisioner%20Report%20Design%20B_chapter4%20ver%206.0_digital.pdf) p.14, table ד-13 (2021-2024) "שיעור העודף או הגירעון האקטוארי בקרנות הפנסיה החדשות" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008

- reg. 1 (definitions: מועד קבלת הבקשה, המועד הקובע, גיל הפרישה המוקדמת, מועד התשלום הראשון) (cited by SW-04, PF-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=3) p.3, reg. 1 "בתקנות אלה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.1 (amends reg. 1) "ונמסרו טופסי הצטרפות מלאים" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o=#page=2) p.2, s.1 (adds "גיל הפרישה המוקדמת") "כמשמעותו בסעיף 5לחוק גיל פרישה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ג-2023 (קובץ התקנות 10716)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/ZZKYP1JasTIK3+puGrB48nEoGOFH3NQjhXnAe4snPwo=#page=3) p.3, s.1 (adds "מועד התשלום הראשון") "כהגדרתו בסעיף 16(9א)(ג) לפקודת מס הכנסה" · checked 2026-10-25 · primary`
- reg. 2 (transfers into an annuity fund: 2(א)(1), (2), (4), (6), (7); 2(ב)(1), (2); 2(ד)) (cited by SW-01, SW-23, SW-40, KGL-09, TXK-10, PF-17, KH-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א); 2(ב) continues on p.5 "העברת כספים לקופת גמל לקצבה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.2 (amends reg. 2(א)(2), 2(ד)) "קופת גמל לתגמולים ,ובלבד שהקופה המקבלת היא קופת גמל משלמת לקצבה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o=#page=2) p.2, s.2 (adds reg. 2(א)(7), 2(ב)(2)) "קופת גמל להשקעה ,ובלבד שהעמית הגיע לגיל הפרישה המוקדמת" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ג-2023 (קובץ התקנות 10716)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/ZZKYP1JasTIK3+puGrB48nEoGOFH3NQjhXnAe4snPwo=#page=3) p.3, s.2 (replaces the opening of reg. 2(ד)) "גוף מנהל של קופה מקבלת לא יהיה רשאי לקבל כספים שלא ניתן להעביר" · checked 2026-10-25 · primary`
- reg. 3 (transfers between non-annuity funds: 3(א)(1), (4), (11א), (12); 3(ב)(1)) (cited by SW-01, SW-23, SW-39, KGL-10, TXK-04, TXH-19, KH-17, PF-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=5) p.5, reg. 3(א)(1)-(12); reg. 3(ב) on p.6 "ניתן להעביר כספים מקופת גמל אחת לקופת גמל אחרת שאינה קופת גמל לקצבה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 3(ב)(1) "תיעשה לחשבון על שם העמית העובר בקופה המקבלת ,ויראו לעניין דיני המס ,את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o=#page=2) p.2, s.3 (adds reg. 3(א)(11א)) "מקופת גמל להשקעה לקופת גמל להשקעה אחרת" · checked 2026-10-25 · primary`
- reg. 4 (limits on transfer, incl. 4(8)) (cited by SW-13, SW-22, PF-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 4(1)-(6) "לא ניתן להעביר כספים מקופה מעבירה לקופה מקבלת במקרים אלה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.3 (adds reg. 4(8)) "העמית הגיש בקשת העברה לקרן חדשה זכאית מקופת גמל שאינה קרן חדשה זכאית" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=#page=7) p.7, s.2 ("קרן חדשה זכאית" becomes "קרן חדשה מקיפה") · checked 2026-10-25 · primary`
- reg. 5 (transfer within ten business days; Commissioner extension; amount moved) (cited by SW-06, SW-06, SW-13, PF-19, KGL-10, KH-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 5(א); 5(ב) follows on p.6-7 "בתוך עשרה ימי עסקים מהיום שבו הועברה לו בקשת העברה מפורטת ,חתומה ומלאה" · checked 2026-10-25 · primary`
- regs. 6-7 (late transfer; transfer directly between managers, in cash) (cited by SW-06, PF-19):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=7) pp.6-7, reg. 6 (from p.6); reg. 7 on p.7 "העברת כספים בין קופות תתבצע ישירות בין הגופים המנהלים של הקופות" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.4 (amends reg. 6: "תשואת", fifteen business days, adds 6(ג1)) "בתוך חמישה עשר ימי עסקים מהמועד שבו נודע לו כאמור" · checked 2026-10-25 · primary`
- reg. 8(א)-(ג) (insurance liability on a transfer) (cited by SW-12):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=7) p.7, reg. 8(א)-(ג) (continues on p.8) "יהיה אחראי לתשלום כספים לפי הכיסויים בקופה המעבירה בשל מקרה ביטוח" · checked 2026-10-25 · primary`
- reg. 9(א)-(ד) (merging and splitting accounts; partial transfers) (cited by PF-18, SW-14, SW-39, TXH-19, KH-17):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=8) p.8, reg. 9(א)-(ג) "איחוד חשבונות של עמית באותה קופת גמל על ידי העברת כספים מחשבון אחד לחשבון אחר" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=5) p.5 (replaces reg. 9(ד)) "לפי סדר הפקדתם, מן המועד המאוחר ביותר עד המועד המוקדם ביותר" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=#page=7) p.7, s.3 (reg. 9(ד): "מקיפה או קרן חדשה כללית") "מקיפה או קרן תיקון תקנה 9 חדשה כללית" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012

- reg. 2 (caps in a provident fund: 2(א)(1) 1.05% of balance, 2(א)(2) 4% of deposits, 2(א)(2א), 2(א)(4), 2(ב)) (cited by PF-02, PF-03, KGL-14, PEN-22, PEN-22):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=4) p.4, reg. 2(א)(1)-(3); 2(ב) continues on p.5 "מן היתרה הצבורה בחשבונו של כל עמית בשיעור שלא יעלה על 1.05% לשנה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשע"ד-2014 (קובץ התקנות 7358)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAeOdRzFXelp1D6CGA3tNK3g=#page=4) p.4, s.2 (adds reg. 2(א)(2א)) "לעניין עמית אשר באחד מחשבונותיו בקופת גמל שאינה קופת ביטוח" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשפ"ב-2022 (קובץ התקנות 9942)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/8HBFRznZ1PqBBqBlhhXAb7L47e1dgbmyX~fXnBHkch8=#page=2) p.2, s.1 (adds reg. 2(א)(4): 0.3% for old-age annuitants of insurance policies from 1.2.2022) "לעניין מקבלי קצבת זקנה בפוליסות ביטוח שהוצאו לפי קופות ביטוח" · checked 2026-10-25 · primary`
- reg. 3 (caps in new comprehensive / general pension funds: 3(א) 0.5% / 6%, 3(א)(1א), 3(ב), 3(ג)) (cited by PF-04, PF-05, PEN-21, PEN-21):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=5) p.5, reg. 3(א)(1)-(3), 3(ב) "מתוך התשלומים המועברים לקרן בשל כל עמית -בשיעור שלא יעלה על ;6%" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשע"ד-2014 (קובץ התקנות 7358)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAeOdRzFXelp1D6CGA3tNK3g=#page=4) p.4, s.3 (replaces reg. 3(ב)(3)) · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשפ"ב-2022 (קובץ התקנות 9942)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/8HBFRznZ1PqBBqBlhhXAb7L47e1dgbmyX~fXnBHkch8=#page=2) p.2, s.2 (adds reg. 3(א)(1א) and 3(ב)(3)(ג): 0.3% for old-age annuitants from 1.2.2022) · checked 2026-10-25 · primary`
- regs. 4-6 (2% cap for study funds, IRA, central and other funds; sector funds; track funds) (cited by PF-06, KGL-14, KH-22, KH-22, PEN-22):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6) p.6, regs. 4, 5, 6 "רשאית לגבות דמי ניהול מיתרת הכספים הצבורה בחשבונו של כל עמית ,בשיעור שלא יעלה על 2%לשנה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשע"ד-2014 (קובץ התקנות 7358)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAeOdRzFXelp1D6CGA3tNK3g=#page=4) p.4, s.4 (reg. 6: "למעט לעניין תקנה (2א)(2א)") "בתקנה 6לתקנות העיקריות ,בסופה יבוא" · checked 2026-10-25 · primary`
- regs. 7-8 (temporary 1.1% until 2013; 0.3% for lost-contact and deceased members) (cited by PF-02, KH-22):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=6) p.6, regs. 7, 8(א) "בשיעור שלא יעלה על 0.3%לשנה" · checked 2026-10-25 · primary`
- regs. 10, 10א, 12 (pro-rata fee; indexation; commencement 1.1.2013) (cited by PF-02, KH-22, KGL-14):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=8) p.8, regs. 9-12 "בדמי ניהול בשיעור יחסי למספר הימים שנוהלו בחשבון באותו חודש" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול) (תיקון), התשע"ד-2014 (קובץ התקנות 7358)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAeOdRzFXelp1D6CGA3tNK3g=#page=5) p.5, s.8 (adds reg. 10א) "יתעדכן ביום העסקים הראשון בכל שנה" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות), התשס"ח-2008

- regs. 1-2 (closed list of direct expenses; external management fee; post-2023 specialised tracks) (cited by PF-10):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות), התשס"ח-2008 (קובץ התקנות 6652)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpsFM+Hq~v6+ysOsYBj7v7sI=#page=2) p.2, reg. 2 (2008 list) "בשל ביצוע עסקאות בנכסי קופת גמל יהיו אלה בלבד" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות) (תיקון), התשפ"ג-2022 (קובץ התקנות 10377)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dRGsI+SrmavYbn73icZsjwvAYSdKZdahWniBQ2IENis=#page=2) p.2, s.2 (reg. 1: "עמלת ניהול חיצוני" defined by six situations) "הוצאה הנובעת מכל אחד מאלה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות) (תיקון), התשפ"ג-2022 (קובץ התקנות 10377)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dRGsI+SrmavYbn73icZsjwvAYSdKZdahWniBQ2IENis=#page=4) pp.3-5, s.3 (reg. 2(א)(9)-(10) added; reg. 2(ב) specialised tracks set up after 1.1.2023) "שבתקנונו נקבע כי עיקר השקעותיו הן השקעות בנכסים סחירים" · checked 2026-10-25 · primary`
- reg. 3ב (disclosure of direct expenses; expected annual cost) (cited by PF-12):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות) (תיקון), התש"ף-2020 (קובץ התקנות 8744)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mkr7NqSpiUfGbyQHeI17Cx8=#page=2) p.2, s.2 (adds reg. 3ב(א)-(ב)) "גוף מוסדי יידע אדם המעוניין להצטרף כעמית או כמבוטח לקופת גמל" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (הוצאות ישירות בשל ביצוע עסקאות) (תיקון), התשפ"ג-2022 (קובץ התקנות 10377)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dRGsI+SrmavYbn73icZsjwvAYSdKZdahWniBQ2IENis=#page=7) p.7, s.6 (reg. 3ב: expected annual cost; 3ב(ג), (ד)) "בכל מקום שבו קיימת חובה על פי דין להציג לעמית או למבוטח את דמי הניהול" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009

- reg. 3 (who gives investment instructions; one person per account; no restriction) (cited by IRA-05):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=3) p.3, reg. 3(ב)-(ג) "והחברה המנהלת לא תטיל כל מגבלה על אפשרויות הבחירה של העמית באדם האמור" · checked 2026-10-25 · primary`
- reg. 5(ב)-(ג) (quarterly compliance check; 7 business days notice; 45 business days cure) (cited by IRA-14, IRA-14):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=4) p.4, reg. 5(ג)(1)-(3) "בתוך תקופה שלא תעלה על ארבעים וחמישה ימי עסקים מיום המצאתה" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017 (קובץ התקנות 7819)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YWZP5bJenUsJq8XlM540e3hb~slMjpWNpg18mW8KtBk=#page=4) p.4, s.4(ב) (reg. 5(ג)(2): breach "שנוצרה בשל השקעה חדשה") "שנוצרה בשל השקעה חדשה" · checked 2026-10-25 · primary`
- reg. 6 (written agreement; member may cancel at any time without charge) (cited by IRA-15):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=4) p.4, reg. 6(א)-(ב) "העמית רשאי לבטל בכל עת את ההסכם בינו לבין החברה המנהלת" · checked 2026-10-25 · primary`
- reg. 7 (closed list of charges; custody fee cap since 2017) (cited by IRA-16):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=4) p.4, reg. 7(א) (continues on p.5) "דמי הניהול וההוצאות שייגבו מנכסי הקופה יהיו אלה בלבד" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017 (קובץ התקנות 7819)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YWZP5bJenUsJq8XlM540e3hb~slMjpWNpg18mW8KtBk=#page=4) p.4, s.5 (reg. 7(א)(2), (3), (5), (6)) "ובלבד שדמי השמירה או העמלה לא יעלו על דמי השמירה או העמלה הנגבים מקופות הגמל שאינן קופות גמל בניהול אישי" · checked 2026-10-25 · primary`
- reg. 8 (no credit, pledges, guarantees or member loans) (cited by IRA-13):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=5) p.5, reg. 8 "שעבוד נכסים, הלוואות לעמיתיה" · checked 2026-10-25 · primary`
- reg. 11 (transfers into / out of an IRA: cash or in kind; 11(ב) clock starts when all assets are sold) (cited by IRA-23, SW-24):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=5) p.5, reg. 11 (now 11(א)) "תיעשה במזומנים או בנכסים ,לפי בחירת העמית" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017 (קובץ התקנות 7819)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YWZP5bJenUsJq8XlM540e3hb~slMjpWNpg18mW8KtBk=#page=5) p.5, s.7 (adds reg. 11(ב)) "נכסי הקופה למזומנים" · checked 2026-10-25 · primary`
- reg. 12 (brokers chosen by a competitive process; related-party trades) (cited by IRA-18, IRA-18):
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ח-2017 (קובץ התקנות 7880)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/iXRl3JX663X67T342MLtmOhZrYskYBxrQk+FHRN~mJM=#page=2) pp.2-3, s.1 (reg. 12 replaced: 12(א) every three years among at least eight participants; 12(ב) related party only at no more than the winner's commission; 12(ג) a broker chosen by the member) "הליך תחרותי שיתקיים אחת לשלוש שנים לפחות בין שמונה משתתפים לפחות" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי), התש"ע-2009 (קובץ התקנות 6820)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/aA+Qh3g77QNmRelSc3xeJ0cYncnL0AKU6J5OI6GlOZQ=#page=6) p.6, reg. 12 as first enacted (four participants; no related party) "בין ארבעה משתתפים לפחות" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (קופת גמל בניהול אישי) (תיקון מס' 2), התש"ע-2010 (קובץ התקנות 6901)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/RATI4pBLty7qGIwDdx4vQyqqWGj~YlmHaa28WfpNxGU=#page=2) p.2 (2010 reg. 12(ב): 20% related-party cap) - superseded by 7880 "לא יעלו על 20אחוזים מסך כל העמלות" · checked 2026-10-25 · primary`

#### חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005

- s.1 (definitions: קופת גמל להשקעה, קרן השתלמות, קופת גמל בניהול אישי, קופת גמל לקצבה) (cited by KH-01, TXK-03, TXK-16, TXP-24, IRA-01, REG-17, KH-02, TXA-13):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.2, s.1 ("קופת גמל בניהול אישי", "קופת גמל לקצבה", "קרן השתלמות") "קרן שאושרה לפי הוראות סעיף" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), ה](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2, s.1 (Amendment 15 adds "קופת גמל להשקעה") "קופת גמל להשקעה" · checked 2026-10-25 · primary`
- s.3 (trust and members' interest) (cited by PF-29, REG-18):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.4, s.3 "נאמנות וטובת העמיתים" · checked 2026-10-25 · primary`
- s.13 (approval of a provident fund: 13(א)(4); 13(ג)(2)) (cited by PEN-34, TXK-16, REG-17):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.8, s.13 "הממונה רשאי לאשר קרן שהוגשה לגביה בקשה" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), ה](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2, s.2 (Amendment 15 amends s.13(א) - adds gemel lehashkaa) "תיקון סעיף 13" · checked 2026-10-25 · primary`
- s.20 (employee chooses the fund; employer may not condition) (cited by PEN-06, SW-10, KH-03):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.9, s.20(א) "בחירת קופת גמל" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 12), ה](https://fs.knesset.gov.il/20/law/20_lsr_313645.pdf) p.2, s.2 (Amendment 12, 2015: rate of deposit, 20(א1)) "ואת שיעור ההפקדה בעדו" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 16), ה](https://fs.knesset.gov.il/20/law/20_lsr_343666.pdf) p.2, s.1 (Amendment 16, 2016, latest change to s.20) "תיקון סעיף 20" · checked 2026-10-25 · primary`
- s.22(א) (payments to a provident fund; gemel lehashkaa deposit ceiling) (cited by KGL-02, KH-07):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.10, s.22(א) "השר ,באישור ועדת הכספים של הכנסת ,יקבע שיעור" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), ה](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2 (Amendment 15 amends s.22: total payments to gemel lehashkaa) "תיקון סעיף 22" · checked 2026-10-25 · primary`
- s.23 (withdrawal and transfer: 23(א)(1)(א)-(ב), 23(א)(2א), 23(א)(3), 23(ב)(1א), 23(ה)-(ו)) (cited by PEN-28, PEN-29, PEN-30, PEN-31, PF-17, TXP-17, PEN-28, PEN-29, KH-17):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.23(א) as enacted "משיכת כספים מקופת גמל ,לרבות קבלת קצבה מקופת" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 3), הת](https://fs.knesset.gov.il/17/law/17_lsr_300727.pdf) p.4 (Amendment 3, 2008: s.23(ה) "סכום קצבה מזערי" 3,850) "סכום קצבה מזערי" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 5 והור](https://fs.knesset.gov.il/18/law/18_lsr_301133.pdf) p.3 (Amendment 5, 2010: "סכום צבירה מזערי" 80,000) "סכום צבירה מזערי" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 21), ה](https://fs.knesset.gov.il/20/law/20_lsr_502710.pdf) p.2, s.1 (Amendment 21, 2018: s.23(א)(3)(ב) severance withdrawals) "משיכה כאמור בפסקת משנה (א) תיעשה רק אם יחסי העבודה הסתיימו" · checked 2026-10-25 · primary`
- ss.24א-24ב (consolidation of inactive pension accounts) (cited by PF-28):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 13 והו](https://fs.knesset.gov.il/20/law/20_lsr_315848.pdf) p.10 (Amendment 13, 2015: adds s.24ב; s.24א on the pages before) "איחוד חשבונות בעת הצטרפות לקרן פנסיה" · checked 2026-10-25 · primary`
- ss.25(ב), 27, 30(א) (no assignment / attachment of member rights; separation of assets; no attachment of fund assets) (cited by PF-29, REG-18):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.11, s.25 "איסור העברה, שעבוד או עיקול" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.12, ss.27, 30(א) "נכסי קופת גמל אינם ניתנים לעיקול" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), ה](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2 (Amendment 15 amends s.25: gemel lehashkaa; doubled text layer, no clean quote) · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (תיקוני חקיקה), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf) p.8 (2016 Financial Services law amends s.27(ד)) · checked 2026-10-25 · primary`
- s.32 (expenses, management fees, distribution fee) (cited by PF-01, KH-22):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.13, s.32(א) "חברה מנהלת לא תגבה מנכסי קופת גמל שבניהולה" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 20), ה](https://fs.knesset.gov.il/20/law/20_lsr_366997.pdf) p.2, s.1 (Amendment 20, 2017, latest change to s.32) "תיקון סעיף 32" · checked 2026-10-25 · primary`
- ss.34א-34ז (chapter ג סימן ה1: return supplement for pension funds; target return 5.15%) (cited by PEN-18, PEN-35, REG-21, PEN-18):
  - `[חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנות ](https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf) p.34, s.34ב ("תשואת היעד" 5.15%; 70% for existing members) "ריבית שנתית בשיעור ;5.15%" · checked 2026-10-25 · primary`
  - `[חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנות ](https://fs.knesset.gov.il/24/law/24_lsr_611567.pdf) pp.33-39, ss.34א-34ז (doubled text layer on several pages) "השלמת תשואה לקרנות" · checked 2026-10-25 · primary`
- s.35 (reports to members) (cited by PF-26, PF-33):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.14, s.35 "חברה מנהלת תשלח לעמיתים" · checked 2026-10-25 · primary`
- ss.39(ג), 41, 42 (Commissioner supervision; voluntary and compelled transfer of management) (cited by REG-17, REG-19):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.15, ss.39, 41, 42 "העברת ניהול מרצון" · checked 2026-10-25 · primary`
- s.57 (self-directed (IRA) funds) (cited by IRA-01, TXK-16):
  - `[חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.21, s.57(א) "על קופת גמל בניהול אישי שאושרה לפי" · checked 2026-10-25 · primary`

#### חוק גיל פרישה, התשס"ד-2004

- s.3 (retirement age: 67 for a man, 65 for a woman) (cited by KH-12, PEN-26, KH-12, PEN-26, SW-21):
  - `[חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, s.3 as enacted (67 / 62) "בחוק זה ­ גיל הפרישה" · checked 2026-10-25 · primary`
  - `[חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2021 ו-2022), התשפ"ב-2021](https://fs.knesset.gov.il/24/law/24_lsr_611801.pdf) p.172, s.73(1) (2021: s.3 now "לגבר וגיל 65לאישה") · checked 2026-10-25 · primary`
- ss.4-5 (mandatory retirement age 67; early retirement age 60) (cited by PEN-26, PEN-26, KGL-09, TXK-10):
  - `[חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, ss.4, 5 "הגיל שבהגיעו אליו זכאי אדם לקבל גמלה" · checked 2026-10-25 · primary`
- ss.6, 9 and the schedule (transitional ages for women born up to December 1969) (cited by PEN-26, KH-12):
  - `[חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.2, ss.6, 9 as enacted (parts א-ג of the schedule) "בחלק ב' בתוספת" · checked 2026-10-25 · primary`
  - `[חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2021 ו-2022), התשפ"ב-2021](https://fs.knesset.gov.il/24/law/24_lsr_611801.pdf) p.172, s.73(2) (s.6(2): "עד חודש דצמבר 1969"; s.6(3) deleted; chapter ד repealed) · checked 2026-10-25 · primary`
  - `[חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2021 ו-2022), התשפ"ב-2021](https://fs.knesset.gov.il/24/law/24_lsr_611801.pdf) p.174 (new schedule rows up to "ינואר 1969 עד דצמבר 1969 64 ו-9 חודשים"; file p.174 = gazette p.252) "ינואר 1969עד דצמבר 1969" · checked 2026-10-25 · primary`

#### חוק הגנת השכר, התשי"ח-1958

- s.24 and the schedule (payslip items 5(6), 6(4), 7) (cited by PEN-36):
  - `[חוק הגנת השכר (תיקון מס' 24), התשס"ח-2008](https://fs.knesset.gov.il/17/law/17_lsr_300652.pdf) p.2, s.24 (replaced in 2008: "פנקס שכר ותלוש שכר") "מעביד חייב לנהל פנקס שכר ולמסור לכל עובד" · checked 2026-10-25 · primary`
  - `[חוק הגנת השכר (תיקון מס' 24), התשס"ח-2008](https://fs.knesset.gov.il/17/law/17_lsr_300652.pdf) p.6, schedule items 5(6), 6(4), 7 "ניכוי לקופת גמל ,שיפורט לפי הקופה שאליה הניכוי מיועד וסכומו" · checked 2026-10-25 · primary`
  - `[חוק להחלפת המונח מעביד (תיקוני חקיקה), התשע"ד-2014](https://fs.knesset.gov.il/19/law/19_lsr_306572.pdf) p.2, s.1 ("המעביד" becomes "המעסיק" in the listed laws) · checked 2026-10-25 · primary`

#### חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס"ה-2005

- ss.13, 19(א)(1), 27(ב)(7), 28(ב) (transactions as part of advice; incentives; written advice agreement; adviser pay) (cited by SW-17):
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.9, s.13 "ביצוע עסקה בעבור לקוח כחלק מייעוץ פנסיוני" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.10, s.19 "תמריצים ועמלות בקשר עם ייעוץ פנסיוני" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.12, s.27; s.28 on p.13 "יועץ פנסיוני יערוך הסכם בכתב עם לקוח" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.1 (Amendment 3, 2011: amends s.27; adds chapter ה1 on the clearing house) "תיקון סעיף 27" · checked 2026-10-25 · primary`
- ss.31ט, 31יא, 31יד, 31טז (central pension clearing house) (cited by PF-22, SW-18):
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.5, s.31ט(א) "השימוש במערכת סליקה פנסיונית מרכזית" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.7, s.31יא "על חברה להפעלת מערכת סליקה פנסיונית מרכזית" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.9, s.31טז; s.31יד on p.8 "הוראות בדבר אבטחת מידע, שמירתו ונגישותו" · checked 2026-10-25 · primary`
- s.1 and s.32(ח)(1) (definitions; administrative fine) (cited by PF-22, SW-18):
  - `[חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.12 (Amendment 3, 2011: fines for breach of ss.31ט-31יא) "בניגוד סעיף 31ט" · checked 2026-10-25 · primary`

#### חוק הפיקוח על שירותים פיננסיים (ביטוח), התשמ"א-1981

- ss.1א, 2 (the Authority; the Commissioner) (cited by REG-17):
  - `[חוק הפיקוח על שירותים פיננסיים (תיקוני חקיקה), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_348687.pdf) p.2 (2016: chapter א - s.1א establishes the Authority; s.2 the Commissioner) "מוקמת בזה רשות שוק ההון ביטוח וחיסכון" · checked 2026-10-25 · primary`
- ss.68(א), 70(א) (powers to keep an insurer stable; authorised manager) (cited by REG-19):
  - `[חוק הפיקוח על עסקי ביטוח, התשמ"א-1981](https://fs.knesset.gov.il/9/law/9_lsr_209334.PDF) p.15, s.68 as enacted (law then "חוק הפיקוח על עסקי ביטוח") "סמכויות לשמירת יציבות של מבטח" · checked 2026-10-25 · primary`
  - `[חוק הפיקוח על עסקי ביטוח, התשמ"א-1981](https://fs.knesset.gov.il/9/law/9_lsr_209334.PDF) p.16, s.70 "סמכויות מנהל מורשה" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (ביטוח) (תנאים בחוזי ביטוח), התשמ"ב-1981

- reg. 1 (definitions) (cited by INS-25):
  - `[תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח), התשמ"ב-1981 (קובץ התקנות 4290)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/iLs08NX3KGA9~rkIKOndkkLRxv00yJMyWBaZlR4KaIc=#page=16) p.16 (gazette p.300), reg. 1 "תנאים בחוזי ביטוח" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (ביטוח) (תנאים בחוזי ביטוח) (תיקון), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=8) p.8, s.1 (adds "קופת ביטוח" to reg. 1; continues on p.9) · checked 2026-10-25 · primary`
- reg. 6א (management fee on a profit-sharing policy: 1/12% a month; up to 2/12% with approval; 6א(א2)) (cited by INS-25, INS-25):
  - `[תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשס"ד-2004 (קובץ התקנות 6284)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/SJCa7BPhZiMZ9l0U5Xe3nwsTVeYYmhGDid2kIqKI~Hk=#page=3) p.3, s.3 (replaces reg. 6א(א), adds 6א(א1)) "המפקח רשאי לאשר דמי ניהול בשיעור העולה על הקבוע בתקנת משנה (א)" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשס"ז-2007 (קובץ התקנות 6609)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmTugNmENKcUIwHrUSZW9ZBg=#page=3) pp.3-4 (adds reg. 6א(א2)) "מבטח המנפיק פוליסות ביטוח חיים משתתף ברווחים שאינן קופות ביט" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על שירותים פיננסיים (ביטוח) (תנאים בחוזי ביטוח) (תיקון), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=9) p.9, s.2 (current opening of 6א(א): "פוליסה שאינה קופת ביטוח") "מבטח המנפיק פוליסת ביטוח חיים משתתף ברווחים שאינה קופת ביטוח" · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשנ"ה-1995 (קובץ התקנות 5682)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/BTwXToK9tgT1T4C743xB1YM5f+QhBADNjCgwTr9rv3c=#page=2) p.2, s.2 (reg. 6א first added) "הוספת תקנה 6א" · checked 2026-10-25 · primary`
- reg. 6ב (annual report to policyholders within three months of the balance-sheet year) (cited by INS-26, INS-26):
  - `[תקנות פיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשנ"ז-1996 (קובץ התקנות 5804)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/E5dM3Lqs3zVhAvU4rMf6c5wNTVAGlOIVXHsJEoAgsJ4=#page=2) pp.2-3, s.2 (adds reg. 6ב) "בחוזה לביטוח חיים ייקבע כי מבטח המנפיק פוליסות ביטוח חיים" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על שירותים פיננסיים (ביטוח) (דרכי השקעת ההון והקרנות של מבטח וניהול התחייבויותיו), התשס"א-2001

- reg. 1 (definitions; "ביטוח חיים משתתף ברווחים" by reference) (cited by INS-25):
  - `[תקנות הפיקוח על עסקי ביטוח (דרכי השקעת ההון והקרנות של מבטח וניהול התחייבויותיו), התשס"א-2001 (קובץ התקנות 6094)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/mh6R6bmXcoR6N~XeNh6QPrA2iEfIYDZsqtdZ2FAMxdQ=#page=8) pp.7-8, reg. 1 (gazette p.607-608) "כהגדרתם בתקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון)" · checked 2026-10-25 · primary`

#### תקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון), התשנ"ח-1998

- reg. 1 (definitions) - repealed 2023 (cited by INS-25):
  - `[תקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון) (ביטול), התשפ"ג-2023 (קובץ התקנות 10695)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/7C66hQ7JW8mJlcziZA1hgK1PPp5NbPw07CG3J3T~8lA=#page=2) p.2, reg. 1 (repeal) · checked 2026-10-25 · primary`
  - `[תקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון), התשנ"ח-1998 (קובץ התקנות 5884)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qp4kOfn567Y9SVzCZ9fztqtrgsHQki1Al7l1DteQKBc=#page=2) p.2, reg. 1 as it stood until repeal "פרק א' :פרשנות" · checked 2026-10-25 · primary`
