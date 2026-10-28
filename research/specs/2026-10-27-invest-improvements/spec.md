# "השקעה במדד": improvements

Draft, 2026-10-27, for the founder. Section 2 holds his decisions on labels of the same day. Sections 3 and 4 are proposals; nothing here is built.

Starting point: the live pages `/indices/sp500` and `/indices/ta125` read on 2026-10-27 (desktop and phone, the three folds open), `docs/product.md` read in full, the label code (`site/app/lib/labels.ts`, `invest.labels` in `site/app/copy.ts`) and the 57 records in `data/funds/`.

## 1. Scope (founder, 2026-10-27)

The reader has already chosen an index and wants to hold it in a regular securities account, in Israel or abroad. The page answers where to open the account and what to buy there. Out of scope:

- whether to invest at all, or whether this money suits an index;
- which index, or how the indices differ (D27; the page does not compare indices);
- index tracks inside other wrappers (study fund, kupat gemel lehashkaa, IRA, child savings). The goal comparison (3.2) ranks wrappers.

"ETF or tracking fund" is not a question the reader asks. They ask "which fund do I buy." The UX report's Q1 is a reader whose bank asked for a security number he could not choose (`research/discovery/ux-landscape.md`). The fund type matters only through what follows from it (a standing order, the commission at this account, when the order executes).

## 2. Labels (decided by the founder, 2026-10-27)

### 2.1 What a label is

- Two or three words for one fact, with an icon, a tone and an explanation in the labels sheet. It is computed from a record, never typed per row (`labels.ts` header).
- It states a sourced fact or an open rule, and never praises.
- It never compares with other companies and never rests on a threshold the site chooses (D36).
- **Changed 2026-10-27 (founder: "its ok to duplicate the labels even if all the rows are the same. if in the future i find it annoying we'll remove the duplication"):** a label shows on every row it is true of, even when it is true of every row. Today `fundLabels` and the "what holds for every way sits in the index header" comment in `labels.ts` follow the old rule, and so does "nothing that repeats a label or is the same on every row" in `docs/design-system.md` section 11 and CLAUDE.md. All three are amended when this is built.

### 2.2 The decisions

| Proposed | Decision | Why |
|---|---|---|
| **הוראת קבע** (the account sells this fund by standing order; the explanation gives its price) | **Build.** The "what to do now" step says "set a standing order" only where the label is. | Answers "can I put in a fixed sum every month there". Leumi's tariff has the line ("קנית קרן מחקה באמצעות הוראת קבע", 0.225%, min 5 ₪); the other tariffs and account terms need a pass. |
| **דמי הוספה** (the fund adds a load to the unit price on purchase) | **Research first**: on the roadmap, "After release 5". | The rule is in the base: an open fund's manager may add a surcharge to the unit price on purchase, set in the prospectus, paid to the manager, and most funds charge none (MF-21, primary). No fund record holds the rate yet. |
| **קרן חדשה** (no full year of reports yet) | Not discussed yet. | Needs a structured `launched` field; the date is in `legal_form` free text in some records. |
| **כשרה** | Dropped. | |
| **נסחרת בדולרים** | Dropped. | It would matter only if buying the fund made the reader convert shekels to dollars at the account. That conversion is a cost the engine should price from the tariff, not a label. No foreign fund on TASE has a record yet. |
| **בלי עמלת קנייה כאן** | Dropped. | The commission has no column of its own: the fee columns are the fund's (fixed, variable, trustee), and the account's commission sits inside "נשאר". The answer is the cost breakdown in section 4 item 5, which shows it as a figure. |
| **עמלת המינימום קובעת** | Dropped: "just confusing". | |
| **של אותה קבוצה** | Dropped. | |
| **דמי משמרת**, **דמי ניהול חשבון** (house rows) | Not discussed yet. | Probably also covered by the cost breakdown. |
| **צריך עו״ש בבנק** | Not discussed yet. | Needs a general source (D30) or a per-bank fact. |

## 3. The backbone: what the reader compares, and how (proposal)

### 3.1 Two decisions of very different size

