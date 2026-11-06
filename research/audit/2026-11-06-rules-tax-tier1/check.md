# Independent check: tier-1 tax questions (branch rules-tax-tier1, commit 774653e7)

Checked 2026-11-06 by a reviewer who did none of the work. Every citation below was opened in the
library's stored text of the official document (research/library/store), at the cited page. The July
2026 team report was fetched again from gov.il and compared by hash. `npm run validate` passes on
the branch. No site build was run.

## Verdict: fail

The four tax claims hold at their cited sections and pages. Each inference is labelled, and the open
questions stay open. The branch fails because the data records were not brought into line with the
rewritten rules, and the site reads those records. As merged, the kupat gemel lehashkaa guide would
still print "the managing company withholds 20%", and the child-savings bank page would still say
National Insurance gives no rate. One figure the site shows still cites the capitax copy.

## The four claims, checked against the texts

### 1. Makam at 15%; the guide's 20% line covers only bonds issued before 8.5.2000: holds

- Ordinance, Tax Authority text, p.204: s.125ג(א) "ריבית" – לרבות דמי ניכיון; (ג)(1) 15% on an
  unlinked asset. Matches.
- 2005 withholding regulations (btl copy, library 2d313d18dfed9653), p.1: reg. 1 "מילווה מדינה" ...
  "וכן מילווה שהוצא לפי חוק מילווה קצר מועד"; p.2: reg. 5(א) 25%, or 15% on an unlinked asset. Matches.
- Amending law of 2002, fs.knesset.gov.il (library 84905884fa88e9ca), p.22. s.43 is headed "תיקון
  סעיף 90" (p.18), and its (8)(ג) adds to s.90(יב) "(5) לענין ריבית על מילווה המדינה – על מילווה
  כאמור שהונפק ביום ג' באייר התש"ס (8 במאי 2000) ואילך; לענין סעיף קטן זה, "ריבית" – לרבות דמי
  ניכיון". Matches, and so does the cited section number. The repeal of s.7(ב) of the Short-Term Loan
  Law is s.80א, which s.38 of the same 2002 law adds to Amendment 132 (p.17). It matches GOV-01.
- Guide 2025, file p.41: item 3 under "ריבית על אגרות חוב" covers unlinked traded bonds "שהונפקו לפני
  8/5/00", whose interest "ממשיכה להיות פטורה כבעבר". Its last sentence reads "דמי ניכיון על מקמ חייבים
  ב-20% מס בעת המימוש". The quote and its placement are as stated.
- The rate rests on the law and the regulations, not on the guide. The record says that placing the
  20% line under pre-2000 bonds is a reading of the layout.

### 2. Kupat gemel lehashkaa withholding of 25% on gains, nothing on principal with linkage, although reg. 3(א) reads 20%: holds

- File 856 layout, gov.il (library 162fd7dc2f5298db), p.1: dated 14 January 2026. p.2, item 7 adds
  withholding types "87,88" for "תשלום מחשבון חדש או קופת גמל להשקעה", "לדוחות משנת 2018 ואילך".
  p.14 lists type 87 "קרן כולל הפרשי הצמדה על הקרן (פטור)" and type 88 "ריבית ורווחים אחרים" (25%).
  Matches, and "exactly two types" is right.
- Reg. 3(א) (btl copy, p.2) reads "קופת גמל המשלמת ליחיד ריבית, תנכה ממנה מס בשיעור של 20%". Matches.
- The record says that 25% is a label on a reporting type, not a sentence that tells managers what
  to withhold, and that the legal basis stays open. That is fair.

### 3. Accrued interest: the buyer is taxed on the whole coupon, and the offset question is open: holds

