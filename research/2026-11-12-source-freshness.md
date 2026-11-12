# Is every official text the rules cite still the current one? (2026-11-12)

The founder asked to check that each link the rules cite still shows the current version. Two things can go stale: the document at the same address changes (part A), or the document stays put while a later amendment, edition or circular takes its place (part B). This note covers the official documents the rules cite (`data/rules/*.json` sources of kind law, regulation, circular, regulator_page, official_pdf and exchange_rules: 363 addresses cited by 651 rules). Companies' own documents are out of scope. Everything below was read on 2026-11-12. The machine-readable list is in the session's scratch folder (`freshness-list.json`), and the scripts that produced it beside it.

Nothing here changes a rule: the owners decide. The tax specialist owns `tax-*.md`; the domain specialist owns the rest.

## Findings, ordered by what a reader could lose

### 1. A cited link now answers 404: the CMA Commissioner Report 2025, chapter 4 (KH-22, PEN-19, PF-39)

- The cited file, [Commissioner Report 2025 chapter 4](https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%204_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf), answers 404 to GET. The other chapters still answer 200.
- The report's page, [tender-0102](https://www.gov.il/he/pages/tender-0102), says "תאריך עדכון: 08.11.2026". It now links [chapter 4_ver3](https://www.gov.il/BlobFolder/reports/tender-0102/he/Commissioner%20Report%202025%20chapter%204_ver3_Digital%20-%20%D7%9E%D7%95%D7%A0%D7%92%D7%A9%20%D7%A1%D7%95%D7%A4%D7%99.pdf) (library 37f8713d63809bcc; old file 81b6c549047da41a).
- What changed: only the table on file p.10, the member counts by fund (Harel, Phoenix, total). For example the total row went from "177,269 5,562,844 … 14.9% 3.1%" to "184,741 5,570,316 … 19.8% 3.3%". Every other page has the same text.
- The quoted words are on the same pages of ver3: KH-22 p.7 "קופות גמל – למעט קרנות השתלמות שבהן אין דמי ניהול מהפקדה", PEN-19 p.12 "שיעור העודף או הגירעון האקטוארי בקרנות הפנסיה החדשות", PF-39 p.6 "שיעור דמי הניהול הממוצע מתוך הנכסים של הגופים המוסדיים".
- Domain specialist: point the three sources at the ver3 address, keeping their pages. No rule's words change.

### 2. A consolidated text that lacks a later amendment: Bank of Israel's fee rules, 159a.pdf (BANK-17, BRK-19; 10 rules cite the file)