Take a reader who has already chosen the S&P 500, or one who has already chosen the TA-90 (two separate readers; the page never sets one index against another, D27). Each makes two choices: the account and the fund. The page's own numbers (default plan: 10,000 ₪, 500 ₪ a month, 10 years) show how unequal they are:

| | S&P 500 | TA-125 |
|---|---|---|
| Same fund, another account: up to | 19,701 ₪ less | 19,618 ₪ less |
| Same account, another fund: up to | 3,891 ₪ less | 1,208 ₪ less |
| #1 and #2 fund at the cheapest account | 37 ₪ apart | 801 ₪ apart |

The fund figures also take tracking difference as zero, so the fund gaps are less certain than they look. **The account is the decision; the fund is mostly a tie.** The page should be built the same way: the account gets the visual comparison, and the fund gets a short list.

What each of the two readers finds today:

- **S&P 500**: 14 fund records (8 Israeli ETFs and 5 Israeli tracking funds, by swap or several ways together, one of them hedged; one Irish ETF bought abroad), plus a route abroad.
- **TA-90**: 6 records (5 ETFs, 1 tracking fund), all hold the shares, all in shekels, none hedged, no route abroad. The fund step is almost nothing here: the labels are the same on every row and the hedging filter has nothing to filter.

The page has to stay right in both: what is large for the S&P 500 may be empty for the TA-90.

### 3.2 The questions, in the order the reader has them

1. **"I already have an account at my bank. How much does staying there cost me compared with the cheapest?"** Most readers already have a bank securities account, so the status quo is the first comparison. Today the account is one of 16 legal names in a dropdown inside the plan block.
2. **"Which account is cheapest for my amounts, and by how much?"** The ranking depends on the amount and the monthly sum (minimum commissions, fixed fees, custody as a percentage), so the plan stays the first thing on the page.
3. **"Why is it cheaper?"** Which fee line makes the difference (custody, buying, an account fee). This also tells a reader at their own bank what to negotiate (3.5, D4).
4. **"What do I buy there?"** One security number. "Any of these, they are the same for you" is a full answer.
5. **"Can I buy every month automatically?"** The הוראת קבע label.
6. **Only for a foreign index: "with or without the dollar?"** Hedged and unhedged funds hold different things. This is a preference, not a cost.
7. **Only where a route abroad exists: "is buying abroad worth the hassle?"** It is a different kind of route (self-reporting, W-8BEN, US estate tax, not supervised by the ISA), not one more row.

### 3.3 What to show visually

- **The accounts: bars of the extra cost against the cheapest, in shekels over the horizon.** The difference is the comparison. Bars of "what is left" (73,740 to 78,943 ₪) start at zero and look the same; bars of the gap (0 to 5,203 ₪) show it. The reader's own account is marked; accounts within the tie threshold of the cheapest share the first place (D5). The absolute "what is left" appears once, in the headline. Each bar can split into its fee lines (question 3). Product.md 3.4 asks for this: "a chart of cumulative cost by provider" and "which fee type drives the ranking".
- **The funds: no chart.** Differences of tens of shekels drawn as bars look bigger than they are. A short list: the tied group first ("the same for your plan"), then the rest, with labels carrying what differs.
- **Abroad: one card beside the best way in Israel.** It shows the cost gap and the list of what abroad demands, side by side. It stops appearing in the account list as "בלי קרן: לא חושבה קרן שנקנית אצלו".

### 3.4 When a filter helps and when it is clutter

A filter earns its place when all three hold:

1. **It matches a preference or a constraint the reader actually has**, one that changes what they own or whether they can act. Hedged or not is one, and so are "in Israel only" and "only where I can buy by standing order". ETF or tracking fund, and swap or physical, are not: the result already prices the first, and few readers have a view on the second, so labels serve them.
2. **Both sides are non-empty for this index.** The hedging filter on the TA-90 or the TA-125 filters nothing.
3. **The list is long enough that filtering saves reading.** 14 funds, perhaps; 6, no.

