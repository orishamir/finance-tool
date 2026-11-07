# makam-guide-2

Who: You are 38, you read Hebrew fluently, you keep most of your savings in a bank deposit, and you have heard of makam but never bought one.

Shots: research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-part0.png, research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-part1.png, research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-part2.png, research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-part3.png, research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-part4.png, research/audit/2026-11-07-makam-calc/reader-shots-2/guide_makam-1440-redemption.png

## (1) What the page tells me, and what the site can and can't do for me

**What it tells me:**
- **What makam is.** A short Government of Israel loan, up to one year, sold by the Bank of Israel. It pays no coupon and isn't linked to the CPI. You buy it below 100 and get 100 when it matures. The difference is your return, and for tax it counts as interest. A new series comes out every month, so about 12 series are trading at any time. If you hold to maturity, you know your return on the day you buy.
- **Compared with a bank deposit.** In both, tax is a flat rate on the interest. Makam has no lock-in and no early-withdrawal penalty, and banks may not charge a securities custody fee on it. But you pay a buy commission, and a sell commission if you sell early. The rate a bank advertises for a deposit is before fees and tax.
- **Compared with a money-market fund.** The page says makam is better when you hold to maturity and the commission is small relative to the amount and period. On small amounts or very short periods, the minimum commission can eat the gain.
- **Practical rules:**
  - You buy through a securities account at a bank or investment house.
  - On the exchange, the minimum order in continuous trading is ₪10,000 face value.
  - The last trading day is 3 trading days before maturity.
  - Tax is 15%, withheld at source, so makam alone doesn't make you file an annual return.
- **Risks.** If you sell before maturity you get that day's market price, which can be lower than you paid. It isn't inflation-linked. The state pays the face value, not the bank or the broker.

**What it can help with:**
- Understanding the product and its jargon. The glossary at the bottom is good.
- Roughly estimating what's left after fees and tax on ₪10,000, whether you sell at month X or hold to month 12.
- Knowing what to check: the custody-fee rule, buy commissions, the minimum order, and the last trading day.

**What it can't help with:**
- **Today's real yield.** The calculator says "המחיר עולה לפי תשואה של 3.25% בשנה. התשואה היא הנחה של האתר, לא ריבית שפורסמה" ("the price rises at an assumed 3.25% a year; this is the site's assumption, not a published rate"). The buy price of 96.85 is invented too: "הסכום והזמן: דוגמה של האתר" ("the amount and timing are the site's example").
- **My own bank's costs.** The example uses one investment house's fee schedule, not my bank's.
- **My exact timeline.** The page compares makam with a one-year deposit, but I need the money in a few months.
- **Actually buying.** Several practical points are marked "שאלה פתוחה" (open question): the unit size, how a private person takes part in the auction, and how the sale price splits between discount and capital gain.

## (2) Confusing or contradictory parts

**The numbers.** I redid them.

*Sell after 6 months* (calculator box, screenshot 2):
- Rising from 96.85 at 3.25% a year gives 98.41 at 6 months. ✔
- ₪10,000 ÷ 96.85 ≈ 103.25 units, × 1.56 ≈ ₪161.07. The page shows 161.10, which is rounding. ✔
- Tax is "15% מ־155.03" (15% of 155.03), where 155.03 = 161.10 − 6.07. That gives 23.25. ✔
- 10,000 + 161.10 − 23.25 − 16.14 fees = 10,121.71, shown as **10,122**. ✔

*Hold to 12 months* (screenshot 6):
- 96.85 × 1.0325 ≈ 100. ✔
- Tax: 15% of 324.55 = 48.68. ✔
- 10,000 + 324.69 − 48.68 − 19.29 = 10,256.72, shown as **10,257**. ✔

