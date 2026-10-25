# Open questions of the rule base: audit, 2026-10-26

The founder asked: "look at all the so called 'open questions' and check if any are answered already and which ones remain." This report covers every numbered item in the "## Open questions" sections of the il-finance rule base (`.claude/skills/il-finance/references/`): 493 items in 29 files.

Method. Phase A classified every item from the rule base alone (the item's own dated notes, later passes, the file's rules, other files, `data/rules`, coverage.md), with no web. An item counts as answered only when the answer is in a source the rule base already cites; a company's document cannot close a question about a general rule (D30), so such an item is "narrowed". Answered items were struck in the format the site reads, `~~<question>~~ Closed <date>: <one line> (<rule ids>)`, dated by the note that answered them. Phase B made one focused attempt, on the web, to settle every item still open or narrowed that something on the site depends on, looking for the law, a regulation, a regulator's circular or Q&A, or a standard bylaw; every closure carries the exact quote, the URL, the page or section and checked 2026-10-26. Five helpers (Opus, xhigh) split the 29 files under one brief (`2026-10-26-open-questions/brief.md`); the lead reviewed their closures, spot-checked the sources of the ones the site depends on (ruling 6849/15, the Tax Authority guide's order of computation, circular 2/2013) and applied the three leads from the glossary research. Working files: `2026-10-26-open-questions/` (inputs, each helper's JSONL, `merged.json`, `table-before.json`, `table-after.json`, `lead-overrides.jsonl`, and the scripts that build this report).

What "the site depends on it" means here: guide prose names it in an open-question chip (`<IdRef id="… OQn">` in `site/app/content/`, which replaced `<OQ>` in commit 29b8362); it is a tier-2 blocker on the not-covered page (method G-24 and `tier2Table`); a method gap G-xx cites it; a wrapper or exposure record in `data/instruments/` lists it or blocks a dimension on it (shown on guide pages); site code or `copy.ts` names it; a rule record's text names it; or a tier-2 file's Graduation status names it.

## Counts

| Class | Before | After |
|---|---|---|
| Closed and struck | 4 | 101 |
| Answered, not marked | 64 | 0 |
| Narrowed | 120 | 135 |
| Open | 305 | 257 |
| **Total** | **493** | **493** |

- **Already answered: 68.** 4 were struck before today; 64 were answered in the rule base but not struck, and are struck now (Phase A).
- **Settled today from a new source: 33** (Phase B; 31 by the helpers, 2 by the lead: the CMA track list, and circular 2/2013 on the exempt commutation of a recognized annuity).
- **Remaining: 392** (135 narrowed, 257 open). Of these, **61 change something on the site** (an open-question chip in guide prose, a tier-2 blocker, a method gap, or a blocked guide dimension); the rest are named only in a rule record or a guide record's list, or nowhere.
- Six new rules were written where no rule fitted an answer: BANK-35, GOV-24, ETF-67, TXF-28, TXK-27, TXA-30 (none has a `data/rules` record yet).

Per file:

| File | Items | Closed before | Answered, not marked | Closed after | Narrowed after | Open after |
|---|---|---|---|---|---|---|
| `bank-current-account-deposits.md` | 18 | 0 | 0 | 2 | 7 | 9 |
| `bank-product-names.md` | 21 | 0 | 1 | 1 | 2 | 18 |
| `brokerage-account.md` | 21 | 0 | 6 | 6 | 9 | 6 |
| `child-savings.md` | 17 | 1 | 2 | 6 | 8 | 3 |
| `corporate-bonds.md` | 15 | 0 | 0 | 0 | 2 | 13 |
| `etfs-and-index-funds.md` | 28 | 0 | 3 | 4 | 7 | 17 |
| `fx-and-structured-deposits.md` | 12 | 0 | 0 | 0 | 2 | 10 |
| `government-bonds-and-makam.md` | 14 | 1 | 1 | 5 | 7 | 2 |
| `ira-self-directed.md` | 15 | 1 | 2 | 4 | 3 | 8 |
| `keren-hishtalmut.md` | 16 | 0 | 5 | 7 | 3 | 6 |
| `kupat-gemel-lehashkaa.md` | 14 | 0 | 4 | 4 | 4 | 6 |
| `managed-and-robo-portfolios.md` | 17 | 0 | 1 | 1 | 4 | 12 |
| `mutual-funds-and-money-market-funds.md` | 17 | 0 | 2 | 2 | 7 | 8 |
| `pension-and-gemel-lekitzba.md` | 22 | 0 | 10 | 10 | 3 | 9 |
| `provident-family-common.md` | 16 | 0 | 4 | 4 | 6 | 6 |
| `regulators-and-protection.md` | 21 | 0 | 2 | 2 | 9 | 10 |
| `reits-and-gold-funds.md` | 15 | 0 | 0 | 1 | 1 | 13 |
| `savings-policies-and-executive-insurance.md` | 16 | 0 | 2 | 2 | 3 | 11 |
| `switching-and-transfers.md` | 16 | 0 | 1 | 2 | 7 | 7 |
| `tax-gemel-lehashkaa-ira-child.md` | 12 | 0 | 2 | 3 | 4 | 5 |
| `tax-general.md` | 13 | 0 | 0 | 3 | 4 | 6 |
| `tax-hishtalmut.md` | 14 | 0 | 1 | 3 | 4 | 7 |
| `tax-insurance-and-amendment-190.md` | 17 | 1 | 0 | 4 | 4 | 9 |
| `tax-interest-deposits-bonds.md` | 18 | 0 | 2 | 5 | 5 | 8 |
| `tax-pension-gemel-lekitzba.md` | 16 | 0 | 5 | 7 | 3 | 6 |
| `tax-securities-foreign.md` | 17 | 0 | 1 | 2 | 3 | 12 |
| `tax-securities-israeli.md` | 15 | 0 | 1 | 4 | 5 | 6 |
| `tax-tier2-other.md` | 17 | 0 | 2 | 2 | 6 | 9 |
| `tracks-catalogue-and-decoder.md` | 23 | 0 | 4 | 5 | 3 | 15 |

## What changed beyond the struck lines

- **Tier-2 blockers (method G-24, `site/app/lib/compare.server.ts` `tier2Table`, `packages/engine/test/golden/r2-compare.test.ts`):**
  - Managed portfolios: TX2 OQ12 (VAT on the fee) was answered on 2026-10-24 by TX2-17 and is struck; the blocker is MF-28 alone.
  - Foreign-currency deposits: TX2 OQ1 (a falling currency) was answered on 2026-10-22 by the Supreme Court ruling in TXI-25 and is struck; the blocker is TX2 OQ2 alone.
  - Amendment 190 deposits: TXA OQ9 and OQ10 (the age ceilings and the age-60 and payslip conditions) are settled by the Tax Authority's ruling 6849/15 (TXA-30), and TXA OQ11 (the exempt commutation together with the recognized annuity) by circular 2/2013 s.5.2.5. The blockers are now TXA OQ14 (National Insurance) and TXA OQ15 (surtax), the two the Graduation status still lists; both are narrowed.
