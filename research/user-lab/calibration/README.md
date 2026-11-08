# Calibration set: what the founder decided when he saw the site

2026-11-05. Ground truth for one question: does a simulated user judge a screen the way a person does? Each case
is something the founder was shown, kept as he saw it, with his verdict kept apart. There are two kinds:

- **choice**: he was shown two to four drawn options and picked one, rejected all of them, or asked for changes.
- **defect**: he found a problem on a drawing or on the live site that the team had missed.

`cases.jsonl` holds 32 cases, one JSON object per line. `extract.mjs` copies their pictures into plain files.

| | train | holdout | all |
|---|---|---|---|
| choice | 9 | 8 | 17 |
| defect | 11 | 4 | 15 |
| all | 20 | 12 | 32 |

## The fields

| Field | What it holds |
|---|---|
| `id` | A short name, stable once given |
| `date` | The day of his verdict |
| `page` | The page or section, as an address where there is one |
| `kind` | `choice` or `defect` |
| `shots` | What he looked at (formats below) |
| `options` | The options as drawn, in neutral words, with the team's recommendation left out. Empty for most defects |
| `question` | The question he answered, worded as a reader's question |
| `verdict` | What he decided, in plain words. This field also says when the team had recommended a different option, and when he later reversed himself |
| `quote` | His own words, copied exactly from the source. Empty when the repository only paraphrases him. Several quotes are joined with "; " and a cut with "…" |
| `source` | Where the verdict and the quote are written down |
| `split` | `train` or `holdout` |

The first five fields, together with `options` and `question`, are what a reader may be given. **`verdict`, `quote`
and `source` must never reach a simulated user**, and neither may this README.

### Shot formats

- A plain path: a file in the repository as it is today. The shots that were under `research/specs/` read at
  `git:8dd1f013:` since that folder left the tree on 2026-11-08.
- `git:<commit>:<path>`: a file as it was at that commit. The founder saw that version, and the file was later
  replaced or deleted. `node research/user-lab/calibration/extract.mjs <out> [ids]` writes these files out.
- `git:<commit>:<path>.html` with its `.css`, `.js` and `.json` beside it: a drawing that was a working page
  (the stairs sketch, the second round of the track browser). The script puts these files side by side. Open the
  page through a local server and take a screenshot at 1440 px, plus 390 px if wanted.
- `rebuild:<commit>:<route>`: no picture of the screen survives. Build the site at that commit in a worktree, open the
  route and take a screenshot at 1440 px. Each of these commits is the parent of the commit that fixed the defect, so
  it shows the screen as it was when he reported it. The words after the route say what state to set up, for example
  a saved goal, or which chip to press. The script lists these screens in `rebuild.txt`; it does not build them.

### Before showing a drawing to a reader

The drawings were made for the founder, not for readers, and several of them carry the team's own words:

- A tag "מומלץ" or "(recommended)" on one option: seen in `custom-index-no-fund`, `indices-visuals-every-pair`,
  `study-r1-coins`, `study-r2-employee-compare`, `tracks-r1-returns` and `tracks-r2-companies`; check the other
  drawings before a run. Mask the tag, or tell the reader to ignore it.
- Titles and notes that judge the options: the hedged-funds sheet is titled "מה מטעה, ומה אפשר להראות במקום". The
  second study-fund round opens by summing up the founder's verdict on the first ("מה היה: … וטבלה שצריך כדי לפענח
  את הצבעים"), so never show it in the same run as `study-r1-coins`. The custom-index sheet ends with "מה לא הוצע".
- Option letters and short descriptions in Hebrew above each option. These may stay: the founder saw them, and a
  reader needs to know which option is which.

## How the cases were chosen

The cases were mined from `8dd1f013:research/2026-10-28-founder-patterns.md`, the decisions and their reasons in
`docs/product.md` (D25 to D61), the specs under `research/specs/` with their notes, briefs and drawings, the audits
under `research/audit/`, the dated amendments in `docs/`, the git log (every commit body that names the founder), and
GitHub issue #33, which is his own text. Each case was kept only when all of these hold:

1. **What he saw still exists**: in the repository today, in an older commit, or as a commit the screen can be
   rebuilt from. A verdict on a drawing that lived only in the chat was left out.
2. **His verdict is written down**, in his words or in a close paraphrase by the team, with a source.
3. **It is about understanding or need, not taste.** Preferred: a column nobody can use, a word read wrongly,
   colours that look alike, numbers that do not agree, a control that changes nothing, a section that answers
   nothing, a comparison that is not a real choice. Pure layout or look (a link "placed weird", a callout's frame, a
   misaligned field) was left out.
4. **One verdict per case.** A design round with several remarks is one case. A later remark on a new version is a
   new case only when it is about a different thing.

