# FA-pen: source check of the pension, study-fund and gemel lehashkaa rules (2026-10-25)

Agent FA-pen. Scope: the `- Source:` lines of the rule blocks that have a record in data/rules, in
`kupat-gemel-lehashkaa.md` (KGL), `keren-hishtalmut.md` (KH) and `pension-and-gemel-lekitzba.md` (PEN), and the figure
sources of those records (through `figsrc.py`). Every source left on these lines was opened today (PDFs with curl and
pdftotext on the cited file page, HTML pages by script or in Chrome) and carries `checked 2026-10-25`. Rule text,
figures and the rules' own strength and checked date were not touched.

## kupat-gemel-lehashkaa.md (13 records: KGL-01, 02, 03, 04, 06, 08, 09, 10, 11, 14, 15, 16, 24)

What changed, by kind:

- **Copy replaced: 5** (all Wikisource)
  - KGL-09, KGL-10: the transfer regulations 2008 now cite the official Reshumot booklets: the 2020 amendment
    (ק"ת 8735, p.2: regulation 2(א)(7) and 2(ב)(2), "קופת גמל להשקעה, ובלבד שהעמית הגיע לגיל הפרישה המוקדמת", and
    regulation 3(א)(11א)) and the base booklet (ק"ת 6657: regulation 2 on p.4, 3(א)(12) on p.5, 5(א) on p.6).
  - KGL-09: the Retirement Age Law section 5 now cites the official gazette (ס"ח 1919, p.1, "גיל 60 לגבר ולאישה";
    section 5 was never amended).
  - KGL-14: the fee regulations 2012 now cite ק"ת 7131 pp.4-6 (regulations 2, 4, 5, 6, quote of the 1.05% cap
    verified) and the 2014 amendment ק"ת 7358 p.4 (regulation 2(א)(2א) and regulation 6).
- **Copy removed: 2**
  - KGL-02: the Wikisource text of section 22(א). Amendment 15 on the same rule states the NIS 70,000 ceiling and the
    CPI update (file p.2 = gazette p.885).
  - KGL-03: the link-less "Wikisource annotates section 22(א) with 83,641" mention. KGL-24 holds the official CBS
    computation of the same figure.
- **Edition moved: 1**. KGL-11: CMA circular 2020-9-18 (16.11.2020) → circular 2022-9-30 (20.12.2022), the newest
  circular on investment tracks in the CMA collector (search "מסלולי השקעה בקופות גמל", 10 results, nothing later). Its
  annex is the full current text; p.4, sections 3 and 4(א) still limit the age-based default tracks to funds "שאינן
  קרנות השתלמות ואינן קופות גמל להשקעה".
- **Page fixed: 2**. KGL-01 and KGL-02 cited Amendment 15 by its gazette pages 885-886; now file pp.2-3 (p.2 for
  section 3). Titles of both links are now the law's Hebrew name.
- **Link added for a link-less mention: 1**. KGL-08: "The Meitav page also says תוך 4 ימי עסקים" now links the page.
- **Strength word per link**: every link on KGL-03, 04, 08, 11, 15, 24 now has its own word (before, one trailing word
  covered a run of links).
- **Quotes fixed: 3**. KGL-01 (the bill quote used single quotes where the bill has double quotes; now the verbatim
  part before them), KGL-03 Meitav (the quote ended "עבור כל חוסך", which is not on the page), KGL-03 Harel (had an
  ellipsis, so it never showed).
- **Titles**: link texts that matched no documents.json row (Altshuler deposit page, Phoenix ceilings page, the three
  CBS links) are now the pages' own Hebrew names.
- **Figure sources: 4** (all verified, `checked 2026-10-25`): KGL-02 base ceiling (Hebrew title, file p.2, s.3,
  publisher The Knesset, the double slash in the URL removed); KGL-03 ceiling (Harel p.1, quote without ellipsis);
  KGL-08 payout days (Altshuler bylaws p.5, clause 12.1, was "clauses 11-15"); KGL-15 fee (quote verbatim).
- **Verified unchanged**: the Knesset bill P/3539/25 p.3; the Harel, Hebrew University, Altshuler, Infinity and Yachad
  Rofim PDFs; the Altshuler, Phoenix, Meitav and Meitav Kids pages; the three CBS API calls (83,641.09; 98.8; 103.6).

Copies kept: none. Figures that differ: none.

Titles to fix in documents.json (requested in `requests/FA-pen.json`):
- row `prov-df9eea2b` (Amendment 15) has a cut title "…(תיקון מס' 15), ה"; full name "…(תיקון מס' 15), התשע"ו-2016".
- row `cma-circular-2022-9-30` calls the circular "ניהול מסלולי השקעה בקופות גמל"; the circular's own title is "מסלולי
  השקעה בקופות גמל - תיקון".

