# Requests for the lead (invest-edit)
- `lib/fees.ts` `feeInputs` drops a goal with no years, so a typed amount vanishes for any page using it. I added `lib/plan-inputs.ts` (fees page, index page). Consider moving that rule into `feeInputs` itself.
- `bg-input` as a field background is wrong site-wide (it is the edge token); I fixed only `invest/chips.tsx`. Worth a sweep for other `bg-input` uses (FeeRow.tsx textarea at line 169 is one).
- `compare/why.tsx` line 427: a native select with `bg-card border-input` is fine; no change.
