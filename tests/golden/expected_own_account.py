#!/usr/bin/env python3
"""Expected figures of site/app/lib/own-account.test.ts (an account on a house, F-101), computed from the data files and the written layering rules alone.

The layering rules, as the finance review of 2026-11-04 settled them (docs/method.md F-101 and section 12), written here without reading the code:

 1. The tariff of an account is the house's list tariff; a group's price replaces only the line it states; the person's own values go over both.
    A value never deletes the house's standing-order line: where the group or the person sets the regular trade price, a monthly purchase pays the
    lower of the standing-order price and that regular price, order by order. Where neither sets it, the standing-order price replaces the regular one.
 2. Each group price ends at its own `for_months` (none: it does not end) and no later than the person's stay in the group (none: the whole plan).
    The stretch of months up to the first end holds every price; each later stretch holds the prices not yet ended; after the last end, the prices
    that never end (the list and the person's own values alone, if none). The person's own values hold for the whole plan.
 3. A price that names a purchase alone (`side` buy) leaves the sale the list's price, and a sale alone the purchase.
 4. A custody rate the person typed (or a group's) keeps the list's minimum and maximum, per month, in every stretch, unless it states its own.
 5. A group price whose words do not name fund units is not applied to a fund; a person who adopts it (chooses to use it) has it read like any price that names funds, with its own end and the person's stay.

Two houses. Leumi (direct channel, a tracking fund on the Tel Aviv exchange): the list's regular trade price 0.4% with a minimum of 26, its
standing-order price 0.225% with a minimum of 5, custody 0.15% a quarter with a maximum of 3,700, and the group "לאומי סטודנט, בפתיחת חשבון": custody
exempt for 12 months, 7 shekels a trade with no printed end. That group's words do not name fund units, so the cases that apply it read the same
prices as if they did (`NAMES`), which is what a person who adopted them would have typed. Mercantile Discount Bank: its list prices and a
buy-only price (the "Top" group's trade price, read as a purchase alone).

A fund held at no return, no inflation, no fund cost, no spread, no tax. A buy is solved by bisection; custody is charged every quarter on the balance
out of the balance; deposits every month of the horizon; the sale at month T pays the price of month T.
Run it and copy nothing by hand: `python3 tests/golden/expected_own_account.py`.
"""
import json
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def record(house):
    with open(os.path.join(ROOT, "data", "fees", house + "@2026-11-04.json"), encoding="utf8") as f:
        return json.load(f)


def line(rec, line_id):
    return next(l for l in rec["lines"] if l["id"] == line_id)


def group_price(rec, entry_name, fee):
    entry = next(e for e in rec["groups"]["entries"] if e["name_he"] == entry_name)
    return next(p for p in entry["prices"] if p["fee"] == fee)["value"]


INF = float("inf")


def commission(line, amount):
    if line is None or amount <= 0:
        return 0.0
    if "flat" in line and amount <= line["flat"]["up_to"]:
        return line["flat"]["amount"]
    fee = line["rate"] * amount
    if "max" in line:
        fee = min(fee, line["max"])
    if "min" in line:
        fee = max(fee, line["min"])
    return fee


def buy_cost(line, cash):
    """The commission of an order paid with `cash`: the trade value v with v + commission(v) = cash, by bisection (a flat price settles it at once)."""
    if line is not None and "flat" in line and cash - line["flat"]["amount"] <= line["flat"]["up_to"]:
        return line["flat"]["amount"]
    lo, hi = 0.0, cash
    for _ in range(200):
        mid = (lo + hi) / 2
        if mid + commission(line, mid) > cash:
            hi = mid
        else:
            lo = mid
    return cash - lo


def custody(line, month, balance):
    if line is None or month % line["every"] != 0 or balance <= 0:
        return 0.0
    fee = line["rate"] * balance
    if "max" in line:
        fee = min(fee, line["max"])
    if "min" in line:
        fee = max(fee, line["min"])
    return min(fee, balance)


