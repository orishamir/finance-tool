# "השקעה במדד": improvements

Draft, 2026-10-27, for the founder. Not approved; nothing here is built.

Starting point: the live pages `/indices/sp500` and `/indices/ta125` read on 2026-10-27 (desktop and phone, the three folds open), `docs/product.md` read in full, the label code (`site/app/lib/labels.ts`, `invest.labels` in `site/app/copy.ts`) and the 57 records in `data/funds/`.

## 1. Scope (founder, 2026-10-27)

The reader has already chosen an index and wants to hold it in a regular securities account, in Israel or abroad. The page answers where to open the account and what to buy there. Out of scope:

- whether to invest at all, or whether this money suits an index;
- which index, or how the indices differ (D27; the page does not compare indices);
- index tracks inside other wrappers (study fund, kupat gemel lehashkaa, IRA, child savings). The goal comparison (3.2) ranks wrappers.

"ETF or tracking fund" is not a question the reader asks. They ask "which fund do I buy." The evidence agrees: the UX report's Q1 is a reader whose bank asked for a security number he could not choose, not a question about fund types (`research/discovery/ux-landscape.md`). The fund type matters only through what follows from it (a standing order, the commission at this account, when the order executes). Those are facts on the fund's row, not a choice the page puts to the reader (section 3, item 1).

The questions in scope, in the reader's words:

1. Where do I open the account, or is my bank fine?
2. What exactly do I buy (the number I type)?
3. Can I put in a fixed sum every month there, automatically?
4. What will it cost me, and what will I be left with after tax?
5. Is a fund in Israel or buying abroad better for me, and what does abroad demand of me?
6. I already have an account (or a fund). Move, negotiate or stay?
7. What do I need to know about this fund that the fees do not show?
8. Is my money safe there?
9. What happens when I sell?

## 2. More labels, in the style of "צוברת"

### 2.1 What a label is (rules already in force)

- Two or three words for one fact, with an icon, a tone and an explanation in the labels sheet. It is computed from a record, never typed per row (`labels.ts` header).
- It states a sourced fact or an open rule, and never praises.
- It appears only where the rows differ. A fact that holds for every way sits once in the index header, and a label that would be the same on every row is left out (CLAUDE.md, "Lists of products").
- It never compares with other companies and never rests on a threshold the site chooses (D36).
- A company's figure about its own fund is plain sourced on that fund's row (D31).

Today's set: where it is held (קרן ישראלית, קרן חוץ בת״א, נקנית בחו״ל), how it trades (קרן סל: נסחרת כל היום, קרן מחקה: פעם ביום), how it tracks (מחזיקה את המניות, עסקת החלף, חוזים עתידיים, כמה דרכים יחד), currency (חשיפה ל…, מנוטרלת מט״ח), tax (מס גם על שינויי המטבע, מס דיבידנד בתוך הקרן, מס על כל חלוקה, מס רק במכירה), payout (צוברת, מחלקת דיבידנד), what it demands of the reader (דיווח עצמי למס, מס עיזבון אמריקאי, צריך טופס W-8BEN, לא בפיקוח רשות ני״ע), and availability (לא זמין בחשבון הזה).

### 2.2 Proposed labels

Three kinds, by what the fact is about. The data status says what each needs before it can show.

**On the fund (the same in every account)**

