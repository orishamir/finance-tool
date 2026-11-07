# new-pc

Who: You are 33, on a computer. You have savings in a bank deposit and want to start investing in the S&P 500. You have never opened a securities account and do not know which bank or investment house to choose.

Shots: research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-00.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-01.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-02.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-03.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-04.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-05.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/A-open-pc-06.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/B-leumi-pc.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/C-fold-open-pc.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/D-leumi-cost-pc-00.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/D-leumi-cost-pc-01.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/D-leumi-cost-pc-02.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/D-leumi-cost-pc-03.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/F-kesem-top-pc.png, research/audit/2026-11-06-indices-pricing/readers/round3/shots/F-kesem-ETF-64-pc.png

I read all 15 screenshots. There was no set E, so I've skipped 2f.

## 1. My decision

**I'd go with Psagot (פסגות) as the account and "ילין לפידות מחקה S&P 500 (4D)" (5139282) as the fund.** I'm fairly sure about the fund type and about Psagot over most of the list. I'm less sure that Psagot beats every other option for me in particular.

What I based this on:
- **The pair box at the top.** "אחד מ־3 הזוגות הזולים ביותר לתוכנית שלכם" shows Psagot plus this fund leaving **86,492 ₪** after 10 years. The next pair is Psagot plus "אלטשולר שחם מחקה" at 86,449 ₪, only 43 ₪ less. The text under the boxes says the differences between the 3 cheapest pairs "קטנים מכדי לקבוע איזה מהם זול יותר, ולכן הם שקולים". So the fund choice barely matters, and the Altshuler fund would be fine too.
- **The account list ("כל החשבונות").** Psagot is first, costing 1,057 ₪ over 10 years. Everyone else costs 4,500 ₪ or more.
- **Set B.** Even when my friend picked Leumi as their existing bank, Leumi moved up to 2nd place but still left 83,396 ₪, about 3,100 ₪ less than Psagot.
- **The fund list.** I picked an Israeli "קרן מחקה" with no currency hedging ("בלי נטרול מט״ח"). The foreign-listed funds show "עוד לא נאסף" or "אין מחיר כאן", so I can't compare them.

What lowers my confidence:
- Several banks have exceptions marked "לא בחישוב: מחיר אחר לצעירים…". I'm 33 and don't know if "צעירים" includes me.
- Meitav has "מחיר אחר למצטרפים חדשים עד 30.11.2026", and Altshuler and Excellence have their own special prices. Any of these could be cheaper than the list shows.
- Psagot's box offers "קיבלתם מחיר אחר? הזינו אותו", which suggests prices can be negotiated.
- Interactive Brokers and אינטראקטיב ישראל show "אין נתון".

## 2. Line by line

