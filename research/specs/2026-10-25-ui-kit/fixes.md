# Small fixes (2026-10-25)

## 1. What a site parameter's sheet says
The founder clicked "2%" (P-05's yearly inflation, `data/parameters/illustrative-scenario.json`, input `A-02`) on `/guide/current-account` and got "this monstrous of a message, saying things about claude etc. 2% is just the average inflation rate no?". The sheet shows P-05's one `rationale_he` for the whole scenario. That text covers every input, the test scenarios, a fund swap and "נבחר על ידי Claude; המייסד עוד לא אישר", on whichever of its numbers is clicked.

What to do:
- Each input in a parameter file gets its own short Hebrew rationale for the reader (a new optional field beside the value, documented in `docs/data-schema.md` and the schema). The sheet (`site/app/components/provenance.tsx`, the parameter part) shows the clicked input's own line first, and the file's general line only if the reader opens "more".
- For A-02, the true answer: 2% is a round starting value the site chose, not a measured average and not a forecast (`docs/parameters-rationale.md`, "Illustrative scenario"). Say exactly that; don't call it an average or tie it to any target, since none is collected. Write the other inputs' lines from the same doc, plainly.
- **Every parameter file's reader-facing text** (`rationale_he` and the new per-input lines in `data/parameters/*.json`): no "Claude", no test scenarios, no audit ids, no history of earlier values, no "the founder hasn't approved". Those stay in `docs/parameters-rationale.md`. Today `illustrative-scenario.json` and `goal-presets.json` carry such text; check all.
- Tests: the sheet for A-02 shows its own line; no parameter's reader text contains "Claude" or "תרחישי הבדיקה".

## 2. Two internal links that lead nowhere (`research/audit/2026-10-25-link-check.md`)
- `/workbench/providers/child-savings-provident` has no page, but the "לפי ספק" tab on `/workbench/tracks/child-savings-provident` links to it. Show that tab only for wrappers that have a providers page (`providerWrapperIds()` in `site/app/lib/providers.server.ts`).
- The 12 switch pages link to `/rules#switching-and-transfers` (`site/app/routes/switch.tsx:215`), an anchor that no longer exists: group ids are now `<shelf>-<file>`. Make the link land on the rules about switching, using the rules page's own filters or a group anchor that exists. Add a test that the target exists.

## Rules
Don't touch `site/app/components/ui.tsx` or the guide-signature, fees, timeline, compare and chart components (another builder is moving them into a shared kit). Run `npx vitest run site packages/engine`, `npm run typecheck`, `npm run validate`; never `npm run check` or the site build, never `pkill`. Keep shell commands simple: scripts in files, then run them.
