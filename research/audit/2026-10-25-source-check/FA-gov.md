# FA-gov: child savings, government bonds and makam, regulators and protection (2026-10-25)

Agent FA-gov, source check of 2026-10-25. Scope: the `- Source:` lines of the rule blocks that have a record in
data/rules, in `child-savings.md` (CS, 22 records), `government-bonds-and-makam.md` (GOV, 23 records) and
`regulators-and-protection.md` (REG, 19 records), and the figure sources of those records (through `figsrc.py`).
Rule text, figures, rule strength and rule checked dates were not edited. (The extract itself realigned the rule strength of eight REG records from primary-mirror to primary once their copies were gone: REG-06, 07, 10, 11, 17, 18, 19, 21.)

## Child savings (child-savings.md, 22 records)

### What changed

Every source on the 22 records was opened today and now carries `checked 2026-10-25`; every figure source (32) too.

- **Copies replaced (Wikisource, link-less): 16 mentions on 13 rules, now 23 linked official citations (14 to the
  law, 9 to the regulations).** Every "law 74ב… (Wikisource mirror)" and
  "Regulation N (Wikisource mirror)" was a link-less mention the site never showed. They are now linked official
  citations, each opened and read on the cited page:
  - National Insurance Law: National Insurance's own consolidated text (btl.gov.il/Laws1/00_0001_000000.pdf, 324
    pages, file dated 7.7.2026, carries the 2025 amendments 247 and 252). File pages: 74ב(א)-(ג) p.50; 74ב(ד)-(ח)
    and 74ג(ב) p.51; 74ג(ג), 74ד and 74ה p.52 (CS-02, 03, 05, 06, 07, 12, 13, 14, 15, 18).
  - The child-savings regulations: קובץ התקנות 7727 (14.11.2016) on the Reshumot file service, with the file page in
    the URL. Reg. 1-2 p.7; regs. 3 and 4(א)-(ג)(1) p.8; regs. 4(ג)(2), 5, 7 p.9; regs. 11, 12, 13 p.10 (CS-03, 04, 06,
    11, 16, 18). No consolidated text exists on btl.gov.il; R-other found no amendment, and a web search today found
    none either, so the 2016 gazette is cited as the current text.
  - The circular 1356 images of the 2016 regulation text ("2016 text in circular 1356 p.33 / pp.34-35") were dropped:
    the gazette now states those points.
- **Link-less repeats turned into links: 22** ("NII FAQ (above)", "Harel bylaw s.…", "Yahav agreement s.…",
  "Altshuler Q&A", "NII 2025 report pp.…", "NII circular 1356 p.4"). Each is now a link with its own strength word.
- **Titles:** the links now carry the documents' own Hebrew names (NII page titles, the report's title, "תקנון תקני
  לקופת גמל להשקעה לחיסכון ארוך טווח לילד: הראל חיסכון לכל ילד, מהדורה 3, 04/2026", Yahav's "הסכם חיסכון ארוך טווח
  לילד", the CMA circular's name). Before, several English titles (Harel, Yahav, Altshuler, circular 1356, the
  doubling page) had no documents.json row, so nothing readable was shown.
- **Pages added.** File pages added to the Harel bylaw (p.5 ss.7-12, p.6 ss.14-16, pp.9-10 ss.31-33,
  p.11 Annex A), the Yahav agreement (pp.3-4 s.3, pp.4-6 ss.4-6) and the CMA circular 2018-9-25 (p.3 s.3(ד) and
  s.5(ב)(1); annex ב'ג' p.8; explanatory notes p.16). The NII 2025 report pages (pp.1-6) were checked and are right.
- **Quotes:** two new verbatim quotes from the NII FAQ (CS-08 "באחד מ-5 מסלולי השקעה שמציעות הקופות", CS-10 the
  three-tracks-per-bank sentence) replace English paraphrases; all kept quotes were found on their pages.
- **Figure sources: 2 copies replaced, 30 verified.** CS-12 `bank_to_provident_moves` (was the Wikisource page) and
  CS-02 `deposits_until_age` (title cited the Wikisource text) now cite the BTL law text p.50, s.74ב(א)(2א) / 74ב(ג).
  Titles of the others gained file pages (Harel p.5, p.6, pp.9-10, p.11; BTL law pp.50-52; CMA circular p.3, pp.3-4).
  Values checked on the pages: NIS 58 basic and extra deposit, grants 291/291/582/582, 6-month choice window,
  75%-120% equity exposure, 3 and 4 business days, 0.23%, the 2025 report shares (53.8 / 33.1 / 13.1 / 60 / 54%,
  4.7 million), 9 banks (also the nine BANK values in the MoF dataset today), 1 March.
