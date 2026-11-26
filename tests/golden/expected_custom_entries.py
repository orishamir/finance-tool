#!/usr/bin/env python3
"""Expected figures of site/app/lib/custom-entries.test.ts (D44, D117), computed from the formulas alone (F-05 to F-14, F-40, F-63).

A fund the person types, and a securities account typed by hand before a deal took its place, which moves into a deal of its own (the
move of a typed account, method §10.4): the figures check that deal, priced as F-128 prices a deal, against what the typed account left.
On a plain plan: no spread, no tracking gap, no surtax. The plan's purchases are placed every k months (F-133: k of 1, 2, 3, 4, 6 and 12, the
deposits between orders waiting in shekels, earning nothing, and above a month no order in the month of the sale); each figure is at the k
F-133 chooses: the one that leaves the most in real value before tax, the smaller k on a tie (within a part in a billion). The tax rates
and the collected tariff come from the data files, the terms from the test. A run on the site starts month 1 in its run date's month, so the
exit's tax year, whose fees are deducted from the gain (F-09), holds the months since the last January: the figures are printed for each
calendar month of month 1, and the test reads the one of its run date. Run it and copy nothing by hand:
`python3 tests/golden/expected_custom_entries.py`.
"""
import glob
import json
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def rule_rate(rule_file, figure="rate"):
    with open(os.path.join(ROOT, "data", "rules", rule_file), encoding="utf8") as f:
        return json.load(f)["figures"][figure]["value"] / 100


TXS_09 = rule_rate("txs-09.json")  # an Israeli fund's real gain at sale
TXF_02 = rule_rate("txf-02.json")  # a foreign security's real gain at sale

# the plan of the test
AMOUNT, MONTHLY, YEARS, RETURN, INFLATION = 6000.0, 400.0, 20, 0.07, 0.02
T = 12 * YEARS


def commission(amount, rate, minimum, maximum=None):
    fee = rate * amount
    if maximum is not None:
        fee = min(fee, maximum)
    if minimum is not None:
        fee = max(fee, minimum)
    return fee


INTERVALS = (1, 2, 3, 4, 6, 12)


def run(*args, **kwargs):
    """F-133: the run at the interval that leaves the most before tax, the smaller interval on a tie (within a part in a billion). Returns
    the chosen run's real value after tax."""
    chosen_after, most = run_every(*args, every=1, **kwargs)
    for k in INTERVALS[1:]:
        after, before = run_every(*args, every=k, **kwargs)
        if before - most > 1e-9 * abs(most):
            chosen_after, most = after, before
    return chosen_after


def run_every(trade_rate, trade_min, custody_year, custody_min, fx_rate, monthly_fee, fund_fee_pct, tax_rate, foreign, trade_max=None, first_month=1, every=1):
    """F-08 month by month, F-09 at exit. Custody was typed as a percent a year: a twelfth a month, with the monthly minimum (F-14), as the
    moved deal's custody charges it each month. Above monthly the deposits wait in shekels for the plan's order, placed in each month `every`
    divides before T (F-133); what waits at the sale is left as it is, no fee and no tax. Returns the real value after tax and before it."""
    I = [(1 + INFLATION) ** (m / 12) for m in range(T + 1)]
    # F-03 and F-04: a foreign security is indexed on the exchange rate, flat here (A-03 = 0); an Israeli fund on the CPI
    J = [1.0] * (T + 1) if foreign else I
    g = (1 + RETURN) ** (1 / 12) - 1
    delta = fund_fee_pct / 100
    nav = 1.0
    lots = []  # [units, basis, index]

    def buy(cash, event):
        fx = fx_rate * cash if foreign else 0.0
        cash -= fx
        trade = cash
        for _ in range(100):
            trade = cash - commission(trade, trade_rate, trade_min, trade_max)
        lots.append([trade / nav, trade, J[event]])

    exit_year_fees = 0.0
    waiting = 0.0
    for m in range(1, T + 1):
        if m == 1:
            buy(AMOUNT, 0)
        waiting += MONTHLY * I[m]
        if every == 1 or (m % every == 0 and m < T):
            buy(waiting, m)
            waiting = 0.0
        nav *= 1 + g - delta / 12
        value = sum(lot[0] for lot in lots) * nav
        custody = 0.0
        if value > 0 and (custody_year or custody_min):
            custody = min(max(custody_min, custody_year / 12 * value), value)
        fixed = min(monthly_fee, max(0.0, value - custody))
        units_left = (custody + fixed) / nav
        out = []
        for lot in lots:
            if units_left <= 0:
                out.append(lot)
            elif lot[0] <= units_left:
                units_left -= lot[0]
            else:
                share = (lot[0] - units_left) / lot[0]
                out.append([lot[0] - units_left, lot[1] * share, lot[2]])
                units_left = 0
        lots = out
        # F-01: month m is in the exit's tax year when it is in the calendar year of month T
        if (m - 1 + first_month - 1) // 12 == (T - 1 + first_month - 1) // 12:
            exit_year_fees += custody + fixed

    gross = sum(lot[0] for lot in lots) * nav
    sell = commission(gross, trade_rate, trade_min, trade_max)
    fx = fx_rate * (gross - sell) if foreign else 0.0
    indexed = sum(lot[1] * J[T] / lot[2] for lot in lots)
    gain = gross - indexed - exit_year_fees
    tax = tax_rate * max(0.0, gain)
    return (gross - sell - fx - tax + waiting) / I[T], (gross - sell - fx + waiting) / I[T]


