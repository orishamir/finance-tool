# Round 3 of the fresh readers: scores against the key (2026-11-07)

Three readers (`has-account-pc`, `new-pc` at 1440; `student-phone` at 390), each a separate session that loaded nothing of
the project, read whole-page screenshots of the build of `ee238a1f` (served locally). The brief is `brief.json`, the key
`key.md` (committed first, in a75ffc2c), the screenshots `shots/` (made by `shoot.mjs`), the answers `reports/`. Sets: A the
S&P 500 page as it opens; B Leumi chosen in the own-bank box; C the fold on prices abroad opened; D Leumi's cost figure
tapped; E (phone) a plan of 50,000,000 ₪ + 100,000 ₪ a month, 40 years, 12%; F (computer) Kesem's company page, rule card
ETF-64.

Scores: **M** read as meant, **P** partial, **X** missed, **—** not shown to that reader.

| # | Line | has-account-pc | new-pc | student-phone | Rewording? |
|---|------|----|----|----|----|
| 1 | Under the own-bank box, "השורה של כל בנק סופרת ... למי שיפתח שם חשבון עו״ש כדי להשקיע" | M | M | M | Worth a small change (below) |
| 2 | Pairs chart legend "דמי ניהול חשבון ניירות ערך" against the list's "...ועו״ש" | M | M | M | No |
| 3 | Fold, first point, "...ואצלם החישוב סופר את הפער בגובה התקרה" | M | M | M | No |
| 4 | Fold, second point, "...גם כשהתעריפון כותב להן תקרה ... יוצא מן הכלל: וואן זירו..." | P | P | P | **Yes** |
| 5 | "דמי ניהול חשבון עו״ש בחודש 5.50 ₪" in Leumi's cost box | P | P | P | **Yes** (the row needs its source in view) |
| 6 | BANK-35 amber box "מיולי 2027 הסכום כאן יכול להיות גבוה מדי..." | M | M | M | No |
| 7 | BANK-35 rule line and source "רשומות · צו הבנקאות (שירות ללקוח) (פיקוח על..." | M | M | M | No (the cut title is a finding) |
| 8 | "מיליארד" short form on a phone | — | — | P | The word no; the display yes (below) |
| 9 | Fund title "קסם, דוח שנתי "קסם (4A) KTF ת"א 35" (5124490)..." | X | X | — | Probably not (below) |

## Per line, with the quotes

**1. Under the box.** All three read it as meant: banks' rows count their current-account fee, investment houses need none,
and the box above is the way to drop it for one's own bank. All three tripped on the same words, "למי שיפתח שם":
- has-account-pc: "sounds as if I'd be opening a new current account. I already have one, so before set B the Leumi row was
  charging me for something I already pay. The line should say 'choose your bank above' plainly."
