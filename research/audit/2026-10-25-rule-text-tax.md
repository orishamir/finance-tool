# Rule-text pass, tax files (2026-10-25)

Agent R-text-tax. Scope: the 28 tax rules that the source check (`research/audit/2026-10-25-source-check.md`, sections 6
and 7, and the parts FA-tax1, FA-tax2, FA-tax3, R-taxregs) listed as contradicting their now-official sources. For each
rule the md block in `.claude/skills/il-finance/references/tax-*.md` (Rule / Conditions / Figures, and the Source line
where a new citation was needed) and the record `data/rules/<id>.json` (`text_he`, and `title_he` / `figures` where
they changed) were edited. Every changed rule carries a dated note in its Conditions line ("*2026-10-25 rule-text
pass:*"), and its `checked` is now 2026-10-25. `p.N` is always the PDF file page. Every PDF named below was downloaded
with curl and read with pdftotext; every new quote was confirmed on its page by `research/audit/tools/source-verify.py`.
`sources` was regenerated with `research/audit/tools/extract-locked.sh` (0 skipped entries); `npm run validate` passes,
and `npx vitest run packages/engine` passes (291 tests) with the one revert listed below.

Short names used below:

- **Ordinance**: פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים (gov.il consolidated PDF).
- **Booklet 2026 / 2025 / 2024**: לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה (deductions booklet), gov.il
  `.../monthly-deductions-booklet-2026.pdf`, `-2025.pdf`, `-2024.pdf`. The 2024 and 2025 editions are new to the rule
  base. They open with curl like the 2026 one.
- **Guide 2025**: דע זכויותיך וחובותיך 2025 (gov.il).
- **Freeze law**: חוק ההתייעלות הכלכלית ... (הקפאת עדכוני מס ומס יסף), התשפ"ה-2024, ספר החוקים 3342, p.2, s.1(1), which
  adds s.120ב(ה): no update on 1 January of 2025 to 2027.
- **s.120א-120ב**: Ordinance p.200. s.120א defines the "social reliefs" (amounts in s.9(7א), 9(16א)-(16ב), 17(5א),
  45א, 47, 125ד, among others) and the "income ceilings" (incl. the s.121ב surtax amount). s.120ב(א) updates them each
  1 January by the rise in the CPI.

## The "the law lists" amounts (10 rules)

The yearly amounts these rules gave as "listed by the law" were Wikisource editor notes. Each rule now attributes the
statute's base amount and its indexation to the Ordinance (with s.120א-120ב and the freeze law where the amount is a
social relief or an income ceiling) and the current amount to the Tax Authority booklet.

