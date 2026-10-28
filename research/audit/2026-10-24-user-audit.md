# User audit of the site, 2026-10-24

Run overnight at the founder's request ("audit the site from a user's perspective, both visually and the
experience the user gets from the site, from a finance noob to a pro"), while all five roadmap releases
were live at https://orishamir.github.io/finance-tool/ (commit ea21881, the change log already removed).

## Method

Sixteen independent auditors (Claude Fable 5.1, high effort), each with one perspective and one task, each
browsing the live site through Playwright (Chromium, and WebKit for the phone pass) at 360 to 1440 px, with
Hebrew locale and Israel time. None read the repository, the docs or another auditor's report; they knew only
what the site shows, plus a short list of settled decisions not to report (dark theme only, Hebrew only, no
accounts, no accessibility or legal work, numbers checked elsewhere, the change log being removed). They were
told not to verify any figure, only to judge how it is asked for, presented and explained. Each wrote a
report with severity-ranked findings, every finding backed by a screenshot or a verbatim quote.

| # | Perspective | Who / lens | Device |
|---|---|---|---|
| 1 | Finance novice | Noa, 23, customer-service rep, 15,000 ₪ in checking, never invested; three plain questions | phone |
| 2 | Intermediate saver | Dan, 29, developer, 120,000 ₪ deposit, 7-year apartment goal; the whole goal → comparison → save → return flow | desktop |
| 3 | Parent with holdings | Rina, 54, teacher, four paper statements, "do I pay too much?" and what to do about it | laptop, 125 % zoom |
| 4 | Professional | Yossi, 41, licensed pension adviser: framing, omissions, provenance credibility, "would I let a client read this" | desktop |
| 5 | Self-employed and edges | Maya, 33, freelancer with variable income, a loan and a salaried spouse: where the site hits walls or assumes silently | phone, tablet |
| 6 | Returning visitor | Continuity: second visit, a month later, second device, cleared storage, two people on one PC, deep links | phone, desktop |
| 7 | First impressions and navigation | Five-second test, menu labels vs pages, doors, wayfinding, experienced site map, 404, search | phone, desktop |
| 8 | Visual design | Fresh-eyed product designer: type, hierarchy, components, colour, charts, RTL, overflow; plus the founder's own Chrome for the "text looks weird on a PC" report | 390 to 1440 |
| 9 | Hebrew copy | UX writer: register, address, jargon, terminology consistency, microcopy, sentence craft, mixing of scripts | desktop |
| 10 | Interaction edges | Exploratory tester: every input with empty/0/negative/huge/pasted values, dialogs, back/forward, reload, offline, double submit | desktop, phone |
| 11 | Decision quality | Behavioural scientist: what decision a person leaves with, anchors, framing of risk, precision, flags, the missing next step | desktop, phone |
| 12 | Mobile and speed | Phone specialist: load times on a slow network, bytes, layout shift, touch targets, keyboards, landscape, WebKit | 360 to 430 |
| 13 | Trust and provenance | Sceptical user: the number marks, the "where is this from" sheet on 15 numbers, 40 source links followed, dates, who is behind it | desktop, phone |
| 14 | Guides as a learner | One evening through all 17 product guides and 7 exposure pages with a ten-row scorecard per page | desktop, phone |
| 15 | Catalogue power user | Amit, 36, knows his fund number: find, sort, filter, compare across the catalogue and the three workbenches | desktop, phone |
| 16 | Israeli expectations | UX researcher benchmarking against bank apps, גמל נט, הר הכסף, the clearing house and community vocabulary | phone, desktop |

A seventeenth agent, a Hebrew editor, reviewed every UI string (1,564 rows) against a style guide it wrote
first; its proposals were applied after the audit (the founder delegated the strings review to it on
2026-10-24). An eighteenth, started earlier the same night, reviewed every screen against
`docs/design-system.md` at four widths after the founder saw the header navigation wrap on his PC.

The raw reports and screenshots are in the session's scratch folder (`scratchpad/audit/reports/*.md`); the
findings that matter are consolidated below.

## Findings

243 numbered findings across the sixteen reports, deduplicated to 112 rows (consolidated list in the session's
scratch folder, `scratchpad/audit/consolidated.md`): 6 blockers, 59 major, 37 minor, 6 nits, 4 aggregates.
Of the 112: 85 were fixable the same night without a product decision and were fixed (see "What changed");
16 need the founder (section "Decisions"); 4 are larger engineering (section "Not done tonight"); 5 were pure
wording (the Hebrew editor); 6 were by design.

