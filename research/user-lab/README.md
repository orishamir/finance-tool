# The user lab

Started 2026-11-05. The founder: "my goal is for you/subagent/non-bias reviewer to be knowledgeable and smart enough to
be able to think more or less like a human who uses the site would ... train them, keep notes, improve them, whatever
is needed."

The lab runs **simulated users**: separate `claude -p` sessions that know nothing of this project (no CLAUDE.md, memory,
skills, plugins or our terms), each given a persona card and a goal, and either a set of screenshots or a real browser
on the live site. What they did, answered and stumbled on is saved, scored against an answer key or against what the
founder decided on the same screens, and the cards and instructions are improved from the misses.

| Folder or file | What it is |
|---|---|
| `tools/` | The tools below, and `isolation.md`: how a session is kept blind to the project, and the proof |
| `personas/` | Persona cards, one Markdown file each (the whole file is the card; `phone` in the name means a phone) |
| `behaviour-guide.md` | Evidence on how real people read and act on pages; its section 5 is written to go into a card |
| `calibration/` | What the founder decided when shown screens (`cases.jsonl`, its own README) |
| `bench/`, `metric.md`, `learning-loop.md` | The benchmark of problems he flagged, how a reviewer is measured, and how each new flag teaches it |
| `predictions.md` | Sealed guesses of his choices before each decision |
| `runs/` | Outputs of panel runs; `runs/smoke/` and `runs/canary/` are the first ones |

## The tools

All are run from the repository root with Node 22. The command line must be signed in (`claude auth status`). Running
`claude -p` and the browser worked inside the sandbox on 2026-11-05; nothing had to be switched off.

### Panel: `tools/panel.mjs <run.json> <out-folder> [--dry]`

Runs every persona on every task, a few sessions at a time (`parallel`, default 2). A run file:

```json
{
  "personas": ["first-job-phone", "careful-retiree-pc"],
  "tasks": [
    { "key": "sp500-cheapest", "text": "neutral words of the goal", "start": "https://orishamir.github.io/finance-tool/indices/sp500",
      "minutes": 12, "actions": 35,
      "answerFields": { "where": { "type": "string", "description": "..." } },
      "answerKey": { "right": "...", "partly": "...", "fields": { "where": { "match": ["פסגות", "psagot"] } } } },
    { "key": "from-shots", "text": "...", "shots": ["shots-input/a.png", "git:<commit>:path/b.png"] },
    { "case": "custom-index-no-fund", "chosen": "ב", "note": "Ignore any \"מומלץ\" tag on the drawings." }
  ],
  "behaviour": "path/to/instructions.md",
  "parallel": 2, "repeat": 1, "model": "optional", "effort": "optional"
}
```

- **Browser mode** (a task with `start`): the session gets `act.mjs` and a budget of minutes and actions. Its device is
  the persona's (`phone` in the card's file name), or the task's `device`.
- **Shots mode** (a task with `shots`): the screenshots are copied in, numbered in reading order, and the session may
  only read them. A shot can be a path, `git:<commit>:<path>`, or an HTML drawing with its CSS, JS and JSON (rendered at
  1440 px and cut into screen-high slices). `rebuild:` shots are not built by the panel: build and screenshot them first
  (`calibration/extract.mjs` lists them) and pass the pictures as `shots`.
- **Calibration case** (`{ "case": id }`): only the case's question, options and shots reach the session, never its
  verdict, quote or source. Read "Before showing a drawing to a reader" in `calibration/README.md` first: several drawings
  carry a "מומלץ" tag, which `note` can tell the reader to ignore (or mask the picture).
- `behaviour` is a file appended to every persona card (for example section 5 of `behaviour-guide.md`, copied into a
  file of its own); none was used in the smoke runs.
- `findings: true` adds to the report form up to ten things that would bother this person, most bothersome first (the
  shape `metric.md` scores). `note` adds one line after the prompt.
- `--dry` prepares every session (its prompt, and the files it would get, in `given/`) without starting any: free, and
  the way to check what a reader will be shown.

Each session's folder, `<out>/<task>/<persona>/`, holds `prompt.md` (exactly what it was told, and the report form),
`transcript.jsonl` (every event, with image bytes and the account email left out), `report.md` (its answer, report form
and think-aloud), `result.json` (the report form, steps, time, tokens, cost) and, in browser mode, `actions.jsonl` and
`shots/` (every command with its screenshot). The answer key stays in the run file and never reaches a session.

### Browser: `tools/act.mjs`

What a browser-mode session may run, and the only shell command it may run. `node act.mjs open <url> [pc|phone]`,
`click "<visible words>"` or `click <x> <y>`, `fill "<field label>" "<text>"`, `type "<text>"`, `press <key>`,
`scroll <down|up> [px]`, `slider "<label>" <value>`, `back`, `look`, `zoom <x> <y>`. Each answers with a new screenshot
(which the session reads), the page's title and address, how far down it is, and what is clickable on screen with its
position. A computer is 1440 x 900; a phone is 390 x 844 at twice the pixels, with touch (taps, not clicks) and a phone
browser's identity. The first command starts a small background process holding the browser, so the page, its scroll
and the numbers typed persist between commands; the panel closes it after the session. It waits until the screen stops
changing (up to 4 seconds) before each screenshot, as a person would look; without this, the first smoke screenshots
caught a figure mid-update (72,394 ₪ at the top while the list already said 72,104 ₪). It opens only http and https
addresses. Usable by hand too: copy it to an empty folder and run the commands there.

