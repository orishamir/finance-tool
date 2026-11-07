# Independent re-check 2 of data-kgl-prices (at 91e9389a)

What I looked at:
- `git diff main...HEAD` and the commits since the first re-check (5941f64b..91e9389a);
- the fee records against the library's texts;
- the tests and the data check;
- an own ledger;
- the finance-reviewer on the engine, method and pricing code;
- the page, built at 15:46 from 91e9389a and served on port 4393.

I did none of the work, and I did not read the builder's report.

**Verdict: fail.** The data, the sources, the ranking split and the guide page itself hold, and every finding of the first re-check is fixed on the page. The branch fails on three points:
- The new deposit-fee discount reaches the engine's run but not the pieces that read or replace fee lines. The fee page linked from the guide shows the wrong lines because of it.
- The tap-area fix took the 44 px target from every figure that stands alone on a phone, about 1,200 of them on ten pages, and a guard now locks that in.
- One page still invents a day for Harel's month.

## What was run

| Check | Result |
|---|---|
| Site tests (`provident-lists`, `compare-broker`, `compare-represent`, `providers`, `kit/guards`, `guide-signature`) | 104 passed |
| Engine (`account-interest`, `golden`) | 238 passed |
| Pipeline (`price-premises`) | 28 passed |
| `npm run validate` | "data/ is valid" |
| `merge-review.mjs main` | No new pieces outside the kit. 55 code or doc files changed, more than 30, so the several-lens rule applies. |
| `box-check.txt`: the provident guide and the study-fund guide at phone and desk with `--sheet`, then the provident workbench and the home page | 0 boxes changed; no page is wider than the screen. The guide's 2 sliders are now moved at 390. |
| Screenshots at 1440 and 390 | Whole page: `kgl-*`, `kh-*`, `wb-*`, `home-*`. Cost block: `cost-*`. Workbench cards: `wb-harel/mor/yalin-*`. Terms fold open: `kgl-terms-open-1440.png`. Phone sheet: `kgl-sheet*-390.png`. Fee page reached from the guide's link: `fees-from-guide-1440.png`. |
| `tap-height.txt` | Every figure at 390 that opens a sheet, with its tap height (script `tap-height.mjs`) |
| One fresh reader | 45, a single deposit of 60,000 ₪ for 10 years, whole-page PC screens plus the terms fold. Brief, shots and answer in `readers/`. |

## 1. Money and sources: holds

Each record added on the branch was checked against the document text in the library, on the cited page:

| Manager | What it says | Where I read it |
|---|---|---|
| Harel | 0.7% / 0% | form 8207 v11/2025, p.2 section ה (b5f5b389) |
| Harel (back to) | 1.05% / 4% | bylaws 07/2024 s.35.1 p.10; s.36.1 gives "לפחות שנתיים", which PF-13 lifts to five years (333f434f) |
| Mor | 0.8% / 0% with "*בכפוף לקבוע במכתב תנאי הנחה" | form p.2 (f81fc0b4) |
| Mor (back to) | 1.05% / 4% | bylaws 18.2.2026 s.35.1 p.10 (532423b3) |
| Migdal | 1.05% "דמי הניהול הרגילים" | form 2501 p.3 (f231ed67) |
| Migdal | 4% | bylaws 11.2024 s.35.1.2 p.10 (46cfd48c) |
| Meitav | cap | bylaws p.9 (198f8607) |
| Clal | cap | bylaws p.10 (5c541c52) |
| Altshuler Shaham | cap | bylaws p.10 (bfc11b85) |
| Altshuler Shaham | cap | joining kit p.3 (1eef4c2f) |
| Menora | cap | bylaws p.10 (2bafe20f) |
| Infinity | cap | bylaws p.10 (a38f5bc1) |
| Analyst | "עד 1.05% … ועד 4%" | form p.1 (a8179315) |
| Phoenix | 1.05% / 4% | form p.2 (a78f87e3) |
| Yalin Lapidot | 0.9% / 0%, bylaws 16.10.2025 | Not in the store. The site refuses scripts, so it was read in Chrome; logged in `tried.jsonl` with page and section. |
| Ayalon | at the cap | Not in the store, same reason; logged the same way. |

No figure on this product rests on advertising.

**Ranking commit.** 8bd7647c is now its own commit, with the evidence in its message. The tests that pin its numbers pass on the head:
- the 20-year broker case: 985,597 against 1,034,620;
- the tracker about 5% above, in compare-represent;
- Doron's case: 85,697.

**Own ledger** for the guide's example (10,000 ₪, 500 ₪ a month rising with prices, 7%, 2%, Harel 0.7%/0% for 60 months and then 1.05%/4%, 25% on the real gain):