Left alone (no record): KGL-13 cites circular 2020-9-18 s.12(ג)(5) without a link. The file is
`https://www.gov.il/BlobFolder/dynamiccollectorresultitem/investmentsoptions16112020/he/2020-9-18.pdf` (the quoted
right to switch tracks is on p.4 and p.8), and circular 2022-9-30 repeats it on p.4 and p.8.

Not checked: whether Altshuler, Infinity or Yachad Rofim have published newer bylaws than the editions cited
(institution documents; their clause numbers were confirmed in the editions cited).

## keren-hishtalmut.md (21 records: KH-01, 02, 03, 04, 05, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 25)

What changed, by kind:

- **Copy replaced: 7** (Nevo and Wikisource)
  - KH-01: the Provident Funds Law s.1 (Nevo) → the official gazette ס"ח 2024, p.4, the definition of "קרן השתלמות"
    (quote verified); the Ordinance s.1 (Nevo) → the Tax Authority's Ordinance PDF, p.16 ("כהגדרתן בחוק הפיקוח על
    קופות גמל").
  - KH-07: the law s.22 (Nevo) → ס"ח 2024 p.10, s.22.
  - KH-12: the Retirement Age Law (Wikisource; this is the "(עותק)" the founder saw on the retirement-age figure) →
    the base law ס"ח 1919 p.1 (ss.3, 4 as enacted) and the 2021 Economic Plan Law ס"ח 2933, p.172, s.73 (section 3
    now "לגבר וגיל 65 לאישה"; the new schedule for women born up to December 1969 on p.174). The Ordinance s.1 (Nevo,
    link-less) → the Tax Authority's Ordinance PDF, p.12, definition "גיל הפרישה".
  - KH-14: the "accounts treated as one" regulations 1993 (Nevo) → Reshumot ק"ת 5517 p.2, regulations 1-3 (the quote
    the rule uses is verbatim there) and the 1996 amendment ק"ת 5768 p.2 (regulation 1(ב), employee ↔ self-employed).
  - KH-17: the transfer regulations (Nevo) → ק"ת 6657: regulation 2(א)(4) p.4, 3(א)(4) and 3(א)(12) p.5, 5(א) p.6,
    9(ג) p.8.
  - KH-22: the fee regulations (Nevo) → ק"ת 7131: regulation 2(ב) p.5; regulations 4, 6, 8 p.6 (the 2% cap quote
    verified); regulations 10, 12 p.8.
- **Copy removed: 1**. KH-22: the Behar law-firm re-host of the fee regulations (the official booklet on the same rule
  states the same point).