| Rule | Old | New | Official source |
|---|---|---|---|
| TXH-02 determining salary | "The law text lists 15,400 until 2004; from March 2004, 15,712"; "in force since the early 2000s" (text_he) | The Ordinance names no amount: twice the cost-of-living ceiling "כפי שהוא נקבע מעת לעת בהסכם" between the coordination bureau and the Histadrut. Not CPI-linked (s.3(ה) is not a s.120א amount). The amount (15,712/month, 188,544/year) comes from the booklet. The March 2004 start date was dropped: no official source gives it | Ordinance p.19, s.3(ה); p.200; Booklet 2026 p.12. Figure: `effective_from` 2004-03-01 → null (date came from a Wikisource note), notes rewritten; value unchanged |
| TXH-05 self-employed ceiling | "156,000 in 1995 terms. The law lists 283,905 (2023) and 293,397 for 2024 to 2027" | Base 156,000 in s.17(5א); social relief, CPI-updated, frozen 2025-2027; 293,397 for 2026 (booklet) and 2025 (guide) | Ordinance p.62, p.200; Freeze law p.2; Booklet 2026 p.12; Guide p.92 |
| TXH-08 benefited deposit | "14,140 in 2003 terms. The law lists 19,920, 20,520, 20,566"; open question 3 (mechanism of the 2024→2025 move) | Base 14,140 in s.9(16ב); social relief, frozen 2025-2027. The 2024 and 2025 booklets carry an update dated 30.4.2025 setting the s.9(16א)-(16ב) amount at 20,566 a year, and the 2024 table shows 20,566, so the freeze holds it to 2027. **Closes hishtalmut open question 3.** The Chief Economist's "about 20,538" disagrees; the booklets govern | Ordinance p.44, p.200; Freeze law p.2; Booklet 2024 p.8 item 16, p.11; Booklet 2025 p.7 item 15, p.10; Booklet 2026 p.12 |
| TXG-09 surtax threshold | 721,560 "for 2024 to 2027" (the Wikisource note) | Base 640,000 in s.121ב(א); an income ceiling, CPI-updated, frozen 2025-2027; 721,560 (60,130/month) for 2026 from the booklet | Ordinance p.201, p.200; Freeze law p.2 (already cited); Booklet 2026 p.11 |
| TXP-03 beneficiary member | 2024/2025 values "as the s.47 footnote and the 2025 guide state"; open question 4 | 2026: 13,769 / 26,436 (booklet 2026). 2025: 12,536 / 24,069. In 2025 National Insurance published two average wages; the Tax Authority applied 12,536 to the beneficiary-member test and 13,316 to the employer and severance ceilings. 2024: 12,536 / 24,069. **Closes pension open question 4** | Ordinance p.85, p.20 (s.3(ה3)(2) definition); Booklet 2025 pp.4-5 (chapter א section 5), p.10; Booklet 2024 p.11 |
| TXP-10 employer ceiling | 33,290 (2025), 31,340 (2024), 29,675 (2023) from a Wikisource footnote; terms and rate attributed loosely | 34,423 (2026, booklet); 33,290 (2025, booklet 2025, on the 13,316 benefits wage). The deposit rate, ceiling amount and "salary" are Ordinance s.3(ה3) terms; only the 7.5% is reg. 19 | Ordinance pp.20-21; Booklet 2025 pp.4-5, p.10; reg. 19 (BTL p.7) |
| TXP-11 severance ceiling | "32,000 NIS (2017 base)"; 44,100/41,500/39,300 from Wikisource | 32,000 is the s.3(ה3) definition, adjusted from tax year 2018 each 1 January by the average wage, rounded to 100 (s.3(ה3)(1א)(ג)); the regulations only cap the severance deposit (8 1/3%). 45,600 (2026), 44,100 (2025, booklet 2025) | Ordinance p.20 (s.3(ה3)(1א)(ג)), p.21 (definition); Booklet 2025 p.10 |
| TXP-19 exempt grant | 13,750 "(2024 to 2027; 13,310 in 2023; 3,900 in 1990 base)" | 13,750 for 2026 from the booklet. The consolidated Ordinance still prints the s.9(7א)(א)(2) cap in old currency ("25,000 לירות"); s.9(7א) amounts are social reliefs, CPI-updated, frozen 2025-2027 | Ordinance p.38, p.200; Freeze law p.2; Booklet 2026 p.13 |
| TXP-21 deemed continuity | 405,900 "(2024 to 2027; 392,270 in 2023; 360,000 in 2017 base)" | Base 360,000 in s.9(7א)(ז1); social relief, frozen 2025-2027; 405,900 for 2026 from the booklet | Ordinance p.40, p.200; Freeze law p.2; Booklet 2026 p.13 |
| TXI-20 low-income interest deduction | 69,840 / 10,920 "for 2024-2027 (statutory footnote)" | Base 48,000 and 7,920 in s.125ד(א)-(ב); social reliefs, frozen 2025-2027; 69,840 / 10,920 for 2026 (booklet), 69,840 for 2025 (guide) | Ordinance p.204, p.200; Freeze law p.2; Booklet 2026 p.14; Guide p.43 |

## Quotes and attributions

