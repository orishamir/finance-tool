# Several-lens review: branch `indices-pricing` (head 780616af) against main

Reviewed on 2026-11-06 from `git diff main...HEAD` (538 files, 119 of them code or docs), the code, the data and the built page. The build in
`site/build/client` was newer than every source file, so it was reused and served on 127.0.0.1:4523 (no new build). `npm run typecheck`,
`npm test` (110 files, 1,699 tests) and `npm run validate` all pass. The earlier reports were read only to tell new findings from repeats; a
repeat is marked "(repeat of ...)". Nothing was fixed.

## Verdict: not ready to land

The engine's arithmetic holds. The golden script `tests/golden/expected_d64_d67.py` reproduces the method's worked examples: 21,518.13 and
21,583.46 ₪ for F-102, eight charges of 185 ₪ and 96,161.55 ₪ for F-103. I found no wrong figure. Two findings block landing. Both are
about what the branch now puts in front of readers:

- a rule cited from a copy, listed as "used" on every bank's figures;
- a group price set below what the bank's documents allow.

## mustFix

### M1. BANK-35 is listed as a rule "that entered the calculation" on every bank row, and its only source is a copy

- **Where.**
  - `packages/engine/src/ledgers/securities.ts:342`. `book.amount("BANK-35", …)` runs for every tariff with a `currentAccount`. The resolver
    then records BANK-35 as used (`packages/engine/src/resolver.ts`, `current()` pushes the figure into `used`), whether the run flags it or not.
  - `data/rules/bank-35.json`. Every figure's source is `olaw.org.il`, publisher "Open Law (copy of Reshumot)".
- **What happens.** On `/indices/sp500` at 1440, the "מה החשבון גובה" sheet and the value-left sheet of **Yahav** both open their rules list
  with "התקרות החדשות לעמלות העו״ש … · BANK-35", source "החוק הפתוח (צילום רשומות)". Yahav's minimum (4.00 ₪) is under the cap (5 ₪), so
  nothing is flagged and nothing is applied there. Leumi's sheets show the same. One Zero's run (minimum 0) also records it.
  - So the rule shows as used where it changed no number.
  - The source shown is a copy. CLAUDE.md ("General sources first", founder 2026-11-06) says a rule is cited from its official publication,
    never a copy.
  - The record predates the branch, but this branch is what shows it on every bank row.
- **Fix.**
  - Re-source BANK-35 from Reshumot (the official publication).
  - Read the cap's figure only where the flag needs it, or cite it only when it flags, so the sheets list it only where it matters.
- **Repeat.** Partly a repeat of independent check 2, item 6, and of finance review 2's note. Neither saw that the rule is listed on every bank
  row, flagged or not.

### M2. Mercantile's students and released soldiers pay no current account on an inference, below the document's maximum (D56)

- **Where.** `data/fees/mercantile@2026-11-04.json:1548` and `:1647`, `groups.entries[].current_account` with `inferred`.
- **What the documents say.**
  - The annex makes the teller action and the direct action "פטור" for these groups. It prints no row for the monthly minimum.
  - The ordinary minimum is "עמלת מינימום בסכום שאינו עולה על מחיר של פעולה אחת ע"י הפקיד". Whether "the price of one teller action" means the
    price list's 6.40 ₪ or the group's own free action is not printed.
- **What the record does.** It takes the lower reading, 0 ₪.
- **Why that is wrong.** D56 prices a house at "the most its binding documents let it charge". The seniors' column ("בכפוף למינימום") is a hint,
  not a printed exemption.
- **Both groups can be picked.** Each has a custody price that names fund units with a number. A person who picks Mercantile's students in
  "account built on a house" pays 0 ₪ for 48 months instead of 6.40 ₪ a month.
- **The validator passes it.** `packages/pipeline/src/validate.ts`, the `gca` block, requires "פטור" in the quote and in `price_he`. The quote
  is the teller action's "פטור", not the minimum's.
