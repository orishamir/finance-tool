# The fund list's columns: three options (2026-11-05)

The founder asked about the ת"א-125 fund list: "are you sure we show the interesting information in the table? maybe other columns would be better?" The facts behind these options are in `facts.md`. In short, the calculation charges each fund every year the **larger** of two figures: its listed fees, or the shortfall to its index in its reports. The column shown today, "מול המדד", is the past gap. It hides ties: תכלית and MTF are both −1,030 ₪. It shows leads that are never counted: S&P 500 has +0.01% to +0.65%. On S&P 500 it ranks 5 pairs against the shekels. The listed fees are shown only in the picked fund's card.

## How the drawings were made

- `draw-options.mjs` opens the live page (`/indices/ta125`, `/indices/sp500`) at 1440 px, and ta125 again at 390 px. For each option it changes the fund list in the page (DOM and CSS) and crops the list before and after.
- Run it from the repository root: `node research/specs/2026-11-05-fund-columns/draw-options.mjs`.
- Every figure comes from `numbers.json`, which `compute.ts` makes from the site's own functions. The plan is the page's default, at פסגות, the account the page opens on. No figure is typed by hand, and none is made up.
- Composites: `option{1,2,3}-{ta125-pc,sp500-pc,ta125-phone}.png`. Today is on the right, the option on the left, and the heights are written under each. Raw crops are in `raw/`, and the heights in `heights.json`.
- Nothing in `site/` was touched. All Hebrew is a draft for the Hebrew editor.

## Heights (pixels to the bottom of the sixth row)

"List" runs from the column head, or from the new line above it, to the sixth row. "Card" runs from the card's top, including the picked fund's card, to the sixth row. "Whole" is the full card with every row and the note.

| View | Today: list / card / whole | Option 1 | Option 2 | Option 3 |
|---|---|---|---|---|
| ת"א-125, PC | 485 / 776 / 918 | 485 / 798 / 940 | 532 / 823 / 965 | 515 / 829 / 971 |
| S&P 500, PC | 712 / 1,079 / 3,167 | 734 / 1,123 / 3,322 | 813 / 1,180 / 3,442 | 796 / 1,186 / 3,416 |
| ת"א-125, phone 390 | 890 / 1,268 / 1,478 | 890 / 1,291 / 1,500 | 955 / 1,334 / 1,543 | 836 / 1,238 / 1,478 |

Two causes of the growth are shared by all three options:

- **The picked fund's card gains 22 px.** Options 1 and 3 add the past gap to it, with the line "מול המדד: … בשנה · N שנים". Option 2 leaves the picked fund's card as it is.
- **Long names now wrap in every option.** Today a long name (the iShares and Vanguard rows on S&P 500) does not wrap, and runs into the gap column under it. Today's cell there is short ("עוד לא נאסף"), so no one sees it. A column with a number would be covered, so every option lets the name wrap. That is most of the S&P 500 growth in option 1 (+155 px for the whole card).

---

## Option 1: "עלות בשנה", then "לעומת הבחירה"

**The choice it changes:** the reader picks a fund by what the calculation actually takes from it each year. The column is in the same order as the shekels, and two funds that come out equal show the same rate.

