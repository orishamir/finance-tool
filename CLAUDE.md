# finance-tool

Personal, non-commercial website that helps me and a few friends and family
make saving and investing decisions in Israel.

## Status: defined, not built

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
- **Never fill in a financial or tax rule from memory.** Use the
  `il-finance` skill once it exists. If a rule is missing from it, say the
  rule is missing and stop; do not guess or approximate. Site judgements
  (thresholds, bounds) live in `data/parameters/` and are not rules.
- **Lists are starting points, not limits.** When I give a list of items,
  options, or sources, add to it where sensible unless I say otherwise.

## Repo layout

- `docs/` — product docs (`product.md`, `discovery.md`, later `method.md`)
- `research/` — research notes and findings
- `data/` — source data, each entry with its source and date
- `packages/schema/` — data schemas (Zod) for `docs/data-schema.md`; `json/` holds the exported JSON Schema
- `packages/engine/` — calculation engine, one function per `docs/method.md` formula; no I/O
- `packages/pipeline/` — validator (and, later, refresh adapters)
- `site/` — React Router app, pre-rendered, Hebrew right to left
- `docs/architecture.md` — stack and design (React chosen 2026-10-22)

## Commands

- `npm run check` — typecheck, tests, data validation and site build (what CI runs)
- `npm test`, `npm run validate`, `npm run dev`
