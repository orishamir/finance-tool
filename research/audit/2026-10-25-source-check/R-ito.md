# R-ito: official-text map for the Income Tax Ordinance (2026-10-25)

Map: `research/audit/2026-10-25-source-check/maps/ito.json` (135 entries, one per cited subsection or definition).
I edited no rule-base or data file. Family agents apply the map.

## Method

1. Collected every Ordinance citation: the three Ordinance groups in `copy-groups.txt` (Hebrew Wikisource page, 112
   citations; Nevo 255_001, 5; Nevo 255_001b, 2) plus the link-less "Ordinance s.X, Wikisource/Nevo" mentions in the
   Source lines of `tax-*.md`, `keren-hishtalmut.md` and `tax-insurance-and-amendment-190.md` (KH-01, KH-12, TXA-02,
   TXA-05, TXA-17, TXA-26, TXH-11, TXH-13, TXH-23, TXP-02, TXP-10, TXP-12, TXP-17). Rules whose Ordinance link had no
   section (SW-21, TXG-13, TXK-23, TXS-22, TXK-09, TXK-17, TXI-16, KH-01) were read in the rule block to find the
   section they rest on. Result: 91 rules and 33 figure sources, deduplicated to 135 subsections / definitions.
2. Official text: the Tax Authority's consolidated PDF (312 file pages, Amendment 262, published 15.01.2023),
   downloaded with curl and read with `pdfpages.py`. For every subsection the current Wikisource wikitext (raw) was
   parsed into section / subsection lines with their amendment lists; each line's text was matched against the 312
   pages by 8-character shingles to find the FILE page, and a verbatim span of that page's normalized pdftotext
   (whitespace collapsed, bidi marks and nikud removed, quote marks unified; the RTL punctuation order is as pdftotext
   gives it) is the `quote`. Pages of 15 entries with a match share below 0.85 were checked by eye: all are page
   breaks or Wikisource editorial notes with indexed amounts inside the line, not text differences.
3. Currency: a subsection counts as changed after Amendment 262 when its Wikisource amendment list carries a year
   code תשפ״ג or later, or its text matched the consolidated page below 0.9 for a reason other than an editorial
   note. Six sections were flagged (9(2), 9א, 62א, 120ב, 121, 121ב). For each I identified the amending law in
   `ito-amendments.json`, downloaded the published gazette PDF ("חוק - פרסום ברשומות" link on fs.knesset.gov.il; the
   first `docs` link in that file is the BILL with explanatory notes, not the law) and located the amending section
   on its file page. Wikisource's header lists gazette entries up to ס"ח 3531 (June 2026) and ק"ת תשפ"ו, so it is a
   current pointer.
4. Annually indexed amounts (ceilings, brackets, floors) were only located, never verified.

## Counts

