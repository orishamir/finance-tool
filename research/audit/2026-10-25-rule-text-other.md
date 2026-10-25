# Rule-text pass, non-tax files (2026-10-25)

Agent R-text-other. Brief: correct the rule texts that the source check (`research/audit/2026-10-25-source-check.md`,
sections 6 and 7, and the family parts) found contradicting their now-official sources, in 16 rules of nine non-tax
files. Every change below was made from the official text, opened today; "p.N" is the PDF file page. Each changed
rule carries a dated `*2026-10-25 rule-text pass:*` note in its Conditions line. The rule base and the JSON record
(`text_he`, and `title_he` / `figures` where they changed) were edited together. Hebrew text keeps the house style of
not typing digits in `text_he` where the existing record avoided them.

## Per rule

### IRA-18 (ira-self-directed.md): moved to the 2017 wording
- Old: at least four participants; a related party at most 20% of commissions and no dearer than the unrelated winner;
  whether a member may use another broker "not found" (open question 5).
- New: reg. 12 as replaced by קובץ התקנות 7880 (Reshumot file `iXRl3JX…mJM=`): (א) at least eight participants, at
  least every three years, equal chance for all (p.2); (ב) a related party only if its commission is no higher than
  the unrelated winner's, no percentage cap (p.3); (ג) trades may go through a broker the member chose, even one that
  lost or did not take part, if the member was shown the winners' terms (p.3). Transitional rule s.2 (p.3) recorded.
  The 2009 (6820 p.6) and 2010 (6901 p.2) wordings kept as history. Title now names the member's own broker.
- Figures: `min_participants` 4 → 8, source ק"ת 7880 p.2, reg. 12(א), checked 2026-10-25.
  `related_party_commission_cap` (20%) removed with its Hebrew name: the schema has no "no longer in force" flag
  that the rule card would honour (only `effective_to`), and nothing in code, tests or other data reads the key.
  Validation and all tests pass.
- Open question 5 closed.

### PEN-19 (pension-and-gemel-lekitzba.md): 2025 values
- Old: 2024 values "CMA report table ד-13".
- New: values for the year 2025 from the CMA report for 2025, chapter 4, table ד-14, p.12: Infinity 0.14%,
  Altshuler Shaham 0.02%, Mor −0.06%, Phoenix 0.01%, Meitav 0.13%, Clal −0.03%, Harel −0.03%, Migdal Makefet Ishit
  0.09%, Menora Mivtachim −0.28%; the same table's 2024 column (the former values) kept and labelled. The quarterly
  demographic credit checked in Mor bylaws s.109, p.73. The record has no figures object and `text_he` names no
  values, so only `checked` changed in the JSON.

### PEN-36 (pension-and-gemel-lekitzba.md): quote wording
- Old: item 7 quoted as "לרבות הפרשות המעסיק לקופת גמל", cited to the 2008 law.
- New: the 2008 text reads "לרבות הפרשות המעביד לקופת גמל" (Wage Protection Law amendment 24, p.6); "המעביד"
  reads "המעסיק" since the 2014 term-change law (p.2 s.1; p.5 schedule item 11). `text_he` has no quote; `checked` set.

### SW-05 (switching-and-transfers.md): start of the three business days
- Old: three business days "of the determining date".
- New: three business days "ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה" (circular 2017-9-17, s.3(ז), p.2); the
  copy to the member runs from the same day and may go by e-mail with consent; the receiving fund passes the request
  within two business days of the determining date (s.3(ו), p.2). Annexes E and E1 re-read (pp.20-21).
- JSON: `text_he` start point corrected (keeps "נספח ה׳", which the switching guide picks out); the stale closing
  sentence "חוזר הרשות נקרא מעותק אצל צד שלישי" removed (the circular is now read on gov.il); figure note corrected.
  The figure value (3) is unchanged.

### SW-21 (switching-and-transfers.md): who says a transfer is untaxed
- Old: "transfers between gemel lehashkaa funds are not taxed (TXK-04)" with Ordinance s.3(ה4)(3) as a source.
- New: the no-tax point is TXK-04's inference from the wording of the tax on amounts withdrawn, stated outright only
  by Harel ("ללא אירוע מס"); s.3(ה4)(3) (Tax Authority text, p.21) taxes withdrawals as interest and does not
  address transfers. Source line annotated accordingly. Transfer routes re-read in ק"ת 8735 p.2.
- JSON: `text_he` says the same; the stale "sources read on a copying site" clause removed.

### SW-25 (switching-and-transfers.md): what changed after circular 1356
- Old: pointer rule, "no new source read"; circular 1356 cited at p.21.
- New: circular 1356 (30.11.2016) says bank savings can move neither to another bank nor to a provident fund
  (pp.22-23, where the question actually is; p.21 corrected). The change: amendment 247 of the National Insurance Law
  added s.74ב(א)(2א), in force 1.1.2025 (NII consolidated law text p.50 and its footnote 32): a parent may, once only,
  have the amounts deposited in a gemel lehashkaa from then on; what accumulated stays at the bank. NII's change page
  and FAQ re-read (bank saving can be stopped and a second saving opened in a provident fund; no move to another
  bank; before 18 the parent acts, after 18 only the child). Source line: the law page added, the circular's page
  and status corrected.

