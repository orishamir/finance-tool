#!/usr/bin/env python3
"""Expected figures of packages/engine/test/fx-lines.test.ts, computed from the formulas alone (F-12, F-13, F-84).

No return, no fund cost, no inflation, no custody and no tax-relevant gain: only the commissions and conversions move money,
so the figures can be read against the tariffs. Run it and copy nothing by hand: `python3 tests/golden/expected_fx_lines.py`.
"""

# F-84 on the ECB's day in the test: shekels per one euro and per one dollar.
ILS_PER_EUR = 3.4939
USD_PER_EUR = 1.1193
S_EUR = ILS_PER_EUR
S_USD = ILS_PER_EUR / USD_PER_EUR


def solve_buy(cash, fee):
    """F-12 on a buy: cash = trade value + commission(trade value)."""
    trade = cash
    for _ in range(200):
        trade = cash - fee(trade)
    return trade, cash - trade


def psagot_run(monthly, months, fx_per_dollar):
    """Psagot's European line: 0.15% with a minimum of 15 euros; its dollar conversion: shekels per dollar converted."""
    commission = lambda v: max(0.0015 * v, 15 * S_EUR)
    fx_fee = lambda amount: fx_per_dollar * amount / S_USD
    fees_fx = fees_trade = held = 0.0
    for _ in range(months):
        fx = fx_fee(monthly)
        fees_fx += fx
        trade, c = solve_buy(monthly - fx, commission)
        fees_trade += c
        held += trade
    c = commission(held)
    fees_trade += c
    fx = fx_fee(held - c)
    fees_fx += fx
    return {"fx": fees_fx, "trade": fees_trade, "proceeds": held - c - fx}


def interactive_fx(amount_now, monthly, months, plan):
    """Interactive Israel's conversion: 0.002% with a minimum of 10 NIS; none inside the recurring plan. A lump sum and the sale pay the line."""
    line = lambda amount: max(10.0, 0.00002 * amount)
    total = line(amount_now) if amount_now > 0 else 0.0
    held = amount_now - total
    for _ in range(months):
        fee = 0.0 if plan else line(monthly)
        total += fee
        held += monthly - fee
    total += line(held)
    return total


print(f"S_EUR {S_EUR:.6f}  S_USD {S_USD:.6f}")
print(f"euro minimum in shekels {15 * S_EUR:.6f}")
print(f"one conversion of 400 NIS at 1.5 agorot a dollar {0.015 * 400 / S_USD:.6f}")
print("Psagot, 400 NIS a month for 12 months", {k: round(v, 6) for k, v in psagot_run(400, 12, 0.015).items()})
print("Psagot with the trade only (no conversion line)", {k: round(v, 6) for k, v in psagot_run(400, 12, 0.0).items()})
print(f"Interactive, 6,000 and 400 for 12 months, plan {interactive_fx(6000, 400, 12, True):.6f}")
print(f"Interactive, 6,000 and 400 for 12 months, regular {interactive_fx(6000, 400, 12, False):.6f}")
