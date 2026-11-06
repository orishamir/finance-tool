# Independent check: pension factors and insurance cost (branch pension-factors, a0e1bcb8)

Checked 2026-11-06 by a checker who did none of the work. Scope: PEN-48 to PEN-60, the changes to PEN-15, PEN-20, PEN-27, the glossary rows, PEN OQ7, OQ19, OQ24 to OQ29, and PF-38 in `provident-family-common.md`. Every page below was read on the rendered page (pdftoppm) or from the text layer with a separate script of mine that maps each row to its header year, not the branch's `tools/row.py`.

**Verdict: fail.** One must-fix fact (PF-38) and the stale test count; the rest holds, with the fixes to read-versus-inferred listed under "Should fix".

## 1. PEN-48: how factors are set (holds)

- Codex pension part (library 98bf35a74f90c52c, the gov.il file codex6.6_clean_new.pdf), rendered p.10, s.(ד)(2)(א)-(ג): matches the record word for word in substance. That includes the inputs to the factor (age at start, sex, birth year, spouse's age, guaranteed period, survivors' rate), the discount rate less the lower of the maximum fee or the bylaws' maximum, and updating when the rate, the assumptions or the Commissioner's directions change.
- Consolidated circular gate 5 part 2 ch.1 sign ג', edition 9 (library 4ecbcad519653fb4, byte-identical to the worktree download), rendered file p.19: the definition "ריבית שנתית להיוון" reads (א) for a comprehensive fund 4.38%, "או בשיעור אחר כפי שיקבע הממונה מזמן לזמן", and 4.26% for a pensioner paid for a qualifying event before 1 January 2023; (ב) for a general fund 4%. Footnote 68 says the definition was updated by circular 2022-9-20, from the Q2 2022 statements. File p.20, s.1.2.1(א)-(ג): default assumptions; others only after testing, a reasoned written request with the appointed actuary's statement, and prior written approval; from January 2019 every assumption is re-tested once in three years. All as recorded.
- Problems inside PEN-48 (should fix):
  - "so the factors the nine funds print are stated at 0.3% (PEN-50)": the cross-reference should be PEN-51. The sentence is also flatter than PEN-51 and PEN-55, which say eight funds state 0.3% and Infinity's annex is ambiguous (Clal states it only through annex ו').
  - "a pensioner charged a different fee has the factor adjusted" has no source. The Codex text on p.10 does not say it. The funds' fee-sensitivity annexes (Harel p.138, Meitav טז', Clal ו', Menora, Migdal, Infinity ה'9) are each fund's own term. Either cite a regulator text or mark it as read in the funds' annexes and not stated as a general rule.

## 2. PEN-50: the statement's expected pension (holds)

Circular 2020-9-22 (library 9f11b17b8c8dd40e), rendered p.47, chapter א "תשלומים צפויים מקרן הפנסיה", item 2:
- (א) "ריבית ברוטו להמחשה של 4.26% בקרן מקיפה ... 4% בקרן כללית, או שיעור הריבית כפי שייקבע בהוראות הממונה מעת לעת, והכל בניכוי דמי ניהול בשיעור המירבי"
- (ב) no further deposits
- (ג) CPI 0%
- (ד) the start age follows the insurance track
- (ה) the bylaws' factor at a 60% widow's pension and the bylaws' age gap
- (ו) the note on the net rate

p.124 repeats it for the detailed report. p.44 shows the layout, with the column "סכום בש"ח". All as recorded. The 4.26%-versus-4.38% gap is honestly left open (OQ29).

## 3. PF-38: insurance cost on the pension statement (must fix)