- **Fix.** Either:
  - remove the two `current_account` entries, so the groups pay `a_p` as F-102 says of an annex not read; or
  - take the founder's explicit yes to this reading and record it beside D56.
- **Repeat.** Independent check 2, item 7, which left it as should-fix. I raise it, because it is a price below the documents' maximum.

## shouldFix

### S1. A bank row re-sorts under the person's picked account when they mark their own bank

- **Steps.**
  1. Open `/indices/sp500`.
  2. Pick Leumi's row (third).
  3. Choose "לאומי" in "הבנק שבו כבר יש לכם חשבון עו״ש".
- **What happens.** The picked row slides from y 380 to y 247 at 1440 (133 px) and from 343 to 203 at 390. Leumi rises to second place.
  Screenshots: `resort-leumi-leumi-1440.png` (scratch, not committed).
- **Why it is wrong.** CLAUDE.md: when the person picks an option, every row on the screen keeps its place, and a re-sorting list keeps the
  tapped row where it was.
- **Where.** `site/app/components/kit/pick-list.tsx:91-93` now lets the picked row slide on purpose: "a stale one made the row picked seconds
  before jump".
- **The builder's report is wrong here.** `builder-report.md:145` says "the chosen row is held". It is not.
- **Repeat.** Independent check 2, item 3, still open. It needs the founder's call (hold the picked row, or accept the slide as a slider's
  re-sort) and the report corrected.

### S2. Figures are cut at 390 on a typed plan past the sliders' ends

- **What happens.** `box-check.mjs /indices/sp500,/indices/ta125 phone,pc --plans` reports `CUT figure "2,296,540,223 ₪" (7..116 in
  16..359)` and the same in the "… ₪ יותר" cells. On the TA-125 it is 2,205,553,903 ₪.
- **Why.** `LONGEST_LEFT = 999_999_999` (`site/app/components/invest/pair.tsx:609`) holds nine digits, but the boxes accept larger plans.
- **Fix.** Either cap the typed values, or size the longest case for what the boxes accept.
- **Repeat.** Independent check 2, item 8.

### S3. The "one flaw, a sweep" on the broken fund names stopped short

- **What is fixed.** `checkFundNames` (`packages/pipeline/src/validate.ts:210`) checks `names` only, and the commit fixed the names and some
  source titles.
- **What is still broken.**
  - `data/rules/etf-65.json:74`, `etf-66.json:65` and `etf-68.json:58` still read `"MTF מחקה (Nasdaq 100 (4D"`. The `/rules` page shows them.
  - The rule base itself (`.claude/skills/il-finance/references/etfs-and-index-funds.md:634, :661, :738`) still has `(4D)י` and `(MSCI World
    (4D`.
- **Fix.** Extend the check to every `source.title` in `data/`, and to the references' source lines. Fix the remaining six.

### S4. The site's own-account tariffs drop the current account's list source; the test checks a shape the site never builds

- **Where.**
  - `packages/engine/src/providers/workbench.ts:562-570`. The list source is pushed only when `entered.currentAccount` is undefined.
  - `site/app/lib/own-account.ts:353` (`enteredOf`) copies `currentAccount` from the list into every stretch, so in the site's shape it is
    never undefined.
