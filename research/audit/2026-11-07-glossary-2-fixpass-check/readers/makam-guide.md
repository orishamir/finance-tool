# makam-guide

Who: You are 38, you read Hebrew fluently, you keep most of your savings in a bank deposit, and you have heard of makam but never bought one.

Shots: research/audit/2026-11-07-glossary-2-fixpass-check/reader-shots/guide_makam-1440-part0.png, research/audit/2026-11-07-glossary-2-fixpass-check/reader-shots/guide_makam-1440-part1.png, research/audit/2026-11-07-glossary-2-fixpass-check/reader-shots/guide_makam-1440-part2.png, research/audit/2026-11-07-glossary-2-fixpass-check/reader-shots/guide_makam-1440-part3.png, research/audit/2026-11-07-glossary-2-fixpass-check/reader-shots/guide_makam-1440-part4.png

I read all five screenshots. One caveat first: the screenshots seem to skip a little text where they join. The start of the "שווה לדעת" list (between shots 2 and 3) and the orange warning box (between shots 3 and 4) are partly cut off, so I may have missed a line or two there.

## 1. What the page tells me, and what it can and can't do for me

**What it explains well:**
- **What makam is.** At the top (under "מה זה"), it says makam is a loan to the state for up to a year, sold by Bank of Israel: "קונים בפחות מהסכום שמקבלים בסוף". There's no interest and no CPI linkage. A new series is issued every month, so there are always 12 series on the market.
- **How it compares with what I have now** ("למה משתמשים בזה"). Unlike my bank deposit, makam has "אין נעילה ואין קנס שבירה", and I can sell it on any trading day. The trade-off is fees when buying and when selling early, which a deposit doesn't have. It compares makam with a money-market fund (קרן כספית) and with short government bonds. It also gives a rule of thumb that matches my situation: makam is better if you hold it to redemption and the fee is small relative to the amount and the time. With "סכומים קטנים או בתקופות קצרות מאוד", the minimum fee can eat the gain.
- **Where to buy and the practical rules** ("איפה קונים ומי מנפיק"). You buy through a securities account at a bank or investment house. In continuous trading the minimum order is 10,000 ₪ face value. The last trading day is 3 trading days before redemption.
- **Tax** ("מיסוי"). It's 15% whether I hold to redemption or sell early. There's no tax benefit for depositing. If all the tax is withheld at source, I don't have to file an annual return just because of makam.
- **Risks** ("סיכונים ומה לא מוגן"). The state pays the face value, not the bank or broker. It isn't CPI-linked. If I sell early I get that day's market price, "שיכול להיות נמוך ממחיר הקנייה".

**What it can't do for me:**
- **Tell me today's real yield.** The calculator's 3.25% is labelled "התשואה היא הנחה של האתר, לא ריבית שפורסמה". The 10,000 ₪ and the timing are also "דוגמה של האתר". There are no live prices.
- **Tell me what my own bank charges.** The fees come from one price list (Psagot), chosen because it's the cheapest of the 14 collected. "אצל האחרים העמלה שונה."
- **Let me buy anything.** It's information only.
- **Answer some open questions it admits to.** How a private person's order reaches the Bank of Israel auction, and at what minimum and fee, is "עוד לא מתועד" (open question). The trading-unit size outside continuous trading isn't in the trading guide either.
- There's a collapsed "שחקו עם המספרים שלכם" box (enter your own numbers) that I couldn't see inside.

## 2. Confusing or contradictory things, and whether the numbers add up

I redid the calculator's numbers (screenshot 2, box "מה קורה אם מוכרים לפני הפדיון?", 10,000 ₪, selling after 6 months):

| Item | Shown | My check |
|---|---|---|
| Purchase price 96.85 → 100 in a year | 3.25% | 100 / 96.85 = 1.0325 ✔ |
| Price after 6 months | 98.41 | 96.85 × 1.0325^0.5 ≈ 98.41 ✔ |
| Gain so far ("רווח עד עכשיו") | 161.10 ₪ | 10,000 × (98.41/96.85 − 1) ≈ 161.07–161.20 ✔ rounding |
| Tax: "15% מ־154.96 ₪", gain minus 6.07 ₪ in fees | 23.24 ₪ | 15% × 154.96 = 23.24 ✔, but **161.10 − 6.07 = 155.03, not 154.96**. Off by 7 agorot. |
| What's left ("נשאר לכם") | 10,122 ₪ | 10,000 + 161.10 − 23.24 − 16.14 (fees) = 10,121.72 ✔ |

