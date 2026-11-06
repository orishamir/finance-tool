# gemelnet: self-directed-investor (run 2)

browser mode, pc; 27 steps, 125 s, $0.80

## Answer

The big equity tracks are basically tied over 5 years (כלל תמר מניות 12.34%/yr, הראל מניות 12.41%/yr, both ~0.5% fee on assets), so there's no real money to gain by switching. The number to check against my own fund is the ~0.5% asset fee, not the return.

Confidence: fairly sure; gave up: false

## Stuck

- קופות גמל tab, 'סינון ברשימה': Typing 'מניות' (and pressing Enter) changed nothing in the list
- תחקור לפי פרמטרים, התמחות = מניות: Returned only two '**' sector funds; the big houses' equity tracks (כלל תמר מניות, הראל מסלול מניות) are not tagged מניות
- Picker dialog 'סינון ברשימה' button: Filtering did nothing visible
- Sort arrow on 'ממוצעת שנתית 5 שנים אחרונות': First click put blanks on top, second click changed nothing, and the bottom of the table looked ordered by fund number, so I never got a ranking

## Used

- Results table: תשואה שנתית ממוצעת לתקופה, ממוצעת 3 שנים, ממוצעת 5 שנים
- שיעור דמי ניהול ממוצע 2025 – נכסים / הפקדות
- '**' footnote: fund for a specific sector, not open to the public
- Header showing רשות שוק ההון as the operator

## Skimmed

- סה"כ נכסי הקופות לפי סוג קופה chart and table
- Report headline text about long-term savings
- Long list of fund rows in the middle of the table

## Skipped

- מה ניתן להפיק באמצעות המערכת
- מקורות המידע והנחות המערכת
- הסברים / מדדי סיכון
- חיפוש מתקדם tab
- מדד אלפא option
- Excel/XML export

## What would bother this person, most first

- תחקור לפי פרמטרים → התמחות: Specialization filter 'מניות' leaves out the main public equity tracks and returns only two closed sector funds; this misleads you into thinking there's nothing to compare
- 'סינון ברשימה' on the קופות גמל tab and in the picker dialog: Text filters do nothing visible
- Sort arrows in the results table header: Column sort is unclear: blanks come first, the second click does nothing, and the order looks like fund number
- Results table, תשואה שנתית ממוצעת לתקופה: S&P 500 tracks show ~7.5% for 12 months next to 20–30% for equity tracks, with no note on currency effects
- Results table: Many newer tracks have '- - -' for 3 and 5 years, so they can only be compared on 12 months
- צבירה נטו column: Net flows column in red sits next to the returns and is easy to misread as a return
- Results report: 8,400px single table with no sticky header; you lose the column labels while scrolling
- בחירת גופים dialog: Dated UI with a modal picker plus '<' '>' move buttons; it takes many clicks to set one filter

## Not sure what it meant

- שארפ ריבית חסרת סיכון
- מדד נזילות
- צבירה נטו (red negatives, presumably net outflows)
- Why S&P 500 tracks show ~7.5% for 12 months against 20–30% for 'מניות' tracks (currency?)
- '- - -' in the return columns (too new, or missing data?)

## Looked for and did not find

- A working sort to rank funds by 5-year return
- A working text filter for fund names
- Equity tracks of the big houses under התמחות 'מניות'
- Any note on whether returns are shekel/currency-adjusted or before/after fees

## What it said along the way

Government regulator site, old-school. Fine, no broker. Enter the system.

Old-school form. Let me filter the fund list for equity tracks — that's what I'd hold.

Filter typed, list didn't change visibly. Try Enter.

Filter does nothing visible. Try the "תחקור לפי פרמטרים" tab — probably lets me rank by track.

This is better: management fee, std-dev columns. Pick סוג קופה first.

Modal picker. Pick "תגמולים ואישית לפיצויים" and move it over.

Moved. Continue.

Now התמחות → equities.

Now show report.

Report header. Scroll to the table.

Only two funds, both "**" — sector funds not open to the public. Useless. The big houses' equity tracks must sit under another label. Reopen the התמחות picker.

Filter in the picker also does nothing. Cancel, clear specialization, just list all תגמולים funds.

Now 8,400 px of table. Scroll in.

Now this is a table I like. Sort by 5-year average.

Sorted ascending — blanks first. Need descending.

Second click did nothing visible. Ascending means the top performers are at the bottom — jump there.

I'm done. Here's what I'd tell a colleague over lunch.

**Bottom line:** It's a dense government table with no broker pushing anything, and I'd use it again. It does give me the numbers I need: 12-month, 3-year and 5-year average returns, plus the average management fee as a % of assets. The two big equity tracks I spotted are basically tied over 5 years: כלל תמר מניות at 12.34% a year and הראל גמל מסלול מניות at 12.41%. Both charge about 0.5% of assets. A 0.07% gap is noise, so I'm not moving my fund for that. The number to check is my own management fee against that ~0.5% of assets. I'm only fairly sure, because I never got a clean ranking by 5-year return.

**How it went:**
- **Who's behind it:** The front page is plain 2005-style, run by רשות שוק ההון (the regulator), with no broker names. That's a plus.
- **First tab, "קופות גמל":** You build a list of funds by hand. I typed "מניות" into "סינון ברשימה" and the list didn't change at all.
- **"תחקור לפי פרמטרים" tab:** I set fund type to תגמולים and specialization to מניות. The report showed **two** funds, both marked "**", which means sector funds not open to the public. Yet "כלל תמר מניות" and "הראל גמל מסלול מניות" are equity tracks that showed up once I cleared that filter. So the specialization tag doesn't match the fund names, and that filter is misleading.
- **The filter box inside the picker:** Also did nothing.
- **Cleared the specialization:** I got one huge table (8,400px) of every תגמולים fund. Good columns: 12m, 3y, 5y, deposit and asset fees, Sharpe, net flows, liquidity.
- **Sorting:** I clicked the 5-year sort arrow. Blanks went to the top. Clicking again changed nothing visible. At the bottom the rows were still in fund-number order, so I can't tell what the sort actually did.

**What bugged me:**
- The 12-month figures for the S&P 500 tracking tracks are about 7.1–7.8%, while the "מניות" tracks show 20–30%. I assume that's the shekel getting stronger, but nothing on the screen says so. A naive user would conclude "S&P sucks."
- Most newer tracks show "- - -" for 3 and 5 years, so you can only compare them on 12 months.
- "שארפ ריבית חסרת סיכון" and "מדד נזילות" have no explanation in sight.
- The "צבירה נטו" column sits right beside the returns, with red negative numbers for net outflows. At a glance I first read them as returns.
- I'd have closed the tab after the two-fund result if I didn't already know the big houses had equity tracks.
