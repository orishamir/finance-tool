# Independent check: branch rules-savings-policy (19b01980..fac9204b)

2026-11-06. The checker did none of the work. It read the diff and opened every cited page in `research/library/store/`:
- the Insurance Contract Law as published, 695ca650c1240933, file pp.7-8;
- the 2005 competition law, Book of Laws 2024, 093a365b24fa08c1, file pp.30-31 and 42;
- the Interest and Linkage Law amendment 8 (2001), 325a5a94e4bbd200, pp.2-3;
- the same law's amendment 9 (2023), Book of Laws 3117, e2fc8e9de44b8bcf, pp.2, 22-23 and 55-56;
- the contract-terms regulations, Regulations Booklet 4290, b690a103d0305137, p.17, and their 2004, 2007 and 2012 amendments (c628e0e5a8dd6115, 2bac096212a9353b, c29e76c21f605fe7);
- circular 2015-9-7, b6ea24c3a43e2049, pp.1-2 and 7, and the 2022 draft circular, 5b4dfe09b240429e, pp.1 and 3;
- Codex gate 1, f57741631e6ddaf9, pp.1 and 3-4, and the Codex table of contents, ed4aea6860eebf3c, pp.8-9;
- the Ministry of Finance team's interim report, 1a6634c4bfe09644, pp.15-16, 45 and 56, and its final report, d73fb55de4bc9007, p.5;
- Harel plan 1342, d801e1e50c7fc7c4, pp.1 and 12-18, and Phoenix plan 5552, 98ba2ef46402c88d, p.7.

It also checked s.46 against the Knesset's own records. The Knesset OData service (`KNS_IsraelLaw` 2000653, `KNS_LawBinding`, `KNS_DocumentBill`) lists 13 amending laws. The checker downloaded the published text of each from fs.knesset.gov.il:
- 1984 and 1988;
- 2001;
- amendments 4, 5 and 6 (2010, 2012, 2014);
- the 2016 indirect amendment (amendment 7);
- amendments 8 to 12 (2016 to 2023);
- 2023, amendment 13.

It then fetched origin/main (3295ebb7) and ran a trial merge with `git merge-tree`. It ran `npm run validate`: valid, with the usual warnings. It ran `npx vitest run packages/pipeline --testTimeout=180000`: 170 passed, and 1 failed, the known open-question count, which expects 551 and gets 552.

**Verdict: fail**, on four must-fixes, all small. The Hebrew quotes checked match their pages. The sources are all official publications or the companies' own documents. INS-27, INS-28 and INS OQ17 clash with nothing.

## 1. Quotes, sections and pages

Correct as cited:
- **Insurance Contract Law:**
  - s.46(א), (ג) on file p.7, and s.46(ד), (ה), ss.47, 48 and 52(ב) on file p.8.
  - s.52(ב) as published covers ss.43, 45 to 48 and 50; "sections 45 to 48" is a correct subset.
- **2005 law:**
  - s.12(2)(ב), the definition of "ביטוח תלוי תשואה", on printed p.860 (file p.31).
  - s.12(30), s.36א, on p.871 (file p.42), "בשינויים המחויבים".
- **2001 amendment:** s.7(2), on p.3, replaced "ריבית בשיעור 3% לשנה" in s.46(ג).
- **2023 amendment:** commencement on 1.10.2024, s.116(א), file p.56.
- **Contract-terms regulations:** reg. 6(1), Regulations Booklet 4290, p.301 (file p.17).
- **Circular 2015-9-7:**
  - Issued under both laws (p.1).
  - The s.2 definition is on p.2.
  - s.15 is on p.7.
- **Draft circular of 19.5.2022:** the definition on p.3.
- **Ministry of Finance interim report:** the pp.15-16 quotes, including "86 מיליארד", "אם כי זה אינו תנאי להצעת המוצר" and the loans sentence.
- **Final report (July 2026):** p.5, "(קרנות נאמנות ,קופות גמל להשקעה ופוליסות חיסכון)".
- **Harel plan 1342:**
  - The title page.
  - s.12.1 and s.12.2, p.12.
  - s.16.2, p.13.
  - s.16.5 (January 2013 CPI, "אלא אם הסכימה החברה אחרת"), s.16.9, s.16.10 and s.16.11, p.14.
  - s.22.1 (1 to 30 years), pp.17-18, and s.23, p.18.
- **Codex table of contents:** "הגדרות ספציפיות לחוזה ביטוח חיים" and chapter 5.2.3 "חוזי ביטוח שהוצאו שלא על פי קופת ביטוח", pp.8-9.

Wrong: two section or page numbers, see must-fixes 1 and 2.

## 2. Official publication or copy