- new-pc: "It made me wonder whether the fee is counted even for someone who already has an account there. Set B answers
  that (it isn't), but only after you change the box."
- student-phone: "'למי שיפתח' — what if I already have an account at that bank? The box answers this, but only if I notice
  the box."
Two also asked which rows are banks: "I can't tell for 'וואן זירו' or 'אי.בי.אי'" (has-account-pc); "It doesn't say whether
One Zero counts as a bank here. Its bar has no red at all" (student-phone). One Zero is a bank whose row counts no
current-account fee, which "השורה של כל בנק" seems to contradict.
For the lead: the line could send the reader who already has an account there to the box, and could say which banks it
means (those that charge for a current account); the Hebrew editor's call.

**2. The two legends.** All three: red near the top is the securities account's fee only, because both pairs there are
Psagot's; the list's red adds the current account, because the list has banks. Bothers, not misreadings: "the same red
means two different things on the same page, and the page doesn't say why" (has-account-pc); "I can't tell how much of a
bank's red is the checking fee" (new-pc, student-phone). The student saw in set E that the top legend says "ועו״ש" again
when the pairs are One Zero's and Leumi's, and took it as consistent.

**3. Fold, first point.** All three as meant: the three named houses' figures count the gap at its ceiling, the others'
leave it out, so the others may look cheaper than they are ("those three look worse partly because they're the honest
ones", student-phone). Trips: none of the three was sure the fold matters for the Israeli fund they chose ("the page
doesn't say so outright", new-pc); "'עמלת המרת המטבע' versus 'שער שהם קובעים'. I'm not sure I understand how those two are
different costs" (student-phone); has-account-pc wondered whether the three houses' figures shown now, for an Israeli fund,
include the gap.

**4. Fold, second point.** All three partial. They read the main sentence as meant (charges abroad passed on, left out
even with a printed ceiling, so a fund abroad can cost more). They tripped on the exception and on its clash with point 3:
- new-pc: "this is the opposite rule from point c. There, a written maximum meant the cost was included. Here, a written
  maximum still means it's left out." And: "I don't understand how a 'סכום קבוע' (a fixed amount) can also have a maximum
  ('תקרה')."
- has-account-pc: "'סכום קבוע' and then 'בגובה התקרה'. Is it a fixed amount or a maximum?" and "Why the exception? The
  sentence before says these fees aren't counted even when a maximum is written. Then Wallen Ziro's is counted."
- student-phone: "I don't know what 'דיבידנד' means", "Point c includes a cost at its limit for three companies, but here
  costs with a known limit are left out. That seems inconsistent."
- All three asked whether it applies to an accumulating fund ("For an accumulating fund that pays no dividends, I'd guess
  this charge never applies, but the page doesn't say").
The line says "סכום", not "סכום קבוע"; both computer readers read "סכום ... בגובה התקרה" as a fixed sum with a cap.
Needs rewording: why One Zero's charge is counted while the others are not, that it touches only a fund that pays
dividends, and no "סכום" beside "תקרה"; "דיבידנד" may want its explanation.

**5. "דמי ניהול חשבון עו״ש בחודש 5.50 ₪".** All three partial: they read it as Leumi's monthly current-account fee counted
in its figure, but none could say where the 5.50 comes from, and two thought it might be the new legal cap:
- has-account-pc: "The other values carry the tag 'פרמטר של האתר'; this one has no tag. The rule listed right under it is
  'התקרות החדשות לעמלות העו״ש' (BANK-35). So I can't tell whether 5.50 ₪ is Leumi's own price list or a legal maximum."
- new-pc: "The only related source is 'התקרות החדשות לעמלות העו״ש… BANK-35' ... So I don't know if 5.50 is Leumi's actual
  price."
- student-phone: "is 5.50 today's fee or the new upper limit?"
The words are fine; the row shows no mark of where its figure comes from, and the only source in view is the cap's. The
row needs its source in view (Leumi's price list).

**6. BANK-35's amber box.** All three as meant: from July 2027 a cap by actions a month may be below the fee counted, so
Leumi's figure may be too high, and nothing to do now. One slowed: "'גבוה מדי' took me a second. It means the page may
*overstate* Leumi's cost" (has-account-pc).

**7. "רשומות".** All three as meant: "I believe 'רשומות' is the state's official gazette, where laws and orders are
published." All three noted the title is cut with "…" so they "can't read the full name or date": a finding for the source
line's layout in the box, not for the word.

**8. "מיליארד" (phone).** Partial, by the key: the unit was read right ("All of these are thousands of millions of
shekels"), and the reader was thrown by what the short form hides and how it shows:
- "Ties hide real gaps. One Zero and Leumi both show 1.86 billion, yet the top card says Leumi is '−3,509,878 ₪' behind."
- "Mixed formats. '1.6' has one decimal place while the rest have two."
- "Excellence looks backwards. It's the only row where what's left is written in full, '758,833,521 ₪'. That's smaller than
  its cost, which is written as '1.57 מיליארד'."
- "The ranks don't match the figures": several rows ranked "1" with 1.86 and 1.85.
- **A layout fault, confirmed in `shots/E-typed-plan-phone-07.png`:** in the table of "מה הכי משנה את מה שיישאר לכם", the row
  "סכום היום" prints "50,000,000 ₪", "60,000,000 ₪" and "295,664,705 ₪" over each other ("numbers printed on top of each
  other: '295,664,70560,000,0005…'. I can't read it"). The cells overflow into each other rather than being cut by a box,
  so the movement script's cut check does not catch it.
The word needs no change; the short form wants a fixed number of decimals ("1.60"), and equal-looking figures beside a
difference in millions are worth the lead's look.

**9. The fund title.** Both computer readers read the fund's name and number correctly but reported it out of order, which
the key counts as a miss: "on screen it reads `"35 KTF (4A) ת"א` with the '35' thrown to the left of the opening quote. I
had to piece the name back together" (has-account-pc); "Yes, but with effort. The quote marks and the '35' are out of order
on screen" (new-pc). Checked on the screenshot: the line is in correct right-to-left order (the closing quote after "35"
sits at the far left, as it should); what trips is a quoted Hebrew name ending in a number. Both also flagged the
neighbouring ETF-65 source, "קסם MSCI AC World (4A) מנוטרלת דולר" ETF", where "ETF" falls to the next line, and asked why a
report dated 30.6.2026 is called "דוח שנתי" (worth checking against the document). Probably no rewording; the lead may
judge whether titles quoting a fund name should drop the inner quotes.

## Not tested

G-32, the "MTF מחקה (4D) Nasdaq 100" title and Discount's group current-account words are on no screen today; the reasons
are in `key.md`.

## Other findings (question 3), for the lead

- Student and group prices: "I'm a student, and student prices aren't counted ... That's me" (student-phone); "None of them
  says what age counts as 'young'" (new-pc).
- The plan's values are marked "פרמטר של האתר": two readers took them as their own inputs mislabelled ("as if the site had
  set them rather than me", new-pc).
- Two hues in the pairs chart's legend: "'המרת מטבע' is pink and 'מס' is magenta, and they look almost the same. The large
  5,703 bar is tax, but I first read it as currency conversion" (new-pc). Ground rule 6.
- On the phone, fund tags are cut: "'עסק…', 'כמו…', 'כמה ד…'. I can't read the second tag on any fund" (student-phone).
- "Choosing Leumi moved its 'נשאר' by 673 ₪ (82,723 → 83,396) but its cost by 742 ₪ (5,283 → 4,541)", with nothing saying
  why (has-account-pc).
- Unknown words: "עסקת החלף", "(4D)/(4A)", "Accumulating", "דיבידנד", the rule ids "F-63", "BANK-35" (student-phone, new-pc).
