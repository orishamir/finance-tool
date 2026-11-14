# The project and where things are

Status: reference (facts, not instructions).

A personal, non-commercial website that helps the founder and a few friends
and family make saving and investing decisions in Israel.

## Fixed constraints

- Hebrew interface, right-to-left layout.
- Works on phone and PC.
- The audience is the founder plus a small known group of friends and family,
  each on their own device. No accounts, no personal data on a server.
- Non-commercial: no accessibility, legal or commercial work. No referral,
  affiliate or agent links.
- The repository and the site are public: nothing private (the founder's
  mail, his own finances, anything about the people who use the site).
- No religious-law products: no Halacha tracks (מסלולי הלכה, "כשר"), no
  Sharia tracks (שריעה), and nothing else defined by religious law. They are
  not shown, not kept in `data/` (a pipeline that reads a source drops them),
  not in the rule base or the glossary, and not researched.

## What exists

- **The site.** Switching between providers, the goal comparison, idle cash
  and holdings are not on the site; they are to be designed again. Nothing
  is held for review: a page is on the site, with links to it, or not built.
- **The product.** `docs/product.md` describes the site: who it is for, what
  it does, and its numbered choices as they stand. Don't assume a feature, page, data source or scope that isn't
  there. If a task needs a product choice nobody has made, say so instead of
  inventing one. When something changes, update the text that describes it.
  `docs/discovery.md` holds the founder interview and the research behind it.
- **The data.** What is collected, from where and on what terms:
  `docs/data-inventory.md`. There is no fund list.
- **Saved state.** Version 3, under `mekor.v2.state`. Entered offers, variant
  assumptions, playbook ticks and entered rates are four separate stores on
  the device. The export file carries them; they aren't yet merged into the
  state document.

## Comments and docs

- A code comment or a doc says what something is and why, as it stands
  now. No history: not who asked for it or said it, not when, not which
  review or reader found it, not what it was before. Git history holds
  that.

## Repository layout

- `guidelines/`: how to work here (this folder).
- `docs/`: product docs (`product.md`, `discovery.md`, `method.md`,
  `data-schema.md`, `data-inventory.md`, `parameters-rationale.md`),
  `architecture.md` (the stack: React Router, pre-rendered, GitHub Pages),
  `design-system.md` (tokens, conventions and components), and `copy.md` and
  `glossary.md` (the Hebrew voice, the word choices with their reasons, the
  style guide in section 10, and a sourced one-line explanation of every
  financial term).
- `site/scripts/`: checks that run by themselves before anything goes live
  (`npm run check` and GitHub): the chart check and the Hebrew quote check,
  and the server that opens a built site.
- `tools/`: scripts run by hand while working: worktrees, the busy count,
  screenshots, the merge review, the page checks (movement, touch targets,
  jumps, marks alone on a line), fresh readers, the document library
  (`library.mjs`, below), and the quote fragments (`quote-fragments.mjs`, the
  only writer of `data/sources/fragments.json`).
- `research/`: the research still cited or still in use. Its reports are
  records of their day, not rules, except the user lab's `learning-loop.md`
  and `metric.md`. It holds the discovery research behind the product
  (`discovery/`: the four landscapes, which the data-update skill starts
  from, and the market and tax findings since), the notes the rule base and
  the price records cite as evidence (the dated files and folders at its
  top), the glossary's source rows (`glossary/terms/`, which `npm run
  gen:terms` turns into `docs/glossary.md` and `data/terms/`), the user lab
  (`user-lab/`) and the library (below). Process records (specs,
  audits, plans and logs) are not kept: what they settled is in the docs,
  the rule base and the code. A pointer written `8dd1f013:research/...`, or
  any path into `research/` that is no longer there, opens with
  `git show 8dd1f013:<path>`.
- `.claude/skills/il-finance/references/`: the rule base, the latest research
  on every rule, sourced and kept current. It is the only copy. Everyone
  reads it; only each file's owner (the tax-specialist for the tax files, the
  domain-specialist for the rest) or the lead edits it, and other agents put
  rule findings in their reports.
- `research/library/`: every document already read, searchable by page
  (`node tools/library.mjs find <words>`). Look there before downloading,
  and file each new document with `tools/library.mjs add`. The index is in
  git; the files and their text are not, because the repository is public.
  `tools/library.mjs recheck` says which linked documents changed since they
  were read.
- `data/`: source data, each entry with its source and date.
- `packages/schema/`: data schemas (Zod) for `docs/data-schema.md`; `json/`
  holds the exported JSON Schema.
- `packages/engine/`: the calculation engine, one function per
  `docs/method.md` formula, no I/O.
- `packages/pipeline/`: the validator and the refresh adapters.
- `site/`: the React Router app, pre-rendered, Hebrew right to left.
  `site/app/copy.ts` holds the interface strings, `site/app/content/guide/`
  the prose of each guide page.
- `site/app/components/kit/`: the shared component kit every page builds
  from. The gallery at `/kit` shows each piece in its states;
  `docs/design-system.md` section 11 says when to use which.

## Commands

- `npm run check`: typecheck, tests, data validation and the site build (what
  CI runs).
- `npm test`, `npm run validate`, `npm run dev`.