- Ordinance pp.22-23, s.3(ח). (1) applies to a recipient who is not in business: the accrued interest
  is income "שאין לגביה זכות לפטור ... לזיכוי, לניכוי או לקיזוז כל שהם". (2) applies to business
  income and sets the holding tests. Paragraph (2) ends with a dash, and the sentence "לא יובא בחשבון
  ... אותו חלק מהסכום שהוציא לרכישת האיגרת השווה לריבית הצבורה" follows it. Reading that sentence as
  (2)'s consequence is the natural reading, and the record labels it as one.
- Circular 10/2025 (gov.il, library 9ab261ff65e00be3): p.1 dated 27.11.2025, subject "קיזוז הפסדי
  הון". s.3.3.1, pp.4-5, reads "יותר רק באם שולמו הריבית או הדיבידנד בפועל באותה שנת מס בה התהווה
  ההפסד". s.3.7, p.5, says securities losses are not offset against interest on "תכנית חיסכון,
  פיקדונות". The circular never mentions accrued interest or s.3(ח); a text search found neither.
  The quotes match.
- Whole coupon withheld under reg. 5(א): matches. The capital-gains computation regulations of 2002
  and the withholding regulations of 2002 contain no accrued-interest provision (searched).
- Open question 5 stays open. One sentence in it is unlabelled; see "Should fix", item 4.

### 4. Child savings: circular 1356 says 25% of gains; the bank route by the general rules would differ: holds

- Circular 1356 (btl.gov.il, library eef203fc70c0b8ce), p.1: number 1356, dated 30 November 2016.
  p.11, s.6, "משיכה של כספי החיסכון", reads "משיכת כספי החיסכון חלקם או מלואם תחויב במס רווחי הון
  בשיעור של 25% מהרווחים", with no split by route. The same sentence is in the annex FAQ on p.25.
  Matches.
- National Insurance Law (btl copy) p.50, s.74ב(ב): "הם של הילד, אך ייחסכו בחשבון נאמנות לטובתו",
  with the trustee the parent who receives the child allowance. Matches.
- Ordinance p.128, s.75ג: the definitions of "נאמנות" and "נאמנות הדירה" (3), a child of the creator
  under 18. Matches.
- TXK-29 opens with "Rule (inference, labelled)" and names the two doubts it does not settle. It is
  correctly marked. CS-10 (the three bank tracks), TXI-03, TXI-04 (prime counts as unlinked),
  TXI-05, TXI-07, TXI-08 and TXG-05 say what TXK-29 says they say.

### Other changes checked

- July 2026 team report: the gov.il file's sha256 is d73fb55d…9347, equal to the library copy, so
  "byte-identical" is true. p.16, s.12.4.2 (TXK-09) matches.
- No new citation rests on Nevo, Wikisource or capitax. A company's document appears only as a named
  example: Leumi in TXI-11 and TXI-16, Harel in TXK-28, now institution scope. Nothing was found that
  was filled in from memory.

## Must fix

1. **TXK-26 record (data/rules/txk-26.json) contradicts its rule.**
   - The rule now says the manager withholds 25% (file 856).
   - The record's title is still "Withholding rate on interest a provident fund pays an individual:
     20% in reg. 3(א)".
   - Its text_he still presents the regulation's rate as the rate withheld.
   - Its only figure is `regulation_text_rate` = 20.
   - The site reads that figure: site/app/content/guide/kupat-gemel-lehashkaa.tsx:37 and :57 print
     "החברה המנהלת מנכה במקור 20% מהרווח".

   Fix: add a figure for the 25% withholding on gains, sourced to file 856 p.14, and give the 0 on
   principal with linkage too. Rewrite the title and text_he. Point the site sentence at the new
   figure in the same change, or hold the branch until it is.

   Clean up what the change leaves behind:
   - docs/method.md G-02 ("reg. 3 says 20% … Harel says 25%")
   - the comment in packages/engine/src/ledgers/provident.ts:346-350 ("The manager withholds 20%")
   - copy.ts "TXK-26"
