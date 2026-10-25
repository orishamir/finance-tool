# FA-pf: provident-family rules (PF) and self-directed IRA rules (IRA), source check of 2026-10-25

Agent FA-pf. I edited the `- Source:` lines of the record-backed blocks in `provident-family-common.md` (28 rules) and `ira-self-directed.md` (23 rules), and those records' figure sources (through `figsrc.py` only). I changed no rule text, no figure value and no rule `strength`/`checked`. I also wrote a requests file (`requests/FA-pf.json`, 3 documents.json rows). After both files, `extract-locked.sh` reports `data/ is valid` and 0 skipped entries.

Method: every official PDF was downloaded with curl and read page by page with pdftotext. Every quote I wrote was checked by script against the cited file page: 50 PF quotes and 28 IRA quotes, all scoring at least 0.9 on the page. The quotes on HTML pages were matched against the downloaded page text. Every source now on these 51 rules, and every figure source on their records, has `checked 2026-10-25`. No Wikisource, Nevo, Prisha, Analyst or Meitav-hosted copy is left on them, as a source or as a figure source.

## provident-family-common.md (PF), 28 records

### What changed, by kind

- **Copy replaced by the official text: 24 rules.**
  - **Wikisource / Nevo replaced with official texts: 16 rules.**
    - Supervision of Financial Services (Provident Funds) Law, Knesset gazette ס"ח 2024, with these pages and amendments:
      - PF-01 (s.32, p.13, plus Amendment 20), PF-10 (s.32(א)(2), p.13), PF-17 (s.23, p.11).
      - PF-26 (s.35, p.14).
      - PF-28: Amendment 13 (2015). s.24ב is on file pp.10-13; s.24א starts on p.6 and its expiry, 31.3.2018, is on p.10.
      - PF-29: ss.3, 25, 27 and 30 on pp.4, 11 and 12, plus Amendment 15, p.2.
    - Management Fees Regulations, ק"ת 7131, plus amendments 7358 (2014) and 9942 (2022): PF-02, 03, 04, 05, 06.
    - Direct Expenses Regulations, ק"ת 6652, plus amendments 8744 (2020) and 10377 (2022/3): PF-10, PF-12.
    - Transfer Regulations, ק"ת 6657, plus amendments 7407 (2014) and 8735 (2020): PF-17, 18, 19.
    - Pension Advice Law:
      - Amendment 3 (ס"ח 2280): s.1 definition on p.1; s.31ט on p.5; s.31יא on p.7; s.31יד on p.8.
      - The base law, s.1 "סוג מוצר פנסיוני", on p.2.
      - Provident Funds Law Amendment 15, s.9 (p.3), which adds gemel lehashkaa to that definition.
      - All of these are for PF-22.
    - Income Tax Regulations (Rules for Approval and Management of Provident Funds): the btl.gov.il consolidated text (up to ק"ת 10716), reg. 33ב on p.9 and reg. 1 on p.3, for PF-23.
  - **Prisha copies replaced by the gov.il circulars:**
    - PF-16: circular 2017-9-15. s.3א is on p.2, s.4 on p.3, appendices on pp.5-7.
    - PF-33 to PF-38: circular 2020-9-22. It matches the Prisha copy page for page, so the pages stand.
  - **Analyst copy replaced by the gov.il circular, PF-20:** circular 2017-9-17.
    - s.3 is on pp.2-3, s.4 starts on p.3, s.6 is on pp.8-9, s.9 on p.9, s.11 on p.10.
    - Annex A1 runs from p.11; the cancellation sentence is on p.12.
- **Copy removed, because an official source on the rule already said the same: 8 links.**
  - PF-13: the Prisha copy. The gov.il circular now carries ss.3(א), 3(ה), 5 and 6 on pp.1-4.
  - The second "Nevo mirror" cross-read link on PF-02, 04, 05, 06, 17, 18 and 19.
- **Page fixed:**
  - PF-39: the report's printed pp.60-61 are chapter 4 file pp.6-7. Chart ד-2 is on p.6; chart ד-3 and table ד-9 are on p.7. This was fixed in the source and in all 6 figure titles.
  - PF-13: "pp. 1 to 2 read" became the four sections with their pages.
  - PF-33: the report's chapter 2 now cites p.5 ("קידום השקיפות לחוסכים").
- **Link-less mention made a link:**
  - PF-10: law s.32(א)(2).
  - PF-19: Altshuler bylaws ss.16-19 (see the note below).
- **Official source added: PF-26.** I added circular 2020-9-22, pp.2-3. It is the regulator's text for the same three deadlines the bylaws give: 3 months, 60 days and NIS 50,000.
- **Verified unchanged, page or quote added:**
  - Altshuler "חיסכון פלוס" bylaws, March 2025: PF-03 (p.10), 13 (p.10), 14 (pp.10-11), 19 (p.6), 23 (p.6), 24 (p.4), 26 (pp.9-10).
  - Phoenix gemel lehashkaa FAQ: PF-03, 14, 19, 23.
  - Menora fees page: PF-04.
  - CMA draft 2025-26 (notice_2025_51): PF-33 to PF-38. Every page range was checked against the 161-page draft.
  - In Chrome:
    - The report page `tender-0102` (published 07.09.2026; chapters 1-8).
    - gov.il terms of use (updated 25.06.2026). The fair-use sentence PF-39 relies on is there verbatim.
- **Figure sources: 27 replaced or updated.**
  - Wikisource to ק"ת 7131 with the file page:
    - PF-02: 2 figures.
    - PF-04: 2 figures.
    - PF-05: 2 figures.
    - PF-06: 1 figure.
  - Prisha to the gov.il circular 2017-9-15: PF-16, 4 figures.
  - Wikisource to ק"ת 6657 p.6: PF-19, 1 figure.
  - Wikisource to btl.gov.il p.9: PF-23, 1 figure.
  - Altshuler bylaws to circular 2020-9-22 p.2 / p.3, same values: PF-26, 3 figures.
  - Prisha to the gov.il circular: PF-33, 4 figures.
  - Page added in the title:
    - PF-13: 1 figure.
    - PF-39: 6 figures, printed page changed to file page.
- **Titles.** The Hebrew link titles appear as written. The exception is three Provident Funds Law amendments (13, 15 and 20). Their documents.json rows (`prov-d9b54e7c`, `prov-df9eea2b`, `prov-ffa2cdfc`) carry titles cut off mid-word, such as "(תיקון מס' 20), ה". I asked for rows with the full titles in `requests/FA-pf.json`. The truncated rows also touch other agents' rules.

### Copies kept

None.

### Figures that differ

None. The management-fee caps (1.05% / 4%, 0.5% / 6%, 1.05% / 4%, 2%), the circular figures (5 years, 2 and 4 months, 30 days, 10 business days), the transfer deadline (10 business days), the switch deadline (3 business days), the report deadlines (3 months, 60 days, NIS 50,000, 10 years) and the PF-39 averages all match the official pages.

### Notes for the lead and the founder

- **PF-20: no mismatch in this rule's text.** R-prov flagged that the three business days in circular 2017-9-17 s.3(ז) run from the day the request is passed to the transferring fund (p.2), not from the determining date. PF-20 says only "within three business days" and does not state a start, so it does not contradict the circular. It could name the start point. SW-05 is where the flagged wording sits.
- **Transfer Regulations reg. 9: the map points at the superseded text.** The map's entry for reg. 9(א)-(ג) cites ק"ת 6657 p.8, which is the 2008 wording. Booklet 7407 s.5 (2014, file p.4) replaced reg. 9 in full. PF-18 now cites 7407 p.4, where the partial-transfer ban for study funds is verbatim. The same correction applies to the other map users: SW-14, SW-39, TXH-19 and KH-17.
- **PF-19: the old source line overstated the Altshuler bylaws.** It said the bylaws ss.18-19 state the same 10-day deadline. They do not: they refer to the transfer regulations and give the late-transfer remedy. The source line now says so.
- **PF-02: the rule text calls the annuitant caps "read only in summary".** The gazette confirms them: 0.6% in reg. 2(א)(3) (7131 p.4) and 0.3% from 1.2.2022 (9942 p.2). The founder may want to close that note.
- **PF-33: the rule text says the gov.il copy of the 2020 circular was not found (open question 16).** It is on gov.il (`r_2020-9-22/he/2020-9-22.pdf`), and the source now cites it. The draft is still the latest 2025 text; it is not in force.
- PF-13's conflict (circular five years against bylaws two years) is unchanged rule text.

### Left

- The non-record blocks were not touched: PF-07, 08, 09, 11, 15, 21, 25, 27, 30, 31, 32. Several still cite Wikisource.

## ira-self-directed.md (IRA), 23 records

### What changed, by kind

- **Copy replaced by the official text: 16 rules.**
  - **Meitav-hosted PDF of ק"ת 7819:** it is byte-identical to the Reshumot booklet (same md5). Replaced with the official booklet 7819 on IRA-02, 07, 08, 09, 10, 11, 12, 16, 23 and 25. The booklet's pages:
    - s.1 (reg. 1) and s.2 (reg. 2) on p.2, continuing to p.3.
    - ss.3-5 (regs. 4, 5, 7) on p.4.
    - ss.6-7 (regs. 9, 11) on p.5.
  - **Nevo (500_217 and 70391):** replaced with:
    - the base booklet ק"ת 6820 (regulations on file pp.2-6: reg. 3 on p.3, reg. 5 on pp.3-4, regs. 6-7 on p.4, regs. 8 and 11 on p.5, reg. 12 on p.6);
    - the Provident Funds Law gazette: s.1 on p.2 and s.57 on p.21.
    - These cover IRA-01, 05, 10, 13, 14, 15, 16, 18 and 23.
  - **IRA-18:** I added ק"ת 7880 (2017, pp.2-3), which carries the current reg. 12, and ק"ת 6901 (2010, p.2), which carries the repealed 20% cap. The 2009 wording stays cited at 6820 p.6.
- **Link-less mention made a link:**
  - IRA-03: "Nevo law text as in IRA-01" is now law s.1, p.2.
  - IRA-25: "Nevo and Reshumot as in IRA-14, IRA-23" is now 6820 p.4 reg. 5(ג)(3) and 7819 p.5 s.7.
- **Dropped:** IRA-07 cited "reg. 9" of the 2017 amendment. That regulation is about asset valuation (a deposit is valued at adjusted cost), not about which money may enter an IRA.
- **Verified unchanged, quote or page added:**
  - CMA draft 2025 (gov.il legalinfo): draft text on pp.2-5 (s.4 to s.8 on p.4); explanatory notes on pp.6-7. This covers IRA-05, 07, 13, 14, 15, 26 and 27.
  - CMA 2026 regulation plan, p.16: IRA-27.
  - Meitav IRA page: IRA-02, 05, 07, 08, 09, 10, 17, 23.
  - Meitav joining-form annex, p.1: IRA-07, 11, 16.
  - Meitav brokerage letters (Leumi, Mizrahi, Binleumi, Meitav Trade, Hapoalim) and the brokerage page: IRA-11, 12, 18, 21. I spot-checked rates against the IRA-21 table.
  - Meitav Trade operating-fee annex, p.4: IRA-22.
  - Mor ceilings 2026, p.2: IRA-08.
  - Gemel-Net datastore, both queries, 202609: IRA-03, 17. 15 IRA funds; fees 0.15 (Phoenix 2023) to 0.36 (Migdal 8890); no deposit fee.
  - Secondary sources:
    - Calcalist, 06.05.2024, checked in Chrome: IRA-25, 28.
    - Bizportal, 25.05.2026 and 16.06.2026: IRA-28.
    - Shibolet: IRA-27.
  - English link titles without a documents.json row were given Hebrew titles: Gemel-Net, the bank annexes, the brokerage page, the press articles.
- **Figure sources: 16.**
  - Meitav copy or Nevo replaced with official booklets:
    - IRA-12: 4 figures. 6820 p.3 reg. 5(א)(5); 7819 p.4 s.4.
    - IRA-14: 3 figures. 6820 p.3 reg. 5(ג)(1); pp.3-4 reg. 5(ג)(2).
    - IRA-18: 3 figures.
      - `process_max_years`: 7880 p.2.
      - `min_participants`: 6820 p.6, titled as the 2009 wording that 7880 replaced.
      - `related_party_commission_cap`: 6901 p.2, titled as repealed by 7880.
  - Institution or dataset sources verified unchanged, with checked dates refreshed:
    - IRA-08: 3 figures.
    - IRA-10: 1 figure.
    - IRA-17: 2 figures.
  - While refreshing these I briefly overwrote two figure sources (IRA-08 `determining_amount` and `minimum_pension`, IRA-17 `gemelnet_fee_max`) with a sibling's source. I restored them from git HEAD, so each again has its own source.

### Copies kept

None.

### Figures that differ

- **IRA-18 `min_participants`:** 4 in the record. The current reg. 12(א) says eight: "הליך תחרותי שיתקיים אחת לשלוש שנים לפחות בין שמונה משתתפים לפחות" (ק"ת 7880, Reshumot file service `iXRl3JX663X67T342MLtmOhZrYskYBxrQk+FHRN~mJM=`, file p.2).
- **IRA-18 `related_party_commission_cap`:** 20 in the record. The current reg. 12(ב) has no percentage cap. A related party may be used only if its commission is no higher than the unrelated winner's (ק"ת 7880, file p.3).
- `process_max_years` (3) matches.
- All other IRA figures match: the 2017 percentage limits 5% / 10% / 5% on 7819 p.4, the 10% single-issuer cap on 6820 p.3, and the 45 and 7 business days and the quarterly check on 6820 pp.3-4.

### For the founder

- **IRA-18 rule text is out of date** (not changed).
  - Since ק"ת 7880 (2017; signed 22.10.2017):
    - the process needs at least eight participants;
    - the 20% related-party cap is gone;
    - a new reg. 12(ג) lets the member trade through a broker the member chose, even one that lost or did not take part in the process, provided the member was shown the winners' terms.
  - That also answers IRA-18's own open question 5 (whether a member may use a broker outside the process).
  - 7880 s.2 has a transitional rule on reg. 12(א) that I did not analyse.

### Left

- Non-record blocks were not touched, though some still cite copies:
  - IRA-04: Nevo.
  - IRA-06 and IRA-24: the Meitav-hosted 7819.
  - IRA-19: Nevo.
  - IRA-20.
- IRA-12's exceptions to the 10% rule (ETNs, foreign funds, government bonds) were not pinned to a gazette page. Meitav's letters state them.
