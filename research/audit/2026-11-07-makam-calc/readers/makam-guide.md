# makam-guide

Who: You are 38, you read Hebrew fluently, you keep most of your savings in a bank deposit, and you have heard of makam but never bought one.

Shots: research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-part0.png, research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-part1.png, research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-part2.png, research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-part3.png, research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-part4.png, research/audit/2026-11-07-makam-calc/reader-shots/guide_makam-1440-redemption.png

I read all six screenshots. Here is my take as someone who might park savings for a few months.

## 1. What the page tells me, and what it can and can't do for me

**What it tells me:**
- **What makam is.** It's a loan to the state for up to a year, sold by the Bank of Israel. You buy it below 100 and get 100 back at redemption (הפדיון). The difference is your return, and for tax it counts as interest. A new series comes out every month, so about 12 are trading at any time. If you hold to the end, you know your return on the day you buy.
- **How it compares with what I use now.** Against a bank deposit (פיקדון בבנק), both are taxed at a fixed 15%. Makam can be sold on any trading day with no lock-in and no early-exit penalty (קנס שבירה). The catch is that you pay a fee to buy, and a fee to sell if you don't hold to the end. It also says a bank cannot charge securities custody fees (דמי ניהול פיקדון ניירות ערך) on makam. Against a money-market fund (קרן כספית), makam is better if you hold to redemption and the fee is small relative to the amount.
- **How to buy.** You need a securities account (חשבון ניירות ערך) at a bank or investment house. During continuous trading the minimum order is 10,000 ₪ face value. The last trading day is 3 trading days before redemption.
- **Tax.** Hold to the end and you pay 15% on the discount (הניכיון). Sell early and you pay 15% on the whole gain. Tax is taken at source, and makam alone doesn't force you to file an annual tax return.
- **Risks.** Makam is not linked to inflation (לא צמוד למדד). If you sell early, you get that day's price, which can be below what you paid.
- **A calculator.** It shows what's left of 10,000 ₪ after fees and tax if you sell at a given month or hold to redemption.

**What it can't do for me:**
- **It doesn't give a real current yield.** Under the calculator it says "התשואה היא הנחה של האתר, לא ריבית שפורסמה" (the yield is the site's own assumption, not a published rate). The 3.25% and the buy price of 96.85 are made up for the example. So the page can't tell me what makam actually pays today.
- **It doesn't name the broker.** The fees come from one investment house's price list, "the one that leaves the most" out of 14 the site collected. It doesn't say which one, and my own bank's fees will be different.
- **It doesn't tell me what to do.** It doesn't say which series to buy or whether makam beats my deposit right now.
- **Some questions are left open.** It openly marks several things "שאלה פתוחה" (open question): the unit size of makam, how ordinary people can join the Bank of Israel auction, and how a sale price splits between discount and capital gain.

## 2. Confusing or contradictory parts, and checking the numbers

**Re-doing the 6-month example (screenshot 2): it adds up.**
- 10,000 × 98.41 / 96.85 ≈ 10,161, which matches the gain of 161.10 ₪ (רווח עד עכשיו).
- 96.85 growing at 3.25% a year for half a year gives ≈ 98.41, and for a full year gives ≈ 100. That's consistent.
- Tax: 161.10 − 6.07 = 155.03, and 15% of that is 23.25. Correct.
- What's left: 10,000 + 161.10 − 23.25 − 16.14 (fees) = 10,121.71, rounded to 10,122. Correct.

**Re-doing the 12-month example (screenshot 6): it nearly adds up.**
- Tax: 15% × 324.55 = 48.68. Correct.
- What's left: 10,000 + 324.69 − 48.68 − 19.29 = 10,256.72, rounded to 10,257. Correct.
- One small gap: from the prices shown, 10,000 × 100 / 96.85 gives a gain of about 325.25 ₪, not the 324.69 shown. That's about 56 agorot. It's probably because the buy price is rounded to 96.85 on screen. It doesn't matter in money terms, but someone checking will notice.

