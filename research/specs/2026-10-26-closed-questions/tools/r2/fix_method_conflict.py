import re, pathlib
p = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/docs/method.md')
s = p.read_text()
m = re.search(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n', s, re.S)
head, ours = m.group(1), m.group(2)
main_wd = "the manager withholds: the regulation says 20% (TXK-26), and Harel says it withholds 25%, which is unsettled (TXK-28))"
br_wd = "the manager withholds, at a rate that is not settled: TXK-26)"
assert main_wd in head and br_wd in ours
merged = ours.replace(br_wd, main_wd)
s = s[:m.start()] + merged + "\n" + s[m.end():]
p.write_text(s)
print("ok")
