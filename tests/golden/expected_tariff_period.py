#!/usr/bin/env python3
"""Expected figures of packages/engine/test/tariff-period.test.ts (F-101, a price for a time), computed from the fee formulas alone (F-05, F-12, F-14, F-17).

A fund held at no return, no inflation, no fund cost and no spread, so the balance moves only by what is bought, what the fees take and the
sale: the fees paid and the amount left are exact and need no lots, no tax (the real gain is a loss, so the exit tax is nil) and no index.
Month m of the run: the contributions of the month are bought at the price of month m (the first month also buys the amount now), custody is
charged when m is a multiple of the charging period and the fixed fee every month, both at month m's price and out of the balance, and the sale
at month T pays the price of month T. A buy is solved by bisection (the cash pays for the trade and its commission), not by the engine's iteration.
A sequence of tariffs (2026-11-04, finance review) is a list of tariffs and the months where each ends; a period must end on a custody charge
(the engine refuses any other), so every end here is a multiple of the charging period. Where a tariff has `lower`, a monthly purchase pays the
lower of its standing-order price and its regular price (the person can place either).
Run it and copy nothing by hand: `python3 tests/golden/expected_tariff_period.py`.
"""
import json


def commission(line, amount):
    """F-12: max(min, min(rate x amount, max)), nothing on an empty trade."""
    if line is None or amount <= 0:
        return 0.0
    fee = line["rate"] * amount
    if "max" in line:
        fee = min(fee, line["max"])
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
    """F-14: max(min, min(rate x balance, max)) every `every` months, never more than the balance."""
    if line is None or month % line["every"] != 0 or balance <= 0:
        return 0.0
    fee = line["rate"] * balance
    if "max" in line:
        fee = min(fee, line["max"])
    if "min" in line:
        fee = max(fee, line["min"])
    return min(fee, balance)


def run_seq(tariffs, ends, amount_now, monthly, deposit_months, horizon):
    """One run over a sequence of tariffs: tariffs[i] holds for the months up to ends[i], the last one for every month after them."""
    def at(m):
        for t, end in zip(tariffs, ends):
            if m <= end:
                return t
        return tariffs[-1]

    balance, trade_fees, custody_fees, fixed_fees = 0.0, 0.0, 0.0, 0.0
    for m in range(1, horizon + 1):
        t = at(m)
        if m == 1 and amount_now > 0:
            fee = buy_cost(t.get("buy"), amount_now)
            trade_fees += fee
            balance += amount_now - fee
        if m <= deposit_months and monthly > 0:
            line = t.get("buyStanding", t.get("buy"))
            fee = buy_cost(line, monthly)
            if t.get("lower") and "buyStanding" in t and "buy" in t:
                fee = min(fee, buy_cost(t["buy"], monthly))
            trade_fees += fee
            balance += monthly - fee
        c = custody(t.get("custody"), m, balance)
        fixed = min(t.get("monthlyFee", 0.0), max(0.0, balance - c))
        balance -= c + fixed
        custody_fees += c
        fixed_fees += fixed
    t = at(horizon)
    sell = commission(t.get("sell"), balance)
    trade_fees += sell
    return {"trade": trade_fees, "custody": custody_fees, "fixed": fixed_fees, "left": balance - sell}


def run(first, then, until, amount_now, monthly, deposit_months, horizon):
    """Two tariffs and the month the first ends; `until` None means no period."""
    if until is None:
        return run_seq([first], [], amount_now, monthly, deposit_months, horizon)
    return run_seq([first, then], [until], amount_now, monthly, deposit_months, horizon)


FIRST = {
    "buy": {"rate": 0.001, "min": 5.0},
    "buyStanding": {"rate": 0.0005, "min": 2.0},
    "sell": {"rate": 0.001, "min": 5.0},
    "custody": {"rate": 0.00075, "every": 3, "min": 3.0},
}
THEN = {
    "buy": {"rate": 0.004, "min": 26.0},
    "sell": {"rate": 0.004, "min": 26.0},
    "custody": {"rate": 0.0015, "every": 3, "min": 30.0, "max": 3700.0},
    "monthlyFee": 10.0,
}

# the leumi student example of docs/method.md: 100,000 held for a year, custody only
STUDENT = {"custody": {"rate": 0.00075, "every": 3}}
LIST = {"custody": {"rate": 0.0015, "every": 3, "max": 3700.0}}

