#!/usr/bin/env python3
"""Expected figures of site/app/lib/custom-entries.test.ts (D44), computed from the formulas alone (F-05 to F-14, F-40, F-63).

A broker and a fund the person types, on a plain plan: one order a month, no spread, no tracking gap, no surtax. The tax rates and the
collected tariff come from the data files, the terms from the test. Run it and copy nothing by hand:
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


def run(trade_rate, trade_min, custody_year, custody_min, fx_rate, monthly_fee, fund_fee_pct, tax_rate, foreign, trade_max=None):
    """F-08 month by month, F-09 at exit. Custody is typed as a percent a year: a twelfth a month, with the monthly minimum (F-14, D44)."""
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
    for m in range(1, T + 1):
        if m == 1:
            buy(AMOUNT, 0)
        buy(MONTHLY * I[m], m)
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
        if m > T - 12:
            exit_year_fees += custody + fixed

    gross = sum(lot[0] for lot in lots) * nav
    sell = commission(gross, trade_rate, trade_min, trade_max)
    fx = fx_rate * (gross - sell) if foreign else 0.0
    indexed = sum(lot[1] * J[T] / lot[2] for lot in lots)
    gain = gross - indexed - exit_year_fees
    tax = tax_rate * max(0.0, gain)
    return (gross - sell - fx - tax) / I[T]


def one_zero_on_tracking_fund():
    """One Zero's list line for a tracking fund, from its latest record: no custody, no fixed fee on the standard plan."""
    path = sorted(glob.glob(os.path.join(ROOT, "data", "fees", "one-zero@*.json")))[-1]
    with open(path, encoding="utf8") as f:
        snap = json.load(f)
    line = next(x for x in snap["lines"] if x["base"] == "trade" and x["band"] is None and "mutual_fund_units" in x["applies_to"])
    return line["rate"]["value"] / 100, line["min"]["value"], line["max"]["value"]


FUND_IL = 0.2 + 0.05 + 0.02  # fixed, variable and trustee, percent a year
FUND_FOREIGN = 0.1

CHEAP = dict(trade_rate=0.0005, trade_min=1.0, custody_year=0.0002, custody_min=0.0, fx_rate=0.002, monthly_fee=0.0)
DEAR = dict(trade_rate=0.005, trade_min=30.0, custody_year=0.004, custody_min=10.0, fx_rate=0.01, monthly_fee=20.0)

rate, minimum, maximum = one_zero_on_tracking_fund()
print("cheap broker, Israeli fund:", f"{run(**CHEAP, fund_fee_pct=FUND_IL, tax_rate=TXS_09, foreign=False):.2f}")
print("dear broker, Israeli fund:", f"{run(**DEAR, fund_fee_pct=FUND_IL, tax_rate=TXS_09, foreign=False):.2f}")
print("cheap broker, fund abroad:", f"{run(**CHEAP, fund_fee_pct=FUND_FOREIGN, tax_rate=TXF_02, foreign=True):.2f}")
print("One Zero, the same Israeli fund:", f"{run(rate, minimum, 0.0, 0.0, 0.0, 0.0, FUND_IL, TXS_09, False, maximum):.2f}")
print("a broker of zeros, the same Israeli fund:", f"{run(0.0, None, 0.0, 0.0, 0.0, 0.0, FUND_IL, TXS_09, False):.2f}")
