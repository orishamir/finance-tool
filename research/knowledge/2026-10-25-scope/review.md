# Independent scope review of the rule records, 2026-10-25/26

The independent reviewer's pass under `research/specs/2026-10-25-rules-scope/spec.md` section 2: every one of the 577 records in `data/rules/` read with its sources against the definition in section 1, its scope written down (`review.json`), and only then compared with the editor's `- Scope:` lines. Nothing in `data/`, the references or the code was changed.

## 1. Method

- **Independence.** Before the verdicts were written, nobody on the review side opened the editor's `- Scope:` lines, the other files in this folder (applied, provident, pension, markets, tax-bases, brief) or the 2026-10-25 git history. The records were read through bundles (`tools/bundle.py` → `tools/work/records.json`, viewed with `tools/ref.py`) that hold each record's JSON and its references block with every `- Scope:` line and every inline "2026-10-25 (scope pass ...)" note cut out (151 records carried such a note). The comparison script (`tools/compare.py`) was written and run after `review.json` existed.
- **Who read what.** The reviewer took the 18 CAT records and the three specific checks. Five helpers (Opus, xhigh effort, the founder's research setting) took the rest, each with the same brief (`tools/helper-brief.txt`: the section 1 definition, the edge cases, the independence rules, the quote rule and a few practical readings, such as "a regulator's dataset that shows one company's track menu is that company's"). Groups: G1: PF, KGL, KH, CS (100); G2: PEN, SW, INS (100); G3: BRK, ETF, MKT (99); G4: BANK, BPN, MF, REG, GOV, IRA (127); G5: tax: TX2, TXA, TXF, TXG, TXH, TXI, TXK, TXP, TXS (133).
- **The quote rule.** Every `general` verdict carries the general source's own sentence, its URL and its locator, read in the fetched source with `tools/src.py` (gov.il HTML pages through `research/audit/tools/govil-page.sh` only; gov.il PDFs and every other site by plain curl; a bot check or block page was recorded and never worked around). The reviewer then re-checked every quote by script (`tools/verify_quotes.py`): of 467 quotes marked as read in the fetched source, 465 were found whole; the other two (KGL-01, PF-28, Knesset PDFs with an interleaved text layer) the reviewer read on the rendered pages. Two more were read on rendered pages by a helper (PEN-03, an image scan; SW-24, a scrambled gazette page), two are quotes recorded in the record from a page that blocks scripts (ETF-50, GOV-22), one is a count over every row of a CMA dataset (CAT-39), and **two have no quote at all (TXI-25, a Supreme Court ruling whose site resets the connection; TXS-24, Maya): general is not proven for those two.**
- **Checks over every row.** Where a record's claim was about the regulator's own data, it was checked over every row instead of one company's example: `tools/cat09_join.py` (CAT-09), `tools/cat24_spread.py` (CAT-24), `tools/cat39_pairs.py` (CAT-39).
- **What a verdict says.** `general` means a general source says the record's main statement and binds everyone it names; it does not certify every sentence of the record. Errors inside records are listed separately (section 7). For `institution` verdicts the helpers did not always re-open the company's PDF; the scope then rests on the kind of document cited.

## 2. Counts

| Scope | Records |
|---|---|
| general | 474 |
| institution | 90 |
| unsettled | 13 |
| total | 577 |

| Read by | Records | general | institution | unsettled |
|---|---|---|---|---|
| reviewer | CAT (18) | 16 | 2 | 0 |
| helper G1 | PF, KGL, KH, CS (100) | 81 | 19 | 0 |
| helper G2 | PEN, SW, INS (100) | 75 | 15 | 10 |
| helper G3 | BRK, ETF, MKT (99) | 55 | 41 | 3 |
| helper G4 | BANK, BPN, MF, REG, GOV, IRA (127) | 117 | 10 | 0 |
| helper G5 | tax: TX2, TXA, TXF, TXG, TXH, TXI, TXK, TXP, TXS (133) | 130 | 3 | 0 |

Mixed records with a part to split off: 29 (BANK-26, BANK-27, BANK-28, BRK-28, BRK-35, BRK-36, BRK-37, CAT-17, CS-16, ETF-40, ETF-43, ETF-53, GOV-13, IRA-09, KGL-26, KGL-27, KH-01, PEN-10, PEN-19, PEN-23, PF-39, PF-40, REG-13, SW-20, TXH-22, TXK-26, TXS-12, TXS-13, TXS-24). Each entry's `split` field says what goes and with which scope.

Where the record's own strength label and the scope part ways:
- marked `primary` but company-scoped: BRK-13, BRK-37, BRK-39, CAT-42, CAT-43, ETF-37, ETF-38, ETF-39, ETF-40, ETF-46, ETF-47, ETF-48, ETF-49, MF-55 (institution) and BRK-12, BRK-29 (unsettled). None of them has an editor Scope line (section 4), and every one has a first or only source labelled with a general-looking kind and strength `primary` (`exchange_rules` for TASE brochures and site terms, `other` for the S&P, MSCI and Nasdaq rulebooks, `institution_doc`/`primary` for TASE's own report and Maya, `official_pdf`/`regulator_page` for the Securities Authority's own site terms), so a validator that reads only the source label would pass them as general;
- marked `institution` but general once the general source found by the review is cited: CAT-23, KGL-27, KGL-28, TXK-26.

## 3. Disagreements with the editor

The editor wrote a Scope line for 188 rules; three of them (TXA-03, TXA-05, TXA-08) are rules in `tax-insurance-and-amendment-190.md` that are not records in `data/rules/`. Of the 185 records both sides scoped, the readings agree on 177 and differ on 8: four in kind, three in the companies named, one in the companies an unsettled record was seen at. Company names were compared as groups (Mor = Mor Investment House, Meitav Trade = Meitav, Altshuler Shaham Trade = Altshuler Shaham, Interactive Brokers Ireland = Interactive Brokers, BlackRock = iShares, Yelin = Yalin Lapidot); the entity-level spellings differ in 20 records and are a naming choice for the institution registry, not a disagreement.

### CAT-23 (kind)
- Editor: unsettled: the CMA list of investment tracks, amendment 2024-1471 of 17.4.2024 (its gov.il file); seen at: Meitav
- Review: general
- Evidence: The editor's own settling source exists and was read. A gov.il site search (through govil-page.sh) lists the CMA items 'רשימת מסלולי השקעה' (notice-2022-6545, 20.12.2022) and 'רשימת מסלולי השקעה - תיקון' (notice-2023-069, dated 16.4.2024 on gov.il). The amendment's Word file carries every track policy the record quotes from Meitav, for example 'מסלול כספי (שקלי) ... נכסי המסלול יהיו חשופים לנכסים הבאים אשר אינם צמודים ואינם חשופים לסיכוני מטבע (פרט למטבע השקל החדש): פיקדונות שקליים, מלוות ממשלתיות נקובות בש"ח ... בשיעור שלא יפחת מ-75% ולא יעלה על 120% מנכסי המסלול' (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_word.docx; the file marks deleted text by strike-through, which src.py now drops). Circular 2022-9-30 s.9(ב) binds every manager to the list's policy for a list name.
- Recommendation: General, re-sourced to the CMA list; Meitav stays as a named example. Re-check each track's wording against the 2024 text (it adds governments and deposits to 'אשראי ואג"ח', a 75% debt condition on debt funds from 1.7.2024, and drops 'מתמחה גמיש').

### KGL-27 (kind)
- Editor: unsettled: the CMA joining circular, or a rule that names kupat gemel lehashkaa for a minor's account; seen at: Altshuler Shaham, Meitav
- Review: general (helper G1), with Meitav's sentence split off as institution: Meitav
- Evidence: The CMA standard bylaw for kupat gemel lehashkaa, s.11, p.5: 'החברה המנהלת תשלם את הכספים שהצטברו בחשבונו של עמית בקופת גמל להשקעה או בחשבונו של ילדו הקטין ,אם הוא אפוטרופסו' (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-2829/he/regulation_hm_takanongemel.pdf). Altshuler Shaham's clause 11 copies it; the record's search looked at rule 38 and circular 2017-9-17 but not the standard bylaw.
- Recommendation: General, citing the standard bylaw. Worth one check by the lead that this 2016 standard bylaw clause is still the version in force (see KGL-30, where a later circular overrode another clause of the same bylaw).

### KGL-28 (kind)
- Editor: unsettled: the CMA standard bylaw for kupat gemel lehashkaa (gov.il), read for these two clauses; seen at: Altshuler Shaham, Infinity, Yachad Rofim
- Review: general (helper G1)
- Evidence: The editor's settling source was read: standard bylaw s.13, p.6: 'החברה המנהלת תשלח לעמית מושך דוח על המשיכה ,וזאת תוך 10ימי עסקים מיום תשלום הכסף לעמית', and s.14.1-14.2 for late payment (same file as KGL-27).
- Recommendation: General. The helper also notes that s.14.2 pays the difference whenever the value at actual payment is higher, not only after a fall, so the record's wording should be tightened.

### TXK-26 (kind)
- Editor: unsettled: reg. 3 of the 2005 withholding regulations as in force today in Reshumot, or a Tax Authority instruction to managing companies on withholding from kupat gemel lehashkaa withdrawals; seen at: Harel
- Review: general for the regulation (reg. 3(א), 20%), with Harel's 25% split off as institution: Harel, saying it departs from the regulation's text (helper G5)
- Evidence: Reg. 3(א) in the NII consolidated copy (to 27.12.2017), p.2: 'קופת גמל המשלמת ליחיד ריבית ,תנכה ממנה מס בשיעור של ,20%' (https://www.btl.gov.il/Laws1/02_0103_100269.pdf); the 2012 amendment (ק"ת 7076) moved regs 4 and 5 to 25% and did not touch reg. 3. Neither side established whether a later amendment exists.
- Recommendation: This one turns on a source fact, not on judgement: if reg. 3 was amended after 2017 to 25%, Harel does not depart from anything. Until the current Reshumot text is read, keep the regulation's rate labelled 'as consolidated to 27.12.2017' and Harel's 25% as Harel's. The site's net figures do not depend on it (the final tax is TXK-07); only a sentence such as 'the manager withholds 25%' does.

### PF-40 (institutions)
- Editor: institution: Altshuler Shaham, The Phoenix
- Review: institution: The Phoenix (helper G1), with Altshuler Shaham's part moved to the general record PF-23
- Evidence: Altshuler Shaham's clauses (switch within 3 business days; deferral to the 4th business day at the start of a month; deposit into each track) are the CMA standard bylaw word for word, s.20.1-20.4 and s.10, p.7: 'אם חל מועד העברת הכספים באחד משלושת ימי העסקים הראשונים בחודש פלוני ,רשאית החברה המנהלת לדחות את מועד העברת הכספים ליום העסקים הרביעי באותו חודש' (regulation_hm_takanongemel.pdf). Only The Phoenix's valuation date ('השינוי יבוצע לפי מדד השקעות אחרון הידוע ליום השינוי', its FAQ) is a company's own.
- Recommendation: The Altshuler part is general. Which part keeps the id is the lead's call: the spec says the general part keeps it (then PF-40 becomes general and The Phoenix's sentence gets a new id); the helper did the reverse because only one sentence is left on each side. The same choice arises in KGL-26.

### IRA-21 (institutions)
- Editor: institution: Meitav
- Review: institution: Meitav, Meitav Trade, Bank Leumi, Mizrahi Tefahot Bank, First International Bank, Bank Hapoalim (helper G4)
- Evidence: All five sources are Meitav's documents (the results of Meitav's competitive process for its IRA); the figures are each broker's price to Meitav's IRA members. The IRA regulations (reg. 12 process, reg. 7 charges) set no tariff.
- Recommendation: By the letter of the definition ('found only in one institution's documents') the scope is Meitav, with the brokers named in the text; listing the banks would put the record on their company pages too, which is a presentation choice. Recommendation: Meitav.

### REG-26 (institutions)
- Editor: institution: Interactive Israel
- Review: institution: Interactive Israel, Interactive Brokers (helper G4)
- Evidence: The only source is Interactive Israel's own 'about' page; the record itself says Interactive Brokers' own protection pages were not opened and the amounts are 'as the introducer states'.
- Recommendation: After the comparison the reviewer sides with the editor: Interactive Israel only. No Interactive Brokers document supports the record.

### PEN-40 (seen-at)
- Editor: unsettled: a CMA circular or approval that changed the orphans' share in s.94 of the standard pension bylaw; seen at: Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim
- Review: unsettled, seen at the same five plus Infinity (helper G2: its 2023 bylaw has the same 40% split)
- Evidence: Same kind and settling source; the helper's search found one more company bylaw with the same wording.
- Recommendation: Add Infinity to the seen-at list. Still unsettled: six bylaws are a count over some companies, never a general statement.

## 4. Records with no Scope line

392 of the 577 records have no `- Scope:` line. The review reads 369 of them as general, 17 as institution and 6 as unsettled. The non-general ones matter most, because nothing marks them today:

| Record | Review | Companies | Why |
|---|---|---|---|
| BRK-12 | unsettled | Tel Aviv Stock Exchange | Read the TASE Clearing House rules (תקנון מסלקת הבורסה, published on the TASE site) for the central-counterparty guarantee, the risk fund and the custodial-member class, and the Securities Law ss.50א to 50ב / the Financial Assets Agreements Law 2006 for the l… |
| BRK-13 | institution | Tel Aviv Stock Exchange | Judgement call. The record describes what one company does: the TASE Nominee Company (a TASE subsidiary) registers securities in its name, deposits them at the clearing house and passes on dividends and interest; 'most listed companies use it' is a TASE state… |
| BRK-29 | unsettled | Tel Aviv Stock Exchange | Read the amended TASE rules and guidelines (part 3, trading days and hours) as approved by the ISA on 30.7.2025 and the Finance Minister on 5.8.2025, or the TASE/ISA notice publishing that amendment. Searched: web search for the rule amendment and its ISA app… |
| BRK-37 | institution | Tel Aviv Stock Exchange | Judgement call. What the record adds over BRK-33 is TASE's own legal disclaimer and its website terms of use (non-commercial use, no republication without written consent, the limited-quotation exception). These are TASE's contract terms as owner of its websi… |
| BRK-39 | institution | Tel Aviv Stock Exchange | TASE's commercial data products, licences and price list: TASE acting as a data vendor, not as rule-maker; its site terms are its own contract. Pages are script-rendered and were not re-read. |
| CAT-42 | institution | Tel Aviv Stock Exchange | Judgement call. The only source is TASE's own platform (Maya): its filter panel, its export button and the counts its filters return. No law or exchange rule is involved. The counts are a count over every fund (they belong in data/ as a count, which TASE's te… |
| CAT-43 | institution | Tel Aviv Stock Exchange | TASE's terms of use for its websites are the company's own contract terms as a site operator, not the exchange's rulebook or guidelines approved by the Securities Authority. |
| ETF-37 | institution | S&P Dow Jones Indices | The index provider's own description and methodology (the brief: index methodologies are company documents). Consistency note for the reviewer: TASE's own index rules (ETF-33 to 36, 41, 42, 44, 45) were scored general because the brief treats TASE guidelines… |
| ETF-38 | institution | S&P Dow Jones Indices | Index methodology (company document). Not re-read (curl 403 per the record). |
| ETF-39 | institution | S&P Dow Jones Indices | Index methodology and index page (company documents). Not re-read. |
| ETF-40 | institution | S&P Dow Jones Indices | The three return versions are the provider's methodology (company document). |
| ETF-46 | institution | Nasdaq | Index methodology and factsheet (company documents, per the brief). |
| ETF-47 | institution | Nasdaq, IBI, Mor Investment House, MTF | Two institution parts: Nasdaq's own index versions (company document) and three named Israeli funds' tracking-asset wording (their Maya annual reports). Nothing general. If split, the funds' tracking-asset sentence belongs with ETF-64/65 (institution: IBI, Mo… |
| ETF-48 | institution | MSCI | MSCI's factsheets and methodology (company documents, per the brief). |
| ETF-49 | institution | MSCI, MTF, Tachlit, IBI, Kesem | MSCI's return-version definitions and withholding table (company document) plus five named Israeli funds' tracking-asset wording (their Maya reports). Nothing general; the treaty rates the conditions mention are pointers (TXF-12, TXF-16). |
| IRA-28 | institution | Slice, Globalnet | Not a rule record (the record says so): reported events about two named managers, from press only (Bizportal, Calcalist). Under the brief, press about named companies with no general source is institution. Searched for a regulator source: WebSearch 'רשות שוק… |
| MF-55 | institution | Israel Securities Authority | Judgement: not a financial rule. The record is about the ISA as a publisher: where its 2025 report sits, its date, and its website terms of use on reusing ISA content. Like a TASE corporate document under the brief, it is the ISA's own document about its own… |
| MKT-01 | institution | J.P. Morgan Asset Management | Not a rule record: a published past-return record (a data series) from one asset manager's slide, republishing S&P data; it belongs with data series, which the record itself says. Scope institution: J.P. Morgan Asset Management (its publication and its reuse… |
| SW-37 | unsettled | Bank Leumi, Interactive Israel, Bank Yahav, Tel Aviv Stock Exchange | An ISA or TASE rule (or BoI directive) on moving securities between an Israeli custodian and a foreign broker, or an explicit regulator statement that none applies. Seen: Securities Law amendment 63 s.49א (the permit regime for foreign brokers: general, carri… |
| SW-X01 | institution | Migdal, Clal | Not a rule record: one forum member's unverified account (Hasolidit). Per the brief, a forum is never general; the account is about two named companies' alleged conduct (Migdal withdrawing a quote; Clal's agent pulling a clearing-house report without consent)… |
| SW-X02 | unsettled |  | Nothing to settle as a rule: a single forum account (Hasolidit .36752) about an unnamed company's fees after an employer change, plus a tactic resting on the general cancellation right (SW-07). If kept, keep it as an experience note; the fee-after-employer-ch… |
| SW-X03 | unsettled |  | Not a rule: forum opinions (Hasolidit .34986) on moving Israeli holdings to a foreign broker. Whatever rule exists would come from the ISA/TASE or the Tax Authority (see SW-37, SW-36, SW-55). |
| SW-X04 | unsettled |  | Not a rule: one forum member's practice (Hasolidit .37102, first page of five). The right to act without an agent is general (SW-17, advice law s.13(ב)(1)). |

All records with no Scope line, by prefix (non-general ones in bold):

- BANK (18): BANK-01, BANK-05, BANK-07, BANK-09, BANK-13, BANK-14, BANK-15, BANK-17, BANK-18, BANK-19, BANK-20, BANK-21, BANK-22, BANK-23, BANK-26, BANK-27, BANK-28, BANK-32
- BRK (17): BRK-01, BRK-04, BRK-07, **BRK-12**, **BRK-13**, BRK-15, BRK-16, BRK-17, BRK-18, BRK-19, BRK-21, BRK-22, **BRK-29**, BRK-32, BRK-33, **BRK-37**, **BRK-39**
- CAT (17): CAT-06, CAT-09, CAT-10, CAT-15, CAT-16, CAT-17, CAT-18, CAT-19, CAT-20, CAT-24, CAT-35, CAT-36, CAT-37, CAT-38, CAT-39, **CAT-42**, **CAT-43**
- CS (15): CS-02, CS-03, CS-04, CS-05, CS-06, CS-08, CS-12, CS-13, CS-15, CS-16, CS-20, CS-21, CS-22, CS-25, CS-27
- ETF (30): ETF-01, ETF-05, ETF-14, ETF-17, ETF-18, ETF-21, ETF-22, ETF-23, ETF-26, ETF-31, ETF-32, ETF-33, ETF-34, ETF-35, ETF-36, **ETF-37**, **ETF-38**, **ETF-39**, **ETF-40**, ETF-41, ETF-42, ETF-43, ETF-44, ETF-45, **ETF-46**, **ETF-47**, **ETF-48**, **ETF-49**, ETF-50, ETF-51
- GOV (23): GOV-01, GOV-02, GOV-03, GOV-04, GOV-05, GOV-06, GOV-07, GOV-08, GOV-09, GOV-10, GOV-11, GOV-12, GOV-13, GOV-14, GOV-15, GOV-16, GOV-17, GOV-18, GOV-19, GOV-20, GOV-21, GOV-22, GOV-23
- INS (2): INS-25, INS-26
- IRA (13): IRA-01, IRA-03, IRA-07, IRA-09, IRA-13, IRA-14, IRA-15, IRA-16, IRA-18, IRA-25, IRA-26, IRA-27, **IRA-28**
- KGL (4): KGL-01, KGL-02, KGL-14, KGL-24
- KH (5): KH-01, KH-03, KH-12, KH-17, KH-22
- MF (35): MF-01, MF-02, MF-03, MF-04, MF-05, MF-07, MF-08, MF-09, MF-10, MF-11, MF-13, MF-16, MF-17, MF-18, MF-20, MF-21, MF-22, MF-24, MF-26, MF-29, MF-30, MF-31, MF-32, MF-34, MF-35, MF-36, MF-37, MF-38, MF-39, MF-40, MF-41, MF-45, MF-49, MF-52, **MF-55**
- MKT (1): **MKT-01**
- PEN (16): PEN-01, PEN-02, PEN-03, PEN-04, PEN-05, PEN-06, PEN-07, PEN-10, PEN-18, PEN-21, PEN-22, PEN-26, PEN-28, PEN-29, PEN-34, PEN-36
- PF (21): PF-01, PF-02, PF-05, PF-06, PF-10, PF-12, PF-16, PF-17, PF-18, PF-19, PF-20, PF-22, PF-28, PF-29, PF-33, PF-34, PF-35, PF-36, PF-37, PF-38, PF-39
- REG (17): REG-01, REG-03, REG-04, REG-05, REG-06, REG-07, REG-10, REG-11, REG-13, REG-14, REG-15, REG-17, REG-18, REG-19, REG-21, REG-23, REG-27
- SW (35): SW-01, SW-03, SW-04, SW-05, SW-11, SW-12, SW-13, SW-14, SW-15, SW-16, SW-19, SW-20, SW-21, SW-22, SW-23, SW-25, SW-26, SW-27, SW-28, SW-29, SW-30, SW-31, SW-32, **SW-37**, SW-38, SW-39, SW-40, SW-41, SW-42, SW-43, SW-44, **SW-X01**, **SW-X02**, **SW-X03**, **SW-X04**
- TX2 (3): TX2-17, TX2-18, TX2-19
- TXA (1): TXA-27
- TXF (19): TXF-01, TXF-02, TXF-03, TXF-04, TXF-05, TXF-08, TXF-10, TXF-11, TXF-12, TXF-13, TXF-14, TXF-16, TXF-17, TXF-18, TXF-20, TXF-21, TXF-22, TXF-23, TXF-27
- TXG (14): TXG-02, TXG-03, TXG-04, TXG-07, TXG-09, TXG-10, TXG-12, TXG-13, TXG-15, TXG-17, TXG-20, TXG-27, TXG-28, TXG-35
- TXH (14): TXH-01, TXH-02, TXH-03, TXH-04, TXH-05, TXH-08, TXH-09, TXH-10, TXH-13, TXH-15, TXH-17, TXH-18, TXH-19, TXH-22
- TXI (18): TXI-01, TXI-02, TXI-03, TXI-04, TXI-05, TXI-07, TXI-08, TXI-09, TXI-11, TXI-12, TXI-13, TXI-14, TXI-15, TXI-16, TXI-17, TXI-19, TXI-20, TXI-25
- TXK (14): TXK-01, TXK-03, TXK-04, TXK-05, TXK-09, TXK-10, TXK-16, TXK-17, TXK-18, TXK-19, TXK-20, TXK-22, TXK-23, TXK-25
- TXP (18): TXP-01, TXP-02, TXP-03, TXP-04, TXP-05, TXP-06, TXP-10, TXP-11, TXP-12, TXP-13, TXP-14, TXP-15, TXP-17, TXP-18, TXP-19, TXP-21, TXP-24, TXP-27
- TXS (22): TXS-01, TXS-02, TXS-03, TXS-04, TXS-05, TXS-06, TXS-07, TXS-08, TXS-09, TXS-10, TXS-11, TXS-12, TXS-13, TXS-14, TXS-16, TXS-17, TXS-18, TXS-19, TXS-21, TXS-22, TXS-23, TXS-24

## 5. Judgement calls the founder should see

- **Index rules.** The Tel Aviv exchange's own index rules (TA-35, TA-125 and so on) are read as exchange rules, so general (ETF-33 to 36, 41, 42, 44, 45), while the S&P, MSCI and Nasdaq index rulebooks are company documents, so institution (ETF-37 to 40, 46 to 49). Both describe what an index holds; the difference is that the exchange's rules are part of its rulebook. If you want every index treated alike, the eight TASE records become 'institution: Tel Aviv Stock Exchange'.
- **The exchange as a company.** Where the exchange acts as a company and not as a rule-maker, the review reads it as an institution: its website terms (CAT-43, BRK-37), its paid data products (BRK-39), its Maya fund list and download button (CAT-42), its nominee company (BRK-13). Two records about how the exchange runs the market rest only on its annual report, not on its rulebook (BRK-12, the clearing house; BRK-29, the Monday-to-Friday trading week): unsettled until the rule text is read. The other reading is that, as the only exchange, whatever it does is true for everyone.
- **'No rule exists' records.** Several records say that something does not exist: no deposit insurance (BANK-23), no minimum balance in a self-directed provident fund (IRA-10), no rule on keeping a client from leaving (SW-19), no fee cap at non-bank brokers (SW-34), no Israeli rule on foreign brokers (SW-37). An absence has no sentence to quote. The review scores the first three general because a law that covers everyone was read and is silent (BANK-23 leans on a 2026 law that orders the minister and the governor to examine whether deposit insurance is needed), and the last two unsettled. A cleaner home for all of them may be the open questions, not the rule set.
- **Regulator texts that bind no one.** The definition counts a regulator's published guidance as general. In practice that includes texts that bind nobody: the Securities Authority's yearly report describing the fund market (ETF-11, 17, 18, 26, 52), a voluntary 2016 outline that fee increases happen only on 1 January (MF-17), the pension regulator's drafts and plans (IRA-26, IRA-27), the Finance Ministry chief economist's paper (TXH-04, 17, 22) and National Insurance's FAQ on a pension route whose legal basis the record itself doubts (TXK-25). They are general in scope (nobody's own term) but the site should not present them as law.
- **Company clauses copied from a regulator's standard bylaw.** Many company bylaw clauses turn out to be the regulator's standard bylaw word for word (KGL-27, KGL-28, PF-40's Altshuler part, PEN-10, PEN-21, PEN-26). Once the standard bylaw is quoted they are general. Where only the company's copy was found but it still carries the regulator's drafting note (PEN-44, Mor's loans clause), the review stays at unsettled. KGL-30 is the reverse case: the two-year discount wording is the regulator's own 2016 standard bylaw, later overridden by a 2017 circular, so the companies that kept it depart from the current rule. A lead for the lead: the regulator also has a standard bylaw for savings provident funds, 'תקנון תקני קופת גמל לחיסכון', amended by circular גמל 2021-2-1 of 21.10.2021 (https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2021-2-1/he/takanon-tikni-kupat-gemel-lehisachon-tikun-pdf.pdf, found by gov.il site search). Its base text, which is the editor's settling source for PEN-44, was not found in this pass, and whether it reaches study funds was not established; helper G1 found no standard study-fund bylaw, so KH-09, KH-13, KH-25 and KH-27 to KH-32 rest on company bylaws.
- **Who a broker's price inside Meitav's IRA belongs to.** IRA-21: the editor names only Meitav (its documents, its tender); the review also named the five brokers (their prices). This decides which company pages show it.
- **Things that are not rules.** Forum posts (SW-X01 to X04), press reports about two IRA managers (IRA-28), a published past-return series (MKT-01), the Securities Authority's own website terms (MF-55) and many counts over the market (ETF-43, ETF-50, BRK-32, CAT-42, TXS-24, IRA-03, IRA-17, MF-18, MF-52, REG-03) are in the rule set. The schema forces a scope on each, and none fits well. They belong in data, notes or open questions.
- **Partial counts.** Two pension records state a figure seen in several companies' bylaws but in no regulator text: a 12.5% floor on insured salary (PEN-37, four bylaws) and the orphans' share (PEN-40, six bylaws). By the definition they stay unsettled and cannot appear in the guide.

## 6. The three specific checks

### 6.1 The child-savings fee after 21 (CS-30 in the ledger)

`packages/engine/src/ledgers/child-savings.ts` (formula F-54) takes `book.rate("CS-30", "fee_after_21")`, 0.23% a year, and charges it on every provident-route balance after the last grant, whatever the manager. The figure's own source is Harel's child-savings bylaw (its fill-in of the regulator's blank) and Altshuler Shaham's Q&A (`data/rules/cs-30.json`, figure `fee_after_21`, strength institution, `update_rule: provider-set`). The ledger's input has no manager, so the result presents two companies' rate as the provident route's. **By the CLAUDE.md rule ('a company's term is never general ... never as a fact about a product') that is a company term used as a fact about the product.** The guide page does it right: it names Harel and Altshuler Shaham beside the figure and says the other companies were not checked.

The general alternatives:
- **The legal cap (CS-18).** After 21 the general provident-fund cap applies: up to 1.05% a year of the balance (fee regulations reg. 2(א)(1), quoted in CS-18) and up to 4% of deposits, which is moot after 18 because deposits stop. It is general and sourced, but it is a ceiling, so a result built on it is a worst case and must say 'up to'. The standard child bylaw leaves the rate blank for each company ('בשיעור ____', s.31.1), and the 0.23% NII pays until 21 is NII's payment, not a rate after 21.
- **A count over every collected institution.** Not available today. The regulator's Gemel-Net data cannot give it: in 202609 the 41 child-savings tracks of the ten managers (Infinity, Altshuler Shaham, Analyst, The Phoenix, Harel, Clal, Migdal, Mor, Meitav, Menora) show average asset fees of 0 to 0.02%, because NII pays until 21 for almost every member. A count would need each of the ten managers' child-savings bylaws (the blank each one filled). Two of ten is a partial count, which the spec says is never general.
- **The person's own manager.** The rule 'every number is sourced, computed, or entered' also allows the rate to be entered by the person (from their own manager's bylaw), with the cap as the bound, or a named example ('at Harel and Altshuler Shaham: 0.23%') shown with the company's name.

Materiality: the fee matters only for money left in the fund after 21 (the ledger charges nothing before the last grant month). Left there for nine more years, the gap between 0.23% and the 1.05% cap is about 7% of the balance. Recommendation for the lead (no code was changed): run the provident route on the legal cap labelled 'up to', or on an entered rate bounded by the cap, and show Harel's and Altshuler Shaham's 0.23% only as a named example; collecting the other eight managers' bylaws would make a real range possible.

### 6.2 CAT-09, CAT-17, CAT-24 (read by the reviewer)

None of the three has an editor Scope line. All three are general, and in each the company document is not needed:
- **CAT-09** (a Gemel-Net 'fund' row is a track). General: it is about how the regulator's dataset is built. Gemel-Net's own dictionary defines FUND_ID as 'מספר מס הכנסה של קופת הגמל. זיהוי יחודי לקופה.', and the regulator's model joining form refers to 'מספר מס הכנסה של המסלול' (circular 2022-9-30 p.10). Checked over every row instead of Meitav's example: all 764 distinct FUND_IDs of 202609 appear as track numbers ('מספר מסלול השקעה') in the regulator's own transfer dataset `transfer_bank` (85 also equal a fund number, where fund and track share one). So the regulator's dataset proves the claim; Meitav's merger notice can stay only as a named example. The record names that dataset in its text but does not cite it.
- **CAT-17** (track categories). General: circular 2022-9-30 s.2 defines the general track ('מסלול כללי – מסלול השקעה שאינו מסלול מתמחה ,אינו מסלול ברירת מחדל ואינו מסלול למקבלי קצבה') and the five clusters. Harel's page is used only for the last clause, that Harel's own grouping of names is incomplete: that is a statement about Harel's page, to drop or split off as Harel's. The standard names under each cluster are in the regulator's list (notice-2023-069), which replaces Harel as the source.
- **CAT-24** (regulatory versus expected policy; one name, different mixes). General: the circular's definitions of 'מדיניות ההשקעה התקנונית' and 'מדיניות השקעה צפויה' (s.2, p.2). 'The same standard name differs widely between managers' has a general basis in the regulator's own data: in Gemel-Net 202609 the kupat gemel lehashkaa track 'משולב סחיר' of 11 managers ranges from 23.9% (Ayalon) to 99.1% (Infinity) of assets in equities and from 1.2% (Meitav) to 109.4% (Analyst) abroad; Harel's own row shows 97.9% abroad. So Harel's description is not needed, and Meitav's notice may stay as a named example. One wording issue: Meitav's notice changes the regulatory policy itself under the same name ('שינוי מדיניות השקעה תקנונית'), which is not the 'actual mix moving within an unchanged policy' the sentence claims.

### 6.3 Records marked primary that cite a company document beside a general one

69 records are marked primary and cite at least one company document next to a general source. In **61** the general source carries every statement that keeps the id, so the company document is not needed (at most a named example): BANK-05, BANK-09, BANK-14, BANK-17, BANK-21, BANK-26, BANK-27, BANK-28, BRK-01, BRK-15, CAT-06, CAT-09, CAT-17, CAT-24, CS-04, CS-05, CS-06, CS-08, CS-12, ETF-04, ETF-05, ETF-14, IRA-07, IRA-16, IRA-18, KGL-02, KGL-14, KH-01, KH-12, KH-17, MF-10, MF-24, PEN-03, PEN-04, PEN-07, PEN-10, PEN-18, PEN-21, PEN-22, PEN-26, PEN-28, PEN-29, PEN-34, PF-19, SW-15, SW-21, SW-38, SW-44, TXF-05, TXI-17, TXK-04, TXS-07, TXS-08, TXS-09, TXS-10, TXS-11, TXS-12, TXS-13, TXS-14, TXS-19, TXS-22.

In 4 it is still needed, each for a sentence the general source lacks, which is the part to split off as that company's: BRK-04 (Who supervises whom is set by the TASE rules (supervision chapter ו', s.40; admission conditions for a non-bank member in ss.5 to 6, pp.9 t…); BRK-27 (The withholding part is general from the regulations (a third-party government host; the regulations are the Finance Minister's). That a fo…); CS-16 (The bank sentence "בבנק החשבון מתחדש לתקופות נוספות, ושבירה של תקופה כזו עלולה לגרוע ריבית והצמדה" rests only on Bank Yahav's agreement (ss…); IRA-09 (text_he's 'או במכתב שחרור ממעסיק קודם' comes only from Meitav's product page; the regulation speaks of the member's employer approving. Spl…).

The other 4 are not general at all, because their 'general' source is the exchange's own corporate document or an index provider's: BRK-12 (unsettled), BRK-13 (institution), ETF-47 (institution), ETF-49 (institution).

A few patterns behind the 'not needed' cases: a company brochure cited for a tax rule that is in the Ordinance (TXS-07 to TXS-14, TXS-19, TXS-22 lean on one Migdal prospectus; TXK-04 on a Harel brochure; TXI-17 on Discount and Mercantile where withholding regulation 9(א) says it); a company page cited where the regulator's standard bylaw has the same clause (CS-04, CS-06, KGL-02, PEN-10, PEN-21, PEN-26); average-wage figures taken from Harel instead of National Insurance (PEN-04, PEN-07).

## 7. What is wrong in the rules' own text or sources

194 records carry a `text_issue`. The ones that change what a reader would be told (each checked against the source by the reviewer where marked ✓):

- **GOV-16 ✓**: Says the state buys bonds back early 'at the market price on the day'. The 2007 amendments the record itself cites replaced exactly that tail in every bond type's early-redemption clause: 'במקום הסיפה החל במילים "ובמחיר השוק" יבוא ...' (KT 6597 pp.3-5). No price rule is left.
- **BANK-06 ✓**: Says that when a bank agrees to an unplanned early break the form must state the exact consequences. The Disclosure Rules s.10(ב) say the opposite: 'ואין צורך לפרט את התוצאות המדוייקות הנוגעות לפקדון המסויים' (BoI 151.pdf p.6).
- **PEN-28 ✓**: Inverts the condition of the 25%-for-5-years commutation: the standard bylaw s.51(א)(2) (Mor's p.44 identical) allows it only 'ובלבד שסכום קצבת הזקנה נמוך מסכום הקצבה המזערי או שווה לו'. The record says 'provided the remaining pension is not below the minimum', which is the survivors' clause. It also dates the yearly update of the minimum annuity to 1 January where the 2008 law says 1 March.
- **PEN-29**: Inverted the same way: law s.23(ב)(3)(ג) requires annuities paid to be above the minimum annuity amount, not 'up to' it; and Mor's bylaw is listed first among the sources.
- **SW-17**: States a flat ban on percentage-based pay for a pension adviser; s.28(ב) as enacted allows it during the advice period set in the agreement.
- **SW-14**: Drops the condition in reg. 9(ד) that the receiving fund is also a new fund.
- **PEN-18**: Says it is unknown whether the target is CPI-linked; the same law page defines it as 5.15% compounded plus the CPI rise.
- **CAT-19**: The closed general track is cited to s.3(ד) of circular 2022-9-30, which by its words is about insurance policies sold before 2004; for annuity provident funds the regulator says it in the 2024 track-list amendment ('המסלול הכללי (שסגור למצטרפים חדשים בקופות גמל לקצבה)').
- **CAT-15, CAT-23**: Say the regulator's list of investment tracks was not obtained; it is on gov.il (notice-2022-6545 and its 2024 amendment notice-2023-069).
- **TXK-26**: The withholding rate on a kupat gemel lehashkaa lump sum is 20% in the regulation as consolidated to 27.12.2017 and 25% in Harel's flyer; whether a later amendment exists is still open (section 3).
- **BRK-45**: Misquotes the IRS: the W-8BEN validity runs 'ending on the last day of the third succeeding calendar year', not 'until ...'.
- **BRK-47**: Leumi's clause that it need not keep a client's securities apart may depart from the Supervisor of Banks' custody guidance (BRK-10); if kept, the record should say so.
- **IRA-05, IRA-29**: Cite reg. 3(ג) where the clause is reg. 3(ב).
- **IRA-09, TXI-17, TXK-04, TXS-07, TXS-09, TXS-12, CS-05, CS-16, KH-01, PF-06, TXA-27**: A company's term or practice worded as if it were general.
- **CS-27**: The 2022 circular re-issued the annual-statement template: one row now reads 'ששולמו עבור העמית' where the record has 'שנגבו מהעמית'.
- **CAT-35**: 'An empty field is not zero' rests on CAT-40, which is not a record in data/rules.
- **GOV-03, MF-32, MF-34, MF-37, MF-39**: Call Bank of Israel directive 447A a draft; the cited file is the final 04/25 version.
- **CAT-10**: Its five `datastore_search_sql` links now return an HTML page, not data.

Recurring, lower-stakes classes: text that still says a law 'was read on Wikisource / Nevo / a copying site' although the sources are now Knesset, Reshumot or gov.il files (44 records mention it, across PEN, SW, TXP, GOV, ETF, PF, KGL, KH, IRA); source kinds mislabelled (TASE brochures and site terms as `exchange_rules`, Banking Rules as `regulator_page` in one place and `regulation` in another, bills as `law`); wrong page numbers (TXA-28, TXF-04, TXF-22, TXS-15); sources with no Hebrew title (`title_he` empty on 117 sources in 63 records; the English `title` is always there); figures from a PDF whose text layer garbles digits (PEN-15, the Codex part 6 file), which a script check of a figure will always fail.

Every record's text issue in full is in `review.json`; the list below gives the start of each.

| Record | Issue |
|---|---|
| BANK-05 | text_he's last sentence (the concentrated rate table shows whether a deposit under one year auto-renews and how many renewal periods are possible) comes from BoI directive 447 Annex A and circular 2781 p.3, which are not among this record'… |
| BANK-06 | s.10(ב) says that when early withdrawal was not pre-agreed the form lists the changes to the original terms or the principles for breaking that deposit type, 'ואין צורך לפרט את התוצאות המדוייקות הנוגעות לפקדון המסויים' (p.6). text_he says… |
| BANK-17 | The annual check differs by customer: for a senior citizen or person with disabilities the rules compare only with the basic track (r.4א(ב1)); for a small business or licensed dealer with the basic or extended track (r.4א(ב2)). The referen… |
| BANK-21 | Source [4], the bill (הצעת חוק, Knesset bills 1099), is labelled official_pdf/primary; it is not binding and is cited only for the proposed fine and the meaning of 'small bank'. The ice.co.il press item about Bank of Jerusalem is not neede… |
| BANK-23 | The record cites only the 2026 private bill and Knesset OData; it does not cite the 2026 competition law s.16 (its own sibling REG-04), which is the general source for the position. A Maariv report (18.06.2026) quotes MK Ron Katz 'כמעט חצי… |
| BPN-10 | text_he's closing sentence ('לפי הכללים של בנק ישראל ההסכם חייב לפרט את סדרי ההפקדות ואת תנאי המשיכה המוקדמת, אבל אף כלל לא קובע איך הפקדות ננעלות') is a general statement whose source (Disclosure Rules s.7(ב)(4)-(5), BoI 151.pdf p.5) is n… |
| BRK-01 | The periodic report is cited as the source of an exchange-structure rule; the TASE rules part 1 (s.2 and the definitions on p.6) are the general source and are already used elsewhere in the file (BRK-07). |
| BRK-04 | Source [2] has no title (title_he None); it is TASE's English 'foreign bank member' brochure, and its p.4 says only that the ISA supervises TASE, not that TASE limits its supervision of banks. The two English guides are TASE explanatory br… |
| BRK-06 | Source [0] is labelled kind 'law' with the title 'חוק ניירות ערך, התשכ״ח-1968', but the URL is the ISA's 'Conditions of the General Permit under Section 49A', English translation (a regulator's permit conditions with a 'no legal status' no… |
| BRK-12 | Source [1] has no title (None). The 'not a compensation scheme' sentence is an inference worded as a rule. |
| BRK-13 | Source [0] is TASE's English NBCM brochure, labelled exchange_rules; it is an explanatory brochure. |
| BRK-15 | text_he ends 'נוסח החוק נקרא באתר שמעתיק אותו', but the source is the Knesset's own Sefer HaChukim PDF (fs.knesset.gov.il), not a copying site. |
| BRK-18 | Source [1] has no title (None); it is the BoI's 2009 summary of 2008 consumer-protection activity, used only for what '(בפיקוח)' means. |
| BRK-21 | Source kind is regulator_page, but the document is the Banking Rules (secondary legislation), which BRK-16 labels 'regulation'. |
| BRK-22 | Source kind regulator_page for the Banking Rules (should be regulation, as in BRK-16). |
| BRK-27 | Source [0] publisher is given as 'National Insurance Institute'; btl.gov.il only hosts the Income Tax regulations (issued by the Minister of Finance). |
| BRK-28 | Meitav Trade's page shows two different minimums (NIS 5,000 and 10,000); the record says so. |
| BRK-32 | Source kind 'dataset' is fine, but the record carries no quoted span, and the page cannot be fetched without a browser. |
| BRK-37 | Source [1] (TASE website terms of service) is labelled exchange_rules; it is TASE's site terms, a corporate document. |
| BRK-39 | Sources [0] and [1] (the Data Services and Data Hub purchase pages) are labelled exchange_rules; they are TASE's commercial product pages. Sources [2] and [3] are labelled other. |
| BRK-41 | Source [0] (KID.pdf) has no title (None). The open-account page calls the Irish supervisor 'ICL'; the footer says Central Bank of Ireland; the record reports both as the firm's words. |
| BRK-42 | All five sources have no title (None). |
| BRK-43 | All three sources have no title (None). |
| BRK-44 | Both sources have no title (None). |
| BRK-45 | The references block quotes the validity as 'until the last day of the third succeeding calendar year'; the IRS text reads 'ending on the last day of the third succeeding calendar year'. |
| BRK-48 | Source [2] (Altshuler Shaham Trade tariff) has no title (None). |
| BRK-50 | Both sources have no title (None). IBKR's 'valid for the year in which they are signed and for the next three calendar years' agrees with the IRS wording. |
| CAT-06 | "The value changes every January" rests on two Meitav tracks in the data plus CAT-36; say so or point to CAT-36. The Meitav reports page can be dropped. |
| CAT-09 | The text names the transfer dataset ('קובץ ההעברות הבנקאיות') but does not cite it; cite https://data.gov.il/api/3/action/package_show?id=transfer_bank (CMA, 'פרטי קופות לצורך העברת כספים בין גופים מוסדיים') in place of Meitav's notice. |
| CAT-10 | The five datastore_search_sql links now return an HTML page instead of JSON (tested 2026-10-26), so they no longer reproduce the values; use datastore_search with filters or fields. |
| CAT-15 | Stale: 'הרשימה עצמה לא הושגה'. The CMA list is on gov.il: 'רשימת מסלולי השקעה' (20.12.2022) https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2022-6545/he/list-of-investment-tracks_pdf.pdf and its amendment of 16.4.2024 https… |
| CAT-19 | The closed general track is cited to s.3(ד), which by its words is about 'פוליסות ביטוח שהן קופות ביטוח ששווקו לפני שנת 2004'. For annuity provident funds the CMA says it in the 2024 list amendment's explanatory part: 'המסלול הכללי (שסגור… |
| CAT-23 | Title and text say the CMA list was not read and the content is 'unsettled'; re-source to the CMA list and compare each track's wording with it (the 2024 amendment, for example, adds governments and deposits explicitly to 'אשראי ואג"ח' and… |
| CAT-24 | Meitav's page is titled 'שינוי מדיניות השקעה תקנונית': the regulatory policy itself changed under the same name (within the CMA list's bounds), which is not the same as the actual mix moving within an unchanged policy, as the sentence says… |
| CAT-35 | 'שדה ריק אינו אפס' rests on CAT-40, which is not a record in data/rules (dangling reference); none of CAT-35's sources supports it. |
| CAT-39 | Four funds (Altshuler Shaham new and general, Mor new and general) also have tracks with empty fees, so 'every track carries the fund's pair' holds for the tracks that have a value. The Pensia-Net 'מושגים' page did not return the quoted 'ע… |
| CAT-42 | Source kind 'institution_doc' with strength 'primary' is inconsistent; the page is not fetchable by curl, so the counts rest on the Chrome reading. |
| CAT-43 | Source kind 'exchange_rules' is wrong: website terms of use are not exchange rules. |
| CS-04 | Harel's bylaw s.8 is cited for 'deposits by NII only'; it copies the CMA standard child bylaw s.8 (gov.il regulation-1056, p.5), which should be cited instead, or dropped since reg. 2 says the same. |
| CS-05 | text_he says "בבנק ההסכם מבטיח" on the strength of one bank's agreement (Bank Yahav); cite hly.gov.il / circular 1356 for the general principal guarantee (at the end of the saving period), or name Yahav for the nominal-at-all-times wording. |
| CS-06 | The 'only through NII' clause is cited to Harel's bylaw s.7.1; it is the CMA standard child bylaw s.7.1 (gov.il regulation-1056 annex, p.5) and should be cited from there. |
| CS-08 | text_he "כל חברה מציעה חלק מחמישה מסלולים" understates the rule: every manager must offer the three risk tracks; halacha and sharia only if it runs such a track in another fund (circular 2022-9-29 s.3(א)). The no-split statement should cit… |
| CS-10 | Source [0] locator says p.5, pp.21-22; the quoted interest sentence is on p.22 of the fetched PDF. |
| CS-15 | text_he says a grant (מענק) is deposited on approval; law s.74ד(ב) (read, p.52) says NII transfers "הסכומים הנוספים המפורטים בסעיף 74ב(א)(1)(א) ו-(ב)" (the age-3 and age-13 sums), while NII's page and circular 1356 p.12 speak of a single 5… |
| CS-16 | text_he states Yahav's renewal and early-break terms as true of 'the bank' in general. |
| CS-18 | The NII quote "לאחר גיל 21 ייגבו דמי הניהול מחשבון החיסכון" is not on the cited sum page in that order; the page reads "לאחר גיל 21 דמי הניהול ייגבו מחשבון החיסכון" (read). |
| CS-25 | The page still says "לא ניתן להעביר את כספי החיסכון מהבנק שבחרתם לבנק אחר או לקופת גמל אחרת", which the law s.74ב(א)(2א) (in force 1.1.2025) overrides for future deposits; the record flags it, but the source is out of date on that point. |
| CS-27 | The record reads the 2018 amendment only (open question 17), but circular 2022-9-29 (cited elsewhere in the CS file) re-issues the annex (now 'נספח ג', p.9): its table row reads "דמי ניהול ששולמו עבור העמית בפועל", not "דמי ניהול שנגבו מהע… |
| ETF-01 | text_he ends 'נוסח החוק נקרא באתר שמעתיק אותו'; the source is the ISA's own consolidated text of the law (and the Reshumot gazette for the regulations), so 'a copying site' undersells it, though a consolidated version is not the official g… |
| ETF-05 | text_he ends 'נוסח התקנות נקרא באתר שמעתיק אותו', but the source is the Reshumot gazette file from the Ministry of Justice service (free-justice.openapi.gov.il), the official text. |
| ETF-06 | Source [1] (Wikisource mirror) has no title (None). The market-maker duty the record cites as reg.3 appears in the gazette under the heading 'חובת מינוי עושה שוק ועשיית שוק ביחידות קרן סל' as subsections (א)-(ב); the PDF layout puts the nu… |
| ETF-09 | The record's only source is the olaw PDF p.15, whose text layer is interleaved; adding the Wikisource copy (or the gazette) would make the quote checkable. |
| ETF-10 | Source [2] (Wikisource) has no title (None). |
| ETF-21 | text_he ends 'נוסח התקנות נקרא באתר שמעתיק אותו', but the source is the Reshumot gazette file (official) and the ISA's own directive. |
| ETF-22 | text_he ends 'נוסח החוק נקרא באתר שמעתיק אותו'; the sources are the ISA's consolidated text and the Knesset's Sefer HaChukim. |
| ETF-23 | text_he ends 'נוסח התקנות נקרא באתר שמעתיק אותו', but the source is the Reshumot gazette file (official). |
| ETF-28 | Source [0] has no title (None). |
| ETF-29 | Source [0] has no title (None). |
| ETF-31 | text_he ends 'נוסח התקנות נקרא באתר שמעתיק אותו', but the source is the Reshumot gazette file (official). |
| ETF-32 | The record carries no quoted span from the TASE page. |
| ETF-33 | Source [0] has no title (None) and is labelled exchange_rules, but it is a TASE marketing brochure ('מדדי הבורסה המובילים'), not the rules; text_he still says the index rules were not read, while ETF-41 now reads them. |
| ETF-34 | Sources are TASE knowledge-centre pages labelled exchange_rules (explanatory web pages, not the rules). The guidelines' third Rimon condition reads 'המניה הינה מניה ישראלית' (p.11), while the record says 'זיקה לישראל'; reconcile the wordin… |
| ETF-35 | All three sources are TASE knowledge-centre pages labelled exchange_rules; the guidelines (274765-1.pdf) carry the rule and should be cited. ETF-42 notes the index page says publication 'at least five trading days before' vs two weeks here. |
| ETF-36 | Sources are TASE knowledge-centre pages labelled exchange_rules; the guidelines should be cited for the rule. |
| ETF-41 | Source [1] (TASE index page) is labelled regulator_page; it is TASE's market-data page. |
| ETF-42 | Source [2] (TASE index page) is labelled regulator_page; it is TASE's market-data page. |
| ETF-46 | Both sources have no title (None). |
| ETF-47 | All five sources have no title (None). |
| ETF-48 | All four sources have no title (None) and page=None although locators give pages. |
| ETF-49 | All six sources have no title (None). |
| ETF-53 | The record's only sources are MSCI's and Nasdaq's documents, while its first statements come from the assets and tracking-fund regulations, cited only by cross-reference (ETF-51, ETF-14); the regulations should be on the source list. |
| ETF-64 | Nine of the ten sources have no title (None). |
| ETF-65 | Five of the six sources have no title (None). |
| ETF-66 | Nine of the ten sources have no title (None). |
| GOV-02 | text_he ends 'נוסח החוקים נקרא בעותק באתר נבו', but both cited sources are the Knesset's Sefer HaHukim PDFs (fs.knesset.gov.il), not Nevo. Also the State Loan Law's marginal heading for s.2 is 'תשלום וערובה' (OCR 'תשלוט וערוגה'), which sit… |
| GOV-03 | text_he calls the 'up to one year' text 'טיוטת הוראה אחרת של בנק ישראל', but the cited source is the final directive 447A (04/25), whose s.17 (p.3) reads 'מועד פירעונו הוא עד שנה'. It is not only a draft. |
| GOV-10 | text_he says 'החוק והתקנות נקראו בעותק באתר נבו', but the cited sources are the Reshumot file service (free-justice.openapi.gov.il) and the Knesset's Sefer HaHukim, not Nevo. |
| GOV-11 | text_he ends 'התקנות נקראו בעותק באתר נבו', but the cited sources are the Reshumot gazette PDFs on free-justice.openapi.gov.il, not Nevo; the references block also says definitions were 'quoted from the Nevo text' while the definitions are… |
| GOV-12 | text_he says the regulations were read 'בעותק באתר נבו'; the cited source is the Reshumot gazette on free-justice.openapi.gov.il. |
| GOV-14 | text_he says 'התקנות נקראו בעותק באתר נבו', but the cited sources are Reshumot gazette PDFs on free-justice.openapi.gov.il. |
| GOV-15 | text_he ends 'התקנות נקראו בעותק באתר נבו', but the cited source is the Reshumot gazette (KT 6597) on free-justice.openapi.gov.il. |
| GOV-16 | The title and text_he say the buyback price is 'מחיר השוק של האיגרת ביום הפדיון בפועל'. The 2007 amendments cited as sources [0] and [3] (KT 6597 pp.3-7) replace exactly that tail in every bond type's early-redemption clause: 'במקום הסיפה… |
| GOV-17 | text_he's 'מק"ם נרשם למסחר בבורסה אחרי כל מכרז' rests on the BoI makam conditions (makam.pdf p.9, GOV-04), which are not among this record's sources. |
| GOV-18 | text_he says מירון's status is known 'ממקור משני בלבד'; the Ministry of Finance dataset metadata on data.gov.il (package goverment-domesticdebt, non-tradable resource notes) names 'ערד, חץ או מירון' as bonds issued to pension funds, which… |
| GOV-19 | text_he says the EDGE licence terms are still open; each row of the SECDWH CSV fetched today carries 'Free (free for publication)' in its publication/confidentiality column, which bears on that open question. data.gov.il shows license_titl… |
| IRA-01 | The cited source is the original 2005 Sefer HaHukim text, whose definition reads 'קרן שאושרה לפי הוראות סעיף 13(א) כקופת גמל לתגמולים או כקרן השתלמות, או תכנית ביטוח שאושרה לפי הוראות סעיף 13(ב) כקופת גמל לתגמולים' (p.2): no 'לקצבה'. text_… |
| IRA-03 | The 15 funds / 7 companies figure is not reproducible from either cited query on its own (the 'אישי' query returns 12 rows including a non-IRA central severance fund); the count method should be recorded with the data. |
| IRA-05 | The references block attributes the no-restriction clause to 'reg. 3(ג)'; in the 2009 text it is reg. 3(ב) (KT 6820 p.3), and the 2025 draft also amends 'תקנה 3 ... פסקה (ב)'. |
| IRA-09 | text_he presents 'or a release letter from a former employer' as part of the rule; the regulation's wording is only that the member's employer approved the deposit. The release-letter route is Meitav's (company page). |
| IRA-15 | Source locator 'reg. 6(א)-(ב)' misses reg. 6(ג), where the fee disclosure (ג)(3) and the free cancellation (ג)(5) sit (KT 6820 p.4). |
| IRA-23 | text_he's last sentence (seniority carries over under the transfer regulations) has no source in this record; its source, the Provident Funds (Transfer between Funds) Regulations 2008, is only cross-referenced. |
| IRA-28 | All three sources are secondary press; the record's strength 'secondary' matches, but the Globalnet item is allegations in a class-action request, which text_he says. Slice's CMA notice (reported by the press) would be a primary source if… |
| IRA-29 | The references block cites the no-restriction clause as 'reg. 3(ג)'; in the regulation it is reg. 3(ב) (KT 6820 p.3; the 2025 draft amends 'תקנה 3 ... פסקה (ב)'). |
| KGL-02 | Cite the CMA standard bylaw s.8.1 (or the law) instead of Altshuler Shaham's bylaw for the repeat; 'per ID number, as Altshuler words it' is Altshuler's wording. |
| KGL-14 | (1) text_he "כל מסלול נחשב קופה נפרדת לעניין דמי הניהול": reg. 6 reads "על כל מסלול השקעה כאילו היה חשבון נפרד" (a separate account, not a separate fund). (2) text_he "נוסח התקנות נקרא רק באתר שמעתיק אותו" and the conditions' 'read only th… |
| KGL-24 | text_he says the computation gives "בדיוק את תקרת ההפקדה שהחברות המנהלות מפרסמות": a comparison with company figures that KGL-03 has dropped as sources; the CBS figure stands on its own. |
| KGL-27 | The record (and text_he) says no general source was found and only two companies' documents support it; the CMA standard bylaw s.11 (gov.il regulation-2829, p.5) carries the clause and should be the source; strength should change from inst… |
| KGL-28 | text_he says no general source was found; the CMA standard bylaw ss.13-14 carries both clauses. Also the higher-of-two clause is worded loosely: s.14.1 pays the due-date amount plus late interest, and s.14.2 adds the difference if the valu… |
| KGL-30 | The record frames the two years as these two companies' out-of-date bylaws; the wording is the CMA's own 2016 standard bylaw (ss.36.1, 37.3), so any bylaw that copied it carries it. Say so, and that circular 2017-9-15 overrides it. |
| KH-01 | text_he "התקנונים מתארים" generalises one company's bylaw; and "נוסח החוק נקרא באתר שמעתיק אותו" is out of date, the law is now cited from the Knesset PDF. |
| KH-03 | Conditions say extension orders were not read because 'gov.il is blocked'; gov.il HTML is now reachable through the project's FlareSolverr route, so open question 3 could be retried. Also the s.20(א) quote should be checked against a clean… |
| KH-12 | text_he opens with "התקנונים משתמשים ב'גיל פרישה'" (company wording) and says "נוסח החוק נקרא באתר שמעתיק אותו", but the record now cites the Knesset PDFs; start from the Ordinance and drop the mirror remark. |
| MF-13 | text_he says the section was read through a summary of a copying site and not checked word for word; the cited ISA-hosted consolidated text (p.39) carries s.48 in full and matches the 3/3/7-day powers and newspaper notice. One detail diffe… |
| MF-21 | text_he's 'כשנגבית תוספת, שיעורה חייב להופיע בפרסומי הסיווג' rests on the fund classification regulations (reg. 3(א)), which are not among this record's sources. |
| MF-24 | text_he names three fund categories (money-market, mostly short bonds and deposits, all others) without saying the original 2006 text had different types and rates; the cited p.3 of KT 6464 shows 0.25%/365, 0.8%/365, 0.4%/365, so the curre… |
| MF-32 | text_he says the BoI display directive's FX-fund definition was read 'מנוסח טיוטה' and must be checked against the final text; the cited source is the final directive 447A (04/25), whose s.4 (p.1) carries the definition. |
| MF-34 | text_he says the BoI directive was read 'מנוסח טיוטה'; the cited 447a.pdf is the final directive (04/25). |
| MF-37 | text_he attributes 'before bank commissions' only to the ISA's example display and says the BoI directive was read 'מנוסח טיוטה'; the final 447A (04/25) itself says 'האומדן הוא לפני חישוב מס רווחי הון ועמלות בנקאיות (ככל שהבנק רשאי לגבות)'… |
| MF-39 | text_he (and the references block: 'The text read (draft)') says the directive was read from a draft; the cited 447a.pdf is the final directive (version 1, 04/25, circular 2813). |
| MF-55 | The terms-of-use page and the publications page cannot be read without a browser (curl returns an empty JS shell), so the quoted terms and the 17 June 2026 date are recorded only. |
| PEN-01 | text_he says the wording 'was verified against a copy on a payroll company's site', but no such source is listed in sources; either list it as a third-party copy or drop the sentence. |
| PEN-03 | text_he says the rates 'were read in a scan of the agreement on a third-party site and in an insurer's letter', but the listed general source is gov.il's own scan of the 2016 order, which is legible (p.2, s.3); no third-party site is liste… |
| PEN-04 | text_he says the average wage 'is taken here from the Tax Authority's data page (deductions booklet 2026)', but sources list only Harel's 2026 table for it; the references block likewise gives Harel. Either add the Tax Authority source or… |
| PEN-06 | text_he says 'the law was read in a copy on Wikisource', but the listed law source is the Knesset gazette PDF (fs.knesset.gov.il), not Wikisource. |
| PEN-07 | text_he says 'the law was read in a copy on Wikisource', but the listed source is the Knesset gazette PDF; the 2026 amounts are a company's table (Harel) rather than an NII/Tax Authority figure. |
| PEN-10 | The record says the general fund 'is defined in the extension order as a new pension fund not entitled to designated bonds'; the extension order (H096, 5 pages) has no such definition (searched 'קרן פנסיה כללית', 'אגרות חוב', 'מיועדות': no… |
| PEN-12 | The recorded span 'החל ביום ה-61 שלאחר מועד האירוע המזכה בקצבת נכות' does not match by script because the PDF interleaves '(א)' ('ה61- (א) שלאחר'); the sentence is on p.45, not pp.44-46 generally. |
| PEN-15 | The Codex part 6 PDF's text layer garbles digits (it extracts '11%' and 'עד לגיל 1741' where the page shows '35%' and '67'; I checked the rendered page 7). A script check of any figure quoted from that file will fail; quote figures from th… |
| PEN-18 | (1) text_he says 'whether the target is CPI-linked is not written in the text read' (open question 8), but the same page defines 'תשואת היעד המצטברת' as 5.15% compounded over 60 months 'בתוספת שיעור עליית מדד החודש שפורסם לאחרונה לפני חודש… |
| PEN-21 | text_he says 'the regulations were read in a copy on Wikisource', but the sources are Reshumot gazette files. The disabled-member fee clause should cite the standard bylaw rather than 'bylaws' (Mor). |
| PEN-22 | text_he says 'the regulations were read in a copy on Wikisource', but the sources are Reshumot gazette files. |
| PEN-23 | The references block says 'at least two' selected funds; that wording was not found in the fetched circular (search 'לפחות שתי קרנות': not found); check the locator (annex s.4). |
| PEN-26 | text_he says 'the law was read on Wikisource', but the sources are Knesset PDFs; the minimum-eligibility-age statement should cite the standard bylaw, not Mor's. |
| PEN-28 | (1) The record inverts the condition of the 25%/5-year commutation: it says 'provided the remaining pension is not below the minimum annuity amount', but the standard bylaw s.51(א)(2) (and Mor's s.51 identically) allows it only 'ובלבד שסכו… |
| PEN-29 | (1) The record inverts the annuity condition for the small-balance lump sum: it says '(or annuities up to the minimum annuity amount)', but s.23(ב)(3)(ג) reads 'ואם משולמת לו קצבה כאמור -סך הקצבאות המשולמות לו ... בתוספת פנסיה תקציבית ,עול… |
| PEN-34 | The pre-2008 limit is not in the two law sources the record cites: the 2005 original s.13(א) has no such paragraph and amendment 15 (2016) only inserts 'להשקעה' after 'לקצבה' in s.13(א). It is in amendment 3 (2008), s.3 (s.13(א)(4)), fs.kn… |
| PEN-37 | Only Mor's bylaw is listed as a source, yet the text names Harel, Altshuler Shaham and Meitav (and Altshuler Shaham's 2018 change summary) as seen; their links were not recorded. |
| PEN-40 | Only Mor's bylaw is linked although five companies are named; Infinity's 2023 bylaw has the same wording and could be added. |
| PF-02 | text_he "נוסח התקנות נקרא באתרים שמעתיקים אותו" and the conditions' 'Wikisource text read only in summary' are out of date: the record cites the official Reshumot files (7131, 7358, 9942), including the 2022 annuitant amendment. |
| PF-05 | text_he "נוסח התקנות נקרא באתרים שמעתיקים אותו" is out of date; the official Reshumot files are cited. |
| PF-06 | text_he "חברה מנהלת מפרסמת דמי ניהול ממוצעים מהפקדה של אפס" puts an unnamed company's figure (Altshuler Shaham's page, cited only in the references block, not in sources) into a general rule; name it as an example or drop it. Also the circ… |
| PF-12 | text_he "התקנות נקראו בסיכום באתר שמעתיק אותן" is out of date: the Reshumot amendments are cited and carry reg. 3ב(א)-(ד) verbatim. |
| PF-16 | text_he "חוזר הרשות נקרא מעותק המתארח באתר של צד שלישי" is out of date: the source is the gov.il BlobFolder PDF. Conditions say the bylaws 'add the exception in PF-14'; the bylaws' s.37.3 is a no-notice exception, not PF-14's early-raise c… |
| PF-22 | text_he ends "החוק נקרא באתר שמעתיק אותו", but the record cites the Knesset PDFs; out of date. |
| PF-23 | The quoted circular clause is, in context, an item a fund must tell members when it reassigns them between age-based default tracks (s.4(ד)(3): "מידע אודות זכותו של כל עמית..."); it presupposes the right rather than granting it. The right… |
| PF-29 | Conditions cite "bylaws s.28.1" (unnamed bylaws) for the gemel lehashkaa pledge; the general source is Amendment 15 s.4 (amending law s.25(א)(1)), already in the sources list. |
| PF-33 | text_he "החוזר הרשמי נקרא באתר צד שלישי (פריסה); עותק מאתר gov.il לא אותר" is out of date: the record's own source is the gov.il BlobFolder PDF (read). |
| PF-40 | text_he presents the start-of-month deferral as Altshuler Shaham's bylaw term and says other companies were not checked; it is the CMA standard bylaw s.20.4, binding every kupat gemel lehashkaa. |
| REG-01 | The references block quotes 'הפיקוח הכללי והבקורת על כל תאגיד בנקאי'; the cited text reads 'והביקורת' (with yod), so the quoted span does not match the source letter for letter. |
| REG-16 | The TASE guidelines PDF (274691.pdf) is headed 'מעודכן עד ליום 19.8.24' on p.95, while the record's source title says 'מעודכן עד 1.1.2026'. |
| SW-01 | text_he says 'the regulations' wording was read on a site that copies it', but the sources are Reshumot gazette files. |
| SW-03 | text_he says 'the CMA circular was read from a copy hosted by a third party', but the source is the gov.il copy. |
| SW-04 | text_he says 'the circular was read from a third-party copy and the regulations on a site that copies them', but the sources are gov.il and Reshumot. Reg. 1 also covers an active member who told the receiving fund no deposits will be made… |
| SW-11 | text_he says 'the circular was read from a third-party copy', but the source is the gov.il copy. |
| SW-12 | text_he says 'the regulations were read on a site that copies them and the circular from a third-party copy', but the sources are Reshumot and gov.il. |
| SW-13 | text_he says 'the regulations' wording was read on a site that copies it', but sources are Reshumot gazette files. |
| SW-14 | The 2014 reg. 9(ד) applies to a partial transfer 'מקופה מעבירה שהיא קרן חדשה לקופה מקבלת שהיא קרן חדשה'; the record drops the condition that the receiving fund is also a new pension fund (the 2022 amendment cited may have changed this; not… |
| SW-15 | text_he says one source is 'a law read on a site that copies it'; the law sources are Knesset PDFs. |
| SW-16 | text_he says the circular's form table 'was read from a third-party copy', but the source is the gov.il copy. |
| SW-17 | The record states flatly that an adviser may not charge a fee computed as a percentage of the amounts the customer transfers (s.28(ב)), but the sentence as enacted ends 'אלא בתקופת הייעוץ הפנסיוני הקבועה בהסכם לפי הוראות סעיף )27ב().(4' (p… |
| SW-19 | text_he says the law was 'read in full on a site that copies it' and the circular 'from a third-party copy', but the sources are Knesset PDFs and the gov.il copy. |
| SW-20 | The record cites only a company FAQ (The Phoenix) for statements that the Transfer Regulations make (reg. 9(ג) no partial transfer, p.4 of קובץ התקנות 7407); a company document is the sole source of a general rule. 'Some funds do not accep… |
| SW-36 | The references block gives the Tax Authority summary as p.68 (file p.69); the script finds it on file p.69, consistent with the note. |
| SW-39 | The 2008 reg. 3(ב)(1) as printed applies 'למעט לפי ... פסקאות ) (8עד ) (12שבה', i.e. to routes (1)-(7); route (11א) was added in 2020, so its inclusion relies on the 2020 amendment's wording, which the record cites elsewhere (SW-01) but no… |
| SW-41 | text_he still says the official copy 'is identical to the copy read earlier' (a third party's); the records now cite gov.il directly, so several SW texts' 'read from a third-party copy' phrases are stale (SW-03, SW-04, SW-11, SW-12, SW-16,… |
| SW-43 | Minor: circular h-2833's page-replacement table prints the pages as '488-1-14' (the directive number misprinted in the circular itself); the record correctly says 448. |
| SW-44 | The annex ג table extracts out of order (figures such as 0.35 appear beside the row), so the NIS 11 / NIS 1 figures could not be re-checked by script; a reader should check them on the rendered page 8. |
| TX2-17 | English title 'a bank or TASE member charges none' drops the 75%-of-turnover condition that the 1977 order sets for a TASE member (text_he keeps it as 'רוב מובהק'; 'רוב מובהק' is itself a paraphrase of the 75% figure). s.4(ב) (מס שכר וריוו… |
| TX2-18 | The second half (index-linked grant = interest on an unlinked deposit; FX-floor payout = partial linkage) is an inference not stated in any cited source; it is disclosed in text_he, but the record's strength 'primary' covers only the first… |
| TX2-21 | The quoted page gives a 2012 example and an outdated company rate ('כיום 23%'); undated page. |
| TXA-27 | Last sentence 'דרישת שלושת התלושים בטופסי הקופות היא יישום של הוראה זו' speaks of 'the funds' forms' in general with no source in this record and no named fund; the three-payslip count is a company practice (it belongs to the record on the… |
| TXA-28 | Source [0] locator says p.21 for s.3(ה5); the text is on p.22 of the fetched PDF. The switch-and-move statements rest on a government report, not on a statutory provision (the record says so). |
| TXA-29 | The Phoenix's published s.125ד figures do not match the statutory amounts (the record says so); they should be shown only as The Phoenix's. |
| TXF-04 | Only a Capitax copy; no gov.il copy (the record says so). The 90% condition is on p.3 of the copy, the record's locator gives p.2 only for section 4.1.5, whose start is on p.2. |
| TXF-05 | text_he names 'עמוד קרנות הסל של בנק לאומי' as part of the source; a company page should not be presented as a source of a general rule (it can at most be a named example). |
| TXF-11 | text_he cites 'מקור משני אחד, בלוג מימון אישי' that is not among the record's sources; either add it as a secondary source or drop the sentence. |
| TXF-22 | The quoted dates sit on p.153 of the PDF; the locator gives p.152 (where s.91(ד)(2ג)(א) begins). |
| TXH-13 | Source [4] (tazkirim.gov.il memorandum) could not be fetched (TLS certificate failure on plain curl); its quote is recorded only. A 2024 memorandum is a draft, not binding; it only corroborates. |
| TXH-22 | Source [2] Calcalist (calcalist.co.il/local_news/article/skys1wkozg) returns 403 with a bot-check page; not fetched, recorded only. |
| TXI-05 | text_he says 'הגדרת השר ל"הפרשי הצמדה חלקיים" לא נמצאה', but the definition exists and is cited and read in TX2-18: תקנות מס הכנסה (קביעת הפרשי הצמדה חלקיים), התשס"ג-2003, reg. 1 (Reshumot ק"ת 6227 p.9: 'הפרשי הצמדה חלקיים הם כל אחד מאלה')… |
| TXI-17 | The bank practice sentence is worded as general ('בנק מקזז') but sourced only to two banks' pages (a count over two institutions); replace the source with withholding regulations 2002 reg. 9(א), which states it for every payer. |
| TXI-25 | The record carries no quoted span from the judgment, and its only source cannot be fetched by script; add a quote (and ideally a Nevo or other copy). Commentary suggests the Supreme Court dismissed the appeal; whether it endorsed each poin… |
| TXK-04 | text_he leans on 'חברה מנהלת אומרת זאת במפורש' (Harel brochure) for a general statement; a general source says it: the Ministry of Finance team report Feb 2025, p.14. Replace the Harel source with it. |
| TXK-06 | Source [1] is labelled kind 'law' and titled 'חוק הפיקוח ... (תיקון מס' 15), התשע"ו-2016', but the fetched PDF (20_ls1_323033) is the government bill (הצעות חוק הממשלה 1029, 9.3.2016), i.e. explanatory notes, not law; the record's text cal… |
| TXK-07 | Source [6] is the 2016 government bill (הצעות חוק הממשלה 1029), labelled kind 'law'; it is explanatory notes. The record also notes the Tax Authority guide still prints the deleted sentence. |
| TXK-09 | text_he mentions 'בעיתונות מדווח על כוונה להמליץ לדחות את גיל הפטור' with no press source among the record's sources. |
| TXK-17 | text_he says the 'not found' rests on a text search of a copying site (Nevo mirror); the cited source is the Tax Authority's own consolidated PDF, where the search also finds nothing, so the sentence can cite the official text. |
| TXK-23 | text_he says 'והחברות מחילות אותו על הרווח הריאלי' (a practice of the managing companies, worded for all of them) and cites 'מדריך עיתונאי מתוארך' (Tashkif, 25.9.2026); neither the companies nor the press guide are among the record's sourc… |
| TXK-26 | Record strength 'institution' and the title lead with Harel; after the split, the id should carry the regulation (general) and Harel's 25% should be a separate, named institution record. |
| TXP-04 | text_he ends 'הפקודה נקראה בעותק בוויקיטקסט', but the record's sources cite the Tax Authority's consolidated PDF (where s.45א(ה) is read here); the sentence is stale. |
| TXP-05 | text_he ends 'הפקודה נקראה בעותק בוויקיטקסט', but the sources cite the Tax Authority's consolidated PDF; stale sentence. |
| TXP-06 | text_he says 'הפקודה נקראה בעותק בוויקיטקסט ואומתה מול המדריך', but the sources cite the Tax Authority's consolidated PDF; stale sentence. |
| TXP-12 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXP-13 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXP-14 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXP-15 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXP-17 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXP-27 | text_he says the Ordinance was read in a Wikisource copy, but the record's sources cite the Tax Authority's consolidated PDF (read here); stale sentence. |
| TXS-07 | The last clause 'והתשקיף מציג את המסלול בשדה מסלול המס' generalises a field label from one company's prospectus (Migdal) to every prospectus; that the prospectus states the track follows from the Ordinance's definitions, the field label do… |
| TXS-08 | The references cite 'Migdal 25.2.2.2' for the REIT finality rule; cite Ordinance s.64א5(א)(4) instead. |
| TXS-09 | text_he's sentence 'התשקיף מתאר את המקרה של תושב ישראל שאינו בעל מניות מהותי...' speaks of 'the prospectus' as if general; it is one company's (Migdal) prospectus and can be dropped or named. |
| TXS-12 | The sentence about the two prospectuses reads as a finding about money-market funds in general ('ואז לא משלמים כלום...'); a count over two funds is not general. |
| TXS-15 | Locator says p.16 (gazette p.1016); the reg. 20(2)(ד) wording is on p.17 (gazette p.1017) of the copy. The record's long quote cannot be matched by script because the copy's text layer is two-column and garbled. |
| TXS-25 | Yelin Lapidot's footnote 3 lists only securities traded abroad and dual-listed securities ('מני"ע הנסחרים בחו"ל ו/או ניירות ערך דואליים'); the third situation (securities of foreign issuers traded only in Israel) is in Migdal's prospectus… |

## 8. Files

- `review.json`: one entry per record: `id`, `scope`, `institutions`, `general_source` (quote, URL, locator, how it was read), `settle`, `split`, `company_doc_needed`, `note`, `text_issue`, `reviewed_by`, `quote_check`.
- `tools/`: `bundle.py` and `ref.py` (the bundles without the editor's scope material), `helper-brief.txt` (what each helper was told), `src.py` (fetch, read and search a source; strike-through and tracked deletions in Word files are dropped), `verify_quotes.py` (the quote check), `cat09_join.py`, `cat24_spread.py`, `cat39_pairs.py` (checks over every row), `g0_verdicts.py` (the reviewer's CAT verdicts), `merge.py`, `compare.py`, `gen_review_md.py`. `tools/work/` holds the bundles, each group's verdict file and `compare.json`.
- The fetched sources are cached in the session scratchpad, not in the repo.