A filter is clutter when it repeats the sort (the list is already ordered by cost), when it repeats another control, or when it fails any of the three.

Today the page has a filter that fails test 2 on the Israeli indices (hedging, always shown). It also has **three controls that choose an account**: the "החשבון שלכם" dropdown, the clickable account rows, and the 16 chips above the fund table. Proposal: one. The reader names their account once, and choosing a row in the account list opens its funds. The chips go.

Hedging becomes a question with two answers, shown only when the index has both kinds: "כמו המדד (חשיפה לדולר)" and "מנוטרל מט״ח". Its answer decides which funds take part in the whole comparison, accounts included, rather than filtering the fund table after the ranking was made over both.

### 3.5 The order this gives

1. The index and the plan (amount, monthly sum, years), and "where is your account now?" (optional).
2. The answer: your account against the cheapest, or the cheapest way when no account is named.
3. The accounts as gap bars, ties grouped, your account marked; tap one for its fee lines and its funds.
4. The funds at the chosen account: the tied group first, labels, the hedging question only where it applies.
5. Abroad as one card, only where a route exists.
6. What to do now.

The folds today ("מה כל בחירה שווה", "קרן סל או קרן מחקה", "מה עושים עכשיו"): the first becomes sections 2 and 3 of this order, the second goes (section 1), and the third stays.

### 3.6 Mockups (2026-10-27)

Static PC pictures in `mockups/` (1366 px), for a reader who chose the S&P 500, has a Leumi account and the default plan. The account and fund figures are the live site's of 27.10.2026. The split of each account's cost by fee type, and the "הוראת קבע" labels, are illustrative only: the engine does not output the split yet, and the standing-order data is not collected.

**Round 1** (`source.html`): A, the gap bars first; B, your account and the cheapest as two cards side by side; C, the account list beside the chosen account's detail.

