# For each table on a page of a pdftotext -layout file: find the birth-year header line and the row keyed by an age,
# map the row's numbers to the header's years by order, and print the value under a given year.
# A table is a header line with at least 5 four-digit years. The age key is the number that is the row's first or last token.
# usage: python3 -I row.py <file.txt> <page> <age> <year>
import re, sys
t = open(sys.argv[1], encoding="utf-8").read().split("\f")
page, age, year = int(sys.argv[2]), sys.argv[3], sys.argv[4]
lines = [re.sub("[‪-‮]", "", l) for l in t[page - 1].split("\n")]
tables = []
for i, l in enumerate(lines):
    yrs = re.findall(r"\b(19[2-9]\d|20[0-2]\d)\b", l)
    if len(yrs) >= 5 and len(re.findall(r"\d+\.\d+", l)) == 0:
        tables.append((i, yrs))
for k, (i, yrs) in enumerate(tables):
    end = tables[k + 1][0] if k + 1 < len(tables) else len(lines)
    for l in lines[i + 1:end]:
        tok = l.split()
        if not tok: continue
        if tok[-1] == age or tok[0] == age:
            nums = tok[:-1] if tok[-1] == age else tok[1:]
            ok = len(nums) == len(yrs)
            val = nums[yrs.index(year)] if ok and year in yrs else "?"
            print(f"p{page} table {k+1}: header {yrs[0]}..{yrs[-1]} ({len(yrs)}), row {age}: {len(nums)} values, {'aligned' if ok else 'NOT ALIGNED'}; {year} -> {val}")
            break