### BANK-01 (bank-current-account-deposits.md): "and" became "or"
- Old: a current account must be opened and run "as long as the account is in credit and the customer meets the
  account agreement".
- New: "כל עוד מתקיימת אחת מאלה": either condition is enough (Banking (Customer Service) Law s.2(א)(2), BoI
  consolidated text `media/nvadftgk/150.pdf`, p.4). Directive 417 p.1 s.1(א) re-read.

### CS-03 (child-savings.md): where each amount comes from
- Old: "law 74ב(א)(1) bracket 'בשנת 2026, 58 ש״ח'".
- New: the law holds only the base amount of 50 shekels (s.74ב(א)(1), NII consolidated text p.50); the bracket was a
  Wikisource editor note; the current 58 rests on NII's savings-amount page ("מופקדים 58 ש"ח מדי חודש"). Reg. 12
  (7727 p.10), the 2025 freeze (74ה(4), p.52, added by amendment 252), the NII 2025 report (57, p.1) and the FAQ
  quote re-read. JSON: the figure note corrected; value unchanged.

### CS-12 (child-savings.md): amendment and start date
- Old: amendment number and start date "not read" (open question 14).
- New: s.74ב(א)(2א) was added by amendment 247, in force 1.1.2025 (NII consolidated text p.50, footnote 32).
  Open question 14 closed; figure note and `text_he` updated. The NII 2025 report figures (98,119; Hapoalim 40.9%,
  p.2) re-read. Not re-opened by me: Bank Yahav's agreement s.4.6 (the URL now answers with a redirect that curl could
  not follow); the source check opened it today.

### INS-25 (savings-policies-and-executive-insurance.md): singular quote and definition chain
- Old: reg. 6א(א) quoted with the plural "פוליסות ... שאינה קופת ביטוח"; definition said to end in regulations
  "marked repealed (ק"ת תשפ"ג 1990) on the mirror".
- New: the current opening is singular, "מבטח המנפיק פוליסת ביטוח חיים משתתף ברווחים שאינה קופת ביטוח" (ק"ת 7131
  p.9; the rest of (א) from 6284 p.3); the 2012 wording does not apply to contracts made before 1.1.2013 (7131 p.9,
  s.3). Chain re-traced on the gazette: 1995 reg. 1 (5682 p.2) → 1986 investment regulations, repealed and replaced
  in 2001 (6094 p.22, reg. 66) → 2001 reg. 1 (6094 p.8) → 1998 report-details regulations (5884 p.2), repealed by
  regulations signed 20.6.2023 and published 28.6.2023 (10695 p.2; "1990" was its gazette page). Reg. 6א(א2) re-read
  (6609). Where the definition lives now: still open (open question 1, narrowed). `text_he` now says so, and uses the
  regulation's term "ביטוח חיים משתתף ברווחים".

### GOV-01 (government-bonds-and-makam.md): no balance cap; s.6 wording
- Old: "Section 1 sets an outstanding-balance cap in the law"; repeals "marked on the Nevo page"; s.6 paraphrased as
  "monetary goals"; `text_he` said the law was read on Nevo.
- New: the cap (10,000 million shekels in 1984, changed by amendments up to 1995) was deleted from s.1(א) and
  s.1(ב)-(ד) were repealed by the Arrangements Law 2002, amendment 8 (ספר החוקים 1831, p.27), so the law sets no
  cap. The other repeals now cite their amending laws: s.8(ב) amendment 5, 1991 (p.2, s.3(2)); s.9 amendment 6, 1995
  (p.2, s.2); s.7(ב) amendment 9, via s.80א added in 2002 to Ordinance amendment 132 (ספר החוקים 1881, p.17, s.58).
  s.6 now in its 2010 wording (to achieve the Bank of Israel's goals and functions under ss.3-4 of the BoI Law 2010;
  ספר החוקים 2237, p.23, s.92). Four Knesset files added to the Source line.

### GOV-13 (government-bonds-and-makam.md): the regulations exist
- Old: "the regulations for this type were not found"; "שחר" only from Wikipedia.
- New: the 2006 "אג"ח ממשלתית" regulations (קובץ התקנות 6457, pp.2-3, amended 6597 pp.4-5) set: fixed annual rate in
  hundredths of a percent, price near 100 at first issue; face value NIS 1,000 or multiples; sale by tender through
  banks, TASE members and approved bodies; twelve-month interest periods paid on the last bank business day of the
  month (a yearly coupon); record date end of the 20th; buyers after it get no interest for the period; term at
  least one year (two in 2006). The "שחר" type has separate 1995 regulations, amended 2006 (6457 p.10) and 2007
  (6597 p.6); their base text (ק"ת התשנ"ה p.1590) was not read. That today's "ממשלתית" series fall under the 2006
  regulations is labelled an inference (name, and the parallel "צמודה" regulations used by GOV-10/11). Open
  question 4 narrowed. Figure `linkage` note updated; value unchanged. Four gazette links added.

