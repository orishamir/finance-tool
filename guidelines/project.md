# The project and where things are

A personal, non-commercial website that helps the founder and a few friends
and family make saving and investing decisions in Israel.

## Fixed constraints

- Hebrew interface, right-to-left layout.
- Works on phone and PC.
- The audience is the founder plus a small known group of friends and family,
  each on their own device. No accounts, no personal data on a server.
- Non-commercial: no accessibility, legal or commercial work. No referral,
  affiliate or agent links. Ordinary engineering that helps everyone is not
  accessibility work and is done: real buttons and links, use by keyboard on
  a computer, focus that returns where it was. Markup that serves only
  screen readers is left out.
- The repository and the site are public: nothing private (the founder's
  mail, his own finances, anything about the people who use the site).
- No religious-law products: no Halacha tracks (מסלולי הלכה, "כשר"), no
  Sharia tracks (שריעה), and nothing else defined by religious law. They are
  not shown, not kept in `data/` (a pipeline that reads a source drops them),
  not in the rule base or the glossary, and not researched. Being kosher is
  fine when it isn't the product's whole purpose: an ordinary fund that also
  carries a kosher certificate (Maya's "קרן כשרה" flag on an index fund, for
  example) stays.

## What exists

- **The site.** Switching between providers, the goal comparison, idle cash
  and holdings are not on the site; they are to be designed again. Nothing
  is held for review: a page is on the site, with links to it, or not built.
- **The product.** `docs/product.md` says who the site is for, what it will
  not do, and its numbered decisions, each with its reason, as they stand.
  It doesn't describe pages: the site does. Don't assume a feature, page,
  data source or scope that neither the site nor a decision has. If a task
  needs a product choice nobody has made, say so instead of inventing one.
  When a decision changes, its row is rewritten as it now stands.
  `docs/discovery.md` holds the founder interview and the research behind it.
- **The data.** What is collected, from where and on what terms:
  `docs/data-inventory.md`. There is no fund list.
- **Saved state.** Version 3, under `mekor.v2.state`. Entered offers, variant
  assumptions, playbook ticks and entered rates are four separate stores on
  the device. The export file carries them; they aren't yet merged into the
  state document.

## Comments and docs

- **A doc holds only what the code can't say:** why something is so, a
  source, a decision (what the site will not do among them), an assumption
  with its default, a formula the engine is checked against, or a proof.
  What the code already says stays in the code and its tests and is not
  written again in words: what a page, card, link, prop or saved store does,
  its layout, its states, its wording. When a paragraph mixes the two, keep
  the reason and drop the description.
- A doc changes only when one of those changes. A change to how a page
  behaves needs no doc edit unless it rests on a new decision, formula,
  assumption or source.
- A code comment or a doc says what something is and why, as it stands
  now. No history: not who asked for it or said it, not when, not which
  review or reader found it, not what it was before. Git history holds
  that.
- Code no page reaches is removed. Its formula stays in `docs/method.md`,
  marked not built, so it can come back from a written formula.

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
  (`npm run check` and GitHub): the layout check, the chart check, the
  Hebrew quote check and the other checks the build runs, and the server
  that opens a built site.
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
  reads it; [research.md](research.md) says who edits it.
- `research/library/`: every document already read, searchable by page
  (`node tools/library.mjs find <words>`); [research.md](research.md) says
  when to use it. The index is in git; the files and their text are not,
  because the repository is public.
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

- `npm run check`: the typecheck, the fast and deep tests, data validation
  and the site build, then the chart and layout checks on the built site
  (what CI runs).
- `npm test`, `npm run validate`, `npm run dev`.
