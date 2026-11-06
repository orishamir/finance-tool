# Versions of the reviewer's instructions

The reviewer is a persona card plus a short set of instructions about how people behave, appended to every card
(`behaviour` in a panel run file). Each version is kept here with its scores (`learning-loop.md` step 6).

- **v0** (2026-11-06): no instructions; the persona cards alone. Every result up to 2026-11-06 is v0.
- **v1** (2026-11-06): v0, plus `candidates/moving.md` for sessions that use the page in a browser (`behaviourBrowser`
  in a panel run file; still screens never get it). Caught the planted layout jump 6 of 8 against 0 of 8, silent on
  clean pages where nothing moved, held-out catch rate held (14 against 13 of 72). **The default since 2026-11-06:** in
  the founder's noise sample (`runs/noise-1/answers.json`) none of its three findings was one that would bother no one
  (one real problem, two he could not tell). Run it with
  `"behaviourBrowser": "research/user-lab/versions/candidates/moving.md"`.
- **Noise of v0**, the first sample (2026-11-06, 12 random findings of the held-out baseline): 3 would bother no one
  (25%; 9 to 53%), 4 real problems, 5 he could not tell; of the 7 he could decide, 3 (43%). The bar is under 30%.
- Dropped: `candidates/noted.md` ("what you were unsure of bothered you"): readers reported more of what they did not
  understand, but caught no more planted problems (2 of 22 either way); `noted.json` has the numbers.
- `candidates/`: an instruction under test. It enters a version only after it catches cases it was not built from,
  stays silent where its reason does not apply, and adds no noise on the held-out benchmark.
