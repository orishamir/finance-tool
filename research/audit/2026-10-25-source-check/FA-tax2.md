# FA-tax2: source check of the pension, general and tier-2 tax rules (2026-10-25)

Scope: the `- Source:` lines and the figure sources of the rules that have a record in data/rules, in three rule-base
files: `tax-pension-gemel-lekitzba.md` (18 records), `tax-general.md` (14) and `tax-tier2-other.md` (4). Every
source was opened today; every page was read with pdftotext on the downloaded file. Rule text, figures and the
rules' own strength/checked were not touched.

Documents used most (all official, file pages):

- Income Tax Ordinance, Tax Authority consolidated text ("פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים", 312 pages,
  to Amendment 262), plus the later gazette laws for the sections changed since: Amendment 275 (ספר החוקים 3336),
  the 2025 freeze law (Amendment 276, ס"ח 3342), the 2026 Economic Efficiency Law (ס"ח 3511).
- Tax Authority guide "דע זכויותיך וחובותיך 2025" (newest edition; file page = printed + 2).
- Tax Authority deductions booklet "לוח עזר ... לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026" (newest on the gov.il
  page, updated 15.04.2026; checked in Chrome today).
- Income Tax circular 2/2013 (Amendment 190), Form 106 (updated 1.2026).
- Provident-fund rules 1964, National Insurance's consolidated text (btl.gov.il/Laws1/02_0103_100022.pdf, to the
  2023 amendment) and the Provident Funds Law 2005 as published (ספר החוקים 2024, 10.8.2005, fs.knesset.gov.il 16_lsr_299984).

## 1. tax-pension-gemel-lekitzba.md (TXP, 18 records)

What changed, by kind:

- **Copy replaced by the official text: 20.** The Hebrew Wikisource Ordinance link in TXP-01, 03, 04, 05, 06, 11,
  13, 14, 15, 18, 19, 21, 27 and the link-less "Ordinance s.X ... primary (mirror)" mentions in TXP-02, 10, 12, 17
  now point to the Tax Authority consolidated PDF with the file page of each section (map `ito.json`, every page
  re-read). Wikisource copies of the provident-fund rules 1964 (TXP-10, TXP-11, TXP-24) now point to National
  Insurance's consolidated text with file pages (reg. 19 on pp.6-7; reg. 1 on p.4; reg. 34 on p.10). The Wikisource
  copy of the Provident Funds Law in TXP-24 now points to the law as published on fs.knesset.gov.il, p.3, s.1
  ("קופת גמל המיועדת לתשלום קצבה").
- **Copy removed: 1.** TXP-17's Wikisource copy of the Provident Funds Law s.23: circular 2/2013 p.13 (already on the
  rule) states the s.23 commutation conditions (paying annuity fund, not an old fund, the fund's method, the minimum
  annuity, 25% for up to five years).
- **Gazette citations added for wording newer than the consolidated text: 3.** TXP-13: "החזקה מהותית" in s.9(2) is in
  ס"ח 3511, file p.3, s.4. TXP-14: the s.9א(ז) shares for 2025-2027 (57%, 57.5%, 62.5%) are in Amendment 275,
  ס"ח 3336, file p.2. TXP-27: the 2025-2027 freeze s.120ב(ה) exists only in ס"ח 3342, file p.2 (the consolidated
  text has 120ב(א)-(ד) only).
