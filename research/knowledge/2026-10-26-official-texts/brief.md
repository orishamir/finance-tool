# Brief: official copies for the laws the rule base cites from Wikisource (2026-10-26)

## Why
The rule base cites Wikisource about 274 times, across about 25 laws and regulations. Most citations are of the Income Tax Ordinance, the Provident Funds Law and its regulations, the Investment Advice Law, the Securities Law and the Joint Investment Trust Law.

Wikisource is a volunteer mirror. CLAUDE.md says general sources come first, and the knowledge layer's open list asks for "the official Knesset or gazette publication beside the Wikisource copy" (`research/knowledge/2026-10-24-synthesis.md` section 5).

Research only. The site and the rule base are not changed by this work.

## What to do
1. **List every Wikisource citation** in `.claude/skills/il-finance/references/*.md` by law or regulation, and by the sections each rule cites, with the rule ids. Use a script.
2. **For each law or regulation, find an official copy**, in this order:
   - a consolidated version published by the government body that administers it. Examples: the Tax Authority's consolidated Income Tax Ordinance PDF (already used by the documents page; see `data/sources/documents.json`), the CMA's or the ISA's published consolidated texts, the Ministry of Justice's legislation database;
   - the Knesset's National Legislation Database;
   - the original gazette (Reshumot: ספר החוקים, קובץ התקנות) and each amending gazette.

   Record the URL, publisher, the version's date and what it covers.
3. **Compare the cited sections word for word** with the Wikisource text the rule base quotes, for the sections the rules quote. Do the most-cited laws first. List each match, each difference (amendment not in the mirror, a typo, a missing subsection) and each section you could not compare.
4. **Propose, per rule:** keep Wikisource beside the official copy, replace it, or fix the rule's text. Don't edit anything.

## Output
- `report.md` in this folder:
  - the table of laws (citations, official copy found or not, its date);
  - the differences found, with the rule ids;
  - the proposals;
  - pages for the lead.
- `citations.json`: the machine list from step 1, with the official URL found for each law.

## Rules
- **Never fill a legal text from memory.** Quote what you read, with a locator.
- **How to read pages:** curl for PDFs and pages that load plainly. A page that blocks scripts goes in your report under "Pages for the lead to read", with its URL and what you want from it. The lead reads it in a browser. No FlareSolverr, no headless browser and no bot-check workaround. Nevo and other paid databases are out.
- **Where to work:** the main checkout at /home/ori/dev/finance-tool, only inside this folder.
  - Downloads go to `work/` (gitignored), never /tmp. Scripts go to `tools/`; keep shell commands simple.
  - Don't commit. Never use `git stash`, `git checkout -- <file>` or `git reset`.
- **When done:** reply with a short summary in plain words (at most 200 words): how many laws now have an official copy, what differed, and the pages for the lead.
