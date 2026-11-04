#!/usr/bin/env python3
"""Expected figures of packages/engine/test/tariff-period.test.ts (F-101, a price for a time), computed from the fee formulas alone (F-05, F-12, F-14, F-17).

A fund held at no return, no inflation, no fund cost and no spread, so the balance moves only by what is bought, what the fees take and the
sale: the fees paid and the amount left are exact and need no lots, no tax (the real gain is a loss, so the exit tax is nil) and no index.
Month m of the run: the contributions of the month are bought at the price of month m (the first month also buys the amount now), custody is
charged when m is a multiple of the charging period and the fixed fee every month, both at month m's price and out of the balance, and the sale
at month T pays the price of month T. A buy is solved by bisection (the cash pays for the trade and its commission), not by the engine's iteration.
A sequence of tariffs (2026-11-04, finance review) is a list of tariffs and the months where each ends; a period must end on a custody charge
(the engine refuses any other), so every end here is a multiple of the charging period.
A monthly purchase is placed one of two ways (F-101, amended 2026-11-04): the standing-order way (the standing commission with the standing
conversion, where the tariff prints them, else the regular ones) or, where a side's flag is set (`lowerTrade`: the group or the person set the
regular trade price; `lowerFx`: the regular conversion price), the regular way: the regular commission (the standing one when `lowerTrade` is
not set, F-12) with the regular conversion. The order pays the cheaper WHOLE order, the conversion and the commission together, never the
commission of one way with the conversion of the other. A tariff with a `currency` converts each contribution (the amount now at the regular
rate, a monthly purchase by the way it is placed) and the sale at the regular rate of the month of the sale.
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


def order(line, conversion_rate, cash, ccy):
    """One order: the conversion on the cash, then the commission on what is left; returns (conversion, commission)."""
    fx = (conversion_rate or 0.0) * cash if ccy else 0.0
    return fx, buy_cost(line, cash - fx)


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

    ccy = bool(tariffs[0].get("currency"))
    balance, trade_fees, custody_fees, fixed_fees, fx_fees = 0.0, 0.0, 0.0, 0.0, 0.0
    for m in range(1, horizon + 1):
        t = at(m)
        if m == 1 and amount_now > 0:
            fx, fee = order(t.get("buy"), t.get("fx"), amount_now, ccy)
            trade_fees += fee
            fx_fees += fx
            balance += amount_now - fx - fee
        if m <= deposit_months and monthly > 0:
            standing_line = t.get("buyStanding", t.get("buy"))
            fx, fee = order(standing_line, t.get("fxStanding", t.get("fx")), monthly, ccy)
            if t.get("lowerTrade") or t.get("lowerFx"):
                regular_line = t["buy"] if t.get("lowerTrade") and "buy" in t else standing_line
                rfx, rfee = order(regular_line, t.get("fx"), monthly, ccy)
                if rfx + rfee < fx + fee:
                    fx, fee = rfx, rfee
            trade_fees += fee
            fx_fees += fx
            balance += monthly - fx - fee
        c = custody(t.get("custody"), m, balance)
        fixed = min(t.get("monthlyFee", 0.0), max(0.0, balance - c))
        balance -= c + fixed
        custody_fees += c
        fixed_fees += fixed
    t = at(horizon)
    sell = commission(t.get("sell"), balance)
    trade_fees += sell
    exit_fx = t.get("fx", 0.0) * (balance - sell) if ccy else 0.0
    out = {"trade": trade_fees, "custody": custody_fees, "fixed": fixed_fees, "left": balance - sell - exit_fx}
    if ccy:
        out["fx"] = fx_fees + exit_fx
    return out


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
    "lowerTrade": True,
}
REPLACING = {key: value for key, value in LOWER.items() if key != "lowerTrade"}

# the conversion and the commission of one order (F-101, amended 2026-11-04): 1,000 a month for six months, a currency fund, no return
CCY = {"code": "USD"}


def conv(buy, standing, fx, fx_standing, **flags):
    return {"buy": {"rate": buy}, "buyStanding": {"rate": standing}, "sell": {"rate": 0.0}, "fx": fx, "fxStanding": fx_standing, "currency": CCY, **flags}


# (a) only the conversion price is the person's: the commission stays the standing one (2.00, not the regular 0.50), the conversion is the lower
# of the plan's 2.00 and the regular 0.50
ONLY_FX = conv(0.0005, 0.002, 0.0005, 0.002, lowerFx=True)
# (b) only the trade price is the person's: the standing order (conversion 1.00 + commission 2.00) is cheaper than the regular order
# (conversion 10.00 + commission 0.50); no order pays the regular commission with the plan's conversion
ONLY_TRADE = conv(0.0005, 0.002, 0.01, 0.001, lowerTrade=True)
# (b) both set, and the regular order is the cheaper whole (1.00 + 0.50 against 1.20 + 2.00)
BOTH = conv(0.0005, 0.002, 0.001, 0.0012, lowerTrade=True, lowerFx=True)
# neither set: the standing-order price replaces the regular one on both sides, as before (1.00 + 2.00)
NEITHER = conv(0.0005, 0.002, 0.01, 0.001)
# the conversion changes between periods: months 1 to 3 the plan's conversion is cheaper (1.00 against 5.00), from month 4 the regular one
# (2.00 against 4.00); the lump sum at the start and the sale at month 6 pay the regular conversion of their month
FX_EARLY = conv(0.0005, 0.002, 0.005, 0.001, lowerFx=True)
FX_LATE = conv(0.0005, 0.002, 0.002, 0.004, lowerFx=True)

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
    "conv_only_fx": run_seq([ONLY_FX], [], 0.0, 1000.0, 6, 6),
    "conv_only_trade": run_seq([ONLY_TRADE], [], 0.0, 1000.0, 6, 6),
    "conv_both": run_seq([BOTH], [], 0.0, 1000.0, 6, 6),
    "conv_neither": run_seq([NEITHER], [], 0.0, 1000.0, 6, 6),
    "conv_periods": run_seq([FX_EARLY, FX_LATE], [3], 2000.0, 1000.0, 6, 6),
}
print(json.dumps(cases, indent=2, sort_keys=True))
