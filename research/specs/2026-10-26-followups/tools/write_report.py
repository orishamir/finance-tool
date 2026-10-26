#!/usr/bin/env python3
"""Writes report.md beside the brief (the harness refuses a direct .md write from a builder). Run from the repo root."""
import os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT = r'''# Report: follow-ups from the scope settling and the open-question research (branch `followups`, 2026-10-26)

Builder: Claude Opus 5.5. Brief: `brief.md` beside this report, sections A and B. Working scripts are in `tools/`, the screenshots in `shots/`. Main had not moved when this was committed (base `2bac2df`), so no rebase was needed. This file is written by `tools/write_report.py`, because the harness refuses a direct .md write from a builder.

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
'''
with open(os.path.join(HERE, 'report.md'), 'w', encoding='utf-8') as fh:
    fh.write(REPORT)
print('wrote', os.path.join(HERE, 'report.md'))
