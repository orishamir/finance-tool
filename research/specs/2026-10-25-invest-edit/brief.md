# Brief: one pill list, one plan-chip row, and an editable index page (2026-10-25)

## Why
The founder, on the index page (`/invest`), 2026-10-25:
- "The 'הבחירה שלכם' line maybe should be placed next to 'המדד' but smaller in a nice way."
- "I like that אחר is in a different style. One thing is that we already have a pretty similar pill addition, deletion, renaming, and moving system under the השוואה למטרה page. Let's align our site to one of those designs, you choose which one makes more sense."
- "I can't edit anything in this index page. Someone may only need this site for this reason, comparing where to buy a specific index. So he should be able to input such values."
- "This circles back to the shared component thing."

Today there are three pill looks and two near-identical plan-chip rows:
- the goals board (`components/compare/goals-board.tsx`): `sec-chip`, chosen = `sec-chip-on`, the chosen chip carries rename and delete (with a confirm popover), drag to reorder, "+ מטרה נוספת" as a quiet button;
- the index chips (`components/invest/chips.tsx`): their own `chip` class, chosen = teal fill, a fused X button on each custom index, a dashed "אחר";
- `ChoiceChips` in the kit (`sec-chip`, used in nine places);
- plan chips: `AssumptionChips` (`compare/assumptions.tsx`, used by the comparison and exposure mode) and `FeeChips` (`fees/chips.tsx`): both `a-chip`, label and value, blue when typed, a tap opens the fields sheet. The index page instead shows five read-only boxes and a link "שינוי במטרה" that leaves the page.

## Decisions (the lead's, the founder delegated the choice)
1. **One pill list: the goals board's design**, because `sec-chip` is already the site's chip look (nine places), the chosen state is light-on-dark (teal stays for actions and links, per the design system), and putting the actions on the chosen pill keeps a long row free of X buttons. From the index page it keeps the dashed add pill the founder liked: the add pill is dashed with a plus icon on both pages.
2. **One plan-chip row: the `a-chip` row** the comparison and fees pages already share. The index page uses it, and a tap opens the same fields sheet (`AssumptionsPanel`) the fees page opens, so a value typed on any of the three pages is the same value on the others (they all edit the current goal on the device, as the fees page does today).

