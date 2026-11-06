#!/usr/bin/env python3
"""Expected figures of packages/engine/test/pricing-d64-d67.test.ts (F-102 the current account at a bank, F-103 a charge for each corporate
event abroad), computed from docs/method.md alone, not from the engine's code.

A fund held at no return, no inflation, no fund cost and no exchange-rate change, so the balance moves only by what is bought, what the fees
take, the dividends and their tax, and the sale. Month m of the run: the amount now is bought at the start of month 1 and each monthly deposit at
the start of its month (F-08), the cash paying for the trade and its commission (F-12, solved by bisection, not by the engine's iteration); then
the dividend of a distribution month, taxed and reinvested with no commission and no conversion (F-20), and the custodian's charge for it
(F-103: `min(c x S_m, held)`, after the reinvestment); then custody when m is a multiple of its period (F-14) and the current account
(F-102: `min(a_m, held after custody)`, `a_m` the price of the month's stretch, F-101). The sale at T pays its commission and the conversion.
The sale gain is a loss in every case here (the dividends lower the price, the fees take units), so the exit tax is nil.

Run it and copy nothing by hand: `python3 tests/golden/expected_d64_d67.py`.
"""
import json


def commission(line, amount):
    """F-12: max(min, min(rate x amount, max)), nothing on an empty trade."""
    if line is None or amount <= 0:
        return 0.0
    fee = line["rate"] * amount
    if "min" in line:
        fee = max(fee, line["min"])
    return fee


def buy_cost(line, cash):
    """The trade value v with v + commission(v) = cash, found by bisection; returns the commission."""
    lo, hi = 0.0, cash
    for _ in range(200):
        mid = (lo + hi) / 2
        if mid + commission(line, mid) > cash:
            hi = mid
        else:
            lo = mid
    return cash - lo


def custody(line, month, balance):
    """F-14: rate x balance every `every` months, never more than the balance."""
    if line is None or month % line["every"] != 0 or balance <= 0:
        return 0.0
    return min(line["rate"] * balance, balance)


def run_account(stretches, amount_now, monthly, deposit_months, horizon, buy=None, sell=None, custody_line=None):
    """F-102 over a sequence: stretches is a list of (last month, a) and the last stretch's a holds for every month after them."""
    def a_at(m):
        for end, a in stretches[:-1]:
            if m <= end:
                return a
        return stretches[-1][1]

    balance, trade, cust, account = 0.0, 0.0, 0.0, 0.0
    for m in range(1, horizon + 1):
        if m == 1 and amount_now > 0:
            fee = buy_cost(buy, amount_now)
            trade += fee
            balance += amount_now - fee
        if m <= deposit_months and monthly > 0:
            fee = buy_cost(buy, monthly)
            trade += fee
            balance += monthly - fee
        c = custody(custody_line, m, balance)
        balance -= c
        cust += c
        paid = min(a_at(m), max(0.0, balance))
        balance -= paid
        account += paid
    s = commission(sell, balance)
    trade += s
    return {"trade": trade, "custody": cust, "account": account, "left": balance - s}


def run_dividends(amount_now, horizon, yield_a_year, per_year, per_event_usd, usd, fx_rate, israeli_rate, foreign_withholding):
    """F-103 on a fund bought abroad that pays dividends: a dividend every 12 / per_year months, taxed (F-20) and reinvested, then the charge."""
    fx = fx_rate * amount_now
    balance = amount_now - fx
    fx_fees, events, tax, first_event_month = fx, 0.0, 0.0, None
    every = 12 // per_year
    share = yield_a_year / per_year
    for m in range(1, horizon + 1):
        if m % every == 0:
            dist = balance * share
            foreign = foreign_withholding * dist
            israeli = max(0.0, israeli_rate * dist - min(foreign, israeli_rate * dist))
            tax += foreign + israeli
            balance += -dist + (dist - foreign - israeli)
            e = min(per_event_usd * usd, max(0.0, balance))
            balance -= e
            events += e
    exit_fx = fx_rate * balance
    return {"fx": fx_fees + exit_fx, "custody": events, "taxDuring": tax, "left": balance - exit_fx}


# the rate of TXF-08 (25%) and an Irish fund's withholding of nothing (TXF-28), from data/rules
ISRAELI_RATE = 0.25
LIST = {"rate": 0.001, "min": 5.0}
CUSTODY = {"rate": 0.0015, "every": 3}

cases = {
    # F-102: 10,000 now and 500 a month for 24 months; a group exempt for 12 months, then 5.50 a month; the same at 5.50 all along
    "account_exempt_12": run_account([(12, 0.0), (None, 5.5)], 10_000, 500, 24, 24, LIST, LIST, CUSTODY),
    "account_all_along": run_account([(None, 5.5)], 10_000, 500, 24, 24, LIST, LIST, CUSTODY),
    # F-102: never more than is held: 20 held, 5.50 a month for six months, no other fee
    "account_runs_out": run_account([(None, 5.5)], 20, 0, 0, 6),
    # F-103: 100,000 now, a fund paying 4% a year in four dividends, 50 dollars at 3.70 each, a conversion of 0.2% on the buy and the sale
    "dividends_24": run_dividends(100_000, 24, 0.04, 4, 50, 3.7, 0.002, ISRAELI_RATE, 0.0),
    # F-103: never more than is held: 400 now, the same fund, for a year
    "dividends_run_out": run_dividends(400, 12, 0.04, 4, 50, 3.7, 0.0, ISRAELI_RATE, 0.0),
}
print(json.dumps(cases, indent=2, sort_keys=True))