- [159a.pdf](https://www.boi.org.il/media/mi2driua/159a.pdf) is BoI's consolidated text of the fee rules. The file is dated 19.02.2026, and its latest amendment notes are from התשפ"ה. It is still the file BoI's own [legislation page](https://www.boi.org.il/roles/supervisionregulation/legislation/) links.
- Not in it: [כללי הבנקאות (שירות ללקוח) (עמלות) (תיקון), התשפ"ו-2026, ק"ת 12431 pp.2246-2253](https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F12431%2Fheb) (17.6.2026; library f76b0f7643088e13).
  - Commencement, s.12(א): "ביום כ"ו בסיוון התשפ"ז (1 ביולי 2027)".
  - Exceptions in s.12(ב), in force since 1 October 2026: the deletion of item (10) in part 1, of item (6) in part 2, and of the words "טיפול בשטרות, טיפול בירושות ועיזבונות" in part 9.
  - None of the 10 rules cites those items: they cite s.1, s.2, s.4A, part 4, and pp.15-24.
- What it does from 1.7.2027:
  - It voids the definitions "מסלול", "מסלול בסיסי", "מסלול מורחב", "מסלול מורחב פלוס" and s.4A(א)-(ג), which BANK-17 rests on. BANK-17 already says so and carries recheck 2027-07-01; the order in the same gazette is cited in `bank-current-account-deposits.md`.
  - It adds to s.2(ג) "סעיף זה לא יחול על שירות ניהול חשבון תשלום" (p.2246, s.3(1)). BRK-19 says the direct-channel rule "חל על כל שירות בתעריפון". From 1.7.2027 that will not hold for the account-management service; it still holds for securities operations.
- Domain specialist: add the 2027 exception to BRK-19, with its date, or set a recheck date of 2027-07-01.

### 3. The link opens the wrong page (kind 2)

The words are in the document, but on a different page from the one the link opens.

- **TXP-14** (tax): source "Booklet 2026", page 6, quote "תקרת 'קיצבה מזכה' 9א(א)".
  - The words are on file p.12 of the [booklet](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), next to "9,430 לחודש". Nothing in the booklet's pp.5-7 matches.
  - The booklet prints double quotes ("קיצבה מזכה"), so the quote's single quotes will not land a text fragment either.
  - Tax specialist: page 12, quote as printed.
- **BRK-21** (domain): [151.pdf](https://www.boi.org.il/media/rvzi1ngd/151.pdf) (BoI consolidated disclosure rules), page 3. The words "עמלות על מכירת ניירות ערך" are on file p.4. Domain specialist: page 4.

### 4. Quotes that will not land on a web page, though the words are there (same kind as 3)

Seen while comparing the pages; another sweep owns fragments. Each quote uses the Hebrew gershayim (״) where the page prints a plain double quote ("):

- MF-61, [TASE bullet indices release](https://www.tase.co.il/he/content/news-lobby/20250318_pr): "תיק אג״ח" against the page's "תיק אג"ח".
- GOV-13, GOV-14, GOV-18, TXI-15, [gov.il government bonds page](https://www.gov.il/he/pages/govermental-bonds): "מאפייני אג״ח סחיר". The page title is "מאפייני אג"ח סחיר ולא סחיר".

## Part A: did the document at the cited address change?

Method:
- One request at a time with pauses, the way `tools/library.mjs recheck` compares: a PDF by its bytes, a web page by its extracted text.
- Only over the 363 official addresses the rules cite (the tool itself rechecks the whole library, 2,800 documents).
- Each difference was then read: the quoted words were checked on the page they cite, and the old and new texts were compared.
- The library's `checked` dates were not rewritten: that would only add merge noise.

| Result | Documents |
|---|---|
| Same bytes or same text as the stored copy | 318 |
| Bytes differ: 13 the same text in substance, 1 page with a new file list (finding 1), 1 an empty script shell to curl | 15 |
| No stored copy at that address before | 18 |
| Not fetched by curl (one of them the 404 of finding 1) | 12 |

The 13 differ only in form:
- Reshumot now serves ק"ת 6326, 6245 and 6283 wrapped in a multipart body. The PDF inside is byte-identical to the stored copy.
- Two Tax Authority rulings (secapp) are regenerated PDFs with identical text.
- The sec.gov filings differ only in HTML entities.
- ccpc.ie differs in one menu word; hly.gov.il in a byte-order mark.
- Five gov.il pages differ only in the site's new header and footer.
- Separately, the commissioner report page has a new file list (finding 1), and the Securities Authority's ETF list page returned an empty script shell to curl.

The 18 without a stored copy at the cited address:
- They were fetched, their quotes were checked (TXP-14 and BRK-21 above; every other quote was found) and they were filed in the library.
- Most were already there under a local path, among them the 2026 deductions booklet (de6fee7208bdde4e, "מעודכן לאפריל 2026"; the file is dated 15.04.2026, before the rules read it).
- Two Securities Authority pages (`mutualfundsActivities`, `takanon2`) return an empty script shell to curl and were not filed.

The 12 not fetched by curl:
- The commissioner report chapter (resolved, finding 1).
- Eight Bank of Israel pages behind a Radware check.
- One National Insurance page (b2b), one TASE page, one tazkirim page.
- Before the instruction to stop passing bot checks, these 11 and the three Securities Authority pages that curl gets as an empty shell were rendered in the repository's Chromium (the BoI pages passed the check there). None showed a change against a quote: most of these sources carry no quote, and the TASE and tazkirim quotes were found.
- ETF-79's source is the Securities Authority's five-page list of foreign ETFs. It is a dated negative claim (no target-maturity fund in the list), and only page 1 was rendered: not rechecked.

## Part B: is something newer than what the rule read?

### The Income Tax Ordinance (114 rules cite the Tax Authority's consolidated text)

- The Tax Authority's [page](https://www.gov.il/he/pages/law_pkudat_mas_hachnasa) gives "תאריך פרסום: 15.01.2023" and says: "נוסח החוק המעודכן ביותר נמצא באתר הרשומות במשרד המשפטים". Reshumot publishes gazettes, not a consolidated text, so no newer official consolidated Ordinance exists. The rule base already says so (the file is "of 15.1.2023, amendments to No. 262; later amendments cited from Sefer HaChukim in each rule").
- The Knesset's records ([KNS_LawBinding](https://knesset.gov.il/OdataV4/ParliamentInfo/KNS_LawBinding) for law 2000944, with KNS_Bill and KNS_DocumentBill) list 23 laws that amended the Ordinance after 15.01.2023, the latest ס"ח 3531 of 8.6.2026. The Knesset gives the Ordinance's latest publication date as 2026-06-08.
- The rule base cites ס"ח 3045, 3262, 3336, 3342, 3343, 3509 and 3511.
- Of the rest, eight texts were read for the sections they amend:
  - Amendment 263 (ס"ח 3018): s.141A, money changers.
  - Amendment 272 (ס"ח 3205): ss.14, 75P1, 75P2, 131, 135, 135B, 214C.
  - Amendment 273 (ס"ח 3262, already cited).
  - Amendment 275 (ס"ח 3336, already cited): s.9A(ז) to 57%, 57.5% and 62.5%; TXP-14 cites it.
  - Amendment 283 (ס"ח 3461): s.39B, a credit for combat reserve duty.
  - Amendment 285 (ס"ח 3509, already cited): ss.64A2, 64A3, 64A7A.
  - The 2025 budget law (ס"ח 3384), amendments 278-282: s.9(2א)(1), ss.103-103ג, 32, 235, and a temporary s.247.
  - The settlements law (ס"ח 3514): s.11.
- None of these sections is one that a rule quotes from the 2023 file. The sections the rules quote are ss.1, 2, 3, 8, 9 (paras 2, 7א, 13, 16א, 16ב, 18), 9A, 17, 45, 47, 64A5, 67, 75B, 75C, 87, 88, 91-93, 97, 101, 120-121B, 125-125C, 129, 164, 199-208, 240, 245.
- The remaining laws were judged by title only: credit points for parents (3039, 3048, 3184), hostages' families (3105), recuperation pay (3180), water corporations (3052), high-tech (3071), privacy (3287), multinational minimum tax (3476), and settlement benefits (3515, 3531).
- New documents filed: amendments 263, 272, 283, 285, the 2025 budget law and the settlements law.
- A lead for the tax specialist: [צו ההתייעלות הכלכלית … (תחילתו של סעיף 135(1)(א1) לפקודת מס הכנסה), התשפ"ו-2026](https://api.justice.gov.il/reshumot/resolver?path=akn%2Fil%2FofficialGazette%2FgeneralSL%2F12523%2Fheb), ק"ת 12523 p.2616, 6.9.2026. It sets the start of an online-filing provision. It was not read, and no rule cites s.135(1)(א1).

### The other most-cited documents

| Document (rules) | What is newer, or what was looked at |
|---|---|
| Tax Authority guide 2025 (62) | Nothing newer. The [guide page](https://www.gov.il/he/pages/income-tax-guide-knowyourright) ("תאריך עדכון: 05.07.2026") lists the 2025 and 2024 guides; `Guides_IncomeTax_da-2026.pdf` answers 404. |
| Deductions booklet 2026 (32) | Nothing newer. The [page](https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet) ("תאריך עדכון: 15.04.2026") links the same 2026 file, "מעודכן לאפריל 2026". |
| Securities Authority consolidated trust law, Hashka01.pdf (29) | Current today: the file was modified 31.08.2026 and carries the י"פ 14122 amounts. The [2026 capital-market law](https://fs.knesset.gov.il/25/law/25_lsr_14375739.pdf) (ס"ח 3579, 2.8.2026) amends the trust law in its s.3, which "תחילתו … שישה חודשים מיום פרסומו" (p.1076), so from 2.2.2027. MF-11, MF-16 and ETF-22 already cite it. |
| Gazette regulations in the top 40: the transfer regulations 2008 and their 2014 and 2020 amendments; ק"ת 6449, 6332, 7076, 7727; the management-fee, IRA and trust-asset regulations; the capital-gain calculation regulations; the state-loan regulations (13 documents, 8 to 26 rules each) | No amendment found in the Reshumot index, 1.1.2025 to 12.11.2026 ([portfolio search](https://reshumot.justice.gov.il/), Kovetz HaTakanot, Sefer HaChukim and the tax series, 1,728 entries, matched by name). |
| National Insurance Law amendments cited for child savings (7 and 2) | Amendments 262 (ס"ח 3501, an exemption for new immigrants) and 265 (ס"ח 3523, reimbursing employers for reserve duty) were read; neither touches child savings. |
| CMA circulars 2016-3-4 and its appendix B (12 and 22), 2017-9-17 (17), 2022-9-30 (13), 2020-9-22 (10) | No amending final circular in the CMA's [regulation list](https://www.gov.il/he/Departments/DynamicCollectors/regulation-legislation) from 26.4.2026 to 7.11.2026. The 2016-3-4 item page lists the same four files and is "עודכן לאחרונה בתאריך 01.11.2026". The newer items that touch the rule base (customer service 2026-9-5, pension clearing 2026-10-6) are already cited. The draft of 28.10.2026, "תיקון חוזר הנהגת תכניות ביטוח ותקנון קופת גמל", is a draft. |
| BoI directives 417, 420, 447, 447A, 448 and the consolidated 150, 151, 159a | The same addresses appear on BoI's [directives list](https://www.boi.org.il/roles/supervisionregulation/nbt/) and [legislation list](https://www.boi.org.il/roles/supervisionregulation/legislation/). 151 (disclosure rules): no amendment after ק"ת 7469 (2014) in the Knesset's records, and none in Reshumot for 2025-2026. 150 (the Banking (Customer Service) Law): amendments 38 and 39 (2025) are cited in the rule base. 159a: finding 2. The transfer-between-banks rules were amended on 17.9.2026 (ק"ת 12530), which the rule base cites; directive 448 itself has no newer version on the list. |
| TASE rule guides 274690 ("מעודכן עד 1.1.2026", 8 rules) and 274765-1 ("עד 4.8.2026", 9 rules) | Unchanged at their addresses. The [rules page](https://www.tase.co.il/he/content/about/tase_regulations/) renders without its list of documents, so a newer edition at a new address could not be ruled out. |
| Tax circular 10/2025; Securities Authority investor guide 2017; the Securities Authority's fund reports for 2025 and 2024; the National Insurance 2025 report; the CMA standard provident bylaws | Not looked at for a newer version (time). |

Across all 195 cited laws and regulations, 30 have a Reshumot entry since 2025 matching their name. Every one is either already cited in the rule base or is one of the cases above.

## Where this stopped

- Part A covered all 363 official addresses.
- Part B covered:
  - the 40 most-cited documents, except the five in the table's last row;
  - a name match of every cited law and regulation against Reshumot from 2025;
  - the CMA's list since April 2026.
- Not done in part B: the non-legislative documents cited by `likely_to_change` rules outside the top 40 (about 150 regulator pages, PDFs and circulars).
- No rule has a recheck date that has passed: the earliest is GOV-23, 2026-11-15.
