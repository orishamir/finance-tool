# Independent check: rules-tax-child (b689f964)

Checked 2026-11-06 by an independent checker who did none of the work, against
`git diff main...rules-tax-child` (merge base 43624357).

**Verdict: fail.** The sources hold up and the tax reading is sound, but the
branch breaks two tests that pass on main, so `npm run check` fails.

## Runs

- `npm run validate`: data/ is valid. No new warning class. TXK-23 is among the
  "strength differs from its strongest source" warnings, as it was on main.
- `npx vitest run --testTimeout=180000`: 2 failed, 1595 passed. These are not
  timeouts. Both files pass on main (119/119).
  1. `site/app/content/terms-ratchet.test.ts`: the new Terms row
     "חשבון בבנק (המנוהל בנאמנות)" in `tax-gemel-lehashkaa-ira-child.md` adds
     the term "חשבון בבנק". `guide/brokerage-account` names that term and has
     no glossary row for it.
  2. `site/app/lib/search-claims.test.ts`: the claim "אמרו לי שאפשר להעביר
     קופת גמל להשקעה לחברה אחרת בלי לשלם מס, כל עוד לא מושכים את הכסף"
     (expected TXK-04, SW-21 or KGL-10) no longer finds any of them in the top
     three. TXK-22's new text on tax-free moves between funds most likely
     pushes them out. This is inferred from the change; the ranking was not
     traced.

## Sources opened

Each was read in the library copy, page by page, with `pdftotext`, and the
letter's page 2 was also checked against the image.

| Claim | Found | Result |
|---|---|---|
| Tender p.7, q.69 and q.71–72: "מדיניות המס הקיימת תחול על כל המכשירים המפורטים במכרז זה" | yes | ok |
| Tender p.7, q.70: "לא מוסיפה או גורעת מדרישות המס בהתאם לפקודת מס הכנסה" | yes | ok. TXK-29's source line gives "questions 69-71" for the q.69 quote, but q.70's answer is different text |
| Tender p.21, header: Part B answers approved by the Capital Market Commissioner | yes | ok |
| Tender p.21, q.215: "קופת חיסכון לילד הינה קופת גמל להשקעה לכל דבר ועניין" and "תמוסה במס רווחי הון"; the question asks "25%?" and the answer gives no figure | yes | ok, but the quote is cut short; see shouldFix 2 |
| Tender p.23, q.245: "כן. משיכה חייבת במס הון"; "...ולפיכך לא תחויב ב 35%" | yes | the document reads "הנה רק", not "הינה רק" (TXK-24 quote) |
| Tender p.24, q.246 (begins on p.23): "על קופת חסכון לכל ילד חלות כל הוראות הדין לעניין קופת גמל להשקעה" | yes | the document reads "חסכון"; TXK-23 and the txk-23 record quote "חיסכון" |
| Tender p.25: Part C answers approved by the Banking Supervision; q.256: "בעל החשבון הוא הקטין, וההורים מנהלים את החשבון בנאמנות" | yes | ok (once the two columns are separated) |
| CMA circular 2022-9-29, p.3, s.1: "...ויחולו עליה כל ההוראות החלות על קופת גמל להשקעה בהתאם להוראות הדין ובכלל כך הוראות הממונה, אלא אם נקבע..." | yes | ok |
| Minister's letter of 10.8.2016, p.2: transfers between provident funds get "דחיית מס", while a transfer between banks "מהווה אירוע מס"; "וליהנות מפטור ממס רווחי הון אם הכספים יהפכו לקצבתיים" | yes | ok (the OCR is poor; checked on the image) |
| NII Law p.50: s.74ב(א)(2א) "בקופת גמל להשקעה", which defines the fund by the Provident Funds Law; s.74ב(ב) "הם של הילד, אך ייחסכו בחשבון נאמנות לטובתו" | yes | ok |
| Ordinance s.3(ה4)(3): gains "שמשך יחיד מקופת גמל להשקעה" are interest, and linkage is linkage income | yes | ok, with no condition on who deposited |
| Ordinance p.128, s.75ג: definitions of "נאמנות" and "נאמנות הדירה" (3), a child of the creator under 18 | yes | ok |