Strongest signal: the cases where he went against the team's recommendation (`cfc-exposure`, `study-r1-coins`,
`custom-index-no-fund`, `tracks-r1-returns`, `tracks-r2-companies`, `hedging-r1-steady-dollar`, and the plan strip
in `indices-visuals-every-pair`), the rounds he turned down whole (`idx-r3-pricing`, `indices-r2-gap-bars`), and the
defects nobody on the team had seen.

## The holdout

The holdout is chosen **by page and by date**, as `../metric.md` asks, so that tuning on one round cannot leak into a
held-out round of the same drawing:

- the study-fund guide (both rounds);
- the track browser (both rounds and the sort defect);
- the company pages (the fund table's two rounds and the kind filter);
- the guide home and the current-account guide (issue #33);
- the indices page of 5 November (every-pair chart, shared labels, the fund list's columns).

Every other case is on the indices page before 5 November, the home page, the fees page or the rules page, and is in
train. Do not tune any instruction, persona or prompt on a holdout case, and do not read its verdict while you tune.

## How to read the verdicts

- **One person's verdicts.** He is the main user and the owner. Some verdicts mix a reader's need with an owner's
  aim: for example `study-r2-employee-compare` (a comparison that is not a real choice) and `fund-list-past-gap-column`.
  Others are owner's rules more than a reader's experience; those were left out.
- **He changes his mind after seeing the result.** On 27 October he kept labels on every row; on 5 November, seeing
  them drawn, he took them off (`rows-shared-labels`). He picked hedging option A on 29 October; two days later the
  team found it misleading and it was replaced (`hedging-r2-page`). On the stairs sketch he called a row's bar
  "forced" and, six minutes later, asked to keep the bars and fix their colour; only the second, the clearer
  verdict, is a case (`stairs-gain-loss-same`). A simulated user that disagrees with a verdict may still be right.
  Count agreement, and read the disagreements.
- **"Choice" scoring needs care.** A reader can agree with the pick for another reason. Score the pick, the options
  rejected, and whether the reader names the same reason (the `verdict` sentence). Score defects by whether the
  defect is among the reader's first findings, as `../metric.md` does.

## Left out, and why

| What | Why |
|---|---|
| The securities-account guide's three sketches (25 Oct: "thats not gonna make me switch banks", "what are the green circles", "its just trying to distill tons of information…") | Strong verdicts, but the sketches lived in the chat and are not in the repository |
| The current-account chart "very specific to leumi and one specific user's case" (25 Oct) | The sketch is not in the repository |
| The money-market ladder and the four access-tag drawings (26 Oct) | Not kept; the before-and-after screenshots were in commit f6f8835, which is not in this clone |
| "A third box that reads like a third option" (25 Oct) | No drawing kept |
| The hedged section's step-by-step table (31 Oct, `git:488abea`) | Only a paraphrase ("unintuitive"); noted inside `hedged-what-happened` |
| The stairs "forced bar" remark (1 Nov) | He reversed it within minutes (above) |
| The colour table (5 Nov: "i'd rather have two conflicting colors on opposite sites of the pages than a graph with all its lines the same color") | It is not clear which drawing the remark answered, and the second round is not committed yet. Add it once it is |
| The own-terms panel, option א (4 Nov) | He agreed with the recommendation and gave no reason: little signal. Its follow-up defect is a case (`own-terms-line-every-row`) |
| The rules-page sketches (1 Nov) | He chose the second sketch; no reason written down |
| The 5 November decision audit's verdicts | He accepted recommendations built from fresh readers' reports; using them would grade readers against readers |
| The Maya link "placed weird", the callout frame, the header search, a misaligned field, the "לא מצאתם שם?" search | Layout taste, not understanding |
| "The page is still jumping" and the other moving-layout reports | Motion cannot be judged from a still picture; scripted checks cover it (CLAUDE.md "Nothing moves") |
| Scope, data and process decisions (which companies to drop, which pages to remove or hold, PEPPER, Fair, agents, budgets) | Not a reader's judgement of what is on the screen, or tied to his own accounts |
| The label proposals of 27 October (spec section 2.2) | A list of names with no drawing |

**Privacy.** Nothing from the founder's mail or his own money is here. Where a source quotes his own plan or a
friend's goal (the 67,000 ₪ case), the case leaves the figures out: the fee-chart case asks for any saved goal.

## Related files

- `../bench/cases.jsonl`, built separately, holds every problem he flagged, for the catch-rate metric. Some defects
  here are the same problems. When both sets are used together, match them by page and date, and never let a case
  that is held out in one set be used for training through the other.
- `tools/fresh-reader.mjs` runs a reader on a list of files; `extract.mjs` produces those files.
