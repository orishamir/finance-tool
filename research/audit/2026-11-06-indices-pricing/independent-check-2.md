# Independent check 2: indices page, round 4 of #190 and D64 to D67 (branch `indices-pricing`, head 21dbde2e)

Checked on 2026-11-06 against `97c990e2..21dbde2e`. I worked from the diff, the data, docs/method.md and the built page first, and read the builder's report and the first independent check only afterwards. Nothing in the worktree was changed apart from this file. The site was built by `npm run check` and served from `site/build/client` on 127.0.0.1:4391. Playwright ran at 1440 and 390 px.

## Verdict: fail

The figures are right. Every one I recomputed by hand matches the page to the shekel. The work fails on two points:

- The note that BANK-35 attaches to a figure says the wrong thing.
- docs/method.md says Interactive Brokers is priced on a conversion line that the page does not use.

Both are small fixes.

## Must fix

1. **The BANK-35 note says "too high" on a figure that would be too low, and the figure it is about does not carry it.**
   - **Where.** The note text is in `site/app/copy.ts:684` ("מיולי 2027 הסכום כאן יכול להיות גבוה מדי…"). The engine adds the flag to the run (`packages/engine/src/ledgers/securities.ts`, F-102 block).
   - **Which figure shows it.** The site attaches the run's flags only to the value left (`site/app/lib/invest.ts:650`, `wayPrice`: `flags: row.run.flags…`). The account's cost (`site/app/lib/invest.ts:646`, `costValue`) takes `row.flags`, which are the tariff build's flags, so BANK-35 never reaches it.
   - **What the reader sees.** The figure that holds the current account and may be too high (the "מה החשבון גובה" cost) has no note. The value left has a note that calls it possibly too high. A cost that is too high makes the value left too low.
   - **Steps.**
     1. Open `/indices/sp500` at 1440.
     2. In the account list, tap Leumi's "נשאר" figure (82,723 ₪). Its sheet ends with the BANK-35 note: "…הסכום כאן יכול להיות גבוה מדי".
     3. Tap Leumi's cost (5,283 ₪). Its sheet has no note at all. It has no inputs or rules either: only the formula and "ערכים שנכנסו לחישוב" with nothing under it.
   - **Fix.** Put the flag on the cost, as method F-102 says ("The flag says on the figure that from then on it may be too high"). On a value left, the note needs words for the other direction (the value may be too low), or should not appear.

2. **docs/method.md says Interactive Brokers is priced on its automatic conversion, but the page prices its spot conversion.**
   - **Where.** `docs/method.md:324` (F-63, in the indices-page part): "Interactive Brokers is read on its Fixed lines only … with its automatic-conversion FX line".
   - **What the page does.** It prices the spot line `interactive-brokers-fx-spot` (0.002%, at least 2 USD an order). The code is `site/app/lib/invest.ts`, `candidates()` and its comment, from commit cc9a718a, D56.
   - **Hand check.** iShares Core S&P 500 UCITS Acc (IE00B5BMR087) on the default plan:
     - On the spot line the cost is 2,756 ₪, the page's figure.
     - On the automatic conversion (0.03%, no minimum) it would be 1,904 ₪.
   - **Why it matters.** CLAUDE.md requires every computed figure to follow docs/method.md. This branch edited that F-63 paragraph and left the old sentence in place.
   - **Fix.** Replace the clause with the spot order and its reason: the automatic conversion's markup is at the broker's discretion, and the spot order is printed with no markup.

## Should fix

3. **Marking one's own bank still moves the chosen row.** The first check raised this. The fix pass made the re-sort immediate and sliding, but it still does not hold the chosen row.
   - **Steps.**
     1. Open `/indices/sp500?house=leumi&fund=5139282`.
     2. Bring the "הבנק שבו כבר יש לכם חשבון עו״ש" list to the middle of the screen.
     3. Choose לאומי.
   - **What moves.**
     - The chosen Leumi row moves from 792 to 659 px at 1440 (133 px up), and from 803 to 651 px at 390.
     - One Zero moves from 659 to 799 px.
   - **The project's own check sees it.** `box-check.mjs … --plans` reports "select 1 = leumi … 32 moved" at 1280 and "9 moved" at 390, on both sp500 and ta125. The default-plan run does not catch it.
   - **The rule.** CLAUDE.md says a pick moves nothing on the screen, and a list that re-sorts keeps the row in hand where it was. Holding the chosen row with `holdOnPick` when the pick comes from the select would meet the rule as it is written.

4. **At 390 px, a pick that also changes the fund does not hold the tapped row.**
   - **Steps.** On `/indices/sp500` at 390, tap Interactive Israel's row. The row is grey, and picking it moves the fund to IE00B5BMR087.
   - **What happens.**
     - The page scrolls about 1,785 px up to follow the row to first place.
     - The row still lands 257 px higher on the screen (569 to 312).
     - At 1440 the gap is 51 px.
   - **Compared with main.** The live page (main) loses the row off the screen (−1,711), so round 4 improved this but did not finish it.

