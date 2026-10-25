# Switching and transfers

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
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א)(1), (4), (6) "ובלבד שהעמית היה זכאי למשוך את הכספים בפטור ממס" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=5) p.5, reg. 3(א)(1), (4), (12) "מקרן השתלמות לקרן השתלמות אחרת" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o=#page=2) p.2, s.2 and s.3: reg. 2(א)(7) and reg. 3(א)(11א) "מקופת גמל להשקעה לקופת גמל להשקעה אחרת" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no regulation change is in the CMA 2026 plan (PF-31).

### SW-02 Step 1: the saver goes to the receiving fund, which checks eligibility and hands over the forms
- Rule: The receiving fund's manager checks two things: that the transfer is allowed from the transferring fund under the regulations, and that the member meets its joining rules. It does so under its own procedures, using forms that follow the circular's annexes (circular s.3(א)). If both hold, it gives the member the transfer request form (Annex A, parts 1 to 3). If insurance cover can be given, it also gives a form signed by the receiving fund on the insurance cover (Annex B). The forms are handed over with every required detail filled in (s.3(ב)). The member signs personally, or the guardian signs for a member who has one, and the member submits the form to the receiving fund (s.3(ג)).
- Conditions / exceptions: Annex A has three parts. Part 1 is for a transfer into a pension fund or an insurance fund (salaried or self-employed member). Part 2 is for a provident fund that is neither. Part 3 is for an employer member or a cooperative member. When a tagmulim or savings account is opened for a minor as a gift, the giver who states that someone other than the minor's parents will manage the account is treated as the minor's guardian (s.3(ג)). Managers also take the request online. Phoenix says "ניתן לבצע זאת דיגיטלית למילוי הטופס המקוון" (institution). Gemel lehashkaa is not one of the fund types the Annex A form lists (open question 2).
- Figures: none.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(א)-(ג) "הגוף המנהל של קופה מקבלת יבדוק אם ניתן לבצע העברה" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.11-17, Annex A · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "ניתן לבצע זאת דיגיטלית למילוי הטופס המקוון" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`
- Likely to change: yes. The CMA 2026 plan amends the transfer circular to allow identification other than an Israeli ID for residents abroad (PF-31).
**[2026-10-24 R4 research pass]** Confirmed verbatim in the CMA's own copy on gov.il (SW-41).

### SW-03 What the transfer form says, and its defaults
- Rule: In the Annex A form the member fills a table: "אני מבקש להעביר את" (the whole balance, or a percentage or amount), "שנצברו לזכותי" (all account components, or a named one), and "במסלול ההשקעה" (all tracks, or a named one). If the member leaves these blank, the default is full: "ברירת המחדל להעברת הכספים ... היא העברת מלוא הכספים שנצברו בחשבונך בקופה המעבירה, בכל מרכיבי החשבון ובכל מסלולי ההשקעה". The member declares that, from the determining date, "תהיו פטורים מלשלם לי כל תשלום שהוא, לרבות בשל חבות ביטוחית, הנובע מהכספים שהועברו". The member also declares that none of the blocks in SW-13 applies. If one arises between signing and the transfer date, the request is cancelled. A boxed notice says the request "ניתנת לביטול ובלבד שהכספים טרם הועברו" (SW-07).
- Conditions / exceptions: A footnote says a partial transfer request may be made subject to the law, but keren hishtalmut allows no partial transfer (PF-18). An active member also signs the 120-day statement (SW-08). An active member moving into a new pension fund declares what the transferring fund imposed on insurance cover (exclusions, underwriting supplements) and acknowledges that increased cover may carry a new qualifying period (SW-12).
- Figures: none.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.11-17, Annex A parts 1 to 3 "ברירת המחדל להעברת הכספים" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: see SW-02.

### SW-04 The determining date, and when the request is forwarded
- Rule: The receiving fund sends the request electronically to the transferring fund within two business days of the determining date ("המועד הקובע"). It attaches a copy of the member's ID or an e-signature protocol, and a declaration by its handling employee, on the Annex D form, stating the determining date (circular s.3(ו)). For an active member, the determining date is "המועד שבו הופקדו לראשונה בשל העמית כספים בקופה המקבלת אך לא לפני מועד קבלת הבקשה". For an inactive member, it is the date the request is received (reg. 1).
- Conditions / exceptions: Reading: for a member whose employer is still depositing, nothing is forwarded until the first deposit reaches the receiving fund. The switch therefore waits on the employer redirecting deposits (SW-10). The determining date is also the date insurance liability passes to the receiving fund (SW-12).
- Figures: 2 business days.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(ו) "בתוך שני ימי עסקים מהמועד הקובע" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.19, Annex D · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=2) p.2, reg. 1 "המועד הקובע" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: no.

### SW-05 Step 2: the transferring fund may reject or delay, and must say why within 3 business days
- Rule: If the transferring fund cannot transfer, it notifies the receiving fund within three business days of the day the request was passed to the transferring fund's managing body ("ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה"), on the Annex E form (rejection) or the Annex E1 form (delay). If the reason is a rejection under Annex E, it also sends a copy to the member's address within three business days of the same day; it may send it by e-mail if the member agreed to receive notices that way (s.3(ז)). The receiving fund itself passes the request on within two business days of the determining date (s.3(ו), SW-04). If the request cannot be carried out, it is cancelled. If part of the money can move, that part moves, subject to reg. 9 (s.3(ח)).
  - Rejection reasons (Annex E): the route breaches reg. 2 or 3; an attachment or pledge on the whole balance; an old-age pension has started; a disability claim is pending; disability entitlement exists; an unpaid loan; death; a request to move to an eligible new pension fund while staying active in the transferring fund; the account is closed; the request has lapsed.
  - Delay reasons (Annex E1): no ID copy; no e-signature protocol; not signed by the member or guardian; no signature date; wrong account or policy number; wrong member status; no Annex A or Annex D; no fund tax-approval number.
- Conditions / exceptions: When a delay reason is fixed within the regulatory period, the member need not fill in new forms (s.3(ט), last paragraph). *2026-10-25 rule-text pass:* the three business days ran "from the determining date" in this rule; circular 2017-9-17 s.3(ז) (p.2) counts them from the day the request was passed to the transferring fund, so the start point was corrected (the figure, 3, is unchanged).
- Figures: 3 business days from the day the request reaches the transferring fund's managing body.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.2, s.3(ז)-(ח) "בתוך שלושה ימי עסקים ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.2-3, s.3(ט) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.20-21, Annexes E and E1 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Three business days confirmed in the gov.il copy (SW-41).

### SW-06 Step 3: the money moves within 10 business days, directly, in cash, with no transfer fee
- Rule: The transferring fund transfers within ten business days of a complete, signed request, unless the request was cancelled. The Commissioner may allow up to 20 more business days in special cases (reg. 5(א)). The money moves "ישירות בין הגופים המנהלים של הקופות ולא באמצעות העמית" and "העברת היתרה הצבורה תיעשה במזומנים" unless the managing bodies agree otherwise (reg. 7). If the transferring fund is late, it compensates the member out of its own management fees (reg. 6). It also sends the receiving fund the balance and daily returns within five business days so the return difference can be claimed (circular s.5(ה), (ו)).
- Conditions / exceptions: Transfer fees, late-interest rate and the closed list of charges are in PF-01 and PF-19. IRA transfers can be in kind (SW-24). Phoenix says "ניוד בין גופים, יתבצע תוך עשרה ימי עסקים מהמועד הקובע" (institution).
- Figures: 10 business days (+20 with approval); 5 business days for data on a late transfer.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 5(א) "בתוך עשרה ימי עסקים מהיום שבו הועברה לו בקשת העברה" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 6 (to p.7) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=7) p.7, reg. 7 "העברת היתרה הצבורה תיעשה במזומנים" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.4 (amends reg. 6) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.8, s.5(ה), (ו) · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "ניוד בין גופים, יתבצע תוך עשרה ימי עסקים מהמועד הקובע" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `fee-exit`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Ten business days, and the Commissioner's power to defer by up to twenty more, confirmed from gov.il (SW-41, SW-42); the funds' information passes through the clearing house (SW-42).

### SW-07 Cancelling a transfer: until the money moves, by a signed notice to the transferring fund
- Rule: The member cancels by signing a cancellation notice on the Annex F form ("הודעת עמית על ביטול בקשת העברה") before the transfer date under reg. 5(א). The form's boxed text says cancellation is "על-ידי חתימה על טופס הודעת ביטול והעברתו לקופה המעבירה", by fax, post or email among other ways. The transferring fund passes the notice to the receiving fund within that period. The request is cancelled when the notice reaches the transferring fund. Exception: if an insured event occurred after the determining date and before the notice was delivered, the request is not cancelled (s.3(ט)). After a cancellation, the receiving fund returns any money already deposited with it to the member's account in the transferring fund. It does so within 10 business days, with the receiving fund's return and with no deduction other than management fees (s.3(י)).
- Conditions / exceptions: Phoenix states cancellation ("חרטה מניוד") is possible "תוך 10 ימי עסקים מקבלת בקשת הניוד", or until the money moves if earlier. It names a mailbox for cancelling transfers out of Phoenix, shimur_haavarot_out@fnx.co.il, whose name refers to retention ("שימור") (institution). The two sources agree in practice: the money must move within 10 business days (SW-06).
- Figures: 10 business days to return deposits after cancellation.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.2-3, s.3(ט)-(יא) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.3, s.3(י) "בתוך עשרה ימי עסקים מהיום שבו התברר לו כי בוטלה הבקשה" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.12, Annex A boxed notice "על-ידי חתימה על טופס הודעת ביטול והעברתו לקופה המעבירה" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.22, Annex F "הודעת עמית על ביטול בקשת העברה" · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "תוך 10 ימי עסקים מקבלת בקשת הניוד" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Confirmed in the gov.il copy (SW-41).

### SW-08 A request lapses: 120 days for an active member without a deposit, 60 days otherwise
- Rule: An active member's request lapses if it is not forwarded to the transferring fund within 120 days of signing. Unless the member stated they will not deposit, it is forwarded only after a deposit arrives (SW-04). If the member told the receiving fund within those 120 days that no deposits will be made, the request lapses if not forwarded within 60 days of that notice (s.3(יב)). An inactive member's request lapses if not forwarded within 60 days of signing (s.3(יג)).
- Conditions / exceptions: The form lets an active member tick that they already state no deposits will be made, and then the member is treated as inactive for the determining date (Annex A, item 6). Phoenix: "אם לא בוצעה הפקדה עד 120 יום מיום הבקשה - הניוד יבוטל" (institution).
- Figures: 120 days; 60 days.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.3, s.3(יב), (יג) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.12, Annex A part 1 item 6 (part 2 on p.15) · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "אם לא בוצעה הפקדה עד 120 יום מיום הבקשה" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`
- Likely to change: no.
**[2026-10-24 R4 research pass]** 120 and 60 days confirmed in the gov.il copy (SW-41).

