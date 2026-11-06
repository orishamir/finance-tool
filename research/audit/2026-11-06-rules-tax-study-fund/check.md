# Independent check: rules-tax-study-fund, commit c22cf66e

Checked 2026-11-06 in worktree `.claude/worktrees/tax-kh`, against the library
store copies (page = the library's page, one form feed per page; PDF pages
confirmed with `pdftotext -f N -l N` where a page number was in doubt).

**Verdict: fail**, on two items: one wrong page, and one reading stated as a
rule that the law's text does not force and a secondary source contradicts.
Everything else holds.

## 1. Quotes and section numbers

| Rule / record | Citation | Result |
|---|---|---|
| TXH-25 | ק"ת 6984 (7932a385b7fb91c8) p.2 = print p.748: definitions in reg. 1, reg. 2(א) "מכל אחד ממרכיבי חשבון קרן ההשתלמות, לפי סדר זה" and items (1)-(3), reg. 2(ב) (quoted with ellipses, the words match), reg. 3 "90 ימים מיום פרסומן" | match |
| TXH-25 | Same page: rule 41יג(ב)(2) "בטלה" (Income Tax Rules amendment, reg. 1) | match. Its own reg. 2 (p.3) also starts 90 days after publication, so the repeal and the new order start on the same day; nothing to fix |
| TXH-25 | 12.6.2011 = 14.3.2011 + 90 days, marked computed | correct |
| TXH-25 | ק"ת 6230 (b13149df6eb90be1) p.6 = print p.577, reg. 10: (ב)(2), for payments outside s.87, pro rata in the order (1)(ג), (1)(ב), (1)(א) = pre-cut-off, benefited, taxable | match; date 9.3.2003 (ה' באדר ב' התשס"ג) correct |
| TXH-25 | ק"ת 6377 (9798d4a7b788ce3b) p.5 = print p.565, reg. 15: (1) "לפי סדר זה" struck; (2) "באופן יחסי" struck, order pre-cut-off, taxable, benefited | match; 17.3.2005 correct (ו' באדר ב' התשס"ה) |
| TXH-25 | 1964 Rules, NII copy (c1a910e7108c3769) p.16, rule 41יג(ב)(1); p.17 shows (ב)(2) "(בוטלה)" | match |
| TXH-25 | Same file p.21, rule 49א(ב)(1)(ב)(3) "בהתאם ליחס שבין תשלומי המעביד לתשלומי העובד" | match |
| TXH-25 | Ordinance, NII copy (6deb4dc4ee99460c) p.87, s.87(א)(2) | match |
| TXH-01, TXH-03, TXG-35, TXH-26, records | NII circular 1473 (6d37a3f2b7b08e2a) p.3 row 5: "פטורה - ובלבד שהיא לא מעל לתקרה הקבועה בפקודת מס הכנסה", "הפרשות המעסיק מעבר לתקרה-חייבות בזקיפת שווי"; date 21/2/2019, in force 1/1/2019 (p.1) | match |
| TXH-26 | Same circular p.2, reg. 2 of the 1995 regulations | match, but the circular reports it ("נקבע, כי לא ישולמו ...") rather than quoting it; see shouldFix 2 |
| TXH-26 | NII page (bd857000c29d3387): "הן אותן ההכנסות שחייבות במס הכנסה על פי סעיף 2(2)" | match |
| TXH-26 | NI Law, NII copy (c6681353c3ff86ab), s.344(א) cited at `#page=240` | **wrong page**: s.344 "חישוב הכנסתו החודשית של עובד" and its (א) are on p.239; p.240 starts at s.344(ב) and holds s.344א (renewed kibbutz). The library cite on p.240 ("מהמקורות המפורטים בסעיף") matched s.344א's own words, not s.344(א) |
| TXH-26 | s.345(ב)(1) p.241 | match |
| TXH-26 | s.350(א)(6) p.246 | match |

Records: the three `quote` fields (txh-01, txh-03, txg-35) are on p.3 as
written.

## 2. The official text of ק"ת 6984

Not found. Searched:

- Knesset OData v4, `KNS_SecondaryLaw`: the regulations are listed (Id 2136214,
  magazine 6984, page 748, published 14.3.2011, "פורסם ברשומות"), with the
  Income Tax Rules amendment beside them on the same page (Id 2136215).
  `KNS_DocumentSecondaryLaw` has no document for them, and `KNS_SecToSecBinding`
  has no amending binding. That confirms the citation, page and date from an
  official source, and no amendment known to the Knesset, but not the words.
- free-justice.openapi.gov.il: the root and the SearchPredefinedApi path answer
  500; there is no search that answers, only document ids found elsewhere.
- gov.il Reshumot collectors: 403 to curl (bot check).
- Web searches on the title and the gazette number: fund and adviser pages only.

The olaw.org.il file is a scan of the print (the Reshumot masthead, booklet
number, date and page 748 match the Knesset record). Logged in `tried.jsonl`.
Next step: the gov.il Reshumot search in the founder's Chrome, which curl cannot
reach.

## 3. Inferences labelled

- The default order "makes members withdraw taxed gains first" (TXH-25): labelled
  as inference. But it says more than it can: the taxable part holds
  already-taxed deposits as well as gains, and how a withdrawal from that part
  splits between them is OQ15. See shouldFix 1.