- **Verified unchanged:** the NII HTML pages (all open to curl), hly.gov.il, the b2b service page, Leumi's
  withdrawal page, the Altshuler Q&A, the MoF dataset page and the Gemel-Net datastore query (period 202609 still
  returns 41 records).

Copies kept: none. Copies removed: none beyond the replacements above.

### Figures that differ

None. The newer sources give the same numbers.

### For the founder (notes, nothing changed)

- CS-03's rule text cites "law 74ב(א)(1) bracket 'בשנת 2026, 58 ש״ח'". The official BTL text has no such bracket:
  it still prints the 2015 sum of 50 shekels, with the CPI update in 74ב(א)(2)/74ה and reg. 12. The bracket was an
  editorial note in the Wikisource copy. The NIS 58 figure itself stands on NII's savings-amount page.
- CS-12's figure note says the amendment number and the effective date of 74ב(א)(2א) are unknown. The BTL footnote
  32 says: added by amendment 247, in force 1.1.2025.

### Left

Nothing in scope.

## Government bonds and makam (government-bonds-and-makam.md, 23 records)

### What changed

Every source on the 23 records was opened today and carries `checked 2026-10-25`; every figure source (29) too.

- **Nevo copies replaced: 12 links on 8 rules** (GOV-01, 02, 10, 11, 12, 14, 15, 16), each by the official gazette
  text, read on the cited page:
  - חוק מילווה קצר מועד: the 1984 enactment (ספר החוקים 1107, Knesset file, pp.1-2: ss.1(א), 3, 4, 6, 10). Two
    sections changed later, and both changes are now cited from their own gazette: s.5 (proceeds may be used only to
    repay the loan or its interest) was replaced by Amendment 7, 1996 (ספר החוקים 1598, p.1); s.6 (the Bank of
    Israel sells and buys makam "to achieve its goals and fulfil its functions") got its current wording from חוק
    בנק ישראל, התש"ע-2010, s.92 (ספר החוקים 2237, Knesset file 18_lsr_301176.pdf, file p.23 = gazette p.474). The
    R-other map had kept the Nevo copy for s.6 because this file was not found; the Knesset OData lists it under the
    2010 law, so no copy is kept.
  - חוק מילווה המדינה: the 1979 enactment (ספר החוקים 936, p.1: ss.2, 4(3)) and Amendment 14, 2005 (ספר החוקים
    1974: p.1 s.3 amends s.4(3); p.2 s.6 adds s.6א).
  - The three regulation sets on the Reshumot file service, file page in the URL: the CPI-linked bond regulations
    (קובץ התקנות 6457: p.4 regs. 1-4, p.5 regs. 5-9) with the 2007 amendment of regs. 6-7 (קובץ התקנות 6597, p.3);
    the short bond regulations (6597: p.2 regs. 1-4, p.3 regs. 5-8); the "גילון חדש" regulations (5951: p.2 reg. 1,
    p.3 regs. 2-7, p.4 regs. 8-9) with their amendments of 2000 (6069 p.3, reg. 7(ב)), 2006 (6457 p.9, reg. 5
    replaced and 9א added) and 2007 (6597 p.6, reg. 9א).
- **Draft moved to the final text: 3 rules** (GOV-03, 20, 21). They cited the December 2024 draft of directive 447A
  with a review note pointing at the final. They now cite the final "ניהול בנקאי תקין 447A (04/25)" (circular 2813,
  09/04/25): the makam definition "עד שנה" is s.17 on p.3 in the final (in the draft it sat in annex ב); the banks'
  duties are ss.1-8 and 15-20 (pp.1-3); the makam table and its note 2 are on p.6. The review notes were removed.
- **Pages checked and added.** The makam auction conditions' cited pages were checked section by section (ss.1.1
  and 2.1-2.3 p.1, 2.4-2.8 p.2, 3.1.2 pp.2-3, 3.2-3.2.2 p.4, 4.1.3-4.3 pp.6-7, 5.1-6.2.2 p.9, annex ג p.15); file
  pages were added to the ערד procedure (pp.1-2) and the makam issue schedule (p.1).
