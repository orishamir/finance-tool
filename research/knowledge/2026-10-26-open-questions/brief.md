# Open-questions audit, 2026-10-26: helper brief

You are one of five helpers auditing the "## Open questions" sections of the il-finance rule base for finance-tool
(`/home/ori/dev/finance-tool`), a personal Israeli saving and investing site. The lead merges your results. Read
`CLAUDE.md` first, especially "Never fill in a financial or tax rule from memory" and "General sources first; a
company's term is never general". Read `.claude/skills/il-finance/references/README.md` (file template, the Scope line,
source format).

## Why

The founder asked: "look at all the so called 'open questions' and check if any are answered already and which ones
remain." Several questions are already answered in a dated note inside the item (or by a later pass, or by a rule
record) but were never struck through, so the site still treats them as open. Example of the gap: PEN OQ5 and PEN OQ6
say "Answered" in a 2026-10-25 note and are not struck. Example of a correct closure (TXA OQ3):

```
3. ~~**Moving a savings policy to another insurer**: tax event or not?~~ Closed 2026-10-25: a move to another insurer is a withdrawal and a tax event, per the Ministry of Finance team's February 2025 report (TXA-08, TXA-28). <the item's earlier history text stays after this>
```

The site's reader (`site/app/lib/graduation.server.ts`) finds a closure only as `~~struck text~~` followed by
`Closed YYYY-MM-DD`. The struck text must contain no `~` character. Keep the item's number and keep its history text
after the closure line (shorten nothing else).

## Your files and inputs

Your input file (named in your prompt) lists every item in your files: code ("TXA OQ1" = prefix + number), file,
number, whether it is already struck, and `deps`: what on the site depends on it, computed by the lead:
- `OQ-tag`: guide prose on the site names it (`<OQ id="…">` in `site/app/content/`, file:line);
- `G-24 blocker`: a tier-2 blocker the "not covered" page shows (docs/method.md G-24 and `compare.server.ts` tier2Table);
- `method gap`: cited by a method gap G-xx in docs/method.md;
- `instrument record` / `instrument blocker`: listed in `data/instruments/**` `open_questions`, or a `blocked:` dimension
  or exit-tax blocker there (shown on guide and exposure pages);
- `site code`: named in site code or `site/app/copy.ts`;
- `rule record` / `parameter`: a `data/rules` or `data/parameters` record's text names it;
- `graduation-status mention (same file)`: the file's "## Graduation status" section names this question.
`site_dependent` is true when any of these exist.

You own the "## Open questions" sections of your files and, for Phase B only, the rule entries (`### PFX-NN`) of your
files. Do not edit: any "## Graduation status" section (the lead does those, because tests read them), coverage.md,
README.md, any file outside `.claude/skills/il-finance/references/`, any `- Scope:` line (another agent is reviewing
scope right now; report scope implications instead), `docs/glossary.md`. Do not commit. Another agent is editing these
markdown files concurrently (Scope lines): always use the Edit tool with an exact, small replacement, re-read the
region just before editing, and never rewrite a whole file (no Write over an existing file, no script that rewrites it).

## Phase A: classify every item in your files, from the rule base only (no web)

Read each item in full, then check whether the rule base already answers it: dated notes inside the item ("Answered",
"closed", "settled"), the file's rules, notes in other files (grep the code and the topic across
`.claude/skills/il-finance/references/*.md`), the rule records in `data/rules/*.json`, and `coverage.md`.
Class (before your edits):
1. `closed-marked`: already struck through with a closed date.
2. `answered-not-marked`: the answer is really there, in a source the rule base already cites, and it is not struck.
   For a question about a general rule (law, tax, regulation, what every institution must do), the answer must rest
   on a general source: law, regulation, a regulator's circular, guide, Q&A or data, an exchange's rules, a standard
   bylaw the regulator issued, or a count over every collected institution. A company's document cannot close a
   question about a general rule: that is `narrowed`. A question that is itself about one company's own term (its
   tariff, its form, its product) can be closed by that company's document.
   Mark it closed in its item: `~~<the question>~~ Closed <YYYY-MM-DD>: <one line> (<rule ids>)`, using the date of the
   note (or rule) that answered it. Then it counts as `closed-marked` after.
3. `narrowed`: partly answered. Leave it open. Record what remains.
4. `open`: not answered. Standing re-check items ("re-check the 2027 budget") and items waiting on a founder decision
   are `open`; say so in `settle`.
Be strict: when in doubt between answered and narrowed, it is narrowed. Never answer from memory.

## Phase B: try to settle the items that are still open or narrowed AND site_dependent (web)