**Founder, round 1 (2026-10-27):** drop A; judge on PC only and work out the phone later. C uses space well. Stacked bars are "10x easier to comprehend" one above the other than side by side (B's two cards). Every label gets an icon and a distinct colour. Show the sum invested. Fix the text that wrapped or clipped. More options that build on C.

**Round 2** (`source-round2.html`), all four built on C. They share:
- the top: index pills, the plan, "החשבון שלכם", and the currency question on the same row;
- a strip of four figures: what you put in (70,000 ₪ = 10,000 ₪ + 500 ₪ × 120), what is left at the chosen account, what it costs you there, and how much more is left than at your account;
- labels with an icon and a colour per family: how it trades (cyan), how it tracks (magenta), payout (green), currency (gold), tax (coral), standing order (lime), what it asks of you (amber), an open rule (red with a lock). Blue and violet stay reserved for entered and computed numbers. These are new tokens if adopted.

The four options:
- **C1, list and detail** (`option-C1-pc.png`). The account list (rank, small gap bar, gap) beside the chosen account. The detail has two cost bars on one scale, the chosen account above your account. Then a sentence on which fee lines make the gap, with a link to type a negotiated fee, the funds, and the steps.
- **C2, the list is the chart** (`option-C2-pc.png`). Every account's cost as a stacked bar, one above the other on one scale, with its total and its gap. You see every account's cost and why at once. The narrow column beside it holds the chosen account's funds and the steps, and buying abroad sits under the chart.
- **C3, from what you put in to what is left** (`option-C3-pc.png`). As C1, but each bar is the whole sum the money would be worth with no costs: what is left (teal), then each fee line and the tax, with a dashed line at what you put in. It shows what share the costs take, and on this plan that share looks small next to what is left.
- **C4, compare chosen accounts** (`option-C4-pc.png`). Tick up to three accounts in the list (the cheapest and yours are ticked first). Their bars stack one above the other, then a table of fee lines by account: totals and what is left. It is the most exact, and the reader has to choose what to compare.

`option-B-sp500-pc.png` stays from round 1 for reference.

**Founder, round 2 (2026-10-27):** C2 chosen: the fee breakdown belongs to the broker's row. Move the fund number and its link up, next to the fund's name. Take the sum invested out (clutter). Give the broker table column headers. Two questions to think through: will readers know whether they want a hedged fund and what it costs; and is it fair to compare brokers when each is priced with a different fund?

### 3.7 Hedging, and brokers priced on different funds (2026-10-27)

**Hedging.** Readers will not know whether they want "מנוטרלת מט״ח". It is a choice of what you hold, not a fee: a hedged fund follows the index alone, while an unhedged one follows the index plus the dollar against the shekel (ETF-10, ETF-12). The rule base has no rule on what hedging costs. The existing label text puts that cost inside the fund's fees or its tracking difference, and tracking difference is not collected. The comparison also assumes no change in the exchange rate (method A-03). So the site can show the fee difference and must say that the rest is not known.

The lead first proposed a hedged index variant among the index chips. **The founder's proposal, which the mockups follow:** hedging is a label, not a filter. Every label opens an explanation when clicked, and the fund list can be filtered by label. The hedging explanation has three parts:
- what it means (ETF-10);
- a worked example (10,000 ₪, the index unchanged, the dollar down 10% or up 10%), marked as an example, not a forecast, and leaving out the cost of hedging;
- what it costs here: the fee gap at the chosen account (1,098 ₪ at Psagot), and a statement that the rest of the cost sits in the tracking difference, which is not collected.

The labels that can filter are only the ones that split the list. "צוברת", which every fund has, is not offered.

**Brokers on different funds.** A broker's charges depend on the fund's type (ETF, tracking fund, foreign security), not on the specific fund. A fund's own fees do not depend on the broker. So "a different fund at each broker" means "a different type at each broker".

The live data shows something that makes this sharper. At 10 of the 14 accounts the collected tariff has no line for mutual-fund units ("בתעריפון אין שורה ליחידות של קרן נאמנות"). Those 10 are priced only on an ETF, while Psagot, Leumi, IBI and Altshuler Trade are priced on a tracking fund. The gap is partly a data gap. Priced on the same ETF at every account, Leumi drops from second place (76,322 ₪ with a tracking fund) to sixth (73,036 ₪).

The best ETF at every account is the same fund, ATF סל (4D) S&P 500, so "compare on ETFs" really is the same fund everywhere.

Round 3 (`source-round3.html`) builds the decisions into C2. In all three, the broker bar shows only what the account charges (buying, custody, account fee); the fund's fees and the tax move out of it. The broker table has column headers, the fund number sits next to the fund's name, and the sum invested is gone.
- **E1, each account with its cheapest fund, said plainly** (`option-E1-pc.png`). A "מחושב עם" column gives the fund type and, where it applies, "קרן מחקה: אין בתעריפון". The gap is split into "מהחשבון" and "מהקרן" where the type differs. It shows the "מנוטרלת מט״ח" explanation open above the fund list.
- **E2, account × fund type** (`option-E2-pc.png`). Each account has two cells, the best tracking fund and the best ETF, each with what is left, what the account charges, and a thin bar. The better cell is framed, and a missing tariff line is a dashed cell. It shows the fund list filtered by the "מנוטרלת מט״ח" label.
- **E3, compare on the same type** (`option-E3-pc.png`). A switch reads "השוו את החשבונות על: הזולה בכל חשבון · קרן סל: אותה קרן בכל חשבון · קרן מחקה: 4 חשבונות". On "קרן סל", every account is priced on the same fund, so the bar is the whole difference; the fund list is filtered to ETFs.

The values left at each account, per type, are the live site's (read account by account on 27.10.2026). What each account charges, and its split by fee type, are illustrative.

**Founder, round 3 (2026-10-27):** none of E1 to E3, apart from the label explanation. E1 reads unnaturally, E2 worse; E3 is the best of them, but not its "השוו את החשבונות על" switch. The design must also hold once the missing tariff lines are researched.

### 3.8 Round 4: two linked lists (2026-10-27)

E3 worked because every account was priced on the same fund. What failed was asking the reader to pick a pricing method. Round 4 (`source-round4.html`) drops the method: **the fund the reader has selected is the context.**
- The page opens on the cheapest pair, account plus fund, named at the start of the figures strip.
- The account list shows every account for the selected fund. The fund list shows every fund at the selected account, with a radio on each row.
- Clicking a fund re-ranks the accounts; clicking an account re-ranks the funds. The comparison with your account is always on the same fund ("על אותה קרן").
- An account whose tariff cannot price the selected fund is listed under the ranking: "N חשבונות שאי אפשר לחשב עם הקרן הזו", with the reason and what it would leave with a fund it can price. This is D17's "not evaluated, with the reason".
- When the research fills a gap, that account simply joins the ranking, and nothing in the design changes. That is the founder's condition.

Three states of the same design:
- `option-F1-pc.png`: today, as the page opens (Psagot with Yalin's tracking fund): 4 accounts ranked, 10 that cannot be priced on a tracking fund.
- `option-F2-pc.png`: today, after the reader picks ATF's ETF: all 14 ranked on the same fund; the strip offers the way back to the cheapest pair.
- `option-F3-pc.png`: once the tariffs are researched. **The ten missing values are made up for the picture.**

The label explanation from round 3 stays as it is.

**Founder, round 4 (2026-10-27):** "eureka! the linked list makes sense a lot. lets make it more intuitive and build upon that idea."

### 3.9 Round 5: making the link visible (2026-10-27)

In round 4 the link between the lists was only a sentence ("בחרו קרן אחרת ברשימה שמשמאל"). Round 5 (`source-round5.html`) makes it something the reader can see:
- **A slot at the top of each list** shows what is chosen there: the account (name, what it charges on this fund, who supervises it, "איך פותחים") and the fund (name, number ↗, fees). A "+" joins the two slots. Above both, the result: what is left, and the gap to your account on the same fund.
- **Each list says what it depends on**, as a chip with the same icon as the other slot ("כשקונים בהם את [◔ ילין לפידות…]", "בחשבון [🏛 פסגות]"). A building icon always means an account, and a pie always means a fund.
- **A round select button on every row** of both lists, and the cheapest pair marked "★ הזול" when the reader has chosen something else.
- **Accounts that cannot be priced with the chosen fund** are named under the list with the reason. Once researched, they join it.

Three variants:
- `option-G1-pc.png`: the slots, with absolute values in both lists.
- `option-G2-pc.png`: the same, but each list shows what changes if only that half changes ("אם מחליפים רק את החשבון": −2,621 ₪; "רק את הקרן": −37 ₪), with "הבחירה" on the chosen row.
- `option-G3-pc.png`: the reader has chosen their own account (Leumi). The result shows two cards, their pair (76,322 ₪) and the cheapest pair (78,943 ₪, "+2,621 ₪ אם עוברים לפסגות"). The fund list at Leumi groups the tracking funds first, then a line: ETFs leave at least 3,286 ₪ less at Leumi. The figures are the live site's.

**Founder, round 5 (2026-10-27):** G1 while the reader is on the cheapest pair, G3 once they change either half. Bring back the sum invested, and improve the fee breakdown.

### 3.10 Round 6: the sum invested and where the money went (2026-10-27)

`source-round6.html`, two states of one page:
- **`option-H1-pc.png`, on the cheapest pair (G1):**
  - The result reads "הפקדתם 70,000 ₪ ← נשאר לכם 78,943 ₪", with the pair named and the gap to your account on the same fund.
  - Under it is one bar, "מה יצא בדרך", split into the account's lines (buying, custody, account fee), the fund's fee, and the tax. Each segment carries its amount, and the key groups the segments by who takes them: החשבון / הקרן / המדינה.
- **`option-H3-pc.png`, after a change (G3):**
  - The same "הפקדתם" figure, then two cards: your choice (Leumi + the fund, 76,322 ₪) and the cheapest pair (78,943 ₪, "+2,621 ₪ אם עוברים לפסגות · בחרו את הזוג הזה").
  - The two cost bars are drawn one above the other on one scale. One sentence says where the gap comes from: what the account charges, mostly custody and buying; the fund's fee is the same because it is the same fund; the tax is smaller because the gain is.
  - That sentence ends with the link to type in a negotiated fee.

Shared by both states:
- **The account slot lists the account's own lines:** what each is charged on (each purchase, the value each quarter, a fixed sum each month), its amount over the horizon, and the total. *Removed the same day (founder: "in the broker tab, remove the top legend"): the result's bar already shows these lines, so the slot keeps the name, the supervisor and the link.*
- **The fund slot gives the fund's fee in shekels.**
- **The account list's bars now use a scale that fits the main group.** The two far larger accounts are drawn with a break mark ("⫽ הפס נחתך").

The sum invested is in the result, never inside a cost bar (founder, round 2).

Everything in the cost split, the slot lines and the "why" sentence is illustrative: the engine does not output costs by line yet. That output is the first thing to build for this page. The "left" figures and the sum invested come from the live site.

**Founder, on round 6 (2026-10-27), applied the same day:**
- The fund's number and its link sit on the same line as its name, in the list and in the slot, never wrapped below it.
- The cost heading is "כמה זה עולה לכם ב־10 שנים" (one pair), or "…, בכל אחד מהזוגות" (two pairs). It replaces "מה יצא בדרך".
- The account's lines get distinct hues: buying orange, custody yellow, account fee brick red, the fund's fee olive green, tax rose. These are new tokens if adopted; blue and violet stay reserved.
- The result no longer names the account and the fund, since both are highlighted in their lists. The cheapest pair's card still says "אם עוברים לפסגות".

### 3.11 Built (2026-10-27)

The founder: "nice. implement it. in the fund table use differences not absolute number. make sure the funds list isnt filtered by the banks yeah? and the banks not filtered by the funds."

- **Lists:** `site/app/components/invest/pair.tsx` holds the result and the two lists. Every account is listed for the chosen fund, and every fund at the chosen account. A row that cannot be priced stays, with its reason; clicking it picks it and the other half that leaves the most with it. The fund list shows differences from the chosen fund.
- **Numbers:** from `lib/invest.ts`. Every way now keeps the account's cost by tariff line (`byType`, F-61 inside F-63). `pairCosts` adds the fund's fee line (F-61) and the tax (F-06) for the chosen pair and the cheapest one. The sum put in is the amount now plus the monthly sum times the months, in today's shekels (F-05 with A-04's constant real deposits). The method note is under F-63.
- **Kit:** `CostStack`, `PickList`, `LabelFilter`, each in the gallery. Labels take their family's colour. The tokens are `--chart-cost-*` and `--label-*`.
- **What stayed:** an index with no fund records (a custom index) keeps the earlier houses-and-funds view and its request for funds. The steps follow the chosen pair.
- **Not built yet:** the hedging explanation with the worked example (3.7); a negotiated account fee typed on the page; the standing-order label (data not collected); the phone layout (the founder: PC first).

**Structure review** (`node research/audit/tools/merge-review.mjs origin/main`, 22 files):
- Sent back and fixed:
  - Hebrew input names in `lib/invest.ts`: the file's existing `inputMap` is used instead.
  - A hand-styled reference pill: the kit's `Tag` is used instead.
  - A second copy of the fund-fees helper: `funds.tsx`'s `Fees` is exported and reused.
- Kept as the page's own anatomy, built from the kit and used once:
  - `PairResult`, `AccountColumn`, `FundColumn`, `CostBar` (a label and a total around `CostStack`), `CostLegend` (`ChartLegend` grouped by who takes the cost);
  - `Fees`, now shared by the two fund views of the page;
  - `Steps`, which existed already and only gained the chosen pair.
- Promoted: `CostStack`, `PickList`, `LabelFilter`, each with a gallery entry.

No independent reviewer is needed under 30 files.

**Later the same day.**
- The page frame is wider on a large screen (`max-w-wide`, 96rem). The founder asked: "on pc, you have more space to work with no?". At 1,280 px and up the fund list gets 7 parts of the width to the accounts' 5, and a fund's labels fit on one line at 1,920 px.
- The result block now has one shape. The founder reported: "the page is still jumping when changing from the winning combination". Moving from the cheapest pair (one bar) to any other pair (two cards, two bars) grew the block by about 140 px. The tapped row stayed put, but everything above it jumped.
  - On the cheapest pair, the second card and bar show the next pair ("הזוג הבא בתור", the ranked pair that leaves the most after it).
  - The legend names every account line.
  - A bar's name keeps to one line, and a card's title takes two lines on a phone.
  - Measured over seven picks at 1,920, 1,366, 768 and 390 px wide, the block keeps one height; on a PC the page no longer scrolls at all on a pick.
- The cheapest account keeps its "★ הזול" tag when it is picked too. Before, the tag showed only while another account was chosen, so picking or leaving the cheapest added or removed a line in its row. The founder: "make the cheapest always show the star sign because it stretches the page and scrolls down".
- 2026-10-28, the founder: "clicking the number changes the choice, and theres "a" , "b"". Two fixes:
  - A figure inside a list row opens its sheet without picking the row. The fix is in the kit's `PickList`: a click on a control inside a row belongs to that control.
  - A gap's sheet names its two inputs by whose they are ("הבחירה שלכם: נשאר", "הזוג הזול ביותר: נשאר", or a fund's name), not "a" and "b".

