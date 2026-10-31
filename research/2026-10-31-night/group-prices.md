# Group prices on the securities account (issue 140, 2026-10-31)

Every bank and broker with a record in `data/fees` was read for prices for groups such as young customers, students and released soldiers. The provident records (Meitav, Phoenix) are neither, and are left out. Each finding is in the house's latest record under `groups`, with who qualifies, which fee on which holdings, and how long, in the document's words and page or sheet row.

## The decision

State the prices on the row and keep the ranking on the ordinary customer's price (D43). End dates are published only in part:

- **Printed:** Discount, Mercantile, Mizrahi-Tefahot, Hapoalim, and FIBI for students.
- **Not printed:** Leumi's tariff (only "for a year" on opening a student account, on its student page) and Massad's annex ("by the bank's criteria from time to time").
- **Where printed, the end depends on the person:** age, joining day, a salary condition. A choice on the page would have to guess all three.
- **Holdings:** most trade rows name shares and bonds only. A tracking fund's group price would be the same stretch that ranked PEPPER wrongly. Custody rows naming fund units stand at Discount, Mercantile and Hapoalim; abroad trade rows naming funds at FIBI and Massad; FIBI's self-directed track names a tracking fund.

The rule base has no rule on group prices (searched for the words, none found), and the page says nothing about the law.

## House by house

| House | Finding | What is listed | Ends printed? |
|---|---|---|---|
| Leumi | prices | 14 to 18 and working youth, 18+, released soldier, student, Total Digital from the tariff; soldiers and 18+, released soldier and student from its account pages (custody free, 7 NIS or 7 USD a trade) | Not in the tariff. On the pages: custody free for a year for soldiers, 18+ and students on opening; none printed for released soldiers |
| Discount | prices | Youth, soldiers and national service, released, first-degree students, second-degree and doctoral students, young investor, Digital Premium | Yes |
| Mercantile | prices | Young, soldiers and national service, released, students | Yes. Senior citizens: the annex prints "no information" on securities |
| Mizrahi-Tefahot | prices | Young, soldiers, released, students | Yes. Only the Tel Aviv trade line goes down; no group lowers custody |
| Hapoalim | prices | Young, soldier, released, student, retiree, 60+, new immigrants | Mostly. Retiree and 60+ are closed to new members (since 2003 and 2013) |
| FIBI | prices | Students, yeshiva and seminary accounts, HighTech 10, its self-directed track | Yes. Young and soldier accounts print --- on every securities row |
| Massad | prices | Young, soldiers, students, retiree (closed to joiners on 30.09.2024) | No |
| PEPPER | prices | A joining offer for new customers aged 18+, students or not, from its own page | A year, up to 30 trades a month. The only printed date, 31.10.2026, is on the student account. Nothing carried from Leumi |
| Yahav, Jerusalem, One Zero | a group annex, no securities row | None | Not applicable |
| Altshuler, Excellence, Fair, IBI, Interactive Brokers, Interactive Israel, Meitav Trade, Psagot | no group named in what was read | None | Not applicable |

## Read and inferred

**Read:** every quote in the records. A script checked that all 191 quotes stand as continuous words on the named page or row of the filed copy (0 misses). That check compares words, not meaning; prices were read by a person's reading of the table, and Mercantile p.30 and FIBI's columns were checked by eye and by layout, because their text layers misorder columns.

**Inferred, and marked `inferred` in the record:**
- Leumi: that a group price ends when the person leaves the group. The tariff does not print it.
- Mizrahi-Tefahot: that 0.40% replaces the direct rate of 0.52% and not the branch rate of 0.64%. The annex row names no channel; 0.52% is the rate the ranking uses.
- Mizrahi-Tefahot: the annex row carries line number 4.1, the ordinary line whose footnote takes tracking funds in. That the group price reaches a tracking fund is inferred from that number.

**Not read:**
- Discount's soldiers' and youth pages gave a bot check. Annex A pp.32 to 40 cover those groups.
- Campaign pages were searched once per house, not walked. A short offer outside a tariff can exist unseen.
- One Zero was read in Chrome; the bank refuses scripts, so no copy is filed and the quote check does not reach it. It has no entries.

**Differences recorded and not chosen:**
- Discount: annex p.34 gives released soldiers a year; the young-investor page runs to age 25.
- FIBI's self-directed track: two years from joining, and also a change on 1.1.2027.
- Leumi's student age: 35 on the student page, 34 on another page.

## The size

