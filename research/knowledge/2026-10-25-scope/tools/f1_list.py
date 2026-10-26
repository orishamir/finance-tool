#!/usr/bin/env python3
"""f1_list.py: print the review entries of F1's prefixes (PF, KGL, KH, CS, IRA) with the current Scope line."""
import json, sys, rb
b = rb.blocks()
d = json.load(open('../review.json'))
pre = sys.argv[1:] or ['PF', 'KGL', 'KH', 'CS', 'IRA']
for r in d:
    p = r['id'].split('-')[0]
    if p not in pre:
        continue
    sl = rb.scope_of(b[r['id']]['text'])
    inst = ", ".join(x['name'] if isinstance(x, dict) else x for x in (r.get('institutions') or []))
    print("=" * 80)
    print(r['id'], "| current:", sl, "| review:", r['scope'], inst, "| doc_needed:", r.get('company_doc_needed'))
    if r.get('settle'): print("  SETTLE:", r['settle'])
    if r.get('split'): print("  SPLIT:", r['split'])
    if r.get('text_issue'): print("  ISSUE:", r['text_issue'])
    gs = r.get('general_source') or {}
    if gs: print("  GS:", gs.get('url'), "|", gs.get('locator'), "|", (gs.get('quote') or '')[:200])
    print("  NOTE:", r['note'][:600])