- **Debt-management unit reports.** The 2025 annual report's printed page equals its file page (checked with the
  page edges); every cited point was found on its page (shares 62/30/8% p.16-17, cover ratio 4.5 p.19, switch and
  buyback auctions pp.17-18, 12 primary market makers p.26, turnover shares 83.0/4.4/12.6% p.27, the four new series
  and 31 tradable series p.37, non-tradable debt NIS 348.4 bn and 24.6% p.41). The 2025 report has no glossary, so
  the 2024 glossary (printed = file page as well) stays the newest one; its terms are on the cited pages 40-45.
- **Titles:** the links now carry the documents' own Hebrew names.
- **Figure sources: 12 Nevo copies replaced** (GOV-11 four, GOV-12 one, GOV-14 three, GOV-15 four) by the gazette
  regulations with file page and regulation in the title; **17 verified** with the file page added to the title
  (makam conditions p.3, p.4, p.9; 2025 report pp.19, 26, 27, 37; 2024 glossary p.41; BoI schedule p.1). Values
  checked on the pages: 14 days and 13 months, NIS 100 multiples, NIS 10 million non-competitive cap, 365-day year,
  31 series, 4.5, 12 market makers, 83.0%, face value NIS 1,000, one-year minimum term (reg. 6 as amended 2007),
  12-month and 3-month interest periods, 4% margin cap and 0% floor, no interest on short bonds, 12 makam series,
  364-371 days.
- **Verified unchanged:** the BoI makam consumer page and the makam statistics page (both block scripts; read in
  Chrome), the BoI makam auction conditions (no newer edition found on the BoI site or by web search), EDGE SECDWH
  (87 series today) and the dataflow list, the data.gov.il package and the auction datastore query (1,942 rows; the
  20.10.2026 auction shows coupons 3.55%, 3.75%, 4.15%).

Copies kept: none. Wikipedia stays on GOV-13 as a secondary source for the old name "שחר" (see below).

### Figures that differ

None.

### For the founder (notes, nothing changed)

- GOV-01's conditions say "Section 1 sets an outstanding-balance cap in the law". The current s.1 has only
  subsection (א), the authority to borrow, with no cap; (ב)-(ד) are repealed (the 1984 cap of 10,000 million in s.1
  was removed by later amendments). The rule text should say so.
- GOV-13 says the regulations for the fixed-rate shekel bond were not found and the old name "שחר" rests only on
  Wikipedia. The gazette booklets read today contain both: "תקנות מילווה המדינה (סדרות מסוג "שחר"), התשנ"ה-1995"
  (amended in קובץ התקנות 6457 p.10 and 6597 p.6) and "תקנות מילווה המדינה (איגרות חוב מסוג "אג"ח ממשלתית"),
  התשס"ו-2006" (קובץ התקנות 6457 pp.1-3; by its name probably the series now auctioned as "ממשלתית", only the title
  and first pages were read). Open question 4 can likely be closed from them; that is a rule change, so it was not made.
- GOV-20 and GOV-21: the final 447A's annex note 2 says the yield shown is gross and excludes buy and sell
  commissions "ומס רווחי הון" (and capital gains tax); the draft the rules quote lacks the tax part. GOV-20's
  conditions still say the final text was not read (open question 10): it is now read, in force from 09/04/25.
- GOV-03's conditions quote the draft annex for "עד שנה"; in the final it is s.17.

### Left

Nothing in scope. Title rows requested (requests/FA-gov.json): the four amending regulations were shown under the
base regulation's title (a documents.json row with a shorter token won).

## Regulators and protection (regulators-and-protection.md, 19 records)

### What changed

Every source on the 19 records was opened today and carries `checked 2026-10-25`; every figure source (7) too.

