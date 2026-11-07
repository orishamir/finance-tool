# What a track holds, by asset class: official sources (2026-11-07)

The question: does any official source publish, for each investment track of a provident fund, study fund, provident fund for investing and pension fund, what the track holds split by asset class, so the site could show what a "אשראי ואג"ח" track really holds and compare the debt side across every house (D30)?

**Short answer: yes.** The Capital Market Authority publishes it itself, monthly and per track, for every track it lists, in the XML download of Gemel-Net and of Pensia-Net. It is not on data.gov.il. Neither site states terms of use; Pensia-Net's footer says "כל הזכויות שמורות לרשות שוק ההון 2015". So the source is clear, but the right to republish it has not been confirmed (see section 5).

Everything below was read on 2026-11-07. Nothing was collected into `data/`, and no adapter was built.

## 1. data.gov.il (the CMA's datasets)

Read through the CKAN API (`package_search?fq=organization:cma`, `datastore_search` on each live resource). The CMA organisation has 9 datasets. Library: `89b90218b364faee`.

| Dataset | What it has per track | Asset-class split? | Updated |
|---|---|---|---|
| `gemelnet` (resource 2024-today `a30dcbea-…`, 23,800 rows) | FUND_ID … TOTAL_ASSETS, LIQUID_ASSETS_PERCENT, STOCK_MARKET_EXPOSURE, FOREIGN_EXPOSURE, FOREIGN_CURRENCY_EXPOSURE, fees, yields, risk measures (33 fields) | **No** | daily job, monthly data (latest REPORT_PERIOD 202609) |
| `pensia-net` (resource `6d47d6b5-…`, 9,309 rows) | the same fields plus ACTUARIAL_ADJUSTMENT and parent company | **No** | as above |
| `insurance` (Bituach-Net, `c6c62cc7-…`) | the same structure for policies | **No** | as above |
| `transfer_bank` | transfer details (bank account, contact) per track | No | daily |
| `nechasimg` (provident funds), `nechasimp` (pension funds), `nechasimb` (insurers' participating portfolios), `mishtatef` (institutions) | asset lists at the level of the single security, by investment track | Could be computed, but **stale** | latest files dated 31.12.2017 (nechasimg) and 30.09.2017 (nechasimp, nechasimb); `mishtatef` holds 2009 and 2010 only. Metadata last modified 2023-03-21, Frequency "NA", no licence shown. Their own description: "הנתונים המפורסמים נאספו על ידי גורם שלישי לשם פרסומם, ולא נבדקו על ידי רשות שוק ההון" |
| `serviceindex` | insurers' service index 2014 to 2016 | n/a | stale |

A search across all of data.gov.il for נכסים, גמל, פנסיה and השתלמות finds no other relevant dataset.

So **data.gov.il has no current per-track asset-class split.** It has the three exposures the site already collects, plus FOREIGN_EXPOSURE and LIQUID_ASSETS_PERCENT, which `data/cma/gemelnet@2026-09.json` already keeps unread in `raw_fields`. The open licence (data.gov.il terms, "Other (Open)" on `gemelnet` and `pensia-net`) covers only what is in these datasets.

## 2. Gemel-Net: the XML download (the source to collect)

**Where.** The page `https://gemelnet.cma.gov.il/views/gemelTsuot.aspx` has a button that opens the dialog `Views/horadatXML.aspx` ("הורדת קבצי XML"; library `97597b83160163f3`). The dialog offers two groups of reports:

- **כללי:** נתונים כלליים (`sug=1`), תשואות ויתרות לתקופה (`sug=3`);
- **נכסים, one month only:** פירוט מלא (`sug=4`), סיכום לקבוצות ראשיות (`sug=5`), סיכום לפי סחיר/לא סחיר (`sug=2`).

The dialog builds a plain GET link:

```
https://gemelnet.cma.gov.il/tsuot/ui/tsuotHodXML.aspx?miTkfDivuach=YYYYMM&adTkfDivuach=YYYYMM&kupot=<track numbers, comma-separated>&Dochot=1&sug=<1|2|3|4|5>
```

It needs no login, no cookie and no script. The `kupot` numbers are the same FUND_ID the site already uses. The answer is UTF-8 XML, and every file says "₪ כל הסכומים באלפי" (amounts in thousands of shekels).

**Coverage.** Gemel-Net covers every fund_classification in the `gemelnet` dataset: תגמולים ואישית לפיצויים, קרנות השתלמות, קופת גמל להשקעה, the child-savings track, central severance funds, and the others. One request for all 61 collected tracks whose sub-specialisation is אשראי ואג"ח (24 study funds, 23 provident funds for investing, 12 provident funds, 2 central severance funds) returned all 61: 976 rows, and each track's 9 groups add up to 100 ± 0.02. One request for all 573 collected tracks makes the URL too long (the server answers with a 302 to `maintenance.gov.il`), so a collector would send the numbers in batches. Months back to at least 2010-01 answer; 2026-10 answers empty, so the latest month is 202609, the same as the dataset.

**Fields per report.**

- `sug=5`, סיכום לקבוצות ראשיות: per track and month, `ID_KUPA, TKF_DIVUACH, KVUTZAT_NECHASIM, ID_SUG_NECHES_KVUTZA, ID_SUG_NECHES, SHM_SUG_NECHES, SCHUM_SUG_NECHES, ACHUZ_SUG_NECHES`, in four splits:
  - "חלוקת נכסים ל-9 קבוצות ראשיות" (codes 4701 to 4710): אג"ח ממשלתיות סחירות; אג"ח קונצרני סחיר ותעודות סל אג"חיות; אג"ח קונצרניות לא סחירות; מניות, אופציות ותעודות סל מנייתיות; פיקדונות; הלוואות; מזומנים ושווי מזומנים; קרנות נאמנות; נכסים אחרים.
  - "לפי סחירים/לא סחירים" (4721, 4722).
  - "לפי בארץ / חוץ לארץ" (4731, 4732).
  - "חשיפות" (4751 shares, 4752 abroad, 4761 foreign currency). These equal the dataset's three exposure fields: for track 117, 57,047.96 thousand against STOCK_MARKET_EXPOSURE 57.05 million.
- `sug=2`, סחיר/לא סחיר: 14 lines per track. Tradable: government bonds, cash, corporate bonds, shares, foreign shares, warrants and derivatives, mutual funds. Non-tradable: designated bonds, deposit with the Accountant General, loans and mortgage portfolios, real estate, corporate bonds, shares, other.
- `sug=4`, פירוט מלא: about 90 lines per track (`ID_NATUN, SHM_NATUN, ERECH_NATUN, ACHUZ`), one per reporting item of the monthly asset report. Corporate bonds and loans come split **by rating band**: AA- and above; A to BBB; below BBB or unrated. They are also split by tradable or not, linkage (CPI, unlinked, foreign currency), and Israel or abroad. This is what would let the site compare the debt side across houses by credit quality, not only by size.
- `sug=1`, נתונים כלליים: the general record (name, company, specialisations, assets, fees, yields, YAHAS_NEZILUT), the same as the dataset.

**What the figures rest on.** Circular 2015-9-9, "דוח חודשי לגבי קופות גמל, קרנות פנסיה וחברות ביטוח" (26.2.2015; library `9f06f786194f7bee`). Section 3 requires a monthly "דוח נכסים" from each provident fund and from each pension-fund track. Section 4.2 sets how its items are classified. The circular regulates reporting to the Commissioner. The publication itself is the Authority's own act on Gemel-Net: its "מקורות המידע" page (`dafMakdim_Link3.aspx`) says the system is built on the data the funds report every month, and `dafMakdim_Link1.aspx` says the 12-month window by fund shows "אופן חלוקת הנכסים בה". I found no published table of how the detailed items roll up into the 9 groups.

**Sample: כלל תמר אשראי ואג"ח (Gemel-Net track 117, כלל פנסיה וגמל בע"מ, provident fund, 202609, total 956,266 thousand ₪).** Read from `sug=5` (library `c929a66aa0a2dade`), with the percentages as printed:

| Group (source's words) | Thousand ₪ | % |
|---|---|---|
| אג"ח ממשלתיות סחירות | 313,070.72 | 32.74 |
| אג"ח קונצרני סחיר ותעודות סל אג"חיות | 306,640.45 | 32.07 |
| אג"ח קונצרניות לא סחירות | 11,240.71 | 1.18 |
| מניות, אופציות ותעודות סל מנייתיות | 48,443.00 | 5.07 |
| פיקדונות | 23,177.96 | 2.42 |
| הלוואות | 97,393.22 | 10.18 |
| מזומנים ושווי מזומנים | 23,124.42 | 2.42 |
| קרנות נאמנות | 38,169.76 | 3.99 |
| נכסים אחרים | 95,006.31 | 9.94 |
| נכסים סחירים ונזילים / נכסים לא סחירים | 722,330.70 / 233,935.86 | 75.54 / 24.46 |
| נכסים בארץ / נכסים בחו"ל ובמט"ח | 716,175.34 / 240,091.21 | 74.89 / 25.11 |
| חשיפה למניות / לחו"ל / למט"ח | 57,047.96 / 236,081.99 / 59,971.49 | 5.97 / 24.69 / 6.27 |

From `sug=4` for the same track and month (library `8fa65692c67ac4e7`), some debt lines as printed:

- tradable corporate bonds rated AA- and above: CPI-linked 13.297%, unlinked 4.871%;
- rated AA- to BBB- (AA- itself excluded): CPI-linked 2.424%, unlinked 3.106%;
- below BBB- or unrated: CPI-linked 0.544%, unlinked 1.034%;
- loans secured by other collateral: rated AA and above 2.773%, A+ to BBB- 2.946%, below BBB- 2.511%; loans to members 0.882%.

*Inference, not printed:* adding the `sug=4` lines shows that "נכסים אחרים" for this track is mostly investment, hedge and real-estate funds in Israel and abroad, with 6.027% in "קרנות השקעה אחרות בחו"ל" alone, plus structured products. A credit track's "other" can therefore be sizeable and is not cash.

## 3. Pensia-Net: the XML download

**Where.** `https://pensyanet.cma.gov.il/Parameters/Index` has a button, "הורדת קובץ XML" (library `37126c10a13aef64`). Its choices:

- level: נתוני קרנות or נתוני מסלולים;
- כללי: נתונים כלליים, תשואות ויתרות לתקופה, מסלולי השקעות;
- נכסים, one month only: פירוט מלא, סיכום לקבוצות ראשיות, סיכום לפי סחיר / לא סחיר.

The download is a form POST to `/Parameters/ExportToXML` carrying the page's view model as JSON. A hand-built POST got a 404 page. The same download through a browser (headless Chromium driving the page's own controls) works and returns `PensiaNet.xml`. A collector would have to send the page's own view model, or drive the page.

