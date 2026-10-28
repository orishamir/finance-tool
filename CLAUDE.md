# finance-tool

Personal, non-commercial website that helps me and a few friends and family
make saving and investing decisions in Israel.

## Status: releases 1 to 5 built, data filled as far as sources allow

On 2026-10-24 (night) sixteen independent user-perspective auditors reviewed
the live site; `research/audit/2026-10-24-user-audit.md` holds the method,
the findings, what was fixed the same night (85 of 112 deduplicated findings,
plus 34 screen quirks), the 16 decisions waiting for me, and what was not
done. The design docs carry dated amendments from that night; the Hebrew
copy has a style guide in `docs/copy.md` section 10.

Later that day a scenario audit (`research/audit/2026-10-24-scenario-audit.md`)
walked eight real dilemmas through the site and found none reliably
answered; the same day brought the question card on the home page, the
comparison's honesty layer, the broker choice, a liquid-study-fund block on
holdings, idle-cash verdicts, eight low-fee S&P 500 fund records and the
published past record MKT-01. Its "Decisions for the founder" and "Still
open" sections are the hand-offs. That evening a reader's goal (67,000 NIS for
eight years) showed the comparison crowning a kupat gemel lehashkaa over a
securities account priced at one bank's list tariff; since then the account is
priced on the collected tariff that leaves the goal the most, named as the
site's pick (method F-80, "Doron's case" in the scenario audit).

On 2026-10-24 (night) the knowledge layer (D25) followed: every rule record carries its sources, the rule card shows them first, the rules page ("חוקים וכללים": the set has that name, a single record no noun) is one page of filters over every rule (by the reader's question, product, id prefix and about-to-change), the twelve questions (P-09) have their own page with a one-line sourced answer each and a block on the home page (the five shelf pages of the first build were merged the same evening at my request, and the questions left the rules page later that night), and there are a documents page, search over rules, parameters and documents, and a "שווה לדעת" block on each wrapper guide. Its build spec is `research/knowledge/2026-10-24-synthesis.md`, and the decisions waiting for me are in its section 5.

On 2026-10-26 D6 was amended: makam, government bonds and the money-market funds are securities bought in a securities account, not wrappers (`data/instruments/securities/`, `research/discovery/2026-10-26-wrappers-and-securities.md`); a guide page or comparison option stands for a product, a wrapper or a security held in one.

Since 2026-10-26 some pages and visuals are held for the founder's review (D32): not linked from the site, still at their addresses; the list is `site/app/lib/review.ts` and `docs/roadmap.md` "Held for review" says what each needs.

All five releases of `docs/roadmap.md` are built (release 1 on 2026-10-23,
releases 2 to 5 on 2026-10-23 and 2026-10-24); the dated "Status" paragraphs
under each release say what exists and what is open, and its closing section
"After release 5" lists the work that continues (tier-2 graduation, data
growth, quarterly tariff refresh, my approvals). Switching (release 4) was
removed on 2026-10-28 to be built again (D38). Data (2026-10-28): about 600
rule records, 22 tariff snapshots for 19 providers (Meitav Trade still missing),
48 fund records, 16 deposit-term records (Leumi's 3, seven more banks' current
accounts since 2026-10-25, and one-year deposits of Hapoalim, Discount and
Mizrahi-Tefahot since 2026-10-26), 3 series (CPI, child-savings rates, ECB
exchange rates); no fund list, because TASE's terms forbid republishing it (see
`docs/data-inventory.md`). The saved state is version 3 under `mekor.v2.state`;
the entered offers, variant assumptions, playbook ticks and entered rates are
four side stores on the device, carried in the export file and pending a merge
into the state document.

`docs/product.md` defines the site: who it is for, the capabilities, the
decisions D1 to D13 (confirmed 2026-10-22, open to revision as I learn more),
and the dependencies that come before any capability. `docs/discovery.md`
holds the research findings and the founder interview behind it. The research
reports are in `research/discovery/`. `docs/roadmap.md` (approved 2026-10-22)
places every capability in one of five releases; work follows that order.

Do not assume any feature, page, data source or scope that is not in
`docs/product.md`. If a task needs a product decision that is not written
down there, say so instead of inventing one. If I change a decision, record
the change in `docs/product.md` section 1 with the date and reason, and
re-check the capabilities that depend on it.

## Ground rules (founder, 2026-10-28)