def run(tariffs, ends, amount_now, monthly, horizon):
    """tariffs[i] holds up to month ends[i], the last one after them. A tariff with `lower` pays, on a monthly purchase, the lower of its standing price and its regular one."""
    def at(m):
        for t, end in zip(tariffs, ends):
            if m <= end:
                return t
        return tariffs[-1]

    balance, trade_fees, custody_fees = 0.0, 0.0, 0.0
    for m in range(1, horizon + 1):
        t = at(m)
        if m == 1 and amount_now > 0:
            fee = buy_cost(t.get("buy"), amount_now)
            trade_fees += fee
            balance += amount_now - fee
        if monthly > 0:
            fee = buy_cost(t.get("buyStanding", t.get("buy")), monthly)
            if t.get("lower") and "buyStanding" in t and "buy" in t:
                fee = min(fee, buy_cost(t["buy"], monthly))
            trade_fees += fee
            balance += monthly - fee
        c = custody(t.get("custody"), m, balance)
        balance -= c
        custody_fees += c
    sell = commission(at(horizon).get("sell"), balance)
    trade_fees += sell
    return {"trade": trade_fees, "custody": custody_fees, "left": balance - sell}


# ---------------------------------------------------------------- the layering rules

def group_trade(list_line, v):
    """A group's price over a trade line: what it states replaces, a rate replaces the whole rate shape and keeps the list's bounds."""
    if v.get("exempt"):
        return {"rate": 0.0}
    if "flat" in v:
        return {**list_line, "min": list_line.get("min", v["flat"]), "flat": {"amount": v["flat"], "up_to": v.get("flat_up_to", INF)}}
    out = {k: x for k, x in list_line.items() if k not in ("flat", "perShare")}
    out["rate"] = v["rate_pct"] / 100
    if "min" in v:
        out["min"] = v["min"]
    if "max" in v:
        out["max"] = v["max"]
    return out


def group_custody(list_custody, v):
    if v.get("exempt"):
        return {"rate": 0.0, "every": list_custody["every"]}
    every = {"month": 1, "quarter": 3, "year": 12}[v["per"]]
    out = {"rate": v["rate_pct"] / 100, "every": every}
    for bound in ("min", "max"):
        if bound in v:
            out[bound] = v[bound]
        elif bound in list_custody:
            out[bound] = list_custody[bound] / list_custody["every"] * every
    return out


def stretches(list_t, parts, own):
    """The sequence of tariffs and its ends: `parts` is [{"fee": "trade" or "custody", "v": value, "side": None, "end": months or INF}]."""
    ends = sorted({p["end"] for p in parts if p["end"] != INF})

    def build(boundary):
        t = dict(list_t)
        for p in parts:
            if p["end"] < boundary:
                continue
            if p["fee"] == "trade":
                if p["side"] != "sell":
                    t["buy"] = group_trade(list_t["buy"], p["v"])
                    if "buyStanding" in list_t:
                        t["lower"] = True
                if p["side"] != "buy":
                    t["sell"] = group_trade(list_t["sell"], p["v"])
            else:
                t["custody"] = group_custody(list_t["custody"], p["v"])
        return with_own(t, list_t, own)

    return [build(end) for end in ends] + [build(INF)], ends


def with_own(t, list_t, own):
    """The person's values over a tariff: a trade percent and minimum replace the regular line (the standing line stays and the lower is paid); a custody percent a year replaces the rate."""
    t = dict(t)
    if "trade_pct" in own or "trade_min" in own:
        for key in ("buy", "sell"):
            c = {k: x for k, x in t[key].items() if k not in ("flat", "perShare")}
            if "trade_pct" in own:
                c["rate"] = own["trade_pct"] / 100
                if "flat" in t[key] and "trade_min" not in own:
                    c.pop("min", None)
            if "trade_min" in own:
                c["min"] = own["trade_min"]
            t[key] = c
        if "buyStanding" in t:
            t["lower"] = True
    if "custody_pct" in own:
        every = t["custody"]["every"]
        c = {"rate": own["custody_pct"] / 100 * every / 12, "every": every}
        for bound in ("min", "max"):
            if bound in t["custody"]:
                c[bound] = t["custody"][bound]
            elif bound in list_t["custody"]:
                c[bound] = list_t["custody"][bound] / list_t["custody"]["every"] * every
        t["custody"] = c
    return t