**a.** The full line: "השורה של כל בנק סופרת גם את דמי ניהול העו״ש שלו, למי שיפתח שם חשבון עו״ש כדי להשקיע. בית השקעות לא דורש עו״ש אצלו."
- **Whose figures include the fee:** the banks (Leumi, Hapoalim, Discount and so on). Their figures assume I'd open a new checking account there just to invest.
- **Whose don't:** the investment houses (Psagot, Altshuler, Meitav, Excellence), because they don't need one.
- **Does it tell me to do anything?** Not directly. The box above it, "הבנק שבו כבר יש לכם חשבון עו״ש", defaults to "לא באחד מהבנקים האלה", so the implied step is to choose my own bank. My savings are already in a bank, so I should do that. Set B shows the effect: Leumi's cost drops from 5,283 ₪ to 4,541 ₪, with the note "השורה של לאומי לא סופרת את העו״ש, כי תשלמו עליו בכל מקרה. השורות של שאר הבנקים סופרות אותו."
- **What tripped me:** "למי שיפתח שם". It made me wonder whether the fee is counted even for someone who already has an account there. Set B answers that (it isn't), but only after you change the box.

**b.**
- **Top chart:** red means only the securities-account fee. That makes sense, because both pairs there use Psagot, which has no checking account. I couldn't even see a red segment in those bars.
- **Account list:** red means the securities-account fee plus the checking-account fee, combined into one colour.
- **Does the difference make sense?** Yes, because that list includes banks. The problem is that I can't tell how much of a bank's red is the checking fee. For the investment houses, the big red bars (Altshuler, Excellence, Meitav) can only be the securities fee.
- **A second colour problem in the top chart:** "המרת מטבע" is pink and "מס" is magenta, and they look almost the same. The large 5,703 bar is tax, but I first read it as currency conversion.
- **A key item I didn't understand:** the grey "העמלות זו על זו".

**c.** In plain terms: when the bank changes my shekels to dollars, it may use a worse rate than the market rate, on top of the conversion fee.
- **For the three companies named at the end** ("אי.בי.אי, אלטשולר טרייד ומיטב טרייד"), the gap is included in their figures, at its maximum ("החישוב סופר את הפער בגובה התקרה").
- **For everyone else** it is not included, because their price lists set no maximum.
- **What this means for the comparison:** those three are charged their worst case, while the others are charged nothing for this gap. That makes the others look cheaper than they may really be.
- **Is it relevant to my choice?** The heading is "מה לא נכנס למחיר של קרן שנקנית בחו״ל". My fund is Israeli, so I think this doesn't affect me, but the page doesn't say so outright.

**d.** Left out: fees charged by foreign bodies (exchange, transfer, authorities) that the bank passes on to me. The text says they're left out "גם כשהתעריפון כותב להן תקרה". So a fund bought abroad can cost more than shown.
- **What I trip on:** this is the opposite rule from point c. There, a written maximum meant the cost was included. Here, a written maximum still means it's left out.
- **"יוצא מן הכלל":** One Zero (וואן זירו) charges "על דיבידנד סכום קבוע בשביל הגוף ששומר את ניירות הערך", and that charge is included at its maximum. I don't understand how a "סכום קבוע" (a fixed amount) can also have a maximum ("תקרה"). I'm also not sure it applies to funds that reinvest dividends ("Accumulating").

**e.**
- **"דמי ניהול חשבון עו״ש בחודש 5.50 ₪":** this is Leumi's monthly checking-account fee, counted every month for 10 years. That roughly explains the 742 ₪ difference between 5,283 and 4,541.
- **Where the number comes from:** I can't tell. Unlike the rows above it, it has no "פרמטר של האתר" tag. The only related source is "התקרות החדשות לעמלות העו״ש… BANK-35", which is about future maximum fees, not about Leumi's current price list. The amber box calls it "דמי הניהול של היום". So I don't know if 5.50 is Leumi's actual price.
- **Another oddity in the same box:** my own plan values (10,000, 500, 10 years, 7%) are tagged "פרמטר של האתר", as if the site had set them rather than me.
- **The amber box:** from July 2027, a Bank of Israel order caps checking fees by the number of actions per month. With up to two actions a month the cap is lower than 5.50, so Leumi's figure may be too high. The site doesn't yet know how an "action" will be counted ("עוד לא ידוע איך הכללים החדשים סופרים פעולה"), so it keeps today's fee for all 10 years.
- **Should I do anything?** Nothing urgent. At most it's about 5.50 ₪ a month, so it doesn't overturn Psagot's lead. If Leumi is my bank, the fee isn't counted for me anyway.
- **"רשומות · צו הבנקאות (שירות ללקוח) (פיקוח על..."**: I believe רשומות is Israel's official government gazette, and this is the banking (customer service) order published there. The title is cut off with "…", so I can't read the full name.
- **Labels I don't understand:** "F-63", "BANK-35", "TXS-06" and the TXG-04 line "גיל הוצאות מדרגות נמוכות על כל הכנסה החייבת". I don't know what these mean.

**f.** No set E, so skipped.

**g.** The blue line under ETF-64 points to a filing on מאיה, which it describes as "מערכת ההודעות של הבורסה" (the stock exchange's announcement system). The filing is Kesem's "דוח שנתי" (annual report) for the fund "קסם KTF (4A) ת״א 35", number 5124490, dated 30.6.2026, page 2.
- **Can I read the fund's name?** Yes, but with effort. The quote marks and the "35" are out of order on screen: "35 and its quote mark sit at the far left, cut off from ת״א, so "ת״א 35" looks scrambled.
- **Other things that don't fit:**
  - A report dated 30 June is called "שנתי" (annual), but 30 June is mid-year.
  - It's a Tel Aviv 35 fund (5124490), cited on a card about how the Harel, Kesem, IBI, MTF, Mor and Tachlit funds track their index. It is not Kesem's S&P 500 fund (5124482).
  - In the ETF-65 source next to it, "ETF" is split from the rest of the fund name by a line break.

## 3. Other things that confused or bothered me

- **The "לא בחישוב" exceptions** (young people, students, discharged soldiers, new joiners) appear on almost every bank. None of them says what age counts as "young".
- **Some bars are cut with slashes** (Altshuler, Excellence, Meitav). I only understood why from a small key item, "הפס נחתך".
- **Two different "cost" numbers for Psagot:** 6,876 ₪ in the top chart and 1,057 ₪ in the list. The first includes tax and fund fees; the second is the account only. It took me a while to work that out.
- **The ranking reshuffles when you pick a bank** (Leumi goes from 3rd to 2nd). That makes sense once explained, but it's easy to miss.
- **The worked example starts from "ירושלים" and the MTF fund** for no stated reason.
- **What I expected and didn't find:**
  - Prices for Interactive Brokers.
  - Any mention of minimum fees or account-opening fees.
  - A clear statement of whether the currency-conversion warnings apply to an Israeli fund like the one I chose.