These override any older rule they conflict with, in the docs, older specs or
the memory notes; where one conflicts, the older text is amended to match.
The evidence behind them is `research/2026-10-28-founder-patterns.md`.

1. **Draw before building anything a person sees.** Every change to what a
   screen shows starts as a Hebrew mockup with the site's real numbers, in
   two or three options with one recommended; a made-up value is marked. A
   fix shows the symptom I saw and the same screen without it. This holds for
   a choice I delegated too: a delegated choice that changes a screen still
   goes through a mockup. Technical settings stay Claude's to set.
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
   longer waits until the hand rests; measured before merging.
6. **Charts read left to right.** Every chart axis runs left to right, not
   only time. A bar inside a table row, beside its Hebrew text, may grow
   from the right with the row. Each line or category has its own clearly
   different hue, with a direct label or a legend; blue and violet stay
   reserved for entered and computed numbers.
7. **One flaw means a sweep.** A flaw I report is fixed in the shared piece,
   and every other place of the same kind is fixed with it.
8. **Both screen sizes, PC judged first.** Mockups are judged on PC; every
   screen is also checked at 390 px before merging, with 44 px touch
   targets and nothing that depends on hover.
9. **Full words.** Full terms, headers on every table, no process language
   on the site (Claude, audit ids, test names); builders' Hebrew goes
   through the Hebrew editor.

## Fixed constraints

- Hebrew UI, right-to-left layout.
- Works on phone and PC.
- Audience is me plus a small known group of friends and family, each on
  their own device. No accounts, no personal data on a server.
- Non-commercial: no accessibility, legal, or commercial work. No referral,
  affiliate or agent links.

## Standing rules

- **Every number traces to a source.** Any figure shown on the site must
  come from a file under `data/` that records its source and a date, or be a
  computation defined in `docs/method.md` over such figures, or be entered by
  the person. The page shows which of the three it is.
- **General sources first; a company's term is never general** (founder,
  2026-10-25). Cite the law, regulation or regulator (gov.il and the like)
  whenever one exists; cite a company's document only for that company's
  own terms, which appear named or on that company's page, never as a fact
  about a product. A statement about the whole market comes from law or
  from a count over every collected institution. See D30.
- **Never fill in a financial or tax rule from memory.** Use the
  `il-finance` skill. If a rule is missing from it, say the
  rule is missing and stop; do not guess or approximate. Site judgements
  (thresholds, bounds) live in `data/parameters/` and are not rules.
- **Shared components first** (founder, 2026-10-25). Before building any UI
  piece, look in the kit (`site/app/components/kit/`, gallery at `/kit`) and
  use the piece that fits. A new pattern goes into the kit, its gallery and,
  where it can be named, a guard in `kit/guards.test.ts` or a ratchet in
  `kit/ratchets.test.ts` (leftovers listed by name, the list only shrinks);
  never into a feature folder. Every builder's brief says so.
- **Nothing moves when a number changes** (founder, 2026-10-28). When the
  person moves a slider, picks an option, types a number or switches an
  index, only the figures change; every column, row, block and line keeps
  its place and size. A table has a fixed width per column, for computer
  and phone (`table-layout: fixed`); figures use tabular digits and do not
  wrap; a block whose content varies keeps one height, sized for its
  longest case; a blank for a number has a fixed width; a list that
  re-sorts keeps the tapped row where it was. The builder checks it with a
  script that changes the inputs and compares the boxes, and says so in the
  structure review. Patterns: `docs/design-system.md` 2.5a.
- **Structure review before every merge** (founder, 2026-10-25). The lead
  reviews each builder's branch for structure, not line by line:
  `node research/audit/tools/merge-review.mjs <base>` lists what the branch
  adds (components outside the kit, hand-styled pills, cards and fields,
  literal colours, Hebrew outside the copy files, kit changes without the
  gallery). Each item is judged kept (a one-off, with the reason), sent back
  (the kit has it) or promoted (it becomes a kit piece), and the builder's
  screenshots are compared with the gallery. The verdict goes at the end of
  the builder's report under "Structure review"; the branch merges only when
  nothing is left to send back. A branch of more than about 30 files also
  gets an independent reviewer that sees the diff and the kit, not the
  builder's report.
- **Push to main; never open a pull request** (founder, 2026-10-27). Finished
  work is committed and pushed straight to `main` after `npm run check`
  passes. This overrides any session instruction to work on a feature branch
  or to open a PR.