The figures mostly add up, but two things bothered me:
- **The 6.07 ₪ in management and custody fees ("דמי ניהול ודמי משמרות") is subtracted for the tax calculation but not from what I'm left with.** If I really pay it, I'd end up with about 10,116, not 10,122. Also, the 16.14 ₪ trading fees aren't subtracted from the taxable gain, but the 6.07 is. I can't tell why.
- **Custody fees on makam at all.** Screenshot 1 says a bank "לא יכול לגבות עליו דמי ניהול פיקדון ניירות ערך". A row in "שווה לדעת" (BANK-18) says the same. So why is there a 6.07 ₪ custody fee? The page does add "הכלל הזה חל על בנקים בלבד", and the example uses Psagot, an investment house, so maybe that's the explanation. But it never says so, and I only worked it out by putting two distant sentences together. For me this matters: it suggests buying through my bank might be cheaper on that line.

**The chart** shows the sale price rising smoothly from 96.85 to 100. The risks section says an early sale gets the market price, which can be below what I paid. The chart is an idealised path, and nothing next to it says so.

**Comparing with a deposit** (screenshot 2, bottom of the box): "פיקדון לשנה... משלם 1.55%–2.25% בשנה; ב־3 מתוך 4 הפיקדונות האלה אין אפשרות שבירה." Those are collected real rates set against an *assumed* 3.25% for makam, so the comparison isn't apples to apples.

**The tax section is heavy going.** The orange box ("מקור אחד סותר...") and the red box ("מגיל 60...") are about a conflicting Tax Authority line and a relief for people over 60. Neither applies to me. Since it's 15% either way, the long interest-versus-capital-gain explanation ("רווח הון ריאלי", "בלי ניכוי של האינפלציה") makes no practical difference to me. It still took effort to work that out.

**Small wording issues:**
- In the money-market fund paragraph (screenshot 1), "קרן כספית יומית פטורה נזילה בכל יום מסחר" reads awkwardly. I'm not sure what "פטורה" refers to.
- The same paragraph says a money-market fund pays tax only "על הרווח הריאלי", while makam is taxed on the nominal gain. That could matter, but the page never puts a number on it.
- "קרן כספית יכולה להחזיק מק"מ שנותרו לו עד 13 חודשים" is odd when makam is described as up to one year.

Things that didn't bother me: the glossary at the bottom ("מונחים") is clear and matches the body text, and the side menu makes the page easy to navigate.

## 3. Trust

**More trust:**
- It openly labels its assumptions ("הנחה של האתר", "דוגמה של האתר").
- It marks numbers as sourced or calculated, and you can click a number to see where it came from.
- It tags open questions ("שאלה פתוחה", "פרטים") instead of guessing.
- It points out where sources conflict.
- Rule references (TXI-01, BANK-18) and counts like "חוקים וכללים · 6" appear throughout.
- It explains why it chose Psagot.
- The footer says "אתר אישי, לא מסחרי, בלי קישורי שיווק", links to "מה האתר עוד לא מכסה", and says the data was checked on 07.11.2026, which is today.

**Less trust:**
- The small arithmetic slip (154.96 vs 155.03), and the 6.07 ₪ fee that is deducted for tax but missing from the final amount.
- It's a personal site with no named author or expert.
- The headline example uses the single cheapest broker, so the result looks better than typical.

Overall I trust it as a careful explainer, not as a source for numbers I'd act on.

## 4. What I'd do next

1. **Get the real yield.** Look up the current makam yield for a series maturing near when I'll need the money, from Bank of Israel or the TASE site. Buying a series that matures at the right time means I hold to redemption and avoid selling at market price.
2. **Ask my own bank** for the commission on buying makam and on redemption, any minimum fee, and confirm in writing that there's no custody fee. Then redo the page's sum with my amount and my months.
3. **Compare against two alternatives with real numbers:** my bank's breakable short deposit, and a money-market fund (fees, plus tax only on the real gain).
4. **Go back to the site** to use "שחקו עם המספרים שלכם" and to read the securities-account page and the "מה האתר עוד לא מכסה" page.
5. If makam still comes out ahead after fees, buy it through my bank so I don't open a new account.

I wouldn't rely on the 10,122 ₪ figure or the 3.25% assumption to make the decision.
