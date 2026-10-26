#!/usr/bin/env python3
"""Compare the money figures (n,nnn.nn) of a file in git HEAD with the working copy, per scenario section.
Usage: numdiff.py <path relative to repo root> [ref]"""
import re, subprocess, sys, collections
path = sys.argv[1]
ref = sys.argv[2] if len(sys.argv) > 2 else 'HEAD'
root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
old = subprocess.check_output(['git', 'show', f'{ref}:{path}'], text=True, cwd=root)
new = open(f'{root}/{path}', encoding='utf-8').read()
NUM = re.compile(r'(?<![\w/%.-])-?\d{1,3}(?:,\d{3})*\.\d{2}(?![\d])')
def sections(text):
    out = collections.defaultdict(list); sid = 'head'
    for line in text.split('\n'):
        m = re.match(r'### (S\d\d)', line)
        if m: sid = m.group(1)
        line = re.sub(r'\(<[^>]*>\)', '', line)
        line = re.sub(r'https?://\S+', '', line)
        out[sid] += NUM.findall(line)
    return out
a, b = sections(old), sections(new)
changed = False
for sid in sorted(set(a) | set(b)):
    ca, cb = collections.Counter(a[sid]), collections.Counter(b[sid])
    if ca != cb:
        changed = True
        print(sid, 'removed:', sorted((ca - cb).elements()), 'added:', sorted((cb - ca).elements()))
if not changed: print('no figure changed')
