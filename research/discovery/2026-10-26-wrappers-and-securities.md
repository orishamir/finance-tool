# Are makam and government bonds wrappers? (2026-10-26)

The question came from comparing `/guide/makam` with `/exposure/makam`: the two read alike. This note gives the finding, the founder's decision, what was built, and what is left. Rules are cited from the `il-finance` skill; no rule was added.

## 1. Finding

**The test for a wrapper.** D6 calls a wrapper the container that sets tax, fees, liquidity and ceilings. A clean way to tell one: a wrapper's rules apply to whatever it holds, and override the rules of what it holds. A study fund is exempt whatever its track. An IRA's tax "follows the wrapper it was approved as" (method F-51, TXK-16). A rule that goes with a security into any account, and gives way inside a wrapper that sets its own tax, belongs to the security.

**Makam and government bonds fail the test.**

- How they are held. GOV-21 (general, primary): "Makam and government bonds are bought and held as securities in a bank or broker securities account." GOV-22: an individual buys makam through a securities account at a bank or investment house, on TASE or by a bid in the monthly issue. GOV-05: only clearing-house members bid directly.
- Their own rules are rules of the security:
  - the 15% on the discount (TXI-11);
  - the state as debtor (GOV-02);
  - the last trading day (GOV-24);
  - the auction route (GOV-22).
  Inside an IRA the IRA's tax applies instead.
- BANK-18 and BRK-17, no custody fee at a bank, are a rule of a bank's securities tariff by security type. The same rule covers money-market fund units.
- D6 itself named "a bond type" as an example of an exposure.

**The repo already treated them this way, except in two places.**

- Method F-40 is headed "Securities and fund units (brokerage wrapper, all instruments held as securities)" and lists makam and both bond types. §5 is "tax … by instrument".
- The tariff data prices makam as a class of the securities tariff: 13 of 19 latest snapshots have a trade line `applies_to: ["makam"]`. A bank's custody line excludes `makam` and `money_market_units`.
- The securities-account guide said it holds "מק״מ ואיגרות חוב ממשלתיות". The makam guide said it is bought through a securities account. P-08 said of makam "the exposure is the product".
- Only the two wrapper records and the run dispatch disagreed.

**The money-market funds have the same problem.**

- Their own records said "anyone with a securities account at a bank or at a TASE member (the distributor)".
- Their exit tax is F-40, and their custody rule is BANK-18 again.
- The renewable fund's fixed dates are a fund term (MF-35).
- The provider workbench already ran a cash-like fund as `money_market_units` held in the securities account. So the same product was modelled twice.

**What the split broke** (read in the code before the change):

