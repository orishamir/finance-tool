# Variant test, 2026-11-06 01:58 (Israel time)

Page: https://orishamir.github.io/finance-tool/indices/sp500

| | Check | Detail |
|---|---|---|
| pass | pc: control variant is identical to the live page | 10 slices; differing pixels per slice: 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 |
| pass | pc: every kind of change shows after opening | 11 changes |
| pass | pc: the address is the live one | page: השקעה במדד · מדד S&P 500 · מקור / https://orishamir.github.io/finance-tool/indices/sp500 |
| pass | pc: text, number, insert and data show; hidden text is gone | title yes, inserted yes, years line yes, old words no, 71,234 yes, dollar 3.56 yes, hidden note no |
| pass | pc: the screenshot shows the changes | 288878 pixels differ from the live page's first screen |
| pass | pc: after moving a slider (years to 20) the changes still show | years line follows the slider yes, old words no, title yes, inserted yes |
| pass | pc: after typing 750 into a field the changes still show | all showing |
| pass | pc: a changed number comes back when the figure does | 71,234 yes, 70,000 no |
| pass | pc: after moving to another index's page the changes still show | page: השקעה במדד · מדד נאסד"ק 100 · מקור / https://orishamir.github.io/finance-tool/indices/nasdaq100; title yes, inserted yes |
| pass | pc: a session's act.mjs cannot use the lab's commands | Unknown command "?". Commands: open, cli / Unknown command "?". Commands: open, cli / Unknown command "?". Commands: open, cli |
| pass | pc: the example planted variant shows all its changes | same-colour on 11 of 11, jargon on 11 of 11, contradiction on 11 of 11 |
| pass | phone: control variant is identical to the live page | 19 slices; differing pixels per slice: 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 |
| pass | phone: every kind of change shows after opening | 11 changes |
| pass | phone: the address is the live one | page: השקעה במדד · מדד S&P 500 · מקור / https://orishamir.github.io/finance-tool/indices/sp500 |
| pass | phone: text, number, insert and data show; hidden text is gone | title yes, inserted yes, years line yes, old words no, 71,234 yes, dollar 3.56 yes, hidden note no |
| pass | phone: the screenshot shows the changes | 390735 pixels differ from the live page's first screen |
| pass | phone: after moving a slider (years to 20) the changes still show | years line follows the slider yes, old words no, title yes, inserted yes |
| pass | phone: after typing 750 into a field the changes still show | all showing |
| pass | phone: a changed number comes back when the figure does | 71,234 yes, 70,000 no |
| pass | phone: after moving to another index's page the changes still show | page: השקעה במדד · מדד נאסד"ק 100 · מקור / https://orishamir.github.io/finance-tool/indices/nasdaq100; title yes, inserted yes |
| pass | phone: a session's act.mjs cannot use the lab's commands | Unknown command "?". Commands: open, cli / Unknown command "?". Commands: open, cli / Unknown command "?". Commands: open, cli |
| pass | phone: the example planted variant shows all its changes | same-colour on 20 of 20, jargon on 20 of 20, contradiction on 20 of 20 |
| pass | pc: a whole build served locally, at the live address | 26 requests answered by the local build; page: השקעה במדד · מדד S&P 500 · מקור / https://orishamir.github.io/finance-tool/indices/sp500; change on it yes |

All passed.
