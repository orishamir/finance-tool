"""Print the PDF page numbers (file pages, 1-based) whose text layer contains every given phrase.

usage: python3 -I tools/findpage.py <file.pdf> "<phrase>" ["<phrase>" ...]
Hebrew bidi control characters are removed and whitespace collapsed before matching.
"""
import re
import subprocess
import sys

pdf, phrases = sys.argv[1], sys.argv[2:]
raw = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, check=True).stdout.decode("utf-8", "replace")
pages = raw.split("\f")
norm = lambda s: " ".join(re.sub("[‪-‮⁦-⁩‎‏]", "", s).split())
for i, p in enumerate(pages, 1):
    t = norm(p)
    if all(norm(ph) in t for ph in phrases):
        print(i)
