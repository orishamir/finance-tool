# Scope pass applied to the rule base (2026-10-25)

Editor: the rule-base editor (lead), on branch `rules-scope`, with seven workers that each owned one set of rule-base files. Inputs: the three findings files of this folder (`provident.md`, `pension.md`, `markets.md`), the sweep's step 0 (`research/discovery/2026-10-25-institution-rules-sweep.md` section 5), and, added the same evening, the tax-bases follow-up (`tax-bases.md`). Founder's rules: CLAUDE.md "General sources first; a company's term is never general" and D30 (`docs/product.md`).

## Summary

- **Every verdict of the three files is applied**, plus the tax-bases follow-up: about 125 records reviewed, 183 rule records changed (`data/rules/`), 188 rule-base blocks carry a Scope line.
- **Scope lines**: 104 `general`, 73 `institution: …`, 11 `unsettled: …`. Format and meaning are documented in `references/README.md` ("The Scope line"); every line was checked against the strict form and its place (directly after `- Source:`) by script.
- **60 new records**, each split from a mixed record: the general part kept its id (product pages cite it) and the company part took the next free id of its prefix. Every new record has a `data/rules/` record, so no content left the site.
- **Errors fixed**: CS-26 and CS-07 (circular 2022-9-29), PEN-13 (the orphans' share), PEN-09 (4 × 13,769 = 55,076), IRA-05 (Meitav's wording is not the rule), ETF-20 (units are not in shekels by rule), TXK-07 (first to mixed, then general by the tax-bases research), CS-18 (0.23% is not a cap; the cap is 1.05% and 4%), KGL-16 (5 years, not 2), KH-04, KH-05, KH-19, ETF-09, ETF-12, ETF-29, TXS-15, REG-16, BANK-25, BRK-24, BRK-27, SW-35, SW-36, PEN-17, PEN-33, IRA-02, IRA-08, TXH-11, TXK-06, TXA-03, TXA-05, TXA-08, TXA-28. Details per record below.
- **Sources** regenerated with `npm run extract:sources -w @finance-tool/pipeline` (577 records, all with sources, none unresolved); no `sources` field was edited by hand.
- **Data and site text** that showed a company's term as general: fixed (section "Data and site text").
- **Checks**: `npm run validate` (valid; warnings only, below), `npx vitest run site packages/engine packages/pipeline` (906 passed, 1 todo), `npm run typecheck` (clean), `npm run build` (pre-render clean).

## The Scope line

One line, directly after `- Source:`, in exactly one of three forms (README "The Scope line"):

```
- Scope: general
- Scope: institution: <Name>[, <Name>...]
- Scope: unsettled: <what would settle it>[; seen at: <Name>[, <Name>...]]
```

Names are the companies' short English names (as in `data/sources/publishers.json` where present); a broker owned by a manager is named apart ("Altshuler Shaham Trade", "Meitav Trade"). One record has one scope: a record that joined a general rule with a company's term was split; a positive claim that rests only on company documents and has no general source became its own `unsettled` record, with what was searched in its conditions. An open question inside a general record ("not found") stays there, since it asserts nothing. Records not reviewed in this pass have no Scope line; the sweep treats them as general until reviewed.

How it was applied: the lead wrote the README section and did the pilot (KH-16 / KH-27); seven workers applied the verdicts file by file (KH/TXH/TXK; KGL/PF; SW; PEN/TX2; CS/IRA; BANK/BPN/BRK/MF/REG/TXA; ETF/TXS/CAT) with a per-id copy of the extractor so they never rewrote each other's records; the lead then ran the full extraction, checked every Scope line, applied the tax-bases follow-up and did the data and site changes and the test updates.

## New ids

| Id | Holds | Scope |
|---|---|---|
| KH-27 | Altshuler Shaham's withdrawal documents, payment channel, identity check | institution: Altshuler Shaham |
| KH-28 | Harel's bylaw rates (2.5% employee; 5% or 7.5% employer) | institution: Harel |
| KH-29 | Altshuler Shaham's self-employed deposits (money only, channels, 2026 cut-off) | institution: Altshuler Shaham |
| KH-30 | Harel's retroactive joining | institution: Harel |
| KH-31 | Both read managers chose the general track as default | institution: Altshuler Shaham, Harel |
| KH-32 | Loans may be offered; Altshuler Shaham's loan handling | institution: Altshuler Shaham, Harel |
| KGL-25 | Altshuler Shaham's 2026 year-end cut-offs | institution: Altshuler Shaham |
| KGL-26 | Opening an account, also in another's name (Meitav's "מתנה בלתי חוזרת") | institution: Altshuler Shaham, Meitav, Hebrew University provident fund |
| KGL-27 | A minor's withdrawal paid to the parent-guardian | unsettled (the CMA joining circular); seen at Altshuler Shaham, Meitav |
| KGL-28 | 10-business-day withdrawal report; higher amount after a delay | unsettled (those clauses in the CMA standard bylaw); seen at Altshuler Shaham, Infinity, Yachad Rofim |
| KGL-29 | The default is the general track at the managers read | institution: Altshuler Shaham, Infinity, Yachad Rofim, Hebrew University provident fund, Meitav |
| KGL-30 | Two-year discount and a raise without notice (out-of-date bylaws) | institution: Altshuler Shaham, Infinity |
| PF-40 | Timing and valuation of a kupat gemel lehashkaa track switch | institution: Altshuler Shaham, The Phoenix |
| SW-45 | The Phoenix takes the transfer request online | institution: The Phoenix |
| SW-46 | The Phoenix's 10-day cancellation window and retention mailbox | institution: The Phoenix |
| SW-47 | The Phoenix confirms within 14 business days | institution: The Phoenix |
| SW-48 | The Phoenix sends the joining confirmation to the employer | institution: The Phoenix |
| SW-49 | Mizrahi Tefahot's distribution fees; The Phoenix's offer routing | institution: Mizrahi Tefahot Bank, The Phoenix |
| SW-50 | Leumi's and Mizrahi Tefahot's clearing-house report | institution: Bank Leumi, Mizrahi Tefahot Bank |
| SW-51 | Meitav Trade's in-IRA transfer-out fees | institution: Meitav Trade |
| SW-52 | The supervised price to move securities out of a bank, as tariffs and the press state it | unsettled (the BoI price-supervision order); seen at Discount Bank, Meitav Trade |
| SW-53 | IBI's and Altshuler Shaham Trade's transfer prices | institution: IBI, Altshuler Shaham Trade |
| SW-54 | How Leumi, Meitav Trade and Altshuler Shaham Trade describe moving a portfolio | institution: Bank Leumi, Meitav Trade, Altshuler Shaham Trade |
| SW-55 | Moving securities between one's own accounts described as no tax event | unsettled (a Tax Authority instruction to TASE members); seen at Altshuler Shaham Trade, Meitav Trade |
| PEN-37 | The 12.5% insured-salary floor in current bylaws | unsettled; seen at Mor, Harel, Altshuler Shaham, Meitav |
| PEN-38 | Mor's general-fund determining-salary cap (4 × average wage; 55,076) | institution: Mor |
| PEN-39 | Mor's eighth insurance track and the optional combinations | institution: Mor |
| PEN-40 | Survivors' share with several orphans (30% each in the CMA text, 40% shared in 2025 bylaws) | unsettled; seen at Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim |
| PEN-41 | Mor's investment-track menu | institution: Mor |
| PEN-42 | Mor's alternative fee mixes | institution: Mor |
| PEN-43 | Mor: its provident fund has no insurance cover | institution: Mor |
| PEN-44 | Loan limits in a provident fund | unsettled; seen at Mor |
| CS-28 | Bank Yahav's rate-setting and exit stations | institution: Bank Yahav |
| CS-29 | Withdrawing child savings from Leumi (3 business days) and Yahav (NIS 100 minimum) | institution: Bank Leumi, Bank Yahav |
| CS-30 | The after-21 fee Harel and Altshuler Shaham charge (0.23%; Harel 0% of deposits); Yahav's fee-free shadow account | institution: Harel, Altshuler Shaham, Bank Yahav |
| IRA-29 | Meitav's own IRA practices, merged from six records | institution: Meitav |
| BANK-33 | Discount's and Yahav's break terms | institution: Discount Bank, Bank Yahav |
| BANK-34 | Prime as the anchor at Leumi, Hapoalim and Yahav, each with its own definition | institution: Bank Leumi, Bank Hapoalim, Bank Yahav |
| BRK-46 | Interactive Israel's and Bank Yahav's own 49A permit statements (from BRK-06) | institution: Interactive Israel, Bank Yahav |
| BRK-47 | Leumi's custody terms: pooling, equivalent securities, liens, broker liability (from BRK-10) | institution: Bank Leumi |
| BRK-48 | Extra fee lines of four non-bank tariffs; Excellence's "may charge less" (from BRK-24) | institution: IBI, Excellence, Altshuler Shaham Trade, Psagot |
| BRK-49 | Interest-on-credit-balance lines in three tariffs (from BRK-25) | institution: IBI, Excellence, Fair |
| BRK-50 | How Interactive Brokers collects the W-8 and what it withholds (from BRK-45) | institution: Interactive Brokers, Interactive Israel |
| MF-56 | Leumi's, IBI's and Meitav's commissions and custody on fund units (from MF-27) | institution: Bank Leumi, IBI, Meitav |
| ETF-55 to ETF-66 | The funds' own figures, wordings and reports split from ETF-04, 06, 09, 10, 11, 13, 20, 28, 52, 53, 54; ETF-61 is the "סל"/"מחקה" name marks | institution (named per record); ETF-61 unsettled (the ISA directive on fund names) |
| TXS-25 | Migdal's and Yalin Lapidot's list of foreign-tax situations | institution: Migdal Mutual Funds, Yalin Lapidot |
| TX2-21 | Reit 1's withholding statement and 2012 example | institution: Reit 1 |
| TXK-26 | The withholding rate on a kupat gemel lehashkaa lump sum (Harel 25%; reg. 3(א) text 20%) | unsettled (reg. 3 as in force today, or a Tax Authority instruction); seen at Harel |
| TXA-29 | The Phoenix's year-end notional redemption, March certificate and the s.125D figures it prints | institution: The Phoenix |

The workers' sections below give each new record's content in full.

## Per record: the lead's records

### KH-16: mixed → split (the pilot)
- Scope: general (KH-16); institution: Altshuler Shaham (KH-27)
- Sources: added 1964 Income Tax Rules (NII consolidated copy) reg. 41יא(א) and 41ח(א1)(2); Altshuler Shaham's withdrawal form moved to KH-27, whose Source line ends "The timetable: KH-16."
- Text: the rule is the regulation's timetable (4 business days from the request reaching the fund; deferral to the 4th business day of the month; monthly payments; loans deducted; late interest); text_he rewritten without a company name.
- JSON: strength institution → primary; `payout_business_days` re-sourced to reg. 41יא(א), "fixed in regulation"; figure name no longer says "(אלטשולר שחם)". KH-27 new.
- Open questions: KH-OQ16 answered (by w1, in the file).

### TXK-07: unsettled (w1) → general, with the withholding rate split off (tax-bases research)
- Scope: general (TXK-07); unsettled (TXK-26): reg. 3 as in force today in Reshumot, or a Tax Authority instruction to managing companies; seen at Harel
- Sources: TXK-07 now cites the Tax Authority's consolidated Ordinance s.3(ה4)(3) (p.21), s.9(13) (p.41) and s.125ג(ה) (p.204); Amendment 190 (ספר החוקים 2354) s.4(2), which deleted s.9(13)'s provident-account sentence from 1.1.2012, and s.12(א); Amendment 147 (ספר החוקים 2023) s.3(3), the deleted sentence, as history; the explanatory notes of the 2016 Amendment 15 bill ("25% מהרווח הריאלי"), the 2005 Amendment 147 bill and the 2012 Amendment 189/190 bill; the 2005 withholding regulations reg. 1 (who withholds; exempt linkage outside the base). Dropped: the Tax Authority's 2025 guide row 9(13) (it prints the pre-2012 text), Harel's flyer and Bizportal (Harel moved to TXK-26 for the withholding sentence only).
- Text: the inflation part is exempt linkage income; the rest is taxed at up to 25% as the top slice; the legislator called it 25% of the real gain; the manager withholds, at a rate not settled. Corrected: the record said the exempting provision was not found and the 25% rested on a manager.
- JSON: strength institution → primary; `rate` re-sourced to s.125ג(ב) with the 2016 notes in its title, "fixed in law"; figure name "שיעור המס המרבי על הרווח הריאלי". TXK-26 new with two figures: the regulation's text rate (20%, primary) and Harel's stated rate (25%, institution); no code reads them.
- Effect: the engine's TXK-07 label "institution-source" is gone (two tests updated, below); the kupat gemel lehashkaa wrapper's `tax_at_exit.labels` "institution source: base (TXK-07)" removed; the guide's "בסיס המס: לפי החברה" tag no longer shows; the provident batch's "Needs the founder" item 1 is moot for the base and rate (only the withholding sentence stays a company statement, and it does not change the computed tax).
- Open questions: TXK-OQ2 answered; TXK-OQ3 narrowed (the regulation is found and says 20%); the TXK file Summary line "the exact legal route … was not confirmed" replaced.

### TXK-06: general (tax-bases knock-on)
- Scope: general
- Sources: added the 2016 Amendment 15 bill's explanatory note (p.875).
- Text: "no official source says whether 25% real or 15% nominal" replaced: the 15% limb does not reach these gains (linkage carved out and exempt; the notes say 25% of the real gain). text_he and both figure notes updated; `nominal_rate` stays as F-44's sensitivity line (see "Needs the founder").

### TXH-11: general (w1), plus the tax-bases sweep
- The 2025 guide's s.9(13) row (pre-2012 text) is no longer cited; s.9(13) (Tax Authority text p.41) and Amendment 190 s.4(2) were added. Conditions, text_he and the `real_base` notes now say the real base fits the law: s.3(ה4)(1) makes the linkage part linkage income, exempt under s.9(13) since 2012.

### TXA-28: kept whole as institution (w6) → split: general + The Phoenix (tax-bases research)
- Scope: general (TXA-28); institution: The Phoenix (TXA-29)
- Sources: TXA-28 now cites the Ordinance s.3(ה5) and s.9(13) (Tax Authority text), Amendment 147 s.2(4), the 2005 bill's notes ("מרכיב הפרשי ההצמדה ברווחים אלה זכאי לפטור ממס … לפי סעיף 9(13)"), and the Ministry of Finance team's interim report of February 2025 p.16 (an official description of current law, not law). Clal's page is no longer cited: its sentences restate the law. The Phoenix's FAQ moved to TXA-29.
- Text: policy gains are taxed only when received, only on the gain above linkage on the payments, at up to 25%; a track switch inside the insurer is not a tax event; moving to another insurer is a taxable withdrawal. What stays open: whether 15% can reach a policy that is not profit-sharing.
- JSON: strength institution → primary; the four s.125D figures (The Phoenix's prints) moved to TXA-29 with their Hebrew names. TXA-29 new.
- Code: `site/app/lib/graduation.server.ts` no longer flags TXA-28 as an insurer's answer to TXA OQ1 (the base is the law's now); its comment points to TX2-21; `graduation.test.ts` updated with a why line.

