# Job 3: international funds and purchase loads

Issues 30 and 44. Checked 2026-10-31. Nothing in `data/`, `packages/` or `site/` changed. The records wait in `research/2026-10-31-night/funds/` for a mockup. Neither issue is closed: issue 30 still has "include in the indices page", issue 44 the field, label and pricing.

## Purchase load (issue 44)

All 14 tracking funds in `data/funds/` charge no load on purchase today. Each fund's filed report says so on page 1, in the words "שיעור ההוספה המשולמת בעת רכישת היחידות 0%" or "ללא תוספת הוספה". Every fund's words, library id, link and report date are in `funds/loads.json`.

- **What this means on screen:** a load label would show on no collected fund, and pricing it adds nothing today.
- **A zero is today's rate:** MF-21 puts the maximum in the fund agreement, and the prospectuses were not read. The reports say a manager may raise a load only on 1 January, so that is the re-check date.
- **A count over collected funds only:** 14 of 14 says nothing about the whole market.
- **Not a load:** a distributor may still charge a commission on buying or selling (Kesem's report, footnote 4, library b7016e91c43c80bf). That belongs to the tariff line.
- **Unclear date:** on 5127527 (library fceb8de34fb6b1d2) the report's date line is damaged in the text. The year 2025 is legible, the day is not.

Not checked:

- **Redemption deduction:** a word search of the 14 reports finds "ניכוי" only in other senses (tax, net assets). That does not show a zero, and the prospectuses that would state it are on Maya.
- **ETFs:** their reports have no load line. They print creation and redemption fees, which apply only to an order placed with the manager. I did not read every ETF, and the issue asks about tracking funds.

### Proposed field

Add one optional entry to `fees` in `fundRecord` (`packages/schema/src/collections/funds.ts`) and in `docs/data-schema.md` section 3.5:

```json
"load": {
  "value": 0,
  "unit": "pct_of_trade",
  "source": { "url": "<report>#page=1", "title": "<report, date, the words>", "publisher": "<manager>", "strength": "institution" },
  "checked": "2026-10-31",
  "update_rule": "provider-set",
  "rule_ids": ["MF-21"],
  "state": "sourced"
}
```

- `0` means a document was read and says zero. `null` or left out means not read, so a missing value is never shown as zero.
- ETFs and foreign funds leave it out: they print no such line, and writing zero would be my inference. A Vanguard key information document does print "Entry charge None", but that is its own term.
- It stays apart from `creation_redemption_fee_category`, which is a different cost paid by a different person.
- `redemption_deduction` takes the same shape when it is read. The fee bases `load` and `redemption_deduction` are already listed in `docs/data-schema.md`.
- The reports express the load as a share of the unit price ("ממחיר היחידה"), and `pct_of_trade` is the nearest existing unit. The engine would apply it to the amount bought.

## International funds (issue 30)

Nine records, each passing the `fundRecord` schema, with `id@2026-10-31.json` names:

| Index | Fund | Identifier | Annual charge | Payout | On TASE | Library id, page |
|---|---|---|---|---|---|---|
| S&P 500 | iShares Core UCITS Dist (IUSA) | IE0031442068 | 0.07% | Quarterly | No line seen | 42f663b2cc0e8cc1, 1 |
| S&P 500 | Vanguard UCITS Acc (VUAA) | IE00BFMXXD54 | 0.07% | Accumulating | No line seen | be6b56d18242118d, 1 |
| S&P 500 | Vanguard UCITS Dist (VUSA) | IE00B3XXRP09 | 0.07% | Quarterly | No line seen | 97b49e692be6c260, 1 |
| S&P 500 | Vanguard VOO (US) | CUSIP 922908363 | 0.03% | Quarterly | Not checked | e96f5ad4c4aee46c, 1 |
| S&P 500 | iShares IVV (US) | CUSIP 464287200 | 0.03% | Quarterly | Not checked | d3b9d8ac355f1dcf, 1 |
| NASDAQ-100 | iShares UCITS Acc (CNDX) | IE00B53SZB19 | 0.30% | Accumulating | 1159243 | e457a683e46d38ca, 1 |
| MSCI World | iShares Core UCITS Acc (SWDA, IWDA) | IE00B4L5Y983 | 0.20% | Accumulating | No line seen | 2460e00d3df1b43d, 1 |
| MSCI ACWI | iShares UCITS Acc (SSAC) | IE00B6R52259 | 0.20% | Accumulating | 1159235 | 563983ad940955d1, 1 |
| MSCI ACWI | iShares ACWI (US) | CUSIP 464288257 | 0.32% | Semi-annual | Not checked | 6278e1accc3bc2e3, 1 |

Limits of these sources:

- "No line seen" means the fund's factsheet does not mention Tel Aviv. For the iShares funds, BlackRock's Israel brochure has no row for them either. It does not show the fund is absent from TASE, because TASE's list blocks scripts.
- Every value comes from the company's own factsheet and answers only for that fund.
- The Vanguard factsheets say they are directed at professional investors. The key information documents print the same 0.07% (3ab0270f05a4be5d and a9a658c3f0359376, page 2, accurate at 17/02/2026).
- The IVV link served the June 2026 edition.
- US fact sheets print no ISIN, and those of IVV and ACWI do not state how the fund tracks its index. Those fields stay empty.
- Only the annual charge is filled. Tracking difference, spread and withholding drag are `null`, and no prospectus was opened.

Read but not recorded, because the site has no FTSE index (ETF-50):

| Fund | Identifier | Annual charge | Library id |
|---|---|---|---|
| Vanguard FTSE All-World Acc (VWRA) | IE00BK5BQT80 | 0.14% | 083b682e7f62e154 |
| Vanguard FTSE All-World Dist (VWRL) | IE00B3RBWM25 | 0.14% | c7e008591fcf56ca |
| Vanguard FTSE Developed World Acc | IE00BK5BQV03 | 0.12% | 0734e5171f58bf63 |
| Vanguard Total World, VT (US) | CUSIP 922042742 | 0.06% | e3d4e8e557797163 |

### The founder's tax question

Job 1 settled it. IE00B5BMR087 is not self-reported through an Israeli bank or a TASE-member investment house: the bank withholds. Self-reporting belongs to a foreign broker. So the label on that fund is wrong for a bank holder and right for Interactive Brokers.

The label sits in `site/app/lib/labels.ts` lines 131-132 and applies to every foreign fund. It belongs on the route, not the fund, and moving it needs a mockup.

This job adds that the fund is on TASE itself: BlackRock's Israel brochure prints it as 1159250, iSFF702, 0.07%, under a heading saying it is denominated in shekels (library 5fae6c1d0933c1bc, page 1).

## Not found, and why

- **TA-35 from iShares (IE00BP3QZG05):** not read, no record. Three likely factsheet links answer with BlackRock's global directory. Only third-party sites came up, and they conflict on whether the fund is still active ([etf.capital](https://etf.capital/etf/IE00BP3QZG05), [finanzen.net](https://www.finanzen.net/etf/ishares-ta-35-israel-etf-ie00bp3qzg05), [cbonds](https://cbonds.de/etf/4029/)). These are leads, not sources. I give no fee and no status.
- **Invesco, including QQQ, MSCI World and NASDAQ-100 Swap:** not checked. invesco.com answers 406 to scripts. On the Chrome list.
- **Other Vanguard indices:** every Vanguard world fund I read tracks FTSE. Whether Vanguard has an MSCI World or NASDAQ-100 fund was not checked, so I do not say it has none.
- **TASE's foreign fund list:** blocked by a bot check, on the Chrome list. Which ISIN each Invesco number is, and whether a Vanguard fund has a TASE line, stay open.
- **Maya:** refuses automated browsing. Wanted, and listed: the tracking funds' prospectuses (maximum load, redemption deduction) and the Israeli offering documents of the three iShares TASE lines.

## For the data files and the rule base

- **Existing record:** `data/funds/ie00b5bmr087@2026-10-24.json` has `tase_number: null`. The brochure gives 1159250, ticker iSFF702, and a shekel line.
- **Rule base, for its owners:**
  - ETF open question 5: the brochure's table is readable. CSPX 1159250, CNDX 1159243, SSAC 1159235, SMEA 1159094, EIMI 1159169.
  - MF open question 7: narrowed by the count above. It stays open for the market and for the redemption deduction.
  - ETF-63: the distributing class IUSA is read at 0.07%, quarterly.
  - Missing rule: none.
- **Existing record:** 1143718 points to the Meitav main prospectus rather than its annual report.

## For the founder

- **Load label:** with every collected fund at zero, I recommend showing no label until a fund charges one. That goes through a mockup, as does moving the self-report label.
- **Which funds join the page:** also waits for that mockup. US-domiciled funds carry the US estate tax duty (TXF-27), and Israeli tax treatment of a trust-form fund is open (tax question 19). I recommend the Irish ones first.

## How the work went

- **Library repair:** I filed 15 scratch files without an extension, so they went in with no text. I repaired those entries in `research/library/index.jsonl` with a small script that took the library's own lock and touched only them, and corrected two publisher labels the same way. The index stays uncommitted for the lead.
- **Safety check:** a built-in check stopped one command because of a stray `mkdir` and `rmdir` I had included by mistake. Nothing ran and nothing was removed. No deletion was needed, and I reran it without them.