5. **The notes on prices abroad say more than the data supports.**
   - **The second note (One Zero).** `site/app/copy.ts:3758` (`abroadOthers`) says the costs of "הגוף ששומר את ניירות הערך" are not counted. One Zero's custodian charge per dividend is counted (D67, F-103). No figure shows it today, because One Zero buys only on US exchanges and the US distributing funds rest on an open rule, but a fund someone types would show it.
   - **D66's own text.** `docs/product.md:86` decides that a cost passed on "with no ceiling" is left out. Its reason, and the records, also leave out the costs passed on *with* a printed ceiling:
     - First International's and Jerusalem's printed ceilings.
     - One Zero's broker charge ("עד 1 דולר ארה״ב לעסקה") and correspondent charge ("עד 100 יורו לעסקה"), listed in one-zero `left_out`.

     The decision text should say what is done: every third-party charge abroad is left out, printed ceiling or not, except One Zero's custodian charge (D67).
   - **The spread note.** It says "תקרה לפער כתובה רק אצל" three houses. The code comment for Interactive Brokers records a printed "no mark-ups on quotes", and the IB record holds no spread field for it. Either record it, or confirm that "only" is meant.

6. **BANK-35 is cited from a copy.** The note's sheet now shows "החוק הפתוח (צילום רשומות)" (olaw.org.il) as the source of BANK-35. The data record is `data/rules/bank-35.json`, with publisher "Open Law (copy of Reshumot)". CLAUDE.md, as of 2026-11-06, allows a copy only to find the official text. The record predates this branch, but this branch is what puts it in front of readers. The rule-base owner should re-source it from Reshumot or gov.il.

7. **Mercantile's exempt current account is an inference, priced below the document's maximum.**
   - **Where.** `data/fees/mercantile@2026-11-04.json:1548` and `:1647` (`current_account.inferred`), and method F-102.
   - **What the annex says.** It prints the teller and direct actions "פטור" for students and released soldiers, with no minimum row. The site reads the minimum as 0.
   - **The tension.** D56 prices "the most its binding documents let it charge". The ordinary clause bounds the minimum by "מחיר של פעולה אחת ע״י הפקיד". Whether that means the group's action price or the price list's 6.40 ₪ is not printed.
   - **For it.** The seniors' "(בכפוף למינימום)" against this group's bare "פטור" is good evidence.
   - **What to do.** It is still a price read from absence, unlike Discount, which prints "עמלת מינימום פעולות פטור". Show it to a fresh reviewer given only the annex, or bring it to the founder as a D56 question.

8. **A figure is cut at 390 on a typed plan past the sliders' ends.** `box-check.mjs /indices/sp500,/indices/ta125 phone --plans` reports "CUT figure "2,296,540,223 ₪" (7..116 in 16..359)" for the plan 50,000,000 ₪ + 100,000 ₪ a month, 40 years, 12%. `LONGEST_LEFT` (`pair.tsx`) is sized for nine digits, the sliders' ends, but the boxes accept more.

9. **Structure review.** `merge-review.mjs 97c990e2` lists `PHONE_GONE` as a kit export that is not in the gallery (`site/app/components/kit/index.ts:42`). The builder's structure review ran against `bcd0b136` and left round 4's items to round 4's own review. Either add PHONE_GONE to the gallery or say why it is kept out.

10. **Small loose ends (low).**
    - **F-102's group list.** It names Discount's released soldiers (12 months) among the groups whose current account is exempt. That group gets no radio under D43, so the data is never read.
    - **F-103 in the sensitivity run.** In the materiality run, the per-dividend charge is removed with custody but not scaled with it (`packages/engine/src/fees/materiality.ts`, `case "custody"`). Nothing on the indices page shows this run.
    - **Box heights at 390.** `box-check` at 390 reports the own-bank sentence's inner span changing height by 19 to 20 px. Nothing moves, because the box around it holds.

## What was checked and held

### 1. The figures

I recomputed each figure with my own month-by-month model in Python, written only from docs/method.md and data/fees, not from the engine's code. The model:

- **Deposits.** The amount today is bought at the start of month 1. The monthly deposit is constant in real terms (A-04), one order a month.
- **Commission on a buy.** The cash pays for the trade value plus the commission (F-12): `max(rate × trade, min)`.
- **Growth.** 7% a year, monthly, less the fund's drag (F-10).
- **Custody.** Charged at quarter ends (F-14).
- **Current account.** Paid each month after custody (F-102).
- **Exit.** Sale commission, then the conversion fee abroad (F-09, F-13).
- **The cost shown.** The same run without provider fees, less the run with them, in today's shekels, before tax (F-91).
- **Exchange rates.** ECB rates of 5 November 2026: 3.1716 ₪ a dollar and 3.5598 ₪ a euro.

The page's figure is the cost over the plan's 10 years, not a yearly cost.