### SW-09 Step 4: both funds confirm in writing within 15 business days
- Rule: The transferring fund sends the member a confirmation within 15 business days of the transfer. It shows at least: fund name and tax-approval number and the member's account number (policy number for an insurer); the manager's name and contact details; the transfer date; the determining date, with an explanation that the transferring fund's insurance liability ended from it; the amount moved, split for a salaried member into employee tagmulim, employer tagmulim and severance; and, after a partial transfer, the balance left and the reason the account was split (s.6(א)). The receiving fund sends a confirmation within 15 business days of receiving the money. It shows the same items, including that its insurance liability started on the determining date (s.6(ב)). Either fund may send these by email only if the member agreed (s.6(ג)).
- Conditions / exceptions: Phoenix states "אישור לעמית על ביצוע ניוד יוצא / נכנס, יישלח תוך 14 ימי עסקים" (institution).
- Figures: 15 business days.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.8-9, s.6 "לא יאוחר מחמישה עשר ימי עסקים" · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "יישלח תוך 14 ימי עסקים" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: no.
**[2026-10-24 R4 research pass]** Fifteen business days confirmed in the gov.il copy (SW-41).

### SW-10 The employer: the old fund notifies it of severance moved; future deposits follow the employee's choice
- Rule: A transferring fund that moves money from a salaried member's account that includes a severance component notifies the member's employer within 15 business days. It uses the Annex 11 notice, which states the severance amount moved and to which fund (s.5א). Phoenix states that after a fund is opened "האישור נשלח למעסיק באופן אוטומטי" (institution).
- Conditions / exceptions: The employee chooses the fund and the employer may not make its payments conditional on a fund (law s.20, `pension-and-gemel-lekitzba.md` PEN-06, `keren-hishtalmut.md` KH-03). No source read sets out who must tell the employer to redirect future deposits, or when (open question 6). For an active member the transfer waits on that first deposit (SW-04, SW-08).
- Figures: 15 business days.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.8, s.5א · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.26-27, Annex 11 · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "האישור נשלח למעסיק באופן אוטומטי" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: no.
**[2026-10-24 R4 research pass]** The 15-business-day employer notice under s.5א confirmed in the gov.il copy (SW-41); who tells the employer to redirect future deposits is still not in the circular (open question 6).

### SW-11 History travels with the money
- Rule: On the transfer date the transferring fund sends the receiving fund a data file with: the member's identity; the fund details; for a new pension fund, the insurance cover the member had; the balance moved; "פירוט מלא של כל התנועות הכספיות" up to the determining date, including movements in earlier transferring funds, with each deposit split into its components; and the current and past employers (s.5(א)). For a new pension fund it also sends any exclusions or underwriting supplements in force (s.5(ב)). For a keren hishtalmut it also sends an Annex H data file (s.5(ג)).
- Conditions / exceptions: Data for periods before 1997 that is not in the fund's computer may be omitted (s.5(ד)). The study-fund data is what carries the first payment date and seniority (`keren-hishtalmut.md` KH-14; `tax-hishtalmut.md` TXH-19).
- Figures: none.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.7-8, s.5(א)-(ד) "פירוט מלא של כל התנועות הכספיות" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `age-or-use-exemption`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Confirmed in the gov.il copy; the data now travel in annex ג 'ממשק ניוד' of the uniform-structure circular (SW-42).

### SW-12 Pension insurance on a transfer: who is liable when, cover level, qualifying months
- Rule: The transferring fund "יהיה אחראי לתשלום כספים לפי הכיסויים בקופה המעבירה בשל מקרה ביטוח שאירע לפני המועד הקובע". The receiving fund is liable for an insured event "שאירע במועד הקובע או לאחריו" (reg. 8(א), (ב)). After a partial transfer, the transferring fund stays liable for the death cover left with it, reduced in proportion to the balance left (reg. 8(ג)). In a receiving new pension fund:
  - Cover level: disability and death cover is set as if the deposits made in the transferring fund had been made in the receiving fund. From a fund that is not a new pension fund, it is set as if fixed "notional monthly deposits" had been made for a notional period (circular s.4(א)).
  - Qualifying months: for an active member, the consecutive insurance months accumulated in the transferring fund count toward the same risks (s.4(ב)(1)). They do not count for the part of a disability or survivors' supplement that rises by more than 10% over the notional pension (s.4(ב)(2)). They do not count for a risk that had an exclusion or underwriting supplement in the transferring fund at the transfer date (s.4(ב)(3)).
  - Written terms: the receiving fund states in writing, on Annex B, any conditions or exclusions on the cover.
- Conditions / exceptions: The 60-month qualifying period, and the new qualifying period when tagmulim money is withdrawn or moved out, are bylaw rules in `pension-and-gemel-lekitzba.md` PEN-14. Renewal after 12 months without insurance is in PEN-16. Bylaws were not read for how PEN-14 and circular s.4(ב) combine on a fund-to-fund transfer (open question 7). Leaving a pension fund for a provident fund or an IRA ends that money's insurance (PEN-35; IRA-02).
- Figures: 10% threshold; notional monthly deposit = average monthly deposits over the last 12 months, excluding severance.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=7) p.7, reg. 8(א)-(ג) (to p.8) "שאירע במועד הקובע או לאחריו" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.3-5, s.4; s.4(א) on p.3, s.4(ב) on p.4 · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.18, Annex B · checked 2026-10-25 · primary
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
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 4 and reg. 5(ב) "שלא ניתן להעבירו בשל עיקול או שיעבוד כדין" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.3 (adds reg. 4(8)) "והוא ממשיך להיות עמית פעיל בקופת הגמל המעבירה" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=#page=7) p.7, s.2 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no.

### SW-14 Partial transfers: allowed except from a keren hishtalmut; which money leaves first in a pension fund
- Rule: A transferring fund transfers the balance or part of it (PF-18). From a keren hishtalmut no part may be moved (PF-18, KH-17). When part of a comprehensive or general new pension fund account is moved, money is taken from each component "לפי סדר הפקדתם", running "מן המועד המאוחר ביותר עד המועד המוקדם ביותר" (reg. 9(ד)).
- Conditions / exceptions: The form's default is a full transfer (SW-03). A partial move leaves proportional death cover behind (SW-12). It can also let the manager end a fee discount early (SW-15).
- Figures: none.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=5) p.5, s.5 (replaces reg. 9), reg. 9(ד) "מן המועד המאוחר ביותר עד המועד המוקדם ביותר" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=#page=7) p.7, s.3 (amends reg. 9(ד)) · checked 2026-10-25 · primary; PF-18 for reg. 9(ג)
- Dimensions: `transfer-switch-process`
- Likely to change: no.

