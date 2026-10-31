# Tax specialist, night of 2026-10-31

All items were checked on 2026-10-31. Library ids are 16-hex ids in `research/library/`; pages are the file's own pages. Nothing was committed. `npm run validate` is valid and `npm test` passes (1155 tests) with the edits in place. `extract:sources` was not run: the lead runs it, because `data/rules` is not mine to edit.

No document read tonight addressed me or tried to give an instruction.

## Rules that are new or changed

New rules, which need a site record with Hebrew review before they appear on the site:

| Rule | File | What it says |
|---|---|---|
| TXF-34 | `tax-securities-foreign.md` | The holder's position when foreign tax was withheld above the Israeli maximum |
| TXF-35 | `tax-securities-foreign.md` | A loss is offset before the foreign credit; a high foreign rate does not limit the loss (10/2025 s.2.6, s.6.3) |
| TXS-28 | `tax-securities-israeli.md` | Joint accounts: the law read gives equal shares; highest-holder rate is only two banks' term |
| TXS-29 | `tax-securities-israeli.md` | Forms 747 and 746 for moving securities and declaring their cost |
| TXS-30 | `tax-securities-israeli.md` | Using a capital loss: no carry-back, only its owner, the order, earlier offsets come first (10/2025) |
| TXS-31 | `tax-securities-israeli.md` | Merging or splitting mutual funds of the same type can be tax-free (s.103א(א), 7/2003 s.4.2) |
| TXS-32 | `tax-securities-israeli.md` | Business or capital: the nine helper tests for trading securities (13/2004) |

Extended, with no change of direction: TXS-06, TXS-17, TXS-18, TXF-23, TXG-10, TXG-11, TXG-34, TXI-17, TX2-05, TX2-08, TX2-18. TXS-32 also adds a line to the summary of `tax-securities-israeli.md`, and open question 8 in `tax-gemel-lehashkaa-ira-child.md` gained a note and stays open.

No numbered open question was added or closed. New ones are at the end of this report for the lead to add.

## Item 1: citations job 7 left

The 22 citations in the tax files were handled: moved to state copies with pages, or kept for the reason below.

- TXI-08 and TXI-13 stay on Wikisource on purpose. They cite its header and amendment list to show there is no later amendment, which the old state copies cannot show (`2d313d18dfed9653` of 3.1.2018, `351dbb86615f9e87` of 31.5.2012).
- TXG-34: job 7's finding holds only for s.14's current wording and (ז2). The state copy prints 5% at p.18, so that part moved.
- TX2-17, TXG-17 and TXK-26 keep the words "First read on Wikisource" because `data/rules` still names that link and the validator requires it in the rule block. Ordinance s.101א(13) is Wikisource-only and sits in Sources rows only.
- TXK-15 status stays open (open question 6). The National Insurance copy of 21.6.2026 p.23 prints s.9(18ב) as live, Wikisource marks it repealed, and the 2025 guide lists it as 9(18ג). The court decision was not read (connection reset).
- Not edited: method notes that still say the law was read on Wikisource, as job 7 listed (`tax-hishtalmut` lines 7, 148, 191, 265; `tax-insurance-and-amendment-190` 7, 43, 52; `tax-interest-deposits-bonds` 8, 95, 143, 334; `tax-pension-gemel-lekitzba` 7, 328, 332, 339; `tax-securities-foreign` 7; `tax-securities-israeli` 7, 315; `tax-tier2-other` 8, 37, 178, 238). They describe how the files were first read. Line numbers have moved by a few since.

For the domain specialist: job 7's gazette link for the Retirement Age Law in `keren-hishtalmut.md` (line 466 and one other row) points at `11_lsr_210557`, the 1987 equal retirement age law. The 2004 law is at https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf (ss.3-5, file p.1).

## Item 2: foreign tax above the Israeli maximum, and joint accounts

**Foreign tax above the maximum.** TXF-10 covered the withholder's top-up; TXF-34 now covers the holder.

- The treaty cap appears in writing only in the 2019 letter on foreign funds on TASE (`338ece9229e85727` p.2 s.4.1.4) and in ruling 5916/20 (`c8df5238b77f651c` p.4 s.3.2.2.2.2, p.5 s.3.3.3.2). The guide is `5012033e55e0c415` p.85. Ordinance ss.204(ב) and 205א name no treaty rate.
- Not established: a general directive to withholders; how to recover excess tax abroad; whether the s.205א carry-forward covers tax above the treaty rate.
- The Discount (`0db5c13ebcf91370` p.6) and Mercantile (`4076a5e01852724f` p.7) wording remains those banks' terms.

**Joint accounts.** Only their term, on what was read.

