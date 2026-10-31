# Maya: the managers' prospectuses, 2026-10-31

Read by ordinary page visits in the founder's Chrome. No firewall page or check appeared.

## How to find them

The page `https://maya.tase.co.il/he/funds/mutual-funds/<fund number>/reports` takes the site's own filter in its address:
`?fromDate=2024-01-01&toDate=2026-10-31&noMeetings=true&isSingle=false&isIntendToTaseMember=false&eventsFamilyIds%5B%5D=5700`.
The group 5700 is "תשקיף/דוח/יחידות הקרן". A manager's prospectus is shared by its funds, so one fund of each manager is enough.

The file is `https://mayafiles.tase.co.il/rpdf/<range>/P<report>-00.pdf`, where the range is the thousand holding the report (1753287 is in 1753001-1754000). Plain curl opens it. A report published as a page has `https://mayafiles.tase.co.il/rhtm/<range>/H<report>.htm` instead.

The address form `/he/funds/etfs/<id>` that the fund records used was wrong; that is why the link check saw 403. All 27 records now use `/he/funds/mutual-funds/<id>`. Each of the 27 was opened in Chrome on 2026-10-31 and the page title shows the fund the record names.

## Prospectuses found (current as of 2026-10-31)

| Manager | Fund opened | Report | Dated | Pages | Text |
|---|---|---|---|---:|---|
| Meitav | 1143700 | 1753287 | 7.7.2026 | 162 | yes |
| Kesem | 1145804 | 1761574 | 9.8.2026 | 121 | yes |
| IBI | 1148162 | 1757882 | 25.7.2026 | 108 | scanned, almost no text layer |
| Harel | 1148899 | 1737042 | 2.5.2026 | 112 | yes |
| Migdal | 1150184 | 1719487 | 30.1.2026 | 102 | yes |
| More | 1165810 | 1773628 | 10.10.2026 | 96 | yes |
| Yalin Lapidot | 1201656 | 1709452 | 20.12.2025 | 72 | yes |
| Analyst | 1218916 | 1756857 | 25.7.2026 | 78 | yes |
| Altshuler Shaham | 5139100 | 1760213 | 31.7.2026 | 89 | yes |

## The iShares lines

These are foreign funds, not under `/he/funds/mutual-funds/`, which sends them to the home page. Maya's search sends 1159250 to `https://market.tase.co.il/he/market_data/security/1159250/major_data`, whose reports box links to `https://maya.tase.co.il/he/reports/foreign-etfs` and to single reports.

- Report 1763539 is the iShares VII plc umbrella prospectus dated 2 June 2026, 209 pages. It is in English and is the home country document, not an Israeli annex. Whether an Israeli annex exists for 1159250, 1159243 and 1159235 is not settled by this.
- Report 1770707, 15.9.2026: BlackRock stops offering units in Israel from 15.12.2026 of iShares S&P 500 Consumer Discretionary Sector UCITS ETF, number 1159227. It is a sector line, not one the site lists, and the notice is not about 1159250.
- The same company's list shows letters to investors of 15.9.2026 about deleting funds in iShares IV plc and iShares V plc. Those letters were not read.