### TXA-03, TXA-05, TXA-08 (rule base only; no data/rules records)
- TXA-03: re-sourced to the Tax Authority's consolidated Ordinance (s.3(ה5), s.9(13)); the conditions now say the s.9(13) exclusion never reached a policy and was deleted in 2012; Scope general.
- TXA-05: retitled; the base is the law's; two texts point to 25% (reg. 5(א); the pre-2006 s.125C(c)); 15% open only for a policy that is not profit-sharing; the investment house's article is no longer cited; the 2005 bill's note added; Scope general.
- TXA-08: the track-switch and inter-insurer rules now rest on the Ministry of Finance team's report (p.16); the article is no longer cited; Scope general.
- Open questions (tax-insurance file): OQ1 narrowed to the rate; OQ3 answered (moving insurer is a taxable withdrawal). The savings-policy graduation status (`savings-policies-and-executive-insurance.md`) notes the narrowing.

### KH-18 (w1's record): the lead's follow-up
- After the pass KH-18 was primary and its card also said "a switch is not a tax event", so the questions-page search for "האם אפשר להחליף מסלול בלי מס" ranked it above TXH-17, the tax rule (search test case 6). The tax sentence was left to TXH-17 and KH-18's Hebrew title now names what it is about ("מעבר בין מסלולים בתוך הקרן: מתי ואיך הכסף עובר").

## Data and site text (sweep step 0, with the general sources in hand)