Why not reconnect over CDP for each command: Playwright closes a browser context it created when its connection ends
(tested: the phone context was gone on reconnect), so the phone's size and touch would not survive between commands.

### Score: `tools/score.mjs <run-folder> [--judge] [--model <id>]`

Writes `score.md` and `score.json` in the run folder: per task the share of sessions right, partly right, wrong and gave
up; confident-and-wrong counted apart; steps, seconds and cost (mean, lowest to highest); and, for a calibration case,
agreement with the founder's verdict. Grading is by rule where the key allows (`fields`: `match` for words, `value` with
`tolerance` for numbers; a case's or task's `chosen` for agreement). Otherwise `--judge` asks a separate isolated session
with no tools to grade against the key or the verdict; its grade is kept in the session's `judge.json`.

### Canary: `tools/canary.mjs [out-folder]`

The isolation proof (see `tools/isolation.md`): one session set up exactly like a browser-mode user is asked what it can
see and five questions only our context could answer; another is asked to read outside its folder eleven ways. Passes
only when nothing of the project shows and every attempt is refused. Run it after every Claude Code update.

## The smoke runs (2026-11-05)

`runs/smoke/`. Personas `first-job-phone` and `careful-retiree-pc`, as written by the persona step, with no behaviour
file added.

| Run | Task | Result |
|---|---|---|
| `browser/` | On the live S&P 500 page, where is it cheapest to put 500 ₪ a month, with nothing at the start, and how much after ten years | Both right (Psagot with the Yelin Lapidot fund, 72,104 ₪), both "fairly sure", in 4 and 5 actions |
| `shots/` | The same from three settled screenshots | Both right |
| `shots/` | Calibration case `custom-index-no-fund` | Both chose א; the founder chose ב. **Confounded:** the drawing carries a "מומלץ" tag on א and the run had no note to ignore it |
| `shots-judged-check.md` | The judge path, on a copy with words-only keys | Graded as expected (below) |

What they reported along the way is the kind of thing the lab is for: both had to notice the starting sum of 10,000 ₪
and set it to 0 themselves; both said the top result card gives an amount without naming the account; the 61-year-old
stopped at the fee bars and the red minus figures ("It frightened me and I stopped there"); the 26-year-old doubted
that 72,104 ₪ was right for 60,000 ₪ put in at 7% ("72k felt low").

They are not yet human: both finished in under a minute, scrolled straight to the answer and were right. A careful
61-year-old on a computer would take longer. Making them slower, more distracted and more often wrong where people are
is the behaviour file's and the calibration's job, measured by `metric.md`.

## Measured cost (2026-11-05)

Claude Code reports a list-price dollar figure per session; on the Max plan it is drawn from the plan's usage, not
billed. Model: the plan's default, Opus 5.5, effort default.

| Session | Time | Tokens (cache write / cache read / output) | List price |
|---|---|---|---|
| Browser, 4 to 5 actions on the live site | 42 to 43 s | 10,000 to 13,000 / 92,000 to 99,000 / 2,400 to 2,600 | $0.15 to $0.17 |
| Shots, 3 screenshots | 27 to 33 s | about 6,400 / 22,000 to 23,000 / 2,300 to 2,600 | $0.10 to $0.11 |
| Calibration case, 3 drawings | 20 to 23 s | about 11,500 / about 4,300 / 1,800 to 2,100 | $0.13 to $0.14 |
| Canary, both probes | 12 s and 16 s | 300 to 2,500 / 3,400 to 7,100 / 1,000 to 1,700 | $0.02 and $0.06 |

A browser session grows with its actions: each screenshot stays in the conversation and is read again, from the cache,
on every later turn (about 1,500 to 1,700 tokens a screenshot, by the usual rule of width x height / 750 after the
image is scaled to 1,568 px on its long side). At the 35-action budget a session should come to roughly $0.6 to $1 and
five minutes: an estimate from the measured growth per turn, not a measurement. The `actions` and `minutes` budgets are enforced by act.mjs, which answers "Your
time is up" or "You have used all your actions" and lets the session give its answer; the panel stops a session hard
four minutes after its time.

## What does not work yet

- **The account email reaches every session** (Claude Code adds it from the sign-in; `tools/isolation.md`). It names no
  project, and no smoke session mentioned it; it is removed from everything saved.
- **No hover.** act.mjs has no hover command, by design (the site's ground rules say nothing depends on hover).
- **`rebuild:` calibration shots** need building first; the panel refuses them with that message.
- **Behaviour is not calibrated.** The sessions are much faster and surer than people; see above.
- **The judge** is one more model session; it was checked on four answers only.
