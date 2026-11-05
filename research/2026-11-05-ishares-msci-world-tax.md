# iShares Core MSCI World UCITS ETF USD (Acc): how is it taxed while it accumulates?

Date: 2026-11-05. Fund: IE00B4L5Y983 (SWDA / IWDA), iShares III plc. Nothing in `data/`, the rule base, code or the site was touched.

## Answer

No document names this fund and says how an Israeli individual is taxed on it. The fund is not registered on the Tel Aviv Stock Exchange, and no class of it is approved for offer in Israel. So it has no Israeli annex, and no tax ruling is reported for it. Three sources agree on this. The Securities Authority's list of approved foreign ETFs (40 names) has no iShares Core MSCI World. BlackRock's own product page lists nine exchanges for the fund and none is Tel Aviv, and Israel is missing from its 27 registered locations. The same page for CSPX shows both Tel Aviv (1159250) and Israel. BlackRock's Israeli brochure lists 25 iShares funds on TASE and this fund is not one of them. The fund's own prospectus has no Israeli tax section. The 1.7.2019 ruling reported in other iShares annexes was given to funds registered on TASE, in other umbrellas (iShares II, V and VII plc). **It does not count for this fund.** The same goes for the Invesco ruling (9.2.2022), even though Invesco MSCI World UCITS ETF Acc (IE00B60SX394) is on the Authority's list. For this fund the question stays the general open question of TXF-11, and the record should carry no `tax_ruling`.

## Sources read, with quotes

| Source | What it says | Locator | Strength |
|---|---|---|---|
| [Securities Authority, "קרנות חוץ נסחרות (ETF)", list of foreign funds approved to offer their units in Israel](https://www.new.isa.gov.il/nav-index/supervised-mutualfunds/tax-foreignfunds-etf-faq) | 40 names on pages 1 to 5. The only MSCI World entries are "INVESCO MSCI WORLD UCITS ETF ACC" and "INVESCO FTSE ALL-WORLD UCITS ETF". No "ISHARES CORE MSCI WORLD". | pages 1 to 5, read 2026-11-05 in headless Chromium (library f376d095c3d7ccec) | primary (regulator) |
| [BlackRock, iShares Core MSCI World UCITS ETF USD (Acc) product page](https://www.ishares.com/uk/individual/en/products/251882/ishares-msci-world-ucits-etf-acc-fund) | "Registered Locations Austria Czech Republic Denmark Estonia Finland France Germany Greece Hungary Ireland Italy Liechtenstein Luxembourg Netherlands Norway Poland Portugal Romania Saudi Arabia Singapore Slovak Republic South Africa Spain Sweden Switzerland United Arab Emirates United Kingdom". Under Listings: Bolsa Mexicana, Borsa Italiana, Xetra, Euronext Amsterdam, London (GBP and USD), Santiago (two lines), SIX; "1 to 9 of 9". No Tel Aviv. The word Israel does not appear on the page. | data as of 04/Nov/2026 (library af09db3cdc138cc2) | institution |
| [BlackRock, iShares Core S&P 500 UCITS ETF USD (Acc) product page](https://www.ishares.com/uk/individual/en/products/253743/ishares-sp-500-b-ucits-etf-acc-fund), as a control | Registered locations include "Israel". Listings include "Tel Aviv Stock Exchange 1159250 ILS 05/Aug/2019 ... iSFF702". So the page does name Israel when a fund is registered there. | same date (library 7c7b5360005f2a19) | institution |
| [BlackRock Israel brochure, "איישרס בישראל: קרן סל (צוברת) נסחרת בבורסה ונקובה ב-₪"](https://www.blackrock.com/il/individual/en/literature/brochure/ishares-digital-bookmark-israel.pdf) | 25 rows, 1158989 to 1159276. Its global row is "iShares MSCI All Country World UCITS ETF", SSAC, 1159235. It has no MSCI World row. | p.1, read 2026-10-31 (library 5fae6c1d0933c1bc) | institution |
| [iShares III plc prospectus, dated 30 October 2026](https://www.ishares.com/gls-download/literature/prospectus/ishares-iii-plc-prospectus-en.pdf#page=252) | Israel appears only in Schedule I, "The Regulated Markets", as "Israel Tel Aviv Stock Exchange" (p.252, where the fund may invest), and as the sub-custodian Bank Hapoalim (p.276). There is no Israeli tax section. | 683 pp. (library 1679be6d8c525cb8) | institution |

Inferred, not read:
- The 1.7.2019 ruling reported in other iShares annexes was given to each fund registered on TASE. It does not reach a fund of iShares III plc that was never registered. Its scope is "כנובע מרישומן של היחידות המוצעות למסחר בבורסה" (EM Bond annex, s.13.1).
- Absence from the Authority's list and from BlackRock's registered locations means no annex was filed. An annex is the Israeli document that comes with a registration.

## Searched and not found

- Maya and the TASE site were not opened: Maya is for the founder's hand only, and market.tase.co.il answers with a bot check. They are not needed to settle the registration question, since the three sources above agree.
- A web search for the ISIN with "מס" found no Israeli text.
- "iShares Core MSCI World ... בורסה תל אביב קרן חוץ נספח לתשקיף" found no Hebrew source and no TASE listing.
- "IWDA קרן צוברת מיסוי ... רשות המסים" found nothing on this fund.
- "Core MSCI World" on gov.il: nothing.
- Interactive Israel's tax-withholding service: no written statement that names this fund. Its product list ([inter-il.com](https://www.inter-il.com/financial-products-on-indices/), library 88c66b9b676e15af) names IWDA as "צוברת דיבידנד", traded in Europe, with no tax wording.
- The 750 published rulings were not searched again; the 2026-11-04 search found no fund ruling.

Each search is in `research/library/tried.jsonl`.

## What would still settle it

1. For this fund, nothing more can come from a fund document, because none exists in Israel. Only the general rule can settle it: a Tax Authority text or answer on an accumulating foreign fund bought abroad, which is TXF-11's open question.
2. A written answer from an Israeli broker that holds IWDA for clients (for example, how its withholding treats the fund's kept income). This would be institution strength and about that broker only.

## For the lead

- `data/funds/ie00b4l5y983@2026-10-31.json`: keep `tase_number: null` and add no `tax_ruling`. Two facts could go into its notes, each with a source: BlackRock's page lists no Tel Aviv listing and no Israeli registration (as of 04/Nov/2026), and the Securities Authority's list has no entry for the fund.
- The Securities Authority list now has 40 names. `research/2026-10-31-night/isa-foreign-funds.tsv` has 37 and lacks "ISHARES MSCI GLOBAL SEMICONDUCTORS USD UCITS ETF", "ISHARES MSCI INDIA USD UCITS ETF" and "ISHARES S&P 500 ENERGY SECTOR USD UCITS ETF".
- No rule in the rule base looks wrong from this work. TXF-11 stays as written.
