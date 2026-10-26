# Brief: build the rules-scope layout (spec sections 3 and 4), 2026-10-26

## Why
Every rule now says who it applies to (D30 in `docs/product.md`):
- **general:** a law or regulator says it;
- **institution:** one named company's own term;
- **unsettled:** it reads like a general rule, but only company documents support it.

The scope settling pass finished on 2026-10-26. It left 475 general, 90 institution and 12 unsettled records, each with a `- Scope:` line in `.claude/skills/il-finance/references/*.md`. The founder approved the layout in `research/specs/2026-10-25-rules-scope/spec.md`, on condition that the classification is accurate. This branch builds the spec's sections 3 and 4.

Read, in order:
1. the spec, all of it;
2. D30 and D31 in `docs/product.md` section 1;
3. `research/knowledge/2026-10-25-scope/settled.md`;
4. `requests.md` beside it, sections 4, 5 and 8;
5. `CLAUDE.md`: Standing rules, Shared components first, Number states.

## Changes to the spec since it was written
- **D31 (2026-10-26) replaces the spec's row "The 'לפי החברה' number tag".** A company's figure about its own product, shown where that product or company is named, is plain sourced. The amber tag stays only on a company figure that stands for the market, and there it says "לפי מסמך של {company}". This is already built (`isWeak`, `SiteValue.own` in `site/app/lib/value.ts`); don't undo it.
- **The 28 records that are not general but are cited in product contexts** are listed in `requests.md` section 5. Resolve each one by the spec's section 4:
  - remove it from guide cards, "שווה לדעת", the questions page and the rules page's product filters;
  - where the property varies by company, say "תלוי בחברה" and link to the companies;
  - the record moves to its company page.
  List each with what you did.
- **Not rules** (`requests.md` section 4): leave them where they are for now. The validator may skip them through an explicit, named allowance.
- **The rule card's chip:** the spec says an `institution` chip shows the company's name, not a code. Keep the id visible inside the card.

## What to build
- **Section 3, data and checks:**
  - the `scope`, `scope_institutions` and `scope_settle` fields in the rule schema;
  - extraction from the `- Scope:` lines;
  - `data/sources/institutions.json`;
  - the validator checks.
  The 347 rule-base blocks without a `data/rules` record have no Scope line; they are not checked.
- **Section 4, where each kind appears:**
  - guide pages;
  - "חוקים וכללים" and its filters;
  - the questions page;
  - search, in two groups;
  - the rule card, by kind;
  - company pages, with a new section "מה כתוב במסמכים של {company}".

## Rules
- **Use the kit** (`site/app/components/kit/`, gallery at /kit) for every UI piece. A new pattern goes into the kit with a gallery entry and, where it can be named, a guard. The guards and ratchets must keep passing. The lead runs the structure review before merging.
- **Hebrew copy:** in `site/app/copy.ts`, plural imperative, in the style of `docs/copy.md` section 10.
- **Never fill in a financial fact from memory.**
- **Another branch is open** (`closed-questions`). It changes the open-question parts of `site/app/components/provenance.tsx` (`IdRef`, the question sheet), `kit/guards.test.ts`, the open-questions schema and its validator check. Stay out of those parts. Rebase onto main before your final commit; the other branch may land first.

## Check on screen (required)
Build (`npm run build -w site`), serve on port 4237, and photograph at 1280 and 390 px:
- a guide page;
- the rules page with a product filter;
- a rule card of each kind;
- search for a term that finds both groups;
- two company pages (a provident manager and a bank).

Look at every shot. Write `report.md` in `research/specs/2026-10-25-rules-scope/`, with the shots in `shots/`, the list of the 28 records, and your validator's counts.

## Commands
- Run `npx vitest run site packages/engine packages/pipeline packages/schema`, `npm run typecheck` and `npm run validate`.
- Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them. Screenshots and large files stay inside your worktree, never in /tmp.
- Commit on your branch, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The lead reviews and merges.