# ---------------------------------------------------------------- Leumi

LEUMI = record("leumi")
L_TRADE = line(LEUMI, "leumi-buy-sell-tase-direct")
L_STANDING = line(LEUMI, "leumi-tracking-fund-standing-order")
L_CUSTODY = line(LEUMI, "leumi-custody-israel")
LEUMI_LIST = {
    "buy": {"rate": L_TRADE["rate"]["value"] / 100, "min": L_TRADE["min"]["value"], "max": L_TRADE["max"]["value"]},
    "sell": {"rate": L_TRADE["rate"]["value"] / 100, "min": L_TRADE["min"]["value"], "max": L_TRADE["max"]["value"]},
    "buyStanding": {"rate": L_STANDING["rate"]["value"] / 100, "min": L_STANDING["min"]["value"], "max": L_STANDING["max"]["value"]},
    "custody": {"rate": L_CUSTODY["rate"]["value"] / 100, "every": 3, "max": L_CUSTODY["max"]["value"]},
}
OFFER = "לאומי סטודנט, בפתיחת חשבון"
OFFER_CUSTODY = group_price(LEUMI, OFFER, "custody_israel")  # exempt, 12 months
OFFER_TRADE = group_price(LEUMI, OFFER, "trade_israel")  # 7 shekels a trade, no end
TOTAL = "לאומי טוטאל דיגיטל"
TOTAL_TRADE = group_price(LEUMI, TOTAL, "trade_israel")  # 0.4%
TOTAL_CUSTODY = group_price(LEUMI, TOTAL, "custody_israel")  # 0.125% a quarter

AMOUNT, MONTHLY, YEARS = 50000.0, 1000.0, 5
T = 12 * YEARS


def offer_parts(stay):
    """The opening offer read as the person's group: the custody exemption ends at its 12 months, the trade price never does; the stay ends both."""
    cap = INF if stay is None else stay
    return [
        {"fee": "custody", "v": OFFER_CUSTODY, "side": None, "end": min(OFFER_CUSTODY["for_months"], cap)},
        {"fee": "trade", "v": OFFER_TRADE, "side": None, "end": min(INF, cap)},
    ]


def leumi_case(parts, own=None):
    tariffs, ends = stretches(LEUMI_LIST, parts, own or {})
    return run(tariffs, ends, AMOUNT, MONTHLY, T)


# the person's typed values: Total Digital's words do not name funds, so the person adopts its prices as their own (0.4% a trade, 0.125% a quarter)
ADOPTED = {"trade_pct": TOTAL_TRADE["rate_pct"], "custody_pct": TOTAL_CUSTODY["rate_pct"] * 4}

# ---------------------------------------------------------------- Mercantile

MERC = record("mercantile")
M_TRADE = line(MERC, "mercantile-buy-sell-tase-direct")
M_CUSTODY = line(MERC, "mercantile-custody-israel")
MERC_LIST = {
    "buy": {"rate": M_TRADE["rate"]["value"] / 100, "min": M_TRADE["min"]["value"], "max": M_TRADE["max"]["value"]},
    "sell": {"rate": M_TRADE["rate"]["value"] / 100, "min": M_TRADE["min"]["value"], "max": M_TRADE["max"]["value"]},
    "custody": {"rate": M_CUSTODY["rate"]["value"] / 100, "every": 3, "max": M_CUSTODY["max"]["value"]},
}
TOP_TRADE = group_price(MERC, "מרכנתיל טופ", "trade_israel")  # 0.12% with a minimum of 10, 36 months
STUDENT_CUSTODY = group_price(MERC, "סטודנטים", "custody_israel")  # 0.1% a quarter, 48 months
M_STUDENT_FOR = STUDENT_CUSTODY["for_months"]


