# What moves the money: the four comparisons (2026-11-01)

For a builder of the indices page, once the founder has picked a drawing (`mockups-2.html`). All figures are outputs of the site's engine through `buildInvest`, measured with a scratch test: 7% gross return, 2% inflation, after tax, in today's money, on list tariffs. The drawing generator is `gen2.mjs`; it reads the scratch data those tests wrote, which is not kept.

## The comparisons

Each changes one thing. Hedged funds and funds with an open rule (`us-fund-open`) are out. Excellence is out of the solid figures and drawn hatched: it is an outlier and its price has not been checked by a customer.

| Bar | Definition | S&P 500, 10,000 ₪ + 500 ₪ a month, 10 years |
|---|---|---|
| The account | The pair with the most left fixes the fund; largest minus smallest over the accounts that sell it | 9,259 ₪ (23,276 ₪ with Excellence) |
| Fund kind, each at its own cheapest account | For each kind, the most left over all accounts; largest minus smallest over the kinds | 2,757 ₪ |
| Fund kind, same account | At each account selling both, the best Tel Aviv kind minus buying abroad; largest over the accounts | 21,936 ₪ (lowest 4,940 ₪) |
| The fund | At one account and one kind, largest minus smallest; largest over accounts and kinds | 3,694 ₪ |

## Over 72 plans

Lump sums of 0 to 1,000,000 ₪, monthly deposits of 0 to 5,000 ₪, 3, 10 and 25 years, against the first, second and fourth bars:

- S&P 500: the account is the largest in 71 of 72 plans.
- TA-125: the account is the largest in all 72.
- The fund bar as a share of the account bar, S&P 500, 10 years: 15% at 10,000 ₪ once, 40% on the opening plan, 80% to 86% at the large sums. TA-125: 3% to 16%.
- The same-account kind bar depends mostly on monthly buying: 916 ₪ for 10,000 ₪ once, 21,936 ₪ on the opening plan, 21,248 ₪ for 500 ₪ a month alone.

The page must compute the bars for the plan in hand and write no conclusion into the copy. Rows keep their order and place when the plan changes. A full S&P 500 view took about 35 ms in the test, so the four small plan cards may need to wait until the hand rests.

## Left open

- Excellence: whether its price holds, by its documents or a customer.
- Foreign kinds rest on open tax rules, drawn hollow. Flat dollar assumed.
- This is a model of the collected list tariffs, not a record of what anyone paid.
