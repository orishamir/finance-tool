# Brief: find the general source for every company-backed rule (2026-10-25)

You are one of three researchers (Opus, extra-high effort). Read this brief, then `CLAUDE.md`, then the sweep report `research/discovery/2026-10-25-institution-rules-sweep.md` (sections 2, 5 and 6), then the il-finance rule base (`.claude/skills/il-finance/SKILL.md`, its `references/README.md` and the reference files of your area). Rule records are in `data/rules/*.json`; their `sources` show what each rests on today.

## The founder's rules (2026-10-25, "a problem we need to take seriously")
1. Never cite a company's document when a general source exists: a law, a regulation, a regulator's circular, guide or published data (gov.il, the Tax Authority, the Capital Market Authority, the Securities Authority, the Bank of Israel, TASE rules, Nevo for the text of a law).
2. Never present a company's term as a general rule. A company's document proves only what that company does.

## Your job, per record in your batch
Decide one verdict and back it:
- **general**: you found the general source. Give the exact citation: title, URL, section or page, the sentence it says, the date you checked, and its strength (primary, or primary-mirror for a faithful copy). Say which company sources become unnecessary.
- **institution**: it is that company's own term (or terms that differ by company). Name the company or companies, and say whether a general counterpart exists that a product page could cite instead (for example a legal maximum while each company sets its own figure).
- **mixed**: the record joins a general part and a company part. Give both parts as they should be split, each with its verdict and sources.
- **unsettled**: you searched and found no general source. List what you searched (sites, terms, documents) so the next person doesn't repeat it, and what would settle it.

Also check each class-B record of your area for a general counterpart (rule 1), and the class-2.3 records of your area (primary records with a sentence about one company: say whether the sentence is an example of a general rule, the company's own practice, or open).

## Ways in
- gov.il PDFs: plain `curl` (or WebFetch). gov.il HTML pages are behind Cloudflare: use `research/audit/tools/govil-page.sh URL` (FlareSolverr, about 15 s, gov.il only, the founder allowed it). Never work around a bot check anywhere else, and never use a disguised headless browser.
- The founder's Chrome is not to be driven by you; never click a download there.
- Never fill a rule from memory. A rule you can't source is "unsettled", whatever you believe.
- Downloads go in a new empty folder under the scratchpad `/tmp/claude-1000/-home-ori-dev-finance-tool/4406a577-26bb-4182-ba1d-f5c7fd25975b/scratchpad/scope-<batch>/`; read Python over them with `-I`.

## Output
Write only your findings file `research/knowledge/2026-10-25-scope/<batch>.md`. Don't edit the rule base, `data/` or the site: one editor applies all three batches afterwards. Structure: a summary (counts by verdict), then one section per record with its id as the heading, the verdict, the evidence, and the exact text a rule-base editor needs (the source line in the rule base's format, see `references/README.md`). Your final message is a short report: counts by verdict, the records that changed class, and anything that needs the founder.
