# One more try at the open questions a reader meets on a page (2026-11-12)

The founder asked for a sweep of places where a page says "עוד לא ברור", "שאלה פתוחה" or "לא ידוע", to find an answer or say something more specific. This pass found which open questions reach a page, ranked them by what they change for a reader, and tried the top ones once more against official texts and the companies' own documents. Everything below was read on 2026-11-12.

## Which questions reach a page

Found in `site/app` and in the records under `data/` that pages show:

| Where the reader meets it | Question | Owner |
|---|---|---|
| Indices page, foreign accumulating funds: "מס בצבירה: לא ידוע" (`tax-on-sale-open`); the fund is listed, not ranked | TXF OQ1 | tax |
| Indices page, VOO, IVV and ACWI: no price, `usFundOpen` | TXF OQ19, OQ23 | tax |
| Every run of an Irish fund that holds US shares: flag `TXF-OQ7` | TXF OQ7 | tax |
| Guide fee table and runs with a discounted fee and one deposit: `lumpSum` sentence, flag `PF-OQ18` | PF OQ18 | domain |
| Makam figure, tax line: `redeemFees` sentence | TX2 OQ11 | tax |
| Makam guide: "מקור אחד סותר" | TXI OQ3 | tax |
| Exposure pages, the pension cards: `openTax` tag, "עוד לא ברור איך זה ממוסה כאן" | PEN OQ7, PEN OQ19 (conversion factors, not tax) | domain |
| Child savings (bank) guide: "שיעור המס במשיכה לא מופיע בשום טקסט של רשות המסים" | TXK OQ1 | tax |
| Bank deposit and savings plan guides: tax when a break takes part of the principal | TXI OQ14 | tax |
| Kupat gemel lehashkaa, study fund, pension: loss on a withdrawal below deposits | TXK OQ10, TXH OQ16, TXP OQ18 | tax |
| Guide chips and sheets | TXI OQ5, TXI OQ9, TXK OQ1, TXK OQ3, TXK OQ7, TXK OQ8, TXS OQ12, TXS OQ17, TXF OQ3, TXH OQ2, TXH OQ11, TXP OQ6, TXP OQ9, GOV OQ2 to OQ9, BANK OQ5, OQ8, OQ12, OQ17, MF OQ1, OQ11, OQ12, CAT OQ2, OQ4, and others | both |

