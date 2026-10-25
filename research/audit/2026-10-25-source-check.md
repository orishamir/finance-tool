# Source check of 2026-10-25

The founder asked to validate every source, to stop offering a copy "for an easy read", to prefer the newest official
government PDFs (a Tax Authority PDF linked directly whenever one exists), and to give every rule a non-copy source.
This report covers the 500 rule records in `data/rules/` (their generated `sources` and their hand-written figure
sources). It was run by a lead agent with four research agents (one per body of law) and nine family agents (one per
group of rule-base files); their parts are in `research/audit/2026-10-25-source-check/`. Status: **finished for every
record; nothing is committed.**

## 1. Result in numbers

| | Before | After |
|---|---|---|
| Rule sources (links shown on the site) | 1,095 | 1,440 |
| Of them copies (Wikisource, Nevo, third-party re-hosts) | 321 | 3 |
| Figure sources | 501 | 501 |
| Of them copies | 113 | 1 |
| Rule sources checked on 2026-10-25 | 0 | 1,440 (all) |
| Figure sources checked on 2026-10-25 | 0 | 475 (the other 26 are live Maya counts, section 7) |
| Rule sources that open the PDF at a page | 249 | 1,087 |
| Rule records whose own strength moved from copy to primary (done by the extract when their copies went) | | 126 |

Closing verification (`research/audit/tools/source-verify.py`, every rule and figure source, run at the end):
1,941 sources over 417 links; 1,485 PDF page citations, **none past the end of its file**; 329 quoted spans checked
against their pages, 314 found exactly, the other 15 explained (the quote sits on the next page of a cited range,
a table row whose cells are quoted in order, or a scanned page with no text layer). Links that did not answer 200 to
the script: sites that block scripts (S&P Global 21, Calcalist 5, gov.il pages 3, One Zero 2, the government
legislation site and the Supreme Court download 1 each), all opened by an agent in the founder's Chrome; and 33
citations of five Reshumot files that returned a transient server error and opened on a second, slower try.

## 2. What was wrong and how it was fixed

**Printed page numbers instead of file pages.** A cited `p.N` must be the PDF file page (what `#page=N` opens).
- The Tax Authority guide "דע זכויותיך וחובותיך 2025": every printed page is the file page minus 2, uniformly
  (checked on all 152 pages). Every citation of it in the rule base, "p.N" and "printed p.N" alike, was moved +2
  (TXH-09's section 9(16א) is on file page 89, which prints 87); 55 quoted spans were then found on the new pages and
  the rest were matched by best page.
- The TASE periodic report 2025: file page = printed + 3 (all citations moved, sections checked on the pages).
- The debt-management unit's annual report 2025: printed = file page; no change was needed (the automatic pass was
  wrong about it).
- The eight citations past the end of their file were gazette page numbers or a binder page: Amendment 38 of the
  Banking (Customer Service) Law (printed 638-639 = file 2-3), the 2024 and 2026 efficiency laws (150 = 2, 416 = 4),
  the child-savings chapter (244-247 = 28-31), the BoI Banking Ordinance ("103-2" = 2), the CMA report chapter 4
  (60-61 = 6-7), the IRA amendment of 2017 (1138 = 2, 1141 = 5). The family agents found and fixed more of the same
  in titles and figure sources (S&P methodology printed + 1, TASE מעו"ף labels minus 1, Mor bylaws printed + 2, the
  pension extension order gazette − 6937, Sefer HaChukim pages in bank figure titles).

**Broken or misleading links.** data.gov.il moved its dataset pages to `/he/datasets/<org>/<name>` (four replaced);
its datastore API links work in a browser (the script had failed on unencoded braces); URLs with a space were cut by
the extract at the space (11 encoded as %20). Institution bylaws, FAQs and a news item listed as bare links `[1]`..`[8]`
had inherited a "copy" label from a trailing strength word; each now has its own title and strength word.

