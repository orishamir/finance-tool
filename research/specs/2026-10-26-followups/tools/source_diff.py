#!/usr/bin/env python3
"""Summarise what the source extraction changed in data/rules against HEAD: per record, which source fields changed."""
import json, subprocess, collections, sys
files = subprocess.check_output(['git', 'diff', '--name-only', 'HEAD', '--', 'data/rules'], text=True).split()
fields = collections.Counter(); order = 0; examples = collections.defaultdict(list); other = []
for f in files:
    old = json.loads(subprocess.check_output(['git', 'show', f'HEAD:{f}'], text=True))
    new = json.load(open(f))
    for k in set(old) | set(new):
        if k != 'sources' and old.get(k) != new.get(k): other.append((f, k))
    os_, ns = old.get('sources', []), new.get('sources', [])
    key = lambda s: (s['url'], s.get('locator'))
    if [key(s) for s in os_] != [key(s) for s in ns]:
        if sorted(map(key, os_), key=str) == sorted(map(key, ns), key=str): order += 1; examples['order'].append(f)
        else: examples['set'].append(f)
    om = {key(s): s for s in os_}
    for s in ns:
        o = om.get(key(s))
        if not o: continue
        for k in set(o) | set(s):
            if o.get(k) != s.get(k):
                fields[(k, str(o.get(k))[:40], str(s.get(k))[:60])] += 1
print('records changed:', len(files), '| reordered:', order, '| source set changed:', examples['set'])
print('non-source fields changed:', other)
for (k, a, b), n in fields.most_common(): print(f'{n:4d}  {k}: {a!r} -> {b!r}')
print('reordered:', examples['order'])
