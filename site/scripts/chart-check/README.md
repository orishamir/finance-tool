# Chart check

Measures the charts on built pages: labels that overlap, chart text under
13 px (the site's smallest text) or cut off, bars that don't start at the
zero line, more than six colours in one chart, and marks too faint for what
is behind them. It complements looking at the chart; it can't judge whether
a chart means what it should.

```
npm run build            # or QUICK=1 npm run build, without the company pages
npm run chart-check      # every guide page, every index page and the kit page
node site/scripts/chart-check/check.mjs /indices/sp500 /guide/kupat-gemel-lehashkaa
```

It is the last step of `npm run check` and of the CI run, so a broken chart
stops the site from updating. It needs the `playwright` package (a dev
dependency) with its headless Chrome (`npx playwright install --only-shell
chromium`), and `python3` with its standard library only. About 40 s.

Each page is checked at 1440, 390 and 320 px (the phone widths as a touch
phone). Every chart is checked: an `svg` in `main` of at least 200 × 60 px,
and every element in `main` that carries `data-chart` (a chart drawn in
HTML: the cost bars, the pension guides' split bar; a new HTML chart only
needs the attribute). An svg is exported with its computed styles and the
site's fonts and measured by evident-charts' measurer in Playwright's Chrome,
at its own width on the page; its findings come from evident-charts' checks,
run by `checks.py`. An HTML chart is measured on the live page: every text in
it, line by line, and the colours of its marks, which get the same
colour-distance check as an svg's. The zero-line, colour-count and cut-off
checks read the live page for both. The script exits 1 when a chart fails,
or when a page named on the command line has no chart.

What fails:
- `text-overlap`, `text-on-line`, `text-on-area`: a label collides with
  another label, a line, or the edge of a bar or area (in an HTML chart, two
  texts meet).
- `small-text`: chart text under 13 px as shown.
- `text-clipped`: text past the svg's edge or its clip region.
- `text-cut`: text past the edge of an element that clips it (overflow hidden)
  or of the screen; in an HTML chart, also text wider than its box or its
  part, or past the chart's edge.
- `bar-zero`: a bar whose base isn't on the chart's zero line. A step of the
  stairs must start where the step before it ended, and its first column on
  the axis's floor (the axis doesn't begin at zero; the column carries a
  break mark). The parts of a stacked HTML bar must follow each other from
  its start, with at most charts.md's 2 px gap between them.
- `colours`: more than six colours among one chart's data marks (each cost
  bar counts as one chart). Greys and near-whites aren't counted, and a
  lighter or hollow step of a hue is the same colour.
- `cvd`: two series colours a colour-blind reader can't tell apart (red-green
  simulation), with colour the only cue. One colour drawn at two opacities
  (a dimmed year beside the chosen one, as on the study fund's strip) is one
  series, not two: the check compares the colours the marks were given, not
  only the colours as drawn.

What only warns, for a person to look at:
- `contrast`: a line or mark below 3:1 against what is behind it. A light
  edge line on top of its own area (the guide chart's value line) is
  measured against the fill below it and reads fine against the page.
- `cvd`: two colours close under blue-yellow simulation, or told apart by
  something besides colour (dash, mark type, labels).

The kit's chart pieces mark what the checks read: `data-chart` on the root of
an HTML chart, `data-mark` on each data mark (`bar`, `step`, `part`, `line`,
`point`), and `data-zero` on the zero line (the floor of the stairs, the
start of a stacked HTML bar). An svg chart drawn outside the kit gets
the overlap, size and cut-off checks; mark its data marks and zero line to
add the zero-line and colour checks. The kit page's palette sample, which
shows every cost hue at once on purpose, sits in a `data-palette` box that
the colour count leaves alone.

Charts that show only after something is entered (the fees page, the goal
comparison, the cost bar of the person's own account on an index page)
aren't reached.

`vendor/` is evident-charts by Randal S. Olson (MIT, `vendor/LICENSE`),
unchanged, from github.com/rhiever/evident-charts at commit `1dcb88e`
(`skills/evident-charts/scripts` and `assets`). `checks.py` imports its
`check_svg.py` and runs its svg checks on the measurements; Chrome is not
started per chart. Its `--spec` checks need a chart's Plotly or Vega source
and don't run here; the zero-line and colour checks above stand in for them.