- **Page fixed: 5.** TXP-01 guide "p.70" (the lead's +2 of printed p.68) is about academic-degree credits; the
  s.45א credit is on file p.71 (printed 69): the original printed citation was one page off. TXP-02 guide "printed
  pp.68-69" (link-less) → linked, p.71 (worked example 80,000 × 7% × 35% = 1,960 and the 2,268 floor). TXP-10 guide
  "printed p.29, p.20" (link-less) → linked, file p.31 and p.22. TXP-02 booklet: "p.12" sat inside the link title
  (no page extracted) → moved to the locator. TXP-11 reg. 19(א)(1)(ב)(1) runs over pp.6-7 ("8 אחוזים ושליש" is on
  p.7).
- **Link-less mentions turned into linked citations: 9** (TXP-02 Ordinance and guide; TXP-10 Ordinance, booklet and
  guide; TXP-12 Ordinance; TXP-17 Ordinance, circular and booklet). Before today the site showed none of them.
- **Locator corrected: 1.** TXP-24 cited reg. 34 for "a provident fund intended to pay an annuity"; that wording and
  the three pension-fund kinds (קרן ותיקה, קרן חדשה מקיפה, קרן חדשה כללית, each "קופת גמל לקצבה שאינה קופת ביטוח")
  are reg. 1 definitions (p.4). reg. 34(ג)-(ה) (p.10) stays for the different withdrawal conditions by fund type.
- **File pages added** to the circular 2/2013 citations (s.2 p.3, s.3 pp.5-6, s.4 p.6, s.5 p.13) and Form 106 (p.2
  above-ceiling deposit, p.4 annuity exemption, p.5 exempt grant).
- **Verified unchanged** (page and point confirmed, checked date set): every guide citation the lead converted (TXP-03
  pp.62-63, 66; TXP-04 p.71; TXP-05 pp.62-63; TXP-06 pp.62-64; TXP-13 p.89; TXP-14 pp.32-33, 91; TXP-15 p.33; TXP-18
  p.45; TXP-19 p.88), every booklet row (p.3 freeze sentence, p.6 Amendment 275 table, p.7 women's retirement age,
  p.12 and p.13 rows, p.19 non-compliant withdrawal).
- **Figure sources: 21 replaced** (Wikisource → Ordinance consolidated page with section in the title: TXP-01 ×1,
  TXP-02 ×2, TXP-03 ×1, TXP-04 ×3, TXP-05 ×3, TXP-06 ×6; TXP-10 7.5% → reg. 19 on National Insurance's text p.7;
  TXP-14 2026 and 2027 → Amendment 275 p.2; TXP-14 2028 (67%) → consolidated p.50, s.9א(ב), as R-ito advised;
  TXP-15 180 → p.50). **Printed pages in titles fixed: 3** (TXP-01 "pp.60, 68" → p.62; TXP-02 credit floor "guide
  p.68" → p.71; TXP-18 "guide p.43" → p.45). **Verified unchanged: 8** booklet figure sources (checked date set).
  Each value was found on the cited page (35%, 7%, 5%, 16%, 11%, 4%, 12%, 7.5%, 57.5%, 62.5%, 67%, 180, and the
  booklet amounts).

Copies kept: none. Rule-base lines with a Wikisource or Nevo host in these 18 rules: 0.

Figures that differ: none. (The 2025 guide's 57% on p.91 is the tax-year-2025 share; the record's 57.5% is 2026.)

For the lead / founder (rule text not changed):

- TXP-01 quotes the guide as "הניכוי משפיע על המס לפי שיעור המס השולי של הכנסתך"; the 2025 guide (p.62) reads
  "...משפיע על המס על-פי שיעור המס השולי של הכנסתך". The rule's quote is not verbatim.
- TXP-02 says the guide asks for a declaration on form 158 for credits claimed in the return. The only form-158
  mention near the pension section (p.63) is the declaration for a child aged 18 or over; p.71 has no form 158.
- TXP-03 rests its 2024/2025 values on "the s.47 footnote" (a Wikisource editor note, R-ito finding 2). The 2025 guide
  has 24,069 (pp.63-64, 71) but not 12,536; the booklet is the official source for the 2026 values.
- TXP-11 (regulations) is right on the 8⅓% (reg. 19(א)(1)(ב)(1), pp.6-7). The 32,000 base and "salary or 32,000"
  are Ordinance s.3(ה3) terms (consolidated p.21), not regulation terms (R-taxregs).
- TXP-12/TXP-14 cite circular 2/2013, whose own percentages were overtaken by Amendment 275 (TXP-14 says so). No
  newer edition of the circular exists on gov.il.

Left: nothing in this file's scope.

## 2. tax-general.md (TXG, 14 records)

What changed, by kind:

- **Copy replaced by the official text: 10.** Wikisource Ordinance links in TXG-04 (s.121(ב)(1), consolidated
  p.201), TXG-07 (s.91(ב)(1) p.151; s.125ג(ב), (ג)(1) p.204), TXG-09 (s.121ב(א) p.201 plus the current wording in
  ס"ח 3342 p.2), TXG-12 (s.88 definitions pp.146-150, split into two citations so each quote sits on its page),
  TXG-13 (s.88 "סכום אינפלציוני חייב" p.149, was a half-linked mention), TXG-28 (s.2 p.17). The Nevo copy of the
  withholding regulations 2005 in TXG-15 → National Insurance's consolidated text (btl.gov.il 02_0103_100269.pdf):
  p.2 regs. 2(א), 2(ד), 4, 5(א); p.3 reg. 10(ב); p.4 reg. 16 (form 0867 on request by 20 March, the rule's
  "paraphrased by the fetch tool" point is now confirmed in the text). The Wikisource copy of the filing-exemption
  regulations 1988 in TXG-17 → the official gazette booklets that set the cited wording (no consolidated official
  text exists, R-taxregs): ק"ת 6317א p.8 (reg. 2(א)) and p.9 (reg. 6א), ק"ת 7405 p.3 (reg. 3(א)(8), surtax), ק"ת
  11460 p.2 (reg. 3(א) "יחיד תושב ישראל", from 1.1.2026). The Wikisource copies of the National Insurance Law in
  TXG-27 (s.350(א)(6)-(7)) and TXG-28 (s.345(א)) → National Insurance's consolidated text (00_0001_000000.pdf, file
  dated 7.7.2026), p.246 and p.241.
- **Gazette citation added: 2.** TXG-04: ס"ח 3511 p.4, s.5 (Amendment 288 replaced the bracket amounts of
  s.121(ב)(1); the age-60 wording is unchanged). TXG-09: ס"ח 3342 p.2 (current s.121ב(א) wording).
- **Page fixed: 1.** TXG-10 cited "p.152 s.3(b)" (the gazette page) for the commencement: file p.4. Its figure source
  said "p.150 ... p.152": now p.2 and p.4.
- **Link moved: 1.** TXG-02's ס"ח 3511 link (25_lsr_12235101.pdf) and the one R-ito uses (25_lsr_12846863.pdf) are
  the same 40-page booklet; moved to the latter so the site has one document, Hebrew title, p.4 verified.
- **Quotes made verbatim: 5.** The guide reads "על הכנסה חייבת בשיעור מס קבוע יחול מס בשיעור הנקוב בלבד" (TXG-07 had
  "יחול המס"), "הכנסה חייבת למעט סכום אינפלציוני ולרבות שבח" (TXG-09 had "לא כוללת"), "יש למלא את הריבית החייבת
  במס המופיעה בטופסי 867" (TXG-15 had a paraphrase on p.42); the National Insurance Law reads "סעיפים 125ב" (TXG-27's
  quote said "סעיף 125ב"; the quote is now the verbatim 125ג part). Quotes with an ellipsis (not shown by the site)
  were cut to a verbatim span (TXG-04, TXG-20).
