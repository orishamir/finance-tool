# Judge check (a copy of the first shots run)

To test the grading by a separate judge session, a copy of the first shots run was scored with `--judge`, after
removing the answer fields from the key and the founder's choice from the case, so that both had to be judged from
words. The sp500 screenshots of that first run were taken before act.mjs waited for the screen to settle: the top card
still showed 72,394 ₪ while the list showed 72,104 ₪. Both readers quoted 72,394; the rule-based score (within 2%)
called it right, the judge called it partly right. The screenshots were retaken settled and the run repeated
(`shots/`), where both readers answered 72,104 ₪. The judge agreed with the rule on the calibration case: both readers
chose א, the founder chose ב.

Scored 2026-11-05 21:25.

| Task | Sessions | Right | Partly | Wrong | Gave up | Confident and wrong | Agree with verdict | Steps | Seconds | Cost |
|---|---|---|---|---|---|---|---|---|---|---|
| custom-index-no-fund | 2 | 0% | 0% | 0% | 0% | 0 | 0% of 2 | 3 (3 to 3) | 21.5 (20 to 23) | $0.13 each |
| sp500-cheapest-shots | 2 | 0% | 100% | 0% | 0% | 0 | - | 2.5 (2 to 3) | 26.5 (25 to 28) | $0.13 each |

## Each session

| Task | Session | Grade | Fields | Confidence | Agrees | Steps | Seconds | Cost | Note |
|---|---|---|---|---|---|---|---|---|---|
| custom-index-no-fund | careful-retiree-pc | n/a |  | unsure | no | 3 | 23 | $0.14 | The reader picked א, but the verdict was ב. They liked א because it still lists what each account costs over 10 years (for example, Leumi at 4,547 ₪ against 1,058 ₪ for the cheapest). They didn't like ב because it only asks them to add a fund they wouldn't know how to choose. |
| custom-index-no-fund | first-job-phone | n/a |  | fairly sure | no | 3 | 20 | $0.13 | The reader picked א, which is what the team recommended. The verdict went with ב. They said א still shows a shekel figure and a list of accounts ranked from cheapest up. By contrast, ב only offers a prompt to add a fund, and they wouldn't know which one to add. |
| sp500-cheapest-shots | careful-retiree-pc | partly |  | fairly sure |  | 2 | 25 | $0.11 | The answer correctly names Psagot (פסגות) as the place. But the amount it gives is 72,394 ₪, and the key expects about 72,100 ₪. 72,394 rounds to about 72,400, not 72,100, so it is probably a different figure rather than a rounding of the right one. That matches the key's "Psagot with another amount" case. |
| sp500-cheapest-shots | first-job-phone | partly |  | fairly sure |  | 3 | 28 | $0.14 | The account is correct: the answer names Psagot (פסגות). The amount is not: the answer gives 72,394 ₪, which rounds to about 72,400 ₪, while the key says about 72,100 ₪. The key states the amount to the nearest hundred, and the answer is off by about 300 ₪. That makes it 'Psagot with another amount', which the key grades as partly right. |