### The six blockers

| # | Finding | Raised by | Status |
|---|---|---|---|
| 1 | Unknown ids under real routes (`/exposure/sp500`, `/companies/zzz`, `/switch/x`) rendered a bare "לא הצלחנו לחשב את הגרף" line instead of the 404 page, because GitHub Pages answers the route's data request with its 404 file | nav, power, copy, edges, self | fixed: the error boundary maps that case to the real 404 page and any other error to a "משהו השתבש" page inside the shell |
| 2 | A study-fund deposit above the employer's exempt share (rule TXH-01) made the engine throw: the fee page said "חסום: TXH-01", the holdings card "לא הצלחנו לחשב את העלות", and the founder's own guide chart failed with a saved 1,200 ₪ deposit | parent, decision, pro, visual, self | fixed: the engine splits the deposit as method F-52 already describes (reviewed independently); the guide bundle now ships the rules an entered deposit needs; every failed run carries a plain-Hebrew reason |
| 3 | The comparison headline was an unconditional verdict ("קרן כספית היא הטובה ביותר") while most options sat under "16 עוד לא נבדקו" for a missing return or employment type; exposure mode headlined cash as "the only exposure ranked" before any input | noob, decision, pro, dan, trust, expect | fixed: three-line headline (who won among the N ranked · the first flip point · which options were not evaluated, with links to the missing field); employment defaults to salaried from a yes to pension or study fund through work, shown and reversible |
| 4 | Search ignored fund and track numbers (880, 7978, 1148162) and saved every miss to the device | power, expect, edges, nav, parent | fixed: numbers, company ids and ISINs are indexed; guide pages rank above catalogue tracks; a miss is saved only on an explicit copy |
| 5 | On a PC the header search opened a modal that could not be closed and stole focus after two keystrokes, so the miss message echoed "טוח מנהלים" | edges, power, visual, nav, expect | fixed: the header field is the search input with results under it; Escape, X and a click elsewhere close it |
| 6 | A comma decimal ("2,5") was read as 25 in every amount and percent field, with the blue "entered" badge and no message | edges | fixed: one shared parser (`parseNumber`) for every numeric field |

### The themes behind the 59 major findings

