#!/usr/bin/env python3
"""After expected_calc.py regenerates tests/golden/workings.md, put back the hand-written notes it drops.
Each note is a paragraph in HEAD's generated region that the generator does not write; it goes back after the
'**Expected (as written to scenarios.md):**' line of its scenario. Run from the repository root."""
import re, subprocess
old = subprocess.check_output(['git', 'show', 'HEAD:tests/golden/workings.md'], text=True)
new = open('tests/golden/workings.md', encoding='utf-8').read()
def notes(text):
    out, sid = [], None
    lines = text.split('\n')
    for i, line in enumerate(lines):
        m = re.match(r'### (S\d\d) ', line)
        if m: sid = m.group(1)
        if line.startswith('Note, 20'):
            out.append((sid, line))
    return out
missing = [(sid, line) for sid, line in notes(old) if line not in new]
for sid, line in missing:
    start = new.index(f'### {sid} ')
    exp = new.index('**Expected (as written to scenarios.md):**', start)
    end = new.index('\n', exp)
    new = new[:end + 1] + '\n' + line + '\n' + new[end + 1:]
    print('restored note in', sid)
open('tests/golden/workings.md', 'w', encoding='utf-8').write(new)