- **Verified unchanged** (page and point confirmed, checked date set): booklet p.4, p.10, p.11, p.15; guide p.5-6
  (TXG-17 ceilings), p.10, p.40, p.42, p.48, p.98, p.119 section ו; ס"ח 3342 p.2 quote of s.121ב(א1) (TXG-10);
  National Insurance's employee rates page (TXG-35, opened in Chrome: 7,703 / 51,910, 1.04% + 3.23%, 7% + 5.17%,
  employer 4.51% / 7.6%).
- **Figure sources: 1 replaced** (TXG-04 age 60: Wikisource → consolidated p.201). **2 page-fixed** (TXG-10 rate and
  threshold: gazette pages → file pages; the threshold 721,560 is not printed in the gazette, so its source is now
  the booklet p.11, with the gazette as the rule that ties it to s.121ב(א)). **2 pages added** (TXG-17 interest and
  securities ceilings: guide p.6 items 5 and 6). **Verified unchanged: 41** (TXG-02/03/04 bracket rows on booklet
  p.10, TXG-09 booklet p.11, TXG-35 rates page).

Copies kept: none. Wikisource or Nevo hosts left in these 14 rules: 0.

Figures that differ: none.

For the lead / founder:

- documents.json: the three filing-exemption amending booklets take the 1988 base title through the generic token
  "פטור מהגשת דין וחשבון"; rows with longer tokens are in `requests/FA-tax2.json`.
- TXG-17 says the salary ceiling is 723,000 and the guide's "lower of" item gives 721,560; both are on guide pp.5-6
  as the rule says (no conflict, noted for clarity).
- TXG-15's rule text still says "paraphrased by the fetch tool; re-read before encoding": reg. 16 (BTL p.4) states
  the certificate is given "על פי בקשתו, לא יאוחר מיום 20 במרס", form 0867. The rule author can drop the caveat.

Left: nothing in this file's scope.

## 3. tax-tier2-other.md (TX2, 4 records)

What changed, by kind:

