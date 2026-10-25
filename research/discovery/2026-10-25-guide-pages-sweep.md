# Guide pages: what the chart gets wrong (sweep, 2026-10-25)

Input to the guide-page redesign the founder opened on 2026-10-25 ("before we build anything we need to think about what we want to show in these kinds of pages"). Found from his screenshot of `/guide/current-account`, then swept over every page with a timeline or a return field by a builder (Sonnet) and checked by the lead with engine probes.

## Findings

1. **A return field that nothing reads.** "תשואה בשנה" (A-01), its chip and the headline "בתשואה של …" appear on every guide page. The runs of bank-deposit, savings-plan, current-account, money-market-fund-daily, makam and government-bond never read A-01: typing 10% changes nothing, yet the page marks it "הזנתם" and draws the dashed "entered" line. The renewable money-market fund has no chart (G-30).
2. **A site assumption where a record holds a sourced figure.** The three deposit-family pages run on P-05's `cash_rate` (3.5%), not on the bank's published rate in the record P-05 names: Leumi current account 1.0%, one-year deposit 1.8%, three-year savings plan 1.5%. The goal comparison already uses the published rates (A-21, A-25).
3. **The current account's ceiling and conditions.** Leumi pays its 1% only on up to 10,000 ₪ and only to customers who meet its conditions (salary or pension paid in, plus a Leumi mortgage, 7,000 ₪ a month on a Leumi card, or a securities account; not Pepper). Checked against Leumi's 447 PDF, data as of 26.10.2026, pp. 79 to 80. Customers who don't qualify get no interest (the table pays only eligible customers). Since 2026-10-25 the comparison and the idle-cash baseline apply the ceiling (engine `balanceCeiling`); the guide does not.
4. **One bank stands for the product.** Every bank-product guide page uses Leumi's figures only because Leumi's are the only rate tables collected (P-05 names them). The page reads as if Leumi's terms were the product's.
5. **The current account's fee row** prints "דמי ניהול 0 ₪"; the account has fees, they just don't depend on the balance.
6. **Today's-money contributions line** divides nominal deposits by the end-of-horizon index (F-06), so on the current account it ends near 62,700 ₪ while today's-money paid-in is 70,000 ₪.
7. **The chart is the same on every page.** Money in, growth at an assumed rate, fees and tax out. It shows the assumption more than the product, so every product looks alike, and what defines each product (a lock, an exemption, liquidity, an employer's share, a fee drag) is not on it.

## Numbers on the default plan (10,000 ₪ now, 500 ₪ a month, 10 years, 2% inflation; today's money)

| Page | Today (3.5%, no ceiling) | On the bank's published rate |
|---|---|---|
| Current account | 74,044 | 63,375 (1% up to 10,000); about 62,700 at 0% |
| Bank deposit | 74,073 | 68,270 (1.8%) |
| Savings plan | 74,129 | 67,309 (1.5%) |
| Money-market fund, makam, bond | 73,972 / 69,859 / 75,651 | unchanged (no published rate collected; D20) |

## Clean

Provident, pension, brokerage-account and IRA study-fund pages read A-01. `/exposure/:id` has no timeline. The funds workbench waits for a return where one is needed. The goal comparison uses `cashRateFor` for cash-like candidates.

## The reverted fix (for reference)

A fix was built and then reverted at the founder's request to decide the pages first: cash-like pages ran on the record's rate through `withCashRate`, ignored A-01, and showed a per-page "ריבית בשנה" field stored in the own-rates store under goal id "guide", plus the ceiling line and a "fees don't depend on the balance" row. Kept: the engine ceiling and its use in the comparison and idle cash.
