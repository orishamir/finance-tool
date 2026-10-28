# Switching and transfers

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/switching-and-transfers.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: domain-specialist
Serves: `docs/product.md` 3.7 (switching playbook: ordered steps, what to sign, what to expect, agent and retention, post-switch checklist, record offers), 3.6 (consolidation answers), 3.4 and 3.5 (the cost of moving as part of a provider's total cost), 3.3 (`transfer-switch-process`, `fee-exit`, `insurance-cover`, `switching-tax-event` dimensions); dependency 9 (regulator sources for the switching process). Roadmap release R4 (3.7), with 3.6 consolidation in R3.
Scope: in: for every tier-1 wrapper, how a saver moves money or switches provider: who to contact, what is signed, the clearing house, deadlines on each side, cancellation, cash versus in kind, partial versus full, transfer fees, effects on fee discounts, insurance cover and qualifying periods, what to verify afterwards, agents and the right to act without one, retention contacts and offers, the bank account-switching service and its rerouting period, deposit "portability" as it exists today, moving securities between banks and brokers. Out (and where it lives): which product may receive money from which, and the fee caps (`provident-family-common.md` PF-01 to PF-20); per-wrapper withdrawal, seniority and track rules (`keren-hishtalmut.md`, `kupat-gemel-lehashkaa.md`, `pension-and-gemel-lekitzba.md`, `ira-self-directed.md`, `child-savings.md`); bank deposit terms, breaking a deposit and the closed-system deposit (`bank-current-account-deposits.md` BANK-06, BANK-21, BANK-24); brokerage tariffs and client-asset protection (`brokerage-account.md`); all tax (the `tax-*.md` files, pointed to per rule); savings policies and executive insurance (`savings-policies-and-executive-insurance.md`).

Method note: the full 28-page transfer circular 2017-9-17 and BoI directive 448 were read as page images from the PDFs. Wikisource law texts were read through a fetch tool that returns short quotes and summaries; those are marked "primary (mirror)". Twelve web searches were used.

## Summary

For every CMA product (pension, provident for annuity, keren hishtalmut, gemel lehashkaa, IRA) the saver starts at the receiving fund. The saver signs one form, and the receiving fund forwards it. For an active member it is forwarded only once the first deposit reaches the new fund. The old fund then has 10 business days to move the money, in cash, with no transfer fee. The saver can cancel until the money moves. Money can go only along routes the 2008 regulations list (SW-01 to SW-16).
- **Pension insurance:** cover continues. The old fund is liable until the "determining date" and the new fund from it. Insurance months carry over, but an increase of more than 10% does not (SW-12).
- **Agents and data:** no agent is needed. An adviser may not charge a percentage of the money moved. The clearing house must give the saver their own data on request (SW-17, SW-18).
- **Retention:** no retention rule was found for provident products. Forum accounts describe retention calls and quotes that were withdrawn. Banks are bound by a retention-contact rule (SW-19, SW-28, experience section).
- **Banks:** a current account moves online and free through the receiving bank (directive 448). Deposits stay at the old bank until they mature. Incoming payments are rerouted for three years, extended to 31.7.2029 for earlier switchers (SW-26 to SW-31). A deposit cannot be "ported" before maturity today. New money can go to another bank's closed-system deposit (SW-32).
- **Brokerage:** securities move in kind at the client's request to the old institution. A bank charges a supervised price (NIS 5 per transfer at Discount) and at most NIS 10 when the account is closed. Non-bank brokers charge per security. Moving between accounts with the same owner is described as tax-neutral only by institutions (SW-33 to SW-37).

## Rules

### Provident family: pension, provident for annuity, keren hishtalmut, gemel lehashkaa, IRA

### SW-01 Route map: where money may move
- Rule: A transfer between provident funds is allowed only along the routes in the Transfer Regulations. Into an annuity fund (reg. 2(א)): from another annuity fund (2(א)(1)); from a keren hishtalmut "ובלבד שהעמית היה זכאי למשוך את הכספים בפטור ממס" (2(א)(4)); from a gemel lehashkaa "ובלבד שהעמית הגיע לגיל הפרישה המוקדמת" (2(א)(7)); from another fund the Commissioner approves (2(א)(6)). Into a non-annuity fund (reg. 3(א)): tagmulim to tagmulim (3(א)(1)); "מקרן השתלמות לקרן השתלמות אחרת" (3(א)(4)); "מקופת גמל להשקעה לקופת גמל להשקעה אחרת" (3(א)(11א)); any other transfer "שאישר הממונה בהסכמת המנהל" (3(א)(12)).
- Conditions / exceptions: No listed route goes from an annuity fund or a keren hishtalmut into a gemel lehashkaa. The fuller list, the blocks and the per-product reading are in `provident-family-common.md` PF-17, `keren-hishtalmut.md` KH-17 and `kupat-gemel-lehashkaa.md` KGL-09, KGL-10. A pension fund cannot be self-directed (`ira-self-directed.md` IRA-02); entry to an IRA has its own money-type and ceiling rules (IRA-07, IRA-08, IRA-09). Child savings move under the National Insurance Law, not these regulations (SW-25). The identity of "המנהל" in 3(א)(12) was not re-read; PF-17 reads it as the Tax Authority director (open question 14).
- Figures: early retirement age 60 (KGL-09).
- Source: [Transfer Regulations 2008, regs. 2(א)(1), (4), (6), (7); 3(א)(1), (4), (11א), (12), Hebrew Wikisource][tr] · checked 2026-10-22 · primary (mirror)
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no regulation change is in the CMA 2026 plan (PF-31).

### SW-02 Step 1: the saver goes to the receiving fund, which checks eligibility and hands over the forms
- Rule: The receiving fund's manager checks two things: that the transfer is allowed from the transferring fund under the regulations, and that the member meets its joining rules. It does so under its own procedures, using forms that follow the circular's annexes (circular s.3(א)). If both hold, it gives the member the transfer request form (Annex A, parts 1 to 3). If insurance cover can be given, it also gives a form signed by the receiving fund on the insurance cover (Annex B). The forms are handed over with every required detail filled in (s.3(ב)). The member signs personally, or the guardian signs for a member who has one, and the member submits the form to the receiving fund (s.3(ג)).
- Conditions / exceptions: Annex A has three parts. Part 1 is for a transfer into a pension fund or an insurance fund (salaried or self-employed member). Part 2 is for a provident fund that is neither. Part 3 is for an employer member or a cooperative member. When a tagmulim or savings account is opened for a minor as a gift, the giver who states that someone other than the minor's parents will manage the account is treated as the minor's guardian (s.3(ג)). Managers also take the request online. Phoenix says "ניתן לבצע זאת דיגיטלית למילוי הטופס המקוון" (institution). Gemel lehashkaa is not one of the fund types the Annex A form lists (open question 2).
- Figures: none.
- Source: [CMA circular 2017-9-17 "העברת כספים בין קופות גמל", 2 Oct 2017, s.3(א) to (ג) and Annex A, pp.2, 11 to 17 of 28][c17] · checked 2026-10-22 · primary (official circular on a third-party host); [Phoenix study-fund FAQ][fnxkh] · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`
- Likely to change: yes. The CMA 2026 plan amends the transfer circular to allow identification other than an Israeli ID for residents abroad (PF-31).

### SW-03 What the transfer form says, and its defaults
- Rule: In the Annex A form the member fills a table: "אני מבקש להעביר את" (the whole balance, or a percentage or amount), "שנצברו לזכותי" (all account components, or a named one), and "במסלול ההשקעה" (all tracks, or a named one). If the member leaves these blank, the default is full: "ברירת המחדל להעברת הכספים ... היא העברת מלוא הכספים שנצברו בחשבונך בקופה המעבירה, בכל מרכיבי החשבון ובכל מסלולי ההשקעה". The member declares that, from the determining date, "תהיו פטורים מלשלם לי כל תשלום שהוא, לרבות בשל חבות ביטוחית, הנובע מהכספים שהועברו". The member also declares that none of the blocks in SW-13 applies. If one arises between signing and the transfer date, the request is cancelled. A boxed notice says the request "ניתנת לביטול ובלבד שהכספים טרם הועברו" (SW-07).
- Conditions / exceptions: A footnote says a partial transfer request may be made subject to the law, but keren hishtalmut allows no partial transfer (PF-18). An active member also signs the 120-day statement (SW-08). An active member moving into a new pension fund declares what the transferring fund imposed on insurance cover (exclusions, underwriting supplements) and acknowledges that increased cover may carry a new qualifying period (SW-12).
- Figures: none.
- Source: [Circular 2017-9-17, Annex A parts 1 to 3][c17], pp.11 to 17 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: see SW-02.

### SW-04 The determining date, and when the request is forwarded
- Rule: The receiving fund sends the request electronically to the transferring fund within two business days of the determining date ("המועד הקובע"). It attaches a copy of the member's ID or an e-signature protocol, and a declaration by its handling employee, on the Annex D form, stating the determining date (circular s.3(ו)). For an active member, the determining date is "המועד שבו הופקדו לראשונה בשל העמית כספים בקופה המקבלת אך לא לפני מועד קבלת הבקשה". For an inactive member, it is the date the request is received (reg. 1).
- Conditions / exceptions: Reading: for a member whose employer is still depositing, nothing is forwarded until the first deposit reaches the receiving fund. The switch therefore waits on the employer redirecting deposits (SW-10). The determining date is also the date insurance liability passes to the receiving fund (SW-12).
- Figures: 2 business days.
- Source: [Circular 2017-9-17, s.3(ו), Annex D][c17] · primary (third-party host); [Transfer Regulations, reg. 1 "המועד הקובע"][tr] · primary (mirror) · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: no.

### SW-05 Step 2: the transferring fund may reject or delay, and must say why within 3 business days
- Rule: If the transferring fund cannot transfer, it notifies the receiving fund within three business days of the determining date, on the Annex E form (rejection) or the Annex E1 form (delay). If the reason is a rejection under Annex E, it also sends a copy to the member's address within three business days (s.3(ז)). If the request cannot be carried out, it is cancelled. If part of the money can move, that part moves, subject to reg. 9 (s.3(ח)).
  - Rejection reasons (Annex E): the route breaches reg. 2 or 3; an attachment or pledge on the whole balance; an old-age pension has started; a disability claim is pending; disability entitlement exists; an unpaid loan; death; a request to move to an eligible new pension fund while staying active in the transferring fund; the account is closed; the request has lapsed.
  - Delay reasons (Annex E1): no ID copy; no e-signature protocol; not signed by the member or guardian; no signature date; wrong account or policy number; wrong member status; no Annex A or Annex D; no fund tax-approval number.
- Conditions / exceptions: When a delay reason is fixed within the regulatory period, the member need not fill in new forms (s.3(ט), last paragraph).
- Figures: 3 business days.
- Source: [Circular 2017-9-17, s.3(ז) to (ט), Annexes E and E1][c17], pp.2 to 3, 20 to 21 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `transfer-switch-process`
- Likely to change: no.

### SW-06 Step 3: the money moves within 10 business days, directly, in cash, with no transfer fee
- Rule: The transferring fund transfers within ten business days of a complete, signed request, unless the request was cancelled. The Commissioner may allow up to 20 more business days in special cases (reg. 5(א)). The money moves "ישירות בין הגופים המנהלים של הקופות ולא באמצעות העמית" and "העברת היתרה הצבורה תיעשה במזומנים" unless the managing bodies agree otherwise (reg. 7). If the transferring fund is late, it compensates the member out of its own management fees (reg. 6). It also sends the receiving fund the balance and daily returns within five business days so the return difference can be claimed (circular s.5(ה), (ו)).
- Conditions / exceptions: Transfer fees, late-interest rate and the closed list of charges are in PF-01 and PF-19. IRA transfers can be in kind (SW-24). Phoenix says "ניוד בין גופים, יתבצע תוך עשרה ימי עסקים מהמועד הקובע" (institution).
- Figures: 10 business days (+20 with approval); 5 business days for data on a late transfer.
- Source: [Transfer Regulations, regs. 5(א), 6, 7][tr] · primary (mirror); [Circular 2017-9-17, s.5(ה), (ו)][c17] · primary (third-party host); [Phoenix study-fund FAQ][fnxkh] · institution · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `fee-exit`
- Likely to change: no.

### SW-07 Cancelling a transfer: until the money moves, by a signed notice to the transferring fund
- Rule: The member cancels by signing a cancellation notice on the Annex F form ("הודעת עמית על ביטול בקשת העברה") before the transfer date under reg. 5(א). The form's boxed text says cancellation is "על-ידי חתימה על טופס הודעת ביטול והעברתו לקופה המעבירה", by fax, post or email among other ways. The transferring fund passes the notice to the receiving fund within that period. The request is cancelled when the notice reaches the transferring fund. Exception: if an insured event occurred after the determining date and before the notice was delivered, the request is not cancelled (s.3(ט)). After a cancellation, the receiving fund returns any money already deposited with it to the member's account in the transferring fund. It does so within 10 business days, with the receiving fund's return and with no deduction other than management fees (s.3(י)).
- Conditions / exceptions: Phoenix states cancellation ("חרטה מניוד") is possible "תוך 10 ימי עסקים מקבלת בקשת הניוד", or until the money moves if earlier. It names a mailbox for cancelling transfers out of Phoenix, shimur_haavarot_out@fnx.co.il, whose name refers to retention ("שימור") (institution). The two sources agree in practice: the money must move within 10 business days (SW-06).
- Figures: 10 business days to return deposits after cancellation.
- Source: [Circular 2017-9-17, s.3(ט) to (יא), Annex F, Annex A boxed notice][c17], pp.2 to 3, 12, 22 · checked 2026-10-22 · primary (third-party host); [Phoenix study-fund FAQ][fnxkh] · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`
- Likely to change: no.

### SW-08 A request lapses: 120 days for an active member without a deposit, 60 days otherwise
- Rule: An active member's request lapses if it is not forwarded to the transferring fund within 120 days of signing. Unless the member stated they will not deposit, it is forwarded only after a deposit arrives (SW-04). If the member told the receiving fund within those 120 days that no deposits will be made, the request lapses if not forwarded within 60 days of that notice (s.3(יב)). An inactive member's request lapses if not forwarded within 60 days of signing (s.3(יג)).
- Conditions / exceptions: The form lets an active member tick that they already state no deposits will be made, and then the member is treated as inactive for the determining date (Annex A, item 6). Phoenix: "אם לא בוצעה הפקדה עד 120 יום מיום הבקשה - הניוד יבוטל" (institution).
- Figures: 120 days; 60 days.
- Source: [Circular 2017-9-17, s.3(יב), (יג), Annex A item 6][c17] · checked 2026-10-22 · primary (third-party host); [Phoenix study-fund FAQ][fnxkh] · institution
- Dimensions: `transfer-switch-process`
- Likely to change: no.

### SW-09 Step 4: both funds confirm in writing within 15 business days
- Rule: The transferring fund sends the member a confirmation within 15 business days of the transfer. It shows at least: fund name and tax-approval number and the member's account number (policy number for an insurer); the manager's name and contact details; the transfer date; the determining date, with an explanation that the transferring fund's insurance liability ended from it; the amount moved, split for a salaried member into employee tagmulim, employer tagmulim and severance; and, after a partial transfer, the balance left and the reason the account was split (s.6(א)). The receiving fund sends a confirmation within 15 business days of receiving the money. It shows the same items, including that its insurance liability started on the determining date (s.6(ב)). Either fund may send these by email only if the member agreed (s.6(ג)).
- Conditions / exceptions: Phoenix states "אישור לעמית על ביצוע ניוד יוצא / נכנס, יישלח תוך 14 ימי עסקים" (institution).
- Figures: 15 business days.
- Source: [Circular 2017-9-17, s.6][c17], pp.8 to 9 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: no.

### SW-10 The employer: the old fund notifies it of severance moved; future deposits follow the employee's choice
- Rule: A transferring fund that moves money from a salaried member's account that includes a severance component notifies the member's employer within 15 business days. It uses the Annex 11 notice, which states the severance amount moved and to which fund (s.5א). Phoenix states that after a fund is opened "האישור נשלח למעסיק באופן אוטומטי" (institution).
- Conditions / exceptions: The employee chooses the fund and the employer may not make its payments conditional on a fund (law s.20, `pension-and-gemel-lekitzba.md` PEN-06, `keren-hishtalmut.md` KH-03). No source read sets out who must tell the employer to redirect future deposits, or when (open question 6). For an active member the transfer waits on that first deposit (SW-04, SW-08).
- Figures: 15 business days.
- Source: [Circular 2017-9-17, s.5א, Annex 11][c17], pp.8, 26 to 27 · checked 2026-10-22 · primary (third-party host); [Phoenix study-fund FAQ][fnxkh] · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: no.

### SW-11 History travels with the money
- Rule: On the transfer date the transferring fund sends the receiving fund a data file with: the member's identity; the fund details; for a new pension fund, the insurance cover the member had; the balance moved; "פירוט מלא של כל התנועות הכספיות" up to the determining date, including movements in earlier transferring funds, with each deposit split into its components; and the current and past employers (s.5(א)). For a new pension fund it also sends any exclusions or underwriting supplements in force (s.5(ב)). For a keren hishtalmut it also sends an Annex H data file (s.5(ג)).
- Conditions / exceptions: Data for periods before 1997 that is not in the fund's computer may be omitted (s.5(ד)). The study-fund data is what carries the first payment date and seniority (`keren-hishtalmut.md` KH-14; `tax-hishtalmut.md` TXH-19).
- Figures: none.
- Source: [Circular 2017-9-17, s.5][c17], pp.7 to 8 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `transfer-switch-process`, `age-or-use-exemption`
- Likely to change: no.

### SW-12 Pension insurance on a transfer: who is liable when, cover level, qualifying months
- Rule: The transferring fund "יהיה אחראי לתשלום כספים לפי הכיסויים בקופה המעבירה בשל מקרה ביטוח שאירע לפני המועד הקובע". The receiving fund is liable for an insured event "שאירע במועד הקובע או לאחריו" (reg. 8(א), (ב)). After a partial transfer, the transferring fund stays liable for the death cover left with it, reduced in proportion to the balance left (reg. 8(ג)). In a receiving new pension fund:
  - Cover level: disability and death cover is set as if the deposits made in the transferring fund had been made in the receiving fund. From a fund that is not a new pension fund, it is set as if fixed "notional monthly deposits" had been made for a notional period (circular s.4(א)).
  - Qualifying months: for an active member, the consecutive insurance months accumulated in the transferring fund count toward the same risks (s.4(ב)(1)). They do not count for the part of a disability or survivors' supplement that rises by more than 10% over the notional pension (s.4(ב)(2)). They do not count for a risk that had an exclusion or underwriting supplement in the transferring fund at the transfer date (s.4(ב)(3)).
  - Written terms: the receiving fund states in writing, on Annex B, any conditions or exclusions on the cover.
- Conditions / exceptions: The 60-month qualifying period, and the new qualifying period when tagmulim money is withdrawn or moved out, are bylaw rules in `pension-and-gemel-lekitzba.md` PEN-14. Renewal after 12 months without insurance is in PEN-16. Bylaws were not read for how PEN-14 and circular s.4(ב) combine on a fund-to-fund transfer (open question 7). Leaving a pension fund for a provident fund or an IRA ends that money's insurance (PEN-35; IRA-02).
- Figures: 10% threshold; notional monthly deposit = average monthly deposits over the last 12 months, excluding severance.
- Source: [Transfer Regulations, reg. 8(א) to (ג)][tr] · primary (mirror); [Circular 2017-9-17, s.4 and Annex B][c17], pp.3 to 5, 18 · primary (third-party host) · checked 2026-10-22
- Dimensions: `insurance-cover`, `transfer-switch-process`
- Likely to change: no.

### SW-13 When a transfer is blocked
- Rule: Reg. 4 blocks a transfer in these cases:
  - an attachment or valid pledge on the whole balance;
  - an unpaid loan;
  - the member receives an old-age pension from that money, or a disability claim is pending or approved;
  - the member died before the determining date;
  - the receiving fund is closed;
  - the member asked to move to a comprehensive new fund from a fund that is not one "והוא ממשיך להיות עמית פעיל בקופת הגמל המעבירה" (reg. 4(8)).

  A partly attached balance moves except the part "שלא ניתן להעבירו בשל עיקול או שיעבוד כדין" (reg. 5(ב)).
- Conditions / exceptions: The member declares on the form that none of these applies (SW-03). The fuller wording is in PF-17.
- Figures: none.
- Source: [Transfer Regulations, regs. 4, 5(ב)][tr] · checked 2026-10-22 · primary (mirror)
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no.

### SW-14 Partial transfers: allowed except from a keren hishtalmut; which money leaves first in a pension fund
- Rule: A transferring fund transfers the balance or part of it (PF-18). From a keren hishtalmut no part may be moved (PF-18, KH-17). When part of a comprehensive or general new pension fund account is moved, money is taken from each component "לפי סדר הפקדתם", running "מן המועד המאוחר ביותר עד המועד המוקדם ביותר" (reg. 9(ד)).
- Conditions / exceptions: The form's default is a full transfer (SW-03). A partial move leaves proportional death cover behind (SW-12). It can also let the manager end a fee discount early (SW-15).
- Figures: none.
- Source: [Transfer Regulations, reg. 9(ד)][tr] · checked 2026-10-22 · primary (mirror); PF-18 for reg. 9(ג)
- Dimensions: `transfer-switch-process`
- Likely to change: no.

### SW-15 Fees: no transfer fee, but moving can cost a discount
- Rule: No transfer fee is a permitted charge (PF-01, PF-19). A full or partial transfer, or a move to another track, is one of the cases in which a manager may raise a discounted fee before the discount period ends, after the notice in PF-16 (PF-14 case 2; gemel lehashkaa bylaws KGL-16). A move between employers with group arrangements at the same body follows PF-15. A selected pension fund's fixed fee is guaranteed only for a member who joined during the period the fund was selected (`pension-and-gemel-lekitzba.md` PEN-23).
- Conditions / exceptions: This is a pointer rule; the sources are in the rules named.
- Figures: none here.
- Source: pointers to PF-01, PF-14, PF-15, PF-16, PF-19, KGL-16, PEN-23 (each sourced in its file) · checked 2026-10-22 · links from the cited rules: [1](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>), [2](<https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf>), [3](<https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf>), [4](<https://www.fnx.co.il/gemel/gemelhashkaa/faq/>), [5](<https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz2017915.pdf>), [6](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל)>), [7](<https://www.nevo.co.il/law_html/law01/999_929.htm>), [8](<https://infinity.co.il/wp-content/uploads/2025/07/תקנון-גמל-להשקעה-בתוקף-מיום-1.7.2024.pdf>)
- Dimensions: `fee-exit`, `fee-change-over-time`
- Likely to change: see PF-31.

### SW-16 The track and insurance track at the receiving fund
- Rule: The transfer form names the tracks the money leaves from (SW-03). Which track it lands in at the receiving fund is set by the member's joining choice there. A member who chooses no track is placed in the receiving fund's default track: PF-24, KH-19, KGL-11, and for pension the age-dependent track (PEN-17) and the default insurance track (PEN-11).
- Conditions / exceptions: A pointer rule. Check the track on the first statement (SW-38).
- Figures: none.
- Source: pointers to PF-24, KH-19, KGL-11, PEN-11, PEN-17; [Circular 2017-9-17, Annex A table][c17] · checked 2026-10-22 · primary (third-party host)
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: yes (CMA 2026 investment-tracks circular, PF-31).

### SW-17 Agents: a saver may act directly; what an agent or adviser may and may not be paid
- Rule: A transaction in a pension product is made "רק כחלק מייעוץ פנסיוני או משיווק פנסיוני" (law s.13(א)). That does not apply to a transaction "בין לקוח לגוף מוסדי, בידי הלקוח, במישרין", made on the customer's own initiative (s.13(ב)(1)). A pension adviser may receive "שכר והחזר הוצאות המשולמים ישירות מאת הלקוח" (s.19(א)(1)). The adviser "אינו רשאי לגבות מלקוח שכר והחזר הוצאות המחושבים כשיעור מהסכומים שמעביר הלקוח" (s.28(ב)). Ongoing advice combined with a transaction requires a power of attorney ("ייפוי כוח") letting the adviser receive information about the customer (s.27(ב)(7)).
- Conditions / exceptions:
  - The exceptions to s.13(ב)(1) and the distribution-fee consent rule are in PF-21.
  - Institution practice: Mizrahi-Tefahot states that joining or staying in a pension product because of its advice "מזכה את הבנק בעמלות הפצה מהיצרנים הפנסיונים".
  - Phoenix's "request an offer" route sends the request to the account's agent if there is one, and otherwise to an insurance agency in the Phoenix group. Its online form is the direct route (SW-02).
  - No source was found on how a member removes an agent already attached to an account (open question 16).
  - IRA funds may not pay distribution or agency fees (IRA-19).
- Figures: none.
- Source: [Pension Advice, Marketing and Clearing System Law 2005, ss.13, 19(א)(1), 27(ב)(7), 28(ב), Hebrew Wikisource (amended to ס"ח תשפ"ו 912)][lawadv] · primary (mirror); [Mizrahi-Tefahot, pension consulting page][mizpen] · institution; [Phoenix study-fund FAQ][fnxkh] · institution · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `fee-management-balance`
- Likely to change: yes. The CMA 2026 plan has a power-of-attorney circular for licensees (PF-31).

### SW-18 The clearing house: the saver's own data, and consent
- Rule: "מערכת סליקה פנסיונית מרכזית תמסור ללקוח, על פי בקשתו, מידע הנוגע לו לגבי מוצר פנסיוני או תכנית ביטוח, מכלל הגופים המוסדיים" (s.31ט(ג)). Information passes to advisers and agents only at the customer's request (s.31ט(א)(1)). Regulations are to cover "בדיקת קיומה של בקשה מטעם הלקוח או של ייפוי כוח" (s.31טז(ד)(1)). Where the CMA requires it, institutions must pass information and money through the system (penalty in s.32(ח)(1)).
- Conditions / exceptions: Free routes found, both institution pages:
  - Leumi: "שירות ללא עלות" for private customers of any bank aged 18 or over, once per customer. Registration finishes on the clearing-house site, where a credit card is entered for identity, "לא לצורך חיוב". The report shows balances, managers, the fees paid and projected pensions, and "המידע יהיה זמין לצפייה במשך שלושה חודשים בלבד".
  - Mizrahi-Tefahot: the request is free and "הבנק מממן את מלוא עלות הפנייה למסלקה", but the bank earns distribution fees on the advice (SW-17).

  The clearing house's own price list for a direct request was not read (open question 5). A forum account alleges an agent read a report the saver had not authorised (experience SW-X01).
- Figures: none.
- Source: [Pension Advice, Marketing and Clearing System Law, ss.31ט(א)(1), 31ט(ג), 31טז(ד)(1), 32(ח)(1)][lawadv] · primary (mirror); [Leumi, "עושים סדר בפנסיה"][leumipen] · institution; [Mizrahi-Tefahot pension consulting][mizpen] · institution · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: yes (CMA 2026 plan: clearing-house mandatory-use and payment circulars, PF-31).

### SW-19 Retention contacts and offers in provident products: no rule found; what is sourced
- Rule: Neither the Advice, Marketing and Clearing Law (read in full on the mirror) nor transfer circular 2017-9-17 contains a rule on a transferring fund contacting a member who asked to leave, or on retention offers. Sourced rules that bear on it:
  - The member can cancel until the money moves (SW-07).
  - A discount, once given, must stay valid for at least five years from when it is first charged (PF-13). It must appear in the personal online account, and be emailed within 10 business days if the email is known (PF-16).
  - A transfer, full or partial, lets a manager raise a discount early (PF-14).
- Conditions / exceptions: Whether a fee quoted before joining binds the institution was not found (open question 4). Experience on retention calls, withdrawn quotes and cancelling after a retention offer is in SW-X01 to SW-X02. The playbook asks the person to record every offer with its date and source (product.md 3.7).
- Figures: none.
- Source: [Pension Advice, Marketing and Clearing System Law (full text, two reads)][lawadv] · primary (mirror); [Circular 2017-9-17 (all 28 pages)][c17] · primary (third-party host); PF-13, PF-14, PF-16 · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `fee-change-over-time`
- Likely to change: unknown (open question 3).

### Per wrapper (provident family)

### SW-20 Keren hishtalmut: whole balance, history kept, both funds told for one-account seniority
- Rule: A keren hishtalmut moves only whole, and only to another keren hishtalmut or, if the money could be withdrawn tax-free, to an annuity fund (SW-01, PF-18, KH-17). The study-fund data file carries its history (SW-11). Two accounts count as one for the tax period only if the employee and employer notify both funds and the conditions in KH-14 hold. Some funds do not accept deposits once the employer stops paying (KH-09).
- Conditions / exceptions: Tax: TXH-19 (history kept; tax neutrality inferred, open in that file). Phoenix states "ניוד בין גופים אינו אירוע מס" and "לא ניתן לבצע ניוד חלקי", and gives a digital joining fee of 0.75% (institution, 2026-10-22).
- Figures: none here.
- Source: pointers PF-18, KH-09, KH-14, KH-17, TXH-19; [Phoenix study-fund FAQ][fnxkh] · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `switching-tax-event`
- Likely to change: no.

### SW-21 Kupat gemel lehashkaa: only to another gemel lehashkaa, or to an annuity fund from 60; partial allowed
- Rule: Money moves only to another kupat gemel lehashkaa, or to an annuity fund at early retirement age for an annuity only (SW-01; KGL-09, KGL-10). A partial transfer is allowed (KGL-10). Withdrawing and re-depositing elsewhere instead of transferring is a withdrawal: it is taxed at exit (`tax-gemel-lehashkaa-ira-child.md`), and the new deposit counts against the annual ceiling (KGL-02), so it is not equivalent to a transfer.
- Conditions / exceptions: Track switches and transfers between gemel lehashkaa funds are not taxed (TXK-04). The circular's Annex A form does not list gemel lehashkaa (open question 2).
- Figures: ceiling per KGL-03.
- Source: pointers KGL-02, KGL-09, KGL-10, TXK-04 · checked 2026-10-22 · links from the cited rules: [1](<https://fs.knesset.gov.il//20/law/20_lsr_343169.pdf>), [2](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>), [3](<https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf>), [4](<https://www.ice.co.il/consumerism/news/article/1005636>), [5](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל)>), [6](<https://he.wikisource.org/wiki/חוק_גיל_פרישה>), [7](<https://he.wikisource.org/api/rest_v1/page/pdf/פקודת_מס_הכנסה>), [8](<https://www.harel-group.co.il/long-term-savings/funding-saving/join/doclib/%d7%92%d7%9e%d7%9c%20%d7%9c%d7%94%d7%a9%d7%a7%d7%a2%d7%94.pdf>)
- Dimensions: `transfer-switch-process`, `deposit-ceiling`, `switching-tax-event`
- Likely to change: no.

### SW-22 Pension fund: insurance first, then route; automatic consolidation of inactive accounts
- Rule: A pension transfer follows SW-02 to SW-13, using form part 1 and the Annex B insurance form. Insurance continuity is in SW-12. When a member joins a pension fund, inactive accounts in other pension funds are found and moved unless the member objects within 45 days (PF-28). Pension money cannot go into an IRA (IRA-02). A member still active in a non-comprehensive fund cannot move to a comprehensive fund (SW-13, reg. 4(8)).
- Conditions / exceptions: Employer default and selected funds: PEN-06, PEN-23. Tax treatment of a transfer between pension funds is not stated in TXP (open question 8).
- Figures: 45 days (PF-28).
- Source: pointers PF-28, PEN-06, PEN-23, IRA-02; [Transfer Regulations, reg. 4(8)][tr] · checked 2026-10-22 · primary (mirror)
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: no.

### SW-23 Provident fund for annuity: same process, no insurance to carry
- Rule: A provident fund for annuity (tagmulim and personal severance) moves under the same circular, on form part 2 (or part 1 into a pension fund), between annuity funds (reg. 2(א)(1)) and tagmulim funds (reg. 3(א)(1)). It has no pooled insurance (PEN-35), so SW-12 applies only when the receiving fund is a pension fund. It can move into an IRA only for permitted money types, up to the IRA ceiling, and severance money only with the employer's approval (IRA-07 to IRA-09).
- Conditions / exceptions: none beyond the pointers.
- Figures: none.
- Source: [Transfer Regulations, regs. 2(א)(1), 3(א)(1)][tr] · primary (mirror); [Circular 2017-9-17, Annex A part 2][c17] · primary (third-party host); pointers PEN-35, IRA-07 to IRA-09 · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: no.

### SW-24 IRA: in kind only between IRAs; a cash transfer's clock starts once everything is sold
- Rule: Money enters an IRA from a regular fund in cash. Between IRA funds the member chooses cash or in kind. Out of an IRA to a regular fund, the receiving company chooses (IRA-23). Where a cash transfer is chosen, the transfer period in reg. 5(א) of the Transfer Regulations and in income-tax reg. 33ב(ב) "יחל ... ביום שבו סיים העמית בקופת הגמל בניהול אישי או מנהל התיקים מטעמו, להמיר את כל נכסי הקופה למזומנים" (reg. 11(ב)).
- Conditions / exceptions: Selling the holdings costs brokerage at the IRA's broker (IRA-21). Meitav Trade charges inside an IRA to move securities to another Israeli bank: NIS 20 per Israeli security, at most NIS 99 per portfolio, and USD 10 per foreign security (IRA-22). The member may cancel the IRA agreement at any time without payment (IRA-15).
- Figures: as in IRA-22 (effective 01.05.2026).
- Source: [IRA Regulations amendment 2017, Reshumot ק"ת 7819, 29.5.2017, reg. 7 (new reg. 11(ב)), p.1141 (copy hosted by Meitav)][ira17] · checked 2026-10-22 · primary (official gazette on a third-party host); pointers IRA-15, IRA-21 to IRA-23
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `fee-trade`
- Likely to change: yes. The 2025 draft IRA amendment (IRA-27) is pending.

### SW-25 Child savings: through the receiving fund and National Insurance; bank money cannot move to another bank
- Rule: A parent who receives the child allowance moves the plan by contacting the receiving provident fund. Balance and gains move, and NII sends future deposits to the new fund (CS-11). The timelines are in National Insurance regulation 7 (CS-11). A bank plan cannot move to another bank. Since January 2025 a parent can, once, send future deposits from a bank to a provident fund, but the bank balance stays at the bank (CS-12). Before 18 the parent acts. From 18 only the child can act (CS-21).
- Conditions / exceptions: A pointer rule; no new source read for it.
- Figures: per CS-11.
- Source: pointers CS-11, CS-12, CS-21 (each sourced in `child-savings.md`) · checked 2026-10-22 · links from the cited rules: [1](<https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/mavar.aspx>), [2](<https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx>), [3](<https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf>)
- Dimensions: `transfer-switch-process`
- Likely to change: yes (CS-07, CS-12).

### Bank current account (account-switching service)

### SW-26 Moving a current account: online, through the receiving bank, at no cost
- Rule: Amendment 27 to the Banking (Customer Service) Law added s.5ב1. Under it banks must let customers move their financial activity from one bank (the originating bank, "בנק מקורי") to another (the receiving bank, "בנק קולט") "באופן מקוון, נוח, אמין, מאובטח וללא עלות ללקוח". The Governor's rules (2019) set which activity and which account types are covered. Directive 448 sets the process. The receiving bank lets the customer submit a written request through every channel it offers, at least its website and branch (s.17). The receiving bank handles every customer approach about the move (s.14). The originating bank handles approaches about activity left behind after the move (s.15).
- Conditions / exceptions:
  - The request needs the consent of every account owner. Joint owners can consent through any channel, and the receiving bank sets a reasonable period for it (s.19).
  - A bank must allow switching "ללא הטלת מגבלה על מספר ההעברות". If a second request for the same account arrives before the transfer day, the originating bank rejects the later one and tells the customer (s.11, version 2).
  - The account types the Governor's rules cover were not read (open question 9).
  - Section 5ב1(ה) of the law lets some banks be exempt (definition of "bank", s.3).
- Figures: s.5ב1 in force 22 September 2021 (circular h-2670).
- Source: [BoI directive 448 "העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון", version 1 (12/19), intro and ss.3, 14, 15, 17, 19][d448v1] · primary; [directive 448 version 2 (8/21), ss.3, 11, 14 to 19][d448v2] · primary; [BoI circular h-2670, 17.8.2021, s.4][h2670] · primary · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `fee-exit`, `regulator`
- Likely to change: yes. The rerouting period was extended twice (SW-30).

### SW-27 Timeline, transfer day and cancelling
- Rule: The customer may choose a later transfer day than the rules set, provided the process completes "בתוך 30 ימי עסקים מהיום בו הוגשה בקשה תקינה" (s.5(א)). In that case the process timeline counts from the seventh business day before the chosen day (s.5(ב)). The receiving bank checks whether the customer has active payment means (debit cards, cheques) there and, if not, offers to set the transfer day for when they will hold them (s.5(ג)). The receiving bank checks the request by the next business day and forwards it within one business day of finding it complete (s.24). The originating bank confirms completeness by the next business day and then restricts the old account: no change of owners, no new debit-type activity, no debit-card use (s.26). Cancelling: "בנק יאפשר ללקוח לבטל את בקשתו להעברת פעילות בכל שלב בתהליך הניוד ועד לסוף יום העסקים השישי של תהליך הניוד". At least the website, the phone centre, the branch and the channel the request came through must accept the cancellation, and any account owner may cancel (s.6).
- Conditions / exceptions: Whether the "sixth business day" counts from the request or toward the transfer day is not stated more precisely (open question 9). On the transfer day the old account allows no activity, including cash withdrawal (s.34(א)).
- Figures: 30 business days; 1 business day; 7th business day; 6th business day.
- Source: [Directive 448 version 2 (8/21), ss.5, 6, 24, 26, 34][d448v2] · checked 2026-10-22 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no.

### SW-28 Retention by the old bank, and benefits kept during the switch
- Rule: Retention contact (s.9, "ניסיון לשימור הלקוח על ידי הבנק המקורי"): the originating bank's approach to a customer who asked to switch, to try to keep them, "תעשה מבלי שיופעלו על הלקוח לחצים לקבלת החלטה כאמור". The bank must make clear "כבר בתחילת הפנייה כי מטרת הפנייה היא לנסות לשמרו כלקוח הבנק המקורי". Benefits (s.7): the originating bank may not cancel the customer's benefits and discounts early only because a switch was requested. Without an agreed end date, it keeps them "למשך תקופה של 3 חודשים לפחות ממועד הגשת הבקשה, או עד למועד העברת הפעילות בפועל, המוקדם מבין השניים".
- Conditions / exceptions: Separately, a banking benefit may not end without 21 days' notice (`bank-current-account-deposits.md` BANK-19).
- Figures: 3 months.
- Source: [Directive 448 version 2 (8/21), ss.7, 9][d448v2] · checked 2026-10-22 · primary
- Dimensions: `transfer-switch-process`, `fee-change-over-time`
- Likely to change: no.

### SW-29 What moves and what stays: deposits wait for maturity, untransferable securities stay, foreign currency may be converted
- Rule: The receiving bank must explain which activity cannot move automatically and the options, naming "הלוואות, פיקדונות, ניירות ערך שאינם ניתנים להעברה, תנועות עתידיות במטבע חוץ וערבויות" (s.23(ג)). For each type of activity:
  - Deposits and savings: unless the customer instructs otherwise, the originating bank keeps managing a deposit or savings plan on its agreed terms. At maturity, even after the rerouting period, it pays the money to the customer's account at the receiving bank or to another account the customer names (s.29(ב)).
  - Securities: a security that cannot be transferred stays held at the originating bank for the customer (s.29(ג)).
  - Foreign currency: where the receiving bank does not run that currency, the originating bank converts the balance to shekels "בהתאם לאופן ההמרה הנהוג בבנק המקורי" and moves it (s.29(ד)).
  - Loans: they stay on their terms, or the process stops if no arrangement is reached (s.29(א)).
  - The old account: the originating bank closes it when the move completes. It may keep a "חשבון תמורה" only to manage activity left behind, and may charge no fees on that account (s.34(ג); definition in s.3).
- Conditions / exceptions: The receiving bank's information page must tell the customer that leftover deposits and securities stay (s.23(ג)). The BoI Q&A says the bank must state clearly, on the information page, that the move may cause a tax event ("עשוי להתרחש אירוע מס"). It also says the originating bank must pass on information on deposit tax benefits (directive Q&A annex).
- Figures: none.
- Source: [Directive 448 version 2 (8/21), ss.3, 23, 29, 34][d448v2] · primary; [Directive 448 version 1, Q&A annex, pp.12 to 13][d448v1] · primary · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `fee-fx`, `currency`, `switching-tax-event`
- Likely to change: no.

### SW-30 Rerouting after the switch: three years, extended to 31.7.2029 for earlier switchers
- Rule: After the transfer day, debits, credits and cheques presented to the old account are rerouted to the new account. The Governor's rules (s.5(א)) set the period at "שלוש שנים ממועד העברת הפעילות" unless the customer asks to stop earlier. The original period was two years. An amendment in force 21.9.2023 made it three years, and a transitional provision gave customers who had switched between the start of s.5ב1 and 20.9.2023 three more years of rerouting. A rules amendment published 17.9.2026 extends rerouting to 31.7.2029 for customers who switched online before 21.9.2026: "עבור לקוחות אלו, מוארכת הוראת המעבר עד ליום 31.7.2029". The receiving bank must give at least 60 days' notice before rerouting ends (448 s.36). It must update the customer half-yearly on rerouted activity, including the names of the bodies paying in and debiting (s.39). It must let the customer stop rerouting at any time, effective within 5 business days, with a warning of the consequences (s.40).
- Conditions / exceptions: Customers who switched between 1.8.2026 and 21.9.2026 get a rerouting period up to about 1 month and 21 days short of three years, with a decision expected by 31.7.2029 (circular h-2863 s.5). The BoI states that more than 200,000 customers had switched online about five years after launch. The same circular says substantial rerouting volume remained after three years.
- Figures: 3 years; 31.7.2029; 60 days; 5 business days.
- Source: [BoI circular h-06-2863 "הארכת תקופת הניתוב בעת מעבר בין בנקים – דברי הסבר", 18.10.2026][h2863] · primary; [BoI draft of the same, 9.8.2026 (draft rules text)][d2026draft] · primary (draft); [BoI draft 3.7.2023 (two to three years)][d2023draft] · primary (draft); [Directive 448 version 2, ss.35 to 40][d448v2] · primary · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `reporting-obligation`
- Likely to change: yes. The rule has been extended twice, and a decision on later switchers is due by 31.7.2029.

### SW-31 The customer's information page and what to check
- Rule: The receiving bank shows a summary information page before the request is submitted (s.21). It covers at least:
  - which account types can move online (s.23(א));
  - the activity that will be moved and rerouted, and that the customer may not split it or leave part behind (s.23(ב));
  - what cannot move automatically, and the options (s.23(ג));
  - foreign-currency conversion (s.23(ד));
  - the process: choosing the transfer day, cancelling, the old account's status, the restrictions and when they start, how to check status, and the reasons a switch can stop (s.23(ה));
  - that rerouted activity follows its usual timeline, preserving value dates and finality (s.23(ו)).

  The receiving bank updates the customer on the last business day before the transfer day (s.30).
- Conditions / exceptions: The page must stay available to the customer at all times in a format that can be saved and printed (s.21).
- Figures: none.
- Source: [Directive 448 version 2 (8/21), ss.20 to 23, 30][d448v2] · checked 2026-10-22 · primary
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: no.

### Bank deposits

### SW-32 Deposit "portability" today: new money via a closed-system account; an existing deposit moves only at maturity or by breaking it
- Rule: Section 5ב2, headed "הפקדת כספים במערכת סגורה - ניוד פיקדונות", is in force from 1 December 2025. Every bank other than a small one must let an individual deposit shekels "באמצעות חשבון במערכת סגורה באופן פשוט ונוח, ובין השאר באופן מקוון" (s.5ב2(ב)(1)). The money must come from the same individual's account at another bank or at the Postal Bank and is "מושבים רק לחשבון שממנו הועברו" (s.5ב2(א)). The customer may authorise the receiving bank in writing to handle every step (s.5ב2(ג)). No bank may exert unfair influence on a customer about depositing through a closed-system account at another bank (s.5ב2(ד)). Details are in BANK-21.
- Conditions / exceptions:
  - Existing deposits: no law lets a running deposit move to another bank on its terms. It moves at maturity or at an exit point, or by breaking it on the bank's terms (BANK-06). Under the account-switching service it stays at the old bank until maturity (SW-29).
  - Pending bill: private bill P/5281/25 (MK Ahmad Tibi), tabled 30.12.2024, would:
    - add a s.5ב2 "ניוד פיקדונות לקוחות ללא העברת חשבון בנק";
    - require the receiving bank to accept a ported deposit or savings plan at no less than its average rate for similar products;
    - not treat the move as early withdrawal;
    - bar the originating bank from charging or restricting it;
    - keep the original terms other than the rate.

    On 2026-10-22 its Knesset status is "הונחה על שולחן הכנסת לדיון מוקדם" (last updated 2024-12-29). The identical bill it names, P/4960/25, became Amendment 38, the closed-system law above, in a different form ("התקבלה בקריאה שלישית").
  - Competition Authority: the deposit-portability directive is in BANK-24 (secondary content, under appeal).
- Figures: in force 1.12.2025.
- Source: [Banking (Customer Service) Law Amendment 38, ספר החוקים 3413, 14.5.2025, pp.638 to 639][am38] · primary; [Bill P/5281/25 text][p5281] · primary; [Knesset OData, bill 2226120][p5281od] and [bill 2222052 (P/4960/25)][p4960od], [status 104][st104], [status 118][st118] · primary; [Directive 448 version 2, s.29(ב)][d448v2] · primary · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `fee-exit`
- Likely to change: yes (bill; Competition Tribunal outcome, BANK-24).

### Brokerage account

### SW-33 Banks: a supervised price to move securities to your own account elsewhere, and at most NIS 10 on closing
- Rule: In the full tariff, item "העברת ניירות ערך" has two prices: "לחשבון אותו לקוח בגוף פיננסי אחר" a shekel amount "(להעברה) (בפיקוח)", and to another client's account a percentage with a minimum and maximum per portfolio. The notes:
  - (1) "חשבון אותו לקוח" includes a joint account of the client with their spouse ("בן או בת זוגו").
  - (2) a transfer to the same client's account "בעת סגירת חשבון לא תעלה על 10 ש"ח להעברת התיק והוצאות צד ג'".
  - (3) "גוף פיננסי" is as defined in the Bank of Israel Law 2010.

  A foreign-currency transfer to the same client's account on closing is likewise capped at NIS 10 (part 5, item 10).
- Conditions / exceptions:
  - Discount's tariff (dated 07/02/2025), item 4.6.1, prices the supervised transfer at "5 ₪ להעברה (פיקוח)". It adds a broker's fee for a transfer abroad and exchange expenses for a transfer in Israel. A transfer to another client's account is 0.69%, minimum NIS 44, maximum NIS 220 per portfolio (4.6.2).
  - Meitav Trade's article (03/08/2026) says the bank fee is "5 שקל לנייר ערך ישראל", about USD 10 per foreign security, and up to about NIS 150 for a whole portfolio.
  - Calcalist (27.08.2026) reports a BoI rule capping a move from a bank to a non-bank member at NIS 5.
  - These three disagree on the unit (per transfer or per security). The order fixing the supervised price was not found (open question 10). Use the bank's own tariff line.
- Figures: NIS 5 per transfer (Discount, 07/02/2025, institution); NIS 10 cap on closing (rules, consolidated to 9.4.2025, primary).
- Source: [Banking Rules (Customer Service) (Fees) 2008, consolidated to 9.4.2025, first schedule part 4(א)(6) and notes, part 5 item 10, pp.17 to 19][fees] · primary; [Discount tariff part 4, items 4.6.1 to 4.6.2][disc4] · institution; [Meitav Trade, portfolio-transfer article, 03/08/2026][meitavtr] · institution (marketing article); [Calcalist, 27.08.2026][calc] · secondary · checked 2026-10-22
- Dimensions: `fee-exit`, `transfer-switch-process`
- Likely to change: possible.

### SW-34 Non-bank brokers: no cap found; tariffs charge per security
- Rule: No rule capping what a non-bank TASE member charges to move securities out was found. Examples:
  - IBI's tariff ("נכון לתאריך: 1.7.2026") charges NIS 20 per security to the same client at another member, "מקסימום 150 ₪ להעברה" a day, and NIS 35 per security to an account with different ownership. Abroad it charges USD 10 per US security, USD 40 per Canadian security, and the foreign broker's cost with a USD 25 minimum for other foreign securities.
  - Altshuler Shaham Trade says it charges no fee to receive a portfolio.
  - Calcalist reports that moving out of a broker can cost hundreds or thousands of shekels (secondary).
- Conditions / exceptions: Snapshot figures for `data/`, not rules. Fee lines and their names are in BRK-24.
- Figures: as above, dated 1.7.2026 (IBI) and 2026-10-22 (Altshuler page).
- Source: [IBI tariff, part 4 item 9][ibi] · institution; [Altshuler Shaham Trade, transfer FAQ][astr] · institution; [Calcalist, 27.08.2026][calc] · secondary · checked 2026-10-22
- Dimensions: `fee-exit`, `fee-custody`
- Likely to change: yes.

### SW-35 Moving a portfolio: open at the receiver, then ask the old institution; what can and cannot move
- Rule: Institution sources describe the same order:
  - Open an account at the receiving institution.
  - Submit a transfer request to the current institution. Meitav Trade: "מורידים את טופס בקשת ההעברה מהבנק" and send it with the new account details. Leumi takes the request online.
  - The receiver then handles receipt.

  Leumi's instructions:
  - "בקשת ההעברה תכלול רק ניירות ערך אשר בוצע בגינם זיכוי/חיוב בפועל של החשבון";
  - "לא ניתן להעביר שברי ניירות ערך";
  - a transfer to the same owner needs proof of ownership of the receiving account;
  - mutual funds need a signed mutual-fund transfer form;
  - fees follow the tariff.

  Altshuler Shaham Trade: "לא כל נייר ערך ניתן להעברה אוטומטית". TASE securities and most US-listed securities can move, subject to both institutions. It gives up to 5 trading days for Israeli securities and up to 14 for foreign ones.
- Conditions / exceptions: Institution statements, not regulation. No regulator rule on the broker-to-broker timeline was found. For moving the whole bank relationship, see SW-29: untransferable securities stay at the old bank.
- Figures: 5 and 14 trading days (Altshuler Shaham Trade).
- Source: [Leumi, online securities-transfer instructions][leumitr] · institution; [Meitav Trade article, 03/08/2026][meitavtr] · institution (marketing article); [Altshuler Shaham Trade, transfer FAQ][astr] · institution · checked 2026-10-22
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: yes.

### SW-36 Tax on moving securities: same owner described as neutral, different owner taxed with zero cost basis (institution sources only)
- Rule: Altshuler Shaham Trade states a transfer between accounts with the same ownership is not a tax event. With different ownership it may be one, and the securities are recorded at "שער עלות אפס". Leumi states that a transfer to a different entity, or to a relative without the signed declaration, is a sale "החייב בניכוי מס במקור" at the closing price, with the receiver's cost "שער עלות הנייר יהיה אפס". Meitav Trade's article says the move "אינה נחשבת לאירוע מס", that "רצף המס נשמר", and that tax losses "לא נמחקים במעבר" but may need confirmations from the bank.
- Conditions / exceptions: No Tax Authority source was read (open question 11). Selling to switch funds or securities is a sale (`tax-securities-israeli.md` TXS-21). Withholding by foreign brokers: BRK-27.
- Figures: none.
- Source: [Altshuler Shaham Trade FAQ][astr]; [Leumi instructions][leumitr]; [Meitav Trade article][meitavtr] · checked 2026-10-22 · institution
- Dimensions: `switching-tax-event`, `loss-offset`, `tax-at-exit`
- Likely to change: unknown.

### SW-37 Foreign brokers: no regulator process found
- Rule: No Israeli rule was found on moving securities from an Israeli bank or broker to a foreign broker, or back. A foreign broker reached under an ISA s.49A permit is not ISA-supervised (BRK-06). Its withholding differs (BRK-27).
- Conditions / exceptions: Experience only: SW-X03. Open question 12.
- Figures: none.
- Source: pointers BRK-06, BRK-27 · checked 2026-10-22 · links from the cited rules: [1](<https://lp3.inter-il.com/about-3>), [2](<https://www.bank-yahav.co.il/footer/footer-menu/securrities-permit/>), [3](<https://www.nevo.co.il/law_html/law00/70349.htm>), [4](<https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a>), [5](<https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf>)
- Dimensions: `transfer-switch-process`, `foreign-withholding-domicile`, `protection`
- Likely to change: yes (CMA 2026 plan item on foreign providers noted in BRK-06).

### Cross-wrapper

### SW-38 What to check after a switch
- Rule: Each item below rests on a rule:
  - Both written confirmations arrive within 15 business days. They show the amount by component, the determining date, and any balance left (SW-09).
  - The fee on the new account matches the offer, and a discount appears in the personal online account with its start and end dates. If the email is known, it is emailed within 10 business days (PF-16).
  - The track is the one chosen, not the default (SW-16).
  - For a pension fund, the insurance track and cover: the Annex B conditions and exclusions, and that qualifying months carried over (SW-12).
  - The employer deposits to the new fund. Without that, an active member's request lapses after 120 days (SW-08, SW-10).
  - For a keren hishtalmut, the first payment date carried over (SW-11, KH-14).
  - For a bank switch:
    - standing orders and direct debits arrive at the new account;
    - the half-yearly rerouting update names the payers (SW-30);
    - deposits and untransferable securities left at the old bank are listed (SW-29);
    - no fees are charged on a "חשבון תמורה" (SW-29).
  - For securities, every security arrived. Cost basis and loss carry-forward are recorded at the receiver (SW-36).
- Conditions / exceptions: A composed checklist; it adds no rule of its own.
- Figures: as in the rules named.
- Source: as in the rules named · checked 2026-10-22 · links from the cited rules: [1](<https://www.analyst.co.il/media/dtnkdiyk/%D7%97%D7%95%D7%96%D7%A8-%D7%92%D7%95%D7%A4%D7%99%D7%9D-%D7%9E%D7%95%D7%A1%D7%93%D7%99%D7%99%D7%9D-2017-9-17-%D7%94%D7%A2%D7%91%D7%A8%D7%AA-%D7%9B%D7%A1%D7%A4%D7%99%D7%9D-%D7%91%D7%99%D7%9F-%D7%A7%D7%95%D7%A4%D7%95%D7%AA-%D7%92%D7%9E%D7%9C.pdf>), [2](<https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz2017915.pdf>), [3](<https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל)>), [4](<https://www.fnx.co.il/ishtalmutfund/faq/>), [5](<https://www.nevo.co.il/law_html/law01/255_226.htm>), [6](<https://boi.org.il/media/qempydw4/h2863.pdf>), [7](<https://boi.org.il/media/ydrnjadk/111609.pdf>), [8](<https://boi.org.il/media/qy0gzddj/111486.pdf>)
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: with the rules named.

## Experience (labelled; not rules, never computed)

Per `docs/product.md` 3.7, forum and press accounts are shown as experience with their source. They are one person's account, not verified.

### SW-X01 Quote withdrawn after clearing-house consent; report allegedly pulled without consent; retention after the first deposit
- Account: In "התייעצות בדבר שני סיפורים מקוממים על מעבר קופות" (Hasolidit, opened 15/7/26), a member says Migdal quoted 0% of balance and 1.9% of deposits directly. Migdal withdrew the quote after he authorised a clearing-house report and offered close to his existing fee. The agent would not put the first quote in writing. He says that at Clal, after he asked that his agent not be involved, the agent called the next day quoting a clearing-house report, and that Clal's call centre said "באמת כתוב שאין אישור להוציא דוח ובכל זאת הוציאו". Replies advise using an independent agent and expecting a retention call from the old fund once the new fund receives the first salary deposit.
- Source: [Hasolidit thread .36841](https://www.hasolidit.com/kehila/threads/.36841/) · checked 2026-10-22 · secondary (experience)

### SW-X02 Fees changed after an employer change; "start the move, take the retention offer, cancel"
- Account: In "הרעת דמי ניהול במעבר מעסיקים" (Hasolidit, 16/6/26) a member reports different fees on each payslip after changing employer, despite being told the fees would stay. A reply advises moving to another company, waiting for the retention call, and then "בטל את הניוד (נציג השימור ידאג להכל)". This depends on the cancellation right in SW-07.
- Source: [Hasolidit thread .36752](https://www.hasolidit.com/kehila/threads/.36752/) · checked 2026-10-22 · secondary (experience)

### SW-X03 Moving holdings to a foreign broker
- Account: In "האם אפשרי להעביר ניירות ערך ישראלים לאינטראקטיב?" (Hasolidit, 12/7/25), one member says only pension and provident money moves without a tax event. A moderator answers that a portfolio can move as is without tax "כל עוד החברה השנייה תומכת בבורסות של הניירות שרכשת". Another member thought the holdings had first to be converted to their foreign-listed line. The thread does not resolve cost basis or withholding.
- Source: [Hasolidit thread .34986](https://www.hasolidit.com/kehila/threads/%D7%94%D7%90%D7%9D-%D7%90%D7%A4%D7%A9%D7%A8%D7%99-%D7%9C%D7%94%D7%A2%D7%91%D7%99%D7%A8-%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA-%D7%A2%D7%A8%D7%9A-%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%9D-%D7%9C%D7%90%D7%99%D7%A0%D7%98%D7%A8%D7%90%D7%A7%D7%98%D7%99%D7%91.34986/) · checked 2026-10-22 · secondary (experience)

### SW-X04 Without an agent
- Account: In "קרן פנסיה עם דמי ניהול אטרקטיביים, אבל ללא סוכן" (Hasolidit, 11/10/26; first page of five read), a member writes "בעלי ואני נמצאים בקרן פנסיה ברירת מחדל ללא מגע יד סוכן". The member changes tracks in the personal area and pays an adviser only for specific events.
- Source: [Hasolidit thread .37102](https://www.hasolidit.com/kehila/threads/.37102/) · checked 2026-10-22 · secondary (experience)

## Playbook order per wrapper (index to the rules above)

This is a composed index for 3.7; each step renders from the rule named.

- **Keren hishtalmut:**
  1. Check the clock (KH-10, KH-14).
  2. Get your own data (SW-18).
  3. Choose the receiving fund and track (SW-16).
  4. Join directly or through an agent (SW-17).
  5. Sign the whole-balance request at the receiving fund (SW-02, SW-03, SW-20).
  6. Tell the employer where to deposit (SW-10).
  7. The first deposit sets the determining date (SW-04).
  8. Expect rejection or delay notices within 3 business days (SW-05).
  9. Expect a retention contact (SW-19, SW-X01).
  10. The cancellation right lasts until the money moves (SW-07).
  11. The money moves within 10 business days (SW-06).
  12. Confirmations come within 15 business days (SW-09).
  13. Verify (SW-38).
- **Pension fund:** the same order, adding the insurance form and continuity (SW-12), blocks (SW-13), partial transfers (SW-14) and inactive-account consolidation (SW-22).
- **Provident fund for annuity:** as for pension, without insurance (SW-23).
- **Kupat gemel lehashkaa:** routes (SW-21), then steps SW-02 to SW-09 (inactive member: the determining date is receipt), then verify (SW-38).
- **IRA:** routes and money types (SW-01, SW-23), cash or in kind (SW-24), then SW-02 to SW-09.
- **Child savings:** SW-25.
- **Bank current account:**
  1. Request at the receiving bank (SW-26).
  2. Read the information page (SW-31).
  3. Choose the transfer day; the cancellation window applies (SW-27).
  4. Expect a retention approach under the bank rules (SW-28).
  5. Deposits and securities left behind (SW-29).
  6. Rerouting (SW-30).
  7. Verify (SW-38).
- **Bank deposits:** SW-32.
- **Brokerage:**
  1. Open at the receiver.
  2. Request at the old institution (SW-35).
  3. Cost (SW-33, SW-34).
  4. Tax (SW-36).
  5. Foreign brokers (SW-37).
  6. Verify (SW-38).

## Proposed dimensions

- `agent-involvement`: whether an agent or adviser is attached, how they are paid (distribution fee, or a fee from the client that may not be a percentage), and whether the saver can act directly (SW-17).
- `data-consent`: who may pull the saver's consolidated data and on whose request (clearing house, SW-18).
- `offer-validity`: whether a quoted fee binds, for how long a granted discount lasts, and what ends it early (SW-19, PF-13, PF-14).
- `rerouting-continuity`: how long payments to an old account keep reaching the new one after a switch (SW-30).

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| ניוד / העברת כספים בין קופות גמל | transfer between funds | Moving a balance to another fund or manager | app, ads, regulation | Transfer Regs; Phoenix FAQ |
| קופה מעבירה / קופה מקבלת | transferring / receiving fund | The two sides of a fund transfer | forms, regulation | Circular 2017-9-17 |
| המועד הקובע | determining date | First deposit at the receiving fund (active member) or receipt of the request (inactive member); insurance liability switches on it | forms, confirmations | Transfer Regs reg. 1 |
| טופס בקשת העברה | transfer request form | Annex A form signed at the receiving fund | forms | Circular Annex A |
| ברירת מחדל (בטופס ההעברה) | default (on the form) | Full balance, all components, all tracks | forms | Circular Annex A |
| טופס לעניין הכיסוי הביטוחי | insurance-cover form | Annex B: the receiving fund's written insurance terms | forms | Circular Annex B |
| טופס הצהרת עובד מטפל | handling employee's declaration | Annex D: states the determining date | forms (internal) | Circular Annex D |
| דחיית בקשה להעברת כספים / עיכוב בקשה | rejection / delay of a transfer request | Annex E and E1 notices with fixed reason lists | notices | Circular Annexes E, E1 |
| הודעת עמית על ביטול בקשת העברה / הודעת ביטול / חרטה מניוד | cancellation notice / cancelling a transfer | Annex F; valid until the money moves | forms, manager FAQ | Circular Annex F; Phoenix FAQ |
| אישור לעמית עובר | confirmation to the transferring member | Written confirmation within 15 business days | letters | Circular s.6 |
| הודעה למעסיק | notice to employer | Annex 11 notice of severance moved | letters | Circular s.5א |
| עמית פעיל / עמית לא פעיל | active / inactive member | Whether deposits are coming in; changes the determining date and lapse period | forms | Circular s.3(יב), (יג) |
| חודשי ביטוח / תקופת אכשרה | insurance months / qualifying period | Months credited to the new fund's qualifying period | bylaws, circular | Circular s.4(ב) |
| הפקדה חודשית רעיונית | notional monthly deposit | Basis for cover after transfer from a non-pension fund | circular | Circular s.4(א) |
| תוספת לקצבת נכות / תוספת לקצבת שארים | disability / survivors' supplement | Increase in cover; above 10% gets no carried months | circular | Circular s.4(ב)(2) |
| שימור / נציג שימור | retention / retention representative | Old provider's effort to keep the saver | manager mailbox name, forum | Phoenix FAQ; SW-X02 |
| מערכת סליקה פנסיונית מרכזית / המסלקה הפנסיונית | central pension clearing house | Consolidated data and money-transfer system | law, bank pages | Advice and Clearing Law s.31ט |
| ייפוי כוח | power of attorney | Lets an adviser receive the customer's information | law, forms | Advice and Clearing Law s.27(ב)(7) |
| עמלות הפצה | distribution fees | Paid by product providers to advisers or banks | bank pages | Mizrahi-Tefahot page |
| העברת פעילות פיננסית / מעבר מבנק לבנק בקליק | moving financial activity / "bank-to-bank in a click" | The online account-switching service | bank sites, BoI | Directive 448 |
| בנק מקורי / בנק קולט | originating / receiving bank | Sides of a bank switch | directive | Directive 448 s.3 |
| יום המעבר | transfer day | Day the move executes and rerouting starts | directive, bank notices | Directive 448 s.3 |
| ניוד / ניתוב / תקופת הניתוב | transfer / rerouting / rerouting period | Rerouting of payments to the new account after the move | directive, rules | Directive 448 s.3; circular h-2863 |
| בקשה תקינה | complete request | Request meeting the Governor's rules | directive | Directive 448 s.3 |
| חשבון תמורה | residual account | Old-bank account kept only for leftover activity; no fees | directive | Directive 448 s.3 |
| ניסיון לשימור הלקוח | retention attempt | Old bank's contact; must state its purpose; no pressure | directive | Directive 448 s.9 |
| שמירת הטבות והנחות | keeping benefits and discounts | Benefits kept 3 months or until the move | directive | Directive 448 s.7 |
| פעילות שנותרת בבנק המקורי לאחר הניוד | activity left at the old bank | Deposits, savings plans, untransferable securities, pledged loans and assets | directive | Directive 448 s.3 |
| חשבון במערכת סגורה / ניוד פיקדונות | closed-system account / deposit portability | Deposit account fed only from the customer's own account elsewhere | law, bank sites | Amendment 38 s.5ב2 |
| העברת ניירות ערך – לחשבון אותו לקוח בגוף פיננסי אחר | securities transfer to the same client's account at another financial body | Supervised bank price | tariff | Fees Rules part 4(א)(6); Discount 4.6.1 |
| (בפיקוח) / (פיקוח) | supervised | Price set under the supervision of services | tariff | Fees Rules; Discount tariff |
| שער עלות אפס | zero cost basis | Cost recorded at the receiver when ownership changes | broker and bank pages | Altshuler Trade FAQ; Leumi |
| שברי ניירות ערך | fractional securities | Cannot be transferred | bank instructions | Leumi |
| טופס העברה של קרנות נאמנות | mutual-fund transfer form | Needed to move mutual-fund units | bank instructions | Leumi |

## Institutions

This file does not enumerate providers. Who offers each wrapper, and from which register, is in the wrapper files: Gemel-Net and Pension-Net managers (KH-24, KGL-22, PEN institutions table, IRA institutions table), the child-savings funds and banks (CS-08, CS-22), the BoI bank list (`bank-current-account-deposits.md` Institutions), and TASE members (`brokerage-account.md` BRK-02, BRK-03). The switching duty in directive 448 binds every "bank" as s.5ב1(א) defines it, minus any bank exempted under s.5ב1(ה). Which banks, if any, are exempt was not found (open question 9). The institution pages used here (Phoenix, Leumi, Mizrahi-Tefahot, Discount, IBI, Altshuler Shaham Trade, Meitav Trade) are examples of how the rules appear in practice, not a register.

## Open questions

1. **Current version of circular 2017-9-17.** The copy read (Analyst host) is a consolidated, amended text: s.3(ד) reads "בוטל" and sections 4א and 5א were added. It does not say which amending circulars it includes or their dates. Likely answer: the CMA circulars archive or codex on gov.il, opened by hand (PF open question 9).
2. **Does circular 2017-9-17 govern gemel lehashkaa?** Annex A's fund-type list has no "קופת גמל להשקעה", which postdates the 2017 text. The gemel lehashkaa bylaws apply the transfer regulations and "the Commissioner's instructions" (KGL-10). Likely answer: a later amendment of the circular or the codex.
3. **CMA rule on retention contacts and retention offers in provident products.** Not in the Advice, Marketing and Clearing Law or the transfer circular. Two searches found none. Likely answer: the CMA customer-service or marketing circulars ("חוזר שירות", codex part on fair dealing), opened by hand.
4. **Does a fee quoted before joining bind the institution?** The CMA discount circular (PF-13) runs from when the fee is first charged. Likely answer: the joining circular ("חוזר צירוף", in the CMA 2026 plan for review) or the advice-document circular.
5. **Clearing house: the price of a direct request, and how consent is checked.** Only bank routes, which are free, were read. Kol Zchut is blocked. Likely answer: the regulations under s.31יד and s.31טז, and the operator's site.
6. **Who must tell the employer to redirect future deposits after an active member's transfer, and the employer's deadline.** Not found. Likely answer: the payments regulations 2014 (KH-06 source) or the joining circular.
7. **How PEN-14 combines with circular s.4(ב).** PEN-14 gives a new 60-month qualifying period when tagmulim money is moved out (bylaw). Circular s.4(ב) credits insurance months on a fund-to-fund move. Which governs a full pension-to-pension transfer? For `pension-and-gemel-lekitzba.md`: read a fund's bylaw section on incoming transfers.
8. **Is a transfer between pension funds or provident funds for annuity tax-neutral?** The TXP file states nothing either way. For `tax-pension-gemel-lekitzba.md`.
9. **The Governor's rules 2019 on bank switching**: the account types and activity types covered, whether securities move under the service, which banks are exempt, and the exact meaning of "sixth business day" in directive 448 s.6. Only the directive and circulars were read. Likely answer: BoI media PDF of the consolidated rules, and Reshumot ק"ת התש"ף p.183, התשפ"א p.3574, and קובץ תקנות 12530 (17.9.2026).
10. **The supervised price for moving securities**: the order that sets it, and whether it is per transfer (Discount "5 ₪ להעברה") or per security (Meitav "5 שקל לנייר ערך ישראל"). Also the source of the NIS 5 bank-to-non-bank cap Calcalist reports. One search found no order. Likely answer: the BoI price-supervision order under s.7 of the Banking (Customer Service) Law. This also closes BRK open question 12.
11. **Tax on moving securities between your own accounts**: cost basis carried over, losses carried forward, and whether a declaration is needed. Only institution statements were read. For `tax-securities-israeli.md` and `tax-securities-foreign.md`. Likely answer: the Income Tax withholding regulations on securities transfers, or a Tax Authority circular.
12. **Moving securities between an Israeli institution and a foreign broker**: feasibility for TASE lines, cost, and the withholding consequences. Only forum experience was found.
13. **Competition Authority deposit-portability directive**: text, effective date and tribunal status (BANK open question 6).
14. **"המנהל" in Transfer Regulations reg. 3(א)(12)**: confirm it is the Tax Authority director, as PF-17 reads it.
15. **Directive 448 after version 2 (8/21)**: whether a later version exists. Circular h-2863 refers to s.37 of the directive but amends only the rules.
16. **Removing an agent already attached to a provident account**, and whether an agent is re-attached on a direct transfer. CMA 2026 power-of-attorney circular (PF-31).

## Left out and why

- **Savings policies, executive insurance and insurance-fund (קופת ביטוח) transfers.** The circular's forms cover them, but they are tier 2 (`savings-policies-and-executive-insurance.md`).
- **Old pension funds, central and sector funds, transfers by employers** (circular s.4א on central severance funds; form part 3 for employer members). These are not choosable by an individual.
- **Transfers to a former spouse under the pension-splitting law, and transfers on death.** These are not switching decisions.
- **Exact tax computations on transfers and on securities moves.** They belong to the `tax-*.md` files and are pointed to per rule.
- **Tariff figures beyond examples.** They go to `data/` as dated snapshots (D3). The Discount and IBI figures here are examples for the rule base, not data.
- **Secondary sources seen but not used for any rule:**
  - the Funder article on fee refunds offered to lure members, and a Bizportal piece on a 2005 seven-day transfer procedure (search snippets only, not opened);
  - Kol Zchut on the clearing house (403);
  - the Civil Service Commission's 2020 pension guide (opened; it is for state employees and adds nothing general);
  - the mygemel blog's NIS 20 clearing-house price (snippet only).
- **Forum threads beyond the four cited,** and pages 2 to 5 of thread .37102 (not read).
- **Accessibility, legal analysis of remedies** (for example, a complaint over an unauthorised clearing-house report). CLAUDE.md excludes legal work.

## Sources

| Title | Publisher | Strength | URL | Checked |
|---|---|---|---|---|
| חוזר גופים מוסדיים 2017-9-17 "העברת כספים בין קופות גמל", 2.10.2017, consolidated copy, all 28 pages | CMA, hosted by Analyst | primary (third-party host) | [c17] | 2026-10-22 |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008, regs. 1 to 9 | Minister of Finance; Wikisource mirror (amendments to תשפ"ג) | primary (mirror) | [tr] | 2026-10-22 |
| חוק הפיקוח על שירותים פיננסיים (ייעוץ, שיווק ומערכת סליקה פנסיוניים), התשס"ה-2005, full text in two reads | Knesset; Wikisource mirror (to ס"ח תשפ"ו 912) | primary (mirror) | [lawadv] | 2026-10-22 |
| תקנות ... (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017, ק"ת 7819 | Reshumot, hosted by Meitav | primary (third-party host) | [ira17] | 2026-10-22 |
| הוראת ניהול בנקאי תקין 448, גרסה 1 (12/19), incl. Q&A annex | BoI Banking Supervision | primary | [d448v1] | 2026-10-22 |
| הוראת ניהול בנקאי תקין 448, גרסה 2 (8/21) | BoI Banking Supervision | primary | [d448v2] | 2026-10-22 |
| חוזר ח-2670, 17.8.2021 (update to directive 448) | BoI Banking Supervision | primary | [h2670] | 2026-10-22 |
| חוזר ח-06-2863 "הארכת תקופת הניתוב בעת מעבר בין בנקים – דברי הסבר", 18.10.2026 | BoI Banking Supervision | primary | [h2863] | 2026-10-22 |
| Draft "הארכת תקופת הניתוב" and draft rules amendment 2026, 9.8.2026 | BoI | primary (draft) | [d2026draft] | 2026-10-22 |
| Draft "הארכת תקופת הניתוב" and draft rules amendment (No. 2) 2023, 3.7.2023 | BoI | primary (draft) | [d2023draft] | 2026-10-22 |
| חוק הבנקאות (שירות ללקוח) (תיקון מס' 38), התשפ"ה-2025, ס"ח 3413 | Reshumot (Knesset) | primary | [am38] | 2026-10-22 |
| הצעת חוק פ/5281/25 (ניוד פקדונות ללא העברת חשבון בנק), tabled 30.12.2024 | Knesset | primary | [p5281] | 2026-10-22 |
| Knesset OData: bill 2226120 (P/5281/25), bill 2222052 (P/4960/25), status 104, status 118, documents for bill 2226120 | Knesset | primary | [p5281od]; [p4960od]; [st104]; [st118]; https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_DocumentBill?$filter=BillID%20eq%202226120&$format=json | 2026-10-22 |
| כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, consolidated to 9.4.2025, first schedule parts 4 and 5 | BoI (prepared by Hotzaat Halachot) | primary | [fees] | 2026-10-22 |
| Discount tariff, part 4 securities (07/02/2025) | Israel Discount Bank | institution | [disc4] | 2026-10-22 |
| IBI tariff ("נכון לתאריך: 1.7.2026") | IBI | institution | [ibi] | 2026-10-22 |
| Altshuler Shaham Trade, portfolio transfer FAQ | Altshuler Shaham Trade | institution | [astr] | 2026-10-22 |
| Meitav Trade, portfolio-transfer article, 03/08/2026 | Meitav Trade | institution (marketing article) | [meitavtr] | 2026-10-22 |
| Leumi, online securities-deposit transfer instructions | Bank Leumi | institution | [leumitr] | 2026-10-22 |
| Leumi, "עושים סדר בפנסיה" (clearing-house report service) | Bank Leumi | institution | [leumipen] | 2026-10-22 |
| Mizrahi-Tefahot, pension consulting page | Mizrahi-Tefahot | institution | [mizpen] | 2026-10-22 |
| Phoenix study-fund FAQ | The Phoenix | institution | [fnxkh] | 2026-10-22 |
| Calcalist, 27.08.2026, portfolio transfer costs | Calcalist | secondary | [calc] | 2026-10-22 |
| Hasolidit threads .36841 (15/7/26), .36752 (16/6/26), .37102 (11/10/26), .34986 (12/7/25) | Hasolidit forum | secondary (experience) | links in SW-X01 to SW-X04 | 2026-10-22 |
| Opened, not used: מדריך ביטוח וחיסכון פנסיוני בשירות המדינה, 2020 | Civil Service Commission | primary (state employees only) | https://www.gov.il/BlobFolder/generalpage/retirement_guides/he/insurance-and-pension-savings-guide-2020.pdf | 2026-10-22 |

[c17]: https://www.analyst.co.il/media/dtnkdiyk/%D7%97%D7%95%D7%96%D7%A8-%D7%92%D7%95%D7%A4%D7%99%D7%9D-%D7%9E%D7%95%D7%A1%D7%93%D7%99%D7%99%D7%9D-2017-9-17-%D7%94%D7%A2%D7%91%D7%A8%D7%AA-%D7%9B%D7%A1%D7%A4%D7%99%D7%9D-%D7%91%D7%99%D7%9F-%D7%A7%D7%95%D7%A4%D7%95%D7%AA-%D7%92%D7%9E%D7%9C.pdf
[tr]: https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל)
[lawadv]: https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ייעוץ,_שיווק_ומערכת_סליקה_פנסיוניים)
[ira17]: https://www.meitav.co.il/media/0qulk3pk/תקנות-ira-חדשות-יוני-2017.pdf
[d448v1]: https://boi.org.il/media/j35g4bzq/448_1.pdf
[d448v2]: https://boi.org.il/media/ahflwvpw/448_2.pdf
[h2670]: https://boi.org.il/media/0zllhi2z/h2670.pdf
[h2863]: https://boi.org.il/media/qempydw4/h2863.pdf
[d2026draft]: https://boi.org.il/media/ydrnjadk/111609.pdf
[d2023draft]: https://boi.org.il/media/qy0gzddj/111486.pdf
[am38]: https://fs.knesset.gov.il/25/law/25_lsr_6803031.pdf
[p5281]: https://fs.knesset.gov.il/25/law/25_lst_5380049.pdf
[p5281od]: https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill?$filter=PrivateNumber%20eq%205281%20and%20KnessetNum%20eq%2025&$format=json
[p4960od]: https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill?$filter=PrivateNumber%20eq%204960%20and%20KnessetNum%20eq%2025&$format=json
[st104]: https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status?$filter=StatusID%20eq%20104&$format=json
[st118]: https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status?$filter=StatusID%20eq%20118&$format=json
[fees]: https://boi.org.il/media/jbwnaivp/159a.pdf
[disc4]: https://www.discountbank.co.il/media/bjudw31y/part4_securities07022025.pdf
[ibi]: https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf
[astr]: https://www.as-invest.co.il/trade/faq_transfer/
[meitavtr]: https://www.meitav.co.il/trade/financial_info/self_trading_portfolio_transfer/
[leumitr]: https://leumi.co.il/he/Articles/47356
[leumipen]: https://www.leumi.co.il/Lobby/pension_information/36830
[mizpen]: https://www.mizrahi-tefahot.co.il/brokerage/pension/pension-consulting/
[fnxkh]: https://www.fnx.co.il/ishtalmutfund/faq/
[calc]: https://www.calcalist.co.il/article/hj55ri2pgx