1. **Exposure mode dead end.** The makam exposure listed the securities account as a holder, but choosing it gave "not evaluated: no fund". Only the pseudo-wrapper ran.
2. **The broker choice stopped at the account.** The comparison priced the account on the tariff that leaves the goal the most (F-80, Doron's case), but makam and the bond on Leumi's list tariff (P-05).
3. **Custody at non-bank members was dropped.** The makam run read only buy and sell lines. The ban binds banks only (BRK-17, BRK-52), and Altshuler Trade, Excellence, IBI and Psagot have custody lines that apply to makam. No account's monthly fee reached makam or bonds either.
4. **Copies drifted.** The account's eligibility, supervision and protection text was copied into four records.

**Other wrappers checked.**

- The savings plan shares the bank deposit's container and tax (F-22: "no rule distinguishes it for tax"). It is closer to a deposit product than a wrapper, but the stakes are low, so it is left as a wrapper.
- The IRAs pass the test (their tax overrides what they hold).
- Child savings, the pensions and the current account pass.
- Corporate bonds (third in the tier-2 queue, "computes as a government bond") and REITs (fourth) would have become more pseudo-wrappers under the old pattern.

## 2. Decision

The founder, 2026-10-26: "do whatever is needed to make it right. change D6 and write under research." D6 is amended in `docs/product.md` section 1:

- a wrapper is a container whose rules apply to whatever it holds;
- inside it sits a **security** (נייר ערך), what the person actually buys, held directly or as fund units;
- makam, government bonds and the two money-market funds are securities held in the securities account;
- a guide page and a comparison option stand for a **product**: a wrapper, or a security held in one.

Choices made in carrying it out, open to the founder's revision:

- **The layer is called "security", not "holding".** "Holding" already names the person's holdings page (3.6), the engine's `holdings/` and exposure mode's "the wrapper that holds an exposure" (P-08); a third meaning would collide. "Security" is the law's and the bank's word (a securities account holds securities).
- **IDs, addresses and page titles stay.** `/guide/makam` is still "מק״מ". The page adds one line naming the account it is bought in, and the account's page lists the securities bought in it. Saved state on devices keeps working: the keys are product IDs and did not change.
- **The guide pages stay.** Directive 447A puts deposits, money-market funds and makam side by side as "מוצרי שוק הכסף" (BANK-15). They are the choices people face, so they keep pages and comparison options. `/exposure/makam` stays as D18 placed it.
- **Money-market funds keep the bank case in the comparison.** At a bank with a distribution agreement the holder pays nothing to buy, hold or redeem them (MF-26, BANK-18), which no tariff undercuts. A broker list for them would only add ties.

## 3. What changed

- **Data.**
  - The four records moved from `data/instruments/wrappers/` to `data/instruments/securities/`.
  - Each record gained `held_as` (`direct` or `fund_units`) and `held_in` (the wrappers that can hold it, the rules that say so, and a sentence).
  - The account-level parts of eligibility, protection and the supervisor note now point at the account instead of copying it: BRK-07, BRK-10, BRK-32, REG-16 and REG OQ10 left the makam and bond records.
  - The makam exposure no longer lists `brokerage-account`, since holding makam directly in the account is the `makam` record.
  - P-08's notes were updated.
- **Schema** (`packages/schema`).
  - `wrapperId` now lists the 13 wrappers.
  - New: `securityId` (4), `productId`, `productIds`, `isSecurityId`, `securityRecord` (wrapper fields plus `held_as` and `held_in`), `productRecord`, `productSchemaOf` and `isSecurity`.
  - New JSON schema: `json/security.schema.json`.
- **Validator.**
  - It knows the folder.
  - A security's `held_in` rules may cover a dimension mark but do not require one.
  - P-05's and P-10's product keys are checked against both folders.
- **Engine.**
  - The comparison and run inputs take product IDs.
  - The makam run takes a custody line and `memberKind`: nothing at a bank (BRK-17), the line as published at a non-bank member (F-14).
  - The makam and bond runs take the account's monthly fee (F-17).
  - Custody is counted after a redeemed series is rolled, so a redemption month still holds paper.
  - Tests: `packages/engine/test/securities-d6.test.ts`.
- **Site.**
  - The comparison prices makam and the bond on the provider that leaves the goal the most (F-80), on each Israeli bank and member tariff with a trade line for their class. Foreign brokers are left out. The card's provider picker now appears on them.
  - For 100,000 NIS over two years, makam ranks Discount, Yahav, Jerusalem and Mercantile just above Leumi. Brokers with a monthly account fee fall to the bottom.
  - Exposure mode labels a security "מק״מ, קנייה ישירה בחשבון ניירות ערך".
  - Guide pages show the "held in" line and the account's list.
  - The rules page, search and saved-comparison versions read both folders.
  - Tests: `site/app/lib/compare-securities.test.ts`.
- **Docs.** `docs/product.md` D6 and 3.1; `docs/data-schema.md` §2, §3.3a, §3.4 and §4 item 9; `docs/method.md` §2.4, F-14, F-17, F-80 and F-83; `docs/roadmap.md`; `CLAUDE.md` status.

## 4. Not done, and why

- **The "which bank or investment house" page (F-63) for makam and bonds.** It still ranks funds only, and its run is the fund run. The comparison card's picker covers the question for now. Listed in the roadmap.
- **Money-market funds at a non-bank member in the comparison.** Kept on the bank case, as above. The provider workbench already prices them at brokers.
- **A saved comparison made before today** names `data/instruments/wrappers/makam.json` among its data files. Its revisit shows that file as gone and `securities/makam.json` as new, which is what happened. No migration is needed.
- **Savings plan and IRAs**: unchanged (section 1).

## 5. Re-check of the capabilities that depend on D6 (CLAUDE.md)

- **3.1 guide.** Every product keeps its page. A security's page names its account, and the account's page lists its securities.
- **3.2 comparison.** The candidate set is the 17 product records. The count is unchanged and makam and the bond now carry the account's provider choice. Exposure mode loses one dead option.
- **3.3 checklist.** The marks are unchanged except where account-level rules left a security's record. The validator passes.
- **3.4 workbench.** Unchanged (see section 4).
- **3.10 catalogue.** Unchanged, since it is keyed on provident wrappers.
- **Tier-2 graduation.** Corporate bonds and REITs graduate as securities held in the account (roadmap).