Ranked by what they change for a reader: TXF OQ1 (whether a whole class of funds is ranked), TXF OQ19/23 (three funds without a price), TXF OQ7 (a cost in every Irish fund's figure), PF OQ18 (a fee path for every lump sum in a discounted fund), then the makam and deposit questions (small sums).

## TXF OQ7: settled for the three physical S&P 500 funds (rule TXF-48)

Earlier passes could not open the iShares annual reports (the literature links returned a site page). This time the addresses listed on each fund's product page worked with plain curl.

- iShares VII plc, year ended 31 July 2025 ([PDF](https://www.ishares.com/uk/individual/en/literature/annual-report/ishares-vii-plc-en-annual-report-2025.pdf), library 0527d8b9da405f0d). iShares Core S&P 500 UCITS ETF: p.104, note 5, "Dividend income" 1,454,705 (2024: 1,139,709), USD thousands; p.119, note 10, "Non-reclaimable overseas income withholding tax" (204,953) (2024: (161,565)). Ratio 14.1% (14.2%).
- iShares plc, year ended 28 February 2026 ([PDF](https://www.ishares.com/uk/individual/en/literature/annual-report/ishares-plc-annual-report-en-28-feb-26.pdf), library 00ddf8182684c5c3). iShares Core S&P 500 UCITS ETF USD (Dist): p.110, "Dividend income" 242,290 (2025: 237,798); p.128, note 9, the same tax line (34,260) (2025: (33,465)). Ratio 14.1% (14.1%).
- Vanguard Funds plc, 30 June 2026 ([PDF](https://fund-docs.vanguard.com/etf-annual-report.pdf), library 0b167af5a1250c15; the address is linked from the VUSA page on vanguard.co.uk). Vanguard S&P 500 UCITS ETF: p.372, Statement of Operations, "Dividend Income" 946,653,677 (2025: 833,233,118) and "Taxation" (133,003,437) (2025: (117,688,074)); p.1001, note 5, "Income Withholding Tax" $(133,003,437). Ratio 14.0% (14.1%).

Reading: about 14% in each year is what the treaty's 15% gives (TXF-16), and far from the US statutory 30% (TXF-13). The accounts give one tax line for all countries and name no rate or treaty, so this is a reading of the funds' own figures (institution). Against it in words only: iShares V plc's prospectus, p.210 of the Israeli annex for its S&P 500 Energy fund ([PDF](https://mayafiles.tase.co.il/rpdf/1775001-1776000/P1775855-00.pdf#page=210), library 4380001efa9706cd): "It is anticipated that the Company may not be able to benefit from reduced rates of withholding tax in double taxation agreements between Ireland and such countries."

Still open: the funds on MSCI World (SWDA, iShares III plc) and MSCI ACWI (iShares V plc), where one tax line for every country cannot isolate the US rate.

Recorded: TXF-48 (`tax-securities-foreign.md`, `data/rules/txf-48.json`, scope institution: BlackRock, Vanguard); open question 7 narrowed; Vanguard added to `data/sources/institutions.json` and `fund-docs.vanguard.com` to `data/sources/publishers.json` so that the scope and the publisher resolve.

What the page could say (for the lead; the copy and the engine were not changed): on the three S&P 500 funds, the `TXF-OQ7` flag says "ועוד לא נבדק אם הקרן הזו עומדת בהם". It could say instead: "בדוחות השנתיים של הקרן, המס על הדיבידנדים היה כ־14% מהם בשנתיים האחרונות, כמו שיעור האמנה (TXF-48)", or drop the flag for those funds. Keep the flag on SWDA and ACWI.

## TXF OQ1 (`tax-on-sale-open`): not tried again

The question's file entry lists more than ten passes since 2026-10-22: the whole Ordinance, all 750 published rulings, the gov.il circulars by title for 2002 to 2026, the professional division's reports, the Wayback indexes of taxes.gov.il, the five Israeli prospectus annexes that report the funds' own rulings, and a search for an official copy of the 4.7.2019 letter. This pass found no new place to look that had not been searched. What would settle it is unchanged: the text of one of the funds' rulings, or an answer from the Tax Authority's capital-market department, which only a person can ask for.

## TXF OQ19 and OQ23 (`usFundOpen`): still open

Tried: a Hebrew web search for a Tax Authority ruling or text on a US ETF's distribution (results: a bank's tax page, a practitioner's guide, a press article on PFIC for US persons, a copy of the 2021 international tax report; none cites an official text). Re-read published ruling 5916/20 for the legal form of its US REIT: "חברת X הינה תאגיד מסוג Corporation" (s.1.1), so it says nothing about a trust.

Tightened: the page reason fires because the three records carry no dividend yield; the yield was left out on purpose because of this question (commit 037d9d3b, method F-65). The US side is settled (TXF-41). Only the Israeli class of the distribution, and whether a bank withholds on it under reg. 2(ד), are unknown. A more exact page sentence (for the lead): "אין מחיר לקרן הזו: לא נמצא נוסח רשמי שאומר אם החלוקה של קרן אמריקאית במבנה של נאמנות היא דיבידנד בדין הישראלי. המס האמריקני עליה ידוע: עד 25%, ומקבלים עליו זיכוי בישראל."

## PF OQ18 (`lumpSum`, flag `PF-OQ18`): still open (domain file)

Tried: two Hebrew web searches for a CMA text that defines "הפסקת תשלומים" in circular 2017-9-15 s.3(ב)(1), for a decision on a public complaint about a raise after a single deposit, and for the draft or explanatory notes of the 2017 amendment. Found only press pages (funder.co.il 83266, 23905, 38355), a press account of a 2012 draft, and an unrelated CMA clarification of 8.12.2020 on transfers to an annuity fund (2020-7709, read in a prisha.co.il copy). Nothing settles it. The page's sentence is accurate.

## Exposure pages, the pension cards (`openTax`): a wording finding, not a tax question

The red tag "עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה" appears on a pension card where the record's `tax_at_exit.blocked_by` lists PEN-OQ7 (and PEN-OQ19 for the provident fund for annuity). Both are about conversion factors, which the site has not collected (`pension-and-gemel-lekitzba.md` open questions 7 and 19). How a pension is taxed is in the rule base (TXP-14 to TXP-17). So the tag says something the site does not mean. The guide pages already say it right: "את הקצבה האתר עוד לא מחשב, כי חסרים מקדמי ההמרה". Proposed for the lead (a page change, so a decision in `docs/product.md`): the tag on these cards reads "את הקצבה האתר עוד לא מחשב: חסרים מקדמי ההמרה".

## Not reached this pass

TX2 OQ11 (makam `redeemFees`), TXI OQ3, TXI OQ14, TXK OQ1, TXK OQ10, TXH OQ16, TXP OQ18, TXI OQ5, TXI OQ9. Each one's file entry already lists several passes; the next place to look for each is in its own entry.

## Failed searches logged with `tried`

- Vanguard's annual report at guessed addresses (403); the real address is on the product page.
- A CMA text on a single deposit and "הפסקת תשלומים" (PF OQ18).
- An official text on how Israel classes a US trust ETF's distribution (TXF OQ19/23).
