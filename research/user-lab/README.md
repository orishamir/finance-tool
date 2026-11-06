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
| (outside the repository) | Cards built from true facts about the real people who will use the site live in `~/finance-tool-private/people/`, and runs that use them write to `~/finance-tool-private/runs/`. Never copy either into this folder, an issue or a commit (founder, 2026-11-06). |
| `behaviour-guide.md` | Evidence on how real people read and act on pages; its section 5 is written to go into a card |
| `calibration/` | What the founder decided when shown screens (`cases.jsonl`, its own README) |
| `bench/`, `metric.md`, `learning-loop.md` | The benchmark of problems he flagged, how a reviewer is measured, and how each new flag teaches it |
| `predictions.md` | Sealed guesses of his choices before each decision |
| `variants/` | Versions of the site with changes the lab chooses, shown to sessions at the live addresses (below) |
| `runs/` | Outputs of panel runs; `runs/smoke/` and `runs/canary/` are the first ones |

## The tools

All are run from the repository root with Node 22. The command line must be signed in (`claude auth status`). Running
`claude -p` and the browser worked inside the sandbox on 2026-11-05; nothing had to be switched off.

### Panel: `tools/panel.mjs <run.json> <out-folder> [--dry] [--variant <id>]`

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
- **Captured page** (a task with `page` and no `shots`): shots mode on the page as it is at run time, captured screen by
  screen on the persona's device (`screen-1.png`, ... top first), after the act.mjs commands in `steps`, for example
  `"steps": [["fill", "סכום היום", "0"]]`. This is the shots step of `tools/shots.mjs`, run per session.
- `--variant <id>` (or `"variant"` on a task, which wins, or on the run file, which comes last) shows the sessions a
  variant of the site instead of the live one (see Variants). It works on browser tasks and captured-page tasks; a task
  with ready-made pictures or a calibration case is refused.

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

