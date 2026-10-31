# Domain open questions against the library, and two researched (2026-10-31)

Web lookups used: 23 of the 40 allowed. Nothing was committed. Files changed:
`etfs-and-index-funds.md`, `mutual-funds-and-money-market-funds.md`, `brokerage-account.md`,
`bank-current-account-deposits.md`, `bank-product-names.md`, `keren-hishtalmut.md`,
`kupat-gemel-lehashkaa.md`, `government-bonds-and-makam.md`, `provident-family-common.md`,
`regulators-and-protection.md`, `tracks-catalogue-and-decoder.md`
under `.claude/skills/il-finance/references/`, and `research/library`.

Page numbers are file pages of the PDF. `npm test` and `npm run validate` pass.

Counts: 12 closed (2 of them only struck, already answered by a rule), 21 narrowed, 16 rule-text edits. Every Hebrew quote in the edits was checked by script against its page's text. Hebrew in this file keeps the source's own spacing, glued digits included.

## Job 2: the two questions

### What happens to clients' assets if a non-bank exchange member fails? (REG Q9)

**No text in force states the outcome. Segregation plus trust points to clients' assets staying outside the member's estate; that is derived, not stated. No compensation scheme exists. The only express statement is in a bill.**

- In force: the TASE rules hold a non-bank member's client assets apart and in trust (REG-16, BRK-07, BRK-08), and the Trust Law s.3(ב) keeps a trustee's creditors away (already in the question). This is the derivation.
- Insolvency Law s.216, e1677018d0a1e558 (Wikisource, a secondary copy): "נכסי קופת הנשייה יכללו" ... "כל נכס של התאגיד". I found no words on assets held in trust.
- The bill, 7c4cec43605120e4 (הצעת חוק הסדרת העיסוק בשירותי מסחר בניירות ערך, התשפ"ה-2025, הצעות חוק הממשלה 1884, 9.7.2025). P.30 s.33(ב): "לא יראו ניירות ערך וכספים של לקוחותיו של בעל רישיון" as the licensee's assets, including in insolvency or winding-up. P.14: "גם לאחר שגופים אלה יקבלו רישיון" (non-bank members will also take a licence). P.31 s.34(א)(7): the ISA may direct on moving a client's activity. It is a bill: enactment not shown, and the Knesset's database was not checked.
- Final joint report 08/2019, bac1ca2df2733bdb, p.22: "נכסי הלקוחות מוחזקים בחשבונות נאמנות"; "עד היום לא התרחש אירוע של כשל פיננסי"; "היעדרם של ביטוח פיקדונות וסכמת הגנה על נכסי לקוחות בישראל". P.33: "אנו ממליצים על הקמת צוות בין-משרדי". These are 2019 facts; I found no evidence that the team was formed or a scheme set up. The draft, 8bc7bfb3789100f6 p.26-27, recommended a scheme directly.
- TASE rules, 79b044f3666211de p.47 (s.80): "פגיעה בלקוחות החבר". Guidelines, e11b273c45f15a3c p.20 s.6ד': "ביטוח אחריות מקצועית", extended to dishonesty, fidelity, computer crime and forged documents. My reading: this covers liability for acts, not insolvency as such.
- Committee final report 29.12.2011, fad7fdf7e3b98ee1 p.5: "החליטה הועדה שלא לקבוע כלל אחריות במסגרת המלצות הועדה", leaving it to the general law. P.13 ss.6-11: segregation, records, reconciliation, no lien without consent, client cash.
- Looked at and not applicable: the payment companies law, cdaf3daf1531194e p.144 (an analogue only); b94125c55a6c4ea2 and 2ca833d7fb7d0815 (money laundering).

**Still open:** who moves the accounts, who bears a shortfall, any court decision, whether the 2019 team was formed, the bill's progress.

**Would settle it:** an enacted law or a TASE or ISA text on a member's failure; a court decision; the Knesset's page for the bill.

### How is breaking a savings plan priced? (BANK Q12)

**No general price. Each bank sets its own. Six banks read; this is a count of those, not the market. The general rules stay as they were: BANK-02, BANK-06, BANK-28 and directive 221 note 38.**

- Fine at the rate in use on the day, rate not stated. Bank of Jerusalem, 2bdc0fe33195b23b p.22: "בקנס שבירה בשיעור שיהיה נהוג בבנק במועד השבירה"; p.16 "ובכלל זה חסכונות" brings savings in. Discount, 36453fb2c2b8e702 p.36: "קנס השבירה נתון לשינויים תכופים", "הלקוחות מוותרים על כל הרווחים"; the formula is BANK-33. Discount's text is about deposits; its plans were not read separately.
- Table in the plan form. Bank of Jerusalem, ee68e256b063378f p.1 (שבתאי צמוד מדד ל-5 שנים עם תחנות, 08/18, so old): at "תחנת היציאה" only, on 30 days' written notice; after two years "80%מהריבית" and all the linkage, three years 85%, four years 95%.
- No interest at all. Yahav, 322ff632b328571c p.36: "לפנים משורת הדין", no interest or linkage on the part withdrawn and paid interest set off; p.38 "תוכנית חסכון" extends it to plans.
- Damage clause. Hapoalim, 5164629834e3d870 p.22: "שבירת הפיקדון עלולה לגרום למפקיד נזק"; p.24 "שלא בתחנת יציאה". Its plan structure is BPN-10.
- Rate ladder and no exit points. Mercantile, 1d8ca6d4396851bd (rates from 3.9.26): "תחנות יציאה - אין"; month to 3 months 0.30%, 12 to 24 months 0.75%; "ריבית אי רצף תרד ב-0.04%".
- Reduced rate. Mizrahi-Tefahot, 9013a7d9f3fdec72 (a children's page, one deposit): "במשיכה לפני תום התקופה תשולם ריבית מופחתת".
- No answer in what was read: Massad 799451be3ded1425 (no break price), Leumi 92690e4986a08814 (no break clause), FIBI. One Zero's monthly deposit PDF answered 403 and was left there.

**Still open:** each bank's current fine rate; plan terms of Leumi, Mizrahi-Tefahot, FIBI and One Zero.

**Would settle it:** those plan forms, or a published fine table.

## Job 1: matched against the library

| Question | Result | Evidence |
|---|---|---|
| ETF Q1, TASE hours for ETF units | Closed | 57c057ab60c247db (doc. 274701, table to 4.1.26) p.4 "יחידות בקרנות סל בשוק המניות", p.5 Hol HaMoed |
| ETF Q2, market makers' duties | Closed | 57c057ab60c247db p.10 "עשיית שוק סטטוטורית בקרנות סל", p.11 table, p.12 "נוכחות בספר הפקודות", p.13 |
| ETF Q17, amendment number | Closed | ISA staff opinion 977f40c3a803b4a4 p.11 "בתיקון 23לחוק משנת 2014"; capitax 59fff7c1f490ac22 (secondary). Amendment text not read |
| ETF Q8, variable fee | Narrowed | Meitav 1f2f7020a8f8a0a3 p.118 "הוראת רשות מיום" 23.8.2018; Harel 48f7904df9597bb2 p.80; More p.62, Analyst p.41, Yalin p.46, Kesem p.75, Migdal p.60, Altshuler p.6, IBI p.72 (image). Directive not held |
| ETF Q18, hedged classes | Narrowed | a7626f6e68025ae7 (CSPX page); f8089f5a78e06c48 p.9. BlackRock's own; cost not read |
| ETF Q21, custody directive | Narrowed | Meitav p.39; ISA draft 3e8d3bc3266cc6fc p.18 "הוראת הקסטודי". No ISA copy held |
| MF Q7, load and redemption deduction | Narrowed | Count over nine managers: 4 none (Altshuler p.6, Analyst p.41, Yalin p.46, IBI p.72 image), 2 one fund (Migdal p.59, More p.61), 3 a named list (Meitav p.117, Kesem p.74, Harel p.76). Not a market share |
| MF Q3, designated hours and Fridays | Narrowed | Meitav p.7, More p.6, Analyst p.6, Yalin p.8; law d386a692cce2ad86 p.37. Clearing rule on hours not read |
| MF Q5, 1 January fee rule | Narrowed | Altshuler p.6 "בהתאם למתווה אשר גובש"; Kesem p.9; 0764882a5d0bd708 p.1. Outline not held; fits MF-17's "voluntary" |
| MF Q14, קפ"מ funds | Narrowed | ISA proposal 3fe4281fbcefe9ca p.9 "שאין קרן מסוג זה שמוצעת כיום לציבור", dated July 2023 |
| BRK Q6, 2011 custody report | Closed; rule edited | fad7fdf7e3b98ee1 p.5, p.13 |
| BRK Q7, Interactive Brokers pages | Struck | Already closed by BRK-35 |
| BRK Q18, Meitav Trade tariff | Closed; rule edited | 3ec196cf860a522c p.2, p.3 "דמי ניהול פיקדון"; f57d393657c2d282, 697ecc32a2bdcfa4 disagree on custody |
| BRK Q2, broker-dealer bill | Narrowed | 7c4cec43605120e4; later stages not found |
| BRK Q4, other banks' custody terms | Narrowed | FIBI 30db20eaa1f2c615 p.3 "על שם החברה לרישומים", p.4 "בערך שווה מאותו הסוג". FIBI's own |
| BRK Q5, a bank's failure | Narrowed | fad7fdf7e3b98ee1 p.5, p.13; no outcome stated |
| BANK Q13, פק"מ | Struck | Already closed by BANK-30 |
| BANK Q14, definition of prime | Closed; rules edited | Interest Order 73edd782c3bae359 p.2 "ריבית בסיסית תעריפית". Footers of 2002-2003, currency not checked |
| BANK Q4, consolidated law | Narrowed | 6bec2669429eb562 p.2 "31.3.2026", p.37 "פרסום נתונים" |
| BPN Q10, Hapoalim חיסכון גמיש | Closed | 7d20ea72363882fc p.1 "תקופה כוללת של עד 24חודשים", "בניכוי מרווח קבוע"; cc4db5c54a19e635 |
| KH Q4, loan terms | Narrowed; rule edited | 21e9df98352ebbf9 p.9 "כספים לא נזילים בקרן השתלמות"; 993064f583c71825 p.45; bylaws 198f860765e1341d p.10, 0a3aebbc03fc067d p.11, 5c541c524f825912 p.11 |
| KH Q7, 1997 rules | Narrowed | 60c48cdfd2efb47f p.22 (secondary). Text of the rules not read |
| KGL Q10, is 2020-9-18 binding | Closed; KGL-12 corrected | 3b8851052230e52b p.6 "מסלול השקעה כללי ומסלולי השקעה כמפורט בסעיף 6", p.12 "עד לכניסתן לתוקף של כל הוראות החוזר", p.9 |
| KGL Q13, Meitav bylaws | Closed; KGL-29 edited | 198f860765e1341d p.11 "מסלול זה הינו מסלול ברירת המחדל", p.10 "סכום ההלוואה לא יעלה על 80אחוזים", p.9 |
| GOV Q7, TASE facts | Narrowed; GOV-17, GOV-24 edited | 0b27c90213042b30 (doc. 274627) p.18 "סבב הסליקה הראשון"; 57c057ab60c247db p.4 |
| PF Q16, statement circular | Narrowed, half answered | Draft b6a36b99d6b34f51 still a draft on the list walked today (`morning-addendum.md`); gov.il copy 9f11b17b8c8dd40e |
| REG Q19, equity and insurance | Closed; rule edited | 88bee84ad057fb9d p.1 "מאתיים אלף שקלים", p.2 "היקף הבטוחה ותנאיה יהיו לפי הנדרש לדעת בעל הרישיון", p.5 |
| REG Q9 | Narrowed; REG-16 edited | Above |
| REG Q10, a bank's failure | Narrowed | fad7fdf7e3b98ee1 p.5 |
| REG Q11, Risk Fund | Narrowed | 0b27c90213042b30 p.148 "קרן הסיכונים": member's collateral only |
| CAT Q10, start-date deferral | Narrowed | 3b8851052230e52b p.1 "נדחה מועד התחילה", p.9; 3c4c0c0ea5b784c3 p.4 |
| CAT Q11, money-market period | Narrowed, unsettled | 3b8851052230e52b p.6 "עמית שבחר במסלול השקעה כספי" |

Questions checked with no match: ETF Q3, Q4, Q5, Q6, Q7, Q10, Q11, Q13, Q14, Q15, Q16, Q22 to Q29; MF Q1, Q6, Q8 to Q12, Q15, Q16, Q17; BRK Q9, Q12, Q13, Q14, Q17, Q20, Q21; BANK Q1, Q2, Q5 to Q8, Q10, Q11, Q15 to Q18; BPN Q2 to Q9, Q11 to Q17, Q19 to Q21; KH Q3, Q5, Q9, Q12 to Q15; KGL Q2, Q4, Q5, Q6, Q7, Q9, Q11, Q12; GOV Q2, Q3, Q4, Q6, Q8, Q9, Q11, Q14; PF Q1, Q3, Q6, Q8, Q9, Q12, Q15; REG Q2 to Q8, Q12 to Q15, Q17, Q21; CAT Q1 to Q8, Q13, Q16, Q17, Q18, Q20 to Q26. Left out as outside this job's scope (child savings, retirement only): PF Q4, Q13, Q14; BPN Q18.

### Rule-text changes

Each is a statement that a source I read proved out of date. Only KGL-12 now says something different from before; the others replace "not found" with what was found.

| Where | Change |
|---|---|
| KGL-12 | The ten-track limit was superseded by circular 2022-9-30; the 2020 list is now described as what applied until then |
| KGL-29 | Meitav's default is 7978 from its bylaws, not inferred (same conclusion) |
| BANK-25, BANK-34 | Prime defined in the Interest Order, as each bank's base tariff rate |
| BANK-33, BPN-10 | "Other banks not read" now points to question 12 |
| KH-21 | "No loan terms found" now points to the regulator's caps in question 4 |
| GOV-17, GOV-24 | Settlement is the next business day for exchange trades, repo excepted |
| BRK-10 and the institutions note | Committee report opened; Meitav Trade tariff found |
| REG licensee equity, REG-16 | Amounts read; REG-16 points to question 9's result |
| ETF comparison table row 14 | TASE hours now cited |

## For the lead

- **No rule the site shows is flatly contradicted.** These site records in `data/rules/` carry a "not found" that is now stale. I may not edit them:
  - `bank-25.json`: says no Bank of Israel document defining prime was found. The Interest Order does.
  - `kgl-29.json`: says Meitav's bylaws were not found and its default inferred. Found, and the conclusion holds.
  - `bank-33.json`, `bpn-10.json`: say other banks' terms were not read. Six are now read for break pricing. `bank-28.json` stands.
  - `gov-17.json`, `gov-24.json`: say the settlement cycle was not found and the clearing rules not read. Exchange trades settle on the next business day.
  - `kh-21.json`: the regulator's loan caps are now known.
  - `brk-12.json`: "כללי המסלקה עצמם לא נקראו" may be stale; I did not check it for that topic.
- `reg-16.json` and `brk-10.json` on failure stay true for text in force; `reg-16.json` could add the bill and the absence of a scheme. KGL-12 has no site record, so its correction touches no site rule.
- MF-21 "Figures: none current" could carry the count in MF Q7, if a count over nine managers is wanted on it.
- **Meitav Trade's tariff is held, but its pricing stays missing:** `data/fees/meitav-trade@2026-10-31.json` already records the custody disagreement, and it needs Meitav's answer. "Meitav Trade still missing" in CLAUDE.md holds until then.
- **Doc. 274701 has no web address.** The hours and market-making answers (ETF Q1, Q2, GOV Q7) rest on `57c057ab60c247db`, a file from an earlier research folder. Two searches did not find its link; its sibling is `https://content.tase.co.il/media/mwsduioc/274698.pdf`. Someone should record the link. Those two closures carry no rule record yet, only the sourced closure line.
- **Bill title in the index:** 7c4cec43605120e4 is still titled "הצעת חוק ניירות ערך (הסדרת פעילות ברוקר דילר)" because re-adding does not change a title. Its real title is in its digest and in the rule base.
- **Spill-over outside my list:** `corporate-bonds.md` CORP-18 says the exact times come from board decisions not read, and its question 6 asks about settlement. 57c057ab60c247db p.4 and 0b27c90213042b30 p.18 bear on both. I left that file alone.
- **For the tax-specialist:** KH Q7 and TXH Q6, the 1997 study-withdrawal rules: the Ordinance sentence is read in a secondary copy (60c48cdfd2efb47f p.22), and the rules' own text still is not.
- Stale citation: circular 2016-9-17 (21e9df98352ebbf9 p.13) cancels 2016-9-5, so bylaws citing 2016-9-5 for loans are out of date.
- `data/open-questions.json` is behind the rule base (validate warns, 19 items, some of them from the tax job): run `npm run gen:open-questions -w @finance-tool/pipeline`. Source text changed for the rules above, so `extract:sources` may be due.
- New library documents and citations: about 90 `cite` records, three `tried` lines (goldfarb.com 403; justice.gov.il ECONNRESET; One Zero's monthly deposit PDF 403), and 7c4cec43605120e4 and 57c057ab60c247db described.
