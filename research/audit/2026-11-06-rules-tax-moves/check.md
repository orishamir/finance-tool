# Independent check: branch rules-tax-moves (c5a5b759)

Checked 2026-11-06 by a checker who did none of the work. Scope: TXS-38, TXS-39, TXS-40 and the summary line in
`tax-securities-israeli.md`; TXI-26, TXI-07 and the summary line in `tax-interest-deposits-bonds.md`; TXS open question 17 and
TXI open question 14; the library index.

## Verdict: fail (two must-fix items, both wording; the sources hold)

## What was run

- `npm run validate` on the branch: data/ is valid (warnings are the usual ones).
- `npx vitest run packages/pipeline --testTimeout=180000` on the branch: 8 files, 171 tests pass.
- The same two on a throwaway merge of the branch into origin/main (177f169d): valid, 171 pass, the open-question count test (550) passes.
- Merge with main: one conflict, `research/library/tried.jsonl` (append-only; keep both sides).
- New ids: TXS-38, TXS-39, TXS-40 and TXI-26 are free on origin/main and on every other local or remote branch.
- Every rule the new text points to exists on main (TXS-05/06/18/19/21/29, TXG-20/25, BRK-27, SW-36, SW-55, BANK-06/33, TXI-07/08/25).

## Quotes and locators, checked in the library copies

All of these were found, word for word, on the cited page:

- Ordinance (Tax Authority text, 4d9d397e88b5931d): s.88 "מכירה" p.148; "יום רכישה" and "מחיר מקורי" p.147; "נכס" p.146;
  s.245(א) p.269 (the full quoted sentence).
- 2002 withholding regulations (8b5fffa5abbe8104): reg. 1 "חייב" and reg. 2 p.1; regs. 9(א)-(ב), 11, 13 p.2; regs. 15, 16 p.3.
  The rates (25% of real gain, 15% unlinked) match reg. 2.
- 2005 regulations (2d313d18dfed9653): reg. 4 p.2.
- Notice of 19.5.2025 (cbb3d775be9e3a8f): s.ב.1 "רק למצב בו אין שינוי בזהות המחזיק" and s.ב.2 p.2; the 500,000 NIS split and
  "תקף רק לאחר חתימת פקיד השומה" (p.3, not quoted as such).
- Form 747 (31a616b98ccaa856): annex A note 2 "עלות ני"ע לצורכי מס הנומינלית שנקבע למעביר" p.2.
- Form 1325 notes (e228b3aecb854371): note 3 "סכום שהוצא לרכישת נייר הערך" p.2.
- Circular 10/2025 (9ab261ff65e00be3): s.3 p.4, s.3.7 p.5.
- Barel (capitax copy, 4d6e180f350f2a7b): para 23 leaves the offset route open, para 24 dismisses the appeal; TXI-26's
  summary of TXI-25 is faithful.
- 2025 guide (5012033e55e0c415): "מחויבים במס בעת המשיכה" p.42.
- Leumi page (5cfffac1735b0f7b), Massad form (b2568a3d7a973cce), Discount form 03-007 (ac8d961a098b1221) and Discount tax page
  (c55b9fbe99e51650): every quote present.
- Circular 22/2002 quote via TXS-06 (365540f0f2e29e39) present. Directive 432 (5920463a9e803449): nothing on tax or cost data, as
  stated.

No rule was found stated from memory. Both open questions stay open, which is right.

## Must fix

1. **A bank practice stated as general.** The summary line in `tax-securities-israeli.md` says "banks treat a move to the same
   holder as no tax event (TXS-38 to TXS-40)", and TXS-40's title says the three banks hold that "the same holder pays no tax".
   Only Leumi and Massad say so. Discount's form 03-007 lists full identity apart but states withholding as the rule for every
   kind it lists (the branch's own OQ17 note says "Discount therefore does not say that a full-identity move is no tax event"),
   and Yahav (OQ17) calls any transfer a potential tax event. Name the banks in both places (for example: "Leumi and Massad say
   a move to the same holder is no tax event; Discount lists it apart without saying so; no official text says it").
2. **TXI-26 closes in its title what its body leaves open.** The title and the new summary line say "no provision lets the lost
   principal reduce tax". The body says only "no provision read", and its conditions keep a route open: if the lost principal is a
   capital loss (s.88), s.92 and circular 10/2025 s.3 would let it offset capital gains in a return, and open question 14 lists
   "whether a deposit's lost principal is a capital loss at all" as still open. s.92 is itself an express provision, so s.245(א)
   does not decide the point. Reword title and summary line to what was read, for example: "no provision names a deposit's lost
   principal; it reduces no tax at the bank, and whether it is a capital loss against capital gains is open (OQ14)".

## Should fix

1. TXI-26 cites s.88 "הפסד הון" at p.149; the definition is on file page 150 (the Ordinance PDF; OQ15 in the same file already
   says p.150). The library index also gained a cite of that quote on p.149: the `cite` check matches words anywhere on the page,
   and these common words also occur on p.149. Change the link to #page=150 and drop the p.149 cite entry.
2. TXS-40 misses what Massad's own form says on p.2, item 1: on a move to another TASE member, the purchase prices ("לרבות השערים
   בהם נרכשו ניירות הערך על ידינו") pass through the TASE clearing house to the other member. That is the bank's statement of how
   cost usually reaches the receiver and bears on TXS-39's "what the receiving institution records when no cost reaches it". Add
   it (scoped to Massad). Also cite p.2 for Massad's "שער עלות אפס" (it is not on p.1). Optional: Interactive Israel's page
   (library ae1286aa5939471a) says cost data may not transfer automatically and the holder should check.
3. TXS-40 conditions say "None cites a law ... for a move between one's own accounts". Leumi writes "החוק קובע" that identical
   transfers go first in, first out, without naming the law. Say that it asserts a law and names none.
4. TXS-39 route (1): form 747 binds the declarer to file a return for the year of the sale and attach the form ("מתחייב להגיש
   דוח מס עבור שנת המס בה ימכרו ניירות הערך"). Add it; it changes what route (1) costs the holder.
5. TXS-39, the move from a foreign broker to an Israeli member: the forms cover "נייר ערך נסחר בבורסה" held by an Israeli TASE
   member; whether a foreign-listed security qualifies is not stated. Say so beside the existing "inferred".
6. TXS-40 and SW-55 now hold the same unsettled claim in two files (three banks here, two brokers there). SW-55 and SW-36 do not
   point to TXS-38 to TXS-40. The switching file's owner should add the pointers or fold one into the other.
7. Nit: TXI-26's Dimensions line uses backticks; the rest of the TXI file does not.

## Not a finding

- The 2002 and 2005 regulations are cited from btl.gov.il, as in the rest of both files; a Reshumot link would be the official
  publication, but this is not new to the branch.
- A web search (gov.il, banks) found no Tax Authority instruction on same-holder moves; the FIBI form repeats Massad's wording.
  Open question 17 stays open, as the branch says.
