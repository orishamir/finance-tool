# Docs cleanup: triage of open work and conflicts

Written 2026-11-06 by the lead, from `part1-result.json` and `part2-result.json` (every writer's conflicts and open work,
every checker's findings, and the two conflict sweeps, commits dcb3c42a and 7939796a). Duplicates across the two files
are merged into one row, with every place it came from. Checked against the docs and code on main at f48eb637 and
against every GitHub issue, open or closed.

Fates:

- **Filed #n**: a new issue. **You decide #n**: a new issue with the "you decide" label.
- **Covered by #n**: an existing issue, open or closed, already holds it (a comment was added where it lacked detail).
- **Done**: already true in the docs or code on main, or no work is left.
- **Settled**: a conflict decided by a written rule (CLAUDE.md, then a decision in `docs/product.md` section 1, then
  the later dated passage), by the code or data as they are, or fixed by a checker or a sweep.

## New issues

| Issue | Title |
|---|---|
| #205 | Glossary: add the missing rows and rewrite the rows about removed pages |
| #206 | Site wording that still breaks the style guide |
| #207 | Remove what the fit mark, the track workbench, switching and the fund-manager pages left behind |
| #208 | Docs: correct the sentences that no longer match the site |
| #209 | Data: two stale fields in the exposure table, and the open-questions file behind the rule base |
| #210 | Collect more provident-fund-for-investing price lists than Meitav's |
| #211 | Source the expected-inflation and average-wage series |
| #212 | Indices: collect Invesco's funds, and settle whether iShares TA-35 exists |
| #213 | Comparison by exposure: evaluate the unlinked government bond |
| #214 | Check that every digit on the site traces to a source: guide prose and a page crawl |
| #215 | Helpers that start a new catalogue, price-list or fund record |
| #216 | Long names cut with an ellipsis in the kit's chip list and the indices cost bars |
| #217 | Goal comparison and exposure charts: each option in its own hue |
| #218 | Guides: a visual for child savings and for the self-managed IRA |
| #219 | Rule base: three conflicts between files, and stale "Serves" lines (domain-specialist; tax-specialist for the tax side of the fund-distribution question) |
| #220 | Switching: rule-base gaps to close when it is rebuilt (long horizon; domain-specialist) |
| #221 | You decide: May the fee page keep its ready sentence for the call with the company? |
| #222 | You decide: Where should the indices page say that most houses leave the exchange-rate spread open? |
| #223 | You decide: Is green for more money and red for less a status colour, or a series colour? |
| #224 | You decide: Before an index is picked, what should the comparison's securities-account card show? |
| #225 | You decide: Should the provident fund for investing's exit keep showing tax on 15% of the nominal gain? |

Comments added: #175 (three more pieces under 44 px), #45 (the idle-cash formula F-60 against D20), #178 (its
answer now meets a removed block; see #222).

## Open work

| # | Item | From | Fate |
|---|---|---|---|
| W1 | The published past record (MKT-01) provisional; Damodaran's series waits on the founder's reading of its terms | product D9; data-inventory | Covered by #59 |
| W2 | The comparison's securities account priced on P-05's S&P 500 fund without saying so (a silent index choice) | product D27 | Done: method F-80 names no index until one is chosen and shows the range over the indices |
| W3 | Ranking with an illustrative return when the order holds between 0% and 10% | product D28 | Done: replaced by D61 (5); built in #193 |
| W4 | The goal card placing the account by its lowest value over the indices until one is chosen, provisional | product D28; method F-80 | You decide #224 |
| W5 | A hedging explanation with a worked example | product D28 "Later" | Done: the hedge section is on the indices page (D45; #21 and #149 closed) |
| W6 | Whether each account buys monthly by standing order | product D28 "Later" | Covered by #194 |
| W7 | The child-savings and self-managed IRA guide visuals | product D29 | Filed #218 |
| W8 | The funds guide's visual waits for the founder's pick | product D55 | Covered by #177 |
| W9 | A later fees page on which fees matter most and are most worth negotiating | product D57 | Covered by #171 |
| W10 | Ranking houses for makam and government bonds on their guides | product D52 | Covered by #56 and #169 |
| W11 | Regulator and protection of the two houses that sell only funds bought abroad | product D61 (7) | Covered by #194 |
| W12 | Written consent from the Bank of Israel, TASE and the ISA; the Bank's series A-20 to A-23 | product D20; data-schema | Covered by #77 |
| W13 | Merging the four device side stores into the state document | product N3; data-inventory | Covered by #52 |
| W14 | A news section | product N7, D24 | Covered by #121 |
| W15 | The founder's sign-off on the site parameters | product N1 | Covered by #76 |
| W16 | The CMA register of financial-service providers is unread (REG OQ3) | product dependency 8 | Covered: an open question in the rule base (regulators-and-protection.md, coverage.md); the register pages are on #97 |
| W17 | Meitav Trade's tariff contradicted its own pages | product dependency 5 | Done: its tariff is collected (data-inventory); #42 and #150 closed |
| W18 | Whether the Bank of Israel's uniform deposit-disclosure format is machine-readable; only Leumi's savings plan on the bank side | product dependency 6a, N6 | Covered by #96 and #153 |
| W19 | Which exposures get full fund records first | product N4 | Done: every index on the indices page has fund records (60 funds) |
| W20 | Switching's rebuild | product D38 | Covered by #50 |
| W21 | Keep the 15%-of-nominal sensitivity line at the provident fund for investing's exit? | method F-44, G-02 | You decide #225 |
| W22 | The tax with the refund not claimed (A-14 off) is a flat 25%, not max(20%, min(bracket, 25%)); moves golden S51 | method F-44 | Covered by #73 |
| W23 | Re-read TXP-02's floor against s.45A(d) | method F-31 | Done: the rule base re-read it on 2026-10-25 and the reading stands (method checker) |
| W24 | One account for everything, or a pick per security | method F-80 | Covered by #54 |
| W25 | Early pension withdrawal (F-48); the IRA provident fund | method | Covered by #88 and #90 |
| W26 | Fee-kind hues follow fee size on the fees page but a fixed kind elsewhere | design-system 2.3 | Done: no longer open; ground rule 6 lets each chart give a colour its own meaning with its own legend |
| W27 | The pension deposit bar borrows fee kind 4's magenta for severance | design-system 2.3 (writer and checker) | Done: no longer open; inside that chart magenta means severance only (ground rule 6) |
| W28 | `FitMarkCard` exported, used nowhere | design-system | Filed #207 |
| W29 | Unused strings `consolidation.guideLater`, `r4catalogue.headings.fundManagers` | design-system | Filed #207 |
| W30 | Old design-system section 5 (open questions Q1 to Q7) | design-system | Done: nothing in it is open |
| W31 | Ages written in words (F-42, CS-18) instead of the number component | copy | Filed #206 |
| W32 | "זיהינו" against the narrator "האתר" | copy | Filed #206 |
| W33 | "פער המעקב של הקרן" against the glossary's "הפרש עקיבה" | copy | Filed #206 |
| W34 | The indices page's cost names against the glossary terms | copy | Filed #206 |
| W35 | The maqaf before a filled value decided at run time | copy | Filed #206 |
| W36 | Promises of later work ("יתווספו בהמשך", "יתווסף בגרסה") | copy | Filed #206 |
| W37 | Payout words "לא מחלקת / מחלקת" against the labels "צוברת / מחלקת דיבידנד" | copy | Filed #206 |
| W38 | Two strings put an open-question code in brackets | flows archiver | Filed #206 |
| W39 | "הוזן על ידך" still the entered value's source title in `value.ts` and `revisit.ts` | sweep 2 | Filed #206 |
| W40 | Glossary rows for the index names | glossary | Filed #205 |
| W41 | Glossary rows for terms a rule defines | glossary (writer and checker) | Filed #205 (the two switching terms on #220) |
| W42 | The five conflicts inside the rule base removed from the glossary | glossary (writer and checker) | (1) Done: closed in the rule base (IRA OQ4); (2) Covered: the rule base tracks it (CS OQ14); (3) to (5) Filed #219 |
| W43 | The gov.il copy of the 2020 uniform statement circular, and whether the 2025-26 draft is in force (PF OQ16) | glossary | Covered: open question 16 in provident-family-common.md |
| W44 | The cash rate in the two comparison modes | glossary (writer and checker) | Done: method 2.4 replaces `cash_rate` per candidate with the product's own rate |
| W45 | No stale rule for price lists (`staleTariff`, 90 days) or refresh cadence for deposit terms in data-schema 3.6 | glossary; flows archiver | Filed #208 |
| W46 | Switching gaps (SW-05 to SW-09 figures, SW OQ3, OQ4, OQ6, OQ16, experience records, securities to a foreign broker) | glossary | Filed #220 (long horizon) |
| W47 | Cross-references to removed glossary sections (design-system "glossary 10.2"; roadmap, flows) | glossary (writer and checker) | Done: none left on main; roadmap and flows archived |
| W48 | The Hebrew of the "איפה זה בדוח" row | glossary | Filed #205 |
| W49 | The glossary generator writes its own section 6, colliding with "Site definitions" | glossary checker | Filed #205 |
| W50 | Exposure-mode saved record and re-run only an engine note | glossary checker | Done: the revisit block re-runs exposure mode (`site/app/lib/revisit.ts`) |
| W51 | Regulator averages in the never-built `data/averages/` | data-schema | Done: D22 shows them as links; data-schema 3.9 says not built (the data-update skill's stale route is on #208) |
| W52 | The expected-inflation series (A-02, G-01) not sourced | data-schema | Filed #211 |
| W53 | The average-wage series (TXP-03, PEN-04) not sourced | data-schema | Filed #211 |
| W54 | `data/open-questions.json` behind the rule base | data-schema; data-inventory | Filed #209 |
| W55 | The track page's "why someone might pick this track" line has no data file | data-inventory (writer and checker) | Done: no work; nothing in docs/product.md asks for it |
| W56 | Two draft tier-2 records outside data/ | data-inventory | Covered by the tier-2 issues #103 to #111 (and #99, closed) |
| W57 | VOO, IVV and iShares ACWI unpriced until TXF-37 | data-inventory | Covered by #152 |
| W58 | Invesco funds and iShares TA-35 not collected | data-inventory | Filed #212 |
| W59 | Official publications beside the mirror-cited rules | data-inventory checker | Covered by #84; every rule now has sources and none rests on a mirror alone |
| W60 | Method §13 does not say the run year's figures apply to every future month | architecture (writer and checker) | Filed #208 |
| W61 | Digit check over guide prose not built | architecture | Filed #214 |
| W62 | Provenance crawl not built | architecture | Filed #214 |
| W63 | iPhone storage eviction | architecture | Done: the founder accepted the risk, revisited if a friend loses saved state (architecture 3.6, restored by the checker) |
| W64 | Scaffolding helpers for new records | architecture | Filed #215 |
| W65 | design-system's "gap 8.6", popover and shadcn/Radix claims | architecture | "gap 8.6": Done, it resolves in architecture 3.5; the popover and shadcn/Radix lines: Filed #208 |
| W66 | Each cash product on its own figure | parameters-rationale | Covered by #93 |
| W67 | Recheck `cash_rate` at the decision of 23.11.2026 | parameters-rationale | Covered by #119 |
| W68 | More provident-fund-for-investing list prices than Meitav's | parameters-rationale (writer and checker) | Filed #210 |
| W69 | Evaluate the unlinked government bond in exposure mode | parameters-rationale (writer and checker) | Filed #213 |
| W70 | A finer fit table by sub-classification | parameters-rationale | Covered by #70 (the table's one known gap); the refinement served the removed fit mark |
| W71 | P-08's S&P 500 `fund` field still 1148162 | parameters-rationale (writer and checker) | Filed #209 |
| W72 | `versions/candidates/elsewhere.md` untested | user lab | Covered by #196 |
| W73 | The founder answered 2 of 15 sites on the elsewhere form | user lab | Done: nothing to do; his further answers are optional |
| W74 | Names cut with an ellipsis (indices cost bars, chip list) | design-spec archiver | Filed #216 |
| W75 | The roadmap's open lists | design-spec archiver | Done: copied into issues on 2026-10-31 (spot-checked #17, #45 to #54, #88, #117, #183, #189) |
| W76 | il-finance "Serves:" lines citing roadmap R1, R2, R5, and switching-and-transfers.md citing product 3.7 | product writer; design-spec archive checker | Filed #219 |
| W77 | `side-stores.ts` and `exposure-mode/fields.tsx` comments cited the archived roadmap | design-spec archive checker | Done: fixed in bee8f970 |

## Conflicts

| # | Conflict | From | Fate |
|---|---|---|---|
| C1 | product.md header "no figure appears" against decisions quoting figures | product writer | Filed #208: a convention of the document, not a decision, so a wording fix |
| C2 | Fee page's negotiation text (3.5) against D44 "no advice on negotiating" and D40, D57 | product writer | You decide #221 |
| C3 | Guide values following to the catalogue and goal comparison against D34, D37 | product writer | Settled: followed D37, the later decision, and the code |
| C4 | D17's fit-mark candidate set | product writer | Settled: D34 and D54 removed the fit mark |
| C5 | Trades per month in old 3.4 | product writer | Settled: D52, D53; sweep 1 fixed method A-28 the same way |
| C6 | Idle-cash Bank of Israel figure labelled as sourced, against D20 | product writer | Settled: D20 in product.md; the method's F-60 still differs, noted on #45 |
| C7 | A fund manager's page listing funds from Maya, against D33 | product writer | Settled: D33 |
| C8 | D32 pointing to the roadmap, against CLAUDE.md's issues #45 to #48 | product writer | Settled: CLAUDE.md |
| C9 | Four files citing deleted appendices | product writer and checker | Settled: no citation left on main; three of the files are archived |
| C10 | switching-and-transfers.md "Serves product 3.7" | product writer | Filed #219 |
| C11 | P-09's questions page against the code | method writer | Settled: D58; CLAUDE.md no longer says it |
| C12 | F-63 typed fund "accumulating" against F-65 | method writer and checker | Settled: the later passage (F-65, D44) |
| C13 | F-63 worth lines not rendered | method writer and checker | Settled: the doc describes the code (brief item 9) |
| C14 | G-28 "savings-plan terms not collected" against Leumi's record | method writer | Filed #208 |
| C15 | F-70 loss filter not applied | method writer | Settled: the doc describes the engine; the fit mark is off the pages (D34, D54); its glossary rows on #205 |
| C16 | A-20's citation moved onto the press release | method checker | Settled: corrected by the checker (46e2d02d) |
| C17 | CLAUDE.md's questions page | design-system writer | Settled: D58; CLAUDE.md updated |
| C18 | theme.css red and green as series (`--chart-cost-fixed`, `--chart-cost-fund`, `--label-payout`) against ground rule 6 | design-system writer | Covered by #191 and #204: the colours of option V1 (`research/specs/2026-11-05-indices-colours/` round 2) move them off status colours |
| C19 | "No page before its mockup" dropped | design-system writer | Settled: ground rule 1 |
| C20 | Loss filter quiet text (6.1) against the accepted-fall field (9.1) | design-system writer | Settled: the later passage |
| C21 | Fee-drag total neutral-200 against neutral-50 | design-system writer | Settled: the theme's value |
| C22 | The stale fixed-label table (2.9) | design-system writer | Settled: CLAUDE.md puts the strings in copy.ts |
| C23 | Bank chips and "pin a listed option" not in the code | design-system writer | Settled: brief item 9 |
| C24 | One teal hue in steps for options (6.5, 9.3) against ground rule 6 | design-system checker; sweep 2 | Filed #217 |
| C25 | A fixed guide structure and the checklist on guide pages, against D49 | design-system checker; sweep 1 | Settled: restored to D49 by the checker and sweep 1 |
| C26 | Code comments citing removed copy.md sections | copy writer | Settled: copy.md's opening note maps an old citation to the copy.ts string beside it |
| C27 | "מטרה" on the home question card | copy writer | Settled: the founder's later choice |
| C28 | Narrator "אנחנו" against "האתר" | copy writer | Settled: the decision; the code's leftover on #206 |
| C29 | Subjectless comparison allowed, editor added subjects | copy writer | Settled: no conflict; a rule that permits a form is not broken by text that does not use it |
| C30 | "פער המעקב של הקרן" against "הפרש עקיבה" | copy writer | Settled: the decision; the code on #206 |
| C31 | Payout tags against labels | copy writer | Settled: the later passage; the code on #206 |
| C32 | The maqaf's code point | copy writer and checker | Settled: a factual fix (U+05BE) |
| C33 | "אחזקות" against "החזקה" | copy writer | Settled: the later decision |
| C34 | Copy quotes that did not match copy.ts | copy checker | Settled: corrected by the checker (35b3e6ee) |
| C35 | Maya lists "unconfirmed" against CLAUDE.md | glossary writer | Settled: CLAUDE.md |
| C36 | Pension clearing house price | glossary writer | Settled: the later narrowing |
| C37 | Fit-mark rows disagree on the accepted fall | glossary writer | Filed #205 |
| C38 | "איפה זה בדוח" Hebrew against PF-33 to PF-38 | glossary writer | Filed #205 |
| C39 | "מדד" rows naming two indices | glossary writer | Settled: rewritten to the rule base |
| C40 | Foreign broker with no snapshot | glossary writer | Settled: the data has Interactive Brokers snapshots; the rest served switching (D38) |
| C41 | "איגרות חוב מובנות" cut mid-quote | glossary writer | Filed #205 |
| C42 | Minimum discount period: two years against five | glossary checker | Settled: corrected to the rule base (PF OQ2, KGL OQ8 closed) by the checker |
| C43 | Which sections the generator writes | glossary checker | Settled: the note corrected; the generator's collision on #205 |
| C44 | Money-market funds reading no tariff | data-schema writer | Settled: the data and method F-80 |
| C45 | Fund lists used for the candidate set, against "no fund list" | data-schema writer and checker | Settled: CLAUDE.md |
| C46 | `data/averages/` described as a collection | data-schema writer | Settled: marked not built; the data-update skill's route on #208 |
| C47 | Section 3.12 cited by the archived flows | data-schema writer | Settled: a one-line stub keeps the citation resolving |
| C48 | Fund-list counts with a link (product 3.4, dependency 6) against "no count for a list not read" | data-inventory writer; sweep 1 | Settled: CLAUDE.md, "there is no fund list" (a count per index would be read from it); the wording in product.md on #208 |
| C49 | Funds without a tracking record | data-inventory writer and checker | Settled: the data schema and the data (count corrected by the checker) |
| C50 | Side stores "outside the export file" | data-inventory writer | Settled: CLAUDE.md |
| C51 | Rule sources "warn, then fail", 144 mirror rules | data-inventory writer | Settled: validate.ts as it is |
| C52 | Leumi's tariff used by every illustrative run | data-inventory checker | Settled: corrected to method F-80 and P-05 by the checker |
| C53 | A guide-prose digit check and a crawl described as built | architecture writer | Settled: described as not built; the work on #214 |
| C54 | Provenance as a native popover (design-system 308) | architecture writer | Filed #208 |
| C55 | shadcn/ui and Radix (design-system 280) | architecture writer | Filed #208 |
| C56 | Ground rule 1 against the old 3.9 design pass | architecture writer | Settled: CLAUDE.md |
| C57 | The engine in a Web Worker | architecture writer | Settled: the code; ground rule 5 governs slow work |
| C58 | Raw archive per CMA period only | architecture checker | Settled: restored by the checker (5cca8d6f) |
| C59 | The goal on the workbench and home page, against D37 | architecture checker; sweep 1 | Settled: D37 and D58, fixed by the checker and sweep 1 |
| C60 | P-03 `negotiate_share` "not used yet" | parameters-rationale writer | Settled: the later data file |
| C61 | P-08's S&P 500 fund | parameters-rationale writer and checker | Settled in the doc; the data field on #209 |
| C62 | D21: P-05's tariff "serves the guide page and the fee page only" | parameters-rationale writer | Filed #208 (the substance is settled by D29 and ground rule 2) |
| C63 | The founder's own income, age and cases as reasons | parameters-rationale writer and checker | Settled: CLAUDE.md, nothing private in the public repository |
| C64 | P-08's Hebrew rationale cites GOV OQ4 | parameters-rationale writer | Filed #209 |
| C65 | A new flag becomes a bench case, against live/ | user-lab writer and checker | Settled: the later text (live/README.md) |
| C66 | "About a third held out" against 42% | user-lab writer | Settled: metric.md states the planned share and points to the actual split; no bar changes |
| C67 | The variant test's date | user-lab writer | Settled: a factual fix |
| C68 | qa-engineer tested flows.md per release | agents writer | Settled: CLAUDE.md ground rule 8 and the size rule |
| C69 | Phone as the base design | flows archiver | Settled: CLAUDE.md ground rule 8 |
| C70 | Catalogue additions through a pull request | flows archiver | Settled: CLAUDE.md |
| C71 | Codes in brackets in copy.ts | flows archiver | Filed #206 |
| C72 | Names never cut with an ellipsis, against the code | design-spec archiver | Filed #216 |
| C73 | The PC layout never adds content | design-spec archiver and checker | Settled: CLAUDE.md ground rule 8; the site no longer follows it |
| C74 | D21 names IBI's S&P 500 ETF, the data 5139282 | sweep 1 | Filed #208: the signed-off parameter file and method F-67 hold |
| C75 | The stairs: D59 says they leave, method F-91 and the code keep them | sweep 1; product checker | Settled: D59, the later decision; the build is #191 |
| C76 | The fund list's gap column: D61 (2) against F-92 (a) | sweep 1 | Settled: D61; the build is #193 |
| C77 | The track workbench in method F-64, F-83 and data-schema 3.13, against D54 | sweep 1 | Filed #207 |
| C78 | Idle-cash rates: D20 against method F-60 | sweep 1 | Settled: D20, the decision; the method follows when the page comes back (#45, commented) |
| C79 | D57 removed the advertising block, D65 writes into it | sweep 1 | You decide #222 |
| C80 | D34 "no page reads the other columns", against D54 | sweep 1 | Settled: D54, the later decision; D34's row noted on #208 |
| C81 | A refresh opens a pull request, against "never open a pull request" | sweep 1 | Settled: CLAUDE.md's rule governs Claude's finished work, not the refresh pipeline's review of a failed sanity check |
| C82 | D59 to D61 written as built | product checker | Settled: the decision log records decisions; the builds are #191 to #193 |
| C83 | Green for more money and red for less, against ground rule 6 | sweep 2 | You decide #223 |
| C84 | CLAUDE.md "dashed blue for an entered return" against dashed in the option's own hue | sweep 2 | Settled into #217: ground rule 6 gives each line its own hue; CLAUDE.md's summary describes the single-series timeline; the drawing shows both |
| C85 | Pieces under 44 px (question card chips, goals list buttons, sheet buttons) | sweep 2 | Covered by #175 (commented) |
| C86 | Glossary site rows about the fit mark, workbench and providers page | sweep 2 | Filed #205 |
| C87 | "שאלה פתוחה:" with and without a colon | sweep 2 | Settled: copy.md section 10, the style guide; the one example on #206 |
| C88 | The 17 conflicts fixed by sweep 1 (dcb3c42a) and the 16 by sweep 2 (7939796a) | sweeps | Settled: fixed by the sweeps |

## Counts

- Open work, 77 rows: 33 filed (W42 and W65 split, and count as filed), 2 "you decide", 24 covered, 18 done.
- Conflicts, 88 rows (C88 stands for the 33 the sweeps fixed): 16 filed, 3 "you decide", 2 covered, 67 settled.
