# Independent check: pension exit (branch rules-pension-exit, 983d7500)

Checked 2026-11-06 by a checker who did none of the work. Scope: the whole commit, meaning PEN OQ24 closed, PEN-61 and PEN-62 added, OQ19, OQ29 and OQ30 narrowed, the PEN-48 note, the terms rows, IRA-02's source, the 20 `data/rules` records and the library index. Quotes were checked with my own script. It reads each stored text page by page and tries the words both in order and reversed. A page whose text layer is scrambled was rendered with pdftoppm and read as an image (Amendment 13 file p.3, draft 2025-26 p.49). The funds' bylaws were re-extracted with `pdftotext -layout`, because the library text is marked "poor".

**Verdict: fail.** There are four must-fix items: a quote that is not in the text, a rule wording that rests on Wikisource while the official text is in the library, a misstated measure in the current regulation, and two records still pointing to the copy. Everything else holds or is a should-fix.

## 1. The gov.il standard bylaw and its hash (holds)

- I downloaded `https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1075/he/regulation_h_2016-3-4-appendixb.pdf` by curl (200, application/pdf, 1,926,991 bytes) and `prisha.co.il/.../hoz201634a.pdf` (same size). I compared both with the library copy `a5996aeee8eaaf2d.pdf`. All three have SHA-256 `a5996aeee8eaaf2df13a1ef88f67767dbbdd704f802a59f0c4f1bcfed5df2a99`, so the claim holds.
- The same gov.il folder serves `regulation_h_2016-3-4.pdf`, the circular's body (4 pp, "חוזר פנסיה 2016-3-4", 29.9.2016). So regulation-1075 is the circular's own folder, as claimed.
- In the pension file, all 24 links to `hoz201634a.pdf` now point to gov.il, and "(third-party host)" went from 28 to 7 (the 7 left are other documents). IRA-02 was patched in the same way.
- New citations to the annex, each found on the stated page:
  - p.26, s.33(א)(4) "מועד קבלת קצבת זקנה בשל חלק או מלוא היתרה הצבורה של העמית בקרן"
  - p.29, s.36(ג)(7) and p.30, s.37(ג)(7) "העמית החל לקבל קצבת נכות מלאה או קצבת זקנה מהקרן"
  - p.16, s.13(ג) "תאשר או תדחה את בקשת ההצטרפות"
  - p.13, s.8(א)(1) "מתוך סך הנכסים העומדים כנגד סך ההתחייבויות למקבלי קצבאות בקרן"
- The 2018 text has no kupat gemel lehashkaa exception: neither "קופת גמל להשקעה" nor "מכספים שהועברו" appears anywhere in the annex.

## 2. PEN-61 (sources hold; two must-fix points on the rule's wording)

Holds:
- Circular גמל 2021-2-1 (5ad102cd1eb25551), p.2, s.14.1: "משיכת כספים בידי עמית ממרכיב התגמולים על דרך של קצבה תיעשה באמצעות העברתם לקרן פנסיה או לקופת ביטוח". The text layer drops נ ("פ סיה"); the wording is right.
- Transfer regulations 2008, ק"ת 6657 (eb40a825ea2b263d):
  - p.4: 2(א)(2) as enacted, "ובלבד שלא יהיה ניתן להוון את הכספים שהועברו אלא בחלוף חמש שנים ממועד ההעברה או בהגיע העמית לגיל הזכאות ... לפי המוקדם מביניהם ושהקופה המקבלת היא קופת גמל משלמת לקצבה"; 2(א)(3); 2(ב), by components "כמשמעותם בסעיף 21 לחוק".
  - p.5: 2(ד)(1) "כשהוא מוכפל במספר החודשים שחלפו ממועד התשלום הראשון לקופה המעבירה", with the reduction for money deposited to the same or another eligible fund.