- The law read gives equal shares (2002 regulations reg.10 p.2, 2005 regulations reg.9 p.3).
- The highest-holder rate appears only at Discount (`36453fb2c2b8e702` p.13 s.32.4) and Mercantile (`62474a808f06947d` p.12, and savings page `3293a1bbdb1b605b`). Both cite a Tax Authority direction I have not read. The eight circulars of item 7 hold nothing supporting it.
- TXS-28 says this. It does not say the banks are wrong, and whether a holder can reclaim over-withholding was not read.

## Item 3: moving securities between accounts of the same holder

Not established. No sentence of the Tax Authority saying it is or is not a sale was read.

- Evidence that bears on it: s.88 "מכירה"; 2002 regulations reg.9(ב) ("אם הועבר תיק ניירות ערך מאותו מנהל למנהל אחר"); the form notice `cbb3d775be9e3a8f` p.2 s.ב.1 ("נועדו רק למצב בו אין שינוי בזהות המחזיק"). None says it is not a sale.
- Yahav's "potential tax event" (`3333d8a86ed4e6f0` p.1) covers all kinds of transfer on its page and is a company's words. Altshuler and Meitav say it is not a tax event. SW-55's Scope unsettled stays correct.
- The brief's reference to TXH-19 was misaddressed. TXH-19 is a study-fund transfer resting on transfer regulations reg.3(ב)(1), with no change. The portfolio rule is SW-55.
- Discount's form 03-007 returned 404 to curl and is on the Chrome list. A search summary quotes it as saying a transfer is subject to withholding unless exempt or approved. I did not read it, so it is not used.
- For the domain specialist: SW-55 could add form 746, the "no change in holder" line and a pointer to TXS-29.

## Item 4: form 938

The premise is false; no other file needed editing.

- No "938" exists as a form in the rule base. `ira-self-directed.md:399` is fund number 14938, and `switching-and-transfers.md:537` already names form 747. No mention in `data/rules`, `site/app` or `docs`. The claim came from `chrome-notes.md` lines 102-105, which is the wrong source.
- SW-55's "up to NIS 500,000 a year" agrees with the form as a yearly declared total.
- No once-per-tax-year limit appears in the rule base or the documents. The form asks for "no earlier request about this security's cost", which is a different limit.

## Item 5: the 2026 monthly deductions booklet

No correction needed. `de6fee7208bdde4e`, whose file pages equal its printed pages, was republished after the law of 31.3.2026 (p.3) and says the law prevails on conflict (p.3).

- Compared and in agreement: brackets p.10, surtax p.11, credits and ceilings pp.12-15, the 57.5% / 62.5% / 67% schedule p.6, withholding rates p.19.
- Page citations sit on the 2026 pagination at every figure sampled. The earlier copy `41496dd374f5e3a3` has the same figures two pages earlier and lacks some.
- Differences already flagged and left: s.125E 39,605 against 39,606 (open question 13); The Phoenix's 13,440 and 16,560 against the booklet's 15,000 and 18,360.
- The 33 records in `data/rules` that cite the booklet show no conflict. `data/parameters` holds no tax figures.

## Item 6: Capital Market circular 2025-26

A draft, on everything read. `b6a36b99d6b34f51` p.1 says "<טיוטה>" and "טיוטת התיקון לחוזר זה נועדה". The regulatory impact statement `c64868a4f7eac39c` p.6 sets 21 days for public comment. The Commissioner's report for 2025, chapter 2 (`9ddba28f182e78e1` p.5), says "טיוטת תיקון".

Whether a final text came later: **not checked**, because the notice page and the Authority's list are blocked. Both are on the morning list. The rule base already marks it as a draft (`provident-family-common.md` lines 316-372, PF-36; `child-savings.md:278`). Provident-family open question 16 stays open.

For the domain specialist: add the impact statement and the Commissioner's report as sources; Capital Market circular 2025-9-6 and draft 2026-9-2 surfaced and were not studied.

## Item 7: job 9's eight circulars

| Id | What it is | Result |
|---|---|---|
| `9ab261ff65e00be3` | 10/2025, capital losses | Main yield: TXS-30, TXF-35, extensions to TXS-17, TXS-18, TXF-23, TXI-17, TX2-05 |
| `f31aa82bcf2983ba` | 5/2025, surtax | TXG-10, TXG-11. P.2 prints both 5,385,285 and 5,382,285, a typo in the instruction; the booklet says 5,385,285 |
| `253cd18ebae814d9` | 2/2010 | Two holder points added to TX2-08 (s.3 p.5, s.4.3.3 p.6) |
| `365540f0f2e29e39` | 22/2002 | Rates historical. Used s.1.5.1 (TXS-06) and s.2.2.2 (TX2-18). Rest is old wording or superseded |
| `fee02c2b16d373f0` | 7/2003 | Rates historical. Used s.4.2 (TXS-31). Rest already covered |
| `7e8e6f572c428c0c` | 2/2013, Amendment 190 | Pension scope, cited widely. No action |
| `990c91e3270bb60c` | 04/2026, form 150 instructions | Already cited. No new rule |
| `e246f5b49e7b5301` | 1/2026, real-estate amounts | Out of scope. No rule |

