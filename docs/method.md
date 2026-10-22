# Method: how every number on the site is computed

Written 2026-10-22 by the financial modeler from `docs/product.md` (D1 to D13), `docs/roadmap.md`, and the `il-finance` rule base (`.claude/skills/il-finance/references/`, 803 rules, checked 2026-10-22). Every rule is cited by its ID; no rule is stated from memory. Where the rule base is open, the formula is marked **blocked** and the engine must not compute it (D10).

Status: **draft for founder review.** F-83 and gaps G-28 to G-30 added 2026-10-23 for product D17 ("no blind spots"). Basis decisions B1 to B3 were chosen by the founder on 2026-10-22 (section 1). The golden scenarios in `tests/golden/scenarios.md` exercise every formula below; the founder adds expected results from his own spreadsheet.

How to read it:

- `A-nn` is an assumption: a visible input with a default and a source. Every assumption is listed in section 2. No formula uses a constant that is not an `A-nn`, a rule figure read from `data/rules/`, or a site parameter read from `data/parameters/` (`P-nn`).
- `F-nn` is a formula. The engine implements formulas by number; the finance-reviewer checks the engine against them.
- `G-nn` is a gap: something the method cannot compute yet, with the open question that blocks it (section 12).
- Rule IDs (`TXS-09`, `PF-02`, ...) point into `il-finance`. The strength shown is the rule's strength as recorded there; `institution` strength is flagged, not treated as primary (coverage.md F1).

---

## 1. The comparison basis

Chosen by the founder on 2026-10-22 after the alternatives below were put to him.

**B1. Liquidation value at the horizon, at equal net outlay and equal gross return, in real terms.** Every eligible wrapper receives the same shekels out of the person's pocket on the same dates (the amount now and the monthly contribution, section 3). The exposure earns the same gross return in every wrapper (D9 wrapper mode). The engine applies each wrapper's deposit-side tax effect, its fees, the drag inside the instrument, tax during the holding period and tax at exit, as if everything were withdrawn at the end of the horizon. The result is the real value of that withdrawal (F-40). Ranking and ties use that one number.

Alternatives considered and rejected: ranking on the annualised net real return (IRR), which handles irregular contributions but hides shekel differences and makes the tie threshold hard to state; and a two-figure basis (value if held, value if withdrawn), more honest for lock-ups but with two ranking keys. The chosen basis understates wrappers whose benefit is deferral past the horizon; the output says so wherever a wrapper's lawful exit is later than the horizon (B3).

**B2. Only the person's own money ranks.** Employer-funded deposits (hishtalmut, pension, provident fund for annuity) are computed by the same engine and shown as a separate line, "only available in this wrapper", with their value at the horizon (F-52). They do not enter the ranking, because no other wrapper can receive them.

**B3. Wrappers still locked at the horizon are listed, not ranked.** A wrapper whose lawful exit (section 8) is after the horizon appears with "locked until <date>" and its value at its own first exit date, computed by the same engine with the horizon moved to that date. Contributions stop at the goal's horizon; the balance grows until that date (product D16). It enters the ranking only if the person opts into early withdrawal, in which case the early-withdrawal tax rule applies (F-47, F-48). The same treatment applies to a wrapper whose exit tax is blocked by an open rule (G-list): it is listed with its pre-tax value and the reason, and it is not ranked.

---

## 2. Inputs, assumptions and parameters

### 2.1 The three number states (D7)

Every input below carries one of: **sourced** (read from a file under `data/` with source and date), **entered by you**, or **computed** (derived by a formula here). The page shows the state next to the number. A sourced default that the person overrides becomes "entered by you".

### 2.2 Assumptions

