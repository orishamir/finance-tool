# Brief: open-question hunt, round 3: savings policies and executive insurance (2026-10-26)

## Why
Savings policies (פוליסת חיסכון) are among the most sold savings products in Israel, and the site doesn't cover them yet. They wait on their tax questions (D2: a tier-2 instrument moves to tier 1 when it has a sourced record and its tax questions are closed). Executive insurance (ביטוח מנהלים) waits on TXA OQ6.

## Your items: `insurance.jsonl` in this folder
- **TXA OQ1:** whether the rate on unlinked interest can apply to the gain in a savings policy.
- **TXA OQ6:** how the investment income inside executive insurance is taxed.
- **Every other open or narrowed question in `tax-insurance-and-amendment-190.md` (TXA) and `savings-policies-and-executive-insurance.md` (INS)**, ranked by what keeps savings policies off the site. Read each file's "Graduation status" section first; it lists the blockers.
- **Not yours:**
  - TXA OQ14 and OQ15 (round 2, `tier2.jsonl`, already done);
  - pension conversion factors (another researcher, `research/knowledge/2026-10-26-pension-factors/`).

## How
The same as round 2. Read `brief-2.md` in this folder, sections "Each line" and "Rules", and follow them, with two changes:
- **FlareSolverr and `tools/govil.sh` are not used.** curl for PDFs and pages that load plainly. A page that blocks scripts goes under `blocked` with its URL and what you want, and into your final reply under "Pages for the lead to read". The lead reads them in a browser.
- **Official texts come before an insurer's documents:** the Income Tax Ordinance, Tax Authority circulars and instructions, CMA circulars and the Comptroller's reports. An insurer's policy terms answer only that insurer's own term.

When done, reply with a short summary in plain words (at most 200 words): what closed, what narrowed, which tier-2 blockers remain, and the pages for the lead.
