"""Print the subject line ("הנדון"/"בנושא") of a PDF's first two pages: python3 -I tools/pdftitle.py <file.pdf>"""
import re, subprocess, sys
t = subprocess.run(["pdftotext", "-l", "2", sys.argv[1], "-"], capture_output=True).stdout.decode("utf-8", "replace")
t = re.sub("[‪-‮⁦-⁩‎‏]", "", t)
lines = [" ".join(l.split()) for l in t.splitlines() if l.strip()]
for i, l in enumerate(lines):
    if re.search("הנדון|בנושא", l):
        print(" ".join(lines[i:i + 2])[:200]); break
else:
    print(" | ".join(lines[:4])[:200])