**Planted runs** (2026-11-06): when the run's variants are planted instances or clean controls (`tools/planted.mjs run`
writes such a run), `--judge` also writes `planted.md` and `planted.json`. A blind grader (no tools; only the plant's
key and the session's findings) says whether one of the first 10 findings names the planted problem; a plant that never
reached a screenshot is left out. On a control it judges each finding serious or not, and whether it names a problem
planted on another copy of that page (absent there: metric.md's false alarm). Cached in `planted-judge.json`.

### Old brief: `tools/old-brief.mjs <run.json> <out-folder> [--dry] [--parallel n]`

The fresh-reader brief used before the lab (`research/audit/tools/fresh-reader.mjs`: a one-line "who", the goal, seven
numbered questions, free text back, the default system prompt), run on a panel run file's captured-page tasks with the
panel's isolation, for metric.md's "against the usual". Browser tasks are skipped (the old brief only ever had
screenshots). Writes the layout `score.mjs` reads; the grader reads the free text whole.

The panel keeps a session that already answered, so a stopped run restarts with the same command.

### Canary: `tools/canary.mjs [out-folder]`

The isolation proof (see `tools/isolation.md`): one session set up exactly like a browser-mode user is asked what it can
see and five questions only our context could answer; another is asked to read outside its folder eleven ways. Passes
only when nothing of the project shows and every attempt is refused. Run it after every Claude Code update.

### Shots step: `tools/shots.mjs <url> <out-folder> [--device pc|phone] [--variant <id>] [--steps steps.json]`

A page as a person sees it scrolling down, one screenshot per screen, top first (`page-1.png`, ...), through the same
browser a session drives, so the screens match what a browser-mode session would see. `--steps` is a JSON list of
act.mjs commands run first. With `--variant`, `variant-log.json` beside the pictures says on how many screenshots each
change showed; a change that never showed makes the command exit with 3.

## Variants (2026-11-05)

The founder: "it could also be beneficial if you were able to feed reviewers a custom-made arbitrary version of the
site which you determine the changes. that way you can test updates on reviewers, and also you could test the reviewer
themselves because you could inject things the reviewers are supposed to catch and see that they catch them."

A variant is the live site with changes the lab chooses. The session opens the same address, sees the same title and
the same list of what it can click, and has no way to learn that anything was changed. Three uses:

- **Test an update before building it**: the new wording, a moved block, a new colour, put on the live page; or a whole
  branch's build, put at the live address. Run the same personas and task on the variant and on `control`, and compare.
- **Test the reviewer**: plant problems a reader should trip on (the variant's `plants`, each a neutral sentence for the
  grader) and see whether they come up among the first ten findings. This is the "fresh instance made on purpose on
  another screen" that `learning-loop.md` step 5 asks for, and a way to grow the benchmark without waiting for a flag.
- **Prove the machinery changes nothing**: `control` has no change but runs every piece of it; its screenshots are the
  live page's, pixel for pixel.

### The folder

`variants/<id>/variant.json`, and optionally `patch.css` (added to every page of the variant) and `patch.js` (run once
the page is ready, given `variant.locate(spec)` and `variant.onPass(fn)`, where `fn` runs after every re-render):

```json
{
  "id": "plant-fees-look-alike",
  "about": "for the lab only; never reaches a session",
  "purpose": "plant | update | control | test",
  "pages": ["/finance-tool/indices/**"],
  "device": "both | pc | phone",
  "build": "http://127.0.0.1:4173/finance-tool/",
  "plants": [{ "id": "same-colour", "problem": "a neutral sentence for the grader", "where": "...", "kind": "general" }],
  "changes": [ ... ]
}
```

`pages` are path patterns (`*` within one part of the address, `**` across parts); a change may carry its own `pages`
and `device` too. A variant for one device is refused on a session on the other. `build` is optional (below).

### The changes

| `type` | Fields | What it does |
|---|---|---|
| `text` | `find` (words, or `{ "regex", "flags" }`), `replace` (`$1` works with a regex); optional `selector` to limit it | Replaces words in the page's text, and in `placeholder`, `aria-label`, `title` and `alt`. The words must sit in one piece of text (a figure and its ₪ may be separate pieces) |
| `text` | `selector` and/or `text`, `set` | The whole text of the element found becomes `set` |
| `number` | `find` (a number), `replace` (a number) | Finds the number however it is written (`70000` matches `70,000`) and writes the new one the same way. It follows the figure: if a slider moves it away and back, the change comes back |
| `style` | `css` (a stylesheet), or `selector` and `set` (`{ property: value }`) | Restyles |
| `hide` | `selector`, or `text` (the element holding these words, with `closest` or `up` to widen it); `keepSpace` | Hides it (`keepSpace`: leaves its space empty) |
| `insert` | `at` (`{ selector, text, closest, up, nth }`), `position` (`beforebegin`, `afterbegin`, `beforeend`, `afterend`), `html` | Adds HTML; the site's own classes work |
| `move` | `what`, `to` (both found like `at`), `position` | Moves an element |
| `colour` | `tokens` (`{ "--css-variable": "value" }`), or `map` (`{ "from colour": "to colour" }`) with optional `scope`, `props`, `tolerance` | Recolours. A token reaches everything painted with it; a `map` compares what each element is painted with, in pixels, and repaints the matches |
| `chart-colours` | as `colour`; `map` is limited to charts (`svg`) unless `scope` says otherwise | Recolours a chart's series |
| `data` | `url` (part of the address, or `/regex/`), and `set` (`{ "json.path[0].field": value }`) or `file` (a file in the variant's folder) | Changes a data file the page loads, before the page reads it |

Elements are found by `selector` or by the words they show (`text`); found by words, the anchor is looked up after the
variant's own text changes, so anchor on words the variant does not change.

`build` points the whole site at another build: `node research/user-lab/tools/serve-build.mjs <build/client folder>`
serves it as GitHub Pages does, at `http://127.0.0.1:4173/finance-tool/`; every request to the live address is answered
from there, and the address bar still shows the live one. For a branch: build it in a worktree (`npm run build -w site`)
and serve its `site/build/client`.

### How it stays hidden

- The changes are made inside the browser act.mjs and the shots step drive: a script added to every page before the
  site's own (Playwright `addInitScript`), which waits for the site to take over its pre-rendered page (changing text
  before that would make React draw the page again) and then keeps the changes in place with a MutationObserver as the
  site re-renders: after a slider, a typed figure, a click to another page. Its own edits are dropped from what it
  observes, so it never loops. Styles go into a stylesheet adopted by the document, so no element is added for them.
  Data files and whole builds go through network routes.
- The lab's lines in act.mjs sit between `// lab:begin` and `// lab:end`; the copy a session gets has them cut out
  (`lib/session.mjs`, `sessionAct()`, which refuses to install a copy that still says "variant"), and is otherwise the
  same file as before variants existed. With a variant, the panel starts the lab's own act.mjs driver in the session's
  folder before the session; the session's act.mjs finds it running and uses it. The variant's folder and log are
  outside the session's folder, the pictures are named `screen-N.png`, and the prompt does not change.
- The lab's own commands (`__status`, `__has`, `__slices`) answer only a request carrying a key the session never has;
  from a session's act.mjs they answer "Unknown command", as any made-up command does.
- Each session's `variant.jsonl` (in its output folder) records, at every screenshot, how many places each change shows
  on; `result.json` sums it up under `variant`, and the panel prints `NEVER SHOWN` for a change that showed nowhere, so a
  miss is never blamed on the reviewer when the change did not reach the screen.

### The test: `node research/user-lab/tools/variant-test.mjs [out-folder]`

Free (no session), about three minutes, on a computer and on a phone; `runs/variant-test/report.md` is the last run
(2026-11-05: 23 of 23 passed).

| Check | Result |
|---|---|
| `control` against no variant, every screen-high slice of the S&P 500 page | 0 differing pixels on all 10 slices (computer) and all 19 (phone) |
| `selftest` (all eleven changes, every kind) shows after opening, through act.mjs | All shown; 288,878 pixels differ from the live first screen on a computer |
| After moving the years slider to 20 | Still shown; the reworded line follows the slider ("... 20 שנים") |
| After typing 750 into the monthly field | Still shown |
| Back to 500 a month and 10 years | The changed number (70,000 shown as 71,234) is back |
| After clicking to the Nasdaq 100 page (no reload) | Still shown |
| A session's act.mjs asking for `__status`, `__has`, `__slices` | "Unknown command" each time |
| The whole site from this checkout's build, at the live address | 26 requests answered by the local build; address unchanged |
| The example planted variant | All three changes on every screenshot, both devices |

No page error was logged with any variant on. Cost: a `map` recolouring makes the page slower to answer (15 slider steps
took 1.2 s instead of 0.45 s with the eleven-change selftest), unnoticeable at act.mjs's pace; prefer `tokens`.

### The first planted run (2026-11-05)

`runs/variant-plant/`: `plant-fees-look-alike` (two costs drawn in the same colour in the cost bars and legend; the line
under the amount put in rewritten as "קרן + DCA חודשי, 120 תקופות"; a note under the main result, "* הסכום אינו כולל דמי
ניהול", contradicting the line above it), shown to `careful-retiree-pc` once from captured screens and once in the
browser, with findings asked for. Every change showed on every screenshot. Both sessions tripped on "DCA" (the browser
session among its findings, the screens session among words it did not understand); neither flagged the shared colour
or the contradicting note. Neither said anything that suggests it noticed a change. One run each: an illustration of
the method, not a measurement.

Since 2026-11-06 `score.mjs --judge` grades a planted run itself (below, and `runs/planted-baseline/`).

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
