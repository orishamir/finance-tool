# Independent recompute (2026-11-07) of the branch's fee figures, apart from the engine: monthly grid, deposit at the start of the month,
# growth (1+r)^(1/12), then the balance fee as a twelfth of the annual rate on the month-end balance (method F-03, F-05, F-07, F-11, F-15,
# F-16, F-61). The study fund's and the pension's gross deposits (the deposit-side relief, F-30 to F-33) are read from the engine's run
# (kh-gross-deposits.json, pension-gross-deposits.json); the fee arithmetic on them is this script's own.  Run: python3 recompute.py
import json, os
here = os.path.dirname(os.path.abspath(__file__))
idx = lambda pi: (lambda m: (1 + pi) ** (m / 12))

def kgl(bal, dep, T=120, r=0.07, pi=0.02, now=10000, monthly=500):
    g = (1 + r) ** (1 / 12) - 1; I = idx(pi); B = basis = 0.0
    for m in range(1, T + 1):
        for amt, j in ([(now, 0)] if m == 1 else []) + [(monthly * I(m), m)]:
            net = amt * (1 - dep(m)); B += net; basis += net / I(j)
        B *= 1 + g; B -= B * bal(m) / 12
    gain = B - basis * I(T)  # linkage on each deposit from its own month is exempt; 25% of the real gain (TXK-05 to TXK-07)
    return (B - 0.25 * max(0, gain)) / I(T)

z = lambda m: 0.0
bal = lambda m: 0.007 if m <= 60 else 0.0105
dep = lambda m: 0.0 if m <= 60 else 0.04
VF = kgl(bal, dep)
print("P-05 Harel: V(F) %.2f, balance fee %.2f, deposit fee %.2f, total %.2f, cut to 0.62%% held 60 months %.2f" % (
    VF, kgl(z, dep) - VF, kgl(bal, z) - VF, kgl(z, z) - VF, kgl(lambda m: 0.0062 if m <= 60 else 0.0105, dep) - VF))

def ledger(deps, bal, depfee, r, pi, B0=0.0):
    g = (1 + r) ** (1 / 12) - 1; B = B0
    for m in range(1, len(deps)):
        B += deps[m] * (1 - depfee(m)); B *= 1 + g; B -= B * bal(m) / 12
    return B / idx(pi)(len(deps) - 1)

kh = json.load(open(os.path.join(here, "kh-gross-deposits.json")))
kh = [0.0] + [kh[0] + kh[1]] + kh[2:]
f = lambda b: ledger(kh, b, z, 0.07, 0.02)
print("Study fund (P-05, 0.6%%): cost %.2f, cut to 0.51%% held 60 months %.2f" % (f(z) - f(lambda m: 0.006), f(lambda m: 0.0051 if m <= 60 else 0.006) - f(lambda m: 0.006)))

pen = json.load(open(os.path.join(here, "pension-gross-deposits.json")))
p = lambda d: ledger(pen, lambda m: 0.003, d, 0.06, 0.025)
print("Pension deposit fee 2%% -> 1%%: whole run %.2f, held 60 months %.2f" % (p(lambda m: 0.01) - p(lambda m: 0.02), p(lambda m: 0.01 if m <= 60 else 0.02) - p(lambda m: 0.02)))

s42 = lambda b, d=0.0011: ledger([0.0] + [1200.0] * 120, lambda m: b(m) + d, z, 0.06, 0.025, 120000.0)
print("S42: cut 0.74%% -> 0.34%% held 60 months %.2f, whole run %.2f" % (s42(lambda m: 0.0034 if m <= 60 else 0.0074) - s42(lambda m: 0.0074), s42(lambda m: 0.0034) - s42(lambda m: 0.0074)))