# one charge a month, so that a period can end on any month (the sale at T - 1 against T)
FIRST_M = {**FIRST, "custody": {"rate": 0.00025, "every": 1, "min": 1.0}}
THEN_M = {**THEN, "custody": {"rate": 0.0005, "every": 1, "min": 10.0, "max": 1200.0}}

# a sequence of three: a free-trade offer for 6 months, a student price to month 24, then the list
OFFER = {"buy": {"rate": 0.0}, "sell": {"rate": 0.0}, "custody": {"rate": 0.0, "every": 3}}
STUDENT3 = {
    "buy": {"rate": 0.002, "min": 7.0},
    "buyStanding": {"rate": 0.001, "min": 4.0},
    "sell": {"rate": 0.002, "min": 7.0},
    "custody": {"rate": 0.00075, "every": 3},
}
LIST3 = {
    "buy": {"rate": 0.004, "min": 26.0},
    "buyStanding": {"rate": 0.0015, "min": 5.0},
    "sell": {"rate": 0.004, "min": 26.0},
    "custody": {"rate": 0.0015, "every": 3, "max": 3700.0},
    "monthlyFee": 8.0,
}

# a regular price over a standing-order price: which one is cheaper depends on the order
LOWER = {
    "buy": {"rate": 0.001, "min": 3.0},
    "buyStanding": {"rate": 0.002, "min": 1.0},
    "sell": {"rate": 0.001, "min": 3.0},
    "lower": True,
}
REPLACING = {key: value for key, value in LOWER.items() if key != "lower"}

cases = {
    # a monthly plan of 24 months with an amount now: the period ends on a charging month
    "plan_u12": run(FIRST, THEN, 12, 10000.0, 500.0, 24, 24),
    "plan_u0": run(FIRST, THEN, 0, 10000.0, 500.0, 24, 24),
    # past the horizon, on a charging month
    "plan_u102": run(FIRST, THEN, 102, 10000.0, 500.0, 24, 24),
    # the sale at the horizon pays the price at the horizon: u = T keeps the first tariff
    "plan_u24": run(FIRST, THEN, 24, 10000.0, 500.0, 24, 24),
    # ... and with a charge every month a period of T - 1 does not
    "monthly_custody_u24": run(FIRST_M, THEN_M, 24, 10000.0, 500.0, 24, 24),
    "monthly_custody_u23": run(FIRST_M, THEN_M, 23, 10000.0, 500.0, 24, 24),
    # the two tariffs alone, no period
    "plan_first_alone": run(FIRST, THEN, None, 10000.0, 500.0, 24, 24),
    "plan_then_alone": run(THEN, THEN, None, 10000.0, 500.0, 24, 24),
    # a small balance: each tariff's own minimum, custody never above the balance
    "small_u6": run(FIRST, THEN, 6, 1000.0, 0.0, 0, 12),
    # the worked example: 100,000 held for twelve months, the student price for six
    "student_u6": run(STUDENT, LIST, 6, 100000.0, 0.0, 0, 12),
    "student_list_alone": run(LIST, LIST, None, 100000.0, 0.0, 0, 12),
    # a sequence: the offer to month 6, the student price to month 24, then the list (a standing-order price in the second and the third)
    "sequence_6_24": run_seq([OFFER, STUDENT3, LIST3], [6, 24], 10000.0, 500.0, 36, 36),
    # ... the same sequence on the exact boundaries and with the second period empty
    "sequence_6_6": run_seq([OFFER, STUDENT3, LIST3], [6, 6], 10000.0, 500.0, 36, 36),
    "sequence_0_24": run_seq([OFFER, STUDENT3, LIST3], [0, 24], 10000.0, 500.0, 36, 36),
    # a standing-order price only in the later tariff: months 1 to 12 pay the regular price, the rest the standing one
    "standing_later": run(
        {"buy": {"rate": 0.004, "min": 26.0}, "sell": {"rate": 0.004, "min": 26.0}},
        {"buy": {"rate": 0.004, "min": 26.0}, "buyStanding": {"rate": 0.0005, "min": 2.0}, "sell": {"rate": 0.004, "min": 26.0}},
        12, 10000.0, 500.0, 24, 24),
    # the lower of the standing-order price and the regular one: 500 a month (standing 1.00 against 3.00) and 5,000 a month (10.00 against 5.00)
    "lower_small_orders": run_seq([LOWER], [], 0.0, 500.0, 6, 6),
    "lower_large_orders": run_seq([LOWER], [], 0.0, 5000.0, 6, 6),
    "replacing_large_orders": run_seq([REPLACING], [], 0.0, 5000.0, 6, 6),
}
print(json.dumps(cases, indent=2, sort_keys=True))
