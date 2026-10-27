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

Someone with the S&P 500 or the TA-90 in mind makes two choices: the account and the fund. The page's own numbers (default plan: 10,000 ₪, 500 ₪ a month, 10 years) show how unequal they are:

| | S&P 500 | TA-125 |
|---|---|---|
| Same fund, another account: up to | 19,701 ₪ less | 19,618 ₪ less |
| Same account, another fund: up to | 3,891 ₪ less | 1,208 ₪ less |
| #1 and #2 fund at the cheapest account | 37 ₪ apart | 801 ₪ apart |

The fund figures also take tracking difference as zero, so the fund gaps are less certain than they look. **The account is the decision; the fund is mostly a tie.** The page should be built the same way: the account gets the visual comparison, and the fund gets a short list.

The data for the two indices the founder names:

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

1. Section 3: the account as the visual comparison (gap bars, ties, your account marked) and the fund as a short list.
2. Section 3.4: one control for the account, and hedging as a question that scopes the whole comparison, shown only where both kinds exist.
3. Section 4 item 1: drop the "ETF or tracking fund" fold and amend D28 (a).
4. Section 4 item 5: a negotiated fee entered on this page.
5. Section 4 item 9: saving the chosen way on the device.
6. The labels still open in 2.2: קרן חדשה, דמי משמרת, דמי ניהול חשבון, צריך עו״ש בבנק.