2. **TXK-28 record (data/rules/txk-28.json) contradicts its rule.**
   - The scope is now institution, but the title still ends "(unsettled)".
   - text_he still says Harel's rate differs from the regulation and that no Tax Authority
     instruction was found.

   Fix: rewrite both to say that Harel's rate agrees with the general rate (TXK-26).
3. **The TXK-20 record and the child-savings bank page still say National Insurance gives no rate.**
   - The record's text_he reads "בלי שיעור ... לכן השיעור לא ממוקר".
   - site/app/content/guide/child-savings-bank.tsx:54 reads "הביטוח הלאומי אומר רק שבמשיכה
     משלמים מס רווחי הון, בלי שיעור".
   - Circular 1356 now gives 25%.

   Fix: update text_he to name the circular as National Insurance's statement, not the Tax
   Authority's. Fix the site line too, or record it as a follow-up before merge.
4. **The TXK-21 figure still cites the capitax copy.**
   - The record's sources moved to gov.il.
   - `figures.proposed_cap.source` still points to
     capitax.co.il/Attachments/arbitrage_committee-07-2026.pdf#page=14 with publisher "copy at Alex
     Shapira & Co."
   - The kupat gemel lehashkaa guide shows this figure, so the site still links a copy.

   Fix: repoint it to the gov.il file at p.14.

## Should fix

1. **TXI-11 and open question 3 say "a makam runs at most a year (GOV-22), so any makam issued before
   that date was redeemed by 2001".** GOV-22 is the Bank of Israel's page as of 2025. It says nothing
   about makam terms in 2000, and the Short-Term Loan Law leaves the term to regulations (GOV-01). The
   conclusion needs only today's fact: every makam outstanding today was issued within the past year
   (GOV-22), so the pre-2000 line reaches none. Say that, or mark the 2001 date as an inference.
2. **TXK-29 has no data record.** The child-savings bank page cites TXK-23, the provident-track
   inference, for the bank route (child-savings-bank.tsx:55). docs/method.md F-50 and G-17 still say
   "a secondary source gives the rates (TXK-23)". Add a txk-29 record, point the bank page at it, and
   update F-50 and G-17 to name circular 1356 and TXK-29.
3. **TXK-20 says circular 1356 "agrees with the law's rate" for the provident track.** The rate
   agrees. The base may not: the circular says "25% מהרווחים", and the law gives 25% of the real gain
   (TXK-07). Say "the rate agrees; the circular does not name the base".
4. **The new note in open question 5 has an unlabelled inference.** It says "So the reader's cost is
   at most the tax on the accrued part (15% or 25% of it) if the loss cannot meet the coupon, and
   about nothing if it can." That sentence is derived from the layout reading and is not marked. Label
   it a reading.
5. **TXK-26's source list leans on copies for its negative claim.** The claim is "the 2012 amendment
   did not amend reg. 3". It rests on the olaw.org.il mirror of ק"ת 7076. Reg. 3(א) and 5(א) are read
   in National Insurance's consolidated copy, not in the Reshumot publication. One source line labels
   a btl.gov.il URL "primary (Wikisource mirror)", which looks like a mislabel. Under the sources
   rule of 2026-11-06, read ק"ת 7076 and the regulations in their official publication. This is part
   of the planned re-reading of rules quoted from copies, and not new on this branch.
6. **TXF-11 still rests on the 2019 letter from capitax.** The foreign-tax note now says that letter
   "cannot carry a rule on its own". TXF-11's rule text still uses it as the first of three texts,
   with scope general, and data/rules/txf-11.json still cites capitax. Either relabel the record or
   leave a pointer in TXF-11 itself.
7. **The TXK-21 record lost a locator.** Its first source lost its locator ("pp.5, 10-14, 16-17") and
   its `page` when it was repointed to gov.il. Restore them.
8. **The TXK-20 title says "no official rate found".** Circular 1356 is an official statement of a
   rate, though not a tax authority's. Make the title "no Tax Authority rate found".