Default plan (10,000 ₪, 500 ₪ a month, 10 years, 7%, 2% inflation), S&P 500, fund 5139282 (drag 0.02%):

| House | Page | Hand | Notes |
|---|---|---|---|
| Psagot | 1,057 | 1,057 | |
| One Zero | 4,544 | 4,544 | |
| Leumi, current account counted | 5,283 | 5,283 | Standing order 0.225%, minimum 5 ₪. Custody 0.15% a quarter. Current account 5.50 ₪. |
| Leumi marked as own bank | 4,541 | 4,541 | The difference, 742 ₪, is 120 × 5.50 ₪ with growth, less the custody and sale commission it saves. |
| Discount | 9,112 | 9,112 | Current account 5.90 ₪. |
| Discount, first-degree students (`?house=discount&group=3`) | 8,098 | 8,098 | Custody 0.075% a quarter and no current account for 48 months, then the ordinary prices. Counting the current account for those months would give 8,474; never counting it, 7,682. |

Another amount (100,000 ₪, nothing monthly), same fund:

| House | Page | Hand |
|---|---|---|
| One Zero | 963 | 963 |
| Psagot | 2,144 | 2,144 |
| Leumi | 11,337 | 11,337 |
| Discount | 14,367 | 14,367 |

A fund bought abroad (IE00B5BMR087, drag 0.07%), default plan:

| House | Page | Hand | Notes |
|---|---|---|---|
| Interactive Israel | 1,300 | 1,300 | 0.15%, minimum 2.5 USD. The recurring plan converts free; a lump sum and the sale pay 0.002%, minimum 10 ₪. |
| Interactive Brokers | 2,756 | 2,756 | On the spot line. See must-fix 2. |
| Meitav Trade | 39,248 | 39,248 | Conversion 0.13% plus the 0.8% spread at its ceiling (D56, D65). 0.25%, minimum 25 EUR. Custody 0.15% a quarter, minimum 270 ₪. 90 ₪ a month. |

Other data checks:

- **Spreads.** Altshuler (0.7%), Meitav (0.8%) and IBI (0.7%) each come from the house's own price list, with page and quote. No bank's spread is priced.
- **Current-account minimums.** All ten match their quotes and notes: Hapoalim 5.30, Leumi 5.50, Discount 5.90, First International 6.30, Massad 6.30, Mercantile 6.40, Mizrahi-Tefahot 6.80, Jerusalem 9.50 flat, Yahav 4.00, One Zero 0.
- **BANK-35.** The order's cap for 0 to 2 actions is 5 ₪, from 1 July 2027. On the run date this falls in run month 8 (`monthOfDate`). Eight minimums are above the cap, which matches method F-102.
- **D67.** It moves no figure today, as the builder says: One Zero's foreign line is for US exchanges only, the Irish funds are "other-venue", and the US funds rest on an open rule. The engine tests cover the charge itself.

### 2. No price from analogy

- Every new price comes from a binding price list: the current-account minimums, the group exemptions, the three spreads and One Zero's 50 USD per corporate event.
- Mercantile's exemption is read from absence (should-fix 7).
- One Zero's 0 ₪ current account has no quote. It was read in the founder's Chrome on 2026-11-04, and the schema allows that.
- The data check enforces the naming rule (D42), the quote on a minimum above 0, and "פטור" on group exemptions (`packages/pipeline/src/validate.ts`).
- No advertising is used as a price.

### 3. The page

- **Controls.** The own-bank list changes the rows and the sentence under it. One Zero is left out of the list because marking it would change nothing.
- **Way back.** After a pick that changed the other half too, the way back works and restores the address. Its target is 39 px of text plus a 12 px layer on each side, so at least 44 px.
- **Text scan.** With every fold open, the page text has no process words and no internal ids. The rule and formula ids inside sheets, and the ETF-75 reference, are the existing pattern.
- **Movement check.**
  - `box-check.mjs` on the default plan matches the builder's result: no move, apart from the held sentence span (item 10) and the slider line at 1280.
  - With `--plans` it finds the re-sort moves (should-fix 3) and the cut figure (should-fix 8).
- **Hover.** No content depends on hover, apart from the existing `title` tooltips on the price-list links.
- **Errors.** No console errors at either width.
- **Sources.** Figures open their sheets. The cost figure's sheet is bare (must-fix 1).

### 4. `npm run check`

Passed, exit 0: typecheck, vitest (110 files, 1,685 passed, 1 todo), "data/ is valid", and the site build.

### 5. Held work

- Nothing that is held is reachable from the built pages' links. `/goal`, `/holdings` and `/idle-cash` (`site/app/lib/review.ts`) are not linked from the indices or company pages.
- No new route was added.

### Not checked

- The index switch on a phone (`--switch`).
- A typed account with an empty field, end to end in the browser. Unit tests cover it.
- Fresh readers. A code reviewer cannot be one.

### Note for the lead

The file `research/audit/2026-11-06-indices-pricing/finance-review-2.md` appeared untracked in the worktree during this check. It is not mine and was left alone.
