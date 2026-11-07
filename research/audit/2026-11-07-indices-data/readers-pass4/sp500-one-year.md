# sp500-one-year

Who: You are 35, live in Israel, read Hebrew natively, and buy funds through your broker. You want a fund that tracks the S&P 500 and want to know which one follows the index most closely. You read numbers carefully.

Shots: research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-01.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-02.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-03.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-04.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-05.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-06.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-07.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-08.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-09.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-10.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-11.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440/page-12.png, research/audit/2026-11-07-indices-data/readers-pass4/shots/indices_sp500-1440-sheet-one-year.png

I went through all 13 screenshots in order. Answers below.

## 1. Which fund I'd pick, and why

**I'd pick MTF סל S&P 500 (4D), fund number 1150333.** It is the unhedged fund whose figure under "מול מדד נטו" is closest to zero: **"+0.01%" with "בשנה · 4 שנים"**. That is the right test for "follows the index most closely". The highest figure is the wrong test, because a fund that beats the index by 0.65% a year is not tracking it closely either.

My runner-up is **iShares Core S&P 500 UCITS ETF USD (Accumulating) 1159250**, at "+0.24%" with "בשנה · 10 שנים". It has the longest record, and its gap is steady and in my favour. If the site's cost math is right, it is also only "−213 ₪" behind the site's pick.

Lines that got me there:
- The column heading "מול מדד נטו", and the explanation on screenshot 6: "בכמה הקרן, אחרי כל העלויות שלה, הקדימה (+) או פיגרה (−) אחרי המדד שלה".
- The figures in that column: MTF "+0.01%", ילין לפידות סל 1201656 "+0.03%" (but "ב־2025", one year only), מור "+0.18%", Vanguard "+0.20%", iShares "+0.24%".

**I would not take the site's highlighted fund, ילין לפידות מחקה S&P 500 (4D) 5139282** ("בחירת האתר"). It wins on cost, not on tracking. Its "+0.37%" is a single year, and the page itself says the top three are tied on cost.

**What gives me pause about MTF:** a 4-year average of +0.01% could hide years of +1 and −1. The page never shows the year-by-year gap for each fund. The box about the hedged fund admits unhedged funds strayed "−0.9 עד +1.4 נקודות" from their index. MTF also costs "−2,344 ₪" over 10 years compared with the site's pick.

## 2. Labels and figures I misread, couldn't understand, or had to guess

- **"מול מדד נטו"**: at first I read a higher number as better. It only makes sense as "closer to 0 = closer tracking", and the page never says so. It ranks funds by cost, not by this column.
- **"(4D)" / "(4A)"**: never explained. From the context ("מנוטרלת מט"ח" goes with 4A) I guessed 4D = unhedged and 4A = currency-hedged.
- **"ב־2025" vs "בשנה · 4 שנים" vs "בשנה · 10 שנים" vs "אין שנה מלאה"**: these sit in the same column but cover different periods. I only worked that out by reading the small grey lines.
- **"פיגור מעבר לדמי הניהול נכלל בעלות, והקדמה על המדד לא נספרת כרווח"**: my guess is that lagging the index beyond the fee is added to the fund's cost, while beating it earns no credit in the ranking. I'm not sure. If I'm right, the "+0.37%" doesn't help ילין's rank at all, which makes it odd to show it so prominently.
- **"נוסחה: חישוב של האתר F‑92"** (in the panel): meaningless to me. It's an internal code.
- **The "מחושב" badge** (in the panel): I guessed it means the site computed this number, not that the fund reported it.
- **"כמה דרכים יחד"** tag: I guessed it means the fund mixes replication methods (holding the shares plus swaps?). Not explained.
- **"נשען על כלל פתוח"** and **"מס בצבירה: לא ידוע"** (Invesco): I couldn't tell what tax risk I'd actually be taking.
- **"מס גם על שינוי המטבע"**: I guessed it means Israeli funds are taxed on the shekel gain, including the part that comes from the dollar moving.
- **"עם נטרול מול בלי נטרול, בנקודות אחוז"**: the heading says percentage points, but the cells show "%" (e.g. "−13.6% עד −14.4%").
- **"התשואה בשנה היא לפני אינפלציה"** alongside **"בכסף של היום"**: I had to work out that the 7% is nominal and the results are shown after inflation.
- **The ↻ icon next to fund numbers and the dotted underlines**: unexplained.
- **"SPTR500N"**: the label doesn't say whether this is in dollars or shekels. I only knew it was shekels because 17.4% in dollars with the dollar down 12.5% comes to about 2.7%.

## 3. The line above the list of funds

**"● בלי נטרול מט"ח · 20 קרנות"**, with the badge **"$ חשיפה לדולר"**. It says these 20 funds are not currency-hedged, so in shekels they move with both the index and the dollar. The one hedged fund is listed separately further down ("עם נטרול מט"ח · קרן אחת", הראל מחקה S&P 500 (4A), "−2.44%").

