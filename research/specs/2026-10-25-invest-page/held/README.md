# Held price lists (2026-10-25)

Collected and schema-checked, not yet in `data/fees/`, so they don't move results while builders test. Publish each after its open point is settled.

| File | Open point before publishing |
|---|---|
| `meitav-trade@2026-10-25.json` | Two tests assume Meitav Trade's latest snapshot is "missing" (`compare-broker.test.ts:19`, `variants.test.ts:91`); no mutual-fund line, so tracking funds are unpriced there |
| `fair@2026-10-25.json` | Fair's site footer forbids copying without written permission: the founder decides, as with TASE's lists (CAT-43); both fund lines are banded, so a run must name the band |
| `leumi@2026-10-25.json` | Adds the Pepper lines (band "לקוחות PEPPER"); flat 4 ₪ or 4 USD per order needs the engine to read a flat per-order rate; the 30,000 ₪ / 8,000 USD order limit has no field; whether ETFs fall under the TASE line is not printed |
| `blink@2026-10-25.json` | Free trades (10 a month) have no field; which Israeli funds it sells is contradictory (price list vs FAQ); per-share lines need fund share prices |