All cited sources are official: fs.knesset.gov.il, free-justice.openapi.gov.il (the Ministry of Justice's Reshumot), gov.il BlobFolder (the CMA and the Ministry of Finance) and mevaker.gov.il. The insurers' own documents are on their own sites. The new INS-01 source line drops the Wikisource link the old INS-01 carried. The commit adds no copy as a source.

Two copies remain:
- INS-03 still cites Wikisource for the fee regulations. This is old text the commit did not change.
- INS-07 "Amendments read" says "a consolidated copy tags s.46 with only these two amendments". That copy is Wikisource (`חוק חוזה הביטוח`, s.46 "תיקון: תשס״א, תשפ״ד"). It is fine as a finding aid, but it should be named as a copy (should-fix 8).

## 3. Inference labels and company terms

Correctly labelled:
- "a savings policy is ביטוח תלוי תשואה" ("Inference, not a quoted rule").
- s.46 as a floor that policies improve on ("Reading, not a quoted rule").

Company terms stay named: INS-27 and INS-28 are institution-scoped. The INS-01 and INS-07 examples name Clal, Harel and The Phoenix.

Not labelled: see must-fix 3 and should-fixes 1 and 2.

## 4. Is s.46 current?

Yes, apart from one wrong section number. The Knesset's binding list has 13 amending laws. Read in their published text, only two touch s.46:
- The 2001 law, s.7(2).
- The 2023 law, **s.40(3)** (the rule says s.38(3)).

What the others touch:
- 1984: ss.2, 28, 56, 59, 64, 67, 72.
- 1988: adds s.28א.
- Amendment 4: s.28.
- Amendment 5: ss.10, 15.
- Amendment 6: ss.5, 13, 31.
- Amendment 7 (2016): ss.2(ב), 56(ב).
- Amendments 8 and 9: s.28.
- Amendment 10: adds s.27, amends s.39.
- Amendment 11: adds and amends s.31, amends s.39.
- Amendment 12: adds s.44א and puts it into s.52(א). s.52(ב) is unchanged.

The 2023 law's s.114(2) also amends a "s.46(ג)", but that is in the Passenger Data Law, not this one. The 1982 amendment of s.47 that the worker noticed is not in the Knesset's list. It does not touch s.46.

Reg. 6(1) of the contract-terms regulations: the 2004 amendment changed (2), (3) and (4) and deleted (5). The 2007 and 2012 amendments touched only 6א. (1) stands as first published, which the Wikisource consolidated copy confirms as a finding aid.

## 5. ID clashes and merge

- **IDs:** INS-27, INS-28 and "INS OQ17" appear on no other ref (all local branches, the worktree branches and origin/main). Every other branch ends at INS-26 and INS OQ16.
- **Trial merge** with origin/main (`git merge-tree`): one conflict, in `research/library/tried.jsonl`. Both sides append lines; keep both.
- **For the lead after merging:**
  - The open-question count is 551 on main and 552 here. The test at `packages/pipeline/test/validate.test.ts:440` needs 552.
  - SKILL.md on main says 1054 rules; with INS-27 and INS-28 it is 1056.
  - `coverage.md` grades the savings policy **C!** for "what it is" ("INS-01 (an insurer's terms; the law's definition not opened)") and **C!** for "getting the money out" ("INS-07 (insurers' terms)"). Both are now from official texts and should be regraded. coverage.md is the lead's file.

## Must fix

1. **INS-07, the 2023 amendment is s.40(3), not s.38(3).** On Book of Laws 3117, p.160 (file p.22), the section on the Insurance Contract Law is **40** ("‏.40 תיקון חוק חוזה הביטוח - מס' 13"). Its paragraph (3) deletes the words in s.46(ג). "38" is the footnote number ("38 ס"ח התשמ"א, עמ' 94; התשפ"ג, עמ' 540"). Fix it in three places: the INS-07 "Amendments read" bullet, the INS-07 Source line ("s.38(3)"), and the sources table row ("s.38(3), s.116").
2. **INS-01, the Codex gate 1 definition is on p.3, not p.4.** "ביטוח תלוי תשואה … כהגדרתו בחוק הפיקוח על הביטוח" is in the table on PDF p.3 of `gate1_defenosions.pdf`. p.4 has no "תלוי תשואה". Fix the link (`#page=4` to `#page=3`), the "p.4" and the library cite (f57741631e6ddaf9, page 4). The library's `cite` check accepted p.4 because it tests each word separately, and p.4 holds the words "כהגדרתו", "בחוק", "הפיקוח", "על" and "הביטוח" apart.
3. **INS-07, "It reaches savings policies" is a reading, stated as fact.** The Ministry of Finance team says only that "חלות עליהן הוראות חוק חוזה ביטוח" (p.15). Two steps are the worker's own reading:
   - that chapter B (life insurance, s.41: "מקרה הביטוח הוא מותו של המבוטח … או הגיעם לגיל מסויים") reaches a savings policy;
   - and so that s.46 does.

   Label that bullet "Reading, not a quoted rule" like the next one. It can add circular 2015-9-7 s.15, which calls them "פוליסות ביטוח חיים שאינן קופות ביטוח".
4. **INS-07 title and the summary drop the two-year condition.** The title says "the law gives a right to full or partial redemption, paid within 30 days". The summary says "By the Insurance Contract Law (s.46) the holder may redeem all or part of the policy, and the insurer pays within 30 days". s.46(א) gives the right only "לאחר ששולמו דמי הביטוח בעד שנתיים". The rule body states the condition, but a guide writer working from the title or summary would state it with none. Add "after two years of premiums" to both.

## Should fix

1. **INS-01's heading and Rule go one step past their sources.**
   - The heading's "what it pays follows the return of the chosen track" and the Rule's "defines the product" both go further than the texts.
   - Circular 2015-9-7 defines the category "פוליסה שאינה קופת ביטוח". That a savings policy is that category is a reading, though a close one.
   - The return dependence is labelled only in the inference bullet. A general source exists: reg. 6א(ג) (INS-25) ties the holder's rights to the portfolio return less the fee. Cite it, or label the heading's clause.
2. **INS-07 / INS-28, the insurers' 30 days and the law's 30 days start on different days.** The law counts 30 days "מהיום שנמסרה לו הדרישה" (s.46(ג)). Clal counts from receipt of the request "and all documents" (s.12.1.3). Harel counts from "בקשה כתובה וכל המסמכים הנדרשים" (s.16.9). The INS-07 reading says the policy may not pay later than 30 days and calls the insurers' terms "more generous than the law's" (INS-28). It does not note that their clock can start later. Add this to INS OQ17 and soften "more generous".
3. **INS-28, The Phoenix rests on an FAQ while its binding terms are in the library.** Phoenix plan 5552 (November 2024, 98ba2ef46402c88d, p.7) is already cited in INS-03 and says:
   - s.11.1, withdrawal "כולו או חלקו, בכל עת קודם לתום תקופת הביטוח";
   - s.11.2.2, 90% or more counts as a full withdrawal for ending the covers;
   - s.11.4, payment "בהתאם למועדים הקבועים בהסדר התחיקתי או בתוך 30 ימים … לפי המוקדם".

   INS-28's heading says "any time" for all three insurers, but the Phoenix FAQ quoted says nothing of "any time". The summary and the INS-07 reading quote "4 business days (Phoenix)" from the FAQ, which is marketing text (D56: binding documents, not advertising). Add 5552 s.11 to INS-28, and keep the FAQ's 4 days only as the FAQ's own claim for Phoenix Invest. INS-07 also says "None of the three insurers' terms read charges a surrender fee". For Phoenix only the FAQ was read on this point, so say so or read 5552 s.11.
4. **The summary still says "No regulation capping its management fee was found."** This contradicts INS-25 and the closure of INS OQ2 (2026-10-24): 1% a year, 2% with approval. The Ministry of Finance team (p.16) also says "תקרת דמי הניהול היא כקבוע בפוליסה ולכל היותר עד 2% מהצבירה". The commit rewrote this paragraph, so fix it now.
5. **INS-01 "Later wording of the circular" misses the 2022 amendments.** The trade press (funder.co.il 141484, bizportal 817236) reports two amendments:
   - circular 2022-9-28, "מסלולי השקעה בקופות גמל – תיקון", published 28.9.2022, applying to bodies managing "פוליסות ביטוח חיים שאינן קופות ביטוח";
   - circular 2022-9-30 of 20.12.2022.

   The draft of 19.5.2022 is the one the rule quotes, so its definition probably came into force through 2022-9-28. Name these as the likely final text and add them to the open item. These are secondary leads; the circular itself was not found on gov.il in two searches.
6. **INS OQ14's status.** The markdown says "Narrowed for savings policies", but `data/open-questions.json` keeps `"INS OQ14": "open"`. The status is kept by hand (data-schema 3.15), so set it to `narrowed`.
7. **Smaller precision points.**
   - The INS-07 source note says the 2004 amendment "replaced only (2) and (3)". It also changed (4) and deleted (5) (6284 pp.132-133). Say "changed (2) to (5), not (1)".
   - INS-01 calls 2015-9-7 "the Capital Market Authority's" circular. It was issued in February 2015 by "אגף שוק ההון, ביטוח וחסכון" of the Ministry of Finance, before the Authority existed.
   - INS-01 attributes "למעט קופת ביטוח" to both the fee regulations and the contract-terms regulations. Reg. 6א says "שאינה קופת ביטוח".
   - The same interim report gives NIS 84 billion on pp.45 and 56, beside the 86 billion of p.16. Note that the report's own figures differ.
   - INS-07 Figures says "Fixed in law" for the 7 days, which are in a regulation.
8. **Name the copy.** In INS-07 "Amendments read", write "the Wikisource consolidated copy (a finding aid)" in place of "a consolidated copy". Also add that the Knesset list holds 13 laws, all read for s.46: the checker read them; the worker's text says only that the list was "searched".

## For the tax-specialist (not this branch's files)

The "Found for other files" entry for TXA open question 1 quotes p.16 of the interim report correctly: "ככלל, במשיכת הכספים הרווחים אשר נצברו בפוליסה ימוסו כהכנסה מריבית", and ss.125ד and 125ה.

## Also seen

Phoenix 5552 s.11.1.3 and Harel 1342 s.16.3.2 let a corporate policyholder withdraw in order to move the redemption value to another policy "למטרה זהה". This is for employer-held policies only. It does not change INS-12 or the closed INS OQ7 for an individual, but INS-28 could mention it.