- **Child savings in a provident fund, fee caps** (`data/instruments/wrappers/child-savings-provident.json`): `fee_caps.balance` 1.05% a year and a new `fee_caps.deposit` 4% (with `deposit` added to `fee_bases_allowed`), both from the fee regulations reg. 2(א)(1)-(2) (Reshumot), rule ids CS-18 and PF-02; notes say NII bears the cost until 21 and each manager sets its own rate (CS-30). The page's "אלה התקרות שבחוק" is now true. Harel's and Altshuler Shaham's 0.23% appear only in a sentence that names them (`site/app/content/guide/child-savings-provident.tsx`, "use" block, reading `CS-30.fee_after_21`).
- **Payout days** (`lawful_exit.payout_business_days`): study fund (KH-16), kupat gemel lehashkaa (KGL-08), comprehensive and general pension and provident fund for annuity (PEN-33), child savings in a provident fund (CS-14): all sourced to the 1964 Income Tax Rules reg. 41יא(א), primary, "fixed in regulation", general. Child savings in a bank: 3 days stays Bank Leumi's, cited to CS-29 (institution: Bank Leumi). The guide now names it: `site/app/routes/guide.tsx` shows a line "כך אצל בנק לאומי; אצל האחרים לא נבדק" under a payout time whose value and rule are a company's (new copy key `guideBlocks.exit.onlyAt`, recorded in `docs/copy.md`; the name is the value's own source's `publisher_he`).
- **Exit-fee row** (`site/app/routes/guide.tsx`): "no exit fee" cites PF-01 only and takes its tag from PF-01; it no longer borrows the payout rule's ids or strength.
- **Ceilings** (rule 1, same class): the kupat gemel lehashkaa ceiling now cites the CBS linkage calculator (KGL-03), the comprehensive-pension monthly ceiling the 1964 rules (PEN-08), and both IRA caps the 2017 IRA regulations (IRA-08), instead of Harel's and Meitav's prints.
- **Pinned lists** (`data/parameters/pinned-rules.json`, only `guide_blocks` and P-09 rows): every id in a block or row is either scope general or an unreviewed primary record (checked by script). The bank child-savings block shows CS-10 (the bank route's tracks and exit stations) instead of CS-18, whose first figure is the provident route's NII payment. Questions-page rows: the ceiling row says the amount is "לפי מחשבון ההצמדה של הלשכה המרכזית לסטטיסטיקה" (was "לפי פרסומי החברות"); the study-fund row's company clause became the law's ("והפקדות חדשות הולכות לחשבון אחר עם מועד תשלום ראשון משלו"). KH-15, PEN-15, PEN-23, CS-18, BANK-06 and IRA-17 stay in their blocks because they are general now.
- **Guide prose** (`site/app/content/guide/`):
  - study fund: "בדרך כלל 7.5% … 2.5%" became the rates of the employment agreement with the tax-benefited limits (KH-04 now the law's maxima); the risks line on new deposits after a withdrawal follows KH-15.
  - child savings (provident): the default-track sentence follows circular 2022-9-29 via CS-26 (three risk tracks; increased-risk default; each manager sets the equity share with the Commissioner's approval); CS-09 (Harel's band) is no longer cited there.
  - government bond, makam, brokerage account: the bank-custody sentence now states the Supervisor of Banks' rule (BRK-10: register and separate client assets so they can be identified, independent audit at least once a year), with BRK-13 for the nominee company; "לפי תנאי החשבון" and "מופרדים בספרי הבנק" (Leumi's contract, now BRK-47) are gone; BRK-35 left the brokerage rules line (its content is not stated there).
  - savings plan: "בבנק אחד" names Bank Hapoalim (BPN-10), and its second mention too; prime is named as the anchor only at Leumi, Hapoalim and Yahav (BANK-34) on the savings-plan and bank-deposit pages.
  - comprehensive pension: actuarial balancing is quarterly for demographic factors, and the return part reaches pensioners only (PEN-19, from the CMA standard bylaw).
  - units in shekels: w7 found no site text stating it as a rule (copy lines name one fund each).
- **Exposure pages** (`site/app/content/exposure/`): the general track's rules line cites KH-19 (the two lawful study-fund defaults) instead of the unsettled CAT-23; the cash and unlinked-bond pages name Meitav's bylaw wording for what the "כספי (שקלי)" track holds (CAT-23 is unsettled); BRK-23 (Leumi's FX terms) left the S&P 500 rules line.
- **Glossary** (`data/terms/`, its generator inputs `research/glossary/terms/` and `docs/glossary.md`, kept in step): "מתנה בלתי חוזרת" says it is Meitav's wording and cites KGL-26; "ארכת ביטוח" cites the CMA standard pension bylaw s.36(א) (PEN-16) instead of Mor's bylaws; "מסלול כללי" no longer says it is "usually the default" (the two lawful study-fund defaults; each kupat gemel lehashkaa sets its own).
- **G-02 copy and method** (tax-bases): `site/app/copy.ts` and `docs/copy.md` key `flags.G-02` no longer say the law is silent on the real base; `docs/method.md` F-44 and the G-02 row describe the base as the law's and keep the 15%-nominal sensitivity line pending the founder.
- **Shelves** (`site/app/lib/rule-shelves.ts`): SW-52 and SW-53 "costs", SW-55 "state", CS-30 "costs", as their parents.
- **Stale pointers**: `coverage.md` and `reits-and-gold-funds.md` point to TX2-21 for Reit 1's practice.
- **Skill instructions** (`SKILL.md`): rule count (937), a paragraph on this pass and the new ids, and a "respect scope" step.
- **Sources table**: `data/sources/publishers.json` gained olaw.org.il (Reshumot copies), esma.europa.eu and amf-france.org.

## Tests updated (each with a why line)

- `packages/engine/test/golden/golden.test.ts` S25: `labelOf(r, "TXH-11")` → `toBeUndefined()` (TXH-11's real base now cites the Chief Economist paper; the researchers named S25).
- `packages/engine/test/golden/r2-pension.test.ts` S25 employer line: same, for TXH-11.
- `packages/engine/test/golden/r2-pension.test.ts` S27: `labelOf(r, "PEN-15")` → `toBeUndefined()` (PEN-15 rests on the CMA standard pension bylaw and the Codex).
- `packages/engine/test/golden/golden.test.ts` S20: `labelOf(r, "TXK-07")` → `toBeUndefined()` (tax-bases research). The golden values are unchanged.
- `packages/engine/test/properties.test.ts`: the resolver's institution-label example is now CS-30's `fee_after_21` (TXK-07 is primary).
- `site/app/lib/graduation.test.ts`: TXA OQ1 has no insurer answer now.
- `site/app/lib/playbook.test.ts` (w3): the confirm step's figures and the brokerage step's strengths follow the split Phoenix and broker records; a new test checks that named company records follow a step's rules without setting its chip.
- No golden value changed.

## Validator warnings left (none is a failure)

- "source checked later than the rule's checked": 950, a long-standing pattern across untouched records (every touched record has `checked` 2026-10-25).
- "first source lacks publisher_he or title_he": 21, among them BRK-41 to BRK-44 and BRK-50 (English broker pages), KGL-04 (the CMA standard bylaw for kupat gemel lehashkaa is titled in English because its Hebrew title was not quoted), ETF-28, ETF-29, ETF-53, ETF-64. A `data/sources/documents.json` entry per document would clear them once the Hebrew titles are read.
- "rule strength differs from its strongest source": TXK-26 and PEN-40 (unsettled records whose primary source contradicts or differs from the companies' claim, so they stay at institution strength on purpose), plus MKT-01, SW-20, TXK-23 (untouched).
- "figures are behind the current tax year": TX2-21 (Reit 1's 2012 example, moved from TX2-20).

## Left as is, and why

- **CAT-09, CAT-17, CAT-24** (sweep 2.3: a Meitav or Harel example inside a primary record): in no batch's list, untouched.
- **The 63 primary records that list a company document beside the general rule** (sweep 2.3, last paragraph; markets file, closing note): not a verdict on named records, so not done here. A follow-up pass can drop each company source where the general source already carries the sentence.
- **PEN-18 and the pension guide's "PEN OQ8" line**: the open question is answered in the rule base (circular 2022-3-3: the 5.15% target is CPI-linked), but PEN-18 itself was not in a batch and also cites Mor's bylaws for a sentence, so it needs its own review before the guide drops "שאלה פתוחה PEN OQ8".
- **TX2-10** could cite the Tax Authority's text of s.64א5(א) instead of the Wikisource mirror (pension file, TX2-20); not in a batch.
- **PF-16** still says the kupat gemel lehashkaa bylaws "add the exception in PF-14"; that exception now lives in KGL-30 (not a finding).
- **CS-05, CS-08, CS-12, CS-20** carry an Altshuler Shaham or Yahav source or an old annotation; not in a batch. CS-05 and CS-12 sit in the bank child-savings block (both primary-first records).
- **ETF-04**'s dormant-units sentence still rests on IBI's report (the finding ruled only on IBI's no-minimum sentence).
- **IRA-21**'s table lists banks' tariffs under Meitav's scope; **IRA-22** and **SW-51** describe the same Meitav Trade tariff and could point to each other.
- **PEN-37 and PEN-40** cite only Mor's bylaws: the finding names Harel's, Altshuler Shaham's, Meitav's and Menora Mivtachim's 2025 bylaws without links.
- **Harel s.9.18** (track switch postponed when trading is halted, from KH-18): dropped, noted in the study-fund file's "Left out and why". **Discount's price for a transfer to another client** (SW-33): tariff data for a future `data/fees/` snapshot, not carried into the split record.
- **Generic places that still cite company records by id only**: the brokerage-account wrapper (`fee_caps.fx` BRK-23, `fee_caps.fixed_period` and `eligibility` BRK-28, `protection` BRK-35 and REG-26), both money-market wrappers (`eligibility` BRK-28), and the index exposures' `rule_ids` (ETF-19, ETF-27, ETF-30, BRK-23). They feed the "מה נבדק" checklist and rule chips, not a sentence; removing them means regenerating the dimension marks, and the sweep rated them low. Left for the schema step (the validator's scope gate will list them).
- **Sweep step 0 item 6** (name the institution in the timeline's terms, the cash-rate hint, the comparison's deposit chip and the idle-cash baseline): not in this task; those files are components and lib code owned by other builders.
- **Computed values**: PEN-08's monthly ceiling and IRA-08's cap and determining amount are computations under the regulations from primary inputs; they stay `state: "sourced"`, sourced to the regulation with the computation in the source title and notes, because the schema's computed state needs a `docs/method.md` formula id. A method formula would let them carry the computed state.
- **Publisher of broker sources**: `publishers.json` maps as-invest.co.il to "Altshuler Shaham" and meitav.co.il to "Meitav", so SW-51 to SW-55 show the managers as publisher while their Scope lines name the brokers.
- **The 15%-of-nominal sensitivity line** (F-44, G-02) still shows on the kupat gemel lehashkaa guide and in the comparison: removing it is an engine and component change and a founder decision (below).

## Needs the founder

1. **Kupat gemel lehashkaa exit tax**: the base is now the law's (25% of the real gain; the tax-bases research). Should the site drop the 15%-of-nominal sensitivity line (G-02) it still shows beside the tax? The withholding rate stays open (TXK-26) and does not change the computed tax.
2. **Opening an account at Interactive Brokers directly**: the Securities Authority's Q&A (13.1.2025, question 5) says the law lets a person approach a foreign broker on his own sole initiative, if that broker does not operate or solicit in Israel. It is recorded in BRK open question 9 only; how the site presents BRK-42 and BRK-43 is the founder's call (markets file, "For the founder").
3. **Savings policies**: the base and the switch rules are settled; The Phoenix's s.125D figures (TXA-29) and the 15% question for a policy that is not profit-sharing (TXA OQ1) still compute only with a decision on institution-strength tax figures (coverage.md F1).
4. **To know**: the Tax Authority's 2025 guide prints a sentence of s.9(13) that was deleted in 2012; the site now follows the statute and cites the guide nowhere for it.

## Per record: the workers' sections

Seven workers applied the verdicts, each in its own rule-base files; their per-record reports follow, lightly cut (their notes to the lead are resolved above or listed under "Left as is"). Two entries were superseded the same evening by the tax-bases research: w1's TXK-07 (unsettled, now general with TXK-26 split off) and w6's TXA-28 (kept whole as institution, now general with TXA-29 split off); the lead's records above give their final state.

### w1-kh: study fund, TXH-11, TXK-07 (scope pass 2026-10-25)

Files: `keren-hishtalmut.md`, `tax-hishtalmut.md`, `tax-gemel-lehashkaa-ira-child.md` and their JSON records. KH-16 and KH-27 are the lead's pilot and were not touched.

Counts: 17 records. 8 general (KH-02, KH-05, KH-07, KH-10, KH-14, KH-15, KH-18, TXH-11), 5 mixed and split, the general part keeping the id (KH-04, KH-08, KH-11, KH-19, KH-21), 3 institution kept whole (KH-09, KH-13, KH-25), 1 unsettled (TXK-07). New ids: KH-28 to KH-32.

#### KH-02: general (2.3 example)
- Scope: general
- Sources: added 1964 rules reg. 19א(א) (p.8) and reg. 1 "עמית-עצמאי" (p.3); dropped Meitav's page and Altshuler Shaham's page
- Text: Meitav's sentence replaced by the rules' rule: an employee with no business income has no route of his own into a study fund; text_he rewritten
- JSON: strength primary (unchanged); checked 2026-10-25
- Open questions: KH-OQ2 answered

#### KH-04: mixed → split
- Scope: general (KH-04); institution: Harel (KH-28)
- Sources: added Ordinance s.3(ה) p.19 and the Chief Economist paper p.5; dropped Altshuler Shaham's bylaws s.5.1, Harel's bylaws (moved to KH-28) and Harel's 2026 table
- Split: KH-28 holds Harel's bylaw rates (2.5% employee, 5% or 7.5% employer), with three figures
- Text: title and rule now say "set by agreement, within the tax-benefited limits"; "common split" removed; "common in practice" stays an open note (KH-OQ3)
- JSON: strength institution → primary; employer_pct re-sourced to Ordinance s.3(ה), employee_pct to the Chief Economist paper p.5, both "fixed in law", keys unchanged; figure names now "התקרה המוטבת להפקדת המעסיק / העובד"
- Open questions: KH-OQ3 annotated (still open)

#### KH-05: general (was C)
- Scope: general
- Sources: added 1964 rules reg. 19(ב2)(1)-(2) (p.8); dropped Altshuler Shaham's Q&A and Meitav's page
- Text: a condition of the fund's tax approval, with the doctors' exception; "institution sources only" removed from the title
- JSON: strength institution → primary
- Open questions: KH-OQ1 answered

#### KH-07: general (2.3 example)
- Scope: general
- Sources: added the Chief Economist paper p.5 note 10 and Ordinance s.3(ה) "בעת ששולמו לקרן"; kept law s.22; dropped Harel's 2026 table; derived_from TXH-03
- Text: "allowed, and taxed", stated from the paper; text_he rewritten

#### KH-08: mixed → split
- Scope: general (KH-08); institution: Altshuler Shaham (KH-29)
- Sources: added 1964 rules reg. 19א(א); dropped Harel's table (TXH-05 and TXH-08 hold the figures); Altshuler Shaham's bylaws and deposit page moved to KH-29
- Split: KH-29 holds Altshuler Shaham's money-only deposits, channels and 2026 cut-off (likely to change yes, recheck 2027-01-01)
- JSON: strength institution → primary; likely_to_change yes → no, recheck_date removed (the cut-off moved to KH-29)

#### KH-09: institution
- Scope: institution: Harel, Altshuler Shaham
- Sources: kept the two bylaws; dropped the Gemel-Net link from the Source line (the fund-name example now points to KH-24); pointer to the general counterparts KH-08 and KH-14
- Text: title names both companies; conditions give the counterparts (rule 19א(א); 1993 regs reg. 1(ב))

#### KH-10: general
- Scope: general
- Sources: added Ordinance s.9(16א)(א) p.43 and 1964 rules reg. 34(ז)(1) p.10; kept the TXH-13 pointer; dropped Altshuler Shaham's bylaws s.9, its form and Harel's bylaws
- Text: the grounds as the Ordinance states them; the form's "כדין / שלא כדין" labels stay in the Terms table, attributed to Altshuler Shaham's form
- JSON: strength institution → primary

#### KH-11: mixed → split
- Scope: general (KH-11); institution: Harel (KH-30)
- Sources: added Ordinance s.9(16א)(ג) p.43; dropped Altshuler Shaham s.1; Harel s.3.1 moved to KH-30
- Split: KH-30 holds Harel's retroactive joining
- JSON: strength institution → primary

#### KH-13: institution
- Scope: institution: Altshuler Shaham, Harel
- Sources: unchanged; pointers to the counterparts KH-10, KH-15, TXH-10
- Text: each sentence names its company; conditions list the general counterparts (s.9(16א)(א), s.9(16א)(ב), s.9(16ב)(א), rule 34(ז)(1))
- Open questions: KH-OQ7 annotated with the search (the 1997 rules still not found)

#### KH-14: general (2.3 example)
- Scope: general
- Sources: kept the 1993 and 1996 regulations; dropped Altshuler Shaham's form and Q&A and Harel's bylaws; derived_from TXH-19
- Text: the "קרן ותיקה / קרן צעירה" wording stays in the Terms table, attributed; the transfer case now cites reg. 3(ב)(1) of the transfer regulations (TXH-19)
- Open questions: KH-OQ6 answered for payment dates (TXH-19)

#### KH-15: general (was C)
- Scope: general
- Sources: added Ordinance s.9(16א)(ב) p.43 and 1964 rules reg. 37(א) p.11; dropped Altshuler Shaham's bylaws s.17 and its form
- Text: the account closes after a withdrawal (one-third study exception); new deposits go to another account with its own first payment date; whether a manager opens it automatically is left as practice, not checked
- JSON: strength institution → primary; title_he "הפקדה אחרי משיכה הולכת לחשבון חדש" (it stays in the study fund's "שווה לדעת" and on the questions page, now with primary sources)
- Open questions: TXH-OQ13 answered generally

#### KH-18: general
- Scope: general
- Sources: added 1964 rules reg. 33ב(א)(1), (3), (ב) p.9, reg. 41יא(א) p.16, reg. 41יז(ג) and 41יז1 p.17; kept law s.23(ב)(2); dropped Altshuler Shaham's bylaws and service page and Harel's bylaws
- Harel s.9.18 (postponing track actions when trading in more than 3% of a track's assets is halted): dropped, recorded under the file's "Left out and why" (too small for its own record)
- JSON: strength institution → primary

#### KH-19: mixed → split
- Scope: general (KH-19); institution: Altshuler Shaham, Harel (KH-31)
- Sources: added CMA circular 2022-9-30 annex s.7(ג) p.6; the two bylaws moved to KH-31
- Split: KH-31 holds Altshuler Shaham's and Harel's choice of the general track
- Text: "the general track or the flexible index-tracking track, as the bylaws set"; the age-based default does not apply to study funds
- JSON: strength institution → primary
- Open questions: KH-OQ10 answered

#### KH-21: mixed → split
- Scope: general (KH-21); institution: Altshuler Shaham, Harel (KH-32)
- Sources: added 1964 rules reg. 7(ב) p.5 and reg. 7(א)(2), 37(ב), 41ח(א1)(2); PF-29 pointer; the bylaws, form and Q&A moved to KH-32; Meitav's loans page dropped (it is about real-estate loans, not fund loans)
- Split: KH-32 holds "loans may be offered" (both bylaws), Altshuler Shaham's loan-repayment section and its bank-branch note
- The unsettled loan terms (10% of assets, 80% of the balance, 7 years in the Analyst and Infinity kupat gemel lehashkaa bylaws) are not a claim of KH-21: recorded as a partial answer on KH-OQ4
- JSON: strength institution → primary; title "Pledges and liens on the fund; loan repayments"

#### KH-25: institution
- Scope: institution: Altshuler Shaham, Harel
- Sources: unchanged; pointer to the counterpart PF-01
- Text: title names both companies; conditions give the counterpart (law s.32(א)(3); 1964 rule 41ח(א1)(3))

#### TXH-11: general (figure moved)
- Scope: general
- Sources: Source line unchanged (it already cited the paper; locator now "p.5, item 3 and note 7"); Mor and Clal removed from the rule text
- JSON: real_base re-sourced to the Chief Economist paper (p.5 item 3 and note 7; p.20), strength primary, update_rule provider-set → fixed in law; rate figure notes corrected (they said the base was not stated)
- Open questions: TXH-OQ1 annotated
- Effect: golden test S25 loses its "institution-source" label (see For the lead)

#### TXK-07: unsettled
- Scope: unsettled: the current withholding regulations (reg. 3), a Tax Authority circular on Amendment 15 or on kupat gemel lehashkaa, or the Tax Authority's reading of the s.9(13) row; seen at: Harel
- Sources: added Ordinance s.3(ה4)(3) p.21; pointers TXK-05 and TXK-06 (they hold the general part: interest-income character and the 25% cap); Harel and Bizportal kept
- Text: names Harel; conditions list what was searched (guide 2025, s.9(13) and s.9(18ב), the NII copy of the 2005 withholding regulations, the paper, web)
- JSON: rule strength and the rate figure and its Harel source unchanged (engine tests pin its "institution-source" label; founder decision pending); title, title_he and text_he name Harel and say no general source was found
- Open questions: TXK-OQ2 and TXK-OQ3 annotated with the search

#### Errors fixed
- TXK-07: downgraded from a general-looking rule ("the managers describe…") to an unsettled record naming Harel.
- KH-04: "common split 2.5% and 7.5%" corrected to the tax-benefited limits; Harel's bylaw rate is no longer presented as the common rate.
- KH-05: "no legal source was found; institution only" corrected: rule 19(ב2)(1) is the source.
- KH-19: "the default is the general track" corrected to the two lawful defaults.
- TXH-11: the rate figure's notes said "The rule base does NOT say the base is the real gain"; corrected.
- KH file summary: "the usual split is 2.5%/7.5%" and "every manager's default is כללי" restated as the law's limits and the circular's two defaults.

#### Code changes (comments only)
- `packages/engine/src/ledgers/employer-line.ts:16`: "KH-04 gives the common 7.5%" → "KH-04 gives the tax-benefited maximum, 7.5%"; line 19: "(TXH-11, institution)" → "(TXH-11)".
- `packages/engine/src/formulas/exit-tax.ts:63`: "(TXH-11, institution base)" → "(TXH-11; the real base is the Chief Economist paper's)".
- `packages/engine/src/ledgers/provident.ts:315`: the TXH-11 comment now names the Chief Economist paper, primary.

#### New ids
- KH-28: Harel's study-fund bylaw rates (2.5% employee; 5% or 7.5% employer), figures employee_pct, employer_pct_low, employer_pct_high. institution: Harel.
- KH-29: Altshuler Shaham's self-employed deposits in money only, its channels and its 2026 year-end cut-off. institution: Altshuler Shaham.
- KH-30: Harel's retroactive joining. institution: Harel.
- KH-31: Altshuler Shaham's and Harel's default is the general track. institution: Altshuler Shaham, Harel.
- KH-32: loans may be offered (both bylaws), Altshuler Shaham's loan-repayment section and bank-branch note. institution: Altshuler Shaham, Harel.

#### Other edits in my files
- KH Terms table: "מועד התשלום הראשון" now cites Ordinance s.9(16א)(ג); "מסלול ברירת מחדל" cites circular 2022-9-30 s.7(ג) and KH-31; "כללי" says one of the two lawful defaults; the deposit-ceiling row cites the paper; loan and pledge rows cite the 1964 rules and KH-32.
- KH "Left out and why": Harel s.9.18.
- Open questions annotated: KH-OQ1, OQ2, OQ10, OQ16 answered; OQ6 answered for payment dates; OQ3, OQ4 (partly), OQ7 annotated; TXH-OQ13 answered, TXH-OQ1 annotated; TXK-OQ2, OQ3 annotated.

#### Left as is and why
- TXK-07's figure, source and strength: kept by instruction (founder decision 1 in the provident file).
- KH-09, KH-13, KH-25: institution verdicts, kept whole (each is wholly the named companies' terms).
- KH-04's `employee_pct` uses the paper's 2.5% of gross salary; the law's own wording (s.9(16א)(ג)) is "up to one third of the employer's payment, or 2.5% of the determining salary" as the researcher quoted it, not opened again here.

### w2-kgl-pf: kupat gemel lehashkaa and the provident family (2026-10-25)

Files: `kupat-gemel-lehashkaa.md`, `provident-family-common.md`, and the JSON records below. Findings applied: the provident batch, plus the pension batch's cross-batch facts (reg. 41יא(א); the CMA standard bylaw for kupat gemel lehashkaa on gov.il, regulation-2829, ss.7.4, 8.2, 12.1-12.2, 20.2, 35.1).

#### KGL-03: general
- Scope: general
- Sources: added Amendment 15 p.2 s.3 (section 22(א)) and the CBS linkage calculator; dropped Harel, Altshuler Shaham, The Phoenix, Meitav and the Hebrew University form. Pointers to KGL-02 (formula) and KGL-24 (CPI check).
- Text: the rule is now the law's NIS 70,000 indexed to the CPI, 83,641.09 per the CBS, shown rounded to 83,641; no regulator notice found, none required. text_he rewritten.
- JSON: strength institution → primary; figure `ceiling` keeps 83641 (tests and search pin it), source → CBS calculator (primary, "cpi-linked 1 jan"); notes say the CBS returns 83,641.09.
- Open questions: KGL-OQ1 annotated (already closed by KGL-24).

#### KGL-04: mixed (unsettled part settled) → split
- Scope: general (KGL-04); institution: Altshuler Shaham (KGL-25)
- Sources: added Amendment 15 s.3 and the CMA standard bylaw s.8.2 ("חברה מנהלת תבדוק עמידה בתקרת ההפקדה במועד הפקדת כספים ... ולא בתום שנת הכספים"); dropped the Altshuler, Infinity and Yachad Rofim bylaws (they repeat the standard text; Harel and Analyst named in conditions).
- Split: KGL-25 holds Altshuler Shaham's 2026 cut-offs (bank transfer 31.12.26 18:30, cheque 28.12.2026 12:00).
- Text: rule = one ceiling per person across all accounts (law) + checked at deposit (standard bylaw). The provident batch had the at-deposit check as unsettled; the pension batch found the CMA standard bylaw, which settles it.
- JSON: strength institution → primary; title, title_he, text_he rewritten; likely_to_change yes → no (recheck_date removed: the cut-offs moved out). KGL-25 new.
- Open questions: KGL-OQ4 partly answered.

#### KGL-06: mixed → split in three
- Scope: general (KGL-06); institution: Altshuler Shaham, Meitav, Hebrew University provident fund (KGL-26); unsettled (KGL-27)
- Sources: KGL-06 now cites 1964 rule 1 ("עמית-עצמאי") and Amendment 15 ss.1, 3, with pointers to KGL-01 and KGL-02; all company sources moved to KGL-26 / KGL-27.
- Split: KGL-26 holds Altshuler's "בכל גיל ובכל סכום", Meitav's "מתנה בלתי חוזרת" and management by the named person, Altshuler bylaws cl. 7.1-7.2, the Hebrew University guardian line. KGL-27 holds the minor's-account claim (paid to the parent-guardian, bylaws cl. 11; Meitav), unsettled, with what was searched (1964 rule 38(א), transfer circular 2017-9-17 s.3(ג)) and what would settle it (the CMA joining circular).
- Text: KGL-06 = who may open one under the law; no age or residence condition (a reading of silence). Terms row "מתנה בלתי חוזרת" now says Meitav's wording (KGL-26).
- JSON: strength institution → primary; title/title_he "Who may open one"/"מי יכול לפתוח קופה"; text_he rewritten. KGL-26, KGL-27 new.
- Open questions: KGL-OQ6 partly answered.

#### KGL-08: mixed → split (KH-16 pattern)
- Scope: general (KGL-08); unsettled (KGL-28)
- Sources: added 1964 rules 41יא(א) and 41יז1 (btl copy) and the CMA standard bylaw ss.12.1-12.2; pointer to PF-01 (no exit fee). Dropped Meitav's product page; the Altshuler, Infinity and Yachad Rofim bylaws moved to KGL-28.
- Split: KGL-28 holds the 10-business-day withdrawal report and the higher-of-two clause: seen only in the three standard bylaws; the CMA standard bylaw was not read for these two clauses, so unsettled (not institution: they are the standard template's wording).
- Text: rule rewritten as the regulation's timetable, monthly payments, late interest; the applicability chain (s.47(א)(2), Ordinance s.1) kept in conditions.
- JSON: strength institution → primary; `payout_business_days` re-sourced to reg. 41יא(א), "fixed in regulation"; text_he rewritten. KGL-28 new.

#### KGL-09: general
- Scope: general
- Sources: unchanged (all primary); pointer TXK-09 added.
- Text: Meitav's "unverified" tax claim replaced by the pointer to TXK-09 (Ordinance s.9א(ב1)). text_he: the Meitav sentence and the outdated "read through a mirror" sentence removed.

#### KGL-10: general
- Scope: general
- Sources: added transfer regs 4, 6 and 6(ג1) (the lines PF-17 and PF-19 cite); dropped Altshuler bylaws cl. 16-19. Pointers PF-17, PF-18, PF-19.
- Text: partial transfer (reg. 5(א)), the reg. 4 bars and the late-transfer remedy now stated from the regulations. text_he rewritten.

#### KGL-11: mixed → split
- Scope: general (KGL-11); institution: Altshuler Shaham, Infinity, Yachad Rofim, Hebrew University provident fund, Meitav (KGL-29)
- Sources: added circular 2022-9-30 s.7(ב) and the CMA standard bylaw s.7.4; pointer PF-24. Company sources moved to KGL-29.
- Split: KGL-29 holds which track each manager chose (general track: Altshuler 7798, Infinity 9638, Yachad Rofim, Hebrew University 12905; Meitav inferred from its Kids page).
- Text/JSON: text_he rewritten (a default must exist; which one is each manager's choice). KGL-29 new.

#### KGL-15: institution (Meitav)
- Scope: institution: Meitav
- Text: title names Meitav; conditions name the general counterparts (PF-02, PF-03, KGL-14 legal maximum; CAT-35 to CAT-37 Gemel-Net; PF-39 CMA average); Source line ends "General counterpart: PF-02, PF-39."
- JSON: title, title_he, text_he (counterpart sentence added). Figure unchanged.

#### KGL-16: mixed → split, with a correction
- Scope: general (KGL-16); institution: Altshuler Shaham, Infinity (KGL-30)
- Sources: circular 2017-9-15 ss.3(א), 3(ב), 4(א), 5(א); bylaws moved to KGL-30.
- Split: KGL-30 holds the two bylaws' two-year clause (cl. 36.1), their two early-raise cases and the raise-without-notice exception (cl. 37.3), named as out of date; the circular governs. KGL-30 also takes PF-13's and PF-14's company sentences (the same clauses), so no separate PF record was made for them.
- Text: the rule now says five years (circular). text_he rewritten.
- JSON: strength institution → primary. KGL-30 new.
- Open questions: KGL-OQ8 answered.

#### PF-03: general
- Scope: general
- Sources: added the CMA standard bylaw s.35.1; dropped The Phoenix FAQ and the Altshuler bylaws. Pointer PF-02.
- Text/JSON: company sentences removed; text_he rewritten ("קריאה של האתר", not "שלנו").

#### PF-04: general
- Scope: general
- Sources: dropped Menora Mivtachim. Text_he's Menora sentence and the figure note's Menora corroboration removed.

#### PF-13: mixed → company part to KGL-30
- Scope: general
- Sources: dropped the Altshuler bylaws (the clause is KGL-30).
- Text: conflict paragraph replaced: the circular covers kupat gemel lehashkaa (s.5(א)); the replaced circular 2012-9-22 set two years; bylaws that keep it are KGL-30. Figure `min_discount_years` kept (engine and the questions page read it); notes updated.
- Open questions: PF-OQ2 answered.

#### PF-14: mixed → Phoenix dropped, Altshuler to KGL-30
- Scope: general
- Sources: added circular s.4(א); dropped Altshuler and The Phoenix; pointer PF-16.
- Text: The Phoenix's sentence was an example (s.3(ב) with the s.4(א) notice: a switch permits a raise, never by itself); Altshuler's cl. 37.3 is KGL-30 (conflicts with the circular). text_he rewritten.

#### PF-23: mixed → split
- Scope: general (PF-23); institution: Altshuler Shaham, The Phoenix (PF-40)
- Sources: added circular 2022-9-30 s.4(ד)(3) (right to switch at any time) and the CMA standard bylaw s.20.2 (three business days for kupat gemel lehashkaa); the Altshuler bylaws and The Phoenix FAQ moved to PF-40.
- Split: PF-40 holds Altshuler's start-of-month deferral and per-track deposits, and The Phoenix's valuation date.
- JSON: figure key `switch_business_days` kept (questions page, general-track.tsx); its notes updated; text_he rewritten. PF-40 new.
- Open questions: PF-OQ11 answered.

#### PF-24: general
- Scope: general
- Sources: circular 2022-9-30 ss.4(ב), 7(ב)-(ג) and the CMA standard bylaw s.7.4; dropped the Altshuler bylaws. Pointers KGL-11, KH-19.
- JSON: strength institution → primary; title drops "(bylaw text)"; text_he rewritten.

#### PF-26: general
- Scope: general
- Sources: circular 2020-9-22 ss.3(א), 4(א), 4(ה) first, law s.35; dropped Altshuler ss.29-32. Pointer PF-33.
- JSON: strength institution → primary; the three figures' update_rule provider-set → "fixed in regulation" (the enum has no circular; notes say so); title_he drops "לפי התקנון"; text_he rewritten from the circular.

#### Errors fixed
- KGL-16: said a discount must last at least two years (from bylaws); the circular sets five years and covers kupat gemel lehashkaa. Summary line of the KGL file and the PF summary fixed the same way.
- KGL-03: said "institution sources only"; now the law's formula over CBS data.
- KGL-08, KGL-04: the 4 business days and the at-deposit check were company-sourced; now regulation and the CMA standard bylaw.
- PF-26: figures marked provider-set although they are the circular's.

#### New ids
- KGL-25: Altshuler Shaham's 2026 year-end cut-offs. institution: Altshuler Shaham.
- KGL-26: opening an account and in another's name (Altshuler, Meitav "מתנה בלתי חוזרת", Hebrew University form). institution: Altshuler Shaham, Meitav, Hebrew University provident fund.
- KGL-27: a minor's account paid to the parent-guardian. unsettled (CMA joining circular); seen at Altshuler Shaham, Meitav.
- KGL-28: 10-business-day withdrawal report and higher-of-two clause. unsettled (read those clauses in the CMA standard bylaw); seen at Altshuler Shaham, Infinity, Yachad Rofim.
- KGL-29: the default is the general track at the managers read. institution: Altshuler Shaham, Infinity, Yachad Rofim, Hebrew University provident fund, Meitav.
- KGL-30: two-year discount and raise without notice (bylaws out of date). institution: Altshuler Shaham, Infinity.
- PF-40: Altshuler's start-of-month deferral and The Phoenix's valuation date for a kupat gemel lehashkaa track switch. institution: Altshuler Shaham, The Phoenix.

#### Code changes
None.

#### Left as is and why
- PF-16 (not in my list) still says "The gemel lehashkaa bylaws repeat the two-month and four-month rule (s. 37.1, 37.2) and add the exception in PF-14": the exception now lives in KGL-30. Not a finding of the three files, so untouched.
- KGL-16 has no figure; the five years is PF-13's figure (the card points there).

### w3-sw: switching-and-transfers.md (scope pass 2026-10-25)

Records: SW-02, SW-06, SW-07, SW-08, SW-09, SW-10, SW-17, SW-18, SW-24, SW-33, SW-34, SW-35, SW-36 (provident and markets findings). New ids SW-45 to SW-55. Every touched block has one `- Scope:` line right after `- Source:`; every touched JSON record has `checked` 2026-10-25 and a rewritten `text_he`; sources regenerated with the per-id extractor.

#### SW-02: mixed (2.3) → split
- Scope: general (SW-02); institution: The Phoenix (SW-45)
- Sources: dropped the Phoenix FAQ (moved to SW-45); the circular 2017-9-17 lines stay
- Split: SW-45 holds The Phoenix's online request form
- Text: the unsourced "Managers also take the request online" claim removed (it rested on one company); text_he keeps the "נספח א׳" sentence (sign line) and the sentence starting "העמית חותם בעצמו" (summary box); the stale "read from a third-party copy" clause dropped (the sources are gov.il)
- JSON: strength primary (unchanged)

#### SW-06: general (2.3, Phoenix an example)
- Scope: general
- Sources: dropped the Phoenix FAQ; noted that reg. 5(א) counts from the day the request reaches the transferring fund
- Text: Phoenix sentence and the stale "copy" clause removed from text_he; the "אין עמלת העברה" sentence kept
- JSON: transfer_business_days notes no longer mention Phoenix

#### SW-07: mixed (2.2) → split
- Scope: general (SW-07); institution: The Phoenix (SW-46)
- Sources: dropped the Phoenix FAQ (moved to SW-46)
- Split: SW-46 holds The Phoenix's 10-business-day cancellation window and its "שימור" mailbox
- JSON: figure `phoenix_cancel_window_business_days` and its Hebrew name moved to SW-46 (rule_ids SW-46); text_he keeps the "נספח ו׳" sentence (sign line)

#### SW-08: general (2.3, Phoenix an example of s.3(יב))
- Scope: general
- Sources: dropped the Phoenix FAQ
- Text/JSON: Phoenix sentence and stale "copy" clause out of text_he; figure note cleaned

#### SW-09: mixed (2.2) → split
- Scope: general (SW-09); institution: The Phoenix (SW-47)
- Sources: dropped the Phoenix FAQ (moved to SW-47); 15 business days is the circular's
- Split: SW-47 holds The Phoenix's 14-business-day confirmation
- JSON: figure `phoenix_confirmation_business_days` moved to SW-47; the expect-line sentences ("הקופה המעבירה/המקבלת שולחת") kept

#### SW-10: mixed (2.3) → split
- Scope: general (SW-10); institution: The Phoenix (SW-48)
- Sources: dropped the Phoenix FAQ (moved to SW-48)
- Split: SW-48 holds "האישור נשלח למעסיק באופן אוטומטי"

#### SW-17: mixed (2.3) → split
- Scope: general (SW-17); institution: Mizrahi Tefahot Bank, The Phoenix (SW-49)
- Sources: dropped Mizrahi Tefahot and Phoenix (moved to SW-49); the law lines stay
- Split: SW-49 holds Mizrahi Tefahot's distribution-fee statement and The Phoenix's offer routing
- Text: stale "the law was read on a copy" clause dropped (the sources are the Knesset)

#### SW-18: mixed (2.2) → split
- Scope: general (SW-18); institution: Bank Leumi, Mizrahi Tefahot Bank (SW-50)
- Sources: dropped Leumi and Mizrahi Tefahot (moved to SW-50); added a pointer to SW-44 (price cap)
- Split: SW-50 holds the two banks' free report routes and Leumi's 3-month visibility
- JSON: figure `leumi_report_available_months` moved to SW-50; text_he no longer types the SW-44 price (it is shown from SW-44's figure in the playbook)

#### SW-24: mixed (2.2) → split
- Scope: general (SW-24); institution: Meitav Trade (SW-51)
- Sources: the IRA regulation line stays; Meitav Trade's tender annex (never on the old Source line) now cited by SW-51
- Split: SW-51 holds Meitav Trade's NIS 20 / NIS 99 cap / USD 10 in-IRA transfer fees (also described in IRA-22, w5's file)
- JSON: the three `meitav_*` figures and their names moved to SW-51; stale "read on a copy hosted by Meitav" clause dropped

#### SW-33: mixed (general + institution + unsettled; in both files) → split
- Scope: general (SW-33); unsettled: the BoI price-supervision order, seen at Discount Bank, Meitav Trade (SW-52)
- Sources: SW-33 keeps only the Bank of Israel fee rules; Discount, Meitav Trade and Calcalist moved to SW-52
- Split: SW-52 holds what Discount's tariff (NIS 5 per transfer), Meitav Trade's article (NIS 5 per Israeli security) and Calcalist (NIS 5 cap bank to non-bank) say about the supervised price, with the search for the order
- JSON: SW-52 has a new figure `discount_supervised_transfer_nis` 5 (nis_per_transfer, Discount, provider-set); SW-33's `closing_transfer_cap` note no longer quotes Discount
- Open questions: SW-OQ10 annotated (still open)

#### SW-34: mixed (unsettled + institution) → split
- Scope: unsettled: the TASE rules and directives on what members may charge to move securities out, or an ISA statement (SW-34 keeps its id); institution: IBI, Altshuler Shaham Trade (SW-53)
- Sources: SW-34 keeps Calcalist (secondary) and points to SW-33 and BRK-24; IBI's tariff and Altshuler Shaham Trade's FAQ moved to SW-53
- Text: the BoI rules bind banks only; the TASE rules make members report fees (BRK-24), not cap them; searched list copied from the finding
- JSON: strength institution → secondary (its only remaining link is the press report); title changed

#### SW-35: mixed → split
- Scope: general (SW-35); institution: Bank Leumi, Meitav Trade, Altshuler Shaham Trade (SW-54)
- Sources: added BoI proper-conduct directive 432 (version [10] 6/2020, circular ח-06-2623), p.5, s.8א(ב)(1)-(2); the three institution pages moved to SW-54
- Split: SW-54 holds the order of steps as the institutions describe it, Leumi's conditions, Meitav Trade's form, Altshuler Shaham Trade's wording and its 5/14 trading days
- Text: rule rewritten as the bank's duty (online request, 5 and 14 business days, no unreasonable refusal, s.4 consent); the non-bank process is an open note; re-check of the consolidated directive (circular ח-06-2639, s.3ב) noted
- JSON: strength institution → primary; new general figures `bank_israeli_securities_business_days` 5 and `bank_foreign_securities_business_days` 14 (business_days, Bank of Israel, fixed in regulation); Altshuler's `israeli_securities_trading_days` / `foreign_securities_trading_days` moved to SW-54 (keys kept)

#### SW-36: mixed → split
- Scope: general (SW-36); unsettled: a Tax Authority instruction on same-owner transfers, seen at Altshuler Shaham Trade, Meitav Trade (SW-55)
- Sources: added the Ordinance s.88 (pp.147-148) and s.97(א)(5) (p.161), the Tax Authority's 2019 professional-division summary p.68, the withholding regulations 2002 reg. 9 (btl copy); dropped Leumi (its statements are the general rule) and Altshuler Shaham Trade (moved to SW-55)
- Split: SW-55 holds the same-owner "not a tax event / tax continuity" claim; Meitav Trade's "losses are not erased" is recorded as broader than reg. 9(ב) and not relied on
- Text: title no longer "(institution sources only)"; rule rewritten from the Ordinance and the Tax Authority
- JSON: strength institution → primary; likely_to_change yes → no (recheck_date removed)
- Open questions: SW-OQ11 mostly answered

Also in the file: the Summary's brokerage bullet rewritten and a scope bullet added; the Institutions paragraph and the playbook index name the new records; four new rows in the Sources table (directive 432, the Ordinance, the 2019 summary, the withholding regulations).

#### Errors fixed
- SW-36: the record said tax on moving securities rested on institution sources only and that no Tax Authority source was read; the different-owner and gift rules are in the Ordinance and the Tax Authority's 2019 summary.
- SW-35: the record said no regulator rule on the timeline exists; directive 432 sets 5 and 14 business days for a bank.
- Stale "read on a third-party copy" clauses removed from the text_he of SW-02, SW-06, SW-07, SW-08, SW-09, SW-10, SW-17, SW-24 (their sources are official texts since the 2026-10-25 source check).

#### Code changes
- `site/app/lib/playbook.ts`: `StepSpec.named` (a company's own records shown after the step's rules, named; they do not set the step's chip or institution-only prefix; their figures are listed). Steps: sign +SW-45, employer +SW-48, agent +SW-49, data +SW-50, cancel +SW-46, confirm +SW-47, IRA in-kind +SW-51, brokerage request +SW-54, brokerage cost rules SW-33, SW-52, SW-34 (+SW-53 named), brokerage tax rules SW-36, SW-55. FIGURES: SW-18 now only SW-44's cap; SW-50 Leumi months; SW-51 the two Meitav Trade fees; SW-46, SW-47 The Phoenix's days (plain, labelled with the name); SW-52 Discount's NIS 5; SW-35 the two bank deadlines (plain). Strength and `institutionOnly` now come from the step's own rules only. `playbookRuleIds` includes named ids. switch.tsx reads no figure key (checked).
- `site/app/lib/playbook.test.ts`: confirm step figures [15, 14] (why line added); a new test that named records come after the rules without setting the chip; brokerage strengths ["primary", "secondary", "institution", "open", "primary"] and institution-only all false (why lines added). 18/18 pass.
- `site/app/lib/holdings.server.ts`: not changed (SW-24 keeps its id).

#### New ids
- SW-45: The Phoenix: the transfer request online (institution: The Phoenix)
- SW-46: The Phoenix: 10-business-day cancellation window and retention mailbox; figure phoenix_cancel_window_business_days (institution: The Phoenix)
- SW-47: The Phoenix: confirmation within 14 business days; figure phoenix_confirmation_business_days (institution: The Phoenix)
- SW-48: The Phoenix: joining confirmation sent to the employer automatically (institution: The Phoenix)
- SW-49: Mizrahi Tefahot's distribution fees and The Phoenix's offer routing (institution: Mizrahi Tefahot Bank, The Phoenix)
- SW-50: Leumi's and Mizrahi Tefahot's free clearing-house report; figure leumi_report_available_months (institution: Bank Leumi, Mizrahi Tefahot Bank)
- SW-51: Meitav Trade's in-IRA transfer-out fees; three meitav_* figures (institution: Meitav Trade)
- SW-52: the supervised price as Discount's tariff, Meitav Trade's article and Calcalist state it; figure discount_supervised_transfer_nis (unsettled; seen at Discount Bank, Meitav Trade)
- SW-53: IBI's and Altshuler Shaham Trade's transfer prices (institution: IBI, Altshuler Shaham Trade)
- SW-54: how Leumi, Meitav Trade and Altshuler Shaham Trade describe moving a portfolio; Altshuler's trading-day figures (institution: Bank Leumi, Meitav Trade, Altshuler Shaham Trade)
- SW-55: same-owner transfers described as no tax event (unsettled; seen at Altshuler Shaham Trade, Meitav Trade)

#### Left as is and why
- Discount's price for a transfer to another client's account (0.69%, NIS 44 to NIS 220, item 4.6.2) is tariff data, not the unsettled supervised price; it was in SW-33's conditions and is not carried into SW-52 (one record, one scope). It belongs in a Discount tariff snapshot under `data/fees/` if one is collected.
- Altshuler Shaham Trade's 5/14 trading days are not listed as step figures in the playbook (the bank deadlines of directive 432 now are); they stay on SW-54's card.
- SW-OQ6 (who tells the employer to redirect deposits) and SW-OQ12 untouched: nothing in the findings.

### w4-pen: pension and tier-2 tax records (scope pass 2026-10-25)

Files: `pension-and-gemel-lekitzba.md`, `tax-tier2-other.md`, and the records' JSON. Source of every change: `research/knowledge/2026-10-25-scope/pension.md`. "S1" below is the CMA standard pension bylaw (circular 2016-3-4, annex ב, copy on prisha.co.il, "primary (third-party host)", which the extractor makes primary-mirror). Every S1-based record also cites the gov.il circular 2016-3-4, p.1, s.2(א), which makes managers write their bylaws on that text, so each has a primary source.

#### PEN-08: general
- Scope: general
- Sources: added the 1964 regulations reg. 1 and reg. 19(ב1)(1) (btl), the Wikisource mirror for the seventh schedule, NII's average-wage page (13,769 from 1.1.2026), the 2026 deductions booklet p.12, and S1 p.10 s.1 (the 22.83% limb); kept the extension order; dropped the Mor comprehensive and general bylaws and the Harel 2026 table.
- Text: the ceiling is now stated from the regulation (20.5% of twice the average wage, unused ceiling rolls forward within the year) with the 22.83% limb from the standard bylaw; text_he rewritten, the "taken from an insurer's table" sentence removed.
- JSON: strength stays primary; `monthly_deposit_ceiling` (key kept, the engine reads it) re-sourced to reg. 1 and 19(ב1)(1) with the computation in the title (2 × 13,769 × 20.5% = 5,645.29), state sourced, strength primary, average-wage-linked. This is the computed-value convention: see "For the lead".
- Open questions: PEN-OQ5 and PEN-OQ6 answered.

#### PEN-09: mixed → split into PEN-09, PEN-37, PEN-38
- Scope: general (PEN-09); unsettled (PEN-37); institution: Mor (PEN-38)
- Sources: PEN-09 now S1 p.9 s.1 ("שכר מבוטח", "שכר קובע"), the gov.il circular and NII's average wage; dropped the Mor bylaws and the Harel table.
- Split: PEN-37 holds the 12.5% floor of the current bylaws (seen at Mor, Harel, Altshuler Shaham, Meitav; absent from the 2016 CMA text and from the five amending circulars found); PEN-38 holds Mor's general-fund cap of 4 × the average wage.
- Text: PEN-09 states the CMA text: employee divisor is the month's tagmulim deposit rate, self-employed ÷16% unless another rate is proved, determining salary capped at 3 × the average wage (2026: 41,307, computed in the markdown only). text_he rewritten.
- JSON: strength institution → primary. PEN-37 carries `insured_salary_divisor_floor` 12.5 (Mor, provider-set); PEN-38 carries `determining_salary_cap_multiple` 4 (Mor, provider-set).

#### PEN-11: mixed → split into PEN-11, PEN-39
- Scope: general (PEN-11); institution: Mor (PEN-39)
- Sources: PEN-11 now circular 2017-3-7 (prisha, new s.24(א) and annex ב), S1 pp.23-26 ss.25, 28, 29, 32-33, and the gov.il circular 2016-3-4 p.4 annex א ss.2-3 (the optional provisions); dropped Mor.
- Split: PEN-39 holds Mor's eighth track (37.5% disability, 60% survivors) and the two optional provisions Mor adopted (any combination; double disability as default cover).
- Text: "eight tracks" became "seven standard tracks; some funds add more"; the optional provisions are stated as the circular's permission. text_he rewritten.
- JSON: strength institution → primary.
- Open questions: PEN-OQ13 answered.

#### PEN-12: general
- Scope: general
- Sources: S1 pp.44-46 ss.69-74, p.8 s.1, and the gov.il circular; dropped Mor.
- Text: section references added; the day-61 caveat removed (verified on S1's page image); the note on the circular calling the text "נספח א'" while amendments call it "נספח ב'" added. text_he rewritten.
- JSON: strength institution → primary.
- Open questions: PEN-OQ16 answered.

#### PEN-13: mixed (general + unsettled) → split into PEN-13, PEN-40
- Scope: general (PEN-13); unsettled (PEN-40)
- Sources: PEN-13 now S1 pp.56-58 ss.94-97, pp.24-25 s.30, and the gov.il circular; dropped Mor (kept in PEN-40).
- Split: PEN-40 holds the several-orphans share: 30% each in the 2016 CMA text, 40% shared in the 2025 bylaws of Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim (15% variant at Altshuler Shaham and Meitav). Figures `orphan_share_each_standard_text` 30 (S1, primary-mirror) and `orphans_share_total_current_bylaws` 40 (Mor, provider-set).
- Text: correction applied (see Errors). text_he rewritten.
- JSON: strength institution → primary.

#### PEN-15: general
- Scope: general
- Sources: S1 pp.30-31 ss.38-40, Codex part 6 p.7 items (5)-(6), the gov.il circular; dropped Mor.
- Text: the premium factor per manager's annex approved by the Commissioner (s.38), the 35% maximum accumulated cost of cover (s.39), premiums from tagmulim contributions only while insured (s.40), reinsurance premiums a payment from the fund (s.7). The record's "reinsurance premiums do not exceed members' premiums, except catastrophe risks" (Mor s.7) was replaced by the finding's reading of s.7. text_he rewritten; no figure added (35% alone would mislead on the "שווה לדעת" row).
- JSON: strength institution → primary. Stays in the pension guides' "שווה לדעת", now general.
- Open questions: PEN-OQ7 partly answered.

#### PEN-16: general
- Scope: general
- Sources: S1 pp.28-29 ss.36-37, p.23 s.28, p.26 ss.33-34, the gov.il circular; dropped Mor.
- Text: section references and quotes; renewal now names the default track, the new start age and the new qualifying period from S1. text_he rewritten.
- JSON: strength institution → primary; `insurance_extension_months` 5 re-sourced to S1 s.36(א) (primary-mirror), update_rule provider-set → fixed in regulation.

#### PEN-17: mixed → split into PEN-17, PEN-41
- Scope: general (PEN-17); institution: Mor (PEN-41)
- Sources: PEN-17 keeps the circular 2022-9-30 and list 2024-1471 lines, adds reg. 33ב(א)(2), (ב) (three business days) and S1 pp.19-20 ss.19-22; the two Mor sources moved to PEN-41.
- Split: PEN-41 holds Mor's track menu, its annuitant tracks, the halacha track from 01.04.2026, and Mor's statement that designated-bond and guaranteed-return assets sit outside each track's policy (the finding does not say that statement is in S1, so it went with Mor).
- Text: the renewal rule now follows S1 s.21 (renewal within 12 months keeps the old track, new severance deposits to the default); the record had said "after 12 months … old track for the old balance". "Within 3 business days" now rests on reg. 33ב(ב). text_he rewritten.
- JSON: strength institution → primary.

#### PEN-19: general
- Scope: general
- Sources: S1 p.65 s.109 and Codex part 6 p.25 s.4.3.3 added; CMA report and Pensia-Net kept; dropped Mor.
- Text: rule quoted from s.109(א)-(ב); "(Mor bylaws s.109(א)(1))" removed. text_he: the "taken from a manager's bylaws" clause removed.
- JSON: strength institution → primary.

#### PEN-23: mixed (2.3, Mor's practice) → split into PEN-23, PEN-42
- Scope: general (PEN-23); institution: Mor (PEN-42)
- Sources: PEN-23 keeps circular 2024-9-6 and the 2024 CMA report; Mor's selected-fund page moved to PEN-42.
- Split: PEN-42 holds Mor's five alternative mixes, its six-months-without-deposits return to the default, and its rule that only members who joined after 1.11.2024 may ask.
- Text: Mor's sentences removed from PEN-23; figure keys unchanged (guarantee_years, selected_balance_fee, selected_deposit_fee). text_he no longer mentions Mor's page; it still names the four selected funds, which is the regulator's decision (see "For the lead").
- JSON: strength stays primary.

#### PEN-27: general
- Scope: general
- Sources: S1 pp.32-35 ss.42-53 and the gov.il circular; dropped Mor.
- Text: added from the finding: request acknowledged in 7 days and approved in 10 (s.43), the conversion factor per manager's annex approved by the Commissioner (s.45), the guaranteed period only for a member with no disability pension in the 24 months before (s.50). The record's other details (six-month notice, three months retroactive, 60/120/180/240-month periods) were kept on the researcher's general verdict for ss.42-53; the finding does not enumerate them one by one. text_he rewritten.
- JSON: strength institution → primary.

#### PEN-30: general (2.3, example of a general rule)
- Scope: general
- Sources: Mor replaced by S1 pp.62-63 ss.103(א)(1), 106(א) and the gov.il circular; the two Knesset lines kept.
- Text: "the pension bylaws add" → "the CMA standard pension bylaw adds", with s.103(א)(1) and s.106(א). text_he: same change; the stale "the law was read on Wikisource" clause removed (the sources are Knesset PDFs).
- JSON: strength stays primary.

#### PEN-31: general
- Scope: general
- Sources: S1 pp.62-63 ss.103(א)(2), 103(ב), 104 and the gov.il circular added; Knesset lines kept; dropped the Mor pension and gemel bylaws.
- Text: the provident-fund sentence now rests on law s.23(א)(3) ("רק אם יחסי העבודה הסתיימו"), as the finding says; the CMA "תקנון תקני קופת גמל לחיסכון" (2021 amendment link) is noted as existing, base text unread. Holding payment back on the member's objection (s.104(ג)) added. text_he rewritten.
- JSON: strength institution → primary.

#### PEN-33: general
- Scope: general
- Sources: reg. 41יא (btl, quoted in full), S1 (service times, six sections) and the gov.il circular; dropped both Mor sources.
- Text: title now "Processing times; a withdrawal is paid within 4 business days"; the payout is the regulation's for pension and provident funds; the other times are S1's (joining "decided" within 14 days, per S1 s.13(ג), where the record said "joining without medical underwriting up to 14 days"). text_he rewritten.
- JSON: strength institution → primary; `payout_business_days` 4 re-sourced to reg. 41יא(א), provider-set → fixed in regulation; figure name "ימי עסקים לתשלום משיכה".

#### PEN-35: mixed (general + institution + unsettled) → split into PEN-35, PEN-43, PEN-44
- Scope: general (PEN-35); institution: Mor (PEN-43); unsettled (PEN-44)
- Sources: PEN-35 now s.34ב (kept) and the 1964 regulations pp.6-7 reg. 19 (deposit limits); Mor's page and gemel bylaws moved out.
- Split: PEN-43 holds Mor's "אינו כולל כיסויים ביטוחיים" and its bylaws' insurance-section footnote; PEN-44 holds the loan limits seen only in Mor's gemel bylaws s.47 (80%, 30%, 7 years, 10% of assets, as four Mor-sourced figures).
- Text: deposit limits now rest on reg. 19 (7.5%, 7%, 8⅓%). The record's "no actuarial balancing of members' balances" was dropped: no source for it is in the finding. The insurance point is an open note (the 2013 regulations on insurance cover in provident funds were not read). text_he rewritten.
- JSON: strength institution → primary.

#### TX2-20: mixed → split into TX2-20, TX2-21
- Scope: general (TX2-20); institution: Reit 1 (TX2-21)
- Sources: TX2-20 now the Ordinance (Tax Authority text) pp.106-107 s.64א5(א)(1), (3), with "The rates: TX2-09, TX2-10, TXG-02" for chips; Reit 1's page moved to TX2-21.
- Split: TX2-21 holds Reit 1's FAQ quote, its 2012 worked example and the three example figures (rule_ids now TX2-21, TX2-10).
- Text: TX2-20 states the law: a REIT (or a bank or TASE member with approval) withholds by income source. Pointers in the same file repointed to TX2-21: the TX2-10 annotation, open question 7, the graduation table row.
- JSON: TX2-20 strength institution → primary, figures and figure names removed, likely_to_change yes → no, recheck_date removed. TX2-21 new (institution, likely_to_change yes, recheck 2027-03-31).

#### Errors fixed
- PEN-09/PEN-38: the general-fund cap for 2026 is 4 × 13,769 = NIS 55,076; the record said 55,706.
- PEN-13: no version says "each orphan 40%"; the CMA text gives 30% to each of several orphans and the 2025 bylaws 40% shared (now PEN-40, unsettled).
- PEN-17: the renewal rule follows S1 s.21 (renewal within 12 months, not after).
- PEN-33: joining is "decided" within 14 days (S1 s.13(ג)), not "without medical underwriting up to 14 days".

#### New ids
- PEN-37: the 12.5% insured-salary floor in current bylaws. Scope: unsettled (seen at Mor, Harel, Altshuler Shaham, Meitav).
- PEN-38: Mor's general-fund determining-salary cap (4 × average wage). Scope: institution: Mor.
- PEN-39: Mor's eighth insurance track and the optional combinations. Scope: institution: Mor.
- PEN-40: survivors' share with several orphans. Scope: unsettled (seen at Mor, Harel, Altshuler Shaham, Meitav, Menora Mivtachim).
- PEN-41: Mor's investment-track menu. Scope: institution: Mor.
- PEN-42: Mor's alternative fee mixes in its selected fund. Scope: institution: Mor.
- PEN-43: Mor: its provident fund carries no insurance cover. Scope: institution: Mor.
- PEN-44: loan limits in a provident fund. Scope: unsettled (seen at Mor).
- TX2-21: Reit 1's withholding statement and 2012 example. Scope: institution: Reit 1.

#### Open questions annotated (pension-and-gemel-lekitzba.md)
PEN-OQ5, OQ6, OQ8, OQ13, OQ16 answered; OQ7 partly answered. OQ8 (5.15% CPI-linked, circular 2022-3-3) is annotated, but PEN-18 itself was not in my list and was not edited.

#### Code changes
None.

#### Left as is and why
- PEN-37 and PEN-40 cite only Mor's bylaws: the finding names Harel's, Altshuler Shaham's, Meitav's and Menora Mivtachim's 2025 bylaws but gives no links.
- PEN-12's sentence on keeping insurance for the remaining salary in partial disability (Mor s.75; S1 cited as ss.69-74) and PEN-27's six-month notice, three-month retroactive payment and 60/120/180/240-month periods were kept under the researcher's general verdict; the finding does not list them one by one.
- TX2-10 still cites the Ordinance on Wikisource; the finding says the Tax Authority text (pp.106-107) can replace it, but TX2-10 is not in my list.

### w5-cs-ira: child savings and IRA (pension findings file)

Files: `child-savings.md`, `ira-self-directed.md`, their JSON records, `packages/engine/src/ledgers/child-savings.ts`. New ids: CS-28, CS-29, CS-30, IRA-29.

#### CS-07: general (out of date, re-sourced)
- Scope: general
- Sources: added circular 2022-9-29 p.4, annex s.3(ד1)-(ד2); dropped Harel's bylaw s.7.4-7.5 and Altshuler Shaham's Q&A (both only restated the circular's increased-risk default and its 1.12.2022 start)
- Text: rule adds the circular's in-fund default (increased risk for every child joining from 1.12.2022; the youngest older sibling's chosen track); conditions drop Altshuler's dates and "Altshuler says rotation" (rotation stays as open question 4, from regulation 3(ב)); text_he rewritten
- JSON: checked 2026-10-25

#### CS-09: institution (Harel)
- Scope: institution: Harel
- Sources: unchanged (Harel bylaw annex A); Source line ends "General counterpart: CS-26"
- Text: title "Harel: what its default (increased-risk) track holds"; conditions say the band is Harel's own because circular 2022-9-29 s.3(ב) has each manager set the policy and the CMA standard child bylaw leaves it blank (annex א); text_he rewritten (names Harel first, no typed digits)

#### CS-10: mixed → split
- Scope: general (CS-10); institution: Bank Yahav (CS-28)
- Sources: CS-10 keeps NII circular 1356 (now with the p.22 quote "interest known in advance per track") and the NII FAQ, plus a pointer to CS-25 for the principal guarantee; the Yahav agreement moved to CS-28
- Split: CS-28 holds Yahav's mechanics (exit-station type for children under 13, 60-day notice, instruction 3 to 10 business days before, rate set on opening for 18 minus age, balance not below NII's nominal sums)
- JSON: CS-10 keeps exit_station_years (child-savings-bank.tsx reads it); new CS-28 without figures

#### CS-11: general
- Scope: general
- Sources: added the CMA standard child bylaw s.16.2 (gov.il, annex to circular 2016-9-20); dropped Harel
- JSON: track_switch_business_days re-sourced to the standard bylaw, update_rule fixed in regulation, figure name drops "(הראל)"; text_he adds the switch time

#### CS-14: mixed → split
- Scope: general (CS-14); institution: Bank Leumi, Bank Yahav (CS-29)
- Sources: added the standard child bylaw ss.10.2, 10.4-10.5, 11 and reg. 41יא(א) of the 1964 rules; dropped Harel; Leumi's page and Yahav's agreement moved to CS-29
- Split: CS-29 holds Leumi's bank route (child's own current account only, whole balance, account closed, 3 business days) and Yahav's NIS 100 minimum after a partial withdrawal
- JSON: provident_payout_business_days re-sourced to standard bylaw s.10.4, fixed in regulation, name "ימי עסקים לתשלום מקופה"; bank_payout_business_days moved to CS-29 (rule_ids CS-29); new CS-29 figure partial_withdrawal_min_balance 100 NIS (Yahav s.6.6); withdrawal_age and parent_signature_until_age stay in CS-14 (notes now cite the standard bylaw s.10.2)

#### CS-18: mixed → split (the worst finding)
- Scope: general (CS-18); institution: Harel, Altshuler Shaham, Bank Yahav (CS-30)
- Sources: added circular 2022-9-29 p.3 s.1, the fee regulations reg. 2(א)(1)-(2) (Reshumot), the Nevo consolidated reg. 2(ב) exclusion list (mirror), the standard child bylaw s.31.1, 32.1, 33.1-33.2; dropped Harel and Altshuler (moved to CS-30); NII law, pages, 2025 report and regulation 13 stay
- Split: CS-30 holds Harel's 0.23% of balance and 0% of deposits (the blank of standard bylaw s.31.1 filled in), Altshuler Shaham's 0.23% after 21, and Yahav's fee-free shadow account (s.5.4)
- Text: CS-18 now says NII pays funds 0.23% until 21, and after 21 the legal cap is 1.05% of the balance and 4% of deposits; text_he rewritten (no company names)
- JSON: figures now, in this order: nii_fee_to_funds 0.23 (NII 2025 report, primary; first, for the "שווה לדעת" row), balance_cap_after_21 1.05 and deposit_cap_after_21 4 (fee regulations reg. 2(א)(1)-(2), fixed in regulation, rule_ids CS-18 and PF-02); fee_after_21 moved to CS-30 (institution, rule_ids CS-30), plus new deposit_fee_after_21 0 (Harel)
- Open questions: CS-OQ8 partly answered (the cap; the rate stays open), CS-OQ16 partly answered

#### CS-26: general (corrected)
- Scope: general
- Sources: added circular 2022-9-29 p.4, annex s.3(א)-(ב), (ד)-(ד2) and the standard child bylaw annex א; the 2018-9-25 line stays (it is the old s.3(ד))
- Text: title "The default when no choice is made: National Insurance's pages and the CMA circular"; rule states the three in-fund rules and that each track's policy is the manager's, approved by the Commissioner; text_he rewritten
- Open questions: CS-OQ3 and CS-OQ7 partly answered, CS-OQ17 answered (amendments 2019-9-17, not read, and 2022-9-29)

#### IRA-02: general
- Scope: general
- Sources: added the CMA standard pension bylaw (S1, prisha.co.il, primary third-party host) ss.33(א)(3), 34(ג), 36(ג)(2) and the gov.il circular 2016-3-4 s.2(א) that mandates it; dropped Meitav's page
- Text: the consequences of leaving a pension fund are now the bylaw's three; s.34(ג) is limited to death events (the wider "new 5-year period for pre-existing conditions" is noted as not in the text); Meitav's 90% partial-transfer suggestion and "survivors' cover costs more" dropped (company advice, no general source)

#### IRA-05: 2.3 → split
- Scope: general (IRA-05); institution: Meitav (IRA-29)
- Sources: dropped Meitav (moved to IRA-29)
- Text: conditions say a manager's "acceptable to the company" is not the rule: reg. 3(ג) "לא תטיל כל מגבלה"; text_he rewritten

#### IRA-08: general
- Scope: general
- Sources: added the 2017 amendment reg. 1 ("סכום קצבה מזערי – כהגדרתו בסעיף 23(ה) לחוק"), the Tax Authority deductions booklet 2026 p.12 (5,306) and the Ordinance s.9א(א) (multiplier 180); dropped Meitav and Mor
- JSON: minimum_pension re-sourced to the booklet (primary); determining_amount and cap kept as values, sourced to the regulation with the computation in the title (5,306 × 180 × 1.65 = 1,575,882; 4 × = 6,303,528), strength primary, notes say "computed under the regulation's formula from primary inputs; matches Meitav's print"
- Open questions: IRA-OQ8 answered

#### IRA-10: general → split
- Scope: general (IRA-10); institution: Meitav (IRA-29)
- Sources: dropped Meitav
- Text: title "No regulatory minimum balance"; rule: the regulations, read in full, set no minimum balance or deposit
- JSON: suitability_minimum moved to IRA-29

#### IRA-11: general (2.3 example)
- Scope: general
- Sources: added the 2012 investment rules reg. 1 "מדינת חוץ מאושרת" (Wikisource mirror); dropped Meitav's tender annex and joining-form annex
- Text: the approved-country definition is the regulation's ("investment grade or OECD"), not Meitav's "BBB"; the alternative-fund box moved to IRA-29; the Terms row for "מדינת חוץ מאושרת" no longer cites Meitav
- Open questions: IRA-OQ10 partly answered

#### IRA-12: 2.3 → company sentence moved
- Scope: general
- Sources: dropped Meitav's tender annex
- Text: Meitav's no-option-writing policy moved to IRA-29; added "the regulations allow written options within the collateral limit"; the per-issuer exceptions now say they were read on Nevo (open question 1) instead of resting on Meitav's summary

#### IRA-17: 2.3 → split
- Scope: general (IRA-17); institution: Meitav (IRA-29)
- Sources: added the fee regulations reg. 4 (PF-06's line) and a pointer to PF-06; dropped Meitav
- Text: the cap is reg. 4's 2% a year of the balance, no deposit-fee item; Meitav's blank fee field and "may raise subject to law" moved to IRA-29
- JSON: new first figure balance_cap 2 (copied from PF-06's value object, rule_ids IRA-17 and PF-06), so the "שווה לדעת" row on ira-provident shows the cap; Gemel-Net figures unchanged
- Open questions: IRA-OQ3 answered

#### IRA-21: institution (Meitav)
- Scope: institution: Meitav
- Text: conditions name the general counterparts reg. 12 (IRA-18) and reg. 7 (IRA-16); Source line ends with the pointer; the developer words ("data/fees", "שלב 4") removed from text_he

#### IRA-22: institution (Meitav Trade)
- Scope: institution: Meitav Trade
- Text: conditions name the general counterpart, reg. 7(א)(2)'s custody cap (IRA-16); Source line pointer

#### IRA-23: general (2.3 example)
- Scope: general
- Sources: dropped Meitav's page; pointer to SW-39 and SW-40
- Text: seniority carries over by the transfer regulations reg. 3(ב)(1) and 2(ב); Meitav's self-employed deposit route moved to IRA-29

#### New ids

- CS-28 (institution: Bank Yahav): Yahav's rate-setting and exit-station mechanics, from CS-10.
- CS-29 (institution: Bank Leumi, Bank Yahav): withdrawing child savings from the bank, from CS-14; figures bank_payout_business_days 3 (Leumi), partial_withdrawal_min_balance 100 NIS (Yahav).
- CS-30 (institution: Harel, Altshuler Shaham, Bank Yahav): the fees these companies state, from CS-18; figures fee_after_21 0.23 (engine reads it), deposit_fee_after_21 0 (Harel).
- IRA-29 (institution: Meitav): how Meitav runs its IRA accounts (self or portfolio manager by POA, "acceptable to the company", alternative funds against an indemnity letter, no option writing, the fee field and right to raise, self-employed deposits via Mizrahi-Tefahot accounts, the 200,000 suitability figure), from IRA-05, IRA-10, IRA-11, IRA-12, IRA-17 and IRA-23: one record for Meitav's own terms rather than six fragments.

#### Errors fixed

- CS-18: Harel's 0.23% after 21 was the record's figure and read as the cap; no law sets it. The legal cap after 21 is 1.05% of the balance and 4% of deposits (fee regulations reg. 2, via circular 2022-9-29 s.1).
- CS-26: "inside a chosen fund the low-risk track is the default" is the 2018 rule; since 1.12.2022 it is the increased-risk track or the youngest older sibling's chosen track (circular 2022-9-29 s.3(ד1)-(ד2)).
- CS-07: the increased-risk default rested on Harel and Altshuler; it is the circular's.
- IRA-05: Meitav's "acceptable to the company" was shown beside the rule as if allowed; reg. 3(ג) forbids any limit on the member's choice. Now said in IRA-05 and IRA-29.
- IRA-08: the 2026 conversion multiplier was "not found"; it is 180 (Ordinance s.9א(א)).
- IRA-02: Meitav's "new 5-year period for pre-existing conditions" is wider than the bylaw's death-only s.34(ג).

#### Code changes

- `packages/engine/src/ledgers/child-savings.ts`: the after-21 fee now reads `book.rate("CS-30", "fee_after_21")`; on the provident route the run also cites CS-18 (`book.cite("CS-18")`), so the general rule (NII pays until 21, the legal cap) stays among the rules used; doc comment updated. `npx vitest run packages/engine`: the child-savings tests pass; the 3 failures are other workers' (TXH-11 S25 in golden.test.ts:557 and r2-pension.test.ts:71; PEN-15 in r2-pension.test.ts:221).

#### Left as is and why

- CS-08 (tracks per manager) keeps its Altshuler Shaham source for "funds cannot be split across tracks": not in the findings.
- CS-20's 2026-10-23 annotation still says "the in-fund low-risk default: CS-26"; CS-26 itself now carries the correction. Not my record.
- The pension researcher's hly.gov.il and tender searches (not reachable) leave CS-OQ8's per-manager rate open.
- IRA-21's table still lists the banks' tariffs under Meitav's scope (the finding names Meitav only).

### w6-brk: banks, brokers, mutual-fund fees, regulators, insurer tax statements

Worker w6-brk, 2026-10-25. Records from the markets findings file (`research/knowledge/2026-10-25-scope/markets.md`). Files edited: `bank-current-account-deposits.md`, `bank-product-names.md`, `brokerage-account.md`, `mutual-funds-and-money-market-funds.md`, `regulators-and-protection.md`, `tax-insurance-and-amendment-190.md` (all under `.claude/skills/il-finance/references/`), and the matching `data/rules/*.json`. No code or test file was edited. 25 records handled, 8 new ids.

#### Records

#### BANK-06: 2.3 (company examples inside a primary record) → split
- Scope: general (BANK-06); institution: Discount Bank, Bank Yahav (BANK-33)
- Sources: dropped the Discount and Yahav pages from BANK-06 (moved to BANK-33); kept the disclosure rules s.10 and Directive 447 Annex A
- Split: BANK-33 holds Discount's break mechanism (approval, daily borrowers' rate table, lower of principal and break value, no partial break in year one) and Yahav's "אין אפשרות לשבירה"
- Text: rule unchanged; the Discount example left the conditions; text_he no longer names Discount ("…תנאי מוצר שכל בנק קובע ומפרסם בלוח הזה")
- JSON: strength primary (unchanged); BANK-06 stays in the bank-deposit "שווה לדעת" as a general rule

#### BANK-25: mixed → split
- Scope: general (BANK-25); institution: Bank Leumi, Bank Hapoalim, Bank Yahav (BANK-34)
- Sources: added Directive 447 p.2 s.5(ב) and Annex A "סוג ריבית", disclosure rules p.5 s.7(א)(3); dropped the three banks' pages (moved to BANK-34)
- Split: BANK-34 holds prime as the anchor at the three banks read, each bank's prime definition, Hapoalim's BoI + 1.5% (3.25%/4.75%), Yahav's change-or-close footnote
- Text: retitled "Fixed vs variable rate: what the bank must show and state"; "העוגן שנראה בכל הבנקים" removed; text_he rewritten
- JSON: strength institution → primary; likely_to_change yes → no (recheck_date removed; BANK-34 keeps yes / 2027-01-01)
- Open questions: BANK OQ14 (prime) annotated, still open, with what was searched

#### BPN-10: institution
- Scope: institution: Bank Hapoalim
- Text: heading and rule name Hapoalim; general counterpart named (disclosure rules s.7(ב)(4)-(5) via BANK-02, Directive 447 s.4(ב) via BANK-13; no rule fixes how instalments lock); Source line ends "General counterpart: BANK-02, BANK-13."
- JSON: title updated; text_he adds the counterpart sentence

#### BRK-06: general → split of the company examples
- Scope: general (BRK-06); institution: Interactive Israel, Bank Yahav (BRK-46)
- Sources: added Securities Law amendment 63 s.49א (kept, now first among primaries), ISA general-permit conditions (Dec 2023, English translation; "the Hebrew text binds") p.8 and p.11, ISA Q&A (13.1.2025) p.4 q.7 and p.6 q.12; dropped Interactive Israel's about page and Yahav's permit page (moved to BRK-46)
- Split: BRK-46 holds the two permit holders' own statements (Interactive Israel's CySEC declaration, introducing-broker status, not responsible for IBKR's charges; Yahav's BoI-supervision basis), with the 2026-10-25 foreign-broker pass note
- Text: "אלה הצהרות של הגופים עצמם" replaced by the ISA's mandatory-disclosure rule, who may hold a permit, and Q&A q.7 (an executing foreign broker behind a permit holder needs no permit of its own)
- JSON: strength institution → primary
- Open questions: BRK OQ9 annotated with the ISA Q&A q.5 source line and quote (own-initiative approach to a foreign broker); flagged for the founder

#### BRK-08: 2.3 example of a general rule
- Scope: general
- Sources: dropped Fair's tariff page; the guidelines s.26ה carry the pooled-trust-account sentence
- Text: the Fair sentence became the general one; text_he likewise

#### BRK-10: mixed → split (class C → mixed)
- Scope: general (BRK-10); institution: Bank Leumi (BRK-47)
- Sources: added the Supervisor's custody Q&A (16.1.2013), the 2012 joint press release, the 2013 adoption release, Directive 461 (07/23) s.6 and ss.57-58, TASE rules s.25ו and s.29ג(6); Leumi's general terms moved to BRK-47
- Split: BRK-47 holds Leumi's pooling, equivalent-securities, custodians' liens and broker-liability terms
- Text: retitled "Custody of client securities at a bank and at every TASE member: the custodian's duties"; the open question narrowed to failure of a bank
- JSON: strength institution → primary
- Open questions: BRK OQ4, OQ6 partly answered; OQ5 narrowed, still open

#### BRK-23: institution
- Scope: institution: Bank Leumi
- Text: heading and rule name Leumi; counterpart named (BoI fee rules first schedule part 5(1), "ובלבד שלא יעלה על 2 עמלות", BRK-16); Source line ends "General counterpart: BRK-16."
- JSON: title, title_he, text_he (adds the fee-rules cap sentence)

#### BRK-24: mixed → split
- Scope: general (BRK-24); institution: IBI, Excellence, Altshuler Shaham Trade, Psagot (BRK-48)
- Sources: added TASE rules p.23 s.18 and p.35 s.29ב, 29ג(2); guidelines pp.40-41 s.17(א)-(ד) and p.105 s.29א (s.29ב and s.29א come from the BRK-28 finding, same documents); the four tariffs moved to BRK-48
- Split: BRK-48 holds the extra lines of the four tariffs and Excellence's "may charge less" (the tariff-as-ceiling now named Excellence)
- Text: retitled "Every TASE member reports its fees to TASE in the bank fee schedule's format, and states them in the client agreement"; "not found: a rule that obliges publishing a tariff in that layout or makes it a ceiling"
- JSON: strength institution → primary; dimensions kept (wrapper marks rely on them)

#### BRK-25: mixed → split
- Scope: general (BRK-25); institution: IBI, Excellence, Fair (BRK-49)
- Sources: added guidelines p.98 s.26ה(1)(ו) and Directive 447 p.1 s.4(א); the three tariffs moved to BRK-49
- Split: BRK-49 holds the three tariffs' interest lines and conditions
- JSON: strength institution → primary

#### BRK-27: 2.3 example of a general rule
- Scope: general
- Sources: added the 2002 withholding regulations reg. 1(א) "מוסד כספי", reg. 2(א) (the TXS-05 link); dropped Leumi's terms and Interactive Israel's about page; Source line points to TXS-05 and TXF-22
- Text: retitled "Who deducts tax: the clearing house pays gross; every bank and TASE member withholds on a sale; a foreign broker withholds no Israeli tax"; a foreign broker is neither bank nor member (BRK-45 finding)
- Open questions: BRK OQ16 closed for non-bank TASE members

#### BRK-28: institution
- Scope: institution: Bank Leumi, Meitav Trade, Fair, Psagot
- Text: heading names the four firms; counterpart named (TASE rules s.29ב-ג written agreement before service, guidelines s.29א online, BRK-22 bank custody agreement; no legal minimum found); Source line ends "General counterpart: BRK-24, BRK-22."
- JSON: title, title_he, text_he

#### BRK-35, BRK-36, BRK-38, BRK-40, BRK-41, BRK-42, BRK-43, BRK-44: institution
- Scope: institution: Interactive Brokers Ireland (35); Interactive Israel (36, 40, 41); One Zero Bank (38); Interactive Brokers (42, 43); Interactive Brokers, Interactive Israel (44)
- Text: each already named its company; added the finding's counterpart to the conditions and, where a record exists, a pointer at the end of the Source line: 35 → REG-27 (SIPC; Irish ICC page not reached); 36 → TXS-05, TXF-22 (HYBRID's Tax Authority approval not found, with what was searched); 38 → BRK-16, BRK-33; 40, 41 → BRK-06 (41 adds alternative B and Q&A q.7); 42 none for prices; 43 → the ISA Q&A q.5 in OQ9; 44 → EU Regulation 1286/2014 unread (ETF OQ11)
- JSON: checked 2026-10-25; BRK-36 text_he updated ("אישור של רשות המסים … לא נמצא" and the withholding counterpart)

#### BRK-45: mixed (class B → mixed) → split
- Scope: general (BRK-45); institution: Interactive Brokers, Interactive Israel (BRK-50)
- Sources: BRK-45 now cites the IRS W-8BEN pages (the TXF-13 links) and points to TXF-12, TXF-13, TXS-05, TXF-22; IBKR's tax page and Interactive Israel's FAQ moved to BRK-50
- Split: BRK-50 holds how IBKR collects the W-8, its 30% on gross proceeds after a lapsed form, no Israeli tax on its pages, Interactive Israel's form-update FAQ
- Text: retitled "A foreign broker and tax: the W-8BEN, US withholding, and no Israeli withholding"
- JSON: strength institution → primary

#### MF-15: 2.3 example of a general rule
- Scope: general
- Sources: dropped Meitav's page; the ISA guide p.21 carries it
- Text and text_he: the Meitav quote and mention removed

#### MF-27: mixed (B with an A part → mixed, general for banks) → split
- Scope: general (MF-27); institution: Bank Leumi, IBI, Meitav (MF-56)
- Sources: added the BoI fee rules p.15 part 4(א)(1), p.16 part 4(א)(5), p.17 note 2, p.24 footnote 4; kept the ISA guide; points to MF-26 and BRK-16; Leumi's tariff, IBI's tariff and Meitav's page moved to MF-56
- Split: MF-56 holds Leumi's 0.225% standing-order rate and its custody/distribution lines, IBI's 0.08% (min NIS 5), Meitav's no buy/sell fees
- Text: retitled "Bank and broker commissions and custody on fund units: what the rules allow"
- JSON: strength institution → primary
- Open questions: MF OQ10 partly answered (banks: the BoI fee rules)

#### REG-16: general (with a correction)
- Scope: general
- Sources: the BRK-07 and BRK-08 lines (TASE rules pp.34-35, guidelines pp.95-102); dropped Meitav Trade's about page
- Text: rewritten as the TASE rule; the failure and bank-trust-cash questions stay open
- JSON: strength institution → primary; likely_to_change no → yes (2027-01-15), as BRK-07
- Open questions: REG OQ9 answered for segregation

#### REG-26: institution
- Scope: institution: Interactive Israel
- Text: heading and rule name Interactive Israel; counterpart BRK-06 (alternative-B disclosure) and REG-27; CySEC licence not checked on CySEC's register
- JSON: title, title_he

#### TXA-28: mixed in the finding → kept as one institution record
- Scope: institution: Clal Insurance, The Phoenix
- Why one record: every general part is already its own record (TXA-03, TXA-04, TXA-07, TXA-08, TXI-08, TXI-21), so a "general" TXA-28 would only repeat pointers; the record is "what insurers state"
- Text: each sentence is paired with its general counterpart in the conditions; only the real-gain base (TXA OQ1) and the notional redemption (TXA OQ17) rest on the insurers; Source line ends "General counterparts: TXA-03, TXA-04, TXA-07, TXA-08, TXI-08."
- Figures: the s.125D figures (13,440 / 3,360 / 16,560 / 4,140) stay The Phoenix's: no general source in the base carries them. TXA-07 gives no figures (it points to TXI-20 to TXI-22); TXI-20 holds the low-income deduction (10,920, ceiling 69,840) and TXI-21 the retirement-age amounts (15,000 / 18,360), and Phoenix's figures match neither
- Open questions: TXA OQ1 and OQ17 annotated, still open
- `site/app/lib/graduation.server.ts` needed no change (id kept); graduation tests pass

#### New ids

- BANK-33: Discount Bank's break mechanism and Yahav's no-break deposits (institution: Discount Bank, Bank Yahav)
- BANK-34: prime as the anchor at Leumi, Hapoalim and Yahav, and each one's prime definition (institution: Bank Leumi, Bank Hapoalim, Bank Yahav)
- BRK-46: Interactive Israel's and Bank Yahav's own 49A permit statements (institution: Interactive Israel, Bank Yahav)
- BRK-47: Leumi's custody contract terms: pooling, equivalent securities, liens, broker liability (institution: Bank Leumi)
- BRK-48: the extra fee lines of four non-bank tariffs and Excellence's "may charge less" (institution: IBI, Excellence, Altshuler Shaham Trade, Psagot)
- BRK-49: interest-on-credit-balance lines in three tariffs (institution: IBI, Excellence, Fair)
- BRK-50: how Interactive Brokers collects the W-8 and what it withholds (institution: Interactive Brokers, Interactive Israel)
- MF-56: Leumi's, IBI's and Meitav's commissions and custody on fund units (institution: Bank Leumi, IBI, Meitav)

#### Errors fixed

- REG-16: said no statute or TASE rule on segregation had been read; the TASE rules were read (BRK-07, BRK-08) and now carry it.
- BANK-25: "the anchor seen at every bank checked" was three banks; now named in BANK-34, no claim about all banks.
- BRK-24: "a tariff is a ceiling" was one member's statement (Excellence); now named in BRK-48.
- BRK-27: the open "do non-bank members withhold" is closed by the regulation's definition (TXS-05).

#### Code changes

None.

#### Left as is and why

- No company sources were dropped from records outside my list (the markets file's note on 63 primary records listing a company document is a separate pass).
- BRK-41 to BRK-44 and BRK-50: first source has no Hebrew title (English IBKR/Interactive Israel page titles); validator warning only, as before.
- BPN-10 and TXA-28 point to rule ids that have no `data/rules` record (BANK-02; TXA-03, TXA-04, TXA-07, TXA-08), so `derived_from` keeps only BANK-13 and TXI-08.

### w7-etf: ETF, TXS-15 and CAT-23 (markets findings)

Files: `etfs-and-index-funds.md`, `tax-securities-israeli.md`, `tracks-catalogue-and-decoder.md`; JSON under `data/rules/`. 19 records reviewed, 13 new ids (ETF-55 to ETF-66, TXS-25). No code edited.

#### ETF-04: 2.3, company sentence → split
- Scope: general (ETF-04); institution: IBI (ETF-55)
- Sources: kept the ISA 2024 report and the tracking-fund regulations first; the IBI report stays last, for the dormant-units sentence only (see "Left as is")
- Split: ETF-55 holds IBI's "no minimum order, no maximum creation"
- Text: dropped IBI's "(בשונה מקרן פתוחה)" quote and the IBI sentence; reg. 5(ג) (manager may announce limits) named in the conditions; text_he without IBI
- JSON: strength primary (unchanged)

#### ETF-06: mixed → split
- Scope: general (ETF-06); institution: IBI (ETF-56)
- Sources: added annual-report regulations reg. 7(14) (olaw), reg. 22 (Wikisource), tracking-fund regulations regs. 3, 5, 8(א) (gazette); dropped the IBI report (moved to ETF-56)
- Split: ETF-56 holds IBI's 2025 range and average of price-to-NAV differences, the redemption price and its daily market-maker settlement
- Text: rule rewritten as the regulations' duties (every closed fund reports the range and average; every ETF manager contracts a market maker for every pricing day)
- JSON: strength institution → primary; text_he rewritten

#### ETF-09: mixed, with a correction → split
- Scope: general (ETF-09); institution: IBI, Yalin Lapidot (ETF-57)
- Sources: added annual-report regulations reg. 18(ה) (olaw); dropped the IBI and Yalin Lapidot reports (moved to ETF-57)
- Split: ETF-57 holds the two funds' 2025 results and explanations, with the three figures moved unchanged (`ibi_sp500_fund_return_2025`, `ibi_sp500_tracking_asset_return_2025`, `yalin_sp500_fund_return_2025`, rule_ids → ETF-57); no code reads these keys
- Text: corrected (see "Errors fixed"); ISA directive s.7(ה) by id (ETF-07)
- JSON: strength institution → primary-mirror (its only source is the olaw copy); two new figures from reg. 18(ה)(2): `explanation_threshold_tracking_fund_pct` 10 and `explanation_threshold_other_fund_pct` 20 (fixed in regulation); likely_to_change yes → no, recheck_date removed

#### ETF-10: mixed → split
- Scope: general (ETF-10); institution: IBI, Yalin Lapidot (ETF-58)
- Sources: kept the ISA directive s.4 and the 2025 report; added annual-report regulations reg. 18(ב)(10) (Wikisource); dropped the two reports (moved to ETF-58)
- Split: ETF-58 holds the two funds' tracking-asset wording ("S&P 500 100%, דולר ארה"ב 100%", NTR, SPTR500N), with the note that it is proven only for these two
- Text: retitled ("the fund's policy sets what it tracks; FX outside it is neutralised"); dropped the unsourced "marked מנוטרלת מט"ח in the name" remark
- JSON: strength institution → primary

#### ETF-11: 2.3, funds' own examples → split
- Scope: general (ETF-11); institution: IBI, iShares (ETF-59)
- Sources: ISA 2024 p.20 and 2025 p.9 (the 2025 report moved from the note into the Source line); dropped the IBI report and iShares factsheet (moved to ETF-59)
- Split: ETF-59 holds IBI's OTC-derivatives description and iShares' "Physical Replication"
- JSON: strength primary; title "foreign funds hold the shares or use funded swaps" (the note's own refinement)

#### ETF-12: general
- Scope: general
- Sources: the classification regulations gazette text (ק"ת 6625, reg. 1, reg. 3(א)(4)) and the 2016 amendment (ק"ת 7653, reg. 1(2)); dropped the Yalin Lapidot and IBI reports and the IBI Maya filing; MF-54 by id
- Text: the whole scale (0 to 6, 0 and A to F), "part of the fund's name"; the open-question sentence removed; the IBI "(4A)" example dropped rather than kept named
- JSON: strength institution → primary
- Open questions: ETF-OQ9 annotated (answered by the gazette text)

#### ETF-13: mixed → split
- Scope: general (ETF-13); institution: IBI, Yalin Lapidot (ETF-60)
- Sources: annual-report regulations reg. 20 (olaw); ETF-14 and ETF-05 by id; dropped the two reports (moved to ETF-60)
- Split: ETF-60 holds both funds' 2025 rates, IBI's trustee-fee change from 1.7.2026, Yalin's fund-of-funds cost line; figures moved unchanged (`ibi_sp500_total_expenses_2025`, `ibi_sp500_fixed_fee_2025`, `yalin_sp500_total_expenses_2025`); no code reads these keys
- JSON: strength institution → primary-mirror; likely_to_change yes → no, recheck_date removed

#### ETF-19: institution
- Scope: institution: IBI
- Text: names IBI; general counterpart MF-49 (ISA guide: most Israeli funds do not distribute) and reg. 23; Source line points to MF-49
- Open questions: ETF-OQ13 partly answered (MF-49)

#### ETF-20: mixed, with a correction → split in two
- Scope: general (ETF-20); unsettled: the ISA directive on fund names; seen at: IBI, Yalin Lapidot (ETF-61); institution: IBI, Yalin Lapidot (ETF-62)
- Sources: annual-report regulations regs. 6(ג), 7(11) (olaw); classification regulations reg. 3(ב)(6) (gazette); ISA 2025 report p.3; MF-50 by id; the two reports moved to ETF-61/62
- Split: ETF-61 holds the "סל"/"מחקה" name marks with what was searched; ETF-62 the two funds' names, numbers, shekel par value and IBI's former Psagot name
- JSON: strength institution → primary; new title and text_he (currency set per fund; US-dollar units provided for)
- Open questions: ETF-OQ15 annotated (still open)

#### ETF-24: 2.3, example of the general rule
- Scope: general
- Sources: dropped BlackRock Israel's page; the sentence quoting it removed (reg. 4 requires that statement)
- JSON: text_he without the BlackRock sentence

#### ETF-27: institution
- Scope: institution: BlackRock
- Text: names BlackRock in each sentence; general counterpart ETF-32, ETF-43 (TASE quotes these funds in agorot) and ETF-24; Source line points to ETF-32, ETF-24

#### ETF-28: mixed → split
- Scope: general (ETF-28); institution: iShares (ETF-63)
- Sources: ESMA opinion ESMA34-43-296 (AMF copy, primary mirror); the three iShares pages moved to ETF-63
- Split: ETF-63 holds CSPX/IUSA classes, ISINs, TER 0.07%, listings; `cspx_ter` moved unchanged (rule_ids → ETF-63); no code reads it
- Text: "one ISIN per class" not asserted in the general record (no general source read; said so in conditions)
- JSON: strength institution → primary-mirror; likely_to_change yes → no

#### ETF-29: general
- Scope: general
- Sources: ESMA/2014/937 paras 21-24; dropped the iShares factsheet
- Text: "BlackRock states" becomes the ESMA-required warning, plus the sell-back route of paras 23-24; the factsheet's "not aimed at US or Canadian residents" dropped
- JSON: strength institution → primary

#### ETF-30: institution
- Scope: institution: iShares
- Text: names iShares; general counterpart ETF-23 (UCITS or US ICA fund), TXF-12, TXF-27; Source line points to them

#### ETF-52: 2.3, funds' own facts → split
- Scope: general (ETF-52); institution: Harel, Kesem, IBI, MTF, Mor, Tachlit (ETF-64)
- Sources: ISA 2024 p.20 and 2025 p.9; ETF-51 by id; the ten fund reports moved to ETF-64
- Split: ETF-64 holds the per-index statements, counterparties, the Harel 99.96% and Mor threshold figures (markdown only)
- JSON: strength primary; likely_to_change yes → no

#### ETF-53: mixed → split
- Scope: general (ETF-53); institution: IBI, Kesem, MTF, Mor (ETF-65)
- Sources: MSCI and Nasdaq methodology (primary, index providers); ETF-51, ETF-14, TXS-15, TXF-16 by id; the six fund reports moved to ETF-65
- Split: ETF-65 holds the net-version benchmarks, IBI's and Kesem's description of swap costs, the tax-expense lines and variable fees
- JSON: strength institution → primary; likely_to_change yes → no

#### ETF-54: mixed → split
- Scope: general (ETF-54); institution: IBI, MTF, Mor, Tachlit, Harel (ETF-66)
- Sources: annual-report regulations reg. 18(ה) (olaw) and the ISA 2025 report; ETF-09, ETF-07 by id; the ten reports moved to ETF-66
- Split: ETF-66 holds the 2025 outcomes by method and the derived before-expenses comparison
- JSON: strength institution → primary; likely_to_change yes → no

#### TXS-15: mixed → split
- Scope: general (TXS-15); institution: Migdal Mutual Funds, Yalin Lapidot (TXS-25)
- Sources: annual-report regulations reg. 20(2)(ד) (olaw); TXS-08, TXS-09, TXF-16 by id; the two prospectuses moved to TXS-25
- Text: "it is in the managers' prospectuses, not in law" removed: the regulation makes every exempt fund state it
- JSON: strength institution → primary-mirror
- Open questions: TXS-OQ8 narrowed (only the credit question in words stays open); S11 added to the file's Sources table

#### CAT-23: unsettled
- Scope: unsettled: the CMA list of investment tracks, amendment 2024-1471 of 17.4.2024 (its gov.il file); seen at: Meitav
- Text: heading and conditions say it is Meitav's quotation of the list, probably the list's content, unproven; text_he adds that line; Source line points to CAT-15
- Open questions: CAT-OQ9 annotated with the instrument (title, number, date), how it was identified (Altshuler Shaham's July 2024 change summary, institution, identification only) and every search

#### Errors fixed
- ETF-09: the annual report explains the tracking gap only when it exceeds 10% of the reference asset's change for a tracking fund (20% for others), not always.
- ETF-20: Israeli fund units are not in shekels by rule; the currency is set per fund and the regulations provide for US-dollar units (only the two funds read are in shekels, ETF-62).
- TXS-15: the "no tax except the prospectus's exceptions" statement is a regulation (reg. 20(2)(ד)), not only prospectus wording.
- ETF-12: the full exposure scale replaces "only 4 and D were read".
- ETF-29: the warning is ESMA's required wording, not BlackRock's statement.

#### Code changes
None.

#### New ids
- ETF-55: IBI's S&P 500 ETF has no minimum order and no maximum creation (institution: IBI)
- ETF-56: IBI's S&P 500 ETF price-to-NAV differences 2025 and daily market-maker settlement (institution: IBI)
- ETF-57: IBI and Yalin Lapidot 2025 tracking results and explanations, three figures (institution: IBI, Yalin Lapidot)
- ETF-58: IBI and Yalin Lapidot tracking-asset wording (institution: IBI, Yalin Lapidot)
- ETF-59: IBI and iShares replication descriptions (institution: IBI, iShares)
- ETF-60: IBI and Yalin Lapidot 2025 expense rates, three figures (institution: IBI, Yalin Lapidot)
- ETF-61: "סל"/"מחקה" in fund names (unsettled: the ISA directive on fund names; seen at: IBI, Yalin Lapidot)
- ETF-62: the two funds' names, TASE numbers, shekel par value, IBI's rename (institution: IBI, Yalin Lapidot)
- ETF-63: iShares Core S&P 500 UCITS classes, ISINs, TER, listings, `cspx_ter` (institution: iShares)
- ETF-64: per-index replication statements from ten fund reports (institution: Harel, Kesem, IBI, MTF, Mor, Tachlit)
- ETF-65: swap funds' benchmarks, swap-cost descriptions, tax-expense lines (institution: IBI, Kesem, MTF, Mor)
- ETF-66: 2025 tracking outcomes by method (institution: IBI, MTF, Mor, Tachlit, Harel)
- TXS-25: Migdal and Yalin Lapidot prospectus list of foreign-tax situations (institution: Migdal Mutual Funds, Yalin Lapidot)

#### Left as is and why
- ETF-04: the dormant-units sentence ("יחידות רדומות", "המחסנית") still rests on the IBI report, kept last on the Source line for that sentence; the finding ruled only on IBI's no-minimum sentence, and whether regs. 4-6 state the mechanism was not checked. Its scope line says general.
- CAT-09, CAT-17, CAT-24 (sweep 2.3, Meitav and Harel examples): in no batch; untouched.
- The markets finding's closing note (the 63 primary records that list a company document beside the general rule): not a verdict on named records; not done.
