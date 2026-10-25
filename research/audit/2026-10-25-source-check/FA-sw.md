# FA-sw: source check of switching-and-transfers.md (2026-10-25)

Agent FA-sw. Scope: the `- Source:` lines of the 48 rule blocks in `.claude/skills/il-finance/references/switching-and-transfers.md` that have a record in `data/rules` (SW-01 to SW-44 and the four experience blocks SW-X01 to SW-X04), plus the 52 figure sources of those records, changed only through `figsrc.py`. All 48 rules are done; nothing is left over. No rule text, figure value, rule strength or rule checked date was changed.

After the last extract, the 48 records carry 158 sources: 120 primary, 31 institution, 7 secondary, and **0 copies**. Every source and every figure source has `checked 2026-10-25`. `extract-locked.sh` reports 0 skipped entries, and validation passes for the SW records. The validation errors seen mid-run were all in TXH records, which another agent was editing at the time.

## What changed, counted by kind

- **Source lines rewritten:** all 48. The old reference-style links (`[..][c17]`, `[tr]`, `[lawadv]`, `[ira17]`, `[d448v2]` and others) are now inline links to official texts, each with its own strength word, file page and a short verbatim quote where one was clean. The reference definitions and the Sources table at the foot of the file are left as they were: they are outside my scope, and some of them now have no users.
- **Copies replaced by official texts:** 41 citations across 27 rules.
  - Transfer regulations 2008, Wikisource and Nevo (SW-01, 04, 06, 12, 13, 14, 15, 21, 22, 23, 38, 39, 40), replaced by the Reshumot booklets:
    - ק"ת 6657 (base text);
    - 7407 (2014);
    - 8735 (2020);
    - 10170 (2022);
    - 10716 (2023).
  - CMA circular 2017-9-17, analyst.co.il copy (SW-02 to SW-12, 16, 19, 23, 38), replaced by the gov.il `regulation-988` PDF. The page numbers carry over.
  - CMA circular 2017-9-15, prisha copy:
    - SW-15: removed, because the gov.il copy was already on the line.
    - SW-38: replaced by gov.il `regulation-989`, p.3, s.4.
  - Advice, marketing and clearing law, Wikisource (SW-17, 18, 19), replaced by:
    - the base law, ס"ח 2024 (16_lsr_299985): s.13(א) p.9, s.19 p.10, s.27 p.12, s.28 p.13;
    - Amendment 3, ס"ח 2280 (18_lsr_301283): s.31ט p.5, s.31טז(ד)(1) p.10, s.32(ח) p.12;
    - for the current wording of s.13(ב)(1), the Economic Plan Law 2015-2016, ס"ח 2510, file p.23. I found that wording with the Knesset's list of amending laws (IsraelLawID 2000504).
  - Provident Funds Law, Wikisource:
    - SW-15: replaced by the base law, ס"ח 2024 (16_lsr_299984), p.13, s.32(א), plus Amendment 20, ס"ח 2597, p.2.
    - SW-21: removed, because Amendment 15, already on the line, covers the point.
  - Retirement Age Law, Wikisource (SW-21), replaced by the base law (16_lsr_300990), p.1, s.5.
  - Income Tax Ordinance, Wikisource PDF (SW-21), replaced by the Tax Authority's consolidated text, p.21, s.3(ה4)(3).
  - Transfer-exemption rules 1990, Wikisource (SW-40), replaced by ק"ת 5287, pp.23-24, and the 1994 amendment ק"ת 5613, p.21.
  - Study-fund accounts regulations 1993, Nevo 255_226 (SW-38), replaced by National Insurance's consolidated text, btl.gov.il 02_0103_100048.pdf, p.1.
  - IRA amendment 2017, Meitav re-host (SW-24), replaced by ק"ת 7819 on the Reshumot file service, p.5.
- **Institution documents mislabelled as copies** (they sat as bare links [1] to [8] in the pointer rules SW-15, SW-21, SW-37 and SW-38). Each now has its own Hebrew title and strength word:
  - institution: the Altshuler Shaham and Infinity gemel lehashkaa bylaws, the Harel flyer, the Phoenix FAQs, Interactive Israel, Bank Yahav, the Leumi general terms;
  - secondary: the ice article;
  - primary: the TASE periodic report and the National Insurance pages.