| | Own ledger | Page |
|---|---|---|
| Left in today's money | 82,514 ₪ | 82,303 ₪ |
| Nominal | 100,584 ₪ | 100,327 ₪ |

They agree within timing.

### Finance-reviewer (engine, method, compare.server, schema)

**Holds:**
- The month boundary: both fees revert after month 60, and the deposit side is pinned at months 60 and 61.
- The period: the longer of the printed period and 60 months.
- The caps (PF-02) and the five years (PF-13) come from the rule records.
- `providentPick`'s breakpoints cover every month.
- Mor is priced at `reverts_to` from the start.
- The pension run refuses a deposit discount.
- A-19, F-16 and F-105 match the code, and PF OQ18 exists in the rule base.

**Its must-fix,** checked on the page: must-fix 1 below.

## Must fix

### 1. The deposit discount and the balance discount are missing outside the run itself

The fee page, which the guide links to as "כמה העמלות האלה עולות לאורך זמן", is wrong for the provident fund for investing.

**What it shows** (`fees-from-guide-1440.png`):
- one line only, "דמי ניהול מחיסכון: 0.7% כל שנה, מהחיסכון, 3,902 ₪". From year 6 that fee is 1.05%.
- "השפעה משולבת של העמלות זו על זו: 1,321 ₪". That is about the 4% deposit fee of years 6 to 10, which in this plan comes to about 1,320 ₪, shown under a false name.
- "מה היה משנה את המסקנה … 0.35% עד 1.4%", which scales only the discounted 0.7%.

**Causes:**
- `packages/engine/src/fees/materiality.ts:27`: `feeLines` adds the deposit line only when `fees.deposit > 0`. Harel's deposit fee is 0% with a `depositDiscount` to 4%, so the line never appears. Line 28 has the same gap for a 0% balance fee.
- `packages/engine/src/fees/materiality.ts:92-93`: `changeLine` drops `fees.discount` when the balance line changes, but keeps `fees.depositDiscount` when the deposit line changes. So "without this fee" still charges 4% after month 60.
- `site/app/lib/compare.ts:533-534` (`scaleTerms`, F-81) scales the discounted rates and leaves both `listRate`s.

**The same class, to sweep with it** (ground rule 7):
- `site/app/lib/compare.ts:355` (`withOwnFee`): a fee the person enters (D4) runs for 60 months and then silently turns into 1.05%, while the deposit keeps Harel's 0% that becomes 4%.
- `site/app/lib/guide-signature-g2.ts:99` (`withBalanceFee`, used at :252 and :273): the managers' range runs the cheapest and the dearest track fee under Harel's 60-month discount. That visual is held today.

**Fix:** one rule in the engine, "a fee line replaced, zeroed or scaled drops or scales its own discount, and a line with a discount to a positive rate counts as charged". Apply it in all five places, with a test that reaches month 61 on both fees (the reviewer notes that S22 stops at month 60).

### 2. The tap-area fix took 44 px from every figure that stands alone (01f5e9f7)

**The change:** `site/app/app.css:162-165` gives every `.num` a tap area that grows only sideways. Only `.num-cell` and `.num-figure` keep `-11px` (`:166-169`). The comment and the commit say a lone figure keeps 44 px, but most lone figures are neither size.

**Measured at 390** (`tap-height.txt`): 1,201 figures that open a sheet are under 44 px tall and have no other line within 11 px. Before the change each one had its height plus 22 px. Examples:
- the guide's result list (`<dd>` 82,303 ₪, 4,501 ₪): 27 px;
- the guide's input-row figures (10,000 ₪, 7%): 22 px;
- the workbench cards' "1.05%" and "4%": 29 px;
- 1,001 figures in the tracks list: 27 px;
- the study-fund strip (18,000, +54,000): 16 px.

**The guard:** guard 17 (`site/app/components/kit/guards.test.ts:245-259`) now requires this, so it locks in a break of ground rule 8 (44 px touch targets).

**Fix:**
- Keep `inset: -11px -4px` as the default.
- Make the sideways-only area apply only to a figure inside running text: a class the paragraph or prose pieces set, or `p .num`, `li .num`.
- Rewrite guard 17 to check both.
- Run `tap-height.mjs` and the earlier `fix2/tap-sweep.mjs` again: no figure taken by another, and no lone figure under 44 px.

### 3. Harel's month still shows as an invented day on /documents

`site/app/routes/documents.tsx:169` runs `fmt.date(t.date)` on "2025-11" and prints "תעריפון הראל פנסיה וגמל בע"מ 01.11.2025". That is the day d41c8d63 says it removed. It fixed the workbench and the companies list but missed this page.