**What it adds:** one column (5.5rem, the gap column's width), holding the counted yearly rate, marked as computed. A small second line says where the rate comes from:
- "דמי ניהול" when the listed fees are the larger figure;
- "לפי הדוחות" when the shortfall in the reports is larger.

On the phone, where the column head is hidden, the second line reads "עלות בשנה · …".

**What it removes:** the past gap leaves the row. It moves into the picked fund's card, beside its fees. The note under the list is rewritten.

**Sources:**
- The counted rate is `countedPct` (compute.ts → `trackingBeyondFees` + `sumFees`, the same rule as `fundOf`).
- The word comes from `countedFrom`.
- The gap in the card is `gap` and `gapYears` (`gapOf`, F-92 (a)).

**What it shows:** on ת"א-125, תכלית and MTF both read 0.37%: one from its fees, the other from its reports. The tie is explained. On S&P 500 every ranked row reads "דמי ניהול", because no shortfall there exceeds the fees.

**Risks (what a reader could misread):**
- "0.37%" for MTF is not its listed fee (0.345%). Someone who checks the fund's page on Maya finds a different number. The word "לפי הדוחות" is the only clue.
- The years behind a shortfall leave the row. A rate from one year looks as firm as one from four.
- A row with no record (8 on S&P 500, 3 on ACWI including its pick) reads "דמי ניהול" like any other row, so the missing record is hidden. The task's wording allows only these two words. A third word, such as "אין דוח", would fit on the phone but not in 5.5rem.
- Leads over the index (S&P 500: +0.37% for the pick) disappear from the list. A reader who cares about them sees one only for the picked fund.
- On S&P 500 the second line is the same on every ranked row ("דמי ניהול").

---

## Option 2: "דמי ניהול", "מול המדד" and "לעומת הבחירה"

**The choice it changes:** the reader compares the listed fees, the figure people compare everywhere, with the past gap beside them, and sees which of the two sets each fund's price.

**What it adds:**
- A "דמי ניהול" column (5rem): fixed, variable and trustee fees together, marked as computed because it is a sum.
- A line above the column head: "החישוב מוריד מכל קרן בכל שנה את הגבוה מבין שניים: דמי הניהול, או הפיגור אחרי המדד כשהוא גדול מהם. המספר שנספר בהיר, השני אפור."
- The figure that is not counted is shown at 55% opacity and normal weight.
- On the phone the two figures sit side by side under the name, each with its own word.

**What it removes:** nothing leaves the row. The shekel column narrows from 10.5rem to 7rem. The note under the list is rewritten to explain both columns.

**Sources:**
- Fees: `fees.total` (`sumFees` over the record's fixed, variable and trustee fees, each sourced in the record).
- The gap: today's cell, unchanged.
- Which figure is counted: `countedFrom`.

**What it shows:**
- ת"א-125: תכלית's fee 0.37% is bright and its gap −0.28% grey. MTF's fee 0.345% is grey and its gap −0.37% bright.
- S&P 500: every fee is bright and every gap grey, including the +0.65% that today looks like the best fund.

**Risks:**
- Neither column is in the shekels' order. ת"א-125 and ת"א-90 each have 3 pairs reversed by fees; S&P 500 has 5 reversed by the gap. A reader who sorts by eye on one column gets it wrong.
- "The larger of" compares a positive fee with a negative gap. The reader has to read −0.37% as a 0.37% shortfall. A lead (+) is never the larger, and only the head line says so.
- Bright against grey is a cue of tone alone. The site's rule is that colour never works alone. A word or mark on the counted figure would be needed before building.
- It is the tallest option: +47 px on ת"א-125 PC, +65 px to the sixth row on the phone. The 7rem shekel column will need more lines for the hedged row's range, which is outside the crop.
- It shows two figures, plus the shekels, where only one of them counts.

---

## Option 3 (my own): a bar of the yearly cost, split into listed fees and shortfall beyond them

**The choice it changes:** the reader sees how much each fund costs a year, and how much of that is in its price list and how much rests on a shortfall in its reports, and chooses with that in view.

**What it adds:**
- A "עלות בשנה" column (10rem) holding a bar and the counted rate (computed mark).
- The bar has two parts:
  - **Solid:** the listed fees.
  - **Hatched:** the shortfall beyond the fees, read from the reports. It appears only when that shortfall is larger than the fees.
- The bar grows from the right, inside the row, like the account list's bar. The rule allows a bar beside Hebrew text in a table row.
- A legend line above the column head, with a swatch and words for each part.
- On the phone the bar sits under the name, across the row, as in the account list.

**What it removes:**
- The past gap leaves the row and goes into the picked fund's card, as in option 1.
- The shekel column narrows to 8rem.
- The note under the list is rewritten.

**Colour:**
- One colour, `--palette-neutral-300`, the muted text colour, solid for fees and hatched for the shortfall. No hue is added to the page.
- Every hue is already spent on the account bar, the chips or a reserved meaning (see the colour inventory in `../2026-11-05-indices-colours/inventory.md`). A neutral bar takes none of them.
- The hatch, not a second colour, says "from the reports", and the legend names it in words.

**Scale:** each list's bar is scaled to its most costly ranked fund: 0.54% on ת"א-125, 1.115% on S&P 500. The hedged row (2.44%) is above that scale. It is drawn full width with a "⟵" mark; it sits outside the crops and has not been checked by eye.

**Sources:**
- Bar length: `countedPct`.
- Solid part: `fees.total`.
- Hatched part: `countedPct − fees.total`, which equals `a07` (already in percentage points).

**Why this one:**
- It is the only drawing that shows both numbers behind the rule, and in which the visible total sorts exactly as the shekels do on all seven indices.
- It explains the ת"א-125 tie without a sentence: תכלית is all solid, MTF slightly shorter solid plus a sliver of hatch, and both end at the same length.
- On the phone it is the shortest list (836 against 890 px to the sixth row), because the bar replaces a two-line figure.

**Risks:**
- The hatched parts on ת"א-125 are small (0.025 to 0.082 points of a 0.54% scale): visible on a PC, a few pixels on the phone. The split speaks louder on ת"א-90 and on hedged rows than on ת"א-125.
- Bars are not comparable between indices. A full bar is 0.54% on one page and 1.115% on another.
- On S&P 500 the cheapest funds (0.02%, 0.03%) are a one-pixel sliver, so the picked fund looks as if it had no bar at all.
- A reader could take the bar for money, because it sits beside the shekel column. The head says "עלות בשנה" and the number beside the bar carries "%".
- On the phone the column head is hidden, so only the legend line names the bar.
- As in option 1, the years behind a shortfall and the leads over the index leave the row.

---

## Recommendation

**Option 3. If a bar per row is too much, option 1.** Both show the one figure that is in the shekels' order, and both move the gap into the picked fund's card.

- Option 3 also keeps the listed fee visible as the solid part, which answers "where does the price come from" without a second column.
- Option 2 shows the most figures, but neither of its first two columns is in the shekels' order. It also needs tone alone to tell the reader which figure counts.

**Two things to settle before building either:**
1. A word on rows with no record (today's "עוד לא נאסף" or "אין שנה מלאה").
2. A fix for the long-name overflow, which every option exposes.