def ibi_on_tracking_fund():
    """IBI's list lines for a tracking fund, from its latest record: the trade line, no custody, and the account fee a month (the typed fund at
    IBI's own row)."""
    path = sorted(glob.glob(os.path.join(ROOT, "data", "fees", "ibi@*.json")))[-1]
    with open(path, encoding="utf8") as f:
        snap = json.load(f)
    line = next(x for x in snap["lines"] if x["base"] == "trade" and x["band"] is None and "mutual_fund_units" in x["applies_to"])
    custody = next(x for x in snap["lines"] if x["base"] == "custody" and "mutual_fund_units" in x["applies_to"])
    assert custody["rate"]["value"] == 0 and custody["min"] is None
    fee = next(x for x in snap["lines"] if x["base"] == "fixed_period")
    assert fee["rate"]["unit"] == "nis_per_month"
    maximum = line["max"]["value"] if line["max"] else None
    return line["rate"]["value"] / 100, line["min"]["value"], maximum, fee["rate"]["value"]


FUND_IL = 0.2 + 0.05 + 0.02  # fixed, variable and trustee, percent a year
FUND_FOREIGN = 0.1

CHEAP = dict(trade_rate=0.0005, trade_min=1.0, custody_year=0.0002, custody_min=0.0, fx_rate=0.002, monthly_fee=0.0)
DEAR = dict(trade_rate=0.005, trade_min=30.0, custody_year=0.004, custody_min=10.0, fx_rate=0.01, monthly_fee=20.0)

rate, minimum, maximum, account_fee = ibi_on_tracking_fund()
# the test's EXPECTED, by the calendar month of month 1
print("const EXPECTED_BY_MONTH: Record<number, Expected> = {")
for f in range(1, 13):
    row = {
        "cheapIl": run(**CHEAP, fund_fee_pct=FUND_IL, tax_rate=TXS_09, foreign=False, first_month=f),
        "dearIl": run(**DEAR, fund_fee_pct=FUND_IL, tax_rate=TXS_09, foreign=False, first_month=f),
        "cheapAbroad": run(**CHEAP, fund_fee_pct=FUND_FOREIGN, tax_rate=TXF_02, foreign=True, first_month=f),
        "ibiIl": run(rate, minimum, 0.0, 0.0, 0.0, account_fee, FUND_IL, TXS_09, False, maximum, first_month=f),
        "zerosIl": run(0.0, None, 0.0, 0.0, 0.0, 0.0, FUND_IL, TXS_09, False, first_month=f),
    }
    print(f"  {f}: {{ " + ", ".join(f"{k}: {v:.2f}" for k, v in row.items()) + " },")
print("};")
