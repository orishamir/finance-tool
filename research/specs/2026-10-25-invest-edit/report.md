# Report: pill list, plan chips and the editable index page (2026-10-25)

## What changed
- New kit components `kit/chip-list.tsx` (`ChipList`, `dropOrder`) and `kit/plan-chips.tsx` (`PlanChips`), exported from `kit/index.ts`, shown in `/kit`, documented in `docs/design-system.md` section 11 (two table rows and the "which of the two" rule).
- `.sec-chip-add` (dashed add pill) in `app.css`.
- Goals board is a thin wrapper over `ChipList`; `dropOrder` and its test moved to `kit/chip-list.ts(x)`/`chip-list.test.ts`.
- Index page: `IndexChips` uses `ChipList` (site indices are links, custom ones editable, "אחר" is the add pill, the note sits on the heading line); `renameCustomIndex` in `lib/state.ts` (empty name ignored, id kept) returned by `useInvestState` as `rename`.
- Plan: `AssumptionChips` (kept as the adapter that builds items from a goal), and the new `feePlanItems` (fees/chips.tsx) feed `PlanChips`; `FeeChips` is gone. The index page's five boxes became `PlanChips` + the fields sheet (`AssumptionsPanel`); the "שינוי במטרה" link is gone. `ScenarioDefaults` moved to `components/fees/chips.tsx`.
- New `lib/plan-inputs.ts` (`planInputs`), used by the fees page and the index page: a goal begun with only an amount keeps that amount and takes the site's example for the empty years/amount/monthly (shown as site values). Without it, `feeInputs` dropped the goal (no years) and the typed amount vanished.
- Select fix: see below.
- `invest/render.test.ts` updated for `PlanBlock` (it imported the renamed function).

## The select
Really off. `bg-input` is the *edge* token (`--input` = neutral-600), so the "החשבון שלכם" select and the three text fields of the "אחר" panel were light grey. The site's field style is the card fill with the input edge (`.field-box`: `bg-card`, `border-input`). Fixed to `bg-card border border-input` on all four. (The brief's `bg-input border-border` is the buggy pair itself.)

## On screen (shots/, `before_*`, `after_*`, `close_*`, `typed_*`; 1280 and 390)
- /invest: index pills are `sec-chip` (chosen light on dark), dashed "+ אחר", the note beside "המדד" (wraps under it at 390 only if needed); plan chips with "תשואה לדוגמה"; select now dark.
- Custom index chosen: pencil and bin on the chosen pill; rename kept the address; delete asks first, then returns to /invest. At 390 the confirm popover hangs from the pill and stays on screen.
- /goal: one blank goal (bin hidden), three goals (grips, dashed "+ מטרה נוספת"), drag works (ghost under the pointer, dimmed slot).
- /kit: ChipList and PlanChips in states. A long label first ran off the screen at 390; fixed (truncated with an ellipsis, `max-w-full`).
- No horizontal overflow on any page at either width.

## Browser checks
- Typing 50,000 as the amount on /invest: the headline went 78,943 to 128,299; chips show 50,000 / 500 / 10 years / 5% / 2% (others sensible, not empty).
- Same amount on /fees?wrapper=brokerage-account: 50,000 (after the `planInputs` fix; before it showed 10,000). /goal/compare shows no chips for a goal with only an amount (it needs years first; unchanged).
- Custom index from "אחר": add, choose, rename, delete all work.

## Not done / notes
- Full-page screenshots of long pages were clipped at 1800 px (Chromium ran out of resources on the whole page); `/goal/compare` after typing only an amount was not changed.
- Vitest (843) and typecheck pass; `npm run check` not run (per brief).

## Structure review (lead, 2026-10-26)

`node research/audit/tools/merge-review.mjs main invest-edit`: 88 files, 18 of them code or docs, so no second reviewer.

| Item | Verdict |
|---|---|
| `ChipList`, `PlanChips` (new kit pieces) | Kept as planned. Both are in the gallery, and the goals board, comparison, fees and index page use them. |
| `ScenarioDefaults` (moved to `fees/chips.tsx`, used by fees and the index page) | Kept for now. It belongs to the blocks layer in kit round 2 (`research/specs/2026-10-25-ui-kit/round-2.md`). |
| `IndexChips`, `PlanBlock` | Kept: feature pieces of the index page, built from kit parts. |
| Three raw inputs and one select in `invest/chips.tsx` | Kept. They're older fields, only restyled here; the kit has no text or select field yet. Round 2 promotes `TextField` and `SelectField`. |

Screenshots compared with `/kit` by the lead: the pills and plan chips match the gallery. Found on screen and fixed by the lead: the years chip read "שנים 10 שנים" on six chip rows (now "תקופה"), and the site-example sentence then needed "10 שנים".
