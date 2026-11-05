# Benchmark: what the founder flagged, as screens a reviewer can be run on

2026-11-06. Every problem the founder raised about the site from 24 October to 5 November, turned into a case. A
case is the whole screen as it was live when he wrote, or the drawing he was shown, plus a key that only the
grader sees. A reviewer that runs with no project context is measured by how many keyed problems it raises
unprompted (`../metric.md`).

`cases.jsonl` has 123 cases, one JSON object per line. They cover 121 of the 184 messages and issue comments in
which he flagged something; the other 63 are listed below with the reason they were dropped. Messages about the
same problem are merged into one case, and a message that flags several problems is split into several.

## Fields

| Field | Meaning |
|---|---|
| `id` | Case id. The 25 cases taken over from `../calibration/` keep its ids. |
| `ts` | When he first flagged it (ISO time; a date only for drawings). |
| `page` | The page and state, in words. |
| `url` | The page's address on the live site, or null for a drawing. |
| `surface` | `live` (rebuilt from the commit that was live) or `drawing` (a mockup he was shown). |
| `built_from` | The commit the screens were built from. |
| `shots[]` | Images in reading order: `{path, width, state, part}`. A whole page is cut into tiles (1800 CSS px tall on a computer, 1200 on a phone); `part` says which tile. |
| `device` | Where he saw it: `pc` (122) or `phone` (1). Every live case also has 390 px shots. |
| `reader_note` | For drawings only: a line to give the reviewer, saying the options and any "recommended" mark come from the designers. |
| `split` | `train` or `holdout`. |
| `group` | Cases flagged about the same screen in one sitting; run them as one screen. |
| `flags` | The ids of the raw flags behind the case (`raw/flags.jsonl`, not committed). |
| `key` | For the grader only: `flag` (one neutral sentence), `his_words`, `where`, `category`, `general_or_taste` with `why`, `needs_outside_knowledge`, and `his_crop` (his own cropped screenshot under `key/`, where it showed nothing private). |

## Counts

| Category | Cases | General | Taste | Train | Holdout |
|---|---|---|---|---|---|
| layout | 28 | 19 | 9 | 20 | 8 |
| relevance | 26 | 17 | 9 | 12 | 14 |
| wording | 21 | 17 | 4 | 8 | 13 |
| trust | 15 | 15 | 0 | 8 | 7 |
| missing | 10 | 10 | 0 | 8 | 2 |
| numbers | 8 | 8 | 0 | 6 | 2 |
| chart | 7 | 7 | 0 | 5 | 2 |
| colour | 4 | 4 | 0 | 3 | 1 |
| navigation | 3 | 3 | 0 | 1 | 2 |
| other | 1 | 1 | 0 | 0 | 1 |
| **all** | **123** | **101** | **22** | **71** | **52** |

- **Surface.** 97 live cases and 26 drawings. The shots total 1,411 tiles.
- **General against taste.** "General" means the problem matches a published finding in `../behaviour-guide.md`, or any reader would trip on it. "Taste" means it is his own preference, and a reviewer is not penalised for missing it. `why` gives the reason for each case.
- **Outside knowledge.** Eighteen cases need knowledge that is not on the screen, such as which brokers exist, a fund's real launch date, or what a law says. `needs_outside_knowledge` marks them, so a score can be read with and without them.

## Split

The holdout is every case on a `/guide`, `/tracks` or `/companies` page, and every case flagged on 5 November. This is the same rule as the calibration set's holdout. It makes the holdout new pages and the newest flags, not a random sample of screens the instructions were tuned on.

The holdout is 52 of 123 cases (42 %), a little more than a third. The guide pages carry many flags.

Tune instructions on `train` only. Score `holdout` once per change of instructions.

## How the screens were obtained

1. **The commit that was live.** For each flag, this is the head commit of the newest successful CI run that finished before the flag's time. The CI runs come from `gh run list` and are saved in `raw/ci-runs.json`.
2. **The site at that commit.**
   - 39 commits came from CI's site artifact (kept 14 days, so available from 27 October 13:51).
   - 22 older commits were built locally in a temporary worktree outside the repository (`tools/site-at.sh`, `tools/build-at.sh`).
3. **Serving.** Each site was served under `/finance-tool/` by a small server that behaves like GitHub Pages.
4. **Shooting.**
   - Playwright with Chromium shot each page at 1440 px and 390 px (phone: 390×844, scale 2, touch), after the steps that bring it to the state he described: typing a figure, opening a fold, picking an option or adding a fund (`tools/cases.src.mjs`, `tools/shoot.mjs`).
   - Where the problem is a jump, there are two states: as the page opens and after the change.
5. **His screenshots.**
   - His own screenshot is used only where it shows the whole screen (one case, `home-header-wrap`).
   - A crop is never shown to the reviewer, because it gives the answer away. Crops sit under `key/` for the grader.
6. **Drawings.** Mockups were taken from the commit that held them, or rendered from their HTML at 1440 px and tiled the same way (`tools/drawings.mjs`, `tools/drawings.json`).
7. **Check.** `tools/check.mjs` confirms that every rebuilt screen contains the words of the element he flagged. It runs on the page text saved at shooting time, in `raw/text/`. Every case passes.

## Privacy

The repository is public. Some of his screenshots and messages show his own plan, a friend's name and goal, or figures that could be his own. None of these is used:

- those cases were rebuilt with neutral state (a lump sum of 60,000 for 8 years; a salary of 30,000);
- five crops that might show his figures were left out of `key/`;
- one sum in `his_words` is replaced by `[סכום]`.

The raw extracts (`raw/`: flags, images, CI lists, page text) are ignored by git.

## What counts as his verdict

