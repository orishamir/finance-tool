# Fund list columns: a first-time reader's answers

2026-11-05. Read only the PNG drawings in this folder: `option1/2/3-{ta125,sp500}-pc.png`, `option1/2/3-ta125-phone.png`, `raw/*.png` (today and each option alone) and the `{ta125,sp500}-{pc,phone}-{before,after}.png` full-list shots. No .md, code or data file was read, and the site was not opened. The reader knows what an index fund and a management fee are, has a monthly amount to invest in TA-125 or the S&P 500 in a Psagot securities account, and is choosing a fund from the list.

"Read" means it is printed in a drawing. "Inferred" means I worked it out from the numbers.

## Today ("היום")

**1. Columns**
- **קרן**: the fund's name and number (the number is a link), with chips: kind (קרן מחקה / קרן סל / קרן חוץ בת"א / נקנית בחו"ל), how it tracks (מחזיקה את המניות, עסקת החלף, כמה דרכים יחד), צוברת or מחלקת דיבידנד, חשיפה לדולר, and for the S&P the tax chips (מס גם על שינויי המטבע, מס דיבידנד בתוך הקרן, אין מס בצבירה, מס עיזבון אמריקאי, W-8BEN). I can't tell what "(4A)", "(4D)" and "(40)" in the names mean. I also can't tell what "כמה דרכים יחד" means: several tracking methods at once?
- **מול המדד**: how far the fund was ahead of (+) or behind (−) its index each year, averaged over "שנה אחת", "3 שנים" or "4 שנים". The footnote below the list explains it (read): ahead or behind after all costs, averaged over the full years in the annual reports. A lag larger than the fee counts as cost, and being ahead earns nothing.
- **לעומת הבחירה**: how many shekels I would end up with less than with the chosen fund. I can't see the amount or the number of years it assumes anywhere in the list crops. (Inferred: the shekels are proportional to the gap in yearly cost, about 42 ₪ per 0.01% on the S&P and about 42 ₪ per 0.01% on TA-125.)

**2. My choice.** TA-125: IBI tracker 5112628. It is chosen, it lagged least (−0.04%) and every other fund shows a shekel loss. S&P: Yelin tracker 5139282 (+0.37%), but I would hesitate over Harel tracker 5129275, which shows +0.65% over four years. Why is it 447 ₪ worse?

**3. Confusing or contradictory**
- **The column I can see does not explain the order or the shekels.** Tachlit at −0.28% and MTF at −0.37% both show −1,030 ₪. On the S&P, Harel at +0.65% (four years) ranks below Yelin at +0.37% (one year) and costs 447 ₪, Yelin ETF at +0.03% costs 1,268 ₪, and MTF at +0.01% costs 2,344 ₪. The ranking follows a number that is not on the screen (the fee). Only the footnote, below 19+ rows, says why. This is the main flaw of today's list.
- **The plus figures look like a promise.** "+0.65% בשנה" next to a fund reads as "this fund beats the index". That is past and noisy, and the site itself ignores it. Plus figures on S&P funds in shekels also make me doubt what "המדד" is here: the price index, or the index with dividends, in dollars or in shekels?
- **The periods are not alike.** "שנה אחת" sits next to "4 שנים" in the same column, and one year is thin evidence.
- **The fee is missing from the rows.** It appears only for the chosen fund, in the top card.

**4. Missing.** See "What is missing in every option" below.

**5. Phone (390).** The number and the shekel figure are readable and stacked under the name. The chips are cut off at the left edge ("מחזיקה את המני…", "כמה דרכים יחד" clipped) and the third chip (צוברת) is gone. The filter row is cut off too. In `sp500-phone-*`, the hedged Harel fund's name wraps one word per line ("הראל / מחקה / (4A) / S&P / 500 / - / מנוטרלת / מט"ח"), and its range "בין +2,212 ל־−23,766" squeezes the name column. That row is broken on the phone in today's list and in the "after" shot.

## Option 1: one column, "עלות בשנה"