- 2014 amendment, ק"ת 7407 (c21b108746997b67), p.3, s.2(1): 2(א)(2) replaced by "קופת גמל לתגמולים, ובלבד שהקופה המקבלת היא קופת גמל משלמת לקצבה". So the five-year bar was removed.
- 2023 amendment, ק"ת 10716 (6009ce8fdb6b895d), p.3, s.2: new opening "גוף מנהל של קופה מקבלת לא יהיה רשאי לקבל כספים שלא ניתן להעביר"; new (1א) with the monthly-deposit-ceiling floor. On p.3-4, s.4 says it does not apply to policies issued before the start, and s.3 sets the start date (1.9.2023 through the Income Tax rules amendment, p.2 s.3).
- Amendment 3 (8ce8ba80618daac3, fs.knesset.gov.il), p.2, s.1(4): both definitions, quoted correctly.
- Amendment 13 (2e1ee93cea876711, fs.knesset.gov.il):
  - file p.2, s.1(5): "קופת גמל לחיסכון" defined as quoted.
  - s.1(8): both definitions deleted.
  - s.1(9): the new "קצבה". On file p.3 (gazette p.15, read as an image): "(א) תשלומים מקופת גמל, לפי תקנונה, במשך תקופה מוגדרת; (ב) לאחר שהסתיימה התקופה ... תשלומים ממבטח לפי פוליסת ביטוח שנרכשה בהתאם להוראות סעיף 16(ד)(6) או תשלומים מקופת גמל אחרת ... במשך כל חייו". This holds as recorded.

Must fix:
- **The current wording rests on a copy.** PEN-61 says the current wording "קרן חדשה מקיפה" "was read only in the Wikisource consolidated text". The official text is in the library: ק"ת 10170, התשפ"ב-2022 (library 0ecaf71ddf4f3260, `https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=`). On file p.7, s.2 reads: "בתקנות העיקריות, בכל מקום, במקום "קרן חדשה זכאית" יבוא "קרן חדשה מקיפה"". Its s.4 sets the start as "המועד הקובע כהגדרתו בסעיף 34ב לחוק קופות גמל". Cite it and drop the Wikisource line. The "Likely to change" line lists amendments of 2020 and 2022 without a source. Those are ק"ת 8735 (already cited officially in KGL-09) and ק"ת 10170.
- **The cap is measured from the wrong date.** Since 2023 the months are not counted from "the first payment to the transferring fund". The 2023 amendment (10716, p.3, s.2(2)) replaced the tail of 2(ד)(1): "מועד התשלום הראשון לקופה המעבירה" means "מועד התשלום הראשון לקופה המעבירה שאליה שולמו לראשונה כספים או לקופת גמל שאינה קרן חדשה מקיפה שאליה שולמו לראשונה כספים שהועברו לקופה המעבירה, לפי העניין". The same definition is written into (1א). For money that moved between provident funds before coming here, this counts from an earlier first payment, so the cap is larger than the record says. The document and page are already cited; the rule text has to say it.

Should fix:
- PEN-61 does not mention reg. 2(ד)(2), as amended in 2014 (7407, p.3, s.2(2)). For a member under 60, severance money may move into any annuity fund, a general fund included, only if the employer-and-employee tagmulim conditions were met. Because of this, the inference "a new general pension fund, on which reg. 2(ד) sets no cap" should say "no amount cap" and point to 2(ד)(2).
- The Source line gives page locators only for 2(א)(2) and 2(ד)(1). 2(א)(3) and 2(ב) are on the same p.4 and could be named.

Inferences are labelled: "Inferred, not stated" covers the general-fund route and conversion at the receiving fund's factors (PEN-61), and the OQ19 note calls the commutation reading "a reading of the law ... not a text on moved money". Holds.

## 3. PEN-62 (the count holds; one must-fix quote)

- **Must fix: the rule quotes words that are not in the text.** It says an extension or arrangement ends when "העמית החל לקבל קצבת זקנה מהקרן". The text, on annex p.29 s.36(ג)(7) and p.30 s.37(ג)(7), is "העמית החל לקבל קצבת נכות מלאה או קצבת זקנה מהקרן". The quotation marks hold an edited text. Quote it whole, or drop the quotation marks.
- The count over eight funds holds. Each has the exception at s.33(א)(4), at the "משיכה" of the qualifying-period clause (s.34(ג)), at s.36(ג)(7) and at s.37(ג)(7), on exactly the file pages cited:
  - Altshuler Shaham 814c303258bf78e2: pp.24, 24, 26, 27
  - Clal c6152ef5c5bafb74: pp.30, 30, 32, 33
  - Harel fb44269b3637bd51: pp.36, 36, 38, 40
  - Infinity 57047519d79fd16a: pp.33, 33, 36, 37
  - Meitav b735e00a610e704c: pp.23, 23, 24, 25 (it reads "מקופות גמל להשקעה" at s.33)
  - Migdal 258fe967025224ff: pp.28, 29, 30, 31
  - The Phoenix 83af34a3d14e52a2: pp.35, 36, 38, 39
  - Mor 00495896449d2e21: pp.36, 36, 39, 40
