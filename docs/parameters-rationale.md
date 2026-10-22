# Site parameters: the founder's rationale

Each site parameter (`docs/method.md` §2.3, stored in `data/parameters/`) is a judgement, not a rule. This file records why each value was chosen, so the page can show it under "site parameter".

## Tie threshold

P-01, `data/parameters/tie-threshold.json`. Set by the founder on 2026-10-22.

**Value:** 0.5%. Two options are a tie when `|V_i − V_j| / max(V_i, V_j) < 0.5%`, where V is the real value at the horizon (method F-80).

**Why:** a difference under 0.5% of the final amount is not worth acting on. This is the same line the founder set the same day for what is worth modelling at all. Example from the golden scenarios: in the broker comparison (S44, regulator-average fees), broker C ends about 0.8% ahead of bank B, which is a clear win at 0.5% and would be a tie at 1%.

## Chosen by Claude at the founder's request

On 2026-10-23 the founder asked Claude to choose the remaining values ("do whatever you think fits"). They are signed off as his, dated 2026-10-23, and each file in `data/parameters/` records who chose it in `chosen_by`. Any of them can be changed at any time.

## Illustrative scenario

P-05, `data/parameters/illustrative-scenario.json`, with the slider ranges (design-system Q6).

**Values:** 10,000 NIS today; 500 NIS a month; 10 years; 5% a year for market products (funds, ETFs, provident, hishtalmut, pension); 3.5% a year for cash-like products (deposit, money-market fund, makam, government bond, current account); inflation 2% a year. Monthly-deposit slider 0 to 10,000 NIS in steps of 100; years slider 1 to 40 in steps of 1.

**Why:** round starting values for someone beginning to save, not a forecast. They match the test scenario for guide pages (S47), so every guide graph is checked. The cash-like rate stands in for the Bank of Israel series that arrive in release 2 (method A-20 to A-25), and the page shows it as a site parameter. The sliders cover what most people would try; a larger value can be typed.

## Sensitivity bounds

P-02, `data/parameters/sensitivity-bounds.json`.

**Values:**
- yearly return 0% to 10%;
- inflation 0% to 5%;
- shekel against a foreign currency −3% to +3% a year;
- cost inside a fund 0% to 3% a year;
- each fee rate from half to double, one at a time;
- horizon 2 years shorter or longer.

**Why:** wide enough to show whether the answer depends on a guess, the return guess above all.

## Fee verdict thresholds

P-03, `data/parameters/fee-verdict-thresholds.json`.

**Values:** "worth negotiating" from 1,000 NIS of real cost over the horizon, when a cheaper reference exists; "worth avoiding" from 2,500 NIS, when another option removes the fee; share threshold 10% of total fee drag (method F-62 does not use it yet).

**Why:** below about 1,000 NIS over several years, a phone call is not worth the time.

## Classification fit

P-04, `data/parameters/classification-fit.json`.

**Values:**
- an equity track ("מניות") fits a horizon of 10 years or more, if the person accepts a fall of at least 30%;
- a general track ("כללי") fits 5 years or more and a fall of at least 20%;
- every other classification shows "no rule".

**Why:** the other regulator classifications put very different mixes under one name (for example index trackers of shares and of bonds), so a mark at that level would mislead. A finer table needs the sub-classification and comes with the fit mark in release 2.

## Golden tolerance

P-06, `data/parameters/golden-tolerance.json`.

**Values:** 1 NIS or 0.01%, whichever is larger.

**Why:** the engine and the independent check use the same conventions, so they should agree to the shekel.
