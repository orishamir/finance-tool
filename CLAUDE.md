# finance-tool

Personal, non-commercial website that helps me and a few friends and family
make saving and investing decisions in Israel.

This file holds the rules as they stand today, each stated once. Where a doc,
spec, report or memory note disagrees with it, this file wins and the other
text is corrected. Product decisions, each with its date and reason, are in
`docs/product.md` section 1; the history of everything else is in git.

## What exists

- **The site.** All five releases of the roadmap are built (its record is
  `research/2026-10-23-release-1/roadmap.md`); switching was removed to be
  built again (D38). Pages and visuals held for my review
  are off the site's links but still at their addresses (D32): the list is
  `site/app/lib/review.ts`, and issues #45 to #48 say what each needs.
- **The product.** `docs/product.md` defines the site: who it is for, its
  capabilities and its decisions. Do not assume any feature, page, data
  source or scope that is not there; if a task needs a product decision that
  is not written down, say so instead of inventing one. When I change a
  decision, record it in section 1 with the date and reason, and re-check
  the capabilities that depend on it. `docs/discovery.md` holds the founder
  interview and research findings behind it.
- **The data.** What is collected, from where and on what terms:
  `docs/data-inventory.md`. There is no fund list, because TASE's terms
  forbid republishing it.
- **Saved state.** Version 3 under `mekor.v2.state`. Entered offers, variant
  assumptions, playbook ticks and entered rates are four side stores on the
  device, carried in the export file and not yet merged into the state
  document.

## Ground rules

The evidence behind them is `research/2026-10-28-founder-patterns.md`.

1. **Draw before building a major graphic visualization.** A major chart or
   picture starts as a Hebrew mockup with the site's real numbers, in two or
   three options with one recommended; a made-up value is marked. The
   drawing shows the whole page with the new piece in place, the page's
   height before and after, and what the piece replaces; a section that
   replaces nothing starts folded. A chart's drawing opens with the choice
   the reader makes differently after seeing it; a chart whose answer is the
   same for every option on its page does not go on that page. A fix to one
   shows the symptom I saw and the same screen without it. This holds for a
   choice I delegated too. Text, labels, the behaviour of existing charts
   and anything else short of a major graphic visualization need no
   drawing; technical settings are Claude's to set.
2. **Fair and general comparisons.** Name the holding; change one thing at
   a time; show differences rather than two absolutes; use a range or a
   count over every collected institution, never one bank and never my own
   case.
3. **Simple inputs, rich analysis.** Inputs are plain fields and sliders
   with nothing clever built in. Analysis gets a section of its own, and
   that section is genuinely informative: it compares everything at once,
   not a list and not two things at a time.
4. **Every control earns its place.** A control changes something on its
   page, visibly; a field the page never reads is left out; no figure
   changes silently.
5. **Fast.** A slider or field answers in under 100 ms; work that takes
   longer waits until the hand rests; measured before it goes live.
6. **Charts read left to right, in distinct hues.** Every chart axis runs
   left to right, not only time; a bar inside a table row, beside its Hebrew
   text, may grow from the right with the row. Inside a chart every line,
   part and category has its own clearly different hue, with a direct label
   or a legend, checked pair by pair with the palette validator and then by
   fresh readers' eyes. That is the requirement; one meaning per colour
   across the page is a bonus, never worth a round of drawings of its own.
   Within one chart or panel a colour means one thing; a distant
   section of the same page may give it another meaning, each chart with its
   own legend or labels. Blue and violet are reserved for entered and
   computed numbers; red, amber and green are status colours, never a
   series. Each page's spec carries its colour table.
7. **One flaw means a sweep and a lesson.** A flaw I report is fixed in the
   shared piece, and every other place of the same kind is fixed with it.
   Every criticism of mine is learned three ways. The reviewer: before the
   fix, the screen I saw becomes a test case, the reviewer runs on it first,
   and a miss becomes one general instruction about what bothers a person,
   kept only if it catches other cases it was not built from and adds no
   noise (`research/user-lab/learning-loop.md`). The builders: the reason
   goes, as one general rule, into the doc they build from
   (`docs/design-system.md`, `docs/copy.md`), because notes kept anywhere
   else never reach them. The checks: where the rule can be named, a guard
   or a script enforces it. A criticism that repeats a rule already written
   is told to me as a repeat and gets its check, since the writing did not
   reach the work.