**Coverage.** The choice "כל הקרנות והמסלולים" with level נתוני מסלולים and סיכום לקבוצות ראשיות returned **all 293 tracks** (6,151 rows) in one file for 202609. That is the regulator's full pension list; the site keeps 270 of them.

**Fields.** `ID_KRN, SHM_KRN, TKF_DIVUACH, KVUTZAT_NECHASIM, ID_SUG_NECHES_KVUTZA, ID_SUG_NECHES, SHM_SUG_NECHES, SCHUM_SUG_NECHES, ACHUZ_SUG_NECHES, ID_MASLUL_RISHUY`. `ID_MASLUL_RISHUY` is the track number the site uses (9648). `ID_KRN` (170) is an internal fund number. Pension has **10** main groups: the 9 above plus 4712, "אג"ח מיועדות". It also has a fifth split, "חלוקת נכסים לפי רמת סיכון" (4741 to 4744).

**Sample: כלל פנסיה אשראי ואג"ח (Pensia-Net track 9648, new comprehensive pension, 202609).** Read from the main-groups report (library `90de0b635d193e35`):

| Group (source's words) | Thousand ₪ | % |
|---|---|---|
| אג"ח ממשלתיות סחירות | 21,590.46 | 6.21 |
| אג"ח קונצרני סחיר ותעודות סל אג"חיות | 154,097.49 | 44.31 |
| אג"ח קונצרניות לא סחירות | 2,431.87 | 0.70 |
| מניות- אופציות ותעודות סל מנייתיות | 16,125.76 | 4.64 |
| פיקדונות | 1,373.20 | 0.39 |
| הלוואות | 14,792.46 | 4.25 |
| מזומנים ושווי מזומנים | 8,518.88 | 2.45 |
| קרנות נאמנות | 15,619.81 | 4.49 |
| נכסים אחרים | 15,330.30 | 4.41 |
| אג"ח מיועדות | 97,888.29 | 28.15 |
| רמת סיכון: מזומנים ואג"ח ממשלתיות | 127,997.62 | 36.81 |
| רמת סיכון: אג"ח, הלוואות ופקדונות עם בטוחה מספקת או מדורגות לפחות BBB ותעודות סל אג"חיות | 163,947.86 | 47.14 |
| רמת סיכון: מניות, קרנות נאמנות ותעודות סל מנייתיות | 19,270.34 | 5.54 |
| רמת סיכון: השקעות ללא בטוחה מספקת או מדורגות פחות מ-BBB | 36,552.71 | 10.51 |

Domestic plus abroad add up to 347,768.52 thousand, which equals the dataset's TOTAL_ASSETS of 347.77 million.

## 4. Each institution's asset list at the single-asset level

**The duty.** The consolidated code, part 5, section 4, chapter 3, appendix A, edition 10 of 26.3.2020 (library `4ba39a40606c37fd`), section 5.2, page 8 (PDF page), sets these rules for a managing company of provident funds:

- **"רשימת נכסים ברמת נכס בודד – public"** goes on the managing company's own website within 7 calendar days of 31 May (Q1), 31 August (Q2), 30 November (Q3) and 31 March of the next year (annual).
- It is also filed through the Otot portal, and is due to the Commissioner within 30 days of each quarter.
- The template is part ג of annex 5.4.3.2. The source circular is 2015-9-14.
- Footnote 3 says the monthly reports and the single-asset lists are reviewed once a quarter by the auditor.

Section 4.2 (quarterly reports of a pension fund) holds the same two rows for pension funds, on pages 3 and 4 of the same appendix (PDF pages). I did not find a newer edition of the chapter, nor the current text of annex 5.4.3.2 part ג (logged in `tried.jsonl`).

**What a file looks like.** I read one sample: Altshuler Shaham's `513173393_gm_p_0226.xlsx` (Q2 2026, provident funds, 4.7 MB; library `2bf497043ebdc5a9`; page `b78f79ccd1754ec8`). Its opening sheet reads "קובץ דיווח עבור רשימת נכסים ברמת הנכס הבודד (חוזר גופים מוסדיים 2015-9-14)". It has 31 sheets, one per asset kind, from מזומנים ושווי מזומנים and איגרות חוב ממשלתיות to הלוואות, פיקדונות מעל 3 חודשים and נכסים אחרים. Every row carries "מספר קופה" and "מספר מסלול" and, for bonds, rating, rater, linkage, duration and yield. The summary sheet "סכום נכסים" is for the company's whole provident-fund book, not per track.

**Could a per-track split be computed from these for every collected institution?** In principle yes: group each sheet's rows by track number. In practice it is the weaker route:

- each of the 16 managing companies the site collects publishes on its own site, in its own page layout (Meitav's page answered 404 to scripts);
- the files come quarterly, about two months after the quarter;
- they are large, and some are marked "לממונה";
- the roll-up into asset classes would be the site's own computation;
- each file falls under that company's site terms.

It adds security-level detail that the site does not need for this question.

## 5. Terms

| Source | Terms found | Republishing confirmed? |
|---|---|---|
| data.gov.il CMA datasets | data.gov.il terms (copying, redistribution and derived works allowed; read 2026-10-22, data-landscape §1); `gemelnet` and `pensia-net` "Other (Open)" | Yes, but these datasets **lack** the asset split |
| Gemel-Net XML | none: no terms page, no rights notice; `robots.txt` redirects to maintenance.gov.il | **No** |
| Pensia-Net XML | footer "כל הזכויות שמורות לרשות שוק ההון 2015"; no terms page | **No** |
| gov.il general terms | answer 403 to scripts (`unreachable.jsonl` already records `gov_terms_of_use`); not read; unclear whether they govern the `cma.gov.il` hosts | Unknown |
| Each company's asset list | each company's site terms (not read) | Not checked |
| data.gov.il asset-list datasets (2009 to 2017) | no licence shown on the dataset | Stale anyway |

Under the rule that the repository holds no data whose terms forbid or have not confirmed republishing, the Gemel-Net and Pensia-Net asset splits **cannot be collected until the Authority confirms**, as with the Bank of Israel series (D20). Two ways to settle it, both for the founder: ask the Authority whether the Gemel-Net and Pensia-Net XML asset reports may be republished with attribution; or ask it to add them to its open datasets on data.gov.il, where the open licence would cover them.

## 6. Recommendation

**Collect one source, the Authority's own Gemel-Net and Pensia-Net XML asset reports, once the Authority confirms they may be republished:**

- start with "סיכום לקבוצות ראשיות" (9 groups for provident funds, study funds and provident funds for investing; 10 for pension funds), monthly, per track, for every collected track;
- add "פירוט מלא" to compare the debt side across every house by rating band (AA- and above, A to BBB, below BBB or unrated) and by tradable or not.

It is general under D30: the regulator's figures, every listed track, one definition for all. It refreshes on the same month as the dataset the site already reads, and it agrees with that dataset's exposures and totals. Not data.gov.il, which lacks the split. Not the companies' single-asset lists, which are quarterly, company by company, and need the site's own roll-up.

What would have to come first, all outside this task:

- the founder's question to the Authority on terms;
- a schema decision: `holdings` in `docs/data-schema.md` 3.13 holds only the three exposures today, so a new block would need the schema first;
- a method note on how the site names and orders the groups, given that the Authority publishes no definition of its 9 groups.

## 7. Doubts and things not checked

- **No definition of the groups.** I found no published mapping from the detailed items to the 9 or 10 groups. For example, mutual funds of corporate bonds (3.314% for track 117) seem to sit under "קרנות נאמנות", not the bond groups, and bond ETFs sit with tradable corporate bonds. That is inferred from the sums, not stated.
- **Pension tradable/non-tradable split.** For track 9648, "סחירים/לא סחירים" covers 300,466.34 thousand out of a 347,768.52 total; its 71.07 / 28.93 are percentages of that smaller sum. The gap (47,302) is not explained on the page. For Gemel-Net track 117 the two parts add up to the total.
- **Bulk download not tested in full.** The Gemel-Net request was tested for 61 tracks, not all 573. The Pensia-Net bulk download works only through the page's own form.
- **Not looked at:** Bituach-Net (savings policies), beyond its data.gov.il fields; the `Dochot` values 2 to 5 of Gemel-Net (by company, fund type or controller), which might return many tracks in one request.
- **Library store.** The worktree's `research/library/store/` is its own folder, not main's, so the files filed here sit in the worktree's store. The index lines are in git; the files need copying to main's store at merge, or filing again there.

## 8. For the lead: rule base and docs that are out of date

- `tracks-catalogue-and-decoder.md` line 665 ("Track-level holdings (asset lists): the CMA holdings datasets stopped in 2023 … Not re-checked"). Corrections:
  - those datasets' last files are dated 31.12.2017; 2023-03-21 is only a metadata date;
  - the Authority does publish a per-track asset split, monthly, in the Gemel-Net and Pensia-Net XML downloads;
  - each managing company must publish the single-asset list quarterly on its website (consolidated code 5-4-3 appendix A, ed. 10, section 4.2 for pension funds and section 5.2, p.8, for provident funds).
  - This belongs to the domain specialist.
- `research/discovery/data-landscape.md` row "Gemel-Net … Same data as the dataset above; scraping not needed" is wrong for assets: Gemel-Net offers asset reports the dataset lacks. Row 55 (nechasim*) should say the files end in 2017.
- `docs/data-inventory.md` row 7 is correct as it stands. No change unless the source is collected.
