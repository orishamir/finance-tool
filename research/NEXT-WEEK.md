# Resume here (paused 2026-10-26)

The founder paused the research jobs to save tokens. Everything below is saved:
- briefs and tools are committed;
- downloads sit in each folder's `work/`, which is gitignored but on disk in the repo.

A new researcher for any item gets its brief plus the line "resume: read what's in the folder and in work/ first, don't download again what's there".

**Rules for every researcher:**
- Opus 5.5, extra high effort.
- curl only. No FlareSolverr, no headless browser and no bot-check workaround.
- gov.il official documents before Wikisource or third-party copies.
- Pages that block scripts go to the lead, who reads them in the founder's Chrome.

## 1. Stopped mid-way (resume each from its folder)

| Job | Brief | What's on disk | Where it stopped |
|---|---|---|---|
| Official copies of the laws cited from Wikisource | `knowledge/2026-10-26-official-texts/brief.md` | `tools/laws.json`: 49 laws and regulations with their citations. `tools/official.json`: 48 with an official copy found (btl.gov.il consolidated texts, Knesset, the Ministry of Justice's free-justice, ISA, BoI). A few list only gazette booklets. Downloads: `work/` (118 MB). | Steps 1–2 done. It was rewriting `tools/compare.py` (the word-by-word comparison of the quoted sections) to use two-way coverage. Steps 3–4 (differences, proposal per rule, `report.md`, `citations.json`) are left. |
| Pension conversion and insurance factors per fund | `knowledge/2026-10-26-pension-factors/brief.md` | Downloads in `work/` (95 MB), one folder each for Altshuler Shaham, Clal, Harel, Infinity, Meitav, Menora, Migdal, Mor and Phoenix. Also the CMA standard bylaw, codex, circular 2016-3-4, notice 2024-087, the 2025 report chapter 4 and the gov.il new-pension-funds page. Tools: `tables.py`, `xlsx2tsv.py` and others. | Reading Infinity. No `report.md` or `staged/` yet. |
| Savings policies and executive insurance tax (open-question round 3) | `knowledge/2026-10-26-oq-hunt/brief-3.md` | Only `tools/check_ins_quotes.py`. It had read the TXA file and was moving to the INS file. | No `insurance.jsonl` yet. Effectively a fresh start. |

## 2. Done on 2026-10-26 (live)
- **Closed and applied:** SW OQ1, SW OQ5, SW OQ10, SW OQ16 and TXA OQ15. Rules SW-17, SW-18, SW-33, SW-41 and TXA-19 now state the answers, and the switching guide's lock lines for them are gone.
- **The guides' cash-like rate** (P-05 `cash_rate`) is the Bank of Israel's 3.25%, quoted from its 21.10.2026 press release. The founder amended D20: one published figure may be quoted. **Recheck at the next decision, 23.11.2026.**

## 3. Waiting to be applied
- **The narrowed findings of round 2** (17; `knowledge/2026-10-26-oq-hunt/*.jsonl` and `lead-reads.md`): an editor writes what each narrowed into the references, then runs `extract:sources`, `gen:open-questions` and `validate`. Also:
  - TXP-18's 35% withholding is reg. 4(1), not reg. 3, and reg. 3(2) is missing from it;
  - MGD-08's qualified-client sentence is wrong;
  - SW-43 should cite directive 448 version 4 (11/25);
  - the clearing-house regulations of 2012 (SW-18) are cited from an olaw.org.il scan of the gazette: find the gov.il copy (job 1 above can).
- **Cash-products data**, branch `data-cash` (pushed, not merged; report `specs/2026-10-26-cash-data/report.md` on that branch).
  - Its six deposit files (Hapoalim, Discount, Mizrahi-Tefahot, one-year fixed and prime) are on main since 2026-10-26: the money-market ladder shows the one-year fixed deposit as the range across the collected banks (F-86), linked to a per-bank list on the bank-deposit page (founder). The funds, bond auctions and the rest wait as below.
  - Meitav Trade's tariff was taken out of it on the founder's word; see 4.
  - Before merging:
    - decide a field for the renewing funds' expected net yield (2.81%, 2.75%);
    - check fund 5139258's fee (prospectus 0.12% against the banks' 0.19%);
    - fix two side effects the collector found: the comparison's lowest money-market fee mixes daily and renewing funds, and exposure mode falls back to a different fund file.
- **Each cash product on its own figure** (the step after the Bank of Israel rate; `knowledge/2026-10-26-cash-rates/report.md` section 6):
  - a renewing fund on its manager's expected net yield (needs the schema field above);
  - makam on a series' yield from a bank's 447A page;
  - a daily fund on the Bank of Israel rate less its fee.

  This is a method change, with golden values computed by the separate script.
- **Prime on the site:** a general rule from the Knesset Research Center's definition and the Bank of Israel's 2023 review, the "P−x" notation, and glossary entries (cash-rates report section 1). This narrows BANK OQ14.

## 4. Research needs added by the founder on 2026-10-26 (left out of the site for now)
- **Meitav Trade:** its tariff 04/2026 (meitav.co.il/media/zitlfr4f/עמלות-תעריפון-42026.pdf) charges custody 0.15% with a 270 ₪ minimum a quarter, while its own pages say "פטור מדמי משמרת" and claim no FX conversion fee. Settle which applies, and whether the 0.15% is a quarter's or a year's rate, before it becomes a priced broker. The collected record is in the data-cash branch's history (commit 5d8fae5).
- **First International (FIBI):** its one-year fixed and prime deposit rows. Read the public page fibi.co.il/private/depositsandsavings/interest/ in a browser. The collector's scripted call to its data feed was refused by the permission system and is not to be repeated.

## 5. Pages for the lead to read in the founder's Chrome
- **Harel:** the fund page for 5127790's fee.
- **yl-invest.co.il:** the fees of 5139258 and 5141452.
- **new.isa.gov.il:** does the 2025 fund report rank single funds? And the directive "בירור צרכיו והנחיותיו של הלקוח".
- **By the founder's hand:** Maya refuses automated browsing ("security violation"), including the 27 fund pages of the link check.

## 6. Still open from the roadmap ("What continues, in order")
- F-48, early pension withdrawal: the official text is now confirmed, so it can be built.
- The founder's calls: credit points (G-23), GOV OQ7, the tax at 60 when no refund is claimed, kit round 2, the TXF OQ1 caution, the playbook as a product context.
