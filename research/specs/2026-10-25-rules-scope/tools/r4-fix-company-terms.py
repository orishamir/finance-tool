# Review round 4: every company_terms entry whose record names more than one company names, explicitly, the companies whose own
# term on that property the record states (each checked against its block in .claude/skills/il-finance/references/*.md).
import json, os
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/data/instruments/wrappers/"
E = lambda rule, *cos: {"rule": rule, "companies": list(cos)}
BRK48 = E("BRK-48", "ibi", "excellence", "altshuler-trade", "psagot")  # the record: the four tariffs add a monthly account fee and a conversion spread
plan = {
  "bank-deposit.json": {
    "real-vs-nominal": [E("BANK-36", "leumi", "yahav", "discount")],      # each quotes linked deposits
    "liquidity-lockup": [E("BANK-37", "leumi", "massad", "yahav")],       # exit points (Leumi, Massad); Yahav's maturity on a business day
    "minimum": [E("BANK-37", "leumi", "yahav", "mercantile")],            # minimums: Leumi, Yahav, Mercantile; Massad has exit points only
  },
  "brokerage-account.json": {
    "minimum": None,  # handled below: add BRK-40 beside BRK-42
    "fee-account": [BRK48],
    "fee-fx": ["BRK-23", BRK48, "BRK-40", "BRK-42"],
  },
  "child-savings-bank.json": {"liquidity-lockup": [E("CS-29", "leumi", "yahav")]},
  "child-savings-provident.json": {
    "fee-management-balance": [E("CS-30", "harel", "altshuler-shaham")],  # Yahav's only term is the shadow account's fee exemption
    "fee-deposit": [E("CS-30", "harel", "altshuler-shaham")],
  },
  "keren-hishtalmut.json": {
    "eligibility": [E("KH-09", "harel", "altshuler-shaham")],
    "fee-management-balance": [E("KH-33", "altshuler-shaham", "harel"), "SW-56"],  # how each deducts and caps it
    "fee-change-over-time": [E("KH-33", "meitav")],                       # only Meitav states it may raise the fee
  },
  "money-market-fund-daily.json": {"fee-account": [BRK48]},
  "money-market-fund-renewable.json": {"fee-account": [BRK48]},
  "savings-plan.json": {
    "liquidity-lockup": ["BPN-10", E("BANK-38", "yahav", "leumi")],      # terms and exit points: Yahav's two-year plan, Leumi's touch savings
    "minimum": [E("BANK-38", "yahav", "leumi")],                          # only Yahav (NIS 200) and Leumi (NIS 10) state minimums
  },
}
for f, dims in plan.items():
    p = root + f
    text = open(p, encoding="utf-8").read()
    w = json.loads(text)
    assert text == json.dumps(w, ensure_ascii=False, indent=2) + "\n", f
    ct = w["company_terms"]
    for dim, refs in dims.items():
        if f == "brokerage-account.json" and dim == "minimum":
            refs = [r for r in ct["minimum"]]
            i = refs.index("BRK-42")
            if "BRK-40" not in refs: refs.insert(i + 1, "BRK-40")
        before = [r if isinstance(r, str) else r["rule"] for r in ct[dim]]
        after = [r if isinstance(r, str) else r["rule"] for r in refs]
        assert before == after or (f == "brokerage-account.json" and dim == "minimum"), (f, dim, before, after)
        ct[dim] = refs
    open(p, "w", encoding="utf-8").write(json.dumps(w, ensure_ascii=False, indent=2) + "\n")
    print("wrote", f)