## What to build
1. **`ChipList`** in `site/app/components/kit/chip-list.tsx`, exported from `kit/index.ts`, built by moving the goals board's code (no new look):
   - items `{ id, label, href?, editable?, movable? }`; a pill with `href` is a link (the index page), otherwise a button calling `onSelect`;
   - the chosen pill carries a pencil (rename in place, the existing `RenameInput`) and a bin (delete, the existing confirm popover) when the item is `editable` and the handlers are given; a `canRemove(id)` guard (the goals board hides the bin on the single fresh goal);
   - drag to reorder only when `onMove` is given and more than one item is `movable` (the grip icon shows only then); `dropOrder` moves with it (keep `goals-board.test.ts` passing, or move it beside the kit and keep its cases);
   - `add`: `{ label, onClick, expanded? }` rendered as the last pill: `sec-chip`, dashed border, transparent background, plus icon;
   - `heading` and an optional `note`: the note sits on the heading's line, smaller and muted (`text-xs text-muted-foreground`), and wraps under it at 390 px if there's no room;
   - the strings it needs (confirm question and answers, rename and delete labels, the rename field's label) come in as props, so each page keeps its own words.
2. **The goals board** becomes a thin wrapper over `ChipList`. Behaviour unchanged; the one visible change is the add control, now the dashed pill ("+ מטרה נוספת").
3. **The index pills** use `ChipList`:
   - site indices are links, not editable;
   - custom indices are editable: rename (name only; the id stays, it is in the address) and delete;
   - "אחר" is the add pill and opens the existing `CustomPanel` as now;
   - the chosen index is `sec-chip-on`, no longer teal;
   - the note "הבחירה שלכם; האתר לא ממליץ על מדד" moves onto the heading's line ("המדד");
   - add `renameCustomIndex(id, name)` beside `saveCustomIndex` in `site/app/lib/state.ts` and return it from `useInvestState`.
4. **`PlanChips`** (name it so in the kit, `kit/plan-chips.tsx`) replaces both `AssumptionChips` and `FeeChips`:
   - items `{ field, label, text, entered, parameter?, fixed? }` plus the "all" chip;
   - a `fixed` item is a plain span, not a button (the fees page's holding case);
   - the comparison, exposure mode and fees pages use it, with no change in look.
5. **The index page's plan** (`PlanChips` in `invest/chips.tsx`, rename that local function to avoid the clash):
   - the five read-only boxes become the kit's `PlanChips`: today, monthly, years, return ("תשואה לדוגמה" while it is the site's value, "התשואה שהזנתם" once typed), inflation, then "כל ההנחות" (reuse the fees page's `all` string or add one under `invest.plan`);
   - a tap opens a `Sheet` with `AssumptionsPanel`, exactly as `routes/fees.tsx` does (`openField`, `panelOpen`, `Suggestion`), including the site start values (`ScenarioDefaults`: move it out of `routes/fees.tsx` into a shared place both pages import);
   - the loader already returns `goalFormData()`;
   - the line under the chips keeps "מהמטרה השמורה / לדוגמה של האתר · בכסף של היום", and the "שינוי במטרה" link goes (the chips are the way to change);
   - the dollar line and the account select stay.
6. **The gallery** (`/kit`) shows `ChipList` (site items only; with an editable chosen item; with drag; with the add pill) and `PlanChips` (plain, entered, parameter, fixed).
7. **Docs:** in `docs/design-system.md`'s Kit section, one entry each for `ChipList` and `PlanChips`, and the rule: a list of things the person can choose among, add to, rename or delete is a `ChipList`; a row of the numbers a page runs on is `PlanChips`.

## Check on screen (required)
Build your worktree (`npm run build -w site`), serve it on your own port, and photograph at 1280 and 390 px before and after:
- `/invest`, with no index chosen;
- `/invest/<an index id>`, after adding a custom index (choose it: the pencil and bin show; rename it; delete it);
- `/goal`, with one blank goal and with three goals (drag one);
- `/goal/compare`, `/fees`, `/kit`.

Model your script on `research/specs/2026-10-25-guide-signatures/tools/sig-shots.mjs`. Then confirm in the browser:
- typing an amount on `/invest` changes the page's result;
- the same amount then shows on `/fees` and on the comparison's chips;
- typing only one value on a blank device leaves the other chips at sensible values, not empty or zero (watch the switch from the site's example to the goal);
- the custom-index flow still works from "אחר".

Put the shots in `research/specs/2026-10-25-invest-edit/shots/` and write `report.md` beside this brief: what changed, what you saw, anything you could not do.

## Files you own
- `site/app/components/kit/{chip-list,plan-chips}.tsx`
- `kit/index.ts`, `kit/gallery.tsx`
- `compare/goals-board.tsx` (and its test), `compare/assumptions.tsx`
- `fees/chips.tsx`, `routes/fees.tsx`, `routes/goal-compare.tsx`
- `exposure-mode/result.tsx`
- `invest/chips.tsx`, `routes/invest.tsx`
- `lib/state.ts` (only `renameCustomIndex`)
- `site/app/copy.ts` (only under `invest` and any new kit strings)
- `site/app/app.css` (only if the dashed add pill needs a class)
- `docs/design-system.md` (the Kit entries)

Anything else goes in `research/specs/2026-10-25-invest-edit/requests.md` for the lead.

## Rules
- Don't touch `data/`, `site/app/components/provenance.tsx` or the rule pages.
- Run `npx vitest run site packages/engine` and `npm run typecheck`. Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them.
- Commit on your branch when done (end the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`); the lead merges.