**Fix:** format a month as a month there. A sweep for every `fmt.date` that can receive `tariff.published` would catch the rest. Tighten the month regex at `packages/schema/src/collections/fees.ts:223` to reject months 00 and 13.

## Should fix

### 4. What the fresh reader tripped on (branch copy, `readers/lump-pc-r5.md`)

- `site/app/copy.ts:943-944`: "הדוגמה מניחה שההנחה נמשכת את כל תקופת ההנחה" says nothing. Better: "הדוגמה מניחה שההנחה לא מסתיימת מוקדם".
- `copy.ts:934`: "לכן אצלה נשאר הכי הרבה בתוכנית לדוגמה" was read as "the most stays with the company". Better: "…נשאר לחוסכים הכי הרבה".
- `copy.ts:955-956`: "…אחרי ההנחה, עד" with a comma makes 1.05% look fixed.
- "פרטים . בתום ההנחה" (`site/app/routes/guide.tsx:263-264`, `copy.ts:299`): a full stop after the open-question chip, with a gap before it. Round 3 flagged a stray full stop too, and "( פרטים )." appears elsewhere on the page. This is the spacing of the kit's `IdRef`, so fix it in the kit and sweep.

### 5. To the founder, with D83 named beside it

The reader saw that "the cheapest company in the example ends up at the maximum", so cheapest means cheapest only for 5 years. With a single deposit, the reader also suspected the discount "might become 1.05% after six months". The page names that as an open question (PF OQ18), which is honest; the figure still assumes the five years.

### 6. Method text (finance-reviewer, checked)

- `docs/method.md:400` (F-80) still calls Meitav's 0.8% a list fee. KGL-15 now calls it advertising (ground rule 10).
- `docs/method.md:193` (F-16) says PF-14 case 1 is left out because "no provider record says so". It is the circular's general rule, and it is left out by the assumption in A-19 and D83.

### 7. No guard that a line printed below the cap carries `reverts_to`

`packages/pipeline/src/validate.ts:482`. A future provident line below the cap with no `reverts_to` would run flat for the whole run and could win `providentPick` (A-19, D83).

### 8. Workbench discount card (`wb-harel-1440.png`)

- "הנחה מהתקרה שבתקנון. בתום ההנחה מותר לחברה להעלות…" repeats on both rows.
- The card never says when the discount ends: 5 years, or the printed period.

## Minor

- The rule base's KGL-30 names seven companies and Harel's 02/2021 bylaws, but the new Mor, Yalin and Harel 07/2024 records cite it for their bylaws' "two years". Under D30 an institution's rule names its companies; this goes to the domain-specialist.
- The kupat-gemel-lehashkaa wrapper's `fee_caps` cites Wikisource (`data/instruments/wrappers/kupat-gemel-lehashkaa.json:43,65`), and the managers-at-cap sheet now shows that value. This was there before the branch.
- `meitav@2026-11-07.json` carries Meitav's comprehensive-pension lines (0.22% and 1%) from the product page, which is advertising under D56. D83 reads as general, but only this product applies it. This was there before the branch; it needs a separate sweep or a scope line in D83.
- The guide is now 6,331 px tall at 1440, against 6,116 on main before the branch and 7,078 at the first re-check. The terms fold is closed.

## The first re-check's findings, on the page

| Finding | Fixed? |
|---|---|
| Hebrew editor's edits, "שבתקנות", plus a guard | Yes (e0190d5d, guard 16) |
| Ranking change in its own commit | Yes (8bd7647c, then 2631c666) |
| "0.7%" opened the "5 שנים" sheet | Yes: the clicks on "9", "12", "0.7%", "0%" and "5 שנים" each open their own sheet. The fix broke ground rule 8 instead (must-fix 2). |
| The range paragraph twice | Yes: said once under the table, and the count is said once (`cost-1440.png`, `cost-390.png`) |
| Open lump-sum rule not marked | Named on the page as an open question with its chip (PF OQ18) |
| D83 recorded | Yes (product.md:103) |
| Workbench offer hides the binding price | Yes: "עד 1.05%" with "0.8% בהצעה מותנית", and the quote is said once (`wb-mor-390.png`) |
| PC aside 800 px past the chart | Yes: the terms fold starts closed |
| Wording that becomes false later | Yes (lowKind, discountOwn, fmt.years) |
| account-interest comment, Harel's "01.11.2025" | The comment is fixed. The day is fixed on the workbench but not on /documents (must-fix 3). |

## Rules of the project

- No process words in the guide's text.
- Every figure goes through Num.
- The Hebrew is plural or impersonal: no singular address in the added copy.
- No D60 change: the workbench cards were cards before the branch.
- The movement script shows nothing moving.
