#!/usr/bin/env python3
"""f4_hosts.py: print the host and strength of each Source-line segment of the given records (fork F4)."""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rb
b = rb.blocks()
for i in sys.argv[1:]:
    t = b[i]["text"]
    m = re.search(r"^- Sources?:(.*(?:\n(?!- ).*)*)", t, re.M)
    s = m.group(1) if m else ""
    segs = re.findall(r"\]\((https?://[^)\s]+)\)(.*?)(?=\[[^\]]*\]\(https?://|$)", s, re.S)
    out = []
    for u, rest in segs:
        st = re.search(r"·\s*(primary|institution|secondary)", rest)
        out.append("%s:%s" % (u.split('/')[2], st.group(1) if st else "?"))
    print(i, rb.scope_of(t), "|", ", ".join(out))