**Things that confused me:**
- **Fees treated differently for tax.** At 6 months, fees are subtracted before the 15% tax. At redemption they aren't: the line says the fees "מתקזזים" (are offset) only against a tiny 0.14 ₪ of "other gain". The full discount is taxed with no deduction. The column title also quietly changes from "מס על רווח הון" (capital-gains tax) to "מס על הניכיון" (tax on the discount). The page never explains in plain words that, for tax purposes, selling early lets you deduct fees and holding to the end doesn't. I only understood it by redoing the sums. And where does the "0.14 ₪ other gain" come from? It isn't explained.
- **"No custody fees", yet the calculator charges them.** The text near the top says a bank can't charge "דמי ניהול פיקדון ניירות ערך" on makam. Then the calculator charges 6.07 ₪ of "דמי משמרת" (custody fees). The fees line does explain that the ban applies only to banks and the example price list belongs to an investment house. Still, it's odd that the "best" option charges a fee my bank couldn't.
  - The same 6.07 is called "דמי ניהול ודמי משמרת" (management and custody fees) in the tax line, but only "דמי משמרת" in the fees line.
  - It's 6.07 at 6 months and 9.14 at 12 months, which isn't proportional. That's unexplained.
- **Up to a year, or 13 months?** The page says makam is "עד שנה" (up to a year) and that 12 series are trading. Then, in "למה משתמשים בזה", it says a money-market fund can hold makam "שנותרו לו עד 13 חודשים" (with up to 13 months left). How can a one-year product have 13 months left?
- **Short government bond vs makam.** "אג״ח ממשלתית קצרה" (short-term government bond) is said to be "a separate security" from makam. But its glossary definition (up to a year, no interest, buy below what you get back) reads exactly like makam. I can't tell what the actual difference is.
- **"Doesn't pay interest", yet it's interest.** The first section says "המק״מ לא משלם ריבית" (makam doesn't pay interest), then that for tax it counts as interest. "שווה לדעת" explains this, so it's fine on a second read.
- **Spelling.** The page mostly writes מק״מ, but in "שווה לדעת" it's מק״ם (with a final mem). That's cosmetic.
- **The tax card header.** The middle card in "מיסוי" is headed "כל עוד הכסף בפנים" (while the money is in). Its text is about tax at redemption and buying a new series with the net amount. I didn't quite follow what "in" meant.

**What didn't bother me:**
- The legend for source numbers vs calculated numbers vs glossary terms (top of the page).
- The glossary table.
- The yellow and red boxes in "מיסוי". The red box is about age 60+, so it doesn't apply to me at 38.

## 3. Trust: less or more?

**Less:**
- **An unfair comparison.** At the bottom of the calculator, the made-up 3.25% for makam sits right next to real deposit rates the site collected: "פיקדון לשנה ... משלם 1.55%–2.25%". That makes makam look clearly better on an assumption, not a fact. And it's based on only 4 deposits.
- **Anonymous.** The footer says "אתר אישי, לא מסחרי" (personal, non-commercial site). There's no author name and no stated qualifications.
- **Several unresolved points** in the text, as listed above.

**More:**
- **Sources.** Numbers link to where they come from (labels like TXI-01 and BANK-18, and the "חוקים וכללים" links).
- **Honest about gaps.** It admits what it doesn't know ("שאלה פתוחה") and has a "מה האתר עוד לא מכסה" (what the site doesn't cover yet) link. It flags a tax-authority source that disagrees with it and explains why it follows the law instead.
- **Up to date.** The footer says the data was last checked on 07.11.2026, which is today.
- **No sales angle.** "בלי קישורי שיווק" (no marketing links), and every calculator number I checked works out.

Overall I'd trust it as an explainer, not as a source of current rates or a recommendation.

## 4. What I'd do next

1. **Look up the actual current makam yields** on the Bank of Israel or Tel Aviv Stock Exchange site. I'd pick a series that matures close to when I need the money, so I can hold it to the end and avoid the risk of selling below what I paid.
2. **Ask my own bank** what it charges to buy makam, its minimum fee, and its redemption fee. I'd also confirm it really charges no custody fee on makam, and whether my account can trade securities at all.
3. **Get my bank's real deposit rate for the same few months**, plus a money-market fund's recent return. Then I'd compare all three after 15% tax and fees.
4. **Open "שחקו עם המספרים שלכם"** (try your own numbers) on the page, which was collapsed in the screenshots. I'd enter my real amount, my real time frame and the real yield instead of the site's 3.25%.

I wouldn't move money based on this page alone, mainly because its main yield figure is an assumption.