**1. Columns.** **עלות בשנה** is one percentage per fund with a label under it: "דמי ניהול" when the fee counts, "לפי הדוחות" when the reported lag beyond the fee counts. **לעומת הבחירה** is unchanged. "מול המדד" now appears only in the chosen fund's top card. I am unsure what "לפי הדוחות" means. Which reports? It reads as "the reports say it costs 0.37%", as if it were a stated price. That it is a measured past lag I only learn from the footnote in the "after" shot ("ואם בדוחות השנתיים היא פיגרה אחרי המדד יותר מזה, הפיגור").

**2. My choice.** The same funds: IBI tracker 0.125% and Yelin tracker 0.02%. Now the reason is visible: the cheapest number sits on top, and equal numbers give equal shekels (Tachlit 0.37% and MTF 0.37% both −1,030 ₪). I would no longer be tempted by Harel's +0.65%, because I can't see it.

**3. Confusing**
- **One column mixes two kinds of number:** a published fee and a past measurement, distinguished only by small grey words. Calling a past lag "עלות בשנה" turns history into a stated yearly cost, which is a soft promise that it will repeat.
- **The fee and the actual lag of the other funds are gone.** For MTF, Harel ETF, Kesem and IBI ETF I see only the bigger of the two and never learn their fee (0.345%, 0.359%, 0.36%, 0.458% in option 2).
- **The chosen TA-125 fund looks dearer than it did.** Its top card says it lagged only −0.04%, yet its row says 0.125%. Without the footnote that looks like a contradiction: did it cost me 0.04% or 0.125%?
- **For the S&P it shows only fees,** so the measured +0.37% or +0.65% are hidden. That is honest, but a reader who knows the funds will ask where they went.

**4. Missing.** See below.

**5. Phone.** It reads well: one percentage with a two-word label per row, the same height as today (both lists show 890 px to the sixth row), and the same clipped chips.

**Weakness, bluntly:** it is clean because it hides the evidence. "לפי הדוחות" is vague, and it dresses up a past lag as a price.

## Option 2: three columns, "דמי ניהול", "מול המדד", "לעומת הבחירה"

**1. Columns.** **דמי ניהול** is the published yearly fee. **מול המדד** is the past lag (or lead). A sentence above the list (read) says the calculation takes the larger of the two each year; the one that counts is bright, the other grey. **לעומת הבחירה** is unchanged.

**2. My choice.** The same funds. It is the only option where I can check the order myself: Tachlit's fee (0.37%) and MTF's lag (−0.37%) are both bright, so I see why they tie. On the S&P every fee is bright, so I see the order is purely by fee.

**3. Confusing**
- **Grey reads as "disabled" or "unimportant",** but the grey −0.04% on the chosen TA-125 fund is the most interesting fact on the screen: it really lost only 0.04% to the index.
- **The rule needs reading.** Without the sentence above, two bright-or-grey columns are a puzzle.
- **The grey plus figures on the S&P (+0.65%, +0.37%) are still there.** They still invite "why not Harel?", and the answer, that a lead earns nothing, is a sentence I must read and accept.
- **The precision is mixed:** 0.125%, 0.345%, 0.359%, 0.458% next to 0.37%, 0.39%.
- **The S&P list gets a third figure per row,** on top of rows that already carry three or four chips. It is the densest option.

**4. Missing.** See below.

**5. Phone.** The two percentages sit side by side under the name, each with a tiny label ("דמי ניהול", "מול המדד · שנה אחת"). They are readable, but the grey figure is low-contrast on the dark background, and comparing down the list means tracking two small numbers per row. It is the tallest option on the phone (955 px to the sixth row against 890).

**Weakness, bluntly:** it is the most honest and the hardest work. I get the inputs and have to apply the rule in my head, and a grey number I am told to ignore is still the one that looks like a return.

## Option 3: a bar of yearly cost, fee plus the lag beyond it

**1. Columns.** **עלות בשנה** shows the percentage and a bar. The plain part of the bar is the fee and the hatched part is the lag beyond the fee "לפי הדוחות" (legend above the list). **לעומת הבחירה** is unchanged.

**2. My choice.** The same funds. The bars make the ranking obvious at a glance.