What he says counts; silence does not (founder, 2026-11-06). A complaint is a flag; "I like it" or "it's fine" means
it. Silence says nothing either way; going along with something, or choosing one of several options, depends on what he
said with it. So:

- A finding that matches no flag is **not** scored wrong. It goes to the noise sample, where he says whether it would
  bother anyone.
- The eight approvals in `raw/endorsements.jsonl` (seven explicit, one tentative: "i do think that this is good no?")
  say only that the reviewer should not flag that very thing; they say nothing about the rest of the screen.
- A case drawn from a choice between drawings says which option he picked; it counts as liking that option only where
  his words say so.

## Running a reviewer on it: avoiding leaks

- Case ids and file names describe the problem. Before showing shots to a reviewer, copy them under neutral names (`screen-01.png`, …).
- Never show `key`, `key/`, `page` or `group` to the reviewer. `page` names the state, and the state can name the problem.
- Give drawings their `reader_note`.
- Run each round of the study drawings (`study-r1-*`, `study-r2-*`, `study-r3-*`) on its own. A later round's drawing sums up the verdict on the round before it.
- Cases in one `group` share a screen. Run the screen once, and score every case of the group against that one review.

## Regenerating

```
cd tools
node make.mjs screens          # cases.src.mjs -> screens.json
node shoot.mjs screens.json    # builds or fetches each commit's site, shoots shots/<id>/
node drawings.mjs              # the drawing cases
node check.mjs                 # the flagged words are on each rebuilt screen
node make.mjs cases            # -> ../cases.jsonl
```

The sites are built under `/home/ori/dev/bench-wt` (about 0.4 GB each) and can be deleted afterwards. Allow at most
two builds at once while browsers run (one build takes about 2 GB of memory).

**The shots are not in git** (246 MB; the repository is public and would carry them forever). They stay on disk in
`shots/`, which git ignores, and the steps above rebuild them from the commits named in `screens.json`.
`shots.sha256` (in git) lists every tile with its checksum: after a rebuild, `sha256sum -c shots.sha256` says which
tiles came out different (a font or a browser update can move a pixel; check those by eye before trusting old scores).

## Dropped flags

- a drawing shown only in the chat; not kept in the repository, so the screen cannot be rebuilt (19): `tr-1022-053`, `tr-1025-139`, `tr-1025-144`, `tr-1025-150`, `tr-1025-152`, `tr-1025-154`, `tr-1025-156`, `tr-1025-157`, `tr-1025-158`, `tr-1025-162`, `tr-1025-169`, `tr-1025-185`, `tr-1025-186`, `tr-1025-188`, `tr-1028-227`, `tr-1028-231`, `tr-1028-232`, `tr-1028-233`, `tr-1028-234`
- said of a sketch shown in the chat (a wish for a better word than 'כלל'); not kept (1): `tr-1024-111`
- a drawing shown only in the chat; not kept in the repository, so the screen cannot be rebuilt; also about speed (1): `tr-1028-228`
- a 'who are you' picker proposed in the chat; the drawing kept for that day does not hold it (1): `tr-1104-495`
- wording proposed in the chat, not a screen (11): `tr-1025-183`, `tr-1102-355`, `tr-1102-356`, `tr-1102-358`, `tr-1102-360`, `tr-1102-361`, `tr-1102-363`, `tr-1102-383`, `tr-1102-384`, `tr-1102-388`, `tr-1102-390`
- no byline was ever in the site's text; he was answering a line proposed in the chat (1): `tr-1024-102`
- a link that does nothing when pressed; a picture cannot show it (1): `tr-1025-180`
- about where a link leads (a web page rather than the law's file); not visible on the screen (1): `tr-1025-196`
- about where source links lead (long files rather than the page); not visible on the screen (1): `gh-19`
- about where a source link leads; not visible on the screen (1): `tr-1103-429`
- the page where he saw the prime-rate notation could not be identified (1): `tr-1026-204`
- motion or speed; a still picture cannot show it (4): `tr-1026-218`, `tr-1031-319`, `tr-1103-445`, `gh-18`
- the whole site's use of wide screens; no single screen (2): `gh-25`, `tr-1103-458`
- a request to collect a kind of track the site does not hold; nothing on a screen (1): `gh-26`
- an expectation about what pressing an account should do; interaction, not visible (1): `tr-1031-309`
- not a complaint: a pointer to which headings to work on (1): `tr-1102-353`
- a request to make two pages alike; no flaw named on either screen (1): `tr-1103-439`
- a question about whether one house is ever a good choice, not about the screen (1): `tr-1104-474`
- a negative figure with a fund he added; it did not appear with the page's default plan, and his own plan's figures are private (1): `tr-1104-501`
- he withdrew it in his next message (1): `tr-1105-546`
- he withdrew it ('for this page it makes sense') (1): `tr-1105-547`
- the screen already gives the reason the question matters; his question was about the reasoning (1): `tr-1105-551`
- a principle about colour; the drawing it answered is not committed yet (1): `tr-1105-567`
- a choice between drawn options with no reason given (1): `tr-1103-417`
- a choice that approves a drawing; no problem named (stays in the calibration set) (1): `idx-r4-linked-lists`
- a choice between drawings; no problem named (stays in the calibration set) (2): `idx-r5-slots`, `custom-index-no-fund`
- a choice of the recommended drawing; no problem named (stays in the calibration set) (1): `hedging-r2-page`
- a choice between drawings; the one he did not like carries no reason (stays in the calibration set) (1): `indices-visuals-every-pair`
- an approval, not a problem (stays in the calibration set) (1): `rows-shared-labels`
- the team's own finding, which he only quoted (stays in the calibration set) (1): `cost-bars-dont-add-up`
