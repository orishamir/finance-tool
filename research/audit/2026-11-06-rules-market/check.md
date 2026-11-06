# Independent check: ETF-82, BRK-12, BRK-58, BRK-59 (#135, #136)

Checker, 2026-11-06, branch `rules-market` at `f14f56cc`. I did none of the work. Every cited page was opened in the library copy (`research/library/store`); the three TASE files were downloaded again today and their SHA-256 matches the library copies (274698, 274625, 274627). `npm run validate` passes; `packages/pipeline` 171 of 171 at load 5.

## Verdict: pass, with one wording fix before merge

No figure or quoted clause was found wrong, invented or taken from one company's document. Every general statement rests on the Securities Law, TASE's rules or the clearing-house bylaws.

## What was checked against the page

| Claim | Where | Result |
|---|---|---|
| ETF-82: notice via member, at most two members per manager, monthly monitoring findings to ISA and manager, publication | 274698 p.89, ch.י"ב1 ss.1-6 | as stated |
| ETF-82: exemptions (technical failure, halt, TA-35 5% and 12%, first day after closure, general manager's exemption) | 274698 p.89 s.4; p.87 ch.י"ב s.3ז | as stated |
| ETF-82: general chapter not for statutory market making; s.5א payment not applicable | 274698 p.86 opening note, p.87 s.5א | as stated |
| ETF-82: quotes at all times, minimum quantity, rounding, 100 units on an opening-parameter day, conditional and iceberg orders excluded | 274701 p.10 | as stated |
| ETF-82: eight-row table (30,000/0.6%; 30,000/1.5% x3; 10,000/3.0% x4) | 274701 p.11 | all eight rows match |
| ETF-82: five prices a side; presence 4 of 5 minutes, 100 min (60 Fri/Hol HaMoed), monthly breach 4 and 2 days | 274701 p.12 | as stated |
| ETF-82: no market making on non-calculation days, report by 30 November | 274701 p.13 | as stated |
| BRK-12: guarantee to members; excludes "ריבית ... דיבידנד" | 274627 p.44, ch.ז s.1 | as stated |
| BRK-12: Securities Law s.50א(ב)-(ג), ss.50ב-50ג | IsaFile_8276 pp.93-94, 96 | as stated |
| BRK-12: all but Bank of Israel and custodial members in the fund; formula; NIS 200 m; floor NIS 400 m; quarterly | 274625 pp.20-21, ch.ג ss.1.1, 1.2, 1.5 | as stated |
| BRK-12: share by average daily debit balance; 100% cash at the Bank of Israel; collateral "מאמצעיו העצמיים" | 274625 p.22 ss.2.1, 4.1; p.24 ch.ג'1 s.2.2 | as stated |
| BRK-12: waterfall (repo and lending collateral, risk-fund collateral, own means under ISA directive s.50ג(ב), others up to their share); s.3.3 departure | 274625 p.34, ch.ג'2 ss.3.2-3.3 | as stated |
| BRK-58: registered "על שם החבר, אשר ישמש נאמן עבור לקוחותיו" | 274627 p.6, ch.ב s.1 | as stated |
| BRK-58: client and nostro sub-accounts, "נפרד לחלוטין", move from nostro, cash "במאוחד וללא הפרדה" | 274627 p.14, ch.ד ss.1-6 | as stated |
| BRK-58: NIS 5.74 m extra equity per extra client sub-account; CPI-linked each 1 January | 274625 p.15 item (2); p.14 s.1ה | as stated |
| BRK-58: duty to prevent harm to clients; lien and set-off; exemption "או לאדם אחר כלשהו" | 274625 p.19 s.8; p.36 ss.6.1, 7 | as stated |
| BRK-59: TASE's own report, scope institution | moved from main's BRK-12 unchanged | as before |

## Must fix

1. **"The client gets nothing from it" goes beyond the bylaws** (`reg-15.json` text_he "והלקוח לא מקבל ממנה דבר"; `brk-58.json` "והלקוח לא מקבל ממנה דבר ולא שום פיצוי"). The bylaws give a client no claim on the risk fund, and that is all they support. The guarantee and the fund behind it are what let a client's trade settle when the other side's member fails (274627 ch.ז s.1, through the client's own member). So a client does benefit from it. Written flatly, especially in REG-15 where the context is not the client's own member failing, the sentence tells a reader the protection is worth nothing to them. Say what the text supports: the client has no claim on the fund, and it does not cover a shortfall in the client's account when the client's own member fails.

## Should fix

1. **ETF-82's site record cites only 274698 p.89, but the minimum quantity, maximum spread and presence rules come from 274701.** That document has no web address (the schema requires one), so a reader who opens the source finds the appointment and exemption chapter and no spread rule. This is recorded as open question 34, which waits on the founder. Until then, say in the qualifier or the text that the quantity and spread are in the board decisions, which are not linked.
2. **BRK-58 says "ואין בישראל הסדר שמפצה על חוסר כזה" with none of its own sources behind it.** The support is the 2019 joint regulators' report in REG open question 9 (REG-16). Add REG-16 to `derived_from`, or cite that report.
3. **BRK-58 says clients' securities are registered in the member's name, but the same section leaves some out:** securities deposited at a clearing house abroad, and securities in the issuer's register in the client's own name (274627 p.6, ch.ב s.1א-ג). Many readers hold foreign ETFs or shares through an Israeli broker. The markdown's inference already says "TASE securities"; text_he should say so too.
4. **BRK-12's markdown "Figures" line dates the NIS 400 m floor to the page of 12.1.23.** The floor and the NIS 200 m are on p.20, update 84 of 27.2.20; p.22 is the 12.1.23 page.
5. **BRK-12's text_he gives the default order as fixed.** The bylaws let the clearing house depart from it (s.3.3), and the markdown says so; the text_he does not.
6. **ETF-82's text_he shortens category 4 to "מדדי חו״ל שיש להם נגזרים פעילים".** The table says "נגזרים פעילים חופפים", commodities included.
7. **Merge conflict.** `rules-records` also edits `data/rules/brk-12.json` (a wording pass on the old unsettled text). Whichever branch lands second must keep this branch's rewritten record.
8. **Follow-up outside this change.** 53 data files list BRK-12 as a protection rule (for example `protection_rule_ids` on providers, used on the investing page). BRK-12 now says it protects settlement between members and sends the client question to BRK-58, which no provider lists yet.
9. **Carried over from main, not introduced here.** BRK-59's figure source is marked `"strength": "primary"` although it is TASE's own report (record strength is institution). The duplicate BRK-54 and BRK-55 numbers in `brokerage-account.md` are already flagged in the report.
