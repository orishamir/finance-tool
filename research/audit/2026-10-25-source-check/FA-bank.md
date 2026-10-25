# FA-bank: source check of 2026-10-25

Family agent for the brokerage account, the track catalogue and decoder, bank accounts and deposits, and bank product
names. Scope: only rule blocks that have a record in `data/rules/`.

## brokerage-account.md (BRK), 28 records

All 28 Source lines were rewritten. Every source on them was opened today and set to `checked 2026-10-25`.

Counted by kind:

- **Copy replaced: 3.** The Nevo copy of the Securities Law (BRK-01, BRK-06, BRK-15) became the official Amendment 63
  gazette PDF, `חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017` (ספר החוקים 2633, fs.knesset.gov.il/20/law/20_lsr_382526.pdf):
  s.49א on file page 10 (the map said p.11; the text of 49א(א) and (ב) is on p.10), ss.45טז and 45יז on file page 9.
  The basis is the 2017 wording. Whether a later amendment changed s.49א was not checked against the Knesset database.
- **Edition moved: 6 rules.**
  - BRK-07, BRK-08: the 2018 ISA approval of the TASE rule change (mayafiles E1149190.pdf) moved to TASE's current
    consolidated "מדריך לחברי הבורסה" (updated to 1.1.2026, update no. 107), linked from tase.co.il/he/content/about/tase_regulations:
    part one of the rules (274690.pdf) pp.34 to 35, ss.25 to 26; the guidelines (274691.pdf) pp.95 to 102, s.26, and
    s.26ה on p.98. The same wording is in the current text. The note on BRK-07 saying the consolidated rules could not
    be read (TASE site blocked) was removed: the guide opens in Chrome and by curl. The rule's open question 3 (later
    amendments) can be closed against this guide.
  - BRK-16, BRK-17, BRK-18, BRK-19: the fees rules PDF `boi.org.il/media/w2lgmymp/159a.pdf` (consolidated to 5.11.2024)
    moved to the file the BoI legislation page links today, `boi.org.il/media/mi2driua/159a.pdf` (consolidated to the
    amendment of 9.4.2025, file dated 19.2.2026). The cited pages hold the same text (pp.3, 4, 15 to 18).
- **Page fixed or added: 7.** BRK-10 (Leumi terms pp.12 to 13), BRK-21 (disclosure rules pp.3 to 4), BRK-17 (2012
  amendment p.2), BRK-25 (IBI p.2, Excellence p.1), BRK-28 (Leumi pp.12 to 17 and 48), BRK-16 (locator reordered so
  the page reaches the record: the old locator lost it after the English word "first"), BRK-07 and BRK-08 (above).
- **Verified unchanged: all the rest**: TASE periodic report 2025 citations (pp.20 to 25, 75 to 79: every point is on
  the cited file page), TASE NBCM and foreign-bank member guides (January 2026), BoI disclosure rules 151.pdf (still the
  file BoI links), BoI 2008 activity summary p.3, Leumi general terms 08.25 (pp.13, 55), the IBI, Excellence,
  Altshuler Shaham and Psagot tariffs, the Fair tariff and home page, the Meitav Trade pages (NIS 5,000 and NIS 10,000
  both still on the page), Interactive Israel pages, Bank Yahav's permit page, IB Ireland's client-protection page,
  the TASE member list, fee calculator, terms of use (August 2026 edition) and the four data-services pages, One Zero's
  tariff page (403 to scripts; opened in Chrome, it still links the 26.7.26 full tariff, and that PDF opens).
- **Strength words split per link: 4** (BRK-24, BRK-25, BRK-28, BRK-39 had one trailing word for a run of links).
- **Link titles put in Hebrew: 14** (Yahav, the 2012 fees amendment, Meitav, Fair, One Zero, the TASE pages,
  Interactive Israel, IB Ireland), so the site shows a title instead of falling back.
- **Figure sources: 3 replaced, 4 re-checked.** BRK-12 clearing_members now names the file page (p.22, 1.7.3.1);
  BRK-18 closing_transfer_cap moved to the current fees rules file, p.17, note (2); BRK-21 notice_days names p.3,
  s.5(א)(1). The four BRK-39 price figures match the price list today (1,008 / 2,016 / 797.5 / 797.5).

Copies kept: none.

Figures that differ: none.

For the founder or the lead:

- **Title hijack (request filed):** the One Zero full tariff link ("תעריפון העמלות המלא, מהדורה מיום 26.7.26") gets the title
  of Leumi's full tariff from the documents.json row `leumi-full-tariff-2026` (token "תעריפון העמלות המלא"). A row
  `onezero-full-tariff-2026` with a longer token is in `requests/FA-bank.json`.
- **Rule text, not changed:** BRK-07 quotes "חש"ב יחזיק את הנכסים הפיננסיים של לקוחותיו"; both the 2018 text and the
  current guide spell it "הנכסים הפיננסים" (one yod). The quote is in the rule text, so it is reported, not fixed.

## tracks-catalogue-and-decoder.md (CAT), 18 records