What holds:
- p.48 item 9: the line "עלות ביטוח ____" is the premium paid for each cover, one line per cover, and the disability line includes the disabled member's survivors cover and the release from deposits.
- p.127 items 11-12: the detailed report's "עלות הביטוח לסיכוני נכות" and "עלות הביטוח לשארים" are premiums, in shekels.
- p.76 item 9 (the life-insurance report) and p.103 item 3 (the provident-account report) carry the percent-of-deposits line.
- Circular 2023-9-6, p.1, reg. 3ב(א) "בשל דמי ניהול והוצאות ישירות". Its s.2 definition on pp.1-2 lists the components: fees from the balance, fees from deposits, and direct expenses. No insurance; citing s.2 as well would make "not insurance" a direct read.
- p.44, "הנתונים הכספיים המוצגים בדוח מעוגלים לשקל הקרוב": the figures are rounded to the shekel. The word "nominal" is not on p.44; it appears on other pages of the circular. Cite the page, or drop the word.

**What is wrong:** "The line 'אחוז מסך כל ההפקדות ששולם בשנת הדוח עבור רכישת כיסוי ביטוחי' is required only in the reports of insurance policies (p.76, item 9) and of provident accounts with cover (p.103, item 3), not in the pension fund's."

- The same circular's template for the **detailed annual report of a new pension fund**, rendered p.116, table א.3 "תשלומים הצפויים לעמית או לשאירים בקרן", ends with the row "אחוז מסך כל ההפקדות ששולם בשנת הדוח עבור רכישת כיסוי ביטוחי".
- The item-by-item instructions for that table (pp.124-125, items 1-12) give that row no item of its own.
- The draft amendment 2025-26 (library b6a36b99d6b34f51) keeps the row in the pension detailed report (p.123).
- So the correct statement is roughly this. The shortened pension report prints insurance cost in shekels only (p.44, p.48 item 9). The detailed pension report prints the premiums in shekels (p.127 items 11-12), and its table א.3 template (p.116) also carries the percent-of-deposits row, with no instruction item for it (pp.124-125).
- Issue #65 and anything built on "a pension statement shows no percentage" should be re-read with this.

## 4. Per-fund factors and death-risk rates (hold; all nine checked, not only four)

All nine funds' cells were read from the worktree downloads. Their byte sizes equal the library copies; Clal's and Migdal's sizes also equal the live files at the cited links. Each sex was confirmed from the table heading.

| Fund | Single, man 67 born 1960 | Married 60%, wife 3 years younger | Death rate, man 40 born 1985 | Pages |
|---|---|---|---|---|
| Mor | 167.48 | 188.82 | 1.87 | 102, 103, 97 (ז1 "גברים") |
| Altshuler Shaham | 167.48 | 188.82 | 1.87 | 110, 112, 98 |
| Meitav | 167.48 | 188.82 | 1.87 | 107, 109, 81 |
| Infinity | 167.56 | 188.59 | 1.825 | 100, 99, 89 |
| Clal | 167.63 | 188.88 | 1.81 | 105, 96, 86 |
| Harel | 167.24 | 188.58 | 1.8599 | 145, 139, 129 |
| Menora Mivtachim (copy) | 167.43 | 188.73 | 1.8599 | 99, 94, 92 |
| Migdal (Dec. 1959 / Dec. 1984) | 167.19 | 188.51 | 1.8952 | 99, 93, 87 |
| The Phoenix | 167.21 | 188.53 | 1.86 | 131, 132, 124 |

