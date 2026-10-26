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

## 2. Done, waiting to be applied
- **Open-question round 2** (`knowledge/2026-10-26-oq-hunt/switching.jsonl`, `held-products.jsonl`, `tier2.jsonl`, and the lead's browser reads in `lead-reads.md`): 4 closed, 17 narrowed. An editor applies them to `.claude/skills/il-finance/references/*.md`, then runs `npm run extract:sources -w @finance-tool/pipeline`, `npm run gen:open-questions -w @finance-tool/pipeline` and `npm run validate`.
  - The open-questions file and the not-covered page will change, so this is a site change and needs the founder's go.
  - Notable items:
    - TXP-18's 35% withholding is reg. 4(1), not reg. 3;
    - SW OQ10 closes at NIS 5 plus third-party cost;
    - gov.il copies of the power-of-attorney circulars;
    - directive 448 is now version 4 (11/25);
    - TXA OQ15 closed (the 15% Amendment 190 commutation counts toward the 3% surtax);
    - MGD-08's qualified-client sentence is wrong.
- **Cash-products data**, branch `data-cash` (pushed, not merged; report `specs/2026-10-26-cash-data/report.md` on that branch). Before merging:
  - settle Meitav Trade's custody (the tariff says 0.15%, minimum 270 ₪ a quarter; its own pages say custody is free);
  - add First International's deposits from its public page;
  - decide a field for the renewing funds' expected net yield (2.81%, 2.75%);
  - check fund 5139258's fee (prospectus 0.12% against the banks' 0.19%).
- **Cash rates** (`knowledge/2026-10-26-cash-rates/report.md`, staged files in `staged/`). The founder decides:
  - replace the guides' round 3.5% with each product's own figure;
  - whether to quote the single Bank of Israel rate (D20);
  - add the prime explanation and glossary entries.

## 3. Pages for the lead to read in the founder's Chrome
- **First International:** one-year fixed and prime deposit rows, fibi.co.il/private/depositsandsavings/interest/. The collector's scripted request was refused by the permission system; read only the public page.
- **Harel:** the fund page for 5127790's fee.
- **yl-invest.co.il:** the fees of 5139258 and 5141452.
- **Meitav Trade:** /trade/independent_trading/ against its tariff 04/2026.
- **new.isa.gov.il:** does the 2025 fund report rank single funds? And the directive "בירור צרכיו והנחיותיו של הלקוח".
- **By the founder's hand:** Maya refuses automated browsing ("security violation"), including the 27 fund pages of the link check.

## 4. Still open from the roadmap ("What continues, in order")
- F-48, early pension withdrawal: the official text is now confirmed, so it can be built.
- The founder's calls: credit points (G-23), GOV OQ7, the tax at 60 when no refund is claimed, kit round 2, the TXF OQ1 caution, the playbook as a product context.
