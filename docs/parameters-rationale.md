# Site parameters: the founder's rationale

Each site parameter (`docs/method.md` §2.3, stored in `data/parameters/`) is a judgement, not a rule. This file records why each value was chosen, so the page can show it under "site parameter".

## Tie threshold

P-01, `data/parameters/tie-threshold.json`. Set by the founder on 2026-10-22.

**Value:** 0.5%. Two options are a tie when `|V_i − V_j| / max(V_i, V_j) < 0.5%`, where V is the real value at the horizon (method F-80).

**Why:** a difference under 0.5% of the final amount is not worth acting on. This is the same line the founder set the same day for what is worth modelling at all. Example from the golden scenarios: in the broker comparison (S44, regulator-average fees), broker C ends about 0.8% ahead of bank B, which is a clear win at 0.5% and would be a tie at 1%.

## Provisional defaults set by Claude

The founder deferred these technical choices on 2026-10-23. Claude set them so the scenarios can run. Each file says "provisional" and can be changed at any time.

- **Sensitivity bounds** (P-02, `data/parameters/sensitivity-bounds.json`):
  - yearly return 0% to 10%;
  - inflation 0% to 5%;
  - shekel vs foreign currency −3% to +3% a year;
  - each fee rate from half to double, one at a time;
  - horizon 2 years shorter or longer.

  Why: wide enough to show whether the answer depends on the return guess.
- **Fee-verdict thresholds** (P-03, `data/parameters/fee-verdict-thresholds.json`):
  - "worth negotiating" from 1,000 NIS of real cost over the horizon, when a cheaper reference exists;
  - "worth avoiding" from 2,500 NIS, when another option removes the fee;
  - share threshold 10% of total fee drag.

  Why: below about 1,000 NIS over years, a phone call is not worth it.
- **Golden-test tolerance** (P-06, `data/parameters/golden-tolerance.json`): 1 NIS or 0.01%, whichever is larger. Why: the engine and the independent check use the same conventions, so they should agree to the shekel.
- **Classification fit** (P-04, `data/parameters/classification-fit.json`):
  - an equity track ("מניות") fits a horizon of 10 years or more, if the person accepts a fall of at least 30%;
  - a general track ("כללי") fits 5 years or more and a fall of at least 20%;
  - any other classification shows "no rule".

  Why: only the classifications the examples use are listed.