**Yes, it matters.**
- It tells me the "מול מדד" figures here are measured against the index converted to shekels. That's fair for unhedged funds.
- The hedged fund's "−2.44%" mostly reflects the hedge's cost and the currency effect, not tracking skill. It isn't comparable to the 20 above it.
- I'm fine with dollar exposure, so I stay in this group.
- **"20" is inflated.** iShares Core S&P 500 UCITS ETF (Acc) appears twice: once as 1159250 on the Tel Aviv exchange, and once as IE00B5BMR087 bought abroad. It's the same fund with the same "+0.24% בשנה · 10 שנים". IVV, VOO and the Dist versions are marked "לא מושווה", so they tell me nothing about tracking.

## 4. The opened panel

- **Top figure, "+0.37%"**: in 2025, after all its costs, the ילין לפידות 5139282 fund returned 0.37 percentage points more than the net S&P 500 index. The panel shows the arithmetic: "תשואת הקרן ב־2025: 2.98%" minus "תשואת S&P 500 (SPTR500N) ב־2025: 2.61%".
- **The words right after it, "ב־2025"**: it covers **one calendar year, 2025, and nothing else**. It is not an average and not a multi-year record. The source line says it comes from the annual report ("דוח שנתי… תאריך הדוח 31 בדצמבר…"; the text is cut off).
- **How old the data is**: today is November 2026, so the number is about 10 months old and ignores everything in 2026.
- **The grey "מחושב" badge** next to it says the site computed this number; the fund didn't publish it.

## 5. What looked wrong, contradictory, or untrustworthy

- **The column compares different periods.** One-year figures (ילין +0.37%, אלטשולר +0.32%, ילין סל +0.03%) sit next to 4-year and 10-year averages, with nothing visual to flag it. Anyone skimming the column is comparing things that can't be compared.
- **The page says it's a tie, then picks a winner anyway.** It says "ההפרשים בין 3 הזוגות הזולים ביותר קטנים מכדי לקבוע איזה מהם זול יותר, ולכן הם שקולים", yet it still stamps one fund "בחירת האתר" and "★ הזול". The gap is "−43 ₪" on about 86,000 ₪ over 10 years.
- **It says it doesn't recommend, while labelling a pick.** "האתר לא ממליץ על מדד" appears twice, and the list still has a "בחירת האתר" label and a column "לעומת הקרן שהאתר בחר".
- **The ranking depends on the assumed return.** The footer admits: "בתשואה של 0% או של 10% הסדר משתנה ב־6 מקומות". So the order of the list depends on the 7% guess.
- **There's no real tracking measure.** It shows only the average gap (tracking difference), never year-to-year volatility (tracking error), even though the page itself mentions swings of "−0.9 עד +1.4 נקודות". For someone whose goal is closeness, that is the missing number.
- **Several funds beat a net index after fees** (+0.35%, +0.43%, +0.65% a year for הראל מחקה). For a passive tracker that is either a withholding-tax effect or a measurement artefact, such as the timing of currency conversion. The page doesn't explain it.
- **Account fee doesn't match.** Psagot "מה החשבון גובה ב־10 שנים: 1,057 ₪", but the cost bars show 699 + 356 = 1,055 (ילין) and 698 + 356 = 1,054 (אלטשולר).
- **Tax tags are inconsistent.** Two similar Irish accumulating ETFs are tagged differently: iShares 1159250 "אין מס בצבירה", Invesco "מס בצבירה: לא ידוע" + "נשען על כלל פתוח".
- **Dates don't line up.** The dollar rate is dated "06.11.2026", the price lists "בין 04.11.2026 ל־07.11.2026", and the tracking numbers come from reports dated 31.12.2025. These are mixed with no warning.
- **The panel's source text is cut off** ("תאריך הדוח 31 בדצמבר…"), and the "F‑92" formula code tells me nothing I can check.
- **Some computed values aren't shown at all.** IVV, VOO and the Dist ETFs show "לא מושווה" or "אין מחיר כאן", so a quarter of the "20 קרנות" can't be judged on my criterion.
