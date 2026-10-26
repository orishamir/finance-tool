# Brief: settle the scope review in the rule base (2026-10-26)

## Why
On 2026-10-25 an editor gave every rule record a Scope line (general / institution / unsettled, D30 in `docs/product.md`), in `applied.md`. An independent reviewer then re-read every record without seeing the editor's reasoning. Its findings are in `review.md` and `review.json`, both in this folder.

On 2026-10-26 the open-questions audit (`research/knowledge/2026-10-26-open-questions.md`) closed 101 questions and left hand-offs for the rule base.

Your job is to settle both in the rule base, so the scope layout (`research/specs/2026-10-25-rules-scope/spec.md` sections 3-4) can be built on a set that is right.

Read first:
- D30 and D31 in `docs/product.md` section 1;
- the spec's section 1, the definition;
- `review.md` in full;
- the audit report's "Hand-offs for the lead" section.

## What to settle
1. **The eight disagreements** (review.md section 3). Decide each on the sources and write the reason in one line.
   - The lead's provisional reading: CAT-23, KGL-27 and KGL-28 are general (the audit already moved CAT-23); TXK-26 is split into its general part and its unsettled withholding part; IRA-21 names Meitav only, because the broker prices inside its IRA are Meitav's terms; REG-26: the editor is right.
   - Settle PF-40 (which part keeps the id) and PEN-40 yourself.
   - Overrule any of these if the sources say otherwise, and say why.
2. **The records with no Scope line** (section 4): add one.
3. **The splits** (review.json): split records that join a general rule with a company's term. Each part gets its own id; the general part keeps the old id wherever the site already cites it (search `site/app` and `data/`). Add KH-23 (audit hand-off 4).
4. **The judgement calls** (section 5). The lead's provisional calls, which you apply:
   - **Index rules:** the S&P, MSCI and Nasdaq rulebooks are `institution` (the index provider). They show plain in the index's own context, by D31. TASE's index rules stay general.
   - **The exchange as a company:** `institution: Tel Aviv Stock Exchange`. BRK-12 and BRK-29 stay unsettled until the rule text is read. Try to read it in TASE's rulebook first.
   - **"No rule exists" records:** keep them, each with the search that was made, in the record's own text.
   - **Regulator texts that bind no one:** general, with a line in the record that the text is not binding (for example "פרסום של הרשות, לא מחייב"). TXA-30, a published tax ruling made with one company, is general on the same terms (audit hand-off 4).
   - **Company clauses copied from a regulator's standard bylaw:** general once the standard bylaw is quoted. Cite it first; the company stays only for its own terms.
   - **Not rules** (forum posts, press reports, return series, website terms, market counts): list each with where it should go (data, a note, an open question). Move only those the site doesn't cite. For those it cites, write the move as a request in `requests.md` beside this brief; the lead decides.
   - **Partial counts** (PEN-37, PEN-40): unsettled, with "seen at" listing the companies.
5. **The text and source issues** (review.md section 7, about 194 items). Fix each in the record. Skip an item only when the sources don't support the fix, and list it.
6. **The audit's hand-offs:**
   - item 2: records whose Hebrew text is behind their source, including `cat-23.json`'s title_he, text_he and strength;
   - item 3: stale rule text;
   - item 6: contradictions, with these exceptions:
     - MF-26 against the non-bank brokers' custody on money-market units is a data question. Write it in `requests.md`; don't edit the tariff data.
     - REG-21 against PEN-18 (1.7.2022 or 1.10.2022): settle it from the law's text.
     - TXG-17, and Psagot not appearing in the ISA register (MGD-23): settle them or leave them open with the reason.
   - item 7: leads across files.
7. **The child-savings fee after 21** (review.md 6.1): fix the rule records only. The legal cap (CS-18, 1.05%) is general. The companies' 0.23% is each company's own term, named. The engine and site change (cap labelled "עד", the companies' figure as a named example, an entered rate replacing it) is the lead's; note in `requests.md` what the records now say.

## Rules
- **Never fill in a financial or tax fact from memory.** Every change cites the source you read, with its locator and today's date.
  - gov.il PDFs: download with `curl -g`.
  - gov.il HTML pages: `research/audit/tools/govil-page.sh` (gov.il only).
  - Anything that blocks scripts: list it under "Blocked pages" and leave the item as it was.
- **General sources first** (CLAUDE.md, D30): never cite a company's document when a law or regulator source exists.
- **Where to edit:**
  - The rule base is the markdown in `.claude/skills/il-finance/references/*.md`.
  - Then run `npm run extract:sources -w @finance-tool/pipeline` and `npm run validate`.
  - `data/rules/*.json` holds only the rules the site uses. Where you change a record's meaning, update its `title_he` and `text_he` there too.
  - Don't touch `site/`, `packages/` or `docs/` except `docs/method.md` lines that name a rule id you split (keep them pointing at the right part).
- **Where to work:** the main checkout at /home/ori/dev/finance-tool, on main.
  - Other builders work in their own worktrees, and the lead commits.
  - Don't commit and don't push.
  - Never use `git stash`, `git checkout -- <file>` or `git reset`: the main checkout holds the lead's work too.
  - Before you start, check `git status`: the lead will have committed the audit's edits.
- **Keep shell commands simple:** scripts in files under this folder's `tools/`, then run them. Put large downloads under `research/knowledge/2026-10-25-scope/tools/work/` (gitignored), never /tmp.

## Report
Write `settled.md` in this folder:
- counts before and after (general / institution / unsettled);
- every disagreement with its decision and reason;
- the splits with their new ids;
- the not-rules list;
- the text fixes, grouped by file;
- what was skipped and why;
- blocked pages;
- `requests.md` items.

If the harness refuses a report write, put the report in a script that writes it (as the audit did), and say so. Then end with a short summary in plain words for the founder.