- **Probe (engine, Leumi).**

  | Entered tariff | Current-account sources |
  |---|---|
  | `{currentAccount: 0, currentAccountSource, until: {months: 48, then: {currentAccount: 5.5}}}` (the site's shape) | `[entered annex]` only |
  | `{currentAccount: 5.5}` (an own account built on a bank with no group) | none |

- **The test.** `packages/engine/test/pricing-d64-d67.test.ts:257` passes only because it uses `then: {}`.
- **Impact.** No reader sees it today, because nothing in `site/` reads `lineSources`. But finance review 2, item 5 was closed on this test.
- **Fix.** Push the list source whenever the stretch's value equals the list's minimum. Build the test's entered tariff through
  `layeredTariff`.

### S5. The current account's 5.50 ₪ (and every bank's minimum) is shown nowhere and traced nowhere on the site

- **What the sheets show.** The cost sheet lists only the plan's five inputs and the rules. The house's "התעריפון ↗" link opens the securities
  price list, not the current-account price list the minimum comes from (Discount's `abridged_taarif_current_account`, Leumi's `xlsx`, and so on).
- **What the page shows.** No company page shows `current_account` either (`grep current_account site/app` finds only `invest.ts` and
  `own-account.ts`).
- **The gap.** Each bank row's cost now holds a sourced figure a reader cannot see or open. The "every number traces to a source" rule asks
  the page to show where a figure comes from.
- **Fix.** Show the minimum, with its source, where the cost split names "עו״ש", or in the cost sheet's values.

### S6. D65 and D66 in `docs/product.md` no longer describe what is built

- **D65 and D66 (`docs/product.md:85-86`) point to a block that no longer exists.** They say the indices page says it "in its block on what the
  houses advertise against their price lists". D57 removed that block on 2026-11-05.
- **D65 says nothing of the limited spreads now priced.** The text says "Rows are priced on the printed conversion fee". The page now adds a
  limited spread at its ceiling (commit d346f339, under D56).
- **A conflict for the founder.** D66's reason ("pricing the two printed ceilings would punish the only houses that limit the cost") argues
  against what D65's build now does to Altshuler Trade, Meitav Trade and IBI. Meitav's S&P 500 figure abroad falls 75,733 → 73,848 ₪, while
  banks that print no limit pay none.
- **Fix.** Correct the wording, and put the conflict to the founder as a `you decide` question.
- **Partly a repeat.** `builder-report.md:221`.

### S7. The spread's ranking evidence covers the indices page only

- **What the evidence covers.** `spread-rankings.json` and commit d346f339 cover the indices page.
- **What else changes.** `buildTariff` prices the spread for every caller. That includes `site/app/lib/fees.ts:277` (the fee page's FX rate
  now adds `fxSpread`), `compare.server.ts`, `compare-index.ts` and `instruments.server.ts`.
- **Why it matters.** CLAUDE.md asks that a ranking change carry its evidence, so the evidence should show those pages too, or state that they
  do not move.

### S8. Bound-only tests where a golden figure is easy

- **The tests.**
  - `site/app/lib/invest.test.ts:308-309`: a value difference "between 900 and 3,000".
  - `site/app/lib/own-account.test.ts:589`: "> 900".
  - `packages/engine/test/pricing-d64-d67.test.ts:63-64`: "between 400 and 924".
  - The same file, line 170: "> 3,000".
- **Why it matters.** Each is the current account's or the per-dividend charge's effect on one plan. A Python golden, like
  `expected_d64_d67.py`, would pin it; a bound lets a wrong growth or tax treatment pass.

## Notes

- **The spread on a buy is slightly over-priced.** `securities.ts` buy order, F-13: a ceiling printed as a share of the rate ("עד 0.7% משער
  המרה") costs `s/(1+s)` of the shekels on a buy (0.695% for 0.7%), not `s`. The overstatement is small and in the safe direction, but the
  method states `s × amount` as exact. This is a repeat of finance review 2's note.
- **The collection dates are stale.** The page says "התעריפונים נאספו בין 04.11.2026 ל־05.11.2026" (`copy.ts:3732`, `collectedSpan`), but
  every bank's `current_account` was checked on 2026-11-06.
- **The word for the minimum.** The cost split and the legend call the minimum "דמי ניהול חשבון עו״ש". The price lists call it "עמלת מינימום",
  and BANK-35 caps "ניהול חשבון תשלום". The Hebrew editor should judge whether the reader is told what is counted.
- **One Zero's minimum has no quote.** Its 0 ₪ minimum (`one-zero@2026-11-04.json`, `current_account`) has no quote, by the validator's
  exemption for 0. It was read only in the founder's browser on 11-04.
- **The abroad note's spread list can claim too much.** `AbroadNotes` (`pair.tsx`) names every house with any numeric `spread` on any FX line.
  It does not check whether that line applies to the fund's class, or whether the engine refused it beside a bounded fee (`workbench.ts:500`,
  `RecordInputError`). The note could then say a spread is counted where the row is a record error. No record has that today.
- **A rule the page states is missing from the rule base.** D64's premise, that a bank's securities account needs a current account there, is
  stated on the page ("למי שפתח שם חשבון עו״ש כדי להשקיע"). The rule base holds it only for Leumi (BRK-28). F-102 says so; it should go to the
  domain-specialist as an open question.
- **Hover-only text on the price-list links.** The "התעריפון ↗" links carry the document's full name in a `title` only (hover-only). This
  predates the branch.
- **Structure review.** `merge-review.mjs main` lists 15 components outside the kit, all in `components/invest` and `provenance.tsx`, all
  existing feature compositions. It also lists 6 new kit pieces, all in the gallery (PHONE_GONE now included). Its two "Hebrew outside copy"
  items are a comment (`pair.tsx:1206`) and a regex (`source-label.ts:23`), both false positives. All 77 copy keys the branch adds have a reader.
- **Movement, own-bank select at 390.** Its one-line explanation changes between 2 and 3 lines inside its `LongestCase` (h ±19 to 20 px). The
  held block keeps the page height and nothing moves (page +0, 0 moved). Kept, as the builder judged.

## What was checked and held

- **The F-102 run.** In `securities.ts`, the minimum is paid after manager, custody and fixed fees, never more than is held, by oldest units. It
  is kept out of `exitYearFees` (TXS-06). It is read per F-101 stretch (`tariffAt(m)`), and its own `account` line is in `Tally.point`,
  `yearOneFeesPaid`, `cumulativeProviderFees` and `providerLines`.
- **`monthOfDate`.** 2026-11-06 → 2027-07-01 gives month 8, which is right.
- **The BANK-35 flag.** It sits on the first month from the cap that charges above it.
- **The F-103 run.** The charge is converted at the month's rate, after reinvestment, and is never more than held. It is not deducted from the
  gain, G-32 is flagged in the exit year, and G-32 is in method section 12. In F-61 it moves with custody. It is left out where an average
  replaces custody.
- **The spread (D65).**
  - It has its own field, charged on every conversion: the lump sum, both standing ways and the sale.
  - It is not priced on an average row or where the ceiling is null.
  - It is kept beside a conversion price set over the list (`applyOwn` keeps `fxSpread`), and replaced by an F-61 rate.
  - It is refused beside bounds or a per-dollar price.
- **IB's conversion.** method.md F-63 now names IB's spot-order conversion (independent check 2, item 2, fixed).
- **Data.**
  - The ten banks' minimums match their quotes: Hapoalim 5.30, Leumi 5.50, Discount 5.90, First International 6.30, Massad 6.30, Mercantile
    6.40, Mizrahi-Tefahot 6.80, Jerusalem 9.50, Yahav 4.00, One Zero 0.
  - Pepper is `part_of` Leumi, with no current account.
  - Discount's three group exemptions quote "עמלת מינימום פעולות פטור", with the entries' printed ends (12, 48, 24 months).
  - One Zero's 50 `usd_per_event` line quotes p.17.
- **The validator.** It enforces the schema's claims: a bank's record needs `current_account`, a non-bank's has none, the unit is
  `nis_per_month`, a positive minimum carries a quote, and a group's months equal its printed end. M2 is the one hole in that last check.
- **The page.**
  - At 1440 and 390, sp500 and ta125 have no horizontal overflow and no console errors.
  - No figure overflows at the default plan.
  - The movement script (with and without `--plans`) shows no movement other than S1 and S2.
  - The figures' touch targets use the existing `.num::after` extension.

Size: large (review only; one file).