**3. Confusing**
- **The bar repeats the shekel column.** Both are proportional to the same cost, so it adds a picture of something already in numbers.
- **The fee/lag split is too small to read.** It is the only new information, but MTF's 0.025% hatch and Harel's are slivers, and nothing says how much is fee and how much is lag. On the S&P there is no hatch at all.
- **The S&P bars are hairlines.** At 0.02%, 0.03% and 0.07% they can't be compared with each other. The bar scale is set by the dearest fund, so the cheap funds I am actually choosing between are invisible.
- **Like option 1, it calls a past lag a cost, and the chosen TA-125 fund's −0.04% is again only in the top card.**

**4. Missing.** See below.

**5. Phone.** The bar gets its own line with the percentage at the far left, and it reads. The list is the shortest of the four (836 px to the sixth row). The hatching is barely visible at 390 px.

**Weakness, bluntly:** a chart that changes no choice. I choose the same fund with or without the bar, and the bar is unreadable exactly where the funds are close.

## What is missing in every option (the real gap)

All three options rework one dimension, the yearly fee against the past lag, where the funds differ by a few hundredths of a percent. The full S&P list shows that the differences that matter more sit elsewhere, as chips or not at all.

1. **The cost of buying every month in this account.** I invest monthly. A tracker mutual fund and an ETF are bought differently, and a minimum commission on a small monthly purchase can outweigh a 0.1% fee gap. The kind chip (קרן מחקה / קרן סל) does not tell me what Psagot charges me for each. I can't tell whether "לעומת הבחירה" includes it. (Inferred: it does not, because it moves exactly in step with the fee gap.)
2. **The assumptions behind the shekels.** "−1,030 ₪" against what monthly amount, over how many years, and at what return? None of this is visible in the list. The column states a definite loss, so I need its basis next to it.
3. **Tax differences on the S&P, in money.** "מס דיבידנד בתוך הקרן", "מס גם על שינויי המטבע", "אין מס בצבירה" and "מס עיזבון אמריקאי" are chips only. Over many years they may matter more than a 0.05% fee, and the list does not say which way or how much.
4. **Can the fee rise?** The chosen S&P fund charges 0% fixed and 0% variable, with only 0.02% to the trustee. A 0% fee looks like an introductory price. I want to know whether it is fixed, or when it changed last.
5. **Size and trading.** For an ETF: how large it is and how wide the buy/sell spread is. For a tracker mutual fund: that I buy at one daily price. Neither appears.
6. **Hedged or not, as a choice.** The one hedged S&P fund shows "בין +2,212 ל־−23,766 ₪", ten times any fee difference in the list. That is the biggest decision on the page, and it sits at the bottom as a single row.
7. **Funds without a price.** Six foreign-listed ETFs show "אין מחיר כאן" because Psagot's price list has no line for foreign securities (read, in the footnote). That is useful, but it means the list compares only what this account can price.

A column that turned item 1 (and, for the S&P, item 3) into the same shekels as "לעומת הבחירה" would help me choose more than any of the three options. So would a line that states the assumptions behind the shekels.

## Ranking for helping me choose

1. **Option 2.** It is the only one where the order and the shekels can be checked from what is on screen, and it keeps both the fee and the past lag. Flaws: dense, the grey figures still look like returns, it needs the rule sentence, its precision is mixed, and it is the tallest on the phone.
2. **Option 1.** It is the quickest to scan, and its number matches the shekels. Flaws: "לפי הדוחות" is vague, it presents a past lag as a price, it hides each fund's fee and actual lag, and the chosen fund's 0.125% seems to contradict its −0.04%.
3. **Option 3.** Flaws: it has option 1's flaws, plus a bar that repeats the shekel column, an unreadable fee/lag split, and hairline bars on the S&P exactly where the choice is made.

Today's list ranks last of all. The column it shows contradicts its own order (−0.28% and −0.37% at the same −1,030 ₪, and +0.65% ranked below +0.37%).

None of the four answers what I would most want to know as a monthly investor: what buying this fund every month costs me in this account, and, for the S&P, what the tax and hedging differences come to in money.
