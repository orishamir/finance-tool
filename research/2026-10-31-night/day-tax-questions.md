# Tax open questions against the library, and seven researched (2026-10-31)

Web lookups used: about 18 of the 40 allowed. Nothing was committed. Files changed:
`tax-general.md`, `tax-interest-deposits-bonds.md`, `tax-securities-foreign.md`,
`tax-securities-israeli.md`, `tax-hishtalmut.md`, `tax-gemel-lehashkaa-ira-child.md`
under `.claude/skills/il-finance/references/`, and `research/library`.

Page numbers are file pages of the PDF. `npm test` and `npm run validate` pass.

## Job 2: the seven questions

### Foreign broker, half-yearly advances paid: must the saver file? (TXG Q4)

**Answer on the texts: yes, the saver files. No Tax Authority sentence says so for this saver; it is a reading. One case stays open.**

- Half-yearly advances are not the exemption's "מקדמת מס". Exemption Regulations reg.1 (1e08d2496afde076, p.2): "מקדמה לפי הוראות תקנות מס הכנסה (מקדמות בשל הכנסת חוץ), התשס"ד-2004, שצורף אליה דו"ח בדבר דרך קביעת המקדמה".
- The half-yearly advance has another basis, which presupposes the filing duty. Ordinance s.91(ד)(2ג)(ב) (6deb4dc4ee99460c, p.92): "והמוכר חייב בהגשת דוח לפי סעיף 131".
- Guide 2025 (5012033e55e0c415) p.48: "אם לא נוכה המס כאמור, הינך חייב בהגשת דוח שנתי". Forms 1322 and 1326 send these sales to the return's appendices.
- Other exceptions that end the exemption (reg.3(א), 1e08 p.2): paragraph (5) a duty to file for the previous year on another ground (read here as a one-year tail; my reading), (6)(א) rights in a foreign company not traded on an exchange, (6)(ב) other foreign assets of 1,500,000 or more before indexing, (7) foreign bank accounts, (8) surtax.

**Still open:** a saver who pays only the 30 April advance. Guide p.5 admits this in general words; p.48 sends him to a return; nothing reconciles them. If he is exempt, s.91(ד)(2ג)(ב) does not apply on its words and the 30-day report of s.91(ד)(1) could revive. The service page itc5329b answered 403 and was left (in the tried list). **Would settle it:** a Tax Authority sentence, or that page's text.

### Is an accumulating foreign fund taxed only on sale? (TXF Q1)

**Not settled.** Read: circular 10/2025, circular 7/2003 (p.21 s.4.4, already recorded), circular 18/2002, the July 2026 team report (d73fb55de4bc9007), the 2021 reform committee report (9e9d636407f30305: two hits on fund words, none on foreign mutual funds). Circular 9/2025 (18a2702262ad80dd) is about options and does not apply. One support for TXF-11 on controlled foreign companies: 9e9d p.36, "חבר בני אדם ש-30% או יותר מהזכויות בו או מהון המניות שלו נרשמו או הונפקו למסחר בבורסה לא יסווג כחברה נשלטת זרה". TXF-11 and TXF-31 keep their status. **Would settle it:** a Tax Authority ruling or circular sentence.

### Accrued interest for a private buyer of traded government bonds (TXI Q5)

**Not settled, narrowed.** Circular 22/2002 (365540f0f2e29e39) p.19 s.2.8.1: "דמי הניכיון יהיו חייבים במס, כהכנסה לפי סעיף (4)2 לפקודה, בידי מי שפדה את איגרת החוב"; "הריבית שמקורה באיגרת החוב תהיה חייבת במס, כהכנסה לפי סעיף (4)2 לפקודה, בידי מי שקיבל אותה". It is from 2002 and does not address the seller's part under s.3(ח). No order under s.3(ח1) found. Web search gave a bank's page and secondary sites only. **Would settle it:** an order in Reshumot or a Tax Authority circular. Small in money: part of one coupon.

### Is 15% on unlinked interest fixed from age 60? (TXI Q9)

**Not settled.** Ordinance (4d9d397e88b5931d) p.204: s.125ג(ב) "בשיעור שלא יעלה על 25%" against s.125ג(ג)(1) "תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%". The guide distinguishes maximum and fixed rates in general (p.40) and has a sentence on age 60 only for capital gains (p.48). Directives 05/2022 and 05/2024: nothing. Web search: secondary only, none on age. The wording supports 15% at every age; that is a reading. **Would settle it:** a Tax Authority sentence or a form 1301 computation note.

### Does the low-income exemption reach current-account interest? (TXI Q11)

**Not settled, narrowed slightly.** Directive 05/2022 (7b4f220fcf10ac57) p.38 s.9.3: "הבנקים מעבירים לרשות המיסים מידע במהלך השנה על רווחים מריבית על פקדונות ותוכניות חיסכון רק לגבי הזכאים לפטור ממס על פי סעיף 125ד(ג) לפקודה". It does not name current accounts, while another part of the Ordinance's definition of "חשבון פיקדון" names "חשבון עו"ש" (6deb p.131): a hint only, since that definition is limited to its own part. Knesset research (a89d74fe83877716) p.8 has no tax analysis. Stopped: the money is small. **Would settle it:** form 867 instructions or a Tax Authority sentence.

### Tax when a deposit or savings plan is broken early (TXI Q14)