- **Decision support.** The verdict read as a prediction, the "why" line named management fees as decisive when the driver was the entered return, the exit-tax figure in the "why" sheet was holding tax plus exit tax under an "exit" label, risk was typed as a bare percentage and never shown back, projections ran to the agora, and after "I chose this" the only offer was to save. (decision, dan, pro, noob)
- **English and developer codes in Hebrew text.** Enum values ("unlinked", "cpi", "bank-deposit"), English rule titles and working notes in the provenance sheets, "F-20" as a whole section, decision ids after sentences, a raw CSV path as a source, "Meitav Gemel and Pension" on the fees page, "October 2026" in a date field. (copy, pro, trust, noob, power, learner)
- **The strength mark.** "מוסדי" after nearly every number was never in the legend, split phrases ("עד 4מוסדי ימי עסקים"), and in Israeli finance reads as *more* authoritative, the opposite of its meaning here. (pro, trust, visual, power, parent)
- **Reachability.** The switching playbook and the fund workbench were reachable only by URL; the menu put the reference pages ahead of the tools; the goal, which everything depends on, was a 14 px status line. (nav, parent, returning, self, learner)
- **Forms and feedback.** A failed save in the add-holding form was invisible under the sticky bar; a field error on the goal form bounced the person to the comparison page; "מהפקדה" was required for a fund with no deposits; a pasted company name with extra words hid the provider buttons; a double click saved twice; exposure mode re-ranked on the first keystroke so "12" became "1". (parent, copy, edges, self)
- **Phone and speed.** Idle cash wiped what was typed when its data arrived; goal, comparison and fees showed only "טוען…" for 8–14 s on a weak signal; number buttons were 22–29 px tall; scroll position was lost on back; fonts swapped late; the rules page was 1.9 MB and 295,000 px tall. (mobile)
- **Trust.** 286 of 500 rule cards had no source link; a bank rate "בתוקף מ־25.10.2026" (tomorrow) carried no flag outside exposure mode; no about or data-date line anywhere; some source links landed on home pages. (trust, pro, expect)
- **Guides as teaching.** "Why people use it" sat three quarters down every page after up to 40 rule chips and 38 company pills; the "what to check" section was the site's coverage audit, not a reader's checklist; the product-versus-exposure split was never taught and no guide linked to an exposure; the guide list was ordered by English id. (learner, noob, pro)
- **Returning visitor.** A saved comparison said "no change" after the person's own edits; importing the same file twice duplicated the goal while the message claimed dedupe; playbook ticks were not exported and vanished when a provider was picked. (returning, edges)
- **Self-employed and out of scope.** Choosing "עצמאים" changed one row and left the form employee-shaped; loans, couples and variable income were nowhere, not even as "not covered". (self, expect)
- **Catalogue.** Sorting by fee put closed sector funds first; chips looked like filters but only expanded groups; the providers page for a study fund showed one card with no statement; a company link went to a slug that did not exist. (power, expect)
- **Visual.** The header navigation wrapped onto two lines at every PC width (the founder's own report); stray spaces before punctuation after inline numbers; ".00" on round sums; charts with 2.5-year ticks and colliding labels; a clipped chart table; thin rendering of the variable fonts on a 2560 px Windows screen. (visual, quirk review)

## What changed tonight

Everything below is committed with this report. The design docs carry the amendments, dated 2026-10-24.

**Engine and method.** The study-fund employer deposit above TXH-01's limit is split per F-52 instead of refusing (three golden-style tests, independent finance review); the F-80 component list says "tax during and at exit"; F-60 defines the yearly idle-cash line as an approximate ×12 reading; F-61 records the fee page's opening sentence; F-71 defines the shekel echo of the accepted drop as a restatement of the entered number; §13 states the display-rounding rule.

**Shared behaviour.** One number parser for every field; display rounding (whole shekels from 1,000 ₪ for computed, entered and parameter amounts; two decimals for tariffs, fee rates, table cells and anything within 0.50 ₪ of a P-03 threshold); the strength mark is a single caution icon before the digits, named "לפי החברה" in a fourth legend item, with the word only at figure size and in the sheet; a future-date caution on any figure not yet in force; Hebrew input and formula names in every sheet, English working notes never shown, source shown as its Hebrew title or the link's host; a "source link not yet attached" row on rules without one; clean copy-paste of amounts (no hidden marks); 44 px hit areas on numbers, chips and terms; sticky bars unstick on short screens; scroll restored on back; fonts subset and preloaded; data bundles preloaded; menu and search visibly disabled until hydration; the real 404 page for unknown ids; a "something went wrong" page inside the shell; a failed chart shows its reason and a reset link.

**Shell and home.** Header navigation on one line at every PC width (inline destinations from 1280 px, the menu button below); PC search as a combobox under the header field; search by number, guide pages first, not-covered products as answers; menu order with the five doors first and a "מאחורי הקלעים" group; the saved goal as a home card; footer with the site name, "אתר אישי, לא מסחרי, בלי קישורי שיווק; הכול נשמר במכשיר שלכם" and "נתונים נכון ל־{date}"; door cards with a visible chevron and hover; body text at weight 450, root size 17 px from 1600 px and 18 px from 2200 px, muted text one step lighter (one-line reverts each, for the founder to judge on his PC).

**Goal form and comparison.** Submit stays on the form with a summary line and focus on the first bad field; optional fields say what they are for; the pay-slip legal text sits behind a disclosure; "עצמאים" relabels the employee-shaped fields; a yes to pension or study fund through work defaults employment to salaried with a visible, reversible note on every page where it changes a figure; three-line conditional headline; "ההבדל הגדול ביותר" with both figures instead of "מכריע"; "מס (בהחזקה וביציאה)"; a gross-return row in the "why" sheet; the accepted drop echoed in shekels with a short band at the start of the chart; the deposit tariff's amount range checked with an own-rate field; "בחרתי בזה" leads to the workbench, the playbook and the fee page; the card menu above the mode bar; a history entry per mode; exposure mode re-ranks on commit and prefills equity returns from the product-mode return, marked and editable; a flip that creates a tie is reported.

**Holdings and idle cash.** Visible save errors with the first one scrolled into view; "מהפקדה" optional; company matching by words; a track found by its number; a unique exact track auto-linked; single save on double click; a confirm before discarding a dirty form; the typed statement date and the data month shown separately; "איך עוברים" and the fee page linked from the card; the card's shekel line on the F-61 what-if; the plain-Hebrew reason when a run fails; deposits named as not yet a holding type with a link to idle cash; idle cash keeps typed values, links the option names, adds the yearly line, catches "0.04" and hides the result while a field is invalid.

**Fees and switching.** A plain opening sentence; "ranked first for your goal" with the "worth avoiding" badge softened in that case (a presentation rule over P-03, thresholds unchanged, rank 1 read from the engine's tie set); the what-if says it does not change the ranking; the Hebrew institution name instead of the English record title; the playbook summary box of verbatim rule sentences (tested), dropdowns limited to the product's providers, "דלגו" on the employer step for a self-employed profile, rule chips outside the tick labels, ticks keyed by product so they survive a provider pick.

**Guides.** "Why people use it" under "what it is"; rule chips and company lists behind toggles; the coverage audit collapsed under "מה האתר לקח בחשבון"; the chart headline labelled as an example; no-chart stubs as one quiet sentence; the guide list grouped by purpose with "מאיפה להתחיל" and a three-line product-versus-exposure explainer; every guide lists the exposures its product allows; the two makam pages cross-link; "all the rules" lands on the product's section; the study-fund deposit row conditional on employment with rule citations (TXH-04, TXH-01, TXH-03, TXH-05); the red "unclear tax" badge only where the product is actually blocked; companies split into open-to-all and sector-only; the terms table capped to the page's own terms; prefix letters bound to their terms.

**Catalogue and workbenches.** Sector-restricted funds hidden by default with a count; chips that filter; a number search opens only its group; filter, sort and chip state in the URL; a second press reverses the sort; the providers page says when only one tariff of 38 was collected and links the company correctly; a bank page line pointing deposit offers to idle cash; the "unreported" cells explained.

**State and transfer.** A saved comparison says when the goal changed since and offers to re-save; imports checked item by item with a Hebrew reason per rejection; no duplicate goal on a second add-mode import; the export carries the entered offers, variant assumptions, playbook ticks and own rates; "delete what was imported" removes them too; one-person-per-device and private-window lines; count forms in Hebrew one/two/many.

**Copy.** The Hebrew editor reviewed all 1,564 UI strings against a style guide it wrote first (now section 10 of `docs/copy.md`): 73 changes and the copy audit's items applied (register, calques, gender-safe headline subjects, "הזנתם" for "הוזן על ידך", "אי אפשר" for "ניתן", the strength label, stale "coming later" promises rewritten); its verdicts are in the review page's database for the founder to see.

## Decisions for the founder

*Status 2026-10-28:*

- **Taken since:**
  - 5 and 16 were taken by the lead the same day (scenario audit, "Decisions for the founder" item 7).
  - 8: the word "לפי החברה" stayed, and D31 (2026-10-26) narrowed it to a company figure used outside its own context.
  - 9 was answered the same afternoon: no name on the site, and the footer line stays.
- **Waiting with held pages:** 15 waits with the holdings page, held for review (D32).
- **Still open:** the others, as far as the docs record.

None of these blocked tonight's work. Each has options and a recommendation in the consolidated list; the short form:

1. **Past returns and fund size next to fees on every track list.** Recommended: yes, from the same CMA dataset the fees come from, labelled as past, after confirming that resource's terms once (D22). Users read a fee-only table as broken.
2. **Tick-to-compare two to four named funds side by side.** Recommended after 1.
3. **How "decisive" is computed.** Method F-80 names the largest gap among four cost components and cannot name the return gap that actually drives most verdicts. Recommended: add gross return as a fifth component (small method change with golden cases). Tonight's wording change ships without it.
4. **"שווה להימנע" versus the alternative's own cost.** P-03 calls a fee avoidable when some other option does not charge it. Recommended: compare against the alternative's total drag. Tonight: the badge is softened when the product ranks first.
5. **Let an entered fund fee drive the brokerage ranking.** Recommended: yes (D4 already allows an entered fee level), plus more fund records.
6. **Split one goal's money across products when a ceiling bites.** Recommended: a manual split field, in the spirit of D12.
7. **Risk beyond the filter.** Recommended: draw the value at the goal date if the entered drop happens in the last year (one formula); a sourced drawdown only if a free source with clear terms exists; no change to D11.
8. **The strength label.** Done as "לפי החברה"; say if you want another word.
9. **Name yourself on the site.** The footer now says it is a personal, non-commercial site; a name is your call.
10. **Pension insurance cost as a monthly premium rather than a percent of deposits.** Recommended: ask the premium from the annual report and convert (small change to A-17).
11. **New guide content:** one "how to open" line and four to six "what to check before opening" bullets per product, plus self-employed paragraphs in the pension guide and playbook, each citing a rule. Recommended: yes, written with the rule base.
12. **Rename "חשיפה".** Recommended: keep, now that the explainer teaches it; revisit later.
13. (folded into 11)
14. **Loans, couples, variable income.** Now stated as not covered. A "pay off the loan" row is a cheap formula if you want it; two people on one device stays out (D1).
15. **Deposits as holdings.** Recommended: a holding type "פיקדון" with term and rate typed by the person, judged against the idle-cash options.
16. **Prefill exposure-mode returns from the product-mode return.** Done tonight (marked, editable); say if you disagree.

Calls taken by the lead tonight without you: display rounding of projections to whole shekels (presentation only, §13 amended); menu order and the "מאחורי הקלעים" group; the goal line promoted to a home card (the two unapproved doors untouched); the guide list grouped by purpose; "פתוח לכולם" as the workbench default; "מתאים" captioned as a site rule; employment defaulted from the pension answer; the type weight and size changes for wide screens.

## Not done tonight

- Larger engineering: per-page bundle splitting and skeleton shells for the goal, comparison and fees pages on slow networks; lazy rendering of the 500 rule cards (they are now grouped and closed, but still shipped); draft autosave inside the add-holding sheet; a lint for prefix letters outside terms.
- Data follow-ups: Leumi's other deposit tiers (the site now flags an amount outside the collected tier and offers an own-rate field); `title_he` and `publisher_he` on rule sources (the UI falls back to the link's host); the 286 rules without a source link (the UI says so); TXH-06 (the reduced self-employed ceiling for someone also employed) is not mentioned on the study-fund row and not modelled; hyphens before numbers and ASCII quotes inside data texts.
- Two latent engine divergences recorded by the reviewer, not reachable from any page today: the employer line forces nominal contributions while the in-run split applies fractions to real ones; a combined run with an early withdrawal does not tax the benefited employer part as work income (TXH-13) unless the run is employer-only.
- The merge of the four device side stores into the state document stays pending the founder's approval; they are exported in the file.

## What worked well (keep)

The auditors were asked to be unsparing, and these are the things they singled out: the four home doors in plain words; idle cash's one-sentence cost of inaction with the person's own offer in the list; the three number states carried consistently into charts and sheets, and the sheet skeleton (value, state, source, publisher, checked, rules, strength); the "what would change the answer" flip points, called by the behavioural auditor the best calibration device he has seen in a consumer tool; the coverage statement with a reason per product; the "why X before Y" dialog; empty-by-design return and drop fields; presets that fill only what they say; save and return in one click with state surviving a crash; the fee page's headline in shekels with the regulator average, the legal cap, the what-if and the copy-ready negotiation script ("the one thing I could actually use"); provider and track pickers with legal names and fund numbers; the guides' fixed skeleton with sticky contents; honest negatives everywhere; the brokerage providers ranking; the transfer page's wording and undo; pre-rendering with a heading in under a second on a slow line, 16 px inputs with the right keyboards, no horizontal overflow on 19 routes at four phone widths; one component family with RTL done right.

## Gaps of the audit

WebKit and iOS were only touched by the mobile auditor; no real devices or networks; the 360 and 430 widths were overflow-checked only; nobody entered a provident-for-investment or child-savings holding or merged two holdings; transfer drag-and-drop and files from another site version were not tried; multi-goal use beyond import; exposure mode has one fund record to compare; the study-fund and provident providers pages are one card; the adviser did not read nine of the guides; the rules page was sampled; links were checked for status, not for the cited section inside a PDF; the founder's saved state was used only for the guide chart; no number was verified by brief, so the finance-reviewer passes were the follow-up (two ran tonight and their defects are fixed).

## Where the material is

Raw reports, screenshots, the consolidated list, the fixers' notes and the Hebrew editor's style guide and proposals are in the session's scratch folder (`/tmp/claude-1000/-home-ori-dev-finance-tool/b415c1d9-f05a-4147-bcd3-7cfd2e6abd2e/scratchpad/audit/`, `.../fix/`, `.../hebrew-editor/`). The Hebrew editor's verdicts are also in the review page's database (https://claude.ai/artifact/4nnsbdrQrNhdk3MFmzGLbr).
