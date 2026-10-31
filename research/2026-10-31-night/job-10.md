# Night job 10: self-service channels, popular brokers, Leumi's foreign lines, standing orders, the five candidates

Date read: 2026-10-31. Nothing under `data/`, `site/` or `packages/` was changed. Places are library document id and page, under `research/library/`. Filed tonight: `0f78d041cd99c818`, `40af22f3873afa06` (FIBI's leaflets), `3d56645174b8a3b4` (Meitav Trade's tracks page). "Not checked" means the page was blocked, not that the thing is absent. No document addressed any text to an agent or tool.

## What matters most

1. **The comparison has five candidates because of a code fault, not because of the banks' tariffs** (question 5). Nine banks are dropped by an error that is caught silently. Tonight's pick of One Zero was made without them.
2. **Bank of Jerusalem's direct price has no minimum in the record, and its tariff prints one**: 20 NIS, maximum 20,000 (`2fddc750f3f74c72` p.19). On a 500 NIS purchase the record gives 2.50 NIS, the tariff 20 NIS. The record's note says the minimum is not printed; that is true of p.6 and wrong for p.19.
3. **Leumi is the only institution priced on a standing-order line**, which its tariff limits to buying. Massad and FIBI print a standing-order minimum of 7 NIS that is not in the data, so like is not compared with like (question 4).
4. **PEPPER (Leumi group's digital bank) has a real price list of its own that the data does not hold**: 4 NIS flat up to 30,000 NIS an order. Whether it covers a tracking fund is not stated.
5. **Fair is the one popular TASE member with a tracking-fund price that is not held**: 0.08%, minimum 3 NIS.

Items 1 to 3 touch each other. On the indices page's case (10,000 NIS and 500 NIS a month) the two banks cheaper than One Zero (cost 4,549) are Jerusalem (4,343) and Leumi (4,365). Each rests on item 2 or item 3. Corrected, Jerusalem pays 17.50 NIS more per monthly purchase and Leumi, on a regular line, 21 NIS more. I did not rerun the engine with those changes, so whether the pick moves is open.

## Question 1 and 2: table by institution

Prices are the commission for a tracking fund on TASE, per trade, in the direct channel, as read. Full lines and custody are in the basis table below.

| Institution | Self-service channel | Own price list? | Its lines for a tracking fund | Who may use it | Document, page |
|---|---|---|---|---|---|
| Leumi | Leumi Trade, TRADE ON (https://www.leumi.co.il/he/investments/leumi-trade) | No: the page links only to the bank's fee list; the tariff names TRADE ON as a direct channel | Tariff's direct line; one feature of its own: "קניה מרוכזת לתיק" in Leumi Trade is a percentage with no minimum. Rate not checked for tracking funds | Leumi customers | `f31f4fdbee1483d9` p.13, p.30 note 15; `20ee2661eb1ba339` |
| PEPPER (Leumi group) | Separate digital bank account; trades in the "טרייד" app (https://www.pepper.co.il/) | **Yes**, annex א' of Leumi's tariff | 4 NIS up to 30,000 NIS an order for "מניות, מק"מ ואגרות חוב"; larger orders at the tariff. Custody: page says "דמי הניהול הם 0.15% לרבעון". **Tracking fund not stated** | PEPPER customers; a Leumi customer must open a new, separate account | `f31f4fdbee1483d9` p.11; `720b935d7bcbee9e` |
| Hapoalim | "Poalim MyTrade" and a capital market app, by the earlier landscape report; no such name in the tariff | None found in the tariff; site not checked (302) | Tariff's direct line | Not checked | `e939af51e5b97376` rows 947, 958, 962 |
| Discount | דיסקונטרייד | No. Tariff: advanced trading systems "בתעריף אינטרנט" | Tariff's direct line | Not read; site's page not checked | `b576758838afae08` p.47, p.11 |
| Mercantile | מרכנתילטרייד | No. Tariff: "כפי התעריף באינטרנט" | Tariff's direct line | Not read | `5fd0b860eaea10ee` p.37, p.12 |
| Mizrahi-Tefahot | Capital market app "מזרחי טפחות - שוק ההון" (app store listing, a search lead only) | None found. `/brokerage/amalot/` holds actual-charges figures, not prices | Tariff's direct line | Not read | `8dedbb45235cd662` p.47 |
| FIBI | Bank's app and site; "FIBI Trade Academy" is named on a leaflet, the system's own name not confirmed | No list; **club leaflets with lower prices, a promotion, not used** (see Conflicts) | Tariff's internet line | Leaflet: club members acting alone in the app or site, at the bank's discretion | `4cfbcc09992df849` p.1; `0f78d041cd99c818` p.2-3 |
| Massad | None found, looked at the tariff; site not checked (bot check, path 404) | None found | Tariff's internet line | Not checked | `14d10e0ed6b25245` p.1 |
| Yahav | None found, looked at the tariff; site not checked (bot check) | None found | Tariff's internet line | Not checked | `7195a5fd275270b4` p.13 |
| Jerusalem | None found, looked at the tariff; site not checked (bot check) | None found | Tariff's annex ה' | Not checked | `2fddc750f3f74c72` p.19 |
| One Zero | The bank is itself digital; site not checked (403). I did not read the tariff: no filed copy, the lead read it in Chrome | Tariff is the channel's | 0.3%, minimum 30 | Not checked | Record `one-zero@2026-10-31`, PDF p.9-11 |
| Altshuler Shaham Trade | The firm is the channel | Tariff is the channel's | See basis table | Not read tonight | `500b2b74e04bd53e` p.2 |
| Excellence | The firm is the channel | Tariff is the channel's | See basis table | Not read tonight | `6c9ec0ada66f77d8` p.3 |
| Psagot | פסגות טרייד | Tariff is the channel's | See basis table | Not read tonight | `95671307abfe64f1` |
| IBI | IBI Trade; IBI Smart app | Tariff has no Smart prices. The site's menu names a Smart app and "הטבת 0 ₪ קרנות נאמנות נבחרות": **not checked** (bot check) | See basis table | Not checked | `1b2d30fbf999c143` p.3; `4c491702ea6ac300` |
| Meitav Trade | M Trade; four tracks | Yes, and its own pages disagree with it (see Conflicts) | Tariff 0.3%, minimum 10, no fund line. Not in the comparison: record is marked missing | General track: 10,000 NIS to open | `3ec196cf860a522c`; `3d56645174b8a3b4` |
| Interactive Brokers, Interactive Israel | Foreign brokers | Own lists, no TASE fund line in the data | None | Not read tonight | Records in `data/fees/` |

### Popular brokers not in the data

TASE has eight non-bank members (rule BRK-32): Altshuler Shaham Trade, Excellence, Blink Fintech, UBS Securities Israel, Meitav Trade, Fair, Psagot, IBI. Three web searches and the 2026-10-25 landscape report found no other brand that holds a retail account of its own.

| Name | Address | Price list | Tracking fund on TASE | Use it? |
|---|---|---|---|---|
| Fair | https://www.fair.co.il/ | Published, updated 03/06/2026 (`f97c08b6915868c1`) | "0.08% (מינ׳ 3 שקלים)" buy and sell, on funds it marks as tracking funds. Monthly handling fee 0. Transfer out 35 NIS. **No custody line printed.** First investment minimum 250 NIS (`7569f0109e55fed1`) | **Add.** The home page says "בלי דמי ניהול", which does not name custody |
| PEPPER | https://www.pepper.co.il/ | See above | Not stated | Add once coverage is read |
| Blink | https://heyblink.com/ | Published (`5f3fa36eaa2b6484` p.2) | The line that includes tracking funds reads "לא רלוונטי": it **cannot** buy one on TASE. Only traditional funds, 1.8% | No |
| UBS Securities Israel | - | Not looked for | Not retail by the landscape report | No |

Not a source and not used: comparison sites (TheMarker, Financa, Moneyplan, TradingIL), which came up in the search only. Their "IBI Smart without custody" claim is why IBI Smart is on the Chrome list.

## Question 3: Leumi's foreign lines on p.14

They are the price of buying or selling shares and mutual funds abroad, annex ה', "קניה, מכירה של ני"ע בחוץ לארץ: מניות וקרנות נאמנות".

| | Rate | Minimum | Cap on minimum | Maximum |
|---|---|---|---|---|
| By a clerk | 0.9% | 25 USD | 30% of the payment | 7,500 USD |
| Direct: internet, mobile, TRADE ON | 0.3% | 24 USD | 27% of the payment | 6,750 USD |

An unexecuted order costs 25 NIS by clerk and nothing directly. P.31, part 4(א)(4) repeats the clerk line for "מניות, אגרות חוב וקרנות נאמנות" and adds third-party costs (broker, custodian) per part 11. So the bonds are in the clerk line and p.14 names only shares and funds in the direct line. `leumi@2026-10-23` has no foreign trade line: a real gap.

## Question 4: the standing-order lines

**Leumi**, `f31f4fdbee1483d9` p.30 note 10: "בגין קנית קרן מחקה באמצעות הוראת קבע, תיגבה עמלה בשיעור 0.225%, מינ' 5 ש"ח מכסימום 6,300 ש"ח". Buying only. The rate and the minimum both fall.

**Massad**, `14d10e0ed6b25245` p.1 note 13, and **FIBI**, `4cfbcc09992df849` p.1 note 13, in the same words: "בגין רכישת/מכירת קרן מחקה באמצעות הוראות קבע תיגבה העמלה בכפוף לעמלת מינ' מופחת בסך 7" NIS. Buying and selling. Only the minimum falls, the rate stays. Neither note says whether it applies at the internet rate or the clerk rate; I read it as the rate of the channel used, and that is my inference, not printed. The same notes' companions (Massad p.2 note 11, FIBI p.2 note 10) give 4.5 USD for an ETF abroad.

**The other tariffs**: no standing-order price for a tracking fund found at Hapoalim, Discount, Mizrahi-Tefahot, Mercantile, Yahav, Jerusalem, Altshuler, Excellence, IBI, Psagot, Meitav Trade or Fair (searched by words, each filed copy). One Zero: not read by me.

### Basis table

Line = what the latest record gives for a tracking fund in the direct channel. Commission at 500 and 10,000 NIS is plain arithmetic on those values (rate against minimum). Custody is per quarter unless stated.

| Institution, record | Line | Rate, minimum, maximum (NIS) | At 500 | At 10,000 | Custody | Basis | Place |
|---|---|---|---|---|---|---|---|
| **Leumi** @10-23 | `leumi-tracking-fund-standing-order` | 0.225%, 5, 6,300 | 5 | 22.50 | 0.15% | **Standing order, a buy-only line, also used for sales** | p.30 note 10 |
| Leumi if regular | `leumi-buy-sell-tase-direct` | 0.4%, 26, 6,300 | 26 | 40 | 0.15% | Regular; the record leaves tracking funds out of this line, though footnote {4} p.34 includes them | p.13, p.30 note 3, p.34 |
| Hapoalim @10-31 | `hapoalim-buy-sell-tase-direct` | 0.40%, 20, 7,000 | 20 | 40 | 0.15% | Regular | rows 947, 958, 962 |
| Discount @10-31 | `discount-buy-sell-tase-direct` | 0.40%, 25, 7,150 | 25 | 40 | 0.2% | Regular | p.11, p.47 |
| Mercantile @10-31 | `mercantile-buy-sell-tase-direct` | 0.40%, 25, 7,150 | 25 | 40 | 0.2% | Regular | p.12, p.37 |
| Mizrahi-Tefahot @10-31 | `mizrahi-buy-sell-tase-direct` | 0.52%, 45, 9,675 | 45 | 52 | 0.175% | Regular | p.47 |
| FIBI @10-31 | `fibi-buy-sell-tase-direct` | 0.30%, 39, 6,900 | 39 | 39 | 0.195% | Regular; a 7 NIS minimum exists by standing order and is not held | p.1 notes 9, 13 |
| Massad @10-31 | `massad-buy-sell-tase-direct` | 0.40%, 35, 6,300 | 35 | 40 | 0.195% | Regular; a 7 NIS minimum exists by standing order and is not held | p.1 notes 9, 13 |
| Yahav @10-31 | `yahav-buy-sell-tase-direct` | 0.4%, 20, 4,000 | 20 | 40 | 0.15% | Regular | p.13 note 06 |
| **Jerusalem** @10-31 | `jerusalem-buy-sell-tase-direct` | 0.5%, **none, none** | **2.50** | 50 | 0.15% | Regular, **minimum missing** (tariff: 20; maximum 20,000; then 20 at 500 NIS) | p.6 note 4, p.19, p.7 note 4 |
| One Zero @10-31 | `one-zero-buy-sell-tase` | 0.3%, 30, 6,000 | 30 | 30 | 0 | Regular | PDF p.9-11, record |
| Altshuler @10-23 | `altshuler-trade-buy-sell-funds` | 0.15%, 16 | 16 | 16 | 0.15% a month as recorded, minimum 75 a month; fee up to 80 a month | Fund line | p.2 lines 5, 10 |
| Excellence @10-31 | `excellence-buy-sell-tase` | 0.4%, 10 | 10 | 40 | 0.6%, minimum 40; fee up to 99 | Regular, names tracking funds | p.3 line 1 |
| IBI @10-23 | `ibi-buy-sell-mutual-fund` | up to 0.08%, 5 | 5 | 8 | 0.1%; fee up to 50 a month | Fund line | p.3 line 2 |
| Psagot @10-23 | `psagot-buy-sell-mutual-fund` | 0.07%, 2 | 2 | 7 | 0.03% | Fund line | line 2 |

Altshuler's custody reading ("0.15%, מינימום ₪ 75 לחודש" against the record's period of a month) is the record's; I did not reopen it.

## Question 5: why five candidates

`providerTariffs` calls `buildTariff` with no fund, and for the nine banks with `distribution_handling` lines on tracking funds `workbench.ts:403` reads `input.fund.distribution`, throws, and `catch { break; }` drops the bank silently; only Altshuler, Excellence, One Zero, Psagot and IBI survive (Interactive has no line, Meitav Trade is marked missing).
The test `compare-broker.test.ts` pins Leumi's absence with a comment saying "no line", which is not the reason.

## Conflicts

| Where | One says | The other says | Handling |
|---|---|---|---|
| Meitav Trade | Tariff 04/2026, `3ec196cf860a522c` p.3: custody 0.15%, minimum 270 NIS a quarter | Pages: "ללא דמי משמרת ועמלות נסתרות", "פטור מדמי משמרת" | Stays unpriced, as job 2 found |
| Meitav Trade, funds-only track | Page: no fees "על קרנות מנוהלות אקטיבית", portfolio minimum 100,000 NIS (`3d56645174b8a3b4`) | Tariff has no such track | Promotional track. Tracking funds are **not** named as free. Not used |
| FIBI | Tariff: 0.30%, minimum 39, custody 0.195% | Leaflet: tracking fund included 0.1%, minimum 5, custody 0.025%; standing-order purchase off the internet 0.1%, minimum 5 (`0f78d041cd99c818` p.2-3) | Club promotion, at the bank's discretion, two years, no benefit from 1.1.2027 (`40af22f3873afa06`). Files dated 11/2024. Not used |
| PEPPER | Annex prints the price, not third-party costs | Page: third-party costs "עלינו" | Company's term; goes on its own page if added |
| Jerusalem | Record's note: minimum "not printed" | Tariff p.19: 20 NIS, maximum 20,000 | Tariff wins; correction below |

## Proposed data (nothing applied)

Corrections that need no decision:

| Record | Field | Value | Document, page |
|---|---|---|---|
| `jerusalem` | `jerusalem-buy-sell-tase-direct.min` | 20 NIS | `2fddc750f3f74c72` p.19, annex ה', in force from 15/07/2025 |
| `jerusalem` | `jerusalem-buy-sell-tase-direct.max` | 20,000 NIS | same |
| `leumi` | new `leumi-buy-sell-foreign-branch` | rate 0.9, min 25 USD, max 7,500 USD | `f31f4fdbee1483d9` p.14, p.31 |
| `leumi` | new `leumi-buy-sell-foreign-direct` | rate 0.3, min 24 USD, max 6,750 USD | p.14 |
| `leumi` | `leumi-buy-sell-tase-direct.applies_to` and the branch line's | add `mutual_fund_units` | p.34 footnote {4}. **Do with decision 1**: alone it makes the record ambiguous |

After decision 1:

| Record | Field | Value | Document, page |
|---|---|---|---|
| `leumi` | `leumi-tracking-fund-standing-order`: band and buying only, no longer the default | rate unchanged | p.30 note 10 |
| `massad` | new standing-order line | direct rate 0.40, min 7 | `14d10e0ed6b25245` p.1 notes 9, 13; rate is my inference |
| `fibi` | new standing-order line | direct rate 0.30, min 7 | `4cfbcc09992df849` p.1 notes 9, 13; rate is my inference |

New providers, after decisions 2 and 3:

| Record | Field | Value | Document, page |
|---|---|---|---|
| `fair@2026-10-31` | buy-sell line for `mutual_fund_units` | rate 0.08, min 3 NIS | `f97c08b6915868c1` |
| | account fee | 0 | same |
| | transfer out | 35 NIS | same |
| | custody | **leave empty**, not printed | - |
| | minimum | 250 NIS | `7569f0109e55fed1` |
| `pepper@2026-10-31` | flat trade line, band up to 30,000 NIS | 4 NIS, for shares, makam and bonds; **tracking fund only if read** | `f31f4fdbee1483d9` p.11 |
| | custody | 0.15 a quarter; maximum not printed for Israeli securities | `720b935d7bcbee9e` |
| | foreign trade | 4 USD up to 8,000 USD | p.11 |

## Blocked or not read

Added to `research/2026-10-31-night/chrome-list.md`: PEPPER's coverage of tracking funds; Hapoalim's capital market page; One Zero's site; IBI Smart and IBI's 0 NIS offer; Massad's, Jerusalem's and Yahav's capital market pages; FIBI's and Discount's self-service pages.

Also not done: the engine was not rerun with any correction; who may use the banks' channels is not printed in the tariffs; Hapoalim's PDF (`40bd62035edbad6f`) has garbled text, so the xls was used.

## Rule base, for its owner

- Nothing on PEPPER in `brokerage-account.md`.
- The Meitav Trade funds-only track ("not found", around line 601) now has a page: `3d56645174b8a3b4`. Its exemption names actively managed funds, so it is no help for a tracking fund.
- `research/discovery/2026-10-25-broker-landscape.md` calls Discount Trade unconfirmed: the tariff, p.47, now confirms it. It also says Meitav Trade's tariff was collected; the record is marked missing.
- Open questions 18 and line 317 of the same file: out of date, as job 2 said.

## What the founder must decide

**1. On which price should a tracking fund be compared when the bank has a cheaper standing-order price?**
Today Leumi alone gets it: 5 NIS on a 500 NIS purchase, against 20 to 45 NIS at the banks on their regular lines. Massad and FIBI print 7 NIS and don't get it.
- Regular price for everyone: fair and simple, but it overstates the cost for someone who buys monthly by standing order at those three.
- Standing order wherever printed: closer for monthly buyers, but it needs a rate I inferred for two banks, and Leumi's is buying only, so lump sums and sales need the regular line anyway.
- **I recommend the regular price for everyone**, with a sentence on those three banks' pages naming the cheaper standing-order price. It can be priced properly later as a second line for monthly purchases only.

**2. Should Fair join the list?** It is a TASE member with a published price, and cheap for small purchases. Its price list covers funds only. Its custody is not printed, so the comparison would have to show that as unknown. **I recommend yes.**

**3. Should PEPPER join?** It may be the cheapest for monthly purchases at any bank, and a person must open a new account for it. **I recommend listing it only after someone reads that the 4 NIS covers tracking funds.** It may need a question to its service.

**4. Should FIBI's club prices be shown?** They are far lower than the list, but discretionary and end on 31.12.2026. **I recommend not pricing them**, only a sentence on FIBI's page with the end date.

## For the lead, no decision needed

The fix for the nine banks is a bug fix and should come together with the Jerusalem correction and decision 1, since the fix alone would bring Jerusalem in at 2.50 NIS a purchase and could wrongly crown it. The pick of One Zero should be rechecked after that.