- Harel's qualifying-period clause has no "בלבד" (p.36); confirmed.
- Seven funds define "קופת גמל להשקעה" early in the file: Altshuler Shaham p.7, Clal p.12, Harel p.10, Infinity p.10, Meitav p.7, Migdal p.8, The Phoenix p.9. Mor does not; confirmed.
- Funds and editions: the funds are named. Editions are named only through "as listed in PEN-52 to PEN-60", whose headings carry them, and in the link names; Mor's edition is written out. That is acceptable. Writing the edition next to each link would make the count stand on its own.
- Menora Mivtachim's gap is stated. Its January 2026 copy (354a98fd999476b9) is readable at this point. s.33.1.4 (file p.30), s.36.3.7 (p.32) and s.37.3.7 (p.33) have no exception, and "להשקעה" appears nowhere in the file. Should fix: Menora's s.33.1.4 reads "מועד קבלת קצבת זקנה **לראשונה** בשל חלק או מלוא היתרה". That is Menora's own wording: the insurance age resets only at the first pension. None of the other eight has "לראשונה". Worth a clause beside the gap.
- Should fix: Conditions says "amending circulars 2019-3-2, 2020-3-3 and 2025-3-1 read, none has it". The tried log says that 2017-3-7 and 2021-3-1 were not opened, and the rule should say so too. "The CMA circular that added it was not found" also assumes there is such a circular. Circular 2016-3-4 itself (body, s.3) lets a manager ask the Commissioner to approve a bylaw change under s.17 of the law. Say "whether a CMA circular or approved bylaw changes", and open a question for it (README rule 3), because nothing in the open questions holds it now.
- Scope "general" is correct for a standard-text rule followed by a stated count (README, "The Scope line"). The inference about provident-fund-for-annuity money is labelled.

## 4. OQ29, OQ30 and the PEN-48 note (hold, one wording fix)

- Draft 2025-26 (b6a36b99d6b34f51):
  - p.49, item 2א: "ריבית ברוטו להמחשה של 4.26% בקרן מקיפה ... או שיעור הריבית כפי שייקבע בהוראות הממונה מעת לעת, והכל בניכוי דמי ניהול בשיעור המירבי".
  - p.133: the same.
  - pp.15 and 18: "ריבית ברוטו להמחשה בשיעור של 4%".
  - I rendered p.49 and the 4.26% line carries no edit mark. Holds.
- Circular 2022-9-20 (9bb074c6f11bae95), pp.1-2, ss.3-6: it amends gate 5's measurement chapter and the public financial and actuarial reports (5.4.1.16, .20 to .23), from Q2 2022, and not the members' report. 4.38% is on p.7. Holds.
- Should fix: OQ29's "Read: the circular's text names 4.26%" (in OQ29 and in the PEN-50 note) is ambiguous. The sentence before it is about 2022-9-20, which names 4.26% too (p.7, for pensioners before 2023). Name the document: "the members'-report text in draft 2025-26".
- Codex 6.6 (98bf35a74f90c52c), pp.2-3: the definition "שיעור דמי ניהול מרבי" runs across the page break, "... רשאית לגבות מתוך סך כל הנכסים | העומדים כנגד התחייבויות הקרן לכלל מקבלי הקצבה לפי תקנות דמי ניהול". Holds.
- Fee regulation amendment, ק"ת 9942 (edb3ebce2872cf5c), p.2: reg. 2(א)(4) caps an insurer's fee per annuitant ("התחייבויות הקופה למקבל קצבת זקנה"). Reg. 3(א)(1א) caps a pension fund's fee on the pool ("לכלל מקבלי קצבת הזקנה שהחלו לקבל קצבת זקנה ביום ... 1 בפברואר 2022 או לאחריו"). Holds.
- The actuarial-balancing inference is labelled "Inferred, not stated ... no text read says this". Holds.