TX2-05's "no official source classifies the payout" stays true: s.3.7 of 10/2025 settles only loss offset. Directive 437's old 25% figure was not used.

## Item 8: circulars since 2023

**The Tax Authority's list was not checked.** It is blocked to plain requests (403 on gov.il; taxes.gov.il answers an error page) and is on the morning list. So nothing below means a circular does not exist.

What plain requests reached:

- 18 instructions by guessed address, `inst-NN-2023` to `2026`: 01, 03, 11/2023; 03, 05, 06/2024; 01, 03, 05, 07, 10, 11, 12/2025; real-estate 01/2026; 02, 06, 08, 09/2026. Topics are withholding certificates, assessment routing, registration, surtax, virtual-currency receipts, voluntary disclosure, extensions, donations, s.46 credit, the cash law and undistributed profits. No keyword hit on securities, funds, study fund or provident investing except one "נייר ערך" in 08/2026. Numbers that were skipped may simply use another address.
- Via Capitax, a private firm's site used only to find circulars: 06/2025 on Amendment 279 (`5621f280d4a2eff4`, no mention of mutual funds or s.103א in 15 pages; noted on TXS-31), 7/2025, 02/2026, 08/2026, and a draft on foreign trusts. All outside scope. Its lists by topic stop at 2011.
- Directives named `professional-directives-DDMMYY-1` cannot be listed without guessing dates. I did not try: not checked.

Surfaced and not studied: ruling 3986/26 on withholding for Israeli shares on a foreign exchange (29.1.2026, seen on Capitax, not in the library); draft regulations on benefits for investors in securities (2.11.2025, aimed at high-tech investors; not checked further).

**Older gap found on the way.** Circular 13/2004 (`cb3d26951c564cb8`) on business or capital classification was missing from the rule base and is now TXS-32. It predates the 2023 scope and is added because it bears on every trader's rate. Its age is stated on the rule: later rulings and the two cases it names were not read. The circulars on Capitax's lists that are older than 2023 were otherwise not studied (2/2005, 23/2004, 18/2004, 9/2004 on conversion rules, 9/2011, 1/2011). 9/2004 is the one most likely to matter: its gov.il address is 404, and a copy is at http://www.capitax.co.il/Attachments/92004.pdf, unread.

## Added to the morning lists

- `gov-il-list.tsv`: the Tax Authority's circular list (wanted since 2023, in this job's topics, and instruction 9/2015); the page of the draft notice for 2025-26 (`notice_2025_51`).
- `chrome-list.md`: Discount's form 03-007.

## New open questions, for the lead to add

Tax Securities (Israeli):

1. Is a capital loss denied or limited when the same security is bought back, or under the "improper tax reduction" test? Would settle it: reading ע"א 7481/17 Segal, and position 28/2016 and Amot for the foreign side.
2. Moving securities between accounts of the same holder: is it a sale? Would settle it: a Tax Authority sentence, the form instructions, or Discount's 03-007 as a lead to the law it cites.
3. Fund mergers and splits: the changes the Director set for funds, what "type" means, the holder's cost and purchase date after a merger, and whether Amendment 279 touches funds.
4. Joint accounts: what is the Tax Authority direction Discount and Mercantile cite for the highest holder's rate, and can a holder reclaim the difference?
5. Are the tests of circular 13/2004 still the Authority's position, in light of later rulings?

Tax Securities (Foreign):

6. Foreign tax above the treaty rate: is there a general directive to withholders, how is the excess recovered abroad, and does s.205א's carry-forward cover it?
7. Existing open question 9 (TXF-07 against s.92(a)(4), `tax-securities-foreign.md`): 10/2025 s.3.7 says securities losses are not offset against profits a mutual fund paid. It bears on this but names no "קרן חוץ" and does not separate the withholder from the return, so I left it open and it needs no new number.

Tax General:

8. Instruction 9/2015, the section 5 reference in 5/2025 on surtax in advances: not reached (guessed links 404).

Provident family (domain specialist):

9. Has a final text of Capital Market circular 2025-26 been published? This is the existing question 16, kept open.

## For the founder to decide

Nothing.

## Against the site today

No contradiction found. Two omissions, neither a wrong statement:

- Tax figures for securities assume a capital gain, and the site has no trader caveat until TXS-32 gets a record.
- Joint accounts on the site carry only the equal-shares law (TXI-08); the highest-holder term at Discount and Mercantile is not shown, and belongs on those banks' pages if it is shown at all.

SW-55's wording on the site says no Tax Authority source was found. That is still accurate as "not read", though its sentence that this fits the definition of a sale is the rule's own inference.