def merc_case(parts, own=None):
    tariffs, ends = stretches(MERC_LIST, parts, own or {})
    return run(tariffs, ends, AMOUNT, MONTHLY, T)


cases = {
    "layers": {
        "leumi_buy": LEUMI_LIST["buy"],
        "leumi_standing": LEUMI_LIST["buyStanding"],
        "leumi_custody": LEUMI_LIST["custody"],
        "offer_custody_months": OFFER_CUSTODY["for_months"],
        "offer_trade": OFFER_TRADE["flat"],
        "adopted_trade": ADOPTED["trade_pct"] / 100,
        "adopted_custody_rate_a_quarter": ADOPTED["custody_pct"] / 100 * 3 / 12,
        "merc_buy_only_buy": group_trade(MERC_LIST["buy"], TOP_TRADE),
        "merc_buy_only_sell": MERC_LIST["sell"],
        "merc_student_custody_a_quarter": group_custody(MERC_LIST["custody"], STUDENT_CUSTODY),
        # a typed custody over a group's exemption keeps the list's maximum, per month, in every stretch
        "own_custody_over_exemption": with_own(stretches(LEUMI_LIST, offer_parts(None), {})[0][0], LEUMI_LIST, {"custody_pct": 0.5})["custody"],
        "own_custody_over_list": with_own(LEUMI_LIST, LEUMI_LIST, {"custody_pct": 0.5})["custody"],
    },
    # the account on the price list alone
    "leumi_list_alone": run([LEUMI_LIST], [], AMOUNT, MONTHLY, T),
    "merc_list_alone": run([MERC_LIST], [], AMOUNT, MONTHLY, T),
    # the opening offer for the whole plan: the exemption ends at 12 months, the 7 shekels a trade go on; the monthly purchase pays the lower of the standing price and 7
    "offer_whole_plan": leumi_case(offer_parts(None)),
    # ... for the person's stay of 5 years (the plan's length): the sale at month 60 still pays 7
    "offer_stay_5_years": leumi_case(offer_parts(60)),
    # ... for a stay of 3 years: the trade price ends with the stay at 36, the sale at 60 pays the list's
    "offer_stay_3_years": leumi_case(offer_parts(36)),
    # ... for a stay of 6 months: both prices end at 6
    "offer_stay_6_months": leumi_case(offer_parts(6)),
    # a price the group's words do not name for a fund is not applied: Total Digital's group on its own is the price list
    "total_not_applied": run([LEUMI_LIST], [], AMOUNT, MONTHLY, T),
    # the person adopted Total Digital's prices as their own: the list's standing price stays, the monthly purchase pays the lower of it and 0.4% (a minimum of 26)
    "adopted_total_digital": leumi_case([], ADOPTED),
    # the adopted prices under the opening offer: the person's custody rate over an exemption keeps the list's maximum
    "adopted_over_offer": leumi_case(offer_parts(None), ADOPTED),
    # a purchase-only price: Top's trade price on the purchases, the sale at the list's
    "merc_buy_only": merc_case([{"fee": "trade", "v": TOP_TRADE, "side": "buy", "end": INF}]),
    # two prices of one group with different ends on a house with no standing line: custody for the student's 48 months, trade for 24
    "merc_two_ends": merc_case([
        {"fee": "custody", "v": STUDENT_CUSTODY, "side": None, "end": M_STUDENT_FOR},
        {"fee": "trade", "v": TOP_TRADE, "side": None, "end": 24},
    ]),
}
print(json.dumps(cases, indent=2, sort_keys=True, ensure_ascii=False))