| ID | Name | Default | Source of the default | Unit | Used by |
|---|---|---|---|---|---|
| A-01 | Gross annual return of the exposure, `r_g` | Cash-like exposures: the sourced series for that exposure (A-20 to A-24). Equity and bond exposures: **no default; entered by you** (D9). | `data/series/` | % a year | F-10 |
| A-02 | Annual inflation over the horizon, `π` | **Entered by you.** No sourced series exists in the rule base (G-01). When `data/series/cpi-expectations` exists, its latest value becomes the sourced default. | none yet | % a year | F-02, F-03, F-41 |
| A-03 | Exchange-rate change of the instrument currency against the shekel, `f` | 0 (flat), entered by you | none; the live rate for the start value is sourced from BoI (`data/series/fx`) | % a year | F-04, F-33 |
| A-04 | Contribution pattern | Constant in real terms (each month's contribution rises with `π`) | product.md "real terms by default" | switch | F-05 |
| A-05 | Timing convention | Contributions on the first day of the month; growth over the month; balance fees and distributions on the last day; exit on the last day of month T | method convention | — | all |
| A-06 | Inside-the-instrument drag, `d` | Per instrument from `data/funds/` or the regulator average for the category (MF-18, MF-19, ETF-17) | Maya export, ISA report, CMA data | % a year | F-10 |
| A-07 | Tracking difference beyond fees | 0 | entered, or the fund's 12-month published figure (ETF-08, ETF-09) | % a year | F-10 |
| A-08 | Bid-ask half-spread on exchange trades | 0 | entered, or the fund's published median spread (ETF-07) | % of trade | F-13 |
| A-09 | Variable management fee of an Israeli tracking fund | 0, bounded by the category cap 0.1 / 0.2 / 0.3% (ETF-14) | fund annual report | % a year | F-10 |
| A-10 | Distribution yield of a distributing fund, `y` | 0 (accumulating) | fund documents (ETF-19, ETF-28, ETF-30) | % a year | F-20 |
| A-11 | Fund-level foreign withholding drag | By domicile from `data/funds/`: US-domiciled 0 at fund level; Irish-domiciled holding US shares 15% of the dividend yield (TXF-16); Israeli exempt fund holding foreign assets: the fund's reported tax expense (ETF-13 "tax expenses") | TXF-16, ETF-13 | % a year | F-10 |
| A-12 | Age at start, employment type, gross monthly salary, existing employer and employee pension and hishtalmut rates, whether a pension and a hishtalmut already exist | Entered by you, with "where to find this on the payslip" (PEN-36, TXP-25; labels not sourced, G-19) | — | — | F-30s, F-50s |
| A-13 | Other taxable income in the exit year, `Y` | 12 × salary if the horizon ends before retirement age (PEN-26); 0 otherwise | computed from A-12 | NIS | F-42, F-43 |
| A-14 | Refund of over-withheld tax is claimed | Yes | TXG-25 (six-year refund window) | switch | F-42 |
| A-15 | Deposit term for bank deposits and renewable money-market funds, `n` | 1 month | the 447 taxonomy (BANK-14) | months | F-21, F-22 |
| A-16 | Deposit rate type | Unlinked, fixed | BANK-25, BANK-26 | enum | F-21 |
| A-17 | Insurance cost inside a pension fund | **Entered by you** (G-12) | none; tables not collected (PEN OQ7) | % of deposits | F-53 |
| A-18 | Direct investment expenses of a provident track | The manager's published rate for the track from `data/funds/` (PF-10 examples), else 0 with a "not collected" flag (G-14) | PF-10, PF-11 | % a year | F-15 |
| A-19 | Fee discount period and the list fee it reverts to | From the provider record, but never shorter than the 5-year minimum of CMA circular 2017-9-15, which covers every institutional body except sector and guaranteed-return funds, kupat gemel lehashkaa included (PF-13). The 2 years in some bylaws (KGL-16) is the replaced 2012 rule | PF-13, PF-14, KGL-16 | months, % | F-16 |
| A-20 | Bank of Israel policy rate | Latest value, sourced | BoI EDGE (BANK-22) | % a year | F-10 for daily money-market funds (F-23) |
| A-21 | Per-bank average deposit rate | Latest value for the chosen bank and term, sourced; labelled "average paid at this bank last month" | BoI EDGE INTEREST_DASH (BANK-22) | % a year | F-21, F-60 |
| A-22 | Makam yield to redemption | Latest, sourced | BoI EDGE SECDWH (GOV-19) | % a year | F-24 |
| A-23 | Government bond yield and coupon | Latest, sourced | BoI EDGE, data.gov.il auctions (GOV-19) | % a year | F-25 |
| A-24 | Renewable money-market fund expected yield | The fund's published expected yield, which is net of fund fees and before tax (MF-37) | fund report via bank display (BANK-15) | % a year | F-23 |
| A-25 | Current-account credit interest rate | The bank's 447 row for current-account balances (BANK-13), else 0 | bank 447 table snapshot | % a year | F-26, F-60 |
| A-26 | The person's own deposit offer (idle-cash preset) | Entered by you | — | % a year | F-60 |
| A-27 | Price change of a bond at exit | 0 (sold or redeemed at par) | convention | % | F-25 |
| A-28 | Trades per month, deposits per year, foreign-currency purchases, holding period (workbench behaviour) | 1 trade per contribution, 12 deposits a year, FX purchase on every contribution when the instrument is not in shekels, holding period = horizon | product.md 3.4 inputs | — | F-12 to F-14 |
| A-29 | Largest fall accepted per exposure type (loss filter, D11) and the worst fall the person expects for that exposure | Entered by you, both | — | % | F-71 |

### 2.3 Site parameters (`data/parameters/`, N1)

Values are the founder's, with rationale and sign-off date, shown as "site parameter". The method only names them.

| ID | Parameter | Used by |
|---|---|---|
| P-01 | Tie threshold `θ` (relative difference in real liquidation value below which two options are a tie) | F-80 |
| P-02 | Sensitivity bounds per assumption (how far A-01, A-02, A-03, A-06, fee rates and the horizon may be moved) | F-81 |
| P-03 | Fee-verdict thresholds (real shekel cost over the horizon, and share of total drag) for "worth negotiating", "worth avoiding", "not worth the effort" | F-62 |
| P-04 | Classification-to-horizon fit table (which CMA track classifications fit which horizon band and loss filter) | F-70 |
| P-05 | Illustrative scenario for guide pages (amount, monthly, horizon, `r_g`, `π`) | F-90 |
| P-06 | Tolerance for golden tests (absolute NIS and relative) | tests |

---

## 3. Time, money and the deflator

**F-01 Time grid.** Months `m = 0, 1, …, T`, `T = 12 × horizon in years`. Dates are calendar months; the tax year is the calendar year (TXG-01). Age-based rules use the person's age on the first day of the month.

**F-02 Monthly inflation.** `π_m = (1 + π)^(1/12) − 1` (A-02).

**F-03 CPI index path.** `I_0 = 1`; `I_m = I_{m−1} × (1 + π_m)`. Where a sourced CPI history exists (`data/series/cpi`), past months use actual index values rescaled so that `I_0 = 1`. Tax rules use "the index last published before the day in question" (TXG-12, TXG-14); with a monthly grid the engine uses `I_m` for an event in month `m` and records this one-to-two-month simplification as a convention of the method, not a reading of the rule.

**F-04 Exchange-rate path.** `X_0 = 1`; `X_m = X_{m−1} × (1 + f)^(1/12)` (A-03). For an instrument denominated in or linked to a foreign currency held by an individual, `X` replaces `I` as the tax index (TXS-04, TXF-03; for a TASE foreign fund only if the 90% test holds, TXF-04; for an Israeli foreign-investment fund, its principal currency, TXS-14).

**F-05 Contributions.** `C_0` = amount now; for `m ≥ 1`, `C_m = C × I_m` if A-04 is "constant real", else `C_m = C`. A wrapper's deposit ceiling (section 8) caps `C_m`; the excess is reported and routed to the next goal in the person's order (D12), never silently dropped.

**F-06 Real value.** Any nominal amount `V` at month `m` is shown as `V / I_m`. Projected values are real by default and nominal on request.

**F-07 Annual to monthly rates.** `g = (1 + r)^(1/12) − 1` for returns and yields quoted as effective annual rates (bank deposits are quoted that way, BANK-04). Fees quoted as "% a year of balance" are charged as `φ / 12` of the end-of-month balance (PF-09 says balance fees are collected monthly and prorated by days; the monthly twelfth is the method's convention and the golden tests use it).

---

## 4. The ledger (one run per wrapper, provider and instrument)

The ledger is the single engine behind 3.1, 3.2, 3.4, 3.5 and 3.6. State at the end of month `m`:

- `B_m` market value of the holding (nominal shekels);
- `P_m` nominal tax basis, the sum of the amounts invested in units still held;
- `K_m` indexed-basis accumulator, `Σ basis_i / J_i` over lots `i` still held, where `J` is the tax index of the instrument (`I` or `X`, F-03, F-04). The adjusted basis at any later month `t` is `K_m × J_t` (TXG-12: adjusted cost = cost × index at sale ÷ index at purchase). Lots leave in first-in-first-out order (TXS-06);
- `Φ_m` cumulative fees paid, by fee type; `Θ_m` cumulative tax paid during the holding period;
- `E_m` cumulative employer money (B2) tracked as its own sub-ledger.

**F-08 Month step.** For `m = 1 … T`:

1. Deposit-side tax effect: gross deposit `D_m` from the person's net outlay `C_m` (F-30 to F-32; `D_m = C_m` where no benefit applies).
2. Entry costs: the cash left after the deposit fee and the FX fee, `A_m = D_m × (1 − φ_dep) − fee_fx(D_m)`, pays for the trade and its commission: `A_m = V_m + fee_trade(V_m)`, where the commission is a percentage of the trade value `V_m` (F-12, BRK-16). An exchange purchase is at the ask, so the NAV value bought is `N_m = V_m / (1 + A-08)` (F-13). Lot `m` opens with `basis = V_m`, the price paid including the half-spread (TXG-12), and `J = J_m`. Commissions and FX fees are not added to the basis (G-20). Where there is no trade (provident family), `N_m = V_m = A_m`.
3. Growth: `B'_m = (B_{m−1} + N_m) × (1 + g_m − δ_m)`, where `g_m` is from A-01 and `δ_m = (d + A-07 + A-09 + A-11) / 12` (F-10).
4. Distributions and tax during: F-20 to F-26 for the instrument type; net amounts reinvested open a new lot.
5. Holding costs: `B_m = B'_m − φ_bal/12 × B'_m − fee_fixed_m − fee_custody_m` (F-14 to F-16). On a securities holding, a custody or account fee is paid by removing units at NAV, oldest lot first. The units removed take their share of `P` and `K` with them, so earlier years' fees do not reduce the taxable gain (TXS-06). The removal is not treated as a taxable sale; this is a simplification of the method.
6. Fee schedule changes: F-16 updates `φ_bal`, `φ_dep` when a discount period ends.

**F-09 Exit at T (liquidation, B1).** The holding is sold at the bid: `G_T = B_T × (1 − A-08)`. The commission and FX fee are paid out of it: `R_T = G_T − fee_exit(G_T) − fee_fx(G_T − fee_exit(G_T))`. For tax the consideration is `G_T`; sale costs are not deducted (G-20). `gain = G_T − P_T − E_y`, where `E_y` is the management and custody fees paid in the exit tax year, deducted once (TXS-06). Then `infl = K_T × J_T − P_T`, `real = gain − infl`, tax at exit `τ_exit` from section 7, and `V_T = R_T − τ_exit`, shown as `V_T / I_T` (F-06). For securities, `real` is the sum over lots of `units_i × price_T × (1 − A-08) − basis_i × J_T / J_i`, less `E_y`.

D3 decided by the founder on 2026-10-22 after the independent check (`tests/golden/workings.md`). The fee and basis wording of F-08 steps 2 and 5, F-09, F-12 and G-20 was corrected to the rule base. The earlier text had three effects: every year's custody fees reduced the gain, with the exit year counted twice; sale costs were deducted; the half-spread was left out of the basis.

**F-10 Gross growth less drag.** `δ` collects what the instrument itself costs regardless of wrapper: the fund's fixed management fee, trustee fee and variable fee (MF-16, MF-20, ETF-13, ETF-14), tracking difference beyond fees (A-07), and fund-level foreign withholding (A-11). For a renewable money-market fund the expected yield is already net of fund fees (MF-37), so `δ = 0` and `g` is the expected yield. For a daily money-market fund `g` is the BoI policy rate (A-20, the ISA's description of what these funds track, MF-34, labelled "proxy") and `δ` the fund's fees.

### 4.1 Fee types and their bases

Every fee is a record in `data/` (see `docs/data-schema.md`) with a base, a rate, a minimum, a maximum, a period and the security types it applies to. The engine evaluates fees only by these formulas.

**F-11 Deposit fee** (provident family): `φ_dep × D_m`, capped by the regulated maximum for the wrapper: 4% for provident funds and kupat gemel lehashkaa (PF-02, PF-03, KGL-14), 6% for a new comprehensive pension fund (PF-04, PEN-21), 4% for a new general pension fund (PF-05), none for hishtalmut and IRA (PF-06, KH-22).

**F-12 Trade commission** (brokerage): per order, `max(min, min(pct × amount, max))`, where `amount` is the trade value (on a buy, cash = trade value + commission), from the tariff line for the security type (TASE securities, makam, foreign securities; BRK-16), one order per contribution and one at exit (A-28). Money-market fund units at a bank under a distribution agreement: 0 (MF-26). Makam held to redemption: one purchase order, no sale order.

**F-13 Exchange costs.** Half-spread `A-08 × amount` on each exchange buy and sell (ETF-06), as part of the price: it is in the basis on a buy and lowers the consideration on a sale (F-08, F-09); creation or redemption fee 0.1 / 0.2 / 0.3% by category when the order goes to the manager rather than the exchange (ETF-05); FX conversion `fee_fx = pct_fx × amount` (plus any spread the tariff states, BRK-23, BRK-24) on each contribution and at exit when the instrument currency is not the shekel.

**F-14 Custody fee** (brokerage): per period from the tariff, `max(min, min(pct × B, max))` on the holdings it applies to; never on makam or money-market funds at a bank (BRK-17, BANK-18); at non-bank members per their tariff (BRK OQ11 open: the engine uses the tariff as published and flags it).

**F-15 Balance fee** (provident family and IRA): `φ_bal / 12 × B'_m`, capped: 1.05% provident and kupat gemel lehashkaa (PF-02), 0.5% comprehensive pension (PF-04), 2% hishtalmut and IRA (PF-06, KH-22), 0.3% lost-contact accounts (PF-08). Direct investment expenses (A-18) are added to `φ_bal` as a separate line (PF-10).

**F-16 Fee change over time.** A discounted fee reverts to the list fee at the end of the discount period (A-19), no earlier than 5 years after it started unless a PF-14 trigger occurs. The engine also applies a fee rise six months after contributions stop, where the provider record says so (PF-14 case 1). Mutual-fund fee increases take effect on 1 January only (MF-17, ETF-16): a known increase is applied at the next 1 January.

**F-17 Fixed fees.** Monthly account or system fees at non-bank members (BRK-24) are subtracted as `fee_fixed_m`.

**F-18 Fee for interest and dividend handling** (some non-bank tariffs, BRK-24): per distribution event, from the tariff.

---

## 5. Tax during the holding period, by instrument

All rates are read from `data/rules/` by rule ID; the figures below are quoted for readability and are the 2026 figures recorded in the rule base.

**F-20 Distributions from a fund or share.**
- Israeli exempt fund (including money-market funds, tracking funds and ETFs): 25% of the distribution, withheld (TXS-10). Net reinvested as a new lot.
- Foreign-domiciled fund or TASE foreign fund held through an Israeli bank or member: Israel 25% (TXF-08, withheld by the intermediary, TXF-10, TXF-05). Foreign tax withheld on the distribution is credited up to the Israeli tax on it (TXF-17, TXF-18): `τ_IL = max(0, 0.25 × dist − credit)`, `credit = min(w_foreign × dist, 0.25 × dist)`. For a US fund held with a W-8BEN, `w_foreign = 25%` (TXF-12, TXF-13), so `τ_IL = 0` and the total is 25%. Without a W-8BEN, `w_foreign = 30%`; the excess 5% is not credited (TXF-18) and is lost. For an Irish fund's own distributions, Irish withholding is open (TXF OQ6): the engine uses 0 and flags the dimension (G-05).
- At a foreign broker nothing is withheld in Israel; the same tax is paid by advance by 30 April of the next year (TXF-21). The engine charges it in the month of the distribution (timing difference ignored, stated in the output).
- Distributions from a TASE foreign fund are stated by the Tax Authority not to be offsettable against securities losses (TXF-07); losses are not modelled (G-07), so this has no effect.
- Taxable fund (TXS-11): the holder pays nothing on distributions or sale; the fund pays at individual rates on its income. The engine models only a shekel money-market taxable fund, as 15% of nominal interest at fund level (TXS-12 condition (b), derived), as an extra `δ`; any other taxable fund is blocked (G-08).

**F-21 Bank deposit, laddered.** Each contribution opens its own deposit of term `n` (A-15) at the rate in force (A-21 or A-26; a 447 rate is nominal annual before tax, BANK-13). At maturity: `interest = principal × ((1 + r)^(n/12) − 1)`. Tax withheld by the bank (TXI-07, TXI-08):
- unlinked or partly linked: `0.15 × interest` (TXI-03, TXI-04). Prime-linked deposits fall here by the Tax Authority's definition of "linked" (TXI-04; the prime case is TXI OQ2, labelled "reading");
- fully CPI-linked: linkage exempt, `0.25 × real interest` where the quoted rate is the real rate and linkage is added at `I` (TXI-05, TXI-02, BANK-26).
The net amount, principal plus after-tax interest, rolls into a new deposit at the then rate; the tax basis resets. The low-income deduction (TXI-20) and the 1948-cohort reliefs (TXI-21, TXI-22) apply only on inputs that meet their conditions; the engine applies TXI-20 as `interest_taxable = max(0, interest − min(deduction, interest))` when the couple's income is under the favoured ceiling, from `data/rules/`. Breaking a deposit before maturity is not modelled (G-16).

**F-22 Savings plan.** A savings plan is the F-21 ladder with the plan's own rate, term and exit points; no rule distinguishes it for tax (TXI-07, BANK-28).

**F-23 Money-market fund.** Exempt fund (TXS-12, TXS-24): no tax during; distributions per F-20; exit per F-44. Daily fund: `g = A-20`, `δ = fund fees` (F-10). Renewable fund: `g = A-24`, `δ = 0`, liquidity only on fixed dates (MF-35); if the horizon ends between fixed dates the exit is at the last fixed date before it. Two taxable money-market funds exist (TXS-24); for them F-20's taxable-fund case applies.

**F-24 Makam, rolled yearly.** Price per 100 face value `p = 100 / (1 + y)^(N/365)` with `y = A-22` and `N` days to redemption (GOV-06). At redemption the discount `100 − p` is interest taxed at 15% and withheld at 15% (TXI-01, TXI-11, TXI-09). The net proceeds buy the next series (12 series, one issued a month, GOV-22, GOV-23). A sale before redemption is a capital gain at up to 15% with the whole gain treated as real (TXI-12); the engine sells at the price implied by the unchanged yield when the horizon falls inside a series. The 2025 guide's "20% at realisation" line conflicts with the statute's 15% (TXI OQ3); the engine uses 15% (primary, s.125C(c)) and flags the conflict (G-09).

**F-25 Government bond.** Coupon `c` on face value, once a year for CPI-linked series (GOV-11); for fixed-rate series the frequency comes from the series data, since the rule base has not sourced it (GOV-13); unlinked (fixed or floating): `0.15 × coupon` withheld (TXI-15, TXI-09); CPI-linked: principal and coupon scale with `I` (GOV-11, GOV-12, no floor), linkage exempt, `0.25 × real coupon` (TXI-14). If the CPI falls, the reduced coupon is still taxed in full and the negative linkage is not offset (TXI-25). Net coupons reinvested in the same bond as a new lot. At the horizon the bond is sold at par plus A-27: unlinked gain taxed at up to 15% on the whole gain (TXI-12); linked gain at up to 25% real (TXI-14). Accrued interest bought between coupon dates is not modelled (G-10).

**F-26 Current-account credit balance.** Monthly interest `B × g` at A-25, taxed 15% at crediting (TXI-08 reaches current-account interest).

**F-27 Provident family (kupat gemel lehashkaa, hishtalmut, pension, provident fund for annuity, child savings, IRA).** No tax during (TXK-03, TXH-18, TXP-13, TXK-17). Foreign tax withheld inside the fund is a cost inside the fund (TXK-18), carried in A-18 or A-11. Track switches and transfers between funds of the same kind are not tax events (TXK-04, TXH-17, TXH-19, PF-23).

**F-28 National Insurance and health contributions.** National Insurance is zero on everything the engine models: interest and dividends at special rates are exempt (TXG-27), and capital gains are outside the base (TXG-28). The deemed interest on a kupat gemel lehashkaa withdrawal is open (TXK OQ9): the engine charges nothing and flags it (G-11). Health contributions (מס בריאות) are charged on the same income as National Insurance (TXG-34), so they are zero on the same items. Under product D14 (2026-10-22) the site does not show them. Interest taxed at marginal rates under s.125C(d) is outside both exemptions; an example is study-fund gains withdrawn early (F-47). The engine does not model NI or health on it (G-27).

---

## 6. Deposit-side tax effects (equal net outlay, B1)

The person's outlay `C_m` is net money. Where a wrapper returns part of a deposit as tax relief, the engine finds the gross deposit `D_m` whose net cost is `C_m`:

**F-30 Equal net outlay.** `D_m = C_m + benefit(D_m)`, solved exactly (benefit is piecewise linear in `D`, so the solution is found by testing each piece). The relief is assumed to be received in the same month (through payroll for an employee's pension deposit; through the return for a self-employed deduction, timing difference stated).

**F-31 Pension and provident fund for annuity, employee who is not a beneficiary member.** Credit `= 0.35 × credited`, `credited = max(floor, min(D_year_total, 0.07 × E))`, `E = min(eligible income, 116,400 NIS a year)` (TXP-01, TXP-02; floor 2,268). Existing pension deposits through work (A-12) use the cap first: the credit for new money is `credited(existing + new) − credited(existing)`. Marginal rate `τ_m` for deductions comes from the 2026 personal-effort brackets on the person's salary (TXG-02). Figures are frozen for 2025 to 2027 (TXP-27, TXG-06) and read from `data/rules/` by tax year.

**F-32 Beneficiary member and self-employed.** If deposits for the year, employer money included, reach 16% of the average wage (26,436 NIS in 2026, TXP-03), the credit follows TXP-04 and the deduction TXP-06 (11% first tier, 7% + 4% second tier, each at `τ_m`). A person who is not a beneficiary member and deposits on income without employer deposits gets the TXP-05 deduction. For a beneficiary member, one year's deposits split as in the guide's worked example (TXP-31). First tier: `11% × income for a self-employed member`. Second tier: on the base `deposits − beneficiary threshold`, deduct `min(base, 7% × AI) + min(4% × AI, max(0, base − 12% × AI))`, where AI is the additional income. What is left of the deposits goes to the s.45A(e) credit (TXP-04). The extra 0.5% credit (TXP-07) and the age-50 enlargement (TXP-08, 2026 amounts not found) are blocked (G-13).

**F-33 Everything else.** `D_m = C_m`: kupat gemel lehashkaa (TXK-01), hishtalmut employee deposit (TXH-04), brokerage, deposits, funds, bonds, child savings (TXK-19).

---

## 7. Tax at exit (liquidation at T)

**F-40 Securities and fund units (brokerage wrapper, all instruments held as securities).**
- Real-basis instruments: shares, exempt-fund units including money-market funds, tracking funds and ETFs, TASE foreign funds, foreign-domiciled funds, CPI-linked bonds: `τ_exit = ρ × max(0, real)`, `ρ = 25%` (TXS-01, TXS-09, TXS-13, TXF-02, TXI-14), withheld by the bank or member (TXS-05, TXF-05) or paid by advance at a foreign broker (TXF-22). The index `J` is CPI, or the exchange rate for a foreign-currency security (F-04).
- Nominal-basis instruments: unlinked bonds, makam sold before redemption, commercial paper: `τ_exit = 0.15 × max(0, gain)` (TXS-03, TXI-12).
- `real < 0`: no tax. The loss is not carried anywhere (G-07).
- The inflationary amount accrued after 1993 is exempt (TXG-13, TXS-02); nothing in scope predates 1994.

**F-41 Deposits, savings plans and current accounts.** Tax was charged at each maturity or crediting (F-21, F-26). At `T` the last open deposit is treated as matured on the exit day: interest to date taxed under F-21.

**F-42 Age 60 and over at exit.** For "maximum rate" items (real capital gains, exempt-fund gains, linked interest) the person's brackets apply first (TXG-04, TXG-07, TXG-08, TXI-19, TXS-23): `τ_exit` = the sum, over the slice from `Y` to `Y + real`, of `min(bracket rate, ρ)` for each part of the slice, with the bracket rates from the 2026 reduced schedule 10/14/20/31/35/47% (TXG-04, TXG-02) and `Y` is A-13. Withholding stays at the flat rate (TXS-23); the difference is recovered through a return or form 0135 (TXG-25) when A-14 is on, and is otherwise lost. Fixed-rate items (15% unlinked interest, unlinked bonds) are not reduced (TXG-08 case (c); TXI OQ9 noted). Under 60: no change (TXG-08 case (a)).

**F-43 Surtax.** With `Z = Y + real` (inflationary amounts excluded, TXG-09): `surtax = 0.03 × max(0, Z − 721,560) − 0.03 × max(0, Y − 721,560)` plus, on capital-source income `Cap = real + other capital income`, `0.02 × max(0, Cap − 721,560)` (TXG-10). Settled through the return (TXG-11). Applied in every wrapper's exit tax and to taxable distributions in the year they fall.

**F-44 Kupat gemel lehashkaa, lump sum at any age.** Gains withdrawn are interest income at up to 25% (TXK-05, TXK-06, primary). The base is the real gain, with the manager withholding 25% of the real gain (TXK-07, **institution and press strength**: the legal route that exempts the inflation part is TXK OQ2). The engine computes `τ_exit = 0.25 × max(0, real)` and labels the base "secondary source"; a sensitivity line shows the 15%-of-nominal alternative (TXK-06 second limb) so the person sees the range (G-02). A partial withdrawal is pro rata (TXK-13). The 60+ reduction (F-42) is open for this deemed interest (TXK OQ12): not applied, flagged.

**F-45 Kupat gemel lehashkaa, annuity route from 60.** Transfer to a provident fund for annuity from age 60, annuity fully exempt (TXK-08 to TXK-10, TXK-12). The engine shows this route on the guide page as text and as "value transferred at 60" (the gross balance); the annuity itself is blocked (conversion factors, PEN OQ7; commutation TXK OQ4; G-03).

**F-46 Keren hishtalmut, lawful exit.** After 6 years from the first payment date (3 at retirement age or for study), everything from benefited deposits is exempt (TXH-09, TXH-10). Benefited own deposit: up to 2.5% of determining salary, determining salary capped at 15,712 NIS a month (TXH-08, TXH-02); benefited self-employed deposit 20,566 NIS a year (TXH-08). Gains on deposits above the benefited amount are taxed at withdrawal at 25% of the real gain (TXH-11; two managers state this, institution strength, labelled). `τ_exit = 0` on the benefited part. The 6-year clock runs from the first payment date (KH-11); joining a fund that already exists keeps the clock (A-12).

**F-47 Keren hishtalmut, early withdrawal (only if the person opts in, B3).** Employer benefited deposits are taxed as work income at `τ_m` when received (TXH-13, TXH-01); gains at the s.121 rates for income not from personal effort, which start at 31% under 60 (TXH-13, s.125C(d)(5), TXG-03); the fund withholds 47% (TXH-15) and the difference is recovered through a return (A-14). Own deposits are not taxed again (they came from net salary, TXH-04).

**F-48 Pension and provident fund for annuity, early withdrawal (only if the person opts in).** Non-compliant withdrawal: `max(0.35, τ_m) × amount` (TXP-18); the taxable base is open (TXP OQ3), so this is **blocked** (G-06) and the wrapper stays "listed, not ranked" even when the person opts in. Lawful lump sums (severance component, small balances) follow PEN-29, PEN-30 and are listed, not modelled.

**F-49 Pension and provident fund for annuity at or after retirement.** The lawful exit is an annuity (PEN-27), partly exempt (TXP-14, 57.5% of 9,430 NIS a month in 2026, rising to 67% from 2028), with the offset formula (TXP-15) and commutation rules (TXP-17, PEN-28). The annuity value needs conversion factors that are not collected (PEN OQ7). **Blocked** (G-03): the wrapper is listed with its gross balance at the horizon and the text of the exemption rule; it is not ranked.

**F-50 Child savings.** Deposits, the parental addition and grants are not income (TXK-19). Gains are taxed on withdrawal (TXK-20). No official rate exists, but a secondary source gives the rates (TXK-23), so the engine computes them labelled "secondary source". Provident route: 25% of the real gain. Bank route, CPI-linked deposit: 25% of the real gain. Bank route, unlinked deposit: 15% of the nominal gain. Withheld at withdrawal. Deposits, the parental addition and grants are principal.

**F-51 IRA.** Tax follows the wrapper it was approved as (TXK-16, TXK-17): an IRA hishtalmut uses F-46 and F-47; an IRA provident fund for annuity uses F-48 and F-49 (blocked). Fees: the manager's balance fee within the 2% cap (PF-06, IRA-17) plus the brokerage tariff inside the account (IRA-21, IRA-22), both through F-12 to F-15.

---

## 8. Eligibility, ceilings and lock-ups (what the engine checks before ranking)

| Wrapper | Ceiling on money in | Lawful exit (B3) | Rules |
|---|---|---|---|
| Current account, deposit, savings plan | none | any time, or at maturity and exit points per product terms (BANK-14, BANK-27); breaking not modelled (G-16) | BANK |
| Money-market fund, daily | none (MF-15) | any trading day (MF-34) | MF |
| Money-market fund, renewable | none | fixed dates only (MF-35) | MF |
| Makam, government bonds | none | any trading day (GOV-17), redemption at maturity | GOV |
| Brokerage: Israeli and foreign funds | none | any trading day | ETF, BRK |
| Kupat gemel lehashkaa | 83,641 NIS per person per calendar year across all managers (KGL-02, KGL-03, KGL-24, TXK-02), checked at deposit (KGL-04) | any time, paid within 4 business days (KGL-08) | KGL |
| Keren hishtalmut | benefited ceiling for tax (F-46); employee deposits only with an employer (KH-02, KH-03); self-employed anytime. In wrapper mode (product D15): an employee sees it listed, not ranked; a self-employed person has it ranked up to 20,566 NIS a year, with the excess routed as for any ceiling (F-05) | 6 years from first payment, 3 at retirement age or for study (TXH-09, TXH-10, KH-10) | KH, TXH |
| Pension fund (new comprehensive) | monthly deposit ceiling 20.5% × 2 × average wage (PEN-08); excess to the general fund (PEN-10) | old-age pension from 60 (PEN-26); earlier only severance component or special cases (PEN-30) | PEN, TXP |
| Provident fund for annuity | none in the rule base | as pension (PEN-34) | PEN |
| Child savings | NII amounts only, no own money (CS-02 to CS-04, CS-16) | from 18 with a parent's signature, from 21 alone (CS-14) | CS |
| IRA | money types and the cap in IRA-07, IRA-08 | per underlying wrapper (IRA-25) | IRA |

**Constraint filters** from the goal (D13): "must be withdrawable at any time" excludes rows whose lawful exit is not "any time"; "must stay available at once" keeps that part of the amount in the current account or a daily money-market fund; "must not need an annual tax return" cannot be evaluated (TXG OQ4) and is shown as blocked.

---

## 9. Employer money (B2) and what only a salary wrapper gets

**F-52 Employer line.** For a hishtalmut: employer deposit `7.5% × min(salary, 15,712)` a month (TXH-01, KH-04), or the rate on the payslip (A-12); own deposit 2.5% (KH-04, TXH-08). The employer part above the ceiling is work income taxed at `τ_m` when paid (TXH-03), subtracted from the line's value; it also carries employee National Insurance and health at the salary rates (TXG-35; whether the excess is in that base is an inference, labelled). Its gains are taxed at 25% real at withdrawal (TXH-11, institution). For a pension: employer 6.5% + 6% severance on wage up to the average wage (PEN-03, PEN-04); not taxed at deposit up to 7.5% of salary capped at 34,423 NIS a month (TXP-10) and the severance ceiling (TXP-11). The line runs through F-08 with the wrapper's fees and exit rule and is reported as "value at the horizon of money only available here", never ranked.

**F-53 Pension insurance cost.** Premiums for death and disability cover are deducted monthly from the account (PEN-15) at A-17; tables are not collected (G-12), so the figure is "entered by you".

**F-54 Child savings accumulation.** Monthly `58 × I` from NII, where `I` is the index at the last 1 January, because the amount is updated once a year (CS-03), doubled if the parent adds (CS-04), from birth to 18; grants per cohort (CS-13); fees 0 until 21 (NII pays, CS-18), then 0.23% of balance (CS-18) in the provident route; growth at `r_g` for the chosen track. Exit tax per F-50.

---

## 10. Outputs built on the ledger

**F-60 Idle-cash preset (3.2).** Monthly cost of leaving `B` where it is `= B × [(1 + r_alt)^(1/12) − (1 + r_cc)^(1/12)]`, after tax, where `r_cc` is A-25 taxed per F-26 and `r_alt` is each liquid option's net rate (daily money-market fund F-23 with F-40; one-month deposit F-21 at A-21 labelled "average paid at this bank last month", and at A-26 labelled "entered by you"; makam F-24). The part that must stay available (D13) is excluded from `B`. The candidate set is wrapper mode's (F-83): the current account is the baseline; the options above are compared against it; every other tier-1 wrapper and tier-2 instrument is accounted for by F-83, those the preset does not run as "not evaluated" with G-28.

**F-61 Fee materiality (3.5).** For a wrapper or holding with fee set `F`: total drag `= V_T^{real}(∅) − V_T^{real}(F)`; cost of fee `f` `= V_T^{real}(F \ {f}) − V_T^{real}(F)`; interaction remainder `= total − Σ_f cost_f`, reported as a line. Value of a stated reduction `f → f'` `= V_T^{real}(F[f → f']) − V_T^{real}(F)`. All runs hold A-01 to A-29 fixed. The regulator reference for `f` is the average for that provider class and fee type (D4): CMA averages for provident tracks (CAT, KH-23, PEN-24), ISA category averages for funds (MF-18, MF-19, ETF-17), BoI FEES_DASH for banks (BRK-26), TASE's per-member averages for brokers (BRK-33, corrects D4 per coverage.md F2); "no reference available" otherwise. Caps are shown beside the fee: PF-02 to PF-08, PEN-21, PEN-22, KH-22.

**F-62 Fee verdict.** From P-03: `cost_f ≥ threshold_negotiate` and a reference exists below the current rate → "worth negotiating"; `cost_f ≥ threshold_avoid` and another provider or wrapper in the same comparison removes it → "worth avoiding"; else "not worth the effort". Thresholds are shown on the page as site parameters.

**F-63 Provider workbench (3.4).** For each provider `p` with tariff `F_p` at the chosen fee level (list, regulator average, entered; D4): `cost_p(horizon) = V_T^{real}(∅) − V_T^{real}(F_p)`; `cost_p(year 1) = V_12(∅) − V_12(F_p)` nominal; broken into fee types by F-61. Behaviour from A-28 drives the trade, FX and custody counts. Ties by F-80. A provider without a tariff is a row "not comparable, data missing" with the reason from `data/fees/`.

**F-64 Track workbench.** Every track of every provider for the wrapper from the latest CMA period (F-83), with `AVG_ANNUAL_MANAGEMENT_FEE` and `AVG_DEPOSIT_FEE` (units to be confirmed, CAT OQ2, KGL OQ14: shown only after the field definitions are confirmed, product.md dependency 4) and the fit mark from F-70.

**F-65 Fund variants.** For a chosen exposure, the candidates are every Israeli fund in the latest Maya export that matches the exposure by classification and reference asset (CAT-34), every foreign fund traded on TASE in TASE's latest list that matches it (ETF-32), and every foreign-domiciled fund traded abroad in `data/funds/` for the exposure (F-83). Each candidate with a `data/funds/` record runs F-08 with its own `δ` (A-06 to A-11), currency (F-04), distribution policy (F-20) and domicile rules (F-40). Accumulating foreign-domiciled funds are taxed only at sale under the TXF-11 reading, which one secondary source supports. Their value is computed and labelled "secondary source: not confirmed by the Tax Authority", and the variant is listed, not ranked. A candidate without a `data/funds/` record is "not evaluated: details not collected"; foreign-domiciled funds traded abroad that are not in `data/funds/` are one group line (G-29).

**F-66 Switching cost.** Brokerage: moving from fund A to fund B at month `s` is a sale (TXS-21): tax per F-40 on A's lots at `s`, the net proceeds open B's lot. Provident: a track switch or a transfer to the same kind of fund costs nothing (TXK-04, TXH-17, TXH-19, PF-19, PF-23); a hishtalmut moves whole, never in part (PF-18, KH-17). Cost of switching `= V_T(no switch) − V_T(switch)`.

**F-67 Illustrative timeline (3.1).** F-08 run for each tier-1 wrapper on P-05, with any value the person has entered replacing its P-05 counterpart (product.md 3.1, changed 2026-10-22); series shown: cumulative contributions, gross value, cumulative fees by type, tax during, tax at exit, real value. The rules used are listed beside it by ID.

**F-70 Classification fit (3.4, 3.6).** A track's CMA classification (`SPECIALIZATION`, `SUB_SPECIALIZATION`, KH-20, CAT) is looked up in P-04 against the goal's horizon band and the person's loss filter (A-29). The mark is "fits", "does not fit", or "no rule" when the classification is not in the table. No asset mix is used (product.md 3.6).

**F-71 Loss filter (exposure mode, D11).** An exposure is excluded when the person's entered "worst fall" (A-29) exceeds their entered "largest fall accepted". No sourced mapping is claimed.

**F-72 Consolidation (3.6).** Two holdings consolidate when they are the same wrapper type, a permitted route exists (PF-17: annuity to annuity, hishtalmut to hishtalmut, gemel lehashkaa to gemel lehashkaa), and, for a hishtalmut, both accounts are already withdrawable tax-free (PF-18). Otherwise "transfer rules not sourced" or "not allowed", citing the rule. The child-savings default check is blocked (CS OQ10).

---

## 11. Ranking, ties and sensitivity

**F-80 Ranking and ties.** Rank eligible wrappers (section 8, B3) by `V_T^{real}`. Options `i` and `j` are a tie when `|V_i − V_j| / max(V_i, V_j) < θ` (P-01). The "X is best because Y" line names the formula that produces the largest difference between the top two (deposit-side relief, fee drag, tax at exit, or lock-up), found by running F-61-style decompositions on both.

**F-81 Sensitivity panel.** For each assumption `a` in P-02 with bounds `[a_lo, a_hi]`: move `a` from its current value towards each bound by bisection, re-running F-80, until the top option changes or the bound is reached; report the smallest change that flips the result ("flips if `a` moves from `x` to `y`") or "no flip within bounds". Shared by 3.2, 3.4, 3.5 and 3.6.

**F-82 Revisit (3.9).** A saved comparison stores every `A-nn`, `P-nn`, the rule figures and data versions used (by file and `checked` date). On revisit the engine re-runs with current versions, lists the entries whose values differ, and reports whether F-80's top option and tie set are unchanged.

**F-83 Candidate set and coverage line (product D17).** Every comparison starts from its full candidate set and accounts for each candidate exactly once.

- **Candidate sets.** 3.2 wrapper mode and its presets: every tier-1 wrapper record (the wrapper IDs in data-schema §2; D2, D6) and every tier-2 instrument on the "not covered yet" list (D2). 3.2 exposure mode: every exposure record. 3.4 providers: every provider in the provider list for the wrapper (F-63). 3.4 tracks and the catalogue fit mark: every track for the wrapper in the latest CMA period, at every managing company (F-64, F-70). 3.4 fund variants: as F-65. The tracks, providers and fund variants inside a wrapper are not candidates of 3.2; its coverage line links to 3.4 for them.
- **Outcome.** Each candidate gets one outcome, with its reason as a code (rule ID, G-ID, constraint or missing data item). When more than one applies, the first in this order is used:
  1. **not eligible**: a rule bars this person or this money (section 8; a track open only to a sector or employer, CAT-10);
  2. **excluded by the person's constraint**: section 8's constraint filters, or the loss filter (F-71);
  3. **not evaluated**: the run lacks an input (no tariff, no product terms, no fund record), the instrument is tier 2 (G-24), or the method has no run for it yet (a gap whose effect says "not evaluated", for example G-28 or G-30). A gap that blocks one rule inside a run that otherwise works, such as an exit tax, is not this outcome but B3 (item 4);
  4. **listed, not ranked**: B3 (locked at the horizon, or a rule in its run blocked by a gap), D15, or a ceiling that keeps the wrapper from taking the same money (F-05);
  5. **ranked**: F-80. In the idle-cash preset (F-60) this reads "compared against the current account", and the current account is the baseline.
- **Output.** `considered = N`, the count per outcome, and every candidate that is not ranked with its outcome and reason. A group the site knows exists but does not hold one by one (G-29) is one line with the count held. Invariant: every candidate appears exactly once and the counts sum to `N`.
- **Tests.** A golden scenario may restrict the candidate set to exercise a formula (S39 compares four wrappers); the site never restricts it. S40 and S41 test the full coverage line.

---

## 12. What the method cannot model yet, and why

Each gap names the open question in `il-finance`. The output shows the affected dimension as **blocked** (3.3) and, where the gap touches a wrapper's number, applies B3 (listed, not ranked).

| ID | Gap | Why | Effect |
|---|---|---|---|
| G-01 | Inflation assumption has no sourced default | No inflation-expectation or target series is in the rule base or data track | A-02 is "entered by you" until `data/series/cpi-expectations` exists |
| G-02 | Kupat gemel lehashkaa exit base, real vs nominal | Legal route for the inflation exemption not confirmed (TXK OQ2); withholding regulation shows other rates (TXK OQ3); base rests on institution and press sources (TXK-07) | F-44 computes 25% real, labelled "secondary source", with the 15% nominal alternative shown |
| G-03 | Pension and provident-for-annuity exit value | Conversion factors not collected (PEN OQ7); annuity exemption needs them (TXP-14 to TXP-17); commutation of money moved from a kupat gemel lehashkaa open (TXK OQ4) | F-45, F-49 blocked; wrapper listed with gross balance |
| G-04 | Hishtalmut gains on deposits above the benefited ceiling | Closed 2026-10-22: 25% of the real gain per two managers (TXH-11, institution) | F-46 computes it, labelled institution |
| G-05 | Irish-side withholding on an Irish fund's distributions | TXF OQ6 | F-20 uses 0 and flags |
| G-06 | Early withdrawal from a pension or provident fund for annuity | Taxable base open (TXP OQ3) | F-48 blocked |
| G-07 | Losses | Real losses, carry-forward (TXS-18), cross-institution netting (TXS-19), the 3.5:1 inflationary offset (TXS-17), real loss when CPI exceeds the nominal gain (TXG OQ13), deflation on exempt-fund units (TXS OQ15) and on linked deposits and bonds (interest still taxed in full and negative linkage not offset, TXI-25; the price loss at sale is TXS OQ15) | F-40 takes `max(0, real)`; no loss is carried |
| G-08 | Taxable funds other than a shekel money-market fund | Fund-level tax depends on the fund's income split (TXS-11), not available per fund | F-20 blocked for them |
| G-09 | Makam discount rate conflict, 15% vs 20% | TXI OQ3 | F-24 uses the statute's 15%; flagged |
| G-10 | Accrued interest on bonds bought between coupon dates | TXI OQ5 | F-25 ignores it; flagged |
| G-11 | National Insurance on deemed interest from a kupat gemel lehashkaa and on a recognized annuity | TXK OQ9, TXA OQ14 | F-28 charges nothing; flagged |
| G-12 | Pension insurance premiums | Tables not collected (PEN OQ7) | A-17 entered |
| G-13 | Self-employed 0.5% credit and age-50 enlarged deduction | TXP-07 cap interplay, TXP-08 2026 amounts not found (TXP OQ7) | F-32 omits them; flagged |
| G-14 | Direct investment expenses per track | Manager caps not collected (PF OQ3) | A-18 from data when present, else 0 flagged |
| G-15 | Fee discount minimum period, 5 years or 2 | Closed 2026-10-22: the circular's scope covers kupat gemel lehashkaa (PF-13); 5 years | A-19 uses 5 years |
| G-16 | Breaking a deposit or savings plan before maturity | Pricing not sourced (BANK OQ12); tax on broken deposits (TXI OQ14) | F-21 does not model early break; such a deposit is "locked until maturity" for B3 |
| G-17 | Child-savings exit tax | Rates have a secondary source only (TXK-23); chosen-vs-default visibility still open (CS OQ10) | F-50 computes, labelled secondary |
| G-18 | Accumulating foreign-domiciled funds | No Tax Authority confirmation of sale-only taxation (TXF OQ1); one secondary source agrees (TXF-11) | F-65 computes, labelled secondary; variant listed, not ranked |
| G-19 | Payslip labels for the salary inputs | No official source (KH OQ5, PEN OQ11, TXP OQ16) | A-12 asks for the amounts with the law's required content (PEN-36) as the hint |
| G-20 | Purchase and sale commissions and FX fees in the tax computation | Not sourced; only same-year management and custody fees are sourced as deductible (TXS-06; TXS OQ12 on whether banks apply it) | F-08 excludes commissions and FX fees from the basis and F-09 does not deduct sale costs from the consideration; conservative, flagged |
| G-21 | Surtax at source and the 60+ bracket at source | TXG OQ12, TXG OQ7 | F-42, F-43 assume settlement through a return (A-14) |
| G-22 | "Must not need an annual tax return" constraint | TXG OQ4 | shown as blocked |
| G-23 | Credit points against special-rate capital income | TXG OQ6 | not applied |
| G-24 | Tier-2 instruments: savings policies (TXA OQ1 real vs nominal; TXA OQ3 transfer), executive insurance growth (TXA OQ6), Amendment 190 age ceilings (TXA OQ9), structured deposits (TX2 OQ5), FX deposits withholding base (TX2 OQ2) and FX weakening (TX2 OQ1, TXF OQ5), corporate bonds in default (TX2 OQ6), REIT NII (TX2 OQ8), gold ETCs (TX2 OQ10), managed-portfolio VAT (TX2 OQ12) and performance fees (MF-28) | Open per coverage.md §2 | No formulas; the "not covered yet" page names each |
| G-25 | Loans against a hishtalmut or gemel lehashkaa, group life cover deductions (KH-21, KH-25, KGL-18) | Terms not sourced (KH OQ4) | Not modelled; dimension listed |
| G-26 | Money-market fund order cut-off and settlement day (MF OQ3, OQ4) | Open | Liquidity shown as "same or next business day, unconfirmed" |
| G-27 | NI and health on interest taxed at marginal rates (s.125C(d)), for example study-fund gains withdrawn early | Outside the s.350(a)(6) exemption wording (TXG-27); employee NI rates and the disregard for employees are not in the rule base (TXG OQ2(b)) | F-47 charges income tax only; flagged |
| G-28 | Idle-cash preset runs only the cash options with a sourced or entered rate | F-60 runs the one-month deposit, the daily money-market fund and makam. A renewable money-market fund can be left only on its fixed dates (MF-35), so it does not fit money kept idle; a cash-like track inside a kupat gemel lehashkaa or another provident wrapper has only past yields, which are history (product.md section 4); a government bond's value before maturity moves with bond prices, for which no sourced series exists (D9); savings-plan terms are not collected yet (R4); brokerage holdings need an entered return (D9) | Each is "not evaluated (G-28)" in the preset's coverage line (F-83), with a link to the full goal comparison |
| G-29 | Foreign-domiciled funds traded abroad have no complete list | Neither the rule base nor the data track found one (ETF OQ4; the foreign funds traded on TASE are listed, ETF-32); `data/funds/` holds the ones collected | F-65 compares those held; the rest are one group line, "not held one by one", in the coverage line (F-83) |
| G-30 | Monthly deposits into a renewable money-market fund | F-23 sets the exit for a deposit; which series a later monthly deposit buys, and when (units of a new series are offered from seven days after the series date, MF-35), is not set | With monthly deposits the renewable fund is "not evaluated (G-30)" in the coverage line (F-83); a goal with an amount now and no monthly deposit runs F-23 |

---

## 13. Conventions for the engine and the tests

- Compute in full precision; round only for display (two decimals for NIS, two for percentages).
- The golden tests compare against the founder's spreadsheet within P-06.
- Every figure the engine reads carries its tax year or effective date; a run in tax year `y` reads the figure for `y`, and refuses to run with a figure whose `effective_to` has passed, showing "figure not updated" (D3).
- A rule of strength `open` never enters a formula. A rule of strength `secondary` or `institution` enters and labels the number. The dimension checklist is derived from the rules used in the run, not hand-marked (product.md 3.3).
- Every comparison test checks F-83's invariant: each candidate appears exactly once, with one outcome.
- `tests/golden/scenarios.md` is the test file named by the founder; `docs/product.md` 3.8 calls the same thing `tests/cases/`. One of the two names should be changed to match.
