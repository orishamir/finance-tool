# Index facts and swap versus physical replication (R-index, 2026-10-25)

Brief: the founder asked whether the site considers Israeli index funds such as "הראל מחקה ת"א 35", and whether funds that use swaps instead of holding the shares earn more. They asked about the most popular indices: TA-35, TA-90, TA-125, the S&P 500, the NASDAQ-100 and a world index. This pass wrote the rule-base side, in `.claude/skills/il-finance/references/etfs-and-index-funds.md` and `data/rules/etf-44.json` to `etf-54.json`. R-funds writes the fund and exposure records in parallel.

Method: primary documents only, each opened and read. TASE's index pages were read in Chrome. TASE's guidelines PDF, Nasdaq's and MSCI's methodology PDFs and factsheets, the Reshumot gazette and fourteen fund annual reports on mayafiles were fetched with curl. Every `p.N` is the PDF file page. TASE's and Maya's fund lists were read in Chrome and only counted, because CAT-43 forbids storing them. `npm run validate`: data/ is valid. The warnings are of the existing kinds (see "Hand-offs").

## The plain answer to the founder

**Do swap funds earn more? The sources do not show that. Here is what they do show.**

1. **Harel's TA-35 fund does not use a swap.** Its annual report says it gets its exposure "בעיקר באמצעות ביצוע עסקאות במניות הנכללות במדד" (mainly by buying the index shares), sometimes with options on the index. On average it held 99.96% of its net assets in the TA-35 shares in 2025. Harel's open TA-35 and TA-90 funds and Kesem's TA-35 fund say the same (ETF-52). The law is the reason. An Israeli fund may hold an unfunded swap only when the underlying is "מדד ניירות ערך זרים או סחורה או מטבע חוץ" (an index of foreign securities, a commodity or a currency). The source for this is reg. 2(3א) of the assets regulations as amended in 2018, read in the official gazette (ETF-51). A fund on TA-35, TA-90 or TA-125 therefore holds the shares, or options and futures traded on TASE.
2. **Funds on foreign indices mostly use swaps.** This covers the S&P 500, the NASDAQ-100, MSCI World and MSCI ACWI. Both the ISA's reports and the funds' own reports say so (ETF-11, ETF-52). Their benchmark is the index's **net total return**: dividends reinvested after a 30% U.S. withholding tax. That 30% is MSCI's rate for an investor with no tax treaty and Nasdaq's "indicative" rate (ETF-47, ETF-49). The swap pays the fund that net return. The fund pays the counterparty a spread and interest, and earns interest on the cash it keeps aside (ETF-53). In every swap fund read, the "tax expenses" line is 0.00% or close to it. A fund that held the U.S. shares itself could suffer tax abroad (TXS-15).
3. **In 2025, six of the seven swap funds read returned a little more than their net-of-tax index before expenses.** This is my own arithmetic over each fund's published figures: about +0.1 to +0.8 percentage points. After expenses, including the variable fee, which goes up when a fund beats its index, six of the seven trailed the index (ETF-54). The physical TA funds came within a few hundredths of a point of their gross index.
4. **No official comparison of tracking by replication method was found.** Neither the ISA nor TASE publishes one. No document says whether a swap counterparty passes any withholding saving back to the fund. The swap spread is not published as a number.

**What can be said with sources:** for a foreign index, a swap fund avoids holding the shares directly. It is measured against an index that already assumes a 30% withholding on U.S. dividends, and in 2025 most of the funds read roughly matched or slightly beat that index before fees. That is not proof that swaps "get higher yields". One year and seven funds are too few to show it. The edge, where there is one, is shared with the manager through the variable fee. A physical alternative exists too: an Irish-domiciled UCITS fund holding U.S. shares suffers 15% withholding (TXF-16), also below the index's 30%. The comparison that would settle the question needs the managers' published 12-month tracking difference for many funds over several years (ETF-07). That data has not been collected.