- **Graduation status sections:** struck closures added for INS OQ7 (savings policy), TX2 OQ1 (FX deposits), RG OQ3 (REITs), and TXA OQ3 and OQ9 to 11 (TXA file); MGD and FXD got dated notes; RG's "per-distribution source split (OQ 5)" mislabel was corrected. The not-covered page now shows the INS OQ7, TX2 OQ1 and RG OQ3 closures. `graduation.server.ts` has no `sources` entry for Amendment 190 deposits, so closures for that instrument never show on the page.
- **coverage.md (references copy):** 28 lines updated to strike or narrow what closed, plus the count in its opening paragraph. `research/knowledge/coverage.md` is a stale copy from the scaffold commit (2026-10-22) and was not edited.
- **Re-sourced records from the glossary research's leads (lead):**
  - CAT-23 now rests on the CMA's list of investment tracks (2024-1471, 17.4.2024, gov.il) instead of Meitav's notices; Scope `general`; CAT OQ9 closed; CAT-15 updated.
  - PEN-14, PEN-20 and PEN-32 now cite the CMA standard pension bylaw (circular 2016-3-4 annex ב', January 2018 edition, prisha.co.il copy): ss.13, 34, 35, 39(א); ss.45, 111; s.1 "מוטב", s.50(ג), s.115. Mor stays cited only for what is Mor's own (the two qualifying-period exclusions, its 4.38% rate, its provident-fund small-balance rule).
  - MGD-21 now rests on the ISA's technological-means directive itself (December 2024 file); MGD OQ2 is narrowed (the needs-clarification directive is still unread). The secondary summary's "update every 12 months" is not in the current text (s.9 is cancelled from 7.8.2022).
- **Rule records:** `npm run extract:sources` rewrote the `sources` of 27 records in `data/rules/` (bank-07, bank-17, bank-21, cat-23, cs-13, cs-15, cs-16, gov-13, gov-14, gov-18, ira-03, kh-12, pen-18, sw-10, sw-26, txh-10, txh-11, txi-08, txi-13, txi-15, txi-17, txk-06, txp-11, txp-18, txs-06, txs-11, txs-23). `npm run validate` passes ("data/ is valid"; warnings only), and `npx vitest run site packages/engine` passes (63 files, 859 tests), as do the pipeline and schema tests.

## Where the site still names a question that is now closed

These need the lead: site content, copy and data records were not edited in this audit.

**Open-question chips in guide prose (`site/app/content/`):**

- ETF OQ12 (closed 2026-10-26): site/app/content/exposure/index-ta125.tsx:53
- GOV OQ5 (closed 2026-10-26): site/app/content/exposure/government-bond-unlinked.tsx:39
- IRA OQ3 (closed 2026-10-25): site/app/content/guide/ira-hishtalmut.tsx:38, site/app/content/guide/ira-provident.tsx:42
- PEN OQ8 (closed 2026-10-25): site/app/content/guide/pension-comprehensive.tsx:56
- TXH OQ1 (closed 2026-10-26): site/app/content/exposure/index-sp500.tsx:42
- TXP OQ3 (closed 2026-10-26): site/app/content/guide/ira-provident.tsx:39, site/app/content/guide/pension-comprehensive.tsx:46, site/app/content/guide/pension-general.tsx:42, site/app/content/guide/provident-for-annuity.tsx:42
- CAT OQ9 (closed 2026-10-26): site/app/content/exposure/general-track.tsx:39, site/app/content/exposure/index-ta125.tsx:41

**Site code and copy:**

- PF OQ5 (closed 2026-10-23): copy.ts:1684, copy.ts:1686
- SW OQ6 (closed 2026-10-26): copy.ts:2442, lib/playbook.ts:88
- TXK OQ12 (closed 2026-10-26): copy.ts:598

Also: the `copy.ts` flag for method gap G-11 now holds only for the recognized annuity (the lump sum is TXK-27); the playbook's SW OQ9 line is partly answered (SW-26 now gives the account and activity types; which banks are exempt and how the "sixth business day" counts remain).

**Guide records (`data/instruments/`) that block a dimension on a closed question:**

- BANK OQ9 (closed 2026-10-26): current-account
- PEN OQ8 (closed 2026-10-25): pension-comprehensive
- TXK OQ12 (closed 2026-10-26): kupat-gemel-lehashkaa
- TXI OQ7 (closed 2026-10-26): bank-deposit, current-account, savings-plan
- TXP OQ3 (closed 2026-10-26): ira-provident, pension-comprehensive, pension-general, provident-for-annuity
- TXS OQ11 (closed 2026-10-26): money-market-fund-daily, money-market-fund-renewable

`minimum: blocked:GOV-OQ7` in `makam.json` and `government-bond.json` could now rest on GOV-24 (the TASE minimum order), though GOV OQ7 itself stays open for the settlement cycle.

**Guide records that list a closed question in `open_questions`:**

- BANK OQ9 (closed 2026-10-26): current-account
- BRK OQ3 (closed 2026-10-25): brokerage-account
- BRK OQ10 (closed 2026-10-22): brokerage-account
- BRK OQ16 (closed 2026-10-25): brokerage-account
- CS OQ5 (closed 2026-10-26): child-savings-bank, child-savings-provident
- CS OQ13 (closed 2026-10-26): child-savings-provident
- CS OQ14 (closed 2026-10-25): child-savings-bank
- ETF OQ12 (closed 2026-10-26): index-ta125
- GOV OQ5 (closed 2026-10-26): government-bond, government-bond-unlinked
- GOV OQ12 (closed 2026-10-26): government-bond-cpi, government-bond-unlinked
- IRA OQ3 (closed 2026-10-25): ira-hishtalmut, ira-provident
- IRA OQ4 (closed 2026-10-26): ira-provident
- IRA OQ8 (closed 2026-10-25): ira-hishtalmut, ira-provident
- KH OQ1 (closed 2026-10-25): keren-hishtalmut
- KH OQ2 (closed 2026-10-25): keren-hishtalmut
- KH OQ6 (closed 2026-10-25): keren-hishtalmut
- KH OQ8 (closed 2026-10-26): keren-hishtalmut
- KH OQ11 (closed 2026-10-26): keren-hishtalmut
- MF OQ2 (closed 2026-10-25): money-market-fund-daily, money-market-fund-renewable
- PEN OQ5 (closed 2026-10-25): pension-comprehensive, pension-general
- PEN OQ6 (closed 2026-10-25): pension-comprehensive, pension-general
- PEN OQ8 (closed 2026-10-25): pension-comprehensive
- PEN OQ10 (closed 2026-10-25): pension-comprehensive, pension-general
- PEN OQ13 (closed 2026-10-25): pension-comprehensive, pension-general
- PEN OQ18 (closed 2026-10-25): provident-for-annuity
- TXK OQ2 (closed 2026-10-25): kupat-gemel-lehashkaa
- TXK OQ12 (closed 2026-10-26): kupat-gemel-lehashkaa
- TXH OQ1 (closed 2026-10-26): ira-hishtalmut, keren-hishtalmut
- TXH OQ5 (closed 2026-10-26): keren-hishtalmut
- TXI OQ7 (closed 2026-10-26): bank-deposit, current-account, savings-plan
- TXI OQ8 (closed 2026-10-26): government-bond, government-bond-unlinked
- TXP OQ3 (closed 2026-10-26): ira-provident, pension-comprehensive, pension-general, provident-for-annuity
- TXF OQ6 (closed 2026-10-26): index-sp500
- TXS OQ6 (closed 2026-10-26): money-market-fund-daily, money-market-fund-renewable
- CAT OQ9 (closed 2026-10-26): general-track, index-sp500, index-ta125

**Rule records whose text names a closed question:**

- BANK OQ3 (closed 2026-10-26): BANK-07
- BANK OQ9 (closed 2026-10-26): BANK-17
- CS OQ6 (closed 2026-10-26): CS-15
- ETF OQ20 (closed 2026-10-23): ETF-33
- TXI OQ18 (closed 2026-10-26): TXI-08
- TXF OQ16 (closed 2026-10-25): TXF-21

**Method gaps that cite a closed question (`docs/method.md`; only G-24 was edited):**

- TXK OQ2 (closed 2026-10-25): G-02
- TXG OQ6 (closed 2026-10-26): G-23
- TXG OQ7 (closed 2026-10-26): G-21
- TXG OQ12 (closed 2026-10-26): G-21
- TXP OQ3 (closed 2026-10-26): G-06
- TXF OQ6 (closed 2026-10-26): G-05

Proposed: G-05 can close (Irish exit tax is not deducted on ETF units held in a clearing system or paid to a declared non-resident, TXF-28; F-20's 0 is now sourced). G-06 can close (the taxable base of a non-compliant withdrawal is the whole amount, at 35% or the ordinary tax if higher, TXP-18), which unblocks F-48. G-21's assumption is confirmed (banks withhold no surtax and the full rate whatever the age; settlement is through the return or form 0135, TXG-08, TXG-11, TXS-23). G-23 is answered: credit points come off the whole computed tax, special-rate income included (TXG-05, the Tax Authority guide's order of computation), so the method could apply them. G-11 is answered for the kupat gemel lehashkaa lump sum (TXK-27) and narrowed for the recognized annuity (TXA OQ14). F-44's note that the 60+ reduction is open (TXK OQ12) is out of date: the lower brackets apply. G-13 is narrowed (the 1980 regulations make the 2026 caps computable; the 16.5% rate is unconfirmed). G-20: reg. 8 of the 2002 withholding regulations lets a bank deduct fees at withholding where the Director approved it. G-27's text is partly stale (TXG-35 now holds employee NII rates).

## Hand-offs for the lead

1. **New rules without a `data/rules` record:** BANK-35 (2026 fee caps on payment-account management and immediate-debit cards; the track definitions end 1.7.2027), GOV-24 (TASE trading rules for government bonds and makam: unit, minimum order NIS 10,000, price steps), ETF-67 (TASE trading unit and minimum order for ETFs: NIS 500 equity market, NIS 2,000 bond market), TXF-28 (no Irish exit tax on clearing-system ETF units), TXK-27 (no NII or health on a kupat gemel lehashkaa lump sum's gains), TXA-30 (ruling 6849/15).
2. **Records whose Hebrew text is now behind their source:** `cat-23.json` (title_he and text_he still say "לפי הודעות התקנון של מיטב"; strength `institution` while its only source is primary, which the validator warns about), and the stale notes the helpers listed in `etf-33`, `txf-16`, `txf-21`, `txs-11`, `txs-23`, `gov-14` (its interest-period figure is from the 1999 type), `cs-15`, `pf-33`.
3. **Stale rule text in the markdown that the audit did not rewrite** (outside the items it closed): BRK-03, BRK-15, BRK-16, BRK-26, BRK-30, MF-28, MF-39, MF-08, TXS-12 and the TXS Summary (taxable money-market funds, which contradicts TXS-24), TXI-05 and the TXI Summary and worked-statement table (NII on interest, Gilon), the GOV Summary (the 0% floor holds only for the old גילון חדש) and the GOV-14 heading and terms ("former names"), GOV-13 (still cites Wikipedia for the name mapping), PEN-04, PEN-07, PEN-25, PEN-26, TXP-16, TXP-19, KGL-14, TXK-02, TXK-16, KH-23 and IRA-17 (fee-field units), TX2-09 (Amendment 285's new 70% "הכנסות חריגות" case).
4. **Scope calls for the scope review:**
   - TXA-30 is marked `general`: the ruling was made in agreement with one unnamed company, but the Tax Authority publishes its summaries as its position for similar cases, and every fund's 2026 table matches its factors. TXA-22, TXA-23 and TXA-24 now cite it beside the fund documents and may move to general.
   - KH-23 joins company terms (Altshuler Shaham, Harel, Meitav) with the general circular 2017-9-15; under D30 it should be split.
   - CAT-23 was moved to `general` here (the CMA list carries every text it quotes).
   - TXP OQ5 is closed on Income Tax circular 4/2019 read on Menora's site (mvs.co.il), labelled "primary (third-party host)" like the CMA circulars on prisha.co.il; no gov.il copy was found (four guessed BlobFolder names, one search).
5. **Judgement calls to look at:**
   - TX2 OQ1 is closed from the Supreme Court ruling on a foreign-currency-linked deposit (TXI-25), extended to a deposit held in foreign currency through the Ordinance's s.1 definitions ("הפרשי שער" on a deposit in foreign currency are linkage differentials), as TX2-01 already reads them.
   - CAT OQ12 and CAT OQ19 are closed as "not needed" under the founder's decision D17 (2026-10-23), not answered.
   - BANK OQ3 and TXI OQ18 rest on the Wikisource consolidated texts listing no later amendment (a mirror, and evidence of absence).
   - TXG OQ6 rests on the Tax Authority guide's order of computation (special-rate income goes into the computed tax, then credit points come off the computed tax), not on a sentence naming special-rate tax.
   - TXS OQ11: circular 7/2003 s.2.1.1 says a taxable fund pays an individual's rates; the circular's own figures are 2003 rates, today's come from the Ordinance.
   - TXA OQ11 is closed on circular 2/2013 s.5.2.5, whose PDF prints numbers through a broken digit font (5.2.5 shows as "21512", 15% as "12%"); the reading was checked against the neighbouring sections.
   - Left narrowed although a note says "Closed by": BANK OQ13 (BANK-30 is a Bank of Jerusalem article and cannot prove Leumi's usage), GOV OQ9 (GOV-22 covers makam only), BRK OQ7 (BRK-35 says the Irish scheme's own page was not reached), TXS OQ1 (TXS-24 counts open-end funds only).
   - Kept narrowed although the item reads answered: PF OQ16 (the gov.il copy of circular 2020-9-22 exists; whether the 2025-26 draft was adopted is open), IRA OQ12 (CAT-40 marks the meaning of an empty fee value as inferred).
6. **Contradictions found:** the non-bank fee snapshots (Altshuler Trade, Excellence, IBI, Psagot) apply custody to money-market units, which may conflict with MF-26 (under a distribution agreement a distributor charges no holding fee on them); TXG-17 says the 2,810,000 securities exemption also covers proceeds where an advance was paid, while the regulation's definition covers only exempt or fully withheld income; REG-21 gives 1.7.2022 for the pension return guarantee and PEN-18 gives 1.10.2022, citing the same law; no company named Psagot is among the ISA register's 129 portfolio managers (MGD-23).
7. **Leads across files:** TXG OQ7 and TXS OQ6 close with the same reg. 11; SW OQ10 and SW-52 are the same question as BRK OQ12, and a Bank of Israel position filed in court in 2021 (`boi.org.il/media/e4xji1rw/202207.pdf`) explains supervised prices.

## Blocked pages, for a person to open

- https://apicontent.tase.co.il/api/Cms?Route=/he/content/knowledge_center/trading_hours (for ETF OQ1, ETF OQ2, MF OQ3)
- https://boi.org.il/publications/pressreleases/%D7%A1%D7%95%D7%92%D7%99%D7%95%D7%AA-%D7%A9%D7%9B%D7%A8%D7%95%D7%9B%D7%95%D7%AA-%D7%91%D7%94%D7%97%D7%9C%D7%AA-%D7%91%D7%99%D7%98%D7%95%D7%97-%D7%A4%D7%99%D7%A7%D7%93%D7%95%D7%A0%D7%95%D7%AA/ (for REG OQ13)
- https://boi.org.il/roles/supervisionregulation/legislation/leg167/ (for SW OQ9)
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52017XC0707(02) (for ETF OQ11)
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014R1286 (for ETF OQ11)
- https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2 (for TX2 OQ1)
- https://www.boi.org.il/information/bank-paymnts/savingsandinvestmentproducts/ (for BANK OQ8, BANK OQ14, FXD OQ1, GOV OQ9)
- https://www.new.isa.gov.il/nav-index/api/mutualfunds-foreignfunds-active-search (for ETF OQ4)

## Closures made today

### Settled from a new source (Phase B), with the source

- **BANK OQ3** (2026-10-26): the consolidated text lists amendments only to ק"ת תשע"ה p.554 (2015); ss.7-12 were last amended in 2003 or earlier, s.33B in 2003 and Schedule E in 1993, which still shows NIS 75 (s.8) and NIS 1,000 (s.11); the 2015 changes to ss.13, 14 and 30 leave the deposit provisions as the rules state them (BANK-07, BANK-08, BANK-09, BANK-10)
  - Source: [כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, נוסח משולב (ויקיטקסט, מראה של החוק)](https://he.wikisource.org/wiki/כללי_הבנקאות_(שירות_ללקוח)_(גילוי_נאות_ומסירת_מסמכים)), raw wikitext: header amendment list (last ק"ת תשע"ה, 554); amendment tags of ss.7-14, 30, 33ב; Schedule E table: "הודעה מוקדמת על פרעון פקדון לשנה ומעלה" · checked 2026-10-26
- **BANK OQ9** (2026-10-26): the controlling order is צו הבנקאות (שירות ללקוח) (פיקוח על שירות מסלול בסיסי), התשע"ד-2014, whose s.3 caps the basic track at NIS 10 a month from 1.4.2014; a 2026 order repeals it on 1.7.2027 and caps payment-account management fees instead, and the fee rules then stop defining tracks (BANK-17, BANK-35)
  - Source: [צו הבנקאות (שירות ללקוח) (פיקוח על שירות מסלול בסיסי), התשע"ד-2014, קובץ התקנות 7360 (26.3.2014), סריקת רשומות](https://olaw.org.il/takanot/takanot-7360.pdf), p.1001, s.3: "סכום העמלה המרבי, שניתן לגבות בעד שירות מסלול בסיסי, יהיה 10 שקלים חדשים בחודש" · checked 2026-10-26
- **CS OQ5** (2026-10-26): Closed 2026-10-26: the pre-2017 wording of law 74ג(א) ("מענק המשיכה הראשון" at 18), which the 2016 Economic Efficiency Law repealed only for children born from 1.1.2017 (its s.163 applies the new 74ב(א)(1), 74ג and 74ד to a child born on or after its start) (CS-13).
  - Source: [חוק ההתייעלות הכלכלית (תיקוני חקיקה להשגת יעדי המדיניות הכלכלית לשנות התקציב 2017 ו-2018), התשע"ז-2016, ספר החוקים 2592](https://fs.knesset.gov.il/20/law/20_lsr_366872.pdf), p.318, ss.162-164 (s.163 application): "סעיפים 74ב(א)(1), 74ג ו-74ד לחוק הביטוח הלאומי, כנוסחם בסעיף 162(1)(א), (2) ו-(3) לחוק זה, יחולו על ילד זכאי, כמשמעותו בסעיף 74ב לחוק האמור, שנולד ביום תחילתו של חוק זה ואילך" · checked 2026-10-26
- **CS OQ6** (2026-10-26): Closed 2026-10-26: by birth cohort; for a child born from 1.1.2017 NII deposits the age-3 and age-13 (12 for a girl) sums of 74ב(א)(1)(א)-(ב), and for a child born before, the old 74ד(ב) gives the age-18 "first withdrawal grant" (NIS 582 in 2026) (CS-15, CS-13).
  - Source: [חוק הביטוח הלאומי [נוסח משולב], התשנ"ה-1995, נוסח המוסד לביטוח לאומי](https://www.btl.gov.il/Laws1/00_0001_000000.pdf), p.52, s.74ד(ב) and footnote 39; with ספר החוקים 2592 p.318, s.163: "התקיימו הוראות סעיף קטן (א), יעביר המוסד לחשבון שבו מנוהל סכום החיסכון הצבור הכולל את הסכומים הנוספים המפורטים בסעיף 74ב(א)(1)(א) ו-(ב)" · checked 2026-10-26
- **CS OQ13** (2026-10-26): Closed 2026-10-26: from 18 the child may move the money to any kupat gemel lehashkaa, not only a child-savings one, since reg. 11(ב) applies the Provident Funds Law transfer rules and transfer reg. 3(א)(11א) allows a move to any other kupat gemel lehashkaa; no new money may be added to the child-savings account (reg. 2) (CS-16, SW-21).
  - Source: [תקנות הביטוח הלאומי (חיסכון ארוך טווח לילד), התשע"ז-2016, קובץ התקנות 7727](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/8OfazOM9J2n~VjyzV5AWsITYS27PjZHrqw3iJWE0YJI=#page=10), p.10, reg. 11(ב); with קובץ התקנות 8735 p.2, reg. 3(א)(11א): "יהיה הילד הזכאי רשאי להורות על העברת כספים בין קופות גמל להשקעה או בין מסלולים בקופות גמל להשקעה לפי ההוראות הקבועות לעניין זה מכוח חוק קופות גמל" · checked 2026-10-26
- **ETF OQ12** (2026-10-26): TASE's guidelines to part three of its rules make the trading unit one ETF unit (one unit of a foreign fund), and the board set the minimum order in continuous trading at NIS 500 for equity-market ETFs and foreign funds and NIS 2,000 in the bond market (ETF-67).
  - Source: [מדריך המסחר בבורסה: הנחיות על פי החלק השלישי לתקנון (TASE)](https://content.tase.co.il/media/mwsduioc/274698.pdf), file p.9, ch. ב' s.1(י); minimum order: file p.41, ch. ה' s.2ב(2)(א) and the board decision under it ('ביתר ניירות הערך המוזכרים בסעיף זה - 500 ש"ח'): "בקרנות סל - יחידת מסחר הינה יחידת קרן סל אחת" · checked 2026-10-26
- **GOV OQ5** (2026-10-26): the series auctioned now are the type "אג"ח ממשלתית בריבית משתנה" (first issued 8.1.2008; "גילון חדש" is no longer issued), governed by the 2006 regulations as amended in 2007: the rate is the money-weighted average daily gross yield of the makam series closest to one year to redemption over the five trading days before the last trading day of each three-month period, paid quarterly, with no margin or floor in the text (GOV-14)
  - Source: [משרד האוצר, אגף החשב הכללי: מאפייני אג"ח סחיר ולא סחיר ותקנותיו (מדריך, פורסם 24.08.2020)](https://www.gov.il/he/pages/govermental-bonds), tab "מאפייני אג"ח סחיר" (table updated 02.01.2011), table "אג"ח לא צמוד": "אג"ח ממשלתית בריבית משתנה 8.1.2008 משתנה: על פי תשואות מק"מ לתקופה של 12 חודשים אחת ל-3 חודשים" · checked 2026-10-26
- **GOV OQ12** (2026-10-26): the Accountant General lists the old and new names as separate types with their own regulations and first-issue dates, not a renaming: CPI-linked "גליל" (31.12.1984) and "אג"ח ממשלתית צמודה" (26.6.2006); unlinked "גילון חדש" (28.4.1999, no longer issued), "אג"ח ממשלתית בריבית משתנה" (8.1.2008), "שחר" (24.8.1995) and "אג"ח ממשלתית" (6.11.2006); the 2006 regulations were approved on 12.12.2005 (GOV-13, GOV-14)
  - Source: [משרד האוצר, אגף החשב הכללי: מאפייני אג"ח סחיר ולא סחיר ותקנותיו (מדריך, פורסם 24.08.2020)](https://www.gov.il/he/pages/govermental-bonds), tab "תקנות אג"ח סחיר" (updated 7.8.2007); tab "מאפייני אג"ח סחיר" (updated 02.01.2011): "ועדת הכספים של הכנסת אישרה בתאריך 12.12.2005 את התקנתן של תקנות מלווה המדינה עבור אג"ח ממשלתית, אג"ח ממשלתית צמודה ואג"ח ממשלתית בריבית משתנה" · checked 2026-10-26
- **GOV OQ13** (2026-10-26): the Accountant General lists "מירון" as a non-tradable CPI-linked bond first issued 30.11.1983 (fixed 5.5%, interest every six months, 20 years) that is no longer issued (GOV-18)
  - Source: [משרד האוצר, אגף החשב הכללי: מאפייני אג"ח סחיר ולא סחיר ותקנותיו (מדריך, פורסם 24.08.2020)](https://www.gov.il/he/pages/govermental-bonds), tab "מאפייני אג"ח לא סחיר" (updated 13.2.2007), table "אג"ח צמוד לא סחיר": "מירון* 30.11.1983 קבועה 5.5% אחת ל-6 חודשים 20 שנה" · checked 2026-10-26
- **IRA OQ4** (2026-10-26): Closed 2026-10-26: no; the law's definition of "קופת גמל בניהול אישי" lists only a fund approved as a tagmulim fund, an annuity fund or a study fund, and an insurance plan approved as tagmulim or annuity, and Amendment 15, which created the kupat gemel lehashkaa, did not add it (IRA-03, IRA-01, TXK-16).
  - Source: [חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005, consolidated text (Wikisource, mirror of the law, amendments listed to 2026)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)), s.1, definition of קופת גמל בניהול אישי (s.1 last amended תשפ"ב): "”קופת גמל בניהול אישי“ – קרן שאושרה לפי הוראות סעיף 13(א) כקופת גמל לתגמולים, כקופת גמל לקצבה או כקרן השתלמות, או תכנית ביטוח שאושרה לפי הוראות סעיף 13(ב) כקופת גמל לתגמולים או כקופת גמל לקצבה" · checked 2026-10-26
- **KH OQ8** (2026-10-26): Closed 2026-10-26: the s.3 age of the Retirement Age Law, the only age that law names "גיל הפרישה", which the Ordinance's s.1 definition adopts (KH-12, TXH-10).
  - Source: [חוק גיל פרישה, התשס"ד-2004 (ספר החוקים, as enacted)](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf), p.1, ss.3-5; with Ordinance s.1 (Tax Authority text p.12) and deductions booklet 2026 p.7 item 4: "(בחוק זה – גיל הפרישה)" · checked 2026-10-26
- **KH OQ11** (2026-10-26): Closed 2026-10-26: CMA circular 2017-9-15 applies to study-fund managers: a discount lasts at least five years, and an early raise is allowed six months after deposits stop for a reason other than the employer, or on a withdrawal or transfer, after notice (PF-13, PF-14, PF-15, PF-16, KH-23).
  - Source: [חוזר גופים מוסדיים 2017-9-15 – דמי ניהול במכשירי החיסכון הפנסיוני – תיקון (CMA)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-989/he/regulation_h_2017-9-15.pdf), p.1 s.3(א); p.2 s.3(ב)(1); p.3 s.5(א): "חוזר זה יחול על כל הגופים המוסדיים, למעט חברה מנהלת של קופת גמל ענפית, חברה מנהלת של קופת גמל מבטיחת תשואה" · checked 2026-10-26
- **RG OQ3** (2026-10-26): Distributing under s.64A9 is a condition of REIT status (s.64A3(a)(7)), and a company in which a condition stops being met ceases to be a REIT (s.64A3(ד)(1)), with a three-month cure only for the (5א) tests; no authority confirms status: an auditor's certificate is attached to each annual return (s.64A3(a)(8)) (RG-07, RG-08).
  - Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.105, s.64א3(ד)(1); p.104, s.64א3(א)(7), (8): "חדל להתקיים בחברה תנאי מהתנאים המנויים בסעיף קטן (א), תחדל להיות קרן להשקעות במקרקעין" · checked 2026-10-26
- **SW OQ6** (2026-10-26): the receiving fund; under the CMA joining circular s.4(ו)-(ז) the managing company sends the employer the annex ו notice within 10 business days of approving the member's joining, if the employer has not yet deposited to it, and the employer acts on the employee's choice no later than the month after the month it received the notice (SW-10)
  - Source: [חוזר גופים מוסדיים 2016-9-19 – הצטרפות לקרן פנסיה או לקופת גמל (29.9.2016)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/regulation-1071/he/regulation_h_2016-9-19.pdf), p.2, s.4(ו); p.3, s.4(ז): "חברה מנהלת תשלח הודעה למעסיק בנוסח שבנספח ו' לחוזר זה בתוך 10 ימי עסקים מהיום שבו אושרה בקשתו של העמית להצטרף לקרן" · checked 2026-10-26
- **TXK OQ12** (2026-10-26): Closed 2026-10-26: yes, s.125C(b) is a maximum rate ("שלא יעלה על 25%"), which s.125C(e) applies to these gains, a maximum rate lets lower brackets apply first, and s.121(ב)(1) gives the 10% to 31% brackets to all taxable income of an individual aged 60 or over; the gains are the top slice, so it helps only where other income leaves those brackets unused (TXK-06, TXI-19, TXG-08).
  - Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.201, s.121(ב)(1); p.204, s.125ג(ב), (ה); with Tax Authority guide 2025 p.40: "לגבי הכנסה חייבת בשנת המס מיגיעה אישית ולגבי הכנסה חייבת בשנת המס של יחיד שמלאו לו 60 שנים, יחולו שיעורים אלה" · checked 2026-10-26
- **TXG OQ6** (2026-10-26): Yes; the Tax Authority's computation adds special-rate income into the tax computed at its own rates and then subtracts the credit points from the computed tax, with limits only in named cases (TXG-05).
  - Source: [רשות המסים, דע זכויותיך וחובותיך 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.10, s.9(ג) (with s.9(ב) on special rates): "מהמס המחושב יש להפחית את הזיכויים מהמס ואת נקודות הזיכוי (חלקים יג ו-יד לטופס 1301)" · checked 2026-10-26
- **TXG OQ7** (2026-10-26): The withholding regulations set the rates with no age rule, so the bank withholds the full rate; the assessing officer may allow in writing a reduced withholding where an excess is expected, and otherwise the excess comes back through a return or Form 0135 (TXG-08, TXG-25).
  - Source: [תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס"ו-2005](https://www.btl.gov.il/Laws1/02_0103_100269.pdf), p.3, reg. 11 (same wording in reg. 11 of the 2002 securities withholding regulations, btl 02_0103_100228.pdf p.2): "פקיד השומה רשאי להתיר בכתב, כי ניכוי המס לפי תקנות אלה יוקטן, אם היה סבור שעלול להתהוות עודף מניכוי המס לפי השיעורים האמורים" · checked 2026-10-26
- **TXG OQ12** (2026-10-26): Settled only in the return; the withholding regulations fix the rate a bank or TASE member withholds (25% or 15% on interest, 25% or 30% on dividends, 25% of real gain or 15% of the gain on securities) with no surtax element, and anyone liable for surtax must file (TXG-11, TXG-18).
  - Source: [תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס"ו-2005](https://www.btl.gov.il/Laws1/02_0103_100269.pdf), p.2, reg. 4 (and reg. 2(א) of the 2002 securities withholding regulations, btl 02_0103_100228.pdf p.1): "תאגיד בנקאי המשלם ליחיד ריבית ינכה ממנה מס בשיעור של 25%" · checked 2026-10-26
- **TXH OQ1** (2026-10-26): Closed 2026-10-26: up to 25% of the real gain (nominal gain less the CPI rise), not 15% of the nominal gain; the linkage part is linkage income, exempt under s.9(13) since Amendment 190 deleted the provident-account exclusion from 1.1.2012 (TXH-11, TXK-07).
  - Source: [על הטבת המס בקרן השתלמות – ניתוח מדיניות (Ministry of Finance, Chief Economist, October 2025)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/review-15102025/he/reviews-and-publishes_review-15102025.pdf), p.5, item 3 and note 7; p.20: "פטור ממס רווחי הון במשיכה, בגובה 25% מהרווחים הריאליים ... רווחים נומינליים בניכוי העליות המצטברות במדד המחיר לצרכן" · checked 2026-10-26
- **TXH OQ5** (2026-10-26): Closed 2026-10-26: the s.3 age of the Retirement Age Law (67 for a man, 65 for a woman with the schedule for women born up to 1969), the only age that law names "גיל הפרישה"; the early age is "גיל הפרישה המוקדמת" (s.5) and the mandatory age "גיל פרישת חובה" (s.4) (TXH-10, KH-12).
  - Source: [חוק גיל פרישה, התשס"ד-2004 (ספר החוקים, as enacted)](https://fs.knesset.gov.il/16/law/16_lsr_300990.pdf), p.1, ss.3-5; with Ordinance s.1 (Tax Authority text p.12) and deductions booklet 2026 p.7 item 4: "(בחוק זה – גיל הפרישה)" · checked 2026-10-26
- **TXA OQ9** (2026-10-26): the Tax Authority's ruling 6849/15 (published 5.5.2015) lets a managing company withhold 15% on commuting a recognized annuity without an assessing officer's approval when exempt payments stay within age ceilings set by its factor table (4 or 5 times the average wage times the factor) and deposits above the s.45A and s.47 maximums are marked as exempt payments (TXA-30, TXA-24, TXA-23)
  - Source: [רשות המסים, החטיבה המקצועית: תמצית החלטת מיסוי 6849/15 "הסדר ניכוי מס במקור בעת היוון קצבה מוכרת – החלטת מיסוי בהסכם" (פורסמה 05/05/2015)](https://secapp.taxes.gov.il/tmmisuyweb/frmShowLinkedAbs.aspx?num=20150026&new=true), p.1, fact 1.6; p.2, s.3.5 (factor table): "עד גיל 60 התקרה הינה הסכום הדרוש לקצבה של 4 פעמים השכר הממוצע במשק, כהגדרתו בסעיף 3(ה3) לפקודה, החל מגיל 60" · checked 2026-10-26
- **TXA OQ10** (2026-10-26): both are conditions of the Tax Authority's ruling 6849/15 for withholding 15% without an approval: "העמית הינו בן 60 או יותר" and "העמית מקבל קצבה מזערית ... והציג שלושה תלושי שכר" (facts 1.4, 1.5) (TXA-30, TXA-22, TXA-27)
  - Source: [רשות המסים, החטיבה המקצועית: תמצית החלטת מיסוי 6849/15 "הסדר ניכוי מס במקור בעת היוון קצבה מוכרת – החלטת מיסוי בהסכם" (פורסמה 05/05/2015)](https://secapp.taxes.gov.il/tmmisuyweb/frmShowLinkedAbs.aspx?num=20150026&new=true), p.1, facts 1.4-1.5: "העמית הינו בן 60 או יותר" · checked 2026-10-26
- **TXA OQ11** (2026-10-26): yes; the exempt-commutation ceiling covers all commutations together, of a qualifying and of a recognized annuity, an exempt commutation of a recognized annuity reduces the balance left for exempt commutation by the whole amount commuted, and a recognized-annuity commutation above the ceiling pays 15% of its profit component (circular 2/2013 s.5.2.5) (TXA-19)
  - Source: [חוזר מס הכנסה 2/2013, תיקון 190 לפקודה](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf), printed p.21, s.5.2.5: "תקרת הפטור בסעיף זה מתייחסת לגבי סך כל היווני הקצבאות (הן היוון קצבה מזכה, והן היוון קצבה מוכרת)" · checked 2026-10-26
- **TXI OQ7** (2026-10-26): no offset; s.92(a) lets a capital loss be offset only against capital gains and betterment and, for a securities loss, interest or dividends on securities, and s.92(b) carries the rest forward against capital gains only; the Tax Authority guide states the same list and names deposit interest only for business losses (TXI-17)
  - Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.155, s.92(א)(1), (4) and 92(ב): "יקוזז כנגד ריווח הון בלבד" · checked 2026-10-26
- **TXI OQ8** (2026-10-26): the Accountant General lists "גילון חדש", "אג"ח ממשלתית בריבית משתנה", "שחר" and "אג"ח ממשלתית" under unlinked bonds, and the 2006 regulations for the current types have no linkage clause, so their coupons are 15% under s.125C(c) (TXI-15; GOV-13, GOV-14)
  - Source: [משרד האוצר, אגף החשב הכללי: מאפייני אג"ח סחיר ולא סחיר ותקנותיו (מדריך, פורסם 24.08.2020)](https://www.gov.il/he/pages/govermental-bonds), tab "מאפייני אג"ח סחיר", table "אג"ח לא צמוד": "אג"ח לא צמוד" · checked 2026-10-26
- **TXI OQ18** (2026-10-26): the consolidated texts list no later amendment: the 2005 regulations end at ק"ת תשע"ח p.444 and the 2002 regulations at ק"ת תשס"ד p.128, as in the btl copies (TXI-08, TXI-13)
  - Source: [תקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס"ו-2005, נוסח משולב (ויקיטקסט, מראה של החוק)](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מריבית,_מדיבידנד_ומרווחים_מסוימים)), raw wikitext header (amendment list): "תשע״ח, 444" · checked 2026-10-26
- **TXP OQ3** (2026-10-26): the whole amount paid; reg. 3(1) of the 1962 regulations taxes a member "על אותם כספים" paid against the fund rules at 35%, and Ordinance s.87(ד) applies the ordinary tax instead when it is higher (TXP-18)
  - Source: [תקנות מס הכנסה (כללים בדבר חיוב במס על תשלומים לקרן שלא אושרה ותשלומים שלא כדין), תשכ"ב-1962 (Wikisource raw text, mirror of ק"ת תשכ"ב 2006)](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(כללים_בדבר_חיוב_במס_על_תשלומים_לקרן_שלא_אושרה_ותשלומים_שלא_כדין)?action=raw), reg. 3(1); with Ordinance s.87(ד), Tax Authority consolidated text p.145: "חבר בקופת גמל ששולמו לו כספים על ידי הקופה חייב במס על אותם כספים" · checked 2026-10-26
- **TXP OQ5** (2026-10-26): monthly; Income Tax circular 4/2019 s.2.1.1 computes the severance ceiling each month as the lower of the salary on the deposit date times 8.33% and 1/12 of the yearly ceiling, across all employers (TXP-11)
  - Source: [חוזר מס הכנסה 4/2019 – הפקדות מעסיק לקופות גמל לקצבה – תיקון 232 לפקודת מס הכנסה (31.12.2019), copy hosted by Menora Mivtachim](https://www.mvs.co.il/files/UpdatesEmployers/4-2019.pdf), pp.1-2, s.2.1.1: "תקרת הפיצויים בחישוב חודשי היא מכפלת משכורתו של העובד ביום ההפקדה בשיעור ההפקדה המרבי לרכיב הפיצויים בקופות גמל לקצבה (8.33%) או 2,833 ₪, שהם 1 חלקי 12 מ"תקרת הפיצויים"" · checked 2026-10-26
- **TXF OQ6** (2026-10-26): Irish Revenue's manual says no exit tax is deducted on transactions in units held in a recognised clearing system, such as ETFs, nor on payments to a non-resident who gave the fund a non-resident declaration, so an Irish ETF's distribution reaches an Israeli resident without Irish tax and the treaty does not change it (TXF-28).
  - Source: [Irish Revenue, Tax and Duty Manual Part 27-01a-02, Investment Undertakings (last updated January 2026)](https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-27/27-01a-02.pdf), p.9, s.4.2.3 (also p.8 s.4.1, p.11 s.4.2.8): "any transaction in relation to, or in respect of, units which are held in a recognised clearing system does not require the deduction of exit tax" · checked 2026-10-26
- **TXS OQ6** (2026-10-26): Yes, an individual's real gain, exempt-fund units included, is taxed at the s.121 rates up to 25% (s.91(ב)(1), s.91(ב1)(1ב)), so the 60+ brackets apply; the bank withholds 25% and the excess comes back through a return or form 0135, or is cut in advance by the assessing officer's written coordination under reg. 11 of the 2002 withholding regulations (TXS-23, TXS-09, TXG-25).
  - Source: [תקנות מס הכנסה (ניכוי מתמורה, מתשלום או מרווח הון במכירת נייר ערך, במכירת יחידה בקרן נאמנות או בעסקה עתידית), התשס"ג-2002 (National Insurance consolidated copy)](https://www.btl.gov.il/Laws1/02_0103_100228.pdf), p.2, reg. 11 (with the Ordinance, p.151 s.91(ב)(1) and p.152 s.91(ב1)(1ב)): "פקיד השומה רשאי להתיר בכתב, כי ניכוי המס לפי תקנות אלה יוקטן, אם היה סבור, שעלול להתהוות עודף מניכוי המס לפי השיעורים האמורים בתקנות אלה" · checked 2026-10-26
- **TXS OQ11** (2026-10-26): The Tax Authority's circular 7/2003 (s.2.1.1) says a taxable fund pays the rates an individual not in business would pay, and today an individual pays 15% on unlinked interest and at most 15% of the whole gain on unlinked bonds (s.125ג(ג)(1), s.91(ב)(3)(א)) (TXS-11).
  - Source: [חוזר מס הכנסה 7/2003: הרפורמה במס הכנסה – מיסוי קרנות נאמנות ובעלי היחידות בהן](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf), p.6, s.2.1.1 (current rates: Ordinance p.204 s.125ג(ג)(1), p.151 s.91(ב)(3)(א)): "שיעורי המס החלים על קרן חייבת זהים לשיעורי המס החלים על יחיד שהיחידה אינה בעסק ואינה מהווה הכנסה מעסק בידו" · checked 2026-10-26
- **TXS OQ14** (2026-10-26): s.88 defines 'מועד קובע' as 1 January 2003 (כ"ז בטבת התשס"ג) (TXS-06).
  - Source: [פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), p.147, s.88, definition מועד קובע: ""מועד קובע" – כ"ז בטבת התשס"ג (1 בינואר 2003)" · checked 2026-10-26
- **CAT OQ9** (2026-10-26): the list in force, 'רשימת מסלולי השקעה – תיקון' (ref. 2024-1471, 17.4.2024), is on gov.il and sets each name's regulatory policy and the products it may be used in (CAT-23, CAT-15)
  - Source: [רשות שוק ההון, ביטוח וחיסכון: רשימת מסלולי השקעה – תיקון (שה. 2024-1471, 17.4.2024)](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/notice-2023-069/he/List_of_investment_tracks_PDF.pdf), p.2 (age tracks, מסלול כללי), p.4 (cluster 1), p.9 (cluster 4): "נכסי המסלול יהיו חשופים לנכסים מסוגים שונים בכפוף להוראות הדין, ובכפוף לשיקול דעתה של ועדת ההשקעות" · checked 2026-10-26

### Already answered in the rule base, struck today (Phase A)

- **BPN OQ1** (2026-10-22): Discount's own 447 tables, read in a second browser pass, list its generic deposits and 47 named products (BPN-12)
- **BRK OQ1** (2026-10-22): TASE's own member list names all 8 non-bank members, adding Blink Fintech and UBS Securities Israel to the six in the clearing-house list (BRK-32).
- **BRK OQ3** (2026-10-25): ss.25-26 of the rules and s.26 of the guidelines were read in TASE's consolidated member guides updated to 1.1.2026, which carry every amendment to that date (BRK-07, BRK-10).
- **BRK OQ8** (2026-10-22): TASE's fee calculator shows, per member, banks and non-banks alike, average fees actually charged as well as list fees (BRK-33, BRK-37).
- **BRK OQ10** (2026-10-22): A bank may charge only for services in the Governor's full tariff (or services added with the Supervisor's approval), under the fee rules and s.9ט-9י of the Banking (Service to Customer) Law (BANK-16, BRK-16).
- **BRK OQ16** (2026-10-25): The withholding regulations make every bank and TASE member, non-bank members included, the withholder ('מוסד כספי'); a foreign broker is neither, so nothing is withheld in Israel at a direct foreign account and the person reports (BRK-27, TXS-05, TXF-22).
- **BRK OQ19** (2026-10-22): One Zero's tariff, deposit terms and money-market page were located (BRK-34), and the full tariff was read on 2026-10-24 (BRK-38).
- **CS OQ1** (2026-10-22): Closed 2026-10-22: hly.gov.il opens in a browser, and NII's official provident list and track descriptions were read there (CS-24, CS-25).
- **CS OQ11** (2026-10-23): Closed 2026-10-23: annex ב'ג' of CMA circular 2018-9-25 sets one shortened report a year until 21, by 1 March, with NII's and the parent's deposits shown apart (CS-27).
- **ETF OQ9** (2026-10-25): The gazette text of the classification regulations (reg. 1) sets the whole scale, 0 to 6 for equities and 0, A to F for foreign currency (ETF-12, MF-54).
- **ETF OQ19** (2026-10-23): S&P Dow Jones Indices' index page and July 2026 methodology were read (ETF-37 to ETF-40).
- **ETF OQ20** (2026-10-23): TASE's index page and the guidelines under part seven of the TASE rules were read (ETF-41, ETF-42).
- **GOV OQ1** (2026-10-22): the Bank of Israel's makam page and its published issue schedule show one new series a month, twelve series at any time, each running about one year; auction results are on its statistics page (GOV-22, GOV-23)
- **IRA OQ3** (2026-10-25): Closed 2026-10-25: the fee regulations' reg. 4 covers an IRA fund, 2% a year of the balance, with no deposit-fee item (PF-06, IRA-17).
- **IRA OQ8** (2026-10-25): Closed 2026-10-25: the minimum pension amount is NIS 5,306 (Tax Authority deductions booklet 2026, p.12) and the conversion multiplier 180 (Ordinance s.9א(א)), so הסכום הקובע is NIS 1,575,882 and the cap NIS 6,303,528 (IRA-08).
- **KH OQ1** (2026-10-25): Closed 2026-10-25: a condition of the study fund's tax approval, 1964 Income Tax Rules rule 19(ב2)(1) (KH-05).
- **KH OQ2** (2026-10-25): Closed 2026-10-25: only an individual with business or profession income; a study fund's approval covers a self-employed member's payments only for such an individual (1964 Income Tax Rules, rules 1 and 19א(א)) (KH-02).
- **KH OQ6** (2026-10-25): Closed 2026-10-25: yes; for tax law all payment dates of the transferring fund count as the receiving fund's (transfer regulations reg. 3(ב)(1)) (KH-14, TXH-19).
- **KH OQ10** (2026-10-25): Closed 2026-10-25: yes, CMA circular 2022-9-30, annex s.7(ג): the general track or the flexible index-tracking track, as the bylaws set (KH-19).
- **KH OQ16** (2026-10-25): Closed 2026-10-25: within 4 business days of the request reaching the fund, 1964 Income Tax Rules rule 41יא(א) (KH-16).
- **KGL OQ1** (2026-10-22): Closed 2026-10-22: NIS 83,641.09, the law's NIS 70,000 indexed by the CBS linkage calculator; no regulator notice exists or is required (KGL-03, KGL-24).
- **KGL OQ3** (2026-10-25): Closed 2026-10-25: regulation 2(א)(1)-(2) is read in the official gazette (קובץ התקנות 7131, with the 2014 and 2022 amendments): 1.05% a year of the balance and 4% of deposits (PF-02, PF-03).
- **KGL OQ8** (2026-10-25): Closed 2026-10-25: CMA circular 2017-9-15 sets five years and the early-raise cases and covers kupat gemel lehashkaa managers; the bylaws' two years is the replaced circular 2012-9-22 (KGL-16, KGL-30).
- **KGL OQ14** (2026-10-23): Closed 2026-10-23: both are percent values (of assets a year; of deposits), as the CMA's Gemel-Net and Pensia-Net portals print them, and hold the latest completed calendar year's average (CAT-35, CAT-36).
- **MGD OQ15** (2026-10-24): 18% VAT on the fee of a manager that is not a financial institution, none on the fees of a bank or a TASE member; each manager's status is read from its tariff (TX2-17).
- **MF OQ2** (2026-10-25): The final directive 447A (04/25), with circular 2813-06 of 9.4.2025, was read on boi.org.il and replaced the draft in the rules that cite it (BANK-15, MF-32, MF-34, MF-37, MF-39).
- **MF OQ13** (2026-10-25): The tracking-fund regulations (gazette 8038, regs. 1, 11, 12, 16) set the variable fee, the negative fee the manager pays the fund, the cap at the category's 0.1%, 0.2% or 0.3% and the 1 January rate change, and the ISA directive makes the manager publish the fund's place in the band (ETF-14, ETF-07); how the positive fee is computed stays ETF open question 8.
- **PEN OQ1** (2026-10-25): the order itself, "צו הרחבה בדבר הגדלת ההפרשות לביטוח פנסיוני במשק (2016)", is read on gov.il and cited, p.2 s.3 (PEN-03, PEN-04)
- **PEN OQ4** (2026-10-22): the Tax Authority's 2025 guide, p.61: "החל מינואר 2017, כל עצמאי מעל גיל 21 ועד גיל פרישה מוקדמת ... חייב להפקיד לקופת גמל לקצבה" (TXP-09, PEN-07)
- **PEN OQ5** (2026-10-25): NII's average-wage page gives 13,769 from 1.1.2026, as does the Tax Authority's 2026 booklet (PEN-08)
- **PEN OQ6** (2026-10-25): the 1964 regulations, reg. 1 and reg. 19(ב1)(1), read on btl.gov.il (PEN-08)
- **PEN OQ8** (2026-10-25): yes; CMA circular 2022-3-3, p.1, s.1: "וייהנו מזכאות להבטחת תשואה שנתית של 5.15% (צמודה למדד)" (PEN-18)
- **PEN OQ10** (2026-10-25): CMA circular 2017-9-15 binds every institutional body, pension-fund managers included: a discount lasts at least five years, may be raised early six months after deposits stop for a reason not caused by the employer, and a move to a new workplace with the same body takes the better arrangement (PF-13, PF-14, PF-15)
- **PEN OQ13** (2026-10-25): circular 2016-3-4 makes every manager write its comprehensive-fund bylaws on the CMA standard text (PEN-09, PEN-15, PEN-16, PEN-27)
- **PEN OQ16** (2026-10-25): the CMA standard bylaw s.72(א), "החל ביום ה-61 שלאחר מועד האירוע המזכה בקצבת נכות" (PEN-12)
- **PEN OQ18** (2026-10-25): in a provident fund other than a study fund or a kupat gemel lehashkaa, a new member who does not choose joins one of the age-matched default tracks (CMA circular 2022-9-30, annex s.4(ב); list 2024-1471) (PF-24, PEN-17)
- **PEN OQ20** (2026-10-25): 65; the Tax Authority's 2026 booklet, p.7, gives the women's table rising to 65 for those born from January 1970, and the 2021 amendment of the Retirement Age Law sets 65 for women in s.3 (TXP-14, PEN-26)
- **PF OQ2** (2026-10-25): Closed 2026-10-25: five years; the circular covers kupat gemel lehashkaa managers (s.5(א)) and the bylaws' two years is the replaced circular 2012-9-22 (PF-13, KGL-16, KGL-30).
- **PF OQ5** (2026-10-23): Closed 2026-10-23: CMA circular 2020-9-22, read in full, sets the shortened and detailed annual reports and the quarterly report with their fields (PF-33 to PF-38).
- **PF OQ7** (2026-10-22): Closed 2026-10-22: the CMA's free search shows, by ID number, which provident, pension, study-fund and insurance accounts may exist; balances and rights stay with the institutions (PF-32).
- **PF OQ11** (2026-10-25): Closed 2026-10-25: the right to switch is CMA circular 2022-9-30, annex s.4(ד)(3), and the three business days are the CMA standard bylaw s.20.2 (PF-23).
- **REG OQ1** (2026-10-22): TASE's own member list names 11 Israeli banks, 3 foreign banks, 8 non-bank members and 3 remote members (BRK-32).
- **REG OQ16** (2026-10-25): Under the Short-Term Loan Law the government borrows and sells makam only to the Bank of Israel, which sells it to the public and administers it (GOV-01); government bonds are issued under the State Loan Law, paid from the state's general revenues and sold through channels the Accountant General approves (GOV-02, GOV-10).
- **INS OQ2** (2026-10-24): reg. 6א of the Insurance Contract Terms Regulations caps the balance fee at 1% a year, 2% with the Commissioner's approval (INS-25)
- **INS OQ7** (2026-10-25): there is no such route; the Ministry of Finance team's February 2025 report, p.16: "מעבר בין גופים מבטחים ניתן לבצע רק דרך משיכה והנזלה של הכספים ומהווה אירוע חייב במס" (TXA-08, TXA-28)
- **SW OQ15** (2026-10-24): version 4 (11/25), circular 2833, adds disclosure sections only (SW-43)
- **TXK OQ2** (2026-10-25): Closed 2026-10-25: s.9(13) exempts the linkage part, since Amendment 190 s.4(2) deleted the provident-account exclusion from 1.1.2012, and the rest is taxed at up to 25% of the real gain (s.125C(b)) (TXK-07, TXK-06).
- **TXK OQ11** (2026-10-22): Closed 2026-10-22: the 2026 figure, NIS 83,641.09, is the law's NIS 70,000 indexed by the CBS linkage calculator; no regulator notice exists or is required (KGL-03, KGL-24).
- **TXH OQ3** (2026-10-25): Closed 2026-10-25: the Tax Authority set the s.9(16א)-(16ב) amount at 20,566 a year (notice of 30.4.2025), and the s.120ב(ה) freeze keeps it for 2025 to 2027 (TXH-08).
- **TXI OQ1** (2026-10-25): the Minister's definition is the Income Tax (Determination of Partial Linkage Differentials) Regulations 2003 (ק"ת 6227, amended 2005, ק"ת 6377), read with s.3(ה6): linkage on part of the sum, by part of the index rise, above the index rise, or for part of the period is partial, and is interest (TX2-18)
- **TXI OQ15** (2026-10-22): interest taxed under s.125C(b) or (c) is exempt from National Insurance contributions (NII Law s.350(a)(6)) and therefore from health contributions, whose base is the NI base; interest sent to marginal rates under s.125C(d) is outside that exemption's wording (TXG-27, TXG-34)
- **TXP OQ1** (2026-10-22): the Tax Authority's service "בקשה לקיבוע זכויות ... (טופס 161ד)", filed with the assessing officer through the personal area (TXP-28)
- **TXP OQ2** (2026-10-22): the Tax Authority's new form 161, "הודעה על פרישה מעבודה", parts A to C, and its part B choices (TXP-29, TXP-30)
- **TXP OQ4** (2026-10-25): the Tax Authority's 2025 booklet, chapter א section 5, applied 13,316 to the employer and severance ceilings and 12,536 to the beneficiary-member test (TXP-03, TXP-10)
- **TXP OQ12** (2026-10-25): reg. 19's 7.5% employer, 8 1/3% severance and 7% employee rates are quoted from the NII's consolidated copy of the regulations on btl.gov.il (TXP-10, TXP-11, PEN-35)
- **TXP OQ13** (2026-10-25): 67, from the Retirement Age Law s.3 as amended in 2021, read on the Knesset gazette (PEN-26)
- **TXF OQ16** (2026-10-25): Re-read in the text layer of the 2025 guide (file p.5, item 3), it matches TXF-21 (TXF-21).
- **TXS OQ2** (2026-10-25): The circular is on gov.il, and its section 4.1 states the position on a foreign-investment fund that deviates from the 90% test (TXS-14).
- **TX2 OQ1** (2026-10-22): The interest is still taxed in full and the loss from negative linkage cannot be offset against it, as the Supreme Court held for a foreign-currency-linked bank deposit in עע"מ 7486/14 (TXI-25; the exchange difference is linkage under TX2-01).
- **TX2 OQ12** (2026-10-24): 18% VAT on the fee of a manager that is not a financial institution; none on the fees of a bank or a TASE member, which pay wage-and-profit tax instead (TX2-17).
- **CAT OQ12** (2026-10-23): Not needed; the site lists all 16 tracks of the fund from the regulator's data, so which eight the app shows does not change coverage (product.md D17; CAT-25, CAT-28).
- **CAT OQ14** (2026-10-22): TASE's Maya site lists every Israeli open-end mutual fund with classification and exposure code, and its export gives the fields per fund (CAT-33, CAT-34).
- **CAT OQ15** (2026-10-23): Yes; Pensia-Net prints the fee pair on the fund row only, and every track of a fund carries the fund's pair in the data (CAT-39).
- **CAT OQ19** (2026-10-23): Not needed; every Meitav product in the regulator's data is in the catalogue whatever the app shows (product.md D17; CAT-26).

### Struck before today

- **CS OQ14** (2026-10-25)
- **GOV OQ10** (2026-10-25)
- **IRA OQ5** (2026-10-25)
- **TXA OQ3** (2026-10-25)

## All 493 items

"Before" is the state of the rule base before today's audit; "After" is after it. For closed items the last column says when and by what; for the others, what would settle it.

| File | No. | Question | Before | After | What on the site depends on it | What settles it, or the closure |
|---|---|---|---|---|---|---|
| BANK | 1 | BoI circular deferring 447A to 19.10.2025 | open | open | none | The BoI deferral circular (Sept 2025) itself. |
| BANK | 2 | Current versions of directives 447 and 417 | open | open | rule text BANK-13 | The update tables of the current 447 and 417 PDFs on the BoI directives page. |
| BANK | 3 | Disclosure rules amendments after 2014 | open | closed | rule text BANK-07 | closed 2026-10-26, settled today from a new source (BANK-07, BANK-08, BANK-09, BANK-10) |
| BANK | 4 | Banking (Customer Service) Law consolidated text | open | open | none | A current consolidated text (Knesset national legislation database, BoI, or the Wikisource mirror read in full). |
| BANK | 5 | Definition of a small bank and which banks are exempt | open | narrowed | listed on guide pages; rule text BANK-21 | The banks' consolidated asset shares (BoI banking statistics) or a BoI list of small and tiny banks. |
| BANK | 6 | Competition Authority deposit directives text | open | open | none | The Competition Authority decision on gov.il and the Competition Tribunal docket. |
| BANK | 7 | Deposit-insurance bill status (watch) | open | open | none | Re-check the Knesset bill record; a preliminary-reading vote or a government bill would change it. |
| BANK | 8 | What protects depositors in a bank failure | narrowed | narrowed | guide prose (1); listed on guide pages; site code/copy | The ranking provisions that apply to a bank in liquidation (Banking Ordinance or Insolvency Law 2018) or a BoI statement. |
| BANK | 9 | Basic-track price cap and its order | open | closed | blocks a guide dimension; rule text BANK-17 | closed 2026-10-26, settled today from a new source (BANK-17, BANK-35) |
| BANK | 10 | Bank Esh Israel serves individuals or not | open | open | none | A BoI licence notice or the bank's own site once it exists. |
| BANK | 11 | One Zero and Bank of Jerusalem terms | narrowed | narrowed | none | The two banks' deposit and tariff pages read in a browser. |
| BANK | 12 | Savings plans: instalment lock-up and break pricing | narrowed | narrowed | guide prose (1); method G-16; blocks a guide dimension; site code/copy | Each other bank's savings-plan agreement, for its own plans. |
| BANK | 13 | Expansion of פק"מ in Leumi names | narrowed | narrowed | none | A Leumi document that expands the abbreviation. |
| BANK | 14 | Official definition of prime | open | open | listed on guide pages | A BoI document that defines or reports prime. |
| BANK | 15 | Hapoalim deposit pages and 447 publication | narrowed | narrowed | none | Hapoalim's 447 table read in a browser. |
| BANK | 16 | Foreign bank branches and Altshuler Shaham deposits | narrowed | narrowed | none | BoI licence notices or the branches' own retail pages; the CMA registry for ASFS. |
| BANK | 17 | 447 rates for CPI-linked deposits: real or nominal | open | open | listed on guide pages | A BoI clarification of 447 Annex A note 1 for CPI-linked types. |
| BANK | 18 | BoI consumer deposit page and comparison tool | open | open | none | The two BoI pages read in a browser. |
| BPN | 1 | Discount product names | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (BPN-12) |
| BPN | 2 | Hapoalim 447 table content | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 3 | Mizrahi 447 table content | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 4 | FIBI-group PortalNG data source | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 5 | Bank of Jerusalem, One Zero, Esh Israel names | narrowed | narrowed | none | The two banks' full product pages in a browser; Esh Israel once it publishes. |
| BPN | 6 | Pagi brand deposit names | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 7 | Leumi PDF pages 40-68 | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 8 | Abbreviation expansions in product names | narrowed | narrowed | none | Each bank's own document expanding its abbreviation. |
| BPN | 9 | Hapoalim פיקדון מטרה vs fixed-rate deposit | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 10 | Hapoalim חיסכון גמיש rate type and term | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 11 | Mercantile variable-rate deposit described as fixed | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 12 | Mercantile code 154 under two names | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 13 | Mizrahi קוקוס minimum | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 14 | Mizrahi deposit codes from URL slugs | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 15 | FIBI and Massad shared product names | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 16 | EDGE INTEREST_DASH series meaning | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 17 | Fee-track names at other banks | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 18 | Child-savings track names at banks | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 19 | Yahav 447 pages lag the rate board | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BPN | 20 | App-only product names | open | open | none | App screens supplied by the founder or a friend (needs people, not research). |
| BPN | 21 | Leumi statement names and model codes | open | open | none | The bank's own page or document read in a browser, or a customer's statement or app screen. |
| BRK | 1 | Full TASE member list and unnamed non-bank members | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (BRK-32) |
| BRK | 2 | Status of the broker-dealer licensing bill | open | open | none | The bill or memorandum on the Knesset or ISA site and its legislative status. |
| BRK | 3 | Current TASE rules on client assets after 2018 | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (BRK-07, BRK-10) |
| BRK | 4 | Other banks' securities custody terms | narrowed | narrowed | none | Other banks' general account terms (FIBI booklet, Otzar Hahayal, Pagi, others) read for their securities-custody sections. |
| BRK | 5 | Bank clients' securities if the bank fails | narrowed | narrowed | listed on guide pages | The custody committee's final report of 29.12.2011, or a Banking Ordinance or Supervisor of Banks text on client securities in a bank's failure. |
| BRK | 6 | The 2011 inter-ministerial custody committee report | narrowed | narrowed | none | The final report (29.12.2011) on the BoI, ISA or Ministry of Finance site; the Discount Bank copy found in a search returns 404 (2026-10-26). |
| BRK | 7 | Interactive Brokers protection pages and Irish compensation scheme | narrowed | narrowed | none | The Irish Investor Compensation Company's page (investorcompensation.ie) opened in a browser. |
| BRK | 8 | TASE member-fee comparison under s.45טז | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (BRK-33, BRK-37) |
| BRK | 9 | Direct Interactive Brokers and eToro accounts for Israelis | narrowed | narrowed | listed on guide pages | IBKR's application flow with Israel as residence or the top of an Israeli client's activity statement; eToro's own terms for Israeli residents; a person checking whether the ISA's 49A page links a list newer than August 2025. |
| BRK | 10 | Bank securities fee not listed in the tariff | answered, not marked | closed | listed on guide pages | closed 2026-10-22, struck today from the rule base (BANK-16, BRK-16) |
| BRK | 11 | Custody fee on makam and money-market funds at non-banks | narrowed | narrowed | listed on guide pages | A TASE rule on custody fees for makam, or each non-bank member's distribution agreements with fund managers. |
| BRK | 12 | Supervised price to move securities to own account | narrowed | narrowed | listed on guide pages; rule text BRK-18 | The Supervisor's 2007/2008 list of supervised services and any s.9יב order for 'העברת ניירות ערך'. |
| BRK | 13 | Disclosure rules amendments after 2014 | open | open | rule text BRK-21 | Nevo or Reshumot for amendments to the 1992 disclosure rules after 2014. |
| BRK | 14 | Notice period for fee changes at non-banks | open | open | none | A TASE rule or guideline on notice of fee changes, or non-bank members' client agreements. |
| BRK | 15 | Rule requiring banks to publish actual securities fees | open | open | none | The Supervisor of Banks directive or circular on 'גילוי עלות שירותים בני"ע'. |
| BRK | 16 | Withholding by non-bank members and foreign brokers | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (BRK-27, TXF-22, TXS-05) |
| BRK | 17 | Minors' brokerage accounts and joint-account rules | open | narrowed | listed on guide pages | A TASE or ISA text on accounts for minors at members, and more providers' joint-account terms. |
| BRK | 18 | Meitav Trade tariff | open | open | none | Meitav Trade publishing its tariff (company data; TASE's calculator shows its list fee but bars republishing). |
| BRK | 19 | One Zero brokerage offer and tariff | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (BRK-34, BRK-38) |
| BRK | 20 | Psagot brokerage ownership after 2024 | open | open | none | Psagot's or its parent's filings on MAGNA or Maya, or the ISA's licensing records. |
| BRK | 21 | Fractional shares and cost-changing order types | open | narrowed | none | Providers' own pages on fractional shares and order types; ch. ה' of TASE's part-three guidelines for exchange order types. |
| CS | 1 | hly.gov.il blocked to scripts | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (CS-24, CS-25) |
| CS | 2 | Clal on NII list: since when, which tender | narrowed | narrowed | none | The Ministry of Finance tender notice that added Clal, or NII's list history. |
| CS | 3 | Instrument behind NII's fund-level default | narrowed | narrowed | none | The current text of the 2016 regulations' regulation 3 in Reshumot, or NII's allocation rule. |
| CS | 4 | How a first child's default fund is picked | open | open | listed on guide pages | The current regulation 3 in Reshumot, or NII's or the Ministry of Finance's tender terms for allocating defaulted children. |
| CS | 5 | Legal source of the age-18 grant (pre-2017) | open | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (CS-13) |
| CS | 6 | Medical early withdrawal: which grant per cohort | open | closed | rule text CS-15 | closed 2026-10-26, settled today from a new source (CS-13, CS-15) |
| CS | 7 | Track equity ranges at other managers | narrowed | narrowed | rule text CS-09 | Each manager's child-savings bylaw annex (a company term). |
| CS | 8 | Fee after 21 at every manager | narrowed | narrowed | listed on guide pages | Each manager's bylaw or fee page (a company term). |
| CS | 9 | Gemel-Net fee field for child-savings tracks | narrowed | narrowed | none | A CMA statement defining the dataset fee field for child-savings tracks. |
| CS | 10 | Can a parent see chosen vs default track | narrowed | narrowed | method G-17; listed on guide pages; site code/copy | A parent logged in to NII's personal-information service, or the manager's personal area, read by a person. |
| CS | 11 | Annual statement layout for child savings | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (CS-27) |
| CS | 12 | Per-bank child-savings terms and rates | open | open | listed on guide pages | Each bank's child-savings agreement and a current rates dataset (data collection). |
| CS | 13 | After 18: moving into another product | open | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (CS-16, SW-21) |
| CS | 14 | Bank-to-provident move: amendment and date | closed | closed | listed on guide pages | closed 2026-10-25, already struck |
| CS | 15 | Retroactive parental addition | open | open | none | NII's procedure or circular on the parental addition. |
| CS | 16 | Does the KGL deposit ceiling bind child savings | narrowed | narrowed | listed on guide pages | A CMA statement on whether NII's deposits count toward a child's kupat gemel lehashkaa ceiling. |
| CS | 17 | Later amendments to circular 2016-9-20 | narrowed | narrowed | none | Reading circular 2019-9-17 on gov.il. |
| CORP | 1 | ISA-registered rating companies | open | open | none | The ISA register of rating companies. |
| CORP | 2 | ISA trustees register | open | open | none | The ISA trustees register. |
| CORP | 3 | S&P Maalot scale definitions | narrowed | narrowed | none | S&P Maalot's definitions document read in a browser. |
| CORP | 4 | Is a rating mandatory for bonds | open | open | none | TASE rules part 2 and the ISA prospectus regulations. |
| CORP | 5 | Public bond tender in practice | open | open | none | The current regulations text, TASE offering procedures and bank tariffs. |
| CORP | 6 | TASE bond trading details | open | narrowed | graduation status | The TASE clearing-house bylaws and TASE rules part 2 (listing and maintenance). |
| CORP | 7 | TASE-UP and institutional-only securities | open | open | none | TASE rules and guidelines on these lists. |
| CORP | 8 | Tel-Bond index methodology | open | open | none | The TASE index methodology documents. |
| CORP | 9 | CPI floor in corporate bond deeds | open | open | none | A count over trust deeds or a TASE or ISA summary. |
| CORP | 10 | Official default and recovery history | open | open | none | BoI Financial Stability Report or ISA annual report figures. |
| CORP | 11 | ISA staff position 108-5 in its own text | open | open | none | The ISA's own text of position 108-5. |
| CORP | 12 | Insolvency law and bondholders | open | open | none | The Insolvency Law 2018 text. |
| CORP | 13 | Issuer disclosure content | open | open | none | The Securities Regulations on periodic and immediate reports. |
| CORP | 14 | Corporate bonds outstanding end-2025 | open | open | none | TASE annual statistics. |
| CORP | 15 | Unlisted commercial paper offers | open | open | none | ISA or TASE material on unlisted commercial paper. |
| ETF | 1 | TASE trading hours and phases for ETFs | open | narrowed | none | TASE's board-decisions chapter of the trading guide (the times the board fixed), opened by a person. |
| ETF | 2 | Market makers' spread and size duties in ETFs | open | open | guide prose (1); listed on guide pages | TASE's board decision on statutory market making in ETFs ('החלטת הדירקטוריון בדבר עשיית שוק סטטוטורית בקרנות סל'), opened by a person. |
| ETF | 3 | Complete list of Israeli ETF issuers | open | open | none | TASE's ETF issuers list opened in a browser. |
| ETF | 4 | Foreign funds registered in Israel and representatives | narrowed | narrowed | method G-29; site code/copy; rule text ETF-30 | The ISA's foreign-funds register opened by a person. |
| ETF | 5 | BlackRock brochure table of TASE-listed iShares funds | open | open | none | The brochure's text or each fund's Israeli annex on MAGNA. |
| ETF | 6 | Currency of the tracking-fund regulations text | open | open | none | Nevo or Reshumot list of amendments to the 2018 tracking-fund regulations. |
| ETF | 7 | Do ISA ETF fee averages include variable fees | open | open | none | The ISA report's methodology note or the ISA's answer. |
| ETF | 8 | How the positive variable management fee is computed | open | open | none | A manager's main prospectus section on the variable fee mechanism. |
| ETF | 9 | Official exposure-profile scale definitions | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (ETF-12, MF-54) |
| ETF | 10 | How the public trades the 6 open foreign funds | open | open | none | The ISA register or those funds' Israeli annexes. |
| ETF | 11 | EU PRIIPs/KID limits for Israelis at EU brokers | narrowed | narrowed | guide prose (1); listed on guide pages | Regulation 1286/2014 and the Commission's 2017 guidelines on its application (OJ C 218) opened by a person, and IB Ireland's statement on non-EEA retail clients. |
| ETF | 12 | Minimum trade size or lot for ETFs on TASE | open | closed | guide prose (1); listed on guide pages | closed 2026-10-26, settled today from a new source (ETF-67) |
| ETF | 13 | Is accumulation the norm for Israeli tracking funds | narrowed | narrowed | none | A count over Maya's fund data or the ISA report on distribution policy. |
| ETF | 14 | Distribution fee for tracking funds and ETFs | narrowed | narrowed | none | The report footnote's text read in full, or the fund's prospectus line on its distribution-fee type. |
| ETF | 15 | TASE security-number conventions by fund type | open | open | none | A TASE text on how it assigns security numbers. |
| ETF | 16 | Trading currency of each foreign fund on TASE | narrowed | narrowed | none | Each foreign fund's Israeli annex (reg. 4(b)) on MAGNA. |
| ETF | 17 | Amendment number of the foreign-fund chapter | open | open | none | The Knesset gazette of the amendment that added ch. 9.1 (Amendment 23 per Leumi). |
| ETF | 18 | Currency-hedged UCITS ETF share classes | open | open | none | Issuers' share-class lists (iShares, Invesco) for the indices in scope. |
| ETF | 19 | S&P 500 description by its index provider | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (ETF-37, ETF-40) |
| ETF | 20 | TA-125 rules: share count, weight cap, ranks | answered, not marked | closed | rule text ETF-33 | closed 2026-10-23, struck today from the rule base (ETF-41, ETF-42) |
| ETF | 21 | ISA directive on custody and credit-risk groups | open | open | none | The directive on the ISA's mutual-fund directives page. |
| ETF | 22 | Swap spread or financing cost as a number | open | open | none | Managers' main prospectuses (swap section) or the funds' financial statements on MAGNA. |
| ETF | 23 | US withholding on an Israeli exempt fund's US dividends | open | open | none | IRS treaty guidance on Israeli investment trusts, or a fund's prospectus statement. |
| ETF | 24 | S&P 500 net total return withholding rate | open | open | none | S&P DJI's Equity Indices Policies & Practices methodology read in full. |
| ETF | 25 | Official tracking comparison by replication method | narrowed | narrowed | none | An ISA or TASE publication comparing tracking difference by replication method. |
| ETF | 26 | NNDX versus Nasdaq's XNDXNNR | open | open | none | Nasdaq's index documentation or a fund report naming the vendor code. |
| ETF | 27 | TA-90 launch base | open | open | none | TASE's index guidelines or index page history for TA-90. |
| ETF | 28 | Does a swap counterparty pass on withholding savings | open | open | none | Managers' prospectuses on swap terms. |
| FXD | 1 | BoI rules specific to FX deposits | open | open | graduation status | The BoI consumer page on FX deposits or a directive naming them. |
| FXD | 2 | FX conversion spread vs fee disclosure | open | narrowed | graduation status | A BoI directive or explanation on FX conversion rates. |
| FXD | 3 | Part 5 FX tariffs at other banks | open | open | none | Each bank's part 5 tariff, collected as dated snapshots (data track). |
| FXD | 4 | FX deposit agreement terms | open | open | graduation status | Each bank's FX deposit agreement (Mizrahi's sample agreement, Hapoalim's and Leumi's terms). |
| FXD | 5 | FX-linked shekel deposit agreements | open | open | none | Discount, Yahav and Leumi agreement texts. |
| FXD | 6 | Is a conditional-grant deposit a structured product | open | open | none | ISA or BoI guidance, or ministerial orders under the definition. |
| FXD | 7 | BoI information on structured deposits | open | open | none | A BoI media PDF or directive on structured deposits. |
| FXD | 8 | Altshuler Shaham FS regulator for deposits | open | open | none | A BoI licence notice, the CMA registry or the company's filings. |
| FXD | 9 | LAYA wallet safeguarding and licence | open | open | none | The Payment and Payment Initiation Services Law and the ISA licence list. |
| FXD | 10 | Can Israeli residents buy Israel Bonds | open | open | none | Israel Bonds international site, DCI or the Accountant General. |
| FXD | 11 | FX 'exempt' and 'severance' deposit lines | narrowed | narrowed | none | A bank's explanation of its 'בעל פטור' and 'פיצויים' deposit lines, or Tax Authority form instructions. |
| FXD | 12 | Directive 447 and FX deposits | open | open | none | A BoI clarification of 447 scope. |
| GOV | 1 | Makam issuance cadence and schedule | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (GOV-22, GOV-23) |
| GOV | 2 | Individual's makam auction order: minimum and fee | narrowed | narrowed | guide prose (2); listed on guide pages | A BoI or bank statement on how a client's auction order is priced and its minimum; each bank's price is its own tariff. |
| GOV | 3 | Is the BoI makam general-conditions document current | narrowed | narrowed | listed on guide pages | The 1992 makam regulations in Reshumot, or a dated BoI version of the conditions. |
| GOV | 4 | Regulations for the fixed-rate shekel series | narrowed | narrowed | guide prose (1); listed on guide pages; site code/copy | ק"ת התשנ"ה p.1590 in Reshumot, and a check for amendments after 2007. |
| GOV | 5 | Regulation governing current floating-rate series | open | closed | guide prose (1); listed on guide pages | closed 2026-10-26, settled today from a new source (GOV-14) |
| GOV | 6 | CPI-linked deflation floor per series | open | narrowed | guide prose (1); listed on guide pages | The 1980 "גליל" regulations (ק"ת התש"ם p.228) in Reshumot. |
| GOV | 7 | TASE trading unit, minimum, quotes, settlement | narrowed | narrowed | guide prose (2); blocks a guide dimension; site code/copy | The TASE clearing-house bylaws. |
| GOV | 8 | Retail order into a government-bond auction | open | narrowed | guide prose (1); listed on guide pages | The Debt Unit's auction notice or terms for public orders. |
| GOV | 9 | Official investor risk statements on government bonds | narrowed | narrowed | guide prose (1); listed on guide pages | A BoI, ISA or Debt Unit investor page on government bonds. |
| GOV | 10 | Final text and date of directive 447A | closed | closed | none | closed 2026-10-25, already struck |
| GOV | 11 | State retail savings instrument for residents | open | open | none | Israel Bonds or Accountant General material on resident eligibility. |
| GOV | 12 | Official source for old-to-new bond names | open | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (GOV-13, GOV-14) |
| GOV | 13 | Status of מירון designated bonds | open | closed | none | closed 2026-10-26, settled today from a new source (GOV-18) |
| GOV | 14 | Tuesday entries in MoF auction data | open | open | none | The Debt Unit's auction procedure or a data dictionary for the dataset. |
| IRA | 1 | Current consolidated text of the IRA regulations | open | open | listed on guide pages | The Justice Ministry legislation database or Reshumot, read by a person. |
| IRA | 2 | Status of the 2025 IRA draft amendment | open | open | listed on guide pages | Reshumot 2025-2026 or the CMA page for the regulation, read by a person. |
| IRA | 3 | Management-fee cap for IRA funds | answered, not marked | closed | guide prose (2); listed on guide pages | closed 2026-10-25, struck today from the rule base (IRA-17, PF-06) |
| IRA | 4 | Can a kupat gemel lehashkaa be self-directed | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (IRA-01, IRA-03, TXK-16) |
| IRA | 5 | Broker outside the competitive-process list | closed | closed | none | closed 2026-10-25, already struck |
| IRA | 6 | Bank custody, FX and minimum fees inside an IRA | open | open | listed on guide pages | Each bank's institutional or IRA tariff (a company term). |
| IRA | 7 | Other IRA managers' terms | open | open | listed on guide pages | Each manager's own documents read in a browser (company terms). |
| IRA | 8 | Official 2026 values for the IRA cap inputs | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (IRA-08) |
| IRA | 9 | Money types in income-tax regs 34(ב)(1), 38(א) | open | open | none | Those regulations in the 1964 Income Tax Rules (NII copy). |
| IRA | 10 | Investment-rules definitions: approved country, related party | narrowed | narrowed | none | The 2012 investment rules' definition of related parties. |
| IRA | 11 | Protection of IRA assets if manager or broker fails | narrowed | narrowed | listed on guide pages | The IRA regulations or a CMA directive on custody of IRA assets, and the Slice court record. |
| IRA | 12 | Gemel-Net field units and null fees | narrowed | narrowed | none | A CMA statement on empty fee values, or Slice's reporting history. |
| IRA | 13 | Amendment 190 money in an IRA | open | open | none | The pension and tax files' Amendment 190 rules applied to IRA entry (IRA-07). |
| IRA | 14 | Insurance-plan IRAs today | open | open | none | A Bituach-Net query. |
| IRA | 15 | CMA circulars specific to IRA | open | open | none | The CMA regulation engine on gov.il searched by a person. |
| KH | 1 | Legal source of the employee one-third minimum | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (KH-05) |
| KH | 2 | Can an employee deposit without the employer | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (KH-02) |
| KH | 3 | Extension orders requiring a study fund | open | open | listed on guide pages | The Ministry of Labour's extension-order list read by a person, or a CMA statistic on contribution rates. |
| KH | 4 | Loan terms in study funds | narrowed | narrowed | method G-25; listed on guide pages | The consolidated circular's loans section or circular 2016-9-5. |
| KH | 5 | Payslip line names for study-fund deposits | open | open | method G-19 | An official payslip guide naming the lines (none is expected; labels are set by each payroll system). |
| KH | 6 | Full transfer carries the first payment date | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (KH-14, TXH-19) |
| KH | 7 | The 1997 rules on study withdrawals | open | open | none | The rules' text in Reshumot or a Tax Authority copy. |
| KH | 8 | Which retirement age for the 3-year route | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (KH-12, TXH-10) |
| KH | 9 | Which funds accept self-employed members | open | open | none | Each fund's bylaws (company terms). |
| KH | 10 | CMA rule on the study-fund default track | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (KH-19) |
| KH | 11 | Fee discounts after leaving an employer | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (KH-23, PF-13, PF-14, PF-15, PF-16) |
| KH | 12 | Eligibility for sector and employer study funds | open | open | none | Each fund's bylaws (definition of a member). |
| KH | 13 | Manager count discrepancy | open | open | none | Re-running the discovery report's query or reading its method. |
| KH | 14 | Exact wording of law and regulations | narrowed | narrowed | none | Re-reading the remaining texts in Reshumot or the Knesset database before encoding. |
| KH | 15 | Fee reg. 8 trigger conditions | narrowed | narrowed | none | Reg. 8 read in קובץ התקנות 7131. |
| KH | 16 | Legal timetable for paying a withdrawal | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (KH-16) |
| KGL | 1 | Official 2026 ceiling figure | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (KGL-03, KGL-24) |
| KGL | 2 | Home-sale exception s.22(א1): source and lapse | open | open | none | The ruling (16100420_o23.pdf) and the amending law in the Knesset database. |
| KGL | 3 | Fee cap from the official regulation text | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PF-02, PF-03) |
| KGL | 4 | Ceiling breach across two managers | narrowed | narrowed | none | The CMA payments circular or clearing-house rules. |
| KGL | 5 | Employer deposits into a KGL | open | open | none | The CMA payments circular or the 2014 payments regulations. |
| KGL | 6 | Residency and minors | narrowed | narrowed | none | The CMA joining circular. |
| KGL | 7 | Minimum deposits per manager | open | open | none | Each manager's joining page or form (company terms). |
| KGL | 8 | Source of the discount minimum and early raises | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (KGL-16, KGL-30) |
| KGL | 9 | Transfers into and out of a KGL | narrowed | narrowed | none | The תשפ"ג transfer amendment in its official text. |
| KGL | 10 | Is circular 2020-9-18 still the track rule | narrowed | narrowed | none | The consolidated investment-tracks circular as amended by 2022-9-30. |
| KGL | 11 | Eligibility for five sector funds | open | open | none | Each fund's bylaws. |
| KGL | 12 | Bill to raise the ceiling to NIS 300,000 | open | open | none | The Knesset bills database (standing re-check). |
| KGL | 13 | Meitav's own KGL bylaws | open | open | none | Meitav's bylaws document (a company term). |
| KGL | 14 | Units of the Gemel-Net fee fields | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (CAT-35, CAT-36) |
| MGD | 1 | Which licensed managers offer digital or low-minimum portfolios | narrowed | narrowed | none | A pass over the licensees' own sites, or an ISA list of licensees serving clients through technological means. |
| MGD | 2 | ISA suitability and technology directives in the original | open | narrowed | graduation status | The needs-clarification directive's PDF on new.isa.gov.il. |
| MGD | 3 | Outcome of the ISA 2019 "portfolio management 2.0" call | open | open | none | An ISA announcement on the call and its outcome. |
| MGD | 4 | Meitav Manager: custody, funds, in-kind exit, app | open | open | none | The Meitav Manager client agreement (institution) or Meitav's answer. |
| MGD | 5 | Meitav private-client fee rates by size | open | open | none | Meitav's tariff for private managed portfolios, if published. |
| MGD | 6 | Phoenix digital portfolio: fee, custodian, entity, funds | narrowed | narrowed | none | The XNES tariff and the Phoenix digital-portfolio agreement. |
| MGD | 7 | Portfolio-manager equity and security amounts, official text | open | open | none | The official text of the Equity and Insurance Regulations 2000 and any later amendment, plus the CPI index to compute the amount. |
| MGD | 8 | Altshuler digital route: minimum and supported banks | open | open | none | Altshuler's digital joining terms or its answer. |
| MGD | 9 | ISA draft directive on outsourcing in hosting | open | open | none | The ISA draft on new.isa.gov.il and its status. |
| MGD | 10 | Fjord licence and custody; VIDEA status | narrowed | narrowed | none | An ISA register search by name across all licence types, and Leumi's or the register's answer on VIDEA. |
| MGD | 11 | What a qualified client gives up | open | open | graduation status | The Investment Advice Law read in full for "לקוח כשיר" exceptions, and the schedule's update rule. |
| MGD | 12 | ISA complaints channel for managed-portfolio clients | open | open | graduation status | The ISA complaints page or forms, read in a browser. |
| MGD | 13 | Termination or transfer-out fees from a manager | open | open | none | The Investment Advice Law and ISA directives on fees, read in full. |
| MGD | 14 | Which trades count as special risk (s.18) | open | open | none | s.18 of the Investment Advice Law and any ISA definition, read in full. |
| MGD | 15 | VAT on portfolio-management fees | answered, not marked | closed | none | closed 2026-10-24, struck today from the rule base (TX2-17) |
| MGD | 16 | Investor compensation beyond the manager's security | open | open | none | An ISA or statutory statement on compensation for client losses from a manager's misconduct. |
| MGD | 17 | Psagot's managed-portfolio offering and minimums | open | open | none | Psagot's portfolio-management terms. |
| MF | 1 | Final ISA money-market directive and ISA rules | narrowed | narrowed | listed on guide pages | The Reshumot notice of the directive and the rules' text in Kovetz HaTakanot. |
| MF | 2 | Final text of BoI directive A447 | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (BANK-15, MF-32, MF-34, MF-37, MF-39) |
| MF | 3 | Fund order cut-off times and Friday orders | open | open | guide prose (1); method G-26; listed on guide pages | The TASE clearing house's bylaws and guidelines (חוקי העזר של מסלקת הבורסה) or a current money-market fund prospectus on MAGNA. |
| MF | 4 | When redemption cash is available to the holder | open | narrowed | guide prose (2); method G-26; blocks a guide dimension; site code/copy | The clearing house's settlement rules for fund units, or a current money-market fund prospectus. |
| MF | 5 | Is the 1 January fee-increase rule binding | open | open | listed on guide pages | The ISA staff outline or directive on raising the manager's fee. |
| MF | 6 | ISA headline fee averages and trustee fees | narrowed | narrowed | none | The ISA report's definition of the headline averages and a current trustee-fee figure. |
| MF | 7 | Share of funds charging loads or exit deductions | open | open | none | A count over Maya's fund data or the ISA report. |
| MF | 8 | Current ISA list of classification headings | open | open | none | The ISA's headings list opened by a person. |
| MF | 9 | ISA naming principles and the (!) mark | narrowed | narrowed | none | The ISA directive on fund names and the '(!)' mark. |
| MF | 10 | Banks' and brokers' charges on fund units | narrowed | narrowed | none | More tariffs read for fund-unit commissions and custody (data track). |
| MF | 11 | ISA register and renewable money-market fund count | open | open | guide prose (1); listed on guide pages | The ISA register or a count over Maya's fund data. |
| MF | 12 | Are the law and regulation mirrors current | narrowed | narrowed | listed on guide pages | Nevo or the Knesset legislation database's amendment lists for each regulation. |
| MF | 13 | Regulatory basis of the symmetric variable fee | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (ETF-07, ETF-14) |
| MF | 14 | Do any קפ"מ funds still exist | open | open | none | A count over Maya's fund data or the ISA report. |
| MF | 15 | URL of the ISA money-market information page | open | open | none | The ISA site or a bank's 447A page showing the link. |
| MF | 16 | Where fund distribution rules are set | open | open | none | The law or regulations on distributions, and a count over Maya's data. |
| MF | 17 | Content of the 5786 fund-law amendments | narrowed | narrowed | listed on guide pages | The gazette text of the amendment at ס"ח התשפ"ו p.359. |
| PEN | 1 | Official text of the 2016 pension extension order | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PEN-03, PEN-04) |
| PEN | 2 | Changes to minimum pension rates after 2017 | open | open | none | A check of the Ministry of Labour extension-orders list (a standing re-check). |
| PEN | 3 | Readability of the 2011 extension order scan | open | open | none | A text copy of Yalkut Hapirsumim 6302 from Reshumot or Nevo. |
| PEN | 4 | Start year of the self-employed deposit duty | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (PEN-07, TXP-09) |
| PEN | 5 | NII's own 2026 average-wage figure | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (PEN-08) |
| PEN | 6 | Regulation behind the comprehensive-fund deposit ceiling | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (PEN-08) |
| PEN | 7 | Pension insurance tables and annuity conversion factors | narrowed | narrowed | guide prose (4); method G-03, G-12; blocks a guide dimension; site code/copy | Collecting each manager's annex tables (published as XLSX annexes to the bylaws) into data/. |
| PEN | 8 | Whether the 5.15% guaranteed return is CPI-linked | answered, not marked | closed | guide prose (1); blocks a guide dimension | closed 2026-10-25, struck today from the rule base (PEN-18) |
| PEN | 9 | Designated bonds still held by pension funds | open | open | none | The Accountant General's reports on designated-bond issues and holdings. |
| PEN | 10 | Pension fee discounts after leaving an employer | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (PF-13, PF-14, PF-15) |
| PEN | 11 | Payslip line labels for pension deposits | open | open | method G-19 | Sample payslips from the founder and friends recorded in data/terms/ as institution-level evidence. |
| PEN | 12 | Meaning of 'ריסק זמני' | open | open | none | The managers' and insurers' product pages or a CMA text naming it. |
| PEN | 13 | CMA standard bylaws for comprehensive pension funds | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (PEN-09, PEN-15, PEN-16, PEN-27) |
| PEN | 14 | Official notice of the 2024 selected pension funds | narrowed | narrowed | none | The gov.il notice naming the 2024 selected funds and the period's dates. |
| PEN | 15 | Alternative fee mixes at other selected funds | open | open | none | Each selected fund's own fee-mix table (company data). |
| PEN | 16 | Disability pension start day | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PEN-12) |
| PEN | 17 | CMA unified withdrawal rules (2026 plan) | open | open | none | A re-check of the CMA 2026 regulation plan items (PF-31); a standing re-check. |
| PEN | 18 | Default investment track of provident fund for annuity | answered, not marked | closed | listed on guide pages | closed 2026-10-25, struck today from the rule base (PEN-17, PF-24) |
| PEN | 19 | Who pays annuities from provident-fund money | open | open | guide prose (1); blocks a guide dimension | A CMA circular or codex section on annuity payment from provident money, plus each receiving fund's conversion-factor annex. |
| PEN | 20 | Women's retirement age for those born from 1970 | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PEN-26, TXP-14) |
| PEN | 21 | Pension cover above the average wage | narrowed | narrowed | listed on guide pages | No general source is expected; the employment or collective agreement in each case. |
| PEN | 22 | Small-balance withdrawal rule for new pension funds | open | open | none | The Provident Funds Law's current text of s.23(ב)(1א) and the CMA's or Tax Authority's 2026 figure. |
| PF | 1 | Is circular 2017-9-15 still in force as read | open | open | none | The CMA consolidated circular's fee chapter or the CMA circular list. |
| PF | 2 | Minimum discount period: five or two years | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (KGL-16, KGL-30, PF-13) |
| PF | 3 | Managers' external management fee caps 2026 | open | open | method G-14 | Collecting each manager's published cap into data/ (data-update). |
| PF | 4 | Child-savings fee rule | narrowed | narrowed | none | The banks' child-savings agreements or an NII statement on bank charges after 21. |
| PF | 5 | Uniform statement format and fields | answered, not marked | closed | site code/copy | closed 2026-10-23, struck today from the rule base (PF-33, PF-38) |
| PF | 6 | Clearing-house consumer service and its price | narrowed | narrowed | site code/copy | The text of circular 2022-10-5 on gov.il, and the operator's price list read by a person. |
| PF | 7 | Har HaKesef: what it covers | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (PF-32) |
| PF | 8 | Automatic consolidation of small inactive accounts | open | open | none | The CMA codex or circulars archive. |
| PF | 9 | Current version of transfer circular 2017-9-17 | narrowed | narrowed | none | The CMA circular list or the 2016-9-11 text. |
| PF | 10 | Arbitrage reform or wrapper merger | open | open | none | Ministry of Finance or Knesset documents (standing re-check). |
| PF | 11 | Legal basis of KGL track switching | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PF-23) |
| PF | 12 | Can a manager limit track switches | narrowed | narrowed | none | A CMA statement on switch frequency, or the standard bylaws read for a limit. |
| PF | 13 | Legacy-money fee caps | open | open | none | The income-tax provident-fund rules read in full. |
| PF | 14 | Annuitant fee caps under reg. 2 | narrowed | narrowed | none | Reg. 2(א)(3)-(4) quoted from קובץ התקנות 7131 and 9942. |
| PF | 15 | Reg. 8(ב) reconnection rule wording | open | open | none | Reg. 8(ב) quoted from the official gazette. |
| PF | 16 | Statement-circular draft and gov.il copy | narrowed | narrowed | site code/copy; rule text PF-33 | The adopted circular on gov.il, or the CMA's 2026 circular list. |
| REG | 1 | Full TASE member list | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (BRK-32) |
| REG | 2 | ISA licensees offering digital or low-minimum portfolios | narrowed | narrowed | none | A pass over the licensees' own sites. |
| REG | 3 | CMA financial-service-provider register | open | open | none | The register read in a browser. |
| REG | 4 | Bank of Israel list: Esh, completeness, banklist page | open | open | none | The BoI banklist page in a browser, or a BoI statement on dataset 375. |
| REG | 5 | ISA complaints channel and complaint officers | open | open | none | The ISA forms and the law or directive on complaints officers. |
| REG | 6 | Bank of Israel public-enquiries page | open | open | none | The page read in a browser. |
| REG | 7 | CMA public-enquiries page and process | open | open | none | The CMA page read through govil-page.sh or a browser. |
| REG | 8 | Tax Authority ombudsman | open | open | none | The ombudsman's gov.il page read through govil-page.sh. |
| REG | 9 | Fate of client assets if a non-bank TASE member fails | narrowed | narrowed | guide prose (1); blocks a guide dimension | A TASE or ISA text on a non-bank member's failure, or an Insolvency Law provision on client assets of a securities intermediary. |
| REG | 10 | Client securities at a bank that fails | narrowed | narrowed | guide prose (3); listed on guide pages | A Bank of Israel or statutory text on client securities at a failing bank, or a source saying a bank holds them in trust for the client. |
| REG | 11 | Clearing-house Risk Fund cover for end clients | open | open | none | The TASE clearing-house bylaws on the Risk Fund. |
| REG | 12 | Commencement of the 2026 banking competition law | open | narrowed | rule text REG-04 | An official statement of the commencement date, or a Finance Committee record of the six-month report. |
| REG | 13 | Basis of the "informal" state backing of depositors | open | open | listed on guide pages | A Bank of Israel or Ministry of Finance statement on how depositors are protected today. |
| REG | 14 | IBKR protection pages and the Irish compensation amount | narrowed | narrowed | none | IBKR's protection pages and the Irish Investor Compensation Company's page, read in a browser. |
| REG | 15 | Meitav legal entity names | narrowed | narrowed | none | The Companies Registrar or the ISA register. |
| REG | 16 | Issuer and legal basis of makam and government bonds | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (GOV-01, GOV-02, GOV-10) |
| REG | 17 | Which bodies the State Comptroller's Ombudsman covers | open | open | none | The State Comptroller Law's complaints chapter. |
| REG | 18 | Pension return-guarantee determining date | open | open | none | The amending law or regulation in Reshumot that moved the date. |
| REG | 19 | Equity and insurance amounts for ISA licensees | narrowed | narrowed | none | The official text of the Equity and Insurance Regulations 2000 (same as MGD OQ7). |
| REG | 20 | All REG law texts verified on official texts | narrowed | narrowed | none | Those four rules re-read on official texts. |
| REG | 21 | Broker client cash in a bank trust account | open | narrowed | listed on guide pages | A Bank of Israel text on trust accounts in a bank failure. |
| RG | 1 | Official current text of the REIT sections | narrowed | narrowed | graduation status | An official consolidated text dated after 31.3.2026, or each amending law since 2023 read in the gazette. |
| RG | 2 | Can a REIT hold property through unlisted subsidiaries | open | open | none | The REIT chapter read in full, regulations under s.64A11, or a Tax Authority circular. |
| RG | 3 | Consequence of a distribution shortfall; who confirms status | narrowed | closed | graduation status | closed 2026-10-26, settled today from a new source (RG-07, RG-08) |
| RG | 4 | Official current list of REITs | open | open | graduation status | TASE's sector list or Maya's company list read in a browser, then each company's periodic report. |
| RG | 5 | Each REIT's current management agreement and fees | open | open | graduation status | Each REIT's periodic report on Maya. |
| RG | 6 | Foreign REITs dual-listed on TASE | open | open | graduation status | The TASE rule book on dual listing and TASE's list of dual-listed securities. |
| RG | 7 | Israeli funds holding REITs; a REIT index tracker | open | open | graduation status | TASE index lists and the Maya fund export (CAT-34). |
| RG | 8 | How each Israeli gold fund holds exposure; full list | open | open | graduation status | Maya fund list filtered on gold, then each fund's annual report on mayafiles. |
| RG | 9 | TheMarker 1% variable fee for IBI 1147875 | open | open | none | The fund's prospectus. |
| RG | 10 | Gold funds: hedging cost and tracking difference | open | open | none | Managers' sites and annual reports. |
| RG | 11 | iShares Physical Gold ETC custody and issuer failure | open | open | graduation status | The ETC base prospectus. |
| RG | 12 | GLD's 1940 Act status in its own words | open | open | none | The current GLD prospectus. |
| RG | 13 | Physically backed gold ETC or trust on TASE | open | open | none | The ISA foreign-fund register and TASE's list. |
| RG | 14 | REIT or gold products among foreign funds on TASE | open | open | none | TASE's foreign-funds list (ETF-43). |
| RG | 15 | Real-estate crowdfunding and real-estate funds | open | open | none | A scope decision first, then the products' terms. |
| INS | 1 | Legal definition of a profit-sharing life policy | narrowed | narrowed | graduation status | The definition section of the regulations that replaced the 1998 ones, or a CMA codex definition. |
| INS | 2 | Regulatory cap on savings-policy management fees | answered, not marked | closed | graduation status | closed 2026-10-24, struck today from the rule base (INS-25) |
| INS | 3 | Fee-discount circular 2017-9-15 and savings policies | open | narrowed | graduation status | The consolidated circular's definitions file ('עמית') or a CMA statement on savings policies. |
| INS | 4 | Period behind the Comptroller's 0.94% fee figure | open | open | none | The detailed chapter of the Comptroller's report. |
| INS | 5 | Minimum deposits at other insurers | open | open | none | Each insurer's product page or offer form (company data). |
| INS | 6 | Fees and terms of hosted policy tracks | open | open | none | The insurers' track annexes and the CMA's hosting policy. |
| INS | 7 | Moving a savings policy to another insurer | answered, not marked | closed | graduation status | closed 2026-10-25, struck today from the rule base (TXA-08, TXA-28) |
| INS | 8 | Fees in guaranteed-return and old insurance policies | open | open | none | The fee regulations' provisions or CMA circulars for those policies. |
| INS | 9 | Official meaning of the Bituach-Net cohorts | open | open | none | The Bituach-Net portal notes or a CMA circular on profit-sharing fee structures. |
| INS | 10 | Guaranteed annuity factors in executive policies | open | narrowed | graduation status | CMA insurance circular 2012-1-5 and its later permits, plus a CMA rule on transfers of policies with guaranteed factors. |
| INS | 11 | Disability and risk prices inside executive policies | open | open | graduation status | Insurers' price lists or a CMA comparison covering disability cover. |
| INS | 12 | Hetz bond holdings in old-cohort portfolios | open | open | none | The Accountant General's debt reports. |
| INS | 13 | Phoenix track 2081 in Bituach-Net | open | open | none | The Phoenix's track documents (company data). |
| INS | 14 | Partial-withdrawal floors and payout times at insurers | open | open | none | Each insurer's policy terms and the regulations under Provident Funds Law s.23. |
| INS | 15 | CMA anti-money-laundering letter on investment contracts | open | open | none | Opening the CMA letter on gov.il. |
| INS | 16 | Legal basis of savings-policy deposit fees | open | open | rule text INS-25; graduation status | A regulation or CMA circular that sets or allows a deposit fee on a profit-sharing policy that is not an insurance fund. |
| SW | 1 | Current version of transfer circular 2017-9-17 | narrowed | narrowed | none | The CMA regulation collector's entry for the transfer circular. |
| SW | 2 | Transfer circular coverage of kupat gemel lehashkaa | narrowed | narrowed | site code/copy | The transfer circular in force on the CMA regulation collector or the codex chapter on transfers. |
| SW | 3 | CMA rule on retention contacts in provident products | open | open | site code/copy | The CMA service circular or codex part on fair dealing. |
| SW | 4 | Whether a pre-joining fee quote binds the fund | open | narrowed | site code/copy | A CMA rule or ruling on pre-joining fee offers. |
| SW | 5 | Clearing house: price and consent checks | narrowed | narrowed | site code/copy; rule text SW-50 | The regulations under s.31טז(ד)(1) of the advice law or the operator's published rules. |
| SW | 6 | Who tells the employer to redirect deposits | open | closed | site code/copy | closed 2026-10-26, settled today from a new source (SW-10) |
| SW | 7 | Qualifying period on a pension-to-pension transfer | open | open | none | The CMA standard bylaw's section on incoming transfers or a CMA statement. |
| SW | 8 | Tax neutrality of pension-to-pension transfers | narrowed | narrowed | blocks a guide dimension | A Tax Authority sentence that a member's transfer under the transfer regulations is not a withdrawal or tax event. |
| SW | 9 | Bank of Israel rules on switching banks | open | narrowed | site code/copy; rule text SW-26, SW-27 | The Bank of Israel's exemption notice under s.5ב1(ה) and a directive or Q&A that counts the process days. |
| SW | 10 | Supervised price for moving securities out of a bank | open | open | site code/copy; rule text SW-33, SW-52 | The Bank of Israel order or rule that sets the supervised price. |
| SW | 11 | Tax on moving securities between own accounts | narrowed | narrowed | blocks a guide dimension; site code/copy | A Tax Authority instruction to TASE members on transfers between accounts of the same owner. |
| SW | 12 | Moving securities to a foreign broker | open | open | site code/copy | A regulator's statement or a TASE member rule on transfers abroad. |
| SW | 13 | Competition Authority deposit-portability directive | open | open | none | The Competition Authority decision on gov.il and the tribunal's docket. |
| SW | 14 | Meaning of 'המנהל' in transfer regulation 3(א)(12) | open | open | none | The regulations' definitions section or a CMA statement. |
| SW | 15 | Later version of directive 448 | answered, not marked | closed | none | closed 2026-10-24, struck today from the rule base (SW-43) |
| SW | 16 | Removing an agent attached to a provident account | open | open | site code/copy | The CMA power-of-attorney circular or a circular on appointing and removing the account's licensee. |
| TXK | 1 | Child savings: tax on gains and payments | narrowed | narrowed | guide prose (2); blocks a guide dimension | A Tax Authority circular, guide item or withholding instruction naming child savings. |
| TXK | 2 | Inflation part of a KGL withdrawal | answered, not marked | closed | method G-02; listed on guide pages | closed 2026-10-25, struck today from the rule base (TXK-06, TXK-07) |
| TXK | 3 | Withholding rate on a KGL lump sum | narrowed | narrowed | method G-02; listed on guide pages | Reg. 3 in Reshumot after ק"ת 7907, or a Tax Authority instruction to managing companies. |
| TXK | 4 | Commuting an annuity bought with KGL money | open | open | method G-03; site code/copy | A CMA circular or standard annuity bylaw on money received under transfer reg. 2(ב)(2), or a Tax Authority circular on s.9א(ה). |
| TXK | 5 | Death before transfer: tax on a KGL lump sum | open | open | none | A Tax Authority circular. |
| TXK | 6 | Status of s.9(18ב) and law s.22(א1) | open | open | none | The HCJ ruling and the Knesset's consolidated text. |
| TXK | 7 | IRA: confirmations, foreign withholding, manager withholding | narrowed | narrowed | guide prose (1); blocks a guide dimension; rule text TXK-18 | An IRS or Tax Authority statement on Israeli provident funds as treaty residents, or a fund's audited note on foreign tax withheld. |
| TXK | 8 | Business-income exception for an active IRA | open | open | listed on guide pages | A published Tax Authority ruling or circular. |
| TXK | 9 | NII and health on KGL lump sum and annuity | narrowed | narrowed | method G-11 | An NII circular or page on annuities from provident funds before retirement age. |
| TXK | 10 | Losses on a KGL withdrawn below deposits | open | open | blocks a guide dimension | A Tax Authority circular or guide item. |
| TXK | 11 | Source of the 2026 ceiling figure | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (KGL-03, KGL-24) |
| TXK | 12 | 60+ brackets on KGL deemed interest | narrowed | closed | blocks a guide dimension; site code/copy | closed 2026-10-26, settled today from a new source (TXG-08, TXI-19, TXK-06) |
| TXG | 1 | Has the Minister changed the 15% rates by order | open | open | none | The subsidiary-legislation list for the Ordinance in Reshumot. |
| TXG | 2 | NI and health on passive income: remaining parts | narrowed | narrowed | method G-27 | s.335 of the National Insurance Law read in full, and NII pages or circulars on income not from work. |
| TXG | 3 | 2027 budget status | open | open | none | Monthly re-check until a 2027 budget law is published (first 2026-11-22). |
| TXG | 4 | Foreign-broker saver: annual return or not | open | narrowed | method G-22; site code/copy | A Tax Authority statement on a foreign-broker saver who paid half-yearly advances. |
| TXG | 5 | 2026 filing-exemption amounts | open | open | none | The January 2027 deductions booklet or the 2026 annual guide (standing re-check, 2027-03-31). |
| TXG | 6 | Credit points against special-rate income | open | closed | method G-23 | closed 2026-10-26, settled today from a new source (TXG-05) |
| TXG | 7 | 60+ saver: withholding at source | open | closed | method G-21 | closed 2026-10-26, settled today from a new source (TXG-08, TXG-25) |
| TXG | 8 | Indexation on 1.1.2028: catch-up or one year | open | open | none | s.120B read in full on an official text, or a Tax Authority explanation. |
| TXG | 9 | Tax Authority circular on the 2% surtax | narrowed | narrowed | none | The Tax Authority's 2025-2026 professional circulars list. |
| TXG | 10 | 60+ brackets on dividends and unlinked-bond gains | open | open | none | The exact s.125B text read with the guide's maximum-rate fields, or a Tax Authority statement. |
| TXG | 11 | Annual-return deadline for tax year 2025 | open | open | none | Ordinance s.132 and the Tax Authority's 2026 extension notice. |
| TXG | 12 | Surtax withheld at source on capital income | open | closed | method G-21 | closed 2026-10-26, settled today from a new source (TXG-11, TXG-18) |
| TXG | 13 | Real loss when CPI exceeds the nominal gain | open | narrowed | method G-07 | A Tax Authority circular or the form 1322 instructions on a real loss. |
| TXH | 1 | Real vs nominal base on non-benefited gains | narrowed | closed | guide prose (1); listed on guide pages | closed 2026-10-26, settled today from a new source (TXH-11, TXK-07) |
| TXH | 2 | 2027 budget changes to study funds | open | open | listed on guide pages | A 2027 budget bill or memorandum on the government portal or the Knesset (standing re-check). |
| TXH | 3 | Self-employed benefited deposit amount and update | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (TXH-08) |
| TXH | 4 | NII and health on employer study-fund deposits | narrowed | narrowed | none | The NII Law provision or an NII page on employer study-fund deposits. |
| TXH | 5 | Which retirement age triggers the 3-year rule | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (KH-12, TXH-10) |
| TXH | 6 | Proof of study use | open | open | none | The 1997 rules on study withdrawals or a Tax Authority circular. |
| TXH | 7 | Basis of the reduced self-employed ceiling | open | open | none | s.17(5א) read in full in the Tax Authority's Ordinance text. |
| TXH | 8 | Basis of the pre-2003 gains exemption | open | open | none | A transitional provision of the 2002-2003 reform law. |
| TXH | 9 | Death and non-benefited gains | open | open | none | The 1997 Order's definitions or a Tax Authority circular. |
| TXH | 10 | Order of withdrawal, benefited vs non-benefited | open | open | none | The 1964 Income Tax Rules (rule 41יג) read in an official copy, or a CMA circular. |
| TXH | 11 | Transfer between study funds not a tax event | narrowed | narrowed | listed on guide pages | A Tax Authority circular, or a CMA transfer-circular clause, that names the study-fund transfer. |
| TXH | 12 | Exact wording and currency of the legislation | narrowed | narrowed | none | Re-reading the remaining texts in official copies before encoding. |
| TXH | 13 | Account closure in practice after a withdrawal | narrowed | narrowed | none | Managers' withdrawal forms or service pages (company practice). |
| TXH | 14 | Was the 2024 s.124D memorandum enacted | open | open | none | The Knesset database for a s.124D amendment in 2024. |
| TXA | 1 | Rate on savings-policy gains: 25% or 15% | narrowed | narrowed | not-covered page (G-24); site code/copy; graduation status | A Tax Authority circular or ruling on the rate for policy gains, or a CMA statement that today's savings policies are approved as profit-sharing. |
| TXA | 2 | Tax on pre-December-2002 policy deposits | open | open | none | A Tax Authority circular or the transitional provisions of the law that added s.3(ה5). |
| TXA | 3 | Moving a savings policy to another insurer | closed | closed | G-24 (removed today) | closed 2026-10-25, already struck (TXA-08, TXA-28) |
| TXA | 4 | Partial withdrawal from a savings policy | open | open | none | A Tax Authority circular or the insurers' terms (the latter would only narrow). |
| TXA | 5 | Death tax on policy savings and Amendment 190 money | narrowed | narrowed | none | A Tax Authority text on the beneficiaries' tax in those cases. |
| TXA | 6 | Tax on growth inside executive insurance | open | open | not-covered page (G-24); site code/copy; graduation status | A Tax Authority text on the income of insurers' profit-sharing portfolios (an insurer's tax note would only narrow). |
| TXA | 7 | Risk and disability components in executive insurance | open | open | none | A Tax Authority circular on insurance components of executive policies. |
| TXA | 8 | Pre-2008 capital money in executive insurance | open | open | none | A Tax Authority statement on s.9(18) and insurance funds. |
| TXA | 9 | Legal source of Amendment 190 age ceilings | open | closed | G-24 (removed today) | closed 2026-10-26, settled today from a new source (TXA-23, TXA-24, TXA-30) |
| TXA | 10 | Basis of age-60 and three-payslip conditions | narrowed | closed | G-24 (removed today) | closed 2026-10-26, settled today from a new source (TXA-22, TXA-27, TXA-30) |
| TXA | 11 | Exempt commutation and the recognized annuity together | open | closed | G-24 (removed today) | closed 2026-10-26, settled today from a new source (TXA-19) |
| TXA | 12 | The promised recognized-annuity circular | open | open | none | A re-check of the Tax Authority's professional circulars (a standing re-check). |
| TXA | 13 | Recognized annuity received before 60 | open | open | none | A Tax Authority circular or ruling on recognized annuities before 60. |
| TXA | 14 | NII on a recognized annuity and its commutation | open | narrowed | not-covered page (G-24); method G-11; site code/copy | An NII publication on contributions from provident-fund annuities and commutations. |
| TXA | 15 | Surtax on the 15% commutation income | open | narrowed | not-covered page (G-24); site code/copy | A Tax Authority statement or form 1301 instruction on where a recognized-annuity commutation is reported. |
| TXA | 16 | Proposed changes to Amendment 190 and policies | open | open | none | A re-check of the 2027 budget and committee outcomes (a standing re-check). |
| TXA | 17 | Notional redemption of a savings policy | open | open | none | A Tax Authority ruling or instruction to insurers, or the form-867 instructions for insurers. |
| TXI | 1 | Ministerial definition of partial linkage differentials | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (TX2-18) |
| TXI | 2 | Prime-linked deposits: linked or unlinked | open | open | guide prose (1); listed on guide pages; site code/copy | A Tax Authority statement or form 867 instructions naming prime-based deposits. |
| TXI | 3 | Makam discount 20% guide line and sale split | narrowed | narrowed | guide prose (2); method G-09; blocks a guide dimension; site code/copy | A Tax Authority statement on the makam rate and rules under s.101A(a)(5). |
| TXI | 4 | FX deposit withholding rate for residents | narrowed | narrowed | none | Tax Authority instructions to banks on FX-deposit withholding. |
| TXI | 5 | Accrued interest for a private bond buyer | open | open | guide prose (3); method G-10; blocks a guide dimension; rule text TXI-16 | An order under s.3(ח1) or Tax Authority withholding guidance for a buyer between coupon dates. |
| TXI | 6 | Deflation and negative real yield tax treatment | narrowed | narrowed | listed on guide pages | The capital-gains rule for a negative inflationary amount (TXS OQ15 / TXG OQ13). |
| TXI | 7 | Securities losses against bank-deposit interest | open | closed | blocks a guide dimension | closed 2026-10-26, settled today from a new source (TXI-17) |
| TXI | 8 | Gilon and Shahar series linkage | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (GOV-13, GOV-14, TXI-15) |
| TXI | 9 | Is 15% unlinked interest fixed for age 60+ | open | open | guide prose (1); blocks a guide dimension | A Tax Authority sentence or form 1301 computation note on field 21. |
| TXI | 10 | History of the 15% rate-change power | open | open | none | A Reshumot search for an order changing the 15% rate (twin of TXG OQ1). |
| TXI | 11 | Current-account interest and the s.125D deduction | open | narrowed | guide prose (1); blocks a guide dimension | A Tax Authority statement, or its s.125D guidance naming current accounts. |
| TXI | 12 | Retirement age in s.125D(c) | open | open | none | The Retirement Age Law cross-reference read in the statute (low value). |
| TXI | 13 | s.125E maximum: 39,605 or 39,606 | open | open | none | The official consolidated amount for 2024-2027. |
| TXI | 14 | Tax on an early-broken deposit or plan | open | open | guide prose (2); method G-16; listed on guide pages; site code/copy | A Tax Authority statement on broken deposits and credited plan interest. |
| TXI | 15 | National Insurance and health on interest | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (TXG-27, TXG-34) |
| TXI | 16 | 2026 edition of the annual tax guide | open | open | none | Re-check the gov.il guide page for the 2026 edition. |
| TXI | 17 | Exact wording of quoted phrases | narrowed | narrowed | none | Re-read those rules' phrases against the Tax Authority Ordinance PDF and the guide's text layer. |
| TXI | 18 | Later amendments to 2005 and 2002 regulations | narrowed | closed | rule text TXI-08 | closed 2026-10-26, settled today from a new source (TXI-08, TXI-13) |
| TXP | 1 | Current form for fixing the annuity exemption | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (TXP-28) |
| TXP | 2 | Tax forms on leaving a job | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (TXP-29, TXP-30) |
| TXP | 3 | Taxable base of a non-compliant withdrawal | open | closed | guide prose (4); method G-06; blocks a guide dimension | closed 2026-10-26, settled today from a new source (TXP-18) |
| TXP | 4 | Which 2025 average wage applied where | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (TXP-03, TXP-10) |
| TXP | 5 | How the severance ceiling applies over a year | open | closed | none | closed 2026-10-26, settled today from a new source (TXP-11) |
| TXP | 6 | Whether payroll grants the 45A credit monthly | open | open | listed on guide pages | The Income Tax (Deduction from Salary and Wages) Regulations 1993 on credits for provident payments, or a Tax Authority instruction to employers. |
| TXP | 7 | Age-50 enlarged deduction: 2026 amounts | open | narrowed | method G-13 | The current text of the 1980 regulations on Nevo or in Reshumot. |
| TXP | 8 | Self-employed mandatory deposit: law and 2026 thresholds | narrowed | narrowed | none | The Efficiency Law 2017-2018 definition of the average wage for the self-employed deposit, or a Tax Authority 2026 figure. |
| TXP | 9 | Tax on gains in lawful annuity-fund lump sums | open | open | blocks a guide dimension | A Tax Authority circular or ruling on gains in lump sums lawfully paid from a provident fund for annuity. |
| TXP | 10 | Small-balance withdrawal exemption threshold | open | open | none | The Provident Funds Law's current s.23(ב)(1א) and the Tax Authority's current figure. |
| TXP | 11 | Basis of Form 106's 40% limited tax | open | open | none | The Ordinance section or regulation that sets the 40% rate. |
| TXP | 12 | Current text of 1964 regulation 19 | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PEN-35, TXP-10, TXP-11) |
| TXP | 13 | Men's retirement age in the law | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (PEN-26) |
| TXP | 14 | Exact Ordinance wording off Wikisource | narrowed | narrowed | none | Re-reading those rules on the Tax Authority's consolidated Ordinance or the Knesset text. |
| TXP | 15 | Annuity as personal-exertion income | open | open | none | The Ordinance s.1 definition of 'הכנסה מיגיעה אישית'. |
| TXP | 16 | Payslip labels used by payroll software | open | open | method G-19 | Sample payslips from the founder or friends recorded as institution-level evidence. |
| TXF | 1 | Accumulating foreign funds taxed only on sale | narrowed | narrowed | guide prose (2); method G-18; blocks a guide dimension; site code/copy | A Tax Authority ruling, circular or Q&A on accumulating foreign funds. |
| TXF | 2 | PFIC-like rule for minority foreign fund holders | narrowed | narrowed | none | A Tax Authority statement on minority holdings in foreign funds. |
| TXF | 3 | Israeli withholding on top of foreign withholding | open | open | listed on guide pages; rule text TXF-10 | A Tax Authority instruction to banks on foreign dividends, or a bank's form 867 showing the foreign tax netted. |
| TXF | 4 | Tax on FX gain from cash at a foreign broker | open | open | none | A Tax Authority Q&A or pre-ruling on FX cash at a foreign broker. |
| TXF | 5 | Real gain when the foreign currency weakened | open | narrowed | not-covered page (G-24) | A Tax Authority example or instruction for a foreign-currency security whose currency fell. |
| TXF | 6 | Irish tax on an Irish fund's distributions | open | closed | method G-05; listed on guide pages | closed 2026-10-26, settled today from a new source (TXF-28) |
| TXF | 7 | US withholding an Irish fund actually suffers | open | open | listed on guide pages | Each Irish fund's prospectus or annual report (data track, data/funds/). |
| TXF | 8 | Israeli funds holding foreign assets versus foreign funds | open | open | none | ISA or Tax Authority guidance, or fund prospectuses. |
| TXF | 9 | TXF-07 versus s.92(a)(4) on loss offset | open | open | none | A Tax Authority clarification of the 4.7.2019 letter. |
| TXF | 10 | Is the 2019 'קרן חוץ' letter in force | open | open | rule text TXF-05 | An official Tax Authority copy of the letter or a later instruction replacing it. |
| TXF | 11 | US estate tax details for Israelis | open | open | none | Form 706-NA instructions Table A and IRS guidance on trusts. |
| TXF | 12 | Shekel conversion rules under s.240א | open | open | none | כללי מס הכנסה (המרה לשקלים חדשים של סכומים שמקורם מחוץ לישראל), התשס"ד-2003. |
| TXF | 13 | US portfolio-interest exemption for Israelis | open | open | none | IRS Publications 519 and 515 on portfolio interest. |
| TXF | 14 | Foreign bond fund distributions: interest or dividend | open | open | none | A Tax Authority statement or form 867 instruction on foreign fund distributions. |
| TXF | 15 | How banks compute tax on foreign securities | open | open | none | A Tax Authority directive to banks or a bank's tax page. |
| TXF | 16 | Re-read of the guide's shortened reporting route | answered, not marked | closed | rule text TXF-21 | closed 2026-10-25, struck today from the rule base (TXF-21) |
| TXF | 17 | Official gov.il URL of circular 04/2026 | open | open | none | The circular on gov.il (a person, or FlareSolverr for the gov.il page). |
| TXS | 1 | Is any money-market fund or ETF taxable | narrowed | narrowed | none | A count of ETF tax status over TASE's or Maya's ETF data. |
| TXS | 2 | Income Tax circular 7/2003 on foreign-investment funds | answered, not marked | closed | none | closed 2026-10-25, struck today from the rule base (TXS-14) |
| TXS | 3 | Later amendments to the two withholding regulations | open | open | none | Reshumot or an official consolidated text dated after 2017. |
| TXS | 4 | Loss offset between spouses | open | open | none | Form 1322 instructions or a Tax Authority Q&A on joint computation. |
| TXS | 5 | Basis for banks offsetting losses against interest | open | open | none | Other withholding regulations or a Tax Authority instruction to banks. |
| TXS | 6 | Age 60+ lower brackets on withheld gains | narrowed | closed | listed on guide pages | closed 2026-10-26, settled today from a new source (TXG-25, TXS-09, TXS-23) |
| TXS | 7 | Exempt-fund distributions against securities losses | open | open | none | A Tax Authority statement on s.92(א)(4) and s.125ב1(ב) distributions. |
| TXS | 8 | Foreign tax inside an Israeli exempt fund | narrowed | narrowed | none | A Tax Authority ruling or circular on foreign tax paid inside an exempt fund. |
| TXS | 9 | Order under s.101א(א)(12) deeming a sale | open | open | none | A Reshumot search for an order under s.101א(א)(12). |
| TXS | 10 | Has the Minister changed the 15% rate | narrowed | narrowed | none | A Reshumot search for 'צו מס הכנסה (שינוי שיעור המס'. |
| TXS | 11 | Fund-level rate in a taxable shekel fund | open | closed | blocks a guide dimension | closed 2026-10-26, settled today from a new source (TXS-11) |
| TXS | 12 | Do banks deduct fees when withholding | open | narrowed | method G-20; listed on guide pages | The Director's approval or rules under reg. 8, or a bank's form 867 showing fees deducted. |
| TXS | 13 | Bank of Israel money-market fund pages | open | open | none | A person opening the two BoI pages. |
| TXS | 14 | Date of the s.88 'מועד קובע' | open | closed | none | closed 2026-10-26, settled today from a new source (TXS-06) |
| TXS | 15 | Falling CPI and the taxable base | open | narrowed | guide prose (3); method G-07; listed on guide pages | A Tax Authority example or instruction (form 867 or withholding software rules) for a period of falling CPI. |
| TX2 | 1 | FX deposit when the currency falls | answered, not marked | closed | G-24 (removed today); graduation status | closed 2026-10-22, struck today from the rule base (TX2-01, TXI-25) |
| TX2 | 2 | FX-deposit withholding base and legal basis | open | open | not-covered page (G-24); site code/copy | A Tax Authority instruction to banks, or an amendment of the 2005 regulations after 2017. |
| TX2 | 3 | Olim FX-deposit orders and the 2026 reform | narrowed | narrowed | none | The 2026 olim legislation read for amendments to the two orders. |
| TX2 | 4 | FX outside a bank: banknotes, foreign-broker cash | open | open | graduation status | A Tax Authority statement or ruling on FX cash outside a bank. |
| TX2 | 5 | Structured-deposit payout classification | narrowed | narrowed | not-covered page (G-24); site code/copy | A Tax Authority circular, FAQ or pre-ruling on structured deposits. |
| TX2 | 6 | Corporate bonds in default | open | narrowed | not-covered page (G-24); site code/copy | A Tax Authority statement on a bond written off without a sale event and on withholding in a settlement. |
| TX2 | 7 | REIT "other income" withholding rate | narrowed | narrowed | site code/copy | An order under s.64A5(a)(3) in Reshumot, or the Tax Authority saying none exists. |
| TX2 | 8 | National Insurance on REIT distributions | open | open | not-covered page (G-24); site code/copy | An NII statement or circular on REIT distributions, or a provision classifying REIT pass-through income for National Insurance. |
| TX2 | 9 | Gold funds and foreign-investment-fund status | open | open | none | Each gold fund's prospectus part A on Maya. |
| TX2 | 10 | Foreign gold ETCs and grantor-trust ETFs | open | open | not-covered page (G-24); site code/copy; graduation status | A Tax Authority pre-ruling or circular on gold ETCs or grantor-trust ETFs. |
| TX2 | 11 | Fees in a year with no gains | open | open | none | The regulations or order under s.92(a)(5). |
| TX2 | 12 | VAT on portfolio-management fees | answered, not marked | closed | G-24 (removed today); graduation status | closed 2026-10-24, struck today from the rule base (TX2-17) |
| TX2 | 13 | Managed portfolios that hold funds | narrowed | narrowed | none | A manager's disclosure of how it handles tax on fund units (institution). |
| TX2 | 14 | Corporate bonds bought below par: discount split | open | open | none | Rules under s.101A(a)(5) or a Tax Authority capital-market circular. |
| TX2 | 15 | REIT foreign holdings and partial-year sales | open | open | none | The REIT chapter and fund reports. |
| TX2 | 16 | Israeli structured notes and bank linked bonds | open | open | none | FXD or CORP research on retail offers. |
| TX2 | 17 | Exact wording of the TX2 quotes | narrowed | narrowed | none | Those rules re-read on the Tax Authority's Ordinance PDF and official regulation texts. |
| CAT | 1 | CMA "sources and assumptions": remainder | narrowed | narrowed | none | As items 2 to 4. |
| CAT | 2 | How the published average fee is weighted | narrowed | narrowed | site code/copy | The CMA reporting instructions that feed the portals (item 23). |
| CAT | 3 | Risk fields: alpha benchmark, Sharpe, deviation, liquidity | open | open | listed on guide pages | The CMA reporting instructions or a Gemel-Net specification. |
| CAT | 4 | Exposure fields: unit and basis | open | open | none | The CMA circular on monthly fund reports. |
| CAT | 5 | Liquidity semantics | open | open | none | As item 3. |
| CAT | 6 | Meaning of INCEPTION_DATE | open | open | none | The CMA field definition. |
| CAT | 7 | Revisions and completeness of periods | open | open | none | Comparing monthly snapshots (standing). |
| CAT | 8 | How mergers appear in the data | open | open | none | More mergers checked in the data. |
| CAT | 9 | The CMA list of investment tracks (2024-1471) | narrowed | closed | guide prose (2); listed on guide pages | closed 2026-10-26, settled today from a new source (CAT-15, CAT-23) |
| CAT | 10 | CMA instrument deferring the start to 1.7.2024 | open | open | none | The amending CMA circular on gov.il. |
| CAT | 11 | Money-market track period: does it apply to KGL and KH | open | open | listed on guide pages | A CMA FAQ or clarification on s.6א, and Meitav's bylaws for fund 7857. |
| CAT | 12 | Meitav app menu and duplicate "general" | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (CAT-25, CAT-28) |
| CAT | 13 | Is Meitav Kids fund 7857 | open | narrowed | none | The Meitav Kids terms or bylaws naming the fund number. |
| CAT | 14 | Where the public mutual-fund list is | answered, not marked | closed | none | closed 2026-10-22, struck today from the rule base (CAT-33, CAT-34) |
| CAT | 15 | Pension fees at fund level | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (CAT-39) |
| CAT | 16 | Operator codes on Meitav notices | open | open | none | Clearing-house product-code documentation. |
| CAT | 17 | When track 15472 opened to the public | open | open | none | A Meitav notice or bylaws amendment. |
| CAT | 18 | Track-name prefix rules and the 2024 draft regulation | open | open | listed on guide pages | The CMA list (item 9) and the draft regulation on tazkirim.gov.il. |
| CAT | 19 | Which other Meitav products the app offers | answered, not marked | closed | none | closed 2026-10-23, struck today from the rule base (CAT-26) |
| CAT | 20 | Exact spellings of classification values | open | open | none | The raw CSV read once. |
| CAT | 21 | Dictionary vs data mismatches | open | open | none | Rely on the data and document it, or ask the CMA. |
| CAT | 22 | Thirteen 2024 tracks with no fee value | open | open | none | The 202701 rows, then the CMA if still empty. |
| CAT | 23 | How the published annual fee average is computed | open | open | none | The CMA annual reporting instructions. |

## Appendix: the helpers' notes per item

- **BANK OQ3**: Closed on the Wikisource consolidated text (a mirror of the law the brief accepts); the BoI copy stops at 30.12.2014. data/rules/bank-07.json notes say the Schedule E exempt sum 'is not recorded here (BANK OQ3)': the figure NIS 1,000 is current and the record can carry it. BANK-07 Figures and Source edited.
- **BANK OQ4**: In passing: the Hebrew Wikisource consolidated text of the law (raw) is current to the 2026 Economic Plan Law and was used for BANK OQ5 and OQ9; it could close this item if the lead accepts the mirror.
- **BANK OQ5**: BANK-21 edited (Rule now also exempts the tiny bank; Conditions give both definitions; Source adds ספר החוקים 3510). data/rules/bank-21.json notes ('Which banks count as small is open') and instrument record bank-deposit (BANK OQ5) stay valid but could add the tiny-bank exemption. The 2026 law's commencement is REG OQ12 in regulators-and-protection.md.
- **BANK OQ8**: Narrowed in the rule base by regulators-and-protection.md REG-04 to REG-06 (another file); REG OQ13 is the twin. Site prose exposure/shekel-cash.tsx:42 already states the s.8יא power and names BANK OQ8 for the rest.
- **BANK OQ9**: Instrument blocker current-account 'fee-deposit: blocked:BANK-OQ9' can be unblocked (basic track at most NIS 10 a month to 30.6.2027). data/rules/bank-17.json notes say the order and price were not read (BANK OQ9). NEW RULE BANK-35 added (2026 order: payment-account management capped at NIS 5 / NIS 10 / NIS 1 per action above 100 from 1.7.2027, immediate-debit card NIS 7 a month from 1.10.2026; fee rules delete the track definitions from 1.7.2027): the lead decides on a data/rules record. BANK-17 'Likely to change' changed from no to yes. Gazette pages were read as Reshumot scans hosted on olaw.org.il; the Wikisource texts of both orders match.
- **BANK OQ11**: Narrowed in Phase A by bank-product-names.md BPN-11.
- **BANK OQ12**: Method gap G-16 and the savings-plan liquidity-lockup blocker stay open; BPN-10 (institution: Bank Hapoalim) is the only contract-level answer.
- **BANK OQ13**: The item carries a 2026-10-22 note 'Closed by BANK-30 (institution strength)', but BANK-30 is Bank of Jerusalem's article; under D30 one company's document does not prove another's usage, so it was left unstruck. coverage.md line 267 cites it as closed; the lead may judge differently.
- **BANK OQ15**: Narrowed in Phase A by the Hapoalim section of bank-product-names.md.
- **BANK OQ16**: Narrowed in Phase A by fx-and-structured-deposits.md FXD-13.
- **BPN OQ1**: coverage.md lines 198 and 284 cite BPN OQ1 (line 198 still says 'no names yet for Discount'); the lead may update coverage.md.
- **BRK OQ1**: BRK-03 Conditions still say up to 3 Israeli non-bank members are not named (open question 1); stale since BRK-32. coverage.md already shows it closed (line 102, 253).
- **BRK OQ3**: data/instruments brokerage-account lists BRK OQ3 in open_questions; remove. coverage.md line 102 cites '(REG OQ9, BRK OQ3)' for 'no statute found that segregates a non-bank member's client assets': the TASE rules (ISA-approved) are now read; the statute point is REG OQ9's.
- **BRK OQ7**: Contradiction: the item's 2026-10-22 note says 'Closed by BRK-35', but BRK-35 Conditions say the Irish Investor Compensation Company's page was not reached (open question 7). Left open as narrowed.
- **BRK OQ8**: Stale text in brokerage-account.md: BRK-15 Conditions ('The TASE page that holds the comparison was not readable (open question 8)'), BRK-26 Conditions ('whether TASE's 45טז publication includes actual-fee averages is open question 8') and BRK-30 Conditions ('open questions 8, 18, 19'). The reporting period of the averages is still not shown (BRK-33).
- **BRK OQ10**: BRK-16 Conditions still say whether a bank may charge a fee type not in part 4 'is not stated in the text read (open question 10)'; BANK-16 answers it. data/instruments brokerage-account lists BRK OQ10.
- **BRK OQ11**: Phase A: already narrowed by MF-26 (distribution-fee regulations reg. 2(ד): no fee for buying, holding or redeeming money-market units by a distributor under a distribution agreement). Possible data conflict: the non-bank snapshots data/fees/{altshuler-trade,excellence,ibi,psagot}@2026-10-23.json list their custody line's applies_to as including makam and money_market_units, while method F-63 treats money-market funds as held free (MF-26); the lead or data owner should check. coverage.md line 176 names BRK OQ11. Instrument records brokerage-account, makam, money-market-fund-daily, money-market-fund-renewable list it.
- **BRK OQ12**: Same question as switching-and-transfers.md open question 10 and SW-52 (another helper's file); the BoI 2021 court position (boi.org.il/media/e4xji1rw/202207.pdf) may help there. Rule record BRK-18 names it.
- **BRK OQ13**: Rule record BRK-21 names it.
- **BRK OQ16**: coverage.md line 102 still lists 'Whether non-bank members and foreign brokers withhold Israeli tax (BRK OQ16)' as open. data/instruments brokerage-account lists BRK OQ16.
- **BRK OQ17**: A general fact for a rule if the lead wants one: Directive 416 s.1 excludes 'חשבונות קרדיטוריים הנפתחים לטובת קטינים על ידי אפוטרופוס או נותן מתנה לקטין, ואשר הקטינים אינם מתערבים בניהולם' (boi.org.il/media/d32dirqr/416.pdf, p.1).
- **BRK OQ19**: A company's own tariff question, closed by its own document. BRK-30 Conditions ('open questions 8, 18, 19') are stale for 8 and 19.
- **BRK OQ21**: Not site-dependent; narrowed in passing from TASE's part-three guidelines (fractions of a trading unit trade once a year, 25 December). Note added.
- **CS OQ1**: coverage.md line 262 cites CS OQ1, OQ2 as the open question behind CS-24; no other site dependency.
- **CS OQ5**: Instrument records child-savings-bank.json and child-savings-provident.json list CS-OQ5 in open_questions; coverage.md lines 107 and 211 call the age-18 grant's basis open. CS-13 Conditions and Source edited.
- **CS OQ6**: data/rules/cs-15.json names CS OQ6: its text should drop the open-question wording. CS-15 Conditions and Source edited.
- **CS OQ10**: method.md G-17 and site code (components/holdings/consolidation.tsx, shared.tsx, copy.ts:1741) keep CS OQ10 as the blocked default check; unchanged.
- **CS OQ11**: coverage.md lines 69 and 107 already mark it read; no change needed there beyond consistency.
- **CS OQ13**: Instrument record child-savings-provident.json lists CS-OQ13. CS-16 Conditions and Source edited.
- **CS OQ14**: Instrument record child-savings-bank.json still lists CS-OQ14 in open_questions although it is closed.
- **CORP OQ6**: Graduation status (D2) names 'price quotation and settlement (6)' as missing: still missing (narrowed only); no Graduation status edit made.
- **ETF OQ1**: Not site-dependent; narrowed in passing while reading TASE's part-three guidelines for ETF open question 12. Note added.
- **ETF OQ2**: OQ-tag site/app/content/exposure/index-ta125.tsx:59 (still open); instrument record index-ta125.
- **ETF OQ4**: method.md G-29 cites ETF OQ4 for foreign-domiciled funds traded abroad having no complete list; no register would settle that, so G-29's citation may be better pointed elsewhere. site/app/copy.ts:2282 and rule record ETF-30 name it.
- **ETF OQ9**: Dated 2026-10-25, not 2026-10-22: MF-54 (the 2026-10-22 note) rests on Maya tooltips for part of the scale and on a fund manager's page for 3/C, 5/E, 6/F; the gazette read of 2026-10-25 (ETF-12) is the general source. coverage.md line 100 still lists ETF OQ9 as open.
- **ETF OQ11**: OQ-tag site/app/content/exposure/index-sp500.tsx:60 (still open); instrument record index-sp500.
- **ETF OQ12**: New rule ETF-67 written in etfs-and-index-funds.md (the lead decides on a data/rules record). Guide prose site/app/content/exposure/index-ta125.tsx:59 says the minimum trade size is not yet documented (ETF OQ12); it is now (ETF-67). Instrument record index-ta125 lists ETF OQ12.
- **ETF OQ19**: The item already said 'Closed 2026-10-23' but was not struck. The index provider's own description of its own index, closed by its own documents. The withholding-rate part continues as ETF open question 24.
- **ETF OQ20**: The item already said 'Closed 2026-10-23' but was not struck. data/rules/etf-33.json text_he still says the TA-125 rules (weight cap, entry and exit ranks) were not read and are an open question (ETF OQ20); stale since ETF-41 and ETF-42.
- **FXD OQ1**: Graduation status (FX deposits) names open questions 1 to 4 and 12: unchanged for this one.
- **FXD OQ2**: Graduation status (FX deposits) lists 'the spread rule (open questions 1 to 4, 12)': FXD OQ2 is now narrowed by disclosure rules s.28; the lead may reflect it (Graduation status not edited).
- **FXD OQ4**: Graduation status (FX deposits) names this question; unchanged.
- **FXD OQ10**: Twin of government-bonds-and-makam.md GOV OQ11.
- **FXD OQ11**: Narrowed in Phase A by tax-tier2-other.md TX2-19 (another file).
- **GOV OQ1**: coverage.md lines 265-266 already list GOV OQ1 as closed by GOV-22 and GOV-23.
- **GOV OQ2**: OQ tags exposure/makam.tsx:53 and guide/makam.tsx:40 stay valid.
- **GOV OQ3**: data/rules/gov-03.json notes cite GOV open question 3 (unchanged).
- **GOV OQ4**: The OQ tag at exposure/government-bond-unlinked.tsx:45 ('תקנות הסדרות בריבית קבועה (שווי נקוב, תדירות הקופון, מועד קובע)') is now answered for the current 'ממשלתית' series by GOV-13 plus the Accountant General's page; only legacy 'שחר' series remain. The lead may reword that prose, or close GOV OQ4 if legacy שחר series are out of scope.
- **GOV OQ5**: Site OQ tag exposure/government-bond-unlinked.tsx:45 names GOV OQ5; instrument records wrappers/government-bond.json and exposures/government-bond-unlinked.json list GOV-OQ5; data/rules/gov-14.json notes cite GOV open question 5 and TXI open question 8, and its 1999 interest-period figure should move to the 2006 type (rate from the makam closest to one year over five trading days, three-month periods, no margin, no floor). The GOV Summary bullet saying floating bonds have a 0% floor 'in the 1999 regulations' is true only of legacy גילון חדש series (Summary not edited). The heading of GOV-14 still says 'formerly "גילון"'; the AG page shows separate types.
- **GOV OQ6**: OQ tag exposure/government-bond-cpi.tsx:46 stays valid; instrument record government-bond-cpi lists GOV-OQ6.
- **GOV OQ7**: NEW RULE GOV-24 added (TASE unit, minimum order, price steps, maximum order, last trading day for government bonds and makam; Scope general): the lead decides on a data/rules record. Instrument blockers 'minimum: blocked:GOV-OQ7' in wrappers/makam.json and wrappers/government-bond.json could rest on GOV-24 instead; GOV OQ7 stays open for the settlement cycle (payout days). Site prose guide/government-bond.tsx:32 and guide/makam.tsx:40 say the exchange minimum 'עוד לא נבדק': now sourced. GOV-17 Conditions edited to point to GOV-24. data/rules/gov-15.json notes cite GOV open question 7.
- **GOV OQ8**: OQ tag guide/government-bond.tsx:32 stays valid for process and minimum.
- **GOV OQ9**: The item carries a 2026-10-22 note 'Closed for BoI by GOV-22'; it covers makam only, so left open. OQ tag exposure/government-bond-unlinked.tsx:45 stays valid.
- **GOV OQ11**: Twin of fx-and-structured-deposits.md FXD OQ10.
- **GOV OQ12**: Instrument records exposures/government-bond-cpi.json and exposures/government-bond-unlinked.json list GOV-OQ12. The Terms table rows 'שחר', 'גליל', 'גילון' call them 'former name' on Wikipedia's authority; the AG page shows separate older types (Terms not edited).
- **GOV OQ13**: Closed in passing (not site-dependent).
- **IRA OQ3**: Guide pages site/app/content/guide/ira-hishtalmut.tsx:38 and ira-provident.tsx:42 still say the cap after the amendment was not found and show "שאלה פתוחה: IRA OQ3"; instrument records ira-hishtalmut.json and ira-provident.json list IRA-OQ3 and their fee notes (line 68/69) still call the cap unsettled; coverage.md line 108.
- **IRA OQ4**: Instrument record ira-provident.json lists IRA-OQ4. Contradiction: TXK-16 says the definition names only benefits funds and study funds (true of the 2005 text); the current text, like IRA-01, also names "קופת גמל לקצבה". IRA-03 Conditions and Source edited.
- **IRA OQ8**: Instrument records ira-hishtalmut.json and ira-provident.json list IRA-OQ8.
- **IRA OQ12**: IRA-17 Conditions still say the fee column's unit is not defined; CAT-35 settles it (lead or the IRA owner may update).
- **KH OQ1**: Instrument record keren-hishtalmut.json lists KH-OQ1; coverage.md lines 104, 208 and 289 still list it as open or conflicting.
- **KH OQ2**: Instrument record keren-hishtalmut.json lists KH-OQ2.
- **KH OQ4**: method.md G-25 cites KH OQ4; unchanged (terms still not sourced).
- **KH OQ6**: Instrument record keren-hishtalmut.json lists KH-OQ6.
- **KH OQ8**: Instrument record keren-hishtalmut.json lists KH-OQ8 and TXH-OQ5. KH-12 Conditions and Source edited.
- **KH OQ11**: Instrument record keren-hishtalmut.json lists KH-OQ11. KH-23 Conditions and Source edited; KH-23 mixes company terms (Altshuler Shaham, Harel, Meitav) with the general circular, a scope implication (split under D30) for the Scope reviewer. KH-23 Conditions also still say the fee-field units are undefined, which CAT-35 settles.
- **KGL OQ1**: coverage.md line 103 already strikes the ceiling item.
- **KGL OQ3**: KGL-14 Conditions still say the fee regulations were read only through the Wikisource mirror (open question 3) and its Source cites the mirror; it should point to PF-02's official text.
- **KGL OQ8**: coverage.md line 207 still lists the 5-year vs 2-year conflict with PF OQ1-2 and KGL OQ8.
- **MGD OQ11**: Site dependency is a false positive: the MGD Graduation status names "TX2 open question 11", not MGD OQ11.
- **MGD OQ12**: Site dependency is a false positive: the MGD Graduation status names "TXS open question 12", not MGD OQ12.
- **MGD OQ15**: Same closure as TX2 OQ12; coverage.md line 122 already records it as closed 2026-10-24.
- **MGD OQ17**: No company named Psagot appears among the 129 portfolio-management companies in the ISA register on 2026-10-22 (MGD-23); worth checking before listing Psagot as a portfolio manager.
- **MF OQ1**: Instrument records money-market-fund-daily and money-market-fund-renewable list MF OQ1.
- **MF OQ2**: MF-39 Rule text still says 'The text read (draft) requires ...'; stale. Instrument records money-market-fund-daily and money-market-fund-renewable list MF OQ2. coverage.md line 98 already says the final text is in BANK-15.
- **MF OQ3**: method.md G-26 cites MF OQ3; still open.
- **MF OQ4**: method.md G-26 cites MF OQ4. Instrument blocker on money-market-fund-daily and -renewable; site code copy.ts:2873, lib/guide-signature.server.ts:187, lib/guide.server.ts:261 name it. Mizrahi Tefahot's term could become an institution record (scope: institution: Mizrahi Tefahot) if the lead wants it; it does not settle the general question.
- **MF OQ5**: Instrument records money-market-fund-daily and -renewable list MF OQ5.
- **MF OQ11**: Instrument record money-market-fund-renewable lists MF OQ11.
- **MF OQ12**: MF-13 Conditions still say s.48 was read through a summarising fetch (open question 12), though MF-13 now cites the ISA consolidated text checked 2026-10-25. Instrument records money-market-fund-daily and -renewable list MF OQ12.
- **MF OQ13**: MF-28 Conditions still say 'The regulatory basis for the variable band was not found (open question 13)'; stale.
- **MF OQ17**: MF-08 'Likely to change' says the s.47(א)(3) change from 2.2.2027 was not verified (open question 17); the gazette shows it only adds 'ובקרן השקעות פרטיות בנאמנות - לא תעלה על 15 שנים', so renewable money-market funds are unaffected; MF-01's 'Likely to change' can say the same. Instrument record money-market-fund-renewable lists MF OQ17.
- **PEN OQ4**: PEN-07's 'Likely to change' line still says the start year of the section-3 obligation was not stated (open question 4); a rule-text update for the lead (outside Phase B). The guide's p.61 wording was re-checked on 2026-10-26.
- **PEN OQ5**: PEN-04's Figures line still reads 'Harel 2026 table, institution; NII publication not reached, open question 5' (rule text for the lead). pension-comprehensive.json and pension-general.json list PEN-OQ5 in open_questions; coverage.md line 105 names PEN OQ5 as open.
- **PEN OQ6**: pension-comprehensive.json and pension-general.json list PEN-OQ6 in open_questions.
- **PEN OQ7**: Still the cause of method gaps G-03 and G-12 and of the tax_at_exit 'blocked' labels in pension-comprehensive, pension-general, provident-for-annuity and ira-provident; site code guide-signature (pension.tsx:6, copy.ts:3040, guide-signature-g2) names it.
- **PEN OQ8**: pension-comprehensive.json has dimensions.real-vs-nominal = 'blocked:PEN-OQ8' and lists PEN-OQ8 in open_questions; the block can be lifted (5.15% a year, CPI-linked, PEN-18). coverage.md line 105 lists PEN OQ8 as open.
- **PEN OQ10**: coverage.md lines 105 and 175 name PEN OQ10 as open; pension-comprehensive.json and pension-general.json list PEN-OQ10; PEN-25's conditions still say the cross-product rule is open question 10 (rule text for the lead).
- **PEN OQ11**: Cited by method gap G-19 (with KH OQ5 and TXP OQ16).
- **PEN OQ13**: pension-comprehensive.json and pension-general.json list PEN-OQ13 in open_questions.
- **PEN OQ18**: provident-for-annuity.json lists PEN-OQ18 in open_questions; coverage.md line 106 names PEN OQ18 as open.
- **PEN OQ19**: Still the tax_at_exit 'blocked' label in provident-for-annuity.json (with PEN OQ7, G-03).
- **PEN OQ20**: PEN-26's conditions still call 65 an inference (open question 20); a rule-text update for the lead.
- **PEN OQ21**: pension-comprehensive.json lists PEN-OQ21 in open_questions.
- **PF OQ2**: coverage.md line 207 still lists the conflict.
- **PF OQ3**: method.md G-14 cites PF OQ3; unchanged.
- **PF OQ5**: site/app/copy.ts:1670 comment already records the closure; coverage.md lines 69 and 110 already strike it.
- **PF OQ6**: site/app/copy.ts:1678 keeps PF OQ6 as the open line on the clearing-house report; unchanged.
- **PF OQ7**: coverage.md line 264 cites PF OQ7.
- **PF OQ16**: site/app/copy.ts:1671-1672 openLine says the gov.il copy of the statement circular was not yet found; that is stale (PF-33 cites https://www.gov.il/BlobFolder/dynamiccollectorresultitem/r_2020-9-22/he/2020-9-22.pdf). The remaining open part is the draft's adoption. data/rules PF-33 record names PF OQ16.
- **REG OQ1**: coverage.md line 253 already records BRK-32 as closing REG OQ1.
- **REG OQ9**: Guide prose brokerage-account.tsx:96 says what happens if the bank or the member fails "לא נמצא בשום חוק"; for a non-bank member the Trust Law now gives a derived partial answer (the member's creditors cannot reach trust assets), so the lead may want to soften that sentence or add the Trust Law to REG-16/BRK-07; the instrument record brokerage-account keeps blocked:REG-OQ9 correctly since the item stays open.
- **REG OQ12**: The rule record data/rules/reg-04.json names REG OQ12; it stays open, so the record needs no change.
- **REG OQ18**: Contradiction: REG-21 says the law text gives 1 July 2022 (postponement unverified), while PEN-18 in pension-and-gemel-lekitzba.md states "From the determining date (1 October 2022)" citing the same 2021 law; one of them needs the amending source.
- **REG OQ21**: The instrument record data/instruments/exposures/shekel-cash.json lists REG-OQ21; it stays open.
- **RG OQ1**: RG Graduation status names OQ 1 as a REIT blocker (narrowed, still open). Amendment 285 also widens "הכנסות חריגות" (70%) to income from selling property bought while under construction if sold within four years of starting to be rented; TX2-09 and the TX2 Terms row do not reflect it yet.
- **RG OQ3**: Class before was narrowed because RG-07 and RG-08 already held the two halves (mirror); the official text closes it. RG Graduation status lists "the consequence of a distribution shortfall (OQ 3)" as a REIT blocker: the lead should mark it closed there.
- **RG OQ4**: RG Graduation status names OQ 4 as a REIT blocker.
- **RG OQ5**: The RG Graduation status calls "OQ 5" "the per-distribution source split", but open question 5 in the list is the management agreements; the label or the numbering needs fixing.
- **INS OQ1**: Named in the file's Graduation status (lead's).
- **INS OQ2**: The Graduation status already strikes it (lead's section).
- **INS OQ3**: Named in the file's Graduation status (lead's).
- **INS OQ7**: The Graduation status, Savings policy block, 'Still blocking' item 5 ('The inter-insurer transfer route (open question 7)') can be struck (lead's section).
- **INS OQ10**: Named in the file's Graduation status (lead's).
- **INS OQ11**: Named in the file's Graduation status (lead's).
- **INS OQ16**: The INS-25 rule record names it; also the file's Graduation status (lead's).
- **SW OQ2**: Named on the playbook (copy.ts:2424, lib/playbook.ts:117-118).
- **SW OQ3**: Named on the playbook (copy.ts:2425, lib/playbook.ts:84).
- **SW OQ4**: Named on the playbook (offer-card.tsx:54-55, copy.ts:2075, 2182, 2426).
- **SW OQ5**: Named on the playbook (copy.ts:2427, lib/playbook.ts:86) and in rule record SW-50.
- **SW OQ6**: The playbook names SW OQ6 on the employer step (copy.ts:2428, lib/playbook.ts:88); the step can now cite SW-10's new sentence and drop the open question. Numbering: the gov.il file and its header say 2016-9-19 (29.9.2016); later circulars cite the amended text as 2016-9-29.
- **SW OQ8**: Still the switching-tax-event 'blocked:SW-OQ8' dimension in pension-comprehensive, pension-general and provident-for-annuity.
- **SW OQ9**: copy.ts:2429 describes SW OQ9 as 'אילו סוגי חשבונות ופעילות המעבר בין בנקים כולל': that part is now answered (SW-26, rules 2-3); the playbook line could name the remaining part (exempt banks, the sixth-day count). Rule records SW-26 and SW-27 name it.
- **SW OQ10**: Named on the playbook (copy.ts:2430, lib/playbook.ts:145) and in rule records SW-33 and SW-52.
- **SW OQ11**: Still the brokerage-account instrument blocker (open_questions SW-OQ11, 'institution source' label) and on the playbook (cost.tsx:129, copy.ts:2431).
- **SW OQ12**: Named on the playbook (copy.ts:2432, lib/playbook.ts:147).
- **SW OQ16**: Named on the playbook (copy.ts:2433, lib/playbook.ts:87).
- **TXK OQ1**: Instrument blockers in child-savings-bank.json and child-savings-provident.json unchanged.
- **TXK OQ2**: method.md G-02 already says TXK OQ2 answered; instrument record kupat-gemel-lehashkaa.json lists TXK-OQ2 in open_questions; coverage.md line 103 still lists the lump-sum base as open.
- **TXK OQ3**: method.md G-02 cites TXK OQ3; unchanged (does not change the final tax).
- **TXK OQ4**: method.md G-03 and site/app/lib/guide-signature-g2.server.ts:297 cite TXK OQ4; unchanged.
- **TXK OQ7**: Guide page site/app/content/exposure/index-sp500.tsx:48 (<OQ id="TXK OQ7" />) stays correct; instrument blocker in ira-hishtalmut.json unchanged; data/rules TXK-18 names it. Found while checking: TXK-16 describes only the 2005 IRA definition (benefits and study funds); the current text also names "קופת גמל לקצבה" (see IRA OQ4).
- **TXK OQ9**: New rule TXK-27 added (Scope: general); the lead decides on a data/rules record. method.md G-11 (F-28 charges nothing) is now sourced for the lump sum; site/app/copy.ts flag G-11 ("דמי ביטוח לאומי על הרווח במשיכה: עוד לא ברור") is stale for the lump sum.
- **TXK OQ10**: Instrument blockers loss-offset blocked:TXK-OQ10 in kupat-gemel-lehashkaa.json, ira-provident.json and child-savings-provident.json unchanged.
- **TXK OQ11**: TXK-02 Figures and Source still give Harel and a Wikisource editor's note as the source of 83,641; they should point to KGL-03 and KGL-24.
- **TXK OQ12**: Instrument record kupat-gemel-lehashkaa.json: "age-or-use-exemption": "blocked:TXK-OQ12" and open_questions list it; site/app/copy.ts:584 flag "TXK-OQ12" says it is unclear; method.md F-44 says the 60+ reduction (F-42) is open for this deemed interest. All now stale. TXK-06 Conditions and Source edited.
- **TXG OQ2**: Method G-27 cites TXG OQ2(b); TXG-35 now gives employee NI rates, so G-27's "employee NI rates are not in the rule base" part may be stale.
- **TXG OQ4**: Method G-22 and copy.ts:891 (noReturnBefore) stay blocked. Contradiction: TXG-17's conditions, following the guide, say the securities ceiling covers income where "an advance was paid", but the regulation's definition of "הכנסה מנייר ערך" (2004 gazette and current mirror) covers only exempt or fully withheld income.
- **TXG OQ5**: The rule record data/rules/txg-17.json names "TXG open question 5", which the input's deps did not catch; it is site-dependent through that record.
- **TXG OQ6**: Method G-23 ("credit points against special-rate capital income: not applied") rests on TXG OQ6, now closed; the lead should revisit G-23. The answer rests on the guide's computation order (no sentence names special-rate tax in step ג itself); if the lead wants a statutory sentence, treat it as narrowed.
- **TXG OQ7**: Method G-21 names TXG OQ7 and TXG OQ12, both now closed; consistent with A-14 (settlement through a return), plus the reg. 11 option. coverage.md line 134 (60+ at source) cites TXG OQ7.
- **TXG OQ12**: Method G-21 names TXG OQ12 (see TXG OQ7). The closure reads the prescribed rates as excluding surtax; no sentence says "surtax is not withheld" in words.
- **TXG OQ13**: Method G-07 cites TXG OQ13; the derived reading matches F-40's max(0, real) with no loss carried. TXS OQ15 (another helper's file) is the deflation twin.
- **TXH OQ1**: Guide page site/app/content/exposure/index-sp500.tsx:48 says one question remains, whether the base is the real gain (<OQ id="TXH OQ1" />): stale. Instrument records keren-hishtalmut.json and ira-hishtalmut.json list TXH-OQ1. coverage.md line 104. TXH-11 Conditions and Source edited.
- **TXH OQ5**: Instrument record keren-hishtalmut.json lists TXH-OQ5. TXH-10 Conditions and Source edited.
- **TXH OQ11**: Instrument record keren-hishtalmut.json lists TXH-OQ11.
- **TXA OQ1**: G-24 and compare.server.ts tier2Table still name TXA OQ1 for savings policies; nothing changes there.
- **TXA OQ3**: G-24's text already records the closure.
- **TXA OQ6**: G-24 and compare.server.ts tier2Table still name TXA OQ6 for executive insurance; the file's Graduation status names it.
- **TXA OQ9**: docs/method.md G-24 and compare.server.ts tier2Table use TXA OQ9 as the Amendment 190 blocker (its build check requires G-24 to name the question): the lead decides whether Amendment 190 deposits graduate or the blocker moves to the still-open TXA OQ11, OQ14 or OQ15. The file's Graduation status (Amendment 190 paragraph), its Summary ('The legal source of those ceilings was not found') and coverage.md line 119 still call OQ9 and OQ10 open. New rule TXA-30 with '- Scope: general': the ruling was made with one unnamed managing company, but the Tax Authority's summary search presents published summaries as its official position for similar circumstances; scope call for the lead and the scope agent, and a data/rules record may be needed. TXA-22, TXA-23 and TXA-24 now cite the ruling (primary) beside the fund documents; their Scope lines were not touched. The ruling link needs the session the search page sets (a person opens the search page first).
- **TXA OQ10**: The file's Graduation status and coverage.md line 119 name OQ10 as narrowed/open.
- **TXA OQ11**: Removed from G-24 and tier2Table; the Amendment 190 blockers are now TXA OQ14 and TXA OQ15.
- **TXA OQ14**: Method gap G-11 cites it (with TXK OQ9): the reading may let F-28 leave an exempt recognized annuity from retirement age outside the NII base; the lead decides whether a reading is enough.
- **TXI OQ1**: TXI-05 Conditions and the Terms row 'הפרשי הצמדה חלקיים' still say the Minister's definition was not found (open question 1); tax-tier2-other.md TX2-18 (2026-10-25) has it. Closed in Phase A, so TXI-05 was not edited; the lead may point TXI-05 to TX2-18.
- **TXI OQ3**: Method gap G-09, the makam instrument blocker and the OQ tags (exposure/makam.tsx:53, guide/makam.tsx:57) stay valid.
- **TXI OQ4**: Narrowed in Phase A by tax-tier2-other.md TX2-02 (another file); TX2 OQ2 is the open twin.
- **TXI OQ5**: Method gap G-10, the government-bond instrument blocker and OQ tags (exposure/government-bond-cpi.tsx:46, exposure/government-bond-unlinked.tsx:45, guide/government-bond.tsx:49) stay valid.
- **TXI OQ7**: Instrument blockers 'loss-offset: blocked:TXI-OQ7' in wrappers/bank-deposit.json, current-account.json and savings-plan.json can be unblocked (a securities loss cannot absorb deposit interest). data/rules/txi-17.json notes cite TXI open question 7. The closure rests on the statute's closed list plus the guide; no sentence names deposit interest as excluded in words.
- **TXI OQ8**: The worked-statement table row 'Gilon-type coupon ... blocked until series linkage is confirmed (open question 8)' is outside my sections: the lead should update it. Instrument records wrappers/government-bond.json and exposures/government-bond-unlinked.json list TXI-OQ8; data/rules/gov-14.json notes cite TXI open question 8.
- **TXI OQ9**: OQ tag guide/makam.tsx:60 and the makam instrument blocker stay valid.
- **TXI OQ11**: The current-account instrument blocker 'age-or-use-exemption: blocked:TXI-OQ11' stays (narrowed only).
- **TXI OQ14**: Method gap G-16 and the instrument records stay valid.
- **TXI OQ15**: TXI Summary (last bullet) and the worked-statement preamble still say NI and health on interest are open (outside my sections): the lead should update them. Answer rests on tax-general.md TXG-27 (btl copy of the NII Law) and TXG-34 (Health Insurance Law via the Wikisource mirror).
- **TXI OQ16**: In passing: the gov.il guide page listed only the 2024 and 2025 editions on 2026-10-26 (note added).
- **TXI OQ18**: data/rules/txi-08.json notes cite TXI OQ18. Closed on the Wikisource mirror (bot-consolidated), not an official consolidation; the lead may prefer to keep it narrowed.
- **TXP OQ1**: TXP-16's conditions and 'Likely to change' still say the form was not found (open question 1); coverage.md line 105 lists TXP OQ1 as open.
- **TXP OQ2**: TXP-19's conditions still say the employee notice and choice forms were not read (open question 2); a rule-text update for the lead.
- **TXP OQ3**: Method gap G-06 (F-48 blocked) and the tax_at_exit labels 'early withdrawal's taxable base open (TXP OQ3; G-06)' in pension-comprehensive, pension-general, provident-for-annuity and ira-provident (also their open_questions lists) can be lifted: the base is the whole amount withdrawn, taxed at the higher of 35% and the marginal rate. coverage.md line 105 lists TXP OQ3. The regulations rest on a Wikisource mirror; the original gazette scan is linked there (olaw.org.il takanot-1317.pdf).
- **TXP OQ5**: Closed outside the brief's Phase B scope because the source turned up; the gov.il copy of circular 4/2019 was not found (two BlobFolder guesses returned 404), so the source is a third-party copy: the lead may prefer to keep it narrowed until the official copy is found.
- **TXP OQ6**: pension-comprehensive.json lists TXP-OQ6 in open_questions.
- **TXP OQ7**: Method gap G-13 cites it: the 47(ב) caps for 2026 can be computed (7% × 164,400 = 11,508; 11% × 164,400 = 18,084; 5% × 116,400 = 5,820); the beneficiary-member 16.5% route still lacks a current text.
- **TXP OQ9**: Still a tax_at_exit item in provident-for-annuity.json ('how gains on the lump sums the law allows are taxed is open (TXP OQ9)').
- **TXP OQ16**: Cited by method gap G-19 (with PEN OQ11 and KH OQ5).
- **TXF OQ1**: OQ-tags site/app/content/exposure/index-sp500.tsx:60 and site/app/content/guide/brokerage-account.tsx:84; method.md G-18; instrument blocker brokerage-account; still open.
- **TXF OQ3**: Rule record TXF-10 and instrument record brokerage-account name it.
- **TXF OQ5**: method.md G-24 lists TXF OQ5 (FX weakening, with TX2 OQ1) as a tier-2 blocker; the s.88 reading is recorded but not a closure. Same question as TXS OQ15.
- **TXF OQ6**: New rule TXF-28 (the lead decides on a data/rules record). method.md G-05 ('Irish-side withholding on an Irish fund's distributions', F-20 uses 0 and flags) can be closed: the 0 is now sourced. coverage.md line 100 lists TXF OQ6 as open. data/rules/txf-16.json text_he says whether Ireland withholds on the fund's distributions was not found. Instrument record index-sp500 lists TXF OQ6. The Israel-Ireland treaty text was not read; the closure does not rest on it.
- **TXF OQ7**: Instrument record index-sp500 lists TXF OQ7.
- **TXF OQ10**: Rule record TXF-05 names it.
- **TXF OQ16**: data/rules/txf-21.json still notes the guide p.3 item 3 was read from a low-resolution page image (TXF OQ16); stale since 2026-10-25.
- **TXS OQ1**: The item's 2026-10-22 note says 'Closed by TXS-24', but TXS-24 covers open-end funds only, so the ETF half is open. Stale text: TXS-12 Conditions (b) and the file Summary still say no taxable money-market fund was found (open question 1); coverage.md line 98 says it is unknown.
- **TXS OQ6**: Phase A: already narrowed (TXS-23 guide sentence; TXG-25 refund route). tax-general.md open question 7 (60+ at source: can a reduced-withholding certificate be given?) is answered by the same reg. 11, and for interest by reg. 11 of the 2005 regulations (already in TXI's terms table); its owner should close or narrow it. coverage.md line 134 lists TXS OQ6 and TXG OQ7 as open. data/rules/txs-23.json text_he says the recovery route and exempt-fund reach were not verified. method.md F-42 names a return or form 0135; reg. 11 coordination is a third route. Instrument records money-market-fund-daily and -renewable list TXS OQ6.
- **TXS OQ11**: The circular's own example uses the 2003 rates (15% linked, 10% unlinked, under the repealed s.105יב); the current 15% comes from the Ordinance. The lead may prefer narrowed if a sentence with today's rate is required. data/rules/txs-11.json text_he says no Tax Authority sentence was found. Instrument blocker on money-market-fund-daily and -renewable (the taxable money-market funds of TXS-24) can be reviewed.
- **TXS OQ12**: method.md G-20 cites TXS OQ12; reg. 8 supports deducting fees at withholding where the Director approved. TX2 open question 11 and tax-tier2-other.md cite it. Instrument record brokerage-account lists TXS OQ12.
- **TXS OQ15**: OQ-tag site/app/content/exposure/government-bond-cpi.tsx:46 and method.md G-07 cite it; if the lead accepts the s.88 reading, F-40 would take the inflationary amount as max(0, ...), so the real gain never exceeds the nominal gain. Same question as TXG OQ13 (real loss) and TXF OQ5 (currency fall).
- **TX2 OQ1**: G-24 and compare.server.ts tier2Table (foreign-currency-deposits: "TX2 OQ1, TX2 OQ2"), the TX2 Graduation status ("1 (currency falls)"), fx-and-structured-deposits.md line 319 and coverage.md line 120 still list it as open; TX2-01's conditions still say "(open question 1)" (rule text not edited in Phase A). Caveat: per secondary summaries the Barel facts were a shekel deposit linked to a foreign currency; the extension to an FX-denominated deposit rests on s.1 ("הפרשי שער" count as linkage) and s.125C(a), as TX2-01 already treats both alike; the lead may prefer to keep it narrowed. The court site reset my plain curl, so the judgment was not re-read here (TXI-25 read it in Chrome). TXF OQ5 is the same question in another helper's file.
- **TX2 OQ2**: G-24 blocker; unchanged.
- **TX2 OQ4**: The TX2 Graduation status names it as the blocker for FX held as cash. A district-court ruling on FX-denominated securities losses (Judge Altuvia, per secondary pages) may be worth reading for TXF.
- **TX2 OQ5**: G-24 blocker; unchanged.
- **TX2 OQ6**: G-24 still names TX2 OQ6; it stays open for the no-sale-event case. TX2-08 now cites the circular (no data/rules record for TX2-08).
- **TX2 OQ7**: graduation.server.ts:51 comment says TX2 OQ7 is answered by Reit 1's statement and is not a G-24 blocker; unchanged.
- **TX2 OQ8**: G-24 blocker; unchanged.
- **TX2 OQ10**: G-24 blocker; unchanged.
- **TX2 OQ12**: Checked as asked: TX2-17 (2026-10-24, sources re-read 2026-10-25 on the VAT Law, the rate order and the 1977 financial-institution order) answers it at the law level, and coverage.md line 122 records it closed 2026-10-24, but the item was never struck, so method G-24 and compare.server.ts tier2Table (managed-portfolios: "TX2 OQ12, MF-28") still show it as a blocker. The lead should remove TX2 OQ12 from G-24 and the tier2Table (managed portfolios would then be blocked by MF-28 only). The MGD Graduation status already strikes the tax item as closed 2026-10-24.
- **CAT OQ2**: site/app/lib/workbench.ts:198 names CAT OQ2; unchanged.
- **CAT OQ9**: OQ-tag on general-track.tsx:45 and index-ta125.tsx:47; instrument records general-track, index-sp500, index-ta125; unchanged. \| lead: general-track.tsx names CAT OQ9 as not obtained; cat-23.json title_he, text_he and strength still describe Meitav's notices.
- **CAT OQ11**: The instrument record shekel-cash lists CAT-OQ11; unchanged.
- **CAT OQ12**: This closure is a withdrawal under the founder's D17 decision (dated note 2026-10-23), not an answer to the question; the lead may prefer another marking.
- **CAT OQ18**: The instrument record general-track lists CAT-OQ18; unchanged.
- **CAT OQ19**: A withdrawal under the founder's D17 decision (dated note 2026-10-23), as CAT OQ12.