| Label | Shown when | Answers | Data status |
|---|---|---|---|
| **קרן חדשה** | The fund's first annual report covers less than a full year, so it has no 12-month record yet (no tracking difference can exist). The explanation names the first day of trading. | 7 | The date is in the free text of `legal_form` for some records ("units first offered to the public on 08.04.2025"). Needs a structured `launched` field, filled for all 57. |
| **כשרה** | The fund holds a kashrut approval (היתר עסקה) in force. | 7 | In the free text of 8 records. Needs a field and a pass over the rest. Founder: does the audience want it? |
| **דמי הוספה** | The fund charges a purchase load (שיעור הוספה) above zero. A cost the fee columns do not show. | 4, 7 | Not collected. Needs a field, and a rule record in il-finance for what the load is and its cap, before the label or the engine uses it. |
| **נסחרת בדולרים** | A foreign fund on TASE that trades in dollars, not shekels (`trading_currency_on_tase`). | 2, 5 | The field exists; no foreign fund on TASE has a record yet. |
| **שינוי בדמי הניהול** | The manager has published a fee change with a date. Not the general right to change fees on 1 January, which every fund has and so belongs in the header. | 4, 7 | Not collected; needs monitoring of the funds' reports. Later. |

**On the fund in this account (like "לא זמין בחשבון הזה")**

| Label | Shown when | Answers | Data status |
|---|---|---|---|
| **הוראת קבע** | The account's tariff or terms say this kind of fund can be bought by standing order. The explanation gives its price. The "what to do now" steps say "set a standing order" only when the label is there. | 3 | Leumi's tariff has the line ("קנית קרן מחקה באמצעות הוראת קבע", 0.225%, min 5 ₪). The others need a pass over the tariffs and the account terms. |
| **בלי עמלת קנייה כאן** | The account's buy line for this class is zero. It explains why a fund ranks first at this house. | 1, 4 | Computed from the collected tariffs. |
| **עמלת המינימום קובעת** | At the reader's monthly sum, the account's minimum commission is larger than its rate. The explanation shows the rate it works out to ("עמלת מינימום 5 ₪ על 500 ₪: 1%"). The fact is the tariff's, at the reader's own number, so no site threshold is involved. | 3, 4 | Computed from the tariffs and the plan. |
| **של אותה קבוצה** | The fund's manager and the account belong to the same group (`data/sources/brands.json`, D33), for example an IBI fund in an IBI account. A neutral fact. | 1, 7 | Computed. Founder: wanted? |

**On the account (house rows)**

| Label | Shown when | Answers | Data status |
|---|---|---|---|
| **דמי משמרת** / **בלי דמי משמרת** | Whether the account charges custody on this class. Only the one that differs between the rows is shown. | 1, 4 | Computed from the tariffs. |
| **דמי ניהול חשבון** | The account charges a fixed fee per month or quarter, whatever is held. | 1, 4 | Computed from the tariffs. |
| **צריך עו״ש בבנק** | Opening it needs a current account at the same bank. | 1, 6 | Check whether the brokerage-account record or a BRK rule holds this as a general fact (D30); otherwise collect it per bank, shown as that bank's fact. |

Not proposed:

- Fund size or "a small fund" (needs a threshold, D36).
- "0% management fee" (praise; the figure is in its column).
- The 4A/4D codes (a code, not a fact). The names keep them; the labels sheet can explain them.

## 3. Against `docs/product.md`: what the page owes the reader

`docs/product.md` section 2 states the reader's job: which fund variant and which provider, "which fees are worth fighting, and what they might be failing to consider", then act, and "be able to come back later and see whether anything changed". Read against that, the page today answers question 1 well and question 2 with false precision. These are the gaps, each with the decision or capability it comes from:

1. **The fund type is presented as an option to choose (3.4, D28 (a)).** The "ETF or tracking fund" fold and the "קרן סל או קרן מחקה" line in "what each choice is worth" put the type to the reader as a choice. Proposal: drop both. The type stays as the two labels it already is, and its consequences become the labels in 2.2 (standing order, buy commission here). If agreed, D28 (a) is amended to say the options are the place the fund is held (in Israel, a foreign fund on TASE, abroad) and the fund type is a label.
2. **Near-ties are not named (D5; principle "collapse equivalent options").** Funds are ranked 1 to 13 and houses 1 to 14, although #1 and #2 are 37 ₪ apart over ten years and the tracking difference is taken as zero. D5 requires near-ties to be named as ties by the tie threshold (a site parameter). Proposal: rows within the threshold of the best share one rank, shown as "the same for your plan". The ranking resumes after them.
3. **The fund list has no coverage line (D17; dependency 6).** The page lists the funds collected for the index and does not say how many funds track it, or that the rest are not evaluated. D17 asks every comparison to say how many options it considered and name the group it does not hold one by one. Under the TASE terms that is a count and a link (CAT-43). Proposal: one line under the table, "13 funds with a record; the full list on Maya ↗".
4. **The dimension checklist is missing (3.3; principle "show the dimension").** This is the founder's own blocker ("a decision looks complete until a dimension appears that was not on the list"). Every fund record already carries `dimensions` marks (fees, tax track, distribution, currency, trade fee, protection, foreign withholding). Proposal: the page shows the list for the chosen way, each dimension marked considered, not applicable or open, from those marks and the account's.
5. **Which fee is worth fighting (3.5, D4).** A house row shows one total. 3.4 asks for the cost broken into fee types and which type drives the ranking. D4 asks for list price, the regulator's per-bank average where one exists, and "entered by you". A reader at their own bank (question 6) cannot type the fee they negotiated, or see which line to negotiate. Proposal: in the "your account" row, the cost by tariff line, a field for an entered fee per line, and the regulator's average beside each line where it exists. Whether the Bank of Israel averages can be quoted needs checking first (D20, D22).
6. **Tax is not named in the headline (principle "net of fees and tax").** The headline reads "נשאר בסוף, בכסף של היום". The other comparisons say "אחרי דמי ניהול ומס". Proposal: the same words, and the tax at sale shown as its own part of the gap (question 9).
7. **The steps assume a standing order (principle "process is part of the price"; 3.7).** "מגדירים הוראת קבע" appears for every house. Proposal: step 3 follows the "הוראת קבע" label (2.2), and otherwise says how to buy each month by hand at that house.
8. **Protection (3.4 providers: "regulator and protection status").** Only foreign brokers carry a label. Question 8 needs one sourced line for every account: who supervises it, and how client assets are kept. The facts are already in the account's record (D6). Proposal: show it in the index header, since it holds for every Israeli account, and keep the label for the accounts that differ.
9. **Coming back later (section 2 job; 3.9).** The page does not keep the way the reader chose (house + fund). Proposal: a "this is what I did" button stored on the device, and on a later visit, after a tariff refresh, "still the cheapest" or "now X ₪ more than the cheapest". The revisit machinery of 3.9 exists.
10. **Abroad needs its own small list (question 5; 3.3 "foreign withholding and domicile", "reporting obligations").** The labels for buying abroad exist (דיווח עצמי, W-8BEN, estate tax, unsupervised, tax on sale open). What is missing is the cost side: currency conversion and the abroad route's yearly reporting. Each needs a rule record in il-finance first. Where a rule is missing, the page says so instead of estimating.

## 4. Decisions for the founder

1. The label list in 2.2: which to build, and whether "כשרה" and "של אותה קבוצה" belong.
2. Section 3 item 1: drop the "ETF or tracking fund" fold and its worth line, and amend D28 (a).
3. Section 3 item 2: rank ties together on this page (D5 already says so; this applies it here).
4. Section 3 item 5: a negotiated fee as an entered value on this page.
5. Section 3 item 9: saving the chosen way on the device.

## 5. Suggested order

1. Labels computed from data already held: בלי עמלת קנייה כאן, עמלת המינימום קובעת, דמי משמרת, דמי ניהול חשבון, plus the coverage line, the ties and the headline's "after tax". No collection needed.
2. Data passes: `launched` and kashrut on the 57 records; standing orders across the tariffs. Then קרן חדשה, כשרה, הוראת קבע, and step 3.
3. The dimension list (item 4) and the fee breakdown with the entered fee (item 5).
4. Saving the chosen way (item 9); the abroad cost lines once their rules exist (item 10); דמי הוספה once its rule exists.