## 5. Official publication or copy

All cited sources are official:
- gov.il: the annex, circular גמל 2021-2-1, Codex 6.6, circular 2022-9-20 and draft 2025-26
- Reshumot, through the Ministry of Justice's free-justice API: 6657, 7407, 10716 and 9942
- the Knesset: Amendments 3 and 13
- the funds' own sites, for their own bylaws (institution)

Copies:
- The Wikisource consolidated transfer regulations (320f2f664a53cf18). The rule is not cited from it, but the current wording rests on it (must fix 2 above).
- Menora's January 2026 copy with no recorded link. This is earlier work, already open question 27.
- The OQ19 note mentions a blog citing a 2015 draft only as a search result.

## 6. The 20 data/rules records

I compared each record field by field, before and after, with a script. No field outside `sources` changed in any record. In `sources`, the only entries that changed are those whose URL was the prisha annex:
- one in each of 17 records
- two in pen-12 and pen-29 (two locators)
- three in pen-16

In each changed entry, exactly these keys changed: url, title, title_he (added), publisher, publisher_he, strength (primary-mirror to primary), mirror_host and qualifier (removed). Locators, pages, quotes and checked dates were kept. Holds.

Must fix:
- **pen-16 and pen-40 still cite the copy.** pen-16 `figures.insurance_extension_months.source` and pen-40 `figures.orphan_share_each_standard_text.source` still give `hoz201634a.pdf` on prisha, titled "copy on prisha.co.il". These are the same records the commit says it patched.

Should fix (the lead's files):
- 18 `data/terms/*.json` records cite the prisha annex: mvtb, mslvl-bytvch, arkt-bytvch, mkdm-hmrh, chytvm-rpvay, tkvpt-tshlvmym-mvbtchym, ayzvn-aktvary, hsdr-bytvch, amyt-la-mbvtch, amyt-payl, tkrt-hpkdh-chvdshyt, dmy-bytvch, ktzbt-nkvt, ktzbt-shayrym, tkvpt-akshrh, shkr-kvba, shkr-mbvtch, ktzbt-zknh.
- `docs/glossary.md` has 18 citations of `hoz201634a`.
- `coverage.md` lines 80 and 119 still say the standard bylaw is read "from a copy".
- Same class, earlier work: PEN-11 cites circular 2017-3-7 on prisha, and PEN-18 cites 2022-3-3 on prisha. The gov.il folder pattern found here may reach them too.

Notes:
- The new source's `publisher_he` is "אתר הממשלה (gov.il)", the gov.il default in `data/sources/publishers.json`. 116 other CMA circulars on gov.il use "רשות שוק ההון, ביטוח וחיסכון".
- The checked dates kept the dates the copy was read, which is fair since the bytes are identical.

## 7. OQ24's closed text

Should fix: the struck item keeps the old open text after "Closed 2026-11-06", without a marker: "PEN-09 ... quote circular 2016-3-4's annex from prisha.co.il, a copy. Tried 2026-11-06: ... ten annex file names answered 404. Would settle: the annex's gov.il file ...". This now contradicts the closure. Mark it as the earlier question or remove it.

## 8. IDs, merge, open questions, tests

- PEN-61 and PEN-62 appear on no other local branch, no origin branch and no other worktree's uncommitted files. Every other branch ends at PEN-60.
- Trial merge with origin/main (3295ebb7), using `git merge-tree`: there is one conflict, in `research/library/tried.jsonl`. Both sides appended four lines after line 231. Resolve by keeping both blocks. `index.jsonl` merged cleanly.
- `npm run gen:open-questions -w @finance-tool/pipeline`: 551 questions (285 open, 121 narrowed, 145 closed). The only change is PEN OQ24 open to closed (2026-11-06), committed with this report. Should fix (the lead): PEN OQ19, OQ29 and OQ30 are narrowed in the markdown but stay "open" in `data/open-questions.json`, because the generator keeps the stored status (script header). Set them to "narrowed" by hand.
- `npm run validate`: "data/ is valid". The warnings are the usual classes; none is new from this commit as far as the truncated lists show.
- `npx vitest run packages/pipeline --testTimeout=180000`: 8 files, 171 tests passed. The open-question count test passed too.