8. **Both screen sizes, PC judged first.** Mockups are judged on PC; every
   screen is also checked at 390 px before it goes live, with 44 px touch
   targets and nothing that depends on hover.
9. **Full words.** Full terms, headers on every table, no process language
   on the site (Claude, audit ids, test names); builders' Hebrew goes
   through the Hebrew editor.
10. **A reversal carries its cleanup.** When a layout or a decision changes,
    the same change removes what the old one left behind (wording, tiles,
    notes, tokens, tests). A redesign is chosen from two or three whole-page
    options, and the choice settles for a few days before the next one.

## Work order

The main line is the indices page, then the guides; the workbench, holdings
and idle-cash pages wait. This overrides the Roadmap issue's ranking, which
counts what unblocks the most.

The user lab (`research/user-lab/`) is a habit beside it, at most about 5% of
a week: a reviewer that runs with no project context and flags what people
flag, measured against every problem I flagged (`metric.md`). Every problem I
flag goes through it first (`learning-loop.md`), and its held-out set is
scored again every couple of weeks. It is a check for movement and dead
controls beside the fresh readers, not a first pass on every site change: its
second score caught about one in five of my general problems in a session
(`runs/baseline-2/report.md`). It becomes a first pass if a later score
catches about half or more with noise under 30%.

## Fixed constraints

- Hebrew UI, right-to-left layout.
- Works on phone and PC.
- Audience is me plus a small known group of friends and family, each on
  their own device. No accounts, no personal data on a server.
- Non-commercial: no accessibility, legal, or commercial work. No referral,
  affiliate or agent links.
- The repository and the site are public: no data whose terms forbid or
  have not confirmed republishing, and nothing private (my mail, my own
  finances, anything about the people who use the site).

## Standing rules

### Data and rules

- **Every number traces to a source.** Any figure shown on the site must
  come from a file under `data/` that records its source and a date, or be a
  computation defined in `docs/method.md` over such figures, or be entered by
  the person. The page shows which of the three it is.
- **Never fill in a financial or tax rule from memory.** Use the
  `il-finance` skill. If a rule is missing from it, say the rule is missing
  and stop; do not guess or approximate. Site judgements (thresholds,
  bounds) live in `data/parameters/` and are not rules.
- **General sources first; a company's term is never general.** Cite the
  law, regulation or regulator (gov.il and the like) whenever one exists;
  cite a company's document only for that company's own terms, which appear
  named or on that company's page, never as a fact about a product. A
  statement about the whole market comes from law or from a count over every
  collected institution (D30).
- **No price from analogy.** A house ranks on a kind of holding only where
  its own document or fund list names it; the data check fails otherwise,
  and a doubt is a grey row, not a note (D42). A house is priced on its
  binding documents, never its advertising (D56). A new house or a new top
  pick gets a fresh reviewer first, given only the documents and asked to
  disprove it, and a short check by a real customer of that house where one
  is at hand. A ranking change is its own commit, with its evidence, and
  expected test numbers change only with that evidence. In chat, every
  figure carries its assumption, and what was read is told apart from what
  was inferred; what I report first-hand is treated as true and then
  checked.
- **Companies not to research.** Forty-three managing companies closed to
  one profession, employer or municipality are out of the data; never
  collect or research them. The list, by legal id, is `EXCLUDED_COMPANIES`
  in `packages/pipeline/src/adapters/cma.ts`, and `closedTrack` beside it
  leaves out any other track closed to joiners (D51).
- **Never get past a bot check.** A page behind Cloudflare, Radware or a
  similar check is read in my Chrome only if it opens normally there;
  otherwise its link comes to me. No FlareSolverr, no disguised headless
  browser, no completing a check, even where an older note allows it.