For each such item, make one focused attempt to find the general source: law, regulation, a regulator's circular or
Q&A, or a standard bylaw. Every answer needs the exact quote (copied from the document itself, never from a search
snippet), the URL, the page or section, and checked 2026-10-26. Spend effort in proportion to what the site does with
it: `OQ-tag`, `G-24 blocker`, `method gap`, `instrument blocker` first; a bare `rule record` mention last. Skip
(say "not attempted: <reason>") items that are product decisions, data collection from a company that does not
publish, or standing re-checks with nothing new to find.

How to fetch (these rules are strict):
- gov.il HTML pages: `research/audit/tools/govil-page.sh URL > file.html` (FlareSolverr, about 15 s, gov.il only).
- gov.il PDFs (`/BlobFolder/`): plain `curl -sSL -o file URL` (use GET; HEAD falsely answers 404).
- Other sites (Knesset `fs.knesset.gov.il`, `boi.org.il`, `isa.gov.il`, `new.isa.gov.il`, `btl.gov.il`, `tase.co.il`,
  Wikisource, Nevo): plain curl, or WebSearch and WebFetch. No disguised headless browser, no bot-check workaround, no
  Chrome. A page that blocks you goes in `blocked_pages` for a person to open.
- Put every download in its own new empty directory under your scratch folder (named in your prompt); keep scripts in a
  different directory; run Python with `-I`. Keep shell commands simple: write scripts to files, then run them.
- Hebrew PDFs: `pdftotext -f N -l N file.pdf -` per page; `research/audit/tools/pdfpages.py PDF` writes normalized page
  texts; check a quote against the page text before you use it (Hebrew extraction can reverse words; compare
  carefully).
- Prefer the official consolidated text: the Tax Authority's Ordinance PDF already cited in the rule base, Knesset
  `fs.knesset.gov.il` gazette PDFs, Wikisource `?action=raw` as a mirror of the law, `btl.gov.il` regulation copies.

If you find the answer:
- Close the item: `~~<the question>~~ Closed 2026-10-26: <one line> (<rule ids>)`, history kept after it, plus a short
  `**[2026-10-26 open-questions audit]**` sentence naming the source.
- Add the source to the rule it settles, on that rule's `- Source:` line, in the file's format:
  `[<title>](<url>), <locator> "<exact quote>" · checked 2026-10-26 · primary`. Adjust that rule's Rule or Conditions
  text only as far as the answer needs (for example remove "open question N is open"). If no rule fits, write the new
  rule in your file with the next free id of the prefix, in the README template (Rule, Conditions / exceptions,
  Figures, Source, `- Scope: general`, Dimensions, Likely to change), and say so in `notes` (the lead decides whether a
  `data/rules` record is needed; you never edit `data/`).
- Only a general source closes a general question. A company's document narrows it.
If you do not find it: leave the item open and add one short note at its end:
`**[2026-10-26 open-questions audit]** Still open. Searched: <what>. Would settle it: <what>.` Do not repeat searches
already listed in the item unless you have a new route.

## Output

Write one JSON object per line (JSONL) to your output file (named in your prompt), one line for every item in your
input, in input order, with these keys:
- `code`, `file`, `n`
- `title`: a short plain-English title, at most ten words
- `class_before`: `closed-marked` | `answered-not-marked` | `narrowed` | `open`
- `class_after`: `closed-marked` | `narrowed` | `open` (after your Phase A and Phase B edits)
- `closed_by`: `""` | `"already"` | `"phase-a"` | `"phase-b"`
- `closed_date`: the closed date or `""`
- `answer`: for a closure, the one line you wrote, with rule ids; else `""`
- `source`: for a Phase B closure, `{"url":…, "title":…, "locator":…, "quote":…, "checked":"2026-10-26"}`; else `null`
- `remains`: for narrowed or open, what is still open, one sentence; else `""`
- `settle`: what would settle it, one sentence (for closed items `""`)
- `phase_b`: `""` if not site-dependent or already closed; else what you searched and the result, one or two sentences
- `blocked_pages`: list of URLs that blocked you (may be empty)
- `notes`: anything the lead must act on: a Graduation status line, coverage.md line or method gap that names a
  question you closed; an instrument record listing it; a scope implication; a new rule you added; a contradiction
  you found. `""` if none.

When done, give your final report (through SubagentHandback if you have that tool, else as your final message): counts by class before and after, the closures you made (code, date,
rule ids, source in a few words), new rules added, and every `notes` item the lead must act on. Do not paste the
whole table; the lead reads your JSONL.
