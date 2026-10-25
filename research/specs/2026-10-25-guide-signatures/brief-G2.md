# Brief for builder G2 (Sonnet, medium), 2026-10-25

You build the second wave of the guide-page visuals ("מה מייחד את …", decision D29) for four pages: the study fund (`keren-hishtalmut`), the provident fund for investing (`kupat-gemel-lehashkaa`), and the pensions (`pension-comprehensive`, `pension-general`, `provident-for-annuity`, which share one visual). The site is a Hebrew, right-to-left React Router app in `/home/ori/dev/finance-tool` (read `CLAUDE.md` first).

## Read first

1. `research/specs/2026-10-25-guide-signatures/spec.md`: sections 1, 2 (the founder's chart rules), 3 (your three rows, marked G2) and 5. Section 6 is a withdrawn design; ignore it.
2. The frame builder G1 wrote: `site/app/components/guide-signature/index.tsx` (the registry and `SignatureFrame`), `kit.tsx` (`Marker`, a draggable marker that also takes a tap on the axis and arrow keys; `GainBars`, two bars with the difference on a bracket; `useSigInputs`, `SourceLine`, `Gap`, `FigureRow`, `figure`, `Sentence`), `site/app/lib/guide-signature.ts` (`SignatureData`, `runAtMonths`, the pure models of each visual) and `site/app/lib/guide-signature.server.ts` (the `builders` map that ships each page's data). Copy one of G1's visuals as your pattern (`savings-plan.tsx` for a draggable date, `current-account.tsx` for two runs set against each other).
3. `.claude/skills/il-finance` (`keren-hishtalmut.md`, `kupat-gemel-lehashkaa.md`, `pension-and-gemel-lekitzba.md`, `tax-hishtalmut.md`, `tax-gemel-lehashkaa-ira-child.md`, `tax-pension-gemel-lekitzba.md`) and the rule records in `data/rules/`. Never write a financial or tax rule from memory; a rule that is missing is shown as "עוד לא חושב" with the gap and named in your report.
4. The engine: `packages/engine/src/formulas/early-withdrawal.ts` (`studyFundEarlyWithdrawal`), `exit-tax.ts` (`hishtalmutExitTax`, `kglExitTax`, `capitalGainsTax`), `deposit-side.ts` (pension reliefs, `grossForYear`), and the wrapper runs that `site/app/lib/engine.ts` exposes (`runTimeline`). P-05 (`data/parameters/illustrative-scenario.json`) names the holdings: study fund track 880 (self-employed), pension track 2158, provident-for-annuity track 923.

## The founder's notes on these pages

- On the study-fund sketch: "nice visualization. the only thing which i actually got wrong at first was i thought the three rectangles are comparing different routes … maybe theres a better way there. also it could be cool to be able to drag the arrow." So: two bars and a bracket (`GainBars`), never a third box; the year is a draggable `Marker`.
- He will look at each page "mostly for understanding the thing myself, some of them i dont know or understand". Each visual must explain itself without this chat: a plain question at the top, labels on everything, no jargon without a `Term`.
- No visual is better than a forced one (he dropped the brokerage-account visual for that reason today). If a page can't be drawn truthfully from the engine and the rules, stop on that page and say why in your report rather than approximate.

## Holding naming (rule 2)

A container has no result without a named holding. The study fund and the provident fund for investing are set against a brokerage account holding the same index: find the index of the P-05 track (its record in `data/cma/` or the track's exposure), then a fund in `data/funds/` with the same `exposure_id`. If none matches, show the gap; don't substitute another index. Say on screen what is held on both sides.

## Ownership

G1 is still finishing and owns everything above (`index.tsx`, `kit.tsx`, `guide-signature.ts`, `guide-signature.server.ts`, `guide-signature-bundle.server.ts`, `routes/guide.tsx`, `components/timeline/**`, `lib/engine.ts`, the `guideSignature` block of `copy.ts`). You own:

- new files `site/app/components/guide-signature/keren-hishtalmut.tsx`, `kupat-gemel-lehashkaa.tsx`, `pension.tsx`, and `site/app/lib/guide-signature-g2.ts` with its test `guide-signature-g2.test.ts`;
- by exact-string `Edit` after a fresh `Read`, never rewriting G1's code: your entries in `signatureRegistry`, your `builders[...]` entries in `guide-signature.server.ts`, your entries in `guideSignature.pages` (and any sub-block you need) in `copy.ts`;
- one dated method note in `docs/method.md` per visual that computes something new.

Anything else you need changed in G1's files (for example `SignatureFrame` must allow a page with no alternative, for the pensions: "none (required for salaried people); say so") goes as a numbered line in `research/specs/2026-10-25-guide-signatures/requests.md` (create it if missing), and the lead applies it.

## Rules

Run `npx vitest run site packages/engine`, `npm run typecheck` and `npm run validate`. Never run `npm run check` or the site build, never `pkill`, never commit. A failure in a file you don't own: report it, don't fix it. Engine changes only when a visual needs a formula the engine lacks: write it as a formula with a method note and say so. Every number goes through `Num` with its state; design tokens only; logical properties; works at 390 px. Your final message is your report: what you built per page, every figure's source, the gaps, the requests, and the test results.