**Wrong titles on the site.** The Hebrew-title table matched rows by substring, so a base law's row gave its title to
amendments (for example KGL-01's Amendment 15 gazette was shown as the base law). The lead removed the generic Hebrew
law-name tokens and added full-title rows for every amendment booklet now cited (data/sources/documents.json grew from
135 to 235 rows; publishers.json gained the Reshumot file service and the government legislation site).

**Newer editions.** The Tax Authority guide 2025 is the newest (the gov.il page, updated 05.07.2026, lists 2025 and
2024 only); the deductions booklet cited is the 15.04.2026 file, the newest. Moved to newer editions: BoI directive
447A (draft to final 04/25), directive 448 (versions 1-2 to version 4), the BoI fees rules (to the 9.4.2025
consolidation), the BoI customer-service-law text (to the 14.4.2026 file), the Banking Ordinance (BoI item 103 of
2026), the TASE members' guide (1.1.2026), the CMA annual report (2024 to 2025 where the point is the same), the Migdal
fund prospectus (30.1.2026), the S&P methodology (July 2026), the CMA circular 2018-9-26 to 2020-9-22 and 2020-9-18 to
2022-9-30, and BoI rerouting drafts to the published rule amendment (ק"ת 12530).

## 3. Where the official texts came from

- **Income Tax Ordinance**: the Tax Authority's own consolidated PDF on gov.il ("פקודת מס הכנסה [נוסח חדש]", published
  15.01.2023, consolidated to Amendment 262), at the file page of each section; for the eight subsections changed
  since, the amending law's gazette PDF on fs.knesset.gov.il (Amendments 275, 276, 277, 288 and the 2026 efficiency
  law). **Caution:** that consolidated PDF has at least one wrong number: section 125ב1(ב) prints 20% although
  Amendment 187 (2011) set 25% (TXS-10 now cites the amendment, ספר החוקים 2324). A line-by-line sweep of every
  percentage in the 135 cited subsections against the current text found no other mismatch.
- **Regulations and orders**: the official gazette booklets (קובץ התקנות) served by the Ministry of Justice's
  Reshumot file service (free-justice.openapi.gov.il), base booklet plus the amendment that set the cited wording;
  National Insurance's consolidated texts on btl.gov.il for six income-tax regulations (current to the same last
  amendment) and for the National Insurance Law itself; ספר החוקים PDFs for laws and amendments.
- **Regulators' own documents**: the CMA circulars on gov.il (the analyst.co.il and prisha.co.il re-hosts were page for
  page the same files), the CMA annual reports by chapter, the ISA's consolidated Joint Investment Trust Law and its
  2025 funds report, the Bank of Israel's legislation items, the tazkirim.gov.il memorandum page.

## 4. Per family (details in each part)

| Family (part file) | Records | Main changes |
|---|---|---|
| Study-fund, gemel-lehashkaa/IRA/child, insurance tax, savings policies (FA-tax1.md) | 35 | 52 copies replaced, 4 removed, 0 kept; 10 link-less mentions linked; 25 figure sources replaced |
| Pension, general and tier-2 tax (FA-tax2.md) | 36 | 36 copies replaced, 1 removed, 1 kept; 3 gazette citations for post-2022 wording; 30 figure sources replaced |
| Israeli and foreign securities tax, interest (FA-tax3.md) | 60 | Ordinance copies replaced in 40 records, regulations moved to official texts; 9 rules moved to the 2026 prospectus; 1 copy kept (2 rules); 31 figure sources replaced |
| Switching and transfers (FA-sw.md) | 48 | 41 copies replaced in 27 rules; three editions moved; 52 figure sources checked |
| Provident common, IRA (FA-pf.md) | 51 | copies replaced in 24 PF rules and the IRA rules, 8 duplicates removed; 37 figure sources replaced |
| Pension, study fund, gemel lehashkaa (FA-pen.md) | 65 | about 25 copies replaced; about 20 link-less mentions linked; KH-12's retirement-age "(עותק)" replaced; 70 figure sources updated |
| Child savings, government bonds, regulators (FA-gov.md) | 64 | 16 link-less copy mentions became 23 official citations; 12 Nevo and 13 Wikisource links replaced; 16 figure sources replaced |
| Mutual funds, ETFs (FA-funds.md) | 74 | 32 copies and 14 re-hosts replaced; 9 page fixes; 76 figure sources updated |
| Brokerage, catalogue, bank accounts, bank product names (FA-bank.md) | 67 | 3 copies replaced; editions moved; gazette pages to file pages; 19 figure sources updated |