All 18 Source lines were rewritten; every source on them was opened today and set to `checked 2026-10-25`.

- **Edition moved: 1.** CAT-37: circular 2018-9-26 (consolidated 2017-9-22) moved to the in-force edition
  `חוזר גופים מוסדיים 2020-9-22 – דוח שנתי ודוח רבעוני לעמיתים ולמבוטחים בגוף מוסדי – תיקון`. Every quoted definition is on
  the new file's pages 39 (balloon note), 108 (provident detailed report), 128 (pension), 132 (purpose) and 149 to 151
  (quarterly report). The 2025 draft amendment (notice_2025_51) is not in force.
- **Link-less mentions turned into links: 5.** "dictionaries (CAT-02) rows ..." on CAT-06 and CAT-09 now link the
  Gemel-Net and Pension-Net field dictionaries (rows 18 to 19 are the two average-fee fields; FUND_ID, PARENT_COMPANY_ID
  checked). "Gemel-Net 202609 (CAT-25)" on CAT-24 now links the datastore row of track 15349 for 202609 (equity
  874.08 of 885.92, foreign 10.24: the 98.7% and 1.2% in the rule). "Reports as in CAT-35" on CAT-36 and CAT-39 now
  carry the Gemel-Net and Pensia-Net report links.
- **Page fixed or added: 9.** CMA circular 2022-9-30 (12 pages): CAT-09 appendix form footnote 1 on p.10; CAT-15
  definition on p.3, ss.9 to 11 on p.7; CAT-17 and CAT-24 s.2 pp.2 to 3; CAT-16 p.7, CAT-18 pp.4 to 6, CAT-19 p.4,
  CAT-20 p.6 (verified, unchanged). CAT-38: circular 2015-9-9 pp.9, 15, 20; draft file structures p.16 and p.4;
  circular 2013-2-1 p.1. CAT-36: circulars 2002/11 pp.1 to 2 and 2003/13 pp.1 to 2. CAT-23: Meitav notices p.1.
- **Verified unchanged:** circular 2022-9-30 is still the current edition of the tracks circular (R-prov map); the
  gov.il collector still lists circular 2015-9-9 as the monthly-report circular (its report files updated
  12.12.2019); the CMA draft 2020-253 p.14; the 11 data.gov.il datastore links (all return `success: true`; 7978 in
  202609 holds 0.61 / 0); Gemel-Net and Pensia-Net portal pages and the Pensia-Net concepts page; the Meitav tracks page
  (label "דמי ניהול ממוצעים מצבירה בשנה קודמת"), Meitav merger notice 7981 (pp.1, 3), merger summary (8 pages), notices
  7980 and 7861, Meitav's flexible-index notice and Harel's reform page; Maya's fund list (total 2,009 today, as on
  2026-10-24); TASE terms of use (August 2026 edition).