- **Wikisource copies replaced: 13 links on 11 rules** (REG-01, 06, 07, 10, 11, 13, 15, 17, 18, 19, 21), each read on
  the cited page:
  - פקודת הבנקאות (REG-01, REG-06): the Bank of Israel's current item 103 of its banking legislation collection
    (boi.org.il/media/s5ub1z12/103.pdf, file dated 14.1.2025): s.5(א) p.4, s.8ד p.6, s.8ו p.8, s.8יא p.10. The
    BoI 2011 edition cited as a cross-check on REG-01 was removed (outdated). The 2026 wording of 8ד(א) ("or there is a
    real fear it will not") and 8ו(ה) ("לרבות באמצעות מכירת אמצעי השליטה בו") is not yet in the BoI file; it is cited
    from ספר החוקים 3510 (Economic Plan Law 2026), file p.49 = gazette p.397, s.4(4)-(5), and the new s.8יב from
    p.50.
  - חוק ניירות ערך (REG-07, 13, 15): the 1968 enactment for ss.2 and 14 (never amended; pp.1, 3); Amendment 63, 2017
    (ספר החוקים 2633) for ss.3, 44לא, 45, 45א, 48, 51, 50ג (pp.2, 3, 10, 20); Amendment 61, 2017 (ספר החוקים 2623)
    for 50א(ד) as amended and the added ss.50א3-50א4 (pp.5-8); the 2026 Insolvency Law Amendment 9 (ספר החוקים 3488,
    p.18) for the latest change to 50א(א) and 50א4; and the ISA's consolidated text (2012) for s.46 (p.88), s.50א(ד)
    (p.94), s.50ג (p.96) and the s.51(א) sentence the rule quotes (p.98).
  - חוק השקעות משותפות בנאמנות (REG-10, 11): the ISA's consolidated text (file dated 31.8.2026): s.4 p.5, ss.11-12
    p.11, ss.14-15 p.14, s.76 p.56, s.78 p.57, s.79 p.58, s.104 p.67.
  - The provident-funds law (REG-17, 18, 19, 21): the 2005 enactment (ספר החוקים 2024: s.1 p.2, s.3 p.4, s.13 p.8,
    s.25 p.11, ss.27 and 30(א) p.12, ss.39, 41, 42 p.15), Amendment 15 (2016, "קופת גמל להשקעה"), and ספר החוקים 2932
    (2021) pp.33-39 for chapter ה'1 (ss.34א-34ז; 5.15% and 70% on p.34).
  - The insurance supervision law (REG-17, 19): ספר החוקים 2582 (2016) pp.2-3 for s.1א (the Authority) and s.2, and
    the global "המפקח" to "הממונה" change; the 1981 enactment pp.15-16 for ss.68 and 70.
- **Pages added:** REG-04 (BoI text p.2, and the gazette ספר החוקים 3510 file p.60 = gazette p.408 added beside it),
  REG-05 (bill pp.2-3).
- **Titles:** Hebrew titles as the documents name themselves; each TASE link now has its own strength word.
- **Figure sources: 2 copies replaced, 5 verified.** REG-06 `guarantee_cancel_notice_days` (was Wikisource) now cites
  BoI item 103 p.11, s.8יא(ה) ("שלא יפחת מתשעים יום"): the 90 days are in s.8יא(ה), present in the BoI text, so the
  R-other doubt about s.8יב does not apply. REG-11 `trustee_replacement_days` (was Wikisource) now cites the ISA text
  p.11, s.12. REG-04 (12 and 6 months, s.16(ב)-(ג), p.2), REG-05 (NIS 250,000 and the 5% market-share cap, bill
  pp.2-3) and REG-14 (25 members, guide p.3) verified.
- **Verified unchanged:** the data.gov.il bank list (17 records today), the Knesset OData links (bill 6522 still status
  104, "tabled for preliminary reading"), TASE's three January 2026 guides, Meitav Trade's about page, Interactive
  Israel's about page (USD 500,000 / EUR 20,000), SIPC's page (all three quotes found), NII's programme page.

Copies kept: none.

### Figures that differ

None.

### For the founder (notes, nothing changed)

- REG-06's rule already carries the 2026 wording of 8ד(א); the BoI consolidated file (14.1.2025) predates it, so the
  gazette is cited beside it. When BoI republishes item 103, the gazette citation can go.
- REG-17: s.2 of the insurance law (the Commissioner, one five-year term) was amended again in 2018 (BoI Law
  amendment 7, ספר החוקים 2759, per the R-prov map); that page was not pinned today. The 2016 text cited states the
  point the rule makes.
- The R-other map gave ISA pp.90-92 for s.46 of the Securities Law; the section is on p.88. It also tied the 2017
  law in file 20_lsr_390377 to s.50ג; that page amends a different section (15ב), so it is not cited.
- REG-01's rule quotes "הבקורת" (Wikisource spelling); the BoI text spells "הביקורת".

### Left

Nothing in scope.
