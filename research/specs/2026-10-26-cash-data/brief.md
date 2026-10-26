# Brief: data for the cash products and the bank catalogue, on a branch (2026-10-26)

## Why
The founder asked for more data for the site, without changing the live site for now. This branch collects it in the schema's shape under `data/`, validated, and is **not merged** until the founder says go.

Read first:
- `research/knowledge/2026-10-26-cash-rates/report.md`: tonight's findings, with staged files in its `staged/` folder;
- `docs/data-schema.md` sections 1, 2, 3.5 (funds), 3.6 (fees), 3.7 (deposit terms), 3.8 (series);
- `CLAUDE.md`: Standing rules;
- D20, D22, D30 and D31 in `docs/product.md` section 1.

Use the `data-update` skill for each source.

## Where
- Worktree: `/home/ori/dev/finance-tool/.claude/worktrees/wt-cashdata`, branch `data-cash`. Work only there.
- Commit on the branch, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't merge or push.

## What to collect, in this order
1. **The renewing money-market fund 1223866** (Altshuler Shaham, monthly), the site's example fund. Its record has no management fee.
   - A new dated snapshot `data/funds/1223866@2026-10-26.json` with the fee from the manager's own document if it prints one. Discount's 447A page prints 0.19% (see the staged file).
   - Where the schema has a field for the manager's expected net yield, add 2.81% dated 26.10.2026. If no field fits, don't invent one: write in your report what field would be needed.
   - The same for the Meitav renewing fund 1220227, as a new record.
2. **The most popular shekel daily money-market funds** (about 10), as new records in `data/funds/`.
   - "Popular" means largest by assets, by a source you name (a regulator's report first; if none ranks single funds, say so and use what you can source).
   - The fee comes from each manager's own page or prospectus first, and from a bank's 447A page (Leumi's, staged) only if the manager prints none.
   - Look at the existing record `data/funds/5138763@2026-10-23.json` for the shape.
3. **Deposit terms of the large banks** (`data/terms/deposits/`, §3.7), from each bank's Directive 447 publication.
   - Banks: Hapoalim, Discount, Mizrahi-Tefahot and First International first (Leumi has three records already).
   - For each bank, the standard shekel deposits a person would choose: one year fixed, and the prime-linked ones. Record the rate as the bank prints it, including the prime spread ("P-x"), with the publication date.
4. **Government bond yields** from the Ministry of Finance dataset "נתוני החוב הממשלתי המקומי" on data.gov.il (open licence, GOV-19).
   - Stage the latest auction results per bond type as a series in the schema's shape (§3.8). Set `terms_of_use.status` to what the licence page says, with its URL.
   - If the validator's terms gate or schema blocks it, keep the file under `research/specs/2026-10-26-cash-data/staged/` instead and say why.
5. **Meitav Trade's tariff** (`data/fees/`): still missing from the site. Check whether it is published now. If it is, collect a snapshot; if not, record where you looked.

## Rules
- **Never fill a figure from memory.** Every value carries source URL, title, publisher, strength, the document's date and today's date.
- **General sources first** (D30). A company's figure about its own product is its own term (D31); never present it as the market's.
- **Bank of Israel numbers stay out of `data/`** (D20): the policy rate, the BoI's makam yields and its deposit averages. The banks' own 447 and 447A publications are the banks' documents and may be used.
- **Downloads:** curl only.
  - A page that blocks scripts goes in your report under "Pages for the lead to read", with its URL and what you need. The lead reads it in a browser.
  - No FlareSolverr, no headless browser and no bot-check workaround.
- **Run** `npm run validate` in the worktree, and `npx vitest run packages/schema packages/pipeline`. Don't run `npm run check` or the site build, and never `pkill`.
- **Keep shell commands simple:** scripts in files under `research/specs/2026-10-26-cash-data/tools/` in the worktree. Downloads go to its `work/` (gitignored). Never use /tmp.
- **Report:** `research/specs/2026-10-26-cash-data/report.md` in the worktree:
  - every file added, with its source;
  - what was not found;
  - what changes on the site if merged: which pages read these records;
  - pages for the lead.
