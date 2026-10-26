# Requests and notes (id-ref builder, 2026-10-26)

Files outside the ownership list that I touched, because the brief's "replace every hand-built id" reached them:
- `site/app/components/{guide/sections,compare/idle,compare/goal-form,fees/parts,chart/TimelineChart,holdings/shared,playbook/step}.tsx`: one bare id each became an `IdRef` (open-question codes, and `P-03` on the idle-cash card).
- `site/app/content/guide/*.tsx` (13 more files than the ten with a local `OQ`): they printed `<bdi dir="ltr" className="whitespace-nowrap">XXX OQn</bdi>` by hand; now `IdRef`.
- `site/app/app.css`: removed the unused `.rule-chip-static` rule.
- `site/app/routes/{fees,goal-compare}.tsx`: loaders return `formulas` so the formula sheet lists parameters on those two pages.

Review fixes (2026-10-26, second round): all eight done. Notes:
- Item 8 uses `IdText` (provenance.tsx), which finds the codes in a copy string, instead of a `{code}` slot in each string: the strings are rendered from eight places (gap notes, a callout, a reason, a line) and one parser keeps new strings from regressing.
- Item 6: a root loader (`root.tsx`) gives every page the formula-to-parameters map and the parameter cards; `PageShell` merges it into the provenance data. No per-route loader passes `formulas` any more.
- `entered.binding` in `r4workbench.providers` was dead copy; removed.

Still open:
- `data/open-questions.json` does not exist yet: the question sheet shows the generic sentence. `ProvenanceData.openQuestions` (`title_he`, `status_he`, `blocks_he`) is read when a page passes it; no loader fills it yet.
- `revisit.tsx` links rule ids to `/rules#id` with a hand-built `rule-chip`; left alone (it is a rule link, not one of the three kinds).
