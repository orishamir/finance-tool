"""Print the visible text of an HTML file, one block per line, and the links (text -> href) at the end."""
import sys
from html.parser import HTMLParser


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.links, self.skip, self.href, self.atext = [], [], 0, None, []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1
        if tag in ("p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "td", "th"):
            self.out.append("\n")
        if tag == "a":
            self.href = dict(attrs).get("href")
            self.atext = []

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.skip -= 1
        if tag == "a" and self.href:
            self.links.append(("".join(self.atext).strip(), self.href))
            self.href = None

    def handle_data(self, data):
        if self.skip:
            return
        self.out.append(data)
        if self.href is not None:
            self.atext.append(data)


p = P()
p.feed(open(sys.argv[1], encoding="utf-8", errors="replace").read())
text = "".join(p.out)
lines = [" ".join(l.split()) for l in text.splitlines()]
print("\n".join(l for l in lines if l))
print("\n--- links ---")
for t, h in p.links:
    print(f"{t} -> {h}")
