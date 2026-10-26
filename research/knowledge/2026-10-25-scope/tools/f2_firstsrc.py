#!/usr/bin/env python3
"""F2: for each record of PEN/SW/INS with no Scope line, print the hosts of the links on its Source line, in order."""
import re, sys
sys.path.insert(0, "/home/ori/dev/finance-tool/research/knowledge/2026-10-25-scope/tools")
import rb
b = rb.blocks()
ids = [l.split()[0] for l in open("/dev/stdin")]
for i in ids:
    t = b[i]["text"]
    m = re.search(r"^- Sources?:.*(?:\n(?!- ).*)*", t, re.M)
    s = m.group(0) if m else ""
    hosts = re.findall(r"\]\((?:<)?https?://([^/)\s]+)", s)
    strengths = re.findall(r"·\s*(primary|institution|secondary)", s)
    print(i, "|", ", ".join(hosts), "|", " ".join(strengths))