**How strong the sourcing is:**
- The legal frame and the index definitions are **primary**: the law, the gazette, TASE's guidelines and Nasdaq's and MSCI's methodologies.
- How each fund replicates, what it pays and how it tracked are **institution**: the funds' annual reports, a handful of examples.
- The pre-expense outperformance is **computed** by me from institution figures, and labelled as such in ETF-54.
- The claim "swap funds earn more" is **not established**.

## New rules

| ID | One line | Main source |
|---|---|---|
| ETF-44 | TA-35: the 35 largest shares meeting the thresholds, ranks 30 to enter and 40 to leave, a 7% cap (10% ceiling) with a specific cap per U.S.-incorporated share, gross total return, launched 2.1.1992 | TASE index page 142 (Chrome); guidelines pp.28-29, annex 1 |
| ETF-45 | TA-90: the next 90 Israeli shares after TA-35, ranks 80 and 100, fast-track rank 65, a 2% cap, gross total return, launched 3.1.1999 | TASE index page 143 (Chrome); guidelines pp.32-33, annex 4 |
| ETF-46 | NASDAQ-100: 100 large non-financial Nasdaq-listed companies, modified market-cap weights (company cap 20% when one passes 24%; security cap 14%; aggregate rules), reconstitution in December and rebalances in March, June and September | Nasdaq methodology pp.1-9; factsheet p.1 |
| ETF-47 | NASDAQ-100 versions: NDX price, XNDX gross, XNDXNNR notional net (70% of dividends reinvested, 30% tax); the Israeli funds track the net version plus the dollar | Nasdaq "NDX Index Versions" p.1; IBI, Mor and MTF reports |
| ETF-48 | MSCI World (23 developed markets, Israel among them, 1,249 stocks) and ACWI (adds 24 emerging markets, 2,414 stocks): about 85% coverage, free-float weights, reviews in February, May, August and November | MSCI factsheets 30.9.2026; GIMI pp.24, 100; summary p.3 |
| ETF-49 | MSCI gross versus net: the net version deducts the highest rate for a non-treaty investor (U.S. 30%, Israel 25%); Israeli funds track the net version in USD | MSCI Index Calculation Methodology pp.25, 33, 50-51; fund reports |
| ETF-50 | The world indices Israeli funds track are MSCI World and MSCI ACWI (net). Counts on the TASE ETF list (23/10/2026): ACWI 4, World 2 (all dollar-hedged), NASDAQ-100 8, S&P 500 8, TA-35 12, TA-90 11. Maya open funds: ACWI 13, World 13, and others. FTSE All-World: none | TASE ETF list, Maya open-fund list (Chrome, counted) |
| ETF-51 | The legal frame: definition of an unfunded swap; allowed only on an index of foreign securities, a commodity or a currency, with credit-risk conditions; exposure caps 200% / 110%; valuation; in-kind redemption deduction | Law s.64 (p.47); Reshumot gazette 8038 pp.5, 9-10, 13, 16; assets and options regulations (Wikisource) |
| ETF-52 | Per index: TA indices through the shares (Harel, Kesem), foreign indices mainly through unfunded swaps (IBI, MTF, Mor, Tachlit, Kesem, Harel) with banks in the "first credit-risk group" | ISA 2024 p.20, 2025 p.9; nine annual reports |
| ETF-53 | What a swap fund gets and pays: the net index return against spread and interest, interest earned on the cash kept aside, tax expenses near 0%; no swap cost published as a number; the variable fee takes part of any outperformance | IBI, Kesem, MTF, Mor reports; MSCI and Nasdaq |
| ETF-54 | Published one-year fund versus tracking-asset figures for seven swap funds and three physical funds, and the computed before-expense difference; no official comparison by method | Ten annual reports; ISA 2025 report |

ETF-11 got a dated note and a refined rule sentence. The ISA's 2024 report says foreign fund managers use **funded swaps or** the shares, not only the shares. The note also points to ETF-51 to ETF-54. The file's summary has one new bullet.

## Not found