| Rule | Old → new | Official source |
|---|---|---|
| TXP-01 | Guide quote "...לפי שיעור המס השולי..." → verbatim "...על-פי שיעור המס השולי..."; text_he no longer says the Ordinance was read on Wikisource | Guide 2025 p.62 |
| TXP-02 | "The guide asks for a declaration on form 158 for credits claimed in the return" → the guide asks for certificates of fund payments not on Form 106; form 158 is a declaration only for payments for a child over 18. The 2026-10-23 review annotation on the "higher of" sentence is resolved: s.45א(ד) reads "לא יעלה על הגבוה מבין הסכומים המפורטים להלן". Base values attributed to the Ordinance's text (84,000 in s.47(א)(1), 1,632 in s.45א(ד)), without the "(2004)" date | Guide 2025 p.15 items 22-23 (new citation); Ordinance p.82, p.84 |
| TXP-24 | Fund-type definitions attributed to reg. 1 of the 1964 rules (each pension fund kind is "קופת גמל לקצבה שאינה קופת ביטוח"); text_he no longer says the law was read on Wikisource | BTL 02_0103_100022 p.4; Provident Funds Law (ס"ח 2024) p.3 |
| TXS-05 | Guide quote "אם נוכה המס כחוק" → "אם נוכה מלוא המס כחוק" (md and text_he). "Read on a copying site" → read in National Insurance's consolidated text, which lists amendments up to ק"ת 7907 (27.12.2017); later amendments not checked | Guide 2025 p.48; BTL 02_0103_100228 p.1 |
| TXS-10 | Quote no longer implied to be reg. 10(ב): it is s.125ב1(ב) as amended by Amendment 187 (2011), which replaced "20%" with "25%"; the consolidated Ordinance still prints 20% there; reg. 10(ב) only sets the 25% withholding | Ordinance p.203; ספר החוקים 2324 p.5 item (11); BTL 02_0103_100269 p.3 |
| TXH-15 | Added the application rule of the 25%: the 2012 amendment replaced "20%" with "25%" in reg. 2(ב) from 1.1.2012, for taxable interest arising from payments made to the fund from that date | קובץ התקנות 7080 p.2, ss.1-2 (new citation) |
| TXH-19 | "No primary text says a transfer between study funds is tax-neutral; indirect via the Chief Economist footnote" → reg. 3(ב)(1) of the transfer regulations: the transfer goes to an account in the member's name and "ויראו לעניין דיני המס, את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת". The rule says the regulation keeps payment dates for tax law but does not use the words "withdrawal" or "tax event". Hishtalmut open question 11 closed for payment dates | קובץ התקנות 6657 p.6 (new citation), p.5 (reg. 3(א)(4)) |
| TXK-16 | "An IRA is a provident fund of the type it was approved as (investment, study fund, and so on)" → the 2005 definition names only a fund approved as a benefits fund (קופת גמל לתגמולים) or a study fund, or an insurance plan approved as a benefits fund; Amendment 15 (2016), which created the investment provident fund and added it to s.13(א), did not change the definition. Later amendments to the definition were not traced in an official text | ס"ח 2024 p.2 (s.1), p.21 (s.57); ס"ח 2554 p.2 (Amendment 15, ss.1-2) |
| TXG-17 | Added the amendments: 2024, reg. 3(א) limited to an individual resident in Israel and 3(ג)-(ד) repealed, for new residents and veteran returning residents from 1.1.2026; 2024, micro-business income (`הכנסה מעסק זעיר`) added to reg. 2(א) for reports on 2024 onward; 2025, reserve-duty and maternity pay of a micro-business owner added, for 2025 onward (optionally 2024). Ceilings unchanged (still labelled tax year 2025 in the booklet 2026, p.15) | ק"ת 11460 p.2 (already cited); ק"ת 11554 pp.2-3 and ק"ת 12133 p.2 (new citations) |
| TX2-17 | "The start date of the 18% rate was not read" → 18% from 1.1.2025 (ק"ת 11179 replaced 17%); the rule's "ק"ת תשפ"ד 1840" (a gazette page) → ק"ת 11179. Added: since the 2026 Economic Plan Law, "מוסד כספי" para. (2) ends "ולמעט בנק חברתי", and a social bank counts as a non-profit; no effect on portfolio managers | ק"ת 11179 p.2; ס"ח 3510 p.58 (both already cited) |

## Printed guide pages in the rule text

The source check found these rules naming printed guide pages (now off by two). The pages are gone from the text; the
Source line carries the file page.

| Rule | Change | Official source |
|---|---|---|
| TXS-01 | "S5 p.38 ... S5 p.47 ... 'בשנים שקדמה לה'" → the 12-month test quoted from s.91(ב)(2) ("במועד מכירתו של נייר הערך או במועד כלשהו ב-12 החודשים שקדמו למכירה"); the guide's definition (10% of any means of control, alone or with a relative or another, s.88) and its wording "בעת המכירה או בשנה שקדמה לה" (not "בשנים"). text_he already named no page and was confirmed | Ordinance p.151; Guide 2025 p.40 item 4 (new citation), p.49 |
| TXS-19 | "The guide (p.39) says..." → the guide sentence quoted: "ייתכן מצב שמשלם הריבית (לדוגמה הבנק) עשה את פעולת הקיזוז כבר בשלב ניכוי המס במקור" | Guide 2025 p.41 |
| TXF-02 | "'רווח הון ממכירת ניירות ערך' ... (guide printed p.116)" → verbatim "רווח הון במכירת ניירות ערך", no page | Guide 2025 p.118 |
| TXF-21 | "guide p.3" removed from the Figures; the "read from a low-resolution page image, re-read (Q16)" caveat removed after re-reading the guide's text layer, which matches the rule. The rule now also gives the guide's definition of foreign income and of the advance (vouchers 351 and 352 by 30.4). **Closes foreign open question 16** | Guide 2025 p.5 item 3, pp.118-119 |

## The four specific cases

**TXS-13 (re-based).** The 2025 Migdal sentence ("all our tracking funds, ETFs included, are exempt") is not in the
2026 edition, and no official text says that all tracking funds or ETFs are exempt. The Ordinance gives no status to a
type of fund. A fund is exempt if its fund agreement or prospectus says so "בקביעה שאינה ניתנת לשינוי", or if a taxable
fund notified the Director and paid the s.88א tax; it is taxable if its agreement or prospectus says so (Ordinance p.150,
s.88). The rule now says status is read per fund, in the manager's prospectus table (column "קרן חייבת / פטורה ומאפייני מס
מיוחדים") or in Maya's tax-status field (TXS-24). In Migdal's prospectus of 30.1.2026 every fund in its ETF table is listed
as exempt (file pp.21-23), and its tables show one fund that was taxable until 31.1.2026 and exempt from 1.2.2026 (p.12).
Title changed ("...: tax status is set fund by fund" / "מעמד המס נקבע לכל קרן"). Rule strength institution → primary.
`likely_to_change` no → yes, `recheck_date` 2027-02-15 (after the next main-prospectus edition). The Migdal 2025
citation was removed from the Source line. The figure `rate` (25, value unchanged, not read by the engine) now cites
Ordinance p.151, s.91(ב)(1), like TXS-09, instead of the 2025 prospectus. Open part: none of the other managers' tables
were read; the rule says status must be read per fund.

**TXS-14 (stays open, stated plainly).** What was established:

- The 2003 regulations (קובץ התקנות 6223, pp.9-10) define their fund as an exempt or mixed fund "as defined in s.105יא"
  and were made under s.105יט.
- Amendment 147 (ספר החוקים 2023, 2005, in force 1.1.2006) repealed Part ה3 of the Ordinance, which held both sections
  (p.36, s.36).
- Its transitional section keeps regulations made under s.105יד and s.105טו in force as if made under the new sections
  (p.58, s.80 para. (5)). No such clause for s.105יט was found in its text.
- No amendment or repeal of the 2003 regulations was found: there is no consolidated official text, the Knesset OData
  index does not cover regulations, and a web search turned up none.
- Migdal's 2026 prospectus still applies them (institution).

The rule now says that whether the regulations still operate is open, and why. Separately, **Income Tax circular 7/2003
was found on gov.il** (BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf). Its
section 4.1 (pp.17-18) states the long-deviation rule that TXS-14 had only through the prospectus, so that sub-rule is now
primary, and **securities open question 2 is closed**.

**TXF-04 (copy kept).** One more search for an official copy of the 4.7.2019 letter:

- Wayback CDX over gov.il/BlobFolder, filtered by the letter's date strings: no result.
- The same index filtered for "foreign fund": no result.
- The same index filtered for "kranot hutz": the server timed out.
- A web search for the title found only Leumi, Bank Hapoalim and capitax pages.

None is official. The rule keeps the labelled capitax copy, and its Conditions line now says so. text_he already said so.

**TXH-11 (text moved, figure reverted).** The Chief Economist paper gives the base:

- p.5: the exemption is "בגובה 25% מהרווחים הריאליים", where real gains are nominal gains less the CPI rise (note 7).
- p.20: its simulation taxes at 25% "על כל רווח ריאלי שייווצר על ההפקדות מעל התקרה החדשה".

The rule text (md and text_he) now names the paper as the basis, and two new citations were added (p.5, p.20). Hishtalmut
open question 1 is annotated; the treatment of the linkage part stays open. Moving the figure `real_base` to the paper
failed two tests, so that move was reverted (below).

## Figure change reverted because of a test

- **TXH-11 `real_base`**: moving its source from the Mor/Clal pages (institution, `update_rule` provider-set) to the Chief
  Economist paper (primary) failed `packages/engine/test/golden/golden.test.ts` > "S25 keren hishtalmut, salary above the
  determining-salary cap (own money)" and `packages/engine/test/golden/r2-pension.test.ts` > "S25 employer line": both
  expect `'institution-source'` and got undefined. The figure is back to its HEAD state (value true, institution); the
  text change stays. **For the lead:** decide whether to move the figure and update the golden expectation (the
  institution label would disappear from S25).

No other figure value changed. Non-value figure edits that pass the tests:

- TXH-02 `effective_from` → null.
- TXS-13 `rate` source moved to the Ordinance.

## Open questions closed or annotated

- tax-hishtalmut.md: Q3 closed (booklet update of 30.4.2025). Q11 closed for payment dates (reg. 3(ב)(1)). Q1 annotated
  (Chief Economist paper; figure not moved).
- tax-pension-gemel-lekitzba.md: Q4 closed (booklet 2025, chapter א section 5).
- tax-securities-israeli.md: Q2 closed (circular 7/2003 on gov.il).
- tax-securities-foreign.md: Q16 closed (guide text layer re-read).

## Still open

- TXS-14: whether the 2003 inflationary-amount regulations still operate after Amendment 147.
- TXF-04: no official copy of the 4.7.2019 letter. A request to the Tax Authority is the remaining route.
- TXH-11: how a real-gain base fits s.3(ה4)(1) "linkage income" and the guide's s.9(13) line; and the reverted figure
  move.
- TXK-16: whether an amendment after 2016 changed the IRA definition (no official consolidated text of the Provident
  Funds Law was available).
- TXS-05: amendments to the 2002 withholding regulations after 2017 (open question 3 of the securities file).
- TXH-02: since when the 15,712 has stood (no official source).
- TXG-17: no ceiling labelled tax year 2026 yet (unchanged open question 5).

## For the lead

1. **documents.json titles.** Three new citations are amending booklets that take their base instrument's title in
   `title_he` through the generic token:
   - ק"ת 7080 in TXH-15 shows the 1997 regulations' title;
   - ק"ת 11554 and ק"ת 12133 in TXG-17 show the 1988 regulations' title.

   Rows with longer tokens would fix this, as FA-tax2 already requested for the 2004, 2014 and 2024 booklets. I did not
   edit documents.json.
2. The TXH-11 golden decision above.
3. **Strength label change.** TXS-13 is now primary (was institution). The engine does not read TXS-13; the site's rule
   card will show the new title and strength.
4. **Outside my files.** The Tax Authority's consolidated Ordinance prints s.9(7א)(א)(2) in lirot and s.125ב1(ב) at 20%.
   Other families citing that PDF for amended amounts should check the amending law, as FA-tax3 noted.
5. At verification time the Reshumot file service returned HTTP 500 for the 6657 and 5861 booklets (it served them
   earlier today). The pages were read from the downloaded copies.
6. **Validator warnings from the other agent's work.** Two warnings grew during this pass:
   - "rule strength differs" now also lists ETF-53 and ETF-54;
   - "first source lacks title_he" now also lists ETF-46 to ETF-49.

   None of my 28 records is in either list.

## Counts

- Rules handled: 28 of 28; all 28 have md changes, a dated note and `checked` 2026-10-25; `text_he` rewritten in 25
  (TXS-01, TXF-02, TXF-04 needed md changes only); one `title_he` changed (TXS-13).
- New source citations: 30 in 18 rules; 1 removed (Migdal 2025 in TXS-13).
- Figure values changed: 0. Figure source or metadata edits kept: 2 (TXH-02 `effective_from`, TXS-13 `rate` source).
  Reverted for a test: 1 (TXH-11 `real_base`).
- Open questions closed: 4 in full (hishtalmut Q3, pension Q4, securities Q2, foreign Q16) and 1 in part (hishtalmut
  Q11); 1 annotated (hishtalmut Q1).
- Still open: 7 points (list above).
- Validation: `npm run validate` passes; engine tests 291 passed, 1 todo.