## 5. Copies kept

1. **VAT Law s.4(ב)** (TX2-17, Wikisource). The amending law that set the current wording was not identified: the
   1975 scan's text layer is unreadable and the 2004-2012 amendments carry no matching text. The site hides this copy,
   because TX2-17 has eight official sources.
2. **The Tax Authority letter "ניכוי מס במקור – קרנות חוץ", 4.7.2019** (TXF-04 and TXF-05, and TXF-04's figure
   threshold_pct), on capitax.co.il. Searched: gov.il (Google site search), the Wayback index of every gov.il BlobFolder
   path by date and file name, the Tax Authority circular pages. Now labelled honestly as a copy, so **TXF-04's rule
   rests only on a copy** and the extract set its strength to copy (TXF-05 also cites the official withholding
   regulations).

## 6. Figures that differ

| Rule, figure | In the record | In the newer or official source | Source |
|---|---|---|---|
| IRA-18 min_participants | 4 | 8 (reg. 12(א) since the 2017 amendment) | קובץ התקנות 7880, Reshumot file `iXRl3JX663X67T342MLtmOhZrYskYBxrQk+FHRN~mJM=`, file p.2 |
| IRA-18 related_party_commission_cap | 20 | no percentage cap (repealed; a related party only if its commission is no higher) | ק"ת 7880, file p.3 |
| PEN-19 (fund-by-fund values) | 2024 values | the 2025 report repeats 2024 and adds 2025: Infinity 0.14%, Altshuler Shaham 0.02%, Mor -0.06%, Phoenix 0.01%, Meitav 0.13%, Clal -0.03%, Harel -0.03%, Migdal Makefet 0.09%, Menora -0.28% | CMA report 2025, chapter 4, table ד-14, file p.12 (gov.il `tender-0102`) |

Every other figure an agent located matches its page.

## 7. For the founder

Decisions:
1. **IRA-18 is out of date**: eight participants in the broker selection, no 20% cap, and a new reg. 12(ג) letting the
   member choose the broker. Update the rule and its two figures?
2. **PEN-19**: move to the 2025 values, or keep 2024 and say so?
3. **SW-05**: the circular counts the transferring fund's three business days from when the request is passed to it,
   not from the determining date. Correct the rule?
4. **BANK-01**: the law says the bank must keep the account "as long as one of these holds"; the rule says both.
5. **TXS-13**: the 2026 Migdal prospectus no longer says all tracking funds, ETFs included, are exempt. Re-base the
   rule on the 2026 fund tables or on Maya's tax-status field?
6. **TXS-14**: the 2003 inflationary-amount regulations rest on pre-2006 law; whether they still operate is open.
7. **TXF-04** rests only on a re-hosted Tax Authority letter: keep it as a labelled copy or look for another basis?
8. **TXH-11** real-gain figure: could move from two fund managers to the Chief Economist paper (strength changes).