**Things that don't fully line up, or aren't explained:**
- **The 12-month gain is a bit low.** The naive calculation gives 103.25 units × 3.15 ≈ ₪325.2, but the box shows 324.69. The two boxes also imply slightly different unit counts. My guess is that units are sold to pay fees; the line "הרווח על החלקים שנמכרו כדי לשלם אותם" ("the gain on the units sold to pay them") hints at that. The box never says it outright.
- **The custody fee doesn't scale with time.** It's ₪6.07 for 6 months but only ₪9.14 for 12, not about ₪12. No reason is given.
- **The tax deduction differs between the two cases.** At 6 months the whole 6.07 custody fee is deducted from the taxable gain. At 12 months only "0.14 ₪ בלבד" (only ₪0.14) is deducted, because "דמי ניהול ... יורדים רק מרווח ממכירה" (fees are deducted only from a gain on sale). The logic holds up, but it took me three reads.
- **The tax label changes.** It reads "מס על רווח הון" (capital gains tax) at 6 months and "מס על הניכיון" (tax on the discount) at 12. Yet the tax section says "איך מחיר המכירה מתחלק בין ניכיון לרווח הון, עוד לא נמצא" (how the sale price splits between discount and capital gain hasn't been found yet). So the 6-month label is somewhat of a guess. It's 15% either way, so the total probably doesn't change.

**The custody fee seems to contradict itself.** Near the top, in "למה משתמשים בזה", the page says a bank can't charge a custody fee on makam. Then the calculator charges one. The answer is buried in small print in the box: the ban "חל רק על בנקים, והתעריפון הזה הוא של בית השקעות" (applies only to banks, and this fee schedule is an investment house's). That leaves an odd result: an investment house that charges a custody fee is still the cheapest of the "14 הבנקים ובתי ההשקעות" (14 banks and investment houses) the site collected.

**The deposit comparison may be apples to oranges.** The calculator box says "פיקדון לשנה ... משלם 1.55%–2.25%" (a one-year deposit pays 1.55%–2.25%). Those are real published rates, shown against an *assumed* 3.25% for makam. It's also unclear whether they are before or after tax. The makam result in the box is net: 10,257 is about 2.57% after fees and tax. A 2.25% deposit is about 1.9% after tax. The page doesn't do this comparison for you.

**Who owes the money?** The page says "שבנק ישראל מוכר" (which the Bank of Israel sells) and "המנפיק של המק"מ הוא בנק ישראל" (the issuer is the Bank of Israel). Then, under risks, it says "את השווי הנקוב משלמת המדינה ... לא הבנק" (the state pays the face value, not the bank). I understood it eventually, but it reads a little contradictory.

**The tax rate itself has a warning.** An orange box in the tax section opens "מקור אחד סותר" (one source contradicts): a Tax Authority guide gives a different rate on makam discount. The site applies 15% by law. The red box covers people aged 60+ and doesn't apply to me.

**Small things:**
- The spelling switches between "מק"מ" and "מק"ם", for example in the "שווה לדעת" (worth knowing) list.
- On the 12-month screenshot, the slider handle sits mid-height on the right edge instead of on the end of the line.
- The legend at the top, "123 מקור / 123 מחושב" (source / computed), is easy to miss.
- What does the number on the "חוקים וכללים · 6" (laws and rules · 6) chips count? It isn't obvious.

**What didn't bother me:** the text is clear and the jargon is defined. The 13-month figure for money-market funds versus 12 months for makam is explained.

## (3) Trust

**More:**
- The numbers I checked add up.
- Claims are tagged with source codes such as TXI-01 and BANK-18, and rule counts.
- It clearly labels what is an assumption ("הנחה של האתר", the site's assumption).
- It flags its own gaps with "שאלה פתוחה" (open question) and has a page called "מה האתר עוד לא מכסה" (what the site doesn't cover yet).
- It says openly when sources conflict.
- The footer says "אתר אישי, לא מסחרי, בלי קישורי שיווק" (personal, non-commercial, no marketing links), and "נבדק ב־07.11.2026" (checked on 07.11.2026), which is today.

**Less:**
- No author or credentials are named.
- The yield is invented.
- A few fee figures aren't explained.
- The tax rate is disputed.
- The site admits it hasn't worked out some mechanics.

Overall I'd trust it as a well-made explainer, not as a source of numbers I'd act on.

## (4) What I'd do next

1. **Check today's real makam yields** on the Tel Aviv Stock Exchange (TASE) site or the Bank of Israel site. I'd look for a series that matures just after the date I need the money, so I can hold it to maturity and avoid price risk. I'd keep in mind that the last trading day is 3 trading days before maturity.
2. **Ask my own bank** for its buy commission on makam, its minimum commission, and confirm it charges no custody fee on makam.
3. **Compare after tax and fees** against what my bank offers for a deposit of *the same few months*, not a one-year deposit, and against a money-market fund. I'd check whether early withdrawal from the deposit would cost me anything.
4. **Use the "שחקו עם המספרים שלכם" (play with your own numbers) panel**, if it lets me enter my own amount, yield and fees. If it doesn't, I'd do the arithmetic myself, as above.
5. **Make sure my amount clears the ₪10,000 face-value minimum** in continuous trading.

On a ₪10,000 example, the difference between makam and a good deposit is roughly a few dozen shekels over a few months. So the decision mainly depends on my bank's commission and on the real yield on the day I buy.