- **Copy replaced by the official text: 6.** TX2-17: the Wikisource VAT Law (definitions, s.2) → the law as published
  (ס"ח 791, 1975: p.1 "מוסד כספי", p.3 s.2), Amendment 3 (ס"ח 927, 1979, p.1: definition "עוסק") and the 2026
  Economic Plan Law (ס"ח 3510, p.58, s.11: "מוסד כספי" para. (2) now ends "ולמעט בנק חברתי", s.4(ג) added); the
  Wikisource rate order → ק"ת 11179 p.2 (17% → 18% from 1.1.2025) and the 2005 original ק"ת 6416 p.3; the Wikisource
  financial-institution order → ק"ת 3687 p.3 (75% test) and the 1980 amendment ק"ת 4132 p.11 (currency and
  securities dealers). TX2-18: the Wikisource Ordinance → consolidated pp.12, 22, 41, 204; the Wikisource
  partial-linkage regulations → ק"ת 6227 p.9 (reg. 1(1)-(4)) and the 2005 amendment ק"ת 6377 p.8. TX2-19: both
  Wikisource orders → ק"ת 6214 p.9 (olim order: three-month term, 90 days, 20 years, form 2402 within 14 days) and
  ק"ת 6270 p.7 (returning residents: 90 days, 5 years, form 2409 within 14 days).
- **Copy kept: 1.** TX2-17, VAT Law s.4(ב) ("מס שכר וריווח" on a financial institution), Wikisource, checked today
  (the page shows s.4 amended תשס"ה, תשס"ח, תש"ע, תשע"א, תשפ"ו). Searched: the 1975 original (ס"ח 791 p.3, text layer
  scrambled), the 2026 Amendment 67 (ס"ח 3510 p.58, adds 4(ג) only), and R-taxregs downloaded every VAT amendment of
  2004-2012 from the Knesset OData and found no usable "שכר וריווח" text. Strength left as primary (mirror), with
  "no official text of the current s.4(ב) wording found" in the qualifier.
- **Locators corrected: 2.** TX2-19: both orders' conditions run past s.2(4) (olim (1)-(6), returning residents
  (1)-(7)); the locator is now "s.2".
- **Quotes: 1 shortened** (TX2-17, the 1979 "עוסק" quote contained מלכ"ר, whose inner quote mark cut the span; now
  the verbatim opening "מי שמוכר נכס או נותן שירות במהלך עסקיו").
- **Verified unchanged: 1.** TX2-20 Reit 1 investor-relations FAQ (opened in Chrome: the question, 80.41%, 19.59%,
  29.51%, "כיום 23%", form 867 all on the page); institution, as labelled.
- **Figure sources: 9 replaced** (TX2-17 vat_rate → ק"ת 11179 file p.2, the "1840" in the old title was the gazette
  page; financial_institution_turnover_test → ק"ת 3687 p.3; TX2-18 ×2 → consolidated p.204; TX2-19 ×5 → ק"ת 6214 p.9
  and ק"ת 6270 p.7, paragraph numbers checked). **Verified unchanged: 3** (TX2-20 example rates).

Copies kept: 1 (above). Figures that differ: none.

For the lead / founder:

- TX2-17 says "the start date of the 18% rate was not read": ק"ת 11179 p.2 gives 1.1.2025. The rule's paraphrase of
  "מוסד כספי" predates the 31.3.2026 "ולמעט בנק חברתי" carve-out (no effect on portfolio managers, R-taxregs).
- Titles: the lead's combined rows ("... (קובץ התקנות 6416; תיקון אחרון: קובץ התקנות 11179)" and similar) give each
  amending booklet its base order's title with the booklet number; acceptable. I retitled the ק"ת 6377 link with the
  amendment's own name so it no longer takes the 1964 provident-fund rules' title.

Left: nothing in this file's scope.

## Totals (three files, 36 records)

- Copies replaced by official text: 36 citations (20 TXP, 10 TXG, 6 TX2); copies removed: 1; copies kept: 1 (VAT Law
  s.4(ב)).
- Rule sources now: 0 Wikisource or Nevo links in the 36 Source lines except TX2-17's s.4(ב).
- Pages fixed: 7; link-less mentions turned into links: 9 (plus TXG-13's half-linked one); gazette citations added
  for post-consolidation wording: 5; quotes made verbatim or trimmed: 7.
- Figure sources: 85 in these records, all checked 2026-10-25; 31 replaced (Wikisource or gazette page → official
  file page), 6 titles with printed or gazette pages fixed or pages added, the rest verified unchanged.
- Requests: `requests/FA-tax2.json` (3 documents.json rows for the filing-exemption amending booklets).
- Validation: extract and `npm run validate` pass; skipped entries 0.
