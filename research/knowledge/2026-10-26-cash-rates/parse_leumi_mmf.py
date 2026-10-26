"""Parse the money-market fund rows of Leumi's 447A page (text layer made by get.sh) into JSON lines.
usage: python3 -I parse_leumi_mmf.py work/leumi-mmp.html.txt > work/leumi-mmf.jsonl"""
import json, re, sys
lines = [l.strip() for l in open(sys.argv[1], encoding="utf-8")]
out, section = [], None
for i, l in enumerate(lines):
    if l in ("קרנות כספיות שקליות", "קרנות כספיות מט\"חיות"):
        section = "shekel" if "שקליות" in l else "fx"
    m = re.match(r"מספר הקרן: (\d+)", l)
    if not m or not section:
        continue
    kind, name = lines[i - 2], lines[i - 1]
    block = []
    for j in range(i + 1, min(i + 12, len(lines))):
        if lines[j].startswith("פרטים נוספים"):
            break
        block.append(lines[j])
    pcts = [b for b in block if re.fullmatch(r"-?\d+(\.\d+)?%", b)]
    fee = pcts[-1] if pcts else None
    expected = pcts[0] if len(pcts) > 1 else None
    out.append({"section": section, "kind": kind, "name": name, "fund": m.group(1), "fee": fee, "expected_net": expected, "cells": block})
for o in out:
    print(json.dumps(o, ensure_ascii=False))