## Judgements

- **Is the provident-route rate read or inferred? It is read.** The law
  places the money in a "קופת גמל להשקעה", defined by the Provident Funds Law.
  s.3(ה4)(3) taxes the gains any individual withdraws from such a fund, and
  s.125ג(ב) and the linkage exemption give the rate and the base. That is
  statute applied to a category the statute itself names, not an analogy.
  The CMA circular and the tender answers corroborate it. "Settled" is fair.
  The record's "What is read and what is applied" line labels it honestly.
  Two assumptions are left unstated in TXK-23:
  - s.74ב(ו) exempts only the accumulated sums, not the gains. This is
    stated in TXK-19.
  - the s.74ב(ב) trust does not change whose income the gains are. TXK-29
    raises this for the bank route only, but s.74ב(ב) covers both routes.
- **Can a tender's answers carry a general tax rule?** They do not carry it
  alone here. The answers come from the Accountant General's tender committee.
  Parts B and C were approved by the Capital Market Commissioner and by the
  Banking Supervision, both regulators, and the document is published
  officially on mr.gov.il. It is a government and regulator text, not a
  company's term, so it may be cited, and the records label it "not a tax
  authority". The provident rate rests on the law, and the bank rates are
  still labelled a reading. TXK-24's "no 35%" rests on the tender answer
  alone, and that is labelled. Nothing found is filled in from memory.
- **Is the "secondary" strength on txk-23 honest?** It is honestly disclosed
  and errs on the cautious side: the text tells the reader that the figures
  cite a press guide. It still breaks "General sources first". The rule now
  rests on s.125ג(ב), and that law is at hand, yet the figure's source is
  still tashkif.co.il while its `update_rule` says "fixed in law". The
  bank-route figures (`bank_linked_rate`, `bank_unlinked_rate`) are correctly
  secondary, because they are readings. They sit in a record whose title is
  now provident-only.
- **Did the re-extracted records lose anything?** Nothing of substance, but
  txk-23 dropped three things:
  - the BTL FAQ source (tax.aspx);
  - the s.74ב(ד)(1א) locator, which was "pp.50-51, (2א), (ד)(1א)" and is now
    p.50 only;
  - TXK-20 and TXK-22 from `derived_from`, though its text still cites both.

  The FAQ and (ד)(1א) still appear in TXK-20 and TXK-22. The other four
  records only added sources and kept every old one.

## mustFix

1. Make `npm run check` pass again:
   - the glossary ratchet: give "חשבון בבנק" a row or variant, or a NOT_A_TERM
     reason, or reword the new Terms row;
   - the search claim: let TXK-04, SW-21 or KGL-10 reach the top three again,
     for example by trimming TXK-22's move wording. Do not add the claim to
     `known` without a reason.

## shouldFix

1. Quote the documents' own spelling: "חסכון" in q.246 (TXK-23 and the txk-23
   record) and "הנה" in q.245 (TXK-24).
2. Quote q.215's answer in full: "...וחלות עליה כל ההוראות הרגולטוריות
   החלות על קופת גמל להשקעה (ובנוסף להן ההוראות הייחודיות לחיסכון לכל ילד)
   לרבות לעניין תקרת ההפקדות השנתית". The answer speaks of regulatory
   provisions. Q.246 ("כל הוראות הדין", given in reply to a question about
   tax on gains) is the stronger support; lead with it.
3. Re-source the provident figure in txk-23 to s.125ג(ב) (TXK-07) and set the
   record to primary as its own small change, with the site label change
   named. Move the two bank figures to TXK-29.
4. In TXK-23, add the two unstated assumptions: s.74ב(ו) covers sums, not
   gains; the trust question applies to the provident route too.
5. In TXK-29's source line, say "questions 69, 71, 72" for the quote
   (q.70 has its own answer). Restore TXK-20 and TXK-22 to txk-23's
   `derived_from`.
