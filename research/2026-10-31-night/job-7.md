# Job 7: official copies of the laws cited from Wikisource (issue 84), 2026-10-31

Nothing changed in `site/`, `packages/` or `data/`. The rule base changed in 25 files, each line a citation, plus a few hand-corrected rules listed below. `npm run check` passes. Issue 84 stays open: what is left is at the end.

## Meaning: read this first

**No figure and no rate changed.** Three things touch what a rule says.

1. **CORP-05, who may be a bond trustee (my file): possibly changed, not confirmed.** The rule said a trustee must be a company registered in Israel whose main purpose is trusteeship. That is the 1988 wording, gazette `a0e3d14c85e5510e` p.10. The Securities Authority's consolidated copy, `5b5d6552e5f5129e` p.38, prints only a later wording, "הנאמן חייב להיות חברה הרשומה במרשם הנאמנים". Its footnote says sections 35ג to 35ג2 start when regulations under 35ג1(ד) and (ה) start ("תחילתם של סעיפים 35ג עד 35ג2 לחוק במועד תחילתן של תקנות לפי סעיף 35ג1(ד) ו–(ה)"). The page is stamped 1.5.2020. On p.39, s.35ג1(ב) admits a foreign company. Whether those regulations were made is not settled: a search limited to the Authority and gov.il found only the 2019 draft and a Knesset committee paper, and I did not read a final text. The rule now gives both wordings and points at open question 2 in that file.
2. **Managed portfolios, line 474 (my file): a wrong attribution corrected, figure unchanged.** The 12 million NIS line is First Schedule item 9, `568097f827d4c026` p.55. The footnotes tie the update in י"פ תשפ"ו 2532 to s.38ה (p.48) and the Third Schedule (p.62), not to the First Schedule.
3. **TXG-34, health insurance law (tax specialist, not edited): the state's copy is too old to use.** The National Insurance Institute's copy, `015b869b6f7ccff7`, is dated 16.2.2023 and lacks later amendments, including the 5.17% and 3.23% rates and subsection (ז2). The citation stays on Wikisource, library copy `13c03146a97afb79`. (ז2) there counts income exempt under National Insurance Law s.350א(א) in health income: "תובא בחשבון גם הכנסה הפטורה מתשלום דמי ביטוח לאומי לפי סעיף 350א(א) לחוק הביטוח הלאומי". Section 350א is the new-immigrant exemption, not the rule's s.350(a)(6), so I see no conflict, but the rule rests on an unofficial text.

## What was done to the 274 citations

| Result | Count | What the rule base now says |
|---|---:|---|
| Moved to a state body's consolidated copy, with the section's file page | 159 | Link with `#page=`, tagged "primary (state body's consolidated copy, not the binding gazette wording)" |
| Gazette page added, Wikisource kept as the only copy of the current wording | 74 | Gazette link first, Wikisource labelled "unofficial consolidated text, the only copy found of the current wording" |
| Wikisource kept, labelled, gazette booklet not read | 9 | "unofficial; the state's own copy was not read" |
| Wikisource kept, labelled, gazette page not placed | 4 | Same, with the reason |
| Left by the script | 28 | 22 in tax files, 6 in mine: handled below |

