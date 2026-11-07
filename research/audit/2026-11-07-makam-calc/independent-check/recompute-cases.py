# Usage: ln -s recompute-makam.py makam.py; python3 -I recompute-cases.py .
import sys; sys.path.insert(0, sys.argv[1])
from makam import run  # recompute-makam.py
for name,kw in [("bank10k6",dict(amount=10000,T=6,custody=False)),("bank1m11",dict(amount=1000000,T=11,custody=False)),
  ("plan18f7",dict(amount=10000,T=18,monthly=1000,first=7)),("plan30f11",dict(amount=0,T=30,monthly=2000,first=11)),
  ("p05",dict(amount=10000,T=120,monthly=500))]:
    o=run(**kw)
    print(name,"net %.4f taxExit %.4f taxDuring %.4f fees %.4f sale %.4f slices %.4f exitSlices %.4f exitFees %.4f base %.4f disc %.4f"%(o['net'],o['tax']-o['disc_tax'],o['disc_tax'],o['fees'],o['sale'],o['slices'],o['exit_slices'],o['exit_fees'],o['base'] or 0,o['disc']))
    # leftover fees by year (fees above the slices' gain in a year with no sale) and that year's discount: TXI-17 offset not taken
    ys=sorted(o['year_fees']); print("  leftover by year:", {y: round(o['year_fees'][y]-o['year_slice'][y],2) for y in ys})