- An official ISA or TASE comparison of tracking difference by replication method. The ISA's 2024 and 2025 fund reports were read in full (open question 25).
- Swap spreads or financing costs as numbers. They are not in the annual reports; the prospectuses or MAGNA financial statements may hold them (open question 22).
- Whether a counterparty passes any withholding saving to the fund (open question 28).
- The U.S. withholding rate on dividends paid to an Israeli exempt mutual fund that holds U.S. shares itself (open question 23; a pointer for `tax-securities-foreign.md`).
- The rate S&P uses in the S&P 500 net total return. The policies PDF opens only in Chrome's viewer and its text could not be extracted (open question 24, still open from question 19).
- The ISA directive on custody and credit risks (28.08.2018) that defines the "first credit-risk group" (open question 21).
- Whether "NNDX" in the Israeli reports is Nasdaq's XNDXNNR (open question 26).
- The TA-90 launch base: 299.89 in the guidelines against 100 on the index page (open question 27).
- No Israeli fund tracks FTSE All-World, so the FTSE methodology was not researched. Two open funds track an "S&P World" index; that index was not researched either.

## Proposed glossary lines (Hebrew, for `docs/glossary.md`; not edited)

| Term | Proposed line | Rule |
|---|---|---|
| ת״א 35 | מדד הדגל של הבורסה: שלושים וחמש המניות בעלות שווי השוק הגבוה ביותר שעומדות בתנאי הסף, עם תקרת משקל למניה בודדת; הדיבידנדים נכללים בו לפני מס. | ETF-44 |
| ת״א 90 | תשעים המניות הישראליות הגדולות ביותר אחרי מניות ת״א 35; יחד הם מרכיבים את ת״א 125. | ETF-45 |
| נאסד״ק 100 | מאה מהחברות הגדולות הנסחרות בבורסת נאסד״ק, בלי חברות פיננסיות, עם תקרות משקל לחברות הגדולות. | ETF-46 |
| MSCI World (מדד העולם) | מניות גדולות ובינוניות בעשרים ושלוש מדינות מפותחות, ובהן ארצות הברית וישראל, לפי שווי השוק הזמין לציבור. | ETF-48 |
| MSCI ACWI (מדד כל העולם) | מדד העולם בתוספת המניות הגדולות והבינוניות בשווקים המתעוררים. | ETF-48 |
| תשואה נטו (NTR) | גרסת מדד שמשקיעה מחדש את הדיבידנדים אחרי ניכוי מס במקור; לפיה נמדדות הקרנות הישראליות על מדדי חוץ. | ETF-47, ETF-49 |
| תשואה כוללת ברוטו | גרסת מדד שמשקיעה מחדש את הדיבידנד המלא, לפני מס; כך מחושבים מדדי הבורסה. | ETF-42, ETF-44 |
| עסקת החלף (סוואפ) לא ממומנת | חוזה שבו בנק משלם לקרן את תשואת המדד והקרן משלמת לו ריבית ומרווח, בלי שהקרן מחזיקה את המניות; מותר לקרן ישראלית רק על מדד זר, סחורה או מטבע. | ETF-51, ETF-53 |
| החזקה ישירה של המניות (שכפול פיזי) | הקרן קונה בעצמה את המניות שבמדד במשקלן; כך פועלות הקרנות הישראליות על מדדי הבורסה. | ETF-52 |

## Hand-offs

- `data/sources/publishers.json` has no entry for `indexes.nasdaqomx.com`, `msci.com` or `www-cdn.msci.com`. The sources of ETF-46 to ETF-49 therefore show the host as publisher, with no Hebrew name; the validator warns about this. The file belongs to another owner, so I did not add the entries.
- ETF-53 and ETF-54 are marked `institution`, while their strongest source is primary. The claims rest on the funds' reports. This is the same pattern as ETF-10, and the validator gives the existing warning.
- For R-funds and the engine: the tracking asset of every foreign-index fund read is the net version plus 100% of the dollar. Dollar-hedged ETFs report the hedge effect on its own line. The 12-month tracking difference that A-07 needs is published daily by each manager (ETF-07). The Harel reports point to `https://chart.bursagraph.co.il/funds.shtml?m=8`.
- Nothing was committed.
