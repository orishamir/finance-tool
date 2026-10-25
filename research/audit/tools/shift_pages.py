"""shift_pages.py --url SUBSTR [--alias REGEX] --offset N [--write]
Shifts printed page numbers to file pages inside the segments of `- Source:` lines that cite one document.
A segment runs from the link (or an alias mention) to the next '·' (or the next link). Prints every change."""
import re,sys,glob,argparse
ap=argparse.ArgumentParser(); ap.add_argument('--url',required=True); ap.add_argument('--alias',action='append',default=[]); ap.add_argument('--offset',type=int,required=True); ap.add_argument('--write',action='store_true'); ap.add_argument('--files',default='.claude/skills/il-finance/references/*.md')
a=ap.parse_args()
NUM_LIST=r'(\d+)((?:\s*(?:,|–|-|to|and)\s*\d+(?![\d(.]|\s*[A-Za-zא-ת(]{1,2}\)|[A-Za-zא-ת]))*)'
PAGE_TOK=re.compile(r'(?:(printed|PDF)\s+)?(pp?\.)\s*'+NUM_LIST)
def shift_seg(seg):
    def rep(m):
        kind,pp,first,rest=m.group(1),m.group(2),m.group(3),m.group(4) or ''
        if kind=='PDF': return f"{pp}{first}{rest}"
        s=re.sub(r'\d+',lambda x:str(int(x.group())+a.offset),first+rest)
        return f"{pp}{s}"
    return PAGE_TOK.sub(rep,seg)
link_re=re.compile(r'\[((?:[^\[\]]|\[[^\[\]]*\])*)\]\((<[^>]*>|[^()\s]*(?:\([^()]*\)[^()\s]*)*)\)')
changes=0
for f in sorted(glob.glob(a.files)):
    lines=open(f,encoding='utf8').read().split('\n'); out=[]
    for ln,line in enumerate(lines):
        if not line.lstrip().startswith('- Source'):
            out.append(line); continue
        starts=[]
        links=list(link_re.finditer(line))
        for m in links:
            if a.url in m.group(2): starts.append(m.start())
        for al in a.alias:
            for m in re.finditer(al,line):
                if not any(l.start()<=m.start()<l.end() for l in links): starts.append(m.start())
        if not starts: out.append(line); continue
        new=line; offset=0
        for st in sorted(starts):
            # end: next '·' after the link end, or next link start
            lend=next((l.end() for l in links if l.start()==st), st)
            nxt=[l.start() for l in links if l.start()>st]
            dot=line.find('·',lend)
            end=min([x for x in [dot if dot>=0 else len(line)]+nxt])
            seg=line[st:end]; ns=shift_seg(seg)
            if ns!=seg:
                new=new[:st+offset]+ns+new[end+offset:]; offset+=len(ns)-len(seg)
        if new!=line:
            changes+=1
            print(f"--- {f.split('/')[-1]}:{ln+1}")
            # show only the differing region
            import difflib
            sm=difflib.SequenceMatcher(None,line,new)
            for op,i1,i2,j1,j2 in sm.get_opcodes():
                if op!='equal': print(f"   {line[max(0,i1-40):i2+10]!r}\n=> {new[max(0,j1-40):j2+10]!r}")
        out.append(new)
    if a.write: open(f,'w',encoding='utf8').write('\n'.join(out))
print('lines changed',changes)
