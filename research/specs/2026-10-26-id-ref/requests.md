# Requests and notes (id-ref builder, 2026-10-26)

Files outside the ownership list that I touched, because the brief's "replace every hand-built id" reached them:
- `site/app/components/{guide/sections,compare/idle,compare/goal-form,fees/parts,chart/TimelineChart,holdings/shared,playbook/step}.tsx`: one bare id each became an `IdRef` (open-question codes, and `P-03` on the idle-cash card).
- `site/app/content/guide/*.tsx` (13 more files than the ten with a local `OQ`): they printed `<bdi dir="ltr" className="whitespace-nowrap">XXX OQn</bdi>` by hand; now `IdRef`.
- `site/app/app.css`: removed the unused `.rule-chip-static` rule.
- `site/app/routes/{fees,goal-compare}.tsx`: loaders return `formulas` so the formula sheet lists parameters on those two pages.

Still open:
- Only `/parameters`, `/fees` and `/goal/compare` pass `ProvenanceData.formulas`; on every other page the formula sheet shows the name and the method link, without the parameter list (hidden, since unknown is not empty). A shared helper that every loader calls would fix it; the shell (`shell.tsx`) is not mine.
- Open-question codes still written inside copy strings (`copy.ts`: "שאלה פתוחה SW OQ4", "ETF OQ4" and similar, about 10 places) are plain text; they need a slot (`Tpl` var) to become chips.
- `data/open-questions.json` does not exist yet: the question sheet shows the generic sentence. `ProvenanceData.openQuestions` (`title_he`, `status_he`, `blocks_he`) is read when a page passes it; no loader fills it yet.
- Parameter ids `A-nn` link to `/parameters#A-nn`, but the parameters page only has `P-nn` cards, so such a link lands at the top. No page prints one today.
- `revisit.tsx` links rule ids to `/rules#id` with a hand-built `rule-chip`; left alone (it is a rule link, not one of the three kinds).