The 6 in my files: CORP-05 was moved by hand; BANK-07 keeps Wikisource only for the per-section amendment marks (the Bank of Israel's copy has its amendment list on p.1 and the figure 1,000 and Schedule E mark on p.18); PEN-08 keeps it for one formula, the only readable copy found; `switching-and-transfers.md` 822 and 823 are reference links, the rows that use them are labelled with gazette pointers; `mutual-funds` 690 is a search note, not a law citation.

209 passages were recorded with `library.mjs cite`; all passed. The per-citation record is `research/knowledge/2026-10-26-official-texts/citations.json`, and the script is `tools/rewrite.py` beside it.

### By law: moved to a state consolidated copy

| Law | Copy (library id) | Publisher, file date | Changed | Left |
|---|---|---|---:|---:|
| Income Tax Ordinance | `6deb4dc4ee99460c` | National Insurance Institute, 21.6.2026 | 75 | 0 |
| Investment Advice Law | `568097f827d4c026` | Securities Authority, 26.8.2026 | 18 | 0 |
| Securities Law | `5b5d6552e5f5129e` | Securities Authority, 26.8.2026 | 13 | 0 |
| Joint Investment Trust Law | `d386a692cce2ad86` | Securities Authority, 31.8.2026 | 9 | 0 |
| National Insurance Law | `c6681353c3ff86ab` | National Insurance Institute, 7.7.2026 | 8 | 0 |
| Income Tax regulations, withholding from interest, dividend and certain gains | `2d313d18dfed9653` | 3.1.2018 | 7 | 1 (TXI-08) |
| Income Tax regulations, calculating capital gain on traded securities | `351dbb86615f9e87` | 31.5.2012 | 5 | 1 (TXI-13) |
| Income Tax regulations, rules for approving and managing provident funds | `c1a910e7108c3769` | 18.8.2025 | 4 | 1 (PEN-08) |
| Wage Protection Law | `ba94355d942e602f` | 27.5.2024 | 4 | 0 |
| Income Tax regulations, exemption from filing a return | `1e08d2496afde076` | 23.12.2025 | 4 | 0 |
| Income Tax regulations, withholding on sale of securities | `8b5fffa5abbe8104` | 3.1.2018 | 3 | 0 |
| Banking (Licensing) Law | `66b8e1b142bf13cf` | Bank of Israel, 24.8.2026 | 2 | 0 |
| Investment Advice regulations, equity and insurance | `88bee84ad057fb9d` | Securities Authority, 2.1.2022 | 2 | 0 |
| Banking (Customer Service) Law | `6bec2669429eb562` | Bank of Israel, 14.4.2026 | 2 | 0 |
| Banking Ordinance | `78ad661d56a7339f` | Bank of Israel, 14.1.2025 | 1 | 0 |
| Income Tax regulations, withholding from study fund payments | `8eea6f57128f4947` | 3.1.2018 | 1 | 0 |
| Income Tax regulations, separate study fund accounts counted as one | `d9cbf92117d8dff0` | 15.3.2012 | 1 | 0 |
| VAT Law | `18e1d21d2093d67f` | 16.7.2026 | 1 | 0 |

Several of these are old files of a text that may have been amended since; the date above is the file's own.

### By law: gazette page added, Wikisource kept

No state consolidated copy found. The gazette is the binding wording of what it amends, but it does not give the current whole.

| Law | Gazette + Wikisource | Left or not placed |
|---|---:|---|
| Provident Funds Law (33 gazettes; original `4ddf9eb6d8ab3b5f`) | 14 | 10 in tax files, 1 not placed |
| Provident regulations, management fees | 12 | 0 |
| Provident regulations, transfer between funds | 4 | 4 (3 in tax, 1 switching 822) |
| Retirement Age Law | 4 | 1 in tax |
| Financial Services Supervision (Insurance) Law | 5 | 0 |
| JIT regulations: tracking funds, foreign funds, classification, permitted assets, options and short sales, prices, distribution fee | 4, 4, 4, 3, 2, 2, 2 | permitted assets 1 not placed |
| National Insurance regulations, long-term savings for a child | 2 | 2 in tax |
| Financial Services Supervision (Pension Advice, Marketing and Clearing) Law | 3 | 1 (switching 823) |
| Credit Rating Companies Law; Financial Services Supervision (Regulated Financial Services) Law; provident regulations, direct expenses | 2, 2, 2 | 0 |
| Provident regulations, payments to a fund; Economic Efficiency Law 2017-2018; Income Tax rules, exemption on transfers between funds | 1, 1, 1 | 0 |

### By law: no state copy read

| Law | Citations | Why |
|---|---:|---|
| JIT regulations, a fund's annual report (ק"ת 7646) | 5 | No link known for the booklet. The rule base also has an olaw.org.il scan |
| Securities regulations, manner of offering to the public (ק"ת 6574, 6674, 6794, 7564, 7667) | 2 | Same |
| Provident regulations, locating members and beneficiaries (ק"ת 7083) | 2 | Same |
| Income Tax regulations, tax on payments to an unapproved fund (ק"ת 1317) | 1 (TXP-18) | Same |
| Provident regulations, personally managed fund; investment rules for institutions | 1, 1 | Gazette page not placed |

**"Not checked" means exactly that here.** These may exist on Reshumot under an address I could not derive by script.

Six gazette pages looked wrong and I dropped them rather than guess: ETF-51 and ETF-53 (s.1), FXD-13 (s.12(ב)), IRA-11 (s.1), MF-14 and MF-43 (s.1). Two section marks have no file page: CORP-09 s.35יב16 (s.35יב17 is p.53) and FXD-01 s.22 (s.22א is p.17). They read as the whole-range citation.

## The word comparison: what it did and did not cover

It was **not** a word-by-word comparison of whole laws, and not every section. It was:

- Each cited section against the state copy by a word-bag score per section (`tools/locate.py`, `tools/bagpages.py`). A word-bag catches missing and added words and numbers, but **not a changed word order**, and not a number moved to a neighbouring clause.
- 203 Hebrew quotes in records now pointing at state copies, against those copies. 59 flagged at first, 20 after searching all state copies. I read all 20: each comes from another source in the same record (a guide, a company document, the 1977 VAT order) or is a tag. None shows a law's wording differing.
- A hand spot-check of a sample of section pages: National Insurance s.74ב p.50, Ordinance s.88 p.89, JIT distribution fee regulations s.5 p.3.

Results, none changing a rule:

| Law | Result |
|---|---|
| Investment Advice Law | All cited sections score at least .91 |
| JIT Law | The Authority's copy lacks only amendments starting 2.2.2027, in gazettes 25_lsr_12224370 and `46c45ef0199b5fbb` |
| Investment Advice equity regulations 2, 4; capital gains calculation regulations; filing regulations 6א; National Insurance s.73; banking disclosure rules 7, 12; Licensing s.13 | No word only in Wikisource |
| Licensing s.22 | One word |
| Income Tax Ordinance s.64א2-5, 8-11 (real estate funds) | 98% to 100% |
| Income Tax Ordinance | Figures differ in form, see below |

**Gazette-only laws were not compared as whole text**: a gazette holds the amendment, not the consolidated section, so a page was placed but the current wording rests on Wikisource.

The Ordinance figures: Wikisource prints the original figure with an editor's note, the state copy prints the current one. Same amount, different look, for example:

| Ordinance section | Wikisource (`f12e548d07d47e86`) | State copy (`6deb4dc4ee99460c`) |
|---|---|---|
| s.9(5) | 60,120 "נקוב לשנת 2005", 81,960 in 2024-2027 | 81,960, p.18 |
| s.9(7א) retirement | 3,900 "נקוב לשנת 1990", 13,750 in 2024-2027 | 13,750, p.19 |
| s.9(7א) death | 7,800 "נקוב לשנת 1990", 27,520 in 2024-2027 | 27,520, p.20 |

Any rule that quotes the older number from Wikisource should say so; none I read does.

## Open questions closed or changed

- `reits-and-gold-funds.md` OQ1 closed: the National Insurance Institute's Ordinance copy of 21.6.2026 carries Amendment 285, "מקרקעין בהקמה", `6deb4dc4ee99460c` pp.58-60.
- `regulators-and-protection.md` OQ20 closed: a word search of the Bank of Israel's copy of 14.1.2025 and the 2026 amendment.
- `mutual-funds-and-money-market-funds.md` OQ12 narrowed to the regulations: s.5(א)(3) read at ס"ח 3579, 2.8.2026, file p.8, s.4, six months.
- `corporate-bonds.md` OQ2 extended with the trustee wording above. Added to an existing question because `packages/pipeline/test/validate.test.ts` hard-codes the number of open questions at 502.
- `data/open-questions.json` may be behind for the first two. The validator only warns. Not edited.

## For the tax specialist

Only citation mechanics were changed in the tax files: links moved where words and section were the same, tags, duplicate links removed, old "PDF p.N" locators dropped. No meaning was edited. For the list below, please decide.

| Rule | Finding | Library id, page, quote |
|---|---|---|
| TXG-34 | State copy too old, see the top | `015b869b6f7ccff7`, `13c03146a97afb79` p.1 |
| TX2-17 | s.4(ב) now read on a state copy; I removed the note that it could not be | `18e1d21d2093d67f` p.4, "יוטל מס שכר וריווח באחוזים מהשכר ששילם והריווח שהפיק" |
| TXK-15 | Rests on a Wikisource editor's tag, not on law text: "בג״ץ 10042/16 – החזרת פרק י״ב לוועדות הכנסת" | `tax-gemel-lehashkaa-ira-child.md` line 162. Not read on a state copy |
| TXA-20 | "editor's note gives 5,306 for 2026" rests on a Wikisource editor's note | `tax-insurance-and-amendment-190.md` line 185 |
| TXI-08, TXI-13 | Read the header and amendment list of the mirror, so they stay on it. The state copies are old: `2d313d18dfed9653` 3.1.2018, `351dbb86615f9e87` 31.5.2012 | |
| Sources rows | Ordinance s.101א(13) is in Wikisource only, absent from `6deb4dc4ee99460c` p.100 and from the Tax Authority's copy. It appears only in Sources rows, no rule rests on it | |
| Index definitions | Ordinance s.120א "מדד" definitions now placed | `6deb4dc4ee99460c` p.118 |
| Stale method notes | Say Wikisource was used; not edited | `tax-hishtalmut` 7, 148, 191, 265; `tax-insurance` 7, 43, 52; `tax-interest` 8, 95, 143, 334; `tax-pension` 7, 328, 332, 339; `tax-securities-foreign` 7; `tax-securities-israeli` 7, 315; `tax-tier2` 8, 37, 178, 238 |
| Gazette-only, left | No gazette links added to tax files without your check | TXK-12, TXK-16, TXK-24; `tax-gemel` Sources 343, 344, 345, 347; `tax-hishtalmut` 293, 296; TXA-12, 15, 20, 21, 24; `tax-insurance` 352; TXP-18; `tax-pension` 367; `tax-securities-israeli` 351 |

Three rules carry a "First read on Wikisource, unofficial" link on purpose: TX2-17, TXG-17, TXK-26. The validator requires every source URL in `data/rules/` to appear in the rule's markdown block, and those three data files still name Wikisource. The links can go when the data files change.

## `data/` still holds Wikisource links

Not edited: the brief for this issue does not name `data/`. Moving them is the same mechanical change; the citation record has the new link for each.

- `data/rules/`, 22 files: bank-07, etf-06, etf-09, etf-10, etf-51, etf-53, etf-54, ira-01, ira-03, ira-09, ira-11, mf-11, mf-21, pen-08, sw-17, tx2-17, txg-17, txi-08, txi-13, txk-16, txk-26, txp-18.
- `data/terms/`, 96 files. `data/instruments/`, 16 files. `data/sources/publishers.json`.

Until they follow, the site's rule cards show the older Wikisource source on these records.

## Left out

- Nevo citations (`brokerage-account` 608, `government-bonds-and-makam` 316-320, `provident-family-common` 504-509, `switching-and-transfers` 367, 581, 754, 783, `keren-hishtalmut` 75, 459-465, `ira-self-directed` 45, 84, 225, 457, 458, `child-savings` 186, some tax rows). Issue 84 is about Wikisource, and Nevo is a commercial database with the same weakness: **worth the same treatment later**.
- Historic "Tried: Wikisource" notes in open questions, kept as a record of what was tried.
- `coverage.md` and `README.md` belong to the lead. `coverage.md` lines 17 and 214 still describe Wikisource use.

## Library

- Filed: `a0e3d14c85e5510e` (Securities Law Amendment 9, 1988), `5b5a4f5ba675115f` (Authority decision 1085). Notes added on those two and on `88bee84ad057fb9d`.
- Older copies superseded by the above, no longer to be used for current wording: `68167bf67ec99834`, `1a220c6520f44c71`, `e9fea2ac1bf607a4`.
- Four empty searches logged in `tried.jsonl`.
- Nothing was blocked tonight, and nothing was added to `chrome-list.md`. The four laws "not read" above failed for want of an address, not because a site refused.

## Left to finish issue 84

1. **For the founder, plain words:** nothing to decide tonight. If you know whether the regulations on bond trustees were ever made, that closes the first finding; otherwise it stays open, and it only affects the corporate bonds guide.
2. **A state consolidated copy of the Provident Funds Law and its regulations** is the largest gap: 52 citations rest on Wikisource for the current wording, with gazette pages beside most. None was found by script. A look in Chrome at the Capital Market Authority's site may find one.
3. **The booklets without a link** (table above): find them on Reshumot.
4. **`data/rules`, `data/terms`, `data/instruments`:** move the links when the issue's scope allows. This also clears the three "first read" links.
5. **The tax specialist's list** above.
6. **Issue text:** "48 of 49 found" is out of date; the lead may want to replace the resume line with this file.

Job 8 (exact places for values in `data/fees/`, issue 19) can reuse `tools/locate.py` and the `#page=` pattern.