- 135 subsections / definitions mapped; status `official` for all, `copy-kept` for none.
- 127 rest on the consolidated PDF alone (text unchanged since Amendment 262 as far as Wikisource shows).
- 7 have the consolidated page plus a gazette page for a later change: 9(2)(א) and the 9(2)(ב) definitions
  (ס"ח 3511, Amendment 287 by the margin title, file page 3: new definition "החזקה מהותית", change to "שליטה"),
  9א(ב) and 9א(ז) (Amendment 275, ס"ח 3336, file page 2: "עד 2027" and the 57% / 57.5% / 62.5% shares),
  62א(א) (Amendment 277, ס"ח 3343, file pages 2-8: section rewritten), 121(ב)(1) (Amendment 288, ס"ח 3511, file
  page 4: bracket amounts), 121ב(א) (Amendment 276, ס"ח 3342, file page 2: words deleted, new (א1) with the 2% on
  capital-source income).
- 1 exists only in the gazette: 120ב(ה), the 2025-2027 freeze (Amendment 276, ס"ח 3342, file page 2); the
  consolidated PDF has 120ב(א)-(ד) only (pp.200-201).
- Consolidated file pages used: 12, 16, 17, 19-23, 27, 31-33, 38-41, 43-45, 49-51, 62, 81, 82, 84-86, 92, 118, 119,
  122, 123, 125, 145, 146, 148-152, 155, 161, 167, 200, 201, 203, 204, 208, 209, 256-259, 268.

Citation forms for family agents (the consolidated URL with `%5B`/`%5D`; `p.N` is the FILE page):

- `[פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.43, s.9(16א)(א) · checked 2026-10-25 · primary`
- `[חוק לתיקון פקודת מס הכנסה (מס' 275), התשפ"ה-2024, ספר החוקים 3336](https://fs.knesset.gov.il/25/law/25_lsr_5336499.pdf), p.2, s.1 · checked 2026-10-25 · primary`
- `[חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנת התקציב 2025) (הקפאת עדכוני מס ומס יסף), התשפ"ה-2024, ספר החוקים 3342](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf), p.2, s.1 · checked 2026-10-25 · primary`
- `[חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנת 2025) (מיסוי רווחים לא מחולקים), התשפ"ה-2024, ספר החוקים 3343](https://fs.knesset.gov.il/25/law/25_lsr_12992539.pdf), p.2, s.1 · checked 2026-10-25 · primary`
- `[חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי התקציב לשנת התקציב 2026), התשפ"ו-2026, ספר החוקים 3511](https://fs.knesset.gov.il/25/law/25_lsr_12846863.pdf), p.4, s.5 · checked 2026-10-25 · primary`

The gazette quotes in the map are the law's words with the RTL punctuation order restored (pdftotext scrambles
brackets and digits); `verify_quotes.py` compares letters and digits only, so both forms verify.

## Subsections left without an official text

None. Two things to know:

- 9(16ג) (cited by TXH-23 as the 2020 relief) reads "(פקעה)" (expired) in both the consolidated PDF (p.44) and
  Wikisource. The wording of the relief itself exists only in the amending law (Amendment 253, a temporary provision
  of 2020, not downloaded: TXH-23 only says the relief is no longer in force, which the "(פקעה)" line shows).
- 9א(ח) ("לעניין סעיף זה, יראו כתשלומים פטורים כספים שהועברו לחשבון חדש...") appears on Wikisource but not in the
  consolidated PDF and not in the 2024-2026 gazette laws I downloaded. No rule cites it, so I did not trace it.

## Wikisource-page citations that are not Ordinance pages

TXK-01, TXK-03, TXK-04, TXK-05, TXK-06, TXK-07, TXK-09, TXK-17, TXK-18, TXK-25 cite "PDF p.N" of the Wikisource
rendered PDF (pp.8, 14-15, 20, 25, 47, 49, 131). The matching consolidated FILE pages are in the map: 3(ה4)(3) p.21;
9(2) pp.32-33; 9(13) p.41; 9א(א) pp.49-50 and 9א(ב1) p.50; 45א(ב) p.81; 47(ב) p.85; 125ג pp.203-204.

## Where the rule description does not match the official text (nothing changed; for the lead)

1. TXH-23 cites "Ordinance s.9(16C), s.124C-125". 124ג is the tax rate on a transfer to a member's former spouse
   (p.203) and 125 the rate on a patent sale; neither concerns study funds. Probably a wrong reference; 9(16ג)
   "(פקעה)" is the only Ordinance text that supports the rule.
2. "The law lists ..." figures are Wikisource editor notes, not statute. TXH-02 ("law-text list: 15,400 until 2004;
   15,712 from March 2004"), TXH-05 ("the law lists 283,905 (2023) and 293,397 for 2024 to 2027"), TXH-08 ("the law
   lists 19,920 (2023), 20,520 (2024) and 20,566"), TXG-09 ("editorial note 'בשנים 2024–2027, 721,560 ש״ח'"), TXP-10,
   TXP-11, TXP-19, TXP-21, TXI-20 ("statutory footnote") all lean on bracketed notes that Wikisource volunteers add
   beside the base amounts. The Ordinance text (consolidated PDF) carries only the base amounts: s.3(ה) p.19 has no
   15,712; s.17(5א) p.62 has "156,000 שקלים חדשים"; s.9(16ב) p.44 has "14,140 שקלים חדשים"; s.121ב(א) p.201 has
   "640,000"; s.125ד p.204 has "48,000" and "7,920". The yearly figures should rest on the Tax Authority booklets
   already cited, and the rule wording "the law lists" should not survive the rewrite.
3. TXP-27 quotes s.120ב(ה) "ב־1 בינואר של שנות המס 2025 עד 2027 לא יתואמו הסכומים". Correct text, but it is
   Amendment 276 (ס"ח 3342 p.2); the consolidated PDF has no 120ב(ה). The citation must go to the gazette.
4. TXP-14 figures `exempt_share.by_tax_year.2026/2027` rest on 9א(ז)(5)-(6) as inserted by Amendment 275 (gazette
   p.2). The 2028 figure (67%) rests on 9א(ב) itself (consolidated p.50), which (ז) no longer overrides from 2028:
   the record's source should say so rather than "s.9A(b), (g) as amended by Amendment 275" for 2028.
5. TXG-09 cites s.121ב(א) for the 3% surtax. Current (א) differs slightly from the consolidated p.201 (the words
   "(בסעיף זה – הכנסה החייבת במס נוסף)" were deleted) and (א1) adds 2% on capital-source income from 2025 (Amendment
   276). The rule's 3% base is still right; TXF-02's "3% + 2% surtax" is the (א1) rule and has no Ordinance citation
   of its own.
6. TXP-13 describes the "החזקה מהותית" limb of 9(2) by reference to the Economic Efficiency Law; that definition is
   the 2026 wording (ס"ח 3511 p.3), absent from the consolidated PDF. Cite the gazette for it.
7. TXF-11 cites s.62א among the provisions it searched; 62א was rewritten by Amendment 277 (ס"ח 3343, 31.12.2024).
   The rule's conclusion (no deemed-distribution rule for a non-controlling fund holder) is not affected by what I
   read, but the consolidated page is not the current text of 62א.
8. 88א: the consolidated PDF reads "הגיש מנהל קרן נאמנות הודעה למנהל" where Wikisource reads "הגיש מנהל קרן נאמנות
   חייבת הודעה"; the heading says "קרן נאמנות חייבת". TXS-07's description is unaffected.
9. 9א(א)(4) is misprinted in the consolidated PDF as "לקופת גמל לשקעה" (p.49). TXK-01's quote "תשלומים פטורים" is
   fine; a quote of paragraph (4) should not be taken from that page verbatim.

All other descriptions I read (3(ה), 3(ה3), 3(ה4), 3(ח), 9(7א), 9(13), 9(16א)-(16ב), 9(18), 9א definitions and
(ב)-(ו), 17(5א), 45א, 47, 75ב, 87, 88 definitions, 91, 92, 97(א)(7), 101א(א)(12), 125ב, 125ב1, 125ג, 125ד, 129ג,
199-240א) agree with the consolidated text on the mapped pages.

## Not done

- No data or rule file was changed (not my scope).
- Figures were not verified against any source.
- Amendment 253 (2020 relief) and the amendment that added 9א(ח) were not located (not needed by any cited rule).