All figures are computed by the site's calculation and are approximate, on one assumption set: 6,000 NIS plus 400 a month for 20 years at 7%, the ordinary price before and after, the gain at the period's end then grown at 7%. Trade prices are not lowered, since the rows do not name funds there.

| House and group | Period | About, NIS |
|---|---|---|
| Discount, young investor (free custody) | 4 years | 1,468 |
| Discount, student | 4 years | 914 |
| Discount, released soldier | 1 year | 196 |
| Mercantile, student | 4 years | 730 |
| Mercantile, released soldier | 2 years | 266 |
| Massad, student | 4 years (assumed; none printed) | 712 |
| Leumi, student | 4 years (assumed; none printed) | 567 |
| Leumi, student, the ceiling | 20 years (not a real case) | 5,020 |
| Hapoalim, soldier | 3 years | 363 |
| Hapoalim, released soldier | 3 years | 290 |
| FIBI, student | 3 years | 287 |

The ranking does not change, so no ranking commit was needed. Not sized: Leumi's account pages print free custody beside the tariff's rates and do not say how the two combine, so the Leumi figures above use the tariff's rate.

These figures are each house's best ranked way, which on these assumptions is the Yelin Lapidot tracking fund (5139282) at every house. Interactive Brokers and Interactive Israel are not among them: their prices are on iShares Core S&P 500 UCITS ETF (148,640 and 146,975 NIS), an accumulating foreign fund shown without a rank while its tax rule is open. Values: Fair 156,939; Psagot 155,116; One Zero 148,250; Leumi 145,454; FIBI 142,122; Massad 141,971; Hapoalim 141,181; Yahav 141,181; Jerusalem 141,012; Discount 136,652; Mercantile 136,652; IBI 135,703; Mizrahi-Tefahot 132,336; Excellence 96,450.

**The one that is not small:** Discount's Digital Premium has free custody with no end date, on a salary or holdings condition (annex p.40). Held for 20 years it is about 12,968 NIS at the same assumptions, and lifts Discount from tenth to third among the ranked houses on that fund (149,620, between Psagot and One Zero). It is a plan, not a group, and is a separate question for the founder: see the issue opened for it.

## What this corrects

The earlier day report named Leumi's prices as the example. Leumi's tariff list stands, with one addition: its account pages also print free custody and 7 NIS or 7 USD a trade. PEPPER's annex rows in Leumi's tariff are PEPPER's ordinary price, not a group price.

## On the page

- One line under the row of the eight houses with prices; `row_he` compares only with a rate in the house's own record, and the data check holds that.
- A fold before the planned-changes block: one sub-fold per house, then one sentence each for the houses with no securities row and with no group named.
- The calculation does not read `groups`; a test holds that.

## Independent review

A reviewer given the diff and the kit, not this report, read the documents and found errors that the word-by-word quote check could not. All were confirmed against the documents and fixed:

- **PEPPER** was shown as student-only. Its page says one need not be a student, and asks for no Leumi or PEPPER account in the last six months.
- **Leumi** omitted the free custody and 7 NIS or 7 USD trades on a page the record already cited, and put a one-year term on trade prices that have none.
- **Massad's** Tel Aviv row dropped "except mutual funds, Maof options and futures". FIBI's self-directed row had dropped the same words. Both now carry them, and the data check reads words after "למעט" as taking funds out.
- **Discount's** row line and young-investor entry dropped the 150,000 NIS condition.
- **Smaller:** Hapoalim's soldier and student periods, its row line's "limited time" where the youth club prints none, Mercantile's "over 16", Massad's retiree abroad price. The row-line check now holds the ordinary price to the same fee and the lower price to an entry. Sheet links list their real rows, and an entry with two documents names both on the link.

The reviewer also confirmed the prices in the right columns at Leumi, Discount, Hapoalim, Mizrahi-Tefahot, Massad, FIBI and Mercantile. It could not reach One Zero (no filed copy) and did not search Interactive Brokers.

## Structure review

`merge-review.mjs` listed six components outside the kit, all kept as one-offs: `Sources`, `Prices`, `Who`, `Ends` and `GroupPrices` describe one record's shape and appear only in this fold; `GroupLine` is one line on the account list. Nothing was sent back: the fold is built from `Disclosure`, `FoldGroup`, `ProductTable`, `ProductPhoneRow` and `Tag`. The screen was compared at 1280 and 390 px; a script that changes the inputs found every box unchanged. Source links are 44 px on a phone and 20 px on PC, as elsewhere on the page.