### GOV-20 and GOV-21 (government-bonds-and-makam.md): final 447A
- Old: written from the 12/2024 draft; the shown yield "does not include buy and sell commissions"; the final text
  and start "not read" (open question 10); `text_he` said part rests on a draft.
- New: final ניהול בנקאי תקין 447A (04/25), version 1, circular 2813 dated 09/04/25 in its update table (p.3; the
  text names no other start date). Annex ב note 2 (p.6): the yield is gross and excludes buy and sell commissions
  "ומס רווחי הון". GOV-20 also records the channels (s.6: website, public and personal area, and app). Open question 10
  closed. GOV-21 says capital gains tax is not deducted from the shown yield either; its `title_he` names tax; the
  makam auction conditions were re-checked for any fee clause (none).

### MF-11 (mutual-funds-and-money-market-funds.md): Amendment 33
- Old: "A distributor may not refuse to distribute units of a fund whose prospectus the ISA permitted (the mirror
  marks an exception from 2.2.2027)"; s.44(ב) "rules".
- New: the current s.44(א) (ISA consolidated text p.36) bars refusal "מטעמים הקשורים בקרן או במנהל הקרן". Amendment
  33 (חוק לעידוד פעילות בשוק ההון (תיקוני חקיקה), התשפ"ו-2026, ספר החוקים 3579, s.3(5), p.3) deletes those words and
  changes "בכללים" to "בהוראות" in s.44(ב); s.3 takes effect six months after publication on 2.8.2026 (s.4, p.8),
  i.e. 2.2.2027. Its s.49(ד) change belongs to MF-16, not this rule. Open question 4 (days until redemption cash is
  usable) stays open.

### BRK-07 (brokerage-account.md): quote and stale remark
- Old: quote "הנכסים הפיננסיים"; `text_he` said the text was read from the 2018 amendment, not the current rules.
- New: quote "חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו" (guidelines s.26ג(1), p.96);
  "חבר ינהל חשבון נפרד לכל לקוח" (rules s.25ו, p.34). The rest re-read in the current guidelines (s.26, pp.95-102),
  which also allow the member to pledge a client's portfolio to itself when it gives the client credit or a
  guarantee (s.26ג(4)); that was added. The stale remark removed from `text_he`.

## Figure changes reverted

None. The only value change (IRA-18 `min_participants` 4 → 8) and the removal of `related_party_commission_cap`
broke no golden or engine test.

## Site tests

`npx vitest run site/app/lib/playbook.test.ts`: 17 passed after the SW-05, SW-21 and SW-25 changes. Also run:
`npx vitest run packages/engine` (291 passed, 1 todo), `npx vitest run site/app packages/pipeline packages/schema`
(498 passed), `bash research/audit/tools/extract-locked.sh` (sources regenerated, 500 rules, `data/ is valid`).
The validator warnings shown are pre-existing and not from these rules.

## For the lead (outside my files)

- `ira-self-directed.md` summary (line 10) says "The member picks a broker from the winners (IRA-18 …)"; since
  2017 the member may also pick a broker outside the winners (reg. 12(ג)). The same wording is in the notes of
  `data/instruments/wrappers/ira-hishtalmut.json` and `ira-provident.json` (brokerage fee note), and in the older
  `research/knowledge/ira-self-directed.md`.
- `docs/glossary.md` "הליך תחרותי" still cites the Nevo IRA regulations; 7880 is the current text.
- GOV-21 cites the makam auction conditions as "pp.1-17"; the file now has 23 pages (no fee clause anywhere in it).

## Counts

- Rules in scope: 16. Rule text changed in the rule base: 16. `text_he` changed: 13 (all but CS-03, PEN-19, PEN-36,
  whose Hebrew text had no wrong statement); `title_he` changed: 2 (IRA-18, GOV-21).
- Figure values changed: 1 (IRA-18 `min_participants`); figures removed: 1 (IRA-18 `related_party_commission_cap`);
  figure notes corrected: 5 (IRA-18, SW-05, CS-03, CS-12, GOV-13).
- Source lines changed: 4 (SW-21, SW-25, GOV-01, GOV-13); new official links: 9.
- Open questions closed: 3 (IRA 5, CS 14, GOV 10); narrowed: 2 (GOV 4, INS 1).
- Record `checked` set to 2026-10-25: 16.
- Reverted figure changes: 0. Failing site tests: 0.
- Still open: where "ביטוח חיים משתתף ברווחים" is defined now (INS-25); a Finance Ministry statement that today's
  "ממשלתית" series are issued under the 2006 regulations, amendments after 2007, and the 1995 "שחר" base text
  (GOV-13); days until redemption cash is usable (MF-11).
