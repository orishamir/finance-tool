"""Print the PDF page (1-based, by form feeds in pdftotext output) of each line matching a pattern.
usage: python3 -I pageof.py <file.txt> <pattern>"""
import re, sys
text = open(sys.argv[1], encoding="utf-8").read()
for n, page in enumerate(text.split("\f"), 1):
    for line in page.splitlines():
        if re.search(sys.argv[2], line):
            print(n, line.strip()[:160])
