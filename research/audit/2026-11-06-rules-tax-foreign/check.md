# Independent check: rules-tax-foreign (d83ed349)

Checked 2026-11-06 against `main...rules-tax-foreign`. Sources were opened in `research/library/store` (the text of each cited file, by page).

## Verdict: fail. Two small fixes needed, then pass.

## Verified
- s.129ג(א)(1) "הכנסותיה ורווחיה של קרן נאמנות פטורה פטורים ממס": Tax Authority Ordinance copy (4d9d397e88b5931d), file p.208. s.129ג(א)(2) also there.
- s.88 takes "קרן נאמנות", "יחידה" from the Joint Investment Trust Law (same copy, p.150).
- s.97(ב)(1) "נכס שהיה לו מחוץ לישראל" (p.161).
- Circular 10/2025 s.3.7, p.5 (9ab261ff65e00be3): both quotes are exact. Section 3 is the circular's general text on offsets, not a withholders' section.
- Joint Investment Trust Law (d386a692cce2ad86): s.113א defines "קרן חוץ" ("הסדר או תאגיד") and "יחידות של קרן חוץ" separately (file p.75). s.113ד(א) "כאילו היו יחידה, קרן ומנהל קרן" (file p.76, list continues on p.77). s.1 "קרן חוץ" (נמחקה); "יחידות" means s.3(ב) units.
- US-Israel treaty (626bce17b884dbdb), file p.7: Art. 2(1)(f)(ii) and Art. 3(1)(a)(ii) quoted exactly.
- IRS Pub. 515 (2026) (60f3b61756cf9e9c), "Dividend Equivalents": quote exact.
- 26 CFR 1.871-15 (10c73941b6be83a1): (l)(2)(i) "a qualified index is treated as a single security that is not an underlying security" is exact. The (l)(3) criteria match, with the qualifications below. (r)(2) covers delta-one transactions.
- Harel Sal (4D) S&P 500 (211de4a40f5b40cb), p.1: exempt, "קרן נאמנות להשקעות חוץ". p.3: swap sentence. MTF Sal (4D) MSCI AC World (e8a23a3c3cfff226), p.1: exempt, shekel units, US dollar main currency. p.3: the sentence is there, split by the layout. Both are labelled institution, as examples.
- Invesco FTSE All-World annex (a096d9f4ceb1398a): p.18 "29 באפריל 2010 בדבר תיקון 168" and p.19 "בדומה לקרנות נאמנות" are both there.
- The professional division's 2019 report (ce63dcbf62caca3d): rulings 3748/19 (p.65), 6853/19 and circular 1/2019 (p.66), green track (p.69). No "קרן חוץ" anywhere in it.
- TXS-41, TXS open question 24 and sources S19-S22 are free on origin/main f5d5f5cc. Main has not touched the five changed files since the merge base 43624357.
- `npm run validate`: valid. `npx vitest run packages/pipeline`: 170 passed, 1 failed (the open-question count, 551 against 550, as expected).

## Must fix
1. **TXS-41: wrong paragraph for the index test, and the date is paraphrased wrongly.** The rule says "tested on the first business day of each calendar year (1.871-15(l)(3))". The test is in (l)(2)(i): "made at the calculation time for the transaction based on whether the index is a qualified index on the first business day of the calendar year containing the calculation time". Cite (l)(2)(i) and use its words. A swap is judged at its own calculation time, not re-tested every year.
2. **Copy or inference stated as settled.**
   - TXF-05's Rule line still opens "Because a 'קרן חוץ' is a 'unit' under the Joint Investment Trust Law". The new conditions say this rests on the copy alone, and that the law defines a foreign fund's units apart. The Rule line should say it is the 2019 letter's statement.
   - TXS-41 says foreign tax inside the fund is a cost "that the holder cannot credit (TXS-15, TXF-16)". TXS-15 calls that a reading "which no source states in words (open question 8)". Carry that label.
   - TXS-41's Rule line and its summary line ("taxed the same for you whether it holds the shares or a swap") state as fact what the conditions call "Inferred, no official text says it". Label it in the Rule line and in the summary.

## Should fix
- TXF-05 cites ISA file p.76 for s.113א, which is on p.75. TXF-36 has it right.
- `tried.jsonl`: the list of sections in s.113ד leaves out (9) s.83(א) (file p.77).
- TXS-41's qualified-index summary needs four corrections:
  - The 15% and 40% limits apply to "component underlying securities", not to every component.
  - It leaves out the (l)(1) override: an index is not qualified if treating it so is contrary to the rule's purpose.
  - It leaves out (l)(6): a swap that also references a short position in a component, or is hedged on components, loses the exception.
  - It leaves out the 50% condition for an index traded only on a foreign exchange ((l)(3)(vii)(B)), and the (l)(4) safe harbor.
  - Also, (r)(2) applies to delta-one transactions issued on or after 1.1.2017, not to every swap "from" that date.
- TXS-41: "So a fund that tracks through a swap can still report the dollar as its index" generalises from two funds' own reports. Write "these two funds report ...", so their documents stay institution examples.
- TXF-04 calls the 90% wording "official (TXS-14)". TXS-14 holds open whether the 2003 regulations still operate; say so there.
- In TXF open question 10, the list of where the letter's points stand leaves out TXF-06 (credit only for tax on the fund's own distributions). TXF-06 still rests on the copy alone and did not get the rewritten conditions the others got. TXF-04's and TXF-26's Rule lines also still read as settled; their conditions and source carry the label of the copy.