- **Link-less mentions turned into official links: 6**. KH-02 (law s.1, "עמית-שכיר", "עמית-עצמאי", ס"ח 2024 p.2),
  KH-03 (s.20(א), (ב), ס"ח 2024 pp.9-10, plus Amendment 16 p.2, the latest change to s.20), KH-17 and KH-18
  (s.23(ב)(2), ס"ח 2024 p.11; no later amendment of 23(ב) found in the 30 amending laws), KH-22 (s.32(א), ס"ח 2024
  p.13, plus Amendment 20 p.2, the latest change to s.32), KH-12 (Ordinance s.1).
- **Link-less institution mentions linked (about 20)** ("Altshuler bylaws 1.12.2024, s.N", "Harel bylaws 07/2024, s.N",
  "Altshuler withdrawal form", "Harel 2026 table", "Meitav study-fund page") on KH-04, 05, 08, 10, 12, 14, 17, 18, 21.
  They were invisible on the site before.
- **Quotes added from the cited page** (about 17), each checked against the PDF page or page text.
- **Titles**: link texts that matched no documents.json row (Meitav and Altshuler pages, the Pensuni article, the
  teachers' form, Gemel-Net) are now the pages' own Hebrew names. KH-09's "(KH-24)" was being read as the locator;
  fixed.
- **Figure sources: 6** (all `checked 2026-10-25`):
  - KH-12 retirement age, men → ס"ח 1919 p.1, s.3 ("גיל 67 לגבר"); women → the 2021 Economic Plan Law p.172, s.73
    and the schedule p.174 (both were Wikisource).
  - KH-22 balance cap → ק"ת 7131 p.6, reg. 4 (was Nevo).
  - KH-04 employee and employer rates → Harel bylaws, p.2 added; KH-16 payout days → Altshuler form, p.2 added.
- **Verified unchanged**: Harel and Altshuler bylaws, Harel 2026 table (p.1), Altshuler withdrawal form, the teachers'
  study-fund form (gov.il, 4.2% / 8.4% on p.1), Pensuni (secondary), the Altshuler and Meitav pages, Gemel-Net (opens in
  Chrome; 403 to scripts).

Copies kept: none. Figures that differ: none.

Titles to fix in documents.json (requested): the rows for Provident Funds Law Amendments 3, 5, 12, 13, 15, 16, 20, 21
and the 2021 Economic Efficiency Law have match tokens and titles cut at 60 characters ("…(תיקון מס' 16), ה"); the
request gives the full names from the Knesset database.

Founder note: KH-12's quote of section 3 ("הוא גיל 67 לגבר וגיל 65 לאישה") is the wording after the 2021 amendment;
the base 2004 text reads "גיל 62 לאישה". Both are now cited.

## pension-and-gemel-lekitzba.md (31 records: PEN-01 to 13, 15 to 19, 21 to 23, 26 to 31, 33 to 36)

What changed, by kind:

- **Copy replaced: 15**
  - Provident Funds Law (Wikisource) → official gazettes: PEN-06 (s.20: ס"ח 2024 pp.9-10 and Amendment 16 p.2),
    PEN-18 and PEN-35 (ss.34א-34ז: the 2021 Economic Efficiency Law ס"ח 2932, p.34 for s.34ב with the 30% / 70% and
    5.15% definitions, pp.33-39 for the chapter), PEN-28 (s.23(א): ס"ח 2024 p.11; s.23(ה) minimum annuity: Amendment 3
    p.4), PEN-29 (s.23(א)(1)(ב): Amendment 13 p.4; "סכום צבירה מזערי": Amendment 5 p.3), PEN-30 (Amendment 13 p.4,
    "מחשבון חדש כאמור בפסקאות (2א) או (2ב)"), PEN-31 (s.23(א): ס"ח 2024 p.11; s.23(א)(3): Amendment 21 p.2), PEN-34
    (s.13(א): ס"ח 2024 p.8 and Amendment 15 p.2).
  - Fee regulations 2012 (Wikisource) → Reshumot: PEN-21 (ק"ת 7131 p.5 reg. 3, p.6 regs. 6, 8; 2014 amendment ק"ת 7358
    p.4; 2022 amendment ק"ת 9942 p.2, the 0.3% for old-age pensioners from 1.2.2022), PEN-22 (ק"ת 7131 p.4 reg. 2,
    p.6 reg. 4).
  - PEN-07: the 2017-2018 Economic Efficiency Law (Wikisource) → ס"ח 2592, p.4 (s.3(א), 4.45% / 12.55%), pp.3-9.
  - PEN-26: Retirement Age Law (Wikisource) → ס"ח 1919 pp.1-2 and the 2021 Economic Plan Law p.172 (s.73) / p.174.
  - PEN-36: Wage Protection Law (Wikisource) → Amendment 24, ס"ח 2162 (p.2 s.24; p.6 schedule items 5(6), 6(4), 7)
    plus the 2014 law replacing "מעביד" with "מעסיק" (ס"ח 2459, p.2 s.1 and the schedule on p.5, which lists the Wage
    Protection Law). This is why the rule's quote reads "הפרשות המעסיק" where the 2008 page reads "המעביד".
  - PEN-03 and PEN-04: the 2016 collective agreement re-hosted by prisha.co.il → the official 2016 extension order
    "צו הרחבה בדבר הגדלת ההפרשות לביטוח פנסיוני במשק" on gov.il (`workers-rights_working-conditions_pension_Pension2016.pdf`,
    a 3-page scan; s.2(א) on p.1, the 6% / 6.5% / 6% rates in s.3 on p.2, read from the page image since it has no
    text layer). Found through the link on Kol Zchut's page after Google, gov.il and Reshumot searches failed.
  - PEN-06, PEN-19, PEN-23: the CMA annual report 2024 re-hosted on adif-web-bucket → the gov.il chapters (2024
    chapter 2 p.2; 2025 chapter 2 p.4; 2025 chapter 4 p.12).
- **Copy removed: 3**. The Hilan re-host of the 2011 extension order on PEN-01, PEN-05 and the link-less "same text in
  the Hilan mirror" on PEN-02 (the official gov.il scan on each rule states the same).
- **Edition moved: 1**. PEN-19: CMA report 2024 table ד-13 → 2025 report, chapter 4, table ד-14 (file p.12), which
  repeats the 2024 column and adds 2025 (see "Figures that differ").
- **Page fixed**: the 2011 extension order was cited by gazette pages 6939-6942; now file pp.2-5 (file page = gazette
  page − 6937) on PEN-01, 02, 03, 04, 05, 08, 10. The age-20/21 exclusion (s.4(7)) is on file p.4 (gazette 6941), not
  6940 as the figure title said. Mor comprehensive bylaws page references were printed pages ("bylaws pp.51-54", which
  the extract dropped); now file pages (file = printed + 2) on PEN-11, 12, 13, 15, 16, 17, 19, 27, 30, 31, 33.
- **Link-less mentions linked: 2**. PEN-17: CMA circular 2022-9-30 (gov.il, p.4, annex s.4(א)) and notice 2024-1471
  "רשימת מסלולי השקעה – תיקון" (gov.il `notice-2023-069/he/List_of_investment_tracks_PDF.pdf`, 17.4.2024; p.2 has the
  three age-band default tracks, p.3 the halacha track). R-prov had not found these files. PEN-19: the Pension-Net
  dataset is now linked.
- **Official sources added where the rule leaned on an institution only**: PEN-28 and PEN-29 now cite the Tax
  Authority's 2026 deductions booklet, p.12 (סכום קצבה מזערי 5,306; סכום צבירה מזערי 110,250).
- **Titles**: English link texts with no documents.json row (Mor change summary, Mor selected-fund page, Gemel-Net
  query, Pension-Net) are now Hebrew.
- **Figure sources: 29** (all `checked 2026-10-25`):
  - copies replaced by official text: PEN-07 ×2 (ס"ח 2592 p.4), PEN-18 ×2 (ס"ח 2932 p.34), PEN-21 ×5 (ק"ת 7131
    p.5; 9942 p.2), PEN-22 ×2 (ק"ת 7131 p.4), PEN-26 ×3 (ס"ח 1919 p.1; ס"ח 2933 p.172), PEN-28 and PEN-29 (Tax
    Authority deductions booklet 2026 p.12; the record's 5,306 and 110,250 are printed there), PEN-03 ×3 (official
    2016 extension order p.2).
  - PEN-23 fees 1% / 0.22%: moved from the circular (which sets the mechanism, not the rates) to the 2024 report
    chapter 2 p.2, which states the rates; guarantee years: circular p.5, annex s.5.
  - page fixes and checks: PEN-01 ×2 (pp.3-4), PEN-02 (p.4), PEN-04, PEN-08, PEN-16 (p.37), PEN-33 (pp.27, 72; p.8).
- **Verified unchanged**: Mor comprehensive, general and gemel bylaws (section numbers checked against the PDFs),
  Harel 2026 table and June 2016 letter, CMA circular 2024-9-6 (still the newest on selected funds in the CMA
  collector), the Mor product pages, the Gemel-Net query.

Copies kept: none.

Figures that differ:
- PEN-19 (rule text figures, the record has no figures object): actuarial surplus / deficit of the new pension funds.
  The record gives 2024 values; the 2025 report (chapter 4, table ד-14, file p.12,
  `https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%204_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf`)
  repeats the same 2024 values and adds 2025: Infinity 0.14%, Altshuler Shaham 0.02%, Mor -0.06%, Phoenix 0.01%,
  Meitav 0.13%, Clal -0.03%, Harel -0.03%, Migdal Makefet 0.09%, Menora Mivtachim -0.28%.

For the founder:
- PEN-19: move the figures to 2025, or keep 2024 and say so (the cited table now holds both).
- Mor's comprehensive bylaws: a change summary dated 23.2.2026 describes a newer edition (01.04.2026) that updates
  the amounts in "סכום קצבה מזערי", "קצבת מינימום" and "תקרת הפקדה חודשית" and adds a halacha track. The PDF of that
  edition was not found on Mor's site (its product pages link only one-page May 2026 fact sheets), so the rules still
  cite the 01.06.2025 edition. The general-fund bylaws already are the 01.04.2026 edition.

Left open:
- The current consolidated wording of Provident Funds Law s.23(א)(2א) is not pinned to its last amending page
  (PEN-31 cites the base text, Amendment 13 and Amendment 21).
- PEN-08's monthly deposit ceiling is sourced from Harel and Mor (institution); the official definition sits in the
  income-tax regulations, outside this family's maps.

## Requests (`requests/FA-pen.json`)

Ten documents.json rows: the full names for nine Provident Funds Law amendment rows (and the 2021 Economic
Efficiency Law) whose match tokens and titles are cut at 60 characters, and the correct title plus official PDF for
circular 2022-9-30.
