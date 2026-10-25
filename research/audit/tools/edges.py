import sys,subprocess,re
f=sys.argv[1]; pages=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else None
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',f],capture_output=True,text=True).stdout).group(1))
for p in (pages or range(1,n+1)):
    t=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-layout',f,'-'],capture_output=True,text=True).stdout
    L=[re.sub(r'[‎‏‪-‮]','',l).strip() for l in t.splitlines() if l.strip()]
    nums=[re.findall(r'\b\d{2,4}\b',l) for l in (L[:2]+L[-2:])]
    print(p, [re.sub(r'\s+',' ',l)[:70] for l in (L[:1]+L[-1:])], nums)
