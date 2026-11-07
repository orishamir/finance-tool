# Independent recomputation of the makam guide at Psagot's tariff, written from the method text and the tariff,
# not from the engine. Rules: TXI-11 discount at 15%, TXI-12 sale gain at 15% all real, TXS-06 year's custody off that year's capital gains.
import sys
Y=0.0325; RATE=0.0005; MIN=2.0; CUST=0.0003; EVERY=3
def price(ml): return 100/((1+Y)**(ml/12))
def comm(x): return max(MIN, RATE*x) if x>0 else 0
def buy(cash):
    # trade + max(2, 0.0005 trade) = cash
    t = cash/(1+RATE)
    if RATE*t < MIN: t = cash-MIN
    return t, cash-t
def run(amount, T, custody=True, monthly=0.0, first=1, term=12):
    held=[]  # [face, cost, maturity]
    fees=0; paid=0; disc_tax=0; disc=0
    year_slice={}; year_fees={}
    ty=lambda m:(m-1+first-1)//12+1
    out=None
    for m in range(1,T+1):
        cash=(amount if m==1 else 0)+monthly*(1.02**(m/12))
        paid+=cash
        if cash>0:
            t,c=buy(cash); fees+=c; held.append([t/price(term)*100,t,m+term-1])
        red=[s for s in held if s[2]==m]; held=[s for s in held if s[2]!=m]
        proc=0
        for f,c,_ in red:
            disc+=f-c; disc_tax+=0.15*(f-c); proc+=f-0.15*(f-c)
        if red:
            c=min(proc,comm(sum(s[0] for s in red))); fees+=c; proc-=c
        if m<T and proc>0:
            t,c=buy(proc); fees+=c; held.append([t/price(term)*100,t,m+term]); proc=0
        val=sum(f*price(max(0,mat-m))/100 for f,c,mat in held)
        fee = CUST*val if (custody and m%EVERY==0 and val>0) else 0
        if fee>0:
            k=fee/val; cost=sum(s[1] for s in held)
            year_slice[ty(m)]=year_slice.get(ty(m),0)+k*(val-cost)
            year_fees[ty(m)]=year_fees.get(ty(m),0)+fee
            held=[[f*(1-k),c*(1-k),mat] for f,c,mat in held]; fees+=fee
        if m==T:
            sale=0; cashx=proc
            for f,c,mat in held:
                g=f*price(mat-T)/100; cc=comm(g); fees+=cc; sale+=g-c; cashx+=g-cc
            Ey=ty(T)
            if held:
                base=sale+year_slice.get(Ey,0)-year_fees.get(Ey,0)
                taxx=0.15*max(0,base)
            else:
                base=None; taxx=0
            out=dict(paid=paid,net=cashx-taxx,disc=disc,disc_tax=disc_tax,sale=sale,slices=sum(year_slice.values()),
                     exit_slices=year_slice.get(Ey,0),exit_fees=year_fees.get(Ey,0) if held else 0,base=base,tax=taxx+disc_tax,fees=fees,
                     gain=cashx-taxx+taxx+disc_tax+fees-paid,year_fees=year_fees,year_slice=year_slice)
    return out
if __name__=="__main__":
    for A in (10000,1000000):
        for T in (1,6,11,12):
            o=run(A,T)
            print(A,T,"gain %.2f tax %.2f base %s fees %.2f net %.2f slices %.4f"%(o['gain'],o['tax'],
                 "%.2f"%o['base'] if o['base'] is not None else "disc %.2f"%o['disc'],o['fees'],o['net'],o['slices']))