- Ranges 167.19 to 167.63, 188.51 to 188.88 and 1.81 to 1.90 (rounded) are right. NIS 1,000,000 divided by them gives 5,965 to 5,981 and 5,294 to 5,305, so "about 5,970" and "about 5,300" hold.
- Harel's example on p.138: 1,250,000 / (188.58 x 97.8%) = 6,777.59. Exact.
- Harel and Menora both print 1.8599 at age 40 / 1985, but differ at other cells (2005: 1.3302 and 1.3300), so it is not a copied table.
- Infinity p.107 (ה'9) does say 0.5% while its sensitivity table zeroes at 0.30%, and the ה'1 and ה'2 pages state no fee, rate or gap, as recorded.
- The Phoenix p.147 prints 4.38% gross and 4.07% net of a 0.3% fee (and 3.86% net of 0.5% for guaranteed periods), as recorded.
- Clal annex ו' p.94: a man's factor is 3.27% lower at a 0% fee, as recorded.

## 5. Sources, scope and companies

- Every general claim (PEN-48, PEN-49, PEN-50, PF-38) rests on the regulator's own gov.il texts: the Codex, the consolidated circular, and circulars 2020-9-22, 2023-9-6 and 2025-3-1. The June 2024 draft is cited as a draft only.
- The funds' bylaws are cited for each fund's own term (PEN-52 to PEN-60, scope "institution: ...").
- PEN-51 is a count over every manager of new funds in Pension-Net 202609. The worktree's `pnet-202609.json` lists exactly nine managers under "קרנות חדשות". That fits D30.
- PEN-20's old Mor citation for 4.38% is now explained as the general rate.
- No excluded company appears. The nine managers' legal ids (513621110, 513173393, 513026484, 512267592, 512244146, 512237744, 514956465, 512065202, 512245812) are not in `EXCLUDED_COMPANIES`, and no excluded company name or id appears anywhere in the diff.
- Nothing reads as filled in from memory. Every figure checked traces to a page that says it.

## Must fix

1. **PF-38**: the claim that the percent-of-deposits line is not in the pension fund's report is wrong. Circular 2020-9-22 p.116 (the detailed pension report's table א.3) has the row, without an instruction item on pp.124-125. Restate as in section 3.
2. **`packages/pipeline/test/validate.test.ts:435`** expects 535 open questions; the branch has 541 (the six PEN OQ24 to OQ29). Main has meanwhile moved to 541 on its own, so after merging the count will be 547, with the comment line for PEN OQ24 to OQ29 added. `npm run check` fails until then. Reported, not fixed, as asked.

## Should fix

1. **PEN-48**:
   - The cross-reference "(PEN-50)" should be PEN-51.
   - "the factors the nine funds print are stated at 0.3%" conflicts with PEN-51 and PEN-55 (eight state it; Infinity is ambiguous).
   - "a pensioner charged a different fee has the factor adjusted" has no regulator source: source it or mark it as read in the funds' annexes.
2. **PEN-51**: tell read from inferred.
   - "Monthly" is stated only by Harel and Migdal.
   - "Per NIS 100,000 at risk" is stated by Mor, Clal, Meitav, Harel, Migdal and Menora.
   - Infinity says "לכל 100,000 ש"ח סכום ביטוח" (sum insured).
   - Altshuler Shaham and The Phoenix state no unit, as their own records say.
   - Infinity's married figure is counted as "60%, wife 3 years younger", though its ה'1 page states neither (PEN-55). Say it is assumed. The range holds either way.
3. **PEN-51 and PEN-58**: PEN-58 says Menora's record "is shown nowhere" until its link is recorded, yet the "nine funds" count rests on that unlinked copy. Say that the ranges are the same without Menora (they are: its figures lie inside the other eight's), or count "eight with links, plus one copy".
4. **PEN-20**: the Figures line still reads "4.38% gross a year in Mor's bylaws of 01.06.2025", with a dated note after it, and Conditions and Source still give Mor as the source of 4.38%. A reversal carries its cleanup: restate the figure as the consolidated circular's rate (PEN-48) and keep Mor only as an example of a fund printing it.
5. **Glossary row "תשואה ריאלית אפקטיבית"**: "the funds' bylaws define it so (s.110-111)" mixes Mor's s.110 with the standard text's s.111, and cites company bylaws for a general term. Cite the standard bylaw and the consolidated circular (PEN-48).
6. **PEN-55**: the Infinity file is titled May 2025, but its p.1 reads "מהדורת 1.6.2025". Name the edition by its own date. That also shows it postdates the 1.6.2025 change that circular 2025-3-1 follows.
7. **Library**: the June 2024 draft (e960cfe40a339f33) is cited by its gov.il link in PEN-49, but its index entry has no url, publisher or title, unlike the other entries this branch filled in.
8. **`tools/get.sh`** sends a Chrome User-Agent string. It flags bot checks rather than passing them, and Menora's captcha was not passed, so no rule was broken. Still, a plain identifying agent would keep clear of "disguised" in the bot-check rule.