**Not settled.** Searched the library's official documents, the Bank of Israel's disclosure text and directives 221 and 425 (they govern the penalty, not tax), the 2005 regulations (2d313d18dfed9653 p.2, reg.4: "תאגיד בנקאי המשלם ליחיד ריבית ינכה"), and the web. TXI-07 stays a reading: no special rule, only interest paid is taxed at a break. **Would settle it:** a Tax Authority sentence or form 867 instructions on when interest counts as paid.

### Loss on withdrawing a kupat gemel lehashkaa below deposits (TXK Q10)

**Not settled, narrowed.** s.3 (4d9d p.21): "שמשך יחיד מקופת גמל להשקעה, יראו אותם כהכנסה מריבית". The final team report (d73fb, p.10): "ללא אפשרות קיזוז רווחים הנובעים מקופת גמל להשקעה או פוליסת חיסכון כנגד הפסדי הון מחוץ לחשבון ההשקעה"; p.11: "ללא אפשרות קיזוז הפסדי הון כנגד תשואות שנצברו בקופת גמל להשקעה ופוליסת חיסכון". The Tax Authority's director was a member (p.2), but these are recommendations for a planned regime, read in a capitax copy, and they speak of gains against outside losses, not of a loss on withdrawal. A secondary page (bshcpa.co.il) says no offset; it closes nothing. **Would settle it:** a Tax Authority circular or guide item.

## Job 1: matched against the library

| Question | Result | Evidence |
|---|---|---|
| TXG Q9, Tax Authority circular on the surtax | Closed | Directive 5/2025, f31aa82bcf2983ba p.1 |
| TXG Q11, return deadline 2025 | Closed; TXG-24 updated | Guide p.10 (30.4.2026, 31.5.2026); the 31.3.2026 is the micro-business report, p.8. s.132 and extensions not read |
| TXI Q6, deflation | Closed | Circular 10/2025 appendix, 9ab261ff65e00be3 p.9, and TXS Q15 for capital; TXI-25 for interest |
| TXI Q12, retirement age | Closed: 67 | Ordinance 4d9d p.205; Retirement Age Law s.4, d7fefd69f3d6b005 p.1; guide p.92 |
| TXF Q17, gov.il link of circular 04/2026 | Closed | 990c91e3270bb60c |
| TXH Q14, s.124ד memorandum | Closed: not in the Ordinance | 6deb has no s.124ד; 4d9d p.7 |
| TXS Q1, tax track of money-market funds | Format only (closed 2026-10-22 by TXS-24) | Already in its text |
| TXG Q8, indexation on 1.1.2028 | Narrowed | Exact wording, 6deb p.118; no explanation held |
| TXI Q3, makam discount | Narrowed | 22/2002 p.19 (taxed at redemption), p.20 (old exemption); 20% unresolved |
| TXI Q4, foreign-currency deposit withholding | Narrowed | 4d9d p.204, p.146; 2d313 p.1; Supreme Court 7486/14 p.2 on 2007 facts |
| TXI Q13, 39,605 or 39,606 | Noted, not chased | 1 NIS; 4d9d p.205, guide p.43 |
| TXI Q17, exact wording | Noted | Text copies now held |
| TXF Q12, conversion rules | Noted | Not held; cited in 87ec408c7abc4145 p.5, p.18 |
| TXF Q21, foreign asset trigger | Narrowed | Definition, 1e08 p.2; silent on a foreign security held through an Israeli bank |
| TXS Q5, payer's offset | Narrowed | 2002 regulations reg.9(א), 8b5fffa5abbe8104 p.2 (capital gain only); guide p.41 stays alone on interest and dividends |
| TXH Q7, reduced ceiling | Narrowed | s.17(5א), 4d9d p.62: no reduction there |
| TXH Q10, order of withdrawal | Narrowed | Rule 41יג(ב)(1), c1a910e7108c3769 p.16: pro-rata for s.87 payments |
| TXH Q12, currency of the legislation | Narrowed | Official copies held |
| TXK Q6, s.9(18ב) | Narrowed | Printed as current, 6deb p.23, 4d9d p.45; the High Court decision not read |

Questions checked with no match: 48 of the 74 unstruck questions, listed here. TXG Q1, Q2, Q3, Q10, Q14; TXI Q10, Q16; TXF Q2, Q3, Q4, Q7, Q8, Q9, Q10, Q11, Q13, Q14, Q15, Q18, Q19, Q20, Q22; TXS Q3, Q4, Q8, Q9, Q10, Q12, Q13, Q16, Q17, Q18, Q19, Q20; TXH Q2, Q4, Q6, Q8, Q9, Q11, Q13; TXK Q1, Q3, Q4, Q5, Q7, Q8, Q9. TXG Q2: National Insurance Law s.335 was located (c6681353c3ff86ab p.233), not read for its answer.

## For the lead

- No rule the site shows is contradicted. `data/rules/txg-20.json` says whether the annual advance can replace the return was not found: still true.
- `data/open-questions.json` is behind the rule base (validate warns, 7 items): run `npm run gen:open-questions -w @finance-tool/pipeline`. TXG-19, TXG-20 and TXG-24 source text changed: `extract:sources` may be due.
- Rule sources that cite the capitax copy of circular 04/2026 can move to the gov.il link. I did not change them in this pass.
- New library documents: 7b4f220fcf10ac57, c087d58a3b87394c, 9e9d636407f30305, a89d74fe83877716, 18a2702262ad80dd, d9d43c2338644b31.