- **Editions moved:**
  - Directive 448, versions 1 and 2, moved to **version 4 (11/25)**, `media/irmdw0r2/448_4-מונגש.pdf`, the version the BoI directive page lists (SW-26 to SW-32, SW-43). Every section's page was checked in version 4.
    - Version 4 paginates like version 2 up to s.29. Then s.30 to 33 are on p.10 and s.34 to 41 on p.11.
    - The Q&A annex is on pp.13-14.
  - Fees rules 2008: moved to the BoI file `media/mi2driua/159a.pdf`. It was re-saved in February 2026, has the same amendments (latest ק"ת 11824, 9.4.2025) and the same pages, and is the file the brokerage family uses.
  - Governor's rerouting rules: the two BoI drafts (2023, 9.8.2026) are replaced by:
    - the rules amendment itself, ק"ת 12530 (9.9.2026), p.2, new rule 5א, which extends rerouting to 31.7.2029. I found it through the gov.il Reshumot collector.
    - circular ח-06-2863 (SW-30, SW-38).
- **Pages fixed:**
  - Transfer regulations, reg. 1 is on file p.2. R-prov's map says p.3.
  - Circular 2017-9-17:
    - Annex A part 2 is on pp.14-15;
    - the "no deposits" item 6 of Annex A is on p.12 (part 2: p.15);
    - Annex 11 is on pp.26-27.
  - Booklet 7407: the new reg. 9 runs pp.4-5, with 9(ד) on p.5.
  - Amendment 38 (ס"ח 3413): s.5ב2 is on file p.2 and the commencement section on file p.3. The figure title said "p.638".
  - Payment circular 2026-10-6:
    - annex א on p.5, annex ב on p.6, annex ג on pp.7-9;
    - commencement is s.8 on p.4, not the explanatory note on p.13.
- **Link fixed:** the figure sources for SW-35 pointed at the Altshuler homepage. They now point at its portfolio-transfer FAQ page.
- **Verified unchanged** (opened, point and locator confirmed, checked date set):
  - the Phoenix study-fund and gemel FAQs, Leumi's "עושים סדר בפנסיה" page, Mizrahi-Tefahot's advice page;
  - the Discount, IBI and Meitav tariffs, Leumi's transfer instructions, the Meitav article;
  - Calcalist (in Chrome), the ice article;
  - the Knesset OData bill and status rows, bill P/5281/25;
  - circular 2020-9260, the gov.il `pension-clearing` page (in Chrome), circular 2026-9-3 (no later circular, only a draft, in the CMA collector), payment circular 2026-10-6;
  - circular ח-2833, circular ח-2670, the BoI 448 page;
  - the four Hasolidit threads;
  - the National Insurance pages and circular 1356;
  - the operator's price list on swiftness.co.il, which renders in Chrome now.
- **Figure sources:** all 52 set with `--checked 2026-10-25`.
  - 41 moved to an official document with the file page in the title.
  - 11 institution figures re-checked against their pages: the Phoenix 10 and 14 days, the Leumi 3 months, the three Meitav IRA transfer fees and the two Altshuler trading-day counts.
  - Every value checked matches its source.
- **Titles:** Latin-script link titles (OData, IBI, Leumi, Mizrahi) were changed to Hebrew so that the site shows a Hebrew title. Every new source got its `title_he`, except the two hijacks below.

## Copies kept

None.

## Figures that differ

None. One related observation that is not a differing figure (SW-44): the clearing-house operator's own current price list (swiftness.co.il, "מחירון שירותים", prices including VAT) charges a saver 14 ₪ for a one-time all-institutions request. The rule's 11 ₪ is the cap from 1.1.2027 under circular 2026-10-6, excluding VAT. The two cover different periods, and together they answer part of the file's open question 5.

## Source says something different from the rule (rule text not changed)

- **SW-05 (and PF-20):** the rule says the transferring fund's three business days run from the determining date. Circular 2017-9-17, s.3(ז), p.2, counts them "ממועד העברת הבקשה לגוף המנהל של הקופה המעבירה". The Source line now carries that quote.
- **SW-21:** "transfers between gemel lehashkaa funds are not taxed (TXK-04)" is cited to Ordinance s.3(ה4)(3), p.21. That subsection taxes *withdrawals* from a gemel lehashkaa as interest; it does not itself state that a transfer is untaxed. The point is an inference, and it belongs to TXK-04.
- **SW-25:** National Insurance circular 1356 (30.11.2016, p.21) predates the January 2025 change that lets a parent move deposits from a bank once (CS-12). The two btl.gov.il pages carry the current points.
- **SW-17:** the current wording of s.13(ב)(1) comes from ס"ח 2510, whose PDF has a doubled text layer, so no clean quote could be added.

## Needs the founder's decision

None beyond the SW-05 wording above, which needs a rule-text fix by whoever owns the rule text.

## Requests to the lead (`requests/FA-sw.json`)

- Two documents.json rows with the full titles of Provident Funds Law Amendment 20 (התשע"ז-2017) and Amendment 15 (התשע"ו-2016). The existing R-prov rows `prov-ffa2cdfc` and `prov-df9eea2b` have a truncated title "... (תיקון מס' 20), ה", which hijacks the title of SW-15 and SW-21.

## Left open

- **The 2016 amendment of the transfer regulations (התשע"ו, p.634):** not found, and probably not real.
  - The footnote of ק"ת 8735 (2020) reads "ק"ת התשע"ו, עמ' 634; התשע"ד, עמ' 1613".
  - Footnotes cite the base text plus the last amendment, and the 2022 booklet's footnote cites the base as "התשס"ח, עמ' 626" with no התשע"ו amendment.
  - So "התשע"ו 634" is most likely a misprint of the base citation.
  - The gov.il gazette collector does not search booklets by free text, so I could not confirm it.
- **Fees rules:** the BoI site search returned 404. The newest file I found is `mi2driua/159a.pdf`, the same file the brokerage family uses. A consolidation later than 9.4.2025 was not found.
- **SW-15, SW-21, SW-37, SW-38** remain pointer rules. Their links are the official forms of what the cited rules use, not a re-reading of those rules.
- **Shared scratchpad:** my helper scripts in the scratchpad root were overwritten by another agent mid-run, because all agents share that directory. I moved my work into `scratchpad/FA-sw/`. Agents should keep to their own subfolder.
