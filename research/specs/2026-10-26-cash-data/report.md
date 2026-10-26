# Report: cash-products data, branch `data-cash` (2026-10-26)

Written by the lead from the collector's final message; the harness refused the collector's own write. Commit 5d8fae5. **Not merged:** it waits for the founder's go.

`npm run validate`: data/ valid. Schema and pipeline tests: 146 pass.

## Files added
- **Funds (12)** in `data/funds/*@2026-10-26.json`:
  - 1223866 (Altshuler Shaham renewing, monthly): new snapshot with fee 0.19%, from Discount's 447A page.
  - 1220227 (Meitav renewing): new, fee 0.20%.
  - Ten shekel daily funds, fees from Leumi's 447A page (no manager's own page printed one): 5140918 0.06, 5127790 0.18, 5136544 0.16, 5139258 0.19 (trustee 0.01), 5137740 0.19, 5117700 0.18, 5141452 0.06, 5120852 0.17, 5137732 0.17, 5127881 0.24.
  - "Largest" uses a size field in Discount's feed that the page does not display. No regulator ranking of single funds was found.
- **Deposits (6)** in `data/terms/deposits/`, one-year fixed and one-year prime:
  - Hapoalim: fixed 1.74; prime "2.19% = 2.56% - פריים".
  - Discount: 0122 fixed 2.25; 0213 "p-2.25" (2.5).
  - Mizrahi: 131 fixed 1.55; 231 "P-3.55%" = 1.20%.
- **`data/series/mof-gov-bond-auctions.json`:** the latest auction per bond type, 27 observations, from data.gov.il `goverment-domesticdebt` (1,942 rows, up to 20.10.2026). The licence is open (data.gov.il/he/terms-of-use, 30.08.2025).
- **`data/fees/meitav-trade@2026-10-26.json`:** tariff 04/2026, meitav.co.il/media/zitlfr4f/עמלות-תעריפון-42026.pdf, linked from /trade/about/.
  - Tel Aviv securities 0.3% (min 10 ₪); makam 0.1%; US 1 cent a share or 0.7% (min $12).
  - Custody 0.15% (min 270 ₪ a quarter); FX 0.13% (spread up to 0.8%); account fee up to 90 ₪ a month.

## Sources (read 2026-10-26 by curl)
- **Discount 447A funds:** discountbank.co.il/private/savings-investments/savings-interest/ (its feed /api/MoneyMarket/MoneyMarketFunds, lastUpdatedAt 2026-10-26 10:04).
- **Leumi 447A funds:** leumi.co.il/he/savings/money-market-products. The as-of date is a script placeholder, so `effective_from` is null.
- **Hapoalim deposits:** forms/he/_api/deposit-products-data ("המידע נכון ל-26.10.2026").
- **Discount deposits:** /api/MoneyMarket/Saving (2026-10-25 18:00).
- **Mizrahi deposits:** /umbraco/surface/NabatDeposits/GetNabatDeposits?depositType=fixed (26/10/2026 08:31). Minimum and maximum amounts come from the terms PDFs of products 131 and 231.
- **Yalin Lapidot 5139258:** prospectus on mayafiles (P1629214).

## Not found
- **First International:** its feed needs a transaction-id header, and that request was refused. Its public page is for a person to read.
- **Trustee fees** for 11 of the 12 funds.
- **The renewing funds' expected net yields** (2.81%, 2.75%) have no schema field. One would be needed, for example `expected_net_yield`.

## What changes on the site if merged
- The shekel-cash fund list goes from 2 funds to 12.
- The comparison's lowest money-market fund fee drops to 0.06%. That figure mixes daily and renewing funds.
- Exposure mode's brokerage row for shekel cash falls back to the first fund file, which becomes 1220227 instead of 1223866.
- The three banks' company pages get the new deposits.
- Meitav Trade becomes a priced broker, likely the worst on the brokerage guide (see the custody doubt below).
- Unchanged:
  - the renewing-fund guide's run, since renewing funds take no fee drag;
  - every page, for the bond series: none reads it yet.

## Doubts
- **Meitav Trade:**
  - Custody 0.15% may be a quarter's or a year's rate; it is recorded per quarter. Its pages also say "פטור מדמי משמרת" and claim no FX conversion fee.
  - "1 סנט" is stored as $0.01 a share.
  - The minimum on other exchanges ("25 in the trade's currency") is null.
  - No line covers Israeli open mutual funds.
- **Bond yields:** no unit is printed; read as percent a year. The 20.10 auctions look like small allocations (cover ratio 1 or less). `stale_after_days` 14 is the collector's choice.
- **Fund 5139258:** its 2024 prospectus says 0.12%, with a rise allowed from 1.1.2026; both banks now print 0.19%. Neither bank says whether that includes the trustee fee.

## Pages for a person (next week)
1. First International: one-year fixed and prime rows (fibi.co.il/private/depositsandsavings/interest/).
2. Harel's fund page (HTTP 466 to scripts): the fee of 5127790.
3. yl-invest.co.il (Imperva): the current fees of 5139258 and 5141452.
4. Maya fund pages: trustee fee, ISIN and prospectus for the twelve funds. Maya refuses automated browsing; open by hand.
5. Meitav Trade's tariff against /trade/independent_trading/: the custody and FX conflict. **Settle before merging.**
6. new.isa.gov.il: does the 2025 fund report rank single funds?