- The month of the National Insurance charge (TXH-26): labelled.
- Exempt withdrawal not charged (TXH-26): labelled, and the 1995 regulation is
  marked as read only through the circular.
- s.125ג(ב) gains outside the base: "read from the two texts together", which
  marks it as a reading.
- **Not labelled:** the s.345(ב)(1) reading (item 4) is stated as a rule in
  TXH-26's Rule line, in OQ4's update and in the commit message.

## 4. s.345(ב)(1) and the self-employed s.17(5א) deduction

The law's text does not force the reading.

- s.345(ב)(1) (p.241) takes the assessed income "לפני כל פטור, ניכויים וזיכויים
  לפי פקודת מס הכנסה", less s.47א and s.47(ב)(1) amounts. s.17(5א) is not on that
  list.
- But s.345(א) (same page) defines the income "לאחר שנוכו ההוצאות הקשורות
  במישרין בהשגת ההכנסה". In the Ordinance, s.17(5א) sits inside s.17, whose
  opening deducts "יציאות והוצאות שיצאו כולן בייצור הכנסתו ... לרבות" (Ordinance,
  NII copy, p.34). So "ניכויים" in s.345(ב)(1) cannot mean every s.17 deduction,
  or it would cancel the expenses s.345(א) allows. Whether the s.17(5א) payment
  counts as one of s.345(א)'s directly-connected expenses or one of s.345(ב)(1)'s
  deductions is a matter of reading, not of the text.
- NII's worked example for the self-employed
  (btl.gov.il/.../Self_Employed/Pages/hishov.dmey.bituach.aspx, read 2026-11-06)
  repeats s.345 and lists only the 52% NI amount and a provident-fund amount
  "שנקבע על ידי מס הכנסה". It says nothing about study funds either way.
- Kol Zchut (secondary), "הטבות במס הכנסה לעובד עצמאי שחוסך בקרן השתלמות", says
  the opposite: "הפקדה לקרן השתלמות מקטינה את גובה 'ההכנסה החייבת' גם לצורך
  התשלומים למוסד לביטוח לאומי", with a worked saving of 17.83% of the deposit.
  No official source is given.

So TXH-26's self-employed sentence is an inference the text does not force, and
a widely read guide contradicts it.

## 5. ID clashes and trial merge

- TXH-25, TXH-26, `TXH OQ15`: no other local branch (22) and not origin/main
  (3295ebb7) has them, in the reference file, `data/rules` or
  `data/open-questions.json`.
- `git merge-tree` with origin/main: one conflict, `research/library/tried.jsonl`.
  Both sides only append lines, so the fix is to keep both. `index.jsonl` merges
  cleanly. origin/main does not touch `data/open-questions.json`.

## 6. Checks run

- `npm run validate`: "data/ is valid"; the warnings are the usual ones.
- `npx vitest run packages/pipeline --testTimeout=180000`: 170 passed, 1 failed:
  the expected count test (552 against 551) only.
- `gen:open-questions` regenerated with no diff (552: 286 open, 121 narrowed,
  145 closed). OQ4 narrowed, OQ10 closed 2026-11-06, OQ15 open.

## 7. Records changed

Only `data/rules/txh-01.json`, `txh-03.json` and `txg-35.json` changed under
`data/rules`. In each one the circular was added as a source, `text_he` was
updated and `checked` set to 2026-11-06.

## mustFix

1. **TXH-26, NI Law s.344(א) page.** `#page=240` should be `#page=239` (file
   page 239). Fix it in the Source line and in the Sources table row ("s.344
   240"), and move the library cite on c6681353c3ff86ab from p.240 to p.239
   with s.344(א)'s own words.
2. **TXH-26, s.345(ב)(1), the self-employed sentence (Rule line, OQ4 update,
   `tax-hishtalmut.md`).** It is stated as a rule but is a reading the text
   does not force (s.345(א) and s.17's opening, p.241 and Ordinance p.34), and
   Kol Zchut says the opposite. Move it to the conditions as a labelled
   inference, cite NII's self-employed calculation page as silent on study
   funds, record the contrary secondary claim, and keep it open in OQ4 as (c).
   What would settle it: an NII statement or ruling, or the Tax Authority's
   placement of the s.17(5א) deduction in the assessment.

## shouldFix

1. **TXH-25, the inference in its conditions.** "withdraws the taxed gains
   first" should say "takes the taxable part first, whose gains are taxed and
   whose deposits were taxed when paid; how much of a withdrawal is gain is
   open question 15".
2. **TXH-26, circular p.2.** "as the circular quotes it" or "as quoted" should
   say "as the circular reports it". The circular reports reg. 2 ("נקבע, כי ...")
   rather than quoting it.
3. **TXH-26, exempt withdrawals.** NI Law s.350(א)(7) (p.246) leaves out of the
   base "הכנסה שאינה הכנסה מעבודה כעובד או כעובד עצמאי, הפטורה ממס לפי כל דין".
   It was read in this pass but not used. It is a law-level basis for the
   exempt gains part of a withdrawal, beside the 1995 regulation the circular
   reports. Whether the employer's deposits count as work income for (7) stays
   an inference.
4. **TXH-25, the source line.** Add the Knesset secondary-legislation record
   (Id 2136214) as the official confirmation of gazette, page, date and that no
   amendment is recorded, in place of the Wikisource currency check. Ask for the
   gov.il Reshumot search to be run in the founder's Chrome for the text itself.
