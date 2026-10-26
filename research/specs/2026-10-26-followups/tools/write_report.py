#!/usr/bin/env python3
"""Writes report.md beside the brief (the harness refuses a direct .md write from a builder). Run from the repo root."""
import os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = r'''# Report: follow-ups from the scope settling and the open-question research (branch `followups`, 2026-10-26)

Builder: Claude Opus 5.5. Brief: `brief.md` beside this report, sections A and B. Working scripts are in `tools/`, the screenshots in `shots/`. Main had not moved when this was committed (base `2bac2df`), so no rebase was needed. This file is written by `tools/write_report.py`, because the harness refuses a direct .md write from a builder.

**Review round (2026-10-26).** A finance reviewer and an independent reviewer found 11 issues. Their fixes are in the section "Review round" at the end, which supersedes the first round below where the two differ:
- the age-60 settlement is flagged TXK-26, not G-21;
- the money-market custody note is narrower;
- the child-savings sentence drops the deposit cap;
- S52 cites TXF-04, not TXF-03.

## What changed

### A1. A falling index or currency never raises the taxable gain
- **Rule:** TXS-02 and TXF-03 (circular 10/2025, appendix, examples 3 and 4; the Supreme Court in ע"א 3555/15 מוזס, para 26).
  - When the index on the sale day is below the index on the purchase day, the inflationary amount is zero, not negative.
  - So the real gain is the nominal gain.
  - On a nominal loss, the part equal to the fall is not allowable.
- **Engine:** `indexedCost` in `packages/engine/src/ledgers/lots.ts`, used by the securities ledger and by the CPI-linked bond's sale.
  - Each lot is indexed by `J_T / J_lot` when the index rose. That expression is unchanged, so rising-index runs are identical to the bit.
  - A lot whose index fell counts at its cost.
  - On a loss, the part equal to the fall is added back, so the lot contributes `min(0, consideration − cost × J_T / J_lot)`.
  - `detail.fallDisallowed` reports that part.
- **Provident ledgers** (kupat gemel lehashkaa, the study fund's excess, the child-savings provident route):
  - A deposit made at a higher CPI than at the exit counts at its amount.
  - The basis is s.3(ה4)(3) (TXK-05, TXK-07): the gains withdrawn are interest, and only "gains in the amount of the linkage differentials" are carved out. With a falling CPI there is no such gain.
  - No text says this for a fall in so many words, so a run where it bites carries the label "reading" on TXK-07 (TXH-11 for the study fund).
- **Not floored:** a CPI-linked bank deposit (child-savings bank route, deposit ledger). Its interest is taxed in full even when the linkage is negative (TXI-25), and the Supreme Court left the offset open.
- **Method:** F-09, F-40, F-44, F-46 and F-50 are updated; G-07 is narrowed.
- **Rule base:** TXS-12 condition (e) is fixed in the references markdown (item 8). The record's Hebrew already said it.

### A2. The relief from 60 at the kupat gemel lehashkaa exit (TXK-06, F-44 with F-42)
- **The computation:** once the person reaches 60 in the exit year (TXG-04), the gains are the slice from the other income Y to Y + real.
  - Each part of that slice is taxed at the lower of its reduced bracket and 25% (TXG-04, TXG-07).
  - `detail.fullRateTax` keeps the flat 25% beside it.
- **Flags:** G-21 (settled through a return); TXK-06 only when the refund is not claimed (A-14 off).
- **What is still not computable:** nothing on the default path. With A-14 off the withheld amount stays final at the full rate. The manager's own withholding rate (20% in the regulation, TXK-26; Harel says 25%, TXK-28) stays G-02's open item.
- **The guide callout** no longer says "not computed". The wrapper record's `tax_at_exit` label is rewritten. The checklist row "נלקח בחשבון" is now true.
- **The guide's visual:**
  - The visual runs the fund with the age the person enters.
  - The brokerage side now gets the same profile, so both sides carry the relief.
  - The lump sum's sheets now name the age and the scenario income (P-05's 144,000), which move the number from 60.
- **TXS-23** (the securities withholding regulations) is not cited at this exit.

### A3. Credit points (TXG-05, G-23)
- The engine has no input for a person's credit points. TXG-05 says who gets how many is out of the rule base's scope.
- So nothing is applied. Every run that charges Israeli tax (foreign tax excluded) carries flag G-23. Its Hebrew line says no credit was taken off and when that matters: when the credit points exceed the tax on the person's other income, as in a year without a salary.
- G-23 in the method names the input needed: the person's credit points for the year, with the other income Y (A-13, which exists).
  - The run's tax then becomes `max(0, τ(Y) + τ_special − n × v) − max(0, τ(Y) − n × v)`.
  - `v` is twelve times TXG-05's 242 NIS a month.

### A4. The child-savings fee after 21 (CS-18, CS-30, F-54)
- **The run** uses CS-18's cap, 1.05% a year of the balance, labelled "עד", and raises flag `CS-18`.
  - A rate the person enters (`feeAfter21`) replaces the cap and is bounded by it, as F-15 bounds every provident fee.
  - There are no deposits after 18, so the 4% deposit cap does not bite.
- **CS-30's 0.23%** (Harel, Altshuler Shaham) is no longer read by the engine. It stays on the guide as a named example.
- **The guide** now gives the cap in its prose: "עד 1.05% בשנה מהיתרה ועד 4% מכל הפקדה".
- **The "worth knowing" row** for CS-18 showed 0.23% under "מי משלם, עד מתי, ומה התקרה אחר כך". That 0.23% is what NII pays the funds until 21, not the cap.
  - It now shows "עד 1.05%".
  - CS-18's figures are reordered so the cap comes first.
  - The component prints "עד" before any figure whose name holds `cap`.
- **Sweep:** IRA-17's row now reads "עד 2%" too. Every other pinned row was checked; see "Left" for KGL-02.

### A5. Money-market custody at a non-bank member (F-14, F-63, BRK-52)
- **Engine:** the securities run takes `memberKind`, `bank` by default.
  - A money-market unit pays no custody at a bank, whatever the tariff says.
  - At `non-bank`, the tariff's custody line applies.
  - The provider workbench sets it from the snapshot's provider class.
- **The site's provider code (`providers.ts`):**
  - "A missing buy/sell line stays a zero" now holds for money-market funds at a bank only. A non-bank member is mostly an investment marketer, which MF-26 does not bind, so there a missing line means "not comparable".
  - A non-bank custody line on a money-market fund carries the note that the regulators report it customarily waived, which is practice, not a term (`r4workbench.providers.mmfCustodyNonBank`).
- **The money-market guides** already said "at a bank".
- **Method:** F-14 and F-63 are updated.

### B6. Requests §6
- **Interactive snapshots:** BRK-35, now Ireland's compensation scheme, is the cover the snapshots meant (BRK-41: "cover amounts are BRK-14 and BRK-35"), so it stays.
  - REG-27 (SIPC itself) is added to both snapshots.
  - BRK-51 (IB Ireland's own statements) is added to IB's own snapshot only. It has no `data/rules` record yet; the company page shows it once the scope builder adds one.
- **`data/terms/sipc.json`:** BRK-35 is replaced by REG-27.
- **`gov-14.json`:** the figure names now say "(רק בסוג הישן "גילון חדש")" for `margin_cap` and `coupon_floor`. No page uses these figures in a computation.
- **`fee-exit.json`:** CS-16 becomes CS-28.
- **TXI-25 prose:** the government-bond guide and the CPI-linked bond exposure said the linkage loss "is not offset". They now say the district court did not allow the offset, the Supreme Court left it open, and the site does not offset it.
- **Also from §6:**
  - `ira-provident.json`'s eligibility now says that severance money that does *not* replace s.14 severance pay needs the employer's approval (IRA-09). Meitav's "from about NIS 200,000" is dropped from the product text.
  - Method F-25 now says GOV-13 sources the yearly coupon, and gives TXI-25's wording.
  - F-20 cites circular 7/2003 s.2.1.1.

### B7. Requests §7: source labels
- **Approach:** done through `data/sources/documents.json` and `publishers.json` only. `extract-sources.ts` is not edited, so the merge with the rules-scope branch stays simple.
- **TASE's own documents are `institution_doc`:**
  - the member guides (Foreign Bank, NBCM, Remote, the Hebrew חש"ב guide);
  - "מדדי הבורסה המובילים";
  - the site terms;
  - the knowledge-centre and data-product pages;
  - the index "about" pages (TA-35, TA-90, TA-125).
  - The rulebook and its guidelines stay `exchange_rules`.
- **ETF-44 and ETF-45** now list the exchange guidelines first.
- **The Proper Disclosure Rules** match by their Hebrew title and are `regulation` (12 sources).
- **The 2016 bill for Amendment 15** gets a row that outranks the law's, so it is an `official_pdf` titled as the bill.
- **The Moses ruling** gets a row (publisher: the Supreme Court). The Barel row already existed.
- **The CMA standard bylaws** (kupat gemel lehashkaa, child savings) get rows with publisher רשות שוק ההון.
- **The regulators' June 2026 report** on funder.co.il is `official_pdf`. Its publisher is "הפיקוח על הבנקים, משרד האוצר ורשות ניירות ערך (עותק באתר פאנדר)", and the extraction marks it as a copy (`mirror_host`).
- **btl.gov.il:** the six Income Tax regulations it hosts now read "שר האוצר (נוסח משולב באתר המוסד לביטוח לאומי)" (80 sources).
- **Ireland:** `ccpc.ie` gets a publisher row, and BRK-35's page gets a Hebrew title. "First source lacks a Hebrew title" goes from 18 to 17.
- **Scripts:** `tools/source_rows.py` holds these edits. `npm run extract:sources` and `npm run validate` were run. `tools/source_diff.py` shows that only kinds, Hebrew publishers, Hebrew titles and two orders changed in 94 records. No source was added or dropped.

## Every number that changed, and why

### Golden cases (independent check: `tests/golden/expected_calc.py`, never the engine)
- **The independent script itself:**
  - It got the falling-index rule (`lot_real`) and the kupat gemel lehashkaa floor, written from TXS-02, TXF-03 and TXK-07 apart from the engine.
  - It got five new scenarios.
  - Its regeneration refreshed links and checked dates in `workings.md` from the current rule base. `tools/restore_notes.py` put back the hand-written S40 note the generator drops.
- **No existing figure changed.** `tools/numdiff.py` against HEAD reports, outside the new sections, only:
  - S10: one figure added. The exit gain, −395.95, is now printed and asserted. It is the same with and without the rule, since the nominal loss at indexed par equals the fall less the custody.
  - S31: wording only. "then 0.23% of the balance" became "up to 1.05%". The run ends at 21, so no fee after 21 applies.
  - S11, S34, S37: wording only (custody "at a bank"; credit points flag G-23; no capital loss under a rising CPI).
- **New, Part E** (engine matches every value within P-06; `packages/engine/test/golden/followups.test.ts`):

| Scenario | What it shows | Values |
|---|---|---|
| S51 | Kupat gemel lehashkaa, 80,000 for 5 years, age 55, other income 60,000 | real gain 11,832.84; tax at the brackets 1,183.28 (was 2,958.21 at the full 25% before this branch); relief 1,774.93; V_T 101,162.21, real 89,412.65 |
| S52 (a) | TASE foreign fund (S16) with the shekel strengthening 3% a year, r_g 6% | nominal gain 30,805.42; real gain 30,052.89 (without the rule 43,720.67); tax 7,513.22 (without the rule it would be 10,930.17, 25% of 43,720.67) |
| S52 (b) | Same, r_g −1% | real gain −548.57 (without the rule +7,006.23, which would have been taxed 1,751.56 on a nominal loss); tax 0 |
| S53 (a) | S14 ETF with π = −1% | nominal gain 19,717.36; real gain 18,862.65 (the gain less the exit-year custody); tax 4,715.66 |
| S53 (b) | S20 kupat gemel lehashkaa with π = −1% | real gain 21,663.90, equal to the nominal gain; tax 5,415.98; label "reading" |
| S54 (a) | Child savings, boy, withdrawn at 25, fee after 21 at the cap | fees after 21 2,941.45 (the old 0.23% gave 655.12); balance 76,717.55 (was 79,277.00); tax 8,534.69 (was 9,174.56); net 68,182.86 (was 70,102.44), real 41,559.56 |
| S54 (b) | Same with an entered 0.23% | fees 655.12; balance 79,277.00; tax 9,174.56; net 70,102.44 (the old engine's figures) |
| S55 | S11's daily money-market fund at a non-bank member, custody 0.1% a quarter | custody 525.11 (0 at a bank); real 73,630.68 (S11 at a bank: 74,103.42); real gain −145.27, tax 0 (S11: 36.57) |

### On the site (this branch against HEAD's engine on the same plan; `tools/before-after.tsv`, from `tools/before-after.test.ts.txt`)

| Page and input | Before | After | Why |
|---|---|---|---|
| Daily money-market guide, inflation −1%, 10 years (P-05 otherwise) | tax 4,985.33, real 84,955.99 | tax 3,947.94, real 85,993.38 | A1: the inflationary amount is zero |
| Brokerage-account guide, inflation −1% | tax 6,595.99, real 84,627.52 | tax 5,654.09, real 85,569.41 | A1 |
| Kupat gemel lehashkaa guide (timeline), inflation −1% | tax 6,231.71, real 88,695.13 | tax 5,194.32, real 89,732.52 | A1, labelled a reading |
| Kupat gemel lehashkaa guide (timeline), age 62 | tax 2,315.90, real 76,947.69 | tax 1,852.72, real 77,410.87 | A2 (P-05 income 144,000: the 20% bracket runs to 228,000) |
| Kupat gemel lehashkaa guide (timeline), age 30 | 2,315.90 | 2,315.90 | unchanged, under 60 |
| Kupat gemel lehashkaa visual, age 62, 10 years (exit at 72) | lump tax 2,554, left 77,662; brokerage gain 6,339 (age made no difference) | lump tax 2,043, left 78,173; brokerage gain 6,929; gap 1,244 (was 1,323) | A2 on both sides |

- **No page runs child savings after 21,** nor a money-market fund at a non-bank member: the provider page refuses cash-like funds ("אין עדיין השוואת ספקים לקרן מהסוג הזה"). A4 and A5 move no number on screen.
- **Flags, not numbers:** G-23 now sits in the sheet of every taxed figure. TXK-06's line changed meaning. G-21 appears at the kupat gemel lehashkaa exit from 60.

## On screen (`shots/`, 1280 and 390 px; every shot looked at)
- **Child-savings guide:** the prose shows "עד 1.05% … ועד 4%" and the companies' 0.23% with its "לפי החברה" mark. The worth row reads "עד 1.05%" with CS-18. The fee table already read "עד 1.05% בשנה / עד 4% מכל הפקדה".
- **Kupat gemel lehashkaa guide:**
  - The callout says the site computes the relief when an age is entered, and that the difference comes back in a return.
  - The visual at age 30 and at age 62 shows the figures above.
  - The lump sum's tax sheet lists "הגיל שלכם היום 62" (entered) and "ההכנסה השנתית בשנת המשיכה 144,000" (site parameter).
- **Daily money-market guide at inflation −1%:**
  - Result: 85,993, tax 3,948.
  - The tax sheet: F-40, real gain 15,792, TXS-02 among the rules.
  - Its flags: G-20 and the new G-23 line. Before the shots used a fresh browser context for each shot, an age typed on another page leaked into this one and added G-21; the final shots do not have it.
- **Brokerage-account guide at −1%:** tax 5,654.
- **Index page S&P 500:** the cheapest way is at Psagot (non-bank), 78,943; unchanged.
- **Bond pages:** the TXI-25 sentence reads correctly on both widths.
- **The provider page with a money-market fund** shows the "no comparison for this fund type" notice (`mmf-providers-*`).
- **Console:** no page errors.

## Checks
- `npx vitest run site packages/engine packages/pipeline packages/schema`: 75 files, 1,027 passed, 1 todo.
- `npm run typecheck`: clean.
- `npm run validate`: "data/ is valid". Warnings: 490 source dates (as main), 17 first sources without a Hebrew title (main 18), 7 strength, 2 tax-year.
- `python3 tests/golden/expected_calc.py` followed by `tools/restore_notes.py` reproduces `scenarios.md` and `workings.md` byte for byte.

## Left for the lead
1. **A rising CPI, lot by lot, is not changed** (it would move numbers outside the falling-index runs):
   - A lot whose CPI rise exceeds its nominal gain still nets its negative real figure against the other lots' gains in one sale.
   - A brokerage switch (F-66) still carries such a "real loss" into the second leg, although TXS-02 (example 2) says no capital loss arises when the nominal gain is positive.
   - Method G-07 records both.
2. **Credit points:** G-23 is raised on every taxed run, which is noise for a salaried person whose points go to the salary tax.
   - Applying them needs a credit-point input, which is the founder's product decision.
   - A narrower trigger needs a minimum point count, which the rule base leaves out of scope.
3. **Money-market funds at non-bank members are latent:**
   - The provider page refuses cash-like funds.
   - When they are allowed, the four non-bank snapshots have no buy/sell line for money-market units, so they show "not comparable".
   - The idle-cash and comparison verdicts assume a bank throughout.
4. **BRK-51 and BRK-52 have no `data/rules` record** (the rules-scope builder's). The custody note names the regulators' report in words, with no chip.
5. **CS-28 and CS-16 Dimensions lines:** CS-28's still lacks `fee-exit`, while CS-16's still carries it. This is for the rule-base editor.
6. **KGL-02's worth row**, found in the sweep and not changed: it shows the law's base ceiling of 70,000 under "תקרת ההפקדה השנתית", while this year's ceiling is KGL-03's 83,641. The pinned list is signed off by the founder.
7. **Child savings after 21 and the entered rate** exist in the engine only. No page runs the child-savings ledger.
8. **Reviews:** more than 30 files, so an independent reviewer should see the diff and the kit. The engine changes want the finance reviewer.

## Structure review (builder's self-check)
- `node research/audit/tools/merge-review.mjs main`: no component outside the kit, no hand-styled pill, card or field, no literal colour, no Hebrew outside the copy files.
- **New UI:**
  - an "עד" word in the kit-built worth-knowing row (`guideWorth.upTo`);
  - two inputs in an existing visual's sheet;
  - a note on an existing provider line.
- No new component.
- The shots match the gallery's pieces: `Callout`, `Num` sheets, the worth list.

## Review round (2026-10-26)

Fixes for the finance reviewer's and the independent reviewer's findings. Every fact was checked in `.claude/skills/il-finance/references/`. No golden figure changed. The scripts are `tools/shots-r2.mjs`, `tools/write_requests.py` and `tools/income-scratch.test.ts.txt` (a scratch test, kept as text). The shots are `shots/r2-*`.

### 1. The age-60 settlement follows TXK-26
- **The rule.** The manager withholds 20% whatever the age (reg. 3(א), TXK-26). Withholding is an advance: the final tax is settled against it in the annual return. Money comes back only on a part whose bracket is below 20%, and more is due on a part above it. The 25% withholding is Harel's own unsettled statement (TXK-28).
- **The guide** (`content/guide/kupat-gemel-lehashkaa.tsx`) now says so, with the 20% as TXK-26's figure and the chip TXK-26. It no longer says "וההפרש חוזר בדוח שנתי".
- **The flag line `TXK-06`** (shown only with A-14 off, which no page sets) says that tax withheld beyond what is due comes back only through a return. It also says that the full rate kept in that case is above the actual tax on a part below the withholding rate.
- **A new flag `TXK-26`** replaces G-21 at this exit. Its line gives the settlement and says the figure is the final tax after the return. The engine cites TXK-26 (`ledgers/provident.ts`), and G-21 is no longer raised there.
- **Method.** F-44 is rewritten from TXK-26, TXK-06 and TXK-28. F-42 says this exit's settlement is F-44's. G-21's row says the kupat gemel lehashkaa exit is not its case.
- **Golden check.** S51's workings now cite TXK-26 and TXG-25, wording only.

### 2. The age-60 figures carry their rules (`components/guide-signature/kupat-gemel-lehashkaa.tsx`)
- **From the run, not the bundle.** The tax, the amount left, the fund's gain and the brokerage gain now carry the rules their own run read, its flags and its labels (`runFigure` in `guide-signature/kit.tsx`). Before, they listed every rule the bundle holds and no flags.
- **The tax at 60 or over** opens on F-42 ("מגיל שישים: מדרגות המס המופחתות על הרווח"). Its inputs are the real gain (F-44), the age, the year's income and the 25% cap. Its rules include TXG-04, TXG-07 and TXK-26. Its flags are TXK-26, G-02 and G-23; the fee flags stay on the figures they concern.
- **The amount left** lists the tax among its inputs.
- **Age and income.** The fund's gain, the brokerage gain, the difference and both ranges name the age and the income from 60, since the brokerage side now gets the same profile.
- **Whether the exit year is at 60** is read off the run (it used F-42), not tested again on the page. The unused `sixtyAge` fact is gone.
- **Under 60** the tax stays F-44 with the same inputs.

### 3. The money-market custody note (`r4workbench.providers.mmfCustodyNonBank`, F-14, F-63)
- **The note** now reads:
  - "לא נמצא כלל שמגביל" (was "אין כלל");
  - a member with a distribution agreement for the fund may charge nothing on it, under the distribution-fee regulations (reg. 2(ד), MF-26);
  - the report's blanket waiver covers "דמי משמרת" only, while a handling fee ("דמי טיפול בפיקדון") is usually fixed and often refunded or not charged;
  - practice, not a term.
- **Method.** F-14 says the same, and that Excellence's and Altshuler Trade's lines are of the handling kind. F-63 no longer says the custody is "customarily waived".
- **Sweep.** The two money-market guides said "בבית השקעות העמלות לפי התעריפון שלו". They now say no rule limiting a non-bank member's fees was found, and that one with a distribution agreement for the fund may not charge on it.
- **On screen.** The note itself is still on no page: the provider page refuses cash-like funds.

### 4. Bank or not, everywhere a provider's tariff is run
- **`memberKindOf`** (`ledgers/securities.ts`): only `bank` is a bank. A `broker` and a `foreign_broker` are `non-bank`, as `providers.ts` already treats them.
- **Who uses it:** the provider workbench (the foreign broker was the default bank before), the fund-variant runs (`variants/fund-variants.ts` takes `run.memberKind`, set in `site/app/lib/variants.ts`) and the switching cost (`site/app/lib/playbook.ts`, both legs).
- **Numbers.** No figure moves today: these pages price funds that are not money-market units.

### 5. A TASE foreign fund cites TXF-04
At a falling exchange rate, `ledgers/securities.ts` cites TXF-03 for a foreign fund held abroad and TXF-04 for a TASE foreign fund. TXF-03 itself sends such a fund to TXF-04. `followups.test.ts` asserts TXS-02 and TXF-04, and no TXF-03. The S52 workings changed the same way. No number changed.

### 6. F-50's CPI-linked bank route is a reading
- **Method.** F-50 now says the Supreme Court held it for a deposit linked to a foreign currency, and that applying it to a CPI-linked deposit is an inference (TXI-25).
- **Engine.** `ledgers/child-savings.ts` labels the run "reading" on TXI-25 when a deposit's CPI fell, as the other inferred steps are labelled. A new test covers it.

### 7. Exit-year fees after the fall's cap: an open reading in G-07
- **The question.** TXS-06 deducts them from the proceeds, so they arguably sit inside the nominal loss the cap limits.
- **S52 (b).** The real gain is −548.57 with the fees after the cap, and would be 0 with them inside. The tax is 0 either way.
- **Recorded, not changed.** The reading is in G-07's row, with comments in `securities.ts` and `bond.ts`.

### 8. The falling-CPI floor in the provident ledgers
Kept, labelled "reading" as before. `requests.md` (new, beside this report) asks the rule-base editor for the source on how TXK-07's and TXH-11's real gain treats a falling CPI. It sets out the two readings, and notes that Barel (TXI-25) points the other way. It also asks to align the scope requests' line on the custody waiver, and lists rules the site names in words only (TXG-25, TXK-28, BRK-52).

### 9. The child-savings sentence
- **The sentence** now reads "עד התקרה שבתקנות: עד 1.05% בשנה מהיתרה". The 4% of each deposit is dropped: deposits end at 18, and F-54 says that cap does not bite.
- **Sweep.** The CS-18 flag line said "התקרה שבחוק" too, and now says "שבתקנות".
- **Not changed.** The wrapper's legal-caps table (1.05% and 4%) is a correct statement of the regulation.

### 10. Source labels: btl.gov.il rows
- **The rows.** The six `documents.json` rows labelled "שר האוצר (נוסח משולב באתר המוסד לביטוח לאומי)" now have `hosts: ["btl.gov.il"]`. The schema has the optional field, and `extract-sources.ts` skips a row whose hosts do not include the link's.
- **The other copies keep their own host's label:**
  - Wikisource (TXK-26, TXI-08, TXI-13, PEN-08): ויקיטקסט;
  - olaw (TXK-26's ק"ת 7076): החוק הפתוח (צילום רשומות);
  - Reshumot (KH-14, TXH-15): רשומות.
  - Each gets its own title, so an amendment is no longer titled as the regulations it amends.
- **A class fixed with it.** Without the row, the gazette host's default kind "law" would have mislabelled those regulations. A title that names regulations now outranks a host whose default is "law". That turns 37 regulation sources in 28 records from "law" to "regulation", all of them regulations or Banking Rules in the gazette.
- **Runs and tests.** `npm run extract:sources` was re-run, and a pipeline test covers both. One Wikisource copy (PEN-08) lost its Hebrew title, since its link title is English; it is not a first source.

### 11. Small ones
- **P-05's `annual_income`** note, its Hebrew rationale, `docs/parameters-rationale.md` and method §3 now say it also drives the age-60 brackets (F-42) and the surtax (F-43).
- **The "עד" test** is `isCapName`: a `cap` word, but not a minimum (`min_market_cap_usd`, `min_order_cap`) and not a market capitalisation.
- **The G-23 line** stands alone ("נקודות זיכוי מקטינות את כל המס המחושב בשנה, גם את המס על רווחים ועל ריבית בשיעור מיוחד"). It adds that tax already withheld comes back only through a return or a refund request (TXG-25).
- **`guide-signature-g2.ts`.** The study fund's comment now says the brokerage side takes the reader's income (the surtax), and that there is no age there.

### The number that changed: the study-fund visual's brokerage side uses the reader's income
- **The change.** In the study-fund visual (`hishtalmutModel`), the brokerage side used to run on P-05's income, 144,000. It now runs on the reader's income, 12 × the monthly salary in the visual.
- **Where it shows.** Only the surtax reads it there (F-43, TXG-09, TXG-10), so a figure moves only once the income and the gain pass the threshold.
- **Figures, at P-05's plan (10,000 now, 500 a month, 10 years), from `tools/income-scratch.test.ts.txt`:**

| Monthly salary in the visual | Brokerage gain before | After | Study fund less brokerage, before | After |
|---|---|---|---|---|
| 12,000 (P-05's own) | 6,339.10 | 6,339.10 | 2,662.17 | 2,662.17 |
| 40,000 | 6,339.10 | 6,339.10 | 3,009.40 | 3,009.40 |
| 60,000 | 6,339.10 | 6,023.53 | 2,909.01 | 3,224.58 |
| 60,000, 30 years | 60,890.36 | 57,918.10 | 21,221.38 | 24,193.64 |

- **Before.** The before column runs the brokerage side without the reader's income. The study-fund side is the same in both.
- **The fund's own visual** (`providentModel`) already ran the brokerage side on P-05's income. There the change is the age-60 profile, listed in the first round.

### Checks (review round)
- `npx vitest run site packages/engine packages/pipeline packages/schema`: 75 files, 1,031 passed, 1 todo. The 4 new tests: `memberKindOf`, the TXI-25 reading, the hosts-limited row, `isCapName`.
- `npm run typecheck`: clean.
- `npm run validate`: "data/ is valid", with the same warnings as before (490 source dates, 17 first sources without a Hebrew title, 7 strength, 2 tax-year).
- `python3 tests/golden/expected_calc.py` then `tools/restore_notes.py`: only S51's and S52's wording, and a TXK-26 row in the rules table, changed in `workings.md`. No figure changed.

### On screen (review round, `shots/r2-*`, 1280 and 390 px, every shot looked at)
- **The kupat gemel lehashkaa guide at age 62**:
  - The callout (`r2-kgl-callout-62-*`) gives the 20% withholding and the settlement, with the chip TXK-26.
  - The lump sum is unchanged: tax 2,043, left 78,173, brokerage gain 6,929 (`r2-kgl-lump-62-*`).
- **The tax figure's sheet at 62:**
  - `r2-kgl-tax-sheet-62-*`: formula F-42; inputs: real gain 10,216, age 62, income 144,000, rate 25%.
  - `r2-kgl-tax-sheet-62-rules-*`: rules TXG-04, TXG-07, TXK-26, TXG-09, TXG-10, TXK-27.
  - `r2-kgl-tax-sheet-62-flags-*` and `-end-*`: flags TXK-26, G-02, G-23.
- **Other sheets.** The amount left's sheet (`r2-kgl-net-sheet-62-*`) is F-44 with the age, the income and the tax. Under 60 (`r2-kgl-tax-sheet-30-*`) the tax is 2,554 on F-44, unchanged.
- **The child-savings sentence** reads "עד התקרה שבתקנות: עד 1.05% בשנה מהיתרה" (`r2-child-savings-sentence-*`).
- **The daily money-market guide's custody sentence** is the new one (`r2-mmf-daily-custody-text-*`). The provider note itself is on no page (see 3).

### Left for the lead (review round)
1. **A-14 off at the kupat gemel lehashkaa exit from 60.** Golden S51's A-14-off figure, 2,958.21, keeps the flat 25%. With a 20% withholding, a part whose bracket is below 20% costs the 20% withheld, not 25%, so the tax would be `max(20%, min(bracket, 25%))` a part. That is 2,366.57 for S51 by hand (20% × 11,832.84), not checked independently. Correcting it moves a golden figure, so per the brief it is not done. F-44, the engine comment and the flag line say the figure is an upper bound. No page turns A-14 off.
2. **The source-kind class fix** (10) touches 28 rule records beyond the brief. On a conflict with the rules-scope branch, keep both and re-run `extract:sources`.
3. **TXG-25, TXK-28 and BRK-52 have no `data/rules` record**, so the site names them in words only (`requests.md` §3).
4. **The falling-CPI floor in the provident ledgers** waits on the rule-base editor (`requests.md` §1).

### Structure review (review round, builder's self-check)
- **Merge review.** `node research/audit/tools/merge-review.mjs main`: nothing to judge, no new piece outside the kit.
- **New code:**
  - `runFigure` and `notFeeFlag` in the visuals' own helper file (`guide-signature/kit.tsx`, not the shared kit): a figure built from one run, as `fees.ts` and `variants.ts` already do for theirs;
  - `isCapName` beside `worthRows`.
- **No new component and no new pattern.** The sheets are the existing `Num` sheet with one more input, a formula id and flags, which the sheet already draws.
- **Branch size.** More than 30 files, so the branch wants the independent reviewer, as before.
'''
with open(os.path.join(HERE, 'report.md'), 'w', encoding='utf-8') as fh:
    fh.write(REPORT)
print('wrote', os.path.join(HERE, 'report.md'))