### SW-15 Fees: no transfer fee, but moving can cost a discount
- Rule: No transfer fee is a permitted charge (PF-01, PF-19). A full or partial transfer, or a move to another track, is one of the cases in which a manager may raise a discounted fee before the discount period ends, after the notice in PF-16 (PF-14 case 2; gemel lehashkaa bylaws KGL-16). A move between employers with group arrangements at the same body follows PF-15. A selected pension fund's fixed fee is guaranteed only for a member who joined during the period the fund was selected (`pension-and-gemel-lekitzba.md` PEN-23).
- Conditions / exceptions: This is a pointer rule; the sources are in the rules named.
- Figures: none here.
- Source: pointers to PF-01, PF-14, PF-15, PF-16, PF-19, KGL-16, PEN-23 (each sourced in its file); links from the cited rules: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299984.pdf) p.13, s.32(א) "חברה מנהלת לא תגבה מנכסי קופת גמל שבניהולה" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 20), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_366997.pdf) p.2, s.1 · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf) p.2, s.3(ב)(2) "העברה מלאה או חלקית של יתרה צבורה לקופת גמל אחרת" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, regs. 5-7 (to p.7) · checked 2026-10-25 · primary; [אלטשולר שחם חיסכון פלוס – תקנון תקני לקופת גמל להשקעה, מרץ 2025](https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf) p.10, clauses 36-37 · checked 2026-10-25 · institution; [אינפיניטי – תקנון קופת גמל להשקעה, בתוקף מיום 1.7.2024](https://infinity.co.il/wp-content/uploads/2025/07/תקנון-גמל-להשקעה-בתוקף-מיום-1.7.2024.pdf) p.10 · checked 2026-10-25 · institution; [Phoenix gemel lehashkaa FAQ](https://www.fnx.co.il/gemel/gemelhashkaa/faq/) "עלולים להשתנות בעת ניוד לקופה אחרת" · checked 2026-10-25 · institution
- Dimensions: `fee-exit`, `fee-change-over-time`
- Likely to change: see PF-31.

### SW-16 The track and insurance track at the receiving fund
- Rule: The transfer form names the tracks the money leaves from (SW-03). Which track it lands in at the receiving fund is set by the member's joining choice there. A member who chooses no track is placed in the receiving fund's default track: PF-24, KH-19, KGL-11, and for pension the age-dependent track (PEN-17) and the default insurance track (PEN-11).
- Conditions / exceptions: A pointer rule. Check the track on the first statement (SW-38).
- Figures: none.
- Source: pointers to PF-24, KH-19, KGL-11, PEN-11, PEN-17; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) p.11, Annex A table "במסלול ההשקעה" · checked 2026-10-25 · primary
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
- Source: [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.9, s.13(א) "רק כחלק מייעוץ פנסיוני או משיווק פנסיוני" · checked 2026-10-25 · primary; [חוק התכנית הכלכלית (תיקוני חקיקה ליישום המדיניות הכלכלית לשנות התקציב 2015 ו-2016), התשע"ו-2015](https://fs.knesset.gov.il/20/law/20_lsr_316718.pdf) p.23 (s.13(ב)(1) of the advice law as now worded) · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.10, s.19(א)(1) "שכר והחזר הוצאות המשולמים ישירות מאת הלקוח" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.12, s.27(ב)(7) "ייפוי כוח" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) p.13, s.28(ב) "המחושבים כשיעור מהסכומים שמעביר הלקוח" · checked 2026-10-25 · primary; [מזרחי טפחות – ייעוץ פנסיוני](https://www.mizrahi-tefahot.co.il/brokerage/pension/pension-consulting/) "מזכה את הבנק בעמלות הפצה מהיצרנים הפנסיונים" · checked 2026-10-25 · institution; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `fee-management-balance`
- Likely to change: yes. The CMA 2026 plan has a power-of-attorney circular for licensees (PF-31).

### SW-18 The clearing house: the saver's own data, and consent
- Rule: "מערכת סליקה פנסיונית מרכזית תמסור ללקוח, על פי בקשתו, מידע הנוגע לו לגבי מוצר פנסיוני או תכנית ביטוח, מכלל הגופים המוסדיים" (s.31ט(ג)). Information passes to advisers and agents only at the customer's request (s.31ט(א)(1)). Regulations are to cover "בדיקת קיומה של בקשה מטעם הלקוח או של ייפוי כוח" (s.31טז(ד)(1)). Where the CMA requires it, institutions must pass information and money through the system (penalty in s.32(ח)(1)).
- Conditions / exceptions: Free routes found, both institution pages:
  - Leumi: "שירות ללא עלות" for private customers of any bank aged 18 or over, once per customer. Registration finishes on the clearing-house site, where a credit card is entered for identity, "לא לצורך חיוב". The report shows balances, managers, the fees paid and projected pensions, and "המידע יהיה זמין לצפייה במשך שלושה חודשים בלבד".
  - Mizrahi-Tefahot: the request is free and "הבנק מממן את מלוא עלות הפנייה למסלקה", but the bank earns distribution fees on the advice (SW-17).
**[2026-10-24 R4 research pass]** The price cap for a saver's own request is now sourced (SW-44); the channel for fund-to-fund information is the clearing house (SW-42).

  The clearing house's own price list for a direct request was not read (open question 5). A forum account alleges an agent read a report the saver had not authorised (experience SW-X01).
- Figures: none.
- Source: [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.5, s.31ט(א)(1), (ג) "מערכת סליקה פנסיונית מרכזית תמסור ללקוח, על פי בקשתו, מידע הנוגע לו" · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.10, s.31טז(ד)(1) · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) p.12, s.32(ח)(1) · checked 2026-10-25 · primary; [בנק לאומי – עושים סדר בפנסיה](https://www.leumi.co.il/Lobby/pension_information/36830) "המידע יהיה זמין לצפייה במשך שלושה חודשים בלבד" · checked 2026-10-25 · institution; [מזרחי טפחות – ייעוץ פנסיוני](https://www.mizrahi-tefahot.co.il/brokerage/pension/pension-consulting/) "הבנק מממן את מלוא עלות הפנייה למסלקה" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: yes (CMA 2026 plan: clearing-house mandatory-use and payment circulars, PF-31).

### SW-19 Retention contacts and offers in provident products: no rule found; what is sourced
- Rule: Neither the Advice, Marketing and Clearing Law (read in full on the mirror) nor transfer circular 2017-9-17 contains a rule on a transferring fund contacting a member who asked to leave, or on retention offers. Sourced rules that bear on it:
  - The member can cancel until the money moves (SW-07).
  - A discount, once given, must stay valid for at least five years from when it is first charged (PF-13). It must appear in the personal online account, and be emailed within 10 business days if the email is known (PF-16).
  - A transfer, full or partial, lets a manager raise a discount early (PF-14).
- Conditions / exceptions: Whether a fee quoted before joining binds the institution was not found (open question 4). Experience on retention calls, withdrawn quotes and cancelling after a retention offer is in SW-X01 to SW-X02. The playbook asks the person to record every offer with its date and source (product.md 3.7).
- Figures: none.
- Source: [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני), התשס"ה-2005](https://fs.knesset.gov.il/16/law/16_lsr_299985.pdf) · checked 2026-10-25 · primary; [חוק הפיקוח על שירותים פיננסיים (עיסוק בייעוץ פנסיוני ובשיווק פנסיוני) (תיקון מס' 3), התשע"א-2011](https://fs.knesset.gov.il/18/law/18_lsr_301283.pdf) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.1-28 · checked 2026-10-25 · primary; PF-13, PF-14, PF-16
- Dimensions: `transfer-switch-process`, `fee-change-over-time`
- Likely to change: unknown (open question 3).

### Per wrapper (provident family)

### SW-20 Keren hishtalmut: whole balance, history kept, both funds told for one-account seniority
- Rule: A keren hishtalmut moves only whole, and only to another keren hishtalmut or, if the money could be withdrawn tax-free, to an annuity fund (SW-01, PF-18, KH-17). The study-fund data file carries its history (SW-11). Two accounts count as one for the tax period only if the employee and employer notify both funds and the conditions in KH-14 hold. Some funds do not accept deposits once the employer stops paying (KH-09).
- Conditions / exceptions: Tax: TXH-19 (history kept; tax neutrality inferred, open in that file). Phoenix states "ניוד בין גופים אינו אירוע מס" and "לא ניתן לבצע ניוד חלקי", and gives a digital joining fee of 0.75% (institution, 2026-10-22).
- Figures: none here.
- Source: pointers PF-18, KH-09, KH-14, KH-17, TXH-19; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) "ניוד בין גופים אינו אירוע מס" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `switching-tax-event`
- Likely to change: no.
- **[2026-10-23 R3 research pass]** Seniority on the move and the consolidation condition, from the regulations verbatim: SW-39.

### SW-21 Kupat gemel lehashkaa: only to another gemel lehashkaa, or to an annuity fund from 60; partial allowed
- Rule: Money moves only to another kupat gemel lehashkaa, or to an annuity fund at early retirement age for an annuity only (SW-01; KGL-09, KGL-10). A partial transfer is allowed (KGL-10). Withdrawing and re-depositing elsewhere instead of transferring is a withdrawal: it is taxed at exit (`tax-gemel-lehashkaa-ira-child.md`), and the new deposit counts against the annual ceiling (KGL-02), so it is not equivalent to a transfer.
- Conditions / exceptions: Track switches and transfers between gemel lehashkaa funds are not withdrawals, so they are not taxed: that is TXK-04's conclusion, drawn from the wording of the tax on amounts "משך" (withdrawn) and stated outright only by a managing company (Harel, "ללא אירוע מס"); Ordinance s.3(ה4)(3), cited below, taxes interest and gains withdrawn from a gemel lehashkaa as interest income and does not itself say that a transfer is untaxed. The circular's Annex A form does not list gemel lehashkaa (open question 2). *2026-10-25 rule-text pass:* the no-tax-on-transfer point is now attributed to TXK-04 as an inference, not to s.3(ה4)(3) (Ordinance, Tax Authority text, p.21), which speaks only of withdrawals.
- Figures: ceiling per KGL-03.
- Source: pointers KGL-02, KGL-09, KGL-10, TXK-04; links from the cited rules: [חוק הפיקוח על שירותים פיננסיים (קופות גמל) (תיקון מס' 15), התשע"ו-2016](https://fs.knesset.gov.il/20/law/20_lsr_343169.pdf) p.2, s.3 · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התש"ף-2020 (קובץ התקנות 8735)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/tZDvucD9RCpb4OFgftW2Mghx2FA7HU11Svr+ngxOA9o=#page=2) p.2, s.2 and s.3: reg. 2(א)(7) and reg. 3(א)(11א) "ובלבד שהעמית הגיע לגיל הפרישה המוקדמת" · checked 2026-10-25 · primary; [חוק גיל פרישה, התשס"ד-2004](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf) p.1, s.5 "גיל 60 לגבר ולאישה" · checked 2026-10-25 · primary; [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf) p.21, s.3(ה4)(3) (withdrawals taxed as interest; it does not address transfers) · checked 2026-10-25 · primary; [אלטשולר שחם חיסכון פלוס – תקנון תקני לקופת גמל להשקעה, מרץ 2025](https://www.as-invest.co.il/media/md1afb1l/אלטשולר-שחם-גמל-להשקעה-חיסכון-פלוס-תקנון-נקי-מרץ-2025.pdf) p.6, clauses 16-19 · checked 2026-10-25 · institution; [הראל – קופת גמל להשקעה, עיקרי התוכנית](https://www.harel-group.co.il/long-term-savings/funding-saving/join/doclib/%d7%92%d7%9e%d7%9c%20%d7%9c%d7%94%d7%a9%d7%a7%d7%a2%d7%94.pdf) "ללא אירוע מס" · checked 2026-10-25 · institution; [אייס – "קופות הגמל חוגגות: לקראת שינוי משמעותי בסכומי ההפקדה?"](https://www.ice.co.il/consumerism/news/article/1005636) · checked 2026-10-25 · secondary
- Dimensions: `transfer-switch-process`, `deposit-ceiling`, `switching-tax-event`
- Likely to change: no.
- **[2026-10-23 R3 research pass]** Route 3(א)(11א) and the reg. 3(ב)(1) carry-over of payment dates confirmed verbatim on Nevo (SW-39, SW-40).

### SW-22 Pension fund: insurance first, then route; automatic consolidation of inactive accounts
- Rule: A pension transfer follows SW-02 to SW-13, using form part 1 and the Annex B insurance form. Insurance continuity is in SW-12. When a member joins a pension fund, inactive accounts in other pension funds are found and moved unless the member objects within 45 days (PF-28). Pension money cannot go into an IRA (IRA-02). A member still active in a non-comprehensive fund cannot move to a comprehensive fund (SW-13, reg. 4(8)).
- Conditions / exceptions: Employer default and selected funds: PEN-06, PEN-23. Tax treatment of a transfer between pension funds is not stated in TXP (open question 8).
- Figures: 45 days (PF-28).
- Source: pointers PF-28, PEN-06, PEN-23, IRA-02; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.3 (adds reg. 4(8)) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ב-2022 (קובץ התקנות 10170)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qa0DjAH11hv4cTvqv8pm34W06X1DvaxhWwgq239BXaQ=#page=7) p.7, s.2 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `insurance-cover`
- Likely to change: no.

### SW-23 Provident fund for annuity: same process, no insurance to carry
- Rule: A provident fund for annuity (tagmulim and personal severance) moves under the same circular, on form part 2 (or part 1 into a pension fund), between annuity funds (reg. 2(א)(1)) and tagmulim funds (reg. 3(א)(1)). It has no pooled insurance (PEN-35), so SW-12 applies only when the receiving fund is a pension fund. It can move into an IRA only for permitted money types, up to the IRA ceiling, and severance money only with the employer's approval (IRA-07 to IRA-09).
- Conditions / exceptions: none beyond the pointers.
- Figures: none.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א)(1) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=5) p.5, reg. 3(א)(1) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.14-15, Annex A part 2 · checked 2026-10-25 · primary; pointers PEN-35, IRA-07 to IRA-09
- Dimensions: `transfer-switch-process`, `eligibility`
- Likely to change: no.

### SW-24 IRA: in kind only between IRAs; a cash transfer's clock starts once everything is sold
- Rule: Money enters an IRA from a regular fund in cash. Between IRA funds the member chooses cash or in kind. Out of an IRA to a regular fund, the receiving company chooses (IRA-23). Where a cash transfer is chosen, the transfer period in reg. 5(א) of the Transfer Regulations and in income-tax reg. 33ב(ב) "יחל ... ביום שבו סיים העמית בקופת הגמל בניהול אישי או מנהל התיקים מטעמו, להמיר את כל נכסי הקופה למזומנים" (reg. 11(ב)).
- Conditions / exceptions: Selling the holdings costs brokerage at the IRA's broker (IRA-21). Meitav Trade charges inside an IRA to move securities to another Israeli bank: NIS 20 per Israeli security, at most NIS 99 per portfolio, and USD 10 per foreign security (IRA-22). The member may cancel the IRA agreement at any time without payment (IRA-15).
- Figures: as in IRA-22 (effective 01.05.2026).
- Source: [תקנות הפיקוח על שירותים פיננסים (קופות גמל) (קופת גמל בניהול אישי) (תיקון), התשע"ז-2017 (קובץ התקנות 7819)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YWZP5bJenUsJq8XlM540e3hb~slMjpWNpg18mW8KtBk=#page=5) p.5, s.7 (adds reg. 11(ב)) · checked 2026-10-25 · primary; pointers IRA-15, IRA-21 to IRA-23
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `fee-trade`
- Likely to change: yes. The 2025 draft IRA amendment (IRA-27) is pending.

### SW-25 Child savings: through the receiving fund and National Insurance; bank money cannot move to another bank
- Rule: A parent who receives the child allowance moves the plan by contacting the receiving provident fund. Balance and gains move, and NII sends future deposits to the new fund (CS-11). The timelines are in National Insurance regulation 7 (CS-11). A bank plan cannot move to another bank. Since January 2025 a parent can, once, send future deposits from a bank to a provident fund, but the bank balance stays at the bank (CS-12). Before 18 the parent acts. From 18 only the child can act (CS-21).
- Conditions / exceptions: National Insurance circular 1356 (30.11.2016, pp.22-23) says bank savings can move neither to another bank nor to a provident fund ("לא תוכל להעביר את כספי החיסכון לבנק אחר או לקופת גמל"). The provident-fund half was changed by amendment 247 of the National Insurance Law, which added s.74ב(א)(2א) in force from 1.1.2025 (NII's consolidated law text, p.50, footnote 32): a parent may, once only, direct that the amounts be deposited in a kupat gemel lehashkaa from then on, and the amount accumulated until then stays managed at the bank. NII's change page and FAQ carry the current position: the bank saving can be stopped and a second saving opened in a provident fund at any stage, but the saving cannot move to another bank. *2026-10-25 rule-text pass:* the circular predates the 2025 change; the rule now cites the change itself (amendment 247, s.74ב(א)(2א), BTL law text p.50) and uses the circular only for what did not change; its page was corrected from p.21 to pp.22-23, where the transfer question is.
- Figures: per CS-11; one redirection from a bank (CS-12).
- Source: pointers CS-11, CS-12, CS-21 (each sourced in `child-savings.md`); links from the cited rules: [ביטוח לאומי – שינוי הגוף החוסך ומסלול החיסכון, תכנית חיסכון לכל ילד](https://www.btl.gov.il/benefits/children/HisahoLayeled/Pages/mavar.aspx) "לא תוכלו להעביר את החיסכון לבנק אחר" · checked 2026-10-25 · primary; [ביטוח לאומי – חיסכון לכל ילד, שאלות ותשובות](https://www.btl.gov.il/About/faq/SaveMoneyFAQ/Pages/default.aspx) "האם ניתן להעביר את החיסכון לגוף פיננסי אחר?" · checked 2026-10-25 · primary; [חוק הביטוח הלאומי [נוסח משולב], התשנ"ה-1995](https://www.btl.gov.il/Laws1/00_0001_000000.pdf), p.50, s.74ב(א)(2א) and footnote 32 (added by amendment 247, in force 1.1.2025) "בחירה כאמור תיעשה פעם אחת בלבד" · checked 2026-10-25 · primary; [המוסד לביטוח לאומי, חוזר 1356 – תכנית חיסכון לכל ילד (30.11.2016)](https://www.btl.gov.il/benefits/HozrimGimlaot/Hozrim/11.16%d7%97%d7%95%d7%96%d7%a8%20%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa%20%d7%97%d7%99%d7%a1%d7%9b%d7%95%d7%9f%20%d7%9c%d7%9b%d7%9c%20%d7%99%d7%9c%d7%93_.pdf) pp.22-23 (2016 text, before amendment 247) · checked 2026-10-25 · primary
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
- Source: [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.1, s.1 "באופן מקוון, נוח, אמין, מאובטח וללא עלות ללקוח" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.2, s.3 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.4, ss.11, 14-18 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.6, s.19 · checked 2026-10-25 · primary; [חוזר ח-2670 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, עדכון הוראה 448 (17.8.2021)](https://boi.org.il/media/0zllhi2z/h2670.pdf) p.1 "צפויים להיכנס לתוקף" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `fee-exit`, `regulator`
- Likely to change: yes. The rerouting period was extended twice (SW-30).
**[2026-10-24 R4 research pass]** Directive 448 version 4 (11/25) adds disclosure duties only (SW-43); this rule stands.

### SW-27 Timeline, transfer day and cancelling
- Rule: The customer may choose a later transfer day than the rules set, provided the process completes "בתוך 30 ימי עסקים מהיום בו הוגשה בקשה תקינה" (s.5(א)). In that case the process timeline counts from the seventh business day before the chosen day (s.5(ב)). The receiving bank checks whether the customer has active payment means (debit cards, cheques) there and, if not, offers to set the transfer day for when they will hold them (s.5(ג)). The receiving bank checks the request by the next business day and forwards it within one business day of finding it complete (s.24). The originating bank confirms completeness by the next business day and then restricts the old account: no change of owners, no new debit-type activity, no debit-card use (s.26). Cancelling: "בנק יאפשר ללקוח לבטל את בקשתו להעברת פעילות בכל שלב בתהליך הניוד ועד לסוף יום העסקים השישי של תהליך הניוד". At least the website, the phone centre, the branch and the channel the request came through must accept the cancellation, and any account owner may cancel (s.6).
- Conditions / exceptions: Whether the "sixth business day" counts from the request or toward the transfer day is not stated more precisely (open question 9). On the transfer day the old account allows no activity, including cash withdrawal (s.34(א)).
- Figures: 30 business days; 1 business day; 7th business day; 6th business day.
- Source: [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.3, ss.5-6 "ועד לסוף יום העסקים השישי של תהליך הניוד" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.7, ss.24, 26 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.11, s.34 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Unchanged in version 4 of the directive (SW-43).

### SW-28 Retention by the old bank, and benefits kept during the switch
- Rule: Retention contact (s.9, "ניסיון לשימור הלקוח על ידי הבנק המקורי"): the originating bank's approach to a customer who asked to switch, to try to keep them, "תעשה מבלי שיופעלו על הלקוח לחצים לקבלת החלטה כאמור". The bank must make clear "כבר בתחילת הפנייה כי מטרת הפנייה היא לנסות לשמרו כלקוח הבנק המקורי". Benefits (s.7): the originating bank may not cancel the customer's benefits and discounts early only because a switch was requested. Without an agreed end date, it keeps them "למשך תקופה של 3 חודשים לפחות ממועד הגשת הבקשה, או עד למועד העברת הפעילות בפועל, המוקדם מבין השניים".
- Conditions / exceptions: Separately, a banking benefit may not end without 21 days' notice (`bank-current-account-deposits.md` BANK-19).
- Figures: 3 months.
- Source: [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.3, ss.7, 9 "תעשה מבלי שיופעלו על הלקוח לחצים לקבלת החלטה כאמור" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `fee-change-over-time`
- Likely to change: no.
**[2026-10-24 R4 research pass]** Unchanged in version 4 of the directive (SW-43).

### SW-29 What moves and what stays: deposits wait for maturity, untransferable securities stay, foreign currency may be converted
- Rule: The receiving bank must explain which activity cannot move automatically and the options, naming "הלוואות, פיקדונות, ניירות ערך שאינם ניתנים להעברה, תנועות עתידיות במטבע חוץ וערבויות" (s.23(ג)). For each type of activity:
  - Deposits and savings: unless the customer instructs otherwise, the originating bank keeps managing a deposit or savings plan on its agreed terms. At maturity, even after the rerouting period, it pays the money to the customer's account at the receiving bank or to another account the customer names (s.29(ב)).
  - Securities: a security that cannot be transferred stays held at the originating bank for the customer (s.29(ג)).
  - Foreign currency: where the receiving bank does not run that currency, the originating bank converts the balance to shekels "בהתאם לאופן ההמרה הנהוג בבנק המקורי" and moves it (s.29(ד)).
  - Loans: they stay on their terms, or the process stops if no arrangement is reached (s.29(א)).
  - The old account: the originating bank closes it when the move completes. It may keep a "חשבון תמורה" only to manage activity left behind, and may charge no fees on that account (s.34(ג); definition in s.3).
- Conditions / exceptions: The receiving bank's information page must tell the customer that leftover deposits and securities stay (s.23(ג)). The BoI Q&A says the bank must state clearly, on the information page, that the move may cause a tax event ("עשוי להתרחש אירוע מס"). It also says the originating bank must pass on information on deposit tax benefits (directive Q&A annex).
- Figures: none.
- Source: [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.2, s.3 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.6, s.23(ג) "הלוואות, פיקדונות, ניירות ערך שאינם ניתנים להעברה, תנועות עתידיות במטבע חוץ וערבויות" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.9, s.29 "בהתאם לאופן ההמרה הנהוג בבנק המקורי" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.11, s.34 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) pp.13-14, Q&A annex "עשוי להתרחש אירוע מס" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `fee-fx`, `currency`, `switching-tax-event`
- Likely to change: no.

### SW-30 Rerouting after the switch: three years, extended to 31.7.2029 for earlier switchers
- Rule: After the transfer day, debits, credits and cheques presented to the old account are rerouted to the new account. The Governor's rules (s.5(א)) set the period at "שלוש שנים ממועד העברת הפעילות" unless the customer asks to stop earlier. The original period was two years. An amendment in force 21.9.2023 made it three years, and a transitional provision gave customers who had switched between the start of s.5ב1 and 20.9.2023 three more years of rerouting. A rules amendment published 17.9.2026 extends rerouting to 31.7.2029 for customers who switched online before 21.9.2026: "עבור לקוחות אלו, מוארכת הוראת המעבר עד ליום 31.7.2029". The receiving bank must give at least 60 days' notice before rerouting ends (448 s.36). It must update the customer half-yearly on rerouted activity, including the names of the bodies paying in and debiting (s.39). It must let the customer stop rerouting at any time, effective within 5 business days, with a warning of the consequences (s.40).
- Conditions / exceptions: Customers who switched between 1.8.2026 and 21.9.2026 get a rerouting period up to about 1 month and 21 days short of three years, with a decision expected by 31.7.2029 (circular h-2863 s.5). The BoI states that more than 200,000 customers had switched online about five years after launch. The same circular says substantial rerouting volume remained after three years.
- Figures: 3 years; 31.7.2029; 60 days; 5 business days.
- Source: [חוזר ח-06-2863 – הארכת תקופת הניתוב בעת מעבר בין בנקים – דברי הסבר (18.10.2026)](https://boi.org.il/media/qempydw4/h2863.pdf) pp.1-2 "מוארכת הוראת המעבר עד ליום" · checked 2026-10-25 · primary; [כללי הבנקאות (שירות ללקוח) (העברת פעילות פיננסית של לקוח בין בנקים) (תיקון), התשפ"ז-2026 (קובץ התקנות 12530)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/F9bg9ryZESlDqrIFTdQefnXqkLtWsLmUW7mzw7WyHNs=#page=2) p.2, rule 5א · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.11, ss.35-40 · checked 2026-10-25 · primary
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
**[2026-10-24 R4 research pass]** Version 4 adds s.19א early disclosure before the request stage (SW-43).

  The receiving bank updates the customer on the last business day before the transfer day (s.30).
- Conditions / exceptions: The page must stay available to the customer at all times in a format that can be saved and printed (s.21).
- Figures: none.
- Source: [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.6, ss.20-23 · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.10, s.30 · checked 2026-10-25 · primary
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
- Source: [חוק הבנקאות (שירות ללקוח) (תיקון מס' 38), התשפ"ה-2025 (ספר החוקים 3413)](https://fs.knesset.gov.il/25/law/25_lsr_6803031.pdf) pp.2-3, s.5ב2 on p.2, s.5 on p.3 "מושבים רק לחשבון שממנו הועברו" · checked 2026-10-25 · primary; [הצעת חוק הבנקאות (שירות ללקוח) (תיקון – ניוד פקדונות ללקוחות הבנקים ללא העברת חשבון), פ/5281/25](https://fs.knesset.gov.il/25/law/25_lst_5380049.pdf) p.1 · checked 2026-10-25 · primary; [הכנסת – מאגר המידע הפרלמנטרי: הצעת חוק 2226120 (פ/5281/25)](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill?$filter=PrivateNumber%20eq%205281%20and%20KnessetNum%20eq%2025&$format=json) · checked 2026-10-25 · primary; [הכנסת – מאגר המידע הפרלמנטרי: הצעת חוק 2222052 (פ/4960/25)](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Bill?$filter=PrivateNumber%20eq%204960%20and%20KnessetNum%20eq%2025&$format=json) · checked 2026-10-25 · primary; [הכנסת – מאגר המידע הפרלמנטרי: סטטוס 104](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status?$filter=StatusID%20eq%20104&$format=json) "הונחה על שולחן הכנסת לדיון מוקדם" · checked 2026-10-25 · primary; [הכנסת – מאגר המידע הפרלמנטרי: סטטוס 118](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Status?$filter=StatusID%20eq%20118&$format=json) "התקבלה בקריאה שלישית" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.9, s.29(ב) · checked 2026-10-25 · primary
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
- Source: [כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf) pp.17-19, first schedule part 4(א)(6) and notes, part 5 item 10 "בעת סגירת חשבון לא תעלה על 10" · checked 2026-10-25 · primary; [דיסקונט – תעריפון, חלק 4 ניירות ערך (07/02/2025)](https://www.discountbank.co.il/media/bjudw31y/part4_securities07022025.pdf) p.5, items 4.6.1-4.6.2 "5 ₪ להעברה (פיקוח)" · checked 2026-10-25 · institution; [מיטב – המדריך למעבר חלק: איך לנייד את תיק ההשקעות מהבנק למסחר עצמאי (03/08/2026)](https://www.meitav.co.il/trade/financial_info/self_trading_portfolio_transfer/) "5 שקל לנייר ערך ישראל" · checked 2026-10-25 · institution; [כלכליסט – המעבר מבנק לבית השקעות הוא זול, אך לצאת משם מאוד יקר (27.08.26)](https://www.calcalist.co.il/article/hj55ri2pgx) · checked 2026-10-25 · secondary
- Dimensions: `fee-exit`, `transfer-switch-process`
- Likely to change: possible.

### SW-34 Non-bank brokers: no cap found; tariffs charge per security
- Rule: No rule capping what a non-bank TASE member charges to move securities out was found. Examples:
  - IBI's tariff ("נכון לתאריך: 1.7.2026") charges NIS 20 per security to the same client at another member, "מקסימום 150 ₪ להעברה" a day, and NIS 35 per security to an account with different ownership. Abroad it charges USD 10 per US security, USD 40 per Canadian security, and the foreign broker's cost with a USD 25 minimum for other foreign securities.
  - Altshuler Shaham Trade says it charges no fee to receive a portfolio.
  - Calcalist reports that moving out of a broker can cost hundreds or thousands of shekels (secondary).
- Conditions / exceptions: Snapshot figures for `data/`, not rules. Fee lines and their names are in BRK-24.
- Figures: as above, dated 1.7.2026 (IBI) and 2026-10-22 (Altshuler page).
- Source: [אי.בי.אי – תעריפון (נכון לתאריך 1.7.2026)](https://campaign.ibi.co.il/PDF/TRADE/TAARIFON_IBI.pdf) p.5, part 4 item 9 "מקסימום 150 ₪ להעברה" · checked 2026-10-25 · institution; [אלטשולר שחם טרייד – מעבירים את תיק ההשקעות שלכם לאלטשולר שחם טרייד](https://www.as-invest.co.il/trade/faq_transfer/) "אנו לא גובים עמלה על העברת תיק" · checked 2026-10-25 · institution; [כלכליסט – המעבר מבנק לבית השקעות הוא זול, אך לצאת משם מאוד יקר (27.08.26)](https://www.calcalist.co.il/article/hj55ri2pgx) "למאות ואף לאלפי שקלים" · checked 2026-10-25 · secondary
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
- Source: [בנק לאומי – הנחיות ללקוח להעברת ניירות ערך](https://leumi.co.il/he/Articles/47356) "לא ניתן להעביר שברי ניירות ערך" · checked 2026-10-25 · institution; [מיטב – המדריך למעבר חלק: איך לנייד את תיק ההשקעות מהבנק למסחר עצמאי (03/08/2026)](https://www.meitav.co.il/trade/financial_info/self_trading_portfolio_transfer/) "מורידים את טופס בקשת ההעברה מהבנק" · checked 2026-10-25 · institution; [אלטשולר שחם טרייד – מעבירים את תיק ההשקעות שלכם לאלטשולר שחם טרייד](https://www.as-invest.co.il/trade/faq_transfer/) "ניירות ערך ישראליים - עד 5 ימי מסחר" · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `liquidity-lockup`
- Likely to change: yes.

### SW-36 Tax on moving securities: same owner described as neutral, different owner taxed with zero cost basis (institution sources only)
- Rule: Altshuler Shaham Trade states a transfer between accounts with the same ownership is not a tax event. With different ownership it may be one, and the securities are recorded at "שער עלות אפס". Leumi states that a transfer to a different entity, or to a relative without the signed declaration, is a sale "החייב בניכוי מס במקור" at the closing price, with the receiver's cost "שער עלות הנייר יהיה אפס". Meitav Trade's article says the move "אינה נחשבת לאירוע מס", that "רצף המס נשמר", and that tax losses "לא נמחקים במעבר" but may need confirmations from the bank.
- Conditions / exceptions: No Tax Authority source was read (open question 11). Selling to switch funds or securities is a sale (`tax-securities-israeli.md` TXS-21). Withholding by foreign brokers: BRK-27.
- Figures: none.
- Source: [אלטשולר שחם טרייד – מעבירים את תיק ההשקעות שלכם לאלטשולר שחם טרייד](https://www.as-invest.co.il/trade/faq_transfer/) "שער עלות אפס" · checked 2026-10-25 · institution; [בנק לאומי – הנחיות ללקוח להעברת ניירות ערך](https://leumi.co.il/he/Articles/47356) "שער עלות הנייר יהיה אפס" · checked 2026-10-25 · institution; [מיטב – המדריך למעבר חלק: איך לנייד את תיק ההשקעות מהבנק למסחר עצמאי (03/08/2026)](https://www.meitav.co.il/trade/financial_info/self_trading_portfolio_transfer/) "רצף המס נשמר" · checked 2026-10-25 · institution
- Dimensions: `switching-tax-event`, `loss-offset`, `tax-at-exit`
- Likely to change: unknown.

### SW-37 Foreign brokers: no regulator process found
- Rule: No Israeli rule was found on moving securities from an Israeli bank or broker to a foreign broker, or back. A foreign broker reached under an ISA s.49A permit is not ISA-supervised (BRK-06). Its withholding differs (BRK-27).
- Conditions / exceptions: Experience only: SW-X03. Open question 12.
- Figures: none.
- Source: pointers BRK-06, BRK-27; links from the cited rules: [Interactive Israel, about page](https://lp3.inter-il.com/about-3) · checked 2026-10-25 · institution; [בנק יהב: היתר למתן שירותי מסחר בניירות ערך](https://www.bank-yahav.co.il/footer/footer-menu/securrities-permit/) · checked 2026-10-25 · institution; [חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf) p.10, s.49א · checked 2026-10-25 · primary; [TASE periodic report 2025, 1.31.10](https://content.tase.co.il/media/kvjpsnmx/tase_ltd_periodic_report_for_2025.pdf?guid=b4232a8e-909e-473e-84c6-3ece08e3158a) p.79 · checked 2026-10-25 · primary; [Leumi general terms 08.25, s.39.2](https://www.leumi.co.il/leumi-hebrew/s3fs-public/newsite/generalpages/general%20terms/General_Terms_and_Conditions_acc.pdf) p.55 · checked 2026-10-25 · institution
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
- Source: as in the rules named; links from the cited rules: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.1-28 · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf) p.3, s.4 · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=1) p.1 · checked 2026-10-25 · primary; [Phoenix study-fund FAQ](https://www.fnx.co.il/ishtalmutfund/faq/) · checked 2026-10-25 · institution; [תקנות מס הכנסה (כללים לתנאים שבהם חשבונות שונים בקרן השתלמות ייחשבו לחשבון אחד), התשנ"ג-1993](https://www.btl.gov.il/Laws1/02_0103_100048.pdf) p.1, regs. 1-3 · checked 2026-10-25 · primary; [חוזר ח-06-2863 – הארכת תקופת הניתוב בעת מעבר בין בנקים – דברי הסבר (18.10.2026)](https://boi.org.il/media/qempydw4/h2863.pdf) pp.1-2 · checked 2026-10-25 · primary; [כללי הבנקאות (שירות ללקוח) (העברת פעילות פיננסית של לקוח בין בנקים) (תיקון), התשפ"ז-2026 (קובץ התקנות 12530)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/F9bg9ryZESlDqrIFTdQefnXqkLtWsLmUW7mzw7WyHNs=#page=2) p.2 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `statement-disclosure` (proposed in PF)
- Likely to change: with the rules named.


### SW-39 Seniority on a transfer: the money keeps its own payment dates; two study funds merge into one account only when both are already withdrawable
- Rule: For a transfer between non-annuity funds on the routes in reg. 3(א)(1) to (7) and (11א) (tagmulim to tagmulim, study fund to study fund, gemel lehashkaa to gemel lehashkaa, and the rest) the money goes "לחשבון על שם העמית העובר בקופה המקבלת, ויראו לעניין דיני המס, את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת" (reg. 3(ב)(1)): the transferred money carries its own deposit dates, so its seniority is unchanged by the move. Merging it into an account the member already holds at the receiving fund is a separate act, "איחוד חשבונות", allowed for a study fund "רק אם במועד האיחוד העמית היה זכאי למשוך את הכספים שמקורם היה בהפקדה המוטבת … בפטור ממס, בכל אחד מן החשבונות שאוחדו" (reg. 9(ב)), and for a tagmulim fund, as to self-employed payments made before 1.1.2006, on the same condition (reg. 9(א)). A study fund cannot move in part (reg. 9(ג), PF-18).
- Conditions / exceptions: So a younger study fund and an older one of the same person can be brought under one manager by a whole transfer, but they stay two accounts with two seniorities until both are withdrawable tax-free; only then may they be consolidated into one account, and at that point the seniority question no longer matters. The receiving fund does not "adopt" the older account's seniority for the younger money: the 2008 version of reg. 9(א), which let a consolidation go ahead "רק אם מועד התשלום הראשון בחשבון … שאליו מועברים הכספים אינו מוקדם ממועד התשלום הראשון בחשבון … שממנו מועברים הכספים" and then disapplied reg. 3(ב) for the first payment date, was replaced on 10.9.2014 (ק"ת תשע"ד 7407) and is not in force. The circular's data file carries every payment date (SW-11). Whether the two accounts count as one for the six-year clock while still separate is the 1993 regulations' question (KH-14), not the transfer regulations'. For annuity funds the same carry-over is in reg. 2(ב) (SW-40).
- Figures: none.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=6) p.6, reg. 3(ב)(1) "כמועדי התשלום לקופה המקבלת" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=4) p.4, s.5 (replaces reg. 9), reg. 9(א)-(ג) to p.5 "בכל אחד מן החשבונות שאוחדו" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=8) p.8, reg. 9 as first enacted · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `liquidity-lockup`, `age-or-use-exemption`
- Likely to change: no.

### SW-40 Pension-fund to pension-fund and gemel lehashkaa to gemel lehashkaa: payment dates carry over; the explicit tax exemption covers the employer's transfers
- Rule: Money may move into an annuity fund from another annuity fund (reg. 2(א)(1)); the transfer "תיעשה לחשבון בקופה המקבלת על שם העמית העובר, לפי מרכיבי חשבון קופת הגמל בקופה המעבירה … ולגבי העברה כאמור בפסקה (1) שבה, יראו את כל מועדי התשלום לקופה המעבירה כמועדי התשלום לקופה המקבלת, ואולם אם הקופה המקבלת היא קופת ביטוח, יראו את מועדי התשלום … רק לעניין דיני המס" (reg. 2(ב)). Since 2023 a receiving fund may not accept money that the regulations do not allow to move, including, into a comprehensive fund, more than the monthly deposit ceiling times the months since the first payment to the transferring fund (reg. 2(ד)(1)), and, from a non-insurance annuity fund into an insurance fund, money that would leave less than that product behind (reg. 2(ד)(1א)). The Income Tax Rules (Exemption on Transfer and Change of Designation of Money in Provident Funds) 1990, s. 2(א), exempt from tax "סכומים שהועברו על ידי מעביד מקופת גמל אחת לקופת גמל אחרת, בהתאם לתקנות" in listed cases, among them "(1) העברה מקופת גמל לקיצבה שאינה קופת ביטוח לקופת גמל אחרת לקיצבה שאינה קופת ביטוח", "(3) העברה מקופת גמל לתגמולים לקופת גמל אחרת לתגמולים" and "(7) העברה אחרת, לרבות העברה מקרן השתלמות אחת לקרן השתלמות אחרת … ובלבד שאושרו מראש בידי הנציב", provided the transferor claimed no deduction for the transfer (s. 2(ב)). Gemel lehashkaa to gemel lehashkaa is route 3(א)(11א) with the reg. 3(ב)(1) carry-over (SW-39).
- Conditions / exceptions: The 1990 rules were made under Ordinance s. 3(ד)(2), which taxes money an employer gets back from a fund; they say nothing in terms about the member. No Tax Authority or CMA text was found that says a member's pension-to-pension transfer is "not a tax event"; the law's structure (the member withdraws nothing, the payment dates carry over, and the 2021 CMA advisory report describes gemel lehashkaa as moving "בין קופות ללא אירוע מס") points that way, so SW open question 8 is narrowed, not closed. The Wikisource copy of the 1990 rules shows one amendment (תשנ"ד); a later amendment may exist.
- Figures: none.
- Source: [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (קובץ התקנות 6657)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fpoeVB94OXb~VXxIiNxEmuFE=#page=4) p.4, reg. 2(א)(1), 2(ב) "לפי מרכיבי חשבון קופת הגמל בקופה המעבירה" · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשע"ד-2014 (קובץ התקנות 7407)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bfvsjLN+leExZ3ArqQksAZbYNmyK9Qa3gH~lF+jEWmc=#page=3) p.3, s.2 (amends reg. 2(ד)) · checked 2026-10-25 · primary; [תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל) (תיקון), התשפ"ג-2023 (קובץ התקנות 10716)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/ZZKYP1JasTIK3+puGrB48nEoGOFH3NQjhXnAe4snPwo=#page=3) p.3, s.2 (reg. 2(ד)(1), (1א)) "גוף מנהל של קופה מקבלת לא יהיה רשאי לקבל כספים שלא ניתן להעביר" · checked 2026-10-25 · primary; [כללי מס הכנסה (פטור ממס בשל העברה ושינוי יעוד של כספים בקופות גמל), התש"ן-1990 (קובץ התקנות 5287)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/xYWY4f5V6gsVHq6NUDp~YKCeau4cX~kDyqy86zbS4NU=#page=23) pp.23-24, ss.1-2 "סכומים שהועברו על ידי מעביד מקופת גמל אחת לקופת גמל אחרת" · checked 2026-10-25 · primary; [כללי מס הכנסה (פטור ממס בשל העברה ושינוי יעוד של כספים בקופת גמל) (תיקון), התשנ"ד-1994 (קובץ התקנות 5613)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/bMMl8kD79jjAGdMyfpq2CaEqca27WIXRVq1k8yn3eXI=#page=21) p.21, s.1 · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `switching-tax-event`
- Likely to change: no.
### SW-41 The transfer circular 2017-9-17 on gov.il: the official text is the one read, with the same deadlines; its dates and what it cancels
- Rule: The CMA's own copy of חוזר גופים מוסדיים 2017-9-17 "העברת כספים בין קופות גמל" (dated י"ב בתשרי התשע"ח, 2 October 2017; "סיווג: כללי"; 28 pages; PDF created 2.10.2017) is on gov.il under the regulation collector. It is the same text as the third-party copy the SW rules were read from: s.3(ד) reads "בוטל" in the official file itself (so that is not a later amendment), s.4א (central severance funds) and s.5א (notice to the employer) are part of the text, s.9 cancels circular 2015-9-1, s.10 applies it to all institutional bodies, and s.11 "תחילה" reads, as printed, "ביום 1 בינואר 2017", with s.7 (uniform-structure data transfer) starting when the uniform-structure circular says. The deadlines read verbatim: the receiving fund forwards an approved request "בתוך שני ימי עסקים מהמועד הקובע" (s.3(ו)); a rejection or delay notice goes "בתוך שלושה ימי עסקים ממועד העברת הבקשה" with a copy to the member (s.3(ז)); a request of an active member lapses after 120 days from signature, or 60 days from a notice that no deposits will come, and of an inactive member after 60 days (s.3(יב), (יג)); money returned after a cancellation goes back "בתוך עשרה ימי עסקים" with the receiving fund's yield (s.3(י)); late-transfer data pass "בתוך חמישה ימי עסקים" (s.5(ה), (ו)); the employer notice (s.5א) and both confirmations to the member (s.6) go "בתוך חמישה עשר ימי עסקים". This confirms SW-02 to SW-11 from the official host.
- Conditions / exceptions: The CMA's later circulars cite "חוזר גופים מוסדיים 2016-9-11 'העברת כספים בין קופות גמל' (19.7.2016)" as "חוזר העברת כספים" or "חוזר הניוד" (the 2018-9-25 and 2019-9-17 child-savings circulars, the 2019-9-11 and 2026-9-3 uniform-structure circulars), and a 2016 CMA letter of 24.9.2016 cites 2016-9-11 too; 2017-9-17 names only 2015-9-1 as cancelled. Which number the CMA treats as the circular in force, and whether 2017-9-17 has been amended since, was not settled (open question 1, narrowed): the 2016-9-11 text was not opened. The ten-business-day transfer deadline itself is in reg. 5(א) of the transfer regulations, which the circular implements (SW-06, SW-42).
- Figures: 2, 3, 5, 10 and 15 business days; 120 and 60 days; as above.
- Source: [חוזר גופים מוסדיים 2017-9-17 – העברת כספים בין קופות גמל](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf) pp.1-28, ss.3, 5, 5א, 6, 9-11 "בתוך שני ימי עסקים מהמועד הקובע" · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`
- Likely to change: yes (CMA 2026 plan amends the transfer circular, PF-31).

### SW-42 Transfer information passes through the pension clearing house ("ממשק ניוד") since 23.2.2020; the regulator may defer the ten-business-day transfer deadline by up to twenty more business days
- Rule: A CMA letter of 15.11.2020 (שה. 2020-9260) restates the chain: under reg. 5(א) of the transfer regulations the transferring fund moves the member's balance "בתוך עשרה ימי עסקים מהיום שבו הועברה לו בקשת העברה מפורטת, חתומה ומלאה", and "הממונה רשאי, במקרים מיוחדים, לאשר דחיה של המועד האמור לתקופה שלא תעלה על עשרים ימי עסקים נוספים"; under s.5(א) of the transfer circular the transferring fund hands the receiving fund the accompanying data at the time of the transfer; "נספח ג – ממשק ניוד" of the uniform-structure circular took effect on 23 February 2020 and applies to transfer requests submitted from that day; and under s.7(ב) of circular 2019-9-2 "חובת שימוש במערכת סליקה פנסיונית מרכזית – עדכון" (21.11.19), from 23 February 2020 "העברת מידע בין שני גופים מוסדיים בקשר לניוד כספים, לרבות מידע לגבי ניוד כספים שלא בוצע באמצעות מערכת סליקה פנסיונית מרכזית, צריכה להתבצע באמצעות מערכת סליקה פנסיונית מרכזית בלבד", at the time the money moves. The letter used the deferral power to move a deadline falling on a clearing-house maintenance day (19.11.2020) by one business day. The current uniform-structure circular 2026-9-3 (26.3.2026) keeps annex ג: "ממשק הניוד קובע מבנה אחיד להעברת מידע אגב בקשת עמית לביצוע העברת כספים בין קופות גמל, החל מהגשת הבקשה לביצוע העברת הכספים לקופה המקבלת, דרך העברת הבקשה מהקופה המקבלת לקופה המעבירה, ועד העברת הכספים"; it applies to transfer requests except those from an IRA ("קופת גמל בניהול אישי") to another fund (s.6(ב)); the balance-and-yield data of annex י' of the transfer circular pass in it since 22.5.2022 (s.7(ב)(4)(ב)).
- Conditions / exceptions: These texts settle the channel (the funds talk through the clearing house; the saver still signs at the receiving fund, SW-02) and the regulator's deferral power; they do not set a price for the saver (SW-44) or a consent rule beyond the law (SW-18). The 2026-9-3 circular opens by deferring some start dates because of the war that began on 28.2.2026; which dates were not read in full.
- Figures: 10 business days; up to 20 more by the Commissioner's approval; 23.2.2020; 22.5.2022.
- Source: [רשות שוק ההון, שה. 2020-9260 – דחיית המועד להעברת כספים בין קופות גמל בעת השבתת מערכת סליקה פנסיונית מרכזית (15.11.2020)](https://www.gov.il/BlobFolder/generalpage/pension-clearing/he/2020-9260.pdf) p.1 "עשרים ימי עסקים נוספים" · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2026-9-3 – מבנה אחיד להעברת מידע ונתונים בשוק החיסכון הפנסיוני – עדכון (26.3.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation26326/he/uniform_protocol_update_26.3.2026%20%5BPDF%5D.pdf) p.6, ss.6(ב), 7(ב) · checked 2026-10-25 · primary; [חוזר גופים מוסדיים 2026-9-3 – מבנה אחיד להעברת מידע ונתונים בשוק החיסכון הפנסיוני – עדכון (26.3.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation26326/he/uniform_protocol_update_26.3.2026%20%5BPDF%5D.pdf) p.10, annex ג summary "ממשק הניוד קובע מבנה אחיד להעברת מידע" · checked 2026-10-25 · primary; [רשות שוק ההון – המסלקה הפנסיונית](https://www.gov.il/he/pages/pension-clearing) · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`, `data-consent` (proposed)
- Likely to change: yes (CMA 2026 plan updates the mandatory-use circular, PF-31).

### SW-43 Directive 448 version 4 (11/25): disclosure duties added (ss.16א, 19א), the switching mechanics unchanged; start by 1.3.2026
- Rule: The Bank of Israel's directive page lists the current version of נב"ת 448 as published 26/11/2025 with circular 2833 (page updated 18/02/2026) and earlier versions 2 (circular 2670) and 1 (circular 2597). Circular ח-06-2833 of 26.11.2025 explains that the update widens disclosure: s.16א now requires a bank, as receiving or originating bank, to update customers about the online switching option during account opening and in the information on closing an account, and "בנק יתעד את פעולות העדכון וכן את החלטת הלקוח לגבי אופן העברת הפעילות הפיננסית"; new s.19א requires banks to present, in their publications and whenever a customer asks about moving activity, the information needed for an informed decision, "לרבות היתרונות הגלומים באפשרות זו, הפעילות הפיננסית שתועבר, לוחות הזמנים להשלמת המעבר, משמעות הניתוב ומגוון הדרכים האפשריות להגשת בקשה", and the receiving bank must offer a banker's help with the request. The circular stresses the choice of route stays the customer's. "תחילת הוראה זו עד יום 01.03.2026". The update replaces pages 448-1-14 of version [3] (9/21) with version [4] (11/25); the process sections read in version 2 (transfer day, 30 business days, the seventh business day before the transfer day, retention contact s.9, rerouting, deposits left behind) are unchanged in version 4 (14 pages, read 2026-10-24).
- Conditions / exceptions: Closes open question 15 (a later version exists; it changes disclosure, not the process). The rerouting-period extension of 18.10.2026 (SW-30, circular h-2863) amends the Governor's rules, not the directive.
- Figures: start by 1.3.2026.
- Source: [בנק ישראל – הוראת ניהול בנקאי תקין 448, עמוד ההוראה וגרסאותיה](https://www.boi.org.il/roles/supervisionregulation/nbt/nbt448/) · checked 2026-10-25 · primary; [חוזר ח-06-2833 – עדכון הוראת ניהול בנקאי תקין 448 (26.11.2025)](https://www.boi.org.il/media/wxoksahf/h2833.pdf) p.3, s.9 "תחילת הוראה זו עד יום 01.03.2026" · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.4, s.16א · checked 2026-10-25 · primary; [הוראת ניהול בנקאי תקין 448 – העברת פעילות פיננסית של לקוח בין בנקים באופן מקוון, גרסה 4 (11/25)](https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf) p.6, s.19א · checked 2026-10-25 · primary
- Dimensions: `transfer-switch-process`
- Likely to change: yes.

### SW-44 What the clearing house may charge a saver: the CMA's payment circular 2026-10-6 caps a one-time all-institutions information request at NIS 11 (from 1.1.2027)
- Rule: חוזר סוכנים ויועצים 2026-10-6 "חוזר תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית - עדכון" (21.10.2026), issued under s.31יד(א)(1) of the Advice, Marketing and Clearing Law, replaces circular 2022-10-5 (11.5.2022) from 1 January 2027 (its price list, s.4, from the day the operator chosen in the new tender takes over). Annex ג is a list of maximum fees per action with the payer named: "בקשה לקבלת מידע באופן חד פעמי עבור לקוח מכלל הגופים המוסדיים על קיומו של מוצר פנסיוני ומידע מפורט אודותיו (ממשק טרום ייעוץ)" 11 NIS, payer "חוסך / בעל רישיון"; the saver's continuous request from all institutions 11 NIS plus 1 NIS for each month information is delivered; a one-time request from one institution 1 NIS; a saver's cancellation of a continuous request 0; a saver's cancellation of an agent's power of attorney 1 NIS; updates of personal details 0. Fixed fees: an institutional body pays a yearly fee by assets (15,000 NIS up to 1 billion NIS of assets, rising to 410,000 NIS above 100 billion; 15,000 NIS only for a body none of whose products can receive or send transfers); a non-institutional user connecting with a certificate 4,000 NIS a year; a vault 3,000 NIS per two years; tokens 350 NIS (physical) or 250 NIS (app). Prices are CPI-linked once a year from March 2027 against the January 2027 index; the operator may charge less with the Commissioner's prior written approval (s.7(ב)); a failed action caused by the user is charged, a repeat at half price; the annex tables state the sums exclude VAT.
- Conditions / exceptions: These are caps on what the operator charges the user who submits the request; the saver's actual route is the operator's site (swiftness.co.il, "הפקת דו"ח מידע פנסיוני על המוצרים שלי"), whose own price page did not render as text on 2026-10-24, and the bank routes in SW-18 remain free to the saver. Until 1.1.2027 the 2022 circular's prices apply (not read). Closes open question 5 for the price side; consent checking stays with the law and the power-of-attorney circular (SW-18, PF-31).
- Figures: 11 NIS; 11 NIS + 1 NIS a month; 1 NIS; 0; 4,000 NIS a year; 15,000 to 410,000 NIS a year; 350 / 250 NIS; start 1.1.2027.
- Source: [חוזר סוכנים ויועצים 2026-10-6 – תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית – עדכון (21.10.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-539/he/protocol_payments_for_use_of_Central_Pension_clearing_house_system.pdf.pdf) p.5, annex א · checked 2026-10-25 · primary; [חוזר סוכנים ויועצים 2026-10-6 – תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית – עדכון (21.10.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-539/he/protocol_payments_for_use_of_Central_Pension_clearing_house_system.pdf.pdf) p.6, annex ב · checked 2026-10-25 · primary; [חוזר סוכנים ויועצים 2026-10-6 – תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית – עדכון (21.10.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-539/he/protocol_payments_for_use_of_Central_Pension_clearing_house_system.pdf.pdf) pp.7-9, annex ג "ממשק טרום ייעוץ" · checked 2026-10-25 · primary; [חוזר סוכנים ויועצים 2026-10-6 – תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית – עדכון (21.10.2026)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-539/he/protocol_payments_for_use_of_Central_Pension_clearing_house_system.pdf.pdf) p.4, s.8 "תחילתו של חוזר זה ביום 1 בינואר 2027" · checked 2026-10-25 · primary; [המסלקה הפנסיונית – מחירון שירותים](https://www.swiftness.co.il/savers/about/%D7%9E%D7%97%D7%99%D7%A8%D7%95%D7%9F-%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D/) · checked 2026-10-25 · institution
- Dimensions: `transfer-switch-process`, `data-consent` (proposed), `agent-involvement` (proposed)
- Likely to change: yes, CPI-linked yearly and tied to the operator tender; recheck 2027-04-01.

## Experience (labelled; not rules, never computed)

Per `docs/product.md` 3.7, forum and press accounts are shown as experience with their source. They are one person's account, not verified.

### SW-X01 Quote withdrawn after clearing-house consent; report allegedly pulled without consent; retention after the first deposit
- Account: In "התייעצות בדבר שני סיפורים מקוממים על מעבר קופות" (Hasolidit, opened 15/7/26), a member says Migdal quoted 0% of balance and 1.9% of deposits directly. Migdal withdrew the quote after he authorised a clearing-house report and offered close to his existing fee. The agent would not put the first quote in writing. He says that at Clal, after he asked that his agent not be involved, the agent called the next day quoting a clearing-house report, and that Clal's call centre said "באמת כתוב שאין אישור להוציא דוח ובכל זאת הוציאו". Replies advise using an independent agent and expecting a retention call from the old fund once the new fund receives the first salary deposit.
- Source: [הסולידית – התייעצות בדבר שני סיפורים מקוממים על מעבר קופות](https://www.hasolidit.com/kehila/threads/.36841/) · checked 2026-10-25 · secondary (experience)

### SW-X02 Fees changed after an employer change; "start the move, take the retention offer, cancel"
- Account: In "הרעת דמי ניהול במעבר מעסיקים" (Hasolidit, 16/6/26) a member reports different fees on each payslip after changing employer, despite being told the fees would stay. A reply advises moving to another company, waiting for the retention call, and then "בטל את הניוד (נציג השימור ידאג להכל)". This depends on the cancellation right in SW-07.
- Source: [הסולידית – הרעת דמי ניהול במעבר מעסיקים](https://www.hasolidit.com/kehila/threads/.36752/) · checked 2026-10-25 · secondary (experience)

### SW-X03 Moving holdings to a foreign broker
- Account: In "האם אפשרי להעביר ניירות ערך ישראלים לאינטראקטיב?" (Hasolidit, 12/7/25), one member says only pension and provident money moves without a tax event. A moderator answers that a portfolio can move as is without tax "כל עוד החברה השנייה תומכת בבורסות של הניירות שרכשת". Another member thought the holdings had first to be converted to their foreign-listed line. The thread does not resolve cost basis or withholding.
- Source: [הסולידית – האם אפשרי להעביר ניירות ערך ישראלים לאינטראקטיב?](https://www.hasolidit.com/kehila/threads/%D7%94%D7%90%D7%9D-%D7%90%D7%A4%D7%A9%D7%A8%D7%99-%D7%9C%D7%94%D7%A2%D7%91%D7%99%D7%A8-%D7%A0%D7%99%D7%99%D7%A8%D7%95%D7%AA-%D7%A2%D7%A8%D7%9A-%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%9D-%D7%9C%D7%90%D7%99%D7%A0%D7%98%D7%A8%D7%90%D7%A7%D7%98%D7%99%D7%91.34986/) · checked 2026-10-25 · secondary (experience)

### SW-X04 Without an agent
- Account: In "קרן פנסיה עם דמי ניהול אטרקטיביים, אבל ללא סוכן" (Hasolidit, 11/10/26; first page of five read), a member writes "בעלי ואני נמצאים בקרן פנסיה ברירת מחדל ללא מגע יד סוכן". The member changes tracks in the personal area and pays an adviser only for specific events.
- Source: [הסולידית – קרן פנסיה עם דמי ניהול אטרקטיביים, אבל ללא סוכן](https://www.hasolidit.com/kehila/threads/.37102/) · checked 2026-10-25 · secondary (experience)

## Playbook order per wrapper (index to the rules above)

This is a composed index for 3.7; each step renders from the rule named.

- **Keren hishtalmut:**
  1. Check the clock (KH-10, KH-14).
  2. Get your own data (SW-18; the clearing house's own price cap, SW-44).
  3. Choose the receiving fund and track (SW-16).
  4. Join directly or through an agent (SW-17).
  5. Sign the whole-balance request at the receiving fund (SW-02, SW-03, SW-20).
  6. Tell the employer where to deposit (SW-10).
  7. The first deposit sets the determining date (SW-04).
  8. Expect rejection or delay notices within 3 business days (SW-05).
  9. Expect a retention contact (SW-19, SW-X01).
  10. The cancellation right lasts until the money moves (SW-07).
  11. The money moves within 10 business days (SW-06; the funds' data pass through the clearing house, SW-42).
  12. Confirmations come within 15 business days (SW-09).
  13. Verify (SW-38).
- **Pension fund:** the same order, adding the insurance form and continuity (SW-12), blocks (SW-13), partial transfers (SW-14) and inactive-account consolidation (SW-22).
- **Provident fund for annuity:** as for pension, without insurance (SW-23).
- **Kupat gemel lehashkaa:** routes (SW-21), then steps SW-02 to SW-09 (inactive member: the determining date is receipt), then verify (SW-38).
- **IRA:** routes and money types (SW-01, SW-23), cash or in kind (SW-24), then SW-02 to SW-09.
- **Child savings:** SW-25.
- **Bank current account:**
  1. Request at the receiving bank (SW-26; early disclosure under version 4, SW-43).
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

1. **Current version of circular 2017-9-17.** The copy read (Analyst host) is a consolidated, amended text: s.3(ד) reads "בוטל" and sections 4א and 5א were added. It does not say which amending circulars it includes or their dates. Likely answer: the CMA circulars archive or codex on gov.il, opened by hand (PF open question 9). **[2026-10-24 R4 research pass: Narrowed by SW-41. The gov.il copy (2.10.2017, 28 pages) is identical, with 'בוטל' and ss.4א, 5א in the original; no amending circular was found by search, but the CMA's later circulars cite 2016-9-11 (19.7.2016) as the transfer circular, so the numbering in force is still to be settled on the CMA regulation collector.]**
2. **Does circular 2017-9-17 govern gemel lehashkaa?** Annex A's fund-type list has no "קופת גמל להשקעה", which postdates the 2017 text. The gemel lehashkaa bylaws apply the transfer regulations and "the Commissioner's instructions" (KGL-10). Likely answer: a later amendment of the circular or the codex. **[2026-10-23 R3 research pass: The regulations side is settled (reg. 3(א)(11א), added 2.9.2020, SW-39); the circular's Annex A list is still the open part.]**
3. **CMA rule on retention contacts and retention offers in provident products.** Not in the Advice, Marketing and Clearing Law or the transfer circular. Two searches found none. Likely answer: the CMA customer-service or marketing circulars ("חוזר שירות", codex part on fair dealing), opened by hand.
4. **Does a fee quoted before joining bind the institution?** The CMA discount circular (PF-13) runs from when the fee is first charged. Likely answer: the joining circular ("חוזר צירוף", in the CMA 2026 plan for review) or the advice-document circular.
5. **Clearing house: the price of a direct request, and how consent is checked.** Only bank routes, which are free, were read. Kol Zchut is blocked. Likely answer: the regulations under s.31יד and s.31טז, and the operator's site. **[2026-10-24 R4 research pass: Price closed by SW-44 (caps per action from 1.1.2027; the 2022 circular's prices until then, not read). How consent is checked is still the law plus the power-of-attorney circular (SW-18).]**
6. **Who must tell the employer to redirect future deposits after an active member's transfer, and the employer's deadline.** Not found. Likely answer: the payments regulations 2014 (KH-06 source) or the joining circular. **[2026-10-24 R4 research pass: Not in the official circular either (SW-41); still open.]**
7. **How PEN-14 combines with circular s.4(ב).** PEN-14 gives a new 60-month qualifying period when tagmulim money is moved out (bylaw). Circular s.4(ב) credits insurance months on a fund-to-fund move. Which governs a full pension-to-pension transfer? For `pension-and-gemel-lekitzba.md`: read a fund's bylaw section on incoming transfers.
8. **Is a transfer between pension funds or provident funds for annuity tax-neutral?** The TXP file states nothing either way. For `tax-pension-gemel-lekitzba.md`. **[2026-10-23 R3 research pass: Narrowed, not closed. Reg. 2(ב) carries the payment dates over; the 1990 exemption rules cover sums "שהועברו על ידי מעביד"; no text found for the member's side (SW-40).]**
9. **The Governor's rules 2019 on bank switching**: the account types and activity types covered, whether securities move under the service, which banks are exempt, and the exact meaning of "sixth business day" in directive 448 s.6. Only the directive and circulars were read. Likely answer: BoI media PDF of the consolidated rules, and Reshumot ק"ת התש"ף p.183, התשפ"א p.3574, and קובץ תקנות 12530 (17.9.2026).
10. **The supervised price for moving securities**: the order that sets it, and whether it is per transfer (Discount "5 ₪ להעברה") or per security (Meitav "5 שקל לנייר ערך ישראל"). Also the source of the NIS 5 bank-to-non-bank cap Calcalist reports. One search found no order. Likely answer: the BoI price-supervision order under s.7 of the Banking (Customer Service) Law. This also closes BRK open question 12.
11. **Tax on moving securities between your own accounts**: cost basis carried over, losses carried forward, and whether a declaration is needed. Only institution statements were read. For `tax-securities-israeli.md` and `tax-securities-foreign.md`. Likely answer: the Income Tax withholding regulations on securities transfers, or a Tax Authority circular.
12. **Moving securities between an Israeli institution and a foreign broker**: feasibility for TASE lines, cost, and the withholding consequences. Only forum experience was found.
13. **Competition Authority deposit-portability directive**: text, effective date and tribunal status (BANK open question 6).
14. **"המנהל" in Transfer Regulations reg. 3(א)(12)**: confirm it is the Tax Authority director, as PF-17 reads it.
15. **Directive 448 after version 2 (8/21)**: whether a later version exists. Circular h-2863 refers to s.37 of the directive but amends only the rules. **[2026-10-24 R4 research pass: Closed by SW-43: version 4 (11/25), circular 2833, disclosure sections only.]**
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
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), תשס"ח-2008, consolidated with amendment history (Nevo HTML, read verbatim) | Nevo | primary (mirror) | https://www.nevo.co.il/law_html/law01/999_929.htm | 2026-10-23 |
| כללי מס הכנסה (פטור ממס בשל העברה ושינוי יעוד של כספים בקופות גמל), התש"ן-1990 | Wikisource | primary (mirror) | https://he.wikisource.org/wiki/כללי_מס_הכנסה_(פטור_ממס_בשל_העברה_ושינוי_יעוד_של_כספים_בקופות_גמל) | 2026-10-23 |
| חוזר גופים מוסדיים 2017-9-17 "העברת כספים בין קופות גמל", 2.10.2017, consolidated copy, all 28 pages | CMA, hosted by Analyst | primary (third-party host) | [c17] | 2026-10-22 |
| חוזר גופים מוסדיים 2017-9-17, the CMA's own copy (same 28 pages) | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-988/he/regulation_h_2017-9-17.pdf | 2026-10-24 |
| CMA letter שה. 2020-9260, דחיית המועד להעברת כספים בין קופות גמל בעת השבתת מערכת סליקה פנסיונית מרכזית, 15.11.2020 | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/generalpage/pension-clearing/he/2020-9260.pdf | 2026-10-24 |
| חוזר גופים מוסדיים 2026-9-3, מבנה אחיד להעברת מידע ונתונים בשוק החיסכון הפנסיוני - עדכון, 26.3.2026 (ss.1, 4-8 read) | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-legislation26326/he/uniform_protocol_update_26.3.2026%20%5BPDF%5D.pdf | 2026-10-24 |
| חוזר סוכנים ויועצים 2026-10-6, תשלום עבור שימוש במערכת סליקה פנסיונית מרכזית - עדכון, 21.10.2026 | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-539/he/protocol_payments_for_use_of_Central_Pension_clearing_house_system.pdf.pdf | 2026-10-24 |
| BoI directive page נב"ת 448 (versions), חוזר ח-06-2833 (26.11.2025) and נב"ת 448 version 4 (11/25) | BoI Banking Supervision | primary | https://www.boi.org.il/roles/supervisionregulation/nbt/nbt448/ ; https://www.boi.org.il/media/wxoksahf/h2833.pdf ; https://www.boi.org.il/media/irmdw0r2/448_4-%D7%9E%D7%95%D7%A0%D7%92%D7%A9.pdf | 2026-10-24 |
| gov.il, המסלקה הפנסיונית (regulation page, links to the operator swiftness.co.il) | CMA (gov.il) | primary | https://www.gov.il/he/pages/pension-clearing | 2026-10-24 |
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
