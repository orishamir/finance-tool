# Brief: open-question hunt, round 2 (2026-10-26)

## Why
Round 1 (`cash-and-bonds.jsonl`, `securities-tax.jsonl` in this folder) closed or narrowed 20 questions. The questions below are the ones that still hold something back on the site, ranked by what the founder and friends would meet first:
- the switching guide, where eight steps say "no rule found";
- the tax on products they already hold (child savings, kupot gemel, study funds, pension);
- the tier-2 products that wait on a single question (FX deposits, Amendment 190, managed portfolios, REITs, gold, corporate bonds, structured deposits).

`data/open-questions.json` says what each question blocks (`blocks_he`). The questions themselves, and the rules around them, are in `.claude/skills/il-finance/references/*.md`. Search for the code (for example "open question 2" under the SW file's open-questions list, or "SW OQ2").

## Assignments
Each researcher writes one file in this folder, one JSON line per item.

### 1. Switching and protection: `switching.jsonl`
- SW OQ2: does the CMA transfer circular apply to the kupat gemel lehashkaa?
- SW OQ3: what governs retention calls in provident products?
- SW OQ5: how the pension clearing house checks the saver's consent to issue a report.
- SW OQ8: is a transfer between pension funds and provident funds for annuity tax-free?
- SW OQ9: which banks are exempt from the account-switching rules, and how the sixth business day is counted.
- SW OQ10: the supervised price for transferring securities out of a bank.
- SW OQ11: the tax on moving securities between two accounts of the same owner.
- SW OQ12: moving securities between an Israeli institution and a foreign broker.
- SW OQ16: removing an agent already attached to an account.
- REG OQ9: what happens to clients' assets if a non-bank TASE member fails.

Likely sources: CMA circulars and the consolidated circular (gov.il, "חוזר מאוחד"); the Provident Funds Law and its regulations; the Bank of Israel's Proper Conduct of Banking Business directives and the Banking (Customer Service) rules; the ISA's directives and TASE's rulebook for members; Tax Authority circulars.

### 2. Tax on products already held: `held-products.jsonl`
- TXK OQ1: the tax rate, base and withholding on a child-savings withdrawal. Today the site computes it from a secondary source.
- TXK OQ10: whether a withdrawal below the deposits creates a loss that can be offset.
- CS OQ10: whether a parent can see if the child-savings track was chosen or is the default.
- Code `REQ falling-CPI`: the real gain of a kupat gemel lehashkaa lump sum (TXK-07) and of a study fund's excess deposits (TXH-11) when the CPI fell over a deposit's life. The full question, the three readings and the places to look are in `research/specs/2026-10-26-followups/requests.md` section 1.
- Code `TXP-18 official`: the official publication of reg. 3 of the 1962 regulations (`תקנות מס הכנסה (כללים בדבר חיוב במס על תשלומים לקרן שלא אושרה ותשלומים שלא כדין)`, ק"ת תשכ"ב 2006). Today the rule rests on a Wikisource copy. Find the gazette text or the Tax Authority's own copy, and say whether it matches TXP-18 and method F-48 (35%, or the ordinary tax where higher, on the whole sum paid). The site builds early pension withdrawal (F-48) only after this.

Likely sources: the Income Tax Ordinance (the Tax Authority's consolidated PDF), Tax Authority circulars and guidance to managing companies, the NII's child-savings pages (btl.gov.il), the CMA's child-savings circulars, the 2005 withholding regulations, Reshumot.

### 3. Tier-2 blockers: `tier2.jsonl`
- TX2 OQ2: on what base, and under which law, a bank withholds tax on interest from a foreign-currency deposit. It alone keeps FX deposits off the site.
- TXA OQ14: NII and health tax on a recognised annuity and on its commutation (Amendment 190).
- TXA OQ15: whether the surtax (מס יסף) applies to commuting a recognised annuity (Amendment 190).
- TX2 OQ8: whether NII contributions apply to a REIT's distribution.
- TX2 OQ10: how foreign gold certificates and US gold funds are taxed.
- TX2 OQ5: how each kind of payment in a structured deposit is taxed.
- TX2 OQ6: when a loss arises on a corporate bond that stops paying, and how banks withhold in that case.
- Code `MGD blockers`: what still keeps managed portfolios off the site. Read the Graduation status in `managed-and-robo-portfolios.md` and MF-28, and settle what a source can settle.

Likely sources: the Income Tax Ordinance, the NII Law and its regulations (btl.gov.il, the Knesset), Tax Authority circulars (foreign currency, REITs, Amendment 190), the ISA's portfolio-manager rules.

## Each line
The same fields as round 1 (open `cash-and-bonds.jsonl` for the shape):
- `code`;
- `verdict`: `closed` (an official text answers it), `narrowed` (part of it), or `open`;
- `answer_en`: the answer in plain English, with what is still unknown;
- `sources`: each with url, title, locator (page, section, paragraph), the Hebrew words quoted, and the date read;
- `proposed_rule_text`: the change to the rule base, record by record;
- `site_effect`: what changes on the site if it is applied;
- `still_unknown`;
- `searched`: what you searched and where, when the verdict is not `closed`.

## Rules
- **Never answer from memory.** Every claim quotes the source's own words with a locator. If no source says it, the verdict is `open` or `narrowed`. Don't guess or approximate.
- **General sources first** (CLAUDE.md, D30). A law, regulation, regulator or court comes before any company document. A company's document answers only that company's own term, and the line names the company.
- **How to read pages:**
  - gov.il PDFs: `tools/get.sh <name> <url>` (curl).
  - gov.il HTML pages: `tools/govil.sh <name> <url>`. It uses FlareSolverr, which is allowed for gov.il only.
  - Other sites: curl or WebFetch. Anything that blocks scripts goes under `blocked` in your line, with its URL, for a person to open. Don't use a headless browser elsewhere and don't work around a bot check.
  - `tools/govsearch.sh`, `tools/rulings.py` and `tools/findpage.py` are round 1's helpers; read them before use.
- **Where to work:** the main checkout at /home/ori/dev/finance-tool. Write only your own `.jsonl` (through a script, as `tools/write_jsonl.py` does) and helpers under `tools/`. Downloads go under `work/`, which is gitignored; never /tmp.
  - Don't edit the references, `data/`, `site/`, `packages/` or `docs/`. The lead applies your findings.
  - Don't commit. Never use `git stash`, `git checkout -- <file>` or `git reset`.
- **Keep shell commands simple:** scripts in files, then run them.
- **When done:** reply with a short summary in plain words (at most 200 words): what closed, what narrowed, what's blocked for a person.
