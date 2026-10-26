"""Guide records (data/instruments/): drop closed open questions from `open_questions` and `blocked_by`, unblock the dimensions
that only a closed question blocked, and bring the English labels in line (2026-10-26). Closed = status "closed" in
data/open-questions.json. Run from the worktree root; prints every change."""
import glob
import json

closed = {q["id"].replace(" OQ", "-OQ") for q in json.load(open("data/open-questions.json")) if q["status"] == "closed"}

# A dimension blocked only by a closed question, and the cited rule that now carries it (already cited unless named here).
UNBLOCK = {
    ("current-account", "fee-deposit"): None,  # BANK-17 (eligibility) carries it: basic-track cap, BANK OQ9 closed
    ("current-account", "loss-offset"): "TXI-17",
    ("bank-deposit", "loss-offset"): "TXI-17",
    ("savings-plan", "loss-offset"): "TXI-17",
    ("pension-comprehensive", "real-vs-nominal"): None,  # PEN-18 (protection) carries it: CPI-linked target, PEN OQ8 closed
    ("kupat-gemel-lehashkaa", "age-or-use-exemption"): None,  # KGL-09, TXK-10, TXK-06 carry it: 60+ brackets, TXK OQ12 closed
}

LABELS = {
    "blocked: an early withdrawal is taxed at the higher of 35% and the marginal rate, with the taxable base open (F-48, G-06, TXP OQ3)":
        "an early withdrawal is taxed at the higher of 35% and the marginal rate, on the whole amount paid (TXP-18); F-48 is not in the engine yet, so it is not computed (G-06, closed 2026-10-26)",
    "blocked: early withdrawal's taxable base open (TXP OQ3; G-06)":
        "an early withdrawal is taxed at the higher of 35% and the marginal rate, on the whole amount paid (TXP-18); F-48 is not in the engine yet, so it is not computed (G-06, closed 2026-10-26)",
    "per-fund tax track: 2 of 73 money-market funds are taxable (TXS-24); taxable fund computed as 15% of nominal interest at fund level, derived (TXS-11, TXS OQ11)":
        "per-fund tax track: 2 of 73 money-market funds are taxable (TXS-24); taxable fund computed as 15% of nominal interest at fund level, the individual's rate as circular 7/2003 s.2.1.1 says (TXS-11)",
}

for path in sorted(glob.glob("data/instruments/*/*.json")):
    rec = json.load(open(path, encoding="utf8"))
    wid = rec["id"]
    changes = []
    oq = rec.get("open_questions")
    if isinstance(oq, list):
        gone = [q for q in oq if q in closed]
        if gone:
            rec["open_questions"] = [q for q in oq if q not in closed]
            changes.append(f"open_questions -{gone}")
    tax = rec.get("tax_at_exit")
    if isinstance(tax, dict):
        bb = tax.get("blocked_by") or []
        gone = [q for q in bb if q in closed]
        if gone:
            tax["blocked_by"] = [q for q in bb if q not in closed]
            assert tax["blocked_by"], f"{wid}: blocked_by would be empty; the engine's B3 would change"
            changes.append(f"blocked_by -{gone}")
        labels = tax.get("labels") or []
        new = [LABELS.get(l, l) for l in labels]
        if new != labels:
            tax["labels"] = new
            changes.append("labels")
    dims = rec.get("dimensions") or {}
    for dim, mark in list(dims.items()):
        if isinstance(mark, str) and mark.startswith("blocked:") and mark[len("blocked:"):] in closed:
            add = UNBLOCK.get((wid, dim), "missing")
            assert add != "missing", f"{wid}.{dim}: blocked by a closed question with no unblock decided"
            dims[dim] = "covered"
            if add:
                rule_ids = tax_during = rec["tax_during"]["rule_ids"]
                if add not in rule_ids:
                    rule_ids.append(add)
            changes.append(f"{dim}: {mark} -> covered" + (f" (+{add} in tax_during)" if add else ""))
    if changes:
        with open(path, "w", encoding="utf8") as f:
            f.write(json.dumps(rec, ensure_ascii=False, indent=2) + "\n")
        print(path, "; ".join(changes))