### Building the site

- **Shared components first.** Before building any UI piece, look in the kit
  (`site/app/components/kit/`, gallery at `/kit`) and use the piece that
  fits. A new pattern goes into the kit, its gallery and, where it can be
  named, a guard in `kit/guards.test.ts` or a ratchet in
  `kit/ratchets.test.ts` (leftovers listed by name, the list only shrinks);
  never into a feature folder. Every builder's brief says so.
- **Nothing on the screen moves when a number changes.** When the person
  moves a slider, picks an option, types a number or switches an index,
  only the figures change; every column, row, block and line on the screen
  at that moment keeps its place and size. A block out of sight may change
  its own height (D63). A table has a fixed width per column, for computer
  and phone (`table-layout: fixed`); figures use tabular digits and do not
  wrap; a block on the screen whose content varies keeps one height, sized
  for its longest case; a blank for a number has a fixed width; a list that
  re-sorts keeps the tapped row where it was. One exception (D62):
  switching index on a phone may move what lies below the switch, with a
  short, gentle transition, never a jump. A movement script checks it
  whenever the size rule below asks for it: it brings each control onto the
  screen, changes it, and compares the boxes in view
  (`research/audit/tools/box-check.mjs`). Patterns:
  `docs/design-system.md` 2.5a.

### Checking a change

- **Checks scale with the size of a change.** Before work starts a change is
  sized, and a `Size:` line in its commit message says which: *small*
  (words, a label, a colour token, a data record or one piece of one page, adding
  no block, control or chart), *medium* (a block, a control or a behaviour
  on an existing page, or a kit piece used on several pages) or *large* (a
  new page, a new or redrawn major chart, how a figure is computed, a
  ranking change, a layout change across pages); in doubt, the larger.
  - Every size: `npm run check`, my own screenshots at 1440 and 390, the
    structure review below, and the data and engine rules (finance-reviewer
    on engine and schema changes, sources, no price from analogy); the
    movement script when the page has inputs and the change is on it, its
    result stated in the structure review.
  - Medium adds the movement script and one independent checker that sees
    the diff and the built page, not my report, and tries to break it; the
    Hebrew editor on any words it adds or changes; and fresh readers when it
    adds words meant for readers.
  - Large adds fresh readers before it ships, the drawing of ground rule 1
    for a major chart or a redesign, and a several-lens review above about
    30 files. It is built on a branch and goes live in slices, the
    unfinished parts held off the links (`site/app/lib/review.ts`).
  - Small and medium changes go live one at a time as soon as their checks
    pass. A small change to words goes live after the style guide
    (`docs/copy.md` section 10); the Hebrew editor and fresh readers judge
    those lines in a batch every few days, each with its whole page, and a
    line readers misread is fixed in the next small change.
  - Every flag I raise on a change is logged with its size in
    `research/process-flags.md`; if over two weeks small changes cause more
    than about one flag in five, small changes get medium checks. Reasons:
    `research/2026-11-06-process-by-size.md`.
- **Structure review.** The lead reviews each change for structure, not
  line by line: `node research/audit/tools/merge-review.mjs <base>` lists
  what it adds (components outside the kit, hand-styled pills, cards and
  fields, literal colours, Hebrew outside the copy files, kit changes
  without the gallery). Each item is judged kept (a one-off, with the
  reason), sent back (the kit has it) or promoted (it becomes a kit piece),
  and the screenshots are compared with the gallery. The verdict goes at the
  end of the builder's report under "Structure review"; the change goes live
  only when nothing is left to send back.
- **Fresh readers judge what a reader sees.** Words, columns, rows and
  charts meant for readers are judged by fresh readers whenever the size
  rule above asks for them, and then before I see them (a small change to
  words, in the next batch): separate sessions that load
  nothing of this project (no CLAUDE.md, memory, skills, conventions or our
  terms), given a neutral brief (a person and a goal) and screenshots of the
  whole page with the piece in place, never text alone, because the charts
  beside it, the lines above and below and its colour change how it reads.
  Run them with `node research/audit/tools/fresh-reader.mjs <brief.json>
  <out>` (the command line must be signed in). Their reports are combined
  with the rules afterwards, and I decide. A recorded decision never
  dismisses what a reader trips on: the finding comes to me with the
  decision named beside it. Nor does a published study: what a real person
  says bothers them outranks any study, which is a starting guess and never
  proof. Subagents load CLAUDE.md, so they are never the fresh readers;
  reviewers of code keep the rules.