Rule text that its official source contradicts or that should be reworded at the next edit (nothing was changed):
- "The law lists" yearly amounts in TXH-02, TXH-05, TXH-08, TXG-09, TXP-03, TXP-10, TXP-11, TXP-19, TXP-21, TXI-20 and
  CS-03: those lists are Wikisource editor notes; the statute holds base amounts. The figures now rest on the Tax
  Authority booklets (and NII's page for CS-03).
- TXH-15 (the 25% applies to interest on payments from 1.1.2012), TXH-19 (reg. 3(ב)(1) does make a study-fund
  transfer tax-neutral), TXK-16 (the IRA definition never covers a gemel lehashkaa), INS-25 (singular "פוליסת"; its
  definition chain ends in regulations repealed on 20.6.2023), TXP-01 quote ("על-פי"), TXP-02 (form 158), TXP-10 and
  TXP-11 (the 32,000 is an Ordinance s.3(ה3) term, only the 7.5% is reg. 19), TXP-24 (the definition is reg. 1),
  TXS-05 quote ("מלוא המס"), TXS-10 quote (it is s.125ב1(ב), not reg. 10(ב)), TXG-17 (filing exemption amended 2024
  and 2025), TX2-17 (18% from 1.1.2025; "בנק חברתי" excluded since 2026), GOV-01 (s.1(א) sets no balance cap),
  GOV-13 (the "שחר" 1995 and "אג"ח ממשלתית" 2006 regulations exist), GOV-20/21 (final 447A also excludes capital gains
  tax from the shown yield; in force 09/04/25), CS-12 (amendment 247 in force 1.1.2025), MF-11 (Amendment 33, in
  force 2.2.2027, changes s.44 and s.49(ד)), BRK-07 quote ("הפיננסים"), SW-21 (s.3(ה4)(3) does not itself say a
  transfer is untaxed), SW-25 (circular 1356 predates the 2025 change), PEN-36 (quote is the post-2014 wording),
  TXS-01, TXS-19, TXF-02 and TXF-21 (rule text names printed guide pages, now off by 2).

## 8. For the lead (code and data owners)

- Reshumot file-service links (`free-justice.openapi.gov.il/.../Documents/<id>=`) serve PDFs without a `.pdf` path, so
  neither the extract's `isPdf` nor the site's `isPdfUrl` treats them as PDFs. The agents wrote the file page into the
  URL (`...=#page=N`), which the site follows as is. Recognising this host as PDF in both would also fill `page`.
- 26 figure sources keep checked 2026-10-24: CAT-42's live Maya filter counts (only funds_total, 2,009, was re-read).
- The rule base blocks without a data/rules record were left alone; several still cite Wikisource or Nevo (for example
  IRA-04, IRA-19, IRA-06, IRA-24, KGL-13, CAT-40, CAT-41, TXH-23, TXA-13).
- The extract set eight REG rules, seven ETF rules, nine PEN rules and others (126 in all) from copy to primary, and
  TXF-04 from primary to copy, as its rule says.
- Besides `- Source:` lines, the only rule-base lines changed are data.gov.il links in the per-file source tables
  (moved dataset pages). No rule text, figure value, unit, date or rule strength/checked field was edited by hand.
- Fable's usage limit was reached mid-run: the Ordinance map ran on Fable, the other research and all family work
  on Opus.

## 9. Files

- Report parts: `research/audit/2026-10-25-source-check/` — `brief.md` (the shared method), `R-ito.md`,
  `R-taxregs.md`, `R-prov.md` (official-text research), `FA-*.md` (one per family).
- Official-text maps (section → official URL, file page, verbatim quote): `maps/ito.json`, `maps/taxregs.json`,
  `maps/prov.json`, `maps/other.json`; known slips in them were corrected in the rule base (s.91(ג) is p.152; reg. 1
  of the transfer regulations is p.2; reg. 9 was replaced in 2014 by ק"ת 7407; s.46 of the Securities Law is p.88;
  s.102(ה)-(ו) of the trust law is p.67; the ISA 2025 report does exist on isa.gov.il).
- Shared-table requests applied: `requests/*.json`. All Ordinance amendments with gazette links:
  `ito-amendments.json`. Copies as they stood before: `copy-groups.txt`.
- Tools: `research/audit/tools/` — `source-verify.py` (closing pass), `source-check.py` (first pass), `figsrc.py`,
  `extract-locked.sh`, `pdfpages.py`, `bestpage.py`, `edges.py`, `verify_quotes.py`, `shift_pages.py`,
  `knesset_amend.py`, `add_rows.py`.
