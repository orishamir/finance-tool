import json,os
TAX=float(os.environ.get("TAX","0.25"))
D=json.load(open('drag.json'))
def V(now,mon,yrs,r,d,inf=0.02):
    m=yrs*12; g=((1+r)*(1-d/100))**(1/12); i=(1+inf)**(1/12)
    val=0; basis_real=0  # basis indexed to inflation
    for k in range(m+1):
        c = now if k==0 else (mon if k<=m-0 else 0)
        if k==m: c=0
        val=val*(g if k>0 else 1)+c
        basis_real = basis_real*(i if k>0 else 1)+c
    gain=max(0,val-basis_real); tax=TAX*gain
    return (val-tax)/(1+inf)**yrs
plans={'20y7':(6000,400,20,.07),'20y5':(6000,400,20,.05),'10y7':(10000,500,10,.07)}
for f in ['5139696','1201003','1146356','1148899','1147362','1144336','1146570','1143700','1148907','1143783','1146331','1146471','1149020','5122569','1165844']:
    o=D[f]; row=[f,'%.4f->%.4f'%(o['old'],o['new'])]
    for n,p in plans.items():
        a=V(*p,o['old']); b=V(*p,o['new']); row.append('%s %.0f->%.0f (+%.0f)'%(n,a,b,b-a))
    print(*row)
