# Words for the fund cost column: a test on fresh readers

2026-11-05. The column in the list of funds on one index that shows, for each
fund, the yearly percentage the site counts as its cost. It is either the
fund's management fees, or, when the fund's own yearly reports show it fell
behind its index by more than its fees, that larger shortfall (one year or an
average of three). The question: which words let a reader who knows only the
page understand that number.

## Method

1. **The writer did not see the site.** The words were written from a short
   brief (the reader's plan, the four real rows, what the number is), not by
   the session that had spent hours inside the site, so the writer could not
   lean on knowledge the page does not give.
2. **Fresh readers as personas.** Three readers who saw only the list and the
   words: someone new to investing ("new"), someone who knows management fees
   from their pension ("pension"), and a careful reader who distrusts what is
   not said ("careful").
3. **The answer key was written before any reader answered.** Each reader was
   graded against six points: K1 the number is a yearly cost, a share of the
   money each year, not a return; K2 lower is better; K3 a fee row is the
   fund's management fees; K4 a shortfall row means the fund's past results
   fell behind its index by this much a year, more than its fees, counted
   instead of them, resting on the past (and on how many years); K5 the
   reader can tell why rows 2 and 3 are equal (one counted by its fee, the
   other by its shortfall); K6 no word stops the reader. **Understood** = all
   six; **partly** = K1 and K2 right, a miss among K3 to K6; **misread** = K1
   or K2 wrong, or a confident wrong meaning. Score: 2 per understood, 1 per
   partly, 0 per misread, so 6 is the most.

The four rows (real figures), a reader investing 10,000 ₪ now and 500 ₪ a
month for 10 years through a securities account at Psagot:

| Fund | Shown | Why | Leaves, against the pick |
|---|---|---|---|
| אי.בי.אי. מחקה (4A) ת"א 125 | 0.125% | fees | the pick |
| תכלית סל (40) ת"א 125 | 0.37% | fees (fell behind 0.28% a year over 3 years, less than the fees) | 1,030 ₪ less |
| MTF סל (4A) ת"א 125 | 0.37% | shortfall, one year (fees 0.345%) | 1,030 ₪ less |
| אי.בי.אי. סל (4A) ת"א 125 | 0.54% | shortfall, one year (fees 0.458%) | 1,733 ₪ less |

## Every set tested

"Head" is the column heading; "fee line" the small grey line on rows 1 and 2;
"shortfall line" the grey line on rows 3 and 4; "above" the line above the
list; "tap" the text that opens on a tap.

### Round one

| Set | Head | Fee line | Shortfall line (1 year / 3 years) | Above | Tap |
|---|---|---|---|---|---|
| control-reports (on the drawing) | עלות בשנה | דמי ניהול | לפי הדוחות / לפי הדוחות | (none) | הקרן נספרת לפי הגבוה מבין שניים: דמי הניהול שלה, או הפיגור שלה אחרי המדד בדוחות השנתיים. |
| control-lag (proposed, untested) | עלות בשנה | דמי ניהול | פיגור בעבר · שנה אחת / פיגור בעבר · 3 שנים | (none) | as control-reports |
| w1 | עלות שנתית | דמי ניהול | פחות מהמדד, שנה אחת / פחות מהמדד, ממוצע 3 שנים | כמה יורד מהכסף שלכם בכל שנה. נמוך יותר עדיף. | זה האחוז מהכסף שלכם שהקרן לוקחת בכל שנה: דמי הניהול שהיא גובה. אם בדוחות השנתיים שלה היא הרוויחה פחות מהמדד ביותר מזה, נספר הפער הגדול יותר. פער שנמדד בשנה אחת בלבד יכול להיות מקרה. |
| w2 | כמה פחות מהמדד | מה שהקרן גובה | נמדד בשנה אחת / נמדד ב־3 שנים | המדד עולה, והקרן עולה קצת פחות. בכל שנה, כמה פחות: | קרן שעוקבת אחרי מדד אמורה להרוויח כמוהו, אבל בכל שנה היא מרוויחה קצת פחות. האחוז הוא דמי הניהול שהקרן גובה, או כמה פחות מהמדד הרוויחה בפועל, הגבוה מביניהם. כשנמדד רק בשנה אחת, המספר פחות בטוח. |
| w3 | עולה לכם בשנה | ידוע מראש | מניסיון של שנה אחת / מניסיון של 3 שנים | חלק מהמספרים ידועים מראש, וחלק נלמדו ממה שקרה לקרן. | יש עלות שידועה מראש: דמי הניהול שהקרן גובה. יש קרנות שבפועל הרוויחו פחות מהמדד ביותר מזה, ואצלן נספר מה שקרה, בממוצע לשנה. מה שנלמד משנה אחת עלול להיות מקרה. |
| w4 | המחיר בפועל | כמו שהקרן גובה | עלה יותר, בשנה אחת / עלה יותר, ב־3 שנים | (none) | (per row, MTF) הקרן גובה 0.345% בשנה, אבל בשנה שבדקנו היא הרוויחה פחות מהמדד ב־0.37%. לכן נספר 0.37%, המחיר שהיא עלתה בפועל. שנה אחת היא מעט זמן, ובשנה הבאה זה יכול להיות אחרת. |
| w5 | יורד מהרווח | דמי ניהול | מעל דמי הניהול, שנה אחת / מעל דמי הניהול, 3 שנים | קרן שעוקבת אחרי מדד מרוויחה כמו המדד, פחות האחוז הזה בכל שנה. | דמי ניהול הם מה שהקרן גובה כל שנה. חלק מהקרנות הרוויחו בפועל פחות מהמדד ביותר מדמי הניהול, ואצלן נספר הפער הזה, בממוצע לשנה. שנה אחת היא מעט זמן לשפוט לפיה. |

| Set | New | Pension | Careful | Score |
|---|---|---|---|---|
| control-reports | partly: "לפי הדוחות... what reports? Whose? Does it mean the number is the same kind of fee but they found it in a report?"; could not tell one year from three; read rows 2 and 3 as "both funds just charge 0.37%" | **misread**: "Rows 3-4 I assume are also fees, just copied from some report... same fee, different source"; "I'd have been misled without tapping" | partly: "according to which reports? It tells me where it came from, not what it is"; after the tap, "פיגור" was "still in an expert's language" | 2 |
| control-lag | partly: "פיגור בעבר... Behind what? Late on something? Sounds like the fund did something bad once"; rows 2 and 3 "Coincidence?" | partly: "פיגור: lag? behind what? A late payment? ... sounds like a warning, not like a cost" | partly: "Behind what? I don't know"; "Does MTF charge 0.37% too? I can't tell" | 3 |
| w1 | partly: "המדד (a little)", "שנה אחת: one year of what?"; wondered "whether row 3 has a fee of its own that isn't shown" | understood (small: "המדד: which index?") | understood (small: "פחות מהמדד: by 0.37%, or less overall?") | 5 |
| w2 | partly: "נמדד (measured what? the fee or the gap?)"; rows 2 and 3 "Maybe by chance" | partly: "I don't know what was measured or how it's different from the charge"; "which is which" | understood ("Doesn't MTF also have a fee?" settled by the tap) | 4 |
| w3 | partly: "ידוע מראש" never read as the fee; "מניסיון... Experience of what?"; lower-is-better only assumed | partly: "מניסיון (whose experience? mine?)"; "Missing that it's about the index" | partly: "ידוע מראש (known by whom, and what is it?)"; "מניסיון sounds vague, almost like customer reviews" | 3 |
| w4 | **misread**: "עלה יותר... did the fund go UP more (good)? My first read was the fund rose more" | partly: "עלה יותר (cost more, or went up?)", "more than what?" | partly: "it could read as the fund rose more, which sounds good!", "המחיר בפועל... compared to what?" | 2 |
| w5 | **misread**: "Is the 0.37% on top of the fee, so I pay the fee AND 0.37%?"; "The tap fixes something that the label itself broke" | partly: "מעל דמי הניהול = confusing: above the fee? ... what is it then?" | **misread**: "Is the 0.54% on top of the fees, so I pay both?"; "the grey line misled me into thinking it's extra on top" | 1 |

### Round two (revised sets, built on w1 and w2)

| Set | Head | Fee line | Shortfall line (1 year / 3 years) | Above | Tap (MTF) |
|---|---|---|---|---|---|
| r1 | עלות בשנה | דמי הניהול של הקרן | בפועל, מעל דמי הניהול · שנה אחת / בפועל, מעל דמי הניהול · ממוצע 3 שנים | כמה פחות מרוויחים בכל שנה לעומת מדד ת״א 125. נמוך יותר עדיף. | בדרך כלל זה דמי הניהול שהקרן גובה בכל שנה. הקרן הזאת הרוויחה בפועל פחות ממדד ת״א 125 ביותר מדמי הניהול שלה (0.345%), ולכן נספר הפער הזה במקום דמי הניהול, לא בנוסף להם. זה נבדק בשנה אחת בלבד, אז ייתכן שזה מקרה. |
| **r2** | **פחות מהמדד, בשנה** | **כגובה דמי הניהול** | **בפועל בשנה אחת; דמי ניהול 0.345% / בפועל, ממוצע 3 שנים; דמי ניהול 0.458%** | **מדד ת״א 125 עולה, והקרן עולה קצת פחות. כמה פחות בכל שנה, באחוזים מהכסף. נמוך יותר עדיף:** | **קרן שעוקבת אחרי מדד מרוויחה בכל שנה קצת פחות ממנו, לפחות כגובה דמי הניהול שהיא גובה. כאן היא הרוויחה בפועל פחות מהמדד ביותר מדמי הניהול, ולכן נספר מה שקרה בפועל, במקום דמי הניהול. מה שנבדק בשנה אחת בלבד פחות בטוח.** |
| r3 | מפסידים למדד בשנה | כמו דמי הניהול | יותר מדמי הניהול, לפי שנה אחת / יותר מדמי הניהול, בממוצע ל־3 שנים | קרן על מדד ת״א 125 מרוויחה בכל שנה קצת פחות מהמדד. כמה פחות, באחוזים מהכסף. נמוך יותר עדיף. | כל קרן מרוויחה בכל שנה פחות מהמדד, לפחות כגובה דמי הניהול שהיא גובה. הקרן הזאת הרוויחה בפועל פחות ביותר מזה, ולכן נספר מה שקרה בפועל, במקום דמי הניהול ולא בנוסף. זה נבדק בשנה אחת בלבד, וייתכן שזה מקרה. |

(In r2 the fee in the shortfall line is that row's own figure; the 3-year
line above shows row 4's fee only as an example, since row 4 actually rests on
one year.)

| Set | New | Pension | Careful | Score |
|---|---|---|---|---|
| r1 | **misread**: "בפועל, מעל דמי הניהול · שנה אחת: no idea. Is it the fee plus something on top?"; "Without tapping, 'מעל' made me think they add the two together"; head against the line above: "Is it a fee or a gap?"; rows 2 and 3 "Same number, different meaning, so I'm confused" | **misread**: "'מעל' makes me think it's extra, on top"; after the tap, "That 'not on top' undoes what 'מעל' made me think"; "עלות בשנה... Is it a cost or a gap? I can't tell which one"; rows 2 and 3 "a coincidence or a mistake"; "· שנה אחת means nothing to me alone" | partly: "Is it the fee plus extra? Is 0.37% on top of the fee?"; rows 2 and 3 "No idea... Is MTF's fee lower and something got added?"; "the grey line alone should have said it"; "'עלות' is still the wrong word: it isn't a charge, it's what I lost" | 1 |
| **r2** | understood: "I can compare the two numbers myself, so it trailed a bit more than its fee"; rows 2 and 3 "Same result, different reasons." Small: "כגובה (slightly formal, but OK)", "בפועל (actual compared to what? only clear after a second)" | understood: "I could work that out from the two numbers side by side"; rows 2 and 3 "row 3 is what it actually lagged in one year, which happened to be 0.37% too. Its fee is lower." Small: "בפועל בשנה אחת (which year?)", "the semicolon line is a bit dense" | understood: "Showing the fee next to it helps"; rows 2 and 3 worked out, "but I had to think"; "Best of the three." Small: "כגובה (a bit formal, but OK)" | 6 |
| r3 | partly: "מפסידים... do I lose money?"; rows 2 and 3 "The line doesn't show row 3's fee, so I'm guessing" | partly: "מפסידים (sounds like losing money)"; "I don't know what the fee itself is, so I can't see how much more"; "I'd still want the fee number shown" | partly: "יותר מדמי הניהול (by how much? what is the fee?)"; rows 2 and 3 "I can't check... Feels like the numbers were fiddled" | 3 |

## The winner: r2

r2 is the only set every reader understood without the tap, and the only one
to score 6 of 6. Two things did it.

- **The fund's own fee is on the row.** "בפועל בשנה אחת; דמי ניהול 0.345%"
  puts the fee beside the shortfall, so the reader sees 0.37% is more than
  0.345% and works out the rest alone: this fund is counted by what happened,
  not by its fee, and that is why it equals a fund whose fee is 0.37%. r3 said
  the same in words ("יותר מדמי הניהול") and all three readers asked for the
  number; the careful reader went as far as "Feels like the numbers were
  fiddled". A number the reader can check beats a sentence that asks to be
  trusted.
- **The heading and the line above say one thing.** "פחות מהמדד, בשנה" and
  "מדד ת״א 125 עולה, והקרן עולה קצת פחות" give one picture (the fund rises a
  little less than its index each year), so the fee rows and the shortfall
  rows read as two routes to the same quantity. It names the index and says
  "בכל שנה" and "באחוזים מהכסף", which closed round one's "which index?" and
  "yearly or total?".

Small points left for the build: "בפועל" made two readers pause for a second
("actual compared to what?", "which year?"); the semicolon line is dense on a
phone; "כגובה" reads as slightly formal.

## Words that failed, and what readers took them to mean

| Words | What readers took them to mean |
|---|---|
| לפי הדוחות | where the number came from, not what it is; so "the same fee, copied from some report" (one confident misreading). Same words on the 1-year and 3-year rows hid how much history there is. |
| פיגור / פיגור בעבר | lateness, a late payment, a warning; "behind what?". Never a cost. |
| נמדד (with no object) | "measured what? the fee or the gap?" |
| ידוע מראש / מניסיון | "known by whom?", "whose experience? mine?", "almost like customer reviews"; never the fee, never the index. |
| עלה יותר | "the fund rose more", read as good news. |
| מעל דמי הניהול (w5 and again in r1) | **on top of** the fees: "I pay the fee AND 0.37%". Failed twice; four of six readings across the two rounds held this wrong meaning until the tap. "יותר מדמי הניהול" (r3) did not have this problem. |
| עלות (heading) beside "פחות מרוויחים" (line above), r1 | "Is it a fee or a gap?"; "it isn't a charge, it's what I lost". Two lines that describe the number differently make the reader pick one. |
| מפסידים | "sounds like losing my money"; the line above calmed it, but it stopped all three. |
| · (a dot between phrases) | "Why the dot?"; "· שנה אחת means nothing to me alone". |

One lesson for the writer as much as the words: r1 brought back "מעל דמי
הניהול", which round one had already shown readers take as "on top of". The
writer of round two read round one's results and still reused it, because to
someone who knows the meaning the phrase is accurate. That is the same bias
this test exists to catch, and only the readers caught it.

Outside this column but raised in nearly every reading: the next column,
"לעומת הבחירה", and its "‎−1,030 ₪" ("over what period and on how much
money?"), and the share-class codes in the names ("4A", "40"). They need the
same test.

## Limits of the test

- **The readers are language models playing people.** They read every word,
  know Hebrew well, and say what puzzles them; a real person skims, may not
  tap, and may not notice a confusion at all. A real friend reading the page
  is the stronger check, and the founder should show r2 to one before it is
  final.
- **Three personas, one reading each.** A different run could grade one
  reader differently; a 6 against a 5 is a lean, not proof. The large gaps
  (r2 at 6, r1 at 1; w1 at 5, w5 at 1) are the trustworthy part.
- **In round two each reader saw all three sets, in order.** r1's tap
  explained "instead, not on top" before the reader reached r2 and r3, so the
  later sets may have been helped by the earlier one. r2's own grey line
  carried the meaning (readers said they worked it out from the two numbers),
  but a reader who sees only r2 would settle it.
- **Only the MTF row was tapped in detail**, and the fund names, the next
  column and the phone layout were not part of the test.
- **Grading was done by the same session that set the key**, against quotes;
  the quotes are kept above so anyone can re-grade.