## 4. Against `docs/product.md`: what else the page owes the reader

`docs/product.md` section 2 states the reader's job: which fund variant and which provider, "which fees are worth fighting, and what they might be failing to consider", then act, and "be able to come back later and see whether anything changed".

1. **The fund type is presented as an option to choose (3.4, D28 (a)).** The "ETF or tracking fund" fold and its line in "what each choice is worth" put the type to the reader as a choice. Proposal: drop both. The type stays as the two labels it already is. If agreed, D28 (a) is amended to say the options are where the fund is held (in Israel, a foreign fund on TASE, abroad) and the fund type is a label.
2. **Near-ties are not named (D5; principle "collapse equivalent options").** See 3.3.
3. **The fund list has no coverage line (D17; dependency 6).** The page does not say how many funds track the index, or that the rest are not evaluated. Under the TASE terms that is a count and a link (CAT-43): "13 funds with a record; the full list on Maya ↗".
4. **The dimension checklist is missing (3.3; principle "show the dimension").** This is the founder's own blocker. Every fund record already carries `dimensions` marks. Proposal: the list for the chosen way, each dimension marked considered, not applicable or open.
5. **Which fee is worth fighting (3.5, D4).** A house row shows one total. Proposal: the cost by tariff line (3.3), a field for a fee the reader negotiated, and the regulator's per-bank average beside each line where one exists and may be quoted (D20, D22).
6. **Tax is not named in the headline.** It reads "נשאר בסוף, בכסף של היום"; the other comparisons say "אחרי דמי ניהול ומס".
7. **The steps assume a standing order.** Step 3 follows the הוראת קבע label.
8. **Protection (3.4 providers).** Who supervises each account and how client assets are kept are in the account's record (D6); one sourced line in the header, a label where an account differs.
9. **Coming back later (3.9).** A "this is what I did" button on the device; on a later visit, "still the cheapest" or "now X ₪ more than the cheapest".
10. **Abroad's cost side.** Currency conversion and the yearly reporting, each needing a rule record in il-finance first. Where a rule is missing, the page says so.

## 5. Decisions for the founder

1. Section 3.10: the round-6 page (G1 on the cheapest pair, G3 after a change), with the sum invested and the cost breakdown.
2. Section 3.7: hedging as a clickable label with a filter (the founder's proposal), and whether a label filter also re-ranks the accounts (E3) or only filters the fund list (E1, E2).
3. Section 4 item 1: drop the "ETF or tracking fund" fold and amend D28 (a).
4. Section 4 item 5: a negotiated fee entered on this page.
5. Section 4 item 9: saving the chosen way on the device.
6. The labels still open in 2.2: קרן חדשה, דמי משמרת, דמי ניהול חשבון, צריך עו״ש בבנק.