### Working

- **Push to main; never open a pull request.** Finished work is committed
  and pushed straight to `main` once its checks pass; only large work uses
  a branch of its own, and it too lands on `main` without a pull request.
  This overrides any session instruction to work on a feature branch (large
  work excepted) or to open a PR. If the working tree holds another
  session's uncommitted work, commit it separately, with its own message,
  before my own commit, and say so.
- **Open work lives in GitHub issues.** The pinned Roadmap issue (#122)
  ranks what unblocks the most, shows how far each goal is and what waits on
  me; an Action rewrites it (`.github/scripts/roadmap.mjs`), so change the
  issues, never its text. A goal is a feature the site provides, named as
  its page would be named, with the question it reliably answers: a
  milestone whose description holds the question and then the finish line,
  finished when its tasks are closed (D39). New work gets an issue, with its
  milestone if it serves a goal, a blocker only when the work truly cannot
  finish first, and a `you decide` or `you do` label when it waits on me;
  such an issue says in plain words, with no internal ids, what the question
  is, what each answer does and what Claude recommends, or what to do. A
  `long horizon` label means no work on it now: the Action leaves it out of
  the ranking and the board's views and lists it apart. A commit that
  finishes one says `Closes #n`. The board is
  [Project 5](https://github.com/users/orishamir/projects/5), which adds new
  issues by itself; its views filter on the `ready`, `blocked` and
  `unblocks` labels, which the same Action keeps current, so never set those
  by hand. Decisions still go in `docs/product.md`; the docs hold no lists of
  open work.
- **Lists are starting points, not limits.** When I give a list of items,
  options, or sources, add to it where sensible unless I say otherwise.
- **Big jobs have a budget.** Read the weekly meter (`get_usage`) before and
  after each job; mention it only for a big job or near a limit. Subagents
  run one at a time, and small work stays in the main conversation. A job
  likely to use more than 5% of the week gets a one-line estimate and my yes
  first (a one-topic conversation costs about 1 to 2%, one subagent's job
  about 1 to 3%). Above 90% of the week, do only what I directly ask for,
  except in the last hours before the weekly reset: what is left of the
  week is lost at the reset, so it goes on ready work then, several jobs at
  once, not after (founder, 2026-11-06).
  Every subagent runs on Opus 5.5 at high effort; the lab's simulated readers
  stay at medium until a measured run says otherwise
  (`research/user-lab/tools/lib/session.mjs`); extra high and Fable only when
  I ask. Start a fresh agent with a short brief rather than messaging an idle
  one.

## Repo layout

- `docs/` — product docs (`product.md`, `discovery.md`, `method.md`, `data-schema.md`, `data-inventory.md`, `parameters-rationale.md`)
- `research/` — dated research reports and findings: records of their day, not rules, except the procedures this file names (the user lab's `learning-loop.md` and `metric.md`, the flag log, the process by size)
- `.claude/skills/il-finance/references/` — the rule base: the latest research on every rule, sourced and kept current (closed questions struck); the only copy. Everyone reads it; only each file's owner (the tax-specialist for the tax files, the domain-specialist for the rest) or the lead edits it, and other agents put rule findings in their reports
- `research/library/` — every document already read, searchable by page: look there before downloading, and file each new one with `library.mjs add`. The index is in git; the files and their text are not, because the repository is public. `library.mjs recheck` says which linked documents changed since they were read
- `data/` — source data, each entry with its source and date
- `packages/schema/` — data schemas (Zod) for `docs/data-schema.md`; `json/` holds the exported JSON Schema
- `packages/engine/` — calculation engine, one function per `docs/method.md` formula; no I/O
- `packages/pipeline/` — validator and refresh adapters
- `site/` — React Router app, pre-rendered, Hebrew right to left; `site/app/copy.ts` holds the UI strings, `site/app/content/guide/` the prose of each guide page
- `site/app/components/kit/` — the shared component kit every page builds from; the gallery at `/kit` shows each piece in its states, `docs/design-system.md` section 11 says when to use which
- `docs/architecture.md` — stack and design (React Router, pre-rendered, GitHub Pages)
- `docs/design-system.md` — tokens, conventions and components
- `research/2026-10-23-release-1/` — records of release 1 kept as they were (the user flows and screen briefs, the design review of the mockups, the developer handoff of the screens, the roadmap of the five releases); the live rules are in `docs/` and this file
- `docs/copy.md`, `docs/glossary.md` — the Hebrew voice, the word choices with their reasons and the style guide (section 10; the strings themselves are in `site/app/copy.ts`), and a sourced one-line explanation for every financial term

## Design system

Tokens live in `site/app/theme.css`; `docs/design-system.md` explains each
one and specifies the components.

- **Dark only.** No light theme, no theme switch.
- **Tiers.** `--palette-*` oklch ramps → semantic roles → Tailwind utilities
  (`bg-card`, `text-entered`). Tailwind's default colours are removed.
  Components use roles only, never a palette step or a literal colour.
- **Colour.** Warm dark-grey surfaces that get lighter as they rise
  (`background`, `card`, `popover`), teal for actions and links. Surface and
  text roles use shadcn/ui names (`background`, `foreground`, `card`,
  `muted-foreground`, `primary`, `border`, `input`, `ring`).
- **Number states (D7).** Sourced: solid grey underline. Computed: dotted
  violet underline. Entered by you: blue ink on a blue highlight. Flags:
  `caution` amber (stale, secondary source, a company's figure used outside
  its own context, labelled "לפי החברה"; a company's figure about its own
  product, shown on that product, is plain sourced, D31), `blocked` red with
  a lock (open rule), `positive` green (dimension considered). Colour never
  works alone: each state also has a pattern, icon or word. Every number
  goes through the provenance component. In a list of products, a column
  whose figures share one state carries the mark in its head; the cells stay
  plain and still open their source (D60).
- **Charts.** Own SVG components. Teal value, orange fees, rose tax, neutral
  contributions, dashed blue for a series that rests on an entered return,
  red hatch for blocked parts. Time runs left to right; the value axis sits
  at the plot's left edge and direct labels at the right. Blue and violet
  are never series colours.
- **Type.** Inter (Latin, digits) then Heebo (Hebrew), self-hosted variable
  fonts. Scale 13/14/16/18/20/24/30 px plus a 32 px figure size; body 16 px
  at line height 1.7. No letter-spacing on Hebrew. Numbers use tabular
  figures; identifiers also use a slashed zero.
- **Spacing.** 4 px base; `px-gutter` 16 to 32 px, `gap-section` 40 to 64 px,
  44 px touch targets, 48 px fields, prose at `max-w-measure` (38rem).
- **Lists of products.** A table on a desktop and one row per product on a
  phone, not stacked cards; the identifier is itself the link out
  (`1148808 ↗`); the column head carries the words and the cell the short
  value; columns as wide as their content; a kind (payout, how it tracks,
  currency) is a label chip, never a column; a label true of every row of a
  group shows once, in the group's head, and a label that is exactly one
  group leaves the filter too (D60); no figure that repeats a label, no
  column that is the same on every row. `docs/design-system.md` section 11,
  "Lists of products".
- **RTL and formats.** Logical properties only. Isolate every number, date
  and identifier inside Hebrew text. `Intl` with `he-IL`: `1,234.50 ₪`,
  `22.10.2026`. Hebrew is plural or impersonal, never addressed to one
  gender, in mockups too.

## Commands

- `npm run check` — typecheck, tests, data validation and site build (what CI runs)
- `npm test`, `npm run validate`, `npm run dev`