- **Strength words split per link: 14 lines** (the old lines ended with "primary, institution" or "primary,
  institution, computed" for a whole run of links).
- **Link titles put in Hebrew: 25** (data.gov.il queries, Meitav and Harel documents, circulars).
- **Figure sources: 2 replaced, 1 re-checked, 21 left as they were.** CAT-19 age_band_1 and age_band_2 now name the
  circular by its own title, p.4, s.4(א) (50 and 60 are on that page). CAT-42 funds_total (2,009) re-read today. The
  other 21 CAT-42 counts are a dated snapshot read through Maya's filters on 2026-10-24; they were not re-counted
  filter by filter today, so their checked date stays 2026-10-24.

Copies kept: none (this file had none in scope).

Figures that differ: none.

For the founder or the lead:

- **documents.json row title:** the row `cma-circular-2022-9-30` names the circular "ניהול מסלולי השקעה בקופות גמל"; the
  circular itself is "מסלולי השקעה בקופות גמל - תיקון" (that name belongs to the May 2022 draft). A row with the longer
  token is in `requests/FA-bank.json`.
- **Out of scope (no record), for whoever owns them:** CAT-40 cites circular 2015-9-9 without a link, and R-prov did not
  find the gov.il file. It is at `https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1446/he/regulation_h_2015-9-9.pdf`
  (CAT-38 uses it; the collector page lists it). CAT-41 cites circular 2018-9-26; R-prov found the same note in
  2020-9-22 p.13.
- CAT-10 keeps one prose phrase ("per-specialization queries with filters=...") that is a method, not a citation.

## bank-current-account-deposits.md (BANK), 20 records

All 20 Source lines were rewritten; every source on them was opened today and set to `checked 2026-10-25`.

- **Edition moved: 3 documents.**
  - BANK-01: the BoI consolidated Banking (Customer Service) Law "version 10/11, marked unofficial"
    (`boi.org.il/media/y3akar3j/...pdf`) moved to the file the BoI legislation page links today,
    `boi.org.il/media/nvadftgk/150.pdf` (dated 14.4.2026, consolidated to the התשפ"ו amendments). s.2 is on p.4 with the
    same wording.
  - BANK-01, BANK-21: directive 417 was cited through circular h2782; the directive itself (`media/3bacxlsl/417.pdf`,
    version 4, 5/24, the file on the BoI directive page) is now cited (p.1 s.1(א); p.2 ss.3 to 5). The circular stays on
    BANK-21 with pp.1 to 3.
  - BANK-17, BANK-18: fees rules `media/jbwnaivp/159a.pdf` moved to the current BoI link `media/mi2driua/159a.pdf`
    (same consolidation, 9.4.2025; same pages).
- **Page fixed or added: every PDF citation (about 40).** Disclosure rules 151.pdf: s.9, s.10 p.6; s.11 pp.6 to 7; s.13
  p.7; ss.34 to 35 p.15; Schedule E p.18; s.2(ד) p.2; s.7 p.5. Directive 447 (3 pages): ss.1 to 4 p.1, s.5 pp.1 to 2
  (s.5(ג), (ד) on p.2), Annex A p.3. Circular 2781: ss.7 to 11 pp.3 to 4 (s.11, in force 1.4.2025, on p.4).
  Directive 447A pp.1 to 6; circular 2813 pp.2 to 4; the 447A regulatory impact report pp.1 to 7; the BoI press statement
  of 6.5.2026 p.1. Fees rules: definitions p.2, s.4א p.5, first schedule part 1 pp.6 to 8, part 4 pp.15 to 17.
  Amendments 37 and 38 of the Banking (Customer Service) Law are at file pp.2 to 3 and Amendment 39 at file p.2. Before,
  the titles carried the gazette pages 496, 638 and 648. The Amendment 38 bill (הצעות חוק הכנסת 1099) is at pp.2 to 3,
  bill P/6522/25 at pp.2 to 3, directive 425 v6 at pp.1 to 24.
- **Quote fixed: 1.** BANK-06 cited the Annex A column as "אפשרויות לשבירת פיקדון"; the directive prints "אפשרות לשבירת
  פיקדון".
- **Verified unchanged:** directives 447 (5/24), 447A (04/25), 417 (5/24) and 425 v6 (6/26) are the versions on their
  BoI pages today; 151.pdf is still the file BoI links; Yahav's rate board is still no. 13_26 (in force 6.10.2026);
  bill P/6522/25 is still at status 104 (placed on the table for preliminary discussion), and the OData name search
  still returns nothing; the EDGE INTEREST_DASH dataflow answers; the Leumi, Hapoalim, Mercantile, Massad, FIBI and
  Discount pages open; the two Funder articles and the ice.co.il article (secondary, news) open and say what is cited.
- **Strength words split per link: 6 lines** (BANK-21, BANK-23, BANK-26, BANK-27, BANK-28 had one word for a run).
- **Link titles put in Hebrew: about 35.**
- **Figure sources: 16 replaced.** BANK-05 and BANK-07 (151 p.6, s.9 and s.11(א)), BANK-13 (circular 2781 p.4, s.11),
  BANK-14 (directive 447 p.3, Annex A: the eight standard deposit types), BANK-17 (current fees rules, p.2, the track
  definitions: 1/10 and 10/50 actions, as in the record), BANK-19, BANK-20 and BANK-21 (gazette pages 496, 648 and 638
  in the titles replaced by file pages 2, 2 and 3, with the subsection), BANK-32 (directive 425 v6: s.3 and s.5 on p.1,
  s.7 on p.2). Every value matches its page.

Copies kept: none (the file had no Wikisource or Nevo source in scope).

Figures that differ: none.

For the founder or the lead:

- **Rule text, not changed (BANK-01):** the rule says a bank must open and run a current account "as long as the account
  is in credit and the customer meets the account agreement". The law (s.2(א)(2), current BoI text p.4) says "כל עוד
  מתקיימת אחת מאלה": either condition is enough. The rule's "and" should be "or". This needs a rule fix by the owner of
  the rule text.
- **Title hijack avoided:** a link title that begins "Directive 447A" picks up directive 447's title from the
  `boi-directive-447` row (token "Directive 447" is longer than "447A"). The BANK-15 link now has a Hebrew title. Other
  files citing 447A with an English title will hit the same thing.
- BANK-15 keeps a bare URL in prose (the 447A draft, "not the final text"). It is a note, not a source.

## bank-product-names.md (BPN), 1 record

- BPN-10: the four Hapoalim savings-plan contracts all open (2 pages each). Both quoted sentences are on file page 1
  of each (the "חיסכון צומח לעתיד" contract's wording differs slightly from the first quote, match 0.92). Pages added
  (p.1), titles put in Hebrew, `checked 2026-10-25`. Copies: none. Figures: none.

## What is left

- The 21 dated CAT-42 Maya filter counts were not re-counted one by one (total re-read).
- One Zero's full tariff PDF opens (Chrome, 200), but its 33 pages were not re-read page by page today. The tariff page
  still links the same 26.7.26 edition.
- Securities Law s.49א: cited from the 2017 Amendment 63 gazette. Later amendments to that section were not looked up
  in the Knesset database.
- Requests for the lead: `requests/FA-bank.json` (2 documents.json rows: One Zero's full tariff, CMA circular
  2022-9-30's own title).