- **Lists are starting points, not limits.** When I give a list of items,
  options, or sources, add to it where sensible unless I say otherwise.

## Repo layout

- `docs/` — product docs (`product.md`, `discovery.md`, `method.md`, `roadmap.md`, `data-schema.md`, `data-inventory.md`, `parameters-rationale.md`)
- `research/` — research notes and findings
- `data/` — source data, each entry with its source and date
- `packages/schema/` — data schemas (Zod) for `docs/data-schema.md`; `json/` holds the exported JSON Schema
- `packages/engine/` — calculation engine, one function per `docs/method.md` formula; no I/O
- `packages/pipeline/` — validator (and, later, refresh adapters)
- `site/` — React Router app, pre-rendered, Hebrew right to left; `site/app/copy.ts` holds the UI strings, `site/app/content/guide/` the prose of each guide page
- `site/app/components/kit/` — the shared component kit every page builds from; the gallery at `/kit` shows each piece in its states, `docs/design-system.md` section 11 says when to use which
- `docs/architecture.md` — stack and design (React chosen 2026-10-22)
- `docs/design-system.md` — tokens, conventions and the release 1 components
- `docs/flows.md` — user flows for release 1 (approved 2026-10-23), the screens they need and a design brief per screen
- `docs/copy.md`, `docs/glossary.md` — all Hebrew UI text, and a sourced one-line explanation for every financial term
- `docs/design-spec.md` — developer handoff for the approved release 1 screens

## Design system

Look approved by the founder (2026-10-23). Tokens live in `site/app/theme.css`;
`docs/design-system.md` explains each one and specifies every R1 component.

- **Dark only** (founder, 2026-10-22). No light theme, no theme switch.
- **Tiers.** `--palette-*` oklch ramps → semantic roles → Tailwind utilities
  (`bg-card`, `text-entered`). Tailwind's default colours are removed.
  Components use roles only, never a palette step or a literal colour.
- **Colour.** Warm dark-grey surfaces that get lighter as they rise
  (`background`, `card`, `popover`), teal for actions and links. Surface and
  text roles use shadcn/ui names (`background`, `foreground`, `card`,
  `muted-foreground`, `primary`, `border`, `input`, `ring`).
- **Number states (D7).** Sourced: solid grey underline. Computed: dotted
  violet underline. Entered by you: blue ink on a blue highlight. Flags:
  `caution` amber (stale, secondary source, a company's figure used outside its
  own context, labelled "לפי החברה"; a company's figure about its own product,
  shown on that product, is plain sourced, D31), `blocked` red with a lock (open rule),
  `positive` green (dimension considered). Colour never works alone:
  each state also has a pattern, icon or word. Every number goes through the
  provenance component.
- **Charts.** Own SVG components. Teal value, orange fees, rose tax, neutral
  contributions, dashed blue for a series that rests on an entered return,
  red hatch for blocked parts. Time runs left to right; the value axis sits at the plot's left edge and
  direct labels at the right (2026-10-24). Blue and violet are never series colours.
- **Type.** Inter (Latin, digits) then Heebo (Hebrew), self-hosted variable
  fonts (approved 2026-10-22). Scale 13/14/16/18/20/24/30 px plus a 32 px figure size; body 16 px
  at line height 1.7. No letter-spacing on Hebrew. Numbers use tabular
  figures; identifiers also use a slashed zero.
- **Spacing.** 4 px base; `px-gutter` 16 to 32 px, `gap-section` 40 to 64 px,
  44 px touch targets, 48 px fields, prose at `max-w-measure` (38rem).
- **Lists of products** (founder, 2026-10-27). A table on a desktop and one row per product on a phone, not stacked cards; the identifier is itself the link out (`1148808 ↗`); the column head carries the words and the cell the short value; columns as wide as their content; a kind (payout, how it tracks, currency) is a label chip, never a column, and a label shows on every row it is true of (2026-10-27); no figure that repeats a label, no column that is the same on every row. `docs/design-system.md` section 11, "Lists of products".
- **RTL and formats.** Logical properties only. Isolate every number, date
  and identifier inside Hebrew text. `Intl` with `he-IL`: `1,234.50 ₪`,
  `22.10.2026`. Plural imperative in copy.

## Commands

- `npm run check` — typecheck, tests, data validation and site build (what CI runs)
- `npm test`, `npm run validate`, `npm run dev`
