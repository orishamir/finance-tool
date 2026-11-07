# ta90-careful

Who: You are 38, live in Israel, read Hebrew natively, and want to start saving a fixed sum every month for the next 20 years in a fund that tracks the Tel Aviv 90 index (ת"א 90), through an Israeli trading account. You want the cheapest sensible choice and read the small print.

Shots: research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-01.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-02.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-03.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-04.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-05.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-06.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-07.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-08.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-09.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440/page-10.png, research/audit/2026-11-07-indices-data/check5/shots/indices_ta90-1440-sheet.png

I went through all 11 screenshots. The last one (11) is the page after clicking "+0.02%".

## 1. Which fund I'd pick, and why

**I'd pick "הראל מחקה (4A) ת"א 90", fund number 5130638, bought through a "פסגות" trading account.** Only tentatively, because the page never calculated my actual plan.

These lines brought me there:
- **Top card:** "אחד משני הזוגות הזולים ביותר לתוכנית שלכם / פסגות / הראל מחקה (4A) ת"א 90 5130638 / ₪86,066".
- **Fund header:** "דמי ניהול: 0% קבוע, 0.1% משתנה, 0.02% נאמן". That's 0.12% a year in total.
- **Fund list:** "+0.02% בשנה · 3 שנים" under "מול מדד ברוטו". It has three years of record, while the nearest rival has one.
- **Fund tags:** "מחזיקה את המניות" and "צבורה" (holds the actual shares, reinvests dividends). Both suit a 20-year hold.
- **Account list:** "פסגות ★ הזול 86,066 / ₪1,049". On the account card: "מה החשבון גובה ב־10 שנים: ₪1,049".
- **Step-by-step chart:** "נקודת התחלה … +6,070 (חשבון אחר) … +2,464 (סוג קרן אחר) = 86,066", followed by "אחרי המדרגות האלה אין בחירה אחת שמשאירה יותר".

**Caveat:** every figure is for the defaults: "סכום היום 10,000", "הפקדה חודשית 500", "שנים 10". My plan is 20 years, a monthly amount only, and no lump sum. The footnote says "בתשואה של 0% או של 10% הסדר משתנה ב־3 מקומות", so the ranking does depend on the inputs. Over 20 years, yearly percentage charges (custody fee, the fund's "משתנה" fee) grow against flat per-trade fees. I'd have to re-run it with my numbers before committing.

## 2. Things I misread, couldn't understand, or had to guess

- **"(4A)" and "(40)" in fund names:** I guessed this is the regulator's exposure code (share exposure, currency exposure). The page never explains it.
- **"מול מדד ברוטו":** I took it as the fund's yearly return compared with the index including gross dividends. That was only clear after opening the panel.
- **"לעומת הקרן שהאתר בחר":** shekels compared with the fund the site chose. That clashes with "האתר לא ממליץ על מדד": it won't recommend an index, but it does choose a fund.
- **"0% קבוע, 0.1% משתנה":** I assume "משתנה" means a variable fee the fund manager can change. That matters over 20 years and isn't explained.
- **"העמלות זו על זו" (grey legend item):** "fees on fees", compounding? I couldn't tell, and I never saw a grey piece with a number on it.
- **"נשען על כלל מס פתוח: מוצג ולא מדורג":** "relies on an unsettled tax rule: shown, not ranked". I saw no row carrying its lock icon.
- **"הצעד הכי גדול שנשאר, עוד לא נלקח":** a legend item with nothing on screen to match it.
- **"הפס נחתך: הסכום ארוך מהשטח":** the slashed bars, meaning the bar was cut because it didn't fit. Fine once I found the legend.
- **"F-92" and the "מחושב" tag in the panel:** an internal formula ID, which tells me nothing. I read "מחושב" as "calculated by the site, not reported by the fund".
- **"−0.16% ב־2025" vs "בשנה · 3 שנים":** I eventually understood that one fund has a single year of data and the others three.
- **"קרן מחקה 1 / קרן סל 5":** filter chips with counts. I first took them for fund names.
- **"אין קרן חוץ שמתמחת בישראל":** "שמתמחת" isn't a word. It must be a typo for "שמתמחה".
- **Tax:** the page never says how it's worked out. From the numbers, I guess it's 25% of the real gain after inflation, in today's money.
- **"אי.בי.אי.":** it's both a fund manager (fund 1209444) and a broker (#11 in the account list). Easy to confuse.

## 3. The words in the selected row

The far-left cell says **"אחת מ־2 השקולות"**: "one of the 2 equivalent ones". They refer to **"אי.בי.אי. סל (4A) ת"א-90 1209444"**, the next row, which shows **"₪ −423"**. They match the line under the top cards: "ההפרש קטן מכדי לקבוע איזה זוג זול יותר, ולכן שני הזוגות שקולים".

So the site calls the two "equivalent", yet prints a 423-shekel gap and labels the selected one "הזול ★" in the account list. The next fund, "הראל סל", shows −2,442 and is not called equivalent.

## 4. The chart "כמה זה עולה לכם ב־10 שנים"

The parts don't quite add up to the totals:
- **Top bar (פסגות + הראל מחקה):** 5,562 + 691 + 354 + 693 = **7,300**, but the total says **₪7,302**.
- **Bottom bar (פסגות + אי.בי.אי.):** 5,421 + 1,261 + 352 + 688 = **7,722**, but the total says **₪7,725**.

The account part of the top bar is 354 + 693 = 1,047. Elsewhere the account cost is ₪1,049 (account card, account list, and the step chart: 7,608 − 6,602 + 43). Some 2–3 shekels are missing from the coloured parts, maybe an unlabelled sliver.

The comparison line underneath roughly works:
- "החשבון ₪7 יותר": 1,047 − 1,040 = 7.
- "הקרן ₪571 פחות": 1,261 − 691 = 570, not 571.
- "המס ₪141 יותר": 5,562 − 5,421 = 141, correct.

Together 7 − 571 + 141 = −423, which matches the totals (7,725 − 7,302) and the −423 in the list. These are small rounding slips, but they shouldn't appear on a page selling exactness.

Also, tax is the biggest "cost" by far (5,562), but no choice on this page avoids it. Its pink segment dominates the bar and visually shrinks the fee differences, which are the point.

## 5. The opened panel

**What the top figure is:** "+0.02% בשנה · 3 שנים / מול מדד ברוטו". The text explains:
- The gross index counts company dividends before dividend tax ("מדד ברוטו סופר את הדיבידנדים של החברות לפני המס על דיבידנדים").
- Returns are in shekels, from the fund's annual reports ("מהדוחות השנתיים של הקרן").
- The fund's return is after all its costs ("אחרי כל העלויות שלה").
- The average includes years in which the fund beat the index ("גם שנים שבהן הקרן הקדימה את המדד").
- For the shekel cost, lagging beyond the management fee is added as a cost, and beating the index isn't counted as profit ("פיגור מעבר לדמי הניהול נוסף לעלות, והקדמה על המדד לא נספרת כרווח").

**How it was worked out:** "נוסחה: חישוב הפער של הקרן מהמדד, לפי הדוחות שלה" (F-92). Under "ערכים שנכנסו לחישוב" it lists:
- 2025: fund 46.53%, ת"א 90 46.56%.
- 2024: fund 30.83%, ת"א 90 30.86%.

**The problem:** both visible years show the fund **0.03% behind** the index, yet the headline says **+0.02% ahead**. To average +0.02% over three years, the hidden third year would need the fund about 0.12% ahead. The list is cut off at 2024 with no sign that it scrolls, so I can't check that. As shown, the headline figure is contradicted by its own inputs.

## 6. Things that looked wrong, contradictory, or untrustworthy

- **The defaults aren't my plan.** The title promises "לאורך זמן", but every number is for 10 years with a ₪10,000 lump sum. Nothing in the results warns that a different horizon could change the winner.
- **The panel contradicts its headline.** "+0.02%" sits over two visible years that both show −0.03%.
- **The runner-up's case is thin.** "אי.בי.אי. סל" is "equivalent" and about ₪2,000 ahead of every other ETF almost entirely because of one year of data ("−0.16% ב־2025") against three years for the rest. One good year from a new fund shouldn't put it level with the winner.
- **"שקולים" vs "הזול ★" vs "−423".** The page can't decide whether the gap matters.
- **The chart parts don't sum to the totals,** and 1,047 vs 1,049 for the same account cost (section 4).
- **The step chart's y-axis starts at 60,000.** Only the first bar shows a break mark, so the gaps look several times bigger than they are.
- **The sensitivity section is close to meaningless:** "אם תגדילו כל מספר ב־20%, הכי משנה מספר השנים: ₪18,915". Two more years also means 24 more deposits, so this doesn't measure costs at all.
- **Where can I buy the fund?** The note "יש ספק אם קסם ETF … נמכרת שם: וואן זירו, Interactive Brokers" covers only the starting-point ETF. Nothing says whether "וואן זירו", ranked #2 with my chosen mutual tracking fund ("הראל מחקה"), actually sells it.
- **Unclear special prices.** "3 מתוך 15 … מפרסמים לה מחיר נמוך יותר [להוראת קבע], והוא שנכלל בחישוב" doesn't say which 3. At 38 I'm outside the youth and soldier prices. I can't tell whether "מחיר אחר למצטרפים חדשים עד 30.11.2026" (מיטב טרייד) would apply to me, and it isn't included.
- **Dead or unexplained parts.** Some legend items match nothing on screen. "פירוט" for the 3 order changes isn't shown. "חזרה לנקודת התחלה" looks disabled.
- **Small inconsistencies.** The account card says "התעריפון נאסף ב־04.11.2026", while elsewhere it says price lists were collected "בין 04.11.2026 ל־07.11.2026". There's also the typo "שמתמחת".
