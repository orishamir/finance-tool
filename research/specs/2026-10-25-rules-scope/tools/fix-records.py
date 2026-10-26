#!/usr/bin/env python3
"""D30 in the wrapper and exposure records (spec 2026-10-25-rules-scope §4, requests.md §5): a product field cites general rules only
and holds no value whose source is one company's document. Removes the citations of company terms, the two fee caps and the payout
time that rested on company tariffs, and the clauses of the English working texts that stated a company's term as the product's.
Prints every change. Keeps the files' two-space JSON format."""
import json, os
ROOT = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/data/instruments"
log = []
def load(kind, id):
    p = os.path.join(ROOT, kind, id + ".json")
    return p, json.load(open(p, encoding="utf-8"))
def save(p, d):
    with open(p, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")
def drop_ids(d, path, ids, where):
    node = d
    for k in path: node = node[k]
    before = list(node["rule_ids"])
    node["rule_ids"] = [x for x in before if x not in ids]
    gone = [x for x in before if x in ids]
    assert gone, (where, path, ids)
    log.append(f"{where} {'.'.join(path)}.rule_ids: removed {', '.join(gone)}")
def replace_text(d, path, key, old, new, where):
    node = d
    for k in path: node = node[k]
    assert old in node[key], (where, path, old)
    node[key] = node[key].replace(old, new)
    log.append(f"{where} {'.'.join(path)}.{key}: \"{old}\" -> \"{new}\"")

def first_pass():
    # brokerage-account
    p, d = load("wrappers", "brokerage-account")
    drop_ids(d, ["fee_caps", "fx"], {"BRK-23"}, "brokerage-account")
    d["fee_caps"]["fx"]["notes"] = d["fee_caps"]["fx"]["notes"].replace(" (Leumi terms)", "")
    for base in ["fixed_period", "distribution_handling"]:
        del d["fee_caps"][base]
        log.append(f"brokerage-account fee_caps.{base}: removed (its \"no cap\" rested on company tariffs; the guide shows the base as set by each provider's tariff)")
    drop_ids(d, ["eligibility"], {"BRK-28"}, "brokerage-account")
    replace_text(d, ["eligibility"], "text", "minimums are provider-set (Fair from NIS 250; Meitav Trade NIS 5,000 or 10,000, inconsistent on its own page)", "minimums are provider-set (each provider's own terms: BRK-28, on the companies' pages)", "brokerage-account")
    drop_ids(d, ["protection"], {"BRK-12", "BRK-13", "REG-26"}, "brokerage-account")
    save(p, d)

    # child-savings-bank: Leumi's own service time
    p, d = load("wrappers", "child-savings-bank")
    del d["lawful_exit"]["payout_business_days"]
    log.append("child-savings-bank lawful_exit.payout_business_days: removed (Bank Leumi's own 3 business days, CS-29; no general timetable, CS-14)")
    save(p, d)

    # child-savings-provident: Harel's default track
    p, d = load("wrappers", "child-savings-provident")
    drop_ids(d, ["protection"], {"CS-09"}, "child-savings-provident")
    replace_text(d, ["protection"], "text", "; there is no floor under the value in the provident option, and the default increased-risk track holds mostly equities, in Israel and abroad, with currency exposure (Harel's bylaw)", "; there is no floor under the value in the provident option (what each company's default track holds is its own term, CS-09)", "child-savings-provident")
    save(p, d)

    # IRA: Meitav's broker prices and Meitav Trade's operating fees
    for w in ["ira-provident", "ira-hishtalmut"]:
        p, d = load("wrappers", w)
        drop_ids(d, ["fee_caps", "trade"], {"IRA-21"}, w)
        drop_ids(d, ["fee_caps", "custody"], {"IRA-22"}, w)
        save(p, d)

    # keren hishtalmut: Harel's and Altshuler Shaham's continuing deposits
    p, d = load("wrappers", "keren-hishtalmut")
    drop_ids(d, ["eligibility"], {"KH-09"}, "keren-hishtalmut")
    replace_text(d, ["eligibility"], "text", "; some funds stop accepting deposits once the employer stops paying", "", "keren-hishtalmut")
    save(p, d)

    # money-market funds: the brokers' account conditions
    for w in ["money-market-fund-daily", "money-market-fund-renewable"]:
        p, d = load("wrappers", w)
        drop_ids(d, ["eligibility"], {"BRK-28"}, w)
        save(p, d)

    # savings plan: Bank Hapoalim's contracts
    p, d = load("wrappers", "savings-plan")
    drop_ids(d, ["eligibility"], {"BPN-10"}, "savings-plan")
    replace_text(d, ["eligibility"], "text", " (for example from NIS 200 a month at one bank, institution source)", "", "savings-plan")
    save(p, d)

    # exposures: fund managers' and a bank's terms on an index page (the index provider's own stay, D31)
    for e, ids in [("index-msci-acwi", {"ETF-19"}), ("index-msci-world", {"ETF-19"}), ("index-nasdaq100", {"ETF-19"}), ("index-sp500", {"ETF-19", "ETF-27", "ETF-30", "BRK-23"})]:
        p, d = load("exposures", e)
        before = list(d["rule_ids"])
        d["rule_ids"] = [x for x in before if x not in ids]
        log.append(f"exposure {e} rule_ids: removed {', '.join(x for x in before if x in ids)}")
        save(p, d)
    print("\n".join(log))


# ---- second pass: the marks no general rule supports any more, and where each property is a company's own (company_terms)
# Run once after the first pass (it asserts the state it expects).
def second_pass():
    out = []
    unmark = {"brokerage-account": ["fee-account"], "child-savings-provident": ["currency"], "money-market-fund-daily": ["eligibility", "fee-account"], "money-market-fund-renewable": ["eligibility", "fee-account"]}
    terms = {
        "brokerage-account": {"eligibility": ["BRK-28"], "minimum": ["BRK-28"], "fee-account": ["BRK-28"], "fee-fx": ["BRK-23"]},
        "money-market-fund-daily": {"eligibility": ["BRK-28"], "fee-account": ["BRK-28"]},
        "money-market-fund-renewable": {"eligibility": ["BRK-28"], "fee-account": ["BRK-28"]},
        "child-savings-bank": {"liquidity-lockup": ["CS-29"]},
        "child-savings-provident": {"currency": ["CS-09"], "fee-management-balance": ["CS-30"], "fee-deposit": ["CS-30"]},
        "ira-provident": {"fee-trade": ["IRA-21"], "fee-custody": ["IRA-21", "IRA-22"], "fee-fx": ["IRA-21", "IRA-22"]},
        "ira-hishtalmut": {"fee-trade": ["IRA-21"], "fee-custody": ["IRA-21", "IRA-22"], "fee-fx": ["IRA-21", "IRA-22"]},
        "keren-hishtalmut": {"eligibility": ["KH-09"]},
        "savings-plan": {"liquidity-lockup": ["BPN-10"]},
    }
    for w in sorted(set(unmark) | set(terms)):
        p, d = load("wrappers", w)
        for dim in unmark.get(w, []):
            assert d["dimensions"].get(dim) == "covered", (w, dim)
            del d["dimensions"][dim]
            out.append(f"{w} dimensions.{dim}: covered mark removed (only a company's term carried it)")
        if w in terms:
            d["company_terms"] = terms[w]
            out.append(f"{w} company_terms: {terms[w]}")
        # keep company_terms right after dimensions, so the record reads in its usual order
        keys = list(d.keys())
        if "company_terms" in keys:
            keys.remove("company_terms")
            keys.insert(keys.index("dimensions") + 1, "company_terms")
            d = {k: d[k] for k in keys}
        save(p, d)
    print("\n".join(out))

import sys
if __name__ == "__main__":
    # run in this order, once each: python3 fix-records.py, then python3 fix-records.py --second
    second_pass() if "--second" in sys.argv else first_pass()
